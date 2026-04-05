from fastapi import FastAPI

from app.routers import auth , records, organizations


app = FastAPI(
    title="Finance Dashboard API",
    description="Backend for financial records and analytics",
    version="1.0.0"
)

app.include_router(auth.router)
app.include_router(records.router)
app.include_router(organizations.router)

@app.get("/")
def health_check():
    return {"status": "ok"}