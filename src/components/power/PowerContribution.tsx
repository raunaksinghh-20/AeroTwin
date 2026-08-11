/* ────────────────────────────────────────────────────────
   AEROTWIN — POWER CONTRIBUTION
   Horizontal bar showing battery vs fuel cell
   contribution to total power.
   ──────────────────────────────────────────────────────── */

import { useTelemetryStore } from "../../store/telemetryStore";

import styles from "./PowerContribution.module.css";


export default function PowerContribution() {
  const battery = useTelemetryStore((s) => s.current.battery);
  const fuelCell = useTelemetryStore((s) => s.current.fuelCell);

  const batteryPower = battery.voltage * battery.current;
  const fuelCellPower = fuelCell.voltage * fuelCell.current;
  const totalPower = batteryPower + fuelCellPower;

  const batteryPct = totalPower > 0 ? (batteryPower / totalPower) * 100 : 50;
  const fuelCellPct = totalPower > 0 ? (fuelCellPower / totalPower) * 100 : 50;

  const dominant = batteryPct > fuelCellPct ? "BATTERY" : "FUEL CELL";

  return (
    <div className={styles.panel}>
      {/* Labels */}
      <div className={styles.labels}>
        <div className={styles.source}>
          <span className={styles.sourceLabel}>Battery</span>
          <span className={styles.sourceValue} data-live="true">
            {batteryPct.toFixed(0)}%
          </span>
        </div>
        <div className={styles.source} style={{ textAlign: "right" }}>
          <span className={styles.sourceLabel}>Fuel Cell</span>
          <span className={styles.sourceValue} data-live="true">
            {fuelCellPct.toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Horizontal bar */}
      <div className={styles.bar}>
        <div
          className={styles.barBattery}
          style={{ width: `${batteryPct}%` }}
          aria-label={`Battery: ${batteryPct.toFixed(0)}%`}
        />
        <div
          className={styles.barFuelCell}
          style={{ width: `${fuelCellPct}%` }}
          aria-label={`Fuel Cell: ${fuelCellPct.toFixed(0)}%`}
        />
      </div>

      {/* Dominant source */}
      <div className={styles.dominant}>
        DOMINANT SOURCE: <strong>{dominant}</strong>
      </div>

      {/* Power values */}
      <div className={styles.powers}>
        <div className={styles.powerItem}>
          <span className={styles.powerValue} data-live="true">
            {batteryPower.toFixed(0)} W
          </span>
          <span className={styles.powerLabel}>BATT POWER</span>
        </div>
        <div className={styles.powerItem}>
          <span className={styles.powerValue} data-live="true">
            {fuelCellPower.toFixed(0)} W
          </span>
          <span className={styles.powerLabel}>FC POWER</span>
        </div>
        <div className={styles.powerItem}>
          <span className={styles.powerValue} data-live="true">
            {totalPower.toFixed(0)} W
          </span>
          <span className={styles.powerLabel}>TOTAL</span>
        </div>
      </div>
    </div>
  );
}
