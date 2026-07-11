from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base
import models  # noqa: F401 — registers all ORM models
from routers import forms, questions, responses, summary

# Create all DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Typeform Clone API",
    version="1.0.0",
    description="Backend API for the Typeform clone assignment",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(forms.router)
app.include_router(questions.router)
app.include_router(responses.router)
app.include_router(summary.router)


@app.get("/")
def health():
    return {"status": "ok", "service": "typeform-clone-api"}
