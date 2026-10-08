"""
evidence_service.py — Helpers to build evidence URLs and fetch event details.
"""
from sqlalchemy.orm import Session

from app.models.event import Event
from app.models.camera import Camera


def get_event_with_camera(db: Session, event_id: int) -> tuple[Event | None, Camera | None]:
    """Return (event, camera) tuple for the given event_id."""
    event = db.query(Event).filter(Event.id == event_id).first()
    if event is None:
        return None, None
    camera = db.query(Camera).filter(Camera.camera_id == event.camera_id).first()
    return event, camera


def frame_url(event_id: int) -> str:
    return f"/api/v1/evidence/{event_id}/frame"


def clip_url(event_id: int) -> str:
    return f"/api/v1/evidence/{event_id}/clip"
