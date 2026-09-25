import type { DocStage, CompletenessStatus } from '../types';

const STAGE_COLORS: Record<DocStage, { text: string; bg: string; border: string }> = {
  PD: { text: '#1E40AF', bg: '#EFF6FF', border: '#BFDBFE' },
  RD: { text: '#166534', bg: '#F0FDF4', border: '#BBF7D0' },
  ID: { text: '#6B21A8', bg: '#FAF5FF', border: '#E9D5FF' },
};

const COMPLETENESS_OPACITY: Record<CompletenessStatus, number> = {
  full: 1,
  partial: 0.6,
  missing: 0.3,
};

interface Props {
  stage: DocStage;
  completeness?: CompletenessStatus;
  size?: 'sm' | 'md';
}

export default function StageBadge({ stage, completeness = 'full', size = 'sm' }: Props) {
  const cfg = STAGE_COLORS[stage];
  const opacity = COMPLETENESS_OPACITY[completeness];
  const labels: Record<DocStage, string> = { PD: 'ПД', RD: 'РД', ID: 'ИД' };
  const pad = size === 'md' ? '2px 8px' : '1px 6px';
  const fs = size === 'md' ? 13 : 11;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        color: cfg.text,
        backgroundColor: cfg.bg,
        border: `1px solid ${cfg.border}`,
        padding: pad,
        borderRadius: 4,
        fontSize: fs,
        fontWeight: 600,
        lineHeight: '16px',
        opacity,
        whiteSpace: 'nowrap',
      }}
    >
      {labels[stage]}
    </span>
  );
}
