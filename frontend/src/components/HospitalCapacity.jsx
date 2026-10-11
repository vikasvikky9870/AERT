import { useState, useEffect } from "react";
import { Activity, CheckCircle, AlertTriangle, ShieldCheck, MapPin, Building2, Send, Clock } from "lucide-react";
import { getHospitalPreAlerts } from "../api";

export default function HospitalCapacity({
  hospitals = [],
  onSelectHospital = null,
}) {
  const [preAlerts, setPreAlerts] = useState([]);

  useEffect(() => {
    async function loadPreAlerts() {
      try {
        const res = await getHospitalPreAlerts();
        setPreAlerts(res.pre_alerts || []);
      } catch (err) {
        console.error("Failed to load pre-alerts:", err);
      }
    }
    loadPreAlerts();
  }, []);

  const totalBeds = hospitals.reduce((sum, h) => sum + (h.beds_available || 0), 0);
  const totalIcuBeds = hospitals.reduce((sum, h) => sum + (h.icu_beds_available || 0), 0);
  const avgLoad = hospitals.length
    ? Math.round(hospitals.reduce((sum, h) => sum + (h.capacity || 0), 0) / hospitals.length)
    : 0;

  return (
    <div className="hospitals-screen">
      {/* HEADER STRIP */}
      <div className="hospital-metrics-panel">
        <div>
          <h2>Srikakulam Hospital Network & Trauma Center Readiness</h2>
          <p className="subtitle">ICU beds, emergency department intake readiness, blood bank reserves, and load indicators across Srikakulam District.</p>
        </div>

        <div className="hospital-kpis">
          <div className="hkpi-card">
            <span>TOTAL FREE BEDS</span>
            <strong className="text-green">{totalBeds}</strong>
          </div>
          <div className="hkpi-card">
            <span>AVAILABLE ICU BEDS</span>
            <strong className="text-blue">{totalIcuBeds}</strong>
          </div>
          <div className="hkpi-card">
            <span>AVG NETWORK LOAD</span>
            <strong className="text-purple">{avgLoad}%</strong>
          </div>
          <div className="hkpi-card">
            <span>TRAUMA READY</span>
            <strong className="text-green">{hospitals.filter((h) => h.emergency_department).length} / {hospitals.length}</strong>
          </div>
        </div>
      </div>

      {/* HOSPITAL CARDS GRID */}
      <div className="hospital-grid">
        {hospitals.map((hos) => {
          const cap = Math.min(100, Math.max(0, hos.capacity || 0));
          const isCritical = cap >= 90;
          const isWarning = cap >= 75 && cap < 90;

          return (
            <div
              key={hos.id}
              className={`hospital-card ${isCritical ? "load-critical" : isWarning ? "load-warning" : "load-healthy"}`}
              onClick={() => onSelectHospital && onSelectHospital(hos)}
            >
              <div className="hos-card-top">
                <div className="hos-title-wrap">
                  <span className="hos-icon">🏥</span>
                  <div>
                    <h4>{hos.name}</h4>
                    <span className="hos-id">{hos.id} — {hos.trauma_level || "Level 1 Trauma Center"}</span>
                  </div>
                </div>

                <span className={`er-badge ${hos.emergency_department ? "er-active" : "er-limited"}`}>
                  {hos.emergency_department ? "ER ACTIVE 24/7" : "LIMITED"}
                </span>
              </div>

              {/* CAPACITY PROGRESS */}
              <div className="hos-capacity-section">
                <div className="cap-label-row">
                  <span>Occupancy Load</span>
                  <strong>{hos.capacity}%</strong>
                </div>
                <div className="cap-bar-track">
                  <div
                    className={`cap-bar-fill ${isCritical ? "fill-red" : isWarning ? "fill-orange" : "fill-green"}`}
                    style={{ width: `${cap}%` }}
                  />
                </div>
              </div>

              <div className="hos-detail-stats">
                <div className="stat-pill">
                  <span>General Free Beds</span>
                  <strong className={hos.beds_available > 10 ? "text-green" : "text-orange"}>
                    {hos.beds_available}
                  </strong>
                </div>

                <div className="stat-pill">
                  <span>ICU Free Beds</span>
                  <strong className="text-blue">{hos.icu_beds_available || 2}</strong>
                </div>

                <div className="stat-pill">
                  <span>Blood Bank</span>
                  <small>{hos.blood_bank_status || "AVAILABLE"}</small>
                </div>

                <div className="stat-pill">
                  <span>Oxygen Reserves</span>
                  <small>{hos.oxygen_reserve_hrs || 48} Hours</small>
                </div>
              </div>

              <div className="hos-card-footer">
                <span className="status-dot" />
                <span>{isCritical ? "Near Capacity Saturation" : isWarning ? "Limited Bed Allocation" : "Optimal Emergency Capacity"}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* RECENT PRE-ALERTS LOGS */}
      {preAlerts.length > 0 && (
        <div className="prealerts-history-section">
          <div className="prealerts-head">
            <Building2 size={16} className="text-purple" />
            <h3>Recent Inbound Clinical Pre-Alerts (Srikakulam Network)</h3>
          </div>
          <div className="prealerts-list">
            {preAlerts.slice(0, 5).map((pa) => (
              <div key={pa.id} className="prealert-item-row">
                <span className="pa-badge">PRE-ALERT</span>
                <strong>{pa.hospital_id}</strong>
                <span>Inbound: {pa.incident_id} via {pa.ambulance_id}</span>
                <span className="pa-eta">ETA: ~{pa.estimated_eta_mins} min</span>
                <small>{pa.patient_summary}</small>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
