from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from ..database import get_db
from ..models.models import Violation, Mine, User
from ..schemas.schemas import ViolationCreate, ViolationUpdate, ViolationResponse
from ..auth import get_current_user, require_roles
from ..services.risk_engine import calculate_risk_score
from ..services.audit_service import record_audit_log

router = APIRouter(prefix="/violations", tags=["Violations"])

@router.get("", response_model=List[ViolationResponse])
def get_violations(
    db: Session = Depends(get_db),
    mine_id: Optional[int] = None,
    domain: Optional[str] = None,
    status: Optional[str] = None,
    severity: Optional[str] = None
):
    query = db.query(Violation)
    if mine_id:
        query = query.filter(Violation.mine_id == mine_id)
    if domain:
        query = query.filter(Violation.domain == domain)
    if status:
        query = query.filter(Violation.status == status)
    if severity:
        query = query.filter(Violation.severity == severity)
    
    violations = query.order_by(Violation.id.desc()).all()
    res = []
    for v in violations:
        res.append({
            "id": v.id,
            "violation_id": v.violation_id,
            "inspection_id": v.inspection_id,
            "mine_id": v.mine_id,
            "mine_name": v.mine.name if v.mine else "N/A",
            "domain": v.domain,
            "location": v.location,
            "title": v.title,
            "description": v.description,
            "severity": v.severity,
            "likelihood": v.likelihood,
            "recurrence_count": v.recurrence_count,
            "risk_score": v.risk_score,
            "risk_category": v.risk_category,
            "contributing_factors": v.contributing_factors,
            "status": v.status,
            "escalation_level": v.escalation_level,
            "reported_by": v.reported_by,
            "reported_date": v.reported_date
        })
    return res

@router.get("/{violation_id}", response_model=ViolationResponse)
def get_violation(violation_id: int, db: Session = Depends(get_db)):
    v = db.query(Violation).filter(Violation.id == violation_id).first()
    if not v:
        raise HTTPException(status_code=404, detail="Violation not found")
    return {
        "id": v.id,
        "violation_id": v.violation_id,
        "inspection_id": v.inspection_id,
        "mine_id": v.mine_id,
        "mine_name": v.mine.name if v.mine else "N/A",
        "domain": v.domain,
        "location": v.location,
        "title": v.title,
        "description": v.description,
        "severity": v.severity,
        "likelihood": v.likelihood,
        "recurrence_count": v.recurrence_count,
        "risk_score": v.risk_score,
        "risk_category": v.risk_category,
        "contributing_factors": v.contributing_factors,
        "status": v.status,
        "escalation_level": v.escalation_level,
        "reported_by": v.reported_by,
        "reported_date": v.reported_date
    }

@router.post("", response_model=ViolationResponse)
def create_violation(
    v_in: ViolationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["inspector", "manager", "admin"]))
):
    count = db.query(Violation).count() + 1
    custom_id = v_in.violation_id or f"VIO-2026-{count:04d}"

    # Calculate real risk score
    risk_calc = calculate_risk_score(
        severity=v_in.severity,
        likelihood=v_in.likelihood,
        recurrence_count=v_in.recurrence_count
    )

    escalation = "Level 3 - Regulatory Authority" if risk_calc["risk_category"] == "CRITICAL" else (
        "Level 2 - Mine General Manager" if risk_calc["risk_category"] == "HIGH" else "Level 1 - Mine Level"
    )

    v = Violation(
        violation_id=custom_id,
        inspection_id=v_in.inspection_id,
        mine_id=v_in.mine_id,
        domain=v_in.domain,
        location=v_in.location,
        title=v_in.title,
        description=v_in.description,
        severity=v_in.severity,
        likelihood=v_in.likelihood,
        recurrence_count=v_in.recurrence_count,
        risk_score=risk_calc["risk_score"],
        risk_category=risk_calc["risk_category"],
        contributing_factors=risk_calc.get("contributing_factors", {}),
        status=v_in.status,
        escalation_level=escalation,
        reported_by=v_in.reported_by
    )
    db.add(v)
    db.commit()
    db.refresh(v)

    record_audit_log(
        db=db,
        user=current_user.username,
        action="CREATE_VIOLATION",
        entity_type="Violation",
        entity_id=v.violation_id,
        previous_value="",
        new_value=f"Risk: {v.risk_score} ({v.risk_category})",
        description=f"Logged violation {v.violation_id}: {v.title} at {v.location}"
    )

    mine = db.query(Mine).filter(Mine.id == v.mine_id).first()
    return {
        "id": v.id,
        "violation_id": v.violation_id,
        "inspection_id": v.inspection_id,
        "mine_id": v.mine_id,
        "mine_name": mine.name if mine else "N/A",
        "domain": v.domain,
        "location": v.location,
        "title": v.title,
        "description": v.description,
        "severity": v.severity,
        "likelihood": v.likelihood,
        "recurrence_count": v.recurrence_count,
        "risk_score": v.risk_score,
        "risk_category": v.risk_category,
        "contributing_factors": v.contributing_factors,
        "status": v.status,
        "escalation_level": v.escalation_level,
        "reported_by": v.reported_by,
        "reported_date": v.reported_date
    }

@router.put("/{violation_id}", response_model=ViolationResponse)
def update_violation(
    violation_id: int,
    v_update: ViolationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["manager", "admin", "inspector"]))
):
    v = db.query(Violation).filter(Violation.id == violation_id).first()
    if not v:
        raise HTTPException(status_code=404, detail="Violation not found")

    prev_status = v.status
    update_data = v_update.dict(exclude_unset=True)
    for key, val in update_data.items():
        setattr(v, key, val)

    db.commit()
    db.refresh(v)

    record_audit_log(
        db=db,
        user=current_user.username,
        action="UPDATE_VIOLATION",
        entity_type="Violation",
        entity_id=v.violation_id,
        previous_value=f"Status: {prev_status}",
        new_value=f"Status: {v.status}, Escalation: {v.escalation_level}",
        description=f"Updated violation {v.violation_id} status to {v.status}"
    )

    mine = db.query(Mine).filter(Mine.id == v.mine_id).first()
    return {
        "id": v.id,
        "violation_id": v.violation_id,
        "inspection_id": v.inspection_id,
        "mine_id": v.mine_id,
        "mine_name": mine.name if mine else "N/A",
        "domain": v.domain,
        "location": v.location,
        "title": v.title,
        "description": v.description,
        "severity": v.severity,
        "likelihood": v.likelihood,
        "recurrence_count": v.recurrence_count,
        "risk_score": v.risk_score,
        "risk_category": v.risk_category,
        "contributing_factors": v.contributing_factors,
        "status": v.status,
        "escalation_level": v.escalation_level,
        "reported_by": v.reported_by,
        "reported_date": v.reported_date
    }
