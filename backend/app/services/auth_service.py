from datetime import datetime, timedelta, timezone

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


def register_user(db: Session, email: str, password: str, name: str) -> User:
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
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return None

    if not verify_password(password, user.password_hash):
        return None

    return user


def create_tokens(db: Session, user: User) -> tuple[str, str]:
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

    return access_token, refresh_token