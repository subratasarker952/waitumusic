import { pgTable, serial, integer, text, varchar, boolean, decimal, timestamp, jsonb, unique } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User management tables
export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  isCustom: boolean("is_custom").default(false), // To distinguish custom roles from default ones
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Role permissions table for granular control
export const rolePermissions = pgTable("role_permissions", {
  id: serial("id").primaryKey(),
  roleId: integer("role_id").references(() => roles.id).notNull(),
  permissionKey: text("permission_key").notNull(), // e.g., 'gighub.technical_rider', 'dashboard.stats', etc.
  permissionValue: boolean("permission_value").default(true), // true = allowed, false = denied
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  unique('unique_role_permission').on(table.roleId, table.permissionKey),
]);

// Normalized user data tables
export const userSecondaryRoles = pgTable("user_secondary_roles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  roleId: integer("role_id").references(() => roles.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  fullName: text("full_name").notNull(),
  phoneNumber: text("phone_number"),
  gender: text("gender"), // male, female, non-binary, prefer_not_to_say
  status: text("status").notNull().default("active"),
  privacySetting: text("privacy_setting").default("public"), // public/private
  avatarUrl: text("avatar_url"), // Media hub reference
  coverImageUrl: text("cover_image_url"), // Media hub reference
  isDemo: boolean("is_demo").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  lastLogin: timestamp("last_login"),
});



// Professional primary talents (for professionals only - artists/musicians use all_instruments)
export const userProfessionalPrimaryTalents = pgTable("user_professional_primary_talents", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  creativeTalentName: text("creative_talent_name"), // Optional fancy display name
  userTypeId: integer("user_type_id").references(() => roles.id).notNull(), // Links to professional roles (7=managed_professional, 8=professional)
  description: text("description"),
  isDefault: boolean("is_default").default(false), // for default selections
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertUserProfessionalPrimaryTalentSchema = createInsertSchema(userProfessionalPrimaryTalents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const managementTiers = pgTable("management_tiers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  appliesTo: text("applies_to").array().default(['artist', 'musician']), // Professional roles excluded from Publisher
});


export const rolesManagement = pgTable("roles_management", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), 
  canApply: boolean("can_apply").default(false),

  // Universal percentages
  opphubMarketplaceDiscount: integer("opphub_marketplace_discount").default(0),
  servicesDiscount: integer("services_discount").default(0),
  adminCommission: integer("admin_commission").default(0),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userRoles = pgTable("user_roles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  roleId: integer("role_id").references(() => rolesManagement.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => ({
  userRoleUnique: unique().on(t.userId, t.roleId), // unique constraint
}));


