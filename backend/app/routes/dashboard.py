from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, date
from typing import Dict, Any, List
from ..database import get_db
from ..models.models import Mine, Inspection, ComplianceRecord, Violation, CorrectiveAction, AuditLog

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/kpis")
def get_dashboard_kpis(db: Session = Depends(get_db)):
    total_mines = db.query(Mine).count()
    total_inspections = db.query(Inspection).count()
    
    compliance_records = db.query(ComplianceRecord).all()
    total_compliance_records = len(compliance_records)
    compliant_records = sum(1 for c in compliance_records if c.status == "Compliant")
    partially_compliant = sum(1 for c in compliance_records if c.status == "Partially Compliant")
    non_compliant_records = sum(1 for c in compliance_records if c.status == "Non-Compliant")
    pending_verification = sum(1 for c in compliance_records if c.status == "Pending Verification")

    open_violations = db.query(Violation).filter(Violation.status.in_(["Open", "Action Assigned", "Escalated"])).count()
    
    today_str = date.today().isoformat()
    corrective_actions = db.query(CorrectiveAction).all()
    overdue_actions = sum(
        1 for ca in corrective_actions 
        if ca.status not in ["Closed"] and ca.due_date and ca.due_date < today_str
    )

    critical_risk_cases = db.query(Violation).filter(
        (Violation.risk_category == "CRITICAL") | (Violation.risk_score >= 75.0)
    ).count()

    overall_compliance_pct = round(
        ((compliant_records + (partially_compliant * 0.5)) / max(total_compliance_records, 1)) * 100.0, 1
    ) if total_compliance_records > 0 else 100.0

    return {
        "total_mines": total_mines,
        "total_inspections": total_inspections,
        "total_compliance_records": total_compliance_records,
        "compliant_records": compliant_records,
        "partially_compliant_records": partially_compliant,
        "non_compliant_records": non_compliant_records,
        "pending_verification_records": pending_verification,
        "open_violations": open_violations,
        "overdue_corrective_actions": overdue_actions,
        "critical_risk_cases": critical_risk_cases,
        "overall_compliance_percentage": overall_compliance_pct
    }

@router.get("/charts")
def get_dashboard_charts(db: Session = Depends(get_db)):
    # 1. Compliance status distribution
    compliance_records = db.query(ComplianceRecord).all()
    status_counts = {"Compliant": 0, "Partially Compliant": 0, "Non-Compliant": 0, "Pending Verification": 0}
    for c in compliance_records:
        if c.status in status_counts:
            status_counts[c.status] += 1
        else:
            status_counts[c.status] = 1

    compliance_distribution = [
        {"name": k, "value": v} for k, v in status_counts.items()
    ]

    # 2. Violations by domain
    violations = db.query(Violation).all()
    domain_counts = {"Safety": 0, "Environment": 0, "Production": 0, "Labour": 0}
    for v in violations:
        if v.domain in domain_counts:
            domain_counts[v.domain] += 1
        else:
            domain_counts[v.domain] = 1

    violations_by_domain = [
        {"domain": k, "violations": v} for k, v in domain_counts.items()
    ]

    # 3. Monthly inspection trends (Simulated 6 months window)
    monthly_trends = [
        {"month": "Jun 2026", "inspections": 12, "violations": 4, "compliance_rate": 86.4},
        {"month": "Jul 2026", "inspections": 16, "violations": 7, "compliance_rate": 81.2},
        {"month": "Aug 2026", "inspections": 18, "violations": 5, "compliance_rate": 85.0},
        {"month": "Sep 2026", "inspections": 22, "violations": 9, "compliance_rate": 79.5},
        {"month": "Oct 2026", "inspections": 25, "violations": 8, "compliance_rate": 84.1},
        {"month": "Nov 2026", "inspections": max(len(db.query(Inspection).all()), 20), "violations": len(violations), "compliance_rate": 88.2}
    ]

    # 4. Risk distribution (Low, Medium, High, Critical)
    risk_counts = {"LOW": 0, "MEDIUM": 0, "HIGH": 0, "CRITICAL": 0}
    for v in violations:
        cat = (v.risk_category or "MEDIUM").upper()
        if cat in risk_counts:
            risk_counts[cat] += 1
        else:
            risk_counts["MEDIUM"] += 1

    risk_distribution = [
        {"category": "LOW", "count": risk_counts["LOW"], "color": "#16A34A"},
        {"category": "MEDIUM", "count": risk_counts["MEDIUM"], "color": "#D97706"},
        {"category": "HIGH", "count": risk_counts["HIGH"], "color": "#EA580C"},
        {"category": "CRITICAL", "count": risk_counts["CRITICAL"], "color": "#DC2626"}
    ]

    # 5. Mine-wise compliance comparison
    mines = db.query(Mine).all()
    mine_comparison = []
    for m in mines:
        mine_cmp = [c for c in compliance_records if c.mine_id == m.id]
        total_m_cmp = len(mine_cmp)
        comp_m = sum(1 for c in mine_cmp if c.status == "Compliant")
        comp_rate = round((comp_m / max(total_m_cmp, 1)) * 100.0, 1) if total_m_cmp > 0 else 85.0
        open_v = sum(1 for v in violations if v.mine_id == m.id and v.status in ["Open", "Action Assigned", "Escalated"])
        mine_comparison.append({
            "id": m.id,
            "name": m.name,
            "code": m.code,
            "compliance_rate": comp_rate,
            "open_violations": open_v,
            "risk_level": "CRITICAL" if comp_rate < 70 else ("HIGH" if comp_rate < 82 else "LOW")
        })

    # 6. Recurring violation trends
    recurring_trends = [
        {"category": "PPE Compliance", "occurrences": sum(1 for v in violations if "ppe" in v.title.lower()), "risk_impact": "High"},
        {"category": "Ventilation & Air Quality", "occurrences": sum(1 for v in violations if "ventilation" in v.title.lower() or "gas" in v.title.lower()), "risk_impact": "Critical"},
        {"category": "Haul Road Dust Suppression", "occurrences": sum(1 for v in violations if "dust" in v.title.lower()), "risk_impact": "Medium"},
        {"category": "Hydraulic Prop Support", "occurrences": sum(1 for v in violations if "support" in v.title.lower() or "roof" in v.title.lower() or "prop" in v.title.lower()), "risk_impact": "High"},
        {"category": "Contractor Vocational Training", "occurrences": sum(1 for v in violations if "training" in v.title.lower() or "contractor" in v.title.lower()), "risk_impact": "Medium"}
    ]

    return {
        "compliance_distribution": compliance_distribution,
        "violations_by_domain": violations_by_domain,
        "monthly_trends": monthly_trends,
        "risk_distribution": risk_distribution,
        "mine_comparison": mine_comparison,
        "recurring_trends": recurring_trends
    }

