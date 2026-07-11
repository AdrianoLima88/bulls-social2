import React from 'react';
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: '100vh', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, maxWidth: 360, width: '100%', boxShadow: '0 4px 20px rgba(0,0,0,.1)' }}>
            <h1 style={{ color: '#dc2626', fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Something went wrong</h1>
            <p style={{ color: '#475569', fontSize: 13, marginBottom: 16, fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {(this.state.error as Error).message}
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{ background: '#dc2626', color: '#fff', padding: '10px 16px', borderRadius: 8, width: '100%', fontWeight: 600, fontSize: 14, border: 'none', cursor: 'pointer' }}
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Render app first, then init OneSignal in background
createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);

// Init OneSignal after app is rendered — non-blocking
setTimeout(() => {
  import('./utils/OneSignalInit').then(({ initOneSignal }) => {
    initOneSignal();
  });
}, 3000);
