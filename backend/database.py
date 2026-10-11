import json
import sqlite3
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any, Dict, List, Optional

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "aert.db"

# ------------------------------------------------------------
# LIFECYCLE STATE CONSTANTS (10-Stage Response Progression)
# ------------------------------------------------------------
VALID_LIFECYCLE_STAGES = [
    "CALL_RECEIVED",
    "TRIAGE",
    "VERIFIED",
    "DISPATCH_PENDING",
    "DISPATCHED",
    "EN_ROUTE",
    "ON_SCENE",
    "TRANSPORTING",
    "ARRIVED_HOSPITAL",
    "RESOLVED",
]


def get_connection() -> sqlite3.Connection:
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def init_database():
    connection = get_connection()
    cursor = connection.cursor()

    # -----------------------------------------
    # 1. INCIDENTS TABLE (10-Stage Lifecycle & Provenance)
    # -----------------------------------------
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS incidents (
            id TEXT PRIMARY KEY,
            type TEXT NOT NULL,
            location TEXT NOT NULL,
            severity TEXT NOT NULL,
            victims INTEGER DEFAULT 0,
            critical_victims INTEGER DEFAULT 0,
            hazard_type TEXT DEFAULT 'Standard',
            longitude REAL NOT NULL,
            latitude REAL NOT NULL,
            status TEXT DEFAULT 'ACTIVE',
            lifecycle_status TEXT DEFAULT 'VERIFIED',
            location_source TEXT DEFAULT 'Caller Landmark',
            location_confidence INTEGER DEFAULT 90,
            assigned_ambulance_id TEXT DEFAULT NULL,
            destination_hospital_id TEXT DEFAULT NULL,
            reported_at TEXT NOT NULL,
            verified_at TEXT DEFAULT NULL,
            dispatched_at TEXT DEFAULT NULL,
            en_route_at TEXT DEFAULT NULL,
            on_scene_at TEXT DEFAULT NULL,
            transporting_at TEXT DEFAULT NULL,
            hospital_at TEXT DEFAULT NULL,
            resolved_at TEXT DEFAULT NULL,
            source_call TEXT DEFAULT NULL,
            override_reason TEXT DEFAULT NULL,
            notes TEXT DEFAULT NULL
        )
    """)

    # Dynamic migrations for any missing columns in existing deployments
    existing_cols = [r["name"] for r in cursor.execute("PRAGMA table_info(incidents)").fetchall()]
    new_cols = {
        "critical_victims": "INTEGER DEFAULT 0",
        "hazard_type": "TEXT DEFAULT 'Standard'",
        "lifecycle_status": "TEXT DEFAULT 'VERIFIED'",
        "location_source": "TEXT DEFAULT 'Caller Landmark'",
        "location_confidence": "INTEGER DEFAULT 90",
        "assigned_ambulance_id": "TEXT DEFAULT NULL",
        "destination_hospital_id": "TEXT DEFAULT NULL",
        "verified_at": "TEXT DEFAULT NULL",
        "dispatched_at": "TEXT DEFAULT NULL",
        "en_route_at": "TEXT DEFAULT NULL",
        "on_scene_at": "TEXT DEFAULT NULL",
        "transporting_at": "TEXT DEFAULT NULL",
        "hospital_at": "TEXT DEFAULT NULL",
        "resolved_at": "TEXT DEFAULT NULL",
        "source_call": "TEXT DEFAULT NULL",
        "override_reason": "TEXT DEFAULT NULL",
        "notes": "TEXT DEFAULT NULL",
    }
    for col, defn in new_cols.items():
        if col not in existing_cols:
            try:
                cursor.execute(f"ALTER TABLE incidents ADD COLUMN {col} {defn}")
            except Exception:
                pass

    # -----------------------------------------
    # 2. AMBULANCES TABLE (ALS/BLS, Capabilities & Telemetry)
    # -----------------------------------------
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS ambulances (
            id TEXT PRIMARY KEY,
            type TEXT DEFAULT 'ALS',
            longitude REAL NOT NULL,
            latitude REAL NOT NULL,
            status TEXT NOT NULL,
            crew TEXT,
            crew_cert TEXT DEFAULT 'Advanced Paramedic Team',
            equipment_json TEXT,
            fuel_pct INTEGER DEFAULT 95,
            current_assignment TEXT DEFAULT NULL,
            telemetry_updated_at TEXT NOT NULL
        )
    """)

    amb_cols = [r["name"] for r in cursor.execute("PRAGMA table_info(ambulances)").fetchall()]
    new_amb_cols = {
        "type": "TEXT DEFAULT 'ALS'",
        "crew_cert": "TEXT DEFAULT 'Advanced Paramedic Team'",
        "equipment_json": "TEXT",
        "fuel_pct": "INTEGER DEFAULT 95",
        "current_assignment": "TEXT DEFAULT NULL",
        "telemetry_updated_at": "TEXT",
    }
    for col, defn in new_amb_cols.items():
        if col not in amb_cols:
            try:
                cursor.execute(f"ALTER TABLE ambulances ADD COLUMN {col} {defn}")
            except Exception:
                pass

    # -----------------------------------------
    # 3. HOSPITALS TABLE (ICU, Trauma Rating, Capacity)
    # -----------------------------------------
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS hospitals (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            longitude REAL NOT NULL,
            latitude REAL NOT NULL,
            beds_available INTEGER DEFAULT 0,
            icu_beds_available INTEGER DEFAULT 4,
            capacity REAL DEFAULT 0,
            trauma_level TEXT DEFAULT 'Level 1 Trauma Center',
            emergency_department INTEGER DEFAULT 1,
            blood_bank_status TEXT DEFAULT 'AVAILABLE',
            oxygen_reserve_hrs INTEGER DEFAULT 48,
            current_intake_queue INTEGER DEFAULT 0
        )
    """)

    hos_cols = [r["name"] for r in cursor.execute("PRAGMA table_info(hospitals)").fetchall()]
    new_hos_cols = {
        "icu_beds_available": "INTEGER DEFAULT 4",
        "trauma_level": "TEXT DEFAULT 'Level 1 Trauma Center'",
        "blood_bank_status": "TEXT DEFAULT 'AVAILABLE'",
        "oxygen_reserve_hrs": "INTEGER DEFAULT 48",
        "current_intake_queue": "INTEGER DEFAULT 0",
    }
    for col, defn in new_hos_cols.items():
        if col not in hos_cols:
            try:
                cursor.execute(f"ALTER TABLE hospitals ADD COLUMN {col} {defn}")
            except Exception:
                pass

    # -----------------------------------------
    # 4. ROAD EVENTS TABLE (Corridor Buffers & Delay Factors)
    # -----------------------------------------
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS road_events (
            id TEXT PRIMARY KEY,
            type TEXT NOT NULL,
            description TEXT NOT NULL,
            corridor TEXT DEFAULT 'NH-16 Srikakulam Corridor',
            road_class TEXT DEFAULT 'National Highway',
            longitude REAL NOT NULL,
            latitude REAL NOT NULL,
            radius_km REAL DEFAULT 2.0,
            delay_multiplier REAL DEFAULT 1.3,
            is_active INTEGER DEFAULT 1,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    """)

    road_cols = [r["name"] for r in cursor.execute("PRAGMA table_info(road_events)").fetchall()]
    new_road_cols = {
        "corridor": "TEXT DEFAULT 'NH-16 Srikakulam Corridor'",
        "road_class": "TEXT DEFAULT 'National Highway'",
        "updated_at": "TEXT",
    }
    for col, defn in new_road_cols.items():
        if col not in road_cols:
            try:
                cursor.execute(f"ALTER TABLE road_events ADD COLUMN {col} {defn}")
            except Exception:
                pass

    # -----------------------------------------
    # 5. RESPONSE HISTORY & RECOMMENDATIONS
    # -----------------------------------------
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS response_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            incident_id TEXT NOT NULL,
            response_level TEXT,
            priority_score REAL,
            recommended_ambulances INTEGER,
            ambulance_id TEXT,
            hospital_id TEXT,
            reasoning TEXT,
            confidence_label TEXT,
            resource_gap INTEGER DEFAULT 0,
            has_conflict INTEGER DEFAULT 0,
            created_at TEXT NOT NULL
        )
    """)

    resp_cols = [r["name"] for r in cursor.execute("PRAGMA table_info(response_history)").fetchall()]
    new_resp_cols = {
        "ambulance_id": "TEXT",
        "hospital_id": "TEXT",
        "reasoning": "TEXT",
        "confidence_label": "TEXT",
        "resource_gap": "INTEGER DEFAULT 0",
        "has_conflict": "INTEGER DEFAULT 0",
    }
    for col, defn in new_resp_cols.items():
        if col not in resp_cols:
            try:
                cursor.execute(f"ALTER TABLE response_history ADD COLUMN {col} {defn}")
            except Exception:
                pass

    # -----------------------------------------
    # 6. OPERATIONAL AUDIT LOGS
    # -----------------------------------------
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            actor TEXT NOT NULL,
            action TEXT NOT NULL,
            entity_type TEXT NOT NULL,
            entity_id TEXT NOT NULL,
            details TEXT NOT NULL,
            reasoning TEXT DEFAULT NULL,
            override_flag INTEGER DEFAULT 0
        )
    """)

    # -----------------------------------------
    # 7. HOSPITAL PRE-ALERTS
    # -----------------------------------------
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS hospital_pre_alerts (
            id TEXT PRIMARY KEY,
            incident_id TEXT NOT NULL,
            hospital_id TEXT NOT NULL,
            ambulance_id TEXT NOT NULL,
            severity TEXT NOT NULL,
            patient_summary TEXT NOT NULL,
            estimated_eta_mins INTEGER NOT NULL,
            trauma_requirements TEXT,
            status TEXT DEFAULT 'TRANSMITTED',
            created_at TEXT NOT NULL
        )
    """)

    connection.commit()
    seed_srikakulam_resources(connection)
    connection.close()


def seed_srikakulam_resources(connection: sqlite3.Connection):
    cursor = connection.cursor()
    now_iso = datetime.now().isoformat()

    # 1. Seed Incidents if table is empty
    inc_count = cursor.execute("SELECT COUNT(*) as c FROM incidents").fetchone()["c"]
    if inc_count == 0:
        default_incidents = [
            (
                "INC-001",
                "Major Highway Collision",
                "NH-16 Srikakulam Bypass Junction",
                "CRITICAL",
                8,
                2,
                "Multi-vehicle entrapped / Fuel spill risk",
                83.9050,
                18.3050,
                "ACTIVE",
                "DISPATCH_PENDING",
                "Caller Landmark Verified",
                94,
                None,
                None,
                now_iso,
                now_iso,
                None,
                None,
                None,
                None,
                None,
                None,
                "CALL-00821",
                None,
                "Priority highway collision with heavy vehicular congestion.",
            ),
            (
                "INC-002",
                "Vehicle Overturn",
                "Palakonda Road Near Collectorate",
                "HIGH",
                3,
                0,
                "Glass & auto debris on roadway",
                83.8920,
                18.2980,
                "ACTIVE",
                "VERIFIED",
                "Local Merchant Landmark",
                96,
                None,
                None,
                (datetime.now() - timedelta(minutes=14)).isoformat(),
                (datetime.now() - timedelta(minutes=12)).isoformat(),
                None,
                None,
                None,
                None,
                None,
                None,
                "CALL-00822",
                None,
                "Two head injuries reported, conscious.",
            ),
            (
                "INC-003",
                "Medical Emergency / Cardiac",
                "7 Road Junction, Srikakulam Central",
                "HIGH",
                1,
                1,
                "Acute myocardial infarction / Oxygen required",
                83.8961,
                18.2969,
                "ACTIVE",
                "EN_ROUTE",
                "Clinic Staff Geocoded",
                99,
                "AMB-001",
                "HOS-001",
                (datetime.now() - timedelta(minutes=22)).isoformat(),
                (datetime.now() - timedelta(minutes=20)).isoformat(),
                (datetime.now() - timedelta(minutes=18)).isoformat(),
                (datetime.now() - timedelta(minutes=15)).isoformat(),
                None,
                None,
                None,
                None,
                "CALL-00823",
                None,
                "ALS unit en-route for immediate cardiac resuscitation.",
            ),
        ]
        for inc in default_incidents:
            cursor.execute("""
                INSERT OR IGNORE INTO incidents (
                    id, type, location, severity, victims, critical_victims, hazard_type,
                    longitude, latitude, status, lifecycle_status, location_source,
                    location_confidence, assigned_ambulance_id, destination_hospital_id,
                    reported_at, verified_at, dispatched_at, en_route_at, on_scene_at,
                    transporting_at, hospital_at, resolved_at, source_call, override_reason, notes
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, inc)

    # 2. Seed Ambulances with ALS/BLS capabilities
    ambulances = [
        (
            "AMB-001",
            "ALS",
            83.8961,
            18.2969,
            "AVAILABLE",
            "Paramedic Unit Alpha (Srikakulam Central)",
            "Advanced Paramedic Specialist Team",
            json.dumps(["Cardiac Monitor", "Defibrillator", "Ventilator", "Oxygen Kit", "Trauma Kit", "Telemetry AVL"]),
            94,
            None,
            now_iso,
        ),
        (
            "AMB-002",
            "ALS",
            83.9120,
            18.3100,
            "AVAILABLE",
            "Paramedic Unit Bravo (NH-16 Fast Post)",
            "Highway Rapid Response Trauma Crew",
            json.dumps(["Cardiac Monitor", "Defibrillator", "Spinal Immobilization", "Oxygen Kit", "Trauma Kit"]),
            88,
            None,
            now_iso,
        ),
        (
            "AMB-003",
            "BLS",
            83.8780,
            18.2850,
            "BUSY",
            "Trauma Unit Charlie (Palakonda Route)",
            "Basic Life Support & First Responder",
            json.dumps(["Automated External Defibrillator", "Oxygen Kit", "First Aid Trauma Kit"]),
            72,
            "INC-003",
            now_iso,
        ),
        (
            "AMB-004",
            "BLS",
            83.9250,
            18.2750,
            "AVAILABLE",
            "Rapid Response Delta (Amudalavalasa Post)",
            "Community Emergency Medical Crew",
            json.dumps(["Automated External Defibrillator", "Oxygen Kit", "Splints & Stretcher"]),
            91,
            None,
            now_iso,
        ),
        (
            "AMB-005",
            "ALS",
            83.8650,
            18.3200,
            "AVAILABLE",
            "Advanced Life Support Echo (Singupuram Post)",
            "Critical Care Transport Paramedics",
            json.dumps(["Ventilator", "Infusion Pumps", "Cardiac Monitor", "Defibrillator", "Trauma Surgical Kit"]),
            82,
            None,
            now_iso,
        ),
    ]

    for amb in ambulances:
        cursor.execute("""
            INSERT INTO ambulances (
                id, type, longitude, latitude, status, crew, crew_cert,
                equipment_json, fuel_pct, current_assignment, telemetry_updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                type=excluded.type,
                longitude=excluded.longitude,
                latitude=excluded.latitude,
                crew=excluded.crew,
                crew_cert=excluded.crew_cert,
                equipment_json=excluded.equipment_json,
                fuel_pct=excluded.fuel_pct,
                telemetry_updated_at=excluded.telemetry_updated_at
        """, amb)

    # 3. Seed Hospitals with trauma ratings & ICU availability
    hospitals = [
        (
            "HOS-001",
            "Government General Hospital (GGH), Srikakulam",
            83.8980,
            18.2950,
            24,
            6,
            68.0,
            "Level 1 Regional Trauma Center",
            1,
            "AVAILABLE (O+, A+, B+, AB+)",
            72,
            2,
        ),
        (
            "HOS-002",
            "RIMS Medical College & Super Specialty Hospital",
            83.9150,
            18.3150,
            38,
            12,
            55.0,
            "Level 1 Tertiary Medical College",
            1,
            "AVAILABLE (Full Reserves)",
            96,
            1,
        ),
        (
            "HOS-003",
            "Seven Hills Emergency & Trauma Center",
            83.8890,
            18.2910,
            12,
            3,
            82.0,
            "Level 2 Emergency Trauma Center",
            1,
            "LIMITED (O- Low)",
            48,
            3,
        ),
        (
            "HOS-004",
            "Apex Life Care Hospital, Srikakulam",
            83.9020,
            18.3020,
            7,
            1,
            91.0,
            "Level 3 Multispecialty Center",
            1,
            "LIMITED",
            36,
            4,
        ),
        (
            "HOS-005",
            "Amudalavalasa Community Health Center",
            83.9350,
            18.2600,
            15,
            2,
            60.0,
            "Community Emergency Stabilization Unit",
            1,
            "STANDARD",
            24,
            0,
        ),
    ]

    for hos in hospitals:
        cursor.execute("""
            INSERT INTO hospitals (
                id, name, longitude, latitude, beds_available, icu_beds_available,
                capacity, trauma_level, emergency_department, blood_bank_status,
                oxygen_reserve_hrs, current_intake_queue
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                name=excluded.name,
                longitude=excluded.longitude,
                latitude=excluded.latitude,
                beds_available=excluded.beds_available,
                icu_beds_available=excluded.icu_beds_available,
                capacity=excluded.capacity,
                trauma_level=excluded.trauma_level,
                emergency_department=excluded.emergency_department,
                blood_bank_status=excluded.blood_bank_status,
                oxygen_reserve_hrs=excluded.oxygen_reserve_hrs,
                current_intake_queue=excluded.current_intake_queue
        """, hos)

    # 4. Seed Road Events with corridor details
    road_events = [
        (
            "ROAD-001",
            "Road Construction",
            "Flyover widening work on NH-16 Srikakulam Bypass",
            "NH-16 Highway Bypass",
            "National Highway Corridors",
            83.9080,
            18.3080,
            2.5,
            1.45,
            1,
            now_iso,
            now_iso,
        ),
        (
            "ROAD-002",
            "Heavy Congestion",
            "Peak market congestion near Day & Night Junction",
            "Day & Night Urban Arterial",
            "Primary Urban Corridor",
            83.8940,
            18.2970,
            1.5,
            1.30,
            1,
            now_iso,
            now_iso,
        ),
        (
            "ROAD-003",
            "Waterlogging / Hazard",
            "Underpass water stagnation near Nagavali river bridge",
            "Nagavali Bridge Approach",
            "District Transit Route",
            83.8820,
            18.2890,
            1.2,
            1.60,
            1,
            now_iso,
            now_iso,
        ),
    ]

    for event in road_events:
        cursor.execute("""
            INSERT INTO road_events (
                id, type, description, corridor, road_class, longitude,
                latitude, radius_km, delay_multiplier, is_active, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                type=excluded.type,
                description=excluded.description,
                corridor=excluded.corridor,
                road_class=excluded.road_class,
                longitude=excluded.longitude,
                latitude=excluded.latitude,
                radius_km=excluded.radius_km,
                delay_multiplier=excluded.delay_multiplier,
                updated_at=excluded.updated_at
        """, event)

    # 5. Seed initial audit log record if empty
    log_count = cursor.execute("SELECT COUNT(*) as c FROM audit_logs").fetchone()["c"]
    if log_count == 0:
        cursor.execute("""
            INSERT INTO audit_logs (timestamp, actor, action, entity_type, entity_id, details, reasoning)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            now_iso,
            "SYSTEM_INIT",
            "INITIALIZE_COMMAND_CENTER",
            "SYSTEM",
            "SRIKAKULAM_SECTOR",
            "AERT Next-Generation EOC system initialized for Srikakulam District.",
            "Platform boot with telemetry seeds and rule-based decision support.",
        ))

    connection.commit()


# ------------------------------------------------------------
# INCIDENT OPERATIONS & LIFECYCLE MANAGEMENT
# ------------------------------------------------------------

def _row_to_incident_dict(row: sqlite3.Row) -> Dict[str, Any]:
    return {
        "id": row["id"],
        "type": row["type"],
        "location": row["location"],
        "severity": row["severity"],
        "victims": row["victims"],
        "critical_victims": row["critical_victims"] if "critical_victims" in row.keys() else 0,
        "hazard_type": row["hazard_type"] if "hazard_type" in row.keys() else "Standard",
        "coordinates": [row["longitude"], row["latitude"]],
        "status": row["status"],
        "lifecycle_status": row["lifecycle_status"] if "lifecycle_status" in row.keys() else "VERIFIED",
        "location_source": row["location_source"] if "location_source" in row.keys() else "Caller Landmark",
        "location_confidence": row["location_confidence"] if "location_confidence" in row.keys() else 90,
        "assigned_ambulance_id": row["assigned_ambulance_id"] if "assigned_ambulance_id" in row.keys() else None,
        "destination_hospital_id": row["destination_hospital_id"] if "destination_hospital_id" in row.keys() else None,
        "reported_at": row["reported_at"],
        "verified_at": row["verified_at"] if "verified_at" in row.keys() else None,
        "dispatched_at": row["dispatched_at"] if "dispatched_at" in row.keys() else None,
        "en_route_at": row["en_route_at"] if "en_route_at" in row.keys() else None,
        "on_scene_at": row["on_scene_at"] if "on_scene_at" in row.keys() else None,
        "transporting_at": row["transporting_at"] if "transporting_at" in row.keys() else None,
        "hospital_at": row["hospital_at"] if "hospital_at" in row.keys() else None,
        "resolved_at": row["resolved_at"] if "resolved_at" in row.keys() else None,
        "source_call": row["source_call"] if "source_call" in row.keys() else None,
        "override_reason": row["override_reason"] if "override_reason" in row.keys() else None,
        "notes": row["notes"] if "notes" in row.keys() else None,
        "sector": "Srikakulam District",
        "provenance": {
            "source": row["location_source"] if "location_source" in row.keys() else "Caller Landmark",
            "confidence_pct": row["location_confidence"] if "location_confidence" in row.keys() else 90,
            "data_mode": "Prototype Geocoded / Verified",
        },
    }


def get_incidents() -> List[Dict[str, Any]]:
    connection = get_connection()
    rows = connection.execute("""
        SELECT * FROM incidents
        ORDER BY reported_at DESC
    """).fetchall()
    connection.close()
    return [_row_to_incident_dict(r) for r in rows]


def get_incident(incident_id: str) -> Optional[Dict[str, Any]]:
    connection = get_connection()
    row = connection.execute("SELECT * FROM incidents WHERE id = ?", (incident_id,)).fetchone()
    connection.close()
    if row is None:
        return None
    return _row_to_incident_dict(row)


def create_incident(data: dict) -> Dict[str, Any]:
    connection = get_connection()
    incident_id = data.get("id")
    now_iso = datetime.now().isoformat()

    if not incident_id:
        count = connection.execute("SELECT COUNT(*) as c FROM incidents").fetchone()["c"]
        incident_id = f"INC-{count + 1:03d}"

    connection.execute("""
        INSERT INTO incidents (
            id, type, location, severity, victims, critical_victims, hazard_type,
            longitude, latitude, status, lifecycle_status, location_source,
            location_confidence, assigned_ambulance_id, destination_hospital_id,
            reported_at, verified_at, source_call, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        incident_id,
        data.get("type", "General Emergency"),
        data.get("location", "Srikakulam Sector"),
        str(data.get("severity", "MEDIUM")).upper(),
        int(data.get("victims", 1)),
        int(data.get("critical_victims", 0)),
        data.get("hazard_type", "Standard"),
        float(data["coordinates"][0]),
        float(data["coordinates"][1]),
        data.get("status", "ACTIVE"),
        data.get("lifecycle_status", "VERIFIED"),
        data.get("location_source", "Caller Landmark"),
        int(data["location_confidence"]) if data.get("location_confidence") is not None else None,
        data.get("assigned_ambulance_id", None),
        data.get("destination_hospital_id", None),
        data.get("reported_at", now_iso),
        data.get("verified_at", now_iso),
        data.get("source_call", None),
        data.get("notes", None),
    ))
    connection.commit()
    connection.close()

    # Log to audit trail
    record_audit_log(
        actor="OPERATOR",
        action="INCIDENT_CREATED",
        entity_type="INCIDENT",
        entity_id=incident_id,
        details=f"Created {incident_id}: {data.get('type')} at {data.get('location')} with {data.get('victims')} victim(s).",
    )

    return get_incident(incident_id)


