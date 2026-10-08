// src/pages/Search.tsx

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search as SearchIcon, X, Sparkles } from 'lucide-react';
import ResultCard from '../components/search/ResultCard';
import ClarificationPanel from '../components/search/ClarificationPanel';
import { simulateSearch, searchSuggestions, type SearchResult } from '../data';
import { queryBackend } from '../services/api';
import { stagger, toastSlide } from '../lib/motion';
import { useMemory } from '../context/MemoryContext';

// Location keywords that might need clarification
const ambiguousLocations = ['main gate', 'rear exit', 'parking', 'lobby'];

function needsClarification(query: string, getCamera: (loc: string) => any): string | null {
  for (const loc of ambiguousLocations) {
    if (query.toLowerCase().includes(loc) && !getCamera(loc)) {
      return loc.split(' ').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
    }
  }
  return null;
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [phase, setPhase] = useState<'idle' | 'searching' | 'results' | 'clarification'>('idle');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [clarificationLocation, setClarificationLocation] = useState<string | null>(null);
  const [selectedCamId, setSelectedCamId] = useState<string | undefined>();
  const [pendingQuery, setPendingQuery] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { getCamera, addMapping } = useMemory();

  const runSearch = useCallback(async (q: string) => {
    setPhase('searching');
    try {
      const res = await queryBackend(q);
      if (res.status === 'clarification_required' && res.clarification) {
        // Backend is asking for clarification — surface through existing UI
        const loc = res.clarification.key.replace(/_/g, ' ');
        const displayLoc = loc.split(' ').map((w: string) => w[0].toUpperCase() + w.slice(1)).join(' ');
        setClarificationLocation(displayLoc);
        setPendingQuery(q);
        setSelectedCamId(undefined);
        setPhase('clarification');
      } else {
        setResults(res.results);
        setPhase('results');
      }
    } catch {
      // Backend unavailable — fallback to local clarification & simulation
      const clarLoc = needsClarification(q, getCamera);
      if (clarLoc) {
        setClarificationLocation(clarLoc);
        setPendingQuery(q);
        setSelectedCamId(undefined);
        setPhase('clarification');
        return;
      }
      const fallback = await simulateSearch(q);
      setResults(fallback);
      setPhase('results');
    }
  }, [getCamera]);


  const handleSubmit = useCallback(async (q: string = query) => {
    if (!q.trim()) return;
    setResults([]);
    await runSearch(q);
  }, [query, runSearch]);


  const handleClarificationSelect = useCallback((camId: string, camName: string) => {
    setSelectedCamId(camId);
    if (clarificationLocation) {
      addMapping({
        location: clarificationLocation,
        cameraId: camId,
        cameraName: camName,
        source: 'clarification',
        updatedAt: 'just now',
      });
      setToast(`✓ Saved ${clarificationLocation} → ${camId}`);
      setTimeout(() => setToast(null), 3000);
      // Run search after a brief delay for feedback
      setTimeout(() => {
        setClarificationLocation(null);
        runSearch(pendingQuery);
      }, 1200);
    }
  }, [clarificationLocation, addMapping, pendingQuery, runSearch]);

  const handleReset = () => {
    setPhase('idle');
    setResults([]);
    setQuery('');
    setClarificationLocation(null);
    setSelectedCamId(undefined);
    inputRef.current?.focus();
  };

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <div className="font-mono text-[10px] sm:text-xs tracking-widest uppercase mb-1" style={{ color: 'var(--color-text-dim)' }}>
          CONVERSATIONAL SEARCH
        </div>
        <h1 className="text-lg sm:text-xl font-bold" style={{ color: 'var(--color-text)' }}>
          Ask Your Cameras
        </h1>
        <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Query your entire surveillance network using natural language.
        </p>
      </div>

      {/* Search bar */}
      <div className="relative">
        <div
          className="flex items-center gap-2 sm:gap-3 card overflow-hidden"
          style={{ padding: '0 0.75rem', borderColor: phase === 'searching' ? 'var(--color-primary)' : 'var(--color-border-hi)' }}
        >
          <SearchIcon size={16} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            className="flex-1 min-w-0 bg-transparent border-none outline-none text-xs sm:text-sm py-3 sm:py-3.5"
            style={{ color: 'var(--color-text)', caretColor: 'var(--color-primary)' }}
            placeholder="e.g. Find a red car entering the main gate…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            aria-label="Search query"
          />
          {query && (
            <button onClick={handleReset} aria-label="Clear" className="p-1">
              <X size={14} style={{ color: 'var(--color-text-muted)' }} />
            </button>
          )}
          <button
            className="btn-primary py-1.5 sm:py-2 px-3 sm:px-4 flex-shrink-0"
            style={{ fontSize: '11px' }}
            onClick={() => handleSubmit()}
            disabled={phase === 'searching'}
          >
            {phase === 'searching' ? 'Searching…' : 'Search'}
          </button>
        </div>

        {/* Scan line when searching */}
        {phase === 'searching' && (
          <div className="absolute inset-0 rounded overflow-hidden pointer-events-none" style={{ zIndex: 20 }}>
            <div className="scan-line" />
          </div>
        )}
      </div>

      {/* Suggestion chips */}
      <AnimatePresence>
        {phase === 'idle' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-wrap gap-2 mt-3"
          >
            {searchSuggestions.slice(0, 4).map((s) => (
              <motion.button
                key={s}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="btn-ghost text-[10px] py-1.5 px-3"
                onClick={() => { setQuery(s); handleSubmit(s); }}
              >
                <Sparkles size={9} />
                {s.length > 38 ? s.slice(0, 38) + '…' : s}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Searching state */}
      <AnimatePresence>
        {phase === 'searching' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-8 space-y-3"
          >
            {[1, 2].map((i) => (
              <div
                key={i}
                className="card overflow-hidden"
                style={{ height: 100, opacity: 0.5 }}
              >
                <div
                  className="h-full w-full"
                  style={{
                    background: 'linear-gradient(90deg, var(--color-layer1) 0%, var(--color-layer2) 50%, var(--color-layer1) 100%)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 1.5s ease infinite',
                  }}
                />
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clarification panel */}
      <AnimatePresence>
        {phase === 'clarification' && clarificationLocation && (
          <div className="mt-4">
            <ClarificationPanel
              location={clarificationLocation}
              onSelect={handleClarificationSelect}
              selectedId={selectedCamId}
            />
          </div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {phase === 'results' && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 space-y-3"
          >
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold" style={{ color: 'var(--color-primary)' }}>
                {results.length} relevant event{results.length !== 1 ? 's' : ''} found
              </span>
              <button
                className="btn-ghost text-[10px] py-1 px-2 ml-auto"
                onClick={handleReset}
              >
                New Search
              </button>
            </div>
            <motion.div
              variants={stagger(0.1)}
              initial="hidden"
              animate="visible"
              className="space-y-3"
            >
              {results.map((r) => (
                <ResultCard key={r.id} result={r} />
              ))}
            </motion.div>
          </motion.div>
        )}
        {phase === 'results' && results.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 text-center py-12"
          >
            <p className="font-mono text-sm" style={{ color: 'var(--color-text-dim)' }}>
              No events matched your query
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            variants={toastSlide}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed top-4 right-4 z-50 card px-4 py-3 font-mono text-xs font-bold"
            style={{
              background: 'rgba(0,242,152,0.1)',
              border: '1px solid var(--color-primary)',
              color: 'var(--color-primary)',
            }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shimmer keyframe */}
      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
