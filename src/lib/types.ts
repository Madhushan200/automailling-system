export type BookingStatus = "Draft" | "Requested" | "Pending" | "Confirmed" | "Cancelled" | "Completed";
export type EmailStatus = "pending" | "sent" | "failed";
export type VoucherStatus = "draft" | "issued" | "sent" | "cancelled";
export type TourStatus = "Draft" | "Costing" | "Quotation" | "Awaiting Confirmation" | "Confirmed" | "Operations" | "Completed" | "Cancelled";
export type LeadStatus = "New" | "Contacted" | "Qualified" | "Costing" | "Quotation Sent" | "Negotiation" | "Confirmed" | "Lost" | "Cancelled";
export type QuotationStatus = "Draft" | "Internal Review" | "Approved" | "Sent" | "Negotiation" | "Accepted" | "Expired" | "Rejected";
export type InvoiceStatus = "Draft" | "Sent" | "Unpaid" | "Partial" | "Paid" | "Overdue" | "Cancelled";
export type PaymentStatus = "Received" | "Pending" | "Refunded" | "Cancelled";
export type SupplierPaymentStatus = "Pending" | "Due" | "Scheduled" | "Paid" | "Overdue" | "Cancelled";
export type CostCategory = "Accommodation" | "Transport" | "Activity" | "Restaurant" | "Guide" | "Entrance Fee" | "Visa" | "Flight" | "Insurance" | "Miscellaneous" | "Other";
export type CostUnit = "Per Person" | "Per Room" | "Per Night" | "Per Day" | "Per Vehicle" | "Per KM" | "Per Hour" | "Per Trip" | "Per Group" | "Per Service";
export type MealPlan = "RO" | "BB" | "HB" | "FB" | "AI";
export type RoomTypeCategory = "SGL" | "DBL" | "TWIN" | "TPL" | "Family" | "Suite" | "Villa";
export type SupplierType = "Hotel" | "Transport" | "Activity" | "Restaurant" | "Guide" | "Other";
export type VehicleClass = "Car" | "Van" | "SUV" | "Mini Bus" | "Bus" | "Coach";

// ==========================================
// 1. Multi-Tenancy, Users & Roles
// ==========================================
export interface Company {
  id: string;
  name: string;
  slug?: string;
  logo_url?: string;
  address: string;
  phone: string;
  whatsapp?: string;
  email: string;
  website: string;
  registration_number?: string;
  tax_number?: string;
}

export type UserRole =
  | "Super Admin"
  | "Company Admin"
  | "Sales Manager"
  | "Sales Agent"
  | "Operations Manager"
  | "Operations Staff"
  | "Finance Manager"
  | "Accountant"
  | "Guide";

export interface UserProfile {
  id: string;
  company_id: string;
  full_name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar_url?: string;
  active: boolean;
}

// ==========================================
// 2. Company Settings & White-Label
// ==========================================
export interface CompanySettings {
  company_name: string;
  logo_url: string;
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  registration_number?: string;
  tax_number?: string;
  voucher_title: string;
  footer_note: string;
  terms: string;
  smtp_provider: string;
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_pass: string;
  smtp_secure: boolean;
  sender_name: string;
  sender_email: string;
  base_currency: string;
  currencies?: Record<string, number>;
  tax_rate_percent?: number;
  service_charge_percent?: number;
  default_markup_percent?: number;
  route_provider?: "ors" | "mapbox" | "google" | "matrix" | "manual";
  route_api_key?: string;
}

// ==========================================
// 3. CRM: Leads & Clients
// ==========================================
export interface LeadActivity {
  id: string;
  lead_id: string;
  type: "Call" | "Email" | "WhatsApp" | "Note" | "Follow-up" | "Quotation" | "Booking";
  title: string;
  details: string;
  performed_by: string;
  created_at: string;
}

