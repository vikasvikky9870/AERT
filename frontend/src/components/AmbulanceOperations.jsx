import { useState } from "react";
import { Navigation, Users, Shield, CheckCircle2, AlertCircle, PhoneCall, MapPin, RefreshCw, BatteryCharging, Zap, ShieldCheck } from "lucide-react";
import { setAmbulanceStatus } from "../api";

export default function AmbulanceOperations({
  ambulances = [],
  onRefresh = null,
  onSelectAmbulance = null,
}) {
  const [statusUpdating, setStatusUpdating] = useState(null);

  const availableCount = ambulances.filter((a) => a.status === "AVAILABLE").length;
  const busyCount = ambulances.filter((a) => a.status === "BUSY" || a.status === "DISPATCHED").length;
  const offlineCount = ambulances.filter((a) => a.status === "OFFLINE").length;

  const total = ambulances.length || 1;
  const availPct = Math.round((availableCount / total) * 100);
  const busyPct = Math.round((busyCount / total) * 100);
  const offPct = Math.round((offlineCount / total) * 100);

  const handleStatusChange = async (ambId, newStatus) => {
    setStatusUpdating(ambId);
    try {
      await setAmbulanceStatus(ambId, newStatus);
      if (onRefresh) await onRefresh();
    } catch (err) {
      console.error("Ambulance status change error:", err);
    } finally {
      setStatusUpdating(null);
    }
  };

  const handleToggleReturn = async (amb) => {
    const nextStatus = amb.status === "AVAILABLE" ? "BUSY" : "AVAILABLE";
    await handleStatusChange(amb.id, nextStatus);
  };

  return (
    <div className="operations-screen">
      {/* FLEET UTILIZATION BAR */}
      <div className="fleet-metrics-panel">
        <div className="metric-header">
          <div>
            <h2>EMS Fleet Operations & Sector Readiness</h2>
            <p className="subtitle">ALS/BLS resource allocation and paramedic crew staging across Srikakulam District (Simulated AVL Telemetry).</p>
          </div>
          <div className="fleet-counts">
            <span className="count-badge green-badge">● {availableCount} Ready for Dispatch</span>
            <span className="count-badge orange-badge">● {busyCount} In-Transit / Dispatched</span>
            <span className="count-badge gray-badge">● {offlineCount} Depot Standby</span>
          </div>
        </div>

        {/* UTILIZATION PROGRESS BAR */}
        <div className="utilization-bar-wrap">
          <div className="utilization-label">
            <span>Srikakulam Fleet Availability Index</span>
            <strong>{availPct}% Ready for Regional Dispatch</strong>
          </div>
          <div className="multi-progress-track">
            <div className="progress-segment seg-available" style={{ width: `${availPct}%` }} title={`Available: ${availableCount}`} />
            <div className="progress-segment seg-busy" style={{ width: `${busyPct}%` }} title={`Busy: ${busyCount}`} />
            <div className="progress-segment seg-offline" style={{ width: `${offPct}%` }} title={`Offline: ${offlineCount}`} />
          </div>
        </div>
      </div>

      {/* AMBULANCE GRID */}
      <div className="ambulance-grid">
        {ambulances.map((amb) => {
          const isBusy = amb.status === "BUSY" || amb.status === "DISPATCHED";
          const isAvail = amb.status === "AVAILABLE";
          const isAls = amb.type === "ALS";

          return (
            <div
              key={amb.id}
              className={`ambulance-card ${isAvail ? "card-available" : isBusy ? "card-busy" : "card-offline"}`}
              onClick={() => onSelectAmbulance && onSelectAmbulance(amb)}
            >
              <div className="card-top-row">
                <div className="unit-id-badge">
                  <span className="unit-icon">🚑</span>
                  <div>
                    <strong>{amb.id}</strong>
                    <span className={`unit-tier-tag tier-${amb.type?.toLowerCase() || "als"}`}>
                      {amb.type || "ALS"} UNIT
                    </span>
                  </div>
                </div>

                <div className="amb-actions-top" onClick={(e) => e.stopPropagation()}>
                  <button
                    className={`btn-amb-toggle ${isAvail ? "btn-amb-busy" : "btn-amb-avail"}`}
                    disabled={statusUpdating === amb.id}
                    onClick={() => handleToggleReturn(amb)}
                    title={isAvail ? "Set Busy" : "Set Available"}
                  >
                    <RefreshCw size={12} className={statusUpdating === amb.id ? "spinner-icon" : ""} />
                    <span>{isAvail ? "Set Busy" : "Set Available"}</span>
                  </button>

                  <select
                    value={amb.status}
                    disabled={statusUpdating === amb.id}
                    onChange={(e) => handleStatusChange(amb.id, e.target.value)}
                    className="amb-status-select"
                  >
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="BUSY">BUSY / IN-TRANSIT</option>
                    <option value="OFFLINE">OFFLINE</option>
                  </select>
                </div>
              </div>

              <div className="card-body-section">
                <div className="amb-info-row">
                  <Users size={14} />
                  <span>Crew: <strong>{amb.crew || "Paramedic Specialist Team"}</strong></span>
                </div>

                <div className="amb-info-row">
                  <ShieldCheck size={14} />
                  <span>Certification: <strong>{amb.crew_cert || "Advanced Paramedic"}</strong></span>
                </div>

                <div className="amb-info-row">
                  <Navigation size={14} />
                  <span>Sector GPS: <code>[{amb.coordinates[0]?.toFixed(4)}, {amb.coordinates[1]?.toFixed(4)}]</code></span>
                </div>

                {/* FUEL / READINESS */}
                <div className="amb-info-row">
                  <BatteryCharging size={14} />
                  <span>Readiness / Fuel: <strong>{amb.fuel_pct || 95}% Charged</strong></span>
                </div>

                {/* EQUIPMENT MATRIX */}
                {amb.equipment && amb.equipment.length > 0 && (
                  <div className="amb-equipment-tags">
                    {amb.equipment.slice(0, 4).map((eq, i) => (
                      <span key={i} className="eq-tag">✓ {eq}</span>
                    ))}
                    {amb.equipment.length > 4 && (
                      <span className="eq-tag-more">+{amb.equipment.length - 4} more</span>
                    )}
                  </div>
                )}
              </div>

              <div className="card-footer-action">
                <span className={`status-indicator-dot ${isAvail ? "dot-online" : isBusy ? "dot-busy" : "dot-offline"}`} />
                <span>{amb.status} (Simulated AVL Fleet Telemetry)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
