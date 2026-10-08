"""
api/memory.py — POST /api/v1/memory  &  GET /api/v1/memory/{key}
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.memory import MemorySaveRequest, MemorySaveResponse, MemoryReadResponse
from app.services import memory_service

router = APIRouter(prefix="/api/v1", tags=["Memory"])


@router.post("/memory", response_model=MemorySaveResponse)
def save_memory(request: MemorySaveRequest, db: Session = Depends(get_db)):
    """
    Save (or update) a camera reference in memory.
    Example: {"key": "main_gate", "value": "cam_03", "memory_type": "camera_reference"}
    """
    entry = memory_service.upsert_memory(
        db=db,
        key=request.key,
        value=request.value,
        memory_type=request.memory_type or "camera_reference",
    )
    return MemorySaveResponse(status="saved", key=entry.key, value=entry.value)


@router.get("/memory/{key}", response_model=MemoryReadResponse)
def read_memory(key: str, db: Session = Depends(get_db)):
    """
    Retrieve a stored memory entry by key.
    Example: GET /api/v1/memory/main_gate
    """
    entry = memory_service.get_memory(db=db, key=key)
    if entry is None:
        raise HTTPException(
            status_code=404,
            detail={
                "status": "error",
                "error_code": "MEMORY_NOT_FOUND",
                "message": f"Memory key '{key}' was not found.",
            },
        )
    return MemoryReadResponse(key=entry.key, value=entry.value, memory_type=entry.memory_type)