def update_incident_lifecycle(
    incident_id: str,
    lifecycle_status: str,
    ambulance_id: Optional[str] = None,
    hospital_id: Optional[str] = None,
    actor: str = "OPERATOR",
    notes: Optional[str] = None,
) -> Optional[Dict[str, Any]]:
    stage = str(lifecycle_status).upper()
    if stage not in VALID_LIFECYCLE_STAGES:
        raise ValueError(f"Invalid lifecycle stage: {stage}")

    now_iso = datetime.now().isoformat()
    connection = get_connection()

    # Map stage to timestamp column and main status
    stage_ts_map = {
        "VERIFIED": "verified_at",
        "DISPATCHED": "dispatched_at",
        "EN_ROUTE": "en_route_at",
        "ON_SCENE": "on_scene_at",
        "TRANSPORTING": "transporting_at",
        "ARRIVED_HOSPITAL": "hospital_at",
        "RESOLVED": "resolved_at",
    }

    # Main status mapping
    if stage in ["CALL_RECEIVED", "TRIAGE", "VERIFIED", "DISPATCH_PENDING"]:
        main_status = "ACTIVE"
    elif stage in ["DISPATCHED", "EN_ROUTE", "ON_SCENE", "TRANSPORTING", "ARRIVED_HOSPITAL"]:
        main_status = "DISPATCHED"
    else:
        main_status = "RESOLVED"

    # Build dynamic update
    update_parts = ["lifecycle_status = ?", "status = ?"]
    params = [stage, main_status]

    ts_col = stage_ts_map.get(stage)
    if ts_col:
        update_parts.append(f"{ts_col} = COALESCE({ts_col}, ?)")
        params.append(now_iso)

    if ambulance_id:
        update_parts.append("assigned_ambulance_id = ?")
        params.append(ambulance_id)

    if hospital_id:
        update_parts.append("destination_hospital_id = ?")
        params.append(hospital_id)

    if notes:
        update_parts.append("notes = ?")
        params.append(notes)

    params.append(incident_id)
    sql = f"UPDATE incidents SET {', '.join(update_parts)} WHERE id = ?"

    connection.execute(sql, params)
    connection.commit()
    connection.close()

    # Audit log
    record_audit_log(
        actor=actor,
        action=f"STAGE_TRANSITION_{stage}",
        entity_type="INCIDENT",
        entity_id=incident_id,
        details=f"Incident {incident_id} transitioned to stage '{stage}' (Assigned EMS: {ambulance_id or 'Unchanged'}, Hospital: {hospital_id or 'Unchanged'}).",
    )

    return get_incident(incident_id)


