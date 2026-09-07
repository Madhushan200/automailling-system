-- ============================================================================
-- DODOZ LEISURE CRM & HOTEL VOUCHER SYSTEM - COMPLETE DATABASE SCHEMA (PostgreSQL / Supabase)
-- ============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 2. ENUM TYPES
-- ============================================================================
DO $$ BEGIN
    CREATE TYPE tour_status_enum AS ENUM (
        'Draft', 'Costing', 'Quotation', 'Awaiting Confirmation', 'Confirmed', 'Operations', 'Completed', 'Cancelled'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE voucher_status_enum AS ENUM (
        'draft', 'issued', 'sent', 'failed', 'cancelled'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE meal_plan_enum AS ENUM (
        'RO', 'BB', 'HB', 'FB', 'AI'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- 3. MASTER HOTEL DATABASE TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS hotels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_name VARCHAR(255) NOT NULL UNIQUE,
    reservation_email VARCHAR(255) NOT NULL,
    cc_email VARCHAR(255),
    bcc_email VARCHAR(255),
    contact_person VARCHAR(255),
    phone VARCHAR(100),
    whatsapp VARCHAR(100),
    address TEXT,
    city VARCHAR(100) DEFAULT 'Sri Lanka',
    country VARCHAR(100) DEFAULT 'Sri Lanka',
    website VARCHAR(255),
    star_rating NUMERIC(2,1) DEFAULT 4.0,
    currency VARCHAR(10) DEFAULT 'USD',
    payment_terms VARCHAR(255) DEFAULT 'Direct Agency Settlement',
    notes TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 4. TOURS TABLE (DIRECT DATA ENTRY & EMBEDDED TABLES)
-- ============================================================================
CREATE TABLE IF NOT EXISTS tours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tour_reference VARCHAR(100) NOT NULL UNIQUE,
    tour_name VARCHAR(255) NOT NULL DEFAULT 'Sri Lanka Tour',
    client_name VARCHAR(255) NOT NULL,
    pax INTEGER NOT NULL DEFAULT 2,
    adults_count INTEGER DEFAULT 2,
    children_count INTEGER DEFAULT 0,
    infants_count INTEGER DEFAULT 0,
    arrival_date DATE NOT NULL,
    departure_date DATE NOT NULL,
    days_count INTEGER NOT NULL DEFAULT 1,
    nights_count INTEGER NOT NULL DEFAULT 1,
    destination VARCHAR(100) DEFAULT 'Sri Lanka',
    status tour_status_enum DEFAULT 'Confirmed',
    currency VARCHAR(10) DEFAULT 'USD',
    exchange_rate NUMERIC(10,4) DEFAULT 1.0,
    base_currency VARCHAR(10) DEFAULT 'USD',
    
    -- Financials
    total_cost NUMERIC(12,2) DEFAULT 0.00,
    selling_price NUMERIC(12,2) DEFAULT 0.00,
    gross_profit NUMERIC(12,2) DEFAULT 0.00,
    gross_margin_percent NUMERIC(5,2) DEFAULT 0.00,
    
    -- Tour Remarks
    notes TEXT,
    
    -- Dynamic JSONB Tables (Excel Replicas)
    accommodation_rows JSONB DEFAULT '[]'::jsonb,
    transportation_rows JSONB DEFAULT '[]'::jsonb,
    miscellaneous_rows JSONB DEFAULT '[]'::jsonb,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 5. HOTEL VOUCHERS TABLE (ISOLATED PER PROPERTY)
-- ============================================================================
CREATE TABLE IF NOT EXISTS vouchers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    voucher_number VARCHAR(100) NOT NULL UNIQUE,
    tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
    tour_reference VARCHAR(100) NOT NULL,
    hotel_id UUID REFERENCES hotels(id) ON DELETE SET NULL,
    hotel_name VARCHAR(255) NOT NULL,
    hotel_email VARCHAR(255) NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    check_in_date VARCHAR(50),
    check_out_date VARCHAR(50),
    nights_count INTEGER DEFAULT 1,
    
    -- Isolated Accommodation Rows for this specific hotel
    rows JSONB NOT NULL DEFAULT '[]'::jsonb,
    
    status voucher_status_enum DEFAULT 'draft',
    email_status VARCHAR(50) DEFAULT 'pending',
    pdf_url TEXT,
    sent_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 6. EMAIL AUDIT LOGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    voucher_id UUID REFERENCES vouchers(id) ON DELETE SET NULL,
    recipient_email VARCHAR(255) NOT NULL,
    cc_email VARCHAR(255),
    hotel_name VARCHAR(255) NOT NULL,
    subject TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'sent',
    error_message TEXT,
    sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 7. COMPANY SETTINGS & SMTP CONFIGURATION
-- ============================================================================
CREATE TABLE IF NOT EXISTS company_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(255) NOT NULL DEFAULT 'Dodoz Leisure (Pvt) Ltd',
    logo_url TEXT DEFAULT 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=180&auto=format&fit=crop&q=80',
    address TEXT DEFAULT 'No. 45, Galle Road, Colombo 03, Sri Lanka',
    phone VARCHAR(100) DEFAULT '+94 11 234 5678',
    whatsapp VARCHAR(100) DEFAULT '+94 77 123 4567',
    email VARCHAR(255) DEFAULT 'reservations@dodozleisure.com',
    website VARCHAR(255) DEFAULT 'https://dodozleisure.com',
    tax_number VARCHAR(100) DEFAULT 'VAT-2026-DL-8890',
    voucher_title VARCHAR(255) DEFAULT 'HOTEL ACCOMMODATION VOUCHER',
    footer_note TEXT DEFAULT 'This is a computer-generated voucher. No physical signature is required.',
    terms TEXT DEFAULT '1. Please provide accommodation as specified above.\n2. Present this voucher at check-in.\n3. Billing as per contract agreement.',
    
    -- Hostinger SMTP Settings
    smtp_provider VARCHAR(50) DEFAULT 'hostinger',
    smtp_host VARCHAR(255) DEFAULT 'smtp.hostinger.com',
    smtp_port INTEGER DEFAULT 465,
    smtp_user VARCHAR(255) DEFAULT 'reservations@dodozleisure.com',
    smtp_pass TEXT DEFAULT 'YourSecurePasswordHere',
    smtp_secure BOOLEAN DEFAULT true,
    sender_name VARCHAR(255) DEFAULT 'Dodoz Leisure Reservations',
    sender_email VARCHAR(255) DEFAULT 'reservations@dodozleisure.com',
    
    base_currency VARCHAR(10) DEFAULT 'USD',
    exchange_rate_lkr NUMERIC(10,2) DEFAULT 305.00,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 8. INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_tours_reference ON tours(tour_reference);
CREATE INDEX IF NOT EXISTS idx_tours_client_name ON tours(client_name);
CREATE INDEX IF NOT EXISTS idx_tours_arrival_date ON tours(arrival_date);
CREATE INDEX IF NOT EXISTS idx_hotels_name ON hotels(hotel_name);
CREATE INDEX IF NOT EXISTS idx_hotels_email ON hotels(reservation_email);
CREATE INDEX IF NOT EXISTS idx_vouchers_tour_ref ON vouchers(tour_reference);
CREATE INDEX IF NOT EXISTS idx_vouchers_hotel_name ON vouchers(hotel_name);
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON email_logs(recipient_email);

-- ============================================================================
-- 9. AUTO-UPDATE TIMESTAMP TRIGGER FUNCTION
-- ============================================================================
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_hotels_timestamp ON hotels;
CREATE TRIGGER trg_update_hotels_timestamp
BEFORE UPDATE ON hotels
FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

DROP TRIGGER IF EXISTS trg_update_tours_timestamp ON tours;
CREATE TRIGGER trg_update_tours_timestamp
BEFORE UPDATE ON tours
FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

DROP TRIGGER IF EXISTS trg_update_vouchers_timestamp ON vouchers;
CREATE TRIGGER trg_update_vouchers_timestamp
BEFORE UPDATE ON vouchers
FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

-- ============================================================================
-- 10. ROW LEVEL SECURITY (RLS) FOR SUPABASE
-- ============================================================================
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

-- Allow full access for authenticated and anon development service roles
CREATE POLICY "Allow public read hotels" ON hotels FOR SELECT USING (true);
CREATE POLICY "Allow public insert hotels" ON hotels FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update hotels" ON hotels FOR UPDATE USING (true);
CREATE POLICY "Allow public delete hotels" ON hotels FOR DELETE USING (true);

CREATE POLICY "Allow public read tours" ON tours FOR SELECT USING (true);
CREATE POLICY "Allow public insert tours" ON tours FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update tours" ON tours FOR UPDATE USING (true);
CREATE POLICY "Allow public delete tours" ON tours FOR DELETE USING (true);

CREATE POLICY "Allow public read vouchers" ON vouchers FOR SELECT USING (true);
CREATE POLICY "Allow public insert vouchers" ON vouchers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update vouchers" ON vouchers FOR UPDATE USING (true);
CREATE POLICY "Allow public delete vouchers" ON vouchers FOR DELETE USING (true);

CREATE POLICY "Allow public read logs" ON email_logs FOR SELECT USING (true);
CREATE POLICY "Allow public insert logs" ON email_logs FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read settings" ON company_settings FOR SELECT USING (true);
CREATE POLICY "Allow public update settings" ON company_settings FOR UPDATE USING (true);

-- ============================================================================
-- 11. INITIAL SEED DATA
-- ============================================================================

-- 11.1 Seed Company Settings
INSERT INTO company_settings (
    company_name, email, phone, whatsapp, website, address, tax_number
) VALUES (
    'Dodoz Leisure (Pvt) Ltd',
    'reservations@dodozleisure.com',
    '+94 11 234 5678',
    '+94 77 123 4567',
    'https://dodozleisure.com',
    'No. 45, Galle Road, Colombo 03, Sri Lanka',
    'VAT-2026-DL-8890'
) ON CONFLICT DO NOTHING;

-- 11.2 Seed Master Hotels Directory
INSERT INTO hotels (hotel_name, reservation_email, cc_email, city, contact_person, phone, address, star_rating)
VALUES
    ('EARLS REGENT', 'reservations@regentkandy.com', 'frontdesk@regentkandy.com', 'Kandy', 'Mr. Asela Bandara', '+94 81 222 3456', 'Devalakoppa, Kandy, Sri Lanka', 4.5),
    ('ARALIYA RED', 'res@araliyared.com', 'fo@araliyared.com', 'Nuwara Eliya', 'Ms. Dilani Silva', '+94 52 222 4500', 'No. 82, Upper Lake Road, Nuwara Eliya', 4.5),
    ('GRANBELL', 'reservations@granbellhotel.lk', 'fo@granbellhotel.lk', 'Colombo', 'Mr. Kenji Takahashi', '+94 11 233 4455', 'No. 282/5, Marine Drive, Kollupitiya, Colombo 03', 4.5),
    ('EARLS REGENT BERUWELA', 'beruwela.res@earlsregent.com', 'gm@earlsregent.com', 'Beruwela', 'Mr. Chaminda Perera', '+94 34 227 6543', 'Moragalla, Beruwela, Sri Lanka', 4.0),
    ('CINNAMON GRAND', 'grand.reservations@cinnamonhotels.com', 'fo.grand@cinnamonhotels.com', 'Colombo', 'Mr. Rohan Fernando', '+94 11 243 7437', '77 Galle Road, Colombo 03', 5.0)
ON CONFLICT (hotel_name) DO UPDATE SET
    reservation_email = EXCLUDED.reservation_email,
    cc_email = EXCLUDED.cc_email,
    city = EXCLUDED.city;

-- 11.3 Seed Sample Tour (DL-2026-001) Matching Reference Excel
INSERT INTO tours (
    tour_reference,
    tour_name,
    client_name,
    pax,
    adults_count,
    arrival_date,
    departure_date,
    days_count,
    nights_count,
    notes,
    status,
    total_cost,
    selling_price,
    gross_profit,
    gross_margin_percent,
    accommodation_rows,
    transportation_rows,
    miscellaneous_rows
) VALUES (
    'DL-2026-001',
    'Sri Lanka 5-Day Highlights & Scenic Highlands',
    'Dr. Jonathan Hayes & Family',
    4,
    4,
    '2026-06-10',
    '2026-06-15',
    5,
    4,
    'VIP group. Early check-in requested where available.',
    'Confirmed',
    3200.00,
    3850.00,
    650.00,
    16.88,
    '[
        {"id": "row-1", "date": "10/06/2026", "hotel": "EARLS REGENT", "mealPlan": "HB", "sgl": 0, "dbl": 70, "tpl": 0},
        {"id": "row-2", "date": "11/06/2026", "hotel": "EARLS REGENT", "mealPlan": "HB", "sgl": 0, "dbl": 70, "tpl": 0},
        {"id": "row-3", "date": "12/06/2026", "hotel": "ARALIYA RED", "mealPlan": "HB", "sgl": 0, "dbl": 100, "tpl": 0},
        {"id": "row-4", "date": "13/06/2026", "hotel": "ARALIYA RED", "mealPlan": "HB", "sgl": 0, "dbl": 100, "tpl": 0},
        {"id": "row-5", "date": "14/06/2026", "hotel": "GRANBELL", "mealPlan": "HB", "sgl": 0, "dbl": 105, "tpl": 0}
    ]'::jsonb,
    '[
        {"id": "tr-1", "day": "DAY 1", "route": "Kandy / Colombo", "km": 190},
        {"id": "tr-2", "day": "DAY 2", "route": "Kandy Local Sightseeing", "km": 300},
        {"id": "tr-3", "day": "DAY 3", "route": "Kandy to Nuwara Eliya via Tea Factory", "km": 90},
        {"id": "tr-4", "day": "DAY 4", "route": "Nuwara Eliya / Horton Plains", "km": 80},
        {"id": "tr-5", "day": "DAY 5", "route": "Nuwara Eliya to Colombo via Kitulgala", "km": 350}
    ]'::jsonb,
    '[
        {"id": "m-1", "item": "SANITIZER PACK", "qty_value": 300},
        {"id": "m-2", "item": "EXTRAS", "qty_value": ""},
        {"id": "m-3", "item": "JEEP RATE", "qty_value": 0},
        {"id": "m-4", "item": "BOATS RATE", "qty_value": 0},
        {"id": "m-5", "item": "ENTRANCE FEES", "qty_value": ""},
        {"id": "m-6", "item": "07 LUNCHES", "qty_value": 70},
        {"id": "m-7", "item": "KELANIYA TEMPLE", "qty_value": 2},
        {"id": "m-8", "item": "PINNAWELA", "qty_value": 15},
        {"id": "m-9", "item": "KANDY TEMPLE", "qty_value": 6}
    ]'::jsonb
) ON CONFLICT (tour_reference) DO UPDATE SET
    client_name = EXCLUDED.client_name,
    accommodation_rows = EXCLUDED.accommodation_rows;
