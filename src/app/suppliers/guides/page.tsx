"use client";

import React, { useState, useEffect } from "react";
import { crmStore } from "@/lib/store";
import { Guide } from "@/lib/types";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import {
  Users,
  Plus,
  Phone,
  Mail,
  Languages,
  DollarSign,
  CheckCircle2,
  BedDouble,
  ShieldCheck,
} from "lucide-react";

export default function GuidesPage() {
  const { showToast } = useToast();
  const [guides, setGuides] = useState<Guide[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [guideType, setGuideType] = useState<any>("National Chauffeur Guide");
  const [languages, setLanguages] = useState("English, German");
  const [phone, setPhone] = useState("");
  const [license, setLicense] = useState("");
  const [dailyRate, setDailyRate] = useState(35);
  const [accommodationRate, setAccommodationRate] = useState(25);

  useEffect(() => {
    setGuides(crmStore.getGuides());
  }, []);

  const handleAddGuide = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      showToast("Please enter guide full name and phone number", "warning");
      return;
    }

    const newGuide: Guide = {
      id: `gd-${Date.now()}`,
      name,
      guide_type: guideType,
      languages: languages.split(",").map((l) => l.trim()),
      phone,
      whatsapp: phone,
      email: "guide@ceylon.lk",
      license_number: license || `SLTDA-CG-${Math.floor(1000 + Math.random() * 9000)}`,
      daily_rate: Number(dailyRate),
      accommodation_required: true,
      daily_accommodation_rate: Number(accommodationRate),
      currency: "USD",
      active: true,
    };

    crmStore.addGuide(newGuide);
    setGuides(crmStore.getGuides());
    setIsAddOpen(false);
    showToast(`Added guide profile for "${name}"!`, "success");

    setName("");
    setPhone("");
    setLicense("");
  };

  const columns: Column<Guide>[] = [
    {
      header: "Guide & Type",
      accessor: (g) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold flex-shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-navy-950 block">{g.name}</span>
            <span className="text-[10px] text-slate-500 font-medium">{g.guide_type}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Languages",
      accessor: (g) => (
        <div className="flex flex-wrap gap-1">
          {g.languages.map((lang, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-800 text-[10px] font-semibold"
            >
              {lang}
            </span>
          ))}
        </div>
      ),
    },
    {
      header: "SLTDA License & Phone",
      accessor: (g) => (
        <div className="text-xs">
          <span className="font-mono font-bold text-navy-950 block">{g.license_number}</span>
          <span className="text-[10px] text-slate-500">{g.phone}</span>
        </div>
      ),
    },
    {
      header: "Daily Rates (USD)",
      accessor: (g) => (
        <div className="text-xs font-mono font-bold">
          <span className="text-emerald-700 block">${g.daily_rate} / Day Service</span>
          <span className="text-[10px] text-slate-500 font-normal">
            + ${g.daily_accommodation_rate}/Night Hotel Room
          </span>
        </div>
      ),
    },
    {
      header: "Status",
      accessor: (g) => (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> SLTDA Certified
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-950 font-display tracking-tight">
            Chauffeurs & National Tourist Guides
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Maintain authorized multi-lingual guide assignments, daily allowances, and separate guide hotel room allocations.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-navy-950 hover:bg-brand-600 text-white text-xs font-bold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Guide Profile</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={guides}
        searchPlaceholder="Search guide name, language, or license number..."
      />

      {/* Add Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Chauffeur / Tourist Guide"
        subtitle="Record SLTDA certification, language skills, and daily allowances"
      >
        <form onSubmit={handleAddGuide} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Guide Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sunil Jayawardena"
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Guide Classification</label>
              <select
                value={guideType}
                onChange={(e) => setGuideType(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
              >
                <option value="National Chauffeur Guide">National Chauffeur Guide</option>
                <option value="Site Guide">Site Guide (Heritage Sites)</option>
                <option value="Trekking Guide">Trekking & Hiking Guide</option>
                <option value="Lecturer Guide">Lecturer Guide</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Languages Spoken (comma separated)</label>
              <input
                type="text"
                value={languages}
                onChange={(e) => setLanguages(e.target.value)}
                placeholder="English, German, French..."
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mobile / WhatsApp *</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+94 77 345 6789"
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">SLTDA License Number</label>
              <input
                type="text"
                value={license}
                onChange={(e) => setLicense(e.target.value)}
                placeholder="SLTDA-CG-4829"
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Daily Service Fee (USD)</label>
              <input
                type="number"
                value={dailyRate}
                onChange={(e) => setDailyRate(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Separate Guide Room Rate (USD/Night)</label>
              <input
                type="number"
                value={accommodationRate}
                onChange={(e) => setAccommodationRate(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 font-mono"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-navy-950 hover:bg-brand-600 text-white text-xs font-bold shadow-sm"
            >
              Save Guide Profile
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
