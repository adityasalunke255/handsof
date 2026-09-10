-- ====================================================================
-- BUSINESS SAATHI: Supabase Database Schema
-- Problem Statement ID26090: Empowering Artisans, Weavers & Micro-Entrepreneurs
-- ====================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 1. ARTISANS TABLE
CREATE TABLE IF NOT EXISTS artisans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artisan_code VARCHAR(32) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(15) UNIQUE NOT NULL,
    email VARCHAR(255),
    date_of_birth DATE,
    age INTEGER,
    craft_category VARCHAR(100) NOT NULL,
    craft_specialty VARCHAR(255),
    state VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    social_category VARCHAR(50) NOT NULL DEFAULT 'OBC', -- OBC, SC, ST, General, Women SHG
    language_preference VARCHAR(10) NOT NULL DEFAULT 'hi', -- 'hi', 'mr', 'en'
    visvas_eligible BOOLEAN DEFAULT TRUE,
    profile_status VARCHAR(50) DEFAULT 'VERIFIED_ACTIVE',
    raw_voice_note_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for phone lookups and artisan code
CREATE INDEX IF NOT EXISTS idx_artisans_phone ON artisans(phone);
CREATE INDEX IF NOT EXISTS idx_artisans_code ON artisans(artisan_code);
CREATE INDEX IF NOT EXISTS idx_artisans_craft ON artisans(craft_category);

-- 2. PRODUCTS TABLE (Ready for Module 1 & Module 2)
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artisan_id UUID REFERENCES artisans(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    title_hi VARCHAR(255),
    title_mr VARCHAR(255),
    description TEXT,
    description_hi TEXT,
    description_mr TEXT,
    category VARCHAR(100) NOT NULL,
    craft_type VARCHAR(100),
    material VARCHAR(100),
    color VARCHAR(100),
    production_cost NUMERIC(10, 2),
    suggested_price NUMERIC(10, 2),
    final_price NUMERIC(10, 2),
    monthly_capacity INTEGER DEFAULT 50,
    image_url TEXT,
    enhanced_image_url TEXT,
    ondc_sku VARCHAR(100),
    gem_listing_id VARCHAR(100),
    status VARCHAR(50) DEFAULT 'DRAFT',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. BUYER REQUESTS TABLE (Ready for Module 3 Market Linkage)
CREATE TABLE IF NOT EXISTS buyer_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_name VARCHAR(255) NOT NULL,
    organization VARCHAR(255),
    query_text TEXT NOT NULL,
    category VARCHAR(100),
    quantity_needed INTEGER NOT NULL,
    target_budget_per_unit NUMERIC(10, 2),
    delivery_state VARCHAR(100),
    status VARCHAR(50) DEFAULT 'OPEN',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE artisans ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyer_requests ENABLE ROW LEVEL SECURITY;

-- Anonymous / Authenticated public policies for rapid prototype demo
CREATE POLICY "Public Read Artisans" ON artisans FOR SELECT USING (true);
CREATE POLICY "Public Insert Artisans" ON artisans FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Artisans" ON artisans FOR UPDATE USING (true);

CREATE POLICY "Public Read Products" ON products FOR SELECT USING (true);
CREATE POLICY "Public Insert Products" ON products FOR INSERT WITH CHECK (true);

CREATE POLICY "Public Read Buyer Requests" ON buyer_requests FOR SELECT USING (true);

-- 5. Helper Function: Check MoSJE VISVAS Scheme Interest Subvention Eligibility
-- The VISVAS scheme provides up to 5% interest subvention for loans up to Rs 10 Lakh
-- for OBC, SC, ST or Women SHG micro-entrepreneurs.
CREATE OR REPLACE FUNCTION check_visvas_eligibility(social_cat VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
    IF social_cat IN ('OBC', 'SC', 'ST', 'Women SHG', 'Artisan SHG') THEN
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql;
