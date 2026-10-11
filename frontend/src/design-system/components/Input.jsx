import React from 'react';

/**
 * Tactical Input Field
 */
export function Input({
  value,
  onChange,
  placeholder = '',
  icon: Icon,
  mono = false,
  type = 'text',
  className = '',
  style = {},
  ...props
}) {
  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        width: '100%',
      }}
    >
      {Icon && (
        <span
          style={{
            position: 'absolute',
            left: '12px',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            pointerEvents: 'none',
          }}
        >
          <Icon size={16} />
        </span>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: Icon ? '10px 14px 10px 38px' : '10px 14px',
          backgroundColor: 'rgba(8, 14, 22, 0.75)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          color: 'var(--text-primary)',
          fontFamily: mono ? 'var(--font-mono)' : 'var(--font-sans)',
          fontSize: '0.85rem',
          outline: 'none',
          transition: 'all var(--transition-fast)',
          ...style,
        }}
        onFocus={(e) => {
          e.target.style.borderColor = 'var(--accent-cyan)';
          e.target.style.boxShadow = '0 0 10px rgba(0, 240, 255, 0.2)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = 'var(--border-subtle)';
          e.target.style.boxShadow = 'none';
        }}
        className={`aert-input ${className}`}
        {...props}
      />
    </div>
  );
}
