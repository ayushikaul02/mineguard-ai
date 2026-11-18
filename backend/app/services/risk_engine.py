"""
AI-Based Risk Scoring Engine for Coal Mine Governance & Multi-Domain Compliance Monitoring.
Implements the exact weighted formula and normalizations specified in the patent architecture.
"""
from typing import Dict, Any, List

SEVERITY_WEIGHTS = {
    "Low": 25.0,
    "Medium": 50.0,
    "High": 80.0,
    "Critical": 100.0
}

LIKELIHOOD_WEIGHTS = {
    "Low": 20.0,
    "Medium": 50.0,
    "High": 80.0,
    "Critical": 100.0
}

def calculate_risk_score(
    severity: str = "Medium",
    likelihood: str = "Medium",
    recurrence_count: int = 1,
    days_overdue: int = 0,
    location_history_violations: int = 0,
    contractor_violations: int = 0,
    deadline_proximity_days: int = 7
) -> Dict[str, Any]:
    """
    Formula:
    Risk Score = (Severity * 0.30) +
                 (Likelihood * 0.25) +
                 (Recurrence * 0.15) +
                 (Overdue Factor * 0.15) +
                 (Contractor/Location History * 0.15)
                 
    All component scores are normalized to 0-100 before weighting.
    Final Risk Score is clamped between 0 and 100.
    """
    # 1. Severity component (0-100) -> weight: 0.30
    sev_raw = SEVERITY_WEIGHTS.get(severity.capitalize(), 50.0)
    sev_contrib = round(sev_raw * 0.30, 1)

    # 2. Likelihood component (0-100) -> weight: 0.25
    like_raw = LIKELIHOOD_WEIGHTS.get(likelihood.capitalize(), 50.0)
    like_contrib = round(like_raw * 0.25, 1)

    # 3. Recurrence component (0-100) -> weight: 0.15
    # 1 violation = 20, 2 = 50, 3 = 80, >=4 = 100
    if recurrence_count <= 1:
        rec_raw = 20.0
    elif recurrence_count == 2:
        rec_raw = 55.0
    elif recurrence_count == 3:
        rec_raw = 85.0
    else:
        rec_raw = 100.0
    rec_contrib = round(rec_raw * 0.15, 1)

    # 4. Overdue Factor (0-100) -> weight: 0.15
    # Not overdue but close to deadline (<3 days) = 30, overdue 1-5 days = 60, >5 days = 100
    if days_overdue > 7:
        overdue_raw = 100.0
    elif days_overdue > 0:
        overdue_raw = 40.0 + min(days_overdue * 8.0, 55.0)
    elif deadline_proximity_days <= 2:
        overdue_raw = 35.0
    elif deadline_proximity_days <= 5:
        overdue_raw = 20.0
    else:
        overdue_raw = 5.0
    overdue_contrib = round(overdue_raw * 0.15, 1)

    # 5. Contractor / Location History (0-100) -> weight: 0.15
    history_events = location_history_violations + (contractor_violations * 1.5)
    if history_events == 0:
        hist_raw = 15.0
    elif history_events <= 2:
        hist_raw = 45.0
    elif history_events <= 5:
        hist_raw = 75.0
    else:
        hist_raw = 100.0
    hist_contrib = round(hist_raw * 0.15, 1)

    # Total weighted score
    total_score = round(sev_contrib + like_contrib + rec_contrib + overdue_contrib + hist_contrib, 1)
    total_score = min(max(total_score, 0.0), 100.0)

    # Classification
    if total_score >= 75.0:
        risk_category = "CRITICAL"
        color = "#DC2626"  # Red
        recommendation = "Immediate stop-work order or senior executive intervention required within 4 hours. Daily DGMS statutory compliance update required."
        escalation_rule = "Escalated to Level 3 - Corporate Director & DGMS Regulatory Liaison"
    elif total_score >= 50.0:
        risk_category = "HIGH"
        color = "#EA580C"  # Orange/Amber
        recommendation = "Mine General Manager and Safety Officer must be immediately notified. Expedited Corrective Action required within 24 hours."
        escalation_rule = "Escalated to Level 2 - Mine General Manager & Safety Head"
    elif total_score >= 25.0:
        risk_category = "MEDIUM"
        color = "#D97706"  # Yellow/Amber
        recommendation = "Assign local shift in-charge corrective action. Review during next shift change briefing and weekly safety committee."
        escalation_rule = "Level 1 - Shift Safety Supervisor & Local Mine In-Charge"
    else:
        risk_category = "LOW"
        color = "#16A34A"  # Green
        recommendation = "Routine maintenance and continuous statutory monitoring. No escalation needed."
        escalation_rule = "Routine Monitoring - Standard Shift Log"

    contributing_factors = [
        {
            "name": f"Severity Impact ({severity})",
            "contribution": sev_contrib,
            "description": f"Baseline severity weight normalized to {sev_raw:.0f} (weight 30%)"
        },
        {
            "name": f"Likelihood of Incident ({likelihood})",
            "contribution": like_contrib,
            "description": f"Occurrence probability normalized to {like_raw:.0f} (weight 25%)"
        },
        {
            "name": f"Violation Recurrence (Count: {recurrence_count})",
            "contribution": rec_contrib,
            "description": f"Repeat observation factor normalized to {rec_raw:.0f} (weight 15%)"
        },
        {
            "name": f"Overdue & Timeline Factor ({days_overdue} days overdue)",
            "contribution": overdue_contrib,
            "description": f"Timeline urgency normalized to {overdue_raw:.0f} (weight 15%)"
        },
        {
            "name": f"Location & Contractor Risk History ({int(history_events)} prior issues)",
            "contribution": hist_contrib,
            "description": f"Historical hotspot and contractor reliability normalized to {hist_raw:.0f} (weight 15%)"
        }
    ]

    return {
        "risk_score": total_score,
        "risk_category": risk_category,
        "color": color,
        "contributing_factors": contributing_factors,
        "recommendation": recommendation,
        "escalation_rule": escalation_rule
    }


