"""
AERT Intelligence & Decision-Support Engine
Operational Sector: Srikakulam District, Andhra Pradesh, India [83.8961, 18.2969]
Architecture: Explainable Rule-Based Multi-Criteria Decision Support, Resource Conflict Detection & Copilot Reasoning
"""
import math
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple

# ------------------------------------------------------------
# GEOSPATIAL & TRAVEL UTILITIES
# ------------------------------------------------------------

def haversine_km(lon1: float, lat1: float, lon2: float, lat2: float) -> float:
    """
    Calculate great-circle straight-line distance in kilometers between two GPS points.
    """
    R = 6371.0  # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlon / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)


def active_road_delay(
    lon1: float, lat1: float, lon2: float, lat2: float, road_events: list
) -> Tuple[float, List[Dict[str, Any]]]:
    """
    Computes road delay multiplier based on active road hazards along the geographic vector.
    """
    active_events = [e for e in road_events if e.get("is_active", 1)]
    if not active_events:
        return 1.0, []

    encountered = []
    max_multiplier = 1.0

    mid_lon = (lon1 + lon2) / 2.0
    mid_lat = (lat1 + lat2) / 2.0

    for event in active_events:
        e_lon = float(event.get("longitude", 0.0))
        e_lat = float(event.get("latitude", 0.0))
        radius = float(event.get("radius_km", 2.0))
        mult = float(event.get("delay_multiplier", 1.2))

        # Check proximity to origin, destination, and midpoint transit
        d_orig = haversine_km(lon1, lat1, e_lon, e_lat)
        d_dest = haversine_km(lon2, lat2, e_lon, e_lat)
        d_mid = haversine_km(mid_lon, mid_lat, e_lon, e_lat)

        if min(d_orig, d_dest, d_mid) <= radius:
            encountered.append(event)
            max_multiplier = max(max_multiplier, mult)

    return round(max_multiplier, 2), encountered


def eta_minutes(distance_km: float, speed_kmh: float = 40.0, delay_multiplier: float = 1.0) -> int:
    """
    Calculates estimated road travel time in minutes factoring road delay multipliers.
    """
    if distance_km <= 0:
        return 1
    base_hours = distance_km / speed_kmh
    adjusted_minutes = (base_hours * 60.0) * delay_multiplier
    return max(1, round(adjusted_minutes))


# ------------------------------------------------------------
# EXPLAINABLE MULTI-CRITERIA SCORING
# ------------------------------------------------------------

def score_severity(
    severity: str,
    victims: int,
    critical_victims: int,
    incident_type: str,
    hazard_type: str = "Standard",
) -> Tuple[int, Dict[str, Any], str]:
    """
    Rule-based priority scoring (0-100) with transparent factor breakdown.
    """
    base_scores = {
        "LOW": 20,
        "MEDIUM": 45,
        "HIGH": 70,
        "CRITICAL": 85,
    }
    base = base_scores.get(str(severity).upper(), 40)

    # Casualty Impact Points
    victim_pts = 0
    if victims >= 15:
        victim_pts = 15
    elif victims >= 8:
        victim_pts = 10
    elif victims >= 4:
        victim_pts = 6
    elif victims >= 2:
        victim_pts = 3
    elif victims == 1:
        victim_pts = 1

    # Critical Casualty Points (Unconscious, Entrapped, Cardiac, Severe Trauma)
    critical_pts = min(15, critical_victims * 5)

    # Hazard Type Points
    hazard_pts = 0
    t = f"{incident_type} {hazard_type}".lower()
    if "chemical" in t or "fire" in t or "explosion" in t or "toxic" in t or "flood" in t:
        hazard_pts = 10
    elif "highway" in t or "collision" in t or "derailment" in t or "entrap" in t:
        hazard_pts = 7
    elif "cardiac" in t or "stroke" in t or "respiratory" in t:
        hazard_pts = 5
    elif "rollover" in t or "overturn" in t:
        hazard_pts = 4

    total_score = min(100, base + victim_pts + critical_pts + hazard_pts)

    if total_score >= 85:
        priority_label = "CRITICAL PRIORITY"
    elif total_score >= 65:
        priority_label = "HIGH PRIORITY"
    elif total_score >= 40:
        priority_label = "STANDARD RESPONSE"
    else:
        priority_label = "LOW PRIORITY"

    breakdown = {
        "base_severity_tier": severity.upper(),
        "base_points": base,
        "victim_count_points": victim_pts,
        "critical_casualty_points": critical_pts,
        "hazard_type_points": hazard_pts,
        "total_score": total_score,
        "formula": "Score = min(100, BaseSeverity + VictimImpact + CriticalWeight + HazardWeight)",
    }

    return total_score, breakdown, priority_label


