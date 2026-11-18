from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# Token & Auth
class Token(BaseModel):
    access_token: str
    token_type: str
    user: Dict[str, Any]

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str

class UserCreate(BaseModel):
    username: str
    password: str
    full_name: str
    role: str  # inspector, manager, admin, auditor
    mine_id: Optional[int] = None
    email: Optional[str] = None
    phone: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    username: str
    full_name: str
    role: str
    mine_id: Optional[int] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    is_active: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Mine
class MineBase(BaseModel):
    code: str
    name: str
    location: str
    state: str
    latitude: float
    longitude: float
    mine_type: str
    manager_name: str
    total_workforce: int
    daily_production_capacity: float
    status: str = "Active"

class MineCreate(MineBase):
    pass

class MineResponse(MineBase):
    id: int
    created_at: Optional[datetime] = None
    compliance_score: Optional[float] = 0.0
    open_violations: Optional[int] = 0
    risk_level: Optional[str] = "LOW"

    class Config:
        from_attributes = True


# Compliance Record
class ComplianceRecordBase(BaseModel):
    mine_id: int
    domain: str  # Safety, Environment, Production, Labour
    requirement: str
    description: str
    inspection_date: str
    due_date: str
    responsible_person: str
    status: str = "Pending Verification"  # Compliant, Partially Compliant, Non-Compliant, Pending Verification
    severity: str = "Medium"  # Low, Medium, High, Critical
    evidence: Optional[str] = None
    risk_score: Optional[float] = 0.0
    risk_category: Optional[str] = "LOW"
    corrective_action: Optional[str] = None

class ComplianceRecordCreate(ComplianceRecordBase):
    record_id: Optional[str] = None

class ComplianceRecordUpdate(BaseModel):
    domain: Optional[str] = None
    requirement: Optional[str] = None
    description: Optional[str] = None
    inspection_date: Optional[str] = None
    due_date: Optional[str] = None
    responsible_person: Optional[str] = None
    status: Optional[str] = None
    severity: Optional[str] = None
    evidence: Optional[str] = None
    risk_score: Optional[float] = None
    risk_category: Optional[str] = None
    corrective_action: Optional[str] = None

class ComplianceRecordResponse(ComplianceRecordBase):
    id: int
    record_id: str
    mine_name: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Field Inspection
class ChecklistItem(BaseModel):
    id: int
    item: str
    compliant: bool
    remarks: Optional[str] = ""
    severity: Optional[str] = "Low"

class InspectionCreate(BaseModel):
    mine_id: int
    domain: str
    location: str
    inspector_name: str
    inspection_date: str
    checklist_data: List[ChecklistItem]
    comments: Optional[str] = ""
    photos: Optional[List[str]] = []

class InspectionResponse(BaseModel):
    id: int
    inspection_id: str
    mine_id: int
    mine_name: Optional[str] = None
    domain: str
    location: str
    inspector_name: str
    inspection_date: str
    status: str
    overall_score: float
    checklist_data: List[Dict[str, Any]]
    comments: Optional[str] = None
    photos: Optional[List[str]] = []
    risk_score: float
    risk_category: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Violation
class ViolationBase(BaseModel):
    mine_id: int
    domain: str
    location: str
    title: str
    description: str
    severity: str = "Medium"
    likelihood: str = "Medium"
    recurrence_count: int = 1
    risk_score: Optional[float] = 0.0
    risk_category: Optional[str] = "MEDIUM"
    contributing_factors: Optional[Any] = None
    status: str = "Open"
    escalation_level: str = "Level 1 - Mine Level"
    reported_by: str

class ViolationCreate(ViolationBase):
    violation_id: Optional[str] = None
    inspection_id: Optional[int] = None
    compliance_record_id: Optional[int] = None

class ViolationUpdate(BaseModel):
    status: Optional[str] = None
    escalation_level: Optional[str] = None
    severity: Optional[str] = None
    description: Optional[str] = None

class ViolationResponse(ViolationBase):
    id: int
    violation_id: str
    inspection_id: Optional[int] = None
    mine_name: Optional[str] = None
    reported_date: Optional[datetime] = None

    class Config:
        from_attributes = True


