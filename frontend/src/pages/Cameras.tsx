// src/pages/Cameras.tsx

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Activity, Clock, Wifi, Video } from 'lucide-react';
import CameraTile from '../components/cameras/CameraTile';
import StatusDot from '../components/ui/StatusDot';
import { type Camera, type Event, events as mockEvents, cameras as mockCameras } from '../data';
import { fetchCameras, fetchEvents } from '../services/api';
import { springPop } from '../lib/motion';

export default function Cameras() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [cameras, setCameras] = useState<Camera[]>(mockCameras);
  const [cameraEvents, setCameraEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const activeCamId = searchParams.get('cam');
  const activeCamera = cameras.find((c) => c.id === activeCamId);

  // Fetch camera list on mount
  useEffect(() => {
    fetchCameras()
      .then((cams) => {
        if (cams.length > 0) setCameras(cams);
      })
      .catch(() => {})  // backend not ready → keep mockCameras
      .finally(() => setLoading(false));
  }, []);

  // Fetch events for the selected camera when detail panel opens
  useEffect(() => {
    if (!activeCamId) { setCameraEvents([]); return; }
    fetchEvents({ camera_id: activeCamId, limit: 4 })
      .then(setCameraEvents)
      .catch(() => {
        // Fallback: filter mock events
        setCameraEvents(mockEvents.filter((e) => e.cameraId === activeCamId));
      });
  }, [activeCamId]);


  const closeDetail = () => {
    const p = new URLSearchParams(searchParams);
    p.delete('cam');
    setSearchParams(p);
  };



  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
      {/* Header */}
      <div>
        <div className="font-mono text-[10px] sm:text-xs tracking-widest uppercase mb-1" style={{ color: 'var(--color-text-dim)' }}>
          CAMERA FLEET
        </div>
        <h1 className="text-lg sm:text-xl font-bold" style={{ color: 'var(--color-text)' }}>
          Camera Control Room
        </h1>
      </div>

      {/* Status bar */}
      <div className="card p-3 flex items-center justify-between gap-3 sm:gap-4 flex-wrap">
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          {cameras.map((cam) => (
            <button
              key={cam.id}
              className="flex items-center gap-1.5 sm:gap-2"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '2px 4px', borderRadius: 4,
              }}
              onClick={() => setSearchParams({ cam: cam.id })}
            >
              <StatusDot status={cam.status} size={6} />
              <span className="font-mono text-[10px] font-bold" style={{ color: 'var(--color-text-muted)' }}>
                {cam.id}
              </span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Wifi size={10} style={{ color: 'var(--color-primary)' }} />
          <span className="font-mono text-[10px]" style={{ color: 'var(--color-text-dim)' }}>
            {cameras.filter((c) => c.status === 'online').length} of {cameras.length} online
          </span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Camera grid */}
        <motion.div layout className="flex-1 min-w-0">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="card overflow-hidden" style={{ aspectRatio: '16/9', opacity: 0.4, background: 'var(--color-layer1)' }} />
              ))}
            </div>
          ) : cameras.length === 0 ? (
            <div className="py-16 text-center">
              <p className="font-mono text-sm" style={{ color: 'var(--color-text-dim)' }}>No cameras registered in backend</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {cameras.map((cam, i) => (
                <CameraTile key={cam.id} camera={cam} index={i} />
              ))}
            </div>
          )}
        </motion.div>

        {/* Camera detail panel */}
        <AnimatePresence>
          {activeCamera && (
            <motion.div
              variants={springPop}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="w-full lg:w-80 flex-shrink-0 space-y-3"
            >
              {/* Detail card */}
              <div
                className="card p-4"
                style={{ border: '1px solid var(--color-border-hi)' }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="font-mono text-xs font-bold tracking-widest"
                    style={{ color: 'var(--color-secondary)' }}
                  >
                    {activeCamera.id}
                  </span>
                  <button
                    className="btn-ghost py-1 px-2"
                    onClick={closeDetail}
                    aria-label="Close detail"
                  >
                    <X size={12} />
                  </button>
                </div>

                {/* Mini feed */}
                <div
                  className="viewfinder relative overflow-hidden rounded mb-3"
                  style={{
                    aspectRatio: '16/9',
                    background: 'linear-gradient(135deg, #0d1117, #0f1a2e)',
                  }}
                >
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,242,152,0.01) 3px, rgba(0,242,152,0.01) 4px)',
                    }}
                  />
                  <div className="scan-line" />
                  <div className="absolute top-1 left-1 badge badge-online" style={{ fontSize: 8 }}>
                    <span className="pulse-dot w-1 h-1 rounded-full" style={{ background: 'var(--color-primary)' }} />
                    LIVE
                  </div>
                </div>

                {/* Info */}
                <h3 className="font-semibold text-sm mb-1" style={{ color: 'var(--color-text)' }}>
                  {activeCamera.name}
                </h3>
                <p className="text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>
                  {activeCamera.location}
                </p>

                <div className="space-y-2">
                  {[
                    { label: 'Resolution', value: activeCamera.resolution, icon: <Video size={10} /> },
                    { label: 'Frame Rate', value: `${activeCamera.fps} fps`, icon: <Activity size={10} /> },
                    { label: 'Uptime',     value: activeCamera.uptime,     icon: <Clock size={10} /> },
                    { label: 'Events 24h', value: String(activeCamera.events24h), icon: <Activity size={10} />, accent: 'var(--color-primary)' },
                  ].map(({ label, value, icon, accent }) => (
                    <div key={label} className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span style={{ color: 'var(--color-text-dim)' }}>{icon}</span>
                        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{label}</span>
                      </div>
                      <span className="font-mono text-xs font-bold" style={{ color: accent || 'var(--color-text)' }}>
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent events for this camera */}
              {cameraEvents.length > 0 && (
                <div className="card p-4">
                  <div className="font-mono text-[9px] tracking-widest uppercase mb-2" style={{ color: 'var(--color-text-dim)' }}>
                    Recent Events
                  </div>
                  <div className="space-y-2">
                    {cameraEvents.slice(0, 4).map((evt) => (
                      <div
                        key={evt.id}
                        className="flex items-start gap-2 py-1.5"
                        style={{ borderBottom: '1px solid var(--color-border)' }}
                      >
                        <span className="font-mono text-[9px] flex-shrink-0" style={{ color: 'var(--color-text-dim)' }}>
                          {evt.timestamp}
                        </span>
                        <span className="text-xs leading-tight" style={{ color: 'var(--color-text-muted)' }}>
                          {evt.description}
                        </span>
                        <span
                          className="font-mono text-[9px] flex-shrink-0 font-bold ml-auto"
                          style={{ color: 'var(--color-primary)' }}
                        >
                          {evt.confidence}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
