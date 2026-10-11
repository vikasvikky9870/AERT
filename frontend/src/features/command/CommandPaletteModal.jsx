/**
 * AERT 3.0 Tactical Command Palette (Cmd/Ctrl + K)
 * Operational Sector: Srikakulam District (AP-SKLM-EOC-01)
 * 
 * Understands structured commands & tactical intentions:
 * - "Show critical incidents"
 * - "Find nearest ALS ambulance"
 * - "Focus on RIMS"
 * - "Show blocked roads"
 * - "Follow AMB-001"
 * - "Switch to 3D"
 * - "Run NH-16 simulation"
 * - "Compare hospitals"
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  AlertTriangle,
  Ambulance,
  Building2,
  Globe,
  Sliders,
  Sparkles,
  ArrowRight,
  X,
  Radio,
  Layers
} from 'lucide-react';
import { soundManager } from '../../services/soundManager';

const PRESET_COMMANDS = [
  { id: 'crit-inc', label: 'Show critical incidents', category: 'INCIDENT', icon: AlertTriangle, color: '#ff3b30' },
  { id: 'find-als', label: 'Find nearest ALS ambulance', category: 'FLEET', icon: Ambulance, color: '#00f0ff' },
  { id: 'focus-rims', label: 'Focus on RIMS Srikakulam Trauma Campus', category: 'MEDICAL', icon: Building2, color: '#30d158' },
  { id: 'switch-3d', label: 'Switch to 3D Digital Twin', category: 'SPATIAL', icon: Globe, color: '#00f0ff' },
  { id: 'sim-nh16', label: 'Run NH-16 collision simulation', category: 'SIMULATION', icon: Sliders, color: '#ff9500' },
  { id: 'show-roads', label: 'Show blocked roads & hazard detour', category: 'GEO', icon: Layers, color: '#ff9500' },
  { id: 'follow-amb', label: 'Follow AMB-001 live telemetry vector', category: 'FLEET', icon: Radio, color: '#00f0ff' }
];

export function CommandPaletteModal({
  isOpen = false,
  onClose = () => {},
  incidents = [],
  ambulances = [],
  hospitals = [],
  onSelectEntity = () => {},
  onToggle3D = () => {},
  onStartSimulation = () => {}
}) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Filter commands and entities
  const filteredCommands = PRESET_COMMANDS.filter((cmd) =>
    cmd.label.toLowerCase().includes(query.toLowerCase())
  );

  const filteredIncidents = incidents.filter((i) =>
    i.id.toLowerCase().includes(query.toLowerCase()) ||
    i.type.toLowerCase().includes(query.toLowerCase()) ||
    i.location.toLowerCase().includes(query.toLowerCase())
  );

  const filteredAmbulances = ambulances.filter((a) =>
    a.id.toLowerCase().includes(query.toLowerCase()) ||
    a.tier.toLowerCase().includes(query.toLowerCase())
  );

  const handleExecuteCommand = (cmd) => {
    soundManager.playClickTone();
    if (cmd.id === 'crit-inc') {
      const crit = incidents.find((i) => i.severity === 'CRITICAL') || incidents[0];
      if (crit) onSelectEntity({ type: 'incident', coordinates: crit.coordinates, data: crit });
    } else if (cmd.id === 'find-als') {
      const als = ambulances.find((a) => a.tier === 'ALS') || ambulances[0];
      if (als) onSelectEntity({ type: 'ambulance', coordinates: als.coordinates, data: als });
    } else if (cmd.id === 'focus-rims') {
      const rims = hospitals.find((h) => h.id === 'HOS-001') || hospitals[0];
      if (rims) onSelectEntity({ type: 'hospital', coordinates: rims.coordinates, data: rims });
    } else if (cmd.id === 'switch-3d') {
      onToggle3D();
    } else if (cmd.id === 'sim-nh16') {
      onStartSimulation('nh16_collision');
    } else if (cmd.id === 'follow-amb') {
      const amb = ambulances[0];
      if (amb) onSelectEntity({ type: 'ambulance', coordinates: amb.coordinates, data: amb });
    }
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(6, 9, 14, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '12vh',
        zIndex: 999
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          backgroundColor: 'rgba(8, 14, 23, 0.96)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(0, 240, 255, 0.4)',
          borderRadius: '10px',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.9), 0 0 30px rgba(0, 240, 255, 0.2)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input Bar */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <Search size={18} color="#00f0ff" style={{ marginRight: '10px' }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type tactical command or search entities (e.g. 'Show critical', 'RIMS')..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#f2f5f8',
              fontSize: '13px',
              fontFamily: 'Inter, sans-serif'
            }}
          />
          <kbd style={{ background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', padding: '2px 6px', fontSize: '10px', fontFamily: 'JetBrains Mono, monospace', color: '#9aa8b8' }}>
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div style={{ maxHeight: '340px', overflowY: 'auto', padding: '8px' }}>
          {/* Preset Commands */}
          <div style={{ fontSize: '9px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 800, color: '#00f0ff', padding: '4px 8px' }}>
            STRUCTURED TACTICAL ACTIONS
          </div>
          {filteredCommands.map((cmd) => {
            const Icon = cmd.icon;
            return (
              <div
                key={cmd.id}
                onClick={() => handleExecuteCommand(cmd)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  background: 'rgba(255, 255, 255, 0.02)',
                  marginBottom: '2px',
                  transition: 'all 0.1s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 240, 255, 0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icon size={16} color={cmd.color} />
                  <span style={{ fontSize: '12px', fontFamily: 'Inter, sans-serif', color: '#f2f5f8' }}>
                    {cmd.label}
                  </span>
                </div>
                <span style={{ fontSize: '9px', fontFamily: 'JetBrains Mono, monospace', color: cmd.color, border: `1px solid ${cmd.color}40`, padding: '1px 5px', borderRadius: '3px' }}>
                  {cmd.category}
                </span>
              </div>
            );
          })}

          {/* Quick Incidents */}
          {filteredIncidents.length > 0 && (
            <>
              <div style={{ fontSize: '9px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 800, color: '#ff3b30', padding: '8px 8px 4px 8px' }}>
                MATCHING INCIDENTS
              </div>
              {filteredIncidents.map((inc) => (
                <div
                  key={inc.id}
                  onClick={() => {
                    onSelectEntity({ type: 'incident', coordinates: inc.coordinates, data: inc });
                    onClose();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    background: 'rgba(255, 255, 255, 0.02)',
                    marginBottom: '2px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 59, 48, 0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertTriangle size={14} color="#ff3b30" />
                    <span style={{ fontSize: '12px', fontFamily: 'Inter, sans-serif', color: '#f2f5f8' }}>
                      {inc.id}: {inc.type} ({inc.location})
                    </span>
                  </div>
                  <span style={{ fontSize: '9px', fontFamily: 'JetBrains Mono, monospace', color: '#ff3b30' }}>
                    {inc.severity}
                  </span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
