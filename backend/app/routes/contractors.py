from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models.models import Contractor, Mine, User
from ..schemas.schemas import ContractorCreate, ContractorUpdate, ContractorResponse
from ..auth import get_current_user, require_roles
from ..services.audit_service import record_audit_log

router = APIRouter(prefix="/contractors", tags=["Contractors"])

@router.get("", response_model=List[ContractorResponse])
def get_contractors(
    db: Session = Depends(get_db),
    mine_id: Optional[int] = None
):
    query = db.query(Contractor)
    if mine_id:
        query = query.filter(Contractor.mine_id == mine_id)
    contractors = query.all()
    res = []
    for c in contractors:
        res.append({
            "id": c.id,
            "contractor_id": c.contractor_id,
            "name": c.name,
            "mine_id": c.mine_id,
            "mine_name": c.mine.name if c.mine else "N/A",
            "contact_person": c.contact_person,
            "contact_phone": c.contact_phone,
            "contact_email": c.contact_email,
            "worker_count": c.worker_count,
            "compliance_score": c.compliance_score,
            "active_contracts": c.active_contracts,
            "safety_violations": c.safety_violations,
            "pending_actions": c.pending_actions,
            "status": c.status,
            "created_at": c.created_at
        })
    return res

@router.post("", response_model=ContractorResponse)
def create_contractor(
    c_in: ContractorCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["manager", "admin"]))
):
    count = db.query(Contractor).count() + 1
    custom_id = c_in.contractor_id or f"CNT-2026-{count:03d}"

    c = Contractor(
        contractor_id=custom_id,
        name=c_in.name,
        mine_id=c_in.mine_id,
        contact_person=c_in.contact_person,
        contact_phone=c_in.contact_phone,
        contact_email=c_in.contact_email,
        worker_count=c_in.worker_count,
        compliance_score=c_in.compliance_score,
        active_contracts=c_in.active_contracts,
        safety_violations=c_in.safety_violations,
        pending_actions=c_in.pending_actions,
        status=c_in.status
    )
    db.add(c)
    db.commit()
    db.refresh(c)

    record_audit_log(
        db=db,
        user=current_user.username,
        action="CREATE_CONTRACTOR",
        entity_type="Contractor",
        entity_id=c.contractor_id,
        previous_value="",
        new_value=f"{c.name} ({c.status})",
        description=f"Registered contractor {c.name} ({c.contractor_id})"
    )

    mine = db.query(Mine).filter(Mine.id == c.mine_id).first()
    return {
        "id": c.id,
        "contractor_id": c.contractor_id,
        "name": c.name,
        "mine_id": c.mine_id,
        "mine_name": mine.name if mine else "N/A",
        "contact_person": c.contact_person,
        "contact_phone": c.contact_phone,
        "contact_email": c.contact_email,
        "worker_count": c.worker_count,
        "compliance_score": c.compliance_score,
        "active_contracts": c.active_contracts,
        "safety_violations": c.safety_violations,
        "pending_actions": c.pending_actions,
        "status": c.status,
        "created_at": c.created_at
    }

@router.put("/{contractor_id}", response_model=ContractorResponse)
def update_contractor(
    contractor_id: int,
    c_update: ContractorUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["manager", "admin"]))
):
    c = db.query(Contractor).filter(Contractor.id == contractor_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Contractor not found")

    old_status = c.status
    update_data = c_update.dict(exclude_unset=True)
    for k, v in update_data.items():
        setattr(c, k, v)

    db.commit()
    db.refresh(c)

    record_audit_log(
        db=db,
        user=current_user.username,
        action="UPDATE_CONTRACTOR",
        entity_type="Contractor",
        entity_id=c.contractor_id,
        previous_value=old_status,
        new_value=c.status,
        description=f"Updated contractor {c.name} details"
    )

    mine = db.query(Mine).filter(Mine.id == c.mine_id).first()
    return {
        "id": c.id,
        "contractor_id": c.contractor_id,
        "name": c.name,
        "mine_id": c.mine_id,
        "mine_name": mine.name if mine else "N/A",
        "contact_person": c.contact_person,
        "contact_phone": c.contact_phone,
        "contact_email": c.contact_email,
        "worker_count": c.worker_count,
        "compliance_score": c.compliance_score,
        "active_contracts": c.active_contracts,
        "safety_violations": c.safety_violations,
        "pending_actions": c.pending_actions,
        "status": c.status,
        "created_at": c.created_at
    }