# Corrective Action
class CorrectiveActionBase(BaseModel):
    mine_id: int
    location: str
    description: str
    risk_score: float = 0.0
    priority: str = "Medium"
    assigned_person: str
    due_date: str

class CorrectiveActionCreate(CorrectiveActionBase):
    case_id: Optional[str] = None
    violation_id: Optional[int] = None
    created_date: Optional[str] = None

class CorrectiveActionTransition(BaseModel):
    status: str  # Assigned, In Progress, Awaiting Verification, Closed, Reopened
    completion_evidence: Optional[str] = None
    evidence_url: Optional[str] = None
    verification_notes: Optional[str] = None
    verified_by: Optional[str] = None

class CorrectiveActionResponse(CorrectiveActionBase):
    id: int
    case_id: str
    violation_id: Optional[int] = None
    mine_name: Optional[str] = None
    created_date: str
    status: str
    completion_evidence: Optional[str] = None
    evidence_url: Optional[str] = None
    verification_notes: Optional[str] = None
    verified_by: Optional[str] = None
    closed_date: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    is_overdue: Optional[bool] = False

    class Config:
        from_attributes = True


# Contractor
class ContractorBase(BaseModel):
    name: str
    mine_id: int
    contact_person: str
    contact_phone: str
    contact_email: str
    worker_count: int
    compliance_score: float = 100.0
    active_contracts: str
    safety_violations: int = 0
    pending_actions: int = 0
    status: str = "Compliant"

class ContractorCreate(ContractorBase):
    contractor_id: Optional[str] = None

class ContractorUpdate(BaseModel):
    name: Optional[str] = None
    mine_id: Optional[int] = None
    contact_person: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    worker_count: Optional[int] = None
    compliance_score: Optional[float] = None
    active_contracts: Optional[str] = None
    safety_violations: Optional[int] = None
    pending_actions: Optional[int] = None
    status: Optional[str] = None

class ContractorResponse(ContractorBase):
    id: int
    contractor_id: str
    mine_name: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Grievance
class GrievanceBase(BaseModel):
    category: str
    mine_id: int
    description: str
    submitted_by: str
    submission_date: str
    priority: str = "Medium"
    assigned_person: Optional[str] = None

class GrievanceCreate(GrievanceBase):
    grievance_id: Optional[str] = None

class GrievanceUpdate(BaseModel):
    assigned_person: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    resolution: Optional[str] = None

class GrievanceResponse(GrievanceBase):
    id: int
    grievance_id: str
    mine_name: Optional[str] = None
    status: str
    resolution: Optional[str] = None
    resolved_date: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Audit Log
class AuditLogResponse(BaseModel):
    id: int
    event_id: str
    timestamp: datetime
    user: str
    action: str
    entity_type: str
    entity_id: str
    previous_value: Optional[str] = None
    new_value: Optional[str] = None
    description: str
    prev_hash: str
    hash: str

    class Config:
        from_attributes = True

class AuditIntegrityResponse(BaseModel):
    is_valid: bool
    total_events: int
    verified_events: int
    tampered_event_id: Optional[str] = None
    message: str
    last_block_hash: str


# Document
class DocumentResponse(BaseModel):
    id: int
    document_id: str
    filename: str
    file_path: str
    file_type: str
    upload_date: datetime
    uploaded_by: str
    mine_id: Optional[int] = None
    mine_name: Optional[str] = None
    related_entity_type: Optional[str] = None
    related_entity_id: Optional[str] = None
    ocr_text: Optional[str] = None
    extracted_fields: Dict[str, Any]
    ocr_status: str

    class Config:
        from_attributes = True


# AI & ML
class RiskCalculationRequest(BaseModel):
    severity: str  # Low, Medium, High, Critical
    likelihood: str  # Low, Medium, High, Critical
    recurrence_count: int = 1
    days_overdue: int = 0
    location_history_violations: int = 0
    contractor_violations: int = 0
    deadline_proximity_days: int = 7

class RiskFactorBreakdown(BaseModel):
    name: str
    contribution: float
    description: str

class RiskCalculationResponse(BaseModel):
    risk_score: float
    risk_category: str  # LOW, MEDIUM, HIGH, CRITICAL
    color: str
    contributing_factors: List[RiskFactorBreakdown]
    recommendation: str
    escalation_rule: str
