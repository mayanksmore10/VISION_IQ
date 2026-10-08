// src/components/search/ResultCard.tsx

import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, MapPin, Clock } from 'lucide-react';
import { staggerItem } from '../../lib/motion';
import type { SearchResult } from '../../data';

interface Props {
  result: SearchResult;
}

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

export default function ResultCard({ result }: Props) {
  const navigate = useNavigate();
  const color = typeColor[result.type] || 'var(--color-primary)';

  return (
    <motion.div
      variants={staggerItem}
      layoutId={`result-card-${result.id}`}
      className="card overflow-hidden cursor-pointer group"
      style={{ borderColor: 'var(--color-border-hi)' }}
      onClick={() => navigate(`/app/evidence/${result.eventId}`)}
      whileHover={{ borderColor: color }}
      role="button"
      tabIndex={0}
      aria-label={`View evidence for ${result.description}`}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/app/evidence/${result.eventId}`)}
    >
      <div className="flex flex-col sm:flex-row gap-0">
        {/* Camera feed mock */}
        <motion.div
          layoutId={`evidence-frame-${result.id}`}
          className="viewfinder relative flex-shrink-0 w-full sm:w-36 h-32 sm:h-auto min-h-[96px]"
          style={{
            background: 'linear-gradient(135deg, #0d1117 0%, #0f1a2e 50%, #091217 100%)',
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,242,152,0.012) 3px, rgba(0,242,152,0.012) 4px)',
            }}
          />
          {/* Bounding box */}
          <div
            className="absolute"
            style={{
              top: '20%', left: '30%', right: '15%', bottom: '20%',
              border: `1px solid ${color}`,
            }}
          >
            <div
              className="absolute -top-4 left-0 px-1 py-0.5 font-mono text-[8px] font-bold"
              style={{ background: color, color: '#0a0d14', whiteSpace: 'nowrap' }}
            >
              {typeLabel[result.type]} · {result.confidence}%
            </div>
          </div>
          <div
            className="absolute top-1 left-1 font-mono text-[8px]"
            style={{ color: 'rgba(240,244,250,0.6)' }}
          >
            {result.cameraId}
          </div>
        </motion.div>

        {/* Content */}
        <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold leading-snug" style={{ color: 'var(--color-text)' }}>
                {result.description}
              </p>
              <ChevronRight
                size={14}
                className="flex-shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color }}
              />
            </div>

            {/* Confidence bar */}
            <div className="mt-2">
              <div className="flex justify-between mb-1">
                <span className="font-mono text-[9px] uppercase tracking-widest" style={{ color: 'var(--color-text-dim)' }}>
                  Confidence
                </span>
                <span className="font-mono text-[10px] font-bold" style={{ color }}>
                  {result.confidence}%
                </span>
              </div>
              <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--color-border)' }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${result.confidence}%` }}
                  transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1], delay: 0.2 }}
                />
              </div>
            </div>
          </div>

          {/* Meta */}
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className="flex items-center gap-1 font-mono text-[9px]" style={{ color: 'var(--color-text-muted)' }}>
              <MapPin size={9} /> {result.location}
            </span>
            <span className="flex items-center gap-1 font-mono text-[9px]" style={{ color: 'var(--color-text-muted)' }}>
              <Clock size={9} /> {result.timestamp}
            </span>
            <span
              className="badge ml-auto"
              style={{
                background: `${color}18`,
                color,
                border: `1px solid ${color}30`,
              }}
            >
              {typeLabel[result.type]}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
