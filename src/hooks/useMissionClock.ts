/* ────────────────────────────────────────────────────────
   AEROTWIN — useMissionClock
   Returns a formatted UTC clock string updating every
   second:  "HH:MM:SSZ"
   ──────────────────────────────────────────────────────── */

import { useEffect, useState } from "react";


function formatUTC(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}Z`;
}

/**
 * Returns a live UTC clock string, ticking every second.
 */
export function useMissionClock(): string {
  const [time, setTime] = useState(formatUTC);

  useEffect(() => {
    const id = setInterval(() => setTime(formatUTC()), 1000);
    return () => clearInterval(id);
  }, []);

  return time;
}
