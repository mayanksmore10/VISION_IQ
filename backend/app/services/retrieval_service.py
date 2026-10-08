"""
retrieval_service.py — Stub interface for Member 2's ChromaDB retrieval.

Member 2 will replace the body of `query_chromadb` with the real implementation.
The contract is fixed:
  INPUT : query (str), camera_id (str | None), top_k (int)
  OUTPUT: list of {"event_id": int, "score": float}
"""
from typing import Optional


def query_chromadb(query: str, camera_id: Optional[str], top_k: int = 5) -> list[dict]:
    """
    Call Member 2's ChromaDB retrieval layer.

    Returns:
        [{"event_id": int, "score": float}, ...]
    """
    # -----------------------------------------------------------------
    # TODO (Member 2): replace this stub with the real ChromaDB call.
    # Example real implementation might look like:
    #
    #   results = chroma_collection.query(
    #       query_texts=[query],
    #       n_results=top_k,
    #       where={"camera_id": camera_id} if camera_id else None,
    #   )
    #   return [
    #       {"event_id": int(id_), "score": 1 - dist}
    #       for id_, dist in zip(results["ids"][0], results["distances"][0])
    #   ]
    # -----------------------------------------------------------------
    return []
