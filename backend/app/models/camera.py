from sqlalchemy import Column, Integer, String, Float
from app.db.database import Base


class Camera(Base):
    __tablename__ = "cameras"

    id = Column(Integer, primary_key=True)
    camera_id = Column(String, unique=True, nullable=False)
    name = Column(String)
    location = Column(String)
    description = Column(String)
    video_path = Column(String)
    fps = Column(Float)