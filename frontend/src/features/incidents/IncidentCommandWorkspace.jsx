/**
 * AERT 3.0 Workspace 04: INCIDENT COMMAND
 * Incident Matrix, Multi-Criteria Triage & 1-Click Operations
 * Sector: Srikakulam District (AP-SKLM-EOC-01)
 * 
 * Compliant with Master Reconstruction Spec Screen 04:
 * - Incident Matrix with Severity Sort
 * - Compact Incident Cards with Colored Badges
 * - One-Click "+ New Incident" Action
 */

import React, { useState } from 'react';
import { Badge } from '../../design-system/components/Badge';
import { Button } from '../../design-system/components/Button';
import { soundManager } from '../../services/soundManager';
import {
  AlertTriangle,
  Ambulance,
  Building2,
  Cpu,
  FileText,
  Navigation,
  Scale,
  ShieldAlert,
  Users,
  CheckCircle2,
  Clock,
  Plus
} from 'lucide-react';

export function IncidentCommandWorkspace({
  incidents = [],
  ambulances = [],
  hospitals = [],
  onSelectIncident = () => {},
  onTransitionLifecycle = () => {},
  onOpenOverride = () => {}
}) {
  const [selectedIncId, setSelectedIncId] = useState(incidents[0]?.id || 'INC-005');
  const [sortSeverity, setSortSeverity] = useState(true);

  const sortedIncidents = [...incidents].sort((a, b) => {
    if (!sortSeverity) return 0;
    const rank = { CRITICAL: 3, HIGH: 2, MEDIUM: 1, LOW: 0 };
    return (rank[b.severity] || 0) - (rank[a.severity] || 0);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', height: '100%', overflowX: 'hidden' }}>
      {/* 1. Header with Sort Control */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '6px' }}>
        <div style={{ fontSize: '10px', fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', color: '#00f0ff', letterSpacing: '0.05em' }}>
          INCIDENT MATRIX ({incidents.length})
        </div>
        <button
          onClick={() => setSortSeverity(!sortSeverity)}
          style={{ background: 'transparent', border: 'none', color: '#9aa8b8', fontSize: '9px', fontFamily: 'JetBrains Mono, monospace', cursor: 'pointer' }}
        >
          SORT: {sortSeverity ? 'SEVERITY' : 'CHRONO'}
        </button>
      </div>

      {/* 2. Compact Incident Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto' }}>
        {sortedIncidents.map((inc) => {
          const isSel = selectedIncId === inc.id;
          const isCritical = inc.severity === 'CRITICAL';
          const isHigh = inc.severity === 'HIGH';

          return (
            <div
              key={inc.id}
              onClick={() => {
                soundManager.playClickTone();
                setSelectedIncId(inc.id);
                onSelectIncident(inc);
              }}
              style={{
                background: isSel ? 'rgba(0, 240, 255, 0.12)' : 'rgba(12, 18, 28, 0.85)',
                border: isSel ? '1px solid #00f0ff' : `1px solid ${isCritical ? 'rgba(255, 59, 48, 0.35)' : 'rgba(255, 255, 255, 0.08)'}`,
                borderRadius: '6px',
                padding: '8px 10px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#00f0ff')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = isSel ? '#00f0ff' : isCritical ? 'rgba(255, 59, 48, 0.35)' : 'rgba(255, 255, 255, 0.08)')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', color: '#00f0ff' }}>
                    {inc.id}
                  </span>
                  <Badge variant={isCritical ? 'critical' : isHigh ? 'warning' : 'active'}>
                    {inc.severity}
                  </Badge>
                </div>
                <span style={{ fontSize: '9px', color: '#9aa8b8', fontFamily: 'JetBrains Mono, monospace' }}>
                  {inc.lifecycle_status || 'VERIFIED'}
                </span>
              </div>

              <div style={{ fontSize: '11px', fontWeight: 700, color: '#f2f5f8' }}>{inc.type}</div>
              <div style={{ fontSize: '10px', color: '#9aa8b8', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Navigation size={9} color="#00f0ff" />
                {inc.location}
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Action: Create New Incident */}
      <div style={{ marginTop: 'auto', paddingTop: '4px' }}>
        <Button size="sm" variant="cyan" onClick={onOpenOverride} style={{ width: '100%' }}>
          <Plus size={14} style={{ marginRight: '4px' }} />
          New Incident
        </Button>
      </div>
    </div>
  );
}
