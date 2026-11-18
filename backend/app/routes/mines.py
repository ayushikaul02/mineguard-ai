from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.models import Mine, ComplianceRecord, Violation, User
from ..schemas.schemas import MineResponse, MineCreate
from ..auth import get_current_user, require_roles
from ..services.audit_service import record_audit_log

router = APIRouter(prefix="/mines", tags=["Mines"])

@router.get("", response_model=List[MineResponse])
def get_all_mines(db: Session = Depends(get_db)):
    mines = db.query(Mine).all()
    result = []
    for m in mines:
        total_cmp = len(m.compliance_records)
        comp_count = sum(1 for c in m.compliance_records if c.status == "Compliant")
        comp_score = round((comp_count / max(total_cmp, 1)) * 100.0, 1) if total_cmp > 0 else 100.0
        open_v = sum(1 for v in m.violations if v.status in ["Open", "Action Assigned", "Escalated"])
        
        # Calculate risk level based on violations
        max_risk = max([v.risk_score for v in m.violations if v.status != "Resolved"], default=0.0)
        if max_risk >= 75.0 or comp_score < 70.0:
            risk_level = "CRITICAL"
        elif max_risk >= 50.0 or comp_score < 85.0:
            risk_level = "HIGH"
        elif max_risk >= 25.0:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"

        m_dict = {
            "id": m.id,
            "code": m.code,
            "name": m.name,
            "location": m.location,
            "state": m.state,
            "latitude": m.latitude,
            "longitude": m.longitude,
            "mine_type": m.mine_type,
            "manager_name": m.manager_name,
            "total_workforce": m.total_workforce,
            "daily_production_capacity": m.daily_production_capacity,
            "status": m.status,
            "created_at": m.created_at,
            "compliance_score": comp_score,
            "open_violations": open_v,
            "risk_level": risk_level
        }
        result.append(m_dict)
    return result

@router.get("/{mine_id}", response_model=MineResponse)
def get_mine_by_id(mine_id: int, db: Session = Depends(get_db)):
    m = db.query(Mine).filter(Mine.id == mine_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Mine not found")
    
    total_cmp = len(m.compliance_records)
    comp_count = sum(1 for c in m.compliance_records if c.status == "Compliant")
    comp_score = round((comp_count / max(total_cmp, 1)) * 100.0, 1) if total_cmp > 0 else 100.0
    open_v = sum(1 for v in m.violations if v.status in ["Open", "Action Assigned", "Escalated"])
    max_risk = max([v.risk_score for v in m.violations if v.status != "Resolved"], default=0.0)
    risk_level = "CRITICAL" if max_risk >= 75 or comp_score < 70 else ("HIGH" if max_risk >= 50 or comp_score < 85 else "LOW")

    return {
        "id": m.id,
        "code": m.code,
        "name": m.name,
        "location": m.location,
        "state": m.state,
        "latitude": m.latitude,
        "longitude": m.longitude,
        "mine_type": m.mine_type,
        "manager_name": m.manager_name,
        "total_workforce": m.total_workforce,
        "daily_production_capacity": m.daily_production_capacity,
        "status": m.status,
        "created_at": m.created_at,
        "compliance_score": comp_score,
        "open_violations": open_v,
        "risk_level": risk_level
    }

@router.post("", response_model=MineResponse)
def create_mine(
    mine_in: MineCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["admin"]))
):
    new_mine = Mine(**mine_in.dict())
    db.add(new_mine)
    db.commit()
    db.refresh(new_mine)

    record_audit_log(
        db=db,
        user=current_user.username,
        action="CREATE",
        entity_type="Mine",
        entity_id=str(new_mine.id),
        previous_value="",
        new_value=new_mine.name,
        description=f"Registered new mining leasehold: {new_mine.name} ({new_mine.code})"
    )

    return new_mine
