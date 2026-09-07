"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { crmStore } from "@/lib/store";
import {
  Search,
  Building2,
  Compass,
  Users,
  Car,
  FileText,
  DollarSign,
  Calendar,
  X,
  ArrowRight,
} from "lucide-react";

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const tours = crmStore.getTours();
  const clients = crmStore.getClients();
  const hotels = crmStore.getHotels();
  const suppliers = crmStore.getSuppliers();
  const vouchers = crmStore.getVouchers();
  const invoices = crmStore.getInvoices();

  const filteredTours = query.trim()
    ? tours.filter(
        (t) =>
          t.tour_number.toLowerCase().includes(query.toLowerCase()) ||
          t.tour_name.toLowerCase().includes(query.toLowerCase()) ||
          t.client_name.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const filteredClients = query.trim()
    ? clients.filter(
        (c) =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.country?.toLowerCase().includes(query.toLowerCase()) ||
          c.email?.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const filteredHotels = query.trim()
    ? hotels.filter(
        (h) =>
          h.hotel_name.toLowerCase().includes(query.toLowerCase()) ||
          h.city?.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const filteredSuppliers = query.trim()
    ? suppliers.filter(
        (s) =>
          s.name.toLowerCase().includes(query.toLowerCase()) ||
          s.type.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const handleNavigate = (path: string) => {
    router.push(path);
    onClose();
  };

  const totalResults =
    filteredTours.length +
    filteredClients.length +
    filteredHotels.length +
    filteredSuppliers.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-navy-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-floating border border-slate-200 overflow-hidden">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-200 flex items-center gap-3 bg-slate-50/50">
          <Search className="w-5 h-5 text-brand-600 flex-shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tours (DDL-2026-0001), clients, hotels, suppliers..."
            className="flex-1 text-sm bg-transparent border-none focus:outline-none text-navy-950 font-medium placeholder:text-slate-400"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-200 text-slate-600">
            ESC
          </span>
        </div>

        {/* Results Container */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4 text-xs">
          {!query.trim() ? (
            <div className="py-8 text-center text-slate-400 space-y-2">
              <Compass className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="font-medium text-slate-600">Universal Travel Agency ERP Search</p>
              <p className="text-[11px] text-slate-400">
                Type any tour code, guest name, hotel property, or supplier to jump directly.
              </p>
            </div>
          ) : totalResults === 0 ? (
            <div className="py-8 text-center text-slate-400">
              No matching records found for <strong className="text-slate-700">"{query}"</strong>
            </div>
          ) : (
            <>
              {/* Tours */}
              {filteredTours.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
                    Tours ({filteredTours.length})
                  </span>
                  {filteredTours.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => handleNavigate(`/tours/${t.id}`)}
                      className="p-3 rounded-xl hover:bg-brand-50/70 border border-transparent hover:border-brand-200 cursor-pointer flex items-center justify-between transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center font-bold">
                          <Compass className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-navy-950 block">{t.tour_number} — {t.tour_name}</span>
                          <span className="text-[10px] text-slate-500">{t.client_name} • {t.destination}</span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-brand-500" />
                    </div>
                  ))}
                </div>
              )}

              {/* Clients */}
              {filteredClients.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
                    Clients ({filteredClients.length})
                  </span>
                  {filteredClients.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => handleNavigate(`/clients`)}
                      className="p-3 rounded-xl hover:bg-emerald-50/70 border border-transparent hover:border-emerald-200 cursor-pointer flex items-center justify-between transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                          <Users className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-navy-950 block">{c.name}</span>
                          <span className="text-[10px] text-slate-500">{c.country} • {c.email || c.phone}</span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-emerald-500" />
                    </div>
                  ))}
                </div>
              )}

              {/* Hotels */}
              {filteredHotels.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
                    Hotels ({filteredHotels.length})
                  </span>
                  {filteredHotels.map((h) => (
                    <div
                      key={h.id}
                      onClick={() => handleNavigate(`/suppliers/hotels`)}
                      className="p-3 rounded-xl hover:bg-amber-50/70 border border-transparent hover:border-amber-200 cursor-pointer flex items-center justify-between transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-navy-950 block">{h.hotel_name}</span>
                          <span className="text-[10px] text-slate-500">{h.city} • {h.reservation_email}</span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-amber-500" />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
