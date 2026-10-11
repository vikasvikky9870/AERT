import React, { useState, useEffect } from 'react';
import { Search, AlertTriangle, Shield, Building2, MapPin, X } from 'lucide-react';

/**
 * Universal Command Palette (Ctrl+K)
 */
export function CommandPalette({ isOpen, onClose, onSelect }) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        isOpen ? onClose() : null; // Handled outside or passed as state
      }
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sampleResults = [
    { type: 'incident', id: 'INC-1042', title: 'Vehicle Collision near Srikakulam NH-16', category: 'High Severity', icon: AlertTriangle },
    { type: 'unit', id: 'AMB-04', title: 'Ambulance 04 - Srikakulam Central', category: 'En Route', icon: Shield },
    { type: 'hospital', id: 'HOSP-01', title: 'RIMS Govt General Hospital Srikakulam', category: '92% Capacity', icon: Building2 },
    { type: 'location', id: 'LOC-03', title: 'Navabharat Junction, Srikakulam Sector 2', category: 'Geofence Active', icon: MapPin },
  ];

  const filtered = query
    ? sampleResults.filter(
        (r) =>
          r.title.toLowerCase().includes(query.toLowerCase()) ||
          r.id.toLowerCase().includes(query.toLowerCase())
      )
    : sampleResults;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 3000,
        backgroundColor: 'rgba(4, 7, 12, 0.8)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '15vh',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '640px',
          backgroundColor: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-glow-cyan)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-glow-cyan), 0 20px 50px rgba(0,0,0,0.8)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            gap: '12px',
          }}
        >
          <Search size={20} style={{ color: 'var(--accent-cyan)' }} />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search incidents, units, hospitals, locations..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-sans)',
              fontSize: '1rem',
              outline: 'none',
            }}
          />
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ maxHeight: '360px', overflowY: 'auto', padding: '8px' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No operational matches found for "{query}"
            </div>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelect && onSelect(item);
                    onClose();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    transition: 'background var(--transition-fast)',
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = 'rgba(0, 240, 255, 0.08)')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = 'transparent')
                  }
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Icon size={18} style={{ color: 'var(--accent-cyan)' }} />
                    <div>
                      <div
                        style={{
                          color: 'var(--text-primary)',
                          fontWeight: 500,
                          fontSize: '0.88rem',
                        }}
                      >
                        {item.title}
                      </div>
                      <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {item.id}
                      </span>
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      color: 'var(--text-secondary)',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-pill)',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    {item.category}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
