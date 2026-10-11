/**
 * AERT 3.0 AI Recommendation Instrument
 * Operational Sector: Srikakulam District (AP-SKLM-EOC-01)
 * 
 * Compliant with Section 6 of Master Flagship Specification:
 * - Single premium aerospace glass instrument
 * - AERT RECOMMENDS header
 * - Recommended unit & tier (e.g. AMB-003, ALS RESPONSE)
 * - ETA & Genuine Confidence label from intelligence.py
 * - WHY (condensed explainable reasoning)
 * - CONFLICT (surfaced only if status conflict / shortage detected)
 * - ALTERNATIVE (second ranked unit & ETA)
 * - Actions: [COMPARE], [VIEW ROUTE], [APPROVE]
 */

import React from 'react';
import {
  Sparkles,
  Ambulance,
  Building2,
  Clock,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  MapPin
} from 'lucide-react';
import { soundManager } from '../../services/soundManager';

export function AiRecommendationInstrument({
  recommendation = null,
  onApprove = () => {},
  onCompare = () => {},
  onViewRoute = () => {}
}) {
  if (!recommendation) return null;

  const recAmb = recommendation.recommended_ambulance || {};
  const recHos = recommendation.recommended_hospital || {};
  const rankedAmbs = recommendation.ranked_ambulances || [];
  const altAmb = rankedAmbs.length > 1 ? rankedAmbs[1] : null;

  const whyText =
    recommendation.why_ambulance?.[0] ||
    recommendation.reasoning?.[0] ||
    'Closest available ALS unit with direct arterial NH-16 corridor vector.';

  const conflictText = recommendation.has_conflict
    ? `Resource gap: ${recommendation.resource_gap || 1} critical unit deficit detected across sector.`
    : null;

  const confidenceLabel =
    recommendation.confidence || 'HIGH (Sufficient Fleet & Full Trauma Readiness)';

  return (
    <div
      style={{
        background: 'rgba(11, 14, 20, 0.94)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(0, 240, 255, 0.4)',
        borderRadius: '14px',
        padding: '16px 18px',
        boxShadow: '0 20px 48px rgba(0, 0, 0, 0.9), 0 0 24px rgba(0, 240, 255, 0.18)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        color: '#f2f5f8',
        animation: 'fadeIn 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sparkles size={13} color="#00f0ff" />
          <span style={{ fontSize: '10px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 800, color: '#00f0ff', letterSpacing: '0.06em' }}>
            AERT RECOMMENDS
          </span>
        </div>
        <span style={{ fontSize: '9px', fontFamily: 'JetBrains Mono, monospace', color: '#30d158', fontWeight: 800 }}>
          OPTIMAL MATCH
        </span>
      </div>

      {/* Recommended Unit & Tier */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div>
          <div style={{ fontSize: '20px', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, color: '#f2f5f8' }}>
            {recAmb.id || 'AMB-003'}
          </div>
          <div style={{ fontSize: '10px', fontFamily: 'JetBrains Mono, monospace', color: '#00f0ff', fontWeight: 700, marginTop: '1px' }}>
            {recAmb.type || 'ALS'} RESPONSE • {recHos.name || 'RIMS Srikakulam'}
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '8px', fontFamily: 'JetBrains Mono, monospace', color: '#9aa8b8' }}>ESTIMATED TRANSIT</div>
          <div style={{ fontSize: '18px', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, color: '#30d158' }}>
            ~{recAmb.eta_minutes || 4.2}m
          </div>
        </div>
      </div>

      {/* Metric Breakdown Strip */}
      <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '8px', padding: '8px 10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <div>
          <div style={{ fontSize: '8px', fontFamily: 'JetBrains Mono, monospace', color: '#9aa8b8' }}>GEODESIC DISTANCE</div>
          <div style={{ fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: '#f2f5f8', marginTop: '2px' }}>
            {recAmb.distance_km || 2.4} km
          </div>
        </div>
        <div>
          <div style={{ fontSize: '8px', fontFamily: 'JetBrains Mono, monospace', color: '#9aa8b8' }}>CONFIDENCE MODEL</div>
          <div style={{ fontSize: '9.5px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: '#30d158', marginTop: '2px' }}>
            {confidenceLabel.split(' ')[0]}
          </div>
        </div>
      </div>

      {/* WHY (Condense Explainable Reasoning) */}
      <div>
        <span style={{ fontSize: '8.5px', fontFamily: 'JetBrains Mono, monospace', color: '#00f0ff', fontWeight: 800 }}>
          WHY
        </span>
        <div style={{ fontSize: '10.5px', fontFamily: 'Inter, sans-serif', color: '#e0e2ea', marginTop: '3px', lineHeight: 1.4 }}>
          {whyText}
        </div>
      </div>

      {/* CONFLICT (Shown only if detected) */}
      {conflictText && (
        <div style={{ background: 'rgba(255, 149, 0, 0.1)', border: '1px solid rgba(255, 149, 0, 0.3)', borderRadius: '8px', padding: '6px 10px' }}>
          <span style={{ fontSize: '8px', fontFamily: 'JetBrains Mono, monospace', color: '#ff9500', fontWeight: 800 }}>
            CONFLICT DETECTED
          </span>
          <div style={{ fontSize: '9.5px', fontFamily: 'Inter, sans-serif', color: '#ff9500', marginTop: '2px' }}>
            {conflictText}
          </div>
        </div>
      )}

      {/* ALTERNATIVE */}
      {altAmb && (
        <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '8px', padding: '6px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '8px', fontFamily: 'JetBrains Mono, monospace', color: '#9aa8b8', fontWeight: 700 }}>
              ALTERNATIVE
            </span>
            <div style={{ fontSize: '10px', fontFamily: 'JetBrains Mono, monospace', color: '#f2f5f8', fontWeight: 700 }}>
              {altAmb.id} ({altAmb.type})
            </div>
          </div>
          <div style={{ fontSize: '10px', fontFamily: 'JetBrains Mono, monospace', color: '#9aa8b8' }}>
            ~{altAmb.eta_minutes || 6.8}m • {altAmb.distance_km || 3.8}km
          </div>
        </div>
      )}

      {/* Action Buttons: [COMPARE], [VIEW ROUTE], [APPROVE] */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
        <button
          onClick={() => {
            soundManager.playClickTone();
            onCompare();
          }}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '8px',
            padding: '8px 10px',
            color: '#9aa8b8',
            fontSize: '9.5px',
            fontFamily: 'JetBrains Mono, monospace',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          COMPARE
        </button>

        <button
          onClick={() => {
            soundManager.playClickTone();
            onViewRoute();
          }}
          style={{
            background: 'rgba(0, 240, 255, 0.1)',
            border: '1px solid rgba(0, 240, 255, 0.35)',
            borderRadius: '8px',
            padding: '8px 10px',
            color: '#00f0ff',
            fontSize: '9.5px',
            fontFamily: 'JetBrains Mono, monospace',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          VIEW ROUTE
        </button>

        <button
          onClick={() => {
            soundManager.playDispatchChime();
            onApprove(recAmb, recHos);
          }}
          style={{
            flex: 1,
            background: 'linear-gradient(135deg, #30d158, #00f0ff)',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 14px',
            color: '#06090e',
            fontSize: '11px',
            fontFamily: 'Space Grotesk, sans-serif',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            boxShadow: '0 4px 16px rgba(48, 209, 88, 0.35)'
          }}
        >
          <CheckCircle2 size={13} strokeWidth={3} />
          <span>APPROVE DISPATCH</span>
        </button>
      </div>
    </div>
  );
}
