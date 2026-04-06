"""
Authentication Router

HTTP endpoints for user registration and login.

Operations:
- POST /auth/register: Create new user account
- POST /auth/login: Authenticate and receive JWT tokens

Tokens are JWT signed with JWT_SECRET_KEY.
Access tokens used for API requests. Refresh tokens used to obtain new access tokens.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse
from app.services.auth_service import register_user, authenticate_user, create_tokens

router = APIRouter(prefix="/auth", tags=["auth"])


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
def login(data: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate user and receive JWT tokens.

    Validates email/password combination and returns access + refresh tokens.
    Access token used for subsequent API requests in Authorization header.
    Refresh token used to obtain new access token when expired.

    Args:
        data: LoginRequest with email and password
        db: Database session

    Returns:
        TokenResponse with access_token and refresh_token

    Raises:
        HTTPException 401: if invalid email or password
    """

    # Email and password verify karte hain
    user = authenticate_user(db, data.email, data.password)

    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # JWT tokens generate karte hain (access + refresh)
    access_token, refresh_token = create_tokens(db, user)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token
    }
