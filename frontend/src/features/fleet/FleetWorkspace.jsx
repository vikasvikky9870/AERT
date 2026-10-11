/**
 * AERT 3.0 Workspace 05: FLEET COMMAND
 * Operational Responder Traffic Control & Telemetry Hub
 * Sector: Srikakulam District (AP-SKLM-EOC-01)
 * 
 * Compliant with Master Reconstruction Spec Screen 05:
 * - Fleet Overview Status Count Bar (Total, Available, On Scene, En Route, Out of Service)
 * - Filter Tabs (All, Available, En Route, On Scene, Transport)
 * - Compact Operational Vehicle Telemetry Rows
 */

import React, { useState } from 'react';
import { Badge } from '../../design-system/components/Badge';
import { Button } from '../../design-system/components/Button';
import { soundManager } from '../../services/soundManager';
import {
  Ambulance,
  Battery,
  Fuel,
  Gauge,
  Heart,
  Navigation,
  Radio,
  Shield,
  Zap
} from 'lucide-react';

export function FleetWorkspace({
  ambulances = [],
  onSelectAmbulance = () => {},
  onUpdateStatus = () => {}
}) {
  const [filter, setFilter] = useState('ALL');

  const counts = {
    total: ambulances.length,
    available: ambulances.filter((a) => a.status === 'AVAILABLE').length,
    onScene: ambulances.filter((a) => a.status === 'ON_SCENE').length,
    enRoute: ambulances.filter((a) => a.status === 'EN_ROUTE').length,
    transport: ambulances.filter((a) => a.status === 'TRANSPORTING').length
  };

  const filteredUnits = ambulances.filter((a) => {
    if (filter === 'ALL') return true;
    if (filter === 'TRANSPORT') return a.status === 'TRANSPORTING';
    return a.status === filter;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', height: '100%', overflowX: 'hidden' }}>
      {/* 1. Fleet Overview Status Count Bar */}
      <div>
        <div style={{ fontSize: '10px', fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', color: '#00f0ff', marginBottom: '6px', letterSpacing: '0.05em' }}>
          FLEET OVERVIEW
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px', textAlign: 'center' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: '4px', padding: '6px 2px' }}>
            <div style={{ fontSize: '8px', color: '#9aa8b8' }}>TOTAL</div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#f2f5f8' }}>{counts.total}</div>
          </div>
          <div style={{ background: 'rgba(48, 209, 88, 0.1)', border: '1px solid rgba(48, 209, 88, 0.2)', borderRadius: '4px', padding: '6px 2px' }}>
            <div style={{ fontSize: '8px', color: '#30d158' }}>AVAILABLE</div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#30d158' }}>{counts.available}</div>
          </div>
          <div style={{ background: 'rgba(255, 149, 0, 0.1)', border: '1px solid rgba(255, 149, 0, 0.2)', borderRadius: '4px', padding: '6px 2px' }}>
            <div style={{ fontSize: '8px', color: '#ff9500' }}>ON SCENE</div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#ff9500' }}>{counts.onScene}</div>
          </div>
          <div style={{ background: 'rgba(0, 240, 255, 0.1)', border: '1px solid rgba(0, 240, 255, 0.2)', borderRadius: '4px', padding: '6px 2px' }}>
            <div style={{ fontSize: '8px', color: '#00f0ff' }}>EN ROUTE</div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#00f0ff' }}>{counts.enRoute}</div>
          </div>
          <div style={{ background: 'rgba(255, 59, 48, 0.1)', border: '1px solid rgba(255, 59, 48, 0.2)', borderRadius: '4px', padding: '6px 2px' }}>
            <div style={{ fontSize: '8px', color: '#ff3b30' }}>TRANSPORT</div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#ff3b30' }}>{counts.transport}</div>
          </div>
        </div>
      </div>

      {/* 2. Filter Tabs */}
      <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '6px' }}>
        {['ALL', 'AVAILABLE', 'EN_ROUTE', 'ON_SCENE', 'TRANSPORT'].map((tab) => {
          const isAct = filter === tab;
          return (
            <button
              key={tab}
              onClick={() => {
                soundManager.playClickTone();
                setFilter(tab);
              }}
              style={{
                background: isAct ? 'rgba(0, 240, 255, 0.15)' : 'transparent',
                border: isAct ? '1px solid #00f0ff' : '1px solid transparent',
                borderRadius: '4px',
                color: isAct ? '#00f0ff' : '#9aa8b8',
                fontSize: '9px',
                fontFamily: 'JetBrains Mono, monospace',
                fontWeight: 700,
                padding: '3px 6px',
                cursor: 'pointer'
              }}
            >
              {tab.replace('_', ' ')}
            </button>
          );
        })}
      </div>

      {/* 3. Compact Operational Unit Rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto' }}>
        {filteredUnits.map((amb) => {
          const isAvail = amb.status === 'AVAILABLE';
          const isEnRoute = amb.status === 'EN_ROUTE';
          const isOnScene = amb.status === 'ON_SCENE';
          const isTrans = amb.status === 'TRANSPORTING';

          return (
            <div
              key={amb.id}
              onClick={() => {
                soundManager.playClickTone();
                onSelectAmbulance(amb);
              }}
              style={{
                background: 'rgba(12, 18, 28, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '6px',
                padding: '8px 10px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#00f0ff')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', color: '#00f0ff' }}>
                    {amb.id}
                  </span>
                  <Badge variant="cyan">{amb.type || 'ALS'}</Badge>
                </div>
                <Badge variant={isAvail ? 'active' : isEnRoute ? 'cyan' : isOnScene ? 'warning' : 'critical'}>
                  {amb.status.replace('_', ' ')}
                </Badge>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', color: '#9aa8b8' }}>
                <div>
                  <Navigation size={9} color="#00f0ff" style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                  {amb.stationed_at || 'NH-16 Fast Post'}
                  {amb.current_incident_id && (
                    <span style={{ marginLeft: '6px', color: '#ff9500', fontFamily: 'JetBrains Mono, monospace' }}>
                      ASSIGNED: {amb.current_incident_id}
                    </span>
                  )}
                </div>
                {isEnRoute && (
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', color: '#00f0ff', fontWeight: 700 }}>
                    Speed {amb.speed_kmh || 52} km/h • En Route
                  </div>
                )}
                {isAvail && (
                  <div style={{ color: '#30d158', fontWeight: 600 }}>
                    Fuel {amb.fuel_pct || 92}% • Ready
                  </div>
                )}
              </div>

              {/* Status Action Buttons */}
              <div style={{ display: 'flex', gap: '4px', marginTop: '6px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '4px' }} onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => onUpdateStatus(amb.id, 'AVAILABLE')}
                  style={{
                    flex: 1,
                    background: isAvail ? '#30d158' : 'rgba(48, 209, 88, 0.1)',
                    border: '1px solid rgba(48, 209, 88, 0.3)',
                    borderRadius: '4px',
                    color: isAvail ? '#06090e' : '#30d158',
                    fontSize: '8px',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontWeight: 700,
                    padding: '2px 0',
                    cursor: 'pointer'
                  }}
                >
                  AVAILABLE
                </button>
                <button
                  onClick={() => onUpdateStatus(amb.id, 'EN_ROUTE')}
                  style={{
                    flex: 1,
                    background: isEnRoute ? '#00f0ff' : 'rgba(0, 240, 255, 0.1)',
                    border: '1px solid rgba(0, 240, 255, 0.3)',
                    borderRadius: '4px',
                    color: isEnRoute ? '#06090e' : '#00f0ff',
                    fontSize: '8px',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontWeight: 700,
                    padding: '2px 0',
                    cursor: 'pointer'
                  }}
                >
                  EN ROUTE
                </button>
                <button
                  onClick={() => onUpdateStatus(amb.id, 'ON_SCENE')}
                  style={{
                    flex: 1,
                    background: isOnScene ? '#ff9500' : 'rgba(255, 149, 0, 0.1)',
                    border: '1px solid rgba(255, 149, 0, 0.3)',
                    borderRadius: '4px',
                    color: isOnScene ? '#06090e' : '#ff9500',
                    fontSize: '8px',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontWeight: 700,
                    padding: '2px 0',
                    cursor: 'pointer'
                  }}
                >
                  ON SCENE
                </button>
                <button
                  onClick={() => onUpdateStatus(amb.id, 'BUSY')}
                  style={{
                    flex: 1,
                    background: amb.status === 'BUSY' ? '#ff3b30' : 'rgba(255, 59, 48, 0.1)',
                    border: '1px solid rgba(255, 59, 48, 0.3)',
                    borderRadius: '4px',
                    color: amb.status === 'BUSY' ? '#06090e' : '#ff3b30',
                    fontSize: '8px',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontWeight: 700,
                    padding: '2px 0',
                    cursor: 'pointer'
                  }}
                >
                  BUSY
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
