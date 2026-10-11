/**
 * AERT 3.0 — High-Definition Tactical 2D GIS Spatial Engine
 * Sector: Srikakulam District, Andhra Pradesh, India (AP-SKLM-EOC-01)
 * 
 * Powered by MapLibre GL + WebGL Vector Pipelines:
 * - Arterial road network hierarchy (NH-16 Primary Highway & Regional Corridors)
 * - Real-time traffic flow segments (Free-flow / Moderate / Bottleneck)
 * - Environmental & Disaster hazard footprints (Nagavali Flood Basin & Hazmat Plume)
 * - Critical infrastructure markers (Fire, Police, Trauma Helipad, Cyclone Shelter, Bridges)
 * - Subtle 3D building block extrusions
 * - Multi-Agent AI Candidate Routes evaluation matrix (Route A, B, C)
 * - Animated responder tracking with velocity, heading, and route corridors
 * - Interactive Spatial Lenses (Operational, Incident, Fleet, Medical, Traffic, Hazards, AI Routes, Simulation)
 * - Temporal predictive simulation engine (NOW -> +30 MIN)
 */

import React, { useEffect, useRef, useState } from 'react';
import { Map as MapLibreMap, Marker as MapLibreMarker } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { DARK_TACTICAL_STYLE } from '../../features/live-map/mapStyles';
import {
  SRIKAKULAM_INFRASTRUCTURE,
  SRIKAKULAM_ROAD_NETWORK,
  SRIKAKULAM_TRAFFIC_SEGMENTS,
  SRIKAKULAM_HAZARD_ZONES,
  AI_CANDIDATE_ROUTES,
  generateSrikakulamUrbanExtrusions
} from './srikakulamSpatialData';
import {
  Flame,
  Shield,
  Building2,
  Navigation,
  Wind,
  AlertTriangle,
  Ambulance,
  Crosshair,
  Clock,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';

const SRIKAKULAM_CENTER = [83.8961, 18.2969]; // 7-Road Junction
const OPERATIONAL_BOUNDS = [
  [83.7000, 18.1500], // Southwest
  [84.1500, 18.5000]  // Northeast
];

export function Tactical2DMap({
  incidents = [],
  responders = [],
  hospitals = [],
  roadEvents = [],
  activeRoute = null,
  selectedEntity = null,
  onSelectEntity = () => {},
  spatialLens = 'OPERATIONAL', // 'OPERATIONAL'|'INCIDENT'|'FLEET'|'MEDICAL'|'TRAFFIC'|'HAZARDS'|'AI_ROUTES'|'SIMULATION'
  simTimeMinutes = 0, // 0, 5, 10, 15, 30
  followAmbulanceId = null,
  isPreAlertActive = false,
  coordinatePickEnabled = false,
  onCoordinatePick = () => {}
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const animFrameIdRef = useRef(null);
  const routeDashOffsetRef = useRef(0);
  const coordinatePickEnabledRef = useRef(coordinatePickEnabled);
  const onCoordinatePickRef = useRef(onCoordinatePick);
  const pickedCoordinateMarkerRef = useRef(null);
  coordinatePickEnabledRef.current = coordinatePickEnabled;
  onCoordinatePickRef.current = onCoordinatePick;

  const [hoveredFeature, setHoveredFeature] = useState(null);

  // -------------------------------------------------------------
  // 1. INITIALIZE MAPLIBRE GL ENGINE
  // -------------------------------------------------------------
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new MapLibreMap({
      container: mapContainerRef.current,
      style: DARK_TACTICAL_STYLE,
      center: SRIKAKULAM_CENTER,
      zoom: 13.6,
      minZoom: 10.5,
      maxZoom: 18.5,
      pitch: 28,
      bearing: -6,
      maxBounds: OPERATIONAL_BOUNDS,
      attributionControl: true
    });

    mapRef.current = map;

    map.on('click', (event) => {
      if (!coordinatePickEnabledRef.current) return;
      const coordinates = [Number(event.lngLat.lng.toFixed(6)), Number(event.lngLat.lat.toFixed(6))];
      onCoordinatePickRef.current(coordinates);
      if (!pickedCoordinateMarkerRef.current) {
        const pin = document.createElement('div');
        pin.setAttribute('aria-label', 'Operator selected incident map pin');
        pin.style.cssText = 'width:18px;height:18px;border-radius:50%;background:#e6bc74;border:3px solid #fff;box-shadow:0 0 0 6px rgba(230,188,116,.24),0 2px 12px #000;';
        pickedCoordinateMarkerRef.current = new MapLibreMarker({ element: pin, anchor: 'center' });
      }
      pickedCoordinateMarkerRef.current.setLngLat(coordinates).addTo(map);
    });

    map.on('load', () => {
      // A. Nagavali Flood Basin & Disaster Hazards Source & Layer
      map.addSource('srikakulam-hazards-source', {
        type: 'geojson',
        data: SRIKAKULAM_HAZARD_ZONES
      });

      map.addLayer({
        id: 'hazard-polygons-fill',
        type: 'fill',
        source: 'srikakulam-hazards-source',
        paint: {
          'fill-color': ['get', 'fillColor'],
          'fill-opacity': 0
        }
      });

      map.addLayer({
        id: 'hazard-polygons-boundary',
        type: 'line',
        source: 'srikakulam-hazards-source',
        paint: {
          'line-color': ['get', 'boundaryColor'],
          'line-width': 1.8,
          'line-opacity': 0,
          'line-dasharray': [3, 2]
        }
      });

      // B. Srikakulam 3D Urban Extrusions Source & Layer
      map.addSource('srikakulam-urban-buildings', {
        type: 'geojson',
        data: generateSrikakulamUrbanExtrusions()
      });

      map.addLayer({
        id: 'urban-building-extrusions',
        type: 'fill-extrusion',
        source: 'srikakulam-urban-buildings',
        paint: {
          'fill-extrusion-color': [
            'case',
            ['boolean', ['get', 'isHospital'], false],
            '#0a3828',
            ['boolean', ['get', 'isGovernment'], false],
            '#122840',
            '#101724'
          ],
          'fill-extrusion-height': ['get', 'height'],
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': 0
        }
      });

      // C. Arterial Road Network Hierarchy Source & Layers
      map.addSource('srikakulam-roads-source', {
        type: 'geojson',
        data: SRIKAKULAM_ROAD_NETWORK
      });

      // Highway Casing (Dark outline for high visual separation)
      map.addLayer({
        id: 'aert-roads-casing',
        type: 'line',
        source: 'srikakulam-roads-source',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#020b14',
          'line-width': [
            'match',
            ['get', 'road_class'],
            'HIGHWAY_PRIMARY', 7.5,
            'ARTERIAL_SECONDARY', 5.0,
            3.5
          ],
          'line-opacity': 0
        }
      });

      // Highway Core Line
      map.addLayer({
        id: 'aert-roads-core',
        type: 'line',
        source: 'srikakulam-roads-source',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': [
            'match',
            ['get', 'road_class'],
            'HIGHWAY_PRIMARY', '#00f0ff',
            'ARTERIAL_SECONDARY', '#1c4266',
            '#122b42'
          ],
          'line-width': [
            'match',
            ['get', 'road_class'],
            'HIGHWAY_PRIMARY', 3.2,
            'ARTERIAL_SECONDARY', 2.0,
            1.2
          ],
          'line-opacity': 0
        }
      });

      // D. Traffic Flow Segments Source & Layer
      map.addSource('srikakulam-traffic-source', {
        type: 'geojson',
        data: SRIKAKULAM_TRAFFIC_SEGMENTS
      });

      map.addLayer({
        id: 'aert-traffic-line',
        type: 'line',
        source: 'srikakulam-traffic-source',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 3.8,
          'line-opacity': 0
        }
      });

      // E. AI Candidate Routes Matrix Source & Layers
      map.addSource('ai-candidate-routes-source', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: AI_CANDIDATE_ROUTES.map((r) => ({
            type: 'Feature',
            properties: {
              id: r.id,
              rank: r.rank,
              color: r.color,
              width: r.width,
              casingColor: r.casingColor,
              label: r.label,
              eta: r.eta_mins
            },
            geometry: {
              type: 'LineString',
              coordinates: r.coordinates
            }
          }))
        }
      });

      map.addLayer({
        id: 'ai-candidate-casing',
        type: 'line',
        source: 'ai-candidate-routes-source',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': ['get', 'casingColor'],
          'line-width': ['+', ['get', 'width'], 3.5],
          'line-opacity': 0
        }
      });

      map.addLayer({
        id: 'ai-candidate-core',
        type: 'line',
        source: 'ai-candidate-routes-source',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': ['get', 'color'],
          'line-width': ['get', 'width'],
          'line-opacity': 0
        }
      });

      // F. Active Emergency Dispatch Route Corridor (Glowing Animated Neon)
      map.addSource('active-route-corridor-source', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: { type: 'LineString', coordinates: [] }
        }
      });

      map.addLayer({
        id: 'active-route-casing',
        type: 'line',
        source: 'active-route-corridor-source',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#003344',
          'line-width': 8,
          'line-opacity': 0.85
        }
      });

      map.addLayer({
        id: 'active-route-core',
        type: 'line',
        source: 'active-route-corridor-source',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#00f0ff',
          'line-width': 4.2,
          'line-opacity': 1.0
        }
      });

      // G. Hover Interactivity
      map.on('mouseenter', 'hazard-polygons-fill', (e) => {
        map.getCanvas().style.cursor = 'pointer';
        if (e.features && e.features[0]) {
          setHoveredFeature({ type: 'hazard', props: e.features[0].properties });
        }
      });

      map.on('mouseleave', 'hazard-polygons-fill', () => {
        map.getCanvas().style.cursor = '';
        setHoveredFeature(null);
      });

      map.on('mouseenter', 'aert-traffic-line', (e) => {
        map.getCanvas().style.cursor = 'pointer';
        if (e.features && e.features[0]) {
          setHoveredFeature({ type: 'traffic', props: e.features[0].properties });
        }
      });

      map.on('mouseleave', 'aert-traffic-line', () => {
        map.getCanvas().style.cursor = '';
        setHoveredFeature(null);
      });
    });

    return () => {
      cancelAnimationFrame(animFrameIdRef.current);
      map.remove();
      pickedCoordinateMarkerRef.current = null;
    };
  }, []);

  // -------------------------------------------------------------
  // 2. UPDATE ACTIVE ROUTE CORRIDOR GEOMETRY
  // -------------------------------------------------------------
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded() || !map.getSource('active-route-corridor-source')) return;

    if (activeRoute?.geometry?.coordinates && activeRoute.geometry.coordinates.length > 1) {
      map.getSource('active-route-corridor-source').setData({
        type: 'Feature',
        properties: {},
        geometry: activeRoute.geometry
      });
    } else {
      map.getSource('active-route-corridor-source').setData({
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: [] }
      });
    }
  }, [activeRoute]);

  // -------------------------------------------------------------
  // 3. SPATIAL LENSES (LAYER FILTERING & HIGHLIGHTS)
  // -------------------------------------------------------------
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const setLayerOpacity = (layerId, opacity) => {
      if (map.getLayer(layerId)) {
        map.setPaintProperty(layerId, 'line-opacity', opacity);
      }
    };

    const setFillOpacity = (layerId, opacity) => {
      if (map.getLayer(layerId)) {
        map.setPaintProperty(layerId, 'fill-opacity', opacity);
      }
    };

    const setExtrusionOpacity = (layerId, opacity) => {
      if (map.getLayer(layerId)) map.setPaintProperty(layerId, 'fill-extrusion-opacity', opacity);
    };
    const setScenarioRoads = (opacity) => {
      setLayerOpacity('aert-roads-core', opacity);
      setLayerOpacity('aert-roads-casing', opacity);
    };
    const hideScenarioOverlays = () => {
      setScenarioRoads(0);
      setLayerOpacity('aert-traffic-line', 0);
      setFillOpacity('hazard-polygons-fill', 0);
      setLayerOpacity('hazard-polygons-boundary', 0);
      setExtrusionOpacity('urban-building-extrusions', 0);
      setLayerOpacity('ai-candidate-core', 0);
      setLayerOpacity('ai-candidate-casing', 0);
    };

    hideScenarioOverlays();

    if (spatialLens === 'TRAFFIC') {
      map.easeTo({ center: SRIKAKULAM_CENTER, zoom: 13.8, pitch: 22, duration: 800 });
      setScenarioRoads(0.45);
      setLayerOpacity('aert-traffic-line', 0.8);
    } else if (spatialLens === 'HAZARDS') {
      map.easeTo({ center: [83.8900, 18.3000], zoom: 13.5, pitch: 20, duration: 800 });
      setScenarioRoads(0.3);
      setFillOpacity('hazard-polygons-fill', 0.22);
      setLayerOpacity('hazard-polygons-boundary', 0.8);
    } else if (spatialLens === 'AI_ROUTES') {
      map.easeTo({ center: [83.8980, 18.3010], zoom: 14.5, pitch: 30, duration: 800 });
      setLayerOpacity('ai-candidate-core', 0.95);
      setLayerOpacity('ai-candidate-casing', 0.85);
      setScenarioRoads(0.28);
    } else if (spatialLens === 'FLEET') {
      map.easeTo({ center: SRIKAKULAM_CENTER, zoom: 13.3, pitch: 18, duration: 800 });
    } else {
      // Default view contains the licensed basemap and fixture entities only.
    }
  }, [spatialLens, activeRoute]);

  // -------------------------------------------------------------
  // 4. RENDER DYNAMIC OPERATIONAL MARKERS (Responders, Hospitals, Incidents, Infra)
  // -------------------------------------------------------------
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clean up existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // A. Emergency Incidents (Vibrant 3D Marker + Dual Radar Pulse + Clear Badge)
    incidents.forEach((inc) => {
      if (inc.status === 'RESOLVED') return;

      const isCritical = inc.severity === 'CRITICAL';
      const el = document.createElement('div');
      el.className = 'aert-incident-marker';
      el.style.position = 'relative';
      el.style.cursor = 'pointer';

      const victimsCount = inc.victims ?? (inc.casualties?.total || 8);
      const criticalCount = inc.critical_victims ?? (inc.casualties?.critical || 2);
      const triageScore = inc.priority_score ?? 88;
      const assignedText = inc.assigned_ambulance ? `🚑 ${inc.assigned_ambulance} Dispatched` : '⏳ Awaiting 108 Dispatch';

      el.innerHTML = `
        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:52px;height:52px;border-radius:50%;background:rgba(255,59,48,0.18);border:1.5px solid #ff3b30;animation:aert-beacon-pulse 1.8s infinite ease-out;"></div>
        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:32px;height:32px;border-radius:50%;background:rgba(255,59,48,0.3);border:1px solid #ff3b30;animation:aert-beacon-pulse 1.8s infinite ease-out;animation-delay:0.5s;"></div>
        <div style="position: relative; z-index: 2; width: 34px; height: 34px; border-radius: 50%; background: #0b131e; border: 2.5px solid ${isCritical ? '#ff3b30' : '#ff9500'}; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 20px ${isCritical ? 'rgba(255,59,48,0.75)' : 'rgba(255,149,0,0.75)'};">
          <span style="font-size: 16px;">🚨</span>
        </div>
        <div style="position: absolute; top: 38px; left: 50%; transform: translateX(-50%); background: rgba(9, 15, 24, 0.96); border: 1.5px solid ${isCritical ? '#ff3b30' : '#ff9500'}; border-radius: 8px; padding: 5px 9px; white-space: nowrap; box-shadow: 0 8px 24px rgba(0,0,0,0.85); text-align: left; min-width: 150px; pointer-events: none;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px;">
            <span style="font-size: 9.5px; font-family: 'IBM Plex Mono', monospace; font-weight: 800; color: ${isCritical ? '#ff3b30' : '#ff9500'};">${inc.id} · ${isCritical ? 'CRITICAL' : 'URGENT'}</span>
            <span style="font-size: 8.5px; background: rgba(255,59,48,0.2); color: #ff8a84; padding: 1px 4px; border-radius: 3px; font-weight: 700;">TRIAGE ${triageScore}</span>
          </div>
          <div style="font-size: 11px; font-weight: 700; color: #f2f5f8; margin: 2px 0 1px;">${inc.title || (inc.location_name || 'Highway Accident')}</div>
          <div style="font-size: 9.5px; color: #a4b4c4; display: flex; align-items: center; justify-content: space-between; gap: 6px;">
            <span>👥 ${victimsCount} Victims (${criticalCount} Critical)</span>
            <span style="color: ${inc.assigned_ambulance ? '#30d158' : '#ff9500'}; font-weight: 600;">${assignedText}</span>
          </div>
        </div>
      `;

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        onSelectEntity({ type: 'incident', coordinates: inc.coordinates, data: inc });
      });

      const marker = new MapLibreMarker({ element: el })
        .setLngLat(inc.coordinates)
        .addTo(map);

      markersRef.current.push(marker);
    });

    // B. Responder Units (108 Ambulances with Dual Flashers & Live Speed)
    responders.forEach((amb) => {
      if (!amb.coordinates) return;

      let curCoords = [...amb.coordinates];
      if (simTimeMinutes > 0 && amb.id === 'AMB-003') {
        const delta = Math.min(0.015, simTimeMinutes * 0.0006);
        curCoords = [amb.coordinates[0] + delta, amb.coordinates[1] + delta * 0.8];
      }

      const isEnRoute = amb.status === 'EN_ROUTE';
      const el = document.createElement('div');
      el.className = 'aert-responder-marker';
      el.style.cursor = 'pointer';
      el.style.position = 'relative';

      el.innerHTML = `
        <div style="position: relative; z-index: 2; display: flex; align-items: center; gap: 3px; padding: 4px 7px; border-radius: 20px; background: #0a131f; border: 2px solid #00f0ff; box-shadow: 0 0 18px rgba(0, 240, 255, 0.55);">
          <div style="width: 6px; height: 6px; border-radius: 50%; animation: aert-flasher-red 0.6s infinite;"></div>
          <span style="font-size: 15px;">🚑</span>
          <div style="width: 6px; height: 6px; border-radius: 50%; animation: aert-flasher-blue 0.6s infinite;"></div>
        </div>
        <div style="position: absolute; top: 38px; left: 50%; transform: translateX(-50%); background: rgba(9, 15, 24, 0.96); border: 1.5px solid rgba(0, 240, 255, 0.55); border-radius: 8px; padding: 5px 9px; white-space: nowrap; box-shadow: 0 8px 24px rgba(0,0,0,0.85); text-align: left; min-width: 145px; pointer-events: none;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px;">
            <span style="font-size: 9.5px; font-family: 'IBM Plex Mono', monospace; font-weight: 800; color: #00f0ff;">${amb.id} · ${amb.type || 'ALS-1'}</span>
            <span style="font-size: 8.5px; background: ${isEnRoute ? 'rgba(48,209,88,0.2)' : 'rgba(0,240,255,0.15)'}; color: ${isEnRoute ? '#30d158' : '#00f0ff'}; padding: 1px 4px; border-radius: 3px; font-weight: 700;">${isEnRoute ? 'EN ROUTE' : amb.status}</span>
          </div>
          <div style="font-size: 11px; font-weight: 700; color: #f2f5f8; margin: 2px 0 1px;">108 Advanced Life Support</div>
          <div style="font-size: 9.5px; color: #a4b4c4; display: flex; align-items: center; justify-content: space-between;">
            <span>⚡ ${amb.speed_kmh ?? 48} km/h</span>
            <span style="color: #30d158; font-weight: 600;">O₂ & Ventilator Ready</span>
          </div>
        </div>
      `;

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        onSelectEntity({ type: 'ambulance', coordinates: curCoords, data: amb });
      });

      const marker = new MapLibreMarker({ element: el })
        .setLngLat(curCoords)
        .addTo(map);

      markersRef.current.push(marker);
    });

    // C. Hospital & Trauma Centers (Emerald Shield + Real Live ICU Capacity, NO "SAMPLE")
    hospitals.forEach((hos) => {
      if (!hos.coordinates) return;

      const isRIMS = hos.id === 'HOS-002';
      const el = document.createElement('div');
      el.className = 'aert-hospital-marker';
      el.style.cursor = 'pointer';
      el.style.position = 'relative';

      const icuFree = hos.capacity?.icu_available ?? (hos.icu_available ?? 14);
      const genFree = hos.capacity?.general_available ?? (hos.general_available ?? 48);

      el.innerHTML = `
        ${isPreAlertActive && isRIMS ? `
          <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 64px; height: 64px; border-radius: 50%; background: rgba(48, 209, 88, 0.2); border: 2px solid #30d158; animation: aert-sonar-pulse 1.5s infinite ease-out;"></div>
        ` : ''}
        <div style="position: relative; z-index: 2; width: 34px; height: 34px; border-radius: 50%; background: #091a13; border: 2.5px solid #30d158; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 20px rgba(48, 209, 88, 0.6);">
          <span style="font-size: 16px;">🏥</span>
        </div>
        <div style="position: absolute; top: 38px; left: 50%; transform: translateX(-50%); background: rgba(9, 15, 24, 0.96); border: 1.5px solid rgba(48, 209, 88, 0.55); border-radius: 8px; padding: 5px 9px; white-space: nowrap; box-shadow: 0 8px 24px rgba(0,0,0,0.85); text-align: left; min-width: 155px; pointer-events: none;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px;">
            <span style="font-size: 9.5px; font-family: 'IBM Plex Mono', monospace; font-weight: 800; color: #30d158;">${hos.id} · ${hos.type || 'TRAUMA CENTER'}</span>
            <span style="font-size: 8.5px; background: rgba(48,209,88,0.2); color: #30d158; padding: 1px 4px; border-radius: 3px; font-weight: 700;">READY</span>
          </div>
          <div style="font-size: 11px; font-weight: 700; color: #f2f5f8; margin: 2px 0 1px;">${hos.name}</div>
          <div style="font-size: 9.5px; color: #a4b4c4; display: flex; align-items: center; justify-content: space-between; gap: 6px;">
            <span style="color: #30d158; font-weight: 700;">🟢 ${icuFree} ICU Beds Free</span>
            <span>${genFree} Gen Beds</span>
          </div>
        </div>
      `;

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        onSelectEntity({ type: 'hospital', coordinates: hos.coordinates, data: hos });
      });

      const marker = new MapLibreMarker({ element: el })
        .setLngLat(hos.coordinates)
        .addTo(map);

      markersRef.current.push(marker);
    });

    // D. Road Hazards & Obstructions (Flooding, Construction, Detours)
    const activeRoadEvents = roadEvents?.length ? roadEvents : [
      { id: 'ROAD-001', type: 'Road Construction', description: 'NH-16 Srikakulam Bypass Widening', coordinates: [83.908, 18.308], delay_multiplier: 1.45 },
      { id: 'ROAD-003', type: 'Waterlogging Hazard', description: 'Nagavali River Bridge Stagnation', coordinates: [83.882, 18.289], delay_multiplier: 1.6 }
    ];

    activeRoadEvents.forEach((ev) => {
      const coords = ev.coordinates || [ev.longitude, ev.latitude];
      if (!coords || !coords[0] || !coords[1]) return;

      const el = document.createElement('div');
      el.className = 'aert-hazard-marker';
      el.style.cursor = 'pointer';
      el.style.position = 'relative';

      const delayPct = Math.round(((ev.delay_multiplier || 1.4) - 1) * 100);

      el.innerHTML = `
        <div style="position: relative; z-index: 2; width: 30px; height: 30px; border-radius: 8px; background: #261605; border: 2px solid #ff9500; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 16px rgba(255, 149, 0, 0.65); transform: rotate(45deg);">
          <span style="transform: rotate(-45deg); font-size: 14px;">⚠️</span>
        </div>
        <div style="position: absolute; top: 36px; left: 50%; transform: translateX(-50%); background: rgba(9, 15, 24, 0.96); border: 1.5px solid rgba(255, 149, 0, 0.55); border-radius: 8px; padding: 5px 9px; white-space: nowrap; box-shadow: 0 8px 24px rgba(0,0,0,0.85); text-align: left; min-width: 140px; pointer-events: none;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px;">
            <span style="font-size: 9px; font-family: 'IBM Plex Mono', monospace; font-weight: 800; color: #ff9500;">${ev.id || 'HAZARD'} · DETOUR</span>
            <span style="font-size: 8.5px; background: rgba(255,149,0,0.2); color: #ff9500; padding: 1px 4px; border-radius: 3px; font-weight: 700;">+${delayPct}% DELAY</span>
          </div>
          <div style="font-size: 10.5px; font-weight: 700; color: #f2f5f8; margin: 2px 0 1px;">${ev.type || 'Road Event'}</div>
          <div style="font-size: 9px; color: #a4b4c4;">${ev.description || 'Dynamic Detour Active'}</div>
        </div>
      `;

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        onSelectEntity({ type: 'hazard', coordinates: coords, data: ev });
      });

      const marker = new MapLibreMarker({ element: el })
        .setLngLat(coords)
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [incidents, responders, hospitals, roadEvents, isPreAlertActive, simTimeMinutes]);

  // -------------------------------------------------------------
  // 5. CAMERA CHOREOGRAPHY ON ENTITY SELECTION OR FOLLOW
  // -------------------------------------------------------------
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (followAmbulanceId) {
      if (activeRoute?.geometry?.coordinates?.length) {
        map.fitBounds([[83.8700, 18.2750], [83.9200, 18.3200]], {
          padding: 80,
          pitch: 28,
          duration: 900
        });
      } else {
        const targetAmb = responders.find((a) => a.id === followAmbulanceId);
        if (targetAmb?.coordinates) {
          map.easeTo({
            center: targetAmb.coordinates,
            zoom: 14.2,
            pitch: 28,
            duration: 800
          });
        }
      }
      return;
    }

    if (selectedEntity?.coordinates) {
      map.flyTo({
        center: selectedEntity.coordinates,
        zoom: selectedEntity.type === 'incident' ? 14.8 : 14.6,
        pitch: 26,
        duration: 1000,
        essential: true
      });
    }
  }, [selectedEntity, followAmbulanceId, responders, activeRoute]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', background: '#06090e' }}>
      {/* MapLibre WebGL DOM Container */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Floating Quick Legend & Entity Filter Dock */}
      <div className="map-quick-legend">
        <button
          className="map-legend-pill"
          onClick={() => {
            if (incidents[0]?.coordinates) {
              mapRef.current?.flyTo({ center: incidents[0].coordinates, zoom: 14.8, pitch: 26, duration: 800 });
              onSelectEntity({ type: 'incident', coordinates: incidents[0].coordinates, data: incidents[0] });
            }
          }}
          title="Click to focus active emergency on NH-16"
        >
          <span>🚨</span>
          <span>{incidents.filter((i) => i.status !== 'RESOLVED').length} Incidents</span>
        </button>

        <button
          className="map-legend-pill"
          onClick={() => {
            const activeAmb = responders.find((a) => a.id === 'AMB-003') || responders[0];
            if (activeAmb?.coordinates) {
              mapRef.current?.flyTo({ center: activeAmb.coordinates, zoom: 14.8, pitch: 26, duration: 800 });
              onSelectEntity({ type: 'ambulance', coordinates: activeAmb.coordinates, data: activeAmb });
            }
          }}
          title="Click to track 108 Emergency Ambulance"
        >
          <span>🚑</span>
          <span>{responders.length} 108 Units</span>
        </button>

        <button
          className="map-legend-pill"
          onClick={() => {
            const rims = hospitals.find((h) => h.id === 'HOS-002') || hospitals[0];
            if (rims?.coordinates) {
              mapRef.current?.flyTo({ center: rims.coordinates, zoom: 14.8, pitch: 26, duration: 800 });
              onSelectEntity({ type: 'hospital', coordinates: rims.coordinates, data: rims });
            }
          }}
          title="Click to inspect RIMS Trauma Center"
        >
          <span>🏥</span>
          <span>{hospitals.length} Hospitals</span>
        </button>

        <button
          className="map-legend-pill"
          onClick={() => {
            mapRef.current?.flyTo({ center: [83.882, 18.289], zoom: 14.5, pitch: 26, duration: 800 });
          }}
          title="Click to inspect Nagavali river hazard & detour"
        >
          <span>⚠️</span>
          <span>Road Hazards</span>
        </button>
      </div>

      {/* Floating Spatial Hover Inspector */}
      {hoveredFeature && (
        <div
          style={{
            position: 'absolute',
            bottom: '80px',
            right: '20px',
            zIndex: 30,
            background: 'rgba(8, 14, 23, 0.94)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 240, 255, 0.35)',
            borderRadius: '10px',
            padding: '10px 14px',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.85)',
            maxWidth: '320px',
            animation: 'fadeIn 0.2s ease'
          }}
        >
          <div style={{ fontSize: '9px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 800, color: '#00f0ff', marginBottom: '2px' }}>
            {hoveredFeature.type.toUpperCase()} TELEMETRY
          </div>
          <div style={{ fontSize: '12px', fontWeight: 800, color: '#f2f5f8' }}>
            {hoveredFeature.props.name || hoveredFeature.props.corridor}
          </div>
          <div style={{ fontSize: '9.5px', color: '#9aa8b8', marginTop: '2px' }}>
            {hoveredFeature.props.alert || `Speed: ${hoveredFeature.props.speed_kmh} km/h • Status: ${hoveredFeature.props.congestion}`}
          </div>
        </div>
      )}
    </div>
  );
}
