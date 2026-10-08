"""
api/query.py — POST /api/v1/query
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.query import QueryRequest
from app.services import query_service

router = APIRouter(prefix="/api/v1", tags=["Query"])


@router.post("/query")
def query_endpoint(request: QueryRequest, db: Session = Depends(get_db)):
    """
    Main user-facing query endpoint.
    Accepts a natural-language query and returns matching evidence events.
    """
    return query_service.run_query(
        db=db,
        query=request.query,
        camera_id=request.camera_id,
        top_k=request.top_k,
    )
