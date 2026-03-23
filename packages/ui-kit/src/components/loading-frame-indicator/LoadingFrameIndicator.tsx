import { useEffect, useState } from "react";
import "./loading-frame-indicator.css";

const FRAMES = ["|..", ".|.", "..|"] as const;
const INTERVAL_MS = 250;

export type LoadingFrameIndicatorProps = {
  className?: string;
};

export function LoadingFrameIndicator({
  className = "text-info color-input-placeholder",
}: LoadingFrameIndicatorProps) {
  const [i, setI] = useState(0);

  useEffect(() => {
    setI(0);
    const id = window.setInterval(() => {
      setI((j) => (j + 1) % FRAMES.length);
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, []);

  return (
    <span
      className={`fins-loading-frame-indicator text-info color-info ${className}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      {FRAMES[i]}
    </span>
  );
}
