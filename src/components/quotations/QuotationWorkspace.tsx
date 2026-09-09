"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Quotation,
  QuotationAccommodationItem,
  QuotationTransportDay,
  QuotationMiscItem,
  Vehicle,
  Hotel,
  MiscellaneousMasterItem,
  QuotationStatus,
} from "@/lib/types";
import { crmStore } from "@/lib/store";
import {
  calculateTravelDates,
  calculatePassengers,
  calculateFullQuotationCosting,
} from "@/lib/costing-engine";
import {
  getQuotationCustomerPDFDataUrl,
  getInternalCostingPDFDataUrl,
  buildQuotationCustomerPDFDoc,
  buildInternalCostingPDFDoc,
} from "@/lib/pdf";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  Calculator,
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
  ShieldCheck,
  Percent,
  DollarSign,
  Layers,
  Check,
  HelpCircle,
} from "lucide-react";

interface Props {
  quotationId?: string;
  isNew?: boolean;
}

export function QuotationWorkspace({ quotationId, isNew = false }: Props) {
  const router = useRouter();
  const { showToast } = useToast();

  // Master Data
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [knownHotels, setKnownHotels] = useState<Hotel[]>([]);
  const [miscMaster, setMiscMaster] = useState<MiscellaneousMasterItem[]>([]);

  // Core Quotation Identifiers
  const [quoteId, setQuoteId] = useState<string>("");
  const [quoteNumber, setQuoteNumber] = useState<string>("DL-2026-0001");
  const [revisionNumber, setRevisionNumber] = useState<number>(0);
  const [revisionLabel, setRevisionLabel] = useState<string>("Original");
  const [status, setStatus] = useState<QuotationStatus>("Draft");

  // Client / Customer Details (ALL OPTIONAL)
  const [clientName, setClientName] = useState<string>("");
  const [clientEmail, setClientEmail] = useState<string>("");
  const [clientPhone, setClientPhone] = useState<string>("");
  const [clientNationality, setClientNationality] = useState<string>("");
  const [destination, setDestination] = useState<string>("Sri Lanka Highlights");
  const [tourName, setTourName] = useState<string>("7-Day Classical Sri Lanka & Scenic Highlands");

  // Travel Dates & Overrides
  const [arrivalDate, setArrivalDate] = useState<string>("2026-06-10");
  const [departureDate, setDepartureDate] = useState<string>("2026-06-16");
  const [manualNights, setManualNights] = useState<number | undefined>(undefined);
  const [manualDays, setManualDays] = useState<number | undefined>(undefined);
  const [isManualDatesMode, setIsManualDatesMode] = useState<boolean>(false);

  // Passengers & Overrides
  const [adultsCount, setAdultsCount] = useState<number>(4);
  const [childrenCount, setChildrenCount] = useState<number>(1);
  const [infantsCount, setInfantsCount] = useState<number>(0);
  const [manualTotalPax, setManualTotalPax] = useState<number | undefined>(undefined);
  const [isManualPaxMode, setIsManualPaxMode] = useState<boolean>(false);

  // Vehicle Selection
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("veh-04"); // Default Mini Coach
  const [vehicleRatePerKm, setVehicleRatePerKm] = useState<number>(140);
  const [numVehicles, setNumVehicles] = useState<number>(1);
  const [assignedDriverName, setAssignedDriverName] = useState<string>("Sunil Jayawardena");
  const [assignedDriverPhone, setAssignedDriverPhone] = useState<string>("+94 77 123 9988");
  const [vehiclePlate, setVehiclePlate] = useState<string>("WP NA-5512");
  const [pickupDate, setPickupDate] = useState<string>("2026-06-10");
  const [pickupTime, setPickupTime] = useState<string>("08:30 AM");
  const [pickupLocation, setPickupLocation] = useState<string>("Bandaranaike International Airport (CMB)");
  const [dropoffLocation, setDropoffLocation] = useState<string>("Bandaranaike International Airport (CMB)");

  // Excel Costing Tables
  const [accommodationItems, setAccommodationItems] = useState<QuotationAccommodationItem[]>([]);
  const [transportDays, setTransportDays] = useState<QuotationTransportDay[]>([]);
  const [miscItems, setMiscItems] = useState<QuotationMiscItem[]>([]);

  // Costing Parameters & Manual Overrides
  const [currency, setCurrency] = useState<string>("USD");
  const [exchangeRate, setExchangeRate] = useState<number>(325);
  const [markupType, setMarkupType] = useState<"fixed" | "percentage">("fixed");
  const [markupValue, setMarkupValue] = useState<number>(20); // $20 PP or 20%
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [taxPercent, setTaxPercent] = useState<number>(0);

  // Manual Overrides on Calculated Totals
  const [manualTotalKM, setManualTotalKM] = useState<number | undefined>(undefined);
  const [manualTransportUSD, setManualTransportUSD] = useState<number | undefined>(undefined);
  const [manualMiscTotal, setManualMiscTotal] = useState<number | undefined>(undefined);
  const [manualSglPP, setManualSglPP] = useState<number | undefined>(undefined);
  const [manualDblPP, setManualDblPP] = useState<number | undefined>(undefined);
  const [manualTplPP, setManualTplPP] = useState<number | undefined>(undefined);
  const [manualFinalPrice, setManualFinalPrice] = useState<number | undefined>(undefined);
  const [manualFinalPPRate, setManualFinalPPRate] = useState<number | undefined>(undefined);

  // Inclusions / Exclusions / Terms
  const [inclusions, setInclusions] = useState<string[]>([
    "6 Nights Accommodation in Star Class Hotels (Half Board Basis)",
    "Daily Buffet Breakfast and Dinners at Selected Hotels",
    "Private Air-Conditioned Tourist Vehicle with English-Speaking Chauffeur Guide",
    "All Entrance Tickets: Pinnawela, Kandy Temple, Lake Gregory, Victoria Park, Ashok Vatika, Divurumpola, Madu River Boat & Turtle Hatchery",
    "Driver Night Allowances, Batta, Highway Tolls & Airport Parking",
    "All Government Taxes & Service Charges",
  ]);
  const [exclusions, setExclusions] = useState<string[]>([
    "International flights and Sri Lanka ETA Tourist Visa fees",
    "Lunches and alcoholic beverages",
    "Camera & video permit fees",
    "Tips and personal expenses",
  ]);
  const [terms, setTerms] = useState<string>(
    "Quotation is valid for 14 days from issue date. Rooms are subject to availability upon confirmation."
  );
  const [validUntil, setValidUntil] = useState<string>("2026-09-30");
  const [notes, setNotes] = useState<string>("");
  const [internalNotes, setInternalNotes] = useState<string>("");

  // UI Tabs & Active States
  const [activeTab, setActiveTab] = useState<
    "overview" | "accommodation" | "transport" | "misc" | "itinerary" | "costing" | "preview" | "history"
  >("overview");
  const [saveStatus, setSaveStatus] = useState<"Saved" | "Saving..." | "Unsaved changes">("Saved");
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  // Modals
  const [isCustomerPreviewOpen, setIsCustomerPreviewOpen] = useState(false);
  const [isInternalPreviewOpen, setIsInternalPreviewOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [revisionNotesInput, setRevisionNotesInput] = useState("");
  const [isQuickAddHotelOpen, setIsQuickAddHotelOpen] = useState(false);
  const [newHotelName, setNewHotelName] = useState("");
  const [newHotelEmail, setNewHotelEmail] = useState("");

  // Email State
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Autocomplete tracking
  const [activeHotelSearchRowIndex, setActiveHotelSearchRowIndex] = useState<number | null>(null);
  const [hotelSearchQuery, setHotelSearchQuery] = useState("");

  // Auto-Save Timeout Ref
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. LOAD INITIAL DATA
  useEffect(() => {
    const loadedVehicles = crmStore.getVehicles();
    const loadedHotels = crmStore.getHotels();
    const loadedMisc = crmStore.getMiscellaneousMaster();
    setVehicles(loadedVehicles);
    setKnownHotels(loadedHotels);
    setMiscMaster(loadedMisc);

    if (isNew) {
      const existing = crmStore.getQuotations();
      const nextNum = existing.length + 1;
      const nextRef = `DL-2026-${String(nextNum).padStart(4, "0")}`;
      setQuoteId(`qt-${Date.now()}`);
      setQuoteNumber(nextRef);
      setRevisionNumber(0);
      setRevisionLabel("Original");
      setStatus("Draft");

      // Default initial rows matching Excel reference
      setAccommodationItems([
        { id: "acc-1", date: "10/06/2026", hotel_name: "CINNAMON CITADEL", city: "Kandy", meal_plan: "HB", sgl_rooms: 0, sgl_rate: 0, dbl_rooms: 1, dbl_rate: 80, tpl_rooms: 1, tpl_rate: 105, nights_count: 1 },
        { id: "acc-2", date: "11/06/2026", hotel_name: "CINNAMON CITADEL", city: "Kandy", meal_plan: "HB", sgl_rooms: 0, sgl_rate: 0, dbl_rooms: 1, dbl_rate: 80, tpl_rooms: 1, tpl_rate: 105, nights_count: 1 },
        { id: "acc-3", date: "12/06/2026", hotel_name: "ARALIYA GREEN HILLS", city: "Nuwara Eliya", meal_plan: "HB", sgl_rooms: 0, sgl_rate: 0, dbl_rooms: 1, dbl_rate: 110, tpl_rooms: 1, tpl_rate: 160, nights_count: 1 },
        { id: "acc-4", date: "13/06/2026", hotel_name: "ARALIYA GREEN HILLS", city: "Nuwara Eliya", meal_plan: "HB", sgl_rooms: 0, sgl_rate: 0, dbl_rooms: 1, dbl_rate: 110, tpl_rooms: 1, tpl_rate: 160, nights_count: 1 },
        { id: "acc-5", date: "14/06/2026", hotel_name: "EKHO SURF BENTOTA", city: "Bentota", meal_plan: "HB", sgl_rooms: 0, sgl_rate: 0, dbl_rooms: 1, dbl_rate: 75, tpl_rooms: 1, tpl_rate: 110, nights_count: 1 },
        { id: "acc-6", date: "15/06/2026", hotel_name: "GRANBELL", city: "Colombo", meal_plan: "HB", sgl_rooms: 0, sgl_rate: 0, dbl_rooms: 1, dbl_rate: 105, tpl_rooms: 1, tpl_rate: 145, nights_count: 1 },
      ]);

      setTransportDays([
        { id: "tr-1", day_number: 1, day_label: "DAY 1", route: "Airport → Pinnawela → Kandy", km: 190 },
        { id: "tr-2", day_number: 2, day_label: "DAY 2", route: "Kandy Sightseeing & Cultural Show", km: 300 },
        { id: "tr-3", day_number: 3, day_label: "DAY 3", route: "Kandy → Tea Plantations → Nuwara Eliya", km: 90 },
        { id: "tr-4", day_number: 4, day_label: "DAY 4", route: "Nuwara Eliya → Gregory Lake & Hakgala", km: 80 },
        { id: "tr-5", day_number: 5, day_label: "DAY 5", route: "Nuwara Eliya → Ella Scenic → Bentota", km: 350 },
        { id: "tr-6", day_number: 6, day_label: "DAY 6", route: "Bentota Madu River Safari → Colombo", km: 130 },
        { id: "tr-7", day_number: 7, day_label: "DAY 7", route: "Colombo City & Shopping → Airport Drop", km: 100 },
      ]);

      setMiscItems([
        { id: "m-1", item: "WATER", category: "Meal", unit: "Per Person", qty: 1, rate: 5, is_per_person: true },
        { id: "m-2", item: "SANITIZER PACK", category: "Other", unit: "Per Group", qty: 1, rate: 300, is_per_person: false },
        { id: "m-3", item: "JEEP RATE", category: "Vehicle", unit: "Per Group", qty: 1, rate: 0, is_per_person: false },
        { id: "m-4", item: "BOATS RATE", category: "Activity", unit: "Per Group", qty: 1, rate: 0, is_per_person: false },
        { id: "m-5", item: "KELANIYA TEMPLE", category: "Entrance Fee", unit: "Per Person", qty: 1, rate: 2, is_per_person: true },
        { id: "m-6", item: "PINNAWELA", category: "Entrance Fee", unit: "Per Person", qty: 1, rate: 15, is_per_person: true },
        { id: "m-7", item: "KANDY TEMPLE TOTH", category: "Entrance Fee", unit: "Per Person", qty: 1, rate: 6, is_per_person: true },
        { id: "m-8", item: "GREGORY", category: "Entrance Fee", unit: "Per Person", qty: 1, rate: 4, is_per_person: true },
        { id: "m-9", item: "VICTORIA", category: "Entrance Fee", unit: "Per Person", qty: 1, rate: 4, is_per_person: true },
        { id: "m-10", item: "ASHOK VATIKA", category: "Entrance Fee", unit: "Per Person", qty: 1, rate: 1, is_per_person: true },
        { id: "m-11", item: "DIVURUMPOLA", category: "Entrance Fee", unit: "Per Person", qty: 1, rate: 2, is_per_person: true },
        { id: "m-12", item: "MADU RIVER", category: "Activity", unit: "Per Person", qty: 1, rate: 6, is_per_person: true },
        { id: "m-13", item: "TURTLE HATCHERY", category: "Entrance Fee", unit: "Per Person", qty: 1, rate: 5, is_per_person: true },
      ]);
      return;
    }

    // Load Existing Quotation
    const targetId = quotationId || "qt-001";
    const found = crmStore.getQuotationById(targetId) || crmStore.getQuotations()[0];

    if (found) {
      setQuoteId(found.id);
      setQuoteNumber(found.quote_number || "DL-2026-0001");
      setRevisionNumber(found.revision_number || 0);
      setRevisionLabel(found.revision_label || "Original");
      setStatus(found.status || "Draft");
      setClientName(found.client_name || "");
      setClientEmail(found.client_email || "");
      setClientPhone(found.client_phone || "");
      setClientNationality(found.client_nationality || "");
      setDestination(found.destination || "Sri Lanka");
      setTourName(found.tour_name || "Sri Lanka Tour");
      setArrivalDate(found.arrival_date || found.travel_start_date || "2026-06-10");
      setDepartureDate(found.departure_date || found.travel_end_date || "2026-06-16");
      setManualNights(found.is_manual_nights ? found.nights_count : undefined);
      setManualDays(found.is_manual_days ? found.days_count : undefined);
      setAdultsCount(found.adults_count ?? 4);
      setChildrenCount(found.children_count ?? 1);
      setInfantsCount(found.infants_count ?? 0);
      setManualTotalPax(found.is_manual_pax ? found.total_pax : undefined);

      setSelectedVehicleId(found.vehicle_id || "veh-04");
      setVehicleRatePerKm(found.vehicle_rate_per_km || 140);
      setNumVehicles(found.num_vehicles || 1);
      setAssignedDriverName(found.assigned_driver_name || "");
      setAssignedDriverPhone(found.assigned_driver_phone || "");
      setVehiclePlate(found.vehicle_registration_number || "");
      setPickupDate(found.pickup_date || "2026-06-10");
      setPickupTime(found.pickup_time || "08:30 AM");
      setPickupLocation(found.pickup_location || "Airport");
      setDropoffLocation(found.dropoff_location || "Airport");

      setAccommodationItems(found.accommodation_items || []);
      setTransportDays(found.transport_days || []);
      setMiscItems(found.misc_items || []);

      setCurrency(found.currency || "USD");
      setExchangeRate(found.exchange_rate_lkr_usd || 325);
      setMarkupType(found.markup_type || "fixed");
      setMarkupValue(found.markup_value ?? 20);
      setDiscountAmount(found.discount_amount || 0);
      setTaxPercent(found.tax_percent || 0);

      setManualTotalKM(found.manual_total_km);
      setManualTransportUSD(found.manual_transport_usd);
      setManualMiscTotal(found.manual_misc_total);
      setManualSglPP(found.manual_sgl_pp);
      setManualDblPP(found.manual_dbl_pp);
      setManualTplPP(found.manual_tpl_pp);
      setManualFinalPrice(found.manual_final_price);
      setManualFinalPPRate(found.manual_final_pp_rate);

      if (found.inclusions) setInclusions(found.inclusions);
      if (found.exclusions) setExclusions(found.exclusions);
      if (found.terms_and_conditions) setTerms(found.terms_and_conditions);
      if (found.valid_until) setValidUntil(found.valid_until);
      if (found.notes) setNotes(found.notes);
      if (found.internal_notes) setInternalNotes(found.internal_notes);
    }
  }, [quotationId, isNew]);

  // 2. DYNAMIC CALCULATIONS USING COSTING ENGINE
  const selectedVehicle = useMemo(
    () => vehicles.find((v) => v.id === selectedVehicleId) || vehicles[3] || { seats: 12, per_km_rate: 140, vehicle_name: "Mini Coach" },
    [vehicles, selectedVehicleId]
  );

  const datesResult = useMemo(
    () => calculateTravelDates(arrivalDate, departureDate, manualNights, manualDays),
    [arrivalDate, departureDate, manualNights, manualDays]
  );

  const paxResult = useMemo(
    () => calculatePassengers(adultsCount, childrenCount, infantsCount, manualTotalPax),
    [adultsCount, childrenCount, infantsCount, manualTotalPax]
  );

  const costingSummary = useMemo(() => {
    return calculateFullQuotationCosting({
      accommodationItems,
      transportDays,
      miscItems,
      vehicle: {
        ...selectedVehicle,
        per_km_rate: vehicleRatePerKm,
      } as any,
      numVehicles,
      totalPax: paxResult.totalPax,
      exchangeRateLKRPerUSD: exchangeRate,
      markupType,
      markupValue,
      discountAmount,
      taxPercent,
      currency,
      manualOverrides: {
        sglPP: manualSglPP,
        dblPP: manualDblPP,
        tplPP: manualTplPP,
        totalKM: manualTotalKM,
        transportUSD: manualTransportUSD,
        miscTotal: manualMiscTotal,
        finalSellingPrice: manualFinalPrice,
        finalPPRate: manualFinalPPRate,
      },
    });
  }, [
    accommodationItems,
    transportDays,
    miscItems,
    selectedVehicle,
    vehicleRatePerKm,
    numVehicles,
    paxResult.totalPax,
    exchangeRate,
    markupType,
    markupValue,
    discountAmount,
    taxPercent,
    currency,
    manualSglPP,
    manualDblPP,
    manualTplPP,
    manualTotalKM,
    manualTransportUSD,
    manualMiscTotal,
    manualFinalPrice,
    manualFinalPPRate,
  ]);

  // 3. NON-BLOCKING WARNINGS LIST
  const warnings = useMemo(() => {
    const list: string[] = [];
    if (!clientName) list.push("Customer name is empty (Draft status allowed).");
    if (!clientEmail) list.push("Customer email is missing (You cannot email quotation until email is added).");
    if (!arrivalDate || !departureDate) list.push("Travel dates are incomplete.");
    if (paxResult.totalPax <= 0) list.push("Passenger count is 0.");
    if (costingSummary.capacityWarning) list.push(costingSummary.capacityWarning);
    if (accommodationItems.length === 0) list.push("No hotel accommodation rows added.");
    if (transportDays.length === 0) list.push("No transportation days added.");
    return list;
  }, [clientName, clientEmail, arrivalDate, departureDate, paxResult.totalPax, costingSummary.capacityWarning, accommodationItems.length, transportDays.length]);

  // 4. SAVE QUOTATION FUNCTION
  const handleSaveQuotation = (silent: boolean = false) => {
    setSaveStatus("Saving...");

    const currentQuotation: Quotation = {
      id: quoteId || `qt-${Date.now()}`,
      quote_number: quoteNumber,
      revision_number: revisionNumber,
      revision_label: revisionLabel,
      status,
      client_name: clientName,
      client_email: clientEmail,
      client_phone: clientPhone,
      client_nationality: clientNationality,
      destination,
      tour_name: tourName,
      arrival_date: arrivalDate,
      departure_date: departureDate,
      travel_start_date: arrivalDate,
      travel_end_date: departureDate,
      nights_count: datesResult.nights,
      days_count: datesResult.days,
      is_manual_nights: datesResult.isNightsOverridden,
      is_manual_days: datesResult.isDaysOverridden,
      adults_count: adultsCount,
      children_count: childrenCount,
      infants_count: infantsCount,
      total_pax: paxResult.totalPax,
      is_manual_pax: paxResult.isPaxOverridden,

      vehicle_id: selectedVehicleId,
      vehicle_name: selectedVehicle.vehicle_name,
      vehicle_class: selectedVehicle.vehicle_class as string,
      vehicle_capacity: selectedVehicle.seats,
      vehicle_rate_per_km: vehicleRatePerKm,
      num_vehicles: numVehicles,
      assigned_driver_name: assignedDriverName,
      assigned_driver_phone: assignedDriverPhone,
      vehicle_registration_number: vehiclePlate,
      pickup_date: pickupDate,
      pickup_time: pickupTime,
      pickup_location: pickupLocation,
      dropoff_location: dropoffLocation,

      accommodation_items: accommodationItems,
      transport_days: transportDays,
      misc_items: miscItems,

      currency,
      exchange_rate_lkr_usd: exchangeRate,
      markup_type: markupType,
      markup_value: markupValue,
      discount_amount: discountAmount,
      tax_percent: taxPercent,

      manual_total_km: manualTotalKM,
      manual_transport_usd: manualTransportUSD,
      manual_misc_total: manualMiscTotal,
      manual_sgl_pp: manualSglPP,
      manual_dbl_pp: manualDblPP,
      manual_tpl_pp: manualTplPP,
      manual_final_price: manualFinalPrice,
      manual_final_pp_rate: manualFinalPPRate,

      costing_summary: costingSummary,

      pricing_options: [
        { pricing_type: "DBL PP", pax_label: "Per Person (Double Sharing)", amount: costingSummary.dblSellingPP, currency },
        { pricing_type: "TPL PP", pax_label: "Per Person (Triple Sharing)", amount: costingSummary.tplSellingPP, currency },
        { pricing_type: "Total Group", pax_label: `Total Group (${paxResult.totalPax} Pax)`, amount: costingSummary.finalSellingPrice, currency },
      ],
      total_amount: costingSummary.finalSellingPrice,
      selling_pp_rate: costingSummary.finalPPRate,

      inclusions,
      exclusions,
      terms_and_conditions: terms,
      valid_until: validUntil,
      notes,
      internal_notes: internalNotes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    crmStore.addQuotation(currentQuotation);
    setSaveStatus("Saved");
    setLastSavedAt(new Date().toLocaleTimeString());

    if (!silent) {
      showToast(`Quotation ${quoteNumber} saved successfully!`, "success");
    }
  };

  // Auto-Save Effect when values change
  useEffect(() => {
    setSaveStatus("Unsaved changes");
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);

    autoSaveTimerRef.current = setTimeout(() => {
      handleSaveQuotation(true);
    }, 2500);

    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [
    clientName,
    clientEmail,
    clientPhone,
    tourName,
    arrivalDate,
    departureDate,
    manualNights,
    manualDays,
    adultsCount,
    childrenCount,
    infantsCount,
    manualTotalPax,
    selectedVehicleId,
    vehicleRatePerKm,
    numVehicles,
    accommodationItems,
    transportDays,
    miscItems,
    markupType,
    markupValue,
    discountAmount,
    taxPercent,
    currency,
    exchangeRate,
    manualTotalKM,
    manualFinalPrice,
    status,
  ]);

  // 5. CREATE REVISION HANDLER
  const handleCreateRevision = () => {
    if (!quoteId) return;
    const revised = crmStore.createQuotationRevision(quoteId, revisionNotesInput || `Revision created on ${new Date().toLocaleDateString()}`);
    if (revised) {
      setRevisionNumber(revised.revision_number);
      setRevisionLabel(revised.revision_label);
      setIsRevisionModalOpen(false);
      setRevisionNotesInput("");
      showToast(`Created new revision: ${quoteNumber} (${revised.revision_label})`, "success");
    }
  };

  // 6. CONVERT TO VOUCHER HANDLER
  const handleConvertToVoucher = () => {
    // Generate tour and vouchers
    const newTourRef = quoteNumber;
    const generatedTour: any = {
      id: `tour-${Date.now()}`,
      tour_number: newTourRef,
      tour_reference: newTourRef,
      tour_name: tourName || "Confirmed Tour",
      client_name: clientName || "Guest",
      pax: paxResult.totalPax,
      arrival_date: arrivalDate,
      departure_date: departureDate,
      start_date: arrivalDate,
      end_date: departureDate,
      days_count: datesResult.days,
      nights_count: datesResult.nights,
      status: "Confirmed",
      accommodation_rows: accommodationItems.map((a) => ({
        id: a.id,
        date: a.date || "",
        hotel: a.hotel_name,
        mealPlan: a.meal_plan || "HB",
        sgl: a.sgl_rooms || 0,
        dbl: a.dbl_rooms || 0,
        tpl: a.tpl_rooms || 0,
      })),
      transportation_rows: transportDays.map((t) => ({
        id: t.id,
        day: t.day_label,
        route: t.route,
        km: t.km,
      })),
      miscellaneous_rows: miscItems.map((m) => ({
        id: m.id,
        item: m.item,
        qty_value: m.qty,
      })),
      notes: `Generated from Quotation ${quoteNumber} (${revisionLabel})`,
    };

    crmStore.addTour(generatedTour);
    setStatus("Accepted");
    handleSaveQuotation(true);
    showToast(`Quotation ${quoteNumber} confirmed and converted to Tour Workspace & Vouchers!`, "success");
    router.push(`/tours/${generatedTour.id}`);
  };

  // 7. DISPATCH QUOTATION EMAIL HANDLER
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailTo) {
      showToast("Customer email address is required to dispatch quotation.", "warning");
      return;
    }

    setIsSendingEmail(true);
    try {
      // Build Customer Proposal PDF
      const currentQuotation: any = {
        quote_number: quoteNumber,
        revision_number: revisionNumber,
        revision_label: revisionLabel,
        client_name: clientName,
        client_email: clientEmail,
        client_phone: clientPhone,
        client_nationality: clientNationality,
        tour_name: tourName,
        arrival_date: arrivalDate,
        departure_date: departureDate,
        days_count: datesResult.days,
        nights_count: datesResult.nights,
        total_pax: paxResult.totalPax,
        adults_count: adultsCount,
        children_count: childrenCount,
        vehicle_name: selectedVehicle.vehicle_name,
        accommodation_items: accommodationItems,
        inclusions,
        exclusions,
        terms_and_conditions: terms,
        valid_until: validUntil,
        costing_summary: costingSummary,
        currency,
        total_amount: costingSummary.finalSellingPrice,
        selling_pp_rate: costingSummary.finalPPRate,
      };

      const doc = buildQuotationCustomerPDFDoc(currentQuotation);
      const pdfBase64 = doc.output("datauristring").split(",")[1];

      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: emailTo,
          subject: emailSubject || `Tour Proposal & Quotation ${quoteNumber} – Dodoz Leisure`,
          text: emailBody || `Dear ${clientName || "Valued Guest"},\n\nPlease find attached your official Dodoz Leisure tour proposal and quotation (${quoteNumber}).`,
          attachments: [
            {
              filename: `Quotation_${quoteNumber}.pdf`,
              content: pdfBase64,
              contentType: "application/pdf",
            },
          ],
        }),
      });

      setStatus("Sent");
      handleSaveQuotation(true);
      setIsEmailModalOpen(false);
      showToast(`Quotation ${quoteNumber} dispatched to ${emailTo}!`, "success");
    } catch (err: any) {
      showToast(`Email error: ${err.message || "Failed to dispatch email."}`, "error");
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Helper to add accommodation row
  const addAccommodationRow = () => {
    const nextNight = accommodationItems.length + 1;
    const newRow: QuotationAccommodationItem = {
      id: `acc-${Date.now()}`,
      date: "",
      night_number: nextNight,
      hotel_name: "EARLS REGENT",
      city: "Kandy",
      meal_plan: "HB",
      sgl_rooms: 0,
      sgl_rate: 0,
      dbl_rooms: 1,
      dbl_rate: 80,
      tpl_rooms: 0,
      tpl_rate: 0,
      nights_count: 1,
    };
    setAccommodationItems([...accommodationItems, newRow]);
  };

  // Helper to add transport day
  const addTransportDay = () => {
    const nextDayNum = transportDays.length + 1;
    const newDay: QuotationTransportDay = {
      id: `tr-${Date.now()}`,
      day_number: nextDayNum,
      day_label: `DAY ${nextDayNum}`,
      route: "Sightseeing & Excursions",
      km: 100,
    };
    setTransportDays([...transportDays, newDay]);
  };

  // Helper to add misc item
  const addMiscItem = () => {
    const newMisc: QuotationMiscItem = {
      id: `m-${Date.now()}`,
      item: "NEW ENTRANCE TICKET",
      category: "Entrance Fee",
      unit: "Per Person",
      qty: 1,
      rate: 10,
      is_per_person: true,
    };
    setMiscItems([...miscItems, newMisc]);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 1. TOP HEADER & WORKSPACE COMMAND BAR */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-soft">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-navy-950 text-white font-mono shadow-xs">
                {quoteNumber}
              </span>
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-brand-50 text-brand-700 border border-brand-200">
                {revisionLabel}
              </span>
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                <span
                  className={`w-2 h-2 rounded-full ${
                    saveStatus === "Saved"
                      ? "bg-emerald-500"
                      : saveStatus === "Saving..."
                      ? "bg-amber-500 animate-pulse"
                      : "bg-blue-500"
                  }`}
                />
                <span className="text-[11px]">{saveStatus} {lastSavedAt ? `(${lastSavedAt})` : ""}</span>
              </div>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-navy-950 font-display tracking-tight mt-1.5 flex items-center gap-2">
              <span>{tourName || "New Tour Quotation & Costing Proposal"}</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Integrated Excel Costing Matrix • Dynamic Supplier Rates • No Mandatory Field Blocking
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => handleSaveQuotation(false)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Draft</span>
            </button>

            <button
              type="button"
              onClick={() => setIsRevisionModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold transition-all border border-purple-200/60"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Revise (Rev {revisionNumber + 1})</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCustomerPreviewOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-all border border-blue-200/60"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Customer PDF</span>
            </button>

            <button
              type="button"
              onClick={() => setIsInternalPreviewOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold transition-all border border-amber-200/60"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Internal Costing</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setEmailTo(clientEmail);
                setEmailSubject(`Tour Proposal & Quotation ${quoteNumber} – Dodoz Leisure`);
                setEmailBody(`Dear ${clientName || "Valued Guest"},\n\nWe are delighted to present your customized Sri Lanka tour proposal and quotation (${quoteNumber}).\n\nTotal Package: $${costingSummary.finalSellingPrice.toLocaleString()} ${currency}\nDuration: ${datesResult.days} Days / ${datesResult.nights} Nights\nPassengers: ${paxResult.totalPax} Guests\n\nPlease find the attached official proposal document for your review.`);
                setIsEmailModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-xs transition-all"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email Quote</span>
            </button>

            <button
              type="button"
              onClick={handleConvertToVoucher}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-navy-950 hover:bg-navy-900 text-white text-xs font-bold shadow-xs transition-all"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Confirm & Create Voucher</span>
            </button>
          </div>
        </div>

        {/* 2. NON-BLOCKING WARNINGS RIBBON */}
        {warnings.length > 0 && (
          <div className="mt-4 p-3 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs">
            <div className="flex items-center gap-2 font-bold mb-1">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>Draft Guidance Notices ({warnings.length}):</span>
              <span className="text-[10px] font-normal text-amber-700 opacity-80">(Draft saving is never blocked)</span>
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-1 text-[11px] text-amber-800 ml-6 list-disc">
              {warnings.map((w, idx) => (
                <li key={idx}>{w}</li>
              ))}
            </ul>
          </div>
        )}

        {/* 3. LIVE FINANCIAL MATRIX KPI RIBBON */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-4 pt-4 border-t border-slate-100">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Accom Cost</span>
            <div className="text-base font-extrabold text-navy-950 font-mono mt-0.5">
              ${costingSummary.accommodationTotal.toFixed(2)}
            </div>
            <span className="text-[10px] text-slate-500 font-medium">DBL: ${costingSummary.dblCostPP.toFixed(1)}/pp</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Transport Cost</span>
            <div className="text-base font-extrabold text-navy-950 font-mono mt-0.5">
              ${costingSummary.transportTotalUSD.toFixed(2)}
            </div>
            <span className="text-[10px] text-slate-500 font-medium">{costingSummary.totalKM} KM • ${costingSummary.transportCostPP.toFixed(1)}/pp</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Misc / Tickets</span>
            <div className="text-base font-extrabold text-navy-950 font-mono mt-0.5">
              ${costingSummary.miscTotal.toFixed(2)}
            </div>
            <span className="text-[10px] text-slate-500 font-medium">${costingSummary.miscCostPP.toFixed(1)}/pp</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Markup Applied</span>
            <div className="text-base font-extrabold text-brand-600 font-mono mt-0.5">
              +${costingSummary.totalMarkupAmount.toFixed(2)}
            </div>
            <span className="text-[10px] text-brand-700 font-bold">
              {markupType === "fixed" ? `$${markupValue} / Pax` : `${markupValue}%`}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-navy-950 text-white shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Total Selling Price</span>
            <div className="text-lg font-black text-white font-mono mt-0.5">
              ${costingSummary.finalSellingPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-emerald-400 font-bold">
              ${costingSummary.finalPPRate.toFixed(2)} / Pax
            </span>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Gross Profit</span>
            <div className="text-base font-extrabold text-emerald-800 font-mono mt-0.5">
              ${costingSummary.grossProfit.toFixed(2)}
            </div>
            <span className="text-[10px] text-emerald-700 font-black">
              Margin: {costingSummary.grossMarginPercent.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* 4. WORKSPACE TAB NAVIGATION */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        {[
          { id: "overview", label: "1. Overview & Customer", icon: Users },
          { id: "accommodation", label: "2. Hotel Accommodation", icon: Package },
          { id: "transport", label: "3. Transportation & KM", icon: Car },
          { id: "misc", label: "4. Misc & Entrance Fees", icon: Compass },
          { id: "costing", label: "5. Costing & Margins (Internal)", icon: Calculator },
          { id: "preview", label: "6. Customer Proposal Preview", icon: Eye },
          { id: "history", label: "7. Revisions & History", icon: RotateCcw },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? "bg-navy-950 text-white shadow-soft"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: OVERVIEW & CUSTOMER DETAILS                                        */}
      {/* ========================================================================= */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Customer & Lead Info */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-soft space-y-4">
            <h2 className="text-base font-extrabold text-navy-950 flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-600" />
              <span>Client & Passenger Details (Non-Mandatory)</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Customer / Group Name</label>
                <input
                  type="text"
                  placeholder="e.g. Mr. Rajan Patel & Family"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Customer Email</label>
                <input
                  type="email"
                  placeholder="e.g. rajan.patel@globaltech.in"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Phone / WhatsApp</label>
                <input
                  type="text"
                  placeholder="e.g. +91 98765 43210"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Client Nationality</label>
                <input
                  type="text"
                  placeholder="e.g. Indian / Australian"
                  value={clientNationality}
                  onChange={(e) => setClientNationality(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Tour Package Title</label>
                <input
                  type="text"
                  placeholder="e.g. 7-Day Classical Sri Lanka & Scenic Highlands"
                  value={tourName}
                  onChange={(e) => setTourName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Passenger Count Breakdown */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-extrabold text-navy-950">Passenger Breakdown:</span>
                {paxResult.isPaxOverridden && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300">
                    Manual Total Override
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Adults</label>
                  <input
                    type="number"
                    min="0"
                    value={adultsCount}
                    onChange={(e) => setAdultsCount(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Children</label>
                  <input
                    type="number"
                    min="0"
                    value={childrenCount}
                    onChange={(e) => setChildrenCount(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Infants</label>
                  <input
                    type="number"
                    min="0"
                    value={infantsCount}
                    onChange={(e) => setInfantsCount(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="text-xs font-bold text-slate-700">Total Group Size:</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-navy-950">{paxResult.totalPax} Passengers</span>
                  <button
                    type="button"
                    onClick={() => {
                      const override = prompt("Enter manual passenger count override (or blank to reset):", String(paxResult.totalPax));
                      if (override === null) return;
                      const num = parseInt(override);
                      setManualTotalPax(isNaN(num) ? undefined : num);
                    }}
                    className="text-[10px] text-brand-600 hover:underline font-bold"
                  >
                    {paxResult.isPaxOverridden ? "Reset" : "Override"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Travel Dates & Duration */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-soft space-y-4">
            <h2 className="text-base font-extrabold text-navy-950 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-600" />
              <span>Travel Dates & Automatic Duration Engine</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Arrival Date</label>
                <input
                  type="date"
                  value={arrivalDate}
                  onChange={(e) => setArrivalDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Departure Date</label>
                <input
                  type="date"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                />
              </div>
            </div>

            {/* Duration Display with Override Badges */}
            <div className="p-4 rounded-2xl bg-brand-50/50 border border-brand-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-brand-950">Calculated Program Duration:</span>
                <div className="flex items-center gap-2">
                  {datesResult.isNightsOverridden && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300">
                      Manual Nights
                    </span>
                  )}
                  {datesResult.isDaysOverridden && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300">
                      Manual Days
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-white rounded-xl border border-brand-100 shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Nights Count</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-lg font-black text-navy-950">{datesResult.nights} Nights</span>
                    <button
                      type="button"
                      onClick={() => {
                        const val = prompt("Enter manual nights count (or leave blank to auto-calculate):", String(datesResult.nights));
                        if (val === null) return;
                        const num = parseInt(val);
                        setManualNights(isNaN(num) ? undefined : num);
                      }}
                      className="text-[10px] text-brand-600 hover:underline font-bold"
                    >
                      {datesResult.isNightsOverridden ? "Reset" : "Override"}
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-brand-100 shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Days Count</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-lg font-black text-navy-950">{datesResult.days} Days</span>
                    <button
                      type="button"
                      onClick={() => {
                        const val = prompt("Enter manual days count (or leave blank to auto-calculate):", String(datesResult.days));
                        if (val === null) return;
                        const num = parseInt(val);
                        setManualDays(isNaN(num) ? undefined : num);
                      }}
                      className="text-[10px] text-brand-600 hover:underline font-bold"
                    >
                      {datesResult.isDaysOverridden ? "Reset" : "Override"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Status & Validity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Quotation Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                >
                  <option value="Draft">Draft</option>
                  <option value="Approved">Ready for Client</option>
                  <option value="Sent">Sent to Client</option>
                  <option value="Accepted">Accepted & Confirmed</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Proposal Valid Until</label>
                <input
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: HOTEL ACCOMMODATION (EXCEL REPLICA: SGL, DBL, TPL MULTIPLIERS)     */}
      {/* ========================================================================= */}
      {activeTab === "accommodation" && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-soft space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-extrabold text-navy-950 flex items-center gap-2">
                <Package className="w-4 h-4 text-brand-600" />
                <span>Hotel Accommodation Schedule (Excel Logic: SGL / DBL / TPL Multipliers)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Calculate total accommodation and Per-Person rates (SGL / 1, DBL / 2, TPL / 3).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsQuickAddHotelOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Hotel to Master</span>
              </button>

              <button
                type="button"
                onClick={addAccommodationRow}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Night Row</span>
              </button>
            </div>
          </div>

          {/* Accommodation Table */}
          <div className="overflow-x-auto border border-slate-200/80 rounded-2xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-navy-950 text-white text-[11px] font-bold">
                <tr>
                  <th className="p-3 text-center w-12">#</th>
                  <th className="p-3 w-28">Date / Night</th>
                  <th className="p-3">Hotel Property (Autocomplete)</th>
                  <th className="p-3 w-24">Meal Plan</th>
                  <th className="p-3 text-center w-16 bg-navy-900">SGL Rms</th>
                  <th className="p-3 text-right w-20 bg-navy-900">SGL Rate</th>
                  <th className="p-3 text-center w-16 bg-navy-800">DBL Rms</th>
                  <th className="p-3 text-right w-20 bg-navy-800">DBL Rate</th>
                  <th className="p-3 text-center w-16 bg-navy-900">TPL Rms</th>
                  <th className="p-3 text-right w-20 bg-navy-900">TPL Rate</th>
                  <th className="p-3 text-right w-24">Row Total</th>
                  <th className="p-3 text-center w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {accommodationItems.map((item, idx) => {
                  const sglCost = (item.sgl_rooms || 0) * (item.sgl_rate || 0);
                  const dblCost = (item.dbl_rooms || 0) * (item.dbl_rate || 0);
                  const tplCost = (item.tpl_rooms || 0) * (item.tpl_rate || 0);
                  const rowTotal = sglCost + dblCost + tplCost;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-2.5 text-center font-bold text-slate-400">{idx + 1}</td>

                      {/* Date */}
                      <td className="p-2.5">
                        <input
                          type="text"
                          value={item.date || `Night ${idx + 1}`}
                          onChange={(e) => {
                            const val = e.target.value;
                            setAccommodationItems(
                              accommodationItems.map((a, i) => (i === idx ? { ...a, date: val } : a))
                            );
                          }}
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-medium"
                        />
                      </td>

                      {/* Hotel Name with Autocomplete */}
                      <td className="p-2.5 relative">
                        <input
                          type="text"
                          value={item.hotel_name}
                          onChange={(e) => {
                            const val = e.target.value;
                            setAccommodationItems(
                              accommodationItems.map((a, i) => (i === idx ? { ...a, hotel_name: val } : a))
                            );
                            setActiveHotelSearchRowIndex(idx);
                            setHotelSearchQuery(val);
                          }}
                          onFocus={() => {
                            setActiveHotelSearchRowIndex(idx);
                            setHotelSearchQuery(item.hotel_name);
                          }}
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-navy-950 focus:ring-2 focus:ring-brand-500"
                        />

                        {/* Autocomplete Dropdown */}
                        {activeHotelSearchRowIndex === idx && hotelSearchQuery.length > 0 && (
                          <div className="absolute top-full left-0 z-50 w-64 bg-white rounded-xl border border-slate-200 shadow-xl max-h-48 overflow-y-auto mt-1 p-1">
                            {knownHotels
                              .filter((h) => h.hotel_name.toLowerCase().includes(hotelSearchQuery.toLowerCase()))
                              .map((h) => (
                                <button
                                  key={h.id}
                                  type="button"
                                  onClick={() => {
                                    setAccommodationItems(
                                      accommodationItems.map((a, i) => (i === idx ? { ...a, hotel_name: h.hotel_name, city: h.city } : a))
                                    );
                                    setActiveHotelSearchRowIndex(null);
                                  }}
                                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-brand-50 text-xs font-bold text-slate-800 flex items-center justify-between"
                                >
                                  <span>{h.hotel_name}</span>
                                  <span className="text-[10px] text-slate-400">{h.city}</span>
                                </button>
                              ))}
                          </div>
                        )}
                      </td>

                      {/* Meal Plan */}
                      <td className="p-2.5">
                        <select
                          value={item.meal_plan || "HB"}
                          onChange={(e) => {
                            const val = e.target.value;
                            setAccommodationItems(
                              accommodationItems.map((a, i) => (i === idx ? { ...a, meal_plan: val } : a))
                            );
                          }}
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-brand-700"
                        >
                          <option value="RO">RO (Room Only)</option>
                          <option value="BB">BB (Breakfast)</option>
                          <option value="HB">HB (Half Board)</option>
                          <option value="FB">FB (Full Board)</option>
                          <option value="AI">AI (All Inclusive)</option>
                        </select>
                      </td>

                      {/* SGL Rooms & Rate */}
                      <td className="p-2.5 bg-slate-50/50">
                        <input
                          type="number"
                          min="0"
                          value={item.sgl_rooms || ""}
                          placeholder="0"
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            setAccommodationItems(
                              accommodationItems.map((a, i) => (i === idx ? { ...a, sgl_rooms: val } : a))
                            );
                          }}
                          className="w-full text-center px-1 py-1.5 rounded-lg border border-slate-200 text-xs font-mono"
                        />
                      </td>
                      <td className="p-2.5 bg-slate-50/50">
                        <input
                          type="number"
                          min="0"
                          value={item.sgl_rate || ""}
                          placeholder="0"
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setAccommodationItems(
                              accommodationItems.map((a, i) => (i === idx ? { ...a, sgl_rate: val } : a))
                            );
                          }}
                          className="w-full text-right px-1 py-1.5 rounded-lg border border-slate-200 text-xs font-mono"
                        />
                      </td>

                      {/* DBL Rooms & Rate */}
                      <td className="p-2.5 bg-blue-50/30">
                        <input
                          type="number"
                          min="0"
                          value={item.dbl_rooms || ""}
                          placeholder="0"
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            setAccommodationItems(
                              accommodationItems.map((a, i) => (i === idx ? { ...a, dbl_rooms: val } : a))
                            );
                          }}
                          className="w-full text-center px-1 py-1.5 rounded-lg border border-blue-200 text-xs font-bold text-navy-950 font-mono"
                        />
                      </td>
                      <td className="p-2.5 bg-blue-50/30">
                        <input
                          type="number"
                          min="0"
                          value={item.dbl_rate || ""}
                          placeholder="0"
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setAccommodationItems(
                              accommodationItems.map((a, i) => (i === idx ? { ...a, dbl_rate: val } : a))
                            );
                          }}
                          className="w-full text-right px-1 py-1.5 rounded-lg border border-blue-200 text-xs font-bold text-navy-950 font-mono"
                        />
                      </td>

                      {/* TPL Rooms & Rate */}
                      <td className="p-2.5 bg-slate-50/50">
                        <input
                          type="number"
                          min="0"
                          value={item.tpl_rooms || ""}
                          placeholder="0"
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            setAccommodationItems(
                              accommodationItems.map((a, i) => (i === idx ? { ...a, tpl_rooms: val } : a))
                            );
                          }}
                          className="w-full text-center px-1 py-1.5 rounded-lg border border-slate-200 text-xs font-mono"
                        />
                      </td>
                      <td className="p-2.5 bg-slate-50/50">
                        <input
                          type="number"
                          min="0"
                          value={item.tpl_rate || ""}
                          placeholder="0"
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setAccommodationItems(
                              accommodationItems.map((a, i) => (i === idx ? { ...a, tpl_rate: val } : a))
                            );
                          }}
                          className="w-full text-right px-1 py-1.5 rounded-lg border border-slate-200 text-xs font-mono"
                        />
                      </td>

                      {/* Row Total */}
                      <td className="p-2.5 text-right font-black text-navy-950 font-mono">
                        ${rowTotal.toFixed(2)}
                      </td>

                      {/* Delete */}
                      <td className="p-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setAccommodationItems(accommodationItems.filter((_, i) => i !== idx));
                          }}
                          className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Accommodation PP Summary Bar (Excel Rows 21-26) */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Accommodation</span>
              <div className="text-lg font-black text-navy-950 font-mono mt-0.5">
                ${costingSummary.accommodationTotal.toFixed(2)}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200/80">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">DBL PP (Total / 2)</span>
                {manualDblPP !== undefined && (
                  <span className="text-[9px] font-bold px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded">Manual</span>
                )}
              </div>
              <div className="text-lg font-black text-blue-950 font-mono mt-0.5">
                ${costingSummary.dblCostPP.toFixed(2)}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">TPL PP (Total / 3)</span>
                {manualTplPP !== undefined && (
                  <span className="text-[9px] font-bold px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded">Manual</span>
                )}
              </div>
              <div className="text-lg font-black text-slate-900 font-mono mt-0.5">
                ${costingSummary.tplCostPP.toFixed(2)}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">SGL PP (Total / 1)</span>
              <div className="text-lg font-black text-slate-900 font-mono mt-0.5">
                ${costingSummary.sglCostPP.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: TRANSPORTATION & KM (EXCEL REPLICA: KM × Rate + Driver Allowances) */}
      {/* ========================================================================= */}
      {activeTab === "transport" && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-soft space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-extrabold text-navy-950 flex items-center gap-2">
                <Car className="w-4 h-4 text-emerald-600" />
                <span>Vehicle Fleet & Daily Route Costing (Excel Logic: KM × Rate + Driver Allowances)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Calculate total route KM, driver batta, guide fees, highway tolls, and convert LKR to USD.
              </p>
            </div>

            <button
              type="button"
              onClick={addTransportDay}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Transport Day</span>
            </button>
          </div>

          {/* Vehicle Selection & Fleet Config */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Select Vehicle Type</label>
              <select
                value={selectedVehicleId}
                onChange={(e) => {
                  const id = e.target.value;
                  setSelectedVehicleId(id);
                  const v = vehicles.find((veh) => veh.id === id);
                  if (v) setVehicleRatePerKm(v.per_km_rate);
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
              >
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.vehicle_name} ({v.seats} Seats) — LKR {v.per_km_rate}/KM
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Vehicle Rate (LKR / KM)</label>
              <input
                type="number"
                value={vehicleRatePerKm}
                onChange={(e) => setVehicleRatePerKm(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Number of Vehicles</label>
              <input
                type="number"
                min="1"
                value={numVehicles}
                onChange={(e) => setNumVehicles(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">LKR to USD Exchange Rate</label>
              <input
                type="number"
                value={exchangeRate}
                onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 325)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-brand-700"
              />
            </div>
          </div>

          {/* Daily Transport Routes Table */}
          <div className="overflow-x-auto border border-slate-200/80 rounded-2xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-900 text-white text-[11px] font-bold">
                <tr>
                  <th className="p-3 text-center w-12">#</th>
                  <th className="p-3 w-28">Day Label</th>
                  <th className="p-3">Route Itinerary Description</th>
                  <th className="p-3 text-right w-24">Route KM</th>
                  <th className="p-3 text-center w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transportDays.map((t, idx) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-2.5 text-center font-bold text-slate-400">{idx + 1}</td>
                    <td className="p-2.5">
                      <input
                        type="text"
                        value={t.day_label || `DAY ${idx + 1}`}
                        onChange={(e) => {
                          const val = e.target.value;
                          setTransportDays(transportDays.map((item, i) => (i === idx ? { ...item, day_label: val } : item)));
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-navy-950"
                      />
                    </td>
                    <td className="p-2.5">
                      <input
                        type="text"
                        value={t.route}
                        placeholder="e.g. Airport → Pinnawela → Kandy"
                        onChange={(e) => {
                          const val = e.target.value;
                          setTransportDays(transportDays.map((item, i) => (i === idx ? { ...item, route: val } : item)));
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium"
                      />
                    </td>
                    <td className="p-2.5">
                      <input
                        type="number"
                        min="0"
                        value={t.km || ""}
                        placeholder="0"
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setTransportDays(transportDays.map((item, i) => (i === idx ? { ...item, km: val } : item)));
                        }}
                        className="w-full text-right px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-mono font-bold text-emerald-800"
                      />
                    </td>
                    <td className="p-2.5 text-center">
                      <button
                        type="button"
                        onClick={() => setTransportDays(transportDays.filter((_, i) => i !== idx))}
                        className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Transport Total & LKR-to-USD Cost Bar (Excel Rows 26-37) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Route KM</span>
                {manualTotalKM !== undefined && (
                  <span className="text-[9px] font-bold px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded">Manual</span>
                )}
              </div>
              <div className="flex items-center justify-between mt-0.5">
                <span className="text-lg font-black text-navy-950 font-mono">{costingSummary.totalKM} KM</span>
                <button
                  type="button"
                  onClick={() => {
                    const val = prompt("Enter manual total KM override:", String(costingSummary.totalKM));
                    if (val === null) return;
                    const num = parseFloat(val);
                    setManualTotalKM(isNaN(num) ? undefined : num);
                  }}
                  className="text-[10px] text-brand-600 hover:underline font-bold"
                >
                  {manualTotalKM !== undefined ? "Reset" : "Override"}
                </button>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total LKR Transport Cost</span>
              <div className="text-lg font-black text-navy-950 font-mono mt-0.5">
                LKR {(costingSummary.transportTotalLKR || 0).toLocaleString()}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Total Transport in USD</span>
              <div className="text-lg font-black text-emerald-950 font-mono mt-0.5">
                ${costingSummary.transportTotalUSD.toFixed(2)}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Transport PP Rate</span>
              <div className="text-lg font-black text-emerald-950 font-mono mt-0.5">
                ${costingSummary.transportCostPP.toFixed(2)} / Pax
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: MISCELLANEOUS & ENTRANCE FEES (EXCEL REPLICA: WATER, JEEP, BOATS...)*/}
      {/* ========================================================================= */}
      {activeTab === "misc" && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-soft space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-extrabold text-navy-950 flex items-center gap-2">
                <Compass className="w-4 h-4 text-purple-600" />
                <span>Miscellaneous Costs & Entrance Tickets (Excel Logic: Water, Boats, Temples)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Support unlimited entrance tickets, safari jeeps, boat rides, meals, and driver allowances.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  // Add common master template
                  const defaults = miscMaster.slice(0, 5).map((m) => ({
                    id: `m-${Date.now()}-${m.id}`,
                    item: m.name,
                    category: m.category,
                    unit: m.unit,
                    qty: 1,
                    rate: m.default_rate,
                    is_per_person: m.is_per_person,
                  }));
                  setMiscItems([...miscItems, ...defaults]);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span>Load Master Defaults</span>
              </button>

              <button
                type="button"
                onClick={addMiscItem}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>
          </div>

          {/* Misc Table */}
          <div className="overflow-x-auto border border-slate-200/80 rounded-2xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-purple-950 text-white text-[11px] font-bold">
                <tr>
                  <th className="p-3 text-center w-12">#</th>
                  <th className="p-3">Item Description</th>
                  <th className="p-3 w-32">Category</th>
                  <th className="p-3 w-28">Basis</th>
                  <th className="p-3 text-center w-16">Qty</th>
                  <th className="p-3 text-right w-24">Rate (USD)</th>
                  <th className="p-3 text-right w-28">Total Group Cost</th>
                  <th className="p-3 text-center w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {miscItems.map((m, idx) => {
                  const isPP = m.is_per_person !== false;
                  const rowCost = isPP ? (m.rate || 0) * (m.qty || 1) * paxResult.totalPax : (m.rate || 0) * (m.qty || 1);

                  return (
                    <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-2.5 text-center font-bold text-slate-400">{idx + 1}</td>

                      <td className="p-2.5">
                        <input
                          type="text"
                          value={m.item}
                          onChange={(e) => {
                            const val = e.target.value;
                            setMiscItems(miscItems.map((item, i) => (i === idx ? { ...item, item: val } : item)));
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-navy-950"
                        />
                      </td>

                      <td className="p-2.5">
                        <select
                          value={m.category || "Entrance Fee"}
                          onChange={(e) => {
                            const val = e.target.value as any;
                            setMiscItems(miscItems.map((item, i) => (i === idx ? { ...item, category: val } : item)));
                          }}
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold"
                        >
                          <option value="Entrance Fee">Entrance Fee</option>
                          <option value="Activity">Activity / Safari</option>
                          <option value="Meal">Meal / Water</option>
                          <option value="Ticket">Ticket / Toll</option>
                          <option value="Vehicle">Vehicle / Jeep</option>
                          <option value="Driver">Driver</option>
                          <option value="Guide">Guide</option>
                          <option value="Other">Other</option>
                        </select>
                      </td>

                      <td className="p-2.5">
                        <select
                          value={m.is_per_person !== false ? "pp" : "group"}
                          onChange={(e) => {
                            const isPP = e.target.value === "pp";
                            setMiscItems(miscItems.map((item, i) => (i === idx ? { ...item, is_per_person: isPP } : item)));
                          }}
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-purple-700"
                        >
                          <option value="pp">Per Person</option>
                          <option value="group">Fixed Group</option>
                        </select>
                      </td>

                      <td className="p-2.5">
                        <input
                          type="number"
                          min="1"
                          value={m.qty || 1}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 1;
                            setMiscItems(miscItems.map((item, i) => (i === idx ? { ...item, qty: val } : item)));
                          }}
                          className="w-full text-center px-1.5 py-1.5 rounded-lg border border-slate-200 text-xs font-mono font-bold"
                        />
                      </td>

                      <td className="p-2.5">
                        <input
                          type="number"
                          min="0"
                          value={m.rate || ""}
                          placeholder="0"
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setMiscItems(miscItems.map((item, i) => (i === idx ? { ...item, rate: val } : item)));
                          }}
                          className="w-full text-right px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-mono font-bold"
                        />
                      </td>

                      <td className="p-2.5 text-right font-black text-navy-950 font-mono">
                        ${rowCost.toFixed(2)}
                      </td>

                      <td className="p-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => setMiscItems(miscItems.filter((_, i) => i !== idx))}
                          className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Misc Totals Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700">Total Group Misc Cost</span>
              <div className="text-lg font-black text-purple-950 font-mono mt-0.5">
                ${costingSummary.miscTotal.toFixed(2)}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700">Misc PP Rate</span>
              <div className="text-lg font-black text-purple-950 font-mono mt-0.5">
                ${costingSummary.miscCostPP.toFixed(2)} / Pax
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: INTERNAL COSTING & PROFIT MATRIX (FULL EXCEL REPLICA)              */}
      {/* ========================================================================= */}
      {activeTab === "costing" && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-soft space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-700 border border-red-200">
                  Strictly Confidential
                </span>
                <span className="text-xs text-slate-400 font-bold">Internal Agency Financial Matrix</span>
              </div>
              <h2 className="text-base sm:text-lg font-extrabold text-navy-950 font-display mt-1">
                Dodoz Leisure Cost of Sales & Margin Reconciliation
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setIsInternalPreviewOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Internal Costing Sheet (PDF)</span>
            </button>
          </div>

          {/* Excel Reconciliation Matrix Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Column 1: Cost of Sales */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider block border-b border-slate-200 pb-2">
                1. Cost of Sales (Direct)
              </span>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">Total Accommodation:</span>
                  <span className="font-mono font-bold text-navy-950">${costingSummary.accommodationTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Total Transportation:</span>
                  <span className="font-mono font-bold text-navy-950">${costingSummary.transportTotalUSD.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Total Misc / Tickets:</span>
                  <span className="font-mono font-bold text-navy-950">${costingSummary.miscTotal.toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between font-extrabold">
                  <span className="text-navy-950">Net Cost Subtotal:</span>
                  <span className="font-mono text-brand-600">${costingSummary.netCostSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Net Cost PP ({paxResult.totalPax} Pax):</span>
                  <span className="font-mono">${costingSummary.netCostPP.toFixed(2)} / Pax</span>
                </div>
              </div>
            </div>

            {/* Column 2: Markup & Profit */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider block border-b border-slate-200 pb-2">
                2. Markup & Margins
              </span>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Markup Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setMarkupType("fixed")}
                      className={`px-2 py-1.5 rounded-lg text-xs font-bold ${
                        markupType === "fixed" ? "bg-navy-950 text-white" : "bg-white border border-slate-200 text-slate-700"
                      }`}
                    >
                      Fixed ($ / Pax)
                    </button>
                    <button
                      type="button"
                      onClick={() => setMarkupType("percentage")}
                      className={`px-2 py-1.5 rounded-lg text-xs font-bold ${
                        markupType === "percentage" ? "bg-navy-950 text-white" : "bg-white border border-slate-200 text-slate-700"
                      }`}
                    >
                      Percentage (%)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Markup Value ({markupType === "fixed" ? "USD / Pax" : "%"})
                  </label>
                  <input
                    type="number"
                    value={markupValue}
                    onChange={(e) => setMarkupValue(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-mono font-bold"
                  />
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-between font-extrabold text-emerald-800">
                  <span>Gross Profit:</span>
                  <span className="font-mono">${costingSummary.grossProfit.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-emerald-700 font-bold">
                  <span>Profit Margin:</span>
                  <span>{costingSummary.grossMarginPercent.toFixed(1)}%</span>
                </div>
              </div>
            </div>

            {/* Column 3: Final Selling Price & Room Type Breakdown */}
            <div className="p-4 rounded-2xl bg-navy-950 text-white space-y-3 shadow-soft">
              <span className="text-xs font-extrabold text-slate-300 uppercase tracking-wider block border-b border-slate-800 pb-2">
                3. Final Client Selling Price
              </span>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-300">Total Group Price:</span>
                  <span className="font-mono text-base font-black text-white">
                    ${costingSummary.finalSellingPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Average PP Rate:</span>
                  <span className="font-mono text-emerald-400 font-bold">${costingSummary.finalPPRate.toFixed(2)} / Pax</span>
                </div>

                <div className="pt-2 border-t border-slate-800 space-y-1 text-[11px]">
                  <div className="text-slate-400 font-bold">Room-Specific Selling Rates (Excel Rows 41-52):</div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">• DBL Sharing PP:</span>
                    <span className="font-mono text-white font-bold">${costingSummary.dblSellingPP.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">• TPL Sharing PP:</span>
                    <span className="font-mono text-white font-bold">${costingSummary.tplSellingPP.toFixed(2)}</span>
                  </div>
                  {costingSummary.sglSellingPP > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-300">• SGL Room PP:</span>
                      <span className="font-mono text-white font-bold">${costingSummary.sglSellingPP.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: CUSTOMER PROPOSAL PREVIEW                                          */}
      {/* ========================================================================= */}
      {activeTab === "preview" && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-soft space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-brand-50 text-brand-700 border border-brand-200">
                Official Client Proposal Preview
              </span>
              <h2 className="text-2xl font-black text-navy-950 font-display mt-2">{tourName}</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Prepared for <strong className="text-navy-950">{clientName || "Valued Traveler"}</strong> • {datesResult.days} Days / {datesResult.nights} Nights ({paxResult.totalPax} Guests)
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCustomerPreviewOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-navy-950 hover:bg-navy-900 text-white text-xs font-bold shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Open Printable PDF</span>
              </button>
            </div>
          </div>

          {/* Pricing Highlight Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-navy-950 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-soft">
            <div>
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">All-Inclusive Tour Investment</span>
              <div className="text-3xl font-black font-display text-white mt-1">
                ${costingSummary.finalSellingPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}
              </div>
              <span className="text-xs text-emerald-400 font-bold">
                ${costingSummary.finalPPRate.toFixed(2)} Per Person ({paxResult.totalPax} Guests)
              </span>
            </div>

            <div className="text-right space-y-1 text-xs">
              <div className="text-slate-300">
                Double Sharing PP: <strong className="text-white">${costingSummary.dblSellingPP.toFixed(2)}</strong>
              </div>
              <div className="text-slate-300">
                Triple Sharing PP: <strong className="text-white">${costingSummary.tplSellingPP.toFixed(2)}</strong>
              </div>
              <div className="text-[11px] text-slate-400">Valid until {validUntil || "30 Sept 2026"}</div>
            </div>
          </div>

          {/* Hotel Summary Cards */}
          <div>
            <h3 className="text-sm font-extrabold text-navy-950 mb-3 flex items-center gap-2">
              <Package className="w-4 h-4 text-brand-600" />
              <span>Accommodation Schedule</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {accommodationItems.map((item, idx) => (
                <div key={item.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-brand-600 font-mono">Night {idx + 1}</span>
                    <span className="font-bold text-slate-500">{item.date || `Day ${idx + 1}`}</span>
                  </div>
                  <strong className="text-sm font-bold text-navy-950 block">{item.hotel_name}</strong>
                  <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
                    <span>{item.city || "Sri Lanka"}</span>
                    <span className="font-bold text-brand-700">{item.meal_plan || "Half Board"}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Inclusions & Exclusions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200">
              <span className="text-xs font-black text-emerald-900 block mb-2">✓ What Is Included</span>
              <ul className="space-y-1 text-xs text-emerald-800">
                {inclusions.map((inc, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span>•</span>
                    <span>{inc}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-red-50/60 border border-red-200">
              <span className="text-xs font-black text-red-900 block mb-2">✕ What Is Excluded</span>
              <ul className="space-y-1 text-xs text-red-800">
                {exclusions.map((exc, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span>•</span>
                    <span>{exc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: REVISIONS & VERSION HISTORY                                        */}
      {/* ========================================================================= */}
      {activeTab === "history" && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-navy-950 flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-purple-600" />
              <span>Quotation Revisions & Version History</span>
            </h2>

            <button
              type="button"
              onClick={() => setIsRevisionModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Revision</span>
            </button>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-black bg-purple-700 text-white font-mono">
                    Current Active: {quoteNumber} ({revisionLabel})
                  </span>
                  <span className="text-xs text-purple-900 font-semibold">Total: ${costingSummary.finalSellingPrice.toFixed(2)}</span>
                </div>
                <p className="text-xs text-purple-800 mt-1">Status: {status} • Modified: {new Date().toLocaleDateString()}</p>
              </div>

              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Live Active Version</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: CUSTOMER PROPOSAL PDF PREVIEW                                    */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isCustomerPreviewOpen}
        onClose={() => setIsCustomerPreviewOpen(false)}
        title={`Customer Proposal PDF — ${quoteNumber} (${revisionLabel})`}
        maxWidth="5xl"
      >
        <div className="space-y-4">
          <div className="h-[650px] w-full bg-slate-100 rounded-2xl overflow-hidden border border-slate-200">
            <iframe
              src={getQuotationCustomerPDFDataUrl({
                quote_number: quoteNumber,
                revision_number: revisionNumber,
                revision_label: revisionLabel,
                client_name: clientName,
                client_email: clientEmail,
                client_phone: clientPhone,
                client_nationality: clientNationality,
                tour_name: tourName,
                arrival_date: arrivalDate,
                departure_date: departureDate,
                days_count: datesResult.days,
                nights_count: datesResult.nights,
                total_pax: paxResult.totalPax,
                adults_count: adultsCount,
                children_count: childrenCount,
                vehicle_name: selectedVehicle.vehicle_name,
                accommodation_items: accommodationItems,
                inclusions,
                exclusions,
                terms_and_conditions: terms,
                valid_until: validUntil,
                costing_summary: costingSummary,
                currency,
                total_amount: costingSummary.finalSellingPrice,
                selling_pp_rate: costingSummary.finalPPRate,
              })}
              className="w-full h-full border-0"
              title="Customer Proposal PDF"
            />
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 2: INTERNAL COSTING SHEET PDF PREVIEW                               */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isInternalPreviewOpen}
        onClose={() => setIsInternalPreviewOpen(false)}
        title={`Internal Costing Sheet (Confidential) — ${quoteNumber}`}
        maxWidth="5xl"
      >
        <div className="space-y-4">
          <div className="h-[650px] w-full bg-slate-100 rounded-2xl overflow-hidden border border-slate-200">
            <iframe
              src={getInternalCostingPDFDataUrl({
                quote_number: quoteNumber,
                revision_number: revisionNumber,
                revision_label: revisionLabel,
                client_name: clientName,
                total_pax: paxResult.totalPax,
                days_count: datesResult.days,
                nights_count: datesResult.nights,
                vehicle_name: selectedVehicle.vehicle_name,
                vehicle_rate_per_km: vehicleRatePerKm,
                exchange_rate_lkr_usd: exchangeRate,
                accommodation_items: accommodationItems,
                transport_days: transportDays,
                misc_items: miscItems,
                costing_summary: costingSummary,
                currency,
                total_amount: costingSummary.finalSellingPrice,
              })}
              className="w-full h-full border-0"
              title="Internal Costing PDF"
            />
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 3: EMAIL DISPATCH MODAL                                             */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        title={`Dispatch Quotation Email — ${quoteNumber}`}
        maxWidth="xl"
      >
        <form onSubmit={handleSendEmail} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Recipient Email</label>
            <input
              type="email"
              required
              placeholder="e.g. client@domain.com"
              value={emailTo}
              onChange={(e) => setEmailTo(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Email Subject</label>
            <input
              type="text"
              required
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Message Body</label>
            <textarea
              rows={6}
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center gap-2">
            <Paperclip className="w-4 h-4 text-slate-500" />
            <span className="font-bold text-slate-700">Attachment:</span>
            <span className="font-mono text-slate-600">Quotation_{quoteNumber}.pdf</span>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEmailModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSendingEmail}
              className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSendingEmail ? "Sending..." : "Send Quotation Email"}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 4: CREATE REVISION MODAL                                            */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isRevisionModalOpen}
        onClose={() => setIsRevisionModalOpen(false)}
        title={`Create New Quotation Revision for ${quoteNumber}`}
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Creating a revision will snapshot the current version as <strong>{revisionLabel}</strong> and increment the revision to <strong>Rev {revisionNumber + 1}</strong>.
          </p>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Revision Change Notes</label>
            <textarea
              rows={3}
              placeholder="e.g. Updated hotel rates as requested by client..."
              value={revisionNotesInput}
              onChange={(e) => setRevisionNotesInput(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsRevisionModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreateRevision}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold"
            >
              Create Rev {revisionNumber + 1}
            </button>
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 5: QUICK ADD HOTEL                                                  */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isQuickAddHotelOpen}
        onClose={() => setIsQuickAddHotelOpen(false)}
        title="Add New Hotel to Master Directory"
        maxWidth="md"
      >
        <div className="space-y-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Hotel Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Jetwing Lighthouse"
              value={newHotelName}
              onChange={(e) => setNewHotelName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Reservation Email</label>
            <input
              type="email"
              required
              placeholder="e.g. reservations@jetwinghotels.com"
              value={newHotelEmail}
              onChange={(e) => setNewHotelEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsQuickAddHotelOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                if (!newHotelName || !newHotelEmail) {
                  showToast("Please enter hotel name and email", "warning");
                  return;
                }
                const newHotel: Hotel = {
                  id: `h-${Date.now()}`,
                  hotel_name: newHotelName.trim().toUpperCase(),
                  reservation_email: newHotelEmail.trim(),
                  city: "Sri Lanka",
                  active: true,
                };
                crmStore.addHotel(newHotel);
                setKnownHotels(crmStore.getHotels());
                setIsQuickAddHotelOpen(false);
                setNewHotelName("");
                setNewHotelEmail("");
                showToast(`Hotel "${newHotel.hotel_name}" added to master directory!`, "success");
              }}
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold"
            >
              Save Hotel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function Paperclip(props: any) {
  return <Mail {...props} />;
}
