"use client";

import React, { useState, useEffect } from "react";
import { crmStore } from "@/lib/store";
import { Tour, TourCosting } from "@/lib/types";
import {
  TrendingUp,
  DollarSign,
  Building2,
  Car,
  Sparkles,
  Users,
  Utensils,
  ArrowUpRight,
  PieChart,
} from "lucide-react";

export default function ProfitLossDashboardPage() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [costings, setCostings] = useState<TourCosting[]>([]);

  useEffect(() => {
    setTours(crmStore.getTours());
    setCostings(crmStore.getCostings());
  }, []);

  const totalSales = tours.reduce((sum, t) => sum + (t.selling_price || 0), 0);
  const totalCost = tours.reduce((sum, t) => sum + (t.total_cost || 0), 0);
  const totalProfit = totalSales - totalCost;
  const overallMargin = totalSales > 0 ? (totalProfit / totalSales) * 100 : 0;

  // Breakdown by categories from costings
  const totalAccommodation = costings.reduce((sum, c) => sum + (c.total_accommodation_cost || 0), 0);
  const totalTransport = costings.reduce((sum, c) => sum + (c.total_transport_cost || 0), 0);
  const totalActivities = costings.reduce((sum, c) => sum + (c.total_activities_cost || 0), 0);
  const totalGuides = costings.reduce((sum, c) => sum + (c.total_guide_cost || 0), 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-navy-950 font-display tracking-tight">
          Executive Profit & Loss Intelligence
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Real-time gross revenue, supplier cost distribution, gross margin analytics, and tour-level net profitability.
        </p>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-soft space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gross Sales Revenue</span>
          <div className="text-3xl font-extrabold text-navy-950 font-display">
            ${totalSales.toLocaleString()} <span className="text-xs text-slate-500 font-sans">USD</span>
          </div>
          <p className="text-xs text-slate-500">Across {tours.length} commercial tours</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-soft space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Direct Supplier Costs</span>
          <div className="text-3xl font-extrabold text-slate-800 font-display">
            ${totalCost.toLocaleString()} <span className="text-xs text-slate-500 font-sans">USD</span>
          </div>
          <p className="text-xs text-slate-500">Net supplier payables</p>
        </div>

        <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-950 to-emerald-900 text-white shadow-soft space-y-2">
          <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">Gross Margin Profit</span>
          <div className="text-3xl font-extrabold text-emerald-400 font-display">
            +${totalProfit.toLocaleString()} <span className="text-xs text-emerald-300 font-sans">USD</span>
          </div>
          <p className="text-xs text-emerald-300 font-semibold">{overallMargin.toFixed(1)}% Realized Margin</p>
        </div>

        <div className="p-5 rounded-3xl bg-navy-950 text-white shadow-soft space-y-2">
          <span className="text-[10px] font-bold text-brand-300 uppercase tracking-wider">Average Profit / Tour</span>
          <div className="text-3xl font-extrabold text-white font-display">
            +${Math.round(totalProfit / (tours.length || 1)).toLocaleString()} <span className="text-xs text-slate-400 font-sans">USD</span>
          </div>
          <p className="text-xs text-slate-400 font-semibold">Per booking yield</p>
        </div>
      </div>

      {/* Supplier Cost Category Breakdown */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-soft space-y-6">
        <h3 className="text-base font-bold text-navy-950 font-display">
          Supplier Direct Cost Distribution Breakdown
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex items-center gap-2 text-slate-500 text-xs">
              <Building2 className="w-4 h-4 text-brand-600" />
              <span>Hotels & Stays</span>
            </div>
            <div className="text-xl font-bold font-mono text-navy-950">${totalAccommodation.toLocaleString()}</div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
              <div className="bg-brand-600 h-full w-[54%]" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex items-center gap-2 text-slate-500 text-xs">
              <Car className="w-4 h-4 text-emerald-600" />
              <span>Transport & Fleets</span>
            </div>
            <div className="text-xl font-bold font-mono text-navy-950">${totalTransport.toLocaleString()}</div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
              <div className="bg-emerald-600 h-full w-[26%]" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex items-center gap-2 text-slate-500 text-xs">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Activities & Safaris</span>
            </div>
            <div className="text-xl font-bold font-mono text-navy-950">${totalActivities.toLocaleString()}</div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
              <div className="bg-purple-600 h-full w-[14%]" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex items-center gap-2 text-slate-500 text-xs">
              <Users className="w-4 h-4 text-amber-600" />
              <span>Chauffeurs & Guides</span>
            </div>
            <div className="text-xl font-bold font-mono text-navy-950">${totalGuides.toLocaleString()}</div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
              <div className="bg-amber-600 h-full w-[12%]" />
            </div>
          </div>
        </div>
      </div>

      {/* Tour-Level P&L Breakdown Table */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-soft space-y-4">
        <h3 className="text-base font-bold text-navy-950 font-display">
          Tour-by-Tour Profitability Ledger
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-3">Tour Code & Name</th>
                <th className="p-3">Client</th>
                <th className="p-3 text-right">Selling Price</th>
                <th className="p-3 text-right">Net Cost</th>
                <th className="p-3 text-right">Gross Profit</th>
                <th className="p-3 text-right">Gross Margin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {tours.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/60">
                  <td className="p-3">
                    <strong className="text-navy-950 font-mono font-bold block">{t.tour_number}</strong>
                    <span className="text-[10px] text-slate-500">{t.tour_name}</span>
                  </td>
                  <td className="p-3 font-semibold text-slate-800">{t.client_name}</td>
                  <td className="p-3 text-right font-mono font-bold text-navy-950">
                    ${(t.selling_price || 0).toLocaleString()}
                  </td>
                  <td className="p-3 text-right font-mono font-semibold text-slate-700">
                    ${(t.total_cost || 0).toLocaleString()}
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-emerald-600">
                    +${(t.gross_profit || 0).toLocaleString()}
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-brand-700">
                    {(t.gross_margin_percent || 0).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
