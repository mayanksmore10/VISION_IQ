# VISION IQ --- User API & Backend API Design

## 1. Purpose

This document defines the API contract between:

``` text
React Frontend / User
        ↓
   Public User APIs
        ↓
      FastAPI
        ↓
 ┌──────┼───────────────┐
 ↓      ↓               ↓
Memory  ChromaDB      PostgreSQL
        (Member 2)     (Member 3)
 ↓      ↓               ↓
        Evidence / Query Orchestration
                ↓
          React response
```

The design separates:

-   **User APIs** --- APIs consumed by Member 4's React UI.
-   **Backend/Internal APIs** --- APIs used by Member 1, Member 2, and
    backend services.

------------------------------------------------------------------------

# 2. Base URL

Development:

``` text
http://127.0.0.1:8000
```

Recommended API prefix:

``` text
/api/v1
```

Therefore:

``` text
GET /api/v1/cameras
POST /api/v1/query
```

Internal service endpoints use:

``` text
/internal
```

Example:

``` text
POST /internal/events
```

------------------------------------------------------------------------

# 3. API Architecture

``` text
                         USER
                          │
                          ▼
                    React Frontend
                    (Member 4)
                          │
             ┌────────────┴────────────┐
             │                         │
             ▼                         ▼
        USER APIs                 USER APIs
       /api/v1/...                /api/v1/...
             │                         │
             └────────────┬────────────┘
                          ▼
                       FastAPI
                       Member 3
                          │
          ┌───────────────┼────────────────┐
          │               │                │
          ▼               ▼                ▼
      PostgreSQL       Member 2        Evidence
                      ChromaDB          Service
          │               │                │
          └───────────────┴────────────────┘
                          │
                          ▼
                     Final Answer
                          │
                          ▼
                    React Frontend
```

------------------------------------------------------------------------

# 4. USER APIs

These are the APIs that Member 4's frontend should use.

## 4.1 Health Check

### `GET /health`

Checks whether the backend is running.

### Response

``` json
{
  "status": "ok",
  "message": "VISION IQ backend is running"
}
```

------------------------------------------------------------------------

# 5. Camera APIs

## 5.1 List Cameras

### `GET /api/v1/cameras`

Returns cameras available to the user.

### Response

``` json
{
  "cameras": [
    {
      "camera_id": "cam_01",
      "name": "Main Gate",
      "location": "Main Gate",
      "description": "Camera covering the main entrance"
    },
    {
      "camera_id": "cam_02",
      "name": "Lobby",
      "location": "Lobby",
      "description": "Camera covering the lobby"
    }
  ],
  "count": 2
}
```

### Frontend use

Member 4 can use this for:

``` text
Camera selector
Camera list
Camera labels
Memory clarification UI
```

------------------------------------------------------------------------

## 5.2 Get One Camera

### `GET /api/v1/cameras/{camera_id}`

Example:

``` text
GET /api/v1/cameras/cam_01
```

### Response

``` json
{
  "camera_id": "cam_01",
  "name": "Main Gate",
  "location": "Main Gate",
  "description": "Camera covering the main entrance"
}
```

------------------------------------------------------------------------

# 6. Main User Query API

This is the most important user-facing API.

## `POST /api/v1/query`

The frontend sends a natural-language query.

### Request

``` json
{
  "query": "Did a person enter the main gate?"
}
```

### Optional request

``` json
{
  "query": "Show the red car near the gate",
  "camera_id": "cam_03",
  "top_k": 5
}
```

### Request schema

``` text
query       : string   required
camera_id   : string   optional
top_k       : integer  optional, default 5
```

------------------------------------------------------------------------

# 7. Query Backend Workflow

When the user sends:

``` text
"Did a person enter the main gate?"
```

the backend performs:

``` text
                    POST /api/v1/query
                              │
                              ▼
                     Parse user query
                              │
                              ▼
                     Check memory
                              │
                              ▼
                  "main gate" → cam_03
                              │
                              ▼
                    Call Member 2
                              │
                              ▼
                         ChromaDB
                              │
                              ▼
                  event_id + similarity
                              │
                              ▼
                      PostgreSQL
                              │
                              ▼
                  Retrieve event details
                              │
                              ▼
                     Evidence validation
                              │
                              ▼
                       Log query
                              │
                              ▼
                       API response
```

------------------------------------------------------------------------

# 8. Query Response

### Successful response

