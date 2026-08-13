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


/**
 * Evaluates a complete telemetry snapshot and generates an array of active alerts.
 */
export function evaluateTelemetryAlerts(t: import("../types/telemetry").Telemetry): import("../types/telemetry").Alert[] {
  const alerts: import("../types/telemetry").Alert[] = [];
  const now = t.timestamp || Date.now();

  // Battery checks
  if (t.battery.percentage <= BATTERY_THRESHOLDS.percentage.critical) {
    alerts.push({
      id: `bat-pct-crit-${now}`,
      severity: "critical",
      source: "Battery",
      message: `CRITICAL: Battery level at ${t.battery.percentage.toFixed(1)}% (Threshold: ${BATTERY_THRESHOLDS.percentage.critical}%)`,
      timestamp: now,
    });
  } else if (t.battery.percentage <= BATTERY_THRESHOLDS.percentage.caution) {
    alerts.push({
      id: `bat-pct-caut-${now}`,
      severity: "caution",
      source: "Battery",
      message: `CAUTION: Low battery level at ${t.battery.percentage.toFixed(1)}%`,
      timestamp: now,
    });
  }

  if (t.battery.temperature >= BATTERY_THRESHOLDS.temperature.critical) {
    alerts.push({
      id: `bat-temp-crit-${now}`,
      severity: "critical",
      source: "Battery",
      message: `CRITICAL: Battery temperature high (${t.battery.temperature.toFixed(1)}°C)`,
      timestamp: now,
    });
  } else if (t.battery.temperature >= BATTERY_THRESHOLDS.temperature.caution) {
    alerts.push({
      id: `bat-temp-caut-${now}`,
      severity: "caution",
      source: "Battery",
      message: `CAUTION: Battery temp elevated (${t.battery.temperature.toFixed(1)}°C)`,
      timestamp: now,
    });
  }

  // Fuel Cell checks
  if (t.fuelCell.temperature >= FUEL_CELL_THRESHOLDS.temperature.critical) {
    alerts.push({
      id: `fc-temp-crit-${now}`,
      severity: "critical",
      source: "Fuel Cell",
      message: `CRITICAL: Fuel Cell temperature critical (${t.fuelCell.temperature.toFixed(1)}°C)`,
      timestamp: now,
    });
  } else if (t.fuelCell.temperature >= FUEL_CELL_THRESHOLDS.temperature.caution) {
    alerts.push({
      id: `fc-temp-caut-${now}`,
      severity: "caution",
      source: "Fuel Cell",
      message: `CAUTION: Fuel Cell temperature elevated (${t.fuelCell.temperature.toFixed(1)}°C)`,
      timestamp: now,
    });
  }

  // Signal / Comms checks
  if (t.signal.rssi <= SIGNAL_THRESHOLDS.rssi.critical) {
    alerts.push({
      id: `rssi-crit-${now}`,
      severity: "critical",
      source: "Radio / Comms",
      message: `CRITICAL: Radio signal extremely weak (${t.signal.rssi} dBm)`,
      timestamp: now,
    });
  } else if (t.signal.rssi <= SIGNAL_THRESHOLDS.rssi.caution) {
    alerts.push({
      id: `rssi-caut-${now}`,
      severity: "caution",
      source: "Radio / Comms",
      message: `CAUTION: Radio signal degradation (${t.signal.rssi} dBm)`,
      timestamp: now,
    });
  }

  // GPS checks
  if (t.gps.satellites <= GPS_THRESHOLDS.satellites.critical) {
    alerts.push({
      id: `gps-crit-${now}`,
      severity: "critical",
      source: "GPS",
      message: `CRITICAL: GPS satellite lock lost (${t.gps.satellites} sat)`,
      timestamp: now,
    });
  } else if (t.gps.satellites <= GPS_THRESHOLDS.satellites.caution) {
    alerts.push({
      id: `gps-caut-${now}`,
      severity: "caution",
      source: "GPS",
      message: `CAUTION: Low GPS satellite count (${t.gps.satellites} sat)`,
      timestamp: now,
    });
  }

  return alerts;
}


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


