import { useState, useEffect, useRef } from "react";
import { useTelemetryStore } from "../../store/telemetryStore";
import { sendThrottleCommand } from "../../lib/tauriCommands";
import styles from "./ThrottleControlPanel.module.css";

interface ThrottleControlPanelProps {
  onRearThrottleChange?: (value: number) => void;
  onCommonThrottleChange?: (value: number) => void;
}

export default function ThrottleControlPanel({
  onRearThrottleChange,
  onCommonThrottleChange,
}: ThrottleControlPanelProps) {
  const [rearThrottle, setRearThrottle] = useState<number>(0);
  const [commonThrottle, setCommonThrottle] = useState<number>(0);

  const connectionStatus = useTelemetryStore((s) => s.connectionStatus);
  const prevConnectionStatus = useRef(connectionStatus);

  // When reconnecting to the network / drone telemetry, reset throttle values to 0
  useEffect(() => {
    if (prevConnectionStatus.current !== "connected" && connectionStatus === "connected") {
      setRearThrottle(0);
      setCommonThrottle(0);
      sendThrottleCommand(0, 0);
      sendThrottleCommand(1, 0);
      onCommonThrottleChange?.(0);
      onRearThrottleChange?.(0);
    }
    prevConnectionStatus.current = connectionStatus;
  }, [connectionStatus, onCommonThrottleChange, onRearThrottleChange]);

  const handleRearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setRearThrottle(val);
  };

  const handleRearCommit = () => {
    sendThrottleCommand(1, rearThrottle);
    onRearThrottleChange?.(rearThrottle);
  };

  const handleCommonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setCommonThrottle(val);
  };

  const handleCommonCommit = () => {
    sendThrottleCommand(0, commonThrottle);
    onCommonThrottleChange?.(commonThrottle);
  };

  return (
    <div className={styles.container}>
      {/* ── Rear Throttle ─────────────────────────────────── */}
      <div className={styles.throttleGroup}>
        <div className={styles.headerRow}>
          <span className={styles.label}>Rear Throttle</span>
          <span className={styles.valueBadge}>{rearThrottle}%</span>
        </div>
        <div className={styles.sliderRow}>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={rearThrottle}
            onChange={handleRearChange}
            onPointerUp={handleRearCommit}
            onKeyUp={handleRearCommit}
            className={styles.slider}
            style={{
              background: `linear-gradient(to right, var(--accent-cyan) 0%, var(--accent-cyan) ${rearThrottle}%, var(--bg-panel-raised) ${rearThrottle}%, var(--bg-panel-raised) 100%)`,
            }}
            aria-label="Rear Throttle"
          />
        </div>
        <div className={styles.scaleLabels}>
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>100%</span>
        </div>
      </div>

      {/* ── Common Throttle ───────────────────────────────── */}
      <div className={styles.throttleGroup}>
        <div className={styles.headerRow}>
          <span className={styles.label}>Common Throttle</span>
          <span className={styles.valueBadge}>{commonThrottle}%</span>
        </div>
        <div className={styles.sliderRow}>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={commonThrottle}
            onChange={handleCommonChange}
            onPointerUp={handleCommonCommit}
            onKeyUp={handleCommonCommit}
            className={styles.slider}
            style={{
              background: `linear-gradient(to right, var(--accent-cyan) 0%, var(--accent-cyan) ${commonThrottle}%, var(--bg-panel-raised) ${commonThrottle}%, var(--bg-panel-raised) 100%)`,
            }}
            aria-label="Common Throttle"
          />
        </div>
        <div className={styles.scaleLabels}>
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
}

