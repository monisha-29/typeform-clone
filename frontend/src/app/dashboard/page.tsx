"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, MoreHorizontal, BarChart2, ExternalLink,
  Copy, Trash2, Edit3, ChevronDown, ChevronUp,
  LayoutGrid, List, X, Mic, Send, Users, Zap,
  HelpCircle, Grid, Diamond
} from "lucide-react";
import { getForms, createForm, deleteForm, duplicateForm, publishForm } from "@/lib/api";
import type { FormListItem } from "@/lib/types";
import { useToastStore } from "@/store/toastStore";
import { Modal } from "@/components/ui/Modal";

/* ─── helpers ──────────────────────────────────────────────────── */
function formatDate(d: string) {
  const date = new Date(d);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/* ─── Form colour thumbnail (salmon gradient like the screenshot) ─ */
function FormThumb({ title }: { title: string }) {
  const hues = [8, 16, 340, 200, 260, 140];
  const h = hues[title.length % hues.length];
  return (
    <div style={{
      width: 32, height: 32, borderRadius: 8, flexShrink: 0,
      background: `linear-gradient(135deg, hsl(${h},75%,62%) 0%, hsl(${h + 20},70%,50%) 100%)`,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{ width: 12, height: 9, borderRadius: 2, background: "rgba(255,255,255,0.6)" }} />
    </div>
  );
}

/* ─── Row context menu ──────────────────────────────────────────── */
function RowMenu({ form, onEdit, onPreview, onResults, onPublish, onDuplicate, onDelete }: {
  form: FormListItem;
  onEdit: () => void; onPreview: () => void; onResults: () => void;
  onPublish: () => void; onDuplicate: () => void; onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const items = [
    { label: "Edit", icon: <Edit3 size={14} />, action: onEdit },
    { label: "Preview", icon: <ExternalLink size={14} />, action: onPreview },
    { label: "Results", icon: <BarChart2 size={14} />, action: onResults },
    { label: form.is_published ? "Unpublish" : "Publish", icon: <Zap size={14} />, action: onPublish, divider: true },
    { label: "Duplicate", icon: <Copy size={14} />, action: onDuplicate },
    { label: "Delete", icon: <Trash2 size={14} />, action: onDelete, danger: true, divider: true },
  ];

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={e => { e.stopPropagation(); setOpen(o => !o); }}
        style={{
          width: 28, height: 28, borderRadius: 6, border: "none",
          background: open ? "#f0eef1" : "transparent",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          color: "#655d67", transition: "background 0.15s",
        }}
        onMouseEnter={e => (e.currentTarget.style.background = "#f0eef1")}
        onMouseLeave={e => { if (!open) e.currentTarget.style.background = "transparent"; }}
      >
        <MoreHorizontal size={15} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.12 }}
            style={{
              position: "absolute", right: 0, top: 32, zIndex: 100,
              background: "white", border: "1px solid #e5e1e5",
              borderRadius: 10, padding: "4px 0",
              boxShadow: "0 12px 32px rgba(0,0,0,0.16)", minWidth: 190,
              width: 200,
            }}
          >
            {items.map((item, i) => (
              <div key={i}>
                {item.divider && <div style={{ height: 1, background: "#f0eef1", margin: "4px 0" }} />}
                <button
                  onClick={e => { e.stopPropagation(); item.action(); setOpen(false); }}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 10,
                    padding: "8px 14px", border: "none", background: "none",
                    cursor: "pointer", fontSize: 13, fontFamily: "'Twklausanne 400', Arial, sans-serif",
                    color: item.danger ? "#ce5d55" : "#2a222b",
                    transition: "background 0.1s",
                    textAlign: "left",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = item.danger ? "#faf0f0" : "#f5f3f6")}
                  onMouseLeave={e => (e.currentTarget.style.background = "none")}
                >
                  <span style={{ color: item.danger ? "#ce5d55" : "#837a85" }}>{item.icon}</span>
                  {item.label}
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Main Dashboard ────────────────────────────────────────────── */
export default function DashboardPage() {
  const router = useRouter();
  const { addToast } = useToastStore();
  const [forms, setForms] = useState<FormListItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("New form");
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FormListItem | null>(null);
  const [bannerVisible, setBannerVisible] = useState(true);
  const [workspacesOpen, setWorkspacesOpen] = useState(true);
  const [privateOpen, setPrivateOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("Forms");
  const [sortOpen, setSortOpen] = useState(false);
  const [sort, setSort] = useState("Date created");
  const [aiInput, setAiInput] = useState("");

  const loadForms = async () => {
    try { setForms(await getForms()); }
    catch { addToast("Failed to load forms", "error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadForms(); }, []);

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      const form = await createForm({ title: newTitle.trim() });
      setCreateModalOpen(false);
      setNewTitle("New form");
      addToast("Form created!", "success");
      router.push(`/builder/${form.id}`);
    } catch { addToast("Failed to create form", "error"); }
    finally { setCreating(false); }
  };

  const handleDelete = async (form: FormListItem) => {
    try {
      await deleteForm(form.id);
      setForms(p => p.filter(f => f.id !== form.id));
      addToast("Form deleted", "success");
    } catch { addToast("Failed to delete form", "error"); }
    setDeleteTarget(null);
  };

  const handleDuplicate = async (form: FormListItem) => {
    try { await duplicateForm(form.id); addToast(`"${form.title}" duplicated`, "success"); loadForms(); }
    catch { addToast("Failed to duplicate", "error"); }
  };

  const handlePublish = async (form: FormListItem) => {
    try {
      await publishForm(form.id);
      addToast(form.is_published ? "Form unpublished" : "Form published!", "success");
      loadForms();
    } catch { addToast("Failed to update publish status", "error"); }
  };

  const filtered = forms.filter(f => f.title.toLowerCase().includes(search.toLowerCase()));
  const tabs = ["Forms", "Contacts", "Automations", "Research Flow"];
  const totalResponses = forms.reduce((acc, form) => acc + form.response_count, 0);
  const responseProgressPct = Math.min((totalResponses / 10) * 100, 100);

  /* ── sidebar colours ── */
  const S = { // style shorthands
    sidebarBg: "white",
    border: "#e5e1e5",
    text: "#2a222b",
    muted: "#837a85",
    active: "#f5f3f6",
    font: "'Twklausanne 400', Arial, sans-serif",
    font500: "'Twklausanne 500', Arial, sans-serif",
    font600: "'Twklausanne 600', Arial, sans-serif",
  };

  return (
    <div style={{ display: "flex", height: "100vh", flexDirection: "column", background: "#f8f7f9", fontFamily: S.font }}>

      {/* ── GLOBAL TOP NAV ─────────────────────────────────── */}
      <div style={{
        height: 48, background: "white", borderBottom: `1px solid ${S.border}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 20px", flexShrink: 0,
      }}>
        {/* Left: user */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "linear-gradient(135deg, #e05050, #c83030)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "white", fontSize: 12, fontWeight: 700, fontFamily: S.font600,
          }}>U</div>
          <span style={{ fontSize: 13, fontWeight: 500, color: S.text, fontFamily: S.font500 }}>Username</span>
          <ChevronDown size={13} color={S.muted} />
        </div>

        {/* Right: nav items */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {["Integrations", "Brand kit"].map(label => (
            <button key={label} style={{
              display: "flex", alignItems: "center", gap: 5, background: "none", border: "none",
              cursor: "pointer", fontSize: 13, color: S.muted, fontFamily: S.font,
            }}>
              {label === "Integrations" ? <Grid size={14} /> : <Diamond size={14} />}
              {label}
            </button>
          ))}
          <button style={{ background: "none", border: "none", cursor: "pointer", color: S.muted, display: "flex" }}>
            <HelpCircle size={16} />
          </button>
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "linear-gradient(135deg, #e05050, #c83030)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "white", fontSize: 11, fontWeight: 700, fontFamily: S.font600,
          }}>U</div>
        </div>
      </div>

      {/* ── RESPONSE BANNER ────────────────────────────────── */}
      <AnimatePresence>
        {bannerVisible && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 44, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              background: "#eefaf7", borderBottom: `1px solid #c5e8df`,
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: 10, overflow: "hidden", flexShrink: 0, position: "relative",
            }}
          >
            <Diamond size={15} color="#1a9b7a" />
            <span style={{ fontSize: 13, color: "#1a3a30", fontFamily: S.font }}>
              You can collect <strong>10 form responses</strong> this month for free.
            </span>
            <button style={{
              background: "#1a6b52", color: "white", border: "none",
              borderRadius: 6, padding: "5px 12px", fontSize: 12,
              cursor: "pointer", fontFamily: S.font500, fontWeight: 600,
            }}>
              Get more responses
            </button>
            <button
              onClick={() => setBannerVisible(false)}
              style={{
                position: "absolute", right: 16, background: "none", border: "none",
                cursor: "pointer", color: "#437060", display: "flex",
              }}
            >
              <X size={15} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── SUB NAV TABS ───────────────────────────────────── */}
      <div style={{
        background: "white", borderBottom: `1px solid ${S.border}`,
        display: "flex", alignItems: "center", padding: "0 20px",
        gap: 0, flexShrink: 0,
      }}>
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "12px 16px", border: "none", background: "none",
              cursor: "pointer", fontSize: 13, fontFamily: S.font500,
              color: activeTab === tab ? S.text : S.muted,
              borderBottom: activeTab === tab ? `2px solid ${S.text}` : "2px solid transparent",
              marginBottom: -1, transition: "color 0.15s",
              fontWeight: activeTab === tab ? 600 : 400,
            }}
          >
            {tab === "Forms" && <List size={14} />}
            {tab === "Contacts" && <Users size={14} />}
            {tab === "Automations" && <Zap size={14} />}
            {tab === "Research Flow" && <BarChart2 size={14} />}
            {tab}
            {tab === "Research Flow" && (
              <span style={{
                background: "#f5f3f6", border: `1px solid ${S.border}`,
                borderRadius: 4, padding: "1px 6px", fontSize: 10, color: S.muted,
                fontFamily: S.font600, fontWeight: 700,
              }}>Demo</span>
            )}
          </button>
        ))}
      </div>

      {/* ── BODY: SIDEBAR + CONTENT ─────────────────────────── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* ── LEFT SIDEBAR ─────────────────────────────────── */}
        <aside style={{
          width: 200, background: "white", borderRight: `1px solid ${S.border}`,
          display: "flex", flexDirection: "column", flexShrink: 0, overflowY: "auto",
        }}>
          {/* Create form button */}
          <div style={{ padding: "16px 12px 8px" }}>
            <button
              id="create-form-btn"
              onClick={() => setCreateModalOpen(true)}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 6,
                background: S.text, color: "white", border: "none",
                borderRadius: 8, padding: "9px 14px", fontSize: 13,
                cursor: "pointer", fontFamily: S.font600, fontWeight: 600,
                transition: "background 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "#3e3040")}
              onMouseLeave={e => (e.currentTarget.style.background = S.text)}
            >
              <Plus size={15} /> Create form
            </button>
          </div>

          {/* Search */}
          <div style={{ padding: "4px 12px 8px" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "#f5f3f6", borderRadius: 7, padding: "7px 10px",
            }}>
              <Search size={13} color={S.muted} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search"
                style={{
                  border: "none", background: "transparent", outline: "none",
                  fontSize: 13, color: S.text, width: "100%", fontFamily: S.font,
                }}
              />
            </div>
          </div>

          {/* Workspaces section */}
          <div style={{ padding: "8px 12px 0" }}>
            <button
              onClick={() => setWorkspacesOpen(o => !o)}
              style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                background: "none", border: "none", cursor: "pointer", padding: "4px 4px",
                fontSize: 12, color: S.muted, fontFamily: S.font600, fontWeight: 600,
              }}
            >
              <span>Workspaces</span>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Plus size={13} color={S.muted} />
                {workspacesOpen ? <ChevronUp size={12} color={S.muted} /> : <ChevronDown size={12} color={S.muted} />}
              </div>
            </button>

            {workspacesOpen && (
              <div style={{ marginTop: 4 }}>
                {/* Private section */}
                <button
                  onClick={() => setPrivateOpen(o => !o)}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                    background: "none", border: "none", cursor: "pointer", padding: "6px 6px",
                    fontSize: 12, color: S.muted, fontFamily: S.font,
                  }}
                >
                  <span style={{ fontWeight: 500 }}>Private</span>
                  {privateOpen ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                </button>

                {privateOpen && (
                  <button
                    style={{
                      width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                      background: "#f0eef1", border: "none", cursor: "pointer",
                      padding: "7px 10px", borderRadius: 7,
                      fontSize: 13, fontFamily: S.font500, color: S.text,
                    }}
                  >
                    <span>My workspace</span>
                    <span style={{
                      background: "#e5e1e5", color: S.muted, borderRadius: 4,
                      fontSize: 11, fontWeight: 700, padding: "1px 6px", fontFamily: S.font600,
                    }}>
                      {forms.length}
                    </span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Responses collected */}
          <div style={{ padding: "12px 16px", borderTop: `1px solid ${S.border}` }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: S.muted, fontFamily: S.font600, marginBottom: 6 }}>
              Responses collected
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: S.text, fontFamily: S.font600, marginBottom: 6 }}>
              {totalResponses}
            </div>
            <div style={{ height: 4, background: "#e5e1e5", borderRadius: 99, overflow: "hidden", marginBottom: 8 }}>
              <div style={{ height: "100%", width: `${responseProgressPct}%`, background: S.text, borderRadius: 99, transition: "width 0.3s ease-out" }} />
            </div>
            <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#a25fba", fontFamily: S.font, padding: 0 }}>
              Increase response limit
            </button>
          </div>

          {/* AI Input */}
          <div style={{ padding: "8px 12px 16px" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              border: `1px solid ${S.border}`, borderRadius: 8, padding: "8px 10px",
              background: "white",
            }}>
              <Mic size={13} color={S.muted} />
              <input
                value={aiInput}
                onChange={e => setAiInput(e.target.value)}
                placeholder="Ask Typeform AI"
                style={{
                  border: "none", background: "transparent", outline: "none",
                  fontSize: 12, color: S.text, flex: 1, fontFamily: S.font,
                }}
              />
              {aiInput && (
                <button style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 0 }}>
                  <Send size={12} color={S.muted} />
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* ── MAIN CONTENT ─────────────────────────────────── */}
        <main style={{ flex: 1, overflowY: "auto", background: "#f8f7f9" }}>

          {/* Workspace header */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "20px 28px 0",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h1 style={{
                fontSize: 18, fontWeight: 700, color: S.text,
                fontFamily: S.font600, letterSpacing: "-0.01em",
              }}>
                My workspace
              </h1>
              <button style={{ background: "none", border: "none", cursor: "pointer", color: S.muted, display: "flex", padding: 2 }}>
                <MoreHorizontal size={16} />
              </button>
              <button style={{
                display: "flex", alignItems: "center", gap: 5, background: "none",
                border: `1px solid ${S.border}`, borderRadius: 6, padding: "4px 10px",
                cursor: "pointer", fontSize: 12, color: S.muted, fontFamily: S.font,
              }}>
                <Users size={12} /> Invite
              </button>
              <button style={{ background: "none", border: "none", cursor: "pointer", color: S.muted, display: "flex", padding: 2 }}>
                <Diamond size={15} />
              </button>
            </div>

            {/* Sort + View toggle */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {/* Sort dropdown */}
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setSortOpen(o => !o)}
                  style={{
                    display: "flex", alignItems: "center", gap: 5,
                    background: "none", border: `1px solid ${S.border}`,
                    borderRadius: 6, padding: "5px 10px", cursor: "pointer",
                    fontSize: 12, color: S.muted, fontFamily: S.font,
                  }}
                >
                  <Grid size={12} /> {sort} <ChevronDown size={11} />
                </button>
                <AnimatePresence>
                  {sortOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.97 }}
                      transition={{ duration: 0.12 }}
                      style={{
                        position: "absolute", top: 32, right: 0, background: "white",
                        border: `1px solid ${S.border}`, borderRadius: 8, zIndex: 50,
                        boxShadow: "0 8px 24px rgba(0,0,0,0.10)", minWidth: 160, padding: "4px 0",
                      }}
                    >
                      {["Date created", "Last updated", "Alphabetical", "Responses"].map(opt => (
                        <button
                          key={opt}
                          onClick={() => { setSort(opt); setSortOpen(false); }}
                          style={{
                            width: "100%", padding: "8px 14px", border: "none",
                            background: sort === opt ? "#f5f3f6" : "none",
                            cursor: "pointer", fontSize: 13, color: S.text,
                            fontFamily: S.font, textAlign: "left",
                          }}
                        >
                          {opt}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* View mode toggle */}
              <div style={{
                display: "flex", border: `1px solid ${S.border}`,
                borderRadius: 6, overflow: "hidden",
              }}>
                {(["list", "grid"] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    style={{
                      padding: "5px 10px", border: "none", cursor: "pointer",
                      background: viewMode === mode ? "#f0eef1" : "white",
                      color: viewMode === mode ? S.text : S.muted,
                      display: "flex", alignItems: "center", transition: "all 0.15s",
                    }}
                  >
                    {mode === "list" ? <List size={14} /> : <LayoutGrid size={14} />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── LIST VIEW ──────────────────────────────────── */}
          {viewMode === "list" && (
            <div style={{ padding: "16px 28px" }}>
              {/* Table */}
              <div style={{
                background: "white", borderRadius: 10,
                border: `1px solid ${S.border}`, overflow: "visible",
              }}>
                {/* Table header */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 100px 100px 120px 100px 40px",
                  padding: "10px 16px", borderBottom: `1px solid ${S.border}`,
                  background: "white",
                }}>
                  {["", "Responses", "Completed", "Updated", "Integrations", ""].map((h, i) => (
                    <div key={i} style={{
                      fontSize: 12, color: S.muted, fontFamily: S.font600,
                      fontWeight: 600, textAlign: i === 0 ? "left" : "center",
                    }}>
                      {h}
                    </div>
                  ))}
                </div>

                {/* Loading */}
                {loading && [...Array(3)].map((_, i) => (
                  <div key={i} style={{
                    display: "grid", gridTemplateColumns: "1fr 100px 100px 120px 100px 40px",
                    padding: "14px 16px", borderBottom: `1px solid ${S.border}`,
                    alignItems: "center",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: "#f0eef1" }} />
                      <div style={{ height: 13, width: 120, borderRadius: 4, background: "#f0eef1" }} />
                    </div>
                    {[...Array(4)].map((_, j) => (
                      <div key={j} style={{ height: 12, width: 40, borderRadius: 4, background: "#f0eef1", margin: "0 auto" }} />
                    ))}
                  </div>
                ))}

                {/* Empty */}
                {!loading && filtered.length === 0 && (
                  <div style={{ padding: 48, textAlign: "center", color: S.muted }}>
                    <div style={{ fontSize: 15, fontFamily: S.font, marginBottom: 12 }}>
                      {search ? `No forms match "${search}"` : "No forms yet"}
                    </div>
                    {!search && (
                      <button
                        onClick={() => setCreateModalOpen(true)}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 6,
                          background: S.text, color: "white", border: "none",
                          borderRadius: 8, padding: "9px 18px", fontSize: 13,
                          cursor: "pointer", fontFamily: S.font600,
                        }}
                      >
                        <Plus size={14} /> Create your first form
                      </button>
                    )}
                  </div>
                )}

                {/* Rows */}
                <AnimatePresence>
                  {!loading && filtered.map((form) => (
                    <motion.div
                      key={form.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 100px 100px 120px 100px 40px",
                        padding: "12px 16px", borderBottom: `1px solid ${S.border}`,
                        alignItems: "center", cursor: "pointer", transition: "background 0.1s",
                      }}
                      onClick={() => router.push(`/builder/${form.id}`)}
                      onMouseEnter={e => (e.currentTarget.style.background = "#faf9fb")}
                      onMouseLeave={e => (e.currentTarget.style.background = "white")}
                    >
                      {/* Name */}
                      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                        <FormThumb title={form.title} />
                        <div style={{ minWidth: 0 }}>
                          <div style={{
                            fontSize: 13, fontWeight: 600, color: S.text,
                            fontFamily: S.font600, whiteSpace: "nowrap",
                            overflow: "hidden", textOverflow: "ellipsis",
                          }}>
                            {form.title}
                          </div>
                          {form.is_published && (
                            <div style={{ fontSize: 11, color: "#16a34a", fontFamily: S.font, marginTop: 2 }}>
                              Published
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Responses — clickable to results */}
                      <div
                        onClick={e => { e.stopPropagation(); router.push(`/results/${form.id}`); }}
                        style={{
                          textAlign: "center", fontSize: 13,
                          color: form.response_count > 0 ? "#a25fba" : S.muted,
                          fontFamily: S.font, cursor: "pointer",
                          textDecoration: form.response_count > 0 ? "underline" : "none",
                          transition: "color 0.15s",
                        }}
                        onMouseEnter={e => { if (form.response_count > 0) (e.currentTarget as HTMLDivElement).style.color = "#753a88"; }}
                        onMouseLeave={e => { if (form.response_count > 0) (e.currentTarget as HTMLDivElement).style.color = "#a25fba"; }}
                      >
                        {form.response_count > 0 ? form.response_count : "—"}
                      </div>

                      {/* Completed */}
                      <div style={{ textAlign: "center", fontSize: 13, color: S.muted, fontFamily: S.font }}>—</div>

                      {/* Updated */}
                      <div style={{ textAlign: "center", fontSize: 12, color: S.muted, fontFamily: S.font }}>
                        {formatDate(form.updated_at)}
                      </div>

                      {/* Integrations icon */}
                      <div style={{ display: "flex", justifyContent: "center" }}>
                        <button
                          onClick={e => { e.stopPropagation(); }}
                          style={{ background: "none", border: "none", cursor: "pointer", color: S.muted, display: "flex" }}
                        >
                          <Grid size={15} />
                        </button>
                      </div>

                      {/* Menu */}
                      <div style={{ display: "flex", justifyContent: "flex-end" }} onClick={e => e.stopPropagation()}>
                        <RowMenu
                          form={form}
                          onEdit={() => router.push(`/builder/${form.id}`)}
                          onPreview={() => window.open(`/f/${form.id}`, "_blank")}
                          onResults={() => router.push(`/results/${form.id}`)}
                          onPublish={() => handlePublish(form)}
                          onDuplicate={() => handleDuplicate(form)}
                          onDelete={() => setDeleteTarget(form)}
                        />
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* ── GRID VIEW ──────────────────────────────────── */}
          {viewMode === "grid" && (
            <div style={{ padding: "16px 28px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
              <AnimatePresence>
                {!loading && filtered.map(form => (
                  <motion.div
                    key={form.id}
                    layout
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(0,0,0,0.10)" }}
                    transition={{ duration: 0.18 }}
                    style={{
                      background: "white", border: `1px solid ${S.border}`,
                      borderRadius: 10, overflow: "hidden", cursor: "pointer",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                    }}
                    onClick={() => router.push(`/builder/${form.id}`)}
                  >
                    {/* Thumbnail */}
                    <div style={{
                      height: 130, display: "flex", alignItems: "center", justifyContent: "center",
                      background: "#f5f3f6", position: "relative",
                    }}>
                      <FormThumb title={form.title} />
                    </div>
                    <div style={{ padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: S.text, fontFamily: S.font600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {form.title}
                        </div>
                        <div style={{ fontSize: 11, color: S.muted, fontFamily: S.font, marginTop: 3 }}>
                          {formatDate(form.updated_at)}
                        </div>
                      </div>
                      <div onClick={e => e.stopPropagation()}>
                        <RowMenu
                          form={form}
                          onEdit={() => router.push(`/builder/${form.id}`)}
                          onPreview={() => window.open(`/f/${form.id}`, "_blank")}
                          onResults={() => router.push(`/results/${form.id}`)}
                          onPublish={() => handlePublish(form)}
                          onDuplicate={() => handleDuplicate(form)}
                          onDelete={() => setDeleteTarget(form)}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {!loading && filtered.length === 0 && (
                <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 48, color: S.muted, fontFamily: S.font }}>
                  {search ? `No forms match "${search}"` : "Create your first form"}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ── CREATE MODAL ──────────────────────────────────── */}
      <Modal open={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Name your form">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <input
            autoFocus
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleCreate()}
            placeholder="e.g. Customer Feedback"
            style={{
              width: "100%", padding: "10px 12px",
              border: `1px solid ${S.border}`, borderRadius: 8,
              fontSize: 14, fontFamily: S.font, outline: "none",
              color: S.text,
            }}
            onFocus={e => (e.currentTarget.style.borderColor = "#a25fba")}
            onBlur={e => (e.currentTarget.style.borderColor = S.border)}
          />
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button
              onClick={() => setCreateModalOpen(false)}
              style={{
                padding: "9px 18px", borderRadius: 8, border: `1px solid ${S.border}`,
                background: "white", cursor: "pointer", fontSize: 13, fontFamily: S.font600, color: S.text,
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={creating || !newTitle.trim()}
              style={{
                padding: "9px 18px", borderRadius: 8, border: "none",
                background: creating || !newTitle.trim() ? "#d4d1d5" : S.text,
                color: "white", cursor: creating ? "wait" : "pointer",
                fontSize: 13, fontFamily: S.font600, fontWeight: 600,
                transition: "background 0.15s",
              }}
            >
              {creating ? "Creating…" : "Create form"}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── DELETE MODAL ──────────────────────────────────── */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete form?">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <p style={{ fontSize: 14, color: S.muted, lineHeight: 1.6, fontFamily: S.font }}>
            Are you sure you want to delete{" "}
            <strong style={{ color: S.text }}>"{deleteTarget?.title}"</strong>?{" "}
            All responses will be permanently lost.
          </p>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button
              onClick={() => setDeleteTarget(null)}
              style={{
                padding: "9px 18px", borderRadius: 8, border: `1px solid ${S.border}`,
                background: "white", cursor: "pointer", fontSize: 13, fontFamily: S.font600, color: S.text,
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => deleteTarget && handleDelete(deleteTarget)}
              style={{
                padding: "9px 18px", borderRadius: 8, border: "none",
                background: "#ce5d55", color: "white", cursor: "pointer",
                fontSize: 13, fontFamily: S.font600, fontWeight: 600,
                display: "flex", alignItems: "center", gap: 6,
              }}
            >
              <Trash2 size={13} /> Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
