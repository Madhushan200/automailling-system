"use client";

import React, { useState, useEffect } from "react";
import { crmStore } from "@/lib/store";
import { TourExpense } from "@/lib/types";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import {
  DollarSign,
  Plus,
  Fuel,
  Receipt,
  Car,
  Users,
} from "lucide-react";

export default function TourExpensesPage() {
  const { showToast } = useToast();
  const [expenses, setExpenses] = useState<TourExpense[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form State
  const [tourNumber, setTourNumber] = useState("DDL-2026-0001");
  const [category, setCategory] = useState<any>("Toll");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState(30);

  useEffect(() => {
    setExpenses(crmStore.getExpenses());
  }, []);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) {
      showToast("Please enter expense description and amount", "warning");
      return;
    }

    const newExpense: TourExpense = {
      id: `exp-${Date.now()}`,
      tour_id: "tour-101",
      tour_number: tourNumber,
      category,
      description,
      amount: Number(amount),
      currency: "USD",
      expense_date: new Date().toISOString().split("T")[0],
      recorded_by: "Operations Officer",
    };

    crmStore.addExpense(newExpense);
    setExpenses(crmStore.getExpenses());
    setIsAddOpen(false);
    showToast(`Recorded expense of $${amount} for ${tourNumber}!`, "success");

    setDescription("");
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  const columns: Column<TourExpense>[] = [
    {
      header: "Expense Description",
      accessor: (e) => (
        <div>
          <strong className="text-navy-950 block text-xs">{e.description}</strong>
          <span className="text-[10px] text-brand-600 font-mono">{e.tour_number}</span>
        </div>
      ),
    },
    {
      header: "Category",
      accessor: (e) => (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
          {e.category}
        </span>
      ),
    },
    {
      header: "Date",
      accessor: (e) => (
        <div className="text-xs text-slate-700 font-medium">
          {e.expense_date}
        </div>
      ),
    },
    {
      header: "Amount (USD)",
      accessor: (e) => (
        <div className="text-sm font-mono font-bold text-rose-700">
          -${e.amount.toFixed(2)} {e.currency}
        </div>
      ),
    },
    {
      header: "Recorded By",
      accessor: (e) => (
        <span className="text-xs text-slate-600 font-medium">
          {e.recorded_by || "Operations"}
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
            Tour Operations Direct Expenses
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Log on-ground direct tour disbursements such as highway tolls, parking receipts, driver night allowances, and entrance permits.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-navy-950 hover:bg-brand-600 text-white text-xs font-bold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Record Expense</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={expenses}
        searchPlaceholder="Search expense description, category, or tour code..."
      />

      {/* Add Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Record Direct Tour Expense"
        subtitle="Log operational disbursement against tour budget"
      >
        <form onSubmit={handleAddExpense} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tour Reference Code</label>
              <input
                type="text"
                required
                value={tourNumber}
                onChange={(e) => setTourNumber(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Expense Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
              >
                <option value="Toll">Highway Tolls</option>
                <option value="Parking">Parking Charges</option>
                <option value="Fuel">Fuel Surcharge</option>
                <option value="Driver Bata">Driver Night Bata</option>
                <option value="Guide Bata">Guide Service Allowance</option>
                <option value="Meals">Guest Welcome / Hospitality</option>
                <option value="Miscellaneous">Miscellaneous</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Description *</label>
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Expressway Toll Receipts (Negombo to Galle)"
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Amount (USD) *</label>
              <input
                type="number"
                required
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
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
              Save Expense
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
