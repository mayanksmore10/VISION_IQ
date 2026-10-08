// src/pages/Landing.tsx

import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { Camera, Search, Brain, Shield, ArrowRight, ChevronRight, Activity, Zap } from 'lucide-react';
import { fadeUp, stagger, staggerItem } from '../lib/motion';

function SectionReveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={fadeUp}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}

const steps = [
  { icon: <Search size={20} />, label: 'Ask',       desc: 'Type any natural language query about your footage' },
  { icon: <Brain size={20} />,  label: 'Understand', desc: 'AI resolves locations, cameras, and timeframes' },
  { icon: <Activity size={20} />, label: 'Search',   desc: 'Semantic retrieval across indexed frames' },
  { icon: <Shield size={20} />, label: 'Verify',    desc: 'Review evidence with full forensic metadata' },
];

const features = [
  {
    icon: <Search size={18} />,
    title: 'Conversational Search',
    desc: 'Query your entire camera network in plain English. VisionIQ resolves locations, times, and subjects automatically.',
    color: 'var(--color-secondary)',
  },
  {
    icon: <Brain size={18} />,
    title: 'Spatial Memory',
    desc: 'The system learns your facility. Once it knows "Main Gate" is CAM03, every future query is instant.',
    color: 'var(--color-primary)',
  },
  {
    icon: <Shield size={18} />,
    title: 'Evidence Vault',
    desc: 'Every detected event is stored with full chain-of-custody metadata for forensic review and export.',
    color: 'var(--color-tertiary)',
  },
  {
    icon: <Activity size={18} />,
    title: 'SOC Command Center',
    desc: 'Live dashboards, real-time anomaly feeds, and multi-camera monitoring — built for security operations teams.',
    color: 'var(--color-danger)',
  },
];

