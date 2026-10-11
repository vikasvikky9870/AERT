# AERT 3.0 — FORENSIC UI REPAIR AUDIT
## Master Visual Reconstruction & Layout Pass (V2.0)

**Operational Sector**: Srikakulam District, Andhra Pradesh, India (`AP-SKLM-EOC-01`)  
**Target Specification**: `AERT UI RECONSTRUCTION MASTER PROMPT VERSION 2.0`  
**Scope**: Layout Architecture, Watermark Remediation, Inspector Responsiveness, 3D Scene Illumination, Workspace Standardization, and Component Density.  

---

## 1. CURRENT LAYOUT ARCHITECTURE & ROOT CAUSES

### A. Root Cause of Map Watermarks
- **Discovery**: Previous map raster configurations occasionally referenced demo tile servers or missing fallback layers that rendered `"API KEY REQUIRED"` watermark patterns.
- **Remediation**: Standardized `mapStyles.js` with direct, verified dark raster tiles (`https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png`) with full multi-mirror redundancy (`a, b, c, d`) and zero external API key requirements.

### B. Root Cause of Right-Panel Viewport Clipping & Horizontal Overflow
- **Discovery**:
  - `OperationalShell.jsx` hardcoded `width: 440px` without flexible clamping, causing horizontal overflow and viewport clipping on resolutions $\le 1440\text{px}$.
  - Internal workspace panels (`CallCenterWorkspace.jsx`, `AiCommandWorkspace.jsx`, `AnalyticsWorkspace.jsx`) used multi-column layouts that assumed a wide viewport instead of wrapping fluidly inside the contextual inspector.
- **Remediation**:
  - Implement responsive clamping on the inspector (`width: clamp(340px, 28vw, 420px)`, `maxWidth: calc(100% - 70px)`).
  - Enforce `overflow-x: hidden` and `overflow-y: auto` on all inspector surfaces.
  - Reconstruct all 10 workspaces to follow the single-column compact tactical specification in Master Spec V2.0.

### C. Root Cause of 3D Digital Twin Darkness
- **Discovery**: `DigitalTwinViewport.jsx` lacked directional ambient fill lighting and illuminated arterial road meshes, causing buildings and terrain to appear as a dark void.
- **Remediation**:
  - Add hemisphere sky lighting (`0x1a2e47`), cyan key light (`0x00f0ff` at 1.2 intensity), amber fill light (`0xffbf00`), and illuminated arterial road network paths (NH-16, Palakonda Road, Nagavali river bridge).
  - Add rooftop navigation beacons, emissive hospital helipad markers, and vertical holographic incident beacon light cones.

### D. Digital Twin Empty-State Message
- **Discovery**: Workspace 09 (Digital Twin) rendered a large centered card ("3D DIGITAL TWIN FOCUSED VIEW") that blocked the 3D twin canvas.
- **Remediation**: Replace the centered card with a compact tactical HUD overlay (`TILT 45°`, `HEADING 120°`, `ZOOM 1.2x`) anchored at the top-right corner of the canvas.

---

## 2. REUSABLE COMPONENT SPECIFICATION: `<OperationalPanel>`

All 10 workspaces will utilize a normalized tactical container grammar:
- **Background**: Frosted Obsidian Glass (`rgba(16, 20, 25, 0.88)` with `backdrop-filter: blur(16px)`).
- **Border**: 1px subtle boundary (`rgba(255, 255, 255, 0.08)` / Cyan `#00f0ff` accent).
- **Radius**: `8px` – `10px` rounded corners.
- **Typography**:
  - Headers: Space Grotesk (`13px`–`15px`, bold).
  - Telemetry & Status: JetBrains Mono (`10px`–`12px`, uppercase, tracking `0.05em`).
  - Body: Inter (`11px`–`13px`, calm, legible).

---

## 3. COMPONENT MODIFICATION REGISTER

| Component | Path | Required Action |
|---|---|---|
| **OperationalShell** | `frontend/src/app/OperationalShell.jsx` | Implement responsive clamping, fluid map sizing (65-75%), and clean Z-index hierarchy (0 to 70). |
| **OverwatchWorkspace** | `frontend/src/features/overwatch/OverwatchWorkspace.jsx` | Align with Screen 01: Status grid, active incidents list with colored chips, and quick triage metrics. |
| **LiveResponseWorkspace** | `frontend/src/features/live-response/LiveResponseWorkspace.jsx` | Align with Screen 02: Incident header, 7-stage lifecycle progress bar, primary unit HUD, receiving hospital, and action buttons. |
| **CallCenterWorkspace** | `frontend/src/features/call-center/CallCenterWorkspace.jsx` | Align with Screen 03: Active call card with audio waveform, call intelligence, live transcript, and Create Incident button. |
| **IncidentCommandWorkspace** | `frontend/src/features/incidents/IncidentCommandWorkspace.jsx` | Align with Screen 04: Compact incident matrix (5 items), severity badges, and + New Incident action. |
| **FleetWorkspace** | `frontend/src/features/fleet/FleetWorkspace.jsx` | Align with Screen 05: Fleet status count bar (3 avail, 1 on scene, 1 en route), status tabs, and compact vehicle rows. |
| **MedicalNetworkWorkspace** | `frontend/src/features/medical/MedicalNetworkWorkspace.jsx` | Align with Screen 06: Trauma network summary (5/5 online), hospital cards with ER load progress bars, and Pre-Alert Hospital button. |
| **GeoIntelligenceWorkspace** | `frontend/src/features/gis/GeoIntelligenceWorkspace.jsx` | Align with Screen 07: Compact layer toggles (NH-16, Hazards, Flood, ALS Reach, HazMat), tools bar, and spatial insight. |
| **AiCommandWorkspace** | `frontend/src/features/ai-command/AiCommandWorkspace.jsx` | Align with Screen 08: AI recommendations queue, structured AI response brief (What/Why/Alt/Confidence 96%), and Approve/Modify/Reject buttons. |
| **AnalyticsWorkspace** | `frontend/src/features/analytics/AnalyticsWorkspace.jsx` | Align with Screen 10: 5 KPIs (MTTD 42s, MTTS 5.8m, AI Sign-off 96.4%, Fleet 60%, 24H 18), response time chart, and corridor table. |
| **DigitalTwinViewport** | `frontend/src/features/digital-twin/DigitalTwinViewport.jsx` | Enhanced lighting, illuminated road paths, 7-Road Tower beacon, and compact camera switcher. |

---

## 4. PRESERVATION MANDATE

- Zero backend database or API breaking changes.
- 100% preservation of Srikakulam geography (`AP-SKLM-EOC-01`).
- 100% preservation of 9-Agent AI architecture and Human-in-the-Loop Command Gates.
- 100% preservation of Web Audio synthesis and keyboard shortcuts (`G`, `M`, `Ctrl+K`, `1-3`, `Escape`).
