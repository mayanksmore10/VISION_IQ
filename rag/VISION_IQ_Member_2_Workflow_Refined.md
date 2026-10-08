# VISION-IQ — Member 2: Multimodal Retrieval & RAG (Refined)

**Project:** HackNex 2026 — HNX26EPS05: Multi-Stream Video Intelligence with Conversational Query
**Role:** Member 2 — embeddings, vector search, RAG, Explainable Evidence-Grounded Retrieval

My module answers:

> Given a natural-language query, how do we find the most relevant visual evidence from multiple CCTV streams and return it with camera, timestamp, frame, clip, confidence, and reason?

The HackNex PS05 minimum bar is recorded multi-camera footage, natural-language queries, correct camera + timestamp + clip retrieval, and persistent "clarify-once" behavior. The PS also identifies open-vocabulary search and grounded/localized answers as core challenges.

Where the evidence is too weak, the module returns an honest "no verified match" instead of forcing an answer.

**Scoring emphasis (PS05):** retrieval accuracy 30%, camera/timestamp localization 20%, research contribution 20%. Optimize these before UI polish.

---

## 1. Team Split

| Member | Owns |
|---|---|
| M1 | YOLO detection, tracking, video decoding, frame/clip extraction, detection metadata |
| **M2 (me)** | **SigLIP2 embeddings, ChromaDB, retrieval, filtering, reranking, confidence, reasons, no-match, RAG context, retrieval eval** |
| M3 | Backend, APIs, PostgreSQL, query planning, LLM answer generation, memory, integration |
| M4 | UI, evaluation harness / demo |

```
CCTV -> M1 (frames, clips, detections) -> M2 (retrieval/RAG) -> M3 (backend/LLM) -> M4 (UI)
```

**Not mine:** YOLO, tracking, video decoding, FastAPI, PostgreSQL, React, auth, deployment.

> **Open item:** my doc says I own *retrieval evaluation*, M4 owns *evaluation*. Agree with M4: I produce the labeled query set + metrics code; M4 can run/present it. Settle this early.

---

## 2. Strict Constraints

1. **Every result must contain** `camera_id`, `timestamp`, `frame_path`, `clip_path`. Missing any = invalid.
2. **Never force an answer.** Below the verified threshold, return `no_verified_match`.
3. **The LLM answers only from retrieved evidence** and never invents it.
4. **One embedding model** (SigLIP2) for images and text, so they share one vector space.
5. **Embeddings are L2-normalized; Chroma collection uses cosine** (see 4.2: Chroma defaults to L2, so set it explicitly).
6. **Text queries: lowercase, padded to 64 tokens** (`padding="max_length", max_length=64`).
7. **Raw SigLIP cosine scores are small** (roughly 0.05–0.3). Do not read them as probabilities or compare to a fixed 0.78. Calibrate the threshold on my eval set.
8. **Weights (50/20/15/15) and threshold are tunable defaults**, not facts. Document the confidence formula.
9. **Don't block on M1.** Use my own frames now; the frame source must be swappable with no retrieval changes.
10. **Plain Python interface** until M3 integrates (no web framework in my layer).
11. **Pin versions** in `requirements.txt`; model ID, paths, thresholds, weights live in `config.py`.

---

## 3. Tech Stack (Strict)

| Layer | Technology |
|---|---|
| Language | Python 3.10+ |
| DL | PyTorch + Hugging Face Transformers |
| Model | `google/siglip2-base-patch16-naflex` (768-dim) |
| Vector DB | **ChromaDB**, local `PersistentClient`, no Docker |
| Image I/O | Pillow (OpenCV/ffmpeg only for temporary frame extraction) |
| Numerics / eval | NumPy, Pandas, scikit-learn |
| Utilities | tqdm |

```text
torch
transformers
chromadb
Pillow
numpy
pandas
scikit-learn
tqdm
opencv-python   # temporary frame extraction only
```

---

## 4. Data Design (Fixes Applied)

### 4.1 One canonical timestamp format
Your draft mixes `12.4`, `14.5`, `14.22` and `"14:22:17"`. `14.22` silently drops the seconds. Use:

| Field | Type | Example | Use |
|---|---|---|---|
| `timestamp_sec` | float | `51737.0` | filtering, sorting, temporal match (seconds since midnight, or since video start if no wall clock) |
| `timestamp_str` | str | `"14:22:17"` | display only |

If M1 gives video-relative seconds, agree with them on whether wall-clock time is derivable. Time queries like "after 2 PM" need wall-clock.

### 4.2 Chroma record

