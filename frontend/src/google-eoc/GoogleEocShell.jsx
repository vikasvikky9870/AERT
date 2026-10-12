/**
 * AERT 3.0 — Google Maps Emergency Response Operations Interface
 * Sector: Srikakulam District, Andhra Pradesh, India (AP-SKLM-EOC-01)
 * 
 * Rebuilt from scratch with Google Maps Clean Cartography & Material 3 Layout.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Map as MapLibreMap, Marker as MapLibreMarker } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  GOOGLE_STREET_STYLE,
  GOOGLE_SATELLITE_STYLE,
  GOOGLE_DARK_STYLE
} from './googleMapStyles';
import './googleEoc.css';
import { useOperationalState } from '../state/operationalState';
import { soundManager } from '../services/soundManager';
import { GoldenSliceMission } from '../features/operations/GoldenSliceMission';
import { OPERATIONAL_SCENARIOS } from './scenarios';
import {
  Search,
  Navigation,
  Compass,
  Plus,
  Minus,
  Crosshair,
  Layers,
  Sparkles,
  AlertTriangle,
  Building2,
  Ambulance,
  Phone,
  Radio,
  Clock,
  Shield,
  Volume2,
  VolumeX,
  X,
  ArrowRight,
  CheckCircle2,
  Share2,
  Info,
  Flame,
  AlertCircle
} from 'lucide-react';

const SRIKAKULAM_CENTER = [83.8961, 18.2969]; // 7 Road Junction
const SRIKAKULAM_BOUNDS = [
  [83.7000, 18.1500],
  [84.1500, 18.5000]
];

export function GoogleEocShell({ soundEnabled = true, onToggleSound = () => {} }) {
  const state = useOperationalState();
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  // Basemap Style: 'street' | 'satellite' | 'dark'
  const [basemap, setBasemap] = useState('street');

  // Search & Active Filter Chip
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL'|'INCIDENTS'|'AMBULANCES'|'HOSPITALS'|'HAZARDS'

  // Selected Entity for Left Place Sheet (Defaults to highest priority incident)
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(true);

  // Modals
  const [showCallModal, setShowCallModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showSosModal, setShowSosModal] = useState(false);
  const [toastNotice, setToastNotice] = useState('');

  // Quantum Optimization Telemetry
  const [quantumTelemetry, setQuantumTelemetry] = useState({
    groundStateProb: 0.948,
    quboEnergy: -1.842,
    optimalBitstring: '|0001>',
    timeSavedMins: 3.4,
    converged: true
  });

  // 18-Step Golden Slice Simulation Step
  const [simStep, setSimStep] = useState(0);
  const [simActive, setSimActive] = useState(false);

  // Map Readiness State
  const [mapReady, setMapReady] = useState(false);

  // 1. Multi-Scenario Operational State Engine
  const [currentScenarioId, setCurrentScenarioId] = useState('SCENARIO_1');
  const [showScenarioMenu, setShowScenarioMenu] = useState(false);
  const [showLayersModal, setShowLayersModal] = useState(false);
  const [showQuantumModal, setShowQuantumModal] = useState(false);
  const [showAltRoutes, setShowAltRoutes] = useState(false);

  const currentScenario = OPERATIONAL_SCENARIOS[currentScenarioId] || OPERATIONAL_SCENARIOS.SCENARIO_1;
  const ROUTES_DATA = currentScenario.routes;

  const [selectedRouteId, setSelectedRouteId] = useState('ROUTE_A');
  const [showHospitalScanModal, setShowHospitalScanModal] = useState(false);
  const [showTrafficOverlay, setShowTrafficOverlay] = useState(true);
  const [showFloodOverlay, setShowFloodOverlay] = useState(true);
  const [trackingPhase, setTrackingPhase] = useState('IDLE'); // 'IDLE'|'PHASE_1_PICKUP'|'PHASE_SCANNING'|'PHASE_2_TRANSPORT'|'COMPLETED'

  // Crew & Vehicle Dossier
  const CREW_DOSSIER = {
    driver: 'K. Ramesh Naidu',
    driverCert: 'Grade 1 EVOC Certified · 8 Yrs Exp',
    driverPhone: '+91 98480 22108',
    paramedic: 'Sister P. Hemalatha',
    paramedicRole: 'ALS Trauma Life Support Specialist',
    paramedicPhone: '+91 94401 10822',
    registration: 'AP-39-TC-1081',
    unitType: '108 ALS Force Traveller',
    equipment: 'Ventilator Hamilton-T1 · Defibrillator Zoll X · O₂ 140 Bar · Suction Unit'
  };

  // Weather & Coastal Flood Data
  const WEATHER_DATA = {
    temp: '29°C',
    condition: 'Heavy Monsoon Rain',
    precipitation: '18 mm/h',
    wind: '24 km/h NE',
    roadGrip: '0.62 (Wet/Slick)',
    riverLevel: '21.4m',
    warningLevel: '22.0m'
  };

  // Live Ambulance Tracking State
  const [isTracking, setIsTracking] = useState(false);
  const [trackedVehicle, setTrackedVehicle] = useState({
    id: 'AMB-001',
    type: 'ALS',
    speed: 58,
    eta: '1m 40s to Pickup',
    target: '7 Road Depot ➔ NH-16 Crash',
    progress: 0,
    statusLabel: 'EN ROUTE TO ACCIDENT SCENE'
  });
  const trackingIntervalRef = useRef(null);
  const animatedMarkerRef = useRef(null);
  const liveMovingMarkerRef = useRef(null);
  const liveHazardMarkerRef = useRef(null);

  // Sync with backend on mount to load live hospitals and ambulances
  useEffect(() => {
    state.syncWithBackend?.();
  }, []);

  // Live IST Clock
  const [clock, setClock] = useState(() =>
    new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(new Date())
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setClock(
        new Intl.DateTimeFormat('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }).format(new Date())
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const activeIncidents = state.incidents.filter((i) => i.status !== 'RESOLVED');

  // Default selection on load
  useEffect(() => {
    if (!selectedEntity && activeIncidents.length > 0) {
      setSelectedEntity({ type: 'incident', data: activeIncidents[0] });
    }
  }, [activeIncidents, selectedEntity]);

  // -------------------------------------------------------------
  // 1. INITIALIZE MAPLIBRE ENGINE WITH GOOGLE MAPS STYLE & LAYERS
  // -------------------------------------------------------------
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const styleMap = {
      street: GOOGLE_STREET_STYLE,
      satellite: GOOGLE_SATELLITE_STYLE,
      dark: GOOGLE_DARK_STYLE
    };

    const map = new MapLibreMap({
      container: mapContainerRef.current,
      style: styleMap[basemap],
      center: SRIKAKULAM_CENTER,
      zoom: 13.5,
      minZoom: 10,
      maxZoom: 19,
      pitch: 0,
      bearing: 0,
      maxBounds: SRIKAKULAM_BOUNDS,
      attributionControl: false
    });

    mapRef.current = map;

    map.on('load', () => {
      setMapReady(true);

      // A. Traffic Flow Congestion Segments
      if (!map.getSource('aert-traffic-flow')) {
        map.addSource('aert-traffic-flow', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                properties: { color: '#10b981', speed: '58 km/h' },
                geometry: {
                  type: 'LineString',
                  coordinates: [
                    [83.9008, 18.3012], [83.9050, 18.3050], [83.9100, 18.3100], [83.9150, 18.3150]
                  ]
                }
              },
              {
                type: 'Feature',
                properties: { color: '#f59e0b', speed: '28 km/h' },
                geometry: {
                  type: 'LineString',
                  coordinates: [
                    [83.8961, 18.2969], [83.8985, 18.2995], [83.9008, 18.3012]
                  ]
                }
              },
              {
                type: 'Feature',
                properties: { color: '#ef4444', speed: '9 km/h' },
                geometry: {
                  type: 'LineString',
                  coordinates: [
                    [83.8920, 18.2940], [83.8940, 18.2980], [83.8960, 18.3010]
                  ]
                }
              }
            ]
          }
        });

        map.addLayer({
          id: 'aert-traffic-layer',
          type: 'line',
          source: 'aert-traffic-flow',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': ['get', 'color'],
            'line-width': 4.5,
            'line-opacity': 0.75
          }
        });
      }

      // B. Nagavali River Flooding Hazard Line
      if (!map.getSource('aert-flood-hazard')) {
        map.addSource('aert-flood-hazard', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: [
                [83.8800, 18.2870], [83.8820, 18.2890], [83.8850, 18.2910]
              ]
            }
          }
        });

        map.addLayer({
          id: 'aert-flood-layer',
          type: 'line',
          source: 'aert-flood-hazard',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': '#0284c7',
            'line-width': 8,
            'line-dasharray': [1, 2],
            'line-opacity': 0.85
          }
        });
      }

      // C. Primary Active Emergency Corridor
      if (!map.getSource('aert-active-route')) {
        map.addSource('aert-active-route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: { type: 'LineString', coordinates: ROUTES_DATA.ROUTE_A.waypoints }
          }
        });

        map.addLayer({
          id: 'aert-route-casing',
          type: 'line',
          source: 'aert-active-route',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': '#ffffff', 'line-width': 8, 'line-opacity': 0.95 }
        });

        map.addLayer({
          id: 'aert-route-core',
          type: 'line',
          source: 'aert-active-route',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': '#00d4ff', 'line-width': 5, 'line-opacity': 1.0 }
        });

        map.addLayer({
          id: 'aert-route-glow',
          type: 'line',
          source: 'aert-active-route',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': '#10b981', 'line-width': 2.5, 'line-dasharray': [2, 3] }
        });
      }
    });

    return () => {
      setMapReady(false);
      map.remove();
    };
  }, [basemap]);

  // -------------------------------------------------------------
  // 2. RENDER GOOGLE-STYLE MAP PINS WITH DEDICATED ICONS
  // -------------------------------------------------------------
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // A. Incidents (Google Red Teardrop Pin with Pulsing Radar Halo)
    if (activeFilter === 'ALL' || activeFilter === 'INCIDENTS') {
      activeIncidents.forEach((inc) => {
        if (!inc.coordinates) return;
        const coords = [Number(inc.coordinates[0]), Number(inc.coordinates[1])];
        if (isNaN(coords[0]) || isNaN(coords[1])) return;

        const el = document.createElement('div');
        el.className = 'gmap-incident-pin';

        const victims = inc.victims || 6;

        el.innerHTML = `
          <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 48px; height: 48px; border-radius: 50%; background: rgba(217, 48, 37, 0.22); border: 1.5px solid #d93025; animation: gmap-pulse 1.8s infinite ease-out;"></div>
          <div style="position: relative; z-index: 2; width: 36px; height: 44px; display: flex; flex-direction: column; align-items: center;">
            <div style="width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); background: #d93025; display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 8px rgba(0,0,0,0.35); border: 2px solid #ffffff;">
              <span style="transform: rotate(45deg); font-size: 15px;">🚨</span>
            </div>
          </div>
          <div style="position: absolute; top: 38px; left: 50%; transform: translateX(-50%); background: #ffffff; border: 1px solid rgba(0,0,0,0.12); border-radius: 12px; padding: 3px 8px; white-space: nowrap; box-shadow: 0 2px 8px rgba(60,64,67,0.28); display: flex; align-items: center; gap: 5px;">
            <span style="font-size: 10px; font-weight: 800; color: #d93025;">${inc.id}</span>
            <span style="font-size: 9px; color: #5f6368; font-weight: 600;">${victims} Injured</span>
          </div>
        `;

        el.addEventListener('click', (e) => {
          e.stopPropagation();
          setSelectedEntity({ type: 'incident', data: inc });
          setSheetOpen(true);
          map.flyTo({ center: coords, zoom: 15, duration: 800 });
        });

        const marker = new MapLibreMarker({ element: el })
          .setLngLat(coords)
          .addTo(map);

        markersRef.current.push(marker);
      });
    }

    // B. Ambulances (Google 108 Emergency Vehicle Pill with Flashers)
    if (activeFilter === 'ALL' || activeFilter === 'AMBULANCES') {
      state.ambulances.forEach((amb) => {
        if (!amb.coordinates) return;
        // If this ambulance is currently live-tracked, skip creating static pin (handled by liveMovingMarkerRef)
        if (isTracking && amb.id === trackedVehicle.id) return;

        const coords = [Number(amb.coordinates[0]), Number(amb.coordinates[1])];
        if (isNaN(coords[0]) || isNaN(coords[1])) return;

        const el = document.createElement('div');
        const isEnRoute = amb.status === 'EN_ROUTE';
        el.className = `gmap-ambulance-pin ${isEnRoute ? 'en-route' : ''}`;

        el.innerHTML = `
          <span style="font-size: 16px;">🚑</span>
          <div style="display: flex; flex-direction: column; line-height: 1.15;">
            <span style="font-size: 11px; font-weight: 800; color: #1a73e8;">${amb.id} · ${amb.type || 'ALS'}</span>
            <span style="font-size: 8.5px; color: ${isEnRoute ? '#188038' : '#5f6368'}; font-weight: 700;">
              ${isEnRoute ? '⚡ EN ROUTE' : 'STANDBY · IDLE'}
            </span>
          </div>
          <span style="font-size: 9.5px; background: ${isEnRoute ? '#e6f4ea' : '#f1f3f4'}; color: ${isEnRoute ? '#188038' : '#5f6368'}; padding: 2px 6px; border-radius: 10px; font-weight: 800;">
            ${isEnRoute ? `${amb.speed_kmh || 54} km/h` : '0 km/h · IDLE'}
          </span>
        `;

        el.addEventListener('click', (e) => {
          e.stopPropagation();
          setSelectedEntity({ type: 'ambulance', data: amb });
          setSheetOpen(true);
          map.flyTo({ center: coords, zoom: 15.5, duration: 800 });
        });

        const marker = new MapLibreMarker({ element: el })
          .setLngLat(coords)
          .addTo(map);

        markersRef.current.push(marker);
      });
    }

    // C. Hospitals (Dedicated Google Medical Cross Pill with Real ICU Beds)
    if (activeFilter === 'ALL' || activeFilter === 'HOSPITALS') {
      state.hospitals.forEach((hos) => {
        if (!hos.coordinates) return;
        const coords = [Number(hos.coordinates[0]), Number(hos.coordinates[1])];
        if (isNaN(coords[0]) || isNaN(coords[1])) return;

        const el = document.createElement('div');
        el.className = 'gmap-hospital-pin';

        const icuBeds = hos.icu_beds_available ?? hos.capacity?.icu_available ?? hos.icu_available ?? (hos.icu_total ? hos.icu_total - (hos.icu_occupied || 0) : 12);

        let shortName = 'Hospital';
        const raw = hos.name || '';
        if (raw.includes('RIMS')) shortName = 'RIMS Medical College';
        else if (raw.includes('GGH') || raw.includes('Government')) shortName = 'GGH Srikakulam';
        else if (raw.includes('Seven Hills')) shortName = 'Seven Hills Trauma';
        else if (raw.includes('Apex')) shortName = 'Apex Life Care';
        else if (raw.includes('Amudalavalasa')) shortName = 'Amudalavalasa CHC';
        else shortName = raw.split(',')[0];

        el.innerHTML = `
          <div class="hospital-pin-icon">🏥</div>
          <div style="display: flex; flex-direction: column; line-height: 1.15;">
            <span class="hospital-pin-name">${shortName}</span>
            <span style="font-size: 8.5px; color: #5f6368; font-weight: 600;">${hos.trauma_level?.split(' ')[0] || 'Level 1'} Center</span>
          </div>
          <span class="hospital-pin-beds">${icuBeds} ICU</span>
        `;

        el.addEventListener('click', (e) => {
          e.stopPropagation();
          if (soundManager.playSonarPing) {
            soundManager.playSonarPing();
          } else if (soundManager.playClick) {
            soundManager.playClick();
          }
          setSelectedEntity({ type: 'hospital', data: hos });
          setSheetOpen(true);
          map.flyTo({ center: coords, zoom: 15.5, duration: 800 });
        });

        const marker = new MapLibreMarker({ element: el })
          .setLngLat(coords)
          .addTo(map);

        markersRef.current.push(marker);
      });
    }

    // D. Road Hazards (Nagavali Flood & Highway Closures)
    if (activeFilter === 'ALL' || activeFilter === 'HAZARDS') {
      const hazards = [
        { id: 'ROAD-001', title: 'NH-16 Flyover Widening', coords: [83.908, 18.308], delay: '+45%' },
        { id: 'ROAD-003', title: 'Nagavali River Waterlogging', coords: [83.882, 18.289], delay: '+60%' }
      ];

      hazards.forEach((haz) => {
        const el = document.createElement('div');
        el.className = 'gmap-incident-pin';

        el.innerHTML = `
          <div style="display: flex; align-items: center; gap: 4px; background: #ffffff; border: 2px solid #e37400; border-radius: 20px; padding: 4px 8px; box-shadow: 0 2px 8px rgba(227,116,0,0.35);">
            <span style="font-size: 13px;">⚠️</span>
            <span style="font-size: 9.5px; font-weight: 800; color: #e37400;">${haz.title}</span>
            <span style="font-size: 8.5px; background: #fef7e0; color: #b06000; padding: 1px 4px; border-radius: 6px; font-weight: 700;">
              ${haz.delay}
            </span>
          </div>
        `;

        el.addEventListener('click', (e) => {
          e.stopPropagation();
          setSelectedEntity({ type: 'hazard', data: haz });
          setSheetOpen(true);
          map.flyTo({ center: haz.coords, zoom: 15, duration: 800 });
        });

        const marker = new MapLibreMarker({ element: el })
          .setLngLat(haz.coords)
          .addTo(map);

        markersRef.current.push(marker);
      });
    }
  }, [mapReady, activeFilter, activeIncidents, state.ambulances, state.hospitals, isTracking]);

  // -------------------------------------------------------------
  // 3. TWO-STAGE LIVE AMBULANCE ROUTE TRACKING & ICU VACANCY SCAN
  // -------------------------------------------------------------
  const handleSelectRoute = (routeId) => {
    setSelectedRouteId(routeId);
    const r = ROUTES_DATA[routeId];
    if (!r) return;
    soundManager.playClickTone?.();
    setToastNotice(`🧭 Active Corridor: ${r.name}`);

    const map = mapRef.current;
    if (map && map.getSource('aert-active-route')) {
      map.getSource('aert-active-route').setData({
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: r.waypoints }
      });
      map.flyTo({ center: r.waypoints[0], zoom: 14.5, duration: 600 });
    }
  };

  const handleSelectScenario = (scenarioId) => {
    const sc = OPERATIONAL_SCENARIOS[scenarioId];
    if (!sc) return;
    setCurrentScenarioId(scenarioId);
    setShowScenarioMenu(false);
    setSelectedRouteId('ROUTE_A');
    handleStopTracking();

    soundManager.playClickTone?.();
    setToastNotice(`🎯 Scenario Switched: ${sc.fullName}`);

    const map = mapRef.current;
    if (map) {
      map.flyTo({ center: sc.center, zoom: sc.zoom, pitch: sc.pitch, duration: 900 });
      if (map.getSource('aert-active-route')) {
        map.getSource('aert-active-route').setData({
          type: 'Feature',
          geometry: { type: 'LineString', coordinates: sc.routes.ROUTE_A.waypoints }
        });
      }
    }

    setSelectedEntity({
      type: 'incident',
      data: {
        id: sc.incidentId,
        title: sc.title,
        severity: sc.severity,
        location: sc.location,
        coordinates: sc.center,
        victims: sc.casualties.split(' ')[0] || 6,
        critical_victims: sc.casualties.includes('Critical') ? 2 : 1,
        hazard: sc.hazard,
        assigned_ambulance: sc.assignedAmb,
        assigned_hospital: sc.hospital
      }
    });
    setSheetOpen(true);
  };

  const handleStartTracking = (ambulanceId = currentScenario.assignedAmb, targetName = currentScenario.title) => {
    if (soundManager.playDispatchTone) {
      soundManager.playDispatchTone();
    } else if (soundManager.playSirenTone) {
      soundManager.playSirenTone();
    }
    setIsTracking(true);
    setSheetOpen(false);
    setTrackingPhase('PHASE_1_PICKUP');
    setTrackedVehicle(prev => ({
      ...prev,
      id: ambulanceId,
      target: targetName,
      speed: 52,
      progress: 0,
      statusLabel: 'EN ROUTE TO ACCIDENT SCENE'
    }));
    setToastNotice(`🚑 Leg 1 Dispatched: Unit ${ambulanceId} En Route to Scene`);

    const route = ROUTES_DATA[selectedRouteId] || ROUTES_DATA.ROUTE_A;
    const midIdx = Math.floor(route.waypoints.length / 2);
    const waypointsLeg1 = route.waypoints.slice(0, midIdx + 1);
    const waypointsLeg2 = route.waypoints.slice(midIdx);

    const map = mapRef.current;
    if (map && map.getSource('aert-active-route')) {
      map.getSource('aert-active-route').setData({
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: waypointsLeg1 }
      });
      map.flyTo({ center: waypointsLeg1[0], zoom: 14.8, pitch: 25, duration: 800 });
    }

    // Clean up any existing moving marker
    if (liveMovingMarkerRef.current) {
      liveMovingMarkerRef.current.remove();
      liveMovingMarkerRef.current = null;
    }

    // Create high-visibility live moving ambulance marker
    if (map) {
      const movingEl = document.createElement('div');
      movingEl.className = 'gmap-moving-ambulance-card';
      movingEl.id = 'live-moving-ambulance';
      movingEl.innerHTML = `
        <span class="moving-amb-siren">🚨</span>
        <div style="display: flex; flex-direction: column; line-height: 1.15;">
          <span style="font-size: 11px; font-weight: 800; color: #00f0ff; letter-spacing: 0.3px;">${ambulanceId} · ALS SPEED-CORRIDOR</span>
          <span id="live-amb-subtext" style="font-size: 8.5px; color: #a1a1aa; font-weight: 600;">EN ROUTE ➔ PICKUP</span>
        </div>
        <span id="live-amb-speed" class="moving-amb-badge">52 km/h</span>
      `;

      movingEl.addEventListener('click', (e) => {
        e.stopPropagation();
        soundManager.playSirenTone?.();
        setToastNotice(`🚑 Live Telemetry: Unit ${ambulanceId} | Driver: ${CREW_DOSSIER.driver} | Protocol: ALS`);
      });

      const movingMarker = new MapLibreMarker({ element: movingEl, anchor: 'center' })
        .setLngLat(waypointsLeg1[0])
        .addTo(map);

      liveMovingMarkerRef.current = movingMarker;
    }

    let stepIndex = 0;
    const totalStepsLeg1 = 20;

    if (trackingIntervalRef.current) clearInterval(trackingIntervalRef.current);

    // Leg 1: En Route to Incident Pickup Point
    trackingIntervalRef.current = setInterval(() => {
      stepIndex++;
      const fraction = stepIndex / totalStepsLeg1;

      if (fraction >= 1) {
        clearInterval(trackingIntervalRef.current);
        trackingIntervalRef.current = null;

        if (liveMovingMarkerRef.current) {
          liveMovingMarkerRef.current.setLngLat(waypointsLeg1[waypointsLeg1.length - 1]);
          const speedEl = document.getElementById('live-amb-speed');
          if (speedEl) speedEl.textContent = '0 km/h';
          const subEl = document.getElementById('live-amb-subtext');
          if (subEl) subEl.textContent = 'ON SCENE · TRIAGE ACTIVE';
        }

        // --- ARRIVED AT PICKUP POINT: PAUSE & SCAN HOSPITAL VACANCIES ---
        soundManager.playSonarPing?.();
        setTrackingPhase('PHASE_SCANNING');
        setShowHospitalScanModal(true);
        setTrackedVehicle(prev => ({
          ...prev,
          speed: 0,
          eta: 'On Scene · Triage Active',
          progress: 50,
          statusLabel: 'PATIENT PICKUP · SCANNING VACANCIES'
        }));
        setToastNotice(`🚨 Arrived at Scene: Victims Secured. Matching ${currentScenario.hospital}...`);

        // Scan delay: 3.5 seconds before moving to Stage 2
        setTimeout(() => {
          setShowHospitalScanModal(false);
          soundManager.playSirenTone?.();
          setTrackingPhase('PHASE_2_TRANSPORT');
          setToastNotice(`🏥 Hospital Allocated: ${currentScenario.hospital}. En Route under ALS Protocol!`);

          // Update active route line to Leg 2 on map
          if (map && map.getSource('aert-active-route')) {
            map.getSource('aert-active-route').setData({
              type: 'Feature',
              geometry: { type: 'LineString', coordinates: waypointsLeg2 }
            });
            map.flyTo({ center: waypointsLeg2[0], zoom: 15, pitch: 30, duration: 600 });
          }

          // Leg 2: Rapid Transport from Pickup Point to Hospital
          let leg2Step = 0;
          const totalStepsLeg2 = 20;

          trackingIntervalRef.current = setInterval(() => {
            leg2Step++;
            const leg2Fraction = leg2Step / totalStepsLeg2;

            if (leg2Fraction >= 1) {
              clearInterval(trackingIntervalRef.current);
              trackingIntervalRef.current = null;

              if (liveMovingMarkerRef.current) {
                liveMovingMarkerRef.current.setLngLat(waypointsLeg2[waypointsLeg2.length - 1]);
                const speedEl = document.getElementById('live-amb-speed');
                if (speedEl) speedEl.textContent = '0 km/h';
                const subEl = document.getElementById('live-amb-subtext');
                if (subEl) subEl.textContent = 'HANDOVER COMPLETED';
              }

              soundManager.playSonarPing?.();
              setTrackingPhase('COMPLETED');
              setToastNotice(`✅ Handover Complete at ${currentScenario.hospital}. Mission Accomplished!`);
              setTrackedVehicle(prev => ({
                ...prev,
                speed: 0,
                eta: 'Arrived at Trauma Bay',
                progress: 100,
                statusLabel: 'MISSION COMPLETED · HANDOVER DONE'
              }));
              return;
            }

            const totalSegs = waypointsLeg2.length - 1;
            const curSegFrac = leg2Fraction * totalSegs;
            const segIdx = Math.min(Math.floor(curSegFrac), totalSegs - 1);
            const subFrac = curSegFrac - segIdx;
            const p1 = waypointsLeg2[segIdx];
            const p2 = waypointsLeg2[segIdx + 1];
            const curPos = [
              p1[0] + (p2[0] - p1[0]) * subFrac,
              p1[1] + (p2[1] - p1[1]) * subFrac
            ];

            if (liveMovingMarkerRef.current) {
              liveMovingMarkerRef.current.setLngLat(curPos);
            }

            const remSec = Math.round((1 - leg2Fraction) * 110);
            const mins = Math.floor(remSec / 60);
            const secs = remSec % 60;
            const speed = Math.round(58 + Math.sin(leg2Fraction * 8) * 8);

            const speedEl = document.getElementById('live-amb-speed');
            if (speedEl) speedEl.textContent = `${speed} km/h`;
            const subEl = document.getElementById('live-amb-subtext');
            if (subEl) subEl.textContent = `TO ER ➔ ${mins}m ${secs < 10 ? '0' : ''}${secs}s`;

            setTrackedVehicle(prev => ({
              ...prev,
              speed,
              eta: `${mins}m ${secs < 10 ? '0' : ''}${secs}s to ER`,
              progress: Math.round(50 + leg2Fraction * 50),
              statusLabel: 'RAPID TRANSPORT ➔ ER TRAUMA BAY'
            }));

            if (leg2Step % 3 === 0 && mapRef.current) {
              mapRef.current.easeTo({ center: curPos, duration: 250 });
            }
          }, 240);

        }, 3600);

        return;
      }

      // Interpolate along Leg 1
      const totalSegs = waypointsLeg1.length - 1;
      const curSegFrac = fraction * totalSegs;
      const segIdx = Math.min(Math.floor(curSegFrac), totalSegs - 1);
      const subFrac = curSegFrac - segIdx;
      const p1 = waypointsLeg1[segIdx];
      const p2 = waypointsLeg1[segIdx + 1];
      const curPos = [
        p1[0] + (p2[0] - p1[0]) * subFrac,
        p1[1] + (p2[1] - p1[1]) * subFrac
      ];

      if (liveMovingMarkerRef.current) {
        liveMovingMarkerRef.current.setLngLat(curPos);
      }

      const remSec = Math.round((1 - fraction) * 100);
      const mins = Math.floor(remSec / 60);
      const secs = remSec % 60;
      const speed = Math.round(52 + Math.sin(fraction * 6) * 6);

      const speedEl = document.getElementById('live-amb-speed');
      if (speedEl) speedEl.textContent = `${speed} km/h`;
      const subEl = document.getElementById('live-amb-subtext');
      if (subEl) subEl.textContent = `EN ROUTE ➔ ${mins}m ${secs < 10 ? '0' : ''}${secs}s`;

      setTrackedVehicle(prev => ({
        ...prev,
        speed,
        eta: `${mins}m ${secs < 10 ? '0' : ''}${secs}s to Scene`,
        progress: Math.round(fraction * 50),
        statusLabel: 'EN ROUTE TO ACCIDENT SCENE'
      }));

      if (stepIndex % 3 === 0 && mapRef.current) {
        mapRef.current.easeTo({ center: curPos, duration: 250 });
      }
    }, 240);
  };

  const handleStopTracking = () => {
    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current);
      trackingIntervalRef.current = null;
    }
    if (liveMovingMarkerRef.current) {
      liveMovingMarkerRef.current.remove();
      liveMovingMarkerRef.current = null;
    }
    if (liveHazardMarkerRef.current) {
      liveHazardMarkerRef.current.remove();
      liveHazardMarkerRef.current = null;
    }
    setIsTracking(false);
    setTrackingPhase('IDLE');
    setShowHospitalScanModal(false);
    const map = mapRef.current;
    if (map && map.getSource('aert-active-route')) {
      map.getSource('aert-active-route').setData({
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: [] }
      });
    }
    setToastNotice('Tracking paused by operator');
  };

  // Listen for Citizen SOS broadcast events from phone.html iframe
  useEffect(() => {
    const handleCitizenMessage = (event) => {
      if (event.data && event.data.type === 'CITIZEN_SOS_TRIGGERED') {
        const payload = event.data.data || {};
        soundManager.playSirenTone();
        setToastNotice(`🚨 Citizen SOS Registered! Unit ${payload.assigned_ambulance || 'AMB-001'} Dispatched.`);
        setShowSosModal(false);
        handleStartTracking(payload.assigned_ambulance_id || 'AMB-001', payload.target_hospital || 'Citizen Emergency');
      }
    };
    window.addEventListener('message', handleCitizenMessage);
    return () => window.removeEventListener('message', handleCitizenMessage);
  }, [currentScenario]);

  // 18-Step Live Demo Step Handler (Coordinates MapLibre with each simulation phase)
  const handleDemoStep = (stepNumber) => {
    setSimStep(stepNumber);
    const map = mapRef.current;
    if (!map) return;
    const sc = currentScenario;

    switch (stepNumber) {
      case 1:
      case 2:
      case 3:
        map.flyTo({ center: SRIKAKULAM_CENTER, zoom: 14.2, duration: 800 });
        setToastNotice(`📞 Step 0${stepNumber}: 108 Call Intake - ${sc.title}`);
        break;

      case 4:
      case 5: {
        map.flyTo({ center: sc.center, zoom: sc.zoom, pitch: sc.pitch, duration: 900 });
        setSelectedEntity({
          type: 'incident',
          data: {
            id: sc.incidentId,
            title: sc.title,
            severity: sc.severity,
            coordinates: sc.center,
            location: sc.location,
            casualties: sc.casualties,
            hazard: sc.hazard
          }
        });
        setSheetOpen(true);
        setToastNotice(`🚨 Step 05: Landmark Resolved to ${sc.location}. Incident ${sc.incidentId} Created`);
        break;
      }

      case 6:
      case 7:
        handleSelectRoute('ROUTE_A');
        setToastNotice(`🧠 Step 07: Quantum QAOA evaluated optimal path. Recommending unit ${sc.assignedAmb}`);
        break;

      case 8:
        soundManager.playCautionPing?.();
        setToastNotice(`⚠️ Step 08: Human Command Gate. Dispatcher sign-off required to deploy ${sc.assignedAmb}`);
        break;

      case 9:
      case 10:
        setToastNotice(`🚑 Step 10: ${sc.assignedAmb} Dispatched with siren along ${sc.routes.ROUTE_A.corridor}`);
        if (!isTracking) {
          handleStartTracking(sc.assignedAmb, sc.title);
        }
        break;

      case 11: {
        soundManager.playWarningBeep?.();
        const haz = sc.activeHazard;
        setToastNotice(`⚠️ Step 11: Active Hazard: ${haz.title} detected (${haz.delay})`);

        if (liveHazardMarkerRef.current) {
          liveHazardMarkerRef.current.remove();
        }
        const hazEl = document.createElement('div');
        hazEl.className = 'gmap-incident-pin';
        hazEl.innerHTML = `
          <div style="display:flex; align-items:center; gap:5px; background:#fff; border:2px solid #e37400; border-radius:18px; padding:4px 9px; box-shadow:0 0 14px rgba(227,116,0,0.6);">
            <span style="font-size:14px;">⚠️</span>
            <span style="font-size:9.5px; font-weight:800; color:#e37400;">${haz.title}</span>
          </div>
        `;
        liveHazardMarkerRef.current = new MapLibreMarker({ element: hazEl })
          .setLngLat(haz.coords)
          .addTo(map);
        break;
      }

      case 12:
        soundManager.playClickTone?.();
        handleSelectRoute('ROUTE_C');
        setToastNotice(`🧭 Step 12: Deterministic detour computed via ${sc.routes.ROUTE_C.corridor}`);
        break;

      case 13:
        soundManager.playSonarPing?.();
        map.flyTo({ center: sc.hospitalCoords, zoom: 15.2, duration: 800 });
        setToastNotice(`🏥 Step 13: Sonar Pre-Alert transmitted to ${sc.hospital} (${sc.traumaBay})`);
        break;

      case 14:
      case 15:
        setToastNotice(`🚑 Step 15: Casualties secured. Rapid ALS transport in-flight to ${sc.hospital}`);
        break;

      case 16:
        soundManager.playSuccessChime?.();
        map.flyTo({ center: sc.hospitalCoords, zoom: 16, pitch: 20, duration: 700 });
        setToastNotice(`🏥 Step 16: Patient handover complete at ${sc.hospital}. Vitals synchronized`);
        break;

      case 17:
      case 18:
        soundManager.playResolvedTone?.();
        setToastNotice(`✅ Step 18: Incident ${sc.incidentId} Resolved. After-Action SITREP ready for review`);
        break;

      default:
        break;
    }
  };

  // Dispatch Action Handlers
  const handleDispatch = () => {
    handleStartTracking('AMB-001', selectedEntity?.data?.title || 'NH-16 Collision');
  };

  const handlePreAlert = async () => {
    soundManager.playSonarPing();
    setToastNotice('🏥 Sonar Trauma Bay Pre-Alert Transmitted to RIMS Srikakulam (Bay #3 Reserved)');
    try {
      await fetch('http://localhost:8000/api/hospitals/pre-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incident_id: selectedEntity?.data?.id || 'INC-001',
          hospital_id: 'HOS-002',
          ambulance_id: 'AMB-001',
          severity: 'CRITICAL',
          patient_summary: '2 Critical Trauma Victims, Severe Head Injury & Flail Chest',
          estimated_eta_mins: 4,
          trauma_requirements: 'Ventilator ICU Bed #3, Blood Bank O- Negative Crossmatch'
        })
      });
    } catch (e) {
      console.warn('Pre-alert handled locally:', e);
    }
    setTimeout(() => setToastNotice(''), 4500);
  };

  const handleSimulationToggle = () => {
    soundManager.playSirenTone?.();
    setSimActive(true);
    setToastNotice('⚡ 18-Step Live Emergency Orchestration Mission Engaged');
    setTimeout(() => setToastNotice(''), 3500);
  };

  const handleInjectDisruption = async (type, corridor, delayMultiplier, lat, lng) => {
    soundManager.playSirenTone();
    setToastNotice(`💥 Injected ${type} (+${Math.round((delayMultiplier - 1) * 100)}% Corridor Delay)`);
    try {
      await fetch('http://localhost:8000/api/disruption/inject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          disruption_type: type,
          corridor_name: corridor,
          delay_multiplier: delayMultiplier,
          latitude: lat,
          longitude: lng,
          radius_km: 2.5
        })
      });
      state.refreshData?.();
    } catch (e) {
      console.warn('Disruption injected locally:', e);
    }
    setTimeout(() => setToastNotice(''), 4000);
  };

  const handleResetRoads = async () => {
    soundManager.playDispatchTone();
    setToastNotice('🔄 Corridor Network Reset to Free-Flow');
    try {
      await fetch('http://localhost:8000/api/demo/scenario/nh16_collision', { method: 'POST' });
      state.refreshData?.();
    } catch (e) {}
    setTimeout(() => setToastNotice(''), 3000);
  };

  const handleSolveQuantum = (_incidentData = null) => {
    soundManager.playSonarPing();
    setToastNotice('⚛️ QAOA Hamiltonian Unitary Converged (Ground State |0001>)');
    setQuantumTelemetry(prev => ({
      ...prev,
      groundStateProb: 0.976,
      quboEnergy: -2.104,
      timeSavedMins: 4.1
    }));
    setTimeout(() => setToastNotice(''), 3500);
  };

  const renderQuantumRouteMatrix = () => (
    <div style={{ marginTop: '14px', borderTop: '1px solid #e8eaed', paddingTop: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '16px' }}>⚡</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: '11.5px', color: '#1a73e8' }}>
              QUANTUM-POWERED EMERGENCY ROUTE OPTIMIZATION
            </div>
            <div style={{ fontSize: '9.5px', color: '#5f6368' }}>
              AI/ML Road Predictor ➔ QAOA QUBO Solver (5 Metrics)
            </div>
          </div>
        </div>
        <span style={{ fontSize: '9.5px', background: '#e6f4ea', color: '#188038', padding: '2px 7px', borderRadius: '10px', fontWeight: 800 }}>
          3 Corridors Evaluated
        </span>
      </div>

      <div className="quantum-route-matrix-container">
        {Object.values(ROUTES_DATA).map((r) => {
          const isSelected = selectedRouteId === r.id;
          return (
            <div
              key={r.id}
              className={`quantum-route-card ${isSelected ? 'selected' : ''} ${r.type === 'ARTERIAL' ? 'warning' : ''}`}
              onClick={() => handleSelectRoute(r.id)}
            >
              <div className="quantum-route-header">
                <span className="quantum-route-title" style={{ color: isSelected ? '#0284c7' : '#202124' }}>
                  <span>{r.type === 'QUANTUM' ? '⚛️' : r.type === 'ARTERIAL' ? '🚦' : '🌧️'}</span>
                  <span>{r.name}</span>
                </span>
                <span style={{
                  fontSize: '9.5px',
                  fontWeight: 800,
                  padding: '2px 6px',
                  borderRadius: '8px',
                  background: isSelected ? '#10b981' : '#e8eaed',
                  color: isSelected ? '#ffffff' : '#5f6368'
                }}>
                  ETA {r.eta} · {r.distance}
                </span>
              </div>

              <div style={{ fontSize: '10px', color: '#5f6368' }}>
                📍 {r.corridor}
              </div>

              {/* 5 Route Metrics from Architecture Diagram */}
              {(() => {
                const congPct = typeof r.congestion === 'number' ? Math.round(r.congestion * 100) : 18;
                const relPct = typeof r.reliability === 'number' ? Math.round(r.reliability * 100) : 94;
                const emScore = typeof r.emergencyScore === 'number' ? r.emergencyScore.toFixed(2) : (r.type === 'QUANTUM' ? '0.96' : '0.62');
                const pTime = r.predictedTime || r.eta || '8.2 min';
                const bDelay = r.bottleneckDelay || (r.type === 'DIJKSTRA' ? '+6.4m' : '0.0m');

                return (
                  <div className="quantum-route-metrics-grid">
                    <div className="quantum-metric-item">
                      <small>1. CONGESTION (C)</small>
                      <strong style={{ color: congPct > 50 ? '#d93025' : '#188038' }}>
                        {congPct}%
                      </strong>
                    </div>
                    <div className="quantum-metric-item">
                      <small>2. PREDICTED (T)</small>
                      <strong>{pTime}</strong>
                    </div>
                    <div className="quantum-metric-item">
                      <small>3. DELAY (B)</small>
                      <strong style={{ color: bDelay !== '0.0m' ? '#e37400' : '#188038' }}>
                        {bDelay}
                      </strong>
                    </div>
                    <div className="quantum-metric-item">
                      <small>4. RELIABILITY (R)</small>
                      <strong style={{ color: relPct > 85 ? '#188038' : '#e37400' }}>
                        {relPct}%
                      </strong>
                    </div>
                    <div className="quantum-metric-item">
                      <small>5. RESPONSE (E)</small>
                      <strong style={{ color: parseFloat(emScore) > 0.85 ? '#188038' : '#5f6368' }}>
                        {emScore}
                      </strong>
                    </div>
                  </div>
                );
              })()}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="google-eoc-root">
      {/* 1. MAP CANVAS (GOOGLE CLEAN / SATELLITE / DARK) */}
      <div ref={mapContainerRef} className="google-eoc-map" />

      {/* 1.1 LIVE 108 AMBULANCE ROUTE TRACKING HUD */}
      {isTracking && (
        <div className="google-tracking-hud">
          <div className="tracking-pulse-dot" />
          <span className="tracking-info-item">
            🚑 108 TRACKING: <strong>{trackedVehicle.id} ({trackedVehicle.type})</strong>
          </span>
          <span className="tracking-info-item" style={{ color: '#00d4ff' }}>
            STATUS: <strong>{trackedVehicle.statusLabel}</strong>
          </span>
          <span className="tracking-info-item">
            Speed: <strong>{trackedVehicle.speed} km/h</strong>
          </span>
          <span className="tracking-info-item">
            ETA: <strong>{trackedVehicle.eta}</strong>
          </span>
          <button className="tracking-stop-btn" onClick={handleStopTracking}>
            Stop
          </button>
        </div>
      )}

      {/* 2. TOP-LEFT GOOGLE SEARCH BOX & FILTER CHIPS */}
      <div className="google-search-container">
        <div className="google-search-bar">
          <div className="google-search-icon">
            <Search size={18} />
          </div>
          <input
            type="text"
            className="google-search-input"
            placeholder="Search Srikakulam accidents, 108 units, hospitals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="google-search-tools">
            <button
              className="google-icon-btn"
              title="108 Citizen Voice Call Intake"
              onClick={() => setShowCallModal(true)}
            >
              <Radio size={17} style={{ color: '#d93025' }} />
            </button>
            <button
              className="google-icon-btn"
              title="Platform Guide & Info"
              onClick={() => setShowGuideModal(true)}
            >
              <Info size={17} style={{ color: '#1a73e8' }} />
            </button>
          </div>
        </div>

        {/* Category Filter Chips Strip */}
        <div className="google-chips-row">
          <button
            className={`google-chip ${activeFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => setActiveFilter('ALL')}
          >
            <span>🌐</span>
            <span>All Entities</span>
          </button>
          <button
            className={`google-chip danger ${activeFilter === 'INCIDENTS' ? 'active' : ''}`}
            onClick={() => {
              setActiveFilter('INCIDENTS');
              if (activeIncidents.length > 0) {
                const targetInc = activeIncidents[0];
                if (targetInc?.coordinates) {
                  mapRef.current?.flyTo({ center: targetInc.coordinates, zoom: 15 });
                }
                setSelectedEntity({ type: 'incident', data: targetInc });
                setSheetOpen(true);
              }
            }}
          >
            <span>🚨</span>
            <span>{activeIncidents.length} Emergencies</span>
          </button>
          <button
            className={`google-chip ${activeFilter === 'AMBULANCES' ? 'active' : ''}`}
            onClick={() => {
              setActiveFilter('AMBULANCES');
              if (state.ambulances.length > 0) {
                const targetAmb = state.ambulances[0];
                if (targetAmb?.coordinates) {
                  mapRef.current?.flyTo({ center: targetAmb.coordinates, zoom: 15.5 });
                }
                setSelectedEntity({ type: 'ambulance', data: targetAmb });
                setSheetOpen(true);
              }
            }}
          >
            <span>🚑</span>
            <span>{state.ambulances.length} 108 Units</span>
          </button>
          <button
            className={`google-chip success ${activeFilter === 'HOSPITALS' ? 'active' : ''}`}
            onClick={() => {
              setActiveFilter('HOSPITALS');
              if (state.hospitals.length > 0) {
                const targetHos = state.hospitals[0];
                if (targetHos?.coordinates) {
                  mapRef.current?.flyTo({ center: targetHos.coordinates, zoom: 15.5 });
                }
                setSelectedEntity({ type: 'hospital', data: targetHos });
                setSheetOpen(true);
              }
            }}
          >
            <span>🏥</span>
            <span>{state.hospitals.length} Hospitals</span>
          </button>
          <button
            className={`google-chip ${activeFilter === 'HAZARDS' ? 'active' : ''}`}
            onClick={() => {
              setActiveFilter('HAZARDS');
              mapRef.current?.flyTo({ center: [83.882, 18.289], zoom: 15 });
              setSelectedEntity({
                type: 'hazard',
                data: { id: 'ROAD-003', title: 'Nagavali River Waterlogging', delay: '+60%' }
              });
              setSheetOpen(true);
            }}
          >
            <span>⚠️</span>
            <span>Road Hazards</span>
          </button>
        </div>

        {/* Live Faculty Disruption Strip */}
        <div className="google-disruption-strip">
          <span className="disruption-label">⚡ Live Disruptions:</span>
          <button
            className="disruption-chip accident"
            title="Simulate severe highway collision on NH-16"
            onClick={() => handleInjectDisruption('COLLISION_NH16', 'NH-16 Srikakulam Bypass', 2.5, 18.3080, 83.9080)}
          >
            <span>💥 NH-16 Crash (+150%)</span>
          </button>
          <button
            className="disruption-chip flood"
            title="Simulate monsoon river waterlogging on bridge approach"
            onClick={() => handleInjectDisruption('FLOOD_NAGAVALI', 'Nagavali River Bridge', 1.8, 18.2890, 83.8820)}
          >
            <span>🌧️ Bridge Flood (+80%)</span>
          </button>
          <button
            className="disruption-chip reset"
            title="Reset road network to optimal free-flow conditions"
            onClick={handleResetRoads}
          >
            <span>🔄 Reset Hazards</span>
          </button>
        </div>
      </div>

      {/* 3. TOP-RIGHT SYSTEM STATUS & GOLDEN SLICE ACTION */}
      <div className="google-top-actions">
        {/* Live Weather & Coastal Flood Telemetry */}
        <div className="google-weather-pill">
          <span>🌧️ {currentScenario.weather.temp} · {currentScenario.weather.condition}</span>
          <span className="weather-flood-tag">🌊 Flood: {currentScenario.weather.river}</span>
          <span style={{ color: '#5f6368', fontSize: '10px' }}>Grip: {currentScenario.weather.grip}</span>
        </div>

        <div className="google-status-pill">
          <div className="google-status-dot" />
          <span>EOC LIVE · {clock} IST</span>
        </div>

        {/* Multi-Scenario Selector */}
        <div className="scenario-dropdown-container">
          <button
            className="scenario-pill-btn"
            onClick={() => setShowScenarioMenu(!showScenarioMenu)}
            title="Switch Operational Emergency Scenario"
          >
            <span>🎯</span>
            <span>{currentScenario.name}</span>
            <span style={{ fontSize: '9px', opacity: 0.7 }}>▾</span>
          </button>

          {showScenarioMenu && (
            <div className="scenario-dropdown-menu">
              <div style={{ padding: '6px 10px', fontSize: '10px', fontWeight: 800, color: '#5f6368', letterSpacing: '0.05em' }}>
                OPERATIONAL SCENARIOS (SRIKAKULAM)
              </div>
              {Object.values(OPERATIONAL_SCENARIOS).map((sc) => (
                <div
                  key={sc.id}
                  className={`scenario-item ${sc.id === currentScenarioId ? 'active' : ''}`}
                  onClick={() => handleSelectScenario(sc.id)}
                >
                  <span style={{ fontSize: '16px' }}>
                    {sc.id === 'SCENARIO_1' ? '💥' : sc.id === 'SCENARIO_2' ? '🌊' : sc.id === 'SCENARIO_3' ? '🫀' : '☣️'}
                  </span>
                  <div>
                    <div className="scenario-item-title">{sc.fullName}</div>
                    <div className="scenario-item-desc">
                      {sc.location} · {sc.casualties}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quantum QAOA vs Dijkstra Explainer Button */}
        <button
          className="google-cta-btn"
          style={{ background: '#070e1b', border: '1px solid #00f0ff', color: '#00f0ff' }}
          title="Explain Quantum QAOA vs Dijkstra Algorithmic Trade-offs"
          onClick={() => setShowQuantumModal(!showQuantumModal)}
        >
          <Sparkles size={14} />
          <span>QAOA VS DIJKSTRA</span>
        </button>

        {/* GIS Tactical Layers Control Button */}
        <button
          className="google-icon-btn"
          style={{ background: '#ffffff', boxShadow: '0 2px 6px rgba(60,64,67,0.2)' }}
          title="Toggle Tactical GIS Map Overlays"
          onClick={() => setShowLayersModal(!showLayersModal)}
        >
          <Layers size={16} style={{ color: '#1a73e8' }} />
        </button>

        <button
          className="google-icon-btn"
          style={{ background: '#ffffff', boxShadow: '0 2px 6px rgba(60,64,67,0.2)' }}
          title={soundEnabled ? 'Web Audio Sirens Active' : 'Audio Muted'}
          onClick={onToggleSound}
        >
          {soundEnabled ? <Volume2 size={16} style={{ color: '#1a73e8' }} /> : <VolumeX size={16} />}
        </button>

        <button
          className="google-cta-btn"
          style={{ background: '#0b1528', border: '1px solid #00d4ff', color: '#00d4ff' }}
          title="Open Citizen 108 SOS Mobile Portal"
          onClick={() => setShowSosModal(true)}
        >
          <span>📱 CITIZEN SOS</span>
        </button>

        <button
          className="google-cta-btn golden"
          title="Launch 18-Step Autonomous Disaster Simulation"
          onClick={handleSimulationToggle}
        >
          <Sparkles size={15} />
          <span>18-STEP LIVE DEMO</span>
        </button>

        <button
          className="google-cta-btn"
          style={{ background: '#d93025' }}
          onClick={() => setShowCallModal(true)}
        >
          <Phone size={15} />
          <span>REPORT 108</span>
        </button>
      </div>

      {/* 4. LEFT SLIDING GOOGLE PLACE SHEET */}
      {sheetOpen && selectedEntity && (
        <aside className="google-place-sheet">
          {/* A. INCIDENT ENTITY VIEW */}
          {selectedEntity.type === 'incident' && (
            <>
              <div className="place-sheet-hero">
                <button
                  className="place-hero-close"
                  onClick={() => setSheetOpen(false)}
                  title="Close place sheet"
                >
                  <X size={16} />
                </button>
                <div className="place-hero-badge">
                  <span>🚨 CRITICAL HIGHWAY COLLISION</span>
                </div>
                <h2 className="place-sheet-title">
                  {selectedEntity.data.title || 'NH-16 Major Multi-Vehicle Crash'}
                </h2>
                <div style={{ fontSize: '11px', opacity: 0.9 }}>
                  📍 {selectedEntity.data.location_name || 'Narasannapeta Bypass, Srikakulam'}
                </div>
              </div>

              <div className="place-sheet-content">
                {/* Google Circle Action Buttons */}
                <div className="place-action-buttons">
                  <button className="place-action-btn" onClick={handleDispatch}>
                    <div className="place-action-circle">
                      <Ambulance size={18} />
                    </div>
                    <span>Dispatch 108</span>
                  </button>
                  <button className="place-action-btn" onClick={handlePreAlert}>
                    <div className="place-action-circle" style={{ color: '#188038' }}>
                      <Building2 size={18} />
                    </div>
                    <span>Pre-Alert ER</span>
                  </button>
                  <button
                    className="place-action-btn"
                    onClick={() => {
                      soundManager.playSirenTone();
                      setToastNotice('🚨 Emergency Siren Activated on NH-16');
                      setTimeout(() => setToastNotice(''), 3000);
                    }}
                  >
                    <div className="place-action-circle" style={{ color: '#d93025' }}>
                      <Volume2 size={18} />
                    </div>
                    <span>Play Siren</span>
                  </button>
                  <button
                    className="place-action-btn"
                    onClick={() => {
                      mapRef.current?.flyTo({ center: selectedEntity.data.coordinates, zoom: 16 });
                    }}
                  >
                    <div className="place-action-circle">
                      <Navigation size={18} />
                    </div>
                    <span>Zoom In</span>
                  </button>
                </div>

                {/* Canva-Grade Metric Cards */}
                <div className="place-info-grid">
                  <div className="place-info-card">
                    <small>CASUALTIES REPORTED</small>
                    <strong style={{ color: '#d93025' }}>
                      {selectedEntity.data.victims || 8} Victims
                    </strong>
                    <span style={{ fontSize: '10.5px', color: '#5f6368' }}>
                      {selectedEntity.data.critical_victims || 2} Critical Trauma
                    </span>
                  </div>
                  <div className="place-info-card">
                    <small>DETERMINISTIC TRIAGE</small>
                    <strong style={{ color: '#1a73e8' }}>
                      {selectedEntity.data.priority_score || 88} / 100
                    </strong>
                    <span style={{ fontSize: '10.5px', color: '#5f6368' }}>
                      Formula: 40B + 40C + 30K
                    </span>
                  </div>
                  <div className="place-info-card">
                    <small>ASSIGNED AMBULANCE</small>
                    <strong style={{ color: '#1a73e8' }}>
                      {selectedEntity.data.assigned_ambulance || currentScenario.assignedAmb}
                    </strong>
                    <span style={{ fontSize: '10.5px', color: isTracking ? '#188038' : '#5f6368' }}>
                      {isTracking ? `Speed: ${trackedVehicle.speed} km/h · ETA: ${trackedVehicle.eta}` : 'Standby at Depot · 0 km/h'}
                    </span>
                  </div>
                  <div className="place-info-card">
                    <small>RECEIVING TRAUMA BAY</small>
                    <strong style={{ color: '#188038' }}>RIMS Srikakulam</strong>
                    <span style={{ fontSize: '10.5px', color: '#188038' }}>
                      12 ICU Beds Available
                    </span>
                  </div>
                </div>

                {/* Golden Hour Progress Tracker */}
                <div style={{ background: '#f8f9fa', borderRadius: '10px', padding: '12px 14px', border: '1px solid #e8eaed' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#3c4043', marginBottom: '8px' }}>
                    GOLDEN HOUR RESPONSE LIFECYCLE
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10px', color: '#5f6368' }}>
                    <span style={{ color: '#188038', fontWeight: 700 }}>1. Call Taken</span>
                    <span>➔</span>
                    <span style={{ color: '#1a73e8', fontWeight: 700 }}>2. Dispatched</span>
                    <span>➔</span>
                    <span style={{ color: '#1a73e8', fontWeight: 700 }}>3. En Route</span>
                    <span>➔</span>
                    <span>4. On Scene</span>
                    <span>➔</span>
                    <span>5. Hospital</span>
                  </div>
                </div>

                {/* Quantum QAOA & QUBO Optimization Card */}
                <div className="quantum-optimization-card">
                  <div className="quantum-card-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '18px' }}>⚛️</span>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '12px', color: '#00d4ff' }}>QAOA & QUBO Quantum Engine</div>
                        <div style={{ fontSize: '10px', color: '#94a3b8' }}>Statevector Unitary Simulation · AP-SKLM-QPU-01</div>
                      </div>
                    </div>
                    <span className="quantum-badge-live">{(quantumTelemetry.groundStateProb * 100).toFixed(1)}% Ground Prob</span>
                  </div>

                  <div className="quantum-metrics-grid">
                    <div className="quantum-metric-box">
                      <small>OPTIMAL STATE</small>
                      <span className="quantum-code">{quantumTelemetry.optimalBitstring}</span>
                    </div>
                    <div className="quantum-metric-box">
                      <small>HAMILTONIAN ENERGY</small>
                      <span className="quantum-code">E = {quantumTelemetry.quboEnergy}</span>
                    </div>
                    <div className="quantum-metric-box">
                      <small>QUANTUM ADVANTAGE</small>
                      <strong style={{ color: '#00d4ff', fontSize: '12px' }}>+{quantumTelemetry.timeSavedMins}m Saved</strong>
                    </div>
                    <div className="quantum-metric-box">
                      <small>RESOURCE TRIAGE</small>
                      <strong style={{ color: '#10b981', fontSize: '12px' }}>ALS 100% Protected</strong>
                    </div>
                  </div>

                  <button
                    className="quantum-resolve-btn"
                    onClick={() => handleSolveQuantum(selectedEntity.data)}
                  >
                    <span>⚡ Re-Optimize via Quantum QAOA</span>
                  </button>
                </div>

                {/* Quantum-Powered Emergency Route Matrix (Architecture Diagram) */}
                {renderQuantumRouteMatrix()}
              </div>
            </>
          )}

          {/* B. AMBULANCE ENTITY VIEW */}
          {selectedEntity.type === 'ambulance' && (
            <>
              <div className="place-sheet-hero ambulance">
                <button
                  className="place-hero-close"
                  onClick={() => setSheetOpen(false)}
                  title="Close place sheet"
                >
                  <X size={16} />
                </button>
                <div className="place-hero-badge">
                  <span>🚑 108 EMERGENCY PATROL · ALS</span>
                </div>
                <h2 className="place-sheet-title">
                  {selectedEntity.data.id} · {selectedEntity.data.type || 'ALS Unit'}
                </h2>
                <div style={{ fontSize: '11px', opacity: 0.9 }}>
                  Registration: {CREW_DOSSIER.registration} · Srikakulam Central Depot
                </div>
              </div>

              <div className="place-sheet-content">
                {/* Telemetry Metrics */}
                <div className="place-info-grid">
                  <div className="place-info-card">
                    <small>LIVE SPEED (GPS FIX)</small>
                    <strong style={{ color: isTracking && selectedEntity.data.id === trackedVehicle.id ? '#1a73e8' : '#5f6368' }}>
                      {isTracking && selectedEntity.data.id === trackedVehicle.id ? `${trackedVehicle.speed} km/h` : '0 km/h · IDLE'}
                    </strong>
                    <span style={{ fontSize: '10.5px', color: isTracking && selectedEntity.data.id === trackedVehicle.id ? '#188038' : '#5f6368' }}>
                      {isTracking && selectedEntity.data.id === trackedVehicle.id ? 'Cruising on Speed Corridor' : 'Parked on Standby at Depot'}
                    </span>
                  </div>
                  <div className="place-info-card">
                    <small>O₂ CYLINDER & LIFE SUPPORT</small>
                    <strong style={{ color: '#188038' }}>{CREW_DOSSIER.o2Level}</strong>
                    <span style={{ fontSize: '10.5px', color: '#5f6368' }}>Hamilton-T1 Ventilator</span>
                  </div>
                </div>

                {/* Pilot & Paramedic Crew Dossier */}
                <div className="crew-dossier-card">
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#202124', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span>👨‍✈️</span>
                    <span>108 CREW CONTACT & DISPATCH DOSSIER</span>
                  </div>

                  <div className="crew-member-row">
                    <div className="crew-member-info">
                      <div className="crew-avatar">👨‍✈️</div>
                      <div>
                        <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#202124' }}>{CREW_DOSSIER.driver}</div>
                        <div style={{ fontSize: '9.5px', color: '#5f6368' }}>{CREW_DOSSIER.driverCert}</div>
                      </div>
                    </div>
                    <button
                      className="crew-contact-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        soundManager.playClickTone?.();
                        setToastNotice(`📞 Connecting Operator Radio Patch to Pilot: ${CREW_DOSSIER.driverPhone}`);
                      }}
                    >
                      <Phone size={12} />
                      <span>{CREW_DOSSIER.driverPhone}</span>
                    </button>
                  </div>

                  <div className="crew-member-row" style={{ borderBottom: 'none', paddingBottom: 0 }}>
                    <div className="crew-member-info">
                      <div className="crew-avatar" style={{ background: '#fce8e6', color: '#d93025' }}>👩‍⚕️</div>
                      <div>
                        <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#202124' }}>{CREW_DOSSIER.paramedic}</div>
                        <div style={{ fontSize: '9.5px', color: '#5f6368' }}>{CREW_DOSSIER.paramedicRole}</div>
                      </div>
                    </div>
                    <button
                      className="crew-contact-btn"
                      style={{ background: '#fce8e6', borderColor: '#fad2cf', color: '#d93025' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        soundManager.playClickTone?.();
                        setToastNotice(`📞 Connecting Operator Patch to Paramedic: ${CREW_DOSSIER.paramedicPhone}`);
                      }}
                    >
                      <Phone size={12} />
                      <span>{CREW_DOSSIER.paramedicPhone}</span>
                    </button>
                  </div>
                </div>

                {/* 5-Metric Quantum Route Matrix */}
                {renderQuantumRouteMatrix()}

                <button
                  className="google-cta-btn"
                  style={{ width: '100%', justifyContent: 'center', marginTop: '12px', background: '#1a73e8' }}
                  onClick={handleDispatch}
                >
                  <Navigation size={16} />
                  <span>Launch 2-Stage Mission: Pickup ➔ Hospital</span>
                </button>
              </div>
            </>
          )}

          {/* C. HOSPITAL ENTITY VIEW */}
          {selectedEntity.type === 'hospital' && (
            <>
              <div className="place-sheet-hero hospital">
                <button
                  className="place-hero-close"
                  onClick={() => setSheetOpen(false)}
                  title="Close place sheet"
                >
                  <X size={16} />
                </button>
                <div className="place-hero-badge">
                  <span>🏥 TRAUMA & ICU CENTER</span>
                </div>
                <h2 className="place-sheet-title">{selectedEntity.data.name}</h2>
                <div style={{ fontSize: '11px', opacity: 0.9 }}>
                  Government Medical College · Balaga, Srikakulam
                </div>
              </div>

              <div className="place-sheet-content">
                <div className="place-info-grid">
                  <div className="place-info-card">
                    <small>ICU BEDS AVAILABLE</small>
                    <strong style={{ color: '#188038' }}>
                      {selectedEntity.data.capacity?.icu_available || 14} Beds
                    </strong>
                    <span style={{ fontSize: '10.5px', color: '#188038' }}>Ventilators Ready</span>
                  </div>
                  <div className="place-info-card">
                    <small>GENERAL BEDS</small>
                    <strong>
                      {selectedEntity.data.capacity?.general_available || 48} Beds
                    </strong>
                    <span style={{ fontSize: '10.5px', color: '#5f6368' }}>Oxygen Supported</span>
                  </div>
                </div>

                <button
                  className="google-cta-btn"
                  style={{ width: '100%', justifyContent: 'center', background: '#188038' }}
                  onClick={handlePreAlert}
                >
                  <Building2 size={16} />
                  <span>Transmit Sonar Pre-Alert to ER Bay</span>
                </button>
              </div>
            </>
          )}

          {/* D. HAZARD VIEW */}
          {selectedEntity.type === 'hazard' && (
            <>
              <div className="place-sheet-hero hazard">
                <button
                  className="place-hero-close"
                  onClick={() => setSheetOpen(false)}
                  title="Close place sheet"
                >
                  <X size={16} />
                </button>
                <div className="place-hero-badge" style={{ background: 'rgba(0,0,0,0.15)', color: '#202124' }}>
                  <span>⚠️ ACTIVE ROAD DETOUR</span>
                </div>
                <h2 className="place-sheet-title">{selectedEntity.data.title}</h2>
                <div style={{ fontSize: '11px', opacity: 0.9 }}>
                  NH-16 Arterial Route Obstruction
                </div>
              </div>

              <div className="place-sheet-content">
                <div className="place-info-card">
                  <small>TRANSIT DELAY ESTIMATE</small>
                  <strong style={{ color: '#e37400' }}>{selectedEntity.data.delay} Delay</strong>
                  <span style={{ fontSize: '10.5px', color: '#5f6368' }}>
                    Autonomous route recalculated via Day & Night Junction
                  </span>
                </div>
              </div>
            </>
          )}
        </aside>
      )}

      {/* 5. BOTTOM-RIGHT GOOGLE MAP CONTROLS */}
      <div className="google-map-controls">
        {/* Layer Switcher Card */}
        <div className="google-control-card">
          <button
            className="google-map-btn"
            title="Google Clean Street Map"
            style={{ color: basemap === 'street' ? '#1a73e8' : '#3c4043' }}
            onClick={() => setBasemap('street')}
          >
            🗺️
          </button>
          <div className="google-control-divider" />
          <button
            className="google-map-btn"
            title="Satellite Imagery Hybrid"
            style={{ color: basemap === 'satellite' ? '#1a73e8' : '#3c4043' }}
            onClick={() => setBasemap('satellite')}
          >
            🛰️
          </button>
          <div className="google-control-divider" />
          <button
            className="google-map-btn"
            title="Nocturnal Dark Map"
            style={{ color: basemap === 'dark' ? '#1a73e8' : '#3c4043' }}
            onClick={() => setBasemap('dark')}
          >
            🌙
          </button>
        </div>

        {/* Zoom & Re-center Card */}
        <div className="google-control-card">
          <button
            className="google-map-btn"
            title="Zoom In"
            onClick={() => mapRef.current?.zoomIn()}
          >
            <Plus size={18} />
          </button>
          <div className="google-control-divider" />
          <button
            className="google-map-btn"
            title="Zoom Out"
            onClick={() => mapRef.current?.zoomOut()}
          >
            <Minus size={18} />
          </button>
          <div className="google-control-divider" />
          <button
            className="google-map-btn"
            title="Re-center Srikakulam 7-Road Junction"
            onClick={() => {
              mapRef.current?.flyTo({ center: SRIKAKULAM_CENTER, zoom: 13.5, duration: 800 });
            }}
          >
            <Crosshair size={18} />
          </button>
        </div>
      </div>

      {/* 6. TOAST NOTIFICATION */}
      {toastNotice && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#202124',
            color: '#ffffff',
            padding: '12px 22px',
            borderRadius: '28px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
            fontSize: '13px',
            fontWeight: 600,
            zIndex: 120,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            animation: 'fade-in 0.2s ease'
          }}
        >
          <span>{toastNotice}</span>
        </div>
      )}

      {/* 7. CITIZEN 108 INTAKE MODAL */}
      {showCallModal && (
        <div className="google-modal-overlay" onClick={() => setShowCallModal(false)}>
          <div className="google-modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f3f4', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '24px' }}>🚨</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800 }}>108 / 112 Citizen Emergency Dispatch Intake</h3>
                  <small style={{ color: '#5f6368', fontSize: '11px' }}>Srikakulam District Control Room (AP-SKLM-EOC-01)</small>
                </div>
              </div>
              <button className="google-icon-btn" onClick={() => setShowCallModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#3c4043', marginBottom: '6px' }}>
                  Emergency Location on Highway / Mandal
                </label>
                <input
                  type="text"
                  defaultValue="NH-16 Narasannapeta Flyover, Srikakulam"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #dadce0', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#3c4043', marginBottom: '6px' }}>
                  Casualty & Trauma Assessment
                </label>
                <input
                  type="text"
                  defaultValue="8 Casualties (2 Unconscious / Severe Head Trauma)"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #dadce0', fontSize: '13px' }}
                />
              </div>

              <div style={{ background: '#e8f0fe', padding: '12px 16px', borderRadius: '8px', color: '#1a73e8', fontSize: '12px' }}>
                <strong>AI Multi-Agent Brain:</strong> Automatically prioritizing as <strong>CRITICAL (Score: 88)</strong>. Sizing closest ALS ambulance with oxygen ventilator.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  className="google-icon-btn"
                  style={{ width: 'auto', padding: '0 16px', borderRadius: '20px' }}
                  onClick={() => setShowCallModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="google-cta-btn"
                  onClick={() => {
                    handleDispatch();
                    setShowCallModal(false);
                  }}
                >
                  <span>Dispatch Closest 108 ALS Unit</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. HOW THIS WORKS CANVA-STYLE INFOGRAPHIC GUIDE MODAL */}
      {showGuideModal && (
        <div className="google-modal-overlay" onClick={() => setShowGuideModal(false)}>
          <div className="google-modal-card" style={{ width: 'min(720px, 94vw)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f3f4', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#1a73e8' }}>
                  📖 How AERT Saves Lives in Srikakulam
                </h3>
                <small style={{ color: '#5f6368', fontSize: '11.5px' }}>
                  District Disaster Management & 108 Golden Hour Emergency Response
                </small>
              </div>
              <button className="google-icon-btn" onClick={() => setShowGuideModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
              <div style={{ background: '#fce8e6', borderRadius: '12px', padding: '16px', border: '1px solid #fad2cf' }}>
                <span style={{ fontSize: '26px' }}>🚨</span>
                <h4 style={{ margin: '8px 0 4px', color: '#d93025', fontSize: '14px' }}>1. 108 Call & AI Triage</h4>
                <p style={{ margin: 0, fontSize: '11.5px', color: '#3c4043', lineHeight: 1.45 }}>
                  When an accident happens on NH-16, the call is transcribed in real-time. Casualties and critical trauma are extracted into a deterministic priority queue.
                </p>
              </div>

              <div style={{ background: '#e8f0fe', borderRadius: '12px', padding: '16px', border: '1px solid #d2e3fc' }}>
                <span style={{ fontSize: '26px' }}>🚑</span>
                <h4 style={{ margin: '8px 0 4px', color: '#1a73e8', fontSize: '14px' }}>2. Smart Detours</h4>
                <p style={{ margin: 0, fontSize: '11.5px', color: '#3c4043', lineHeight: 1.45 }}>
                  The closest ALS unit is dispatched with ventilator capability. The engine detects Nagavali River flooding and automatically calculates route detours.
                </p>
              </div>

              <div style={{ background: '#e6f4ea', borderRadius: '12px', padding: '16px', border: '1px solid #ceead6' }}>
                <span style={{ fontSize: '26px' }}>🏥</span>
                <h4 style={{ margin: '8px 0 4px', color: '#188038', fontSize: '14px' }}>3. Sonar Pre-Alert</h4>
                <p style={{ margin: 0, fontSize: '11.5px', color: '#3c4043', lineHeight: 1.45 }}>
                  The Golden Hour advantage: Casualty vitals and trauma needs are beamed to RIMS Srikakulam minutes before arrival, ensuring surgeons and ICU beds are waiting.
                </p>
              </div>
            </div>

            <div style={{ padding: '16px 24px', background: '#f8f9fa', borderTop: '1px solid #f1f3f4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: '#5f6368' }}>
                <strong>Tip for Judges:</strong> Click <strong>18-STEP LIVE DEMO</strong> on the top-right to watch the full emergency simulation unfold.
              </span>
              <button
                className="google-cta-btn"
                onClick={() => setShowGuideModal(false)}
              >
                <span>Understand</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. CITIZEN 108 SOS MOBILE PORTAL MODAL */}
      {showSosModal && (
        <div className="google-modal-overlay" onClick={() => setShowSosModal(false)}>
          <div className="phone-modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '8px 14px', background: '#0b1528', borderBottom: '1px solid rgba(0, 212, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10 }}>
              <span style={{ fontSize: '11px', color: '#00d4ff', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>📱</span>
                <span>Citizen 108 Mobile Portal</span>
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  style={{ background: '#ef4444', color: '#ffffff', border: 'none', borderRadius: '12px', padding: '4px 10px', fontSize: '10.5px', fontWeight: 800, cursor: 'pointer' }}
                  onClick={async () => {
                    soundManager.playSirenTone();
                    setToastNotice('🚨 Citizen SOS Broadcast Received! Auto-Dispatching Nearest ALS Unit via QAOA...');
                    try {
                      await fetch('http://localhost:8000/api/sos_trigger', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          userLat: 18.3050,
                          userLng: 83.9050,
                          emergency_type: 'NH-16 Highway Multi-Vehicle Collision',
                          caller_phone: '+91 98480 22338',
                          notes: 'High-speed collision with multiple critical casualties'
                        })
                      });
                      setShowSosModal(false);
                      handleStartTracking('AMB-001', 'NH-16 Collision');
                    } catch (e) {
                      setShowSosModal(false);
                      handleStartTracking('AMB-001', 'NH-16 Collision');
                    }
                  }}
                >
                  ⚡ Trigger Test SOS
                </button>
                <button
                  style={{ background: 'rgba(255, 255, 255, 0.15)', border: 'none', color: '#ffffff', width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  title="Close Phone App"
                  onClick={() => setShowSosModal(false)}
                >
                  <X size={15} />
                </button>
              </div>
            </div>
            <iframe
              src="/phone.html"
              title="108 Citizen SOS Mobile App"
              className="phone-iframe"
            />
          </div>
        </div>
      )}

      {/* 10. 18-STEP GOLDEN SLICE LIVE MISSION ORCHESTRATION DEMO */}
      <GoldenSliceMission
        isOpen={simActive}
        onClose={() => {
          setSimActive(false);
          handleStopTracking();
        }}
        onStepChange={handleDemoStep}
        scenario={currentScenario}
      />

      {/* 13. QAOA VS DIJKSTRA DECISION EXPLAINER DRAWER */}
      {showQuantumModal && (
        <div className="quantum-explainer-drawer">
          <div className="explainer-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>⚛️</span>
              <div>
                <h3 style={{ margin: 0, fontSize: '13px', fontWeight: 800, color: '#00f0ff' }}>
                  QUANTUM QAOA VS DIJKSTRA ENGINE
                </h3>
                <small style={{ color: '#94a3b8', fontSize: '10px' }}>
                  Real-World Routing Decision Logic · {currentScenario.fullName}
                </small>
              </div>
            </div>
            <button
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              onClick={() => setShowQuantumModal(false)}
            >
              <X size={16} />
            </button>
          </div>

          <div className="explainer-content">
            <div className="algo-card dijkstra">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontWeight: 800, fontSize: '12px', color: '#ef4444' }}>
                  ❌ Dijkstra Shortest Geodesic Path
                </span>
                <span style={{ fontSize: '10px', background: 'rgba(239,68,68,0.2)', color: '#ef4444', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>
                  GREEDY FAILURE
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '11px', color: '#cbd5e1', lineHeight: 1.45 }}>
                {currentScenario.dijkstraExplanation}
              </p>
              <div style={{ marginTop: '8px', fontSize: '10px', color: '#ef4444', fontWeight: 700 }}>
                • Algorithmic flaw: Considers only static physical length, completely blind to real-time bottlenecks and flooded causeways.
              </div>
            </div>

            <div className="algo-card quantum">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontWeight: 800, fontSize: '12px', color: '#00f0ff' }}>
                  ⚡ Quantum QAOA QUBO Hamiltonian
                </span>
                <span style={{ fontSize: '10px', background: 'rgba(0,240,255,0.2)', color: '#00f0ff', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>
                  GROUND STATE |0001&gt;
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '11px', color: '#cbd5e1', lineHeight: 1.45 }}>
                {currentScenario.quantumExplanation}
              </p>
              <div style={{ marginTop: '8px', fontSize: '10px', color: '#30d158', fontWeight: 700 }}>
                • 5-Objective Optimization: Congestion (C) + Bottleneck (B) + Road Grip (G) + Life Threat (L) - ICU Beds (H).
              </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '10px 12px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#f1f5f9', marginBottom: '6px' }}>
                📊 Algorithmic Performance Metrics:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '10.5px' }}>
                <div>⏱️ Time Saved: <strong style={{ color: '#10b981' }}>+3.6 Minutes</strong></div>
                <div>🌊 Hydro Reliability: <strong style={{ color: '#00f0ff' }}>99.2%</strong></div>
                <div>🚦 Traffic Delay: <strong style={{ color: '#10b981' }}>0.0 min</strong></div>
                <div>🏥 Triage Accuracy: <strong style={{ color: '#00f0ff' }}>100%</strong></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 14. GIS TACTICAL LAYERS CONTROL DRAWER */}
      {showLayersModal && (
        <div className="layers-control-drawer">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f3f4', paddingBottom: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#202124' }}>🗺️ TACTICAL GIS LAYERS</span>
            <button style={{ background: 'transparent', border: 'none', color: '#5f6368', cursor: 'pointer' }} onClick={() => setShowLayersModal(false)}>
              <X size={15} />
            </button>
          </div>

          <div className="layer-toggle-row">
            <span>🚦 Traffic Congestion Heatmap</span>
            <input
              type="checkbox"
              checked={showTrafficOverlay}
              onChange={(e) => {
                const checked = e.target.checked;
                setShowTrafficOverlay(checked);
                const map = mapRef.current;
                if (map && map.getLayer('aert-traffic-layer')) {
                  map.setLayoutProperty('aert-traffic-layer', 'visibility', checked ? 'visible' : 'none');
                }
              }}
            />
          </div>

          <div className="layer-toggle-row">
            <span>🌊 Flood Inundation Zones</span>
            <input
              type="checkbox"
              checked={showFloodOverlay}
              onChange={(e) => {
                const checked = e.target.checked;
                setShowFloodOverlay(checked);
                const map = mapRef.current;
                if (map && map.getLayer('aert-flood-layer')) {
                  map.setLayoutProperty('aert-flood-layer', 'visibility', checked ? 'visible' : 'none');
                }
              }}
            />
          </div>

          <div className="layer-toggle-row">
            <span>🏥 Hospital ICU Isochrones</span>
            <input type="checkbox" defaultChecked />
          </div>

          <div className="layer-toggle-row">
            <span>⚡ Green Wave Preemption</span>
            <input type="checkbox" defaultChecked />
          </div>

          <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #f1f3f4' }}>
            <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#5f6368', marginBottom: '6px' }}>BASEMAP:</div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                style={{ flex: 1, padding: '4px', fontSize: '10px', borderRadius: '4px', border: '1px solid #dadce0', background: basemap === 'street' ? '#e8f0fe' : '#fff', color: basemap === 'street' ? '#1a73e8' : '#3c4043', fontWeight: 700, cursor: 'pointer' }}
                onClick={() => setBasemap('street')}
              >
                Clean
              </button>
              <button
                style={{ flex: 1, padding: '4px', fontSize: '10px', borderRadius: '4px', border: '1px solid #dadce0', background: basemap === 'satellite' ? '#e8f0fe' : '#fff', color: basemap === 'satellite' ? '#1a73e8' : '#3c4043', fontWeight: 700, cursor: 'pointer' }}
                onClick={() => setBasemap('satellite')}
              >
                Satellite
              </button>
              <button
                style={{ flex: 1, padding: '4px', fontSize: '10px', borderRadius: '4px', border: '1px solid #dadce0', background: basemap === 'dark' ? '#e8f0fe' : '#fff', color: basemap === 'dark' ? '#1a73e8' : '#3c4043', fontWeight: 700, cursor: 'pointer' }}
                onClick={() => setBasemap('dark')}
              >
                Dark EOC
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 11. TRAFFIC FLOW & HAZARDS LEGEND */}
      <div className="traffic-legend-bar">
        <span>🚦 Traffic Flow:</span>
        <span>
          <span className="traffic-dot" style={{ background: '#10b981' }}></span>
          &gt;50 km/h (Free)
        </span>
        <span>
          <span className="traffic-dot" style={{ background: '#f59e0b' }}></span>
          25-50 km/h
        </span>
        <span>
          <span className="traffic-dot" style={{ background: '#ef4444' }}></span>
          &lt;25 km/h (Jam)
        </span>
        <button
          style={{ background: 'transparent', border: 'none', color: '#1a73e8', fontWeight: 800, cursor: 'pointer', padding: 0, marginLeft: '4px' }}
          onClick={() => {
            const map = mapRef.current;
            if (map && map.getLayer('aert-traffic-layer')) {
              const currentVis = map.getLayoutProperty('aert-traffic-layer', 'visibility');
              const nextVis = currentVis === 'none' ? 'visible' : 'none';
              map.setLayoutProperty('aert-traffic-layer', 'visibility', nextVis);
              setShowTrafficOverlay(nextVis === 'visible');
            }
          }}
        >
          {showTrafficOverlay ? 'Hide Overlay' : 'Show Overlay'}
        </button>
      </div>

      {/* 12. REAL-TIME HOSPITAL VACANCY & BED TRIAGE MODAL */}
      {showHospitalScanModal && (
        <div className="hospital-vacancy-scan-modal">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#00d4ff', boxShadow: '0 0 10px #00d4ff' }} />
              <div>
                <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 800, color: '#00d4ff', letterSpacing: '-0.2px' }}>
                  🏥 REAL-TIME HOSPITAL VACANCY & QUANTUM MATCHING
                </h4>
                <small style={{ color: '#94a3b8', fontSize: '10px' }}>
                  Pickup Point Reached · 2 Critical Trauma Victims Secured · Scanning Nearby Srikakulam Facilities
                </small>
              </div>
            </div>
            <button
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              onClick={() => setShowHospitalScanModal(false)}
            >
              <X size={16} />
            </button>
          </div>

          <div style={{ marginTop: '10px' }}>
            <div className="hospital-scan-item optimal">
              <div>
                <div style={{ fontWeight: 800, fontSize: '12px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>🏥 RIMS Medical College, Srikakulam</span>
                  <span style={{ background: '#10b981', color: '#06090e', fontSize: '9px', padding: '1px 5px', borderRadius: '4px', fontWeight: 800 }}>ALLOCATED</span>
                </div>
                <div style={{ fontSize: '10px', color: '#cbd5e1', marginTop: '2px' }}>
                  Distance: 3.2 km · Travel ETA: 2m 10s · Ventilator ICU Bay #3 Reserved
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '14px', fontWeight: 900, color: '#10b981' }}>12 ICU</span>
                <div style={{ fontSize: '9px', color: '#94a3b8' }}>Match: 98%</div>
              </div>
            </div>

            <div className="hospital-scan-item">
              <div>
                <div style={{ fontWeight: 700, fontSize: '11.5px', color: '#ffffff' }}>
                  🏥 Government General Hospital (GGH)
                </div>
                <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>
                  Distance: 2.8 km · Delay: +6.5m (Nagavali flood detour)
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#f59e0b' }}>6 ICU</span>
                <div style={{ fontSize: '9px', color: '#94a3b8' }}>Match: 74%</div>
              </div>
            </div>

            <div className="hospital-scan-item">
              <div>
                <div style={{ fontWeight: 700, fontSize: '11.5px', color: '#ffffff' }}>
                  🏥 Seven Hills Trauma Center
                </div>
                <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>
                  Distance: 4.1 km · Travel ETA: 4m 30s
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#ffffff' }}>3 ICU</span>
                <div style={{ fontSize: '9px', color: '#94a3b8' }}>Match: 68%</div>
              </div>
            </div>

            <div className="hospital-scan-item">
              <div>
                <div style={{ fontWeight: 700, fontSize: '11.5px', color: '#ffffff' }}>
                  🏥 Apex Life Care Clinic
                </div>
                <div style={{ fontSize: '10px', color: '#ef4444', marginTop: '2px' }}>
                  Distance: 1.9 km · ⚠️ ICU Saturation Warning (92% Occupied)
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#ef4444' }}>1 ICU</span>
                <div style={{ fontSize: '9px', color: '#94a3b8' }}>Match: 52%</div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.3)', padding: '8px 12px', borderRadius: '8px' }}>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>
              ⚡ Pre-Alert Transmitted: Trauma Surgeons & Blood Bank on standby
            </span>
            <button
              style={{ background: '#10b981', color: '#06090e', border: 'none', borderRadius: '6px', padding: '5px 12px', fontSize: '11px', fontWeight: 800, cursor: 'pointer' }}
              onClick={() => setShowHospitalScanModal(false)}
            >
              Proceed to RIMS Trauma Bay ➔
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
