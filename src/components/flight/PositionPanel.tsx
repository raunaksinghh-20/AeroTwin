/* ────────────────────────────────────────────────────────
   AEROTWIN — POSITION PANEL
   GPS coordinate display, satellite count, grid-dot
   map with amber pin.
   ──────────────────────────────────────────────────────── */

import { Satellite } from "lucide-react";
import { useTelemetryStore } from "../../store/telemetryStore";

import styles from "./PositionPanel.module.css";


export default function PositionPanel() {
  const { latitude, longitude, satellites } = useTelemetryStore(
    (s) => s.current.gps,
  );

  return (
    <div className={styles.panel}>
      <div className={styles.headerRow}>
        <div className={styles.coords} data-live="true">
          {latitude.toFixed(4)}, {longitude.toFixed(4)}
        </div>

        <div className={styles.satRow}>
          <Satellite size={13} strokeWidth={1.6} aria-hidden="true" />
          <span className={styles.satValue} data-live="true">
            {satellites}
          </span>
          <span className={styles.satLabel}>SAT</span>
        </div>
      </div>

      <div className={styles.mapBox}>
        <div className={styles.mapPin} />
      </div>
    </div>
  );
}
