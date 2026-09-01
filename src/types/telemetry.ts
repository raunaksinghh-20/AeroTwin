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


/** GPS positioning. */
export interface GpsData {
  latitude: number;   // degrees
  longitude: number;  // degrees
  satellites: number; // count
}


/** Radio signal. */
export interface SignalData {
  rssi: number;  // dBm
}


/** Component fault status for digital twin visualization. */
export type ComponentFaultStatus = "normal" | "warning" | "fault" | "disconnected" | "nodata";


/** One complete telemetry snapshot matching received ESP32 packet. */
export interface Telemetry {
  timestamp: number;  // epoch ms

  flight: FlightData;
  gps: GpsData;
  battery: BatteryData;
  fuelCell: FuelCellData;
  dcBus: DcBusData;
  signal: SignalData;
  motor: MotorData;
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
