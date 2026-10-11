/**
 * AERT 3.0 Workspace 01: OVERWATCH COMMAND CENTER
 * Operational Contextual Command Surface with Micro-Transition Easing
 * Sector: Srikakulam District, Andhra Pradesh, India (AP-SKLM-EOC-01)
 */

import React, { useState } from 'react';
import { Badge } from '../../design-system/components/Badge';
import { Button } from '../../design-system/components/Button';
import {
  AlertTriangle,
  Ambulance,
  Building2,
  Cpu,
  Radio,
  Zap,
  CheckCircle,
  Clock,
  Navigation,
  Activity,
  ArrowRight,
  Shield,
  X,
  Send
} from 'lucide-react';

export function OverwatchWorkspace({
  incidents = [],
  ambulances = [],
  hospitals = [],
  roadEvents = [],
  selectedEntity = null,
  onSelectIncident = () => {},
  onSelectAmbulance = () => {},
  onSelectHospital = () => {},
  onClearSelection = () => {},
  onOpenCallCenter = () => {},
  onOpenSimulation = () => {},
  onDispatchUnit = () => {},
  onSendPreAlert = () => {}
}) {
  const activeIncidents = incidents.filter((i) => i.status === 'ACTIVE');
  const criticalCount = activeIncidents.filter((i) => i.severity === 'CRITICAL').length;
  const availableAmbs = ambulances.filter((a) => a.status === 'AVAILABLE').length;

  const [isTransmittingPreAlert, setIsTransmittingPreAlert] = useState(false);
  const [preAlertSent, setPreAlertSent] = useState(false);

  const handleHospitalPreAlert = (hosId) => {
    setIsTransmittingPreAlert(true);
    onSendPreAlert(hosId);
    setTimeout(() => {
      setIsTransmittingPreAlert(false);
      setPreAlertSent(true);
      setTimeout(() => setPreAlertSent(false), 3500);
    }, 1100);
  };

  // Micro-transition container style for smooth contextual morphing
  const transitionContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    height: '100%',
    animation: 'aertFadeSlideIn 150ms cubic-bezier(0.16, 1, 0.3, 1)',
  };

  // 1. Contextual View: Incident Selected
  if (selectedEntity?.type === 'incident') {
    const inc = selectedEntity.data || activeIncidents[0];
    const isCritical = inc.severity === 'CRITICAL';

    return (
      <div key={`incident-${inc.id}`} style={transitionContainerStyle}>
        {/* Contextual Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', color: '#00f0ff' }}>{inc.id}</span>
            <Badge variant={isCritical ? 'critical' : 'warning'}>{inc.severity}</Badge>
            <span style={{ fontSize: '11px', color: '#9aa8b8', fontFamily: 'JetBrains Mono, monospace' }}>{inc.lifecycle_status}</span>
          </div>
          <button
            onClick={onClearSelection}
            style={{ background: 'transparent', border: 'none', color: '#9aa8b8', cursor: 'pointer', padding: '4px' }}
            title="Return to District Overview"
          >
            <X size={16} />
          </button>
        </div>

        {/* Incident Title & Location */}
        <div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#f2f5f8', marginBottom: '4px' }}>{inc.type}</div>
          <div style={{ fontSize: '12px', color: '#9aa8b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Navigation size={12} color="#00f0ff" />
            {inc.location}
          </div>
        </div>

        {/* Triage Sizing Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          <div style={{ background: 'rgba(12, 18, 28, 0.85)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '6px', padding: '8px' }}>
            <div style={{ fontSize: '10px', color: '#9aa8b8', fontFamily: 'JetBrains Mono, monospace' }}>CASUALTIES</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#f2f5f8', marginTop: '2px' }}>{inc.victims}</div>
            <div style={{ fontSize: '9px', color: '#ff3b30' }}>{inc.critical_victims || 0} Critical</div>
          </div>

          <div style={{ background: 'rgba(12, 18, 28, 0.85)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '6px', padding: '8px' }}>
            <div style={{ fontSize: '10px', color: '#9aa8b8', fontFamily: 'JetBrains Mono, monospace' }}>TIER REQ</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#00f0ff', marginTop: '2px' }}>{inc.critical_victims > 0 ? 'ALS' : 'BLS'}</div>
            <div style={{ fontSize: '9px', color: '#9aa8b8' }}>Advanced Life</div>
          </div>

          <div style={{ background: 'rgba(12, 18, 28, 0.85)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '6px', padding: '8px' }}>
            <div style={{ fontSize: '10px', color: '#9aa8b8', fontFamily: 'JetBrains Mono, monospace' }}>ASSIGNED</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: inc.assigned_ambulance ? '#30d158' : '#ff9500', marginTop: '4px' }}>
              {inc.assigned_ambulance || 'UNASSIGNED'}
            </div>
            <div style={{ fontSize: '9px', color: '#9aa8b8' }}>Fleet Unit</div>
          </div>
        </div>

        {/* AI Recommendation Action Gate */}
        <div style={{ background: 'linear-gradient(135deg, rgba(8, 18, 32, 0.95), rgba(12, 24, 40, 0.95))', border: '1px solid rgba(0, 240, 255, 0.35)', borderRadius: '8px', padding: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Cpu size={14} color="#00f0ff" />
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#00f0ff', fontFamily: 'JetBrains Mono, monospace' }}>
                AI DISPATCH RECOMMENDATION
              </span>
            </div>
            <Badge variant="cyan">96% CONFIDENCE</Badge>
          </div>

          <div style={{ fontSize: '12px', color: '#f2f5f8', lineHeight: '1.4', marginBottom: '10px' }}>
            Dispatch <strong>AMB-003 (ALS)</strong> from NH-16 Highway Post. Estimated ETA: <strong>3.8 mins</strong> (2.8 km). Receiving Trauma Center: <strong>RIMS Srikakulam</strong>.
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <Button size="sm" variant="cyan" onClick={() => onDispatchUnit(inc.id, 'AMB-003')}>
              Approve Dispatch
            </Button>
            <Button size="sm" variant="ghost" onClick={onClearSelection}>
              Back to Overview
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Contextual View: Ambulance Selected
  if (selectedEntity?.type === 'ambulance') {
    const amb = selectedEntity.data || ambulances[0];
    const isAvail = amb.status === 'AVAILABLE';

    return (
      <div key={`ambulance-${amb.id}`} style={transitionContainerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px', fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', color: '#00f0ff' }}>{amb.id}</span>
            <Badge variant={isAvail ? 'active' : 'warning'}>{amb.status}</Badge>
            <Badge variant="cyan">{amb.type}</Badge>
          </div>
          <button onClick={onClearSelection} style={{ background: 'transparent', border: 'none', color: '#9aa8b8', cursor: 'pointer' }}>
            <X size={16} />
          </button>
        </div>

        {/* Telemetry Meters */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          <div style={{ background: 'rgba(12, 18, 28, 0.85)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '6px', padding: '8px' }}>
            <div style={{ fontSize: '10px', color: '#9aa8b8', fontFamily: 'JetBrains Mono, monospace' }}>SPEED</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#f2f5f8', marginTop: '2px' }}>{amb.speed_kmh || 45} <span style={{ fontSize: '10px', color: '#9aa8b8' }}>km/h</span></div>
          </div>
          <div style={{ background: 'rgba(12, 18, 28, 0.85)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '6px', padding: '8px' }}>
            <div style={{ fontSize: '10px', color: '#9aa8b8', fontFamily: 'JetBrains Mono, monospace' }}>FUEL</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#30d158', marginTop: '2px' }}>{amb.fuel_pct || 92}%</div>
          </div>
          <div style={{ background: 'rgba(12, 18, 28, 0.85)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '6px', padding: '8px' }}>
            <div style={{ fontSize: '10px', color: '#9aa8b8', fontFamily: 'JetBrains Mono, monospace' }}>O2 READY</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#00f0ff', marginTop: '2px' }}>100%</div>
          </div>
        </div>

        {/* Real-Time Patient Telemetry Stream */}
        <div style={{ background: 'rgba(8, 14, 22, 0.92)', border: '1px solid rgba(0, 240, 255, 0.25)', borderRadius: '6px', padding: '10px' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, color: '#00f0ff', fontFamily: 'JetBrains Mono, monospace', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Activity size={12} color="#00f0ff" />
            LIVE PATIENT VITALS TELEMETRY (ALS STREAM)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', textAlign: 'center' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '4px', padding: '4px' }}>
              <div style={{ fontSize: '9px', color: '#9aa8b8' }}>HEART RATE</div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#30d158' }}>84 <span style={{ fontSize: '8px' }}>BPM</span></div>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '4px', padding: '4px' }}>
              <div style={{ fontSize: '9px', color: '#9aa8b8' }}>SpO2</div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#00f0ff' }}>98%</div>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '4px', padding: '4px' }}>
              <div style={{ fontSize: '9px', color: '#9aa8b8' }}>NIBP</div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#f2f5f8' }}>120/80</div>
            </div>
          </div>
        </div>

        <div style={{ background: 'rgba(12, 18, 28, 0.85)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '6px', padding: '10px', fontSize: '12px' }}>
          <div style={{ color: '#9aa8b8', marginBottom: '4px' }}>Assigned Paramedic Team:</div>
          <div style={{ fontWeight: 600, color: '#f2f5f8' }}>{amb.crew || 'Paramedic Unit Bravo (NH-16 Fast Post)'}</div>
          <div style={{ color: '#5a6878', fontSize: '10px', marginTop: '4px' }}>Stationed Post: NH-16 Srikakulam Emergency Post</div>
        </div>

        <Button size="sm" variant="ghost" onClick={onClearSelection}>
          Back to Overview
        </Button>
      </div>
    );
  }

  // 3. Contextual View: Hospital Selected with Sonar Pre-Alert Feedback
  if (selectedEntity?.type === 'hospital') {
    const hos = selectedEntity.data || hospitals[0];

    return (
      <div key={`hospital-${hos.id}`} style={transitionContainerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building2 size={16} color="#00f0ff" />
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#f2f5f8' }}>{hos.name}</span>
          </div>
          <button onClick={onClearSelection} style={{ background: 'transparent', border: 'none', color: '#9aa8b8', cursor: 'pointer' }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          <div style={{ background: 'rgba(12, 18, 28, 0.85)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '6px', padding: '8px' }}>
            <div style={{ fontSize: '10px', color: '#9aa8b8', fontFamily: 'JetBrains Mono, monospace' }}>ED LOAD</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#f2f5f8', marginTop: '2px' }}>{hos.ed_load_pct || 64}%</div>
          </div>
          <div style={{ background: 'rgba(12, 18, 28, 0.85)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '6px', padding: '8px' }}>
            <div style={{ fontSize: '10px', color: '#9aa8b8', fontFamily: 'JetBrains Mono, monospace' }}>ICU BEDS</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#30d158', marginTop: '2px' }}>{hos.icu_beds || 8}</div>
          </div>
          <div style={{ background: 'rgba(12, 18, 28, 0.85)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '6px', padding: '8px' }}>
            <div style={{ fontSize: '10px', color: '#9aa8b8', fontFamily: 'JetBrains Mono, monospace' }}>VENTS</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#00f0ff', marginTop: '2px' }}>{hos.ventilators || 11}</div>
          </div>
        </div>

        {preAlertSent ? (
          <div style={{ background: 'rgba(48, 209, 88, 0.15)', border: '1px solid #30d158', borderRadius: '6px', padding: '10px', fontSize: '12px', color: '#30d158', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={16} color="#30d158" />
            <span>✓ SONAR PRE-ALERT TRANSMITTED (BAY 1 ALLOCATED)</span>
          </div>
        ) : (
          <Button
            size="sm"
            variant="cyan"
            disabled={isTransmittingPreAlert}
            onClick={() => handleHospitalPreAlert(hos.id)}
          >
            {isTransmittingPreAlert ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Radio size={14} className="animate-spin" />
                TRANSMITTING SONAR SIGNAL...
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Send size={14} />
                Transmit Sonar Pre-Alert
              </span>
            )}
          </Button>
        )}

        <Button size="sm" variant="ghost" onClick={onClearSelection}>
          Back to Overview
        </Button>
      </div>
    );
  }

  // 4. Default View: Global District Overview
  return (
    <div key="overview-root" style={transitionContainerStyle}>
      {/* District Readiness Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
        <div style={{ background: 'rgba(255, 59, 48, 0.12)', border: '1px solid rgba(255, 59, 48, 0.3)', borderRadius: '6px', padding: '10px' }}>
          <div style={{ fontSize: '10px', color: '#ff3b30', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>CRITICAL</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#f2f5f8', marginTop: '2px' }}>{criticalCount}</div>
        </div>

        <div style={{ background: 'rgba(0, 240, 255, 0.08)', border: '1px solid rgba(0, 240, 255, 0.2)', borderRadius: '6px', padding: '10px' }}>
          <div style={{ fontSize: '10px', color: '#00f0ff', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>FLEET</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#f2f5f8', marginTop: '2px' }}>{availableAmbs}/{ambulances.length}</div>
        </div>

        <div style={{ background: 'rgba(48, 209, 88, 0.08)', border: '1px solid rgba(48, 209, 88, 0.2)', borderRadius: '6px', padding: '10px' }}>
          <div style={{ fontSize: '10px', color: '#30d158', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>TRAUMA</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#f2f5f8', marginTop: '2px' }}>94%</div>
        </div>

        <div style={{ background: 'rgba(255, 149, 0, 0.08)', border: '1px solid rgba(255, 149, 0, 0.2)', borderRadius: '6px', padding: '10px' }}>
          <div style={{ fontSize: '10px', color: '#ff9500', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>HAZARDS</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#f2f5f8', marginTop: '2px' }}>{roadEvents.filter((r) => r.is_active).length}</div>
        </div>
      </div>

      {/* AI Orchestrator Sector Recommendation */}
      <div style={{ background: 'rgba(12, 18, 28, 0.9)', border: '1px solid rgba(0, 240, 255, 0.25)', borderRadius: '8px', padding: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Cpu size={14} color="#00f0ff" />
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#00f0ff', fontFamily: 'JetBrains Mono, monospace' }}>
              SECTOR REPOSITIONING RECOMMENDATION
            </span>
          </div>
          <Badge variant="cyan">96% CONFIDENCE</Badge>
        </div>
        <p style={{ fontSize: '12px', color: '#f2f5f8', lineHeight: '1.4', margin: '0 0 8px 0' }}>
          Reposition <strong>AMB-002</strong> to North Srikakulam Corridor to eliminate a 14-minute response gap while AMB-003 is on active assignment.
        </p>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button size="xs" variant="cyan" onClick={() => onSelectAmbulance(ambulances[1])}>
            Review Unit
          </Button>
          <Button size="xs" variant="ghost" onClick={onOpenSimulation}>
            Simulate
          </Button>
        </div>
      </div>

      {/* Active Incidents Queue */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#9aa8b8', fontFamily: 'JetBrains Mono, monospace' }}>
            ACTIVE INCIDENTS ({activeIncidents.length})
          </span>
          <Button size="xs" variant="primary" onClick={onOpenCallCenter}>
            + Intake
          </Button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {activeIncidents.map((inc) => (
            <div
              key={inc.id}
              onClick={() => onSelectIncident(inc)}
              style={{
                background: 'rgba(12, 18, 28, 0.85)',
                border: `1px solid ${inc.severity === 'CRITICAL' ? 'rgba(255, 59, 48, 0.4)' : 'rgba(255, 255, 255, 0.08)'}`,
                borderRadius: '6px',
                padding: '10px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#00f0ff')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = inc.severity === 'CRITICAL' ? 'rgba(255, 59, 48, 0.4)' : 'rgba(255, 255, 255, 0.08)')}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', color: '#00f0ff' }}>{inc.id}</span>
                  <Badge variant={inc.severity === 'CRITICAL' ? 'critical' : 'warning'}>{inc.severity}</Badge>
                </div>
                <span style={{ fontSize: '10px', color: '#9aa8b8', fontFamily: 'JetBrains Mono, monospace' }}>{inc.lifecycle_status}</span>
              </div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#f2f5f8' }}>{inc.type}</div>
              <div style={{ fontSize: '10px', color: '#9aa8b8', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Navigation size={10} color="#00f0ff" />
                {inc.location}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
