"""
internal/logs.py — Internal query log endpoint:
    POST /internal/query-logs

Normally the backend writes logs automatically via query_service.py.
This endpoint exists for external services that need to push log entries directly.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.db.database import get_db
from app.models.query_log import QueryLog

router = APIRouter(prefix="/internal", tags=["Internal – Logs"])


class QueryLogCreate(BaseModel):
    query_text: str
    latency_ms: Optional[float] = None
    result_count: Optional[int] = None
    success: Optional[bool] = None
    top_camera: Optional[str] = None
    top_timestamp: Optional[float] = None


@router.post("/query-logs", status_code=201)
def create_query_log(payload: QueryLogCreate, db: Session = Depends(get_db)):
    """
    Manually insert a query log entry.
    Normally auto-called by query_service; exposed for external services.
    """
    log = QueryLog(
        query_text=payload.query_text,
        latency_ms=payload.latency_ms,
        result_count=payload.result_count,
        success=payload.success,
        top_camera=payload.top_camera,
        top_timestamp=payload.top_timestamp,
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return {"status": "created", "log_id": log.id}
