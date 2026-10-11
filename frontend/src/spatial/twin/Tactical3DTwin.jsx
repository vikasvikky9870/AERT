/**
 * AERT 3.0 — Three.js WebGL Tactical Digital Twin
 * Sector: Srikakulam District, Andhra Pradesh, India (AP-SKLM-EOC-01)
 * 
 * High-Fidelity 3D Situational Awareness:
 * - Procedural Srikakulam urban architecture with edge wireframe strata & rooftop beacons
 * - Nagavali River water channel & Nagavali Bridge with suspension pylons
 * - Srikakulam 7-Road Central Spire with skyward volumetric beacon
 * - RIMS Srikakulam Emergency Medical Campus with pulsing helipad
 * - Dynamic 3D Emergency Vehicles with active LED lightbars
 * - Animated 3D Route Corridor linking responder -> incident -> trauma hospital
 * - 6 Cinematic Camera Modes with smooth interpolation
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Camera, Navigation, Radio, Shield, Crosshair } from 'lucide-react';

const CAMERA_PRESETS = [
  { id: 'OPERATIONAL', label: 'OPERATIONAL', pos: [0, 85, 115], look: [0, 0, 0] },
  { id: 'INCIDENT', label: 'INCIDENT FOCUS', pos: [22, 36, 26], look: [7, 0, -6] },
  { id: 'FOLLOW', label: 'FOLLOW UNIT', pos: [14, 18, 22], look: [0, 0, 0] },
  { id: 'DRONE', label: 'DRONE ORBIT', pos: [70, 48, 70], look: [0, 5, 0] },
  { id: 'TERRAIN', label: 'NAGAVALI BASIN', pos: [-65, 32, 45], look: [-45, 0, 0] },
  { id: 'DISTRICT', label: 'DISTRICT OVERVIEW', pos: [0, 140, 160], look: [0, 0, 0] }
];

export function Tactical3DTwin({
  incidents = [],
  responders = [],
  hospitals = [],
  activeRoute = null,
  selectedEntity = null,
  cameraPreset = 'OPERATIONAL',
  onSelectEntity = () => {},
  onToggle3D = () => {}
}) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const animFrameIdRef = useRef(null);
  const responderMeshesRef = useRef(new Map());
  const beaconMeshesRef = useRef([]);
  const routeLineMeshRef = useRef(null);
  const targetCamPosRef = useRef(new THREE.Vector3(0, 85, 115));
  const targetCamLookRef = useRef(new THREE.Vector3(0, 0, 0));

  const [activeCamMode, setActiveCamMode] = useState(cameraPreset);

  // Initialize Three.js Scene
  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // 1. Scene with Atmospheric Nocturnal Fog
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x06090e);
    scene.fog = new THREE.FogExp2(0x06090e, 0.0042);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
    camera.position.set(0, 85, 115);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    rendererRef.current = renderer;

    mountRef.current.appendChild(renderer.domElement);

    // 4. Cinematic Lighting Setup
    const ambientLight = new THREE.AmbientLight(0x131f2e, 2.0);
    scene.add(ambientLight);

    const cyanKeyLight = new THREE.DirectionalLight(0x00f0ff, 0.9);
    cyanKeyLight.position.set(50, 100, 30);
    cyanKeyLight.castShadow = true;
    scene.add(cyanKeyLight);

    const warmFillLight = new THREE.DirectionalLight(0xff9500, 0.35);
    warmFillLight.position.set(-60, 70, -40);
    scene.add(warmFillLight);

    const hemiLight = new THREE.HemisphereLight(0x182c44, 0x06090e, 0.8);
    scene.add(hemiLight);

    // 5. Tactical Ground Plane & High-Tech Coordinate Grid
    const groundGeo = new THREE.PlaneGeometry(600, 600);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x080d14,
      roughness: 0.85,
      metalness: 0.15
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const grid = new THREE.GridHelper(500, 50, 0x00f0ff, 0x142030);
    grid.position.y = 0.05;
    scene.add(grid);

    // 6. Nagavali River Channel (West Srikakulam Basin)
    const riverGeo = new THREE.PlaneGeometry(42, 500);
    const riverMat = new THREE.MeshStandardMaterial({
      color: 0x021626,
      roughness: 0.15,
      metalness: 0.85,
      emissive: 0x011322
    });
    const river = new THREE.Mesh(riverGeo, riverMat);
    river.rotation.x = -Math.PI / 2;
    river.position.set(-45, 0.1, 0);
    scene.add(river);

    // River Water Shimmer Edge
    const riverEdgeGeo = new THREE.PlaneGeometry(1.2, 500);
    const riverEdgeMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.25 });
    const rEdge1 = new THREE.Mesh(riverEdgeGeo, riverEdgeMat);
    rEdge1.rotation.x = -Math.PI / 2;
    rEdge1.position.set(-24, 0.12, 0);
    scene.add(rEdge1);
    const rEdge2 = new THREE.Mesh(riverEdgeGeo, riverEdgeMat);
    rEdge2.rotation.x = -Math.PI / 2;
    rEdge2.position.set(-66, 0.12, 0);
    scene.add(rEdge2);

    // 7. Arterial Roads (NH-16 Corridor & Palakonda Road)
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x101722, roughness: 0.7 });
    
    // NH-16 (North-South Highway Corridor)
    const nh16Geo = new THREE.PlaneGeometry(18, 500);
    const nh16 = new THREE.Mesh(nh16Geo, roadMat);
    nh16.rotation.x = -Math.PI / 2;
    nh16.position.set(15, 0.12, 0);
    scene.add(nh16);

    // Glowing Road Highway Dividers
    const laneLineGeo = new THREE.PlaneGeometry(0.6, 500);
    const laneLineMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.5 });
    const laneLine = new THREE.Mesh(laneLineGeo, laneLineMat);
    laneLine.rotation.x = -Math.PI / 2;
    laneLine.position.set(15, 0.18, 0);
    scene.add(laneLine);

    // East-West Palakonda Arterial
    const palakondaGeo = new THREE.PlaneGeometry(360, 12);
    const palakonda = new THREE.Mesh(palakondaGeo, roadMat);
    palakonda.rotation.x = -Math.PI / 2;
    palakonda.position.set(0, 0.12, 0);
    scene.add(palakonda);

    // Bridge crossing Nagavali River
    const bridgeGroup = new THREE.Group();
    const bridgeDeck = new THREE.Mesh(
      new THREE.BoxGeometry(45, 2.2, 13),
      new THREE.MeshStandardMaterial({ color: 0x162232, roughness: 0.4, metalness: 0.5 })
    );
    bridgeDeck.position.set(-45, 1.6, 0);
    bridgeGroup.add(bridgeDeck);

    // Bridge Suspension Pylons
    const pylonGeo = new THREE.CylinderGeometry(0.8, 1.2, 18, 8);
    const pylonMat = new THREE.MeshStandardMaterial({ color: 0x1c2e42, metalness: 0.7 });
    const pylon1 = new THREE.Mesh(pylonGeo, pylonMat);
    pylon1.position.set(-32, 9, 6.5);
    bridgeGroup.add(pylon1);
    const pylon2 = new THREE.Mesh(pylonGeo, pylonMat);
    pylon2.position.set(-58, 9, 6.5);
    bridgeGroup.add(pylon2);
    scene.add(bridgeGroup);

    // 8. Procedural Srikakulam Architecture with Luminous Edge Strata
    const bMat = new THREE.MeshStandardMaterial({
      color: 0x0f1824,
      roughness: 0.4,
      metalness: 0.45
    });
    const edgeMat = new THREE.LineBasicMaterial({ color: 0x1a2e44, transparent: true, opacity: 0.65 });

    for (let x = -80; x <= 80; x += 20) {
      for (let z = -80; z <= 80; z += 20) {
        // Keep clear corridors for Nagavali River, NH-16 Highway, and 7-Road Junction
        if (Math.abs(x + 45) < 24) continue;
        if (Math.abs(x - 15) < 14) continue;
        if (Math.abs(z) < 12) continue;
        if (Math.abs(x) < 16 && Math.abs(z) < 16) continue;

        const bHeight = 8 + Math.abs(Math.sin(x * 0.15) * Math.cos(z * 0.15)) * 24 + (x % 5) * 1.5;
        const bWidth = 12;
        const bDepth = 12;

        const bGeo = new THREE.BoxGeometry(bWidth, bHeight, bDepth);
        const bMesh = new THREE.Mesh(bGeo, bMat);
        bMesh.position.set(x, bHeight / 2, z);
        bMesh.castShadow = true;
        bMesh.receiveShadow = true;
        scene.add(bMesh);

        // Wireframe Edge Strata
        const edges = new THREE.LineSegments(new THREE.EdgesGeometry(bGeo), edgeMat);
        edges.position.copy(bMesh.position);
        scene.add(edges);

        // Rooftop navigation beacons on structures > 20m
        if (bHeight > 20) {
          const roofBeacon = new THREE.Mesh(
            new THREE.SphereGeometry(0.6, 8, 8),
            new THREE.MeshBasicMaterial({ color: 0xff3b30 })
          );
          roofBeacon.position.set(x, bHeight + 0.5, z);
          scene.add(roofBeacon);
        }
      }
    }

    // 9. Srikakulam 7-Road Central Spire Landmark
    const towerGeo = new THREE.CylinderGeometry(2.5, 6, 54, 16);
    const towerMat = new THREE.MeshStandardMaterial({
      color: 0x162c42,
      metalness: 0.85,
      roughness: 0.2,
      emissive: 0x002438,
      emissiveIntensity: 0.6
    });
    const tower = new THREE.Mesh(towerGeo, towerMat);
    tower.position.set(0, 27, 0);
    scene.add(tower);

    // Skyward Volumetric Light Cone on Tower
    const skyLightGeo = new THREE.ConeGeometry(8, 70, 16, 1, true);
    const skyLightMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide
    });
    const skyLight = new THREE.Mesh(skyLightGeo, skyLightMat);
    skyLight.position.set(0, 70, 0);
    scene.add(skyLight);

    // 10. RIMS Srikakulam Medical Campus & Helipad
    const rimsGeo = new THREE.BoxGeometry(22, 14, 28);
    const rimsMat = new THREE.MeshStandardMaterial({
      color: 0x0a2226,
      emissive: 0x003d33,
      emissiveIntensity: 0.5,
      metalness: 0.5,
      roughness: 0.3
    });
    const rims = new THREE.Mesh(rimsGeo, rimsMat);
    rims.position.set(38, 7, -35);
    scene.add(rims);

    const helipad = new THREE.Mesh(
      new THREE.CircleGeometry(4.5, 16),
      new THREE.MeshBasicMaterial({ color: 0x30d158, side: THREE.DoubleSide })
    );
    helipad.rotation.x = -Math.PI / 2;
    helipad.position.set(38, 14.1, -35);
    scene.add(helipad);

    // Sonar Pre-Alert Radio Ring on Helipad
    const sonarRingGeo = new THREE.RingGeometry(4.5, 5.8, 32);
    const sonarRingMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
    const sonarRing = new THREE.Mesh(sonarRingGeo, sonarRingMat);
    sonarRing.rotation.x = -Math.PI / 2;
    sonarRing.position.set(38, 14.15, -35);
    scene.add(sonarRing);

    // 11. Animation Loop
    let orbitAngle = 0;
    let lightFlashTime = 0;

    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      // Smooth camera interpolation
      camera.position.lerp(targetCamPosRef.current, 0.045);
      camera.lookAt(targetCamLookRef.current);

      // Drone Orbit Mode
      if (activeCamMode === 'DRONE') {
        orbitAngle += 0.003;
        targetCamPosRef.current.x = Math.cos(orbitAngle) * 95;
        targetCamPosRef.current.z = Math.sin(orbitAngle) * 95;
      }

      // Animate Beacon Meshes Pulse
      const time = Date.now() * 0.003;
      beaconMeshesRef.current.forEach((beacon) => {
        const scale = 1 + Math.sin(time * 3) * 0.2;
        beacon.scale.set(scale, scale, scale);
      });

      // Animate Helipad Sonar Ring Pulse
      const ringScale = 1 + ((time * 0.5) % 1) * 1.5;
      sonarRing.scale.set(ringScale, ringScale, ringScale);
      sonarRingMat.opacity = Math.max(0, 0.8 - (ringScale - 1) * 0.6);

      // Flash Responder Lightbars
      lightFlashTime += 0.1;
      const isRedFlash = Math.sin(lightFlashTime * 5) > 0;
      responderMeshesRef.current.forEach((ambGroup) => {
        const lb = ambGroup.getObjectByName('lightbar');
        if (lb && lb.material) {
          lb.material.color.setHex(isRedFlash ? 0xff3b30 : 0x00f0ff);
        }
      });

      renderer.render(scene, camera);
    };
    animate();

    // Window Resize Handler
    const handleResize = () => {
      if (!mountRef.current || !cameraRef.current || !rendererRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animFrameIdRef.current);
      if (rendererRef.current?.domElement) {
        mountRef.current?.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, []);

  // Update Dynamic Beacons for Incidents
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    beaconMeshesRef.current.forEach((mesh) => scene.remove(mesh));
    beaconMeshesRef.current = [];

    incidents.forEach((inc) => {
      if (inc.status === 'RESOLVED') return;

      const x = (inc.coordinates[0] - 83.8961) * 800;
      const z = (inc.coordinates[1] - 18.2969) * -800;

      const isCritical = inc.severity === 'CRITICAL';
      const color = isCritical ? 0xff3b30 : 0xff9500;

      const beaconGroup = new THREE.Group();

      // Holographic Light Cone
      const coneGeo = new THREE.ConeGeometry(3.5, 34, 16, 1, true);
      const coneMat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide
      });
      const cone = new THREE.Mesh(coneGeo, coneMat);
      cone.position.y = 17;
      cone.rotation.x = Math.PI;
      beaconGroup.add(cone);

      // Core Glowing Sphere
      const sphereGeo = new THREE.SphereGeometry(1.6, 16, 16);
      const sphereMat = new THREE.MeshBasicMaterial({ color });
      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      sphere.position.y = 34;
      beaconGroup.add(sphere);

      // Concentric Ground Shockwave Ring
      const groundShockGeo = new THREE.RingGeometry(2, 6, 24);
      const groundShockMat = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
      const groundShock = new THREE.Mesh(groundShockGeo, groundShockMat);
      groundShock.rotation.x = -Math.PI / 2;
      groundShock.position.y = 0.2;
      beaconGroup.add(groundShock);

      beaconGroup.position.set(x, 0, z);
      scene.add(beaconGroup);
      beaconMeshesRef.current.push(beaconGroup);
    });
  }, [incidents]);

  // Sync Camera Preset Prop
  useEffect(() => {
    if (cameraPreset) {
      setCameraPresetMode(cameraPreset);
    }
  }, [cameraPreset]);

  // Handle Camera Presets
  const setCameraPresetMode = (modeId) => {
    setActiveCamMode(modeId);
    const preset = CAMERA_PRESETS.find((p) => p.id === modeId);
    if (!preset) return;

    targetCamPosRef.current.set(...preset.pos);
    targetCamLookRef.current.set(...preset.look);
  };

  // 3D Responders & Route Corridors
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Clean up existing responder meshes
    responderMeshesRef.current.forEach((mesh) => scene.remove(mesh));
    responderMeshesRef.current.clear();

    responders.forEach((amb) => {
      if (!amb.coordinates) return;

      const x = (amb.coordinates[0] - 83.8961) * 800;
      const z = (amb.coordinates[1] - 18.2969) * -800;

      const ambGroup = new THREE.Group();

      // Ambulance Chassis (White with Cyan emergency livery)
      const bodyGeo = new THREE.BoxGeometry(4.2, 2.6, 8.4);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0xf2f5f8,
        metalness: 0.3,
        roughness: 0.4
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 1.3;
      body.castShadow = true;
      ambGroup.add(body);

      // Windshield & Windows
      const cabGeo = new THREE.BoxGeometry(4.0, 1.4, 3.2);
      const cabMat = new THREE.MeshStandardMaterial({ color: 0x06090e, roughness: 0.1 });
      const cab = new THREE.Mesh(cabGeo, cabMat);
      cab.position.set(0, 2.3, 1.8);
      ambGroup.add(cab);

      // Flashing Emergency Lightbar on Roof
      const lightbarGeo = new THREE.BoxGeometry(2.8, 0.6, 1.0);
      const lightbarMat = new THREE.MeshBasicMaterial({ color: 0xff3b30 });
      const lightbar = new THREE.Mesh(lightbarGeo, lightbarMat);
      lightbar.name = 'lightbar';
      lightbar.position.y = 2.95;
      ambGroup.add(lightbar);

      // Contextual 3D Unit Marker Ring on Ground
      const ringGeo = new THREE.RingGeometry(4.5, 5.2, 24);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, side: THREE.DoubleSide, transparent: true, opacity: 0.7 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.2;
      ambGroup.add(ring);

      ambGroup.position.set(x, 0, z);
      scene.add(ambGroup);
      responderMeshesRef.current.set(amb.id, ambGroup);
    });

    // 3D Route Corridor Tube
    if (routeLineMeshRef.current) {
      scene.remove(routeLineMeshRef.current);
      routeLineMeshRef.current = null;
    }

    if (activeRoute?.geometry?.coordinates && activeRoute.geometry.coordinates.length > 1) {
      const points = activeRoute.geometry.coordinates.map((coord) => {
        return new THREE.Vector3(
          (coord[0] - 83.8961) * 800,
          0.8,
          (coord[1] - 18.2969) * -800
        );
      });

      const curve = new THREE.CatmullRomCurve3(points);
      const tubeGeo = new THREE.TubeGeometry(curve, 64, 0.8, 8, false);
      const tubeMat = new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        transparent: true,
        opacity: 0.85
      });
      const routeLineMesh = new THREE.Mesh(tubeGeo, tubeMat);
      scene.add(routeLineMesh);
      routeLineMeshRef.current = routeLineMesh;
    }

    return () => {
      if (routeLineMeshRef.current) {
        scene.remove(routeLineMeshRef.current);
        routeLineMeshRef.current = null;
      }
    };
  }, [responders, activeRoute]);

  // Follow Selected Entity
  useEffect(() => {
    if (!selectedEntity || !selectedEntity.coordinates) return;

    const x = (selectedEntity.coordinates[0] - 83.8961) * 800;
    const z = (selectedEntity.coordinates[1] - 18.2969) * -800;

    targetCamLookRef.current.set(x, 0, z);

    if (selectedEntity.type === 'incident') {
      targetCamPosRef.current.set(x + 22, 36, z + 26);
      setActiveCamMode('INCIDENT');
    } else if (selectedEntity.type === 'ambulance') {
      targetCamPosRef.current.set(x + 14, 18, z + 22);
      setActiveCamMode('FOLLOW');
    } else if (selectedEntity.type === 'hospital') {
      targetCamPosRef.current.set(x + 35, 45, z + 35);
    }
  }, [selectedEntity]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%', backgroundColor: '#06090e' }} />

      {/* Top-Left Geographic Sector Telemetry HUD */}
      <div
        style={{
          position: 'absolute',
          top: '72px',
          left: '20px',
          background: 'rgba(8, 14, 23, 0.85)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(0, 240, 255, 0.25)',
          borderRadius: '10px',
          padding: '8px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          zIndex: 10,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.7)'
        }}
      >
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00f0ff', boxShadow: '0 0 10px #00f0ff' }} />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 800, color: '#f2f5f8', letterSpacing: '0.04em' }}>
            AP-SKLM-EOC-01 // 3D DIGITAL TWIN
          </span>
          <span style={{ fontSize: '9px', fontFamily: 'JetBrains Mono, monospace', color: '#9aa8b8' }}>
            NAGAVALI BASIN • CENTRAL SPIRE • NH-16 CORRIDOR
          </span>
        </div>
      </div>

      {/* Camera Mode Switcher (Top-Right Floating HUD) */}
      <div
        style={{
          position: 'absolute',
          top: '72px',
          right: '20px',
          background: 'rgba(8, 14, 23, 0.9)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(0, 240, 255, 0.35)',
          borderRadius: '10px',
          padding: '6px 10px',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          zIndex: 10,
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.7)'
        }}
      >
        <Camera size={13} color="#00f0ff" />
        <span style={{ fontSize: '9px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 800, color: '#00f0ff', marginRight: '4px' }}>
          CAM:
        </span>
        {CAMERA_PRESETS.map((p) => {
          const isActive = activeCamMode === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setCameraPresetMode(p.id)}
              style={{
                background: isActive ? 'rgba(0, 240, 255, 0.22)' : 'transparent',
                border: `1px solid ${isActive ? '#00f0ff' : 'rgba(255, 255, 255, 0.08)'}`,
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '9px',
                fontFamily: 'JetBrains Mono, monospace',
                fontWeight: isActive ? 800 : 500,
                color: isActive ? '#00f0ff' : '#9aa8b8',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {p.id}
            </button>
          );
        })}
      </div>
    </div>
  );
}
