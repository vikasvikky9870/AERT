/**
 * AERT Centralized Geographic Configuration
 * Operational Sector: Srikakulam District, Andhra Pradesh, India
 * 
 * CRITICAL RULE:
 * Primary center is Srikakulam [83.8961, 18.2969].
 * Never fall back to Hyderabad or non-Srikakulam coordinates.
 */

export const SRIKAKULAM_CENTER = [83.8961, 18.2969]; // [longitude, latitude] (MapLibre convention)

export const DEFAULT_MAP_CONFIG = {
  center: SRIKAKULAM_CENTER,
  zoom: 13.5,
  minZoom: 10.5,
  maxZoom: 18.5,
  pitch2D: 0,
  bearing2D: 0,
  pitch3D: 58,
  bearing3D: -18,
  pitchTerrain: 64,
  bearingTerrain: 22,
};

// Srikakulam District Bounding Box: [ [minLon, minLat], [maxLon, maxLat] ]
export const OPERATIONAL_BOUNDS = [
  [83.70, 18.15], // Southwest
  [84.15, 18.50], // Northeast
];

export const SECTOR_METADATA = {
  district: "Srikakulam",
  state: "Andhra Pradesh",
  country: "India",
  countryCode: "+91",
  emergencyNumber: "108 / 112",
  eocSectorId: "AP-SKLM-EOC-01",
  timezone: "Asia/Kolkata",
  utcOffset: "+05:30",
  primaryHighway: "NH-16 (Chennai - Kolkata Highway)",
  primaryRiver: "Nagavali River",
};

export const KNOWN_LANDMARKS = [
  {
    name: "Srikakulam City Center (7 Road Junction)",
    coordinates: [83.8961, 18.2969],
    type: "Commercial / Transport Hub",
    confidence: 99,
    description: "Central junction connecting 7 arterial city roads.",
  },
  {
    name: "NH-16 Srikakulam Bypass Junction",
    coordinates: [83.9050, 18.3050],
    type: "Highway Arterial Corridor",
    confidence: 95,
    description: "High-speed national corridor carrying freight and long-distance passenger traffic.",
  },
  {
    name: "Palakonda Road Near Collectorate",
    coordinates: [83.8920, 18.2980],
    type: "Administrative District",
    confidence: 94,
    description: "District administrative headquarters and municipal office road.",
  },
  {
    name: "Day & Night Junction (Old Bus Stand)",
    coordinates: [83.8990, 18.2940],
    type: "Dense Commercial / Transit",
    confidence: 96,
    description: "High-density pedestrian and local auto-rickshaw transit zone.",
  },
  {
    name: "Amadalavalasa Road Approach",
    coordinates: [83.9250, 18.2750],
    type: "Railway Link Corridor",
    confidence: 92,
    description: "Corridor linking Srikakulam Road Railway Station (CHE) to city.",
  },
  {
    name: "Singupuram Industrial Corridor",
    coordinates: [83.8650, 18.3200],
    type: "Industrial / Manufacturing Zone",
    confidence: 91,
    description: "Chemical and industrial manufacturing zone with hazardous materials staging.",
  },
  {
    name: "Nagavali Bridge Sector",
    coordinates: [83.8880, 18.3010],
    type: "River Crossing Infrastructure",
    confidence: 97,
    description: "Primary bridge infrastructure crossing Nagavali River.",
  },
];

export const AMBULANCE_DEPOTS = [
  {
    id: "DEPOT-01",
    name: "GGH Central EMS Depot",
    coordinates: [83.8961, 18.2969],
    assignedUnits: ["AMB-001", "AMB-002"],
  },
  {
    id: "DEPOT-02",
    name: "NH-16 Highway Emergency Post",
    coordinates: [83.9050, 18.3050],
    assignedUnits: ["AMB-003"],
  },
  {
    id: "DEPOT-03",
    name: "Collectorate EMS Standby Hub",
    coordinates: [83.8920, 18.2980],
    assignedUnits: ["AMB-004"],
  },
  {
    id: "DEPOT-04",
    name: "Amadalavalasa Sector Post",
    coordinates: [83.9250, 18.2750],
    assignedUnits: ["AMB-005"],
  },
];

export const HOSPITAL_COORDINATES = [
  {
    id: "HOS-001",
    name: "Government General Hospital (GGH) Srikakulam",
    coordinates: [83.8980, 18.2990],
    traumaLevel: "Level 1 Trauma Center",
  },
  {
    id: "HOS-002",
    name: "RIMS Srikakulam Super Specialty",
    coordinates: [83.9080, 18.3100],
    traumaLevel: "Level 2 Trauma Center",
  },
  {
    id: "HOS-003",
    name: "District Community Trauma Care Center",
    coordinates: [83.8890, 18.2920],
    traumaLevel: "Level 3 Emergency Center",
  },
];

export const INCIDENT_PRESETS = [
  {
    title: "NH-16 Bypass Multi-Vehicle Crash",
    type: "Major Highway Collision",
    location: "NH-16 Srikakulam Bypass Junction",
    coordinates: [83.9050, 18.3050],
    severity: "CRITICAL",
    victims: 6,
    critical_victims: 2,
    hazard_type: "Highway Entrapment / Fuel Spill",
  },
  {
    title: "Palakonda Road Auto Overturn",
    type: "Vehicle Collision",
    location: "Palakonda Road Near Collectorate",
    coordinates: [83.8920, 18.2980],
    severity: "HIGH",
    victims: 3,
    critical_victims: 1,
    hazard_type: "Road Debris & Head Trauma",
  },
  {
    title: "7 Road Junction Cardiac Arrest",
    type: "Medical Emergency / Cardiac",
    location: "7 Road Junction, Srikakulam Central",
    coordinates: [83.8961, 18.2969],
    severity: "HIGH",
    victims: 1,
    critical_victims: 1,
    hazard_type: "Time-Critical ALS Required",
  },
  {
    title: "Singupuram Industrial Chemical Fire",
    type: "Building Fire",
    location: "Singupuram Industrial Sector",
    coordinates: [83.8650, 18.3200],
    severity: "CRITICAL",
    victims: 10,
    critical_victims: 3,
    hazard_type: "Toxic Vapor Release",
  },
];

/**
 * Geographic verification assertion
 * Returns true if coordinates are within the Srikakulam operational bounding box.
 */
export function isWithinSrikakulam(coords) {
  if (!coords || !Array.isArray(coords) || coords.length < 2) return false;
  const [lon, lat] = coords;
  const [[minLon, minLat], [maxLon, maxLat]] = OPERATIONAL_BOUNDS;
  const valid = lon >= minLon && lon <= maxLon && lat >= minLat && lat <= maxLat;
  if (!valid && process.env.NODE_ENV !== "production") {
    console.warn(`[AERT GEOGRAPHY ALERT] Coordinates [${lon}, ${lat}] fall outside Srikakulam district bounds.`);
  }
  return valid;
}

/**
 * Fallback clamp to ensure no component can ever escape Srikakulam bounds
 */
export function clampToSrikakulam(coords) {
  if (isWithinSrikakulam(coords)) return coords;
  return [...SRIKAKULAM_CENTER];
}
