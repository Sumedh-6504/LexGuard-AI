/**
 * Shared constants used across the LexGuard application.
 * Centralised here to avoid magic strings scattered through the codebase.
 */

/** Maximum number of analyses a guest (unauthenticated) user can run per browser session. */
export const GUEST_ANALYSIS_LIMIT = 3;

/** Maximum number of analyses a free-tier user can run per calendar month. */
export const FREE_TIER_MONTHLY_LIMIT = 10;

/** Risk-level display metadata — colours, labels, sort order. */
export const RISK_LEVELS = {
  SAFE:     { label: "Safe",     color: "#00d4ff", order: 0 },
  LOW:      { label: "Low",      color: "#30d158", order: 1 },
  MEDIUM:   { label: "Medium",   color: "#ffd60a", order: 2 },
  HIGH:     { label: "High",     color: "#ff6b35", order: 3 },
  CRITICAL: { label: "Critical", color: "#ff2d55", order: 4 },
} as const;

/** Application routes — single source of truth for navigation. */
export const ROUTES = {
  HOME:      "/",
  SIGN_IN:   "/auth/signin",
  UPLOAD:    "/upload",
  DASHBOARD: "/dashboard",
  CONTRACTS: "/contracts",
  PROFILE:   "/profile",
  SETTINGS:  "/settings",
  PLANS:     "/plans",
  ANALYSIS:  (id: string) => `/analysis/${id}` as const,
} as const;
