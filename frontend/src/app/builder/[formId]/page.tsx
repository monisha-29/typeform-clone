"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Eye, Layout, Settings as SettingsIcon, ChevronLeft, Check } from "lucide-react";
import { useBuilderStore } from "@/store/builderStore";
import { useToastStore } from "@/store/toastStore";
import { SortableQuestionItem } from "@/components/builder/SortableQuestionItem";
import { AddQuestionMenu } from "@/components/builder/AddQuestionMenu";
import { QuestionEditor } from "@/components/builder/QuestionEditor";
import { SettingsPanel } from "@/components/builder/SettingsPanel";
import Link from "next/link";

export default function BuilderPage(props: { params: Promise<{ formId: string }> }) {
  const params = use(props.params);
  const router = useRouter();
  const { addToast } = useToastStore();
  const {
    form, selectedQuestionId, isSaving, isLoading,
    loadForm, updateFormTitle, publishForm,
    addQuestion, updateQuestion, deleteQuestion, duplicateQuestion,
    reorderQuestions, setSelectedQuestion
  } = useBuilderStore();

  const [titleEdit, setTitleEdit] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  useEffect(() => {
    loadForm(params.formId).catch(() => {
      addToast("Failed to load form", "error");
      router.push("/");
    });
  }, [params.formId, loadForm, addToast, router]);

  useEffect(() => {
    if (form && !isEditingTitle) {
      setTitleEdit(form.title);
    }
  }, [form, isEditingTitle]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id && form) {
      const oldIndex = form.questions.findIndex((q) => q.id === active.id);
      const newIndex = form.questions.findIndex((q) => q.id === over.id);
      const newQuestions = [...form.questions];
      const [removed] = newQuestions.splice(oldIndex, 1);
      newQuestions.splice(newIndex, 0, removed);
      reorderQuestions(newQuestions);
    }
  };

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (titleEdit.trim() && titleEdit !== form?.title) {
      updateFormTitle(titleEdit.trim());
    }
  };

  const activeQuestion = form?.questions.find(q => q.id === selectedQuestionId);

  if (isLoading || !form) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="animate-spin" style={{ width: 24, height: 24, border: "2px solid var(--border)", borderTopColor: "var(--ink)", borderRadius: "50%" }} />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", background: "#f5f3f6" }}>
      {/* Top Toolbar */}
      <header style={{
        height: 56, background: "#1a0028", borderBottom: "1px solid rgba(255,255,255,0.07)",
        display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", flexShrink: 0,
        boxShadow: "0 1px 20px rgba(0,0,0,0.3)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/" style={{ padding: 6, color: "rgba(255,255,255,0.5)", display: "flex", alignItems: "center", transition: "color 0.2s" }}
            onMouseEnter={(e: any) => e.currentTarget.style.color = "white"}
            onMouseLeave={(e: any) => e.currentTarget.style.color = "rgba(255,255,255,0.5)"}
          >
            <ChevronLeft size={20} />
          </Link>
          <div style={{ width: 1, height: 24, background: "rgba(255,255,255,0.1)" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {isEditingTitle ? (
              <input
                autoFocus
                style={{ fontSize: 14, padding: "4px 8px", width: 220, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, color: "white", outline: "none", fontFamily: "'Twklausanne 500', Arial, sans-serif" }}
                value={titleEdit}
                onChange={e => setTitleEdit(e.target.value)}
                onBlur={handleTitleSubmit}
                onKeyDown={e => e.key === "Enter" && handleTitleSubmit()}
              />
            ) : (
              <div
                onClick={() => setIsEditingTitle(true)}
                style={{ fontSize: 14, fontWeight: 600, cursor: "text", padding: "4px 8px", borderRadius: 6, color: "rgba(255,255,255,0.9)", fontFamily: "'Twklausanne 600', Arial, sans-serif", transition: "background 0.15s" }}
                onMouseEnter={(e: any) => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
                onMouseLeave={(e: any) => e.currentTarget.style.background = "transparent"}
              >
                {form.title}
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 4, color: "rgba(255,255,255,0.35)", fontSize: 12, fontFamily: "'Twklausanne 400', Arial, sans-serif" }}>
              {isSaving ? (
                <>
                  <div className="animate-spin" style={{ width: 10, height: 10, border: "1.5px solid rgba(255,255,255,0.2)", borderTopColor: "rgba(255,255,255,0.6)", borderRadius: "50%" }} />
                  Saving...
                </>
              ) : (
                <>
                  <Check size={12} /> Saved
                </>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => window.open(`/f/${form.id}`, "_blank")}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.75)", cursor: "pointer", fontSize: 13, fontFamily: "'Twklausanne 500', Arial, sans-serif", transition: "all 0.15s" }}
            onMouseEnter={(e: any) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "white"; }}
            onMouseLeave={(e: any) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.75)"; }}
          >
            <Eye size={15} /> Preview
          </button>
          <button
            onClick={publishForm}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 18px", borderRadius: 8, border: "none",
              background: form.is_published ? "rgba(162,95,186,0.2)" : "#a25fba",
              color: form.is_published ? "#c98de8" : "white",
              cursor: "pointer", fontSize: 13, fontWeight: 600,
              fontFamily: "'Twklausanne 600', Arial, sans-serif",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e: any) => { if (!form.is_published) e.currentTarget.style.background = "#8e4fa8"; }}
            onMouseLeave={(e: any) => { if (!form.is_published) e.currentTarget.style.background = "#a25fba"; }}
          >
            {form.is_published ? "✓ Published" : "Publish"}
          </button>
        </div>
      </header>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Left Sidebar — dark glassmorphism */}
        <aside style={{
          width: 260, flexShrink: 0, display: "flex", flexDirection: "column",
          background: "linear-gradient(180deg, #150022 0%, #1a0030 100%)",
          borderRight: "1px solid rgba(255,255,255,0.07)",
          overflowY: "auto",
        }}>
          <div style={{ padding: "16px 12px", flex: 1, overflowY: "auto" }}>
            <div style={{
              fontSize: 10, fontWeight: 700, textTransform: "uppercase",
              color: "rgba(162,95,186,0.7)", letterSpacing: "0.1em",
              marginBottom: 12, padding: "0 6px",
              fontFamily: "'Twklausanne 600', Arial, sans-serif",
            }}>
              Questions
            </div>
            
            {form.questions.length === 0 && (
              <div style={{ padding: "24px 8px", textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: 13, fontFamily: "'Twklausanne 400', Arial, sans-serif" }}>
                Add your first question below
              </div>
            )}

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={form.questions.map(q => q.id)} strategy={verticalListSortingStrategy}>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {form.questions.map((q, i) => (
                    <SortableQuestionItem
                      key={q.id}
                      question={q}
                      index={i}
                      isActive={q.id === selectedQuestionId}
                      onClick={() => setSelectedQuestion(q.id)}
                      onDelete={(e) => { e.stopPropagation(); deleteQuestion(q.id); }}
                      onDuplicate={(e) => { e.stopPropagation(); duplicateQuestion(q.id); }}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            <div style={{ marginTop: 16 }}>
              <AddQuestionMenu onAdd={(type) => addQuestion(type)} />
            </div>
          </div>

          {/* Sidebar footer */}
          <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#a25fba,#7b3fa0)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "white", fontSize: 12, fontWeight: 700 }}>T</span>
            </div>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: "'Twklausanne 400', Arial, sans-serif" }}>Typeform Builder</span>
          </div>
        </aside>

        {/* Center Area */}
        <main style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
          background: "#f5f3f6", overflowY: "auto", padding: "40px 24px",
        }}>
          {activeQuestion ? (
            <QuestionEditor
              key={activeQuestion.id}
              question={activeQuestion}
              index={form.questions.findIndex(q => q.id === activeQuestion.id)}
              onUpdate={(data) => updateQuestion(activeQuestion.id, data)}
            />
          ) : (
            <div style={{ textAlign: "center", color: "rgba(0,0,0,0.25)" }}>
              <Layout size={48} style={{ opacity: 0.3, margin: "0 auto 16px", display: "block" }} />
              <p style={{ fontSize: 15, fontFamily: "'Twklausanne 400', Arial, sans-serif" }}>Select a question to edit, or add a new one.</p>
            </div>
          )}
        </main>

        {/* Right Sidebar */}
        <aside style={{
          width: 280, flexShrink: 0,
          background: "white", borderLeft: "1px solid #e5e1e5",
          overflowY: "auto",
        }}>
          {activeQuestion ? (
            <SettingsPanel
              key={activeQuestion.id}
              question={activeQuestion}
              onUpdate={(data) => updateQuestion(activeQuestion.id, data)}
            />
          ) : (
            <div style={{ padding: 32, textAlign: "center", color: "#b0a8b2" }}>
              <SettingsIcon size={28} style={{ opacity: 0.3, margin: "0 auto 12px", display: "block" }} />
              <p style={{ fontSize: 13, fontFamily: "'Twklausanne 400', Arial, sans-serif", color: "#b0a8b2" }}>Settings will appear here when a question is selected</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
