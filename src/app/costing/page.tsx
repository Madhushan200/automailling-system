"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { crmStore } from "@/lib/store";
import { TourCosting, CostingItem, CostCategory } from "@/lib/types";
import { useToast } from "@/components/ui/Toast";
import {
  Calculator,
  Plus,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Percent,
  BedDouble,
  Car,
  Compass,
  Utensils,
  UserCheck,
  Tag,
  FileSpreadsheet,
  CheckCircle2,
  Filter,
  Layers,
  ChevronRight
} from "lucide-react";

export default function CostingPage() {
  const { showToast } = useToast();
  const [costings, setCostings] = useState<TourCosting[]>([]);
  const [selectedCostingId, setSelectedCostingId] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  useEffect(() => {
    const list = crmStore.getCostings();
    setCostings(list);
    if (list.length > 0) {
      setSelectedCostingId(list[0].id);
    }
  }, []);

  const activeCosting = costings.find((c) => c.id === selectedCostingId) || costings[0];

  const categories: CostCategory[] = [
    "Accommodation",
    "Transport",
    "Activity",
    "Restaurant",
    "Guide",
    "Entrance Fee",
    "Miscellaneous",
  ];

  const getCategoryIcon = (cat: CostCategory) => {
    switch (cat) {
      case "Accommodation":
        return <BedDouble className="w-4 h-4 text-brand-600" />;
      case "Transport":
        return <Car className="w-4 h-4 text-emerald-600" />;
      case "Activity":
      case "Entrance Fee":
        return <Compass className="w-4 h-4 text-purple-600" />;
      case "Restaurant":
        return <Utensils className="w-4 h-4 text-amber-600" />;
      case "Guide":
        return <UserCheck className="w-4 h-4 text-indigo-600" />;
      default:
        return <Tag className="w-4 h-4 text-slate-500" />;
    }
  };

  const filteredItems = activeCosting
    ? selectedCategory === "All"
      ? activeCosting.items
      : activeCosting.items.filter((i) => i.category === selectedCategory)
    : [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-brand-50 text-brand-700 border border-brand-200/60">
              Financial Engine
            </span>
            <span className="text-xs text-slate-400 font-medium">Real-Time Database Driven</span>
          </div>
          <h1 className="text-2xl font-extrabold text-navy-950 font-display tracking-tight mt-1">
            Tour Costing & Profit Margin Workspace
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Dynamic spreadsheet-style calculation matrix connecting Routes, Master Supplier Rates, Markups & Profit Margins.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeCosting?.tour_id && (
            <Link
              href={`/tours/${activeCosting.tour_id}?tab=costing`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-navy-950 hover:bg-brand-600 text-white text-xs font-bold shadow-sm transition-all"
            >
              <span>Open in Tour Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>

      {/* Tour Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2 flex-shrink-0">
          Select Tour:
        </span>
        {costings.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setSelectedCostingId(c.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
              selectedCostingId === c.id
                ? "bg-navy-950 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <span className="font-mono text-[11px] opacity-80">{c.tour_number}</span>
            <span>{c.tour_title}</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] ${
                selectedCostingId === c.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"
              }`}
            >
              ${c.gross_selling_price.toLocaleString()}
            </span>
          </button>
        ))}
      </div>

      {activeCosting && (
        <>
          {/* Top Live KPI Financial Ribbon */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-soft">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Net Cost</span>
              <div className="text-xl font-extrabold text-slate-900 font-display mt-0.5">
                ${activeCosting.total_net_cost.toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-500 font-medium">
                ${activeCosting.cost_per_person?.toFixed(0) || 0} / pax
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-soft">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Markup Applied</span>
              <div className="text-xl font-extrabold text-brand-600 font-display mt-0.5">
                {activeCosting.overall_markup_percent}%
              </div>
              <span className="text-[10px] text-brand-600 font-medium font-mono">
                +${activeCosting.total_markup_amount.toLocaleString()}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-navy-950 text-white shadow-soft">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Gross Selling</span>
              <div className="text-xl font-extrabold text-white font-display mt-0.5">
                ${activeCosting.gross_selling_price.toLocaleString()}
              </div>
              <span className="text-[10px] text-emerald-400 font-medium">
                ${activeCosting.selling_per_person?.toFixed(0) || 0} / pax
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-soft">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Gross Profit</span>
              <div className="text-xl font-extrabold text-emerald-800 font-display mt-0.5">
                ${activeCosting.gross_profit.toLocaleString()}
              </div>
              <span className="text-[10px] text-emerald-700 font-bold">
                Margin: {activeCosting.gross_margin_percent}%
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-soft">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Group Size</span>
              <div className="text-xl font-extrabold text-slate-900 font-display mt-0.5">
                {activeCosting.pax} Pax
              </div>
              <span className="text-[10px] text-slate-500 font-medium">
                {activeCosting.adults} Adults, {activeCosting.children} Kids
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-soft">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Costing Status</span>
              <div className="text-sm font-bold text-emerald-600 mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>{activeCosting.status}</span>
              </div>
              <span className="text-[10px] text-slate-400">Currency: {activeCosting.currency}</span>
            </div>
          </div>

          {/* Breakdown by Category Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: "Accommodation", amount: activeCosting.total_accommodation_cost, icon: BedDouble, color: "text-brand-600", bg: "bg-brand-50 border-brand-100" },
              { label: "Transport", amount: activeCosting.total_transport_cost, icon: Car, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
              { label: "Activities", amount: activeCosting.total_activities_cost, icon: Compass, color: "text-purple-600", bg: "bg-purple-50 border-purple-100" },
              { label: "Tourist Guide", amount: activeCosting.total_guide_cost, icon: UserCheck, color: "text-indigo-600", bg: "bg-indigo-50 border-indigo-100" },
              { label: "Restaurants", amount: activeCosting.total_restaurants_cost, icon: Utensils, color: "text-amber-600", bg: "bg-amber-50 border-amber-100" },
              { label: "Other / Misc", amount: activeCosting.total_other_cost, icon: Tag, color: "text-slate-600", bg: "bg-slate-50 border-slate-100" },
            ].map((cat, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedCategory(selectedCategory === cat.label ? "All" : cat.label)}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  selectedCategory === cat.label
                    ? "ring-2 ring-navy-950 shadow-md bg-white border-navy-950"
                    : `${cat.bg} hover:shadow-sm`
                }`}
              >
                <div className="flex items-center justify-between">
                  <cat.icon className={`w-4 h-4 ${cat.color}`} />
                  <span className="text-[10px] font-bold text-slate-400">
                    {activeCosting.total_net_cost > 0
                      ? `${Math.round((cat.amount / activeCosting.total_net_cost) * 100)}%`
                      : "0%"}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-700 mt-2 truncate">{cat.label}</div>
                <div className="text-sm font-extrabold text-navy-950 font-display mt-0.5">
                  ${cat.amount.toLocaleString()}
                </div>
              </button>
            ))}
          </div>

          {/* Line Items Database Table */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-soft overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-navy-950 text-white flex items-center justify-center font-bold">
                  <FileSpreadsheet className="w-5 h-5 text-brand-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-navy-950 font-display">
                    Costing Line Items & Live Calculation Matrix
                  </h3>
                  <p className="text-xs text-slate-400">
                    Showing {filteredItems.length} items {selectedCategory !== "All" && `in ${selectedCategory}`}
                  </p>
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                <button
                  type="button"
                  onClick={() => setSelectedCategory("All")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    selectedCategory === "All"
                      ? "bg-navy-950 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  All Categories
                </button>
                {categories.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedCategory(c)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                      selectedCategory === c
                        ? "bg-navy-950 text-white font-bold"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Service & Provider</th>
                    <th className="py-3 px-4 text-center">Day / Date</th>
                    <th className="py-3 px-4 text-right">Qty & Unit</th>
                    <th className="py-3 px-4 text-right">Supplier Rate</th>
                    <th className="py-3 px-4 text-right">Net Cost</th>
                    <th className="py-3 px-4 text-right">Markup</th>
                    <th className="py-3 px-4 text-right">Selling Price</th>
                    <th className="py-3 px-4 text-right">Profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="p-1 rounded-md bg-slate-100">
                            {getCategoryIcon(item.category)}
                          </div>
                          <span className="font-bold text-slate-900">{item.category}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div>
                          <span className="font-bold text-navy-950 block">{item.service_name}</span>
                          <span className="text-[10px] text-slate-400">{item.supplier_name}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                          {item.day_number ? `Day ${item.day_number}` : item.date || "Full Tour"}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="font-mono">
                          <span className="font-bold text-slate-900">{item.quantity}</span>{" "}
                          <span className="text-[10px] text-slate-500">{item.unit}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right font-mono text-slate-600">
                        ${item.supplier_rate} {item.supplier_currency}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        ${item.converted_cost.toLocaleString()}
                      </td>

                      <td className="py-3 px-4 text-right font-mono text-brand-600 font-bold">
                        +{item.markup_value}%
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-extrabold text-navy-950">
                        ${item.selling_price.toLocaleString()}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">
                        +${item.profit.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total Summary Footer Bar */}
            <div className="p-4 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs">
              <div className="flex items-center gap-6">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans">
                    Total Cost (Net)
                  </span>
                  <span className="text-base font-extrabold text-white">
                    ${activeCosting.total_net_cost.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans">
                    Overall Margin
                  </span>
                  <span className="text-base font-extrabold text-brand-400">
                    {activeCosting.gross_margin_percent}%
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans text-right">
                    Total Gross Profit
                  </span>
                  <span className="text-base font-extrabold text-emerald-400 text-right block">
                    +${activeCosting.gross_profit.toLocaleString()}
                  </span>
                </div>
                <div className="pl-4 border-l border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans text-right">
                    Client Selling Total
                  </span>
                  <span className="text-lg font-black text-amber-300 text-right block">
                    ${activeCosting.gross_selling_price.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
