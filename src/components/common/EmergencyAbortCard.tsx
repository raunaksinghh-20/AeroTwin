import { useState } from "react";
import { AlertOctagon, Power, AlertTriangle } from "lucide-react";
import { sendThrottleCommand } from "../../lib/tauriCommands";
import styles from "./EmergencyAbortCard.module.css";

interface EmergencyAbortCardProps {
  onAbort?: () => void;
}

export default function EmergencyAbortCard({ onAbort }: EmergencyAbortCardProps) {
  const [aborted, setAborted] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const handleButtonClick = () => {
    if (aborted) {
      setShowResetModal(true);
    } else {
      setShowConfirmModal(true);
    }
  };

  const handleConfirmAbort = () => {
    setAborted(true);
    setShowConfirmModal(false);
    // Send zero throttle to both throttles immediately
    sendThrottleCommand(0, 0);
    sendThrottleCommand(1, 0);
    onAbort?.();
  };

  const handleConfirmReset = () => {
    setAborted(false);
    setShowResetModal(false);
  };

  return (
    <>
      <div className={styles.abortCard}>
        <div className={styles.label}>
          <div className={styles.labelLeft}>
            <AlertOctagon size={15} strokeWidth={2} aria-hidden="true" />
            <span>SAFETY CONTROL</span>
          </div>
        </div>

        <div className={styles.buttonArea}>
          <button
            type="button"
            onClick={handleButtonClick}
            className={`${styles.abortButton} ${aborted ? styles.aborted : ""}`}
            aria-label="Emergency Abort Button"
          >
            <Power size={14} strokeWidth={2.4} />
            {aborted ? "ABORT TRIGGERED" : "EMERGENCY ABORT"}
          </button>
          <span className={styles.subText}>
            {aborted ? "CLICK TO RESET" : "IMMEDIATE CUT-OFF"}
          </span>
        </div>
      </div>

      {/* ── Emergency Abort Confirmation Modal ───────────────── */}
      {showConfirmModal && (
        <div className={styles.modalOverlay} onClick={() => setShowConfirmModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <AlertTriangle className={styles.modalHeaderIcon} size={22} />
              <span className={styles.modalTitle}>CONFIRM EMERGENCY ABORT</span>
            </div>

            <div className={styles.modalBody}>
              <p>
                Are you sure you want to execute an emergency drone abort?
              </p>
              <div className={styles.warningBox}>
                WARNING: This command will immediately cut throttle to zero and command the flight controller into emergency failsafe.
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.btnCancel}
                onClick={() => setShowConfirmModal(false)}
              >
                CANCEL
              </button>
              <button
                type="button"
                className={styles.btnConfirmAbort}
                onClick={handleConfirmAbort}
              >
                <Power size={14} strokeWidth={2.4} />
                CONFIRM ABORT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Reset Abort State Confirmation Modal ──────────────── */}
      {showResetModal && (
        <div className={styles.modalOverlay} onClick={() => setShowResetModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader} style={{ background: "rgba(255, 255, 255, 0.05)" }}>
              <Power className={styles.modalHeaderIcon} style={{ color: "var(--accent-cyan)" }} size={20} />
              <span className={styles.modalTitle}>RESET ABORT STATE</span>
            </div>

            <div className={styles.modalBody}>
              <p>
                Reset emergency abort status back to armed stand-by mode?
              </p>
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.btnCancel}
                onClick={() => setShowResetModal(false)}
              >
                CANCEL
              </button>
              <button
                type="button"
                className={styles.btnConfirmAbort}
                style={{ background: "var(--accent-cyan)", borderColor: "var(--accent-cyan)", color: "#000" }}
                onClick={handleConfirmReset}
              >
                RESET SYSTEM
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
