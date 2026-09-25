import type { ReviewPriority } from '../types';

const PRIORITY_CONFIG: Record<ReviewPriority, { label: string; marks: string }> = {
  HIGH: { label: 'HIGH', marks: '▮▮▮' },
  MEDIUM: { label: 'MED', marks: '▮▮▯' },
  LOW: { label: 'LOW', marks: '▮▯▯' },
};

interface Props {
  priority: ReviewPriority;
  showLabel?: boolean;
}

export default function PriorityBadge({ priority, showLabel = true }: Props) {
  const cfg = PRIORITY_CONFIG[priority];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        color: '#475569',
        fontSize: 12,
        fontWeight: 500,
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ letterSpacing: 1, fontSize: 10 }}>{cfg.marks}</span>
      {showLabel && <span>{cfg.label}</span>}
    </span>
  );
}
