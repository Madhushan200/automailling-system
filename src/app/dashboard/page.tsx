"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileSpreadsheet,
  Building2,
  CalendarCheck,
  Send,
  Users,
  MapPin,
  TrendingUp,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  DollarSign,
  Plane,
  Compass,
  FileText,
  Clock,
  Sparkles,
  Receipt,
  Car,
  CheckCircle2,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { EmailActivityChart } from "@/components/dashboard/EmailActivityChart";
import { RecentBookingsTable } from "@/components/dashboard/RecentBookingsTable";
import { crmStore } from "@/lib/store";
import { Booking, EmailLog, Hotel, Tour, Lead, Payment, OperationsItem } from "@/lib/types";

export default function DashboardPage() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [operations, setOperations] = useState<OperationsItem[]>([]);

  useEffect(() => {
    setTours(crmStore.getTours());
    setLeads(crmStore.getLeads());
    setBookings(crmStore.getBookings());
    setPayments(crmStore.getPayments());
    setHotels(crmStore.getHotels());
    setEmailLogs(crmStore.getEmailLogs());
    setOperations(crmStore.getOperations());
  }, []);

  const totalSales = tours.reduce((sum, t) => sum + (t.selling_price || 0), 0);
  const totalCost = tours.reduce((sum, t) => sum + (t.total_cost || 0), 0);
  const grossProfit = totalSales - totalCost;
  const avgMargin = totalSales > 0 ? (grossProfit / totalSales) * 100 : 0;
  const totalCollected = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const outstandingPayments = Math.max(0, totalSales - totalCollected);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-navy-950 via-navy-900 to-brand-950 text-white shadow-floating border border-navy-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-500/20 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-brand-300 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Complete Travel Agency ERP & Operating System
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-white">
              Ayubowan! Welcome to Dodoz Leisure ERP
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Complete end-to-end DMC workflow from customer inquiry, route planning, dynamic costing calculation, supplier requests, and client invoicing.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0 flex-wrap">
            <Link
              href="/tours/new"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-glow transition-all duration-150 transform hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4 text-brand-300" />
              <span>Create New Tour</span>
            </Link>
            <Link
              href="/tours"
              className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm transition-all"
            >
              <Compass className="w-4 h-4" />
              <span>Saved Tours</span>
            </Link>
            <Link
              href="/hotels"
              className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm transition-all"
            >
              <Building2 className="w-4 h-4" />
              <span>Hotel Database</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards (10 Core Metrics) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-soft space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Saved Tours</span>
          <div className="text-2xl font-extrabold text-navy-950 font-display">{tours.length}</div>
          <p className="text-[10px] text-brand-600 font-semibold">Tours in Workspace</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-soft space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Partner Hotels</span>
          <div className="text-2xl font-extrabold text-navy-950 font-display">{hotels.length}</div>
          <p className="text-[10px] text-emerald-600 font-semibold">In Master Hotel DB</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-soft space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Direct Web Entry</span>
          <div className="text-lg font-extrabold text-navy-950 font-display">Active</div>
          <p className="text-[10px] text-slate-500">Excel tables replicated</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-soft space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Voucher Delivery</span>
          <div className="text-2xl font-extrabold text-slate-800 font-display">{emailLogs.length}</div>
          <p className="text-[10px] text-slate-500">Sent to hotel properties</p>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950 to-emerald-900 text-white shadow-soft space-y-1">
          <span className="text-[10px] font-bold text-emerald-300 uppercase">Voucher Engine</span>
          <div className="text-lg font-extrabold text-emerald-400 font-display">Auto-Detected</div>
          <p className="text-[10px] text-emerald-300 font-semibold">Separate per hotel</p>
        </div>
      </div>

      {/* Fast Action Shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link
          href="/tours/new"
          className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-soft hover:shadow-card hover:border-brand-300 transition-all text-left group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Plus className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-bold text-navy-950 block">Create New Tour</h4>
          <p className="text-[11px] text-slate-500 mt-0.5">Direct web data entry</p>
        </Link>

        <Link
          href="/tours"
          className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-soft hover:shadow-card hover:border-brand-300 transition-all text-left group"
        >
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Compass className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-bold text-navy-950 block">Saved Tours</h4>
          <p className="text-[11px] text-slate-500 mt-0.5">Edit tours & generate vouchers</p>
        </Link>

        <Link
          href="/hotels"
          className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-soft hover:shadow-card hover:border-brand-300 transition-all text-left group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Building2 className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-bold text-navy-950 block">Hotel Master DB</h4>
          <p className="text-[11px] text-slate-500 mt-0.5">Hotel emails & contacts</p>
        </Link>

        <Link
          href="/voucher-history"
          className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-soft hover:shadow-card hover:border-brand-300 transition-all text-left group"
        >
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Clock className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-bold text-navy-950 block">Voucher History</h4>
          <p className="text-[11px] text-slate-500 mt-0.5">Audit log & delivery status</p>
        </Link>
      </div>

      {/* Active Pipeline & Operations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Tours Pipeline */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-navy-950 font-display">Active Tours Pipeline</h3>
            <Link href="/tours" className="text-xs font-bold text-brand-600 hover:underline">
              View All Tours →
            </Link>
          </div>

          <div className="space-y-3">
            {tours.map((t) => (
              <div
                key={t.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <Link href={`/tours/${t.id}`} className="font-bold text-navy-950 hover:text-brand-600 block text-sm">
                    {t.tour_number} — {t.tour_name}
                  </Link>
                  <span className="text-[11px] text-slate-500">
                    Client: {t.client_name} ({t.total_pax} Pax) • {t.start_date} → {t.end_date}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-emerald-600 block">${(t.selling_price || 0).toLocaleString()}</span>
                  <span className="text-[10px] text-slate-400 font-semibold">{(t.gross_margin_percent || 0).toFixed(1)}% Margin</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Email & WhatsApp Activity */}
        <EmailActivityChart logs={emailLogs} />
      </div>
    </div>
  );
}
