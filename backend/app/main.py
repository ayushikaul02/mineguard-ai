import os
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from .config import settings
from .database import engine, Base, get_db
from .seed_data import seed_database
from .routes import (
    auth_router,
    dashboard_router,
    mines_router,
    compliance_router,
    inspections_router,
    violations_router,
    corrective_actions_router,
    ai_router,
    contractors_router,
    grievances_router,
    documents_router,
    audit_router,
    reports_router
)

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=f"{settings.PROJECT_SUBTITLE} — Academic Patent Implementation Prototype",
    version="1.0.0"
)

# CORS Middleware
origins = settings.ALLOWED_ORIGINS
base_origins = [
    "https://mineguard-ai-vert.vercel.app",
    "https://mineguard-ai.vercel.app",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000"
]
if "*" in origins or not origins:
    allow_origins = ["*"] + base_origins
else:
    allow_origins = list(set(origins + base_origins))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_origin_regex=r"^https://.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads static directory
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include Routers under API_V1_STR
api_prefix = settings.API_V1_STR
app.include_router(auth_router, prefix=api_prefix)
app.include_router(dashboard_router, prefix=api_prefix)
app.include_router(mines_router, prefix=api_prefix)
app.include_router(compliance_router, prefix=api_prefix)
app.include_router(inspections_router, prefix=api_prefix)
app.include_router(violations_router, prefix=api_prefix)
app.include_router(corrective_actions_router, prefix=api_prefix)
app.include_router(ai_router, prefix=api_prefix)
app.include_router(contractors_router, prefix=api_prefix)
app.include_router(grievances_router, prefix=api_prefix)
app.include_router(documents_router, prefix=api_prefix)
app.include_router(audit_router, prefix=api_prefix)
app.include_router(reports_router, prefix=api_prefix)

@app.on_event("startup")
def on_startup():
    db = next(get_db())
    try:
        seed_database(db)
    finally:
        db.close()

@app.get("/")
def root():
    return {
        "system": settings.PROJECT_NAME,
        "subtitle": settings.PROJECT_SUBTITLE,
        "status": "Online",
        "api_documentation": "/docs",
        "mode": "Academic Patent Implementation Prototype (Simulated Data)"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "engine": "FastAPI + SQLAlchemy + Scikit-Learn",
        "database": "SQLite (mineguard.db)",
        "security": "JWT RBAC + SHA-256 Chained Ledger"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8000, reload=True)
