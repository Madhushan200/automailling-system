"use client";

import React, { useState, useEffect } from "react";
import { crmStore } from "@/lib/store";
import { DocumentItem } from "@/lib/types";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import {
  FileText,
  Upload,
  Plus,
  Download,
  Eye,
  Trash2,
  FolderLock,
} from "lucide-react";

export default function DocumentVaultPage() {
  const { showToast } = useToast();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [fileType, setFileType] = useState<any>("Passport");
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    setDocuments(crmStore.getDocuments());
  }, []);

  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      showToast("Please enter document title", "warning");
      return;
    }

    const newDoc: DocumentItem = {
      id: `doc-${Date.now()}`,
      tour_id: "tour-101",
      title,
      file_type: fileType,
      file_name: fileName || `${title.toLowerCase().replace(/\s+/g, "_")}.pdf`,
      file_size: "1.8 MB",
      file_url: "#",
      uploaded_by: "Sales & Operations Staff",
      created_at: new Date().toISOString(),
    };

    crmStore.addDocument(newDoc);
    setDocuments(crmStore.getDocuments());
    setIsUploadOpen(false);
    showToast(`Stored document "${title}" in secure vault!`, "success");

    setTitle("");
    setFileName("");
  };

  const columns: Column<DocumentItem>[] = [
    {
      header: "Document Title",
      accessor: (d) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold flex-shrink-0">
            <FileText className="w-4 h-4 text-brand-600" />
          </div>
          <div>
            <span className="font-bold text-navy-950 block text-xs">{d.title}</span>
            <span className="text-[10px] text-slate-500 font-mono">{d.file_name}</span>
          </div>
        </div>
      ),
    },
    {
      header: "File Classification",
      accessor: (d) => (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
          {d.file_type}
        </span>
      ),
    },
    {
      header: "File Size",
      accessor: (d) => (
        <span className="text-xs font-mono text-slate-600">{d.file_size || "1.2 MB"}</span>
      ),
    },
    {
      header: "Uploaded By",
      accessor: (d) => (
        <span className="text-xs text-slate-700 font-medium">{d.uploaded_by}</span>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      accessor: (d) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => showToast(`Downloading ${d.file_name}`, "info")}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
            title="Download Document"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-950 font-display tracking-tight">
            Document Vault & Guest Records
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Secure storage for scanned guest passports, flight e-tickets, signed supplier contracts, and hotel vouchers.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsUploadOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-navy-950 hover:bg-brand-600 text-white text-xs font-bold shadow-sm transition-colors"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={documents}
        searchPlaceholder="Search document title, file type, or file name..."
      />

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title="Upload Document to Vault"
        subtitle="Store traveler passports, flight tickets, or signed supplier agreements"
      >
        <form onSubmit={handleAddDocument} className="space-y-4">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Document Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Scanned Passport - Dr. Jonathan Hayes"
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Classification Type</label>
              <select
                value={fileType}
                onChange={(e) => setFileType(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
              >
                <option value="Passport">Passport Copy</option>
                <option value="Flight Ticket">Flight Ticket / Boarding Pass</option>
                <option value="Hotel Voucher">Hotel Confirmation Voucher</option>
                <option value="Contract">Signed Supplier Contract</option>
                <option value="Invoice">Supplier Invoice / Receipt</option>
                <option value="Other">Other Document</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">File Upload</label>
              <input
                type="file"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setFileName(e.target.files[0].name);
                  }
                }}
                className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsUploadOpen(false)}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-navy-950 hover:bg-brand-600 text-white text-xs font-bold shadow-sm"
            >
              Upload to Vault
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
