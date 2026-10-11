/**
 * AERT 3.0 Workspace 03: CALL CENTER WORKSTATION
 * Tactical 911/108 Real-Time Emergency Call Intake Surface
 * Sector: Srikakulam District (AP-SKLM-EOC-01)
 * 
 * Compliant with Master Reconstruction Spec Screen 03:
 * - Active Call Card with Audio Waveform
 * - Call Intelligence Extracted Metadata
 * - Live Transcript Stream
 * - 1-Click Action Gate (Create Incident / Escalate)
 */

import React, { useState, useEffect } from 'react';
import { Badge } from '../../design-system/components/Badge';
import { Button } from '../../design-system/components/Button';
import { soundManager } from '../../services/soundManager';
import {
  PhoneCall,
  Radio,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Mic,
  Volume2,
  Cpu,
  UserCheck,
  Play,
  RotateCcw,
  Plus
} from 'lucide-react';

const SAMPLE_CALL_QUEUE = [
  {
    id: 'CALL-1045',
    caller: 'V. Raman (Eyewitness)',
    phone: '+91 98480 22341',
    duration: '02:18',
    status: 'ACTIVE',
    priority: 'CRITICAL',
    transcript: [
      { speaker: 'Caller', text: 'Multiple vehicles have collided near the bypass junction!' },
      { speaker: 'Operator', text: 'How many persons are injured?' },
      { speaker: 'Caller', text: 'I can see at least two people on the road, some vehicles are damaged badly.' }
    ],
    intelligence: {
      type: 'Road Traffic Collision',
      location: 'NH-16 Bypass Junction',
      landmark: 'Near Singupuram Flyover',
      casualties: '2-3 (Reported)',
      hazards: 'Fuel Spill, Traffic Blockage',
      confidence: 88,
      coordinates: [83.9050, 18.3050]
    }
  }
];

export function CallCenterWorkspace({
  onCreateIncident = () => {},
  onSelectCall = () => {}
}) {
  const [selectedCall, setSelectedCall] = useState(SAMPLE_CALL_QUEUE[0]);
  const [isCreated, setIsCreated] = useState(false);
  const [waveformData, setWaveformData] = useState([14, 28, 42, 18, 55, 34, 60, 42, 20, 38, 50, 24]);

  useEffect(() => {
    const interval = setInterval(() => {
      setWaveformData(Array.from({ length: 16 }, () => Math.floor(8 + Math.random() * 40)));
    }, 120);
    return () => clearInterval(interval);
  }, []);

  const handleCreateIncident = () => {
    soundManager.playCriticalAlert();
    setIsCreated(true);
    const intel = selectedCall.intelligence;
    onCreateIncident({
      type: intel.type,
      location: intel.location,
      coordinates: intel.coordinates,
      severity: 'CRITICAL',
      victims: 3,
      critical_victims: 2,
      hazard_type: intel.hazards,
      location_confidence: intel.confidence,
      notes: `Verified from 108 Call ${selectedCall.id} (${selectedCall.caller}).`
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%', overflowX: 'hidden' }}>
      {/* 1. Active Call Card */}
      <div style={{ background: 'rgba(12, 18, 28, 0.92)', border: '1px solid rgba(0, 240, 255, 0.35)', borderRadius: '8px', padding: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '10px', fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', color: '#00f0ff', letterSpacing: '0.05em' }}>
            ACTIVE CALL
          </span>
          <Badge variant="critical">● LIVE</Badge>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#f2f5f8' }}>{selectedCall.caller}</div>
            <div style={{ fontSize: '11px', color: '#9aa8b8', fontFamily: 'JetBrains Mono, monospace', marginTop: '2px' }}>
              {selectedCall.phone}
            </div>
          </div>
          <span style={{ fontSize: '12px', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: '#00f0ff' }}>
            {selectedCall.duration}
          </span>
        </div>

        {/* Audio Waveform */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', height: '40px', background: 'rgba(0, 0, 0, 0.4)', borderRadius: '6px', marginTop: '10px', padding: '0 8px' }}>
          {waveformData.map((h, i) => (
            <div
              key={i}
              style={{
                width: '4px',
                height: `${h}px`,
                background: '#00f0ff',
                borderRadius: '2px',
                transition: 'height 0.1s ease',
                opacity: 0.85
              }}
            />
          ))}
        </div>
      </div>

      {/* 2. Call Intelligence Extracted Metadata */}
      <div style={{ background: 'rgba(12, 18, 28, 0.88)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', padding: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '10px', fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', color: '#00f0ff', letterSpacing: '0.05em' }}>
            CALL INTELLIGENCE
          </span>
          <Badge variant="cyan">{selectedCall.intelligence.confidence}% CONFIDENCE</Badge>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#9aa8b8' }}>Incident Type</span>
            <span style={{ fontWeight: 700, color: '#f2f5f8' }}>{selectedCall.intelligence.type}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#9aa8b8' }}>Location</span>
            <span style={{ fontWeight: 700, color: '#f2f5f8' }}>{selectedCall.intelligence.location}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#9aa8b8' }}>Landmark</span>
            <span style={{ color: '#9aa8b8' }}>{selectedCall.intelligence.landmark}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#9aa8b8' }}>Casualties</span>
            <span style={{ fontWeight: 700, color: '#ff3b30' }}>{selectedCall.intelligence.casualties}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#9aa8b8' }}>Hazards</span>
            <span style={{ color: '#ff9500' }}>{selectedCall.intelligence.hazards}</span>
          </div>
        </div>
      </div>

      {/* 3. Live Transcript Stream */}
      <div style={{ background: 'rgba(12, 18, 28, 0.88)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', padding: '12px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: '10px', fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', color: '#9aa8b8', marginBottom: '8px', letterSpacing: '0.05em' }}>
          LIVE TRANSCRIPT
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', maxHeight: '160px' }}>
          {selectedCall.transcript.map((msg, i) => {
            const isCaller = msg.speaker === 'Caller';
            return (
              <div
                key={i}
                style={{
                  background: isCaller ? 'rgba(0, 240, 255, 0.08)' : 'rgba(255, 255, 255, 0.05)',
                  borderLeft: isCaller ? '3px solid #00f0ff' : '3px solid #30d158',
                  borderRadius: '4px',
                  padding: '6px 8px',
                  fontSize: '11px'
                }}
              >
                <div style={{ fontSize: '9px', fontWeight: 700, color: isCaller ? '#00f0ff' : '#30d158', marginBottom: '2px' }}>
                  {msg.speaker}
                </div>
                <div style={{ color: '#f2f5f8', lineHeight: '1.3' }}>{msg.text}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Action Buttons */}
      <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
        <Button
          size="sm"
          variant={isCreated ? 'active' : 'cyan'}
          disabled={isCreated}
          onClick={handleCreateIncident}
          style={{ flex: 1 }}
        >
          {isCreated ? '✓ Incident Created' : '+ Create Incident'}
        </Button>
        <Button size="sm" variant="warning" onClick={() => soundManager.playWarningBeep()}>
          Escalate
        </Button>
      </div>
    </div>
  );
}