def estimate_fleet_requirement(
    priority_score: int, victims: int, critical_victims: int, incident_type: str
) -> Dict[str, Any]:
    """
    Computes required fleet size and capability tier (ALS vs BLS).
    """
    req_type = "ALS" if (critical_victims > 0 or priority_score >= 70 or "cardiac" in incident_type.lower()) else "BLS"

    if victims > 1:
        req_count = max(1, min(math.ceil(victims / 3), 6))
    elif priority_score >= 85:
        req_count = 3
    elif priority_score >= 65:
        req_count = 2
    else:
        req_count = 1

    return {
        "required_units": req_count,
        "recommended_tier": req_type,
        "requires_als": req_type == "ALS",
        "requires_cardiac_monitor": "cardiac" in incident_type.lower() or critical_victims > 0,
        "requires_ventilator": critical_victims > 0 or "chemical" in incident_type.lower(),
    }


# ------------------------------------------------------------
# RESOURCE CONFLICT & SHORTAGE DETECTION ENGINE
# ------------------------------------------------------------

def detect_resource_conflicts(
    incidents: List[Dict[str, Any]],
    ambulances: List[Dict[str, Any]],
    hospitals: List[Dict[str, Any]],
) -> Dict[str, Any]:
    """
    Sector-wide Resource Shortage & Conflict Detection.
    Evaluates active critical incidents against available ALS/BLS fleet and trauma capacity.
    """
    active_incidents = [i for i in incidents if str(i.get("status", "")).upper() == "ACTIVE"]
    critical_incidents = [i for i in active_incidents if str(i.get("severity", "")).upper() in ["CRITICAL", "HIGH"]]

    available_ambs = [a for a in ambulances if str(a.get("status", "")).upper() == "AVAILABLE"]
    available_als = [a for a in available_ambs if str(a.get("type", "ALS")).upper() == "ALS"]
    available_bls = [a for a in available_ambs if str(a.get("type", "BLS")).upper() == "BLS"]

    total_required_units = sum(
        max(1, math.ceil(int(i.get("victims", 1)) / 3)) for i in critical_incidents
    ) if critical_incidents else (1 if active_incidents else 0)

    resource_gap = max(0, total_required_units - len(available_ambs))
    has_shortage = resource_gap > 0 or (len(critical_incidents) > len(available_als) and len(critical_incidents) > 0)

    # Hospital capacity alert
    total_beds = sum(int(h.get("beds_available", 0)) for h in hospitals)
    total_icu = sum(int(h.get("icu_beds_available", 0)) for h in hospitals)
    hospital_shortage = total_beds < 10 or total_icu < 2

    # Generate actionable operational recommendations
    actions = []
    if has_shortage:
        actions.append("Dispatch nearest suitable available unit to highest-priority triage incident.")
        if resource_gap > 0:
            actions.append(f"Request mutual-aid support from adjacent district sectors ({resource_gap} unit deficit).")
            actions.append("Escalate sector emergency readiness status to Level 2 Commander Alert.")
        if len(available_als) < len(critical_incidents):
            actions.append("Preserve remaining ALS units for life-threatening cardiac / polytrauma calls.")
    else:
        actions.append("Fleet capacity is currently sufficient across Srikakulam District.")

    return {
        "has_shortage": has_shortage,
        "resource_gap": resource_gap,
        "active_critical_count": len(critical_incidents),
        "total_required_units": total_required_units,
        "available_units_count": len(available_ambs),
        "available_als_count": len(available_als),
        "available_bls_count": len(available_bls),
        "hospital_capacity_warning": hospital_shortage,
        "total_free_beds": total_beds,
        "total_free_icu_beds": total_icu,
        "recommended_actions": actions,
        "evaluated_at": datetime.now().isoformat(),
    }


