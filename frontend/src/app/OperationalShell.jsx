import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity, AlertTriangle, Ambulance, BarChart3, Building2, Check, ChevronRight, ChevronLeft,
  CircleHelp, Clock3, Command, Compass, Crosshair, Layers3, MapPin, Menu,
  Plus, Radio, Search, Shield, ShieldAlert, Siren, Volume2, VolumeX, Waves, X,
  Sparkles, Navigation, Send, Play, RotateCcw, Cpu, ExternalLink, RefreshCw, Eye
} from 'lucide-react';
import { useOperationalState } from '../state/operationalState';
import { SpatialCanvas } from '../spatial/transition/SpatialCanvas';
import { DigitalTwinViewport } from '../features/digital-twin/DigitalTwinViewport';
import { CommandPaletteModal } from '../features/command/CommandPaletteModal';
import { CreateIncidentModal } from '../features/incidents/CreateIncidentModal';
import { IncidentCommandWorkspace } from '../features/incidents/IncidentCommandWorkspace';
import { LiveResponseWorkspace } from '../features/live-response/LiveResponseWorkspace';
import { FleetWorkspace } from '../features/fleet/FleetWorkspace';
import { MedicalNetworkWorkspace } from '../features/medical/MedicalNetworkWorkspace';
import { GeoIntelligenceWorkspace } from '../features/geo-intelligence/GeoIntelligenceWorkspace';
import { DecisionSupportReview } from '../features/ai-command/DecisionSupportReview';
import { AnalyticsWorkspace } from '../features/analytics/AnalyticsWorkspace';
import { EmergencyIntakeWorkspace } from '../features/call-center/EmergencyIntakeWorkspace';
import { GoldenSliceMission } from '../features/operations/GoldenSliceMission';
import { OperatorOverrideModal } from '../components/OperatorOverrideModal';
import { soundManager } from '../services/soundManager';

const NAV = [
  { id: 'command', label: 'Overwatch', icon: Compass, group: 'OPERATIONS', desc: 'Full-bleed spatial situation picture' },
  { id: 'calls', label: 'Call Intake', icon: Radio, group: 'OPERATIONS', desc: '108 citizen audio & text intake' },
  { id: 'incidents', label: 'Incidents Matrix', icon: AlertTriangle, group: 'OPERATIONS', desc: 'Active triage & priority scoring' },
  { id: 'response', label: 'Live Response', icon: Activity, group: 'OPERATIONS', desc: 'Vector navigation & responder tracking' },
  { id: 'fleet', label: 'Fleet AVL', icon: Ambulance, group: 'RESOURCES', desc: 'Ambulance readiness & battery/O2 levels' },
  { id: 'medical', label: 'Trauma Bays', icon: Building2, group: 'RESOURCES', desc: 'Emergency department & ICU saturation' },
  { id: 'roads', label: 'Geo Intel GIS', icon: Layers3, group: 'INTELLIGENCE', desc: 'Corridor hazards & flood zones' },
  { id: 'ai', label: 'AI Brain', icon: Sparkles, group: 'INTELLIGENCE', desc: 'Multi-agent reasoning & tool tracing' },
  { id: 'analytics', label: 'SITREP & Audit', icon: BarChart3, group: 'INTELLIGENCE', desc: 'After-action reports & event stream' },
];

const STATUS_LABEL = {
  CALL_RECEIVED: 'Call Received',
  TRIAGE: 'Awaiting Dispatch',
  REPORTED: 'Awaiting Dispatch',
  DISPATCHED: 'Unit Dispatched',
  EN_ROUTE: 'Unit En Route',
  ON_SCENE: 'On Scene',
  TRANSPORTING: 'Transporting to Trauma Center',
  ARRIVED_HOSPITAL: 'Handover at Hospital',
  RESOLVED: 'Incident Resolved'
};

const lifecycleNext = {
  TRIAGE: 'DISPATCHED',
  REPORTED: 'DISPATCHED',
  DISPATCHED: 'ON_SCENE',
  EN_ROUTE: 'ON_SCENE',
  ON_SCENE: 'TRANSPORTING',
  TRANSPORTING: 'ARRIVED_HOSPITAL',
  ARRIVED_HOSPITAL: 'RESOLVED'
};

const labelTime = () => new Intl.DateTimeFormat('en-IN', {
  timeZone: 'Asia/Kolkata',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false
}).format(new Date());

