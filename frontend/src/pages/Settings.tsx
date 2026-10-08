// src/pages/Settings.tsx

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings as SettingsIcon, Cpu, Brain, Shield, Bell,
  Save, RotateCcw, Check, Sparkles, AlertTriangle, Download,
  Layers, HardDrive, Wifi
} from 'lucide-react';
import { useMemory } from '../context/MemoryContext';
import { toastSlide, stagger, staggerItem } from '../lib/motion';

export default function Settings() {
  const { mappings, resetMemory } = useMemory();

  // Settings State
  const [model, setModel] = useState<'omni-v4' | 'depth-sam2' | 'yolo-xl'>('omni-v4');
  const [confidence, setConfidence] = useState<number>(75);
  const [nmsIou, setNmsIou] = useState<number>(45);
  const [acceleration, setAcceleration] = useState<'webgpu' | 'cuda' | 'tensorrt'>('webgpu');
  const [targetFps, setTargetFps] = useState<number>(30);
  const [lowLatency, setLowLatency] = useState<boolean>(true);

  const [autoLearn, setAutoLearn] = useState<boolean>(true);
  const [strictness, setStrictness] = useState<'balanced' | 'aggressive' | 'conservative'>('balanced');

  const [retentionDays, setRetentionDays] = useState<number>(90);
  const [forensicChecksum, setForensicChecksum] = useState<boolean>(true);
  const [autoExportVault, setAutoExportVault] = useState<boolean>(true);

  const [audioAlarm, setAudioAlarm] = useState<boolean>(false);
  const [webhookUrl, setWebhookUrl] = useState<string>('https://soc-relay.internal/webhook/v1/alerts');
  const [webhookTesting, setWebhookTesting] = useState<boolean>(false);
  const [webhookStatus, setWebhookStatus] = useState<string | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [resetModalOpen, setResetModalOpen] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSave = () => {
    showToast('Configuration updated and synced across edge nodes');
  };

  const handleTestWebhook = () => {
    setWebhookTesting(true);
    setWebhookStatus(null);
    setTimeout(() => {
      setWebhookTesting(false);
      setWebhookStatus('Connected (200 OK)');
      setTimeout(() => setWebhookStatus(null), 4000);
    }, 1200);
  };

  const handleResetMemory = () => {
    resetMemory();
    setResetModalOpen(false);
    showToast('Spatial knowledge graph reset to baseline defaults');
  };

  const handleExportConfig = () => {
    const configData = {
      model,
      confidence,
      nmsIou,
      acceleration,
      targetFps,
      lowLatency,
      autoLearn,
      strictness,
      retentionDays,
      forensicChecksum,
      autoExportVault,
      audioAlarm,
      webhookUrl,
      exportedAt: new Date().toISOString(),
      platform: 'VisionIQ CCTV Intelligence v2.4',
    };
    const blob = new Blob([JSON.stringify(configData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `visioniq-config-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Configuration exported as JSON');
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-6xl mx-auto">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            variants={toastSlide}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed top-4 left-4 right-4 sm:left-auto sm:right-6 sm:top-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded text-xs font-mono font-bold shadow-2xl max-w-sm"
            style={{
              background: 'var(--color-layer2)',
              border: '1px solid var(--color-primary)',
              color: 'var(--color-primary)',
              boxShadow: '0 0 24px rgba(0,242,152,0.25)',
            }}
          >
            <Check size={14} className="flex-shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div>
          <div className="font-mono text-[10px] sm:text-xs tracking-widest uppercase mb-1" style={{ color: 'var(--color-text-dim)' }}>
            CONTROL ROOM PREFERENCES
          </div>
          <h1 className="text-lg sm:text-xl font-bold flex items-center gap-2.5" style={{ color: 'var(--color-text)' }}>
            <SettingsIcon size={20} style={{ color: 'var(--color-secondary)' }} />
            System Settings
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Manage neural vision runtime, spatial ontology learning, evidence vaulting, and alert webhooks.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            className="btn-ghost flex-1 sm:flex-none justify-center"
            onClick={handleExportConfig}
            title="Export config JSON"
          >
            <Download size={13} />
            Export Config
          </button>
          <button
            className="btn-primary flex-1 sm:flex-none justify-center"
            onClick={handleSave}
          >
            <Save size={13} />
            Save Changes
          </button>
        </div>
      </div>

      <motion.div variants={stagger()} initial="hidden" animate="visible" className="space-y-6">
        {/* Section 1: AI Vision & Inference Runtime */}
        <motion.div variants={staggerItem} className="card p-5 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded flex items-center justify-center" style={{ background: 'rgba(0,210,255,0.1)', color: 'var(--color-secondary)' }}>
                <Cpu size={16} />
              </div>
              <div>
                <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>AI Vision Inference Engine</h2>
                <p className="font-mono text-[10px]" style={{ color: 'var(--color-text-dim)' }}>Model selection, confidence gates & accelerator</p>
              </div>
            </div>
            <span className="badge badge-online">
              <Sparkles size={10} /> Edge Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { id: 'omni-v4', name: 'VisionIQ Omni-V4', desc: 'Multimodal edge reasoning with real-time zero-shot query', tag: 'RECOMMENDED' },
              { id: 'depth-sam2', name: 'VisionIQ SAM-2 Depth', desc: 'Segment-anything fine-tuned for high-density crowds', tag: 'HIGH ACCURACY' },
              { id: 'yolo-xl', name: 'YOLOv11-Security-XL', desc: 'Ultra-high framerate bounding box & vehicle re-ID', tag: 'LOW LATENCY' },
            ].map((m) => {
              const active = model === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => setModel(m.id as any)}
                  className="p-3.5 rounded cursor-pointer transition-all border"
                  style={{
                    background: active ? 'rgba(0,210,255,0.06)' : 'var(--color-surface)',
                    borderColor: active ? 'var(--color-secondary)' : 'var(--color-border)',
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold" style={{ color: active ? 'var(--color-secondary)' : 'var(--color-text)' }}>
                      {m.name}
                    </span>
                    <span className="font-mono text-[9px] px-1.5 py-0.5 rounded" style={{
                      background: active ? 'rgba(0,210,255,0.2)' : 'rgba(255,255,255,0.05)',
                      color: active ? 'var(--color-secondary)' : 'var(--color-text-dim)',
                    }}>
                      {m.tag}
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                    {m.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Sliders & Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>
                  Detection Confidence Threshold
                </label>
                <span className="font-mono text-xs font-bold" style={{ color: 'var(--color-primary)' }}>
                  {confidence}%
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="95"
                step="1"
                value={confidence}
                onChange={(e) => setConfidence(Number(e.target.value))}
                className="w-full accent-[var(--color-primary)] cursor-pointer"
              />
              <p className="font-mono text-[10px] mt-1" style={{ color: 'var(--color-text-dim)' }}>
                Detections below this score are filtered out before reaching forensic indexing.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>
                  NMS IOU Overlap Gate
                </label>
                <span className="font-mono text-xs font-bold" style={{ color: 'var(--color-secondary)' }}>
                  {nmsIou}%
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="80"
                step="1"
                value={nmsIou}
                onChange={(e) => setNmsIou(Number(e.target.value))}
                className="w-full accent-[var(--color-secondary)] cursor-pointer"
              />
              <p className="font-mono text-[10px] mt-1" style={{ color: 'var(--color-text-dim)' }}>
                Non-maximum suppression threshold to prevent duplicate vehicle & person alerts.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--color-text)' }}>
                Hardware Acceleration
              </label>
              <select
                value={acceleration}
                onChange={(e) => setAcceleration(e.target.value as any)}
                className="input-base text-xs font-mono"
              >
                <option value="webgpu">WebGPU (Browser Direct)</option>
                <option value="cuda">CUDA 12.4 (NVIDIA RT-Edge)</option>
                <option value="tensorrt">TensorRT-LLM (Enterprise Cluster)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--color-text)' }}>
                Target Frame Rate
              </label>
              <select
                value={targetFps}
                onChange={(e) => setTargetFps(Number(e.target.value))}
                className="input-base text-xs font-mono"
              >
                <option value={15}>15 FPS (Resource Saver)</option>
                <option value={30}>30 FPS (Standard Real-time)</option>
                <option value={60}>60 FPS (Ultra Forensic)</option>
              </select>
            </div>

            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded border" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
                <input
                  type="checkbox"
                  checked={lowLatency}
                  onChange={(e) => setLowLatency(e.target.checked)}
                  className="accent-[var(--color-primary)] w-4 h-4 cursor-pointer"
                />
                <span className="text-xs" style={{ color: 'var(--color-text)' }}>
                  Sub-150ms Low-Latency Stream
                </span>
              </label>
            </div>
          </div>
        </motion.div>

        {/* Section 2: Spatial Memory & Conversational Learning */}
        <motion.div variants={staggerItem} className="card p-5 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded flex items-center justify-center" style={{ background: 'rgba(0,242,152,0.1)', color: 'var(--color-primary)' }}>
                <Brain size={16} />
              </div>
              <div>
                <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Camera Memory & Spatial Ontology</h2>
                <p className="font-mono text-[10px]" style={{ color: 'var(--color-text-dim)' }}>Learned physical mappings from user queries</p>
              </div>
            </div>
            <div className="badge badge-online">
              <Layers size={10} /> {mappings.length} Mappings
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded border flex items-start justify-between gap-4" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
              <div>
                <div className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>
                  Continuous Query Learning
                </div>
                <p className="text-[11px] mt-1" style={{ color: 'var(--color-text-muted)' }}>
                  Automatically prompt for unknown physical landmarks ("loading dock", "east perimeter") and store selections in persistent knowledge graph.
                </p>
              </div>
              <input
                type="checkbox"
                checked={autoLearn}
                onChange={(e) => setAutoLearn(e.target.checked)}
                className="accent-[var(--color-primary)] w-5 h-5 cursor-pointer mt-0.5"
              />
            </div>

            <div className="p-4 rounded border space-y-2" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
              <div className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>
                Clarification Sensitivity
              </div>
              <div className="flex items-center gap-2">
                {(['conservative', 'balanced', 'aggressive'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setStrictness(lvl)}
                    className="flex-1 py-1.5 px-2 rounded text-[11px] font-mono capitalize transition-all border"
                    style={{
                      background: strictness === lvl ? 'rgba(0,242,152,0.12)' : 'transparent',
                      borderColor: strictness === lvl ? 'var(--color-primary)' : 'var(--color-border)',
                      color: strictness === lvl ? 'var(--color-primary)' : 'var(--color-text-dim)',
                    }}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
              <p className="font-mono text-[10px]" style={{ color: 'var(--color-text-dim)' }}>
                {strictness === 'balanced' && 'Prompts when ambiguous keywords have no known mapping.'}
                {strictness === 'aggressive' && 'Prompts anytime a camera is not explicitly named.'}
                {strictness === 'conservative' && 'Only prompts if similarity score is under 40%.'}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <div>
              <div className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>Reset Spatial Knowledge Base</div>
              <p className="font-mono text-[10px]" style={{ color: 'var(--color-text-dim)' }}>
                Restores the factory seed mappings and clears user-created spatial associations.
              </p>
            </div>
            <button
              onClick={() => setResetModalOpen(true)}
              className="btn-ghost text-xs text-red-400 hover:text-red-300"
              style={{ borderColor: 'rgba(255,59,48,0.3)' }}
            >
              <RotateCcw size={12} />
              Reset Memory Graph
            </button>
          </div>
        </motion.div>

        {/* Section 3: Evidence Vault & Storage Retention */}
        <motion.div variants={staggerItem} className="card p-5 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded flex items-center justify-center" style={{ background: 'rgba(255,176,32,0.1)', color: 'var(--color-tertiary)' }}>
                <Shield size={16} />
              </div>
              <div>
                <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Evidence Vault & Retention</h2>
                <p className="font-mono text-[10px]" style={{ color: 'var(--color-text-dim)' }}>Forensic chain of custody and video storage</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <HardDrive size={13} style={{ color: 'var(--color-tertiary)' }} />
              <span className="font-mono text-xs" style={{ color: 'var(--color-text-muted)' }}>74.2 GB / 250 GB</span>
            </div>
          </div>

          {/* Storage bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] font-mono" style={{ color: 'var(--color-text-dim)' }}>
              <span>SSD Storage Utilization (29.7%)</span>
              <span>175.8 GB Available</span>
            </div>
            <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-layer2)' }}>
              <div className="h-full rounded-full transition-all" style={{ width: '29.7%', background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))' }} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--color-text)' }}>
                Footage Retention Horizon
              </label>
              <select
                value={retentionDays}
                onChange={(e) => setRetentionDays(Number(e.target.value))}
                className="input-base text-xs font-mono"
              >
                <option value={30}>30 Days (Rolling Buffer)</option>
                <option value={90}>90 Days (Enterprise Standard)</option>
                <option value={180}>180 Days (Compliance Compliant)</option>
                <option value={365}>365 Days (Full Year Audit)</option>
              </select>
            </div>

            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded border" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
                <input
                  type="checkbox"
                  checked={forensicChecksum}
                  onChange={(e) => setForensicChecksum(e.target.checked)}
                  className="accent-[var(--color-tertiary)] w-4 h-4 cursor-pointer"
                />
                <span className="text-xs" style={{ color: 'var(--color-text)' }}>
                  SHA-256 Chain of Custody Watermark
                </span>
              </label>
            </div>

            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded border" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
                <input
                  type="checkbox"
                  checked={autoExportVault}
                  onChange={(e) => setAutoExportVault(e.target.checked)}
                  className="accent-[var(--color-tertiary)] w-4 h-4 cursor-pointer"
                />
                <span className="text-xs" style={{ color: 'var(--color-text)' }}>
                  Auto-Vault High Severity Breaches
                </span>
              </label>
            </div>
          </div>
        </motion.div>

        {/* Section 4: Alerts & SOC Webhooks */}
        <motion.div variants={staggerItem} className="card p-5 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded flex items-center justify-center" style={{ background: 'rgba(255,59,48,0.1)', color: 'var(--color-danger)' }}>
                <Bell size={16} />
              </div>
              <div>
                <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>SOC Alerts & Dispatch Webhook</h2>
                <p className="font-mono text-[10px]" style={{ color: 'var(--color-text-dim)' }}>Real-time relay to security operations desks</p>
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={audioAlarm}
                onChange={(e) => setAudioAlarm(e.target.checked)}
                className="accent-[var(--color-danger)] w-4 h-4 cursor-pointer"
              />
              <span className="text-xs font-mono" style={{ color: 'var(--color-text-muted)' }}>Audio Alarm on Breach</span>
            </label>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium block" style={{ color: 'var(--color-text)' }}>
              Incident Relay Webhook Endpoint
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://your-soc-api.domain/webhook"
                className="input-base font-mono text-xs flex-1 min-w-0"
              />
              <button
                onClick={handleTestWebhook}
                disabled={webhookTesting}
                className="btn-secondary justify-center sm:justify-start"
              >
                {webhookTesting ? (
                  <>
                    <span className="pulse-dot w-2 h-2 rounded-full bg-cyan-400" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Wifi size={13} />
                    Test Ping
                  </>
                )}
              </button>
            </div>
            {webhookStatus && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-[11px] font-mono flex items-center gap-1.5" style={{ color: 'var(--color-primary)' }}>
                <Check size={12} /> {webhookStatus}
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Section 5: System Telemetry & Metadata */}
        <motion.div variants={staggerItem} className="p-4 rounded border flex flex-col sm:flex-row items-center justify-between gap-3" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <div>
              <span className="font-mono text-xs font-bold" style={{ color: 'var(--color-text)' }}>VISIONIQ ENTERPRISE EDITION</span>
              <span className="font-mono text-[10px] ml-2" style={{ color: 'var(--color-text-dim)' }}>BUILD 2026.10-STITCH-RELEASE</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-mono" style={{ color: 'var(--color-text-dim)' }}>
            <span>STITCH ID: 7999472212453782084</span>
            <span>NODE: SOC-EDGE-01</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {resetModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="card p-6 max-w-md w-full space-y-4"
              style={{ borderColor: 'var(--color-danger)' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded flex items-center justify-center" style={{ background: 'rgba(255,59,48,0.15)', color: 'var(--color-danger)' }}>
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>Reset Spatial Memory?</h3>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>This cannot be undone.</p>
                </div>
              </div>

              <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                This will wipe all custom learned camera locations from local storage and restore default knowledge graph mappings.
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  className="btn-ghost"
                  onClick={() => setResetModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn-primary"
                  style={{ background: 'var(--color-danger)', color: '#fff' }}
                  onClick={handleResetMemory}
                >
                  Yes, Reset Memory
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
