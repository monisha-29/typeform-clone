"use client";

import type { Question, QuestionUpdate } from "@/lib/types";
import { Toggle } from "@/components/ui/Toggle";

interface SettingsPanelProps {
  question: Question;
  onUpdate: (data: QuestionUpdate) => void;
}

const QUESTION_TYPES = [
  { value: "short_text", label: "Short text" },
  { value: "long_text", label: "Long text" },
  { value: "multiple_choice", label: "Multiple choice" },
  { value: "dropdown", label: "Dropdown" },
  { value: "email", label: "Email" },
  { value: "number", label: "Number" },
  { value: "yes_no", label: "Yes / No" },
  { value: "rating", label: "Rating" },
];

export function SettingsPanel({ question, onUpdate }: SettingsPanelProps) {
  return (
    <div style={{ padding: 24 }}>
      <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", marginBottom: 20 }}>Question Settings</h3>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-light)", display: "block", marginBottom: 8 }}>
            Type
          </label>
          <select
            className="tf-select"
            value={question.type}
            onChange={(e) => onUpdate({ type: e.target.value as any })}
          >
            {QUESTION_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-light)", display: "block", marginBottom: 8 }}>
            Settings
          </label>
          <div style={{ background: "var(--sidebar-bg)", padding: 16, borderRadius: 8 }}>
            <Toggle
              checked={question.required}
              onChange={(checked) => onUpdate({ required: checked })}
              label="Required"
            />
          </div>
        </div>

        {["short_text", "long_text", "email", "number"].includes(question.type) && (
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-light)", display: "block", marginBottom: 8 }}>
              Placeholder text
            </label>
            <input
              className="tf-input"
              style={{ fontSize: 14 }}
              value={question.placeholder || ""}
              onChange={(e) => onUpdate({ placeholder: e.target.value })}
              placeholder="e.g. Type your answer here..."
            />
          </div>
        )}
      </div>
    </div>
  );
}
