"use client";

import React, { useState, useEffect } from "react";
import { crmStore } from "@/lib/store";
import { Payment } from "@/lib/types";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import {
  DollarSign,
  Plus,
  CheckCircle2,
  Calendar,
  Receipt,
  Download,
} from "lucide-react";

export default function ClientPaymentsPage() {
  const { showToast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    setPayments(crmStore.getPayments());
  }, []);

  const totalCollected = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

  const columns: Column<Payment>[] = [
    {
      header: "Payment Ref",
      accessor: (p) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold flex-shrink-0">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-navy-950 font-mono text-xs block">{p.reference}</span>
            <span className="text-[10px] text-brand-600 font-mono">{p.tour_number || "DIRECT"}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Client & Method",
      accessor: (p) => (
        <div>
          <strong className="text-navy-950 block text-xs">{p.client_name}</strong>
          <span className="text-[10px] text-slate-500 font-medium">{p.method}</span>
        </div>
      ),
    },
    {
      header: "Date Received",
      accessor: (p) => (
        <div className="text-xs text-slate-700 font-medium">
          {p.date}
        </div>
      ),
    },
    {
      header: "Amount (USD)",
      accessor: (p) => (
        <div className="text-sm font-mono font-extrabold text-emerald-600">
          +${p.amount.toLocaleString()} {p.currency}
        </div>
      ),
    },
    {
      header: "Status",
      accessor: (p) => (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Settled
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-950 font-display tracking-tight">
            Client Payments & Collections Ledger
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track bank wire transfers, credit card settlements, and receipts collected from travelers.
          </p>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-white border border-slate-200 shadow-soft text-right">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Collections</span>
          <div className="text-xl font-bold font-mono text-emerald-600">${totalCollected.toLocaleString()} USD</div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={payments}
        searchPlaceholder="Search payment reference, client, or tour code..."
      />
    </div>
  );
}
