"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, BarChart2, Table as TableIcon } from "lucide-react";
import { getForm, getResponses, getFormSummary } from "@/lib/api";
import type { Form, ResponseOut, FormSummary } from "@/lib/types";

const S = {
  text: "#2a222b",
  muted: "#837a85",
  border: "#e5e1e5",
  bg: "#f8f7f9",
  font: "'Twklausanne 400', Arial, sans-serif",
  font500: "'Twklausanne 500', Arial, sans-serif",
  font600: "'Twklausanne 600', Arial, sans-serif",
};

export default function ResultsPage(props: { params: Promise<{ formId: string }> }) {
  const params = use(props.params);
  const [form, setForm] = useState<Form | null>(null);
  const [responses, setResponses] = useState<ResponseOut[]>([]);
  const [summary, setSummary] = useState<FormSummary | null>(null);
  const [activeTab, setActiveTab] = useState<"responses" | "summary">("responses");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getForm(params.formId),
      getResponses(params.formId),
      getFormSummary(params.formId)
    ])
      .then(([fData, rData, sData]) => {
        setForm(fData);
        setResponses(rData);
        setSummary(sData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.formId]);

  if (loading || !form) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: S.bg }}>
        <div className="animate-spin" style={{ width: 24, height: 24, border: `2px solid ${S.border}`, borderTopColor: S.text, borderRadius: "50%" }} />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: S.bg, fontFamily: S.font }}>
      {/* Top Navigation */}
      <header style={{
        height: 56, background: "white", borderBottom: `1px solid ${S.border}`,
        display: "flex", alignItems: "center", padding: "0 24px", gap: 16, flexShrink: 0,
      }}>
        <Link
          href="/dashboard"
          style={{
            display: "flex", alignItems: "center", padding: 6,
            color: S.muted, textDecoration: "none", borderRadius: 6,
            transition: "background 0.15s",
          }}
          onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.background = "#f0eef1")}
          onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.background = "transparent")}
        >
          <ChevronLeft size={20} />
        </Link>
        <div style={{ fontSize: 15, fontWeight: 600, color: S.text, fontFamily: S.font600 }}>
          {form.title}{" "}
          <span style={{ color: S.muted, fontWeight: 400, fontFamily: S.font }}>— Results</span>
        </div>
      </header>

      {/* Tabs */}
      <div style={{
        background: "white", borderBottom: `1px solid ${S.border}`,
        padding: "0 24px", display: "flex", gap: 0,
      }}>
        {[
          { key: "responses", label: `Responses (${responses.length})`, icon: <TableIcon size={14} /> },
          { key: "summary", label: "Summary", icon: <BarChart2 size={14} /> },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as "responses" | "summary")}
            style={{
              display: "flex", alignItems: "center", gap: 8, padding: "14px 20px",
              border: "none", background: "none", cursor: "pointer",
              fontSize: 13, fontWeight: activeTab === tab.key ? 600 : 400,
              fontFamily: activeTab === tab.key ? S.font600 : S.font,
              color: activeTab === tab.key ? S.text : S.muted,
              borderBottom: `2px solid ${activeTab === tab.key ? S.text : "transparent"}`,
              marginBottom: -1, transition: "color 0.15s",
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <main style={{ flex: 1, overflow: "auto", padding: 28 }}>
        {activeTab === "responses" && (
          <div style={{
            background: "white", border: `1px solid ${S.border}`,
            borderRadius: 10, overflow: "hidden",
          }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ background: "#faf9fb", borderBottom: `1px solid ${S.border}` }}>
                    <th style={{
                      padding: "12px 16px", fontSize: 12, fontWeight: 600,
                      color: S.muted, fontFamily: S.font600, whiteSpace: "nowrap",
                    }}>
                      Submitted At
                    </th>
                    {form.questions.map(q => (
                      <th key={q.id} style={{
                        padding: "12px 16px", fontSize: 12, fontWeight: 600,
                        color: S.muted, fontFamily: S.font600, whiteSpace: "nowrap",
                        maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis",
                      }}>
                        {q.title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {responses.length === 0 ? (
                    <tr>
                      <td
                        colSpan={form.questions.length + 1}
                        style={{
                          padding: 56, textAlign: "center", color: S.muted,
                          fontSize: 14, fontFamily: S.font,
                        }}
                      >
                        No responses yet.
                      </td>
                    </tr>
                  ) : (
                    responses.map(res => (
                      <tr key={res.id} style={{ borderBottom: `1px solid ${S.border}` }}>
                        <td style={{
                          padding: "12px 16px", fontSize: 13, color: S.text,
                          fontFamily: S.font, whiteSpace: "nowrap",
                        }}>
                          {new Date(res.submitted_at).toLocaleString()}
                        </td>
                        {form.questions.map(q => {
                          const ans = res.answers.find(a => a.question_id === q.id);
                          let valStr = "";
                          if (ans && ans.value !== null) {
                            try {
                              const parsed = JSON.parse(ans.value as string);
                              valStr = Array.isArray(parsed) ? parsed.join(", ") : String(parsed);
                            } catch {
                              valStr = String(ans.value);
                            }
                          }
                          return (
                            <td key={q.id} style={{
                              padding: "12px 16px", fontSize: 13, color: S.text,
                              fontFamily: S.font, maxWidth: 300,
                              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                            }}>
                              {valStr || "—"}
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "summary" && summary && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 800, margin: "0 auto" }}>
            {/* Summary stat cards */}
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16,
              marginBottom: 12,
            }}>
              <div style={{
                background: "white", border: `1px solid ${S.border}`,
                borderRadius: 10, padding: "20px 24px",
              }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: S.muted, fontFamily: S.font600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                  Total Responses
                </div>
                <div style={{ fontSize: 32, fontWeight: 700, color: S.text, fontFamily: S.font600 }}>
                  {summary.total_responses}
                </div>
              </div>
              <div style={{
                background: "white", border: `1px solid ${S.border}`,
                borderRadius: 10, padding: "20px 24px",
              }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: S.muted, fontFamily: S.font600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                  Questions
                </div>
                <div style={{ fontSize: 32, fontWeight: 700, color: S.text, fontFamily: S.font600 }}>
                  {summary.questions.length}
                </div>
              </div>
            </div>

            {summary.questions.map(q => (
              <div key={q.question_id} style={{
                background: "white", border: `1px solid ${S.border}`,
                borderRadius: 10, padding: 24,
              }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: S.text, fontFamily: S.font600, marginBottom: 4 }}>
                  {q.question_title}
                </h3>
                <div style={{ fontSize: 12, color: S.muted, fontFamily: S.font, marginBottom: 20 }}>
                  {q.total_answers} out of {summary.total_responses} people answered
                </div>

                {/* Bar chart for choice questions */}
                {q.data && (q.question_type === "multiple_choice" || q.question_type === "dropdown" || q.question_type === "yes_no") && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {(q.data as any).labels?.map((label: string) => {
                      const count = (q.data as any).counts[label] || 0;
                      const pct = q.total_answers > 0 ? (count / q.total_answers) * 100 : 0;
                      return (
                        <div key={label} style={{ display: "flex", alignItems: "center", gap: 16 }}>
                          <div style={{
                            width: 130, fontSize: 13, color: S.text, fontFamily: S.font,
                            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                          }}>
                            {label}
                          </div>
                          <div style={{ flex: 1, height: 8, background: "#f0eef1", borderRadius: 99, overflow: "hidden" }}>
                            <div style={{
                              height: "100%", width: `${pct}%`,
                              background: "linear-gradient(90deg, #a25fba, #7b3fa0)",
                              borderRadius: 99, transition: "width 0.4s ease",
                            }} />
                          </div>
                          <div style={{ width: 48, fontSize: 12, color: S.muted, fontFamily: S.font, textAlign: "right" }}>
                            {count}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Average for numeric/rating */}
                {q.data && (q.question_type === "rating" || q.question_type === "number") && (
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <div style={{ fontSize: 44, fontWeight: 700, color: S.text, fontFamily: S.font600, letterSpacing: "-0.02em" }}>
                      {(q.data as any).average}
                    </div>
                    <div style={{ fontSize: 15, color: S.muted, fontFamily: S.font }}>Average</div>
                  </div>
                )}

                {/* Text responses */}
                {q.data && (q.question_type === "short_text" || q.question_type === "long_text" || q.question_type === "email") && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {(q.data as any).responses?.map((resp: string, idx: number) => (
                      <div key={idx} style={{
                        padding: "12px 16px", background: "#faf9fb",
                        borderRadius: 8, fontSize: 13, color: S.text,
                        fontFamily: S.font, border: `1px solid ${S.border}`,
                      }}>
                        {resp}
                      </div>
                    ))}
                    {(!(q.data as any).responses || (q.data as any).responses?.length === 0) && (
                      <div style={{ fontSize: 13, color: S.muted, fontFamily: S.font }}>No text responses yet.</div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {summary.questions.length === 0 && (
              <div style={{
                textAlign: "center", color: S.muted, padding: 56,
                fontSize: 14, fontFamily: S.font,
              }}>
                No data to summarize yet.
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
