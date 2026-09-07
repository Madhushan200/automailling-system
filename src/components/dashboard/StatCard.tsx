"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  color?: "brand" | "emerald" | "amber" | "purple";
}

export function StatCard({
  title,
  value,
  change,
  isPositive = true,
  icon: Icon,
  color = "brand",
}: StatCardProps) {
  const colorStyles = {
    brand: "bg-brand-50 text-brand-600 border-brand-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
  };

  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-soft hover:shadow-card transition-all duration-200">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</span>
        <div className={`p-2.5 rounded-xl border ${colorStyles[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <h3 className="text-2xl font-extrabold text-navy-950 font-display tracking-tight">{value}</h3>
        {change && (
          <span
            className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
              isPositive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
            }`}
          >
            {change}
          </span>
        )}
      </div>
    </div>
  );
}
