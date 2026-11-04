-- ==============================================================================
-- KIRAFOREX DIGITAL PLATFORM — ROW LEVEL SECURITY POLICIES (002_rls_policies.sql)
-- ==============================================================================

-- Enable Row Level Security (RLS) on all public tables
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trading_journal_entries ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 1. EVENTS POLICIES
-- ------------------------------------------------------------------------------
-- Public / Anonymous users: Can ONLY view published, non-expired events
CREATE POLICY "Public users can view active published events only"
ON public.events
FOR SELECT
TO anon, authenticated
USING (
    status = 'published' 
    AND expiry_date > timezone('utc'::text, now())
);

-- Admin users: Full control to view, create, edit, unpublish, and delete
CREATE POLICY "Admins have full access to events"
ON public.events
FOR ALL
TO authenticated
USING (auth.jwt() ->> 'role' = 'authenticated')
WITH CHECK (auth.jwt() ->> 'role' = 'authenticated');

-- ------------------------------------------------------------------------------
-- 2. SERVICES POLICIES
-- ------------------------------------------------------------------------------
-- Public / Anonymous users: Can view published services
CREATE POLICY "Public users can view published services"
ON public.services
FOR SELECT
TO anon, authenticated
USING (status = 'published');

-- Admin users: Full control over academy services
CREATE POLICY "Admins have full access to services"
ON public.services
FOR ALL
TO authenticated
USING (auth.jwt() ->> 'role' = 'authenticated')
WITH CHECK (auth.jwt() ->> 'role' = 'authenticated');

-- ------------------------------------------------------------------------------
-- 3. SITE SETTINGS POLICIES
-- ------------------------------------------------------------------------------
-- Public / Anonymous users: Read-only access to global settings
CREATE POLICY "Public users can read site settings"
ON public.site_settings
FOR SELECT
TO anon, authenticated
USING (true);

-- Admin users: Can update site settings
CREATE POLICY "Admins can update site settings"
ON public.site_settings
FOR ALL
TO authenticated
USING (auth.jwt() ->> 'role' = 'authenticated')
WITH CHECK (auth.jwt() ->> 'role' = 'authenticated');

-- ------------------------------------------------------------------------------
-- 4. CONTACT ENQUIRIES POLICIES
-- ------------------------------------------------------------------------------
-- Public / Anonymous visitors: Can submit an enquiry, but CANNOT read any enquiries
CREATE POLICY "Public visitors can submit enquiries"
ON public.contact_enquiries
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Admin users: Full read and management access to enquiries
CREATE POLICY "Admins can view and manage enquiries"
ON public.contact_enquiries
FOR ALL
TO authenticated
USING (auth.jwt() ->> 'role' = 'authenticated')
WITH CHECK (auth.jwt() ->> 'role' = 'authenticated');

-- ------------------------------------------------------------------------------
-- 5. TRADING JOURNAL POLICIES (User Data Isolation)
-- ------------------------------------------------------------------------------
-- Users can only view and manage their own journal entries
CREATE POLICY "Users manage their own trading journal"
ON public.trading_journal_entries
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 6. STORAGE BUCKETS (Events Thumbnails & Media)
-- ------------------------------------------------------------------------------
-- (Bucket creation script for Supabase Storage)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('event-thumbnails', 'event-thumbnails', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('media-library', 'media-library', true)
ON CONFLICT (id) DO NOTHING;

-- Public can read images from event-thumbnails
CREATE POLICY "Public can read event thumbnails"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'event-thumbnails');

-- Only authenticated admins can upload and delete thumbnails
CREATE POLICY "Admins can upload event thumbnails"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'event-thumbnails');

CREATE POLICY "Admins can update and delete event thumbnails"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'event-thumbnails');

CREATE POLICY "Admins can delete event thumbnails"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'event-thumbnails');
