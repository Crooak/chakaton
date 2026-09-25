import { useState } from 'react';
import Sidebar from './components/Sidebar';
import DashboardScreen from './screens/DashboardScreen';
import ObjectScreen from './screens/ObjectScreen';
import ProtocolScreen from './screens/ProtocolScreen';
import VerificationScreen from './screens/VerificationScreen';
import FinalizationScreen from './screens/FinalizationScreen';

export type Screen = 'dashboard' | 'object' | 'protocol' | 'verification' | 'finalization';

export interface NavState {
  screen: Screen;
  objectId: string | null;
  protocolId: string | null;
}

export default function App() {
  const [nav, setNav] = useState<NavState>({
    screen: 'dashboard',
    objectId: null,
    protocolId: null,
  });

  const navigate = (screen: Screen, objectId?: string, protocolId?: string) => {
    setNav({ screen, objectId: objectId ?? null, protocolId: protocolId ?? null });
  };

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        backgroundColor: '#F5F7FA',
        overflow: 'hidden',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <Sidebar activeScreen={nav.screen} onNavigate={s => navigate(s)} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {nav.screen === 'dashboard' && (
          <DashboardScreen onNavigate={navigate} />
        )}
        {nav.screen === 'object' && nav.objectId && (
          <ObjectScreen objectId={nav.objectId} onNavigate={navigate} />
        )}
        {nav.screen === 'protocol' && nav.protocolId && (
          <ProtocolScreen protocolId={nav.protocolId} onNavigate={navigate} />
        )}
        {nav.screen === 'verification' && nav.protocolId && (
          <VerificationScreen protocolId={nav.protocolId} onNavigate={navigate} />
        )}
        {nav.screen === 'finalization' && nav.protocolId && (
          <FinalizationScreen protocolId={nav.protocolId} onNavigate={navigate} />
        )}
      </div>
    </div>
  );
}
