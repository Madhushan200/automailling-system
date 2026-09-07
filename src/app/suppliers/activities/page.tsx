"use client";

import React, { useState, useEffect } from "react";
import { crmStore } from "@/lib/store";
import { Activity } from "@/lib/types";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import {
  Sparkles,
  Plus,
  MapPin,
  Clock,
  DollarSign,
  Users,
  CheckCircle2,
  Compass,
} from "lucide-react";

export default function ActivitiesPage() {
  const { showToast } = useToast();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [providerName, setProviderName] = useState("");
  const [location, setLocation] = useState("");
  const [duration, setDuration] = useState("3 Hours");
  const [adultRate, setAdultRate] = useState(35);
  const [childRate, setChildRate] = useState(18);
  const [description, setDescription] = useState("");

  useEffect(() => {
    setActivities(crmStore.getActivities());
  }, []);

  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !location) {
      showToast("Please enter activity name and destination location", "warning");
      return;
    }

    const newActivity: Activity = {
      id: `act-${Date.now()}`,
      name,
      provider_name: providerName || "Local Excursion Operator",
      location,
      duration,
      adult_rate: Number(adultRate),
      child_rate: Number(childRate),
      currency: "USD",
      guide_included: true,
      transport_included: false,
      entrance_included: true,
      description,
      active: true,
    };

    crmStore.addActivity(newActivity);
    setActivities(crmStore.getActivities());
    setIsAddOpen(false);
    showToast(`Added activity "${name}"!`, "success");

    setName("");
    setLocation("");
    setDescription("");
  };

  const columns: Column<Activity>[] = [
    {
      header: "Excursion / Activity",
      accessor: (a) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold flex-shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-navy-950 block">{a.name}</span>
            <span className="text-[10px] text-slate-500 font-medium">
              Provider: {a.provider_name}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Location & Duration",
      accessor: (a) => (
        <div className="text-xs">
          <span className="font-bold text-slate-800 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-slate-400" />
            {a.location}
          </span>
          <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
            <Clock className="w-3 h-3 text-slate-400" />
            {a.duration}
          </span>
        </div>
      ),
    },
    {
      header: "Rates (USD)",
      accessor: (a) => (
        <div className="text-xs font-mono font-bold">
          <span className="text-navy-950 block">${a.adult_rate} / Adult</span>
          <span className="text-[10px] text-slate-500 font-normal">
            ${a.child_rate} / Child
          </span>
        </div>
      ),
    },
    {
      header: "Inclusions",
      accessor: (a) => (
        <div className="flex flex-wrap gap-1 text-[9px] font-bold">
          {a.entrance_included && (
            <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-200">
              Ticket Included
            </span>
          )}
          {a.guide_included && (
            <span className="px-1.5 py-0.5 bg-brand-50 text-brand-700 rounded border border-brand-200">
              Site Guide
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Status",
      accessor: (a) => (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-950 font-display tracking-tight">
            Activities, Safaris & Excursion Providers
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Maintain commercial attraction entrance fees, wildlife national park safari jeep operators, and cultural experiences.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-navy-950 hover:bg-brand-600 text-white text-xs font-bold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Activity</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={activities}
        searchPlaceholder="Search excursion name, location, or provider..."
      />

      {/* Add Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Activity / Excursion"
        subtitle="Register tourist attraction or wildlife safari provider"
      >
        <form onSubmit={handleAddActivity} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Activity Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Pidurangala Rock Sunrise Hike"
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Provider / Operator Name</label>
              <input
                type="text"
                value={providerName}
                onChange={(e) => setProviderName(e.target.value)}
                placeholder="e.g. Eco Safaris Sri Lanka"
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Destination / Location *</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Sigiriya / Habarana"
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Duration</label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 3.5 Hours"
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Adult Rate (USD) *</label>
              <input
                type="number"
                required
                value={adultRate}
                onChange={(e) => setAdultRate(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Child Rate (USD)</label>
              <input
                type="number"
                value={childRate}
                onChange={(e) => setChildRate(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 font-mono"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description / Highlights</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Private safari tracker included, best viewing times, cancellation rules..."
              className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
            />
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
              Save Activity
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
