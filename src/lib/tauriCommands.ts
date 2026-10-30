/* ────────────────────────────────────────────────────────
   AEROTWIN — TAURI COMMAND INTERFACE
   Bridge functions between React frontend and Rust backend.
   ──────────────────────────────────────────────────────── */

import { invoke } from "@tauri-apps/api/core";

/**
 * Sends request to Tauri Rust backend to re-bind UDP listener to the specified port.
 */
export async function updateBackendUdpPort(
  port: number
): Promise<{ success: boolean; message: string }> {
  try {
    const boundPort = await invoke<number>("change_udp_port", { port });
    return {
      success: true,
      message: `UDP socket successfully bound to port ${boundPort}`,
    };
  } catch (err) {
    const errorMsg = typeof err === "string" ? err : JSON.stringify(err);
    console.warn("[Tauri UDP] Failed to change UDP port:", errorMsg);
    return {
      success: false,
      message: errorMsg || `Failed to bind UDP socket on port ${port}`,
    };
  }
}

/**
 * Gets currently active bound UDP port from Rust backend.
 */
export async function getBackendUdpPort(): Promise<number | null> {
  try {
    return await invoke<number>("get_udp_port");
  } catch {
    return null;
  }
}

/**
 * Broadcasts a 2-byte throttle packet [throttleType, value] to port 8889.
 * @param throttleType 0 for Common Throttle, 1 for Rear Throttle
 * @param value Throttle percentage (0-100)
 */
export async function sendThrottleCommand(
  throttleType: 0 | 1,
  value: number
): Promise<void> {
  try {
    await invoke("send_throttle_command", {
      throttleType,
      value: Math.round(Math.max(0, Math.min(100, value))),
    });
  } catch (err) {
    console.warn("[Tauri UDP] Failed to send throttle command:", err);
  }
}

