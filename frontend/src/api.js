const API_BASE = "http://127.0.0.1:8000";

export async function analyzeCallNotes(transcript) {
  const response = await fetch(`${API_BASE}/api/intake/analyze-notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transcript }),
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Failed to analyze operator notes");
  }
  return response.json();
}

// ------------------------------------------------------------
// INCIDENTS & LIFECYCLE API
// ------------------------------------------------------------

export async function getIncidents() {
  const response = await fetch(`${API_BASE}/api/incidents`);
  if (!response.ok) {
    throw new Error("Failed to fetch incidents");
  }
  return response.json();
}

export async function getPriorityQueue() {
  const response = await fetch(`${API_BASE}/api/incidents/priority-queue`);
  if (!response.ok) {
    throw new Error("Failed to fetch incident priority queue");
  }
  return response.json();
}

export async function getIncident(id) {
  const response = await fetch(`${API_BASE}/api/incidents/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch incident ${id}`);
  }
  return response.json();
}

export async function createIncident(incident) {
  const response = await fetch(`${API_BASE}/api/incidents`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(incident),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Failed to create emergency incident");
  }

  return response.json();
}

export async function updateIncidentLifecycle(id, payload) {
  const response = await fetch(`${API_BASE}/api/incidents/${id}/lifecycle`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Failed to update incident lifecycle");
  }

  return response.json();
}

export async function setIncidentStatus(id, status) {
  const response = await fetch(`${API_BASE}/api/incidents/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error("Failed to update incident status");
  }

  return response.json();
}

export async function recordOperatorOverride(id, overrideData) {
  const response = await fetch(`${API_BASE}/api/incidents/${id}/override`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(overrideData),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Failed to record operator override");
  }

  return response.json();
}

// ------------------------------------------------------------
// AMBULANCE FLEET OPERATIONS
// ------------------------------------------------------------

export async function getAmbulances() {
  const response = await fetch(`${API_BASE}/api/ambulances`);
  if (!response.ok) {
    throw new Error("Failed to fetch ambulances");
  }
  return response.json();
}

export async function setAmbulanceStatus(id, status, currentAssignment = null) {
  const response = await fetch(`${API_BASE}/api/ambulances/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status, current_assignment: currentAssignment }),
  });

  if (!response.ok) {
    throw new Error("Failed to update ambulance status");
  }

  return response.json();
}

// ------------------------------------------------------------
// HOSPITAL NETWORK & PRE-ALERTS
// ------------------------------------------------------------

export async function getHospitals() {
  const response = await fetch(`${API_BASE}/api/hospitals`);
  if (!response.ok) {
    throw new Error("Failed to fetch hospitals");
  }
  return response.json();
}

export async function sendHospitalPreAlert(preAlertData) {
  const response = await fetch(`${API_BASE}/api/hospitals/pre-alert`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(preAlertData),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Failed to transmit hospital pre-alert");
  }

  return response.json();
}

export async function getHospitalPreAlerts() {
  const response = await fetch(`${API_BASE}/api/hospitals/pre-alerts`);
  if (!response.ok) {
    throw new Error("Failed to fetch hospital pre-alerts");
  }
  return response.json();
}

// ------------------------------------------------------------
// AI INTELLIGENCE & CONFLICT ENGINE
// ------------------------------------------------------------

export async function analyzeIncident(id) {
  const response = await fetch(`${API_BASE}/api/incidents/${id}/analyze`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(`Failed to compute decision support for incident ${id}`);
  }

  return response.json();
}

export async function getResourceConflicts() {
  const response = await fetch(`${API_BASE}/api/resource-conflicts`);
  if (!response.ok) {
    throw new Error("Failed to evaluate resource conflicts");
  }
  return response.json();
}

export async function getAllResponses() {
  const response = await fetch(`${API_BASE}/api/responses`);
  if (!response.ok) {
    throw new Error("Failed to fetch responses");
  }
  return response.json();
}

// ------------------------------------------------------------
// OPERATIONS COPILOT API
// ------------------------------------------------------------

export async function queryCopilot(prompt) {
  const response = await fetch(`${API_BASE}/api/copilot/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    throw new Error("Failed to query AERT Operations Copilot");
  }

  return response.json();
}

// ------------------------------------------------------------
// ROAD INTELLIGENCE
// ------------------------------------------------------------

export async function getRoadEvents() {
  const response = await fetch(`${API_BASE}/api/road-events`);
  if (!response.ok) {
    throw new Error("Failed to fetch road events");
  }
  return response.json();
}

export async function createRoadEvent(eventData) {
  const response = await fetch(`${API_BASE}/api/road-events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(eventData),
  });

  if (!response.ok) {
    throw new Error("Failed to register road condition");
  }

  return response.json();
}

export async function setRoadEventActive(id, isActive) {
  const response = await fetch(`${API_BASE}/api/road-events/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ is_active: isActive }),
  });

  if (!response.ok) {
    throw new Error("Failed to update road event status");
  }

  return response.json();
}

export async function deleteRoadEvent(id) {
  const response = await fetch(`${API_BASE}/api/road-events/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete road event");
  }

  return response.json();
}

// ------------------------------------------------------------
// SIMULATION & WHAT-IF ENGINE
// ------------------------------------------------------------

export async function simulateScenario(scenario) {
  const response = await fetch(`${API_BASE}/api/simulate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(scenario),
  });

  if (!response.ok) {
    throw new Error("Failed to run scenario simulation");
  }

  return response.json();
}

// ------------------------------------------------------------
// AUDIT LOGS & ANALYTICS
// ------------------------------------------------------------

export async function getAuditLogs(limit = 100, overrideOnly = false) {
  const response = await fetch(`${API_BASE}/api/audit-logs?limit=${limit}&override_only=${overrideOnly}`);
  if (!response.ok) {
    throw new Error("Failed to fetch operational audit trail");
  }
  return response.json();
}

export async function getAnalyticsSummary() {
  const response = await fetch(`${API_BASE}/api/analytics/summary`);
  if (!response.ok) {
    throw new Error("Failed to fetch analytics summary");
  }
  return response.json();
}

// ------------------------------------------------------------
// DEMO SCENARIOS LOADER
// ------------------------------------------------------------

export async function loadDemoScenario(scenarioId) {
  const response = await fetch(`${API_BASE}/api/demo/scenario/${scenarioId}`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(`Failed to activate demo scenario ${scenarioId}`);
  }

  return response.json();
}
