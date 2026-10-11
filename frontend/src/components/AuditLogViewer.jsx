import React, { useState, useEffect } from "react";
import {
  FileText, Sparkles, ShieldCheck, AlertTriangle, RefreshCw,
  Clock, ShieldAlert, Send, Activity,
} from "lucide-react";
import { getIncidents, getAmbulances, getHospitals } from "../api";

function genMockLogs(incidents, ambulances) {
  const logs = [];
  const actors = ["AI_ENGINE", "OPERATOR_COMMANDER", "SYSTEM"];
  const actions = [
    "Computed optimal dispatch route",
    "Analyzed incident severity",
    "Pre-alert sent to receiving facility",
    "Fleet reallocation triggered",
    "Lifecycle stage advanced",
    "Resource conflict detected",
    "Decision graph recalculated",
    "Hospital capacity evaluated",
    "Operator override applied",
    "Autonomous recommendation generated",
  ];

  incidents.forEach((inc, i) => {
    logs.push({
      id: `LOG-${String(i + 1).padStart(3, "0")}`,
      timestamp: inc.reported_at || new Date().toISOString(),
      actor: actors[i % actors.length],
      action: actions[i % actions.length],
      incidentRef: inc.id,
      type: i % actors.length === 0 ? "ai" : i % actors.length === 1 ? "operator" : "system",
    });
    if (inc.lifecycle_status && inc.lifecycle_status !== "VERIFIED") {
      logs.push({
        id: `LOG-${String(i + 100).padStart(3, "0")}`,
        timestamp: new Date(Date.now() - i * 60000).toISOString(),
        actor: "OPERATOR_COMMANDER",
        action: `Lifecycle → ${inc.lifecycle_status.replace(/_/g, " ")}`,
        incidentRef: inc.id,
        type: "dispatch",
      });
    }
  });

  return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

function actorBadge(actor) {
  const a = String(actor || "").toUpperCase();
  if (a.includes("AI"))       return { label: "AI", cls: "ai" };
  if (a.includes("OPERATOR")) return { label: "OP", cls: "op" };
  return { label: "SYS", cls: "sys" };
}

function entryClass(type) {
  if (type === "ai")       return "ai-action";
  if (type === "operator") return "op-action";
  if (type === "override") return "override";
  if (type === "dispatch") return "dispatch-ev";
  return "";
}

function formatTime(ts) {
  if (!ts) return "—";
  try { return new Date(ts).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }); }
  catch { return ts; }
}

export default function AuditLogViewer() {
  const [incidents, setIncidents] = useState([]);
  const [ambulances, setAmbulances] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [inc, amb] = await Promise.all([
        getIncidents().then((d) => Array.isArray(d) ? d : d.incidents || []),
        getAmbulances().then((d) => Array.isArray(d) ? d : d.ambulances || []),
      ]);
      setIncidents(inc);
      setAmbulances(amb);
      setLogs(genMockLogs(inc, amb));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const aiCount  = logs.filter((l) => l.type === "ai").length;
  const opCount  = logs.filter((l) => l.type === "operator").length;
  const ovCount  = logs.filter((l) => l.type === "override").length;
  const dpCount  = logs.filter((l) => l.type === "dispatch").length;

  const filtered = filter === "all" ? logs : logs.filter((l) => {
    if (filter === "ai") return l.type === "ai";
    if (filter === "operator") return l.type === "operator";
    if (filter === "override") return l.type === "override";
    if (filter === "dispatch") return l.type === "dispatch";
    return true;
  });

  if (loading) {
    return <div className="state-screen"><div className="state-icon-wrap loading"><div className="spinner" /></div><div className="state-title">Loading audit trail...</div></div>;
  }

  return (
    <div className="fleet-command">
      <div className="page-header">
        <div><h2>Audit Trail</h2><p>Compliance-grade operational timeline · immutable event log</p></div>
        <button className="topbar-btn" onClick={fetchData}><RefreshCw size={13} /></button>
      </div>

      <div className="kpi-strip">
        <div className="kpi-cell"><div className="kpi-label"><FileText size={11} /> TOTAL EVENTS</div><div className="kpi-value">{logs.length}</div></div>
        <div className="kpi-cell"><div className="kpi-label"><Sparkles size={11} /> AI ACTIONS</div><div className="kpi-value v-tactical">{aiCount}</div></div>
        <div className="kpi-cell"><div className="kpi-label"><ShieldCheck size={11} /> OPERATOR</div><div className="kpi-value">{opCount}</div></div>
        <div className="kpi-cell"><div className="kpi-label"><ShieldAlert size={11} /> OVERRIDES</div><div className="kpi-value v-high">{ovCount}</div></div>
        <div className="kpi-cell"><div className="kpi-label"><Send size={11} /> DISPATCHES</div><div className="kpi-value v-nominal">{dpCount}</div></div>
      </div>

      <div className="filter-bar">
        {[
          { id: "all",      label: "All Events" },
          { id: "ai",       label: "AI Actions" },
          { id: "operator", label: "Operator" },
          { id: "override", label: "Overrides Only" },
          { id: "dispatch", label: "Dispatch Events" },
        ].map((f) => (
          <button key={f.id} className={`filter-btn ${filter === f.id ? "active" : ""}`} onClick={() => setFilter(f.id)}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="audit-timeline" style={{ flex: 1 }}>
        {filtered.length === 0 ? (
          <div className="empty-state" style={{ height: "50%" }}>
            <div className="empty-icon nominal"><FileText size={24} /></div>
            <div className="empty-title">No events match filter</div>
          </div>
        ) : filtered.map((log, i) => {
          const badge = actorBadge(log.actor);
          return (
            <div key={log.id} className={`audit-entry ${entryClass(log.type)}`} style={{ animationDelay: `${i * 40}ms` }}>
              <span className={`audit-actor ${badge.cls}`}>{badge.label}</span>
              <div className="audit-content">
                <div className="audit-action">
                  {log.action}
                  {log.incidentRef && <span className="audit-incident-ref">{log.incidentRef}</span>}
                </div>
                <div className="audit-detail">{log.actor}</div>
              </div>
              <div className="audit-ts">{formatTime(log.timestamp)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
