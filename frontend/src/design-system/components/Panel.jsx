import React from 'react';

/**
 * Floating Backdrop-Blur Panel Container for Spatial Overlay
 */
export function Panel({
  children,
  title,
  subtitle,
  headerAction,
  variant = 'default', // 'default' | 'glow-cyan' | 'glow-critical' | 'glass'
  className = '',
  style = {},
}) {
  const variantBorders = {
    default: 'var(--border-subtle)',
    'glow-cyan': 'var(--border-glow-cyan)',
    'glow-critical': 'var(--border-glow-critical)',
    glass: 'rgba(255, 255, 255, 0.05)',
  };

  const variantBackgrounds = {
    default: 'var(--bg-surface-base)',
    'glow-cyan': 'rgba(10, 20, 32, 0.88)',
    'glow-critical': 'rgba(24, 12, 16, 0.88)',
    glass: 'var(--bg-surface-glass)',
  };

  return (
    <div
      className={`aert-panel ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: variantBackgrounds[variant],
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid ${variantBorders[variant]}`,
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-panel)',
        overflow: 'hidden',
        ...style,
      }}
    >
      {(title || subtitle || headerAction) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            borderBottom: '1px solid var(--border-subtle)',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
          }}
        >
          <div>
            {title && (
              <h3
                style={{
                  margin: 0,
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  letterSpacing: '0.03em',
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                {title}
              </h3>
            )}
            {subtitle && (
              <p
                style={{
                  margin: '2px 0 0 0',
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div style={{ padding: '16px', flex: 1, overflowY: 'auto' }}>{children}</div>
    </div>
  );
}