def update_incident_status(incident_id: str, status: str) -> Optional[Dict[str, Any]]:
    # Legacy wrapper compatibility
    status_upper = status.upper()
    lifecycle = "RESOLVED" if status_upper == "RESOLVED" else ("DISPATCHED" if status_upper == "DISPATCHED" else "VERIFIED")
    return update_incident_lifecycle(incident_id, lifecycle)


def record_operator_override(
    incident_id: str,
    selected_ambulance_id: str,
    selected_hospital_id: str,
    ai_recommended_ambulance_id: Optional[str],
    ai_recommended_hospital_id: Optional[str],
    override_reason: str,
    actor: str = "OPERATOR_COMMANDER",
) -> Dict[str, Any]:
    connection = get_connection()
    now_iso = datetime.now().isoformat()

    connection.execute("""
        UPDATE incidents
        SET assigned_ambulance_id = ?,
            destination_hospital_id = ?,
            override_reason = ?,
            lifecycle_status = 'DISPATCHED',
            status = 'DISPATCHED',
            dispatched_at = COALESCE(dispatched_at, ?)
        WHERE id = ?
    """, (selected_ambulance_id, selected_hospital_id, override_reason, now_iso, incident_id))
    connection.commit()
    connection.close()

    # Also update ambulance status to BUSY
    update_ambulance_status(selected_ambulance_id, "BUSY", incident_id)

    # Detailed Audit Log Entry
    details = (
        f"OPERATOR OVERRIDE: Human commander selected Ambulance {selected_ambulance_id} "
        f"(AI recommended: {ai_recommended_ambulance_id or 'None'}) and Hospital {selected_hospital_id} "
        f"(AI recommended: {ai_recommended_hospital_id or 'None'}). Reason: {override_reason}"
    )

    record_audit_log(
        actor=actor,
        action="OPERATOR_OVERRIDE_DISPATCH",
        entity_type="INCIDENT",
        entity_id=incident_id,
        details=details,
        reasoning=override_reason,
        override_flag=1,
    )

    return {
        "success": True,
        "incident": get_incident(incident_id),
        "override_details": {
            "selected_ambulance": selected_ambulance_id,
            "selected_hospital": selected_hospital_id,
            "ai_ambulance": ai_recommended_ambulance_id,
            "ai_hospital": ai_recommended_hospital_id,
            "reason": override_reason,
            "timestamp": now_iso,
        },
    }


