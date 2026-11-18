from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from ..database import get_db
from ..models.models import Grievance, Mine, User
from ..schemas.schemas import GrievanceCreate, GrievanceUpdate, GrievanceResponse
from ..auth import get_current_user, require_roles
from ..services.audit_service import record_audit_log

router = APIRouter(prefix="/grievances", tags=["Grievances"])

@router.get("", response_model=List[GrievanceResponse])
def get_grievances(
    db: Session = Depends(get_db),
    mine_id: Optional[int] = None,
    category: Optional[str] = None,
    status: Optional[str] = None
):
    query = db.query(Grievance)
    if mine_id:
        query = query.filter(Grievance.mine_id == mine_id)
    if category:
        query = query.filter(Grievance.category == category)
    if status:
        query = query.filter(Grievance.status == status)

    grievances = query.order_by(Grievance.id.desc()).all()
    res = []
    for g in grievances:
        res.append({
            "id": g.id,
            "grievance_id": g.grievance_id,
            "category": g.category,
            "mine_id": g.mine_id,
            "mine_name": g.mine.name if g.mine else "N/A",
            "description": g.description,
            "submitted_by": g.submitted_by,
            "submission_date": g.submission_date,
            "priority": g.priority,
            "assigned_person": g.assigned_person,
            "status": g.status,
            "resolution": g.resolution,
            "resolved_date": g.resolved_date,
            "created_at": g.created_at
        })
    return res

@router.post("", response_model=GrievanceResponse)
def submit_grievance(
    g_in: GrievanceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    count = db.query(Grievance).count() + 1
    custom_id = g_in.grievance_id or f"GRV-2026-{count:04d}"
    today_str = date.today().isoformat()

    g = Grievance(
        grievance_id=custom_id,
        category=g_in.category,
        mine_id=g_in.mine_id,
        description=g_in.description,
        submitted_by=g_in.submitted_by or current_user.full_name or current_user.username,
        submission_date=g_in.submission_date or today_str,
        priority=g_in.priority,
        assigned_person=g_in.assigned_person or "Welfare Officer",
        status="Submitted"
    )
    db.add(g)
    db.commit()
    db.refresh(g)

    record_audit_log(
        db=db,
        user=current_user.username,
        action="SUBMIT_GRIEVANCE",
        entity_type="Grievance",
        entity_id=g.grievance_id,
        previous_value="",
        new_value=f"Category: {g.category}, Priority: {g.priority}",
        description=f"Logged worker grievance {g.grievance_id}"
    )

    mine = db.query(Mine).filter(Mine.id == g.mine_id).first()
    return {
        "id": g.id,
        "grievance_id": g.grievance_id,
        "category": g.category,
        "mine_id": g.mine_id,
        "mine_name": mine.name if mine else "N/A",
        "description": g.description,
        "submitted_by": g.submitted_by,
        "submission_date": g.submission_date,
        "priority": g.priority,
        "assigned_person": g.assigned_person,
        "status": g.status,
        "resolution": g.resolution,
        "resolved_date": g.resolved_date,
        "created_at": g.created_at
    }

@router.put("/{grievance_id}", response_model=GrievanceResponse)
def update_grievance(
    grievance_id: int,
    g_update: GrievanceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["manager", "admin"]))
):
    g = db.query(Grievance).filter(Grievance.id == grievance_id).first()
    if not g:
        raise HTTPException(status_code=404, detail="Grievance not found")

    old_status = g.status
    update_data = g_update.dict(exclude_unset=True)

    if update_data.get("status") in ["Resolved", "Rejected"]:
        update_data["resolved_date"] = date.today().isoformat()

    for k, v in update_data.items():
        setattr(g, k, v)

    db.commit()
    db.refresh(g)

    record_audit_log(
        db=db,
        user=current_user.username,
        action="UPDATE_GRIEVANCE",
        entity_type="Grievance",
        entity_id=g.grievance_id,
        previous_value=old_status,
        new_value=g.status,
        description=f"Grievance {g.grievance_id} marked as {g.status} with resolution: {g.resolution or 'N/A'}"
    )

    mine = db.query(Mine).filter(Mine.id == g.mine_id).first()
    return {
        "id": g.id,
        "grievance_id": g.grievance_id,
        "category": g.category,
        "mine_id": g.mine_id,
        "mine_name": mine.name if mine else "N/A",
        "description": g.description,
        "submitted_by": g.submitted_by,
        "submission_date": g.submission_date,
        "priority": g.priority,
        "assigned_person": g.assigned_person,
        "status": g.status,
        "resolution": g.resolution,
        "resolved_date": g.resolved_date,
        "created_at": g.created_at
    }
