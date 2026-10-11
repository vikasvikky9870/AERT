/**
 * AERT 3.0 Unified Operational State Store
 * Operational Sector: Srikakulam District, Andhra Pradesh, India (AP-SKLM-EOC-01)
 * 
 * Provides a single source of operational truth across all 10 workspaces:
 * - Incidents Lifecycle & Priority Queue
 * - Fleet Responders Telemetry & Status
 * - Medical Network & Trauma Readiness
 * - Road Intelligence & Active Closures
 * - AI Multi-Agent Recommendations & Audit Trail
 * - Simulation Timeline & Scenario Injections
 * - Live Event Stream & Telemetry
 */

import {
  SRIKAKULAM_CENTER,
  KNOWN_LANDMARKS,
  HOSPITAL_COORDINATES,
  AMBULANCE_DEPOTS,
  INCIDENT_PRESETS
} from '../config/geography';
import * as api from '../api';
import { soundManager } from '../services/soundManager';

// Initial Seed Data strictly in Srikakulam District
const INITIAL_INCIDENTS = [
  {
    id: 'INC-1042',
    type: 'Major Highway Collision',
    severity: 'CRITICAL',
    location: 'NH-16 Bypass Junction',
    coordinates: [83.9050, 18.3050],
    reported_at: new Date(Date.now() - 2 * 60000).toISOString(),
    lifecycle_status: 'DISPATCHED',
    status: 'ACTIVE',
    victims: 6,
    critical_victims: 2,
    hazard_type: 'Highway Entrapment / Fuel Spill',
    assigned_ambulance: 'AMB-003',
    assigned_hospital: 'HOS-002',
    location_confidence: 96,
    notes: 'Multi-vehicle collision on long-distance freight corridor. Heavy entrapment.',
    timeline: [
      { timestamp: '14:30:12', event: 'Emergency 108 call received from eyewitness.' },
      { timestamp: '14:30:45', event: 'AI multi-agent assessment completed with 96% confidence.' },
      { timestamp: '14:31:10', event: 'Operator approved ALS unit AMB-003 dispatch.' },
      { timestamp: '14:31:25', event: 'AMB-003 en route with cyan vector guidance.' }
    ]
  },
  {
    id: 'INC-1043',
    type: 'Vehicle Collision',
    severity: 'HIGH',
    location: 'Palakonda Road Near Collectorate',
    coordinates: [83.8920, 18.2980],
    reported_at: new Date(Date.now() - 8 * 60000).toISOString(),
    lifecycle_status: 'ON_SCENE',
    status: 'ACTIVE',
    victims: 3,
    critical_victims: 1,
    hazard_type: 'Road Debris & Head Trauma',
    assigned_ambulance: 'AMB-004',
    assigned_hospital: 'HOS-001',
    location_confidence: 94,
    notes: 'Commercial transit overturn blocking west arterial lane.',
    timeline: [
      { timestamp: '14:24:00', event: 'Call intake registered via Police Control Room.' },
      { timestamp: '14:24:40', event: 'BLS unit AMB-004 dispatched from Collectorate depot.' },
      { timestamp: '14:28:15', event: 'AMB-004 arrived on scene. First aid initiated.' }
    ]
  },
  {
    id: 'INC-1044',
    type: 'Medical Emergency / Cardiac',
    severity: 'HIGH',
    location: '7 Road Junction Central',
    coordinates: [83.8961, 18.2969],
    reported_at: new Date(Date.now() - 14 * 60000).toISOString(),
    lifecycle_status: 'TRANSPORTING',
    status: 'ACTIVE',
    victims: 1,
    critical_victims: 1,
    hazard_type: 'Time-Critical ALS Required',
    assigned_ambulance: 'AMB-001',
    assigned_hospital: 'HOS-001',
    location_confidence: 99,
    notes: 'Elderly patient with acute myocardial infarction. Oxygen and ECG active.',
    timeline: [
      { timestamp: '14:18:10', event: 'Direct citizen call intake.' },
      { timestamp: '14:19:02', event: 'ALS unit AMB-001 dispatched with siren.' },
      { timestamp: '14:22:30', event: 'Patient stabilized on board. En route to GGH ER.' }
    ]
  },
  {
    id: 'INC-1045',
    type: 'Building Fire',
    severity: 'CRITICAL',
    location: 'Singupuram Industrial Sector',
    coordinates: [83.8650, 18.3200],
    reported_at: new Date(Date.now() - 25 * 60000).toISOString(),
    lifecycle_status: 'TRIAGE',
    status: 'ACTIVE',
    victims: 10,
    critical_victims: 3,
    hazard_type: 'Toxic Vapor Release',
    assigned_ambulance: null,
    assigned_hospital: null,
    location_confidence: 91,
    notes: 'Chemical warehouse smoke explosion. Multi-casualty triage active.',
    timeline: [
      { timestamp: '14:07:30', event: 'Industrial alarm triggered automatic dispatch alert.' },
      { timestamp: '14:08:15', event: 'Intake Agent flagged HAZMAT Level 2.' }
    ]
  }
];

