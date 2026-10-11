import React from 'react';
import { AlertTriangle, ClipboardCheck, Database, HelpCircle, ShieldAlert } from 'lucide-react';

export function DecisionSupportReview({ incidents = [], selectedIncident = null, availableUnits = [], hospitals = [] }) {
  const incident = selectedIncident || incidents[0];
  if (!incident) return <section className="decision-review-empty">No training incident is selected.</section>;
  const facts = [
    ['Incident category', incident.type || 'Not recorded', 'Training record'],
    ['Caller / operator location text', incident.location || 'Not recorded', 'Not geocoded'],
    ['Patient count', incident.victims ?? 'Unknown', 'Seeded fixture'],
    ['Critical count', incident.critical_victims ?? 'Unknown', 'Seeded fixture'],
    ['Hazard notes', incident.hazard_type || 'Not recorded', 'Unverified text'],
  ];
  return <div className="decision-review">
    <div className="decision-review-alert"><ShieldAlert size={17} /><div><b>No operational AI recommendation is available</b><span>This build contains rule-based examples and seeded records. It has no validated clinical triage model, verified AVL, live road graph, or hospital bed feed.</span></div></div>
    <div className="decision-review-layout">
      <section className="decision-panel"><span className="intake-step">RECORD BEING REVIEWED</span><h2>{incident.id} · {incident.type}</h2><p>{incident.location}</p><div className="decision-facts">{facts.map(([label,value,source]) => <div className="decision-fact" key={label}><span>{label}</span><b>{value}</b><small>{source}</small></div>)}</div></section>
      <section className="decision-panel"><span className="intake-step">OPERATOR CHECKS</span><h2>Verify before acting</h2><div className="decision-check"><HelpCircle size={16} /><span>Confirm exact location from the caller and check the pin on an authoritative map.</span></div><div className="decision-check"><AlertTriangle size={16} /><span>Confirm patient count, responsiveness, breathing concerns and scene hazards with the approved local protocol.</span></div><div className="decision-check"><Database size={16} /><span>Confirm unit status directly with the dispatch system and responder radio.</span></div><div className="decision-check"><ClipboardCheck size={16} /><span>Confirm receiving-facility acceptance; stored capacity values are training fixtures.</span></div><div className="decision-resource"><b>Records in this training fixture</b><span>{availableUnits.length} unit records · {hospitals.length} facility records · not live availability</span></div></section>
    </div>
  </div>;
}
