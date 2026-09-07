"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Inbox,
  Compass,
  Plus,
  FileSpreadsheet,
  Calculator,
  CalendarCheck,
  Building2,
  Car,
  Utensils,
  MapPin,
  Plane,
  Receipt,
  DollarSign,
  TrendingUp,
  FileText,
  Mail,
  MessageSquare,
  Settings,
  History,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Search,
  BookOpen,
} from "lucide-react";
import { GlobalSearchModal } from "./GlobalSearchModal";

interface NavGroup {
  category: string;
  items: {
    name: string;
    href: string;
    icon: any;
    badge?: string;
  }[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    category: "MAIN WORKFLOW",
    items: [
      { name: "Create New Tour", href: "/tours/new", icon: Plus, badge: "New" },
      { name: "Saved Tours & Workspaces", href: "/tours", icon: Compass, badge: "Central" },
      { name: "Hotel Master Database", href: "/hotels", icon: Building2, badge: "Partners" },
      { name: "Voucher Dispatch & History", href: "/voucher-history", icon: History },
      { name: "Agency & Email Settings", href: "/settings", icon: Settings },
    ],
  },
  {
    category: "OPTIONAL TOOLS & UTILITIES",
    items: [
      { name: "Dashboard Overview", href: "/dashboard", icon: LayoutDashboard },
      { name: "Route & Distance Planner", href: "/routes", icon: MapPin },
      { name: "Dynamic Costing", href: "/costing", icon: Calculator },
      { name: "Client Quotations", href: "/quotations", icon: FileText },
      { name: "Excel Import Tool", href: "/bulk-voucher", icon: FileSpreadsheet, badge: "Optional" },
      { name: "Email Templates", href: "/email-templates", icon: Mail },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      <aside className="w-64 bg-navy-950 text-white flex flex-col border-r border-navy-900 select-none flex-shrink-0 min-h-screen">
        {/* Brand Header */}
        <div className="p-4 border-b border-navy-900/80 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-sky-500 to-emerald-400 p-0.5 shadow-glow flex items-center justify-center">
              <div className="w-full h-full bg-navy-950 rounded-[10px] flex items-center justify-center font-bold text-white text-base">
                🌴
              </div>
            </div>
            <div>
              <h1 className="font-extrabold text-sm tracking-wide text-white font-display flex items-center gap-1">
                DODOZ <span className="text-brand-400 font-medium">LEISURE</span>
              </h1>
              <p className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold">
                Travel Agency ERP
              </p>
            </div>
          </Link>
        </div>

        {/* Fast Global Search Trigger */}
        <div className="px-3 pt-3">
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-navy-900/80 border border-navy-800 text-xs text-slate-400 hover:text-white hover:border-brand-500/50 transition-all group"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-400 transition-colors" />
              <span>Quick Search...</span>
            </div>
            <kbd className="px-1.5 py-0.5 text-[9px] font-mono rounded bg-navy-950 text-slate-400 border border-navy-800">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Navigation Groups List */}
        <div className="flex-1 py-3 px-3 space-y-5 overflow-y-auto custom-scrollbar">
          {NAV_GROUPS.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <h2 className="px-3 text-[9px] font-bold tracking-wider text-slate-400 uppercase">
                {group.category}
              </h2>
              <div className="space-y-0.5 pt-0.5">
                {group.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/" && pathname.startsWith(item.href));
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 group ${
                        isActive
                          ? "bg-brand-600 text-white shadow-soft font-bold"
                          : "text-slate-300 hover:bg-navy-900 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={`w-4 h-4 flex-shrink-0 transition-colors ${
                            isActive
                              ? "text-white"
                              : "text-slate-400 group-hover:text-brand-400"
                          }`}
                        />
                        <span className="truncate">{item.name}</span>
                      </div>

                      {item.badge && (
                        <span
                          className={`px-1.5 py-0.2 text-[8.5px] rounded font-bold uppercase tracking-tight ${
                            isActive
                              ? "bg-white/25 text-white"
                              : "bg-navy-900 text-brand-300 border border-brand-500/20"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* System Status Footer */}
        <div className="p-3 border-t border-navy-900/80 bg-navy-950/60">
          <div className="p-2.5 rounded-xl bg-navy-900/90 border border-navy-800 text-[11px] text-slate-300 space-y-1">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-bold text-white text-[10.5px]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Dodoz Enterprise ERP
              </span>
              <span className="text-[9px] text-emerald-400 font-mono">v2.0</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Hostinger SMTP & Distance Engine Ready
            </p>
          </div>
        </div>
      </aside>

      {/* Global Search Dialog */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
}
