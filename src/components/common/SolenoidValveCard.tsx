import { useState, useEffect, useRef } from "react";
import { Disc } from "lucide-react";
import { useTelemetryStore } from "../../store/telemetryStore";
import styles from "./SolenoidValveCard.module.css";

interface SolenoidValveCardProps {
  onToggle?: (isOpen: boolean) => void;
}

export default function SolenoidValveCard({ onToggle }: SolenoidValveCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const connectionStatus = useTelemetryStore((s) => s.connectionStatus);
  const prevConnectionStatus = useRef(connectionStatus);

  // Automatically turn off solenoid valve upon network reconnection
  useEffect(() => {
    if (prevConnectionStatus.current !== "connected" && connectionStatus === "connected") {
      setIsOpen(false);
      onToggle?.(false);
    }
    prevConnectionStatus.current = connectionStatus;
  }, [connectionStatus, onToggle]);

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextState = e.target.checked;
    setIsOpen(nextState);
    onToggle?.(nextState);
  };

  return (
    <div className={`${styles.valveCard} ${isOpen ? styles.valveCardActive : ""}`}>
      <div className={styles.label}>
        <Disc size={14} strokeWidth={1.8} aria-hidden="true" />
        <span>SOLENOID VALVE</span>
      </div>

      <div className={styles.controlRow}>
        <span className={`${styles.statusText} ${isOpen ? styles.open : ""}`}>
          {isOpen ? "OPEN" : "CLOSED"}
        </span>

        <label className={styles.switch} aria-label="Toggle Solenoid Valve">
          <input
            type="checkbox"
            checked={isOpen}
            onChange={handleToggle}
          />
          <span className={styles.slider} />
        </label>
      </div>

      <div className={styles.subText}>
        <span>ACTUATOR STATE: {isOpen ? "ENERGIZED" : "STANDBY"}</span>
      </div>
    </div>
  );
}
