/* ────────────────────────────────────────────────────────
   AEROTWIN — APP (thin shell)
   Mounts the router and the global telemetry hook once.
   All routing / layout lives in routes.tsx + AppShell.
   ──────────────────────────────────────────────────────── */

import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { routes } from "./routes";
import { useTauriTelemetry } from "./hooks/useTauriTelemetry";


const router = createBrowserRouter(routes);


export default function App() {
  // Global telemetry — starts mock data now; will be
  // swapped for real Tauri UDP events later.
  useTauriTelemetry();

  return <RouterProvider router={router} />;
}