const INITIAL_AMBULANCES = [
  {
    id: 'AMB-001',
    name: 'GGH Central Ambulance 01',
    type: 'ALS',
    depot_id: 'DEPOT-01',
    status: 'TRANSPORTING',
    coordinates: [83.8980, 18.2990],
    speed_kmh: 52,
    heading_deg: 45,
    fuel_level: 88,
    battery_level: 94,
    crew: 'Dr. Rao (Paramedic), K. Suresh (Driver)',
    current_incident_id: 'INC-1044',
    eta_mins: 3.2,
    telemetry: { o2_status: 'NOMINAL', defib_ready: true, vitals_link: 'ONLINE' }
  },
  {
    id: 'AMB-002',
    name: 'GGH ALS Rapid Responder',
    type: 'ALS',
    depot_id: 'DEPOT-01',
    status: 'AVAILABLE',
    coordinates: [83.8965, 18.2972],
    speed_kmh: 0,
    heading_deg: 0,
    fuel_level: 96,
    battery_level: 99,
    crew: 'S. Naidu (Paramedic), P. Kumar (Driver)',
    current_incident_id: null,
    eta_mins: null,
    telemetry: { o2_status: 'NOMINAL', defib_ready: true, vitals_link: 'STANDBY' }
  },
  {
    id: 'AMB-003',
    name: 'NH-16 Highway Emergency Unit',
    type: 'ALS',
    depot_id: 'DEPOT-02',
    status: 'EN_ROUTE',
    coordinates: [83.9030, 18.3030],
    speed_kmh: 68,
    heading_deg: 38,
    fuel_level: 92,
    battery_level: 89,
    crew: 'Dr. Ananya (Trauma Specialist), V. Ramesh (Driver)',
    current_incident_id: 'INC-1042',
    eta_mins: 1.8,
    telemetry: { o2_status: 'NOMINAL', defib_ready: true, vitals_link: 'ONLINE' }
  },
  {
    id: 'AMB-004',
    name: 'Collectorate Standby Unit',
    type: 'BLS',
    depot_id: 'DEPOT-03',
    status: 'ON_SCENE',
    coordinates: [83.8920, 18.2980],
    speed_kmh: 0,
    heading_deg: 180,
    fuel_level: 76,
    battery_level: 82,
    crew: 'M. Apparao (EMT), T. Jagannath (Driver)',
    current_incident_id: 'INC-1043',
    eta_mins: 0,
    telemetry: { o2_status: 'NOMINAL', defib_ready: false, vitals_link: 'ONLINE' }
  },
  {
    id: 'AMB-005',
    name: 'Amadalavalasa Sector Post Unit',
    type: 'BLS',
    depot_id: 'DEPOT-04',
    status: 'AVAILABLE',
    coordinates: [83.9250, 18.2750],
    speed_kmh: 0,
    heading_deg: 90,
    fuel_level: 84,
    battery_level: 90,
    crew: 'B. Raju (EMT), Ch. Venkat (Driver)',
    current_incident_id: null,
    eta_mins: null,
    telemetry: { o2_status: 'NOMINAL', defib_ready: false, vitals_link: 'STANDBY' }
  }
];

