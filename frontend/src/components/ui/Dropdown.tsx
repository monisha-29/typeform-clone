"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DropdownItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
  divider?: boolean;
}

interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: "left" | "right";
}

export function Dropdown({ trigger, items, align = "right" }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", keyHandler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", keyHandler);
    };
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-flex" }}>
      <div onClick={() => setOpen((p) => !p)} style={{ cursor: "pointer" }}>
        {trigger}
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: -4 }}
            transition={{ duration: 0.12, ease: [0.4, 0, 0.2, 1] }}
            className="context-menu"
            style={{
              position: "absolute",
              top: "calc(100% + 4px)",
              [align === "right" ? "right" : "left"]: 0,
            }}
          >
            {items.map((item, i) => (
              <div key={i}>
                {item.divider && (
                  <div className="divider" style={{ margin: "4px 0" }} />
                )}
                <div
                  className={`context-menu-item${item.danger ? " danger" : ""}`}
                  onClick={() => {
                    item.onClick();
                    setOpen(false);
                  }}
                >
                  {item.icon && <span style={{ opacity: 0.7 }}>{item.icon}</span>}
                  {item.label}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
