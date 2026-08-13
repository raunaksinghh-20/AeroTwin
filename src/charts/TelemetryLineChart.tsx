/* ────────────────────────────────────────────────────────
   AEROTWIN — TELEMETRY LINE CHART
   Generic Recharts LineChart wrapper.  Domain components
   (AltitudeChart, BatteryPanel, etc.) configure this
   primitive — no Recharts config is duplicated.
   ──────────────────────────────────────────────────────── */

import { memo, useMemo } from "react";
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

const X_TICKS = [-30, -20, -10, 0];

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
  payload?: Array<{ value: number | null }>;
  unit?: string;
}) {
  if (!active || !payload?.length || payload[0].value === null || payload[0].value === undefined) {
    return null;
  }

  return (
    <div className={chartStyles.tooltip}>
      <span className={chartStyles.tooltipValue}>
        {payload[0].value.toFixed(1)}
        {unit ? ` ${unit}` : ""}
      </span>
    </div>
  );
}

/** Custom tick renderer for perfectly spaced and edge-aligned time labels. */
function CustomXAxisTick(props: {
  x?: number;
  y?: number;
  payload?: { value: number };
}) {
  const { x = 0, y = 0, payload } = props;
  if (!payload) return null;
  const val = payload.value;

  let textAnchor: "start" | "middle" | "end" = "middle";
  if (val === -30) textAnchor = "start";
  if (val === 0) textAnchor = "end";

  const label = val === 0 ? "Now" : `${val}s`;

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={12}
        textAnchor={textAnchor}
        fill="var(--text-instrument)"
        fontSize={10}
      >
        {label}
      </text>
    </g>
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

  // Filter and compute relative time points (-30 to 0) relative to the latest data point
  const chartData = useMemo(() => {
    if (data.length === 0) return [];

    // Only keep data points recorded within the 30-second window
    const filtered = data.filter((d) => d.time >= latestTime - 30);
    if (filtered.length === 0) return [];

    const result: Array<{ relTime: number; value: number | null }> = [];

    for (let i = 0; i < filtered.length; i++) {
      const point = filtered[i];
      const relTime = point.time - latestTime;

      if (i > 0) {
        const prevPoint = filtered[i - 1];
        // If there is a time gap > 3s (e.g., from tab inactivity/background throttling),
        // insert a null point to break the line graph segment cleanly.
        if (point.time - prevPoint.time > 3) {
          result.push({
            relTime: prevPoint.time - latestTime + 0.01,
            value: null,
          });
        }
      }

      result.push({
        relTime,
        value: point.value,
      });
    }

    return result;
  }, [data, latestTime]);

  return (
    <div className={chartStyles.wrap}>
      {label && <span className={chartStyles.label}>{label}</span>}

      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={chartData}
          margin={{ top: 18, right: 8, bottom: 0, left: 2 }}
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
            dataKey="relTime"
            type="number"
            domain={[-30, 0]}
            ticks={X_TICKS}
            tick={<CustomXAxisTick />}
            stroke="var(--line-rivet)"
            tickLine={false}
            axisLine={false}
            interval={0}
            allowDataOverflow={true}
          />

          <YAxis
            domain={yDomain ?? ["auto", "auto"]}
            stroke="var(--line-rivet)"
            tick={{ fill: "var(--text-instrument)", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            width={36}
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
            connectNulls={false}
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
