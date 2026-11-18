import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..config import settings
from ..models.models import Document, Mine, ComplianceRecord, Violation, User
from ..schemas.schemas import DocumentResponse
from ..auth import get_current_user, require_roles
from ..services.ocr_service import process_document_ocr
from ..services.audit_service import record_audit_log
from ..services.risk_engine import calculate_risk_score

router = APIRouter(prefix="/documents", tags=["Document Digitization"])

@router.get("", response_model=List[DocumentResponse])
def get_documents(
    db: Session = Depends(get_db),
    mine_id: Optional[int] = None
):
    query = db.query(Document)
    if mine_id:
        query = query.filter(Document.mine_id == mine_id)
    docs = query.order_by(Document.id.desc()).all()
    res = []
    for d in docs:
        res.append({
            "id": d.id,
            "document_id": d.document_id,
            "filename": d.filename,
            "file_path": d.file_path,
            "file_type": d.file_type,
            "upload_date": d.upload_date,
            "uploaded_by": d.uploaded_by,
            "mine_id": d.mine_id,
            "mine_name": d.mine.name if d.mine else "N/A",
            "related_entity_type": d.related_entity_type,
            "related_entity_id": d.related_entity_id,
            "ocr_text": d.ocr_text,
            "extracted_fields": d.extracted_fields or {},
            "ocr_status": d.ocr_status
        })
    return res

@router.get("/{doc_id}", response_model=DocumentResponse)
def get_document(doc_id: int, db: Session = Depends(get_db)):
    d = db.query(Document).filter(Document.id == doc_id).first()
    if not d:
        raise HTTPException(status_code=404, detail="Document not found")
    return {
        "id": d.id,
        "document_id": d.document_id,
        "filename": d.filename,
        "file_path": d.file_path,
        "file_type": d.file_type,
        "upload_date": d.upload_date,
        "uploaded_by": d.uploaded_by,
        "mine_id": d.mine_id,
        "mine_name": d.mine.name if d.mine else "N/A",
        "related_entity_type": d.related_entity_type,
        "related_entity_id": d.related_entity_id,
        "ocr_text": d.ocr_text,
        "extracted_fields": d.extracted_fields or {},
        "ocr_status": d.ocr_status
    }

@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    mine_id: Optional[int] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    count = db.query(Document).count() + 1
    custom_doc_id = f"DOC-2026-{count:04d}"

    # Save physical file to uploads directory
    file_ext = os.path.splitext(file.filename)[1]
    safe_filename = f"{custom_doc_id}_{file.filename}"
    file_dest = os.path.join(settings.UPLOAD_DIR, safe_filename)

    with open(file_dest, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Process through OCR service
    ocr_result = process_document_ocr(file_dest, file.filename)

    doc = Document(
        document_id=custom_doc_id,
        filename=file.filename,
        file_path=f"/uploads/{safe_filename}",
        file_type=file_ext,
        uploaded_by=current_user.full_name or current_user.username,
        mine_id=mine_id or 1,
        ocr_text=ocr_result["extracted_text"],
        extracted_fields=ocr_result["extracted_fields"],
        ocr_status=ocr_result["ocr_status"]
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    record_audit_log(
        db=db,
        user=current_user.username,
        action="DOCUMENT_DIGITIZED",
        entity_type="Document",
        entity_id=doc.document_id,
        previous_value="",
        new_value=f"File: {file.filename}, Status: {doc.ocr_status}",
        description=f"Digitized statutory document {doc.document_id} via {ocr_result['ocr_engine']}"
    )

    mine = db.query(Mine).filter(Mine.id == doc.mine_id).first()
    return {
        "id": doc.id,
        "document_id": doc.document_id,
        "filename": doc.filename,
        "file_path": doc.file_path,
        "file_type": doc.file_type,
        "upload_date": doc.upload_date,
        "uploaded_by": doc.uploaded_by,
        "mine_id": doc.mine_id,
        "mine_name": mine.name if mine else "N/A",
        "related_entity_type": doc.related_entity_type,
        "related_entity_id": doc.related_entity_id,
        "ocr_text": doc.ocr_text,
        "extracted_fields": doc.extracted_fields or {},
        "ocr_status": doc.ocr_status
    }

@router.post("/{doc_id}/convert")
def convert_document_to_record(
    doc_id: int,
    target_type: str = "Compliance",  # Compliance or Violation
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["inspector", "manager", "admin"]))
):
    """
    Converts extracted statutory fields into a formal live Compliance or Violation record.
    """
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    fields = doc.extracted_fields or {}
    domain = fields.get("domain", "Safety")
    severity = fields.get("estimated_severity", "Medium")
    status = fields.get("compliance_status", "Pending Verification")

    if target_type == "Violation" or status == "Non-Compliant":
        count = db.query(Violation).count() + 1
        v_id = f"VIO-2026-{count:04d}"
        risk = calculate_risk_score(severity=severity, likelihood="High")
        
        v = Violation(
            violation_id=v_id,
            mine_id=doc.mine_id or 1,
            domain=domain,
            location="Identified via Digitized Statutory Document",
            title=f"Breach from {doc.filename}",
            description=f"Extracted finding: {fields.get('document_type', 'Statutory Doc')}. Notes: {fields.get('key_observations', [''])[0]}",
            severity=severity,
            likelihood="High",
            risk_score=risk["risk_score"],
            risk_category=risk["risk_category"],
            contributing_factors=risk.get("contributing_factors", {}),
            status="Action Assigned",
            reported_by=current_user.username
        )
        db.add(v)
        doc.related_entity_type = "Violation"
        doc.related_entity_id = v.violation_id
        db.commit()

        record_audit_log(
            db=db,
            user=current_user.username,
            action="DOC_CONVERTED_TO_VIOLATION",
            entity_type="Violation",
            entity_id=v.violation_id,
            previous_value=doc.document_id,
            new_value=v.violation_id,
            description=f"Converted digitized document {doc.document_id} to Violation {v.violation_id}"
        )
        return {"message": f"Successfully created Violation {v.violation_id}", "entity_id": v.violation_id, "entity_type": "Violation"}

    else:
        count = db.query(ComplianceRecord).count() + 1
        c_id = f"CMP-2026-{count:04d}"
        risk = calculate_risk_score(severity=severity, likelihood="Low")

        c = ComplianceRecord(
            record_id=c_id,
            mine_id=doc.mine_id or 1,
            domain=domain,
            requirement=f"Statutory Filing: {fields.get('document_type', 'DGMS Document')}",
            description=f"Digitized certification for {doc.filename}. Authority: {fields.get('certifying_inspector', 'DGMS')}",
            inspection_date=fields.get("inspection_date", "2026-11-15"),
            due_date="2027-03-31",
            responsible_person=fields.get("certifying_inspector", "Statutory Officer"),
            status=status,
            severity=severity,
            evidence=doc.file_path,
            risk_score=risk["risk_score"],
            risk_category=risk["risk_category"]
        )
        db.add(c)
        doc.related_entity_type = "ComplianceRecord"
        doc.related_entity_id = c.record_id
        db.commit()

        record_audit_log(
            db=db,
            user=current_user.username,
            action="DOC_CONVERTED_TO_COMPLIANCE",
            entity_type="ComplianceRecord",
            entity_id=c.record_id,
            previous_value=doc.document_id,
            new_value=c.record_id,
            description=f"Converted digitized document {doc.document_id} to Compliance Record {c.record_id}"
        )
        return {"message": f"Successfully created Compliance Record {c.record_id}", "entity_id": c.record_id, "entity_type": "ComplianceRecord"}
