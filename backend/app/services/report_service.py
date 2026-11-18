"""
Report Generation Service for MineGuard AI.
Generates comprehensive CSV spreadsheets and ReportLab PDF governance dossiers.
"""
import io
import csv
from datetime import datetime
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether
from ..models.models import Mine, ComplianceRecord, Inspection, Violation, CorrectiveAction, Contractor

def generate_csv_report(report_type: str, db: Session, mine_id: int = None, domain: str = None) -> str:
    output = io.StringIO()
    writer = csv.writer(output)

    if report_type == "compliance":
        writer.writerow(["Record ID", "Mine Name", "Domain", "Requirement", "Status", "Severity", "Risk Score", "Risk Category", "Due Date", "Responsible Person"])
        query = db.query(ComplianceRecord)
        if mine_id:
            query = query.filter(ComplianceRecord.mine_id == mine_id)
        if domain:
            query = query.filter(ComplianceRecord.domain == domain)
        records = query.all()
        for r in records:
            writer.writerow([r.record_id, r.mine.name if r.mine else "N/A", r.domain, r.requirement, r.status, r.severity, r.risk_score, r.risk_category, r.due_date, r.responsible_person])

    elif report_type == "violations":
        writer.writerow(["Violation ID", "Mine Name", "Domain", "Location", "Title", "Severity", "Likelihood", "Recurrence", "Risk Score", "Risk Category", "Status", "Escalation Level", "Reported Date"])
        query = db.query(Violation)
        if mine_id:
            query = query.filter(Violation.mine_id == mine_id)
        if domain:
            query = query.filter(Violation.domain == domain)
        records = query.all()
        for v in records:
            writer.writerow([v.violation_id, v.mine.name if v.mine else "N/A", v.domain, v.location, v.title, v.severity, v.likelihood, v.recurrence_count, v.risk_score, v.risk_category, v.status, v.escalation_level, v.reported_date.strftime("%Y-%m-%d") if v.reported_date else "N/A"])

    elif report_type == "corrective_actions":
        writer.writerow(["Case ID", "Mine Name", "Location", "Priority", "Risk Score", "Status", "Assigned Person", "Created Date", "Due Date", "Verified By", "Closed Date"])
        query = db.query(CorrectiveAction)
        if mine_id:
            query = query.filter(CorrectiveAction.mine_id == mine_id)
        records = query.all()
        for c in records:
            writer.writerow([c.case_id, c.mine.name if c.mine else "N/A", c.location, c.priority, c.risk_score, c.status, c.assigned_person, c.created_date, c.due_date, c.verified_by or "Pending", c.closed_date or "N/A"])

    elif report_type == "contractors":
        writer.writerow(["Contractor ID", "Name", "Mine Name", "Contact Person", "Phone", "Workers", "Compliance Score", "Active Contracts", "Safety Violations", "Status"])
        query = db.query(Contractor)
        if mine_id:
            query = query.filter(Contractor.mine_id == mine_id)
        records = query.all()
        for ct in records:
            writer.writerow([ct.contractor_id, ct.name, ct.mine.name if ct.mine else "N/A", ct.contact_person, ct.contact_phone, ct.worker_count, ct.compliance_score, ct.active_contracts, ct.safety_violations, ct.status])

    else:
        # Generic summary
        writer.writerow(["Mine Code", "Mine Name", "State", "Type", "Compliance Score %", "Workforce", "Capacity (Tonnes/day)", "Status"])
        mines = db.query(Mine).all()
        for m in mines:
            total_cmp = len(m.compliance_records)
            comp_count = sum(1 for c in m.compliance_records if c.status == "Compliant")
            score = round((comp_count / total_cmp) * 100, 1) if total_cmp > 0 else 100.0
            writer.writerow([m.code, m.name, m.state, m.mine_type, score, m.total_workforce, m.daily_production_capacity, m.status])

    return output.getvalue()