export default function Landing() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--color-base)', overflowX: 'hidden' }}
    >
      {/* Nav */}
      <nav
        className="flex items-center justify-between px-4 sm:px-8 py-3.5 sm:py-4 border-b"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-layer1)' }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--color-primary)', color: '#0a0d14' }}
          >
            <Camera size={14} />
          </div>
          <span className="font-mono font-bold text-xs sm:text-sm tracking-widest" style={{ color: 'var(--color-primary)' }}>
            VISIONIQ
          </span>
        </div>
        <div className="flex items-center gap-2.5 sm:gap-4">
          <Link to="/app/search" className="text-xs font-mono" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>
            Search
          </Link>
          <Link to="/app" className="btn-primary text-xs py-1.5 sm:py-2 px-3 sm:px-4" style={{ textDecoration: 'none' }}>
            Launch App <ArrowRight size={12} />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-16 sm:py-24 text-center scanline-bg overflow-hidden">
        {/* Animated grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0,242,152,0.06) 0%, transparent 70%)',
          }}
        />

        {/* Pulsing rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="absolute rounded-full border"
              style={{
                width: i * 220,
                height: i * 220,
                top: -(i * 110),
                left: -(i * 110),
                borderColor: 'rgba(0,242,152,0.06)',
              }}
              animate={{ scale: [1, 1.04, 1], opacity: [0.4, 0.15, 0.4] }}
              transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.8, ease: 'easeInOut' }}
            />
          ))}
        </div>

        <motion.div
          variants={stagger(0.12)}
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-3xl"
        >
          {/* Badge */}
          <motion.div variants={staggerItem} className="flex justify-center mb-6">
            <span className="badge badge-online px-3 py-1">
              <span className="pulse-dot w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-primary)' }} />
              AI-Powered CCTV Intelligence Platform
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={staggerItem}
            className="font-bold mb-4 leading-tight"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: 'var(--color-text)' }}
          >
            Ask Your{' '}
            <span style={{ color: 'var(--color-primary)' }}>Cameras</span>
            {' '}Anything
          </motion.h1>

          <motion.p
            variants={staggerItem}
            className="text-base mb-8 max-w-xl mx-auto"
            style={{ color: 'var(--color-text-muted)', lineHeight: 1.7 }}
          >
            VisionIQ turns your CCTV network into a searchable intelligence layer. Ask{' '}
            <em style={{ color: 'var(--color-secondary)' }}>"Find a red car entering the main gate"</em>{' '}
            and get evidence in under 2 seconds.
          </motion.p>

          <motion.div variants={staggerItem} className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/app/search" className="btn-primary" style={{ textDecoration: 'none', justifyContent: 'center' }}>
              <Search size={14} />
              Try Conversational Search
            </Link>
            <Link to="/app" className="btn-secondary" style={{ textDecoration: 'none', justifyContent: 'center' }}>
              View SOC Dashboard
              <ChevronRight size={14} />
            </Link>
          </motion.div>
        </motion.div>

        {/* Hero CCTV card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          className="relative mt-16 w-full max-w-lg mx-auto card viewfinder overflow-hidden"
          style={{ border: '1px solid var(--color-border-hi)' }}
        >
          <div
            style={{
              aspectRatio: '16/9',
              background: 'linear-gradient(135deg, #0d1117 0%, #0f1a2e 50%, #091217 100%)',
            }}
          >
            {/* Scanlines */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,242,152,0.012) 3px, rgba(0,242,152,0.012) 4px)',
              }}
            />

            {/* Animated scan line */}
            <div className="scan-line" style={{ zIndex: 10 }} />

            {/* Bounding box */}
            <motion.div
              className="absolute"
              style={{
                top: '25%', left: '35%', width: '30%', height: '45%',
                border: '1px solid var(--color-primary)',
              }}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            >
              <div
                className="absolute -top-4 left-0 font-mono text-[8px] font-bold px-1 py-0.5"
                style={{ background: 'var(--color-primary)', color: '#0a0d14' }}
              >
                VEHICLE · 94%
              </div>
              {/* Motion vector */}
              <motion.div
                className="absolute -right-6 top-1/2 h-px w-6"
                style={{ background: 'var(--color-primary)' }}
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </motion.div>

            {/* Status badges */}
            <div className="absolute top-2 left-2 badge badge-online">
              <span className="pulse-dot w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-primary)' }} />
              LIVE 4K
            </div>
            <div className="absolute top-2 right-2 badge badge-info">CAM03 · MAIN GATE</div>
            <div className="absolute bottom-2 left-2 font-mono text-[9px]" style={{ color: 'rgba(240,244,250,0.5)' }}>
              09:14:23
            </div>
            <div className="absolute bottom-2 right-2 font-mono text-[9px]" style={{ color: 'rgba(240,244,250,0.4)' }}>
              REC ●
            </div>
          </div>
        </motion.div>
      </section>

      {/* How it works */}
      <section className="px-4 sm:px-8 py-14 sm:py-20" style={{ background: 'var(--color-layer1)', borderTop: '1px solid var(--color-border)' }}>
        <SectionReveal>
          <div className="text-center mb-10 sm:mb-12">
            <div className="font-mono text-xs tracking-widest uppercase mb-3" style={{ color: 'var(--color-text-dim)' }}>
              How It Works
            </div>
            <h2 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
              From query to evidence in seconds
            </h2>
          </div>
        </SectionReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {steps.map((step, i) => (
            <SectionReveal key={step.label} delay={i * 0.1}>
              <div className="flex flex-col items-center text-center gap-3">
                <div
                  className="w-12 h-12 rounded flex items-center justify-center"
                  style={{
                    background: 'rgba(0,242,152,0.08)',
                    border: '1px solid rgba(0,242,152,0.25)',
                    color: 'var(--color-primary)',
                  }}
                >
                  {step.icon}
                </div>
                <div className="font-mono font-bold text-xs tracking-widest uppercase" style={{ color: 'var(--color-primary)' }}>
                  {String(i + 1).padStart(2, '0')} · {step.label}
                </div>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                  {step.desc}
                </p>
              </div>
            </SectionReveal>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-4 sm:px-8 py-14 sm:py-20" style={{ background: 'var(--color-base)', borderTop: '1px solid var(--color-border)' }}>
        <SectionReveal>
          <div className="text-center mb-10 sm:mb-12">
            <div className="font-mono text-xs tracking-widest uppercase mb-3" style={{ color: 'var(--color-text-dim)' }}>
              Platform
            </div>
            <h2 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
              Purpose-built for security operations
            </h2>
          </div>
        </SectionReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
          {features.map((f, i) => (
            <SectionReveal key={f.title} delay={i * 0.1}>
              <div
                className="card p-5 h-full"
                style={{ borderColor: `${f.color}20` }}
              >
                <div
                  className="w-9 h-9 rounded flex items-center justify-center mb-3"
                  style={{ background: `${f.color}10`, border: `1px solid ${f.color}30`, color: f.color }}
                >
                  {f.icon}
                </div>
                <h3 className="font-semibold text-sm mb-1.5" style={{ color: 'var(--color-text)' }}>{f.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{f.desc}</p>
              </div>
            </SectionReveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section
        className="px-4 sm:px-8 py-14 sm:py-20 text-center"
        style={{ background: 'var(--color-layer1)', borderTop: '1px solid var(--color-border)' }}
      >
        <SectionReveal>
          <div className="font-mono text-xs tracking-widest uppercase mb-3" style={{ color: 'var(--color-text-dim)' }}>
            Ready to Deploy
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>
            Start your intelligence session
          </h2>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
            <Link to="/app" className="btn-primary" style={{ textDecoration: 'none', justifyContent: 'center' }}>
              <Zap size={14} />
              Open SOC Dashboard
            </Link>
          </div>
        </SectionReveal>
      </section>

      {/* Footer */}
      <footer
        className="px-4 sm:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left"
        style={{ borderTop: '1px solid var(--color-border)', background: 'var(--color-layer1)' }}
      >
        <span className="font-mono text-[10px] tracking-widest" style={{ color: 'var(--color-text-dim)' }}>
          VISIONIQ · CCTV INTELLIGENCE PLATFORM
        </span>
        <span className="font-mono text-[10px]" style={{ color: 'var(--color-text-dim)' }}>
          DEMO · FRONTEND ONLY
        </span>
      </footer>
    </div>
  );
}
