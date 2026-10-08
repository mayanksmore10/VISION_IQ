// src/context/MemoryContext.tsx
// Camera spatial memory — persisted to localStorage and synced to backend

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { initialMemoryMappings, type MemoryMapping } from '../data';
import { saveMemory } from '../services/api';

const STORAGE_KEY = 'visioniq_memory';

interface MemoryContextValue {
  mappings: MemoryMapping[];
  addMapping: (mapping: Omit<MemoryMapping, 'id' | 'queryCount'>) => void;
  removeMapping: (id: string) => void;
  resetMemory: () => void;
  getCamera: (location: string) => MemoryMapping | undefined;
  newMappingId: string | null; // tracks last added id for animation
}

const MemoryContext = createContext<MemoryContextValue | null>(null);

export function MemoryProvider({ children }: { children: React.ReactNode }) {
  const [mappings, setMappings] = useState<MemoryMapping[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : initialMemoryMappings;
    } catch {
      return initialMemoryMappings;
    }
  });

  const [newMappingId, setNewMappingId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mappings));
  }, [mappings]);

  const addMapping = useCallback(
    (mapping: Omit<MemoryMapping, 'id' | 'queryCount'>) => {
      const id = `MEM${Date.now()}`;
      const existing = mappings.find(
        (m) => m.location.toLowerCase() === mapping.location.toLowerCase()
      );
      if (existing) {
        setMappings((prev) =>
          prev.map((m) =>
            m.id === existing.id
              ? { ...m, cameraId: mapping.cameraId, cameraName: mapping.cameraName, updatedAt: 'just now', source: mapping.source }
              : m
          )
        );
        setNewMappingId(existing.id);
      } else {
        const newMapping: MemoryMapping = { ...mapping, id, queryCount: 1 };
        setMappings((prev) => [newMapping, ...prev]);
        setNewMappingId(id);
      }
      // Sync to backend (fire-and-forget — local state already updated)
      saveMemory(
        mapping.location.toLowerCase().replace(/\s+/g, '_'),
        mapping.cameraId,
      ).catch(() => { /* ignore network errors */ });
      setTimeout(() => setNewMappingId(null), 3000);
    },
    [mappings]
  );

  const removeMapping = useCallback((id: string) => {
    setMappings((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const resetMemory = useCallback(() => {
    setMappings(initialMemoryMappings);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const getCamera = useCallback(
    (location: string) =>
      mappings.find((m) => m.location.toLowerCase() === location.toLowerCase()),
    [mappings]
  );

  return (
    <MemoryContext.Provider value={{ mappings, addMapping, removeMapping, resetMemory, getCamera, newMappingId }}>
      {children}
    </MemoryContext.Provider>
  );
}

export function useMemory() {
  const ctx = useContext(MemoryContext);
  if (!ctx) throw new Error('useMemory must be used inside MemoryProvider');
  return ctx;
}
