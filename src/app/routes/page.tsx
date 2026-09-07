"use client";

import React, { useState, useEffect } from "react";
import { crmStore } from "@/lib/store";
import { RoutePlan } from "@/lib/types";
import { useToast } from "@/components/ui/Toast";
import {
  MapPin,
  Compass,
  Navigation,
  Fuel,
  DollarSign,
  Building2,
  Calendar,
  CheckCircle2,
  Plus,
  Sparkles,
  Info,
} from "lucide-react";

export default function RoutePlannerPage() {
  const { showToast } = useToast();
  const [routePlans, setRoutePlans] = useState<RoutePlan[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<RoutePlan | null>(null);

  // Driver Allowance calculation params
  const [dailyMinKm, setDailyMinKm] = useState(100);
  const [extraKmRate, setExtraKmRate] = useState(0.45);
  const [driverDailyBata, setDriverDailyBata] = useState(20);

  useEffect(() => {
    const plans = crmStore.getRoutePlans();
    setRoutePlans(plans);
    if (plans.length > 0) {
      setSelectedRoute(plans[0]);
      setDailyMinKm(plans[0].min_daily_km || 100);
      setDriverDailyBata(plans[0].driver_daily_allowance || 20);
    }
  }, []);

  if (!selectedRoute) return null;

  const totalMinKmBaseline = selectedRoute.day_count * dailyMinKm;
  const extraKms = Math.max(0, selectedRoute.total_km - totalMinKmBaseline);
  const extraKmCost = extraKms * extraKmRate;
  const totalDriverBata = selectedRoute.day_count * driverDailyBata;
  const totalTransportCostEstimate = 450 + extraKmCost + totalDriverBata;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-950 font-display tracking-tight">
            Sri Lanka Route Planner & Driver KM Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Calculate tour route distances, driver minimum daily KM baselines, night-out bata allowances, and hotel stops.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-brand-50 text-brand-700 border border-brand-200 text-xs font-bold font-mono">
            {selectedRoute.total_km} Total Route KMs
          </span>
        </div>
      </div>

      {/* Driver Minimum Daily KM Calculator & Allowance Dock */}
      <div className="p-6 rounded-3xl bg-navy-950 text-white shadow-floating border border-navy-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-navy-800/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h3 className="text-base font-bold font-display text-white">{selectedRoute.title}</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Duration: <strong className="text-white">{selectedRoute.day_count} Days</strong> • Waypoints:{" "}
              <strong className="text-white">{selectedRoute.waypoints.length} Cities</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => showToast("Recalculated driver route allowances with live baseline!", "success")}
              className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-glow transition-all"
            >
              Recalculate Allowances
            </button>
          </div>
        </div>

        {/* Dynamic Metric Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-navy-900/90 border border-navy-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Daily Min Baseline</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={dailyMinKm}
                onChange={(e) => setDailyMinKm(Number(e.target.value))}
                className="w-16 px-2 py-1 bg-navy-950 border border-navy-700 rounded-lg text-white font-mono text-xs focus:ring-1 focus:ring-brand-400"
              />
              <span className="text-xs text-slate-300 font-bold">KM / Day</span>
            </div>
            <p className="text-[10px] text-slate-400">Total Base: {totalMinKmBaseline} KM</p>
          </div>

          <div className="p-4 rounded-2xl bg-navy-900/90 border border-navy-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Extra KM Charges</span>
            <div className="text-xl font-bold font-mono text-amber-400">
              {extraKms > 0 ? `+${extraKms} KM ($${extraKmCost.toFixed(0)})` : "Included in Base"}
            </div>
            <p className="text-[10px] text-slate-400">Rate: ${extraKmRate}/extra KM</p>
          </div>

          <div className="p-4 rounded-2xl bg-navy-900/90 border border-navy-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Driver Night Bata</span>
            <div className="text-xl font-bold font-mono text-emerald-400">
              ${totalDriverBata} USD
            </div>
            <p className="text-[10px] text-slate-400">${driverDailyBata}/night allowance</p>
          </div>

          <div className="p-4 rounded-2xl bg-navy-900/90 border border-navy-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Est. Total Transport</span>
            <div className="text-xl font-bold font-mono text-brand-300">
              ${totalTransportCostEstimate.toFixed(0)} USD
            </div>
            <p className="text-[10px] text-slate-400">Van / Sedan + Fuel + Driver</p>
          </div>
        </div>
      </div>

      {/* Interactive Waypoints & Hotel Allocation Map Strip */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-soft space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-navy-950 font-display">
              Day-by-Day Route Itinerary & Recommended Hotel Partners
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified road distances and contract hotel properties for each destination
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
            {selectedRoute.waypoints.length} Waypoints
          </span>
        </div>

        {/* Waypoints Sequence List */}
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-brand-200">
          {selectedRoute.waypoints.map((wp, idx) => (
            <div key={idx} className="relative flex items-start gap-4">
              <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-brand-600 text-white font-bold text-[10px] flex items-center justify-center ring-4 ring-white shadow-xs">
                {idx + 1}
              </div>

              <div className="flex-1 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-navy-950">{wp.city}</h4>
                    {wp.km_from_prev > 0 && (
                      <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-brand-600 font-mono text-[10px] font-bold">
                        +{wp.km_from_prev} KM from last stop
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Coord: {wp.lat.toFixed(4)}, {wp.lng.toFixed(4)}
                  </span>
                </div>

                {/* Highlights */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {wp.highlights.map((hl, hIdx) => (
                    <span
                      key={hIdx}
                      className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 text-[11px]"
                    >
                      ★ {hl}
                    </span>
                  ))}
                </div>

                {/* Recommended Hotels */}
                <div className="pt-2 border-t border-slate-200/60 flex items-center gap-2 text-xs">
                  <Building2 className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />
                  <span className="font-semibold text-slate-700">Contract Hotels:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {wp.recommended_hotels.map((ht, htIdx) => (
                      <span
                        key={htIdx}
                        className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium text-[11px]"
                      >
                        🏨 {ht}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
