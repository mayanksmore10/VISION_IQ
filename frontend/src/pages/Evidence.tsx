// src/pages/Evidence.tsx

import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Clock, Shield, Download, Share2 } from 'lucide-react';
import { fetchEvidence, type EvidenceDetail } from '../services/api';
import { getEventById, getCameraById } from '../data';

const typeColor: Record<string, string> = {
  vehicle: 'var(--color-secondary)',
  person:  'var(--color-primary)',
  breach:  'var(--color-danger)',
  motion:  'var(--color-tertiary)',
};

const typeLabel: Record<string, string> = {
  vehicle: 'VEHICLE',
  person:  'PERSON',
  breach:  'BREACH',
  motion:  'MOTION',
};

// Timeline scrubber events for mock
const timelineMarkers = [
  { position: 12, type: 'motion' as const,  label: '08:54' },
  { position: 31, type: 'vehicle' as const, label: '09:02' },
  { position: 58, type: 'person' as const,  label: '09:12' },
  { position: 72, type: 'vehicle' as const, label: '09:14' },
  { position: 88, type: 'breach' as const,  label: '09:18' },
];

export default function Evidence() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [evidence, setEvidence] = useState<EvidenceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) { setNotFound(true); setLoading(false); return; }
    fetchEvidence(id)
      .then(setEvidence)
      .catch(() => {
        const mockEvt = getEventById(id);
        if (mockEvt) {
          const cam = getCameraById(mockEvt.cameraId);
          setEvidence({
            event_id: Number(mockEvt.id.replace(/\D/g, '')) || 1,
            camera_id: mockEvt.cameraId,
            camera_name: cam?.name ?? mockEvt.cameraName,
            timestamp: 0,
            event_type: mockEvt.description,
            frame_url: '',
            clip_url: '',
            metadata: null,
            timestampStr: mockEvt.timestamp,
            type: mockEvt.type,
            confidence: mockEvt.confidence,
            severity: mockEvt.severity,
          });
        } else {
          setNotFound(true);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <p className="font-mono text-xs" style={{ color: 'var(--color-text-dim)' }}>Loading evidence…</p>
      </div>
    );
  }

  if (notFound || !evidence) {

    return (
      <div className="p-6 flex flex-col items-center justify-center h-full">
        <p className="font-mono text-sm" style={{ color: 'var(--color-text-dim)' }}>
          Event not found
        </p>
        <button className="btn-ghost mt-4" onClick={() => navigate(-1)}>
          <ArrowLeft size={12} /> Back
        </button>
      </div>
    );
  }

  const color = typeColor[evidence.type] || 'var(--color-primary)';
  const label = typeLabel[evidence.type] || 'EVENT';
  // Convenience aliases so the JSX below reads clearly
  const cameraId   = evidence.camera_id;
  const cameraName = evidence.camera_name ?? evidence.camera_id;
  const timestamp  = evidence.timestampStr;
  const eventDesc  = evidence.event_type?.replace(/_/g, ' ') ?? 'Event detected';
  const confidence = evidence.confidence;
  const eventId    = String(evidence.event_id);

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
      {/* Back nav */}
      <button
        className="flex items-center gap-2 font-mono text-xs"
        style={{ color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={12} /> Back to results
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
        <div>
          <div className="font-mono text-[10px] sm:text-xs tracking-widest uppercase mb-1" style={{ color: 'var(--color-text-dim)' }}>
            Evidence Vault · {eventId}
          </div>
          <h1 className="text-lg sm:text-xl font-bold" style={{ color: 'var(--color-text)' }}>
            {eventDesc}
          </h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
          <button className="btn-ghost py-1.5 sm:py-2 px-2.5 sm:px-3" aria-label="Share evidence">
            <Share2 size={12} />
          </button>
          <button className="btn-ghost py-1.5 sm:py-2 px-2.5 sm:px-3" aria-label="Download evidence">
            <Download size={12} />
          </button>
          <span
            className="badge"
            style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}
          >
            {label}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Camera frame — main feature */}
        <div className="lg:col-span-2 space-y-4">
          {/* Frame with shared layoutId */}
          <motion.div
            layoutId={`evidence-frame-RES001`}
            className="viewfinder relative overflow-hidden rounded"
            style={{
              aspectRatio: '16/9',
              background: 'linear-gradient(135deg, #0d1117 0%, #0f1a2e 50%, #091217 100%)',
              border: `1px solid ${color}40`,
            }}
          >
            {/* Scanlines */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,242,152,0.012) 3px, rgba(0,242,152,0.012) 4px)',
              }}
            />

            {/* Grid dots */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(rgba(0,242,152,0.05) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />

            {/* Bounding box — animated */}
            <motion.div
              className="absolute"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              style={{
                top: '18%', left: '28%', right: '18%', bottom: '18%',
                border: `1.5px solid ${color}`,
              }}
            >
              {/* ID pill */}
              <div
                className="absolute -top-5 left-0 font-mono text-[9px] font-bold px-1.5 py-0.5"
                style={{ background: color, color: '#0a0d14', whiteSpace: 'nowrap' }}
              >
                ID: 8092 · CONF: {confidence}% · {label}
              </div>

              {/* Corner accents */}
              {['top-0 left-0', 'top-0 right-0', 'bottom-0 left-0', 'bottom-0 right-0'].map((pos) => (
                <span
                  key={pos}
                  className={`absolute w-2 h-2 ${pos}`}
                  style={{
                    borderTop: pos.includes('top') ? `2px solid ${color}` : 'none',
                    borderBottom: pos.includes('bottom') ? `2px solid ${color}` : 'none',
                    borderLeft: pos.includes('left') ? `2px solid ${color}` : 'none',
                    borderRight: pos.includes('right') ? `2px solid ${color}` : 'none',
                  }}
                />
              ))}

              {/* Motion vector */}
              <motion.div
                className="absolute right-0 top-1/2 h-px"
                style={{ background: color, width: 20, transform: 'translateX(100%)' }}
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.8, repeat: Infinity }}
              />
            </motion.div>

            {/* HUD labels */}
            <div className="absolute top-2 left-2 badge badge-online">
              <span className="pulse-dot w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-primary)' }} />
              EVIDENCE LOCKED
            </div>
            <div
              className="absolute top-2 right-2 font-mono text-[9px] px-1.5 py-0.5 rounded font-bold"
              style={{ background: 'rgba(10,13,20,0.8)', color: 'var(--color-secondary)', border: '1px solid rgba(0,210,255,0.3)' }}
            >
              {cameraId}
            </div>
            <div
              className="absolute bottom-2 left-2 font-mono text-[9px]"
              style={{ color: 'rgba(240,244,250,0.6)' }}
            >
              {timestamp} · REC
            </div>
            <div
              className="absolute bottom-2 right-2 font-mono text-[9px]"
              style={{ color: color, opacity: 0.8 }}
            >
              FRAME 09847
            </div>
          </motion.div>

          {/* Timeline scrubber */}
          <div className="card p-4">
            <div className="font-mono text-[9px] tracking-widest uppercase mb-3" style={{ color: 'var(--color-text-dim)' }}>
              Event Timeline · Today
            </div>
            <div className="relative h-8">
              {/* Track */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-full h-1 rounded-full"
                style={{ background: 'var(--color-border)' }}
              />

              {/* Progress */}
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 h-1 rounded-full"
                style={{ background: 'var(--color-secondary)', left: 0 }}
                initial={{ width: 0 }}
                animate={{ width: '72%' }}
                transition={{ duration: 1, ease: [0.4, 0, 0.2, 1], delay: 0.5 }}
              />

              {/* Playhead */}
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 w-0.5 h-6 -translate-x-1/2"
                style={{ left: '72%', background: 'var(--color-secondary)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                <div
                  className="absolute -top-4 -translate-x-1/2 font-mono text-[8px] px-1 py-0.5 rounded"
                  style={{ background: 'var(--color-secondary)', color: '#0a0d14', whiteSpace: 'nowrap', left: '50%' }}
                >
                  {timestamp}
                </div>
              </motion.div>

              {/* Markers */}
              {timelineMarkers.map((m, i) => {
                const mc = typeColor[m.type];
                return (
                  <div
                    key={i}
                    className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full -translate-x-1/2"
                    style={{ left: `${m.position}%`, background: mc, zIndex: 10 }}
                    title={`${m.label} · ${m.type}`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between mt-1">
              <span className="font-mono text-[8px]" style={{ color: 'var(--color-text-dim)' }}>08:00</span>
              <span className="font-mono text-[8px]" style={{ color: 'var(--color-text-dim)' }}>10:00</span>
            </div>
          </div>
        </div>

        {/* Metadata panel */}
        <div className="space-y-3">
          {/* Key metadata */}
          <div className="card p-4 space-y-3">
            <div className="font-mono text-[9px] tracking-widest uppercase" style={{ color: 'var(--color-text-dim)' }}>
              Event Metadata
            </div>

            {[
              { label: 'Camera', value: `${cameraId} — ${cameraName}`, icon: <MapPin size={10} /> },
              { label: 'Location', value: cameraName, icon: <MapPin size={10} /> },
              { label: 'Timestamp', value: timestamp, icon: <Clock size={10} />, mono: true },
              { label: 'Confidence', value: `${confidence}%`, icon: <Shield size={10} />, accent: color },
              { label: 'Severity', value: evidence.severity.toUpperCase(), mono: true },
              { label: 'Resolution', value: '—' },
              { label: 'Event ID', value: eventId, mono: true },
            ].map(({ label, value, icon, mono, accent }) => (
              <div key={label} className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  {icon && <span style={{ color: 'var(--color-text-dim)' }}>{icon}</span>}
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{label}</span>
                </div>
                <span
                  className={mono ? 'font-mono' : ''}
                  style={{ fontSize: 11, color: accent || 'var(--color-text)', textAlign: 'right' }}
                >
                  {value}
                </span>
              </div>
            ))}

            {/* Confidence bar */}
            <div>
              <div className="h-1.5 rounded-full overflow-hidden mt-1" style={{ background: 'var(--color-border)' }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${confidence}%` }}
                  transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1], delay: 0.4 }}
                />
              </div>
            </div>
          </div>

          {/* AI Evidence summary */}
          <div className="card p-4">
            <div className="font-mono text-[9px] tracking-widest uppercase mb-2" style={{ color: 'var(--color-text-dim)' }}>
              AI Evidence Analysis
            </div>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
              At <span className="font-mono font-bold" style={{ color: 'var(--color-text)' }}>{timestamp}</span>, camera{' '}
              <span className="font-mono font-bold" style={{ color: 'var(--color-secondary)' }}>{cameraId}</span> detected
              a <span style={{ color: color }}>{evidence.type}</span> event with{' '}
              <span className="font-bold" style={{ color: color }}>{confidence}%</span> confidence.
            </p>
            <p className="text-xs leading-relaxed mt-2" style={{ color: 'var(--color-text-muted)' }}>
              Object tracking confirmed movement direction and velocity. Bounding box intersection with defined zones recorded.
              No secondary confirmation required at this confidence level.
            </p>
            <div
              className="mt-3 p-2 rounded font-mono text-[9px] leading-relaxed"
              style={{ background: 'var(--color-layer2)', color: 'var(--color-text-dim)', border: '1px solid var(--color-border)' }}
            >
              CHAIN-OF-CUSTODY: VERIFIED · FRAME-HASH: F3A9C2 · INDEXER: v2.4.1
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
