from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid
import copy

from database import get_db
import models
import schemas

router = APIRouter(prefix="/api/forms", tags=["forms"])


@router.get("", response_model=List[schemas.FormListItem])
def list_forms(db: Session = Depends(get_db)):
    return db.query(models.Form).order_by(models.Form.updated_at.desc()).all()


@router.post("", response_model=schemas.FormOut, status_code=status.HTTP_201_CREATED)
def create_form(payload: schemas.FormCreate, db: Session = Depends(get_db)):
    form = models.Form(
        id=str(uuid.uuid4()),
        title=payload.title,
        description=payload.description,
    )
    db.add(form)
    db.commit()
    db.refresh(form)
    return form


@router.get("/{form_id}", response_model=schemas.FormOut)
def get_form(form_id: str, db: Session = Depends(get_db)):
    form = db.query(models.Form).filter(models.Form.id == form_id).first()
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    return form


@router.patch("/{form_id}", response_model=schemas.FormOut)
def update_form(form_id: str, payload: schemas.FormUpdate, db: Session = Depends(get_db)):
    form = db.query(models.Form).filter(models.Form.id == form_id).first()
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    if payload.title is not None:
        form.title = payload.title
    if payload.description is not None:
        form.description = payload.description
    db.commit()
    db.refresh(form)
    return form


@router.delete("/{form_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_form(form_id: str, db: Session = Depends(get_db)):
    form = db.query(models.Form).filter(models.Form.id == form_id).first()
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    db.delete(form)
    db.commit()


@router.post("/{form_id}/publish", response_model=schemas.FormOut)
def toggle_publish(form_id: str, db: Session = Depends(get_db)):
    form = db.query(models.Form).filter(models.Form.id == form_id).first()
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    form.is_published = not form.is_published
    db.commit()
    db.refresh(form)
    return form


@router.post("/{form_id}/duplicate", response_model=schemas.FormOut, status_code=status.HTTP_201_CREATED)
def duplicate_form(form_id: str, db: Session = Depends(get_db)):
    original = db.query(models.Form).filter(models.Form.id == form_id).first()
    if not original:
        raise HTTPException(status_code=404, detail="Form not found")

    new_form = models.Form(
        id=str(uuid.uuid4()),
        title=f"Copy of {original.title}",
        description=original.description,
        is_published=False,
        response_count=0,
    )
    db.add(new_form)
    db.flush()

    for q in original.questions:
        new_q = models.Question(
            id=str(uuid.uuid4()),
            form_id=new_form.id,
            type=q.type,
            title=q.title,
            description=q.description,
            required=q.required,
            placeholder=q.placeholder,
            order_index=q.order_index,
        )
        db.add(new_q)
        db.flush()
        for opt in q.options:
            new_opt = models.Option(
                id=str(uuid.uuid4()),
                question_id=new_q.id,
                label=opt.label,
                order_index=opt.order_index,
            )
            db.add(new_opt)

    db.commit()
    db.refresh(new_form)
    return new_form
