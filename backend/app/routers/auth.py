"""
Authentication Router

HTTP endpoints for user registration and login.

Operations:
- POST /auth/register: Create new user account
- POST /auth/login: Authenticate and receive JWT tokens

Tokens are JWT signed with JWT_SECRET_KEY.
Access tokens used for API requests. Refresh tokens used to obtain new access tokens.
"""

import logging

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    TokenResponse,
    RefreshRequest,
    LogoutRequest,
)
from app.services.auth_service import (
    register_user,
    authenticate_user,
    create_tokens,
    refresh_access_token,
    revoke_refresh_token,
)
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["auth"])
logger = logging.getLogger(__name__)


@router.post("/register")
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    """
    Register a new user account.

    Creates user with email, password, and name.
    Password is hashed before storage. Email must be unique.

    Args:
        data: RegisterRequest with email, password, name
        db: Database session

    Returns:
        dict with success message and user_id

    Raises:
        HTTPException 400: if email already taken
    """

    try:
        # Email unique verify karte hain, agar duplicate hai to ValueError raise hota hai
        user = register_user(db, data.email, data.password, data.name)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return {"message": "user created", "user_id": str(user.id)}


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, response: Response, db: Session = Depends(get_db)):
    """
    Authenticate user and receive JWT tokens.

    Validates email/password combination and returns access token + refresh token.
    Access token used for subsequent API requests in Authorization header.
    Refresh token stored as HttpOnly cookie for security.

    Args:
        data: LoginRequest with email and password
        db: Database session
        response: Response object to set cookie

    Returns:
        TokenResponse with access_token (refresh_token omitted from response)

    Raises:
        HTTPException 401: if invalid email or password
    """

    # Email and password verify karte hain
    user = authenticate_user(db, data.email, data.password)

    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # JWT tokens generate karte hain (access + refresh)
    access_token, refresh_token = create_tokens(db, user)

    # Set refresh token as HttpOnly cookie
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        max_age=86400 * 2,  # 2 days
        httponly=True,
        secure=settings.COOKIE_SECURE or settings.ENVIRONMENT == "production",
        samesite=settings.COOKIE_SAMESITE,
    )

    logger.info("User logged in: %s", user.email)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token  # Still return for backwards compatibility, but client ignores it
    }


@router.post("/refresh", response_model=TokenResponse)
def refresh_tokens(
    data: RefreshRequest | None = None,
    *,
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):
    """
    Refresh access token using refresh token from HttpOnly cookie.

    Validates refresh token, generates new token pair, and sets new refresh token cookie.

    Args:
        data: RefreshRequest (may contain refresh_token for backwards compatibility)
        db: Database session
        response: Response object to set new cookie

    Returns:
        TokenResponse with new access_token

    Raises:
        HTTPException 401: if refresh token is invalid or expired
    """
    logger.info("Refresh token request received")
    print("[DIAG] Refresh token request received")
    refresh_token = (data.refresh_token if data and data.refresh_token else None) or (
        request.cookies.get("refresh_token") if request else None
    )

    print("[DIAG] Refresh token present in request/cookie:", bool(refresh_token))

    if not refresh_token:
        print("[DIAG] Refresh token missing")
        raise HTTPException(status_code=401, detail="Missing refresh token")

    result = refresh_access_token(db, refresh_token)

    if not result:
        print("[DIAG] Refresh token validation failed")
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    print("[DIAG] Refresh token validated successfully")

    access_token, refresh_token = result

    # Set new refresh token as HttpOnly cookie
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        max_age=86400 * 2,  # 2 days
        httponly=True,
        secure=settings.COOKIE_SECURE or settings.ENVIRONMENT == "production",
        samesite=settings.COOKIE_SAMESITE,
    )

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,  # Still return for backwards compatibility
    }


@router.post("/logout")
def logout(
    data: LogoutRequest | None = None,
    *,
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):
    """
    Logout user by revoking refresh token and clearing cookie.

    Args:
        data: LogoutRequest with refresh_token
        db: Database session
        response: Response object to clear cookie

    Returns:
        dict with success message
    """
    logger.info("Logout request received")
    refresh_token = (data.refresh_token if data and data.refresh_token else None) or (
        request.cookies.get("refresh_token") if request else None
    )

    if refresh_token:
        revoke_refresh_token(db, refresh_token)

    # Clear the refresh token cookie
    response.delete_cookie(
        key="refresh_token",
        httponly=True,
        secure=settings.COOKIE_SECURE or settings.ENVIRONMENT == "production",
        samesite=settings.COOKIE_SAMESITE,
    )

    return {"message": "logged out"}
