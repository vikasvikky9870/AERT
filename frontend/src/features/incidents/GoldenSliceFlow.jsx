/**
 * AERT 3.0 Golden Vertical Slice Integration Mission
 * Operational Sector: Srikakulam District (AP-SKLM-EOC-01)
 * 
 * Bottom-Docked Tactical HUD — Preserves Full 2D/3D Map & Route Visibility
 * 
 * 18-Step Complete Emergency-Response Lifecycle:
 * 01 INCOMING CALL -> 02 TRANSCRIPTION -> 03 ENTITY EXTRACTION -> 04 LOCATION RESOLUTION
 * -> 05 INCIDENT CREATION -> 06 AI ASSESSMENT -> 07 RESPONSE RECOMMENDATION -> 08 HUMAN APPROVAL
 * -> 09 DISPATCH -> 10 LIVE AMBULANCE MOVEMENT -> 11 ROAD EVENT -> 12 DETOUR RECALCULATION
 * -> 13 HOSPITAL PRE-ALERT -> 14 ARRIVAL -> 15 PATIENT TRANSPORT -> 16 HOSPITAL HANDOVER
 * -> 17 INCIDENT CLOSURE -> 18 AFTER-ACTION REPORT
 */

import React, { useState, useEffect } from 'react';
import { Button } from '../../design-system/components/Button';
import { Badge } from '../../design-system/components/Badge';
import { soundManager } from '../../services/soundManager';
import {
  PhoneCall,
  Mic,
  Cpu,
  MapPin,
  Ambulance,
  AlertTriangle,
  Building2,
  CheckCircle2,
  FileText,
  Play,
  RotateCcw,
  Sparkles,
  Navigation,
  ArrowRight,
  X,
  Radio
} from 'lucide-react';

import { operationalStore } from '../../state/operationalState';

export const GOLDEN_STEPS = [
  { id: 1, title: '01. Incoming 108 Emergency Call', desc: 'Simulating high-priority distress call from NH-16 Srikakulam Bypass.' },
  { id: 2, title: '02. Real-Time Audio Transcription', desc: 'Synthesizing voice stream into operational text.' },
  { id: 3, title: '03. AI Entity & Casualty Extraction', desc: 'Extracted 6 casualties (2 critical), passenger bus collision.' },
  { id: 4, title: '04. Srikakulam Location Resolution', desc: 'Resolved landmark to NH-16 Bypass Junction [83.9050, 18.3050].' },
  { id: 5, title: '05. Structured Incident Creation', desc: 'Created incident record INC-1045 with CRITICAL severity rating.' },
  { id: 6, title: '06. Multi-Agent AI Assessment', desc: 'Multi-agent brain evaluates casualty triage and ALS requirements.' },
  { id: 7, title: '07. Response Recommendation', desc: 'AI recommends ALS Unit AMB-003 and RIMS Trauma Center.' },
  { id: 8, title: '08. Human Operator Approval Gate', desc: 'Operator signs off on recommended dispatch package.' },
  { id: 9, title: '09. Emergency Dispatch Transmitted', desc: 'Dispatched AMB-003 with glowing cyan vector guidance.' },
  { id: 10, title: '10. Live Ambulance Vector Navigation', desc: 'Responder moves along NH-16 corridor with siren active.' },
  { id: 11, title: '11. Dynamic Road Hazard Injected', desc: 'Accident debris reported blocking NH-16 Northbound connector.' },
  { id: 12, title: '12. Detour Route Recalculation', desc: 'Deterministic routing computes arterial bypass detour (+1.2 min).' },
  { id: 13, title: '13. Hospital Pre-Alert Transmitted', desc: 'Transmitted sonar pre-alert to RIMS Srikakulam Trauma Bay.' },
  { id: 14, title: '14. Scene Arrival & Stabilization', desc: 'AMB-003 on scene. Paramedics begin IV and oxygen stabilization.' },
  { id: 15, title: '15. High-Priority Patient Transport', desc: 'Transporting 2 critical trauma victims under ALS protocol.' },
  { id: 16, title: '16. Hospital Handover & Bed Allocation', desc: 'Patients received at RIMS Trauma Bay 1. Vital telemetry handed over.' },
  { id: 17, title: '17. Incident Closure', desc: 'Incident INC-1045 transitioned to RESOLVED. Unit AMB-003 back in service.' },
  { id: 18, title: '18. After-Action SITREP Generation', desc: 'Compiled explainable SITREP and total mission metrics.' }
];

