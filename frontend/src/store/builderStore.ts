import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type { Form, Question, QuestionCreate, QuestionUpdate } from "@/lib/types";
import * as api from "@/lib/api";

interface BuilderStore {
  form: Form | null;
  selectedQuestionId: string | null;
  isSaving: boolean;
  isLoading: boolean;

  loadForm: (formId: string) => Promise<void>;
  setForm: (form: Form) => void;
  setSelectedQuestion: (id: string | null) => void;

  updateFormTitle: (title: string) => Promise<void>;
  publishForm: () => Promise<void>;

  addQuestion: (type: Question["type"]) => Promise<void>;
  updateQuestion: (questionId: string, data: QuestionUpdate) => Promise<void>;
  deleteQuestion: (questionId: string) => Promise<void>;
  duplicateQuestion: (questionId: string) => Promise<void>;
  reorderQuestions: (questions: Question[]) => Promise<void>;
}

export const useBuilderStore = create<BuilderStore>()(
  subscribeWithSelector((set, get) => ({
    form: null,
    selectedQuestionId: null,
    isSaving: false,
    isLoading: false,

    loadForm: async (formId) => {
      set({ isLoading: true });
      try {
        const form = await api.getForm(formId);
        set({ form, isLoading: false });
        if (form.questions.length > 0) {
          set({ selectedQuestionId: form.questions[0].id });
        }
      } catch {
        set({ isLoading: false });
      }
    },

    setForm: (form) => set({ form }),

    setSelectedQuestion: (id) => set({ selectedQuestionId: id }),

    updateFormTitle: async (title) => {
      const { form } = get();
      if (!form) return;
      set({ isSaving: true });
      try {
        const updated = await api.updateForm(form.id, { title });
        set((s) => ({
          form: s.form ? { ...s.form, ...updated } : null,
          isSaving: false,
        }));
      } catch {
        set({ isSaving: false });
      }
    },

    publishForm: async () => {
      const { form } = get();
      if (!form) return;
      set({ isSaving: true });
      try {
        const updated = await api.publishForm(form.id);
        set((s) => ({
          form: s.form ? { ...s.form, ...updated } : null,
          isSaving: false,
        }));
      } catch {
        set({ isSaving: false });
      }
    },

    addQuestion: async (type) => {
      const { form } = get();
      if (!form) return;
      set({ isSaving: true });
      const defaultOptions =
        type === "multiple_choice" || type === "dropdown"
          ? [
              { label: "Option 1", order_index: 0 },
              { label: "Option 2", order_index: 1 },
            ]
          : [];

      const payload: QuestionCreate = {
        type,
        title: `Question ${form.questions.length + 1}`,
        order_index: form.questions.length,
        options: defaultOptions,
      };

      try {
        const question = await api.createQuestion(form.id, payload);
        set((s) => ({
          form: s.form
            ? { ...s.form, questions: [...s.form.questions, question] }
            : null,
          selectedQuestionId: question.id,
          isSaving: false,
        }));
      } catch {
        set({ isSaving: false });
      }
    },

    updateQuestion: async (questionId, data) => {
      set({ isSaving: true });
      try {
        const updated = await api.updateQuestion(questionId, data);
        set((s) => ({
          form: s.form
            ? {
                ...s.form,
                questions: s.form.questions.map((q) =>
                  q.id === questionId ? updated : q
                ),
              }
            : null,
          isSaving: false,
        }));
      } catch {
        set({ isSaving: false });
      }
    },

    deleteQuestion: async (questionId) => {
      const { form, selectedQuestionId } = get();
      if (!form) return;
      set({ isSaving: true });
      try {
        await api.deleteQuestion(questionId);
        const remaining = form.questions.filter((q) => q.id !== questionId);
        let newSelected = selectedQuestionId;
        if (selectedQuestionId === questionId) {
          newSelected = remaining.length > 0 ? remaining[0].id : null;
        }
        set((s) => ({
          form: s.form ? { ...s.form, questions: remaining } : null,
          selectedQuestionId: newSelected,
          isSaving: false,
        }));
      } catch {
        set({ isSaving: false });
      }
    },

    duplicateQuestion: async (questionId) => {
      const { form } = get();
      if (!form) return;
      const source = form.questions.find((q) => q.id === questionId);
      if (!source) return;
      set({ isSaving: true });
      try {
        const payload: QuestionCreate = {
          type: source.type,
          title: `${source.title} (copy)`,
          description: source.description ?? undefined,
          required: source.required,
          placeholder: source.placeholder ?? undefined,
          order_index: source.order_index + 1,
          options: source.options.map((o) => ({
            label: o.label,
            order_index: o.order_index,
          })),
        };
        const newQ = await api.createQuestion(form.id, payload);
        // Re-fetch form to get correct ordering
        const updated = await api.getForm(form.id);
        set({ form: updated, selectedQuestionId: newQ.id, isSaving: false });
      } catch {
        set({ isSaving: false });
      }
    },

    reorderQuestions: async (questions) => {
      const { form } = get();
      if (!form) return;
      const reordered = questions.map((q, i) => ({ ...q, order_index: i }));
      set((s) => ({
        form: s.form ? { ...s.form, questions: reordered } : null,
      }));
      try {
        await api.reorderQuestions({
          questions: reordered.map((q) => ({
            id: q.id,
            order_index: q.order_index,
          })),
        });
      } catch {
        // silently revert not needed — UI already updated
      }
    },
  }))
);
