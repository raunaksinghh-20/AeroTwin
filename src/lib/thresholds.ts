/* ────────────────────────────────────────────────────────
   AEROTWIN — STATUS THRESHOLDS
   Defines nominal / caution / critical boundaries for
   each telemetry subsystem.
   ──────────────────────────────────────────────────────── */

import type { AlertSeverity } from "../types/telemetry";


/* ── Battery ───────────────────────────────────────────── */

export const BATTERY_THRESHOLDS = {
  percentage: { caution: 30, critical: 15 },
  voltage:    { caution: 11.5, critical: 10.5 },
  temperature:{ caution: 55, critical: 65 },
} as const;


/* ── Fuel Cell ─────────────────────────────────────────── */

export const FUEL_CELL_THRESHOLDS = {
  voltage:    { caution: 12.0, critical: 10.0 },
  temperature:{ caution: 65, critical: 75 },
} as const;


/* ── DC Bus ────────────────────────────────────────────── */

export const DC_BUS_THRESHOLDS = {
  voltage: { low: 44.0, high: 58.0 },
  current: { caution: 45, critical: 55 },
} as const;


/* ── Signal ────────────────────────────────────────────── */

export const SIGNAL_THRESHOLDS = {
  rssi: { caution: -70, critical: -85 },
} as const;


/* ── GPS ───────────────────────────────────────────────── */

export const GPS_THRESHOLDS = {
  satellites: { caution: 6, critical: 4 },
} as const;


/* ── Gauge ranges ──────────────────────────────────────── */

export const BUS_VOLTAGE_RANGE = { min: 40, max: 60 } as const;
export const BUS_CURRENT_RANGE = { min: 0, max: 60 } as const;


/* ── Helpers ───────────────────────────────────────────── */

/**
 * Returns severity based on a value and thresholds where
 * LOWER values are worse (e.g. battery %, voltage, RSSI).
 */
export function getSeverityBelow(
  value: number,
  caution: number,
  critical: number,
): AlertSeverity {
  if (value <= critical) return "critical";
  if (value <= caution) return "caution";
  return "nominal";
}

/**
 * Returns severity based on a value where HIGHER values
 * are worse (e.g. temperature, current).
 */
export function getSeverityAbove(
  value: number,
  caution: number,
  critical: number,
): AlertSeverity {
  if (value >= critical) return "critical";
  if (value >= caution) return "caution";
  return "nominal";
}
