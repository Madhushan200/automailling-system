"use client";

import React from "react";
import { Modal } from "../ui/Modal";
import { CheckCircle2, AlertCircle, Loader2, Send, RotateCcw, X } from "lucide-react";
import { GroupedHotelVoucher } from "@/lib/types";

interface BulkSendModalProps {
  isOpen: boolean;
  onClose: () => void;
  vouchers: GroupedHotelVoucher[];
  currentIndex: number;
  isCompleted: boolean;
  onRetryFailed: () => void;
}

export function BulkSendModal({
  isOpen,
  onClose,
  vouchers,
  currentIndex,
  isCompleted,
  onRetryFailed,
}: BulkSendModalProps) {
  if (!isOpen) return null;

  const total = vouchers.length;
  const sentCount = vouchers.filter((v) => v.sendState === "sent").length;
  const failedCount = vouchers.filter((v) => v.sendState === "failed").length;
  const progressPercent = total > 0 ? Math.round(((sentCount + failedCount) / total) * 100) : 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={isCompleted ? onClose : () => {}}
      title={isCompleted ? "Bulk Voucher Dispatch Completed" : "Dispatching Hotel Vouchers..."}
      subtitle={`Processing ${total} Hotel Vouchers via Nodemailer SMTP`}
      maxWidth="xl"
    >
      <div className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>
              Overall Progress: <strong className="text-brand-600">{sentCount + failedCount}</strong> of{" "}
              <strong>{total}</strong> Dispatched
            </span>
            <span className="font-mono text-brand-600 font-bold">{progressPercent}%</span>
          </div>

          <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden p-0.5 border border-slate-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-500 to-emerald-500 transition-all duration-300 shadow-sm"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Live Hotel Queue List */}
        <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-64 overflow-y-auto bg-slate-50/40">
          {vouchers.map((v, idx) => (
            <div key={v.id} className="p-3 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                  {idx + 1}
                </span>
                <div className="truncate">
                  <span className="font-bold text-navy-950 block truncate">{v.hotelName}</span>
                  <span className="text-[10px] text-slate-400 block truncate">
                    {v.hotelEmail || "Missing Email"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                {v.sendState === "sending" ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200 animate-pulse">
                    <Loader2 className="w-3 h-3 animate-spin" /> Sending...
                  </span>
                ) : v.sendState === "sent" ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Dispatched
                  </span>
                ) : v.sendState === "failed" ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    <AlertCircle className="w-3 h-3 text-rose-600" /> Failed
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500">
                    Waiting in Queue
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Completion & Error Stats */}
        {isCompleted && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="text-xs space-y-0.5">
              <div className="font-bold text-navy-950">Summary Result</div>
              <p className="text-slate-500">
                <span className="text-emerald-700 font-semibold">{sentCount} Successful</span>
                {failedCount > 0 && <span className="text-rose-600 font-semibold"> • {failedCount} Failed</span>}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {failedCount > 0 && (
                <button
                  type="button"
                  onClick={onRetryFailed}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 text-white font-bold text-xs hover:bg-amber-600 shadow-sm"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retry Failed</span>
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg bg-navy-950 text-white font-bold text-xs hover:bg-brand-600 shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