export function GoldenSliceFlow({
  isOpen,
  onClose,
  onCompleteStep = () => {}
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isPlayingAuto, setIsPlayingAuto] = useState(false);

  // Synchronize Real Domain Mutations with Step Progression
  useEffect(() => {
    if (!isOpen) return;

    if (currentStep === 1) {
      soundManager.playCriticalAlert();
    } else if (currentStep === 5) {
      operationalStore.createIncident({
        id: 'INC-1045',
        type: 'Major Highway Collision',
        location: 'NH-16 Srikakulam Bypass Junction',
        coordinates: [83.9050, 18.3050],
        severity: 'CRITICAL',
        victims: 6,
        critical_victims: 2,
        hazard_type: 'Highway Entrapment / Fuel Spill',
        status: 'ACTIVE',
        lifecycle_status: 'VERIFIED',
        is_simulated: true,
      });
      operationalStore.setSelectedEntity({ type: 'incident', id: 'INC-1045', data: { id: 'INC-1045', coordinates: [83.9050, 18.3050] } });
    } else if (currentStep === 9) {
      operationalStore.dispatchAmbulance('INC-1045', 'AMB-003');
      soundManager.playDispatchChime();
    } else if (currentStep === 10) {
      operationalStore.transitionIncidentLifecycle('INC-1045', 'EN_ROUTE', 'AMB-003');
    } else if (currentStep === 11) {
      operationalStore.createRoadEvent({
        id: 'SIM-HAZ-001',
        type: 'ROAD_BLOCK',
        location: 'NH-16 Bridge Overpass',
        coordinates: [83.8961, 18.3000],
        delay_factor: 1.8,
        description: 'Overturned transport truck debris',
        is_simulated: true,
      });
      soundManager.playWarningBeep();
    } else if (currentStep === 12) {
      operationalStore.recalculateRoute('AMB-003', 'INC-1045', true);
    } else if (currentStep === 13) {
      operationalStore.sendHospitalPreAlert('HOS-002');
      soundManager.playHospitalSonar();
    } else if (currentStep === 14) {
      operationalStore.transitionIncidentLifecycle('INC-1045', 'ON_SCENE', 'AMB-003');
    } else if (currentStep === 15) {
      operationalStore.transitionIncidentLifecycle('INC-1045', 'TRANSPORTING', 'AMB-003', 'HOS-002');
    } else if (currentStep === 16) {
      operationalStore.transitionIncidentLifecycle('INC-1045', 'ARRIVED_HOSPITAL', 'AMB-003', 'HOS-002');
      soundManager.playHospitalSonar();
    } else if (currentStep === 17) {
      operationalStore.transitionIncidentLifecycle('INC-1045', 'RESOLVED', 'AMB-003', 'HOS-002');
      soundManager.playResolvedTone();
    } else if (currentStep === 18) {
      operationalStore.addLogEvent({
        timestamp: new Date().toISOString(),
        time: new Date().toLocaleTimeString('en-IN', { hour12: false }),
        level: 'SITREP',
        text: 'MISSION INC-1045 CONCLUDED. 6 casualties stabilized at RIMS Srikakulam Trauma Center. Zero protocol violations.',
      });
      soundManager.playSuccessChime();
    }

    onCompleteStep(currentStep);
  }, [currentStep, isOpen]);

  // Auto-play interval timer with Step 8 Human Approval Pause
  useEffect(() => {
    let timer;
    if (isPlayingAuto && isOpen) {
      if (currentStep === 8) {
        setIsPlayingAuto(false);
      } else if (currentStep < 18) {
        timer = setTimeout(() => {
          setCurrentStep((prev) => prev + 1);
        }, 2200);
      } else {
        setIsPlayingAuto(false);
      }
    }
    return () => clearTimeout(timer);
  }, [isPlayingAuto, currentStep, isOpen]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < 18) {
      soundManager.playClickTone();
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const stepInfo = GOLDEN_STEPS[currentStep - 1];

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '44px',
        left: '20px',
        right: '460px',
        maxWidth: '1200px',
        background: 'rgba(8, 14, 22, 0.94)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(0, 240, 255, 0.4)',
        borderRadius: '10px',
        boxShadow: '0 16px 36px rgba(0, 0, 0, 0.85)',
        zIndex: 35,
        display: 'flex',
        flexDirection: 'column',
        padding: '12px 16px',
        gap: '8px',
        animation: 'aertFadeSlideUp 200ms cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      {/* HUD Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Radio size={14} color="#00f0ff" />
          <span style={{ fontSize: '11px', fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', color: '#00f0ff', letterSpacing: '0.05em' }}>
            GOLDEN MISSION // STEP {currentStep < 10 ? `0${currentStep}` : currentStep} OF 18
          </span>
          <Badge variant="cyan">{Math.round((currentStep / 18) * 100)}% COMPLETE</Badge>
          <Badge variant="warning">SIMULATED SCENARIO</Badge>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '10px', color: '#9aa8b8', fontFamily: 'JetBrains Mono, monospace' }}>
            ROUTE & MAP PERSISTENT
          </span>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#9aa8b8', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            title="Close Golden Slice HUD (Escape)"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Main HUD Body: Active Step Narrative & Operational Context */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#f2f5f8', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {stepInfo.title}
          </div>
          <div style={{ fontSize: '12px', color: '#9aa8b8', marginTop: '2px', lineHeight: '1.3' }}>
            {stepInfo.desc}
          </div>
        </div>

        {/* Dynamic Human Gate or Accomplished Banner */}
        {currentStep === 8 && (
          <div style={{ background: 'rgba(255, 59, 48, 0.15)', border: '1px solid #ff3b30', borderRadius: '6px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '11px', color: '#ff3b30', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
              OPERATOR GATE REQUIRED:
            </span>
            <Button size="xs" variant="critical" onClick={handleNext}>
              Approve Dispatch
            </Button>
          </div>
        )}

        {currentStep === 18 && (
          <div style={{ background: 'rgba(48, 209, 88, 0.15)', border: '1px solid #30d158', borderRadius: '6px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '11px', color: '#30d158', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
              ✓ MISSION ACCOMPLISHED (5.4m)
            </span>
            <Button size="xs" variant="cyan" onClick={onClose}>
              Finish
            </Button>
          </div>
        )}

        {/* HUD Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Button size="xs" variant="ghost" onClick={handlePrev} disabled={currentStep === 1}>
            Prev
          </Button>
          <Button size="xs" variant="cyan" onClick={handleNext} disabled={currentStep === 18}>
            Next
          </Button>
          <Button
            size="xs"
            variant={isPlayingAuto ? 'warning' : 'primary'}
            onClick={() => setIsPlayingAuto(!isPlayingAuto)}
          >
            {isPlayingAuto ? 'Pause' : 'Auto-Play (G)'}
          </Button>
          <Button size="xs" variant="ghost" onClick={() => setCurrentStep(1)} title="Reset Mission">
            <RotateCcw size={12} />
          </Button>
        </div>
      </div>

      {/* Slim Progress Track */}
      <div style={{ width: '100%', height: '3px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{ width: `${(currentStep / 18) * 100}%`, height: '100%', background: '#00f0ff', transition: 'width 0.25s ease' }} />
      </div>
    </div>
  );
}
