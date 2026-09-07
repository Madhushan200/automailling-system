"use client";

import React, { useState, useEffect } from "react";
import { DataTable, Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useToast } from "@/components/ui/Toast";
import { crmStore } from "@/lib/store";
import { Voucher } from "@/lib/types";
import { buildVoucherPDFDoc } from "@/lib/pdf";
import { History, Download, Eye, Send, FileText, CheckCircle2 } from "lucide-react";

export default function VoucherHistoryPage() {
  const { showToast } = useToast();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);

  useEffect(() => {
    setVouchers(crmStore.getVouchers());
  }, []);

  const handleDownloadPDF = (v: Voucher) => {
    try {
      const settings = crmStore.getSettings();
      const hName = v.hotel_name || v.supplier_name || "Hotel Partner";
      const hEmail = v.hotel_email || v.supplier_email || "";
      const checkIn = v.check_in_date || v.service_date || new Date().toISOString().split("T")[0];
      const doc = buildVoucherPDFDoc({
        voucherNumber: v.voucher_number,
        issueDate: v.created_at?.split("T")[0] || new Date().toISOString().split("T")[0],
        tourNumber: v.tour_number,
        reference: v.reference || "DIRECT",
        clientName: v.client_name,
        hotelName: hName,
        hotelEmail: hEmail,
        rows: [
          {
            date: checkIn,
            hotel: hName,
            mealPlan: "HB",
            sgl: 0,
            dbl: 1,
            tpl: 0,
            roomType: "Deluxe Suite / Ocean View",
            specialRequest: "VIP hospitality as per tour contract",
          },
        ],
        companySettings: settings,
      });

      doc.save(`${v.voucher_number}_${hName.replace(/\s+/g, "_")}.pdf`);
      showToast(`Downloaded voucher ${v.voucher_number}`, "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to generate download PDF", "error");
    }
  };

  const handleResend = async (v: Voucher) => {
    const hName = v.hotel_name || v.supplier_name || "Hotel Partner";
    const hEmail = v.hotel_email || v.supplier_email || "";
    if (!hEmail) {
      showToast("No recipient email address available for this voucher", "warning");
      return;
    }
    try {
      showToast(`Resending voucher ${v.voucher_number} to ${hEmail}...`, "info");
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: hEmail,
          subject: `RESENT: Hotel Voucher ${v.voucher_number} — ${v.tour_number}`,
          text: `Dear Reservations Team at ${hName},\n\nPlease find re-attached your official Hotel Accommodation Voucher for ${v.client_name}.\n\nWarm regards,\nDodoz Leisure Reservations`,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        showToast(`Successfully re-dispatched to ${hName}!`, "success");
      } else {
        throw new Error(json.error);
      }
    } catch (err: any) {
      showToast(`Resend failed: ${err.message}`, "error");
    }
  };

  const columns: Column<Voucher>[] = [
    {
      header: "Voucher Number",
      accessor: (v) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold flex-shrink-0">
            <FileText className="w-4 h-4 text-brand-600" />
          </div>
          <div>
            <span className="font-mono font-bold text-slate-900 block text-xs">{v.voucher_number}</span>
            <span className="text-[10px] text-slate-400">
              {v.sent_at ? new Date(v.sent_at).toLocaleString() : v.created_at?.split("T")[0]}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Hotel Recipient",
      accessor: (v) => (
        <div>
          <span className="font-semibold text-navy-950 block">{v.hotel_name || v.supplier_name || "Hotel Partner"}</span>
          <span className="text-[10px] text-slate-500 font-mono">{v.hotel_email || v.supplier_email || "-"}</span>
        </div>
      ),
    },
    {
      header: "Client & Tour",
      accessor: (v) => (
        <div>
          <span className="font-bold text-slate-800 block text-xs">{v.client_name}</span>
          <span className="text-[10px] font-mono text-brand-600">{v.tour_number}</span>
        </div>
      ),
    },
    {
      header: "Stay Window",
      accessor: (v) => (
        <div className="text-xs text-slate-600">
          {v.check_in_date || v.service_date} → {v.check_out_date || v.end_date || "-"}
        </div>
      ),
    },
    {
      header: "Delivery Status",
      accessor: (v) => <StatusBadge status={v.email_status || "sent"} size="sm" />,
    },
    {
      header: "Actions",
      className: "text-right",
      accessor: (v) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => handleDownloadPDF(v)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>PDF</span>
          </button>
          <button
            onClick={() => handleResend(v)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Resend</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-navy-950 font-display tracking-tight">
          Hotel Voucher & Dispatch History
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Complete audit trail of all generated vouchers, sent timestamps, and 1-click PDF re-downloads.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={vouchers}
        searchPlaceholder="Search voucher no, hotel name, or tour code..."
      />
    </div>
  );
}