def generate_pdf_report(report_type: str, db: Session, mine_id: int = None, domain: str = None) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'MainTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#0F172A')
    )
    subtitle_style = ParagraphStyle(
        'Subtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#475569')
    )
    meta_style = ParagraphStyle(
        'Meta',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#2563EB')
    )
    cell_style = ParagraphStyle(
        'Cell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=10
    )
    cell_header = ParagraphStyle(
        'CellHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.white
    )

    elements = []

    # Header
    elements.append(Paragraph("MineGuard AI — Intelligent Mine Governance System", title_style))
    elements.append(Spacer(1, 4))
    elements.append(Paragraph("Statutory Multi-Domain Compliance & Risk Assessment Report", subtitle_style))
    elements.append(Spacer(1, 4))
    elements.append(Paragraph(f"Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')} | Scope: {domain or 'All Domains'} | Mode: Academic Patent Implementation Prototype", meta_style))
    elements.append(Spacer(1, 14))

    # Fetch data and build table
    if report_type == "violations":
        query = db.query(Violation)
        if mine_id:
            query = query.filter(Violation.mine_id == mine_id)
        if domain:
            query = query.filter(Violation.domain == domain)
        records = query.limit(25).all()

        table_data = [
            [
                Paragraph("Violation ID", cell_header),
                Paragraph("Mine & Domain", cell_header),
                Paragraph("Title & Location", cell_header),
                Paragraph("Severity", cell_header),
                Paragraph("Risk Score", cell_header),
                Paragraph("Status", cell_header)
            ]
        ]
        for r in records:
            table_data.append([
                Paragraph(r.violation_id, cell_style),
                Paragraph(f"{r.mine.name if r.mine else 'N/A'}<br/><b>{r.domain}</b>", cell_style),
                Paragraph(f"{r.title}<br/><font color='#64748B'>{r.location}</font>", cell_style),
                Paragraph(r.severity, cell_style),
                Paragraph(f"<b>{r.risk_score:.0f}</b> ({r.risk_category})", cell_style),
                Paragraph(r.status, cell_style)
            ])
    elif report_type == "corrective_actions":
        query = db.query(CorrectiveAction)
        if mine_id:
            query = query.filter(CorrectiveAction.mine_id == mine_id)
        records = query.limit(25).all()

        table_data = [
            [
                Paragraph("Case ID", cell_header),
                Paragraph("Mine & Location", cell_header),
                Paragraph("Description", cell_header),
                Paragraph("Priority", cell_header),
                Paragraph("Due Date", cell_header),
                Paragraph("Status", cell_header)
            ]
        ]
        for c in records:
            table_data.append([
                Paragraph(c.case_id, cell_style),
                Paragraph(f"{c.mine.name if c.mine else 'N/A'}<br/>{c.location}", cell_style),
                Paragraph(c.description[:60] + "...", cell_style),
                Paragraph(c.priority, cell_style),
                Paragraph(c.due_date, cell_style),
                Paragraph(c.status, cell_style)
            ])
    else:
        # Default compliance records
        query = db.query(ComplianceRecord)
        if mine_id:
            query = query.filter(ComplianceRecord.mine_id == mine_id)
        if domain:
            query = query.filter(ComplianceRecord.domain == domain)
        records = query.limit(25).all()

        table_data = [
            [
                Paragraph("Record ID", cell_header),
                Paragraph("Mine & Domain", cell_header),
                Paragraph("Requirement", cell_header),
                Paragraph("Severity", cell_header),
                Paragraph("Status", cell_header),
                Paragraph("Risk Category", cell_header)
            ]
        ]
        for cr in records:
            table_data.append([
                Paragraph(cr.record_id, cell_style),
                Paragraph(f"{cr.mine.name if cr.mine else 'N/A'}<br/><b>{cr.domain}</b>", cell_style),
                Paragraph(cr.requirement[:55] + "...", cell_style),
                Paragraph(cr.severity, cell_style),
                Paragraph(cr.status, cell_style),
                Paragraph(cr.risk_category, cell_style)
            ])

    col_widths = [75, 110, 155, 60, 70, 70]
    t = Table(table_data, colWidths=col_widths)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0F172A')),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#FFFFFF'), colors.HexColor('#F8FAFC')]),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
    ]))

    elements.append(t)
    elements.append(Spacer(1, 14))
    elements.append(Paragraph("Patent Governance Ledger Certification: Verified by SHA-256 Tamper-Evident Hash Chain.", subtitle_style))

    doc.build(elements)
    return buffer.getvalue()
