import { useState, useEffect } from "react";
import { AlertTriangle, Plus, Trash2, ToggleLeft, ToggleRight, Info, Route } from "lucide-react";
import { getRoadEvents, createRoadEvent, setRoadEventActive, deleteRoadEvent } from "../api";

export default function RoadIntelligence({ onRefreshMap = null }) {
  const [roadEvents, setRoadEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    type: "Road Construction",
    description: "",
    longitude: 83.908,
    latitude: 18.308,
    radius_km: 2.0,
    delay_multiplier: 1.35,
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const loadEvents = async () => {
    setLoading(true);
    try {
      const res = await getRoadEvents();
      setRoadEvents(res.road_events || []);
    } catch (err) {
      console.error("Failed to load road events:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleToggle = async (eventId, currentActive) => {
    try {
      await setRoadEventActive(eventId, !currentActive);
      await loadEvents();
      if (onRefreshMap) onRefreshMap();
    } catch (err) {
      console.error("Toggle error:", err);
    }
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm(`Delete road event ${eventId}?`)) return;
    try {
      await deleteRoadEvent(eventId);
      await loadEvents();
      if (onRefreshMap) onRefreshMap();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      await createRoadEvent({
        type: form.type,
        description: form.description,
        longitude: Number(form.longitude),
        latitude: Number(form.latitude),
        radius_km: Number(form.radius_km),
        delay_multiplier: Number(form.delay_multiplier),
        is_active: true,
      });

      setMessage("Road condition registered in Srikakulam sector.");
      setForm({
        type: "Road Construction",
        description: "",
        longitude: 83.908,
        latitude: 18.308,
        radius_km: 2.0,
        delay_multiplier: 1.35,
      });
      await loadEvents();
      if (onRefreshMap) onRefreshMap();
    } catch (err) {
      console.error("Create road event error:", err);
      setMessage("Failed to log road event.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="roads-screen">
      {/* HEADER EXPLANATION */}
      <div className="roads-header-panel">
        <div>
          <h2>Srikakulam Road Conditions & Delay Intelligence</h2>
          <p className="subtitle">
            Active roadblocks, highway construction corridors, and congestion zones directly modulate ETA and ambulance routing recommendations in the AERT decision-support engine.
          </p>
        </div>
        <div className="road-factor-explainer">
          <Route size={20} className="text-orange" />
          <span>Multiplier: <strong>Route ETA = Base Travel Time × Delay Factor</strong></span>
        </div>
      </div>

      <div className="roads-split-layout">
        {/* LEFT: ROAD EVENTS LIST */}
        <div className="roads-list-pane">
          <div className="pane-header">
            <h3>Active Srikakulam Road Hazards ({roadEvents.filter((r) => r.is_active).length})</h3>
            <span className="prototype-tag">Prototype / Seeded Traffic Data</span>
          </div>

          <div className="road-event-cards">
            {roadEvents.length === 0 ? (
              <div className="empty-roads">No active road hazards registered in sector.</div>
            ) : (
              roadEvents.map((ev) => (
                <div key={ev.id} className={`road-item-card ${ev.is_active ? "active-road" : "inactive-road"}`}>
                  <div className="road-card-head">
                    <div className="road-badge">
                      <AlertTriangle size={15} />
                      <strong>{ev.id}: {ev.type}</strong>
                    </div>

                    <div className="road-actions">
                      <button
                        className="btn-toggle-active"
                        onClick={() => handleToggle(ev.id, ev.is_active)}
                        title="Toggle Active/Inactive"
                      >
                        {ev.is_active ? <ToggleRight size={22} className="text-green" /> : <ToggleLeft size={22} className="text-gray" />}
                      </button>

                      <button
                        className="btn-delete-road"
                        onClick={() => handleDelete(ev.id)}
                        title="Delete Condition"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <p className="road-desc">{ev.description || "Corridor slowdown reported."}</p>

                  <div className="road-specs-row">
                    <span>GPS: <code>[{ev.longitude.toFixed(4)}, {ev.latitude.toFixed(4)}]</code></span>
                    <span>Buffer Radius: <strong>{ev.radius_km} km</strong></span>
                    <span className="delay-highlight">Delay Impact: <strong>+{ev.delay_multiplier}x ETA</strong></span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT: CREATE ROAD EVENT FORM */}
        <div className="roads-form-pane">
          <div className="pane-header">
            <Plus size={16} />
            <h3>Log New Road Obstruction / Construction</h3>
          </div>

          <form className="road-create-form" onSubmit={handleCreate}>
            <label>
              Event Nature / Type
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option>Road Construction</option>
                <option>Heavy Congestion</option>
                <option>Waterlogging / Hazard</option>
                <option>Highway Accident Roadblock</option>
                <option>Bridge Maintenance Closure</option>
              </select>
            </label>

            <label>
              Description & Corridor Details
              <input
                required
                placeholder="E.g., Bridge repair near Nagavali river crossing"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
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
                  onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                />
              </label>

              <label>
                Latitude
                <input
                  type="number"
                  step="any"
                  required
                  value={form.latitude}
                  onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                />
              </label>
            </div>

            <div className="form-two-col">
              <label>
                Impact Radius (km)
                <input
                  type="number"
                  step="0.1"
                  min="0.5"
                  max="20"
                  required
                  value={form.radius_km}
                  onChange={(e) => setForm({ ...form, radius_km: e.target.value })}
                />
              </label>

              <label>
                Delay Multiplier (e.g. 1.45 = +45% ETA)
                <input
                  type="number"
                  step="0.05"
                  min="1.0"
                  max="4.0"
                  required
                  value={form.delay_multiplier}
                  onChange={(e) => setForm({ ...form, delay_multiplier: e.target.value })}
                />
              </label>
            </div>

            <button type="submit" className="btn-submit-road" disabled={submitting}>
              {submitting ? "REGISTERING..." : "REGISTER ROAD CONDITION"}
            </button>

            {message && <div className="form-msg">{message}</div>}
          </form>
        </div>
      </div>
    </div>
  );
}
