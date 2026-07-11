"use client";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  size?: "sm" | "md";
}

export function Toggle({ checked, onChange, label, size = "md" }: ToggleProps) {
  const w = size === "sm" ? 28 : 36;
  const h = size === "sm" ? 16 : 20;
  const thumb = size === "sm" ? 12 : 16;
  const offset = size === "sm" ? 10 : 14;

  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        cursor: "pointer",
        userSelect: "none",
      }}
    >
      <div
        style={{
          position: "relative",
          width: w,
          height: h,
          flexShrink: 0,
        }}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          style={{ position: "absolute", opacity: 0, width: 0, height: 0 }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: h / 2,
            background: checked ? "var(--ink)" : "var(--border)",
            transition: "background 150ms",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 2,
            left: 2,
            width: thumb,
            height: thumb,
            background: "white",
            borderRadius: "50%",
            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
            transform: checked ? `translateX(${offset}px)` : "translateX(0)",
            transition: "transform 150ms",
          }}
        />
      </div>
      {label && (
        <span style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>
          {label}
        </span>
      )}
    </label>
  );
}
