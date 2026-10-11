/**
 * AERT 3.0 Golden Slice Tactical Mission HUD
 * Operational Sector: Srikakulam District (AP-SKLM-EOC-01)
 * 
 * Signature 18-Step Live Emergency Orchestration Demo:
 * 01 CALL RECEIVED -> 02 TRANSCRIPTION -> 03 ENTITY EXTRACTION -> 04 LOCATION RESOLUTION
 * -> 05 INCIDENT CREATION -> 06 AI ASSESSMENT -> 07 RESPONSE RECOMMENDATION -> 08 OPERATOR APPROVAL
 * -> 09 DISPATCH -> 10 UNIT MOVES -> 11 ROAD EVENT -> 12 DETOUR RECALCULATION -> 13 HOSPITAL PRE-ALERT
 * -> 14 SCENE ARRIVAL -> 15 PATIENT TRANSPORT -> 16 HOSPITAL HANDOVER -> 17 INCIDENT CLOSURE -> 18 AFTER-ACTION SITREP
 */

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  X,
  CheckCircle2,
  AlertTriangle,
  Ambulance,
  Building2,
  PhoneCall,
  Activity,
  Send,
  Navigation,
  FileText
} from 'lucide-react';
import { soundManager } from '../../services/soundManager';
import { operationalStore } from '../../state/operationalState';

export const GOLDEN_STEPS = [
  { id: 1, title: '01. Incoming 108 Emergency Call', desc: 'Distress call from eyewitness on NH-16 Srikakulam Bypass.', icon: PhoneCall },
  { id: 2, title: '02. Audio Waveform Transcription', desc: 'Real-time voice synthesis resolves collision on bypass flyover.', icon: Activity },
  { id: 3, title: '03. AI Casualty & Hazard Extraction', desc: 'Extracted 6 casualties (2 critical), active fuel spill.', icon: Sparkles },
  { id: 4, title: '04. Srikakulam Landmark Resolution', desc: 'Geolocated to NH-16 Bypass Junction [83.9050°E, 18.3050°N].', icon: AlertTriangle },
  { id: 5, title: '05. Structured Incident Creation', desc: 'Created incident INC-1045 with CRITICAL rating.', icon: AlertTriangle },
  { id: 6, title: '06. Multi-Agent AI Assessment', desc: 'Evaluated nearest ALS units and trauma center capacities.', icon: Sparkles },
  { id: 7, title: '07. Response Recommendation', desc: 'AI recommends ALS Unit AMB-003 and RIMS Trauma Center.', icon: Send },
  { id: 8, title: '08. Human Operator Command Gate', desc: 'Human dispatcher signs off on recommended dispatch package.', icon: CheckCircle2 },
  { id: 9, title: '09. Emergency Dispatch Transmitted', desc: 'Dispatched AMB-003 with glowing cyan vector guidance.', icon: Send },
  { id: 10, title: '10. Live Ambulance Navigation', desc: 'Unit moves along NH-16 corridor with siren active.', icon: Navigation },
  { id: 11, title: '11. Dynamic Road Hazard Injected', desc: 'Accident debris reported blocking NH-16 Northbound connector.', icon: AlertTriangle },
  { id: 12, title: '12. Detour Route Recalculation', desc: 'Deterministic routing computes arterial bypass detour (+1.2 min).', icon: Navigation },
  { id: 13, title: '13. Hospital Pre-Alert Transmitted', desc: 'Transmitted sonar pre-alert to RIMS Srikakulam Trauma Bay.', icon: Building2 },
  { id: 14, title: '14. Scene Arrival & Stabilization', desc: 'AMB-003 on scene. Paramedics begin IV and oxygen stabilization.', icon: Ambulance },
  { id: 15, title: '15. High-Priority Patient Transport', desc: 'Transporting 2 critical trauma victims under ALS protocol.', icon: Ambulance },
  { id: 16, title: '16. Hospital Handover & Bed Allocation', desc: 'Patients received at RIMS Trauma Bay 1. Vitals telemetry transferred.', icon: Building2 },
  { id: 17, title: '17. Incident Closure', desc: 'Incident INC-1045 transitioned to RESOLVED. AMB-003 available.', icon: CheckCircle2 },
  { id: 18, title: '18. After-Action SITREP Generation', desc: 'Compiled explainable SITREP and total mission metrics.', icon: FileText }
];