export interface Lead {
  id: string;
  company_id?: string;
  lead_number: string;
  lead_date?: string;
  source: string;
  client_name: string;
  company_name?: string;
  country: string;
  nationality?: string;
  email: string;
  phone: string;
  whatsapp?: string;
  adults_count: number;
  children_count: number;
  infants_count?: number;
  travel_start_date: string;
  travel_end_date: string;
  days_count?: number;
  nights_count?: number;
  destination: string;
  budget: number;
  currency: string;
  travel_type: string;
  preferred_hotel_category?: string;
  meal_plan?: MealPlan;
  activities_requested?: string;
  transport_requirement?: string;
  guide_requirement?: string;
  special_requirements?: string;
  notes?: string;
  assigned_sales_person?: string;
  assigned_to?: string;
  folder?: string;
  status: LeadStatus;
  estimated_value: number;
  allocated_itinerary_id?: string;
  allocated_itinerary_title?: string;
  allocated_route_km?: number;
  activities?: LeadActivity[];
  converted_tour_id?: string;
  created_at: string;
  updated_at?: string;
}

export interface Client {
  id: string;
  company_id?: string;
  name: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  nationality?: string;
  country?: string;
  passport_number?: string;
  passport_expiry?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  is_corporate?: boolean;
  corporate_company_name?: string;
  corporate_tax_number?: string;
  corporate_billing_address?: string;
  corporate_payment_terms?: string;
  dietary_requirements?: string;
  room_preferences?: string;
  travel_preferences?: string;
  tour_number?: string;
  reference?: string;
  notes?: string;
  total_spent?: number;
  tours_count?: number;
  created_at?: string;
}

// ==========================================
// 4. Suppliers & Dynamic Rate Database
// ==========================================
export interface Supplier {
  id: string;
  company_id?: string;
  name: string;
  type: SupplierType;
  contact_person?: string;
  email: string;
  phone: string;
  whatsapp?: string;
  address?: string;
  city?: string;
  country?: string;
  website?: string;
  currency: string;
  payment_terms: string;
  bank_details?: string;
  active: boolean;
  rating?: number;
  notes?: string;
  created_at?: string;
}

export interface HotelRoom {
  id: string;
  hotel_id: string;
  name: string;
  room_type: RoomTypeCategory;
  description?: string;
  capacity_adults: number;
  capacity_children: number;
  amenities?: string[];
}

export interface HotelRate {
  id: string;
  hotel_id: string;
  hotel_name?: string;
  room_type: RoomTypeCategory;
  room_name?: string;
  meal_plan: MealPlan;
  season_name: string;
  valid_from: string;
  valid_until: string;
  single_rate: number;
  double_rate: number;
  twin_rate: number;
  triple_rate: number;
  extra_bed_rate: number;
  child_with_bed_rate: number;
  child_without_bed_rate: number;
  currency: string;
  notes?: string;
}

export interface Hotel {
  id: string;
  company_id?: string;
  supplier_id?: string;
  hotel_name: string;
  reservation_email: string;
  cc_email?: string;
  bcc_email?: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  city?: string;
  country?: string;
  contact_person?: string;
  website?: string;
  star_rating?: number;
  currency?: string;
  payment_terms?: string;
  notes?: string;
  logo_url?: string;
  image_url?: string;
  active: boolean;
  rooms?: HotelRoom[];
  rates?: HotelRate[];
  created_at?: string;
  updated_at?: string;
}

export interface Vehicle {
  id: string;
  transport_provider_id: string;
  vehicle_name: string;
  vehicle_class: VehicleClass;
  registration_number: string;
  seats: number;
  luggage_capacity: number;
  air_conditioned: boolean;
  assigned_driver_name?: string;
  assigned_driver_phone?: string;
  per_km_rate?: number;
  per_day_rate?: number;
  airport_transfer_rate?: number;
  extra_km_rate?: number;
}

export interface TransportProvider {
  id: string;
  company_id?: string;
  supplier_id?: string;
  company_name: string;
  contact_person: string;
  phone: string;
  whatsapp?: string;
  email: string;
  address?: string;
  currency: string;
  payment_terms: string;
  vehicles: Vehicle[];
  rates?: {
    rate_type: "Per KM" | "Per Day" | "Point to Point";
    base_rate: number;
    per_km: number;
    per_day: number;
    extra_km_rate: number;
    driver_daily_allowance: number;
    night_surcharge: number;
  };
  active: boolean;
}

