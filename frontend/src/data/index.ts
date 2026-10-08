// src/data/index.ts
// All mock data and types for VisionIQ — no backend

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

export interface Camera {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'offline' | 'warning';
  resolution: string;
  fps: number;
  uptime: string;
  events24h: number;
}

export interface Event {
  id: string;
  timestamp: string;
  cameraId: string;
  cameraName: string;
  description: string;
  type: 'person' | 'vehicle' | 'breach' | 'motion';
  confidence: number;
  severity: 'low' | 'medium' | 'high';
  thumbnail?: string;
}

export interface MemoryMapping {
  id: string;
  location: string;
  cameraId: string;
  cameraName: string;
  source: 'clarification' | 'manual' | 'auto';
  updatedAt: string;
  queryCount: number;
}

export interface EvaluationMetric {
  label: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  delta: number;
}

export interface BenchmarkRow {
  task: string;
  precision: number;
  recall: number;
  f1: number;
  latency: number;
}

export interface SearchResult {
  id: string;
  eventId: string;
  cameraId: string;
  cameraName: string;
  location: string;
  timestamp: string;
  description: string;
  confidence: number;
  type: Event['type'];
}

/* ------------------------------------------------------------------ */
/*  Cameras                                                             */
/* ------------------------------------------------------------------ */

export const cameras: Camera[] = [
  {
    id: 'CAM01',
    name: 'Lobby Camera',
    location: 'Main Lobby',
    status: 'online',
    resolution: '4K UHD',
    fps: 30,
    uptime: '99.8%',
    events24h: 47,
  },
  {
    id: 'CAM02',
    name: 'Parking Camera',
    location: 'Parking Area',
    status: 'online',
    resolution: '1080p',
    fps: 25,
    uptime: '99.1%',
    events24h: 112,
  },
  {
    id: 'CAM03',
    name: 'Main Gate Camera',
    location: 'Main Gate',
    status: 'online',
    resolution: '4K UHD',
    fps: 30,
    uptime: '100%',
    events24h: 203,
  },
  {
    id: 'CAM04',
    name: 'Rear Exit Camera',
    location: 'Rear Exit',
    status: 'online',
    resolution: '1080p',
    fps: 30,
    uptime: '98.7%',
    events24h: 66,
  },
];

/* ------------------------------------------------------------------ */
/*  Events                                                              */
/* ------------------------------------------------------------------ */

export const events: Event[] = [
  {
    id: 'EVT001',
    timestamp: '09:14:23',
    cameraId: 'CAM03',
    cameraName: 'Main Gate Camera',
    description: 'Red car entering gate detected',
    type: 'vehicle',
    confidence: 94,
    severity: 'medium',
  },
  {
    id: 'EVT002',
    timestamp: '09:12:08',
    cameraId: 'CAM03',
    cameraName: 'Main Gate Camera',
    description: 'Person loitering near gate',
    type: 'person',
    confidence: 88,
    severity: 'medium',
  },
  {
    id: 'EVT003',
    timestamp: '09:02:11',
    cameraId: 'CAM02',
    cameraName: 'Parking Camera',
    description: 'Person detected in restricted zone',
    type: 'person',
    confidence: 91,
    severity: 'high',
  },
  {
    id: 'EVT004',
    timestamp: '08:54:31',
    cameraId: 'CAM04',
    cameraName: 'Rear Exit Camera',
    description: 'Vehicle detected — rear exit',
    type: 'vehicle',
    confidence: 87,
    severity: 'low',
  },
  {
    id: 'EVT005',
    timestamp: '08:42:17',
    cameraId: 'CAM01',
    cameraName: 'Lobby Camera',
    description: 'Unidentified person in lobby',
    type: 'person',
    confidence: 79,
    severity: 'low',
  },
  {
    id: 'EVT006',
    timestamp: '08:31:55',
    cameraId: 'CAM03',
    cameraName: 'Main Gate Camera',
    description: 'Perimeter breach detected',
    type: 'breach',
    confidence: 97,
    severity: 'high',
  },
  {
    id: 'EVT007',
    timestamp: '08:20:44',
    cameraId: 'CAM02',
    cameraName: 'Parking Camera',
    description: 'Motion detected — parking area B',
    type: 'motion',
    confidence: 82,
    severity: 'low',
  },
  {
    id: 'EVT008',
    timestamp: '07:58:22',
    cameraId: 'CAM01',
    cameraName: 'Lobby Camera',
    description: 'Multiple persons entered lobby',
    type: 'person',
    confidence: 95,
    severity: 'medium',
  },
];

/* ------------------------------------------------------------------ */
/*  Memory mappings (initial state — persisted in context)             */
/* ------------------------------------------------------------------ */

export const initialMemoryMappings: MemoryMapping[] = [
  {
    id: 'MEM001',
    location: 'Parking Area',
    cameraId: 'CAM02',
    cameraName: 'Parking Camera',
    source: 'auto',
    updatedAt: '2 days ago',
    queryCount: 14,
  },
  {
    id: 'MEM002',
    location: 'Main Lobby',
    cameraId: 'CAM01',
    cameraName: 'Lobby Camera',
    source: 'manual',
    updatedAt: '5 days ago',
    queryCount: 8,
  },
];

/* ------------------------------------------------------------------ */
/*  Evaluation metrics                                                  */
/* ------------------------------------------------------------------ */

