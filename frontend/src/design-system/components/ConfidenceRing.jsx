import React from "react";

export function ConfidenceRing({
  value = 85, // 0 - 100
  size = 54,
  strokeWidth = 4.5,
  label = "",
  sublabel = "",
  variant = "blue", // blue | green | purple | orange | red
  showPercent = true,
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(100, Math.max(0, value));
  const offset = circumference - (progress / 100) * circumference;

  const colorMap = {
    blue: "#3b82f6",
    green: "#10b981",
    purple: "#8b5cf6",
    orange: "#f97316",
    red: "#ef4444",
    cyan: "#06b6d4",
  };

  const strokeColor = colorMap[variant] || colorMap.blue;

  return (
    <div className="confidence-ring-container" style={{ width: size, height: size }}>
      <svg className="confidence-ring-svg" width={size} height={size}>
        {/* Background Track */}
        <circle
          className="ring-bg"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        {/* Active Animated Progress Arc */}
        <circle
          className="ring-progress"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke={strokeColor}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>

      <div className="ring-content-center">
        {showPercent && (
          <span className="ring-value-text" style={{ color: strokeColor }}>
            {Math.round(value)}
            <small>%</small>
          </span>
        )}
      </div>

      {(label || sublabel) && (
        <div className="ring-labels">
          {label && <span className="ring-label-title">{label}</span>}
          {sublabel && <span className="ring-label-sub">{sublabel}</span>}
        </div>
      )}
    </div>
  );
}
