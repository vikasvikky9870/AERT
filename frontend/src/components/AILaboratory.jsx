import React, { useState } from "react";
import {
  Cpu,
  Sliders,
  Sparkles,
  Layers,
  Activity,
  ShieldCheck,
  Building2,
  Ambulance,
  Route,
  MapPin,
  HelpCircle,
  BarChart3,
  CheckCircle2,
} from "lucide-react";
import { DecisionGraph } from "../design-system/ai/DecisionGraph";
import { ConfidenceRing } from "../design-system/components/ConfidenceRing";
import { Card } from "../design-system/components/Card";

export default function AILaboratory({
  incidents = [],
  ambulances = [],
  hospitals = [],
  roadEvents = [],
  selectedIncident = null,
}) {
  const [activeModelTab, setActiveModelTab] = useState("priority_scoring");

  const [testSeverity, setTestSeverity] = useState("CRITICAL");
  const [testVictims, setTestVictims] = useState(6);
  const [testCriticalVictims, setTestCriticalVictims] = useState(2);
  const [testHazardType, setTestHazardType] = useState("Highway Entrapment / Fuel Spill");

  // Computed Interactive Test Priority Score
  const calculateTestScore = () => {
    let base = testSeverity === "CRITICAL" ? 85 : testSeverity === "HIGH" ? 65 : testSeverity === "MEDIUM" ? 45 : 20;
    let victimPts = Math.min(15, testVictims * 1.8);
    let critPts = Math.min(20, testCriticalVictims * 5.0);
    let hazPts = testHazardType.toLowerCase().includes("fuel") || testHazardType.toLowerCase().includes("chemical") ? 8 : 3;
    let total = Math.min(100, Math.round(base + victimPts + critPts + hazPts));
    return { total, base, victimPts, critPts, hazPts };
  };

  const testScoreResult = calculateTestScore();

  return (
    <div className="ai-lab-screen">
      {/* HEADER BANNER */}
      <div className="ai-lab-header">
        <div className="lab-title-wrap">
          <div className="lab-icon-box">
            <Cpu size={22} className="text-purple" />
          </div>
          <div>
            <h2>AERT AI Laboratory & Model Explainability Center</h2>
            <p className="subtitle">Inspect transparent rule-based triage equations, ALS/BLS fleet capability matching, road impedance multipliers, and trauma center suitability scoring.</p>
          </div>
        </div>

        <div className="lab-status-badge">
          <span className="live-dot" />
          <span>INSPECTOR ENGINE: ACTIVE (SRIKAKULAM SECTOR)</span>
        </div>
      </div>

      {/* LAB NAVIGATION TABS */}
      <div className="ai-lab-tabs">
        <button
          className={`lab-tab-btn ${activeModelTab === "priority_scoring" ? "tab-active" : ""}`}
          onClick={() => setActiveModelTab("priority_scoring")}
        >
          <Activity size={14} />
          <span>1. Multi-Criteria Priority Scoring</span>
        </button>

        <button
          className={`lab-tab-btn ${activeModelTab === "fleet_matching" ? "tab-active" : ""}`}
          onClick={() => setActiveModelTab("fleet_matching")}
        >
          <Ambulance size={14} />
          <span>2. Capability-Aware EMS Matching</span>
        </button>

        <button
          className={`lab-tab-btn ${activeModelTab === "hospital_ranking" ? "tab-active" : ""}`}
          onClick={() => setActiveModelTab("hospital_ranking")}
        >
          <Building2 size={14} />
          <span>3. Trauma Suitability Ranking</span>
        </button>

        <button
          className={`lab-tab-btn ${activeModelTab === "road_impedance" ? "tab-active" : ""}`}
          onClick={() => setActiveModelTab("road_impedance")}
        >
          <Route size={14} />
          <span>4. Road Corridor Impedance Buffer</span>
        </button>
      </div>

      {/* TAB CONTENT 1: PRIORITY SCORING INSPECTOR */}
      {activeModelTab === "priority_scoring" && (
        <div className="lab-tab-content">
          <div className="lab-split-layout">
            {/* LEFT: INTERACTIVE SCORING FORMULA */}
            <div className="lab-card-pane">
              <div className="pane-head">
                <Sliders size={16} className="text-blue" />
                <h3>Interactive Triage Scoring Model</h3>
              </div>

              <div className="scoring-formula-box">
                <code>
                  Priority_Score = min(100, Base_Severity + Casualty_Weight + Critical_Casualty_Weight + Hazard_Factor)
                </code>
              </div>

              <div className="lab-controls-grid">
                <label>
                  Severity Tier
                  <select
                    value={testSeverity}
                    onChange={(e) => setTestSeverity(e.target.value)}
                    className="lab-select"
                  >
                    <option value="CRITICAL">CRITICAL (Base: 85 pts)</option>
                    <option value="HIGH">HIGH (Base: 65 pts)</option>
                    <option value="MEDIUM">MEDIUM (Base: 45 pts)</option>
                    <option value="LOW">LOW (Base: 20 pts)</option>
                  </select>
                </label>

                <label>
                  Total Reported Casualties
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={testVictims}
                    onChange={(e) => setTestVictims(Number(e.target.value))}
                    className="lab-input"
                  />
                </label>

                <label>
                  Critical Life-Safety Casualties (ALS Required)
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={testCriticalVictims}
                    onChange={(e) => setTestCriticalVictims(Number(e.target.value))}
                    className="lab-input"
                  />
                </label>

                <label>
                  Environmental Hazard Factor
                  <input
                    type="text"
                    value={testHazardType}
                    onChange={(e) => setTestHazardType(e.target.value)}
                    className="lab-input"
                  />
                </label>
              </div>
            </div>

            {/* RIGHT: COMPUTED SCORE & CONFIDENCE GAUGE */}
            <div className="lab-card-pane">
              <div className="pane-head">
                <Sparkles size={16} className="text-purple" />
                <h3>Computed Priority Telemetry</h3>
              </div>

              <div className="score-result-display">
                <ConfidenceRing
                  value={testScoreResult.total}
                  size={110}
                  strokeWidth={8}
                  variant={testScoreResult.total >= 80 ? "red" : testScoreResult.total >= 60 ? "orange" : "blue"}
                />

                <div className="score-breakdown-table">
                  <div className="sb-row">
                    <span>Base Tier Points:</span>
                    <strong>+{testScoreResult.base} pts</strong>
                  </div>
                  <div className="sb-row">
                    <span>Casualty Impact Points:</span>
                    <strong>+{testScoreResult.victimPts.toFixed(1)} pts</strong>
                  </div>
                  <div className="sb-row">
                    <span>Critical Polytrauma Points:</span>
                    <strong>+{testScoreResult.critPts.toFixed(1)} pts</strong>
                  </div>
                  <div className="sb-row">
                    <span>Hazard Multiplier Points:</span>
                    <strong>+{testScoreResult.hazPts} pts</strong>
                  </div>
                  <div className="sb-total-row">
                    <span>FINAL TRANSPARENT SCORE:</span>
                    <strong>{testScoreResult.total} / 100</strong>
                  </div>
                </div>
              </div>

              <div className="lab-provenance-note">
                <ShieldCheck size={14} className="text-nominal" />
                <span>100% Explainable Rule-Based Equation — No Black Box Hallucinations.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: FLEET CAPABILITY MATCHING */}
      {activeModelTab === "fleet_matching" && (
        <div className="lab-tab-content">
          <div className="lab-full-card">
            <h3>ALS vs BLS Capability Sizing Matrix</h3>
            <p className="subtitle">How AERT matches paramedic unit tiers based on victim severity and life-safety resuscitation requirements.</p>

            <div className="matrix-table">
              <div className="matrix-head">
                <span>INCIDENT SCENARIO</span>
                <span>REQUIRED FLEET TIER</span>
                <span>EQUIPMENT PREREQUISITES</span>
                <span>MATCHING HEURISTIC</span>
              </div>

              <div className="matrix-row">
                <strong>Critical Trauma / Cardiac Arrest</strong>
                <span className="badge-tier-als">ALS (Advanced Life Support)</span>
                <span>Cardiac Monitor, Defibrillator, Ventilator, Resuscitation Drugs</span>
                <span>Dispatches closest ALS unit within 15 km; avoids BLS downgrades</span>
              </div>

              <div className="matrix-row">
                <strong>Multi-Vehicle Collision (5+ Victims)</strong>
                <span className="badge-tier-als">2x ALS + 1x BLS Staging</span>
                <span>Spine Boards, Extrication Kits, Oxygen Kits</span>
                <span>Calculates sector resource gap if available fleet &lt; 3 units</span>
              </div>

              <div className="matrix-row">
                <strong>Minor Fracture / BLS Transport</strong>
                <span className="badge-tier-bls">BLS (Basic Life Support)</span>
                <span>First Aid Kit, Oxygen Cylinder, Basic Stretcher</span>
                <span>Preserves ALS fleet for active critical tier calls</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: HOSPITAL SUITABILITY */}
      {activeModelTab === "hospital_ranking" && (
        <div className="lab-tab-content">
          <div className="lab-full-card">
            <h3>Trauma Center Suitability Scoring Algorithm</h3>
            <div className="scoring-formula-box">
              <code>
                Hospital_Score = (Trauma_Level_Weight × 40) + (Free_ICU_Beds × 5) + (Free_Beds × 1.5) - (Road_Travel_Time_Mins × 2)
              </code>
            </div>

            <div className="hospital-eval-grid">
              {hospitals.map((h) => (
                <div key={h.id} className="h-eval-card">
                  <div className="h-eval-top">
                    <strong>{h.name}</strong>
                    <span className="trauma-tag">{h.trauma_level || "Level 1 Trauma"}</span>
                  </div>
                  <div className="h-eval-stats">
                    <div><span>General Free Beds:</span> <strong>{h.beds_available}</strong></div>
                    <div><span>Available ICU Beds:</span> <strong className="text-purple">{h.icu_beds_available || 2}</strong></div>
                    <div><span>Blood Bank Status:</span> <strong className="text-nominal">{h.blood_bank_status || "AVAILABLE"}</strong></div>
                    <div><span>Current Load:</span> <strong>{h.capacity}%</strong></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: ROAD IMPEDANCE */}
      {activeModelTab === "road_impedance" && (
        <div className="lab-tab-content">
          <div className="lab-full-card">
            <h3>Corridor Road Hazard & Travel Time Multiplier Model</h3>
            <p className="subtitle">Calculates dynamic delay factors across Srikakulam arterial highways and bridge corridors.</p>

            <div className="matrix-table">
              <div className="matrix-head">
                <span>CORRIDOR / BRIDGE</span>
                <span>BASELINE SPEED</span>
                <span>ACTIVE IMPEDANCE</span>
                <span>DELAY MULTIPLIER</span>
                <span>REROUTING PROTOCOL</span>
              </div>

              {roadEvents.map((rd) => (
                <div key={rd.id} className="matrix-row">
                  <strong>{rd.road_name || rd.id}</strong>
                  <span>50 km/h</span>
                  <span className="text-warning">{rd.status || "Congestion Buffer"}</span>
                  <strong className="text-warning">+{rd.delay_multiplier || 1.3}x</strong>
                  <span>{rd.delay_multiplier > 1.5 ? "Reroute via bypass recommended" : "Direct transit acceptable"}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