# ------------------------------------------------------------
# AMBULANCE FLEET OPERATIONS
# ------------------------------------------------------------

def get_ambulances() -> List[Dict[str, Any]]:
    connection = get_connection()
    rows = connection.execute("SELECT * FROM ambulances ORDER BY id ASC").fetchall()
    connection.close()

    ambulances = []
    for r in rows:
        eq = []
        if "equipment_json" in r.keys() and r["equipment_json"]:
            try:
                eq = json.loads(r["equipment_json"])
            except Exception:
                eq = []

        ambulances.append({
            "id": r["id"],
            "type": r["type"] if "type" in r.keys() else "ALS",
            "coordinates": [r["longitude"], r["latitude"]],
            "status": r["status"],
            "crew": r["crew"],
            "crew_cert": r["crew_cert"] if "crew_cert" in r.keys() else "Advanced Paramedic Specialist",
            "equipment": eq,
            "fuel_pct": r["fuel_pct"] if "fuel_pct" in r.keys() else 95,
            "current_assignment": r["current_assignment"] if "current_assignment" in r.keys() else None,
            "telemetry_updated_at": r["telemetry_updated_at"] if "telemetry_updated_at" in r.keys() else datetime.now().isoformat(),
            "sector": "Srikakulam Sector",
            "position_type": "Simulated Fleet Position",
            "telemetry_source": "AERT AVL Telemetry Engine (Prototype / Simulated)",
        })
    return ambulances