const INITIAL_HOSPITALS = [
  {
    id: 'HOS-001',
    name: 'Government General Hospital (GGH) Srikakulam',
    trauma_level: 'Level 1 Trauma Center',
    coordinates: [83.8980, 18.2990],
    total_beds: 250,
    occupied_beds: 178,
    er_capacity: 82,
    icu_total: 30,
    icu_occupied: 22,
    icu_capacity: 73,
    ventilators_total: 18,
    ventilators_available: 5,
    blood_bank_status: 'ADEQUATE',
    ct_scan_ready: true,
    burn_unit_ready: true,
    active_pre_alerts: 2,
    distance_km: 1.2,
    current_eta_mins: 3.5
  },
  {
    id: 'HOS-002',
    name: 'RIMS Srikakulam Super Specialty',
    trauma_level: 'Level 2 Trauma Center',
    coordinates: [83.9080, 18.3100],
    total_beds: 350,
    occupied_beds: 210,
    er_capacity: 60,
    icu_total: 45,
    icu_occupied: 25,
    icu_capacity: 55,
    ventilators_total: 25,
    ventilators_available: 11,
    blood_bank_status: 'OPTIMAL',
    ct_scan_ready: true,
    burn_unit_ready: true,
    active_pre_alerts: 1,
    distance_km: 3.4,
    current_eta_mins: 7.2
  },
  {
    id: 'HOS-003',
    name: 'District Community Trauma Care Center',
    trauma_level: 'Level 3 Emergency Center',
    coordinates: [83.8890, 18.2920],
    total_beds: 100,
    occupied_beds: 42,
    er_capacity: 42,
    icu_total: 10,
    icu_occupied: 4,
    icu_capacity: 40,
    ventilators_total: 6,
    ventilators_available: 3,
    blood_bank_status: 'MODERATE',
    ct_scan_ready: false,
    burn_unit_ready: false,
    active_pre_alerts: 0,
    distance_km: 2.1,
    current_eta_mins: 5.0
  }
];

const INITIAL_ROAD_EVENTS = [
  {
    id: 'RD-001',
    type: 'Accident Debris Hazard',
    description: 'Debris field and oil slick on NH-16 Northbound connector.',
    corridor: 'NH-16 Srikakulam Bypass',
    road_class: 'National Highway',
    coordinates: [83.9045, 18.3045],
    radius_km: 0.8,
    delay_multiplier: 1.8,
    is_active: true
  },
  {
    id: 'RD-002',
    type: 'Monsoon Waterlogging',
    description: 'Temporary water accumulation near Nagavali Causeway.',
    corridor: 'Nagavali River Road',
    road_class: 'State Arterial',
    coordinates: [83.8880, 18.3010],
    radius_km: 1.2,
    delay_multiplier: 1.4,
    is_active: false
  }
];

