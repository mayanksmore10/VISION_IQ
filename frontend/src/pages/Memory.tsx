// src/pages/Memory.tsx

import { motion, AnimatePresence } from 'framer-motion';
import { Brain, MapPin, Clock, Trash2, Camera, ChevronRight } from 'lucide-react';
import { useMemory } from '../context/MemoryContext';
import { useNavigate } from 'react-router-dom';
import { stagger, staggerItem } from '../lib/motion';

const sourceLabel: Record<string, string> = {
  clarification: 'LEARNED',
  manual:        'MANUAL',
  auto:          'AUTO',
};

const sourceColor: Record<string, string> = {
  clarification: 'var(--color-primary)',
  manual:        'var(--color-secondary)',
  auto:          'var(--color-tertiary)',
};

export default function Memory() {
  const { mappings, removeMapping, newMappingId } = useMemory();
  const navigate = useNavigate();

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
        <div>
          <div className="font-mono text-[10px] sm:text-xs tracking-widest uppercase mb-1" style={{ color: 'var(--color-text-dim)' }}>
            SPATIAL KNOWLEDGE GRAPH
          </div>
          <h1 className="text-lg sm:text-xl font-bold" style={{ color: 'var(--color-text)' }}>Camera Memory</h1>
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Location-to-camera mappings learned from conversational queries.
          </p>
        </div>
        <div className="badge badge-online self-start sm:self-auto">
          <Brain size={10} />
          {mappings.length} mappings
        </div>
      </div>

      {/* Info card */}
      <div
        className="card p-4 flex items-start gap-3"
        style={{ background: 'rgba(0,210,255,0.04)', border: '1px solid rgba(0,210,255,0.15)' }}
      >
        <Brain size={14} style={{ color: 'var(--color-secondary)', flexShrink: 0, marginTop: 2 }} />
        <div>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            When you search for a location VisionIQ doesn't recognize (e.g. "main gate"), it asks which camera
            represents that location. After you answer, the mapping is saved here and future queries skip the
            clarification step.
          </p>
          <button
            className="text-xs mt-2 underline"
            style={{ color: 'var(--color-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}
            onClick={() => navigate('/app/search')}
          >
            Try a search →
          </button>
        </div>
      </div>

      {/* Mapping cards */}
      {mappings.length === 0 ? (
        <div className="py-16 text-center">
          <Brain size={32} style={{ color: 'var(--color-text-dim)', margin: '0 auto 12px' }} />
          <p className="font-mono text-sm" style={{ color: 'var(--color-text-dim)' }}>
            No mappings yet
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-dim)' }}>
            Run a search to teach VisionIQ about your facility.
          </p>
        </div>
      ) : (
        <AnimatePresence>
          <motion.div
            variants={stagger(0.08)}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
          >
            {mappings.map((m) => {
              const isNew = m.id === newMappingId;
              const color = sourceColor[m.source];

              return (
                <motion.div
                  key={m.id}
                  variants={staggerItem}
                  layout
                  className="card p-4 relative overflow-hidden"
                  animate={
                    isNew
                      ? { borderColor: ['var(--color-primary)', 'var(--color-border-hi)', 'var(--color-border-hi)'] }
                      : {}
                  }
                  transition={isNew ? { duration: 2, times: [0, 0.5, 1] } : {}}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  {/* New pulse highlight */}
                  {isNew && (
                    <motion.div
                      className="absolute inset-0 pointer-events-none"
                      initial={{ opacity: 0.3 }}
                      animate={{ opacity: 0 }}
                      transition={{ duration: 2 }}
                      style={{ background: 'rgba(0,242,152,0.06)' }}
                    />
                  )}

                  {/* Source badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="badge text-[8px]"
                      style={{ background: `${color}12`, color, border: `1px solid ${color}25` }}
                    >
                      {sourceLabel[m.source]}
                    </span>
                    <button
                      className="btn-ghost py-1 px-1.5"
                      onClick={() => removeMapping(m.id)}
                      aria-label={`Remove ${m.location} mapping`}
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>

                  {/* Mapping visual */}
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="flex-1 px-2.5 py-1.5 rounded"
                      style={{ background: 'var(--color-layer2)', border: '1px solid var(--color-border)' }}
                    >
                      <div className="flex items-center gap-1.5">
                        <MapPin size={9} style={{ color: 'var(--color-text-dim)' }} />
                        <span className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>
                          {m.location}
                        </span>
                      </div>
                    </div>
                    <ChevronRight size={12} style={{ color: 'var(--color-text-dim)', flexShrink: 0 }} />
                    <div
                      className="flex-1 px-2.5 py-1.5 rounded"
                      style={{ background: 'var(--color-layer2)', border: `1px solid ${color}30` }}
                    >
                      <div className="flex items-center gap-1.5">
                        <Camera size={9} style={{ color }} />
                        <span className="font-mono text-xs font-bold" style={{ color }}>
                          {m.cameraId}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{m.cameraName}</div>

                  {/* Footer meta */}
                  <div className="flex items-center gap-3 mt-3 pt-3" style={{ borderTop: '1px solid var(--color-border)' }}>
                    <span className="flex items-center gap-1 font-mono text-[9px]" style={{ color: 'var(--color-text-dim)' }}>
                      <Clock size={8} /> {m.updatedAt}
                    </span>
                    <span className="font-mono text-[9px] ml-auto" style={{ color: 'var(--color-text-dim)' }}>
                      {m.queryCount} queries
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
