from pydantic import BaseModel
from typing import Any, Optional


class ErrorResponse(BaseModel):
    status: str = "error"
    error_code: str
    message: str


class EvidenceResponse(BaseModel):
    event_id: int
    camera_id: str
    camera_name: Optional[str]
    timestamp: float
    event_type: Optional[str]
    frame_url: str
    clip_url: str
    metadata: Optional[Any] = None
