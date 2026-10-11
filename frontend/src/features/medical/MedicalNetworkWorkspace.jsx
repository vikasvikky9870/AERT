/**
 * AERT 3.0 Workspace 06: MEDICAL NETWORK
 * Srikakulam District Hospital Capacity & Trauma Readiness Network
 * Sector: Srikakulam District (AP-SKLM-EOC-01)
 * 
 * Compliant with Master Reconstruction Spec Screen 06:
 * - Trauma Network Summary (5/5 Online)
 * - Compact Hospital Facility Cards with Progress Indicators
 * - Prominent 1-Click "Pre-Alert Hospital" Action
 */

import React, { useState } from 'react';
import { Badge } from '../../design-system/components/Badge';
import { Button } from '../../design-system/components/Button';
import { soundManager } from '../../services/soundManager';
import {
  Building2,
  HeartPulse,
  Activity,
  Send,
  CheckCircle2,
  AlertCircle,
  Wind,
  Droplet,
  Radio
} from 'lucide-react';

export function MedicalNetworkWorkspace({
  hospitals = [],
  onSelectHospital = () => {},
  onSendPreAlert = () => {}
}) {
  const [selectedHosId, setSelectedHosId] = useState(hospitals[0]?.id || 'HOS-002');
  const [isAlerting, setIsAlerting] = useState(false);
  const [alertSuccess, setAlertSuccess] = useState(false);

  const handlePreAlert = () => {
    setIsAlerting(true);
    soundManager.playHospitalSonar();
    onSendPreAlert(selectedHosId);
    setTimeout(() => {
      setIsAlerting(false);
      setAlertSuccess(true);
      setTimeout(() => setAlertSuccess(false), 3000);
    }, 1100);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', height: '100%', overflowX: 'hidden' }}>
      {/* 1. Trauma Network Summary */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '6px' }}>
        <div style={{ fontSize: '10px', fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', color: '#00f0ff', letterSpacing: '0.05em' }}>
          TRAUMA NETWORK SUMMARY
        </div>
        <Badge variant="active">{hospitals.length}/{hospitals.length} ONLINE</Badge>
      </div>

      {/* 2. Compact Hospital Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto' }}>
        {hospitals.map((hos) => {
          const isSel = selectedHosId === hos.id;
          const erLoad = hos.er_capacity || (hos.id === 'HOS-002' ? 80 : hos.id === 'HOS-001' ? 60 : 40);
          const icuLoad = hos.icu_capacity || (hos.id === 'HOS-002' ? 45 : hos.id === 'HOS-001' ? 40 : 30);
          const etaMin = hos.id === 'HOS-001' ? 4 : hos.id === 'HOS-002' ? 6 : hos.id === 'HOS-003' ? 16 : 22;
          const isCriticalLoad = erLoad >= 80;

          return (
            <div
              key={hos.id}
              onClick={() => {
                soundManager.playClickTone();
                setSelectedHosId(hos.id);
                onSelectHospital(hos);
              }}
              style={{
                background: isSel ? 'rgba(0, 240, 255, 0.12)' : 'rgba(12, 18, 28, 0.85)',
                border: isSel ? '1px solid #00f0ff' : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '6px',
                padding: '8px 10px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '18px', height: '18px', borderRadius: '4px', background: '#0c1a24', border: '1px solid #00f0ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00f0ff', fontSize: '10px', fontWeight: 800 }}>
                    H
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#f2f5f8' }}>{hos.name}</div>
                    <div style={{ fontSize: '9px', color: '#9aa8b8' }}>{hos.trauma_level || 'Level 1 Trauma'}</div>
                  </div>
                </div>
                <div style={{ fontSize: '10px', color: '#00f0ff', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>
                  ETA {etaMin} min
                </div>
              </div>

              {/* ER Load Progress Bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                <span style={{ fontSize: '9px', color: '#9aa8b8', minWidth: '45px' }}>ED Load</span>
                <div style={{ flex: 1, height: '4px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: `${erLoad}%`, height: '100%', background: isCriticalLoad ? '#ff9500' : '#30d158' }} />
                </div>
                <span style={{ fontSize: '9px', fontWeight: 700, color: isCriticalLoad ? '#ff9500' : '#30d158', fontFamily: 'JetBrains Mono, monospace' }}>
                  {erLoad}%
                </span>
                <span style={{ fontSize: '9px', color: '#9aa8b8', marginLeft: '4px' }}>ICU {icuLoad}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Prominent Pre-Alert Button */}
      <div style={{ marginTop: 'auto', paddingTop: '8px' }}>
        {alertSuccess ? (
          <div style={{ background: 'rgba(48, 209, 88, 0.15)', border: '1px solid #30d158', borderRadius: '6px', padding: '8px', textAlign: 'center', fontSize: '11px', fontWeight: 700, color: '#30d158' }}>
            ✓ PRE-ALERT TRANSMITTED (TRAUMA BAY 1 READY)
          </div>
        ) : (
          <Button
            size="sm"
            variant="cyan"
            disabled={isAlerting}
            onClick={handlePreAlert}
            style={{ width: '100%' }}
          >
            {isAlerting ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <Radio size={14} className="animate-spin" />
                Transmitting Pre-Alert...
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <Send size={14} />
                Pre-Alert Hospital
              </span>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
