/**
 * AERT 3.0 Workspace 02: LIVE RESPONSE
 * Operational Active Emergency Lifecycle Execution Room
 * Sector: Srikakulam District (AP-SKLM-EOC-01)
 * 
 * Compliant with Master Reconstruction Spec Screen 02:
 * - Focused Incident Header with Severity Badge
 * - 7-Stage Lifecycle Progress Bar
 * - Primary Unit & Receiving Hospital Telemetry Cards
 * - Tactical Action Button Matrix (Re-Route, Pre-Alert, Contact, Secondary)
 * - Real-Time Incident Event Stream
 */

import React, { useState } from 'react';
import { Badge } from '../../design-system/components/Badge';
import { Button } from '../../design-system/components/Button';
import { soundManager } from '../../services/soundManager';
import {
  Activity,
  Ambulance,
  Building2,
  CheckCircle2,
  Clock,
  Navigation,
  Send,
  AlertCircle,
  FileText,
  Radio,
  Phone,
  RotateCw,
  Plus
} from 'lucide-react';

const LIFECYCLE_STEPS = [
  { key: 'REPORTED', label: 'Reported' },
  { key: 'TRIAGE', label: 'Triage' },
  { key: 'DISPATCHED', label: 'Dispatched' },
  { key: 'ON_SCENE', label: 'On Scene' },
  { key: 'TRANSPORT', label: 'Transport' },
  { key: 'HOSPITAL', label: 'Hospital' },
  { key: 'RESOLVED', label: 'Resolved' }
];

