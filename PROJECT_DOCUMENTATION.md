# MineGuard AI: Comprehensive Project Report & Presentation Guide

## 1. Project Title & Academic Patent Overview

- **Patent Research Title:** *AI-Based Intelligent System and Method for Automated Governance and Multi-Domain Compliance Monitoring in Coal Mines*
- **Application Name:** **MineGuard AI**
- **Subtitle:** *Intelligent Mine Governance & Multi-Domain Compliance Monitoring System*
- **Regulatory Framework:** Directorate General of Mines Safety (DGMS), Coal Mines Regulations (CMR 2017), Mines Act 1952.

---

## 2. Problem Statement: Why MineGuard AI Was Built

Coal mining is one of the world's most hazardous heavy industries. Existing governance systems suffer from critical structural weaknesses:

1. **Fragmented, Paper-Based Silos:** Safety inspections, environmental telemetry, production quotas, and labour/contractor records reside in disconnected logbooks and spreadsheets.
2. **Subjective & Unquantified Risk:** Inspections rely on qualitative impressions rather than rigorous, repeatable mathematical risk scoring.
3. **Audit Trail Tampering:** Paper logs and standard relational databases can be retroactively modified or deleted following accidents to evade statutory liability.
4. **Delayed Incident Lifecycle:** When hazards (e.g., methane accumulation, defective flameproof seals) are discovered, the delay between field inspection, management assignment, and verified closure often spans weeks.
5. **Lack of Predictive Insights:** Mining authorities cannot detect recurring violation patterns across geographic zones or predict high-risk hotspots before catastrophic incidents occur.

**MineGuard AI** solves this by establishing a centralized, automated, and tamper-evident digital governance ecosystem powered by AI risk modeling and machine learning.

---

## 3. System Architecture & Tech Stack

```
+-----------------------------------------------------------------------------------+
|                              PRESENTATION LAYER (UI)                              |
|   React 19 + TypeScript + Vite + Tailwind CSS v4 + Recharts + Leaflet GIS Maps   |
|   Role-Based Views: Inspector | Manager | Corporate Admin | Statutory Auditor     |
|   Bilingual Localization: English (EN) and Hindi (HI)                             |
+-----------------------------------------------------------------------------------+
                                        |  REST APIs / JWT Bearer
                                        v
+-----------------------------------------------------------------------------------+
|                             APPLICATION LAYER (FastAPI)                           |
|   FastAPI REST Engine | JWT Role-Based Access Control | Starlette CORS Middleware  |
+-----------------------------------------------------------------------------------+
        |                          |                          |
        v                          v                          v
+------------------+      +-------------------+      +------------------+
|  AI Risk Engine  |      |   Scikit-Learn    |      | Cryptographic    |
|  Multi-Factor    |      |   ML Engine       |      | SHA-256 Ledger   |
|  Weighted Patent |      |   IsolationForest |      | Hash-Chained     |
|  Formula (0-100) |      |   Hotspot Cluster |      | Tamper-Evident   |
+------------------+      +-------------------+      +------------------+
        |                          |                          |
        +--------------------------+--------------------------+
                                   |
                                   v
+-----------------------------------------------------------------------------------+
|                                DATA & STORAGE LAYER                               |
|   SQLite (Local Execution) / PostgreSQL (Cloud Deployment) via SQLAlchemy ORM     |
|   Pre-seeded: 4 Mines, 22+ Inspections, 31 Compliance Items, 44+ Audit Blocks     |
|   Local Disk File Storage for Photographic & PDF Rectification Evidence           |
+-----------------------------------------------------------------------------------+
```

---

## 4. Key Modules & Functional Walkthrough

### 4.1. Main Governance Dashboard
- **Dynamic KPI Cards:** Total Mines, Inspections, Compliant vs. Non-Compliant records, Open Violations, Overdue CAPA actions, Critical Risk Cases, and Overall Compliance Percentage calculated in real-time from the database.
- **Analytical Recharts:**
  1. Compliance Status Distribution (Compliant, Partially Compliant, Non-Compliant, Pending).
  2. Violations categorized across 4 Statutory Domains.
  3. Monthly Inspection Trends.
  4. Risk Distribution: Low (0-24), Medium (25-49), High (50-74), Critical (75-100).
  5. Inter-Mine Compliance Benchmarking.
  6. Recurring Violation Frequencies.
