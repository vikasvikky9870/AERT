import React from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';
import { Button } from './Button';

/**
 * Graceful Tactical Error Recovery Display
 */
export function ErrorState({
  title = 'Operational System Degraded',
  description = 'Unable to establish spatial sync connection with telematics server.',
  onRetry,
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 20px',
        textAlign: 'center',
        backgroundColor: 'rgba(24, 12, 16, 0.6)',
        border: '1px solid var(--border-glow-critical)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-glow-critical)',
      }}
    >
      <AlertOctagon size={32} style={{ color: 'var(--status-critical)', marginBottom: '12px' }} />
      <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#ffffff', fontWeight: 600 }}>
        {title}
      </h4>
      <p style={{ margin: '6px 0 16px 0', fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '320px' }}>
        {description}
      </p>
      {onRetry && (
        <Button variant="danger" size="sm" icon={RefreshCw} onClick={onRetry}>
          Re-establish Connection
        </Button>
      )}
    </div>
  );
}