export function LiveResponseWorkspace({
  selectedIncident = null,
  incidents = [],
  ambulances = [],
  hospitals = [],
  onTransitionLifecycle = () => {},
  onSendPreAlert = () => {},
  onSelectIncident = () => {},
  onOpenSitrep = () => {}
}) {
  const inc = selectedIncident || incidents.find((i) => i.status === 'ACTIVE') || incidents[0];

  const [activeStage, setActiveStage] = useState(2); // 'DISPATCHED'
  const [isAlerting, setIsAlerting] = useState(false);
  const [alertDone, setAlertDone] = useState(false);

  if (!inc) {
    return <div style={{ color: '#9aa8b8', padding: '20px' }}>No active incident selected.</div>;
  }

  const amb = ambulances.find((a) => a.id === inc.assigned_ambulance) || ambulances[0];
  const hos = hospitals.find((h) => h.id === inc.assigned_hospital) || hospitals[0];

  const handlePreAlert = () => {
    setIsAlerting(true);
    soundManager.playHospitalSonar();
    onSendPreAlert(hos.id);
    setTimeout(() => {
      setIsAlerting(false);
      setAlertDone(true);
      setTimeout(() => setAlertDone(false), 3000);
    }, 1100);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', height: '100%', overflowX: 'hidden' }}>
      {/* 1. Focused Incident Header */}
      <div style={{ background: 'rgba(12, 18, 28, 0.92)', border: '1px solid rgba(0, 240, 255, 0.35)', borderRadius: '8px', padding: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', color: '#00f0ff' }}>
              {inc.id}
            </span>
            <Badge variant={inc.severity === 'CRITICAL' ? 'critical' : 'warning'}>
              {inc.severity}
            </Badge>
          </div>
          <span style={{ fontSize: '10px', color: '#30d158', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>
            ● LIVE ACTIVE
          </span>
        </div>

        <div style={{ fontSize: '13px', fontWeight: 700, color: '#f2f5f8' }}>{inc.type}</div>
        <div style={{ fontSize: '10px', color: '#9aa8b8', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Navigation size={9} color="#00f0ff" />
          {inc.location}
        </div>

        {/* Lifecycle Progress Step Track */}
        <div style={{ marginTop: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            {LIFECYCLE_STEPS.map((st, i) => (
              <span
                key={st.key}
                style={{
                  fontSize: '7px',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontWeight: 700,
                  color: i <= activeStage ? '#00f0ff' : '#5a6878'
                }}
              >
                {st.label}
              </span>
            ))}
          </div>
          <div style={{ width: '100%', height: '3px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ width: `${((activeStage + 1) / LIFECYCLE_STEPS.length) * 100}%`, height: '100%', background: '#00f0ff', transition: 'width 0.25s ease' }} />
          </div>
        </div>
      </div>

      {/* 2. Primary Unit & Receiving Hospital Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
        {/* Primary Unit */}
        <div style={{ background: 'rgba(12, 18, 28, 0.85)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '6px', padding: '8px' }}>
          <div style={{ fontSize: '8px', color: '#9aa8b8', fontFamily: 'JetBrains Mono, monospace' }}>PRIMARY UNIT</div>
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#00f0ff', marginTop: '2px' }}>
            {amb.id} ({amb.type || 'ALS'})
          </div>
          <div style={{ fontSize: '9px', color: '#f2f5f8', marginTop: '4px' }}>Speed {amb.speed_kmh || 52} km/h</div>
          <div style={{ fontSize: '9px', color: '#30d158', fontWeight: 700 }}>ETA 3:12</div>
        </div>

        {/* Receiving Hospital */}
        <div style={{ background: 'rgba(12, 18, 28, 0.85)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '6px', padding: '8px' }}>
          <div style={{ fontSize: '8px', color: '#9aa8b8', fontFamily: 'JetBrains Mono, monospace' }}>RECEIVING HOSPITAL</div>
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#f2f5f8', marginTop: '2px' }}>
            {hos.name.split(' ')[0]} Hospital
          </div>
          <div style={{ fontSize: '9px', color: '#ff9500', marginTop: '4px' }}>ER Load 60%</div>
          <div style={{ fontSize: '9px', color: '#00f0ff', fontWeight: 700 }}>ICU 55%</div>
        </div>
      </div>

      {/* 3. Operational Action Matrix */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
        <button
          onClick={() => {
            soundManager.playClickTone();
            soundManager.playWarningBeep();
          }}
          style={{ background: 'rgba(12, 18, 28, 0.85)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '4px', padding: '6px 2px', color: '#9aa8b8', fontSize: '8px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}
        >
          <RotateCw size={11} color="#ff9500" />
          Re-Route
        </button>

        <button
          disabled={isAlerting}
          onClick={handlePreAlert}
          style={{ background: 'rgba(12, 18, 28, 0.85)', border: '1px solid rgba(0, 240, 255, 0.3)', borderRadius: '4px', padding: '6px 2px', color: '#00f0ff', fontSize: '8px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}
        >
          <Radio size={11} color="#00f0ff" />
          Pre-Alert
        </button>

        <button
          onClick={() => soundManager.playClickTone()}
          style={{ background: 'rgba(12, 18, 28, 0.85)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '4px', padding: '6px 2px', color: '#9aa8b8', fontSize: '8px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}
        >
          <Phone size={11} color="#30d158" />
          Contact
        </button>

        <button
          onClick={() => soundManager.playClickTone()}
          style={{ background: 'rgba(12, 18, 28, 0.85)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '4px', padding: '6px 2px', color: '#9aa8b8', fontSize: '8px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}
        >
          <Plus size={11} color="#00f0ff" />
          Secondary
        </button>
      </div>

      {/* 4. Event Log */}
      <div style={{ background: 'rgba(12, 18, 28, 0.88)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '6px', padding: '8px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ fontSize: '9px', fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', color: '#9aa8b8' }}>
            EVENT LOG
          </span>
          <span style={{ fontSize: '8px', color: '#00f0ff', cursor: 'pointer' }} onClick={onOpenSitrep}>VIEW FULL LOG</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '9px', color: '#9aa8b8', overflowY: 'auto' }}>
          <div><span style={{ color: '#00f0ff', fontFamily: 'JetBrains Mono, monospace' }}>02:24</span> Unit dispatched by operator</div>
          <div><span style={{ color: '#00f0ff', fontFamily: 'JetBrains Mono, monospace' }}>02:22</span> AI recommended AMB-001</div>
          <div><span style={{ color: '#00f0ff', fontFamily: 'JetBrains Mono, monospace' }}>02:21</span> Incident triaged as CRITICAL</div>
        </div>
      </div>
    </div>
  );
}
