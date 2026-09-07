"use client";

import React, { useRef, useState } from "react";
import { UploadCloud, FileSpreadsheet, Download, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { parseAccommodationExcel } from "@/lib/excel";
import { crmStore } from "@/lib/store";
import { GroupedHotelVoucher, AccommodationRow } from "@/lib/types";

interface UploadDropzoneProps {
  onParsed: (data: { rows: AccommodationRow[]; grouped: GroupedHotelVoucher[]; fileName: string }) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export function UploadDropzone({ onParsed, isLoading, setIsLoading }: UploadDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    setErrorMessage(null);
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      setErrorMessage("Please upload a valid Microsoft Excel file (.xlsx or .xls).");
      return;
    }

    try {
      setIsLoading(true);
      const buffer = await file.arrayBuffer();
      const knownHotels = crmStore.getHotels();
      const result = await parseAccommodationExcel(buffer, knownHotels);

      if (!result.success || result.rows.length === 0) {
        setErrorMessage(result.errors.join(" ") || "No valid rows found in Excel sheet.");
        return;
      }

      onParsed({
        rows: result.rows,
        grouped: result.grouped,
        fileName: file.name,
      });
    } catch (err: any) {
      console.error("Excel parse error:", err);
      setErrorMessage(err.message || "Failed to parse the Excel file. Please verify file format.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleDownloadSample = async () => {
    try {
      window.open("/api/download-sample-excel", "_blank");
    } catch (err) {
      console.error("Failed to download sample:", err);
    }
  };

  return (
    <div className="space-y-4">
      {/* Dropzone Box */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 ${
          isDragOver
            ? "border-brand-500 bg-brand-50/50 scale-[1.01]"
            : "border-slate-300 hover:border-brand-400 bg-white hover:bg-slate-50/50"
        } shadow-soft`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
          accept=".xlsx, .xls"
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center shadow-soft border border-brand-100">
            {isLoading ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : (
              <UploadCloud className="w-8 h-8" />
            )}
          </div>

          <div>
            <h3 className="text-base font-bold text-navy-950 font-display">
              {isLoading ? "Analyzing & Grouping Excel..." : "Upload Tour Accommodation Schedule"}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Drag and drop your spreadsheet here, or <span className="text-brand-600 font-semibold underline">browse file</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-[11px] text-slate-500">
            <span className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 font-mono">
              .XLSX / .XLS
            </span>
            <span>•</span>
            <span>Auto Hotel Grouping</span>
            <span>•</span>
            <span>Auto Email Matching</span>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{errorMessage}</div>
        </div>
      )}

      {/* Sample Download Bar */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-slate-600">
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>Need a test file? Download the official Dodoz Leisure sample template.</span>
        </div>
        <button
          type="button"
          onClick={handleDownloadSample}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 font-semibold shadow-sm transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-slate-600" />
          <span>Download Sample (.xlsx)</span>
        </button>
      </div>
    </div>
  );
}
