"""
api/evidence.py — Evidence retrieval endpoints:
    GET /api/v1/evidence/{event_id}
    GET /api/v1/evidence/{event_id}/frame
    GET /api/v1/evidence/{event_id}/clip
"""
import os
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.services.evidence_service import get_event_with_camera, frame_url, clip_url

router = APIRouter(prefix="/api/v1", tags=["Evidence"])


def _get_event_or_404(db: Session, event_id: int):
    event, camera = get_event_with_camera(db, event_id)
    if event is None:
        raise HTTPException(
            status_code=404,
            detail={
                "status": "error",
                "error_code": "EVENT_NOT_FOUND",
                "message": f"Event {event_id} was not found.",
            },
        )
    return event, camera


@router.get("/evidence/{event_id}")
def get_evidence_metadata(event_id: int, db: Session = Depends(get_db)):
    """Return evidence metadata for the given event_id."""
    event, camera = _get_event_or_404(db, event_id)
    return {
        "event_id": event.id,
        "camera_id": event.camera_id,
        "camera_name": camera.name if camera else None,
        "timestamp": event.timestamp,
        "event_type": event.event_type,
        "frame_url": frame_url(event.id),
        "clip_url": clip_url(event.id),
        "metadata": event.event_metadata,
    }


@router.get("/evidence/{event_id}/frame")
def get_evidence_frame(event_id: int, db: Session = Depends(get_db)):
    """Serve the frame image associated with an event."""
    event, _ = _get_event_or_404(db, event_id)

    if not event.frame_path or not os.path.exists(event.frame_path):
        raise HTTPException(
            status_code=404,
            detail={
                "status": "error",
                "error_code": "EVENT_NOT_FOUND",
                "message": f"Frame file for event {event_id} was not found.",
            },
        )

    return FileResponse(event.frame_path, media_type="image/jpeg")


@router.get("/evidence/{event_id}/clip")
def get_evidence_clip(event_id: int, db: Session = Depends(get_db)):
    """Serve the video clip associated with an event."""
    event, _ = _get_event_or_404(db, event_id)

    if not event.clip_path or not os.path.exists(event.clip_path):
        raise HTTPException(
            status_code=404,
            detail={
                "status": "error",
                "error_code": "EVENT_NOT_FOUND",
                "message": f"Clip file for event {event_id} was not found.",
            },
        )

    return FileResponse(event.clip_path, media_type="video/mp4")