export interface Activity {
  id: string;
  company_id?: string;
  supplier_id?: string;
  name: string;
  provider_name: string;
  location: string;
  duration: string;
  adult_rate: number;
  child_rate: number;
  group_rate?: number;
  private_rate?: number;
  currency: string;
  guide_included: boolean;
  transport_included: boolean;
  entrance_included: boolean;
  opening_time?: string;
  closing_time?: string;
  cancellation_policy?: string;
  description?: string;
  active: boolean;
}

export interface Restaurant {
  id: string;
  company_id?: string;
  supplier_id?: string;
  name: string;
  location: string;
  cuisine: string;
  contact_person?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  currency: string;
  rates: {
    breakfast_rate?: number;
    lunch_rate?: number;
    dinner_rate?: number;
    buffet_rate?: number;
    set_menu_rate?: number;
    adult_rate: number;
    child_rate: number;
  };
  active: boolean;
}

export interface Guide {
  id: string;
  company_id?: string;
  supplier_id?: string;
  name: string;
  guide_type: "National Chauffeur Guide" | "Site Guide" | "Trekking Guide" | "Lecturer Guide";
  languages: string[];
  location?: string;
  phone: string;
  whatsapp?: string;
  email: string;
  license_number?: string;
  daily_rate: number;
  half_day_rate?: number;
  hourly_rate?: number;
  accommodation_required: boolean;
  daily_accommodation_rate: number;
  currency: string;
  active: boolean;
}

export interface UniversalSupplierRate {
  id: string;
  supplier_id: string;
  supplier_name: string;
  supplier_type: SupplierType;
  service_name: string;
  rate_type: string;
  valid_from: string;
  valid_until: string;
  season?: string;
  min_pax?: number;
  max_pax?: number;
  cost: number;
  currency: string;
  notes?: string;
}

// ==========================================
// 5. Route Engine & Distance Matrix
// ==========================================
export interface RouteWaypoint {
  id?: string;
  city: string;
  lat: number;
  lng: number;
  km_from_prev: number;
  driving_mins_from_prev: number;
  departure_time?: string;
  arrival_time?: string;
  highlights: string[];
  recommended_hotels: string[];
  intermediate_stops?: string[];
  notes?: string;
}

export interface RouteSegment {
  id: string;
  segment_number: number;
  from_city: string;
  to_city: string;
  distance_km: number;
  driving_duration_mins: number;
  toll_roads?: boolean;
  manual_override: boolean;
}

export interface RoutePlan {
  id: string;
  tour_id?: string;
  title: string;
  day_count: number;
  total_km: number;
  total_driving_duration_mins: number;
  min_daily_km: number;
  driver_daily_allowance: number;
  waypoints: RouteWaypoint[];
  segments: RouteSegment[];
  provider: "ors" | "mapbox" | "google" | "matrix" | "manual";
  calculated_at?: string;
}

// ==========================================
// 6. Tours & Tour Workspace
// ==========================================
export interface TourDay {
  day_number: number;
  date: string;
  starting_location: string;
  ending_location: string;
  intermediate_stops: string[];
  distance_km: number;
  driving_time_mins: number;
  departure_time?: string;
  arrival_time?: string;
  hotel_id?: string;
  hotel_name?: string;
  meal_plan?: MealPlan;
  activities: string[];
  meals_included: string[];
  notes?: string;
}

export interface TransportationRow {
  id: string;
  day: string; // e.g. "DAY 1"
  route: string; // e.g. "Kandy / Colombo"
  km: number; // e.g. 190
  vehicle_type?: string;
  driver_notes?: string;
}

export interface MiscellaneousRow {
  id: string;
  item: string; // e.g. "SANITIZER PACK", "07 LUNCHES"
  qty_value: number | string; // e.g. 300, 70
  notes?: string;
}

