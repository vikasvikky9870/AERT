import React from 'react';

/**
 * Tactical AERT 3.0 Button Primitive
 */
export function Button({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
  size = 'md', // 'sm' | 'md' | 'lg'
  icon: Icon,
  disabled = false,
  loading = false,
  className = '',
  onClick,
  ...props
}) {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontFamily: 'var(--font-sans)',
    fontWeight: 600,
    letterSpacing: '0.02em',
    border: '1px solid transparent',
    borderRadius: 'var(--radius-sm)',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: 'all var(--transition-fast)',
    outline: 'none',
    opacity: disabled ? 0.45 : 1,
    whiteSpace: 'nowrap',
  };

  const sizeStyles = {
    sm: { padding: '6px 12px', fontSize: '0.75rem' },
    md: { padding: '9px 16px', fontSize: '0.85rem' },
    lg: { padding: '12px 22px', fontSize: '0.95rem' },
  }[size];

  const variantStyles = {
    primary: {
      background: 'linear-gradient(180deg, rgba(0, 240, 255, 0.25) 0%, rgba(0, 180, 216, 0.15) 100%)',
      color: 'var(--text-primary)',
      borderColor: 'var(--border-glow-cyan)',
      boxShadow: '0 0 12px rgba(0, 240, 255, 0.15)',
    },
    secondary: {
      background: 'rgba(255, 255, 255, 0.06)',
      color: 'var(--text-primary)',
      borderColor: 'var(--border-medium)',
    },
    danger: {
      background: 'linear-gradient(180deg, rgba(255, 59, 48, 0.3) 0%, rgba(200, 30, 30, 0.2) 100%)',
      color: '#ffffff',
      borderColor: 'var(--border-glow-critical)',
      boxShadow: '0 0 14px rgba(255, 59, 48, 0.2)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-secondary)',
      borderColor: 'transparent',
    },
    outline: {
      background: 'transparent',
      color: 'var(--accent-cyan)',
      borderColor: 'var(--border-glow-cyan)',
    },
  }[variant];

  return (
    <button
      disabled={disabled || loading}
      onClick={onClick}
      style={{ ...baseStyles, ...sizeStyles, ...variantStyles }}
      className={`aert-button ${className}`}
      {...props}
    >
      {loading ? (
        <span className="mono" style={{ fontSize: '0.8em', animation: 'spin 1s linear infinite' }}>
          ⏳
        </span>
      ) : Icon ? (
        <Icon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
      ) : null}
      {children}
    </button>
  );
}
