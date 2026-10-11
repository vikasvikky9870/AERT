/**
 * AERT 3.0 Floating Minimal Top Bar (Agency Shell Spec)
 * Operational Sector: Srikakulam District (AP-SKLM-EOC-01)
 * 
 * Visual Spec:
 * - Logo/wordmark top-left, small and restrained: "AERT // SRIKAKULAM EOC"
 * - Top-right: Single status pill (LIVE indicator) + One primary action button ("+ New Incident")
 * - Single-CTA pattern, no stacked clutter, glass panel over atmospheric substrate
 */

import React, { useState, useEffect } from 'react';
import { Plus, Radio, Clock, Shield, Search } from 'lucide-react';

export function CommandTopBar({
  sector = 'SRIKAKULAM EOC',
  activeIncidentsCount = 4,
  onOpenCreateIncident = () => {},
  onOpenSearch = () => {}
}) {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-IN', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }) + ' IST'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        position: 'absolute',
        top: '16px',
        left: '20px',
        right: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        pointerEvents: 'none',
        zIndex: 40
      }}
    >
      {/* Top-Left: Restrained Brand Wordmark & System Sector */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          padding: '6px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          pointerEvents: 'auto',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#30d158', boxShadow: '0 0 8px #30d158' }} />
          <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: '12px', color: '#f2f5f8', letterSpacing: '0.04em' }}>
            AERT <span style={{ color: '#00f0ff', fontWeight: 600 }}>//</span> {sector}
          </span>
        </div>

        <div style={{ height: '12px', width: '1px', background: 'rgba(255, 255, 255, 0.12)' }} />

        {/* Sector Time */}
        <span style={{ fontSize: '10.5px', fontFamily: 'JetBrains Mono, monospace', color: '#9aa8b8' }}>
          {timeStr || '14:32:00 IST'}
        </span>
      </div>

      {/* Top-Center: Quick Search Trigger */}
      <div
        onClick={onOpenSearch}
        style={{
          background: 'rgba(255, 255, 255, 0.04)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '20px',
          padding: '5px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          pointerEvents: 'auto',
          transition: 'all 0.15s ease'
        }}
        title="Tactical Command Search (Ctrl+K)"
      >
        <Search size={13} color="#9aa8b8" />
        <span style={{ fontSize: '11px', fontFamily: 'Inter, sans-serif', color: '#9aa8b8' }}>
          Search command or incident...
        </span>
        <kbd style={{ background: 'rgba(255, 255, 255, 0.06)', borderRadius: '4px', padding: '1px 5px', fontSize: '9px', fontFamily: 'JetBrains Mono, monospace', color: '#7a8898' }}>
          Ctrl+K
        </kbd>
      </div>

      {/* Top-Right: Single Status Pill + Single Primary Action (New Incident) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          pointerEvents: 'auto'
        }}
      >
        {/* Single Status Pill: LIVE */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '20px',
            padding: '5px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)'
          }}
        >
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#30d158', boxShadow: '0 0 6px #30d158' }} />
          <span style={{ fontSize: '10px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 800, color: '#f2f5f8' }}>
            LIVE
          </span>
          <span style={{ fontSize: '9.5px', fontFamily: 'JetBrains Mono, monospace', color: '#ff3b30', background: 'rgba(255, 59, 48, 0.15)', padding: '1px 6px', borderRadius: '10px' }}>
            {activeIncidentsCount} ACTIVE
          </span>
        </div>

        {/* Single Primary Action: "+ New Incident" */}
        <button
          onClick={onOpenCreateIncident}
          style={{
            background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.2), rgba(10, 132, 255, 0.25))',
            border: '1px solid rgba(0, 240, 255, 0.5)',
            borderRadius: '20px',
            padding: '6px 14px',
            color: '#00f0ff',
            fontSize: '11px',
            fontFamily: 'Space Grotesk, sans-serif',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)'
          }}
        >
          <Plus size={14} color="#00f0ff" />
          <span>New Incident</span>
        </button>
      </div>
    </div>
  );
}
