/**
 * AERT 3.0 Workspace 08: AI COMMAND
 * Structured Decision Support & Multi-Agent Reasoning Briefing
 * Sector: Srikakulam District (AP-SKLM-EOC-01)
 * 
 * Compliant with Master Reconstruction Spec Screen 08:
 * - AI Recommendations Queue
 * - Structured Decision Brief (What, Why, Evidence, Alternatives, Confidence)
 * - 3-Button Operator Decision Action Bar (Approve / Modify / Reject)
 */

import React, { useState } from 'react';
import { Badge } from '../../design-system/components/Badge';
import { Button } from '../../design-system/components/Button';
import { soundManager } from '../../services/soundManager';
import {
  Cpu,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  GitBranch,
  Clock,
  Layers,
  Activity,
  UserCheck,
  Check,
  X,
  Edit3
} from 'lucide-react';

const AI_RECOMMENDATIONS = [
  {
    id: 'REC-001',
    title: 'INC-005 Dispatch Package',
    subtitle: 'AMB-001 (ALS) to Chemical Leak',
    active: true
  },
  {
    id: 'REC-002',
    title: 'Route Optimization',
    subtitle: 'NH-16 Bypass Detour (+1.2m)',
    active: false
  },
  {
    id: 'REC-003',
    title: 'Hospital Pre-Alert',
    subtitle: 'RIMS Srikakulam Trauma Bay',
    active: false
  }
];

export function AiCommandWorkspace({
  selectedIncident = null,
  onApprovePlan = () => {},
  onOpenOverride = () => {}
}) {
  const [activeRecId, setActiveRecId] = useState('REC-001');
  const [decisionState, setDecisionState] = useState(null); // 'APPROVED' | 'MODIFIED' | 'REJECTED'

  const handleApprove = () => {
    soundManager.playDispatchChime();
    setDecisionState('APPROVED');
    onApprovePlan();
  };

  const handleReject = () => {
    soundManager.playWarningBeep();
    setDecisionState('REJECTED');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%', overflowX: 'hidden' }}>
      {/* 1. AI Recommendations Queue */}
      <div>
        <div style={{ fontSize: '10px', fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', color: '#00f0ff', marginBottom: '6px', letterSpacing: '0.05em' }}>
          AI RECOMMENDATIONS
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {AI_RECOMMENDATIONS.map((rec) => {
            const isSel = activeRecId === rec.id;
            return (
              <div
                key={rec.id}
                onClick={() => {
                  soundManager.playClickTone();
                  setActiveRecId(rec.id);
                }}
                style={{
                  background: isSel ? 'rgba(0, 240, 255, 0.12)' : 'rgba(12, 18, 28, 0.7)',
                  border: isSel ? '1px solid #00f0ff' : '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '6px',
                  padding: '8px 10px',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'all 0.15s ease'
                }}
              >
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: isSel ? '#00f0ff' : '#f2f5f8' }}>{rec.title}</div>
                  <div style={{ fontSize: '10px', color: '#9aa8b8' }}>{rec.subtitle}</div>
                </div>
                {isSel && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00f0ff' }} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. AI Response Brief */}
      <div style={{ background: 'rgba(12, 18, 28, 0.92)', border: '1px solid rgba(0, 240, 255, 0.35)', borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '6px' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#00f0ff', fontFamily: 'JetBrains Mono, monospace' }}>
              INC-005 Chemical Vapor Leak
            </div>
            <div style={{ fontSize: '10px', color: '#9aa8b8' }}>Singupuram Industrial Corridor</div>
          </div>
          <Badge variant="cyan">96% CONFIDENCE</Badge>
        </div>

        <div>
          <div style={{ fontSize: '10px', fontWeight: 700, color: '#9aa8b8', fontFamily: 'JetBrains Mono, monospace' }}>RECOMMENDATION</div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#f2f5f8', marginTop: '2px' }}>
            Dispatch <strong>AMB-003 (ALS)</strong> to Scene
          </div>
        </div>

        {/* Tactical Metrics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', textAlign: 'center' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: '4px', padding: '4px' }}>
            <div style={{ fontSize: '8px', color: '#9aa8b8' }}>ETA</div>
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#00f0ff' }}>4:16</div>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: '4px', padding: '4px' }}>
            <div style={{ fontSize: '8px', color: '#9aa8b8' }}>RISK</div>
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#30d158' }}>LOW</div>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: '4px', padding: '4px' }}>
            <div style={{ fontSize: '8px', color: '#9aa8b8' }}>HOSPITAL</div>
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#f2f5f8' }}>RIMS</div>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: '4px', padding: '4px' }}>
            <div style={{ fontSize: '8px', color: '#9aa8b8' }}>IMPACT</div>
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#ff9500' }}>MEDIUM</div>
          </div>
        </div>

        {/* Why this recommendation */}
        <div>
          <div style={{ fontSize: '10px', fontWeight: 700, color: '#00f0ff', fontFamily: 'JetBrains Mono, monospace', marginBottom: '4px' }}>
            WHY THIS RECOMMENDATION?
          </div>
          <ul style={{ margin: 0, paddingLeft: '14px', fontSize: '11px', color: '#9aa8b8', lineHeight: '1.4' }}>
            <li>✓ Shortest feasible ETA from NH-16 post</li>
            <li>✓ ALS capability required for chemical vapor inhalation</li>
            <li>✓ NH-16 bypass corridor is clear of active hazards</li>
            <li>✓ RIMS Trauma Center has 4 available ICU beds</li>
          </ul>
        </div>

        {/* Alternative */}
        <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '4px', padding: '6px 8px', fontSize: '11px' }}>
          <span style={{ color: '#9aa8b8' }}>Alternative: </span>
          <span style={{ fontWeight: 600, color: '#f2f5f8' }}>AMB-001 ALS</span>
          <span style={{ color: '#ff9500', marginLeft: '6px' }}>(ETA +4m 36s)</span>
        </div>
      </div>

      {/* 3. Operator Action Bar */}
      <div style={{ marginTop: 'auto' }}>
        {decisionState === 'APPROVED' ? (
          <div style={{ background: 'rgba(48, 209, 88, 0.15)', border: '1px solid #30d158', borderRadius: '6px', padding: '10px', textAlign: 'center', fontSize: '12px', fontWeight: 700, color: '#30d158' }}>
            ✓ PLAN AUTHORIZED BY OPERATOR
          </div>
        ) : decisionState === 'REJECTED' ? (
          <div style={{ background: 'rgba(255, 59, 48, 0.15)', border: '1px solid #ff3b30', borderRadius: '6px', padding: '10px', textAlign: 'center', fontSize: '12px', fontWeight: 700, color: '#ff3b30' }}>
            ✗ PLAN REJECTED (LOGGED TO AUDIT)
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '6px' }}>
            <Button size="sm" variant="cyan" onClick={handleApprove}>
              <Check size={14} style={{ marginRight: '4px' }} />
              Approve
            </Button>
            <Button size="sm" variant="ghost" onClick={onOpenOverride}>
              Modify
            </Button>
            <Button size="sm" variant="danger" onClick={handleReject}>
              Reject
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
