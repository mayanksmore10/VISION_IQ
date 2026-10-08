"""
memory_service.py — CRUD helpers for the camera_memory table.
"""
from sqlalchemy.orm import Session

from app.models.memory import CameraMemory


def get_memory(db: Session, key: str) -> CameraMemory | None:
    """Return a CameraMemory row by key, or None."""
    return db.query(CameraMemory).filter(CameraMemory.key == key).first()


def upsert_memory(db: Session, key: str, value: str, memory_type: str = "camera_reference") -> CameraMemory:
    """Insert or update a memory entry."""
    entry = db.query(CameraMemory).filter(CameraMemory.key == key).first()
    if entry:
        entry.value = value
        entry.memory_type = memory_type
    else:
        entry = CameraMemory(key=key, value=value, memory_type=memory_type)
        db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


def resolve_camera_id(db: Session, query: str) -> str | None:
    """
    Very lightweight memory-based camera resolver.
    Checks every stored key to see if it appears as a substring of the query.
    Returns the associated camera_id value if a match is found.
    """
    entries = db.query(CameraMemory).filter(CameraMemory.memory_type == "camera_reference").all()
    query_lower = query.lower()
    for entry in entries:
        key_norm = entry.key.lower()
        if key_norm in query_lower or key_norm.replace("_", " ") in query_lower:
            return entry.value
    return None


def check_needs_clarification(db: Session, query: str) -> dict | None:
    """
    If a query mentions an ambiguous location and that location
    has not been mapped yet in CameraMemory, return clarification payload.
    """
    ambiguous = ["main gate", "rear exit", "parking", "lobby"]
    query_lower = query.lower()
    for loc in ambiguous:
        if loc in query_lower:
            key = loc.replace(" ", "_")
            if not get_memory(db, key):
                return {
                    "type": "camera_reference",
                    "key": key,
                    "message": f"Which camera represents the {loc}?",
                }
    return None
