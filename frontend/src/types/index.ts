export type Role = 'inspector' | 'manager' | 'admin' | 'auditor';

export interface User {
  id: number;
  username: string;
  full_name: string;
  role: Role;
  mine_id?: number;
  email?: string;
  phone?: string;
  is_active: boolean;
}

export interface Mine {
  id: number;
  code: string;
  name: string;
  location: string;
  state: string;
  latitude: number;
  longitude: number;
  mine_type: string;
  manager_name: string;
  total_workforce: number;
  daily_production_capacity: number;
  status: string;
  compliance_score?: number;
  open_violations?: number;
  risk_level?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface ComplianceRecord {
  id: number;
  record_id: string;
  mine_id: number;
  mine_name?: string;
  domain: 'Safety' | 'Environment' | 'Production' | 'Labour';
  requirement: string;
  description: string;
  inspection_date: string;
  due_date: string;
  responsible_person: string;
  status: 'Compliant' | 'Partially Compliant' | 'Non-Compliant' | 'Pending Verification';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  evidence?: string;
  risk_score: number;
  risk_category: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  corrective_action?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ChecklistItem {
  id: number;
  item: string;
  compliant: boolean;
  remarks?: string;
  severity?: 'Low' | 'Medium' | 'High' | 'Critical';
}

export interface Inspection {
  id: number;
  inspection_id: string;
  mine_id: number;
  mine_name?: string;
  domain: string;
  location: string;
  inspector_name: string;
  inspection_date: string;
  status: string;
  overall_score: number;
  checklist_data: ChecklistItem[];
  comments?: string;
  photos?: string[];
  risk_score: number;
  risk_category: string;
  created_at?: string;
}

export interface ContributingFactor {
  name: string;
  contribution: number;
  description: string;
}

export interface Violation {
  id: number;
  violation_id: string;
  inspection_id?: number;
  mine_id: number;
  mine_name?: string;
  domain: string;
  location: string;
  title: string;
  description: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  likelihood: 'Low' | 'Medium' | 'High' | 'Critical';
  recurrence_count: number;
  risk_score: number;
  risk_category: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  contributing_factors?: Record<string, any>;
  status: 'Open' | 'Action Assigned' | 'Resolved' | 'Escalated';
  escalation_level: string;
  reported_by: string;
  reported_date?: string;
}

export interface CorrectiveAction {
  id: number;
  case_id: string;
  violation_id?: number;
  mine_id: number;
  mine_name?: string;
  location: string;
  description: string;
  risk_score: number;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  assigned_person: string;
  created_date: string;
  due_date: string;
  status: 'Open' | 'Assigned' | 'In Progress' | 'Awaiting Verification' | 'Closed' | 'Reopened';
  completion_evidence?: string;
  evidence_url?: string;
  verification_notes?: string;
  verified_by?: string;
  closed_date?: string;
  is_overdue?: boolean;
}

export interface Contractor {
  id: number;
  contractor_id: string;
  name: string;
  mine_id: number;
  mine_name?: string;
  contact_person: string;
  contact_phone: string;
  contact_email: string;
  worker_count: number;
  compliance_score: number;
  active_contracts: string;
  safety_violations: number;
  pending_actions: number;
  status: string;
}

export interface Grievance {
  id: number;
  grievance_id: string;
  category: string;
  mine_id: number;
  mine_name?: string;
  description: string;
  submitted_by: string;
  submission_date: string;
  priority: string;
  assigned_person?: string;
  status: 'Submitted' | 'Under Review' | 'In Progress' | 'Resolved' | 'Rejected';
  resolution?: string;
  resolved_date?: string;
}

export interface AuditLog {
  id: number;
  event_id: string;
  timestamp: string;
  user: string;
  action: string;
  entity_type: string;
  entity_id: string;
  previous_value?: string;
  new_value?: string;
  description: string;
  prev_hash: string;
  hash: string;
}

export interface AuditIntegrity {
  is_valid: boolean;
  total_events: number;
  verified_events: number;
  tampered_event_id?: string;
  message: string;
  last_block_hash: string;
}

export interface DocumentItem {
  id: number;
  document_id: string;
  filename: string;
  file_path: string;
  file_type: string;
  upload_date: string;
  uploaded_by: string;
  mine_id?: number;
  mine_name?: string;
  related_entity_type?: string;
  related_entity_id?: string;
  ocr_text?: string;
  extracted_fields: Record<string, any>;
  ocr_status: string;
}

export interface RiskCalculationResult {
  risk_score: number;
  risk_category: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  color: string;
  contributing_factors: ContributingFactor[];
  recommendation: string;
  escalation_rule: string;
}
