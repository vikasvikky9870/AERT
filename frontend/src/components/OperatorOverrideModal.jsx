import { useState } from "react";
import { ShieldAlert, CheckCircle2, AlertTriangle, X, Send, Ambulance, Building2 } from "lucide-react";
import { recordOperatorOverride } from "../api";

export function OperatorOverrideModal({
  incident,
  recommendation,
  ambulances = [],
  hospitals = [],
  onClose,
  onSuccess = null,
  onConfirmOverride = null
}) {
  const [selectedAmbulance, setSelectedAmbulance] = useState(
    recommendation?.recommended_ambulance?.id || (ambulances[0]?.id || "AMB-001")
  );
  const [selectedHospital, setSelectedHospital] = useState(
    recommendation?.recommended_hospital?.id || (hospitals[0]?.id || "HOS-001")
  );
  const [reason, setReason] = useState("Paramedic crew has specialized localized highway corridor knowledge.");
  const [customReason, setCustomReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const presetReasons = [
    "Paramedic crew has specialized localized highway corridor knowledge.",
    "Direct clinical reroute request from District Medical Director.",
    "Adverse localized weather / waterlogging along secondary vector.",
    "Patient request for specific specialized facility.",
    "Resource conservation for higher-priority active trauma call.",
    "Other operational rationale (specified below)",
  ];

  const handleConfirmOverride = async () => {
    const finalReason = reason === "Other operational rationale (specified below)" ? customReason : reason;
    if (!finalReason.trim()) {
      setError("Please provide a valid operational rationale for the override.");
      return;
    }

    setSubmitting(true);
    setError(null);

    if (onConfirmOverride) {
      onConfirmOverride(selectedAmbulance, selectedHospital, finalReason);
      setSubmitting(false);
      return;
    }

    try {
      await recordOperatorOverride(incident.id, {
        selected_ambulance_id: selectedAmbulance,
        selected_hospital_id: selectedHospital,
        ai_recommended_ambulance_id: recommendation?.recommended_ambulance?.id,
        ai_recommended_hospital_id: recommendation?.recommended_hospital?.id,
        override_reason: finalReason,
        actor: "OPERATOR_COMMANDER",
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error("Override submission error:", err);
      setError("Failed to record operator override.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card override-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-title-group">
            <ShieldAlert size={20} className="text-orange" />
            <div>
              <h3>Human-in-the-Loop Operator Override</h3>
              <span className="modal-sub">Audit-logged commander decision override for {incident?.id}</span>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        {error && <div className="modal-error-box"><AlertTriangle size={16} /> {error}</div>}

        <div className="modal-body-content">
          {/* COMPARISON STRIP: AI SUGGESTION VS OPERATOR SELECTION */}
          <div className="override-comparison-strip">
            <div className="comp-box ai-box">
              <span className="comp-tag">AI RECOMMENDATION</span>
              <strong>Ambulance: {recommendation?.recommended_ambulance?.id || "None"}</strong>
              <strong>Hospital: {recommendation?.recommended_hospital?.name || "None"}</strong>
              <small>Score: {recommendation?.priority_score || 50}/100</small>
            </div>

            <div className="comp-arrow">→</div>

            <div className="comp-box human-box">
              <span className="comp-tag">COMMANDER SELECTION</span>
              <strong>Ambulance: {selectedAmbulance}</strong>
              <strong>Hospital: {hospitals.find((h) => h.id === selectedHospital)?.name || selectedHospital}</strong>
              <small>Human Override</small>
            </div>
          </div>

          {/* SELECT AMBULANCE */}
          <div className="form-group">
            <label>Select Alternative Response Unit</label>
            <select
              value={selectedAmbulance}
              onChange={(e) => setSelectedAmbulance(e.target.value)}
              className="modal-select"
            >
              {ambulances.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.id} ({a.type}) — {a.status} [{a.crew}]
                </option>
              ))}
            </select>
          </div>

          {/* SELECT HOSPITAL */}
          <div className="form-group">
            <label>Select Alternative Receiving Facility</label>
            <select
              value={selectedHospital}
              onChange={(e) => setSelectedHospital(e.target.value)}
              className="modal-select"
            >
              {hospitals.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} — {h.beds_available} beds free ({h.capacity}% load)
                </option>
              ))}
            </select>
          </div>

          {/* OVERRIDE RATIONALE SELECTOR */}
          <div className="form-group">
            <label>Mandatory Operational Override Rationale</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="modal-select"
            >
              {presetReasons.map((r, i) => (
                <option key={i} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {reason === "Other operational rationale (specified below)" && (
            <div className="form-group">
              <label>Specify Custom Reason</label>
              <textarea
                rows={2}
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Enter detailed reason for dispatch audit compliance..."
                className="modal-textarea"
              />
            </div>
          )}

          <div className="override-audit-note">
            <span>🛡️ All overrides are recorded in the central compliance audit trail with timestamps, operator ID, and rationale.</span>
          </div>

          <div className="modal-footer-actions">
            <button className="btn-cancel" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button
              className="btn-confirm-override"
              onClick={handleConfirmOverride}
              disabled={submitting}
            >
              <Send size={15} />
              <span>{submitting ? "RECORDING..." : "CONFIRM & DISPATCH OVERRIDE"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OperatorOverrideModal;
