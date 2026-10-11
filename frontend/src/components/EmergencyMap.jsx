import { useEffect, useRef, useState, useCallback } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  Layers,
  Navigation,
  Radio,
  MapPin,
  Route,
  Eye,
  Box,
  Compass,
  AlertTriangle,
  Building2,
  Ambulance,
  Maximize2,
  RotateCcw,
} from "lucide-react";

// Srikakulam Urban Center Coordinates [Longitude, Latitude]
const SRIKAKULAM_CENTER = [83.8961, 18.2969];

// Srikakulam Operational District Sector Boundary (Polygon)
const SRIKAKULAM_SECTOR_BOUNDARY = {
  type: "Feature",
  geometry: {
    type: "Polygon",
    coordinates: [
      [
        [83.8200, 18.2400],
        [83.9600, 18.2400],
        [83.9800, 18.3600],
        [83.8400, 18.3600],
        [83.8200, 18.2400],
      ],
    ],
  },
  properties: {
    name: "Srikakulam Urban & Highway Emergency Sector",
  },
};

function createMarkerElement(type, data, isSelected = false, isRecommended = false) {
  const element = document.createElement("div");
  element.className = `map-marker map-marker-${type} ${isSelected ? "marker-selected" : ""} ${isRecommended ? "marker-recommended" : ""}`;

  let bg = "#3b82f6";
  let icon = "📍";
  let badgeText = "";

  if (type === "incident") {
    const sev = String(data.severity || "MEDIUM").toUpperCase();
    badgeText = `${data.victims || 1}P`;
    if (sev === "CRITICAL") {
      bg = "#ef4444";
      icon = "🚨";
      element.classList.add("marker-pulse-critical");
    } else if (sev === "HIGH") {
      bg = "#f97316";
      icon = "⚠️";
      element.classList.add("marker-pulse-high");
    } else if (sev === "MEDIUM") {
      bg = "#eab308";
      icon = "📍";
    } else {
      bg = "#10b981";
      icon = "ℹ️";
    }
  } else if (type === "ambulance") {
    const isAls = String(data.type || "ALS").toUpperCase() === "ALS";
    icon = "🚑";
    badgeText = isAls ? "ALS" : "BLS";
    const st = String(data.status || "AVAILABLE").toUpperCase();
    if (st === "AVAILABLE") bg = "#10b981";
    else if (st === "BUSY" || st === "DISPATCHED") bg = "#f59e0b";
    else bg = "#64748b";
  } else if (type === "hospital") {
    icon = "🏥";
    bg = "#8b5cf6";
    badgeText = `${data.beds_available || 0}`;
  } else if (type === "road_event") {
    icon = "⛔";
    bg = "#ea580c";
    badgeText = `+${data.delay_multiplier}x`;
  }

  element.style.width = isSelected ? "42px" : "34px";
  element.style.height = isSelected ? "42px" : "34px";
  element.style.borderRadius = "50%";
  element.style.display = "flex";
  element.style.alignItems = "center";
  element.style.justifyContent = "center";
  element.style.fontSize = isSelected ? "18px" : "15px";
  element.style.background = bg;
  element.style.border = isSelected ? "3px solid #ffffff" : isRecommended ? "2px solid #8b5cf6" : "2px solid rgba(255,255,255,0.9)";
  element.style.boxShadow = isSelected
    ? "0 0 25px rgba(255,255,255,0.9), 0 6px 18px rgba(0,0,0,0.6)"
    : "0 3px 12px rgba(0,0,0,0.45)";
  element.style.cursor = "pointer";
  element.style.position = "relative";
  element.style.transition = "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)";
  element.innerHTML = `<span>${icon}</span>`;

  if (badgeText) {
    const badge = document.createElement("span");
    badge.className = "marker-mini-badge";
    badge.innerText = badgeText;
    element.appendChild(badge);
  }

  return element;
}

// Generate GeoJSON circular polygon for road event delay impact radius
function createGeoJSONCircle(center, radiusInKm, points = 64) {
  const coords = {
    latitude: center[1],
    longitude: center[0],
  };

  const km = radiusInKm;
  const ret = [];
  const distanceX = km / (111.32 * Math.cos((coords.latitude * Math.PI) / 180));
  const distanceY = km / 110.574;

  for (let i = 0; i < points; i++) {
    const theta = (i / points) * (2 * Math.PI);
    const x = distanceX * Math.cos(theta);
    const y = distanceY * Math.sin(theta);
    ret.push([coords.longitude + x, coords.latitude + y]);
  }
  ret.push(ret[0]);

  return {
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: [ret],
    },
    properties: {},
  };
}

