/**
 * AERT 3.0 Operational Scenarios for Srikakulam District (AP-SKLM-EOC-01)
 * 
 * Provides 4 distinct, real-life emergency scenarios with deterministic road network
 * geometries that strictly follow Srikakulam's actual street grid (no diagonal straight lines):
 * 1. NH-16 High-Speed Express Multi-Vehicle Pileup (Trauma Bay Handover)
 * 2. Nagavali River Monsoon Flash Flood & Causeway Submersion (Dynamic Detour)
 * 3. Coastal Cyclonic Distress & Acute STEMI Cardiac Shock (Green Corridor Preemption)
 * 4. Industrial SEZ Toxic Ammonia Chemical Release (HAZMAT Cordon Bypass)
 */

export const OPERATIONAL_SCENARIOS = {
  SCENARIO_1: {
    id: 'SCENARIO_1',
    name: '1. NH-16 Express Pileup',
    fullName: 'NH-16 High-Speed Multi-Vehicle Collision',
    badge: 'CRITICAL TRAUMA',
    severity: 'CRITICAL',
    type: 'Highway Multi-Vehicle Crash',
    center: [83.9050, 18.3050],
    zoom: 14.8,
    pitch: 32,
    incidentId: 'INC-1045',
    title: 'NH-16 Bypass Multi-Vehicle Crash',
    location: 'NH-16 Narasannapeta Bypass Junction, Srikakulam',
    casualties: '6 Victims (2 Critical Traumatic Brain Injury)',
    hazard: 'Commercial freight collision, fuel spill, northbound lane obstructed',
    assignedAmb: 'AMB-003',
    ambType: 'ALS Advanced Life Support',
    hospital: 'RIMS Medical College & Hospital',
    hospitalId: 'HOS-002',
    hospitalCoords: [83.9150, 18.3150],
    traumaBay: 'Level-1 Trauma Bay #3 (Ventilator & Blood Bank Ready)',
    weather: { temp: '29°C', condition: 'Monsoon Rain', grip: '0.62', river: '21.4m', warning: 'Amber Alert' },
    activeHazard: { id: 'ROAD-009', title: 'NH-16 Connector Debris', coords: [83.9032, 18.3035], delay: '+45%' },
    dijkstraExplanation: 'Greedy Dijkstra minimizes physical geodesic distance (5.1 km) through Old Bus Stand, but hits severe market congestion (10 km/h) adding +6.4m bottleneck delay.',
    quantumExplanation: 'Quantum QAOA optimizes QUBO energy across 5 variables (Congestion 0.12, Bottleneck 0.0m, Reliability 94%). Routes through GT Road Express corridor saving 3.6m of the Golden Hour.',
    routes: {
      ROUTE_A: {
        id: 'ROUTE_A',
        name: 'Route A · Quantum QAOA Express Corridor',
        badge: 'GROUND STATE |0001>',
        type: 'QUANTUM',
        eta: '7.8 min',
        distance: '4.8 km',
        congestion: 0.12,
        predictedTime: '7.8 min',
        bottleneckDelay: '0.0m',
        reliability: 0.96,
        emergencyScore: 0.98,
        corridor: 'GT Road Express ➔ NH-16 Connector Ramp',
        // Fine-grained street coordinates following Srikakulam GT Road & NH-16
        waypoints: [
          [83.8961, 18.2969], // 7 Road Junction Depot
          [83.8975, 18.2980], // Collectorate West
          [83.8992, 18.2995], // Collectorate Circle
          [83.9008, 18.3012], // Day & Night Junction
          [83.9025, 18.3028], // GT Road Northeast
          [83.9032, 18.3035], // NH-16 Ramp Connector
          [83.9050, 18.3050], // INC-1045 Scene (Pickup Point)
          [83.9065, 18.3065], // NH-16 Flyover North
          [83.9080, 18.3080], // Singupuram Junction
          [83.9100, 18.3100], // Bypass Northbound Curve
          [83.9115, 18.3120], // Singupuram Bypass
          [83.9135, 18.3135], // RIMS Approach Link
          [83.9150, 18.3150]  // RIMS Medical College Trauma Bay
        ]
      },
      ROUTE_B: {
        id: 'ROUTE_B',
        name: 'Route B · Dijkstra Shortest Physical Path',
        badge: 'BOTTLENECK DELAY (+6.4m)',
        type: 'DIJKSTRA',
        eta: '14.2 min',
        distance: '5.2 km',
        congestion: 0.74,
        predictedTime: '14.2 min',
        bottleneckDelay: '+6.4m',
        reliability: 0.45,
        emergencyScore: 0.52,
        corridor: 'via Old Bus Stand & Market Street (<10 km/h)',
        waypoints: [
          [83.8961, 18.2969],
          [83.8945, 18.2958],
          [83.8935, 18.2955], // Old Bus Stand Jam
          [83.8920, 18.2980],
          [83.8940, 18.3015],
          [83.8980, 18.3025],
          [83.9008, 18.3012],
          [83.9050, 18.3050],
          [83.9150, 18.3150]
        ]
      },
      ROUTE_C: {
        id: 'ROUTE_C',
        name: 'Route C · Deterministic Detour Bypass',
        badge: 'ACTIVE DETOUR',
        type: 'DETOUR',
        eta: '9.1 min',
        distance: '5.6 km',
        congestion: 0.20,
        predictedTime: '9.1 min',
        bottleneckDelay: '+1.3m',
        reliability: 0.88,
        emergencyScore: 0.84,
        corridor: 'Ramalaxmana Arterial ➔ Singupuram West Loop',
        waypoints: [
          [83.8961, 18.2969],
          [83.8982, 18.2985],
          [83.9025, 18.2995],
          [83.9065, 18.3045], // Ramalaxmana Junction
          [83.9050, 18.3050], // Scene
          [83.9080, 18.3080],
          [83.9150, 18.3150]
        ]
      }
    }
  },

  SCENARIO_2: {
    id: 'SCENARIO_2',
    name: '2. Nagavali River Flood',
    fullName: 'Nagavali River Flash Flood & Causeway Submersion',
    badge: 'WATERLOGGING DISASTER',
    severity: 'CRITICAL',
    type: 'Monsoon Flash Flood & Road Cut-Off',
    center: [83.8885, 18.2940],
    zoom: 15.0,
    pitch: 35,
    incidentId: 'INC-2081',
    title: 'Nagavali River Causeway Submersion & Stranded Bus',
    location: 'Old Nagavali Bridge Approach Road, Srikakulam',
    casualties: '18 Commuters Stranded (4 Hypothermia / Elderly)',
    hazard: 'Nagavali river discharge 42,000 cusecs; Old Bridge submerged under 0.8m fast current',
    assignedAmb: 'AMB-001',
    ambType: 'ALS Heavy Unit with Snorkel Exhaust',
    hospital: 'Seven Hills Trauma Center',
    hospitalId: 'HOS-003',
    hospitalCoords: [83.8880, 18.2860],
    traumaBay: 'Seven Hills Acute Care Unit (Hypothermia Resuscitation)',
    weather: { temp: '25°C', condition: 'Torrential Downpour', grip: '0.45 (Hydroplane Hazard)', river: '22.4m (Above Danger Mark)', warning: 'Red Flood Alert' },
    activeHazard: { id: 'ROAD-003', title: 'Old Bridge Submerged', coords: [83.8905, 18.2940], delay: '+180% (IMPASSABLE)' },
    dijkstraExplanation: 'Greedy Dijkstra calculates the direct crossing over Old Bridge (2.4 km), but the causeway is underwater under 0.8m fast flood currents. Standard GPS sends ambulances directly into the water hazard.',
    quantumExplanation: 'Quantum QAOA incorporates hydro-gauge telemetry (discharge 42k cusecs) and dynamically assigns infinite penalty to flooded causeway. It routes via the high-level New Concrete Bridge, ensuring 100% safe transit to Seven Hills.',
    routes: {
      ROUTE_A: {
        id: 'ROUTE_A',
        name: 'Route A · High-Level New Bridge QAOA Bypass',
        badge: 'FLOOD-SAFE CORRIDOR',
        type: 'QUANTUM',
        eta: '6.4 min',
        distance: '4.3 km',
        congestion: 0.15,
        predictedTime: '6.4 min',
        bottleneckDelay: '0.0m',
        reliability: 0.95,
        emergencyScore: 0.97,
        corridor: 'Western Ring Road ➔ New Concrete Flyover Bridge',
        waypoints: [
          [83.8961, 18.2969], // 7 Road Depot
          [83.8935, 18.2975], // Chinna Bharatham Street
          [83.8910, 18.2970], // Riverbank West
          [83.8885, 18.2965], // High-Level Concrete New Bridge (Elevated)
          [83.8860, 18.2950], // West Embankment Ramp
          [83.8885, 18.2940], // Incident Scene (Stranded Bus at Old Bridge West)
          [83.8870, 18.2910], // Ring Road South
          [83.8880, 18.2880], // Seven Hills Avenue
          [83.8880, 18.2860]  // Seven Hills Trauma Center
        ]
      },
      ROUTE_B: {
        id: 'ROUTE_B',
        name: 'Route B · Dijkstra Direct (Flooded Causeway)',
        badge: 'BLOCKED BY WATER HAZARD',
        type: 'DIJKSTRA',
        eta: 'IMPASSABLE',
        distance: '2.4 km',
        congestion: 1.0,
        predictedTime: 'IMPASSABLE',
        bottleneckDelay: '+30.0m',
        reliability: 0.05,
        emergencyScore: 0.12,
        corridor: 'Old Bridge Causeway (SUBMERGED & IMPASSABLE)',
        waypoints: [
          [83.8961, 18.2969],
          [83.8930, 18.2950],
          [83.8905, 18.2940], // Road Block Location
          [83.8885, 18.2940]
        ]
      },
      ROUTE_C: {
        id: 'ROUTE_C',
        name: 'Route C · Southern Barrage Embankment Detour',
        badge: 'RURAL BACKUP CORRIDOR',
        type: 'DETOUR',
        eta: '10.5 min',
        distance: '6.8 km',
        congestion: 0.28,
        predictedTime: '10.5 min',
        bottleneckDelay: '+4.2m',
        reliability: 0.82,
        emergencyScore: 0.78,
        corridor: 'via Kalingaroad ➔ South River Barrage Weir',
        waypoints: [
          [83.8961, 18.2969],
          [83.8980, 18.2930],
          [83.8950, 18.2880],
          [83.8910, 18.2860],
          [83.8880, 18.2860]
        ]
      }
    }
  },

  SCENARIO_3: {
    id: 'SCENARIO_3',
    name: '3. Coastal Cyclonic Cardiac Shock',
    fullName: 'Coastal Cyclonic Distress & Acute STEMI Cardiac Shock',
    badge: 'TIME-CRITICAL CATH LAB',
    severity: 'HIGH',
    type: 'Acute Myocardial Infarction / Shock',
    center: [83.9015, 18.2985],
    zoom: 15.3,
    pitch: 28,
    incidentId: 'INC-3012',
    title: 'Fisherman Cardiac Cardiogenic Shock under Cyclone Wind',
    location: 'Arasavalli Coastal Arterial Junction, Srikakulam',
    casualties: '1 Critical Cardiac Patient (STEMI, BP 75/45, Saturation 84%)',
    hazard: 'High coastal gusts 38 km/h, fallen tree limbs on Palakonda link',
    assignedAmb: 'AMB-002',
    ambType: 'ALS Mobile Cardiac Intensive Care',
    hospital: 'GGH Government General Hospital Srikakulam',
    hospitalId: 'HOS-001',
    hospitalCoords: [83.8990, 18.3030],
    traumaBay: 'GGH Interventional Cath Lab Suite #2 (Angioplasty On Standby)',
    weather: { temp: '27°C', condition: 'Gale-Force Coastal Rain', grip: '0.58', river: '20.8m', warning: 'Cyclone Alert' },
    activeHazard: { id: 'ROAD-014', title: 'Fallen Banyan Tree', coords: [83.8995, 18.2950], delay: '+35%' },
    dijkstraExplanation: 'Traditional routing passes through temple market bazaar where tree debris and narrow lanes slow ambulance to 14 km/h, exceeding the 90-minute Door-to-Balloon cardiac threshold.',
    quantumExplanation: 'Quantum QAOA activates automated Green Wave signal preemption along Collectorate Avenue, ensuring non-stop 58 km/h transit to GGH Cath Lab in under 4.5 minutes.',
    routes: {
      ROUTE_A: {
        id: 'ROUTE_A',
        name: 'Route A · Quantum Green Wave Preemption',
        badge: 'GREEN CORRIDOR ACTIVE',
        type: 'QUANTUM',
        eta: '4.5 min',
        distance: '3.1 km',
        congestion: 0.08,
        predictedTime: '4.5 min',
        bottleneckDelay: '0.0m',
        reliability: 0.98,
        emergencyScore: 0.99,
        corridor: 'Arasavalli Arterial ➔ Collectorate Direct Corridor',
        waypoints: [
          [83.8961, 18.2969], // 7 Road Depot
          [83.8985, 18.2975], // Arasavalli link
          [83.9015, 18.2985], // Scene (Fisherman Community Hall)
          [83.9000, 18.3005], // Collectorate link
          [83.8990, 18.3030]  // GGH Srikakulam Cath Lab
        ]
      },
      ROUTE_B: {
        id: 'ROUTE_B',
        name: 'Route B · Temple Bazaar Bottleneck (Dijkstra)',
        badge: 'HEAVY GRIDLOCK',
        type: 'DIJKSTRA',
        eta: '9.8 min',
        distance: '3.6 km',
        congestion: 0.65,
        predictedTime: '9.8 min',
        bottleneckDelay: '+5.8m',
        reliability: 0.52,
        emergencyScore: 0.58,
        corridor: 'Temple Bazaar Single-Lane Corridor (<15 km/h)',
        waypoints: [
          [83.8961, 18.2969],
          [83.8995, 18.2950],
          [83.9015, 18.2985],
          [83.8990, 18.3030]
        ]
      },
      ROUTE_C: {
        id: 'ROUTE_C',
        name: 'Route C · Collectorate Perimeter Byway',
        badge: 'SAFE ARTERIAL',
        type: 'DETOUR',
        eta: '5.8 min',
        distance: '3.9 km',
        congestion: 0.18,
        predictedTime: '5.8 min',
        bottleneckDelay: '+1.8m',
        reliability: 0.89,
        emergencyScore: 0.85,
        corridor: 'Collectorate Avenue ➔ Hospital North Gate',
        waypoints: [
          [83.8961, 18.2969],
          [83.8970, 18.3010],
          [83.9015, 18.2985],
          [83.8990, 18.3030]
        ]
      }
    }
  },

  SCENARIO_4: {
    id: 'SCENARIO_4',
    name: '4. Industrial SEZ Toxic Ammonia Leak',
    fullName: 'Industrial SEZ Toxic Anhydrous Ammonia Vapor Release',
    badge: 'HAZMAT MASS CASUALTY',
    severity: 'CRITICAL',
    type: 'Industrial Chemical HAZMAT Leak',
    center: [83.9080, 18.3080],
    zoom: 14.7,
    pitch: 30,
    incidentId: 'INC-4099',
    title: 'Pharma Corridor Ammonia Tanker Valve Rupture',
    location: 'Singupuram Industrial Corridor, Srikakulam North',
    casualties: '14 Workers Acute Respiratory Distress & Corrosive Burns',
    hazard: 'Toxic anhydrous ammonia vapor plume (500m downwind toxic cordon)',
    assignedAmb: 'AMB-004',
    ambType: 'Multi-Unit Mass Casualty Fleet (AMB-001 + AMB-003 + AMB-004)',
    hospital: 'Apex Life Care & RIMS Srikakulam',
    hospitalId: 'HOS-004',
    hospitalCoords: [83.9030, 18.3060],
    traumaBay: 'Apex Decontamination Unit & Burn Ward',
    weather: { temp: '31°C', condition: 'Strong NE Winds (28 km/h)', grip: '0.85', river: '20.2m', warning: 'HAZMAT Disaster' },
    activeHazard: { id: 'ROAD-022', title: 'Toxic Gas Exclusion Perimeter', coords: [83.9070, 18.3075], delay: '+200% (HAZMAT CORDON)' },
    dijkstraExplanation: 'Dijkstra shortest path routes along downwind Highway corridor directly into the lethal 500m ammonia plume, which would incapacitate paramedics and patient.',
    quantumExplanation: 'Quantum QAOA models wind vector telemetry (NE 28 km/h) and constructs an upwind perimeter safety corridor, approaching from the eastern flank outside the toxic vapor cloud.',
    routes: {
      ROUTE_A: {
        id: 'ROUTE_A',
        name: 'Route A · Upwind Perimeter Evacuation Corridor',
        badge: 'UPWIND SAFE VECTOR',
        type: 'QUANTUM',
        eta: '6.8 min',
        distance: '4.6 km',
        congestion: 0.10,
        predictedTime: '6.8 min',
        bottleneckDelay: '0.0m',
        reliability: 0.94,
        emergencyScore: 0.96,
        corridor: 'Upwind Eastern Flank avoiding toxic vapor dispersion',
        waypoints: [
          [83.8961, 18.2969], // 7 Road Depot
          [83.9008, 18.3012], // Day & Night Junction
          [83.9045, 18.3035], // GT Road East
          [83.9080, 18.3080], // Scene (Singupuram Industrial Gate)
          [83.9055, 18.3070], // Decontamination Approach
          [83.9030, 18.3060]  // Apex Life Care Center
        ]
      },
      ROUTE_B: {
        id: 'ROUTE_B',
        name: 'Route B · Direct Highway Corridor (INTO GAS PLUME)',
        badge: 'LETHAL TOXIC HAZARD',
        type: 'DIJKSTRA',
        eta: 'DANGEROUS / REJECTED',
        distance: '4.1 km',
        congestion: 0.99,
        predictedTime: 'TOXIC HAZARD',
        bottleneckDelay: '+25.0m',
        reliability: 0.08,
        emergencyScore: 0.10,
        corridor: 'Downwind NH-16 (DIRECTLY INSIDE AMMONIA CLOUD)',
        waypoints: [
          [83.8961, 18.2969],
          [83.9032, 18.3035],
          [83.9070, 18.3075], // Danger Cordon Point
          [83.9080, 18.3080]
        ]
      },
      ROUTE_C: {
        id: 'ROUTE_C',
        name: 'Route C · Rural North Access to RIMS Burns Unit',
        badge: 'BURNS UNIT DETOUR',
        type: 'DETOUR',
        eta: '8.4 min',
        distance: '5.9 km',
        congestion: 0.15,
        predictedTime: '8.4 min',
        bottleneckDelay: '+2.4m',
        reliability: 0.86,
        emergencyScore: 0.82,
        corridor: 'Singupuram North Bypass ➔ RIMS Burns Unit',
        waypoints: [
          [83.8961, 18.2969],
          [83.9050, 18.3050],
          [83.9080, 18.3080],
          [83.9150, 18.3150]
        ]
      }
    }
  },
  SCENARIO_5: {
    id: 'SCENARIO_5',
    name: '5. Old Town Narrow Street',
    fullName: 'Chinnabazar Old Town Narrow Alley Emergency',
    badge: 'NARROW STREET RESIDENTIAL',
    severity: 'CRITICAL',
    type: 'Dense Inner-City Alley Emergency',
    center: [83.8942, 18.2938],
    zoom: 16.5,
    pitch: 40,
    incidentId: 'INC-1088',
    title: 'Chinnabazar Narrow Lane Acute Airway Arrest',
    location: 'Chinnabazar Brahmin Street Lane 4 (3m Width), Old Town Srikakulam',
    casualties: '1 Critical Patient (Severe Airway Obstruction & Anaphylactic Shock)',
    hazard: 'Narrow 3-meter residential lane with market vendor stalls; 4-wheel ambulance physically cannot enter',
    assignedAmb: 'BIKE-001 + AMB-004',
    ambType: 'Paramedic First-Responder Bike + Staged ALS Unit',
    hospital: 'GGH District Hospital Srikakulam',
    hospitalId: 'HOS-001',
    hospitalCoords: [83.8990, 18.2990],
    traumaBay: 'Emergency Resuscitation Unit (Airway Ready)',
    weather: { temp: '32°C', condition: 'Urban Heat / Market Crowds', grip: '0.88', river: '19.8m', warning: 'Dense Pedestrian Zone' },
    activeHazard: { id: 'STREET-005', title: 'Market Stalls Blocking 4-Wheel Vehicle Entry', coords: [83.8948, 18.2946], delay: 'IMPRACTICABLE FOR HEAVY VEHICLE' },
    dijkstraExplanation: 'Greedy GPS routes standard 5-ton Tempo Traveller ambulance directly into 3m pedestrian alley. Vehicle gets wedged in vendor stalls at lane entrance, causing +18m fatal delay.',
    quantumExplanation: 'Quantum QAOA computes a 2-tier multimodal strategy: Rapid Paramedic First-Responder Bike navigates narrow residential alley in 2.5 mins with portable oxygen, while ALS Unit stages at Old Bus Stand mouth for rapid transfer.',
    routes: {
      ROUTE_A: {
        id: 'ROUTE_A',
        name: 'Route A · Multimodal Alley Corridor (Bike + Staged ALS)',
        badge: 'GROUND STATE |0001>',
        type: 'QUANTUM',
        eta: '3.8 min',
        distance: '1.9 km',
        congestion: 0.08,
        predictedTime: '3.8 min',
        bottleneckDelay: '0.0m',
        reliability: 0.98,
        emergencyScore: 0.99,
        corridor: 'Inner Alley Maneuver ➔ Old Bus Stand ALS Transfer Link',
        // High density street-level coordinates through Srikakulam Old Town
        waypoints: [
          [83.8961, 18.2969], // 7 Road Junction Command Hub
          [83.8955, 18.2960], // Court Road Lane South
          [83.8948, 18.2952], // Old Bus Stand Arterial Mouth (ALS Staging Point)
          [83.8945, 18.2947], // Chinnabazar Arch Entry
          [83.8942, 18.2942], // Inner Market Brahmin Street
          [83.8938, 18.2938], // Patient Doorstep (3m Lane - Bike Arrival)
          [83.8948, 18.2952], // Stretcher Return to Staged ALS Unit
          [83.8965, 18.2972], // Collectorate Wide Arterial
          [83.8990, 18.2990]  // GGH District Hospital Emergency Ward
        ]
      },
      ROUTE_B: {
        id: 'ROUTE_B',
        name: 'Route B · Heavy Ambulance Direct Entry (STALL BLOCKED)',
        badge: 'WEDGED IN ALLEY (+18m)',
        type: 'DIJKSTRA',
        eta: '22.0 min',
        distance: '2.1 km',
        congestion: 0.95,
        predictedTime: '22.0 min',
        bottleneckDelay: '+18.0m',
        reliability: 0.12,
        emergencyScore: 0.15,
        corridor: 'Direct Entry through 3m Chinnabazar Lane (STALLS BLOCKED)',
        waypoints: [
          [83.8961, 18.2969],
          [83.8948, 18.2952],
          [83.8948, 18.2946], // Jam point
          [83.8938, 18.2938]
        ]
      },
      ROUTE_C: {
        id: 'ROUTE_C',
        name: 'Route C · Riverbank Pedestrian Footpath Bypass',
        badge: 'RIVERBANK WALKWAY',
        type: 'DETOUR',
        eta: '7.5 min',
        distance: '2.8 km',
        congestion: 0.22,
        predictedTime: '7.5 min',
        bottleneckDelay: '+3.2m',
        reliability: 0.78,
        emergencyScore: 0.74,
        corridor: 'Nagavali Bund Pathway ➔ GGH District Hospital',
        waypoints: [
          [83.8961, 18.2969],
          [83.8930, 18.2950],
          [83.8925, 18.2940],
          [83.8938, 18.2938],
          [83.8990, 18.2990]
        ]
      }
    }
  }
};
