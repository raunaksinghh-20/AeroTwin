/* ────────────────────────────────────────────────────────
   AEROTWIN — COMPONENT STATUS
   Subsystem health panel for the Digital Twin page.
   Covers all ~20 components of the hydrogen hybrid UAV.
   Click a row to highlight the component in the 3D view.
   ──────────────────────────────────────────────────────── */

import {
  Activity,
  Battery,
  Cpu,
  Gauge,
  Radio,
  Wind,
  Zap,
  Flame,
  Cable,
} from "lucide-react";
import { useTelemetryStore } from "../../store/telemetryStore";
import { useTwinViewStore } from "../../store/twinViewStore";
import styles from "./ComponentStatus.module.css";


type Status = "ok" | "caution" | "critical" | "offline";


interface SubsystemRow {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  status: Status;
  detail: string;
  group: "hydrogen" | "power" | "propulsion" | "comms";
}


function deriveStatus(): SubsystemRow[] {
  const state = useTelemetryStore.getState();
  const { battery, fuelCell, signal } = state.current;
  const motor = state.current.motor;
  const motors = state.current.motors;
  const h2 = state.current.hydrogenSystem;
  const connected = state.connectionStatus === "connected";

  if (!connected) {
    return [
      { id: "h2cylinder",  label: "H₂ Cylinder",        icon: Gauge,        status: "offline", detail: "—", group: "hydrogen" },
      { id: "sensor1",     label: "Pressure Sensor 1",   icon: Gauge,        status: "offline", detail: "—", group: "hydrogen" },
      { id: "regulator",   label: "H₂ Regulator",        icon: Gauge,        status: "offline", detail: "—", group: "hydrogen" },
      { id: "h2piping",    label: "H₂ Supply Line",      icon: Flame,        status: "offline", detail: "—", group: "hydrogen" },
      { id: "fuelcell",    label: "Fuel Cell Stack",      icon: Zap,          status: "offline", detail: "—", group: "hydrogen" },
      { id: "sensor2",     label: "Pressure Sensor 2",   icon: Gauge,        status: "offline", detail: "—", group: "hydrogen" },
      { id: "battery",     label: "Battery Pack",         icon: Battery,      status: "offline", detail: "—", group: "power" },
      { id: "pcb",         label: "Power Mgmt PCB",       icon: Cpu,          status: "offline", detail: "—", group: "power" },
      { id: "motor1",      label: "Motor 1 (LF)",         icon: Activity,     status: "offline", detail: "—", group: "propulsion" },
      { id: "motor2",      label: "Motor 2 (LR)",         icon: Activity,     status: "offline", detail: "—", group: "propulsion" },
      { id: "motor3",      label: "Motor 3 (RF)",         icon: Activity,     status: "offline", detail: "—", group: "propulsion" },
      { id: "motor4",      label: "Motor 4 (RR)",         icon: Activity,     status: "offline", detail: "—", group: "propulsion" },
      { id: "motor5",      label: "Rear Thruster",        icon: Wind,         status: "offline", detail: "—", group: "propulsion" },
      { id: "esc1",        label: "ESC 1",                icon: Cpu,          status: "offline", detail: "—", group: "propulsion" },
      { id: "esc2",        label: "ESC 2",                icon: Cpu,          status: "offline", detail: "—", group: "propulsion" },
      { id: "esc3",        label: "ESC 3",                icon: Cpu,          status: "offline", detail: "—", group: "propulsion" },
      { id: "esc4",        label: "ESC 4",                icon: Cpu,          status: "offline", detail: "—", group: "propulsion" },
      { id: "esc5",        label: "ESC 5",                icon: Cpu,          status: "offline", detail: "—", group: "propulsion" },
      { id: "wiring",      label: "Wiring Harness",       icon: Cable,        status: "offline", detail: "—", group: "power" },
      { id: "comms",       label: "Comms & Link",         icon: Radio,        status: "offline", detail: "—", group: "comms" },
    ];
  }

  // H₂ system
  const h2Pressure = h2?.tankPressure > 0 ? h2.tankPressure : (fuelCell.pressure > 0 ? fuelCell.pressure : 240);
  const h2Status: Status = h2Pressure > 150 ? "ok" : h2Pressure > 50 ? "caution" : "critical";
  const s1Status: Status = h2?.sensor1?.status === "ok" ? "ok" : h2?.sensor1?.status === "warning" ? "caution" : "ok";
  const s2Status: Status = h2?.sensor2?.status === "ok" ? "ok" : h2?.sensor2?.status === "warning" ? "caution" : "ok";

  // Fuel Cell
  const fcStatus: Status = fuelCell.temperature < 75 && fuelCell.voltage > 20 ? "ok" :
    fuelCell.temperature < 85 ? "caution" : "critical";

  // Battery
  const batStatus: Status = battery.percentage > 30 ? "ok" : battery.percentage > 15 ? "caution" : "critical";

  // Motors — derive from per-motor or aggregate
  const totalPower = motor?.power ?? (battery.voltage * battery.current + fuelCell.voltage * fuelCell.current);
  const perMotorPower = (totalPower * 0.21).toFixed(0);
  const rearPower = (totalPower * 0.16).toFixed(0);
  const motorStatus: Status = totalPower > 0 ? "ok" : "caution";

  // Comms
  const commsStatus: Status = signal.rssi > -65 ? "ok" : signal.rssi > -80 ? "caution" : "critical";

  const motorRow = (id: string, label: string, idx: number, isRear = false): SubsystemRow => {
    const m = motors?.[idx];
    const mStatus: Status = m ? (m.status === "ok" ? "ok" : m.status === "warning" ? "caution" : m.status === "fault" ? "critical" : "offline") : motorStatus;
    const mDetail = m ? `${m.rpm} RPM · ${m.power.toFixed(0)}W` : `${isRear ? rearPower : perMotorPower} W`;
    return { id, label, icon: isRear ? Wind : Activity, status: mStatus, detail: mDetail, group: "propulsion" };
  };

  return [
    { id: "h2cylinder",  label: "H₂ Cylinder",        icon: Gauge,       status: h2Status, detail: `${h2Pressure.toFixed(0)} bar`, group: "hydrogen" },
    { id: "sensor1",     label: "Pressure Sensor 1",   icon: Gauge,       status: s1Status, detail: `${(h2?.sensor1?.pressure ?? h2Pressure).toFixed(0)} bar`, group: "hydrogen" },
    { id: "regulator",   label: "H₂ Regulator",        icon: Gauge,       status: "ok",     detail: `${(h2?.regulatorOutput ?? 2.5).toFixed(1)} bar`, group: "hydrogen" },
    { id: "h2piping",    label: "H₂ Supply Line",      icon: Flame,       status: "ok",     detail: `${(h2?.flowRate ?? 0).toFixed(1)} L/min`, group: "hydrogen" },
    { id: "fuelcell",    label: "Fuel Cell Stack",      icon: Zap,         status: fcStatus, detail: `${fuelCell.temperature.toFixed(0)}°C · ${fuelCell.voltage.toFixed(1)}V`, group: "hydrogen" },
    { id: "sensor2",     label: "Pressure Sensor 2",   icon: Gauge,       status: s2Status, detail: `${(h2?.sensor2?.pressure ?? 2.5).toFixed(1)} bar`, group: "hydrogen" },
    { id: "battery",     label: "Battery Pack",         icon: Battery,     status: batStatus, detail: `${battery.percentage.toFixed(0)}% · ${battery.voltage.toFixed(1)}V`, group: "power" },
    { id: "pcb",         label: "Power Mgmt PCB",       icon: Cpu,         status: "ok",     detail: "NOMINAL", group: "power" },
    motorRow("motor1", "Motor 1 (LF)", 0),
    motorRow("motor2", "Motor 2 (LR)", 1),
    motorRow("motor3", "Motor 3 (RF)", 2),
    motorRow("motor4", "Motor 4 (RR)", 3),
    motorRow("motor5", "Rear Thruster", 4, true),
    { id: "esc1",        label: "ESC 1",                icon: Cpu,         status: motorStatus, detail: "—", group: "propulsion" },
    { id: "esc2",        label: "ESC 2",                icon: Cpu,         status: motorStatus, detail: "—", group: "propulsion" },
    { id: "esc3",        label: "ESC 3",                icon: Cpu,         status: motorStatus, detail: "—", group: "propulsion" },
    { id: "esc4",        label: "ESC 4",                icon: Cpu,         status: motorStatus, detail: "—", group: "propulsion" },
    { id: "esc5",        label: "ESC 5",                icon: Cpu,         status: motorStatus, detail: "—", group: "propulsion" },
    { id: "wiring",      label: "Wiring Harness",       icon: Cable,       status: "ok",     detail: "OK", group: "power" },
    { id: "comms",       label: "Comms & Link",         icon: Radio,       status: commsStatus, detail: `${signal.rssi} dBm`, group: "comms" },
  ];
}


