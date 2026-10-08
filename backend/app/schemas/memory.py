from pydantic import BaseModel
from typing import Optional


class MemorySaveRequest(BaseModel):
    key: str
    value: str
    memory_type: Optional[str] = "camera_reference"


class MemorySaveResponse(BaseModel):
    status: str
    key: str
    value: str


class MemoryReadResponse(BaseModel):
    key: str
    value: str
    memory_type: Optional[str]
