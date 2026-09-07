"use client";

import React from "react";
import { CheckCircle2, Clock, XCircle, Send, AlertCircle } from "lucide-react";

interface StatusBadgeProps {
  status: string;
  className?: string;
  size?: "sm" | "md";
}

export function StatusBadge({ status, className = "", size = "md" }: StatusBadgeProps) {
  const normalized = status?.toLowerCase() || "";

  let bg = "bg-slate-100 text-slate-700 border-slate-200";
  let icon = <Clock className="w-3 h-3 text-slate-500" />;

  if (["confirmed", "sent", "paid", "ready", "accepted", "completed"].includes(normalized)) {
    bg = "bg-emerald-50 text-emerald-700 border-emerald-200";
    icon = <CheckCircle2 className="w-3 h-3 text-emerald-600" />;
  } else if (["pending", "draft", "due", "quotation sent", "negotiation", "scheduled", "partial"].includes(normalized)) {
    bg = "bg-amber-50 text-amber-700 border-amber-200";
    icon = <Clock className="w-3 h-3 text-amber-600" />;
  } else if (["cancelled", "failed", "overdue", "rejected", "refunded"].includes(normalized)) {
    bg = "bg-rose-50 text-rose-700 border-rose-200";
    icon = <XCircle className="w-3 h-3 text-rose-600" />;
  } else if (["sending"].includes(normalized)) {
    bg = "bg-sky-50 text-sky-700 border-sky-200";
    icon = <Send className="w-3 h-3 text-sky-600 animate-pulse" />;
  } else if (["qualified", "new", "contacted"].includes(normalized)) {
    bg = "bg-blue-50 text-blue-700 border-blue-200";
    icon = <AlertCircle className="w-3 h-3 text-blue-600" />;
  }

  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border shadow-sm ${bg} ${sizeClasses} ${className}`}
    >
      {icon}
      <span className="capitalize">{status}</span>
    </span>
  );
}
