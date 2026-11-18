import os
from dotenv import load_dotenv

# Automatically load environment variables from .env
load_dotenv()

class Settings:
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "MineGuard AI")
    PROJECT_SUBTITLE: str = os.getenv("PROJECT_SUBTITLE", "Intelligent Mine Governance & Compliance Monitoring System")
    API_V1_STR: str = "/api/v1"
    
    # Sensitive keys configured via environment variables
    SECRET_KEY: str = os.getenv("SECRET_KEY", "mineguard-super-secret-jwt-key-2026-academic-patent-prototype")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", str(60 * 24)))
    
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{os.path.join(BASE_DIR, 'mineguard.db')}")
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", os.path.join(BASE_DIR, "uploads"))
    
    # Allowed origins for CORS (comma separated in env or wildcard)
    ALLOWED_ORIGINS_RAW: str = os.getenv("ALLOWED_ORIGINS", "*")
    ALLOWED_ORIGINS: list = [origin.strip() for origin in ALLOWED_ORIGINS_RAW.split(",") if origin.strip()]

settings = Settings()

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
