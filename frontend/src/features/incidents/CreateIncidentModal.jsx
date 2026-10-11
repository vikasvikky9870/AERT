/**
 * AERT 3.0 — Create Incident Modal
 * Operational Sector: Srikakulam District (AP-SKLM-EOC-01)
 * Glass-panel modal with validation, live severity indicator, and direct backend intake.
 */

import React, { useState } from 'react';
import {
  AlertTriangle,
  MapPin,
  Users,
  Activity,
  CheckCircle2,
  X,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import { createIncident } from '../../api';
import { soundManager } from '../../services/soundManager';
import { OPERATIONAL_BOUNDS } from '../../config/geography';

export function CreateIncidentModal({
  isOpen = false,
  onClose = () => {},
  onCreated = () => {}
}) {
  const [form, setForm] = useState({
    type: 'Medical Emergency / Cardiac',
    location: '',
    severity: 'MEDIUM',
    victims: 1,
    critical_victims: 0,
    longitude: '',
    latitude: '',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.location.trim()) {
      setError('Please specify a corridor or landmark location in Srikakulam.');
      return;
    }

    const lon = Number(form.longitude);
    const lat = Number(form.latitude);

    const [[minLon, minLat], [maxLon, maxLat]] = OPERATIONAL_BOUNDS;
    if (!Number.isFinite(lon) || !Number.isFinite(lat) || lon < minLon || lon > maxLon || lat < minLat || lat > maxLat) {
      setError(`Enter coordinates within the configured map window ([${minLon}, ${minLat}] to [${maxLon}, ${maxLat}]). This is a rectangular window, not a verified district boundary.`);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await createIncident({
        type: form.type,
        location: form.location,
        severity: form.severity,
        victims: Number(form.victims),
        critical_victims: Number(form.critical_victims || 0),
        coordinates: [lon, lat],
        location_source: 'Operator-entered coordinates; source not independently verified',
        notes: form.notes || 'Field report intake via Command Center'
      });

      soundManager.playCriticalAlert();
      setSuccess(`Incident ${res.incident?.id || 'registered'} created successfully.`);
      setTimeout(() => {
        onCreated(res.incident);
        onClose();
      }, 700);
    } catch (err) {
      setError(err.message || 'Failed to register incident with backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(6, 9, 14, 0.75)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 90,
        padding: '20px'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '560px',
          maxWidth: '100%',
          backgroundColor: 'rgba(15, 20, 32, 0.95)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '14px',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.75)',
          padding: '20px 24px',
          color: '#f2f5f8',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff3b30', boxShadow: '0 0 8px #ff3b30' }} />
            <span style={{ fontSize: '13px', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, letterSpacing: '0.04em' }}>
              CREATE INCIDENT RECORD // OPERATOR REVIEW REQUIRED
            </span>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#9aa8b8', cursor: 'pointer', padding: '4px' }}
          >
            <X size={16} />
          </button>
        </div>

        {error && (
          <div style={{ background: 'rgba(255, 59, 48, 0.15)', border: '1px solid #ff3b30', borderRadius: '8px', padding: '8px 12px', fontSize: '11px', color: '#ff3b30' }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ background: 'rgba(48, 209, 88, 0.15)', border: '1px solid #30d158', borderRadius: '8px', padding: '8px 12px', fontSize: '11px', color: '#30d158', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={14} /> {success}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Emergency Type & Severity */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '10px', fontFamily: 'JetBrains Mono, monospace', color: '#9aa8b8', marginBottom: '4px' }}>
                EMERGENCY TYPE
              </label>
              <select
                value={form.type}
                onChange={(e) => updateField('type', e.target.value)}
                style={{ width: '100%', padding: '8px 10px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#f2f5f8', fontSize: '12px' }}
              >
                <option value="Major Highway Collision">Major Highway Collision</option>
                <option value="Road Accident">Road Accident</option>
                <option value="Vehicle Collision">Vehicle Collision</option>
                <option value="Building Fire">Building Fire</option>
                <option value="Medical Emergency / Cardiac">Medical Emergency / Cardiac</option>
                <option value="Industrial Chemical Release">Industrial Chemical Release</option>
                <option value="Natural Disaster / Flood">Natural Disaster / Flood</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '10px', fontFamily: 'JetBrains Mono, monospace', color: '#9aa8b8', marginBottom: '4px' }}>
                SEVERITY TIER
              </label>
              <select
                value={form.severity}
                onChange={(e) => updateField('severity', e.target.value)}
                style={{ width: '100%', padding: '8px 10px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#f2f5f8', fontSize: '12px' }}
              >
                <option value="CRITICAL">CRITICAL — Operator assessed</option>
                <option value="HIGH">HIGH — Operator assessed</option>
                <option value="MEDIUM">MEDIUM — Operator assessed</option>
                <option value="LOW">LOW — Operator assessed</option>
              </select>
            </div>
          </div>

          {/* Casualties count */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '10px', fontFamily: 'JetBrains Mono, monospace', color: '#9aa8b8', marginBottom: '4px' }}>
                TOTAL PATIENTS / CASUALTIES
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={form.victims}
                onChange={(e) => updateField('victims', e.target.value)}
                style={{ width: '100%', padding: '8px 10px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#f2f5f8', fontSize: '12px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '10px', fontFamily: 'JetBrains Mono, monospace', color: '#9aa8b8', marginBottom: '4px' }}>
                CRITICAL / RED PATIENTS
              </label>
              <input
                type="number"
                min="0"
                max={form.victims}
                value={form.critical_victims}
                onChange={(e) => updateField('critical_victims', e.target.value)}
                style={{ width: '100%', padding: '8px 10px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#f2f5f8', fontSize: '12px' }}
              />
            </div>
          </div>

          {/* Location & GPS */}
          <div>
            <label style={{ display: 'block', fontSize: '10px', fontFamily: 'JetBrains Mono, monospace', color: '#9aa8b8', marginBottom: '4px' }}>
              CORRIDOR / LANDMARK IN SRIKAKULAM
            </label>
            <input
              type="text"
              required
              value={form.location}
              onChange={(e) => updateField('location', e.target.value)}
                placeholder="Caller-confirmed landmark, road, village or entrance"
              style={{ width: '100%', padding: '8px 10px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#f2f5f8', fontSize: '12px' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '10px', fontFamily: 'JetBrains Mono, monospace', color: '#9aa8b8', marginBottom: '4px' }}>
                OPERATOR-ENTERED LONGITUDE
              </label>
              <input
                type="number"
                step="any"
                required
                value={form.longitude}
                onChange={(e) => updateField('longitude', e.target.value)}
                style={{ width: '100%', padding: '8px 10px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#f2f5f8', fontSize: '12px', fontFamily: 'JetBrains Mono, monospace' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '10px', fontFamily: 'JetBrains Mono, monospace', color: '#9aa8b8', marginBottom: '4px' }}>
                OPERATOR-ENTERED LATITUDE
              </label>
              <input
                type="number"
                step="any"
                required
                value={form.latitude}
                onChange={(e) => updateField('latitude', e.target.value)}
                style={{ width: '100%', padding: '8px 10px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#f2f5f8', fontSize: '12px', fontFamily: 'JetBrains Mono, monospace' }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ background: 'transparent', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', padding: '8px 16px', color: '#9aa8b8', fontSize: '12px', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                background: 'linear-gradient(135deg, #ff3b30, #ff9500)',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 20px',
                color: '#ffffff',
                fontSize: '12px',
                fontFamily: 'Space Grotesk, sans-serif',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {loading ? <Loader2 size={14} className="spin" /> : <AlertTriangle size={14} />}
              <span>{loading ? 'Saving record…' : 'Save for dispatch review'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
