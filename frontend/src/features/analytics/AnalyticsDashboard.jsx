import React from 'react';
import { Panel } from '../../design-system/components/Panel';
import { Badge } from '../../design-system/components/Badge';
import { Button } from '../../design-system/components/Button';
import {
  TrendingUp,
  Clock,
  Activity,
  Shield,
  Building2,
  Ambulance,
  Download,
  Flame,
  CheckCircle,
} from 'lucide-react';

/**
 * 2D Operational Analytics & Command Intelligence Dashboard
 */
export function AnalyticsDashboard({ onExportReport, onClose }) {
  const hourlyData = [
    { hour: '08:00', incidents: 2, mtts: 6.2 },
    { hour: '10:00', incidents: 5, mtts: 5.8 },
    { hour: '12:00', incidents: 8, mtts: 7.1 },
    { hour: '14:00', incidents: 6, mtts: 5.4 },
    { hour: '16:00', incidents: 9, mtts: 6.8 },
    { hour: '18:00', incidents: 12, mtts: 5.2 },
    { hour: '20:00', incidents: 7, mtts: 4.9 },
  ];

  const sectorDistribution = [
    { sector: 'NH-16 Highway Arterial Corridor', count: 14, severity: 'critical', pct: 42 },
    { sector: '7 Road Junction Central', count: 9, severity: 'warning', pct: 28 },
    { sector: 'Singupuram Industrial Zone', count: 6, severity: 'critical', pct: 18 },
    { sector: 'Palakonda Road District Admin', count: 4, severity: 'active', pct: 12 },
  ];

  return (
    <div
      style={{
        position: 'absolute',
        top: '70px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '960px',
        maxWidth: '94vw',
        bottom: '80px',
        zIndex: 850,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Panel
        title="OPERATIONAL TELEMETRY & FLEET EFFICIENCY ANALYTICS"
        subtitle="Srikakulam District Emergency Operations Command (EOC) Performance Benchmarks"
        style={{ height: '100%' }}
        headerAction={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="outline" size="sm" icon={Download} onClick={onExportReport}>
              Export Analytics Brief
            </Button>
            {onClose && (
              <button
                onClick={onClose}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '1rem',
                }}
              >
                ✕
              </button>
            )}
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px', overflowY: 'auto' }}>
          {/* 1. Executive KPI Metric Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }}>
            <div
              style={{
                padding: '14px',
                backgroundColor: 'rgba(0, 240, 255, 0.05)',
                border: '1px solid var(--border-glow-cyan)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Mean Time to Dispatch
                </span>
                <Clock size={16} style={{ color: 'var(--accent-cyan)' }} />
              </div>
              <div className="mono" style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-mono-cyan)', marginTop: '4px' }}>
                1.4 <span style={{ fontSize: '0.8rem' }}>mins</span>
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--status-active)' }}>
                ▼ 18% vs 3.0m baseline
              </span>
            </div>

            <div
              style={{
                padding: '14px',
                backgroundColor: 'rgba(48, 209, 88, 0.05)',
                border: '1px solid rgba(48, 209, 88, 0.3)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Mean Time to Scene (MTTS)
                </span>
                <Ambulance size={16} style={{ color: 'var(--status-active)' }} />
              </div>
              <div className="mono" style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--status-active)', marginTop: '4px' }}>
                5.8 <span style={{ fontSize: '0.8rem' }}>mins</span>
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--status-active)' }}>
                ▼ 22% faster response
              </span>
            </div>

            <div
              style={{
                padding: '14px',
                backgroundColor: 'rgba(255, 204, 0, 0.05)',
                border: '1px solid rgba(255, 204, 0, 0.3)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Active Fleet Load
                </span>
                <Activity size={16} style={{ color: 'var(--status-warning)' }} />
              </div>
              <div className="mono" style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--status-warning)', marginTop: '4px' }}>
                67% <span style={{ fontSize: '0.8rem' }}>(6/9 Units)</span>
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                3 Units in Reserve Standby
              </span>
            </div>

            <div
              style={{
                padding: '14px',
                backgroundColor: 'rgba(255, 59, 48, 0.05)',
                border: '1px solid var(--border-glow-critical)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  AI Triage Accuracy
                </span>
                <Shield size={16} style={{ color: 'var(--status-critical)' }} />
              </div>
              <div className="mono" style={{ fontSize: '1.4rem', fontWeight: 700, color: '#ffffff', marginTop: '4px' }}>
                98.4%
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--status-active)' }}>
                0 Critical Misclassifications
              </span>
            </div>
          </div>

          {/* 2. Response Time Curve & Hourly Volume SVG Chart */}
          <div
            style={{
              padding: '16px',
              backgroundColor: 'rgba(8, 14, 22, 0.8)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Hourly Response Time (MTTS) & Incident Volume
              </div>
              <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-mono-cyan)' }}>
                Cyan Line: Response Time (Mins) | Bars: Incident Volume
              </span>
            </div>

            {/* SVG Visual Chart */}
            <div style={{ width: '100%', height: '140px' }}>
              <svg width="100%" height="100%" viewBox="0 0 700 140" preserveAspectRatio="none">
                {/* Background Grid Lines */}
                <line x1="0" y1="35" x2="700" y2="35" stroke="rgba(255,255,255,0.06)" strokeDasharray="4" />
                <line x1="0" y1="70" x2="700" y2="70" stroke="rgba(255,255,255,0.06)" strokeDasharray="4" />
                <line x1="0" y1="105" x2="700" y2="105" stroke="rgba(255,255,255,0.06)" strokeDasharray="4" />

                {/* Target MTTS Threshold Line */}
                <line x1="0" y1="50" x2="700" y2="50" stroke="rgba(255,59,48,0.4)" strokeWidth="1" strokeDasharray="6" />

                {/* Bars for Incident Volume */}
                {hourlyData.map((d, i) => {
                  const x = 50 + i * 95;
                  const barH = d.incidents * 8;
                  return (
                    <g key={i}>
                      <rect
                        x={x - 14}
                        y={120 - barH}
                        width="28"
                        height={barH}
                        fill="rgba(0, 240, 255, 0.2)"
                        stroke="rgba(0, 240, 255, 0.4)"
                        rx="2"
                      />
                      <text x={x} y="135" fill="#9aa8b8" fontSize="10" textAnchor="middle" fontFamily="monospace">
                        {d.hour}
                      </text>
                    </g>
                  );
                })}

                {/* Polylines for Response Time (MTTS) */}
                <polyline
                  fill="none"
                  stroke="#00f0ff"
                  strokeWidth="2.5"
                  points={hourlyData
                    .map((d, i) => `${50 + i * 95},${120 - d.mtts * 14}`)
                    .join(' ')}
                />

                {/* Data Points */}
                {hourlyData.map((d, i) => (
                  <circle
                    key={i}
                    cx={50 + i * 95}
                    cy={120 - d.mtts * 14}
                    r="4"
                    fill="#00f0ff"
                    stroke="#06090e"
                    strokeWidth="1.5"
                  />
                ))}
              </svg>
            </div>
          </div>

          {/* 3. Sector Casualty & Incident Distribution Table */}
          <div
            style={{
              padding: '16px',
              backgroundColor: 'rgba(8, 14, 22, 0.8)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '10px' }}>
              Spatial Risk Distribution by Srikakulam Corridor
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {sectorDistribution.map((sec, idx) => (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{sec.sector}</span>
                    <span className="mono" style={{ color: 'var(--text-mono-cyan)' }}>
                      {sec.count} Incidents ({sec.pct}%)
                    </span>
                  </div>
                  <div
                    style={{
                      width: '100%',
                      height: '6px',
                      backgroundColor: 'rgba(255, 255, 255, 0.06)',
                      borderRadius: 'var(--radius-pill)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${sec.pct}%`,
                        height: '100%',
                        backgroundColor:
                          sec.severity === 'critical'
                            ? 'var(--status-critical)'
                            : sec.severity === 'warning'
                            ? 'var(--status-warning)'
                            : 'var(--status-active)',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Panel>
    </div>
  );
}
