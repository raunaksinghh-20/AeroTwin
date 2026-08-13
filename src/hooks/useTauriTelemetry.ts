/* ────────────────────────────────────────────────────────
   AEROTWIN — useTauriTelemetry
   Strictly listens to live ESP32 UDP telemetry packets
   emitted by the Tauri Rust backend on port 8888.
   ──────────────────────────────────────────────────────── */

import { useEffect } from "react";
import { listen } from "@tauri-apps/api/event";

import { useTelemetryStore } from "../store/telemetryStore";
import type { Telemetry } from "../types/telemetry";


/**
 * Mount this hook ONCE at the top level (App.tsx).
 * Listens exclusively to real live UDP packets from the ESP32 via Tauri.
 */
export function useTauriTelemetry(): void {
  useEffect(() => {
    const store = useTelemetryStore.getState();
    store.resetMission();
    store.setConnectionStatus("disconnected");

    let watchdogTimer: ReturnType<typeof setTimeout> | null = null;

    // Listen strictly to live UDP telemetry packets from ESP32
    const unlistenPromise = listen<string>("udp-message", (event) => {
      try {
        const snapshot: Telemetry = JSON.parse(event.payload);

        // Normalize motor property if sent as a direct number (e.g., "motor": 0.00)
        if (typeof snapshot.motor === "number") {
          snapshot.motor = { power: snapshot.motor };
        }

        // Standardize timestamp to local arrival epoch ms for smooth 30s plotting
        snapshot.timestamp = Date.now();

        store.setConnectionStatus("connected");
        store.updateTelemetry(snapshot);

        // Reset watchdog timer: if no packets arrive for 3.5 seconds, set status to disconnected
        if (watchdogTimer) clearTimeout(watchdogTimer);
        watchdogTimer = setTimeout(() => {
          store.setConnectionStatus("disconnected");
        }, 3500);
      } catch (err) {
        console.warn("[UDP Telemetry] Received non-JSON packet from ESP32:", event.payload);
      }
    });

    return () => {
      if (watchdogTimer) clearTimeout(watchdogTimer);
      unlistenPromise.then((unlisten) => unlisten());
    };
  }, []);
}
