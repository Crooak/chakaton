import { useState } from 'react';
import {
  ChevronRight, CheckCircle2, XCircle, AlertCircle, ChevronDown,
  FileText, RefreshCw, Lock,
} from 'lucide-react';
import { MOCK_OBJECTS, MOCK_PROTOCOL } from '../mocks/data';
import Button from '../components/Button';
import type { NavState } from '../App';

interface Props {
  protocolId: string;
  onNavigate: (screen: NavState['screen'], objectId?: string, protocolId?: string) => void;
}

export default function FinalizationScreen({ protocolId, onNavigate }: Props) {
  const protocol = MOCK_PROTOCOL;
  const obj = MOCK_OBJECTS.find(o => o.id === protocol.objectId) ?? MOCK_OBJECTS[0];

  const [modalOpen, setModalOpen] = useState(false);
  const [finalized, setFinalized] = useState(false);
  const [missingExpanded, setMissingExpanded] = useState(false);
  const [retryStatus, setRetryStatus] = useState<'waiting' | 'retrying' | 'sent'>('waiting');

  const stats = [
    { label: 'Обработано кандидатов', value: '14 из 14', icon: CheckCircle2, color: '#027A48', bg: '#ECFDF3' },
    { label: 'Подтверждено нарушений', value: '3', icon: AlertCircle, color: '#B42318', bg: '#FEF3F2' },
    { label: 'Отклонено', value: '9', icon: XCircle, color: '#475569', bg: '#F1F5F9' },
    { label: 'Требует уточнения', value: '2', icon: AlertCircle, color: '#5925DC', bg: '#F4F3FF' },
  ];

  const handleFinalize = () => {
    setFinalized(true);
    setModalOpen(false);
  };

  const handleRetry = () => {
    setRetryStatus('retrying');
    setTimeout(() => setRetryStatus('sent'), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Topbar */}
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '0 24px', height: 48,
          backgroundColor: finalized ? '#ECFDF3' : '#FFFFFF',
          borderBottom: `1px solid ${finalized ? '#A7F3D0' : '#E2E8F0'}`,
          flexShrink: 0, transition: 'background-color 300ms ease',
        }}
      >
        <button onClick={() => onNavigate('dashboard')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#1B4E9B', fontSize: 13, fontFamily: 'inherit', padding: 0 }}>
          Объекты
        </button>
        <ChevronRight size={14} color="#94A3B8" />
        <button onClick={() => onNavigate('object', obj.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#1B4E9B', fontSize: 13, fontFamily: 'inherit', padding: 0 }}>
          {obj.name}
        </button>
        <ChevronRight size={14} color="#94A3B8" />
        <button onClick={() => onNavigate('protocol', obj.id, protocolId)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#1B4E9B', fontSize: 13, fontFamily: 'inherit', padding: 0 }}>
          Протокол № {protocol.number}
        </button>
        <ChevronRight size={14} color="#94A3B8" />
        <span style={{ fontSize: 13, color: '#0F172A', fontWeight: 500 }}>Финализация</span>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          {finalized ? (
            <span
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                backgroundColor: '#ECFDF3', color: '#027A48',
                padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500,
                border: '1px solid #A7F3D0',
              }}
            >
              <Lock size={13} />
              Протокол финализирован
            </span>
          ) : (
            <Button
              variant="primary"
              size="md"
              onClick={() => setModalOpen(true)}
            >
              Финализировать протокол
            </Button>
          )}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Finalized banner */}
        {finalized && (
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              backgroundColor: '#ECFDF3', border: '1px solid #A7F3D0',
              borderRadius: 8, padding: '12px 16px',
            }}
          >
            <Lock size={18} color="#027A48" />
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#027A48' }}>Протокол финализирован</div>
              <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>
                Дозагрузка документов и изменение решений заблокированы. Отмена финализации доступна только администратору.
              </div>
            </div>
          </div>
        )}

        {/* Summary tiles */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                style={{
                  backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0',
                  borderRadius: 8, padding: '14px 16px',
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                  boxShadow: '0 1px 2px rgba(15,23,42,0.06)',
                }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={16} color={stat.color} />
                </div>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: stat.color, fontVariantNumeric: 'tabular-nums' }}>{stat.value}</div>
                  <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>{stat.label}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Missing evidence collapsed list */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 8 }}>
          <button
            onClick={() => setMissingExpanded(v => !v)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px',
              border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 500, color: '#0F172A', flex: 1 }}>
              Записи без доказательств (MISSING_EVIDENCE)
              <span style={{ marginLeft: 6, fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#94A3B8' }}>
                12 записей — не включаются в число нарушений
              </span>
            </span>
            <ChevronDown
              size={14}
              color="#94A3B8"
              style={{ transform: missingExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 150ms ease' }}
            />
          </button>
          {missingExpanded && (
            <div style={{ borderTop: '1px solid #E2E8F0', padding: '8px 0' }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '6px 16px',
                    fontSize: 12, color: '#475569', borderBottom: i < 4 ? '1px solid #F1F5F9' : 'none',
                  }}
                >
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#0F172A' }}>
                    M-0{19 + i * 7}
                  </span>
                  <span style={{ flex: 1, color: '#475569' }}>Параметр без доказательства в загруженном комплекте</span>
                  <span style={{ fontSize: 11, color: '#94A3B8', backgroundColor: '#F1F5F9', padding: '1px 6px', borderRadius: 4 }}>
                    MISSING_EVIDENCE
                  </span>
                </div>
              ))}
              <div style={{ padding: '6px 16px', fontSize: 11, color: '#94A3B8' }}>
                ... и ещё 7 записей
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Export block */}
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 8, padding: 16 }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600, color: '#0F172A' }}>
              Выгрузка протокола
            </h3>
            <p style={{ margin: '0 0 12px', fontSize: 12, color: '#475569' }}>
              Экспорт финализированного протокола с подтверждёнными нарушениями.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['PDF', 'DOCX', 'XML'] as const).map(fmt => (
                <button
                  key={fmt}
                  disabled={!finalized}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6, height: 36, padding: '0 14px',
                    fontSize: 13, fontWeight: 500, fontFamily: 'inherit',
                    backgroundColor: finalized ? '#FFFFFF' : '#F8FAFC',
                    color: finalized ? '#0F172A' : '#CBD5E1',
                    border: `1px solid ${finalized ? '#E2E8F0' : '#E2E8F0'}`,
                    borderRadius: 8, cursor: finalized ? 'pointer' : 'not-allowed',
                  }}
                >
                  <FileText size={14} />
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          {/* IACS transfer block */}
          <div
            style={{
              backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 8, padding: 16,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#0F172A' }}>
                ИАИС «Разрешения и нарушения»
              </h3>
              <span
                style={{
                  backgroundColor: '#FFFAEB', color: '#B54708',
                  padding: '1px 8px', borderRadius: 4, fontSize: 11, fontWeight: 500,
                }}
              >
                Ожидает повтора
              </span>
            </div>

            <div
              style={{
                padding: '8px 10px', backgroundColor: '#FFFBEB',
                border: '1px solid #FCD34D', borderRadius: 6, marginBottom: 12,
              }}
            >
              <p style={{ margin: 0, fontSize: 12, color: '#92400E', lineHeight: '18px' }}>
                Внешняя система недоступна. Повторная отправка через 5 минут
                (попытка 2 из 3). Финализированное решение сохранено.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button
                onClick={handleRetry}
                disabled={retryStatus === 'retrying' || retryStatus === 'sent' || !finalized}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, height: 34, padding: '0 14px',
                  fontSize: 12, fontWeight: 500, fontFamily: 'inherit',
                  backgroundColor: retryStatus === 'sent' ? '#ECFDF3' : '#FFFFFF',
                  color: retryStatus === 'sent' ? '#027A48' : (!finalized ? '#CBD5E1' : '#0F172A'),
                  border: `1px solid ${retryStatus === 'sent' ? '#A7F3D0' : '#E2E8F0'}`,
                  borderRadius: 8, cursor: !finalized || retryStatus !== 'waiting' ? 'not-allowed' : 'pointer',
                }}
              >
                <RefreshCw size={13} style={{ animation: retryStatus === 'retrying' ? 'spin 1s linear infinite' : 'none' }} />
                {retryStatus === 'retrying' ? 'Отправка...' : retryStatus === 'sent' ? 'Отправлено' : 'Повторить сейчас'}
              </button>
              {!finalized && (
                <span style={{ fontSize: 11, color: '#94A3B8' }}>Доступно после финализации</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Finalize modal */}
      {modalOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          }}
          onClick={e => { if (e.target === e.currentTarget) setModalOpen(false); }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF', borderRadius: 12, padding: 24, width: 440,
              boxShadow: '0 20px 60px rgba(15,23,42,0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div
                style={{
                  width: 36, height: 36, borderRadius: 8,
                  backgroundColor: '#FFFAEB', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Lock size={18} color="#B54708" />
              </div>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#0F172A' }}>
                Финализировать протокол?
              </h2>
            </div>
            <p style={{ margin: '0 0 16px', fontSize: 13, color: '#475569', lineHeight: '20px' }}>
              После финализации дозагрузка документов и изменение решений станут невозможны.
              Отмена финализации доступна только администратору.
            </p>
            <div
              style={{
                padding: '8px 12px', backgroundColor: '#FEF3F2', borderRadius: 6,
                fontSize: 12, color: '#B42318', marginBottom: 16, border: '1px solid #FECACA',
              }}
            >
              Протокол будет передан в ИАИС «Разрешения и нарушения» с 3 подтверждёнными нарушениями.
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Button variant="secondary" size="md" onClick={() => setModalOpen(false)}>
                Отмена
              </Button>
              <Button variant="danger" size="md" onClick={handleFinalize}>
                Финализировать
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