def evaluate_inspection_risk(checklist_items: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Evaluates an inspection submission based on non-compliant items,
    computes checklist score (0-100%), overall risk score, and determines violations.
    """
    total_items = len(checklist_items)
    if total_items == 0:
        return {
            "overall_score": 100.0,
            "risk_score": 0.0,
            "risk_category": "LOW",
            "non_compliant_count": 0,
            "violations_to_create": []
        }

    non_compliant = [item for item in checklist_items if not item.get("compliant", True)]
    passed_items = total_items - len(non_compliant)
    score_percentage = round((passed_items / total_items) * 100.0, 1)

    # Calculate aggregate severity
    crit_count = sum(1 for item in non_compliant if item.get("severity") == "Critical")
    high_count = sum(1 for item in non_compliant if item.get("severity") == "High")
    med_count = sum(1 for item in non_compliant if item.get("severity") == "Medium")
    low_count = sum(1 for item in non_compliant if item.get("severity") == "Low")

    if crit_count > 0:
        effective_sev = "Critical"
        effective_like = "High" if crit_count > 1 else "Medium"
    elif high_count > 0:
        effective_sev = "High"
        effective_like = "High" if high_count > 1 else "Medium"
    elif med_count > 0:
        effective_sev = "Medium"
        effective_like = "Medium"
    elif low_count > 0:
        effective_sev = "Low"
        effective_like = "Low"
    else:
        effective_sev = "Low"
        effective_like = "Low"

    risk_result = calculate_risk_score(
        severity=effective_sev,
        likelihood=effective_like,
        recurrence_count=max(1, len(non_compliant)),
        days_overdue=0,
        location_history_violations=high_count + crit_count,
        contractor_violations=0
    )

    if len(non_compliant) == 0:
        risk_result["risk_score"] = 0.0
        risk_result["risk_category"] = "LOW"
        risk_result["color"] = "#16A34A"

    return {
        "overall_score": score_percentage,
        "risk_score": risk_result["risk_score"],
        "risk_category": risk_result["risk_category"],
        "non_compliant_count": len(non_compliant),
        "violations_to_create": non_compliant,
        "risk_details": risk_result
    }