class OperationalStore {
  constructor() {
    this.listeners = new Set();
    this.state = {
      backendStatus: 'CONNECTING', // 'ONLINE' | 'OFFLINE' | 'DEGRADED'
      activeWorkspace: '01 OVERWATCH', // 01 to 10
      spatialMode: 'map', // 'map' | 'twin'
      cameraPreset: 'OPERATIONAL', // 'OPERATIONAL' | 'INCIDENT_FOCUS' | 'RESPONDER_FOLLOW' | 'DRONE' | 'DISTRICT_OVERVIEW'
      selectedEntity: null, // { type: 'incident'|'ambulance'|'hospital', data: ... }
      
      // Domain Collections
      incidents: INITIAL_INCIDENTS,
      ambulances: INITIAL_AMBULANCES,
      hospitals: INITIAL_HOSPITALS,
      roadEvents: INITIAL_ROAD_EVENTS,
      
      // Active Tactical Vectors
      activeRoute: {
        geometry: {
          type: 'LineString',
          coordinates: [
            [83.8980, 18.2990],
            [83.9010, 18.3010],
            [83.9050, 18.3050]
          ]
        },
        originId: 'AMB-003',
        destinationId: 'INC-1042',
        distance_km: 3.4,
        eta_mins: 1.8,
        color: '#00f0ff'
      },
      
      // Real-time Event Stream
      eventStream: [
        { id: 'evt-1', time: '14:30:12', level: 'CRITICAL', text: 'INC-1042: Multi-vehicle crash reported on NH-16 Bypass.' },
        { id: 'evt-2', time: '14:30:45', level: 'AI', text: 'Intake Agent extracted 6 casualties. ALS required.' },
        { id: 'evt-3', time: '14:31:10', level: 'DISPATCH', text: 'Commander approved ALS Unit AMB-003 dispatch.' },
        { id: 'evt-4', time: '14:31:25', level: 'FLEET', text: 'AMB-003 active cyan vector routing engaged.' }
      ],
      
      // Audit Log for Human-in-the-Loop Actions
      auditLogs: [
        {
          id: 'aud-001',
          timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
          actor: 'OPERATOR_COMMANDER',
          action: 'DISPATCH_APPROVAL',
          incident_id: 'INC-1042',
          details: 'Approved AI recommended ALS unit AMB-003 for NH-16 collision.'
        }
      ],
      
      // Simulation State
      simulation: {
        active: false,
        scenarioId: 'nh16_collision',
        timeOffsetSec: 0,
        maxDurationSec: 1800,
        playbackSpeed: 1, // 1, 2, 5, 10
        isPlaying: false,
        injectedHazards: []
      },
      
      // UI Modals & Drawers
      modals: {
        commandPalette: false,
        goldenSlice: false,
        callIntake: false,
        overrideModal: null,
        hospitalPreAlert: null,
        sitrepModal: false
      }
    };
    
    // Auto-sync with backend on load
    this.syncWithBackend();
  }

