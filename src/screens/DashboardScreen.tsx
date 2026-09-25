import { useState } from 'react';
import {
  Building2, FileText, BookOpen, Search, Plus,
  ChevronDown, AlertCircle, CheckCircle2, Clock, Cog,
} from 'lucide-react';
import type { InspectionObject, ProcessStatus } from '../types';
import { PROCESS_STATUS_LABELS } from '../types';
import { MOCK_OBJECTS, DASHBOARD_STATS } from '../mocks/data';
import StageBadge from '../components/StageBadge';
import Button from '../components/Button';
import type { NavState } from '../App';

interface Props {
  onNavigate: (screen: NavState['screen'], objectId?: string, protocolId?: string) => void;
}

const PROCESS_STATUS_COLORS: Record<ProcessStatus, { color: string; bg: string }> = {
  PENDING: { color: '#475569', bg: '#F1F5F9' },
  PARSING: { color: '#0369A1', bg: '#E0F2FE' },
  READY: { color: '#0369A1', bg: '#E0F2FE' },
  VERIFYING: { color: '#B54708', bg: '#FFFAEB' },
  COMPLETED: { color: '#027A48', bg: '#ECFDF3' },
  FINALIZED: { color: '#475569', bg: '#EDF1F7' },
};

const INDICATOR_COLORS = {
  green: '#16A34A',
  yellow: '#D97706',
  red: '#B42318',
};

function ProcessStatusBadge({ status }: { status: ProcessStatus }) {
  const cfg = PROCESS_STATUS_COLORS[status];
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        backgroundColor: cfg.bg, color: cfg.color,
        padding: '1px 8px', borderRadius: 4, fontSize: 12, fontWeight: 500,
        whiteSpace: 'nowrap',
      }}
    >
      {PROCESS_STATUS_LABELS[status]}
    </span>
  );
}

const STAT_ICONS = [Building2, FileText, AlertCircle, CheckCircle2];

