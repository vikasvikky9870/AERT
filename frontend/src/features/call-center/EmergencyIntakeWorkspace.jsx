import React, { useState } from 'react';
import { AlertTriangle, Check, CircleHelp, FileText, MapPin, MicOff, Radio, Search, ShieldAlert, Siren } from 'lucide-react';
import { analyzeCallNotes, createIncident } from '../../api';
import { OPERATIONAL_BOUNDS } from '../../config/geography';
import { SpatialCanvas } from '../../spatial/transition/SpatialCanvas';

const TRAINING_EXAMPLES = [
  {
    label: 'Road collision · training example',
    transcript: 'Training example only: caller reports a two vehicle crash near a road junction. One person may be unconscious. Caller says traffic is blocked and cannot confirm the exact entrance or number of patients.',
    location: 'Training location — replace with caller-confirmed landmark',
  },
  {
    label: 'Fire and smoke · training example',
    transcript: 'Training example only: caller reports smoke and a small fire in a workshop. Two people may be inside. The caller is outside but does not know the road name.',
    location: 'Training location — replace with caller-confirmed landmark',
  },
];

export function EmergencyIntakeWorkspace({ incidents = [], ambulances = [], hospitals = [], onIncidentCreated = () => {} }) {
  const [transcript, setTranscript] = useState('');
  const [exampleLoaded, setExampleLoaded] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [analysisError, setAnalysisError] = useState('');
  const [busy, setBusy] = useState(false);
  const [incidentError, setIncidentError] = useState('');
  const [created, setCreated] = useState('');
  const [pickLocation, setPickLocation] = useState(false);
  const [draft, setDraft] = useState({ type: 'Medical emergency (caller-described)', location: '', longitude: '', latitude: '', severity: 'HIGH', victims: '', critical_victims: '', hazard_type: '' });

  const edit = (key, value) => setDraft((current) => ({ ...current, [key]: value }));

  const analyze = async () => {
    setAnalysisError(''); setAnalysis(null); setIncidentError(''); setCreated('');
    if (transcript.trim().length < 3) { setAnalysisError('Enter the caller’s words or operator-captured notes first.'); return; }
    setBusy(true);
    try {
      const result = await analyzeCallNotes(transcript.trim());
      setAnalysis(result);
      const candidate = result.classification_candidates?.[0]?.label;
      const suggestedType = candidate === 'Road traffic collision' ? 'Road traffic collision' : candidate === 'Fire or smoke report' ? 'Fire / smoke report' : candidate === 'Possible hazardous-material report' ? 'Possible hazardous material incident' : candidate || 'Unclassified emergency';
      const hazard = result.safety_clues?.includes('Fire / smoke / hazardous release mentioned') ? 'Caller mentioned fire, smoke or a possible hazardous release — verify exact hazard.' : '';
      setDraft((current) => ({ ...current, type: suggestedType, victims: result.caller_reported_casualty_count == null ? '' : String(result.caller_reported_casualty_count), hazard_type: hazard }));
    } catch {
      setAnalysisError('Could not reach the prototype analysis service. Keep the caller’s words and continue with manual operator review.');
    } finally { setBusy(false); }
  };

  const registerIncident = async (event) => {
    event.preventDefault(); setIncidentError(''); setCreated('');
    const longitude = Number(draft.longitude); const latitude = Number(draft.latitude);
    const [[minLon, minLat], [maxLon, maxLat]] = OPERATIONAL_BOUNDS;
    if (!transcript.trim()) { setIncidentError('Enter caller words or operator notes before saving an incident.'); return; }
    if (!draft.location.trim()) { setIncidentError('Enter a location confirmed by the caller or operator.'); return; }
    if (!Number.isFinite(longitude) || !Number.isFinite(latitude) || longitude < minLon || longitude > maxLon || latitude < minLat || latitude > maxLat) { setIncidentError('Enter a verified map coordinate within the configured sector window. The basemap does not provide live caller location.'); return; }
    if (!draft.victims || Number(draft.victims) < 0) { setIncidentError('Enter a caller-reported count, or use 0 when the number of people is unknown.'); return; }
    setBusy(true);
    try {
      const result = await createIncident({ type: draft.type, location: draft.location.trim(), severity: draft.severity, victims: Number(draft.victims), critical_victims: Number(draft.critical_victims || 0), hazard_type: draft.hazard_type || 'Not reported', coordinates: [longitude, latitude], location_source: 'Operator entered; not independently verified', notes: `${exampleLoaded ? '[TRAINING EXAMPLE] ' : ''}${transcript.trim()}${analysis?.safety_clues?.length ? `\nText clues for operator review: ${analysis.safety_clues.join('; ')}` : ''}` });
      const incident = result.incident;
      if (!incident?.id) throw new Error('The service did not return an incident record.');
      setCreated(`${incident.id} created. Dispatch remains a separate operator decision.`);
      onIncidentCreated(incident);
    } catch (error) {
      setIncidentError(error.message || 'Incident record could not be saved. No dispatch was sent.');
    } finally { setBusy(false); }
  };

  const loadExample = (example) => {
    setTranscript(example.transcript); setExampleLoaded(true); setAnalysis(null); setAnalysisError(''); setCreated(''); setIncidentError('');
    setDraft((current) => ({ ...current, location: example.location, longitude: '', latitude: '', critical_victims: '', severity: 'HIGH', hazard_type: '' }));
  };

  return <div className="intake-workspace">
    <div className="intake-connection"><div className="intake-connection-icon"><MicOff size={17} /></div><div><b>Voice / phone feed is not connected</b><span>This prototype does not receive live 108/112 calls, record audio, or produce speech transcription.</span></div><span className="prototype-tag">PROTOTYPE</span></div>
    <div className="intake-grid">
      <section className="intake-card intake-call-card">
        <div className="intake-card-heading"><div><span className="intake-step">01 · CALL NOTES</span><h2>Capture what the caller said</h2></div><Radio size={17} /></div>
        {exampleLoaded && <div className="synthetic-call-banner"><AlertTriangle size={14} /> Training example loaded · replace all example details before creating a record.</div>}
        <label className="intake-label" htmlFor="caller-transcript">OPERATOR NOTES OR TRANSCRIPT</label>
        <textarea id="caller-transcript" rows="8" maxLength={8000} value={transcript} onChange={(event) => { setTranscript(event.target.value); setAnalysis(null); setCreated(''); }} placeholder="Enter the caller’s exact words. Keep uncertainty explicit: “caller estimates 3–5 people”, “location not confirmed”, “breathing unknown”…" />
        <div className="intake-count"><span>{transcript.length}/8,000 characters</span><span>Do not enter real personal details in a demo environment.</span></div>
        <div className="training-examples"><span>TRAINING EXAMPLES</span>{TRAINING_EXAMPLES.map((example) => <button key={example.label} type="button" onClick={() => loadExample(example)}>{example.label}</button>)}</div>
        <button type="button" className="intake-primary" onClick={analyze} disabled={busy || !transcript.trim()}><Search size={15} />{busy ? 'Reviewing notes…' : 'Extract text clues for review'}</button>
        {analysisError && <p className="intake-error" role="alert">{analysisError}</p>}
      </section>

      <section className="intake-card">
        <div className="intake-card-heading"><div><span className="intake-step">02 · OPERATOR REVIEW</span><h2>Separate clues from confirmed facts</h2></div><ShieldAlert size={18} /></div>
        {!analysis ? <div className="intake-empty"><CircleHelp size={22} /><b>Nothing has been inferred yet</b><span>Run the transparent text rules after entering notes. They never assign a location, medical diagnosis, severity, or ambulance.</span></div> : <>
          <div className="rules-engine-label"><span /> RULE-BASED TEXT MATCH · NOT A CLINICAL AI</div>
          <div className="review-group"><label>Possible incident descriptions</label>{analysis.classification_candidates?.length ? analysis.classification_candidates.map((candidate) => <div className="review-line" key={candidate.label}><span>{candidate.label}</span><small>{candidate.evidence_count} text match{candidate.evidence_count === 1 ? '' : 'es'}</small></div>) : <div className="review-unknown">No matching category. Use operator judgment; keep classification unconfirmed.</div>}</div>
          <div className="review-group"><label>Safety phrases to verify</label>{analysis.safety_clues?.length ? analysis.safety_clues.map((clue) => <div className="review-line safety-clue" key={clue}><AlertTriangle size={13} /><span>{clue}</span></div>) : <div className="review-unknown">No configured safety phrase found. This does not mean the scene is safe.</div>}</div>
          <div className="review-group"><label>Follow-up questions</label>{analysis.follow_up_questions?.map((question) => <div className="review-question" key={question}>{question}</div>)}</div>
          <div className="no-confidence"><b>No confidence score shown</b><span>These are keyword matches only. They can miss negation, sarcasm, speech errors, multiple patients, and Telugu or mixed-language speech.</span></div>
        </>}
      </section>

      <section className="intake-card intake-record-card">
        <div className="intake-card-heading"><div><span className="intake-step">03 · VERIFIED INCIDENT</span><h2>Confirm before saving</h2></div><MapPin size={18} /></div>
        <form onSubmit={registerIncident}>
          <label className="intake-label">INCIDENT TYPE <input value={draft.type} onChange={(e) => edit('type', e.target.value)} /></label>
          <label className="intake-label">CALLER-CONFIRMED LOCATION <input value={draft.location} onChange={(e) => edit('location', e.target.value)} placeholder="Landmark, road, direction, village or entrance" /></label>
          <div className="intake-location-hint"><MapPin size={13} />Use the basemap to choose a point. This only reads the clicked map coordinate; it does not verify the caller’s location.</div>
          <button type="button" className={`pin-location-toggle ${pickLocation ? 'active' : ''}`} onClick={() => setPickLocation((value) => !value)}><MapPin size={14} />{pickLocation ? 'Click the map to place the incident pin' : 'Choose location on map'}</button>
          {pickLocation && <div className="intake-map-picker"><SpatialCanvas incidents={incidents} responders={ambulances} hospitals={hospitals} roadEvents={[]} activeRoute={null} selectedEntity={null} spatialLens="OPERATIONAL" coordinatePickEnabled={pickLocation} onCoordinatePick={([longitude, latitude]) => { edit('longitude', longitude.toFixed(6)); edit('latitude', latitude.toFixed(6)); setPickLocation(false); }} /><span className="intake-map-note">ESRI BASEMAP · SAMPLE MARKERS · CLICK TO SET A PIN</span></div>}
          <div className="intake-coordinate-grid"><label className="intake-label">LONGITUDE<input inputMode="decimal" type="number" step="any" value={draft.longitude} onChange={(e) => edit('longitude', e.target.value)} placeholder="83.xxxx" /></label><label className="intake-label">LATITUDE<input inputMode="decimal" type="number" step="any" value={draft.latitude} onChange={(e) => edit('latitude', e.target.value)} placeholder="18.xxxx" /></label></div>
          <div className="intake-coordinate-hint">Sector window: {OPERATIONAL_BOUNDS[0].join(', ')} to {OPERATIONAL_BOUNDS[1].join(', ')} · this is a rectangular validation window, not the district boundary.</div>
          <div className="intake-coordinate-grid"><label className="intake-label">OPERATOR-SET PRIORITY<select value={draft.severity} onChange={(e) => edit('severity', e.target.value)}><option value="CRITICAL">Critical · immediate review</option><option value="HIGH">High · urgent review</option><option value="MEDIUM">Medium · operator review</option><option value="LOW">Low · operator review</option></select></label><label className="intake-label">PATIENTS REPORTED<input type="number" min="0" max="1000" value={draft.victims} onChange={(e) => edit('victims', e.target.value)} placeholder="0 = not yet known" /><small>Use 0 when unknown; do not invent a count.</small></label></div>
          <div className="intake-coordinate-grid"><label className="intake-label">CRITICAL PATIENTS<input type="number" min="0" max={draft.victims || 1000} value={draft.critical_victims} onChange={(e) => edit('critical_victims', e.target.value)} placeholder="Not confirmed" /></label><label className="intake-label">HAZARD AS REPORTED<input value={draft.hazard_type} onChange={(e) => edit('hazard_type', e.target.value)} placeholder="Not reported / unconfirmed" /></label></div>
          {incidentError && <p className="intake-error" role="alert">{incidentError}</p>}
          {created && <p className="intake-success" role="status"><Check size={15} />{created}</p>}
          <div className="intake-submit-note"><ShieldAlert size={15} />Text analysis is optional. If it fails, review the caller notes manually and continue. Saving creates a record only; this prototype cannot notify dispatch or a hospital.</div>
          <button className="intake-primary" type="submit" disabled={busy || Boolean(created)}><FileText size={15} />{busy ? 'Saving…' : 'Save operator-reviewed incident'}</button>
        </form>
      </section>
    </div>
  </div>;
}
