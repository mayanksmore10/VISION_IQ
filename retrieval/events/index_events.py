"""
events/index_events.py
Ingests Member 1 CVEvent JSON objects, serializes to canonical text,
embeds via SigLIP text encoder, and stores in ChromaDB.

Usage:
    from events.index_events import ingest_event, ingest_events_list
"""

import json, os
from typing import Dict, Any, List
import numpy as np

from events.canonical_serializer import serialize_event_to_text
from events.event_store import upsert_events
from models.siglip_model import encode_text


def _event_to_chroma_record(event: Dict[str, Any]) -> Dict[str, Any]:
    """Convert a CVEvent dict into a ChromaDB upsert record."""
    evt_id = event["event_id"]
    description = serialize_event_to_text(event)

    cam_info = event.get("camera", {})
    time_info = event.get("time", {})
    entities = event.get("entities", {})
    person = entities.get("person", {})
    obj = entities.get("object", {})
    rel = event.get("relationship", {})
    evidence = event.get("evidence", {})

    metadata = {
        "event_id": evt_id,
        "event_type": str(event.get("event_type", "")),
        "camera_id": str(cam_info.get("camera_id", "")),
        "location": str(cam_info.get("location", "")),
        "time_start": str(time_info.get("start", "")),
        "time_end": str(time_info.get("end", "")),
        "person_track_id": int(person.get("track_id", -1)) if person else -1,
        "object_class": str(obj.get("class", "")) if obj else "",
        "relationship": str(rel.get("type", "")) if rel else "",
        "relationship_conf": float(rel.get("confidence", 0.0)) if rel else 0.0,
        "frame_path": str(evidence.get("frame_path", "")),
        "clip_path": str(evidence.get("clip_path", "")),
    }

    emb = encode_text([description])[0].numpy()

    return {
        "id": evt_id,
        "embedding": emb,
        "metadata": metadata,
        "document": description,
    }


def ingest_event(event: Dict[str, Any]) -> str:
    """Ingest a single CVEvent JSON object."""
    rec = _event_to_chroma_record(event)
    upsert_events([rec])
    return rec["id"]


def ingest_events_list(events: List[Dict[str, Any]]) -> int:
    """Ingest a list of CVEvent JSON objects."""
    records = []
    for evt in events:
        records.append(_event_to_chroma_record(evt))
    if records:
        upsert_events(records)
    return len(records)


def ingest_events_from_file(json_file_path: str) -> int:
    """Ingest events from a .json or .jsonl file."""
    events = []
    with open(json_file_path, "r", encoding="utf-8") as f:
        if json_file_path.endswith(".jsonl"):
            for line in f:
                line = line.strip()
                if line:
                    events.append(json.loads(line))
        else:
            data = json.load(f)
            events = data if isinstance(data, list) else [data]
    return ingest_events_list(events)
