# MineGuard AI: Intelligent Mine Governance & Multi-Domain Compliance Monitoring System

> **ACADEMIC PATENT IMPLEMENTATION PROTOTYPE**  
> **Patent Title:** *AI-Based Intelligent System and Method for Automated Governance and Multi-Domain Compliance Monitoring in Coal Mines*  
> **Statutory Baseline:** Directorate General of Mines Safety (DGMS), Coal Mines Regulations (CMR 2017), Mines Act 1952, EPA Standards.

---

## 1. Executive Summary

**MineGuard AI** is a full-stack, enterprise-grade statutory governance and compliance monitoring platform developed to operationalize an academic patent on automated coal mine safety and regulatory oversight.

In coal mining operations, compliance tracking is traditionally siloed, slow, and prone to administrative latency or retrospective record modification. **MineGuard AI** solves this by centralizing:
1. **Multi-Domain Compliance Monitoring** across **Safety, Environment, Production, and Labour**.
2. **Automated AI Risk Scoring** using a real, weighted multivariate mathematical formula.
3. **Machine Learning Anomaly & Recurrence Detection** using Scikit-Learn's **Isolation Forest** to uncover high-risk spatial hotspots and repeat violation clusters.
4. **Closed-Loop Corrective Action (CAPA) Workflow** with strict role-based verification.
5. **Cryptographic SHA-256 Tamper-Evident Hash-Chained Audit Trail** that guarantees zero data falsification.
6. **OCR Document Digitization** that extracts statutory DGMS inspection forms and converts them into live governance records.
7. **Interactive GIS Mine Location Map** showing regional leasehold health and spatial hazard buffers.

---

## 2. Technology Stack

| Layer | Technologies Used |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, Recharts, Leaflet / React-Leaflet |
| **Backend** | Python 3.12, FastAPI, SQLAlchemy ORM, Uvicorn (ASGI) |
| **Database** | SQLite (`mineguard.db`) with relational integrity and automatic schema seeding |
| **AI / Machine Learning** | Scikit-Learn (`IsolationForest`), NumPy, Pandas |
| **Security & Auth** | JWT (`python-jose`), bcrypt password hashing, Role-Based Access Control (RBAC) |
| **Audit Trail** | Deterministic SHA-256 Hash Chaining with live cryptographic integrity verification |
| **Document OCR** | Tesseract OCR (`pytesseract`, Pillow) + Intelligent Statutory Heuristic Fallback Parser |
| **Reporting** | ReportLab PDF engine & dynamic RFC-4180 CSV export |

---

## 3. Demo User Accounts & Role Permissions

The system includes pre-seeded demo accounts representing the 4 statutory coal mining governance tiers:

| Role | Username | Password | Assigned Scope | Key Permissions |
|---|---|---|---|---|
| **Mine Inspector** | `inspector` | `inspector123` | North Jharia Coal Mine | Submit field checklist audits, report hazards, upload evidence, trigger CAPA |
| **Mine Manager** | `manager` | `manager123` | North Jharia Coal Mine | Review mine dashboard, assign actions, verify remediation evidence, close CAPA cases, resolve grievances |
| **Corporate Administrator** | `admin` | `admin123` | Enterprise-wide (All Mines) | Register leaseholds, user provisioning (RBAC), threshold tuning, corporate analytics |
| **Statutory Auditor (DGMS)** | `auditor` | `auditor123` | Regulatory Oversight | Read-only access, verify SHA-256 audit ledger integrity, inspect reports & evidence |

*Note: One-click demo login buttons are provided on the login page for instantaneous switching during faculty evaluation.*

---

## 4. System Architecture & Workflows

### A. Closed-Loop Corrective Action (CAPA) Workflow
```
[Field Inspection / Hazard Observation]
                  │
                  ▼
[AI Risk Scoring Engine (Formula Evaluated 0-100)]
                  │
                  ▼
[Auto-Generated Violation & Escalation Level (1, 2, or 3)]
                  │
                  ▼
[Corrective Action (CAPA) Assigned to Colliery Engineer]
                  │
                  ▼
[Engineer Starts Action ("In Progress")]
                  │
                  ▼
[Field Evidence & Remediation Notes Uploaded ("Awaiting Verification")]
                  │
                  ▼
       [Manager Inspection Review]
          ├── Approved ────► [Case Closed & SHA-256 Block Chained]
          └── Inadequate ──► [Case Reopened for Further Remediation]
```

### B. Mathematical Patent AI Risk Formula
The system implements a true backend risk calculation:
$$\text{Risk Score} = (\text{Severity} \times 0.30) + (\text{Likelihood} \times 0.25) + (\text{Recurrence} \times 0.15) + (\text{Overdue Factor} \times 0.15) + (\text{Location/Contractor History} \times 0.15)$$

- **0 – 24 (LOW):** Standard shift monitoring.
- **25 – 49 (MEDIUM):** Local shift action with weekly committee review.
- **50 – 74 (HIGH):** Level 2 Escalation — Mine General Manager alerted; 24-hr expedited action.
- **75 – 100 (CRITICAL):** Level 3 Escalation — Immediate DGMS liaison and corporate executive intervention.

### C. Cryptographic Tamper-Evident SHA-256 Hash Chain
Every record mutation generates a block hash:
$$\text{Hash}_n = \text{SHA256}(\text{EventID} \parallel \text{Timestamp} \parallel \text{User} \parallel \text{Action} \parallel \text{EntityID} \parallel \text{Hash}_{n-1} \parallel \text{NewValue})$$
Clicking **"Verify Ledger Integrity"** triggers an endpoint that recomputes the chain across 100% of historical events, verifying zero tampering.

