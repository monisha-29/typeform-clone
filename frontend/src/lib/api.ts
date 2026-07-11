import axios from "axios";
import type {
  Form,
  FormListItem,
  Question,
  QuestionCreate,
  QuestionUpdate,
  ResponseSubmit,
  ResponseOut,
  FormSummary,
  ReorderRequest,
} from "./types";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({ baseURL: BASE, timeout: 10000 });

// ── Forms ─────────────────────────────────────────────────────────────────────

export const getForms = (): Promise<FormListItem[]> =>
  api.get("/api/forms").then((r) => r.data);

export const createForm = (data: { title?: string; description?: string }): Promise<Form> =>
  api.post("/api/forms", data).then((r) => r.data);

export const getForm = (id: string): Promise<Form> =>
  api.get(`/api/forms/${id}`).then((r) => r.data);

export const updateForm = (
  id: string,
  data: { title?: string; description?: string }
): Promise<Form> => api.patch(`/api/forms/${id}`, data).then((r) => r.data);

export const deleteForm = (id: string): Promise<void> =>
  api.delete(`/api/forms/${id}`).then(() => undefined);

export const publishForm = (id: string): Promise<Form> =>
  api.post(`/api/forms/${id}/publish`).then((r) => r.data);

export const duplicateForm = (id: string): Promise<Form> =>
  api.post(`/api/forms/${id}/duplicate`).then((r) => r.data);

// ── Questions ─────────────────────────────────────────────────────────────────

export const getQuestions = (formId: string): Promise<Question[]> =>
  api.get(`/api/forms/${formId}/questions`).then((r) => r.data);

export const createQuestion = (
  formId: string,
  data: QuestionCreate
): Promise<Question> =>
  api.post(`/api/forms/${formId}/questions`, data).then((r) => r.data);

export const updateQuestion = (
  questionId: string,
  data: QuestionUpdate
): Promise<Question> =>
  api.patch(`/api/questions/${questionId}`, data).then((r) => r.data);

export const deleteQuestion = (questionId: string): Promise<void> =>
  api.delete(`/api/questions/${questionId}`).then(() => undefined);

export const reorderQuestions = (data: ReorderRequest): Promise<void> =>
  api.post("/api/questions/reorder", data).then(() => undefined);

// ── Responses ─────────────────────────────────────────────────────────────────

export const submitResponse = (
  formId: string,
  data: ResponseSubmit
): Promise<ResponseOut> =>
  api.post(`/api/forms/${formId}/responses`, data).then((r) => r.data);

export const getResponses = (formId: string): Promise<ResponseOut[]> =>
  api.get(`/api/forms/${formId}/responses`).then((r) => r.data);

// ── Summary ───────────────────────────────────────────────────────────────────

export const getFormSummary = (formId: string): Promise<FormSummary> =>
  api.get(`/api/forms/${formId}/summary`).then((r) => r.data);
