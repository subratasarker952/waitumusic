-- DATABASE MIGRATION SCRIPT: From JSONB-Heavy to Normalized Relational Tables
-- This migration restructures user data from complex JSONB columns to proper relational tables
--
-- IMPORTANT: This script performs data migration WITHOUT destroying existing data
-- Run this script in staging environment first, then production

-- ====================
-- 1. CREATE NEW NORMALIZED TABLES
-- ====================

-- Normalized user data tables
CREATE TABLE IF NOT EXISTS user_secondary_roles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  role_id INTEGER NOT NULL REFERENCES roles(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_secondary_performance_roles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  role_name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_secondary_professional_roles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  role_name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_professional_services (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  duration INTEGER, -- in minutes
  unit TEXT DEFAULT 'session',
  enable_rating BOOLEAN DEFAULT true,
  category_id INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_professional_service_features (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  service_id INTEGER NOT NULL REFERENCES user_professional_services(id),
  feature_name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_professional_service_capabilities (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  capability_name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_specializations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  specialization_name TEXT NOT NULL,
  is_top BOOLEAN DEFAULT false, -- Combines specializations and top_specializations
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_social_links (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  platform TEXT NOT NULL,
  handle TEXT,
  url TEXT NOT NULL,
  is_website BOOLEAN DEFAULT false, -- For website_url
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_stage_names (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  stage_name TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  is_for_bookings BOOLEAN DEFAULT true,
  usage_type TEXT DEFAULT 'both', -- 'primary', 'bookings', 'both'
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_genres (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  genre_name TEXT NOT NULL,
  category TEXT, -- For secondary_genres categorization
  is_top BOOLEAN DEFAULT false, -- Combines secondary_genres and top_genres
  is_custom BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_technical_requirements (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  requirement_type TEXT NOT NULL, -- 'equipment', 'stage_setup', etc.
  requirement_name TEXT NOT NULL,
  specifications TEXT,
  is_required BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_skills_and_instruments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  skill_type TEXT NOT NULL, -- 'instrument', 'skill', 'capability'
  skill_name TEXT NOT NULL,
  proficiency_level TEXT, -- 'beginner', 'intermediate', 'advanced', 'expert'
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_hospitality_requirements (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  requirement_type TEXT NOT NULL, -- 'catering', 'accommodation', 'transportation'
  requirement_name TEXT NOT NULL,
  specifications TEXT,
  is_required BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_performance_specs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  spec_type TEXT NOT NULL, -- 'duration', 'break_requirements', 'setup_time'
  spec_name TEXT NOT NULL,
  spec_value TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_availability (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  day_of_week TEXT, -- 'monday', 'tuesday', etc. or null for date-specific
  available_date TIMESTAMP, -- Specific date availability
  start_time TEXT, -- '09:00'
  end_time TEXT, -- '17:00'
  availability_type TEXT NOT NULL, -- 'regular', 'exception', 'blocked'
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ====================
-- 2. UPDATE USERS TABLE STRUCTURE
-- ====================

-- Add new columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS privacy_setting TEXT DEFAULT 'public'; -- public/private
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT; -- Media hub reference
ALTER TABLE users ADD COLUMN IF NOT EXISTS cover_image_url TEXT; -- Media hub reference

-- ====================
-- 3. SIMPLIFY ARTIST/MUSICIAN/PROFESSIONAL TABLES
-- ====================

-- Add simplified columns to artists table
ALTER TABLE artists ADD COLUMN IF NOT EXISTS stage_name TEXT;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS epk_url TEXT; -- Media hub reference to EPK PDF
ALTER TABLE artists ADD COLUMN IF NOT EXISTS is_registered_with_pro BOOLEAN DEFAULT false;

-- Add simplified columns to musicians table
ALTER TABLE musicians ADD COLUMN IF NOT EXISTS is_registered_with_pro BOOLEAN DEFAULT false;

-- ====================
-- 4. CREATE INDICES FOR PERFORMANCE
-- ====================

-- Indices for normalized user data tables
CREATE INDEX IF NOT EXISTS idx_user_secondary_roles_user_id ON user_secondary_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_social_links_user_id ON user_social_links(user_id);
CREATE INDEX IF NOT EXISTS idx_user_stage_names_user_id ON user_stage_names(user_id);
CREATE INDEX IF NOT EXISTS idx_user_stage_names_primary ON user_stage_names(user_id, is_primary);
CREATE INDEX IF NOT EXISTS idx_user_genres_user_id ON user_genres(user_id);
CREATE INDEX IF NOT EXISTS idx_user_genres_top ON user_genres(user_id, is_top);
CREATE INDEX IF NOT EXISTS idx_user_skills_user_id ON user_skills_and_instruments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_specializations_user_id ON user_specializations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_specializations_top ON user_specializations(user_id, is_top);

-- ====================
-- 5. DATA MIGRATION QUERIES (COMMENTED OUT - RUN SEPARATELY)
-- ====================

/*
-- These queries will migrate existing JSONB data to normalized tables
-- Run these one by one after creating the tables above

-- Migrate secondary_roles from users table
INSERT INTO user_secondary_roles (user_id, role_id)
SELECT u.id, CAST((jsonb_array_elements_text(u.secondary_roles))::text AS INTEGER)
FROM users u
WHERE u.secondary_roles IS NOT NULL AND jsonb_array_length(u.secondary_roles) > 0;

-- Migrate stage_names from artists table  
INSERT INTO user_stage_names (user_id, stage_name, is_primary, is_for_bookings, usage_type)
SELECT a.user_id, 
       (stage_name_obj->>'name')::text,
       COALESCE((stage_name_obj->>'isPrimary')::boolean, false),
       COALESCE((stage_name_obj->>'isForBookings')::boolean, true),
       COALESCE((stage_name_obj->>'usageType')::text, 'both')
FROM artists a, jsonb_array_elements(a.stage_names) AS stage_name_obj
WHERE a.stage_names IS NOT NULL AND jsonb_array_length(a.stage_names) > 0;

-- Migrate stage_names from musicians table
INSERT INTO user_stage_names (user_id, stage_name, is_primary, is_for_bookings, usage_type)
SELECT m.user_id, 
       (stage_name_obj->>'name')::text,
       COALESCE((stage_name_obj->>'isPrimary')::boolean, false),
       COALESCE((stage_name_obj->>'isForBookings')::boolean, true),
       COALESCE((stage_name_obj->>'usageType')::text, 'both')
FROM musicians m, jsonb_array_elements(m.stage_names) AS stage_name_obj
WHERE m.stage_names IS NOT NULL AND jsonb_array_length(m.stage_names) > 0;

-- Migrate social_media_handles from artists table
INSERT INTO user_social_links (user_id, platform, handle, url)
SELECT a.user_id,
       (social_obj->>'platform')::text,
       (social_obj->>'handle')::text,
       (social_obj->>'url')::text
FROM artists a, jsonb_array_elements(a.social_media_handles) AS social_obj
WHERE a.social_media_handles IS NOT NULL AND jsonb_array_length(a.social_media_handles) > 0;

-- Migrate social_media_handles from musicians table
INSERT INTO user_social_links (user_id, platform, handle, url)
SELECT m.user_id,
       (social_obj->>'platform')::text,
       (social_obj->>'handle')::text,
       (social_obj->>'url')::text
FROM musicians m, jsonb_array_elements(m.social_media_handles) AS social_obj
WHERE m.social_media_handles IS NOT NULL AND jsonb_array_length(m.social_media_handles) > 0;

-- Migrate secondary_genres from artists table
INSERT INTO user_genres (user_id, genre_name, category, is_custom)
SELECT a.user_id,
       (genre_obj->>'name')::text,
       (genre_obj->>'category')::text,
       COALESCE((genre_obj->>'isCustom')::boolean, false)
FROM artists a, jsonb_array_elements(a.secondary_genres) AS genre_obj
WHERE a.secondary_genres IS NOT NULL AND jsonb_array_length(a.secondary_genres) > 0;

-- Migrate top_genres from artists table
INSERT INTO user_genres (user_id, genre_name, is_top)
SELECT a.user_id, 
       jsonb_array_elements_text(a.top_genres)::text,
       true
FROM artists a
WHERE a.top_genres IS NOT NULL AND jsonb_array_length(a.top_genres) > 0;

-- Similar migrations for musicians, professionals...
-- Add more migration queries as needed for other JSONB fields
*/

-- ====================
-- 6. CONSTRAINTS AND VALIDATION
-- ====================

-- Add constraints to ensure data integrity
ALTER TABLE user_stage_names ADD CONSTRAINT unique_primary_stage_name_per_user 
  EXCLUDE (user_id WITH =) WHERE (is_primary = true);

-- Add unique constraints where appropriate
ALTER TABLE user_social_links ADD CONSTRAINT unique_platform_per_user 
  UNIQUE (user_id, platform);

-- ====================
-- MIGRATION COMPLETE
-- ====================
-- This migration creates the new normalized structure
-- The old JSONB columns are preserved for backward compatibility
-- After successful testing, the old columns can be dropped in a future migration