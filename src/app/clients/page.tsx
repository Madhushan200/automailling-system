"use client";

import React, { useState, useEffect } from "react";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { crmStore } from "@/lib/store";
import { Client } from "@/lib/types";
import { Users, Phone, Mail, Globe, Shield, Plus, MessageSquare } from "lucide-react";

export default function ClientsPage() {
  const { showToast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("Australia");
  const [passport, setPassport] = useState("");
  const [dietary, setDietary] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    setClients(crmStore.getClients());
  }, []);

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      showToast("Please enter client full name", "warning");
      return;
    }

    const newClient: Client = {
      id: `c-${Date.now()}`,
      name,
      email,
      phone,
      whatsapp: phone,
      country,
      passport_number: passport,
      dietary_requirements: dietary,
      notes,
      created_at: new Date().toISOString(),
    };

    crmStore.addClient(newClient);
    setClients(crmStore.getClients());
    setIsAddModalOpen(false);
    showToast(`Saved profile for ${name}`, "success");

    setName("");
    setEmail("");
    setPhone("");
  };

  const columns: Column<Client>[] = [
    {
      header: "Client / Guest Name",
      accessor: (c) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-navy-950 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
            {c.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <span className="font-bold text-navy-950 block">{c.name}</span>
            <span className="text-[10px] text-slate-500">{c.country || "International Guest"}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Contact Details",
      accessor: (c) => (
        <div className="text-xs">
          <span className="font-medium text-slate-900 block">{c.email || "No email"}</span>
          <span className="text-[10px] text-slate-500">{c.phone || "—"}</span>
        </div>
      ),
    },
    {
      header: "Tour Reference",
      accessor: (c) => (
        <div>
          <span className="text-xs font-mono font-bold text-brand-600 block">{c.tour_number || "DIRECT"}</span>
          <span className="text-[10px] text-slate-400 font-mono">{c.reference || "—"}</span>
        </div>
      ),
    },
    {
      header: "Special Preferences",
      accessor: (c) => (
        <div className="text-xs text-slate-600 max-w-xs truncate">
          {c.dietary_requirements || c.notes || "Standard VIP hospitality"}
        </div>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      accessor: (c) => (
        <div className="flex items-center justify-end gap-1.5">
          {c.phone && (
            <a
              href={`https://wa.me/${c.phone.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"
              title="WhatsApp Guest"
            >
              <MessageSquare className="w-4 h-4" />
            </a>
          )}
          <button
            onClick={() => showToast(`Viewing full profile for ${c.name}`, "info")}
            className="px-3 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            Profile
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-950 font-display tracking-tight">
            Clients & VIP Guests Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Maintain guest travel histories, emergency contacts, passport details, and dietary preferences.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-navy-950 hover:bg-brand-600 text-white text-xs font-bold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Client Profile</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={clients}
        searchPlaceholder="Search client name, country, or email..."
      />

      {/* Add Client Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Client Profile"
        subtitle="Record international traveler preferences and emergency contact"
      >
        <form onSubmit={handleAddClient} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alexander Schmidt"
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@gmail.com"
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mobile / WhatsApp</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+49 170 1234567"
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Country / Nationality</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Germany"
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Passport Number</label>
              <input
                type="text"
                value={passport}
                onChange={(e) => setPassport(e.target.value)}
                placeholder="C48291048"
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Dietary Requirements</label>
              <input
                type="text"
                value={dietary}
                onChange={(e) => setDietary(e.target.value)}
                placeholder="Gluten-free, Vegetarian, Halal..."
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Notes & VIP Preferences</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="High floor room preference, anniversary celebration..."
              className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-navy-950 hover:bg-brand-600 text-white text-xs font-bold shadow-sm"
            >
              Save Profile
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
