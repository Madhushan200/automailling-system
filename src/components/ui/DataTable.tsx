"use client";

import React, { useState } from "react";
import { Search, ChevronLeft, ChevronRight, Inbox, Loader2 } from "lucide-react";

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  accessor?: (item: T) => React.ReactNode;
  cell?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchKey?: keyof T | ((item: T) => string);
  searchPlaceholder?: string;
  itemsPerPage?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyMessage?: string;
  headerAction?: React.ReactNode;
  isLoading?: boolean;
}

export function DataTable<T extends { id?: string }>({
  columns,
  data,
  searchKey,
  searchPlaceholder = "Search records...",
  itemsPerPage = 10,
  emptyTitle = "No records found",
  emptyDescription,
  emptyMessage,
  headerAction,
  isLoading = false,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const displayEmptyDesc = emptyMessage || emptyDescription || "There are no entries matching your query.";

  // Filter Data
  const filteredData = data.filter((item) => {
    if (!search) return true;
    const query = search.toLowerCase();

    if (typeof searchKey === "function") {
      return searchKey(item).toLowerCase().includes(query);
    }
    if (searchKey && item[searchKey]) {
      return String(item[searchKey]).toLowerCase().includes(query);
    }
    // Default search across all string fields
    return Object.values(item).some((val) =>
      typeof val === "string" ? val.toLowerCase().includes(query) : false
    );
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft overflow-hidden">
      {/* Top Search & Filter Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3.5 bg-slate-50/40">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-slate-400"
          />
        </div>
        {headerAction && <div className="w-full sm:w-auto flex items-center gap-2">{headerAction}</div>}
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {columns.map((col, idx) => (
                <th key={idx} className={`px-5 py-3.5 ${col.className || ""}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-16 text-center text-slate-400">
                  <Loader2 className="w-7 h-7 animate-spin mx-auto text-brand-600 mb-2" />
                  <p className="text-xs font-medium text-slate-500">Loading data...</p>
                </td>
              </tr>
            ) : paginatedData.length > 0 ? (
              paginatedData.map((item, rowIdx) => (
                <tr key={item.id || rowIdx} className="hover:bg-brand-50/30 transition-colors">
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className={`px-5 py-4 ${col.className || ""}`}>
                      {col.cell
                        ? col.cell(item)
                        : col.accessor
                        ? col.accessor(item)
                        : col.accessorKey
                        ? String(item[col.accessorKey] ?? "")
                        : null}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
                      <Inbox className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-800 mb-1">{emptyTitle}</h4>
                    <p className="text-xs text-slate-500">{displayEmptyDesc}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {filteredData.length > itemsPerPage && (
        <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-700">{(currentPage - 1) * itemsPerPage + 1}</strong> to{" "}
            <strong className="text-slate-700">
              {Math.min(currentPage * itemsPerPage, filteredData.length)}
            </strong>{" "}
            of <strong className="text-slate-700">{filteredData.length}</strong> results
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-medium text-slate-700">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
