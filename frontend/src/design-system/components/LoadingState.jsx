import React from 'react';

/**
 * Tactical Shimmer Loader / Loading Skeleton State
 */
export function LoadingState({ message = 'Acquiring spatial telemetry...', height = '200px' }) {
  return (
    <div
      style={{
        width: '100%',
        height,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        backgroundColor: 'rgba(8, 14, 22, 0.4)',
        border: '1px dashed var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '24px',
      }}
    >
      <div
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          border: '2px solid rgba(0, 240, 255, 0.2)',
          borderTopColor: 'var(--accent-cyan)',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <span className="mono" style={{ fontSize: '0.8rem', color: 'var(--text-mono-cyan)' }}>
        {message}
      </span>
    </div>
  );
}
