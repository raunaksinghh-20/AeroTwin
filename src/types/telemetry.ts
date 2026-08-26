/** Flight dynamics. */
export interface FlightData {
  altitude: number;   // metres
  speed: number;      // m/s
  roll: number;       // degrees
  pitch: number;      // degrees
  yaw: number;        // degrees (heading)
}


/** LiPo battery pack. */
export interface BatteryData {
  voltage: number;      // V
  current: number;      // A
  percentage: number;   // 0–100
  temperature: number;  // °C
}


/** Hydrogen fuel cell. */
export interface FuelCellData {
  voltage: number;        // V
  current: number;        // A
  temperature: number;    // °C
  tankPercentage: number; // 0–100 % (H2 fuel level)
  pressure: number;       // bar
}


/** DC bus. */
export interface DcBusData {
  voltage: number;  // V
  current: number;  // A
}


/** Motor power output (aggregate / backward-compatible). */
export interface MotorData {
  power: number;  // Watts (W)
}


/** Per-motor telemetry for individual motor monitoring. */
export interface MotorTelemetry {
  id: number;           // 1–5
  label: string;        // e.g. "MOTOR 1", "REAR THRUST MOTOR"
  rpm: number;          // revolutions per minute
  current: number;      // A
  voltage: number;      // V
  temperature: number;  // °C
  power: number;        // W
  status: "ok" | "warning" | "fault" | "offline";
}


/** Individual pressure sensor data. */
export interface PressureSensorData {
  pressure: number;     // bar
  status: "ok" | "warning" | "fault" | "offline";
}


/** Complete hydrogen system telemetry. */
export interface HydrogenSystemData {
  tankPressure: number;           // bar (raw tank output)
  sensor1: PressureSensorData;    // P1: at cylinder outlet
  regulatorOutput: number;        // bar (regulated pressure)
  sensor2: PressureSensorData;    // P2: at fuel cell inlet
  flowRate: number;               // L/min
  consumption: number;            // g/h
}


/** Component fault status for digital twin visualization. */
export type ComponentFaultStatus = "normal" | "warning" | "fault" | "disconnected" | "nodata";


/** Radio signal. */
export interface SignalData {
  rssi: number;  // dBm
}


/** One complete telemetry snapshot. */
export interface Telemetry {
  timestamp: number;  // Date.now()

  flight: FlightData;
  battery: BatteryData;
  fuelCell: FuelCellData;
  dcBus: DcBusData;
  signal: SignalData;
  motor: MotorData;

  /** Per-motor telemetry (5 motors: 4 lift + 1 rear thrust). */
  motors: MotorTelemetry[];

  /** Hydrogen system with dual pressure sensors. */
  hydrogenSystem: HydrogenSystemData;
}


/* ── History (for charts) ──────────────────────────────── */

/** A single data point with a timestamp for charting. */
export interface TelemetryPoint {
  time: number;      // seconds relative to mission start
  value: number;
}

/** Rolling time-series windows for each chartable metric. */
export interface TelemetryHistory {
  altitude: TelemetryPoint[];
  speed: TelemetryPoint[];

  batteryVoltage: TelemetryPoint[];
  batteryCurrent: TelemetryPoint[];

  fuelCellVoltage: TelemetryPoint[];
  fuelCellCurrent: TelemetryPoint[];

  dcBusVoltage: TelemetryPoint[];
  dcBusCurrent: TelemetryPoint[];

  motorPower: TelemetryPoint[];

  rssi: TelemetryPoint[];
}


/* ── Connection ────────────────────────────────────────── */

export type ConnectionStatus = "connected" | "disconnected" | "connecting";


/* ── Alert ─────────────────────────────────────────────── */

export type AlertSeverity = "nominal" | "caution" | "critical";

export interface Alert {
  id: string;
  severity: AlertSeverity;
  message: string;
  source: string;       // e.g. "Battery", "Fuel Cell", "Radio"
  timestamp: number;
}
