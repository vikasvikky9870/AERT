/**
 * AERT 3.0 — AI Emergency Response & Digital Twin Operating System
 * Primary Operational Sector: Srikakulam District, Andhra Pradesh, India (AP-SKLM-EOC-01)
 * Default Center: [83.8961, 18.2969]
 */

import React, { useState, useEffect } from 'react';
import { GoogleEocShell } from './google-eoc/GoogleEocShell';
import { OperationalShell } from './app/OperationalShell';
import { MapLabWorkspace } from './features/map-lab/MapLabWorkspace';
import { operationalStore } from './state/operationalState';
import { soundManager } from './services/soundManager';

export default function App() {
  const isMapLab =
    typeof window !== 'undefined' &&
    (window.location.pathname === '/map-lab' ||
     window.location.pathname.startsWith('/map-lab') ||
     window.location.hash === '#map-lab' ||
     window.location.search.includes('map-lab'));

  const isLegacy =
    typeof window !== 'undefined' &&
    (window.location.search.includes('legacy') || window.location.hash === '#legacy');

  const [soundEnabled, setSoundEnabled] = useState(true);

  // Sync sound manager enabled state
  useEffect(() => {
    soundManager.setEnabled(soundEnabled);
  }, [soundEnabled]);

  if (isMapLab) {
    return <MapLabWorkspace />;
  }

  if (isLegacy) {
    return (
      <OperationalShell
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
      />
    );
  }

  return (
    <GoogleEocShell
      soundEnabled={soundEnabled}
      onToggleSound={() => setSoundEnabled((prev) => !prev)}
    />
  );
}