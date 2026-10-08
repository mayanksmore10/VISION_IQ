// src/components/layout/AppShell.tsx
// Responsive shell — permanent sidebar on desktop, slide-over drawer on mobile

import { useState, useEffect } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, Camera, Search } from 'lucide-react';
import Sidebar from './Sidebar';
import { page } from '../../lib/motion';

export default function AppShell() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  return (
    <div className="app-shell">
      {/* Mobile Top Navigation Bar (< 1024px) */}
      <header
        className="lg:hidden flex items-center justify-between px-3.5 py-2.5 border-b flex-shrink-0 z-30"
        style={{ background: 'var(--color-layer1)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded text-gray-300 hover:text-white focus:outline-none"
            style={{ background: 'var(--color-layer2)', border: '1px solid var(--color-border)' }}
            aria-label="Open navigation menu"
            aria-expanded={sidebarOpen}
          >
            <Menu size={18} />
          </button>

          <Link to="/" className="flex items-center gap-2 no-underline">
            <div
              className="flex items-center justify-center w-6 h-6 rounded"
              style={{ background: 'var(--color-primary)', color: '#0a0d14' }}
            >
              <Camera size={13} />
            </div>
            <span className="font-mono font-bold text-xs tracking-widest" style={{ color: 'var(--color-primary)' }}>
              VISIONIQ
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded font-mono text-[10px]" style={{ background: 'rgba(0,242,152,0.08)', color: 'var(--color-primary)' }}>
            <span className="pulse-dot w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-primary)' }} />
            <span className="hidden sm:inline">ONLINE</span>
          </div>

          <Link
            to="/app/search"
            className="px-2.5 py-1 rounded font-mono text-xs flex items-center gap-1.5"
            style={{
              background: 'rgba(0, 210, 255, 0.1)',
              border: '1px solid rgba(0, 210, 255, 0.25)',
              color: 'var(--color-secondary)',
              textDecoration: 'none',
            }}
            aria-label="Quick AI search"
          >
            <Search size={12} />
            <span className="text-[10px] font-bold">SEARCH</span>
          </Link>
        </div>
      </header>

      {/* Backdrop overlay for mobile drawer */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar — desktop permanent, mobile drawer */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Content — animates on route change */}
      <main className="main-content" id="main-content">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            variants={page}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ minHeight: '100%' }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
