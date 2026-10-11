---
name: aert-operator
description: Standard operational procedures and triage runbook for the AERT 3.0 Emergency Response Platform in Srikakulam District.
---

# AERT 3.0 Emergency Operator Runbook

This skill provides step-by-step procedures for managing live emergencies, dispatching units, coordinating hospital trauma pre-alerts, running multi-agent AI assessments, and executing the 18-step Golden Vertical Slice in **Srikakulam District, Andhra Pradesh (`AP-SKLM-EOC-01`)**.

---

## 1. Universal Keyboard Controls & Navigation
- **`G`**: Launch the **18-Step Golden Vertical Slice** full-lifecycle integration mission.
- **`M`**: Seamlessly toggle between **2D GIS MapLibre Vector Map** and **3D WebGL Digital Twin**.
- **`Ctrl+K` / `Cmd+K`**: Open the universal **Command Palette Omnibar** to search across all 10 workspaces, incidents, ambulances, hospitals, and simulation scenarios.
- **`1`, `2`, `3`**: Quick-focus camera and telemetry on priority active emergencies (`INC-1042`, `INC-1043`, `INC-1044`).
- **10 Core Tactical Workspaces**: Selectable from the left collapsible dock (`Overwatch`, `Live Response`, `Call Center`, `Incidents`, `Fleet`, `Medical`, `Geo Intel`, `AI Command`, `Digital Twin`, `Analytics`).

---

## 2. Emergency Call Center & Voice Intake (`03 CALL CENTER`)
1. Receive incoming 108 / 112 citizen call in Column 1.
2. Monitor real-time encrypted audio waveform and live speech transcription stream in Column 2.
3. Review AI entity extraction in Column 3:
   - Incident type & casualty count (with ALS requirement flags).
   - Resolved landmark coordinates within Srikakulam bounds (`[83.70, 18.15]` to `[84.15, 18.50]`).
   - Location confidence score (90–99%).
4. Click **Verify & Create Incident** to register the structured incident into the unified operational world.

---

## 3. Incident Command & Transparent Multi-Criteria Triage (`04 INCIDENTS`)
1. Select active emergency in the incident matrix.
2. Review the transparent severity & priority scoring formula:
   $$\text{Priority Score} = \text{Base Points} + \text{Casualty Points} + \text{Critical Casualty Points} + \text{Hazard Multiplier}$$
3. Evaluate AI recommended response package vs alternative units.
4. Execute Human-in-the-Loop approval gate (**Approve Dispatch** or **Operator Override** with mandatory audit log reason).

---

## 4. Live Response & Ambulance Vector Guidance (`02 LIVE RESPONSE`)
1. Monitor live 8-stage lifecycle: `CALL_RECEIVED` → `TRIAGE` → `DISPATCHED` → `EN_ROUTE` → `ON_SCENE` → `TRANSPORTING` → `ARRIVED_HOSPITAL` → `RESOLVED`.
2. Inspect responder telemetry (speed, fuel, battery, O2 readiness) and cyan route vector casings.
3. Trigger command transitions: **Mark On Scene**, **Start Transport**, **Close Incident**.
4. Generate instant **After-Action SITREP** upon incident resolution.

---

## 5. Hospital Trauma Network & Pre-Alerts (`06 MEDICAL NETWORK`)
1. Monitor real-time ED load percentages and ICU bed saturation across:
   - **RIMS Srikakulam Super Specialty** (Level 1 Trauma, 11 ventilators).
   - **Government General Hospital (GGH)** (Level 2 Trauma, 5 ventilators).
   - **District Community Trauma Care Center** (Level 3 Emergency).
2. Click **Transmit Sonar Pre-Alert** to prepare trauma bays with estimated patient arrival time.

---

## 6. Geospatial Intelligence & Coverage Analysis (`07 GEO INTEL`)
1. Toggle GIS layers: Traffic Corridors, Road Hazards, Nagavali Flood Buffer, 8-minute ALS Isochrones, Singupuram Industrial Plumes.
2. Query the natural language spatial engine (e.g., *"Which sectors currently exceed 8-minute ALS response coverage?"*).
3. Review AI actionable repositioning recommendations to eliminate coverage gaps.

---

## 7. Multi-Agent AI Command & Tool Tracing (`08 AI COMMAND`)
1. Inspect the multi-agent reasoning chain:
   $$\text{Intake Agent} \longrightarrow \text{GIS Agent} \longrightarrow \text{Resource Agent} \longrightarrow \text{Medical Agent} \longrightarrow \text{Risk Agent} \longrightarrow \text{Command Orchestrator}$$
2. Review deterministic tool traces with execution latencies ($\approx 89\text{ ms}$).
3. Audit rejected alternatives and conflict radar before operator sign-off.
