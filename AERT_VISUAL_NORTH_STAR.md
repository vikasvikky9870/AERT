# AERT 3.0 — VISUAL NORTH STAR & DESIGN SYSTEM SPECIFICATION

**Operational Sector**: Srikakulam District, Andhra Pradesh, India (`AP-SKLM-EOC-01`)  
**Product Vision**: A calm, spatial, high-density, low-chaos emergency operations system.

---

## 1. VISUAL PHILOSOPHY & CORE PRINCIPLES

1. **Spatial First**: The map and 3D digital twin are not backgrounds; they are the active spatial operating environment. Floating glass surfaces exist to serve spatial comprehension.
2. **Calm Under Pressure**: High-stress emergency dispatch centers cannot tolerate chaotic visual noise. The interface defaults to a quiet nocturnal palette (`#06090e`), saving high-intensity accents exclusively for immediate life-safety emergencies.
3. **Intentional 5-Level Attention Hierarchy**:
   - **Level 1 (Critical Danger)**: Ember Red (`#ff3b30`). Only active unassigned critical emergencies have pulsing emphasis.
   - **Level 2 (Immediate Decision / Action Gate)**: Cyan (`#00f0ff`). Prominent solid action button with dark text.
   - **Level 3 (Active Operational Context)**: Amber (`#ff9500`) for hazards; Emerald (`#30d158`) for available units/resolved status.
   - **Level 4 (Supporting Telemetry)**: Slate/White (`#9aa8b8` / `#f2f5f8`) in monospaced JetBrains Mono.
   - **Level 5 (Background Substrate)**: Dark nocturnal slate (`#06090e`) with faint 1px tactile grid.

---

## 2. EXPLICIT "DO" AND "DO NOT" GUIDELINES

### Colors & Lighting
- **DO**: Use `#00f0ff` (Cyan) exclusively for active telemetry vectors, camera focus, and action gates.
- **DO**: Use `#ff3b30` (Ember Red) exclusively for life-threatening critical incidents.
- **DO NOT**: Apply neon glowing box shadows to every card simultaneously.
- **DO NOT**: Mix multiple bright gradients across background panels.

### Typography
- **DO**: Use `Space Grotesk` (700) for major command headers and sector identifiers.
- **DO**: Use `JetBrains Mono` for tabular numerals, coordinates, GPS latencies, speeds, and timestamps.
- **DO**: Use `Inter` for situational text, clinical notes, and AI rationale.
- **DO NOT**: Use ALL CAPS for long paragraphs or standard labels.
- **DO NOT**: Use decorative scripts or inconsistent font sizes.

### Surfaces & Elevation
- **DO**: Use frosted tactile glass (`rgba(8, 14, 22, 0.88)` with `backdrop-filter: blur(16px)` and 1px border `rgba(255, 255, 255, 0.08)`).
- **DO**: Make the right panel a **Contextual Command Surface** that adapts dynamically to the selected object (Incident -> Incident Room; Ambulance -> Responder HUD; Hospital -> Trauma Bay Matrix).
- **DO NOT**: Stack endless disconnected static cards inside sidebars.

### Motion & Transitions
- **DO**: Use motion to communicate causality (e.g. camera lerping to an incident coordinate, route line extending during dispatch).
- **DO**: Maintain entity identity across 2D and 3D views without blank unmounts.
- **DO NOT**: Add perpetual spinning, bouncing, or decorative particle effects that distract the operator.

---

## 3. CONTEXTUAL COMMAND SURFACE STATE MACHINE

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        NO OBJECT SELECTED                              │
│  → Global Srikakulam Readiness Overview (Threat Matrix, Fleet Gauges)  │
│  → AI Sector Coverage & Repositioning Recommendation                   │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ (Operator selects entity on Map / List)
                                   ▼
┌──────────────────────────────────┬─────────────────────────────────────┐
│       INCIDENT SELECTED          │         AMBULANCE SELECTED          │
│  → Situation Room & Severity     │  → AVL Telemetry HUD                │
│  → ALS/BLS Fleet Sizing          │  → Speed, Fuel, Battery, O2 %       │
│  → 1-Click AI Dispatch Gate      │  → Crew Certifications & Assignment │
├──────────────────────────────────┼─────────────────────────────────────┤
│       HOSPITAL SELECTED          │           HAZARD SELECTED           │
│  → Trauma Level & Readiness      │  → Road Event Corridor Bottleneck   │
│  → ED Load %, ICU Beds, Vents    │  → Active Delay Multiplier (+1.8x)  │
│  → 1-Click Sonar Pre-Alert       │  → Arterial Detour Route Bypass     │
└──────────────────────────────────┴─────────────────────────────────────┘
```

---

## 4. 9-AGENT AI ARCHITECTURE VISUALIZATION

The UI truthfully reflects the canonical multi-agent architecture in `backend/agents.py`:
1. **IntakeAgent**: Voice call & transcript entity extraction.
2. **IncidentAgent**: Severity scoring & capability requirements.
3. **GISAgent**: Vector distance, road delay, and travel time calculation.
4. **DispatchAgent**: Candidate fleet ranking (ALS/BLS compatibility).
5. **HospitalAgent**: Trauma bay suitability & pre-alert preparation.
6. **RiskAgent**: Sector resource shortages & conflict radar.
7. **SimulationAgent**: Cascading hazard consequence modeling.
8. **CommandAgent**: Multi-agent synthesis & human approval gate enforcement.
9. **ReportingAgent**: Automated SITREP & after-action reconstruction.