---

## 5. Application Pages & Navigation Structure

1. **Dashboard (`/`):** 8 dynamic KPI cards, 6 interactive Recharts analytics, recent audit log feed, and critical statutory alerts banner.
2. **Mines (`/mines`):** Detailed cards for 4 pre-seeded leaseholds (North Jharia, Central Korba, Eastern Raniganj, Western Singrauli) with capacity, workforce, and registration modal.
3. **Compliance Monitoring (`/compliance`):** 4 domain tabs (Safety, Environment, Production, Labour), search, filters, and record creation/editing modals.
4. **Field Inspections (`/inspections`):** Digital audit wizard with 5-item interactive pass/fail checklist that auto-generates violations and CAPA upon submission.
5. **Violations (`/violations`):** Violation tracking with risk score badges, 5-factor contribution bars, and Level 1–3 statutory escalation controls.
6. **Corrective Actions (`/corrective-actions`):** Complete CAPA lifecycle tracking with buttons for "Start Action", "Submit Evidence", "Verify & Close", and "Reopen".
7. **AI Risk & Insights (`/ai-insights`):** Interactive patent risk score calculator + Scikit-Learn Isolation Forest anomaly detection and spatial hotspot list.
8. **GIS Mine Map (`/gis-map`):** Interactive Leaflet map with pulsing custom risk markers, popup details, and 25km hazard buffer overlays.
9. **Document Digitization (`/documents`):** OCR uploader with status indicator, raw text viewer, structured entity parser, and one-click conversion to live records.
10. **Contractors (`/contractors`):** Contractor tracking with compliance ratings, worker rolls, safety violations, and registration modal.
11. **Grievances (`/grievances`):** Bipartite worker and community grievance redressal with category filters and resolution logging.
12. **Reports & Exports (`/reports`):** Downloadable CSV spreadsheets and ReportLab PDF dossiers.
13. **Audit Trail (`/audit`):** Chronological cryptographic ledger with live SHA-256 chain verification button.
14. **User Management (`/users`):** RBAC user provisioning and permissions matrix.
15. **Settings (`/settings`):** DGMS threshold parameters (CH4, dust, CO), offline simulation toggle, and patent diagnostics.

---

## 6. How to Run Locally

### Prerequisites
- Python 3.10+ (Tested on Python 3.12)
- Node.js v18+ and npm (Tested on Node v20.20.0)

### Step 1: Start the Backend (FastAPI)
Open a terminal in the project root:
```powershell
# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Start FastAPI server on port 8000
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
*The database (`mineguard.db`) and all seed data will be created automatically on first run.*  
*API Docs available at: `http://127.0.0.1:8000/docs`*

### Step 2: Start the Frontend (Vite + React)
Open a second terminal in `frontend/`:
```powershell
cd frontend
npm run dev -- --host 127.0.0.1 --port 5173
```
*Open your browser and navigate to: `http://127.0.0.1:5173`*

### Step 3: Run the Automated Test Suite
To verify all 10 core patent criteria:
```powershell
.\venv\Scripts\python.exe backend\test_suite.py
```

---

## 7. Simulated Features & Academic Scope

To maintain academic integrity, the following aspects are clearly disclosed as simulated demonstration features:
1. **Telemetry & Sensor Data:** Methane ppm, respirable dust mg/m3, and air velocity readings are realistic synthetic datasets calibrated to DGMS limits.
2. **GIS Coordinates:** Coordinates represent actual Indian coal mining basins (Dhanbad, Korba, Asansol, Singrauli) for realistic spatial demonstration.
3. **Audit Trail:** Uses single-node cryptographic SHA-256 hash chaining rather than an external distributed blockchain network.
4. **Machine Learning Model:** The Isolation Forest anomaly detector is trained on realistic synthetic coal mining feature distributions.

---

## 8. Faculty Evaluation Walkthrough Script

During an academic project demonstration:
1. **Log in as `inspector`:** Navigate to **Field Inspections** &rarr; Click **"Perform Field Inspection"** &rarr; Mark an item as non-compliant &rarr; Click **"Submit Inspection"**.
2. **Observe Autonomous Workflow:** Show that submitting the inspection automatically created a **Violation**, evaluated the **Risk Score**, and spawned a **Corrective Action (CAPA)**.
3. **Log in as `manager`:** Go to **Corrective Actions** &rarr; Click **"Verify & Close"** &rarr; Enter verification notes &rarr; Case moves to **Closed** and violation resolves.
4. **Demonstrate AI Risk Engine:** Go to **AI Risk & Insights** &rarr; Tweak the Severity, Recurrence, and Overdue sliders &rarr; Show real-time patent factor breakdown bars.
5. **Demonstrate Cryptographic Ledger:** Go to **Audit Trail** &rarr; Click **"Verify Ledger Integrity"** &rarr; Show 100% verified SHA-256 blocks with zero tampering.
6. **Demonstrate Document OCR:** Go to **Document Digitization** &rarr; Inspect extracted DGMS inspection fields &rarr; Click **"Convert to Compliance Record"**.
7. **Demonstrate GIS Map & Reports:** Show Leaflet map with colored risk markers and download a PDF governance report.
