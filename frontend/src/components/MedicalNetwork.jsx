import React, { useState } from "react";
import { Building2, AlertTriangle, RefreshCw, MapPin, Droplets } from "lucide-react";
import HospitalPreAlertModal from "./HospitalPreAlertModal";

function capClass(pct) { return pct >= 90 ? "full" : pct >= 70 ? "high" : ""; }
function capValClass(beds) { return beds <= 2 ? "low" : beds <= 8 ? "medium" : "good"; }

export default function MedicalNetwork({ hospitals = [], incidents = [], onRefresh, onSelectHospital }) {
  const [preAlertTarget, setPreAlertTarget] = useState(null);

  const totalBeds = hospitals.reduce((t, h) => t + Number(h.beds_available || 0), 0);
  const totalICU  = hospitals.reduce((t, h) => t + Number(h.icu_beds_available || 0), 0);
  const l1Centers = hospitals.filter((h) => (h.trauma_level || "").toLowerCase().includes("level 1"));
  const overloaded = hospitals.filter((h) => Number(h.capacity || 0) >= 80);

  return (
    <div className="fleet-command">
      <div className="page-header">
        <div><h2>Medical Network Command</h2><p>Trauma facility capacity · hospital suitability · pre-alert coordination</p></div>
        <button className="topbar-btn" onClick={onRefresh}><RefreshCw size={13} /></button>
      </div>

      <div className="kpi-strip">
        <div className="kpi-cell nominal"><div className="kpi-label"><Building2 size={11} /> FREE BEDS</div><div className="kpi-value v-nominal">{totalBeds}</div></div>
        <div className="kpi-cell"><div className="kpi-label">ICU BAYS</div><div className="kpi-value v-tactical">{totalICU}</div></div>
        <div className="kpi-cell"><div className="kpi-label">FACILITIES</div><div className="kpi-value">{hospitals.length}</div></div>
        <div className="kpi-cell"><div className="kpi-label">LVL-1 TRAUMA</div><div className="kpi-value v-high">{l1Centers.length}</div></div>
        <div className={`kpi-cell ${overloaded.length > 0 ? "alert" : ""}`}>
          <div className="kpi-label">≥80% LOAD</div>
          <div className={`kpi-value ${overloaded.length > 0 ? "v-critical" : ""}`}>{overloaded.length}</div>
        </div>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "14px 16px" }}>
        <div className="hospital-grid">
          {hospitals.length === 0 ? (
            <div className="state-screen" style={{ gridColumn: "1/-1" }}>
              <div className="state-icon-wrap loading"><Building2 size={24} /></div>
              <div className="state-title">No hospital data</div>
            </div>
          ) : hospitals.map((hos, i) => {
            const capacity = Number(hos.capacity || 0);
            const beds = Number(hos.beds_available || 0);
            const icu = Number(hos.icu_beds_available || 0);
            return (
              <div key={hos.id} className="hospital-card stagger-card" onClick={() => onSelectHospital && onSelectHospital(hos)}>
                <div className="hospital-card-head">
                  <div className="hospital-name">{hos.name}</div>
                  <div className="hospital-trauma-row">
                    <span className="status-pill als" style={{ fontSize: 9 }}>{hos.trauma_level || "Emergency Center"}</span>
                    {hos.emergency_department && <span className="status-pill nominal" style={{ fontSize: 9 }}>ER OPEN</span>}
                  </div>
                </div>
                <div className="hospital-card-body">
                  <div className="capacity-grid">
                    <div className="cap-cell"><div className={`cap-val ${capValClass(beds)}`}>{beds}</div><div className="cap-key">FREE BEDS</div></div>
                    <div className="cap-cell"><div className={`cap-val ${icu <= 1 ? "low" : icu <= 3 ? "medium" : "good"}`}>{icu}</div><div className="cap-key">ICU BAYS</div></div>
                    <div className="cap-cell">
                      <div className={`cap-val ${capacity >= 90 ? "low" : capacity >= 70 ? "medium" : "good"}`}>{capacity}%</div>
                      <div className="cap-key">LOAD</div>
                    </div>
                  </div>
                  <div className="occupancy-bar">
                    <div className="occupancy-bar-label">
                      <span>Occupancy</span>
                      <strong style={{ color: capacity >= 80 ? "var(--color-critical)" : capacity >= 60 ? "var(--color-medium)" : "var(--color-nominal)" }}>{capacity}%</strong>
                    </div>
                    <div className="occupancy-track">
                      <div className={`occupancy-fill ${capClass(capacity)}`} style={{ width: `${Math.min(100, capacity)}%` }} />
                    </div>
                  </div>
                  {hos.blood_bank_status && (
                    <div className="hospital-status-row">
                      <Droplets size={12} style={{ color: "var(--color-critical)", flexShrink: 0 }} />
                      Blood Bank: <strong style={{ marginLeft: 4, color: hos.blood_bank_status === "AVAILABLE" ? "var(--color-nominal)" : "var(--color-critical)" }}>
                        {hos.blood_bank_status}
                      </strong>
                    </div>
                  )}
                  {hos.coordinates && (
                    <div className="hospital-status-row">
                      <MapPin size={12} style={{ flexShrink: 0 }} />
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 10 }}>
                        [{hos.coordinates[0]?.toFixed(4)}, {hos.coordinates[1]?.toFixed(4)}]
                      </span>
                    </div>
                  )}
                </div>
                <div className="hospital-actions">
                  <button className="hospital-btn pre-alert" onClick={(e) => { e.stopPropagation(); setPreAlertTarget(hos); }}>
                    <AlertTriangle size={12} /> SEND PRE-ALERT
                  </button>
                  <button className="hospital-btn" onClick={(e) => { e.stopPropagation(); onSelectHospital && onSelectHospital(hos); }}>
                    <MapPin size={12} /> VIEW ON MAP
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {preAlertTarget && (
        <HospitalPreAlertModal incident={incidents[0] || null} recommendation={{ recommended_hospital: preAlertTarget }}
          onClose={() => setPreAlertTarget(null)} onSuccess={() => { setPreAlertTarget(null); if (onRefresh) onRefresh(); }} />
      )}
    </div>
  );
}
