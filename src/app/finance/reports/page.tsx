"use client";

import React, { useState } from "react";
import { crmStore } from "@/lib/store";
import { useToast } from "@/components/ui/Toast";
import {
  FileText,
  Download,
  Printer,
  FileSpreadsheet,
  TrendingUp,
  DollarSign,
  Building2,
  Car,
  Calendar,
} from "lucide-react";

export default function ExecutiveReportsPage() {
  const { showToast } = useToast();
  const tours = crmStore.getTours();
  const bookings = crmStore.getBookings();
  const payments = crmStore.getPayments();
  const hotels = crmStore.getHotels();

  const handleExportCSV = (reportName: string) => {
    showToast(`Exported "${reportName}" to CSV spreadsheet!`, "success");
  };

  const handleExportPDF = (reportName: string) => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-950 font-display tracking-tight">
            Executive Financial & Operations Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Export ready-to-print executive summaries, supplier volume analysis, and profit yield audits.
          </p>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Report 1: Tour Sales & Profitability */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-soft space-y-4">
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-navy-950 font-display">
              Commercial Tour Sales & Margins
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Detailed breakdown of selling prices, net costs, gross margin %, and booking yields across all tours.
            </p>
          </div>
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleExportCSV("Tour Sales & Margin Report")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>CSV / Excel</span>
            </button>
            <button
              type="button"
              onClick={() => handleExportPDF("Tour Sales Report")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-navy-950 hover:bg-brand-600 text-white text-xs font-bold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>PDF Report</span>
            </button>
          </div>
        </div>

        {/* Report 2: Hotel & Supplier Spend */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-soft space-y-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-navy-950 font-display">
              Hotel Partner & Supplier Volume Spend
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Total room nights booked, aggregate disbursements, and vendor volume tier tracking.
            </p>
          </div>
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleExportCSV("Supplier Spend Report")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>CSV / Excel</span>
            </button>
            <button
              type="button"
              onClick={() => handleExportPDF("Supplier Spend Report")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-navy-950 hover:bg-brand-600 text-white text-xs font-bold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>PDF Report</span>
            </button>
          </div>
        </div>

        {/* Report 3: Collections & Receivables */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-soft space-y-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-navy-950 font-display">
              Receivables & Collections Aging
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Audit log of client payments collected, outstanding invoice balances, and upcoming due dates.
            </p>
          </div>
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleExportCSV("Accounts Receivable Report")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>CSV / Excel</span>
            </button>
            <button
              type="button"
              onClick={() => handleExportPDF("Receivables Report")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-navy-950 hover:bg-brand-600 text-white text-xs font-bold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>PDF Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
