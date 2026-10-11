---
trigger: always_on
description: Mandatory development and operational standards for AERT 3.0 Emergency Response Platform.
---

# AERT 3.0 Standards & Constraints

1. **Geographic Bounds & Sector Constraints**:
   - Primary Operational District: Srikakulam District, Andhra Pradesh, India (`AP-SKLM-EOC-01`).
   - Srikakulam Bounding Coordinates: `[83.7000, 18.1500]` to `[84.1500, 18.5000]`.
   - Default Operational Center: `[83.8961, 18.2969]` (7 Road Junction).
   - Never fall back to Hyderabad or non-Srikakulam coordinates.

2. **Tactical UI & Spatial Design Philosophy**:
   - The Spatial Canvas (2D GIS Map & 3D WebGL Digital Twin) is the persistent background.
   - Base Color: `#06090e` (Nocturnal Command Canvas).
   - Semantic Palette: Cyan `#00f0ff` (Telemetry & Active Routes), Ember Red `#ff3b30` (Critical Severity), Amber `#ff9500` (Warnings & Hazards), Green `#30d158` (Available / Resolved).
   - Never use generic dashboard cards, bright themes, or disconnected page routes.

3. **Deterministic Logic vs AI Reasoning**:
   - Geodesic distances, route geometry, authorization, and hospital capacities must always be computed deterministically by software algorithms.
   - AI Multi-Agent Brain provides qualitative reasoning, casualty extraction, and explainable recommendations.

4. **Human-in-the-Loop Command Gate**:
   - Emergency dispatch actions require human operator sign-off (`Approve`, `Modify`, `Reject`).
   - Every action must be recorded in the immutable audit event log.

5. **Zero External Audio Dependencies**:
   - Audio feedback is synthesized exclusively via the browser's native Web Audio API oscillators (`soundManager.js`).