def update_ambulance_status(
    ambulance_id: str,
    status: str,
    current_assignment: Optional[str] = None,
) -> Optional[Dict[str, Any]]:
    now_iso = datetime.now().isoformat()
    connection = get_connection()
    connection.execute("""
        UPDATE ambulances
        SET status = ?,
            current_assignment = ?,
            telemetry_updated_at = ?
        WHERE id = ?
    """, (status.upper(), current_assignment, now_iso, ambulance_id))
    connection.commit()
    connection.close()

    record_audit_log(
        actor="EMS_DISPATCHER",
        action="AMBULANCE_STATUS_UPDATE",
        entity_type="AMBULANCE",
        entity_id=ambulance_id,
        details=f"Ambulance {ambulance_id} status updated to {status.upper()} (Assignment: {current_assignment or 'None'}).",
    )

    ambs = get_ambulances()
    return next((a for a in ambs if a["id"] == ambulance_id), None)


# ------------------------------------------------------------
# HOSPITAL NETWORK & TRAUMA OPERATIONS
# ------------------------------------------------------------

def get_hospitals() -> List[Dict[str, Any]]:
    connection = get_connection()
    rows = connection.execute("SELECT * FROM hospitals ORDER BY id ASC").fetchall()
    connection.close()

    return [
        {
            "id": r["id"],
            "name": r["name"],
            "coordinates": [r["longitude"], r["latitude"]],
            "beds_available": r["beds_available"],
            "icu_beds_available": r["icu_beds_available"] if "icu_beds_available" in r.keys() else 4,
            "capacity": r["capacity"],
            "trauma_level": r["trauma_level"] if "trauma_level" in r.keys() else "Level 1 Trauma Center",
            "emergency_department": bool(r["emergency_department"]),
            "blood_bank_status": r["blood_bank_status"] if "blood_bank_status" in r.keys() else "AVAILABLE",
            "oxygen_reserve_hrs": r["oxygen_reserve_hrs"] if "oxygen_reserve_hrs" in r.keys() else 48,
            "current_intake_queue": r["current_intake_queue"] if "current_intake_queue" in r.keys() else 0,
            "sector": "Srikakulam District",
            "network": "Srikakulam Healthcare Trauma Network",
        }
        for r in rows
    ]


def create_hospital_pre_alert(
    incident_id: str,
    hospital_id: str,
    ambulance_id: str,
    severity: str,
    patient_summary: str,
    estimated_eta_mins: int,
    trauma_requirements: str,
) -> Dict[str, Any]:
    connection = get_connection()
    pre_alert_id = f"PRE-{incident_id}-{hospital_id}"
    now_iso = datetime.now().isoformat()

    connection.execute("""
        INSERT INTO hospital_pre_alerts (
            id, incident_id, hospital_id, ambulance_id, severity,
            patient_summary, estimated_eta_mins, trauma_requirements,
            status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'TRANSMITTED', ?)
        ON CONFLICT(id) DO UPDATE SET
            severity=excluded.severity,
            patient_summary=excluded.patient_summary,
            estimated_eta_mins=excluded.estimated_eta_mins,
            trauma_requirements=excluded.trauma_requirements,
            status='TRANSMITTED',
            created_at=excluded.created_at
    """, (
        pre_alert_id,
        incident_id,
        hospital_id,
        ambulance_id,
        severity,
        patient_summary,
        estimated_eta_mins,
        trauma_requirements,
        now_iso,
    ))
    connection.commit()
    connection.close()

    record_audit_log(
        actor="AI_DECISION_SUPPORT",
        action="HOSPITAL_PRE_ALERT_TRANSMITTED",
        entity_type="HOSPITAL_PRE_ALERT",
        entity_id=pre_alert_id,
        details=f"Transmitted Pre-Alert to {hospital_id} for {incident_id} (ETA: ~{estimated_eta_mins} min, Severity: {severity}).",
    )

    return {
        "id": pre_alert_id,
        "incident_id": incident_id,
        "hospital_id": hospital_id,
        "ambulance_id": ambulance_id,
        "severity": severity,
        "patient_summary": patient_summary,
        "estimated_eta_mins": estimated_eta_mins,
        "trauma_requirements": trauma_requirements,
        "status": "TRANSMITTED",
        "transmission_type": "Simulated Hospital Pre-Alert Protocol (Prototype)",
        "created_at": now_iso,
    }


def get_hospital_pre_alerts() -> List[Dict[str, Any]]:
    connection = get_connection()
    rows = connection.execute("SELECT * FROM hospital_pre_alerts ORDER BY created_at DESC LIMIT 20").fetchall()
    connection.close()
    return [dict(r) for r in rows]


# ------------------------------------------------------------
# ROAD INTELLIGENCE OPERATIONS
# ------------------------------------------------------------

