/**
 * AERT 3.0 Tactical Top Command Bar (Spatial Header)
 * Sector: Srikakulam District (AP-SKLM-EOC-01)
 */

import React, { useState, useEffect } from 'react';
import { Shield, Search, Cpu, Volume2, VolumeX, Activity, Play, Globe, Map } from 'lucide-react';
import { Badge } from './Badge';

export function TopCommandBar({
  activeIncidentsCount = 3,
  aiStatus = 'ONLINE',
  onOpenSearch,
  soundEnabled = true,
  onToggleSound,
  onOpenGoldenSlice,
  activeMode = 'map',
  onModeChange = () => {},
  onOpenSitrep = () => {},
  sector = 'Srikakulam EOC (AP-SKLM-EOC-01)'
}) {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }) + ' IST'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '52px',
        zIndex: 900,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        backgroundColor: 'rgba(6, 9, 14, 0.9)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-subtle)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.6)',
      }}
    >
      {/* Brand & System Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(0, 240, 255, 0.15)',
              border: '1px solid var(--accent-cyan)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 10px rgba(0, 240, 255, 0.25)',
            }}
          >
            <Shield size={16} style={{ color: 'var(--accent-cyan)' }} />
          </div>
          <div>
            <div
              style={{
                fontSize: '0.9rem',
                fontWeight: 800,
                letterSpacing: '0.08em',
                color: 'var(--text-primary)',
                lineHeight: 1,
              }}
            >
              AERT <span style={{ color: 'var(--accent-cyan)', fontSize: '0.8em' }}>3.0</span>
            </div>
            <div
              style={{
                fontSize: '0.62rem',
                color: 'var(--text-muted)',
                letterSpacing: '0.06em',
                marginTop: '2px',
                fontFamily: 'JetBrains Mono, monospace'
              }}
            >
              AI EMERGENCY OS
            </div>
          </div>
        </div>

        <div style={{ width: '1px', height: '22px', backgroundColor: 'var(--border-subtle)' }} />

        {/* Sector Label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#30d158', boxShadow: '0 0 6px #30d158' }}></div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>
            {sector}
          </span>
        </div>

        <Badge variant="critical">
          LIVE OPERATIONS
        </Badge>
      </div>

      {/* Center 2D / 3D Spatial Mode Switcher & Search Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Spatial 2D / 3D Switch */}
        <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '2px' }}>
          <button
            onClick={() => onModeChange('map')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              borderRadius: 'var(--radius-xs)',
              border: 'none',
              background: activeMode === 'map' ? 'rgba(0, 240, 255, 0.2)' : 'transparent',
              color: activeMode === 'map' ? '#00f0ff' : '#9aa8b8',
              fontSize: '0.72rem',
              fontWeight: 700,
              fontFamily: 'JetBrains Mono, monospace',
              cursor: 'pointer'
            }}
          >
            <Map size={12} />
            2D GIS
          </button>

          <button
            onClick={() => onModeChange('twin')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              borderRadius: 'var(--radius-xs)',
              border: 'none',
              background: activeMode === 'twin' ? 'rgba(191, 90, 242, 0.25)' : 'transparent',
              color: activeMode === 'twin' ? '#bf5af2' : '#9aa8b8',
              fontSize: '0.72rem',
              fontWeight: 700,
              fontFamily: 'JetBrains Mono, monospace',
              cursor: 'pointer'
            }}
          >
            <Globe size={12} />
            3D TWIN (M)
          </button>
        </div>

        {/* Omnibar Search Trigger */}
        <button
          onClick={onOpenSearch}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '5px 14px',
            width: '240px',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-pill)',
            color: 'var(--text-muted)',
            fontSize: '0.78rem',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
          }}
        >
          <Search size={13} style={{ color: 'var(--accent-cyan)' }} />
          <span style={{ flex: 1, textAlign: 'left' }}>Search workspace...</span>
          <kbd
            className="mono"
            style={{
              fontSize: '0.65rem',
              padding: '1px 5px',
              borderRadius: '3px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: 'var(--text-secondary)',
            }}
          >
            ⌘K
          </kbd>
        </button>

        {/* Golden Slice Button */}
        <button
          onClick={onOpenGoldenSlice}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 12px',
            borderRadius: 'var(--radius-pill)',
            border: '1px solid rgba(0, 240, 255, 0.5)',
            backgroundColor: 'rgba(0, 240, 255, 0.15)',
            color: 'var(--accent-cyan)',
            fontSize: '0.75rem',
            fontWeight: 800,
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
            boxShadow: '0 0 10px rgba(0, 240, 255, 0.25)',
          }}
        >
          <Play size={12} fill="var(--accent-cyan)" />
          <span>GOLDEN SLICE (G)</span>
        </button>
      </div>

      {/* Right Telemetry & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Real-time Clock */}
        <div
          className="mono"
          style={{
            fontSize: '0.8rem',
            color: 'var(--text-mono-cyan)',
            fontWeight: 600,
            letterSpacing: '0.04em',
          }}
        >
          {timeStr}
        </div>

        <div style={{ width: '1px', height: '22px', backgroundColor: 'var(--border-subtle)' }} />

        {/* Audio Toggle */}
        <button
          onClick={onToggleSound}
          style={{
            background: 'transparent',
            border: 'none',
            color: soundEnabled ? 'var(--accent-cyan)' : 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
          }}
          title={soundEnabled ? 'Mute Alert Audio' : 'Enable Alert Audio'}
        >
          {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>
      </div>
    </header>
  );
}