``` json
{
  "query": "Did a person enter the main gate?",
  "status": "success",
  "results": [
    {
      "event_id": 183,
      "camera_id": "cam_03",
      "camera_name": "Main Gate",
      "timestamp": 542.7,
      "score": 0.91,
      "event_type": "person_detected",
      "frame_url": "/api/v1/evidence/183/frame",
      "clip_url": "/api/v1/evidence/183/clip"
    }
  ],
  "count": 1,
  "latency_ms": 184.3
}
```

------------------------------------------------------------------------

# 9. Query With No Results

### Response

``` json
{
  "query": "person near the main gate",
  "status": "no_results",
  "results": [],
  "count": 0,
  "message": "No matching event was found."
}
```

The backend should not invent an answer.

------------------------------------------------------------------------

# 10. Query Requiring Clarification

The problem requires clarify-once behavior.

For example:

``` text
User:
"Did someone enter the main gate?"
```

If `main_gate` is not known:

### Response

``` json
{
  "status": "clarification_required",
  "query": "Did someone enter the main gate?",
  "clarification": {
    "type": "camera_reference",
    "key": "main_gate",
    "message": "Which camera represents the main gate?"
  }
}
```

The frontend can show:

``` text
Which camera represents the main gate?

[Camera 1] [Camera 2] [Camera 3]
```

------------------------------------------------------------------------

# 11. Save Clarification

After the user chooses:

``` text
main gate = cam_03
```

frontend sends:

### `POST /api/v1/memory`

``` json
{
  "key": "main_gate",
  "value": "cam_03",
  "memory_type": "camera_reference"
}
```

### Response

``` json
{
  "status": "saved",
  "key": "main_gate",
  "value": "cam_03"
}
```

The next query should automatically use:

``` text
main_gate → cam_03
```

without asking again.

------------------------------------------------------------------------

# 12. Read Memory

### `GET /api/v1/memory/{key}`

Example:

``` text
GET /api/v1/memory/main_gate
```

### Response

``` json
{
  "key": "main_gate",
  "value": "cam_03",
  "memory_type": "camera_reference"
}
```

------------------------------------------------------------------------

# 13. Evidence APIs

Evidence must be traceable to a real event.

## 13.1 Get Evidence Metadata

### `GET /api/v1/evidence/{event_id}`

Example:

``` text
GET /api/v1/evidence/183
```

### Response

``` json
{
  "event_id": 183,
  "camera_id": "cam_03",
  "camera_name": "Main Gate",
  "timestamp": 542.7,
  "event_type": "person_detected",
  "frame_url": "/api/v1/evidence/183/frame",
  "clip_url": "/api/v1/evidence/183/clip",
  "metadata": {
    "class": "person",
    "confidence": 0.94,
    "bbox": [100, 80, 250, 400]
  }
}
```

------------------------------------------------------------------------

# 14. Get Evidence Frame

### `GET /api/v1/evidence/{event_id}/frame`

Example:

``` text
GET /api/v1/evidence/183/frame
```

Returns the relevant image/frame.

Frontend use:

``` text
<img src="/api/v1/evidence/183/frame" />
```

------------------------------------------------------------------------

# 15. Get Evidence Clip

### `GET /api/v1/evidence/{event_id}/clip`

Example:

``` text
GET /api/v1/evidence/183/clip
```

Returns the relevant video clip.

Frontend use:

``` text
<video controls>
    ...
</video>
```

------------------------------------------------------------------------

# 16. Search / Filter Events for UI

Optional API useful for debugging and evaluation.

### `GET /api/v1/events`

Example:

``` text
GET /api/v1/events?camera_id=cam_03
```

Optional query parameters:

``` text
camera_id
event_type
start_time
end_time
limit
```

### Response

``` json
{
  "events": [
    {
      "event_id": 183,
      "camera_id": "cam_03",
      "timestamp": 542.7,
      "event_type": "person_detected"
    }
  ],
  "count": 1
}
```

This endpoint is primarily for development/admin/debugging.

------------------------------------------------------------------------

# 17. INTERNAL BACKEND APIs

These are NOT intended for normal users.

## 17.1 Event Ingestion

Member 1 sends detection results.

### `POST /internal/events`

### Request

