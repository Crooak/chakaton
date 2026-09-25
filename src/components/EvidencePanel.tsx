import { useState } from 'react';
import { ZoomIn, ZoomOut, ExternalLink, Copy } from 'lucide-react';
import type { EvidenceFragment } from '../types';
import StageBadge from './StageBadge';

interface Props {
  evidence: EvidenceFragment;
  label?: string;
}

const APPROVAL_LABELS: Record<string, string> = {
  DRAFT: 'Черновик',
  APPROVED: 'Утверждён',
  FOR_CONSTRUCTION: 'В производство',
  SUPERSEDED: 'Устарел',
  CANCELLED: 'Аннулирован',
};

export default function EvidencePanel({ evidence, label }: Props) {
  const [zoom, setZoom] = useState(100);
  const overlayColor = evidence.role === 'expected' ? '#2E90FA' : '#F04438';
  const [x1, y1, x2, y2] = evidence.bbox;

  const truncSha = evidence.sha256.length > 20 ? evidence.sha256.slice(0, 20) + '...' : evidence.sha256;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid #E2E8F0',
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#FFFFFF',
        flex: 1,
        minWidth: 0,
      }}
    >
      {/* Panel header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 10px',
          backgroundColor: '#EDF1F7',
          borderBottom: '1px solid #E2E8F0',
          flexShrink: 0,
        }}
      >
        <StageBadge stage={evidence.stage} />
        <span
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 11,
            color: '#475569',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 1,
          }}
        >
          {evidence.documentCode}
        </span>
        <span style={{ fontSize: 11, color: '#94A3B8', whiteSpace: 'nowrap' }}>
          Ред. {evidence.revision}
        </span>
        <span
          style={{
            fontSize: 10,
            padding: '1px 5px',
            borderRadius: 4,
            backgroundColor: evidence.approvalStatus === 'APPROVED' ? '#ECFDF3' : '#EFF6FF',
            color: evidence.approvalStatus === 'APPROVED' ? '#027A48' : '#1E40AF',
          }}
        >
          {APPROVAL_LABELS[evidence.approvalStatus] ?? evidence.approvalStatus}
        </span>
        <span style={{ fontSize: 11, color: '#94A3B8', whiteSpace: 'nowrap' }}>
          Лист {evidence.sheetPage}
        </span>
      </div>

      {/* Drawing area */}
      <div
        style={{
          position: 'relative',
          flex: 1,
          backgroundColor: '#F8FAFC',
          overflow: 'hidden',
          minHeight: 200,
        }}
      >
        {/* Grid background — simulated technical drawing */}
        <svg
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id={`grid-small-${evidence.fileId}-${evidence.role}`}
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E2E8F0" strokeWidth="0.5" />
            </pattern>
            <pattern
              id={`grid-large-${evidence.fileId}-${evidence.role}`}
              width="100"
              height="100"
              patternUnits="userSpaceOnUse"
            >
              <rect width="100" height="100" fill={`url(#grid-small-${evidence.fileId}-${evidence.role})`} />
              <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#CBD5E1" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#grid-large-${evidence.fileId}-${evidence.role})`} />

          {/* Simulated floor plan walls */}
          <rect x="5%" y="8%" width="90%" height="84%" fill="none" stroke="#94A3B8" strokeWidth="2" />
          <line x1="5%" y1="45%" x2="60%" y2="45%" stroke="#94A3B8" strokeWidth="1.5" />
          <line x1="60%" y1="8%" x2="60%" y2="75%" stroke="#94A3B8" strokeWidth="1.5" />
          <line x1="30%" y1="45%" x2="30%" y2="92%" stroke="#94A3B8" strokeWidth="1" />
          <line x1="5%" y1="70%" x2="60%" y2="70%" stroke="#94A3B8" strokeWidth="1" />
          {/* Door symbols */}
          <path d="M 57% 42% Q 60% 42% 60% 45%" fill="none" stroke="#94A3B8" strokeWidth="0.8" strokeDasharray="2,2" />
          <path d="M 27% 88% Q 30% 88% 30% 92%" fill="none" stroke="#94A3B8" strokeWidth="0.8" strokeDasharray="2,2" />
          {/* Room labels */}
          <text x="15%" y="30%" fill="#94A3B8" fontSize="8" fontFamily="JetBrains Mono, monospace">Пом. 140</text>
          <text x="35%" y="30%" fill="#94A3B8" fontSize="8" fontFamily="JetBrains Mono, monospace">Пом. 142</text>
          <text x="65%" y="30%" fill="#94A3B8" fontSize="8" fontFamily="JetBrains Mono, monospace">Пом. 267</text>
          <text x="10%" y="58%" fill="#94A3B8" fontSize="8" fontFamily="JetBrains Mono, monospace">Пом. 270</text>
          <text x="35%" y="58%" fill="#94A3B8" fontSize="8" fontFamily="JetBrains Mono, monospace">Пом. 271</text>
          <text x="65%" y="58%" fill="#94A3B8" fontSize="8" fontFamily="JetBrains Mono, monospace">Пом. 272</text>
          <text x="10%" y="82%" fill="#94A3B8" fontSize="8" fontFamily="JetBrains Mono, monospace">Пом. МГН</text>
          <text x="35%" y="82%" fill="#94A3B8" fontSize="8" fontFamily="JetBrains Mono, monospace">Лестн.</text>

          {/* Axis markers */}
          <text x="28%" y="6%" fill="#94A3B8" fontSize="7" fontFamily="JetBrains Mono, monospace" textAnchor="middle">1</text>
          <text x="58%" y="6%" fill="#94A3B8" fontSize="7" fontFamily="JetBrains Mono, monospace" textAnchor="middle">2</text>
          <text x="3%" y="30%" fill="#94A3B8" fontSize="7" fontFamily="JetBrains Mono, monospace">А</text>
          <text x="3%" y="55%" fill="#94A3B8" fontSize="7" fontFamily="JetBrains Mono, monospace">Б</text>
          <text x="3%" y="80%" fill="#94A3B8" fontSize="7" fontFamily="JetBrains Mono, monospace">В</text>

          {/* Evidence overlay bbox */}
          <rect
            x={`${x1 * 100}%`}
            y={`${y1 * 100}%`}
            width={`${(x2 - x1) * 100}%`}
            height={`${(y2 - y1) * 100}%`}
            fill={overlayColor}
            fillOpacity="0.08"
            stroke={overlayColor}
            strokeWidth="2"
            rx="2"
          />
          {/* Extracted value label inside overlay */}
          <rect
            x={`${x1 * 100 + 1}%`}
            y={`${y2 * 100 - 12}%`}
            width={`${(x2 - x1) * 100 - 2}%`}
            height="11%"
            fill={overlayColor}
            fillOpacity="0.12"
            rx="2"
          />
          <text
            x={`${(x1 + (x2 - x1) / 2) * 100}%`}
            y={`${(y2 - 0.04) * 100}%`}
            fill={overlayColor}
            fontSize="10"
            fontFamily="JetBrains Mono, monospace"
            fontWeight="600"
            textAnchor="middle"
          >
            {evidence.extractedValue}
          </text>
        </svg>

        {/* Zoom controls */}
        <div
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: 4,
            overflow: 'hidden',
            boxShadow: '0 1px 2px rgba(15,23,42,0.06)',
          }}
        >
          <button
            onClick={() => setZoom(z => Math.max(50, z - 25))}
            aria-label="Уменьшить"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 24, height: 24, border: 'none', background: 'none',
              cursor: 'pointer', color: '#475569', borderRight: '1px solid #E2E8F0',
            }}
          >
            <ZoomOut size={12} />
          </button>
          <span
            style={{
              padding: '0 6px', fontSize: 11, color: '#475569',
              fontFamily: 'JetBrains Mono, monospace', whiteSpace: 'nowrap',
            }}
          >
            {zoom}%
          </span>
          <button
            onClick={() => setZoom(z => Math.min(300, z + 25))}
            aria-label="Увеличить"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 24, height: 24, border: 'none', background: 'none',
              cursor: 'pointer', color: '#475569', borderLeft: '1px solid #E2E8F0',
            }}
          >
            <ZoomIn size={12} />
          </button>
        </div>

        {/* Label chip */}
        {label && (
          <div
            style={{
              position: 'absolute',
              top: 8,
              left: 8,
              backgroundColor: evidence.role === 'expected' ? '#EFF6FF' : '#FEF3F2',
              color: overlayColor,
              border: `1px solid ${overlayColor}`,
              borderRadius: 4,
              padding: '1px 6px',
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            {label}
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '5px 10px',
          borderTop: '1px solid #E2E8F0',
          backgroundColor: '#F8FAFC',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 10,
            color: '#94A3B8',
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          SHA-256: {truncSha}
        </span>
        <button
          aria-label="Копировать SHA-256"
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#94A3B8', display: 'flex', alignItems: 'center',
          }}
        >
          <Copy size={12} />
        </button>
        <button
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#1B4E9B', fontSize: 11, display: 'flex', alignItems: 'center', gap: 3,
          }}
        >
          <ExternalLink size={11} />
          Открыть
        </button>
      </div>
    </div>
  );
}
