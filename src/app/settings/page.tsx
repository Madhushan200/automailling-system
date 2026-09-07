"use client";

import React, { useState, useEffect } from "react";
import { crmStore } from "@/lib/store";
import { CompanySettings } from "@/lib/types";
import { useToast } from "@/components/ui/Toast";
import {
  Settings,
  Building2,
  Mail,
  Shield,
  Send,
  Loader2,
  Save,
  CheckCircle2,
  DollarSign,
  Globe,
  Sparkles,
  Phone,
} from "lucide-react";

export default function SettingsPage() {
  const { showToast } = useToast();
  const [settings, setSettings] = useState<CompanySettings>(crmStore.getSettings());
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [testEmailRecipient, setTestEmailRecipient] = useState("");

  useEffect(() => {
    const s = crmStore.getSettings();
    setSettings(s);
    setTestEmailRecipient(s.email || "reservations@dodozleisure.com");
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    crmStore.saveSettings(settings);
    showToast("Successfully saved Company & SMTP Settings!", "success");
  };

  const handleTestSmtpConnection = async () => {
    if (!testEmailRecipient) {
      showToast("Please enter a test recipient email", "warning");
      return;
    }

    setTestingSmtp(true);
    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: testEmailRecipient,
          subject: "Hostinger SMTP Test — Dodoz Leisure CRM",
          text: `Ayubowan!\n\nThis confirms that your Hostinger SMTP server connection (${settings.smtp_host}:${settings.smtp_port}) is fully operational and authenticated for live PDF voucher dispatch.\n\nWarm regards,\nDodoz Leisure Technical Team`,
          customSettings: settings,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        showToast(`SMTP Success! Test email dispatched to ${testEmailRecipient}`, "success");
      } else {
        throw new Error(json.error || "SMTP authentication failed");
      }
    } catch (err: any) {
      console.error(err);
      showToast(`SMTP Connection Failed: ${err.message}`, "error");
    } finally {
      setTestingSmtp(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-navy-950 font-display tracking-tight">
          Agency White-Label & Hostinger SMTP Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Customize agency branding, voucher legal clauses, live currency exchange rates, and email SMTP delivery credentials.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* White Label Profile */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-soft space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Building2 className="w-5 h-5 text-brand-600" />
            <h3 className="text-base font-bold text-navy-950 font-display">Agency Branding & Details</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Company / Agency Name</label>
              <input
                type="text"
                value={settings.company_name}
                onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Official Website</label>
              <input
                type="text"
                value={settings.website}
                onChange={(e) => setSettings({ ...settings, website: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Reservations Desk Email</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Hotline & WhatsApp Mobile</label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Office Address</label>
            <input
              type="text"
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Currency Rates Manager */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-soft space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold text-navy-950 font-display">Live Multi-Currency Exchange Rates</h3>
            </div>
            <span className="text-xs text-slate-500 font-mono">Base Currency: USD ($1.00)</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(settings.currencies || {}).map(([curr, rate]) => (
              <div key={curr} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase">{curr} Rate</span>
                <div className="flex items-center gap-1 font-mono font-bold text-navy-950 text-sm">
                  <span>1 USD =</span>
                  <input
                    type="number"
                    step="0.01"
                    value={rate}
                    onChange={(e) => {
                      const newCurr = { ...settings.currencies, [curr]: Number(e.target.value) };
                      setSettings({ ...settings, currencies: newCurr });
                    }}
                    className="w-20 px-1.5 py-0.5 bg-white border border-slate-300 rounded text-xs text-slate-900"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hostinger SMTP Configuration */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-soft space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <Mail className="w-5 h-5 text-brand-600" />
              <div>
                <h3 className="text-base font-bold text-navy-950 font-display">Hostinger SMTP Delivery Server</h3>
                <p className="text-[11px] text-slate-500">Secure server-side Nodemailer email dispatch</p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Hostinger Compatible
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">SMTP Host Server</label>
              <input
                type="text"
                value={settings.smtp_host}
                onChange={(e) => setSettings({ ...settings, smtp_host: e.target.value })}
                placeholder="smtp.hostinger.com"
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">SMTP Port</label>
              <input
                type="number"
                value={settings.smtp_port}
                onChange={(e) => setSettings({ ...settings, smtp_port: Number(e.target.value) })}
                placeholder="465"
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">SMTP User / Email</label>
              <input
                type="text"
                value={settings.smtp_user}
                onChange={(e) => setSettings({ ...settings, smtp_user: e.target.value })}
                placeholder="reservations@dodozleisure.com"
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">SMTP App Password</label>
              <input
                type="password"
                value={settings.smtp_pass}
                onChange={(e) => setSettings({ ...settings, smtp_pass: e.target.value })}
                placeholder="••••••••••••••••"
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Sender Display Name</label>
              <input
                type="text"
                value={settings.sender_name}
                onChange={(e) => setSettings({ ...settings, sender_name: e.target.value })}
                placeholder="Dodoz Leisure Reservations"
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Sender From Email</label>
              <input
                type="email"
                value={settings.sender_email}
                onChange={(e) => setSettings({ ...settings, sender_email: e.target.value })}
                placeholder="reservations@dodozleisure.com"
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Test SMTP Connection Bar */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex-1 max-w-sm">
              <label className="block font-bold text-slate-700 mb-1 text-[11px]">Test Recipient Email:</label>
              <input
                type="email"
                value={testEmailRecipient}
                onChange={(e) => setTestEmailRecipient(e.target.value)}
                placeholder="test@youragency.com"
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <button
              type="button"
              onClick={handleTestSmtpConnection}
              disabled={testingSmtp}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 font-bold text-xs transition-colors disabled:opacity-50"
            >
              {testingSmtp ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>Test Hostinger SMTP Connection</span>
            </button>
          </div>
        </div>

        {/* Voucher Legal Clauses */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-soft space-y-4">
          <h3 className="text-base font-bold text-navy-950 font-display">PDF Voucher Terms & Footer Notes</h3>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Default Footer Note</label>
            <textarea
              rows={2}
              value={settings.footer_note}
              onChange={(e) => setSettings({ ...settings, footer_note: e.target.value })}
              className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 font-sans"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">General Terms & Guarantee Clause</label>
            <textarea
              rows={2}
              value={settings.terms}
              onChange={(e) => setSettings({ ...settings, terms: e.target.value })}
              className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 font-sans"
            />
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-navy-950 hover:bg-brand-600 text-white text-xs font-bold shadow-soft transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save All Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
}
