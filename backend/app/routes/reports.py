from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session
from typing import Optional
from ..database import get_db
from ..services.report_service import generate_csv_report, generate_pdf_report

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/export/csv")
def export_csv_report(
    report_type: str = Query("compliance", description="compliance, violations, corrective_actions, contractors, mines"),
    mine_id: Optional[int] = None,
    domain: Optional[str] = None,
    db: Session = Depends(get_db)
):
    csv_data = generate_csv_report(report_type=report_type, db=db, mine_id=mine_id, domain=domain)
    filename = f"mineguard_{report_type}_report.csv"
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/export/pdf")
def export_pdf_report(
    report_type: str = Query("compliance", description="compliance, violations, corrective_actions"),
    mine_id: Optional[int] = None,
    domain: Optional[str] = None,
    db: Session = Depends(get_db)
):
    pdf_bytes = generate_pdf_report(report_type=report_type, db=db, mine_id=mine_id, domain=domain)
    filename = f"mineguard_{report_type}_report.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
