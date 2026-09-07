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
} from "./types";
import {
  initialCompanySettings,
  initialSuppliers,
  initialHotels,
  initialTransportProviders,
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

  // QUOTATIONS
  getQuotations(): Quotation[] {
    return getStored(STORAGE_KEYS.QUOTATIONS, initialQuotations);
  },
  saveQuotations(quotations: Quotation[]): void {
    setStored(STORAGE_KEYS.QUOTATIONS, quotations);
  },
  addQuotation(quote: Quotation): void {
    const list = this.getQuotations();
    list.unshift(quote);
    this.saveQuotations(list);
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
