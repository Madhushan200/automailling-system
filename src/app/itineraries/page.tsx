"use client";

import React, { useState, useEffect } from "react";
import { crmStore } from "@/lib/store";
import { TourTemplate } from "@/lib/types";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import {
  BookOpen,
  Plus,
  Compass,
  MapPin,
  Calendar,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export default function MasterItinerariesPage() {
  const { showToast } = useToast();
  const [templates, setTemplates] = useState<TourTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<TourTemplate | null>(null);

  useEffect(() => {
    setTemplates(crmStore.getTourTemplates());
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-950 font-display tracking-tight">
            Master Tour Itineraries & Templates
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Standardized day-by-day tour programs, verified road routes, and attraction sequences for rapid proposal generation.
          </p>
        </div>

        <button
          type="button"
          onClick={() => showToast("Tour template creator launched!", "info")}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-navy-950 hover:bg-brand-600 text-white text-xs font-bold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Itinerary Template</span>
        </button>
      </div>

      {/* Itinerary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.map((tmpl) => (
          <div
            key={tmpl.id}
            className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-soft space-y-4 hover:border-brand-300 transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-50 text-brand-700 border border-brand-200">
                {tmpl.code}
              </span>
              <span className="text-xs font-mono font-bold text-slate-500">
                {tmpl.duration_days} Days / {tmpl.duration_nights} Nights (~{tmpl.estimated_route_km} KM)
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-navy-950 font-display group-hover:text-brand-600 transition-colors">
                {tmpl.title}
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {tmpl.summary}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs flex items-center justify-between">
              <span className="text-slate-600">Travel Style: <strong className="text-slate-900">{tmpl.travel_style}</strong></span>
              <span className="text-brand-600 font-semibold">{tmpl.category}</span>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedTemplate(tmpl)}
                className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-navy-950 hover:bg-brand-600 text-white text-xs font-bold transition-colors"
              >
                <span>View Day-by-Day Plan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Template Detail Modal */}
      {selectedTemplate && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedTemplate(null)}
          title={selectedTemplate.title}
          subtitle={`Program Code: ${selectedTemplate.code} | Duration: ${selectedTemplate.duration_days} Days`}
          maxWidth="3xl"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
              {selectedTemplate.summary}
            </p>

            <div className="p-3 bg-brand-50 border border-brand-200 rounded-xl text-brand-950 font-medium">
              💡 When generating a new tour, you can select this template in the Tour Workspace to auto-populate the route, hotels, and costing items with one click.
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedTemplate(null)}
                className="px-5 py-2 rounded-xl bg-navy-950 text-white font-bold text-xs hover:bg-brand-600"
              >
                Close Program
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
