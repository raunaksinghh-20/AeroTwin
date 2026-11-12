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
 * Broadcasts a 2-byte command packet [commandType, value] to port 8889.
 * @param commandType 0 = Common Throttle, 1 = Rear Throttle, 2 = Solenoid Valve, 3 = Arm
 * @param value Throttle percentage (0-100), Solenoid state (0 = OFF, 1 = ON), or Arm state (0 = DISARM, 1 = ARM)
 */
export async function sendCommand(
  commandType: 0 | 1 | 2 | 3,
  value: number
): Promise<void> {
  try {
    await invoke("send_command", {
      commandType,
      value: Math.round(Math.max(0, Math.min(255, value))),
    });
  } catch (err) {
    console.warn("[Tauri UDP] Failed to send command:", err);
  }
}

/**
 * Backward compatibility alias for throttle commands.
 */
export const sendThrottleCommand = (
  throttleType: 0 | 1,
  value: number
) => sendCommand(throttleType, value);

