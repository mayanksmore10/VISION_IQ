// src/pages/Events.tsx

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Filter, ChevronRight } from 'lucide-react';
import { type Event, events as mockEvents } from '../data';
import { fetchEvents } from '../services/api';
import { stagger, staggerItem } from '../lib/motion';

type Severity = 'all' | 'high' | 'medium' | 'low';
type EventType = 'all' | 'person' | 'vehicle' | 'breach' | 'motion';

const typeColor: Record<string, string> = {
  vehicle: 'var(--color-secondary)',
  person:  'var(--color-primary)',
  breach:  'var(--color-danger)',
  motion:  'var(--color-tertiary)',
};

const severityColor: Record<string, string> = {
  high:   'var(--color-danger)',
  medium: 'var(--color-tertiary)',
  low:    'var(--color-text-dim)',
};

function EventRow({ event }: { event: Event }) {
  const navigate = useNavigate();
  const color = typeColor[event.type];
  const sev = severityColor[event.severity];

  return (
    <motion.tr
      variants={staggerItem}
      layout
      className="group cursor-pointer"
      style={{ borderBottom: '1px solid var(--color-border)' }}
      onClick={() => navigate(`/app/evidence/${event.id}`)}
      whileHover={{ backgroundColor: 'rgba(0,210,255,0.03)' }}
    >
      <td className="py-3 px-4 font-mono text-xs" style={{ color: 'var(--color-text-dim)' }}>
        {event.timestamp}
      </td>
      <td className="py-3 px-4">
        <span className="font-mono text-xs font-bold" style={{ color: 'var(--color-secondary)' }}>
          {event.cameraId}
        </span>
      </td>
      <td className="py-3 px-4 text-xs max-w-xs" style={{ color: 'var(--color-text)' }}>
        {event.description}
      </td>
      <td className="py-3 px-4">
        <span
          className="badge"
          style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}
        >
          {event.type.toUpperCase()}
        </span>
      </td>
      <td className="py-3 px-4">
        <span className="badge" style={{ background: `${sev}15`, color: sev, border: `1px solid ${sev}30` }}>
          {event.severity.toUpperCase()}
        </span>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-16 rounded-full overflow-hidden" style={{ background: 'var(--color-border)' }}>
            <div
              className="h-full rounded-full"
              style={{ width: `${event.confidence}%`, background: color }}
            />
          </div>
          <span className="font-mono text-xs font-bold" style={{ color }}>
            {event.confidence}%
          </span>
        </div>
      </td>
      <td className="py-3 px-4">
        <ChevronRight
          size={12}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: 'var(--color-secondary)' }}
        />
      </td>
    </motion.tr>
  );
}

export default function Events() {
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [severity, setSeverity] = useState<Severity>('all');
  const [typeFilter, setTypeFilter] = useState<EventType>('all');

  useEffect(() => {
    fetchEvents({ limit: 200 })
      .then((data) => {
        if (data.length > 0) setEvents(data);
      })
      .catch(() => {});
  }, []);

  const filtered = events.filter((e) => {
    if (severity !== 'all' && e.severity !== severity) return false;
    if (typeFilter !== 'all' && e.type !== typeFilter) return false;
    return true;
  });

  const FilterBtn = ({
    label, active, onClick,
  }: { label: string; active: boolean; onClick: () => void }) => (
    <button
      className="text-[10px] font-mono px-3 py-1.5 rounded border transition-all"
      style={{
        background: active ? 'rgba(0,210,255,0.1)' : 'transparent',
        borderColor: active ? 'var(--color-secondary)' : 'var(--color-border)',
        color: active ? 'var(--color-secondary)' : 'var(--color-text-muted)',
        cursor: 'pointer',
      }}
      onClick={onClick}
    >
      {label}
    </button>
  );

  return (
    <div className="p-4 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
        <div>
          <div className="font-mono text-[10px] sm:text-xs tracking-widest uppercase mb-1" style={{ color: 'var(--color-text-dim)' }}>
            INCIDENT AUDIT LOG
          </div>
          <h1 className="text-lg sm:text-xl font-bold" style={{ color: 'var(--color-text)' }}>Events</h1>
        </div>
        <div className="font-mono text-xs" style={{ color: 'var(--color-text-dim)' }}>
          {filtered.length} of {events.length} events
        </div>
      </div>

      {/* Filters */}
      <div className="card p-3 flex flex-wrap items-center gap-2.5 sm:gap-4">
        <div className="flex items-center gap-1.5">
          <Filter size={11} style={{ color: 'var(--color-text-dim)' }} />
          <span className="font-mono text-[9px] tracking-widest uppercase" style={{ color: 'var(--color-text-dim)' }}>
            Severity
          </span>
        </div>
        <div className="flex gap-1.5 sm:gap-2 flex-wrap">
          {(['all', 'high', 'medium', 'low'] as Severity[]).map((s) => (
            <FilterBtn key={s} label={s.toUpperCase()} active={severity === s} onClick={() => setSeverity(s)} />
          ))}
        </div>

        <div className="hidden sm:block w-px h-4 self-stretch" style={{ background: 'var(--color-border)' }} />

        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[9px] tracking-widest uppercase" style={{ color: 'var(--color-text-dim)' }}>
            Type
          </span>
        </div>
        <div className="flex gap-1.5 sm:gap-2 flex-wrap">
          {(['all', 'person', 'vehicle', 'breach', 'motion'] as EventType[]).map((t) => (
            <FilterBtn key={t} label={t.toUpperCase()} active={typeFilter === t} onClick={() => setTypeFilter(t)} />
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px]" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-layer1)' }}>
                {['Timestamp', 'Camera', 'Description', 'Type', 'Severity', 'Confidence', ''].map((h) => (
                  <th
                    key={h}
                    className="text-left py-2.5 px-4 font-mono text-[9px] tracking-widest uppercase"
                    style={{ color: 'var(--color-text-dim)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
          <AnimatePresence mode="popLayout">
            <motion.tbody
              key={`${severity}-${typeFilter}`}
              variants={stagger(0.05)}
              initial="hidden"
              animate="visible"
            >
              {filtered.map((evt) => (
                <EventRow key={evt.id} event={evt} />
              ))}
            </motion.tbody>
          </AnimatePresence>
        </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <p className="font-mono text-sm" style={{ color: 'var(--color-text-dim)' }}>
              No events match the current filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
