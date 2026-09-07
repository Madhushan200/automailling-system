"use client";

import React, { useState, useEffect } from "react";
import { crmStore } from "@/lib/store";
import { CalendarEvent, Tour } from "@/lib/types";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Compass,
  Building2,
  Car,
  Sparkles,
  DollarSign,
} from "lucide-react";

export default function MasterOperationsCalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentMonth, setCurrentMonth] = useState("October 2026");

  useEffect(() => {
    setEvents(crmStore.getCalendarEvents());
  }, []);

  const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Mock Calendar Grid for October 2026 (Starts on Thursday Oct 1)
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);
  const leadingBlanks = Array.from({ length: 4 }, (_, i) => i); // Oct 2026 starts Thursday (index 4)

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-950 font-display tracking-tight">
            Master Tour Operations & Event Calendar
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track tour departure dates, hotel check-ins, safari permits, chauffeur assignments, and supplier payment deadlines.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-slate-200 shadow-soft">
          <button className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold font-display text-navy-950 px-3">
            {currentMonth}
          </span>
          <button className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-soft space-y-4">
        {/* Days Header */}
        <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100">
          {DAYS_OF_WEEK.map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-2">
          {leadingBlanks.map((b) => (
            <div key={`blank-${b}`} className="min-h-[100px] p-2 rounded-2xl bg-slate-50/40 border border-transparent" />
          ))}

          {daysInMonth.map((day) => {
            const dateStr = `2026-10-${String(day).padStart(2, "0")}`;
            const dayEvents = events.filter((e) => e.date === dateStr);

            return (
              <div
                key={day}
                className="min-h-[100px] p-2 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-brand-300 transition-all flex flex-col justify-between group"
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold font-mono text-navy-950">{day}</span>
                  {dayEvents.length > 0 && (
                    <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                  )}
                </div>

                {/* Events list */}
                <div className="space-y-1 mt-1">
                  {dayEvents.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-1.5 rounded-lg bg-navy-950 text-white text-[9px] font-semibold leading-tight truncate"
                      title={`${ev.title} — ${ev.hotel_or_location}`}
                    >
                      {ev.title}
                    </div>
                  ))}
                  {day === 15 && (
                    <div className="p-1 rounded bg-emerald-50 text-emerald-800 text-[8.5px] font-bold border border-emerald-200 truncate">
                      🛬 Hayes Arrival (QR668)
                    </div>
                  )}
                  {day === 16 && (
                    <div className="p-1 rounded bg-brand-50 text-brand-800 text-[8.5px] font-bold border border-brand-200 truncate">
                      🏨 Heritance Check-in
                    </div>
                  )}
                  {day === 17 && (
                    <div className="p-1 rounded bg-purple-50 text-purple-800 text-[8.5px] font-bold border border-purple-200 truncate">
                      🐘 Minneriya Safari
                    </div>
                  )}
                  {day === 22 && (
                    <div className="p-1 rounded bg-amber-50 text-amber-800 text-[8.5px] font-bold border border-amber-200 truncate">
                      🛫 Hayes Departure
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
