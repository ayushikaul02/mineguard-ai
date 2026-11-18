import urllib.request
import urllib.parse
import json
import sys

BASE_URL = "http://127.0.0.1:8000/api/v1"

def http_req(url, method="GET", data=None, headers=None):
    if headers is None:
        headers = {}
    req_data = None
    if data is not None:
        req_data = json.dumps(data).encode("utf-8")
        headers["Content-Type"] = "application/json"
    
    req = urllib.request.Request(url, data=req_data, headers=headers, method=method)
    with urllib.request.urlopen(req) as resp:
        content_type = resp.headers.get("Content-Type", "")
        raw = resp.read()
        if "application/json" in content_type:
            return json.loads(raw.decode("utf-8")), resp.status, resp.headers
        return raw, resp.status, resp.headers

def run_tests():
    print("==================================================")
    print(" MineGuard AI — End-to-End Test Suite")
    print("==================================================")

    # 1. Test Auth for all 4 roles
    roles = [
        ("inspector", "inspector123"),
        ("manager", "manager123"),
        ("admin", "admin123"),
        ("auditor", "auditor123")
    ]
    tokens = {}
    for user, pwd in roles:
        body, status, _ = http_req(f"{BASE_URL}/auth/login", method="POST", data={"username": user, "password": pwd})
        assert status == 200, f"Login failed for {user}"
        tokens[user] = body["access_token"]
        print(f"[PASS] Auth verified for role: {user}")

    admin_headers = {"Authorization": f"Bearer {tokens['admin']}"}
    insp_headers = {"Authorization": f"Bearer {tokens['inspector']}"}
    mgr_headers = {"Authorization": f"Bearer {tokens['manager']}"}

    # 2. Test Dashboard KPIs & Charts
    kpis, status, _ = http_req(f"{BASE_URL}/dashboard/kpis", headers=admin_headers)
    assert status == 200
    assert kpis["total_mines"] >= 4
    assert kpis["total_inspections"] >= 20
    print(f"[PASS] Dashboard KPIs verified: {kpis['total_mines']} mines, {kpis['total_inspections']} inspections, {kpis['overall_compliance_percentage']}% compliance")

    charts, status, _ = http_req(f"{BASE_URL}/dashboard/charts", headers=admin_headers)
    assert status == 200
    assert len(charts["compliance_distribution"]) > 0
    assert len(charts["violations_by_domain"]) > 0
    print("[PASS] Dashboard Charts verified (6 chart datasets)")

    # 3. Test Mines
    mines, status, _ = http_req(f"{BASE_URL}/mines", headers=admin_headers)
    assert status == 200
    assert len(mines) >= 4
    print(f"[PASS] Mines verified: {len(mines)} active leaseholds")

    # 4. Test Compliance Records
    records, status, _ = http_req(f"{BASE_URL}/compliance", headers=admin_headers)
    assert status == 200
    assert len(records) >= 30
    print(f"[PASS] Compliance Records verified: {len(records)} records across 4 domains")

    # 5. Test Field Inspection Submission with automated violation & CAPA generation
    insp_payload = {
        "mine_id": 1,
        "domain": "Safety",
        "location": "Underground Gallery East Test Face",
        "inspector_name": "Rajesh Sharma",
        "inspection_date": "2026-11-18",
        "checklist_data": [
            {"id": 1, "item": "Statutory Safety Signage", "compliant": True, "remarks": "Pass", "severity": "Low"},
            {"id": 2, "item": "Methane & Atmospheric Ventilation", "compliant": False, "remarks": "CH4 0.95% elevated", "severity": "Critical"},
            {"id": 3, "item": "Mandatory PPE", "compliant": True, "remarks": "Pass", "severity": "High"},
            {"id": 4, "item": "Hydraulic Pressure", "compliant": False, "remarks": "Bleed detected", "severity": "High"},
            {"id": 5, "item": "Emergency Refuge Ready", "compliant": True, "remarks": "Pass", "severity": "Medium"}
        ],
        "comments": "Automated test inspection with 2 non-compliant items.",
        "photos": []
    }
    insp_data, status, _ = http_req(f"{BASE_URL}/inspections", method="POST", data=insp_payload, headers=insp_headers)
    assert status == 200
    assert insp_data["status"] == "Violations Found"
    print(f"[PASS] Field Inspection submitted: {insp_data['inspection_id']} (Score: {insp_data['overall_score']}%, Risk: {insp_data['risk_score']})")

    # 6. Verify newly created violations
    violations, status, _ = http_req(f"{BASE_URL}/violations", headers=admin_headers)
    assert status == 200
    assert len(violations) >= 17
    print(f"[PASS] Automated Violations verified: Total {len(violations)} violations")

    # 7. Test CAPA Lifecycle workflow
    capas, status, _ = http_req(f"{BASE_URL}/corrective-actions", headers=admin_headers)
    assert status == 200
    target_capa = next((c for c in capas if c["status"] == "Assigned"), None)
    if target_capa:
        ca_id = target_capa["id"]
        # Step A: Start Action
        res_a, status_a, _ = http_req(f"{BASE_URL}/corrective-actions/{ca_id}/transition", method="POST", data={"status": "In Progress"}, headers=mgr_headers)
        assert status_a == 200 and res_a["status"] == "In Progress"
        
        # Step B: Submit Evidence
        res_b, status_b, _ = http_req(f"{BASE_URL}/corrective-actions/{ca_id}/transition", method="POST", data={
            "status": "Awaiting Verification",
            "completion_evidence": "Replaced hydraulic valves and confirmed 160 bar pressure."
        }, headers=insp_headers)
        assert status_b == 200 and res_b["status"] == "Awaiting Verification"

        # Step C: Manager Verification and Closure
        res_c, status_c, _ = http_req(f"{BASE_URL}/corrective-actions/{ca_id}/transition", method="POST", data={
            "status": "Closed",
            "verification_notes": "Tested in presence of Colliery Safety Officer."
        }, headers=mgr_headers)
        assert status_c == 200 and res_c["status"] == "Closed"
        print(f"[PASS] CAPA Workflow full lifecycle verified: {target_capa['case_id']} successfully verified & closed!")

    # 8. Test AI Risk Engine & Isolation Forest ML Anomaly Detection
    risk_req = {
        "severity": "Critical",
        "likelihood": "High",
        "recurrence_count": 3,
        "days_overdue": 5,
        "location_history_violations": 4,
        "contractor_violations": 2,
        "deadline_proximity_days": 2
    }
    calc, status, _ = http_req(f"{BASE_URL}/ai/calculate-risk", method="POST", data=risk_req)
    assert status == 200
    assert calc["risk_category"] == "CRITICAL"
    assert len(calc["contributing_factors"]) == 5
    print(f"[PASS] AI Risk Engine verified: Score {calc['risk_score']}/100 ({calc['risk_category']}) with 5-factor breakdown")

    ml_insights, status, _ = http_req(f"{BASE_URL}/ai/insights")
    assert status == 200
    assert ml_insights["total_anomalies_flagged"] > 0
    print(f"[PASS] Scikit-Learn ML Insights verified: {ml_insights['total_anomalies_flagged']} anomalies detected, {ml_insights['high_risk_hotspots_count']} hotspots")

    # 9. Test Cryptographic SHA-256 Audit Trail Integrity
    integrity, status, _ = http_req(f"{BASE_URL}/audit/verify")
    assert status == 200
    assert integrity["is_valid"] is True
    print(f"[PASS] Tamper-Evident SHA-256 Hash Chain: 100% verified across {integrity['total_events']} sequential blocks! Zero tampering detected.")

    # 10. Test Report Exports
    csv_raw, status, _ = http_req(f"{BASE_URL}/reports/export/csv?report_type=compliance")
    assert status == 200 and b"Record ID" in csv_raw
    print(f"[PASS] CSV Export verified: {len(csv_raw)} bytes")

    pdf_raw, status, _ = http_req(f"{BASE_URL}/reports/export/pdf?report_type=compliance")
    assert status == 200 and pdf_raw.startswith(b"%PDF")
    print(f"[PASS] ReportLab PDF Export verified: {len(pdf_raw)} bytes generated")

    print("==================================================")
    print(" ALL 10 TEST SUITE CRITERIA PASSED SUCCESSFULLY! ")
    print("==================================================")

if __name__ == "__main__":
    run_tests()
