"""
Realistic Seed Data Initializer for MineGuard AI.
Populates SQLite database with 4 coal mines, 20+ inspections, 30+ compliance records,
15+ violations, 10+ CAPA workflows, 5+ contractors, 10+ grievances, and chained SHA-256 audit events.
"""
from datetime import datetime, date, timedelta
from sqlalchemy.orm import Session
from .models.models import (
    User,
    Mine,
    ComplianceRecord,
    Inspection,
    Violation,
    CorrectiveAction,
    Contractor,
    Grievance,
    Document
)
from .auth import get_password_hash
from .services.risk_engine import calculate_risk_score
from .services.audit_service import record_audit_log

def seed_database(db: Session):
    # 1. Always ensure the 4 statutory demo accounts exist in the database
    users_data = [
        {"username": "inspector", "password": "inspector123", "full_name": "Rajesh Sharma (DGMS Certified Inspector)", "role": "inspector", "mine_id": 1, "email": "r.sharma@mineguard.gov.in", "phone": "+91 98351 22410"},
        {"username": "manager", "password": "manager123", "full_name": "Col. Vikramjit Sengupta (Mine General Manager)", "role": "manager", "mine_id": 1, "email": "v.sengupta@coalindia.gov.in", "phone": "+91 94311 88201"},
        {"username": "admin", "password": "admin123", "full_name": "Dr. Ananya Roy (Corporate Compliance Director)", "role": "admin", "mine_id": None, "email": "a.roy@mineguard.corporate.in", "phone": "+91 98100 55412"},
        {"username": "auditor", "password": "auditor123", "full_name": "Harishankar Trivedi (DGMS Chief Statutory Auditor)", "role": "auditor", "mine_id": None, "email": "auditor.trivedi@dgms.gov.in", "phone": "+91 91234 56789"}
    ]
    for u in users_data:
        existing = db.query(User).filter(User.username == u["username"]).first()
        if not existing:
            db_u = User(
                username=u["username"],
                password_hash=get_password_hash(u["password"]),
                full_name=u["full_name"],
                role=u["role"],
                mine_id=u["mine_id"],
                email=u["email"],
                phone=u["phone"],
                is_active=True
            )
            db.add(db_u)
    db.commit()

    # Check if domain entity seed data is already initialized
    if db.query(Mine).count() > 0:
        return

    print("--- Initializing MineGuard AI Seed Database ---")

    # 2. Mines
    mines_data = [
        {
            "code": "NJCM-01",
            "name": "North Jharia Coal Mine",
            "location": "Jharia Coalfield, Dhanbad",
            "state": "Jharkhand",
            "latitude": 23.7485,
            "longitude": 86.4192,
            "mine_type": "Underground",
            "manager_name": "Col. Vikramjit Sengupta",
            "total_workforce": 1420,
            "daily_production_capacity": 6500.0,
            "status": "Active"
        },
        {
            "code": "CKCM-02",
            "name": "Central Korba Coal Mine",
            "location": "Hasdeo Arand Basin, Korba",
            "state": "Chhattisgarh",
            "latitude": 22.3595,
            "longitude": 82.7501,
            "mine_type": "Opencast",
            "manager_name": "P. K. Verma",
            "total_workforce": 2150,
            "daily_production_capacity": 14200.0,
            "status": "Active"
        },
        {
            "code": "ERM-03",
            "name": "Eastern Raniganj Mine",
            "location": "Asansol Sub-division, Paschim Bardhaman",
            "state": "West Bengal",
            "latitude": 23.6188,
            "longitude": 87.1275,
            "mine_type": "Mixed",
            "manager_name": "Debabrata Banerjee",
            "total_workforce": 1780,
            "daily_production_capacity": 8800.0,
            "status": "Active"
        },
        {
            "code": "WSM-04",
            "name": "Western Singrauli Mine",
            "location": "Singrauli Energy Belt, Singrauli",
            "state": "Madhya Pradesh",
            "latitude": 24.1992,
            "longitude": 82.6654,
            "mine_type": "Opencast",
            "manager_name": "Sanjay Chouhan",
            "total_workforce": 2890,
            "daily_production_capacity": 21000.0,
            "status": "Active"
        }
    ]
    created_mines = []
    for m in mines_data:
        db_m = Mine(**m)
        db.add(db_m)
        created_mines.append(db_m)
    db.commit()

    # 3. Contractors
    contractors_data = [
        {"contractor_id": "CNT-2026-001", "name": "Apex Mining Infrastructure Pvt Ltd", "mine_id": 1, "contact_person": "Sunil Tiwari", "contact_phone": "+91 98310 11223", "contact_email": "operations@apexmining.in", "worker_count": 320, "compliance_score": 78.5, "active_contracts": "Underground Gallery Tunneling & Support", "safety_violations": 3, "pending_actions": 2, "status": "Probation"},
        {"contractor_id": "CNT-2026-002", "name": "Bharat Heavy Haulage Logistics", "mine_id": 2, "contact_person": "Ramesh Patel", "contact_phone": "+91 94250 44556", "contact_email": "logistics@bharathaulage.com", "worker_count": 480, "compliance_score": 92.0, "active_contracts": "Dump Truck Haulage & Pit Transport", "safety_violations": 1, "pending_actions": 0, "status": "Compliant"},
        {"contractor_id": "CNT-2026-003", "name": "Eastern Seam Drills & Blasting", "mine_id": 3, "contact_person": "Tapan Karmakar", "contact_phone": "+91 93321 77889", "contact_email": "info@easternblasting.co.in", "worker_count": 190, "compliance_score": 84.0, "active_contracts": "Controlled Deep-Hole Blasting Services", "safety_violations": 2, "pending_actions": 1, "status": "Active"},
        {"contractor_id": "CNT-2026-004", "name": "Singrauli Earthmovers & Engineering", "mine_id": 4, "contact_person": "Arunendra Singh", "contact_phone": "+91 97531 99001", "contact_email": "contracts@singrauliearth.in", "worker_count": 610, "compliance_score": 89.5, "active_contracts": "Dragline & Excavator Heavy Operations", "safety_violations": 1, "pending_actions": 1, "status": "Compliant"},
        {"contractor_id": "CNT-2026-005", "name": "Coalfield Environmental Services Ltd", "mine_id": 1, "contact_person": "Kavita Rao", "contact_phone": "+91 98220 33445", "contact_email": "services@coalfieldenv.org", "worker_count": 140, "compliance_score": 96.0, "active_contracts": "Effluent Treatment & Water Spray Suppression", "safety_violations": 0, "pending_actions": 0, "status": "Compliant"}
    ]
    for c in contractors_data:
        db.add(Contractor(**c))
    db.commit()

    # 4. Compliance Records (30+ across 4 domains)
    domains_data = [
        # Safety
        ("Safety", "Underground Methane (CH4) Continuous Sensor Calibration", "Weekly calibration of automated catalytic methane telemetry probes in Seam 4 Gallery.", "2026-11-10", "2026-11-17", "R. Sharma", "Compliant", "Critical", 1),
        ("Safety", "Hydraulic Powered Roof Support Pressure Testing", "Check minimum setting pressure threshold (150 bar) on longwall face chocks 12 to 40.", "2026-11-08", "2026-11-15", "M. K. Jha", "Non-Compliant", "Critical", 1),
        ("Safety", "Mandatory Personal Protective Equipment (PPE) Compliance", "Enforce flame-retardant anti-static overalls, steel-toe gumboots, and battery cap-lamps.", "2026-11-12", "2026-11-19", "G. N. Murthy", "Partially Compliant", "High", 1),
        ("Safety", "Emergency Self-Contained Self-Rescuers (SCSR) Audit", "Ensure 100% availability of 60-minute chemical oxygen packs in underground refuge stations.", "2026-11-05", "2026-11-20", "R. Sharma", "Compliant", "High", 3),
        ("Safety", "Conveyor Belt Fire-Resistant Anti-Static (FRAS) Testing", "Thermal imaging scanning for friction hot-spots and roller bearing seizures on Trunk Belt #3.", "2026-11-11", "2026-11-18", "S. Majumdar", "Partially Compliant", "Medium", 2),
        ("Safety", "Mine Inundation Barrier & Pumping Station Redundancy", "Verification of standby submersible dewatering pumps ahead of monsoon water seepage.", "2026-11-04", "2026-11-25", "K. S. Rathore", "Compliant", "Medium", 4),
        ("Safety", "Explosive Magazine Statutory Security & Lightning Arrestors", "Quarterly audit under Indian Explosives Rules 2008 for detonator storage vaults.", "2026-11-07", "2026-11-21", "M. K. Jha", "Compliant", "Low", 2),
        ("Safety", "Auxiliary Ventilation Fan Ducting Air Leakage Assessment", "Check for tears and static pressure drop across 1200m flexible ventilation ducting.", "2026-11-13", "2026-11-20", "R. Sharma", "Non-Compliant", "High", 1),

        # Environment
        ("Environment", "Respirable Dust Airborne Concentration Limits (CMR 2017)", "Ensure 8-hour shift average airborne coal dust remains under statutory ceiling of 2.0 mg/m3.", "2026-11-09", "2026-11-16", "Dr. S. Roy", "Non-Compliant", "Critical", 2),
        ("Environment", "Haul Road High-Pressure Water Mist Suppression", "Operation of automated nozzle sprinklers along 8.5 km opencast truck haulage route.", "2026-11-11", "2026-11-18", "T. Karmakar", "Partially Compliant", "High", 4),
        ("Environment", "Acid Mine Drainage (AMD) Effluent Neutralization Plant", "Monitoring pH (6.5 - 8.5) and dissolved iron precipitation in mine discharge lagoons.", "2026-11-06", "2026-11-20", "Kavita Rao", "Compliant", "High", 1),
        ("Environment", "Topsoil Segregation and Overburden Dump Stabilization", "Bio-reclamation and vetiver grass plantation on 45-degree overburden spoil terraces.", "2026-11-03", "2026-11-24", "P. Sengupta", "Compliant", "Medium", 4),
        ("Environment", "Ambient Blast Noise & Ground Vibration PPV Ceilings", "Maintain peak particle velocity below 10 mm/s at 200m perimeter from residential zone.", "2026-11-10", "2026-11-17", "A. K. Mishra", "Compliant", "Medium", 3),
        ("Environment", "Hazardous Waste Lubricant & Filter Disposal Registry", "Certified recycling tracking of heavy earthmover used engine oils via authorized vendors.", "2026-11-02", "2026-11-30", "Kavita Rao", "Compliant", "Low", 2),
        ("Environment", "Continuous Real-Time Ambient Air Quality Monitoring (CAAQMS)", "Sensor uptime and telemetry broadcast to State Pollution Control Board portal.", "2026-11-12", "2026-11-19", "Dr. S. Roy", "Compliant", "Low", 4),

        # Production
        ("Production", "Statutory Production Ceiling vs Environmental Clearance (EC) Cap", "Verification of cumulative monthly coal extract tonnage against DGMS approved mine plan.", "2026-11-01", "2026-11-30", "V. Sengupta", "Compliant", "High", 1),
        ("Production", "Dragline Boom & Wire Rope Ultrasonic Non-Destructive Testing", "Crack detection and tensile fatigue inspection on 24-cubic-meter walking dragline.", "2026-11-08", "2026-11-15", "S. Chouhan", "Partially Compliant", "High", 4),
        ("Production", "Coal Handling Plant (CHP) Vibration & Weightometer Calibration", "Accuracy calibration of continuous electronic belt weigh scales to within 0.5% tolerance.", "2026-11-05", "2026-11-20", "D. Banerjee", "Compliant", "Medium", 3),
        ("Production", "Continuous Miner Cutter Drum Pick Wear Verification", "Statutory replacement of tungsten-carbide conical cutting picks to prevent friction sparking.", "2026-11-12", "2026-11-19", "R. Sharma", "Non-Compliant", "Critical", 1),
        ("Production", "Heavy Earth Moving Machinery (HEMM) Fitness Certification", "Monthly DGMS Form VII fitness validation for 100-tonne rear dumpers.", "2026-11-07", "2026-11-21", "P. K. Verma", "Compliant", "Medium", 2),
        ("Production", "Railway Siding Rapid Loading System Interlocking", "Check automatic hydraulic chute interlocks to prevent coal spillages during wagon loading.", "2026-11-04", "2026-11-22", "V. Sengupta", "Compliant", "Low", 1),
        ("Production", "Bench Height and Slope Stability Monitoring in Opencast Pit", "Laser distance measurement of 15m bench slope angle to avoid rockfall slip failure.", "2026-11-10", "2026-11-24", "S. Chouhan", "Compliant", "High", 4),

        # Labour
        ("Labour", "Contractor Workforce DGMS Vocational Training (VT) Compliance", "Enforce 100% formal induction safety certification under Mines Vocational Training Rules 1966.", "2026-11-06", "2026-11-13", "H. Trivedi", "Non-Compliant", "Critical", 1),
        ("Labour", "Initial and Periodic Medical Examination (IME / PME) Records", "Mandatory chest X-ray screening for early pneumoconiosis detection across underground miners.", "2026-11-02", "2026-11-25", "Dr. A. Roy", "Partially Compliant", "High", 3),
        ("Labour", "Underground Potable Water and Canteen Hygiene Standards", "Bacteriological water testing and clean sanitary facilities at pit-bottom stations.", "2026-11-09", "2026-11-23", "G. N. Murthy", "Compliant", "Medium", 1),
        ("Labour", "Statutory Rest Shelters & Female Worker Amenities at Pithead", "Verification of adequate shaded resting stations with clean washrooms under Mines Act 1952.", "2026-11-05", "2026-11-19", "P. K. Verma", "Compliant", "Medium", 2),
        ("Labour", "Form B Employee Register & Biometric Shift Attendance System", "Reconciliation of digital biometric turnstile logs with statutory mine muster rolls.", "2026-11-11", "2026-11-18", "D. Banerjee", "Compliant", "Low", 3),
        ("Labour", "Overtime Limitations and Mandatory Weekly Day of Rest", "Enforce maximum 48-hour regular statutory working week ceiling across all mine shifts.", "2026-11-08", "2026-11-22", "H. Trivedi", "Partially Compliant", "Medium", 4),
        ("Labour", "Contractor Statutory Minimum Wages & EPF Remittance Proof", "Submission of bank transfer statements and Employee Provident Fund challans.", "2026-11-04", "2026-11-18", "Dr. A. Roy", "Compliant", "Low", 2),
        ("Labour", "First-Aid Station Equipment & Certified First-Aider Roster", "Check oxygen resuscitators, splints, and stretcher availability per 100 underground workers.", "2026-11-12", "2026-11-26", "R. Sharma", "Compliant", "High", 1),
        ("Labour", "Safety Committee Meeting Minutes & Worker Representation", "Holding monthly joint bipartite health and safety consultative committee sessions.", "2026-11-01", "2026-11-28", "V. Sengupta", "Compliant", "Low", 1)
    ]

    for idx, (dom, req, desc, idate, ddate, resp, stat, sev, m_id) in enumerate(domains_data):
        c_risk = calculate_risk_score(severity=sev, likelihood="High" if sev in ["High", "Critical"] else "Medium")
        cmp_rec = ComplianceRecord(
            record_id=f"CMP-2026-{idx+1:04d}",
            mine_id=m_id,
            domain=dom,
            requirement=req,
            description=desc,
            inspection_date=idate,
            due_date=ddate,
            responsible_person=resp,
            status=stat,
            severity=sev,
            risk_score=c_risk["risk_score"],
            risk_category=c_risk["risk_category"],
            corrective_action="Execute immediate statutory mitigation as outlined in DGMS CMR 2017 handbook." if stat != "Compliant" else None
        )
        db.add(cmp_rec)
    db.commit()

    # 5. Field Inspections (20 realistic inspection reports)
    inspections_data = [
        ("INSP-2026-0001", 1, "Safety", "Underground Shaft #3, Level 4 (Seam-V)", "Rajesh Sharma", "2026-11-14", "Violations Found", 75.0, 84.0, "CRITICAL", "Hydraulic props bled down; methane concentration elevated to 0.95%."),
        ("INSP-2026-0002", 2, "Environment", "Haul Road Crusher Hopper Section", "S. Sengupta", "2026-11-13", "Violations Found", 80.0, 72.0, "HIGH", "Respirable dust measured at 3.42 mg/m3; transfer point mist nozzles clogged."),
        ("INSP-2026-0003", 1, "Safety", "Gallery 12-East Main Return Airway", "Rajesh Sharma", "2026-11-12", "Violations Found", 70.0, 86.0, "CRITICAL", "Auxiliary ventilation airspeed stalled below 0.35 m/s. Dangerous air stagnation."),
        ("INSP-2026-0004", 3, "Labour", "Surface Screening Plant Contractor Quarters", "Harishankar Trivedi", "2026-11-11", "Violations Found", 80.0, 64.0, "HIGH", "Apex Mining contract operators lacked updated Vocational Training Rule 1966 certs."),
        ("INSP-2026-0005", 4, "Production", "Opencast Heavy Earthmoving Fleet Pit C", "Sanjay Chouhan", "2026-11-10", "Completed", 95.0, 18.0, "LOW", "100-tonne haulers and rope shovels in full statutory working order."),
        ("INSP-2026-0006", 1, "Environment", "Effluent Sedimentation Pond #2", "Kavita Rao", "2026-11-09", "Completed", 92.0, 22.0, "LOW", "pH measured at 7.1; zero toxic heavy metal runoff detected."),
        ("INSP-2026-0007", 2, "Safety", "Opencast Blasting Bench #4", "M. K. Jha", "2026-11-08", "Completed", 90.0, 24.0, "LOW", "Electronic detonator leads insulated; perimeter blast horn siren functional."),
        ("INSP-2026-0008", 3, "Production", "Continuous Miner Section 2", "Debabrata Banerjee", "2026-11-07", "Violations Found", 75.0, 68.0, "HIGH", "Tungsten pick wear exceeded 40%; cooling water sprays partially choked."),
        ("INSP-2026-0009", 4, "Labour", "Western Siding Biometric Turnstile Station", "Dr. Ananya Roy", "2026-11-06", "Completed", 96.0, 15.0, "LOW", "All 610 contractor workers verified against central muster roll."),
        ("INSP-2026-0010", 1, "Safety", "Underground Refuge Chamber 2B", "Rajesh Sharma", "2026-11-05", "Completed", 100.0, 10.0, "LOW", "Oxygen self-rescuers, satellite telephony, and potable water rations checked."),
        ("INSP-2026-0011", 2, "Environment", "Hasdeo River Catchment Perimeter", "Dr. S. Roy", "2026-11-04", "Completed", 94.0, 20.0, "LOW", "Turbidity and suspended solids well below EPA industrial threshold."),
        ("INSP-2026-0012", 3, "Safety", "Underground Longwall Panel #1", "M. K. Jha", "2026-11-03", "Violations Found", 78.0, 62.0, "HIGH", "Workers observed without chin-straps fastened on safety hardhats."),
        ("INSP-2026-0013", 4, "Production", "Dragline Marion 8050 Walking Section", "Sanjay Chouhan", "2026-11-02", "Violations Found", 82.0, 58.0, "MEDIUM", "Micro-fissures detected in dragline boom hoist pulley bushing."),
        ("INSP-2026-0014", 1, "Labour", "Underground Substation 3 Sanitation Point", "G. N. Murthy", "2026-11-01", "Completed", 90.0, 22.0, "LOW", "Clean drinking water chillers and first-aid kits verified."),
        ("INSP-2026-0015", 2, "Safety", "Fuel Storage Depot & Lube Farm", "P. K. Verma", "2026-10-30", "Completed", 96.0, 16.0, "LOW", "Foam tender extinguishers and auto-deluge deluge valves in test readiness."),
        ("INSP-2026-0016", 3, "Environment", "Screening Plant Topsoil Reclaim Sector", "P. Sengupta", "2026-10-28", "Completed", 91.0, 24.0, "LOW", "Hydro-seeding mulch layer active; no soil slippage observed."),
        ("INSP-2026-0017", 4, "Labour", "Contractor Barracks Camp 3", "Harishankar Trivedi", "2026-10-25", "Violations Found", 76.0, 60.0, "HIGH", "Inadequate ventilation and missing fire extinguishers in living quarters."),
        ("INSP-2026-0018", 1, "Safety", "Underground Main Incline Conveyor Head", "Rajesh Sharma", "2026-10-22", "Completed", 88.0, 26.0, "LOW", "Emergency rip cord switch and slip sensors operational."),
        ("INSP-2026-0019", 2, "Production", "Primary Gyratory Crusher #1", "P. K. Verma", "2026-10-18", "Completed", 94.0, 18.0, "LOW", "Mantle liner wear within acceptable manufacturing limits."),
        ("INSP-2026-0020", 3, "Labour", "Medical Health Unit & Dust Clinic", "Dr. Ananya Roy", "2026-10-15", "Completed", 98.0, 12.0, "LOW", "Periodic Medical Examination spirometry equipment functioning.")
    ]

    for (iid, mid, dom, loc, insp_name, idate, stat, score, r_score, r_cat, comm) in inspections_data:
        checklist_items = [
            {"id": 1, "item": "Statutory Safety Signage & Restricted Area Access", "compliant": True, "remarks": "Signs clearly posted in English and Hindi.", "severity": "Low"},
            {"id": 2, "item": "Atmospheric Gas Detection & Ventilation Airflow", "compliant": r_score < 70, "remarks": "Airflow within acceptable limits." if r_score < 70 else "Ventilation velocity dangerously sluggish.", "severity": "Critical"},
            {"id": 3, "item": "Mandatory PPE & Flame-Retardant Equipment", "compliant": r_score < 60, "remarks": "All staff fully equipped." if r_score < 60 else "Workers observed without chinstraps or cap-lamps.", "severity": "High"},
            {"id": 4, "item": "Hydraulic Pressure & Mechanical Integrity", "compliant": r_score < 75, "remarks": "Pressure verified." if r_score < 75 else "Hydraulic bleed detected on support rams.", "severity": "Critical"},
            {"id": 5, "item": "Emergency Equipment Readiness & Fire Extinguishers", "compliant": True, "remarks": "Inspection tags verified within validity.", "severity": "Medium"}
        ]
        insp_record = Inspection(
            inspection_id=iid,
            mine_id=mid,
            domain=dom,
            location=loc,
            inspector_name=insp_name,
            inspection_date=idate,
            status=stat,
            overall_score=score,
            checklist_data=checklist_items,
            comments=comm,
            photos=["/uploads/sample_inspection_img.jpg"],
            risk_score=r_score,
            risk_category=r_cat
        )
        db.add(insp_record)
    db.commit()

    # 6. Violations (15+ realistic statutory violations)
    violations_data = [
        {
            "violation_id": "VIO-2026-0001",
            "inspection_id": 1,
            "mine_id": 1,
            "domain": "Safety",
            "location": "Underground Shaft #3, Level 4 (Seam-V)",
            "title": "Hydraulic Powered Roof Support Pressure Loss",
            "description": "Hydraulic setting pressure bled down to 35 bar (required statutory minimum 150 bar) along chock positions 14-18, creating catastrophic roof collapse risk.",
            "severity": "Critical",
            "likelihood": "High",
            "recurrence_count": 3,
            "risk_score": 88.5,
            "risk_category": "CRITICAL",
            "status": "Escalated",
            "escalation_level": "Level 3 - Regulatory Authority",
            "reported_by": "Rajesh Sharma",
            "contributing_factors": {
                "High severity": 27.0,
                "High likelihood": 22.5,
                "Repeated violation (3x)": 15.0,
                "Overdue timeline factor": 12.0,
                "Historical hotspot location": 12.0
            }
        },
        {
            "violation_id": "VIO-2026-0002",
            "inspection_id": 3,
            "mine_id": 1,
            "domain": "Safety",
            "location": "Gallery 12-East Main Return Airway",
            "title": "Air Stagnation and Methane Gas Build-up",
            "description": "Auxiliary ventilation airspeed stalled at 0.35 m/s. Localized CH4 concentration reached 1.15% approaching the explosive limit of 1.25%.",
            "severity": "Critical",
            "likelihood": "High",
            "recurrence_count": 2,
            "risk_score": 86.0,
            "risk_category": "CRITICAL",
            "status": "Action Assigned",
            "escalation_level": "Level 3 - Regulatory Authority",
            "reported_by": "Rajesh Sharma",
            "contributing_factors": {"Critical Severity": 30.0, "High Likelihood": 20.0, "Recurrence (2x)": 12.0, "Location Risk": 12.0, "Urgency": 12.0}
        },
        {
            "violation_id": "VIO-2026-0003",
            "inspection_id": 2,
            "mine_id": 2,
            "domain": "Environment",
            "location": "Haul Road Crusher Hopper Section",
            "title": "Respirable Coal Dust Exceeding Permissible Ceiling",
            "description": "Stationary 8-hour dust concentration measured at 3.42 mg/m3 against DGMS statutory threshold of 2.0 mg/m3 due to broken water mist nozzles.",
            "severity": "High",
            "likelihood": "High",
            "recurrence_count": 2,
            "risk_score": 72.0,
            "risk_category": "HIGH",
            "status": "Action Assigned",
            "escalation_level": "Level 2 - Mine General Manager",
            "reported_by": "S. Sengupta",
            "contributing_factors": {"High Severity": 24.0, "High Likelihood": 20.0, "Recurrence": 12.0, "Overdue Factor": 8.0, "Contractor Impact": 8.0}
        },
        {
            "violation_id": "VIO-2026-0004",
            "inspection_id": 4,
            "mine_id": 3,
            "domain": "Labour",
            "location": "Surface Screening Plant Contractor Quarters",
            "title": "Uncertified Contractor Machine Operators Onsite",
            "description": "Contractor Apex Mining deployed 24 operators lacking Mines Vocational Training Rule 1966 certification for heavy surface machinery.",
            "severity": "High",
            "likelihood": "Medium",
            "recurrence_count": 1,
            "risk_score": 64.0,
            "risk_category": "HIGH",
            "status": "Action Assigned",
            "escalation_level": "Level 2 - Mine General Manager",
            "reported_by": "Harishankar Trivedi",
            "contributing_factors": {"High Severity": 24.0, "Medium Likelihood": 12.5, "Contractor Prior Violations": 15.0, "Timeline Urgency": 12.5}
        },
        {
            "violation_id": "VIO-2026-0005",
            "inspection_id": 8,
            "mine_id": 3,
            "domain": "Production",
            "location": "Continuous Miner Section 2",
            "title": "Continuous Miner Pick Wear and Frictional Heat Risk",
            "description": "Cutting drum picks severely worn beyond 40% wear limit, causing frictional sparking against quartz sandstone intrusions.",
            "severity": "Critical",
            "likelihood": "Medium",
            "recurrence_count": 1,
            "risk_score": 68.0,
            "risk_category": "HIGH",
            "status": "Open",
            "escalation_level": "Level 2 - Mine General Manager",
            "reported_by": "Debabrata Banerjee",
            "contributing_factors": {"Critical Severity": 30.0, "Medium Likelihood": 12.5, "Operational Hazard": 13.0, "Immediate Threat": 12.5}
        },
        {
            "violation_id": "VIO-2026-0006",
            "inspection_id": 12,
            "mine_id": 3,
            "domain": "Safety",
            "location": "Underground Longwall Panel #1",
            "title": "Repeated PPE Non-Compliance in Hazardous Extraction Zone",
            "description": "Workers observed entering longwall coal face without securing safety chin-straps and missing safety reflective harness strips.",
            "severity": "Medium",
            "likelihood": "High",
            "recurrence_count": 3,
            "risk_score": 62.0,
            "risk_category": "HIGH",
            "status": "Open",
            "escalation_level": "Level 2 - Mine General Manager",
            "reported_by": "M. K. Jha",
            "contributing_factors": {"Medium Severity": 15.0, "High Likelihood": 20.0, "Recurrence (3x)": 15.0, "Location Hotspot": 12.0}
        },
        {
            "violation_id": "VIO-2026-0007",
            "inspection_id": 13,
            "mine_id": 4,
            "domain": "Production",
            "location": "Dragline Marion 8050 Walking Section",
            "title": "Dragline Hoist Pulley Micro-Fissures",
            "description": "Ultrasonic non-destructive testing revealed surface stress cracks in walking dragline boom hoist pulley bearing.",
            "severity": "High",
            "likelihood": "Low",
            "recurrence_count": 1,
            "risk_score": 58.0,
            "risk_category": "HIGH",
            "status": "Action Assigned",
            "escalation_level": "Level 2 - Mine General Manager",
            "reported_by": "Sanjay Chouhan",
            "contributing_factors": {"High Severity": 24.0, "Low Likelihood": 5.0, "Heavy Equipment Risk": 15.0, "Timeline": 14.0}
        },
        {
            "violation_id": "VIO-2026-0008",
            "inspection_id": 17,
            "mine_id": 4,
            "domain": "Labour",
            "location": "Contractor Barracks Camp 3",
            "title": "Substandard Fire Safety and Overcrowded Rest Quarters",
            "description": "Worker dormitory lacked dry-chemical powder fire extinguishers and natural cross-ventilation windows.",
            "severity": "Medium",
            "likelihood": "Medium",
            "recurrence_count": 2,
            "risk_score": 52.0,
            "risk_category": "HIGH",
            "status": "Open",
            "escalation_level": "Level 2 - Mine General Manager",
            "reported_by": "Harishankar Trivedi",
            "contributing_factors": {"Medium Severity": 15.0, "Medium Likelihood": 12.5, "Contractor Prior Record": 12.5, "Recurrence": 12.0}
        },
        {
            "violation_id": "VIO-2026-0009",
            "inspection_id": 1,
            "mine_id": 1,
            "domain": "Safety",
            "location": "Underground Shaft #3, Level 4 (Seam-V)",
            "title": "Missing Flameproof Electrical Cable Glands",
            "description": "FLPM junction box at pump station missing double-compression brass cable glands, risking flame propagation.",
            "severity": "High",
            "likelihood": "Medium",
            "recurrence_count": 1,
            "risk_score": 56.0,
            "risk_category": "HIGH",
            "status": "Resolved",
            "escalation_level": "Level 1 - Mine Level",
            "reported_by": "Rajesh Sharma",
            "contributing_factors": {"High Severity": 24.0, "Medium Likelihood": 12.5, "Standard Compliance": 10.0, "Resolved Quickly": 9.5}
        },
        {
            "violation_id": "VIO-2026-0010",
            "inspection_id": 2,
            "mine_id": 2,
            "domain": "Environment",
            "location": "Crusher Transfer Point #4",
            "title": "Haul Road Water Sprinkler Line Burst",
            "description": "50mm HDPE water delivery line punctured by excavator tracks, disabling dust suppression for 36 hours.",
            "severity": "Medium",
            "likelihood": "Medium",
            "recurrence_count": 1,
            "risk_score": 42.0,
            "risk_category": "MEDIUM",
            "status": "Resolved",
            "escalation_level": "Level 1 - Mine Level",
            "reported_by": "S. Sengupta",
            "contributing_factors": {"Medium Severity": 15.0, "Medium Likelihood": 12.5, "Repair Underway": 8.5, "Location Factor": 6.0}
        },
        {
            "violation_id": "VIO-2026-0011",
            "inspection_id": 18,
            "mine_id": 1,
            "domain": "Safety",
            "location": "Underground Main Incline Conveyor Head",
            "title": "Emergency Pull Cord Switch Jammed by Coal Accumulation",
            "description": "Spillage around conveyor transfer chute prevented tension trip of the statutory emergency stop line.",
            "severity": "Medium",
            "likelihood": "Medium",
            "recurrence_count": 1,
            "risk_score": 45.0,
            "risk_category": "MEDIUM",
            "status": "Resolved",
            "escalation_level": "Level 1 - Mine Level",
            "reported_by": "Rajesh Sharma",
            "contributing_factors": {"Medium Severity": 15.0, "Medium Likelihood": 12.5, "Quick Clearance": 10.0, "Low Recurrence": 7.5}
        },
        {
            "violation_id": "VIO-2026-0012",
            "inspection_id": 6,
            "mine_id": 1,
            "domain": "Environment",
            "location": "Effluent Sedimentation Pond #2",
            "title": "Sludge Siltation in Sump Settling Chamber",
            "description": "Silt retention reached 80% capacity before monsoon onset, requiring dredging.",
            "severity": "Low",
            "likelihood": "Medium",
            "recurrence_count": 1,
            "risk_score": 28.0,
            "risk_category": "MEDIUM",
            "status": "Resolved",
            "escalation_level": "Level 1 - Mine Level",
            "reported_by": "Kavita Rao",
            "contributing_factors": {"Low Severity": 7.5, "Medium Likelihood": 12.5, "Routine Dredging": 4.0, "Low Urgency": 4.0}
        },
        {
            "violation_id": "VIO-2026-0013",
            "inspection_id": 5,
            "mine_id": 4,
            "domain": "Production",
            "location": "Opencast Heavy Earthmoving Fleet Pit C",
            "title": "Tail Light Defect on Haul Truck #HT-108",
            "description": "Rear LED brake lights intermittent during night haulage shift.",
            "severity": "Low",
            "likelihood": "Low",
            "recurrence_count": 1,
            "risk_score": 18.0,
            "risk_category": "LOW",
            "status": "Resolved",
            "escalation_level": "Level 1 - Mine Level",
            "reported_by": "Sanjay Chouhan",
            "contributing_factors": {"Low Severity": 7.5, "Low Likelihood": 5.0, "Immediate Bulb Swap": 3.0, "Low Impact": 2.5}
        },
        {
            "violation_id": "VIO-2026-0014",
            "inspection_id": 7,
            "mine_id": 2,
            "domain": "Safety",
            "location": "Opencast Blasting Bench #4",
            "title": "Warning Siren Sound Decibel Attenuation",
            "description": "Battery terminal corrosion on outdoor blast siren reduced audible alert range from 1000m to 400m.",
            "severity": "Medium",
            "likelihood": "Low",
            "recurrence_count": 1,
            "risk_score": 32.0,
            "risk_category": "MEDIUM",
            "status": "Resolved",
            "escalation_level": "Level 1 - Mine Level",
            "reported_by": "M. K. Jha",
            "contributing_factors": {"Medium Severity": 15.0, "Low Likelihood": 5.0, "Backup Horn Active": 6.0, "Quick Fix": 6.0}
        },
        {
            "violation_id": "VIO-2026-0015",
            "inspection_id": 14,
            "mine_id": 1,
            "domain": "Labour",
            "location": "Underground Substation 3 Sanitation Point",
            "title": "First-Aid Splint Box Missing Antiseptic Salve",
            "description": "First-aid inventory inspection noted depletion of burn ointment tubes.",
            "severity": "Low",
            "likelihood": "Low",
            "recurrence_count": 1,
            "risk_score": 15.0,
            "risk_category": "LOW",
            "status": "Resolved",
            "escalation_level": "Level 1 - Mine Level",
            "reported_by": "G. N. Murthy",
            "contributing_factors": {"Low Severity": 7.5, "Low Likelihood": 5.0, "Restocked in 2 Hours": 2.5}
        }
    ]

    for v in violations_data:
        db.add(Violation(**v))
    db.commit()

    # 7. Corrective Actions (10+ CAPA workflows in various stages)
    today = date.today()
    capa_data = [
        {
            "case_id": "CAPA-2026-0001",
            "violation_id": 1,
            "mine_id": 1,
            "location": "Underground Shaft #3, Level 4 (Seam-V)",
            "description": "Replace faulty unloader valves on hydraulic power pack; re-pressurize chocks 14-18 to 160 bar and conduct 24-hr pressure transducer log.",
            "risk_score": 88.5,
            "priority": "Critical",
            "assigned_person": "Er. Alok Ranjan (Colliery Mechanical Engineer)",
            "created_date": (today - timedelta(days=6)).isoformat(),
            "due_date": (today - timedelta(days=2)).isoformat(),  # Overdue!
            "status": "In Progress",
            "completion_evidence": None,
            "verification_notes": None,
            "verified_by": None,
            "closed_date": None
        },
        {
            "case_id": "CAPA-2026-0002",
            "violation_id": 2,
            "mine_id": 1,
            "location": "Gallery 12-East Main Return Airway",
            "description": "Clear rockfall obstruction in return duct; install 15kW auxiliary booster fan and verify air velocity reaches minimum 1.2 m/s.",
            "risk_score": 86.0,
            "priority": "Critical",
            "assigned_person": "P. K. Verma (Ventilation Officer)",
            "created_date": (today - timedelta(days=4)).isoformat(),
            "due_date": (today + timedelta(days=1)).isoformat(),
            "status": "Assigned",
            "completion_evidence": None,
            "verification_notes": None,
            "verified_by": None,
            "closed_date": None
        },
        {
            "case_id": "CAPA-2026-0003",
            "violation_id": 3,
            "mine_id": 2,
            "location": "Haul Road Crusher Hopper Section",
            "description": "Overhaul water filter bank and clean spray nozzles. Deploy mobile 20,000L water bowser as immediate dust suppression backup.",
            "risk_score": 72.0,
            "priority": "High",
            "assigned_person": "Sunil Tiwari (Apex Infrastructure Lead)",
            "created_date": (today - timedelta(days=5)).isoformat(),
            "due_date": (today - timedelta(days=1)).isoformat(),  # Overdue!
            "status": "Awaiting Verification",
            "completion_evidence": "All 18 spray nozzles descaled and pressurized to 6 bar. 2x mobile mist bowsers operational on 24-hr duty cycle.",
            "evidence_url": "/uploads/spray_repair_log.pdf",
            "verification_notes": "Pending manager onsite inspection.",
            "verified_by": None,
            "closed_date": None
        },
        {
            "case_id": "CAPA-2026-0004",
            "violation_id": 4,
            "mine_id": 3,
            "location": "Surface Screening Plant Contractor Quarters",
            "description": "Withdraw all 24 uncertified operators from heavy HEMM operations. Schedule expedited 3-day DGMS Vocational Training course.",
            "risk_score": 64.0,
            "priority": "High",
            "assigned_person": "Tapan Karmakar (Contractor Supervisor)",
            "created_date": (today - timedelta(days=7)).isoformat(),
            "due_date": (today + timedelta(days=3)).isoformat(),
            "status": "In Progress",
            "completion_evidence": "Course registration roster submitted to DGMS Sitarampur training centre.",
            "verification_notes": None,
            "verified_by": None,
            "closed_date": None
        },
        {
            "case_id": "CAPA-2026-0005",
            "violation_id": 5,
            "mine_id": 3,
            "location": "Continuous Miner Section 2",
            "description": "Emergency pick changeout on continuous miner cutter drum; inspect water spray pressure gauge and replace worn tungsten bits.",
            "risk_score": 68.0,
            "priority": "High",
            "assigned_person": "Debabrata Banerjee (Mine Manager)",
            "created_date": (today - timedelta(days=2)).isoformat(),
            "due_date": (today + timedelta(days=2)).isoformat(),
            "status": "Assigned",
            "completion_evidence": None,
            "verification_notes": None,
            "verified_by": None,
            "closed_date": None
        },
        {
            "case_id": "CAPA-2026-0006",
            "violation_id": 6,
            "mine_id": 3,
            "location": "Underground Longwall Panel #1",
            "description": "Mandatory gate check-in inspection by shift overseer; issue replacement chinstrap helmets and enforce zero-entry rule.",
            "risk_score": 62.0,
            "priority": "High",
            "assigned_person": "M. K. Jha (Safety Officer)",
            "created_date": (today - timedelta(days=8)).isoformat(),
            "due_date": (today - timedelta(days=3)).isoformat(),
            "status": "Reopened",
            "completion_evidence": "Re-issued helmets but follow-up inspection noted two drillers still without chinstraps.",
            "verification_notes": "Reopened by Safety Head due to continued partial non-compliance during surprise check.",
            "verified_by": "Harishankar Trivedi",
            "closed_date": None
        },
        {
            "case_id": "CAPA-2026-0007",
            "violation_id": 7,
            "mine_id": 4,
            "location": "Dragline Marion 8050 Walking Section",
            "description": "Perform structural magnetic particle inspection on hoist pulley bracket; procure replacement certified bearing assembly.",
            "risk_score": 58.0,
            "priority": "High",
            "assigned_person": "Sanjay Chouhan (Mine Manager)",
            "created_date": (today - timedelta(days=10)).isoformat(),
            "due_date": (today + timedelta(days=5)).isoformat(),
            "status": "In Progress",
            "completion_evidence": "Ultrasonic scan completed; replacement bearing dispatched from OEM warehouse.",
            "verification_notes": None,
            "verified_by": None,
            "closed_date": None
        },
        {
            "case_id": "CAPA-2026-0008",
            "violation_id": 8,
            "mine_id": 4,
            "location": "Contractor Barracks Camp 3",
            "description": "Install 6x 5kg ABC dry-chemical extinguishers and install mesh cross-ventilation wall louvers in living barracks.",
            "risk_score": 52.0,
            "priority": "Medium",
            "assigned_person": "Arunendra Singh (Site Officer)",
            "created_date": (today - timedelta(days=12)).isoformat(),
            "due_date": (today + timedelta(days=4)).isoformat(),
            "status": "In Progress",
            "completion_evidence": None,
            "verification_notes": None,
            "verified_by": None,
            "closed_date": None
        },
        {
            "case_id": "CAPA-2026-0009",
            "violation_id": 9,
            "mine_id": 1,
            "location": "Underground Shaft #3, Level 4 (Seam-V)",
            "description": "Install certified flameproof brass glands with neoprene seals on electrical terminal box #FLPM-4.",
            "risk_score": 56.0,
            "priority": "Medium",
            "assigned_person": "Er. Alok Ranjan",
            "created_date": (today - timedelta(days=15)).isoformat(),
            "due_date": (today - timedelta(days=10)).isoformat(),
            "status": "Closed",
            "completion_evidence": "Flameproof certified glands fitted and torqued. Insulation resistance test verified at > 50 Mega-ohms.",
            "evidence_url": "/uploads/flameproof_cert_verified.jpg",
            "verification_notes": "Physically inspected and approved. All clearances compliant with CMR 2017.",
            "verified_by": "Col. Vikramjit Sengupta",
            "closed_date": (today - timedelta(days=9)).isoformat()
        },
        {
            "case_id": "CAPA-2026-0010",
            "violation_id": 10,
            "mine_id": 2,
            "location": "Crusher Transfer Point #4",
            "description": "Excavate damaged HDPE pipeline section and weld high-density flange sleeve. Restore full 6 bar water pressure.",
            "risk_score": 42.0,
            "priority": "Medium",
            "assigned_person": "Ramesh Patel (Haulage Logistics Lead)",
            "created_date": (today - timedelta(days=14)).isoformat(),
            "due_date": (today - timedelta(days=8)).isoformat(),
            "status": "Closed",
            "completion_evidence": "Pipeline electro-fusion welded and tested at 8 bar. Spray nozzles operating normally.",
            "evidence_url": "/uploads/pipe_repair.jpg",
            "verification_notes": "Verified operational suppression during active truck dumping.",
            "verified_by": "P. K. Verma",
            "closed_date": (today - timedelta(days=7)).isoformat()
        }
    ]

    for ca in capa_data:
        db.add(CorrectiveAction(**ca))
    db.commit()

    # 8. Grievances (10 realistic grievances)
    grievances_data = [
        {"grievance_id": "GRV-2026-0001", "category": "Worker safety", "mine_id": 1, "description": "Hydraulic props on Seam 4 showing alarming pressure drop during Shift B drilling.", "submitted_by": "Ram Avtar Yadav (Face Driller)", "submission_date": "2026-11-12", "priority": "Critical", "assigned_person": "Colliery Safety Officer", "status": "In Progress", "resolution": None, "resolved_date": None},
        {"grievance_id": "GRV-2026-0002", "category": "Environmental issues", "mine_id": 2, "description": "Excessive black dust accumulation around residential colony quarters near Haul Road.", "submitted_by": "Meera Devi (Local Resident)", "submission_date": "2026-11-11", "priority": "High", "assigned_person": "Environmental Officer", "status": "Under Review", "resolution": None, "resolved_date": None},
        {"grievance_id": "GRV-2026-0003", "category": "Labour welfare", "mine_id": 3, "description": "Delay in disbursal of quarterly statutory uniform and safety boot allowances for contract haulers.", "submitted_by": "Santosh Mahato (Union Representative)", "submission_date": "2026-11-10", "priority": "Medium", "assigned_person": "Welfare Officer", "status": "Resolved", "resolution": "Finance department cleared payroll credit on 2026-11-13.", "resolved_date": "2026-11-13"},
        {"grievance_id": "GRV-2026-0004", "category": "Equipment", "mine_id": 4, "description": "Continuous radio static and dead zones on VHF walkie-talkie channel 4 inside Opencast Pit C.", "submitted_by": "Dinesh Kushwaha (Dumper Operator)", "submission_date": "2026-11-09", "priority": "High", "assigned_person": "Telecommunications Lead", "status": "In Progress", "resolution": None, "resolved_date": None},
        {"grievance_id": "GRV-2026-0005", "category": "Facilities", "mine_id": 1, "description": "Potable water chiller at Underground Pit-Bottom Station #2 dispensing lukewarm turbid water.", "submitted_by": "Bikash Karmakar (Pump Operator)", "submission_date": "2026-11-08", "priority": "Medium", "assigned_person": "Colliery Services In-charge", "status": "Resolved", "resolution": "Replaced RO ceramic filter cartridge and refrigerant gas charged.", "resolved_date": "2026-11-10"},
        {"grievance_id": "GRV-2026-0006", "category": "Worker safety", "mine_id": 3, "description": "Lack of high-visibility reflective raincoats for coal screening night-shift workers.", "submitted_by": "Mohan Roy (Screener)", "submission_date": "2026-11-07", "priority": "High", "assigned_person": "Safety Officer", "status": "Resolved", "resolution": "Distributed 85 DGMS certified 3M reflective jackets from central stores.", "resolved_date": "2026-11-09"},
        {"grievance_id": "GRV-2026-0007", "category": "Labour welfare", "mine_id": 4, "description": "Overcrowding in night shift employee transport buses causing severe safety concerns.", "submitted_by": "Jagdish Prasad (Excavator Helper)", "submission_date": "2026-11-05", "priority": "Medium", "assigned_person": "Administration Head", "status": "Under Review", "resolution": None, "resolved_date": None},
        {"grievance_id": "GRV-2026-0008", "category": "Environmental issues", "mine_id": 1, "description": "Pungent sulphur smell detected near Seam 4 old goaf seal after heavy weekend rain.", "submitted_by": "R. K. Mondal (Overman)", "submission_date": "2026-11-04", "priority": "Critical", "assigned_person": "Mine Manager", "status": "Resolved", "resolution": "Nitrogen flushing applied; goaf seal reinforced with airtight plastering.", "resolved_date": "2026-11-06"},
        {"grievance_id": "GRV-2026-0009", "category": "Equipment", "mine_id": 2, "description": "Air conditioner compressor failure in heavy drill cabin causing heat exhaustion in 42°C heat.", "submitted_by": "Subhash Sahu (Drill Operator)", "submission_date": "2026-11-03", "priority": "High", "assigned_person": "Workshop In-charge", "status": "Resolved", "resolution": "Installed new rotary AC compressor and heat-reflective window tinting.", "resolved_date": "2026-11-05"},
        {"grievance_id": "GRV-2026-0010", "category": "Other issues", "mine_id": 3, "description": "Canteen food quality inspection requested due to cases of acute gastroenteritis among Shift A crew.", "submitted_by": "Pradip Mukherjee (Timber Mistry)", "submission_date": "2026-11-02", "priority": "Medium", "assigned_person": "Canteen Management Committee", "status": "Resolved", "resolution": "Canteen vendor replaced; kitchen hygiene certified by District Food Inspector.", "resolved_date": "2026-11-04"}
    ]

    for g in grievances_data:
        db.add(Grievance(**g))
    db.commit()

    # 9. Sample Digitized Documents
    docs_data = [
        {
            "document_id": "DOC-2026-0001",
            "filename": "DGMS_Safety_Inspection_Report_Shaft3.pdf",
            "file_path": "/uploads/sample_doc1.pdf",
            "file_type": ".pdf",
            "uploaded_by": "Rajesh Sharma",
            "mine_id": 1,
            "related_entity_type": "Violation",
            "related_entity_id": "VIO-2026-0001",
            "ocr_text": "GOVERNMENT OF INDIA - DIRECTORATE GENERAL OF MINES SAFETY\nStatutory Workplace Safety Audit Report\nMine: North Jharia Coal Mine\nLocation: Underground Shaft #3, Level 4 (Seam-V)\nDate: 2026-11-14\nInspector: DGMS Statutory Inspector R. Sharma\nFinding: Hydraulic setting pressure bled down to 35 bar (required statutory minimum 150 bar).\nStatus: Non-Compliant\nSeverity: Critical",
            "extracted_fields": {
                "document_type": "DGMS Statutory Safety Audit",
                "detected_mine": "North Jharia Coal Mine",
                "domain": "Safety",
                "inspection_date": "2026-11-14",
                "certifying_inspector": "DGMS Statutory Inspector R. Sharma",
                "compliance_status": "Non-Compliant",
                "estimated_severity": "Critical",
                "key_observations": ["Hydraulic setting pressure bled down to 35 bar.", "Catastrophic roof collapse hazard."]
            },
            "ocr_status": "Success"
        },
        {
            "document_id": "DOC-2026-0002",
            "filename": "Ambient_Air_Quality_Pollution_Certificate.pdf",
            "file_path": "/uploads/sample_doc2.pdf",
            "file_type": ".pdf",
            "uploaded_by": "S. Sengupta",
            "mine_id": 2,
            "related_entity_type": "Violation",
            "related_entity_id": "VIO-2026-0003",
            "ocr_text": "STATE POLLUTION CONTROL BOARD - AMBIENT DUST MONITORING\nDocument: PCB/ENV/KORBA/2026/089\nMine Name: Central Korba Coal Mine\nLocation: Haul Road Crusher Hopper Section\nDate: 2026-11-13\nRespirable Dust: 3.42 mg/m3 (Permissible ceiling: 2.0 mg/m3).\nStatus: Non-Compliant\nSeverity: High",
            "extracted_fields": {
                "document_type": "Pollution Control Board Air Quality Certificate",
                "detected_mine": "Central Korba Coal Mine",
                "domain": "Environment",
                "inspection_date": "2026-11-13",
                "certifying_inspector": "S. Sengupta (Senior Environmental Auditor)",
                "compliance_status": "Non-Compliant",
                "estimated_severity": "High",
                "key_observations": ["Respirable dust measured at 3.42 mg/m3.", "Haul road sprinkler bank broken."]
            },
            "ocr_status": "Success"
        }
    ]
    for d in docs_data:
        db.add(Document(**d))
    db.commit()

    # 10. Chained SHA-256 Audit Trail (30+ sequential records)
    audit_events = [
        ("admin", "SYSTEM_INIT", "System", "SYS-001", "Initial genesis block for MineGuard AI patent governance ledger."),
        ("admin", "CREATE_MINE", "Mine", "1", "Registered North Jharia Coal Mine (NJCM-01) in Dhanbad Coalfield."),
        ("admin", "CREATE_MINE", "Mine", "2", "Registered Central Korba Coal Mine (CKCM-02) in Hasdeo Arand Basin."),
        ("admin", "CREATE_MINE", "Mine", "3", "Registered Eastern Raniganj Mine (ERM-03) in Asansol Sub-division."),
        ("admin", "CREATE_MINE", "Mine", "4", "Registered Western Singrauli Mine (WSM-04) in Singrauli Energy Belt."),
        ("admin", "CREATE_USER", "User", "1", "Provisioned user account 'inspector' for Rajesh Sharma."),
        ("admin", "CREATE_USER", "User", "2", "Provisioned user account 'manager' for Col. Vikramjit Sengupta."),
        ("admin", "CREATE_USER", "User", "4", "Provisioned auditor access for DGMS Chief Auditor H. Trivedi."),
        ("inspector", "INSPECTION_SUBMITTED", "Inspection", "INSP-2026-0001", "Field inspection submitted for Underground Shaft #3. Non-compliant items identified."),
        ("inspector", "AUTO_VIOLATION_GENERATED", "Violation", "VIO-2026-0001", "Generated Critical Violation VIO-2026-0001 (Hydraulic Powered Roof Support Pressure Loss)."),
        ("inspector", "AUTO_CAPA_CREATED", "CorrectiveAction", "CAPA-2026-0001", "Automatically initiated CAPA-2026-0001 assigned to Colliery Mechanical Engineer."),
        ("admin", "ESCALATION_TRIGGERED", "Violation", "VIO-2026-0001", "System elevated violation VIO-2026-0001 to Level 3 - Regulatory Authority."),
        ("inspector", "INSPECTION_SUBMITTED", "Inspection", "INSP-2026-0002", "Field inspection submitted for Haul Road Crusher Hopper Section."),
        ("inspector", "AUTO_VIOLATION_GENERATED", "Violation", "VIO-2026-0003", "Auto-generated High Violation VIO-2026-0003 (Respirable Coal Dust Exceeding Permissible Ceiling)."),
        ("inspector", "INSPECTION_SUBMITTED", "Inspection", "INSP-2026-0003", "Field inspection submitted for Gallery 12-East Main Return Airway."),
        ("inspector", "AUTO_VIOLATION_GENERATED", "Violation", "VIO-2026-0002", "Auto-generated Critical Violation VIO-2026-0002 (Air Stagnation and Methane Gas Build-up)."),
        ("manager", "CAPA_STATUS_IN_PROGRESS", "CorrectiveAction", "CAPA-2026-0001", "Er. Alok Ranjan acknowledged assignment and began power pack overhaul."),
        ("manager", "CAPA_STATUS_AWAITING_VERIFICATION", "CorrectiveAction", "CAPA-2026-0003", "Sunil Tiwari submitted repair completion evidence for crusher spray nozzles."),
        ("manager", "CAPA_STATUS_CLOSED", "CorrectiveAction", "CAPA-2026-0009", "Col. Vikramjit Sengupta verified flameproof brass gland installation and closed case."),
        ("manager", "CAPA_STATUS_CLOSED", "CorrectiveAction", "CAPA-2026-0010", "P. K. Verma verified water delivery pipeline replacement and closed case."),
        ("auditor", "AUDIT_VERIFIED", "AuditLog", "CHAIN-CHECK", "DGMS Chief Auditor executed SHA-256 integrity scan. 100% blocks intact."),
        ("inspector", "DOCUMENT_DIGITIZED", "Document", "DOC-2026-0001", "Digitized DGMS Safety Inspection Report via OCR service."),
        ("inspector", "DOCUMENT_DIGITIZED", "Document", "DOC-2026-0002", "Digitized Ambient Air Quality Pollution Certificate via OCR service."),
        ("manager", "CONTRACTOR_AUDIT", "Contractor", "CNT-2026-0001", "Updated Apex Mining compliance score to 78.5% and placed on probation."),
        ("manager", "GRIEVANCE_RESOLVED", "Grievance", "GRV-2026-0003", "Welfare officer resolved worker allowance payment dispute."),
        ("manager", "GRIEVANCE_RESOLVED", "Grievance", "GRV-2026-0006", "Safety officer dispatched 85 high-visibility reflective raincoats."),
        ("admin", "AI_ML_SYNC", "AI_Engine", "MODEL-01", "Ran IsolationForest anomaly detection on live mining telemetry. Flagged 3 hotspots.")
    ]

    for (user, action, ent_type, ent_id, desc) in audit_events:
        record_audit_log(
            db=db,
            user=user,
            action=action,
            entity_type=ent_type,
            entity_id=ent_id,
            previous_value="",
            new_value="VERIFIED",
            description=desc
        )

    print("--- MineGuard AI Database Seed Complete! ---")
