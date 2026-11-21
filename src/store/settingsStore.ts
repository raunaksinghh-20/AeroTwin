import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsState {
  // Telemetry & Network
  udpPort: number;
  watchdogTimeoutMs: number;
  autoReconnect: boolean;

  // Safety & Alerts
  batteryCautionPercent: number;
  batteryCriticalPercent: number;
  fuelCellMaxTemp: number;
  signalRssiThreshold: number;

  // 3D Viewport / Digital Twin
  showRadarGrid: boolean;
  autoRotateDrone: boolean;
  rotationSpeed: number;
  lightingIntensity: number;
  cameraFov: number;

  // Setters
  setUdpPort: (port: number) => void;
  setWatchdogTimeoutMs: (ms: number) => void;
  setAutoReconnect: (val: boolean) => void;

  setBatteryCautionPercent: (val: number) => void;
  setBatteryCriticalPercent: (val: number) => void;
  setFuelCellMaxTemp: (val: number) => void;
  setSignalRssiThreshold: (val: number) => void;

  setShowRadarGrid: (val: boolean) => void;
  setAutoRotateDrone: (val: boolean) => void;
  setRotationSpeed: (val: number) => void;
  setLightingIntensity: (val: number) => void;
  setCameraFov: (val: number) => void;

  resetToDefaults: () => void;
}

const DEFAULT_SETTINGS = {
  udpPort: 8888,
  watchdogTimeoutMs: 3500,
  autoReconnect: true,

  batteryCautionPercent: 30,
  batteryCriticalPercent: 15,
  fuelCellMaxTemp: 75,
  signalRssiThreshold: -75,

  showRadarGrid: true,
  autoRotateDrone: false,
  rotationSpeed: 1.0,
  lightingIntensity: 1.0,
  cameraFov: 50,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,

      setUdpPort: (udpPort) => set({ udpPort }),
      setWatchdogTimeoutMs: (watchdogTimeoutMs) => set({ watchdogTimeoutMs }),
      setAutoReconnect: (autoReconnect) => set({ autoReconnect }),

      setBatteryCautionPercent: (batteryCautionPercent) => set({ batteryCautionPercent }),
      setBatteryCriticalPercent: (batteryCriticalPercent) => set({ batteryCriticalPercent }),
      setFuelCellMaxTemp: (fuelCellMaxTemp) => set({ fuelCellMaxTemp }),
      setSignalRssiThreshold: (signalRssiThreshold) => set({ signalRssiThreshold }),

      setShowRadarGrid: (showRadarGrid) => set({ showRadarGrid }),
      setAutoRotateDrone: (autoRotateDrone) => set({ autoRotateDrone }),
      setRotationSpeed: (rotationSpeed) => set({ rotationSpeed }),
      setLightingIntensity: (lightingIntensity) => set({ lightingIntensity }),
      setCameraFov: (cameraFov) => set({ cameraFov }),

      resetToDefaults: () => set(DEFAULT_SETTINGS),
    }),
    {
      name: "aerotwin-settings",
    }
  )
);
