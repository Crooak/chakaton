import type { FindingStatus } from '../types';

interface StatusConfig {
  text: string;
  color: string;
  bg: string;
}

const STATUS_CONFIG: Record<FindingStatus, StatusConfig> = {
  CANDIDATE: { text: 'Кандидат', color: '#B54708', bg: '#FFFAEB' },
  CONFIRMED_VIOLATION: { text: 'Нарушение подтверждено', color: '#B42318', bg: '#FEF3F2' },
  NEGATIVE_VERIFIED: { text: 'Расхождений нет', color: '#027A48', bg: '#ECFDF3' },
  MISSING_EVIDENCE: { text: 'Нет доказательства', color: '#475569', bg: '#F1F5F9' },
  NOT_APPLICABLE: { text: 'Неприменимо', color: '#64748B', bg: '#F8FAFC' },
  NOT_COMPARABLE: { text: 'Нельзя сопоставить', color: '#475569', bg: '#F1F5F9' },
  CLARIFICATION_REQUIRED: { text: 'Требует уточнения', color: '#5925DC', bg: '#F4F3FF' },
  SUSPICION: { text: 'Гипотеза', color: '#026AA2', bg: '#F0F9FF' },
};

interface Props {
  status: FindingStatus;
  compact?: boolean;
}

export default function StatusBadge({ status, compact = false }: Props) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        backgroundColor: cfg.bg,
        color: cfg.color,
        padding: compact ? '0 6px' : '1px 8px',
        borderRadius: 4,
        fontSize: 12,
        fontWeight: 500,
        lineHeight: '16px',
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          display: 'inline-block',
          width: 6,
          height: 6,
          borderRadius: '50%',
          backgroundColor: cfg.color,
          flexShrink: 0,
        }}
      />
      {cfg.text}
    </span>
  );
}
