"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  FileSpreadsheet,
  Compass,
  Sparkles,
  DollarSign,
  Plus,
  ShieldCheck,
  ChevronRight,
  Bell
} from "lucide-react";
import { GlobalSearchModal } from "./GlobalSearchModal";

export function Header() {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const getPageInfo = () => {
    if (pathname.startsWith("/tours/")) {
      return { section: "Tour Workspace", title: "Commercial Tour Planner & Workspace" };
    }
    if (pathname === "/tours") {
      return { section: "Tours", title: "Tour Pipeline & Workspaces" };
    }
    if (pathname === "/costing") {
      return { section: "Finance Engine", title: "Dynamic Costing & Financial Matrix" };
    }
    if (pathname === "/quotations") {
      return { section: "Quotations", title: "Client Quotations & Proposal Generator" };
    }
    if (pathname === "/itineraries") {
      return { section: "Itineraries", title: "Master Itinerary Programs & AI Builder" };
    }
    if (pathname === "/routes") {
      return { section: "Route Engine", title: "Route Distance Engine & Driver KMs" };
    }
    if (pathname === "/leads") {
      return { section: "CRM", title: "Leads & Customer Inquiry Desk" };
    }
    if (pathname === "/clients") {
      return { section: "CRM", title: "Client Directory & Corporate Profiles" };
    }
    if (pathname.startsWith("/suppliers/rates")) {
      return { section: "Suppliers", title: "Master Dynamic Rate Catalog" };
    }
    if (pathname.startsWith("/suppliers/transport")) {
      return { section: "Suppliers", title: "Transport Fleets & Chauffeur Rates" };
    }
    if (pathname.startsWith("/suppliers/activities")) {
      return { section: "Suppliers", title: "Activity Providers & Excursion Tickets" };
    }
    if (pathname.startsWith("/suppliers/restaurants")) {
      return { section: "Suppliers", title: "Restaurants & Dining Stops" };
    }
    if (pathname.startsWith("/suppliers/guides")) {
      return { section: "Suppliers", title: "Tourist Chauffeur Guides & Fees" };
    }
    if (pathname === "/hotels") {
      return { section: "Suppliers", title: "Hotels & Partner Directory" };
    }
    if (pathname === "/bookings") {
      return { section: "Operations", title: "Master Bookings & Reservations" };
    }
    if (pathname === "/operations") {
      return { section: "Operations", title: "Field Operations & Arrival Board" };
    }
    if (pathname === "/operations/calendar") {
      return { section: "Operations", title: "Tour & Excursion Master Calendar" };
    }
    if (pathname === "/bulk-voucher") {
      return { section: "Vouchers", title: "Bulk Excel Voucher Dispatch" };
    }
    if (pathname === "/voucher-history") {
      return { section: "Vouchers", title: "Voucher Audit & Delivery History" };
    }
    if (pathname.startsWith("/finance/invoices")) {
      return { section: "Finance", title: "Client Commercial Invoices" };
    }
    if (pathname.startsWith("/finance/payments")) {
      return { section: "Finance", title: "Client Receipts & Payments Ledger" };
    }
    if (pathname.startsWith("/finance/supplier-payments")) {
      return { section: "Finance", title: "Supplier Payables & Settlements" };
    }
    if (pathname.startsWith("/finance/expenses")) {
      return { section: "Finance", title: "Tour Direct Expenses & Fuel/Bata" };
    }
    if (pathname.startsWith("/finance/profit-loss")) {
      return { section: "Finance", title: "Profit & Loss Statements" };
    }
    if (pathname.startsWith("/finance/reports")) {
      return { section: "Finance", title: "Executive Analytics & Export Reports" };
    }
    if (pathname.startsWith("/communication/whatsapp")) {
      return { section: "Communication", title: "WhatsApp Direct Dispatch Desk" };
    }
    if (pathname === "/email-templates") {
      return { section: "Communication", title: "Email Templates & Token Studio" };
    }
    if (pathname === "/documents") {
      return { section: "Documents", title: "Document Vault & Supabase Storage" };
    }
    if (pathname === "/settings") {
      return { section: "Settings", title: "Company Branding & Hostinger SMTP" };
    }
    return { section: "Overview", title: "Executive Travel ERP Dashboard" };
  };

  const pageInfo = getPageInfo();

  return (
    <>
      <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm select-none">
        {/* Left Title & Breadcrumbs */}
        <div className="flex items-center gap-3 min-w-0">
          <div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
              <span>Dodoz Leisure</span>
              <ChevronRight className="w-3 h-3 text-slate-300" />
              <span className="text-brand-600 font-bold">{pageInfo.section}</span>
            </div>
            <h1 className="text-base font-extrabold text-navy-950 font-display tracking-tight truncate leading-tight mt-0.5">
              {pageInfo.title}
            </h1>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Quick Search Button */}
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-all"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span>Search ERP...</span>
            <kbd className="px-1.5 py-0.5 text-[9px] font-mono rounded bg-white text-slate-400 border border-slate-200">
              Ctrl+K
            </kbd>
          </button>

          {/* Create New Tour Primary Header Action */}
          <Link
            href="/tours/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-navy-950 hover:bg-brand-600 text-white text-xs font-bold transition-all shadow-soft"
          >
            <Plus className="w-3.5 h-3.5 text-brand-300" />
            <span>+ New Tour</span>
          </Link>

          {/* Quick Hotel Master DB Link */}
          <Link
            href="/hotels"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-700 transition-colors"
          >
            <span>Hotel Database</span>
          </Link>

          {/* Live Currency Exchange Pill */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-mono text-slate-700">
            <span className="font-extrabold text-brand-600">USD 1.00</span>
            <span className="text-slate-400">=</span>
            <span className="text-slate-900 font-bold">LKR 305.00</span>
          </div>

          {/* User Profile Pill */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-xl bg-navy-950 text-white font-extrabold text-xs flex items-center justify-center border border-navy-800 shadow-sm ring-2 ring-brand-500/20">
              DZ
            </div>
            <div className="hidden xl:block text-left">
              <span className="text-xs font-bold text-navy-950 block leading-none">Dodoz Admin</span>
              <span className="text-[10px] text-slate-400 font-medium">Head of Operations</span>
            </div>
          </div>
        </div>
      </header>

      {/* Global Search Command Palette */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
