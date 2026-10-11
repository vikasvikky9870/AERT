import React from "react";
import { HelpCircle, AlertCircle, CheckCircle2, ShieldAlert } from "lucide-react";

export function UncertaintyIndicator({
  callerEstimate = 5,
  aiEstimateMin = 5,
  aiEstimateMax = 7,
  emsConfirmed = null,
  locationConfidence = 92,
  locationSource = "Caller Landmark Provided",
  gaps = [],
}) {
  return (
    <div className="uncertainty-indicator-box">
      <div className="unc-header">
        <div className="unc-title-wrap">
          <HelpCircle size={14} className="text-warning" />
          <span>PROVENANCE & UNCERTAINTY PROFILE</span>
        </div>
        <span className={`confidence-badge ${locationConfidence >= 90 ? "conf-high" : "conf-med"}`}>
          Location Confidence: <strong>{locationConfidence}%</strong>
        </span>
      </div>

      {/* CASUALTY SIZING COMPARISON */}
      <div className="casualty-provenance-grid">
        <div className="cas-col">
          <span className="cas-label">CALLER REPORTED</span>
          <strong className="cas-val">{callerEstimate} Casualties</strong>
          <small>Raw voice intake</small>
        </div>

        <div className="cas-arrow">→</div>

        <div className="cas-col">
          <span className="cas-label">AI TRIAGE RANGE</span>
          <strong className="cas-val text-warning">{aiEstimateMin}–{aiEstimateMax} Sized</strong>
          <small>Severity model bounds</small>
        </div>

        <div className="cas-arrow">→</div>

        <div className="cas-col">
          <span className="cas-label">EMS CONFIRMATION</span>
          <strong className="cas-val text-muted">
            {emsConfirmed !== null ? `${emsConfirmed} Confirmed` : "Pending On-Scene"}
          </strong>
          <small>Paramedic triage tag</small>
        </div>
      </div>

      {/* INFORMATION GAPS */}
      {gaps && gaps.length > 0 && (
        <div className="missing-gaps-section">
          <span className="gaps-label">WHAT DO WE STILL NEED TO VERIFY?</span>
          <div className="gaps-chips-list">
            {gaps.map((gap, i) => (
              <span key={i} className="gap-chip">
                ⚠ {gap}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
