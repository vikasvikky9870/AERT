import React, { useState } from "react";
import {
  Ambulance, MapPin, Users, ShieldCheck, RefreshCw, Clock, Route,
  CheckCircle2, AlertTriangle, BatteryCharging,
} from "lucide-react";
import { setAmbulanceStatus } from "../api";

function statusInfo(status) {
  const s = String(status || "").toUpperCase();
  const map = {
    AVAILABLE:  { label: "AVAILABLE",  cls: "available" },
    DISPATCHED: { label: "DISPATCHED", cls: "dispatched" },
    BUSY:       { label: "EN ROUTE",   cls: "en-route" },
    EN_ROUTE:   { label: "EN ROUTE",   cls: "en-route" },
    OFFLINE:    { label: "OFFLINE",    cls: "offline" },
  };
  return map[s] || map.OFFLINE;
}

export default function FleetCommand({ ambulances = [], incidents = [], onRefresh, onSelectAmbulance }) {
  const [updatingId, setUpdatingId] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [selectedAmb, setSelectedAmb] = useState(null);

  const available  = ambulances.filter((a) => String(a.status).toUpperCase() === "AVAILABLE");
  const dispatched = ambulances.filter((a) => ["DISPATCHED", "BUSY", "EN_ROUTE"].includes(String(a.status).toUpperCase()));
  const offline    = ambulances.filter((a) => String(a.status).toUpperCase() === "OFFLINE");
  const alsAvail   = available.filter((a) => String(a.type).toUpperCase() === "ALS");
  const blsAvail   = available.filter((a) => String(a.type).toUpperCase() === "BLS");

  const handleStatusChange = async (ambId, newStatus) => {
    setUpdatingId(ambId); setFeedback(null);
    try {
      await setAmbulanceStatus(ambId, newStatus);
      if (onRefresh) await onRefresh();
      setFeedback({ type: "success", message: `${ambId} → ${newStatus}` });
    } catch { setFeedback({ type: "error", message: `Failed: ${ambId}` }); }
    finally { setUpdatingId(null); }
  };

  const filtered = filterStatus === "ALL" ? ambulances
    : ambulances.filter((a) => {
        const s = String(a.status).toUpperCase();
        if (filterStatus === "AVAILABLE") return s === "AVAILABLE";
        if (filterStatus === "DEPLOYED") return ["DISPATCHED", "BUSY", "EN_ROUTE"].includes(s);
        return s === "OFFLINE";
      });

  return (
    <div className="fleet-command">
      <div className="page-header">
        <div>
          <h2>EMS Fleet Command</h2>
          <p>ALS/BLS resource allocation · Srikakulam District (Simulated AVL)</p>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {["ALL", "AVAILABLE", "DEPLOYED", "OFFLINE"].map((f) => (
            <button key={f} className={`filter-btn ${filterStatus === f ? "active" : ""}`} onClick={() => setFilterStatus(f)}>{f}</button>
          ))}
          <button className="topbar-btn" onClick={onRefresh}><RefreshCw size={13} /></button>
        </div>
      </div>

      <div className="kpi-strip">
        <div className="kpi-cell nominal"><div className="kpi-label"><Ambulance size={11} /> AVAILABLE</div><div className="kpi-value v-nominal">{available.length}</div></div>
        <div className="kpi-cell"><div className="kpi-label">ALS READY</div><div className="kpi-value v-tactical">{alsAvail.length}</div></div>
        <div className="kpi-cell"><div className="kpi-label">BLS READY</div><div className="kpi-value">{blsAvail.length}</div></div>
        <div className="kpi-cell"><div className="kpi-label">DEPLOYED</div><div className="kpi-value v-high">{dispatched.length}</div></div>
        <div className="kpi-cell"><div className="kpi-label">OFFLINE</div><div className="kpi-value">{offline.length}</div></div>
        <div className="kpi-cell"><div className="kpi-label">TOTAL FLEET</div><div className="kpi-value">{ambulances.length}</div></div>
      </div>

      {feedback && (
        <div className={`feedback-bar ${feedback.type}`} style={{ margin: "8px 16px 0" }}>
          {feedback.type === "success" ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
          <span>{feedback.message}</span>
        </div>
      )}

      <div className="fleet-grid">
        {filtered.length === 0 ? (
          <div className="state-screen" style={{ gridColumn: "1 / -1" }}>
            <div className="state-icon-wrap loading"><Ambulance size={24} /></div>
            <div className="state-title">No units match filter</div>
          </div>
        ) : filtered.map((amb, i) => {
          const si = statusInfo(amb.status);
          const isALS = String(amb.type || "ALS").toUpperCase() === "ALS";
          const equipment = Array.isArray(amb.equipment) ? amb.equipment : [];
          const isUpdating = updatingId === amb.id;

          return (
            <div key={amb.id} className={`fleet-card stagger-card ${selectedAmb?.id === amb.id ? "selected" : ""}`}
              onClick={() => { setSelectedAmb(amb); if (onSelectAmbulance) onSelectAmbulance(amb); }}>
              <div className="fleet-card-head">
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="fleet-card-id">{amb.id}</span>
                  <span className={`status-pill ${isALS ? "als" : "bls"}`}>{isALS ? "ALS" : "BLS"}</span>
                </div>
                <span className={`status-pill ${si.cls}`}>{si.label}</span>
              </div>
              <div className="fleet-card-body">
                {amb.crew && <div className="fleet-info"><Users size={12} /> <strong>{amb.crew}</strong></div>}
                {amb.crew_cert && <div className="fleet-info"><ShieldCheck size={12} /> {amb.crew_cert}</div>}
                {amb.coordinates && (
                  <div className="fleet-info">
                    <MapPin size={12} />
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 10 }}>
                      [{amb.coordinates[0]?.toFixed(4)}, {amb.coordinates[1]?.toFixed(4)}]
                    </span>
                    <span className="sim-tag">SIMULATED GPS</span>
                  </div>
                )}
                {typeof amb.fuel_pct !== "undefined" && (
                  <div className="fuel-bar-wrap">
                    <BatteryCharging size={12} style={{ color: "var(--text-dim)", flexShrink: 0 }} />
                    <span style={{ fontSize: 10, color: "var(--text-muted)", minWidth: 35 }}>{amb.fuel_pct}%</span>
                    <div className="fuel-track">
                      <div className={`fuel-fill ${amb.fuel_pct > 50 ? "good" : amb.fuel_pct > 25 ? "mid" : "low"}`}
                        style={{ width: `${amb.fuel_pct}%` }} />
                    </div>
                  </div>
                )}
                {amb.current_assignment && (
                  <div className="fleet-info" style={{ marginTop: 4 }}>
                    <AlertTriangle size={12} style={{ color: "var(--color-medium)" }} />
                    Assigned: <strong style={{ fontFamily: "var(--font-mono)", color: "var(--color-tactical)" }}>{amb.current_assignment}</strong>
                  </div>
                )}
                {equipment.length > 0 && (
                  <div className="equipment-chips">
                    {equipment.map((eq, j) => <span key={j} className="equip-chip">{eq}</span>)}
                  </div>
                )}
              </div>
              <div className="fleet-card-actions">
                {String(amb.status).toUpperCase() !== "AVAILABLE" && (
                  <button className="fleet-action dispatch-action" disabled={isUpdating}
                    onClick={(e) => { e.stopPropagation(); handleStatusChange(amb.id, "AVAILABLE"); }}>
                    {isUpdating ? "..." : "RETURN TO BASE"}
                  </button>
                )}
                {String(amb.status).toUpperCase() === "AVAILABLE" && (
                  <button className="fleet-action" disabled={isUpdating}
                    onClick={(e) => { e.stopPropagation(); handleStatusChange(amb.id, "OFFLINE"); }}>
                    OFFLINE / STANDBY
                  </button>
                )}
                {String(amb.status).toUpperCase() === "OFFLINE" && (
                  <button className="fleet-action dispatch-action" disabled={isUpdating}
                    onClick={(e) => { e.stopPropagation(); handleStatusChange(amb.id, "AVAILABLE"); }}>
                    RETURN TO SERVICE
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
