/**
 * AERT 3.0 Operational Error Boundary
 * Prevents any component failure from crashing or blanking the tactical workspace.
 */

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('AERT Operational Component Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: '24px',
            background: 'rgba(15, 20, 32, 0.95)',
            border: '1px solid rgba(255, 59, 48, 0.4)',
            borderRadius: '12px',
            color: '#f2f5f8',
            fontFamily: 'Space Grotesk, sans-serif',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            margin: '20px',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.8)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={18} color="#ff3b30" />
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#ff3b30', letterSpacing: '0.04em' }}>
              OPERATIONAL COMPONENT RECOVERY
            </span>
          </div>

          <p style={{ fontSize: '11px', color: '#9aa8b8', margin: 0, lineHeight: 1.4 }}>
            A rendering exception occurred in this tactical view. The core GIS map and backend services remain online.
          </p>

          <div style={{ fontSize: '10px', fontFamily: 'JetBrains Mono, monospace', color: '#ff9500', background: 'rgba(0,0,0,0.5)', padding: '8px', borderRadius: '6px' }}>
            {this.state.error?.message || 'Unknown runtime exception'}
          </div>

          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            style={{
              alignSelf: 'flex-start',
              background: 'rgba(0, 240, 255, 0.15)',
              border: '1px solid #00f0ff',
              borderRadius: '8px',
              padding: '6px 14px',
              color: '#00f0ff',
              fontSize: '11px',
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RefreshCw size={12} />
            <span>REINITIALIZE WORKSPACE</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
