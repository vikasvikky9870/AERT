/**
 * AERT 3.0 Contextual Intelligence Surface (Right Operational Instrument)
 * Operational Sector: Srikakulam District (AP-SKLM-EOC-01)
 * 
 * Dynamically reacts to selected entity:
 * - INCIDENT: Incident Cockpit (Triage, Responders, AI Recommendation, Lifecycle, Override)
 * - AMBULANCE: Responder Telemetry (Speed, Heading, Fuel, Oxygen, Unit Mission, Follow Unit)
 * - HOSPITAL: Medical Network Surface (Trauma Level, ED/ICU Load, Pre-Alert Action)
 * - ROAD / HAZARD: Obstacle telemetry & detour impact
 * - NO SELECTION: District Intelligence Briefing & Quick Triage Queue
 */

import React, { useState } from 'react';
import {
  AlertTriangle,
  Ambulance,
  Building2,
  Cpu,
  Navigation,
  Sparkles,
  CheckCircle2,
  Clock,
  Radio,
  Eye,
  Send,
  X,
  ChevronRight,
  Shield,
  Activity,
  Layers
} from 'lucide-react';
import { soundManager } from '../../services/soundManager';

export function ContextIntelligenceSurface({
  selectedEntity = null,
  incidents = [],
  ambulances = [],
  hospitals = [],
  roadEvents = [],
  onSelectEntity = () => {},
  onClearSelection = () => {},
  onDispatchUnit = () => {},
  onSendPreAlert = () => {},
  onTransitionLifecycle = () => {},
  onOpenOverride = () => {},
  onFollowUnit = () => {}
}) {
  const [activeTab, setActiveTab] = useState('BRIEF');

  // If an entity is selected, determine type
  const entityType = selectedEntity?.type;
  const entityData = selectedEntity?.data;

  // -------------------------------------------------------------
  // RENDER: INCIDENT INTELLIGENCE COCKPIT
  // -------------------------------------------------------------
  if (entityType === 'incident' && entityData) {
    const inc = entityData;
    const assignedAmb = ambulances.find((a) => a.id === inc.assigned_ambulance) || ambulances[0];
    const assignedHos = hospitals.find((h) => h.id === inc.assigned_hospital) || hospitals[0];
    const isCritical = inc.severity === 'CRITICAL';

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '10px' }}>
        {/* Header Strip */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '8px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
              <span style={{ fontSize: '9px', fontFamily: 'JetBrains Mono, monospace', background: isCritical ? 'rgba(255, 59, 48, 0.15)' : 'rgba(255, 149, 0, 0.15)', color: isCritical ? '#ff3b30' : '#ff9500', padding: '1px 5px', borderRadius: '3px', fontWeight: 800, border: `1px solid ${isCritical ? 'rgba(255, 59, 48, 0.4)' : 'rgba(255, 149, 0, 0.4)'}` }}>
                {inc.severity} // {inc.lifecycle_status}
              </span>
              <span style={{ fontSize: '10px', fontFamily: 'JetBrains Mono, monospace', color: '#64f6ff' }}>
                {inc.id}
              </span>
            </div>
            <h2 style={{ margin: 0, fontSize: '13px', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, color: '#f2f5f8', lineHeight: 1.2 }}>
              {inc.type}
            </h2>
            <div style={{ fontSize: '10px', fontFamily: 'Inter, sans-serif', color: '#9aa8b8', marginTop: '2px' }}>
              {inc.location}
            </div>
          </div>

          <button
            onClick={onClearSelection}
            style={{ background: 'transparent', border: 'none', color: '#5a6878', cursor: 'pointer', padding: '4px' }}
            title="Deselect Incident"
          >
            <X size={15} />
          </button>
        </div>

        {/* Casualty Matrix */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
          <div style={{ background: 'rgba(255, 59, 48, 0.08)', border: '1px solid rgba(255, 59, 48, 0.25)', borderRadius: '6px', padding: '6px', textAlign: 'center' }}>
            <div style={{ fontSize: '8px', fontFamily: 'JetBrains Mono, monospace', color: '#ff3b30', fontWeight: 700 }}>RED CRITICAL</div>
            <div style={{ fontSize: '16px', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, color: '#ff3b30' }}>{inc.critical_victims || 2}</div>
          </div>
          <div style={{ background: 'rgba(255, 149, 0, 0.08)', border: '1px solid rgba(255, 149, 0, 0.25)', borderRadius: '6px', padding: '6px', textAlign: 'center' }}>
            <div style={{ fontSize: '8px', fontFamily: 'JetBrains Mono, monospace', color: '#ff9500', fontWeight: 700 }}>YELLOW URGENT</div>
            <div style={{ fontSize: '16px', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, color: '#ff9500' }}>{(inc.victims || 4) - (inc.critical_victims || 2)}</div>
          </div>
          <div style={{ background: 'rgba(0, 240, 255, 0.08)', border: '1px solid rgba(0, 240, 255, 0.25)', borderRadius: '6px', padding: '6px', textAlign: 'center' }}>
            <div style={{ fontSize: '8px', fontFamily: 'JetBrains Mono, monospace', color: '#00f0ff', fontWeight: 700 }}>AI CONFIDENCE</div>
            <div style={{ fontSize: '16px', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, color: '#00f0ff' }}>{inc.location_confidence || 96}%</div>
          </div>
        </div>

        {/* Tactical AI Recommendation Brief */}
        <div style={{ background: 'rgba(10, 18, 30, 0.85)', border: '1px solid rgba(0, 240, 255, 0.3)', borderRadius: '6px', padding: '8px 10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Sparkles size={12} color="#00f0ff" />
              <span style={{ fontSize: '9.5px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 800, color: '#00f0ff' }}>
                AI DISPATCH RECOMMENDATION
              </span>
            </div>
            <span style={{ fontSize: '8.5px', fontFamily: 'JetBrains Mono, monospace', color: '#30d158' }}>96.4% MATCH</span>
          </div>

          <div style={{ fontSize: '10px', fontFamily: 'Inter, sans-serif', color: '#f2f5f8', lineHeight: 1.4 }}>
            Dispatch <strong>{assignedAmb?.id || 'AMB-003'}</strong> (ALS Unit, ETA 4.2m) via NH-16 corridor to <strong>{assignedHos?.name || 'RIMS Srikakulam'}</strong>.
          </div>

          <div style={{ marginTop: '6px', display: 'flex', gap: '6px' }}>
            <button
              onClick={() => {
                soundManager.playDispatchChime();
                onDispatchUnit(inc.id, assignedAmb?.id || 'AMB-003');
              }}
              style={{
                flex: 1,
                background: 'linear-gradient(135deg, rgba(48, 209, 88, 0.2), rgba(0, 240, 255, 0.2))',
                border: '1px solid #30d158',
                borderRadius: '4px',
                padding: '5px',
                color: '#30d158',
                fontSize: '10px',
                fontFamily: 'JetBrains Mono, monospace',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              APPROVE DISPATCH
            </button>

            <button
              onClick={() => onOpenOverride(inc)}
              style={{
                background: 'rgba(255, 149, 0, 0.1)',
                border: '1px solid #ff9500',
                borderRadius: '4px',
                padding: '5px 8px',
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

        {/* Assigned Unit & Receiving Facility */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {/* Unit Card */}
          <div style={{ background: 'rgba(8, 14, 22, 0.75)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '5px', padding: '6px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Ambulance size={14} color="#00f0ff" />
              <div>
                <div style={{ fontSize: '10px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: '#f2f5f8' }}>
                  {assignedAmb?.id} ({assignedAmb?.tier || 'ALS'})
                </div>
                <div style={{ fontSize: '9px', fontFamily: 'Inter, sans-serif', color: '#9aa8b8' }}>
                  Speed: {assignedAmb?.speed_kmh || 52} km/h • Fuel: {assignedAmb?.fuel_pct || 88}%
                </div>
              </div>
            </div>
            <button
              onClick={() => onFollowUnit(assignedAmb)}
              style={{ background: 'rgba(0, 240, 255, 0.1)', border: '1px solid rgba(0, 240, 255, 0.3)', borderRadius: '3px', padding: '3px 6px', color: '#00f0ff', fontSize: '8.5px', fontFamily: 'JetBrains Mono, monospace', cursor: 'pointer' }}
            >
              FOLLOW
            </button>
          </div>

          {/* Hospital Card */}
          <div style={{ background: 'rgba(8, 14, 22, 0.75)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '5px', padding: '6px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building2 size={14} color="#30d158" />
              <div>
                <div style={{ fontSize: '10px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: '#f2f5f8' }}>
                  {assignedHos?.name}
                </div>
                <div style={{ fontSize: '9px', fontFamily: 'Inter, sans-serif', color: '#9aa8b8' }}>
                  ER Load: {assignedHos?.er_capacity || 78}% • ICU: {assignedHos?.icu_beds_free || 4} Free
                </div>
              </div>
            </div>
            <button
              onClick={() => onSendPreAlert(assignedHos.id)}
              style={{ background: 'rgba(255, 149, 0, 0.15)', border: '1px solid #ff9500', borderRadius: '3px', padding: '3px 6px', color: '#ff9500', fontSize: '8.5px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, cursor: 'pointer' }}
            >
              PRE-ALERT
            </button>
          </div>
        </div>

        {/* Lifecycle Stage Controls */}
        <div style={{ background: 'rgba(8, 14, 22, 0.85)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '6px', padding: '8px' }}>
          <div style={{ fontSize: '9px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: '#9aa8b8', marginBottom: '6px' }}>
            TRANSITION LIFECYCLE
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {['DISPATCHED', 'ON_SCENE', 'TRANSPORTING', 'AT_HOSPITAL', 'RESOLVED'].map((stage) => {
              const isCurrent = inc.lifecycle_status === stage;
              return (
                <button
                  key={stage}
                  onClick={() => onTransitionLifecycle(inc.id, stage, assignedAmb?.id, assignedHos?.id)}
                  style={{
                    background: isCurrent ? 'rgba(0, 240, 255, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                    border: `1px solid ${isCurrent ? '#00f0ff' : 'rgba(255, 255, 255, 0.1)'}`,
                    borderRadius: '3px',
                    padding: '3px 6px',
                    fontSize: '8.5px',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontWeight: isCurrent ? 800 : 500,
                    color: isCurrent ? '#00f0ff' : '#9aa8b8',
                    cursor: 'pointer'
                  }}
                >
                  {stage}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: RESPONDER TELEMETRY SURFACE
  // -------------------------------------------------------------
  if (entityType === 'ambulance' && entityData) {
    const amb = entityData;
    const isEnRoute = amb.status === 'EN_ROUTE' || amb.status === 'TRANSPORTING';

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(0, 240, 255, 0.15)', border: '1px solid #00f0ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Ambulance size={16} color="#00f0ff" />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, color: '#f2f5f8' }}>
                {amb.id}
              </div>
              <div style={{ fontSize: '9.5px', fontFamily: 'JetBrains Mono, monospace', color: '#00f0ff' }}>
                {amb.tier || 'ALS ADVANCED LIFE SUPPORT'}
              </div>
            </div>
          </div>
          <button onClick={onClearSelection} style={{ background: 'transparent', border: 'none', color: '#5a6878', cursor: 'pointer' }}>
            <X size={15} />
          </button>
        </div>

        {/* Telemetry Metric Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
          <div style={{ background: 'rgba(8, 14, 22, 0.8)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '5px', padding: '6px' }}>
            <span style={{ fontSize: '8px', fontFamily: 'JetBrains Mono, monospace', color: '#9aa8b8' }}>GROUND SPEED</span>
            <div style={{ fontSize: '15px', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, color: '#00f0ff' }}>{amb.speed_kmh || 54} km/h</div>
          </div>
          <div style={{ background: 'rgba(8, 14, 22, 0.8)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '5px', padding: '6px' }}>
            <span style={{ fontSize: '8px', fontFamily: 'JetBrains Mono, monospace', color: '#9aa8b8' }}>FUEL / BATTERY</span>
            <div style={{ fontSize: '15px', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, color: '#30d158' }}>{amb.fuel_pct || 88}%</div>
          </div>
          <div style={{ background: 'rgba(8, 14, 22, 0.8)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '5px', padding: '6px' }}>
            <span style={{ fontSize: '8px', fontFamily: 'JetBrains Mono, monospace', color: '#9aa8b8' }}>OXYGEN RESERVE</span>
            <div style={{ fontSize: '15px', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, color: '#00f0ff' }}>94% PSI</div>
          </div>
          <div style={{ background: 'rgba(8, 14, 22, 0.8)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '5px', padding: '6px' }}>
            <span style={{ fontSize: '8px', fontFamily: 'JetBrains Mono, monospace', color: '#9aa8b8' }}>HEADING</span>
            <div style={{ fontSize: '15px', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, color: '#f2f5f8' }}>{amb.heading_deg || 142}° SE</div>
          </div>
        </div>

        {/* Current Incident Assignment */}
        <div style={{ background: 'rgba(8, 14, 22, 0.85)', border: '1px solid rgba(0, 240, 255, 0.2)', borderRadius: '6px', padding: '8px' }}>
          <div style={{ fontSize: '9px', fontFamily: 'JetBrains Mono, monospace', color: '#00f0ff', fontWeight: 700, marginBottom: '4px' }}>
            MISSION ASSIGNMENT
          </div>
          <div style={{ fontSize: '11px', fontFamily: 'Inter, sans-serif', color: '#f2f5f8' }}>
            {amb.current_incident_id ? `Assigned to ${amb.current_incident_id}` : 'Available for immediate dispatch'}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '6px', marginTop: 'auto' }}>
          <button
            onClick={() => onFollowUnit(amb)}
            style={{
              flex: 1,
              background: 'rgba(0, 240, 255, 0.15)',
              border: '1px solid #00f0ff',
              borderRadius: '5px',
              padding: '8px',
              color: '#00f0ff',
              fontSize: '11px',
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            LOCK CAMERA FOLLOW
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: MEDICAL NETWORK SURFACE
  // -------------------------------------------------------------
  if (entityType === 'hospital' && entityData) {
    const hos = entityData;
    const erLoad = hos.er_capacity || 78;
    const isPrealert = Boolean(hos.is_prealert_active || hos.active_pre_alerts > 0);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(48, 209, 88, 0.15)', border: '1px solid #30d158', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={16} color="#30d158" />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, color: '#f2f5f8' }}>
                {hos.name}
              </div>
              <div style={{ fontSize: '9.5px', fontFamily: 'JetBrains Mono, monospace', color: '#30d158' }}>
                {hos.trauma_level || 'LEVEL-1 TRAUMA CENTER'}
              </div>
            </div>
          </div>
          <button onClick={onClearSelection} style={{ background: 'transparent', border: 'none', color: '#5a6878', cursor: 'pointer' }}>
            <X size={15} />
          </button>
        </div>

        {/* Capacity Telemetry */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
          <div style={{ background: 'rgba(8, 14, 22, 0.8)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '5px', padding: '6px' }}>
            <span style={{ fontSize: '8px', fontFamily: 'JetBrains Mono, monospace', color: '#9aa8b8' }}>ER OCCUPANCY</span>
            <div style={{ fontSize: '15px', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, color: erLoad > 80 ? '#ff9500' : '#30d158' }}>{erLoad}%</div>
          </div>
          <div style={{ background: 'rgba(8, 14, 22, 0.8)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '5px', padding: '6px' }}>
            <span style={{ fontSize: '8px', fontFamily: 'JetBrains Mono, monospace', color: '#9aa8b8' }}>ICU BEDS AVAIL</span>
            <div style={{ fontSize: '15px', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, color: '#00f0ff' }}>{hos.icu_beds_free || 4} / 16</div>
          </div>
          <div style={{ background: 'rgba(8, 14, 22, 0.8)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '5px', padding: '6px' }}>
            <span style={{ fontSize: '8px', fontFamily: 'JetBrains Mono, monospace', color: '#9aa8b8' }}>VENTILATORS</span>
            <div style={{ fontSize: '15px', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, color: '#30d158' }}>2 Ready</div>
          </div>
          <div style={{ background: 'rgba(8, 14, 22, 0.8)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '5px', padding: '6px' }}>
            <span style={{ fontSize: '8px', fontFamily: 'JetBrains Mono, monospace', color: '#9aa8b8' }}>O-NEG BLOOD</span>
            <div style={{ fontSize: '15px', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, color: '#ff3b30' }}>12 Pints</div>
          </div>
        </div>

        {/* Pre-Alert Button */}
        <div style={{ marginTop: 'auto' }}>
          <button
            onClick={() => onSendPreAlert(hos.id)}
            style={{
              width: '100%',
              background: isPrealert ? 'rgba(0, 240, 255, 0.2)' : 'linear-gradient(135deg, rgba(255, 149, 0, 0.25), rgba(255, 59, 48, 0.25))',
              border: `1px solid ${isPrealert ? '#00f0ff' : '#ff9500'}`,
              borderRadius: '5px',
              padding: '10px',
              color: isPrealert ? '#00f0ff' : '#ff9500',
              fontSize: '11px',
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <Activity size={15} />
            <span>{isPrealert ? 'PRE-ALERT ACTIVE (ALERTED)' : 'TRANSMIT TRAUMA PRE-ALERT'}</span>
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: DEFAULT NO SELECTION (SYSTEM & DISTRICT SITUATIONAL BRIEF)
  // -------------------------------------------------------------
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '10px' }}>
      {/* Sector Overview Header */}
      <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '8px' }}>
        <div style={{ fontSize: '9px', fontFamily: 'JetBrains Mono, monospace', color: '#00f0ff', fontWeight: 800, letterSpacing: '0.05em' }}>
          SECTOR INTELLIGENCE
        </div>
        <h2 style={{ margin: 0, fontSize: '13px', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, color: '#f2f5f8' }}>
          Srikakulam Operations Status
        </h2>
        <div style={{ fontSize: '10px', fontFamily: 'Inter, sans-serif', color: '#9aa8b8' }}>
          Select any incident, ambulance, or hospital on the map for contextual telemetry.
        </div>
      </div>

      {/* Priority Incident Queue */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '9.5px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: '#9aa8b8' }}>
            ACTIVE INCIDENTS ({incidents.length})
          </span>
          <span style={{ fontSize: '8.5px', fontFamily: 'JetBrains Mono, monospace', color: '#00f0ff' }}>
            CLICK TO FOCUS
          </span>
        </div>

        {incidents.slice(0, 4).map((inc) => {
          const isCritical = inc.severity === 'CRITICAL';
          return (
            <div
              key={inc.id}
              onClick={() => onSelectEntity({ type: 'incident', coordinates: inc.coordinates, data: inc })}
              style={{
                background: 'rgba(8, 14, 22, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '5px',
                padding: '6px 8px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#00f0ff'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '9px', fontFamily: 'JetBrains Mono, monospace', color: isCritical ? '#ff3b30' : '#ff9500', fontWeight: 800 }}>
                  {inc.id} • {inc.severity}
                </span>
                <span style={{ fontSize: '8px', fontFamily: 'JetBrains Mono, monospace', color: '#64f6ff' }}>
                  {inc.lifecycle_status}
                </span>
              </div>
              <div style={{ fontSize: '11px', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, color: '#f2f5f8', marginTop: '2px' }}>
                {inc.type}
              </div>
              <div style={{ fontSize: '9px', fontFamily: 'Inter, sans-serif', color: '#9aa8b8' }}>
                {inc.location}
              </div>
            </div>
          );
        })}
      </div>

      {/* Fleet Readiness Summary */}
      <div style={{ background: 'rgba(8, 14, 22, 0.85)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '6px', padding: '8px' }}>
        <div style={{ fontSize: '9.5px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: '#00f0ff', marginBottom: '6px' }}>
          FLEET READINESS
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', fontFamily: 'JetBrains Mono, monospace' }}>
          <span style={{ color: '#30d158' }}>3 AVAILABLE</span>
          <span style={{ color: '#00f0ff' }}>1 EN ROUTE</span>
          <span style={{ color: '#ff9500' }}>1 ON SCENE</span>
        </div>
      </div>
    </div>
  );
}
