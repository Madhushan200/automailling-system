"use client";

import React, { useState, useEffect } from "react";
import { DataTable, Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { crmStore } from "@/lib/store";
import { Booking } from "@/lib/types";
import { Plus, CalendarCheck, BedDouble, Building2, User, Send } from "lucide-react";

export default function BookingsPage() {
  const { showToast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [clientName, setClientName] = useState("");
  const [hotelName, setHotelName] = useState("");
  const [tourNumber, setTourNumber] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [roomType, setRoomType] = useState("Deluxe Ocean View");
  const [mealPlan, setMealPlan] = useState("HB");
  const [dblRooms, setDblRooms] = useState(1);
  const [specialRequests, setSpecialRequests] = useState("");

  useEffect(() => {
    setBookings(crmStore.getBookings());
  }, []);

  const handleCreateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !hotelName || !checkIn || !checkOut) {
      showToast("Please fill in all required fields", "warning");
      return;
    }

    const newBooking: Booking = {
      id: `b-${Date.now()}`,
      booking_reference: `BK-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      tour_number: tourNumber || `DZ-${new Date().getFullYear()}-099`,
      client_name: clientName,
      supplier_name: hotelName,
      booking_type: "Hotel",
      hotel_name: hotelName,
      check_in_date: checkIn,
      check_out_date: checkOut,
      sgl_rooms: 0,
      dbl_rooms: dblRooms,
      tpl_rooms: 0,
      room_type: roomType,
      meal_plan: mealPlan,
      status: "Confirmed",
      special_requests: specialRequests,
      total_cost: dblRooms * 180 * 2,
      currency: "USD",
      created_at: new Date().toISOString(),
    };

    crmStore.addBooking(newBooking);
    setBookings(crmStore.getBookings());
    setIsModalOpen(false);
    showToast(`Created booking reference ${newBooking.booking_reference}`, "success");

    // Reset Form
    setClientName("");
    setHotelName("");
    setTourNumber("");
    setCheckIn("");
    setCheckOut("");
  };

  const columns: Column<Booking>[] = [
    {
      header: "Booking Ref",
      accessor: (b) => (
        <div>
          <span className="font-mono font-bold text-slate-900 block">{b.booking_reference}</span>
          <span className="text-[10px] text-brand-600 font-mono">{b.tour_number || "DIRECT"}</span>
        </div>
      ),
    },
    {
      header: "Client / Group",
      accessor: (b) => (
        <div className="font-bold text-navy-950">
          {b.client_name}
        </div>
      ),
    },
    {
      header: "Hotel Property",
      accessor: (b) => (
        <div>
          <span className="font-semibold text-slate-900 block">{b.hotel_name}</span>
          <span className="text-[10px] text-slate-500">{b.room_type}</span>
        </div>
      ),
    },
    {
      header: "Dates & Duration",
      accessor: (b) => (
        <div className="text-xs text-slate-600">
          <span className="font-medium text-slate-900 block">{b.check_in_date} → {b.check_out_date}</span>
          <span className="text-[10px] text-slate-400">{b.total_nights || 2} Nights</span>
        </div>
      ),
    },
    {
      header: "Room & Meal",
      accessor: (b) => (
        <div className="text-xs">
          <span className="font-bold text-slate-800 block">
            {(b.dbl_rooms || 0) + (b.sgl_rooms || 0) + (b.tpl_rooms || 0)} Rooms
          </span>
          <span className="text-[10px] font-bold text-brand-600">{b.meal_plan}</span>
        </div>
      ),
    },
    {
      header: "Status",
      accessor: (b) => <StatusBadge status={b.status} size="sm" />,
    },
    {
      header: "Actions",
      className: "text-right",
      accessor: (b) => (
        <button
          onClick={() => showToast(`Opening confirmation for ${b.booking_reference}`, "info")}
          className="px-3 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
        >
          Details
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-950 font-display tracking-tight">
            Hotel Reservations & Bookings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage commercial tour bookings, room allocations, meal plans, and confirmation statuses.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-navy-950 hover:bg-brand-600 text-white text-xs font-bold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Reservation</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={bookings}
        searchPlaceholder="Search by client, hotel, or booking ref..."
      />

      {/* New Booking Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Hotel Reservation"
        subtitle="Add a single property reservation to Dodoz Leisure CRM"
      >
        <form onSubmit={handleCreateBooking} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Client / Group Name *</label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Dr. Jonathan Hayes & Family"
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Hotel Property *</label>
              <input
                type="text"
                required
                value={hotelName}
                onChange={(e) => setHotelName(e.target.value)}
                placeholder="e.g. Heritance Kandalama"
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Check-in Date *</label>
              <input
                type="date"
                required
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Check-out Date *</label>
              <input
                type="date"
                required
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Room Category</label>
              <input
                type="text"
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Meal Plan</label>
              <select
                value={mealPlan}
                onChange={(e) => setMealPlan(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                <option value="RO">Room Only (RO)</option>
                <option value="BB">Bed & Breakfast (BB)</option>
                <option value="HB">Half Board (HB)</option>
                <option value="FB">Full Board (FB)</option>
                <option value="AI">All Inclusive (AI)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Special Preferences / Notes</label>
            <textarea
              rows={3}
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="Interconnecting rooms, ocean view, honeymoon amenities..."
              className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-navy-950 hover:bg-brand-600 text-white text-xs font-bold shadow-sm"
            >
              Save Reservation
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
