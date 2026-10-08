// src/pages/Dashboard.tsx

import { Link } from 'react-router-dom';
import { Camera, Activity, Database, Zap, Search, ChevronRight, ShieldAlert } from 'lucide-react';
import MetricCard from '../components/ui/MetricCard';
import StatusDot from '../components/ui/StatusDot';
import CameraTile from '../components/cameras/CameraTile';
import { dashboardMetrics, events, cameras } from '../data';

export default function Dashboard() {
  const recentEvents = events.slice(0, 4);

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="font-mono text-[10px] sm:text-xs tracking-widest uppercase mb-1" style={{ color: 'var(--color-text-dim)' }}>
            SOC COMMAND OVERVIEW
          </div>
          <h1 className="text-lg sm:text-xl font-bold" style={{ color: 'var(--color-text)' }}>Dashboard</h1>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="pulse-dot w-2 h-2 rounded-full" style={{ background: 'var(--color-primary)' }} />
          <span className="font-mono text-[10px] sm:text-xs font-bold tracking-widest" style={{ color: 'var(--color-primary)' }}>
            ALL SYSTEMS NOMINAL
          </span>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        <MetricCard
          label="Active Cameras"
          value={dashboardMetrics.cameras}
          icon={<Camera size={14} />}
          accent="primary"
        />
        <MetricCard
          label="Indexed Frames"
          value={dashboardMetrics.indexedFrames}
          icon={<Database size={14} />}
          accent="secondary"
        />
        <MetricCard
          label="Total Events"
          value={dashboardMetrics.events}
          icon={<Activity size={14} />}
          accent="tertiary"
        />
        <MetricCard
          label="Avg Query Time"
          value={dashboardMetrics.avgQueryLatency}
          unit="s"
          decimals={1}
          icon={<Zap size={14} />}
          accent="primary"
        />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Camera feeds — 2/3 width */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs tracking-widest uppercase" style={{ color: 'var(--color-text-dim)' }}>
              Live Feeds
            </span>
            <Link
              to="/app/cameras"
              className="flex items-center gap-1 font-mono text-[10px]"
              style={{ color: 'var(--color-secondary)', textDecoration: 'none' }}
            >
              View all <ChevronRight size={10} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {cameras.map((cam, i) => (
              <CameraTile key={cam.id} camera={cam} index={i} />
            ))}
          </div>
        </div>

        {/* Event feed — 1/3 width */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs tracking-widest uppercase" style={{ color: 'var(--color-text-dim)' }}>
              Recent Events
            </span>
            <Link
              to="/app/events"
              className="flex items-center gap-1 font-mono text-[10px]"
              style={{ color: 'var(--color-secondary)', textDecoration: 'none' }}
            >
              All <ChevronRight size={10} />
            </Link>
          </div>

          <div className="space-y-2">
            {recentEvents.map((evt, i) => (
              <div
                key={evt.id}
                className="card p-3 flex items-start gap-3"
                style={{
                  borderLeft: `2px solid ${
                    evt.severity === 'high' ? 'var(--color-danger)' :
                    evt.severity === 'medium' ? 'var(--color-tertiary)' :
                    'var(--color-border-hi)'
                  }`,
                  animationDelay: `${i * 100}ms`,
                }}
              >
                <ShieldAlert
                  size={12}
                  className="mt-0.5 flex-shrink-0"
                  style={{
                    color: evt.severity === 'high' ? 'var(--color-danger)' :
                           evt.severity === 'medium' ? 'var(--color-tertiary)' :
                           'var(--color-text-muted)',
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs leading-tight" style={{ color: 'var(--color-text)' }}>
                    {evt.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-[9px]" style={{ color: 'var(--color-text-dim)' }}>
                      {evt.timestamp}
                    </span>
                    <span className="font-mono text-[9px]" style={{ color: 'var(--color-secondary)' }}>
                      {evt.cameraId}
                    </span>
                    <span
                      className="font-mono text-[9px] ml-auto font-bold"
                      style={{ color: 'var(--color-primary)' }}
                    >
                      {evt.confidence}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick search CTA */}
          <Link to="/app/search" style={{ textDecoration: 'none', display: 'block' }}>
            <div
              className="card p-4 flex items-center gap-3 cursor-pointer"
              style={{
                background: 'rgba(0,210,255,0.04)',
                border: '1px solid rgba(0,210,255,0.2)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(0,210,255,0.4)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(0,210,255,0.2)')}
            >
              <Search size={14} style={{ color: 'var(--color-secondary)' }} />
              <div>
                <div className="text-xs font-semibold" style={{ color: 'var(--color-secondary)' }}>
                  Start AI Search
                </div>
                <div className="font-mono text-[9px]" style={{ color: 'var(--color-text-dim)' }}>
                  Ask anything about your footage
                </div>
              </div>
              <ChevronRight size={12} className="ml-auto" style={{ color: 'var(--color-secondary)' }} />
            </div>
          </Link>
        </div>
      </div>

      {/* System status bar */}
      <div
        className="card p-3 flex items-center gap-6 flex-wrap"
        style={{ background: 'var(--color-layer1)' }}
      >
        {cameras.map((cam) => (
          <div key={cam.id} className="flex items-center gap-2">
            <StatusDot status={cam.status} size={6} />
            <span className="font-mono text-[10px] font-bold" style={{ color: 'var(--color-text-muted)' }}>
              {cam.id}
            </span>
            <span className="font-mono text-[9px]" style={{ color: 'var(--color-text-dim)' }}>
              {cam.resolution} · {cam.uptime}
            </span>
          </div>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <span className="font-mono text-[9px]" style={{ color: 'var(--color-text-dim)' }}>
            Last indexed:
          </span>
          <span className="font-mono text-[9px] font-bold" style={{ color: 'var(--color-primary)' }}>
            just now
          </span>
        </div>
      </div>
    </div>
  );
}
