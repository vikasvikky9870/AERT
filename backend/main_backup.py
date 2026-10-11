from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime


app = FastAPI(
    title="AERT API",
    description="AI Emergency Response Twin Backend",
    version="0.1.0",
)


# ---------------------------------------------------------
# CORS
# ---------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------
# DEMO DATA
# ---------------------------------------------------------
class IncidentCreate(BaseModel):
    type: str
    location: str
    severity: str
    victims: int
    coordinates: list[float]

incidents = [
    {
        "id": "INC-001",
        "type": "Major Accident",
        "location": "Central City Highway",
        "severity": "CRITICAL",
        "victims": 12,
        "coordinates": [78.4867, 17.3850],
        "status": "ACTIVE",
        "reported_at": datetime.now().isoformat(),
    },
    {
        "id": "INC-002",
        "type": "Vehicle Collision",
        "location": "Market Road",
        "severity": "HIGH",
        "victims": 4,
        "coordinates": [78.4744, 17.3970],
        "status": "ACTIVE",
        "reported_at": datetime.now().isoformat(),
    },
    {
        "id": "INC-003",
        "type": "Medical Emergency",
        "location": "Ameerpet Junction",
        "severity": "MEDIUM",
        "victims": 1,
        "coordinates": [78.4483, 17.4375],
        "status": "ACTIVE",
        "reported_at": datetime.now().isoformat(),
    },
]


ambulances = [
    {
        "id": "AMB-001",
        "coordinates": [78.4810, 17.3920],
        "status": "AVAILABLE",
        "crew": 3,
    },
    {
        "id": "AMB-002",
        "coordinates": [78.4920, 17.3810],
        "status": "AVAILABLE",
        "crew": 3,
    },
    {
        "id": "AMB-003",
        "coordinates": [78.4700, 17.4000],
        "status": "BUSY",
        "crew": 2,
    },
]


hospitals = [
    {
        "id": "HOS-001",
        "name": "City General Hospital",
        "coordinates": [78.4800, 17.3900],
        "beds_available": 18,
        "capacity": 72,
        "emergency_department": True,
    },
    {
        "id": "HOS-002",
        "name": "Metro Emergency Hospital",
        "coordinates": [78.4900, 17.4000],
        "beds_available": 9,
        "capacity": 88,
        "emergency_department": True,
    },
    {
        "id": "HOS-003",
        "name": "Apollo Emergency Center",
        "coordinates": [78.4750, 17.4100],
        "beds_available": 24,
        "capacity": 61,
        "emergency_department": True,
    },
]


# ---------------------------------------------------------
# BASIC ROUTES
# ---------------------------------------------------------

@app.get("/")
def root():
    return {
        "system": "AERT",
        "name": "AI Emergency Response Twin",
        "status": "operational",
        "version": "0.1.0",
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "AERT Backend",
    }


# ---------------------------------------------------------
# INCIDENTS
# ---------------------------------------------------------

@app.post("/api/incidents")
def create_incident(incident: IncidentCreate):

    new_id = f"INC-{len(incidents) + 1:03d}"

    new_incident = {
        "id": new_id,
        "type": incident.type,
        "location": incident.location,
        "severity": incident.severity.upper(),
        "victims": incident.victims,
        "coordinates": incident.coordinates,
        "status": "ACTIVE",
        "reported_at": datetime.now().isoformat(),
    }

    incidents.append(new_incident)

    return {
        "message": "Emergency created successfully",
        "incident": new_incident,
    }

@app.get("/api/incidents")
def get_incidents():
    return {
        "count": len(incidents),
        "incidents": incidents,
    }


@app.get("/api/incidents/{incident_id}")
def get_incident(incident_id: str):

    for incident in incidents:
        if incident["id"] == incident_id:
            return incident

    return {
        "error": "Incident not found"
    }


# ---------------------------------------------------------
# AMBULANCES
# ---------------------------------------------------------

@app.get("/api/ambulances")
def get_ambulances():
    return {
        "count": len(ambulances),
        "ambulances": ambulances,
    }