  getState() {
    return this.state;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  setState(updater) {
    if (typeof updater === 'function') {
      this.state = { ...this.state, ...updater(this.state) };
    } else {
      this.state = { ...this.state, ...updater };
    }
    this.notify();
  }

  // -------------------------------------------------------------
  // BACKEND SYNCHRONIZATION
  // -------------------------------------------------------------
  async syncWithBackend() {
    try {
      const [incidentsRes, ambulancesRes, hospitalsRes, roadEventsRes] = await Promise.all([
        api.getIncidents().catch(() => null),
        api.getAmbulances().catch(() => null),
        api.getHospitals().catch(() => null),
        api.getRoadEvents().catch(() => null)
      ]);

      if (incidentsRes && incidentsRes.incidents) {
        this.setState({
          backendStatus: 'ONLINE',
          incidents: incidentsRes.incidents.length > 0 ? incidentsRes.incidents : this.state.incidents,
          ambulances: ambulancesRes?.ambulances?.length > 0 ? ambulancesRes.ambulances : this.state.ambulances,
          hospitals: hospitalsRes?.hospitals?.length > 0 ? hospitalsRes.hospitals : this.state.hospitals,
          roadEvents: roadEventsRes?.road_events?.length > 0 ? roadEventsRes.road_events : this.state.roadEvents
        });
      } else {
        this.setState({ backendStatus: 'OFFLINE' });
      }
    } catch {
      this.setState({ backendStatus: 'OFFLINE' });
    }
  }

  // -------------------------------------------------------------
  // OPERATIONAL WORKSPACE & SPATIAL ACTIONS
  // -------------------------------------------------------------
  setWorkspace(workspaceId) {
    soundManager.playClickTone();
    this.setState({ activeWorkspace: workspaceId });
    this.addEventLog('NAV', `Switched workspace lens to ${workspaceId}`);
  }

  setSpatialMode(mode) {
    soundManager.playClickTone();
    this.setState({ spatialMode: mode });
  }

  setCameraPreset(preset) {
    soundManager.playClickTone();
    this.setState({ cameraPreset: preset });
  }

  setSelectedEntity(entity) {
    soundManager.playClickTone();
    this.setState({ selectedEntity: entity });
  }

  // -------------------------------------------------------------
  // INCIDENT LIFECYCLE & DISPATCH ENGINE
  // -------------------------------------------------------------
  async createIncident(incidentData) {
    soundManager.playCriticalAlert();
    const newInc = {
      id: `INC-${Math.floor(1000 + Math.random() * 9000)}`,
      type: incidentData.type,
      severity: incidentData.severity || 'CRITICAL',
      location: incidentData.location,
      coordinates: incidentData.coordinates || SRIKAKULAM_CENTER,
      reported_at: new Date().toISOString(),
      lifecycle_status: 'TRIAGE',
      status: 'ACTIVE',
      victims: incidentData.victims ?? 0,
      critical_victims: incidentData.critical_victims || 0,
      hazard_type: incidentData.hazard_type || 'Standard',
      assigned_ambulance: null,
      assigned_hospital: null,
      location_confidence: incidentData.location_confidence ?? null,
      location_source: incidentData.location_source || 'Operator entered; not independently verified',
      notes: incidentData.notes || 'No additional notes recorded.',
      timeline: [
        { timestamp: new Date().toLocaleTimeString(), event: 'Emergency incident created in Srikakulam sector.' }
      ]
    };

    // Optimistic local state update
    this.setState((prev) => ({
      incidents: [newInc, ...prev.incidents],
      selectedEntity: { type: 'incident', coordinates: newInc.coordinates, data: newInc }
    }));

    this.addEventLog('CRITICAL', `NEW INCIDENT: ${newInc.id} (${newInc.type}) at ${newInc.location}`);
    this.recordAudit('INCIDENT_CREATED', newInc.id, `Created ${newInc.type} with ${newInc.victims} casualties.`);

    // Async sync with backend
    try {
      await api.createIncident({
        type: newInc.type,
        location: newInc.location,
        severity: newInc.severity,
        victims: newInc.victims,
        critical_victims: newInc.critical_victims,
        hazard_type: newInc.hazard_type,
        coordinates: newInc.coordinates,
        notes: newInc.notes
      });
    } catch {
      // Backend offline fallback handled gracefully
    }

    return newInc;
  }

  async transitionIncidentLifecycle(incidentId, nextLifecycle, ambulanceId = null, hospitalId = null, actor = 'OPERATOR_COMMANDER') {
    soundManager.playDispatchConfirmation();
    
    this.setState((prev) => {
      const updatedIncidents = prev.incidents.map((inc) => {
        if (inc.id === incidentId) {
          const currentTimeline = inc.timeline || [];
          return {
            ...inc,
            lifecycle_status: nextLifecycle,
            assigned_ambulance: ambulanceId || inc.assigned_ambulance,
            assigned_hospital: hospitalId || inc.assigned_hospital,
            status: nextLifecycle === 'RESOLVED' ? 'RESOLVED' : 'ACTIVE',
            timeline: [
              ...currentTimeline,
              { timestamp: new Date().toLocaleTimeString(), event: `Lifecycle updated to ${nextLifecycle} by ${actor}.` }
            ]
          };
        }
        return inc;
      });

      // Update ambulance status if assigned
      let updatedAmbulances = prev.ambulances;
      if (ambulanceId) {
        updatedAmbulances = prev.ambulances.map((amb) => {
          if (amb.id === ambulanceId) {
            let newAmbStatus = 'EN_ROUTE';
            if (nextLifecycle === 'ON_SCENE') newAmbStatus = 'ON_SCENE';
            if (nextLifecycle === 'TRANSPORTING') newAmbStatus = 'TRANSPORTING';
            if (nextLifecycle === 'RESOLVED') newAmbStatus = 'AVAILABLE';
            return {
              ...amb,
              status: newAmbStatus,
              current_incident_id: nextLifecycle === 'RESOLVED' ? null : incidentId
            };
          }
          return amb;
        });
      }

      return {
        incidents: updatedIncidents,
        ambulances: updatedAmbulances
      };
    });

    this.addEventLog('DISPATCH', `${incidentId} transitioned to ${nextLifecycle} (Unit: ${ambulanceId || 'N/A'})`);
    this.recordAudit('LIFECYCLE_TRANSITION', incidentId, `Status transitioned to ${nextLifecycle}`);

    try {
      await api.updateIncidentLifecycle(incidentId, {
        lifecycle_status: nextLifecycle,
        ambulance_id: ambulanceId,
        hospital_id: hospitalId,
        actor
      });
    } catch {}
  }

  async recordOverride(incidentId, selectedAmbId, selectedHosId, aiAmbId, aiHosId, reason) {
    soundManager.playClickTone();
    this.recordAudit('OPERATOR_OVERRIDE', incidentId, `Overrode AI rec (${aiAmbId} -> ${selectedAmbId}). Reason: ${reason}`);
    this.addEventLog('OVERRIDE', `Operator override on ${incidentId}: Selected ${selectedAmbId}`);
    
    await this.transitionIncidentLifecycle(incidentId, 'DISPATCHED', selectedAmbId, selectedHosId);

    try {
      await api.recordOperatorOverride(incidentId, {
        selected_ambulance_id: selectedAmbId,
        selected_hospital_id: selectedHosId,
        ai_recommended_ambulance_id: aiAmbId,
        ai_recommended_hospital_id: aiHosId,
        override_reason: reason
      });
    } catch {}
  }

  async updateAmbulanceStatus(ambulanceId, nextStatus) {
    soundManager.playClickTone();
    this.setState((prev) => ({
      ambulances: prev.ambulances.map((amb) =>
        amb.id === ambulanceId ? { ...amb, status: nextStatus } : amb
      )
    }));
    this.addEventLog('FLEET', `Unit ${ambulanceId} status changed to ${nextStatus}`);
    try {
      await api.setAmbulanceStatus(ambulanceId, nextStatus);
    } catch {}
  }

  async sendHospitalPreAlert(preAlertData) {
    soundManager.playPreAlertTone();
    this.addEventLog('MEDICAL', `Training pre-alert record created for ${preAlertData.hospital_id} · ${preAlertData.incident_id}; no facility contacted`);
    this.recordAudit('TRAINING_PREALERT_RECORD', preAlertData.incident_id, `Training record only; no facility contact. Fixture ETA: ${preAlertData.estimated_eta_mins} mins`);
    
    // Increment active pre-alerts on hospital node
    this.setState((prev) => ({
      hospitals: prev.hospitals.map((h) => {
        if (h.id === preAlertData.hospital_id) {
          return { ...h, active_pre_alerts: (h.active_pre_alerts || 0) + 1 };
        }
        return h;
      })
    }));

    try {
      await api.sendHospitalPreAlert(preAlertData);
    } catch {}
  }

  // -------------------------------------------------------------
  // SIMULATION ENGINE ACTIONS
  // -------------------------------------------------------------
  startSimulation(scenarioId = 'nh16_collision') {
    soundManager.playClickTone();
    this.setState((prev) => ({
      simulation: {
        ...prev.simulation,
        active: true,
        scenarioId,
        isPlaying: true,
        timeOffsetSec: 0
      }
    }));
    this.addEventLog('SIM', `Simulation scenario initialized: ${scenarioId}`);
  }

  pauseSimulation() {
    this.setState((prev) => ({
      simulation: { ...prev.simulation, isPlaying: false }
    }));
  }

  resumeSimulation() {
    this.setState((prev) => ({
      simulation: { ...prev.simulation, isPlaying: true }
    }));
  }

  setSimulationSpeed(speed) {
    soundManager.playClickTone();
    this.setState((prev) => ({
      simulation: { ...prev.simulation, playbackSpeed: speed }
    }));
  }

  injectSimulationHazard(hazardType, location) {
    soundManager.playCriticalAlert();
    const newHazard = {
      id: `SIM-HAZ-${Date.now()}`,
      type: hazardType,
      location,
      injectedAt: new Date().toLocaleTimeString()
    };

    this.setState((prev) => ({
      simulation: {
        ...prev.simulation,
        injectedHazards: [...prev.simulation.injectedHazards, newHazard]
      },
      roadEvents: [
        {
          id: newHazard.id,
          type: hazardType,
          description: `Simulated hazard: ${hazardType} at ${location}`,
          corridor: 'NH-16 Srikakulam Corridor',
          road_class: 'National Highway',
          coordinates: [83.9050, 18.3050],
          radius_km: 1.5,
          delay_multiplier: 2.5,
          is_active: true
        },
        ...prev.roadEvents
      ]
    }));

    this.addEventLog('SIM_HAZARD', `Injected Hazard: ${hazardType} at ${location}. Recalculating route detours...`);
  }

  // -------------------------------------------------------------
  // EVENT STREAM & AUDIT TRAIL
  // -------------------------------------------------------------
  addEventLog(level, text) {
    const newEvt = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      time: new Date().toLocaleTimeString(),
      level,
      text
    };
    this.setState((prev) => ({
      eventStream: [newEvt, ...prev.eventStream.slice(0, 49)]
    }));
  }