export default function EmergencyMap({
  incidents = [],
  ambulances = [],
  hospitals = [],
  roadEvents = [],
  selectedIncident = null,
  recommendedAmbulance = null,
  recommendedHospital = null,
  onSelectIncident = null,
  onSelectAmbulance = null,
  onSelectHospital = null,
  highlightEntity = null,
  height = "560px",
}) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  const [is3DMode, setIs3DMode] = useState(false);
  const [layers, setLayers] = useState({
    incidents: true,
    ambulances: true,
    hospitals: true,
    roadEvents: true,
    responseCorridor: true,
    sectorBoundary: true,
  });

  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [mapBearing, setMapBearing] = useState(0);
  const [mapZoom, setMapZoom] = useState(12.6);

  // Initialize MapLibre Centered on Srikakulam
  useEffect(() => {
    if (mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "© OpenStreetMap contributors | Srikakulam GIS Network",
          },
        },
        layers: [
          {
            id: "osm",
            type: "raster",
            source: "osm",
          },
        ],
      },
      center: SRIKAKULAM_CENTER,
      zoom: 12.6,
      pitch: 0,
      bearing: 0,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), "top-right");

    map.on("rotate", () => setMapBearing(Math.round(map.getBearing())));
    map.on("zoom", () => setMapZoom(Number(map.getZoom().toFixed(1))));

    mapRef.current = map;

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Toggle 3D Tactical Digital Twin View
  const toggle3DTacticalView = () => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    if (!is3DMode) {
      map.easeTo({
        pitch: 55,
        bearing: -18,
        zoom: Math.max(map.getZoom(), 13.2),
        duration: 1200,
      });
      setIs3DMode(true);
    } else {
      map.easeTo({
        pitch: 0,
        bearing: 0,
        zoom: 12.6,
        duration: 1000,
      });
      setIs3DMode(false);
    }
  };

  // Recenter to Srikakulam Urban Center
  const resetToSrikakulam = () => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({
      center: SRIKAKULAM_CENTER,
      zoom: 12.6,
      pitch: is3DMode ? 55 : 0,
      bearing: is3DMode ? -18 : 0,
      duration: 1200,
    });
  };

  // Handle External Highlight Entity (e.g. from Copilot or Priority Queue)
  useEffect(() => {
    if (!highlightEntity || !mapRef.current) return;
    const { type, id } = highlightEntity;

    let targetCoords = null;
    if (type === "incident") {
      const inc = incidents.find((i) => i.id === id);
      if (inc && inc.coordinates) targetCoords = inc.coordinates;
    } else if (type === "ambulance") {
      const amb = ambulances.find((a) => a.id === id);
      if (amb && amb.coordinates) targetCoords = amb.coordinates;
    } else if (type === "hospital") {
      const hos = hospitals.find((h) => h.id === id);
      if (hos && hos.coordinates) targetCoords = hos.coordinates;
    } else if (type === "road_event") {
      const rd = roadEvents.find((r) => r.id === id);
      if (rd && rd.coordinates) targetCoords = rd.coordinates;
    }

    if (targetCoords) {
      mapRef.current.flyTo({
        center: targetCoords,
        zoom: 14.2,
        duration: 900,
      });
    }
  }, [highlightEntity, incidents, ambulances, hospitals, roadEvents]);

  // Render & Update Markers and Geographic Layers
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // 1. INCIDENTS LAYER
    if (layers.incidents && Array.isArray(incidents)) {
      incidents.forEach((inc) => {
        if (!inc.coordinates || inc.coordinates.length !== 2) return;
        const isSelected = selectedIncident && selectedIncident.id === inc.id;
        const el = createMarkerElement("incident", inc, isSelected, false);

        el.addEventListener("click", () => {
          if (onSelectIncident) onSelectIncident(inc);
        });

        const popupHTML = `
          <div class="gis-popup incident-popup">
            <div class="popup-top">
              <span class="popup-badge severity-${String(inc.severity).toLowerCase()}">${inc.severity}</span>
              <span class="popup-stage">${inc.lifecycle_status || "VERIFIED"}</span>
            </div>
            <h4>${inc.id}: ${inc.type}</h4>
            <p><strong>Location:</strong> ${inc.location}</p>
            <p><strong>Casualties:</strong> ${inc.victims || 1} Total (${inc.critical_victims || 0} Critical)</p>
            <p><strong>Status:</strong> ${inc.status}</p>
            <div class="popup-provenance">
              <span>Source: ${inc.location_source || "Caller Landmark"} (${inc.location_confidence || 90}% confidence)</span>
            </div>
            <div class="popup-sub">Srikakulam Sector [${inc.coordinates[0].toFixed(4)}, ${inc.coordinates[1].toFixed(4)}]</div>
          </div>
        `;

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat(inc.coordinates)
          .setPopup(new maplibregl.Popup({ offset: 24, closeButton: false }).setHTML(popupHTML))
          .addTo(map);

        markersRef.current.push(marker);
      });
    }

    // 2. AMBULANCES LAYER (Simulated Fleet Telemetry)
    if (layers.ambulances && Array.isArray(ambulances)) {
      ambulances.forEach((amb) => {
        if (!amb.coordinates || amb.coordinates.length !== 2) return;
        const isRec = recommendedAmbulance && (recommendedAmbulance.id === amb.id);
        const el = createMarkerElement("ambulance", amb, false, isRec);

        el.addEventListener("click", () => {
          if (onSelectAmbulance) onSelectAmbulance(amb);
        });

        const popupHTML = `
          <div class="gis-popup ambulance-popup">
            <div class="popup-top">
              <span class="popup-badge status-${String(amb.status).toLowerCase()}">${amb.status}</span>
              <span class="popup-tier-tag">${amb.type || "ALS"} UNIT</span>
            </div>
            <h4>Ambulance ${amb.id}</h4>
            <p><strong>Crew:</strong> ${amb.crew || "Paramedic Team"}</p>
            <p><strong>Readiness:</strong> ${amb.fuel_pct || 95}% Fuel / Battery</p>
            <div class="popup-tag-sim">Simulated AVL Telemetry // Srikakulam</div>
            ${isRec ? '<div class="rec-badge">⭐ Recommended Response Unit</div>' : ""}
          </div>
        `;

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat(amb.coordinates)
          .setPopup(new maplibregl.Popup({ offset: 22, closeButton: false }).setHTML(popupHTML))
          .addTo(map);

        markersRef.current.push(marker);
      });
    }

    // 3. HOSPITALS LAYER (Srikakulam Healthcare Network)
    if (layers.hospitals && Array.isArray(hospitals)) {
      hospitals.forEach((hos) => {
        if (!hos.coordinates || hos.coordinates.length !== 2) return;
        const isRec = recommendedHospital && (recommendedHospital.id === hos.id);
        const el = createMarkerElement("hospital", hos, false, isRec);

        el.addEventListener("click", () => {
          if (onSelectHospital) onSelectHospital(hos);
        });

        const popupHTML = `
          <div class="gis-popup hospital-popup">
            <div class="popup-top">
              <span class="popup-badge">TRAUMA CENTER</span>
              <span class="popup-trauma-lvl">${hos.trauma_level || "Level 1"}</span>
            </div>
            <h4>${hos.name}</h4>
            <p><strong>Available Beds:</strong> ${hos.beds_available} Total (${hos.icu_beds_available || 2} ICU)</p>
            <p><strong>Occupancy Load:</strong> ${hos.capacity}%</p>
            <p><strong>Blood Bank:</strong> ${hos.blood_bank_status || "AVAILABLE"}</p>
            <div class="popup-sub">Srikakulam Regional Healthcare Network</div>
            ${isRec ? '<div class="rec-badge">⭐ Designated Receiving Hospital</div>' : ""}
          </div>
        `;

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat(hos.coordinates)
          .setPopup(new maplibregl.Popup({ offset: 22, closeButton: false }).setHTML(popupHTML))
          .addTo(map);

        markersRef.current.push(marker);
      });
    }

    // 4. ROAD EVENTS LAYER
    if (layers.roadEvents && Array.isArray(roadEvents)) {
      roadEvents.forEach((ev) => {
        const coords = ev.coordinates || [ev.longitude, ev.latitude];
        if (!coords || coords.length !== 2 || !ev.is_active) return;
        const el = createMarkerElement("road_event", ev, false, false);

        const popupHTML = `
          <div class="gis-popup road-popup">
            <div class="popup-top">
              <span class="popup-badge delay-badge">+${ev.delay_multiplier}x ETA Multiplier</span>
            </div>
            <h4>${ev.type}</h4>
            <p>${ev.description}</p>
            <p><strong>Corridor:</strong> ${ev.corridor || "NH-16 Srikakulam"}</p>
            <p><strong>Impact Buffer:</strong> ${ev.radius_km} km radius</p>
            <div class="popup-tag-sim">Prototype Road Intelligence Attribute</div>
          </div>
        `;

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat(coords)
          .setPopup(new maplibregl.Popup({ offset: 22, closeButton: false }).setHTML(popupHTML))
          .addTo(map);

        markersRef.current.push(marker);
      });
    }

    // Setup Vector Layers (Road Buffers, Response Path, Sector Boundaries)
    const setupVectorLayers = () => {
      if (!map.isStyleLoaded()) return;

      // 1. Sector Boundary Layer
      if (layers.sectorBoundary) {
        const boundaryGeojson = {
          type: "FeatureCollection",
          features: [SRIKAKULAM_SECTOR_BOUNDARY],
        };

        if (map.getSource("sector-boundary-source")) {
          map.getSource("sector-boundary-source").setData(boundaryGeojson);
        } else {
          map.addSource("sector-boundary-source", {
            type: "geojson",
            data: boundaryGeojson,
          });

          map.addLayer({
            id: "sector-boundary-fill",
            type: "fill",
            source: "sector-boundary-source",
            paint: {
              "fill-color": "#3b82f6",
              "fill-opacity": 0.03,
            },
          });

          map.addLayer({
            id: "sector-boundary-line",
            type: "line",
            source: "sector-boundary-source",
            paint: {
              "line-color": "#3b82f6",
              "line-width": 1.2,
              "line-dasharray": [4, 3],
              "line-opacity": 0.45,
            },
          });
        }
      }

      // 2. Road Delay Buffer Polygons
      const circleFeatures = [];
      if (layers.roadEvents && Array.isArray(roadEvents)) {
        roadEvents.forEach((ev) => {
          if (ev.is_active) {
            const coords = ev.coordinates || [ev.longitude, ev.latitude];
            const radius = ev.radius_km || 2.0;
            circleFeatures.push(createGeoJSONCircle(coords, radius));
          }
        });
      }

      const bufferGeojson = {
        type: "FeatureCollection",
        features: circleFeatures,
      };

      if (map.getSource("road-delay-buffers")) {
        map.getSource("road-delay-buffers").setData(bufferGeojson);
      } else {
        map.addSource("road-delay-buffers", {
          type: "geojson",
          data: bufferGeojson,
        });

        map.addLayer({
          id: "road-delay-buffers-fill",
          type: "fill",
          source: "road-delay-buffers",
          paint: {
            "fill-color": "#f97316",
            "fill-opacity": 0.16,
          },
        });

        map.addLayer({
          id: "road-delay-buffers-line",
          type: "line",
          source: "road-delay-buffers",
          paint: {
            "line-color": "#ea580c",
            "line-width": 1.6,
            "line-dasharray": [2, 2],
          },
        });
      }

      // 3. Estimated Response Vector Path (Ambulance -> Incident -> Hospital)
      const pathFeatures = [];
      if (
        layers.responseCorridor &&
        selectedIncident &&
        selectedIncident.coordinates &&
        recommendedAmbulance &&
        recommendedAmbulance.coordinates
      ) {
        // Leg 1: Ambulance to Incident
        pathFeatures.push({
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: [recommendedAmbulance.coordinates, selectedIncident.coordinates],
          },
          properties: { type: "dispatch-leg" },
        });

        // Leg 2: Incident to Designated Hospital
        if (recommendedHospital && recommendedHospital.coordinates) {
          pathFeatures.push({
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: [selectedIncident.coordinates, recommendedHospital.coordinates],
            },
            properties: { type: "transport-leg" },
          });
        }
      }

      const pathGeojson = {
        type: "FeatureCollection",
        features: pathFeatures,
      };

      if (map.getSource("response-path-lines")) {
        map.getSource("response-path-lines").setData(pathGeojson);
      } else {
        map.addSource("response-path-lines", {
          type: "geojson",
          data: pathGeojson,
        });

        map.addLayer({
          id: "response-path-lines-glow",
          type: "line",
          source: "response-path-lines",
          paint: {
            "line-color": "#8b5cf6",
            "line-width": 6,
            "line-opacity": 0.45,
          },
        });

        map.addLayer({
          id: "response-path-lines-core",
          type: "line",
          source: "response-path-lines",
          paint: {
            "line-color": "#a855f7",
            "line-width": 2.5,
            "line-dasharray": [3, 2],
          },
        });
      }
    };

    if (map.isStyleLoaded()) {
      setupVectorLayers();
    } else {
      map.once("styledata", setupVectorLayers);
    }
  }, [
    incidents,
    ambulances,
    hospitals,
    roadEvents,
    selectedIncident,
    recommendedAmbulance,
    recommendedHospital,
    layers,
    onSelectIncident,
    onSelectAmbulance,
    onSelectHospital,
  ]);

  return (
    <div className="emergency-gis-wrapper" style={{ height }}>
      {/* MAPLIBRE CONTAINER */}
      <div ref={mapContainer} className="gis-map-canvas" />

      {/* TOP FLOATING GIS CONTROLS */}
      <div className="gis-top-controls">
        <div className="gis-title-pill">
          <Radio size={14} className="gis-live-dot" />
          <span>SRIKAKULAM GIS // SECTOR [83.8961, 18.2969]</span>
        </div>

        <div className="gis-action-buttons">
          {/* 3D DIGITAL TWIN TOGGLE */}
          <button
            className={`gis-btn ${is3DMode ? "gis-btn-active" : ""}`}
            onClick={toggle3DTacticalView}
            title={is3DMode ? "Switch to 2D Top-Down GIS" : "Switch to 3D Tactical Digital Twin"}
          >
            <Box size={14} />
            <span>{is3DMode ? "2D GIS" : "TACTICAL 3D"}</span>
          </button>

          {/* RECENTER TO SRIKAKULAM */}
          <button
            className="gis-btn"
            onClick={resetToSrikakulam}
            title="Recenter to Srikakulam Urban Center"
          >
            <RotateCcw size={14} />
            <span>RECENTER</span>
          </button>

          {/* LAYER TOGGLE MENU */}
          <div className="layer-menu-container">
            <button
              className={`gis-btn ${showLayerMenu ? "gis-btn-active" : ""}`}
              onClick={() => setShowLayerMenu(!showLayerMenu)}
              title="Configure GIS Layers"
            >
              <Layers size={14} />
              <span>LAYERS</span>
            </button>

            {showLayerMenu && (
              <div className="layer-dropdown-panel">
                <div className="layer-dropdown-title">OPERATIONAL GIS LAYERS</div>

                <label className="layer-check-item">
                  <input
                    type="checkbox"
                    checked={layers.incidents}
                    onChange={(e) => setLayers({ ...layers, incidents: e.target.checked })}
                  />
                  <span>Active Incidents ({incidents.length})</span>
                </label>

                <label className="layer-check-item">
                  <input
                    type="checkbox"
                    checked={layers.ambulances}
                    onChange={(e) => setLayers({ ...layers, ambulances: e.target.checked })}
                  />
                  <span>Ambulance Fleet ({ambulances.length})</span>
                </label>

                <label className="layer-check-item">
                  <input
                    type="checkbox"
                    checked={layers.hospitals}
                    onChange={(e) => setLayers({ ...layers, hospitals: e.target.checked })}
                  />
                  <span>Trauma Centers ({hospitals.length})</span>
                </label>

                <label className="layer-check-item">
                  <input
                    type="checkbox"
                    checked={layers.roadEvents}
                    onChange={(e) => setLayers({ ...layers, roadEvents: e.target.checked })}
                  />
                  <span>Road Delay Buffers ({roadEvents.filter((r) => r.is_active).length})</span>
                </label>

                <label className="layer-check-item">
                  <input
                    type="checkbox"
                    checked={layers.responseCorridor}
                    onChange={(e) => setLayers({ ...layers, responseCorridor: e.target.checked })}
                  />
                  <span>Response Corridors</span>
                </label>

                <label className="layer-check-item">
                  <input
                    type="checkbox"
                    checked={layers.sectorBoundary}
                    onChange={(e) => setLayers({ ...layers, sectorBoundary: e.target.checked })}
                  />
                  <span>Sector Boundary Polygon</span>
                </label>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM FLOATING HUD / LEGEND */}
      <div className="gis-bottom-hud">
        <div className="hud-legend">
          <div className="legend-chip"><span className="legend-dot dot-critical" /> Critical</div>
          <div className="legend-chip"><span className="legend-dot dot-high" /> High</div>
          <div className="legend-chip"><span className="legend-dot dot-amb" /> EMS Unit</div>
          <div className="legend-chip"><span className="legend-dot dot-hos" /> Trauma Center</div>
          <div className="legend-chip"><span className="legend-dot dot-road" /> Road Hazard</div>
        </div>

        <div className="hud-telemetry">
          <span>ZOOM: <strong>{mapZoom}x</strong></span>
          <span>HEADING: <strong>{mapBearing}°</strong></span>
          <span>MODE: <strong>{is3DMode ? "3D DIGITAL TWIN" : "2D EOC GIS"}</strong></span>
        </div>
      </div>
    </div>
  );
}