export const userSecondaryPerformanceTalents = pgTable("user_secondary_performance_talents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  talentName: text("talent_name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userSecondaryProfessionalTalents = pgTable("user_secondary_professional_talents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  talentName: text("talent_name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userProfessionalServices = pgTable("user_professional_services", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  duration: integer("duration"), // in minutes
  unit: text("unit").default("session"),
  enableRating: boolean("enable_rating").default(true),
  categoryId: integer("category_id"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userProfessionalServiceFeatures = pgTable("user_professional_service_features", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  serviceId: integer("service_id").references(() => userProfessionalServices.id).notNull(),
  featureName: text("feature_name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userProfessionalServiceCapabilities = pgTable("user_professional_service_capabilities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  capabilityName: text("capability_name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userSpecializations = pgTable("user_specializations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  specializationName: text("specialization_name").notNull(),
  isTop: boolean("is_top").default(false), // Combines specializations and top_specializations
  createdAt: timestamp("created_at").defaultNow(),
});

export const userSocialLinks = pgTable("user_social_links", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  platform: text("platform").notNull(),
  handle: text("handle"),
  url: text("url").notNull(),
  isWebsite: boolean("is_website").default(false), // For website_url
  createdAt: timestamp("created_at").defaultNow(),
});

export const userStageNames = pgTable("user_stage_names", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  stageName: text("stage_name").notNull(),
  isPrimary: boolean("is_primary").default(false),
  isForBookings: boolean("is_for_bookings").default(true),
  usageType: text("usage_type").default("both"), // 'primary', 'bookings', 'both'
  createdAt: timestamp("created_at").defaultNow(),
});

export const userGenres = pgTable("user_genres", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  genreName: text("genre_name").notNull(),
  category: text("category"), // For secondary_genres categorization
  isTop: boolean("is_top").default(false), // Combines secondary_genres and top_genres
  isCustom: boolean("is_custom").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userTechnicalRequirements = pgTable("user_technical_requirements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  requirementType: text("requirement_type").notNull(), // 'equipment', 'stage_setup', etc.
  requirementName: text("requirement_name").notNull(),
  specifications: text("specifications"),
  isRequired: boolean("is_required").default(true),
  isDemo: boolean("is_demo").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userSkillsAndInstruments = pgTable("user_skills_and_instruments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  skillType: text("skill_type").notNull(), // 'instrument', 'skill', 'capability'
  skillName: text("skill_name").notNull(),
  proficiencyLevel: text("proficiency_level"), // 'beginner', 'intermediate', 'advanced', 'expert'
  isDemo: boolean("is_demo").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userHospitalityRequirements = pgTable("user_hospitality_requirements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  requirementType: text("requirement_type").notNull(), // 'catering', 'accommodation', 'transportation'
  requirementName: text("requirement_name").notNull(),
  specifications: text("specifications"),
  isRequired: boolean("is_required").default(true),
  isDemo: boolean("is_demo").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userPerformanceSpecs = pgTable("user_performance_specs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  specType: text("spec_type").notNull(), // 'duration', 'break_requirements', 'setup_time'
  specName: text("spec_name").notNull(),
  specValue: text("spec_value").notNull(),
  isDemo: boolean("is_demo").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userAvailability = pgTable("user_availability", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  dayOfWeek: text("day_of_week"), // 'monday', 'tuesday', etc. or null for date-specific
  availableDate: timestamp("available_date"), // Specific date availability
  startTime: text("start_time"), // '09:00'
  endTime: text("end_time"), // '17:00'
  availabilityType: text("availability_type").notNull(), // 'regular', 'exception', 'blocked'
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Artists table - exact specification
export const artists = pgTable("artists", {
  userId: integer("user_id").references(() => users.id).primaryKey(),
  stageName: text("stage_name").notNull(),
  bio: text("bio"),
  epkUrl: text("epk_url"),
  primaryGenre: text("primary_genre"),
  basePrice: decimal("base_price", { precision: 10, scale: 2 }),
  idealPerformanceRate: decimal("ideal_performance_rate", { precision: 10, scale: 2 }),
  minimumAcceptableRate: decimal("minimum_acceptable_rate", { precision: 10, scale: 2 }),
  isManaged: boolean("is_managed").default(false),
  managementTierId: integer("management_tier_id").references(() => managementTiers.id),
  bookingFormPictureUrl: text("booking_form_picture_url"),
  isRegisteredWithPro: boolean("is_registered_with_pro").default(false),
  performingRightsOrganization: text("performing_rights_organization"),
  ipiNumber: text("ipi_number"),
  primaryTalentId: integer("primary_talent_id").references(() => allInstruments.id).notNull(),
  isDemo: boolean("is_demo").default(false),
  isComplete: boolean("is_complete").default(false),
});

// Musicians table - exact specification
export const musicians = pgTable("musicians", {
  userId: integer("user_id").references(() => users.id).primaryKey(),
  stageName: text("stage_name"), // Stage name for musicians - fallback to fullName if not provided
  bio: text("bio"),
  primaryGenre: text("primary_genre"),
  basePrice: decimal("base_price", { precision: 10, scale: 2 }),
  idealPerformanceRate: decimal("ideal_performance_rate", { precision: 10, scale: 2 }),
  minimumAcceptableRate: decimal("minimum_acceptable_rate", { precision: 10, scale: 2 }),
  isManaged: boolean("is_managed").default(false),
  managementTierId: integer("management_tier_id").references(() => managementTiers.id),
  bookingFormPictureUrl: text("booking_form_picture_url"),
  isRegisteredWithPro: boolean("is_registered_with_pro").default(false),
  performingRightsOrganization: text("performing_rights_organization"),
  ipiNumber: text("ipi_number"),
  primaryTalentId: integer("primary_talent_id").references(() => allInstruments.id).notNull(),
  isDemo: boolean("is_demo").default(false),
  isComplete: boolean("is_complete").default(false),
});

// Professionals table - exact specification
export const professionals = pgTable("professionals", {
  userId: integer("user_id").references(() => users.id).primaryKey(),
  basePrice: decimal("base_price", { precision: 10, scale: 2 }),
  idealServiceRate: decimal("ideal_service_rate", { precision: 10, scale: 2 }),
  minimumAcceptableRate: decimal("minimum_acceptable_rate", { precision: 10, scale: 2 }),
  isManaged: boolean("is_managed").default(false),
  managementTierId: integer("management_tier_id").references(() => managementTiers.id),
  bookingFormPictureUrl: text("booking_form_picture_url"),
  primaryTalentId: integer("primary_talent_id").references(() => userProfessionalPrimaryTalents.id),
  isDemo: boolean("is_demo").default(false),
  isComplete: boolean("is_complete").default(false),
});

// Music catalog tables
export const songs = pgTable("songs", {
  id: serial("id").primaryKey(),
  artistUserId: integer("artist_user_id").references(() => users.id).notNull(),
  albumId: integer("album_id").references(() => albums.id), // Optional: song can belong to an album
  title: text("title").notNull(),
  genre: text("genre"), // Primary genre
  secondaryGenres: jsonb("secondary_genres").default([]), // Array of additional genres
  mp3Url: text("mp3_url"),
  mp4Url: text("mp4_url"), // Video file URL
  wavUrl: text("wav_url"), // High-quality audio URL
  flacUrl: text("flac_url"), // Lossless audio URL
  documentUrl: text("document_url"), // Document/PDF URL
  coverArtUrl: text("cover_art_url"),
  isrcCode: text("isrc_code").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }),
  customPrice: decimal("custom_price", { precision: 10, scale: 2 }), // Override album price distribution
  isFree: boolean("is_free").default(false),
  durationSeconds: integer("duration_seconds"),
  previewStartSeconds: integer("preview_start_seconds").default(0), // Preview start time in seconds
  previewDuration: integer("preview_duration").default(30), // Preview duration (30s for non-managed, 15s-full for managed)
  trackNumber: integer("track_number"), // Track position in album
  fileType: text("file_type").default("audio"), // 'audio', 'video', 'document'
  merchandiseIds: jsonb("merchandise_ids").default([]), // Associated merchandise for upselling
  createdAt: timestamp("created_at").defaultNow(),
});

export const albums = pgTable("albums", {
  id: serial("id").primaryKey(),
  artistUserId: integer("artist_user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  genre: text("genre"),
  coverArtUrl: text("cover_art_url"), // Must be at least 3000x3000px
  price: decimal("price", { precision: 10, scale: 2 }),
  totalTracks: integer("total_tracks"),
  useCustomPricing: boolean("use_custom_pricing").default(false), // If true, use individual song prices
  releaseDate: timestamp("release_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const albumSongs = pgTable("album_songs", {
  albumId: integer("album_id").references(() => albums.id),
  songId: integer("song_id").references(() => songs.id),
  trackNumber: integer("track_number"),
});

// Merchandise categories
export const merchandiseCategories = pgTable("merchandise_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Merchandise tables
export const merchandise = pgTable("merchandise", {
  id: serial("id").primaryKey(),
  artistUserId: integer("artist_user_id").references(() => users.id).notNull(),
  categoryId: integer("category_id").references(() => merchandiseCategories.id),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  inventory: integer("inventory"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const songMerchandise = pgTable("song_merchandise", {
  songId: integer("song_id").references(() => songs.id),
  merchandiseId: integer("merchandise_id").references(() => merchandise.id),
});

// Bundle system for songs and merchandise
export const bundles = pgTable("bundles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  artistUserId: integer("artist_user_id").references(() => users.id).notNull(),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").default(true),
  createdById: integer("created_by_id").references(() => users.id).notNull(), // admin/superadmin who created it
  createdAt: timestamp("created_at").defaultNow(),
});

export const bundleItems = pgTable("bundle_items", {
  id: serial("id").primaryKey(),
  bundleId: integer("bundle_id").references(() => bundles.id).notNull(),
  itemType: text("item_type").notNull(), // 'song', 'merchandise', 'album'
  itemId: integer("item_id").notNull(), // references songs.id, merchandise.id, or albums.id
  quantity: integer("quantity").default(1),
});

// Advanced discount system
export const discountConditions = pgTable("discount_conditions", {
  id: serial("id").primaryKey(),
  bundleId: integer("bundle_id").references(() => bundles.id).notNull(),
  discountType: text("discount_type").notNull(), // 'fixed', 'percentage', 'both', 'conditional'
  fixedAmount: decimal("fixed_amount", { precision: 10, scale: 2 }),
  percentageAmount: decimal("percentage_amount", { precision: 5, scale: 2 }),
  conditionType: text("condition_type"), // 'ticket_id', 'ppv_code', 'fan_tier', 'purchase_history', 'social_follow'
  conditionValue: text("condition_value"), // the specific condition value to match
  description: text("description"), // human-readable description of the discount
  isActive: boolean("is_active").default(true),
  validFrom: timestamp("valid_from"),
  validUntil: timestamp("valid_until"),
  usageLimit: integer("usage_limit"), // max times this discount can be used
  currentUsage: integer("current_usage").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Store currency preferences
export const storeCurrencies = pgTable("store_currencies", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(), // USD, EUR, GBP, XCD, etc.
  name: text("name").notNull(),
  symbol: text("symbol").notNull(),
  exchangeRate: decimal("exchange_rate", { precision: 10, scale: 6 }).notNull(),
  isActive: boolean("is_active").default(true),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// Fan engagement tracking for discounts
export const fanEngagement = pgTable("fan_engagement", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  artistUserId: integer("artist_user_id").references(() => users.id).notNull(),
  engagementType: text("engagement_type").notNull(), // 'purchase', 'social_follow', 'show_attendance', 'ppv_view'
  engagementValue: text("engagement_value"), // ticket_id, social_handle, ppv_code, etc.
  engagementDate: timestamp("engagement_date").defaultNow(),
  metadata: jsonb("metadata"), // additional engagement details
});

// Instrument registry for talent assignments
export const allInstruments = pgTable("all_instruments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // "Lead Vocals", "Bass Guitar", "Drum Kit - Kick", etc.
  playerName: text("player_name").notNull(), // "Lead Vocalist", "Bass Player", "Drummer", etc.
  type: text("type").notNull(), // "Stringed", "Brass", "Percussion", "Vocal", "Woodwind"
  mixerGroup: text("mixer_group").notNull(), // "VOCALS", "BASS", "DRUMS", "STRINGS", "BRASS", "WOODWIND", "KEYS"
  displayPriority: integer("display_priority").notNull().default(100), // For sorting - lower numbers appear first
  createdAt: timestamp("created_at").defaultNow(),
});

// Enhanced booking assignments with instrument-based talent selection
export const bookingAssignmentsMembers = pgTable("booking_assignments_members", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").references(() => bookings.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  roleInBooking: integer("role_in_booking").references(() => roles.id).notNull(), // Foreign key to roles table
  assignmentType: text("assignment_type").notNull().default("manual"), // 'auto', 'manual', 'requested'
  assignedAt: timestamp("assigned_at").defaultNow(),
  assignedBy: integer("assigned_by").references(() => users.id),
  status: text("status").notNull().default("active"), // 'active', 'pending', 'removed'
  selectedTalent: integer("selected_talent").references(() => allInstruments.id), // Foreign key to all_instruments
  isMainBookedTalent: boolean("is_main_booked_talent").default(false),
  assignedGroup: text("assigned_group"), // Auto-populated from instrument's mixer_group
  assignedChannelPair: integer("assigned_channel_pair"), // For stereo pairs
  assignedChannel: integer("assigned_channel"), // Specific mixer channel number
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Booking and contract tables
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  bookerUserId: integer("booker_user_id").references(() => users.id), // Nullable for guest bookings
  primaryArtistUserId: integer("primary_artist_user_id").references(() => users.id).notNull(),
  eventName: text("event_name").notNull(),
  eventType: text("event_type").notNull(),
  eventDate: timestamp("event_date"),
  venueName: text("venue_name"),
  venueAddress: text("venue_address"),
  requirements: text("requirements"),
  status: text("status").default("pending"), // pending, approved, contract_generated, signed, paid, completed, cancelled
  totalBudget: decimal("total_budget", { precision: 10, scale: 2 }),
  finalPrice: decimal("final_price", { precision: 10, scale: 2 }),
  
  // Guest booking fields
  guestName: text("guest_name"), // For non-registered users
  guestEmail: text("guest_email"), // For non-registered users  
  guestPhone: text("guest_phone"), // For non-registered users
  isGuestBooking: boolean("is_guest_booking").default(false),
  
  // Admin assignment to managed users
  assignedAdminId: integer("assigned_admin_id").references(() => users.id),
  adminApprovedAt: timestamp("admin_approved_at"),
  
  // Internal booking objectives (not visible to booker)
  internalObjectives: jsonb("internal_objectives"), // Admin/managed talent internal goals and notes
  internalNotes: text("internal_notes"), // Private notes for managed talent and admin team
  
  // Contract and payment tracking
  contractsGenerated: boolean("contracts_generated").default(false),
  allSignaturesCompleted: boolean("all_signatures_completed").default(false),
  paymentCompleted: boolean("payment_completed").default(false),
  receiptGenerated: boolean("receipt_generated").default(false),
  
  // Comprehensive Booking Workflow fields
  workflowData: jsonb("workflow_data"), // Stores technical rider, stage plot, setlist, etc.
  currentWorkflowStep: integer("current_workflow_step").default(1), // Current step in workflow
  lastModified: timestamp("last_modified").defaultNow(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const bookingDates = pgTable("booking_dates", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").references(() => bookings.id),
  eventDate: timestamp("event_date").notNull(),
  startTime: text("start_time"),
  endTime: text("end_time"),
});

export const bookingMusicians = pgTable("booking_musicians", {
  bookingId: integer("booking_id").references(() => bookings.id),
  musicianUserId: integer("musician_user_id").references(() => users.id),
  idealRate: decimal("ideal_rate", { precision: 10, scale: 2 }), // Musician's preferred rate
  adminSetRate: decimal("admin_set_rate", { precision: 10, scale: 2 }), // Admin-determined actual rate (always in USD)
  originalCurrency: text("original_currency").default("USD"), // Original currency used when setting rate
  originalAmount: decimal("original_amount", { precision: 10, scale: 2 }), // Original amount in selected currency
  confirmedFee: decimal("confirmed_fee", { precision: 10, scale: 2 }), // Final confirmed amount
  rateStatus: text("rate_status").default("pending"), // pending, admin_set, accepted, declined
  rateSetByAdminId: integer("rate_set_by_admin_id").references(() => users.id), // Admin or Superadmin who set the rate
  musicianResponse: text("musician_response"), // accept, decline, counter_offer
  musicianResponseMessage: text("musician_response_message"),
  rateNotes: text("rate_notes"), // Admin notes about rate determination
  
  // Counter offer fields
  counterOfferAmount: decimal("counter_offer_amount", { precision: 10, scale: 2 }),
  counterOfferCurrency: text("counter_offer_currency"),
  counterOfferUsdEquivalent: decimal("counter_offer_usd_equivalent", { precision: 10, scale: 2 }),
  counterOfferMessage: text("counter_offer_message"),
  counterOfferAt: timestamp("counter_offer_at"),
  
  // Admin response to counter offer
  adminCounterResponse: text("admin_counter_response"), // accepted, declined, counter_counter
  adminCounterResponseMessage: text("admin_counter_response_message"),
  adminCounterResponseAt: timestamp("admin_counter_response_at"),
  
  assignedAt: timestamp("assigned_at").defaultNow(),
  rateSetAt: timestamp("rate_set_at"),
  musicianResponseAt: timestamp("musician_response_at"),
});

export const technicalRiders = pgTable("technical_riders", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").references(() => bookings.id),
  // Auto-populated from user profiles
  artistTechnicalSpecs: jsonb("artist_technical_specs"), // From artist's private profile
  musicianTechnicalSpecs: jsonb("musician_technical_specs"), // From musicians' private profiles
  // Additional requirements specific to this booking
  equipmentRequirements: jsonb("equipment_requirements"),
  stageRequirements: jsonb("stage_requirements"),
  lightingRequirements: jsonb("lighting_requirements"),
  soundRequirements: jsonb("sound_requirements"),
  additionalNotes: text("additional_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  documentType: text("document_type").notNull(), // booking_agreement, performance_agreement, technical_rider, receipt
  uploadedBy: integer("uploaded_by").references(() => users.id),
  bookingId: integer("booking_id").references(() => bookings.id),
  status: text("status").default("draft"), // draft, pending_signature, signed, finalized
  generatedAt: timestamp("generated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bookingDocuments = pgTable("booking_documents", {
  bookingId: integer("booking_id").references(() => bookings.id),
  documentId: integer("document_id").references(() => documents.id),
});

// Contract signatures tracking
export const contractSignatures = pgTable("contract_signatures", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").references(() => documents.id).notNull(),
  signerUserId: integer("signer_user_id").references(() => users.id),
  signerType: text("signer_type").notNull(), // artist, musician, booker, admin
  signerName: text("signer_name").notNull(), // For guest bookings
  signerEmail: text("signer_email"),
  signatureData: text("signature_data"), // Base64 signature image or electronic signature
  signedAt: timestamp("signed_at").defaultNow(),
  ipAddress: text("ip_address"),
  status: text("status").default("pending"), // pending, signed, rejected
});

// Contracts management
export const contracts = pgTable("contracts", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").references(() => bookings.id).notNull(),
  contractType: text("contract_type").notNull(), // booking_agreement, performance_contract
  status: text("status").default("draft"), // draft, sent, signed, countered, completed
  createdByUserId: integer("created_by_user_id").references(() => users.id),
  assignedToUserId: integer("assigned_to_user_id").references(() => users.id),
  title: text("title").notNull(),
  content: jsonb("content").notNull(), // Contract terms and details
  metadata: jsonb("metadata"), // Additional data like auto-generation info
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Artist Band Members configuration
export const artistBandMembers = pgTable("artist_band_members", {
  id: serial("id").primaryKey(),
  artistUserId: integer("artist_user_id").references(() => users.id).notNull(),
  musicianUserId: integer("musician_user_id").references(() => users.id).notNull(),
  defaultRole: integer("default_role").default(6), // Default role when auto-assigned
  primaryInstrumentId: integer("primary_instrument_id").references(() => allInstruments.id),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Hospitality requirements for talent
export const hospitalityRequirements = pgTable("hospitality_requirements", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").references(() => bookings.id),
  userId: integer("user_id").references(() => users.id),
  dressingRoomType: text("dressing_room_type"), // individual, shared, none
  refreshments: jsonb("refreshments"), // Array of requested items
  dietaryRestrictions: text("dietary_restrictions"),
  additionalRequests: text("additional_requests"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Payment tracking
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").references(() => bookings.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default("USD"),
  paymentMethod: text("payment_method"), // card, bank_transfer, cash, etc.
  paymentStatus: text("payment_status").default("pending"), // pending, completed, failed, refunded
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  paidAt: timestamp("paid_at"),
  refundedAt: timestamp("refunded_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Receipt generation
export const receipts = pgTable("receipts", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").references(() => bookings.id).notNull(),
  paymentId: integer("payment_id").references(() => payments.id).notNull(),
  receiptNumber: text("receipt_number").notNull().unique(),
  receiptUrl: text("receipt_url"), // PDF file URL
  issuerName: text("issuer_name").notNull(),
  issuerAddress: text("issuer_address"),
  recipientName: text("recipient_name").notNull(),
  recipientAddress: text("recipient_address"),
  itemsBreakdown: jsonb("items_breakdown"), // Itemized charges
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  generatedAt: timestamp("generated_at").defaultNow(),
});

// Invoice generation for automatic client billing
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").references(() => bookings.id).notNull(),
  invoiceNumber: text("invoice_number").notNull().unique(),
  invoiceType: text("invoice_type").notNull(), // 'proforma', 'final', 'booking_deposit', 'booking_balance', 'service_fee', 'additional_charges'
  invoiceUrl: text("invoice_url"), // PDF file URL
  issuerName: text("issuer_name").notNull(),
  issuerAddress: text("issuer_address"),
  issuerTaxId: text("issuer_tax_id"),
  recipientName: text("recipient_name").notNull(),
  recipientAddress: text("recipient_address"),
  recipientTaxId: text("recipient_tax_id"),
  lineItems: jsonb("line_items").notNull(), // Detailed billing breakdown
  subtotalAmount: decimal("subtotal_amount", { precision: 10, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  dueDate: timestamp("due_date").notNull(),
  paymentTerms: text("payment_terms").default("Net 30"), // 'Net 30', 'Due on Receipt', etc.
  status: text("status").default("pending"), // 'draft', 'pending', 'sent', 'viewed', 'accepted', 'paid', 'overdue', 'cancelled', 'converted'
  triggeredBy: text("triggered_by").notNull(), // 'booking_acceptance', 'status_change', 'manual', 'milestone'
  triggeredByUserId: integer("triggered_by_user_id").references(() => users.id),
  sentAt: timestamp("sent_at"),
  paidAt: timestamp("paid_at"),
  generatedAt: timestamp("generated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  proformaInvoiceId: integer("proforma_invoice_id"), // Reference to original proforma when converted
  convertedAt: timestamp("converted_at"), // When proforma was converted to final invoice
});

// Payout requests for performer compensation
export const payoutRequests = pgTable("payout_requests", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").references(() => bookings.id).notNull(),
  performerUserId: integer("performer_user_id").references(() => users.id).notNull(),
  requestNumber: text("request_number").notNull().unique(),
  requestType: text("request_type").notNull(), // 'performance_fee', 'milestone_payment', 'bonus', 'expense_reimbursement'
  baseAmount: decimal("base_amount", { precision: 10, scale: 2 }).notNull(),
  commissionPercentage: decimal("commission_percentage", { precision: 5, scale: 2 }).default("15.00"),
  commissionAmount: decimal("commission_amount", { precision: 10, scale: 2 }),
  netPayoutAmount: decimal("net_payout_amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default("USD"),
  paymentMethod: text("payment_method"), // 'bank_transfer', 'paypal', 'check', 'cash'
  bankDetails: jsonb("bank_details"), // Account info for transfers
  status: text("status").default("pending"), // 'pending', 'approved', 'processing', 'paid', 'declined', 'cancelled'
  triggeredBy: text("triggered_by").notNull(), // 'booking_completion', 'milestone_reached', 'manual_request', 'contract_fulfillment'
  triggeredByUserId: integer("triggered_by_user_id").references(() => users.id),
  approvedByUserId: integer("approved_by_user_id").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  processedAt: timestamp("processed_at"),
  paidAt: timestamp("paid_at"),
  declineReason: text("decline_reason"),
  notes: text("notes"),
  contractReferenceId: integer("contract_reference_id"), // Link to contract ID if applicable
  generatedAt: timestamp("generated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Document linkage system for audit trails
export const documentLinkages = pgTable("document_linkages", {
  id: serial("id").primaryKey(),
  sourceDocumentType: text("source_document_type").notNull(), // 'booking', 'contract', 'invoice', 'receipt', 'payout_request'
  sourceDocumentId: integer("source_document_id").notNull(),
  linkedDocumentType: text("linked_document_type").notNull(), // 'booking', 'contract', 'invoice', 'receipt', 'payout_request'
  linkedDocumentId: integer("linked_document_id").notNull(),
  linkageType: text("linkage_type").notNull(), // 'generates', 'fulfills', 'references', 'supersedes', 'cancels'
  linkDescription: text("link_description"),
  createdByUserId: integer("created_by_user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Enhanced payment tracking
export const paymentTransactions = pgTable("payment_transactions", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").references(() => bookings.id).notNull(),
  invoiceId: integer("invoice_id").references(() => invoices.id),
  payoutRequestId: integer("payout_request_id").references(() => payoutRequests.id),
  transactionType: text("transaction_type").notNull(), // 'payment_received', 'payout_sent', 'refund_issued', 'fee_charged'
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default("USD"),
  exchangeRate: decimal("exchange_rate", { precision: 10, scale: 6 }),
  usdEquivalent: decimal("usd_equivalent", { precision: 10, scale: 2 }),
  paymentMethod: text("payment_method").notNull(), // 'stripe', 'paypal', 'bank_transfer', 'cash', 'check'
  gatewayTransactionId: text("gateway_transaction_id"), // Stripe, PayPal, etc. transaction ID
  gatewayReference: text("gateway_reference"),
  gatewayFee: decimal("gateway_fee", { precision: 10, scale: 2 }),
  platformFee: decimal("platform_fee", { precision: 10, scale: 2 }),
  netAmount: decimal("net_amount", { precision: 10, scale: 2 }),
  status: text("status").default("pending"), // 'pending', 'completed', 'failed', 'refunded', 'disputed'
  processedAt: timestamp("processed_at"),
  settledAt: timestamp("settled_at"),
  refundedAt: timestamp("refunded_at"),
  disputedAt: timestamp("disputed_at"),
  notes: text("notes"),
  metadata: jsonb("metadata"), // Additional transaction data
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Financial audit trail
export const financialAuditLog = pgTable("financial_audit_log", {
  id: serial("id").primaryKey(),
  entityType: text("entity_type").notNull(), // 'booking', 'invoice', 'receipt', 'payout_request', 'payment_transaction'
  entityId: integer("entity_id").notNull(),
  actionType: text("action_type").notNull(), // 'created', 'updated', 'status_changed', 'payment_processed', 'document_generated'
  actionDescription: text("action_description").notNull(),
  previousValues: jsonb("previous_values"),
  newValues: jsonb("new_values"),
  performedByUserId: integer("performed_by_user_id").references(() => users.id),
  performedBySystem: boolean("performed_by_system").default(false),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const systemSettings = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  settingKey: text("setting_key").notNull().unique(),
  settingValue: text("setting_value").notNull(),
  description: text("description"),
  lastModified: timestamp("last_modified").defaultNow(),
});

// Managed Artist Release Contract System
export const releaseContracts = pgTable("release_contracts", {
  id: serial("id").primaryKey(),
  managedArtistUserId: integer("managed_artist_user_id").references(() => users.id).notNull(),
  approvedByUserId: integer("approved_by_user_id").references(() => users.id).notNull(), // Superadmin who approved
  releaseRequestReason: text("release_request_reason").notNull(),
  contractTerms: jsonb("contract_terms").notNull(), // Release terms, conditions, obligations
  managementTierAtRelease: integer("management_tier_at_release").references(() => managementTiers.id),
  
  // Contract status workflow
  status: text("status").default("pending"), // pending, approved, signed, completed, cancelled
  requestedAt: timestamp("requested_at").defaultNow(),
  approvedAt: timestamp("approved_at"),
  signedAt: timestamp("signed_at"),
  completedAt: timestamp("completed_at"),
  
  // Financial terms
  releaseCompensation: decimal("release_compensation", { precision: 10, scale: 2 }),
  retainedRoyaltyPercentage: decimal("retained_royalty_percentage", { precision: 5, scale: 2 }),
  releaseEffectiveDate: timestamp("release_effective_date"),
  
  // Document management
  contractDocumentUrl: text("contract_document_url"),
  signedContractUrl: text("signed_contract_url"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Release contract signatures
export const releaseContractSignatures = pgTable("release_contract_signatures", {
  id: serial("id").primaryKey(),
  releaseContractId: integer("release_contract_id").references(() => releaseContracts.id).notNull(),
  signerUserId: integer("signer_user_id").references(() => users.id).notNull(),
  signerRole: text("signer_role").notNull(), // 'managed_artist', 'superadmin', 'legal_counsel'
  signatureData: text("signature_data"), // Base64 signature image
  signedAt: timestamp("signed_at").defaultNow(),
  ipAddress: text("ip_address"),
  witnessName: text("witness_name"),
  witnessSignature: text("witness_signature"),
});

// Management transition history
export const managementTransitions = pgTable("management_transitions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  fromRoleId: integer("from_role_id").references(() => roles.id).notNull(),
  toRoleId: integer("to_role_id").references(() => roles.id).notNull(),
  fromManagementTierId: integer("from_management_tier_id").references(() => managementTiers.id),
  toManagementTierId: integer("to_management_tier_id").references(() => managementTiers.id),
  
  transitionType: text("transition_type").notNull(), // 'promotion', 'demotion', 'release_contract', 'termination'
  releaseContractId: integer("release_contract_id").references(() => releaseContracts.id),
  processedByUserId: integer("processed_by_user_id").references(() => users.id).notNull(),
  
  reason: text("reason").notNull(),
  notes: text("notes"),
  effectiveDate: timestamp("effective_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Management contract applications for users wanting to become Managed Artists
export const managementApplications = pgTable("management_applications", {
  id: serial("id").primaryKey(),
  applicantUserId: integer("applicant_user_id").references(() => users.id).notNull(),
  requestedRoleId: integer("requested_role_id").references(() => roles.id).notNull(), // NEW
  requestedManagementTierId: integer("requested_management_tier_id").references(() => managementTiers.id).notNull(),
  applicationReason: text("application_reason").notNull(),
  businessPlan: text("business_plan"),
  expectedRevenue: decimal("expected_revenue", { precision: 10, scale: 2 }),
  portfolioLinks: jsonb("portfolio_links"),
  socialMediaMetrics: jsonb("social_media_metrics"),
  contractTerms: jsonb("contract_terms").notNull(),
  status: text("status").notNull().default('pending'), // 'pending', 'under_review', 'approved', 'contract_generated', 'awaiting_signatures', 'signed', 'completed', 'rejected'
  termInMonths: integer("term_in_months"), // NEW optional
  endDate: timestamp("end_date"), // NEW optional
  notes: text("notes"), // NEW optional
  submittedAt: timestamp("submitted_at").defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
  reviewedByUserId: integer("reviewed_by_user_id").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  approvedByUserId: integer("approved_by_user_id").references(() => users.id),
  signedAt: timestamp("signed_at"),
  completedAt: timestamp("completed_at"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});


// Management contract signatures for application contracts
export const managementApplicationSignatures = pgTable("management_application_signatures", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").references(() => managementApplications.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  signerRole: text("signer_role").notNull(), // 'applicant', 'assigned_admin', 'lawyer', 'superadmin', 'witness'
  signatureType: text("signature_type").notNull(), // 'digital', 'electronic', 'physical'
  signatureData: text("signature_data"), // base64 signature or reference
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  signedAt: timestamp("signed_at").defaultNow(),
});

// Service discount overrides for managed users
export const serviceDiscountOverrides = pgTable("service_discount_overrides", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  serviceId: integer("service_id").references(() => services.id),
  userServiceId: integer("user_service_id").references(() => userServices.id),
  originalDiscountPercentage: decimal("original_discount_percentage", { precision: 5, scale: 2 }), // Based on management tier
  overrideDiscountPercentage: decimal("override_discount_percentage", { precision: 5, scale: 2 }).notNull(),
  overrideReason: text("override_reason").notNull(),
  authorizedByUserId: integer("authorized_by_user_id").references(() => users.id).notNull(),
  isActive: boolean("is_active").default(true),
  effectiveFrom: timestamp("effective_from").defaultNow(),
  effectiveUntil: timestamp("effective_until"),
  createdAt: timestamp("created_at").defaultNow(),
});

// WaituMusic service default discount limits (superadmin configurable per service)
export const waituServiceDiscountLimits = pgTable("waitu_service_discount_limits", {
  id: serial("id").primaryKey(),
  serviceId: integer("service_id").references(() => services.id).notNull(),
  defaultMaxDiscountPercentage: integer("default_max_discount_percentage").notNull().default(0),
  description: text("description"),
  lastUpdatedBy: integer("last_updated_by").references(() => users.id).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Individual discount permissions (case-by-case superadmin decisions that override system defaults)
export const individualDiscountPermissions = pgTable("individual_discount_permissions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  serviceId: integer("service_id").references(() => services.id).notNull(),
  customMaxDiscountPercentage: integer("custom_max_discount_percentage").notNull(),
  reason: text("reason").notNull(),
  grantedBy: integer("granted_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true).notNull(),
});

// Global genres catalog for categorized genre selection
export const globalGenres = pgTable("global_genres", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(), // 'Pop', 'Rock', 'Electronic', 'Hip-Hop', 'Jazz', 'Classical', 'World', 'Folk', 'Country', 'R&B/Soul', 'Reggae', 'Latin', 'Alternative', 'Experimental'
  name: text("name").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Cross-upselling relationships between songs, albums, and merchandise
export const crossUpsellRelationships = pgTable("cross_upsell_relationships", {
  id: serial("id").primaryKey(),
  sourceType: text("source_type").notNull(), // 'song', 'album', 'merchandise'
  sourceId: integer("source_id").notNull(),
  targetType: text("target_type").notNull(), // 'song', 'album', 'merchandise'
  targetId: integer("target_id").notNull(),
  relationshipType: text("relationship_type").notNull(), // 'complement', 'bundle', 'similar', 'featured'
  priority: integer("priority").default(1), // Higher numbers = higher priority
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Management application reviews by assigned admins
export const managementApplicationReviews = pgTable("management_application_reviews", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").references(() => managementApplications.id).notNull(),
  reviewerUserId: integer("reviewer_user_id").references(() => users.id).notNull(),
  reviewerRole: text("reviewer_role").notNull(), // 'assigned_admin', 'superadmin'
  reviewStatus: text("review_status").notNull(), // 'pending', 'approved', 'rejected', 'needs_changes'
  reviewComments: text("review_comments"),
  reviewedAt: timestamp("reviewed_at").defaultNow(),
});

// Professional assignments to bookings (photographers, videographers, DJs, marketing, etc.)
export const bookingProfessionalAssignments = pgTable("booking_professional_assignments", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").references(() => bookings.id).notNull(),
  professionalUserId: integer("professional_user_id").references(() => users.id).notNull(),
  professionalType: text("professional_type").notNull(), // 'photographer', 'videographer', 'dj', 'social_media_marketer', 'marketing_specialist', 'background_vocalist'
  assignedRate: decimal("assigned_rate", { precision: 10, scale: 2 }).notNull(),
  isIncludedInTotal: boolean("is_included_in_total").default(true),
  assignmentStatus: text("assignment_status").default("assigned"), // 'assigned', 'accepted', 'declined', 'completed'
  equipmentSpecs: jsonb("equipment_specs"), // Equipment details provided by professional
  proposalDocument: text("proposal_document"), // Document URL or base64 content
  professionalRequirements: jsonb("professional_requirements"), // OppHub generated requirements
  checklistItems: jsonb("checklist_items"), // Detailed checklist for non-managed talent
  technicalGuidance: jsonb("technical_guidance"), // Aperture, camera settings, etc.
  assignedByUserId: integer("assigned_by_user_id").references(() => users.id).notNull(),
  assignedAt: timestamp("assigned_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  internalObjectives: jsonb("internal_objectives"), // Internal goals not visible to booker
});

// OppHub Professional Requirements and Guidance System
export const oppHubProfessionalGuidance = pgTable("opphub_professional_guidance", {
  id: serial("id").primaryKey(),
  assignmentId: integer("assignment_id").references(() => bookingProfessionalAssignments.id).notNull(),
  managedArtistUserId: integer("managed_artist_user_id").references(() => users.id).notNull(),
  professionalType: text("professional_type").notNull(),
  equipmentSpecs: jsonb("equipment_specs"), // Camera model, lens specs, etc.
  technicalRequirements: jsonb("technical_requirements"), // Aperture settings, ISO, shutter speed
  creativeGuidance: jsonb("creative_guidance"), // Shot composition, lighting requirements
  industryStandards: jsonb("industry_standards"), // Music industry best practices
  opportunityProjections: jsonb("opportunity_projections"), // Future opportunities requiring this content
  qualityBenchmarks: jsonb("quality_benchmarks"), // Success metrics and standards
  deliverableSpecs: jsonb("deliverable_specs"), // File formats, resolution, delivery requirements
  generatedByOppHub: boolean("generated_by_opphub").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Professional legal assignments for contract review
export const legalAssignments = pgTable("legal_assignments", {
  id: serial("id").primaryKey(),
  clientUserId: integer("client_user_id").references(() => users.id).notNull(),
  lawyerUserId: integer("lawyer_user_id").references(() => users.id).notNull(),
  assignmentType: text("assignment_type").notNull(), // 'management_contract', 'release_contract', 'general_legal'
  isActive: boolean("is_active").default(true),
  assignedAt: timestamp("assigned_at").defaultNow(),
  assignedByUserId: integer("assigned_by_user_id").references(() => users.id).notNull(),
});

// Professional assignments to management applications (lawyers representing Wai'tuMusic)
export const applicationLegalAssignments = pgTable("application_legal_assignments", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").references(() => managementApplications.id).notNull(),
  lawyerUserId: integer("lawyer_user_id").references(() => users.id).notNull(),
  assignmentRole: text("assignment_role").notNull(), // 'waitumusic_representative', 'applicant_counsel', 'neutral_advisor'
  authorityLevel: text("authority_level").notNull(), // 'full_authority', 'review_only', 'advisory_only'
  canSignContracts: boolean("can_sign_contracts").default(false),
  canModifyTerms: boolean("can_modify_terms").default(false),
  canFinalizeAgreements: boolean("can_finalize_agreements").default(false),
  assignedAt: timestamp("assigned_at").defaultNow(),
  assignedByUserId: integer("assigned_by_user_id").references(() => users.id).notNull(),
  isActive: boolean("is_active").default(true),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  artistUserId: integer("artist_user_id").references(() => users.id),
  eventType: text("event_type").notNull(),
  eventDatetime: timestamp("event_datetime").notNull(),
  ticketUrl: text("ticket_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Service management tables
export const serviceCategories = pgTable("service_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  categoryId: integer("category_id").references(() => serviceCategories.id),
  basePrice: decimal("base_price", { precision: 10, scale: 2 }),
  duration: integer("duration"), // in minutes
  unit: text("unit").default("session"), // session, hour, day, etc
  isActive: boolean("is_active").default(true),
  createdByUserId: integer("created_by_user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const serviceAssignments = pgTable("service_assignments", {
  id: serial("id").primaryKey(),
  serviceId: integer("service_id").references(() => services.id).notNull(),
  assignedUserId: integer("assigned_user_id").references(() => users.id).notNull(),
  assignedPrice: decimal("assigned_price", { precision: 10, scale: 2 }).notNull(),
  userCommission: decimal("user_commission", { precision: 10, scale: 2 }).notNull(),
  isActive: boolean("is_active").default(true),
  assignedByUserId: integer("assigned_by_user_id").references(() => users.id).notNull(),
  assignedAt: timestamp("assigned_at").defaultNow(),
});

export const userServices = pgTable("user_services", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  duration: integer("duration"), // in minutes
  unit: text("unit").default("session"), // session, hour, day, etc
  features: jsonb("features"), // array of included features
  enableRating: boolean("enable_rating").default(true),
  categoryId: integer("category_id").references(() => serviceCategories.id),
  isActive: boolean("is_active").default(true),
  isDemo: boolean("is_demo").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Service Reviews
export const serviceReviews = pgTable("service_reviews", {
  id: serial("id").primaryKey(),
  serviceId: integer("service_id").references(() => services.id),
  userServiceId: integer("user_service_id").references(() => userServices.id),
  reviewerUserId: integer("reviewer_user_id").references(() => users.id).notNull(),
  rating: integer("rating").notNull(), // 1-5 stars
  review: text("review"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Real-time collaboration tables
export const collaborationRooms = pgTable("collaboration_rooms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  roomType: text("room_type").notNull(), // 'project', 'session', 'song'
  createdBy: integer("created_by").references(() => users.id).notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const collaborationParticipants = pgTable("collaboration_participants", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").references(() => collaborationRooms.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  role: text("role").notNull(), // 'owner', 'collaborator', 'viewer'
  joinedAt: timestamp("joined_at").defaultNow(),
  lastActive: timestamp("last_active").defaultNow(),
});

// Direct Link Invitations for document sharing (technical riders, contracts, etc)
export const shareableLinks = pgTable("shareable_links", {
  id: serial("id").primaryKey(),
  linkToken: text("link_token").notNull().unique(), // UUID for secure access
  documentType: text("document_type").notNull(), // 'technical_rider', 'contract', 'booking_agreement'
  documentId: integer("document_id").notNull(), // ID of the document (booking ID, contract ID, etc)
  accessType: text("access_type").notNull(), // 'view', 'sign', 'download', 'full'
  roleRestriction: integer("role_restriction"), // Optional: restrict to specific role ID
  sectionRestrictions: jsonb("section_restrictions"), // Optional: restrict to specific sections
  createdByUserId: integer("created_by_user_id").references(() => users.id).notNull(),
  expiresAt: timestamp("expires_at"), // Optional expiration
  maxUses: integer("max_uses"), // Optional usage limit
  currentUses: integer("current_uses").default(0),
  metadata: jsonb("metadata"), // Additional context (recipient name, purpose, etc)
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  lastAccessedAt: timestamp("last_accessed_at"),
});

// Track who accessed shared links
export const linkAccessLogs = pgTable("link_access_logs", {
  id: serial("id").primaryKey(),
  linkId: integer("link_id").references(() => shareableLinks.id).notNull(),
  accessedByUserId: integer("accessed_by_user_id").references(() => users.id), // null for non-users
  accessedByEmail: text("accessed_by_email"), // For non-users
  accessedByName: text("accessed_by_name"), // For non-users
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  accessedAt: timestamp("accessed_at").defaultNow(),
  actionTaken: text("action_taken"), // 'viewed', 'downloaded', 'signed', etc
});

export const collaborationMessages = pgTable("collaboration_messages", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").references(() => collaborationRooms.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  message: text("message").notNull(),
  messageType: text("message_type").default("text"), // 'text', 'file', 'audio', 'system'
  metadata: jsonb("metadata"), // For file URLs, timestamps, etc.
  createdAt: timestamp("created_at").defaultNow(),
});

export const collaborationProjects = pgTable("collaboration_projects", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").references(() => collaborationRooms.id).notNull(),
  projectName: text("project_name").notNull(),
  description: text("description"),
  projectType: text("project_type").notNull(), // 'song', 'album', 'performance'
  status: text("status").default("draft"), // 'draft', 'in-progress', 'review', 'completed'
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const collaborationFiles = pgTable("collaboration_files", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").references(() => collaborationRooms.id).notNull(),
  projectId: integer("project_id").references(() => collaborationProjects.id),
  uploadedBy: integer("uploaded_by").references(() => users.id).notNull(),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileType: text("file_type").notNull(), // 'audio', 'video', 'image', 'document'
  fileSize: integer("file_size"),
  version: integer("version").default(1),
  description: text("description"),
  isCurrentVersion: boolean("is_current_version").default(true),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

export const collaborationTasks = pgTable("collaboration_tasks", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").references(() => collaborationRooms.id).notNull(),
  projectId: integer("project_id").references(() => collaborationProjects.id),
  assignedTo: integer("assigned_to").references(() => users.id),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  priority: text("priority").default("medium"), // 'low', 'medium', 'high', 'urgent'
  status: text("status").default("open"), // 'open', 'in-progress', 'review', 'completed'
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const collaborationComments = pgTable("collaboration_comments", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").references(() => collaborationRooms.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  entityType: text("entity_type").notNull(), // 'project', 'task', 'file'
  entityId: integer("entity_id").notNull(),
  comment: text("comment").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// AI Music Recommendation System Tables
export const userInteractions = pgTable("user_interactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  songId: integer("song_id").references(() => songs.id),
  artistId: integer("artist_id").references(() => users.id),
  albumId: integer("album_id").references(() => albums.id),
  interactionType: text("interaction_type").notNull(), // 'play', 'like', 'share', 'skip', 'download', 'add_to_cart'
  duration: integer("duration"), // seconds listened for 'play' interactions
  createdAt: timestamp("created_at").defaultNow(),
});

export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  preferredGenres: jsonb("preferred_genres"), // Array of genres
  favoriteArtists: jsonb("favorite_artists"), // Array of artist IDs
  listeningHabits: jsonb("listening_habits"), // Time of day, frequency, etc.
  moodPreferences: jsonb("mood_preferences"), // Energetic, calm, etc.
  discoverySettings: jsonb("discovery_settings"), // How open to new music
  updatedAt: timestamp("updated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Playback Tracks & DJ Management System for Technical Rider Setlists
export const playbackTracks = pgTable("playback_tracks", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").references(() => bookings.id).notNull(),
  songId: integer("song_id").references(() => songs.id),
  customSongTitle: text("custom_song_title"), // For non-catalog songs
  customArtist: text("custom_artist"), // For non-catalog songs
  originalFileUrl: text("original_file_url"),
  originalFileName: text("original_file_name"),
  originalFileSize: integer("original_file_size"),
  
  // Vocal analysis results
  vocalAnalysis: jsonb("vocal_analysis").$type<{
    vocalConfidence: number;
    recommendation: string;
    message: string;
    duration: number;
    sampleRate: number;
    channels: number;
    analyzedAt: string;
  }>(),
  
  // Separated tracks (if vocal separation was performed)
  instrumentalTrackUrl: text("instrumental_track_url"), // DJ-ready track
  vocalsTrackUrl: text("vocals_track_url"), // Vocals only (reference)
  djReadyTrackUrl: text("dj_ready_track_url"), // Final DJ track (instrumental or original)
  separationPerformed: boolean("separation_performed").default(false),
  separationStatus: text("separation_status").default("pending"), // pending, processing, completed, failed, not_needed
  
  // Processing metadata
  processedAt: timestamp("processed_at"),
  processedByUserId: integer("processed_by_user_id").references(() => users.id),
  processingNotes: text("processing_notes"),
  
  // Setlist position and performance data
  setlistPosition: integer("setlist_position"),
  songKey: text("song_key"),
  tempo: integer("tempo"), // BPM
  duration: text("duration"), // Performance duration (may differ from track duration)
  transitionNotes: text("transition_notes"),
  performanceNotes: text("performance_notes"),
  
  // DJ access and management
  djAccessEnabled: boolean("dj_access_enabled").default(false),
  djAccessCode: text("dj_access_code"), // Unique code for DJ to access tracks
  djAccessExpiresAt: timestamp("dj_access_expires_at"),
  downloadCount: integer("download_count").default(0),
  lastDownloadedAt: timestamp("last_downloaded_at"),
  
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// DJ Access Management - Track who has access to setlist playback tracks
export const djAccess = pgTable("dj_access", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").references(() => bookings.id).notNull(),
  djUserId: integer("dj_user_id").references(() => users.id), // If DJ has platform account
  djName: text("dj_name").notNull(), // DJ name/company
  djEmail: text("dj_email").notNull(),
  djPhone: text("dj_phone"),
  
  // Access control
  accessCode: text("access_code").notNull().unique(),
  accessLevel: text("access_level").default("full"), // full, preview, restricted
  downloadLimit: integer("download_limit"), // Max downloads allowed
  downloadCount: integer("download_count").default(0),
  accessExpiresAt: timestamp("access_expires_at"),
  
  // Track access
  allowedTracks: jsonb("allowed_tracks"), // Array of playback track IDs DJ can access
  restrictedTracks: jsonb("restricted_tracks"), // Array of tracks DJ cannot access
  
  // Activity tracking
  lastAccessedAt: timestamp("last_accessed_at"),
  loginAttempts: integer("login_attempts").default(0),
  isActive: boolean("is_active").default(true),
  
  // Creator tracking
  grantedByUserId: integer("granted_by_user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Track individual downloads for audit trail and analytics
export const playbackTrackDownloads = pgTable("playback_track_downloads", {
  id: serial("id").primaryKey(),
  playbackTrackId: integer("playback_track_id").references(() => playbackTracks.id).notNull(),
  djAccessId: integer("dj_access_id").references(() => djAccess.id),
  downloadedByUserId: integer("downloaded_by_user_id").references(() => users.id),
  downloadedByDjCode: text("downloaded_by_dj_code"), // If downloaded via DJ access code
  
  trackType: text("track_type").notNull(), // instrumental, vocals, dj_ready, original
  fileUrl: text("file_url").notNull(),
  downloadedAt: timestamp("downloaded_at").defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
});

// Curator Distribution System for Post-Release Marketing
export const curators = pgTable("curators", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  organization: text("organization"),
  website: text("website"),
  socialMediaHandles: jsonb("social_media_handles"), // Array of {platform, handle}
  
  // Curator specialization and preferences
  genres: jsonb("genres"), // Array of genres they curate
  regions: jsonb("regions"), // Geographic regions they focus on
  platforms: jsonb("platforms"), // Streaming platforms, blogs, radio, etc.
  audienceSize: integer("audience_size"), // Estimated reach
  influenceScore: integer("influence_score").default(0), // Internal rating 1-100
  
  // Contact and submission preferences
  preferredContactMethod: text("preferred_contact_method").default("email"),
  submissionGuidelines: text("submission_guidelines"),
  responseRate: integer("response_rate"), // Percentage of submissions they respond to
  averageResponseTime: integer("average_response_time"), // Days
  
  // Relationship tracking
  relationshipStatus: text("relationship_status").default("new"), // new, contacted, responsive, partner, inactive
  lastContactedAt: timestamp("last_contacted_at"),
  totalSubmissions: integer("total_submissions").default(0),
  successfulPlacements: integer("successful_placements").default(0),
  
  // Account management
  isActive: boolean("is_active").default(true),
  addedByUserId: integer("added_by_user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Track curator submissions for each release
export const curatorSubmissions = pgTable("curator_submissions", {
  id: serial("id").primaryKey(),
  curatorId: integer("curator_id").references(() => curators.id).notNull(),
  songId: integer("song_id").references(() => songs.id),
  albumId: integer("album_id").references(() => albums.id),
  releaseType: text("release_type").notNull(), // single, album, ep
  
  // Submission timing and strategy
  submissionDate: timestamp("submission_date").notNull(),
  submissionStrategy: text("submission_strategy"), // post_fan_release, pre_release, exclusive
  daysSinceRelease: integer("days_since_release"), // Calculated field
  
  // Submission content and personalization
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  personalizedNote: text("personalized_note"), // Curator-specific personalization
  attachedFiles: jsonb("attached_files"), // Array of file URLs and descriptions
  
  // Response tracking
  status: text("status").default("sent"), // sent, opened, responded, declined, placed, no_response
  curatorResponse: text("curator_response"),
  responseDate: timestamp("response_date"),
  placementDetails: jsonb("placement_details"), // Where/when placed if successful
  placementUrl: text("placement_url"),
  
  // Follow-up management
  followUpScheduled: boolean("follow_up_scheduled").default(false),
  followUpDate: timestamp("follow_up_date"),
  followUpCount: integer("follow_up_count").default(0),
  
  // Metrics and analytics
  emailOpenTracking: jsonb("email_open_tracking"), // Open times, locations, devices
  linkClicks: integer("link_clicks").default(0),
  streamingIncrease: integer("streaming_increase"), // Post-placement streaming increase
  
  // Creator tracking
  submittedByUserId: integer("submitted_by_user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Email marketing system for curator outreach
export const curatorEmailCampaigns = pgTable("curator_email_campaigns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  releaseId: integer("release_id"), // Could be song_id or album_id depending on release_type
  releaseType: text("release_type").notNull(), // single, album, ep
  
  // Campaign configuration
  emailTemplate: text("email_template").notNull(),
  subject: text("subject").notNull(),
  fromName: text("from_name").notNull(),
  fromEmail: text("from_email").notNull(),
  replyTo: text("reply_to"),
  
  // Send timing and strategy
  scheduledSendDate: timestamp("scheduled_send_date"),
  actualSendDate: timestamp("actual_send_date"),
  daysSinceRelease: integer("days_since_release"), // Strategy timing
  
  // Targeting and segmentation
  targetGenres: jsonb("target_genres"), // Array of genres to target
  targetRegions: jsonb("target_regions"), // Geographic targeting
  curatorCriteria: jsonb("curator_criteria"), // Advanced targeting criteria
  excludedCurators: jsonb("excluded_curators"), // Array of curator IDs to exclude
  
  // Campaign performance
  totalRecipients: integer("total_recipients").default(0),
  sentCount: integer("sent_count").default(0),
  deliveredCount: integer("delivered_count").default(0),
  openCount: integer("open_count").default(0),
  clickCount: integer("click_count").default(0),
  responseCount: integer("response_count").default(0),
  placementCount: integer("placement_count").default(0),
  
  // Campaign status and management
  status: text("status").default("draft"), // draft, scheduled, sending, sent, completed
  errorLog: jsonb("error_log"), // Any send errors or issues
  
  createdByUserId: integer("created_by_user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const musicRecommendations = pgTable("music_recommendations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  songId: integer("song_id").references(() => songs.id),
  artistId: integer("artist_id").references(() => users.id),
  albumId: integer("album_id").references(() => albums.id),
  recommendationType: text("recommendation_type").notNull(), // 'similar_artist', 'genre_based', 'collaborative', 'trending', 'cross_promotion'
  score: decimal("score", { precision: 5, scale: 3 }), // 0.000 to 1.000
  reasonCode: text("reason_code"), // Why this was recommended
  isActive: boolean("is_active").default(true),
  viewedAt: timestamp("viewed_at"),
  clickedAt: timestamp("clicked_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const artistSimilarities = pgTable("artist_similarities", {
  id: serial("id").primaryKey(),
  artistId1: integer("artist_id_1").references(() => users.id).notNull(),
  artistId2: integer("artist_id_2").references(() => users.id).notNull(),
  similarityScore: decimal("similarity_score", { precision: 5, scale: 3 }), // 0.000 to 1.000
  commonGenres: jsonb("common_genres"),
  sharedFans: integer("shared_fans").default(0),
  calculatedAt: timestamp("calculated_at").defaultNow(),
});

export const trendingMetrics = pgTable("trending_metrics", {
  id: serial("id").primaryKey(),
  songId: integer("song_id").references(() => songs.id),
  artistId: integer("artist_id").references(() => users.id),
  albumId: integer("album_id").references(() => albums.id),
  metricType: text("metric_type").notNull(), // 'plays', 'likes', 'shares', 'downloads'
  timeframe: text("timeframe").notNull(), // 'daily', 'weekly', 'monthly'
  count: integer("count").default(0),
  date: timestamp("date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const crossPromotionCampaigns = pgTable("cross_promotion_campaigns", {
  id: serial("id").primaryKey(),
  promotingArtistId: integer("promoting_artist_id").references(() => users.id).notNull(),
  promotedArtistId: integer("promoted_artist_id").references(() => users.id).notNull(),
  campaignType: text("campaign_type").notNull(), // 'song_feature', 'artist_spotlight', 'genre_mix'
  targetAudience: jsonb("target_audience"), // Demographics, genres, etc.
  budget: decimal("budget", { precision: 10, scale: 2 }),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  isActive: boolean("is_active").default(true),
  impressions: integer("impressions").default(0),
  clicks: integer("clicks").default(0),
  conversions: integer("conversions").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// PRO Registration System Tables
export const proRegistrations = pgTable("pro_registrations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  proName: text("pro_name").notNull(), // 'ASCAP', 'BMI', 'SESAC', 'GMR'
  membershipNumber: text("membership_number"),
  membershipType: text("membership_type").notNull(), // 'writer', 'publisher', 'both'
  applicationStatus: text("application_status").notNull().default('pending'), // 'pending', 'submitted', 'approved', 'rejected', 'active'
  applicationDate: timestamp("application_date").notNull(),
  approvalDate: timestamp("approval_date"),
  annualFee: decimal("annual_fee", { precision: 8, scale: 2 }),
  serviceFeePaid: boolean("service_fee_paid").default(false),
  serviceFeeAmount: decimal("service_fee_amount", { precision: 8, scale: 2 }).default("75.00"),
  applicationData: jsonb("application_data"), // Store form data for resubmission
  taxDocumentation: jsonb("tax_documentation"), // W-8BEN, W-9, or other tax forms
  waituMusicAutofill: jsonb("waitumusic_autofill"), // Fields autofilled by Wai'tuMusic label
  requiresW8BEN: boolean("requires_w8ben").default(false), // Determined by citizenship status
  taxFormStatus: text("tax_form_status").default("pending"), // pending, completed, verified
  notes: text("notes"),
  // Admin pricing and payment fields
  adminFee: decimal("admin_fee", { precision: 8, scale: 2 }).default("30.00"),
  proRegistrationFee: decimal("pro_registration_fee", { precision: 8, scale: 2 }).default("1.00"),
  handlingFee: decimal("handling_fee", { precision: 8, scale: 2 }).default("3.00"),
  paymentMethod: text("payment_method"), // 'online', 'offline'
  paymentStatus: text("payment_status").default('pending'), // 'pending', 'paid', 'refunded'
  paymentDate: timestamp("payment_date"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const proWorks = pgTable("pro_works", {
  id: serial("id").primaryKey(),
  proRegistrationId: integer("pro_registration_id").references(() => proRegistrations.id).notNull(),
  songId: integer("song_id").references(() => songs.id).notNull(),
  workTitle: text("work_title").notNull(),
  iswcCode: text("iswc_code"), // International Standard Musical Work Code
  registrationDate: timestamp("registration_date").notNull(),
  writerShare: decimal("writer_share", { precision: 5, scale: 2 }).default("100"), // Percentage
  publisherShare: decimal("publisher_share", { precision: 5, scale: 2 }).default("0"),
  coWriters: jsonb("co_writers").default([]), // Array of co-writer information
  registrationStatus: text("registration_status").notNull().default('pending'), // 'pending', 'registered', 'rejected'
  proWorkId: text("pro_work_id"), // Work ID from PRO system
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const proEligibilityAssessments = pgTable("pro_eligibility_assessments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  hasOriginalMusic: boolean("has_original_music").notNull(),
  hasPublishedWorks: boolean("has_published_works").notNull(),
  intendsToPersue: boolean("intends_to_persue").notNull(),
  hasPerformances: boolean("has_performances").notNull(),
  isUSCitizen: boolean("is_us_citizen"), // Optional field for bonus points
  isRegisteredWithAnotherPRO: boolean("is_registered_with_another_pro").notNull(),
  eligibilityScore: integer("eligibility_score").notNull(),
  recommendedPRO: text("recommended_pro"),
  assessmentData: jsonb("assessment_data"), // Store detailed answers
  createdAt: timestamp("created_at").defaultNow()
});

// Newsletter system tables
export const newsletterSubscriptions = pgTable('newsletter_subscriptions', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  subscriptionType: text('subscription_type').notNull().default('general'), // general, artist-specific
  artistInterests: jsonb('artist_interests'), // Array of artist IDs user is interested in
  status: text('status').notNull().default('active'), // active, unsubscribed, bounced
  source: text('source').default('website'), // website, referral, social, etc.
  subscribeDate: timestamp('subscribe_date').defaultNow(),
  lastEngagement: timestamp('last_engagement'),
  unsubscribeDate: timestamp('unsubscribe_date'),
  unsubscribeToken: text('unsubscribe_token').unique(),
  isDemo: boolean('is_demo').default(false)
});

export const newsletters = pgTable('newsletters', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(), // HTML content
  type: text('type').notNull().default('general'), // general, artist-specific, release-announcement
  targetArtistId: integer('target_artist_id').references(() => artists.userId),
  status: text('status').notNull().default('draft'), // draft, scheduled, sent
  scheduledFor: timestamp('scheduled_for'),
  sentAt: timestamp('sent_at'),
  sentCount: integer('sent_count').default(0),
  openCount: integer('open_count').default(0),
  clickCount: integer('click_count').default(0),
  bounceCount: integer('bounce_count').default(0),
  unsubscribeCount: integer('unsubscribe_count').default(0),
  createdBy: integer('created_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  isDemo: boolean('is_demo').default(false)
});

export const newsletterEngagements = pgTable('newsletter_engagements', {
  id: serial('id').primaryKey(),
  newsletterId: integer('newsletter_id').notNull().references(() => newsletters.id),
  subscriptionId: integer('subscription_id').notNull().references(() => newsletterSubscriptions.id),
  engagementType: text('engagement_type').notNull(), // sent, opened, clicked, bounced, unsubscribed
  engagementData: jsonb('engagement_data'), // Additional data like clicked links, etc.
  engagedAt: timestamp('engaged_at').defaultNow(),
  isDemo: boolean('is_demo').default(false)
});

// Press Release System Tables
export const pressReleases = pgTable('press_releases', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(), // Full press release content in HTML
  summary: text('summary').notNull(), // Brief summary for media previews
  type: text('type').notNull().default('song_release'), // song_release, album_release, tour_announcement, general
  
  // Artist/Release Information
  primaryArtistId: integer('primary_artist_id').references(() => artists.userId).notNull(),
  featuredArtistIds: jsonb('featured_artist_ids').default([]), // Array of artist user IDs
  songId: integer('song_id').references(() => songs.id), // For song-specific press releases
  albumId: integer('album_id').references(() => albums.id), // For album-specific press releases
  releaseDate: timestamp('release_date'), // When the song/album was released
  
  // Press Release Metadata
  status: text('status').notNull().default('draft'), // draft, scheduled, published, archived
  publishedAt: timestamp('published_at'),
  scheduledFor: timestamp('scheduled_for'),
  
  // Media Assets
  mediaAssets: jsonb('media_assets').default([]).$type<Array<{
    type: 'image' | 'audio' | 'video';
    url: string;
    caption?: string;
    altText?: string;
    isHeroImage?: boolean;
  }>>(),
  
  // Distribution and Contact Information
  contactName: text('contact_name'),
  contactEmail: text('contact_email'),
  contactPhone: text('contact_phone'),
  distributionChannels: jsonb('distribution_channels').default([]), // Array of platforms/outlets
  targetRegions: jsonb('target_regions').default(['global']), // Geographic targeting
  
  // Analytics and Tracking
  viewCount: integer('view_count').default(0),
  downloadCount: integer('download_count').default(0),
  shareCount: integer('share_count').default(0),
  pickupCount: integer('pickup_count').default(0), // Number of media outlets that picked up the story
  
  // SEO and Social Media
  metaTitle: text('meta_title'),
  metaDescription: text('meta_description'),
  socialMediaPreview: jsonb('social_media_preview').$type<{
    title: string;
    description: string;
    imageUrl?: string;
  }>(),
  
  // Creation and Management
  createdBy: integer('created_by').references(() => users.id).notNull(),
  lastModifiedBy: integer('last_modified_by').references(() => users.id),
  isAutoGenerated: boolean('is_auto_generated').default(false), // True if generated automatically
  generationTrigger: text('generation_trigger'), // song_upload, album_create, manual
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  isDemo: boolean('is_demo').default(false)
});

export const pressReleaseAssignments = pgTable('press_release_assignments', {
  id: serial('id').primaryKey(),
  pressReleaseId: integer('press_release_id').references(() => pressReleases.id).notNull(),
  artistId: integer('artist_id').references(() => artists.userId).notNull(),
  musicianId: integer('musician_id').references(() => musicians.userId),
  role: text('role').notNull().default('featured'), // primary, featured, supporting, musician
  assignedAt: timestamp('assigned_at').defaultNow(),
  assignedBy: integer('assigned_by').references(() => users.id).notNull()
});

export const pressReleaseMedia = pgTable('press_release_media', {
  id: serial('id').primaryKey(),
  pressReleaseId: integer('press_release_id').references(() => pressReleases.id).notNull(),
  songId: integer('song_id').references(() => songs.id),
  albumId: integer('album_id').references(() => albums.id),
  mediaType: text('media_type').notNull(), // coded_song, album_song, uploaded_media, external_link
  mediaUrl: text('media_url'),
  mediaTitle: text('media_title'),
  mediaDescription: text('media_description'),
  isrcCode: text('isrc_code'), // For coded songs
  displayOrder: integer('display_order').default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow()
});

export const pressReleaseDistribution = pgTable('press_release_distribution', {
  id: serial('id').primaryKey(),
  pressReleaseId: integer('press_release_id').references(() => pressReleases.id).notNull(),
  channelType: text('channel_type').notNull(), // email, social_media, news_wire, direct_contact
  channelName: text('channel_name').notNull(), // Specific outlet/platform name
  contactEmail: text('contact_email'),
  distributedAt: timestamp('distributed_at').defaultNow(),
  status: text('status').notNull().default('sent'), // sent, delivered, opened, picked_up, declined
  responseReceived: timestamp('response_received'),
  responseType: text('response_type'), // positive, negative, request_more_info
  notes: text('notes'),
  distributedBy: integer('distributed_by').references(() => users.id).notNull()
});

export const pressReleaseAnalytics = pgTable('press_release_analytics', {
  id: serial('id').primaryKey(),
  pressReleaseId: integer('press_release_id').references(() => pressReleases.id).notNull(),
  eventType: text('event_type').notNull(), // view, download, share, click, pickup
  eventDate: timestamp('event_date').defaultNow(),
  sourceUrl: text('source_url'), // Where the event came from
  userAgent: text('user_agent'),
  ipAddress: text('ip_address'),
  referrer: text('referrer'),
  mediaOutlet: text('media_outlet'), // For pickup events
  estimatedReach: integer('estimated_reach'), // For pickup events
  eventData: jsonb('event_data') // Additional event-specific data
});

// ==================== ENHANCED RECIPIENT MANAGEMENT SYSTEM ====================

// Recipient Categories for Industry Professionals
export const recipientCategories = pgTable('recipient_categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(), // radio, tv, dj, festival_organizer, booking_agent, etc.
  displayName: text('display_name').notNull(), // "Radio Stations", "TV Networks", "DJs"
  description: text('description'),
  priority: integer('priority').default(5), // 1-10, fans always get priority 1
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow()
});

// Music Genres for Content Matching
export const musicGenres = pgTable('music_genres', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(), // gospel, hip_hop, dancehall, pop, etc.
  displayName: text('display_name').notNull(), // "Gospel", "Hip-Hop", "Dancehall"
  parentGenreId: integer('parent_genre_id'), // For sub-genres - will reference musicGenres.id
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow()
});

// Industry Recipients Database
export const industryRecipients = pgTable('industry_recipients', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(), // Organization/Person name
  email: text('email').notNull(),
  categoryId: integer('category_id').references(() => recipientCategories.id).notNull(),
  
  // Contact Information
  contactPerson: text('contact_person'), // Primary contact name
  phone: text('phone'),
  website: text('website'),
  address: jsonb('address').$type<{
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  }>(),
  
  // Genre Preferences and Specializations
  preferredGenres: jsonb('preferred_genres').default([]), // Array of genre IDs they cover
  excludedGenres: jsonb('excluded_genres').default([]), // Array of genre IDs they don't want
  
  // Geographic Coverage
  coverageRegions: jsonb('coverage_regions').default(['global']), // Array of regions they cover
  localMarkets: jsonb('local_markets').default([]), // Specific cities/markets
  
  // Professional Details
  organizationType: text('organization_type'), // station, network, independent, agency, venue
  audienceSize: integer('audience_size'), // Estimated reach/audience
  influence: integer('influence').default(5), // 1-10 influence rating
  
  // Preferences and Requirements
  preferredFileFormats: jsonb('preferred_file_formats').default(['mp3', 'wav']), // For music submissions
  submissionGuidelines: text('submission_guidelines'), // Specific requirements
  preferredContactMethod: text('preferred_contact_method').default('email'), // email, phone, portal
  
  // Relationship Management
  relationshipType: text('relationship_type').default('prospect'), // prospect, contact, partner, vip
  lastContactDate: timestamp('last_contact_date'),
  responseRate: decimal('response_rate', { precision: 5, scale: 2 }).default('0.00'), // Success rate
  notes: text('notes'), // Internal notes about the contact
  
  // Status and Management
  status: text('status').default('active'), // active, inactive, bounced, blacklisted
  source: text('source').default('manual'), // manual, imported, discovered, referral
  addedBy: integer('added_by').references(() => users.id).notNull(),
  verifiedBy: integer('verified_by').references(() => users.id),
  verifiedAt: timestamp('verified_at'),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  isDemo: boolean('is_demo').default(false)
});

// Unified Content Distribution (shared between newsletters and press releases)
export const contentDistribution = pgTable('content_distribution', {
  id: serial('id').primaryKey(),
  contentType: text('content_type').notNull(), // 'newsletter' or 'press_release'
  contentId: integer('content_id').notNull(), // Newsletter ID or Press Release ID
  
  // Fan Distribution (Priority 1 - Always First)
  includeFans: boolean('include_fans').default(true),
  fanArtistIds: jsonb('fan_artist_ids').default([]), // Specific artist fans to include
  fanDelay: integer('fan_delay_minutes').default(0), // Fans get it immediately
  
  // Industry Distribution (Priority 2)
  industryDelay: integer('industry_delay_minutes').default(60), // Industry gets it after fans
  
  // Recipient Category Targeting
  recipientCategoryIds: jsonb('recipient_category_ids').default([]), // Array of category IDs (radio, TV, etc.)
  specificRecipientIds: jsonb('specific_recipient_ids').default([]), // Array of specific recipient IDs
  excludeRecipientIds: jsonb('exclude_recipient_ids').default([]), // Recipients to exclude
  
  // Genre-Based Content Matching
  contentGenres: jsonb('content_genres').default([]), // Genres of the content
  targetGenres: jsonb('target_genres').default([]), // Override content genres if needed
  excludeGenres: jsonb('exclude_genres').default([]), // Genres to exclude
  requireGenreMatch: boolean('require_genre_match').default(true), // Gospel content -> Gospel recipients
  genreMatchStrength: text('genre_match_strength').default('strict'), // strict, loose, any
  
  // Professional Targeting Rules
  targetMediaTypes: jsonb('target_media_types').default([]), // radio, tv, print, digital, podcast
  minimumAudienceSize: integer('minimum_audience_size').default(0),
  minimumInfluence: integer('minimum_influence').default(1), // 1-10
  
  // Geographic and Market Targeting
  targetRegions: jsonb('target_regions').default(['global']),
  localMarkets: jsonb('local_markets').default([]),
  artistHomeMarkets: boolean('artist_home_markets').default(true), // Include artist's local markets
  
  // Relationship-Based Targeting
  includePartners: boolean('include_partners').default(true),
  includeVIPs: boolean('include_vips').default(true),
  includeNewContacts: boolean('include_new_contacts').default(false),
  
  // Distribution Timing and Status
  scheduledFor: timestamp('scheduled_for'),
  sentAt: timestamp('sent_at'),
  distributionStatus: text('distribution_status').default('pending'), // pending, sending, sent, failed
  
  // Distribution Analytics
  totalRecipients: integer('total_recipients').default(0),
  totalSent: integer('total_sent').default(0),
  totalDelivered: integer('total_delivered').default(0),
  totalOpened: integer('total_opened').default(0),
  totalClicked: integer('total_clicked').default(0),
  totalResponded: integer('total_responded').default(0),
  
  createdAt: timestamp('created_at').defaultNow(),
  createdBy: integer('created_by').references(() => users.id).notNull()
});

// Recipient Engagement Tracking
export const recipientEngagements = pgTable('recipient_engagements', {
  id: serial('id').primaryKey(),
  recipientId: integer('recipient_id').references(() => industryRecipients.id).notNull(),
  contentType: text('content_type').notNull(), // newsletter, press_release
  contentId: integer('content_id').notNull(), // ID of newsletter or press release
  
  // Engagement Details
  engagementType: text('engagement_type').notNull(), // sent, delivered, opened, clicked, responded, picked_up
  engagementDate: timestamp('engagement_date').defaultNow(),
  
  // Response Information
  responseType: text('response_type'), // positive, negative, request_info, coverage_planned
  responseContent: text('response_content'), // Actual response text
  followUpRequired: boolean('follow_up_required').default(false),
  followUpDate: timestamp('follow_up_date'),
  
  // Coverage Tracking (for press releases)
  coverageProvided: boolean('coverage_provided').default(false),
  coverageUrl: text('coverage_url'),
  coverageType: text('coverage_type'), // article, interview, playlist_add, air_play
  estimatedReach: integer('estimated_reach'),
  
  // Internal Tracking
  handledBy: integer('handled_by').references(() => users.id),
  notes: text('notes'),
  
  createdAt: timestamp('created_at').defaultNow(),
  isDemo: boolean('is_demo').default(false)
});




// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  lastLogin: true,
}).extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// UserProfile schema removed - using normalized tables instead
export const insertArtistSchema = createInsertSchema(artists);
export const insertMusicianSchema = createInsertSchema(musicians);
export const insertProfessionalSchema = createInsertSchema(professionals);

export const insertSongSchema = createInsertSchema(songs).omit({
  id: true,
  createdAt: true,
});

export const insertAlbumSchema = createInsertSchema(albums).omit({
  id: true,
  createdAt: true,
});

export const insertMerchandiseSchema = createInsertSchema(merchandise).omit({
  id: true,
  createdAt: true,
});

export const insertMerchandiseCategorySchema = createInsertSchema(merchandiseCategories).omit({
  id: true,
  createdAt: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Insert schemas for new enhanced booking assignment tables
export const insertAllInstrumentsSchema = createInsertSchema(allInstruments).omit({
  id: true,
  createdAt: true,
});

export const insertBookingAssignmentsMembersSchema = createInsertSchema(bookingAssignmentsMembers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  assignedAt: true,
});

// New schema exports for contracts and payments
export const insertContractSignatureSchema = createInsertSchema(contractSignatures).omit({
  id: true,
  signedAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
  paidAt: true,
  refundedAt: true,
});

export const insertReceiptSchema = createInsertSchema(receipts).omit({
  id: true,
  generatedAt: true,
});

// PRO Registration insert schemas
export const insertPRORegistrationSchema = createInsertSchema(proRegistrations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPROEligibilityAssessmentSchema = createInsertSchema(proEligibilityAssessments).omit({
  id: true,
  createdAt: true,
});

// Note: ISRC schemas moved to end of file after table definitions

export const insertPROWorkSchema = createInsertSchema(proWorks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTechnicalRiderSchema = createInsertSchema(technicalRiders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Service management insert schemas
export const insertServiceCategorySchema = createInsertSchema(serviceCategories).omit({
  id: true,
  createdAt: true,
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
  createdAt: true,
});



export const insertServiceAssignmentSchema = createInsertSchema(serviceAssignments).omit({
  id: true,
  assignedAt: true,
});

export const insertUserServiceSchema = createInsertSchema(userServices).omit({
  id: true,
  createdAt: true,
});

export const insertServiceReviewSchema = createInsertSchema(serviceReviews).omit({
  id: true,
  createdAt: true,
});

// Collaboration insert schemas
export const insertCollaborationRoomSchema = createInsertSchema(collaborationRooms).omit({
  id: true,
  createdAt: true,
});

export const insertCollaborationMessageSchema = createInsertSchema(collaborationMessages).omit({
  id: true,
  createdAt: true,
});

export const insertCollaborationProjectSchema = createInsertSchema(collaborationProjects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCollaborationTaskSchema = createInsertSchema(collaborationTasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  completedAt: true,
});

export const insertCollaborationFileSchema = createInsertSchema(collaborationFiles).omit({
  id: true,
  uploadedAt: true,
});

// Recommendation system insert schemas
// Release contract system insert schemas
export const insertReleaseContractSchema = createInsertSchema(releaseContracts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  requestedAt: true,
  approvedAt: true,
  signedAt: true,
  completedAt: true,
});

export const insertReleaseContractSignatureSchema = createInsertSchema(releaseContractSignatures).omit({
  id: true,
  signedAt: true,
});

export const insertManagementTransitionSchema = createInsertSchema(managementTransitions).omit({
  id: true,
  createdAt: true,
});

// Management application system insert schemas
export const insertManagementApplicationSchema = createInsertSchema(managementApplications).omit({
  id: true,
  submittedAt: true,
  reviewedAt: true,
  approvedAt: true,
  signedAt: true,
  completedAt: true,
  createdAt: true,
  updatedAt: true,
});

export const insertManagementApplicationSignatureSchema = createInsertSchema(managementApplicationSignatures).omit({
  id: true,
  signedAt: true,
});

export const insertServiceDiscountOverrideSchema = createInsertSchema(serviceDiscountOverrides).omit({
  id: true,
  createdAt: true,
});

// Content Management System exports
export * from './content-management-schema';

export const insertWaituServiceDiscountLimitSchema = createInsertSchema(waituServiceDiscountLimits).omit({
  id: true,
  updatedAt: true,
});

export const insertIndividualDiscountPermissionSchema = createInsertSchema(individualDiscountPermissions).omit({
  id: true,
  createdAt: true,
});

// Contracts and workflow automation insert schemas
export const insertContractSchema = createInsertSchema(contracts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertArtistBandMemberSchema = createInsertSchema(artistBandMembers).omit({
  id: true,
  createdAt: true,
});

export const insertHospitalityRequirementSchema = createInsertSchema(hospitalityRequirements).omit({
  id: true,
  createdAt: true,
});

export const insertGlobalGenreSchema = createInsertSchema(globalGenres).omit({
  id: true,
  createdAt: true,
});

export const insertCrossUpsellRelationshipSchema = createInsertSchema(crossUpsellRelationships).omit({
  id: true,
  createdAt: true,
});

export const insertManagementApplicationReviewSchema = createInsertSchema(managementApplicationReviews).omit({
  id: true,
  reviewedAt: true,
});

export const insertLegalAssignmentSchema = createInsertSchema(legalAssignments).omit({
  id: true,
  assignedAt: true,
});

export const insertApplicationLegalAssignmentSchema = createInsertSchema(applicationLegalAssignments).omit({
  id: true,
  assignedAt: true,
});



export const insertUserInteractionSchema = createInsertSchema(userInteractions).omit({
  id: true,
  createdAt: true,
});

export const insertUserPreferencesSchema = createInsertSchema(userPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMusicRecommendationSchema = createInsertSchema(musicRecommendations).omit({
  id: true,
  createdAt: true,
  viewedAt: true,
  clickedAt: true,
});

export const insertArtistSimilaritySchema = createInsertSchema(artistSimilarities).omit({
  id: true,
  calculatedAt: true,
});

export const insertTrendingMetricSchema = createInsertSchema(trendingMetrics).omit({
  id: true,
  createdAt: true,
});

// Global professions table for professional specializations
export const globalProfessions = pgTable('global_professions', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  description: text('description'),
  isCustom: boolean('is_custom').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// Professional availability settings
export const professionalAvailability = pgTable('professional_availability', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  availabilityType: text('availability_type').notNull(), // 'weekdays', 'weekends', 'daily', 'custom'
  excludeHolidays: boolean('exclude_holidays').default(false),
  country: text('country').default('US'), // for holiday exclusion
  customDays: text('custom_days').array(), // ['monday', 'tuesday', etc.]
  timeZone: text('time_zone').default('UTC'),
  startTime: text('start_time').default('09:00'),
  endTime: text('end_time').default('17:00'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Insert schemas for new tables
export const insertGlobalProfessionSchema = createInsertSchema(globalProfessions).omit({
  id: true,
  createdAt: true,
});

export const insertProfessionalAvailabilitySchema = createInsertSchema(professionalAvailability).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});



export const insertCrossPromotionCampaignSchema = createInsertSchema(crossPromotionCampaigns).omit({
  id: true,
  createdAt: true,
  impressions: true,
  clicks: true,
  conversions: true,
});



// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

// UserProfile types removed - using normalized user data tables instead

export type Artist = typeof artists.$inferSelect;
export type InsertArtist = z.infer<typeof insertArtistSchema>;

export type Musician = typeof musicians.$inferSelect;
export type InsertMusician = z.infer<typeof insertMusicianSchema>;

export type Professional = typeof professionals.$inferSelect;
export type InsertProfessional = z.infer<typeof insertProfessionalSchema>;

export type Song = typeof songs.$inferSelect;
export type InsertSong = z.infer<typeof insertSongSchema>;

export type Album = typeof albums.$inferSelect;
export type InsertAlbum = z.infer<typeof insertAlbumSchema>;

export type Merchandise = typeof merchandise.$inferSelect;
export type InsertMerchandise = z.infer<typeof insertMerchandiseSchema>;

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

export type Role = typeof rolesManagement.$inferSelect;
export type ManagementTier = typeof managementTiers.$inferSelect;

// Primary talent types - removed as table doesn't exist

// Marketplace tables defined in OppHub section below

// Collaboration types
export type CollaborationRoom = typeof collaborationRooms.$inferSelect;
export type InsertCollaborationRoom = z.infer<typeof insertCollaborationRoomSchema>;

export type CollaborationParticipant = typeof collaborationParticipants.$inferSelect;

export type CollaborationMessage = typeof collaborationMessages.$inferSelect;
export type InsertCollaborationMessage = z.infer<typeof insertCollaborationMessageSchema>;

export type CollaborationProject = typeof collaborationProjects.$inferSelect;
export type InsertCollaborationProject = z.infer<typeof insertCollaborationProjectSchema>;

export type CollaborationTask = typeof collaborationTasks.$inferSelect;
export type InsertCollaborationTask = z.infer<typeof insertCollaborationTaskSchema>;

export type CollaborationFile = typeof collaborationFiles.$inferSelect;
export type InsertCollaborationFile = z.infer<typeof insertCollaborationFileSchema>;

export type CollaborationComment = typeof collaborationComments.$inferSelect;
export type Event = typeof events.$inferSelect;
export type Document = typeof documents.$inferSelect;

// Service management types
export type ServiceCategory = typeof serviceCategories.$inferSelect;
export type InsertServiceCategory = z.infer<typeof insertServiceCategorySchema>;

export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;

export type ServiceAssignment = typeof serviceAssignments.$inferSelect;
export type InsertServiceAssignment = z.infer<typeof insertServiceAssignmentSchema>;

export type UserService = typeof userServices.$inferSelect;
export type InsertUserService = z.infer<typeof insertUserServiceSchema>;

export type ServiceReview = typeof serviceReviews.$inferSelect;
export type InsertServiceReview = z.infer<typeof insertServiceReviewSchema>;

// Currency management table
export const currencies = pgTable("currencies", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 3 }).notNull().unique(),
  name: text("name").notNull(),
  symbol: text("symbol").notNull(),
  rate: decimal("rate", { precision: 10, scale: 4 }).notNull(),
  isActive: boolean("is_active").notNull().default(true),
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type Currency = typeof currencies.$inferSelect;
export type InsertCurrency = typeof currencies.$inferInsert;
export const insertCurrencySchema = createInsertSchema(currencies);

// Store and bundle insert schemas
export const insertBundleSchema = createInsertSchema(bundles).omit({
  id: true,
  createdAt: true,
});

export const insertBundleItemSchema = createInsertSchema(bundleItems).omit({
  id: true,
});

export const insertDiscountConditionSchema = createInsertSchema(discountConditions).omit({
  id: true,
  currentUsage: true,
  createdAt: true,
});

export const insertStoreCurrencySchema = createInsertSchema(storeCurrencies).omit({
  id: true,
  lastUpdated: true,
});

export const insertFanEngagementSchema = createInsertSchema(fanEngagement).omit({
  id: true,
  engagementDate: true,
});

// Store and bundle types
export type Bundle = typeof bundles.$inferSelect;
export type InsertBundle = z.infer<typeof insertBundleSchema>;

export type BundleItem = typeof bundleItems.$inferSelect;
export type InsertBundleItem = z.infer<typeof insertBundleItemSchema>;

export type DiscountCondition = typeof discountConditions.$inferSelect;
export type InsertDiscountCondition = z.infer<typeof insertDiscountConditionSchema>;

export type StoreCurrency = typeof storeCurrencies.$inferSelect;
export type InsertStoreCurrency = z.infer<typeof insertStoreCurrencySchema>;

export type FanEngagement = typeof fanEngagement.$inferSelect;
export type InsertFanEngagement = z.infer<typeof insertFanEngagementSchema>;

export type InsertCurrencySchema = z.infer<typeof insertCurrencySchema>;



// OppHub - Opportunity Hub System

// Opportunity Categories table
export const opportunityCategories = pgTable('opportunity_categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  iconName: text('icon_name').default('Music'), // Lucide icon name
  colorScheme: text('color_scheme').default('blue'), // for UI styling
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Opportunities table
export const opportunities = pgTable('opportunities', {
  id: serial('id').primaryKey(),
  categoryId: integer('category_id').references(() => opportunityCategories.id),
  title: text('title').notNull(),
  description: text('description'),
  organizerName: text('organizer_name').notNull(),
  organizerEmail: text('organizer_email'),
  organizerWebsite: text('organizer_website'),
  location: text('location'), // Can be virtual, city, venue
  eventDate: timestamp('event_date'),
  applicationDeadline: timestamp('application_deadline'),
  compensation: text('compensation'), // Free, Paid, Revenue Share, etc.
  compensationAmount: text('compensation_amount'), // "$500", "$1000-5000", "TBD"
  requirements: jsonb('requirements'), // Genre, experience level, equipment, etc.
  applicationFee: text('application_fee').default('0'), // Fee for non-managed users
  submissionGuidelines: text('submission_guidelines'),
  contactInfo: jsonb('contact_info'),
  tags: jsonb('tags'), // Array of searchable tags
  status: text('status').default('active'), // active, closed, cancelled, filled
  sourceType: text('source_type').default('manual'), // manual, scraped, api
  sourceUrl: text('source_url'), // Original listing URL if scraped
  viewCount: integer('view_count').default(0),
  applicationCount: integer('application_count').default(0),
  isVerified: boolean('is_verified').default(false),
  isFeatured: boolean('is_featured').default(false),
  createdBy: integer('created_by').references(() => users.id), // User who posted
  verifiedBy: integer('verified_by').references(() => users.id), // Admin who verified
  compensationType: text('compensation_type').default('unpaid'), // paid, unpaid, revenue_share, exposure
  isRemote: boolean('is_remote').default(false),
  isDemo: boolean('is_demo').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Opportunity Applications table
export const opportunityApplications = pgTable('opportunity_applications', {
  id: serial('id').primaryKey(),
  opportunityId: integer('opportunity_id').references(() => opportunities.id),
  applicantUserId: integer('applicant_user_id').references(() => users.id),
  artistId: integer('artist_id').references(() => artists.userId), // Which artist profile they're applying with
  applicationData: jsonb('application_data'), // Custom form responses
  submissionFiles: jsonb('submission_files'), // Links to uploaded files
  coverLetter: text('cover_letter'),
  status: text('status').default('submitted'), // submitted, under_review, accepted, rejected, withdrawn
  appliedAt: timestamp('applied_at').defaultNow(),
  reviewedAt: timestamp('reviewed_at'),
  reviewedBy: integer('reviewed_by').references(() => users.id),
  reviewNotes: text('review_notes'),
  paymentRequired: boolean('payment_required').default(false),
  paymentStatus: text('payment_status').default('pending'), // pending, paid, failed, waived
  paymentAmount: text('payment_amount'),
  isDemo: boolean('is_demo').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// AI Success Stories Database for Application Intelligence
export const oppHubSuccessStories = pgTable("opphub_success_stories", {
  id: serial("id").primaryKey(),
  opportunityId: integer("opportunity_id").references(() => opportunities.id),
  artistName: text("artist_name").notNull(),
  artistGenre: text("artist_genre"),
  artistRegion: text("artist_region"),
  opportunityType: text("opportunity_type").notNull(), // 'grant', 'festival', 'sync', 'competition'
  applicationText: text("application_text").notNull(), // Full successful application text
  outcomeDetails: jsonb("outcome_details"), // Award amount, contract terms, etc.
  applicationStrategy: jsonb("application_strategy"), // Key strategies used
  timelineDetails: jsonb("timeline_details"), // Application to decision timeline
  contactApproach: text("contact_approach"), // How they approached organizers
  portfolioHighlights: jsonb("portfolio_highlights"), // What work samples they included
  successFactor: text("success_factor").notNull(), // Primary reason for success
  dateApplied: timestamp("date_applied"),
  dateAccepted: timestamp("date_accepted"),
  verificationStatus: text("verification_status").default("verified"), // verified, pending, unverified
  addedBy: integer("added_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// AI Application Intelligence for All Managed Artists (Priority: Lí-Lí Octave, JCro, Janet Azzouz, Princess Trinidad)
export const oppHubApplicationGuidance = pgTable("opphub_application_guidance", {
  id: serial("id").primaryKey(),
  opportunityId: integer("opportunity_id").references(() => opportunities.id).notNull(),
  targetUserId: integer("target_user_id").references(() => users.id).notNull(), // Managed artists get priority
  generatedStrategy: jsonb("generated_strategy").notNull(), // AI-generated application strategy
  matchReasons: jsonb("match_reasons"), // Why this opportunity matches the artist
  recommendedApproach: text("recommended_approach").notNull(),
  suggestedPortfolio: jsonb("suggested_portfolio"), // Recommended work samples
  keyTalkingPoints: jsonb("key_talking_points"), // Important points to emphasize
  deadlineAlerts: jsonb("deadline_alerts"), // Timeline recommendations
  similarSuccessStories: jsonb("similar_success_stories"), // References to similar successes
  confidenceScore: integer("confidence_score").notNull(), // 1-100 likelihood of success
  priorityLevel: integer("priority_level").default(1), // 5=Lí-Lí Octave, 4=JCro/Janet/Princess, 3=Other managed, 2=Regular, 1=Basic
  aiAnalysisDetails: jsonb("ai_analysis_details"), // Deep AI analysis
  applicationStatus: text("application_status").default("pending"), // pending, applied, accepted, rejected
  followUpReminders: jsonb("follow_up_reminders"), // Automated reminder schedule
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Deadline Tracking and Alert System
export const oppHubDeadlineTracking = pgTable("opphub_deadline_tracking", {
  id: serial("id").primaryKey(),
  opportunityId: integer("opportunity_id").references(() => opportunities.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  deadlineType: text("deadline_type").notNull(), // 'application', 'submission', 'decision'
  deadlineDate: timestamp("deadline_date").notNull(),
  reminderSchedule: jsonb("reminder_schedule"), // When to send reminders
  alertsSent: jsonb("alerts_sent"), // Track which alerts have been sent
  applicationProgress: jsonb("application_progress"), // Track user's progress
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Historical Application Performance Analytics
export const oppHubApplicationAnalytics = pgTable("opphub_application_analytics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  opportunityId: integer("opportunity_id").references(() => opportunities.id).notNull(),
  applicationSubmittedAt: timestamp("application_submitted_at"),
  responseReceivedAt: timestamp("response_received_at"),
  outcome: text("outcome"), // 'accepted', 'rejected', 'waitlisted', 'pending'
  outcomeValue: decimal("outcome_value", { precision: 12, scale: 2 }), // Monetary value if applicable
  feedbackReceived: text("feedback_received"), // Any feedback from organizers
  lessonsLearned: jsonb("lessons_learned"), // What worked/didn't work
  aiRecommendationFollowed: boolean("ai_recommendation_followed").default(false),
  successFactors: jsonb("success_factors"), // What contributed to success
  improvementAreas: jsonb("improvement_areas"), // Areas for future improvement
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// OppHub Subscriptions table
export const oppHubSubscriptions = pgTable('opphub_subscriptions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  subscriptionTier: text('subscription_tier').notNull(), // basic, premium, managed
  status: text('status').default('active'), // active, cancelled, suspended, expired
  monthlyFee: text('monthly_fee').notNull(),
  applicationsAllowed: integer('applications_allowed').default(5), // Monthly application limit
  applicationsUsed: integer('applications_used').default(0),
  premiumFeatures: jsonb('premium_features'), // Array of enabled features
  startDate: timestamp('start_date').defaultNow(),
  nextBillingDate: timestamp('next_billing_date'),
  cancelledAt: timestamp('cancelled_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// AI Market Intelligence table
export const marketIntelligence = pgTable('market_intelligence', {
  id: serial('id').primaryKey(),
  sourceType: text('source_type').notNull(), // forum, social_media, industry_site, news
  sourceName: text('source_name').notNull(), // Reddit, Twitter, Music Business Worldwide
  sourceUrl: text('source_url'),
  contentType: text('content_type').notNull(), // discussion, article, post, comment
  extractedContent: text('extracted_content').notNull(),
  detectedNeeds: jsonb('detected_needs'), // Array of identified needs/pain points
  sentiment: text('sentiment'), // positive, negative, neutral
  relevanceScore: integer('relevance_score'), // 1-100
  suggestedFeatures: jsonb('suggested_features'), // AI-generated feature suggestions
  processedAt: timestamp('processed_at').defaultNow(),
  status: text('status').default('pending'), // pending, reviewed, implemented, dismissed
  reviewedBy: integer('reviewed_by').references(() => users.id),
  reviewNotes: text('review_notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Opportunity Scrapers/Sources table
export const opportunitySources = pgTable('opportunity_sources', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  website: text('website').notNull(),
  scrapeEndpoint: text('scrape_endpoint'), // API endpoint or scraping URL
  categoryId: integer('category_id').references(() => opportunityCategories.id),
  isActive: boolean('is_active').default(true),
  lastScraped: timestamp('last_scraped'),
  scraperConfig: jsonb('scraper_config'), // Scraping configuration
  opportunitiesFound: integer('opportunities_found').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Opportunity Matches (AI-suggested matches)
export const opportunityMatches = pgTable('opportunity_matches', {
  id: serial('id').primaryKey(),
  opportunityId: integer('opportunity_id').references(() => opportunities.id),
  artistId: integer('artist_id').references(() => artists.userId),
  matchScore: integer('match_score'), // 1-100 AI confidence score
  matchReasons: jsonb('match_reasons'), // Array of reasons why it's a good match
  notifiedAt: timestamp('notified_at'),
  viewedAt: timestamp('viewed_at'),
  interactionType: text('interaction_type'), // viewed, applied, dismissed, saved
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// OppHub Insert Schemas
export const insertOpportunityCategorySchema = createInsertSchema(opportunityCategories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOpportunitySchema = createInsertSchema(opportunities).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  viewCount: true,
  applicationCount: true,
});

export const insertOpportunityApplicationSchema = createInsertSchema(opportunityApplications).omit({
  id: true,
  appliedAt: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOppHubSubscriptionSchema = createInsertSchema(oppHubSubscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMarketIntelligenceSchema = createInsertSchema(marketIntelligence).omit({
  id: true,
  processedAt: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOpportunitySourceSchema = createInsertSchema(opportunitySources).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOpportunityMatchSchema = createInsertSchema(opportunityMatches).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// OppHub Types
export type OpportunityCategory = typeof opportunityCategories.$inferSelect;
export type InsertOpportunityCategory = z.infer<typeof insertOpportunityCategorySchema>;

export type Opportunity = typeof opportunities.$inferSelect;
export type InsertOpportunity = z.infer<typeof insertOpportunitySchema>;

export type OpportunityApplication = typeof opportunityApplications.$inferSelect;
export type InsertOpportunityApplication = z.infer<typeof insertOpportunityApplicationSchema>;

export type OppHubSubscription = typeof oppHubSubscriptions.$inferSelect;
export type InsertOppHubSubscription = z.infer<typeof insertOppHubSubscriptionSchema>;

export type MarketIntelligence = typeof marketIntelligence.$inferSelect;
export type InsertMarketIntelligence = z.infer<typeof insertMarketIntelligenceSchema>;

export type OpportunitySource = typeof opportunitySources.$inferSelect;
export type InsertOpportunitySource = z.infer<typeof insertOpportunitySourceSchema>;

export type OpportunityMatch = typeof opportunityMatches.$inferSelect;
export type InsertOpportunityMatch = z.infer<typeof insertOpportunityMatchSchema>;











// Revenue Analytics & Forecasting System - Strategic Enhancement 2025
export const revenueStreams = pgTable("revenue_streams", {
  id: serial("id").primaryKey(),
  artistUserId: integer("artist_user_id").references(() => users.id).notNull(),
  streamType: text("stream_type").notNull(), // 'booking', 'streaming', 'merchandise', 'sync_licensing', 'brand_partnership', 'performance_royalties', 'mechanical_royalties', 'publishing', 'other'
  streamName: text("stream_name").notNull(), // Spotify, Apple Music, specific brand, venue name, etc.
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default("USD"),
  exchangeRate: decimal("exchange_rate", { precision: 10, scale: 6 }).default("1.0"),
  usdEquivalent: decimal("usd_equivalent", { precision: 10, scale: 2 }).notNull(),
  dateReceived: timestamp("date_received").notNull(),
  periodStart: timestamp("period_start"), // For royalties and recurring payments
  periodEnd: timestamp("period_end"),
  sourceId: integer("source_id"), // Reference to booking, song, etc.
  metadata: jsonb("metadata").$type<{
    platformData?: any;
    royaltyType?: string;
    playCount?: number;
    streamCount?: number;
    territoryBreakdown?: Record<string, number>;
    brandCampaignDetails?: any;
    syncPlacementDetails?: any;
    venueCapacity?: number;
    ticketsSold?: number;
    merchandiseBreakdown?: Record<string, number>;
  }>(),
  status: text("status").default("confirmed"), // 'pending', 'confirmed', 'disputed', 'canceled'
  taxWithheld: decimal("tax_witheld", { precision: 10, scale: 2 }),
  netAmount: decimal("net_amount", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const revenueGoals = pgTable("revenue_goals", {
  id: serial("id").primaryKey(),
  artistUserId: integer("artist_user_id").references(() => users.id).notNull(),
  goalType: text("goal_type").notNull(), // 'total_revenue', 'booking_revenue', 'streaming_revenue', 'sync_licensing', 'brand_partnerships', 'merchandise'
  targetAmount: decimal("target_amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default("USD"),
  timeframe: text("timeframe").notNull(), // 'monthly', 'quarterly', 'yearly', 'custom'
  targetDate: timestamp("target_date").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  progress: decimal("progress", { precision: 5, scale: 2 }).default("0"), // 0-100 percentage
  lastCalculated: timestamp("last_calculated"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const revenueForecasts = pgTable("revenue_forecasts", {
  id: serial("id").primaryKey(),
  artistUserId: integer("artist_user_id").references(() => users.id).notNull(),
  forecastType: text("forecast_type").notNull(), // 'monthly', 'quarterly', 'yearly'
  forecastPeriod: timestamp("forecast_period").notNull(), // Start date of forecast period
  totalForecast: decimal("total_forecast", { precision: 10, scale: 2 }).notNull(),
  streamBreakdown: jsonb("stream_breakdown").$type<Record<string, number>>().notNull(), // booking: 45000, streaming: 5000, etc.
  confidenceLevel: decimal("confidence_level", { precision: 5, scale: 2 }).notNull(), // 0.0 - 1.0
  forecastMethod: text("forecast_method").notNull(), // 'historical_trend', 'ai_analysis', 'market_based', 'manual'
  assumptions: jsonb("assumptions").$type<string[]>(), // Key assumptions for forecast
  riskFactors: jsonb("risk_factors").$type<string[]>(), // Potential risks to forecast
  opportunities: jsonb("opportunities").$type<string[]>(), // Growth opportunities identified
  generatedByUserId: integer("generated_by_user_id").references(() => users.id),
  aiModelVersion: text("ai_model_version"),
  accuracy: decimal("accuracy", { precision: 5, scale: 2 }), // Accuracy vs actual (populated later)
  actualRevenue: decimal("actual_revenue", { precision: 10, scale: 2 }), // Populated after period ends
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const marketTrends = pgTable("market_trends", {
  id: serial("id").primaryKey(),
  genre: text("genre").notNull(),
  region: text("region").default("global"),
  trendType: text("trend_type").notNull(), // 'booking_rates', 'streaming_growth', 'sync_demand', 'brand_interest', 'playlist_placement'
  trendValue: decimal("trend_value", { precision: 10, scale: 2 }).notNull(),
  changePercentage: decimal("change_percentage", { precision: 5, scale: 2 }),
  timeframe: text("timeframe").notNull(), // 'monthly', 'quarterly', 'yearly'
  dataSource: text("data_source").notNull(), // 'internal_analysis', 'industry_report', 'ai_analysis', 'opphub_scanner'
  reliability: decimal("reliability", { precision: 5, scale: 2 }).notNull(), // 0.0 - 1.0
  impactFactor: decimal("impact_factor", { precision: 5, scale: 2 }).default("1.0"), // How much this affects revenue
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const revenueOptimizations = pgTable("revenue_optimizations", {
  id: serial("id").primaryKey(),
  artistUserId: integer("artist_user_id").references(() => users.id).notNull(),
  optimizationType: text("optimization_type").notNull(), // 'pricing_adjustment', 'platform_focus', 'geographic_expansion', 'genre_diversification'
  currentMetrics: jsonb("current_metrics").$type<Record<string, number>>(),
  recommendedActions: jsonb("recommended_actions").$type<Array<{
    action: string;
    priority: string;
    expectedImpact: number;
    timeline: string;
    resources: string[];
  }>>(),
  projectedImpact: decimal("projected_impact", { precision: 10, scale: 2 }), // Expected revenue increase
  implementationCost: decimal("implementation_cost", { precision: 10, scale: 2 }),
  roi: decimal("roi", { precision: 5, scale: 2 }), // Return on investment percentage
  status: text("status").default("pending"), // 'pending', 'in_progress', 'completed', 'dismissed'
  implementedAt: timestamp("implemented_at"),
  results: jsonb("results").$type<{
    actualImpact?: number;
    actualCost?: number;
    actualROI?: number;
    lessonsLearned?: string[];
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Revenue Analytics Insert Schemas
export const insertRevenueStreamSchema = createInsertSchema(revenueStreams).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Admin Configuration Storage - Real-time Platform Configuration Control
export const adminConfigurations = pgTable("admin_configurations", {
  id: serial("id").primaryKey(),
  configurationKey: text("configuration_key").notNull().unique(), // 'platform_config', 'user_config', etc.
  configurationData: jsonb("configuration_data").notNull(), // Complete configuration object
  lastModifiedBy: integer("last_modified_by").references(() => users.id).notNull(),
  version: integer("version").notNull().default(1),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Configuration Change History - Complete audit trail
export const configurationHistory = pgTable("configuration_history", {
  id: serial("id").primaryKey(),
  configurationId: integer("configuration_id").references(() => adminConfigurations.id).notNull(),
  changeType: text("change_type").notNull(), // 'create', 'update', 'delete', 'rollback'
  previousData: jsonb("previous_data"), // Previous configuration state
  newData: jsonb("new_data").notNull(), // New configuration state
  changedBy: integer("changed_by").references(() => users.id).notNull(),
  changeDescription: text("change_description"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Configuration Delegation - Superadmin delegation to other roles
export const configurationDelegations = pgTable("configuration_delegations", {
  id: serial("id").primaryKey(),
  delegatedBy: integer("delegated_by").references(() => users.id).notNull(),
  delegatedTo: integer("delegated_to").references(() => users.id).notNull(),
  configurationAspects: jsonb("configuration_aspects").notNull(), // Array of config paths they can modify
  permissions: jsonb("permissions").notNull(), // {read: true, write: true, admin: false}
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert Schemas for Configuration Management
export const insertAdminConfigurationSchema = createInsertSchema(adminConfigurations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertConfigurationHistorySchema = createInsertSchema(configurationHistory).omit({
  id: true,
  createdAt: true,
});

export const insertConfigurationDelegationSchema = createInsertSchema(configurationDelegations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Configuration Types
export type AdminConfiguration = typeof adminConfigurations.$inferSelect;
export type InsertAdminConfiguration = z.infer<typeof insertAdminConfigurationSchema>;

export type ConfigurationHistory = typeof configurationHistory.$inferSelect;
export type InsertConfigurationHistory = z.infer<typeof insertConfigurationHistorySchema>;

export type ConfigurationDelegation = typeof configurationDelegations.$inferSelect;
export type InsertConfigurationDelegation = z.infer<typeof insertConfigurationDelegationSchema>;

export const insertRevenueGoalSchema = createInsertSchema(revenueGoals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastCalculated: true,
});

export const insertRevenueForecastSchema = createInsertSchema(revenueForecasts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMarketTrendSchema = createInsertSchema(marketTrends).omit({
  id: true,
  lastUpdated: true,
  createdAt: true,
});

export const insertRevenueOptimizationSchema = createInsertSchema(revenueOptimizations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Revenue Analytics Types
export type RevenueStream = typeof revenueStreams.$inferSelect;
export type InsertRevenueStream = z.infer<typeof insertRevenueStreamSchema>;

export type RevenueGoal = typeof revenueGoals.$inferSelect;
export type InsertRevenueGoal = z.infer<typeof insertRevenueGoalSchema>;

export type RevenueForecast = typeof revenueForecasts.$inferSelect;
export type InsertRevenueForecast = z.infer<typeof insertRevenueForecastSchema>;

export type MarketTrend = typeof marketTrends.$inferSelect;
export type InsertMarketTrend = z.infer<typeof insertMarketTrendSchema>;

export type RevenueOptimization = typeof revenueOptimizations.$inferSelect;
export type InsertRevenueOptimization = z.infer<typeof insertRevenueOptimizationSchema>;



// Assignment management tables
export const adminAssignments = pgTable("admin_assignments", {
  id: serial("id").primaryKey(),
  adminUserId: integer("admin_user_id").references(() => users.id).notNull(),
  managedUserId: integer("managed_user_id").references(() => users.id).notNull(),
  assignedByUserId: integer("assigned_by_user_id").references(() => users.id).notNull(),
  isActive: boolean("is_active").default(true),
  assignedAt: timestamp("assigned_at").defaultNow(),
  notes: text("notes"),
});

// Legacy booking assignments table (kept for backward compatibility)
export const bookingAssignments = pgTable("booking_assignments", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").references(() => bookings.id).notNull(),
  assignedUserId: integer("assigned_user_id").references(() => users.id).notNull(),
  assignmentRole: text("assignment_role").notNull(), // 'musician', 'professional', 'technician', etc.
  assignedByUserId: integer("assigned_by_user_id").references(() => users.id).notNull(),
  isActive: boolean("is_active").default(true),
  assignedAt: timestamp("assigned_at").defaultNow(),
  notes: text("notes"),
});

export const artistMusicianAssignments = pgTable("artist_musician_assignments", {
  id: serial("id").primaryKey(),
  artistUserId: integer("artist_user_id").references(() => users.id).notNull(),
  musicianUserId: integer("musician_user_id").references(() => users.id).notNull(),
  assignedByUserId: integer("assigned_by_user_id").references(() => users.id).notNull(),
  assignmentType: text("assignment_type").default("collaboration"), // 'collaboration', 'tour', 'session'
  isActive: boolean("is_active").default(true),
  assignedAt: timestamp("assigned_at").defaultNow(),
  notes: text("notes"),
});

// Booking Media Assignment Tables
export const bookingMediaFiles = pgTable("booking_media_files", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").references(() => bookings.id).notNull(),
  uploadedByUserId: integer("uploaded_by_user_id").references(() => users.id).notNull(),
  fileName: text("file_name").notNull(),
  originalFileName: text("original_file_name").notNull(),
  filePath: text("file_path").notNull(),
  fileUrl: text("file_url").notNull(),
  fileType: text("file_type").notNull(), // 'document', 'graphics', 'video'
  mimeType: text("mime_type").notNull(),
  fileSize: integer("file_size").notNull(), // in bytes
  description: text("description"),
  isActive: boolean("is_active").default(true),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

export const bookingMediaAccess = pgTable("booking_media_access", {
  id: serial("id").primaryKey(),
  mediaFileId: integer("media_file_id").references(() => bookingMediaFiles.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  accessLevel: text("access_level").notNull(), // 'view', 'download', 'edit'
  grantedByUserId: integer("granted_by_user_id").references(() => users.id).notNull(),
  isActive: boolean("is_active").default(true),
  grantedAt: timestamp("granted_at").defaultNow(),
  expiresAt: timestamp("expires_at"), // optional expiration
  lastAccessedAt: timestamp("last_accessed_at"),
});

export const bookingMediaCategories = pgTable("booking_media_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  fileTypes: jsonb("file_types").notNull(), // Array of allowed file types
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Instrument and enhanced assignment schema exports already defined above

// Assignment schema exports
export const insertAdminAssignmentSchema = createInsertSchema(adminAssignments).omit({
  id: true,
  assignedAt: true,
});

export const insertBookingAssignmentSchema = createInsertSchema(bookingAssignments).omit({
  id: true,
  assignedAt: true,
});

export const insertArtistMusicianAssignmentSchema = createInsertSchema(artistMusicianAssignments).omit({
  id: true,
  assignedAt: true,
});

// Booking Media Assignment schemas
export const insertBookingMediaFileSchema = createInsertSchema(bookingMediaFiles).omit({
  id: true,
  uploadedAt: true,
});

export const insertBookingMediaAccessSchema = createInsertSchema(bookingMediaAccess).omit({
  id: true,
  grantedAt: true,
  lastAccessedAt: true,
});

export const insertBookingMediaCategorySchema = createInsertSchema(bookingMediaCategories).omit({
  id: true,
  createdAt: true,
});

// Instrument and enhanced assignment types  
export type AllInstrument = typeof allInstruments.$inferSelect;
export type InsertAllInstrument = z.infer<typeof insertAllInstrumentsSchema>;

export type BookingAssignmentsMember = typeof bookingAssignmentsMembers.$inferSelect;
export type InsertBookingAssignmentsMember = z.infer<typeof insertBookingAssignmentsMembersSchema>;

// Assignment types
export type AdminAssignment = typeof adminAssignments.$inferSelect;
export type InsertAdminAssignment = z.infer<typeof insertAdminAssignmentSchema>;

export type BookingAssignment = typeof bookingAssignments.$inferSelect;
export type InsertBookingAssignment = z.infer<typeof insertBookingAssignmentSchema>;

export type ArtistMusicianAssignment = typeof artistMusicianAssignments.$inferSelect;
export type InsertArtistMusicianAssignment = z.infer<typeof insertArtistMusicianAssignmentSchema>;

// Booking Media Assignment types
export type BookingMediaFile = typeof bookingMediaFiles.$inferSelect;
export type InsertBookingMediaFile = z.infer<typeof insertBookingMediaFileSchema>;

export type BookingMediaAccess = typeof bookingMediaAccess.$inferSelect;
export type InsertBookingMediaAccess = z.infer<typeof insertBookingMediaAccessSchema>;

export type BookingMediaCategory = typeof bookingMediaCategories.$inferSelect;
export type InsertBookingMediaCategory = z.infer<typeof insertBookingMediaCategorySchema>;

// Website Integration (All-Links) Tables
export const websiteIntegrations = pgTable("website_integrations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  slug: text("slug").notNull().unique(),
  title: text("title"),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  accessLevel: text("access_level").default("public"), // 'public', 'private', 'unlisted'
  socialLinks: jsonb("social_links").default([]), // Array of {title, url, icon}
  musicLinks: jsonb("music_links").default([]), // Array of {title, url, icon}
  bookingLinks: jsonb("booking_links").default([]), // Array of {title, url, icon}
  storeLinks: jsonb("store_links").default([]), // Array of {title, url, icon}
  customLinks: jsonb("custom_links").default([]), // Array of {title, url, icon}
  customTheme: jsonb("custom_theme"), // Theme customization settings
  enabledWidgets: jsonb("enabled_widgets").default({}), // Object mapping widget key to boolean enabled state
  widgetUrls: jsonb("widget_urls").default({}), // Object mapping widget key to target URL
  viewCount: integer("view_count").default(0),
  lastViewed: timestamp("last_viewed"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertWebsiteIntegrationSchema = createInsertSchema(websiteIntegrations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  viewCount: true,
  lastViewed: true,
});

// All-Links Subscription Tables for tiered access control
export const allLinksSubscriptions = pgTable("all_links_subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  tierLevel: integer("tier_level").notNull(), // 1 = $4.99, 2 = $9.99
  isActive: boolean("is_active").default(true),
  stripeSubscriptionId: text("stripe_subscription_id"),
  stripeCustomerId: text("stripe_customer_id"),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  canceledAt: timestamp("canceled_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const websiteBlocklist = pgTable("website_blocklist", {
  id: serial("id").primaryKey(),
  domain: text("domain").notNull().unique(),
  reason: text("reason").notNull(),
  severity: text("severity").notNull(), // malware, phishing, adult, illegal
  detectedAt: timestamp("detected_at").defaultNow(),
  isActive: boolean("is_active").default(true),
});

export const allLinksPenalties = pgTable("all_links_penalties", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  websiteIntegrationId: integer("website_integration_id").references(() => websiteIntegrations.id),
  blockedUrl: text("blocked_url").notNull(),
  reason: text("reason").notNull(),
  penaltyAmount: decimal("penalty_amount", { precision: 10, scale: 2 }).notNull(),
  isActive: boolean("is_active").default(true),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// OAuth integration for embedded widgets
export const oauthAccounts = pgTable("oauth_accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  provider: text("provider").notNull(), // waitumusic
  providerAccountId: text("provider_account_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  expiresAt: timestamp("expires_at"),
  scope: text("scope"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Fan engagement tracking
export const fanSubscriptions = pgTable("fan_subscriptions", {
  id: serial("id").primaryKey(),
  fanUserId: integer("fan_user_id").references(() => users.id).notNull(),
  artistUserId: integer("artist_user_id").references(() => users.id).notNull(),
  subscriptionType: text("subscription_type").notNull(), // purchase, newsletter, booking
  sourceType: text("source_type").notNull(), // embedded_widget, all_links_page, direct
  sourceUrl: text("source_url"), // The website where the interaction happened
  purchaseData: jsonb("purchase_data"), // Details about what was purchased
  subscriptionDate: timestamp("subscription_date").defaultNow(),
});

// Enhanced website integrations with embeddable widgets
export const websiteIntegrationsEmbedded = pgTable("website_integrations_embedded", {
  id: serial("id").primaryKey(),
  websiteIntegrationId: integer("website_integration_id").references(() => websiteIntegrations.id).notNull(),
  embeddableWidgets: jsonb("embeddable_widgets"), // Widget configuration
  seoSettings: jsonb("seo_settings"), // SEO metadata
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas for new tables
export const insertAllLinksSubscriptionSchema = createInsertSchema(allLinksSubscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWebsiteBlocklistSchema = createInsertSchema(websiteBlocklist).omit({
  id: true,
  detectedAt: true,
});

export const insertAllLinksPenaltySchema = createInsertSchema(allLinksPenalties).omit({
  id: true,
  createdAt: true,
});

export const insertOauthAccountSchema = createInsertSchema(oauthAccounts).omit({
  id: true,
  createdAt: true,
});

export const insertFanSubscriptionSchema = createInsertSchema(fanSubscriptions).omit({
  id: true,
  subscriptionDate: true,
});

export const insertWebsiteIntegrationsEmbeddedSchema = createInsertSchema(websiteIntegrationsEmbedded).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Type exports
export type WebsiteIntegration = typeof websiteIntegrations.$inferSelect;
export type InsertWebsiteIntegration = z.infer<typeof insertWebsiteIntegrationSchema>;

export type AllLinksSubscription = typeof allLinksSubscriptions.$inferSelect;
export type InsertAllLinksSubscription = z.infer<typeof insertAllLinksSubscriptionSchema>;

export type WebsiteBlocklist = typeof websiteBlocklist.$inferSelect;
export type InsertWebsiteBlocklist = z.infer<typeof insertWebsiteBlocklistSchema>;

export type AllLinksPenalty = typeof allLinksPenalties.$inferSelect;
export type InsertAllLinksPenalty = z.infer<typeof insertAllLinksPenaltySchema>;

export type OauthAccount = typeof oauthAccounts.$inferSelect;
export type InsertOauthAccount = z.infer<typeof insertOauthAccountSchema>;

export type FanSubscription = typeof fanSubscriptions.$inferSelect;
export type InsertFanSubscription = z.infer<typeof insertFanSubscriptionSchema>;

export type WebsiteIntegrationsEmbedded = typeof websiteIntegrationsEmbedded.$inferSelect;
export type InsertWebsiteIntegrationsEmbedded = z.infer<typeof insertWebsiteIntegrationsEmbeddedSchema>;

// Release contract types
export type ReleaseContract = typeof releaseContracts.$inferSelect;
export type InsertReleaseContract = z.infer<typeof insertReleaseContractSchema>;

export type ReleaseContractSignature = typeof releaseContractSignatures.$inferSelect;
export type InsertReleaseContractSignature = z.infer<typeof insertReleaseContractSignatureSchema>;

export type ManagementTransition = typeof managementTransitions.$inferSelect;
export type InsertManagementTransition = z.infer<typeof insertManagementTransitionSchema>;

// Management application types
export type ManagementApplication = typeof managementApplications.$inferSelect;
export type InsertManagementApplication = z.infer<typeof insertManagementApplicationSchema>;

export type ManagementApplicationSignature = typeof managementApplicationSignatures.$inferSelect;
export type InsertManagementApplicationSignature = z.infer<typeof insertManagementApplicationSignatureSchema>;

export type ServiceDiscountOverride = typeof serviceDiscountOverrides.$inferSelect;
export type InsertServiceDiscountOverride = z.infer<typeof insertServiceDiscountOverrideSchema>;

export type ManagementApplicationReview = typeof managementApplicationReviews.$inferSelect;
export type InsertManagementApplicationReview = z.infer<typeof insertManagementApplicationReviewSchema>;

export type LegalAssignment = typeof legalAssignments.$inferSelect;
export type InsertLegalAssignment = z.infer<typeof insertLegalAssignmentSchema>;

export type ApplicationLegalAssignment = typeof applicationLegalAssignments.$inferSelect;
export type InsertApplicationLegalAssignment = z.infer<typeof insertApplicationLegalAssignmentSchema>;

export type Video = typeof videos.$inferSelect;
export type InsertVideo = z.infer<typeof insertVideoSchema>;

export type GlobalGenre = typeof globalGenres.$inferSelect;
export type InsertGlobalGenre = z.infer<typeof insertGlobalGenreSchema>;

export type PRORegistration = typeof proRegistrations.$inferSelect;
export type InsertPRORegistration = z.infer<typeof insertPRORegistrationSchema>;

export type PROWork = typeof proWorks.$inferSelect;
export type InsertPROWork = z.infer<typeof insertPROWorkSchema>;

export type PROEligibilityAssessment = typeof proEligibilityAssessments.$inferSelect;
export type InsertPROEligibilityAssessment = z.infer<typeof insertPROEligibilityAssessmentSchema>;

export type CrossUpsellRelationship = typeof crossUpsellRelationships.$inferSelect;
export type InsertCrossUpsellRelationship = z.infer<typeof insertCrossUpsellRelationshipSchema>;

// Recommendation system types
export type UserInteraction = typeof userInteractions.$inferSelect;
export type InsertUserInteraction = z.infer<typeof insertUserInteractionSchema>;

export type UserPreferences = typeof userPreferences.$inferSelect;
export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;

export type MusicRecommendation = typeof musicRecommendations.$inferSelect;
export type InsertMusicRecommendation = z.infer<typeof insertMusicRecommendationSchema>;

export type ArtistSimilarity = typeof artistSimilarities.$inferSelect;
export type InsertArtistSimilarity = z.infer<typeof insertArtistSimilaritySchema>;

export type TrendingMetric = typeof trendingMetrics.$inferSelect;
export type InsertTrendingMetric = z.infer<typeof insertTrendingMetricSchema>;

export type CrossPromotionCampaign = typeof crossPromotionCampaigns.$inferSelect;
export type InsertCrossPromotionCampaign = z.infer<typeof insertCrossPromotionCampaignSchema>;

// Contract and payment types
export type TechnicalRider = typeof technicalRiders.$inferSelect;
export type InsertTechnicalRider = z.infer<typeof insertTechnicalRiderSchema>;

export type ContractSignature = typeof contractSignatures.$inferSelect;
export type InsertContractSignature = z.infer<typeof insertContractSignatureSchema>;

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

export type Receipt = typeof receipts.$inferSelect;
export type InsertReceipt = z.infer<typeof insertReceiptSchema>;

// Financial automation schemas
export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  generatedAt: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPayoutRequestSchema = createInsertSchema(payoutRequests).omit({
  id: true,
  generatedAt: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDocumentLinkageSchema = createInsertSchema(documentLinkages).omit({
  id: true,
  createdAt: true,
});

export const insertPaymentTransactionSchema = createInsertSchema(paymentTransactions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFinancialAuditLogSchema = createInsertSchema(financialAuditLog).omit({
  id: true,
  timestamp: true,
});



// Financial automation types
export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;

export type PayoutRequest = typeof payoutRequests.$inferSelect;
export type InsertPayoutRequest = z.infer<typeof insertPayoutRequestSchema>;

export type DocumentLinkage = typeof documentLinkages.$inferSelect;
export type InsertDocumentLinkage = z.infer<typeof insertDocumentLinkageSchema>;

export type PaymentTransaction = typeof paymentTransactions.$inferSelect;
export type InsertPaymentTransaction = z.infer<typeof insertPaymentTransactionSchema>;

// User Favorites types
export type UserFavorite = typeof userFavorites.$inferSelect;
export type InsertUserFavorite = z.infer<typeof insertUserFavoriteSchema>;

export type FinancialAuditLog = typeof financialAuditLog.$inferSelect;
export type InsertFinancialAuditLog = z.infer<typeof insertFinancialAuditLogSchema>;



// Relations
// export const usersRelations = relations(users, ({ one, many }) => ({
//   role: one(roles, { fields: [users.roleId], references: [roles.id] }),
//   artist: one(artists, { fields: [users.id], references: [artists.userId] }),
//   musician: one(musicians, { fields: [users.id], references: [musicians.userId] }),
//   professional: one(professionals, { fields: [users.id], references: [professionals.userId] }),
//   songs: many(songs),
//   albums: many(albums),
//   merchandise: many(merchandise),
//   bookingsAsBooker: many(bookings, { relationName: "bookerBookings" }),
//   bookingsAsArtist: many(bookings, { relationName: "artistBookings" }),
//   // Normalized user data relations
//   secondaryRoles: many(userSecondaryRoles),
//   socialLinks: many(userSocialLinks),
//   stageNames: many(userStageNames),
//   genres: many(userGenres),
//   skillsAndInstruments: many(userSkillsAndInstruments),
//   specializations: many(userSpecializations),
//   technicalRequirements: many(userTechnicalRequirements),
//   hospitalityRequirements: many(userHospitalityRequirements),
//   performanceSpecs: many(userPerformanceSpecs),
//   availability: many(userAvailability),
// }));

export const usersRelations = relations(users, ({ many, one }) => ({
  artist: one(artists, { fields: [users.id], references: [artists.userId] }),
  musician: one(musicians, { fields: [users.id], references: [musicians.userId] }),
  professional: one(professionals, { fields: [users.id], references: [professionals.userId] }),
  songs: many(songs),
  albums: many(albums),
  merchandise: many(merchandise),
  bookingsAsBooker: many(bookings, { relationName: "bookerBookings" }),
  bookingsAsArtist: many(bookings, { relationName: "artistBookings" }),

  // নতুন Many-to-Many relation
  roles: many(userRoles),  

  // Normalized user data relations
  secondaryRoles: many(userSecondaryRoles),
  socialLinks: many(userSocialLinks),
  stageNames: many(userStageNames),
  genres: many(userGenres),
  skillsAndInstruments: many(userSkillsAndInstruments),
  specializations: many(userSpecializations),
  technicalRequirements: many(userTechnicalRequirements),
  hospitalityRequirements: many(userHospitalityRequirements),
  performanceSpecs: many(userPerformanceSpecs),
  availability: many(userAvailability),
}));


export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, { fields: [userRoles.userId], references: [users.id] }),
  role: one(rolesManagement, { fields: [userRoles.roleId], references: [rolesManagement.id] }),
}));


// Add relations for normalized user data tables
export const userSecondaryRolesRelations = relations(userSecondaryRoles, ({ one }) => ({
  user: one(users, { fields: [userSecondaryRoles.userId], references: [users.id] }),
  role: one(roles, { fields: [userSecondaryRoles.roleId], references: [roles.id] }),
}));

export const userSocialLinksRelations = relations(userSocialLinks, ({ one }) => ({
  user: one(users, { fields: [userSocialLinks.userId], references: [users.id] }),
}));

export const userStageNamesRelations = relations(userStageNames, ({ one }) => ({
  user: one(users, { fields: [userStageNames.userId], references: [users.id] }),
}));

export const userGenresRelations = relations(userGenres, ({ one }) => ({
  user: one(users, { fields: [userGenres.userId], references: [users.id] }),
}));

export const userSkillsAndInstrumentsRelations = relations(userSkillsAndInstruments, ({ one }) => ({
  user: one(users, { fields: [userSkillsAndInstruments.userId], references: [users.id] }),
}));

export const userSpecializationsRelations = relations(userSpecializations, ({ one }) => ({
  user: one(users, { fields: [userSpecializations.userId], references: [users.id] }),
}));

export const userTechnicalRequirementsRelations = relations(userTechnicalRequirements, ({ one }) => ({
  user: one(users, { fields: [userTechnicalRequirements.userId], references: [users.id] }),
}));

export const userHospitalityRequirementsRelations = relations(userHospitalityRequirements, ({ one }) => ({
  user: one(users, { fields: [userHospitalityRequirements.userId], references: [users.id] }),
}));

export const userPerformanceSpecsRelations = relations(userPerformanceSpecs, ({ one }) => ({
  user: one(users, { fields: [userPerformanceSpecs.userId], references: [users.id] }),
}));

export const userAvailabilityRelations = relations(userAvailability, ({ one }) => ({
  user: one(users, { fields: [userAvailability.userId], references: [users.id] }),
}));

export const artistsRelations = relations(artists, ({ one, many }) => ({
  user: one(users, { fields: [artists.userId], references: [users.id] }),
  managementTier: one(managementTiers, { fields: [artists.managementTierId], references: [managementTiers.id] }),
  songs: many(songs),
  albums: many(albums),
  merchandise: many(merchandise),
}));

export const songsRelations = relations(songs, ({ one, many }) => ({
  artist: one(users, { fields: [songs.artistUserId], references: [users.id] }),
  albumSongs: many(albumSongs),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  booker: one(users, { fields: [bookings.bookerUserId], references: [users.id], relationName: "bookerBookings" }),
  primaryArtist: one(users, { fields: [bookings.primaryArtistUserId], references: [users.id], relationName: "artistBookings" }),
  dates: many(bookingDates),
  musicians: many(bookingMusicians),
  documents: many(bookingDocuments),
  assignmentMembers: many(bookingAssignmentsMembers),
}));

// Enhanced assignment relations
export const allInstrumentsRelations = relations(allInstruments, ({ many }) => ({
  assignmentMembers: many(bookingAssignmentsMembers),
}));

export const bookingAssignmentsMembersRelations = relations(bookingAssignmentsMembers, ({ one }) => ({
  booking: one(bookings, { fields: [bookingAssignmentsMembers.bookingId], references: [bookings.id] }),
  user: one(users, { fields: [bookingAssignmentsMembers.userId], references: [users.id] }),
  role: one(roles, { fields: [bookingAssignmentsMembers.roleInBooking], references: [roles.id] }),
  assignedByUser: one(users, { fields: [bookingAssignmentsMembers.assignedBy], references: [users.id] }),
  instrument: one(allInstruments, { fields: [bookingAssignmentsMembers.selectedTalent], references: [allInstruments.id] }),
}));

// Recommendation system relations
export const userInteractionsRelations = relations(userInteractions, ({ one }) => ({
  user: one(users, { fields: [userInteractions.userId], references: [users.id] }),
  song: one(songs, { fields: [userInteractions.songId], references: [songs.id] }),
  artist: one(users, { fields: [userInteractions.artistId], references: [users.id] }),
  album: one(albums, { fields: [userInteractions.albumId], references: [albums.id] }),
}));

export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, { fields: [userPreferences.userId], references: [users.id] }),
}));

export const musicRecommendationsRelations = relations(musicRecommendations, ({ one }) => ({
  user: one(users, { fields: [musicRecommendations.userId], references: [users.id] }),
  song: one(songs, { fields: [musicRecommendations.songId], references: [songs.id] }),
  artist: one(users, { fields: [musicRecommendations.artistId], references: [users.id] }),
  album: one(albums, { fields: [musicRecommendations.albumId], references: [albums.id] }),
}));

export const artistSimilaritiesRelations = relations(artistSimilarities, ({ one }) => ({
  artist1: one(users, { fields: [artistSimilarities.artistId1], references: [users.id] }),
  artist2: one(users, { fields: [artistSimilarities.artistId2], references: [users.id] }),
}));

export const trendingMetricsRelations = relations(trendingMetrics, ({ one }) => ({
  song: one(songs, { fields: [trendingMetrics.songId], references: [songs.id] }),
  artist: one(users, { fields: [trendingMetrics.artistId], references: [users.id] }),
  album: one(albums, { fields: [trendingMetrics.albumId], references: [albums.id] }),
}));

export const crossPromotionCampaignsRelations = relations(crossPromotionCampaigns, ({ one }) => ({
  promotingArtist: one(users, { fields: [crossPromotionCampaigns.promotingArtistId], references: [users.id] }),
  promotedArtist: one(users, { fields: [crossPromotionCampaigns.promotedArtistId], references: [users.id] }),
}));

// Stage Plot Designer Tables
export const stagePlots = pgTable('stage_plots', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  items: jsonb('items').notNull(), // Array of stage items with positions, types, etc.
  stageWidth: integer('stage_width').notNull().default(800),
  stageHeight: integer('stage_height').notNull().default(600),
  bookingId: integer('booking_id').references(() => bookings.id),
  createdBy: integer('created_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  modifiedAt: timestamp('modified_at').defaultNow().notNull(),
});

// Mixer Patch List Tables
export const mixerPatchLists = pgTable('mixer_patch_lists', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  rows: jsonb('rows').notNull(), // Array of mixer patch rows
  bookingId: integer('booking_id').references(() => bookings.id),
  createdBy: integer('created_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  modifiedAt: timestamp('modified_at').defaultNow().notNull(),
});

// Setlist Templates Tables
export const setlistTemplates = pgTable('setlist_templates', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  songs: jsonb('songs').notNull(), // Array of setlist songs
  totalDuration: integer('total_duration'), // in seconds
  createdBy: integer('created_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  modifiedAt: timestamp('modified_at').defaultNow().notNull(),
});

// Videos table for YouTube embedding - Enhanced for managed users
export const videos = pgTable('videos', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  videoUrl: varchar('video_url', { length: 500 }).notNull(), // Full YouTube URL
  youtubeVideoId: varchar('youtube_video_id', { length: 50}), // Extracted video ID for embedding
  thumbnailUrl: varchar('thumbnail_url', { length: 500 }),
  uploadedByUserId: integer('uploaded_by_user_id').references(() => users.id),
  isPublic: boolean('is_public').default(true),
  videoType: varchar('video_type', { length: 50 }).default('youtube'), // youtube, vimeo, direct
  embedCode: text('embed_code'), // Generated embed HTML
  playlistId: varchar('playlist_id', { length: 100}), // For YouTube playlist support
  duration: integer('duration'), // Duration in seconds
  viewCount: integer('view_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const stagePlotsRelations = relations(stagePlots, ({ one }) => ({
  booking: one(bookings, { fields: [stagePlots.bookingId], references: [bookings.id] }),
  creator: one(users, { fields: [stagePlots.createdBy], references: [users.id] }),
}));

export const mixerPatchListsRelations = relations(mixerPatchLists, ({ one }) => ({
  booking: one(bookings, { fields: [mixerPatchLists.bookingId], references: [bookings.id] }),
  creator: one(users, { fields: [mixerPatchLists.createdBy], references: [users.id] }),
}));

export const setlistTemplatesRelations = relations(setlistTemplates, ({ one }) => ({
  creator: one(users, { fields: [setlistTemplates.createdBy], references: [users.id] }),
}));

export const videosRelations = relations(videos, ({ one }) => ({
  uploader: one(users, { fields: [videos.uploadedByUserId], references: [users.id] }),
}));

export const insertVideoSchema = createInsertSchema(videos).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// User Favorites Table
export const userFavorites = pgTable('user_favorites', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  favoriteUserId: integer('favorite_user_id').notNull().references(() => users.id),
  favoriteType: varchar('favorite_type', { length: 50 }).notNull().default('artist'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const userFavoritesRelations = relations(userFavorites, ({ one }) => ({
  user: one(users, { fields: [userFavorites.userId], references: [users.id] }),
  favoriteUser: one(users, { fields: [userFavorites.favoriteUserId], references: [users.id] }),
}));

export const insertUserFavoriteSchema = createInsertSchema(userFavorites).omit({
  id: true,
  createdAt: true,
});

// ISRC Song Coding Service Tables
export const isrcCodes = pgTable('isrc_codes', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  artistId: integer('artist_id').notNull(), // NN identifier (00=Lí-Lí Octave, 04=Princess Trinidad, etc.)
  songTitle: varchar('song_title', { length: 255 }).notNull(),
  isrcCode: varchar('isrc_code', { length: 15 }).notNull().unique(), // DM-A0D-YY-NN-XXX format
  codeType: varchar('code_type', { length: 20 }).notNull().default('release'), // 'release', 'remix', 'video'
  status: varchar('status', { length: 20 }).default('pending'), // 'pending', 'completed', 'rejected'
  basePrice: decimal('base_price', { precision: 8, scale: 2 }).default("25.00"),
  finalPrice: decimal('final_price', { precision: 8, scale: 2 }).default("25.00"),
  paymentStatus: varchar('payment_status', { length: 20 }).default('pending'), // 'pending', 'paid', 'refunded'
  paymentDate: timestamp('payment_date'),
  stripePaymentIntentId: text('stripe_payment_intent_id'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const songSubmissions = pgTable('song_submissions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  artistId: integer('artist_id').notNull(),
  songTitle: varchar('song_title', { length: 255 }).notNull(),
  songReference: varchar('song_reference', { length: 50 }).notNull(),
  audioFileUrl: text('audio_file_url').notNull(),
  coverArtUrl: text('cover_art_url').notNull(),
  format: varchar('format', { length: 10 }).notNull(), // 'WAV', 'MP3'
  bitrate: integer('bitrate'), // 320+ for MP3
  sampleRate: integer('sample_rate'), // 48kHz for video
  isrcCode: varchar('isrc_code', { length: 12 }),
  submissionType: varchar('submission_type', { length: 20 }).notNull(), // 'release', 'remix', 'video'
  coverArtStatus: varchar('cover_art_status', { length: 20 }).default('pending'), // 'pending', 'approved', 'rejected'
  coverArtValidation: jsonb('cover_art_validation'),
  metadataEmbedded: boolean('metadata_embedded').default(false),
  status: varchar('status', { length: 20 }).default('pending'),
  totalCost: decimal('total_cost', { precision: 10, scale: 2 }),
  discount: decimal('discount', { precision: 5, scale: 2 }).default('0'),
  finalCost: decimal('final_cost', { precision: 10, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});



// Splitsheet signatures with digital signature capability
export const splitsheetSignatures = pgTable('splitsheet_signatures', {
  id: serial('id').primaryKey(),
  splitsheetId: integer('splitsheet_id').notNull(),
  signerEmail: varchar('signer_email', { length: 255 }).notNull(),
  signerName: varchar('signer_name', { length: 255 }).notNull(),
  signerRole: varchar('signer_role', { length: 100 }).notNull(), // 'composer', 'recording_artist', 'label', 'publisher'
  ipiNumber: varchar('ipi_number', { length: 20 }),
  userId: integer('user_id'), // If signer has Wai'tuMusic account
  signatureImageUrl: text('signature_image_url'), // Uploaded PNG signature
  signedAt: timestamp('signed_at'),
  isVerified: boolean('is_verified').default(false),
  percentageOwnership: decimal('percentage_ownership', { precision: 5, scale: 2 }),
  ownershipType: varchar('ownership_type', { length: 20 }), // 'lyrics', 'music', 'publishing'
  notificationSent: boolean('notification_sent').default(false),
  accessToken: varchar('access_token', { length: 100 }).unique(), // For non-users to access splitsheet
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Splitsheet notifications and alerts
export const splitsheetNotifications = pgTable('splitsheet_notifications', {
  id: serial('id').primaryKey(),
  splitsheetId: integer('splitsheet_id').notNull(),
  recipientEmail: varchar('recipient_email', { length: 255 }).notNull(),
  recipientName: varchar('recipient_name', { length: 255 }).notNull(),
  notificationType: varchar('notification_type', { length: 50 }).notNull(), // 'sign_request', 'verify_request', 'completion'
  status: varchar('status', { length: 20 }).default('pending'), // 'pending', 'sent', 'opened', 'completed'
  accessToken: varchar('access_token', { length: 100 }),
  sentAt: timestamp('sent_at'),
  openedAt: timestamp('opened_at'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow()
});

// Enhanced splitsheet system with user assignment and automatic data population
export const enhancedSplitsheets = pgTable('enhanced_splitsheets', {
  id: serial('id').primaryKey(),
  songTitle: varchar('song_title', { length: 255 }).notNull(),
  songReference: varchar('song_reference', { length: 50 }).notNull(),
  agreementDate: timestamp('agreement_date'),
  
  // Work registration and coding
  workId: varchar('work_id', { length: 50 }), // PRO-issued work ID
  upcEan: varchar('upc_ean', { length: 20 }), // UPC/EAN from distributor
  
  // Audio file and ISRC integration
  audioFileUrl: text('audio_file_url'),
  originalFileName: varchar('original_file_name', { length: 255 }),
  fileSize: integer('file_size'), // in bytes
  fileDuration: decimal('file_duration', { precision: 8, scale: 2 }), // in seconds
  isrcCode: varchar('isrc_code', { length: 15 }), // Auto-generated DM-WTM-YY-XXXXX format
  metadataEmbedded: boolean('metadata_embedded').default(false),
  
  // Participants with role assignments
  participants: jsonb('participants').notNull(),
  
  // Status tracking
  status: varchar('status', { length: 20 }).default('draft'), // 'draft', 'pending_signatures', 'fully_signed', 'completed'
  allSigned: boolean('all_signed').default(false),
  signedCount: integer('signed_count').default(0),
  totalParticipants: integer('total_participants').default(0),
  
  // Payment and service integration
  serviceType: text('service_type').default('enhanced_splitsheet'),
  basePrice: decimal('base_price', { precision: 10, scale: 2 }).default('5.00'),
  discountPercentage: decimal('discount_percentage', { precision: 5, scale: 2 }).default('0.00'),
  finalPrice: decimal('final_price', { precision: 10, scale: 2 }).default('5.00'),
  paymentStatus: text('payment_status').default('pending'), // 'pending', 'paid', 'failed', 'free'
  isPaidFor: boolean('is_paid_for').default(false),
  canDownload: boolean('can_download').default(false),
  
  // Work percentage validation (composition + publishing = 100%)
  songwritingPercentageTotal: decimal('songwriting_percentage_total', { precision: 5, scale: 2 }).default('0'),
  melodyPercentageTotal: decimal('melody_percentage_total', { precision: 5, scale: 2 }).default('0'),
  beatProductionPercentageTotal: decimal('beat_production_percentage_total', { precision: 5, scale: 2 }).default('0'),
  publishingPercentageTotal: decimal('publishing_percentage_total', { precision: 5, scale: 2 }).default('0'), // Out of 200%
  executiveProducerPercentageTotal: decimal('executive_producer_percentage_total', { precision: 5, scale: 2 }).default('0'),
  
  // Management and tracking
  invoiceId: integer('invoice_id').references(() => invoices.id),
  createdBy: integer('created_by').notNull(),
  managementTierApplied: integer('management_tier_applied').references(() => managementTiers.id),
  notificationsSent: integer('notifications_sent').default(0),
  
  // Download tracking
  downloadCount: integer('download_count').default(0),
  lastDownloadAt: timestamp('last_download_at'),
  finalPdfUrl: text('final_pdf_url'),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Enhanced splitsheet notifications
export const enhancedSplitsheetNotifications = pgTable('enhanced_splitsheet_notifications', {
  id: serial('id').primaryKey(),
  enhancedSplitsheetId: integer('enhanced_splitsheet_id').notNull().references(() => enhancedSplitsheets.id),
  recipientEmail: varchar('recipient_email', { length: 255 }).notNull(),
  recipientName: varchar('recipient_name', { length: 255 }).notNull(),
  participantId: varchar('participant_id', { length: 100 }).notNull(), // Links to participant.id in JSONB
  notificationType: varchar('notification_type', { length: 50 }).notNull(), // 'signature_request', 'splitsheet_completed', 'payment_required'
  accessToken: varchar('access_token', { length: 100 }).unique(),
  emailSubject: text('email_subject'),
  emailBody: text('email_body'),
  emailSent: boolean('email_sent').default(false),
  sentAt: timestamp('sent_at'),
  opened: boolean('opened').default(false),
  openedAt: timestamp('opened_at'),
  responded: boolean('responded').default(false),
  respondedAt: timestamp('responded_at'),
  createdAt: timestamp('created_at').defaultNow()
});

// Audio file metadata for ISRC coding
export const audioFileMetadata = pgTable('audio_file_metadata', {
  id: serial('id').primaryKey(),
  enhancedSplitsheetId: integer('enhanced_splitsheet_id').notNull().references(() => enhancedSplitsheets.id),
  originalFileName: varchar('original_file_name', { length: 255 }).notNull(),
  processedFileName: varchar('processed_file_name', { length: 255 }),
  fileType: varchar('file_type', { length: 10 }), // 'WAV', 'MP3'
  bitrate: varchar('bitrate', { length: 20 }), // '320kbps', etc.
  sampleRate: varchar('sample_rate', { length: 20 }), // '44.1kHz', etc.
  duration: decimal('duration', { precision: 8, scale: 2 }), // in seconds
  fileSize: integer('file_size'), // in bytes
  
  // ISRC coding data
  isrcCode: varchar('isrc_code', { length: 15 }).notNull(),
  isrcEmbedded: boolean('isrc_embedded').default(false),
  embeddedAt: timestamp('embedded_at'),
  
  // Metadata embedding
  title: varchar('title', { length: 255 }),
  artist: varchar('artist', { length: 255 }),
  album: varchar('album', { length: 255 }),
  year: varchar('year', { length: 4 }),
  genre: varchar('genre', { length: 100 }),
  publisher: varchar('publisher', { length: 255 }),
  
  // Processing status
  processingStatus: varchar('processing_status', { length: 50 }).default('pending'), // 'pending', 'processing', 'completed', 'failed'
  processingError: text('processing_error'),
  
  // Storage
  storageUrl: text('storage_url'),
  publicUrl: text('public_url'),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// DJ access management for setlist integration - access to SONGS with fully signed splitsheets
export const djSongAccess = pgTable('dj_song_access', {
  id: serial('id').primaryKey(),
  djUserId: integer('dj_user_id').notNull(),
  bookingId: integer('booking_id').notNull(),
  songId: integer('song_id').notNull(), // Links to songs table, not splitsheet directly
  splitsheetId: integer('splitsheet_id').notNull(),
  isFullySigned: boolean('is_fully_signed').default(false), // Only grant access when all parties have signed
  accessCode: varchar('access_code', { length: 20 }),
  accessGrantedAt: timestamp('access_granted_at'),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow()
});

export const artistCatalog = pgTable('artist_catalog', {
  id: serial('id').primaryKey(),
  artistId: integer('artist_id').notNull(),
  songId: integer('song_id'),
  submissionId: integer('submission_id'),
  songTitle: varchar('song_title', { length: 255 }).notNull(),
  isrcCode: varchar('isrc_code', { length: 12 }),
  audioFileUrl: text('audio_file_url'),
  vocalRemovedUrl: text('vocal_removed_url'), // For DJ setlists
  chordChartUrl: text('chord_chart_url'),
  setlistPosition: integer('setlist_position'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const isrcServicePricing = pgTable('isrc_service_pricing', {
  id: serial('id').primaryKey(),
  basePrice: decimal('base_price', { precision: 10, scale: 2 }).default('5.00'),
  publisherDiscount: decimal('publisher_discount', { precision: 5, scale: 2 }).default('10'), // 10%
  representationDiscount: decimal('representation_discount', { precision: 5, scale: 2 }).default('50'), // 50%
  fullManagementDiscount: decimal('full_management_discount', { precision: 5, scale: 2 }).default('100'), // 100% (free)
  coverArtValidationFee: decimal('cover_art_validation_fee', { precision: 10, scale: 2 }).default('2.00'),
  metadataEmbeddingFee: decimal('metadata_embedding_fee', { precision: 10, scale: 2 }).default('3.00'),
  updatedAt: timestamp('updated_at').defaultNow(),
  updatedBy: integer('updated_by')
});

// ISRC-related insert schemas (moved here after table definitions)
export const insertSongSubmissionSchema = createInsertSchema(songSubmissions).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertIsrcCodeSchema = createInsertSchema(isrcCodes).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertArtistCatalogSchema = createInsertSchema(artistCatalog).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertIsrcServicePricingSchema = createInsertSchema(isrcServicePricing).omit({
  id: true,
  updatedAt: true
});

export const insertDjSongAccessSchema = createInsertSchema(djSongAccess).omit({
  id: true,
  createdAt: true
});

// ISRC Types
export type SongSubmission = typeof songSubmissions.$inferSelect;
export type InsertSongSubmission = z.infer<typeof insertSongSubmissionSchema>;
// Commented out until splitsheets table is defined
// export type Splitsheet = typeof splitsheets.$inferSelect;
// export type InsertSplitsheet = z.infer<typeof insertSplitsheetSchema>;
// export type SplitsheetSignature = typeof splitsheetSignatures.$inferSelect;
// export type InsertSplitsheetSignature = z.infer<typeof insertSplitsheetSignatureSchema>;
// export type SplitsheetNotification = typeof splitsheetNotifications.$inferSelect;
// export type InsertSplitsheetNotification = z.infer<typeof insertSplitsheetNotificationSchema>;
export type DjSongAccess = typeof djSongAccess.$inferSelect;
export type InsertDjSongAccess = z.infer<typeof insertDjSongAccessSchema>;
export type IsrcCode = typeof isrcCodes.$inferSelect;
export type InsertIsrcCode = z.infer<typeof insertIsrcCodeSchema>;
export type ArtistCatalog = typeof artistCatalog.$inferSelect;
export type InsertArtistCatalog = z.infer<typeof insertArtistCatalogSchema>;
export type IsrcServicePricing = typeof isrcServicePricing.$inferSelect;
export type InsertIsrcServicePricing = z.infer<typeof insertIsrcServicePricingSchema>;

// Press Release insert schemas
export const insertPressReleaseSchema = createInsertSchema(pressReleases).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  publishedAt: true,
});

export const insertPressReleaseAssignmentSchema = createInsertSchema(pressReleaseAssignments).omit({
  id: true,
  assignedAt: true,
});

export const insertPressReleaseMediaSchema = createInsertSchema(pressReleaseMedia).omit({
  id: true,
  createdAt: true,
});

export const insertPressReleaseDistributionSchema = createInsertSchema(pressReleaseDistribution).omit({
  id: true,
  distributedAt: true,
  responseReceived: true,
});

export const insertPressReleaseAnalyticsSchema = createInsertSchema(pressReleaseAnalytics).omit({
  id: true,
  eventDate: true,
});

// Press Release Types
export type PressRelease = typeof pressReleases.$inferSelect;
export type InsertPressRelease = z.infer<typeof insertPressReleaseSchema>;
export type PressReleaseAssignment = typeof pressReleaseAssignments.$inferSelect;
export type InsertPressReleaseAssignment = z.infer<typeof insertPressReleaseAssignmentSchema>;
export type PressReleaseMedia = typeof pressReleaseMedia.$inferSelect;
export type InsertPressReleaseMedia = z.infer<typeof insertPressReleaseMediaSchema>;
export type PressReleaseDistribution = typeof pressReleaseDistribution.$inferSelect;
export type InsertPressReleaseDistribution = z.infer<typeof insertPressReleaseDistributionSchema>;
export type PressReleaseAnalytics = typeof pressReleaseAnalytics.$inferSelect;
export type InsertPressReleaseAnalytics = z.infer<typeof insertPressReleaseAnalyticsSchema>;

// Technical Rider and Booking Attachment Tables
export const technicalRiderStages = pgTable("technical_rider_stages", {
  id: serial("id").primaryKey(),
  booking_id: integer("booking_id").references(() => bookings.id),
  stage_name: varchar("stage_name", { length: 100 }).notNull(),
  stage_dimensions: jsonb("stage_dimensions").default({}),
  stage_layout: jsonb("stage_layout").default({}),
  equipment_positions: jsonb("equipment_positions").default([]),
  mixer_configuration: jsonb("mixer_configuration").default({}),
  setlist_data: jsonb("setlist_data").default([]),
  created_by: integer("created_by").references(() => users.id),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const bookingAttachments = pgTable("booking_attachments", {
  id: serial("id").primaryKey(),
  booking_id: integer("booking_id").references(() => bookings.id),
  file_name: varchar("file_name", { length: 255 }).notNull(),
  file_path: varchar("file_path", { length: 500 }).notNull(),
  file_type: varchar("file_type", { length: 100 }).notNull(),
  file_size: integer("file_size").notNull(),
  uploaded_by: integer("uploaded_by").references(() => users.id),
  upload_timestamp: timestamp("upload_timestamp").defaultNow(),
  clamav_scan_status: varchar("clamav_scan_status", { length: 20 }).default("pending"),
  clamav_scan_result: text("clamav_scan_result"),
  admin_approval_status: varchar("admin_approval_status", { length: 20 }).default("pending"),
  approved_by: integer("approved_by").references(() => users.id),
  approval_timestamp: timestamp("approval_timestamp"),
  shared_with: jsonb("shared_with").default([]),
  attachment_type: varchar("attachment_type", { length: 50 }),
  description: text("description"),
});

export const bookingMessages = pgTable("booking_messages", {
  id: serial("id").primaryKey(),
  booking_id: integer("booking_id").references(() => bookings.id),
  sender_user_id: integer("sender_user_id").references(() => users.id),
  message_text: text("message_text").notNull(),
  message_type: varchar("message_type", { length: 30 }).default("general"),
  is_internal: boolean("is_internal").default(false),
  created_at: timestamp("created_at").defaultNow(),
  document_path: varchar("document_path", { length: 500 }),
  read_by: jsonb("read_by").default([]),
});

// Insert schemas for new tables
export const insertTechnicalRiderStageSchema = createInsertSchema(technicalRiderStages).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertBookingAttachmentSchema = createInsertSchema(bookingAttachments).omit({
  id: true,
  upload_timestamp: true,
  approval_timestamp: true,
});

export const insertBookingMessageSchema = createInsertSchema(bookingMessages).omit({
  id: true,
  created_at: true,
});

// Types for new tables
export type TechnicalRiderStage = typeof technicalRiderStages.$inferSelect;
export type InsertTechnicalRiderStage = z.infer<typeof insertTechnicalRiderStageSchema>;

export type BookingAttachment = typeof bookingAttachments.$inferSelect;
export type InsertBookingAttachment = z.infer<typeof insertBookingAttachmentSchema>;

export type BookingMessage = typeof bookingMessages.$inferSelect;
export type InsertBookingMessage = z.infer<typeof insertBookingMessageSchema>;

// ComeSeeTv Integration Tables
export const comeSeeTvArtistPrograms = pgTable('comeseetv_artist_programs', {
  id: serial('id').primaryKey(),
  artist_id: integer('artist_id').references(() => artists.userId).notNull(),
  program_level: varchar('program_level', { length: 20 }).notNull(),
  monthly_stipend: decimal('monthly_stipend', { precision: 10, scale: 2 }).notNull(),
  marketing_support: decimal('marketing_support', { precision: 10, scale: 2 }).notNull(),
  tour_support: decimal('tour_support', { precision: 10, scale: 2 }).notNull(),
  recording_budget: decimal('recording_budget', { precision: 10, scale: 2 }).notNull(),
  guaranteed_bookings: integer('guaranteed_bookings').notNull(),
  us_market_access: boolean('us_market_access').default(true),
  international_expansion: boolean('international_expansion').default(false),
  enrollment_date: timestamp('enrollment_date').defaultNow(),
  is_active: boolean('is_active').default(true),
  total_earnings: decimal('total_earnings', { precision: 12, scale: 2 }).default('0.00'),
  bookings_completed: integer('bookings_completed').default(0),
});

export const comeSeeTvFinancialPackages = pgTable('comeseetv_financial_packages', {
  id: serial('id').primaryKey(),
  package_type: varchar('package_type', { length: 20 }).notNull(),
  investment_amount: decimal('investment_amount', { precision: 12, scale: 2 }).notNull(),
  revenue_share_percentage: decimal('revenue_share_percentage', { precision: 5, scale: 2 }).notNull(),
  marketing_budget: decimal('marketing_budget', { precision: 10, scale: 2 }).notNull(),
  legal_support: boolean('legal_support').default(true),
  distribution_channels: jsonb('distribution_channels').default([]),
  guaranteed_booking_value: decimal('guaranteed_booking_value', { precision: 12, scale: 2 }).notNull(),
  artist_development_fund: decimal('artist_development_fund', { precision: 12, scale: 2 }).notNull(),
  is_active: boolean('is_active').default(true),
  created_at: timestamp('created_at').defaultNow(),
});

// Insert schemas for ComeSeeTv tables
export const insertComeSeeTvArtistProgramSchema = createInsertSchema(comeSeeTvArtistPrograms).omit({
  id: true,
  enrollment_date: true,
});

export const insertComeSeeTvFinancialPackageSchema = createInsertSchema(comeSeeTvFinancialPackages).omit({
  id: true,
  created_at: true,
});

// Types for ComeSeeTv tables
export type ComeSeeTvArtistProgram = typeof comeSeeTvArtistPrograms.$inferSelect;
export type InsertComeSeeTvArtistProgram = z.infer<typeof insertComeSeeTvArtistProgramSchema>;

export type ComeSeeTvFinancialPackage = typeof comeSeeTvFinancialPackages.$inferSelect;
export type InsertComeSeeTvFinancialPackage = z.infer<typeof insertComeSeeTvFinancialPackageSchema>;

// ==================== RECIPIENT MANAGEMENT INSERT SCHEMAS & TYPES ====================

// Recipient Categories
export const insertRecipientCategorySchema = createInsertSchema(recipientCategories).omit({
  id: true,
  createdAt: true,
});

export const insertMusicGenreSchema = createInsertSchema(musicGenres).omit({
  id: true,
  createdAt: true,
});

export const insertIndustryRecipientSchema = createInsertSchema(industryRecipients).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  verifiedAt: true,
});

export const insertContentDistributionSchema = createInsertSchema(contentDistribution).omit({
  id: true,
  createdAt: true,
  sentAt: true,
  totalRecipients: true,
  totalSent: true,
  totalDelivered: true,
  totalOpened: true,
  totalClicked: true,
  totalResponded: true,
});

export const insertRecipientEngagementSchema = createInsertSchema(recipientEngagements).omit({
  id: true,
  createdAt: true,
  engagementDate: true,
});

// Types for Recipient Management
export type RecipientCategory = typeof recipientCategories.$inferSelect;
export type InsertRecipientCategory = z.infer<typeof insertRecipientCategorySchema>;

export type MusicGenre = typeof musicGenres.$inferSelect;
export type InsertMusicGenre = z.infer<typeof insertMusicGenreSchema>;

export type IndustryRecipient = typeof industryRecipients.$inferSelect;
export type InsertIndustryRecipient = z.infer<typeof insertIndustryRecipientSchema>;

export type ContentDistribution = typeof contentDistribution.$inferSelect;
export type InsertContentDistribution = z.infer<typeof insertContentDistributionSchema>;

export type RecipientEngagement = typeof recipientEngagements.$inferSelect;
export type InsertRecipientEngagement = z.infer<typeof insertRecipientEngagementSchema>;

// Cart functionality for universal media player upselling
export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  itemId: integer("item_id").notNull(),
  itemType: text("item_type").notNull(), // 'song', 'album', 'merchandise', 'service'
  quantity: integer("quantity").default(1),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  addedAt: timestamp("added_at").defaultNow(),
});

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = typeof cartItems.$inferInsert;

export const insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true,
  addedAt: true,
});

// Musician instrument preferences table for enhanced technical rider generation
export const musicianInstrumentPreferences = pgTable("musician_instrument_preferences", {
  id: serial("id").primaryKey(),
  musicianUserId: integer("musician_user_id").references(() => users.id).notNull(),
  instrumentId: integer("instrument_id").references(() => allInstruments.id).notNull(),
  proficiencyLevel: text("proficiency_level").notNull(), // 'beginner', 'intermediate', 'advanced', 'professional'
  isPrimary: boolean("is_primary").default(false), // Primary instrument for the musician
  specializations: text("specializations"), // e.g., "jazz brushes, rock double kick, electronic triggers"
  equipmentNotes: text("equipment_notes"), // Personal equipment preferences
  technicalRequirements: text("technical_requirements"), // Specific technical needs
  preferredSetup: text("preferred_setup"), // Setup preferences
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert and type schemas for musician instrument preferences
export const insertMusicianInstrumentPreferencesSchema = createInsertSchema(musicianInstrumentPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type MusicianInstrumentPreference = typeof musicianInstrumentPreferences.$inferSelect;
export type InsertMusicianInstrumentPreference = z.infer<typeof insertMusicianInstrumentPreferencesSchema>;

// MediaHub Document Management - using existing documents table
export const mediaHubDocuments = pgTable("mediahub_documents", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").references(() => bookings.id).notNull(),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  filePath: text("file_path").notNull(),
  uploadedBy: integer("uploaded_by").references(() => users.id).notNull(),
  visibility: text("visibility").notNull().default('admin_controlled'), // 'booker_only', 'admin_controlled', 'all_talent'
  description: text("description"),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export const documentPermissions = pgTable("document_permissions", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").references(() => mediaHubDocuments.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  canView: boolean("can_view").default(true),
  canDownload: boolean("can_download").default(true),
  grantedBy: integer("granted_by").references(() => users.id).notNull(),
  grantedAt: timestamp("granted_at").defaultNow().notNull(),
});

// Relations for MediaHub documents
export const mediaHubDocumentsRelations = relations(mediaHubDocuments, ({ one, many }) => ({
  booking: one(bookings, {
    fields: [mediaHubDocuments.bookingId],
    references: [bookings.id],
  }),
  uploader: one(users, {
    fields: [mediaHubDocuments.uploadedBy],
    references: [users.id],
  }),
  permissions: many(documentPermissions),
}));

export const documentPermissionsRelations = relations(documentPermissions, ({ one }) => ({
  document: one(mediaHubDocuments, {
    fields: [documentPermissions.documentId],
    references: [mediaHubDocuments.id],
  }),
  user: one(users, {
    fields: [documentPermissions.userId],
    references: [users.id],
  }),
  grantedByUser: one(users, {
    fields: [documentPermissions.grantedBy],
    references: [users.id],
  }),
}));

// Insert and type schemas for MediaHub documents
export const insertMediaHubDocumentSchema = createInsertSchema(mediaHubDocuments).omit({
  id: true,
  uploadedAt: true,
});

export const insertDocumentPermissionSchema = createInsertSchema(documentPermissions).omit({
  id: true,
  grantedAt: true,
});

export type MediaHubDocument = typeof mediaHubDocuments.$inferSelect;
export type InsertMediaHubDocument = z.infer<typeof insertMediaHubDocumentSchema>;

export type DocumentPermission = typeof documentPermissions.$inferSelect;
export type InsertDocumentPermission = z.infer<typeof insertDocumentPermissionSchema>;
