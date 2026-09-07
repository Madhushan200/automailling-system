"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { crmStore } from "@/lib/store";
import { Quotation } from "@/lib/types";
import { DataTable, Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useToast } from "@/components/ui/Toast";
import {
  FileText,
  Plus,
  Printer,
  Send,
  MessageSquare,
  DollarSign,
  Calendar,
  Sparkles,
} from "lucide-react";

export default function QuotationsListPage() {
  const { showToast } = useToast();
  const [quotations, setQuotations] = useState<Quotation[]>([]);

  useEffect(() => {
    setQuotations(crmStore.getQuotations());
  }, []);

  const columns: Column<Quotation>[] = [
    {
      header: "Quote Reference",
      accessor: (q) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold flex-shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-navy-950 font-mono text-xs block">{q.quote_number}</span>
            <span className="text-[10px] text-slate-500 line-clamp-1 max-w-xs">{q.tour_name}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Client & Contact",
      accessor: (q) => (
        <div>
          <strong className="text-navy-950 block text-xs">{q.client_name}</strong>
          <span className="text-[10px] text-slate-500 font-mono">{q.client_phone || q.client_email}</span>
        </div>
      ),
    },
    {
      header: "Travel Dates",
      accessor: (q) => (
        <div className="text-xs">
          <span className="font-medium text-slate-800 block">
            {q.travel_start_date} → {q.travel_end_date}
          </span>
          <span className="text-[10px] text-slate-500">{q.duration_days} Days ({q.total_pax} Pax)</span>
        </div>
      ),
    },
    {
      header: "Quotation Total",
      accessor: (q) => (
        <div className="text-xs font-mono font-bold text-navy-950">
          ${q.total_amount?.toLocaleString()} {q.currency}
        </div>
      ),
    },
    {
      header: "Status",
      accessor: (q) => <StatusBadge status={q.status} size="sm" />,
    },
    {
      header: "Actions",
      className: "text-right",
      accessor: (q) => (
        <div className="flex items-center justify-end gap-1.5">
          {q.client_phone && (
            <a
              href={`https://wa.me/${q.client_phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                `Dear ${q.client_name},\n\nYour Dodoz Leisure official tour proposal & quotation (${q.quote_number}) is ready.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
              title="Send via WhatsApp"
            >
              <MessageSquare className="w-4 h-4" />
            </a>
          )}
          <button
            onClick={() => window.print()}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
          >
            Print
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-950 font-display tracking-tight">
            Client Quotations & Proposals
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Client-facing proposals with per-person / per-group pricing options, package inclusions, and cancellation policies.
          </p>
        </div>

        <Link
          href="/tours"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-navy-950 hover:bg-brand-600 text-white text-xs font-bold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Quote via Tour Workspace</span>
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={quotations}
        searchPlaceholder="Search quote number, client, or tour name..."
      />
    </div>
  );
}
