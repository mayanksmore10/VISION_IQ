// src/services/api.ts
// All backend fetch calls. Maps API response shapes → existing frontend types.

import type { Camera, Event, SearchResult } from '../data';

const BASE = '/api/v1';

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

/** Convert a backend float timestamp (seconds) to "HH:MM:SS" string */
function secondsToTime(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = Math.floor(secs % 60);
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':');
}

/** Derive a frontend event type from the backend event_type string */
function toEventType(eventType: string): Event['type'] {
  const t = eventType.toLowerCase();
  if (t.includes('vehicle') || t.includes('car')) return 'vehicle';
  if (t.includes('breach') || t.includes('intrusion')) return 'breach';
  if (t.includes('motion')) return 'motion';
  return 'person';
}

/** Derive severity from a 0-1 score or percentage confidence */
function toSeverity(confidence: number): Event['severity'] {
  // confidence may arrive as 0–1 (score) or 0–100 (percentage)
  const pct = confidence > 1 ? confidence : confidence * 100;
  if (pct >= 90) return 'high';
  if (pct >= 75) return 'medium';
  return 'low';
}

/* ------------------------------------------------------------------ */
/*  Cameras                                                             */
/* ------------------------------------------------------------------ */

interface BackendCamera {
  camera_id: string;
  name: string;
  location: string;
  description?: string;
}

/** Map a backend camera → frontend Camera interface */
function toCamera(bc: BackendCamera): Camera {
  return {
    id: bc.camera_id,
    name: bc.name,
    location: bc.location,
    // UI-only fields the backend doesn't store — use safe defaults
    status: 'online',
    resolution: '1080p',
    fps: 30,
    uptime: '—',
    events24h: 0,
  };
}

export async function fetchCameras(): Promise<Camera[]> {
  const res = await fetch(`${BASE}/cameras`);
  if (!res.ok) throw new Error('Failed to fetch cameras');
  const data = await res.json();
  return (data.cameras as BackendCamera[]).map(toCamera);
}

export async function fetchCamera(cameraId: string): Promise<Camera> {
  const res = await fetch(`${BASE}/cameras/${cameraId}`);
  if (!res.ok) throw new Error(`Camera ${cameraId} not found`);
  const bc: BackendCamera = await res.json();
  return toCamera(bc);
}

/* ------------------------------------------------------------------ */
/*  Events                                                              */
/* ------------------------------------------------------------------ */

interface BackendEvent {
  event_id: number;
  camera_id: string;
  timestamp: number;
  event_type: string;
}

/** Map a backend event → frontend Event interface */
function toEvent(be: BackendEvent, cameraName?: string): Event {
  const confidence = 85; // backend events don't carry confidence yet
  return {
    id: String(be.event_id),
    timestamp: secondsToTime(be.timestamp),
    cameraId: be.camera_id,
    cameraName: cameraName ?? be.camera_id,
    description: be.event_type.replace(/_/g, ' '),
    type: toEventType(be.event_type),
    confidence,
    severity: toSeverity(confidence),
  };
}

export async function fetchEvents(params?: {
  camera_id?: string;
  event_type?: string;
  limit?: number;
}): Promise<Event[]> {
  const qs = new URLSearchParams();
  if (params?.camera_id) qs.set('camera_id', params.camera_id);
  if (params?.event_type) qs.set('event_type', params.event_type);
  if (params?.limit) qs.set('limit', String(params.limit));
  const res = await fetch(`${BASE}/events?${qs}`);
  if (!res.ok) throw new Error('Failed to fetch events');
  const data = await res.json();
  return (data.events as BackendEvent[]).map((e) => toEvent(e));
}

/* ------------------------------------------------------------------ */
/*  Query (Search)                                                      */
/* ------------------------------------------------------------------ */

interface BackendQueryResultItem {
  event_id: number;
  camera_id: string;
  camera_name: string | null;
  timestamp: number;
  score: number;
  event_type: string | null;
  frame_url: string;
  clip_url: string;
}

interface BackendQueryResponse {
  query: string;
  status: 'success' | 'no_results' | 'clarification_required';
  results: BackendQueryResultItem[];
  count: number;
  latency_ms?: number;
  message?: string;
  clarification?: {
    type: string;
    key: string;
    message: string;
  };
}

export interface QueryResponse {
  status: BackendQueryResponse['status'];
  results: SearchResult[];
  clarification?: BackendQueryResponse['clarification'];
  latency_ms?: number;
  message?: string;
}

export async function queryBackend(
  query: string,
  camera_id?: string,
  top_k = 5,
): Promise<QueryResponse> {
  const res = await fetch(`${BASE}/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, camera_id, top_k }),
  });
  if (!res.ok) throw new Error('Query request failed');
  const data: BackendQueryResponse = await res.json();

  const results: SearchResult[] = data.results.map((r) => {
    const confidencePct = Math.round(r.score * 100);
    return {
      id: `RES${r.event_id}`,
      eventId: String(r.event_id),
      cameraId: r.camera_id,
      cameraName: r.camera_name ?? r.camera_id,
      location: r.camera_name ?? r.camera_id,
      timestamp: secondsToTime(r.timestamp),
      description: r.event_type?.replace(/_/g, ' ') ?? 'Event detected',
      confidence: confidencePct,
      type: toEventType(r.event_type ?? ''),
    };
  });

  return {
    status: data.status,
    results,
    clarification: data.clarification,
    latency_ms: data.latency_ms,
    message: data.message,
  };
}

/* ------------------------------------------------------------------ */
/*  Evidence                                                            */
/* ------------------------------------------------------------------ */

export interface EvidenceDetail {
  event_id: number;
  camera_id: string;
  camera_name: string | null;
  timestamp: number;
  event_type: string | null;
  frame_url: string;
  clip_url: string;
  metadata: Record<string, unknown> | null;
  // Derived fields used by Evidence.tsx
  timestampStr: string;
  type: Event['type'];
  confidence: number;
  severity: Event['severity'];
}

export async function fetchEvidence(eventId: string): Promise<EvidenceDetail> {
  const res = await fetch(`${BASE}/evidence/${eventId}`);
  if (!res.ok) throw new Error(`Evidence ${eventId} not found`);
  const d = await res.json();
  const confidence = d.metadata?.confidence
    ? Math.round(Number(d.metadata.confidence) * 100)
    : 85;
  return {
    ...d,
    timestampStr: secondsToTime(d.timestamp),
    type: toEventType(d.event_type ?? ''),
    confidence,
    severity: toSeverity(confidence),
  };
}

/* ------------------------------------------------------------------ */
/*  Memory                                                              */
/* ------------------------------------------------------------------ */

export async function saveMemory(key: string, value: string): Promise<void> {
  await fetch(`${BASE}/memory`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, value, memory_type: 'camera_reference' }),
  });
  // Fire-and-forget — local state update happens regardless
}
