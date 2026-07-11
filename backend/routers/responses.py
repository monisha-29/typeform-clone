from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid
import json

from database import get_db
import models
import schemas

router = APIRouter(tags=["responses"])


@router.post(
    "/api/forms/{form_id}/responses",
    response_model=schemas.ResponseOut,
    status_code=status.HTTP_201_CREATED,
)
def submit_response(
    form_id: str, payload: schemas.ResponseSubmit, db: Session = Depends(get_db)
):
    form = db.query(models.Form).filter(models.Form.id == form_id).first()
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    if not form.is_published:
        raise HTTPException(status_code=403, detail="Form is not published")

    response = models.Response(
        id=str(uuid.uuid4()),
        form_id=form_id,
        respondent_id=payload.respondent_id or str(uuid.uuid4()),
    )
    db.add(response)
    db.flush()

    for ans in payload.answers:
        value = ans.value
        if not isinstance(value, str):
            value = json.dumps(value)
        db.add(
            models.Answer(
                id=str(uuid.uuid4()),
                response_id=response.id,
                question_id=ans.question_id,
                value=value,
            )
        )

    form.response_count = (form.response_count or 0) + 1
    db.commit()
    db.refresh(response)
    return response


@router.get(
    "/api/forms/{form_id}/responses", response_model=List[schemas.ResponseOut]
)
def list_responses(form_id: str, db: Session = Depends(get_db)):
    form = db.query(models.Form).filter(models.Form.id == form_id).first()
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    return (
        db.query(models.Response)
        .filter(models.Response.form_id == form_id)
        .order_by(models.Response.submitted_at.desc())
        .all()
    )


@router.get(
    "/api/forms/{form_id}/responses/{response_id}",
    response_model=schemas.ResponseOut,
)
def get_response(form_id: str, response_id: str, db: Session = Depends(get_db)):
    response = (
        db.query(models.Response)
        .filter(
            models.Response.id == response_id,
            models.Response.form_id == form_id,
        )
        .first()
    )
    if not response:
        raise HTTPException(status_code=404, detail="Response not found")
    return response