@router.get("/recent-activity")
def get_recent_activity(db: Session = Depends(get_db)):
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(15).all()
    activity = []
    for l in logs:
        activity.append({
            "id": l.event_id,
            "timestamp": l.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
            "user": l.user,
            "action": l.action,
            "entity_type": l.entity_type,
            "entity_id": l.entity_id,
            "description": l.description,
            "hash": l.hash[:12] + "..."
        })
    return activity

@router.get("/alerts")
def get_dashboard_alerts(db: Session = Depends(get_db)):
    alerts = []
    
    # 1. Critical risk violations
    critical_violations = db.query(Violation).filter(
        (Violation.risk_category == "CRITICAL") | (Violation.risk_score >= 75.0),
        Violation.status.in_(["Open", "Action Assigned", "Escalated"])
    ).all()
    for v in critical_violations:
        alerts.append({
            "id": f"ALT-CRIT-{v.violation_id}",
            "type": "CRITICAL_RISK",
            "level": "CRITICAL",
            "title": f"Critical Violation: {v.title}",
            "message": f"{v.mine.name if v.mine else 'Mine'}: {v.description} (Risk: {v.risk_score:.0f}/100)",
            "escalation_level": v.escalation_level,
            "entity_type": "Violation",
            "entity_id": v.violation_id,
            "timestamp": v.reported_date.strftime("%Y-%m-%d %H:%M") if v.reported_date else "Recent"
        })

    # 2. Overdue CAPA
    today_str = date.today().isoformat()
    overdue_capas = db.query(CorrectiveAction).filter(
        CorrectiveAction.status != "Closed",
        CorrectiveAction.due_date < today_str
    ).all()
    for ca in overdue_capas:
        alerts.append({
            "id": f"ALT-OVD-{ca.case_id}",
            "type": "OVERDUE_CAPA",
            "level": "HIGH",
            "title": f"Overdue Corrective Action: {ca.case_id}",
            "message": f"Action assigned to {ca.assigned_person} at {ca.location} was due on {ca.due_date}.",
            "escalation_level": "Level 2 - Mine General Manager",
            "entity_type": "CorrectiveAction",
            "entity_id": ca.case_id,
            "timestamp": ca.created_date
        })

    return alerts
