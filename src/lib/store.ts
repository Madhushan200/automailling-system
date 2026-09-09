import {
  Hotel,
  Client,
  Booking,
  EmailTemplate,
  CompanySettings,
  Voucher,
  EmailLog,
  Lead,
  Tour,
  RoutePlan,
  Itinerary,
  TourCosting,
  Quotation,
  Invoice,
  Payment,
  SupplierPayment,
  OperationsItem,
  CalendarEvent,
  AuditLog,
  Supplier,
  TransportProvider,
  Activity,
  Restaurant,
  Guide,
  UniversalSupplierRate,
  TourTemplate,
  TourExpense,
  WhatsAppLog,
  DocumentItem,
  Vehicle,
  MiscellaneousMasterItem,
} from "./types";
import {
  initialCompanySettings,
  initialSuppliers,
  initialHotels,
  initialTransportProviders,
  initialVehicles,
  initialMiscellaneousMaster,
  initialActivities,
  initialRestaurants,
  initialGuides,
  initialUniversalRates,
  initialClients,
  initialLeads,
  initialTours,
  initialTourCostings,
  initialQuotations,
  initialInvoices,
  initialPayments,
  initialSupplierPayments,
  initialTourExpenses,
  initialBookings,
  initialVouchers,
  initialOperations,
  initialCalendarEvents,
  initialEmailTemplates,
  initialEmailLogs,
  initialWhatsAppLogs,
  initialTourTemplates,
  initialAuditLogs,
} from "./initial-data";
import { supabase, isSupabaseConfigured } from "./supabase";

const STORAGE_KEYS = {
  SETTINGS: "dodoz_crm_settings",
  SUPPLIERS: "dodoz_erp_suppliers",
  HOTELS: "dodoz_crm_hotels",
  VEHICLES: "dodoz_crm_vehicles",
  MISC_MASTER: "dodoz_crm_misc_master",
  TRANSPORT: "dodoz_erp_transport",
  ACTIVITIES: "dodoz_erp_activities",
  RESTAURANTS: "dodoz_erp_restaurants",
  GUIDES: "dodoz_erp_guides",
  UNIVERSAL_RATES: "dodoz_erp_universal_rates",
  CLIENTS: "dodoz_crm_clients",
  LEADS: "dodoz_erp_leads",
  TOURS: "dodoz_erp_tours",
  TOUR_TEMPLATES: "dodoz_erp_tour_templates",
  COSTINGS: "dodoz_erp_costings",
  QUOTATIONS: "dodoz_erp_quotations",
  INVOICES: "dodoz_erp_invoices",
  PAYMENTS: "dodoz_erp_payments",
  SUPPLIER_PAYMENTS: "dodoz_erp_supplier_payments",
  EXPENSES: "dodoz_erp_expenses",
  BOOKINGS: "dodoz_crm_bookings",
  VOUCHERS: "dodoz_crm_vouchers",
  OPERATIONS: "dodoz_erp_operations",
  CALENDAR: "dodoz_erp_calendar",
  TEMPLATES: "dodoz_crm_templates",
  EMAIL_LOGS: "dodoz_crm_email_logs",
  WHATSAPP_LOGS: "dodoz_erp_whatsapp_logs",
  DOCUMENTS: "dodoz_erp_documents",
  AUDIT_LOGS: "dodoz_erp_audit_logs",
};

// Safe localStorage access for Next.js SSR
function getStored<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    return JSON.parse(item);
  } catch {
    return defaultValue;
  }
}

