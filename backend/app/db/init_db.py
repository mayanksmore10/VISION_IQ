from app.db.database import engine, Base
from app.models import Camera, Event, CameraMemory, QueryLog

Base.metadata.create_all(bind=engine)

print("✅ All database tables created!")