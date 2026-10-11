/**
 * AERT 3.0 Incident Cockpit Experience
 * Operational Sector: Srikakulam District (AP-SKLM-EOC-01)
 * 
 * Transforms operational focus into a deep incident command cockpit:
 * - START Triage breakdown with live casualty metrics
 * - Responder telemetry & route corridor
 * - Hospital trauma status & pre-alert trigger
 * - Multi-Agent AI reasoning brief (What / Why / Evidence / Confidence)
 * - 7-Stage lifecycle transition & Operator Override
 */

import React, { useState } from 'react';
import {
  AlertTriangle,
  Ambulance,
  Building2,
  Cpu,
  Clock,
  Navigation,
  Send,
  Sparkles,
  CheckCircle2,
  X,
  FileText,
  Activity,
  ShieldAlert,
  ArrowRight,
  Shield
} from 'lucide-react';
import { soundManager } from '../../services/soundManager';

export function IncidentCockpit({
  incident = null,
  incidents = [],
  ambulances = [],
  hospitals = [],
  onSelectIncident = () => {},
  onClose = () => {},
  onDispatchUnit = () => {},
  onSendPreAlert = () => {},
  onTransitionLifecycle = () => {},
  onOpenOverride = () => {},
  onOpenSitrep = () => {}
}) {
  const [activeTab, setActiveTab] = useState('TRIAGE');
  const inc = incident || incidents[0];

  if (!inc) {
    return (
      <div style={{ padding: '20px', color: '#9aa8b8', textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>
        No active incident selected. Select an incident on the spatial canvas.
      </div>
    );
  }

  const assignedAmb = ambulances.find((a) => a.id === inc.assigned_ambulance) || ambulances[0];
  const assignedHos = hospitals.find((h) => h.id === inc.assigned_hospital) || hospitals[0];
  const isCritical = inc.severity === 'CRITICAL';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '10px' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '9px', fontFamily: 'JetBrains Mono, monospace', background: isCritical ? 'rgba(255, 59, 48, 0.2)' : 'rgba(255, 149, 0, 0.2)', color: isCritical ? '#ff3b30' : '#ff9500', padding: '1px 6px', borderRadius: '3px', fontWeight: 800, border: `1px solid ${isCritical ? 'rgba(255, 59, 48, 0.4)' : 'rgba(255, 149, 0, 0.4)'}` }}>
              {inc.severity} // {inc.lifecycle_status}
            </span>
            <span style={{ fontSize: '10px', fontFamily: 'JetBrains Mono, monospace', color: '#00f0ff' }}>
              {inc.id}
            </span>
          </div>

          <button
            onClick={() => onOpenSitrep(inc)}
            style={{
              background: 'rgba(0, 240, 255, 0.1)',
              border: '1px solid rgba(0, 240, 255, 0.3)',
              borderRadius: '4px',
              padding: '2px 6px',
              color: '#00f0ff',
              fontSize: '9px',
              fontFamily: 'JetBrains Mono, monospace',
              cursor: 'pointer'
            }}
          >
            SITREP
          </button>
        </div>

        <h2 style={{ margin: 0, fontSize: '14px', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, color: '#f2f5f8' }}>
          {inc.type}
        </h2>
        <div style={{ fontSize: '10px', fontFamily: 'Inter, sans-serif', color: '#9aa8b8', marginTop: '2px' }}>
          {inc.location} • Landmark: Near NH-16 Toll Plaza
        </div>
      </div>

      {/* Cockpit Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', gap: '4px' }}>
        {[
          { id: 'TRIAGE', label: 'Triage' },
          { id: 'RESPONDERS', label: 'Responders' },
          { id: 'MEDICAL', label: 'Hospital' },
          { id: 'AI_BRAIN', label: 'AI Rationale' },
          { id: 'TIMELINE', label: 'Audit Log' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid #00f0ff' : '2px solid transparent',
              color: activeTab === tab.id ? '#00f0ff' : '#9aa8b8',
              fontSize: '10px',
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: activeTab === tab.id ? 700 : 500,
              padding: '6px 8px',
              cursor: 'pointer',
              transition: 'all 0.12s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* 1. TRIAGE */}
        {activeTab === 'TRIAGE' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
              <div style={{ background: 'rgba(255, 59, 48, 0.1)', border: '1px solid rgba(255, 59, 48, 0.3)', borderRadius: '4px', padding: '6px', textAlign: 'center' }}>
                <span style={{ fontSize: '7.5px', fontFamily: 'JetBrains Mono, monospace', color: '#ff3b30', fontWeight: 800 }}>RED (CRIT)</span>
                <div style={{ fontSize: '15px', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, color: '#ff3b30' }}>{inc.critical_victims || 2}</div>
              </div>
              <div style={{ background: 'rgba(255, 149, 0, 0.1)', border: '1px solid rgba(255, 149, 0, 0.3)', borderRadius: '4px', padding: '6px', textAlign: 'center' }}>
                <span style={{ fontSize: '7.5px', fontFamily: 'JetBrains Mono, monospace', color: '#ff9500', fontWeight: 800 }}>YELLOW</span>
                <div style={{ fontSize: '15px', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, color: '#ff9500' }}>{(inc.victims || 4) - (inc.critical_victims || 2)}</div>
              </div>
              <div style={{ background: 'rgba(48, 209, 88, 0.1)', border: '1px solid rgba(48, 209, 88, 0.3)', borderRadius: '4px', padding: '6px', textAlign: 'center' }}>
                <span style={{ fontSize: '7.5px', fontFamily: 'JetBrains Mono, monospace', color: '#30d158', fontWeight: 800 }}>GREEN</span>
                <div style={{ fontSize: '15px', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, color: '#30d158' }}>1</div>
              </div>
              <div style={{ background: 'rgba(142, 142, 147, 0.1)', border: '1px solid rgba(142, 142, 147, 0.3)', borderRadius: '4px', padding: '6px', textAlign: 'center' }}>
                <span style={{ fontSize: '7.5px', fontFamily: 'JetBrains Mono, monospace', color: '#8e8e93', fontWeight: 800 }}>BLACK</span>
                <div style={{ fontSize: '15px', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, color: '#8e8e93' }}>0</div>
              </div>
            </div>

            <div style={{ background: 'rgba(8, 14, 22, 0.8)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '5px', padding: '8px' }}>
              <div style={{ fontSize: '9px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: '#00f0ff', marginBottom: '4px' }}>
                CLINICAL SYNOPSIS & HAZARD PROFILE
              </div>
              <div style={{ fontSize: '11px', fontFamily: 'Inter, sans-serif', color: '#f2f5f8', lineHeight: 1.4 }}>
                {inc.notes || 'Multi-vehicle highway impact involving inter-district bus and freight transport. Suspected cervical spine trauma and acute blood loss requiring immediate ALS stabilization.'}
              </div>
            </div>
          </div>
        )}

        {/* 2. RESPONDERS */}
        {activeTab === 'RESPONDERS' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ background: 'rgba(8, 14, 22, 0.8)', border: '1px solid rgba(0, 240, 255, 0.3)', borderRadius: '6px', padding: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Ambulance size={16} color="#00f0ff" />
                  <span style={{ fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 800, color: '#f2f5f8' }}>
                    {assignedAmb?.id}
                  </span>
                </div>
                <span style={{ fontSize: '9px', fontFamily: 'JetBrains Mono, monospace', color: '#30d158', fontWeight: 700 }}>
                  {assignedAmb?.status || 'EN_ROUTE'}
                </span>
              </div>
              <div style={{ fontSize: '10px', fontFamily: 'Inter, sans-serif', color: '#9aa8b8', marginTop: '4px' }}>
                Crew: 2 Paramedics (ALS Certified) • Base: Collectorate Depot
              </div>
            </div>
          </div>
        )}

        {/* 3. MEDICAL */}
        {activeTab === 'MEDICAL' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ background: 'rgba(8, 14, 22, 0.8)', border: '1px solid rgba(48, 209, 88, 0.3)', borderRadius: '6px', padding: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Building2 size={16} color="#30d158" />
                  <span style={{ fontSize: '11px', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, color: '#f2f5f8' }}>
                    {assignedHos?.name}
                  </span>
                </div>
                <span style={{ fontSize: '9px', fontFamily: 'JetBrains Mono, monospace', color: '#00f0ff', fontWeight: 700 }}>
                  ETA 4.2 MIN
                </span>
              </div>
              <div style={{ fontSize: '10px', fontFamily: 'Inter, sans-serif', color: '#9aa8b8', marginTop: '4px' }}>
                Level-1 Trauma Center • ER Capacity: {assignedHos?.er_capacity || 78}%
              </div>
            </div>
            <button
              onClick={() => onSendPreAlert(assignedHos?.id)}
              style={{
                background: 'rgba(255, 149, 0, 0.15)',
                border: '1px solid #ff9500',
                borderRadius: '5px',
                padding: '8px',
                color: '#ff9500',
                fontSize: '10px',
                fontFamily: 'JetBrains Mono, monospace',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              TRANSMIT TRAUMA PRE-ALERT NOW
            </button>
          </div>
        )}

        {/* 4. AI RATIONALE */}
        {activeTab === 'AI_BRAIN' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ background: 'rgba(10, 18, 30, 0.9)', border: '1px solid rgba(0, 240, 255, 0.3)', borderRadius: '6px', padding: '8px' }}>
              <span style={{ fontSize: '9px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 800, color: '#00f0ff' }}>
                QUALITATIVE REASONING
              </span>
              <div style={{ fontSize: '10px', fontFamily: 'Inter, sans-serif', color: '#f2f5f8', marginTop: '4px', lineHeight: 1.4 }}>
                Unit AMB-003 chosen over AMB-001 because AMB-003 is positioned 1.8km closer with direct arterial NH-16 vector access, circumventing Nagavali bridge slowdowns.
              </div>
            </div>
          </div>
        )}

        {/* 5. TIMELINE */}
        {activeTab === 'TIMELINE' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {(inc.timeline || [
              { timestamp: '14:30:12', event: 'Emergency 108 intake logged.' },
              { timestamp: '14:30:45', event: 'AI multi-agent dispatch generated.' },
              { timestamp: '14:31:10', event: 'Operator approved ALS unit dispatch.' }
            ]).map((t, idx) => (
              <div key={idx} style={{ fontSize: '9.5px', fontFamily: 'JetBrains Mono, monospace', color: '#9aa8b8', padding: '3px 0' }}>
                <strong style={{ color: '#00f0ff' }}>[{t.timestamp}]</strong> {t.event}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Footer: Status Transitions & Analysis */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '8px' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          {/* Status Transitions */}
          {inc.status !== 'RESOLVED' ? (
            <>
              <button
                onClick={() => {
                  soundManager.playDispatchChime();
                  onTransitionLifecycle(inc.id, 'DISPATCHED', assignedAmb?.id, assignedHos?.id);
                }}
                style={{
                  flex: 1,
                  background: inc.lifecycle_status === 'DISPATCHED' ? '#30d158' : 'rgba(48, 209, 88, 0.15)',
                  border: '1px solid #30d158',
                  borderRadius: '6px',
                  padding: '7px 4px',
                  color: inc.lifecycle_status === 'DISPATCHED' ? '#06090e' : '#30d158',
                  fontSize: '9.5px',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                DISPATCH
              </button>

              <button
                onClick={() => {
                  soundManager.playClickTone();
                  onTransitionLifecycle(inc.id, 'ON_SCENE', assignedAmb?.id, assignedHos?.id);
                }}
                style={{
                  flex: 1,
                  background: inc.lifecycle_status === 'ON_SCENE' ? '#00f0ff' : 'rgba(0, 240, 255, 0.15)',
                  border: '1px solid #00f0ff',
                  borderRadius: '6px',
                  padding: '7px 4px',
                  color: inc.lifecycle_status === 'ON_SCENE' ? '#06090e' : '#00f0ff',
                  fontSize: '9.5px',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                ON SCENE
              </button>

              <button
                onClick={() => {
                  soundManager.playClickTone();
                  onTransitionLifecycle(inc.id, 'RESOLVED', assignedAmb?.id, assignedHos?.id);
                }}
                style={{
                  flex: 1,
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '6px',
                  padding: '7px 4px',
                  color: '#9aa8b8',
                  fontSize: '9.5px',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                RESOLVE
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                soundManager.playClickTone();
                onTransitionLifecycle(inc.id, 'ACTIVE', assignedAmb?.id, assignedHos?.id);
              }}
              style={{
                flex: 1,
                background: 'rgba(255, 149, 0, 0.15)',
                border: '1px solid #ff9500',
                borderRadius: '6px',
                padding: '7px',
                color: '#ff9500',
                fontSize: '10px',
                fontFamily: 'JetBrains Mono, monospace',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              REOPEN INCIDENT
            </button>
          )}

          <button
            onClick={() => onOpenOverride(inc)}
            style={{
              background: 'rgba(255, 149, 0, 0.12)',
              border: '1px solid #ff9500',
              borderRadius: '6px',
              padding: '7px 10px',
              color: '#ff9500',
              fontSize: '10px',
              fontFamily: 'JetBrains Mono, monospace',
              cursor: 'pointer'
            }}
            title="Manual Operator Override"
          >
            OVERRIDE
          </button>
        </div>
      </div>
    </div>
  );
}