- **Audit Activity Feed:** Real-time stream of newly filed inspections, escalated violations, and closed CAPA workflows.

---

### 4.2. Multi-Domain Compliance Monitoring
Governance is split across four distinct statutory domains:
- **Safety:** PPE adherence, underground ventilation velocities, conveyor emergency pull-cords, methane/toxic gas thresholds, flameproof electrical enclosures.
- **Environment:** Dust suppression water sprays, effluent water pH/turbidity, ambient air PM10/PM2.5, topsoil rehabilitation.
- **Production:** Dragline/shovel operational fitness, bench slope stability, statutory production quota monitoring.
- **Labour & Contractors:** High-risk medical fitness certificates, vocational training adherence (VTC), attendance logs, contractor safety ratings.

Includes real-time domain filtering, severity filtering, status updates, and search.

---

### 4.3. Digital Field Inspections
- Mobile-friendly checklist submission form for DGMS certified inspectors.
- Allows selection of mine leasehold, exact underground zone/bench location, domain, and specific statutory checklist items.
- **Automated Workflow on Submission:**
  1. Evaluates compliant vs. non-compliant items.
  2. Dynamically triggers the **AI Risk Engine**.
  3. Automatically spawns a **Violation Record** for failed items.
  4. Automatically opens a **Corrective Action (CAPA)** case with statutory priority and due date.
  5. Commits a cryptographic transaction to the **SHA-256 Audit Trail**.

---

### 4.4. The AI Risk Engine (Core Patent Contribution)
Rather than qualitative guesswork, the system implements a weighted mathematical formula:

$$\text{Risk Score} = (S \times 0.30) + (L \times 0.25) + (R \times 0.15) + (O \times 0.15) + (H \times 0.15)$$

Where:
- $S$ = Severity Score (Normalized 0–100)
- $L$ = Likelihood Score (Normalized 0–100)
- $R$ = Recurrence Frequency Factor
- $O$ = Days Overdue Penalty Factor
- $H$ = Location / Contractor Violation History Factor

#### Classification Tiers:
- **0 – 24 (LOW - Green):** Routine observation; standard monitoring.
- **25 – 49 (MEDIUM - Blue):** Minor hazard; 14-day rectification window.
- **50 – 74 (HIGH - Amber):** Serious statutory breach; 72-hour rectification window.
- **75 – 100 (CRITICAL - Red):** Imminent danger; immediate work stoppage notice issued.

Every calculation returns an **explainability breakdown** showing exact point contributions (e.g., `+27 Severity`, `+22 Likelihood`, `+15 Repeated Violation`).

---

### 4.5. Machine Learning Anomaly & Hotspot Detection
- Built with **Scikit-Learn** using the `IsolationForest` unsupervised algorithm.
- Evaluates multi-dimensional feature vectors: severity, likelihood, recurrence counts, overdue days, and contractor historical incident frequency.
- **Capabilities:**
  - Flags statistical outliers (unusual deviations from baseline mine safety).
  - Groups repeat offenses into high-risk **Hotspot Clusters** (e.g., *"Repeated ventilation failures in Seam 4, Sector 2"*).
  - Explicitly labeled as trained on synthetic demonstration data adhering to DGMS protocols.

---

### 4.6. Corrective and Preventive Action (CAPA) Workflow
Implements a strict 6-stage finite state lifecycle:
$$\text{Violation Detected} \longrightarrow \text{Assigned} \longrightarrow \text{In Progress} \longrightarrow \text{Awaiting Verification} \longrightarrow \text{Closed} \text{ (or Reopened)}$$
- Mine Managers can assign responsible engineers, log actions taken, and upload photographic rectification evidence.
- Verified closure requires formal digital sign-off.

---

### 4.7. Cryptographic SHA-256 Tamper-Evident Ledger
To prevent post-accident record alteration, every create/update action forms a cryptographically linked block:
$$\text{Block Hash} = \text{SHA256}(\text{Index} + \text{Timestamp} + \text{User} + \text{Action} + \text{Payload} + \text{Previous Block Hash})$$
- The system includes a live **1-Click Audit Chain Integrity Validator** that recalculates the cryptographic chain across all blocks.
- If any database record or hash is modified, the validator flags the exact block index where tampering occurred.

---