export interface Tour {
  id: string;
  company_id?: string;
  tour_number: string; // e.g. "DL-2026-001"
  tour_reference?: string; // alias for tour_number
  tour_name: string;
  client_id?: string;
  client_name: string;
  client_email?: string;
  client_phone?: string;
  client_country?: string;
  destination?: string;
  start_date: string; // arrival_date
  end_date: string; // departure_date
  arrival_date?: string;
  departure_date?: string;
  adults_count?: number;
  children_count?: number;
  infants_count?: number;
  total_pax?: number;
  pax?: number;
  nights_count?: number;
  days_count?: number;
  notes?: string;
  accommodation_rows?: AccommodationRow[];
  transportation_rows?: TransportationRow[];
  miscellaneous_rows?: MiscellaneousRow[];
  hotel_vouchers?: GroupedHotelVoucher[];
  currency?: string;
  exchange_rate?: number;
  base_currency?: string;
  sales_agent?: string;
  operations_manager?: string;
  status: TourStatus;
  total_cost?: number;
  selling_price?: number;
  gross_profit?: number;
  gross_margin_percent?: number;
  discount_amount?: number;
  tax_amount?: number;
  paid_amount?: number;
  balance_due?: number;
  route_plan?: RoutePlan;
  days?: TourDay[];
  template_id?: string;
  created_at: string;
  updated_at?: string;
}

export interface TourTemplate {
  id: string;
  title: string;
  code: string;
  duration_days: number;
  duration_nights: number;
  estimated_route_km: number;
  summary: string;
  travel_style: string;
  category: string;
  suggested_pax: number;
  route_plan: RoutePlan;
  days: TourDay[];
}

// ==========================================
// 7. Advanced Costing Engine
// ==========================================
export interface CostingItem {
  id: string;
  costing_id: string;
  category: CostCategory;
  service_name: string;
  supplier_id?: string;
  supplier_name: string;
  date?: string;
  day_number?: number;
  quantity: number;
  unit: CostUnit;
  supplier_rate: number;
  supplier_currency: string;
  exchange_rate_to_base: number;
  converted_cost: number;
  markup_type: "percentage" | "fixed";
  markup_value: number;
  selling_price: number;
  profit: number;
  margin_percent: number;
  notes?: string;
}

export interface TourCosting {
  id: string;
  tour_id: string;
  tour_number: string;
  tour_title: string;
  pax: number;
  adults: number;
  children: number;
  currency: string;
  base_currency: string;
  exchange_rate: number;
  items: CostingItem[];
  total_accommodation_cost: number;
  total_transport_cost: number;
  total_activities_cost: number;
  total_guide_cost: number;
  total_restaurants_cost: number;
  total_other_cost: number;
  total_net_cost: number;
  overall_markup_percent: number;
  total_markup_amount: number;
  gross_selling_price: number;
  agent_commission_percent?: number;
  agent_commission_amount?: number;
  discount_percent?: number;
  discount_amount?: number;
  tax_percent?: number;
  tax_amount?: number;
  net_selling_price: number;
  gross_profit: number;
  gross_margin_percent: number;
  cost_per_person: number;
  selling_per_person: number;
  status: "Draft" | "Internal Review" | "Approved";
  created_at: string;
  updated_at?: string;
}

// ==========================================
// 8. Quotation & Itinerary
// ==========================================
export interface QuotationPricingOption {
  pricing_type: "Per Person" | "Per Couple" | "Total Group" | "Per Family";
  pax_label: string;
  amount: number;
  currency: string;
}

export interface Quotation {
  id: string;
  company_id?: string;
  quote_number: string;
  tour_id?: string;
  lead_id?: string;
  client_name: string;
  client_email?: string;
  client_phone?: string;
  tour_name: string;
  travel_start_date: string;
  travel_end_date: string;
  duration_days: number;
  total_pax: number;
  currency: string;
  pricing_options: QuotationPricingOption[];
  total_amount: number;
  inclusions: string[];
  exclusions: string[];
  terms_and_conditions: string;
  payment_policy: string;
  cancellation_policy: string;
  valid_until: string;
  status: QuotationStatus;
  pdf_url?: string;
  created_at: string;
  sent_at?: string;
}

export interface ItineraryDay {
  day_number: number;
  date?: string;
  title: string;
  destination: string;
  route_summary?: string;
  distance_km?: number;
  driving_time?: string;
  schedule_items: {
    time: string;
    title: string;
    type: "departure" | "activity" | "meal" | "hotel_checkin" | "free_time" | "transfer";
  }[];
  accommodation_name?: string;
  meal_plan?: MealPlan;
  description: string;
  highlights?: string[];
  image_url?: string;
}

