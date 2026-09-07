"use client";

import React, { useState, useEffect } from "react";
import { EmailTemplate } from "@/lib/types";
import { crmStore } from "@/lib/store";
import { useToast } from "@/components/ui/Toast";
import { TEMPLATE_TOKENS, interpolateTemplate } from "@/lib/templates";
import { Mail, Plus, Save, Trash2, Eye, Code2, Sparkles, CheckCircle2 } from "lucide-react";

export default function EmailTemplatesPage() {
  const { showToast } = useToast();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [activeTemplateId, setActiveTemplateId] = useState<string>("");
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    const list = crmStore.getTemplates();
    setTemplates(list);
    if (list.length > 0) {
      loadTemplate(list[0]);
    }
  }, []);

  const loadTemplate = (tpl: EmailTemplate) => {
    setActiveTemplateId(tpl.id);
    setName(tpl.name);
    setSubject(tpl.subject);
    setBody(tpl.body);
  };

  const handleSave = () => {
    if (!name || !subject || !body) {
      showToast("Please fill in all template fields", "warning");
      return;
    }

    const updated = templates.map((t) =>
      t.id === activeTemplateId ? { ...t, name, subject, body, updated_at: new Date().toISOString() } : t
    );

    setTemplates(updated);
    crmStore.saveTemplates(updated);
    showToast(`Saved template "${name}"!`, "success");
  };

  const handleCreateNew = () => {
    const newTpl: EmailTemplate = {
      id: `tpl-${Date.now()}`,
      category: "hotel_voucher",
      name: "Custom Agency Voucher Notification",
      subject: "Official Hotel Voucher — {{TOUR_NUMBER}} ({{CLIENT_NAME}})",
      body: `Dear Reservations Team at {{HOTEL_NAME}},\n\nWarm greetings from Dodoz Leisure!\n\nPlease find attached the official Hotel Accommodation Voucher for {{CLIENT_NAME}} under Tour Number {{TOUR_NUMBER}}.\n\nCheck-in Date: {{CHECK_IN}}\nCheck-out Date: {{CHECK_OUT}}\nTotal Rooms: {{TOTAL_ROOMS}}\n\nKindly confirm this reservation.\n\nWarm regards,\nDodoz Leisure Reservations Team`,
      is_default: false,
      created_at: new Date().toISOString(),
    };

    const nextList = [...templates, newTpl];
    setTemplates(nextList);
    crmStore.saveTemplates(nextList);
    loadTemplate(newTpl);
    showToast("Created new email template draft", "success");
  };

  const insertToken = (token: string) => {
    setBody((prev) => prev + " " + token + " ");
  };

  const sampleVars = {
    HOTEL_NAME: "The Kingsbury Colombo",
    CLIENT_NAME: "Dr. Jonathan Hayes & Family",
    TOUR_NUMBER: "DZ-2026-001",
    CHECK_IN: "2026-10-15",
    CHECK_OUT: "2026-10-17",
    REFERENCE: "REF-HAYES-01",
    TOTAL_ROOMS: "2",
  };

  const renderedSubject = interpolateTemplate(subject, sampleVars);
  const renderedBody = interpolateTemplate(body, sampleVars);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-950 font-display tracking-tight">
            Email Templates & Token Studio
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Customize automated email subject lines and message bodies sent to hotel reservation desks.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreateNew}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-navy-950 hover:bg-brand-600 text-white text-xs font-bold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Template</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template List Sidebar */}
        <div className="space-y-2 lg:col-span-1">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Saved Templates</h3>
          <div className="space-y-2">
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                onClick={() => loadTemplate(tpl)}
                className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                  activeTemplateId === tpl.id
                    ? "bg-navy-950 text-white border-navy-900 shadow-card"
                    : "bg-white text-slate-800 border-slate-200/90 hover:border-brand-300 shadow-soft"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold truncate">{tpl.name}</h4>
                  {tpl.is_default && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        activeTemplateId === tpl.id
                          ? "bg-brand-500/30 text-brand-300"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      Default
                    </span>
                  )}
                </div>
                <p
                  className={`text-[11px] truncate mt-1 ${
                    activeTemplateId === tpl.id ? "text-slate-300" : "text-slate-500"
                  }`}
                >
                  {tpl.subject}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Editor Area */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-soft space-y-4">
            {/* Header & Mode Switch */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex-1">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-base font-bold text-navy-950 font-display border-b border-transparent hover:border-slate-300 focus:border-brand-500 focus:outline-none w-full pb-1"
                />
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setPreviewMode(false)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      !previewMode ? "bg-white text-navy-950 shadow-sm" : "text-slate-600 hover:text-navy-950"
                    }`}
                  >
                    <Code2 className="w-3.5 h-3.5 inline mr-1" /> Template Code
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode(true)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      previewMode ? "bg-white text-navy-950 shadow-sm" : "text-slate-600 hover:text-navy-950"
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5 inline mr-1" /> Live Preview
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleSave}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-navy-950 hover:bg-brand-600 text-white text-xs font-bold shadow-sm transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Template</span>
                </button>
              </div>
            </div>

            {/* Token Chips */}
            {!previewMode && (
              <div className="p-3 bg-brand-50/50 border border-brand-100 rounded-xl space-y-1.5">
                <span className="text-[11px] font-bold text-brand-900 block">Click token to insert:</span>
                <div className="flex flex-wrap gap-1.5">
                  {TEMPLATE_TOKENS.map((t) => (
                    <button
                      key={t.token}
                      type="button"
                      onClick={() => insertToken(t.token)}
                      className="px-2.5 py-1 rounded-lg bg-white border border-brand-200 text-brand-700 text-xs font-mono hover:bg-brand-100 shadow-xs transition-colors"
                    >
                      {t.token}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Subject */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Subject Template</label>
              {previewMode ? (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-navy-950">
                  {renderedSubject}
                </div>
              ) : (
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              )}
            </div>

            {/* Body */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Body</label>
              {previewMode ? (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 whitespace-pre-wrap leading-relaxed min-h-[300px] font-sans">
                  {renderedBody}
                </div>
              ) : (
                <textarea
                  rows={14}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full p-3.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none font-mono"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
