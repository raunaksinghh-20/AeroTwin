/* ────────────────────────────────────────────────────────
   AEROTWIN — useTauriTelemetry
   The ONLY place that produces telemetry data.
   Currently: starts mock telemetry.
   Later:     listens to Tauri `udp-message` events and
              parses real data into the store.
   ──────────────────────────────────────────────────────── */

import { useEffect } from "react";

import { useTelemetryStore } from "../store/telemetryStore";
import { startMockTelemetry, stopMockTelemetry } from "../lib/mockTelemetry";


/**
 * Mount this hook ONCE at the top level (App.tsx).
 * It starts mock telemetry on mount and cleans up on unmount.
 *
 * When real Tauri UDP telemetry is ready, replace the
 * mock calls with:
 *   listen<string>("udp-message", (event) => { ... })
 * and parse event.payload into a Telemetry snapshot.
 */
export function useTauriTelemetry(): void {
  const store = useTelemetryStore.getState();

  useEffect(() => {
    startMockTelemetry(store);

    return () => {
      stopMockTelemetry();
    };
    // store reference is stable (Zustand getState)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
