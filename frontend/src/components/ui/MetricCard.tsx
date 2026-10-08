// src/components/ui/MetricCard.tsx

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

interface Props {
  label: string;
  value: number;
  unit?: string;
  decimals?: number;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'stable';
  delta?: number;
  accent?: 'primary' | 'secondary' | 'tertiary' | 'danger';
}

const accentColors = {
  primary:   'var(--color-primary)',
  secondary: 'var(--color-secondary)',
  tertiary:  'var(--color-tertiary)',
  danger:    'var(--color-danger)',
};

function useCountUp(target: number, decimals: number, active: boolean) {
  const [display, setDisplay] = useState(0);
  const raf = useRef<number>(0);

  useEffect(() => {
    if (!active) return;
    const start = performance.now();
    const duration = 1200;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // cubic ease out
      setDisplay(parseFloat((eased * target).toFixed(decimals)));
      if (progress < 1) raf.current = requestAnimationFrame(tick);
    };

    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, decimals, active]);

  return display;
}

export default function MetricCard({ label, value, unit = '', decimals = 0, icon, trend, delta, accent = 'primary' }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const displayValue = useCountUp(value, decimals, inView);

  const trendColor =
    trend === 'up' ? 'var(--color-primary)' :
    trend === 'down' ? 'var(--color-tertiary)' :
    'var(--color-text-muted)';

  const trendSymbol = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';

  return (
    <motion.div
      ref={ref}
      className="card p-3 sm:p-4 flex flex-col gap-1.5 sm:gap-2 min-w-0"
      initial={{ opacity: 0, y: 12 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="flex items-center justify-between gap-1">
        <span className="text-[10px] sm:text-xs font-mono tracking-widest uppercase truncate" style={{ color: 'var(--color-text-dim)' }}>
          {label}
        </span>
        {icon && (
          <span className="flex-shrink-0" style={{ color: accentColors[accent] }}>{icon}</span>
        )}
      </div>

      <div className="flex items-baseline gap-1">
        <span
          className="font-mono font-bold text-2xl sm:text-3xl"
          style={{ color: accentColors[accent] }}
        >
          {displayValue.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
        </span>
        {unit && (
          <span className="font-mono text-xs sm:text-sm" style={{ color: 'var(--color-text-muted)' }}>
            {unit}
          </span>
        )}
      </div>

      {trend && delta !== undefined && (
        <div className="flex items-center gap-1">
          <span className="font-mono text-[10px] sm:text-xs font-bold" style={{ color: trendColor }}>
            {trendSymbol} {delta}
          </span>
          <span className="text-[10px] sm:text-xs" style={{ color: 'var(--color-text-dim)' }}>vs last 24h</span>
        </div>
      )}
    </motion.div>
  );
}
