# AERT 3.0 — UX & VISUAL DESIGN CONSTITUTION

**Operational Sector**: Srikakulam District, Andhra Pradesh, India (`AP-SKLM-EOC-01`)  
**Design Philosophy**: Tactical + Cinematic + Professional + Calm Under Pressure  
**Core Motto**: *"High information density without visual chaos; the map is the center of gravity."*

---

## 1. FIVE-LEVEL ATTENTION HIERARCHY

The command center must not make everything look urgent. AERT strictly adheres to this 5-tier attention hierarchy:

| Level | Operational Meaning | Visual Treatment & Constraints |
|---|---|---|
| **LEVEL 1** | **Critical Emergency / Immediate Threat** | **Only Level 1 receives strong pulsing visual emphasis.** Ember Red (`#ff3b30`), subtle 6px radial glow, and audible Web Audio alert. Used exclusively for unassigned Critical Triage incidents. |
| **LEVEL 2** | **Immediate Operator Decision Required** | **Cyan Action Gate (`#00f0ff`).** Crisp 1px solid border, prominent button with dark text on cyan fill, and confidence rating badge. Never pulses continuously. |
| **LEVEL 3** | **Active Operational Context** | **Tactical Amber / Emerald.** Amber (`#ff9500`) for road hazards and cautions; Emerald (`#30d158`) for available responders and resolved incidents. Static 1px outline. |
| **LEVEL 4** | **Supporting Telemetry & Metadata** | **Obsidian Glass (`rgba(8, 14, 22, 0.85)`).** Neutral text (`#9aa8b8`), tabular JetBrains Mono numerals, and subtle dividers (`rgba(255, 255, 255, 0.08)`). |
| **LEVEL 5** | **Background Canvas & Cartography** | **Nocturnal Substrate (`#06090e`).** High-contrast, low-saturation dark basemap with faint street grid and unobtrusive water bodies. Zero decorative neon. |

---

## 2. COLOR SYSTEM & SEMANTIC PALETTE

```css
:root {
  /* Substrate Canvas */
  --canvas-bg: #06090e;
  --surface-glass: rgba(8, 14, 22, 0.85);
  --surface-elevated: rgba(14, 22, 34, 0.92);
  --border-subtle: rgba(255, 255, 255, 0.08);
  --border-medium: rgba(255, 255, 255, 0.16);

  /* Semantic Spectrum */
  --status-critical: #ff3b30;       /* Immediate danger / Life threat */
  --status-critical-bg: rgba(255, 59, 48, 0.14);
  --status-warning: #ff9500;        /* Road hazards, delays, cautions */
  --status-warning-bg: rgba(255, 149, 0, 0.14);
  --status-active: #30d158;         /* Available fleet, resolved, online */
  --status-active-bg: rgba(48, 209, 88, 0.14);
  --status-telemetry: #00f0ff;      /* Active routes, AI action gate, cyan focus */
  --status-telemetry-bg: rgba(0, 240, 255, 0.14);

  /* Typography Colors */
  --text-primary: #f2f5f8;          /* Primary labels, headings, active values */
  --text-secondary: #9aa8b8;        /* Supporting text, descriptions, units */
  --text-muted: #5c6c7d;            /* Footers, inactive controls, grid lines */
}
```

---

## 3. TYPOGRAPHY MATRIX

AERT utilizes a structured tri-font hierarchy to ensure instantaneous scanability:

| Role | Font Family | Size / Weight | Application |
|---|---|---|---|
| **Command Heading** | Space Grotesk / Inter | `18px – 24px` / Bold (700) | Top bar sector title, workspace headers |
| **Incident Title** | Inter | `14px – 16px` / Semibold (600) | Active emergency labels, modal headers |
| **Telemetry & Numbers** | JetBrains Mono | `12px – 15px` / Medium (500) | GPS coordinates, speed, fuel %, timers, latency |
| **Body / Description** | Inter | `13px – 14px` / Regular (400) | Situational notes, AI evidence summaries |
| **Tactical Label / Badge** | JetBrains Mono | `10px – 11px` / Bold (700) Caps | Severity badges (`CRITICAL`, `ALS`), state indicators |

---

## 4. SPATIAL & SURFACE DESIGN

### A. Dominant Spatial Canvas
- The 2D GIS MapLibre Map and 3D WebGL Digital Twin always occupy **70% to 75% of the primary viewport width**.
- All floating panels (top bar, left navigation, right contextual inspector, bottom event ticker) use **frosted glassmorphism (`backdrop-filter: blur(16px)`)** allowing map geography to remain visible underneath panel margins.

### B. Contextual Right Inspector
- **No Selection**: Displays Srikakulam District Operational Summary (active threat count, fleet availability meters, hospital capacity gauge).
- **Incident Selected**: Displays Incident Command Room (severity scoring formula, ALS requirements, and 1-click AI Dispatch Approval gate).
- **Ambulance Selected**: Displays Responder Telemetry HUD (speed, fuel %, battery %, crew certifications, O2 readiness).
- **Hospital Selected**: Displays Medical Network Capacity (ER load %, ICU beds, ventilators, pre-alert dispatch).

---

## 5. PURPOSEFUL MOTION & TRANSITIONS

- **2D ↔ 3D Seamless Continuity**: Toggling `M` lerps the camera smoothly without component destruction or flickering blank frames. Selected entity identity is strictly preserved.
- **Route Vectors**: Active emergency corridors render as crisp glowing cyan lines (`#00f0ff`, blur 6) with white inner core (3.5px).
- **Event Stream**: Continuous horizontal operational stream with **pause-on-hover** and **resume-on-leave** controls.
- **Accessibility**: Automatically respects `@media (prefers-reduced-motion: reduce)` by dampening pulsing animations.