# ---------------------------------------------------------
# HOSPITALS
# ---------------------------------------------------------

@app.get("/api/hospitals")
def get_hospitals():
    return {
        "count": len(hospitals),
        "hospitals": hospitals,
    }


# ---------------------------------------------------------
# DASHBOARD SUMMARY
# ---------------------------------------------------------

@app.get("/api/dashboard")
def dashboard():

    active_incidents = [
        incident
        for incident in incidents
        if incident["status"] == "ACTIVE"
    ]

    available_ambulances = [
        ambulance
        for ambulance in ambulances
        if ambulance["status"] == "AVAILABLE"
    ]

    total_beds = sum(
        hospital["beds_available"]
        for hospital in hospitals
    )

    total_victims = sum(
        incident["victims"]
        for incident in active_incidents
    )

    return {
        "active_incidents": len(active_incidents),
        "critical_incidents": sum(
            1
            for incident in active_incidents
            if incident["severity"] == "CRITICAL"
        ),
        "total_ambulances": len(ambulances),
        "available_ambulances": len(available_ambulances),
        "total_hospitals": len(hospitals),
        "available_beds": total_beds,
        "estimated_people_affected": total_victims,
    }
    # ---------------------------------------------------------
# AERT INTELLIGENCE ENGINE
# ---------------------------------------------------------
@app.get("/api/intelligence/{incident_id}")
def analyze_incident(incident_id: str):

    incident = None

    for item in incidents:
        if item["id"] == incident_id:
            incident = item
            break

    if incident is None:
        raise HTTPException(
            status_code=404,
            detail=f"Incident {incident_id} not found"
        )

    # -----------------------------------------
    # SEVERITY SCORE
    # -----------------------------------------

    severity_scores = {
        "LOW": 20,
        "MEDIUM": 45,
        "HIGH": 70,
        "CRITICAL": 90,
    }

    score = severity_scores.get(
        incident["severity"],
        50
    )

    # Victim impact
    if incident["victims"] >= 20:
        score += 10
    elif incident["victims"] >= 10:
        score += 7
    elif incident["victims"] >= 5:
        score += 4

    score = min(score, 100)

    # -----------------------------------------
    # AMBULANCE RECOMMENDATION
    # -----------------------------------------

    if score >= 90:
        recommended_ambulances = 3
    elif score >= 70:
        recommended_ambulances = 2
    elif score >= 40:
        recommended_ambulances = 1
    else:
        recommended_ambulances = 0

    available_ambulances = sum(
        1
        for ambulance in ambulances
        if ambulance["status"] == "AVAILABLE"
    )

    recommended_ambulances = min(
        recommended_ambulances,
        available_ambulances
    )

    # -----------------------------------------
    # HOSPITAL SELECTION
    # -----------------------------------------

    suitable_hospitals = [
        hospital
        for hospital in hospitals
        if hospital["emergency_department"]
        and hospital["beds_available"] > 0
    ]

    suitable_hospitals.sort(
        key=lambda hospital:
        hospital["beds_available"],
        reverse=True
    )

    recommended_hospital = (
        suitable_hospitals[0]
        if suitable_hospitals
        else None
    )

    # -----------------------------------------
    # RESPONSE LEVEL
    # -----------------------------------------

    if score >= 90:
        response_level = "MASS CASUALTY RESPONSE"
    elif score >= 70:
        response_level = "HIGH PRIORITY RESPONSE"
    elif score >= 40:
        response_level = "STANDARD EMERGENCY RESPONSE"
    else:
        response_level = "LOW PRIORITY RESPONSE"

    return {
        "incident_id": incident["id"],
        "priority_score": score,
        "response_level": response_level,
        "recommended_ambulances": recommended_ambulances,
        "available_ambulances": available_ambulances,
        "recommended_hospital": recommended_hospital,
        "reasoning": {
            "severity": incident["severity"],
            "victims": incident["victims"],
            "hospital_capacity_considered": True,
            "ambulance_availability_considered": True,
        },
    }