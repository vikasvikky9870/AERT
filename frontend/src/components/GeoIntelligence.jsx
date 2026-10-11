import React, { useState } from "react";
import {
  Layers, AlertTriangle, Ambulance, Building2, Route, MapPin, Hexagon, Eye, EyeOff,
} from "lucide-react";
import EmergencyMap from "./EmergencyMap";

const LAYER_DEFS = [
  { id: "incidents",  name: "Incidents",    icon: AlertTriangle, color: "var(--color-critical)" },
  { id: "fleet",      name: "Fleet",        icon: Ambulance,     color: "var(--color-nominal)" },
  { id: "hospitals",  name: "Hospitals",     icon: Building2,     color: "var(--color-medical)" },
  { id: "road",       name: "Road Events",  icon: Route,         color: "var(--color-medium)" },
  { id: "routes",     name: "Routes",       icon: MapPin,        color: "var(--color-geo)" },
  { id: "boundary",   name: "Sector Bound", icon: Hexagon,       color: "var(--color-ai)" },
];

export default function GeoIntelligence({
  incidents = [], ambulances = [], hospitals = [], roadEvents = [],
  selectedIncident, onSelectIncident,
}) {
  const [layers, setLayers] = useState({
    incidents: true, fleet: true, hospitals: true, road: true, routes: false, boundary: true,
  });
  const [mapMode, setMapMode] = useState("2D");

  const toggleLayer = (id) => setLayers((prev) => ({ ...prev, [id]: !prev[id] }));

  const shownIncidents  = layers.incidents  ? incidents  : [];
  const shownAmbulances = layers.fleet      ? ambulances : [];
  const shownHospitals  = layers.hospitals  ? hospitals  : [];
  const shownRoadEvents = layers.road       ? roadEvents : [];

  return (
    <div className="geo-layout">
      {/* Layer Control Panel */}
      <div className="layer-panel">
        <div className="panel-header">
          <div>
            <div className="panel-label">GIS CONTROL</div>
            <div className="panel-title">Map Layers</div>
          </div>
          <Layers size={14} style={{ color: "var(--color-geo)" }} />
        </div>

        {/* Map mode selector */}
        <div style={{ display: "flex", gap: 2, padding: "8px 10px" }}>
          {["2D", "3D", "TERRAIN"].map((mode) => (
            <button key={mode} className={`filter-btn ${mapMode === mode ? "active" : ""}`}
              style={{ flex: 1 }} onClick={() => setMapMode(mode)}>
              {mode}
            </button>
          ))}
        </div>

        <div className="layer-scroll">
          <div className="section-title"><Layers size={12} /> LAYERS</div>
          {LAYER_DEFS.map((layer) => {
            const Icon = layer.icon;
            const isOn = layers[layer.id];
            let count = 0;
            if (layer.id === "incidents")  count = incidents.length;
            if (layer.id === "fleet")      count = ambulances.length;
            if (layer.id === "hospitals")  count = hospitals.length;
            if (layer.id === "road")       count = roadEvents.length;

            return (
              <div key={layer.id} className={`layer-item ${isOn ? "active" : ""}`} onClick={() => toggleLayer(layer.id)}>
                <div className="layer-item-left">
                  <div className="layer-icon" style={{ background: isOn ? `${layer.color}20` : "var(--glass-bg)", color: isOn ? layer.color : "var(--text-dim)", border: `1px solid ${isOn ? layer.color : "var(--border-faint)"}` }}>
                    <Icon size={13} />
                  </div>
                  <div>
                    <div className="layer-name" style={{ color: isOn ? "var(--text-primary)" : "var(--text-muted)" }}>{layer.name}</div>
                    {count > 0 && <div className="layer-count">{count} entities</div>}
                  </div>
                </div>
                <div className={`toggle ${isOn ? "on" : ""}`} />
              </div>
            );
          })}

          <div style={{ margin: "14px 0" }}>
            <div className="section-title"><Activity size={12} /> SECTOR STATS</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {[
                ["Active Incidents", incidents.filter((i) => String(i.status).toUpperCase() === "ACTIVE").length],
                ["Fleet Available", ambulances.filter((a) => String(a.status).toUpperCase() === "AVAILABLE").length],
                ["Hospital Facilities", hospitals.length],
                ["Road Events", roadEvents.length],
              ].map(([label, val]) => (
                <div key={label} className="ext-field">
                  <span className="ext-key">{label}</span>
                  <span className="ext-val mono">{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="map-legend">
          <div className="legend-title">MAP LEGEND</div>
          <div className="legend-row"><span className="legend-dot" style={{ background: "var(--color-critical)" }} />Critical Incident</div>
          <div className="legend-row"><span className="legend-dot" style={{ background: "var(--color-high)" }} />High Priority</div>
          <div className="legend-row"><span className="legend-dot" style={{ background: "var(--color-nominal)" }} />Available Unit</div>
          <div className="legend-row"><span className="legend-dot" style={{ background: "var(--color-high)" }} />Deployed Unit</div>
          <div className="legend-row"><span className="legend-dot" style={{ background: "var(--color-medical)" }} />Hospital</div>
          <div className="legend-row"><span className="legend-dot" style={{ background: "var(--color-medium)" }} />Road Event</div>
        </div>
      </div>

      {/* Map Area */}
      <div style={{ position: "relative", overflow: "hidden" }}>
        <EmergencyMap
          incidents={shownIncidents} ambulances={shownAmbulances} hospitals={shownHospitals}
          roadEvents={shownRoadEvents} selectedIncident={selectedIncident}
          onSelectIncident={onSelectIncident}
        />
      </div>
    </div>
  );
}

function Activity(props) {
  return <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/></svg>;
}
