/**
 * AERT MAP LAB — Google Maps Platform Technology Spike
 * Sector: Srikakulam District, Andhra Pradesh, India (AP-SKLM-EOC-01)
 * 
 * Completely isolated evaluation prototype investigating Google Maps as a spatial foundation for AERT.
 * The primary AERT application remains 100% untouched.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  SRIKAKULAM_CENTER,
  MAP_LAB_INCIDENT,
  MAP_LAB_AMBULANCES,
  MAP_LAB_POLICE,
  MAP_LAB_FIRE,
  MAP_LAB_HOSPITALS,
  MAP_LAB_ROUTES,
  MAP_LAB_HAZARD
} from './mapLabSyntheticData';
import { DARK_OPERATIONAL_GOOGLE_MAP_STYLE } from './googleMapStyles';
import {
  Layers,
  Sparkles,
  Navigation,
  Building2,
  Ambulance,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Radio,
  Clock,
  Key,
  ExternalLink,
  Shield,
  Flame,
  ArrowRight,
  ChevronRight,
  Info
} from 'lucide-react';

export function MapLabWorkspace() {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const polylinesRef = useRef([]);
  const hazardPolygonRef = useRef(null);
  const animFrameRef = useRef(null);

  // API Key State (Environment variable or Session Storage)
  const [apiKey, setApiKey] = useState(
    () => import.meta.env.VITE_GOOGLE_MAPS_API_KEY || sessionStorage.getItem('AERT_GOOGLE_MAPS_KEY') || ''
  );
  const [inputKey, setInputKey] = useState('');
  const [mapId, setMapId] = useState(
    () => import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || sessionStorage.getItem('AERT_GOOGLE_MAPS_MAP_ID') || ''
  );

  // API & Map Status
  const [apiLoaded, setApiLoaded] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Workflow Demonstration State
  // 01 CALM | 02 INCIDENT | 03 AI | 04 DISPATCH | 05 MOVING | 06 HOSPITAL
  const [labState, setLabState] = useState('CALM');
  const [activeLayers, setActiveLayers] = useState({
    operational: true,
    fleet: true,
    incidents: true,
    hospitals: true,
    traffic: true,
    hazards: true,
    routes: true
  });
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [preAlertActive, setPreAlertActive] = useState(false);

  // Real-time animation of moving units along roads
  const [ambulancePositions, setAmbulancePositions] = useState(() =>
    MAP_LAB_AMBULANCES.map((amb) => ({ ...amb, currentPos: { ...amb.position }, progress: 0 }))
  );

  // -------------------------------------------------------------
  // 1. GOOGLE MAPS API SCRIPT LOADER
  // -------------------------------------------------------------
  useEffect(() => {
    if (!apiKey) {
      setApiLoaded(false);
      return;
    }

    if (window.google?.maps) {
      setApiLoaded(true);
      return;
    }

    const scriptId = 'aert-google-maps-script';
    const existingScript = document.getElementById(scriptId);
    if (existingScript) existingScript.remove();

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=beta&libraries=marker,geometry`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      setApiLoaded(true);
      setApiError(null);
    };

    script.onerror = () => {
      setApiError('Failed to load Google Maps JavaScript API script. Check network or API key restrictions.');
    };

    window.gm_authFailure = () => {
      setApiError('Google Maps Authentication Failed: Invalid API key or Maps JavaScript API not enabled.');
    };

    document.head.appendChild(script);

    return () => {
      window.gm_authFailure = null;
    };
  }, [apiKey]);

  // -------------------------------------------------------------
  // 2. INITIALIZE GOOGLE MAPS INSTANCE (Vector Map with tilt/rotation)
  // -------------------------------------------------------------
  useEffect(() => {
    if (!apiLoaded || !mapContainerRef.current || !window.google?.maps) return;

    try {
      const map = new window.google.maps.Map(mapContainerRef.current, {
        center: SRIKAKULAM_CENTER,
        zoom: 14,
        tilt: 35,
        heading: 15,
        mapId: mapId || undefined,
        styles: mapId ? undefined : DARK_OPERATIONAL_GOOGLE_MAP_STYLE,
        disableDefaultUI: true,
        zoomControl: true,
        backgroundColor: '#06090e'
      });

      mapInstanceRef.current = map;

      // Render Hazard Polygon (Flood zone along Nagavali River)
      if (activeLayers.hazards) {
        const hazard = new window.google.maps.Polygon({
          paths: MAP_LAB_HAZARD.polygon,
          strokeColor: '#00f0ff',
          strokeOpacity: 0.8,
          strokeWeight: 1.5,
          fillColor: '#0077ff',
          fillOpacity: 0.14,
          map: map
        });
        hazardPolygonRef.current = hazard;
      }

      renderEntities(map);
    } catch (err) {
      setApiError(err.message || 'Error initializing Google Map');
    }
  }, [apiLoaded]);

  // -------------------------------------------------------------
  // 3. VEHICLE ANIMATION TICKER (Dynamic road movement)
  // -------------------------------------------------------------
  useEffect(() => {
    let startTime = performance.now();
    const routeAPath = MAP_LAB_ROUTES[0].path;

    const animateLoop = (now) => {
      const elapsed = (now - startTime) / 1000;

      setAmbulancePositions((prevUnits) =>
        prevUnits.map((amb) => {
          // Unit ALS-003 moves dynamically along Route A when in MOVING/DISPATCH state
          if ((labState === 'DISPATCH' || labState === 'MOVING') && amb.id === 'ALS-003') {
            const speed = 0.08; // loop speed
            const t = (elapsed * speed) % 1.0;
            const segmentCount = routeAPath.length - 1;
            const segIndex = Math.min(Math.floor(t * segmentCount), segmentCount - 1);
            const segFraction = (t * segmentCount) - segIndex;

            const p1 = routeAPath[segIndex];
            const p2 = routeAPath[segIndex + 1];

            const curLat = p1.lat + (p2.lat - p1.lat) * segFraction;
            const curLng = p1.lng + (p2.lng - p1.lng) * segFraction;

            return {
              ...amb,
              currentPos: { lat: curLat, lng: curLng },
              status: 'EN_ROUTE',
              speed_kmh: 58
            };
          }

          // Unit ALS-004 patrols on NH-16
          if (amb.id === 'ALS-004') {
            const osc = Math.sin(elapsed * 0.4) * 0.005;
            return {
              ...amb,
              currentPos: { lat: amb.position.lat + osc, lng: amb.position.lng + osc * 0.5 },
              status: 'EN_ROUTE',
              speed_kmh: 62
            };
          }

          // Unit BLS-003 approaches from north
          if (amb.id === 'BLS-003') {
            const osc2 = Math.cos(elapsed * 0.3) * 0.004;
            return {
              ...amb,
              currentPos: { lat: amb.position.lat + osc2, lng: amb.position.lng + osc2 * 0.8 },
              speed_kmh: 52
            };
          }

          return amb;
        })
      );

      animFrameRef.current = requestAnimationFrame(animateLoop);
    };

    animFrameRef.current = requestAnimationFrame(animateLoop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [labState]);

  // -------------------------------------------------------------
  // 4. RENDER CUSTOM AERT ADVANCED MARKERS & CANDIDATE ROUTES
  // -------------------------------------------------------------
  const renderEntities = (map) => {
    if (!window.google?.maps || !map) return;

    // Clear previous markers
    markersRef.current.forEach((m) => m.setMap && m.setMap(null));
    markersRef.current = [];

    // Clear previous polylines
    polylinesRef.current.forEach((p) => p.setMap && p.setMap(null));
    polylinesRef.current = [];

    // A. Active Incident Beacon (NH-16 Collision)
    if (labState !== 'CALM' && activeLayers.incidents) {
      const incEl = document.createElement('div');
      incEl.innerHTML = `
        <div style="position: relative; width: 44px; height: 44px; cursor: pointer;">
          <div style="position: absolute; inset: 0; border-radius: 50%; background: rgba(255, 59, 48, 0.25); border: 2px dashed #ff3b30; animation: aert-beacon-pulse 1.6s infinite ease-out;"></div>
          <div style="position: absolute; top: 10px; left: 10px; width: 24px; height: 24px; border-radius: 50%; background: #06090e; border: 2px solid #ff3b30; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 16px #ff3b30;">
            <span style="color: #ff3b30; font-weight: 900; font-size: 13px;">!</span>
          </div>
          <div style="position: absolute; top: 38px; left: 50%; transform: translateX(-50%); background: rgba(8, 14, 23, 0.95); border: 1px solid #ff3b30; border-radius: 4px; padding: 1px 5px; white-space: nowrap;">
            <span style="color: #ff3b30; font-family: monospace; font-size: 8.5px; font-weight: 800;">P1 CRITICAL</span>
          </div>
        </div>
      `;

      if (window.google.maps.marker?.AdvancedMarkerElement && mapId) {
        const marker = new window.google.maps.marker.AdvancedMarkerElement({
          map,
          position: MAP_LAB_INCIDENT.position,
          content: incEl,
          title: MAP_LAB_INCIDENT.title
        });
        marker.addListener('click', () => setSelectedEntity({ type: 'incident', data: MAP_LAB_INCIDENT }));
        markersRef.current.push(marker);
      } else {
        const marker = new window.google.maps.Marker({
          map,
          position: MAP_LAB_INCIDENT.position,
          title: MAP_LAB_INCIDENT.title,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 9,
            fillColor: '#ff3b30',
            fillOpacity: 0.95,
            strokeColor: '#ffffff',
            strokeWeight: 2
          }
        });
        marker.addListener('click', () => setSelectedEntity({ type: 'incident', data: MAP_LAB_INCIDENT }));
        markersRef.current.push(marker);
      }
    }

    // B. Ambulances (8–12 response units with real-time status and custom forward arrows)
    if (activeLayers.fleet) {
      ambulancePositions.forEach((amb) => {
        const isOptimal = amb.id === 'ALS-003';
        const isSelected = selectedEntity?.data?.id === amb.id;

        const ambMarker = new window.google.maps.Marker({
          map,
          position: amb.currentPos || amb.position,
          title: `${amb.tier} ${amb.id} (${amb.status})`,
          icon: {
            path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: isOptimal ? 6 : 4.5,
            fillColor: isOptimal ? '#00f0ff' : amb.status === 'EN_ROUTE' ? '#30d158' : '#14b8a6',
            fillOpacity: 0.95,
            strokeColor: '#06090e',
            strokeWeight: 1.5,
            rotation: amb.heading
          }
        });

        ambMarker.addListener('click', () => setSelectedEntity({ type: 'ambulance', data: amb }));
        markersRef.current.push(ambMarker);
      });

      // Police Units (4 units)
      MAP_LAB_POLICE.forEach((pcr) => {
        const pcrMarker = new window.google.maps.Marker({
          map,
          position: pcr.position,
          title: `${pcr.name} (${pcr.status})`,
          icon: {
            path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 4,
            fillColor: '#0a84ff',
            fillOpacity: 0.9,
            strokeColor: '#06090e',
            strokeWeight: 1.5,
            rotation: 45
          }
        });
        pcrMarker.addListener('click', () => setSelectedEntity({ type: 'police', data: pcr }));
        markersRef.current.push(pcrMarker);
      });

      // Fire & Rescue Units (3 units)
      MAP_LAB_FIRE.forEach((fire) => {
        const fireMarker = new window.google.maps.Marker({
          map,
          position: fire.position,
          title: `${fire.name} (${fire.status})`,
          icon: {
            path: window.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
            scale: 4.5,
            fillColor: '#ff9500',
            fillOpacity: 0.95,
            strokeColor: '#06090e',
            strokeWeight: 1.5,
            rotation: 180
          }
        });
        fireMarker.addListener('click', () => setSelectedEntity({ type: 'fire', data: fire }));
        markersRef.current.push(fireMarker);
      });
    }

    // C. Hospitals (3 facilities: RIMS, Apex, Seven Hills)
    if (activeLayers.hospitals) {
      MAP_LAB_HOSPITALS.forEach((hos) => {
        const isRIMS = hos.id === 'HOS-RIMS';
        const isPreAlerted = preAlertActive && isRIMS;

        const hosMarker = new window.google.maps.Marker({
          map,
          position: hos.position,
          title: hos.name,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: isRIMS ? 8.5 : 6,
            fillColor: isPreAlerted ? '#30d158' : '#22c55e',
            fillOpacity: 0.95,
            strokeColor: isPreAlerted ? '#00f0ff' : '#06090e',
            strokeWeight: isPreAlerted ? 3 : 2
          }
        });

        hosMarker.addListener('click', () => setSelectedEntity({ type: 'hospital', data: hos }));
        markersRef.current.push(hosMarker);
      });
    }

    // D. Multi-Criteria Corridors / Routes (INCIDENT -> RESPONDER -> HOSPITAL)
    if (activeLayers.routes && (labState === 'AI' || labState === 'DISPATCH' || labState === 'MOVING' || labState === 'HOSPITAL')) {
      MAP_LAB_ROUTES.forEach((r) => {
        const isOptimal = r.id === 'ROUTE-A';
        // In dispatch/moving state, only show optimal route
        if ((labState === 'DISPATCH' || labState === 'MOVING' || labState === 'HOSPITAL') && !isOptimal) return;

        const line = new window.google.maps.Polyline({
          path: r.path,
          geodesic: true,
          strokeColor: isOptimal ? '#00f0ff' : r.color,
          strokeOpacity: isOptimal ? 0.95 : 0.45,
          strokeWeight: isOptimal ? 5 : 2.5,
          map: map
        });
        polylinesRef.current.push(line);
      });
    }
  };

  // Re-render markers when state changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      renderEntities(mapInstanceRef.current);
    }
  }, [labState, activeLayers, preAlertActive, ambulancePositions]);

  // Smooth Camera Animation
  const panToLocation = (pos, zoom = 14.5, tilt = 35) => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.panTo(pos);
    map.setZoom(zoom);
    if (typeof map.setTilt === 'function') map.setTilt(tilt);
  };

  const handleSaveKey = () => {
    if (!inputKey.trim()) return;
    sessionStorage.setItem('AERT_GOOGLE_MAPS_KEY', inputKey.trim());
    setApiKey(inputKey.trim());
    setApiError(null);
  };

  const toggleLayer = (layerKey) => {
    setActiveLayers((prev) => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#06090e', color: '#f2f5f8', fontFamily: 'Space Grotesk, sans-serif' }}>
      {/* ----------------------------------------------------------- */}
      {/* GOOGLE MAPS DOM CANVAS OR CONFIGURATION GATEWAY */}
      {/* ----------------------------------------------------------- */}
      {apiKey && !apiError ? (
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
      ) : (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(circle at center, #0a121c 0%, #06090e 100%)',
            padding: '24px'
          }}
        >
          <div
            style={{
              maxWidth: '560px',
              width: '100%',
              background: 'rgba(12, 18, 28, 0.95)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(0, 240, 255, 0.3)',
              borderRadius: '16px',
              padding: '28px',
              boxShadow: '0 24px 64px rgba(0, 0, 0, 0.9), 0 0 40px rgba(0, 240, 255, 0.15)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(0, 240, 255, 0.15)', border: '1px solid #00f0ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Key size={20} color="#00f0ff" />
              </div>
              <div>
                <h2 style={{ fontSize: '17px', fontWeight: 800, margin: 0, color: '#f2f5f8' }}>
                  AERT MAP LAB // GOOGLE MAPS SPIKE
                </h2>
                <span style={{ fontSize: '10.5px', fontFamily: 'JetBrains Mono, monospace', color: '#00f0ff' }}>
                  ISOLATED EVALUATION PROTOTYPE
                </span>
              </div>
            </div>

            <div style={{ background: 'rgba(255, 59, 48, 0.1)', border: '1px solid rgba(255, 59, 48, 0.3)', borderRadius: '10px', padding: '12px 14px', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ff3b30', fontWeight: 800, fontSize: '11px', marginBottom: '4px' }}>
                <AlertTriangle size={14} />
                <span>MISSING GOOGLE MAPS PLATFORM CONFIGURATION</span>
              </div>
              <p style={{ fontSize: '10.5px', color: '#e0e6ed', margin: 0, lineHeight: 1.4 }}>
                Google Maps JavaScript API credentials are not configured in this environment. In accordance with the project directives, AERT does not fake external APIs.
              </p>
            </div>

            <div style={{ fontSize: '11px', color: '#9aa8b8', lineHeight: 1.5, marginBottom: '18px' }}>
              To run the interactive Google Maps spike, provide a Google Cloud API Key with <strong>Maps JavaScript API</strong> enabled:
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <input
                type="text"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="Enter Google Maps API Key (AIzaSy...)"
                style={{
                  flex: 1,
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  color: '#f2f5f8',
                  fontSize: '11px',
                  fontFamily: 'JetBrains Mono, monospace',
                  outline: 'none'
                }}
              />
              <button
                onClick={handleSaveKey}
                style={{
                  background: '#00f0ff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 18px',
                  color: '#06090e',
                  fontSize: '11px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>ACTIVATE</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {apiError && (
              <div style={{ fontSize: '9.5px', color: '#ff3b30', fontFamily: 'JetBrains Mono, monospace', marginTop: '8px' }}>
                {apiError}
              </div>
            )}

            <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '14px', marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '9.5px', color: '#687787', fontFamily: 'JetBrains Mono, monospace' }}>
                SECTOR: SRIKAKULAM (AP-SKLM-EOC-01)
              </span>
              <a
                href="/"
                style={{ fontSize: '10.5px', color: '#00f0ff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <span>Return to Primary AERT Map</span>
                <ExternalLink size={11} />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------- */}
      {/* TOP LAB CONTROLS (Floating Command Strip) */}
      {/* ----------------------------------------------------------- */}
      <header
        style={{
          position: 'absolute',
          top: '16px',
          left: '20px',
          right: '20px',
          zIndex: 30,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pointerEvents: 'none'
        }}
      >
        <div
          style={{
            background: 'rgba(8, 14, 23, 0.88)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 240, 255, 0.35)',
            borderRadius: '12px',
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            pointerEvents: 'auto',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8)'
          }}
        >
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00f0ff', boxShadow: '0 0 10px #00f0ff' }} />
          <span style={{ fontSize: '12.5px', fontWeight: 800, letterSpacing: '0.04em', color: '#f2f5f8' }}>
            AERT <span style={{ color: '#00f0ff' }}>//</span> MAP LAB (GOOGLE MAPS VECTOR SPIKE)
          </span>
          <span style={{ fontSize: '9px', fontFamily: 'JetBrains Mono, monospace', background: 'rgba(0, 240, 255, 0.15)', color: '#00f0ff', padding: '2px 6px', borderRadius: '4px' }}>
            ISOLATED SPIKE
          </span>
        </div>

        {/* Multi-Layer Toggles */}
        <div
          style={{
            background: 'rgba(8, 14, 23, 0.88)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '4px 8px',
            display: 'flex',
            gap: '4px',
            pointerEvents: 'auto'
          }}
        >
          {[
            { id: 'operational', label: 'OPERATIONAL' },
            { id: 'fleet', label: 'FLEET' },
            { id: 'incidents', label: 'INCIDENTS' },
            { id: 'hospitals', label: 'HOSPITALS' },
            { id: 'hazards', label: 'HAZARDS' },
            { id: 'routes', label: 'ROUTES' }
          ].map((l) => (
            <button
              key={l.id}
              onClick={() => toggleLayer(l.id)}
              style={{
                background: activeLayers[l.id] ? 'rgba(0, 240, 255, 0.22)' : 'transparent',
                border: `1px solid ${activeLayers[l.id] ? '#00f0ff' : 'transparent'}`,
                borderRadius: '8px',
                padding: '4px 8px',
                color: activeLayers[l.id] ? '#00f0ff' : '#9aa8b8',
                fontSize: '9px',
                fontFamily: 'JetBrains Mono, monospace',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {l.label}
            </button>
          ))}
        </div>

        <a
          href="/"
          style={{
            background: 'rgba(8, 14, 23, 0.88)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '8px 14px',
            color: '#00f0ff',
            fontSize: '10px',
            fontFamily: 'JetBrains Mono, monospace',
            textDecoration: 'none',
            pointerEvents: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <span>AERT PRIMARY</span>
          <ExternalLink size={11} />
        </a>
      </header>

      {/* ----------------------------------------------------------- */}
      {/* FLOATING AERT AI SPATIAL INSTRUMENT */}
      {/* ----------------------------------------------------------- */}
      {(labState === 'AI' || labState === 'DISPATCH' || labState === 'MOVING') && (
        <div
          style={{
            position: 'absolute',
            top: '76px',
            left: '20px',
            zIndex: 30,
            width: '380px',
            background: 'rgba(12, 18, 28, 0.95)',
            backdropFilter: 'blur(24px)',
            border: '1.5px solid #00f0ff',
            borderRadius: '14px',
            padding: '16px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.9)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '8px', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={14} color="#00f0ff" />
              <span style={{ fontSize: '10.5px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 800, color: '#00f0ff' }}>
                AI SPATIAL REASONING
              </span>
            </div>
            <span style={{ fontSize: '9px', fontFamily: 'JetBrains Mono, monospace', color: '#30d158', fontWeight: 800 }}>
              94% CONCORDANCE
            </span>
          </div>

          <div style={{ fontSize: '11px', color: '#9aa8b8', marginBottom: '8px' }}>
            Command: <em>"Recommend fastest ALS unit to NH-16 collision"</em>
          </div>

          <div style={{ background: 'rgba(0, 240, 255, 0.1)', border: '1px solid rgba(0, 240, 255, 0.25)', borderRadius: '8px', padding: '8px 10px', marginBottom: '10px' }}>
            <div style={{ fontSize: '9px', fontFamily: 'JetBrains Mono, monospace', color: '#00f0ff', fontWeight: 800 }}>
              OPTIMAL DISPATCH CANDIDATE
            </div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#f2f5f8', marginTop: '2px' }}>
              ALS-003 <span style={{ color: '#00f0ff' }}>→</span> ROUTE A <span style={{ color: '#00f0ff' }}>→</span> RIMS MEDICAL
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '6px', fontSize: '9.5px', color: '#9aa8b8', fontFamily: 'JetBrains Mono, monospace' }}>
              <span>ETA: <strong style={{ color: '#00f0ff' }}>06:12</strong></span>
              <span>DIST: <strong>4.2 km</strong></span>
              <span>RISK: <strong style={{ color: '#30d158' }}>LOW</strong></span>
            </div>
          </div>

          <div style={{ fontSize: '9.5px', color: '#687787', lineHeight: 1.4, marginBottom: '12px' }}>
            Reasoning: NH-16 arterial path avoids GT Road evening congestion and clears Nagavali high-water flood buffer.
          </div>

          {labState === 'AI' ? (
            <button
              id="maplab-btn-dispatch-trigger"
              onClick={() => {
                setLabState('DISPATCH');
                panToLocation(MAP_LAB_INCIDENT.position, 14.5, 45);
              }}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #00f0ff, #0a84ff)',
                border: 'none',
                borderRadius: '8px',
                padding: '8px',
                color: '#06090e',
                fontSize: '10.5px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <Navigation size={13} />
              <span>AUTHORIZE DISPATCH</span>
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#30d158', fontSize: '10.5px', fontWeight: 800, fontFamily: 'JetBrains Mono, monospace' }}>
              <CheckCircle2 size={14} />
              <span>UNIT DISPATCHED &amp; EN ROUTE</span>
            </div>
          )}
        </div>
      )}

      {/* ----------------------------------------------------------- */}
      {/* HOSPITAL PRE-ALERT & TRAUMA NODE HUD */}
      {/* ----------------------------------------------------------- */}
      {(labState === 'HOSPITAL' || preAlertActive) && (
        <div
          style={{
            position: 'absolute',
            top: '76px',
            right: '20px',
            zIndex: 30,
            background: 'rgba(8, 14, 23, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1.5px solid #30d158',
            borderRadius: '12px',
            padding: '12px 16px',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <Building2 size={22} color="#30d158" />
          <div>
            <div style={{ fontSize: '10.5px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 800, color: '#30d158' }}>
              RIMS MEDICAL // PRE-ALERT ACTIVE
            </div>
            <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#f2f5f8', marginTop: '1px' }}>
              Level 1 Trauma Bay 1 Reserved • ETA 06:12
            </div>
            <div style={{ fontSize: '9.5px', color: '#9aa8b8', marginTop: '2px', fontFamily: 'JetBrains Mono, monospace' }}>
              ER: 8 Beds • ICU: 3 Beds • Blood Bank: A+/O+ Staged
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------- */}
      {/* CONTEXTUAL ENTITY INSPECTOR (Appears on click) */}
      {/* ----------------------------------------------------------- */}
      {selectedEntity && (
        <div
          style={{
            position: 'absolute',
            bottom: '80px',
            left: '20px',
            zIndex: 30,
            background: 'rgba(12, 18, 28, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 240, 255, 0.35)',
            borderRadius: '12px',
            padding: '14px 18px',
            maxWidth: '340px',
            boxShadow: '0 12px 36px rgba(0,0,0,0.85)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '9px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 800, color: '#00f0ff' }}>
              {selectedEntity.type.toUpperCase()} INSPECTOR
            </span>
            <button
              onClick={() => setSelectedEntity(null)}
              style={{ background: 'transparent', border: 'none', color: '#687787', cursor: 'pointer', fontSize: '12px' }}
            >
              ✕
            </button>
          </div>
          <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#f2f5f8', marginTop: '4px' }}>
            {selectedEntity.data.name || selectedEntity.data.title || selectedEntity.data.id}
          </div>
          <div style={{ fontSize: '10px', color: '#9aa8b8', marginTop: '4px', lineHeight: 1.4 }}>
            Status: <strong style={{ color: '#00f0ff' }}>{selectedEntity.data.status || selectedEntity.data.trauma_status || 'ACTIVE'}</strong>
            {selectedEntity.data.speed_kmh !== undefined && ` • Speed: ${selectedEntity.data.speed_kmh} km/h`}
            {selectedEntity.data.victims && ` • Victims: ${selectedEntity.data.victims}`}
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------- */}
      {/* WORKFLOW CONTROLLER DOCK (Bottom Center) */}
      {/* ----------------------------------------------------------- */}
      <nav
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 40,
          background: 'rgba(8, 14, 23, 0.88)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '32px',
          padding: '4px 10px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          boxShadow: '0 16px 48px rgba(0, 0, 0, 0.9)'
        }}
      >
        {[
          { id: 'CALM', label: '01 CALM', action: () => { setLabState('CALM'); panToLocation(SRIKAKULAM_CENTER, 14, 0); } },
          { id: 'INCIDENT', label: '02 INCIDENT', action: () => { setLabState('INCIDENT'); panToLocation(MAP_LAB_INCIDENT.position, 14.8, 30); } },
          { id: 'AI', label: '03 AI EVAL', action: () => { setLabState('AI'); panToLocation(MAP_LAB_INCIDENT.position, 14.5, 35); } },
          { id: 'DISPATCH', label: '04 DISPATCH', action: () => { setLabState('DISPATCH'); panToLocation(MAP_LAB_INCIDENT.position, 14.5, 45); } },
          { id: 'MOVING', label: '05 MOVING', action: () => { setLabState('MOVING'); panToLocation(MAP_LAB_INCIDENT.position, 15, 50); } },
          { id: 'HOSPITAL', label: '06 PRE-ALERT', action: () => { setLabState('HOSPITAL'); setPreAlertActive(true); panToLocation(MAP_LAB_HOSPITALS[0].position, 15.2, 40); } }
        ].map((st) => (
          <button
            key={st.id}
            id={`maplab-btn-${st.id.toLowerCase()}`}
            onClick={st.action}
            style={{
              background: labState === st.id ? 'rgba(0, 240, 255, 0.22)' : 'transparent',
              border: `1px solid ${labState === st.id ? '#00f0ff' : 'transparent'}`,
              borderRadius: '16px',
              padding: '5px 10px',
              color: labState === st.id ? '#00f0ff' : '#9aa8b8',
              fontSize: '9px',
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: labState === st.id ? 800 : 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            {st.label}
          </button>
        ))}

        <div style={{ height: '14px', width: '1px', background: 'rgba(255, 255, 255, 0.15)' }} />

        <button
          onClick={() => {
            setLabState('CALM');
            setSelectedEntity(null);
            setPreAlertActive(false);
            panToLocation(SRIKAKULAM_CENTER, 14, 0);
          }}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#9aa8b8',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            padding: '4px'
          }}
          title="Reset View"
        >
          <RotateCcw size={12} />
        </button>
      </nav>
    </div>
  );
}
