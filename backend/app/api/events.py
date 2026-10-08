"""
api/events.py — Public event listing endpoint:
    GET /api/v1/events  (optional filters: camera_id, event_type, start_time, end_time, limit)
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.db.database import get_db
from app.models.event import Event

router = APIRouter(prefix="/api/v1", tags=["Events"])


@router.get("/events")
def list_events(
    camera_id: Optional[str] = Query(None),
    event_type: Optional[str] = Query(None),
    start_time: Optional[float] = Query(None),
    end_time: Optional[float] = Query(None),
    limit: int = Query(50, ge=1, le=500),
    db: Session = Depends(get_db),
):
    """
    Search / filter events. Primarily used for debugging and evaluation.
    Supports optional query params: camera_id, event_type, start_time, end_time, limit.
    """
    q = db.query(Event)

    if camera_id:
        q = q.filter(Event.camera_id == camera_id)
    if event_type:
        q = q.filter(Event.event_type == event_type)
    if start_time is not None:
        q = q.filter(Event.timestamp >= start_time)
    if end_time is not None:
        q = q.filter(Event.timestamp <= end_time)

    events = q.order_by(Event.timestamp.desc()).limit(limit).all()

    return {
        "events": [
            {
                "event_id": e.id,
                "camera_id": e.camera_id,
                "timestamp": e.timestamp,
                "event_type": e.event_type,
            }
            for e in events
        ],
        "count": len(events),
    }