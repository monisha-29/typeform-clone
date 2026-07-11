// ── Question Types ────────────────────────────────────────────────────────────

export type QuestionType =
  | "short_text"
  | "long_text"
  | "multiple_choice"
  | "dropdown"
  | "email"
  | "number"
  | "yes_no"
  | "rating";

export interface Option {
  id: string;
  label: string;
  order_index: number;
}

export interface Question {
  id: string;
  form_id: string;
  type: QuestionType;
  title: string;
  description: string | null;
  required: boolean;
  placeholder: string | null;
  order_index: number;
  created_at: string;
  options: Option[];
}

export interface QuestionCreate {
  type: QuestionType;
  title?: string;
  description?: string | null;
  required?: boolean;
  placeholder?: string | null;
  order_index?: number;
  options?: { label: string; order_index: number }[];
}

export interface QuestionUpdate {
  type?: QuestionType;
  title?: string;
  description?: string | null;
  required?: boolean;
  placeholder?: string | null;
  order_index?: number;
  options?: { label: string; order_index: number }[];
}

// ── Forms ─────────────────────────────────────────────────────────────────────

export interface Form {
  id: string;
  title: string;
  description: string | null;
  is_published: boolean;
  response_count: number;
  created_at: string;
  updated_at: string;
  questions: Question[];
}

export interface FormListItem {
  id: string;
  title: string;
  description: string | null;
  is_published: boolean;
  response_count: number;
  created_at: string;
  updated_at: string;
}

// ── Responses ─────────────────────────────────────────────────────────────────

export interface AnswerIn {
  question_id: string;
  value: string | number | string[] | null;
}

export interface ResponseSubmit {
  answers: AnswerIn[];
  respondent_id?: string;
}

export interface AnswerOut {
  id: string;
  question_id: string;
  value: string | null;
}

export interface ResponseOut {
  id: string;
  form_id: string;
  submitted_at: string;
  respondent_id: string | null;
  answers: AnswerOut[];
}

// ── Summary ───────────────────────────────────────────────────────────────────

export interface QuestionSummary {
  question_id: string;
  question_title: string;
  question_type: QuestionType;
  total_answers: number;
  data: Record<string, unknown>;
}

export interface FormSummary {
  form_id: string;
  total_responses: number;
  questions: QuestionSummary[];
}

// ── Reorder ───────────────────────────────────────────────────────────────────

export interface ReorderRequest {
  questions: { id: string; order_index: number }[];
}

// ── UI State ──────────────────────────────────────────────────────────────────

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}