```python
collection = client.get_or_create_collection(
    name="cctv_evidence",
    metadata={"hnsw:space": "cosine"},   # default is L2; set this
)
```
```json
{
  "id": "G336_51737.0",
  "embedding": [ "...768 floats, normalized..." ],
  "metadata": {
    "camera_id": "G336",
    "location": "main_gate",
    "timestamp_sec": 51737.0,
    "timestamp_str": "14:22:17",
    "frame_path": "frames/G336/14_22_17.jpg",
    "clip_path": "clips/G336/14_22_12.mp4",
    "objects": "car,person",
    "has_car": true,
    "has_person": true
  }
}
```
Chroma gotchas:
- Metadata values must be **scalars** (str/int/float/bool). No lists. Store `objects` as a comma string and filter via per-class booleans (`has_car`).
- Chroma returns **distance**, not similarity. For cosine: `similarity = 1 - distance`.
- Time filter: `where={"$and":[{"camera_id":"G336"},{"timestamp_sec":{"$gte":50400}}]}`.
- `camera_id` format must be one scheme everywhere (`cam_01` vs `G336` in drafts). Pick one with M1.
- `location` (e.g. main_gate) needs a camera→location map. Keep it in `config.py`.

**Rule:** the vector and its evidence location must never be separated.

---

## 5. Workflow

```
Frames + metadata (M1 / temp)
      |
 SigLIP2 image embedding --> ChromaDB (cctv_evidence)
                                  ^
 User query -> parse -> SigLIP2 text embedding
                                  |
                          Top-50 semantic search (+ metadata filter)
                                  v
                       Top-10 -> Rerank -> Top-3
                                  v
                         Evidence verification
                            |            |
                       Confidence     Reasons
                            +-----+------+
                                  v
                      RAG / evidence context -> M3
```

---

## 6. Build Steps (Phased)

### Phase 1 — Core retrieval

1. **`models/siglip_model.py`** — `load_model()`, `encode_image(list[PIL])`, `encode_text(list[str])`. Normalize outputs.
2. **Embedding wrappers** — `embed_frame(path)`, `embed_query(q)` (lowercases).
3. **Gate test:** ~20 frames (`ffmpeg -i video.mp4 -vf fps=1 frames/f_%04d.jpg`); queries "red car", "person", "person carrying a bag". Top-ranked frames must visibly match. Judge ranking, not absolute score.
4. **`vector_db/chroma_store.py`** — create collection (cosine), `upsert`, `query`, persistence.
5. **`ingestion/index_frames.py`** — frames → batched embeddings → upsert with metadata. Frame source = a function, so M1 output can replace it.
6. **`retrieval/semantic_search.py`** — `query → embedding → Chroma → Top-K`.
7. **Persistence check:** restart Python, query again, data still there.

**Milestone:** "red car" → Top-5 relevant frames from `./chroma_db`.

### Phase 2 — Accuracy

- **Query parsing:** extract `object`, `attribute`, `location`, `time_start/end`, `event`. Start rule-based (keyword/regex + camera-location map); M3's LLM planner can take over later.
- **`metadata_filter.py`:** build Chroma `where` clauses from parsed constraints.
- **`hybrid_search.py`:** semantic search over the filtered subset. Fallback: if the filter returns too few, relax the filter and flag it in the reasons.
- **`reranker.py`:**
```
final = 0.50*semantic + 0.20*object_match + 0.15*location_match + 0.15*temporal_match
```
Define each term concretely:
  - `semantic`: min-max or rank-normalized similarity within the candidate set (raw cosine is too small to mix directly).
  - `object_match`: 1.0 if M1 detections include the requested class, else 0.
  - `location_match`: 1.0 if camera's location equals the requested one, else 0.
  - `temporal_match`: 1.0 inside the requested window, decaying with distance outside it.

### Phase 3 — Differentiator

- **Attribute verification (honest reasons):** a reason like "red matched" must come from something real. Practical method: zero-shot probe with SigLIP2 on the frame or the M1 detection crop, e.g. compare "a red car" against "a blue car / a white car / a black car", and report the margin. Only emit the reason if the margin passes a threshold.
- **Confidence:** from the combined score, calibrated on eval data (e.g. map score → empirical precision). Document the formula.
- **Reasons:** list only signals that actually fired.
- **No-match:** if best confidence < calibrated threshold → `no_verified_match`.
- **`rag/context_builder.py`:** package for M3.

### Phase 4 — Evaluation

Labeled set: `query → expected camera + timestamp window`. Metrics: Recall@1/5/10, MRR, camera accuracy, timestamp accuracy (within tolerance, e.g. ±5 s), latency. Use it to set weights and the no-match threshold. **Include negative queries** (things not in the footage) so the threshold is tuned on both sides.

### Phase 5 — Integration

M3 calls `search(query, top_k, filters)` and gets structured evidence. M3 should not need to know about SigLIP2 or Chroma.

---

## 7. Output Contract (Unified)

Your draft had a different shape for matches and no-matches. Use **one envelope** with a `status` field so M3/M4 handle both with one code path.

```python
search(query: str, top_k: int = 10, filters: dict | None = None) -> dict
```

**Verified**
```json
{
  "status": "verified",
  "query": "Did a red car enter the main gate?",
  "parsed": { "object": "car", "attribute": "red", "location": "main_gate" },
  "evidence": [
    {
      "rank": 1,
      "camera_id": "G336",
      "location": "main_gate",
      "timestamp_sec": 51737.0,
      "timestamp_str": "14:22:17",
      "frame_path": "frames/G336/14_22_17.jpg",
      "clip_path": "clips/G336/14_22_12.mp4",
      "scores": { "semantic": 0.91, "object": 1.0, "location": 1.0, "temporal": 0.89 },
      "confidence": 0.93,
      "reason": [
        "Car detected",
        "Red attribute matched (probe margin above threshold)",
        "Camera corresponds to main gate",
        "Timestamp within requested range"
      ]
    }
  ],
  "searched": { "cameras": 4, "frames": 2481 }
}
```

