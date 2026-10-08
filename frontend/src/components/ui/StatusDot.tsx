// src/components/ui/StatusDot.tsx

interface Props {
  status: 'online' | 'offline' | 'warning';
  size?: number;
  pulse?: boolean;
}

const colors = {
  online:  'var(--color-primary)',
  offline: 'var(--color-text-dim)',
  warning: 'var(--color-tertiary)',
};

export default function StatusDot({ status, size = 8, pulse = true }: Props) {
  return (
    <span
      className={pulse && status === 'online' ? 'pulse-dot' : ''}
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        borderRadius: '50%',
        background: colors[status],
        flexShrink: 0,
      }}
      aria-label={status}
    />
  );
}
