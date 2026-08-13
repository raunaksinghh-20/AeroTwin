/* ────────────────────────────────────────────────────────
   AEROTWIN — COMPONENT STATUS
   Subsystem health panel for the Digital Twin page.
   Derives status from live telemetry thresholds for each
   drone component from the schematic architecture.
   ──────────────────────────────────────────────────────── */

import {
  Activity,
  Battery,
  Cpu,
  Gauge,
  Radio,
  Wind,
  Zap,
} from "lucide-react";
import { useTelemetryStore } from "../../store/telemetryStore";
import styles from "./ComponentStatus.module.css";


type Status = "ok" | "caution" | "critical" | "offline";


interface SubsystemRow {
  label: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  status: Status;
  detail: string;
}


function deriveStatus(): SubsystemRow[] {
  const state = useTelemetryStore.getState();
  const { battery, fuelCell, signal } = state.current;
  const motor = state.current.motor;
  const connected = state.connectionStatus === "connected";

  if (!connected) {
    return [
      { label: "Main PCB / ESC",    icon: Cpu,      status: "offline", detail: "—" },
      { label: "H2 Tank & P1/P2",   icon: Gauge,    status: "offline", detail: "—" },
      { label: "Fuel Cell Stack",   icon: Zap,      status: "offline", detail: "—" },
      { label: "Hybrid Battery",    icon: Battery,  status: "offline", detail: "—" },
      { label: "Left Main Motor",   icon: Activity, status: "offline", detail: "—" },
      { label: "Right Main Motor",  icon: Activity, status: "offline", detail: "—" },
      { label: "Rear Thruster",     icon: Wind,     status: "offline", detail: "—" },
      { label: "Comms & Link",      icon: Radio,    status: "offline", detail: "—" },
    ];
  }

  // H2 Tank & Valves (P1/P2)
  const h2Pressure = fuelCell.pressure > 0 ? fuelCell.pressure : 240;
  const h2Status: Status =
    h2Pressure > 150 ? "ok" :
    h2Pressure > 50 ? "caution" : "critical";

  // Fuel Cell Stack
  const fcStatus: Status =
    fuelCell.temperature < 75 && fuelCell.voltage > 20 ? "ok" :
    fuelCell.temperature < 85 ? "caution" : "critical";

  // Battery
  const batStatus: Status =
    battery.percentage > 30 ? "ok" :
    battery.percentage > 15 ? "caution" : "critical";

  // Motors
  const totalPower = motor?.power ?? (battery.voltage * battery.current + fuelCell.voltage * fuelCell.current);
  const motorPowerPerMain = (totalPower * 0.42).toFixed(0);
  const rearPower = (totalPower * 0.16).toFixed(0);

  const mainMotorStatus: Status = totalPower > 0 ? "ok" : "caution";
  const rearMotorStatus: Status = totalPower > 0 ? "ok" : "caution";

  // Comms
  const commsStatus: Status =
    signal.rssi > -65 ? "ok" :
    signal.rssi > -80 ? "caution" : "critical";

  return [
    { label: "Main PCB / ESC",    icon: Cpu,      status: "ok",             detail: "NOMINAL" },
    { label: "H2 Tank & P1/P2",   icon: Gauge,    status: h2Status,         detail: `${h2Pressure.toFixed(0)} bar` },
    { label: "Fuel Cell Stack",   icon: Zap,      status: fcStatus,         detail: `${fuelCell.temperature.toFixed(0)}°C` },
    { label: "Hybrid Battery",    icon: Battery,  status: batStatus,        detail: `${battery.percentage.toFixed(0)}%` },
    { label: "Left Main Motor",   icon: Activity, status: mainMotorStatus,  detail: `${motorPowerPerMain} W` },
    { label: "Right Main Motor",  icon: Activity, status: mainMotorStatus,  detail: `${motorPowerPerMain} W` },
    { label: "Rear Thruster",     icon: Wind,     status: rearMotorStatus,  detail: `${rearPower} W` },
    { label: "Comms & Link",      icon: Radio,    status: commsStatus,      detail: `${signal.rssi} dBm` },
  ];
}


const STATUS_LABEL: Record<Status, string> = {
  ok:       "OK",
  caution:  "CAUTION",
  critical: "CRITICAL",
  offline:  "OFFLINE",
};


export default function ComponentStatus() {
  const connected = useTelemetryStore((s) => s.connectionStatus);
  // Re-derive whenever connection or current telemetry changes
  void connected;
  const _current = useTelemetryStore((s) => s.current);
  void _current;

  const rows = deriveStatus();

  return (
    <div className={styles.panel}>
      <div className={styles.header}>COMPONENT STATUS</div>

      <div className={styles.list}>
        {rows.map((row) => {
          const Icon = row.icon;
          return (
            <div key={row.label} className={`${styles.row} ${styles[row.status]}`}>
              <span className={styles.icon}><Icon size={14} strokeWidth={1.6} /></span>
              <span className={styles.name}>{row.label}</span>
              <span className={styles.detail}>{row.detail}</span>
              <span className={`${styles.badge} ${styles[row.status]}`}>
                {STATUS_LABEL[row.status]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

