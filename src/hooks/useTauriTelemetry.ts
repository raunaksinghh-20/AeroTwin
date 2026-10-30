import { useEffect } from "react";
import { listen } from "@tauri-apps/api/event";

import { useTelemetryStore } from "../store/telemetryStore";
import { useSettingsStore } from "../store/settingsStore";
import { updateBackendUdpPort } from "../lib/tauriCommands";
import type { Telemetry } from "../types/telemetry";


/* ── Shape of the JSON emitted by Rust after binary parse ── */

interface EspStructTelemetry {
  batteryVoltage: number;
  batteryCurrent: number;
  fcVoltage: number;
  fcCurrent: number;
  dcBusVoltage: number;
  dcBusCurrent: number;
  motorPower: number;
  batteryPercent: number;
  h2Percent: number;
  batteryContribution: number;
  fcContribution: number;
  batteryPower: number;
  fcPower: number;
  dcBusPower: number;
}


/**
 * Map the ESP32 TelemetryData struct payload into the full
 * `Telemetry` interface consumed by the rest of the dashboard.
 */
function mapEspToTelemetry(esp: EspStructTelemetry): Telemetry {
  const batPct = esp.batteryPercent > 0 ? esp.batteryPercent : esp.batteryContribution;
  const h2Pct  = esp.h2Percent > 0 ? esp.h2Percent : esp.fcContribution;

  return {
    timestamp: Date.now(),

    flight:   { altitude: 0, speed: 0, roll: 0, pitch: 0, yaw: 0 },
    gps:      { latitude: 0, longitude: 0, satellites: 0 },
    signal:   { rssi: -45 },

    battery: {
      voltage:     esp.batteryVoltage,
      current:     esp.batteryCurrent,
      percentage:  batPct,
      temperature: 25,
    },

    fuelCell: {
      voltage:        esp.fcVoltage,
      current:        esp.fcCurrent,
      temperature:    35,
      tankPercentage: h2Pct,
      pressure:       1.5,
    },

    dcBus: {
      voltage: esp.dcBusVoltage,
      current: esp.dcBusCurrent,
    },

    motor: {
      power: esp.motorPower > 0 ? esp.motorPower : (esp.dcBusPower > 0 ? esp.dcBusPower : (esp.batteryPower + esp.fcPower)),
    },

    /* ── Extended fields from binary protocol ────────────── */
    fcPower:              esp.fcPower,
    batteryPower:         esp.batteryPower,
    dcBusPower:           esp.dcBusPower,
    fcContribution:       esp.fcContribution,
    batteryContribution:  esp.batteryContribution,
  } as Telemetry;
}


/**
 * Mount this hook ONCE at the top level (App.tsx).
 * Syncs saved UDP port with Rust backend and listens to telemetry packets.
 */
export function useTauriTelemetry(): void {
  useEffect(() => {
    const store = useTelemetryStore.getState();
    store.resetMission();
    store.setConnectionStatus("disconnected");

    const savedPort = useSettingsStore.getState().udpPort;
    if (savedPort && savedPort !== 8888) {
      updateBackendUdpPort(savedPort).catch(() => {});
    }

    let watchdogTimer: ReturnType<typeof setTimeout> | null = null;

    // Listen to parsed struct telemetry from Rust backend
    const unlistenTelemetry = listen<string>("udp-telemetry", (event) => {
      try {
        const esp: EspStructTelemetry = JSON.parse(event.payload);
        const snapshot = mapEspToTelemetry(esp);

        store.setConnectionStatus("connected");
        store.updateTelemetry(snapshot);

        // Reset watchdog: if no packets arrive for configured timeout → disconnected
        const timeoutMs = useSettingsStore.getState().watchdogTimeoutMs || 3500;
        if (watchdogTimer) clearTimeout(watchdogTimer);
        watchdogTimer = setTimeout(() => {
          store.setConnectionStatus("disconnected");
        }, timeoutMs);
      } catch (err) {
        console.warn("[UDP Telemetry] Failed to parse binary telemetry JSON:", err, event.payload);
      }
    });

    // Also listen for raw non-binary messages (debugging / future extensibility)
    const unlistenRaw = listen<string>("udp-message", (event) => {
      console.debug("[UDP Raw]", event.payload);
    });

    return () => {
      if (watchdogTimer) clearTimeout(watchdogTimer);
      unlistenTelemetry.then((unlisten) => unlisten());
      unlistenRaw.then((unlisten) => unlisten());
    };
  }, []);
}

