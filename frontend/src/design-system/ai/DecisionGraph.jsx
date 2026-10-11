import React, { useState } from "react";
import { Sparkles, Route, Building2, Ambulance, AlertTriangle, ArrowRight, CheckCircle2, ShieldAlert, Cpu } from "lucide-react";

export function DecisionGraph({
  incident,
  recommendation,
  onSelectNode = null,
}) {
  const [activeNode, setActiveNode] = useState("recommendation");

  if (!recommendation) {
    return (
      <div className="decision-graph-placeholder">
        <Cpu size={24} className="text-purple animate-pulse" />
        <span>Awaiting incident selection to compute AI Decision Graph...</span>
      </div>
    );
  }

  const nodes = [
    {
      id: "incident",
      label: "INCIDENT",
      sub: incident?.type || "Emergency Event",
      icon: <AlertTriangle size={13} />,
      status: "source",
      details: `Reported at ${incident?.location || "Srikakulam"}. Coordinates: [${incident?.coordinates?.[0]?.toFixed(3)}, ${incident?.coordinates?.[1]?.toFixed(3)}].`,
    },
    {
      id: "casualties",
      label: "CASUALTY SIZING",
      sub: `${incident?.victims || 1} Total (${incident?.critical_victims || 0} Critical)`,
      icon: <CheckCircle2 size={13} />,
      status: "nominal",
      details: `Casualty triage weight: ${incident?.critical_victims > 0 ? "ALS Protocol Required" : "Standard BLS Protocol"}.`,
    },
    {
      id: "severity",
      label: "SEVERITY SCORING",
      sub: `Score: ${recommendation?.priority_score || 50}/100`,
      icon: <Sparkles size={13} />,
      status: recommendation?.priority_score >= 80 ? "critical" : "warning",
      details: `Multi-criteria breakdown: Base ${recommendation?.severity_breakdown?.base_points} + Casualty ${recommendation?.severity_breakdown?.victim_count_points} + Hazard ${recommendation?.severity_breakdown?.hazard_type_points}.`,
    },
    {
      id: "road",
      label: "ROAD CORRIDOR",
      sub: recommendation?.road_delay_applied ? `+${recommendation?.recommended_ambulance?.delay_multiplier || 1.3}x Delay` : "Nominal Flow",
      icon: <Route size={13} />,
      status: recommendation?.road_delay_applied ? "warning" : "nominal",
      details: `${recommendation?.nearby_road_events?.length || 0} active road hazard event(s) influencing corridor transit speed.`,
    },
    {
      id: "ambulance",
      label: "EMS FLEET MATCH",
      sub: `${recommendation?.recommended_ambulance?.id || "None"} (${recommendation?.recommended_ambulance?.type || "ALS"})`,
      icon: <Ambulance size={13} />,
      status: recommendation?.recommended_ambulance ? "nominal" : "critical",
      details: `Unit ${recommendation?.recommended_ambulance?.id}: Distance ${recommendation?.recommended_ambulance?.distance_km} km, Estimated Arrival ~${recommendation?.recommended_ambulance?.eta_minutes} min.`,
    },
    {
      id: "hospital",
      label: "TRAUMA DESTINATION",
      sub: recommendation?.recommended_hospital?.name || "None",
      icon: <Building2 size={13} />,
      status: "nominal",
      details: `${recommendation?.recommended_hospital?.beds_available || 0} free beds (${recommendation?.recommended_hospital?.icu_beds_available || 0} ICU beds available).`,
    },
    {
      id: "recommendation",
      label: "FINAL DISPATCH",
      sub: `${recommendation?.response_level} Dispatch`,
      icon: <Sparkles size={13} />,
      status: "highlighted",
      details: `Recommend immediate dispatch of ${recommendation?.recommended_ambulance?.id} with hospital pre-alert to ${recommendation?.recommended_hospital?.name}.`,
    },
  ];

  const selectedNodeData = nodes.find((n) => n.id === activeNode) || nodes[nodes.length - 1];

  return (
    <div className="decision-graph-card">
      <div className="dg-header">
        <div className="dg-title-wrap">
          <Cpu size={15} className="text-purple" />
          <span>AERT EXPLAINABLE DECISION GRAPH</span>
        </div>
        <span className="dg-confidence-tag">
          Rule-Based Transparency: <strong>100%</strong>
        </span>
      </div>

      {/* HORIZONTAL GRAPH NODES CHAIN */}
      <div className="dg-chain-wrapper">
        {nodes.map((node, index) => {
          const isActive = activeNode === node.id;
          return (
            <React.Fragment key={node.id}>
              <div
                className={`dg-node node-${node.status} ${isActive ? "dg-node-active" : ""}`}
                onClick={() => {
                  setActiveNode(node.id);
                  if (onSelectNode) onSelectNode(node);
                }}
              >
                <div className="node-icon-row">
                  {node.icon}
                  <span className="node-step-num">{index + 1}</span>
                </div>
                <strong className="node-title">{node.label}</strong>
                <small className="node-sub">{node.sub}</small>
              </div>

              {index < nodes.length - 1 && (
                <div className="dg-connector-arrow">
                  <ArrowRight size={12} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* SELECTED NODE INSPECTOR PANEL */}
      {selectedNodeData && (
        <div className="dg-inspector-box">
          <div className="inspector-head">
            <strong>STEP {nodes.findIndex((n) => n.id === selectedNodeData.id) + 1}: {selectedNodeData.label}</strong>
            <small>{selectedNodeData.sub}</small>
          </div>
          <p className="inspector-body">{selectedNodeData.details}</p>
        </div>
      )}
    </div>
  );
}
