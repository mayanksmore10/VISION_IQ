"""
query_service.py — Orchestrates the full query pipeline:
  1. Check memory for camera disambiguation
  2. Call ChromaDB (retrieval_service)
  3. Fetch event details from PostgreSQL
  4. Build the response payload
  5. Log the query
"""
import time
from typing import Optional
from sqlalchemy.orm import Session

from app.services import memory_service, retrieval_service, evidence_service
from app.models.camera import Camera
from app.models.query_log import QueryLog
from app.schemas.query import QueryResultItem


def run_query(
    db: Session,
    query: str,
    camera_id: Optional[str] = None,
    top_k: int = 5,
) -> dict:
    """
    Full query pipeline. Returns a dict ready to be returned as a response.
    """
    start = time.perf_counter()

    # 1. Resolve camera_id via memory if not explicitly given
    resolved_camera_id = camera_id
    if not resolved_camera_id:
        resolved_camera_id = memory_service.resolve_camera_id(db, query)

    # 2. If still no camera_id, check if query requires clarification
    if not resolved_camera_id:
        clarification = memory_service.check_needs_clarification(db, query)
        if clarification:
            latency_ms = round((time.perf_counter() - start) * 1000, 2)
            return {
                "query": query,
                "status": "clarification_required",
                "results": [],
                "count": 0,
                "clarification": clarification,
                "latency_ms": latency_ms,
            }

    # 3. Call ChromaDB retrieval
    chroma_results = retrieval_service.query_chromadb(
        query=query,
        camera_id=resolved_camera_id,
        top_k=top_k,
    )

    # 4. Enrich each result with PostgreSQL event details
    result_items: list[QueryResultItem] = []
    for hit in chroma_results:
        event_id = hit["event_id"]
        score = hit["score"]
        event, camera = evidence_service.get_event_with_camera(db, event_id)
        if event is None:
            continue
        result_items.append(
            QueryResultItem(
                event_id=event.id,
                camera_id=event.camera_id,
                camera_name=camera.name if camera else None,
                timestamp=event.timestamp,
                score=score,
                event_type=event.event_type,
                frame_url=evidence_service.frame_url(event.id),
                clip_url=evidence_service.clip_url(event.id),
            )
        )

    latency_ms = round((time.perf_counter() - start) * 1000, 2)

    # 5. Log the query
    _log_query(
        db=db,
        query_text=query,
        latency_ms=latency_ms,
        result_count=len(result_items),
        success=True,
        top_item=result_items[0] if result_items else None,
    )

    # 6. Build response
    if result_items:
        return {
            "query": query,
            "status": "success",
            "results": [item.model_dump() for item in result_items],
            "count": len(result_items),
            "latency_ms": latency_ms,
        }
    else:
        return {
            "query": query,
            "status": "no_results",
            "results": [],
            "count": 0,
            "message": "No matching event was found.",
            "latency_ms": latency_ms,
        }


def _log_query(
    db: Session,
    query_text: str,
    latency_ms: float,
    result_count: int,
    success: bool,
    top_item: Optional[QueryResultItem],
) -> None:
    log = QueryLog(
        query_text=query_text,
        latency_ms=latency_ms,
        result_count=result_count,
        success=success,
        top_camera=top_item.camera_id if top_item else None,
        top_timestamp=top_item.timestamp if top_item else None,
    )
    db.add(log)
    db.commit()
