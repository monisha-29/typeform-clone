"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X, Type, AlignLeft, List, ChevronDown, Mail, Hash, ToggleLeft, Star } from "lucide-react";
import type { Question } from "@/lib/types";

const QUESTION_META: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  short_text:      { icon: <Type size={12} />,        label: "Short text",       color: "#4f46e5" },
  long_text:       { icon: <AlignLeft size={12} />,   label: "Long text",        color: "#0891b2" },
  multiple_choice: { icon: <List size={12} />,         label: "Multiple choice",  color: "#059669" },
  dropdown:        { icon: <ChevronDown size={12} />,  label: "Dropdown",         color: "#d97706" },
  email:           { icon: <Mail size={12} />,         label: "Email",            color: "#db2777" },
  number:          { icon: <Hash size={12} />,         label: "Number",           color: "#7c3aed" },
  yes_no:          { icon: <ToggleLeft size={12} />,   label: "Yes / No",         color: "#16a34a" },
  rating:          { icon: <Star size={12} />,         label: "Rating",           color: "#ea580c" },
};

interface SortableQuestionItemProps {
  question: Question;
  index: number;
  isActive: boolean;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
  onDuplicate: (e: React.MouseEvent) => void;
}

export function SortableQuestionItem({
  question,
  index,
  isActive,
  onClick,
  onDelete,
  onDuplicate,
}: SortableQuestionItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const meta = QUESTION_META[question.type] || { icon: <Type size={12} />, label: question.type, color: "#6b7280" };

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 10 : 0,
        position: "relative",
        borderRadius: 10,
        cursor: "pointer",
        background: isActive
          ? "rgba(255, 255, 255, 0.08)"
          : "transparent",
        border: isActive
          ? "1px solid rgba(255,255,255,0.12)"
          : "1px solid transparent",
        
        marginBottom: 2,
      }}
      onClick={onClick}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 10px" }}>
        {/* Drag Handle */}
        <div
          style={{
            cursor: isDragging ? "grabbing" : "grab",
            display: "flex", alignItems: "center",
            color: "rgba(255,255,255,0.2)",
            flexShrink: 0,
            padding: "2px",
          }}
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical size={14} />
        </div>

        {/* Number badge */}
        <div style={{
          width: 22, height: 22, borderRadius: 6,
          background: isActive ? meta.color : "rgba(255,255,255,0.07)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 11, fontWeight: 700,
          color: isActive ? "white" : "rgba(255,255,255,0.4)",
          flexShrink: 0, transition: "all 0.15s ease",
          fontFamily: "'Twklausanne 600', Arial, sans-serif",
        }}>
          {index + 1}
        </div>

        {/* Title + type */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 13, fontWeight: 500,
            color: isActive ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.65)",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            fontFamily: "'Twklausanne 500', Arial, sans-serif",
            lineHeight: 1.3,
          }}>
            {question.title || "Untitled question"}
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: 4,
            marginTop: 3, color: "rgba(255,255,255,0.3)", fontSize: 11,
            fontFamily: "'Twklausanne 400', Arial, sans-serif",
          }}>
            <span style={{ color: meta.color, opacity: 0.8 }}>{meta.icon}</span>
            <span>{meta.label}</span>
            {question.required && <span style={{ color: "#f87171" }}>*</span>}
          </div>
        </div>

        {/* Delete button — shown on hover/active */}
        <button
          style={{
            padding: 4, borderRadius: 6, border: "none",
            background: "transparent",
            color: "rgba(255,255,255,0.25)",
            cursor: "pointer", flexShrink: 0,
            opacity: isActive ? 1 : 0,
            transition: "opacity 0.15s, color 0.15s",
            display: "flex", alignItems: "center",
          }}
          onClick={onDelete}
          title="Delete question"
          onMouseEnter={e => (e.currentTarget.style.color = "#f87171")}
          onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
