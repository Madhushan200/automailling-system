"use client";

import React, { useEffect, useState } from "react";
import { Modal } from "../ui/Modal";
import { Download, Printer, Loader2, Sparkles, Send } from "lucide-react";
import { GroupedHotelVoucher, CompanySettings } from "@/lib/types";
import { buildVoucherPDFDoc } from "@/lib/pdf";
import { crmStore } from "@/lib/store";

interface VoucherPreviewModalProps {
  isOpen?: boolean;
  onClose: () => void;
  voucher: GroupedHotelVoucher | null;
  onSendSingle?: (voucher: GroupedHotelVoucher) => void;
}

export function VoucherPreviewModal({
  isOpen = true,
  onClose,
  voucher,
  onSendSingle,
}: VoucherPreviewModalProps) {
  const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!voucher || !isOpen) {
      setPdfDataUrl(null);
      return;
    }

    try {
      setIsLoading(true);
      const settings = crmStore.getSettings();
      const doc = buildVoucherPDFDoc({
        voucherNumber: `VCH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        issueDate: new Date().toISOString().split("T")[0],
        tourNumber: voucher.tourNumber,
        reference: voucher.reference,
        clientName: voucher.clientName,
        hotelName: voucher.hotelName,
        hotelEmail: voucher.hotelEmail,
        rows: voucher.rows,
        companySettings: settings,
      });

      const url = doc.output("dataurlstring");
      setPdfDataUrl(url);
    } catch (err) {
      console.error("Failed to build PDF preview:", err);
    } finally {
      setIsLoading(false);
    }
  }, [voucher, isOpen]);

  if (!voucher) return null;

  const handleDownload = () => {
    const settings = crmStore.getSettings();
    const doc = buildVoucherPDFDoc({
      voucherNumber: `VCH-${voucher.tourNumber}-${voucher.hotelName.replace(/[^a-z0-9]/gi, "").slice(0, 8)}`,
      issueDate: new Date().toISOString().split("T")[0],
      tourNumber: voucher.tourNumber,
      reference: voucher.reference,
      clientName: voucher.clientName,
      hotelName: voucher.hotelName,
      hotelEmail: voucher.hotelEmail,
      rows: voucher.rows,
      companySettings: settings,
    });
    doc.save(`Voucher_${voucher.hotelName.replace(/\s+/g, "_")}_${voucher.tourNumber}.pdf`);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`PDF Voucher Preview — ${voucher.hotelName}`}
      subtitle={`Tour: ${voucher.tourNumber} | Client: ${voucher.clientName} | ${voucher.rows.length} Night(s)`}
      maxWidth="4xl"
    >
      <div className="space-y-4">
        {/* Top Action Dock */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
          <div className="text-xs text-slate-600 font-medium">
            Recipient: <strong className="text-navy-950">{voucher.hotelEmail || "Not Assigned"}</strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold shadow-sm transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>

            {onSendSingle && (
              <button
                onClick={() => {
                  onClose();
                  onSendSingle(voucher);
                }}
                disabled={!voucher.hotelEmail}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm transition-colors disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Voucher Now</span>
              </button>
            )}
          </div>
        </div>

        {/* PDF Viewer Container */}
        <div className="w-full h-[620px] rounded-xl border border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center">
          {isLoading ? (
            <div className="flex flex-col items-center gap-2 text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
              <span className="text-xs font-semibold">Generating Graphical PDF...</span>
            </div>
          ) : pdfDataUrl ? (
            <iframe
              src={pdfDataUrl}
              className="w-full h-full border-none"
              title="PDF Voucher Preview"
            />
          ) : (
            <p className="text-xs text-rose-600">Failed to render PDF preview.</p>
          )}
        </div>
      </div>
    </Modal>
  );
}
