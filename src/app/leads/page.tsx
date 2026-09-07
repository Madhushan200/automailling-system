"use client";

import React, { useState, useEffect } from "react";
import { crmStore } from "@/lib/store";
import { Lead, Itinerary } from "@/lib/types";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  Inbox,
  Folder,
  FolderOpen,
  Send,
  Plus,
  Search,
  CheckSquare,
  Square,
  MessageSquare,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Compass,
  Building2,
  Users,
} from "lucide-react";

export default function LeadsPage() {
  const { showToast } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Batch Selection
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [isBatchItineraryOpen, setIsBatchItineraryOpen] = useState(false);
  const [targetItineraryId, setTargetItineraryId] = useState<string>("");

  // Detail Modal
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  useEffect(() => {
    setLeads(crmStore.getLeads());
    setItineraries(crmStore.getItineraries());
  }, []);

  const folders = [
    "All",
    "Active Requests",
    "High Priority VIP",
    "Honeymoon Inquiries",
    "Corporate Groups",
    "Filed / Resolved",
  ];

  const statuses = ["All", "New", "Contacted", "Quotation Sent", "Negotiation", "Confirmed", "Lost"];

  // Filter Leads
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.lead_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.destination.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatus === "All" || lead.status === selectedStatus;
    const matchesFolder = selectedFolder === "All" || (lead.folder || "Active Requests") === selectedFolder;

    return matchesSearch && matchesStatus && matchesFolder;
  });

  const toggleSelectLead = (id: string) => {
    setSelectedLeadIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const toggleSelectAll = () => {
    if (selectedLeadIds.length === filteredLeads.length) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(filteredLeads.map((l) => l.id));
    }
  };

  const handleBatchAllocateItinerary = () => {
    if (!targetItineraryId) {
      showToast("Please select an itinerary to allocate", "warning");
      return;
    }

    const itObj = itineraries.find((i) => i.id === targetItineraryId);
    const updated = leads.map((l) => {
      if (selectedLeadIds.includes(l.id)) {
        return {
          ...l,
          allocated_itinerary_id: targetItineraryId,
          allocated_itinerary_title: itObj?.title,
          allocated_route_km: itObj?.route_km,
        };
      }
      return l;
    });

    setLeads(updated);
    crmStore.saveLeads(updated);
    setIsBatchItineraryOpen(false);
    setSelectedLeadIds([]);
    showToast(`Allocated "${itObj?.title}" to ${selectedLeadIds.length} inquiries!`, "success");
  };

  const handleBatchMoveFolder = (folderName: string) => {
    const updated = leads.map((l) => {
      if (selectedLeadIds.includes(l.id)) {
        return { ...l, folder: folderName };
      }
      return l;
    });

    setLeads(updated);
    crmStore.saveLeads(updated);
    setSelectedLeadIds([]);
    showToast(`Moved ${selectedLeadIds.length} inquiries to "${folderName}"!`, "success");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-950 font-display tracking-tight">
            Customer Inquiries & Multi-Lead Filing
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Batch allocate master tour itineraries, file leads into workflow folders, and track conversion statuses.
          </p>
        </div>
      </div>

      {/* Folder Tabs Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        {folders.map((f) => {
          const count =
            f === "All"
              ? leads.length
              : leads.filter((l) => (l.folder || "Active Requests") === f).length;
          const isActive = selectedFolder === f;

          return (
            <button
              key={f}
              onClick={() => setSelectedFolder(f)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-navy-950 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
              }`}
            >
              {isActive ? <FolderOpen className="w-3.5 h-3.5 text-brand-400" /> : <Folder className="w-3.5 h-3.5 text-slate-400" />}
              <span>{f}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Batch Action Toolbar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search inquiries by client, destination, or country..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Batch Actions when Selected */}
        {selectedLeadIds.length > 0 ? (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-navy-950 px-2">
              {selectedLeadIds.length} Selected
            </span>

            <button
              type="button"
              onClick={() => setIsBatchItineraryOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm transition-colors"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Allocate Itinerary</span>
            </button>

            <select
              onChange={(e) => e.target.value && handleBatchMoveFolder(e.target.value)}
              defaultValue=""
              className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-brand-500"
            >
              <option value="" disabled>Move to Folder...</option>
              {folders.filter((f) => f !== "All").map((f) => (
                <option key={f} value={f}>
                  📁 {f}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Filter Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-brand-500"
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Inquiries Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-4 w-10 text-center">
                  <button onClick={toggleSelectAll} className="text-slate-400 hover:text-navy-950">
                    {selectedLeadIds.length > 0 && selectedLeadIds.length === filteredLeads.length ? (
                      <CheckSquare className="w-4 h-4 text-brand-600" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="p-4">Inquiry / Guest</th>
                <th className="p-4">Destination & Dates</th>
                <th className="p-4">Allocated Itinerary</th>
                <th className="p-4">Folder</th>
                <th className="p-4">Budget</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLeads.map((lead) => {
                const isSelected = selectedLeadIds.includes(lead.id);

                return (
                  <tr key={lead.id} className={`hover:bg-slate-50/60 ${isSelected ? "bg-brand-50/40" : ""}`}>
                    <td className="p-4 text-center">
                      <button onClick={() => toggleSelectLead(lead.id)} className="text-slate-400 hover:text-navy-950">
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-brand-600" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>

                    <td className="p-4">
                      <div className="font-bold text-navy-950">{lead.client_name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {lead.lead_number} • {lead.country} ({lead.adults_count}A {lead.children_count ? `+ ${lead.children_count}C` : ""})
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="font-semibold text-slate-900">{lead.destination}</div>
                      <div className="text-[10px] text-slate-500">
                        {lead.travel_start_date} → {lead.travel_end_date} ({lead.days_count || 10} Days)
                      </div>
                    </td>

                    <td className="p-4">
                      {lead.allocated_itinerary_title ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-brand-700">
                          <Compass className="w-3.5 h-3.5 text-brand-500" />
                          {lead.allocated_itinerary_title}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">No Itinerary Allocated</span>
                      )}
                    </td>

                    <td className="p-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        📁 {lead.folder || "Active Requests"}
                      </span>
                    </td>

                    <td className="p-4 font-mono font-bold text-navy-950">
                      ${lead.budget?.toLocaleString()} {lead.currency}
                    </td>

                    <td className="p-4">
                      <StatusBadge status={lead.status} size="sm" />
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                          title="Chat on WhatsApp"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => setSelectedLead(lead)}
                          className="px-3 py-1 font-semibold text-xs rounded-lg bg-navy-950 hover:bg-brand-600 text-white transition-colors"
                        >
                          Workspace
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Batch Allocate Modal */}
      {isBatchItineraryOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsBatchItineraryOpen(false)}
          title={`Allocate Master Itinerary to ${selectedLeadIds.length} Inquiries`}
          subtitle="Assign standard day-by-day tour program and calculate baseline KMs"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Select Master Itinerary</label>
              <select
                value={targetItineraryId}
                onChange={(e) => setTargetItineraryId(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
              >
                <option value="">-- Choose Itinerary Program --</option>
                {itineraries.map((itin) => (
                  <option key={itin.id} value={itin.id}>
                    {itin.title} ({itin.duration_days} Days, {itin.route_km} KM)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsBatchItineraryOpen(false)}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBatchAllocateItinerary}
                className="px-5 py-2 rounded-xl bg-navy-950 hover:bg-brand-600 text-white text-xs font-bold shadow-sm"
              >
                Apply Itinerary Allocation
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Lead Workspace Modal */}
      {selectedLead && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedLead(null)}
          title={`Inquiry Workspace — ${selectedLead.client_name}`}
          subtitle={`Lead Ref: ${selectedLead.lead_number} | Country: ${selectedLead.country}`}
          maxWidth="3xl"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Travel Dates</span>
                <strong className="text-slate-900">{selectedLead.travel_start_date} → {selectedLead.travel_end_date}</strong>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Pax Count</span>
                <strong className="text-slate-900">{selectedLead.adults_count} Adults, {selectedLead.children_count || 0} Children</strong>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Budget</span>
                <strong className="text-emerald-700 font-mono">${selectedLead.budget?.toLocaleString()} {selectedLead.currency}</strong>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Assigned Sales</span>
                <strong className="text-slate-900">{selectedLead.assigned_to || "Shanika Perera"}</strong>
              </div>
            </div>

            <div>
              <span className="font-bold text-slate-700 block mb-1">Requested Excursions & Activities</span>
              <p className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
                {selectedLead.activities_requested || "Standard Sigiriya, Kandy, Yala Safari, Beach Stay"}
              </p>
            </div>

            <div>
              <span className="font-bold text-slate-700 block mb-1">Special Preferences / Notes</span>
              <p className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
                {selectedLead.notes || "VIP treatment, interconnecting rooms requested."}
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedLead(null)}
                className="px-5 py-2 rounded-xl bg-navy-950 text-white font-bold text-xs hover:bg-brand-600"
              >
                Close Workspace
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