export interface Itinerary {
  id: string;
  tour_id?: string;
  title: string;
  code: string;
  duration_days: number;
  duration_nights: number;
  route_km: number;
  summary: string;
  days: ItineraryDay[];
  created_at?: string;
}

// ==========================================
// 9. Bookings & Multi-Category Vouchers
// ==========================================
export interface AccommodationRow {
  id?: string;
  date: string;
  day?: string | number;
  hotel: string;
  hotelName?: string;
  hotelEmail?: string;
  mealPlan?: string;
  meal_plan?: string;
  sgl?: number;
  dbl?: number;
  tpl?: number;
  roomType?: string;
  room_type?: string;
  checkIn?: string;
  checkOut?: string;
  client?: string;
  clientName?: string;
  tourNumber?: string;
  reference?: string;
  specialRequest?: string;
  remarks?: string;
  [key: string]: any;
}

export interface GroupedHotelVoucher {
  id: string;
  hotelName: string;
  hotelEmail: string;
  matchedHotelId?: string;
  emailStatus: "matched" | "missing" | "custom";
  rows: AccommodationRow[];
  tourNumber?: string;
  reference?: string;
  clientName?: string;
  checkInStart: string;
  checkInEnd: string;
  totalRooms: number;
  sendState?: "idle" | "sending" | "sent" | "failed";
  sendErrorMessage?: string;
  lastSentAt?: string;
}

