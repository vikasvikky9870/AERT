import { useState } from "react";
import {
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Navigation,
  CheckCircle,
  ChevronRight,
  Activity,
  ArrowRight,
  MapPin,
  Building2,
  Ambulance,
  Route,
  ShieldAlert,
  Send,
  UserCheck,
} from "lucide-react";
import { analyzeIncident, setAmbulanceStatus, updateIncidentLifecycle } from "../api";
import HospitalPreAlertModal from "./HospitalPreAlertModal";
import OperatorOverrideModal from "./OperatorOverrideModal";

export default function ResponseIntelligence({
  incidents = [],
  ambulances = [],
  hospitals = [],
  selectedIncident = null,
  onSelectIncident = null,
  onRefresh = null,
}) {
  const [activeIncidentId, setActiveIncidentId] = useState(
    selectedIncident ? selectedIncident.id : incidents[0]?.id || ""
  );
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dispatchFeedback, setDispatchFeedback] = useState(null);
  const [isDispatching, setIsDispatching] = useState(false);

  const [showPreAlertModal, setShowPreAlertModal] = useState(false);
  const [showOverrideModal, setShowOverrideModal] = useState(false);

  const currentIncident = incidents.find((i) => i.id === activeIncidentId) || selectedIncident;

  const handleRunAnalysis = async (incId) => {
    const targetId = incId || activeIncidentId;
    if (!targetId) return;

    setLoading(true);
    setError(null);
    setDispatchFeedback(null);
    try {
      const data = await analyzeIncident(targetId);
      setRecommendation(data);
    } catch (err) {
      console.error("Analysis error:", err);
      setError("Unable to compute response decision support. Check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleIncidentChange = (id) => {
    setActiveIncidentId(id);
    setRecommendation(null);
    setError(null);
    setDispatchFeedback(null);
    const inc = incidents.find((i) => i.id === id);
    if (onSelectIncident && inc) onSelectIncident(inc);
  };

  // Direct Operator Approval
  const handleApproveDispatch = async () => {
    if (!currentIncident || !recommendation) return;
    const amb = recommendation.recommended_ambulance;
    const hos = recommendation.recommended_hospital;
    if (!amb) {
      setDispatchFeedback({ type: "error", message: "No suitable ambulance available to dispatch." });
      return;
    }

    setIsDispatching(true);
    setDispatchFeedback(null);

    try {
      await setAmbulanceStatus(amb.id, "BUSY", currentIncident.id);
      await updateIncidentLifecycle(currentIncident.id, {
        lifecycle_status: "DISPATCHED",
        ambulance_id: amb.id,
        hospital_id: hos?.id,
        actor: "OPERATOR_COMMANDER",
        notes: "Approved explainable AI recommendation.",
      });

      if (onRefresh) await onRefresh();
      setDispatchFeedback({
        type: "success",
        message: `Dispatch Approved! Assigned Ambulance ${amb.id} (${amb.type}) to ${currentIncident.id} with transport destination ${hos?.name || "Trauma Center"}.`,
      });
    } catch (err) {
      console.error("Dispatch error:", err);
      setDispatchFeedback({ type: "error", message: "Failed to execute approved dispatch." });
    } finally {
      setIsDispatching(false);
    }
  };

  return (
    <div className="intelligence-screen">
      {/* HEADER / SELECTOR */}
      <div className="intelligence-control-bar">
        <div className="bar-left">
          <div className="module-tag">
            <Sparkles size={14} />
            <span>EXPLAINABLE DECISION SUPPORT // SRIKAKULAM DISTRICT</span>
          </div>
          <h2>AI Response Intelligence Engine</h2>
          <p className="subtitle">
            Rule-based multi-criteria response optimization: casualty weight, ALS/BLS capability matching, road delay buffer modeling, and trauma center suitability scoring.
          </p>
        </div>

        <div className="bar-right">
          <div className="incident-selector-wrap">
            <label>TARGET EMERGENCY (SRIKAKULAM)</label>
            <select
              value={activeIncidentId}
              onChange={(e) => handleIncidentChange(e.target.value)}
              className="incident-select"
            >
              {incidents.length === 0 ? (
                <option value="">No incidents available</option>
              ) : (
                incidents.map((inc) => (
                  <option key={inc.id} value={inc.id}>
                    {inc.id} — {inc.type} ({inc.severity}) [{inc.location}]
                  </option>
                ))
              )}
            </select>
          </div>

          <button
            className="evaluate-btn"
            onClick={() => handleRunAnalysis(activeIncidentId)}
            disabled={loading || !activeIncidentId}
          >
            <Sparkles size={16} />
            <span>{loading ? "EVALUATING..." : "EVALUATE DECISION SUPPORT"}</span>
          </button>
        </div>
      </div>

      {error && <div className="intelligence-error-box"><AlertTriangle size={18} /> {error}</div>}

      {dispatchFeedback && (
        <div className={`manager-feedback feedback-${dispatchFeedback.type}`}>
          {dispatchFeedback.type === "success" ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
          <span>{dispatchFeedback.message}</span>
        </div>
      )}

      {/* RESOURCE SHORTAGE WARNING STRIP */}
      {recommendation?.has_conflict && (
        <div className="resource-conflict-banner">
          <ShieldAlert size={20} className="text-red" />
          <div className="conflict-text">
            <strong>⚠ SECTOR RESOURCE SHORTAGE DETECTED (Deficit: {recommendation.resource_gap} Unit(s))</strong>
            <p>Active critical emergencies exceed available suitable ambulances in Srikakulam sector. Mutual-aid escalation protocol recommended.</p>
          </div>
        </div>
      )}

      {/* MAIN INTELLIGENCE DISPLAY */}
      {recommendation ? (
        <div className="recommendation-dashboard">
          {/* GEOGRAPHIC DECISION FLOW GRAPHIC */}
          <div className="response-flow-strip">
            <div className="flow-node flow-inc">
              <div className="flow-icon">🚨</div>
              <div>
                <span className="flow-label">1. INCIDENT ORIGIN</span>
                <strong>{recommendation.incident_id}</strong>
                <small>{currentIncident?.location || recommendation.location || "Srikakulam"}</small>
              </div>
            </div>

            <div className="flow-arrow">
              <Route size={16} />
              <span>{recommendation.recommended_ambulance ? `${recommendation.recommended_ambulance.distance_km} km` : "--"}</span>
            </div>

            <div className="flow-node flow-amb">
              <div className="flow-icon">🚑</div>
              <div>
                <span className="flow-label">2. BEST EMS UNIT ({recommendation.recommended_ambulance?.type || "ALS"})</span>
                <strong className="text-green">{recommendation.recommended_ambulance?.id || "N/A"}</strong>
                <small>ETA: ~{recommendation.recommended_ambulance?.eta_minutes || "--"} mins</small>
              </div>
            </div>

            <div className="flow-arrow">
              <Route size={16} />
              <span>Corridor</span>
            </div>

            <div className="flow-node flow-road">
              <div className="flow-icon">⚠️</div>
              <div>
                <span className="flow-label">3. ROAD FACTOR</span>
                <strong className={recommendation.road_delay_applied ? "text-orange" : "text-green"}>
                  {recommendation.road_delay_applied
                    ? `+${recommendation.recommended_ambulance?.delay_multiplier || 1.3}x Road Delay`
                    : "Normal Corridor Flow"}
                </strong>
                <small>{recommendation.nearby_road_events?.length || 0} active event(s)</small>
              </div>
            </div>

            <div className="flow-arrow">
              <Route size={16} />
              <span>Transfer</span>
            </div>

            <div className="flow-node flow-hos">
              <div className="flow-icon">🏥</div>
              <div>
                <span className="flow-label">4. RECEIVING TRAUMA CENTER</span>
                <strong className="text-purple">{recommendation.recommended_hospital?.name || "N/A"}</strong>
                <small>{recommendation.recommended_hospital?.beds_available || 0} Beds Free ({recommendation.recommended_hospital?.icu_beds_available || 0} ICU)</small>
              </div>
            </div>
          </div>

          {/* TOP SUMMARY STRIP */}
          <div className="rec-summary-strip">
            <div className="strip-item">
              <span className="strip-label">INCIDENT REFERENCE</span>
              <strong className="strip-val">{recommendation.incident_id}</strong>
              <small>{currentIncident?.location || "Srikakulam Sector"}</small>
            </div>

            <div className="strip-item">
              <span className="strip-label">PRIORITY SCORE</span>
              <div className="priority-gauge">
                <span className="gauge-num">{recommendation.priority_score}</span>
                <span className="gauge-max">/ 100</span>
              </div>
              <span className={`priority-tag tag-${recommendation.priority_score >= 80 ? "critical" : recommendation.priority_score >= 60 ? "high" : "standard"}`}>
                {recommendation.response_level}
              </span>
            </div>

            <div className="strip-item">
              <span className="strip-label">REQUIRED FLEET</span>
              <strong className="strip-val text-blue">
                {recommendation.recommended_ambulances_count} {recommendation.fleet_requirement?.recommended_tier || "ALS"} UNIT(S)
              </strong>
              <small>{recommendation.available_ambulances_count} Available in District</small>
            </div>

            <div className="strip-item">
              <span className="strip-label">PRIMARY AMBULANCE</span>
              <strong className="strip-val text-green">
                {recommendation.recommended_ambulance ? `${recommendation.recommended_ambulance.id} (${recommendation.recommended_ambulance.type})` : "NO FLEET AVAILABLE"}
              </strong>
              <small>ETA: ~{recommendation.recommended_ambulance?.eta_minutes || "--"} Mins</small>
            </div>

            <div className="strip-item">
              <span className="strip-label">RECEIVING FACILITY</span>
              <strong className="strip-val text-purple">
                {recommendation.recommended_hospital?.name || "NO FACILITY MATCH"}
              </strong>
              <small>{recommendation.recommended_hospital?.beds_available || 0} Beds Free</small>
            </div>
          </div>

          {/* COMMANDER OPERATOR ACTIONS BAR */}
          <div className="commander-actions-bar">
            <div className="action-status-note">
              <UserCheck size={16} className="text-blue" />
              <span>Human Commander Verification Required Prior to Emergency Dispatch.</span>
            </div>

            <div className="action-buttons-group">
              <button
                className="btn-prealert-trigger"
                onClick={() => setShowPreAlertModal(true)}
              >
                <Building2 size={15} />
                <span>PRE-ALERT HOSPITAL</span>
              </button>

              <button
                className="btn-override-trigger"
                onClick={() => setShowOverrideModal(true)}
              >
                <ShieldAlert size={15} />
                <span>OPERATOR OVERRIDE</span>
              </button>

              <button
                className="btn-approve-dispatch"
                disabled={isDispatching || !recommendation.recommended_ambulance}
                onClick={handleApproveDispatch}
              >
                <Send size={15} />
                <span>{isDispatching ? "DISPATCHING..." : "APPROVE & DISPATCH"}</span>
              </button>
            </div>
          </div>

          {/* EXPLAINABLE REASONING SECTIONS */}
          <div className="explainability-grid">
            {/* WHY AMBULANCE */}
            <div className="explain-card">
              <div className="explain-head">
                <Ambulance size={16} className="text-green" />
                <h3>Why Ambulance {recommendation.recommended_ambulance?.id || "N/A"}?</h3>
              </div>
              <ul className="why-bullets">
                {recommendation.why_ambulance?.map((w, i) => (
                  <li key={i}>✓ {w}</li>
                ))}
              </ul>
            </div>

            {/* WHY HOSPITAL */}
            <div className="explain-card">
              <div className="explain-head">
                <Building2 size={16} className="text-purple" />
                <h3>Why Receiving Facility '{recommendation.recommended_hospital?.name || "Hospital"}'?</h3>
              </div>
              <ul className="why-bullets">
                {recommendation.why_hospital?.map((w, i) => (
                  <li key={i}>✓ {w}</li>
                ))}
              </ul>
            </div>

            {/* SCORING BREAKDOWN */}
            <div className="explain-card">
              <div className="explain-head">
                <Activity size={16} className="text-blue" />
                <h3>Transparent Multi-Factor Scoring</h3>
              </div>
              <div className="scoring-factors-list">
                <div className="factor-row">
                  <span>Base Severity Tier:</span>
                  <strong>+{recommendation.severity_breakdown?.base_points} pts</strong>
                </div>
                <div className="factor-row">
                  <span>Casualty Impact Weight:</span>
                  <strong>+{recommendation.severity_breakdown?.victim_count_points} pts</strong>
                </div>
                <div className="factor-row">
                  <span>Critical Patient Weight:</span>
                  <strong>+{recommendation.severity_breakdown?.critical_casualty_points} pts</strong>
                </div>
                <div className="factor-row">
                  <span>Hazard / Obstruction Factor:</span>
                  <strong>+{recommendation.severity_breakdown?.hazard_type_points} pts</strong>
                </div>
                <div className="factor-total-row">
                  <span>Total Priority Score:</span>
                  <strong>{recommendation.priority_score} / 100</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="intelligence-empty-state">
          <Sparkles size={36} />
          <h3>Select an Emergency to Compute Decision Support</h3>
          <p>
            Choose any incident from Srikakulam District to evaluate multi-criteria ambulance ranking, road delay multipliers, and trauma hospital readiness.
          </p>
        </div>
      )}

      {/* MODALS */}
      {showPreAlertModal && (
        <HospitalPreAlertModal
          incident={currentIncident}
          recommendation={recommendation}
          onClose={() => setShowPreAlertModal(false)}
          onSuccess={() => onRefresh && onRefresh()}
        />
      )}

      {showOverrideModal && (
        <OperatorOverrideModal
          incident={currentIncident}
          recommendation={recommendation}
          ambulances={ambulances}
          hospitals={hospitals}
          onClose={() => setShowOverrideModal(false)}
          onSuccess={() => {
            if (onRefresh) onRefresh();
            handleRunAnalysis(currentIncident.id);
          }}
        />
      )}
    </div>
  );
}
