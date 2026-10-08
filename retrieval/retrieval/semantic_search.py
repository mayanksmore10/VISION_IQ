"""
retrieval/semantic_search.py
Text query -> ChromaDB top-K semantic search.
"""

import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from typing import List, Dict, Any, Optional
import config
from embeddings.text_embedding import embed_query
from vector_db.chroma_store import query as chroma_query, count


def semantic_search(
    query_text: str,
    top_k: int = config.SEMANTIC_TOP_K,
    where: Optional[Dict] = None,
) -> List[Dict[str, Any]]:
    """
    Embed query_text and retrieve top_k candidates from Chroma.
    Returns list of hit dicts: {id, metadata, similarity}.
    """
    if count() == 0:
        return []
    emb  = embed_query(query_text)
    hits = chroma_query(embedding=emb, top_k=top_k, where=where)
    return hits
