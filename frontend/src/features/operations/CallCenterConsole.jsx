/**
 * AERT 3.0 Emergency Call Center Console
 * Operational Sector: Srikakulam District (AP-SKLM-EOC-01)
 * 
 * High-speed 108/911 Emergency Communications Intake Console:
 * - Live synthesized audio waveform visualizer
 * - Real-time caller metadata & tower location resolution
 * - Progressive AI casualty & hazard extraction
 * - 1-Click "Create Incident & Dispatch" command gate
 */

import React, { useState, useEffect } from 'react';
import {
  PhoneCall,
  Mic,
  Volume2,
  Sparkles,
  MapPin,
  AlertTriangle,
  Send,
  UserCheck,
  CheckCircle2,
  Clock,
  Radio
} from 'lucide-react';
import { soundManager } from '../../services/soundManager';

const SAMPLE_LIVE_CALL = {
  id: 'CALL-1045',
  caller: 'V. Raman (Eyewitness)',
  phone: '+91 98480 22341',
  duration: '01:42',
  status: 'ACTIVE CONNECTED',
  priority: 'CRITICAL',
  transcript: [
    { speaker: 'Caller', text: 'Hello 108, huge accident on NH-16 bypass flyover near Singupuram!' },
    { speaker: 'Operator', text: 'Understood. Are there trapped passengers or smoke?' },
    { speaker: 'Caller', text: 'Yes, an inter-district bus collided with a freight truck. Multiple people unconscious, fuel is dripping!' }
  ],
  intelligence: {
    type: 'Multi-Vehicle Highway Collision',
    location: 'NH-16 Bypass Flyover',
    landmark: 'Singupuram Intersection [83.9050°E, 18.3050°N]',
    casualties: '6 Total (2 Critical Red, 3 Yellow)',
    hazards: 'Active Fuel Leakage, Arterial Highway Blockage',
    confidence: 96
  }
};

export function CallCenterConsole({
  onCreateIncident = () => {},
  onSelectCall = () => {}
}) {
  const [callData, setCallData] = useState(SAMPLE_LIVE_CALL);
  const [waveformBars, setWaveformBars] = useState([15, 28, 45, 20, 60, 35, 70, 50, 25, 40, 55, 30]);
  const [isCreated, setIsCreated] = useState(false);

  // Dynamic Audio Waveform Animation
  useEffect(() => {
    const interval = setInterval(() => {
      setWaveformBars(Array.from({ length: 18 }, () => Math.floor(10 + Math.random() * 45)));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const handleCreate = () => {
    soundManager.playCriticalAlert();
    setIsCreated(true);
    onCreateIncident({
      id: 'INC-1045',
      type: callData.intelligence.type,
      severity: 'CRITICAL',
      location: callData.intelligence.location,
      coordinates: [83.9050, 18.3050],
      victims: 6,
      critical_victims: 2,
      hazard_type: callData.intelligence.hazards
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '10px' }}>
      {/* Console Header */}
      <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <PhoneCall size={14} color="#ff3b30" />
            <span style={{ fontSize: '9.5px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 800, color: '#ff3b30' }}>
              LIVE 108 EMERGENCY CALL INTAKE
            </span>
          </div>
          <span style={{ fontSize: '9px', fontFamily: 'JetBrains Mono, monospace', color: '#30d158', background: 'rgba(48, 209, 88, 0.1)', padding: '1px 5px', borderRadius: '3px' }}>
            {callData.status}
          </span>
        </div>
        <div style={{ fontSize: '13px', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, color: '#f2f5f8', marginTop: '2px' }}>
          {callData.caller} ({callData.phone})
        </div>
      </div>

      {/* Audio Waveform Synthesizer */}
      <div style={{ background: 'rgba(8, 14, 22, 0.9)', border: '1px solid rgba(0, 240, 255, 0.3)', borderRadius: '6px', padding: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Mic size={18} color="#00f0ff" />
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', flex: 1, height: '40px' }}>
          {waveformBars.map((height, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: `${height}px`,
                backgroundColor: i % 2 === 0 ? '#00f0ff' : '#64d2ff',
                borderRadius: '2px',
                transition: 'height 0.08s ease'
              }}
            />
          ))}
        </div>
        <span style={{ fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: '#00f0ff' }}>
          {callData.duration}
        </span>
      </div>

      {/* Real-Time Transcript Stream */}
      <div style={{ background: 'rgba(8, 14, 22, 0.75)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '6px', padding: '8px', flex: 1, overflowY: 'auto' }}>
        <div style={{ fontSize: '8.5px', fontFamily: 'JetBrains Mono, monospace', color: '#9aa8b8', marginBottom: '6px' }}>
          LIVE TRANSCRIPT STREAM:
        </div>
        {callData.transcript.map((line, idx) => (
          <div key={idx} style={{ marginBottom: '6px', fontSize: '11px', fontFamily: 'Inter, sans-serif' }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: line.speaker === 'Caller' ? '#ff9500' : '#00f0ff' }}>
              [{line.speaker}]:
            </span>{' '}
            <span style={{ color: '#f2f5f8' }}>{line.text}</span>
          </div>
        ))}
      </div>

      {/* AI Intelligence Extraction */}
      <div style={{ background: 'rgba(10, 18, 30, 0.9)', border: '1px solid rgba(0, 240, 255, 0.3)', borderRadius: '6px', padding: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
          <Sparkles size={12} color="#00f0ff" />
          <span style={{ fontSize: '9px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 800, color: '#00f0ff' }}>
            AI EXTRACTED CASUALTIES & HAZARDS ({callData.intelligence.confidence}% CONFIDENCE)
          </span>
        </div>
        <div style={{ fontSize: '11px', fontFamily: 'Inter, sans-serif', color: '#f2f5f8' }}>
          <strong>Location:</strong> {callData.intelligence.landmark}<br />
          <strong>Casualties:</strong> <span style={{ color: '#ff3b30', fontWeight: 700 }}>{callData.intelligence.casualties}</span><br />
          <strong>Hazards:</strong> <span style={{ color: '#ff9500' }}>{callData.intelligence.hazards}</span>
        </div>
      </div>

      {/* Convert to Incident Button */}
      <button
        onClick={handleCreate}
        disabled={isCreated}
        style={{
          background: isCreated ? 'rgba(48, 209, 88, 0.2)' : 'linear-gradient(135deg, rgba(255, 59, 48, 0.25), rgba(0, 240, 255, 0.25))',
          border: `1px solid ${isCreated ? '#30d158' : '#ff3b30'}`,
          borderRadius: '5px',
          padding: '10px',
          color: isCreated ? '#30d158' : '#f2f5f8',
          fontSize: '11px',
          fontFamily: 'JetBrains Mono, monospace',
          fontWeight: 800,
          cursor: isCreated ? 'default' : 'pointer'
        }}
      >
        {isCreated ? 'INCIDENT CREATED & DISPATCH TRANSMITTED' : 'CREATE INCIDENT & COMMENCE DISPATCH'}
      </button>
    </div>
  );
}