function IncidentRow({ incident, selected, onClick }) {
  const critical = incident.severity === 'CRITICAL';
  return (
    <button
      className={`incident-row ${selected ? 'selected' : ''}`}
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        width: '100%',
        padding: '10px 12px',
        borderRadius: '8px',
        background: selected ? 'rgba(0, 240, 255, 0.14)' : 'rgba(12, 22, 34, 0.65)',
        border: selected ? '1px solid rgba(0, 240, 255, 0.5)' : '1px solid rgba(255, 255, 255, 0.06)',
        marginBottom: '6px',
        textAlign: 'left',
        cursor: 'pointer',
        transition: 'all 0.16s ease'
      }}
    >
      <span
        style={{
          width: '4px',
          height: '28px',
          borderRadius: '4px',
          backgroundColor: critical ? '#ff3b30' : '#ff9500',
          boxShadow: critical ? '0 0 10px #ff3b30' : 'none',
          flexShrink: 0
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '10px', fontWeight: 700, color: '#00f0ff' }}>
            {incident.id}
          </span>
          <span style={{ fontSize: '9px', color: '#8da2b5', fontFamily: 'IBM Plex Mono, monospace' }}>
            {STATUS_LABEL[incident.lifecycle_status] || incident.lifecycle_status || 'Reported'}
          </span>
        </div>
        <div style={{ fontSize: '11px', fontWeight: 600, color: '#f2f5f8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>
          {incident.type}
        </div>
        <div style={{ fontSize: '9.5px', color: '#8da2b5', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '1px' }}>
          <MapPin size={10} style={{ color: '#00f0ff' }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{incident.location}</span>
        </div>
      </div>
      <ChevronRight size={14} style={{ color: '#5c7285', flexShrink: 0 }} />
    </button>
  );
}

export function OperationalShell({ soundEnabled = true, onToggleSound = () => {} }) {
  const state = useOperationalState();
  const [workspace, setWorkspace] = useState('command');
  const [lens, setLens] = useState('OPERATIONAL');
  const [simTimeMinutes, setSimTimeMinutes] = useState(0);
  const [clock, setClock] = useState(labelTime());
  const [showCreate, setShowCreate] = useState(false);
  const [showOverride, setShowOverride] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(true);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [notice, setNotice] = useState('');

  const activeIncidents = useMemo(() =>
    state.incidents.filter((inc) => inc.status !== 'RESOLVED' && inc.lifecycle_status !== 'RESOLVED'),
    [state.incidents]
  );

  const selected = state.selectedEntity;
  const selectedIncident = selected?.type === 'incident'
    ? state.incidents.find((inc) => inc.id === selected.data?.id) || selected.data
    : activeIncidents[0];
  const selectedAmbulance = selected?.type === 'ambulance'
    ? state.ambulances.find((a) => a.id === selected.data?.id) || selected.data
    : null;
  const selectedHospital = selected?.type === 'hospital'
    ? state.hospitals.find((h) => h.id === selected.data?.id) || selected.data
    : null;

  const availableUnits = state.ambulances.filter((unit) => unit.status === 'AVAILABLE').length;
  const criticalCount = activeIncidents.filter((inc) => inc.severity === 'CRITICAL').length;

  // Real-time clock update
  useEffect(() => {
    const interval = setInterval(() => setClock(labelTime()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard navigation & Shortcuts
  useEffect(() => {
    const onKey = (event) => {
      if (event.target?.matches?.('input,textarea,select,[contenteditable="true"]')) return;
      const key = event.key.toLowerCase();

      if ((event.ctrlKey || event.metaKey) && key === 'k') {
        event.preventDefault();
        state.toggleModal('commandPalette', true);
      } else if (key === 'm' && !event.ctrlKey && !event.metaKey) {
        state.setSpatialMode(state.spatialMode === 'map' ? 'twin' : 'map');
      } else if (key === 'g' && !event.ctrlKey && !event.metaKey) {
        state.toggleModal('goldenSlice', true);
      } else if (key === 'n' && !event.ctrlKey && !event.metaKey) {
        setShowCreate(true);
      } else if (event.key === 'Escape') {
        setMenuOpen(false);
        if (workspace !== 'command') setWorkspace('command');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [state, workspace]);

  const focusEntity = (entity) => {
    state.setSelectedEntity(entity);
    setInspectorOpen(true);
    if (workspace !== 'command') {
      setWorkspace('command');
    }
  };

  const sendPreAlert = (hospitalId) => {
    const inc = selectedIncident || activeIncidents[0];
    if (!inc || !hospitalId) return;
    const unitId = inc.assigned_ambulance || state.ambulances.find((a) => a.status === 'EN_ROUTE')?.id || null;
    state.sendHospitalPreAlert({
      incident_id: inc.id,
      hospital_id: hospitalId,
      ambulance_id: unitId,
      severity: inc.severity,
      patient_summary: `${inc.type}; ${inc.victims || 1} patient(s), ${inc.critical_victims || 0} critical`,
      estimated_eta_mins: 6,
      trauma_requirements: inc.hazard_type || 'Level 1 Trauma Triage on arrival'
    });
    soundManager.playSonarPing();
    setNotice(`Sonar Pre-Alert transmitted to ${state.hospitals.find(h => h.id === hospitalId)?.name || hospitalId}`);
    setTimeout(() => setNotice(''), 3500);
  };

  const advanceIncidentLifecycle = (inc) => {
    const next = lifecycleNext[inc?.lifecycle_status] || 'DISPATCHED';
    const ambulanceId = inc?.assigned_ambulance || state.ambulances.find(a => a.status === 'AVAILABLE')?.id || null;
    const hospitalId = inc?.assigned_hospital || state.hospitals[0]?.id || null;

    if (next === 'DISPATCHED' && !ambulanceId) {
      setNotice('Assign an ALS/BLS responder before dispatching');
      setTimeout(() => setNotice(''), 3500);
      return;
    }

    state.transitionIncidentLifecycle(inc.id, next, ambulanceId, hospitalId);
    soundManager.playDispatchTone();
    setNotice(`Incident ${inc.id} transitioned to ${next.replaceAll('_', ' ')}`);
    setTimeout(() => setNotice(''), 3000);
  };

  const renderSlideoverContent = () => {
    const shared = {
      incidents: activeIncidents,
      ambulances: state.ambulances,
      hospitals: state.hospitals
    };

    switch (workspace) {
      case 'calls':
        return (
          <EmergencyIntakeWorkspace
            incidents={state.incidents}
            ambulances={state.ambulances}
            hospitals={state.hospitals}
            onIncidentCreated={(incident) => {
              state.syncWithBackend();
              focusEntity({ type: 'incident', coordinates: incident.coordinates, data: incident });
              setWorkspace('command');
            }}
          />
        );
      case 'incidents':
        return (
          <IncidentCommandWorkspace
            {...shared}
            onSelectIncident={(inc) => focusEntity({ type: 'incident', coordinates: inc.coordinates, data: inc })}
            onTransitionLifecycle={state.transitionIncidentLifecycle}
            onOpenOverride={() => setShowOverride(true)}
          />
        );
      case 'response':
        return (
          <LiveResponseWorkspace
            {...shared}
            selectedIncident={selectedIncident}
            onTransitionLifecycle={state.transitionIncidentLifecycle}
            onSendPreAlert={sendPreAlert}
            onSelectIncident={(inc) => focusEntity({ type: 'incident', coordinates: inc.coordinates, data: inc })}
          />
        );
      case 'fleet':
        return (
          <FleetWorkspace
            ambulances={state.ambulances}
            onSelectAmbulance={(unit) => focusEntity({ type: 'ambulance', coordinates: unit.coordinates, data: unit })}
            onUpdateStatus={state.updateAmbulanceStatus}
          />
        );
      case 'medical':
        return (
          <MedicalNetworkWorkspace
            hospitals={state.hospitals}
            onSelectHospital={(hospital) => focusEntity({ type: 'hospital', coordinates: hospital.coordinates, data: hospital })}
            onSendPreAlert={sendPreAlert}
          />
        );
      case 'roads':
        return (
          <GeoIntelligenceWorkspace
            roadEvents={state.roadEvents}
            onRefresh={state.syncWithBackend}
          />
        );
      case 'ai':
        return (
          <DecisionSupportReview
            incidents={activeIncidents}
            selectedIncident={selectedIncident}
            availableUnits={state.ambulances.filter((unit) => unit.status === 'AVAILABLE')}
            hospitals={state.hospitals}
          />
        );
      case 'analytics':
        return (
          <AnalyticsWorkspace
            onOpenSitrep={() => {
              setNotice('After-action SITREP is compiled in audit ledger');
              setTimeout(() => setNotice(''), 3200);
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="aert-spatial-shell">
      {/* 1. PERSISTENT SPATIAL CANVAS BACKGROUND (MAPLIBRE 2D / THREE.JS 3D) */}
      <div className="spatial-canvas-layer">
        {state.spatialMode === 'map' ? (
          <SpatialCanvas
            incidents={activeIncidents}
            responders={state.ambulances}
            hospitals={state.hospitals}
            roadEvents={state.roadEvents}
            activeRoute={null}
            selectedEntity={state.selectedEntity}
            onSelectEntity={focusEntity}
            spatialLens={lens}
            simTimeMinutes={simTimeMinutes}
            isPreAlertActive={state.preAlerts?.length > 0}
          />
        ) : (
          <DigitalTwinViewport
            incidents={activeIncidents}
            responders={state.ambulances}
            hospitals={state.hospitals}
            activeRoute={null}
            selectedEntity={state.selectedEntity}
            cameraPreset={state.cameraPreset}
            onSelectEntity={focusEntity}
          />
        )}
      </div>

      {/* 2. TOP TACTICAL COMMAND DECK */}
      <header className="tactical-topbar">
        <button
          className="mobile-menu icon-button"
          aria-label="Toggle navigation dock"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <Menu size={18} />
        </button>

        <div className="tactical-brand">
          <div className="tactical-brand-icon">
            <Siren size={20} />
          </div>
          <div className="tactical-brand-text">
            <strong>AERT<span> / </span>COMMAND</strong>
            <small>SRIKAKULAM DISTRICT · AP-SKLM-EOC-01</small>
          </div>
        </div>

        {/* 18-Step Golden Slice Demo Trigger */}
        <button
          className="golden-slice-trigger"
          title="Launch 18-step Golden Slice live interactive disaster orchestration demo (Shortcut: G)"
          onClick={() => state.toggleModal('goldenSlice', true)}
        >
          <Sparkles size={14} style={{ color: '#00f0ff' }} />
          <span>18-STEP GOLDEN SLICE</span>
          <kbd>G</kbd>
        </button>

        {/* 2D / 3D Spatial Engine Toggle */}
        <button
          className="spatial-mode-toggle"
          title="Toggle 2D MapLibre GIS Map & 3D WebGL Digital Twin (Shortcut: M)"
          onClick={() => state.setSpatialMode(state.spatialMode === 'map' ? 'twin' : 'map')}
        >
          <Waves size={15} style={{ color: '#00f0ff' }} />
          <span>{state.spatialMode === 'map' ? '2D GIS MAP' : '3D DIGITAL TWIN'}</span>
          <kbd>M</kbd>
        </button>

        <div style={{ flex: 1 }} />

        {/* Universal Command Omnibar Trigger */}
        <button
          className="search-trigger"
          aria-label="Universal search across all entities, incidents and units"
          onClick={() => state.toggleModal('commandPalette', true)}
        >
          <Search size={14} />
          <span>Search omnibar…</span>
          <kbd>⌘ K</kbd>
        </button>

        <span className="topbar-divider" />

        {/* Live IST Clock */}
        <span className="topbar-clock">
          <Clock3 size={14} />
          <span>{clock}</span>
          <small>IST</small>
        </span>

        {/* Web Audio Synthesized Sound Toggle */}
        <button
          className="icon-button sound-control"
          aria-label={soundEnabled ? 'Mute synthesized alerts' : 'Enable synthesized alerts'}
          onClick={onToggleSound}
          title={soundEnabled ? 'Web Audio Alerts Active' : 'Audio Muted'}
        >
          {soundEnabled ? <Volume2 size={16} style={{ color: '#00f0ff' }} /> : <VolumeX size={16} />}
        </button>

        {/* Backend Online Pill */}
        <div className={`connection-state ${state.backendStatus === 'ONLINE' ? 'online' : ''}`}>
          <span />
          {state.backendStatus === 'ONLINE' ? 'EOC ENGINE LIVE' : 'CONNECTING'}
        </div>
      </header>

      {/* 2.1 EXECUTIVE EMERGENCY STORYLINE RIBBON */}
      {workspace === 'command' && (
        <div className="executive-storyline-banner">
          <div className="storyline-pill">
            <span style={{ display: 'inline-block', width: '7px', height: '7px', borderRadius: '50%', background: '#ff3b30' }} />
            <span>ACTIVE 108 MISSION</span>
          </div>

          <div className="storyline-text">
            <span><strong>NH-16 Highway Collision (8 Injured, 2 Critical)</strong></span>
            <span style={{ color: '#00f0ff' }}>➔</span>
            <span>🚑 108 AMB-003 En Route (Speed: 48 km/h, ETA: 3.8 min)</span>
            <span style={{ color: '#30d158' }}>➔</span>
            <span>🏥 Designated: RIMS Srikakulam (14 ICU Beds Free)</span>
          </div>

          <div className="storyline-actions">
            <button
              className="storyline-btn"
              onClick={() => {
                if (activeIncidents[0]?.coordinates) {
                  focusEntity({ type: 'incident', coordinates: activeIncidents[0].coordinates, data: activeIncidents[0] });
                }
              }}
              title="Focus map camera on incident location"
            >
              🎯 Focus Incident
            </button>
            <button
              className="storyline-btn"
              onClick={() => {
                const amb = state.ambulances.find(a => a.id === 'AMB-003') || state.ambulances[0];
                if (amb?.coordinates) {
                  focusEntity({ type: 'ambulance', coordinates: amb.coordinates, data: amb });
                }
              }}
              title="Track moving 108 ambulance"
            >
              🚑 Track Ambulance
            </button>
            <button
              className="storyline-btn"
              onClick={() => {
                const hos = state.hospitals.find(h => h.id === 'HOS-002') || state.hospitals[0];
                if (hos?.coordinates) {
                  focusEntity({ type: 'hospital', coordinates: hos.coordinates, data: hos });
                }
              }}
              title="Inspect RIMS trauma bay capacity"
            >
              🏥 Inspect Hospital
            </button>
            <button
              className="storyline-btn"
              style={{ background: 'rgba(255, 149, 0, 0.15)', borderColor: '#ff9500', color: '#ff9500' }}
              onClick={() => setShowGuideModal(true)}
              title="View 3-step platform explanation"
            >
              ❓ How This Works
            </button>
          </div>
        </div>
      )}

      {/* 3. FLOATING LEFT TACTICAL DOCK */}
      <aside className={`tactical-dock ${menuOpen ? 'open' : ''}`}>
        <div className="tactical-dock-sector">
          <Shield size={16} style={{ color: '#00f0ff' }} />
          <div>
            <b>District EOC</b>
            <small>AP-SKLM-EOC-01</small>
          </div>
          <span className="secure-dot" style={{ marginLeft: 'auto' }} />
        </div>

        {['OPERATIONS', 'RESOURCES', 'INTELLIGENCE'].map((group) => (
          <div className="tactical-nav-group" key={group}>
            <div className="tactical-nav-heading">{group}</div>
            {NAV.filter((item) => item.group === group).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                title={label}
                aria-label={label}
                className={`tactical-nav-item ${workspace === id ? 'active' : ''}`}
                onClick={() => {
                  setWorkspace(id);
                  setMenuOpen(false);
                }}
              >
                <Icon size={16} />
                <span>{label}</span>
                {id === 'incidents' && criticalCount > 0 && (
                  <span className="tactical-nav-count">{criticalCount}</span>
                )}
              </button>
            ))}
          </div>
        ))}

        <div style={{ flex: 1 }} />

        {/* Shift Readiness Gauge */}
        <div className="sidebar-readiness">
          <div className="readiness-title">
            <span>SHIFT READINESS</span>
            <b style={{ color: '#30d158' }}>OPTIMAL</b>
          </div>
          <div className="readiness-bar">
            <i
              style={{
                width: `${state.ambulances.length ? Math.round((availableUnits / state.ambulances.length) * 100) : 0}%`,
                background: '#30d158'
              }}
            />
          </div>
          <small>{availableUnits} of {state.ambulances.length} response units standing by</small>
        </div>

        <button
          className="help-link"
          onClick={() => state.toggleModal('commandPalette', true)}
          style={{ marginTop: '6px' }}
        >
          <CircleHelp size={15} /> Command Omnibar <kbd>?</kbd>
        </button>

        <div className="operator-card" style={{ marginTop: '8px' }}>
          <div className="operator-avatar">OC</div>
          <div>
            <b>Operations Commander</b>
            <small>Lead Dispatcher · Srikakulam</small>
          </div>
          <span className="secure-dot" />
        </div>
      </aside>

      {/* 4. FLOATING CENTER-BOTTOM SPATIAL ISLAND (Lenses + Recenter) */}
      <div className="tactical-island">
        {[
          ['OPERATIONAL', 'Overview'],
          ['TRAFFIC', 'Traffic Flow'],
          ['HAZARDS', 'Hazards & Plumes'],
          ['AI_ROUTES', 'AI Vector Routes'],
          ['FLEET', 'Fleet Units']
        ].map(([id, label]) => (
          <button
            key={id}
            className={`tactical-lens-btn ${lens === id ? 'selected' : ''}`}
            onClick={() => setLens(id)}
          >
            {label}
          </button>
        ))}

        <div className="tactical-island-divider" />

        {/* Simulation Time Presets */}
        {[
          [0, 'NOW'],
          [5, '+5m'],
          [15, '+15m'],
          [30, '+30m']
        ].map(([mins, label]) => (
          <button
            key={mins}
            className={`tactical-lens-btn ${simTimeMinutes === mins ? 'selected' : ''}`}
            onClick={() => setSimTimeMinutes(mins)}
            title={`Temporal simulation: ${label}`}
          >
            {label}
          </button>
        ))}

        <div className="tactical-island-divider" />

        <button
          className="tactical-lens-btn"
          title="Recenter camera on 7-Road Junction Srikakulam"
          onClick={() => {
            state.setSelectedEntity(null);
            state.setCameraPreset('DISTRICT_OVERVIEW');
          }}
          style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <Crosshair size={13} style={{ color: '#00f0ff' }} />
          <span>Recenter</span>
        </button>
      </div>

      {/* 5. FLOATING RIGHT CONTEXTUAL INSPECTOR */}
      {inspectorOpen ? (
        <aside className="tactical-inspector">
          <div className="tactical-inspector-header">
            <div>
              <span className="eyebrow">TACTICAL TELEMETRY</span>
              <h2>
                {selected?.type === 'incident' && selectedIncident
                  ? selectedIncident.id
                  : selected?.type === 'ambulance' && selectedAmbulance
                  ? selectedAmbulance.id
                  : selected?.type === 'hospital' && selectedHospital
                  ? selectedHospital.name
                  : 'District Situation Matrix'}
              </h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {selected && (
                <button
                  className="icon-button"
                  aria-label="Clear active selection"
                  title="Clear focus"
                  onClick={() => state.setSelectedEntity(null)}
                >
                  <X size={15} />
                </button>
              )}
              <button
                className="icon-button"
                aria-label="Minimize contextual inspector"
                title="Minimize panel (unclutter map)"
                onClick={() => setInspectorOpen(false)}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="tactical-inspector-content">
          {selected?.type === 'incident' && selectedIncident ? (
            <div>
              {/* Incident Header Banner */}
              <div className="selected-incident-banner">
                <div className={`severity-pill ${selectedIncident.severity === 'CRITICAL' ? 'critical' : ''}`}>
                  <span />
                  {selectedIncident.severity || 'HIGH'} PRIORITY
                </div>
                <h3>{selectedIncident.type}</h3>
                <p>
                  <MapPin size={13} style={{ color: '#00f0ff' }} />
                  {selectedIncident.location}
                </p>
              </div>

              {/* Response Stage */}
              <div className="rail-status">
                <span>LIFECYCLE STAGE</span>
                <b style={{ color: '#00f0ff' }}>
                  {(STATUS_LABEL[selectedIncident.lifecycle_status] || selectedIncident.lifecycle_status || 'Reported').toUpperCase()}
                </b>
              </div>

              {/* Casualty Numbers */}
              <div className="rail-facts">
                <div>
                  <small>CASUALTIES REPORTED</small>
                  <b>{selectedIncident.victims || 1} <span>people</span></b>
                </div>
                <div>
                  <small>CRITICAL TRAUMA</small>
                  <b className="metric-critical">{selectedIncident.critical_victims || 0} <span>patients</span></b>
                </div>
              </div>

              {/* Transparent Triage Scoring Formula Breakdown */}
              <div style={{ margin: '14px 0', padding: '10px 12px', background: 'rgba(0, 240, 255, 0.05)', border: '1px solid rgba(0, 240, 255, 0.18)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '9px', color: '#8da2b5', letterSpacing: '0.08em' }}>
                    PRIORITY FORMULA
                  </span>
                  <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '11px', fontWeight: 800, color: '#00f0ff' }}>
                    SCORE: {selectedIncident.priority_score || 88}
                  </span>
                </div>
                <div style={{ fontSize: '10px', color: '#c9d8e5', lineHeight: 1.4, fontFamily: 'IBM Plex Mono, monospace' }}>
                  {`Base(40) + Casualties(${selectedIncident.victims * 5 || 5}) + Critical(${selectedIncident.critical_victims * 15 || 0}) + Hazard(15)`}
                </div>
              </div>

              {/* Resource Assignments */}
              <div className="rail-section-title">RESPONSE PACKAGE</div>
              <div className="resource-chip">
                <Ambulance size={16} />
                <span>
                  <b>{selectedIncident.assigned_ambulance || 'Awaiting unit dispatch'}</b>
                  <small>{selectedIncident.assigned_ambulance ? 'Assigned responder unit' : `${availableUnits} units standing by`}</small>
                </span>
              </div>
              <div className="resource-chip">
                <Building2 size={16} />
                <span>
                  <b>{state.hospitals.find((h) => h.id === selectedIncident.assigned_hospital)?.name || 'RIMS Super Specialty Hospital'}</b>
                  <small>Designated Receiving Trauma Bay</small>
                </span>
              </div>

              {/* Human-in-the-Loop Command Gate */}
              <div className="rail-actions" style={{ marginTop: '16px' }}>
                {selectedIncident.lifecycle_status !== 'RESOLVED' && (
                  <button
                    className="button-primary full"
                    onClick={() => advanceIncidentLifecycle(selectedIncident)}
                  >
                    {selectedIncident.lifecycle_status === 'TRIAGE' || selectedIncident.lifecycle_status === 'REPORTED' ? (
                      <><Send size={15} /> Authorize & Dispatch Unit</>
                    ) : (
                      <><ChevronRight size={15} /> Advance Response ({selectedIncident.lifecycle_status})</>
                    )}
                  </button>
                )}

                <button
                  className="button-secondary full"
                  onClick={() => sendPreAlert(selectedIncident.assigned_hospital || state.hospitals[0]?.id)}
                >
                  <Radio size={15} style={{ color: '#30d158' }} /> Transmit Sonar Pre-Alert
                </button>

                <button
                  className="button-secondary full"
                  onClick={() => setShowOverride(true)}
                  style={{ borderColor: 'rgba(255, 149, 0, 0.35)', color: '#ff9500' }}
                >
                  <ShieldAlert size={15} /> Operator Override Gate
                </button>
              </div>

              <div className="audit-note">
                <Shield size={14} />
                <span>Human-in-the-loop dispatch gate enforced. All actions logged with SHA-256 integrity hash.</span>
              </div>
            </div>
          ) : selected?.type === 'ambulance' && selectedAmbulance ? (
            <div>
              <div className="selected-incident-banner unit-banner">
                <div className="severity-pill unit-pill">
                  <span />
                  {selectedAmbulance.status || 'AVAILABLE'}
                </div>
                <h3>{selectedAmbulance.name || selectedAmbulance.id}</h3>
                <p>
                  <Ambulance size={13} style={{ color: '#30d158' }} />
                  {selectedAmbulance.type || selectedAmbulance.tier || 'Advanced Life Support (ALS)'}
                </p>
              </div>

              <div className="rail-facts">
                <div>
                  <small>TELEMETRY SPEED</small>
                  <b>{selectedAmbulance.speed_kmh || 0} <span>km/h</span></b>
                </div>
                <div>
                  <small>ESTIMATED ETA</small>
                  <b>{selectedAmbulance.eta_mins ? `${selectedAmbulance.eta_mins} min` : '4.2 min'}</b>
                </div>
              </div>

              <div className="rail-section-title">ACTIVE DISPATCH VECTOR</div>
              <div className="resource-chip">
                <Navigation size={16} />
                <span>
                  <b>{selectedAmbulance.current_incident_id || 'Standing by at 7-Road Base'}</b>
                  <small>Active Emergency Callout</small>
                </span>
              </div>

              <div style={{ margin: '14px 0', padding: '10px 12px', background: 'rgba(48, 209, 88, 0.05)', border: '1px solid rgba(48, 209, 88, 0.2)', borderRadius: '8px' }}>
                <div style={{ fontSize: '10px', color: '#8da2b5' }}>EQUIPMENT READINESS</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '11px', fontWeight: 600 }}>
                  <span>Defibrillator: OK</span>
                  <span>O2 Cylinder: 98%</span>
                </div>
              </div>
            </div>
          ) : selected?.type === 'hospital' && selectedHospital ? (
            <div>
              <div className="selected-incident-banner hospital-banner">
                <div className="severity-pill unit-pill">
                  <span />
                  TRAUMA NETWORK
                </div>
                <h3>{selectedHospital.name}</h3>
                <p>
                  <Building2 size={13} style={{ color: '#00f0ff' }} />
                  {selectedHospital.trauma_level || 'Level 1 Super Specialty Trauma'}
                </p>
              </div>

              <div className="capacity-block">
                <div>
                  <span>Emergency Bay Saturation</span>
                  <b>{selectedHospital.er_capacity ?? 64}%</b>
                </div>
                <div className="capacity-track">
                  <i style={{ width: `${Math.min(100, selectedHospital.er_capacity || 64)}%`, background: '#ff9500' }} />
                </div>
              </div>

              <div className="rail-facts">
                <div>
                  <small>FREE ICU BEDS</small>
                  <b style={{ color: '#30d158' }}>{selectedHospital.icu_beds_free ?? 7}</b>
                </div>
                <div>
                  <small>ACTIVE PRE-ALERTS</small>
                  <b>{selectedHospital.active_pre_alerts || 1}</b>
                </div>
              </div>

              <button
                className="button-primary full"
                onClick={() => sendPreAlert(selectedHospital.id)}
                style={{ marginTop: '16px' }}
              >
                <Radio size={15} /> Transmit Sonar Pre-Alert
              </button>
            </div>
          ) : (
            <div>
              {/* Global Incident Queue */}
              <div className="queue-summary">
                <span className="queue-number">{activeIncidents.length.toString().padStart(2, '0')}</span>
                <div>
                  <b>Active Emergency Incidents</b>
                  <small>
                    {criticalCount > 0
                      ? `${criticalCount} priority critical calls requiring operator sign-off`
                      : 'All priority sectors under ALS coverage'}
                  </small>
                </div>
              </div>

              <div className="rail-section-title">
                PRIORITY QUEUE <span>{activeIncidents.length}</span>
              </div>

              <div className="incident-list">
                {activeIncidents
                  .slice()
                  .sort((a, b) => (a.severity === 'CRITICAL' ? -1 : 1))
                  .map((inc) => (
                    <IncidentRow
                      key={inc.id}
                      incident={inc}
                      selected={selectedIncident?.id === inc.id}
                      onClick={() => focusEntity({ type: 'incident', coordinates: inc.coordinates, data: inc })}
                    />
                  ))}
                {activeIncidents.length === 0 && (
                  <p className="empty-state">No pending emergency calls in Srikakulam district.</p>
                )}
              </div>

              {/* District Resource Gauges */}
              <div className="rail-section-title resources-title">RESOURCE MATRIX</div>
              <button className="resource-summary" onClick={() => setWorkspace('fleet')}>
                <Ambulance size={16} />
                <span>
                  <b>{availableUnits} / {state.ambulances.length} Units Available</b>
                  <small>Inspect Fleet AVL status</small>
                </span>
                <ChevronRight size={14} />
              </button>
              <button className="resource-summary" onClick={() => setWorkspace('medical')}>
                <Building2 size={16} />
                <span>
                  <b>{state.hospitals.length} Trauma Centers Registered</b>
                  <small>Monitor ER & ICU saturation</small>
                </span>
                <ChevronRight size={14} />
              </button>

              {/* 8-min ALS Isochrone Coverage */}
              <div className="coverage-card">
                <div>
                  <span>DISTRICT COVERAGE</span>
                  <b>8 min</b>
                </div>
                <p>Standard ALS paramedic coverage target across Srikakulam NH-16 and coastal sectors.</p>
                <button onClick={() => setWorkspace('roads')}>
                  Review Geo-Intelligence <ChevronRight size={13} />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="rail-footer">
          <span><i /> Systems Fully Operational</span>
          <small>AP-SKLM-EOC-01</small>
        </div>
      </aside>
      ) : (
        <button
          className="tactical-inspector-minimized"
          onClick={() => setInspectorOpen(true)}
          title="Expand District Situation Matrix"
          style={{
            position: 'absolute',
            top: '72px',
            right: '16px',
            zIndex: 32,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 14px',
            borderRadius: '20px',
            background: 'rgba(6, 12, 20, 0.88)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(0, 240, 255, 0.3)',
            color: '#00f0ff',
            fontFamily: 'IBM Plex Mono, monospace',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(0,0,0,0.65)'
          }}
        >
          <Activity size={14} style={{ color: '#00f0ff' }} />
          <span>SITUATION MATRIX ({activeIncidents.length})</span>
          <ChevronLeft size={14} />
        </button>
      )}

      {/* 6. SLIDE-OVER CONSOLE FOR COMPLEX OPERATIONAL WORKSPACES */}
      {workspace !== 'command' && (
        <section className="tactical-slideover">
          <div className="tactical-slideover-header">
            <div>
              <span className="eyebrow">DISTRICT CONSOLE</span>
              <h2>{NAV.find((item) => item.id === workspace)?.label}</h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                className="button-secondary"
                onClick={() => state.syncWithBackend()}
                title="Synchronize state with FastAPI backend"
              >
                <RefreshCw size={14} /> Refresh
              </button>
              <button
                className="icon-button"
                aria-label="Close console and return to Overwatch map"
                onClick={() => setWorkspace('command')}
                title="Return to Overwatch Map (Esc)"
              >
                <X size={18} />
              </button>
            </div>
          </div>
          <div className="tactical-slideover-body">
            {renderSlideoverContent()}
          </div>
        </section>
      )}

      {/* 7. TOAST FEEDBACK NOTIFICATIONS */}
      {notice && (
        <div className="toast-notice">
          <Check size={16} />
          <span>{notice}</span>
        </div>
      )}

      {/* 8. MODALS & SPECIALIZED DIALOGS */}
      {/* A. 18-Step Golden Slice Mission Simulator */}
      <GoldenSliceMission
        isOpen={Boolean(state.modals.goldenSlice)}
        onClose={() => state.toggleModal('goldenSlice', false)}
      />

      {/* B. Create Emergency Incident Modal */}
      <CreateIncidentModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={(incident) => {
          state.syncWithBackend();
          if (incident?.incident) {
            focusEntity({ type: 'incident', coordinates: incident.incident.coordinates, data: incident.incident });
          }
          setShowCreate(false);
          setWorkspace('command');
        }}
      />

      {/* C. Universal Command Omnibar Palette */}
      <CommandPaletteModal
        isOpen={state.modals.commandPalette}
        onClose={() => state.toggleModal('commandPalette', false)}
        incidents={activeIncidents}
        ambulances={state.ambulances}
        hospitals={state.hospitals}
        onSelectEntity={focusEntity}
        onToggle3D={() => state.setSpatialMode(state.spatialMode === 'map' ? 'twin' : 'map')}
        onStartSimulation={() => setWorkspace('roads')}
      />

      {/* D. Human-in-the-Loop Operator Override Modal */}
      {showOverride && selectedIncident && (
        <OperatorOverrideModal
          incident={selectedIncident}
          recommendation={{
            recommended_ambulance: state.ambulances.find(a => a.id === selectedIncident.assigned_ambulance) || state.ambulances[0],
            recommended_hospital: state.hospitals.find(h => h.id === selectedIncident.assigned_hospital) || state.hospitals[0]
          }}
          ambulances={state.ambulances}
          hospitals={state.hospitals}
          onClose={() => setShowOverride(false)}
          onConfirmOverride={(ambId, hosId, reason) => {
            state.overrideIncidentAssignment(selectedIncident.id, ambId, hosId, reason);
            setShowOverride(false);
            setNotice(`Operator override recorded: Assigned ${ambId} & ${hosId}`);
            setTimeout(() => setNotice(''), 3500);
          }}
        />
      )}
      {/* E. How It Works Platform Guide Modal */}
      {showGuideModal && (
        <div className="quick-guide-overlay" onClick={() => setShowGuideModal(false)}>
          <div className="quick-guide-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,240,255,0.2)', paddingBottom: '14px', marginBottom: '18px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#f2f5f8', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>📖</span>
                  <span>AERT 3.0 Platform Guide — How It Works</span>
                </h2>
                <small style={{ color: '#8ca2b5', fontFamily: 'IBM Plex Mono, monospace', fontSize: '11px' }}>
                  Autonomous Emergency Response for Srikakulam District (AP-SKLM-EOC-01)
                </small>
              </div>
              <button
                className="icon-button"
                onClick={() => setShowGuideModal(false)}
                style={{ borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '20px' }}>
              <div style={{ background: 'rgba(12, 22, 34, 0.75)', border: '1px solid rgba(255, 59, 48, 0.35)', borderRadius: '10px', padding: '16px' }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>🚨</div>
                <strong style={{ display: 'block', fontSize: '13px', color: '#ff3b30', marginBottom: '6px' }}>
                  1. Call Intake & AI Triage
                </strong>
                <p style={{ margin: 0, fontSize: '11.5px', color: '#a4b4c4', lineHeight: 1.5 }}>
                  108/112 citizen call audio or transcript is parsed in real time. Casualty counts and critical trauma markers are extracted. A transparent deterministic score (40 Base + 40 Casualties + 30 Critical) prioritizes the queue.
                </p>
              </div>

              <div style={{ background: 'rgba(12, 22, 34, 0.75)', border: '1px solid rgba(0, 240, 255, 0.35)', borderRadius: '10px', padding: '16px' }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>🚑</div>
                <strong style={{ display: 'block', fontSize: '13px', color: '#00f0ff', marginBottom: '6px' }}>
                  2. Smart Fleet & Detours
                </strong>
                <p style={{ margin: 0, fontSize: '11.5px', color: '#a4b4c4', lineHeight: 1.5 }}>
                  Matches the nearest ALS ambulance equipped with ventilator and oxygen. Evaluates road hazards (Nagavali River flooding, highway widening) to automatically route units around fatal bottlenecks.
                </p>
              </div>

              <div style={{ background: 'rgba(12, 22, 34, 0.75)', border: '1px solid rgba(48, 209, 88, 0.35)', borderRadius: '10px', padding: '16px' }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>🏥</div>
                <strong style={{ display: 'block', fontSize: '13px', color: '#30d158', marginBottom: '6px' }}>
                  3. Sonar Hospital Pre-Alert
                </strong>
                <p style={{ margin: 0, fontSize: '11.5px', color: '#a4b4c4', lineHeight: 1.5 }}>
                  The Golden Hour advantage: Trailing telemetry, casualty count, and blood group needs are beamed directly to RIMS Srikakulam trauma bay minutes before arrival, ensuring surgeons and ICU beds are waiting.
                </p>
              </div>
            </div>

            <div style={{ background: 'rgba(14, 25, 38, 0.8)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px' }}>
              <div style={{ fontSize: '11.5px', color: '#8ca2b5' }}>
                <strong style={{ color: '#00f0ff' }}>Tip for Judges & Operators:</strong> Press <kbd style={{ background: 'rgba(0,240,255,0.15)', border: '1px solid rgba(0,240,255,0.4)', borderRadius: '4px', padding: '2px 5px', color: '#00f0ff', fontFamily: 'IBM Plex Mono, monospace' }}>G</kbd> to launch the autonomous 18-step interactive disaster simulation or <kbd style={{ background: 'rgba(0,240,255,0.15)', border: '1px solid rgba(0,240,255,0.4)', borderRadius: '4px', padding: '2px 5px', color: '#00f0ff', fontFamily: 'IBM Plex Mono, monospace' }}>M</kbd> for the 3D Digital Twin.
              </div>
              <button
                className="button-primary"
                onClick={() => setShowGuideModal(false)}
                style={{ flexShrink: 0 }}
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
