import React, { useState, useEffect } from "react";
import {
  PhoneCall,
  Radio,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Edit3,
  ShieldAlert,
  MapPin,
  Activity,
  Clock,
  ArrowRight,
  UserCheck,
  Send,
  Building2,
  Ambulance,
  Route,
  Volume2,
  Play,
  Pause,
  Layers,
  Crosshair,
} from "lucide-react";
import { createIncident, analyzeIncident } from "../api";
import { KNOWN_LANDMARKS, SRIKAKULAM_CENTER } from "../config/geography";
import { UncertaintyIndicator } from "../design-system/ai/UncertaintyIndicator";
import { ConfidenceRing } from "../design-system/components/ConfidenceRing";
import { DataHonestyBadge } from "../design-system/components/Badge";

// Seeded Call Scenarios for Srikakulam District
const PROTOTYPE_CALL_SCENARIOS = [
  {
    callId: "CALL-00821",
    callerName: "Rajesh Kumar (Citizen)",
    phone: "+91 98480 XXXXX",
    timestamp: "10:31:04 AM",
    duration: "00:48",
    audioSimulated: true,
    transcript:
      "Emergency! There has been a major accident near NH-16 Srikakulam Bypass Junction. Two passenger cars and an auto collided. I can see around 5 or 6 people injured on the road, and one driver is trapped inside and appears unconscious. There is traffic piling up quickly!",
    extraction: {
      type: "Major Highway Collision",
      location: "NH-16 Srikakulam Bypass Junction",
      longitude: 83.905,
      latitude: 18.305,
      locationSource: "Caller Landmark Provided",
      locationConfidence: 94,
      victimEstimateMin: 5,
      victimEstimateMax: 7,
      criticalVictims: 2,
      severity: "CRITICAL",
      hazard: "Highway Entrapment & Fuel Spill",
      gaps: [
        "Is there active fuel leakage, smoke, or fire ignition risk?",
        "Is the unconscious driver breathing or responding?",
        "Is oncoming traffic completely stopped or moving slowly?",
      ],
    },
  },
  {
    callId: "CALL-00822",
    callerName: "Suresh V. (Local Shopkeeper)",
    phone: "+91 94401 XXXXX",
    timestamp: "10:35:12 AM",
    duration: "00:34",
    audioSimulated: true,
    transcript:
      "Hello, 108? Near Palakonda Road close to the Collectorate office, an auto rickshaw overturned. Two people have head injuries and need an ambulance immediately. The road is partly blocked.",
    extraction: {
      type: "Vehicle Collision",
      location: "Palakonda Road Near Collectorate",
      longitude: 83.892,
      latitude: 18.298,
      locationSource: "Caller Landmark Verified",
      locationConfidence: 96,
      victimEstimateMin: 2,
      victimEstimateMax: 3,
      criticalVictims: 1,
      severity: "HIGH",
      hazard: "Glass debris on roadway",
      gaps: [
        "Are the injured passengers conscious and responsive?",
        "Are any elderly patients or pediatric victims involved?",
      ],
    },
  },
  {
    callId: "CALL-00823",
    callerName: "Dr. Ananya Rao (Clinic Staff)",
    phone: "+91 89422 XXXXX",
    timestamp: "10:39:50 AM",
    duration: "00:28",
    audioSimulated: true,
    transcript:
      "This is City Clinic on 7 Road Junction. A 58-year-old male has collapsed with severe crushing chest pain and acute breathlessness. Suspected acute myocardial infarction. We need an Advanced Life Support unit right away!",
    extraction: {
      type: "Medical Emergency / Cardiac",
      location: "7 Road Junction, Srikakulam Central",
      longitude: 83.8961,
      latitude: 18.2969,
      locationSource: "Medical Staff Geocoded",
      locationConfidence: 99,
      victimEstimateMin: 1,
      victimEstimateMax: 1,
      criticalVictims: 1,
      severity: "HIGH",
      hazard: "Time-Critical Cardiac Event (ALS Prerequisite)",
      gaps: [
        "Is the clinic team administering oxygen or aspirin currently?",
        "Is the patient in cardiac arrest or breathing spontaneously?",
      ],
    },
  },
  {
    callId: "CALL-00824",
    callerName: "Security Officer Naidu (Factory Guard)",
    phone: "+91 94900 XXXXX",
    timestamp: "10:44:18 AM",
    duration: "00:52",
    audioSimulated: true,
    transcript:
      "Emergency Operations! Chemical storage fire at Singupuram Industrial Estate. Thick acrid black smoke is spreading toward the main gate. At least 10 workers have inhalation difficulties, and 3 have second-degree burns. Send multiple ALS units and notify trauma burn center!",
    extraction: {
      type: "Building Fire",
      location: "Singupuram Industrial Sector",
      longitude: 83.865,
      latitude: 18.32,
      locationSource: "Industrial Landmark Geocoded",
      locationConfidence: 95,
      victimEstimateMin: 10,
      victimEstimateMax: 14,
      criticalVictims: 4,
      severity: "CRITICAL",
      hazard: "Toxic Vapor Release & Secondary Blast Risk",
      gaps: [
        "What specific chemical compound is involved in the ignition?",
        "Are all factory personnel evacuated beyond the 200m perimeter?",
      ],
    },
  },
];

