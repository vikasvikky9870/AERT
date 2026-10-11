/**
 * AERT 3.0 Unified Spatial Canvas
 * Operational Sector: Srikakulam District (AP-SKLM-EOC-01)
 * 
 * Map-First Operating Environment:
 * - High-Definition MapLibre GL WebGL Spatial Engine (75% of visual attention)
 * - Restrained contextual interface (25%)
 * - Support for Spatial Lenses and Temporal Simulation
 */

import React from 'react';
import { Tactical2DMap } from '../map/Tactical2DMap';

export function SpatialCanvas({
  incidents = [],
  responders = [],
  hospitals = [],
  roadEvents = [],
  activeRoute = null,
  selectedEntity = null,
  onSelectEntity = () => {},
  spatialLens = 'OPERATIONAL',
  simTimeMinutes = 0,
  followAmbulanceId = null,
  isPreAlertActive = false,
  coordinatePickEnabled = false,
  onCoordinatePick = () => {}
}) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', background: '#06090e' }}>
      <Tactical2DMap
        incidents={incidents}
        responders={responders}
        hospitals={hospitals}
        roadEvents={roadEvents}
        activeRoute={activeRoute}
        selectedEntity={selectedEntity}
        onSelectEntity={onSelectEntity}
        spatialLens={spatialLens}
        simTimeMinutes={simTimeMinutes}
        followAmbulanceId={followAmbulanceId}
        isPreAlertActive={isPreAlertActive}
        coordinatePickEnabled={coordinatePickEnabled}
        onCoordinatePick={onCoordinatePick}
      />
    </div>
  );
}
