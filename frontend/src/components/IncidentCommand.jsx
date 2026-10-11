import React, { useState, useEffect } from "react";
import {
  AlertTriangle, MapPin, Clock, Users, Ambulance, Building2, Route,
  ShieldAlert, CheckCircle2, ChevronDown, ChevronUp, Sparkles, Activity,
  FileText, Edit3,
} from "lucide-react";
import { analyzeIncident, updateIncidentLifecycle } from "../api";

const LIFECYCLE_STAGES = [
  { id: "CALL_RECEIVED",    label: "Call Received",    short: "CALL" },
  { id: "TRIAGE",           label: "AI Triage",        short: "TRIAGE" },
  { id: "VERIFIED",         label: "Verified",         short: "VERIFIED" },
  { id: "DISPATCH_PENDING", label: "Dispatch Pending", short: "PENDING" },
  { id: "DISPATCHED",       label: "Dispatched",       short: "DISPATCH" },
  { id: "EN_ROUTE",         label: "En Route",         short: "EN ROUTE" },
  { id: "ON_SCENE",         label: "On Scene",         short: "ON SCENE" },
  { id: "TRANSPORTING",     label: "Transporting",     short: "TRANSPORT" },
  { id: "ARRIVED_HOSPITAL", label: "Hospital Arrival",  short: "ARRIVED" },
  { id: "RESOLVED",         label: "Resolved",         short: "RESOLVED" },
];

function getStageIndex(stageId) { return LIFECYCLE_STAGES.findIndex((s) => s.id === stageId); }
function sevClass(sev) {
  const s = String(sev || "").toUpperCase();
  return s === "CRITICAL" ? "critical" : s === "HIGH" ? "high" : s === "MEDIUM" ? "medium" : "low";
}
function formatTimestamp(ts) {
  if (!ts) return "—";
  try { return new Date(ts).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }); }
  catch { return ts; }
}

function IncidentSelector({ incidents, selectedId, onSelect }) {
  const [open, setOpen] = useState(false);
  const selected = incidents.find((i) => i.id === selectedId);
  return (
    <div className="dropdown-anchor">
      <button className="topbar-btn" onClick={() => setOpen(!open)}>
        {selected ? (
          <><span style={{ fontFamily: "var(--font-mono)" }}>{selected.id}</span>
            <span className={`status-pill ${sevClass(selected.severity)}`}>{selected.severity}</span></>
        ) : <span>Select Incident</span>}
        {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </button>
      {open && (
        <div className="dropdown-menu" style={{ minWidth: 300 }}>
          <div className="dropdown-header">SELECT INCIDENT</div>
          {incidents.length === 0
            ? <div style={{ padding: "12px", color: "var(--text-muted)", fontSize: 11 }}>No active incidents.</div>
            : incidents.map((inc) => (
                <button key={inc.id} className={`dropdown-item ${inc.id === selectedId ? "active" : ""}`}
                  onClick={() => { onSelect(inc); setOpen(false); }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700 }}>{inc.id}</span>
                  <span className={`status-pill ${sevClass(inc.severity)}`} style={{ marginLeft: 6, fontSize: 9 }}>{inc.severity}</span>
                  <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--text-muted)" }}>{inc.type}</span>
                </button>
              ))
          }
        </div>
      )}
    </div>
  );
}