export function GoldenSliceMission({
  isOpen = false,
  onClose = () => {},
  onStepChange = () => {}
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isPlayingAuto, setIsPlayingAuto] = useState(false);

  // Auto-start playback whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setIsPlayingAuto(true);
      onStepChange?.(1);
    } else {
      setIsPlayingAuto(false);
    }
  }, [isOpen]);

  // Notify parent on step change
  useEffect(() => {
    if (isOpen) {
      onStepChange?.(currentStep);
    }
  }, [currentStep, isOpen]);

  // Synchronize Operational Store at each step
  useEffect(() => {
    if (!isOpen) return;

    if (currentStep === 1) {
      soundManager.playIncomingAlert();
    } else if (currentStep === 4) {
      operationalStore.setSelectedEntity({
        type: 'incident',
        coordinates: [83.9050, 18.3050],
        data: {
          id: 'INC-1045',
          type: 'Major Highway Collision',
          severity: 'CRITICAL',
          location: 'NH-16 Bypass Junction',
          lifecycle_status: 'REPORTED',
          victims: 6,
          critical_victims: 2
        }
      });
      soundManager.playCriticalAlert();
    } else if (currentStep === 8) {
      soundManager.playCautionPing();
      setIsPlayingAuto(false); // Pause for human approval gate
    } else if (currentStep === 9) {
      soundManager.playDispatchChime();
      operationalStore.setActiveRoute({
        coordinates: [
          [83.8920, 18.2980],
          [83.8961, 18.2969],
          [83.9010, 18.3010],
          [83.9050, 18.3050]
        ]
      });
      operationalStore.transitionIncidentLifecycle('INC-1045', 'DISPATCHED', 'AMB-003', 'HOS-001');
    } else if (currentStep === 11) {
      soundManager.playWarningBeep();
      operationalStore.createRoadEvent({
        id: 'ROAD-009',
        type: 'ROAD_BLOCK',
        location: 'NH-16 Connector Debris',
        coordinates: [83.9010, 18.3010],
        severity: 'HIGH',
        is_active: true
      });
    } else if (currentStep === 13) {
      soundManager.playHospitalSonar();
      operationalStore.sendHospitalPreAlert({
        hospital_id: 'HOS-001',
        incident_id: 'INC-1045',
        estimated_eta_mins: 4.2
      });
    } else if (currentStep === 16) {
      soundManager.playSuccessChime();
    } else if (currentStep === 17) {
      soundManager.playResolvedTone();
      operationalStore.transitionIncidentLifecycle('INC-1045', 'RESOLVED', 'AMB-003', 'HOS-001');
    }
  }, [currentStep, isOpen]);

  // Auto-play timer
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

  const step = GOLDEN_STEPS[currentStep - 1];
  const StepIcon = step.icon;

  const handleNext = () => {
    if (currentStep < 18) {
      soundManager.playClickTone();
      setCurrentStep((p) => p + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      soundManager.playClickTone();
      setCurrentStep((p) => p - 1);
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '68px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'min(860px, calc(100vw - 32px))',
        background: 'rgba(7, 13, 22, 0.94)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(0, 240, 255, 0.35)',
        borderRadius: '12px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.9), 0 0 30px rgba(0, 240, 255, 0.18)',
        padding: '14px 18px',
        zIndex: 48,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}
    >
      {/* Top Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#ff9500', boxShadow: '0 0 8px #ff9500' }} />
          <span style={{ fontSize: '9.5px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 800, color: '#ff9500', letterSpacing: '0.05em' }}>
            [SIMULATED SCENARIO: NH-16 MULTI-VEHICLE COLLISION MISSION]
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '10px', fontFamily: 'JetBrains Mono, monospace', color: '#00f0ff', fontWeight: 800 }}>
            STEP {currentStep} OF 18
          </span>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#5a6878', cursor: 'pointer', padding: '2px' }}>
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Main Step Detail */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(0, 240, 255, 0.15)', border: '1px solid #00f0ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <StepIcon size={20} color="#00f0ff" />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, color: '#f2f5f8' }}>
              {step.title}
            </div>
            <div style={{ fontSize: '10.5px', fontFamily: 'Inter, sans-serif', color: '#9aa8b8', marginTop: '2px' }}>
              {step.desc}
            </div>
          </div>
        </div>

        {/* Playback Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          <button
            onClick={handlePrev}
            disabled={currentStep === 1}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '4px',
              padding: '6px 8px',
              color: currentStep === 1 ? '#5a6878' : '#f2f5f8',
              cursor: currentStep === 1 ? 'default' : 'pointer'
            }}
          >
            <ChevronLeft size={14} />
          </button>

          <button
            onClick={() => setIsPlayingAuto(!isPlayingAuto)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: isPlayingAuto ? 'rgba(255, 149, 0, 0.2)' : 'rgba(0, 240, 255, 0.2)',
              border: `1px solid ${isPlayingAuto ? '#ff9500' : '#00f0ff'}`,
              borderRadius: '4px',
              padding: '6px 12px',
              color: isPlayingAuto ? '#ff9500' : '#00f0ff',
              fontSize: '10px',
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            {isPlayingAuto ? <Pause size={13} /> : <Play size={13} />}
            <span>{isPlayingAuto ? 'PAUSE' : 'AUTO-PLAY'}</span>
          </button>

          <button
            onClick={handleNext}
            disabled={currentStep === 18}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '4px',
              padding: '6px 8px',
              color: currentStep === 18 ? '#5a6878' : '#f2f5f8',
              cursor: currentStep === 18 ? 'default' : 'pointer'
            }}
          >
            <ChevronRight size={14} />
          </button>

          {/* If step 8 (Human Approval), show prominent approval button */}
          {currentStep === 8 && (
            <button
              onClick={() => {
                soundManager.playDispatchChime();
                setCurrentStep(9);
                setIsPlayingAuto(true);
              }}
              style={{
                background: '#30d158',
                border: 'none',
                borderRadius: '4px',
                padding: '6px 12px',
                color: '#06090e',
                fontSize: '10px',
                fontFamily: 'JetBrains Mono, monospace',
                fontWeight: 800,
                cursor: 'pointer',
                marginLeft: '6px',
                boxShadow: '0 0 12px rgba(48, 209, 88, 0.8)'
              }}
            >
              APPROVE DISPATCH GATE
            </button>
          )}
        </div>
      </div>

      {/* Progress Track */}
      <div style={{ width: '100%', height: '3px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '2px', overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${(currentStep / 18) * 100}%`,
            background: 'linear-gradient(90deg, #00f0ff, #30d158)',
            transition: 'width 0.3s ease'
          }}
        />
      </div>
    </div>
  );
}
