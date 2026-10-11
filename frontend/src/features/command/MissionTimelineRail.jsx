/**
 * AERT 3.0 Interactive Mission Timeline Rail (Lifecycle Record)
 * Operational Sector: Srikakulam District (AP-SKLM-EOC-01)
 * 
 * Compliant with Section 8 of Master Flagship Specification:
 * - Real interactive record of incident lifecycle:
 *   Call -> Triage -> Incident -> Dispatch -> Movement -> Route -> Hospital -> Handover -> Closure
 * - Reads directly off incident status transitions & timeline
 * - Current stage animates in with glowing cyan beacon; completed stages settle into quiet green resolved state
 */

import React, { useState } from 'react';
import {
  PhoneCall,
  Activity,
  AlertOctagon,
  Send,
  Navigation,
  GitBranch,
  Building2,
  CheckCircle2,
  Lock,
  ChevronUp,
  ChevronDown,
  Clock
} from 'lucide-react';
import { soundManager } from '../../services/soundManager';

const LIFECYCLE_STAGES = [
  { id: 'CALL', label: 'CALL', icon: PhoneCall, desc: '108 Intake' },
  { id: 'TRIAGE', label: 'TRIAGE', icon: Activity, desc: 'START Priority' },
  { id: 'INCIDENT', label: 'INCIDENT', icon: AlertOctagon, desc: 'Verified on Map' },
  { id: 'DISPATCH', label: 'DISPATCH', icon: Send, desc: 'Unit Assigned' },
  { id: 'MOVEMENT', label: 'MOVEMENT', icon: Navigation, desc: 'En Route vector' },
  { id: 'ROUTE', label: 'ROUTE', icon: GitBranch, desc: 'On Scene' },
  { id: 'HOSPITAL', label: 'HOSPITAL', icon: Building2, desc: 'ER / Pre-Alert' },
  { id: 'HANDOVER', label: 'HANDOVER', icon: CheckCircle2, desc: 'Trauma Bay' },
  { id: 'CLOSURE', label: 'CLOSURE', icon: Lock, desc: 'Resolved' }
];

export function MissionTimelineRail({
  currentStage = null,
  onSelectStage = () => {},
  selectedIncident = null,
  eventStream = []
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Derive stage from incident if not explicitly forced
  const deriveStage = () => {
    if (currentStage) return currentStage;
    if (!selectedIncident) return 'MOVEMENT';

    const st = selectedIncident.lifecycle_status || selectedIncident.status || 'VERIFIED';
    switch (st) {
      case 'CALL_RECEIVED':
        return 'CALL';
      case 'TRIAGE':
        return 'TRIAGE';
      case 'VERIFIED':
        return 'INCIDENT';
      case 'DISPATCH_PENDING':
      case 'DISPATCHED':
        return 'DISPATCH';
      case 'EN_ROUTE':
        return 'MOVEMENT';
      case 'ON_SCENE':
        return 'ROUTE';
      case 'TRANSPORTING':
      case 'ARRIVED_HOSPITAL':
        return 'HOSPITAL';
      case 'RESOLVED':
        return 'CLOSURE';
      default:
        return 'MOVEMENT';
    }
  };

  const activeStageId = deriveStage();
  const activeIndex = LIFECYCLE_STAGES.findIndex((s) => s.id === activeStageId);

  const incidentTimeline = selectedIncident?.timeline || [
    { timestamp: '14:30:12', event: 'Emergency 108 intake registered via CAD.' },
    { timestamp: '14:30:45', event: 'AI multi-agent assessment completed.' },
    { timestamp: '14:31:10', event: 'Operator approved ALS unit dispatch.' }
  ];

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        zIndex: 40,
        pointerEvents: 'auto',
        maxWidth: '94vw'
      }}
    >
      {/* Expanded Milestone Drawer */}
      {isExpanded && (
        <div
          style={{
            marginBottom: '8px',
            width: '740px',
            maxWidth: '92vw',
            background: 'rgba(11, 14, 20, 0.95)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(0, 240, 255, 0.35)',
            borderRadius: '12px',
            padding: '12px 16px',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.9), 0 0 20px rgba(0, 240, 255, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            animation: 'fadeIn 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '6px' }}>
            <span style={{ fontSize: '10px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 800, color: '#00f0ff' }}>
              INCIDENT TIMELINE AUDIT: {selectedIncident?.id || 'INC-1042'} // {selectedIncident?.type || 'EMERGENCY'}
            </span>
            <span style={{ fontSize: '9px', fontFamily: 'JetBrains Mono, monospace', color: '#9aa8b8' }}>
              SECTOR: SRIKAKULAM EOC
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '120px', overflowY: 'auto' }}>
            {incidentTimeline.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: '8px', fontSize: '9.5px', fontFamily: 'Inter, sans-serif' }}>
                <span style={{ color: '#00f0ff', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>
                  [{item.timestamp}]
                </span>
                <span style={{ color: '#f2f5f8' }}>{item.event}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Interactive Mission Timeline Dock */}
      <div
        style={{
          background: 'rgba(11, 14, 20, 0.9)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '30px',
          padding: '4px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.85), 0 0 1px 1px rgba(255, 255, 255, 0.06)'
        }}
      >
        <span style={{ fontSize: '9px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 800, color: '#00f0ff', letterSpacing: '0.04em' }}>
          {selectedIncident?.id || 'INC-1042'}
        </span>

        <div style={{ height: '14px', width: '1px', background: 'rgba(255, 255, 255, 0.15)', margin: '0 2px' }} />

        {/* 9 Interactive Stages */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          {LIFECYCLE_STAGES.map((stage, idx) => {
            const isCurrent = stage.id === activeStageId;
            const isPassed = idx < activeIndex;
            const Icon = stage.icon;

            return (
              <button
                key={stage.id}
                onClick={() => {
                  soundManager.playClickTone();
                  onSelectStage(stage.id);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: isCurrent ? 'rgba(0, 240, 255, 0.2)' : isPassed ? 'rgba(48, 209, 88, 0.1)' : 'transparent',
                  border: isCurrent ? '1px solid #00f0ff' : '1px solid transparent',
                  borderRadius: '16px',
                  padding: '3px 7px',
                  color: isCurrent ? '#00f0ff' : isPassed ? '#30d158' : '#5a6878',
                  fontSize: '8.5px',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontWeight: isCurrent ? 800 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                title={`${stage.label} — ${stage.desc}`}
              >
                <Icon size={10} color={isCurrent ? '#00f0ff' : isPassed ? '#30d158' : '#5a6878'} />
                <span>{stage.label}</span>
              </button>
            );
          })}
        </div>

        <div style={{ height: '14px', width: '1px', background: 'rgba(255, 255, 255, 0.15)', margin: '0 2px' }} />

        {/* Expand / Collapse Toggle */}
        <button
          onClick={() => {
            soundManager.playClickTone();
            setIsExpanded(!isExpanded);
          }}
          style={{ background: 'transparent', border: 'none', color: '#9aa8b8', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2px' }}
          title={isExpanded ? 'Collapse Log' : 'Expand Milestone Log'}
        >
          {isExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>
      </div>
    </div>
  );
}
