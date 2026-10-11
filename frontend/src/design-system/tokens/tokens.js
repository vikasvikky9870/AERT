/**
 * AERT Design System Tokens
 * Defines semantic color constants, spatial depths, radii, typography, and visual glow tokens.
 */

export const TOKENS = {
  colors: {
    // Semantic Status Colors
    critical: {
      primary: "#ef4444",
      dark: "#b91c1c",
      light: "#fca5a5",
      glow: "rgba(239, 68, 68, 0.45)",
      bg: "rgba(239, 68, 68, 0.12)",
      border: "rgba(239, 68, 68, 0.35)",
    },
    warning: {
      primary: "#f97316",
      dark: "#c2410c",
      light: "#fed7aa",
      glow: "rgba(249, 115, 22, 0.45)",
      bg: "rgba(249, 115, 22, 0.12)",
      border: "rgba(249, 115, 22, 0.35)",
    },
    caution: {
      primary: "#eab308",
      dark: "#a16207",
      light: "#fef08a",
      glow: "rgba(234, 179, 8, 0.45)",
      bg: "rgba(234, 179, 8, 0.12)",
      border: "rgba(234, 179, 8, 0.35)",
    },
    nominal: {
      primary: "#10b981",
      dark: "#047857",
      light: "#a7f3d0",
      glow: "rgba(16, 185, 129, 0.45)",
      bg: "rgba(16, 185, 129, 0.12)",
      border: "rgba(16, 185, 129, 0.35)",
    },
    tacticalBlue: {
      primary: "#3b82f6",
      dark: "#1d4ed8",
      light: "#bfdbfe",
      glow: "rgba(59, 130, 246, 0.45)",
      bg: "rgba(59, 130, 246, 0.12)",
      border: "rgba(59, 130, 246, 0.35)",
    },
    decisionPurple: {
      primary: "#8b5cf6",
      dark: "#6d28d9",
      light: "#ddd6fe",
      glow: "rgba(139, 92, 246, 0.45)",
      bg: "rgba(139, 92, 246, 0.12)",
      border: "rgba(139, 92, 246, 0.35)",
    },
    cyberCyan: {
      primary: "#06b6d4",
      dark: "#0e7490",
      light: "#a5f3fc",
      glow: "rgba(6, 182, 212, 0.45)",
      bg: "rgba(6, 182, 212, 0.12)",
      border: "rgba(6, 182, 212, 0.35)",
    },
  },

  typography: {
    fontSans: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontMono: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    fontDisplay: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
  },

  radii: {
    xs: "4px",
    sm: "6px",
    md: "10px",
    lg: "14px",
    xl: "20px",
    full: "9999px",
  },

  shadows: {
    subtle: "0 2px 8px rgba(0, 0, 0, 0.4)",
    card: "0 4px 20px rgba(0, 0, 0, 0.55)",
    elevated: "0 12px 40px rgba(0, 0, 0, 0.75)",
    glowBlue: "0 0 20px rgba(59, 130, 246, 0.35)",
    glowRed: "0 0 20px rgba(239, 68, 68, 0.35)",
    glowPurple: "0 0 20px rgba(139, 92, 246, 0.35)",
  },

  transitions: {
    fast: "150ms cubic-bezier(0.4, 0, 0.2, 1)",
    standard: "250ms cubic-bezier(0.4, 0, 0.2, 1)",
    smooth: "400ms cubic-bezier(0.16, 1, 0.3, 1)",
    spring: "500ms cubic-bezier(0.34, 1.56, 0.64, 1)",
  },

  zIndex: {
    base: 1,
    elevated: 10,
    topbar: 30,
    sidebar: 40,
    hud: 50,
    drawer: 90,
    modal: 110,
    tooltip: 120,
  },
};