``` json
{
  "camera_id": "cam_01",
  "object_id": "person_001",
  "timestamp": 12.5,
  "event_type": "person_detected",
  "frame_path": "frames/cam01_12.5.jpg",
  "clip_path": "clips/cam01_10_15.mp4",
  "metadata": {
    "class": "person",
    "confidence": 0.92,
    "bbox": [100, 80, 250, 400]
  }
}
```

### Backend workflow

``` text
Member 1
   ↓
POST /internal/events
   ↓
Validate data
   ↓
PostgreSQL events
   ↓
Return event_id
```

### Response

``` json
{
  "status": "created",
  "event_id": 183
}
```

------------------------------------------------------------------------

# 18. ChromaDB Retrieval Interface

Member 2 owns ChromaDB.

Your backend calls Member 2's retrieval service/function.

## Input

``` json
{
  "query": "person near the main gate",
  "camera_id": "cam_03",
  "top_k": 5
}
```

## Output

``` json
{
  "results": [
    {
      "event_id": 183,
      "score": 0.91
    },
    {
      "event_id": 97,
      "score": 0.84
    }
  ]
}
```

The important contract is:

``` text
INPUT:
query + optional camera_id + top_k

OUTPUT:
event_id + similarity score
```

Member 3 does not need to manage ChromaDB internals.

------------------------------------------------------------------------

# 19. Internal Event Lookup

### `GET /internal/events/{event_id}`

Used by backend services.

Example:

``` text
GET /internal/events/183
```

Response:

``` json
{
  "event_id": 183,
  "camera_id": "cam_03",
  "timestamp": 542.7,
  "event_type": "person_detected",
  "frame_path": "frames/cam03_542.7.jpg",
  "clip_path": "clips/cam03_540_545.mp4",
  "metadata": {
    "class": "person",
    "confidence": 0.94
  }
}
```

------------------------------------------------------------------------

# 20. Query Logging

Query logs are internal.

### `POST /internal/query-logs`

Normally the backend should write these automatically rather than
requiring the frontend to call the endpoint.

Example data:

``` json
{
  "query_text": "person near the main gate",
  "latency_ms": 184.3,
  "result_count": 1,
  "success": true,
  "top_camera": "cam_03",
  "top_timestamp": 542.7
}
```

Stored in:

``` text
query_logs
```

------------------------------------------------------------------------

# 21. API Error Format

Use one consistent error format.

``` json
{
  "status": "error",
  "error_code": "EVENT_NOT_FOUND",
  "message": "Event 183 was not found."
}
```

Recommended error codes:

``` text
INVALID_REQUEST
CAMERA_NOT_FOUND
EVENT_NOT_FOUND
MEMORY_NOT_FOUND
NO_RESULTS
CLARIFICATION_REQUIRED
RETRIEVAL_ERROR
DATABASE_ERROR
INTERNAL_ERROR
```

------------------------------------------------------------------------

# 22. HTTP Status Codes

  Status   Meaning
  -------- -------------------------------
  `200`    Successful GET/query
  `201`    Resource created
  `400`    Invalid request
  `404`    Camera/event/memory not found
  `422`    FastAPI validation error
  `500`    Backend/database error
  `503`    Retrieval service unavailable

------------------------------------------------------------------------

# 23. Complete Public API

These are the APIs Member 4 should know.

``` text
GET  /health

GET  /api/v1/cameras
GET  /api/v1/cameras/{camera_id}

POST /api/v1/query

POST /api/v1/memory
GET  /api/v1/memory/{key}

GET  /api/v1/evidence/{event_id}
GET  /api/v1/evidence/{event_id}/frame
GET  /api/v1/evidence/{event_id}/clip

GET  /api/v1/events
```

------------------------------------------------------------------------

# 24. Complete Internal API

``` text
POST /internal/events
GET  /internal/events/{event_id}

POST /internal/query-logs
```

Plus the internal integration with Member 2:

``` text
Query
  ↓
Member 2 Retrieval Interface
  ↓
ChromaDB
  ↓
event_id + score
```

------------------------------------------------------------------------

# 25. Frontend-to-Backend Flow

Member 4's React application should mainly use:

``` text
                    REACT
                      │
          ┌───────────┼────────────┐
          │           │            │
          ▼           ▼            ▼
       cameras      query       memory
          │           │            │
          └───────────┼────────────┘
                      ▼
                    FASTAPI
                      │
          ┌───────────┼─────────────┐
          ▼           ▼             ▼
       Memory      ChromaDB     PostgreSQL
                     │
                     ▼
                  event IDs
                     │
                     ▼
                PostgreSQL
                     │
                     ▼
                  Evidence
                     │
                     ▼
                   React
```

