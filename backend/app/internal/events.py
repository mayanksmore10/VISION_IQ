from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, Dict, Any

from app.db.database import get_db
from app.models.event import Event

router = APIRouter(
    prefix="/internal",
    tags=["Internal – Events"]
)


class EventIngest(BaseModel):
    camera_id: str
    object_id: Optional[str] = None
    timestamp: float
    event_type: str
    frame_path: Optional[str] = None
    clip_path: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


@router.post("/events", status_code=201)
def ingest_event(
    event: EventIngest,
    db: Session = Depends(get_db)
):
    new_event = Event(
        camera_id=event.camera_id,
        object_id=event.object_id,
        timestamp=event.timestamp,
        event_type=event.event_type,
        frame_path=event.frame_path,
        clip_path=event.clip_path,
        metadata=event.metadata,
    )

    db.add(new_event)
    db.commit()
    db.refresh(new_event)

    return {
        "status": "created",
        "event_id": new_event.id
    }


@router.get("/events/{event_id}")
def get_internal_event(
    event_id: int,
    db: Session = Depends(get_db)
):
    event = db.query(Event).filter(Event.id == event_id).first()

    if event is None:
        raise HTTPException(
            status_code=404,
            detail={
                "status": "error",
                "error_code": "EVENT_NOT_FOUND",
                "message": f"Event {event_id} was not found.",
            }
        )

    return {
        "event_id": event.id,
        "camera_id": event.camera_id,
        "timestamp": event.timestamp,
        "event_type": event.event_type,
        "frame_path": event.frame_path,
        "clip_path": event.clip_path,
        "metadata": event.metadata,
    }