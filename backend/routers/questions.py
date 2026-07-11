from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid

from database import get_db
import models
import schemas

router = APIRouter(tags=["questions"])


@router.get("/api/forms/{form_id}/questions", response_model=List[schemas.QuestionOut])
def list_questions(form_id: str, db: Session = Depends(get_db)):
    form = db.query(models.Form).filter(models.Form.id == form_id).first()
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    return form.questions


@router.post(
    "/api/forms/{form_id}/questions",
    response_model=schemas.QuestionOut,
    status_code=status.HTTP_201_CREATED,
)
def create_question(
    form_id: str, payload: schemas.QuestionCreate, db: Session = Depends(get_db)
):
    form = db.query(models.Form).filter(models.Form.id == form_id).first()
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")

    max_order = (
        db.query(models.Question)
        .filter(models.Question.form_id == form_id)
        .count()
    )

    question = models.Question(
        id=str(uuid.uuid4()),
        form_id=form_id,
        type=payload.type,
        title=payload.title,
        description=payload.description,
        required=payload.required,
        placeholder=payload.placeholder,
        order_index=payload.order_index if payload.order_index else max_order,
    )
    db.add(question)
    db.flush()

    for i, opt in enumerate(payload.options):
        db.add(
            models.Option(
                id=str(uuid.uuid4()),
                question_id=question.id,
                label=opt.label,
                order_index=i,
            )
        )

    db.commit()
    db.refresh(question)
    return question


@router.patch("/api/questions/{question_id}", response_model=schemas.QuestionOut)
def update_question(
    question_id: str, payload: schemas.QuestionUpdate, db: Session = Depends(get_db)
):
    question = (
        db.query(models.Question).filter(models.Question.id == question_id).first()
    )
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    if payload.type is not None:
        question.type = payload.type
    if payload.title is not None:
        question.title = payload.title
    if payload.description is not None:
        question.description = payload.description
    if payload.required is not None:
        question.required = payload.required
    if payload.placeholder is not None:
        question.placeholder = payload.placeholder
    if payload.order_index is not None:
        question.order_index = payload.order_index

    if payload.options is not None:
        for opt in question.options:
            db.delete(opt)
        db.flush()
        for i, opt in enumerate(payload.options):
            db.add(
                models.Option(
                    id=str(uuid.uuid4()),
                    question_id=question.id,
                    label=opt.label,
                    order_index=i,
                )
            )

    db.commit()
    db.refresh(question)
    return question


@router.delete("/api/questions/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_question(question_id: str, db: Session = Depends(get_db)):
    question = (
        db.query(models.Question).filter(models.Question.id == question_id).first()
    )
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    db.delete(question)
    db.commit()


@router.post("/api/questions/reorder", status_code=status.HTTP_204_NO_CONTENT)
def reorder_questions(payload: schemas.ReorderRequest, db: Session = Depends(get_db)):
    for item in payload.questions:
        question = (
            db.query(models.Question).filter(models.Question.id == item.id).first()
        )
        if question:
            question.order_index = item.order_index
    db.commit()
