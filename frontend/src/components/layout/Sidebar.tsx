// src/components/layout/Sidebar.tsx

import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Search, Camera, ShieldAlert,
  FlaskConical, Brain, Settings, Wifi, X
} from 'lucide-react';
import { sidebarIndicator } from '../../lib/motion';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  highlight?: boolean;
}

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const navItems: NavItem[] = [
  { to: '/app',           label: 'Dashboard',  icon: <LayoutDashboard size={16} /> },
  { to: '/app/search',    label: 'Search',     icon: <Search size={16} />,        highlight: true },
  { to: '/app/cameras',   label: 'Cameras',    icon: <Camera size={16} /> },
  { to: '/app/events',    label: 'Events',     icon: <ShieldAlert size={16} /> },
  { to: '/app/evaluation',label: 'Evaluation', icon: <FlaskConical size={16} /> },
  { to: '/app/memory',    label: 'Memory',     icon: <Brain size={16} /> },
  { to: '/app/settings',  label: 'Settings',   icon: <Settings size={16} /> },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { pathname } = useLocation();

  const isActive = (to: string) => {
    if (to === '/app') return pathname === '/app';
    return pathname.startsWith(to);
  };

  return (
    <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`} aria-label="Sidebar navigation">
      {/* Logo */}
      <div className="px-4 py-4 sm:py-5 border-b flex items-center justify-between" style={{ borderColor: 'var(--color-border)' }}>
        <Link to="/" onClick={() => onClose?.()} className="flex items-center gap-2 no-underline">
          <div
            className="flex items-center justify-center w-7 h-7 rounded flex-shrink-0"
            style={{ background: 'var(--color-primary)', color: '#0a0d14' }}
          >
            <Camera size={14} />
          </div>
          <div>
            <div className="font-mono font-bold text-xs tracking-widest" style={{ color: 'var(--color-primary)' }}>
              VISIONIQ
            </div>
            <div className="font-mono text-[9px] tracking-wider" style={{ color: 'var(--color-text-dim)' }}>
              CCTV INTELLIGENCE
            </div>
          </div>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded transition-colors text-gray-400 hover:text-white"
            style={{ background: 'var(--color-layer2)', border: '1px solid var(--color-border)' }}
            aria-label="Close navigation"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2" aria-label="Main navigation">
        {navItems.map((item) => {
          const active = isActive(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => onClose?.()}
              aria-current={active ? 'page' : undefined}
              style={{ textDecoration: 'none', display: 'block', marginBottom: '2px' }}
            >
              <div
                className="relative flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-colors"
                style={{
                  color: active
                    ? item.highlight ? 'var(--color-primary)' : 'var(--color-text)'
                    : item.highlight ? 'var(--color-secondary)' : 'var(--color-text-muted)',
                  background: active ? 'var(--color-layer2)' : 'transparent',
                }}
                onMouseEnter={(e) => {
                  if (!active) (e.currentTarget as HTMLElement).style.color = 'var(--color-text)';
                }}
                onMouseLeave={(e) => {
                  if (!active)
                    (e.currentTarget as HTMLElement).style.color = item.highlight
                      ? 'var(--color-secondary)'
                      : 'var(--color-text-muted)';
                }}
              >
                {/* Active indicator */}
                {active && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1 bottom-1 w-0.5 rounded-r"
                    style={{ background: item.highlight ? 'var(--color-primary)' : 'var(--color-secondary)' }}
                    transition={sidebarIndicator}
                  />
                )}

                <span className="flex-shrink-0">{item.icon}</span>
                <span className="text-xs tracking-wide">{item.label}</span>

                {/* Highlight badge for Search */}
                {item.highlight && !active && (
                  <span
                    className="ml-auto text-[9px] font-mono font-bold tracking-widest uppercase px-1.5 py-0.5 rounded"
                    style={{ background: 'rgba(0,210,255,0.1)', color: 'var(--color-secondary)', border: '1px solid rgba(0,210,255,0.2)' }}
                  >
                    AI
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer — system status */}
      <div
        className="px-4 py-4 border-t"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center gap-2">
          <span
            className="pulse-dot w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: 'var(--color-primary)' }}
          />
          <span className="font-mono text-[10px] font-bold tracking-widest" style={{ color: 'var(--color-primary)' }}>
            SYSTEM ONLINE
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-1.5">
          <Wifi size={10} style={{ color: 'var(--color-text-dim)' }} />
          <span className="font-mono text-[9px]" style={{ color: 'var(--color-text-dim)' }}>
            4 feeds · 0 errors
          </span>
        </div>
      </div>
    </aside>
  );
}
