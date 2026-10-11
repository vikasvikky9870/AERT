import { useState } from "react";
import { AlertOctagon, MapPin, Users, Activity, PlusCircle, CheckCircle2, ShieldAlert } from "lucide-react";
import { createIncident } from "../api";

export default function CreateIncident({ onCreated, onCancel = null }) {
  const [form, setForm] = useState({
    type: "Road Accident",
    location: "NH-16 Srikakulam Bypass",
    severity: "HIGH",
    victims: 2,
    longitude: 83.8961,
    latitude: 18.2969,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.location.trim()) {
      setError("Please provide a specific landmark or corridor location in Srikakulam.");
      return;
    }

    const lon = Number(form.longitude);
    const lat = Number(form.latitude);

    if (isNaN(lon) || isNaN(lat) || lon < -180 || lon > 180 || lat < -90 || lat > 90) {
      setError("Invalid GPS coordinates. Longitude must be between -180 and +180, Latitude between -90 and +90.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await createIncident({
        type: form.type,
        location: form.location,
        severity: form.severity,
        victims: Number(form.victims),
        coordinates: [lon, lat],
      });

      setSuccess(`Emergency ${res.incident?.id || ""} registered successfully in Srikakulam sector.`);
      
      // Reset form with Srikakulam defaults
      setForm({
        type: "Road Accident",
        location: "",
        severity: "HIGH",
        victims: 1,
        longitude: 83.8961,
        latitude: 18.2969,
      });

      if (onCreated) {
        onCreated(res.incident);
      }
    } catch (err) {
      console.error("Create incident error:", err);
      setError("Failed to register emergency incident.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="create-incident-pro-form" onSubmit={handleSubmit}>
      <div className="pro-form-header">
        <div className="form-badge">
          <ShieldAlert size={16} />
          <span>SRIKAKULAM REGIONAL EMERGENCY INTAKE</span>
        </div>
        <p>Registering an emergency immediately updates the Srikakulam GIS map and triggers decision-support triage.</p>
      </div>

      {error && <div className="form-error-alert">{error}</div>}
      {success && <div className="form-success-alert"><CheckCircle2 size={16} /> {success}</div>}

      <div className="form-sections-grid">
        {/* SECTION 1: NATURE & SEVERITY */}
        <div className="form-sec">
          <div className="sec-label">
            <Activity size={14} />
            <span>INCIDENT CLASSIFICATION</span>
          </div>

          <label>
            Emergency Nature / Type
            <select
              value={form.type}
              onChange={(e) => updateField("type", e.target.value)}
              className="pro-select"
            >
              <option>Major Highway Collision</option>
              <option>Road Accident</option>
              <option>Vehicle Collision</option>
              <option>Building Fire</option>
              <option>Medical Emergency / Cardiac</option>
              <option>Industrial Chemical Release</option>
              <option>Natural Disaster / Flood</option>
            </select>
          </label>

          <label>
            Severity Priority Tier
            <select
              value={form.severity}
              onChange={(e) => updateField("severity", e.target.value)}
              className={`pro-select sev-select-${form.severity.toLowerCase()}`}
            >
              <option value="CRITICAL">CRITICAL (Mass Casualty / Highway Hazard)</option>
              <option value="HIGH">HIGH (Major Injury / Immediate ALS)</option>
              <option value="MEDIUM">MEDIUM (Standard BLS Transport)</option>
              <option value="LOW">LOW (Minor Assessment)</option>
            </select>
          </label>

          <label>
            Estimated Casualties / Patients
            <input
              type="number"
              min="0"
              max="500"
              value={form.victims}
              onChange={(e) => updateField("victims", e.target.value)}
              className="pro-input"
            />
          </label>
        </div>

        {/* SECTION 2: LOCATION & GPS */}
        <div className="form-sec">
          <div className="sec-label">
            <MapPin size={14} />
            <span>SRIKAKULAM SECTOR & GPS</span>
          </div>

          <label>
            Corridor / Landmark Location
            <input
              type="text"
              required
              placeholder="E.g., Day & Night Junction, Srikakulam"
              value={form.location}
              onChange={(e) => updateField("location", e.target.value)}
              className="pro-input"
            />
          </label>

          <div className="form-two-col">
            <label>
              Longitude
              <input
                type="number"
                step="any"
                required
                value={form.longitude}
                onChange={(e) => updateField("longitude", e.target.value)}
                className="pro-input"
              />
            </label>

            <label>
              Latitude
              <input
                type="number"
                step="any"
                required
                value={form.latitude}
                onChange={(e) => updateField("latitude", e.target.value)}
                className="pro-input"
              />
            </label>
          </div>

          <div className="preset-coords-hint">
            <span>Srikakulam Presets: </span>
            <button
              type="button"
              className="btn-coord-preset"
              onClick={() => {
                updateField("longitude", 83.8961);
                updateField("latitude", 18.2969);
                updateField("location", "Srikakulam City Center (7 Road Junction)");
              }}
            >
              City Center
            </button>
            <button
              type="button"
              className="btn-coord-preset"
              onClick={() => {
                updateField("longitude", 83.905);
                updateField("latitude", 18.305);
                updateField("location", "NH-16 Bypass Toll Plaza");
              }}
            >
              NH-16 Bypass
            </button>
            <button
              type="button"
              className="btn-coord-preset"
              onClick={() => {
                updateField("longitude", 83.892);
                updateField("latitude", 18.298);
                updateField("location", "Palakonda Road Near Collectorate");
              }}
            >
              Palakonda Rd
            </button>
            <button
              type="button"
              className="btn-coord-preset"
              onClick={() => {
                updateField("longitude", 83.925);
                updateField("latitude", 18.275);
                updateField("location", "Amudalavalasa Road Sector");
              }}
            >
              Amudalavalasa
            </button>
          </div>
        </div>
      </div>

      <div className="form-actions-row">
        {onCancel && (
          <button type="button" className="btn-cancel" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn-submit-emergency" disabled={loading}>
          <PlusCircle size={16} />
          <span>{loading ? "LOGGING EMERGENCY..." : "DISPATCH & LOG EMERGENCY"}</span>
        </button>
      </div>
    </form>
  );
}