"""Seed database with sample forms, questions, AND actual responses for demo."""
import sys
import os
import random
import json

sys.path.insert(0, os.path.dirname(__file__))

from database import SessionLocal, engine, Base
import models
import uuid
from datetime import datetime, timezone, timedelta


def utcnow():
    return datetime.now(timezone.utc)


Base.metadata.create_all(bind=engine)

db = SessionLocal()

# Clear existing data
db.query(models.Answer).delete()
db.query(models.Response).delete()
db.query(models.Option).delete()
db.query(models.Question).delete()
db.query(models.Form).delete()
db.commit()

# ── Form 1: Customer Satisfaction Survey ────────────────────────────────────
form1 = models.Form(
    id=str(uuid.uuid4()),
    title="Customer Satisfaction Survey",
    description="Help us improve our service",
    is_published=True,
    response_count=0,
)
db.add(form1)
db.flush()

questions_f1 = [
    {"type": "short_text", "title": "What is your name?", "placeholder": "Type your answer here...", "required": True},
    {"type": "email", "title": "What is your email address?", "placeholder": "name@example.com", "required": True},
    {"type": "rating", "title": "How would you rate our service overall?", "required": True},
    {"type": "multiple_choice", "title": "What did you enjoy most?", "required": False,
     "options": ["Customer support", "Product quality", "Delivery speed", "Pricing", "Ease of use"]},
    {"type": "long_text", "title": "Any additional comments or suggestions?", "placeholder": "Share your thoughts...", "required": False},
]

q_ids_f1 = []
for i, q in enumerate(questions_f1):
    opts = q.pop("options", [])
    question = models.Question(id=str(uuid.uuid4()), form_id=form1.id, order_index=i, **q)
    db.add(question)
    db.flush()
    q_ids_f1.append({"id": question.id, "type": question.type, "options": opts})
    for j, label in enumerate(opts):
        db.add(models.Option(id=str(uuid.uuid4()), question_id=question.id, label=label, order_index=j))

# Seed 5 responses for Form 1
NAMES = ["Alice Johnson", "Bob Smith", "Carol Williams", "David Brown", "Emily Davis"]
EMAILS = ["alice@example.com", "bob@company.com", "carol@gmail.com", "david@work.org", "emily@mail.com"]
COMMENTS = [
    "Great service, very impressed!",
    "Could improve the delivery time slightly.",
    "Loved the product quality. Will buy again.",
    "The support team was incredibly helpful.",
    "Good overall, pricing is competitive.",
]

for idx in range(5):
    resp = models.Response(
        id=str(uuid.uuid4()),
        form_id=form1.id,
        respondent_id=str(uuid.uuid4()),
        submitted_at=utcnow() - timedelta(days=5 - idx, hours=random.randint(0, 12)),
    )
    db.add(resp)
    db.flush()

    for qinfo in q_ids_f1:
        if qinfo["type"] == "short_text":
            val = NAMES[idx]
        elif qinfo["type"] == "email":
            val = EMAILS[idx]
        elif qinfo["type"] == "rating":
            val = str(random.randint(3, 5))
        elif qinfo["type"] == "multiple_choice":
            chosen = random.sample(qinfo["options"], k=random.randint(1, 3))
            val = json.dumps(chosen)
        elif qinfo["type"] == "long_text":
            val = COMMENTS[idx]
        else:
            val = ""

        db.add(models.Answer(
            id=str(uuid.uuid4()),
            response_id=resp.id,
            question_id=qinfo["id"],
            value=val,
        ))

    form1.response_count += 1

# ── Form 2: Job Application ──────────────────────────────────────────────────
form2 = models.Form(
    id=str(uuid.uuid4()),
    title="Job Application Form",
    description="Apply for a position at our company",
    is_published=False,
    response_count=0,
)
db.add(form2)
db.flush()

questions_f2 = [
    {"type": "short_text", "title": "Full Name", "placeholder": "John Doe", "required": True},
    {"type": "email", "title": "Email Address", "placeholder": "john@example.com", "required": True},
    {"type": "dropdown", "title": "Which role are you applying for?", "required": True,
     "options": ["Frontend Engineer", "Backend Engineer", "Full Stack Engineer", "Product Designer", "Product Manager"]},
    {"type": "long_text", "title": "Tell us about yourself", "placeholder": "Your background, experience...", "required": True},
    {"type": "yes_no", "title": "Are you available to start immediately?", "required": True},
    {"type": "number", "title": "Years of experience", "placeholder": "e.g. 3", "required": True},
]

q_ids_f2 = []
for i, q in enumerate(questions_f2):
    opts = q.pop("options", [])
    question = models.Question(id=str(uuid.uuid4()), form_id=form2.id, order_index=i, **q)
    db.add(question)
    db.flush()
    q_ids_f2.append({"id": question.id, "type": question.type, "options": opts})
    for j, label in enumerate(opts):
        db.add(models.Option(id=str(uuid.uuid4()), question_id=question.id, label=label, order_index=j))

