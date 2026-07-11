"use client";

import type { Question, QuestionUpdate } from "@/lib/types";
import { useEffect, useRef } from "react";
import { Plus, GripVertical, X } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";

interface QuestionEditorProps {
  question: Question;
  index: number;
  onUpdate: (data: QuestionUpdate) => void;
}

function SortableOption({ id, label, index, onUpdate, onDelete }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };

  return (
    <div ref={setNodeRef} style={{ ...style, display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
      <div className="drag-handle" style={{ cursor: "grab", padding: 4 }} {...attributes} {...listeners}>
        <GripVertical size={16} />
      </div>
      <div style={{
         width: 24, height: 24, borderRadius: 4, border: "1px solid var(--border)",
         display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, color: "var(--ink-light)"
      }}>
        {String.fromCharCode(65 + index)}
      </div>
      <input
        value={label}
        onChange={(e) => onUpdate(e.target.value)}
        className="tf-input"
        style={{ fontSize: 15, padding: "4px 0", flex: 1 }}
        placeholder="Option label"
      />
      <button className="btn btn-ghost" style={{ padding: 4 }} onClick={onDelete}>
        <X size={16} />
      </button>
    </div>
  );
}

export function QuestionEditor({ question, index, onUpdate }: QuestionEditorProps) {
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textareas
  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.style.height = "auto";
      titleRef.current.style.height = `${titleRef.current.scrollHeight}px`;
    }
  }, [question.title]);

  useEffect(() => {
    if (descRef.current) {
      descRef.current.style.height = "auto";
      descRef.current.style.height = `${descRef.current.scrollHeight}px`;
    }
  }, [question.description]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = question.options.findIndex((o) => o.id === active.id);
      const newIndex = question.options.findIndex((o) => o.id === over.id);
      const newOptions = [...question.options];
      const [removed] = newOptions.splice(oldIndex, 1);
      newOptions.splice(newIndex, 0, removed);
      onUpdate({ options: newOptions.map((o, i) => ({ ...o, order_index: i })) });
    }
  };

  return (
    <div style={{ width: "100%", maxWidth: 720, background: "white", padding: 48, borderRadius: 12, boxShadow: "var(--card-shadow)" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: "var(--accent)", marginTop: 4 }}>
          {index + 1}
        </div>
        <div style={{ flex: 1 }}>
          <textarea
            ref={titleRef}
            value={question.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="Your question here..."
            style={{
              width: "100%", fontSize: 24, fontWeight: 500, color: "var(--ink)",
              border: "none", outline: "none", resize: "none", overflow: "hidden", lineHeight: 1.3
            }}
            rows={1}
          />
          <textarea
            ref={descRef}
            value={question.description || ""}
            onChange={(e) => onUpdate({ description: e.target.value })}
            placeholder="Description (optional)"
            style={{
              width: "100%", fontSize: 16, color: "var(--ink-light)",
              border: "none", outline: "none", resize: "none", overflow: "hidden", marginTop: 8
            }}
            rows={1}
          />
        </div>
      </div>

      <div style={{ marginTop: 32, marginLeft: 30 }}>
        {["short_text", "email", "number"].includes(question.type) && (
          <input
            disabled
            placeholder={question.placeholder || "Type your answer here..."}
            style={{
               width: "100%", border: "none", borderBottom: "1px solid var(--border)",
               padding: "8px 0", fontSize: 18, color: "var(--ink-lighter)", background: "transparent"
            }}
          />
        )}
        {question.type === "long_text" && (
           <textarea
             disabled
             placeholder={question.placeholder || "Type your answer here..."}
             style={{
                width: "100%", border: "none", borderBottom: "1px solid var(--border)",
                padding: "8px 0", fontSize: 18, color: "var(--ink-lighter)", background: "transparent",
                resize: "none"
             }}
             rows={3}
           />
        )}
        {["multiple_choice", "dropdown"].includes(question.type) && (
           <div style={{ marginTop: 16 }}>
             <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
               <SortableContext items={question.options.map(o => o.id)} strategy={verticalListSortingStrategy}>
                 {question.options.map((opt, i) => (
                   <SortableOption
                     key={opt.id}
                     id={opt.id}
                     label={opt.label}
                     index={i}
                     onUpdate={(label: string) => {
                       const newOpts = [...question.options];
                       newOpts[i].label = label;
                       onUpdate({ options: newOpts });
                     }}
                     onDelete={() => {
                       const newOpts = question.options.filter((_, idx) => idx !== i);
                       onUpdate({ options: newOpts.map((o, idx) => ({ ...o, order_index: idx })) });
                     }}
                   />
                 ))}
               </SortableContext>
             </DndContext>
             <button
               className="btn btn-ghost"
               style={{ marginTop: 8, fontSize: 13, gap: 4, padding: "6px 12px" }}
               onClick={() => {
                 const newOpts = [...question.options, { label: `Option ${question.options.length + 1}`, order_index: question.options.length }];
                 onUpdate({ options: newOpts as any });
               }}
             >
               <Plus size={14} /> Add choice
             </button>
           </div>
        )}
        {question.type === "yes_no" && (
           <div style={{ display: "flex", gap: 16, marginTop: 16 }}>
             <div className="choice-btn" style={{ width: "auto" }}>
               <span className="choice-key">Y</span> Yes
             </div>
             <div className="choice-btn" style={{ width: "auto" }}>
               <span className="choice-key">N</span> No
             </div>
           </div>
        )}
        {question.type === "rating" && (
           <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
             {[1, 2, 3, 4, 5].map(n => (
               <div key={n} className="rating-btn">★</div>
             ))}
           </div>
        )}
      </div>
    </div>
  );
}
