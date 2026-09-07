"use client";

import React, { useState, useEffect } from "react";
import { crmStore } from "@/lib/store";
import { SupplierPayment } from "@/lib/types";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import {
  Receipt,
  Plus,
  Building2,
  Car,
  Sparkles,
  Users,
  CheckCircle2,
  Clock,
} from "lucide-react";

export default function SupplierPaymentsPage() {
  const { showToast } = useToast();
  const [supplierPayments, setSupplierPayments] = useState<SupplierPayment[]>([]);

  useEffect(() => {
    setSupplierPayments(crmStore.getSupplierPayments());
  }, []);

  const totalPayables = supplierPayments.reduce((sum, sp) => sum + (sp.amount || 0), 0);

  const columns: Column<SupplierPayment>[] = [
    {
      header: "Supplier Entity",
      accessor: (sp) => (
        <div>
          <strong className="text-navy-950 block text-xs">{sp.supplier_name}</strong>
          <span className="text-[10px] text-brand-600 font-mono">{sp.tour_number || "DIRECT"}</span>
        </div>
      ),
    },
    {
      header: "Category",
      accessor: (sp) => (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
          {sp.category}
        </span>
      ),
    },
    {
      header: "Due Date",
      accessor: (sp) => (
        <div className="text-xs text-slate-700 font-medium">
          {sp.due_date}
        </div>
      ),
    },
    {
      header: "Payable Amount",
      accessor: (sp) => (
        <div className="text-sm font-mono font-bold text-slate-900">
          ${sp.amount.toFixed(2)} {sp.currency}
        </div>
      ),
    },
    {
      header: "Status",
      accessor: (sp) => {
        const isScheduled = sp.status === "Scheduled";
        return (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
              isScheduled
                ? "bg-brand-50 text-brand-700 border border-brand-200"
                : "bg-amber-50 text-amber-700 border border-amber-200"
            }`}
          >
            <Clock className="w-3 h-3" /> {sp.status}
          </span>
        );
      },
    },
    {
      header: "Actions",
      className: "text-right",
      accessor: (sp) => (
        <button
          onClick={() => showToast(`Settled payable to ${sp.supplier_name}!`, "success")}
          className="px-3 py-1 text-xs font-bold rounded-lg bg-navy-950 hover:bg-brand-600 text-white transition-colors"
        >
          Pay Supplier
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
            Supplier Accounts Payable Ledger
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage disbursements and settlement due dates for partner hotels, transport fleets, safari operators, and guides.
          </p>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-white border border-slate-200 shadow-soft text-right">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Scheduled Payables</span>
          <div className="text-xl font-bold font-mono text-navy-950">${totalPayables.toFixed(2)} USD</div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={supplierPayments}
        searchPlaceholder="Search supplier name, category, or tour code..."
      />
    </div>
  );
}