# Seed 3 responses for Form 2
APPLICANTS = [
    {"name": "Frank Garcia", "email": "frank@dev.io", "role": "Frontend Engineer", "bio": "5 years React/TypeScript experience, built several production SPAs.", "available": "Yes", "years": "5"},
    {"name": "Grace Lee", "email": "grace@design.co", "role": "Product Designer", "bio": "Figma expert with 3 years of SaaS product design experience.", "available": "No", "years": "3"},
    {"name": "Henry Wilson", "email": "henry@eng.com", "role": "Full Stack Engineer", "bio": "Full stack dev with Python/FastAPI + React. Love building APIs.", "available": "Yes", "years": "4"},
]

for idx, app in enumerate(APPLICANTS):
    resp = models.Response(
        id=str(uuid.uuid4()),
        form_id=form2.id,
        respondent_id=str(uuid.uuid4()),
        submitted_at=utcnow() - timedelta(days=3 - idx, hours=random.randint(0, 8)),
    )
    db.add(resp)
    db.flush()

    values_map = {
        "short_text": app["name"],
        "email": app["email"],
        "dropdown": json.dumps(app["role"]),
        "long_text": app["bio"],
        "yes_no": app["available"],
        "number": app["years"],
    }

    for qinfo in q_ids_f2:
        val = values_map.get(qinfo["type"], "")
        db.add(models.Answer(
            id=str(uuid.uuid4()),
            response_id=resp.id,
            question_id=qinfo["id"],
            value=val,
        ))

    form2.response_count += 1

# ── Form 3: Event Registration ───────────────────────────────────────────────
form3 = models.Form(
    id=str(uuid.uuid4()),
    title="Event Registration",
    description="Register for our upcoming conference",
    is_published=True,
    response_count=0,
)
db.add(form3)
db.flush()

questions_f3 = [
    {"type": "short_text", "title": "Your full name", "placeholder": "Type your name...", "required": True},
    {"type": "email", "title": "Email", "placeholder": "your@email.com", "required": True},
    {"type": "multiple_choice", "title": "Which sessions will you attend?", "required": True,
     "options": ["Opening Keynote", "Workshop A", "Workshop B", "Panel Discussion", "Networking Lunch"]},
    {"type": "yes_no", "title": "Do you have any dietary restrictions?", "required": False},
]

q_ids_f3 = []
for i, q in enumerate(questions_f3):
    opts = q.pop("options", [])
    question = models.Question(id=str(uuid.uuid4()), form_id=form3.id, order_index=i, **q)
    db.add(question)
    db.flush()
    q_ids_f3.append({"id": question.id, "type": question.type, "options": opts})
    for j, label in enumerate(opts):
        db.add(models.Option(id=str(uuid.uuid4()), question_id=question.id, label=label, order_index=j))

# Seed 4 responses for Form 3
ATTENDEES = [
    {"name": "Irene Martinez", "email": "irene@conf.io", "sessions": ["Opening Keynote", "Workshop A", "Networking Lunch"], "dietary": "No"},
    {"name": "Jack Thompson", "email": "jack@biz.com", "sessions": ["Opening Keynote", "Panel Discussion"], "dietary": "Yes"},
    {"name": "Karen Clark", "email": "karen@org.net", "sessions": ["Workshop B", "Networking Lunch"], "dietary": "No"},
    {"name": "Liam Anderson", "email": "liam@startup.co", "sessions": ["Opening Keynote", "Workshop A", "Workshop B", "Panel Discussion"], "dietary": "No"},
]

for idx, att in enumerate(ATTENDEES):
    resp = models.Response(
        id=str(uuid.uuid4()),
        form_id=form3.id,
        respondent_id=str(uuid.uuid4()),
        submitted_at=utcnow() - timedelta(days=2 - (idx % 2), hours=random.randint(0, 10)),
    )
    db.add(resp)
    db.flush()

    for qinfo in q_ids_f3:
        if qinfo["type"] == "short_text":
            val = att["name"]
        elif qinfo["type"] == "email":
            val = att["email"]
        elif qinfo["type"] == "multiple_choice":
            val = json.dumps(att["sessions"])
        elif qinfo["type"] == "yes_no":
            val = att["dietary"]
        else:
            val = ""

        db.add(models.Answer(
            id=str(uuid.uuid4()),
            response_id=resp.id,
            question_id=qinfo["id"],
            value=val,
        ))

    form3.response_count += 1

db.commit()
print("Database seeded successfully!")
print(f"  Form 1: Customer Satisfaction Survey  — {form1.response_count} responses")
print(f"  Form 2: Job Application Form          — {form2.response_count} responses")
print(f"  Form 3: Event Registration            — {form3.response_count} responses")
db.close()