const STATUS_LABEL: Record<Status, string> = {
  ok:       "OK",
  caution:  "CAUTION",
  critical: "CRITICAL",
  offline:  "OFFLINE",
};

const GROUP_LABELS: Record<string, string> = {
  hydrogen: "HYDROGEN SYSTEM",
  power: "POWER",
  propulsion: "PROPULSION",
  comms: "COMMUNICATIONS",
};


export default function ComponentStatus() {
  const connected = useTelemetryStore((s) => s.connectionStatus);
  void connected;
  const _current = useTelemetryStore((s) => s.current);
  void _current;

  const highlightedComponent = useTwinViewStore((s) => s.highlightedComponent);
  const setHighlightedComponent = useTwinViewStore((s) => s.setHighlightedComponent);

  const rows = deriveStatus();

  // Group rows by section
  const groups = ["hydrogen", "power", "propulsion", "comms"];

  return (
    <div className={styles.panel}>
      <div className={styles.header}>COMPONENT STATUS</div>

      <div className={styles.list}>
        {groups.map((g) => {
          const groupRows = rows.filter((r) => r.group === g);
          if (groupRows.length === 0) return null;
          return (
            <div key={g}>
              <div className={styles.groupLabel}>{GROUP_LABELS[g]}</div>
              {groupRows.map((row) => {
                const Icon = row.icon;
                const isActive = highlightedComponent === row.id;
                return (
                  <div
                    key={row.id}
                    className={`${styles.row} ${styles[row.status]} ${isActive ? styles.highlighted : ""}`}
                    onClick={() => setHighlightedComponent(isActive ? null : row.id)}
                    title={`Click to ${isActive ? "unhighlight" : "highlight"} in 3D view`}
                  >
                    <span className={styles.icon}><Icon size={12} strokeWidth={1.6} /></span>
                    <span className={styles.name}>{row.label}</span>
                    <span className={styles.detail}>{row.detail}</span>
                    <span className={`${styles.badge} ${styles[row.status]}`}>
                      {STATUS_LABEL[row.status]}
                    </span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
