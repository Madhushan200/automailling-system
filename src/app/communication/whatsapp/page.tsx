"use client";

import React, { useState, useEffect } from "react";
import { crmStore } from "@/lib/store";
import { WhatsAppLog } from "@/lib/types";
import { useToast } from "@/components/ui/Toast";
import {
  MessageSquare,
  Send,
  Building2,
  Car,
  Sparkles,
  Users,
  Copy,
  Check,
  Phone,
} from "lucide-react";

export default function WhatsAppDeskPage() {
  const { showToast } = useToast();
  const [logs, setLogs] = useState<WhatsAppLog[]>([]);
  const [recipientType, setRecipientType] = useState<"Hotel" | "Transport" | "Activity" | "Client">("Hotel");
  const [recipientName, setRecipientName] = useState("Heritance Kandalama");
  const [recipientPhone, setRecipientPhone] = useState("+94718890123");
  const [tourNumber, setTourNumber] = useState("DDL-2026-0001");
  const [clientName, setClientName] = useState("Dr. Jonathan Hayes & Family");
  const [dates, setDates] = useState("2026-10-16 to 2026-10-18");
  const [rooms, setRooms] = useState("1 DBL (Superior Lake View, HB)");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setLogs(crmStore.getWhatsAppLogs());
    generateTemplateMessage("Hotel");
  }, []);

  const generateTemplateMessage = (type: string) => {
    if (type === "Hotel") {
      setMessage(
        `🌴 *DODOZ LEISURE — HOTEL AVAILABILITY & RATES REQUEST*\n\nDear Reservations Team at *${recipientName}*,\n\nPlease confirm availability and contract rates for:\n\n• *Tour Reference:* ${tourNumber}\n• *Guest Name:* ${clientName}\n• *Dates:* ${dates}\n• *Rooms & Meal Basis:* ${rooms}\n\nKindly confirm availability at your earliest convenience.\n\nWarm regards,\n*Dodoz Leisure Reservations Desk*\nHotline: +94 11 234 5678`
      );
    } else if (type === "Transport") {
      setMessage(
        `🌴 *DODOZ LEISURE — TRANSPORT CONFIRMATION REQUEST*\n\nDear *${recipientName}*,\n\nPlease confirm transport allocation for:\n\n• *Tour Reference:* ${tourNumber}\n• *Travel Dates:* ${dates}\n• *Route:* Negombo → Sigiriya → Kandy → Nuwara Eliya → Yala → Galle\n• *Vehicle Required:* Toyota HiAce Luxury High-Roof Van\n• *Pax:* 3 Guests\n\nPlease confirm assigned chauffeur and vehicle details.\n\nThank you,\n*Dodoz Leisure Operations*`
      );
    } else if (type === "Activity") {
      setMessage(
        `🌴 *DODOZ LEISURE — ACTIVITY BOOKING REQUEST*\n\nDear *${recipientName}*,\n\nPlease confirm safari jeep booking for:\n\n• *Tour Reference:* ${tourNumber}\n• *Guest Party:* ${clientName} (3 Pax)\n• *Excursion Date:* 2026-10-17 at 02:30 PM\n• *Activity:* Minneriya National Park Wild Elephant Safari\n\nKindly confirm booking.\n\nWarm regards,\n*Dodoz Leisure Field Operations*`
      );
    } else {
      setMessage(
        `🌴 *DODOZ LEISURE — YOUR CEYLON ITINERARY & QUOTATION*\n\nDear *${clientName}*,\n\nAyubowan! We are pleased to inform you that your customized Sri Lanka travel itinerary and official quotation for *${tourNumber}* are ready.\n\nPlease review your quotation and let us know if you would like any customizations.\n\nWarm regards,\n*Dodoz Leisure Team*`
      );
    }
  };

  const handleTypeChange = (type: any) => {
    setRecipientType(type);
    generateTemplateMessage(type);
  };

  const handleLaunchWhatsApp = () => {
    const cleanPhone = recipientPhone.replace(/[^0-9]/g, "");
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

    const newLog: WhatsAppLog = {
      id: `wa-${Date.now()}`,
      phone: recipientPhone,
      recipient_name: recipientName,
      recipient_type: recipientType === "Hotel" ? "Supplier" : recipientType === "Client" ? "Client" : "Supplier",
      tour_number: tourNumber,
      message_preview: message.slice(0, 80) + "...",
      status: "Sent",
      sent_at: new Date().toISOString(),
    };

    crmStore.addWhatsAppLog(newLog);
    setLogs(crmStore.getWhatsAppLogs());
    showToast(`Opening WhatsApp chat for ${recipientName}...`, "success");
    window.open(waUrl, "_blank");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    showToast("Copied WhatsApp message to clipboard!", "success");
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-navy-950 font-display tracking-tight">
          WhatsApp Supplier & Client Dispatch Desk
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Compose and dispatch dynamic WhatsApp messages to hotel reservation desks, fleet drivers, safari operators, and travelers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Message Generator */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-soft space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-navy-950 font-display">Message Composer</h3>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                {(["Hotel", "Transport", "Activity", "Client"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => handleTypeChange(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      recipientType === t ? "bg-navy-950 text-white shadow-xs" : "text-slate-600 hover:text-navy-950"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Recipient Name</label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => {
                    setRecipientName(e.target.value);
                    generateTemplateMessage(recipientType);
                  }}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Recipient WhatsApp Mobile</label>
                <input
                  type="text"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp Formatted Message</label>
              <textarea
                rows={10}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-4 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 font-mono bg-slate-50"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? "Copied!" : "Copy Text"}</span>
              </button>
              <button
                type="button"
                onClick={handleLaunchWhatsApp}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Open in WhatsApp (wa.me)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Sent Logs */}
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-soft space-y-4">
            <h3 className="text-base font-bold text-navy-950 font-display">Recent WhatsApp Dispatches</h3>
            <div className="space-y-3">
              {logs.map((log) => (
                <div key={log.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <strong className="text-navy-950 font-bold">{log.recipient_name}</strong>
                    <span className="text-[10px] text-emerald-700 font-mono font-bold">✓ Sent</span>
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-2">{log.message_preview}</p>
                  <span className="text-[9px] text-slate-400 block font-mono">
                    {new Date(log.sent_at).toLocaleTimeString()} • {log.phone}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
