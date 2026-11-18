"""
Hash-based Tamper-Evident Audit Trail Service.
Implements a cryptographic SHA-256 hash-chain (simulated single-node ledger)
guaranteeing data integrity and immutability for statutory mining compliance logs.
"""
import hashlib
from datetime import datetime
from sqlalchemy.orm import Session
from ..models.models import AuditLog

GENESIS_HASH = "0" * 64

def compute_event_hash(
    event_id: str,
    timestamp: datetime,
    user: str,
    action: str,
    entity_type: str,
    entity_id: str,
    prev_hash: str,
    new_value: str = ""
) -> str:
    """
    Computes deterministic SHA-256 hash combining all event attributes and previous event hash.
    """
    ts_str = timestamp.isoformat()
    payload = f"{event_id}|{ts_str}|{user}|{action}|{entity_type}|{entity_id}|{prev_hash}|{new_value or ''}"
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def record_audit_log(
    db: Session,
    user: str,
    action: str,
    entity_type: str,
    entity_id: str,
    previous_value: str = "",
    new_value: str = "",
    description: str = ""
) -> AuditLog:
    """
    Appends a new immutable audit record chained to the hash of the latest record.
    """
    # Fetch last audit record
    last_log = db.query(AuditLog).order_by(AuditLog.id.desc()).first()
    prev_hash = last_log.hash if last_log else GENESIS_HASH

    # Generate sequential event id
    count = db.query(AuditLog).count() + 1
    event_id = f"AUD-2026-{count:05d}"
    now = datetime.utcnow()

    # Compute cryptographic hash
    current_hash = compute_event_hash(
        event_id=event_id,
        timestamp=now,
        user=user,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        prev_hash=prev_hash,
        new_value=new_value
    )

    audit_entry = AuditLog(
        event_id=event_id,
        timestamp=now,
        user=user,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        previous_value=str(previous_value) if previous_value is not None else "",
        new_value=str(new_value) if new_value is not None else "",
        description=description,
        prev_hash=prev_hash,
        hash=current_hash
    )
    db.add(audit_entry)
    db.commit()
    db.refresh(audit_entry)
    return audit_entry


def verify_audit_chain(db: Session) -> dict:
    """
    Audits the entire log chain to detect any manual tampering or deletion in the database.
    """
    logs = db.query(AuditLog).order_by(AuditLog.id.asc()).all()
    total_events = len(logs)
    if total_events == 0:
        return {
            "is_valid": True,
            "total_events": 0,
            "verified_events": 0,
            "tampered_event_id": None,
            "message": "Audit trail is empty. Ready for initial block.",
            "last_block_hash": GENESIS_HASH
        }

    expected_prev_hash = GENESIS_HASH
    verified_count = 0

    for idx, log in enumerate(logs):
        # 1. Verify link to previous block
        if log.prev_hash != expected_prev_hash:
            return {
                "is_valid": False,
                "total_events": total_events,
                "verified_events": verified_count,
                "tampered_event_id": log.event_id,
                "message": f"Hash Chain Broken at Event {log.event_id}! Previous hash mismatch detected.",
                "last_block_hash": log.hash
            }

        # 2. Recompute content hash to detect altered values
        recomputed = compute_event_hash(
            event_id=log.event_id,
            timestamp=log.timestamp,
            user=log.user,
            action=log.action,
            entity_type=log.entity_type,
            entity_id=log.entity_id,
            prev_hash=log.prev_hash,
            new_value=log.new_value or ""
        )

        if recomputed != log.hash:
            return {
                "is_valid": False,
                "total_events": total_events,
                "verified_events": verified_count,
                "tampered_event_id": log.event_id,
                "message": f"Tampering Detected at Event {log.event_id}! Payload data has been modified outside the system.",
                "last_block_hash": log.hash
            }

        expected_prev_hash = log.hash
        verified_count += 1

    return {
        "is_valid": True,
        "total_events": total_events,
        "verified_events": verified_count,
        "tampered_event_id": None,
        "message": "Cryptographic Integrity Verified: 100% of audit blocks valid with zero tampering detected.",
        "last_block_hash": logs[-1].hash if logs else GENESIS_HASH
    }
