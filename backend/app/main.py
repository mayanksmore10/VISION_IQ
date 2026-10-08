from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.cameras import router as camera_router
from app.api.events import router as event_router
from app.api.query import router as query_router
from app.api.memory import router as memory_router
from app.api.evidence import router as evidence_router
from app.internal.events import router as internal_event_router
from app.internal.logs import router as internal_log_router

app = FastAPI(
    title="VISION IQ API",
    description="Multi-Stream Video Intelligence Backend",
    version="1.0.0",
)

# Allow the React frontend to call the API during development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Public User APIs (/api/v1/...) ─────────────────────────────────────────
app.include_router(camera_router)
app.include_router(event_router)
app.include_router(query_router)
app.include_router(memory_router)
app.include_router(evidence_router)

# ── Internal APIs (/internal/...) ──────────────────────────────────────────
app.include_router(internal_event_router)
app.include_router(internal_log_router)


@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "ok",
        "message": "VISION IQ backend is running",
    }