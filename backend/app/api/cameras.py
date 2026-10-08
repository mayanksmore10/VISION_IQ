"""
api/cameras.py — Camera endpoints:
    GET  /api/v1/cameras
    GET  /api/v1/cameras/{camera_id}
    POST /api/v1/cameras  (internal helper for seeding data)
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.db.database import get_db
from app.models.camera import Camera

router = APIRouter(prefix="/api/v1", tags=["Cameras"])


# ---------- schemas -------------------------------------------------------

class CameraCreate(BaseModel):
    camera_id: str
    name: str
    location: str
    description: Optional[str] = None
    video_path: Optional[str] = None
    fps: Optional[float] = None


# ---------- routes --------------------------------------------------------

@router.get("/cameras")
def list_cameras(db: Session = Depends(get_db)):
    """Return all registered cameras."""
    cameras = db.query(Camera).all()
    return {
        "cameras": [
            {
                "camera_id": c.camera_id,
                "name": c.name,
                "location": c.location,
                "description": c.description,
            }
            for c in cameras
        ],
        "count": len(cameras),
    }


@router.get("/cameras/{camera_id}")
def get_camera(camera_id: str, db: Session = Depends(get_db)):
    """Return a single camera by camera_id."""
    camera = db.query(Camera).filter(Camera.camera_id == camera_id).first()
    if camera is None:
        raise HTTPException(
            status_code=404,
            detail={
                "status": "error",
                "error_code": "CAMERA_NOT_FOUND",
                "message": f"Camera '{camera_id}' was not found.",
            },
        )
    return {
        "camera_id": camera.camera_id,
        "name": camera.name,
        "location": camera.location,
        "description": camera.description,
    }


@router.post("/cameras", status_code=201)
def create_camera(camera: CameraCreate, db: Session = Depends(get_db)):
    """Register a new camera (used for seeding / admin purposes)."""
    existing = db.query(Camera).filter(Camera.camera_id == camera.camera_id).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail={
                "status": "error",
                "error_code": "INVALID_REQUEST",
                "message": f"Camera '{camera.camera_id}' already exists.",
            },
        )
    new_camera = Camera(
        camera_id=camera.camera_id,
        name=camera.name,
        location=camera.location,
        description=camera.description,
        video_path=camera.video_path,
        fps=camera.fps,
    )
    db.add(new_camera)
    db.commit()
    db.refresh(new_camera)
    return {
        "camera_id": new_camera.camera_id,
        "name": new_camera.name,
        "location": new_camera.location,
        "description": new_camera.description,
    }