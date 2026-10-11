import React from 'react';
import { Inbox } from 'lucide-react';
import { Button } from './Button';

/**
 * Tactical Spatial Empty State
 */
export function EmptyState({
  title = 'No Active Operational Items',
  description = 'There are no active items in this category currently.',
  actionLabel,
  onAction,
  icon: Icon = Inbox,
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '36px 20px',
        textAlign: 'center',
        backgroundColor: 'rgba(8, 14, 22, 0.3)',
        border: '1px dashed var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
      }}
    >
      <div
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '12px',
          color: 'var(--text-muted)',
        }}
      >
        <Icon size={22} />
      </div>
      <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>
        {title}
      </h4>
      <p style={{ margin: '4px 0 16px 0', fontSize: '0.78rem', color: 'var(--text-muted)', maxWidth: '300px' }}>
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
