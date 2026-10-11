/**
 * AERT 3.0 — High-Definition Srikakulam Spatial Cartographic Data
 * Sector: Srikakulam District, Andhra Pradesh, India (AP-SKLM-EOC-01)
 * 
 * Geographic Bounds: [83.7000, 18.1500] to [84.1500, 18.5000]
 * Operational Center: [83.8961, 18.2969] (7-Road Junction)
 */

// 1. Authentic Arterial Highway & Corridor Traces matching OSM/Esri Basemap
export const SRIKAKULAM_ROAD_NETWORK = {
  type: 'FeatureCollection',
  features: [
    // NH-16 Srikakulam Bypass (Golden Quadrilateral Expressway)
    {
      type: 'Feature',
      properties: {
        id: 'road-nh16',
        name: 'NH-16 Srikakulam Bypass Highway',
        road_class: 'HIGHWAY_PRIMARY',
        lanes: 4,
        speed_limit_kmh: 80
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [83.8750, 18.2750],
          [83.8860, 18.2860],
          [83.8961, 18.2969],
          [83.9050, 18.3050],
          [83.9180, 18.3180],
          [83.9350, 18.3350]
        ]
      }
    },
    // Palakonda Road (State Highway SH-37)
    {
      type: 'Feature',
      properties: {
        id: 'road-sh37',
        name: 'Palakonda Road (SH-37)',
        road_class: 'ARTERIAL_SECONDARY',
        lanes: 2,
        speed_limit_kmh: 50
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [83.8961, 18.2969],
          [83.8945, 18.3100],
          [83.8920, 18.3250],
          [83.8890, 18.3450]
        ]
      }
    }
  ]
};

// 2. Real-Time Traffic Segments (Corridors)
export const SRIKAKULAM_TRAFFIC_SEGMENTS = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        id: 'traf-nh16-open',
        corridor: 'NH-16 Srikakulam North',
        congestion: 'FREE_FLOW',
        speed_kmh: 72,
        color: '#30d158'
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [83.9050, 18.3050],
          [83.9180, 18.3180],
          [83.9350, 18.3350]
        ]
      }
    },
    {
      type: 'Feature',
      properties: {
        id: 'traf-gt-slow',
        corridor: 'GT Road Municipal Core',
        congestion: 'MODERATE',
        speed_kmh: 26,
        color: '#ff9500'
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [83.8890, 18.2920],
          [83.8961, 18.2969],
          [83.9050, 18.3050]
        ]
      }
    }
  ]
};

// 3. Realistic Environmental & Hazard Perimeters
export const SRIKAKULAM_HAZARD_ZONES = {
  type: 'FeatureCollection',
  features: [
    // Nagavali River Flood Basin (Tightly follows the river channel)
    {
      type: 'Feature',
      properties: {
        id: 'haz-flood-nagavali',
        type: 'FLOOD',
        name: 'Nagavali River Flood Spillway Basin',
        severity: 'HIGH_RISK',
        fillColor: '#0077ff',
        fillOpacity: 0.12,
        boundaryColor: '#00f0ff',
        alert: 'Monsoon discharge warning: River bank elevation margin +1.8m'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [83.8830, 18.2800],
          [83.8860, 18.2920],
          [83.8875, 18.3050],
          [83.8890, 18.3200],
          [83.8870, 18.3400],
          [83.8820, 18.3400],
          [83.8840, 18.3200],
          [83.8830, 18.3050],
          [83.8810, 18.2920],
          [83.8790, 18.2800],
          [83.8830, 18.2800]
        ]]
      }
    },
    // Fuel Spill / Hazardous Material Blast Buffer (around INC-001)
    {
      type: 'Feature',
      properties: {
        id: 'haz-blast-inc001',
        type: 'CHEMICAL_HAZMAT',
        name: 'NH-16 Freight Fuel Spill Vapour Hotzone',
        severity: 'CRITICAL',
        fillColor: '#ff3b30',
        fillOpacity: 0.18,
        boundaryColor: '#ff3b30',
        alert: 'Flammable diesel fuel plume (radius 300m) - Fire exclusion active'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [83.9030, 18.3035],
          [83.9070, 18.3035],
          [83.9080, 18.3065],
          [83.9045, 18.3075],
          [83.9020, 18.3055],
          [83.9030, 18.3035]
        ]]
      }
    }
  ]
};