### 4.8. Leaflet GIS Geospatial Visualization
- Real-time interactive map plotting active coal mining leaseholds across Jharkhand and Chhattisgarh (e.g., North Jharia, Moonidih Deep, Gevra Mega OC, Dipka OC).
- Color-coded risk markers based on live mine-specific violation density.
- Interactive popups displaying production figures, active violations, and direct drilldown links.

---

### 4.9. Tesseract OCR & Document Digitization
- Allows uploading scanned statutory notices, DGMS Form IV memos, and physical inspection certificates.
- Extracts raw text using OCR and applies heuristic pattern matching to extract Mine Name, Date, Severity, and Recommended Action.
- Enables 1-click conversion into an active system violation.

---

### 4.10. Statutory Report Generation (CSV & PDF)
- **CSV:** Raw tabular data export for external statistical packages.
- **ReportLab PDF Dossier:** Generates official government-style compliance dossiers with DGMS header, cryptographic audit watermark, executive summary, and violation tables.

---

### 4.11. Bilingual Support (English & Hindi)
- Includes an instant global language switch (`EN` / `HI`) catering to field personnel across Indian mining belts.
- Translates navigation menus, KPI cards, table headers, and status badges.

---

## 5. Demo Accounts & Role Permissions

| Role | Username | Password | Scope of Authority |
| :--- | :--- | :--- | :--- |
| **Mine Inspector** | `inspector` | `inspector123` | Assigned mine visibility, checklist execution, hazard reporting, evidence upload. |
| **Mine Manager** | `manager` | `manager123` | Mine dashboard, CAPA assignment, verification, closure sign-off. |
| **Corporate Admin** | `admin` | `admin123` | Multi-mine enterprise dashboard, user management, rule configuration, ML oversight. |
| **Statutory Auditor** | `auditor` | `auditor123` | Read-only DGMS statutory oversight, SHA-256 audit ledger validation, PDF report export. |

---

## 6. Faculty Presentation / Viva Walkthrough Script

When presenting this project to professors, evaluators, or patent examiners, follow this 5-minute structured sequence:

1. **Opening Pitch (60 seconds):**
   > *"Good morning. Today I am presenting MineGuard AI, a working prototype of our patent implementation: 'AI-Based Intelligent System and Method for Automated Governance and Multi-Domain Compliance Monitoring in Coal Mines'. Coal mining accounts for substantial industrial risk where inspections have historically been paper-based and subjective. Our system introduces three major technical innovations: first, an automated multi-domain governance framework; second, an explainable AI risk scoring engine with machine learning anomaly detection; and third, a cryptographic SHA-256 tamper-evident ledger that guarantees inspection logs cannot be retroactively falsified."*

2. **Step 1 — Executive Dashboard & GIS Map (60 seconds):**
   - Log in as `admin`.
   - Show the dynamic KPI cards and Recharts analytics.
   - Navigate to the **GIS Map** to demonstrate geospatial tracking of the 4 pre-seeded coal mines in Dhanbad and Korba.

3. **Step 2 — Field Inspection & Automated AI Risk Calculation (90 seconds):**
   - Switch to `inspector` (using the 1-click demo button).
   - Go to **Field Inspections** &rarr; click **New Inspection**.
   - Fill out an inspection for *North Jharia Coal Mine* with an unsafe ventilation condition.
   - Click **Submit Inspection**.
   - Show how the backend immediately:
     - Calculates a mathematical **Risk Score (e.g., 86/100 - CRITICAL)** with full 5-factor point breakdown.
     - Spawns an automated **Violation**.
     - Generates a **Corrective Action (CAPA)** ticket.

4. **Step 3 — CAPA Lifecycle & Manager Closure (45 seconds):**
   - Log in as `manager`.
   - Open **Corrective Actions**, find the newly spawned case, update status to *In Progress*, attach rectification evidence, and verify closure.

5. **Step 4 — SHA-256 Ledger Validation & Statutory PDF Export (45 seconds):**
   - Log in as `auditor`.
   - Navigate to the **Audit Trail** and click **Verify Chain Integrity**.
   - Point out the green confirmation message verifying that all blocks are unbroken.
   - Click **Export Statutory PDF Dossier** to download the generated PDF.

---

## 7. How to Run Locally

Double-click the `start_local.bat` file in the project root:
- **Frontend URL:** http://localhost:5173
- **Backend API:** http://127.0.0.1:8000
- **API Documentation:** http://127.0.0.1:8000/docs
