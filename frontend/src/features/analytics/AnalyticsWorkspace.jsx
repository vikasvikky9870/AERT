/**
 * AERT 3.0 Workspace 10: ANALYTICS & AFTER-ACTION INTELLIGENCE
 * Operational Performance, MTTD/MTTS Metrics, and SITREP Generation
 * Sector: Srikakulam District (AP-SKLM-EOC-01)
 * 
 * Compliant with Master Reconstruction Spec Screen 10:
 * - 5 Clean KPIs (MTTD, MTTS, AI Sign-off, Fleet Utilization, 24H Incidents)
 * - Compact Response Time Bar Chart (24H)
 * - Incident Breakdown & Top Corridors Table
 * - One-Click SITREP Generation
 */

import React from 'react';
import { Badge } from '../../design-system/components/Badge';
import { Button } from '../../design-system/components/Button';
import { soundManager } from '../../services/soundManager';
import {
  BarChart3,
  TrendingDown,
  Clock,
  Activity,
  FileText,
  Download,
  CheckCircle2,
  Users
} from 'lucide-react';

export function AnalyticsWorkspace({
  onOpenSitrep = () => {}
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', height: '100%', overflowX: 'hidden' }}>
      {/* 1. 5 Clean KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px', textAlign: 'center' }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: '4px', padding: '6px 2px' }}>
          <div style={{ fontSize: '8px', color: '#9aa8b8' }}>MTTD</div>
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#00f0ff' }}>42 sec</div>
          <div style={{ fontSize: '7px', color: '#30d158' }}>-18%</div>
        </div>

        <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: '4px', padding: '6px 2px' }}>
          <div style={{ fontSize: '8px', color: '#9aa8b8' }}>MTTS</div>
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#30d158' }}>5.8 min</div>
        </div>

        <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: '4px', padding: '6px 2px' }}>
          <div style={{ fontSize: '8px', color: '#9aa8b8' }}>AI SIGN-OFF</div>
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#f2f5f8' }}>96.4%</div>
        </div>

        <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: '4px', padding: '6px 2px' }}>
          <div style={{ fontSize: '8px', color: '#9aa8b8' }}>FLEET</div>
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#ff9500' }}>60%</div>
        </div>

        <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: '4px', padding: '6px 2px' }}>
          <div style={{ fontSize: '8px', color: '#9aa8b8' }}>24H INC</div>
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#f2f5f8' }}>18</div>
        </div>
      </div>

      {/* 2. Response Time Bar Chart (24H) */}
      <div style={{ background: 'rgba(12, 18, 28, 0.88)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '6px', padding: '10px' }}>
        <div style={{ fontSize: '10px', fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', color: '#00f0ff', marginBottom: '8px' }}>
          RESPONSE TIME (24H)
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '70px', paddingBottom: '6px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          {[
            { range: '0-3m', count: 8, height: '60%' },
            { range: '3-6m', count: 15, height: '100%' },
            { range: '6-9m', count: 7, height: '48%' },
            { range: '9-12m', count: 4, height: '28%' },
            { range: '12m+', count: 2, height: '14%' }
          ].map((bar, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <span style={{ fontSize: '8px', color: '#9aa8b8', marginBottom: '2px' }}>{bar.count}</span>
              <div style={{ width: '16px', height: bar.height, background: i === 1 ? '#00f0ff' : 'rgba(0, 240, 255, 0.4)', borderRadius: '2px 2px 0 0' }} />
              <span style={{ fontSize: '8px', color: '#9aa8b8', marginTop: '4px' }}>{bar.range}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Incidents by Type & Top Corridors */}
      <div style={{ background: 'rgba(12, 18, 28, 0.88)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '6px', padding: '10px' }}>
        <div style={{ fontSize: '10px', fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', color: '#9aa8b8', marginBottom: '6px' }}>
          TOP CORRIDORS BY INCIDENTS
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '10px' }}>
          {[
            { corridor: 'NH-16 Bypass', count: 8, trend: '+12%', color: '#ff3b30' },
            { corridor: 'Palakonda Road', count: 5, trend: '-8%', color: '#ff9500' },
            { corridor: 'Ranasthalam Road', count: 3, trend: '+5%', color: '#00f0ff' }
          ].map((c, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
              <span style={{ color: '#f2f5f8' }}>{c.corridor}</span>
              <div>
                <span style={{ fontWeight: 700, color: c.color, marginRight: '6px' }}>{c.count}</span>
                <span style={{ color: '#9aa8b8', fontSize: '9px' }}>{c.trend}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Action: Generate SITREP */}
      <div style={{ marginTop: 'auto', paddingTop: '4px' }}>
        <Button size="sm" variant="cyan" onClick={onOpenSitrep} style={{ width: '100%' }}>
          <FileText size={13} style={{ marginRight: '6px' }} />
          Generate District SITREP
        </Button>
      </div>
    </div>
  );
}
