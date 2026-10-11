import React, { useState, useEffect } from "react";
import {
  BarChart3, AlertTriangle, Ambulance, Building2, Sparkles, Activity,
  Clock, RefreshCw, TrendingUp,
} from "lucide-react";
import { getIncidents, getAmbulances, getHospitals } from "../api";

function DonutRing({ size = 80, strokeWidth = 8, segments = [], centerLabel = "" }) {
  const r = (size - strokeWidth) / 2;
  const C = 2 * Math.PI * r;
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  let offset = 0;

  return (
    <div className="donut-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth} />
        {segments.map((seg, i) => {
          const pct = seg.value / total;
          const dashLen = C * pct;
          const el = (
            <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none"
              stroke={seg.color} strokeWidth={strokeWidth}
              strokeDasharray={`${dashLen} ${C - dashLen}`}
              strokeDashoffset={-offset} strokeLinecap="round" />
          );
          offset += dashLen;
          return el;
        })}
      </svg>
      <div className="donut-label">{centerLabel}</div>
    </div>
  );
}

function BarChart({ data = [], maxVal }) {
  const m = maxVal || Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="bar-chart">
      {data.map((d, i) => (
        <div key={i} className="bar-col">
          <div className={`bar-fill ${d.cls || ""}`} style={{ height: `${(d.value / m) * 100}%` }} />
          <span className="bar-label">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsDashboard() {
  const [incidents, setIncidents] = useState([]);
  const [ambulances, setAmbulances] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [inc, amb, hos] = await Promise.all([
        getIncidents().then((d) => Array.isArray(d) ? d : d.incidents || []),
        getAmbulances().then((d) => Array.isArray(d) ? d : d.ambulances || []),
        getHospitals().then((d) => Array.isArray(d) ? d : d.hospitals || []),
      ]);
      setIncidents(inc); setAmbulances(amb); setHospitals(hos);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const active   = incidents.filter((i) => String(i.status).toUpperCase() === "ACTIVE");
  const resolved = incidents.filter((i) => String(i.status).toUpperCase() === "RESOLVED");
  const critCount   = active.filter((i) => String(i.severity).toUpperCase() === "CRITICAL").length;
  const highCount   = active.filter((i) => String(i.severity).toUpperCase() === "HIGH").length;
  const medCount    = active.filter((i) => String(i.severity).toUpperCase() === "MEDIUM").length;
  const lowCount    = active.filter((i) => String(i.severity).toUpperCase() === "LOW").length;

  const avail   = ambulances.filter((a) => String(a.status).toUpperCase() === "AVAILABLE");
  const busy    = ambulances.filter((a) => ["DISPATCHED", "BUSY", "EN_ROUTE"].includes(String(a.status).toUpperCase()));
  const offline = ambulances.filter((a) => String(a.status).toUpperCase() === "OFFLINE");

  const totalCap  = hospitals.reduce((t, h) => t + Number(h.capacity || 0), 0);
  const avgCap    = hospitals.length ? Math.round(totalCap / hospitals.length) : 0;
  const totalBeds = hospitals.reduce((t, h) => t + Number(h.beds_available || 0), 0);

  const typeMap = {};
  incidents.forEach((i) => { typeMap[i.type] = (typeMap[i.type] || 0) + 1; });
  const typeBarData = Object.entries(typeMap).map(([label, value]) => ({ label: label?.slice(0, 8), value }));

  if (loading) {
    return <div className="state-screen"><div className="state-icon-wrap loading"><div className="spinner" /></div><div className="state-title">Loading analytics...</div></div>;
  }

  return (
    <div className="fleet-command">
      <div className="page-header">
        <div><h2>Operational Analytics</h2><p>Real-time performance metrics · Srikakulam District</p></div>
        <button className="topbar-btn" onClick={fetchAll}><RefreshCw size={13} /></button>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "14px 16px" }}>
        <div className="analytics-grid">
          {/* Total incidents */}
          <div className="analytics-card stagger-card">
            <div className="analytics-card-head"><AlertTriangle size={14} /> Total Incidents</div>
            <div className="analytics-card-body">
              <div className="metric-big">{incidents.length}</div>
              <div className="metric-sub">{active.length} active · {resolved.length} resolved</div>
            </div>
          </div>

          {/* Severity */}
          <div className="analytics-card stagger-card">
            <div className="analytics-card-head"><Activity size={14} /> Severity Distribution</div>
            <div className="analytics-card-body">
              <BarChart data={[
                { label: "CRIT", value: critCount, cls: "bar-critical" },
                { label: "HIGH", value: highCount, cls: "bar-high" },
                { label: "MED",  value: medCount,  cls: "bar-medium" },
                { label: "LOW",  value: lowCount,  cls: "bar-nominal" },
              ]} />
            </div>
          </div>

          {/* Incident Types */}
          <div className="analytics-card stagger-card">
            <div className="analytics-card-head"><BarChart3 size={14} /> Incident Types</div>
            <div className="analytics-card-body">
              {typeBarData.length > 0 ? <BarChart data={typeBarData} /> : <div className="metric-sub">No data</div>}
            </div>
          </div>

          {/* Fleet Donut */}
          <div className="analytics-card stagger-card">
            <div className="analytics-card-head"><Ambulance size={14} /> Fleet Availability</div>
            <div className="analytics-card-body" style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <DonutRing size={90} strokeWidth={10} centerLabel={`${avail.length}/${ambulances.length}`}
                segments={[
                  { value: avail.length, color: "var(--color-nominal)" },
                  { value: busy.length,  color: "var(--color-high)" },
                  { value: offline.length, color: "var(--text-dim)" },
                ]} />
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11 }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--color-nominal)" }} /> Available: {avail.length}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11 }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--color-high)" }} /> Deployed: {busy.length}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11 }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--text-dim)" }} /> Offline: {offline.length}
                </div>
              </div>
            </div>
          </div>

          {/* Hospital Capacity */}
          <div className="analytics-card stagger-card">
            <div className="analytics-card-head"><Building2 size={14} /> Hospital Capacity</div>
            <div className="analytics-card-body" style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <DonutRing size={90} strokeWidth={10} centerLabel={`${avgCap}%`}
                segments={[
                  { value: avgCap,       color: avgCap > 80 ? "var(--color-critical)" : avgCap > 60 ? "var(--color-medium)" : "var(--color-nominal)" },
                  { value: 100 - avgCap, color: "rgba(255,255,255,0.05)" },
                ]} />
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div className="metric-sub"><strong style={{ color: "var(--text-primary)" }}>{totalBeds}</strong> free beds</div>
                <div className="metric-sub"><strong style={{ color: "var(--text-primary)" }}>{hospitals.length}</strong> facilities</div>
                <div className="metric-sub">Avg load: <strong style={{ color: avgCap > 80 ? "var(--color-critical)" : "var(--text-primary)" }}>{avgCap}%</strong></div>
              </div>
            </div>
          </div>

          {/* AI Metrics */}
          <div className="analytics-card stagger-card">
            <div className="analytics-card-head"><Sparkles size={14} style={{ color: "var(--color-ai)" }} /> AI Intelligence</div>
            <div className="analytics-card-body">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 28, fontWeight: 900, color: "var(--color-ai)" }}>{active.length}</div>
                  <div className="metric-sub">AI decisions</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 28, fontWeight: 900, color: "var(--color-high)" }}>0</div>
                  <div className="metric-sub">Overrides</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 28, fontWeight: 900, color: "var(--color-medical)" }}>0</div>
                  <div className="metric-sub">Pre-alerts</div>
                </div>
              </div>
              <div className="sim-tag" style={{ marginTop: 12, display: "inline-flex" }}>RULE-BASED AI · EXPLAINABLE · HUMAN-IN-THE-LOOP</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
