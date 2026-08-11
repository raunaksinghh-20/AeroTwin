/* ────────────────────────────────────────────────────────
   AEROTWIN — ALTITUDE CHART
   Configures TelemetryLineChart for altitude data.
   ──────────────────────────────────────────────────────── */

import { useTelemetryStore } from "../../store/telemetryStore";
import TelemetryLineChart from "../../charts/TelemetryLineChart";


export default function AltitudeChart() {
  const altitudeData = useTelemetryStore((s) => s.history.altitude);

  return (
    <TelemetryLineChart
      data={altitudeData}
      color="var(--chart-live)"
      unit="m"
      height={180}
      showGrid
      showTooltip
    />
  );
}
