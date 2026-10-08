// src/App.tsx

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MemoryProvider } from './context/MemoryContext';
import AppShell from './components/layout/AppShell';

// Pages
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import SearchPage from './pages/Search';
import Cameras from './pages/Cameras';
import Events from './pages/Events';
import Evaluation from './pages/Evaluation';
import Memory from './pages/Memory';
import Evidence from './pages/Evidence';
import Settings from './pages/Settings';

export default function App() {
  return (
    <MemoryProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<Landing />} />

          {/* Authenticated / SOC Operator Application Shell */}
          <Route path="/app" element={<AppShell />}>
            <Route index element={<Dashboard />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="cameras" element={<Cameras />} />
            <Route path="events" element={<Events />} />
            <Route path="evaluation" element={<Evaluation />} />
            <Route path="memory" element={<Memory />} />
            <Route path="evidence/:id" element={<Evidence />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </MemoryProvider>
  );
}
