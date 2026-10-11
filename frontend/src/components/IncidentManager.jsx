import { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  MapPin,
  Users,
  Sparkles,
  ChevronRight,
  Filter,
  ShieldAlert,
  Send,
  Check,
  Building2,
  Ambulance,
  ArrowRight,
  Activity,
  UserCheck,
} from "lucide-react";
import { updateIncidentLifecycle, setAmbulanceStatus, analyzeIncident } from "../api";

const LIFECYCLE_STAGES = [
  { id: "VERIFIED", label: "VERIFIED", color: "blue" },
  { id: "DISPATCH_PENDING", label: "DISPATCH PENDING", color: "yellow" },
  { id: "DISPATCHED", label: "DISPATCHED", color: "orange" },
  { id: "EN_ROUTE", label: "EN ROUTE", color: "orange" },
  { id: "ON_SCENE", label: "ON SCENE", color: "purple" },
  { id: "TRANSPORTING", label: "TRANSPORTING", color: "purple" },
  { id: "ARRIVED_HOSPITAL", label: "ARRIVED HOSPITAL", color: "green" },
  { id: "RESOLVED", label: "RESOLVED", color: "green" },
];

export default function IncidentManager({
  incidents = [],
  onRefresh = null,
  onAnalyze = null,
  onSelectIncident = null,
  selectedIncident = null,
}) {
  const [filterSeverity, setFilterSeverity] = useState("ALL");
  const [filterLifecycle, setFilterLifecycle] = useState("ALL");
  const [statusUpdating, setStatusUpdating] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const filteredIncidents = incidents.filter((inc) => {
    const matchSev = filterSeverity === "ALL" || String(inc.severity).toUpperCase() === filterSeverity;
    const stage = inc.lifecycle_status || (inc.status === "RESOLVED" ? "RESOLVED" : "VERIFIED");
    const matchStage = filterLifecycle === "ALL" || stage === filterLifecycle;
    return matchSev && matchStage;
  });

  const handleAdvanceStage = async (incident, nextStage) => {
    setStatusUpdating(incident.id);
    setFeedback(null);
    try {
      await updateIncidentLifecycle(incident.id, {
        lifecycle_status: nextStage,
        actor: "OPERATOR_COMMANDER",
      });

      if (onRefresh) await onRefresh();
      setFeedback({
        type: "success",
        message: `Incident ${incident.id} progressed to stage: ${nextStage}`,
      });
    } catch (err) {
      console.error("Lifecycle update error:", err);
      setFeedback({ type: "error", message: "Failed to advance lifecycle state." });
    } finally {
      setStatusUpdating(null);
    }
  };

  const getNextStage = (current) => {
    const order = [
      "VERIFIED",
      "DISPATCH_PENDING",
      "DISPATCHED",
      "EN_ROUTE",
      "ON_SCENE",
      "TRANSPORTING",
      "ARRIVED_HOSPITAL",
      "RESOLVED",
    ];
    const idx = order.indexOf(current);
    if (idx >= 0 && idx < order.length - 1) {
      return order[idx + 1];
    }
    return null;
  };

  return (
    <div className="incident-manager-container">
      {/* FILTER & STATS BAR */}
      <div className="incident-filter-bar">
        <div className="filter-group">
          <Filter size={15} />
          <span>FILTERS:</span>

          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="filter-select"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical Priority</option>
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium / Standard</option>
            <option value="LOW">Low Priority</option>
          </select>

          <select
            value={filterLifecycle}
            onChange={(e) => setFilterLifecycle(e.target.value)}
            className="filter-select"
          >
            <option value="ALL">All Lifecycle Stages</option>
            <option value="VERIFIED">Verified / Intake</option>
            <option value="DISPATCH_PENDING">Dispatch Pending</option>
            <option value="DISPATCHED">Dispatched</option>
            <option value="EN_ROUTE">En Route</option>
            <option value="ON_SCENE">On Scene</option>
            <option value="TRANSPORTING">Transporting</option>
            <option value="ARRIVED_HOSPITAL">Arrived Hospital</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>

        <div className="filter-summary">
          <span>
            Sector: <strong>Srikakulam District</strong> ({filteredIncidents.length} of {incidents.length} records)
          </span>
        </div>
      </div>

      {feedback && (
        <div className={`manager-feedback feedback-${feedback.type}`}>
          {feedback.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* TWO PANE LAYOUT: TABLE + DETAIL DRAWER */}
      <div className="incident-split-view">
        {/* TABLE SECTION */}
        <div className="incident-table-wrapper">
          <div className="incident-data-table">
            <div className="table-header-row">
              <span>ID</span>
              <span>TYPE & HAZARDS</span>
              <span>LOCATION (SRIKAKULAM)</span>
              <span>SEVERITY</span>
              <span>CASUALTIES</span>
              <span>LIFECYCLE STAGE</span>
              <span>QUICK ACTION</span>
            </div>

            {filteredIncidents.length === 0 ? (
              <div className="no-records-cell">No matching emergency records in Srikakulam sector.</div>
            ) : (
              filteredIncidents.map((inc) => {
                const isSelected = selectedIncident && selectedIncident.id === inc.id;
                const isUpdating = statusUpdating === inc.id;
                const currStage = inc.lifecycle_status || (inc.status === "RESOLVED" ? "RESOLVED" : "VERIFIED");
                const next = getNextStage(currStage);

                return (
                  <div
                    key={inc.id}
                    className={`table-data-row ${isSelected ? "row-selected" : ""}`}
                    onClick={() => onSelectIncident && onSelectIncident(inc)}
                  >
                    <div className="cell-id">
                      <strong>{inc.id}</strong>
                      <small>{inc.source_call || "DIRECT_CALL"}</small>
                    </div>

                    <div className="cell-type">
                      <span className="type-main">{inc.type}</span>
                      {inc.hazard_type && inc.hazard_type !== "Standard" && (
                        <span className="hazard-tag">{inc.hazard_type}</span>
                      )}
                    </div>

                    <div className="cell-location">
                      <span>{inc.location}</span>
                      <small className="provenance-chip">
                        {inc.location_source || "Landmark"} ({inc.location_confidence || 90}%)
                      </small>
                    </div>

                    <div className="cell-severity">
                      <span className={`badge-severity sev-${String(inc.severity).toLowerCase()}`}>
                        {inc.severity}
                      </span>
                    </div>

                    <div className="cell-victims">
                      <strong>{inc.victims || 1}</strong>
                      {inc.critical_victims > 0 && (
                        <span className="crit-victim-tag">({inc.critical_victims} Crit)</span>
                      )}
                    </div>

                    <div className="cell-lifecycle">
                      <span className={`lifecycle-chip stage-${currStage.toLowerCase()}`}>
                        <i />
                        {currStage}
                      </span>
                    </div>

                    <div className="cell-actions" onClick={(e) => e.stopPropagation()}>
                      {next ? (
                        <button
                          className="btn-advance-stage"
                          disabled={isUpdating}
                          onClick={() => handleAdvanceStage(inc, next)}
                          title={`Advance to ${next}`}
                        >
                          <span>→ {next.replace("_", " ")}</span>
                        </button>
                      ) : (
                        <span className="resolved-tag">✓ COMPLETED</span>
                      )}

                      <button
                        className="btn-analyze-mini"
                        onClick={() => onAnalyze && onAnalyze(inc)}
                        title="Evaluate Decision Support"
                      >
                        <Sparkles size={13} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* DETAIL DRAWER */}
        <div className="incident-detail-drawer">
          {selectedIncident ? (
            <div className="drawer-card">
              <div className="drawer-header">
                <div>
                  <span className="detail-tag">INCIDENT LIFECYCLE PROFILE</span>
                  <h3>{selectedIncident.id}: {selectedIncident.type}</h3>
                  <small className="text-dim">Sector: Srikakulam District [83.8961, 18.2969]</small>
                </div>
                <span className={`badge-severity sev-${String(selectedIncident.severity).toLowerCase()}`}>
                  {selectedIncident.severity}
                </span>
              </div>

              {/* LIFECYCLE STEP TRACKER */}
              <div className="lifecycle-stepper">
                <span className="stepper-label">RESPONSE TIMELINE PROGRESSION:</span>
                <div className="stepper-track">
                  {LIFECYCLE_STAGES.map((st, idx) => {
                    const curr = selectedIncident.lifecycle_status || "VERIFIED";
                    const order = LIFECYCLE_STAGES.map((s) => s.id);
                    const currIdx = order.indexOf(curr);
                    const isPassed = idx <= currIdx;
                    const isCurrent = idx === currIdx;

                    return (
                      <div
                        key={st.id}
                        className={`step-item ${isPassed ? "step-passed" : ""} ${isCurrent ? "step-current" : ""}`}
                        title={st.label}
                      >
                        <div className="step-circle">{idx + 1}</div>
                        <span className="step-txt">{st.label.split(" ")[0]}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* DETAIL STATS */}
              <div className="drawer-stats-grid">
                <div className="drawer-stat">
                  <MapPin size={14} />
                  <div>
                    <label>Location & Landmark</label>
                    <strong>{selectedIncident.location}</strong>
                    <small>GPS: <code>[{selectedIncident.coordinates[0]?.toFixed(4)}, {selectedIncident.coordinates[1]?.toFixed(4)}]</code></small>
                  </div>
                </div>

                <div className="drawer-stat">
                  <Users size={14} />
                  <div>
                    <label>Casualty Sizing</label>
                    <strong>{selectedIncident.victims || 1} Total Inbound</strong>
                    <small>{selectedIncident.critical_victims || 0} Critical Trauma</small>
                  </div>
                </div>

                <div className="drawer-stat">
                  <Ambulance size={14} />
                  <div>
                    <label>Assigned Unit</label>
                    <strong>{selectedIncident.assigned_ambulance_id || "Unassigned"}</strong>
                  </div>
                </div>

                <div className="drawer-stat">
                  <Building2 size={14} />
                  <div>
                    <label>Destination Hospital</label>
                    <strong>{selectedIncident.destination_hospital_id || "Unassigned"}</strong>
                  </div>
                </div>
              </div>

              {selectedIncident.override_reason && (
                <div className="override-alert-box">
                  <ShieldAlert size={15} />
                  <span><strong>Operator Override Active:</strong> "{selectedIncident.override_reason}"</span>
                </div>
              )}

              {/* DRAWER ACTIONS */}
              <div className="drawer-actions-row">
                <button
                  className="btn-drawer-analyze"
                  onClick={() => onAnalyze && onAnalyze(selectedIncident)}
                >
                  <Sparkles size={16} />
                  <span>EVALUATE DECISION SUPPORT</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="drawer-empty-state">
              <Activity size={32} />
              <h4>Select an Incident</h4>
              <p>Click any emergency from the registry to inspect GPS provenance, lifecycle timeline, and assigned resources.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
