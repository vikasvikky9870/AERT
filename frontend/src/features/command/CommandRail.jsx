/**
 * AERT 3.0 Floating Minimal Navigation Rail (Agency Shell Spec)
 * Operational Sector: Srikakulam District (AP-SKLM-EOC-01)
 * 
 * Floating Agency Dock:
 * - Condensed icon rail down the left (collapsible icon + label)
 * - 8 Core Operational Views (Command, Incident, Fleet, Medical, Road Intel, AI Support, Simulation, Analytics)
 * - Strict ban on 3D centerpieces per Visual System Addendum
 */

import React, { useState } from 'react';
import {
  Compass,
  AlertTriangle,
  Ambulance,
  Building2,
  Layers,
  Cpu,
  PlayCircle,
  BarChart3
} from 'lucide-react';
import { soundManager } from '../../services/soundManager';

const OPERATIONAL_MODES = [
  { id: '01 COMMAND', label: 'COMMAND', icon: Compass, shortcut: '1' },
  { id: '02 LIVE INCIDENT', label: 'INCIDENTS', icon: AlertTriangle, shortcut: '2' },
  { id: '03 RESPONSE', label: 'FLEET', icon: Ambulance, shortcut: '3' },
  { id: '04 MEDICAL', label: 'HOSPITALS', icon: Building2, shortcut: '4' },
  { id: '05 GEO INTELLIGENCE', label: 'ROADS', icon: Layers, shortcut: '5' },
  { id: '06 AI OPERATIONS', label: 'AI BRAIN', icon: Cpu, shortcut: '6' },
  { id: '08 SIMULATION', label: 'SIMULATION', icon: PlayCircle, shortcut: '7' },
  { id: '09 ANALYTICS', label: 'ANALYTICS', icon: BarChart3, shortcut: '8' }
];

export function CommandRail({
  activeMode = '01 COMMAND',
  onSelectMode = () => {}
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'absolute',
        top: '50%',
        left: '20px',
        transform: 'translateY(-50%)',
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        padding: '8px 6px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        zIndex: 40,
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
        pointerEvents: 'auto',
        transition: 'width 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
        width: isHovered ? '140px' : '46px',
        overflow: 'hidden'
      }}
    >
      {OPERATIONAL_MODES.map((mode) => {
        const Icon = mode.icon;
        const isActive = activeMode === mode.id;

        return (
          <button
            key={mode.id}
            onClick={() => {
              soundManager.playClickTone();
              onSelectMode(mode.id);
            }}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 10px',
              borderRadius: '10px',
              border: 'none',
              background: isActive ? 'rgba(0, 240, 255, 0.15)' : 'transparent',
              color: isActive ? '#00f0ff' : '#9aa8b8',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease'
            }}
            title={`${mode.label} (${mode.shortcut})`}
          >
            <Icon size={16} color={isActive ? '#00f0ff' : '#9aa8b8'} style={{ minWidth: '16px' }} />

            {isHovered && (
              <span
                style={{
                  fontSize: '10px',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontWeight: isActive ? 800 : 500,
                  letterSpacing: '0.04em'
                }}
              >
                {mode.label}
              </span>
            )}

            {isActive && (
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: '20%',
                  bottom: '20%',
                  width: '2px',
                  background: '#00f0ff',
                  borderRadius: '0 2px 2px 0'
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
