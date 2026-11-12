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
  // Filter and compute relative time points (-30 to 0) relative to the latest data point
  const chartData = useMemo(() => {
    if (data.length === 0) return [];

    const latestTime = data[data.length - 1].time;

    // Only keep data points recorded within the 30-second window
    const filtered = data.filter((d) => d.time >= latestTime - 30);
    if (filtered.length === 0) return [];

    const result: Array<{ relTime: number; value: number | null }> = [];

    for (let i = 0; i < filtered.length; i++) {
      const point = filtered[i];
      // Quantize to avoid micro float jitter and enforce strict monotonicity
      const relTime = Number((point.time - latestTime).toFixed(2));

      if (i > 0) {
        const prevPoint = filtered[i - 1];
        // If there is a time gap > 3s (e.g., from tab inactivity/background throttling),
        // insert a null point to break the line graph segment cleanly.
        if (point.time - prevPoint.time > 3) {
          result.push({
            relTime: Number((prevPoint.time - latestTime + 0.05).toFixed(2)),
            value: null,
          });
        }
      }

      // Avoid duplicate x coordinates
      if (result.length === 0 || result[result.length - 1].relTime < relTime) {
        result.push({
          relTime,
          value: point.value,
        });
      } else {
        // If same timestamp, update with latest value
        result[result.length - 1].value = point.value;
      }
    }

    return result;
  }, [data]);

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
            domain={yDomain ?? [(dataMin: number) => Math.min(0, dataMin), (dataMax: number) => Math.max(dataMax * 1.15, 1)]}
            stroke="var(--line-rivet)"
            tick={{ fill: "var(--text-instrument)", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            width={40}
            tickFormatter={(v: number) => {
              if (v === 0) return "0";
              if (Math.abs(v) < 0.1) return v.toFixed(3);
              if (Math.abs(v) < 1) return v.toFixed(2);
              if (Math.abs(v) < 10) return v.toFixed(1);
              return v.toFixed(0);
            }}
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
            type="linear"
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
