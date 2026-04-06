"""
Authentication Service

Handles user registration, authentication, and JWT token management.

Functions:
- register_user: Create new user account with email and password
- authenticate_user: Validate email/password and return user if valid
- create_tokens: Generate JWT access and refresh tokens for user

Passwords are hashed using bcrypt. JWTs are signed using JWT_SECRET_KEY.
Refresh tokens are stored in database and tracked for revocation.
"""

from datetime import datetime, timedelta, timezone
import hashlib
import logging

from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import (
    create_access_token,
    generate_refresh_token,
    hash_password,
    verify_password,
)
from app.models.refresh_token import RefreshToken
from app.models.user import User


logger = logging.getLogger(__name__)


def register_user(db: Session, email: str, password: str, name: str) -> User:
    """
    Create a new user account.

    Validates email is unique, hashes password, and stores user in database.

    Args:
        db: Database session
        email: User's email address (must be unique)
        password: User's plain-text password (will be hashed)
        name: User's full name

    Returns:
        User object with generated UUID

    Raises:
        ValueError: if email already registered
    """

    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise ValueError("Email already registered")

    user = User(
        email=email,
        name=name,
        password_hash=hash_password(password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, password: str) -> User | None:
    """
    Validate email/password combination and return user.

    Looks up user by email and verifies password hash.

    Args:
        db: Database session
        email: User's email address
        password: Plain-text password to verify

    Returns:
        User object if valid; None if email not found or password incorrect
    """

    user = db.query(User).filter(User.email == email).first()
    if not user:
        return None

    if not verify_password(password, user.password_hash):
        return None

    return user


def create_tokens(db: Session, user: User) -> tuple[str, str]:
    """
    Generate JWT access and refresh tokens for user.

    Creates a short-lived access token and long-lived refresh token.
    Refresh token hash is stored in database for revocation tracking.

    Args:
        db: Database session
        user: User object to create tokens for

    Returns:
        tuple[str, str] of (access_token, refresh_token)
    """

    access_token = create_access_token(
        {
            "sub": str(user.id),
            "email": user.email,
        }
    )

    refresh_token, token_hash = generate_refresh_token()

    refresh_token_obj = RefreshToken(
        user_id=user.id,
        token_hash=token_hash,
        expires_at=datetime.now(timezone.utc)
        + timedelta(hours=settings.JWT_REFRESH_TOKEN_EXPIRE_HOURS),
        revoked=False,
    )
    db.add(refresh_token_obj)
    db.commit()

    logger.info("Created refresh token for user %s", user.id)

    return access_token, refresh_token


def _hash_refresh_token(refresh_token: str) -> str:
    return hashlib.sha256(refresh_token.encode()).hexdigest()


def validate_refresh_token(db: Session, refresh_token: str) -> RefreshToken | None:
    token_hash = _hash_refresh_token(refresh_token)
    token = (
        db.query(RefreshToken)
        .filter(RefreshToken.token_hash == token_hash)
        .first()
    )

    if not token:
        logger.warning("Refresh token validation failed: token not found")
        return None

    if token.revoked:
        logger.warning("Refresh token validation failed: token revoked for user %s", token.user_id)
        return None

    now = datetime.now(timezone.utc)
    if token.expires_at <= now:
        logger.warning("Refresh token validation failed: token expired for user %s", token.user_id)
        return None

    logger.info("Refresh token validated for user %s", token.user_id)
    return token


def refresh_access_token(db: Session, refresh_token: str) -> tuple[str, str] | None:
    token_record = validate_refresh_token(db, refresh_token)
    if not token_record:
        return None

    token_record.revoked = True
    db.add(token_record)

    user = db.query(User).filter(User.id == token_record.user_id).first()
    if not user:
        logger.warning("Refresh token lookup failed: user not found for token %s", token_record.id)
        db.commit()
        return None

    access_token, next_refresh_token = create_tokens(db, user)
    db.commit()

    logger.info("Rotated refresh token for user %s", user.id)
    return access_token, next_refresh_token


def revoke_refresh_token(db: Session, refresh_token: str) -> bool:
    token_hash = _hash_refresh_token(refresh_token)
    token_record = (
        db.query(RefreshToken)
        .filter(RefreshToken.token_hash == token_hash)
        .first()
    )

    if not token_record:
        logger.warning("Logout attempted with unknown refresh token")
        return False

    if token_record.revoked:
        logger.info("Logout attempted with already revoked refresh token for user %s", token_record.user_id)
        return True

    token_record.revoked = True
    db.add(token_record)
    db.commit()
    logger.info("Revoked refresh token for user %s", token_record.user_id)
    return True
