/**
 * AERT 3.0 What-If Scenario Simulation Screen
 * Operational Sector: Srikakulam District (AP-SKLM-EOC-01)
 * 
 * Powered by real backend POST /api/simulate:
 * - Runs hypothetical incident through the decision-support engine
 * - Nothing persisted to operational database
 * - Data Honesty: Labeled "What-If Simulation Mode — Preview Only, Nothing Persisted to Live Operations"
 */

import React, { useState } from 'react';
import {
  Play,
  Sliders,
  Sparkles,
  AlertTriangle,
  Ambulance,
  Building2,
  Cpu,
  Clock,
  CheckCircle2,
  RefreshCw,
  Loader2
} from 'lucide-react';
import * as api from '../../api';
import { soundManager } from '../../services/soundManager';

export function SimulationSurface({
  onSelectScenario = () => {},
  onReset = () => {}
}) {
  const [form, setForm] = useState({
    type: 'Major Highway Collision',
    location: 'Simulated NH-16 Interchange',
    severity: 'CRITICAL',
    victims: 6,
    critical_victims: 2,
    hazard_type: 'Highway Entrapment / Fuel Spill',
    coordinates: [83.9050, 18.3050]
  });

  const [simulationResult, setSimulationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const runSimulation = async (e) => {
    if (e) e.preventDefault();
    soundManager.playClickTone();
    setLoading(true);
    setError('');

    try {
      const res = await api.simulateScenario({
        type: form.type,
        location: form.location,
        severity: form.severity,
        victims: Number(form.victims),
        critical_victims: Number(form.critical_victims),
        hazard_type: form.hazard_type,
        coordinates: form.coordinates
      });
      setSimulationResult(res);
      soundManager.playDispatchChime();
    } catch (err) {
      console.error('Simulation error:', err);
      setError(err.message || 'Failed to execute what-if simulation');
    } finally {
      setLoading(false);
    }
  };

  const recAmbulance = simulationResult?.recommended_ambulance;
  const recHospital = simulationResult?.recommended_hospital;
  const score = simulationResult?.priority_score;
  const breakdown = simulationResult?.breakdown;
  const reasoning = simulationResult?.reasoning || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '10px', overflowX: 'hidden' }}>
      {/* Header & Honesty Banner */}
      <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sliders size={14} color="#00f0ff" />
          <span style={{ fontSize: '10px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 800, color: '#00f0ff' }}>
            WHAT-IF SIMULATION ENGINE
          </span>
        </div>

        {/* Honesty Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}>
          <span style={{ fontSize: '8.5px', fontFamily: 'JetBrains Mono, monospace', background: 'rgba(0, 240, 255, 0.12)', color: '#64f6ff', padding: '1px 6px', borderRadius: '10px', border: '1px solid rgba(0, 240, 255, 0.3)' }}>
            PREVIEW ONLY // NOTHING PERSISTED TO OPERATIONS
          </span>
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(255, 59, 48, 0.15)', border: '1px solid #ff3b30', borderRadius: '6px', padding: '6px 8px', fontSize: '9px', color: '#ff3b30' }}>
          {error}
        </div>
      )}

      {/* What-If Input Form Card */}
      <form onSubmit={runSimulation} style={{ background: 'rgba(10, 16, 26, 0.85)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span style={{ fontSize: '9px', fontFamily: 'JetBrains Mono, monospace', color: '#9aa8b8', fontWeight: 700 }}>
          HYPOTHETICAL INCIDENT PARAMETERS
        </span>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '8px', color: '#9aa8b8', marginBottom: '2px' }}>EMERGENCY NATURE</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              style={{ width: '100%', padding: '4px 6px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '4px', color: '#f2f5f8', fontSize: '10px' }}
            >
              <option value="Major Highway Collision">Major Highway Collision</option>
              <option value="Industrial Chemical Release">Industrial Chemical Release</option>
              <option value="Building Fire">Building Fire</option>
              <option value="Medical Emergency / Cardiac">Cardiac Emergency</option>
              <option value="Natural Disaster / Flood">Flash Flood Event</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '8px', color: '#9aa8b8', marginBottom: '2px' }}>SEVERITY TIER</label>
            <select
              value={form.severity}
              onChange={(e) => setForm({ ...form, severity: e.target.value })}
              style={{ width: '100%', padding: '4px 6px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '4px', color: '#f2f5f8', fontSize: '10px' }}
            >
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '8px', color: '#9aa8b8', marginBottom: '2px' }}>TOTAL CASUALTIES</label>
            <input
              type="number"
              min="1"
              max="50"
              value={form.victims}
              onChange={(e) => setForm({ ...form, victims: parseInt(e.target.value) || 1 })}
              style={{ width: '100%', padding: '4px 6px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '4px', color: '#f2f5f8', fontSize: '10px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '8px', color: '#9aa8b8', marginBottom: '2px' }}>CRITICAL PATIENTS</label>
            <input
              type="number"
              min="0"
              max={form.victims}
              value={form.critical_victims}
              onChange={(e) => setForm({ ...form, critical_victims: parseInt(e.target.value) || 0 })}
              style={{ width: '100%', padding: '4px 6px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '4px', color: '#f2f5f8', fontSize: '10px' }}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.3), rgba(10, 132, 255, 0.3))',
            border: '1px solid #00f0ff',
            borderRadius: '6px',
            padding: '7px',
            color: '#00f0ff',
            fontSize: '11px',
            fontFamily: 'JetBrains Mono, monospace',
            fontWeight: 800,
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            marginTop: '4px'
          }}
        >
          {loading ? <Loader2 size={13} className="spin" /> : <Play size={13} />}
          <span>{loading ? 'Simulating...' : 'RUN WHAT-IF SIMULATION'}</span>
        </button>
      </form>

      {/* Simulation Results Preview */}
      {simulationResult && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, overflowY: 'auto' }}>
          {/* Priority Score Output */}
          <div style={{ background: 'rgba(10, 16, 26, 0.85)', border: '1px solid rgba(0, 240, 255, 0.25)', borderRadius: '10px', padding: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '9px', fontFamily: 'JetBrains Mono, monospace', color: '#9aa8b8', fontWeight: 700 }}>
                SIMULATED SEVERITY SCORE
              </span>
              <span style={{ fontSize: '9px', fontFamily: 'JetBrains Mono, monospace', color: '#ff3b30', fontWeight: 800 }}>
                {simulationResult.priority_label}
              </span>
            </div>
            <div style={{ fontSize: '24px', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, color: '#f2f5f8', marginTop: '2px' }}>
              {score} <span style={{ fontSize: '11px', color: '#9aa8b8' }}>/ 100</span>
            </div>

            {breakdown && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', marginTop: '6px', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '4px', fontSize: '8.5px', fontFamily: 'JetBrains Mono, monospace' }}>
                <div>Base: +{breakdown.base_score}</div>
                <div>Casualties: +{breakdown.casualty_points}</div>
                <div>Hazards: +{breakdown.hazard_points}</div>
              </div>
            )}
          </div>

          {/* Recommended Resources */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            <div style={{ background: 'rgba(10, 16, 26, 0.85)', border: '1px solid rgba(0, 240, 255, 0.2)', borderRadius: '8px', padding: '8px' }}>
              <div style={{ fontSize: '8px', fontFamily: 'JetBrains Mono, monospace', color: '#00f0ff', fontWeight: 800 }}>
                RECOMMENDED AMBULANCE
              </div>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#f2f5f8', marginTop: '2px' }}>
                {recAmbulance?.id || 'AMB-003'}
              </div>
              <div style={{ fontSize: '9px', color: '#9aa8b8', fontFamily: 'JetBrains Mono, monospace' }}>
                {recAmbulance?.distance_km} km (~{recAmbulance?.eta_minutes}m ETA)
              </div>
            </div>

            <div style={{ background: 'rgba(10, 16, 26, 0.85)', border: '1px solid rgba(48, 209, 88, 0.2)', borderRadius: '8px', padding: '8px' }}>
              <div style={{ fontSize: '8px', fontFamily: 'JetBrains Mono, monospace', color: '#30d158', fontWeight: 800 }}>
                RECOMMENDED HOSPITAL
              </div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#f2f5f8', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {recHospital?.name || 'RIMS Srikakulam'}
              </div>
              <div style={{ fontSize: '9px', color: '#9aa8b8', fontFamily: 'JetBrains Mono, monospace' }}>
                {recHospital?.beds_available} beds available
              </div>
            </div>
          </div>

          {/* Decision Reasoning */}
          <div style={{ background: 'rgba(10, 16, 26, 0.85)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '10px' }}>
            <span style={{ fontSize: '9px', fontFamily: 'JetBrains Mono, monospace', color: '#00f0ff', fontWeight: 800, display: 'block', marginBottom: '4px' }}>
              SIMULATED REASONING TRACE:
            </span>
            <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '9.5px', color: '#e0e2ea', lineHeight: 1.4 }}>
              {reasoning.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