// 4. Critical Infrastructure Nodes (Fire, Police, Helipads, Shelters)
export const SRIKAKULAM_INFRASTRUCTURE = [
  {
    id: 'INFRA-001',
    name: 'Srikakulam Central Fire Station',
    category: 'FIRE',
    coordinates: [83.8935, 18.2995],
    status: 'ACTIVE_RESPONSE',
    vehicles: '3 Water Tenders • 1 Rescue Tender',
    contact: '08942-222101'
  },
  {
    id: 'INFRA-002',
    name: 'Town Police Station Srikakulam',
    category: 'POLICE',
    coordinates: [83.8985, 18.2940],
    status: 'CORDON_DISPATCHED',
    units: 'Traffic Wing Unit 4 • PCR-02',
    contact: '08942-222233'
  },
  {
    id: 'INFRA-003',
    name: 'RIMS Emergency Trauma Helipad',
    category: 'HELIPAD',
    coordinates: [83.9080, 18.3105],
    status: 'OPERATIONAL',
    air_clearance: 'Unrestricted (Clear VFR)',
    accommodates: 'Air Ambulance HAL Dhruv / Bell 429'
  },
  {
    id: 'INFRA-004',
    name: 'Arasavalli Cyclone Shelter',
    category: 'SHELTER',
    coordinates: [83.9180, 18.2880],
    status: 'STANDBY',
    capacity: '1,200 Persons'
  },
  {
    id: 'INFRA-005',
    name: 'Nagavali Bypass Bridge',
    category: 'BRIDGE',
    coordinates: [83.8850, 18.2965],
    status: 'OPERATIONAL',
    load_limit: 'Dual Carriageway'
  }
];

// 5. Multi-Agent AI Candidate Routes Matrix (Curving along actual roads)
export const AI_CANDIDATE_ROUTES = [
  {
    id: 'ROUTE-A',
    label: 'Route A — NH-16 Direct Arterial',
    rank: 1,
    status: 'RECOMMENDED_OPTIMAL',
    distance_km: 4.2,
    eta_mins: 4.3,
    traffic_risk: 'LOW (Free Flow)',
    flood_exposure: 'NONE',
    color: '#00f0ff',
    width: 4.5,
    casingColor: '#003b4d',
    coordinates: [
      [83.8850, 18.2850],
      [83.8910, 18.2910],
      [83.8961, 18.2969],
      [83.9000, 18.3005],
      [83.9050, 18.3050],
      [83.9080, 18.3100]
    ]
  },
  {
    id: 'ROUTE-B',
    label: 'Route B — GT Road Municipal Corridor',
    rank: 2,
    status: 'SUB_OPTIMAL_TRAFFIC',
    distance_km: 4.8,
    eta_mins: 7.2,
    traffic_risk: 'HIGH (Bottleneck at Old Bridge +2m 50s)',
    flood_exposure: 'NONE',
    color: '#ff9500',
    width: 2.5,
    casingColor: '#3d2400',
    coordinates: [
      [83.8850, 18.2850],
      [83.8890, 18.2920],
      [83.8940, 18.2970],
      [83.8990, 18.3020],
      [83.9050, 18.3050],
      [83.9080, 18.3100]
    ]
  },
  {
    id: 'ROUTE-C',
    label: 'Route C — Palakonda Slip Bypass',
    rank: 3,
    status: 'HAZARD_BLOCKED',
    distance_km: 5.6,
    eta_mins: 8.5,
    traffic_risk: 'MODERATE',
    flood_exposure: 'HIGH (Nagavali River Flood Margin)',
    color: '#ff3b30',
    width: 2.0,
    casingColor: '#3d0a0a',
    coordinates: [
      [83.8850, 18.2850],
      [83.8870, 18.2950],
      [83.8910, 18.3100],
      [83.8970, 18.3150],
      [83.9050, 18.3050],
      [83.9080, 18.3100]
    ]
  }
];

// 6. Realistic Footprint Clusters (RIMS Campus, Municipal Complex, 7-Road)
export function generateSrikakulamUrbanExtrusions() {
  const features = [];

  // RIMS Medical College & Super Specialty Hospital Campus Footprint
  features.push({
    type: 'Feature',
    properties: { id: 'bld-rims-main', height: 26, isHospital: true },
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [83.9065, 18.3090],
        [83.9095, 18.3090],
        [83.9095, 18.3120],
        [83.9065, 18.3120],
        [83.9065, 18.3090]
      ]]
    }
  });

  // Collectorate & Government District Complex
  features.push({
    type: 'Feature',
    properties: { id: 'bld-govt-complex', height: 22, isGovernment: true },
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [83.8920, 18.2930],
        [83.8945, 18.2930],
        [83.8945, 18.2955],
        [83.8920, 18.2955],
        [83.8920, 18.2930]
      ]]
    }
  });

  // 7-Road Commercial Command Center
  features.push({
    type: 'Feature',
    properties: { id: 'bld-7road-center', height: 24, isGovernment: false },
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [83.8950, 18.2960],
        [83.8970, 18.2960],
        [83.8970, 18.2980],
        [83.8950, 18.2980],
        [83.8950, 18.2960]
      ]]
    }
  });

  return {
    type: 'FeatureCollection',
    features
  };
}
