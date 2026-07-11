from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from collections import Counter
import json

from database import get_db
import models
import schemas

router = APIRouter(tags=["summary"])


@router.get("/api/forms/{form_id}/summary", response_model=schemas.FormSummary)
def get_summary(form_id: str, db: Session = Depends(get_db)):
    form = db.query(models.Form).filter(models.Form.id == form_id).first()
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")

    total_responses = (
        db.query(models.Response).filter(models.Response.form_id == form_id).count()
    )

    question_summaries = []
    for question in form.questions:
        answers = (
            db.query(models.Answer)
            .filter(models.Answer.question_id == question.id)
            .all()
        )
        total_answers = len(answers)
        values = [a.value for a in answers if a.value is not None]

        if question.type in ("multiple_choice", "dropdown", "yes_no"):
            counter = Counter(values)
            data = {"counts": dict(counter), "labels": list(counter.keys())}
        elif question.type == "rating":
            nums = []
            for v in values:
                try:
                    nums.append(float(v))
                except (ValueError, TypeError):
                    pass
            avg = sum(nums) / len(nums) if nums else 0
            data = {"average": round(avg, 2), "distribution": dict(Counter(str(int(n)) for n in nums))}
        elif question.type == "number":
            nums = []
            for v in values:
                try:
                    nums.append(float(v))
                except (ValueError, TypeError):
                    pass
            avg = sum(nums) / len(nums) if nums else 0
            data = {"average": round(avg, 2), "values": nums}
        else:
            data = {"responses": values[:50]}  # cap to 50 for text

        question_summaries.append(
            schemas.QuestionSummary(
                question_id=question.id,
                question_title=question.title,
                question_type=question.type,
                total_answers=total_answers,
                data=data,
            )
        )

    return schemas.FormSummary(
        form_id=form_id,
        total_responses=total_responses,
        questions=question_summaries,
    )
