/* ────────────────────────────────────────────────────────
   AEROTWIN — TWIN TELEMETRY OVERLAY
   HUD-style readouts positioned around the viewport.
   ──────────────────────────────────────────────────────── */

import { useTelemetryStore } from "../../store/telemetryStore";
import styles from "./TwinTelemetryOverlay.module.css";


export default function TwinTelemetryOverlay() {
  const flight = useTelemetryStore((s) => s.current.flight);
  const gps    = useTelemetryStore((s) => s.current.gps);
  const batt   = useTelemetryStore((s) => s.current.battery);
  const signal = useTelemetryStore((s) => s.current.signal);
  const motor  = useTelemetryStore((s) => s.current.motor);
  const connected = useTelemetryStore((s) => s.connectionStatus === "connected");

  return (
    <>
      {/* ── Left: Orientation ──────────────────────────── */}
      <div className={styles.left}>
        <div className={styles.readout}>
          <span className={styles.label}>ROLL</span>
          <span className={styles.value}>{flight.roll.toFixed(1)}°</span>
        </div>
        <div className={styles.readout}>
          <span className={styles.label}>PITCH</span>
          <span className={styles.value}>{flight.pitch.toFixed(1)}°</span>
        </div>
        <div className={styles.readout}>
          <span className={styles.label}>YAW</span>
          <span className={styles.value}>{flight.yaw.toFixed(0)}°</span>
        </div>
      </div>

      {/* ── Right: Flight Data ─────────────────────────── */}
      <div className={styles.right}>
        <div className={styles.readout}>
          <span className={styles.label}>ALT</span>
          <span className={styles.value}>{flight.altitude.toFixed(1)} m</span>
        </div>
        <div className={styles.readout}>
          <span className={styles.label}>SPD</span>
          <span className={styles.value}>{flight.speed.toFixed(1)} m/s</span>
        </div>
        <div className={styles.readout}>
          <span className={styles.label}>BAT</span>
          <span className={styles.value}>{batt.percentage.toFixed(0)} %</span>
        </div>
        <div className={styles.readout}>
          <span className={styles.label}>PWR</span>
          <span className={styles.value}>{(motor?.power ?? 0).toFixed(0)} W</span>
        </div>
        <div className={styles.readout}>
          <span className={styles.label}>RSSI</span>
          <span className={styles.value}>{signal.rssi} dBm</span>
        </div>
        <div className={styles.readout}>
          <span className={styles.label}>GPS</span>
          <span className={styles.value}>
            {gps.latitude.toFixed(4)}, {gps.longitude.toFixed(4)}
          </span>
        </div>
        <div className={styles.readout}>
          <span className={styles.label}>SAT</span>
          <span className={styles.value}>{gps.satellites}</span>
        </div>
      </div>

      {/* ── Status badge ───────────────────────────────── */}
      <div className={`${styles.statusBadge} ${connected ? styles.live : styles.offline}`}>
        <span className={styles.dot} />
        {connected ? "LIVE" : "NO SIGNAL"}
      </div>
    </>
  );
}
