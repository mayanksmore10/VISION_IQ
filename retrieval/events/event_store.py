"""
events/event_store.py
ChromaDB storage and retrieval for Member 1 CV Events.
Collection: "cctv_events" with cosine distance.
"""

import sys, os
from typing import List, Dict, Any, Optional

import chromadb
import numpy as np
import config

_CLIENT = None
_COLLECTION = None
COLLECTION_NAME = "cctv_events"


def get_client() -> chromadb.PersistentClient:
    global _CLIENT
    if _CLIENT is None:
        _CLIENT = chromadb.PersistentClient(path=config.CHROMA_DB_PATH)
    return _CLIENT


def get_events_collection():
    global _COLLECTION
    if _COLLECTION is None:
        client = get_client()
        _COLLECTION = client.get_or_create_collection(
            name=COLLECTION_NAME,
            metadata={"hnsw:space": "cosine"}
        )
    return _COLLECTION


def upsert_events(records: List[Dict[str, Any]]) -> None:
    """
    records: list of dicts with:
        "id"        : str (event_id)
        "embedding" : np.ndarray (768,)
        "metadata"  : dict (scalar values only)
        "document"  : str (canonical description)
    """
    col = get_events_collection()
    col.upsert(
        ids=[r["id"] for r in records],
        embeddings=[r["embedding"].tolist() if isinstance(r["embedding"], np.ndarray) else r["embedding"] for r in records],
        metadatas=[r["metadata"] for r in records],
        documents=[r.get("document", "") for r in records]
    )


def query_events(
    query_vector: np.ndarray,
    top_k: int = 5,
    where: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """Query the events collection using cosine similarity."""
    col = get_events_collection()
    vec = query_vector.tolist() if isinstance(query_vector, np.ndarray) else query_vector

    kwargs = {
        "query_embeddings": [vec],
        "n_results": top_k,
        "include": ["metadatas", "distances", "documents"]
    }
    if where:
        kwargs["where"] = where

    res = col.query(**kwargs)
    return {
        "ids": res["ids"][0] if res["ids"] else [],
        "distances": res["distances"][0] if res["distances"] else [],
        "metadatas": res["metadatas"][0] if res["metadatas"] else [],
        "documents": res["documents"][0] if res["documents"] else [],
    }


def count_events() -> int:
    return get_events_collection().count()


def upsert_event(event: Dict[str, Any], canonical_text: str) -> None:
    """
    Upsert a single event into ChromaDB.
    
    Args:
        event: CVEvent dictionary
        canonical_text: Natural language description
    """
    from embeddings.text_embedding import embed_query
    
    # Generate embedding
    embedding = embed_query(canonical_text)
    
    # Prepare metadata (only scalar values)
    camera_info = event.get("camera", {})
    time_info = event.get("time", {})
    entities = event.get("entities", {})
    relationship = event.get("relationship", {})
    evidence = event.get("evidence", {})
    
    person = entities.get("person", {})
    obj = entities.get("object", {})
    
    metadata = {
        "camera_id": camera_info.get("camera_id", "unknown"),
        "location": camera_info.get("location", "unknown"),
        "time_start": time_info.get("start", ""),
        "time_end": time_info.get("end", ""),
        "timestamp_sec": float(time_info.get("timestamp_sec", 0.0)),
        "person_track_id": int(person.get("track_id") or 0),
        "object_class": obj.get("class", ""),
        "object_confidence": float(obj.get("confidence") or 0.0),
        "association_state": obj.get("association_state", ""),
        "relationship": relationship.get("type", ""),
        "frame_path": evidence.get("frame_path") or "",
        "crop_path": evidence.get("crop_path") or "",
        "frame_number": int(evidence.get("frame_number") or 0)
    }
    
    # Upsert
    record = {
        "id": event["event_id"],
        "embedding": embedding,
        "metadata": metadata,
        "document": canonical_text
    }
    
    upsert_events([record])
