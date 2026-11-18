from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models.models import ComplianceRecord, Mine, User
from ..schemas.schemas import (
    ComplianceRecordCreate,
    ComplianceRecordUpdate,
    ComplianceRecordResponse
)
from ..auth import get_current_user, require_roles
from ..services.risk_engine import calculate_risk_score
from ..services.audit_service import record_audit_log

router = APIRouter(prefix="/compliance", tags=["Compliance"])

@router.get("", response_model=List[ComplianceRecordResponse])
def get_compliance_records(
    db: Session = Depends(get_db),
    domain: Optional[str] = None,
    mine_id: Optional[int] = None,
    status: Optional[str] = None,
    severity: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
):
    query = db.query(ComplianceRecord)
    if domain:
        query = query.filter(ComplianceRecord.domain == domain)
    if mine_id:
        query = query.filter(ComplianceRecord.mine_id == mine_id)
    if status:
        query = query.filter(ComplianceRecord.status == status)
    if severity:
        query = query.filter(ComplianceRecord.severity == severity)
    if search:
        search_fmt = f"%{search}%"
        query = query.filter(
            (ComplianceRecord.requirement.ilike(search_fmt)) |
            (ComplianceRecord.description.ilike(search_fmt)) |
            (ComplianceRecord.responsible_person.ilike(search_fmt)) |
            (ComplianceRecord.record_id.ilike(search_fmt))
        )

    records = query.order_by(ComplianceRecord.id.desc()).offset(skip).limit(limit).all()
    
    # Map mine_name
    res = []
    for r in records:
        r_dict = {
            "id": r.id,
            "record_id": r.record_id,
            "mine_id": r.mine_id,
            "mine_name": r.mine.name if r.mine else "N/A",
            "domain": r.domain,
            "requirement": r.requirement,
            "description": r.description,
            "inspection_date": r.inspection_date,
            "due_date": r.due_date,
            "responsible_person": r.responsible_person,
            "status": r.status,
            "severity": r.severity,
            "evidence": r.evidence,
            "risk_score": r.risk_score,
            "risk_category": r.risk_category,
            "corrective_action": r.corrective_action,
            "created_at": r.created_at,
            "updated_at": r.updated_at
        }
        res.append(r_dict)
    return res

@router.get("/{record_id}", response_model=ComplianceRecordResponse)
def get_compliance_record(record_id: int, db: Session = Depends(get_db)):
    r = db.query(ComplianceRecord).filter(ComplianceRecord.id == record_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Compliance record not found")
    return {
        "id": r.id,
        "record_id": r.record_id,
        "mine_id": r.mine_id,
        "mine_name": r.mine.name if r.mine else "N/A",
        "domain": r.domain,
        "requirement": r.requirement,
        "description": r.description,
        "inspection_date": r.inspection_date,
        "due_date": r.due_date,
        "responsible_person": r.responsible_person,
        "status": r.status,
        "severity": r.severity,
        "evidence": r.evidence,
        "risk_score": r.risk_score,
        "risk_category": r.risk_category,
        "corrective_action": r.corrective_action,
        "created_at": r.created_at,
        "updated_at": r.updated_at
    }

@router.post("", response_model=ComplianceRecordResponse)
def create_compliance_record(
    record_in: ComplianceRecordCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["inspector", "manager", "admin"]))
):
    count = db.query(ComplianceRecord).count() + 1
    custom_id = record_in.record_id or f"CMP-2026-{count:04d}"

    # Auto risk score calculation
    risk_calc = calculate_risk_score(
        severity=record_in.severity,
        likelihood="High" if record_in.severity in ["High", "Critical"] else "Medium",
        recurrence_count=1,
        days_overdue=0
    )

    new_record = ComplianceRecord(
        record_id=custom_id,
        mine_id=record_in.mine_id,
        domain=record_in.domain,
        requirement=record_in.requirement,
        description=record_in.description,
        inspection_date=record_in.inspection_date,
        due_date=record_in.due_date,
        responsible_person=record_in.responsible_person,
        status=record_in.status,
        severity=record_in.severity,
        evidence=record_in.evidence,
        risk_score=risk_calc["risk_score"],
        risk_category=risk_calc["risk_category"],
        corrective_action=record_in.corrective_action
    )
    db.add(new_record)
    db.commit()
    db.refresh(new_record)

    record_audit_log(
        db=db,
        user=current_user.username,
        action="CREATE",
        entity_type="ComplianceRecord",
        entity_id=new_record.record_id,
        previous_value="",
        new_value=f"Domain: {new_record.domain}, Status: {new_record.status}, Severity: {new_record.severity}",
        description=f"Created compliance record {new_record.record_id}: {new_record.requirement}"
    )

    mine = db.query(Mine).filter(Mine.id == new_record.mine_id).first()
    return {
        "id": new_record.id,
        "record_id": new_record.record_id,
        "mine_id": new_record.mine_id,
        "mine_name": mine.name if mine else "N/A",
        "domain": new_record.domain,
        "requirement": new_record.requirement,
        "description": new_record.description,
        "inspection_date": new_record.inspection_date,
        "due_date": new_record.due_date,
        "responsible_person": new_record.responsible_person,
        "status": new_record.status,
        "severity": new_record.severity,
        "evidence": new_record.evidence,
        "risk_score": new_record.risk_score,
        "risk_category": new_record.risk_category,
        "corrective_action": new_record.corrective_action,
        "created_at": new_record.created_at,
        "updated_at": new_record.updated_at
    }

@router.put("/{record_id}", response_model=ComplianceRecordResponse)
def update_compliance_record(
    record_id: int,
    record_update: ComplianceRecordUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["inspector", "manager", "admin"]))
):
    r = db.query(ComplianceRecord).filter(ComplianceRecord.id == record_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Compliance record not found")

    prev_status = r.status
    update_data = record_update.dict(exclude_unset=True)

    # Recalculate risk score if severity updated
    if "severity" in update_data:
        risk_calc = calculate_risk_score(
            severity=update_data["severity"],
            likelihood="High" if update_data["severity"] in ["High", "Critical"] else "Medium"
        )
        update_data["risk_score"] = risk_calc["risk_score"]
        update_data["risk_category"] = risk_calc["risk_category"]

    for k, v in update_data.items():
        setattr(r, k, v)

    db.commit()
    db.refresh(r)

    record_audit_log(
        db=db,
        user=current_user.username,
        action="UPDATE",
        entity_type="ComplianceRecord",
        entity_id=r.record_id,
        previous_value=f"Status: {prev_status}",
        new_value=f"Status: {r.status}, Severity: {r.severity}",
        description=f"Updated compliance record {r.record_id}"
    )

    return {
        "id": r.id,
        "record_id": r.record_id,
        "mine_id": r.mine_id,
        "mine_name": r.mine.name if r.mine else "N/A",
        "domain": r.domain,
        "requirement": r.requirement,
        "description": r.description,
        "inspection_date": r.inspection_date,
        "due_date": r.due_date,
        "responsible_person": r.responsible_person,
        "status": r.status,
        "severity": r.severity,
        "evidence": r.evidence,
        "risk_score": r.risk_score,
        "risk_category": r.risk_category,
        "corrective_action": r.corrective_action,
        "created_at": r.created_at,
        "updated_at": r.updated_at
    }
