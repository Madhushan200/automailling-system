"use client";

import React, { useState } from "react";
import {
  Building2,
  Mail,
  Calendar,
  Eye,
  Send,
  CheckCircle2,
  AlertTriangle,
  FileText,
  UserCheck,
  Edit2,
  Check,
  Save,
  Clock,
  Sparkles,
  BedDouble,
  Utensils,
} from "lucide-react";
import { GroupedHotelVoucher } from "@/lib/types";
import { StatusBadge } from "../ui/StatusBadge";

interface HotelVoucherCardProps {
  voucher: GroupedHotelVoucher;
  onUpdateEmail: (id: string, newEmail: string) => void;
  onSaveToDirectory: (hotelName: string, email: string) => void;
  onPreviewPDF: (voucher: GroupedHotelVoucher) => void;
  onEditEmailContent: (voucher: GroupedHotelVoucher) => void;
  onSendSingle: (voucher: GroupedHotelVoucher) => void;
  isSending?: boolean;
}

export function HotelVoucherCard({
  voucher,
  onUpdateEmail,
  onSaveToDirectory,
  onPreviewPDF,
  onEditEmailContent,
  onSendSingle,
  isSending = false,
}: HotelVoucherCardProps) {
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [emailInput, setEmailInput] = useState(voucher.hotelEmail || "");

  const handleSaveEmail = () => {
    onUpdateEmail(voucher.id, emailInput);
    setIsEditingEmail(false);
  };

  const totalSgl = voucher.rows.reduce((sum, r) => sum + (r.sgl || 0), 0);
  const totalDbl = voucher.rows.reduce((sum, r) => sum + (r.dbl || 0), 0);
  const totalTpl = voucher.rows.reduce((sum, r) => sum + (r.tpl || 0), 0);

  const mealPlans = Array.from(new Set(voucher.rows.map((r) => r.mealPlan || "HB"))).join(", ");

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft overflow-hidden transition-all duration-200 hover:shadow-card">
      {/* Top Banner */}
      <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3.5 bg-slate-50/40">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-navy-950 text-white flex items-center justify-center shadow-sm flex-shrink-0">
            <Building2 className="w-5 h-5 text-brand-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-navy-950 font-display">{voucher.hotelName}</h3>
              {voucher.emailStatus === "matched" ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Directory Matched
                </span>
              ) : voucher.emailStatus === "custom" ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                  <FileText className="w-3 h-3 text-sky-600" /> Excel Extracted
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  <AlertTriangle className="w-3 h-3 text-amber-600" /> Email Missing
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500 mt-0.5">
              Tour: <span className="font-semibold text-slate-700">{voucher.tourNumber}</span> • Client:{" "}
              <span className="font-semibold text-slate-700">{voucher.clientName}</span> • Ref:{" "}
              <span className="font-mono text-slate-600">{voucher.reference}</span>
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          {voucher.sendState === "sent" ? (
            <StatusBadge status="sent" />
          ) : voucher.sendState === "failed" ? (
            <StatusBadge status="failed" />
          ) : voucher.sendState === "sending" ? (
            <StatusBadge status="sending" />
          ) : (
            <StatusBadge status="draft" />
          )}
        </div>
      </div>

      {/* Hotel Email & Summary Dock */}
      <div className="px-5 py-3.5 bg-brand-50/20 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        {/* Email Bar */}
        <div className="flex items-center gap-2 flex-1">
          <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
          {isEditingEmail ? (
            <div className="flex items-center gap-1.5 w-full max-w-md">
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Enter hotel reservation email..."
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <button
                onClick={handleSaveEmail}
                className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                title="Save Email"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className={voucher.hotelEmail ? "font-medium text-slate-800" : "text-amber-600 font-medium italic"}>
                {voucher.hotelEmail || "No reservation email assigned"}
              </span>
              <button
                onClick={() => setIsEditingEmail(true)}
                className="p-1 text-slate-400 hover:text-brand-600 hover:bg-slate-100 rounded"
                title="Edit Email"
              >
                <Edit2 className="w-3 h-3" />
              </button>

              {voucher.hotelEmail && voucher.emailStatus !== "matched" && (
                <button
                  onClick={() => onSaveToDirectory(voucher.hotelName, voucher.hotelEmail)}
                  className="text-[10px] text-brand-600 hover:underline font-semibold flex items-center gap-1 ml-2"
                >
                  <Save className="w-2.5 h-2.5" /> Save to Directory
                </button>
              )}
            </div>
          )}
        </div>

        {/* Accommodation Counters */}
        <div className="flex items-center gap-3 text-slate-600 flex-shrink-0 font-medium">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            {voucher.checkInStart} → {voucher.checkInEnd} ({voucher.rows.length} {voucher.rows.length === 1 ? "Day" : "Days"})
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 font-semibold text-brand-700">
            <BedDouble className="w-3.5 h-3.5 text-brand-500" />
            {voucher.totalRooms} Rooms ({totalDbl} DBL, {totalSgl} SGL, {totalTpl} TPL)
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Utensils className="w-3.5 h-3.5 text-slate-400" />
            {mealPlans}
          </span>
        </div>
      </div>

      {/* Row Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="px-5 py-2.5">Date</th>
              <th className="px-3 py-2.5 text-center">Meal</th>
              <th className="px-3 py-2.5 text-center">SGL</th>
              <th className="px-3 py-2.5 text-center">DBL</th>
              <th className="px-3 py-2.5 text-center">TPL</th>
              <th className="px-4 py-2.5">Room Category</th>
              <th className="px-5 py-2.5">Special Notes & Requests</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {voucher.rows.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-slate-50/50">
                <td className="px-5 py-2.5 font-medium text-slate-900">{row.date || `Day ${rIdx + 1}`}</td>
                <td className="px-3 py-2.5 text-center font-bold text-brand-600">{row.mealPlan || "HB"}</td>
                <td className="px-3 py-2.5 text-center">{row.sgl || "—"}</td>
                <td className="px-3 py-2.5 text-center">{row.dbl || "—"}</td>
                <td className="px-3 py-2.5 text-center">{row.tpl || "—"}</td>
                <td className="px-4 py-2.5">{row.roomType || "Standard / Deluxe"}</td>
                <td className="px-5 py-2.5 text-slate-500 italic truncate max-w-xs">
                  {row.specialRequest || row.remarks || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Card Action Dock */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/30 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPreviewPDF(voucher)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-brand-600" />
            <span>Preview Graphical PDF</span>
          </button>

          <button
            type="button"
            onClick={() => onEditEmailContent(voucher)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition-colors"
          >
            <Mail className="w-3.5 h-3.5 text-slate-500" />
            <span>Edit Email Template</span>
          </button>
        </div>

        <div>
          <button
            type="button"
            disabled={!voucher.hotelEmail || isSending}
            onClick={() => onSendSingle(voucher)}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-navy-950 hover:bg-brand-600 text-white text-xs font-bold shadow-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Hotel Voucher</span>
          </button>
        </div>
      </div>
    </div>
  );
}
