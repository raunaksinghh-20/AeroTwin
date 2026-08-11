/* ────────────────────────────────────────────────────────
   AEROTWIN — STAT CARD
   Compact large-number instrument readout.
   Used for ALT, SPD, BATT%, GPS SAT, FLIGHT TIME, etc.
   ──────────────────────────────────────────────────────── */

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import styles from "./StatCard.module.css";


interface StatCardProps {
  /** Placard label, e.g. "ALT · M" */
  label: string;

  /** Large numeric value. */
  value: string | number;

  /** Unit suffix, e.g. "m", "m/s", "%" */
  unit?: string;

  /** Optional Lucide icon component. */
  icon?: LucideIcon;

  /** Optional sub-content below the value (e.g. battery bar). */
  sub?: ReactNode;
}

export default function StatCard({
  label,
  value,
  unit,
  icon: Icon,
  sub,
}: StatCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.label}>
        {Icon && <Icon size={14} strokeWidth={1.6} aria-hidden="true" />}
        <span>{label}</span>
      </div>

      <div className={styles.value} data-live="true">
        {value}
        {unit && <span className={styles.unit}>{unit}</span>}
      </div>

      {sub && <div className={styles.sub}>{sub}</div>}
    </div>
  );
}