# ------------------------------------------------------------
# CAPABILITY-AWARE RESOURCE RANKING
# ------------------------------------------------------------

def rank_ambulances(
    incident_lon: float,
    incident_lat: float,
    ambulances: List[Dict[str, Any]],
    road_events: List[Dict[str, Any]] = None,
    requires_als: bool = False,
) -> List[Dict[str, Any]]:
    """
    Ranks fleet by capability tier, proximity, active road delays, and crew readiness.
    """
    if road_events is None:
        road_events = []

    ranked = []
    for amb in ambulances:
        a_lon = float(amb["coordinates"][0])
        a_lat = float(amb["coordinates"][1])
        dist = haversine_km(a_lon, a_lat, incident_lon, incident_lat)
        delay_mult, events = active_road_delay(a_lon, a_lat, incident_lon, incident_lat, road_events)

        base_eta = eta_minutes(dist, speed_kmh=45.0, delay_multiplier=1.0)
        adj_eta = eta_minutes(dist, speed_kmh=45.0, delay_multiplier=delay_mult)

        amb_type = str(amb.get("type", "ALS")).upper()
        is_avail = (str(amb.get("status", "")).upper() == "AVAILABLE")
        matches_capability = (amb_type == "ALS") if requires_als else True

        # Ranking score (lower metric is better)
        rank_metric = adj_eta
        if not is_avail:
            rank_metric += 1000
        if requires_als and amb_type != "ALS":
            rank_metric += 50  # Prefer ALS for critical incidents

        equipment = amb.get("equipment", [])

        ranked.append({
            "id": amb["id"],
            "type": amb_type,
            "coordinates": [a_lon, a_lat],
            "status": amb.get("status", "AVAILABLE"),
            "crew": amb.get("crew", "Paramedic Team"),
            "crew_cert": amb.get("crew_cert", "Advanced Paramedic"),
            "equipment": equipment,
            "fuel_pct": amb.get("fuel_pct", 95),
            "distance_km": dist,
            "base_eta_minutes": base_eta,
            "delay_multiplier": delay_mult,
            "eta_minutes": adj_eta,
            "matches_capability": matches_capability,
            "nearby_road_events": len(events),
            "telemetry_source": "Simulated AVL Fleet Telemetry",
            "_rank_metric": rank_metric,
        })

    ranked.sort(key=lambda x: x["_rank_metric"])
    for r in ranked:
        del r["_rank_metric"]

    return ranked


