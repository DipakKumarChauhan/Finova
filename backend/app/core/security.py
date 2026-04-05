from datetime import datetime, timedelta
from jose import jwt
from passlib.context import CryptContext
import secrets
import hashlib

from app.core.config import settings

# Use pbkdf2_sha256 for new hashes to avoid bcrypt backend incompatibilities
# and bcrypt's 72-byte input limit; keep bcrypt for backwards compatibility.
pwd_context = CryptContext(schemes=["pbkdf2_sha256", "bcrypt"], deprecated="auto")

ALGORITHM = settings.JWT_ALGORITHM


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    return pwd_context.verify(password, hashed_password)


def create_access_token(data: dict):

    to_encode = data.copy()

    expire = datetime.utcnow() + timedelta(
        minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(
        to_encode,
        settings.JWT_SECRET_KEY,
        algorithm=ALGORITHM
    )

    return encoded_jwt


def generate_refresh_token():

    token = secrets.token_urlsafe(64)

    token_hash = hashlib.sha256(token.encode()).hexdigest()

    return token, token_hash