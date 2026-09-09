"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { crmStore } from "@/lib/store";
import { Quotation } from "@/lib/types";
import { DataTable, Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useToast } from "@/components/ui/Toast";
import {
  getQuotationCustomerPDFDataUrl,
  getInternalCostingPDFDataUrl,
} from "@/lib/pdf";
import {
  FileText,
  Plus,
  Printer,
  Send,
  MessageSquare,
  DollarSign,
  Calendar,
  Sparkles,
  TrendingUp,
  RotateCcw,
  CheckCircle2,
  FileSpreadsheet,
  Eye,
  Trash2,
  ExternalLink,
} from "lucide-react";

export default function QuotationsListPage() {
  const { showToast } = useToast();
  const [quotations, setQuotations] = useState<Quotation[]>([]);

  useEffect(() => {
    setQuotations(crmStore.getQuotations());
  }, []);

  const totalQuotesCount = quotations.length;
  const totalValue = quotations.reduce((sum, q) => sum + (Number(q.total_amount) || 0), 0);
  const acceptedQuotes = quotations.filter((q) => q.status === "Accepted" || (q as any).status === "Confirmed");
  const acceptedValue = acceptedQuotes.reduce((sum, q) => sum + (Number(q.total_amount) || 0), 0);
  const revisionQuotesCount = quotations.filter((q) => (q.revision_number || 0) > 0).length;

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this quotation?")) {
      crmStore.deleteQuotation(id);
      setQuotations(crmStore.getQuotations());
      showToast("Quotation removed.", "info");
    }
  };

  const columns: Column<Quotation>[] = [
    {
      header: "Quote Reference",
      accessor: (q) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold flex-shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <Link
                href={`/quotations/${q.id}`}
                className="font-bold text-navy-950 font-mono text-xs hover:text-brand-600 hover:underline"
              >
                {q.quote_number}
              </Link>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-brand-50 text-brand-700 border border-brand-200">
                {q.revision_label || "Original"}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 line-clamp-1 max-w-xs">{q.tour_name}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Client & Contact",
      accessor: (q) => (
        <div>
          <strong className="text-navy-950 block text-xs">{q.client_name || "Valued Guest (Draft)"}</strong>
          <span className="text-[10px] text-slate-500 font-mono">{q.client_phone || q.client_email || "No contact info"}</span>
        </div>
      ),
    },
    {
      header: "Travel Dates & Pax",
      accessor: (q) => (
        <div className="text-xs">
          <span className="font-medium text-slate-800 block">
            {q.arrival_date || q.travel_start_date || "TBD"} → {q.departure_date || q.travel_end_date || "TBD"}
          </span>
          <span className="text-[10px] text-slate-500 font-semibold">
            {q.days_count || 1} Days / {q.nights_count || 1} Nights ({q.total_pax || 2} Pax)
          </span>
        </div>
      ),
    },
    {
      header: "Selling Investment",
      accessor: (q) => (
        <div>
          <div className="text-xs font-mono font-black text-navy-950">
            ${(q.total_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {q.currency || "USD"}
          </div>
          <span className="text-[10px] text-emerald-600 font-bold">
            ${(q.selling_pp_rate || (q.total_pax ? (q.total_amount || 0) / q.total_pax : 0)).toFixed(2)} / Pax
          </span>
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
          <Link
            href={`/quotations/${q.id}`}
            className="px-2.5 py-1 text-xs font-bold rounded-lg bg-navy-950 text-white hover:bg-brand-600 transition-colors"
          >
            Workspace
          </Link>

          <button
            type="button"
            onClick={() => {
              const url = getQuotationCustomerPDFDataUrl(q);
              const win = window.open();
              if (win) win.document.write(`<iframe src="${url}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
            }}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
            title="Preview Customer Proposal PDF"
          >
            <Eye className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              const url = getInternalCostingPDFDataUrl(q);
              const win = window.open();
              if (win) win.document.write(`<iframe src="${url}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
            }}
            className="p-1 text-amber-700 hover:bg-amber-50 rounded"
            title="Preview Internal Costing Sheet PDF"
          >
            <FileSpreadsheet className="w-4 h-4" />
          </button>

          {q.client_phone && (
            <a
              href={`https://wa.me/${q.client_phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                `Dear ${q.client_name || "Valued Guest"},\n\nYour official Dodoz Leisure tour proposal and quotation (${q.quote_number}) is ready.`
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
            type="button"
            onClick={(e) => handleDelete(q.id, e)}
            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
            title="Delete Quotation"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header & New Quote Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-brand-50 text-brand-700 border border-brand-200">
              Quotation & Costing Engine
            </span>
            <span className="text-xs text-slate-400 font-bold">COSTING SIMPLIFIED.xlsx Integration</span>
          </div>
          <h1 className="text-2xl font-extrabold text-navy-950 font-display tracking-tight mt-1">
            Client Quotations & Costing Proposals
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Create, cost, and revise travel proposals with automated vehicle KM rates, hotel multipliers, and instant voucher conversion.
          </p>
        </div>

        <Link
          href="/quotations/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-navy-950 hover:bg-brand-600 text-white text-xs font-bold shadow-soft transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Quotation</span>
        </Link>
      </div>

      {/* KPI Financial Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-soft">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Quotations</span>
          <div className="text-2xl font-black text-navy-950 font-display mt-0.5">{totalQuotesCount} Quotes</div>
          <span className="text-[10px] text-slate-500 font-medium">Pipeline: ${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-soft">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Confirmed Value</span>
          <div className="text-2xl font-black text-emerald-600 font-display mt-0.5">
            ${acceptedValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <span className="text-[10px] text-emerald-700 font-bold">{acceptedQuotes.length} Confirmed Bookings</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-soft">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Revisions</span>
          <div className="text-2xl font-black text-purple-600 font-display mt-0.5">{revisionQuotesCount} Revised</div>
          <span className="text-[10px] text-purple-700 font-medium">Version History Tracked</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-soft">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Costing Logic</span>
          <div className="text-sm font-extrabold text-brand-600 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Excel Matrix Active</span>
          </div>
          <span className="text-[10px] text-slate-400">Rates per KM, Batta & SGL/DBL/TPL</span>
        </div>
      </div>

      {/* Main Quotations DataTable */}
      <DataTable
        columns={columns}
        data={quotations}
        searchPlaceholder="Search quotation number, client name, or tour destination..."
      />
    </div>
  );
}
