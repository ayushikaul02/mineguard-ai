from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)
    role = Column(String(50), nullable=False)  # inspector, manager, admin, auditor
    mine_id = Column(Integer, ForeignKey("mines.id"), nullable=True)
    email = Column(String(100), nullable=True)
    phone = Column(String(30), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    mine = relationship("Mine", back_populates="users")


class Mine(Base):
    __tablename__ = "mines"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(20), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    location = Column(String(150), nullable=False)
    state = Column(String(50), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    mine_type = Column(String(50), nullable=False)  # Underground, Opencast, Mixed
    manager_name = Column(String(100), nullable=False)
    total_workforce = Column(Integer, default=0)
    daily_production_capacity = Column(Float, default=0.0)  # in tonnes
    status = Column(String(50), default="Active")  # Active, Under Maintenance, Restricted
    created_at = Column(DateTime, default=datetime.utcnow)

    users = relationship("User", back_populates="mine")
    compliance_records = relationship("ComplianceRecord", back_populates="mine")
    inspections = relationship("Inspection", back_populates="mine")
    violations = relationship("Violation", back_populates="mine")
    corrective_actions = relationship("CorrectiveAction", back_populates="mine")
    contractors = relationship("Contractor", back_populates="mine")
    grievances = relationship("Grievance", back_populates="mine")
    documents = relationship("Document", back_populates="mine")


class ComplianceRecord(Base):
    __tablename__ = "compliance_records"

    id = Column(Integer, primary_key=True, index=True)
    record_id = Column(String(30), unique=True, index=True, nullable=False)
    mine_id = Column(Integer, ForeignKey("mines.id"), nullable=False)
    domain = Column(String(50), nullable=False)  # Safety, Environment, Production, Labour
    requirement = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    inspection_date = Column(String(20), nullable=False)
    due_date = Column(String(20), nullable=False)
    responsible_person = Column(String(100), nullable=False)
    status = Column(String(50), default="Pending Verification")  # Compliant, Partially Compliant, Non-Compliant, Pending Verification
    severity = Column(String(20), default="Medium")  # Low, Medium, High, Critical
    evidence = Column(Text, nullable=True)
    risk_score = Column(Float, default=0.0)
    risk_category = Column(String(20), default="LOW")  # LOW, MEDIUM, HIGH, CRITICAL
    corrective_action = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    mine = relationship("Mine", back_populates="compliance_records")


class Inspection(Base):
    __tablename__ = "inspections"

    id = Column(Integer, primary_key=True, index=True)
    inspection_id = Column(String(30), unique=True, index=True, nullable=False)
    mine_id = Column(Integer, ForeignKey("mines.id"), nullable=False)
    domain = Column(String(50), nullable=False)  # Safety, Environment, Production, Labour
    location = Column(String(150), nullable=False)
    inspector_name = Column(String(100), nullable=False)
    inspection_date = Column(String(20), nullable=False)
    status = Column(String(50), default="Completed")  # Completed, Violations Found, Pending Review
    overall_score = Column(Float, default=100.0)
    checklist_data = Column(JSON, default=list)  # list of items: [{id, item, compliant, remarks, severity}]
    comments = Column(Text, nullable=True)
    photos = Column(JSON, default=list)
    risk_score = Column(Float, default=0.0)
    risk_category = Column(String(20), default="LOW")
    created_at = Column(DateTime, default=datetime.utcnow)

    mine = relationship("Mine", back_populates="inspections")
    violations = relationship("Violation", back_populates="inspection")


class Violation(Base):
    __tablename__ = "violations"

    id = Column(Integer, primary_key=True, index=True)
    violation_id = Column(String(30), unique=True, index=True, nullable=False)
    inspection_id = Column(Integer, ForeignKey("inspections.id"), nullable=True)
    mine_id = Column(Integer, ForeignKey("mines.id"), nullable=False)
    domain = Column(String(50), nullable=False)
    location = Column(String(150), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    severity = Column(String(20), default="Medium")  # Low, Medium, High, Critical
    likelihood = Column(String(20), default="Medium")  # Low, Medium, High, Critical
    recurrence_count = Column(Integer, default=1)
    risk_score = Column(Float, default=0.0)
    risk_category = Column(String(20), default="MEDIUM")
    contributing_factors = Column(JSON, default=dict)
    status = Column(String(50), default="Open")  # Open, Action Assigned, Resolved, Escalated
    escalation_level = Column(String(100), default="Level 1 - Mine Level")  # Level 1 - Mine Level, Level 2 - Regional Director, Level 3 - Regulatory Authority
    reported_by = Column(String(100), nullable=False)
    reported_date = Column(DateTime, default=datetime.utcnow)

    mine = relationship("Mine", back_populates="violations")
    inspection = relationship("Inspection", back_populates="violations")
    corrective_actions = relationship("CorrectiveAction", back_populates="violation")


class CorrectiveAction(Base):
    __tablename__ = "corrective_actions"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(String(30), unique=True, index=True, nullable=False)
    violation_id = Column(Integer, ForeignKey("violations.id"), nullable=True)
    mine_id = Column(Integer, ForeignKey("mines.id"), nullable=False)
    location = Column(String(150), nullable=False)
    description = Column(Text, nullable=False)
    risk_score = Column(Float, default=0.0)
    priority = Column(String(20), default="Medium")  # Low, Medium, High, Critical
    assigned_person = Column(String(100), nullable=False)
    created_date = Column(String(20), nullable=False)
    due_date = Column(String(20), nullable=False)
    status = Column(String(50), default="Open")  # Open, Assigned, In Progress, Awaiting Verification, Closed, Reopened
    completion_evidence = Column(Text, nullable=True)
    evidence_url = Column(String(255), nullable=True)
    verification_notes = Column(Text, nullable=True)
    verified_by = Column(String(100), nullable=True)
    closed_date = Column(String(20), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    mine = relationship("Mine", back_populates="corrective_actions")
    violation = relationship("Violation", back_populates="corrective_actions")


class Contractor(Base):
    __tablename__ = "contractors"

    id = Column(Integer, primary_key=True, index=True)
    contractor_id = Column(String(30), unique=True, index=True, nullable=False)
    name = Column(String(150), nullable=False)
    mine_id = Column(Integer, ForeignKey("mines.id"), nullable=False)
    contact_person = Column(String(100), nullable=False)
    contact_phone = Column(String(30), nullable=False)
    contact_email = Column(String(100), nullable=False)
    worker_count = Column(Integer, default=0)
    compliance_score = Column(Float, default=100.0)
    active_contracts = Column(String(200), nullable=False)
    safety_violations = Column(Integer, default=0)
    pending_actions = Column(Integer, default=0)
    status = Column(String(50), default="Compliant")  # Compliant, Active, Probation, Suspended
    created_at = Column(DateTime, default=datetime.utcnow)

    mine = relationship("Mine", back_populates="contractors")


class Grievance(Base):
    __tablename__ = "grievances"

    id = Column(Integer, primary_key=True, index=True)
    grievance_id = Column(String(30), unique=True, index=True, nullable=False)
    category = Column(String(100), nullable=False)  # Worker safety, Labour welfare, Environmental issues, Equipment, Facilities, Other
    mine_id = Column(Integer, ForeignKey("mines.id"), nullable=False)
    description = Column(Text, nullable=False)
    submitted_by = Column(String(100), nullable=False)
    submission_date = Column(String(20), nullable=False)
    priority = Column(String(20), default="Medium")  # Low, Medium, High, Critical
    assigned_person = Column(String(100), nullable=True)
    status = Column(String(50), default="Submitted")  # Submitted, Under Review, In Progress, Resolved, Rejected
    resolution = Column(Text, nullable=True)
    resolved_date = Column(String(20), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    mine = relationship("Mine", back_populates="grievances")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(String(30), unique=True, index=True, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    user = Column(String(100), nullable=False)
    action = Column(String(100), nullable=False)  # CREATE, UPDATE, STATUS_CHANGE, ESCALATION, VERIFICATION, CLOSURE, REOPEN, DOCUMENT_UPLOAD
    entity_type = Column(String(100), nullable=False)  # Compliance, Inspection, Violation, CorrectiveAction, Grievance, Document, Contractor
    entity_id = Column(String(50), nullable=False)
    previous_value = Column(Text, nullable=True)
    new_value = Column(Text, nullable=True)
    description = Column(Text, nullable=False)
    prev_hash = Column(String(64), nullable=False)
    hash = Column(String(64), nullable=False)


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(String(30), unique=True, index=True, nullable=False)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False)
    upload_date = Column(DateTime, default=datetime.utcnow)
    uploaded_by = Column(String(100), nullable=False)
    mine_id = Column(Integer, ForeignKey("mines.id"), nullable=True)
    related_entity_type = Column(String(50), nullable=True)
    related_entity_id = Column(String(50), nullable=True)
    ocr_text = Column(Text, nullable=True)
    extracted_fields = Column(JSON, default=dict)
    ocr_status = Column(String(50), default="Success")  # Success, Fallback Extracted, Processing, Failed

    mine = relationship("Mine", back_populates="documents")
