-- Composite indexes for improved query performance
-- Run these in your PostgreSQL database to optimize common queries

-- User-related indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role_status ON users(role_id, status);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- Artist indexes
CREATE INDEX idx_artists_user_id ON artists(user_id);
CREATE INDEX idx_artists_primary_talent ON artists(primary_talent_id);
CREATE INDEX idx_artists_stage_names ON artists USING gin(stage_names);

-- Musician indexes
CREATE INDEX idx_musicians_user_id ON musicians(user_id);
CREATE INDEX idx_musicians_primary_talent ON musicians(primary_talent_id);
CREATE INDEX idx_musicians_stage_name ON musicians(stage_name);

-- Professional indexes
CREATE INDEX idx_professionals_user_id ON professionals(user_id);
CREATE INDEX idx_professionals_primary_talent ON professionals(primary_talent_id);

-- Booking indexes
CREATE INDEX idx_bookings_artist_id_status ON bookings(artist_user_id, status);
CREATE INDEX idx_bookings_event_date ON bookings(event_date);
CREATE INDEX idx_bookings_created_at ON bookings(created_at DESC);
CREATE INDEX idx_bookings_workflow_status ON bookings(workflow_status);

-- Booking assignments indexes
CREATE INDEX idx_booking_assignments_booking_id ON booking_assignments(booking_id);
CREATE INDEX idx_booking_assignments_assigned_user ON booking_assignments(assigned_user_id);
CREATE INDEX idx_booking_assignments_active ON booking_assignments(booking_id, is_active) WHERE is_active = true;

-- Song indexes
CREATE INDEX idx_songs_artist_id ON songs(artist_user_id);
CREATE INDEX idx_songs_album_id ON songs(album_id);
CREATE INDEX idx_songs_release_date ON songs(release_date);
CREATE INDEX idx_songs_isrc ON songs(isrc_code);

-- Album indexes
CREATE INDEX idx_albums_artist_id ON albums(artist_user_id);
CREATE INDEX idx_albums_release_date ON albums(release_date);

-- Media hub indexes
CREATE INDEX idx_media_hub_user_id_type ON media_hub(user_id, media_type);
CREATE INDEX idx_media_hub_entity_reference ON media_hub(entity_type, entity_id);
CREATE INDEX idx_media_hub_created_at ON media_hub(created_at DESC);

-- Opportunity indexes
CREATE INDEX idx_opportunities_status_created ON opportunities(status, created_at DESC);
CREATE INDEX idx_opportunities_source ON opportunities(source);
CREATE INDEX idx_opportunities_deadline ON opportunities(submission_deadline) WHERE submission_deadline IS NOT NULL;

-- Transaction indexes
CREATE INDEX idx_transactions_user_id_type ON user_transactions(user_id, transaction_type);
CREATE INDEX idx_transactions_created_at ON user_transactions(created_at DESC);
CREATE INDEX idx_transactions_status ON user_transactions(status);

-- Shopping cart indexes
CREATE INDEX idx_shopping_cart_user_id ON shopping_cart(user_id);
CREATE INDEX idx_shopping_cart_session ON shopping_cart(session_id) WHERE session_id IS NOT NULL;

-- Newsletter indexes
CREATE INDEX idx_newsletter_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX idx_newsletter_subscribers_status ON newsletter_subscribers(subscription_status);

-- PRO registration indexes
CREATE INDEX idx_pro_registrations_user_id ON pro_registrations(user_id);
CREATE INDEX idx_pro_registrations_status ON pro_registrations(registration_status);

-- Splitsheet indexes
CREATE INDEX idx_splitsheets_artist_id ON splitsheets(artist_user_id);
CREATE INDEX idx_splitsheets_status ON splitsheets(status);

-- Technical rider indexes
CREATE INDEX idx_technical_riders_booking_id ON technical_riders(booking_id);

-- Full-text search indexes
CREATE INDEX idx_songs_title_search ON songs USING gin(to_tsvector('english', title));
CREATE INDEX idx_albums_title_search ON albums USING gin(to_tsvector('english', title));
CREATE INDEX idx_users_fullname_search ON users USING gin(to_tsvector('english', full_name));
CREATE INDEX idx_opportunities_search ON opportunities USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- Partial indexes for commonly filtered queries
CREATE INDEX idx_active_users ON users(id) WHERE status = 'active';
CREATE INDEX idx_pending_bookings ON bookings(id) WHERE workflow_status = 'pending';
CREATE INDEX idx_published_songs ON songs(id) WHERE is_published = true;
CREATE INDEX idx_available_merch ON merchandise(id) WHERE stock_quantity > 0;

-- Analyze tables after creating indexes
ANALYZE users, artists, musicians, professionals, bookings, booking_assignments, songs, albums, media_hub, opportunities;