------------------------------------------------------------------------

# 26. Example Complete User Interaction

## Step 1 --- User asks

``` text
"Show me the person near the main gate."
```

## Step 2 --- React

``` http
POST /api/v1/query
```

``` json
{
  "query": "Show me the person near the main gate."
}
```

## Step 3 --- Backend checks memory

``` text
main_gate → cam_03
```

## Step 4 --- Backend calls Member 2

``` json
{
  "query": "Show me the person near the main gate.",
  "camera_id": "cam_03",
  "top_k": 5
}
```

## Step 5 --- ChromaDB returns

``` json
{
  "results": [
    {
      "event_id": 183,
      "score": 0.91
    }
  ]
}
```

## Step 6 --- Backend queries PostgreSQL

``` text
event_id = 183
        ↓
camera = cam_03
timestamp = 542.7
frame = ...
clip = ...
```

## Step 7 --- Backend returns

``` json
{
  "query": "Show me the person near the main gate.",
  "status": "success",
  "results": [
    {
      "event_id": 183,
      "camera_id": "cam_03",
      "camera_name": "Main Gate",
      "timestamp": 542.7,
      "score": 0.91,
      "frame_url": "/api/v1/evidence/183/frame",
      "clip_url": "/api/v1/evidence/183/clip"
    }
  ],
  "count": 1,
  "latency_ms": 184.3
}
```

## Step 8 --- React displays

``` text
Person found

Camera: Main Gate (cam_03)
Time: 09:02:22

[Frame]

[▶ Watch Clip]
```

------------------------------------------------------------------------

# 27. Ownership

  API / Component        Owner
  ---------------------- ---------------------
  `/health`              Member 3
  `/api/v1/cameras`      Member 3
  `/api/v1/query`        **Member 3**
  `/api/v1/memory`       **Member 3**
  `/api/v1/evidence`     **Member 3**
  `/api/v1/events`       Member 3
  `/internal/events`     Member 3
  PostgreSQL             **Member 3**
  Query orchestration    **Member 3**
  ChromaDB               Member 2
  Embeddings             Member 2
  Retrieval              Member 2
  React                  Member 4
  UI → API integration   Member 4 + Member 3
  YOLO/video detection   Member 1

------------------------------------------------------------------------

# 28. Recommended Backend Folder Structure

``` text
backend/
│
├── app/
│   ├── main.py
│   │
│   ├── api/
│   │   ├── cameras.py
│   │   ├── query.py
│   │   ├── memory.py
│   │   ├── evidence.py
│   │   └── events.py
│   │
│   ├── internal/
│   │   ├── events.py
│   │   └── logs.py
│   │
│   ├── services/
│   │   ├── query_service.py
│   │   ├── memory_service.py
│   │   ├── evidence_service.py
│   │   └── retrieval_service.py
│   │
│   ├── models/
│   │   ├── camera.py
│   │   ├── event.py
│   │   ├── memory.py
│   │   └── query_log.py
│   │
│   ├── schemas/
│   │   ├── camera.py
│   │   ├── event.py
│   │   ├── query.py
│   │   ├── memory.py
│   │   └── evidence.py
│   │
│   └── db/
│       ├── database.py
│       └── init_db.py
│
└── .venv/
```

------------------------------------------------------------------------

# 29. Final Member 3 Workflow

``` text
MEMBER 1
   │
   │ detection events
   ▼
/internal/events
   │
   ▼
PostgreSQL
   │
   │
   │                 MEMBER 2
   │                    ▲
   │                    │
   ▼                    │
User → /api/v1/query ───┘
   │
   ▼
Memory lookup
   │
   ▼
Camera resolution
   │
   ▼
ChromaDB retrieval
   │
   ▼
event_id + score
   │
   ▼
PostgreSQL
   │
   ▼
Evidence validation
   │
   ▼
Query logging
   │
   ▼
/api/v1/query response
   │
   ▼
MEMBER 4 / REACT
```

## Core rule

**User APIs are clean, stable, and frontend-friendly. Internal APIs are
for your team/services.**

The frontend should never directly access PostgreSQL or ChromaDB.

``` text
React
  ↓
FastAPI
  ↓
Services
  ↓
PostgreSQL / ChromaDB
```
