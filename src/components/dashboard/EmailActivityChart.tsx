"use client";

import React from "react";
import { Mail, CheckCircle2, AlertCircle, Clock, Send } from "lucide-react";
import { EmailLog } from "@/lib/types";

interface EmailActivityChartProps {
  logs: EmailLog[];
}

export function EmailActivityChart({ logs }: EmailActivityChartProps) {
  const sent = logs.filter((l) => l.status === "sent").length;
  const failed = logs.filter((l) => l.status === "failed").length;
  const pending = logs.filter((l) => l.status === "pending").length;
  const total = logs.length || 1;

  const sentPct = Math.round((sent / total) * 100);
  const failedPct = Math.round((failed / total) * 100);
  const pendingPct = 100 - sentPct - failedPct;

  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-soft space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-navy-950 font-display">Email Voucher Dispatch Rate</h3>
          <p className="text-xs text-slate-500 mt-0.5">Live Hostinger SMTP Delivery Status</p>
        </div>
        <div className="p-2 rounded-xl bg-brand-50 text-brand-600">
          <Send className="w-4 h-4" />
        </div>
      </div>

      {/* Segmented Distribution Bar */}
      <div className="space-y-2">
        <div className="h-4 w-full rounded-full bg-slate-100 flex overflow-hidden p-0.5 border border-slate-200">
          <div
            style={{ width: `${sentPct}%` }}
            className="h-full bg-emerald-500 rounded-l-full transition-all duration-500"
            title={`Sent: ${sent} (${sentPct}%)`}
          />
          <div
            style={{ width: `${pendingPct}%` }}
            className="h-full bg-amber-400 transition-all duration-500"
            title={`Pending: ${pending} (${pendingPct}%)`}
          />
          <div
            style={{ width: `${failedPct}%` }}
            className="h-full bg-rose-500 rounded-r-full transition-all duration-500"
            title={`Failed: ${failed} (${failedPct}%)`}
          />
        </div>

        {/* Legend */}
        <div className="grid grid-cols-3 gap-2 pt-2 text-xs">
          <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
            <span className="flex items-center gap-1.5 text-emerald-800 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Delivered
            </span>
            <span className="text-lg font-extrabold text-emerald-950 font-display block mt-1">
              {sent} ({sentPct}%)
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-100">
            <span className="flex items-center gap-1.5 text-amber-800 font-bold">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              Pending
            </span>
            <span className="text-lg font-extrabold text-amber-950 font-display block mt-1">
              {pending} ({pendingPct}%)
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-rose-50/60 border border-rose-100">
            <span className="flex items-center gap-1.5 text-rose-800 font-bold">
              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
              Failed
            </span>
            <span className="text-lg font-extrabold text-rose-950 font-display block mt-1">
              {failed} ({failedPct}%)
            </span>
          </div>
        </div>
      </div>

      {/* Recent Dispatches Feed */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Recent Activity Logs
        </h4>
        <div className="space-y-1.5 max-h-40 overflow-y-auto">
          {logs.slice(0, 4).map((log) => (
            <div
              key={log.id}
              className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center justify-between text-xs"
            >
              <div className="min-w-0 pr-2">
                <span className="font-bold text-slate-900 block truncate">{log.hotel_name || log.recipient_email}</span>
                <span className="text-[10px] text-slate-500 block truncate">{log.subject}</span>
              </div>
              <span className="text-[10px] text-emerald-700 font-semibold px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200">
                Sent
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
