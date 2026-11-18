from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date, timedelta
from ..database import get_db
from ..models.models import Inspection, Violation, CorrectiveAction, Mine, User
from ..schemas.schemas import InspectionCreate, InspectionResponse
from ..auth import get_current_user, require_roles
from ..services.risk_engine import evaluate_inspection_risk, calculate_risk_score
from ..services.audit_service import record_audit_log

router = APIRouter(prefix="/inspections", tags=["Inspections"])

@router.get("", response_model=List[InspectionResponse])
def get_inspections(
    db: Session = Depends(get_db),
    mine_id: Optional[int] = None,
    domain: Optional[str] = None
):
    query = db.query(Inspection)
    if mine_id:
        query = query.filter(Inspection.mine_id == mine_id)
    if domain:
        query = query.filter(Inspection.domain == domain)
    
    inspections = query.order_by(Inspection.id.desc()).all()
    res = []
    for ins in inspections:
        res.append({
            "id": ins.id,
            "inspection_id": ins.inspection_id,
            "mine_id": ins.mine_id,
            "mine_name": ins.mine.name if ins.mine else "N/A",
            "domain": ins.domain,
            "location": ins.location,
            "inspector_name": ins.inspector_name,
            "inspection_date": ins.inspection_date,
            "status": ins.status,
            "overall_score": ins.overall_score,
            "checklist_data": ins.checklist_data or [],
            "comments": ins.comments,
            "photos": ins.photos or [],
            "risk_score": ins.risk_score,
            "risk_category": ins.risk_category,
            "created_at": ins.created_at
        })
    return res

@router.get("/{inspection_id}", response_model=InspectionResponse)
def get_inspection_details(inspection_id: int, db: Session = Depends(get_db)):
    ins = db.query(Inspection).filter(Inspection.id == inspection_id).first()
    if not ins:
        raise HTTPException(status_code=404, detail="Inspection not found")
    return {
        "id": ins.id,
        "inspection_id": ins.inspection_id,
        "mine_id": ins.mine_id,
        "mine_name": ins.mine.name if ins.mine else "N/A",
        "domain": ins.domain,
        "location": ins.location,
        "inspector_name": ins.inspector_name,
        "inspection_date": ins.inspection_date,
        "status": ins.status,
        "overall_score": ins.overall_score,
        "checklist_data": ins.checklist_data or [],
        "comments": ins.comments,
        "photos": ins.photos or [],
        "risk_score": ins.risk_score,
        "risk_category": ins.risk_category,
        "created_at": ins.created_at
    }

