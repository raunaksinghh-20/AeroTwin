/* ────────────────────────────────────────────────────────
   AEROTWIN — DASHBOARD PAGE
   Assembles all flight, power, and system panels into
   a responsive instrument-panel grid.
   ──────────────────────────────────────────────────────── */

/* ── Dashboard Page ────────────────────────────────────── */
import {
  Gauge as GaugeIcon,
  Battery,
  Flame,
  Zap,
  WifiOff,
} from "lucide-react";

import { useTelemetryStore } from "../store/telemetryStore";

/* ── Common ────────────────────────────────────────────── */
import StatCard from "../components/common/StatCard";
import InstrumentCard from "../components/common/InstrumentCard";
import EmergencyAbortCard from "../components/common/EmergencyAbortCard";
import SolenoidValveCard from "../components/common/SolenoidValveCard";

/* ── Flight ────────────────────────────────────────────── */
import ThrottleControlPanel from "../components/flight/ThrottleControlPanel";

/* ── Power ─────────────────────────────────────────────── */
import BatteryPanel from "../components/power/BatteryPanel";
import FuelCellPanel from "../components/power/FuelCellPanel";
import DcBusPanel from "../components/power/DcBusPanel";
import PowerContribution from "../components/power/PowerContribution";
import MotorPowerPanel from "../components/power/MotorPowerPanel";

/* ── System ────────────────────────────────────────────── */
import SystemStatusStrip from "../components/system/SystemStatusStrip";
import AlertsSummary from "../components/system/AlertsSummary";

import styles from "./Dashboard.module.css";


export default function Dashboard() {
  const flight = useTelemetryStore((s) => s.current.flight);
  const battery = useTelemetryStore((s) => s.current.battery);
  const fuelCell = useTelemetryStore((s) => s.current.fuelCell);
  const connectionStatus = useTelemetryStore((s) => s.connectionStatus);

  const liveStatus = connectionStatus === "connected" ? "live" as const : "lost" as const;

  // Battery bar for StatCard
  const batteryBar = (
    <div className={styles.battBar}>
      <div
        className={styles.battFill}
        style={{
          width: `${battery.percentage}%`,
          background:
            battery.percentage <= 15
              ? "var(--status-critical)"
              : battery.percentage <= 30
                ? "var(--status-caution)"
                : "var(--status-nominal)",
        }}
      />
    </div>
  );

  // H2 Fuel Tank bar for StatCard
  const h2TankBar = (
    <div className={styles.battBar}>
      <div
        className={styles.battFill}
        style={{
          width: `${fuelCell.tankPercentage}%`,
          background:
            fuelCell.tankPercentage <= 15
              ? "var(--status-critical)"
              : fuelCell.tankPercentage <= 30
                ? "var(--status-caution)"
                : "var(--status-nominal)",
        }}
      />
    </div>
  );

  return (
    <div className={`${styles.dashboard} ${connectionStatus !== "connected" ? styles.noScroll : ""}`}>

      {/* ── Signal Lost Backdrop Overlay ───────────────────── */}
      {connectionStatus !== "connected" && (
        <div className={styles.noSignalOverlay}>
          <div className={styles.noSignalCard}>
            <div className={styles.noSignalTitle}>
              <WifiOff size={20} strokeWidth={2} />
              NO TELEMETRY SIGNAL
            </div>
            <div className={styles.noSignalDesc}>
              Telemetry stream lost or ESP32 ground unit offline. Ground control station is listening for UDP telemetry broadcast on port <strong>8888</strong>.
            </div>
            <div className={styles.noSignalBadge}>
              SEARCHING FOR UDP BROADCAST (:8888)...
            </div>
          </div>
        </div>
      )}

      {/* ════════════════ ROW 1 — STAT CARDS ════════════════ */}
      <section className={styles.statRow}>
        <SolenoidValveCard />
        <StatCard
          label="SPD · M/S"
          value={flight.speed.toFixed(1)}
          unit="m/s"
          icon={GaugeIcon}
        />
        <StatCard
          label="BATT · %"
          value={battery.percentage.toFixed(0)}
          unit="%"
          icon={Battery}
          sub={batteryBar}
        />
        <StatCard
          label="H₂ TANK · %"
          value={fuelCell.tankPercentage.toFixed(0)}
          unit="%"
          icon={Flame}
          sub={h2TankBar}
        />
        <EmergencyAbortCard />
      </section>

      {/* ════════════════ ROW 2 — POWER PANELS ══════════════ */}
      <section className={styles.powerRow}>
        <InstrumentCard
          label="BATTERY (LiPo)"
          live={liveStatus}
          bracketFrame
          labelRight={<Zap size={12} strokeWidth={1.6} style={{ color: "var(--chart-battery)" }} />}
        >
          <BatteryPanel />
        </InstrumentCard>

        <InstrumentCard
          label="FUEL CELL (H₂)"
          live={liveStatus}
          bracketFrame
          labelRight={<Zap size={12} strokeWidth={1.6} style={{ color: "var(--chart-fuel-cell)" }} />}
        >
          <FuelCellPanel />
        </InstrumentCard>

        <InstrumentCard
          label="DC BUS (52V)"
          live={liveStatus}
          bracketFrame
          labelRight={<Zap size={12} strokeWidth={1.6} style={{ color: "var(--chart-dc-bus)" }} />}
        >
          <DcBusPanel />
        </InstrumentCard>
      </section>

      {/* ════════════════ ROW 4 — ATTITUDE + MOTOR POWER ════════ */}
      <section className={styles.flightRow}>
        <InstrumentCard
          label="THROTTLE CONTROL"
          live={liveStatus}
          bracketFrame
          className={styles.attitudeCard}
        >
          <ThrottleControlPanel />
        </InstrumentCard>

        <InstrumentCard
          label="MOTOR POWER"
          live={liveStatus}
          bracketFrame
          className={styles.altitudeCard}
        >
          <MotorPowerPanel />
        </InstrumentCard>
      </section>

      {/* ════════════════ ROW 5 & 6 — CONTRIBUTION, ALERTS & SYSTEM STATUS ═════ */}
      <div className={styles.bottomSection}>
        <div className={styles.leftCol}>
          <InstrumentCard label="POWER SOURCE CONTRIBUTION">
            <PowerContribution />
          </InstrumentCard>

          <InstrumentCard label="SYSTEM STATUS">
            <SystemStatusStrip />
          </InstrumentCard>
        </div>

        <div className={styles.rightCol}>
          <InstrumentCard label="ALERTS" className={styles.alertsCardTall}>
            <AlertsSummary />
          </InstrumentCard>
        </div>
      </div>

    </div>
  );
}
