from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime

from app.db.database import Base


class CameraMemory(Base):
    __tablename__ = "camera_memory"

    id = Column(Integer, primary_key=True)
    key = Column(String, unique=True, nullable=False)
    value = Column(String, nullable=False)
    memory_type = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )