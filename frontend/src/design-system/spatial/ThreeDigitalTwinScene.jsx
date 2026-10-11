import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export function ThreeDigitalTwinScene({
  incidents = [],
  ambulances = [],
  hospitals = [],
  selectedIncident = null,
  recommendedAmbulance = null,
  recommendedHospital = null,
  className = "",
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth || 600;
    const height = containerRef.current.clientHeight || 400;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x070b14, 0.025);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 32, 42);
    camera.lookAt(0, 0, 0);

    // 2. WebGL Renderer with Anti-Aliasing
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    containerRef.current.appendChild(renderer.domElement);

    // 3. Grid & Tactical Ground Radar
    const gridHelper = new THREE.GridHelper(60, 30, 0x3b82f6, 0x15223c);
    gridHelper.position.y = -0.1;
    scene.add(gridHelper);

    // Sweeping Hologram Radar Ring
    const radarGeometry = new THREE.RingGeometry(0.2, 28, 64);
    const radarMaterial = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.12,
      side: THREE.DoubleSide,
    });
    const radarRing = new THREE.Mesh(radarGeometry, radarMaterial);
    radarRing.rotation.x = -Math.PI / 2;
    radarRing.position.y = 0.05;
    scene.add(radarRing);

    // Ambient & Directional Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x3b82f6, 2, 80);
    pointLight.position.set(0, 20, 10);
    scene.add(pointLight);

    // 4. Incident 3D Beacons (Red Holographic Pillars)
    const incidentMeshes = [];
    incidents.slice(0, 8).forEach((inc, idx) => {
      const angle = (idx / Math.max(incidents.length, 1)) * Math.PI * 2;
      const dist = 10 + (idx % 3) * 4;
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;

      const isSelected = selectedIncident && selectedIncident.id === inc.id;
      const height = isSelected ? 8 : 4.5;
      const color = inc.severity === "CRITICAL" ? 0xef4444 : 0xf97316;

      const cylinderGeo = new THREE.CylinderGeometry(0.2, 0.6, height, 16);
      const cylinderMat = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: isSelected ? 0.8 : 0.4,
        transparent: true,
        opacity: 0.85,
      });

      const beacon = new THREE.Mesh(cylinderGeo, cylinderMat);
      beacon.position.set(x, height / 2, z);
      scene.add(beacon);
      incidentMeshes.push({ mesh: beacon, baseHeight: height, isSelected });
    });

    // 5. Hospital 3D Capacity Columns (Purple Pillars)
    hospitals.slice(0, 4).forEach((hos, idx) => {
      const angle = (idx / 4) * Math.PI * 2 + Math.PI / 4;
      const x = Math.cos(angle) * 20;
      const z = Math.sin(angle) * 20;
      const colHeight = Math.max(3, (hos.beds_available || 10) * 0.3);

      const boxGeo = new THREE.BoxGeometry(2, colHeight, 2);
      const boxMat = new THREE.MeshStandardMaterial({
        color: 0x8b5cf6,
        emissive: 0x8b5cf6,
        emissiveIntensity: 0.35,
        wireframe: false,
      });

      const hospitalMesh = new THREE.Mesh(boxGeo, boxMat);
      hospitalMesh.position.set(x, colHeight / 2, z);
      scene.add(hospitalMesh);
    });

    // 6. Ambulance 3D Nodes (Green/Cyan Prisms)
    const ambMeshes = [];
    ambulances.slice(0, 6).forEach((amb, idx) => {
      const angle = (idx / 6) * Math.PI * 2 - Math.PI / 6;
      const x = Math.cos(angle) * 14;
      const z = Math.sin(angle) * 14;

      const isAvail = amb.status === "AVAILABLE";
      const color = isAvail ? 0x10b981 : 0xf97316;

      const coneGeo = new THREE.ConeGeometry(0.8, 2, 8);
      const coneMat = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.5,
      });

      const cone = new THREE.Mesh(coneGeo, coneMat);
      cone.position.set(x, 1, z);
      cone.rotation.x = Math.PI;
      scene.add(cone);
      ambMeshes.push(cone);
    });

    // 7. Vector Flow Line (Ambulance -> Incident -> Hospital)
    const points = [
      new THREE.Vector3(-10, 1, 8),
      new THREE.Vector3(0, 3, 0),
      new THREE.Vector3(14, 1, -12),
    ];
    const curve = new THREE.CatmullRomCurve3(points);
    const curvePoints = curve.getPoints(50);
    const lineGeo = new THREE.BufferGeometry().setFromPoints(curvePoints);
    const lineMat = new THREE.LineBasicMaterial({ color: 0x06b6d4, linewidth: 2, transparent: true, opacity: 0.8 });
    const corridorLine = new THREE.Line(lineGeo, lineMat);
    scene.add(corridorLine);

    // 8. Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Rotate ground radar
      radarRing.rotation.z = elapsedTime * 0.3;

      // Pulse selected incident beacon
      incidentMeshes.forEach(({ mesh, baseHeight, isSelected }) => {
        if (isSelected) {
          mesh.scale.y = 1 + Math.sin(elapsedTime * 4) * 0.15;
        }
      });

      // Slowly rotate scene camera for subtle cinematic digital twin effect
      camera.position.x = Math.sin(elapsedTime * 0.08) * 42;
      camera.position.z = Math.cos(elapsedTime * 0.08) * 42;
      camera.lookAt(0, 2, 0);

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [incidents, ambulances, hospitals, selectedIncident]);

  return (
    <div className={`three-digital-twin-container ${className}`}>
      <div ref={containerRef} className="three-canvas-holder" />
      <div className="three-twin-overlay-info">
        <span className="twin-badge">WEBGL 3D DIGITAL TWIN // SRIKAKULAM SECTOR</span>
        <small>Real-Time Spatial Elevation Beacons & Vector Corridors</small>
      </div>
    </div>
  );
}
