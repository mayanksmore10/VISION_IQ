// src/components/cameras/CameraTile.tsx

import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Maximize2 } from 'lucide-react';
import StatusDot from '../ui/StatusDot';
import type { Camera } from '../../data';

interface Props {
  camera: Camera;
  index?: number;
  compact?: boolean;
}

// Deterministic "camera feed" gradient per camera
const feedGradients: Record<string, string> = {
  CAM01: 'linear-gradient(135deg, #0d1117 0%, #0f1a2e 50%, #091217 100%)',
  CAM02: 'linear-gradient(135deg, #0d1117 0%, #141a0e 50%, #0f1a12 100%)',
  CAM03: 'linear-gradient(135deg, #0d1117 0%, #1a0e14 50%, #14091a 100%)',
  CAM04: 'linear-gradient(135deg, #0d1117 0%, #0e1a1a 50%, #091214 100%)',
};

export default function CameraTile({ camera, index = 0, compact = false }: Props) {
  const navigate = useNavigate();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ scale: 1.015 }}
      className="card overflow-hidden cursor-pointer group"
      style={{ borderColor: camera.status === 'online' ? 'var(--color-border-hi)' : 'var(--color-border)' }}
      onClick={() => navigate(`/app/cameras?cam=${camera.id}`)}
      role="button"
      tabIndex={0}
      aria-label={`View ${camera.name}`}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/app/cameras?cam=${camera.id}`)}
    >
      {/* Feed display */}
      <div
        className="viewfinder relative overflow-hidden"
        style={{
          aspectRatio: '16/9',
          background: feedGradients[camera.id] || feedGradients.CAM01,
        }}
      >
        {/* Scanline overlay */}
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
            backgroundImage: 'radial-gradient(rgba(0,242,152,0.06) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Center crosshair */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <div className="relative w-8 h-8">
            <div className="absolute top-1/2 left-0 right-0 h-px" style={{ background: 'var(--color-secondary)' }} />
            <div className="absolute left-1/2 top-0 bottom-0 w-px" style={{ background: 'var(--color-secondary)' }} />
          </div>
        </div>

        {/* Status badge top-left */}
        <div className="absolute top-2 left-2 badge badge-online">
          <StatusDot status={camera.status} size={5} />
          LIVE
        </div>

        {/* Camera ID top-right */}
        <div
          className="absolute top-2 right-2 font-mono text-[9px] font-bold tracking-widest px-1.5 py-0.5 rounded"
          style={{ background: 'rgba(10,13,20,0.7)', color: 'var(--color-secondary)', border: '1px solid rgba(0,210,255,0.2)' }}
        >
          {camera.id}
        </div>

        {/* Hover maximize button */}
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            className="flex items-center justify-center w-6 h-6 rounded"
            style={{ background: 'rgba(0,210,255,0.15)', color: 'var(--color-secondary)', border: '1px solid rgba(0,210,255,0.3)' }}
            aria-label="Expand feed"
            onClick={(e) => { e.stopPropagation(); navigate(`/app/cameras?cam=${camera.id}`); }}
          >
            <Maximize2 size={10} />
          </button>
        </div>

        {/* Timestamp bottom-left */}
        <div
          className="absolute bottom-2 left-2 font-mono text-[9px] tracking-widest"
          style={{ color: 'rgba(240,244,250,0.5)' }}
        >
          {new Date().toLocaleTimeString('en-US', { hour12: false })}
        </div>
      </div>

      {/* Info row */}
      {!compact && (
        <div className="px-3 py-2 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="text-xs font-semibold truncate" style={{ color: 'var(--color-text)' }}>{camera.name}</div>
            <div className="font-mono text-[10px] truncate" style={{ color: 'var(--color-text-muted)' }}>{camera.location}</div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="font-mono text-xs font-bold" style={{ color: 'var(--color-primary)' }}>
              {camera.events24h}
            </div>
            <div className="font-mono text-[9px]" style={{ color: 'var(--color-text-dim)' }}>events</div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
