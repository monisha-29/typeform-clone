"use client";

import { use, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getForm, submitResponse } from "@/lib/api";
import type { Form, AnswerIn } from "@/lib/types";
import { ProgressBar, NavButtons } from "@/components/respondent/FlowUtils";
import { QuestionRenderer } from "@/components/respondent/QuestionRenderer";

export default function RespondentFlow(props: { params: Promise<{ formId: string }> }) {
  const params = use(props.params);
  const [form, setForm] = useState<Form | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    getForm(params.formId)
      .then(setForm)
      .catch(console.error);
  }, [params.formId]);

  const handleNext = useCallback(() => {
    if (!form) return;
    const currentQ = form.questions[currentIndex];
    const val = answers[currentQ.id];

    if (currentQ.required && (val === undefined || val === null || val === "")) {
      return; // Can't proceed if required and empty
    }

    if (currentIndex < form.questions.length - 1) {
      setCurrentIndex(c => c + 1);
    } else {
      handleSubmit();
    }
  }, [form, currentIndex, answers]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(c => c - 1);
    }
  }, [currentIndex]);

  const handleSubmit = async () => {
    if (!form || isSubmitting) return;
    setIsSubmitting(true);

    const formattedAnswers: AnswerIn[] = Object.entries(answers).map(([qid, val]) => ({
      question_id: qid,
      value: val
    }));

    try {
      await submitResponse(form.id, { answers: formattedAnswers });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        // Prevent default if it's not a textarea to allow shift+enter
        if (document.activeElement?.tagName !== "TEXTAREA") {
           e.preventDefault();
           handleNext();
        }
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        handlePrev();
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        handleNext();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev]);

  if (!form) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="animate-spin" style={{ width: 24, height: 24, border: "2px solid var(--border)", borderTopColor: "var(--ink)", borderRadius: "50%" }} />
      </div>
    );
  }

  if (!form.is_published && window.location.pathname.startsWith('/f/')) {
    // Basic check, normally we'd handle this better
  }

  if (submitted) {
    return (
      <div style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--paper)" }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          style={{ textAlign: "center" }}
        >
          <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 16 }}>Thank you!</div>
          <div style={{ fontSize: 18, color: "var(--ink-light)" }}>Your response has been submitted.</div>
        </motion.div>
      </div>
    );
  }

  if (form.questions.length === 0) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--paper)" }}>
        <div style={{ fontSize: 18, color: "var(--ink-light)" }}>This form has no questions.</div>
      </div>
    );
  }

  const currentQuestion = form.questions[currentIndex];

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "var(--paper)", position: "relative", overflow: "hidden" }}>
      <ProgressBar current={currentIndex} total={form.questions.length} />
      
      <div style={{ flex: 1, display: "flex", alignItems: "center", position: "relative" }}>
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            style={{ width: "100%", position: "absolute" }}
          >
            <QuestionRenderer
              question={currentQuestion}
              index={currentIndex}
              value={answers[currentQuestion.id]}
              onChange={(val) => setAnswers(p => ({ ...p, [currentQuestion.id]: val }))}
              onContinue={handleNext}
              isActive={true}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <NavButtons
        onUp={handlePrev}
        onDown={handleNext}
        canUp={currentIndex > 0}
        canDown={true}
      />
    </div>
  );
}
