import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Sliding Contextual Drawer (Left or Right Edge)
 */
export function Drawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  position = 'right', // 'left' | 'right'
  width = '420px',
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isLeft = position === 'left';

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        bottom: 0,
        [isLeft ? 'left' : 'right']: 0,
        width: width,
        maxWidth: '90vw',
        zIndex: 1000,
        backgroundColor: 'var(--bg-surface-elevated)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderLeft: isLeft ? 'none' : '1px solid var(--border-medium)',
        borderRight: isLeft ? '1px solid var(--border-medium)' : 'none',
        boxShadow: isLeft
          ? '10px 0 30px rgba(0,0,0,0.8)'
          : '-10px 0 30px rgba(0,0,0,0.8)',
        display: 'flex',
        flexDirection: 'column',
        animation: `${isLeft ? 'slideFromLeft' : 'slideFromRight'} 0.25s cubic-bezier(0.25, 1, 0.5, 1)`,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: '1rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              letterSpacing: '0.02em',
            }}
          >
            {title}
          </h2>
          {subtitle && (
            <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {subtitle}
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: 'var(--radius-xs)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          <X size={18} />
        </button>
      </div>
      <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>{children}</div>
    </div>
  );
}
