"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { crmStore } from "@/lib/store";
import { Tour } from "@/lib/types";
import { DataTable, Column } from "@/components/ui/DataTable";
import { useToast } from "@/components/ui/Toast";
import {
  Compass,
  Plus,
  Calendar,
  Users,
  MapPin,
  ArrowUpRight,
  Sparkles,
  Building2,
  Trash2,
  Edit3,
  FileSpreadsheet,
  CheckCircle2,
} from "lucide-react";

export default function ToursListPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [tours, setTours] = useState<Tour[]>([]);

  useEffect(() => {
    setTours(crmStore.getTours());
  }, []);

  const handleDeleteTour = (tourId: string, tourRef: string) => {
    if (confirm(`Are you sure you want to delete tour "${tourRef}"?`)) {
      crmStore.deleteTour(tourId);
      setTours(crmStore.getTours());
      showToast(`Deleted tour "${tourRef}"`, "info");
    }
  };

  const columns: Column<Tour>[] = [
    {
      header: "Tour Reference",
      accessor: (t) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-navy-950 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
            🌴
          </div>
          <div>
            <Link
              href={`/tours/${t.id}`}
              className="font-extrabold text-navy-950 hover:text-brand-600 block text-xs font-mono"
            >
              {t.tour_reference || t.tour_number}
            </Link>
            <span className="text-[10px] text-slate-500 line-clamp-1 max-w-xs">{t.tour_name}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Client / Group Name",
      accessor: (t) => (
        <div>
          <span className="font-bold text-slate-900 block text-xs">{t.client_name || "Valued Guests"}</span>
          <span className="text-[10px] text-slate-500">
            {t.pax || t.total_pax || t.adults_count || 1} Pax
          </span>
        </div>
      ),
    },
    {
      header: "Travel Dates",
      accessor: (t) => (
        <div className="text-xs">
          <span className="font-semibold text-slate-800 block">
            {t.arrival_date || t.start_date} → {t.departure_date || t.end_date}
          </span>
          <span className="text-[10px] text-slate-500">
            {t.days_count || 5} Days ({t.nights_count || 4} Nights)
          </span>
        </div>
      ),
    },
    {
      header: "Hotels & Stays",
      accessor: (t) => {
        const rows = t.accommodation_rows || [];
        const uniqueHotels = Array.from(new Set(rows.map((r) => r.hotel || r.hotelName).filter(Boolean)));
        return (
          <div className="text-xs">
            {uniqueHotels.length > 0 ? (
              <div className="flex items-center gap-1.5 flex-wrap">
                {uniqueHotels.slice(0, 3).map((h, i) => (
                  <span
                    key={i}
                    className="px-1.5 py-0.5 rounded bg-slate-100 text-navy-950 text-[10px] font-bold uppercase"
                  >
                    {h}
                  </span>
                ))}
                {uniqueHotels.length > 3 && (
                  <span className="text-[10px] text-slate-400 font-bold">+{uniqueHotels.length - 3} more</span>
                )}
              </div>
            ) : (
              <span className="text-[10px] text-slate-400">No stays added</span>
            )}
          </div>
        );
      },
    },
    {
      header: "Status",
      accessor: (t) => (
        <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10.5px] font-extrabold uppercase">
          {t.status || "Confirmed"}
        </span>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      accessor: (t) => (
        <div className="flex items-center justify-end gap-1.5">
          <Link
            href={`/tours/${t.id}`}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg bg-navy-950 hover:bg-brand-600 text-white transition-colors shadow-sm"
          >
            <Edit3 className="w-3 h-3 text-brand-300" />
            <span>Open & Edit</span>
          </Link>

          <button
            type="button"
            onClick={() => handleDeleteTour(t.id, t.tour_reference || t.tour_number)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Delete Tour"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24">
      {/* Header & New Tour Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-950 font-display tracking-tight">
            Tour Reservations & Accommodation Workspaces
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Enter tour data directly into system tables, automatically generate separate hotel vouchers, and email properties with one click.
          </p>
        </div>

        <Link
          href="/tours/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-navy-950 hover:bg-brand-600 text-white text-xs font-bold shadow-soft transition-all"
        >
          <Plus className="w-4 h-4 text-brand-300" />
          <span>CREATE NEW TOUR</span>
        </Link>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-soft space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Saved Tours</span>
          <div className="text-2xl font-extrabold text-navy-950 font-display">{tours.length}</div>
          <p className="text-[10px] text-emerald-600 font-semibold">Active in system</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-soft space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Partner Hotels</span>
          <div className="text-2xl font-extrabold text-navy-950 font-display">
            {crmStore.getHotels().length}
          </div>
          <p className="text-[10px] text-slate-500">In Master Hotel DB</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-soft space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Data Entry Method</span>
          <div className="text-lg font-extrabold text-emerald-700 font-display">100% Direct Web</div>
          <p className="text-[10px] text-slate-500">No Excel file needed</p>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-navy-950 to-navy-900 text-white shadow-soft space-y-1">
          <span className="text-[10px] font-bold text-brand-300 uppercase">Voucher Automation</span>
          <div className="text-lg font-extrabold text-white font-display">Auto-Detected</div>
          <p className="text-[10px] text-emerald-400 font-semibold">Separate per hotel</p>
        </div>
      </div>

      {/* Tours Data Table */}
      <DataTable
        columns={columns}
        data={tours}
        searchPlaceholder="Search by tour reference (DL-2026-001), client name, or hotel..."
      />
    </div>
  );
}
