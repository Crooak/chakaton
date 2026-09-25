import { useState, useEffect, useCallback } from 'react';
import {
  ChevronRight, ChevronLeft, ChevronDown, CheckCircle2,
  PanelLeftClose, PanelLeftOpen, AlertOctagon,
} from 'lucide-react';
import type { ReasonCode, FindingStatus } from '../types';
import { REASON_CODE_LABELS } from '../types';
import { MOCK_OBJECTS, MOCK_PROTOCOL } from '../mocks/data';
import type { Finding } from '../types';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import EvidencePanel from '../components/EvidencePanel';
import type { NavState } from '../App';

interface Props {
  protocolId: string;
  onNavigate: (screen: NavState['screen'], objectId?: string, protocolId?: string) => void;
}

type Decision = 'none' | 'confirmed' | 'rejected' | 'clarification';

interface CandidateState {
  findingId: string;
  decision: Decision;
  reasonCode?: ReasonCode;
  comment?: string;
  finalStatus?: FindingStatus;
}

const REASON_CODES: ReasonCode[] = [
  'WRONG_REVISION',
  'APPROVED_CHANGE',
  'OCR_ERROR',
  'BINDING_ERROR',
  'NOT_APPLICABLE',
  'OTHER',
];

export default function VerificationScreen({ protocolId, onNavigate }: Props) {
  const protocol = MOCK_PROTOCOL;
  const obj = MOCK_OBJECTS.find(o => o.id === protocol.objectId) ?? MOCK_OBJECTS[0];

  const candidates = protocol.findings.filter(f => f.status === 'CANDIDATE');
  const [currentIdx, setCurrentIdx] = useState(2);
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [filterPriority, setFilterPriority] = useState<'all' | 'HIGH' | 'MEDIUM' | 'LOW'>('all');
  const [states, setStates] = useState<Record<string, CandidateState>>(() => {
    const init: Record<string, CandidateState> = {};
    candidates.forEach((c, i) => {
      init[c.id] = {
        findingId: c.id,
        decision: i < 2 ? (i === 0 ? 'confirmed' : 'rejected') : 'none',
        finalStatus: i < 2 ? (i === 0 ? 'CONFIRMED_VIOLATION' : 'NEGATIVE_VERIFIED') : undefined,
      };
    });
    return init;
  });
  const [comment, setComment] = useState('');

  const current = candidates[currentIdx];
  const currentState = current ? states[current.id] : null;
  const processedCount = Object.values(states).filter(s => s.decision !== 'none').length;

  const setDecision = (decision: Decision) => {
    if (!current) return;
    setStates(prev => ({
      ...prev,
      [current.id]: { ...prev[current.id], decision, reasonCode: undefined },
    }));
  };

  const setReasonCode = (rc: ReasonCode) => {
    if (!current) return;
    setStates(prev => ({
      ...prev,
      [current.id]: { ...prev[current.id], reasonCode: rc },
    }));
  };

  const saveDecision = () => {
    if (!current || !currentState) return;
    const finalStatus: FindingStatus =
      currentState.decision === 'confirmed' ? 'CONFIRMED_VIOLATION'
        : currentState.decision === 'clarification' ? 'CLARIFICATION_REQUIRED'
          : 'NEGATIVE_VERIFIED';
    setStates(prev => ({
      ...prev,
      [current.id]: { ...prev[current.id], finalStatus, comment },
    }));
    setComment('');
    if (currentIdx < candidates.length - 1) {
      setCurrentIdx(i => i + 1);
    }
  };

  const goNext = useCallback(() => {
    if (currentIdx < candidates.length - 1) setCurrentIdx(i => i + 1);
  }, [currentIdx, candidates.length]);

  const goPrev = useCallback(() => {
    if (currentIdx > 0) setCurrentIdx(i => i - 1);
  }, [currentIdx]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === '1') setDecision('confirmed');
      if (e.key === '2') setDecision('rejected');
      if (e.key === '3') setDecision('clarification');
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [current, goNext, goPrev]);

  const allDone = processedCount === candidates.length && Object.values(states).every(s => s.finalStatus);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Topbar */}
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '0 16px', height: 44,
          backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0', flexShrink: 0, zIndex: 2,
        }}
      >
        <button
          onClick={() => onNavigate('dashboard')}
          style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94A3B8', fontSize: 12, fontFamily: 'inherit', padding: 0 }}
        >Объекты</button>
        <ChevronRight size={12} color="#94A3B8" />
        <button
          onClick={() => onNavigate('object', obj.id)}
          style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94A3B8', fontSize: 12, fontFamily: 'inherit', padding: 0 }}
        >{obj.name}</button>
        <ChevronRight size={12} color="#94A3B8" />
        <button
          onClick={() => onNavigate('protocol', obj.id, protocolId)}
          style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94A3B8', fontSize: 12, fontFamily: 'inherit', padding: 0 }}
        >Протокол № {protocol.number}</button>
        <ChevronRight size={12} color="#94A3B8" />
        <span style={{ fontSize: 12, color: '#0F172A', fontWeight: 500 }}>Верификация кандидатов</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          {allDone && (
            <button
              onClick={() => onNavigate('finalization', obj.id, protocolId)}
              style={{
                height: 32, padding: '0 14px', fontSize: 12, fontWeight: 500,
                backgroundColor: '#1B4E9B', color: '#FFFFFF',
                border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Перейти к финализации →
            </button>
          )}
        </div>
      </div>

      {/* 3-panel layout */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
        {/* LEFT PANEL — Queue */}
        <div
          style={{
            width: leftCollapsed ? 44 : 280,
            flexShrink: 0,
            backgroundColor: '#FFFFFF',
            borderRight: '1px solid #E2E8F0',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            transition: 'width 150ms ease',
          }}
        >
          {/* Left panel header */}
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: leftCollapsed ? '8px 10px' : '8px 12px',
              borderBottom: '1px solid #E2E8F0', flexShrink: 0,
            }}
          >
            {!leftCollapsed && (
              <>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#0F172A' }}>
                    {processedCount} из {candidates.length}
                  </div>
                  <div style={{ height: 4, backgroundColor: '#EDF1F7', borderRadius: 2, marginTop: 4, overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${(processedCount / candidates.length) * 100}%`,
                        backgroundColor: '#1B4E9B',
                        borderRadius: 2,
                        transition: 'width 200ms ease',
                      }}
                    />
                  </div>
                </div>
                <select
                  value={filterPriority}
                  onChange={e => setFilterPriority(e.target.value as typeof filterPriority)}
                  style={{
                    fontSize: 11, border: '1px solid #E2E8F0', borderRadius: 4,
                    backgroundColor: '#F5F7FA', color: '#475569',
                    padding: '2px 4px', fontFamily: 'inherit', cursor: 'pointer',
                  }}
                >
                  <option value="all">Все</option>
                  <option value="HIGH">HIGH</option>
                  <option value="MEDIUM">MED</option>
                  <option value="LOW">LOW</option>
                </select>
              </>
            )}
            <button
              onClick={() => setLeftCollapsed(v => !v)}
              aria-label={leftCollapsed ? 'Развернуть панель' : 'Свернуть панель'}
              style={{
                border: 'none', background: 'none', cursor: 'pointer',
                color: '#94A3B8', display: 'flex', alignItems: 'center',
                flexShrink: 0,
              }}
            >
              {leftCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
            </button>
          </div>

          {/* Queue list */}
          {!leftCollapsed && (
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {candidates
                .filter(c => filterPriority === 'all' || c.priority === filterPriority)
                .map((c, idx) => {
                  const realIdx = candidates.indexOf(c);
                  const st = states[c.id];
                  const isCurrent = realIdx === currentIdx;
                  const isDone = st?.finalStatus !== undefined;
                  return (
                    <div
                      key={c.id}
                      onClick={() => setCurrentIdx(realIdx)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px',
                        cursor: 'pointer',
                        backgroundColor: isCurrent ? '#E8F0FB' : 'transparent',
                        borderLeft: `3px solid ${isCurrent ? '#1B4E9B' : 'transparent'}`,
                        borderBottom: '1px solid #F1F5F9',
                        transition: 'background-color 80ms ease',
                      }}
                    >
                      <div style={{ flexShrink: 0, width: 16, display: 'flex', justifyContent: 'center' }}>
                        {isDone ? (
                          <CheckCircle2 size={14} color={st.finalStatus === 'CONFIRMED_VIOLATION' ? '#B42318' : '#027A48'} />
                        ) : (
                          <span
                            style={{
                              width: 6, height: 6, borderRadius: '50%',
                              backgroundColor: isCurrent ? '#1B4E9B' : '#CBD5E1',
                              display: 'inline-block',
                            }}
                          />
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 600, color: isCurrent ? '#1B4E9B' : '#0F172A' }}>
                            {c.code}
                          </span>
                          <PriorityBadge priority={c.priority} showLabel={false} />
                        </div>
                        <div style={{ fontSize: 11, color: '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {c.parameterName}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* CENTER PANEL — Evidence */}
        <div
          style={{
            flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0,
            backgroundColor: '#F5F7FA',
          }}
        >
          {current ? (
            <>
              {/* Candidate header */}
              <div
                style={{
                  backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0',
                  padding: '10px 16px', flexShrink: 0,
                  display: 'flex', alignItems: 'center', gap: 12,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 14, fontWeight: 700, color: '#0F172A' }}>
                      {current.code}
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>·</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>{current.parameterName}</span>
                    <PriorityBadge priority={current.priority} />
                    <span style={{ fontSize: 12, color: '#475569' }}>Раздел: <strong>{current.section}</strong></span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button
                    onClick={goPrev}
                    disabled={currentIdx === 0}
                    style={{
                      border: '1px solid #E2E8F0', background: '#FFFFFF', borderRadius: 6,
                      padding: '0 8px', height: 30, cursor: currentIdx === 0 ? 'not-allowed' : 'pointer',
                      color: currentIdx === 0 ? '#CBD5E1' : '#475569', display: 'flex', alignItems: 'center',
                    }}
                    aria-label="Предыдущий"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    onClick={goNext}
                    disabled={currentIdx === candidates.length - 1}
                    style={{
                      border: '1px solid #E2E8F0', background: '#FFFFFF', borderRadius: 6,
                      padding: '0 8px', height: 30, cursor: currentIdx === candidates.length - 1 ? 'not-allowed' : 'pointer',
                      color: currentIdx === candidates.length - 1 ? '#CBD5E1' : '#475569', display: 'flex', alignItems: 'center',
                    }}
                    aria-label="Следующий"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              {/* Scrollable content */}
              <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Value comparison */}
                <div
                  style={{
                    backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0',
                    borderRadius: 8, padding: 16, flexShrink: 0,
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <ValueBox
                      label="Ожидается"
                      value={current.expected}
                      source={current.evidence?.[0] ? `Источник: ${current.evidence[0].documentCode} лист ${current.evidence[0].sheetPage}` : undefined}
                      color="#2E90FA"
                    />
                    <ValueBox
                      label="Фактически"
                      value={current.actual}
                      source={current.evidence?.[1] ? `Источник: ${current.evidence[1].documentCode} лист ${current.evidence[1].sheetPage}` : undefined}
                      color="#F04438"
                    />
                  </div>
                  <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span
                      style={{
                        fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 600,
                        color: '#B42318', fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      Δ {current.delta}
                    </span>
                    {current.triggerDescription && (
                      <>
                        <span style={{ color: '#CBD5E1' }}>·</span>
                        <span style={{ fontSize: 12, color: '#475569' }}>
                          Триггер: <strong>{current.triggerDescription}</strong>
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Evidence split view */}
                {current.evidence && current.evidence.length >= 2 && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, flex: 1, minHeight: 260 }}>
                    <EvidencePanel
                      evidence={current.evidence[0]}
                      label="Ожидаемое (ПД)"
                    />
                    <EvidencePanel
                      evidence={current.evidence[1]}
                      label="Фактическое (РД)"
                    />
                  </div>
                )}

                {/* AI rationale */}
                <div
                  style={{
                    backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0',
                    borderRadius: 8, padding: 14, flexShrink: 0,
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
                    Обоснование ИИ
                  </div>
                  <p style={{ margin: 0, fontSize: 12, color: '#0F172A', lineHeight: '18px' }}>
                    {current.aiRationale ?? 'Обоснование не предоставлено.'}
                  </p>
                  {current.normReference && (
                    <div style={{ marginTop: 8, display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: '#94A3B8' }}>Нормативная база:</span>
                      <span style={{ fontSize: 11, color: '#1B4E9B', fontWeight: 500 }}>{current.normReference}</span>
                    </div>
                  )}
                  <div
                    style={{
                      marginTop: 8, padding: '5px 8px', borderRadius: 4,
                      backgroundColor: current.approvedChange ? '#FFFAEB' : '#F8FAFC',
                      border: `1px solid ${current.approvedChange ? '#FCD34D' : '#E2E8F0'}`,
                      fontSize: 11,
                    }}
                  >
                    <span style={{ fontWeight: 600, color: current.approvedChange ? '#B54708' : '#0F172A' }}>
                      Согласованное изменение:&nbsp;
                    </span>
                    <span style={{ color: current.approvedChange ? '#B54708' : '#94A3B8' }}>
                      {current.approvedChange ?? 'не найдено'}
                    </span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
              <CheckCircle2 size={40} color="#027A48" />
              <p style={{ fontSize: 15, fontWeight: 600, color: '#0F172A', margin: 0 }}>Все кандидаты обработаны</p>
              <button
                onClick={() => onNavigate('finalization', obj.id, protocolId)}
                style={{
                  height: 36, padding: '0 16px', fontSize: 13, fontWeight: 500,
                  backgroundColor: '#1B4E9B', color: '#FFFFFF',
                  border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Перейти к финализации
              </button>
            </div>
          )}
        </div>

        {/* RIGHT PANEL — Decision */}
        <div
          style={{
            width: 340, flexShrink: 0,
            backgroundColor: '#FFFFFF', borderLeft: '1px solid #E2E8F0',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '12px 16px', borderBottom: '1px solid #E2E8F0', flexShrink: 0,
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Решение эксперта
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* Decision buttons */}
            <button
              onClick={() => setDecision('confirmed')}
              style={{
                width: '100%', height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                backgroundColor: currentState?.decision === 'confirmed' ? '#B42318' : '#FFFFFF',
                color: currentState?.decision === 'confirmed' ? '#FFFFFF' : '#B42318',
                border: `2px solid #B42318`,
                borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
                transition: 'all 120ms ease',
              }}
            >
              <AlertOctagon size={16} />
              Подтвердить нарушение
            </button>

            <button
              onClick={() => setDecision('rejected')}
              style={{
                width: '100%', height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                backgroundColor: currentState?.decision === 'rejected' ? '#EDF1F7' : '#FFFFFF',
                color: '#0F172A',
                border: `1px solid ${currentState?.decision === 'rejected' ? '#CBD5E1' : '#E2E8F0'}`,
                borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 500, fontFamily: 'inherit',
              }}
            >
              Отклонить
            </button>

            <button
              onClick={() => setDecision('clarification')}
              style={{
                width: '100%', height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                backgroundColor: currentState?.decision === 'clarification' ? '#F4F3FF' : '#FFFFFF',
                color: currentState?.decision === 'clarification' ? '#5925DC' : '#0F172A',
                border: `1px solid ${currentState?.decision === 'clarification' ? '#C4B5FD' : '#E2E8F0'}`,
                borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 500, fontFamily: 'inherit',
              }}
            >
              Требует уточнения
            </button>

            {/* Reason codes — appear when "rejected" */}
            {currentState?.decision === 'rejected' && (
              <div
                style={{
                  border: '1px solid #E2E8F0', borderRadius: 8, padding: 12,
                  backgroundColor: '#F8FAFC',
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 600, color: '#475569', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                  Код причины отклонения
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  {REASON_CODES.map(rc => (
                    <button
                      key={rc}
                      onClick={() => setReasonCode(rc)}
                      style={{
                        padding: '5px 8px', fontSize: 11, fontWeight: 500, textAlign: 'left',
                        backgroundColor: currentState.reasonCode === rc ? '#E8F0FB' : '#FFFFFF',
                        color: currentState.reasonCode === rc ? '#1B4E9B' : '#475569',
                        border: `1px solid ${currentState.reasonCode === rc ? '#C7D7F4' : '#E2E8F0'}`,
                        borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit',
                        lineHeight: '16px',
                        transition: 'all 80ms ease',
                      }}
                    >
                      {REASON_CODE_LABELS[rc]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Comment */}
            <div>
              <label
                style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#475569', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.4 }}
              >
                Комментарий инспектора
              </label>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Введите комментарий..."
                rows={3}
                style={{
                  width: '100%', padding: '7px 10px', fontSize: 12,
                  border: '1px solid #CBD5E1', borderRadius: 8,
                  fontFamily: 'inherit', resize: 'none', outline: 'none',
                  color: '#0F172A', backgroundColor: '#FFFFFF',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Save */}
            <button
              onClick={saveDecision}
              disabled={!currentState || currentState.decision === 'none' || (currentState.decision === 'rejected' && !currentState.reasonCode)}
              style={{
                width: '100%', height: 40, fontSize: 13, fontWeight: 600,
                backgroundColor: (!currentState || currentState.decision === 'none') ? '#F1F5F9' : '#1B4E9B',
                color: (!currentState || currentState.decision === 'none') ? '#94A3B8' : '#FFFFFF',
                border: 'none', borderRadius: 8,
                cursor: (!currentState || currentState.decision === 'none') ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit', marginTop: 4,
                transition: 'all 120ms ease',
              }}
            >
              Сохранить решение
            </button>

            {/* Saved status */}
            {currentState?.finalStatus && (
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '8px 10px',
                  backgroundColor: '#ECFDF3', border: '1px solid #A7F3D0',
                  borderRadius: 6, fontSize: 12, color: '#027A48',
                }}
              >
                <CheckCircle2 size={14} />
                Решение сохранено
                <button
                  style={{
                    marginLeft: 'auto', border: 'none', background: 'none', cursor: 'pointer',
                    fontSize: 11, color: '#027A48', fontFamily: 'inherit',
                  }}
                >
                  Изменить
                </button>
              </div>
            )}
          </div>

          {/* Current status indicator */}
          {current && (
            <div style={{ padding: '8px 12px', borderTop: '1px solid #E2E8F0', flexShrink: 0 }}>
              <StatusBadge status={currentState?.finalStatus ?? current.status} />
            </div>
          )}
        </div>
      </div>

      {/* Hotkey bar */}
      <div
        style={{
          height: 32, backgroundColor: '#EDF1F7', borderTop: '1px solid #E2E8F0',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20,
          fontSize: 11, color: '#475569', flexShrink: 0,
        }}
      >
        {[
          ['1', 'подтвердить'],
          ['2', 'отклонить'],
          ['3', 'уточнить'],
          ['←', 'предыдущий'],
          ['→', 'следующий'],
          ['Space', 'увеличить чертёж'],
        ].map(([key, action]) => (
          <span key={key} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <kbd
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                minWidth: 20, height: 18, padding: '0 4px',
                backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1',
                borderRadius: 4, fontSize: 10, fontFamily: 'JetBrains Mono, monospace',
                color: '#0F172A', boxShadow: '0 1px 0 #CBD5E1',
              }}
            >
              {key}
            </kbd>
            <span>{action}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function ValueBox({
  label, value, source, color,
}: {
  label: string;
  value: string;
  source?: string;
  color: string;
}) {
  return (
    <div
      style={{
        padding: '14px 16px',
        border: `2px solid ${color}20`,
        borderRadius: 8,
        backgroundColor: `${color}05`,
      }}
    >
      <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}
      </div>
      <div
        style={{
          fontSize: 24, fontWeight: 700, color: '#0F172A',
          fontVariantNumeric: 'tabular-nums', lineHeight: '32px',
        }}
      >
        {value}
      </div>
      {source && (
        <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>{source}</div>
      )}
    </div>
  );
}
