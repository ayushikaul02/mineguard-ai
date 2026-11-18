from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.models import AuditLog
from ..schemas.schemas import AuditLogResponse, AuditIntegrityResponse
from ..services.audit_service import verify_audit_chain

router = APIRouter(prefix="/audit", tags=["Audit Trail"])

@router.get("", response_model=List[AuditLogResponse])
def get_audit_trail(db: Session = Depends(get_db)):
    """
    Returns complete chronological tamper-evident audit ledger.
    """
    return db.query(AuditLog).order_by(AuditLog.id.desc()).limit(200).all()

@router.get("/verify", response_model=AuditIntegrityResponse)
def verify_ledger_integrity(db: Session = Depends(get_db)):
    """
    Cryptographically verifies SHA-256 hash chains across all historical events.
    Detects any database tampering, unauthorized manual modifications, or broken blocks.
    """
    return verify_audit_chain(db)
