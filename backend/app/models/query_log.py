from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from datetime import datetime

from app.db.database import Base


class QueryLog(Base):
    __tablename__ = "query_logs"

    id = Column(Integer, primary_key=True)
    query_text = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    latency_ms = Column(Float)
    result_count = Column(Integer)
    success = Column(Boolean)
    top_camera = Column(String)
    top_timestamp = Column(Float)