export default function IncidentCommand({
  incidents = [], selectedIncident = null, recommendation = null,
  ambulances = [], hospitals = [],
  onSelectIncident, onRefresh, onOpenPreAlert, onOpenOverride, onGoToAI,
}) {
  const [activeInc, setActiveInc] = useState(selectedIncident || incidents[0] || null);
  const [rec, setRec] = useState(recommendation);
  const [advancing, setAdvancing] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [loadingRec, setLoadingRec] = useState(false);

  useEffect(() => { if (selectedIncident) setActiveInc(selectedIncident); }, [selectedIncident?.id]);
  useEffect(() => { if (recommendation) setRec(recommendation); }, [recommendation]);
  useEffect(() => {
    if (activeInc && !rec) {
      setLoadingRec(true);
      analyzeIncident(activeInc.id).then(setRec).catch(console.error).finally(() => setLoadingRec(false));
    }
  }, [activeInc?.id]);

  const handleSelectIncident = (inc) => {
    setActiveInc(inc); setRec(null); setFeedback(null);
    if (onSelectIncident) onSelectIncident(inc);
    setLoadingRec(true);
    analyzeIncident(inc.id).then(setRec).catch(console.error).finally(() => setLoadingRec(false));
  };

  const handleAdvance = async (stageId) => {
    if (!activeInc) return;
    setAdvancing(true); setFeedback(null);
    try {
      await updateIncidentLifecycle(activeInc.id, { lifecycle_status: stageId, actor: "OPERATOR_COMMANDER" });
      if (onRefresh) await onRefresh();
      setFeedback({ type: "success", message: `Stage → ${stageId.replace(/_/g, " ")}` });
    } catch { setFeedback({ type: "error", message: "Stage update failed." }); }
    finally { setAdvancing(false); }
  };

  if (!activeInc && incidents.length === 0) {
    return (
      <div className="state-screen">
        <div className="state-icon-wrap error"><AlertTriangle size={24} /></div>
        <div className="state-title">No Active Incidents</div>
        <div className="state-sub">Load a demo scenario to begin.</div>
      </div>
    );
  }

  const currentStageIdx = getStageIndex(activeInc?.lifecycle_status || "VERIFIED");
  const assignedAmb = rec?.recommended_ambulance || ambulances.find((a) => a.current_assignment === activeInc?.id);
  const assignedHos = rec?.recommended_hospital;

  return (
    <div className="incident-command">
      {/* HEADER */}
      <div className="inc-header">
        <div className="inc-id-row">
          {activeInc && (
            <>
              <span className="inc-id">{activeInc.id}</span>
              <span className={`status-pill ${sevClass(activeInc.severity)}`}>{activeInc.severity}</span>
              <span className="status-pill active">{activeInc.status || "ACTIVE"}</span>
              {activeInc.lifecycle_status && (
                <span className="status-pill tactical">{activeInc.lifecycle_status.replace(/_/g, " ")}</span>
              )}
            </>
          )}
          <div style={{ marginLeft: "auto" }}>
            <IncidentSelector incidents={incidents} selectedId={activeInc?.id} onSelect={handleSelectIncident} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 20, marginTop: 6 }}>
          <div className="detail-field"><div className="detail-label">TYPE</div><div className="detail-value">{activeInc?.type}</div></div>
          <div className="detail-field">
            <div className="detail-label">LOCATION</div>
            <div className="detail-value" style={{ display: "flex", alignItems: "center", gap: 4 }}><MapPin size={11} /> {activeInc?.location}</div>
          </div>
          <div className="detail-field"><div className="detail-label">REPORTED</div><div className="detail-value mono">{formatTimestamp(activeInc?.reported_at)}</div></div>
        </div>
        {feedback && (
          <div className={`feedback-bar ${feedback.type}`} style={{ marginTop: 8, maxWidth: 500 }}>
            {feedback.type === "success" ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
            <span>{feedback.message}</span>
          </div>
        )}
      </div>

      {/* BODY: 3 columns */}
      <div className="inc-body">
        {/* LEFT — Situation Report */}
        <div className="inc-section">
          <div className="section-title"><FileText size={13} /> SITUATION REPORT</div>
          <div className="detail-field"><div className="detail-label">INCIDENT TYPE</div><div className="detail-value">{activeInc?.type || "—"}</div></div>
          <div className="detail-field">
            <div className="detail-label">LOCATION</div>
            <div className="detail-value" style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <MapPin size={12} style={{ color: "var(--color-geo)", flexShrink: 0 }} /> {activeInc?.location || "—"}
            </div>
            {activeInc?.coordinates && (
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-dim)", marginTop: 2 }}>
                [{activeInc.coordinates[0]?.toFixed(4)}, {activeInc.coordinates[1]?.toFixed(4)}] <span className="sim-tag">SIMULATED GPS</span>
              </div>
            )}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, margin: "10px 0" }}>
            <div className="metric-cell">
              <div className="metric-label">TOTAL CASUALTIES</div>
              <div className={`metric-value ${(activeInc?.victims || 0) >= 4 ? "critical" : "tactical"}`} style={{ fontSize: 28 }}>
                {activeInc?.victims || 0}
              </div>
            </div>
            <div className="metric-cell">
              <div className="metric-label">CRITICAL</div>
              <div className={`metric-value ${(activeInc?.critical_victims || 0) > 0 ? "critical" : ""}`} style={{ fontSize: 28 }}>
                {activeInc?.critical_victims || 0}
              </div>
            </div>
          </div>
          <div className="detail-field"><div className="detail-label">HAZARD TYPE</div><div className="detail-value">{activeInc?.hazard_type || "Standard"}</div></div>
          {activeInc?.notes && (<div className="detail-field"><div className="detail-label">NOTES</div><div className="detail-value" style={{ fontStyle: "italic" }}>{activeInc.notes}</div></div>)}
          {rec && (
            <div className="glass-card stagger-card" style={{ marginTop: 16, padding: 14, borderColor: "var(--color-ai-border)", background: "var(--color-ai-bg)" }}>
              <div className="section-title" style={{ color: "var(--color-ai)", marginBottom: 8 }}><Sparkles size={13} /> AI ASSESSMENT</div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)" }}>{rec.priority_score}</div>
                  <div style={{ fontSize: 9, color: "var(--text-muted)", letterSpacing: "0.1em" }}>SCORE /100</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div className={`status-pill ${sevClass(activeInc?.severity)}`} style={{ marginBottom: 6, display: "inline-flex" }}>{rec.response_level}</div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Confidence: <strong style={{ color: "var(--text-secondary)" }}>{rec.confidence_label}</strong></div>
                  <div style={{ fontSize: 10, color: "var(--color-ai)", marginTop: 2, cursor: "pointer", textDecoration: "underline dotted" }} onClick={onGoToAI}>
                    View full decision graph →
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CENTER — Timeline */}
        <div className="inc-section">
          <div className="section-title"><Activity size={13} /> RESPONSE TIMELINE</div>
          <div className="op-timeline">
            {LIFECYCLE_STAGES.map((stage, idx) => {
              const isComplete = idx < currentStageIdx;
              const isActive = idx === currentStageIdx;
              const isPending = idx > currentStageIdx;
              return (
                <div key={stage.id} className="timeline-step">
                  <div className={`timeline-dot ${isComplete ? "done" : isActive ? "active" : "pending"}`} />
                  <div className="timeline-content">
                    <div className={`timeline-stage ${isActive ? "active" : isPending ? "pending" : ""}`}>{stage.label}</div>
                    {isActive && <div className="timeline-time">CURRENT STAGE</div>}
                    {isComplete && <div className="timeline-time" style={{ color: "var(--color-nominal)" }}>✓ Complete</div>}
                    {isPending && !isActive && activeInc?.lifecycle_status !== "RESOLVED" && (
                      <button className="btn-advance" onClick={() => handleAdvance(stage.id)} disabled={advancing}>
                        → {stage.short}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT — Resources */}
        <div className="inc-section" style={{ background: "var(--bg-primary)" }}>
          <div className="section-title"><Ambulance size={13} /> ASSIGNED RESOURCES</div>
          <div className="glass-card stagger-card" style={{ padding: 12, marginBottom: 10 }}>
            <div className="detail-label">AMBULANCE UNIT</div>
            {loadingRec ? <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Computing...</div> : assignedAmb ? (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 5, marginBottom: 5 }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 16, fontWeight: 800, color: "var(--text-primary)" }}>{assignedAmb.id}</span>
                  <span className={`status-pill ${assignedAmb.type === "ALS" ? "als" : "bls"}`}>{assignedAmb.type}</span>
                </div>
                <div className="fleet-info"><Clock size={11} /> ETA: <strong>{assignedAmb.eta_minutes} min</strong></div>
                <div className="fleet-info"><Route size={11} /> Distance: <strong>{assignedAmb.distance_km} km</strong></div>
                <div className="sim-tag" style={{ marginTop: 6 }}>SIMULATED AVL</div>
              </>
            ) : <div style={{ fontSize: 11, color: "var(--text-muted)" }}>No unit assigned yet</div>}
          </div>
          <div className="glass-card stagger-card" style={{ padding: 12, marginBottom: 14 }}>
            <div className="detail-label">RECEIVING FACILITY</div>
            {assignedHos ? (
              <>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginTop: 5, marginBottom: 5 }}>{assignedHos.name}</div>
                <div className="fleet-info"><Building2 size={11} /> {assignedHos.trauma_level}</div>
                <div className="fleet-info"><Activity size={11} /> {assignedHos.beds_available} beds · {assignedHos.icu_beds_available} ICU</div>
                <div className="fleet-info"><Route size={11} /> ETA {assignedHos.eta_minutes} min</div>
              </>
            ) : <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{loadingRec ? "Computing..." : "No hospital assigned"}</div>}
          </div>

          <div className="section-title" style={{ marginTop: 4 }}><Edit3 size={13} /> OPERATOR ACTIONS</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <button className="btn-dispatch" onClick={onGoToAI} style={{ background: "linear-gradient(135deg, var(--color-ai), #7c3aed)", boxShadow: "0 2px 12px var(--color-ai-glow)" }}>
              <Sparkles size={14} /> VIEW AI DECISION GRAPH
            </button>
            <button className="btn-secondary medical" style={{ padding: 9, width: "100%", justifyContent: "center" }} onClick={onOpenPreAlert}>
              <Building2 size={13} /> SEND HOSPITAL PRE-ALERT
            </button>
            <button className="btn-secondary override" style={{ padding: 9, width: "100%", justifyContent: "center" }} onClick={onOpenOverride}>
              <ShieldAlert size={13} /> OPERATOR OVERRIDE
            </button>
          </div>

          {rec?.reasoning?.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div className="section-title"><Sparkles size={13} style={{ color: "var(--color-ai)" }} /> AI REASONING</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {rec.reasoning.slice(0, 4).map((r, i) => (
                  <div key={i} style={{
                    fontSize: 10, color: "var(--text-muted)", padding: "5px 8px",
                    borderRadius: "var(--r-sm)", background: "rgba(0,0,0,0.2)",
                    borderLeft: "2px solid var(--color-ai)", lineHeight: 1.5,
                  }}>{r}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
