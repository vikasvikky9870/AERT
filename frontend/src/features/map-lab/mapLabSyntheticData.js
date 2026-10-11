/**
 * AERT 3.0 Map Lab — Synthetic Prototype Spatial Entities
 * Sector: Srikakulam District, Andhra Pradesh, India
 * 
 * Demonstration data strictly for the Google Maps Platform technology spike.
 */

export const SRIKAKULAM_CENTER = { lat: 18.2969, lng: 83.8961 };

export const MAP_LAB_INCIDENT = {
  id: 'INC-SPIKE-01',
  title: 'NH-16 Multi-Vehicle Collision',
  severity: 'P1_CRITICAL',
  location: 'NH-16 Srikakulam Bypass Junction',
  position: { lat: 18.3050, lng: 83.9050 },
  victims: 6,
  entrapment: 2,
  description: 'Heavy commercial transport collision with structural cabin intrusion. Hazardous fuel runoff.'
};

export const MAP_LAB_AMBULANCES = [
  { id: 'ALS-003', tier: 'ALS', name: 'Rapid Trauma ALS-3', status: 'AVAILABLE', position: { lat: 18.2850, lng: 83.8850 }, speed_kmh: 58, heading: 42 },
  { id: 'ALS-004', tier: 'ALS', name: 'Corridor Unit ALS-4', status: 'EN_ROUTE', position: { lat: 18.2910, lng: 83.9180 }, speed_kmh: 62, heading: 310 },
  { id: 'ALS-001', tier: 'ALS', name: 'Municipal Core ALS-1', status: 'AVAILABLE', position: { lat: 18.2969, lng: 83.8961 }, speed_kmh: 0, heading: 0 },
  { id: 'ALS-002', tier: 'ALS', name: 'Arasavalli Post ALS-2', status: 'AVAILABLE', position: { lat: 18.2880, lng: 83.9150 }, speed_kmh: 0, heading: 90 },
  { id: 'BLS-001', tier: 'BLS', name: 'Seven Road BLS-1', status: 'AVAILABLE', position: { lat: 18.2990, lng: 83.8940 }, speed_kmh: 0, heading: 180 },
  { id: 'BLS-002', tier: 'BLS', name: 'Palakonda Depot BLS-2', status: 'AT_SCENE', position: { lat: 18.3250, lng: 83.8910 }, speed_kmh: 0, heading: 0 },
  { id: 'BLS-003', tier: 'BLS', name: 'Narasannapeta BLS-3', status: 'AVAILABLE', position: { lat: 18.3450, lng: 83.9450 }, speed_kmh: 52, heading: 220 },
  { id: 'BLS-004', tier: 'BLS', name: 'Nagavali South BLS-4', status: 'AVAILABLE', position: { lat: 18.2750, lng: 83.8780 }, speed_kmh: 0, heading: 0 },
  { id: 'BLS-005', tier: 'BLS', name: 'Amudalavalasa BLS-5', status: 'AVAILABLE', position: { lat: 18.2700, lng: 83.9300 }, speed_kmh: 48, heading: 45 },
  { id: 'BLS-006', tier: 'BLS', name: 'Highway Patrol BLS-6', status: 'AVAILABLE', position: { lat: 18.3180, lng: 83.9280 }, speed_kmh: 60, heading: 215 }
];

export const MAP_LAB_POLICE = [
  { id: 'PCR-01', name: 'Traffic Wing Unit 1', status: 'ON_PATROL', position: { lat: 18.2985, lng: 83.8985 } },
  { id: 'PCR-02', name: 'Town Police Interceptor', status: 'CORDON_DISPATCHED', position: { lat: 18.3030, lng: 83.9020 } },
  { id: 'PCR-03', name: 'Highway Interceptor 3', status: 'ON_PATROL', position: { lat: 18.3200, lng: 83.9200 } },
  { id: 'PCR-04', name: 'Nagavali Bridge Checkpost', status: 'STATIONARY', position: { lat: 18.2965, lng: 83.8850 } }
];

