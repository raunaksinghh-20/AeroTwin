/* ────────────────────────────────────────────────────────
   AEROTWIN — MOTOR POWER PANEL
   Live readout & 30-second rolling trend chart for total
   motor power output.
   ──────────────────────────────────────────────────────── */

import { useTelemetryStore } from "../../store/telemetryStore";
import TelemetryLineChart from "../../charts/TelemetryLineChart";

import styles from "./PowerPanel.module.css";


export default function MotorPowerPanel() {
  const current = useTelemetryStore((s) => s.current);
  const motorHistory = useTelemetryStore((s) => s.history.motorPower);

  // Live motor power (Watts)
  const rawMotor = current.motor as unknown;
  const motorPower =
    typeof rawMotor === "number"
      ? rawMotor
      : current.motor?.power ??
        (current.battery.voltage * current.battery.current + current.fuelCell.voltage * current.fuelCell.current);

  const batteryPower = current.battery.voltage * current.battery.current;
  const fuelCellPower = current.fuelCell.voltage * current.fuelCell.current;

  return (
    <div className={styles.panel}>
      {/* Header with legend */}
      <div className={styles.legend}>
        <span className={styles.legendItem}>
          <span className={styles.legendDot} style={{ background: "var(--accent-cyan)" }} />
          Motor Power (W)
        </span>
      </div>

      {/* Chart */}
      <div className={styles.charts}>
        <TelemetryLineChart
          data={motorHistory}
          color="var(--accent-cyan)"
          unit="W"
          height={120}
        />
      </div>

      {/* Readout footer */}
      <div className={styles.readout}>
        <div className={styles.readoutItem}>
          <span className={styles.readoutValue} data-live="true">
            {motorPower.toFixed(0)} W
          </span>
          <span className={styles.readoutLabel}>MOTOR POWER</span>
        </div>
        <div className={styles.readoutItem}>
          <span className={styles.readoutValue} data-live="true">
            {batteryPower.toFixed(0)} W
          </span>
          <span className={styles.readoutLabel}>BATT DRAW</span>
        </div>
        <div className={styles.readoutItem}>
          <span className={styles.readoutValue} data-live="true">
            {fuelCellPower.toFixed(0)} W
          </span>
          <span className={styles.readoutLabel}>FC DRAW</span>
        </div>
      </div>
    </div>
  );
}
