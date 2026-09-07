"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "../ui/Modal";
import { TEMPLATE_TOKENS, interpolateTemplate } from "@/lib/templates";
import { GroupedHotelVoucher, EmailTemplate } from "@/lib/types";
import { crmStore } from "@/lib/store";
import { Send, Eye, Sparkles, Code2 } from "lucide-react";

interface EmailEditorModalProps {
  isOpen?: boolean;
  onClose: () => void;
  voucher: GroupedHotelVoucher | null;
  onSend: (voucher: GroupedHotelVoucher, customSubject?: string, customBody?: string) => void;
}

export function EmailEditorModal({
  isOpen = true,
  onClose,
  voucher,
  onSend,
}: EmailEditorModalProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [previewMode, setPreviewMode] = useState(false);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);

  useEffect(() => {
    if (!isOpen || !voucher) return;

    const tpls = crmStore.getTemplates();
    setTemplates(tpls);

    const defaultTpl = tpls.find((t) => t.is_default) || tpls[0];
    if (defaultTpl) {
      setSelectedTemplateId(defaultTpl.id);
      setSubject(defaultTpl.subject);
      setBody(defaultTpl.body);
    }
  }, [isOpen, voucher]);

  const handleTemplateChange = (tplId: string) => {
    setSelectedTemplateId(tplId);
    const chosen = templates.find((t) => t.id === tplId);
    if (chosen) {
      setSubject(chosen.subject);
      setBody(chosen.body);
    }
  };

  const insertToken = (token: string) => {
    setBody((prev) => prev + " " + token + " ");
  };

  if (!voucher) return null;

  const templateVars = {
    HOTEL_NAME: voucher.hotelName,
    CLIENT_NAME: voucher.clientName,
    TOUR_NUMBER: voucher.tourNumber,
    CHECK_IN: voucher.checkInStart,
    CHECK_OUT: voucher.checkInEnd,
    REFERENCE: voucher.reference,
    TOTAL_ROOMS: voucher.totalRooms,
  };

  const renderedSubject = interpolateTemplate(subject, templateVars);
  const renderedBody = interpolateTemplate(body, templateVars);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Compose Email — ${voucher.hotelName}`}
      subtitle={`Recipient: ${voucher.hotelEmail || "No Email Assigned"}`}
      maxWidth="3xl"
    >
      <div className="space-y-4">
        {/* Template Selector & Mode Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Preset Template:</span>
            <select
              value={selectedTemplateId}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-brand-500"
            >
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setPreviewMode(false)}
              className={`px-3 py-1 rounded-md font-semibold text-xs transition-colors ${
                !previewMode ? "bg-navy-950 text-white" : "text-slate-600 hover:text-navy-950"
              }`}
            >
              <Code2 className="w-3.5 h-3.5 inline mr-1" /> Edit Template
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode(true)}
              className={`px-3 py-1 rounded-md font-semibold text-xs transition-colors ${
                previewMode ? "bg-navy-950 text-white" : "text-slate-600 hover:text-navy-950"
              }`}
            >
              <Eye className="w-3.5 h-3.5 inline mr-1" /> Live Preview
            </button>
          </div>
        </div>

        {/* Dynamic Variable Chips */}
        {!previewMode && (
          <div className="p-3 bg-brand-50/50 border border-brand-100 rounded-xl space-y-1.5">
            <span className="text-[11px] font-bold text-brand-900 block">
              Click to insert dynamic token:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {TEMPLATE_TOKENS.map((t) => (
                <button
                  key={t.token}
                  type="button"
                  onClick={() => insertToken(t.token)}
                  className="px-2 py-0.5 rounded-md bg-white border border-brand-200 text-brand-700 text-[11px] font-mono hover:bg-brand-100 transition-colors"
                  title={`Example: ${t.example}`}
                >
                  {t.token}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Subject Line */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Subject Line</label>
          {previewMode ? (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-navy-950">
              {renderedSubject}
            </div>
          ) : (
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          )}
        </div>

        {/* Body Text */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Email Body Content</label>
          {previewMode ? (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 whitespace-pre-wrap leading-relaxed font-sans max-h-[300px] overflow-y-auto">
              {renderedBody}
            </div>
          ) : (
            <textarea
              rows={10}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full p-3.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none font-sans"
            />
          )}
        </div>

        {/* Attachment Note */}
        <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span className="flex items-center gap-1.5 font-medium">
            📄 Attached: <strong className="text-navy-950">hotel-voucher-{voucher.tourNumber}.pdf</strong>
          </span>
          <span className="text-[11px] text-slate-400">Generated on dispatch</span>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!voucher.hotelEmail}
            onClick={() => {
              onClose();
              onSend(voucher, renderedSubject, renderedBody);
            }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-navy-950 hover:bg-brand-600 text-white text-xs font-bold shadow-sm disabled:opacity-40"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Email with PDF</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
