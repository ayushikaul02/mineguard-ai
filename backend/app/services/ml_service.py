"""
AI/ML Anomaly and Recurrence Detection Engine.
Uses Scikit-Learn IsolationForest for unsupervised anomaly detection
and pattern recognition algorithms on synthetic coal mine telemetry & compliance datasets.
"""
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from typing import List, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from ..models.models import Violation, ComplianceRecord, Inspection, Mine

class MLAnomalyDetector:
    def __init__(self):
        self.model = IsolationForest(
            n_estimators=100,
            contamination=0.15,
            random_state=42
        )
        self.is_trained = False
        self._train_synthetic_baseline()

    def _train_synthetic_baseline(self):
        """
        Trains baseline model on synthetic multi-domain coal mining operational data:
        Features:
        [0] Severity index (1-4)
        [1] Likelihood index (1-4)
        [2] Overdue days (0-30)
        [3] Methane CH4 concentration (ppm, normal 0.1-0.8%, critical > 1.25%)
        [4] Coal dust concentration (mg/m3, normal < 2.0, critical > 3.0)
        [5] Air ventilation velocity (m/s, normal 1.5-4.0, critical < 0.5)
        [6] Prior incident count in zone (0-10)
        [7] Contractor compliance score (0-100)
        """
        np.random.seed(42)
        n_samples = 600

        # Normal operational distribution
        normal_sev = np.random.choice([1, 2], size=n_samples, p=[0.7, 0.3])
        normal_like = np.random.choice([1, 2], size=n_samples, p=[0.75, 0.25])
        normal_overdue = np.random.exponential(scale=2.0, size=n_samples).clip(0, 7)
        normal_ch4 = np.random.normal(loc=0.45, scale=0.15, size=n_samples).clip(0.1, 0.9)
        normal_dust = np.random.normal(loc=1.2, scale=0.4, size=n_samples).clip(0.3, 2.2)
        normal_vent = np.random.normal(loc=2.5, scale=0.5, size=n_samples).clip(1.5, 4.0)
        normal_priors = np.random.poisson(lam=0.8, size=n_samples).clip(0, 3)
        normal_contractor = np.random.normal(loc=88, scale=6, size=n_samples).clip(75, 100)

        X_normal = np.column_stack([
            normal_sev, normal_like, normal_overdue, normal_ch4,
            normal_dust, normal_vent, normal_priors, normal_contractor
        ])

        # Synthetic hazardous anomalies (gas spikes, air stagnation, chronic overdue)
        n_anomalies = 60
        anom_sev = np.random.choice([3, 4], size=n_anomalies, p=[0.4, 0.6])
        anom_like = np.random.choice([3, 4], size=n_anomalies, p=[0.3, 0.7])
        anom_overdue = np.random.uniform(8, 28, size=n_anomalies)
        anom_ch4 = np.random.uniform(1.2, 2.4, size=n_anomalies)
        anom_dust = np.random.uniform(3.1, 5.8, size=n_anomalies)
        anom_vent = np.random.uniform(0.1, 0.45, size=n_anomalies)
        anom_priors = np.random.randint(4, 9, size=n_anomalies)
        anom_contractor = np.random.uniform(40, 68, size=n_anomalies)

        X_anomalous = np.column_stack([
            anom_sev, anom_like, anom_overdue, anom_ch4,
            anom_dust, anom_vent, anom_priors, anom_contractor
        ])

        X_train = np.vstack([X_normal, X_anomalous])
        self.model.fit(X_train)
        self.is_trained = True

    def analyze_database_records(self, db: Session) -> Dict[str, Any]:
        """
        Analyzes live database records (violations, compliance records, inspections)
        using both Scikit-Learn IsolationForest anomaly scoring and pattern clustering.
        """
        violations = db.query(Violation).all()
        compliance_records = db.query(ComplianceRecord).all()
        inspections = db.query(Inspection).all()
        mines = {m.id: m.name for m in db.query(Mine).all()}

        anomalies_detected = []
        hotspots = []
        recurrence_patterns = []

        # 1. Recurrence Pattern Mining by Mine + Location
        loc_violation_map = {}
        for v in violations:
            key = (v.mine_id, v.location)
            if key not in loc_violation_map:
                loc_violation_map[key] = []
            loc_violation_map[key].append(v)

        for (m_id, loc), v_list in loc_violation_map.items():
            mine_name = mines.get(m_id, f"Mine #{m_id}")
            count = len(v_list)
            # Find domain distribution
            domains = [v.domain for v in v_list]
            primary_domain = max(set(domains), key=domains.count) if domains else "Safety"
            avg_risk = sum(v.risk_score for v in v_list) / count if count else 0

            if count >= 2:
                # Recurrence cluster detected
                recurrence_patterns.append({
                    "cluster_id": f"REC-{m_id}-{len(recurrence_patterns)+1:02d}",
                    "mine_id": m_id,
                    "mine_name": mine_name,
                    "location": loc,
                    "domain": primary_domain,
                    "violation_count": count,
                    "average_risk_score": round(avg_risk, 1),
                    "summary": f"Repeated {primary_domain} violations detected at {loc} ({count} logged events).",
                    "sample_records": [v.violation_id for v in v_list[:4]],
                    "recommended_action": f"Immediate engineering inspection of {loc} and mandatory supervisor retraining."
                })

            if avg_risk >= 65.0 or count >= 3:
                hotspots.append({
                    "mine_id": m_id,
                    "mine_name": mine_name,
                    "location": loc,
                    "severity": "CRITICAL" if avg_risk >= 75 else "HIGH",
                    "average_risk": round(avg_risk, 1),
                    "total_violations": count,
                    "domain": primary_domain,
                    "details": f"High risk density hotspot identified with {count} violations and {avg_risk:.1f}/100 average risk score."
                })

        # 2. Isolation Forest Anomaly Scoring on Violations
        sev_map = {"Low": 1, "Medium": 2, "High": 3, "Critical": 4}
        like_map = {"Low": 1, "Medium": 2, "High": 3, "Critical": 4}

        for v in violations:
            s_val = sev_map.get(v.severity, 2)
            l_val = like_map.get(v.likelihood, 2)
            rec_val = min(v.recurrence_count, 8)
            overdue_val = 14 if v.status == "Escalated" else (5 if v.status == "Open" else 0)

            # Telemetry simulation based on domain and severity
            if v.domain == "Safety" and s_val >= 3:
                ch4 = 1.35
                vent = 0.35
            else:
                ch4 = 0.55
                vent = 2.2

            if v.domain == "Environment":
                dust = 3.6
            else:
                dust = 1.4

            feature_vec = np.array([[
                s_val, l_val, overdue_val, ch4, dust, vent, rec_val, 72.0
            ]])

            # Anomaly prediction: -1 is anomaly, 1 is normal
            pred = self.model.predict(feature_vec)[0]
            raw_score = self.model.decision_function(feature_vec)[0]
            # Convert decision function to normalized anomaly confidence (0-100)
            # decision function typically between -0.25 (highly anomalous) to +0.25 (normal)
            anomaly_confidence = round(float(np.clip((0.15 - raw_score) * 200, 10, 99)), 1)

            if pred == -1 or v.risk_score >= 70.0:
                mine_name = mines.get(v.mine_id, f"Mine #{v.mine_id}")
                reasons = []
                if s_val >= 3:
                    reasons.append(f"Elevated severity tier ({v.severity})")
                if v.recurrence_count > 1:
                    reasons.append(f"Multiple recurrence episodes (Count: {v.recurrence_count})")
                if v.status == "Escalated":
                    reasons.append("Unresolved statutory escalation status")
                if ch4 > 1.0 or dust > 3.0 or vent < 0.5:
                    reasons.append("Simulated gas/dust environmental parameter threshold breach")

                anomalies_detected.append({
                    "id": f"ANOM-{v.violation_id}",
                    "violation_id": v.violation_id,
                    "mine_name": mine_name,
                    "location": v.location,
                    "domain": v.domain,
                    "risk_score": v.risk_score,
                    "anomaly_confidence": anomaly_confidence,
                    "anomaly_type": "Critical Operational Breach" if v.risk_score >= 75 else "Statistical Outlier Pattern",
                    "contributing_reasons": reasons if reasons else ["Multivariate risk threshold anomaly"],
                    "timestamp": v.reported_date.strftime("%Y-%m-%d %H:%M") if v.reported_date else "Recent",
                    "recommended_action": "Trigger statutory audit inspection and mandate executive sign-off for closure."
                })

        # Sort anomalies by confidence desc
        anomalies_detected.sort(key=lambda x: x["anomaly_confidence"], reverse=True)

        return {
            "model_metadata": {
                "algorithm": "Scikit-Learn Isolation Forest & Recurrence Cluster Engine",
                "training_dataset": "Synthetic Coal Mine Multi-Domain Telemetry & Governance Dataset (Simulated Demonstration)",
                "features_used": [
                    "Severity Index",
                    "Likelihood Index",
                    "Timeline Overdue Days",
                    "Methane CH4 PPM",
                    "Respirable Dust Mg/m3",
                    "Ventilation Airspeed m/s",
                    "Zone Incident Frequency",
                    "Contractor Reliability Score"
                ],
                "status": "Active & Synchronized with Database"
            },
            "total_anomalies_flagged": len(anomalies_detected),
            "high_risk_hotspots_count": len(hotspots),
            "recurrent_clusters_count": len(recurrence_patterns),
            "anomalies": anomalies_detected,
            "hotspots": hotspots,
            "recurrence_patterns": recurrence_patterns
        }

ml_detector = MLAnomalyDetector()
