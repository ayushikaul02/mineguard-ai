from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date
from ..database import get_db
from ..models.models import CorrectiveAction, Violation, Mine, User
from ..schemas.schemas import (
    CorrectiveActionCreate,
    CorrectiveActionTransition,
    CorrectiveActionResponse
)
from ..auth import get_current_user, require_roles
from ..services.audit_service import record_audit_log

router = APIRouter(prefix="/corrective-actions", tags=["Corrective Actions"])

@router.get("", response_model=List[CorrectiveActionResponse])
def get_corrective_actions(
    db: Session = Depends(get_db),
    mine_id: Optional[int] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None
):
    query = db.query(CorrectiveAction)
    if mine_id:
        query = query.filter(CorrectiveAction.mine_id == mine_id)
    if status:
        query = query.filter(CorrectiveAction.status == status)
    if priority:
        query = query.filter(CorrectiveAction.priority == priority)

    actions = query.order_by(CorrectiveAction.id.desc()).all()
    today_str = date.today().isoformat()
    res = []
    for ca in actions:
        is_overdue = ca.status not in ["Closed"] and ca.due_date < today_str
        res.append({
            "id": ca.id,
            "case_id": ca.case_id,
            "violation_id": ca.violation_id,
            "mine_id": ca.mine_id,
            "mine_name": ca.mine.name if ca.mine else "N/A",
            "location": ca.location,
            "description": ca.description,
            "risk_score": ca.risk_score,
            "priority": ca.priority,
            "assigned_person": ca.assigned_person,
            "created_date": ca.created_date,
            "due_date": ca.due_date,
            "status": ca.status,
            "completion_evidence": ca.completion_evidence,
            "evidence_url": ca.evidence_url,
            "verification_notes": ca.verification_notes,
            "verified_by": ca.verified_by,
            "closed_date": ca.closed_date,
            "created_at": ca.created_at,
            "updated_at": ca.updated_at,
            "is_overdue": is_overdue
        })
    return res

@router.get("/{ca_id}", response_model=CorrectiveActionResponse)
def get_corrective_action(ca_id: int, db: Session = Depends(get_db)):
    ca = db.query(CorrectiveAction).filter(CorrectiveAction.id == ca_id).first()
    if not ca:
        raise HTTPException(status_code=404, detail="Corrective Action not found")
    
    today_str = date.today().isoformat()
    return {
        "id": ca.id,
        "case_id": ca.case_id,
        "violation_id": ca.violation_id,
        "mine_id": ca.mine_id,
        "mine_name": ca.mine.name if ca.mine else "N/A",
        "location": ca.location,
        "description": ca.description,
        "risk_score": ca.risk_score,
        "priority": ca.priority,
        "assigned_person": ca.assigned_person,
        "created_date": ca.created_date,
        "due_date": ca.due_date,
        "status": ca.status,
        "completion_evidence": ca.completion_evidence,
        "evidence_url": ca.evidence_url,
        "verification_notes": ca.verification_notes,
        "verified_by": ca.verified_by,
        "closed_date": ca.closed_date,
        "created_at": ca.created_at,
        "updated_at": ca.updated_at,
        "is_overdue": ca.status not in ["Closed"] and ca.due_date < today_str
    }

