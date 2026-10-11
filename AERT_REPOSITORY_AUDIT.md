# AERT 3.0 — REPOSITORY FORENSIC AUDIT & ARCHITECTURAL BASELINE
**Operational Sector**: Srikakulam District, Andhra Pradesh, India (`AP-SKLM-EOC-01`)  
**Audit Date**: September 2, 2026  
**Auditor**: Lead Systems Architect & Principal Engineer

---

## 1. EXECUTIVE AUDIT SUMMARY

A comprehensive forensic audit of the **AERT** codebase was conducted across all layers: Frontend (React 19 + Vite 8 + MapLibre GL + Three.js), Backend (FastAPI + SQLite + Deterministic Intelligence Engine), Geographic Configurations, Sound Architecture, and Asset Pipelines.

### Key Audit Findings:
1. **Geographic Integrity**: 
   - Srikakulam District (`[83.8961, 18.2969]`) is cleanly established across `backend/database.py`, `backend/intelligence.py`, `backend/test_aert_platform.py`, and `frontend/src/config/geography.js`.
   - **Zero Hyderabad coordinate contamination detected**. 
   - 14/14 automated unit and integration tests in the backend pass with 100% assertions satisfied.

2. **Backend API Completeness**:
   - Backend exposes fully functional REST endpoints for Incidents, Priority Scoring, Multi-step Lifecycles, Operator Overrides, Ambulances, Hospitals, Pre-Alerts, Road Events, Scenario Injections, Audit Logs, and Analytics.
   - Deterministic logic calculates Haversine distances, ETA multipliers, ALS requirements, and bed capacity scoring.
   - Real APIs exist; we must ensure the frontend connects directly to these rather than solely relying on static mocks.

3. **Frontend Architectural Gaps**:
   - **Workspace Fragmentation**: The frontend has legacy components in `src/components/` and newer implementations in `src/features/` and `src/design-system/`.
   - **10 Core Workspaces Requirement**: The directive specifies 10 distinct operational workspace lenses into the unified state:
     1. `01 OVERWATCH` (Flagship District Command)
     2. `02 LIVE RESPONSE` (Active Incident Execution & Handover)
     3. `03 CALL CENTER` (3-column intake: queue, audio/transcript, AI extraction)
     4. `04 INCIDENTS` (Deep incident decision matrix & triage)
     5. `05 FLEET` (Responder traffic control & ALS/BLS telemetry)
     6. `06 MEDICAL NETWORK` (Spatial hospital capacity & trauma readiness)
     7. `07 GEO INTELLIGENCE` (Multi-layer spatial querying & isochrones)
     8. `08 AI COMMAND` (Multi-agent reasoning visualization, tool traces, explainability)
     9. `09 DIGITAL TWIN` (Procedural 3D WebGL city blocks, beacons, landmark twin)
     10. `10 ANALYTICS` (Operational metrics, casualty distributions, SITREPs)
   - **Spatial Dominance (65-75%)**: The spatial canvas (MapLibre 2D / Three.js 3D) must remain the persistent background with collapsible tactical glass panels rather than card-crowded dashboards.
   - **Unified Operational World State**: Single source of truth for incidents, ambulances, hospitals, roads, simulation snapshots, and AI reasoning.

---

## 2. COMPONENT & MODULE INVENTORY

| Subsystem | File Path | Current Status | Reusability / Action |
|---|---|---|---|
| **Backend API** | `backend/main.py` | Operational | **100% Preserve & Integrate**. Clean FastAPI endpoints. |
| **Database & Seed** | `backend/database.py` | Operational | **Preserve**. Clean SQLite schema with Srikakulam seeds. |
| **Intelligence Engine** | `backend/intelligence.py` | Operational | **Preserve**. Multi-criteria scoring, ALS/BLS sizing, conflict detection. |
| **Backend Test Suite** | `backend/test_aert_platform.py` | Operational | **Passes 14/14 tests**. Baseline for regression validation. |
| **Geography Config** | `frontend/src/config/geography.js` | Operational | **Single Source of Truth**. Srikakulam bounds & landmarks. |
| **Audio Engine** | `frontend/src/services/soundManager.js` | Operational | **Preserve & Enhance**. Pure Web Audio API oscillators, zero external MP3s. |
| **API Client** | `frontend/src/api.js` & `services/apiClient.js` | Operational | **Consolidate** into unified typed client service. |
| **Design System Tokens** | `frontend/src/styles/tokens.css` | Operational | **Preserve & Expand**. Nocturnal command palette (`#06090e`, cyan `#00f0ff`, ember red, amber). |
| **Design System UI** | `frontend/src/design-system/components/*` | Operational | **Preserve & Refactor** (TopCommandBar, CommandPalette, AlertStack, Panel, Drawer, Modal). |
| **2D Map** | `frontend/src/features/live-map/MapContainer.jsx` | Operational | **Refactor & Deepen**. Fix import warning, add route glows, hazard polygons, camera choreography. |
| **3D Digital Twin** | `frontend/src/features/digital-twin/DigitalTwinViewport.jsx` | Operational | **Refactor & Elevate**. Three.js procedural Srikakulam 7-Road towers, beacons, responder interpolation. |
| **Simulation** | `frontend/src/features/simulation/SimulationEngine.jsx` | Operational | **Integrate**. Shared state timeline with scenario injection cascading consequences. |
| **Golden Slice Flow** | `frontend/src/features/incidents/GoldenSliceFlow.jsx` | Operational | **Elevate to 18-step full mission** across the unified world state. |
| **Legacy Components** | `frontend/src/components/*` (20 files) | Mixed/Duplicate | **Consolidate** into the 10 domain feature workspaces. |

