// src/components/search/ClarificationPanel.tsx

import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Check } from 'lucide-react';
import { springPop, stagger, staggerItem } from '../../lib/motion';
import { cameras } from '../../data';

interface Props {
  location: string;
  onSelect: (cameraId: string, cameraName: string) => void;
  selectedId?: string;
}

export default function ClarificationPanel({ location, onSelect, selectedId }: Props) {
  return (
    <motion.div
      variants={springPop}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="card p-5 mt-4"
      style={{ border: '1px solid var(--color-secondary)', boxShadow: '0 0 20px rgba(0,210,255,0.1)' }}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div
          className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: 'rgba(0,210,255,0.1)', border: '1px solid rgba(0,210,255,0.3)' }}
        >
          <Camera size={14} style={{ color: 'var(--color-secondary)' }} />
        </div>
        <div>
          <div className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
            I need one clarification
          </div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            Which camera represents{' '}
            <span className="font-mono font-bold" style={{ color: 'var(--color-secondary)' }}>
              "{location}"
            </span>
            ?
          </div>
        </div>
      </div>

      {/* Camera grid */}
      <motion.div
        variants={stagger(0.08)}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 gap-2"
      >
        {cameras.map((cam) => {
          const selected = selectedId === cam.id;
          return (
            <motion.button
              key={cam.id}
              variants={staggerItem}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelect(cam.id, cam.name)}
              className="relative p-3 rounded text-left transition-all"
              style={{
                background: selected ? 'rgba(0,242,152,0.08)' : 'var(--color-layer2)',
                border: selected ? '1px solid var(--color-primary)' : '1px solid var(--color-border-hi)',
                cursor: 'pointer',
              }}
              aria-pressed={selected}
            >
              <div className="flex items-center justify-between">
                <span
                  className="font-mono text-xs font-bold"
                  style={{ color: selected ? 'var(--color-primary)' : 'var(--color-secondary)' }}
                >
                  {cam.id}
                </span>
                <AnimatePresence>
                  {selected && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="flex items-center justify-center w-4 h-4 rounded-full"
                      style={{ background: 'var(--color-primary)' }}
                    >
                      <Check size={10} color="#0a0d14" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              <div className="text-xs mt-1 font-semibold" style={{ color: 'var(--color-text)' }}>
                {cam.name}
              </div>
              <div className="font-mono text-[9px] mt-0.5" style={{ color: 'var(--color-text-dim)' }}>
                {cam.location}
              </div>
            </motion.button>
          );
        })}
      </motion.div>

      {selectedId && (
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-mono text-xs mt-3 text-center"
          style={{ color: 'var(--color-primary)' }}
        >
          ✓ Saved {location} → {selectedId} to spatial memory
        </motion.p>
      )}
    </motion.div>
  );
}