@router.post("", response_model=CorrectiveActionResponse)
def create_corrective_action(
    ca_in: CorrectiveActionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["manager", "admin", "inspector"]))
):
    count = db.query(CorrectiveAction).count() + 1
    custom_id = ca_in.case_id or f"CAPA-2026-{count:04d}"
    today_str = date.today().isoformat()

    ca = CorrectiveAction(
        case_id=custom_id,
        violation_id=ca_in.violation_id,
        mine_id=ca_in.mine_id,
        location=ca_in.location,
        description=ca_in.description,
        risk_score=ca_in.risk_score,
        priority=ca_in.priority,
        assigned_person=ca_in.assigned_person,
        created_date=ca_in.created_date or today_str,
        due_date=ca_in.due_date,
        status="Assigned"
    )
    db.add(ca)
    db.commit()
    db.refresh(ca)

    record_audit_log(
        db=db,
        user=current_user.username,
        action="CREATE_CAPA",
        entity_type="CorrectiveAction",
        entity_id=ca.case_id,
        previous_value="",
        new_value=f"Priority: {ca.priority}, Assigned: {ca.assigned_person}",
        description=f"Created Corrective Action case {ca.case_id}"
    )

    mine = db.query(Mine).filter(Mine.id == ca.mine_id).first()
    return {
        "id": ca.id,
        "case_id": ca.case_id,
        "violation_id": ca.violation_id,
        "mine_id": ca.mine_id,
        "mine_name": mine.name if mine else "N/A",
        "location": ca.location,
        "description": ca.description,
        "risk_score": ca.risk_score,
        "priority": ca.priority,
        "assigned_person": ca.assigned_person,
        "created_date": ca.created_date,
        "due_date": ca.due_date,
        "status": ca.status,
        "completion_evidence": ca.completion_evidence,
        "evidence_url": ca.evidence_url,
        "verification_notes": ca.verification_notes,
        "verified_by": ca.verified_by,
        "closed_date": ca.closed_date,
        "created_at": ca.created_at,
        "updated_at": ca.updated_at,
        "is_overdue": ca.due_date < today_str
    }

@router.post("/{ca_id}/transition", response_model=CorrectiveActionResponse)
def transition_corrective_action(
    ca_id: int,
    transition: CorrectiveActionTransition,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["inspector", "manager", "admin"]))
):
    ca = db.query(CorrectiveAction).filter(CorrectiveAction.id == ca_id).first()
    if not ca:
        raise HTTPException(status_code=404, detail="Corrective Action not found")

    old_status = ca.status
    target_status = transition.status

    # Validate transition rules
    if target_status == "Closed":
        if current_user.role not in ["manager", "admin"]:
            raise HTTPException(status_code=403, detail="Only Mine Managers or Administrators can verify and close cases.")
        ca.status = "Closed"
        ca.verification_notes = transition.verification_notes or "Verified statutory rectification in compliance with DGMS guidelines."
        ca.verified_by = current_user.full_name or current_user.username
        ca.closed_date = date.today().isoformat()

        # Also update associated violation if resolved
        if ca.violation_id:
            vio = db.query(Violation).filter(Violation.id == ca.violation_id).first()
            if vio:
                vio.status = "Resolved"
                db.commit()

    elif target_status == "Awaiting Verification":
        ca.status = "Awaiting Verification"
        ca.completion_evidence = transition.completion_evidence or "Evidence uploaded by field team."
        if transition.evidence_url:
            ca.evidence_url = transition.evidence_url

    elif target_status == "In Progress":
        ca.status = "In Progress"

    elif target_status == "Reopened":
        ca.status = "Reopened"
        ca.verification_notes = transition.verification_notes or "Reopened due to incomplete corrective action implementation."

    else:
        ca.status = target_status

    db.commit()
    db.refresh(ca)

    record_audit_log(
        db=db,
        user=current_user.username,
        action=f"CAPA_STATUS_{ca.status.upper()}",
        entity_type="CorrectiveAction",
        entity_id=ca.case_id,
        previous_value=old_status,
        new_value=ca.status,
        description=f"CAPA {ca.case_id} transitioned from {old_status} to {ca.status} by {current_user.username}"
    )

    today_str = date.today().isoformat()
    return {
        "id": ca.id,
        "case_id": ca.case_id,
        "violation_id": ca.violation_id,
        "mine_id": ca.mine_id,
        "mine_name": ca.mine.name if ca.mine else "N/A",
        "location": ca.location,
        "description": ca.description,
        "risk_score": ca.risk_score,
        "priority": ca.priority,
        "assigned_person": ca.assigned_person,
        "created_date": ca.created_date,
        "due_date": ca.due_date,
        "status": ca.status,
        "completion_evidence": ca.completion_evidence,
        "evidence_url": ca.evidence_url,
        "verification_notes": ca.verification_notes,
        "verified_by": ca.verified_by,
        "closed_date": ca.closed_date,
        "created_at": ca.created_at,
        "updated_at": ca.updated_at,
        "is_overdue": ca.status != "Closed" and ca.due_date < today_str
    }
