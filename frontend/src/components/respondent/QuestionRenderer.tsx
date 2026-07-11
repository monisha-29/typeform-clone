"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Question } from "@/lib/types";

interface QuestionRendererProps {
  question: Question;
  index: number;
  value: any;
  onChange: (val: any) => void;
  onContinue: () => void;
  isActive: boolean;
}

export function QuestionRenderer({
  question,
  index,
  value,
  onChange,
  onContinue,
  isActive
}: QuestionRendererProps) {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isActive) {
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 500); // Wait for transition
    }
  }, [isActive]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onContinue();
    }
  };

  const hasValue = value !== undefined && value !== null && value !== "" && (Array.isArray(value) ? value.length > 0 : true);

  return (
    <div style={{ width: "100%", maxWidth: 720, margin: "0 auto", padding: "0 24px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 32 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: "var(--accent)", marginTop: 4 }}>
          {index + 1}
          <span style={{ color: "var(--ink-light)" }}>→</span>
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 24, fontWeight: 500, color: "var(--ink)", lineHeight: 1.3 }}>
            {question.title}
            {question.required && <span style={{ color: "var(--accent)", marginLeft: 4 }}>*</span>}
          </h1>
          {question.description && (
            <p style={{ fontSize: 18, color: "var(--ink-light)", marginTop: 8, lineHeight: 1.5 }}>
              {question.description}
            </p>
          )}
        </div>
      </div>

      <div style={{ marginLeft: 44 }}>
        {["short_text", "email", "number"].includes(question.type) && (
          <input
            ref={inputRef as any}
            type={question.type === "email" ? "email" : question.type === "number" ? "number" : "text"}
            value={value || ""}
            onChange={e => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={question.placeholder || "Type your answer here..."}
            className="tf-input"
            style={{ fontSize: 24, padding: "12px 0", color: "var(--ink)" }}
          />
        )}

        {question.type === "long_text" && (
          <textarea
            ref={inputRef as any}
            value={value || ""}
            onChange={e => onChange(e.target.value)}
            placeholder={question.placeholder || "Type your answer here..."}
            className="tf-input"
            style={{ fontSize: 24, padding: "12px 0", color: "var(--ink)", resize: "none", height: 120 }}
          />
        )}

        {question.type === "multiple_choice" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {question.options.map((opt, i) => {
              const isSelected = Array.isArray(value) ? value.includes(opt.label) : value === opt.label;
              return (
                <button
                  key={opt.id}
                  className={`choice-btn ${isSelected ? "selected" : ""}`}
                  onClick={() => onChange(opt.label)}
                >
                  <span className="choice-key">{String.fromCharCode(65 + i)}</span>
                  <span style={{ fontSize: 18 }}>{opt.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {question.type === "dropdown" && (
          <select
            value={value || ""}
            onChange={e => onChange(e.target.value)}
            className="tf-select"
            style={{ fontSize: 20, padding: "16px 20px" }}
          >
            <option value="" disabled>Select an option...</option>
            {question.options.map(opt => (
              <option key={opt.id} value={opt.label}>{opt.label}</option>
            ))}
          </select>
        )}

        {question.type === "yes_no" && (
          <div style={{ display: "flex", gap: 16 }}>
            <button
              className={`choice-btn ${value === "Yes" ? "selected" : ""}`}
              onClick={() => onChange("Yes")}
              style={{ width: "auto", padding: "12px 24px" }}
            >
              <span className="choice-key">Y</span> Yes
            </button>
            <button
              className={`choice-btn ${value === "No" ? "selected" : ""}`}
              onClick={() => onChange("No")}
              style={{ width: "auto", padding: "12px 24px" }}
            >
              <span className="choice-key">N</span> No
            </button>
          </div>
        )}

        {question.type === "rating" && (
          <div style={{ display: "flex", gap: 12 }}>
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                className={`rating-btn ${value === String(n) ? "active" : ""}`}
                style={{ width: 60, height: 60, fontSize: 32 }}
                onClick={() => onChange(String(n))}
              >
                ★
              </button>
            ))}
          </div>
        )}

        {/* OK Button */}
        <AnimatePresence>
          {hasValue && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              style={{ marginTop: 32 }}
            >
              <button className="btn-ok" onClick={onContinue}>
                OK <span className="btn-ok-hint">press Enter ↵</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