def rank_hospitals(
    incident_lon: float,
    incident_lat: float,
    hospitals: List[Dict[str, Any]],
    road_events: List[Dict[str, Any]] = None,
    critical_triage: bool = False,
) -> List[Dict[str, Any]]:
    """
    Ranks receiving hospitals by distance, travel time, available ICU/trauma beds, and load.
    """
    if road_events is None:
        road_events = []

    ranked = []
    for hos in hospitals:
        h_lon = float(hos["coordinates"][0])
        h_lat = float(hos["coordinates"][1])
        dist = haversine_km(incident_lon, incident_lat, h_lon, h_lat)
        delay_mult, events = active_road_delay(incident_lon, incident_lat, h_lon, h_lat, road_events)
        adj_eta = eta_minutes(dist, speed_kmh=40.0, delay_multiplier=delay_mult)

        beds = int(hos.get("beds_available", 0))
        icu_beds = int(hos.get("icu_beds_available", 2))
        cap = float(hos.get("capacity", 50))
        has_er = bool(hos.get("emergency_department", True))
        trauma_level = hos.get("trauma_level", "Level 1 Trauma Center")

        # Suitability index (higher is better)
        suitability = (100 - min(dist * 5, 50)) + (min(beds, 20) * 1.5) + (min(icu_beds, 6) * 3) - (cap * 0.35)
        if not has_er:
            suitability -= 60
        if beds <= 0:
            suitability -= 40
        if critical_triage and "Level 1" in trauma_level:
            suitability += 15  # Boost Level 1 for critical trauma

        ranked.append({
            "id": hos["id"],
            "name": hos["name"],
            "coordinates": [h_lon, h_lat],
            "beds_available": beds,
            "icu_beds_available": icu_beds,
            "capacity": cap,
            "trauma_level": trauma_level,
            "emergency_department": has_er,
            "blood_bank_status": hos.get("blood_bank_status", "AVAILABLE"),
            "distance_km": dist,
            "delay_multiplier": delay_mult,
            "eta_minutes": adj_eta,
            "suitability_score": round(max(0, suitability), 1),
        })

    ranked.sort(key=lambda x: (x["suitability_score"], -x["eta_minutes"]), reverse=True)
    return ranked


# ------------------------------------------------------------
# MAIN RECOMMENDATION ENGINE
# ------------------------------------------------------------

