import React, { useState } from 'react';
import { Panel } from '../../design-system/components/Panel';
import { Badge } from '../../design-system/components/Badge';
import { Button } from '../../design-system/components/Button';
import { Input } from '../../design-system/components/Input';
import { Ambulance, Shield, Flame, Radio, MapPin, Gauge, Fuel, Phone, Search } from 'lucide-react';

/**
 * Tactical Responder Fleet Management Hub
 */
export function FleetHub({ responders = [], onSelectUnit, onUpdateUnitStatus, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filtered = responders.filter((unit) => {
    const matchesSearch =
      unit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      unit.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || unit.status.toUpperCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeVariant = (status) => {
    switch (status.toUpperCase()) {
      case 'AVAILABLE':
        return 'active';
      case 'EN ROUTE':
        return 'info';
      case 'ON SCENE':
        return 'warning';
      case 'RETURNING':
        return 'neutral';
      default:
        return 'neutral';
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: '70px',
        left: '350px',
        width: '440px',
        bottom: '80px',
        zIndex: 840,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Panel
        title="RESPONDER FLEET TELEMETRY"
        subtitle="Srikakulam Emergency Units (Ambulance, Fire, Police)"
        style={{ height: '100%' }}
        headerAction={
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '12px' }}>
          {/* Search & Filter Bar */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ flex: 1 }}>
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search unit ID or name..."
                icon={Search}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                backgroundColor: 'rgba(8, 14, 22, 0.75)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                fontSize: '0.8rem',
                outline: 'none',
              }}
            >
              <option value="ALL">ALL STATUS</option>
              <option value="AVAILABLE">AVAILABLE</option>
              <option value="EN ROUTE">EN ROUTE</option>
              <option value="ON SCENE">ON SCENE</option>
            </select>
          </div>

          {/* Unit Cards List */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filtered.map((unit) => (
              <div
                key={unit.id}
                onClick={() => onSelectUnit && onSelectUnit(unit)}
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-glow-cyan)';
                  e.currentTarget.style.backgroundColor = 'rgba(0, 240, 255, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Ambulance size={18} style={{ color: 'var(--accent-cyan)' }} />
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {unit.name}
                    </span>
                  </div>
                  <Badge variant={getStatusBadgeVariant(unit.status)}>
                    {unit.status.toUpperCase()}
                  </Badge>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: '8px',
                    margin: '8px 0',
                    padding: '6px 10px',
                    backgroundColor: 'rgba(8, 14, 22, 0.6)',
                    borderRadius: 'var(--radius-xs)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Gauge size={12} style={{ color: 'var(--accent-cyan)' }} />
                    <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-mono-cyan)' }}>
                      {unit.speed || '48 km/h'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Fuel size={12} style={{ color: 'var(--status-active)' }} />
                    <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-primary)' }}>
                      {unit.fuel || '84%'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={12} style={{ color: 'var(--text-muted)' }} />
                    <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {unit.eta || '3.2 mins'}
                    </span>
                  </div>
                </div>

                {/* Status Toggle Action */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
                  <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    ID: {unit.id}
                  </span>
                  <select
                    value={unit.status}
                    onChange={(e) => onUpdateUnitStatus && onUpdateUnitStatus(unit.id, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      padding: '2px 6px',
                      fontSize: '0.72rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-xs)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <option value="Available">Available</option>
                    <option value="En Route">En Route</option>
                    <option value="On Scene">On Scene</option>
                    <option value="Returning">Returning</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Panel>
    </div>
  );
}
