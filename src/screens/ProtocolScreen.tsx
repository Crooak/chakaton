import { useState } from 'react';
import { ChevronRight, Download, ChevronDown, ArrowUpDown } from 'lucide-react';
import type { FindingStatus, ReviewPriority } from '../types';
import { MOCK_OBJECTS, MOCK_PROTOCOL } from '../mocks/data';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import StageBadge from '../components/StageBadge';
import Button from '../components/Button';
import type { NavState } from '../App';
import type { Finding } from '../types';

interface Props {
  protocolId: string;
  onNavigate: (screen: NavState['screen'], objectId?: string, protocolId?: string) => void;
}

type TabKey = 'completeness' | 'candidates' | 'confirmed' | 'verified' | 'suspicions';

const TAB_STATUSES: Record<TabKey, FindingStatus[]> = {
  completeness: ['MISSING_EVIDENCE', 'NOT_APPLICABLE', 'NOT_COMPARABLE', 'CLARIFICATION_REQUIRED'],
  candidates: ['CANDIDATE'],
  confirmed: ['CONFIRMED_VIOLATION'],
  verified: ['NEGATIVE_VERIFIED'],
  suspicions: ['SUSPICION'],
};

export default function ProtocolScreen({ protocolId, onNavigate }: Props) {
  const protocol = MOCK_PROTOCOL;
  const obj = MOCK_OBJECTS.find(o => o.id === protocol.objectId) ?? MOCK_OBJECTS[0];
  const [activeTab, setActiveTab] = useState<TabKey>('candidates');
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const tabFindings = (tab: TabKey) =>
    protocol.findings.filter(f => TAB_STATUSES[tab].includes(f.status));

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'completeness', label: `Комплектность и сопоставимость (${tabFindings('completeness').length})` },
    { key: 'candidates', label: `Кандидаты (${tabFindings('candidates').length})` },
    { key: 'confirmed', label: `Подтверждённые нарушения (${tabFindings('confirmed').length})` },
    { key: 'verified', label: `Проверено, расхождений нет (${tabFindings('verified').length})` },
    { key: 'suspicions', label: `Гипотезы свободного поиска (${tabFindings('suspicions').length})` },
  ];

  const visibleFindings = tabFindings(activeTab);
  const candidateCount = tabFindings('candidates').length;
  const canFinalize = candidateCount === 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Topbar */}
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '0 24px', height: 48,
          backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0', flexShrink: 0,
        }}
      >
        <button
          onClick={() => onNavigate('dashboard')}
          style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#1B4E9B', fontSize: 13, fontFamily: 'inherit', padding: 0 }}
        >Объекты</button>
        <ChevronRight size={14} color="#94A3B8" />
        <button
          onClick={() => onNavigate('object', obj.id)}
          style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#1B4E9B', fontSize: 13, fontFamily: 'inherit', padding: 0 }}
        >{obj.name}</button>
        <ChevronRight size={14} color="#94A3B8" />
        <span style={{ fontSize: 13, color: '#0F172A', fontWeight: 500 }}>
          Протокол № {protocol.number}
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button
            style={{
              display: 'flex', alignItems: 'center', gap: 6, border: '1px solid #E2E8F0',
              backgroundColor: '#FFFFFF', color: '#475569', borderRadius: 8, padding: '0 12px',
              height: 36, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            <Download size={14} />
            Экспорт
            <ChevronDown size={12} />
          </button>
          <Button
            variant="primary"
            size="md"
            disabled={!canFinalize}
            title={!canFinalize ? `Остались необработанные кандидаты (${candidateCount})` : ''}
            onClick={() => onNavigate('finalization', obj.id, protocolId)}
          >
            Завершить верификацию
          </Button>
        </div>
      </div>

      {/* Protocol header */}
      <div style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '12px 24px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <h1 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#0F172A' }}>
                Протокол проверки № {protocol.number}
              </h1>
              <span
                style={{
                  backgroundColor: '#FFFAEB', color: '#B54708',
                  padding: '1px 8px', borderRadius: 4, fontSize: 12, fontWeight: 500,
                }}
              >
                Готов к верификации
              </span>
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              <span style={{ fontSize: 12, color: '#94A3B8' }}>
                {obj.name} · {obj.address}
              </span>
              <span style={{ fontSize: 12, color: '#94A3B8' }}>
                Сформирован: {protocol.createdAt}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#94A3B8', display: 'flex', flexDirection: 'column', gap: 1, textAlign: 'right' }}>
              <span>matrix_version {protocol.matrixVersion}</span>
              <span>model_version {protocol.modelVersion}</span>
              <span>hash {protocol.inputHash}</span>
            </span>
          </div>
        </div>

        {/* Summary bar */}
        <div
          style={{
            display: 'flex', gap: 6, marginTop: 10, padding: '7px 12px',
            backgroundColor: '#EDF1F7', borderRadius: 6, fontSize: 12, color: '#475569',
            flexWrap: 'wrap',
          }}
        >
          <span><strong style={{ color: '#0F172A' }}>{protocol.totalParameters}</strong> параметров проверено</span>
          <Dot />
          <span><strong style={{ color: '#B54708' }}>{protocol.candidatesCount}</strong> кандидатов</span>
          <Dot />
          <span><strong style={{ color: '#B42318' }}>{protocol.confirmedCount}</strong> подтверждено</span>
          <Dot />
          <span><strong style={{ color: '#027A48' }}>{protocol.negativeVerifiedCount}</strong> расхождений не выявлено</span>
          <Dot />
          <span><strong style={{ color: '#475569' }}>{protocol.missingEvidenceCount}</strong> без доказательств</span>
          <Dot />
          <span><strong style={{ color: '#475569' }}>{protocol.notApplicableCount}</strong> неприменимо</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '0 24px', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 0, overflowX: 'auto' }}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '8px 14px', border: 'none', background: 'none', cursor: 'pointer',
                fontSize: 12, fontWeight: 500, fontFamily: 'inherit',
                color: activeTab === tab.key ? '#1B4E9B' : '#475569',
                borderBottom: `2px solid ${activeTab === tab.key ? '#1B4E9B' : 'transparent'}`,
                whiteSpace: 'nowrap',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 8, overflow: 'hidden' }}>
          {/* Table header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '90px 60px 180px 140px 140px 80px 90px 70px 130px 110px',
              backgroundColor: '#EDF1F7', borderBottom: '1px solid #E2E8F0',
            }}
          >
            {['Код', 'Раздел', 'Наименование параметра', 'Ожидается', 'Фактически', 'Δ', 'Источники', 'Приоритет', 'Статус', ''].map((h, i) => (
              <div
                key={i}
                style={{
                  padding: '7px 10px', fontSize: 11, fontWeight: 600, color: '#475569',
                  textTransform: 'uppercase', letterSpacing: 0.4,
                  display: 'flex', alignItems: 'center', gap: 3,
                }}
              >
                {h}
                {['Ожидается', 'Фактически', 'Δ'].includes(h) && <ArrowUpDown size={10} />}
              </div>
            ))}
          </div>

          {visibleFindings.length === 0 && (
            <div style={{ padding: 32, textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>
              Записей нет
            </div>
          )}

          {visibleFindings.map(finding => (
            <FindingRow
              key={finding.id}
              finding={finding}
              hovered={hoveredRow === finding.id}
              onHover={() => setHoveredRow(finding.id)}
              onLeave={() => setHoveredRow(null)}
              onVerify={() => onNavigate('verification', obj.id, protocolId)}
              showVerifyButton={activeTab === 'candidates'}
              showAttachButton={activeTab === 'suspicions'}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function FindingRow({
  finding, hovered, onHover, onLeave, onVerify, showVerifyButton, showAttachButton,
}: {
  finding: Finding;
  hovered: boolean;
  onHover: () => void;
  onLeave: () => void;
  onVerify: () => void;
  showVerifyButton: boolean;
  showAttachButton: boolean;
}) {
  return (
    <div
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      style={{
        display: 'grid',
        gridTemplateColumns: '90px 60px 180px 140px 140px 80px 90px 70px 130px 110px',
        borderBottom: '1px solid #E2E8F0',
        backgroundColor: hovered ? '#F8FAFC' : '#FFFFFF',
        transition: 'background-color 80ms ease',
        height: 40,
        alignItems: 'center',
      }}
    >
      <div style={{ padding: '0 10px' }}>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#0F172A', fontWeight: 500 }}>
          {finding.code}
        </span>
      </div>
      <div style={{ padding: '0 10px', fontSize: 12, color: '#475569' }}>{finding.section}</div>
      <div style={{ padding: '0 10px', fontSize: 12, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {finding.parameterName}
      </div>
      <div style={{ padding: '0 10px', fontSize: 12, color: '#0F172A', fontVariantNumeric: 'tabular-nums', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {finding.expected}
      </div>
      <div style={{ padding: '0 10px', fontSize: 12, color: '#0F172A', fontVariantNumeric: 'tabular-nums', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {finding.actual}
      </div>
      <div
        style={{
          padding: '0 10px', fontSize: 12, fontVariantNumeric: 'tabular-nums', fontWeight: 500,
          color: finding.delta.startsWith('+') ? '#B42318' : finding.delta.startsWith('−') ? '#B42318' : '#475569',
        }}
      >
        {finding.delta}
      </div>
      <div style={{ padding: '0 10px', display: 'flex', gap: 2 }}>
        {finding.sources.map(s => <StageBadge key={s} stage={s} />)}
      </div>
      <div style={{ padding: '0 10px' }}>
        <PriorityBadge priority={finding.priority} showLabel={false} />
      </div>
      <div style={{ padding: '0 10px' }}>
        <StatusBadge status={finding.status} compact />
      </div>
      <div style={{ padding: '0 8px', display: 'flex', justifyContent: 'flex-end' }}>
        {showVerifyButton && (
          <button
            onClick={onVerify}
            style={{
              height: 28, padding: '0 10px', fontSize: 12, fontWeight: 500,
              backgroundColor: '#E8F0FB', color: '#1B4E9B',
              border: '1px solid #C7D7F4', borderRadius: 6,
              cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
            }}
          >
            Проверить
          </button>
        )}
        {showAttachButton && (
          <button
            style={{
              height: 28, padding: '0 10px', fontSize: 12, fontWeight: 500,
              backgroundColor: '#F0F9FF', color: '#026AA2',
              border: '1px solid #BAE6FD', borderRadius: 6,
              cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
            }}
          >
            Привязать
          </button>
        )}
      </div>
    </div>
  );
}

function Dot() {
  return <span style={{ color: '#CBD5E1' }}>·</span>;
}