def get_road_events() -> List[Dict[str, Any]]:
    connection = get_connection()
    rows = connection.execute("SELECT * FROM road_events ORDER BY created_at DESC").fetchall()
    connection.close()

    return [
        {
            "id": r["id"],
            "type": r["type"],
            "description": r["description"],
            "corridor": r["corridor"] if "corridor" in r.keys() else "Srikakulam Corridor",
            "road_class": r["road_class"] if "road_class" in r.keys() else "National Highway",
            "longitude": r["longitude"],
            "latitude": r["latitude"],
            "coordinates": [r["longitude"], r["latitude"]],
            "radius_km": r["radius_km"],
            "delay_multiplier": r["delay_multiplier"],
            "is_active": bool(r["is_active"]),
            "created_at": r["created_at"],
            "updated_at": r["updated_at"] if "updated_at" in r.keys() else r["created_at"],
            "sector": "Srikakulam District",
            "data_type": "Prototype Road Intelligence (Simulated Factors)",
        }
        for r in rows
    ]


def create_road_event(data: dict) -> Dict[str, Any]:
    connection = get_connection()
    cursor = connection.cursor()

    existing = cursor.execute("SELECT COUNT(*) as count FROM road_events").fetchone()
    count = existing["count"] if existing else 0
    new_id = data.get("id") or f"ROAD-{count + 1:03d}"
    now_iso = datetime.now().isoformat()

    cursor.execute("""
        INSERT INTO road_events (
            id, type, description, corridor, road_class, longitude,
            latitude, radius_km, delay_multiplier, is_active, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        new_id,
        data.get("type", "Road Event"),
        data.get("description", ""),
        data.get("corridor", "Srikakulam Transit Corridor"),
        data.get("road_class", "National Highway"),
        float(data.get("longitude", 83.8961)),
        float(data.get("latitude", 18.2969)),
        float(data.get("radius_km", 2.0)),
        float(data.get("delay_multiplier", 1.3)),
        1 if data.get("is_active", True) else 0,
        now_iso,
        now_iso,
    ))
    connection.commit()
    connection.close()

    record_audit_log(
        actor="TRAFFIC_OPERATOR",
        action="ROAD_EVENT_CREATED",
        entity_type="ROAD_EVENT",
        entity_id=new_id,
        details=f"Created {new_id}: {data.get('type')} (+{data.get('delay_multiplier')}x multiplier on {data.get('corridor', 'Corridor')}).",
    )

    events = get_road_events()
    return next((e for e in events if e["id"] == new_id), None)


def set_road_event_active(event_id: str, is_active: bool) -> Optional[Dict[str, Any]]:
    connection = get_connection()
    now_iso = datetime.now().isoformat()
    connection.execute("""
        UPDATE road_events
        SET is_active = ?,
            updated_at = ?
        WHERE id = ?
    """, (1 if is_active else 0, now_iso, event_id))
    connection.commit()
    connection.close()

    record_audit_log(
        actor="TRAFFIC_OPERATOR",
        action="ROAD_EVENT_TOGGLED",
        entity_type="ROAD_EVENT",
        entity_id=event_id,
        details=f"Road event {event_id} active status changed to {is_active}.",
    )

    events = get_road_events()
    return next((e for e in events if e["id"] == event_id), None)


def delete_road_event(event_id: str) -> Dict[str, Any]:
    connection = get_connection()
    connection.execute("DELETE FROM road_events WHERE id = ?", (event_id,))
    connection.commit()
    connection.close()

    record_audit_log(
        actor="TRAFFIC_OPERATOR",
        action="ROAD_EVENT_DELETED",
        entity_type="ROAD_EVENT",
        entity_id=event_id,
        details=f"Road condition {event_id} deleted from active registry.",
    )
    return {"deleted": True, "id": event_id}


# ------------------------------------------------------------
# AUDIT LOGGING & COMPLIANCE TRAIL
# ------------------------------------------------------------

def record_audit_log(
    actor: str,
    action: str,
    entity_type: str,
    entity_id: str,
    details: str,
    reasoning: Optional[str] = None,
    override_flag: int = 0,
):
    try:
        connection = get_connection()
        connection.execute("""
            INSERT INTO audit_logs (timestamp, actor, action, entity_type, entity_id, details, reasoning, override_flag)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            datetime.now().isoformat(),
            actor,
            action,
            entity_type,
            entity_id,
            details,
            reasoning,
            override_flag,
        ))
        connection.commit()
        connection.close()
    except Exception as e:
        print(f"Error writing audit log: {e}")


def get_audit_logs(limit: int = 100, override_only: bool = False) -> List[Dict[str, Any]]:
    connection = get_connection()
    if override_only:
        rows = connection.execute("""
            SELECT * FROM audit_logs
            WHERE override_flag = 1
            ORDER BY timestamp DESC LIMIT ?
        """, (limit,)).fetchall()
    else:
        rows = connection.execute("""
            SELECT * FROM audit_logs
            ORDER BY timestamp DESC LIMIT ?
        """, (limit,)).fetchall()
    connection.close()
    return [dict(r) for r in rows]


# ------------------------------------------------------------
# RESPONSE HISTORY & ANALYTICS
# ------------------------------------------------------------

