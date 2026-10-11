import React from "react";

export function Card({
  children,
  variant = "surface", // surface | elevated | highlighted | critical | warning | nominal
  glow = false,
  brackets = true, // Sci-fi tactical corner brackets
  className = "",
  onClick = null,
  header = null,
  footer = null,
  title = "",
}) {
  return (
    <div
      className={`aert-card card-${variant} ${glow ? "card-glow" : ""} ${brackets ? "card-brackets" : ""} ${onClick ? "card-clickable" : ""} ${className}`}
      onClick={onClick}
      title={title}
    >
      {brackets && (
        <>
          <span className="corner-bracket bracket-tl" />
          <span className="corner-bracket bracket-tr" />
          <span className="corner-bracket bracket-bl" />
          <span className="corner-bracket bracket-br" />
        </>
      )}

      {header && <div className="card-header-slot">{header}</div>}
      <div className="card-body-slot">{children}</div>
      {footer && <div className="card-footer-slot">{footer}</div>}
    </div>
  );
}
