import { useState, useEffect, useRef } from "react";
import { ShieldCheck, ShieldAlert } from "lucide-react";
import { useTelemetryStore } from "../../store/telemetryStore";
import { sendCommand, sendThrottleCommand } from "../../lib/tauriCommands";
import styles from "./ThrottleControlPanel.module.css";

interface ThrottleControlPanelProps {
  onRearThrottleChange?: (value: number) => void;
  onCommonThrottleChange?: (value: number) => void;
}

export default function ThrottleControlPanel({
  onRearThrottleChange,
  onCommonThrottleChange,
}: ThrottleControlPanelProps) {
  const [isArmed, setIsArmed] = useState<boolean>(false);
  const [rearThrottle, setRearThrottle] = useState<number>(0);
  const [commonThrottle, setCommonThrottle] = useState<number>(0);

  const connectionStatus = useTelemetryStore((s) => s.connectionStatus);
  const prevConnectionStatus = useRef(connectionStatus);

  // In case of connectivity failure (or reconnection), reset to disarmed and zero throttle
  useEffect(() => {
    if (connectionStatus !== "connected") {
      setIsArmed(false);
      setRearThrottle(0);
      setCommonThrottle(0);
      onCommonThrottleChange?.(0);
      onRearThrottleChange?.(0);
    } else if (prevConnectionStatus.current !== "connected" && connectionStatus === "connected") {
      setIsArmed(false);
      setRearThrottle(0);
      setCommonThrottle(0);
      sendCommand(3, 0); // Send DISARM (3, 0)
      sendThrottleCommand(0, 0);
      sendThrottleCommand(1, 0);
      onCommonThrottleChange?.(0);
      onRearThrottleChange?.(0);
    }
    prevConnectionStatus.current = connectionStatus;
  }, [connectionStatus, onCommonThrottleChange, onRearThrottleChange]);

  const handleToggleArm = () => {
    if (isArmed) {
      // Disarming: immediately cut throttle to zero and broadcast
      setIsArmed(false);
      setRearThrottle(0);
      setCommonThrottle(0);
      sendCommand(3, 0); // command_type 3, value 0 (DISARM)
      sendThrottleCommand(0, 0);
      sendThrottleCommand(1, 0);
      onCommonThrottleChange?.(0);
      onRearThrottleChange?.(0);
    } else {
      setIsArmed(true);
      sendCommand(3, 1); // command_type 3, value 1 (ARM)
    }
  };

  const handleRearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isArmed) return;
    const val = Number(e.target.value);
    setRearThrottle(val);
  };

  const handleRearCommit = () => {
    if (!isArmed) return;
    sendThrottleCommand(1, rearThrottle);
    onRearThrottleChange?.(rearThrottle);
  };

  const handleStepRear = (delta: number) => {
    if (!isArmed) return;
    const nextVal = Math.min(100, Math.max(0, rearThrottle + delta));
    setRearThrottle(nextVal);
    sendThrottleCommand(1, nextVal);
    onRearThrottleChange?.(nextVal);
  };

  const handleCommonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isArmed) return;
    const val = Number(e.target.value);
    setCommonThrottle(val);
  };

  const handleCommonCommit = () => {
    if (!isArmed) return;
    sendThrottleCommand(0, commonThrottle);
    onCommonThrottleChange?.(commonThrottle);
  };

  const handleStepCommon = (delta: number) => {
    if (!isArmed) return;
    const nextVal = Math.min(100, Math.max(0, commonThrottle + delta));
    setCommonThrottle(nextVal);
    sendThrottleCommand(0, nextVal);
    onCommonThrottleChange?.(nextVal);
  };

  return (
    <div className={styles.container}>
      {/* ── Top Bar: Arm / Disarm Status & Action ────────── */}
      <div className={styles.topBar}>
        <div className={styles.systemStatusGroup}>
          <span className={`${styles.statusDot} ${isArmed ? styles.armed : ""}`} />
          <span className={`${styles.systemStatusText} ${isArmed ? styles.armed : ""}`}>
            {isArmed ? "SYSTEM ARMED" : "SYSTEM DISARMED"}
          </span>
        </div>

        <button
          type="button"
          onClick={handleToggleArm}
          className={`${styles.armButton} ${isArmed ? styles.armed : styles.disarmed}`}
          aria-label={isArmed ? "Disarm System" : "Arm System"}
        >
          {isArmed ? (
            <>
              <ShieldAlert size={13} strokeWidth={2.2} />
              DISARM
            </>
          ) : (
            <>
              <ShieldCheck size={13} strokeWidth={2.2} />
              ARM
            </>
          )}
        </button>
      </div>

      {/* ── Rear Throttle ─────────────────────────────────── */}
      <div className={`${styles.throttleGroup} ${!isArmed ? styles.disabled : ""}`}>
        <div className={styles.headerRow}>
          <span className={styles.label}>Rear Throttle</span>
          <div className={styles.valueControlGroup}>
            <div className={styles.stepButtonGroup}>
              <button
                type="button"
                className={styles.stepButton}
                disabled={!isArmed || rearThrottle <= 0}
                onClick={() => handleStepRear(-1)}
                title="Decrease Rear Throttle by 1%"
                aria-label="Decrease Rear Throttle by 1%"
              >
                -1
              </button>
              <button
                type="button"
                className={styles.stepButton}
                disabled={!isArmed || rearThrottle >= 100}
                onClick={() => handleStepRear(1)}
                title="Increase Rear Throttle by 1%"
                aria-label="Increase Rear Throttle by 1%"
              >
                +1
              </button>
            </div>
            <span className={`${styles.valueBadge} ${!isArmed ? styles.disabled : ""}`}>
              {rearThrottle}%
            </span>
          </div>
        </div>
        <div className={styles.sliderRow}>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            disabled={!isArmed}
            value={rearThrottle}
            onChange={handleRearChange}
            onPointerUp={handleRearCommit}
            onKeyUp={handleRearCommit}
            className={styles.slider}
            style={{
              background: isArmed
                ? `linear-gradient(to right, var(--accent-cyan) 0%, var(--accent-cyan) ${rearThrottle}%, var(--bg-panel-raised) ${rearThrottle}%, var(--bg-panel-raised) 100%)`
                : "var(--bg-panel-raised)",
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
      <div className={`${styles.throttleGroup} ${!isArmed ? styles.disabled : ""}`}>
        <div className={styles.headerRow}>
          <span className={styles.label}>Common Throttle</span>
          <div className={styles.valueControlGroup}>
            <div className={styles.stepButtonGroup}>
              <button
                type="button"
                className={styles.stepButton}
                disabled={!isArmed || commonThrottle <= 0}
                onClick={() => handleStepCommon(-1)}
                title="Decrease Common Throttle by 1%"
                aria-label="Decrease Common Throttle by 1%"
              >
                -1
              </button>
              <button
                type="button"
                className={styles.stepButton}
                disabled={!isArmed || commonThrottle >= 100}
                onClick={() => handleStepCommon(1)}
                title="Increase Common Throttle by 1%"
                aria-label="Increase Common Throttle by 1%"
              >
                +1
              </button>
            </div>
            <span className={`${styles.valueBadge} ${!isArmed ? styles.disabled : ""}`}>
              {commonThrottle}%
            </span>
          </div>
        </div>
        <div className={styles.sliderRow}>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            disabled={!isArmed}
            value={commonThrottle}
            onChange={handleCommonChange}
            onPointerUp={handleCommonCommit}
            onKeyUp={handleCommonCommit}
            className={styles.slider}
            style={{
              background: isArmed
                ? `linear-gradient(to right, var(--accent-cyan) 0%, var(--accent-cyan) ${commonThrottle}%, var(--bg-panel-raised) ${commonThrottle}%, var(--bg-panel-raised) 100%)`
                : "var(--bg-panel-raised)",
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
