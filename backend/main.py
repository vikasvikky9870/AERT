from datetime import datetime
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from call_intake import analyze_call_notes

from database import (
    init_database,
    get_incidents as db_get_incidents,
    get_incident as db_get_incident,
    create_incident as db_create_incident,
    update_incident_status as db_update_incident_status,
    update_incident_lifecycle as db_update_incident_lifecycle,
    record_operator_override as db_record_operator_override,
    get_ambulances as db_get_ambulances,
    update_ambulance_status as db_update_ambulance_status,
    get_hospitals as db_get_hospitals,
    create_hospital_pre_alert as db_create_hospital_pre_alert,
    get_hospital_pre_alerts as db_get_hospital_pre_alerts,
    get_road_events as db_get_road_events,
    create_road_event as db_create_road_event,
    set_road_event_active as db_set_road_event_active,
    delete_road_event as db_delete_road_event,
    save_response as db_save_response,
    get_response_history as db_get_response_history,
    get_audit_logs as db_get_audit_logs,
    get_analytics_summary as db_get_analytics_summary,
    reset_demo_scenario as db_reset_demo_scenario,
)
from intelligence import (
    build_recommendation,
    detect_resource_conflicts,
    copilot_query_reasoning,
)
from quantum_optimization import (
    run_quantum_dispatch_analysis,
    ml_traffic_engine,
)


# ============================================================
# AERT APPLICATION: NEXT-GEN EMERGENCY RESPONSE PLATFORM
# Operational Sector: Srikakulam District, Andhra Pradesh, India
# Default GIS Center: [83.8961, 18.2969]
# ============================================================

app = FastAPI(
    title="AERT Next-Gen Emergency Operations Platform API",
    description="AI Emergency Response & Traffic Intelligence Platform — Srikakulam Sector, AP, India",
    version="2.0.0",
)


# ============================================================
# CORS CONFIGURATION
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# DATABASE STARTUP
# ============================================================

@app.on_event("startup")
def startup_event():
    print("Initializing AERT Next-Gen Srikakulam database...")
    init_database()
    print("AERT Next-Gen database ready.")


# ============================================================
# PYDANTIC SCHEMAS WITH RIGID VALIDATION
# ============================================================

class IncidentCreate(BaseModel):
    type: str = Field(..., min_length=2, max_length=100)
    location: str = Field(..., min_length=2, max_length=150)
    severity: str = Field("MEDIUM", pattern="^(CRITICAL|HIGH|MEDIUM|LOW)$")
    victims: int = Field(1, ge=0, le=1000)
    critical_victims: Optional[int] = Field(0, ge=0, le=500)
    hazard_type: Optional[str] = "Standard"
    coordinates: List[float] = Field(..., min_length=2, max_length=2)
    location_source: Optional[str] = "Operator entered; not independently verified"
    location_confidence: Optional[int] = Field(None, ge=10, le=100)
    source_call: Optional[str] = None
    notes: Optional[str] = None


class IncidentLifecycleUpdate(BaseModel):
    lifecycle_status: str = Field(
        ...,
        pattern="^(CALL_RECEIVED|TRIAGE|VERIFIED|DISPATCH_PENDING|DISPATCHED|EN_ROUTE|ON_SCENE|TRANSPORTING|ARRIVED_HOSPITAL|RESOLVED)$",
    )
    ambulance_id: Optional[str] = None
    hospital_id: Optional[str] = None
    actor: Optional[str] = "OPERATOR_COMMANDER"
    notes: Optional[str] = None


class OperatorOverrideRequest(BaseModel):
    selected_ambulance_id: str
    selected_hospital_id: str
    ai_recommended_ambulance_id: Optional[str] = None
    ai_recommended_hospital_id: Optional[str] = None
    override_reason: str = Field(..., min_length=3, max_length=500)
    actor: Optional[str] = "OPERATOR_COMMANDER"


class AmbulanceStatusUpdate(BaseModel):
    status: str
    current_assignment: Optional[str] = None


