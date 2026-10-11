import { useState } from "react";
import { Building2, Send, CheckCircle2, AlertTriangle, X, Activity, Clock, ShieldCheck } from "lucide-react";
import { sendHospitalPreAlert } from "../api";

export default function HospitalPreAlertModal({
  incident,
  recommendation,
  onClose,
  onSuccess = null,
}) {
  const [transmitting, setTransmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const targetHospital = recommendation?.recommended_hospital;
  const targetAmbulance = recommendation?.recommended_ambulance;

  const [summary, setSummary] = useState(
    `${incident?.victims || 1} casualty(ies) inbound from ${incident?.location || "Srikakulam"}. Severity: ${incident?.severity || "CRITICAL"}. Type: ${incident?.type || "Emergency"}.`
  );
  const [requirements, setRequirements] = useState(
    incident?.severity === "CRITICAL"
      ? "Level 1 Trauma Bay + ICU Resuscitation Ready"
      : "Emergency Department Intake Ready"
  );

  const handleTransmit = async () => {
    if (!incident || !targetHospital || !targetAmbulance) {
      setError("Missing hospital or incident reference for transmission.");
      return;
    }

    setTransmitting(true);
    setError(null);

    try {
      await sendHospitalPreAlert({
        incident_id: incident.id,
        hospital_id: targetHospital.id,
        ambulance_id: targetAmbulance.id,
        severity: incident.severity || "CRITICAL",
        patient_summary: summary,
        estimated_eta_mins: targetAmbulance.eta_minutes || 10,
        trauma_requirements: requirements,
      });

      setSuccess(true);
      if (onSuccess) onSuccess();
      setTimeout(() => {
        onClose();
      }, 1600);
    } catch (err) {
      console.error("Pre-alert error:", err);
      setError("Failed to transmit pre-alert packet.");
    } finally {
      setTransmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card prealert-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-title-group">
            <Building2 size={20} className="text-purple" />
            <div>
              <h3>Transmit Hospital Pre-Alert (Srikakulam Network)</h3>
              <span className="modal-sub">Direct Clinical Notification to Receiving Trauma Center</span>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        {error && <div className="modal-error-box"><AlertTriangle size={16} /> {error}</div>}

        {success ? (
          <div className="modal-success-box">
            <CheckCircle2 size={32} className="text-green" />
            <h4>Pre-Alert Transmitted!</h4>
            <p>Receiving facility <strong>{targetHospital?.name}</strong> has acknowledged simulated intake.</p>
          </div>
        ) : (
          <div className="modal-body-content">
            {/* DESTINATION PREVIEW */}
            <div className="prealert-destination-strip">
              <div className="dest-block">
                <span className="dest-label">RECEIVING FACILITY</span>
                <strong>{targetHospital?.name || "GGH Srikakulam"}</strong>
                <small>{targetHospital?.beds_available || 0} Available Beds ({targetHospital?.capacity || 0}% Load)</small>
              </div>

              <div className="dest-block">
                <span className="dest-label">TRANSPORTING EMS</span>
                <strong>{targetAmbulance?.id || "AMB-001"} ({targetAmbulance?.type || "ALS"})</strong>
                <small>Estimated Arrival: <strong>~{targetAmbulance?.eta_minutes || 10} Mins</strong></small>
              </div>
            </div>

            {/* PATIENT SUMMARY */}
            <div className="form-group">
              <label>Clinical Inbound Summary</label>
              <textarea
                rows={3}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="modal-textarea"
              />
            </div>

            {/* TRAUMA REQUIREMENTS */}
            <div className="form-group">
              <label>Specialized Trauma Readiness Requirements</label>
              <input
                type="text"
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                className="modal-input"
              />
            </div>

            <div className="prealert-notice">
              <ShieldCheck size={15} />
              <span>Simulated Prototype Pre-Alert — Ready for production HL7/FHIR emergency protocol integration.</span>
            </div>

            <div className="modal-footer-actions">
              <button className="btn-cancel" onClick={onClose} disabled={transmitting}>
                Cancel
              </button>
              <button
                className="btn-confirm-prealert"
                onClick={handleTransmit}
                disabled={transmitting}
              >
                <Send size={15} />
                <span>{transmitting ? "TRANSMITTING..." : "TRANSMIT PRE-ALERT NOW"}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
