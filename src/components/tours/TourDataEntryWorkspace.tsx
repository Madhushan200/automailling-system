"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Tour,
  Hotel,
  AccommodationRow,
  TransportationRow,
  MiscellaneousRow,
  GroupedHotelVoucher,
} from "@/lib/types";
import { crmStore } from "@/lib/store";
import { generateHotelVouchers, normalizeHotelName, findMatchingHotel } from "@/lib/voucher-engine";
import { buildVoucherPDFDoc, getVoucherPDFDataUrl } from "@/lib/pdf";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";
import { VoucherPreviewModal } from "@/components/bulk-voucher/VoucherPreviewModal";
import { EmailEditorModal } from "@/components/bulk-voucher/EmailEditorModal";
import { BulkSendModal } from "@/components/bulk-voucher/BulkSendModal";
import {
  Building2,
  Calendar,
  Car,
  CheckCircle2,
  ChevronDown,
  Clock,
  Compass,
  Copy,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Mail,
  MapPin,
  Package,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  Send,
  Sparkles,
  Trash2,
  Users,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Edit3,
} from "lucide-react";

interface Props {
  tourId?: string;
  isNew?: boolean;
}

export function TourDataEntryWorkspace({ tourId, isNew = false }: Props) {
  const router = useRouter();
  const { showToast } = useToast();

  // Master Hotels List for Autocomplete
  const [knownHotels, setKnownHotels] = useState<Hotel[]>([]);

  // Core Tour Info Fields
  const [tourRef, setTourRef] = useState<string>("DL-2026-001");
  const [tourTitle, setTourTitle] = useState<string>("Sri Lanka 5-Day Highlights & Scenic Highlands");
  const [clientName, setClientName] = useState<string>("Dr. Jonathan Hayes & Family");
  const [paxCount, setPaxCount] = useState<number>(4);
  const [arrivalDate, setArrivalDate] = useState<string>("2026-06-10");
  const [departureDate, setDepartureDate] = useState<string>("2026-06-15");
  const [daysCount, setDaysCount] = useState<number>(5);
  const [tourNotes, setTourNotes] = useState<string>("VIP group. Early check-in requested where available.");
  const [tourStatus, setTourStatus] = useState<any>("Confirmed");

  // Editable Tables Data
  const [accommodationRows, setAccommodationRows] = useState<AccommodationRow[]>([]);
  const [transportationRows, setTransportationRows] = useState<TransportationRow[]>([]);
  const [miscellaneousRows, setMiscellaneousRows] = useState<MiscellaneousRow[]>([]);

  // Generated Vouchers
  const [vouchers, setVouchers] = useState<GroupedHotelVoucher[]>([]);

  // UI States
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "accommodation" | "transport" | "misc" | "vouchers">("all");

  // Modals
  const [previewVoucher, setPreviewVoucher] = useState<GroupedHotelVoucher | null>(null);
  const [editorVoucher, setEditorVoucher] = useState<GroupedHotelVoucher | null>(null);
  const [isBulkSendOpen, setIsBulkSendOpen] = useState(false);
  const [bulkCurrentIndex, setBulkCurrentIndex] = useState(0);
  const [isBulkCompleted, setIsBulkCompleted] = useState(false);
  const [isQuickAddHotelOpen, setIsQuickAddHotelOpen] = useState(false);
  const [newHotelName, setNewHotelName] = useState("");
  const [newHotelEmail, setNewHotelEmail] = useState("");
  const [newHotelCc, setNewHotelCc] = useState("");
  const [newHotelPhone, setNewHotelPhone] = useState("");
  const [newHotelAddress, setNewHotelAddress] = useState("");
  const [newHotelNotes, setNewHotelNotes] = useState("");

  // Autocomplete active cell tracking
  const [activeHotelSearchRowIndex, setActiveHotelSearchRowIndex] = useState<number | null>(null);
  const [hotelSearchQuery, setHotelSearchQuery] = useState<string>("");

  // Load Initial Data
  useEffect(() => {
    const hotels = crmStore.getHotels();
    setKnownHotels(hotels);

    if (isNew) {
      // Initialize a fresh new tour
      const existingTours = crmStore.getTours();
      const nextNum = existingTours.length + 1;
      const newRef = `DL-2026-${String(nextNum).padStart(3, "0")}`;
      setTourRef(newRef);
      setTourTitle("New Tour Program");
      setClientName("");
      setPaxCount(2);
      setArrivalDate("2026-06-10");
      setDepartureDate("2026-06-15");
      setDaysCount(5);
      setTourNotes("");

      // Initialize default empty rows
      setAccommodationRows([
        { id: "row-1", date: "10/06/2026", hotel: "EARLS REGENT", mealPlan: "HB", sgl: 0, dbl: 70, tpl: 0 },
        { id: "row-2", date: "11/06/2026", hotel: "EARLS REGENT", mealPlan: "HB", sgl: 0, dbl: 70, tpl: 0 },
        { id: "row-3", date: "12/06/2026", hotel: "ARALIYA RED", mealPlan: "HB", sgl: 0, dbl: 100, tpl: 0 },
        { id: "row-4", date: "13/06/2026", hotel: "ARALIYA RED", mealPlan: "HB", sgl: 0, dbl: 100, tpl: 0 },
        { id: "row-5", date: "14/06/2026", hotel: "GRANBELL", mealPlan: "HB", sgl: 0, dbl: 105, tpl: 0 },
      ]);

      setTransportationRows([
        { id: "tr-1", day: "DAY 1", route: "Kandy / Colombo", km: 190 },
        { id: "tr-2", day: "DAY 2", route: "", km: 300 },
        { id: "tr-3", day: "DAY 3", route: "", km: 90 },
        { id: "tr-4", day: "DAY 4", route: "", km: 80 },
        { id: "tr-5", day: "DAY 5", route: "", km: 350 },
      ]);

      setMiscellaneousRows([
        { id: "m-1", item: "SANITIZER PACK", qty_value: 300 },
        { id: "m-2", item: "EXTRAS", qty_value: "" },
        { id: "m-3", item: "JEEP RATE", qty_value: 0 },
        { id: "m-4", item: "BOATS RATE", qty_value: 0 },
        { id: "m-5", item: "ENTRANCE FEES", qty_value: "" },
        { id: "m-6", item: "07 LUNCHES", qty_value: 70 },
        { id: "m-7", item: "KELANIYA TEMPLE", qty_value: 2 },
        { id: "m-8", item: "PINNAWELA", qty_value: 15 },
        { id: "m-9", item: "KANDY TEMPLE", qty_value: 6 },
      ]);
      return;
    }

    // Load existing tour by ID or reference
    const targetId = tourId || "tour-dl-001";
    const found = crmStore.getTourById(targetId) || crmStore.getTours()[0];

    if (found) {
      setTourRef(found.tour_reference || found.tour_number || "DL-2026-001");
      setTourTitle(found.tour_name || "Sri Lanka Tour");
      setClientName(found.client_name || "");
      setPaxCount(found.pax || found.total_pax || found.adults_count || 4);
      setArrivalDate(found.arrival_date || found.start_date || "2026-06-10");
      setDepartureDate(found.departure_date || found.end_date || "2026-06-15");
      setDaysCount(found.days_count || 5);
      setTourNotes(found.notes || "");
      setTourStatus(found.status || "Confirmed");

      if (found.accommodation_rows && found.accommodation_rows.length > 0) {
        setAccommodationRows(found.accommodation_rows);
      } else {
        // Fallback to sample rows matching the user's Excel sheet
        setAccommodationRows([
          { id: "row-1", date: "10/06/2026", hotel: "EARLS REGENT", mealPlan: "HB", sgl: 0, dbl: 70, tpl: 0 },
          { id: "row-2", date: "11/06/2026", hotel: "EARLS REGENT", mealPlan: "HB", sgl: 0, dbl: 70, tpl: 0 },
          { id: "row-3", date: "12/06/2026", hotel: "ARALIYA RED", mealPlan: "HB", sgl: 0, dbl: 100, tpl: 0 },
          { id: "row-4", date: "13/06/2026", hotel: "ARALIYA RED", mealPlan: "HB", sgl: 0, dbl: 100, tpl: 0 },
          { id: "row-5", date: "14/06/2026", hotel: "GRANBELL", mealPlan: "HB", sgl: 0, dbl: 105, tpl: 0 },
        ]);
      }

      if (found.transportation_rows && found.transportation_rows.length > 0) {
        setTransportationRows(found.transportation_rows);
      } else {
        setTransportationRows([
          { id: "tr-1", day: "DAY 1", route: "Kandy / Colombo", km: 190 },
          { id: "tr-2", day: "DAY 2", route: "", km: 300 },
          { id: "tr-3", day: "DAY 3", route: "", km: 90 },
          { id: "tr-4", day: "DAY 4", route: "", km: 80 },
          { id: "tr-5", day: "DAY 5", route: "", km: 350 },
        ]);
      }

      if (found.miscellaneous_rows && found.miscellaneous_rows.length > 0) {
        setMiscellaneousRows(found.miscellaneous_rows);
      } else {
        setMiscellaneousRows([
          { id: "m-1", item: "SANITIZER PACK", qty_value: 300 },
          { id: "m-2", item: "EXTRAS", qty_value: "" },
          { id: "m-3", item: "JEEP RATE", qty_value: 0 },
          { id: "m-4", item: "BOATS RATE", qty_value: 0 },
          { id: "m-5", item: "ENTRANCE FEES", qty_value: "" },
          { id: "m-6", item: "07 LUNCHES", qty_value: 70 },
          { id: "m-7", item: "KELANIYA TEMPLE", qty_value: 2 },
          { id: "m-8", item: "PINNAWELA", qty_value: 15 },
          { id: "m-9", item: "KANDY TEMPLE", qty_value: 6 },
        ]);
      }
    }
  }, [tourId, isNew]);

  // Automatically update Days count when Arrival or Departure dates change
  useEffect(() => {
    if (arrivalDate && departureDate) {
      try {
        const start = new Date(arrivalDate);
        const end = new Date(departureDate);
        if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end >= start) {
          const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          setDaysCount(diffDays);
        }
      } catch (e) {
        // Ignore date parsing errors
      }
    }
  }, [arrivalDate, departureDate]);

  // Global Ctrl+S / Cmd+S Keyboard Shortcut to Save Tour
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSaveTour();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [tourRef, tourTitle, clientName, paxCount, arrivalDate, departureDate, daysCount, tourNotes, tourStatus, accommodationRows, transportationRows, miscellaneousRows, vouchers]);

  // Automatically sync vouchers whenever accommodation rows change or are updated
  useEffect(() => {
    const currentTour: Tour = {
      id: tourId || `tour-${tourRef}`,
      tour_number: tourRef,
      tour_reference: tourRef,
      tour_name: tourTitle,
      client_name: clientName,
      total_pax: paxCount,
      start_date: arrivalDate,
      end_date: departureDate,
      arrival_date: arrivalDate,
      departure_date: departureDate,
      days_count: daysCount,
      nights_count: Math.max(1, daysCount - 1),
      adults_count: paxCount,
      children_count: 0,
      infants_count: 0,
      destination: "Sri Lanka",
      currency: "USD",
      exchange_rate: 1.0,
      base_currency: "USD",
      status: tourStatus,
      total_cost: 0,
      selling_price: 0,
      gross_profit: 0,
      gross_margin_percent: 0,
      created_at: new Date().toISOString(),
      accommodation_rows: accommodationRows,
      transportation_rows: transportationRows,
      miscellaneous_rows: miscellaneousRows,
    };

    const autoVouchers = generateHotelVouchers(currentTour, knownHotels, vouchers);
    setVouchers(autoVouchers);
  }, [accommodationRows, knownHotels, tourRef, clientName, arrivalDate, departureDate, paxCount]);

  // =========================================================================
  // 1. HOTEL ACCOMMODATION TABLE HANDLERS
  // =========================================================================
  const handleAddAccommodationRow = () => {
    const lastRow = accommodationRows[accommodationRows.length - 1];
    let nextDate = "15/06/2026";

    if (lastRow && lastRow.date) {
      const parts = lastRow.date.split(/[/.-]/);
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10) + 1;
        nextDate = `${String(day).padStart(2, "0")}/${parts[1]}/${parts[2]}`;
      }
    }

    const newRow: AccommodationRow = {
      id: `acc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      date: nextDate,
      hotel: lastRow?.hotel || "EARLS REGENT",
      mealPlan: lastRow?.mealPlan || "HB",
      sgl: 0,
      dbl: lastRow?.dbl || 70,
      tpl: 0,
    };

    setAccommodationRows([...accommodationRows, newRow]);
    showToast("Added new accommodation row", "info");
  };

  // Auto-Fill Sequential Dates from Tour Arrival Date
  const handleAutoFillDates = () => {
    if (!arrivalDate) {
      showToast("Please set an Arrival Date in Tour Information first", "warning");
      return;
    }

    try {
      const startDate = new Date(arrivalDate);
      if (isNaN(startDate.getTime())) {
        showToast("Invalid Arrival Date format", "warning");
        return;
      }

      const updated = accommodationRows.map((row, idx) => {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + idx);
        const day = String(currentDate.getDate()).padStart(2, "0");
        const month = String(currentDate.getMonth() + 1).padStart(2, "0");
        const year = currentDate.getFullYear();
        return {
          ...row,
          date: `${day}/${month}/${year}`,
        };
      });

      setAccommodationRows(updated);
      showToast(`Auto-sequenced ${updated.length} stay dates starting from ${arrivalDate}!`, "success");
    } catch (err: any) {
      showToast("Could not auto-fill dates: " + err.message, "error");
    }
  };

  const handleUpdateAccommodationCell = (index: number, field: keyof AccommodationRow, value: any) => {
    setAccommodationRows((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value,
      };

      // If hotel name changed, check if it matches hotel master database and sync email
      if (field === "hotel") {
        const matched = findMatchingHotel(String(value), knownHotels);
        if (matched) {
          updated[index].hotelName = matched.hotel_name;
          updated[index].hotelEmail = matched.reservation_email;
        }
      }

      return updated;
    });
  };

  const handleDeleteAccommodationRow = (index: number) => {
    if (accommodationRows.length <= 1) {
      showToast("Tour must have at least one accommodation night", "warning");
      return;
    }
    setAccommodationRows(accommodationRows.filter((_, i) => i !== index));
    showToast("Removed accommodation row", "info");
  };

  const handleDuplicateAccommodationRow = (index: number) => {
    const row = accommodationRows[index];
    const newRow: AccommodationRow = {
      ...row,
      id: `acc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    };
    const next = [...accommodationRows];
    next.splice(index + 1, 0, newRow);
    setAccommodationRows(next);
    showToast("Duplicated accommodation row", "info");
  };

  const handleSelectHotelSuggestion = (rowIndex: number, hotel: Hotel) => {
    setAccommodationRows((prev) => {
      const updated = [...prev];
      updated[rowIndex] = {
        ...updated[rowIndex],
        hotel: hotel.hotel_name,
        hotelName: hotel.hotel_name,
        hotelEmail: hotel.reservation_email,
      };
      return updated;
    });
    setActiveHotelSearchRowIndex(null);
    setHotelSearchQuery("");
    showToast(`Selected hotel "${hotel.hotel_name}" with email ${hotel.reservation_email}`, "success");
  };

  // =========================================================================
  // 2. TRANSPORTATION TABLE HANDLERS
  // =========================================================================
  const handleAddTransportationRow = () => {
    const nextDayNum = transportationRows.length + 1;
    const newRow: TransportationRow = {
      id: `tr-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      day: `DAY ${nextDayNum}`,
      route: "",
      km: 100,
    };
    setTransportationRows([...transportationRows, newRow]);
    showToast(`Added DAY ${nextDayNum} to transportation schedule`, "info");
  };

  const handleUpdateTransportationCell = (index: number, field: keyof TransportationRow, value: any) => {
    setTransportationRows((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: field === "km" ? Number(value) || 0 : value,
      };
      return updated;
    });
  };

  const handleDeleteTransportationRow = (index: number) => {
    setTransportationRows(transportationRows.filter((_, i) => i !== index));
  };

  // =========================================================================
  // 3. MISCELLANEOUS TABLE HANDLERS
  // =========================================================================
  const handleAddMiscellaneousRow = (customItem?: string, customVal?: any) => {
    const newRow: MiscellaneousRow = {
      id: `m-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      item: customItem || "NEW EXCURSION / SERVICE",
      qty_value: customVal !== undefined ? customVal : 1,
    };
    setMiscellaneousRows([...miscellaneousRows, newRow]);
    showToast(`Added "${newRow.item}" to miscellaneous table`, "info");
  };

  const handleUpdateMiscellaneousCell = (index: number, field: keyof MiscellaneousRow, value: any) => {
    setMiscellaneousRows((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
      return updated;
    });
  };

  const handleDeleteMiscellaneousRow = (index: number) => {
    setMiscellaneousRows(miscellaneousRows.filter((_, i) => i !== index));
  };

  // =========================================================================
  // 4. SAVE TOUR HANDLER
  // =========================================================================
  const handleSaveTour = () => {
    setIsSaving(true);

    const tourToSave: Tour = {
      id: tourId || `tour-${tourRef.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
      tour_number: tourRef,
      tour_reference: tourRef,
      tour_name: tourTitle || "Sri Lanka Tour",
      client_name: clientName || "Valued Client",
      total_pax: Number(paxCount) || 1,
      pax: Number(paxCount) || 1,
      adults_count: Number(paxCount) || 1,
      children_count: 0,
      infants_count: 0,
      start_date: arrivalDate,
      end_date: departureDate,
      arrival_date: arrivalDate,
      departure_date: departureDate,
      days_count: Number(daysCount) || 1,
      nights_count: Math.max(1, (Number(daysCount) || 1) - 1),
      notes: tourNotes,
      status: tourStatus,
      currency: "USD",
      exchange_rate: 1.0,
      base_currency: "USD",
      total_cost: 3200,
      selling_price: 3850,
      gross_profit: 650,
      gross_margin_percent: 16.88,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      accommodation_rows: accommodationRows,
      transportation_rows: transportationRows,
      miscellaneous_rows: miscellaneousRows,
      hotel_vouchers: vouchers,
    };

    crmStore.saveTour(tourToSave);

    setTimeout(() => {
      setIsSaving(false);
      setLastSavedTime(new Date().toLocaleTimeString());
      showToast(`Tour ${tourRef} successfully saved to system! (Ctrl+S)`, "success");
    }, 250);
  };

  // =========================================================================
  // 5. GENERATE HOTEL VOUCHERS (AUTOMATIC DETECTION)
  // =========================================================================
  const handleGenerateHotelVouchers = () => {
    const currentTour: Tour = {
      id: tourId || `tour-${tourRef}`,
      tour_number: tourRef,
      tour_reference: tourRef,
      tour_name: tourTitle,
      client_name: clientName,
      total_pax: paxCount,
      start_date: arrivalDate,
      end_date: departureDate,
      arrival_date: arrivalDate,
      departure_date: departureDate,
      days_count: daysCount,
      nights_count: Math.max(1, daysCount - 1),
      adults_count: paxCount,
      children_count: 0,
      infants_count: 0,
      destination: "Sri Lanka",
      currency: "USD",
      exchange_rate: 1.0,
      base_currency: "USD",
      status: tourStatus,
      total_cost: 0,
      selling_price: 0,
      gross_profit: 0,
      gross_margin_percent: 0,
      created_at: new Date().toISOString(),
      accommodation_rows: accommodationRows,
      transportation_rows: transportationRows,
      miscellaneous_rows: miscellaneousRows,
    };

    const detected = generateHotelVouchers(currentTour, knownHotels, vouchers);
    setVouchers(detected);

    const hotelNames = detected.map((v) => v.hotelName).join(", ");
    showToast(
      `Detected ${detected.length} unique hotels: ${hotelNames}. Generated individual vouchers!`,
      "success"
    );

    // Scroll smoothly to vouchers section
    const el = document.getElementById("hotel-vouchers-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // =========================================================================
  // 6. SINGLE VOUCHER ACTIONS: PREVIEW, DOWNLOAD, SEND
  // =========================================================================
  const handleDownloadPDF = (voucher: GroupedHotelVoucher) => {
    const cleanHotelSlug = voucher.hotelName.toUpperCase().replace(/[^A-Z0-9]/g, "_").replace(/_+/g, "_");
    const settings = crmStore.getSettings();
    const doc = buildVoucherPDFDoc({
      voucherNumber: `VCH-${voucher.tourNumber || tourRef}-${cleanHotelSlug.slice(0, 4)}`,
      issueDate: new Date().toISOString().split("T")[0],
      tourNumber: voucher.tourNumber || tourRef,
      reference: voucher.reference || tourRef,
      clientName: voucher.clientName || clientName,
      hotelName: voucher.hotelName,
      hotelEmail: voucher.hotelEmail,
      rows: voucher.rows,
      companySettings: settings,
    });

    doc.save(`${cleanHotelSlug}_VOUCHER.pdf`);
    showToast(`Downloaded ${cleanHotelSlug}_VOUCHER.pdf`, "success");
  };

  const handleSendSingleVoucher = async (
    voucher: GroupedHotelVoucher,
    customSubject?: string,
    customBody?: string
  ) => {
    if (!voucher.hotelEmail) {
      showToast(`Cannot send: Missing email for ${voucher.hotelName}. Please enter hotel email first.`, "error");
      return;
    }

    setVouchers((prev) =>
      prev.map((v) => (v.id === voucher.id ? { ...v, sendState: "sending" } : v))
    );

    try {
      const settings = crmStore.getSettings();
      const res = await fetch("/api/send-bulk-voucher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voucher,
          customSubject,
          customBody,
          settings,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Delivery failed");
      }

      setVouchers((prev) =>
        prev.map((v) =>
          v.id === voucher.id
            ? { ...v, sendState: "sent", lastSentAt: new Date().toISOString() }
            : v
        )
      );

      crmStore.addVoucher({
        id: `vch-${Date.now()}`,
        voucher_number: json.voucherNumber || `VCH-${voucher.tourNumber}-${voucher.hotelName.slice(0, 3)}`,
        hotel_name: voucher.hotelName,
        hotel_email: voucher.hotelEmail,
        client_name: voucher.clientName || clientName,
        tour_number: voucher.tourNumber || tourRef,
        check_in_date: voucher.checkInStart,
        check_out_date: voucher.checkInEnd,
        status: "sent",
        email_status: "sent",
        sent_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      });

      crmStore.addEmailLog({
        id: `log-${Date.now()}`,
        recipient_email: voucher.hotelEmail,
        hotel_name: voucher.hotelName,
        subject: customSubject || `Hotel Accommodation Voucher – ${voucher.hotelName} – ${voucher.tourNumber || tourRef}`,
        status: "sent",
        sent_at: new Date().toISOString(),
      });

      showToast(`Voucher successfully emailed to ${voucher.hotelName} (${voucher.hotelEmail})!`, "success");
    } catch (err: any) {
      console.error(err);
      setVouchers((prev) =>
        prev.map((v) =>
          v.id === voucher.id
            ? { ...v, sendState: "failed", sendErrorMessage: err.message }
            : v
        )
      );
      showToast(`Failed to send voucher to ${voucher.hotelName}: ${err.message}`, "error");
    }
  };

  // =========================================================================
  // 7. SEND ALL VOUCHERS (BATCH DISPATCH)
  // =========================================================================
  const handleStartBulkSend = async () => {
    const readyVouchers = vouchers.filter((v) => v.hotelEmail);
    if (readyVouchers.length === 0) {
      showToast("No vouchers have a recipient email. Please fill in hotel emails first.", "warning");
      return;
    }

    setIsBulkSendOpen(true);
    setIsBulkCompleted(false);
    setBulkCurrentIndex(0);

    const settings = crmStore.getSettings();

    for (let i = 0; i < vouchers.length; i++) {
      const v = vouchers[i];
      if (!v.hotelEmail) continue;

      setBulkCurrentIndex(i);
      setVouchers((prev) =>
        prev.map((item) => (item.id === v.id ? { ...item, sendState: "sending" } : item))
      );

      try {
        const res = await fetch("/api/send-bulk-voucher", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            voucher: v,
            settings,
          }),
        });
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.error);

        setVouchers((prev) =>
          prev.map((item) =>
            item.id === v.id
              ? { ...item, sendState: "sent", lastSentAt: new Date().toISOString() }
              : item
          )
        );

        crmStore.addVoucher({
          id: `vch-${Date.now()}-${i}`,
          voucher_number: json.voucherNumber || `VCH-${v.tourNumber}-${v.hotelName.slice(0, 3)}`,
          hotel_name: v.hotelName,
          hotel_email: v.hotelEmail,
          client_name: v.clientName || clientName,
          tour_number: v.tourNumber || tourRef,
          check_in_date: v.checkInStart,
          check_out_date: v.checkInEnd,
          status: "sent",
          email_status: "sent",
          sent_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        });
      } catch (err: any) {
        setVouchers((prev) =>
          prev.map((item) =>
            item.id === v.id
              ? { ...item, sendState: "failed", sendErrorMessage: err.message }
              : item
          )
        );
      }
    }

    setIsBulkCompleted(true);
    showToast("All hotel vouchers processed!", "success");
  };

  const handleRetryFailed = async () => {
    const failed = vouchers.filter((v) => v.sendState === "failed" && v.hotelEmail);
    if (failed.length === 0) return;

    for (const v of failed) {
      await handleSendSingleVoucher(v);
    }
  };

  // Quick Add Hotel to Master Database
  const handleSaveNewHotelToDatabase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHotelName) {
      showToast("Hotel name is required", "warning");
      return;
    }

    const created: Hotel = {
      id: `hotel-${Date.now()}`,
      hotel_name: newHotelName.trim().toUpperCase(),
      reservation_email: newHotelEmail.trim(),
      cc_email: newHotelCc.trim(),
      phone: newHotelPhone.trim(),
      address: newHotelAddress.trim(),
      city: "Sri Lanka",
      notes: newHotelNotes.trim(),
      active: true,
      star_rating: 4,
    };

    crmStore.addHotel(created);
    const updated = crmStore.getHotels();
    setKnownHotels(updated);

    if (activeHotelSearchRowIndex !== null) {
      handleSelectHotelSuggestion(activeHotelSearchRowIndex, created);
    }

    setIsQuickAddHotelOpen(false);
    setNewHotelName("");
    setNewHotelEmail("");
    setNewHotelCc("");
    setNewHotelPhone("");
    setNewHotelAddress("");
    setNewHotelNotes("");
    showToast(`Added "${created.hotel_name}" to Master Hotel Database!`, "success");
  };

  // Calculate Aggregates
  const totalKm = transportationRows.reduce((sum, r) => sum + (Number(r.km) || 0), 0);
  const totalSgl = accommodationRows.reduce((sum, r) => sum + (Number(r.sgl) || 0), 0);
  const totalDbl = accommodationRows.reduce((sum, r) => sum + (Number(r.dbl) || 0), 0);
  const totalTpl = accommodationRows.reduce((sum, r) => sum + (Number(r.tpl) || 0), 0);
  const totalRooms = totalSgl + totalDbl + totalTpl;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-24">
      {/* Top Sticky Main Action Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white/95 border border-slate-200/90 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4 sticky -top-4 sm:-top-6 lg:-top-8 z-30 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-navy-950 to-slate-900 text-emerald-400 flex items-center justify-center font-bold text-xl shadow-soft flex-shrink-0 border border-slate-700">
            🌴
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-lg bg-navy-950 text-emerald-400 font-mono text-xs font-extrabold uppercase tracking-wider border border-slate-700">
                {tourRef || "DL-2026-001"}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase">
                {tourStatus}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                • {paxCount} Pax • {daysCount} Days ({Math.max(1, daysCount - 1)} Nights) • {vouchers.length} Hotels
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-bold text-navy-950 font-display mt-0.5">
              {clientName ? `${clientName} — Tour Workspace` : tourTitle}
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleSaveTour}
            disabled={isSaving}
            title="Save Tour (Ctrl+S)"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-navy-950 hover:bg-slate-800 text-white text-xs font-bold shadow-soft transition-all active:scale-95"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 text-emerald-400" />
                <span>SAVE TOUR</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-slate-800 rounded font-mono text-slate-300">Ctrl+S</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleGenerateHotelVouchers}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold shadow-soft transition-all active:scale-95 hover:shadow-glow"
          >
            <Sparkles className="w-4 h-4 text-amber-200 animate-pulse" />
            <span>GENERATE HOTEL VOUCHERS</span>
          </button>

          <Link
            href="/tours"
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors"
          >
            All Tours
          </Link>
        </div>
      </div>

      {lastSavedTime && (
        <div className="flex items-center justify-between px-4 py-2 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-800 transition-all">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Tour data and table records saved to system.</span>
          </div>
          <span className="font-mono text-[11px] text-emerald-700">Saved at {lastSavedTime}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. TOUR INFORMATION */}
      {/* ========================================================================= */}
      <section className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-soft space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-navy-950 text-emerald-400 flex items-center justify-center font-bold text-xs shadow-sm">
              1
            </div>
            <h2 className="text-sm font-extrabold text-navy-950 uppercase tracking-wide">
              Tour Information & Client Details
            </h2>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Direct data entry</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Tour Reference */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tour Reference *</label>
            <input
              type="text"
              value={tourRef}
              onChange={(e) => setTourRef(e.target.value)}
              placeholder="e.g. DL-2026-001"
              className="w-full px-3 py-2 text-xs font-mono font-bold bg-slate-50/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white text-navy-950 transition-all"
            />
          </div>

          {/* Client / Group Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Client / Group Name *</label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="e.g. Dr. Jonathan Hayes & Family"
              className="w-full px-3 py-2 text-xs font-semibold bg-slate-50/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white text-navy-950 transition-all"
            />
          </div>

          {/* Number of Pax */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Number of Pax *</label>
            <input
              type="number"
              min="1"
              value={paxCount}
              onChange={(e) => setPaxCount(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs font-bold bg-slate-50/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white text-navy-950 transition-all"
            />
          </div>

          {/* Number of Days */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Number of Days</label>
            <input
              type="number"
              min="1"
              value={daysCount}
              onChange={(e) => setDaysCount(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs font-bold bg-slate-50/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white text-navy-950 transition-all"
            />
          </div>

          {/* Arrival Date */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Arrival Date (Check-in)</label>
            <input
              type="date"
              value={arrivalDate}
              onChange={(e) => setArrivalDate(e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium bg-slate-50/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white text-navy-950 transition-all"
            />
          </div>

          {/* Departure Date */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Departure Date (Check-out)</label>
            <input
              type="date"
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium bg-slate-50/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white text-navy-950 transition-all"
            />
          </div>

          {/* Notes / Special Instructions */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">Tour Notes & Remarks</label>
            <input
              type="text"
              value={tourNotes}
              onChange={(e) => setTourNotes(e.target.value)}
              placeholder="e.g. VIP group. Early check-in requested where available."
              className="w-full px-3 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white text-navy-950 transition-all"
            />
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. HOTEL ACCOMMODATION TABLE (THE EXCEL REPLICA) */}
      {/* ========================================================================= */}
      <section className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              2
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-navy-950 uppercase tracking-wide">
                Hotel Accommodation Table
              </h2>
              <p className="text-[11px] text-slate-400">
                Directly editable grid with live hotel master autocomplete and room counters.
              </p>
            </div>
          </div>

          {/* Table Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleAutoFillDates}
              title="Auto-fill sequential dates starting from Tour Arrival Date"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold transition-all"
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span>⚡ Auto-Fill Dates</span>
            </button>

            <button
              type="button"
              onClick={handleAddAccommodationRow}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-950 hover:bg-slate-800 text-white text-xs font-bold shadow-soft transition-all"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              <span>Add Stay / Row</span>
            </button>

            <button
              type="button"
              onClick={() => setIsQuickAddHotelOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all"
            >
              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>+ New Hotel in DB</span>
            </button>
          </div>
        </div>

        {/* Accommodation Spreadsheet Grid */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl custom-scrollbar">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-navy-950 text-white font-mono uppercase text-[11px] tracking-wider">
                <th className="py-2.5 px-3 text-center w-10">#</th>
                <th className="py-2.5 px-3 text-left w-36">DATE</th>
                <th className="py-2.5 px-3 text-left min-w-[240px]">HOTEL (Searchable)</th>
                <th className="py-2.5 px-3 text-center w-24">SGL</th>
                <th className="py-2.5 px-3 text-center w-32">MEAL PLAN</th>
                <th className="py-2.5 px-3 text-center w-24">DBL</th>
                <th className="py-2.5 px-3 text-center w-24">TPL</th>
                <th className="py-2.5 px-3 text-center w-24">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {accommodationRows.map((row, idx) => {
                const isSearchingThisRow = activeHotelSearchRowIndex === idx;
                const filteredSuggestions = knownHotels.filter((h) => {
                  const query = (hotelSearchQuery || row.hotel || "").toLowerCase();
                  return (
                    h.hotel_name.toLowerCase().includes(query) ||
                    (h.city && h.city.toLowerCase().includes(query))
                  );
                });

                return (
                  <tr key={row.id || idx} className="hover:bg-slate-50/80 transition-colors">
                    {/* Index */}
                    <td className="py-2 px-3 text-center font-mono text-slate-400 font-bold">
                      {idx + 1}
                    </td>

                    {/* Date */}
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={row.date}
                        onChange={(e) => handleUpdateAccommodationCell(idx, "date", e.target.value)}
                        placeholder="10/06/2026"
                        className="w-full px-2.5 py-1.5 font-mono text-xs font-bold border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:bg-white bg-slate-50/50 text-navy-950"
                      />
                    </td>

                    {/* Hotel with searchable autocomplete dropdown */}
                    <td className="py-2 px-3 relative">
                      <div className="relative">
                        <input
                          type="text"
                          value={row.hotel}
                          onFocus={() => {
                            setActiveHotelSearchRowIndex(idx);
                            setHotelSearchQuery(row.hotel || "");
                          }}
                          onChange={(e) => {
                            handleUpdateAccommodationCell(idx, "hotel", e.target.value);
                            setHotelSearchQuery(e.target.value);
                            setActiveHotelSearchRowIndex(idx);
                          }}
                          placeholder="Type hotel name (e.g. EARLS REGENT)..."
                          className="w-full px-2.5 py-1.5 font-bold text-xs uppercase border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:bg-white bg-slate-50/50 text-navy-950 pr-8"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setActiveHotelSearchRowIndex(isSearchingThisRow ? null : idx);
                            setHotelSearchQuery(row.hotel || "");
                          }}
                          className="absolute right-2 top-2 text-slate-400 hover:text-navy-950"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Dropdown Suggestions */}
                      {isSearchingThisRow && (
                        <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white rounded-xl border border-slate-200 shadow-2xl max-h-56 overflow-y-auto p-1 text-xs">
                          <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 flex justify-between items-center">
                            <span>Hotel Database Matches</span>
                            <button
                              type="button"
                              onClick={() => setActiveHotelSearchRowIndex(null)}
                              className="text-slate-400 hover:text-slate-600 font-bold"
                            >
                              ✕
                            </button>
                          </div>

                          {filteredSuggestions.length === 0 ? (
                            <div className="p-3 text-center text-slate-500 text-xs">
                              <p>No existing hotel named "{hotelSearchQuery}"</p>
                              <button
                                type="button"
                                onClick={() => {
                                  setNewHotelName(hotelSearchQuery);
                                  setIsQuickAddHotelOpen(true);
                                }}
                                className="mt-1 text-xs font-bold text-emerald-600 hover:underline"
                              >
                                + Add "{hotelSearchQuery}" to Master DB
                              </button>
                            </div>
                          ) : (
                            filteredSuggestions.map((h) => (
                              <button
                                key={h.id}
                                type="button"
                                onClick={() => handleSelectHotelSuggestion(idx, h)}
                                className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 flex items-center justify-between group transition-colors"
                              >
                                <div>
                                  <div className="font-bold text-navy-950 uppercase">{h.hotel_name}</div>
                                  <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                                    <span>{h.city || "Sri Lanka"}</span>
                                    {h.reservation_email && (
                                      <span className="text-emerald-700 font-mono">• {h.reservation_email}</span>
                                    )}
                                  </div>
                                </div>
                                <span className="text-[10px] text-emerald-600 font-bold opacity-0 group-hover:opacity-100">
                                  Select ➔
                                </span>
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </td>

                    {/* SGL */}
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        min="0"
                        value={row.sgl === 0 ? "" : row.sgl}
                        onChange={(e) => handleUpdateAccommodationCell(idx, "sgl", e.target.value === "" ? 0 : Number(e.target.value))}
                        placeholder="—"
                        className="w-full px-2 py-1.5 text-center font-bold text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
                      />
                    </td>

                    {/* MEAL PLAN */}
                    <td className="py-2 px-3">
                      <select
                        value={row.mealPlan || "HB"}
                        onChange={(e) => handleUpdateAccommodationCell(idx, "mealPlan", e.target.value)}
                        className={`w-full px-2 py-1.5 font-bold text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 bg-slate-50/50 ${
                          row.mealPlan === "HB"
                            ? "text-emerald-700"
                            : row.mealPlan === "FB"
                            ? "text-sky-700"
                            : row.mealPlan === "BB"
                            ? "text-amber-700"
                            : row.mealPlan === "AI"
                            ? "text-purple-700"
                            : "text-slate-700"
                        }`}
                      >
                        <option value="RO">RO (Room Only)</option>
                        <option value="BB">BB (Bed & Breakfast)</option>
                        <option value="HB">HB (Half Board)</option>
                        <option value="FB">FB (Full Board)</option>
                        <option value="AI">AI (All Inclusive)</option>
                      </select>
                    </td>

                    {/* DBL */}
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        min="0"
                        value={row.dbl === 0 ? "" : row.dbl}
                        onChange={(e) => handleUpdateAccommodationCell(idx, "dbl", e.target.value === "" ? 0 : Number(e.target.value))}
                        placeholder="70"
                        className="w-full px-2 py-1.5 text-center font-bold text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-slate-50/50 text-navy-950"
                      />
                    </td>

                    {/* TPL */}
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        min="0"
                        value={row.tpl === 0 ? "" : row.tpl}
                        onChange={(e) => handleUpdateAccommodationCell(idx, "tpl", e.target.value === "" ? 0 : Number(e.target.value))}
                        placeholder="—"
                        className="w-full px-2 py-1.5 text-center font-bold text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
                      />
                    </td>

                    {/* Actions */}
                    <td className="py-2 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleDuplicateAccommodationRow(idx)}
                          title="Duplicate Night"
                          className="p-1 rounded-md text-slate-400 hover:text-navy-950 hover:bg-slate-100 transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteAccommodationRow(idx)}
                          title="Delete Night"
                          className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Accommodation Summary Counter Bar */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between flex-wrap gap-4 text-xs font-semibold">
          <div className="flex items-center gap-4 text-slate-700 flex-wrap">
            <span>Total Stays: <strong className="text-navy-950 font-bold">{accommodationRows.length} Nights</strong></span>
            <span>Total SGL: <strong className="text-navy-950 font-bold">{totalSgl}</strong></span>
            <span>Total DBL: <strong className="text-navy-950 font-bold">{totalDbl}</strong></span>
            <span>Total TPL: <strong className="text-navy-950 font-bold">{totalTpl}</strong></span>
            <span>Grand Total Rooms: <strong className="text-emerald-700 font-extrabold">{totalRooms}</strong></span>
          </div>

          <button
            type="button"
            onClick={handleAddAccommodationRow}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-800"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Another Stay</span>
          </button>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. TRANSPORTATION & 4. MISCELLANEOUS (SIDE BY SIDE) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* TRANSPORTATION TABLE */}
        <section className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-soft space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                3
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-navy-950 uppercase tracking-wide">
                  Transportation Table
                </h2>
                <p className="text-[11px] text-slate-400">Routes & KM distances</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddTransportationRow}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Day</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl custom-scrollbar">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-mono text-[10.5px] uppercase">
                  <th className="py-2 px-3 text-left w-24">DAY</th>
                  <th className="py-2 px-3 text-left">ROUTE / DESCRIPTION</th>
                  <th className="py-2 px-3 text-right w-24">KM</th>
                  <th className="py-2 px-2 text-center w-12">✕</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transportationRows.map((tr, idx) => (
                  <tr key={tr.id || idx} className="hover:bg-slate-50">
                    <td className="py-1.5 px-3">
                      <input
                        type="text"
                        value={tr.day}
                        onChange={(e) => handleUpdateTransportationCell(idx, "day", e.target.value)}
                        placeholder={`DAY ${idx + 1}`}
                        className="w-full px-2 py-1 font-mono text-xs font-bold border border-slate-200 rounded-md bg-white text-navy-950"
                      />
                    </td>
                    <td className="py-1.5 px-3">
                      <input
                        type="text"
                        value={tr.route}
                        onChange={(e) => handleUpdateTransportationCell(idx, "route", e.target.value)}
                        placeholder="e.g. Kandy / Colombo"
                        className="w-full px-2 py-1 text-xs border border-slate-200 rounded-md bg-white text-navy-950"
                      />
                    </td>
                    <td className="py-1.5 px-3">
                      <input
                        type="number"
                        value={tr.km || ""}
                        onChange={(e) => handleUpdateTransportationCell(idx, "km", e.target.value)}
                        placeholder="0"
                        className="w-full px-2 py-1 text-right font-mono font-bold text-xs border border-slate-200 rounded-md bg-white text-navy-950"
                      />
                    </td>
                    <td className="py-1.5 px-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteTransportationRow(idx)}
                        className="text-slate-300 hover:text-red-500 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Total Transportation Distance:</span>
            <span className="text-navy-950 font-mono text-sm">{totalKm} KM</span>
          </div>
        </section>

        {/* MISCELLANEOUS TABLE */}
        <section className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-soft space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                4
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-navy-950 uppercase tracking-wide">
                  Miscellaneous Table
                </h2>
                <p className="text-[11px] text-slate-400">Items, Quantities & Rates</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleAddMiscellaneousRow()}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Item</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl custom-scrollbar">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-mono text-[10.5px] uppercase">
                  <th className="py-2 px-3 text-left">ITEM</th>
                  <th className="py-2 px-3 text-right w-28">QTY / VALUE</th>
                  <th className="py-2 px-2 text-center w-12">✕</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {miscellaneousRows.map((m, idx) => (
                  <tr key={m.id || idx} className="hover:bg-slate-50">
                    <td className="py-1.5 px-3">
                      <input
                        type="text"
                        value={m.item}
                        onChange={(e) => handleUpdateMiscellaneousCell(idx, "item", e.target.value)}
                        placeholder="e.g. SANITIZER PACK"
                        className="w-full px-2 py-1 text-xs font-bold uppercase border border-slate-200 rounded-md bg-white text-navy-950"
                      />
                    </td>
                    <td className="py-1.5 px-3">
                      <input
                        type="text"
                        value={m.qty_value}
                        onChange={(e) => handleUpdateMiscellaneousCell(idx, "qty_value", e.target.value)}
                        placeholder="0"
                        className="w-full px-2 py-1 text-right font-mono font-bold text-xs border border-slate-200 rounded-md bg-white text-navy-950"
                      />
                    </td>
                    <td className="py-1.5 px-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteMiscellaneousRow(idx)}
                        className="text-slate-300 hover:text-red-500 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Quick Presets for Misc */}
          <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
            <span className="text-slate-400 font-bold">Quick Presets:</span>
            {["SANITIZER PACK", "07 LUNCHES", "PINNAWELA", "KANDY TEMPLE", "JEEP RATE"].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handleAddMiscellaneousRow(preset, 1)}
                className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors"
              >
                + {preset}
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* ========================================================================= */}
      {/* 5. AUTOMATICALLY GENERATED HOTEL VOUCHERS DISPATCH HUB */}
      {/* ========================================================================= */}
      <section
        id="hotel-vouchers-section"
        className="p-6 rounded-2xl bg-gradient-to-b from-white to-slate-50 border border-slate-200/90 shadow-soft space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-base shadow-sm">
              📄
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-navy-950 font-display">
                  Hotel Accommodation Vouchers
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase border border-emerald-200">
                  {vouchers.length} Hotels Detected
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Each hotel receives <strong>only its isolated accommodation schedule</strong> with formal PDF voucher and SMTP email.
              </p>
            </div>
          </div>

          {/* Bulk Dispatch Trigger */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleStartBulkSend}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-navy-950 via-slate-900 to-navy-900 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-extrabold shadow-soft transition-all active:scale-95 hover:shadow-glow"
            >
              <Send className="w-4 h-4 text-emerald-400" />
              <span>SEND ALL VOUCHERS ({vouchers.length})</span>
            </button>
          </div>
        </div>

        {/* Vouchers Grid */}
        {vouchers.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-white border border-dashed border-slate-200 text-slate-500 space-y-2">
            <Building2 className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-xs font-bold">No hotel stays added yet</p>
            <p className="text-[11px] text-slate-400">
              Add rows to the Hotel Accommodation Table above and click "Generate Hotel Vouchers".
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vouchers.map((voucher) => {
              const cleanHotelSlug = voucher.hotelName.toUpperCase().replace(/[^A-Z0-9]/g, "_");
              const isSent = voucher.sendState === "sent";
              const isSending = voucher.sendState === "sending";
              const isFailed = voucher.sendState === "failed";
              const hasEmail = Boolean(voucher.hotelEmail);

              return (
                <div
                  key={voucher.id}
                  className={`p-5 rounded-2xl bg-white border transition-all space-y-4 flex flex-col justify-between shadow-soft ${
                    isSent
                      ? "border-emerald-300 bg-emerald-50/20"
                      : isFailed
                      ? "border-red-300 bg-red-50/20"
                      : "border-slate-200/90 hover:border-emerald-500/50 hover:shadow-md"
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header: Hotel Name & Match Status */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          <h3 className="font-extrabold text-sm text-navy-950 uppercase tracking-tight">
                            {voucher.hotelName}
                          </h3>
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          Ref: {voucher.tourNumber || tourRef} • {voucher.rows.length} Nights
                        </p>
                      </div>

                      {/* Status Pill */}
                      {isSent ? (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300 text-[9.5px] font-extrabold uppercase flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Sent
                        </span>
                      ) : isFailed ? (
                        <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-800 border border-red-300 text-[9.5px] font-extrabold uppercase flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-red-600" />
                          Failed
                        </span>
                      ) : isSending ? (
                        <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[9.5px] font-extrabold uppercase animate-pulse">
                          Sending...
                        </span>
                      ) : hasEmail ? (
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[9.5px] font-extrabold uppercase">
                          Ready
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-300 text-[9.5px] font-extrabold uppercase">
                          Missing Email
                        </span>
                      )}
                    </div>

                    {/* Email Input / Display */}
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-emerald-600" />
                          Recipient Email:
                        </span>
                        {voucher.emailStatus === "matched" && (
                          <span className="text-[9px] text-emerald-600 font-semibold">Matched in DB</span>
                        )}
                      </div>
                      <input
                        type="email"
                        value={voucher.hotelEmail}
                        onChange={(e) => {
                          const newEmail = e.target.value;
                          setVouchers((prev) =>
                            prev.map((v) =>
                              v.id === voucher.id
                                ? { ...v, hotelEmail: newEmail, emailStatus: newEmail ? "custom" : "missing" }
                                : v
                            )
                          );
                        }}
                        placeholder="reservations@hotel.com"
                        className="w-full px-2 py-1 text-xs font-mono font-semibold bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 text-navy-950"
                      />
                    </div>

                    {/* Isolated Accommodation Table for THIS HOTEL ONLY */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden text-[11px]">
                      <div className="bg-slate-100/90 px-3 py-1.5 text-[10px] font-bold text-slate-600 uppercase tracking-wider flex justify-between">
                        <span>Stay Breakdown</span>
                        <span className="text-emerald-700 font-bold">{voucher.hotelName} ONLY</span>
                      </div>
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-slate-500 font-mono text-[9.5px] border-b border-slate-200">
                            <th className="py-1 px-2 text-left">DATE</th>
                            <th className="py-1 px-2 text-center">SGL</th>
                            <th className="py-1 px-2 text-center">MEAL</th>
                            <th className="py-1 px-2 text-center">DBL</th>
                            <th className="py-1 px-2 text-center">TPL</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {voucher.rows.map((r, rIdx) => (
                            <tr key={r.id || rIdx} className="hover:bg-slate-50">
                              <td className="py-1 px-2 font-mono font-bold text-navy-950">{r.date}</td>
                              <td className="py-1 px-2 text-center text-slate-600">{r.sgl ? r.sgl : "—"}</td>
                              <td className="py-1 px-2 text-center font-bold text-emerald-700">{r.mealPlan || "HB"}</td>
                              <td className="py-1 px-2 text-center font-bold text-navy-950">{r.dbl ? r.dbl : "—"}</td>
                              <td className="py-1 px-2 text-center text-slate-600">{r.tpl ? r.tpl : "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Voucher Actions Bar */}
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      {/* PREVIEW */}
                      <button
                        type="button"
                        onClick={() => setPreviewVoucher(voucher)}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors active:scale-95"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-600" />
                        <span>Preview PDF</span>
                      </button>

                      {/* DOWNLOAD PDF */}
                      <button
                        type="button"
                        onClick={() => handleDownloadPDF(voucher)}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-bold transition-colors active:scale-95"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Download</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {/* EDIT MODAL */}
                      <button
                        type="button"
                        onClick={() => setEditorVoucher(voucher)}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                        <span>Edit Email</span>
                      </button>

                      {/* SEND EMAIL */}
                      <button
                        type="button"
                        onClick={() => handleSendSingleVoucher(voucher)}
                        disabled={isSending}
                        className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold shadow-soft transition-all active:scale-95 ${
                          isSent
                            ? "bg-emerald-700 hover:bg-emerald-800 text-white"
                            : isFailed
                            ? "bg-red-600 hover:bg-red-700 text-white"
                            : "bg-navy-950 hover:bg-emerald-600 text-white"
                        }`}
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{isSent ? "Resend" : isFailed ? "Retry Send" : "Send Email"}</span>
                      </button>
                    </div>

                    {voucher.lastSentAt && (
                      <p className="text-[9.5px] text-emerald-700 text-center font-mono">
                        Sent at {new Date(voucher.lastSentAt).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}

      {/* Voucher PDF Preview Modal */}
      <VoucherPreviewModal
        voucher={previewVoucher}
        onClose={() => setPreviewVoucher(null)}
      />

      {/* Email Editor Modal */}
      <EmailEditorModal
        isOpen={Boolean(editorVoucher)}
        voucher={editorVoucher}
        onClose={() => setEditorVoucher(null)}
        onSend={(v, customSubject, customBody) => {
          if (editorVoucher || v) {
            handleSendSingleVoucher(v || editorVoucher!, customSubject, customBody);
            setEditorVoucher(null);
          }
        }}
      />

      {/* Bulk Send Progress Tracker Modal */}
      <BulkSendModal
        isOpen={isBulkSendOpen}
        vouchers={vouchers}
        currentIndex={bulkCurrentIndex}
        isCompleted={isBulkCompleted}
        onClose={() => setIsBulkSendOpen(false)}
        onRetryFailed={handleRetryFailed}
      />

      {/* Quick Add Hotel to Master Database Modal */}
      <Modal
        isOpen={isQuickAddHotelOpen}
        onClose={() => setIsQuickAddHotelOpen(false)}
        title="Add Partner Hotel to Master Database"
        subtitle="Save hotel contacts so the system automatically resolves reservation emails"
      >
        <form onSubmit={handleSaveNewHotelToDatabase} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Hotel Name *</label>
            <input
              type="text"
              required
              value={newHotelName}
              onChange={(e) => setNewHotelName(e.target.value)}
              placeholder="e.g. EARLS REGENT"
              className="w-full px-3 py-2 text-xs font-bold uppercase border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Reservation Email *</label>
              <input
                type="email"
                required
                value={newHotelEmail}
                onChange={(e) => setNewHotelEmail(e.target.value)}
                placeholder="reservations@hotel.com"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">CC Email</label>
              <input
                type="email"
                value={newHotelCc}
                onChange={(e) => setNewHotelCc(e.target.value)}
                placeholder="frontdesk@hotel.com"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone</label>
              <input
                type="text"
                value={newHotelPhone}
                onChange={(e) => setNewHotelPhone(e.target.value)}
                placeholder="+94 81 222 3456"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Hotel Address / City</label>
              <input
                type="text"
                value={newHotelAddress}
                onChange={(e) => setNewHotelAddress(e.target.value)}
                placeholder="e.g. Kandy, Sri Lanka"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Notes</label>
            <input
              type="text"
              value={newHotelNotes}
              onChange={(e) => setNewHotelNotes(e.target.value)}
              placeholder="Partner notes or VIP contacts"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsQuickAddHotelOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-navy-950 hover:bg-brand-600 text-white text-xs font-bold shadow-soft"
            >
              Save to Master Database
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
