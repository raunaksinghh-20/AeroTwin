/* ────────────────────────────────────────────────────────
   AEROTWIN — STATUS CHIP
   Shape + color indicator:
   ✓ NOMINAL   ▲ CAUTION   ✕ CRITICAL
   Never relies on color alone (accessibility).
   ──────────────────────────────────────────────────────── */

import type { AlertSeverity } from "../../types/telemetry";

import styles from "./StatusChip.module.css";


const ICONS: Record<AlertSeverity, string> = {
  nominal:  "✓",
  caution:  "▲",
  critical: "✕",
};

const DEFAULT_LABELS: Record<AlertSeverity, string> = {
  nominal:  "NOMINAL",
  caution:  "CAUTION",
  critical: "CRITICAL",
};


interface StatusChipProps {
  status: AlertSeverity;
  /** Custom label; defaults to NOMINAL / CAUTION / CRITICAL. */
  label?: string;
  className?: string;
}

export default function StatusChip({
  status,
  label,
  className = "",
}: StatusChipProps) {
  return (
    <span
      className={`${styles.chip} ${styles[status]} ${className}`}
      role="status"
    >
      <span className={styles.icon} aria-hidden="true">{ICONS[status]}</span>
      {label ?? DEFAULT_LABELS[status]}
    </span>
  );
}