**No match**
```json
{
  "status": "no_verified_match",
  "query": "person wearing yellow jacket",
  "best_candidate": { "camera_id": "G336", "timestamp_str": "14:22:17", "confidence": 0.58 },
  "reason": "Best candidate is below the evidence verification threshold.",
  "searched": { "cameras": 4, "frames": 2481 }
}
```

**Input expected from M1**
```json
{
  "camera_id": "G336",
  "timestamp_sec": 51737.0,
  "frame_path": "frames/G336/14_22_17.jpg",
  "clip_path": "clips/G336/14_22_12.mp4",
  "detections": [{ "class": "car", "confidence": 0.91, "bbox": [120, 80, 400, 300] }]
}
```

---

## 8. Folder Structure

```
retrieval/
├── config.py                 # model ID, chroma path, collection, thresholds, weights, camera->location map
├── models/siglip_model.py
├── embeddings/{image_embedding.py, text_embedding.py}
├── ingestion/index_frames.py
├── vector_db/chroma_store.py
├── retrieval/{query_parser.py, semantic_search.py, metadata_filter.py, hybrid_search.py, reranker.py}
├── rag/context_builder.py
├── evaluation/{dataset.py, metrics.py}
├── data/videos/              # temporary test videos
├── chroma_db/                # persistent vector store (git-ignore)
├── requirements.txt
└── README.md
```
(`query_parser.py` is new: parsing needs a home.)

---

## 9. Milestones & Definition of Done

| # | Milestone | Done when |
|---|---|---|
| 1 | SigLIP2 loads | image + text vectors generated |
| 2 | Similarity test | relevant frames rank higher |
| 3 | Chroma integration | data persists across restarts |
| 4 | NL retrieval | text → Top-K frames |
| 5 | Metadata filtering | camera / location / time / object work |
| 6 | Reranking | combined score implemented |
| 7 | Explainable evidence | confidence + real reasons returned |
| 8 | No-match | threshold calibrated on positive and negative queries |
| 9 | Evaluation | Recall@K, MRR, camera/timestamp accuracy, latency reported |
| 10 | Integration | M3 calls `search(...)` and gets the unified envelope |

---

## 10. Differentiators Supported by Member 2

### 1. Explainable Evidence-Grounded Retrieval ⭐
Every result carries camera, timestamp, frame, clip, confidence, and the reasons it was selected (see Section 7 for the output contract).

### 2. Confidence-Aware Retrieval ⭐

We don't treat the raw SigLIP2 similarity score as the final answer.

We combine signals such as:

```
Semantic similarity
+
YOLO/object match
+
Location match
+
Time match
```

Example:

```
Semantic similarity = 0.91
Object match        = 1.00
Location match      = 1.00
Temporal match      = 0.89

Final confidence = 0.93
```

This gives us a more meaningful evidence confidence.

> **Implementation note:** the semantic term in these examples is the *normalized* score (see Phase 2), not the raw SigLIP2 cosine, which is typically far lower. The formula and weights are documented and tuned on the eval set.

### 3. No-Verified-Match / Negative Evidence ⭐

This is another useful differentiator.

Suppose the user asks:

"Did a person with a yellow jacket enter the gate?"

and the best retrieval score is weak:

```
Best candidate = 0.58
Verification threshold = 0.78
```

Instead of hallucinating:

"Yes."

the system says:

**No verified evidence found.**

And explains why:

```
Best candidate:
Camera G336
Time: 14:22:17
Similarity: 58%

Reason:
Evidence is below the verification threshold.
```

This is especially valuable because PS05 emphasizes grounded evidence rather than unsupported answers.

> **Implementation note:** 0.78 is an illustrative threshold. The real value is calibrated on the eval set using both positive and negative queries.

---

## 11. Priority Tiers

| Tier | Items |
|---|---|
| **1 Must** | SigLIP2 + Chroma retrieval, camera/timestamp/frame/clip, confidence, reasons, no-match |
| **2 Differentiators** | Temporal event retrieval (start–end interval + clip), query decomposition (with M3), event knowledge graph |
| **3 Stretch** | Cross-camera timeline, standing queries / alerts |

Start Tier 2/3 only after Tier 1 passes the eval set.

---

## 12. Needs From Others

- **M1:** `camera_id`, `timestamp_sec` (and whether wall-clock is available), `frame_path`, `clip_path`, `detections`. Agree on the camera-ID scheme.
- **M3:** stable contract (`POST /search`, body `{"query": "..."}`) mapping to my `search(...)`.
- **M4:** none initially; they consume the unified envelope.

---

## 13. Role Definition

> **Member 2 builds the multimodal retrieval engine that turns CCTV frames and natural-language queries into ranked, explainable, confidence-aware evidence the backend can use for grounded answers.**
