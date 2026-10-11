import React, { useState } from "react";
import { ChevronDown, ChevronRight, CheckCircle2, ShieldCheck, Ambulance, Building2, Route, Activity } from "lucide-react";

export function ReasoningChain({
  whyAmbulance = [],
  whyHospital = [],
  roadEvents = [],
  scoringBreakdown = null,
  priorityScore = 50,
}) {
  const [expandedSection, setExpandedSection] = useState("all");

  return (
    <div className="reasoning-chain-container">
      {/* SECTION 1: AMBULANCE MATCHING PROOF */}
      <div className="reasoning-block">
        <div
          className="reasoning-head"
          onClick={() => setExpandedSection(expandedSection === "amb" ? null : "amb")}
        >
          <div className="head-left">
            <Ambulance size={15} className="text-nominal" />
            <span>FLEET MATCHING RATIONALE</span>
          </div>
          <span className="expand-indicator">
            {expandedSection === "amb" || expandedSection === "all" ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </span>
        </div>

        {(expandedSection === "amb" || expandedSection === "all") && (
          <ul className="reasoning-list">
            {whyAmbulance && whyAmbulance.length > 0 ? (
              whyAmbulance.map((bullet, i) => (
                <li key={i} className="reasoning-item">
                  <CheckCircle2 size={12} className="text-nominal item-icon" />
                  <span>{bullet}</span>
                </li>
              ))
            ) : (
              <li className="reasoning-item text-muted">Nearest available ALS unit evaluated based on Haversine distance and corridor road delay.</li>
            )}
          </ul>
        )}
      </div>

      {/* SECTION 2: HOSPITAL READINESS PROOF */}
      <div className="reasoning-block">
        <div
          className="reasoning-head"
          onClick={() => setExpandedSection(expandedSection === "hos" ? null : "hos")}
        >
          <div className="head-left">
            <Building2 size={15} className="text-purple" />
            <span>HOSPITAL NETWORK SUITABILITY</span>
          </div>
          <span className="expand-indicator">
            {expandedSection === "hos" || expandedSection === "all" ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </span>
        </div>

        {(expandedSection === "hos" || expandedSection === "all") && (
          <ul className="reasoning-list">
            {whyHospital && whyHospital.length > 0 ? (
              whyHospital.map((bullet, i) => (
                <li key={i} className="reasoning-item">
                  <CheckCircle2 size={12} className="text-purple item-icon" />
                  <span>{bullet}</span>
                </li>
              ))
            ) : (
              <li className="reasoning-item text-muted">Trauma hospital matched based on available ICU resuscitation bays and travel transit time.</li>
            )}
          </ul>
        )}
      </div>

      {/* SECTION 3: ROAD DELAY FACTOR */}
      {roadEvents && roadEvents.length > 0 && (
        <div className="reasoning-block">
          <div
            className="reasoning-head"
            onClick={() => setExpandedSection(expandedSection === "road" ? null : "road")}
          >
            <div className="head-left">
              <Route size={15} className="text-warning" />
              <span>CORRIDOR ROAD HAZARDS ({roadEvents.length})</span>
            </div>
            <span className="expand-indicator">
              {expandedSection === "road" || expandedSection === "all" ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </span>
          </div>

          {(expandedSection === "road" || expandedSection === "all") && (
            <ul className="reasoning-list">
              {roadEvents.map((evt, i) => (
                <li key={i} className="reasoning-item">
                  <span className="hazard-bullet-dot" />
                  <span><strong>{evt.road_name || evt.id}:</strong> {evt.delay_factor_applied || "+1.3x"} Delay ({evt.status || "Active Delay Buffer"})</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
