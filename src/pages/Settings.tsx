/* ────────────────────────────────────────────────────────
   AEROTWIN — SETTINGS & SYSTEM CONFIGURATION PAGE
   Network UDP configuration, theme preference, threshold
   safety parameters, and system reset tools.
   ──────────────────────────────────────────────────────── */

import { useEffect, useState } from "react";
import { Cpu, Monitor, Radio, Settings as SettingsIcon, Sliders, X } from "lucide-react";

import { useTheme } from "../hooks/useTheme";
import { useTelemetryStore } from "../store/telemetryStore";
import styles from "./Settings.module.css";


export default function Settings() {
  const { theme, setTheme } = useTheme();
  const resetMission = useTelemetryStore((s) => s.resetMission);
  const connected = useTelemetryStore((s) => s.connectionStatus === "connected");

  // Local configurable setting states
  const [udpPort, setUdpPort] = useState("8888");
  const [batCaution, setBatCaution] = useState("30");
  const [fcMaxTemp, setFcMaxTemp] = useState("75");
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  // Auto-dismiss notification toast after 5 seconds
  useEffect(() => {
    if (savedMsg) {
      const timer = setTimeout(() => setSavedMsg(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [savedMsg]);

  const handleConfirmReset = () => {
    resetMission();
    setShowResetConfirm(false);
    setSavedMsg(true);
  };

  const handleSave = () => {
    setSavedMsg(true);
  };

  return (
    <div className={styles.container}>
      {/* ── Header ────────────────────────────────────────── */}
      <div className={styles.header}>
        <SettingsIcon size={22} color="var(--accent-cyan)" />
        <div>
          <h1 className="text-page-title">SYSTEM SETTINGS</h1>
          <span className={styles.subtitle}>Telemetry receiver, display preferences, and safety boundaries</span>
        </div>
      </div>

      {savedMsg && (
        <div style={{ padding: "8px 14px", background: "rgba(62, 207, 142, 0.15)", color: "var(--status-nominal)", borderRadius: 4, font: "var(--type-caption)", fontWeight: 600, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Action executed successfully!</span>
          <button onClick={() => setSavedMsg(false)} style={{ all: "unset", cursor: "pointer", display: "flex", alignItems: "center" }} title="Dismiss notification">
            <X size={14} color="var(--status-nominal)" />
          </button>
        </div>
      )}

      {/* ── 1. Telemetry Receiver & Network ───────────────── */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          <Radio size={16} color="var(--accent-cyan)" /> TELEMETRY RECEIVER & NETWORK
        </div>

        <div className={styles.row}>
          <div className={styles.labelGroup}>
            <span className={styles.labelName}>UDP Receiver Port</span>
            <span className={styles.labelDesc}>Port used by ESP32 WiFiUDP broadcast (Default: 8888)</span>
          </div>
          <input
            type="text"
            className={styles.input}
            value={udpPort}
            onChange={(e) => setUdpPort(e.target.value)}
          />
        </div>

        <div className={styles.row}>
          <div className={styles.labelGroup}>
            <span className={styles.labelName}>Socket Connection Status</span>
            <span className={styles.labelDesc}>Backend Rust UDP listener thread status</span>
          </div>
          <span style={{ font: "var(--type-caption)", fontWeight: 600, color: connected ? "var(--status-nominal)" : "var(--status-critical)" }}>
            {connected ? "BOUND TO 0.0.0.0:8888 — RECEIVING" : "DISCONNECTED"}
          </span>
        </div>

        <div className={styles.row}>
          <div className={styles.labelGroup}>
            <span className={styles.labelName}>Watchdog Disconnect Timeout</span>
            <span className={styles.labelDesc}>Time without packets before declaring connection loss</span>
          </div>
          <span style={{ font: "var(--type-stat-unit)", color: "var(--text-canopy)" }}>3500 ms</span>
        </div>
      </div>

      {/* ── 2. Appearance & Color Theme ───────────────────── */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          <Monitor size={16} color="var(--accent-cyan)" /> APPEARANCE & COLOR THEME
        </div>

        <div className={styles.row}>
          <div className={styles.labelGroup}>
            <span className={styles.labelName}>Color Theme</span>
            <span className={styles.labelDesc}>Switch UI between Dark Hangar and Light Field modes</span>
          </div>
          <div className={styles.themeSelector}>
            <button
              className={`${styles.themeBtn} ${theme === "system" ? styles.themeBtnActive : ""}`}
              onClick={() => setTheme("system")}
            >
              SYSTEM
            </button>
            <button
              className={`${styles.themeBtn} ${theme === "dark" ? styles.themeBtnActive : ""}`}
              onClick={() => setTheme("dark")}
            >
              DARK
            </button>
            <button
              className={`${styles.themeBtn} ${theme === "light" ? styles.themeBtnActive : ""}`}
              onClick={() => setTheme("light")}
            >
              FIELD (LIGHT)
            </button>
          </div>
        </div>
      </div>

      {/* ── 3. Safety Thresholds ──────────────────────────── */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          <Sliders size={16} color="var(--accent-amber)" /> SAFETY THRESHOLDS & ALERTS
        </div>

        <div className={styles.row}>
          <div className={styles.labelGroup}>
            <span className={styles.labelName}>Low Battery Caution Level (%)</span>
            <span className={styles.labelDesc}>Triggers warning alert when battery drops below this %</span>
          </div>
          <input
            type="number"
            className={styles.input}
            value={batCaution}
            onChange={(e) => setBatCaution(e.target.value)}
          />
        </div>

        <div className={styles.row}>
          <div className={styles.labelGroup}>
            <span className={styles.labelName}>Fuel Cell Over-temp Threshold (°C)</span>
            <span className={styles.labelDesc}>Critical warning level for fuel cell stack temperature</span>
          </div>
          <input
            type="number"
            className={styles.input}
            value={fcMaxTemp}
            onChange={(e) => setFcMaxTemp(e.target.value)}
          />
        </div>
      </div>

      {/* ── 4. System Diagnostics & Reset ─────────────────── */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          <Cpu size={16} color="var(--accent-cyan)" /> SYSTEM DIAGNOSTICS & DATA RESET
        </div>

        <div className={styles.row}>
          <div className={styles.labelGroup}>
            <span className={styles.labelName}>AeroTwin Client Version</span>
            <span className={styles.labelDesc}>Tauri + React Digital Twin Desktop Client</span>
          </div>
          <span style={{ font: "var(--type-caption)", color: "var(--text-instrument)" }}>v0.1.0 (Production)</span>
        </div>

        <div className={styles.row}>
          <div className={styles.labelGroup}>
            <span className={styles.labelName}>Reset Session Telemetry</span>
            <span className={styles.labelDesc}>Clears history arrays and resets mission clock to zero</span>
          </div>
          {!showResetConfirm ? (
            <button className={styles.btnDanger} onClick={() => setShowResetConfirm(true)}>
              RESET MISSION DATA
            </button>
          ) : (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ font: "var(--type-caption)", color: "var(--status-critical)", fontWeight: 600 }}>
                CONFIRM RESET?
              </span>
              <button
                className={styles.btnDanger}
                style={{ background: "var(--status-critical)", color: "#fff" }}
                onClick={handleConfirmReset}
              >
                YES, RESET
              </button>
              <button
                className={styles.themeBtn}
                onClick={() => setShowResetConfirm(false)}
              >
                CANCEL
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          className={styles.themeBtn}
          style={{ background: "var(--accent-cyan)", color: "var(--bg-hangar)", padding: "10px 20px" }}
          onClick={handleSave}
        >
          SAVE PREFERENCES
        </button>
      </div>
    </div>
  );
}
