"use client";

import React, { useState, useEffect } from "react";
import { crmStore } from "@/lib/store";
import { OperationsItem, Booking } from "@/lib/types";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";
import {
  Plane,
  Printer,
  FileText,
  User,
  Car,
  Shield,
  Phone,
  Calendar,
  Sparkles,
  Building2,
  CheckCircle2,
  Share2,
} from "lucide-react";

export default function OperationsPage() {
  const { showToast } = useToast();
  const [operations, setOperations] = useState<OperationsItem[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedPlacard, setSelectedPlacard] = useState<OperationsItem | null>(null);
  const [selectedManifest, setSelectedManifest] = useState<OperationsItem | null>(null);

  useEffect(() => {
    setOperations(crmStore.getOperations());
    setBookings(crmStore.getBookings());
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-navy-950 font-display tracking-tight">
          Field Operations & Chauffeur Dispatch Desk
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Generate high-resolution VIP Airport Arrival Nameboards and Chauffeur Trip Manifests for on-ground tour operations.
        </p>
      </div>

      {/* Operations Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* VIP Airport Nameboard Card */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
              <Plane className="w-6 h-6" />
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Arrival Lobby Ready
            </span>
          </div>

          <div>
            <h3 className="text-base font-bold text-navy-950 font-display">VIP Airport Arrival Nameboard</h3>
            <p className="text-xs text-slate-500 mt-1">
              High-visibility iPad / A4 greeting placard with Dodoz Leisure branding, flight ETA, and chauffeur details.
            </p>
          </div>

          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const item = operations.find((o) => o.type === "arrival_placard") || operations[0];
                setSelectedPlacard(item);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-navy-950 hover:bg-brand-600 text-white text-xs font-bold shadow-sm transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>Launch Nameboard Placard</span>
            </button>
          </div>
        </div>

        {/* Chauffeur Trip Manifest Card */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Car className="w-6 h-6" />
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-50 text-brand-700 border border-brand-200">
              Trip Dispatch Sheet
            </span>
          </div>

          <div>
            <h3 className="text-base font-bold text-navy-950 font-display">Official Chauffeur Driver Manifest</h3>
            <p className="text-xs text-slate-500 mt-1">
              Complete operational dossier given to drivers with day-by-day hotel check-in vouchers, minimum daily KMs, and emergency hotlines.
            </p>
          </div>

          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const item = operations.find((o) => o.type === "driver_manifest") || operations[1];
                setSelectedManifest(item);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-navy-950 hover:bg-brand-600 text-white text-xs font-bold shadow-sm transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>View Driver Manifest Sheet</span>
            </button>
          </div>
        </div>
      </div>

      {/* Placard Modal */}
      {selectedPlacard && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedPlacard(null)}
          title="VIP Airport Arrival Nameboard Placard"
          subtitle="Designed for Chauffeur iPads or standard A4 Arrival Greeting"
          maxWidth="3xl"
        >
          <div className="space-y-6">
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-navy-950 hover:bg-brand-600 text-white text-xs font-bold shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Placard (A4)</span>
              </button>
            </div>

            {/* Branded High Resolution Placard Canvas */}
            <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-navy-950 via-navy-900 to-brand-950 text-white shadow-floating border-4 border-brand-400 text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-bold tracking-widest text-brand-300 uppercase">
                🌴 Dodoz Leisure Premium Welcome
              </div>

              <div className="space-y-2 py-4">
                <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold block">
                  Warm Ayubowan to
                </span>
                <h1 className="text-3xl sm:text-5xl font-extrabold font-display tracking-tight text-white uppercase text-balance drop-shadow-md">
                  {selectedPlacard.guest_name}
                </h1>
                <p className="text-sm font-semibold text-brand-300 font-mono pt-1">
                  Tour: {selectedPlacard.tour_number || "DZ-2026-001"} ({selectedPlacard.pax_count} Guests)
                </p>
              </div>

              {/* Flight & Chauffeur Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-white/10 border border-white/15 text-left text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Flight Arrival Reference</span>
                  <span className="font-bold text-white text-sm">{selectedPlacard.flight_details || "QR 668 at 08:30 AM"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Assigned Chauffeur Guide</span>
                  <span className="font-bold text-white text-sm">{selectedPlacard.driver_name}</span>
                  <span className="text-[11px] text-brand-300 block">{selectedPlacard.vehicle_plate} • {selectedPlacard.driver_mobile}</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 font-medium">
                24/7 Agency Operations Hotline: +94 11 234 5678 | WhatsApp: +94 77 123 4567
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Driver Manifest Modal */}
      {selectedManifest && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedManifest(null)}
          title="Official Chauffeur Driver Trip Manifest"
          subtitle="Tour Dispatch & Hotel Accommodation Sequence"
          maxWidth="4xl"
        >
          <div className="space-y-6">
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-navy-950 hover:bg-brand-600 text-white text-xs font-bold shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Driver Manifest</span>
              </button>
            </div>

            {/* Manifest Content */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-6 text-xs text-slate-800">
              {/* Header */}
              <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-lg font-extrabold text-navy-950 font-display">
                    DODOZ LEISURE — CHAUFFEUR TOUR MANIFEST
                  </h2>
                  <p className="text-slate-500 text-[11px]">Tour Code: {selectedManifest.tour_number} | Guest: {selectedManifest.guest_name}</p>
                </div>
                <div className="text-right text-xs">
                  <span className="font-bold text-navy-950 block">Dodoz Leisure Sri Lanka</span>
                  <span className="text-slate-500">24/7 Ops: +94 11 234 5678</span>
                </div>
              </div>

              {/* Driver & Vehicle Box */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Chauffeur Guide</span>
                  <strong className="text-slate-900">{selectedManifest.driver_name}</strong>
                  <span className="text-[10px] text-slate-500 block">{selectedManifest.driver_license}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Vehicle Plate</span>
                  <strong className="text-slate-900">{selectedManifest.vehicle_plate}</strong>
                  <span className="text-[10px] text-slate-500 block">{selectedManifest.vehicle_type}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Daily Min Baseline</span>
                  <strong className="text-brand-600">100 KM / Day</strong>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Driver Night Bata</span>
                  <strong className="text-emerald-700">$20 / Night</strong>
                </div>
              </div>

              {/* Hotel Check-in Vouchers Table */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Hotel Accommodation Sequence & Voucher References
                </h4>
                <table className="w-full text-left border-collapse border border-slate-200 text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold">
                      <th className="p-2 border border-slate-200">#</th>
                      <th className="p-2 border border-slate-200">Dates</th>
                      <th className="p-2 border border-slate-200">Hotel Property & City</th>
                      <th className="p-2 border border-slate-200">Rooms & Meal</th>
                      <th className="p-2 border border-slate-200">Voucher Ref</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b, idx) => (
                      <tr key={b.id} className="hover:bg-slate-50">
                        <td className="p-2 border border-slate-200 font-bold text-center">{idx + 1}</td>
                        <td className="p-2 border border-slate-200 font-medium">{b.check_in_date} → {b.check_out_date}</td>
                        <td className="p-2 border border-slate-200 font-bold text-navy-950">{b.hotel_name}</td>
                        <td className="p-2 border border-slate-200">{(b.dbl_rooms || 1)} DBL ({b.meal_plan})</td>
                        <td className="p-2 border border-slate-200 font-mono text-brand-600 font-bold">{b.confirmation_number || "VCH-CONFIRMED"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Emergency Hotlines */}
              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 flex flex-wrap items-center justify-between gap-2 text-xs text-amber-900">
                <span className="font-bold">🚨 Emergency Contacts:</span>
                <span>Tourist Police: 1912</span>
                <span>Emergency Ambulance: 1990</span>
                <span>Police: 119</span>
                <span>Dodoz Tour Manager: +94 77 123 4567</span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
