"use client";

import React, { useState, useEffect } from "react";
import { UploadDropzone } from "@/components/bulk-voucher/UploadDropzone";
import { HotelVoucherCard } from "@/components/bulk-voucher/HotelVoucherCard";
import { VoucherPreviewModal } from "@/components/bulk-voucher/VoucherPreviewModal";
import { EmailEditorModal } from "@/components/bulk-voucher/EmailEditorModal";
import { BulkSendModal } from "@/components/bulk-voucher/BulkSendModal";
import { GroupedHotelVoucher, AccommodationRow } from "@/lib/types";
import { useToast } from "@/components/ui/Toast";
import { crmStore } from "@/lib/store";
import {
  FileSpreadsheet,
  Send,
  Building2,
  Calendar,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Play,
} from "lucide-react";

export default function BulkVoucherPage() {
  const { showToast } = useToast();
  const [groupedVouchers, setGroupedVouchers] = useState<GroupedHotelVoucher[]>([]);
  const [activeFileName, setActiveFileName] = useState<string>("");
  const [isParsing, setIsParsing] = useState(false);

  // Modals state
  const [previewVoucher, setPreviewVoucher] = useState<GroupedHotelVoucher | null>(null);
  const [editorVoucher, setEditorVoucher] = useState<GroupedHotelVoucher | null>(null);
  const [isBulkSendOpen, setIsBulkSendOpen] = useState(false);
  const [bulkCurrentIndex, setBulkCurrentIndex] = useState(0);
  const [isBulkCompleted, setIsBulkCompleted] = useState(false);

  // Auto-populate with initial sample on first render if empty
  useEffect(() => {
    // If no spreadsheet is uploaded, provide a quick demo load option
  }, []);

  const handleParsed = (data: {
    rows: AccommodationRow[];
    grouped: GroupedHotelVoucher[];
    fileName: string;
  }) => {
    setGroupedVouchers(data.grouped);
    setActiveFileName(data.fileName);
    showToast(
      `Successfully grouped ${data.rows.length} rows into ${data.grouped.length} Hotel Vouchers!`,
      "success"
    );
  };

  const handleLoadDemo = async () => {
    try {
      setIsParsing(true);
      const res = await fetch("/api/download-sample-excel");
      const blob = await res.blob();
      const buffer = await blob.arrayBuffer();
      const { parseAccommodationExcel } = await import("@/lib/excel");
      const known = crmStore.getHotels();
      const result = await parseAccommodationExcel(buffer, known);

      if (result.success) {
        setGroupedVouchers(result.grouped);
        setActiveFileName("Dodoz_Sample_Tour_Schedule.xlsx");
        showToast("Loaded official sample accommodation schedule!", "success");
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to load sample spreadsheet", "error");
    } finally {
      setIsParsing(false);
    }
  };

  const handleUpdateEmail = (voucherId: string, newEmail: string) => {
    setGroupedVouchers((prev) =>
      prev.map((v) =>
        v.id === voucherId
          ? { ...v, hotelEmail: newEmail, emailStatus: newEmail ? "custom" : "missing" }
          : v
      )
    );
    showToast("Updated hotel reservation email", "info");
  };

  const handleSaveToDirectory = (hotelName: string, email: string) => {
    crmStore.addHotel({
      id: `hotel-${Date.now()}`,
      hotel_name: hotelName,
      reservation_email: email,
      active: true,
      city: "Sri Lanka",
    });
    showToast(`Saved "${hotelName}" to Partner Hotel Directory!`, "success");
  };

  // Single Voucher Send
  const handleSendSingle = async (
    voucher: GroupedHotelVoucher,
    customSubject?: string,
    customBody?: string
  ) => {
    if (!voucher.hotelEmail) {
      showToast("Cannot send: Reservation email is missing", "error");
      return;
    }

    // Set sending status
    setGroupedVouchers((prev) =>
      prev.map((v) => (v.id === voucher.id ? { ...v, sendState: "sending" } : v))
    );

    try {
      const settings = crmStore.getSettings();
      const res = await fetch("/api/send-bulk-voucher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voucher,
          customSubject,
          customBody,
          settings,
        }),
      });

      const json = (await res.json()) as any;
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Email delivery failed");
      }

      // Update store & local state
      setGroupedVouchers((prev) =>
        prev.map((v) => (v.id === voucher.id ? { ...v, sendState: "sent" } : v))
      );

      crmStore.addVoucher({
        id: `vch-${Date.now()}`,
        voucher_number: json.voucherNumber || `VCH-${voucher.tourNumber}-${Date.now().toString().slice(-4)}`,
        hotel_name: voucher.hotelName,
        hotel_email: voucher.hotelEmail,
        client_name: voucher.clientName || "Valued Guests",
        tour_number: voucher.tourNumber || "DZ-TOUR",
        check_in_date: voucher.checkInStart,
        check_out_date: voucher.checkInEnd,
        status: "sent",
        email_status: "sent",
        sent_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      });

      crmStore.addEmailLog({
        id: `log-${Date.now()}`,
        recipient_email: voucher.hotelEmail,
        hotel_name: voucher.hotelName,
        subject: customSubject || `Accommodation Voucher — ${voucher.tourNumber}`,
        status: "sent",
        sent_at: new Date().toISOString(),
      });

      showToast(`Voucher sent successfully to ${voucher.hotelName}!`, "success");
    } catch (err: any) {
      console.error("Single send error:", err);
      setGroupedVouchers((prev) =>
        prev.map((v) =>
          v.id === voucher.id
            ? { ...v, sendState: "failed", sendErrorMessage: err.message }
            : v
        )
      );
      showToast(`Failed to send to ${voucher.hotelName}: ${err.message}`, "error");
    }
  };

  // Bulk Dispatch Workflow
  const handleStartBulkSend = async () => {
    const readyVouchers = groupedVouchers.filter((v) => v.hotelEmail);
    if (readyVouchers.length === 0) {
      showToast("No vouchers have valid recipient emails to send.", "error");
      return;
    }

    setIsBulkSendOpen(true);
    setIsBulkCompleted(false);
    setBulkCurrentIndex(0);

    const settings = crmStore.getSettings();

    for (let i = 0; i < groupedVouchers.length; i++) {
      const v = groupedVouchers[i];
      if (!v.hotelEmail) continue;

      setBulkCurrentIndex(i);
      setGroupedVouchers((prev) =>
        prev.map((item) => (item.id === v.id ? { ...item, sendState: "sending" } : item))
      );

      try {
        const res = await fetch("/api/send-bulk-voucher", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            voucher: v,
            settings,
          }),
        });
        const json = (await res.json()) as any;
        if (!res.ok || !json.success) throw new Error(json.error);

        setGroupedVouchers((prev) =>
          prev.map((item) => (item.id === v.id ? { ...item, sendState: "sent" } : item))
        );

        crmStore.addVoucher({
          id: `vch-${Date.now()}-${i}`,
          voucher_number: json.voucherNumber || `VCH-${v.tourNumber}-${i + 100}`,
          hotel_name: v.hotelName,
          hotel_email: v.hotelEmail,
          client_name: v.clientName || "Valued Guests",
          tour_number: v.tourNumber || "DZ-TOUR",
          check_in_date: v.checkInStart,
          check_out_date: v.checkInEnd,
          status: "sent",
          email_status: "sent",
          sent_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        });
      } catch (err: any) {
        setGroupedVouchers((prev) =>
          prev.map((item) => (item.id === v.id ? { ...item, sendState: "failed" } : item))
        );
      }
    }

    setIsBulkCompleted(true);
    showToast("Bulk voucher dispatch process completed!", "success");
  };

  const handleRetryFailed = async () => {
    const failed = groupedVouchers.filter((v) => v.sendState === "failed" && v.hotelEmail);
    if (failed.length === 0) return;

    setIsBulkCompleted(false);
    for (const v of failed) {
      await handleSendSingle(v);
    }
    setIsBulkCompleted(true);
  };

  const readyCount = groupedVouchers.filter((v) => v.hotelEmail).length;
  const missingEmailCount = groupedVouchers.filter((v) => !v.hotelEmail).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Fast Demo Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-950 font-display tracking-tight">
            Bulk Hotel Voucher Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Upload Excel schedule, match partner emails, preview graphical PDFs, and send via Hostinger SMTP.
          </p>
        </div>

        {groupedVouchers.length === 0 && (
          <button
            type="button"
            onClick={handleLoadDemo}
            disabled={isParsing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs font-bold hover:bg-slate-50 shadow-sm transition-colors"
          >
            <Play className="w-3.5 h-3.5 text-brand-600 fill-brand-600" />
            <span>Load 1-Click Sample Schedule</span>
          </button>
        )}
      </div>

      {/* Upload Zone */}
      {groupedVouchers.length === 0 ? (
        <UploadDropzone
          onParsed={handleParsed}
          isLoading={isParsing}
          setIsLoading={setIsParsing}
        />
      ) : (
        <div className="space-y-6">
          {/* Active File Summary Toolbar */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-navy-950">{activeFileName}</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-50 text-brand-700 border border-brand-200">
                    {groupedVouchers.length} Hotel Properties
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  <span className="text-emerald-600 font-semibold">{readyCount} Ready to Dispatch</span>
                  {missingEmailCount > 0 && (
                    <span className="text-amber-600 font-semibold"> • {missingEmailCount} Missing Email</span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setGroupedVouchers([])}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Upload Different File</span>
              </button>

              <button
                type="button"
                onClick={handleStartBulkSend}
                disabled={readyCount === 0}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-navy-950 hover:bg-brand-600 text-white text-xs font-bold shadow-soft transition-all duration-150 disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
                <span>Send All ({readyCount}) Hotels</span>
              </button>
            </div>
          </div>

          {/* Grouped Hotel Cards List */}
          <div className="space-y-4">
            {groupedVouchers.map((voucher) => (
              <HotelVoucherCard
                key={voucher.id}
                voucher={voucher}
                onUpdateEmail={handleUpdateEmail}
                onSaveToDirectory={handleSaveToDirectory}
                onPreviewPDF={(v) => setPreviewVoucher(v)}
                onEditEmailContent={(v) => setEditorVoucher(v)}
                onSendSingle={handleSendSingle}
              />
            ))}
          </div>
        </div>
      )}

      {/* Graphical PDF Preview Modal */}
      <VoucherPreviewModal
        isOpen={Boolean(previewVoucher)}
        onClose={() => setPreviewVoucher(null)}
        voucher={previewVoucher}
        onSendSingle={handleSendSingle}
      />

      {/* Email Template Composer Modal */}
      <EmailEditorModal
        isOpen={Boolean(editorVoucher)}
        onClose={() => setEditorVoucher(null)}
        voucher={editorVoucher}
        onSend={handleSendSingle}
      />

      {/* Bulk Dispatch Progress Modal */}
      <BulkSendModal
        isOpen={isBulkSendOpen}
        onClose={() => setIsBulkSendOpen(false)}
        vouchers={groupedVouchers}
        currentIndex={bulkCurrentIndex}
        isCompleted={isBulkCompleted}
        onRetryFailed={handleRetryFailed}
      />
    </div>
  );
}
