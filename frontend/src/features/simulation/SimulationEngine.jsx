import React, { useState, useEffect } from 'react';
import { Panel } from '../../design-system/components/Panel';
import { Badge } from '../../design-system/components/Badge';
import { Button } from '../../design-system/components/Button';
import { SCENARIO_PRESETS } from '../../config/scenarioPresets';
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
  AlertTriangle,
  Flame,
  Radio,
  Clock,
  Zap,
  Activity,
  Layers,
  Sparkles,
  Building2,
  Ambulance,
  Compass,
} from 'lucide-react';

/**
 * Emergency Scenario Simulation & Multi-Hazard Stress-Test Engine
 */
export function SimulationEngine({
  onInjectHazard,
  onResetSimulation,
  onSpeedChange,
  onSelectPreset,
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [simTime, setSimTime] = useState(0); // in seconds (0 to 1800s / 30 mins)
  const [speed, setSpeed] = useState(1); // 1x, 2x, 5x, 10x
  const [activeScenarioId, setActiveScenarioId] = useState(SCENARIO_PRESETS[0].id);
  const [injectedHazards, setInjectedHazards] = useState({
    nh16Blocked: false,
    hospitalSurge: false,
    toxicVapor: true,
  });

  const currentPreset = SCENARIO_PRESETS.find((s) => s.id === activeScenarioId) || SCENARIO_PRESETS[0];

  // Simulation Clock Tick Loop
  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setSimTime((prev) => {
          if (prev >= 1800) {
            setIsPlaying(false);
            return 1800;
          }
          return prev + 1 * speed;
        });
      }, 1000 / speed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, speed]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `T+${m}:${s}`;
  };

  const handleToggleHazard = (hazardKey) => {
    const updated = { ...injectedHazards, [hazardKey]: !injectedHazards[hazardKey] };
    setInjectedHazards(updated);
    onInjectHazard && onInjectHazard(hazardKey, updated[hazardKey]);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setSimTime(0);
    onResetSimulation && onResetSimulation();
  };

  const handleScenarioChange = (scenarioId) => {
    setActiveScenarioId(scenarioId);
    handleReset();
    const preset = SCENARIO_PRESETS.find((s) => s.id === scenarioId);
    if (preset) {
      onSelectPreset && onSelectPreset(preset);
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: '70px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '880px',
        maxWidth: '92vw',
        zIndex: 850,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}
    >
      {/* 1. Main Timeline & Playback Controller Bar */}
      <Panel
        title="EMERGENCY SIMULATION & MULTI-HAZARD STRESS-TEST"
        subtitle={`Active: ${currentPreset.title}`}
        variant="glow-cyan"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Scenario Selector & Category Pills */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: '10px',
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Compass size={16} style={{ color: 'var(--accent-cyan)' }} />
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                DISASTER SCENARIO:
              </span>
              <select
                value={activeScenarioId}
                onChange={(e) => handleScenarioChange(e.target.value)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-xs)',
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  border: '1px solid var(--border-glow-cyan)',
                  color: 'var(--text-primary)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                {SCENARIO_PRESETS.map((p) => (
                  <option key={p.id} value={p.id} style={{ backgroundColor: '#06090e' }}>
                    [{p.category}] {p.title}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Badge variant={currentPreset.severity} pulse={currentPreset.severity === 'critical'}>
                {currentPreset.severity.toUpperCase()}
              </Badge>
              <Badge variant="cyan">{currentPreset.casualties} CASUALTIES</Badge>
            </div>
          </div>

          {/* Controls & Metrics Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Button
                variant={isPlaying ? 'danger' : 'primary'}
                size="md"
                icon={isPlaying ? Pause : Play}
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? 'PAUSE' : 'RUN SIMULATION'}
              </Button>
              <Button variant="secondary" size="sm" icon={RotateCcw} onClick={handleReset}>
                Reset
              </Button>
              <div style={{ display: 'flex', gap: '4px', marginLeft: '6px' }}>
                {[1, 2, 5, 10].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => {
                      setSpeed(spd);
                      onSpeedChange && onSpeedChange(spd);
                    }}
                    style={{
                      padding: '4px 8px',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      backgroundColor: speed === spd ? 'rgba(0, 240, 255, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                      border: speed === spd ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-xs)',
                      color: speed === spd ? 'var(--accent-cyan)' : 'var(--text-muted)',
                      cursor: 'pointer',
                    }}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>

            {/* Simulation Real-time Timestamp */}
            <div
              className="mono"
              style={{
                fontSize: '1.1rem',
                fontWeight: 700,
                color: 'var(--text-mono-cyan)',
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                padding: '4px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <Clock size={14} style={{ display: 'inline', marginRight: '6px' }} />
              {formatTime(simTime)} / 30:00
            </div>
          </div>

          {/* Timeline Scrubber Bar */}
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              type="range"
              min={0}
              max={1800}
              value={simTime}
              onChange={(e) => setSimTime(Number(e.target.value))}
              style={{
                width: '100%',
                accentColor: 'var(--accent-cyan)',
                cursor: 'pointer',
              }}
            />
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.68rem',
                color: 'var(--text-muted)',
                marginTop: '2px',
              }}
            >
              <span>T+00:00 (Incident Intake)</span>
              <span>T+05:00 (Units On Scene)</span>
              <span>T+15:00 (Hospital Arrival)</span>
              <span>T+30:00 (Sector Stabilized)</span>
            </div>
          </div>

          {/* 2. Cascading Hazard Stress-Test Injection Switches */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              backgroundColor: 'rgba(8, 14, 22, 0.8)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={15} style={{ color: 'var(--status-warning)' }} />
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                DYNAMIC STRESS-TEST INJECTIONS:
              </span>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => handleToggleHazard('nh16Blocked')}
                style={{
                  padding: '4px 10px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  backgroundColor: injectedHazards.nh16Blocked
                    ? 'rgba(255, 59, 48, 0.25)'
                    : 'rgba(255, 255, 255, 0.04)',
                  border: injectedHazards.nh16Blocked
                    ? '1px solid var(--border-glow-critical)'
                    : '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-xs)',
                  color: injectedHazards.nh16Blocked ? '#ffffff' : 'var(--text-muted)',
                  cursor: 'pointer',
                }}
              >
                🚨 Block NH-16 Highway
              </button>

              <button
                onClick={() => handleToggleHazard('hospitalSurge')}
                style={{
                  padding: '4px 10px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  backgroundColor: injectedHazards.hospitalSurge
                    ? 'rgba(255, 204, 0, 0.25)'
                    : 'rgba(255, 255, 255, 0.04)',
                  border: injectedHazards.hospitalSurge
                    ? '1px solid var(--status-warning)'
                    : '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-xs)',
                  color: injectedHazards.hospitalSurge ? '#ffffff' : 'var(--text-muted)',
                  cursor: 'pointer',
                }}
              >
                🏥 Surge RIMS Hospital (100% Load)
              </button>

              <button
                onClick={() => handleToggleHazard('toxicVapor')}
                style={{
                  padding: '4px 10px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  backgroundColor: injectedHazards.toxicVapor
                    ? 'rgba(0, 240, 255, 0.25)'
                    : 'rgba(255, 255, 255, 0.04)',
                  border: injectedHazards.toxicVapor
                    ? '1px solid var(--accent-cyan)'
                    : '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-xs)',
                  color: injectedHazards.toxicVapor ? 'var(--accent-cyan)' : 'var(--text-muted)',
                  cursor: 'pointer',
                }}
              >
                ☣️ Toxic Vapor Plume Active
              </button>
            </div>
          </div>
        </div>
      </Panel>
    </div>
  );
}
