"""
Authentication Dependency

Handles JWT token extraction, validation, and user loading.
Provides the authenticated user object to protected routes via
FastAPI's dependency injection system.
"""

from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from jose.exceptions import ExpiredSignatureError
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.config import settings
from app.models.user import User

# HTTPBearer extracts token from Authorization: Bearer <token> header
security = HTTPBearer()

ALGORITHM = settings.JWT_ALGORITHM


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """
    Extract and validate JWT token, return authenticated user.

    Expects Authorization header with format: Bearer <token>
    Validates JWT signature and loads user from database.

    Args:
        credentials: HTTP Bearer token from request header
        db: Database session for user lookup

    Returns:
        User object from database if token is valid

    Raises:
        HTTPException 401: if token is invalid or user not found
    """

    token = credentials.credentials
    print("[DIAG] Validating access token")
    print("[DIAG] Authorization bearer token present:", bool(token))

    try:
        # Decode JWT using secret key and algorithm from settings
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[ALGORITHM])
        # Support both token formats during transition: 'sub' (standard) or 'user_id'
        user_id = payload.get("sub") or payload.get("user_id")

        print("[DIAG] Access token decoded successfully")
        print("[DIAG] Access token subject/user_id:", user_id)

        if user_id is None:
            print("[DIAG] Access token missing subject/user_id")
            raise HTTPException(status_code=401, detail="Invalid token")

    except ExpiredSignatureError:
        print("[DIAG] Token expired")
        raise HTTPException(status_code=401, detail="Token expired")
    except JWTError:
        # Token validation failed (expired, signature invalid, malformed, etc.)
        print("[DIAG] Access token validation failed with JWTError")
        raise HTTPException(status_code=401, detail="Invalid token")

    # Load user from database to verify they still exist
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        # User was deleted or never existed
        print("[DIAG] User not found for token subject")
        raise HTTPException(status_code=401, detail="User not found")

    print("[DIAG] Auth dependency resolved user:", user.email)

    return user