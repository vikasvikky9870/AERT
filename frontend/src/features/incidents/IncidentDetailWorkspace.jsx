import React, { useState } from 'react';
import { Panel } from '../../design-system/components/Panel';
import { Badge } from '../../design-system/components/Badge';
import { Button } from '../../design-system/components/Button';
import {
  MapPin,
  Ambulance,
  Building2,
  Cpu,
  Clock,
  User,
  Shield,
  Send,
  CheckCircle,
  FileText,
  AlertTriangle,
} from 'lucide-react';

/**
 * Comprehensive Multi-Tab Incident Inspector Workspace
 */
export function IncidentDetailWorkspace({ incident, onClose, onDispatchUnit, onSendPreAlert }) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'ai' | 'units' | 'hospitals' | 'audit'

  if (!incident) return null;

  const mockUnits = [
    { id: 'AMB-003', name: 'NH-16 Highway Unit', distance: '1.2 km', eta: '1.8 mins', status: 'Available' },
    { id: 'AMB-001', name: 'GGH Central EMS 01', distance: '2.8 km', eta: '4.2 mins', status: 'Available' },
    { id: 'AMB-004', name: 'Collectorate Standby', distance: '3.4 km', eta: '5.1 mins', status: 'En Route' },
  ];

  const mockHospitals = [
    { id: 'HOS-001', name: 'RIMS Srikakulam Super Specialty', traumaLevel: 'Level 1 Trauma', capacity: '88% Occupied (4 ER Beds Open)', eta: '5.4 mins' },
    { id: 'HOS-002', name: 'GGH Srikakulam Govt Hospital', traumaLevel: 'Level 2 Trauma', capacity: '75% Occupied (8 ER Beds Open)', eta: '6.8 mins' },
  ];

  return (
    <div
      style={{
        position: 'absolute',
        top: '70px',
        right: '16px',
        width: '420px',
        bottom: '80px',
        zIndex: 850,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Panel
        title={incident.id}
        subtitle={incident.type}
        style={{ height: '100%' }}
        headerAction={
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            ✕
          </button>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '14px' }}>
          {/* Severity & Time Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 12px',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <Badge variant={incident.severity} pulse={incident.severity === 'critical'}>
              {incident.severity.toUpperCase()} SEVERITY
            </Badge>
            <div
              className="mono"
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-mono-cyan)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Clock size={12} />
              {incident.timeAgo}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div
            style={{
              display: 'flex',
              gap: '4px',
              borderBottom: '1px solid var(--border-subtle)',
              paddingBottom: '8px',
            }}
          >
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'ai', label: 'AI Analysis' },
              { id: 'units', label: 'Units' },
              { id: 'hospitals', label: 'Hospitals' },
              { id: 'audit', label: 'Audit' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1,
                  padding: '6px 0',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: activeTab === tab.id ? 'rgba(0, 240, 255, 0.15)' : 'transparent',
                  border: activeTab === tab.id ? '1px solid var(--border-glow-cyan)' : '1px solid transparent',
                  borderRadius: 'var(--radius-xs)',
                  color: activeTab === tab.id ? 'var(--accent-cyan)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Location Landmark
                </span>
                <div
                  style={{
                    fontSize: '0.88rem',
                    color: 'var(--text-primary)',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginTop: '2px',
                  }}
                >
                  <MapPin size={14} style={{ color: 'var(--accent-cyan)' }} />
                  {incident.location}
                </div>
                <div className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-mono-cyan)', marginTop: '2px' }}>
                  [{incident.coordinates?.join(', ')}]
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Incident Description
                </span>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {incident.description}
                </p>
              </div>

              {incident.caller && (
                <div
                  style={{
                    padding: '10px',
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>CALLER DETAILS</span>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: 500, marginTop: '2px' }}>
                    {incident.caller.name} ({incident.caller.phone})
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab Content 2: AI ANALYSIS */}
          {activeTab === 'ai' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div
                style={{
                  padding: '12px',
                  backgroundColor: 'rgba(0, 240, 255, 0.08)',
                  border: '1px solid var(--border-glow-cyan)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <Cpu size={16} style={{ color: 'var(--accent-cyan)' }} />
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--accent-cyan)' }}>
                    AI Recommendation Confidence: 94%
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  Recommend immediate dispatch of unit <strong>AMB-003</strong>. Route via NH-16 Corridor avoids current traffic congestion at 7 Road Junction.
                </p>
              </div>

              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Reasoning Breakdown
                </span>
                <ul style={{ margin: '6px 0 0 0', paddingLeft: '18px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  <li>AMB-003 is closest available unit (1.2 km away).</li>
                  <li>RIMS Hospital has active Level 1 trauma capability.</li>
                  <li>No road closures detected on primary route vector.</li>
                </ul>
              </div>
            </div>
          )}

          {/* Tab Content 3: RESPONDER UNITS */}
          {activeTab === 'units' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {mockUnits.map((u) => (
                <div
                  key={u.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {u.name}
                    </div>
                    <div className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-mono-cyan)' }}>
                      ETA: {u.eta} ({u.distance})
                    </div>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Send}
                    onClick={() => onDispatchUnit && onDispatchUnit(u, incident)}
                  >
                    Dispatch
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Tab Content 4: HOSPITALS */}
          {activeTab === 'hospitals' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {mockHospitals.map((h) => (
                <div
                  key={h.id}
                  style={{
                    padding: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {h.name}
                  </div>
                  <Badge variant="active" style={{ marginTop: '4px' }}>
                    {h.traumaLevel}
                  </Badge>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                    {h.capacity}
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={Building2}
                    style={{ marginTop: '8px', width: '100%' }}
                    onClick={() => onSendPreAlert && onSendPreAlert(h, incident)}
                  >
                    Send Trauma Pre-Alert
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Tab Content 5: AUDIT TIMELINE */}
          {activeTab === 'audit' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { time: '13:28:02', text: 'Incident created via AI Voice Call Intake' },
                { time: '13:28:15', text: 'AI Agent classified as Major Highway Collision (96% confidence)' },
                { time: '13:28:40', text: 'Geocoded location matched to NH-16 Bypass Junction' },
              ].map((log, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '10px', fontSize: '0.78rem' }}>
                  <span className="mono" style={{ color: 'var(--text-mono-cyan)' }}>
                    {log.time}
                  </span>
                  <span style={{ color: 'var(--text-secondary)' }}>{log.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Panel>
    </div>
  );
}