export const evaluationMetrics: EvaluationMetric[] = [
  { label: 'Retrieval Accuracy', value: 92.4, unit: '%', trend: 'up', delta: 2.1 },
  { label: 'Camera Resolution', value: 96.1, unit: '%', trend: 'stable', delta: 0.3 },
  { label: 'Timestamp Accuracy', value: 89.7, unit: '%', trend: 'up', delta: 1.5 },
  { label: 'Avg Query Latency', value: 1.8, unit: 's', trend: 'down', delta: 0.2 },
];

export const benchmarkRows: BenchmarkRow[] = [
  { task: 'Person Detection',     precision: 96.2, recall: 94.1, f1: 95.1, latency: 1.4 },
  { task: 'Vehicle Detection',    precision: 97.8, recall: 96.3, f1: 97.0, latency: 1.2 },
  { task: 'Perimeter Breach',     precision: 98.5, recall: 92.7, f1: 95.5, latency: 0.9 },
  { task: 'Semantic Search',      precision: 89.3, recall: 91.2, f1: 90.2, latency: 2.1 },
  { task: 'Location Resolution',  precision: 94.7, recall: 93.8, f1: 94.2, latency: 1.7 },
  { task: 'Temporal Grounding',   precision: 87.9, recall: 88.4, f1: 88.1, latency: 1.9 },
];

export const latencyChartData = [
  { time: '00:00', latency: 2.1 },
  { time: '04:00', latency: 1.9 },
  { time: '08:00', latency: 2.4 },
  { time: '10:00', latency: 3.1 },
  { time: '12:00', latency: 2.8 },
  { time: '14:00', latency: 2.0 },
  { time: '16:00', latency: 1.8 },
  { time: '18:00', latency: 1.7 },
  { time: '20:00', latency: 1.6 },
  { time: '22:00', latency: 1.5 },
];

export const accuracyChartData = [
  { category: 'Person', value: 95.1 },
  { category: 'Vehicle', value: 97.0 },
  { category: 'Breach', value: 95.5 },
  { category: 'Search', value: 90.2 },
  { category: 'Temporal', value: 88.1 },
];

/* ------------------------------------------------------------------ */
/*  Dashboard metrics                                                   */
/* ------------------------------------------------------------------ */

export const dashboardMetrics = {
  cameras: 4,
  indexedFrames: 12482,
  events: 328,
  avgQueryLatency: 1.8,
};

/* ------------------------------------------------------------------ */
/*  Search suggestions                                                  */
/* ------------------------------------------------------------------ */

export const searchSuggestions = [
  'Find a red car entering the main gate',
  'Show me all persons near parking after 9am',
  'Perimeter breach events today',
  'Vehicle at rear exit between 8am and 9am',
  'Who entered the lobby this morning?',
  'Any motion detected in parking area B',
];

/* ------------------------------------------------------------------ */
/*  Helper: simulate async search with delay                           */
/* ------------------------------------------------------------------ */

export function simulateSearch(query: string): Promise<SearchResult[]> {
  return new Promise((resolve) => {
    const delay = 600 + Math.random() * 600;
    setTimeout(() => {
      const lower = query.toLowerCase();
      let results: SearchResult[] = [];

      if (lower.includes('red car') || lower.includes('vehicle') || lower.includes('gate')) {
        results.push({
          id: 'RES001',
          eventId: 'EVT001',
          cameraId: 'CAM03',
          cameraName: 'Main Gate Camera',
          location: 'Main Gate',
          timestamp: '09:14:23',
          description: 'Red car entering gate detected',
          confidence: 94,
          type: 'vehicle',
        });
      }
      if (lower.includes('person') || lower.includes('lobby')) {
        results.push({
          id: 'RES002',
          eventId: 'EVT008',
          cameraId: 'CAM01',
          cameraName: 'Lobby Camera',
          location: 'Main Lobby',
          timestamp: '07:58:22',
          description: 'Multiple persons entered lobby',
          confidence: 95,
          type: 'person',
        });
      }
      if (lower.includes('parking') || lower.includes('person') ) {
        results.push({
          id: 'RES003',
          eventId: 'EVT003',
          cameraId: 'CAM02',
          cameraName: 'Parking Camera',
          location: 'Parking Area',
          timestamp: '09:02:11',
          description: 'Person detected in restricted zone',
          confidence: 91,
          type: 'person',
        });
      }
      if (lower.includes('breach') || lower.includes('perimeter')) {
        results.push({
          id: 'RES004',
          eventId: 'EVT006',
          cameraId: 'CAM03',
          cameraName: 'Main Gate Camera',
          location: 'Main Gate',
          timestamp: '08:31:55',
          description: 'Perimeter breach detected',
          confidence: 97,
          type: 'breach',
        });
      }

      if (results.length === 0) {
        results.push({
          id: 'RES005',
          eventId: 'EVT004',
          cameraId: 'CAM04',
          cameraName: 'Rear Exit Camera',
          location: 'Rear Exit',
          timestamp: '08:54:31',
          description: 'Vehicle detected — rear exit',
          confidence: 87,
          type: 'vehicle',
        });
      }

      resolve(results);
    }, delay);
  });
}

/* ------------------------------------------------------------------ */
/*  Helper: get camera by id                                            */
/* ------------------------------------------------------------------ */

export function getCameraById(id: string): Camera | undefined {
  return cameras.find((c) => c.id === id);
}

export function getEventById(id: string): Event | undefined {
  return events.find((e) => e.id === id);
}
