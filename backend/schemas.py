from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime


# ── Options ──────────────────────────────────────────────────────────────────

class OptionBase(BaseModel):
    label: str
    order_index: int = 0


class OptionCreate(OptionBase):
    pass


class OptionOut(OptionBase):
    id: str

    model_config = {"from_attributes": True}


# ── Questions ─────────────────────────────────────────────────────────────────

class QuestionBase(BaseModel):
    type: str = "short_text"
    title: str = "Untitled question"
    description: Optional[str] = None
    required: bool = False
    placeholder: Optional[str] = None
    order_index: int = 0


class QuestionCreate(QuestionBase):
    options: List[OptionCreate] = []


class QuestionUpdate(BaseModel):
    type: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    required: Optional[bool] = None
    placeholder: Optional[str] = None
    order_index: Optional[int] = None
    options: Optional[List[OptionCreate]] = None


class QuestionOut(QuestionBase):
    id: str
    form_id: str
    created_at: datetime
    options: List[OptionOut] = []

    model_config = {"from_attributes": True}


# ── Forms ─────────────────────────────────────────────────────────────────────

class FormBase(BaseModel):
    title: str = "Untitled typeform"
    description: Optional[str] = None


class FormCreate(FormBase):
    pass


class FormUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None


class FormOut(FormBase):
    id: str
    is_published: bool
    response_count: int
    created_at: datetime
    updated_at: datetime
    questions: List[QuestionOut] = []

    model_config = {"from_attributes": True}


class FormListItem(BaseModel):
    id: str
    title: str
    description: Optional[str]
    is_published: bool
    response_count: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ── Responses ─────────────────────────────────────────────────────────────────

class AnswerIn(BaseModel):
    question_id: str
    value: Any


class ResponseSubmit(BaseModel):
    answers: List[AnswerIn]
    respondent_id: Optional[str] = None


class AnswerOut(BaseModel):
    id: str
    question_id: str
    value: Optional[str]

    model_config = {"from_attributes": True}


class ResponseOut(BaseModel):
    id: str
    form_id: str
    submitted_at: datetime
    respondent_id: Optional[str]
    answers: List[AnswerOut] = []

    model_config = {"from_attributes": True}


# ── Summary ───────────────────────────────────────────────────────────────────

class QuestionSummary(BaseModel):
    question_id: str
    question_title: str
    question_type: str
    total_answers: int
    data: Any  # type-specific aggregation


class FormSummary(BaseModel):
    form_id: str
    total_responses: int
    questions: List[QuestionSummary]


# ── Reorder ───────────────────────────────────────────────────────────────────

class ReorderItem(BaseModel):
    id: str
    order_index: int


class ReorderRequest(BaseModel):
    questions: List[ReorderItem]