---

## 3. GEOGRAPHIC & SECTOR VERIFICATION

- **District**: Srikakulam District, Andhra Pradesh, India
- **EOC ID**: `AP-SKLM-EOC-01`
- **Default Center**: `[83.8961, 18.2969]` (7 Road Junction)
- **Bounding Box**: `[83.7000, 18.1500]` to `[84.1500, 18.5000]`
- **Landmarks**: RIMS Srikakulam, GGH Srikakulam, NH-16 Bypass, Singupuram Industrial Corridor, Palakonda Road, Nagavali River Bridge.
- **Verification Result**: **APPROVED — 100% Srikakulam Compliant**.

---

## 4. ARCHITECTURAL BLUEPRINT & TARGET ARCHITECTURE

```text
                     AERT 3.0 MASTER ARCHITECTURE
                                  │
       ┌──────────────────────────┴──────────────────────────┐
       │                                                     │
   AI BRAIN                                            SPATIAL BRAIN
       │                                                     │
 ┌─────┴─────┐                                         ┌─────┴─────┐
 │  AGENTS   │ (Intake, Incident, GIS,                 │  2D GIS   │ (MapLibre Vector/Raster,
 │   TOOLS   │  Resource, Medical, Risk,               │  3D TWIN  │  Three.js Procedural,
 │  EXPLAIN  │  Simulation, Command)                   │ TRANSITION│  Isochrones, Routes)
 └─────┬─────┘                                         └─────┬─────┘
       │                                                     │
       └──────────────────────────┬──────────────────────────┘
                                  │
                       UNIFIED OPERATIONAL WORLD
                                  │
    ┌───────────────┬─────────────┼─────────────┬───────────────┐
    │               │             │             │               │
INCIDENTS         FLEET        HOSPITALS      ROADS         SIMULATION
(Lifecycles)   (ALS/BLS)     (ER/ICU Beds)  (Closures)     (Timeline Scrubber)
    │               │             │             │               │
    └───────────────┴─────────────┼─────────────┴───────────────┘
                                  │
                      HUMAN-IN-THE-LOOP COMMAND
                 (Approve, Modify, Reject, Override)
                                  │
                   10 COLLAPSIBLE WORKSPACE LENSES
```

---

## 5. RECONSTRUCTION PHASING MATRIX

1. **Phase 1**: Architecture & State Model Freeze
2. **Phase 2**: Design Constitution & Design System Tokens
3. **Phase 3**: Tactical Application Shell & Global Navigation (10 Workspaces + Command Palette + Event Stream)
4. **Phase 4**: Spatial Engine (MapLibre 2D + Three.js 3D with Cinematic Pitch/Bearing Transitions)
5. **Phase 5**: `01 OVERWATCH` Workspace (District overview, AI recommendations, conflict radar, bottom stream)
6. **Phase 6**: `02 LIVE RESPONSE` Workspace (Active operational triage, route vectors, ambulance HUD)
7. **Phase 7**: `03 CALL CENTER` Workspace (3-column intake: Audio waveforms, transcript, AI entity extraction)
8. **Phase 8**: `04 INCIDENTS` Workspace (Decision matrix, severity formulas, casualty counts)
9. **Phase 9**: `05 FLEET` + `06 MEDICAL NETWORK` Workspaces (ALS/BLS telemetry, trauma capacities, pre-alerts)
10. **Phase 10**: `07 GEO INTELLIGENCE` + `08 AI COMMAND` Workspaces (Multi-agent traces, tool registries, explainability)
11. **Phase 11**: `09 DIGITAL TWIN` + `12 SIMULATION` Workspaces (Procedural city, scenario injection cascading engine)
12. **Phase 12**: `10 ANALYTICS` Workspace + After-Action Reports (MTTD/MTTS curves, explainable SITREPs)
13. **Phase 13**: Golden Vertical Slice (18-step unified continuous emergency mission triggered by `G`)
14. **Phase 14**: Accessibility, Failure Modes, Performance QA & Web Audio Polish
