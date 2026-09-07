"use client";

import React from "react";
import Link from "next/link";
import { Booking } from "@/lib/types";
import { StatusBadge } from "../ui/StatusBadge";
import { CalendarCheck, ChevronRight, BedDouble, Calendar } from "lucide-react";

interface RecentBookingsTableProps {
  bookings: Booking[];
}

export function RecentBookingsTable({ bookings }: RecentBookingsTableProps) {
  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-soft space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-navy-950 font-display">Recent Hotel Bookings</h3>
          <p className="text-xs text-slate-500 mt-0.5">Upcoming VIP Tour Accommodations</p>
        </div>
        <Link
          href="/bookings"
          className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700 hover:underline"
        >
          <span>View All</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200/80 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="pb-3">Tour / Guest</th>
              <th className="pb-3">Hotel Property</th>
              <th className="pb-3 text-center">Stay Dates</th>
              <th className="pb-3 text-center">Rooms</th>
              <th className="pb-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {bookings.slice(0, 5).map((b) => (
              <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-3">
                  <span className="font-bold text-navy-950 block">{b.client_name}</span>
                  <span className="text-[10px] font-mono text-brand-600">{b.tour_number || b.booking_reference}</span>
                </td>
                <td className="py-3">
                  <span className="font-semibold text-slate-900 block">{b.hotel_name}</span>
                  <span className="text-[10px] text-slate-500">{b.room_type || "Deluxe"} ({b.meal_plan})</span>
                </td>
                <td className="py-3 text-center font-medium text-slate-600">
                  {b.check_in_date} → {b.check_out_date}
                </td>
                <td className="py-3 text-center font-bold text-slate-800">
                  {(b.dbl_rooms || 0) + (b.sgl_rooms || 0) + (b.tpl_rooms || 0) || 1} R
                </td>
                <td className="py-3 text-right">
                  <StatusBadge status={b.status} size="sm" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
