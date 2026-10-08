// src/pages/Evaluation.tsx

import { useRef } from 'react';
import { useInView } from 'framer-motion';
import { motion } from 'framer-motion';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts';
import MetricCard from '../components/ui/MetricCard';
import { evaluationMetrics, benchmarkRows, latencyChartData, accuracyChartData } from '../data';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="card px-3 py-2"
      style={{ background: 'var(--color-layer2)', border: '1px solid var(--color-border-hi)' }}
    >
      <p className="font-mono text-[9px]" style={{ color: 'var(--color-text-dim)' }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="font-mono text-xs font-bold" style={{ color: p.color }}>
          {p.value}{p.name === 'latency' ? 's' : '%'}
        </p>
      ))}
    </div>
  );
};

export default function Evaluation() {
  const tableRef = useRef<HTMLDivElement>(null);
  const tableInView = useInView(tableRef, { once: true });

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <div className="font-mono text-[10px] sm:text-xs tracking-widest uppercase mb-1" style={{ color: 'var(--color-text-dim)' }}>
          SYSTEM EVALUATION
        </div>
        <h1 className="text-lg sm:text-xl font-bold" style={{ color: 'var(--color-text)' }}>AI Benchmarks</h1>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {evaluationMetrics.map((m, i) => (
          <MetricCard
            key={m.label}
            label={m.label}
            value={m.value}
            unit={m.unit}
            decimals={m.unit === 's' ? 1 : 1}
            trend={m.trend}
            delta={m.delta}
            accent={i === 3 ? 'secondary' : 'primary'}
          />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Latency over time */}
        <div className="card p-4">
          <div className="font-mono text-[9px] tracking-widest uppercase mb-4" style={{ color: 'var(--color-text-dim)' }}>
            Query Latency — Today (s)
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={latencyChartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid stroke="rgba(31,42,61,0.6)" strokeDasharray="3 3" />
              <XAxis dataKey="time" tick={{ fill: 'var(--color-text-dim)', fontSize: 9, fontFamily: 'JetBrains Mono' }} />
              <YAxis tick={{ fill: 'var(--color-text-dim)', fontSize: 9, fontFamily: 'JetBrains Mono' }} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="latency"
                name="latency"
                stroke="var(--color-secondary)"
                strokeWidth={2}
                dot={false}
                animationBegin={300}
                animationDuration={1200}
                animationEasing="ease-out"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Accuracy by category */}
        <div className="card p-4">
          <div className="font-mono text-[9px] tracking-widest uppercase mb-4" style={{ color: 'var(--color-text-dim)' }}>
            F1 Score by Detection Category (%)
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={accuracyChartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid stroke="rgba(31,42,61,0.6)" strokeDasharray="3 3" />
              <XAxis dataKey="category" tick={{ fill: 'var(--color-text-dim)', fontSize: 9, fontFamily: 'JetBrains Mono' }} />
              <YAxis domain={[80, 100]} tick={{ fill: 'var(--color-text-dim)', fontSize: 9, fontFamily: 'JetBrains Mono' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="value"
                name="f1"
                fill="var(--color-primary)"
                radius={[2, 2, 0, 0]}
                animationBegin={300}
                animationDuration={1200}
                animationEasing="ease-out"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Benchmark table */}
      <div ref={tableRef} className="card overflow-hidden">
        <div
          className="px-4 py-3 border-b font-mono text-[9px] tracking-widest uppercase"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-dim)' }}
        >
          Full Benchmark Suite
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px]" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-layer1)' }}>
                {['Task', 'Precision', 'Recall', 'F1', 'Latency (s)'].map((h) => (
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
            <tbody>
              {benchmarkRows.map((row, i) => (
                <motion.tr
                  key={row.task}
                  initial={{ opacity: 0, x: -12 }}
                  animate={tableInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: i * 0.08, duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                  style={{ borderBottom: '1px solid var(--color-border)' }}
                >
                  <td className="py-3 px-4 text-xs font-semibold" style={{ color: 'var(--color-text)' }}>
                    {row.task}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs" style={{ color: 'var(--color-primary)' }}>
                    {row.precision}%
                  </td>
                  <td className="py-3 px-4 font-mono text-xs" style={{ color: 'var(--color-primary)' }}>
                    {row.recall}%
                  </td>
                  <td className="py-3 px-4 font-mono text-xs font-bold" style={{ color: 'var(--color-secondary)' }}>
                    {row.f1}%
                  </td>
                  <td className="py-3 px-4 font-mono text-xs" style={{ color: 'var(--color-tertiary)' }}>
                    {row.latency}s
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
