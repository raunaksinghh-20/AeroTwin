import {
  AlertTriangle,
  Box,
  Clock3,
  Gauge,
  Settings,
  Waypoints,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import styles from "./Sidebar.module.css";

interface NavigationItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  badge?: boolean;
}

const navigationItems: NavigationItem[] = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: Gauge,
  },
  {
    label: "Digital Twin",
    path: "/digital-twin",
    icon: Box,
  },
  {
    label: "Telemetry",
    path: "/telemetry",
    icon: Waypoints,
  },
  {
    label: "Flight Log",
    path: "/flight-log",
    icon: Clock3,
  },
  {
    label: "Alerts",
    path: "/alerts",
    icon: AlertTriangle,
    badge: true,
  },
  {
    label: "Settings",
    path: "/settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.mark} aria-label="AeroTwin">
        AT
      </div>

      <nav className={styles.navigation} aria-label="Main navigation">
        {navigationItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              title={item.label}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ""}`
              }
            >
              <Icon size={20} strokeWidth={1.6} aria-hidden="true" />

              <span className={styles.label}>{item.label}</span>

              {item.badge && (
                <span className={styles.badge} aria-label="Active alerts" />
              )}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
