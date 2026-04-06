import os 
from dotenv import load_dotenv

load_dotenv()


class Settings:
    """Application settings loaded from environment variables."""

    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development").lower()
    DATABASE_URL: str = os.getenv("DATABASE_URL")
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY") or os.getenv("JWT_SECRET")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = int(
        os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES")
        or os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 10)
    )
    JWT_REFRESH_TOKEN_EXPIRE_HOURS: int = int(
        os.getenv("JWT_REFRESH_TOKEN_EXPIRE_HOURS")
        or os.getenv("REFRESH_TOKEN_EXPIRE_HOURS", 48)
    )
    CORS_ORIGINS: list = [
        origin.strip()
        for origin in os.getenv("CORS_ORIGINS", "").split(",")
        if origin.strip()
    ]

    COOKIE_SECURE: bool = os.getenv("COOKIE_SECURE", "").lower() in {"1", "true", "yes"}
    COOKIE_SAMESITE: str = os.getenv("COOKIE_SAMESITE", "").lower() or (
        "none" if ENVIRONMENT == "production" else "lax"
    )


settings = Settings()