@router.post("", response_model=InspectionResponse)
def submit_field_inspection(
    insp_in: InspectionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["inspector", "manager", "admin"]))
):
    checklist_dicts = [item.dict() for item in insp_in.checklist_data]
    eval_result = evaluate_inspection_risk(checklist_dicts)

    count = db.query(Inspection).count() + 1
    custom_insp_id = f"INSP-2026-{count:04d}"

    status = "Violations Found" if eval_result["non_compliant_count"] > 0 else "Completed"

    inspection = Inspection(
        inspection_id=custom_insp_id,
        mine_id=insp_in.mine_id,
        domain=insp_in.domain,
        location=insp_in.location,
        inspector_name=insp_in.inspector_name,
        inspection_date=insp_in.inspection_date,
        status=status,
        overall_score=eval_result["overall_score"],
        checklist_data=checklist_dicts,
        comments=insp_in.comments,
        photos=insp_in.photos or [],
        risk_score=eval_result["risk_score"],
        risk_category=eval_result["risk_category"]
    )
    db.add(inspection)
    db.commit()
    db.refresh(inspection)

    # Automatically generate Violations and Corrective Actions if non-compliant items found
    for failed_item in eval_result["violations_to_create"]:
        v_count = db.query(Violation).count() + 1
        v_id = f"VIO-2026-{v_count:04d}"

        item_sev = failed_item.get("severity", "Medium")
        item_risk_calc = calculate_risk_score(
            severity=item_sev,
            likelihood="High" if item_sev in ["High", "Critical"] else "Medium",
            recurrence_count=1
        )

        escalation = "Level 3 - Regulatory Authority" if item_risk_calc["risk_category"] == "CRITICAL" else (
            "Level 2 - Mine General Manager" if item_risk_calc["risk_category"] == "HIGH" else "Level 1 - Mine Level"
        )

        violation = Violation(
            violation_id=v_id,
            inspection_id=inspection.id,
            mine_id=inspection.mine_id,
            domain=inspection.domain,
            location=inspection.location,
            title=f"Non-Compliance: {failed_item.get('item', 'Checklist item')}",
            description=failed_item.get("remarks") or f"Non-compliant observation during statutory inspection at {inspection.location}.",
            severity=item_sev,
            likelihood="High" if item_sev in ["High", "Critical"] else "Medium",
            recurrence_count=1,
            risk_score=item_risk_calc["risk_score"],
            risk_category=item_risk_calc["risk_category"],
            contributing_factors=item_risk_calc.get("contributing_factors", {}),
            status="Action Assigned",
            escalation_level=escalation,
            reported_by=inspection.inspector_name
        )
        db.add(violation)
        db.commit()
        db.refresh(violation)

        # Automatically create Corrective Action case
        ca_count = db.query(CorrectiveAction).count() + 1
        ca_id = f"CAPA-2026-{ca_count:04d}"
        
        # Priority mapping
        priority_map = {"CRITICAL": "Critical", "HIGH": "High", "MEDIUM": "Medium", "LOW": "Low"}
        priority = priority_map.get(item_risk_calc["risk_category"], "Medium")

        # Due date based on priority
        days_allowed = 2 if priority == "Critical" else (5 if priority == "High" else 14)
        due = (date.today() + timedelta(days=days_allowed)).isoformat()

        ca = CorrectiveAction(
            case_id=ca_id,
            violation_id=violation.id,
            mine_id=inspection.mine_id,
            location=inspection.location,
            description=f"Rectify statutory failure: {violation.title}. {violation.description}",
            risk_score=violation.risk_score,
            priority=priority,
            assigned_person=f"Shift Supervisor ({inspection.location})",
            created_date=date.today().isoformat(),
            due_date=due,
            status="Assigned"
        )
        db.add(ca)
        db.commit()

        # Audit log for automatically created violation and CAPA
        record_audit_log(
            db=db,
            user=current_user.username,
            action="AUTO_VIOLATION_GENERATED",
            entity_type="Violation",
            entity_id=violation.violation_id,
            previous_value="",
            new_value=f"Risk: {violation.risk_score} ({violation.risk_category}), Escalation: {violation.escalation_level}",
            description=f"Auto-generated violation {violation.violation_id} and CAPA {ca.case_id} from inspection {inspection.inspection_id}"
        )

    # Audit log for inspection creation
    record_audit_log(
        db=db,
        user=current_user.username,
        action="INSPECTION_SUBMITTED",
        entity_type="Inspection",
        entity_id=inspection.inspection_id,
        previous_value="",
        new_value=f"Score: {inspection.overall_score}%, Violations: {eval_result['non_compliant_count']}",
        description=f"Submitted inspection {inspection.inspection_id} by {inspection.inspector_name} at {inspection.location}"
    )

    mine = db.query(Mine).filter(Mine.id == inspection.mine_id).first()
    return {
        "id": inspection.id,
        "inspection_id": inspection.inspection_id,
        "mine_id": inspection.mine_id,
        "mine_name": mine.name if mine else "N/A",
        "domain": inspection.domain,
        "location": inspection.location,
        "inspector_name": inspection.inspector_name,
        "inspection_date": inspection.inspection_date,
        "status": inspection.status,
        "overall_score": inspection.overall_score,
        "checklist_data": inspection.checklist_data or [],
        "comments": inspection.comments,
        "photos": inspection.photos or [],
        "risk_score": inspection.risk_score,
        "risk_category": inspection.risk_category,
        "created_at": inspection.created_at
    }
