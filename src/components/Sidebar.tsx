import { Building2, FileText, BookOpen, LogOut } from 'lucide-react';
import type { NavState } from '../App';

interface Props {
  activeScreen: NavState['screen'];
  onNavigate: (screen: NavState['screen']) => void;
}

const NAV_ITEMS = [
  { screen: 'dashboard' as const, icon: Building2, label: 'Объекты' },
  { screen: 'protocol' as const, icon: FileText, label: 'Протоколы' },
];

export default function Sidebar({ activeScreen, onNavigate }: Props) {
  return (
    <div
      style={{
        width: 48,
        backgroundColor: '#0F172A',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 12,
        paddingBottom: 12,
        flexShrink: 0,
        zIndex: 10,
      }}
    >
      {/* Logo */}
      <div
        style={{
          width: 32, height: 32, borderRadius: 6,
          backgroundColor: '#1B4E9B',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 16, flexShrink: 0,
        }}
      >
        <span style={{ color: '#FFFFFF', fontWeight: 700, fontSize: 14, fontFamily: 'JetBrains Mono, monospace' }}>И</span>
      </div>

      {/* Nav items */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = activeScreen === item.screen || (item.screen === 'dashboard' && ['object', 'protocol', 'verification', 'finalization'].includes(activeScreen));
          return (
            <button
              key={item.screen}
              onClick={() => onNavigate(item.screen)}
              aria-label={item.label}
              title={item.label}
              style={{
                width: 36, height: 36, borderRadius: 8,
                backgroundColor: isActive ? '#1B4E9B' : 'transparent',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: isActive ? '#FFFFFF' : '#94A3B8',
                transition: 'background-color 100ms ease, color 100ms ease',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1e2d47';
                  (e.currentTarget as HTMLButtonElement).style.color = '#FFFFFF';
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                  (e.currentTarget as HTMLButtonElement).style.color = '#94A3B8';
                }
              }}
            >
              <Icon size={18} />
            </button>
          );
        })}

        {/* Knowledge base */}
        <button
          aria-label="База знаний"
          title="База знаний"
          style={{
            width: 36, height: 36, borderRadius: 8,
            backgroundColor: 'transparent', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#94A3B8',
          }}
        >
          <BookOpen size={18} />
        </button>
      </nav>

      {/* User avatar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
        <button
          aria-label="Выйти"
          title="Выйти"
          style={{
            width: 36, height: 36, borderRadius: 8,
            backgroundColor: 'transparent', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8',
          }}
        >
          <LogOut size={16} />
        </button>
        <div
          style={{
            width: 32, height: 32, borderRadius: '50%',
            backgroundColor: '#475569',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 600, color: '#FFFFFF',
          }}
          title="Иванов А.В."
        >
          ИА
        </div>
      </div>
    </div>
  );
}