  recordAudit(action, incidentId, details, actor = 'OPERATOR_COMMANDER') {
    const log = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor,
      action,
      incident_id: incidentId,
      details
    };
    this.setState((prev) => ({
      auditLogs: [log, ...prev.auditLogs]
    }));
  }

  toggleModal(modalKey, value) {
    soundManager.playClickTone();
    this.setState((prev) => ({
      modals: { ...prev.modals, [modalKey]: value !== undefined ? value : !prev.modals[modalKey] }
    }));
  }

  setActiveRoute(route) {
    this.setState((prev) => ({
      activeRoute: route
    }));
  }

  createRoadEvent(event) {
    this.setState((prev) => ({
      roadEvents: [event, ...(prev.roadEvents || [])]
    }));
  }
}

// Global Singleton Store Instance
export const operationalStore = new OperationalStore();

// React Hook for Operational State
import { useState, useEffect } from 'react';

export function useOperationalState() {
  const [state, setState] = useState(() => operationalStore.getState());

  useEffect(() => {
    const unsubscribe = operationalStore.subscribe((newState) => {
      setState(newState);
    });
    return unsubscribe;
  }, []);

  return {
    ...state,
    setWorkspace: (ws) => operationalStore.setWorkspace(ws),
    setSpatialMode: (mode) => operationalStore.setSpatialMode(mode),
    setCameraPreset: (cam) => operationalStore.setCameraPreset(cam),
    setSelectedEntity: (ent) => operationalStore.setSelectedEntity(ent),
    createIncident: (data) => operationalStore.createIncident(data),
    updateAmbulanceStatus: (id, st) => operationalStore.updateAmbulanceStatus(id, st),
    syncWithBackend: () => operationalStore.syncWithBackend(),
    transitionIncidentLifecycle: (id, st, amb, hos) => operationalStore.transitionIncidentLifecycle(id, st, amb, hos),
    recordOverride: (id, sAmb, sHos, aAmb, aHos, r) => operationalStore.recordOverride(id, sAmb, sHos, aAmb, aHos, r),
    sendHospitalPreAlert: (alert) => operationalStore.sendHospitalPreAlert(alert),
    startSimulation: (scId) => operationalStore.startSimulation(scId),
    pauseSimulation: () => operationalStore.pauseSimulation(),
    resumeSimulation: () => operationalStore.resumeSimulation(),
    setSimulationSpeed: (sp) => operationalStore.setSimulationSpeed(sp),
    injectSimulationHazard: (haz, loc) => operationalStore.injectSimulationHazard(haz, loc),
    toggleModal: (key, val) => operationalStore.toggleModal(key, val)
  };
}
