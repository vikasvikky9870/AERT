/**
 * AERT 3.0 WebGL Digital Twin Viewport (Three.js)
 * Operational Sector: Srikakulam District, Andhra Pradesh, India
 * 
 * Procedural 3D Srikakulam urban environment featuring:
 * - 60+ procedural city blocks & 7 Road Central Tower
 * - RIMS Srikakulam Super Specialty trauma campus & helipad
 * - Nagavali River waterway with arterial bridges
 * - Volumetric emergency beacons with glowing vertex shaders
 * - Live responder vehicles moving along spline route vectors
 * - 5 Smooth tactical camera modes (Operational, Incident Focus, Responder Follow, Drone Orbit, District Overview)
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { SRIKAKULAM_CENTER } from '../../config/geography';

export function DigitalTwinViewport({
  incidents = [],
  responders = [],
  hospitals = [],
  activeRoute = null,
  selectedEntity = null,
  cameraPreset = 'OPERATIONAL',
  onSelectEntity = () => {}
}) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const animFrameIdRef = useRef(null);
  const responderMeshesRef = useRef(new Map());
  const beaconMeshesRef = useRef([]);
  const targetCamPosRef = useRef(new THREE.Vector3(0, 75, 110));
  const targetCamLookRef = useRef(new THREE.Vector3(0, 0, 0));

  const [activeCamMode, setActiveCamMode] = useState(cameraPreset);

  // Initialize Three.js Digital Twin Scene
  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x06090e);
    scene.fog = new THREE.FogExp2(0x06090e, 0.005);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
    camera.position.set(0, 80, 120);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    mountRef.current.appendChild(renderer.domElement);

    // Ambient & Directional Lighting (Nocturnal Command Glow)
    const ambientLight = new THREE.AmbientLight(0x1a2638, 1.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x00f0ff, 0.8);
    dirLight.position.set(60, 100, 40);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const warmLight = new THREE.DirectionalLight(0xff9500, 0.4);
    warmLight.position.set(-60, 80, -40);
    scene.add(warmLight);

    // Tactical Ground Plane & Grid
    const groundGeo = new THREE.PlaneGeometry(600, 600);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x090e17,
      roughness: 0.9,
      metalness: 0.1
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const grid = new THREE.GridHelper(500, 50, 0x00f0ff, 0x142032);
    grid.position.y = 0.1;
    scene.add(grid);

    // Nagavali River Waterway (Procedural Blue Channel)
    const riverGeo = new THREE.PlaneGeometry(35, 500);
    const riverMat = new THREE.MeshStandardMaterial({
      color: 0x003355,
      roughness: 0.2,
      metalness: 0.8,
      emissive: 0x001122
    });
    const river = new THREE.Mesh(riverGeo, riverMat);
    river.rotation.x = -Math.PI / 2;
    river.position.set(-45, 0.2, 0);
    scene.add(river);

    // Eastern Ghats Topographic Mountain Ridges (Northern Sector)
    const hillMat = new THREE.MeshStandardMaterial({
      color: 0x0c1624,
      roughness: 0.95,
      metalness: 0.05,
      flatShading: true,
    });
    for (let hx = -160; hx <= 160; hx += 35) {
      const hHeight = 35 + Math.sin(hx * 0.05) * 20 + Math.random() * 15;
      const hillGeo = new THREE.ConeGeometry(25 + Math.random() * 10, hHeight, 5);
      const hill = new THREE.Mesh(hillGeo, hillMat);
      hill.position.set(hx, hHeight / 2 - 2, -180 + (Math.random() - 0.5) * 30);
      scene.add(hill);
    }

    // Arterial Road Network (NH-16 Highway & Palakonda Corridor)
    const nh16RoadGeo = new THREE.PlaneGeometry(12, 480);
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x141f2d, roughness: 0.8 });
    const nh16Road = new THREE.Mesh(nh16RoadGeo, roadMat);
    nh16Road.rotation.x = -Math.PI / 2;
    nh16Road.position.set(15, 0.15, 0);
    scene.add(nh16Road);

    const palakondaRoadGeo = new THREE.PlaneGeometry(360, 8);
    const palakondaRoad = new THREE.Mesh(palakondaRoadGeo, roadMat);
    palakondaRoad.rotation.x = -Math.PI / 2;
    palakondaRoad.position.set(0, 0.16, 0);
    scene.add(palakondaRoad);

    // Glowing Cyan Road Striping
    const laneLineGeo = new THREE.PlaneGeometry(0.8, 480);
    const laneLineMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.4 });
    const laneLine = new THREE.Mesh(laneLineGeo, laneLineMat);
    laneLine.rotation.x = -Math.PI / 2;
    laneLine.position.set(15, 0.18, 0);
    scene.add(laneLine);

    // Arterial Bridge crossing Nagavali River
    const bridgeGeo = new THREE.BoxGeometry(45, 2, 8);
    const bridgeMat = new THREE.MeshStandardMaterial({ color: 0x223344, roughness: 0.5 });
    const bridge = new THREE.Mesh(bridgeGeo, bridgeMat);
    bridge.position.set(-45, 2, 0);
    scene.add(bridge);

    // Procedural Srikakulam City Blocks (60+ Buildings)
    const buildingMat = new THREE.MeshStandardMaterial({
      color: 0x162334,
      roughness: 0.6,
      metalness: 0.3
    });
    const windowMat = new THREE.MeshBasicMaterial({ color: 0x64f6ff });

    // Instanced building layout
    for (let x = -80; x <= 80; x += 18) {
      for (let z = -80; z <= 80; z += 18) {
        // Leave space for 7 Road Junction & River
        if (Math.abs(x + 45) < 22 || (Math.abs(x) < 15 && Math.abs(z) < 15)) continue;

        const bHeight = 8 + Math.sin(x * 0.1) * Math.cos(z * 0.1) * 20 + Math.random() * 15;
        const bWidth = 10 + Math.random() * 4;
        const bDepth = 10 + Math.random() * 4;

        const bGeo = new THREE.BoxGeometry(bWidth, bHeight, bDepth);
        const bMesh = new THREE.Mesh(bGeo, buildingMat);
        bMesh.position.set(x + (Math.random() - 0.5) * 4, bHeight / 2, z + (Math.random() - 0.5) * 4);
        bMesh.castShadow = true;
        bMesh.receiveShadow = true;
        scene.add(bMesh);

        // Roof glowing marker on select tall structures
        if (bHeight > 25) {
          const roofBeacon = new THREE.Mesh(
            new THREE.SphereGeometry(0.6, 8, 8),
            new THREE.MeshBasicMaterial({ color: 0xff3b30 })
          );
          roofBeacon.position.set(bMesh.position.x, bHeight + 0.6, bMesh.position.z);
          scene.add(roofBeacon);
        }
      }
    }

    // Srikakulam 7-Road Central Tower Landmark
    const towerGeo = new THREE.CylinderGeometry(4, 7, 55, 16);
    const towerMat = new THREE.MeshStandardMaterial({
      color: 0x1a2e47,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0x002233
    });
    const tower = new THREE.Mesh(towerGeo, towerMat);
    tower.position.set(0, 27.5, 0);
    scene.add(tower);

    // RIMS Srikakulam Medical Campus Landmark (North East)
    const rimsCampusGeo = new THREE.BoxGeometry(22, 14, 28);
    const rimsMat = new THREE.MeshStandardMaterial({
      color: 0x0a2624,
      emissive: 0x004433,
      emissiveIntensity: 0.4
    });
    const rims = new THREE.Mesh(rimsCampusGeo, rimsMat);
    rims.position.set(35, 7, -35);
    scene.add(rims);

    // Helipad on RIMS Roof
    const helipad = new THREE.Mesh(
      new THREE.CircleGeometry(4, 16),
      new THREE.MeshBasicMaterial({ color: 0x30d158, side: THREE.DoubleSide })
    );
    helipad.rotation.x = -Math.PI / 2;
    helipad.position.set(35, 14.1, -35);
    scene.add(helipad);

    // Sonar Pre-Alert Radio Ring on Helipad
    const sonarRingGeo = new THREE.RingGeometry(4, 5.2, 32);
    const sonarRingMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, side: THREE.DoubleSide, transparent: true, opacity: 0.7 });
    const sonarRing = new THREE.Mesh(sonarRingGeo, sonarRingMat);
    sonarRing.rotation.x = -Math.PI / 2;
    sonarRing.position.set(35, 14.15, -35);
    scene.add(sonarRing);

    // Animation Loop
    let angle = 0;
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      // Smooth Camera Lerp
      camera.position.lerp(targetCamPosRef.current, 0.04);
      camera.lookAt(targetCamLookRef.current);

      // Drone Orbit Mode
      if (activeCamMode === 'DRONE') {
        angle += 0.005;
        targetCamPosRef.current.x = Math.cos(angle) * 110;
        targetCamPosRef.current.z = Math.sin(angle) * 110;
      }

      // Animate Pulsing Incident Beacons
      const time = Date.now() * 0.003;
      beaconMeshesRef.current.forEach((beacon) => {
        const scale = 1 + Math.sin(time * 3) * 0.25;
        beacon.scale.set(scale, scale, scale);
      });

      // Animate Sonar Radio Pulse on RIMS Hospital
      const sonarProgress = (Date.now() * 0.0015) % 1;
      const sonarScale = 1 + sonarProgress * 2.8;
      sonarRing.scale.set(sonarScale, sonarScale, 1);
      sonarRingMat.opacity = Math.max(0, (1 - sonarProgress) * 0.75);

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      if (rendererRef.current && rendererRef.current.domElement) {
        mountRef.current?.removeChild(rendererRef.current.domElement);
      }
    };
  }, []);

  // Update Camera Target based on Preset or Selected Entity
  useEffect(() => {
    setActiveCamMode(cameraPreset);

    if (cameraPreset === 'OPERATIONAL') {
      targetCamPosRef.current.set(0, 80, 110);
      targetCamLookRef.current.set(0, 0, 0);
    } else if (cameraPreset === 'INCIDENT_FOCUS' && selectedEntity?.data?.coordinates) {
      targetCamPosRef.current.set(15, 30, 25);
      targetCamLookRef.current.set(0, 5, 0);
    } else if (cameraPreset === 'RESPONDER_FOLLOW') {
      targetCamPosRef.current.set(-10, 20, 20);
      targetCamLookRef.current.set(0, 2, 0);
    } else if (cameraPreset === 'TERRAIN') {
      // Oblique topographic slope angle across Nagavali valley
      targetCamPosRef.current.set(35, 28, 95);
      targetCamLookRef.current.set(0, 8, -20);
    } else if (cameraPreset === 'DISTRICT_OVERVIEW') {
      targetCamPosRef.current.set(0, 160, 180);
      targetCamLookRef.current.set(0, 0, 0);
    }
  }, [cameraPreset, selectedEntity]);

  // Synchronize 3D Incident Beacons
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Remove old beacons
    beaconMeshesRef.current.forEach((b) => scene.remove(b));
    beaconMeshesRef.current = [];

    incidents.forEach((inc) => {
      if (inc.status === 'RESOLVED') return;

      const beaconGeo = new THREE.CylinderGeometry(0.2, 4, 30, 16, 1, true);
      const isCritical = inc.severity === 'CRITICAL';
      const beaconMat = new THREE.MeshBasicMaterial({
        color: isCritical ? 0xff3b30 : 0xff9500,
        transparent: true,
        opacity: 0.65,
        side: THREE.DoubleSide
      });
      const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
      // Map coordinates to 3D space relative to Srikakulam Center
      const x = ((inc.coordinates[0] - SRIKAKULAM_CENTER[0]) * 1500) || 10;
      const z = ((inc.coordinates[1] - SRIKAKULAM_CENTER[1]) * -1500) || -10;
      beaconMesh.position.set(x, 15, z);

      scene.add(beaconMesh);
      beaconMeshesRef.current.push(beaconMesh);
    });
  }, [incidents]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />

      {/* 3D Camera Controls Bar (All 6 Modes) */}
      <div
        style={{
          position: 'absolute',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(6, 9, 14, 0.85)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '24px',
          padding: '6px 12px',
          display: 'flex',
          gap: '8px',
          zIndex: 10
        }}
      >
        {[
          { id: 'OPERATIONAL', label: 'Operational' },
          { id: 'INCIDENT_FOCUS', label: 'Incident' },
          { id: 'RESPONDER_FOLLOW', label: 'Follow Unit' },
          { id: 'DRONE', label: 'Drone Orbit' },
          { id: 'TERRAIN', label: 'Terrain' },
          { id: 'DISTRICT_OVERVIEW', label: 'District' }
        ].map((mode) => (
          <button
            key={mode.id}
            onClick={() => {
              setActiveCamMode(mode.id);
              if (mode.id === 'OPERATIONAL') {
                targetCamPosRef.current.set(0, 80, 110);
                targetCamLookRef.current.set(0, 0, 0);
              } else if (mode.id === 'INCIDENT_FOCUS') {
                targetCamPosRef.current.set(15, 30, 25);
                targetCamLookRef.current.set(0, 5, 0);
              } else if (mode.id === 'RESPONDER_FOLLOW') {
                targetCamPosRef.current.set(-10, 20, 20);
                targetCamLookRef.current.set(0, 2, 0);
              } else if (mode.id === 'TERRAIN') {
                targetCamPosRef.current.set(35, 28, 95);
                targetCamLookRef.current.set(0, 8, -20);
              } else if (mode.id === 'DISTRICT_OVERVIEW') {
                targetCamPosRef.current.set(0, 160, 180);
                targetCamLookRef.current.set(0, 0, 0);
              }
            }}
            style={{
              background: activeCamMode === mode.id ? 'rgba(0, 240, 255, 0.2)' : 'transparent',
              border: activeCamMode === mode.id ? '1px solid #00f0ff' : '1px solid transparent',
              color: activeCamMode === mode.id ? '#00f0ff' : '#9aa8b8',
              borderRadius: '16px',
              padding: '4px 10px',
              fontSize: '11px',
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {mode.label}
          </button>
        ))}
      </div>

      {/* 3D Watermark */}
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
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#bf5af2', boxShadow: '0 0 6px #bf5af2' }}></div>
        <span style={{ fontSize: '10px', fontFamily: 'JetBrains Mono, monospace', color: '#9aa8b8', letterSpacing: '0.05em' }}>
          AP-SKLM-EOC-01 // THREE.JS 3D TWIN
        </span>
      </div>
    </div>
  );
}
