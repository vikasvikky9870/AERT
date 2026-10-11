import React from "react";

export function MetricDisplay({
  label,
  value,
  unit = "",
  subtext = "",
  variant = "default", // default | critical | warning | nominal | blue | purple
  icon = null,
  trend = null, // "+12%", "-5m", etc.
  trendDirection = "neutral", // up | down | neutral
  className = "",
  compact = false,
}) {
  return (
    <div className={`metric-display metric-${variant} ${compact ? "metric-compact" : ""} ${className}`}>
      <div className="metric-head">
        <span className="metric-label">{label}</span>
        {icon && <span className="metric-icon">{icon}</span>}
      </div>

      <div className="metric-value-row">
        <span className="metric-val">{value}</span>
        {unit && <span className="metric-unit">{unit}</span>}
        {trend && (
          <span className={`metric-trend trend-${trendDirection}`}>
            {trendDirection === "up" ? "▲ " : trendDirection === "down" ? "▼ " : ""}
            {trend}
          </span>
        )}
      </div>

      {subtext && <span className="metric-subtext">{subtext}</span>}
    </div>
  );
}