function setStored<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed to store key ${key}:`, err);
  }
}

export const crmStore = {
  // SETTINGS
  getSettings(): CompanySettings {
    return getStored(STORAGE_KEYS.SETTINGS, initialCompanySettings);
  },
  saveSettings(settings: CompanySettings): void {
    setStored(STORAGE_KEYS.SETTINGS, settings);
  },

  // SUPPLIERS
  getSuppliers(): Supplier[] {
    return getStored(STORAGE_KEYS.SUPPLIERS, initialSuppliers);
  },
  saveSuppliers(suppliers: Supplier[]): void {
    setStored(STORAGE_KEYS.SUPPLIERS, suppliers);
  },
  addSupplier(supplier: Supplier): void {
    const list = this.getSuppliers();
    list.unshift(supplier);
    this.saveSuppliers(list);
  },

  // HOTELS
  getHotels(): Hotel[] {
    return getStored(STORAGE_KEYS.HOTELS, initialHotels);
  },
  saveHotels(hotels: Hotel[]): void {
    setStored(STORAGE_KEYS.HOTELS, hotels);
  },
  addHotel(hotel: Hotel): void {
    const hotels = this.getHotels();
    hotels.push(hotel);
    this.saveHotels(hotels);

    if (isSupabaseConfigured && supabase) {
      supabase.from("hotels").upsert({
        hotel_name: hotel.hotel_name,
        reservation_email: hotel.reservation_email,
        cc_email: hotel.cc_email || null,
        phone: hotel.phone || null,
        address: hotel.address || null,
        city: hotel.city || "Sri Lanka",
        notes: hotel.notes || null,
        active: hotel.active ?? true,
      }, { onConflict: "hotel_name" }).then(({ error }: { error?: any }) => {
        if (error) console.warn("Supabase Hotel Sync Notice:", error.message);
      }).catch((e: any) => console.warn(e));
    }
  },
  updateHotel(id: string, updates: Partial<Hotel>): void {
    const hotels = this.getHotels().map((h) => (h.id === id ? { ...h, ...updates } : h));
    this.saveHotels(hotels);

    const updated = hotels.find((h) => h.id === id);
    if (isSupabaseConfigured && supabase && updated) {
      supabase.from("hotels").upsert({
        hotel_name: updated.hotel_name,
        reservation_email: updated.reservation_email,
        cc_email: updated.cc_email || null,
        phone: updated.phone || null,
        address: updated.address || null,
        city: updated.city || "Sri Lanka",
        notes: updated.notes || null,
        active: updated.active ?? true,
      }, { onConflict: "hotel_name" }).then(({ error }: { error?: any }) => {
        if (error) console.warn("Supabase Hotel Sync Notice:", error.message);
      }).catch((e: any) => console.warn(e));
    }
  },
  deleteHotel(id: string): void {
    const target = this.getHotels().find((h) => h.id === id);
    const hotels = this.getHotels().filter((h) => h.id !== id);
    this.saveHotels(hotels);

    if (isSupabaseConfigured && supabase && target) {
      supabase.from("hotels").delete().eq("hotel_name", target.hotel_name).then(({ error }: { error?: any }) => {
        if (error) console.warn("Supabase Hotel Delete Notice:", error.message);
      }).catch((e: any) => console.warn(e));
    }
  },

  // VEHICLES FLEET MASTER
  getVehicles(): Vehicle[] {
    return getStored(STORAGE_KEYS.VEHICLES, initialVehicles);
  },
  saveVehicles(vehicles: Vehicle[]): void {
    setStored(STORAGE_KEYS.VEHICLES, vehicles);
  },
  addVehicle(vehicle: Vehicle): void {
    const list = this.getVehicles();
    list.unshift(vehicle);
    this.saveVehicles(list);

    if (isSupabaseConfigured && supabase) {
      supabase.from("vehicles").upsert({
        id: vehicle.id,
        vehicle_name: vehicle.vehicle_name,
        vehicle_class: vehicle.vehicle_class,
        seats: vehicle.seats,
        per_km_rate: vehicle.per_km_rate,
        per_day_rate: vehicle.per_day_rate,
        driver_daily_allowance: vehicle.driver_daily_allowance,
        driver_accommodation_rate: vehicle.driver_accommodation_rate,
        currency: vehicle.currency || "LKR",
        description: vehicle.description,
        active: vehicle.active,
      }).then(({ error }: { error?: any }) => {
        if (error) console.warn("Supabase Vehicle Sync Notice:", error.message);
      }).catch((e: any) => console.warn(e));
    }
  },
  updateVehicle(id: string, updates: Partial<Vehicle>): void {
    const list = this.getVehicles().map((v) => (v.id === id ? { ...v, ...updates } : v));
    this.saveVehicles(list);

    const updated = list.find((v) => v.id === id);
    if (isSupabaseConfigured && supabase && updated) {
      supabase.from("vehicles").upsert({
        id: updated.id,
        vehicle_name: updated.vehicle_name,
        vehicle_class: updated.vehicle_class,
        seats: updated.seats,
        per_km_rate: updated.per_km_rate,
        per_day_rate: updated.per_day_rate,
        driver_daily_allowance: updated.driver_daily_allowance,
        driver_accommodation_rate: updated.driver_accommodation_rate,
        currency: updated.currency || "LKR",
        description: updated.description,
        active: updated.active,
      }).then(({ error }: { error?: any }) => {
        if (error) console.warn("Supabase Vehicle Update Notice:", error.message);
      }).catch((e: any) => console.warn(e));
    }
  },
  deleteVehicle(id: string): void {
    const list = this.getVehicles().filter((v) => v.id !== id);
    this.saveVehicles(list);

    if (isSupabaseConfigured && supabase) {
      supabase.from("vehicles").delete().eq("id", id).then(({ error }: { error?: any }) => {
        if (error) console.warn("Supabase Vehicle Delete Notice:", error.message);
      }).catch((e: any) => console.warn(e));
    }
  },

  // MISCELLANEOUS & ENTRANCE FEES MASTER
  getMiscellaneousMaster(): MiscellaneousMasterItem[] {
    return getStored(STORAGE_KEYS.MISC_MASTER, initialMiscellaneousMaster);
  },
  saveMiscellaneousMaster(items: MiscellaneousMasterItem[]): void {
    setStored(STORAGE_KEYS.MISC_MASTER, items);
  },
  addMiscellaneousItem(item: MiscellaneousMasterItem): void {
    const list = this.getMiscellaneousMaster();
    list.unshift(item);
    this.saveMiscellaneousMaster(list);

    if (isSupabaseConfigured && supabase) {
      supabase.from("miscellaneous_items").upsert({
        id: item.id,
        name: item.name,
        category: item.category,
        default_rate: item.default_rate,
        unit: item.unit,
        currency: item.currency,
        is_per_person: item.is_per_person,
        description: item.description,
        active: item.active,
      }).then(({ error }: { error?: any }) => {
        if (error) console.warn("Supabase Misc Master Sync Notice:", error.message);
      }).catch((e: any) => console.warn(e));
    }
  },
  updateMiscellaneousItem(id: string, updates: Partial<MiscellaneousMasterItem>): void {
    const list = this.getMiscellaneousMaster().map((m) => (m.id === id ? { ...m, ...updates } : m));
    this.saveMiscellaneousMaster(list);

    const updated = list.find((m) => m.id === id);
    if (isSupabaseConfigured && supabase && updated) {
      supabase.from("miscellaneous_items").upsert({
        id: updated.id,
        name: updated.name,
        category: updated.category,
        default_rate: updated.default_rate,
        unit: updated.unit,
        currency: updated.currency,
        is_per_person: updated.is_per_person,
        description: updated.description,
        active: updated.active,
      }).then(({ error }: { error?: any }) => {
        if (error) console.warn("Supabase Misc Master Update Notice:", error.message);
      }).catch((e: any) => console.warn(e));
    }
  },
  deleteMiscellaneousItem(id: string): void {
    const list = this.getMiscellaneousMaster().filter((m) => m.id !== id);
    this.saveMiscellaneousMaster(list);

    if (isSupabaseConfigured && supabase) {
      supabase.from("miscellaneous_items").delete().eq("id", id).then(({ error }: { error?: any }) => {
        if (error) console.warn("Supabase Misc Master Delete Notice:", error.message);
      }).catch((e: any) => console.warn(e));
    }
  },

  // TRANSPORT PROVIDERS
  getTransportProviders(): TransportProvider[] {
    return getStored(STORAGE_KEYS.TRANSPORT, initialTransportProviders);
  },
  saveTransportProviders(providers: TransportProvider[]): void {
    setStored(STORAGE_KEYS.TRANSPORT, providers);
  },
  addTransportProvider(provider: TransportProvider): void {
    const list = this.getTransportProviders();
    list.unshift(provider);
    this.saveTransportProviders(list);
  },

  // ACTIVITIES
  getActivities(): Activity[] {
    return getStored(STORAGE_KEYS.ACTIVITIES, initialActivities);
  },
  saveActivities(activities: Activity[]): void {
    setStored(STORAGE_KEYS.ACTIVITIES, activities);
  },
  addActivity(activity: Activity): void {
    const list = this.getActivities();
    list.unshift(activity);
    this.saveActivities(list);
  },

  // RESTAURANTS
  getRestaurants(): Restaurant[] {
    return getStored(STORAGE_KEYS.RESTAURANTS, initialRestaurants);
  },
  saveRestaurants(restaurants: Restaurant[]): void {
    setStored(STORAGE_KEYS.RESTAURANTS, restaurants);
  },
  addRestaurant(restaurant: Restaurant): void {
    const list = this.getRestaurants();
    list.unshift(restaurant);
    this.saveRestaurants(list);
  },

  // GUIDES
  getGuides(): Guide[] {
    return getStored(STORAGE_KEYS.GUIDES, initialGuides);
  },
  saveGuides(guides: Guide[]): void {
    setStored(STORAGE_KEYS.GUIDES, guides);
  },
  addGuide(guide: Guide): void {
    const list = this.getGuides();
    list.unshift(guide);
    this.saveGuides(list);
  },

  // UNIVERSAL MASTER RATES
  getUniversalRates(): UniversalSupplierRate[] {
    return getStored(STORAGE_KEYS.UNIVERSAL_RATES, initialUniversalRates);
  },
  saveUniversalRates(rates: UniversalSupplierRate[]): void {
    setStored(STORAGE_KEYS.UNIVERSAL_RATES, rates);
  },

  // CLIENTS
  getClients(): Client[] {
    return getStored(STORAGE_KEYS.CLIENTS, initialClients);
  },
  saveClients(clients: Client[]): void {
    setStored(STORAGE_KEYS.CLIENTS, clients);
  },
  addClient(client: Client): void {
    const clients = this.getClients();
    clients.push(client);
    this.saveClients(clients);
  },
  updateClient(id: string, updates: Partial<Client>): void {
    const clients = this.getClients().map((c) => (c.id === id ? { ...c, ...updates } : c));
    this.saveClients(clients);
  },

  // LEADS
  getLeads(): Lead[] {
    return getStored(STORAGE_KEYS.LEADS, initialLeads);
  },
  saveLeads(leads: Lead[]): void {
    setStored(STORAGE_KEYS.LEADS, leads);
  },
  addLead(lead: Lead): void {
    const leads = this.getLeads();
    leads.unshift(lead);
    this.saveLeads(leads);
  },
  updateLead(id: string, updates: Partial<Lead>): void {
    const leads = this.getLeads().map((l) => (l.id === id ? { ...l, ...updates } : l));
    this.saveLeads(leads);
  },

  // TOURS
  getTours(): Tour[] {
    return getStored(STORAGE_KEYS.TOURS, initialTours);
  },
  saveTours(tours: Tour[]): void {
    setStored(STORAGE_KEYS.TOURS, tours);
  },
  getTourById(id: string): Tour | undefined {
    return this.getTours().find((t) => t.id === id || t.tour_number === id);
  },
  addTour(tour: Tour): void {
    const tours = this.getTours().filter((t) => t.id !== tour.id && t.tour_number !== tour.tour_number);
    tours.unshift(tour);
    this.saveTours(tours);
  },
  saveTour(tour: Tour): void {
    const tours = this.getTours();
    const idx = tours.findIndex((t) => t.id === tour.id || t.tour_number === tour.tour_number || (tour.tour_reference && t.tour_reference === tour.tour_reference));
    if (idx >= 0) {
      tours[idx] = { ...tours[idx], ...tour, updated_at: new Date().toISOString() };
    } else {
      tours.unshift(tour);
    }
    this.saveTours(tours);

    // Async Cloud Sync to Supabase
    if (isSupabaseConfigured && supabase) {
      supabase.from("tours").upsert({
        tour_reference: tour.tour_reference || tour.tour_number,
        tour_name: tour.tour_name || "Sri Lanka Tour",
        client_name: tour.client_name || "Valued Client",
        pax: tour.pax || tour.total_pax || 1,
        arrival_date: tour.arrival_date || tour.start_date,
        departure_date: tour.departure_date || tour.end_date,
        days_count: tour.days_count || 1,
        nights_count: tour.nights_count || 1,
        notes: tour.notes || "",
        status: tour.status || "Confirmed",
        accommodation_rows: tour.accommodation_rows || [],
        transportation_rows: tour.transportation_rows || [],
        miscellaneous_rows: tour.miscellaneous_rows || [],
      }, { onConflict: "tour_reference" }).then(({ error }: { error?: any }) => {
        if (error) console.warn("Supabase Tour Sync Notice:", error.message);
      }).catch((e: any) => console.warn("Supabase Tour Sync error:", e));
    }
  },
  updateTour(id: string, updates: Partial<Tour>): void {
    const tours = this.getTours().map((t) => (t.id === id || t.tour_number === id || t.tour_reference === id ? { ...t, ...updates, updated_at: new Date().toISOString() } : t));
    this.saveTours(tours);
  },
  deleteTour(id: string): void {
    const tours = this.getTours().filter((t) => t.id !== id && t.tour_number !== id && t.tour_reference !== id);
    this.saveTours(tours);

    if (isSupabaseConfigured && supabase) {
      supabase.from("tours").delete().or(`tour_reference.eq.${id},id.eq.${id}`).then(({ error }: { error?: any }) => {
        if (error) console.warn("Supabase Delete Notice:", error.message);
      }).catch((e: any) => console.warn(e));
    }
  },

  // TOUR TEMPLATES & ITINERARIES
  getTourTemplates(): TourTemplate[] {
    return getStored(STORAGE_KEYS.TOUR_TEMPLATES, initialTourTemplates);
  },
  saveTourTemplates(templates: TourTemplate[]): void {
    setStored(STORAGE_KEYS.TOUR_TEMPLATES, templates);
  },
  getItineraries(): any[] {
    return getStored(STORAGE_KEYS.TOUR_TEMPLATES, initialTourTemplates);
  },
  saveItineraries(templates: any[]): void {
    setStored(STORAGE_KEYS.TOUR_TEMPLATES, templates);
  },

  // ROUTE PLANS
  getRoutePlans(): RoutePlan[] {
    const fromTours = this.getTours().map((t) => t.route_plan).filter(Boolean) as RoutePlan[];
    const fromTemplates = this.getTourTemplates().map((t) => t.route_plan).filter(Boolean) as RoutePlan[];
    const combined = [...fromTours, ...fromTemplates];
    return getStored("dodoz_erp_routes", combined.length > 0 ? combined : []);
  },
  saveRoutePlans(plans: RoutePlan[]): void {
    setStored("dodoz_erp_routes", plans);
  },

  // COSTINGS
  getCostings(): TourCosting[] {
    return getStored(STORAGE_KEYS.COSTINGS, initialTourCostings);
  },
  saveCostings(costings: TourCosting[]): void {
    setStored(STORAGE_KEYS.COSTINGS, costings);
  },
  getCostingByTourId(tourId: string): TourCosting | undefined {
    return this.getCostings().find((c) => c.tour_id === tourId || c.tour_number === tourId);
  },
  saveCostingForTour(costing: TourCosting): void {
    const costings = this.getCostings().filter((c) => c.tour_id !== costing.tour_id && c.id !== costing.id);
    costings.unshift(costing);
    this.saveCostings(costings);
  },

  // QUOTATIONS & PROPOSALS
  getQuotations(): Quotation[] {
    return getStored(STORAGE_KEYS.QUOTATIONS, initialQuotations);
  },
  getQuotationById(id: string): Quotation | undefined {
    return this.getQuotations().find((q) => q.id === id || q.quote_number === id);
  },
  saveQuotations(quotations: Quotation[]): void {
    setStored(STORAGE_KEYS.QUOTATIONS, quotations);
  },
  addQuotation(quote: Quotation): void {
    const list = this.getQuotations();
    // Prepend new quotation
    const updated = [quote, ...list.filter((q) => q.id !== quote.id && q.quote_number !== quote.quote_number)];
    this.saveQuotations(updated);

    if (isSupabaseConfigured && supabase) {
      supabase.from("quotations").upsert({
        id: quote.id,
        quote_number: quote.quote_number,
        revision_number: quote.revision_number || 0,
        revision_label: quote.revision_label || "Original",
        client_name: quote.client_name || "",
        client_email: quote.client_email || null,
        client_phone: quote.client_phone || null,
        tour_name: quote.tour_name || "",
        arrival_date: quote.arrival_date || null,
        departure_date: quote.departure_date || null,
        total_pax: quote.total_pax || 1,
        currency: quote.currency || "USD",
        total_amount: quote.total_amount || 0,
        status: quote.status || "Draft",
        accommodation_items: quote.accommodation_items || [],
        transport_days: quote.transport_days || [],
        misc_items: quote.misc_items || [],
        costing_summary: quote.costing_summary || {},
        pricing_options: quote.pricing_options || [],
        inclusions: quote.inclusions || [],
        exclusions: quote.exclusions || [],
        terms_and_conditions: quote.terms_and_conditions || "",
        versions: quote.versions || [],
      }, { onConflict: "quote_number" }).then(({ error }: { error?: any }) => {
        if (error) console.warn("Supabase Quotation Sync Notice:", error.message);
      }).catch((e: any) => console.warn(e));
    }
  },
  updateQuotation(id: string, updates: Partial<Quotation>): void {
    const list = this.getQuotations();
    const existing = list.find((q) => q.id === id || q.quote_number === id);
    if (!existing) return;

    const merged: Quotation = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const updatedList = list.map((q) => (q.id === id || q.quote_number === id ? merged : q));
    this.saveQuotations(updatedList);

    if (isSupabaseConfigured && supabase) {
      supabase.from("quotations").upsert({
        id: merged.id,
        quote_number: merged.quote_number,
        revision_number: merged.revision_number || 0,
        revision_label: merged.revision_label || "Original",
        client_name: merged.client_name || "",
        client_email: merged.client_email || null,
        client_phone: merged.client_phone || null,
        tour_name: merged.tour_name || "",
        arrival_date: merged.arrival_date || null,
        departure_date: merged.departure_date || null,
        total_pax: merged.total_pax || 1,
        currency: merged.currency || "USD",
        total_amount: merged.total_amount || 0,
        status: merged.status || "Draft",
        accommodation_items: merged.accommodation_items || [],
        transport_days: merged.transport_days || [],
        misc_items: merged.misc_items || [],
        costing_summary: merged.costing_summary || {},
        pricing_options: merged.pricing_options || [],
        inclusions: merged.inclusions || [],
        exclusions: merged.exclusions || [],
        terms_and_conditions: merged.terms_and_conditions || "",
        versions: merged.versions || [],
      }, { onConflict: "quote_number" }).then(({ error }: { error?: any }) => {
        if (error) console.warn("Supabase Quotation Update Notice:", error.message);
      }).catch((e: any) => console.warn(e));
    }
  },
  createQuotationRevision(quoteId: string, changeNotes?: string): Quotation | null {
    const list = this.getQuotations();
    const original = list.find((q) => q.id === quoteId || q.quote_number === quoteId);
    if (!original) return null;

    const nextRevisionNum = (original.revision_number || 0) + 1;
    const revisionLabel = `Rev ${nextRevisionNum}`;

    // Snapshot existing version
    const versionSnapshot = {
      version_number: original.revision_number || 0,
      revision_label: original.revision_label || "Original",
      saved_at: original.updated_at || original.created_at || new Date().toISOString(),
      change_notes: changeNotes || `Revision ${nextRevisionNum} created`,
      snapshot: { ...original },
      pdf_url: original.pdf_url,
    };

    const existingVersions = original.versions || [];
    const updatedVersions = [versionSnapshot, ...existingVersions];

    const revisedQuotation: Quotation = {
      ...original,
      revision_number: nextRevisionNum,
      revision_label: revisionLabel,
      versions: updatedVersions,
      status: "Draft",
      updated_at: new Date().toISOString(),
    };

    this.updateQuotation(original.id, revisedQuotation);
    return revisedQuotation;
  },
  deleteQuotation(id: string): void {
    const list = this.getQuotations().filter((q) => q.id !== id && q.quote_number !== id);
    this.saveQuotations(list);

    if (isSupabaseConfigured && supabase) {
      supabase.from("quotations").delete().or(`id.eq.${id},quote_number.eq.${id}`).then(({ error }: { error?: any }) => {
        if (error) console.warn("Supabase Quotation Delete Notice:", error.message);
      }).catch((e: any) => console.warn(e));
    }
  },

  // INVOICES
  getInvoices(): Invoice[] {
    return getStored(STORAGE_KEYS.INVOICES, initialInvoices);
  },
  saveInvoices(invoices: Invoice[]): void {
    setStored(STORAGE_KEYS.INVOICES, invoices);
  },
  addInvoice(invoice: Invoice): void {
    const list = this.getInvoices();
    list.unshift(invoice);
    this.saveInvoices(list);
  },
  updateInvoice(id: string, updates: Partial<Invoice>): void {
    const list = this.getInvoices().map((inv) => (inv.id === id ? { ...inv, ...updates } : inv));
    this.saveInvoices(list);
  },

  // PAYMENTS
  getPayments(): Payment[] {
    return getStored(STORAGE_KEYS.PAYMENTS, initialPayments);
  },
  savePayments(payments: Payment[]): void {
    setStored(STORAGE_KEYS.PAYMENTS, payments);
  },
  addPayment(payment: Payment): void {
    const list = this.getPayments();
    list.unshift(payment);
    this.savePayments(list);
  },

  // SUPPLIER PAYMENTS
  getSupplierPayments(): SupplierPayment[] {
    return getStored(STORAGE_KEYS.SUPPLIER_PAYMENTS, initialSupplierPayments);
  },
  saveSupplierPayments(payments: SupplierPayment[]): void {
    setStored(STORAGE_KEYS.SUPPLIER_PAYMENTS, payments);
  },
  addSupplierPayment(payment: SupplierPayment): void {
    const list = this.getSupplierPayments();
    list.unshift(payment);
    this.saveSupplierPayments(list);
  },

  // EXPENSES
  getExpenses(): TourExpense[] {
    return getStored(STORAGE_KEYS.EXPENSES, initialTourExpenses);
  },
  saveExpenses(expenses: TourExpense[]): void {
    setStored(STORAGE_KEYS.EXPENSES, expenses);
  },
  addExpense(expense: TourExpense): void {
    const list = this.getExpenses();
    list.unshift(expense);
    this.saveExpenses(list);
  },

  // BOOKINGS
  getBookings(): Booking[] {
    return getStored(STORAGE_KEYS.BOOKINGS, initialBookings);
  },
  saveBookings(bookings: Booking[]): void {
    setStored(STORAGE_KEYS.BOOKINGS, bookings);
  },
  addBooking(booking: Booking): void {
    const bookings = this.getBookings();
    bookings.unshift(booking);
    this.saveBookings(bookings);
  },
  updateBooking(id: string, updates: Partial<Booking>): void {
    const bookings = this.getBookings().map((b) => (b.id === id ? { ...b, ...updates } : b));
    this.saveBookings(bookings);
  },

  // VOUCHERS
  getVouchers(): Voucher[] {
    return getStored(STORAGE_KEYS.VOUCHERS, initialVouchers);
  },
  saveVouchers(vouchers: Voucher[]): void {
    setStored(STORAGE_KEYS.VOUCHERS, vouchers);
  },
  addVoucher(voucher: Voucher): void {
    const vouchers = this.getVouchers();
    vouchers.unshift(voucher);
    this.saveVouchers(vouchers);
  },
  updateVoucher(id: string, updates: Partial<Voucher>): void {
    const vouchers = this.getVouchers().map((v) => (v.id === id ? { ...v, ...updates } : v));
    this.saveVouchers(vouchers);
  },

  // OPERATIONS
  getOperations(): OperationsItem[] {
    return getStored(STORAGE_KEYS.OPERATIONS, initialOperations);
  },
  saveOperations(items: OperationsItem[]): void {
    setStored(STORAGE_KEYS.OPERATIONS, items);
  },
  addOperation(item: OperationsItem): void {
    const list = this.getOperations();
    list.unshift(item);
    this.saveOperations(list);
  },
  updateOperation(id: string, updates: Partial<OperationsItem>): void {
    const list = this.getOperations().map((op) => (op.id === id ? { ...op, ...updates } : op));
    this.saveOperations(list);
  },

  // CALENDAR
  getCalendarEvents(): CalendarEvent[] {
    return getStored(STORAGE_KEYS.CALENDAR, initialCalendarEvents);
  },
  saveCalendarEvents(events: CalendarEvent[]): void {
    setStored(STORAGE_KEYS.CALENDAR, events);
  },

  // EMAIL TEMPLATES
  getTemplates(): EmailTemplate[] {
    return getStored(STORAGE_KEYS.TEMPLATES, initialEmailTemplates);
  },
  saveTemplates(templates: EmailTemplate[]): void {
    setStored(STORAGE_KEYS.TEMPLATES, templates);
  },
  getDefaultTemplate(): EmailTemplate {
    const list = this.getTemplates();
    return list.find((t) => t.is_default) || list[0] || initialEmailTemplates[0];
  },

  // EMAIL LOGS
  getEmailLogs(): EmailLog[] {
    return getStored(STORAGE_KEYS.EMAIL_LOGS, initialEmailLogs);
  },
  addEmailLog(log: EmailLog): void {
    const logs = this.getEmailLogs();
    logs.unshift(log);
    setStored(STORAGE_KEYS.EMAIL_LOGS, logs);
  },

  // WHATSAPP LOGS
  getWhatsAppLogs(): WhatsAppLog[] {
    return getStored(STORAGE_KEYS.WHATSAPP_LOGS, initialWhatsAppLogs);
  },
  addWhatsAppLog(log: WhatsAppLog): void {
    const logs = this.getWhatsAppLogs();
    logs.unshift(log);
    setStored(STORAGE_KEYS.WHATSAPP_LOGS, logs);
  },

  // DOCUMENTS
  getDocuments(): DocumentItem[] {
    return getStored(STORAGE_KEYS.DOCUMENTS, [
      {
        id: "doc-1",
        tour_id: "tour-101",
        title: "Guest Passports - Hayes Family",
        file_type: "Passport",
        file_name: "hayes_passports_scanned.pdf",
        file_size: "2.4 MB",
        file_url: "#",
        uploaded_by: "Shanika Perera",
        created_at: "2026-08-11T14:00:00Z",
      },
    ]);
  },
  addDocument(doc: DocumentItem): void {
    const list = this.getDocuments();
    list.unshift(doc);
    setStored(STORAGE_KEYS.DOCUMENTS, list);
  },

  // AUDIT LOGS
  getAuditLogs(): AuditLog[] {
    return getStored(STORAGE_KEYS.AUDIT_LOGS, initialAuditLogs);
  },
  addAuditLog(log: AuditLog): void {
    const logs = this.getAuditLogs();
    logs.unshift(log);
    setStored(STORAGE_KEYS.AUDIT_LOGS, logs);
  },

  // RESET
  resetAll(): void {
    if (typeof window === "undefined") return;
    localStorage.clear();
  },
};
