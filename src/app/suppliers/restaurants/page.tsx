"use client";

import React, { useState, useEffect } from "react";
import { crmStore } from "@/lib/store";
import { Restaurant } from "@/lib/types";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import {
  Utensils,
  Plus,
  MapPin,
  Phone,
  Mail,
  DollarSign,
  CheckCircle2,
} from "lucide-react";

export default function RestaurantsPage() {
  const { showToast } = useToast();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [phone, setPhone] = useState("");
  const [adultRate, setAdultRate] = useState(20);
  const [childRate, setChildRate] = useState(10);

  useEffect(() => {
    setRestaurants(crmStore.getRestaurants());
  }, []);

  const handleAddRestaurant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !location) {
      showToast("Please enter restaurant name and location", "warning");
      return;
    }

    const newRestaurant: Restaurant = {
      id: `rst-${Date.now()}`,
      name,
      location,
      cuisine: cuisine || "Traditional Ceylon & International",
      phone,
      whatsapp: phone,
      email: "dining@restaurant.com",
      currency: "USD",
      rates: {
        lunch_rate: adultRate,
        dinner_rate: adultRate + 5,
        buffet_rate: adultRate,
        adult_rate: Number(adultRate),
        child_rate: Number(childRate),
      },
      active: true,
    };

    crmStore.addRestaurant(newRestaurant);
    setRestaurants(crmStore.getRestaurants());
    setIsAddOpen(false);
    showToast(`Added restaurant "${name}"!`, "success");

    setName("");
    setLocation("");
    setCuisine("");
  };

  const columns: Column<Restaurant>[] = [
    {
      header: "Restaurant & Cuisine",
      accessor: (r) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold flex-shrink-0">
            <Utensils className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-navy-950 block">{r.name}</span>
            <span className="text-[10px] text-slate-500 font-medium">{r.cuisine}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Location & Phone",
      accessor: (r) => (
        <div className="text-xs">
          <span className="font-bold text-slate-800 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-slate-400" />
            {r.location}
          </span>
          <span className="text-[10px] text-slate-500">{r.phone || "—"}</span>
        </div>
      ),
    },
    {
      header: "Meal Rates (USD)",
      accessor: (r) => (
        <div className="text-xs font-mono font-bold">
          <span className="text-navy-950 block">${r.rates.adult_rate} / Adult</span>
          <span className="text-[10px] text-slate-500 font-normal">
            ${r.rates.child_rate} / Child (Buffet Basis)
          </span>
        </div>
      ),
    },
    {
      header: "Status",
      accessor: (r) => (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Contract Active
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-950 font-display tracking-tight">
            Tour Restaurants & Dining Partners
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Maintain authorized tourist buffet stops, specialty seafood dining, and meal rates.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-navy-950 hover:bg-brand-600 text-white text-xs font-bold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Restaurant</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={restaurants}
        searchPlaceholder="Search restaurant name, location, or cuisine..."
      />

      {/* Add Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Restaurant Partner"
        subtitle="Register dining stop and contract buffet pricing"
      >
        <form onSubmit={handleAddRestaurant} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Restaurant Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Oak Ray Regency Kandy"
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Location / City *</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Kandy / Dambulla"
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Cuisine Type</label>
              <input
                type="text"
                value={cuisine}
                onChange={(e) => setCuisine(e.target.value)}
                placeholder="e.g. Traditional Rice & Curry Buffet"
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone / WhatsApp</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+94 81 223 4455"
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Adult Buffet Rate (USD)</label>
              <input
                type="number"
                value={adultRate}
                onChange={(e) => setAdultRate(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Child Buffet Rate (USD)</label>
              <input
                type="number"
                value={childRate}
                onChange={(e) => setChildRate(Number(e.target.value))}
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
              Save Restaurant
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