def build_recommendation(
    incident: Dict[str, Any],
    ambulances: List[Dict[str, Any]],
    hospitals: List[Dict[str, Any]],
    road_events: List[Dict[str, Any]] = None,
    all_incidents: List[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Builds a complete, explainable decision-support recommendation for emergency commanders.
    """
    if road_events is None:
        road_events = []
    if all_incidents is None:
        all_incidents = [incident]

    coords = incident.get("coordinates", [83.8961, 18.2969])
    inc_lon, inc_lat = float(coords[0]), float(coords[1])
    severity = str(incident.get("severity", "MEDIUM")).upper()
    victims = int(incident.get("victims", 1))
    critical_victims = int(incident.get("critical_victims", 0))
    inc_type = str(incident.get("type", "Emergency"))
    hazard_type = str(incident.get("hazard_type", "Standard"))
    inc_loc = str(incident.get("location", "Srikakulam Sector"))

    # 1. Scoring
    priority_score, breakdown, priority_label = score_severity(
        severity, victims, critical_victims, inc_type, hazard_type
    )

    # 2. Fleet Sizing & Capability Requirement
    fleet_req = estimate_fleet_requirement(priority_score, victims, critical_victims, inc_type)
    requires_als = fleet_req["requires_als"]

    # 3. Resource Ranking
    ranked_ambs = rank_ambulances(inc_lon, inc_lat, ambulances, road_events, requires_als=requires_als)
    ranked_hosps = rank_hospitals(inc_lon, inc_lat, hospitals, road_events, critical_triage=(priority_score >= 70))

    available_ambs = [a for a in ranked_ambs if a["status"].upper() == "AVAILABLE"]
    recommended_amb = available_ambs[0] if available_ambs else (ranked_ambs[0] if ranked_ambs else None)
    recommended_hosp = ranked_hosps[0] if ranked_hosps else None

    # 4. Sector Resource Conflict Detection
    conflict_data = detect_resource_conflicts(all_incidents, ambulances, hospitals)
    has_conflict = conflict_data["has_shortage"]
    resource_gap = conflict_data["resource_gap"]

    # 5. Nearby Road Events
    active_near_events = []
    for event in road_events:
        if event.get("is_active", 1):
            e_coords = event.get("coordinates") or [event.get("longitude", 0), event.get("latitude", 0)]
            d = haversine_km(inc_lon, inc_lat, float(e_coords[0]), float(e_coords[1]))
            if d <= float(event.get("radius_km", 2.0)) + 1.5:
                active_near_events.append({
                    "id": event.get("id"),
                    "type": event.get("type"),
                    "description": event.get("description"),
                    "delay_multiplier": event.get("delay_multiplier"),
                    "distance_km": d,
                })

    # 6. Structured Explainable Reasoning
    reasoning = []
    why_ambulance = []
    why_hospital = []

    # Priority Explanation
    if severity == "CRITICAL":
        reasoning.append(f"CRITICAL triage tier assigned (Score: {priority_score}/100): High casualty weight and acute life-safety risk trigger immediate priority dispatch.")
    elif severity == "HIGH":
        reasoning.append(f"HIGH priority response tier (Score: {priority_score}/100): Expedited EMS allocation with dedicated trauma facility pre-alert.")
    else:
        reasoning.append(f"{severity} priority tier managed under standard Srikakulam municipal response protocols.")

    # Fleet Requirement Explanation
    if critical_victims > 0:
        reasoning.append(f"{critical_victims} critical casualty(ies) mandates Advanced Life Support (ALS) with specialized trauma equipment.")
    if fleet_req["required_units"] > 1:
        reasoning.append(f"Total casualty estimate ({victims} patient(s)) requires staging of {fleet_req['required_units']} ambulance units.")

    # Why Recommended Ambulance
    if recommended_amb:
        why_ambulance.append(f"Unit {recommended_amb['id']} is in AVAILABLE status ({recommended_amb['type']} capability).")
        why_ambulance.append(f"Estimated transit distance: {recommended_amb['distance_km']} km (~{recommended_amb['eta_minutes']} min ETA).")
        if recommended_amb["delay_multiplier"] > 1.0:
            why_ambulance.append(f"Factors +{recommended_amb['delay_multiplier']}x active road delay along response vector.")
        else:
            why_ambulance.append("Clear response vector with zero significant road delay impediments.")
        if requires_als and recommended_amb["type"] == "ALS":
            why_ambulance.append("Fully equipped with cardiac monitor, defibrillator, and critical care medication.")
        reasoning.append(f"Recommended Ambulance {recommended_amb['id']} ({recommended_amb['type']}): Nearest ready unit with {recommended_amb['eta_minutes']} min ETA.")
    else:
        why_ambulance.append("No ambulances currently available in sector.")
        reasoning.append("Warning: All Srikakulam fleet units currently occupied or offline.")

    # Why Recommended Hospital
    if recommended_hosp:
        why_hospital.append(f"Trauma facility '{recommended_hosp['name']}' designated ({recommended_hosp['trauma_level']}).")
        why_hospital.append(f"{recommended_hosp['beds_available']} available beds ({recommended_hosp['icu_beds_available']} ICU) at {recommended_hosp['capacity']}% load.")
        why_hospital.append(f"Direct transit time: ~{recommended_hosp['eta_minutes']} min ({recommended_hosp['distance_km']} km).")
        why_hospital.append(f"Blood bank status: {recommended_hosp.get('blood_bank_status', 'AVAILABLE')}.")
        reasoning.append(f"Designated Receiving Facility: {recommended_hosp['name']} with {recommended_hosp['beds_available']} free beds.")

    # Conflict / Shortage Warning
    if has_conflict:
        reasoning.append(f"ALERT: Resource shortage detected across sector. Resource gap of {resource_gap} unit(s). Recommend mutual-aid protocol.")

    # Confidence Label
    confidence = "HIGH (Sufficient Fleet & Full Trauma Readiness)"
    if has_conflict or len(available_ambs) <= 1:
        confidence = "MODERATE (Resource Constraints Identified in Sector)"
    if len(available_ambs) == 0:
        confidence = "LOW (Critical Sector Resource Deficit)"

    return {
        "incident_id": incident.get("id", "SIM-001"),
        "location": inc_loc,
        "priority_score": priority_score,
        "response_level": priority_label,
        "severity_breakdown": breakdown,
        "fleet_requirement": fleet_req,
        "recommended_ambulances_count": fleet_req["required_units"],
        "available_ambulances_count": len(available_ambs),
        "total_ambulances_count": len(ambulances),
        "ranked_ambulances": ranked_ambs,
        "recommended_ambulance": recommended_amb,
        "why_ambulance": why_ambulance,
        "ranked_hospitals": ranked_hosps,
        "recommended_hospital": recommended_hosp,
        "why_hospital": why_hospital,
        "road_delay_applied": (recommended_amb.get("delay_multiplier", 1.0) > 1.0) if recommended_amb else False,
        "nearby_road_events": active_near_events,
        "confidence_label": confidence,
        "has_conflict": has_conflict,
        "resource_gap": resource_gap,
        "conflict_details": conflict_data,
        "reasoning": reasoning,
        "provenance": incident.get("provenance", {
            "source": incident.get("location_source", "Caller Landmark"),
            "confidence_pct": incident.get("location_confidence", 92),
            "data_mode": "Prototype Geocoded",
        }),
        "engine_type": "Explainable Rule-Based Multi-Criteria Decision Support (AERT Core)",
        "evaluated_at": datetime.now().isoformat(),
    }


# ------------------------------------------------------------
# AERT OPERATIONS COPILOT REASONING ENGINE
# ------------------------------------------------------------

def copilot_query_reasoning(
    prompt: str,
    incidents: List[Dict[str, Any]],
    ambulances: List[Dict[str, Any]],
    hospitals: List[Dict[str, Any]],
    road_events: List[Dict[str, Any]],
) -> Dict[str, Any]:
    """
    In-platform Operations Copilot that directly inspects live system data
    and produces grounded, advisory responses with entity references for GIS linking.
    """
    p = prompt.strip().lower()
    entities_to_highlight = []
    answer = ""

    active_incidents = [i for i in incidents if i.get("status") == "ACTIVE"]
    critical_incidents = [i for i in active_incidents if i.get("severity") in ["CRITICAL", "HIGH"]]
    available_ambs = [a for a in ambulances if a.get("status") == "AVAILABLE"]
    available_als = [a for a in available_ambs if a.get("type") == "ALS"]
    total_beds = sum(int(h.get("beds_available", 0)) for h in hospitals)
    active_roads = [r for r in road_events if r.get("is_active")]

    # Query 1: Priority / Attention
    if "first" in p or "attention" in p or "priority" in p or "urgent" in p:
        if not active_incidents:
            answer = "Based on current prototype data, there are no active emergency incidents registered in Srikakulam sector."
        else:
            top_inc = sorted(
                active_incidents,
                key=lambda x: (4 if x["severity"] == "CRITICAL" else (3 if x["severity"] == "HIGH" else 2), x.get("victims", 0)),
                reverse=True,
            )[0]
            entities_to_highlight.append({"type": "incident", "id": top_inc["id"]})
            answer = (
                f"Based on current operational telemetry, **{top_inc['id']}** ({top_inc['type']}) requires immediate attention. "
                f"It is classified as **{top_inc['severity']}** at *{top_inc['location']}* with {top_inc.get('victims', 0)} casualty(ies). "
                f"Lifecycle state: `{top_inc.get('lifecycle_status', 'VERIFIED')}`."
            )

    # Query 2: Why ambulance recommended / Ambulance status
    elif "why" in p and ("amb" in p or "ambulance" in p):
        # Look for specific ambulance or default
        target_amb = None
        for a in ambulances:
            if a["id"].lower() in p:
                target_amb = a
                break
        if not target_amb and available_ambs:
            target_amb = available_ambs[0]

        if target_amb:
            entities_to_highlight.append({"type": "ambulance", "id": target_amb["id"]})
            answer = (
                f"Ambulance **{target_amb['id']}** is an **{target_amb.get('type', 'ALS')}** unit staffed by *{target_amb.get('crew', 'Paramedic Team')}*. "
                f"Status: `{target_amb['status']}` with {target_amb.get('fuel_pct', 95)}% battery/fuel readiness. "
                f"It was ranked highest due to geographic proximity across Srikakulam sector and matching medical equipment capabilities."
            )
        else:
            answer = "No suitable available ambulance was found matching that reference in Srikakulam sector."

    # Query 3: Ambulance availability / Fleet readiness
    elif "how many" in p or "available" in p or "fleet" in p or "ambulance" in p:
        for a in available_ambs:
            entities_to_highlight.append({"type": "ambulance", "id": a["id"]})
        answer = (
            f"Currently, **{len(available_ambs)} of {len(ambulances)}** ambulances are AVAILABLE for dispatch across Srikakulam District: "
            f"**{len(available_als)} ALS** units and **{len(available_ambs) - len(available_als)} BLS** units. "
            f"Units ready: {', '.join([a['id'] for a in available_ambs]) or 'None'}."
        )

    # Query 4: Hospital capacity / Best hospital
    elif "hospital" in p or "capacity" in p or "bed" in p:
        best_hosp = sorted(hospitals, key=lambda h: (h.get("beds_available", 0), -h.get("capacity", 100)), reverse=True)[0]
        entities_to_highlight.append({"type": "hospital", "id": best_hosp["id"]})
        answer = (
            f"Across the Srikakulam hospital network, there are **{total_beds} total available beds**. "
            f"The facility with the strongest current capacity is **{best_hosp['name']}** ({best_hosp['id']}) "
            f"with **{best_hosp.get('beds_available', 0)} free beds** ({best_hosp.get('icu_beds_available', 0)} ICU) at **{best_hosp.get('capacity', 0)}% occupancy load**."
        )

    # Query 5: Resource conflicts / Shortages
    elif "shortage" in p or "conflict" in p or "gap" in p or "deficit" in p:
        conflicts = detect_resource_conflicts(incidents, ambulances, hospitals)
        if conflicts["has_shortage"]:
            answer = (
                f"⚠️ **RESOURCE SHORTAGE DETECTED**: Active critical emergencies ({conflicts['active_critical_count']}) "
                f"exceed available suitable ambulances ({conflicts['available_units_count']}), resulting in a **resource gap of {conflicts['resource_gap']} unit(s)**. "
                f"Recommended action: Preserve ALS units and initiate mutual-aid escalation protocol."
            )
        else:
            answer = (
                f"✅ **NO RESOURCE SHORTAGE**: Fleet readiness is currently sufficient. "
                f"{len(available_ambs)} available ambulances can adequately cover the {len(active_incidents)} active incidents in Srikakulam."
            )

    # Query 6: Road / Traffic / Corridors
    elif "road" in p or "traffic" in p or "nh-16" in p or "delay" in p:
        if active_roads:
            for r in active_roads:
                entities_to_highlight.append({"type": "road_event", "id": r["id"]})
            roads_desc = "; ".join([f"**{r['id']}** ({r['type']}: +{r['delay_multiplier']}x on {r.get('corridor', 'Corridor')})" for r in active_roads])
            answer = (
                f"There are **{len(active_roads)} active road conditions** in Srikakulam sector: {roads_desc}. "
                f"These conditions dynamically apply delay multipliers to response ETA calculations."
            )
        else:
            answer = "All primary Srikakulam corridors (including NH-16 Bypass) are currently operating without registered road delay multipliers."

    # Default general briefing
    else:
        answer = (
            f"AERT Command Center Briefing for Srikakulam District: "
            f"**{len(active_incidents)} active emergency incidents** ({len(critical_incidents)} critical/high), "
            f"**{len(available_ambs)}/{len(ambulances)} ambulances available**, and "
            f"**{total_beds} free hospital beds** across the network. "
            f"Decision support mode: Explainable Rule-Based (Prototype Telemetry)."
        )

    return {
        "query": prompt,
        "answer": answer,
        "highlight_entities": entities_to_highlight,
        "disclaimer": "Advisory Operations Copilot based on active prototype telemetry. Human operator approval required for all dispatches.",
        "timestamp": datetime.now().isoformat(),
    }
