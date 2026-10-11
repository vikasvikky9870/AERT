/**
 * AERT 3.0 Tactical 2D GIS Map Engine
 * Operational Sector: Srikakulam District, Andhra Pradesh, India
 * Coordinates: [83.8961, 18.2969]
 * 
 * Powered by MapLibre GL with dark nocturnal cartography, dynamic GeoJSON overlays,
 * pulsing SVG emergency beacons, directional vehicle markers, and glowing route lines.
 */

import React, { useEffect, useRef } from 'react';
import { Map as MapLibreMap, Marker as MapLibreMarker } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  SRIKAKULAM_CENTER,
  OPERATIONAL_BOUNDS,
  KNOWN_LANDMARKS
} from '../../config/geography';
import { DARK_TACTICAL_STYLE } from './mapStyles';

export function MapContainer({
  incidents = [],
  responders = [],
  hospitals = [],
  roadEvents = [],
  activeRoute = null,
  selectedEntity = null,
  onSelectEntity = () => {},
  is3DMode = false,
  cameraPreset = 'OPERATIONAL'
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  // Initialize MapLibre GL Instance
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const MapConstructor = MapLibreMap || maplibregl?.Map || window.maplibregl?.Map;
    if (!MapConstructor) return;

    const map = new MapConstructor({
      container: mapContainerRef.current,
      style: DARK_TACTICAL_STYLE,
      center: SRIKAKULAM_CENTER,
      zoom: 13.6,
      minZoom: 10.5,
      maxZoom: 18.5,
      pitch: is3DMode ? 55 : 0,
      bearing: is3DMode ? -15 : 0,
      maxBounds: OPERATIONAL_BOUNDS,
      attributionControl: false
    });

    mapRef.current = map;

    map.on('load', () => {
      // Add Route Line GeoJSON Source & Layer
      if (!map.getSource('active-route-source')) {
        map.addSource('active-route-source', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: activeRoute?.geometry || { type: 'LineString', coordinates: [] }
          }
        });

        // Glowing outer casing
        map.addLayer({
          id: 'route-glow',
          type: 'line',
          source: 'active-route-source',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#00f0ff',
            'line-width': 10,
            'line-opacity': 0.35,
            'line-blur': 6
          }
        });

        // Crisp inner vector
        map.addLayer({
          id: 'route-core',
          type: 'line',
          source: 'active-route-source',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#ffffff',
            'line-width': 3.5,
            'line-opacity': 0.95
          }
        });
      }

      // Add Srikakulam District Bounding Boundary Overlay
      if (!map.getSource('district-bounds-source')) {
        map.addSource('district-bounds-source', {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [83.70, 18.15],
                  [84.15, 18.15],
                  [84.15, 18.50],
                  [83.70, 18.50],
                  [83.70, 18.15]
                ]
              ]
            }
          }
        });

        map.addLayer({
          id: 'district-bounds-line',
          type: 'line',
          source: 'district-bounds-source',
          paint: {
            'line-color': '#00f0ff',
            'line-width': 1.5,
            'line-dasharray': [4, 4],
            'line-opacity': 0.4
          }
        });
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Route GeoJSON when activeRoute changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.getSource('active-route-source')) return;

    const routeData = activeRoute?.geometry || {
      type: 'LineString',
      coordinates: []
    };

    map.getSource('active-route-source').setData({
      type: 'Feature',
      properties: {},
      geometry: routeData
    });
  }, [activeRoute]);

  // Update 2D / 3D Pitch and Bearing Transitions
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (is3DMode) {
      map.easeTo({
        pitch: 58,
        bearing: -18,
        duration: 1200
      });
    } else {
      map.easeTo({
        pitch: 0,
        bearing: 0,
        duration: 1000
      });
    }
  }, [is3DMode]);

  // Focus Camera on Selected Entity
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedEntity || !selectedEntity.coordinates) return;

    map.flyTo({
      center: selectedEntity.coordinates,
      zoom: 15.2,
      pitch: is3DMode ? 60 : 20,
      duration: 1400,
      essential: true
    });
  }, [selectedEntity, is3DMode]);

  // Synchronize Markers (Incidents, Ambulances, Hospitals, Road Closures)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const MarkerClass = MapLibreMarker || maplibregl?.Marker || window.maplibregl?.Marker;
    if (!MarkerClass) return;

    // 1. Incident Markers (Pulsing Red / Amber Beacons)
    incidents.forEach((inc) => {
      if (!inc.coordinates || inc.status === 'RESOLVED') return;

      const el = document.createElement('div');
      el.className = 'aert-incident-marker';
      el.style.cursor = 'pointer';
      el.innerHTML = `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 34px; height: 34px;">
          <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background: ${
            inc.severity === 'CRITICAL' ? 'rgba(255, 59, 48, 0.35)' : 'rgba(255, 149, 0, 0.35)'
          }; animation: aert-beacon-pulse 1.8s infinite ease-out;"></div>
          <div style="width: 22px; height: 22px; border-radius: 50%; background: ${
            inc.severity === 'CRITICAL' ? '#ff3b30' : '#ff9500'
          }; border: 2px solid #ffffff; box-shadow: 0 0 12px ${
        inc.severity === 'CRITICAL' ? 'rgba(255, 59, 48, 0.8)' : 'rgba(255, 149, 0, 0.8)'
      }; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 10px; font-weight: 800; font-family: 'JetBrains Mono', monospace;">
            !
          </div>
        </div>
      `;

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        onSelectEntity({ type: 'incident', coordinates: inc.coordinates, data: inc });
      });

      const marker = new MarkerClass({ element: el })
        .setLngLat(inc.coordinates)
        .addTo(map);

      markersRef.current.push(marker);
    });

    // 2. Ambulance Fleet Markers (Directional Cyan Vehicles)
    responders.forEach((amb) => {
      if (!amb.coordinates) return;

      const el = document.createElement('div');
      el.className = 'aert-ambulance-marker';
      el.style.cursor = 'pointer';
      const isEnRoute = amb.status === 'EN_ROUTE' || amb.status === 'TRANSPORTING';
      
      el.innerHTML = `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px;">
          ${isEnRoute ? '<div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background: rgba(0, 240, 255, 0.3); animation: aert-beacon-pulse 2s infinite ease-out;"></div>' : ''}
          <div style="width: 20px; height: 20px; border-radius: 4px; background: #00f0ff; border: 2px solid #06090e; box-shadow: 0 0 10px rgba(0, 240, 255, 0.7); display: flex; align-items: center; justify-content: center; transform: rotate(${amb.heading_deg || 0}deg);">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#06090e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1 .4-1 1v9c0 .6.4 1 1 1h2"/>
              <circle cx="7" cy="17" r="2"/>
              <circle cx="17" cy="17" r="2"/>
            </svg>
          </div>
        </div>
      `;

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        onSelectEntity({ type: 'ambulance', coordinates: amb.coordinates, data: amb });
      });

      const marker = new MarkerClass({ element: el })
        .setLngLat(amb.coordinates)
        .addTo(map);

      markersRef.current.push(marker);
    });

    // 3. Hospital Trauma Node Markers (Emerald / Sapphire Medical Facilities)
    hospitals.forEach((hos) => {
      if (!hos.coordinates) return;

      const el = document.createElement('div');
      el.className = 'aert-hospital-marker';
      el.style.cursor = 'pointer';
      const erLoad = hos.er_capacity || 50;
      const isHighLoad = erLoad > 80;

      const isPrealert = Boolean(hos.is_prealert_active);

      el.innerHTML = `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
          ${isPrealert ? `
            <div style="position: absolute; top: -6px; left: -6px; width: 36px; height: 36px; border: 2px solid #00f0ff; border-radius: 50%; animation: aert-sonar-pulse 1.2s infinite ease-out;"></div>
            <div style="position: absolute; top: -12px; left: -12px; width: 48px; height: 48px; border: 1px solid rgba(0, 240, 255, 0.5); border-radius: 50%; animation: aert-sonar-pulse 1.2s infinite 0.4s ease-out;"></div>
          ` : ''}
          <div style="width: 24px; height: 24px; border-radius: 6px; background: #0c121c; border: 2px solid ${isPrealert ? '#00f0ff' : (isHighLoad ? '#ff9500' : '#30d158')}; box-shadow: 0 0 12px ${isPrealert ? 'rgba(0, 240, 255, 0.9)' : (isHighLoad ? 'rgba(255, 149, 0, 0.6)' : 'rgba(48, 209, 88, 0.6)')}; display: flex; align-items: center; justify-content: center; color: #fff;">
            <span style="font-weight: 800; font-size: 12px; color: ${isPrealert ? '#00f0ff' : (isHighLoad ? '#ff9500' : '#30d158')};">H</span>
          </div>
          <div style="background: rgba(6, 9, 14, 0.85); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 3px; padding: 1px 4px; font-size: 9px; font-family: 'JetBrains Mono', monospace; font-weight: 700; color: #f2f5f8; margin-top: 2px; white-space: nowrap;">
            ${hos.name.split(' ')[0]} ${isPrealert ? 'ALERTED' : `${erLoad}%`}
          </div>
        </div>
      `;

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        onSelectEntity({ type: 'hospital', coordinates: hos.coordinates, data: hos });
      });

      const marker = new MarkerClass({ element: el })
        .setLngLat(hos.coordinates)
        .addTo(map);

      markersRef.current.push(marker);
    });

    // 4. Road Closure / Hazard Markers
    roadEvents.forEach((rd) => {
      if (!rd.coordinates || !rd.is_active) return;

      const el = document.createElement('div');
      el.className = 'aert-road-event-marker';
      el.style.cursor = 'pointer';

      el.innerHTML = `
        <div style="width: 20px; height: 20px; background: #ff9500; border-radius: 3px; border: 2px solid #06090e; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 8px rgba(255, 149, 0, 0.8);">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#06090e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
      `;

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        onSelectEntity({ type: 'road_event', coordinates: rd.coordinates, data: rd });
      });

      const marker = new MarkerClass({ element: el })
        .setLngLat(rd.coordinates)
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [incidents, responders, hospitals, roadEvents, onSelectEntity]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%', backgroundColor: '#06090e' }} />
      
      {/* Tactical Canvas Overlay Watermark */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          pointerEvents: 'none',
          background: 'rgba(6, 9, 14, 0.75)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '4px',
          padding: '4px 8px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          zIndex: 5
        }}
      >
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00f0ff', boxShadow: '0 0 6px #00f0ff' }}></div>
        <span style={{ fontSize: '10px', fontFamily: 'JetBrains Mono, monospace', color: '#9aa8b8', letterSpacing: '0.05em' }}>
          AP-SKLM-EOC-01 // 2D GIS VECTOR
        </span>
      </div>
    </div>
  );
}
