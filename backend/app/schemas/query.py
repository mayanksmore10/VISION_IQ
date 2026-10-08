from pydantic import BaseModel, Field
from typing import Optional


class QueryRequest(BaseModel):
    query: str = Field(..., description="Natural-language query from the user")
    camera_id: Optional[str] = Field(None, description="Optional camera to restrict search to")
    top_k: int = Field(5, description="Number of top results to return")


class QueryResultItem(BaseModel):
    event_id: int
    camera_id: str
    camera_name: Optional[str]
    timestamp: float
    score: float
    event_type: Optional[str]
    frame_url: str
    clip_url: str


class QueryResponse(BaseModel):
    query: str
    status: str  # "success" | "no_results" | "clarification_required"
    results: list[QueryResultItem] = []
    count: int = 0
    latency_ms: Optional[float] = None
    message: Optional[str] = None
    clarification: Optional[dict] = None
