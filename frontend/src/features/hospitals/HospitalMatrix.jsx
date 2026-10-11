import React from 'react';
import { Panel } from '../../design-system/components/Panel';
import { Badge } from '../../design-system/components/Badge';
import { Button } from '../../design-system/components/Button';
import { Building2, Activity, HeartPulse, Stethoscope, Radio, Send } from 'lucide-react';

/**
 * Hospital ER & Trauma Capacity Monitoring Hub
 */
export function HospitalMatrix({ hospitals = [], onSendPreAlert, onClose }) {
  const defaultHospitals = [
    {
      id: 'HOS-001',
      name: 'RIMS Srikakulam Super Specialty',
      traumaLevel: 'Level 1 Trauma Center',
      occupancy: 88,
      bedsAvailable: 4,
      icuAvailable: 2,
      ventilators: 5,
      ambulanceQueue: 3,
      contact: '+91 8942 222100',
    },
    {
      id: 'HOS-002',
      name: 'Government General Hospital (GGH)',
      traumaLevel: 'Level 2 Trauma Center',
      occupancy: 75,
      bedsAvailable: 8,
      icuAvailable: 4,
      ventilators: 7,
      ambulanceQueue: 1,
      contact: '+91 8942 223456',
    },
    {
      id: 'HOS-003',
      name: 'Medicover Hospital Srikakulam',
      traumaLevel: 'Level 2 Private Emergency',
      occupancy: 62,
      bedsAvailable: 12,
      icuAvailable: 6,
      ventilators: 10,
      ambulanceQueue: 0,
      contact: '+91 8942 667788',
    },
  ];

  const list = hospitals.length > 0 ? hospitals : defaultHospitals;

  return (
    <div
      style={{
        position: 'absolute',
        top: '70px',
        right: '16px',
        width: '440px',
        bottom: '80px',
        zIndex: 840,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Panel
        title="HOSPITAL CAPACITY MATRIX"
        subtitle="Real-time Srikakulam ER & Trauma Center Telemetry"
        style={{ height: '100%' }}
        headerAction={
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '12px', overflowY: 'auto' }}>
          {list.map((hos) => (
            <div
              key={hos.id}
              style={{
                padding: '14px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Building2 size={18} style={{ color: 'var(--accent-cyan)' }} />
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {hos.name}
                    </div>
                    <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-mono-cyan)' }}>
                      {hos.id}
                    </span>
                  </div>
                </div>
                <Badge variant={hos.occupancy > 85 ? 'warning' : 'active'}>
                  {hos.traumaLevel}
                </Badge>
              </div>

              {/* Occupancy Progress Bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Emergency Occupancy Rate</span>
                  <span className="mono" style={{ color: hos.occupancy > 85 ? 'var(--status-warning)' : 'var(--status-active)', fontWeight: 600 }}>
                    {hos.occupancy}% Occupied ({hos.bedsAvailable} Beds Open)
                  </span>
                </div>
                <div
                  style={{
                    width: '100%',
                    height: '6px',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    borderRadius: 'var(--radius-pill)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${hos.occupancy}%`,
                      height: '100%',
                      backgroundColor: hos.occupancy > 85 ? 'var(--status-warning)' : 'var(--status-active)',
                      boxShadow: `0 0 8px ${hos.occupancy > 85 ? 'var(--status-warning)' : 'var(--status-active)'}`,
                    }}
                  />
                </div>
              </div>

              {/* Vital Capacity Breakdown Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '8px',
                  padding: '8px',
                  backgroundColor: 'rgba(8, 14, 22, 0.6)',
                  borderRadius: 'var(--radius-xs)',
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block' }}>ICU BEDS</span>
                  <span className="mono" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {hos.icuAvailable}
                  </span>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block' }}>VENTILATORS</span>
                  <span className="mono" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {hos.ventilators}
                  </span>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block' }}>AMB QUEUE</span>
                  <span className="mono" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--status-info)' }}>
                    {hos.ambulanceQueue}
                  </span>
                </div>
              </div>

              <Button
                variant="primary"
                size="sm"
                icon={Send}
                style={{ width: '100%' }}
                onClick={() => onSendPreAlert && onSendPreAlert(hos)}
              >
                Transmit Direct ER Pre-Alert
              </Button>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
