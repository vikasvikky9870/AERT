import { useState } from "react";
import { Play, Sparkles, AlertCircle, ShieldAlert, CheckCircle2, Navigation, Activity, Route, Box, ArrowRight } from "lucide-react";
import { simulateScenario } from "../api";

export default function SimulationEngine() {
  const [form, setForm] = useState({
    type: "Major Highway Collision",
    location: "NH-16 Srikakulam Bypass Km 42",
    severity: "CRITICAL",
    victims: 8,
    critical_victims: 3,
    longitude: 83.905,
    latitude: 18.305,
    hazard_type: "Highway Entrapment / Fuel Spill",
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const presetScenarios = [
    {
      title: "Mass Highway Collision (NH-16)",
      type: "Major Highway Collision",
      location: "NH-16 Srikakulam Bypass Km 42",
      severity: "CRITICAL",
      victims: 9,
      critical_victims: 3,
      longitude: 83.905,
      latitude: 18.305,
      hazard: "Highway Entrapment / Fuel Spill",
    },
    {
      title: "Industrial Chemical Explosion",
      type: "Industrial Chemical Fire",
      location: "Singupuram Industrial Estate",
      severity: "CRITICAL",
      victims: 14,
      critical_victims: 5,
      longitude: 83.865,
      latitude: 18.320,
      hazard: "Toxic Smoke & Secondary Blast Risk",
    },
    {
      title: "Urban Bus Overturn",
      type: "Mass Transit Derailment",
      location: "Palakonda Ghat Road Approach",
      severity: "HIGH",
      victims: 6,
      critical_victims: 1,
      longitude: 83.880,
      latitude: 18.289,
      hazard: "Vehicle Debris & Roadway Block",
    },
  ];

  const handleApplyPreset = (p) => {
    setForm({
      type: p.type,
      location: p.location,
      severity: p.severity,
      victims: p.victims,
      critical_victims: p.critical_victims,
      longitude: p.longitude,
      latitude: p.latitude,
      hazard_type: p.hazard,
    });
  };

  const handleSimulate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await simulateScenario({
        type: form.type,
        location: form.location,
        severity: form.severity,
        victims: Number(form.victims),
        critical_victims: Number(form.critical_victims),
        coordinates: [Number(form.longitude), Number(form.latitude)],
        hazard_type: form.hazard_type,
      });
      setResult(data);
    } catch (err) {
      console.error("Simulation error:", err);
      setError("Failed to execute hypothetical scenario simulation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="simulation-screen">
      {/* SIMULATION BANNER */}
      <div className="simulation-banner">
        <div className="banner-tag">
          <ShieldAlert size={16} />
          <span>DIGITAL TWIN // WHAT-IF SCENARIO STAGING (SIMULATION ONLY)</span>
        </div>
        <p>
          Simulated emergency scenarios in Srikakulam sector are calculated strictly in memory. They do not persist to active dispatch registries or alter live fleet readiness states.
        </p>
      </div>

      {/* QUICK PRESETS ROW */}
      <div className="sim-presets-strip">
        <span className="preset-label">SCENARIO PRESETS:</span>
        {presetScenarios.map((p, idx) => (
          <button
            key={idx}
            type="button"
            className="btn-sim-preset"
            onClick={() => handleApplyPreset(p)}
          >
            <span>{p.title}</span>
          </button>
        ))}
      </div>

      <div className="simulation-split-layout">
        {/* LEFT: SCENARIO PARAMETERS FORM */}
        <div className="sim-form-pane">
          <div className="pane-title">
            <Play size={16} />
            <h3>Configure What-If Scenario (Srikakulam)</h3>
          </div>

          <form onSubmit={handleSimulate} className="sim-form">
            <label>
              Scenario Emergency Nature
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option>Major Highway Collision</option>
                <option>Industrial Chemical Fire</option>
                <option>Mass Transit Derailment</option>
                <option>Medical Emergency / Cardiac</option>
                <option>Severe Weather / Flash Flood</option>
              </select>
            </label>

            <label>
              Hypothetical Location
              <input
                required
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </label>

            <div className="form-two-col">
              <label>
                Severity Priority
                <select
                  value={form.severity}
                  onChange={(e) => setForm({ ...form, severity: e.target.value })}
                >
                  <option value="CRITICAL">CRITICAL</option>
                  <option value="HIGH">HIGH</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="LOW">LOW</option>
                </select>
              </label>

              <label>
                Total Casualties
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={form.victims}
                  onChange={(e) => setForm({ ...form, victims: e.target.value })}
                />
              </label>
            </div>

            <div className="form-two-col">
              <label>
                Critical Casualty Sizing
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={form.critical_victims}
                  onChange={(e) => setForm({ ...form, critical_victims: e.target.value })}
                />
              </label>

              <label>
                Hazard / Risk Factor
                <input
                  type="text"
                  value={form.hazard_type}
                  onChange={(e) => setForm({ ...form, hazard_type: e.target.value })}
                />
              </label>
            </div>

            <div className="form-two-col">
              <label>
                Target Longitude
                <input
                  type="number"
                  step="any"
                  value={form.longitude}
                  onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                />
              </label>

              <label>
                Target Latitude
                <input
                  type="number"
                  step="any"
                  value={form.latitude}
                  onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                />
              </label>
            </div>

            <button type="submit" className="btn-run-sim" disabled={loading}>
              <Sparkles size={16} />
              <span>{loading ? "COMPUTING MODEL..." : "RUN HYPOTHETICAL DISPATCH"}</span>
            </button>
          </form>
        </div>

        {/* RIGHT: SIMULATED RECOMMENDATION OUTPUT */}
        <div className="sim-output-pane">
          {error && <div className="sim-error-box">{error}</div>}

          {result ? (
            <div className="sim-result-card">
              <div className="result-head">
                <div className="sim-badge">SIMULATION RESULT: {result.incident_id}</div>
                <h3>{result.response_level}</h3>
                <span className="priority-meter">Priority Score: <strong>{result.priority_score}/100</strong></span>
              </div>

              {/* STATS STRIP */}
              <div className="sim-stats-strip">
                <div className="s-stat">
                  <span>REQUIRED FLEET</span>
                  <strong className="text-blue">{result.recommended_ambulances_count} {result.fleet_requirement?.recommended_tier || "ALS"} Units</strong>
                </div>

                <div className="s-stat">
                  <span>PRIMARY AMBULANCE</span>
                  <strong className="text-green">{result.recommended_ambulance?.id || "N/A"} ({result.recommended_ambulance?.type})</strong>
                  <small>ETA: ~{result.recommended_ambulance?.eta_minutes || "--"} mins</small>
                </div>

                <div className="s-stat">
                  <span>DESIGNATED HOSPITAL</span>
                  <strong className="text-purple">{result.recommended_hospital?.name || "N/A"}</strong>
                  <small>{result.recommended_hospital?.beds_available || 0} Beds Free ({result.recommended_hospital?.icu_beds_available || 0} ICU)</small>
                </div>
              </div>

              {result.has_conflict && (
                <div className="sim-conflict-alert">
                  <ShieldAlert size={16} />
                  <span><strong>Resource Shortage Detected:</strong> Resource gap of {result.resource_gap} unit(s). Additional mutual aid staging recommended.</span>
                </div>
              )}

              {/* REASONING & ROAD EFFECTS */}
              <div className="sim-reasoning-section">
                <h4>Decision-Support Rationale:</h4>
                <ul className="sim-bullets">
                  {result.reasoning?.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>

              {/* TOP RANKED OPTIONS */}
              <div className="sim-ranking-summary">
                <h4>Fleet Suitability Ranking (Srikakulam Fleet):</h4>
                <div className="sim-fleet-rows">
                  {result.ranked_ambulances?.slice(0, 3).map((amb, i) => (
                    <div key={amb.id} className="sim-fleet-item">
                      <span>#{i + 1} <strong>{amb.id}</strong> ({amb.type}, {amb.distance_km} km)</span>
                      <span>ETA: <strong>~{amb.eta_minutes} min</strong></span>
                      <span className={`status-pill status-${String(amb.status).toLowerCase()}`}>{amb.status}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="sim-footer">
                <span>Confidence Assessment: <strong>{result.confidence_label}</strong></span>
              </div>
            </div>
          ) : (
            <div className="sim-empty-output">
              <Box size={36} />
              <h4>Hypothetical Scenario Staging</h4>
              <p>Configure parameters on the left and click "Run Hypothetical Dispatch" to test response feasibility and conflict modeling across Srikakulam District.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
