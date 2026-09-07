"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { crmStore } from "@/lib/store";
import { Invoice } from "@/lib/types";
import { DataTable, Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useToast } from "@/components/ui/Toast";
import {
  Receipt,
  Plus,
  Printer,
  DollarSign,
  Calendar,
  CheckCircle2,
  FileText,
} from "lucide-react";

export default function InvoicesListPage() {
  const { showToast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    setInvoices(crmStore.getInvoices());
  }, []);

  const totalInvoiced = invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + (inv.paid_amount || 0), 0);
  const totalBalance = totalInvoiced - totalPaid;

  const columns: Column<Invoice>[] = [
    {
      header: "Invoice Number",
      accessor: (inv) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold flex-shrink-0">
            <Receipt className="w-4 h-4 text-brand-600" />
          </div>
          <div>
            <span className="font-bold text-navy-950 font-mono text-xs block">{inv.invoice_number}</span>
            <span className="text-[10px] text-brand-600 font-mono">{inv.tour_number || "DIRECT"}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Client & Billing",
      accessor: (inv) => (
        <div>
          <strong className="text-navy-950 block text-xs">{inv.client_name}</strong>
          <span className="text-[10px] text-slate-500">{inv.client_email}</span>
        </div>
      ),
    },
    {
      header: "Dates",
      accessor: (inv) => (
        <div className="text-xs text-slate-600">
          <span>Issued: {inv.issue_date}</span>
          <span className="text-[10px] text-slate-400 block">Due: {inv.due_date}</span>
        </div>
      ),
    },
    {
      header: "Total & Balance",
      accessor: (inv) => (
        <div className="text-xs font-mono font-bold">
          <span className="text-navy-950 block">${inv.total_amount?.toLocaleString()} {inv.currency}</span>
          <span className={`text-[10px] font-sans font-semibold ${inv.balance_due > 0 ? "text-amber-600" : "text-emerald-600"}`}>
            {inv.balance_due > 0 ? `Due: $${inv.balance_due}` : "Paid in Full"}
          </span>
        </div>
      ),
    },
    {
      header: "Status",
      accessor: (inv) => <StatusBadge status={inv.status} size="sm" />,
    },
    {
      header: "Actions",
      className: "text-right",
      accessor: (inv) => (
        <button
          onClick={() => window.print()}
          className="px-3 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
        >
          Print PDF
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-950 font-display tracking-tight">
            Customer Invoices & Billing
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Official commercial invoices generated for clients and corporate travel partners.
          </p>
        </div>

        <Link
          href="/tours"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-navy-950 hover:bg-brand-600 text-white text-xs font-bold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Generate from Tour Workspace</span>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-soft space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Total Invoiced</span>
          <div className="text-2xl font-extrabold text-navy-950 font-display">${totalInvoiced.toLocaleString()} USD</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-soft space-y-1">
          <span className="text-[10px] font-bold text-emerald-600 uppercase">Total Collected</span>
          <div className="text-2xl font-extrabold text-emerald-600 font-display">${totalPaid.toLocaleString()} USD</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-soft space-y-1">
          <span className="text-[10px] font-bold text-amber-600 uppercase">Outstanding Balance</span>
          <div className="text-2xl font-extrabold text-amber-600 font-display">${totalBalance.toLocaleString()} USD</div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={invoices}
        searchPlaceholder="Search invoice number, client, or tour code..."
      />
    </div>
  );
}