export default function DashboardScreen({ onNavigate }: Props) {
  const [search, setSearch] = useState('');
  const [filterSection, setFilterSection] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const stats = [
    { label: 'Объектов в работе', value: DASHBOARD_STATS.objectsInWork },
    { label: 'Протоколов ждут верификации', value: DASHBOARD_STATS.protocolsAwaitingVerification },
    { label: 'Кандидатов к рассмотрению', value: DASHBOARD_STATS.candidatesForReview },
    { label: 'Финализировано за месяц', value: DASHBOARD_STATS.finalizedThisMonth },
  ];

  const filtered = MOCK_OBJECTS.filter(obj => {
    if (search) {
      const q = search.toLowerCase();
      if (!obj.name.toLowerCase().includes(q) && !obj.address.toLowerCase().includes(q) && !obj.developer.toLowerCase().includes(q)) return false;
    }
    if (filterStatus !== 'all' && obj.processStatus !== filterStatus) return false;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Topbar */}
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '0 24px', height: 48,
          backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0',
          flexShrink: 0,
        }}
      >
        <nav style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#94A3B8', flex: 1 }}>
          <span style={{ color: '#0F172A', fontWeight: 500 }}>Объекты</span>
        </nav>
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            backgroundColor: '#F5F7FA', border: '1px solid #E2E8F0',
            borderRadius: 8, padding: '0 10px', height: 36, width: 260,
          }}
        >
          <Search size={14} color="#94A3B8" />
          <input
            type="text"
            placeholder="Поиск по объектам..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              border: 'none', background: 'none', outline: 'none',
              fontSize: 13, color: '#0F172A', width: '100%',
              fontFamily: 'inherit',
            }}
          />
        </div>
        <Button variant="primary" size="md" onClick={() => {}}>
          <Plus size={14} />
          Новая проверка
        </Button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Stats tiles */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {stats.map((stat, i) => {
            const Icon = STAT_ICONS[i];
            return (
              <div
                key={i}
                style={{
                  backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0',
                  borderRadius: 8, padding: '14px 16px',
                  boxShadow: '0 1px 2px rgba(15,23,42,0.06)',
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                }}
              >
                <div
                  style={{
                    width: 36, height: 36, borderRadius: 8,
                    backgroundColor: '#E8F0FB', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}
                >
                  <Icon size={16} color="#1B4E9B" />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 24, fontWeight: 700, color: '#0F172A',
                      lineHeight: '28px', fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {stat.value}
                  </div>
                  <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>
                    {stat.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0',
            borderRadius: 8, padding: '8px 12px',
          }}
        >
          <span style={{ fontSize: 12, color: '#475569', fontWeight: 500, flexShrink: 0 }}>Фильтры:</span>
          <FilterSelect
            label="Раздел ПД"
            value={filterSection}
            onChange={setFilterSection}
            options={[
              { value: 'all', label: 'Все разделы' },
              { value: 'PZ', label: 'ПЗ' },
              { value: 'AR', label: 'АР' },
              { value: 'KR', label: 'КР' },
              { value: 'OV', label: 'ОВ' },
            ]}
          />
          <FilterSelect
            label="Статус"
            value={filterStatus}
            onChange={setFilterStatus}
            options={[
              { value: 'all', label: 'Все статусы' },
              { value: 'PENDING', label: 'Ожидает' },
              { value: 'PARSING', label: 'Обработка' },
              { value: 'READY', label: 'Готов' },
              { value: 'VERIFYING', label: 'На верификации' },
              { value: 'COMPLETED', label: 'Завершён' },
              { value: 'FINALIZED', label: 'Финализирован' },
            ]}
          />
          <FilterSelect
            label="Приоритет"
            value={filterPriority}
            onChange={setFilterPriority}
            options={[
              { value: 'all', label: 'Все' },
              { value: 'HIGH', label: 'HIGH' },
              { value: 'MEDIUM', label: 'MED' },
              { value: 'LOW', label: 'LOW' },
            ]}
          />
          {(filterSection !== 'all' || filterStatus !== 'all' || filterPriority !== 'all' || search) && (
            <button
              onClick={() => { setFilterSection('all'); setFilterStatus('all'); setFilterPriority('all'); setSearch(''); }}
              style={{
                border: 'none', background: 'none', cursor: 'pointer',
                fontSize: 12, color: '#B42318', fontFamily: 'inherit', padding: '0 4px',
              }}
            >
              Сбросить
            </button>
          )}
          <span style={{ marginLeft: 'auto', fontSize: 12, color: '#94A3B8' }}>
            {filtered.length} из {MOCK_OBJECTS.length} объектов
          </span>
        </div>

        {/* Table */}
        <div
          style={{
            backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0',
            borderRadius: 8, overflow: 'hidden',
            boxShadow: '0 1px 2px rgba(15,23,42,0.06)',
          }}
        >
          {/* Table header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '4px 2fr 1.2fr 120px 150px 80px 60px 90px',
              backgroundColor: '#EDF1F7',
              borderBottom: '1px solid #E2E8F0',
            }}
          >
            <div />
            {['Объект', 'Застройщик', 'Комплектность', 'Статус процесса', 'Кандидатов', 'Подтв.', 'Обновлён'].map(h => (
              <div key={h} style={{ padding: '8px 12px', fontSize: 11, fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {h}
              </div>
            ))}
          </div>

          {/* Rows */}
          {filtered.map(obj => (
            <ObjectRow
              key={obj.id}
              obj={obj}
              hovered={hoveredRow === obj.id}
              onHover={() => setHoveredRow(obj.id)}
              onLeave={() => setHoveredRow(null)}
              onClick={() => onNavigate('object', obj.id)}
            />
          ))}

          {filtered.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>
              Объекты не найдены
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ObjectRow({
  obj, hovered, onHover, onLeave, onClick,
}: {
  obj: InspectionObject;
  hovered: boolean;
  onHover: () => void;
  onLeave: () => void;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      style={{
        display: 'grid',
        gridTemplateColumns: '4px 2fr 1.2fr 120px 150px 80px 60px 90px',
        borderBottom: '1px solid #E2E8F0',
        cursor: 'pointer',
        backgroundColor: hovered ? '#E8F0FB' : '#FFFFFF',
        transition: 'background-color 80ms ease',
        height: 40,
        alignItems: 'center',
      }}
    >
      {/* Color indicator */}
      <div
        style={{
          width: 4,
          height: '100%',
          backgroundColor: INDICATOR_COLORS[obj.colorIndicator],
          borderRadius: '0 2px 2px 0',
        }}
      />

      {/* Object name + address */}
      <div style={{ padding: '0 12px', minWidth: 0 }}>
        <div
          style={{
            fontSize: 13, fontWeight: 500, color: '#0F172A',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}
        >
          {obj.name}
        </div>
        <div
          style={{
            fontSize: 11, color: '#94A3B8',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}
        >
          {obj.address}
        </div>
      </div>

      {/* Developer */}
      <div style={{ padding: '0 12px', fontSize: 12, color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {obj.developer}
      </div>

      {/* Completeness badges */}
      <div style={{ padding: '0 12px', display: 'flex', gap: 4, alignItems: 'center' }}>
        <StageBadge stage="PD" completeness={obj.pdComplete} />
        <StageBadge stage="RD" completeness={obj.rdComplete} />
        <StageBadge stage="ID" completeness={obj.idComplete} />
      </div>

      {/* Process status */}
      <div style={{ padding: '0 12px' }}>
        <ProcessStatusBadge status={obj.processStatus} />
      </div>

      {/* Candidates */}
      <div style={{ padding: '0 12px', fontSize: 13, fontWeight: 600, color: obj.candidatesCount > 0 ? '#B54708' : '#94A3B8', fontVariantNumeric: 'tabular-nums' }}>
        {obj.candidatesCount > 0 ? obj.candidatesCount : '—'}
      </div>

      {/* Confirmed */}
      <div style={{ padding: '0 12px', fontSize: 13, fontWeight: 600, color: obj.confirmedCount > 0 ? '#B42318' : '#94A3B8', fontVariantNumeric: 'tabular-nums' }}>
        {obj.confirmedCount > 0 ? obj.confirmedCount : '—'}
      </div>

      {/* Updated */}
      <div style={{ padding: '0 12px', fontSize: 12, color: '#94A3B8' }}>
        {obj.updatedAt}
      </div>
    </div>
  );
}

function FilterSelect({
  label, value, onChange, options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          appearance: 'none',
          border: '1px solid #E2E8F0',
          borderRadius: 6,
          backgroundColor: value === 'all' ? '#FFFFFF' : '#E8F0FB',
          color: value === 'all' ? '#475569' : '#1B4E9B',
          padding: '0 28px 0 10px',
          height: 30,
          fontSize: 12,
          fontFamily: 'inherit',
          cursor: 'pointer',
          outline: 'none',
        }}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown
        size={12}
        style={{ position: 'absolute', right: 8, color: '#94A3B8', pointerEvents: 'none' }}
      />
    </div>
  );
}
