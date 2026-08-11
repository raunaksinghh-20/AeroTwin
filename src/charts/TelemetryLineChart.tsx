/* ────────────────────────────────────────────────────────
   AEROTWIN — TELEMETRY LINE CHART
   Generic Recharts LineChart wrapper.  Domain components
   (AltitudeChart, BatteryPanel, etc.) configure this
   primitive — no Recharts config is duplicated.
   ──────────────────────────────────────────────────────── */

import { memo, useCallback } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import type { TelemetryPoint } from "../types/telemetry";

import chartStyles from "./TelemetryLineChart.module.css";


interface TelemetryLineChartProps {
  /** Array of { time, value } points. */
  data: TelemetryPoint[];

  /** Line color — defaults to live cyan. */
  color?: string;

  /** Y-axis domain [min, max]. */
  yDomain?: [number | "auto", number | "auto"];

  /** Unit label for the Y-axis and tooltip. */
  unit?: string;

  /** Chart height in px. */
  height?: number;

  /** Show grid lines. */
  showGrid?: boolean;

  /** Show hover tooltip. */
  showTooltip?: boolean;

  /** Label for the chart legend. */
  label?: string;
}

/** Custom tooltip renderer for the AeroTwin style. */
function AeroTooltip({
  active,
  payload,
  unit,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  unit?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className={chartStyles.tooltip}>
      <span className={chartStyles.tooltipValue}>
        {payload[0].value.toFixed(1)}
        {unit ? ` ${unit}` : ""}
      </span>
    </div>
  );
}


function TelemetryLineChart({
  data,
  color = "var(--chart-live)",
  yDomain,
  unit = "",
  height = 140,
  showGrid = true,
  showTooltip = true,
  label,
}: TelemetryLineChartProps) {
  const latestTime = data.length > 0 ? data[data.length - 1].time : 0;

  // Format x-axis labels as relative seconds
  const formatTime = useCallback(
    (tick: number) => {
      const ago = Math.round(latestTime - tick);
      if (ago <= 0) return "Now";
      return `-${ago}s`;
    },
    [latestTime],
  );

  return (
    <div className={chartStyles.wrap}>
      {label && <span className={chartStyles.label}>{label}</span>}

      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={data}
          margin={{ top: 8, right: 8, bottom: 0, left: -10 }}
        >
          {showGrid && (
            <CartesianGrid
              stroke="var(--line-rivet)"
              strokeDasharray="none"
              strokeOpacity={0.45}
              vertical={false}
            />
          )}

          <XAxis
            dataKey="time"
            tickFormatter={formatTime}
            stroke="var(--line-rivet)"
            tick={{ fill: "var(--text-instrument)", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            minTickGap={30}
          />

          <YAxis
            domain={yDomain ?? ["auto", "auto"]}
            stroke="var(--line-rivet)"
            tick={{ fill: "var(--text-instrument)", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            width={32}
            tickFormatter={(v: number) => v.toFixed(0)}
          />

          {showTooltip && (
            <Tooltip
              content={<AeroTooltip unit={unit} />}
              cursor={{
                stroke: "var(--text-instrument)",
                strokeDasharray: "3 3",
              }}
            />
          )}

          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
            activeDot={{
              r: 3,
              fill: color,
              stroke: "var(--bg-panel)",
              strokeWidth: 1.5,
            }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default memo(TelemetryLineChart);
