"use client";

import React, { useState, useEffect } from "react";
import { crmStore } from "@/lib/store";
import { UniversalSupplierRate } from "@/lib/types";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import {
  DollarSign,
  Search,
  Filter,
  Building2,
  Car,
  Sparkles,
  Utensils,
  Users,
  CheckCircle2,
  Calendar,
  Plus,
} from "lucide-react";

export default function SupplierRatesDatabasePage() {
  const { showToast } = useToast();
  const [rates, setRates] = useState<UniversalSupplierRate[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  useEffect(() => {
    setRates(crmStore.getUniversalRates());
  }, []);

  const categories = ["All", "Hotel", "Transport", "Activity", "Guide", "Restaurant"];

  const filteredRates = rates.filter((r) => {
    if (selectedCategory === "All") return true;
    return r.supplier_type.toLowerCase() === selectedCategory.toLowerCase();
  });

  const columns: Column<UniversalSupplierRate>[] = [
    {
      header: "Service & Category",
      accessor: (r) => {
        let Icon = Sparkles;
        if (r.supplier_type === "Hotel") Icon = Building2;
        if (r.supplier_type === "Transport") Icon = Car;
        if (r.supplier_type === "Restaurant") Icon = Utensils;
        if (r.supplier_type === "Guide") Icon = Users;

        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold flex-shrink-0">
              <Icon className="w-4 h-4 text-brand-600" />
            </div>
            <div>
              <span className="font-bold text-navy-950 block">{r.service_name}</span>
              <span className="text-[10px] text-brand-600 font-semibold uppercase">{r.supplier_type}</span>
            </div>
          </div>
        );
      },
    },
    {
      header: "Supplier Entity",
      accessor: (r) => (
        <div className="font-semibold text-slate-900 text-xs">
          {r.supplier_name}
        </div>
      ),
    },
    {
      header: "Rate Type / Unit",
      accessor: (r) => (
        <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-bold">
          {r.rate_type}
        </span>
      ),
    },
    {
      header: "Contract Validity",
      accessor: (r) => (
        <div className="text-[11px] text-slate-600 font-mono">
          <span>{r.valid_from} → {r.valid_until}</span>
          {r.season && <span className="text-[10px] text-brand-600 block font-sans">({r.season})</span>}
        </div>
      ),
    },
    {
      header: "Net Rate (USD)",
      accessor: (r) => (
        <div className="text-xs font-mono font-bold text-emerald-700">
          ${r.cost.toFixed(2)} {r.currency}
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
            Universal Supplier Rate Master Database
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Centralized dynamic cost catalog queried automatically by the Tour Costing Engine during proposal creation.
          </p>
        </div>

        <button
          type="button"
          onClick={() => showToast("Rate updated in universal cache!", "success")}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-navy-950 hover:bg-brand-600 text-white text-xs font-bold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Rate Entry</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === cat
                ? "bg-navy-950 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
            }`}
          >
            {cat} Rates
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={filteredRates}
        searchPlaceholder="Search service name, supplier, or rate type..."
      />
    </div>
  );
}
