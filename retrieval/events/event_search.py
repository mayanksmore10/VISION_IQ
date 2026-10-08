"""
events/event_search.py
High-level event retrieval interface for Member 3 (Backend / LLM).

Accepts natural language queries:
    "people carrying bags"
    "person at the entrance"
    "red backpack"

Returns ranked matching events with event_id, camera, evidence, confidence, and canonical description.
"""

import sys, os
from typing import Dict, Any, Optional, List
import numpy as np

from models.siglip_model import encode_text
from events.event_store import query_events, count_events


def search_events(
    query: str,
    top_k: int = 5,
    camera_id: Optional[str] = None,
    location: Optional[str] = None,
    relationship: Optional[str] = None
) -> Dict[str, Any]:
    """
    Search Member 1 CV events by natural language query.
    
    Returns structured JSON:
    {
        "status": "success",
        "query": "people carrying bags",
        "total_events_in_db": 10,
        "results_count": 2,
        "events": [
            {
                "rank": 1,
                "event_id": "evt_00123",
                "similarity": 0.92,
                "description": "Person 17 is carrying a backpack in camera cam_01 at entrance...",
                "camera_id": "cam_01",
                "location": "entrance",
                "time_start": "15:30:21",
                "time_end": "15:30:25",
                "relationship": "carrying",
                "evidence": {
                    "frame_path": "evidence/cam_01/evt_00123.jpg",
                    "clip_path": "evidence/cam_01/evt_00123.mp4"
                }
            }
        ]
    }
    """
    total = count_events()
    if total == 0:
        return {
            "status": "no_events",
            "query": query,
            "total_events_in_db": 0,
            "results_count": 0,
            "events": [],
            "message": "No CV events currently indexed in vector store."
        }

    # Embed query using SigLIP text encoder
    q_emb = encode_text([query])[0].numpy()

    # Build metadata filter if specified
    filters = []
    if camera_id:
        filters.append({"camera_id": camera_id})
    if location:
        filters.append({"location": location})
    if relationship:
        filters.append({"relationship": relationship})

    where = None
    if len(filters) == 1:
        where = filters[0]
    elif len(filters) > 1:
        where = {"$and": filters}

    k = min(top_k, total)
    raw = query_events(q_emb, top_k=k, where=where)

    results: List[Dict[str, Any]] = []
    for rank, (evt_id, dist, meta, doc) in enumerate(
        zip(raw["ids"], raw["distances"], raw["metadatas"], raw["documents"]),
        start=1
    ):
        similarity = round(max(0.0, 1.0 - float(dist)), 3)
        results.append({
            "rank": rank,
            "event_id": evt_id,
            "similarity": similarity,
            "description": doc,
            "camera_id": meta.get("camera_id"),
            "location": meta.get("location"),
            "time_start": meta.get("time_start"),
            "time_end": meta.get("time_end"),
            "relationship": meta.get("relationship"),
            "event_type": meta.get("event_type"),
            "evidence": {
                "frame_path": meta.get("frame_path"),
                "clip_path": meta.get("clip_path")
            }
        })

    return {
        "status": "success",
        "query": query,
        "total_events_in_db": total,
        "results_count": len(results),
        "events": results
    }
