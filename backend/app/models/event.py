from sqlalchemy import Column, Integer, String, Float, JSON
from app.db.database import Base


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True)
    camera_id = Column(String, nullable=False)
    object_id = Column(String)
    timestamp = Column(Float, nullable=False)
    event_type = Column(String)
    frame_path = Column(String)
    clip_path = Column(String)
    event_metadata = Column(JSON, name="metadata")