"use client";

import React, { useState, useEffect } from "react";
import { crmStore } from "@/lib/store";
import { TransportProvider, Vehicle } from "@/lib/types";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import {
  Car,
  Plus,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Users,
  Briefcase,
  Sparkles,
} from "lucide-react";

export default function TransportSuppliersPage() {
  const { showToast } = useToast();
  const [providers, setProviders] = useState<TransportProvider[]>([]);
  const [isAddProviderOpen, setIsAddProviderOpen] = useState(false);
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [selectedProviderId, setSelectedProviderId] = useState<string>("");

  // Provider Form State
  const [companyName, setCompanyName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [perKmRate, setPerKmRate] = useState(0.85);

  // Vehicle Form State
  const [vehicleName, setVehicleName] = useState("");
  const [vehicleClass, setVehicleClass] = useState<any>("Van");
  const [regNumber, setRegNumber] = useState("");
  const [seats, setSeats] = useState(7);
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");

  useEffect(() => {
    setProviders(crmStore.getTransportProviders());
  }, []);

  const handleAddProvider = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !phone) {
      showToast("Please enter transport company name and contact phone", "warning");
      return;
    }

    const newProvider: TransportProvider = {
      id: `tp-${Date.now()}`,
      company_name: companyName,
      contact_person: contactPerson || "Fleet Operations Manager",
      phone,
      whatsapp: phone,
      email: email || "dispatch@transport.lk",
      address: "Sri Lanka",
      currency: "USD",
      payment_terms: "Weekly Dispatch Statement",
      vehicles: [],
      rates: {
        rate_type: "Per KM",
        base_rate: 85,
        per_km: perKmRate,
        per_day: 85,
        extra_km_rate: 0.55,
        driver_daily_allowance: 20,
        night_surcharge: 15,
      },
      active: true,
    };

    crmStore.addTransportProvider(newProvider);
    setProviders(crmStore.getTransportProviders());
    setIsAddProviderOpen(false);
    showToast(`Added transport provider "${companyName}"!`, "success");

    setCompanyName("");
    setContactPerson("");
    setPhone("");
    setEmail("");
  };

  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleName || !regNumber) {
      showToast("Please enter vehicle model and registration plate number", "warning");
      return;
    }

    const newVehicle: Vehicle = {
      id: `v-${Date.now()}`,
      transport_provider_id: selectedProviderId || providers[0]?.id || "tp-101",
      vehicle_name: vehicleName,
      vehicle_class: vehicleClass,
      registration_number: regNumber,
      seats: Number(seats),
      luggage_capacity: Math.max(2, Number(seats) - 2),
      air_conditioned: true,
      assigned_driver_name: driverName,
      assigned_driver_phone: driverPhone,
      per_km_rate: 0.85,
      per_day_rate: 85,
    };

    const updated = providers.map((p) =>
      p.id === (selectedProviderId || providers[0]?.id)
        ? { ...p, vehicles: [...p.vehicles, newVehicle] }
        : p
    );

    crmStore.saveTransportProviders(updated);
    setProviders(updated);
    setIsAddVehicleOpen(false);
    showToast(`Registered vehicle ${regNumber} to fleet!`, "success");

    setVehicleName("");
    setRegNumber("");
    setDriverName("");
    setDriverPhone("");
  };

  const allVehicles: (Vehicle & { provider_name: string })[] = providers.flatMap((p) =>
    p.vehicles.map((v) => ({ ...v, provider_name: p.company_name }))
  );

  const columns: Column<Vehicle & { provider_name: string }>[] = [
    {
      header: "Vehicle & Class",
      accessor: (v) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-navy-100 text-navy-950 flex items-center justify-center font-bold">
            <Car className="w-4 h-4 text-brand-600" />
          </div>
          <div>
            <span className="font-bold text-navy-950 block">{v.vehicle_name}</span>
            <span className="text-[10px] text-slate-500 font-medium">
              Class: {v.vehicle_class} • {v.seats} Seats ({v.luggage_capacity} Bags)
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Plate Number",
      accessor: (v) => (
        <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-900 font-mono font-bold text-xs">
          {v.registration_number}
        </span>
      ),
    },
    {
      header: "Assigned Driver",
      accessor: (v) => (
        <div className="text-xs">
          <span className="font-bold text-slate-900 block">{v.assigned_driver_name || "Unassigned"}</span>
          <span className="text-[10px] text-slate-500 font-mono">{v.assigned_driver_phone || "—"}</span>
        </div>
      ),
    },
    {
      header: "Rate Model",
      accessor: (v) => (
        <div className="text-xs font-mono font-bold text-brand-700">
          ${v.per_km_rate || 0.85} / KM
          <span className="text-[10px] text-slate-400 block font-normal font-sans">
            or ${v.per_day_rate || 85} / Day
          </span>
        </div>
      ),
    },
    {
      header: "Fleet Provider",
      accessor: (v) => (
        <div className="text-xs font-medium text-slate-700">
          {v.provider_name}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-950 font-display tracking-tight">
            Transport Suppliers & Vehicle Fleets
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage commercial tourist transport providers, vehicle classes (Sedan, Van, SUV, Coach), per-KM rate cards, and chauffeur drivers.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsAddVehicleOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs font-bold hover:bg-slate-50 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Vehicle</span>
          </button>
          <button
            type="button"
            onClick={() => setIsAddProviderOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-navy-950 hover:bg-brand-600 text-white text-xs font-bold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Transport Provider</span>
          </button>
        </div>
      </div>

      {/* Transport Providers Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {providers.map((p) => (
          <div
            key={p.id}
            className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-soft space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-navy-950 text-sm">{p.company_name}</h3>
                  <p className="text-[10px] text-slate-500 font-medium">
                    Contact: {p.contact_person} • {p.phone}
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Active Provider
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-xs text-center">
              <div className="p-2 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Vehicles</span>
                <strong className="text-navy-950">{p.vehicles.length} Units</strong>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Per KM Base</span>
                <strong className="text-brand-600 font-mono">${p.rates?.per_km || 0.85}</strong>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Driver Bata</span>
                <strong className="text-emerald-700 font-mono">${p.rates?.driver_daily_allowance || 20}/Day</strong>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Fleet Vehicles Table */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-navy-950 font-display">
          Active Fleet Inventory ({allVehicles.length} Registered Vehicles)
        </h3>
        <DataTable
          columns={columns}
          data={allVehicles}
          searchPlaceholder="Search vehicle model, plate number, driver, or fleet provider..."
        />
      </div>

      {/* Add Provider Modal */}
      <Modal
        isOpen={isAddProviderOpen}
        onClose={() => setIsAddProviderOpen(false)}
        title="Add Transport Provider"
        subtitle="Register commercial fleet partner and baseline KM rate contract"
      >
        <form onSubmit={handleAddProvider} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Company / Fleet Name *</label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Ceylon Express Transport"
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Contact Person</label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="e.g. Mr. Chaminda Silva"
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Dispatch Phone *</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+94 77 123 4567"
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Dispatch Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="dispatch@ceylontransport.com"
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Standard KM Rate (USD)</label>
              <input
                type="number"
                step="0.05"
                value={perKmRate}
                onChange={(e) => setPerKmRate(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 font-mono"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddProviderOpen(false)}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-navy-950 hover:bg-brand-600 text-white text-xs font-bold shadow-sm"
            >
              Save Transport Provider
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Vehicle Modal */}
      <Modal
        isOpen={isAddVehicleOpen}
        onClose={() => setIsAddVehicleOpen(false)}
        title="Register Vehicle to Fleet"
        subtitle="Add a passenger vehicle and assign tourist chauffeur"
      >
        <form onSubmit={handleAddVehicle} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Transport Provider</label>
              <select
                value={selectedProviderId}
                onChange={(e) => setSelectedProviderId(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
              >
                {providers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.company_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Vehicle Model *</label>
              <input
                type="text"
                required
                value={vehicleName}
                onChange={(e) => setVehicleName(e.target.value)}
                placeholder="e.g. Toyota HiAce High-Roof Luxury Van"
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Vehicle Class</label>
              <select
                value={vehicleClass}
                onChange={(e) => setVehicleClass(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
              >
                <option value="Car">Car / Sedan (1-3 Pax)</option>
                <option value="Van">Van (4-7 Pax)</option>
                <option value="SUV">SUV (1-4 Pax)</option>
                <option value="Mini Bus">Mini Bus (8-18 Pax)</option>
                <option value="Coach">Large Coach (19-45 Pax)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Registration Number Plate *</label>
              <input
                type="text"
                required
                value={regNumber}
                onChange={(e) => setRegNumber(e.target.value)}
                placeholder="e.g. WP ND-8910"
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Chauffeur Name</label>
              <input
                type="text"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                placeholder="e.g. Gamini Wickremasinghe"
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Driver Phone</label>
              <input
                type="text"
                value={driverPhone}
                onChange={(e) => setDriverPhone(e.target.value)}
                placeholder="+94 77 234 5678"
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddVehicleOpen(false)}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-navy-950 hover:bg-brand-600 text-white text-xs font-bold shadow-sm"
            >
              Register Vehicle
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
