/* ────────────────────────────────────────────────────────
   AEROTWIN — ALERTS & DIAGNOSTICS PAGE
   Live threshold alert tracking, system fault history,
   and operator diagnostic actions.
   ──────────────────────────────────────────────────────── */

import { useState } from "react";
import { AlertTriangle, CheckCircle, ShieldAlert, Trash2 } from "lucide-react";

import { useTelemetryStore } from "../store/telemetryStore";

import styles from "./Alerts.module.css";


export default function Alerts() {
  const alerts = useTelemetryStore((s) => s.alerts);
  const setAlerts = useTelemetryStore((s) => s.setAlerts);
  const connected = useTelemetryStore((s) => s.connectionStatus === "connected");

  const [filter, setFilter] = useState<"ALL" | "CRITICAL" | "CAUTION">("ALL");

  const criticalCount = alerts.filter((a) => a.severity === "critical").length;
  const cautionCount  = alerts.filter((a) => a.severity === "caution").length;

  const filteredAlerts = alerts.filter((a) => {
    if (filter === "CRITICAL") return a.severity === "critical";
    if (filter === "CAUTION") return a.severity === "caution";
    return true;
  });

  const clearAlerts = () => {
    setAlerts([]);
  };

  return (
    <div className={styles.container}>
      {/* ── Header ────────────────────────────────────────── */}
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <AlertTriangle size={22} color="var(--accent-amber)" />
          <div>
            <h1 className="text-page-title">ALERTS & DIAGNOSTICS</h1>
            <span className={styles.subtitle}>Subsystem threshold monitoring and safety alerts</span>
          </div>
        </div>

        {alerts.length > 0 && (
          <button className={styles.btn} onClick={clearAlerts}>
            <Trash2 size={13} style={{ marginRight: 4 }} /> CLEAR ACKNOWLEDGED ALERTS
          </button>
        )}
      </div>

      {/* ── Summary Cards ─────────────────────────────────── */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>SYSTEM HEALTH</span>
          <span className={styles.statValue} style={{ color: criticalCount > 0 ? "var(--status-critical)" : cautionCount > 0 ? "var(--status-caution)" : "var(--status-nominal)" }}>
            {criticalCount > 0 ? "CRITICAL" : cautionCount > 0 ? "CAUTION" : "NOMINAL"}
          </span>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statLabel}>CRITICAL ALERTS</span>
          <span className={styles.statValue} style={{ color: criticalCount > 0 ? "var(--status-critical)" : "var(--text-canopy)" }}>
            {criticalCount}
          </span>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statLabel}>CAUTION ALERTS</span>
          <span className={styles.statValue} style={{ color: cautionCount > 0 ? "var(--status-caution)" : "var(--text-canopy)" }}>
            {cautionCount}
          </span>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statLabel}>UDP STREAM STATUS</span>
          <span className={styles.statValue} style={{ color: connected ? "var(--status-nominal)" : "var(--status-critical)" }}>
            {connected ? "ONLINE" : "NO SIGNAL"}
          </span>
        </div>
      </div>

      {/* ── Filter Bar ────────────────────────────────────── */}
      <div className={styles.filterBar}>
        <div className={styles.tabs}>
          {(["ALL", "CRITICAL", "CAUTION"] as const).map((tab) => (
            <button
              key={tab}
              className={`${styles.tab} ${filter === tab ? styles.tabActive : ""}`}
              onClick={() => setFilter(tab)}
            >
              {tab} ({tab === "ALL" ? alerts.length : tab === "CRITICAL" ? criticalCount : cautionCount})
            </button>
          ))}
        </div>
      </div>

      {/* ── Alerts Log Table ──────────────────────────────── */}
      <div className={styles.panel}>
        {filteredAlerts.length === 0 ? (
          <div className={styles.emptyState}>
            <CheckCircle size={32} color="var(--status-nominal)" style={{ marginBottom: 12 }} />
            <div>No active {filter !== "ALL" ? filter.toLowerCase() : ""} alerts detected. All systems operating within nominal limits.</div>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>SEVERITY</th>
                <th>SUBSYSTEM</th>
                <th>MESSAGE / THRESHOLD VIOLATION</th>
                <th>TIME</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredAlerts.map((alert) => {
                const timeStr = new Date(alert.timestamp).toLocaleTimeString();
                return (
                  <tr key={alert.id}>
                    <td>
                      <span className={`${styles.badge} ${alert.severity === "critical" ? styles.badgeCritical : styles.badgeCaution}`}>
                        {alert.severity.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{alert.source}</td>
                    <td>{alert.message}</td>
                    <td>{timeStr}</td>
                    <td>
                      <button
                        className={styles.btn}
                        style={{ padding: "4px 8px", fontSize: 10 }}
                        onClick={() => setAlerts(alerts.filter((a) => a.id !== alert.id))}
                      >
                        ACKNOWLEDGE
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── System Safety Protocols Reference ─────────────── */}
      <div className={styles.panel}>
        <div style={{ font: "var(--type-panel-label)", color: "var(--text-instrument)", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
          <ShieldAlert size={16} color="var(--accent-amber)" /> AUTOMATED SAFETY PROTOCOLS
        </div>
        <div style={{ font: "var(--type-body)", color: "var(--text-instrument)", lineHeight: 1.6 }}>
          • <strong>Low Battery (&lt; 15%):</strong> Automatic Return-to-Home (RTH) procedure triggered by flight controller.<br />
          • <strong>Fuel Cell Over-temp (&gt; 75°C):</strong> DC bus shifts load 100% to battery pack to allow fuel cell stack cooling.<br />
          • <strong>Radio Loss (&lt; -85 dBm):</strong> Failsafe mode holds loiter position for 10 seconds before initiating auto-land sequence.
        </div>
      </div>
    </div>
  );
}