class HospitalPreAlertCreate(BaseModel):
    incident_id: str
    hospital_id: str
    ambulance_id: str
    severity: str = "CRITICAL"
    patient_summary: str
    estimated_eta_mins: int = 10
    trauma_requirements: Optional[str] = "Trauma Bay & ICU Ready"


class RoadEventCreate(BaseModel):
    type: str = Field(..., min_length=2)
    description: str = Field(..., min_length=2)
    corridor: Optional[str] = "NH-16 Srikakulam Corridor"
    road_class: Optional[str] = "National Highway"
    longitude: float = Field(..., ge=-180.0, le=180.0)
    latitude: float = Field(..., ge=-90.0, le=90.0)
    radius_km: Optional[float] = Field(2.0, ge=0.2, le=30.0)
    delay_multiplier: Optional[float] = Field(1.3, ge=1.0, le=5.0)
    is_active: Optional[bool] = True


class RoadEventStatusUpdate(BaseModel):
    is_active: bool


class CopilotQueryRequest(BaseModel):
    prompt: str = Field(..., min_length=2, max_length=1000)


class CallNoteAnalysisRequest(BaseModel):
    transcript: str = Field(..., min_length=3, max_length=8000)


class SimulationRequest(BaseModel):
    type: str
    location: Optional[str] = "Hypothetical Srikakulam Point"
    severity: str = "CRITICAL"
    victims: int = Field(5, ge=0)
    critical_victims: Optional[int] = Field(1, ge=0)
    coordinates: List[float] = Field([83.9050, 18.3050], min_length=2, max_length=2)
    hazard_type: Optional[str] = "Standard"


# ============================================================
# ROOT & SYSTEM HEALTH
# ============================================================

@app.get("/")
def root():
    return {
        "system": "AERT",
        "name": "AI Emergency Response & Traffic Intelligence Platform",
        "sector": "Srikakulam District, Andhra Pradesh, India",
        "default_center_geojson": [83.8961, 18.2969],
        "status": "TRAINING_ONLY",
        "version": "2.0.0",
        "architecture": "Next-Gen EOC + GIS Command + Explainable Decision Support",
        "data_mode": "TRAINING / SEEDED FIXTURES",
        "data_honesty": "No live 108/112, ambulance AVL, hospital capacity, traffic, or official district GIS feed is connected. Seeded records and rule-based analysis are illustrative only.",
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "AERT Next-Gen Backend",
        "database": "SQLite (aert.db)",
        "sector": "Srikakulam District, AP",
        "data_mode": "TRAINING / SEEDED FIXTURES",
        "live_dispatch_enabled": False,
        "timestamp": datetime.now().isoformat(),
    }


# ============================================================
# INCIDENTS & LIFECYCLE API
# ============================================================

