/* ────────────────────────────────────────────────────────
   AEROTWIN — TELEMETRY TYPES
   Single normalised domain type for all telemetry data.
   ──────────────────────────────────────────────────────── */


/** Flight dynamics. */
export interface FlightData {
  altitude: number;   // metres
  speed: number;      // m/s
  roll: number;       // degrees
  pitch: number;      // degrees
  yaw: number;        // degrees (heading)
}


/** GPS fix. */
export interface GpsData {
  latitude: number;
  longitude: number;
  satellites: number;
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
  voltage: number;      // V
  current: number;      // A
  temperature: number;  // °C
}


/** DC bus. */
export interface DcBusData {
  voltage: number;  // V
  current: number;  // A
}


/** Radio signal. */
export interface SignalData {
  rssi: number;  // dBm (typically −30 … −90)
}


/** One complete telemetry snapshot. */
export interface Telemetry {
  timestamp: number;  // Date.now()

  flight: FlightData;
  gps: GpsData;
  battery: BatteryData;
  fuelCell: FuelCellData;
  dcBus: DcBusData;
  signal: SignalData;
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
  source: string;       // e.g. "Battery", "Fuel Cell", "GPS"
  timestamp: number;
}