export interface Booking {
  id: string;
  company_id?: string;
  booking_reference: string;
  tour_id?: string;
  tour_number?: string;
  client_id?: string;
  client_name: string;
  guest_name?: string;
  supplier_id?: string;
  supplier_name: string;
  booking_type: SupplierType;
  hotel_id?: string;
  hotel_name?: string;
  check_in_date: string;
  check_out_date: string;
  total_nights?: number;
  sgl_rooms?: number;
  dbl_rooms?: number;
  tpl_rooms?: number;
  room_type?: string;
  meal_plan?: string;
  vehicle_details?: string;
  driver_assigned?: string;
  activity_details?: string;
  guide_assigned?: string;
  confirmation_number?: string;
  special_requests?: string;
  status: BookingStatus;
  total_cost?: number;
  currency?: string;
  voucher_issued?: boolean;
  voucher_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Voucher {
  id: string;
  company_id?: string;
  voucher_number: string;
  voucher_type?: "Hotel" | "Transport" | "Activity" | "Restaurant" | "Guide";
  booking_id?: string;
  tour_id?: string;
  tour_number: string;
  client_name: string;
  supplier_name?: string;
  supplier_email?: string;
  supplier_phone?: string;
  supplier_address?: string;
  hotel_name?: string;
  hotel_email?: string;
  check_in_date?: string;
  check_out_date?: string;
  total_rooms?: number;
  reference?: string;
  service_date?: string;
  end_date?: string;
  status: VoucherStatus;
  pdf_url?: string;
  email_status: EmailStatus;
  details?: {
    rooms_schedule?: AccommodationRow[];
    vehicle_type?: string;
    driver_name?: string;
    driver_phone?: string;
    pickup_location?: string;
    route_details?: string;
    activity_name?: string;
    pax_count?: number;
    meal_basis?: string;
    guide_language?: string;
    special_instructions?: string;
  };
  sent_at?: string;
  created_at: string;
}

// ==========================================
// 10. Operations & Calendar
// ==========================================
export interface OperationsItem {
  id: string;
  type: "arrival_placard" | "driver_manifest" | "safari_permit" | "train_ticket" | "hotel_checkin" | "activity_dispatch";
  title: string;
  tour_id?: string;
  tour_number?: string;
  guest_name: string;
  pax_count: number;
  flight_details?: string;
  driver_name?: string;
  driver_mobile?: string;
  driver_license?: string;
  vehicle_type?: string;
  vehicle_plate?: string;
  date: string;
  status: "Scheduled" | "Ready" | "Dispatched" | "Completed";
  location?: string;
  notes?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  end_date?: string;
  type: "tour_start" | "tour_end" | "check_in" | "check_out" | "flight_arrival" | "excursion" | "payment_due" | "supplier_due";
  tour_id?: string;
  tour_number?: string;
  client_name: string;
  hotel_or_location: string;
  color?: string;
}

// ==========================================
// 11. Finance: Invoices, Payments, Expenses & P&L
// ==========================================
export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

export interface Invoice {
  id: string;
  company_id?: string;
  invoice_number: string;
  tour_id?: string;
  tour_number?: string;
  client_id?: string;
  client_name: string;
  client_email?: string;
  client_address?: string;
  issue_date: string;
  due_date: string;
  items: InvoiceItem[];
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  paid_amount: number;
  balance_due: number;
  currency: string;
  status: InvoiceStatus;
  payment_instructions?: string;
  created_at: string;
}

export interface Payment {
  id: string;
  company_id?: string;
  reference: string;
  invoice_id?: string;
  tour_id?: string;
  tour_number?: string;
  client_name: string;
  amount: number;
  currency: string;
  method: "Bank Transfer" | "Credit Card" | "Cash" | "Online Payment" | "Stripe";
  date: string;
  status: PaymentStatus;
  transaction_receipt?: string;
  notes?: string;
  created_at: string;
}

export interface SupplierPayment {
  id: string;
  company_id?: string;
  booking_id?: string;
  tour_id?: string;
  tour_number?: string;
  supplier_id?: string;
  supplier_name: string;
  category: SupplierType;
  invoice_reference?: string;
  amount: number;
  currency: string;
  due_date: string;
  paid_date?: string;
  status: SupplierPaymentStatus;
  payment_method?: string;
  notes?: string;
}

export interface TourExpense {
  id: string;
  tour_id: string;
  tour_number: string;
  category: "Fuel" | "Parking" | "Toll" | "Driver Bata" | "Guide Bata" | "Meals" | "Entrance" | "Miscellaneous";
  description: string;
  amount: number;
  currency: string;
  expense_date: string;
  recorded_by?: string;
  receipt_url?: string;
}

export interface ProfitLossSummary {
  tour_id?: string;
  tour_number?: string;
  tour_name?: string;
  total_revenue: number;
  total_supplier_costs: {
    accommodation: number;
    transport: number;
    activities: number;
    guide: number;
    restaurants: number;
    other: number;
  };
  total_direct_cost: number;
  total_expenses: number;
  gross_profit: number;
  gross_margin_percent: number;
  net_profit: number;
  net_margin_percent: number;
}

// ==========================================
// 12. Communication & Templates
// ==========================================
export interface EmailTemplate {
  id: string;
  company_id?: string;
  category?: "hotel_voucher" | "supplier_request" | "client_quote" | "client_itinerary" | "invoice" | "general";
  name: string;
  subject: string;
  body: string;
  is_default: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface EmailLog {
  id: string;
  recipient_email: string;
  recipient_name?: string;
  hotel_name?: string;
  subject: string;
  status: EmailStatus;
  error_message?: string;
  voucher_id?: string;
  voucher_number?: string;
  tour_number?: string;
  sent_at: string;
}

export interface WhatsAppLog {
  id: string;
  phone: string;
  recipient_name: string;
  recipient_type: "Supplier" | "Client" | "Driver" | "Guide";
  tour_number?: string;
  message_preview: string;
  status: "Sent" | "Clicked" | "Delivered";
  sent_at: string;
}

// ==========================================
// 13. Document Management & Audit Logs
// ==========================================
export interface DocumentItem {
  id: string;
  tour_id?: string;
  client_id?: string;
  title: string;
  file_type: "Passport" | "Flight Ticket" | "Hotel Voucher" | "Supplier Confirmation" | "Contract" | "Invoice" | "Receipt" | "Other";
  file_name: string;
  file_size?: string;
  file_url: string;
  uploaded_by: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  action: "Create" | "Edit" | "Delete" | "Approve" | "Send" | "Cancel" | "Payment" | "Confirmation";
  module: "Tours" | "CRM" | "Suppliers" | "Costing" | "Quotations" | "Bookings" | "Vouchers" | "Finance" | "Settings";
  user: string;
  timestamp: string;
  record_id?: string;
  details: string;
  old_value?: string;
  new_value?: string;
}

export interface ExcelParseResult {
  success: boolean;
  rows: AccommodationRow[];
  grouped: GroupedHotelVoucher[];
  totalRows: number;
  errors: string[];
  warnings: string[];
}
