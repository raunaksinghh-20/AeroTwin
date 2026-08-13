/* ────────────────────────────────────────────────────────
   AEROTWIN — VIEW CONTROLS
   Camera preset buttons overlaid on the 3D viewport.
   ──────────────────────────────────────────────────────── */

import { Eye, RotateCcw } from "lucide-react";
import styles from "./ViewControls.module.css";


interface ViewControlsProps {
  onPreset: (preset: string) => void;
  onReset: () => void;
}

const presets = [
  { key: "perspective", label: "3D" },
  { key: "top",         label: "TOP" },
  { key: "bottom",      label: "BTM" },
  { key: "front",       label: "FWD" },
  { key: "side",        label: "SIDE" },
];


export default function ViewControls({ onPreset, onReset }: ViewControlsProps) {
  return (
    <div className={styles.bar}>
      <div className={styles.group}>
        <Eye size={14} strokeWidth={1.6} className={styles.icon} />
        {presets.map((p) => (
          <button
            key={p.key}
            className={styles.btn}
            onClick={() => onPreset(p.key)}
            title={`${p.label} View`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <button
        className={`${styles.btn} ${styles.reset}`}
        onClick={onReset}
        title="Reset View"
      >
        <RotateCcw size={13} strokeWidth={1.8} />
      </button>
    </div>
  );
}