@app.get("/api/incidents")
def get_all_incidents():
    try:
        incidents = db_get_incidents()
        return {
            "count": len(incidents),
            "incidents": incidents,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/incidents/priority-queue")
def get_priority_queue():
    try:
        incidents = db_get_incidents()
        active_incidents = [i for i in incidents if i.get("status") == "ACTIVE"]

        ambulances = db_get_ambulances()
        hospitals = db_get_hospitals()
        road_events = db_get_road_events()

        scored_queue = []
        for inc in active_incidents:
            rec = build_recommendation(inc, ambulances, hospitals, road_events, incidents)
            scored_queue.append({
                "incident": inc,
                "priority_score": rec["priority_score"],
                "response_level": rec["response_level"],
                "recommended_ambulance": rec["recommended_ambulance"],
                "recommended_hospital": rec["recommended_hospital"],
                "has_conflict": rec["has_conflict"],
                "resource_gap": rec["resource_gap"],
            })

        scored_queue.sort(key=lambda x: x["priority_score"], reverse=True)
        return {
            "count": len(scored_queue),
            "priority_queue": scored_queue,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/incidents")
def create_incident(incident: IncidentCreate):
    try:
        lon, lat = float(incident.coordinates[0]), float(incident.coordinates[1])
        if not (-180 <= lon <= 180 and -90 <= lat <= 90):
            raise HTTPException(status_code=422, detail="Invalid GPS coordinates.")

        saved = db_create_incident({
            "type": incident.type,
            "location": incident.location,
            "severity": incident.severity,
            "victims": incident.victims,
            "critical_victims": incident.critical_victims or 0,
            "hazard_type": incident.hazard_type or "Standard",
            "coordinates": [lon, lat],
            "location_source": incident.location_source or "Operator entered; not independently verified",
            "location_confidence": incident.location_confidence,
            "source_call": incident.source_call,
            "notes": incident.notes,
        })
        return {
            "message": "Emergency incident registered successfully in Srikakulam sector.",
            "incident": saved,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/incidents/{incident_id}")
def get_single_incident(incident_id: str):
    try:
        incident = db_get_incident(incident_id)
        if not incident:
            raise HTTPException(status_code=404, detail="Incident not found")
        return incident
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.patch("/api/incidents/{incident_id}/lifecycle")
def update_incident_lifecycle_endpoint(incident_id: str, payload: IncidentLifecycleUpdate):
    try:
        updated = db_update_incident_lifecycle(
            incident_id=incident_id,
            lifecycle_status=payload.lifecycle_status,
            ambulance_id=payload.ambulance_id,
            hospital_id=payload.hospital_id,
            actor=payload.actor or "OPERATOR_COMMANDER",
            notes=payload.notes,
        )
        if not updated:
            raise HTTPException(status_code=404, detail="Incident not found")
        return {"message": f"Incident transitioned to {payload.lifecycle_status}", "incident": updated}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/incidents/{incident_id}/override")
def record_override_endpoint(incident_id: str, payload: OperatorOverrideRequest):
    try:
        incident = db_get_incident(incident_id)
        if not incident:
            raise HTTPException(status_code=404, detail="Incident not found")

        res = db_record_operator_override(
            incident_id=incident_id,
            selected_ambulance_id=payload.selected_ambulance_id,
            selected_hospital_id=payload.selected_hospital_id,
            ai_recommended_ambulance_id=payload.ai_recommended_ambulance_id,
            ai_recommended_hospital_id=payload.ai_recommended_hospital_id,
            override_reason=payload.override_reason,
            actor=payload.actor or "OPERATOR_COMMANDER",
        )
        return res
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.patch("/api/incidents/{incident_id}/status")
def update_incident_status_endpoint(incident_id: str, payload: dict):
    try:
        st = payload.get("status", "ACTIVE")
        updated = db_update_incident_status(incident_id, st)
        if not updated:
            raise HTTPException(status_code=404, detail="Incident not found")
        return {"message": "Status updated", "incident": updated}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================
# AI INTELLIGENCE & DECISION SUPPORT API
# ============================================================

@app.post("/api/intake/analyze-notes")
def analyze_call_notes_endpoint(payload: CallNoteAnalysisRequest):
    """Extract provisional text clues without geocoding, triaging, or dispatching."""
    return analyze_call_notes(payload.transcript)

from agents import orchestrator

@app.post("/api/incidents/{incident_id}/analyze")
@app.get("/api/intelligence/{incident_id}")
def analyze_incident(incident_id: str):
    try:
        incident = db_get_incident(incident_id)
        if not incident:
            raise HTTPException(status_code=404, detail=f"Incident {incident_id} not found")

        ambulances = db_get_ambulances()
        hospitals = db_get_hospitals()
        road_events = db_get_road_events()
        all_incidents = db_get_incidents()

        recommendation = orchestrator.analyze_incident_pipeline(
            incident=incident,
            ambulances=ambulances,
            hospitals=hospitals,
            road_events=road_events,
            all_incidents=all_incidents,
        )

        db_save_response(recommendation)
        return recommendation
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/resource-conflicts")
def get_resource_conflicts():
    try:
        incidents = db_get_incidents()
        ambulances = db_get_ambulances()
        hospitals = db_get_hospitals()

        conflicts = detect_resource_conflicts(incidents, ambulances, hospitals)
        return conflicts
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/responses")
def get_all_responses():
    try:
        responses = db_get_response_history()
        return {"count": len(responses), "responses": responses}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================
# OPERATIONS COPILOT API
# ============================================================

@app.post("/api/copilot/query")
def copilot_query(payload: CopilotQueryRequest):
    try:
        incidents = db_get_incidents()
        ambulances = db_get_ambulances()
        hospitals = db_get_hospitals()
        road_events = db_get_road_events()

        result = copilot_query_reasoning(
            prompt=payload.prompt,
            incidents=incidents,
            ambulances=ambulances,
            hospitals=hospitals,
            road_events=road_events,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================
# SIMULATION / WHAT-IF SCENARIOS API
# ============================================================

@app.post("/api/simulate")
def simulate_scenario(payload: SimulationRequest):
    try:
        simulated_incident = {
            "id": f"SIM-{int(datetime.now().timestamp()) % 1000:03d}",
            "type": payload.type,
            "location": payload.location or "Simulated Srikakulam Point",
            "severity": payload.severity.upper(),
            "victims": int(payload.victims),
            "critical_victims": int(payload.critical_victims or 0),
            "hazard_type": payload.hazard_type or "Standard",
            "coordinates": [float(payload.coordinates[0]), float(payload.coordinates[1])],
            "status": "SIMULATION",
            "lifecycle_status": "TRIAGE",
            "reported_at": datetime.now().isoformat(),
        }

        ambulances = db_get_ambulances()
        hospitals = db_get_hospitals()
        road_events = db_get_road_events()
        all_incidents = db_get_incidents()

        recommendation = build_recommendation(
            incident=simulated_incident,
            ambulances=ambulances,
            hospitals=hospitals,
            road_events=road_events,
            all_incidents=all_incidents,
        )
        recommendation["is_simulation"] = True
        return recommendation
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================
# AMBULANCES API
# ============================================================

@app.get("/api/ambulances")
def get_all_ambulances():
    try:
        ambulances = db_get_ambulances()
        return {
            "count": len(ambulances),
            "ambulances": ambulances,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.patch("/api/ambulances/{ambulance_id}/status")
def update_ambulance_status_endpoint(ambulance_id: str, payload: AmbulanceStatusUpdate):
    try:
        updated = db_update_ambulance_status(
            ambulance_id=ambulance_id,
            status=payload.status,
            current_assignment=payload.current_assignment,
        )
        if not updated:
            raise HTTPException(status_code=404, detail="Ambulance not found")
        return {"message": "Ambulance status updated", "ambulance": updated}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================
# HOSPITALS & PRE-ALERTS API
# ============================================================

@app.get("/api/hospitals")
def get_all_hospitals():
    try:
        hospitals = db_get_hospitals()
        return {
            "count": len(hospitals),
            "hospitals": hospitals,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/hospitals/pre-alert")
def send_pre_alert(payload: HospitalPreAlertCreate):
    try:
        pre_alert = db_create_hospital_pre_alert(
            incident_id=payload.incident_id,
            hospital_id=payload.hospital_id,
            ambulance_id=payload.ambulance_id,
            severity=payload.severity,
            patient_summary=payload.patient_summary,
            estimated_eta_mins=payload.estimated_eta_mins,
            trauma_requirements=payload.trauma_requirements or "Trauma Bay Prepared",
        )
        return {"message": "Training pre-alert record created; no hospital system was contacted.", "delivery_status": "NOT_SENT_TRAINING_RECORD", "pre_alert": pre_alert}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/hospitals/pre-alerts")
def get_pre_alerts():
    try:
        alerts = db_get_hospital_pre_alerts()
        return {"count": len(alerts), "pre_alerts": alerts}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================
# ROAD INTELLIGENCE API
# ============================================================

@app.get("/api/road-events")
def get_all_road_events():
    try:
        events = db_get_road_events()
        return {
            "count": len(events),
            "road_events": events,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/road-events")
def create_new_road_event(payload: RoadEventCreate):
    try:
        created = db_create_road_event({
            "type": payload.type,
            "description": payload.description,
            "corridor": payload.corridor or "NH-16 Srikakulam Corridor",
            "road_class": payload.road_class or "National Highway",
            "longitude": payload.longitude,
            "latitude": payload.latitude,
            "radius_km": payload.radius_km,
            "delay_multiplier": payload.delay_multiplier,
            "is_active": payload.is_active,
        })
        return {"message": "Road hazard condition registered", "road_event": created}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.patch("/api/road-events/{event_id}")
def update_road_event_status_endpoint(event_id: str, payload: RoadEventStatusUpdate):
    try:
        updated = db_set_road_event_active(event_id, payload.is_active)
        if not updated:
            raise HTTPException(status_code=404, detail="Road event not found")
        return {"message": "Road event status updated", "road_event": updated}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/road-events/{event_id}")
def delete_road_event_endpoint(event_id: str):
    try:
        res = db_delete_road_event(event_id)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================
# AUDIT LOGS & ANALYTICS API
# ============================================================

@app.get("/api/audit-logs")
def get_audit_trail(limit: int = Query(100, ge=1, le=500), override_only: bool = False):
    try:
        logs = db_get_audit_logs(limit=limit, override_only=override_only)
        return {"count": len(logs), "audit_logs": logs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/analytics/summary")
@app.get("/api/dashboard")
def get_analytics():
    try:
        summary = db_get_analytics_summary()
        return summary
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================
# DEMONSTRATION MODE SCENARIOS
# ============================================================

@app.post("/api/demo/scenario/{scenario_id}")
def activate_demo_scenario(scenario_id: str):
    valid_scenarios = [
        "nh16_collision",
        "palakonda_rollover",
        "cardiac_emergency",
        "industrial_fire",
        "resource_shortage_crisis",
        "hospital_saturation",
        "road_closure_reroute",
    ]
    if scenario_id not in valid_scenarios:
        raise HTTPException(status_code=400, detail=f"Invalid scenario ID. Valid: {', '.join(valid_scenarios)}")

    try:
        res = db_reset_demo_scenario(scenario_id)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================
# QUANTUM OPTIMIZATION & CITIZEN SOS INTEGRATION
# ============================================================

class SOSTriggerRequest(BaseModel):
    userLat: float
    userLng: float
    accuracy: Optional[float] = 5.0
    source: Optional[str] = "Citizen Phone App"
    emergency_type: str = "Accident / Major Trauma"
    caller_phone: Optional[str] = "+91-98480-22338"
    notes: Optional[str] = None


class DisruptionInjectRequest(BaseModel):
    disruption_type: str = "ACCIDENT_COLLISION"
    corridor_name: Optional[str] = "NH-16 Express Corridor"
    delay_multiplier: Optional[float] = 2.5
    latitude: Optional[float] = 18.2969
    longitude: Optional[float] = 83.8961
    radius_km: Optional[float] = 3.0
    notes: Optional[str] = "Live Faculty Disruption Injection"


@app.post("/api/sos_trigger")
def trigger_citizen_sos(req: SOSTriggerRequest):
    """
    Receives live Citizen SOS from phone.html / field sensor.
    Clamps coordinates strictly within Srikakulam District Bounding Box:
    Lat: [18.1500, 18.5000], Lng: [83.7000, 84.1500].
    Solves optimal resource dispatch using QAOA unitary statevector simulation.
    """
    try:
        # Geographic bounds clamping for Srikakulam District
        c_lat = float(req.userLat)
        c_lng = float(req.userLng)
        if not (18.1500 <= c_lat <= 18.5000 and 83.7000 <= c_lng <= 84.1500):
            c_lat = 18.2980
            c_lng = 83.8970

        is_critical = any(k in req.emergency_type.lower() for k in ["cardiac", "accident", "trauma", "stroke", "bleed", "burn", "fire"])
        severity = "CRITICAL" if is_critical else "HIGH"

        # 1. Create active incident in DB
        inc_data = {
            "type": req.emergency_type,
            "location": f"Citizen SOS ({c_lat:.4f}°N, {c_lng:.4f}°E)",
            "severity": severity,
            "victims": 1,
            "critical_victims": 1 if is_critical else 0,
            "hazard_type": "Standard",
            "coordinates": [c_lng, c_lat],
            "location_source": req.source or "Citizen Mobile SOS (GPS Lock)",
            "location_confidence": 98,
            "notes": req.notes or f"Instant SOS via Mobile App by {req.caller_phone}"
        }
        created_incident = db_create_incident(inc_data)

        # 2. Retrieve resources & solve quantum dispatch
        ambulances = db_get_ambulances()
        hospitals = db_get_hospitals()
        road_events = db_get_road_events()

        quantum_analysis = run_quantum_dispatch_analysis(
            created_incident, ambulances, hospitals, road_events
        )

        assigned_amb_id = quantum_analysis["quantum_recommendation"]["selected_ambulance_id"]
        target_hosp_id = quantum_analysis["quantum_recommendation"]["target_hospital_id"]

        # 3. Update ambulance status & incident lifecycle assignments
        db_update_ambulance_status(assigned_amb_id, "DISPATCHED", created_incident["id"])
        db_update_incident_lifecycle(
            created_incident["id"],
            "DISPATCHED",
            ambulance_id=assigned_amb_id,
            hospital_id=target_hosp_id,
            actor="CITIZEN_QUANTUM_SOS",
            notes=f"Auto-dispatched via QAOA QUBO Solver ({quantum_analysis['qaoa_telemetry']['optimal_bitstring']})"
        )

        # 4. Return combined quantum response
        return {
            "status": "SUCCESS",
            "case_id": created_incident["id"],
            "incident_id": created_incident["id"],
            "assigned_ambulance": quantum_analysis["quantum_recommendation"]["selected_ambulance_callsign"],
            "assigned_ambulance_id": assigned_amb_id,
            "target_hospital": quantum_analysis["quantum_recommendation"]["target_hospital_name"],
            "target_hospital_id": target_hosp_id,
            "eta_minutes": quantum_analysis["quantum_recommendation"]["estimated_arrival_minutes"],
            "qubo_energy": quantum_analysis["qaoa_telemetry"]["qubo_ground_energy"],
            "ground_state_probability": quantum_analysis["qaoa_telemetry"]["ground_state_measurement_probability"],
            "optimal_bitstring": quantum_analysis["qaoa_telemetry"]["optimal_bitstring"],
            "comparative_advantage": quantum_analysis["comparative_advantage"],
            "qaoa_telemetry": quantum_analysis["qaoa_telemetry"],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"SOS dispatch failed: {str(e)}")


@app.post("/api/disruption/inject")
def inject_live_disruption(req: DisruptionInjectRequest):
    """
    Faculty demonstration endpoint: Injects sudden road disruption
    (e.g., NH-16 Crash or Monsoon flood), testing dynamic rerouting.
    """
    try:
        road_data = {
            "type": req.disruption_type,
            "description": f"Live Injected: {req.disruption_type} on {req.corridor_name}",
            "corridor": req.corridor_name,
            "road_class": "National Highway / Major Arterial",
            "longitude": float(req.longitude),
            "latitude": float(req.latitude),
            "radius_km": float(req.radius_km),
            "delay_multiplier": float(req.delay_multiplier),
            "is_active": True
        }
        new_event = db_create_road_event(road_data)
        all_events = db_get_road_events()
        return {
            "status": "INJECTED",
            "event": new_event,
            "active_road_events": [e for e in all_events if e.get("is_active")],
            "message": f"Successfully injected {req.disruption_type} with delay multiplier x{req.delay_multiplier}."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Disruption injection failed: {str(e)}")


@app.get("/api/quantum/status")
def get_quantum_engine_status():
    """
    Returns state of the QAOA QPU Simulator, Hamiltonian variables, and ML Predictor.
    """
    return {
        "status": "ONLINE",
        "qpu_simulator": {
            "node_name": "AP-SKLM-QPU-01",
            "backend": "NumPy Statevector QAOA Unitary Engine",
            "max_simulated_qubits": 16,
            "circuit_depth_p": 1,
            "mixer_hamiltonian": "Transverse Field sum_j X_j",
            "cost_hamiltonian": "Spectral Normalized QUBO Diagonal"
        },
        "ml_traffic_engine": {
            "algorithm": "HistGradientBoostingRegressor",
            "features": ["hour_of_day", "precipitation_mm", "incident_severity", "is_weekend"],
            "trained": True
        },
        "sector": "Srikakulam District (AP-SKLM-EOC-01)"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

