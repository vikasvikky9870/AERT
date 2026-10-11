import React from "react";
import { Activity, Ambulance, Building2, MapPin, Clock, AlertTriangle, ChevronRight, RefreshCw } from "lucide-react";

const STAGE_ORDER = ["DISPATCHED", "EN_ROUTE", "ON_SCENE", "TRANSPORTING", "ARRIVED_HOSPITAL"];
const STAGE_LABELS = { DISPATCHED: "Dispatched", EN_ROUTE: "En Route", ON_SCENE: "On Scene", TRANSPORTING: "Transporting", ARRIVED_HOSPITAL: "Arrived" };

function stageClass(stage) {
  const s = String(stage || "").toUpperCase();
  if (s === "EN_ROUTE") return "en-route";
  if (s === "ON_SCENE") return "on-scene";
  if (s === "TRANSPORTING") return "transporting";
  return "";
}

function sevClass(sev) {
  const s = String(sev || "").toUpperCase();
  return s === "CRITICAL" ? "critical" : s === "HIGH" ? "high" : s === "MEDIUM" ? "medium" : "low";
}

export default function LiveResponse({ incidents = [], ambulances = [], hospitals = [], onSelectIncident, onRefresh }) {
  const activeMissions = incidents.filter((i) =>
    STAGE_ORDER.includes(String(i.lifecycle_status || "").toUpperCase())
  );

  const enRouteCount   = activeMissions.filter((i) => i.lifecycle_status === "EN_ROUTE").length;
  const onSceneCount   = activeMissions.filter((i) => i.lifecycle_status === "ON_SCENE").length;
  const transportCount = activeMissions.filter((i) => i.lifecycle_status === "TRANSPORTING").length;

  const getAssignedAmbulance = (inc) => {
    if (inc.ambulance_id) return ambulances.find((a) => a.id === inc.ambulance_id);
    return ambulances.find((a) => a.current_assignment === inc.id);
  };

  const getAssignedHospital = (inc) => {
    if (inc.hospital_id) return hospitals.find((h) => h.id === inc.hospital_id);
    return null;
  };

  return (
    <div className="fleet-command">
      <div className="page-header">
        <div><h2>Live Response Board</h2><p>Active mission tracking · EMS lifecycle · real-time coordination</p></div>
        <button className="topbar-btn" onClick={onRefresh}><RefreshCw size={13} /></button>
      </div>

      <div className="kpi-strip">
        <div className={`kpi-cell ${enRouteCount > 0 ? "alert" : ""}`}>
          <div className="kpi-label"><Ambulance size={11} /> EN ROUTE</div>
          <div className="kpi-value v-high">{enRouteCount}</div>
        </div>
        <div className="kpi-cell nominal"><div className="kpi-label"><Activity size={11} /> ON SCENE</div><div className="kpi-value v-nominal">{onSceneCount}</div></div>
        <div className="kpi-cell"><div className="kpi-label">TRANSPORTING</div><div className="kpi-value v-tactical">{transportCount}</div></div>
        <div className="kpi-cell"><div className="kpi-label">TOTAL MISSIONS</div><div className="kpi-value">{activeMissions.length}</div></div>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "14px 16px" }}>
        {activeMissions.length === 0 ? (
          <div className="empty-state" style={{ height: "100%" }}>
            <div className="empty-icon nominal"><Activity size={24} /></div>
            <div className="empty-title">No Active Missions</div>
            <div className="empty-sub">All units are idle. Dispatch an ambulance from the Overwatch or load a demo scenario.</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {activeMissions.map((inc, i) => {
              const amb = getAssignedAmbulance(inc);
              const hos = getAssignedHospital(inc);
              const currentStageIdx = STAGE_ORDER.indexOf(inc.lifecycle_status);

              return (
                <div key={inc.id} className={`mission-card stagger-card ${stageClass(inc.lifecycle_status)}`}
                  onClick={() => onSelectIncident && onSelectIncident(inc)}>
                  <div className="mission-head">
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span className="mission-id">{inc.id}</span>
                      <span className={`status-pill ${sevClass(inc.severity)}`}>{inc.severity}</span>
                    </div>
                    <span className="status-pill tactical">{STAGE_LABELS[inc.lifecycle_status] || inc.lifecycle_status}</span>
                  </div>
                  <div className="mission-body">
                    <div className="mission-entity">
                      <div className="mission-entity-label">INCIDENT</div>
                      <div className="mission-entity-val">{inc.type}</div>
                      <div className="mission-entity-sub" style={{ display: "flex", alignItems: "center", gap: 3 }}>
                        <MapPin size={10} /> {inc.location}
                      </div>
                      <div className="mission-entity-sub">Victims: {inc.victims || 1}</div>
                    </div>
                    <div className="mission-entity">
                      <div className="mission-entity-label">AMBULANCE</div>
                      {amb ? (
                        <>
                          <div className="mission-entity-val">{amb.id}</div>
                          <div className="mission-entity-sub">{amb.type} · {amb.crew || "Crew"}</div>
                          {amb.eta_minutes && <div className="mission-entity-sub eta"><Clock size={10} /> ETA {amb.eta_minutes} min</div>}
                        </>
                      ) : <div className="mission-entity-sub">Not assigned</div>}
                    </div>
                    <div className="mission-entity">
                      <div className="mission-entity-label">HOSPITAL</div>
                      {hos ? (
                        <>
                          <div className="mission-entity-val" style={{ fontSize: 11 }}>{hos.name}</div>
                          <div className="mission-entity-sub">{hos.trauma_level}</div>
                          <div className="mission-entity-sub">{hos.beds_available} beds · {hos.icu_beds_available} ICU</div>
                        </>
                      ) : <div className="mission-entity-sub">Not assigned</div>}
                    </div>
                  </div>
                  <div className="mission-progress">
                    <div className="stage-flow">
                      {STAGE_ORDER.map((st, idx) => (
                        <React.Fragment key={st}>
                          {idx > 0 && <span className="stage-arrow"><ChevronRight size={10} /></span>}
                          <span className={`stage-node ${idx < currentStageIdx ? "done" : idx === currentStageIdx ? "current" : ""}`}>
                            {STAGE_LABELS[st]}
                          </span>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
