import React, { useEffect } from "react";
import * as LucideIcons from 'lucide-react';
import { services } from "../data/services";

type Props = {
  onFinish?: () => void;
  duration?: number; // ms
  count?: number;
};

const getIconComponent = (iconName: string) => {
  const icon = LucideIcons[iconName as keyof typeof LucideIcons] as React.ComponentType<{ size?: number; className?: string }>;
  return icon || LucideIcons.Wrench;
};

const SplashScreen: React.FC<Props> = ({ onFinish, duration = 2800, count = 8 }) => {
  useEffect(() => {
    const t = setTimeout(() => onFinish && onFinish(), duration);
    return () => clearTimeout(t);
  }, [onFinish, duration]);

  const items = services.slice(0, count);

  return (
    <div style={styles.container}>
      <div style={styles.center}>
        <div style={styles.logo}>
          {/* Simple icon circle */}
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="#0ea5e9" />
            <path d="M8 12l2.5 2L16 9" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <div style={styles.orbit}>
          {items.map((svc, i) => {
            const angle = (360 / items.length) * i;
            const transform = `rotate(${angle}deg) translate(120px) rotate(-${angle}deg)`;
            const IconComponent = getIconComponent(svc.icon);
            return (
              <div key={svc.id} style={{ ...styles.task, transform }} title={svc.name}>
                <div style={styles.iconContainer}>
                  <IconComponent size={24} className="text-white" />
                </div>
                <div style={styles.label}>{svc.name}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const styles: { [k: string]: React.CSSProperties } = {
  container: {
    position: "fixed",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(180deg,#0f172a, #020617)",
    zIndex: 9999,
    color: "white",
  },
  center: {
    position: "relative",
    width: 360,
    height: 360,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(255,255,255,0.06)",
    boxShadow: "0 8px 30px rgba(2,6,23,0.6)",
  },
  orbit: {
    position: "absolute",
    width: "100%",
    height: "100%",
    animation: "spin 6s linear infinite",
  },
  task: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transformOrigin: "-120px center",
    padding: "6px",
    background: "rgba(255,255,255,0.03)",
    borderRadius: 12,
    fontSize: 12,
    backdropFilter: "blur(4px)",
    border: "1px solid rgba(255,255,255,0.04)",
    whiteSpace: "nowrap",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(255,255,255,0.1)",
    boxShadow: "0 4px 12px rgba(2,6,23,0.6)",
  },
  label: {
    fontSize: 11,
    color: "#e6eef8",
    textAlign: "center",
    maxWidth: 80,
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
};

// Add keyframes to document (runtime injection) so we don't rely on external CSS
const styleSheetId = "__splash_keyframes";
if (typeof document !== "undefined" && !document.getElementById(styleSheetId)) {
  const style = document.createElement("style");
  style.id = styleSheetId;
  style.innerHTML = `@keyframes spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }`;
  document.head.appendChild(style);
}

export default SplashScreen;
