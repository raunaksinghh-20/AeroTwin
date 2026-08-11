/* ────────────────────────────────────────────────────────
   AEROTWIN — MOCK TELEMETRY
   Generates realistic telemetry data using sine-wave
   jitter.  Feeds the Zustand store exactly as the real
   Tauri UDP listener will later — so swapping in real
   data requires zero changes to any dashboard component.
   ──────────────────────────────────────────────────────── */

import type { Telemetry } from "../types/telemetry";
import type { TelemetryStore } from "../store/telemetryStore";


/* ── Interval handle ───────────────────────────────────── */

let intervalId: ReturnType<typeof setInterval> | null = null;


/* ── Jitter helpers ────────────────────────────────────── */

function jitter(base: number, amplitude: number, phase: number, freq: number): number {
  return base + Math.sin(Date.now() / freq + phase) * amplitude;
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}


/* ── Snapshot generator ────────────────────────────────── */

function generateSnapshot(): Telemetry {
  const t = Date.now();

  const battVoltage  = jitter(13.2, 0.3, 0, 5000);
  const battCurrent  = jitter(9.3, 0.8, 1, 3500);
  const fcVoltage    = jitter(15.1, 0.4, 2, 6200);
  const fcCurrent    = jitter(23.5, 1.2, 3, 4100);

  // DC bus is derived from combined power sources
  const dcBusVoltage = jitter(51.6, 0.6, 4, 7000);
  const dcBusCurrent = jitter(32.4, 1.5, 5, 4800);

  return {
    timestamp: t,

    flight: {
      altitude: jitter(142.6, 1.4, 0, 4000),
      speed:    jitter(8.4, 0.6, 1, 2600),
      roll:     jitter(2.3, 9, 0, 3200),
      pitch:    jitter(-1.1, 4, 1, 4100),
      yaw:      jitter(184, 3, 2, 8000),
    },

    gps: {
      latitude:   18.5203 + Math.sin(t / 20000) * 0.00005,
      longitude:  73.8567 + Math.cos(t / 20000) * 0.00005,
      satellites: Math.round(clamp(jitter(12, 1.5, 3, 10000), 6, 16)),
    },

    battery: {
      voltage:     battVoltage,
      current:     battCurrent,
      percentage:  clamp(jitter(76, 2, 4, 30000), 10, 100),
      temperature: jitter(42, 3, 5, 12000),
    },

    fuelCell: {
      voltage:     fcVoltage,
      current:     fcCurrent,
      temperature: jitter(68, 4, 6, 9000),
    },

    dcBus: {
      voltage: dcBusVoltage,
      current: dcBusCurrent,
    },

    signal: {
      rssi: clamp(jitter(-45, 8, 7, 6000), -90, -20),
    },
  };
}


/* ── Public API ────────────────────────────────────────── */

/**
 * Start feeding mock telemetry into the store at ~2 Hz.
 * Call once from the global telemetry hook.
 */
export function startMockTelemetry(store: TelemetryStore): void {
  if (intervalId !== null) return;

  store.setConnectionStatus("connected");
  store.resetMission();

  // Push an initial snapshot immediately
  store.updateTelemetry(generateSnapshot());

  intervalId = setInterval(() => {
    store.updateTelemetry(generateSnapshot());
  }, 500);
}

/**
 * Stop mock telemetry generation.
 */
export function stopMockTelemetry(): void {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
}
