from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas.schemas import RiskCalculationRequest, RiskCalculationResponse
from ..services.risk_engine import calculate_risk_score
from ..services.ml_service import ml_detector
from ..models.models import Mine, Violation

router = APIRouter(prefix="/ai", tags=["AI & Machine Learning"])

@router.post("/calculate-risk", response_model=RiskCalculationResponse)
def compute_risk_assessment(payload: RiskCalculationRequest):
    result = calculate_risk_score(
        severity=payload.severity,
        likelihood=payload.likelihood,
        recurrence_count=payload.recurrence_count,
        days_overdue=payload.days_overdue,
        location_history_violations=payload.location_history_violations,
        contractor_violations=payload.contractor_violations,
        deadline_proximity_days=payload.deadline_proximity_days
    )
    return result

@router.get("/insights")
def get_ai_ml_insights(db: Session = Depends(get_db)):
    """
    Executes machine learning anomaly detection and recurrence clustering
    across all active database records.
    """
    return ml_detector.analyze_database_records(db)

@router.get("/hotspots")
def get_risk_hotspots(db: Session = Depends(get_db)):
    """
    Returns geographical violation clusters mapped to mine coordinates.
    """
    analysis = ml_detector.analyze_database_records(db)
    hotspots = analysis.get("hotspots", [])
    
    # Enrich with mine coordinates
    mines_map = {m.id: m for m in db.query(Mine).all()}
    enriched_hotspots = []
    for h in hotspots:
        m = mines_map.get(h["mine_id"])
        if m:
            enriched_hotspots.append({
                **h,
                "latitude": m.latitude,
                "longitude": m.longitude,
                "mine_code": m.code,
                "mine_state": m.state
            })
    return enriched_hotspots
