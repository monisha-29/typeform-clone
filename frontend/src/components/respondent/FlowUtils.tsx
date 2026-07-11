"use client";

import { motion } from "framer-motion";
import type { Question } from "@/lib/types";

interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50 }}>
      <div className="progress-bar">
        <motion.div
          className="progress-bar-fill"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ type: "spring", stiffness: 50, damping: 15 }}
        />
      </div>
    </div>
  );
}

interface NavButtonsProps {
  onUp: () => void;
  onDown: () => void;
  canUp: boolean;
  canDown: boolean;
}

export function NavButtons({ onUp, onDown, canUp, canDown }: NavButtonsProps) {
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, display: "flex", gap: 8, zIndex: 50 }}>
      <button
        className="btn btn-primary"
        style={{ padding: "10px 14px", opacity: canUp ? 1 : 0.4, cursor: canUp ? "pointer" : "not-allowed" }}
        onClick={canUp ? onUp : undefined}
        disabled={!canUp}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
      </button>
      <button
        className="btn btn-primary"
        style={{ padding: "10px 14px", opacity: canDown ? 1 : 0.4, cursor: canDown ? "pointer" : "not-allowed" }}
        onClick={canDown ? onDown : undefined}
        disabled={!canDown}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
      </button>
    </div>
  );
}