def save_response(data: dict):
    connection = get_connection()
    connection.execute("""
        INSERT INTO response_history (
            incident_id, response_level, priority_score, recommended_ambulances,
            ambulance_id, hospital_id, reasoning, confidence_label,
            resource_gap, has_conflict, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        data.get("incident_id"),
        data.get("response_level"),
        data.get("priority_score"),
        data.get("recommended_ambulances_count"),
        data.get("recommended_ambulance", {}).get("id") if isinstance(data.get("recommended_ambulance"), dict) else None,
        data.get("recommended_hospital", {}).get("id") if isinstance(data.get("recommended_hospital"), dict) else None,
        "; ".join(data.get("reasoning", [])) if isinstance(data.get("reasoning"), list) else str(data.get("reasoning", "")),
        data.get("confidence_label", "Standard"),
        data.get("resource_gap", 0),
        1 if data.get("has_conflict") else 0,
        datetime.now().isoformat(),
    ))
    connection.commit()
    connection.close()


def get_response_history(incident_id: str = None, limit: int = 50) -> List[Dict[str, Any]]:
    connection = get_connection()
    if incident_id:
        rows = connection.execute("""
            SELECT * FROM response_history
            WHERE incident_id = ?
            ORDER BY created_at DESC
        """, (incident_id,)).fetchall()
    else:
        rows = connection.execute("""
            SELECT * FROM response_history
            ORDER BY created_at DESC LIMIT ?
        """, (limit,)).fetchall()
    connection.close()
    return [dict(r) for r in rows]


def get_analytics_summary() -> Dict[str, Any]:
    incidents = get_incidents()
    ambulances = get_ambulances()
    hospitals = get_hospitals()
    road_events = get_road_events()
    responses = get_response_history()
    audit_logs = get_audit_logs(limit=200)

    severity_counts = {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0}
    type_counts = {}
    lifecycle_counts = {stage: 0 for stage in VALID_LIFECYCLE_STAGES}
    status_counts = {"ACTIVE": 0, "DISPATCHED": 0, "RESOLVED": 0}
    total_victims = 0
    total_critical_victims = 0

    for inc in incidents:
        sev = str(inc.get("severity", "MEDIUM")).upper()
        severity_counts[sev] = severity_counts.get(sev, 0) + 1

        t = inc.get("type", "Unknown")
        type_counts[t] = type_counts.get(t, 0) + 1

        stat = str(inc.get("status", "ACTIVE")).upper()
        status_counts[stat] = status_counts.get(stat, 0) + 1

        l_stat = str(inc.get("lifecycle_status", "VERIFIED")).upper()
        lifecycle_counts[l_stat] = lifecycle_counts.get(l_stat, 0) + 1

        total_victims += int(inc.get("victims", 0))
        total_critical_victims += int(inc.get("critical_victims", 0))

    ambulance_status = {"AVAILABLE": 0, "BUSY": 0, "OFFLINE": 0}
    ambulance_types = {"ALS": 0, "BLS": 0}
    for amb in ambulances:
        st = str(amb.get("status", "AVAILABLE")).upper()
        ambulance_status[st] = ambulance_status.get(st, 0) + 1
        t = str(amb.get("type", "ALS")).upper()
        ambulance_types[t] = ambulance_types.get(t, 0) + 1

    total_beds = sum(int(h.get("beds_available", 0)) for h in hospitals)
    total_icu_beds = sum(int(h.get("icu_beds_available", 0)) for h in hospitals)
    avg_hospital_load = (sum(float(h.get("capacity", 0)) for h in hospitals) / len(hospitals)) if hospitals else 0.0

    avg_priority_score = (sum(float(r.get("priority_score") or 0) for r in responses) / len(responses)) if responses else 0.0

    # Override / AI Acceptance analytics
    override_count = sum(1 for log in audit_logs if log.get("override_flag") == 1)
    dispatch_count = sum(1 for log in audit_logs if "DISPATCH" in str(log.get("action", "")))
    ai_agreement_pct = round(100.0 - ((override_count / max(1, dispatch_count)) * 100.0), 1) if dispatch_count > 0 else 100.0

    # Resource Shortage Detection Sector Analysis
    active_critical = sum(1 for inc in incidents if inc["status"] == "ACTIVE" and inc["severity"] in ["CRITICAL", "HIGH"])
    avail_suitable = sum(1 for amb in ambulances if amb["status"] == "AVAILABLE")
    resource_gap = max(0, active_critical - avail_suitable)

    return {
        "region": "Srikakulam District, Andhra Pradesh, India",
        "total_incidents": len(incidents),
        "active_incidents": status_counts.get("ACTIVE", 0),
        "dispatched_incidents": status_counts.get("DISPATCHED", 0),
        "resolved_incidents": status_counts.get("RESOLVED", 0),
        "total_victims_affected": total_victims,
        "total_critical_victims": total_critical_victims,
        "severity_distribution": severity_counts,
        "type_distribution": type_counts,
        "status_distribution": status_counts,
        "lifecycle_distribution": lifecycle_counts,
        "total_ambulances": len(ambulances),
        "ambulance_status": ambulance_status,
        "ambulance_types": ambulance_types,
        "total_hospitals": len(hospitals),
        "total_available_beds": total_beds,
        "total_available_icu_beds": total_icu_beds,
        "average_hospital_load_pct": round(avg_hospital_load, 1),
        "active_road_events_count": sum(1 for e in road_events if e.get("is_active")),
        "total_road_events_count": len(road_events),
        "total_decision_evaluations": len(responses),
        "average_priority_score": round(avg_priority_score, 1),
        "override_count": override_count,
        "ai_agreement_rate_pct": ai_agreement_pct,
        "sector_resource_shortage": {
            "active_critical_incidents": active_critical,
            "available_suitable_ambulances": avail_suitable,
            "resource_gap": resource_gap,
            "shortage_alert": resource_gap > 0,
        },
        "generated_at": datetime.now().isoformat(),
    }


# ------------------------------------------------------------
# DEMO SCENARIO LOADER (7 Realistic Operational Scenarios)
# ------------------------------------------------------------

def reset_demo_scenario(scenario_id: str) -> Dict[str, Any]:
    connection = get_connection()
    now = datetime.now()

    # Clear current operational state
    connection.execute("DELETE FROM incidents")
    connection.execute("DELETE FROM ambulances")
    connection.execute("DELETE FROM hospitals")
    connection.execute("DELETE FROM road_events")
    connection.commit()
    connection.close()

    # Reinitialize base tables
    init_database()

    connection = get_connection()
    cursor = connection.cursor()

    scenario_name = "Default Scenario"
    scenario_desc = ""

    if scenario_id == "nh16_collision":
        scenario_name = "NH-16 Major Multi-Vehicle Highway Collision"
        scenario_desc = "Critical collision with multiple entrapped casualties along NH-16 bypass corridor near Nagavali River."
        cursor.execute("""
            INSERT INTO incidents (
                id, type, location, severity, victims, critical_victims, hazard_type,
                longitude, latitude, status, lifecycle_status, location_source,
                location_confidence, reported_at, verified_at, source_call, notes
            ) VALUES (
                'INC-001', 'Major Highway Collision', 'NH-16 Srikakulam Bypass Km 42', 'CRITICAL',
                9, 3, 'Entrapment, Fuel Spillage & High-Speed Highway Obstruction',
                83.9050, 18.3050, 'ACTIVE', 'DISPATCH_PENDING', 'Highway Patrol AVL & Caller Landmark',
                96, ?, ?, 'CALL-00821', 'Critical triage: 3 ALS units needed immediately.'
            )
            ON CONFLICT(id) DO UPDATE SET
                type=excluded.type,
                location=excluded.location,
                severity=excluded.severity,
                victims=excluded.victims,
                critical_victims=excluded.critical_victims,
                hazard_type=excluded.hazard_type,
                longitude=excluded.longitude,
                latitude=excluded.latitude,
                status=excluded.status,
                lifecycle_status=excluded.lifecycle_status,
                location_source=excluded.location_source,
                location_confidence=excluded.location_confidence,
                reported_at=excluded.reported_at,
                verified_at=excluded.verified_at,
                source_call=excluded.source_call,
                notes=excluded.notes
        """, (now.isoformat(), now.isoformat()))

    elif scenario_id == "palakonda_rollover":
        scenario_name = "Palakonda Road Auto-Rickshaw Rollover"
        scenario_desc = "Overturned passenger auto near District Collectorate with roadway glass debris."
        cursor.execute("""
            INSERT INTO incidents (
                id, type, location, severity, victims, critical_victims, hazard_type,
                longitude, latitude, status, lifecycle_status, location_source,
                location_confidence, reported_at, verified_at, source_call, notes
            ) VALUES (
                'INC-002', 'Vehicle Overturn', 'Palakonda Road Near Collectorate', 'HIGH',
                3, 0, 'Glass & Vehicle Debris on Roadway',
                83.8920, 18.2980, 'ACTIVE', 'VERIFIED', 'Shopkeeper Verified',
                95, ?, ?, 'CALL-00822', 'Conscious head trauma patients.'
            )
            ON CONFLICT(id) DO UPDATE SET
                type=excluded.type,
                location=excluded.location,
                severity=excluded.severity,
                victims=excluded.victims,
                critical_victims=excluded.critical_victims,
                hazard_type=excluded.hazard_type,
                status=excluded.status,
                lifecycle_status=excluded.lifecycle_status,
                notes=excluded.notes
        """, (now.isoformat(), now.isoformat()))

    elif scenario_id == "cardiac_emergency":
        scenario_name = "7 Road Junction Severe Cardiac Arrest"
        scenario_desc = "Time-critical myocardial infarction at city clinic requiring immediate Advanced Life Support (ALS)."
        cursor.execute("""
            INSERT INTO incidents (
                id, type, location, severity, victims, critical_victims, hazard_type,
                longitude, latitude, status, lifecycle_status, location_source,
                location_confidence, reported_at, verified_at, source_call, notes
            ) VALUES (
                'INC-003', 'Medical Emergency / Cardiac', '7 Road Junction, Srikakulam Central', 'CRITICAL',
                1, 1, 'Acute Myocardial Infarction / Defibrillation & Oxygen Required',
                83.8961, 18.2969, 'ACTIVE', 'DISPATCH_PENDING', 'Medical Staff Geocoded',
                99, ?, ?, 'CALL-00823', 'ALS unit with cardiac monitor mandatory.'
            )
            ON CONFLICT(id) DO UPDATE SET
                type=excluded.type,
                location=excluded.location,
                severity=excluded.severity,
                victims=excluded.victims,
                critical_victims=excluded.critical_victims,
                hazard_type=excluded.hazard_type,
                status=excluded.status,
                lifecycle_status=excluded.lifecycle_status,
                notes=excluded.notes
        """, (now.isoformat(), now.isoformat()))

    elif scenario_id == "industrial_fire":
        scenario_name = "Industrial Chemical Fire & Hazardous Smoke"
        scenario_desc = "Chemical storage fire near Singupuram Industrial Estate with toxic vapor release."
        cursor.execute("""
            INSERT INTO incidents (
                id, type, location, severity, victims, critical_victims, hazard_type,
                longitude, latitude, status, lifecycle_status, location_source,
                location_confidence, reported_at, verified_at, source_call, notes
            ) VALUES (
                'INC-004', 'Industrial Chemical Fire', 'Singupuram Industrial Area, Srikakulam', 'CRITICAL',
                12, 4, 'Toxic Chemical Smoke & Secondary Explosion Risk',
                83.8650, 18.3200, 'ACTIVE', 'DISPATCH_PENDING', 'Industrial Safety Officer',
                98, ?, ?, 'CALL-00824', 'Mass casualty staging and burn unit coordination needed.'
            )
            ON CONFLICT(id) DO UPDATE SET
                type=excluded.type,
                location=excluded.location,
                severity=excluded.severity,
                victims=excluded.victims,
                critical_victims=excluded.critical_victims,
                hazard_type=excluded.hazard_type,
                status=excluded.status,
                lifecycle_status=excluded.lifecycle_status,
                notes=excluded.notes
        """, (now.isoformat(), now.isoformat()))

    elif scenario_id == "resource_shortage_crisis":
        scenario_name = "Multi-Incident Sector Resource Shortage Crisis"
        scenario_desc = "Multiple concurrent high-severity emergencies across district exceeding available suitable ambulances."
        # Set 3 ambulances to BUSY
        cursor.execute("UPDATE ambulances SET status = 'BUSY' WHERE id IN ('AMB-001', 'AMB-002', 'AMB-003')")
        # Create 3 critical/high incidents
        cursor.execute("""
            INSERT INTO incidents (id, type, location, severity, victims, critical_victims, longitude, latitude, status, lifecycle_status, reported_at)
            VALUES
            ('INC-005', 'Major Highway Collision', 'NH-16 Toll Plaza Srikakulam', 'CRITICAL', 6, 2, 83.9200, 18.3120, 'ACTIVE', 'DISPATCH_PENDING', ?),
            ('INC-006', 'Industrial Boiler Rupture', 'Singupuram Industrial Sector', 'CRITICAL', 5, 2, 83.8680, 18.3180, 'ACTIVE', 'DISPATCH_PENDING', ?),
            ('INC-007', 'Mass Transit Overturn', 'Palakonda Ghat Road', 'HIGH', 4, 1, 83.8800, 18.2890, 'ACTIVE', 'DISPATCH_PENDING', ?)
        """, (now.isoformat(), (now - timedelta(minutes=3)).isoformat(), (now - timedelta(minutes=6)).isoformat()))

    elif scenario_id == "hospital_saturation":
        scenario_name = "Regional Trauma Center Capacity Crisis"
        scenario_desc = "Primary hospitals near 95% occupancy, forcing patient redirection to secondary trauma centers."
        cursor.execute("UPDATE hospitals SET capacity = 96.0, beds_available = 1, icu_beds_available = 0 WHERE id = 'HOS-001'")
        cursor.execute("UPDATE hospitals SET capacity = 94.0, beds_available = 2, icu_beds_available = 1 WHERE id = 'HOS-002'")
        cursor.execute("""
            INSERT INTO incidents (id, type, location, severity, victims, critical_victims, longitude, latitude, status, lifecycle_status, reported_at)
            VALUES ('INC-008', 'Severe Head Trauma', 'Day & Night Junction', 'CRITICAL', 3, 2, 83.8961, 18.2969, 'ACTIVE', 'DISPATCH_PENDING', ?)
        """, (now.isoformat(),))

    elif scenario_id == "road_closure_reroute":
        scenario_name = "NH-16 Nagavali Bridge Total Corridor Closure"
        scenario_desc = "Severe road event causing +2.4x delay multiplier requiring algorithmic rerouting."
        cursor.execute("""
            INSERT INTO road_events (id, type, description, corridor, road_class, longitude, latitude, radius_km, delay_multiplier, is_active, created_at, updated_at)
            VALUES ('ROAD-099', 'Bridge Structural Hazard', 'Nagavali River Bridge emergency closure', 'NH-16 Srikakulam Corridor', 'National Highway', 83.8820, 18.2890, 4.0, 2.40, 1, ?, ?)
        """, (now.isoformat(), now.isoformat()))
        cursor.execute("""
            INSERT INTO incidents (id, type, location, severity, victims, critical_victims, longitude, latitude, status, lifecycle_status, reported_at)
            VALUES ('INC-009', 'Highway Crash Behind Roadblock', 'NH-16 South of Nagavali Bridge', 'HIGH', 4, 1, 83.8810, 18.2840, 'ACTIVE', 'DISPATCH_PENDING', ?)
        """, (now.isoformat(),))

    connection.commit()
    connection.close()

    record_audit_log(
        actor="DEMO_ENGINE",
        action="DEMO_SCENARIO_LOADED",
        entity_type="SCENARIO",
        entity_id=scenario_id,
        details=f"Loaded operational demonstration scenario: {scenario_name}.",
    )

    return {
        "success": True,
        "scenario_id": scenario_id,
        "scenario_name": scenario_name,
        "scenario_description": scenario_desc,
        "analytics": get_analytics_summary(),
        "timestamp": now.isoformat(),
    }


if __name__ == "__main__":
    init_database()
    print(f"AERT Next-Gen Srikakulam Database Initialized at {DB_PATH}")
