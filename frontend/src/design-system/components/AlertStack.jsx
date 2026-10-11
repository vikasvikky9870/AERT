import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

/**
 * Toast / Alert Stack Notification Queue
 */
export function AlertStack({ alerts = [], onDismiss }) {
  if (alerts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 2500,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: '380px',
        width: '100%',
        pointerEvents: 'none',
      }}
    >
      {alerts.map((alert) => {
        const config = {
          critical: { icon: AlertCircle, color: 'var(--status-critical)', bg: 'rgba(24, 12, 16, 0.92)', border: 'var(--border-glow-critical)' },
          warning: { icon: AlertTriangle, color: 'var(--status-warning)', bg: 'rgba(24, 22, 12, 0.92)', border: 'rgba(255, 204, 0, 0.4)' },
          success: { icon: CheckCircle, color: 'var(--status-active)', bg: 'rgba(12, 24, 16, 0.92)', border: 'rgba(48, 209, 88, 0.4)' },
          info: { icon: Info, color: 'var(--status-info)', bg: 'rgba(12, 20, 28, 0.92)', border: 'var(--border-glow-cyan)' },
        }[alert.type || 'info'];

        const Icon = config.icon;

        return (
          <div
            key={alert.id}
            style={{
              pointerEvents: 'auto',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              padding: '14px 16px',
              backgroundColor: config.bg,
              backdropFilter: 'blur(16px)',
              border: `1px solid ${config.border}`,
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
              animation: 'slideFromRight 0.25s cubic-bezier(0.25, 1, 0.5, 1)',
            }}
          >
            <Icon size={20} style={{ color: config.color, shrink: 0, marginTop: '2px' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                {alert.title}
              </div>
              {alert.message && (
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {alert.message}
                </div>
              )}
            </div>
            {onDismiss && (
              <button
                onClick={() => onDismiss(alert.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '2px',
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
