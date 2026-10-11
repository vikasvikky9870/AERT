import React from "react";
import { Compass, Eye, Layers, Navigation, Radio, Shield, Box, Crosshair } from "lucide-react";

export function SpatialHUD({
  mode = "2D", // 2D | 3D | TERRAIN
  pitch = 0,
  bearing = 0,
  zoom = 13.5,
  center = [83.8961, 18.2969],
  onToggleMode = null,
  onResetView = null,
  activeLayers = {},
  onToggleLayer = null,
}) {
  return (
    <div className="spatial-hud-overlay">
      {/* TOP COMPASS & COORDINATE TELEMETRY */}
      <div className="hud-top-telemetry">
        <div className="hud-pill-group">
          <div className="hud-item hud-sector">
            <Radio size={13} className="text-nominal animate-pulse" />
            <span>SECTOR: <strong>SRIKAKULAM (AP-SKLM-01)</strong></span>
          </div>

          <div className="hud-item hud-coords">
            <Crosshair size={13} className="text-tactical" />
            <span>
              LON: <strong>{center[0]?.toFixed(4)}°E</strong> • LAT: <strong>{center[1]?.toFixed(4)}°N</strong>
            </span>
          </div>

          <div className="hud-item hud-camera">
            <Compass size={13} className="text-purple" style={{ transform: `rotate(${bearing}deg)` }} />
            <span>
              HDG: <strong>{Math.round(bearing)}°</strong> • PITCH: <strong>{Math.round(pitch)}°</strong> • Z: <strong>{zoom.toFixed(1)}x</strong>
            </span>
          </div>
        </div>

        {/* 2D / 3D MODE SWITCHER */}
        <div className="hud-mode-controls">
          <button
            className={`hud-mode-btn ${mode === "2D" ? "mode-active" : ""}`}
            onClick={() => onToggleMode && onToggleMode("2D")}
            title="2D Tactical GIS (Top-Down)"
          >
            <span>2D GIS</span>
          </button>

          <button
            className={`hud-mode-btn ${mode === "3D" ? "mode-active" : ""}`}
            onClick={() => onToggleMode && onToggleMode("3D")}
            title="3D Command Mode (58° Pitch)"
          >
            <Box size={12} />
            <span>3D COMMAND</span>
          </button>

          <button
            className={`hud-mode-btn ${mode === "TERRAIN" ? "mode-active" : ""}`}
            onClick={() => onToggleMode && onToggleMode("TERRAIN")}
            title="3D Digital Twin Terrain View"
          >
            <Layers size={12} />
            <span>3D TWIN</span>
          </button>
        </div>
      </div>
    </div>
  );
}
