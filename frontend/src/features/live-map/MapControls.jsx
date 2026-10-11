import React from 'react';
import { Plus, Minus, Compass, Layers, Eye, EyeOff } from 'lucide-react';

/**
 * Floating Tactical Map Zoom & Compass Controls
 */
export function MapControls({ onZoomIn, onZoomOut, onResetNorth, onToggleLayers, layersOpen }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: '70px',
        right: '16px',
        zIndex: 800,
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
      }}
    >
      <button
        onClick={onZoomIn}
        style={controlButtonStyle}
        title="Zoom In"
      >
        <Plus size={16} />
      </button>
      <button
        onClick={onZoomOut}
        style={controlButtonStyle}
        title="Zoom Out"
      >
        <Minus size={16} />
      </button>
      <button
        onClick={onResetNorth}
        style={controlButtonStyle}
        title="Reset North Pitch & Bearing"
      >
        <Compass size={16} />
      </button>

      <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)', margin: '4px 0' }} />

      <button
        onClick={onToggleLayers}
        style={{
          ...controlButtonStyle,
          backgroundColor: layersOpen ? 'rgba(0, 240, 255, 0.2)' : 'rgba(8, 14, 22, 0.85)',
          color: layersOpen ? 'var(--accent-cyan)' : 'var(--text-secondary)',
          borderColor: layersOpen ? 'var(--accent-cyan)' : 'var(--border-medium)',
        }}
        title="Toggle Map Layers Panel"
      >
        <Layers size={16} />
      </button>
    </div>
  );
}

/**
 * Layer Manager Drawer Widget
 */
export function LayerControls({ activeLayers, onToggleLayer, isOpen }) {
  if (!isOpen) return null;

  const layersList = [
    { id: 'incidents', label: 'Active Incidents', key: 'incidents' },
    { id: 'responders', label: 'Responder Fleet', key: 'responders' },
    { id: 'hospitals', label: 'Hospitals & Trauma Centers', key: 'hospitals' },
    { id: 'routes', label: 'Active Route Vectors', key: 'routes' },
    { id: 'traffic', label: 'Traffic Congestion', key: 'traffic' },
    { id: 'hazards', label: 'Hazard Geofences', key: 'hazards' },
  ];

  return (
    <div
      style={{
        position: 'absolute',
        top: '70px',
        right: '60px',
        zIndex: 800,
        width: '240px',
        backgroundColor: 'rgba(8, 14, 22, 0.90)',
        backdropFilter: 'blur(16px)',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-panel)',
        padding: '12px 14px',
      }}
    >
      <div
        style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          color: 'var(--text-secondary)',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          marginBottom: '10px',
        }}
      >
        Tactical GIS Layers
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {layersList.map((layer) => {
          const isActive = activeLayers[layer.key];
          return (
            <div
              key={layer.id}
              onClick={() => onToggleLayer(layer.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 10px',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: isActive ? 'rgba(0, 240, 255, 0.08)' : 'transparent',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              <span style={{ fontSize: '0.8rem', color: isActive ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                {layer.label}
              </span>
              {isActive ? (
                <Eye size={14} style={{ color: 'var(--accent-cyan)' }} />
              ) : (
                <EyeOff size={14} style={{ color: 'var(--text-muted)' }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const controlButtonStyle = {
  width: '36px',
  height: '36px',
  borderRadius: 'var(--radius-sm)',
  backgroundColor: 'rgba(8, 14, 22, 0.85)',
  backdropFilter: 'blur(12px)',
  border: '1px solid var(--border-medium)',
  color: 'var(--text-primary)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all var(--transition-fast)',
  boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
};
