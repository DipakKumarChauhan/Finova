from fastapi import FastAPI

from app.routers import auth, records, organizations, membership, invites, notifications, dashboard


app = FastAPI(
    title="Finance Dashboard API",
    description="Backend for financial records and analytics",
    version="1.0.0"
)

app.include_router(auth.router)
app.include_router(records.router)
app.include_router(organizations.router)
app.include_router(membership.router)
app.include_router(invites.router)
app.include_router(notifications.router)
app.include_router(dashboard.router)

@app.get("/")
def health_check():
    return {"status": "ok"}