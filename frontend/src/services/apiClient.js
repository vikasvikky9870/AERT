/**
 * AERT 3.0 Real-time Backend & REST API Service Client
 * Connects Frontend directly to FastAPI endpoints with graceful offline fallback.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export async function fetchIncidents() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/incidents`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[AERT API] Using local incidents fallback:', err.message);
    return null;
  }
}

export async function fetchAmbulances() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/ambulances`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[AERT API] Using local ambulance fleet fallback:', err.message);
    return null;
  }
}

export async function fetchHospitals() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/hospitals`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[AERT API] Using local hospital matrix fallback:', err.message);
    return null;
  }
}

export async function createBackendIncident(incidentData) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/incidents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(incidentData),
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[AERT API] Created incident locally (Offline mode):', err.message);
    return incidentData;
  }
}

export async function sendHospitalPreAlert(alertData) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/hospital-pre-alerts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(alertData),
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[AERT API] Pre-alert processed locally:', err.message);
    return alertData;
  }
}

export async function queryAiCopilot(queryText, incidentId = null) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/copilot/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: queryText, incident_id: incidentId }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[AERT API] Copilot handled by client agent:', err.message);
    return null;
  }
}
