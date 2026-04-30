import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ManualView } from './components/ManualView'
import { useStore } from './store/useStore'
import { TelemetryService } from './services/telemetry'

const startTime = performance.now();

// ─── Error Boundary Global ──────────────────────────────────────────────────
class GlobalErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[CRITICAL-UI-ERROR]', error, errorInfo);
    TelemetryService.trackError(error, true);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          height: '100vh',
          background: '#0a0a0a',
          color: '#ef4444',
          padding: '40px',
          fontFamily: 'monospace',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center'
        }}>
          <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>⚠️ FATAL UI CRASH</h1>
          <div style={{ background: '#1a1a1a', padding: '20px', borderRadius: '8px', border: '1px solid #333', maxWidth: '800px', textAlign: 'left' }}>
            <p style={{ fontWeight: 'bold' }}>{this.state.error?.name}: {this.state.error?.message}</p>
            <pre style={{ fontSize: '10px', opacity: 0.7, overflow: 'auto', maxHeight: '300px' }}>
              {this.state.error?.stack}
            </pre>
          </div>
          <button 
            onClick={() => window.location.reload()}
            style={{ marginTop: '20px', padding: '10px 20px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            REINTENTAR ARRANQUE
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── Inicialización Asíncrona ────────────────────────────────────────────────
// No bloqueamos el arranque de React
TelemetryService.init().then(() => {
  const bootTime = performance.now() - startTime;
  TelemetryService.trackPerformance('boot_time', bootTime);
}).catch(err => console.error('[Telemetry] Init Error:', err));

// Pre-cargar la lista de plugins
useStore.getState().initialize().catch(err => console.error('[Store] Init Error:', err));

const isManual = window.location.hash === '#manual';

// ─── Renderizado Principal ──────────────────────────────────────────────────
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <GlobalErrorBoundary>
      {isManual ? <ManualView /> : <App />}
    </GlobalErrorBoundary>
  </React.StrictMode>
);
