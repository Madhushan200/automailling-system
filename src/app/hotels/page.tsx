"use client";

import React, { useState, useEffect } from "react";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { crmStore } from "@/lib/store";
import { Hotel } from "@/lib/types";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Plus,
  Send,
  Loader2,
  Trash2,
  Edit3,
  CheckCircle2,
} from "lucide-react";

export default function HotelsPage() {
  const { showToast } = useToast();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);

  // Form State
  const [hotelName, setHotelName] = useState("");
  const [email, setEmail] = useState("");
  const [ccEmail, setCcEmail] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    setHotels(crmStore.getHotels());
  }, []);

  const openCreateModal = () => {
    setEditingHotel(null);
    setHotelName("");
    setEmail("");
    setCcEmail("");
    setContactPerson("");
    setPhone("");
    setAddress("");
    setNotes("");
    setIsAddModalOpen(true);
  };

  const openEditModal = (h: Hotel) => {
    setEditingHotel(h);
    setHotelName(h.hotel_name);
    setEmail(h.reservation_email);
    setCcEmail(h.cc_email || "");
    setContactPerson(h.contact_person || "");
    setPhone(h.phone || "");
    setAddress(h.address || "");
    setNotes(h.notes || "");
    setIsAddModalOpen(true);
  };

  const handleSaveHotel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hotelName || !email) {
      showToast("Please enter hotel name and reservation email", "warning");
      return;
    }

    if (editingHotel) {
      crmStore.updateHotel(editingHotel.id, {
        hotel_name: hotelName.trim().toUpperCase(),
        reservation_email: email.trim(),
        cc_email: ccEmail.trim(),
        contact_person: contactPerson.trim(),
        phone: phone.trim(),
        address: address.trim(),
        notes: notes.trim(),
      });
      showToast(`Updated "${hotelName}" in Master Database!`, "success");
    } else {
      const newHotel: Hotel = {
        id: `hotel-${Date.now()}`,
        hotel_name: hotelName.trim().toUpperCase(),
        reservation_email: email.trim(),
        cc_email: ccEmail.trim(),
        contact_person: contactPerson.trim(),
        phone: phone.trim(),
        address: address.trim(),
        city: "Sri Lanka",
        notes: notes.trim(),
        active: true,
        star_rating: 4,
      };
      crmStore.addHotel(newHotel);
      showToast(`Added "${hotelName}" to Master Database!`, "success");
    }

    setHotels(crmStore.getHotels());
    setIsAddModalOpen(false);
  };

  const handleDeleteHotel = (hotel: Hotel) => {
    if (confirm(`Are you sure you want to delete hotel "${hotel.hotel_name}" from database?`)) {
      crmStore.deleteHotel(hotel.id);
      setHotels(crmStore.getHotels());
      showToast(`Removed "${hotel.hotel_name}"`, "info");
    }
  };

  const columns: Column<Hotel>[] = [
    {
      header: "Hotel Name",
      accessor: (h) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-navy-950 text-white flex items-center justify-center font-bold flex-shrink-0">
            <Building2 className="w-4 h-4 text-brand-300" />
          </div>
          <div>
            <div className="font-extrabold text-navy-950 uppercase tracking-tight text-xs">
              {h.hotel_name}
            </div>
            <span className="text-[10px] text-slate-500">{h.address || h.city || "Sri Lanka"}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Hotel Emails",
      accessor: (h) => (
        <div className="text-xs">
          <span className="font-mono font-bold text-navy-950 block">{h.reservation_email}</span>
          {h.cc_email && (
            <span className="text-[10px] text-slate-400 font-mono block">CC: {h.cc_email}</span>
          )}
        </div>
      ),
    },
    {
      header: "Contact Person & Number",
      accessor: (h) => (
        <div className="text-xs text-slate-600">
          <span className="font-bold text-slate-800 block">{h.contact_person || "Reservations Team"}</span>
          <span className="text-[10px] text-slate-500 font-mono">{h.phone || "—"}</span>
        </div>
      ),
    },
    {
      header: "Notes & Details",
      accessor: (h) => (
        <div className="text-xs text-slate-600 max-w-xs line-clamp-2">
          {h.notes || "Standard agency partner"}
        </div>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      accessor: (h) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => openEditModal(h)}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
            title="Edit Hotel"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleDeleteHotel(h)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Delete Hotel"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-950 font-display tracking-tight">
            Hotel Master Database
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Master list of partner hotels. When entering hotel names in the accommodation table, the system suggests hotels from this database and automatically knows their email addresses.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-navy-950 hover:bg-brand-600 text-white text-xs font-bold shadow-soft transition-all"
        >
          <Plus className="w-4 h-4 text-brand-300" />
          <span>Add Hotel to Database</span>
        </button>
      </div>

      {/* Hotel Database Table */}
      <DataTable
        columns={columns}
        data={hotels}
        searchPlaceholder="Search hotel by name (EARLS, ARALIYA, GRANBELL), email, or city..."
      />

      {/* Add / Edit Hotel Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingHotel ? `Edit Hotel: ${editingHotel.hotel_name}` : "Add Partner Hotel to Database"}
        subtitle="Ensure the hotel name and email are accurate for automated voucher dispatch"
      >
        <form onSubmit={handleSaveHotel} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Hotel Name *</label>
            <input
              type="text"
              required
              value={hotelName}
              onChange={(e) => setHotelName(e.target.value)}
              placeholder="e.g. EARLS REGENT"
              className="w-full px-3 py-2 text-xs font-bold uppercase border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Hotel Email (Primary) *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="reservations@earlsregent.com"
                className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">CC Email (Optional)</label>
              <input
                type="email"
                value={ccEmail}
                onChange={(e) => setCcEmail(e.target.value)}
                placeholder="fo@earlsregent.com"
                className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Contact Person</label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="e.g. Mr. Samantha Bandara"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Contact Number / Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+94 81 222 3456"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Hotel Address / City</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Devalakoppa, Kandy, Sri Lanka"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Notes & Preferences</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Partner hotel with prompt confirmation. VIP complimentary amenities."
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-navy-950 hover:bg-brand-600 text-white text-xs font-bold shadow-soft"
            >
              {editingHotel ? "Update Hotel" : "Save Hotel to Database"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
