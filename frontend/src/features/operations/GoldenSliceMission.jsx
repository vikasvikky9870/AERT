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
  onStepChange = () => {},
  scenario = null
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isPlayingAuto, setIsPlayingAuto] = useState(false);
  const [autoSpeedMs, setAutoSpeedMs] = useState(4500); // Default comfortable 4.5s per step (not rushed)

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
        coordinates: scenario?.center || [83.9050, 18.3050],
        data: {
          id: scenario?.incidentId || 'INC-1045',
          type: scenario?.type || 'Major Collision',
          severity: scenario?.severity || 'CRITICAL',
          location: scenario?.location || 'Srikakulam',
          lifecycle_status: 'REPORTED',
          victims: 4,
          critical_victims: 1
        }
      });
      soundManager.playCriticalAlert();
    } else if (currentStep === 8) {
      soundManager.playCautionPing();
      setIsPlayingAuto(false); // Pause for human approval gate
    } else if (currentStep === 9) {
      soundManager.playDispatchChime();
      if (scenario?.routes?.ROUTE_A?.waypoints) {
        operationalStore.setActiveRoute({
          coordinates: scenario.routes.ROUTE_A.waypoints
        });
      }
      operationalStore.transitionIncidentLifecycle(scenario?.incidentId || 'INC-1045', 'DISPATCHED', scenario?.assignedAmb || 'AMB-003', scenario?.hospitalId || 'HOS-001');
    } else if (currentStep === 11) {
      soundManager.playWarningBeep();
      operationalStore.createRoadEvent({
        id: scenario?.activeHazard?.id || 'ROAD-009',
        type: 'ROAD_BLOCK',
        location: scenario?.activeHazard?.title || 'Active Corridor Obstruction',
        coordinates: scenario?.activeHazard?.coords || [83.9010, 18.3010],
        severity: 'HIGH',
        is_active: true
      });
    } else if (currentStep === 13) {
      soundManager.playHospitalSonar();
      operationalStore.sendHospitalPreAlert({
        hospital_id: scenario?.hospitalId || 'HOS-001',
        incident_id: scenario?.incidentId || 'INC-1045',
        estimated_eta_mins: 3.8
      });
    } else if (currentStep === 16) {
      soundManager.playSuccessChime();
    } else if (currentStep === 17) {
      soundManager.playResolvedTone();
      operationalStore.transitionIncidentLifecycle(scenario?.incidentId || 'INC-1045', 'RESOLVED', scenario?.assignedAmb || 'AMB-003', scenario?.hospitalId || 'HOS-001');
    }
  }, [currentStep, isOpen, scenario]);

  // Auto-play timer with configurable speed (Slow 6.5s / Normal 4.5s / Fast 2.2s)
  useEffect(() => {
    let timer;
    if (isPlayingAuto && isOpen) {
      if (currentStep === 8) {
        setIsPlayingAuto(false); // Mandatory Human Gate pause
      } else if (currentStep < 18) {
        timer = setTimeout(() => {
          setCurrentStep((prev) => prev + 1);
        }, autoSpeedMs);
      } else {
        setIsPlayingAuto(false);
      }
    }
    return () => clearTimeout(timer);
  }, [isPlayingAuto, currentStep, isOpen, autoSpeedMs]);

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

  const getStepDesc = (stepObj) => {
    if (!scenario) return stepObj.desc;
    if (scenario.id === 'SCENARIO_5') {
      switch (stepObj.id) {
        case 1:
          return `Emergency distress: Elderly patient collapsed with acute airway arrest inside 3-meter wide residential alley in Chinnabazar Old Town.`;
        case 2:
          return `Voice transcript: Caller reports heavy ambulance cannot turn into Brahmin Street Lane 4 due to market pushcarts.`;
        case 3:
          return `AI Triage: Severe Anaphylaxis & Airway Obstruction. Detected constraint: 3m lane width precludes standard 5-ton ALS Tempo-Traveller vehicle.`;
        case 4:
          return `Landmark resolved: Chinnabazar Lane 4 [83.8938°E, 18.2938°N], 140m deep into pedestrian residential core.`;
        case 5:
          return `Incident INC-1088 logged with CRITICAL NARROW-STREET priority tag.`;
        case 6:
          return `Multi-Agent assessment: Computes 2-tier multimodal deployment: Paramedic First-Responder Bike + Staged ALS Unit.`;
        case 7:
          return `AI recommendation: Deploy BIKE-001 (rapid alley response with portable O2/AED) and stage AMB-004 at Old Bus Stand mouth.`;
        case 8:
          return `Human dispatcher approves Multimodal Narrow Street Emergency Plan.`;
        case 9:
          return `BIKE-001 deployed into alleyway; AMB-004 speeds to arterial rendezvous point.`;
        case 10:
          return `BIKE-001 navigates pedestrian street grid at 32 km/h; AMB-004 arrives at street mouth.`;
        case 11:
          return `Active Obstruction: Vendor stalls block 4-wheel entry. BIKE-001 weaves through 1.2m pedestrian pathway.`;
        case 12:
          return `Detour engine confirms clear footpath trajectory for compact 2-wheeler unit.`;
        case 13:
          return `Hospital pre-alert transmitted to GGH Srikakulam Emergency Resuscitation Unit.`;
        case 14:
          return `Paramedic Bike arrives at doorstep in 2.5 mins. Portable airway bag-valve mask ventilation initiated.`;
        case 15:
          return `Patient stabilized on narrow roll-in stretcher; transferred 120m out of alley to staged ALS Unit.`;
        case 16:
          return `Patient admitted to GGH Srikakulam Resuscitation Unit. Oxygen saturation restored to 98%.`;
        case 17:
          return `Incident INC-1088 marked RESOLVED. BIKE-001 and AMB-004 return to standby.`;
        case 18:
          return `SITREP logged: Multimodal narrow-street protocol saved 15.4 mins compared to stalled heavy vehicle entry.`;
        default:
          return stepObj.desc;
      }
    }
    switch (stepObj.id) {
      case 1:
        return `Emergency distress intake: ${scenario.title} at ${scenario.location}.`;
      case 3:
        return `AI Triage: ${scenario.casualties}. Hazard: ${scenario.hazard}.`;
      case 4:
        return `Landmark resolved: ${scenario.location} [${scenario.center[0]}°E, ${scenario.center[1]}°N].`;
      case 7:
        return `AI recommends unit ${scenario.assignedAmb} (${scenario.ambType}) and ${scenario.hospital}.`;
      case 10:
        return `Unit ${scenario.assignedAmb} navigating active corridor under ALS protocol.`;
      case 11:
        return `Active road hazard: ${scenario.activeHazard?.title || 'Road Obstruction'} reported on corridor.`;
      case 12:
        return `Deterministic detour computed around ${scenario.activeHazard?.title || 'Obstacle'} via safe arterial.`;
      case 13:
        return `Sonar pre-alert transmitted to ${scenario.hospital} ${scenario.traumaBay}.`;
      case 16:
        return `Patients transferred to ${scenario.hospital} ${scenario.traumaBay}. Telemetry synchronized.`;
      default:
        return stepObj.desc;
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '68px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'min(940px, calc(100vw - 32px))',
        background: 'rgba(7, 13, 22, 0.96)',
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
      {/* Top Banner with Speed Selector & Close */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#ff9500', boxShadow: '0 0 8px #ff9500' }} />
          <span style={{ fontSize: '9.5px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 800, color: '#ff9500', letterSpacing: '0.05em' }}>
            [SCENARIO: {scenario?.fullName?.toUpperCase() || 'NH-16 MULTI-VEHICLE COLLISION MISSION'}]
          </span>
        </div>

        {/* Speed Selector Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255, 255, 255, 0.05)', padding: '2px 4px', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <span style={{ fontSize: '9px', fontFamily: 'JetBrains Mono, monospace', color: '#9aa8b8', padding: '0 4px', fontWeight: 700 }}>SPEED:</span>
          {[
            { label: '🐢 Slow 6.5s', ms: 6500 },
            { label: '⏱️ Normal 4.5s', ms: 4500 },
            { label: '⚡ Fast 2.2s', ms: 2200 }
          ].map(spd => (
            <button
              key={spd.ms}
              onClick={() => {
                setAutoSpeedMs(spd.ms);
                soundManager.playClick?.();
              }}
              style={{
                background: autoSpeedMs === spd.ms ? 'rgba(0, 240, 255, 0.25)' : 'transparent',
                border: autoSpeedMs === spd.ms ? '1px solid #00f0ff' : 'none',
                color: autoSpeedMs === spd.ms ? '#00f0ff' : '#7a8898',
                fontSize: '9px',
                fontFamily: 'JetBrains Mono, monospace',
                fontWeight: 800,
                borderRadius: '4px',
                padding: '2px 6px',
                cursor: 'pointer'
              }}
            >
              {spd.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '10px', fontFamily: 'JetBrains Mono, monospace', color: '#00f0ff', fontWeight: 800 }}>
            STEP {currentStep} OF 18
          </span>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#5a6878', cursor: 'pointer', padding: '2px' }} title="Close Mission HUD">
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Interactive Step Jump Pills (1 through 18) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', overflowX: 'auto', paddingBottom: '2px' }}>
        {GOLDEN_STEPS.map((s) => {
          const isPassed = s.id < currentStep;
          const isCurrent = s.id === currentStep;
          return (
            <button
              key={s.id}
              onClick={() => {
                setCurrentStep(s.id);
                soundManager.playClick?.();
              }}
              title={s.title}
              style={{
                flex: 1,
                minWidth: '24px',
                height: '18px',
                borderRadius: '3px',
                border: isCurrent ? '1px solid #00f0ff' : isPassed ? '1px solid rgba(48, 209, 88, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                background: isCurrent ? 'rgba(0, 240, 255, 0.3)' : isPassed ? 'rgba(48, 209, 88, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                color: isCurrent ? '#00f0ff' : isPassed ? '#30d158' : '#5a6878',
                fontSize: '9px',
                fontFamily: 'JetBrains Mono, monospace',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0
              }}
            >
              {s.id}
            </button>
          );
        })}
      </div>

      {/* Main Step Detail */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(0, 240, 255, 0.15)', border: '1px solid #00f0ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <StepIcon size={20} color="#00f0ff" />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, color: '#f2f5f8' }}>
              {step.title}
            </div>
            <div style={{ fontSize: '10.5px', fontFamily: 'Inter, sans-serif', color: '#9aa8b8', marginTop: '2px', lineHeight: 1.35 }}>
              {getStepDesc(step)}
            </div>
          </div>
        </div>

        {/* Playback Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          <button
            onClick={handlePrev}
            disabled={currentStep === 1}
            title="Previous Step"
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
            title={isPlayingAuto ? "Pause Autoplay" : "Start Autoplay"}
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
            <span>{isPlayingAuto ? 'PAUSE' : 'PLAY'}</span>
          </button>

          <button
            onClick={handleNext}
            disabled={currentStep === 18}
            title="Next Step"
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
            transition: 'width 0.4s ease'
          }}
        />
      </div>
    </div>
  );
}
