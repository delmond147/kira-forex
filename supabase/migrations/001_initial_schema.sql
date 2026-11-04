-- ==============================================================================
-- KIRAFOREX DIGITAL PLATFORM — DATABASE INITIAL SCHEMA (001_initial_schema.sql)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. EVENTS TABLE (Full lifecycle, thumbnail, pricing, and automated expiry)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    short_description TEXT NOT NULL,
    full_description TEXT NOT NULL,
    thumbnail_url TEXT NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    expiry_date TIMESTAMPTZ NOT NULL,
    time_zone VARCHAR(50) NOT NULL DEFAULT 'UTC',
    venue_type VARCHAR(50) NOT NULL DEFAULT 'Online', -- 'Online', 'In-Person', 'Hybrid'
    location_or_link TEXT,
    price_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    price_currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    booking_whatsapp VARCHAR(50),
    booking_call VARCHAR(50),
    booking_url TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'published', -- 'draft', 'published', 'expired', 'archived'
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Essential index for performance and real-time public expiry filtering
CREATE INDEX IF NOT EXISTS idx_events_status_expiry 
ON public.events (status, expiry_date);

CREATE INDEX IF NOT EXISTS idx_events_slug 
ON public.events (slug);

-- ------------------------------------------------------------------------------
-- 2. SERVICES & ACADEMY COURSES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    short_description TEXT NOT NULL,
    full_description TEXT NOT NULL,
    icon VARCHAR(100),
    cover_image_url TEXT,
    price_amount NUMERIC(10,2),
    price_currency VARCHAR(10) DEFAULT 'USD',
    delivery_format VARCHAR(100), -- 'Live Online Classes', '1-on-1 Mentorship', etc.
    duration VARCHAR(50), -- e.g. '4 Weeks Intensive', 'Quarterly Mentorship'
    features JSONB NOT NULL DEFAULT '[]'::jsonb,
    cta_text VARCHAR(100) DEFAULT 'Book Consultation',
    cta_whatsapp_message TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'published', -- 'draft', 'published', 'archived'
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_services_status_order 
ON public.services (status, display_order);

-- ------------------------------------------------------------------------------
-- 3. SITE SETTINGS & BRAND DESTINATIONS (Single-row configuration)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_settings (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'global',
    site_title VARCHAR(255) NOT NULL DEFAULT 'KIRAFOREX — Trading Academy & Digital Platform',
    hero_badge VARCHAR(255) NOT NULL DEFAULT 'KIRAFOREX TRADING ACADEMY',
    hero_headline VARCHAR(255) NOT NULL DEFAULT 'Master the Financial Markets with Precision',
    hero_subheadline TEXT NOT NULL DEFAULT 'Institutional trading education, proven risk management tools, and an empowering community built for serious traders.',
    about_snippet TEXT NOT NULL DEFAULT 'Founded by Kira, Africa''s premier female forex mentor, Kiraforex Trading Academy provides pragmatic market education, rigorous risk frameworks, and high-conviction market execution.',
    primary_telegram_url TEXT NOT NULL DEFAULT 'https://t.me/kira_forex',
    synthetics_telegram_url TEXT NOT NULL DEFAULT 'https://t.me/kiraforexsynth',
    deriv_partner_url TEXT NOT NULL DEFAULT 'https://t.deriv.link/?t=642J9K6PYXX5',
    youtube_url TEXT NOT NULL DEFAULT 'https://youtube.com/@kiraforexgh?si=9Jb8w2JXp1lYrF6U',
    whatsapp_general_url TEXT NOT NULL DEFAULT 'https://wa.me/message/WELLF6ZJDKQXA1',
    whatsapp_phone VARCHAR(50) NOT NULL DEFAULT '+233 502 75 8608',
    call_phone VARCHAR(50) NOT NULL DEFAULT '+233 594 86 2521',
    facebook_url TEXT NOT NULL DEFAULT 'https://web.facebook.com/profile.php?id=61585879264537',
    instagram_url TEXT NOT NULL DEFAULT 'https://www.instagram.com/kira_forex?exln=aWF0dzNodmpwcTc5',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 4. CONTACT ENQUIRIES TABLE (Private lead capture)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contact_enquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    service_interest VARCHAR(100),
    message TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'new', -- 'new', 'replied', 'archived'
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_contact_enquiries_status 
ON public.contact_enquiries (status, created_at DESC);

-- ------------------------------------------------------------------------------
-- 5. TRADING JOURNAL TABLE (Optional cloud sync with user isolation)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.trading_journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    instrument VARCHAR(50) NOT NULL,
    trade_direction VARCHAR(10) NOT NULL, -- 'BUY' or 'SELL'
    entry_price NUMERIC(14,5) NOT NULL,
    exit_price NUMERIC(14,5),
    stop_loss NUMERIC(14,5) NOT NULL,
    take_profit NUMERIC(14,5),
    position_size NUMERIC(10,2) NOT NULL, -- Lots
    risk_amount NUMERIC(12,2),
    profit_loss NUMERIC(12,2),
    strategy VARCHAR(100),
    trading_session VARCHAR(50), -- 'London', 'New York', 'Asian', 'Overlap'
    emotional_state VARCHAR(50), -- 'Disciplined', 'Patient', 'FOMO', 'Anxious'
    mistakes_lessons TEXT,
    notes TEXT,
    trade_date TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_trading_journal_user 
ON public.trading_journal_entries (user_id, trade_date DESC);

-- Automatic timestamp updater trigger function
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_events_modtime
    BEFORE UPDATE ON public.events
    FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

CREATE TRIGGER update_services_modtime
    BEFORE UPDATE ON public.services
    FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

CREATE TRIGGER update_site_settings_modtime
    BEFORE UPDATE ON public.site_settings
    FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();
