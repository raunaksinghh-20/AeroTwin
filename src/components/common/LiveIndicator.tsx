/* ────────────────────────────────────────────────────────
   AEROTWIN — LIVE INDICATOR
   6px breathing dot.
   • Cyan (breathing)  → live telemetry
   • Gray              → idle
   • Red               → connection lost
   ──────────────────────────────────────────────────────── */

import styles from "./LiveIndicator.module.css";


export type LiveStatus = "live" | "idle" | "lost";

interface LiveIndicatorProps {
  status?: LiveStatus;
  className?: string;
}

export default function LiveIndicator({
  status = "live",
  className = "",
}: LiveIndicatorProps) {
  const statusClass =
    status === "live"
      ? styles.live
      : status === "lost"
        ? styles.lost
        : styles.idle;

  return (
    <span
      className={`${styles.dot} ${statusClass} ${className}`}
      role="status"
      aria-label={
        status === "live"
          ? "Receiving telemetry"
          : status === "lost"
            ? "Connection lost"
            : "Idle"
      }
    />
  );
}
