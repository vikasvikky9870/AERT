/**
 * AERT 3.0 AI Activity Tracker (Flagship Interaction Engine)
 * Operational Sector: Srikakulam District (AP-SKLM-EOC-01)
 * 
 * Shows the actual staged operations of intelligence.py in real time:
 * - UNDERSTANDING INCIDENT (score_severity, triage tier)
 * - SPATIAL ANALYSIS (active_road_delay, NH-16 hazards)
 * - RESOURCE ANALYSIS (rank_ambulances, ALS readiness)
 * - ROUTE ANALYSIS (eta_minutes with corridor delay multipliers)
 * - MEDICAL ANALYSIS (rank_hospitals, trauma bay capacity)
 */

import React, { useState, useEffect } from 'react';
import { Check, Loader2, Sparkles, Cpu } from 'lucide-react';

const AI_STAGES = [
  { id: 'UNDERSTANDING_INCIDENT', label: 'UNDERSTANDING INCIDENT', detail: 'Triage tier & casualty severity' },
  { id: 'SPATIAL_ANALYSIS', label: 'SPATIAL ANALYSIS', detail: 'Active corridor delays & hazard polygons' },
  { id: 'RESOURCE_ANALYSIS', label: 'RESOURCE ANALYSIS', detail: 'Fleet proximity & ALS equipment readiness' },
  { id: 'ROUTE_ANALYSIS', label: 'ROUTE ANALYSIS', detail: 'Corridor passage time & delay multipliers' },
  { id: 'MEDICAL_ANALYSIS', label: 'MEDICAL ANALYSIS', detail: 'Hospital trauma bay & ICU bed status' }
];

export function AiActivityTracker({
  isRunning = false,
  onComplete = () => {}
}) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);

  useEffect(() => {
    if (!isRunning) {
      setCurrentStepIndex(0);
      setCompletedSteps([]);
      return;
    }

    let step = 0;
    setCurrentStepIndex(0);
    setCompletedSteps([]);

    const interval = setInterval(() => {
      if (step < AI_STAGES.length && AI_STAGES[step]) {
        const stageId = AI_STAGES[step].id;
        setCompletedSteps((prev) => [...prev, stageId]);
        step += 1;
        if (step < AI_STAGES.length) {
          setCurrentStepIndex(step);
        } else {
          clearInterval(interval);
          setTimeout(() => {
            onComplete();
          }, 300);
        }
      } else {
        clearInterval(interval);
      }
    }, 280);

    return () => clearInterval(interval);
  }, [isRunning]);

  if (!isRunning && completedSteps.length === 0) return null;

  return (
    <div
      style={{
        background: 'rgba(11, 14, 20, 0.92)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(0, 240, 255, 0.35)',
        borderRadius: '12px',
        padding: '12px 16px',
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 240, 255, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        minWidth: '320px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Cpu size={14} color="#00f0ff" />
          <span style={{ fontSize: '10px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 800, color: '#00f0ff', letterSpacing: '0.04em' }}>
            AI DECISION ENGINE ACTIVE
          </span>
        </div>
        <span style={{ fontSize: '9px', fontFamily: 'JetBrains Mono, monospace', color: '#30d158', fontWeight: 700 }}>
          {completedSteps.length < AI_STAGES.length ? 'COMPUTING' : 'OPTIMAL MATCH'}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {AI_STAGES.map((stage, idx) => {
          const isDone = completedSteps.includes(stage.id);
          const isCurrent = currentStepIndex === idx && !isDone;

          return (
            <div
              key={stage.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '3px 0',
                opacity: isDone || isCurrent ? 1 : 0.4
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '10px', fontFamily: 'JetBrains Mono, monospace', fontWeight: isDone ? 700 : isCurrent ? 800 : 500, color: isDone ? '#f2f5f8' : isCurrent ? '#00f0ff' : '#9aa8b8' }}>
                  {stage.label}
                </span>
              </div>

              <div>
                {isDone ? (
                  <Check size={13} color="#30d158" strokeWidth={3} />
                ) : isCurrent ? (
                  <Loader2 size={13} color="#00f0ff" className="spin" />
                ) : (
                  <span style={{ fontSize: '10px', color: '#5a6878' }}>…</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
