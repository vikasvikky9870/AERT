import React, { useState, useEffect } from 'react';
import { Modal } from '../../design-system/components/Modal';
import { Button } from '../../design-system/components/Button';
import { Input } from '../../design-system/components/Input';
import { Badge } from '../../design-system/components/Badge';
import { KNOWN_LANDMARKS } from '../../config/geography';
import { PhoneCall, Mic, Sparkles, MapPin, AlertTriangle, User, Check, Shield } from 'lucide-react';

/**
 * AI-Assisted Emergency Call Intake Wizard Modal
 */
export function IntakeModal({ isOpen, onClose, onSubmitIncident }) {
  const [step, setStep] = useState('transcribing'); // 'transcribing' | 'review' | 'submitted'
  const [callerName, setCallerName] = useState('K. Ramesh');
  const [callerPhone, setCallerPhone] = useState('+91 98480 12345');
  const [incidentType, setIncidentType] = useState('Major Highway Collision');
  const [selectedLandmark, setSelectedLandmark] = useState(KNOWN_LANDMARKS[1]); // NH-16 Bypass
  const [severity, setSeverity] = useState('critical');
  const [injuriesCount, setInjuriesCount] = useState(3);
  const [hazardDetails, setHazardDetails] = useState('Fuel Leak & Entrapment');
  const [transcript, setTranscript] = useState(
    'Caller reports a head-on collision between a cargo truck and an auto-rickshaw near NH-16 Srikakulam Bypass Junction. At least 3 individuals injured, 2 unconscious. Fuel leaking onto highway lane.'
  );

  // Simulate AI Auto-Parser Stream
  useEffect(() => {
    if (isOpen) {
      setStep('transcribing');
      const timer = setTimeout(() => {
        setStep('review');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSubmit = () => {
    const newInc = {
      id: `INC-${Math.floor(1000 + Math.random() * 9000)}`,
      type: incidentType,
      severity,
      location: selectedLandmark.name,
      coordinates: selectedLandmark.coordinates,
      timeAgo: 'Just now',
      assignedUnit: null,
      hospital: 'RIMS Srikakulam',
      description: transcript,
      caller: { name: callerName, phone: callerPhone },
      injuries: injuriesCount,
      hazard: hazardDetails,
    };
    onSubmitIncident(newInc);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="EMERGENCY CALL INTAKE & AI TRIAGE WIZARD" maxWidth="680px">
      {step === 'transcribing' ? (
        <div style={{ textAlign: 'center', padding: '36px 20px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(0, 240, 255, 0.15)',
              border: '1px solid var(--accent-cyan)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              boxShadow: '0 0 20px rgba(0, 240, 255, 0.3)',
              animation: 'pulse 1s infinite',
            }}
          >
            <Mic size={28} style={{ color: 'var(--accent-cyan)' }} />
          </div>
          <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.1rem' }}>
            TRANSCRIBING & EXTRACTING SPATIAL ENTITIES...
          </h3>
          <p className="mono" style={{ fontSize: '0.8rem', color: 'var(--text-mono-cyan)', marginTop: '8px' }}>
            AI Agent analyzing emergency audio stream from Srikakulam 108 Dispatch Center...
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Transcript Box */}
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: 'rgba(0, 240, 255, 0.05)',
              border: '1px solid var(--border-glow-cyan)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Sparkles size={16} style={{ color: 'var(--accent-cyan)' }} />
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--accent-cyan)' }}>
                AI VOICE CALL TRANSCRIPT & CLASSIFICATION (CONFIDENCE: 96%)
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', italic: true }}>
              "{transcript}"
            </p>
          </div>

          {/* Form Fields Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Caller Name
              </label>
              <Input value={callerName} onChange={(e) => setCallerName(e.target.value)} icon={User} />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Caller Phone
              </label>
              <Input value={callerPhone} onChange={(e) => setCallerPhone(e.target.value)} icon={PhoneCall} />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Incident Classification
              </label>
              <Input value={incidentType} onChange={(e) => setIncidentType(e.target.value)} icon={AlertTriangle} />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Extracted Geocoded Location
              </label>
              <select
                value={selectedLandmark.name}
                onChange={(e) => {
                  const found = KNOWN_LANDMARKS.find((l) => l.name === e.target.value);
                  if (found) setSelectedLandmark(found);
                }}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  backgroundColor: 'rgba(8, 14, 22, 0.75)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
              >
                {KNOWN_LANDMARKS.map((lm, idx) => (
                  <option key={idx} value={lm.name} style={{ backgroundColor: '#06090e' }}>
                    {lm.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Severity Rating
              </label>
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                {['critical', 'warning', 'active'].map((sev) => (
                  <Button
                    key={sev}
                    type="button"
                    variant={severity === sev ? (sev === 'critical' ? 'danger' : 'primary') : 'secondary'}
                    size="sm"
                    onClick={() => setSeverity(sev)}
                  >
                    {sev.toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Estimated Victims / Hazard
              </label>
              <Input
                value={`${injuriesCount} injured | ${hazardDetails}`}
                onChange={(e) => setHazardDetails(e.target.value)}
                icon={Shield}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '10px',
              marginTop: '12px',
              paddingTop: '12px',
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            <Button variant="ghost" onClick={onClose}>
              Cancel Intake
            </Button>
            <Button variant="danger" icon={Check} onClick={handleSubmit}>
              Create & Dispatch Triage
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
