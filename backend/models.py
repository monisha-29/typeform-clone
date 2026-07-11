from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Boolean, Integer, DateTime, ForeignKey, Text, Float
)
from sqlalchemy.orm import relationship
from database import Base
import uuid


def utcnow():
    return datetime.now(timezone.utc)


def gen_id():
    return str(uuid.uuid4())


class Form(Base):
    __tablename__ = "forms"

    id = Column(String, primary_key=True, default=gen_id)
    title = Column(String, nullable=False, default="Untitled typeform")
    description = Column(Text, nullable=True)
    is_published = Column(Boolean, default=False, nullable=False)
    response_count = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    questions = relationship(
        "Question",
        back_populates="form",
        cascade="all, delete-orphan",
        order_by="Question.order_index",
    )
    responses = relationship(
        "Response",
        back_populates="form",
        cascade="all, delete-orphan",
    )


class Question(Base):
    __tablename__ = "questions"

    id = Column(String, primary_key=True, default=gen_id)
    form_id = Column(String, ForeignKey("forms.id", ondelete="CASCADE"), nullable=False)
    type = Column(String, nullable=False, default="short_text")
    title = Column(String, nullable=False, default="Untitled question")
    description = Column(Text, nullable=True)
    required = Column(Boolean, default=False, nullable=False)
    placeholder = Column(String, nullable=True)
    order_index = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)

    form = relationship("Form", back_populates="questions")
    options = relationship(
        "Option",
        back_populates="question",
        cascade="all, delete-orphan",
        order_by="Option.order_index",
    )
    answers = relationship(
        "Answer",
        back_populates="question",
        cascade="all, delete-orphan",
    )


class Option(Base):
    __tablename__ = "options"

    id = Column(String, primary_key=True, default=gen_id)
    question_id = Column(String, ForeignKey("questions.id", ondelete="CASCADE"), nullable=False)
    label = Column(String, nullable=False)
    order_index = Column(Integer, nullable=False, default=0)

    question = relationship("Question", back_populates="options")


class Response(Base):
    __tablename__ = "responses"

    id = Column(String, primary_key=True, default=gen_id)
    form_id = Column(String, ForeignKey("forms.id", ondelete="CASCADE"), nullable=False)
    respondent_id = Column(String, nullable=True)
    submitted_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)

    form = relationship("Form", back_populates="responses")
    answers = relationship(
        "Answer",
        back_populates="response",
        cascade="all, delete-orphan",
    )


class Answer(Base):
    __tablename__ = "answers"

    id = Column(String, primary_key=True, default=gen_id)
    response_id = Column(String, ForeignKey("responses.id", ondelete="CASCADE"), nullable=False)
    question_id = Column(String, ForeignKey("questions.id", ondelete="CASCADE"), nullable=False)
    value = Column(Text, nullable=True)

    response = relationship("Response", back_populates="answers")
    question = relationship("Question", back_populates="answers")
