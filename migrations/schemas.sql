CREATE TABLE "admin_assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"admin_user_id" integer NOT NULL,
	"managed_user_id" integer NOT NULL,
	"assigned_by_user_id" integer NOT NULL,
	"is_active" boolean DEFAULT true,
	"assigned_at" timestamp DEFAULT now(),
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "admin_configurations" (
	"id" serial PRIMARY KEY NOT NULL,
	"configuration_key" text NOT NULL,
	"configuration_data" jsonb NOT NULL,
	"last_modified_by" integer NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "admin_configurations_configuration_key_unique" UNIQUE("configuration_key")
);
--> statement-breakpoint
CREATE TABLE "album_songs" (
	"album_id" integer,
	"song_id" integer,
	"track_number" integer
);
--> statement-breakpoint
CREATE TABLE "albums" (
	"id" serial PRIMARY KEY NOT NULL,
	"artist_user_id" integer NOT NULL,
	"title" text NOT NULL,
	"genre" text,
	"cover_art_url" text,
	"price" numeric(10, 2),
	"total_tracks" integer,
	"use_custom_pricing" boolean DEFAULT false,
	"release_date" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "all_instruments" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"player_name" text NOT NULL,
	"type" text NOT NULL,
	"mixer_group" text NOT NULL,
	"display_priority" integer DEFAULT 100 NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "all_links_penalties" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"website_integration_id" integer,
	"blocked_url" text NOT NULL,
	"reason" text NOT NULL,
	"penalty_amount" numeric(10, 2) NOT NULL,
	"is_active" boolean DEFAULT true,
	"resolved_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "all_links_subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"tier_level" integer NOT NULL,
	"is_active" boolean DEFAULT true,
	"stripe_subscription_id" text,
	"stripe_customer_id" text,
	"current_period_start" timestamp,
	"current_period_end" timestamp,
	"canceled_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "application_legal_assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"application_id" integer NOT NULL,
	"lawyer_user_id" integer NOT NULL,
	"assignment_role" text NOT NULL,
	"authority_level" text NOT NULL,
	"can_sign_contracts" boolean DEFAULT false,
	"can_modify_terms" boolean DEFAULT false,
	"can_finalize_agreements" boolean DEFAULT false,
	"assigned_at" timestamp DEFAULT now(),
	"assigned_by_user_id" integer NOT NULL,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "artist_band_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"artist_user_id" integer NOT NULL,
	"musician_user_id" integer NOT NULL,
	"default_role" integer DEFAULT 6,
	"primary_instrument_id" integer,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "artist_catalog" (
	"id" serial PRIMARY KEY NOT NULL,
	"artist_id" integer NOT NULL,
	"song_id" integer,
	"submission_id" integer,
	"song_title" varchar(255) NOT NULL,
	"isrc_code" varchar(12),
	"audio_file_url" text,
	"vocal_removed_url" text,
	"chord_chart_url" text,
	"setlist_position" integer,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "artist_musician_assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"artist_user_id" integer NOT NULL,
	"musician_user_id" integer NOT NULL,
	"assigned_by_user_id" integer NOT NULL,
	"assignment_type" text DEFAULT 'collaboration',
	"is_active" boolean DEFAULT true,
	"assigned_at" timestamp DEFAULT now(),
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "artist_similarities" (
	"id" serial PRIMARY KEY NOT NULL,
	"artist_id_1" integer NOT NULL,
	"artist_id_2" integer NOT NULL,
	"similarity_score" numeric(5, 3),
	"common_genres" jsonb,
	"shared_fans" integer DEFAULT 0,
	"calculated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "artists" (
	"user_id" integer PRIMARY KEY NOT NULL,
	"stage_name" text NOT NULL,
	"bio" text,
	"epk_url" text,
	"primary_genre" text,
	"base_price" numeric(10, 2),
	"ideal_performance_rate" numeric(10, 2),
	"minimum_acceptable_rate" numeric(10, 2),
	"is_managed" boolean DEFAULT false,
	"management_tier_id" integer,
	"booking_form_picture_url" text,
	"is_registered_with_pro" boolean DEFAULT false,
	"performing_rights_organization" text,
	"ipi_number" text,
	"primary_talent_id" integer NOT NULL,
	"is_demo" boolean DEFAULT false,
	"is_complete" boolean DEFAULT false

);
--> statement-breakpoint
CREATE TABLE "audio_file_metadata" (
	"id" serial PRIMARY KEY NOT NULL,
	"enhanced_splitsheet_id" integer NOT NULL,
	"original_file_name" varchar(255) NOT NULL,
	"processed_file_name" varchar(255),
	"file_type" varchar(10),
	"bitrate" varchar(20),
	"sample_rate" varchar(20),
	"duration" numeric(8, 2),
	"file_size" integer,
	"isrc_code" varchar(15) NOT NULL,
	"isrc_embedded" boolean DEFAULT false,
	"embedded_at" timestamp,
	"title" varchar(255),
	"artist" varchar(255),
	"album" varchar(255),
	"year" varchar(4),
	"genre" varchar(100),
	"publisher" varchar(255),
	"processing_status" varchar(50) DEFAULT 'pending',
	"processing_error" text,
	"storage_url" text,
	"public_url" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "booking_assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"booking_id" integer NOT NULL,
	"assigned_user_id" integer NOT NULL,
	"assignment_role" text NOT NULL,
	"assigned_by_user_id" integer NOT NULL,
	"is_active" boolean DEFAULT true,
	"assigned_at" timestamp DEFAULT now(),
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "booking_assignments_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"booking_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"role_in_booking" integer NOT NULL,
	"assignment_type" text DEFAULT 'manual' NOT NULL,
	"assigned_at" timestamp DEFAULT now(),
	"assigned_by" integer,
	"status" text DEFAULT 'active' NOT NULL,
	"selected_talent" integer,
	"is_main_booked_talent" boolean DEFAULT false,
	"assigned_group" text,
	"assigned_channel_pair" integer,
	"assigned_channel" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "booking_attachments" (
	"id" serial PRIMARY KEY NOT NULL,
	"booking_id" integer,
	"file_name" varchar(255) NOT NULL,
	"file_path" varchar(500) NOT NULL,
	"file_type" varchar(100) NOT NULL,
	"file_size" integer NOT NULL,
	"uploaded_by" integer,
	"upload_timestamp" timestamp DEFAULT now(),
	"clamav_scan_status" varchar(20) DEFAULT 'pending',
	"clamav_scan_result" text,
	"admin_approval_status" varchar(20) DEFAULT 'pending',
	"approved_by" integer,
	"approval_timestamp" timestamp,
	"shared_with" jsonb DEFAULT '[]'::jsonb,
	"attachment_type" varchar(50),
	"description" text
);
--> statement-breakpoint
CREATE TABLE "booking_dates" (
	"id" serial PRIMARY KEY NOT NULL,
	"booking_id" integer,
	"event_date" timestamp NOT NULL,
	"start_time" text,
	"end_time" text
);
--> statement-breakpoint
CREATE TABLE "booking_documents" (
	"booking_id" integer,
	"document_id" integer
);
--> statement-breakpoint
CREATE TABLE "booking_media_access" (
	"id" serial PRIMARY KEY NOT NULL,
	"media_file_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"access_level" text NOT NULL,
	"granted_by_user_id" integer NOT NULL,
	"is_active" boolean DEFAULT true,
	"granted_at" timestamp DEFAULT now(),
	"expires_at" timestamp,
	"last_accessed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "booking_media_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"file_types" jsonb NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "booking_media_files" (
	"id" serial PRIMARY KEY NOT NULL,
	"booking_id" integer NOT NULL,
	"uploaded_by_user_id" integer NOT NULL,
	"file_name" text NOT NULL,
	"original_file_name" text NOT NULL,
	"file_path" text NOT NULL,
	"file_url" text NOT NULL,
	"file_type" text NOT NULL,
	"mime_type" text NOT NULL,
	"file_size" integer NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true,
	"uploaded_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "booking_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"booking_id" integer,
	"sender_user_id" integer,
	"message_text" text NOT NULL,
	"message_type" varchar(30) DEFAULT 'general',
	"is_internal" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"document_path" varchar(500),
	"read_by" jsonb DEFAULT '[]'::jsonb
);
--> statement-breakpoint
CREATE TABLE "booking_musicians" (
	"booking_id" integer,
	"musician_user_id" integer,
	"ideal_rate" numeric(10, 2),
	"admin_set_rate" numeric(10, 2),
	"original_currency" text DEFAULT 'USD',
	"original_amount" numeric(10, 2),
	"confirmed_fee" numeric(10, 2),
	"rate_status" text DEFAULT 'pending',
	"rate_set_by_admin_id" integer,
	"musician_response" text,
	"musician_response_message" text,
	"rate_notes" text,
	"counter_offer_amount" numeric(10, 2),
	"counter_offer_currency" text,
	"counter_offer_usd_equivalent" numeric(10, 2),
	"counter_offer_message" text,
	"counter_offer_at" timestamp,
	"admin_counter_response" text,
	"admin_counter_response_message" text,
	"admin_counter_response_at" timestamp,
	"assigned_at" timestamp DEFAULT now(),
	"rate_set_at" timestamp,
	"musician_response_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "booking_professional_assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"booking_id" integer NOT NULL,
	"professional_user_id" integer NOT NULL,
	"professional_type" text NOT NULL,
	"assigned_rate" numeric(10, 2) NOT NULL,
	"is_included_in_total" boolean DEFAULT true,
	"assignment_status" text DEFAULT 'assigned',
	"equipment_specs" jsonb,
	"proposal_document" text,
	"professional_requirements" jsonb,
	"checklist_items" jsonb,
	"technical_guidance" jsonb,
	"assigned_by_user_id" integer NOT NULL,
	"assigned_at" timestamp DEFAULT now(),
	"completed_at" timestamp,
	"internal_objectives" jsonb
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" serial PRIMARY KEY NOT NULL,
	"booker_user_id" integer,
	"primary_artist_user_id" integer NOT NULL,
	"event_name" text NOT NULL,
	"event_type" text NOT NULL,
	"event_date" timestamp,
	"venue_name" text,
	"venue_address" text,
	"requirements" text,
	"status" text DEFAULT 'pending',
	"total_budget" numeric(10, 2),
	"final_price" numeric(10, 2),
	"guest_name" text,
	"guest_email" text,
	"guest_phone" text,
	"is_guest_booking" boolean DEFAULT false,
	"assigned_admin_id" integer,
	"admin_approved_at" timestamp,
	"internal_objectives" jsonb,
	"internal_notes" text,
	"contracts_generated" boolean DEFAULT false,
	"all_signatures_completed" boolean DEFAULT false,
	"payment_completed" boolean DEFAULT false,
	"receipt_generated" boolean DEFAULT false,
	"workflow_data" jsonb,
	"current_workflow_step" integer DEFAULT 1,
	"last_modified" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bundle_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"bundle_id" integer NOT NULL,
	"item_type" text NOT NULL,
	"item_id" integer NOT NULL,
	"quantity" integer DEFAULT 1
);
--> statement-breakpoint
CREATE TABLE "bundles" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"artist_user_id" integer NOT NULL,
	"image_url" text,
	"is_active" boolean DEFAULT true,
	"created_by_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "cart_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"item_id" integer NOT NULL,
	"item_type" text NOT NULL,
	"quantity" integer DEFAULT 1,
	"price" numeric(10, 2) NOT NULL,
	"added_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "collaboration_comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"room_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" integer NOT NULL,
	"comment" text NOT NULL,
	"timestamp" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "collaboration_files" (
	"id" serial PRIMARY KEY NOT NULL,
	"room_id" integer NOT NULL,
	"project_id" integer,
	"uploaded_by" integer NOT NULL,
	"file_name" text NOT NULL,
	"file_url" text NOT NULL,
	"file_type" text NOT NULL,
	"file_size" integer,
	"version" integer DEFAULT 1,
	"description" text,
	"is_current_version" boolean DEFAULT true,
	"uploaded_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "collaboration_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"room_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"message" text NOT NULL,
	"message_type" text DEFAULT 'text',
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "collaboration_participants" (
	"id" serial PRIMARY KEY NOT NULL,
	"room_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"role" text NOT NULL,
	"joined_at" timestamp DEFAULT now(),
	"last_active" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "collaboration_projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"room_id" integer NOT NULL,
	"project_name" text NOT NULL,
	"description" text,
	"project_type" text NOT NULL,
	"status" text DEFAULT 'draft',
	"due_date" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "collaboration_rooms" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"room_type" text NOT NULL,
	"created_by" integer NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "collaboration_tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"room_id" integer NOT NULL,
	"project_id" integer,
	"assigned_to" integer,
	"created_by" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"priority" text DEFAULT 'medium',
	"status" text DEFAULT 'open',
	"due_date" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "comeseetv_artist_programs" (
	"id" serial PRIMARY KEY NOT NULL,
	"artist_id" integer NOT NULL,
	"program_level" varchar(20) NOT NULL,
	"monthly_stipend" numeric(10, 2) NOT NULL,
	"marketing_support" numeric(10, 2) NOT NULL,
	"tour_support" numeric(10, 2) NOT NULL,
	"recording_budget" numeric(10, 2) NOT NULL,
	"guaranteed_bookings" integer NOT NULL,
	"us_market_access" boolean DEFAULT true,
	"international_expansion" boolean DEFAULT false,
	"enrollment_date" timestamp DEFAULT now(),
	"is_active" boolean DEFAULT true,
	"total_earnings" numeric(12, 2) DEFAULT '0.00',
	"bookings_completed" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "comeseetv_financial_packages" (
	"id" serial PRIMARY KEY NOT NULL,
	"package_type" varchar(20) NOT NULL,
	"investment_amount" numeric(12, 2) NOT NULL,
	"revenue_share_percentage" numeric(5, 2) NOT NULL,
	"marketing_budget" numeric(10, 2) NOT NULL,
	"legal_support" boolean DEFAULT true,
	"distribution_channels" jsonb DEFAULT '[]'::jsonb,
	"guaranteed_booking_value" numeric(12, 2) NOT NULL,
	"artist_development_fund" numeric(12, 2) NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "configuration_delegations" (
	"id" serial PRIMARY KEY NOT NULL,
	"delegated_by" integer NOT NULL,
	"delegated_to" integer NOT NULL,
	"configuration_aspects" jsonb NOT NULL,
	"permissions" jsonb NOT NULL,
	"expires_at" timestamp,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "configuration_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"configuration_id" integer NOT NULL,
	"change_type" text NOT NULL,
	"previous_data" jsonb,
	"new_data" jsonb NOT NULL,
	"changed_by" integer NOT NULL,
	"change_description" text,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "content_distribution" (
	"id" serial PRIMARY KEY NOT NULL,
	"content_type" text NOT NULL,
	"content_id" integer NOT NULL,
	"include_fans" boolean DEFAULT true,
	"fan_artist_ids" jsonb DEFAULT '[]'::jsonb,
	"fan_delay_minutes" integer DEFAULT 0,
	"industry_delay_minutes" integer DEFAULT 60,
	"recipient_category_ids" jsonb DEFAULT '[]'::jsonb,
	"specific_recipient_ids" jsonb DEFAULT '[]'::jsonb,
	"exclude_recipient_ids" jsonb DEFAULT '[]'::jsonb,
	"content_genres" jsonb DEFAULT '[]'::jsonb,
	"target_genres" jsonb DEFAULT '[]'::jsonb,
	"exclude_genres" jsonb DEFAULT '[]'::jsonb,
	"require_genre_match" boolean DEFAULT true,
	"genre_match_strength" text DEFAULT 'strict',
	"target_media_types" jsonb DEFAULT '[]'::jsonb,
	"minimum_audience_size" integer DEFAULT 0,
	"minimum_influence" integer DEFAULT 1,
	"target_regions" jsonb DEFAULT '["global"]'::jsonb,
	"local_markets" jsonb DEFAULT '[]'::jsonb,
	"artist_home_markets" boolean DEFAULT true,
	"include_partners" boolean DEFAULT true,
	"include_vips" boolean DEFAULT true,
	"include_new_contacts" boolean DEFAULT false,
	"scheduled_for" timestamp,
	"sent_at" timestamp,
	"distribution_status" text DEFAULT 'pending',
	"total_recipients" integer DEFAULT 0,
	"total_sent" integer DEFAULT 0,
	"total_delivered" integer DEFAULT 0,
	"total_opened" integer DEFAULT 0,
	"total_clicked" integer DEFAULT 0,
	"total_responded" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"created_by" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contract_signatures" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" integer NOT NULL,
	"signer_user_id" integer,
	"signer_type" text NOT NULL,
	"signer_name" text NOT NULL,
	"signer_email" text,
	"signature_data" text,
	"signed_at" timestamp DEFAULT now(),
	"ip_address" text,
	"status" text DEFAULT 'pending'
);
--> statement-breakpoint
CREATE TABLE "contracts" (
	"id" serial PRIMARY KEY NOT NULL,
	"booking_id" integer NOT NULL,
	"contract_type" text NOT NULL,
	"status" text DEFAULT 'draft',
	"created_by_user_id" integer,
	"assigned_to_user_id" integer,
	"title" text NOT NULL,
	"content" jsonb NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "cross_promotion_campaigns" (
	"id" serial PRIMARY KEY NOT NULL,
	"promoting_artist_id" integer NOT NULL,
	"promoted_artist_id" integer NOT NULL,
	"campaign_type" text NOT NULL,
	"target_audience" jsonb,
	"budget" numeric(10, 2),
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"is_active" boolean DEFAULT true,
	"impressions" integer DEFAULT 0,
	"clicks" integer DEFAULT 0,
	"conversions" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "cross_upsell_relationships" (
	"id" serial PRIMARY KEY NOT NULL,
	"source_type" text NOT NULL,
	"source_id" integer NOT NULL,
	"target_type" text NOT NULL,
	"target_id" integer NOT NULL,
	"relationship_type" text NOT NULL,
	"priority" integer DEFAULT 1,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "curator_email_campaigns" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"release_id" integer,
	"release_type" text NOT NULL,
	"email_template" text NOT NULL,
	"subject" text NOT NULL,
	"from_name" text NOT NULL,
	"from_email" text NOT NULL,
	"reply_to" text,
	"scheduled_send_date" timestamp,
	"actual_send_date" timestamp,
	"days_since_release" integer,
	"target_genres" jsonb,
	"target_regions" jsonb,
	"curator_criteria" jsonb,
	"excluded_curators" jsonb,
	"total_recipients" integer DEFAULT 0,
	"sent_count" integer DEFAULT 0,
	"delivered_count" integer DEFAULT 0,
	"open_count" integer DEFAULT 0,
	"click_count" integer DEFAULT 0,
	"response_count" integer DEFAULT 0,
	"placement_count" integer DEFAULT 0,
	"status" text DEFAULT 'draft',
	"error_log" jsonb,
	"created_by_user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "curator_submissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"curator_id" integer NOT NULL,
	"song_id" integer,
	"album_id" integer,
	"release_type" text NOT NULL,
	"submission_date" timestamp NOT NULL,
	"submission_strategy" text,
	"days_since_release" integer,
	"subject" text NOT NULL,
	"message" text NOT NULL,
	"personalized_note" text,
	"attached_files" jsonb,
	"status" text DEFAULT 'sent',
	"curator_response" text,
	"response_date" timestamp,
	"placement_details" jsonb,
	"placement_url" text,
	"follow_up_scheduled" boolean DEFAULT false,
	"follow_up_date" timestamp,
	"follow_up_count" integer DEFAULT 0,
	"email_open_tracking" jsonb,
	"link_clicks" integer DEFAULT 0,
	"streaming_increase" integer,
	"submitted_by_user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "curators" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"organization" text,
	"website" text,
	"social_media_handles" jsonb,
	"genres" jsonb,
	"regions" jsonb,
	"platforms" jsonb,
	"audience_size" integer,
	"influence_score" integer DEFAULT 0,
	"preferred_contact_method" text DEFAULT 'email',
	"submission_guidelines" text,
	"response_rate" integer,
	"average_response_time" integer,
	"relationship_status" text DEFAULT 'new',
	"last_contacted_at" timestamp,
	"total_submissions" integer DEFAULT 0,
	"successful_placements" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"added_by_user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "curators_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "currencies" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(3) NOT NULL,
	"name" text NOT NULL,
	"symbol" text NOT NULL,
	"rate" numeric(10, 4) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_updated" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "currencies_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "discount_conditions" (
	"id" serial PRIMARY KEY NOT NULL,
	"bundle_id" integer NOT NULL,
	"discount_type" text NOT NULL,
	"fixed_amount" numeric(10, 2),
	"percentage_amount" numeric(5, 2),
	"condition_type" text,
	"condition_value" text,
	"description" text,
	"is_active" boolean DEFAULT true,
	"valid_from" timestamp,
	"valid_until" timestamp,
	"usage_limit" integer,
	"current_usage" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "dj_access" (
	"id" serial PRIMARY KEY NOT NULL,
	"booking_id" integer NOT NULL,
	"dj_user_id" integer,
	"dj_name" text NOT NULL,
	"dj_email" text NOT NULL,
	"dj_phone" text,
	"access_code" text NOT NULL,
	"access_level" text DEFAULT 'full',
	"download_limit" integer,
	"download_count" integer DEFAULT 0,
	"access_expires_at" timestamp,
	"allowed_tracks" jsonb,
	"restricted_tracks" jsonb,
	"last_accessed_at" timestamp,
	"login_attempts" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"granted_by_user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "dj_access_access_code_unique" UNIQUE("access_code")
);
--> statement-breakpoint
CREATE TABLE "dj_song_access" (
	"id" serial PRIMARY KEY NOT NULL,
	"dj_user_id" integer NOT NULL,
	"booking_id" integer NOT NULL,
	"song_id" integer NOT NULL,
	"splitsheet_id" integer NOT NULL,
	"is_fully_signed" boolean DEFAULT false,
	"access_code" varchar(20),
	"access_granted_at" timestamp,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "document_linkages" (
	"id" serial PRIMARY KEY NOT NULL,
	"source_document_type" text NOT NULL,
	"source_document_id" integer NOT NULL,
	"linked_document_type" text NOT NULL,
	"linked_document_id" integer NOT NULL,
	"linkage_type" text NOT NULL,
	"link_description" text,
	"created_by_user_id" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "document_permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"can_view" boolean DEFAULT true,
	"can_download" boolean DEFAULT true,
	"granted_by" integer NOT NULL,
	"granted_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"file_name" text NOT NULL,
	"file_url" text NOT NULL,
	"document_type" text NOT NULL,
	"uploaded_by" integer,
	"booking_id" integer,
	"status" text DEFAULT 'draft',
	"generated_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "enhanced_splitsheet_notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"enhanced_splitsheet_id" integer NOT NULL,
	"recipient_email" varchar(255) NOT NULL,
	"recipient_name" varchar(255) NOT NULL,
	"participant_id" varchar(100) NOT NULL,
	"notification_type" varchar(50) NOT NULL,
	"access_token" varchar(100),
	"email_subject" text,
	"email_body" text,
	"email_sent" boolean DEFAULT false,
	"sent_at" timestamp,
	"opened" boolean DEFAULT false,
	"opened_at" timestamp,
	"responded" boolean DEFAULT false,
	"responded_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "enhanced_splitsheet_notifications_access_token_unique" UNIQUE("access_token")
);
--> statement-breakpoint
CREATE TABLE "enhanced_splitsheets" (
	"id" serial PRIMARY KEY NOT NULL,
	"song_title" varchar(255) NOT NULL,
	"song_reference" varchar(50) NOT NULL,
	"agreement_date" timestamp,
	"work_id" varchar(50),
	"upc_ean" varchar(20),
	"audio_file_url" text,
	"original_file_name" varchar(255),
	"file_size" integer,
	"file_duration" numeric(8, 2),
	"isrc_code" varchar(15),
	"metadata_embedded" boolean DEFAULT false,
	"participants" jsonb NOT NULL,
	"status" varchar(20) DEFAULT 'draft',
	"all_signed" boolean DEFAULT false,
	"signed_count" integer DEFAULT 0,
	"total_participants" integer DEFAULT 0,
	"service_type" text DEFAULT 'enhanced_splitsheet',
	"base_price" numeric(10, 2) DEFAULT '5.00',
	"discount_percentage" numeric(5, 2) DEFAULT '0.00',
	"final_price" numeric(10, 2) DEFAULT '5.00',
	"payment_status" text DEFAULT 'pending',
	"is_paid_for" boolean DEFAULT false,
	"can_download" boolean DEFAULT false,
	"songwriting_percentage_total" numeric(5, 2) DEFAULT '0',
	"melody_percentage_total" numeric(5, 2) DEFAULT '0',
	"beat_production_percentage_total" numeric(5, 2) DEFAULT '0',
	"publishing_percentage_total" numeric(5, 2) DEFAULT '0',
	"executive_producer_percentage_total" numeric(5, 2) DEFAULT '0',
	"invoice_id" integer,
	"created_by" integer NOT NULL,
	"management_tier_applied" integer,
	"notifications_sent" integer DEFAULT 0,
	"download_count" integer DEFAULT 0,
	"last_download_at" timestamp,
	"final_pdf_url" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"artist_user_id" integer,
	"event_type" text NOT NULL,
	"event_datetime" timestamp NOT NULL,
	"ticket_url" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "fan_engagement" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"artist_user_id" integer NOT NULL,
	"engagement_type" text NOT NULL,
	"engagement_value" text,
	"engagement_date" timestamp DEFAULT now(),
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "fan_subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"fan_user_id" integer NOT NULL,
	"artist_user_id" integer NOT NULL,
	"subscription_type" text NOT NULL,
	"source_type" text NOT NULL,
	"source_url" text,
	"purchase_data" jsonb,
	"subscription_date" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "financial_audit_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" integer NOT NULL,
	"action_type" text NOT NULL,
	"action_description" text NOT NULL,
	"previous_values" jsonb,
	"new_values" jsonb,
	"performed_by_user_id" integer,
	"performed_by_system" boolean DEFAULT false,
	"ip_address" text,
	"user_agent" text,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "global_genres" (
	"id" serial PRIMARY KEY NOT NULL,
	"category" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "global_professions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"description" text,
	"is_custom" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hospitality_requirements" (
	"id" serial PRIMARY KEY NOT NULL,
	"booking_id" integer,
	"user_id" integer,
	"dressing_room_type" text,
	"refreshments" jsonb,
	"dietary_restrictions" text,
	"additional_requests" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "individual_discount_permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"service_id" integer NOT NULL,
	"custom_max_discount_percentage" integer NOT NULL,
	"reason" text NOT NULL,
	"granted_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "industry_recipients" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"category_id" integer NOT NULL,
	"contact_person" text,
	"phone" text,
	"website" text,
	"address" jsonb,
	"preferred_genres" jsonb DEFAULT '[]'::jsonb,
	"excluded_genres" jsonb DEFAULT '[]'::jsonb,
	"coverage_regions" jsonb DEFAULT '["global"]'::jsonb,
	"local_markets" jsonb DEFAULT '[]'::jsonb,
	"organization_type" text,
	"audience_size" integer,
	"influence" integer DEFAULT 5,
	"preferred_file_formats" jsonb DEFAULT '["mp3","wav"]'::jsonb,
	"submission_guidelines" text,
	"preferred_contact_method" text DEFAULT 'email',
	"relationship_type" text DEFAULT 'prospect',
	"last_contact_date" timestamp,
	"response_rate" numeric(5, 2) DEFAULT '0.00',
	"notes" text,
	"status" text DEFAULT 'active',
	"source" text DEFAULT 'manual',
	"added_by" integer NOT NULL,
	"verified_by" integer,
	"verified_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"is_demo" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" serial PRIMARY KEY NOT NULL,
	"booking_id" integer NOT NULL,
	"invoice_number" text NOT NULL,
	"invoice_type" text NOT NULL,
	"invoice_url" text,
	"issuer_name" text NOT NULL,
	"issuer_address" text,
	"issuer_tax_id" text,
	"recipient_name" text NOT NULL,
	"recipient_address" text,
	"recipient_tax_id" text,
	"line_items" jsonb NOT NULL,
	"subtotal_amount" numeric(10, 2) NOT NULL,
	"tax_amount" numeric(10, 2),
	"total_amount" numeric(10, 2) NOT NULL,
	"due_date" timestamp NOT NULL,
	"payment_terms" text DEFAULT 'Net 30',
	"status" text DEFAULT 'pending',
	"triggered_by" text NOT NULL,
	"triggered_by_user_id" integer,
	"sent_at" timestamp,
	"paid_at" timestamp,
	"generated_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"proforma_invoice_id" integer,
	"converted_at" timestamp,
	CONSTRAINT "invoices_invoice_number_unique" UNIQUE("invoice_number")
);
--> statement-breakpoint
CREATE TABLE "isrc_codes" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"artist_id" integer NOT NULL,
	"song_title" varchar(255) NOT NULL,
	"isrc_code" varchar(15) NOT NULL,
	"code_type" varchar(20) DEFAULT 'release' NOT NULL,
	"status" varchar(20) DEFAULT 'pending',
	"base_price" numeric(8, 2) DEFAULT '25.00',
	"final_price" numeric(8, 2) DEFAULT '25.00',
	"payment_status" varchar(20) DEFAULT 'pending',
	"payment_date" timestamp,
	"stripe_payment_intent_id" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "isrc_codes_isrc_code_unique" UNIQUE("isrc_code")
);
--> statement-breakpoint
CREATE TABLE "isrc_service_pricing" (
	"id" serial PRIMARY KEY NOT NULL,
	"base_price" numeric(10, 2) DEFAULT '5.00',
	"publisher_discount" numeric(5, 2) DEFAULT '10',
	"representation_discount" numeric(5, 2) DEFAULT '50',
	"full_management_discount" numeric(5, 2) DEFAULT '100',
	"cover_art_validation_fee" numeric(10, 2) DEFAULT '2.00',
	"metadata_embedding_fee" numeric(10, 2) DEFAULT '3.00',
	"updated_at" timestamp DEFAULT now(),
	"updated_by" integer
);
--> statement-breakpoint
CREATE TABLE "legal_assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_user_id" integer NOT NULL,
	"lawyer_user_id" integer NOT NULL,
	"assignment_type" text NOT NULL,
	"is_active" boolean DEFAULT true,
	"assigned_at" timestamp DEFAULT now(),
	"assigned_by_user_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "link_access_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"link_id" integer NOT NULL,
	"accessed_by_user_id" integer,
	"accessed_by_email" text,
	"accessed_by_name" text,
	"ip_address" text,
	"user_agent" text,
	"accessed_at" timestamp DEFAULT now(),
	"action_taken" text
);
--> statement-breakpoint
CREATE TABLE "management_application_reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"application_id" integer NOT NULL,
	"reviewer_user_id" integer NOT NULL,
	"reviewer_role" text NOT NULL,
	"review_status" text NOT NULL,
	"review_comments" text,
	"reviewed_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "management_application_signatures" (
	"id" serial PRIMARY KEY NOT NULL,
	"application_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"signer_role" text NOT NULL,
	"signature_type" text NOT NULL,
	"signature_data" text,
	"ip_address" text,
	"user_agent" text,
	"signed_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "management_applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"applicant_user_id" integer NOT NULL,
	"requested_management_tier_id" integer NOT NULL,
	"application_reason" text NOT NULL,
	"business_plan" text,
	"expected_revenue" numeric(10, 2),
	"portfolio_links" jsonb,
	"social_media_metrics" jsonb,
	"contract_terms" jsonb NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"submitted_at" timestamp DEFAULT now(),
	"reviewed_at" timestamp,
	"reviewed_by_user_id" integer,
	"approved_at" timestamp,
	"approved_by_user_id" integer,
	"signed_at" timestamp,
	"completed_at" timestamp,
	"rejection_reason" text,
  	"term_in_months" INT,         -- কত মাসের জন্য
  	"end_date" TIMESTAMP,         -- expiry date
  	"notes" TEXT,                 -- admin extra note
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "management_tiers" (
    "id" serial PRIMARY KEY,
    "name" text NOT NULL,
    "description" text,
    "applies_to" text[] DEFAULT ARRAY['artist','musician']
);
--> statement-breakpoint
CREATE TABLE "management_transitions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"from_role_id" integer NOT NULL,
	"to_role_id" integer NOT NULL,
	"from_management_tier_id" integer,
	"to_management_tier_id" integer,
	"transition_type" text NOT NULL,
	"release_contract_id" integer,
	"processed_by_user_id" integer NOT NULL,
	"reason" text NOT NULL,
	"notes" text,
	"effective_date" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "market_intelligence" (
	"id" serial PRIMARY KEY NOT NULL,
	"source_type" text NOT NULL,
	"source_name" text NOT NULL,
	"source_url" text,
	"content_type" text NOT NULL,
	"extracted_content" text NOT NULL,
	"detected_needs" jsonb,
	"sentiment" text,
	"relevance_score" integer,
	"suggested_features" jsonb,
	"processed_at" timestamp DEFAULT now(),
	"status" text DEFAULT 'pending',
	"reviewed_by" integer,
	"review_notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "market_trends" (
	"id" serial PRIMARY KEY NOT NULL,
	"genre" text NOT NULL,
	"region" text DEFAULT 'global',
	"trend_type" text NOT NULL,
	"trend_value" numeric(10, 2) NOT NULL,
	"change_percentage" numeric(5, 2),
	"timeframe" text NOT NULL,
	"data_source" text NOT NULL,
	"reliability" numeric(5, 2) NOT NULL,
	"impact_factor" numeric(5, 2) DEFAULT '1.0',
	"last_updated" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mediahub_documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"booking_id" integer NOT NULL,
	"file_name" text NOT NULL,
	"file_type" text NOT NULL,
	"file_size" integer NOT NULL,
	"file_path" text NOT NULL,
	"uploaded_by" integer NOT NULL,
	"visibility" text DEFAULT 'admin_controlled' NOT NULL,
	"description" text,
	"uploaded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "merchandise" (
	"id" serial PRIMARY KEY NOT NULL,
	"artist_user_id" integer NOT NULL,
	"category_id" integer,
	"name" text NOT NULL,
	"description" text,
	"price" numeric(10, 2) NOT NULL,
	"inventory" integer,
	"image_url" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "merchandise_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mixer_patch_lists" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"rows" jsonb NOT NULL,
	"booking_id" integer,
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"modified_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "music_genres" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"display_name" text NOT NULL,
	"parent_genre_id" integer,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "music_genres_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "music_recommendations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"song_id" integer,
	"artist_id" integer,
	"album_id" integer,
	"recommendation_type" text NOT NULL,
	"score" numeric(5, 3),
	"reason_code" text,
	"is_active" boolean DEFAULT true,
	"viewed_at" timestamp,
	"clicked_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "musician_instrument_preferences" (
	"id" serial PRIMARY KEY NOT NULL,
	"musician_user_id" integer NOT NULL,
	"instrument_id" integer NOT NULL,
	"proficiency_level" text NOT NULL,
	"is_primary" boolean DEFAULT false,
	"specializations" text,
	"equipment_notes" text,
	"technical_requirements" text,
	"preferred_setup" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "musicians" (
	"user_id" integer PRIMARY KEY NOT NULL,
	"stage_name" text,
	"primary_genre" text,
	"base_price" numeric(10, 2),
	"ideal_performance_rate" numeric(10, 2),
	"minimum_acceptable_rate" numeric(10, 2),
	"is_managed" boolean DEFAULT false,
	"management_tier_id" integer,
	"booking_form_picture_url" text,
	"is_registered_with_pro" boolean DEFAULT false,
	"performing_rights_organization" text,
	"ipi_number" text,
	"primary_talent_id" integer NOT NULL,
	"is_demo" boolean DEFAULT false,
	"is_complete" boolean DEFAULT false

);
--> statement-breakpoint
CREATE TABLE "newsletter_engagements" (
	"id" serial PRIMARY KEY NOT NULL,
	"newsletter_id" integer NOT NULL,
	"subscription_id" integer NOT NULL,
	"engagement_type" text NOT NULL,
	"engagement_data" jsonb,
	"engaged_at" timestamp DEFAULT now(),
	"is_demo" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "newsletter_subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"first_name" text,
	"last_name" text,
	"subscription_type" text DEFAULT 'general' NOT NULL,
	"artist_interests" jsonb,
	"status" text DEFAULT 'active' NOT NULL,
	"source" text DEFAULT 'website',
	"subscribe_date" timestamp DEFAULT now(),
	"last_engagement" timestamp,
	"unsubscribe_date" timestamp,
	"unsubscribe_token" text,
	"is_demo" boolean DEFAULT false,
	CONSTRAINT "newsletter_subscriptions_email_unique" UNIQUE("email"),
	CONSTRAINT "newsletter_subscriptions_unsubscribe_token_unique" UNIQUE("unsubscribe_token")
);
--> statement-breakpoint
CREATE TABLE "newsletters" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"type" text DEFAULT 'general' NOT NULL,
	"target_artist_id" integer,
	"status" text DEFAULT 'draft' NOT NULL,
	"scheduled_for" timestamp,
	"sent_at" timestamp,
	"sent_count" integer DEFAULT 0,
	"open_count" integer DEFAULT 0,
	"click_count" integer DEFAULT 0,
	"bounce_count" integer DEFAULT 0,
	"unsubscribe_count" integer DEFAULT 0,
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"is_demo" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "oauth_accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"provider" text NOT NULL,
	"provider_account_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"expires_at" timestamp,
	"scope" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "opphub_application_analytics" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"opportunity_id" integer NOT NULL,
	"application_submitted_at" timestamp,
	"response_received_at" timestamp,
	"outcome" text,
	"outcome_value" numeric(12, 2),
	"feedback_received" text,
	"lessons_learned" jsonb,
	"ai_recommendation_followed" boolean DEFAULT false,
	"success_factors" jsonb,
	"improvement_areas" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "opphub_application_guidance" (
	"id" serial PRIMARY KEY NOT NULL,
	"opportunity_id" integer NOT NULL,
	"target_user_id" integer NOT NULL,
	"generated_strategy" jsonb NOT NULL,
	"match_reasons" jsonb,
	"recommended_approach" text NOT NULL,
	"suggested_portfolio" jsonb,
	"key_talking_points" jsonb,
	"deadline_alerts" jsonb,
	"similar_success_stories" jsonb,
	"confidence_score" integer NOT NULL,
	"priority_level" integer DEFAULT 1,
	"ai_analysis_details" jsonb,
	"application_status" text DEFAULT 'pending',
	"follow_up_reminders" jsonb,
	"generated_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "opphub_deadline_tracking" (
	"id" serial PRIMARY KEY NOT NULL,
	"opportunity_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"deadline_type" text NOT NULL,
	"deadline_date" timestamp NOT NULL,
	"reminder_schedule" jsonb,
	"alerts_sent" jsonb,
	"application_progress" jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "opphub_professional_guidance" (
	"id" serial PRIMARY KEY NOT NULL,
	"assignment_id" integer NOT NULL,
	"managed_artist_user_id" integer NOT NULL,
	"professional_type" text NOT NULL,
	"equipment_specs" jsonb,
	"technical_requirements" jsonb,
	"creative_guidance" jsonb,
	"industry_standards" jsonb,
	"opportunity_projections" jsonb,
	"quality_benchmarks" jsonb,
	"deliverable_specs" jsonb,
	"generated_by_opphub" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "opphub_subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"subscription_tier" text NOT NULL,
	"status" text DEFAULT 'active',
	"monthly_fee" text NOT NULL,
	"applications_allowed" integer DEFAULT 5,
	"applications_used" integer DEFAULT 0,
	"premium_features" jsonb,
	"start_date" timestamp DEFAULT now(),
	"next_billing_date" timestamp,
	"cancelled_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "opphub_success_stories" (
	"id" serial PRIMARY KEY NOT NULL,
	"opportunity_id" integer,
	"artist_name" text NOT NULL,
	"artist_genre" text,
	"artist_region" text,
	"opportunity_type" text NOT NULL,
	"application_text" text NOT NULL,
	"outcome_details" jsonb,
	"application_strategy" jsonb,
	"timeline_details" jsonb,
	"contact_approach" text,
	"portfolio_highlights" jsonb,
	"success_factor" text NOT NULL,
	"date_applied" timestamp,
	"date_accepted" timestamp,
	"verification_status" text DEFAULT 'verified',
	"added_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "opportunities" (
	"id" serial PRIMARY KEY NOT NULL,
	"category_id" integer,
	"title" text NOT NULL,
	"description" text,
	"organizer_name" text NOT NULL,
	"organizer_email" text,
	"organizer_website" text,
	"location" text,
	"event_date" timestamp,
	"application_deadline" timestamp,
	"compensation" text,
	"compensation_amount" text,
	"requirements" jsonb,
	"application_fee" text DEFAULT '0',
	"submission_guidelines" text,
	"contact_info" jsonb,
	"tags" jsonb,
	"status" text DEFAULT 'active',
	"source_type" text DEFAULT 'manual',
	"source_url" text,
	"view_count" integer DEFAULT 0,
	"application_count" integer DEFAULT 0,
	"is_verified" boolean DEFAULT false,
	"is_featured" boolean DEFAULT false,
	"created_by" integer,
	"verified_by" integer,
	"compensation_type" text DEFAULT 'unpaid',
	"is_remote" boolean DEFAULT false,
	"is_demo" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "opportunity_applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"opportunity_id" integer,
	"applicant_user_id" integer,
	"artist_id" integer,
	"application_data" jsonb,
	"submission_files" jsonb,
	"cover_letter" text,
	"status" text DEFAULT 'submitted',
	"applied_at" timestamp DEFAULT now(),
	"reviewed_at" timestamp,
	"reviewed_by" integer,
	"review_notes" text,
	"payment_required" boolean DEFAULT false,
	"payment_status" text DEFAULT 'pending',
	"payment_amount" text,
	"is_demo" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "opportunity_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"icon_name" text DEFAULT 'Music',
	"color_scheme" text DEFAULT 'blue',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "opportunity_matches" (
	"id" serial PRIMARY KEY NOT NULL,
	"opportunity_id" integer,
	"artist_id" integer,
	"match_score" integer,
	"match_reasons" jsonb,
	"notified_at" timestamp,
	"viewed_at" timestamp,
	"interaction_type" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "opportunity_sources" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"website" text NOT NULL,
	"scrape_endpoint" text,
	"category_id" integer,
	"is_active" boolean DEFAULT true,
	"last_scraped" timestamp,
	"scraper_config" jsonb,
	"opportunities_found" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payment_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"booking_id" integer NOT NULL,
	"invoice_id" integer,
	"payout_request_id" integer,
	"transaction_type" text NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"currency" text DEFAULT 'USD',
	"exchange_rate" numeric(10, 6),
	"usd_equivalent" numeric(10, 2),
	"payment_method" text NOT NULL,
	"gateway_transaction_id" text,
	"gateway_reference" text,
	"gateway_fee" numeric(10, 2),
	"platform_fee" numeric(10, 2),
	"net_amount" numeric(10, 2),
	"status" text DEFAULT 'pending',
	"processed_at" timestamp,
	"settled_at" timestamp,
	"refunded_at" timestamp,
	"disputed_at" timestamp,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"booking_id" integer NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"currency" text DEFAULT 'USD',
	"payment_method" text,
	"payment_status" text DEFAULT 'pending',
	"stripe_payment_intent_id" text,
	"paid_at" timestamp,
	"refunded_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payout_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"booking_id" integer NOT NULL,
	"performer_user_id" integer NOT NULL,
	"request_number" text NOT NULL,
	"request_type" text NOT NULL,
	"base_amount" numeric(10, 2) NOT NULL,
	"commission_percentage" numeric(5, 2) DEFAULT '15.00',
	"commission_amount" numeric(10, 2),
	"net_payout_amount" numeric(10, 2) NOT NULL,
	"currency" text DEFAULT 'USD',
	"payment_method" text,
	"bank_details" jsonb,
	"status" text DEFAULT 'pending',
	"triggered_by" text NOT NULL,
	"triggered_by_user_id" integer,
	"approved_by_user_id" integer,
	"approved_at" timestamp,
	"processed_at" timestamp,
	"paid_at" timestamp,
	"decline_reason" text,
	"notes" text,
	"contract_reference_id" integer,
	"generated_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "payout_requests_request_number_unique" UNIQUE("request_number")
);
--> statement-breakpoint
CREATE TABLE "playback_track_downloads" (
	"id" serial PRIMARY KEY NOT NULL,
	"playback_track_id" integer NOT NULL,
	"dj_access_id" integer,
	"downloaded_by_user_id" integer,
	"downloaded_by_dj_code" text,
	"track_type" text NOT NULL,
	"file_url" text NOT NULL,
	"downloaded_at" timestamp DEFAULT now(),
	"ip_address" text,
	"user_agent" text
);
--> statement-breakpoint
CREATE TABLE "playback_tracks" (
	"id" serial PRIMARY KEY NOT NULL,
	"booking_id" integer NOT NULL,
	"song_id" integer,
	"custom_song_title" text,
	"custom_artist" text,
	"original_file_url" text,
	"original_file_name" text,
	"original_file_size" integer,
	"vocal_analysis" jsonb,
	"instrumental_track_url" text,
	"vocals_track_url" text,
	"dj_ready_track_url" text,
	"separation_performed" boolean DEFAULT false,
	"separation_status" text DEFAULT 'pending',
	"processed_at" timestamp,
	"processed_by_user_id" integer,
	"processing_notes" text,
	"setlist_position" integer,
	"song_key" text,
	"tempo" integer,
	"duration" text,
	"transition_notes" text,
	"performance_notes" text,
	"dj_access_enabled" boolean DEFAULT false,
	"dj_access_code" text,
	"dj_access_expires_at" timestamp,
	"download_count" integer DEFAULT 0,
	"last_downloaded_at" timestamp,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "press_release_analytics" (
	"id" serial PRIMARY KEY NOT NULL,
	"press_release_id" integer NOT NULL,
	"event_type" text NOT NULL,
	"event_date" timestamp DEFAULT now(),
	"source_url" text,
	"user_agent" text,
	"ip_address" text,
	"referrer" text,
	"media_outlet" text,
	"estimated_reach" integer,
	"event_data" jsonb
);
--> statement-breakpoint
CREATE TABLE "press_release_assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"press_release_id" integer NOT NULL,
	"artist_id" integer NOT NULL,
	"musician_id" integer,
	"role" text DEFAULT 'featured' NOT NULL,
	"assigned_at" timestamp DEFAULT now(),
	"assigned_by" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "press_release_distribution" (
	"id" serial PRIMARY KEY NOT NULL,
	"press_release_id" integer NOT NULL,
	"channel_type" text NOT NULL,
	"channel_name" text NOT NULL,
	"contact_email" text,
	"distributed_at" timestamp DEFAULT now(),
	"status" text DEFAULT 'sent' NOT NULL,
	"response_received" timestamp,
	"response_type" text,
	"notes" text,
	"distributed_by" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "press_release_media" (
	"id" serial PRIMARY KEY NOT NULL,
	"press_release_id" integer NOT NULL,
	"song_id" integer,
	"album_id" integer,
	"media_type" text NOT NULL,
	"media_url" text,
	"media_title" text,
	"media_description" text,
	"isrc_code" text,
	"display_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "press_releases" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"summary" text NOT NULL,
	"type" text DEFAULT 'song_release' NOT NULL,
	"primary_artist_id" integer NOT NULL,
	"featured_artist_ids" jsonb DEFAULT '[]'::jsonb,
	"song_id" integer,
	"album_id" integer,
	"release_date" timestamp,
	"status" text DEFAULT 'draft' NOT NULL,
	"published_at" timestamp,
	"scheduled_for" timestamp,
	"media_assets" jsonb DEFAULT '[]'::jsonb,
	"contact_name" text,
	"contact_email" text,
	"contact_phone" text,
	"distribution_channels" jsonb DEFAULT '[]'::jsonb,
	"target_regions" jsonb DEFAULT '["global"]'::jsonb,
	"view_count" integer DEFAULT 0,
	"download_count" integer DEFAULT 0,
	"share_count" integer DEFAULT 0,
	"pickup_count" integer DEFAULT 0,
	"meta_title" text,
	"meta_description" text,
	"social_media_preview" jsonb,
	"created_by" integer NOT NULL,
	"last_modified_by" integer,
	"is_auto_generated" boolean DEFAULT false,
	"generation_trigger" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"is_demo" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "pro_eligibility_assessments" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"has_original_music" boolean NOT NULL,
	"has_published_works" boolean NOT NULL,
	"intends_to_persue" boolean NOT NULL,
	"has_performances" boolean NOT NULL,
	"is_us_citizen" boolean,
	"is_registered_with_another_pro" boolean NOT NULL,
	"eligibility_score" integer NOT NULL,
	"recommended_pro" text,
	"assessment_data" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pro_registrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"pro_name" text NOT NULL,
	"membership_number" text,
	"membership_type" text NOT NULL,
	"application_status" text DEFAULT 'pending' NOT NULL,
	"application_date" timestamp NOT NULL,
	"approval_date" timestamp,
	"annual_fee" numeric(8, 2),
	"service_fee_paid" boolean DEFAULT false,
	"service_fee_amount" numeric(8, 2) DEFAULT '75.00',
	"application_data" jsonb,
	"tax_documentation" jsonb,
	"waitumusic_autofill" jsonb,
	"requires_w8ben" boolean DEFAULT false,
	"tax_form_status" text DEFAULT 'pending',
	"notes" text,
	"admin_fee" numeric(8, 2) DEFAULT '30.00',
	"pro_registration_fee" numeric(8, 2) DEFAULT '1.00',
	"handling_fee" numeric(8, 2) DEFAULT '3.00',
	"payment_method" text,
	"payment_status" text DEFAULT 'pending',
	"payment_date" timestamp,
	"stripe_payment_intent_id" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pro_works" (
	"id" serial PRIMARY KEY NOT NULL,
	"pro_registration_id" integer NOT NULL,
	"song_id" integer NOT NULL,
	"work_title" text NOT NULL,
	"iswc_code" text,
	"registration_date" timestamp NOT NULL,
	"writer_share" numeric(5, 2) DEFAULT '100',
	"publisher_share" numeric(5, 2) DEFAULT '0',
	"co_writers" jsonb DEFAULT '[]'::jsonb,
	"registration_status" text DEFAULT 'pending' NOT NULL,
	"pro_work_id" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "professional_availability" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"availability_type" text NOT NULL,
	"exclude_holidays" boolean DEFAULT false,
	"country" text DEFAULT 'US',
	"custom_days" text[],
	"time_zone" text DEFAULT 'UTC',
	"start_time" text DEFAULT '09:00',
	"end_time" text DEFAULT '17:00',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "professionals" (
	"user_id" integer PRIMARY KEY NOT NULL,
	"base_price" numeric(10, 2),
	"ideal_service_rate" numeric(10, 2),
	"minimum_acceptable_rate" numeric(10, 2),
	"is_managed" boolean DEFAULT false,
	"management_tier_id" integer,
	"booking_form_picture_url" text,
	"primary_talent_id" integer,
	"is_demo" boolean DEFAULT false,
	"is_complete" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "receipts" (
	"id" serial PRIMARY KEY NOT NULL,
	"booking_id" integer NOT NULL,
	"payment_id" integer NOT NULL,
	"receipt_number" text NOT NULL,
	"receipt_url" text,
	"issuer_name" text NOT NULL,
	"issuer_address" text,
	"recipient_name" text NOT NULL,
	"recipient_address" text,
	"items_breakdown" jsonb,
	"tax_amount" numeric(10, 2),
	"total_amount" numeric(10, 2) NOT NULL,
	"generated_at" timestamp DEFAULT now(),
	CONSTRAINT "receipts_receipt_number_unique" UNIQUE("receipt_number")
);
--> statement-breakpoint
CREATE TABLE "recipient_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"display_name" text NOT NULL,
	"description" text,
	"priority" integer DEFAULT 5,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "recipient_categories_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "recipient_engagements" (
	"id" serial PRIMARY KEY NOT NULL,
	"recipient_id" integer NOT NULL,
	"content_type" text NOT NULL,
	"content_id" integer NOT NULL,
	"engagement_type" text NOT NULL,
	"engagement_date" timestamp DEFAULT now(),
	"response_type" text,
	"response_content" text,
	"follow_up_required" boolean DEFAULT false,
	"follow_up_date" timestamp,
	"coverage_provided" boolean DEFAULT false,
	"coverage_url" text,
	"coverage_type" text,
	"estimated_reach" integer,
	"handled_by" integer,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"is_demo" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "release_contract_signatures" (
	"id" serial PRIMARY KEY NOT NULL,
	"release_contract_id" integer NOT NULL,
	"signer_user_id" integer NOT NULL,
	"signer_role" text NOT NULL,
	"signature_data" text,
	"signed_at" timestamp DEFAULT now(),
	"ip_address" text,
	"witness_name" text,
	"witness_signature" text
);
--> statement-breakpoint
CREATE TABLE "release_contracts" (
	"id" serial PRIMARY KEY NOT NULL,
	"managed_artist_user_id" integer NOT NULL,
	"approved_by_user_id" integer NOT NULL,
	"release_request_reason" text NOT NULL,
	"contract_terms" jsonb NOT NULL,
	"management_tier_at_release" integer,
	"status" text DEFAULT 'pending',
	"requested_at" timestamp DEFAULT now(),
	"approved_at" timestamp,
	"signed_at" timestamp,
	"completed_at" timestamp,
	"release_compensation" numeric(10, 2),
	"retained_royalty_percentage" numeric(5, 2),
	"release_effective_date" timestamp,
	"contract_document_url" text,
	"signed_contract_url" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "revenue_forecasts" (
	"id" serial PRIMARY KEY NOT NULL,
	"artist_user_id" integer NOT NULL,
	"forecast_type" text NOT NULL,
	"forecast_period" timestamp NOT NULL,
	"total_forecast" numeric(10, 2) NOT NULL,
	"stream_breakdown" jsonb NOT NULL,
	"confidence_level" numeric(5, 2) NOT NULL,
	"forecast_method" text NOT NULL,
	"assumptions" jsonb,
	"risk_factors" jsonb,
	"opportunities" jsonb,
	"generated_by_user_id" integer,
	"ai_model_version" text,
	"accuracy" numeric(5, 2),
	"actual_revenue" numeric(10, 2),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "revenue_goals" (
	"id" serial PRIMARY KEY NOT NULL,
	"artist_user_id" integer NOT NULL,
	"goal_type" text NOT NULL,
	"target_amount" numeric(10, 2) NOT NULL,
	"currency" text DEFAULT 'USD',
	"timeframe" text NOT NULL,
	"target_date" timestamp NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true,
	"progress" numeric(5, 2) DEFAULT '0',
	"last_calculated" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "revenue_optimizations" (
	"id" serial PRIMARY KEY NOT NULL,
	"artist_user_id" integer NOT NULL,
	"optimization_type" text NOT NULL,
	"current_metrics" jsonb,
	"recommended_actions" jsonb,
	"projected_impact" numeric(10, 2),
	"implementation_cost" numeric(10, 2),
	"roi" numeric(5, 2),
	"status" text DEFAULT 'pending',
	"implemented_at" timestamp,
	"results" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "revenue_streams" (
	"id" serial PRIMARY KEY NOT NULL,
	"artist_user_id" integer NOT NULL,
	"stream_type" text NOT NULL,
	"stream_name" text NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"currency" text DEFAULT 'USD',
	"exchange_rate" numeric(10, 6) DEFAULT '1.0',
	"usd_equivalent" numeric(10, 2) NOT NULL,
	"date_received" timestamp NOT NULL,
	"period_start" timestamp,
	"period_end" timestamp,
	"source_id" integer,
	"metadata" jsonb,
	"status" text DEFAULT 'confirmed',
	"tax_witheld" numeric(10, 2),
	"net_amount" numeric(10, 2),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"role_id" integer NOT NULL,
	"permission_key" text NOT NULL,
	"permission_value" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "unique_role_permission" UNIQUE("role_id","permission_key")
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"is_custom" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "roles_name_unique" UNIQUE("name")
);

-- Example Data
INSERT INTO roles (id, name)
VALUES 
  (1, 'superadmin'),
  (2, 'admin'),
  (3, 'managed_artist'),
  (4, 'artist'),
  (5, 'managed_musician'),
  (6, 'musician'),
  (7, 'managed_professional'),
  (8, 'professional'),
  (9, 'fan')
ON DUPLICATE KEY UPDATE name = VALUES(name);

--> statement-breakpoint
CREATE TABLE "roles_management" (
	"id" SERIAL PRIMARY KEY,
	"name" TEXT NOT NULL,                 
	"can_apply" BOOLEAN DEFAULT FALSE,

	"opphub_marketplace_discount" INTEGER DEFAULT 0,   
	"services_discount" INTEGER DEFAULT 0,            
 	"admin_commission" INTEGER DEFAULT 0,             

	"created_at" TIMESTAMP DEFAULT NOW(),
	"updated_at" TIMESTAMP DEFAULT NOW()
);

-- INSERT INTO roles_management (
--   id, 
--   name, 
--   can_apply, 
--   opphub_marketplace_discount, 
--   services_discount, 
--   admin_commission
-- )
-- VALUES
--   (1, 'SuperAdmin', FALSE, 0, 0, 0),
--   (2, 'Admin', FALSE, 0, 0, 0),
--   (3, 'Managed Artist', TRUE, 10, 5, 10),
--   (4, 'Artist', TRUE, 5, 0, 15),
--   (5, 'Managed Musician', TRUE, 10, 5, 10),
--   (6, 'Musician', TRUE, 5, 0, 15),
--   (7, 'Contracted Professional', TRUE, 10, 5, 10),
--   (8, 'Professional', TRUE, 5, 0, 15),
--   (9, 'Fan', TRUE, 0, 0, 0);

--> statement-breakpoint
CREATE TABLE "user_roles" (
    "id" SERIAL PRIMARY KEY,
    "userId" INTEGER REFERENCES users(id) NOT NULL,
    "roleId" INTEGER REFERENCES roles_management(id) NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    UNIQUE("userId", "roleId")
);

--> statement-breakpoint
CREATE TABLE "service_assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"service_id" integer NOT NULL,
	"assigned_user_id" integer NOT NULL,
	"assigned_price" numeric(10, 2) NOT NULL,
	"user_commission" numeric(10, 2) NOT NULL,
	"is_active" boolean DEFAULT true,
	"assigned_by_user_id" integer NOT NULL,
	"assigned_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "service_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "service_categories_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "service_discount_overrides" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"service_id" integer,
	"user_service_id" integer,
	"original_discount_percentage" numeric(5, 2),
	"override_discount_percentage" numeric(5, 2) NOT NULL,
	"override_reason" text NOT NULL,
	"authorized_by_user_id" integer NOT NULL,
	"is_active" boolean DEFAULT true,
	"effective_from" timestamp DEFAULT now(),
	"effective_until" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "service_reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"service_id" integer,
	"user_service_id" integer,
	"reviewer_user_id" integer NOT NULL,
	"rating" integer NOT NULL,
	"review" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"category_id" integer,
	"base_price" numeric(10, 2),
	"duration" integer,
	"unit" text DEFAULT 'session',
	"is_active" boolean DEFAULT true,
	"created_by_user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "setlist_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"songs" jsonb NOT NULL,
	"total_duration" integer,
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"modified_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shareable_links" (
	"id" serial PRIMARY KEY NOT NULL,
	"link_token" text NOT NULL,
	"document_type" text NOT NULL,
	"document_id" integer NOT NULL,
	"access_type" text NOT NULL,
	"role_restriction" integer,
	"section_restrictions" jsonb,
	"created_by_user_id" integer NOT NULL,
	"expires_at" timestamp,
	"max_uses" integer,
	"current_uses" integer DEFAULT 0,
	"metadata" jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"last_accessed_at" timestamp,
	CONSTRAINT "shareable_links_link_token_unique" UNIQUE("link_token")
);
--> statement-breakpoint
CREATE TABLE "song_merchandise" (
	"song_id" integer,
	"merchandise_id" integer
);
--> statement-breakpoint
CREATE TABLE "song_submissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"artist_id" integer NOT NULL,
	"song_title" varchar(255) NOT NULL,
	"song_reference" varchar(50) NOT NULL,
	"audio_file_url" text NOT NULL,
	"cover_art_url" text NOT NULL,
	"format" varchar(10) NOT NULL,
	"bitrate" integer,
	"sample_rate" integer,
	"isrc_code" varchar(12),
	"submission_type" varchar(20) NOT NULL,
	"cover_art_status" varchar(20) DEFAULT 'pending',
	"cover_art_validation" jsonb,
	"metadata_embedded" boolean DEFAULT false,
	"status" varchar(20) DEFAULT 'pending',
	"total_cost" numeric(10, 2),
	"discount" numeric(5, 2) DEFAULT '0',
	"final_cost" numeric(10, 2),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "songs" (
	"id" serial PRIMARY KEY NOT NULL,
	"artist_user_id" integer NOT NULL,
	"album_id" integer,
	"title" text NOT NULL,
	"genre" text,
	"secondary_genres" jsonb DEFAULT '[]'::jsonb,
	"mp3_url" text,
	"mp4_url" text,
	"wav_url" text,
	"flac_url" text,
	"document_url" text,
	"cover_art_url" text,
	"isrc_code" text NOT NULL,
	"price" numeric(10, 2),
	"custom_price" numeric(10, 2),
	"is_free" boolean DEFAULT false,
	"duration_seconds" integer,
	"preview_start_seconds" integer DEFAULT 0,
	"preview_duration" integer DEFAULT 30,
	"track_number" integer,
	"file_type" text DEFAULT 'audio',
	"merchandise_ids" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "splitsheet_notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"splitsheet_id" integer NOT NULL,
	"recipient_email" varchar(255) NOT NULL,
	"recipient_name" varchar(255) NOT NULL,
	"notification_type" varchar(50) NOT NULL,
	"status" varchar(20) DEFAULT 'pending',
	"access_token" varchar(100),
	"sent_at" timestamp,
	"opened_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "splitsheet_signatures" (
	"id" serial PRIMARY KEY NOT NULL,
	"splitsheet_id" integer NOT NULL,
	"signer_email" varchar(255) NOT NULL,
	"signer_name" varchar(255) NOT NULL,
	"signer_role" varchar(100) NOT NULL,
	"ipi_number" varchar(20),
	"user_id" integer,
	"signature_image_url" text,
	"signed_at" timestamp,
	"is_verified" boolean DEFAULT false,
	"percentage_ownership" numeric(5, 2),
	"ownership_type" varchar(20),
	"notification_sent" boolean DEFAULT false,
	"access_token" varchar(100),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "splitsheet_signatures_access_token_unique" UNIQUE("access_token")
);
--> statement-breakpoint
CREATE TABLE "stage_plots" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"items" jsonb NOT NULL,
	"stage_width" integer DEFAULT 800 NOT NULL,
	"stage_height" integer DEFAULT 600 NOT NULL,
	"booking_id" integer,
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"modified_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "store_currencies" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"symbol" text NOT NULL,
	"exchange_rate" numeric(10, 6) NOT NULL,
	"is_active" boolean DEFAULT true,
	"last_updated" timestamp DEFAULT now(),
	CONSTRAINT "store_currencies_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "system_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"setting_key" text NOT NULL,
	"setting_value" text NOT NULL,
	"description" text,
	"last_modified" timestamp DEFAULT now(),
	CONSTRAINT "system_settings_setting_key_unique" UNIQUE("setting_key")
);
--> statement-breakpoint
CREATE TABLE "technical_rider_stages" (
	"id" serial PRIMARY KEY NOT NULL,
	"booking_id" integer,
	"stage_name" varchar(100) NOT NULL,
	"stage_dimensions" jsonb DEFAULT '{}'::jsonb,
	"stage_layout" jsonb DEFAULT '{}'::jsonb,
	"equipment_positions" jsonb DEFAULT '[]'::jsonb,
	"mixer_configuration" jsonb DEFAULT '{}'::jsonb,
	"setlist_data" jsonb DEFAULT '[]'::jsonb,
	"created_by" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "technical_riders" (
	"id" serial PRIMARY KEY NOT NULL,
	"booking_id" integer,
	"artist_technical_specs" jsonb,
	"musician_technical_specs" jsonb,
	"equipment_requirements" jsonb,
	"stage_requirements" jsonb,
	"lighting_requirements" jsonb,
	"sound_requirements" jsonb,
	"additional_notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "trending_metrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"song_id" integer,
	"artist_id" integer,
	"album_id" integer,
	"metric_type" text NOT NULL,
	"timeframe" text NOT NULL,
	"count" integer DEFAULT 0,
	"date" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_availability" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"day_of_week" text,
	"available_date" timestamp,
	"start_time" text,
	"end_time" text,
	"availability_type" text NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_favorites" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"favorite_user_id" integer NOT NULL,
	"favorite_type" varchar(50) DEFAULT 'artist' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_genres" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"genre_name" text NOT NULL,
	"category" text,
	"is_top" boolean DEFAULT false,
	"is_custom" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_hospitality_requirements" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"requirement_type" text NOT NULL,
	"requirement_name" text NOT NULL,
	"specifications" text,
	"is_required" boolean DEFAULT true,
	"is_demo" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_interactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"song_id" integer,
	"artist_id" integer,
	"album_id" integer,
	"interaction_type" text NOT NULL,
	"duration" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_performance_specs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"spec_type" text NOT NULL,
	"spec_name" text NOT NULL,
	"spec_value" text NOT NULL,
	"is_demo" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_preferences" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"preferred_genres" jsonb,
	"favorite_artists" jsonb,
	"listening_habits" jsonb,
	"mood_preferences" jsonb,
	"discovery_settings" jsonb,
	"updated_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_professional_primary_talents" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"creative_talent_name" text,
	"user_type_id" integer NOT NULL,
	"description" text,
	"is_default" boolean DEFAULT false,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "user_professional_primary_talents_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "user_professional_service_capabilities" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"capability_name" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_professional_service_features" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"service_id" integer NOT NULL,
	"feature_name" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_professional_services" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"price" numeric(10, 2) NOT NULL,
	"duration" integer,
	"unit" text DEFAULT 'session',
	"enable_rating" boolean DEFAULT true,
	"category_id" integer,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_secondary_performance_talents" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"talent_name" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_secondary_professional_talents" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"talent_name" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_secondary_roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"role_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_services" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"price" numeric(10, 2) NOT NULL,
	"duration" integer,
	"unit" text DEFAULT 'session',
	"features" jsonb,
	"enable_rating" boolean DEFAULT true,
	"category_id" integer,
	"is_active" boolean DEFAULT true,
	"is_demo" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_skills_and_instruments" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"skill_type" text NOT NULL,
	"skill_name" text NOT NULL,
	"proficiency_level" text,
	"is_demo" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_social_links" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"platform" text NOT NULL,
	"handle" text,
	"url" text NOT NULL,
	"is_website" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_specializations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"specialization_name" text NOT NULL,
	"is_top" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_stage_names" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"stage_name" text NOT NULL,
	"is_primary" boolean DEFAULT false,
	"is_for_bookings" boolean DEFAULT true,
	"usage_type" text DEFAULT 'both',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_technical_requirements" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"requirement_type" text NOT NULL,
	"requirement_name" text NOT NULL,
	"specifications" text,
	"is_required" boolean DEFAULT true,
	"is_demo" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"full_name" text NOT NULL,
	"role_id" integer NOT NULL,
	"phone_number" text,
	"gender" text,
	"status" text DEFAULT 'active' NOT NULL,
	"privacy_setting" text DEFAULT 'public',
	"avatar_url" text,
	"cover_image_url" text,
	"is_demo" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"last_login" timestamp,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "videos" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"video_url" varchar(500) NOT NULL,
	"youtube_video_id" varchar(50),
	"thumbnail_url" varchar(500),
	"uploaded_by_user_id" integer,
	"is_public" boolean DEFAULT true,
	"video_type" varchar(50) DEFAULT 'youtube',
	"embed_code" text,
	"playlist_id" varchar(100),
	"duration" integer,
	"view_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "waitu_service_discount_limits" (
	"id" serial PRIMARY KEY NOT NULL,
	"service_id" integer NOT NULL,
	"default_max_discount_percentage" integer DEFAULT 0 NOT NULL,
	"description" text,
	"last_updated_by" integer NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "website_blocklist" (
	"id" serial PRIMARY KEY NOT NULL,
	"domain" text NOT NULL,
	"reason" text NOT NULL,
	"severity" text NOT NULL,
	"detected_at" timestamp DEFAULT now(),
	"is_active" boolean DEFAULT true,
	CONSTRAINT "website_blocklist_domain_unique" UNIQUE("domain")
);
--> statement-breakpoint
CREATE TABLE "website_integrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"slug" text NOT NULL,
	"title" text,
	"description" text,
	"is_active" boolean DEFAULT true,
	"access_level" text DEFAULT 'public',
	"social_links" jsonb DEFAULT '[]'::jsonb,
	"music_links" jsonb DEFAULT '[]'::jsonb,
	"booking_links" jsonb DEFAULT '[]'::jsonb,
	"store_links" jsonb DEFAULT '[]'::jsonb,
	"custom_links" jsonb DEFAULT '[]'::jsonb,
	"custom_theme" jsonb,
	"enabled_widgets" jsonb DEFAULT '{}'::jsonb,
	"widget_urls" jsonb DEFAULT '{}'::jsonb,
	"view_count" integer DEFAULT 0,
	"last_viewed" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "website_integrations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "website_integrations_embedded" (
	"id" serial PRIMARY KEY NOT NULL,
	"website_integration_id" integer NOT NULL,
	"embeddable_widgets" jsonb,
	"seo_settings" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "platform_color_schemes" (
	"id" serial PRIMARY KEY NOT NULL,
	"scheme_name" varchar(100) NOT NULL,
	"is_default" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"description" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "platform_color_schemes_scheme_name_unique" UNIQUE("scheme_name")
);
--> statement-breakpoint
CREATE TABLE "platform_colors" (
	"id" serial PRIMARY KEY NOT NULL,
	"scheme_id" integer NOT NULL,
	"color_key" varchar(255) NOT NULL,
	"color_value" varchar(50) NOT NULL,
	"color_name" varchar(100),
	"category" varchar(100) NOT NULL,
	"opacity" real DEFAULT 1,
	"css_variable_name" varchar(255),
	"usage" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "platform_component_styles" (
	"id" serial PRIMARY KEY NOT NULL,
	"component_type" varchar(100) NOT NULL,
	"variant" varchar(100) NOT NULL,
	"style_key" varchar(255) NOT NULL,
	"style_property" varchar(100) NOT NULL,
	"style_value" text NOT NULL,
	"state" varchar(50) DEFAULT 'default',
	"breakpoint" varchar(20) DEFAULT 'all',
	"priority" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"category" varchar(100),
	"css_class" varchar(255),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "platform_layout_controls" (
	"id" serial PRIMARY KEY NOT NULL,
	"layout_key" varchar(255) NOT NULL,
	"property" varchar(100) NOT NULL,
	"value" varchar(255) NOT NULL,
	"category" varchar(100) NOT NULL,
	"responsive" json,
	"description" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "platform_layout_controls_layout_key_unique" UNIQUE("layout_key")
);
--> statement-breakpoint
CREATE TABLE "platform_text_content" (
	"id" serial PRIMARY KEY NOT NULL,
	"content_key" varchar(255) NOT NULL,
	"content_value" text NOT NULL,
	"content_type" varchar(50) NOT NULL,
	"component_location" varchar(255),
	"is_markdown" boolean DEFAULT false,
	"is_html" boolean DEFAULT false,
	"context" text,
	"priority" varchar(20) DEFAULT 'normal',
	"is_active" boolean DEFAULT true,
	"language" varchar(10) DEFAULT 'en',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"created_by" integer,
	CONSTRAINT "platform_text_content_content_key_unique" UNIQUE("content_key")
);
--> statement-breakpoint
CREATE TABLE "platform_themes" (
	"id" serial PRIMARY KEY NOT NULL,
	"theme_name" varchar(100) NOT NULL,
	"description" text,
	"color_scheme_id" integer,
	"is_default" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"configuration" json,
	"css_output" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"created_by" integer,
	CONSTRAINT "platform_themes_theme_name_unique" UNIQUE("theme_name")
);
--> statement-breakpoint
CREATE TABLE "platform_typography" (
	"id" serial PRIMARY KEY NOT NULL,
	"typography_key" varchar(255) NOT NULL,
	"font_family" varchar(255) NOT NULL,
	"font_size" varchar(50) NOT NULL,
	"font_weight" varchar(50) NOT NULL,
	"line_height" varchar(50) NOT NULL,
	"letter_spacing" varchar(50) DEFAULT 'normal',
	"text_transform" varchar(50) DEFAULT 'none',
	"text_align" varchar(50) DEFAULT 'left',
	"category" varchar(100) NOT NULL,
	"responsive_sizes" json,
	"css_variable_name" varchar(255),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "platform_typography_typography_key_unique" UNIQUE("typography_key")
);
--> statement-breakpoint
ALTER TABLE "admin_assignments" ADD CONSTRAINT "admin_assignments_admin_user_id_users_id_fk" FOREIGN KEY ("admin_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_assignments" ADD CONSTRAINT "admin_assignments_managed_user_id_users_id_fk" FOREIGN KEY ("managed_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_assignments" ADD CONSTRAINT "admin_assignments_assigned_by_user_id_users_id_fk" FOREIGN KEY ("assigned_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_configurations" ADD CONSTRAINT "admin_configurations_last_modified_by_users_id_fk" FOREIGN KEY ("last_modified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "album_songs" ADD CONSTRAINT "album_songs_album_id_albums_id_fk" FOREIGN KEY ("album_id") REFERENCES "public"."albums"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "album_songs" ADD CONSTRAINT "album_songs_song_id_songs_id_fk" FOREIGN KEY ("song_id") REFERENCES "public"."songs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "albums" ADD CONSTRAINT "albums_artist_user_id_users_id_fk" FOREIGN KEY ("artist_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "all_links_penalties" ADD CONSTRAINT "all_links_penalties_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "all_links_penalties" ADD CONSTRAINT "all_links_penalties_website_integration_id_website_integrations_id_fk" FOREIGN KEY ("website_integration_id") REFERENCES "public"."website_integrations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "all_links_subscriptions" ADD CONSTRAINT "all_links_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application_legal_assignments" ADD CONSTRAINT "application_legal_assignments_application_id_management_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."management_applications"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application_legal_assignments" ADD CONSTRAINT "application_legal_assignments_lawyer_user_id_users_id_fk" FOREIGN KEY ("lawyer_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application_legal_assignments" ADD CONSTRAINT "application_legal_assignments_assigned_by_user_id_users_id_fk" FOREIGN KEY ("assigned_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "artist_band_members" ADD CONSTRAINT "artist_band_members_artist_user_id_users_id_fk" FOREIGN KEY ("artist_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "artist_band_members" ADD CONSTRAINT "artist_band_members_musician_user_id_users_id_fk" FOREIGN KEY ("musician_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "artist_band_members" ADD CONSTRAINT "artist_band_members_primary_instrument_id_all_instruments_id_fk" FOREIGN KEY ("primary_instrument_id") REFERENCES "public"."all_instruments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "artist_musician_assignments" ADD CONSTRAINT "artist_musician_assignments_artist_user_id_users_id_fk" FOREIGN KEY ("artist_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "artist_musician_assignments" ADD CONSTRAINT "artist_musician_assignments_musician_user_id_users_id_fk" FOREIGN KEY ("musician_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "artist_musician_assignments" ADD CONSTRAINT "artist_musician_assignments_assigned_by_user_id_users_id_fk" FOREIGN KEY ("assigned_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "artist_similarities" ADD CONSTRAINT "artist_similarities_artist_id_1_users_id_fk" FOREIGN KEY ("artist_id_1") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "artist_similarities" ADD CONSTRAINT "artist_similarities_artist_id_2_users_id_fk" FOREIGN KEY ("artist_id_2") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "artists" ADD CONSTRAINT "artists_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "artists" ADD CONSTRAINT "artists_management_tier_id_management_tiers_id_fk" FOREIGN KEY ("management_tier_id") REFERENCES "public"."management_tiers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "artists" ADD CONSTRAINT "artists_primary_talent_id_all_instruments_id_fk" FOREIGN KEY ("primary_talent_id") REFERENCES "public"."all_instruments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audio_file_metadata" ADD CONSTRAINT "audio_file_metadata_enhanced_splitsheet_id_enhanced_splitsheets_id_fk" FOREIGN KEY ("enhanced_splitsheet_id") REFERENCES "public"."enhanced_splitsheets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_assignments" ADD CONSTRAINT "booking_assignments_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_assignments" ADD CONSTRAINT "booking_assignments_assigned_user_id_users_id_fk" FOREIGN KEY ("assigned_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_assignments" ADD CONSTRAINT "booking_assignments_assigned_by_user_id_users_id_fk" FOREIGN KEY ("assigned_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_assignments_members" ADD CONSTRAINT "booking_assignments_members_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_assignments_members" ADD CONSTRAINT "booking_assignments_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_assignments_members" ADD CONSTRAINT "booking_assignments_members_role_in_booking_roles_id_fk" FOREIGN KEY ("role_in_booking") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_assignments_members" ADD CONSTRAINT "booking_assignments_members_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_assignments_members" ADD CONSTRAINT "booking_assignments_members_selected_talent_all_instruments_id_fk" FOREIGN KEY ("selected_talent") REFERENCES "public"."all_instruments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_attachments" ADD CONSTRAINT "booking_attachments_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_attachments" ADD CONSTRAINT "booking_attachments_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_attachments" ADD CONSTRAINT "booking_attachments_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_dates" ADD CONSTRAINT "booking_dates_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_documents" ADD CONSTRAINT "booking_documents_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_documents" ADD CONSTRAINT "booking_documents_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_media_access" ADD CONSTRAINT "booking_media_access_media_file_id_booking_media_files_id_fk" FOREIGN KEY ("media_file_id") REFERENCES "public"."booking_media_files"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_media_access" ADD CONSTRAINT "booking_media_access_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_media_access" ADD CONSTRAINT "booking_media_access_granted_by_user_id_users_id_fk" FOREIGN KEY ("granted_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_media_files" ADD CONSTRAINT "booking_media_files_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_media_files" ADD CONSTRAINT "booking_media_files_uploaded_by_user_id_users_id_fk" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_messages" ADD CONSTRAINT "booking_messages_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_messages" ADD CONSTRAINT "booking_messages_sender_user_id_users_id_fk" FOREIGN KEY ("sender_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_musicians" ADD CONSTRAINT "booking_musicians_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_musicians" ADD CONSTRAINT "booking_musicians_musician_user_id_users_id_fk" FOREIGN KEY ("musician_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_musicians" ADD CONSTRAINT "booking_musicians_rate_set_by_admin_id_users_id_fk" FOREIGN KEY ("rate_set_by_admin_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_professional_assignments" ADD CONSTRAINT "booking_professional_assignments_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_professional_assignments" ADD CONSTRAINT "booking_professional_assignments_professional_user_id_users_id_fk" FOREIGN KEY ("professional_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_professional_assignments" ADD CONSTRAINT "booking_professional_assignments_assigned_by_user_id_users_id_fk" FOREIGN KEY ("assigned_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_booker_user_id_users_id_fk" FOREIGN KEY ("booker_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_primary_artist_user_id_users_id_fk" FOREIGN KEY ("primary_artist_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_assigned_admin_id_users_id_fk" FOREIGN KEY ("assigned_admin_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bundle_items" ADD CONSTRAINT "bundle_items_bundle_id_bundles_id_fk" FOREIGN KEY ("bundle_id") REFERENCES "public"."bundles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bundles" ADD CONSTRAINT "bundles_artist_user_id_users_id_fk" FOREIGN KEY ("artist_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bundles" ADD CONSTRAINT "bundles_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaboration_comments" ADD CONSTRAINT "collaboration_comments_room_id_collaboration_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."collaboration_rooms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaboration_comments" ADD CONSTRAINT "collaboration_comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaboration_files" ADD CONSTRAINT "collaboration_files_room_id_collaboration_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."collaboration_rooms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaboration_files" ADD CONSTRAINT "collaboration_files_project_id_collaboration_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."collaboration_projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaboration_files" ADD CONSTRAINT "collaboration_files_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaboration_messages" ADD CONSTRAINT "collaboration_messages_room_id_collaboration_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."collaboration_rooms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaboration_messages" ADD CONSTRAINT "collaboration_messages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaboration_participants" ADD CONSTRAINT "collaboration_participants_room_id_collaboration_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."collaboration_rooms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaboration_participants" ADD CONSTRAINT "collaboration_participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaboration_projects" ADD CONSTRAINT "collaboration_projects_room_id_collaboration_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."collaboration_rooms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaboration_rooms" ADD CONSTRAINT "collaboration_rooms_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaboration_tasks" ADD CONSTRAINT "collaboration_tasks_room_id_collaboration_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."collaboration_rooms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaboration_tasks" ADD CONSTRAINT "collaboration_tasks_project_id_collaboration_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."collaboration_projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaboration_tasks" ADD CONSTRAINT "collaboration_tasks_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collaboration_tasks" ADD CONSTRAINT "collaboration_tasks_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comeseetv_artist_programs" ADD CONSTRAINT "comeseetv_artist_programs_artist_id_artists_user_id_fk" FOREIGN KEY ("artist_id") REFERENCES "public"."artists"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "configuration_delegations" ADD CONSTRAINT "configuration_delegations_delegated_by_users_id_fk" FOREIGN KEY ("delegated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "configuration_delegations" ADD CONSTRAINT "configuration_delegations_delegated_to_users_id_fk" FOREIGN KEY ("delegated_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "configuration_history" ADD CONSTRAINT "configuration_history_configuration_id_admin_configurations_id_fk" FOREIGN KEY ("configuration_id") REFERENCES "public"."admin_configurations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "configuration_history" ADD CONSTRAINT "configuration_history_changed_by_users_id_fk" FOREIGN KEY ("changed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_distribution" ADD CONSTRAINT "content_distribution_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract_signatures" ADD CONSTRAINT "contract_signatures_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contract_signatures" ADD CONSTRAINT "contract_signatures_signer_user_id_users_id_fk" FOREIGN KEY ("signer_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_assigned_to_user_id_users_id_fk" FOREIGN KEY ("assigned_to_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cross_promotion_campaigns" ADD CONSTRAINT "cross_promotion_campaigns_promoting_artist_id_users_id_fk" FOREIGN KEY ("promoting_artist_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cross_promotion_campaigns" ADD CONSTRAINT "cross_promotion_campaigns_promoted_artist_id_users_id_fk" FOREIGN KEY ("promoted_artist_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "curator_email_campaigns" ADD CONSTRAINT "curator_email_campaigns_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "curator_submissions" ADD CONSTRAINT "curator_submissions_curator_id_curators_id_fk" FOREIGN KEY ("curator_id") REFERENCES "public"."curators"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "curator_submissions" ADD CONSTRAINT "curator_submissions_song_id_songs_id_fk" FOREIGN KEY ("song_id") REFERENCES "public"."songs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "curator_submissions" ADD CONSTRAINT "curator_submissions_album_id_albums_id_fk" FOREIGN KEY ("album_id") REFERENCES "public"."albums"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "curator_submissions" ADD CONSTRAINT "curator_submissions_submitted_by_user_id_users_id_fk" FOREIGN KEY ("submitted_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "curators" ADD CONSTRAINT "curators_added_by_user_id_users_id_fk" FOREIGN KEY ("added_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discount_conditions" ADD CONSTRAINT "discount_conditions_bundle_id_bundles_id_fk" FOREIGN KEY ("bundle_id") REFERENCES "public"."bundles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dj_access" ADD CONSTRAINT "dj_access_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dj_access" ADD CONSTRAINT "dj_access_dj_user_id_users_id_fk" FOREIGN KEY ("dj_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dj_access" ADD CONSTRAINT "dj_access_granted_by_user_id_users_id_fk" FOREIGN KEY ("granted_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_linkages" ADD CONSTRAINT "document_linkages_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_permissions" ADD CONSTRAINT "document_permissions_document_id_mediahub_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."mediahub_documents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_permissions" ADD CONSTRAINT "document_permissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_permissions" ADD CONSTRAINT "document_permissions_granted_by_users_id_fk" FOREIGN KEY ("granted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enhanced_splitsheet_notifications" ADD CONSTRAINT "enhanced_splitsheet_notifications_enhanced_splitsheet_id_enhanced_splitsheets_id_fk" FOREIGN KEY ("enhanced_splitsheet_id") REFERENCES "public"."enhanced_splitsheets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enhanced_splitsheets" ADD CONSTRAINT "enhanced_splitsheets_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enhanced_splitsheets" ADD CONSTRAINT "enhanced_splitsheets_management_tier_applied_management_tiers_id_fk" FOREIGN KEY ("management_tier_applied") REFERENCES "public"."management_tiers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_artist_user_id_users_id_fk" FOREIGN KEY ("artist_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fan_engagement" ADD CONSTRAINT "fan_engagement_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fan_engagement" ADD CONSTRAINT "fan_engagement_artist_user_id_users_id_fk" FOREIGN KEY ("artist_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fan_subscriptions" ADD CONSTRAINT "fan_subscriptions_fan_user_id_users_id_fk" FOREIGN KEY ("fan_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fan_subscriptions" ADD CONSTRAINT "fan_subscriptions_artist_user_id_users_id_fk" FOREIGN KEY ("artist_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financial_audit_log" ADD CONSTRAINT "financial_audit_log_performed_by_user_id_users_id_fk" FOREIGN KEY ("performed_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hospitality_requirements" ADD CONSTRAINT "hospitality_requirements_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hospitality_requirements" ADD CONSTRAINT "hospitality_requirements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "individual_discount_permissions" ADD CONSTRAINT "individual_discount_permissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "individual_discount_permissions" ADD CONSTRAINT "individual_discount_permissions_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "individual_discount_permissions" ADD CONSTRAINT "individual_discount_permissions_granted_by_users_id_fk" FOREIGN KEY ("granted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "industry_recipients" ADD CONSTRAINT "industry_recipients_category_id_recipient_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."recipient_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "industry_recipients" ADD CONSTRAINT "industry_recipients_added_by_users_id_fk" FOREIGN KEY ("added_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "industry_recipients" ADD CONSTRAINT "industry_recipients_verified_by_users_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_triggered_by_user_id_users_id_fk" FOREIGN KEY ("triggered_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "isrc_codes" ADD CONSTRAINT "isrc_codes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "legal_assignments" ADD CONSTRAINT "legal_assignments_client_user_id_users_id_fk" FOREIGN KEY ("client_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "legal_assignments" ADD CONSTRAINT "legal_assignments_lawyer_user_id_users_id_fk" FOREIGN KEY ("lawyer_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "legal_assignments" ADD CONSTRAINT "legal_assignments_assigned_by_user_id_users_id_fk" FOREIGN KEY ("assigned_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "link_access_logs" ADD CONSTRAINT "link_access_logs_link_id_shareable_links_id_fk" FOREIGN KEY ("link_id") REFERENCES "public"."shareable_links"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "link_access_logs" ADD CONSTRAINT "link_access_logs_accessed_by_user_id_users_id_fk" FOREIGN KEY ("accessed_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "management_application_reviews" ADD CONSTRAINT "management_application_reviews_application_id_management_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."management_applications"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "management_application_reviews" ADD CONSTRAINT "management_application_reviews_reviewer_user_id_users_id_fk" FOREIGN KEY ("reviewer_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "management_application_signatures" ADD CONSTRAINT "management_application_signatures_application_id_management_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."management_applications"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "management_application_signatures" ADD CONSTRAINT "management_application_signatures_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "management_applications" ADD CONSTRAINT "management_applications_applicant_user_id_users_id_fk" FOREIGN KEY ("applicant_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "management_applications" ADD CONSTRAINT "management_applications_requested_management_tier_id_management_tiers_id_fk" FOREIGN KEY ("requested_management_tier_id") REFERENCES "public"."management_tiers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "management_applications" ADD CONSTRAINT "management_applications_reviewed_by_user_id_users_id_fk" FOREIGN KEY ("reviewed_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "management_applications" ADD CONSTRAINT "management_applications_approved_by_user_id_users_id_fk" FOREIGN KEY ("approved_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "management_transitions" ADD CONSTRAINT "management_transitions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "management_transitions" ADD CONSTRAINT "management_transitions_from_role_id_roles_id_fk" FOREIGN KEY ("from_role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "management_transitions" ADD CONSTRAINT "management_transitions_to_role_id_roles_id_fk" FOREIGN KEY ("to_role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "management_transitions" ADD CONSTRAINT "management_transitions_from_management_tier_id_management_tiers_id_fk" FOREIGN KEY ("from_management_tier_id") REFERENCES "public"."management_tiers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "management_transitions" ADD CONSTRAINT "management_transitions_to_management_tier_id_management_tiers_id_fk" FOREIGN KEY ("to_management_tier_id") REFERENCES "public"."management_tiers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "management_transitions" ADD CONSTRAINT "management_transitions_release_contract_id_release_contracts_id_fk" FOREIGN KEY ("release_contract_id") REFERENCES "public"."release_contracts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "management_transitions" ADD CONSTRAINT "management_transitions_processed_by_user_id_users_id_fk" FOREIGN KEY ("processed_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market_intelligence" ADD CONSTRAINT "market_intelligence_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mediahub_documents" ADD CONSTRAINT "mediahub_documents_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mediahub_documents" ADD CONSTRAINT "mediahub_documents_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "merchandise" ADD CONSTRAINT "merchandise_artist_user_id_users_id_fk" FOREIGN KEY ("artist_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "merchandise" ADD CONSTRAINT "merchandise_category_id_merchandise_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."merchandise_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mixer_patch_lists" ADD CONSTRAINT "mixer_patch_lists_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mixer_patch_lists" ADD CONSTRAINT "mixer_patch_lists_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "music_recommendations" ADD CONSTRAINT "music_recommendations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "music_recommendations" ADD CONSTRAINT "music_recommendations_song_id_songs_id_fk" FOREIGN KEY ("song_id") REFERENCES "public"."songs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "music_recommendations" ADD CONSTRAINT "music_recommendations_artist_id_users_id_fk" FOREIGN KEY ("artist_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "music_recommendations" ADD CONSTRAINT "music_recommendations_album_id_albums_id_fk" FOREIGN KEY ("album_id") REFERENCES "public"."albums"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "musician_instrument_preferences" ADD CONSTRAINT "musician_instrument_preferences_musician_user_id_users_id_fk" FOREIGN KEY ("musician_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "musician_instrument_preferences" ADD CONSTRAINT "musician_instrument_preferences_instrument_id_all_instruments_id_fk" FOREIGN KEY ("instrument_id") REFERENCES "public"."all_instruments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "musicians" ADD CONSTRAINT "musicians_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "musicians" ADD CONSTRAINT "musicians_management_tier_id_management_tiers_id_fk" FOREIGN KEY ("management_tier_id") REFERENCES "public"."management_tiers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "musicians" ADD CONSTRAINT "musicians_primary_talent_id_all_instruments_id_fk" FOREIGN KEY ("primary_talent_id") REFERENCES "public"."all_instruments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "newsletter_engagements" ADD CONSTRAINT "newsletter_engagements_newsletter_id_newsletters_id_fk" FOREIGN KEY ("newsletter_id") REFERENCES "public"."newsletters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "newsletter_engagements" ADD CONSTRAINT "newsletter_engagements_subscription_id_newsletter_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."newsletter_subscriptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "newsletters" ADD CONSTRAINT "newsletters_target_artist_id_artists_user_id_fk" FOREIGN KEY ("target_artist_id") REFERENCES "public"."artists"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "newsletters" ADD CONSTRAINT "newsletters_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oauth_accounts" ADD CONSTRAINT "oauth_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opphub_application_analytics" ADD CONSTRAINT "opphub_application_analytics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opphub_application_analytics" ADD CONSTRAINT "opphub_application_analytics_opportunity_id_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opphub_application_guidance" ADD CONSTRAINT "opphub_application_guidance_opportunity_id_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opphub_application_guidance" ADD CONSTRAINT "opphub_application_guidance_target_user_id_users_id_fk" FOREIGN KEY ("target_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opphub_deadline_tracking" ADD CONSTRAINT "opphub_deadline_tracking_opportunity_id_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opphub_deadline_tracking" ADD CONSTRAINT "opphub_deadline_tracking_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opphub_professional_guidance" ADD CONSTRAINT "opphub_professional_guidance_assignment_id_booking_professional_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."booking_professional_assignments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opphub_professional_guidance" ADD CONSTRAINT "opphub_professional_guidance_managed_artist_user_id_users_id_fk" FOREIGN KEY ("managed_artist_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opphub_subscriptions" ADD CONSTRAINT "opphub_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opphub_success_stories" ADD CONSTRAINT "opphub_success_stories_opportunity_id_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opphub_success_stories" ADD CONSTRAINT "opphub_success_stories_added_by_users_id_fk" FOREIGN KEY ("added_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_category_id_opportunity_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."opportunity_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_verified_by_users_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunity_applications" ADD CONSTRAINT "opportunity_applications_opportunity_id_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunity_applications" ADD CONSTRAINT "opportunity_applications_applicant_user_id_users_id_fk" FOREIGN KEY ("applicant_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunity_applications" ADD CONSTRAINT "opportunity_applications_artist_id_artists_user_id_fk" FOREIGN KEY ("artist_id") REFERENCES "public"."artists"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunity_applications" ADD CONSTRAINT "opportunity_applications_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunity_matches" ADD CONSTRAINT "opportunity_matches_opportunity_id_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunity_matches" ADD CONSTRAINT "opportunity_matches_artist_id_artists_user_id_fk" FOREIGN KEY ("artist_id") REFERENCES "public"."artists"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunity_sources" ADD CONSTRAINT "opportunity_sources_category_id_opportunity_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."opportunity_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_payout_request_id_payout_requests_id_fk" FOREIGN KEY ("payout_request_id") REFERENCES "public"."payout_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payout_requests" ADD CONSTRAINT "payout_requests_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payout_requests" ADD CONSTRAINT "payout_requests_performer_user_id_users_id_fk" FOREIGN KEY ("performer_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payout_requests" ADD CONSTRAINT "payout_requests_triggered_by_user_id_users_id_fk" FOREIGN KEY ("triggered_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payout_requests" ADD CONSTRAINT "payout_requests_approved_by_user_id_users_id_fk" FOREIGN KEY ("approved_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "playback_track_downloads" ADD CONSTRAINT "playback_track_downloads_playback_track_id_playback_tracks_id_fk" FOREIGN KEY ("playback_track_id") REFERENCES "public"."playback_tracks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "playback_track_downloads" ADD CONSTRAINT "playback_track_downloads_dj_access_id_dj_access_id_fk" FOREIGN KEY ("dj_access_id") REFERENCES "public"."dj_access"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "playback_track_downloads" ADD CONSTRAINT "playback_track_downloads_downloaded_by_user_id_users_id_fk" FOREIGN KEY ("downloaded_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "playback_tracks" ADD CONSTRAINT "playback_tracks_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "playback_tracks" ADD CONSTRAINT "playback_tracks_song_id_songs_id_fk" FOREIGN KEY ("song_id") REFERENCES "public"."songs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "playback_tracks" ADD CONSTRAINT "playback_tracks_processed_by_user_id_users_id_fk" FOREIGN KEY ("processed_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "press_release_analytics" ADD CONSTRAINT "press_release_analytics_press_release_id_press_releases_id_fk" FOREIGN KEY ("press_release_id") REFERENCES "public"."press_releases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "press_release_assignments" ADD CONSTRAINT "press_release_assignments_press_release_id_press_releases_id_fk" FOREIGN KEY ("press_release_id") REFERENCES "public"."press_releases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "press_release_assignments" ADD CONSTRAINT "press_release_assignments_artist_id_artists_user_id_fk" FOREIGN KEY ("artist_id") REFERENCES "public"."artists"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "press_release_assignments" ADD CONSTRAINT "press_release_assignments_musician_id_musicians_user_id_fk" FOREIGN KEY ("musician_id") REFERENCES "public"."musicians"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "press_release_assignments" ADD CONSTRAINT "press_release_assignments_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "press_release_distribution" ADD CONSTRAINT "press_release_distribution_press_release_id_press_releases_id_fk" FOREIGN KEY ("press_release_id") REFERENCES "public"."press_releases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "press_release_distribution" ADD CONSTRAINT "press_release_distribution_distributed_by_users_id_fk" FOREIGN KEY ("distributed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "press_release_media" ADD CONSTRAINT "press_release_media_press_release_id_press_releases_id_fk" FOREIGN KEY ("press_release_id") REFERENCES "public"."press_releases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "press_release_media" ADD CONSTRAINT "press_release_media_song_id_songs_id_fk" FOREIGN KEY ("song_id") REFERENCES "public"."songs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "press_release_media" ADD CONSTRAINT "press_release_media_album_id_albums_id_fk" FOREIGN KEY ("album_id") REFERENCES "public"."albums"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "press_releases" ADD CONSTRAINT "press_releases_primary_artist_id_artists_user_id_fk" FOREIGN KEY ("primary_artist_id") REFERENCES "public"."artists"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "press_releases" ADD CONSTRAINT "press_releases_song_id_songs_id_fk" FOREIGN KEY ("song_id") REFERENCES "public"."songs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "press_releases" ADD CONSTRAINT "press_releases_album_id_albums_id_fk" FOREIGN KEY ("album_id") REFERENCES "public"."albums"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "press_releases" ADD CONSTRAINT "press_releases_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "press_releases" ADD CONSTRAINT "press_releases_last_modified_by_users_id_fk" FOREIGN KEY ("last_modified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pro_eligibility_assessments" ADD CONSTRAINT "pro_eligibility_assessments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pro_registrations" ADD CONSTRAINT "pro_registrations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pro_works" ADD CONSTRAINT "pro_works_pro_registration_id_pro_registrations_id_fk" FOREIGN KEY ("pro_registration_id") REFERENCES "public"."pro_registrations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pro_works" ADD CONSTRAINT "pro_works_song_id_songs_id_fk" FOREIGN KEY ("song_id") REFERENCES "public"."songs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "professional_availability" ADD CONSTRAINT "professional_availability_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "professionals" ADD CONSTRAINT "professionals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "professionals" ADD CONSTRAINT "professionals_management_tier_id_management_tiers_id_fk" FOREIGN KEY ("management_tier_id") REFERENCES "public"."management_tiers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "professionals" ADD CONSTRAINT "professionals_primary_talent_id_user_professional_primary_talents_id_fk" FOREIGN KEY ("primary_talent_id") REFERENCES "public"."user_professional_primary_talents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipient_engagements" ADD CONSTRAINT "recipient_engagements_recipient_id_industry_recipients_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."industry_recipients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipient_engagements" ADD CONSTRAINT "recipient_engagements_handled_by_users_id_fk" FOREIGN KEY ("handled_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "release_contract_signatures" ADD CONSTRAINT "release_contract_signatures_release_contract_id_release_contracts_id_fk" FOREIGN KEY ("release_contract_id") REFERENCES "public"."release_contracts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "release_contract_signatures" ADD CONSTRAINT "release_contract_signatures_signer_user_id_users_id_fk" FOREIGN KEY ("signer_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "release_contracts" ADD CONSTRAINT "release_contracts_managed_artist_user_id_users_id_fk" FOREIGN KEY ("managed_artist_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "release_contracts" ADD CONSTRAINT "release_contracts_approved_by_user_id_users_id_fk" FOREIGN KEY ("approved_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "release_contracts" ADD CONSTRAINT "release_contracts_management_tier_at_release_management_tiers_id_fk" FOREIGN KEY ("management_tier_at_release") REFERENCES "public"."management_tiers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "revenue_forecasts" ADD CONSTRAINT "revenue_forecasts_artist_user_id_users_id_fk" FOREIGN KEY ("artist_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "revenue_forecasts" ADD CONSTRAINT "revenue_forecasts_generated_by_user_id_users_id_fk" FOREIGN KEY ("generated_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "revenue_goals" ADD CONSTRAINT "revenue_goals_artist_user_id_users_id_fk" FOREIGN KEY ("artist_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "revenue_optimizations" ADD CONSTRAINT "revenue_optimizations_artist_user_id_users_id_fk" FOREIGN KEY ("artist_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "revenue_streams" ADD CONSTRAINT "revenue_streams_artist_user_id_users_id_fk" FOREIGN KEY ("artist_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_assignments" ADD CONSTRAINT "service_assignments_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_assignments" ADD CONSTRAINT "service_assignments_assigned_user_id_users_id_fk" FOREIGN KEY ("assigned_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_assignments" ADD CONSTRAINT "service_assignments_assigned_by_user_id_users_id_fk" FOREIGN KEY ("assigned_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_discount_overrides" ADD CONSTRAINT "service_discount_overrides_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_discount_overrides" ADD CONSTRAINT "service_discount_overrides_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_discount_overrides" ADD CONSTRAINT "service_discount_overrides_user_service_id_user_services_id_fk" FOREIGN KEY ("user_service_id") REFERENCES "public"."user_services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_discount_overrides" ADD CONSTRAINT "service_discount_overrides_authorized_by_user_id_users_id_fk" FOREIGN KEY ("authorized_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_reviews" ADD CONSTRAINT "service_reviews_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_reviews" ADD CONSTRAINT "service_reviews_user_service_id_user_services_id_fk" FOREIGN KEY ("user_service_id") REFERENCES "public"."user_services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_reviews" ADD CONSTRAINT "service_reviews_reviewer_user_id_users_id_fk" FOREIGN KEY ("reviewer_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_category_id_service_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."service_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "setlist_templates" ADD CONSTRAINT "setlist_templates_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shareable_links" ADD CONSTRAINT "shareable_links_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "song_merchandise" ADD CONSTRAINT "song_merchandise_song_id_songs_id_fk" FOREIGN KEY ("song_id") REFERENCES "public"."songs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "song_merchandise" ADD CONSTRAINT "song_merchandise_merchandise_id_merchandise_id_fk" FOREIGN KEY ("merchandise_id") REFERENCES "public"."merchandise"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "songs" ADD CONSTRAINT "songs_artist_user_id_users_id_fk" FOREIGN KEY ("artist_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "songs" ADD CONSTRAINT "songs_album_id_albums_id_fk" FOREIGN KEY ("album_id") REFERENCES "public"."albums"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stage_plots" ADD CONSTRAINT "stage_plots_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stage_plots" ADD CONSTRAINT "stage_plots_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "technical_rider_stages" ADD CONSTRAINT "technical_rider_stages_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "technical_rider_stages" ADD CONSTRAINT "technical_rider_stages_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "technical_riders" ADD CONSTRAINT "technical_riders_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trending_metrics" ADD CONSTRAINT "trending_metrics_song_id_songs_id_fk" FOREIGN KEY ("song_id") REFERENCES "public"."songs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trending_metrics" ADD CONSTRAINT "trending_metrics_artist_id_users_id_fk" FOREIGN KEY ("artist_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trending_metrics" ADD CONSTRAINT "trending_metrics_album_id_albums_id_fk" FOREIGN KEY ("album_id") REFERENCES "public"."albums"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_availability" ADD CONSTRAINT "user_availability_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_favorites" ADD CONSTRAINT "user_favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_favorites" ADD CONSTRAINT "user_favorites_favorite_user_id_users_id_fk" FOREIGN KEY ("favorite_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_genres" ADD CONSTRAINT "user_genres_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_hospitality_requirements" ADD CONSTRAINT "user_hospitality_requirements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_interactions" ADD CONSTRAINT "user_interactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_interactions" ADD CONSTRAINT "user_interactions_song_id_songs_id_fk" FOREIGN KEY ("song_id") REFERENCES "public"."songs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_interactions" ADD CONSTRAINT "user_interactions_artist_id_users_id_fk" FOREIGN KEY ("artist_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_interactions" ADD CONSTRAINT "user_interactions_album_id_albums_id_fk" FOREIGN KEY ("album_id") REFERENCES "public"."albums"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_performance_specs" ADD CONSTRAINT "user_performance_specs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_professional_primary_talents" ADD CONSTRAINT "user_professional_primary_talents_user_type_id_roles_id_fk" FOREIGN KEY ("user_type_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_professional_service_capabilities" ADD CONSTRAINT "user_professional_service_capabilities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_professional_service_features" ADD CONSTRAINT "user_professional_service_features_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_professional_service_features" ADD CONSTRAINT "user_professional_service_features_service_id_user_professional_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."user_professional_services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_professional_services" ADD CONSTRAINT "user_professional_services_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_secondary_performance_talents" ADD CONSTRAINT "user_secondary_performance_talents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_secondary_professional_talents" ADD CONSTRAINT "user_secondary_professional_talents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_secondary_roles" ADD CONSTRAINT "user_secondary_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_secondary_roles" ADD CONSTRAINT "user_secondary_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_services" ADD CONSTRAINT "user_services_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_services" ADD CONSTRAINT "user_services_category_id_service_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."service_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_skills_and_instruments" ADD CONSTRAINT "user_skills_and_instruments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_social_links" ADD CONSTRAINT "user_social_links_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_specializations" ADD CONSTRAINT "user_specializations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_stage_names" ADD CONSTRAINT "user_stage_names_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_technical_requirements" ADD CONSTRAINT "user_technical_requirements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "videos" ADD CONSTRAINT "videos_uploaded_by_user_id_users_id_fk" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "waitu_service_discount_limits" ADD CONSTRAINT "waitu_service_discount_limits_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "waitu_service_discount_limits" ADD CONSTRAINT "waitu_service_discount_limits_last_updated_by_users_id_fk" FOREIGN KEY ("last_updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "website_integrations" ADD CONSTRAINT "website_integrations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "website_integrations_embedded" ADD CONSTRAINT "website_integrations_embedded_website_integration_id_website_integrations_id_fk" FOREIGN KEY ("website_integration_id") REFERENCES "public"."website_integrations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_colors" ADD CONSTRAINT "platform_colors_scheme_id_platform_color_schemes_id_fk" FOREIGN KEY ("scheme_id") REFERENCES "public"."platform_color_schemes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_themes" ADD CONSTRAINT "platform_themes_color_scheme_id_platform_color_schemes_id_fk" FOREIGN KEY ("color_scheme_id") REFERENCES "public"."platform_color_schemes"("id") ON DELETE no action ON UPDATE no action;