export const MAP_LAB_FIRE = [
  { id: 'FIRE-01', name: 'Srikakulam Heavy Tender 1', status: 'ACTIVE_DISPATCH', position: { lat: 18.2995, lng: 83.8935 } },
  { id: 'RESCUE-01', name: 'Hydraulic Extrication Squad', status: 'STANDBY', position: { lat: 18.2950, lng: 83.8900 } },
  { id: 'TENDER-02', name: 'Industrial Foam Tender', status: 'STANDBY', position: { lat: 18.3300, lng: 83.9100 } }
];

export const MAP_LAB_HOSPITALS = [
  {
    id: 'HOS-RIMS',
    name: 'RIMS Medical College & Hospital',
    type: 'LEVEL_1_TRAUMA',
    position: { lat: 18.3105, lng: 83.9080 },
    er_available: 8,
    icu_available: 3,
    ventilators: 5,
    blood_bank: 'A+, O+, B+ Active',
    trauma_status: 'RECEIVING_READY'
  },
  {
    id: 'HOS-APEX',
    name: 'Apex Life Care Hospital',
    type: 'MULTI_SPECIALTY',
    position: { lat: 18.2880, lng: 83.8950 },
    er_available: 4,
    icu_available: 1,
    ventilators: 2,
    trauma_status: 'CAPACITY_CONSTRAINED'
  },
  {
    id: 'HOS-SEVEN',
    name: 'Seven Hills Emergency Hospital',
    type: 'COMMUNITY_SURGICAL',
    position: { lat: 18.2810, lng: 83.8890 },
    er_available: 2,
    icu_available: 0,
    ventilators: 1,
    trauma_status: 'DIVERSION_STANDBY'
  }
];

export const MAP_LAB_ROUTES = [
  {
    id: 'ROUTE-A',
    label: 'Route A — NH-16 Direct Arterial',
    tag: 'BEST',
    eta: '06:12',
    distance_km: 4.2,
    color: '#00f0ff',
    casing: '#003344',
    weight: 5,
    path: [
      { lat: 18.2850, lng: 83.8850 },
      { lat: 18.2910, lng: 83.8910 },
      { lat: 18.2969, lng: 83.8961 },
      { lat: 18.3005, lng: 83.9000 },
      { lat: 18.3050, lng: 83.9050 }
    ]
  },
  {
    id: 'ROUTE-B',
    label: 'Route B — GT Road Municipal Corridor',
    tag: 'TRAFFIC',
    eta: '08:41',
    distance_km: 4.8,
    color: '#ff9500',
    casing: '#332000',
    weight: 3,
    path: [
      { lat: 18.2850, lng: 83.8850 },
      { lat: 18.2920, lng: 83.8890 },
      { lat: 18.2970, lng: 83.8940 },
      { lat: 18.3020, lng: 83.8990 },
      { lat: 18.3050, lng: 83.9050 }
    ]
  },
  {
    id: 'ROUTE-C',
    label: 'Route C — Palakonda Slip Bypass',
    tag: 'RISK',
    eta: '07:55',
    distance_km: 5.4,
    color: '#ff3b30',
    casing: '#330808',
    weight: 3,
    path: [
      { lat: 18.2850, lng: 83.8850 },
      { lat: 18.2950, lng: 83.8870 },
      { lat: 18.3100, lng: 83.8910 },
      { lat: 18.3150, lng: 83.8970 },
      { lat: 18.3050, lng: 83.9050 }
    ]
  }
];

export const MAP_LAB_HAZARD = {
  id: 'HAZ-SPIKE-01',
  name: 'Nagavali River Flood & Road Closure Risk',
  polygon: [
    { lat: 18.2800, lng: 83.8830 },
    { lat: 18.2920, lng: 83.8860 },
    { lat: 18.3050, lng: 83.8875 },
    { lat: 18.3200, lng: 83.8890 },
    { lat: 18.3400, lng: 83.8870 },
    { lat: 18.3400, lng: 83.8820 },
    { lat: 18.3200, lng: 83.8840 },
    { lat: 18.3050, lng: 83.8830 },
    { lat: 18.2920, lng: 83.8810 },
    { lat: 18.2800, lng: 83.8790 }
  ]
};