export default function CallIntake({
  onIncidentCreated = null,
  onSwitchToCommand = null,
}) {
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);

  const scenario = PROTOTYPE_CALL_SCENARIOS[selectedScenarioIndex];

  // Operator verification state (editable before transmission)
  const [formData, setFormData] = useState({
    type: scenario.extraction.type,
    location: scenario.extraction.location,
    longitude: scenario.extraction.longitude,
    latitude: scenario.extraction.latitude,
    severity: scenario.extraction.severity,
    victims: scenario.extraction.victimEstimateMax,
    criticalVictims: scenario.extraction.criticalVictims,
    hazard: scenario.extraction.hazard,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [transmittedIncident, setTransmittedIncident] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // Sync state on scenario switch
  useEffect(() => {
    setFormData({
      type: scenario.extraction.type,
      location: scenario.extraction.location,
      longitude: scenario.extraction.longitude,
      latitude: scenario.extraction.latitude,
      severity: scenario.extraction.severity,
      victims: scenario.extraction.victimEstimateMax,
      criticalVictims: scenario.extraction.criticalVictims,
      hazard: scenario.extraction.hazard,
    });
    setTransmittedIncident(null);
    setAnalysisResult(null);
    setFeedback(null);
    setIsEditing(false);
    setIsPlayingAudio(false);
    setAudioProgress(0);
  }, [selectedScenarioIndex]);

  // Audio Playback Simulator
  useEffect(() => {
    let interval;
    if (isPlayingAudio) {
      interval = setInterval(() => {
        setAudioProgress((prev) => {
          if (prev >= 100) {
            setIsPlayingAudio(false);
            return 0;
          }
          return prev + 4;
        });
      }, 200);
    }
    return () => clearInterval(interval);
  }, [isPlayingAudio]);

  const handleConfirmAndTransmit = async () => {
    setIsTransmitting(true);
    setFeedback(null);

    try {
      // 1. Create Incident
      const createRes = await createIncident({
        type: formData.type,
        location: formData.location,
        severity: formData.severity,
        victims: Number(formData.victims),
        critical_victims: Number(formData.criticalVictims),
        coordinates: [Number(formData.longitude), Number(formData.latitude)],
        source_call: scenario.callId,
        hazard_type: formData.hazard,
      });

      const inc = createRes.incident;
      setTransmittedIncident(inc);

      // 2. Automatically Run AI Decision Support Analysis
      const rec = await analyzeIncident(inc.id);
      setAnalysisResult(rec);

      if (onIncidentCreated) {
        onIncidentCreated(inc);
      }

      setFeedback({
        type: "success",
        message: `Emergency record ${inc.id} logged and analyzed. Ready for commander dispatch in Srikakulam sector.`,
      });
    } catch (err) {
      console.error("Intake transmission error:", err);
      setFeedback({
        type: "error",
        message: "Failed to transmit emergency intake to backend.",
      });
    } finally {
      setIsTransmitting(false);
    }
  };

  return (
    <div className="call-intake-console-screen">
      {/* TOP INTAKE CONSOLE BANNER */}
      <div className="intake-console-header">
        <div className="header-left">
          <div className="console-badge">
            <Radio size={14} className="text-nominal animate-pulse" />
            <span>AI-ASSISTED EMERGENCY CALL INTAKE // SRIKAKULAM 108 CONSOLE</span>
          </div>
          <h2>Emergency Call Speech-to-Intent Intake Console</h2>
          <p className="subtitle">
            Transcribes citizen 108 emergency audio, extracts structured incident metadata, analyzes information gaps, and validates Srikakulam corridor landmarks before one-click dispatch handoff.
          </p>
        </div>

        {/* SCENARIO SELECTOR */}
        <div className="console-scenario-pills">
          <span className="preset-label">INCOMING CALL SIMULATION:</span>
          <div className="pills-group">
            {PROTOTYPE_CALL_SCENARIOS.map((sc, idx) => (
              <button
                key={sc.callId}
                className={`scenario-pill ${selectedScenarioIndex === idx ? "pill-active" : ""}`}
                onClick={() => setSelectedScenarioIndex(idx)}
                disabled={isTransmitting}
              >
                <PhoneCall size={12} />
                <span>{sc.callId} ({sc.extraction.type.split(" ")[0]})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="intake-honesty-row">
        <DataHonestyBadge type="SIMULATED_TELEMETRY" />
        <span className="text-dim">Voice transcript simulation grounded in Srikakulam geographical presets.</span>
      </div>

      {feedback && (
        <div className={`manager-feedback feedback-${feedback.type}`}>
          {feedback.type === "success" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* 3-COLUMN MODERN CONSOLE LAYOUT */}
      <div className="intake-console-grid">
        {/* COLUMN 1: LIVE CALL TRANSCRIPT & AUDIO WAVEFORM */}
        <div className="console-card">
          <div className="card-head">
            <div className="head-title-row">
              <Volume2 size={16} className="text-tactical" />
              <h3>1. Citizen Call Stream</h3>
            </div>
            <span className="call-id-tag">{scenario.callId}</span>
          </div>

          {/* AUDIO SIMULATION CONTROLS */}
          <div className="audio-simulation-player">
            <button
              className="btn-play-audio"
              onClick={() => setIsPlayingAudio(!isPlayingAudio)}
            >
              {isPlayingAudio ? <Pause size={14} /> : <Play size={14} />}
              <span>{isPlayingAudio ? "PAUSE AUDIO" : "PLAY CALL AUDIO"}</span>
            </button>

            <div className="audio-wave-track">
              <div className="audio-wave-progress" style={{ width: `${audioProgress}%` }} />
              <div className="audio-wave-bars">
                {[40, 70, 90, 60, 100, 45, 80, 65, 95, 30, 85, 70, 50, 90, 40].map((h, i) => (
                  <span key={i} style={{ height: `${h}%` }} className={isPlayingAudio ? "wave-active" : ""} />
                ))}
              </div>
            </div>

            <span className="audio-duration-txt">{scenario.duration}</span>
          </div>

          <div className="caller-profile-strip">
            <div>
              <span>CALLER:</span>
              <strong>{scenario.callerName}</strong>
            </div>
            <div>
              <span>PHONE:</span>
              <strong>{scenario.phone}</strong>
            </div>
            <div>
              <span>TIMESTAMP:</span>
              <strong>{scenario.timestamp}</strong>
            </div>
          </div>

          {/* TRANSCRIPT STREAM */}
          <div className="transcript-box">
            <span className="transcript-tag">SPEECH-TO-TEXT STREAM (SRIKAKULAM 108):</span>
            <p className="transcript-text">"{scenario.transcript}"</p>
          </div>
        </div>

        {/* COLUMN 2: AI EXTRACTED STRUCTURE & OPERATOR VERIFICATION */}
        <div className="console-card">
          <div className="card-head">
            <div className="head-title-row">
              <Sparkles size={16} className="text-purple" />
              <h3>2. AI Extracted Structure</h3>
            </div>
            <button
              className="btn-edit-toggle"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit3 size={13} />
              <span>{isEditing ? "LOCK FIELDS" : "OVERRIDE FIELDS"}</span>
            </button>
          </div>

          <div className="extracted-fields-form">
            <label>
              Emergency Nature / Type
              <input
                type="text"
                disabled={!isEditing}
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="console-input"
              />
            </label>

            <label>
              Srikakulam Corridor Location
              <input
                type="text"
                disabled={!isEditing}
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="console-input"
              />
            </label>

            <div className="form-two-col">
              <label>
                Severity Tier
                <select
                  disabled={!isEditing}
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                  className={`console-select sev-${formData.severity.toLowerCase()}`}
                >
                  <option value="CRITICAL">CRITICAL (Mass Casualty / ALS)</option>
                  <option value="HIGH">HIGH (Major Trauma)</option>
                  <option value="MEDIUM">MEDIUM (BLS Transport)</option>
                  <option value="LOW">LOW (Minor Assessment)</option>
                </select>
              </label>

              <label>
                Total Casualties
                <input
                  type="number"
                  min="1"
                  max="50"
                  disabled={!isEditing}
                  value={formData.victims}
                  onChange={(e) => setFormData({ ...formData, victims: Number(e.target.value) })}
                  className="console-input"
                />
              </label>
            </div>

            <div className="form-two-col">
              <label>
                Critical Trauma Casualties
                <input
                  type="number"
                  min="0"
                  max="20"
                  disabled={!isEditing}
                  value={formData.criticalVictims}
                  onChange={(e) => setFormData({ ...formData, criticalVictims: Number(e.target.value) })}
                  className="console-input"
                />
              </label>

              <label>
                Hazard / Risk Factor
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.hazard}
                  onChange={(e) => setFormData({ ...formData, hazard: e.target.value })}
                  className="console-input"
                />
              </label>
            </div>
          </div>

          {/* UNCERTAINTY & MISSING QUESTIONS */}
          <UncertaintyIndicator
            callerEstimate={scenario.extraction.victimEstimateMin}
            aiEstimateMin={scenario.extraction.victimEstimateMin}
            aiEstimateMax={scenario.extraction.victimEstimateMax}
            emsConfirmed={null}
            locationConfidence={scenario.extraction.locationConfidence}
            locationSource={scenario.extraction.locationSource}
            gaps={scenario.extraction.gaps}
          />
        </div>

        {/* COLUMN 3: LOCATION RESOLUTION & ONE-CLICK DISPATCH HANDOFF */}
        <div className="console-card">
          <div className="card-head">
            <div className="head-title-row">
              <MapPin size={16} className="text-nominal" />
              <h3>3. Location & Action</h3>
            </div>
            <span className="location-conf-badge">
              Confidence: <strong>{scenario.extraction.locationConfidence}%</strong>
            </span>
          </div>

          {/* GEOLOCATION PREVIEW */}
          <div className="location-preview-box">
            <div className="loc-row">
              <Crosshair size={14} className="text-nominal" />
              <div>
                <strong>{formData.location}</strong>
                <small>GPS: <code>[{formData.longitude?.toFixed(4)}, {formData.latitude?.toFixed(4)}]</code></small>
              </div>
            </div>
            <div className="loc-source-tag">Source: {scenario.extraction.locationSource}</div>
          </div>

          {/* POST-TRANSMIT RECOMMENDATION RESULT */}
          {transmittedIncident && analysisResult ? (
            <div className="intake-recommendation-ready-box">
              <div className="rec-ready-head">
                <CheckCircle2 size={20} className="text-nominal" />
                <div>
                  <strong>INCIDENT {transmittedIncident.id} REGISTERED</strong>
                  <small>Decision-Support Analysis Ready ({analysisResult.priority_score}/100)</small>
                </div>
              </div>

              <div className="rec-ready-body">
                <div className="unit-match-row">
                  <Ambulance size={14} className="text-nominal" />
                  <span>Recommended: <strong>{analysisResult.recommended_ambulance?.id} ({analysisResult.recommended_ambulance?.type})</strong> (ETA ~{analysisResult.recommended_ambulance?.eta_minutes} min)</span>
                </div>

                <div className="unit-match-row">
                  <Building2 size={14} className="text-purple" />
                  <span>Hospital: <strong>{analysisResult.recommended_hospital?.name}</strong> ({analysisResult.recommended_hospital?.beds_available} beds free)</span>
                </div>
              </div>

              <button
                className="btn-open-command-center"
                onClick={() => onSwitchToCommand && onSwitchToCommand()}
              >
                <Send size={15} />
                <span>OPEN DISPATCH IN COMMAND CENTER →</span>
              </button>
            </div>
          ) : (
            <div className="intake-action-zone">
              <div className="action-guidance-note">
                <UserCheck size={16} className="text-tactical" />
                <span>Operator confirmation creates the official emergency record and immediately triggers AI response ranking.</span>
              </div>

              <button
                className="btn-confirm-intake-dispatch"
                disabled={isTransmitting}
                onClick={handleConfirmAndTransmit}
              >
                <Send size={16} />
                <span>{isTransmitting ? "TRANSMITTING & COMPUTING..." : "CONFIRM & DISPATCH INCIDENT"}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
