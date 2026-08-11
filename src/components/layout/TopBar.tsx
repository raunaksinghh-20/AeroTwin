/* ────────────────────────────────────────────────────────
   AEROTWIN — TOP BAR
   Persistent header: brand, page title, connection
   status, and mission clock.
   ──────────────────────────────────────────────────────── */

import { Radio, WifiOff } from "lucide-react";

import { useTelemetryStore } from "../../store/telemetryStore";
import { useMissionClock } from "../../hooks/useMissionClock";

import styles from "./TopBar.module.css";


interface TopBarProps {
  pageTitle?: string;
}

export default function TopBar({ pageTitle = "DASHBOARD" }: TopBarProps) {
  const connectionStatus = useTelemetryStore((s) => s.connectionStatus);
  const missionTime = useMissionClock();

  const connected = connectionStatus === "connected";
  const udpPort = 14550;

  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <span className={styles.brand}>AEROTWIN</span>

        <span className={styles.pageTitle}>{pageTitle}</span>

        <div
          className={`${styles.connection} ${
            !connected ? styles.connectionLost : ""
          }`}
        >
          {connected ? (
            <Radio size={14} strokeWidth={1.6} aria-hidden="true" />
          ) : (
            <WifiOff size={14} strokeWidth={1.6} aria-hidden="true" />
          )}

          <span className={styles.statusDot} />

          <span className={styles.connectionText}>
            UDP :{udpPort} — {connected ? "LINK OK" : "NO SIGNAL"}
          </span>
        </div>
      </div>

      <div className={styles.right}>
        <span className={styles.missionClock}>{missionTime}</span>
      </div>
    </header>
  );
}
