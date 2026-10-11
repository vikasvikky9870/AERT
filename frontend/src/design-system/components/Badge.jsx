const VARIANT_MAP = {
  critical: {
    bg: 'var(--status-critical-bg)',
    color: 'var(--status-critical)',
    border: 'rgba(255, 59, 48, 0.4)',
  },
  warning: {
    bg: 'var(--status-warning-bg)',
    color: 'var(--status-warning)',
    border: 'rgba(255, 204, 0, 0.4)',
  },
  active: {
    bg: 'var(--status-active-bg)',
    color: 'var(--status-active)',
    border: 'rgba(48, 209, 88, 0.4)',
  },
  info: {
    bg: 'var(--status-info-bg)',
    color: 'var(--status-info)',
    border: 'rgba(100, 210, 255, 0.4)',
  },
  cyan: {
    bg: 'rgba(0, 240, 255, 0.15)',
    color: '#00f0ff',
    border: 'rgba(0, 240, 255, 0.4)',
  },
  neutral: {
    bg: 'var(--status-neutral-bg)',
    color: 'var(--status-neutral)',
    border: 'rgba(142, 142, 147, 0.3)',
  },
};

/**
 * Tactical Status Badge Primitive
 */
export function Badge({
  children,
  variant = 'neutral', // 'critical' | 'warning' | 'active' | 'info' | 'cyan' | 'neutral'
  pulse = false,
  className = '',
}) {
  const currentStyles = VARIANT_MAP[variant] || VARIANT_MAP.neutral;

  return (
    <span
      className={`aert-badge ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '3px 10px',
        borderRadius: 'var(--radius-pill)',
        fontSize: '0.72rem',
        fontWeight: 600,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        backgroundColor: currentStyles.bg,
        color: currentStyles.color,
        border: `1px solid ${currentStyles.border}`,
        whiteSpace: 'nowrap',
      }}
    >
      {pulse && (
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: variantStyles.color,
            boxShadow: `0 0 8px ${variantStyles.color}`,
            animation: 'pulse 1.5s infinite',
          }}
        />
      )}
      {children}
    </span>
  );
}

/**
 * Pulsing Tactical Dot Beacon
 */
export function StatusIndicator({ status = 'active', size = 8 }) {
  const colors = {
    critical: 'var(--status-critical)',
    warning: 'var(--status-warning)',
    active: 'var(--status-active)',
    neutral: 'var(--status-neutral)',
  };

  const color = colors[status] || colors.neutral;

  return (
    <span
      style={{
        display: 'inline-block',
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        backgroundColor: color,
        boxShadow: `0 0 10px ${color}`,
      }}
    />
  );
}
