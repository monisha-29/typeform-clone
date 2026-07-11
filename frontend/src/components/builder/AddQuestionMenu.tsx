"use client";

import { useState } from "react";
import type { Question } from "@/lib/types";
import { Plus } from "lucide-react";

interface AddQuestionMenuProps {
  onAdd: (type: Question["type"]) => void;
}

export function AddQuestionMenu({ onAdd }: AddQuestionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const types = [
    { type: "short_text", label: "Short text", icon: "Aa" },
    { type: "long_text", label: "Long text", icon: "T" },
    { type: "multiple_choice", label: "Multiple choice", icon: "≡" },
    { type: "dropdown", label: "Dropdown", icon: "▼" },
    { type: "email", label: "Email", icon: "@" },
    { type: "number", label: "Number", icon: "#" },
    { type: "yes_no", label: "Yes / No", icon: "Y/N" },
    { type: "rating", label: "Rating", icon: "★" },
  ];

  return (
    <div style={{ position: "relative" }}>
      <button
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          padding: "10px 0", borderRadius: 10,
          border: "1px dashed rgba(162,95,186,0.35)",
          background: "rgba(162,95,186,0.07)",
          color: "rgba(162,95,186,0.8)",
          cursor: "pointer", fontSize: 13,
          fontFamily: "'Twklausanne 500', Arial, sans-serif",
          transition: "all 0.2s",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.background = "rgba(162,95,186,0.15)";
          (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(162,95,186,0.6)";
          (e.currentTarget as HTMLButtonElement).style.color = "#c98de8";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.background = "rgba(162,95,186,0.07)";
          (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(162,95,186,0.35)";
          (e.currentTarget as HTMLButtonElement).style.color = "rgba(162,95,186,0.8)";
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Plus size={15} /> Add question
      </button>

      {isOpen && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setIsOpen(false)} />
          <div style={{
            position: "absolute",
            bottom: "calc(100% + 8px)",
            left: 0, right: 0,
            background: "#1e0035",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 12,
            boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
            padding: 8,
            zIndex: 50,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 4,
          }}>
            {types.map((t) => (
              <button
                key={t.type}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  border: "none", background: "transparent",
                  width: "100%", textAlign: "left",
                  padding: "8px 10px", borderRadius: 8,
                  color: "rgba(255,255,255,0.7)",
                  cursor: "pointer", fontSize: 12,
                  fontFamily: "'Twklausanne 400', Arial, sans-serif",
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(162,95,186,0.15)";
                  (e.currentTarget as HTMLButtonElement).style.color = "white";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                  (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.7)";
                }}
                onClick={() => { onAdd(t.type as Question["type"]); setIsOpen(false); }}
              >
                <span style={{
                  width: 22, height: 22, display: "inline-flex", alignItems: "center", justifyContent: "center",
                  background: "rgba(162,95,186,0.2)", borderRadius: 6, fontSize: 10, fontWeight: 700,
                  color: "#c98de8", flexShrink: 0,
                }}>{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
