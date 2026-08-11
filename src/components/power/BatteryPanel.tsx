/* ────────────────────────────────────────────────────────
   AEROTWIN — BATTERY PANEL
   Battery voltage, current, percentage, power (V×I).
   Two TelemetryLineChart instances for V and I.
   ──────────────────────────────────────────────────────── */

import { useTelemetryStore } from "../../store/telemetryStore";
import TelemetryLineChart from "../../charts/TelemetryLineChart";

import styles from "./PowerPanel.module.css";


export default function BatteryPanel() {
  const battery = useTelemetryStore((s) => s.current.battery);
  const voltageHistory = useTelemetryStore((s) => s.history.batteryVoltage);
  const currentHistory = useTelemetryStore((s) => s.history.batteryCurrent);

  const power = battery.voltage * battery.current;

  return (
    <div className={styles.panel}>
      {/* Header with legend */}
      <div className={styles.legend}>
        <span className={styles.legendItem}>
          <span className={styles.legendDot} style={{ background: "var(--chart-battery)" }} />
          Voltage (V)
        </span>
        <span className={styles.legendItem}>
          <span className={styles.legendDot} style={{ background: "var(--status-caution)" }} />
          Current (A)
        </span>
      </div>

      {/* Charts */}
      <div className={styles.charts}>
        <TelemetryLineChart
          data={voltageHistory}
          color="var(--chart-battery)"
          unit="V"
          height={100}
        />
        <TelemetryLineChart
          data={currentHistory}
          color="var(--status-caution)"
          unit="A"
          height={100}
        />
      </div>

      {/* Footer readout */}
      <div className={styles.readout}>
        <div className={styles.readoutItem}>
          <span className={styles.readoutValue} data-live="true">
            {battery.voltage.toFixed(1)} V
          </span>
          <span className={styles.readoutLabel}>VOLTAGE</span>
        </div>
        <div className={styles.readoutItem}>
          <span className={styles.readoutValue} data-live="true">
            {battery.current.toFixed(1)} A
          </span>
          <span className={styles.readoutLabel}>CURRENT</span>
        </div>
        <div className={styles.readoutItem}>
          <span className={styles.readoutValue} data-live="true">
            {power.toFixed(0)} W
          </span>
          <span className={styles.readoutLabel}>POWER</span>
        </div>
      </div>
    </div>
  );
}
