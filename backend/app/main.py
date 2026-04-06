from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import auth, records, organizations, membership, invites, notifications, dashboard, categories
from app.core.config import settings


app = FastAPI(
    title="Finance Dashboard API",
    description="Backend for financial records and analytics",
    version="1.0.0"
)

default_origins = [
    "https://finova-48i8.vercel.app",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
allowed_origins = settings.CORS_ORIGINS or default_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(records.router)
app.include_router(organizations.router)
app.include_router(membership.router)
app.include_router(invites.router)
app.include_router(notifications.router)
app.include_router(dashboard.router)
app.include_router(categories.router)

@app.get("/")
def health_check():
    return {"status": "ok"}