import { z } from "zod";
import { sanitizeSqlString, sanitizeHtml } from "./input-validator";

// Common schemas
export const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, "ID must be a number"),
});

export const userIdParamSchema = z.object({
  userId: z.string().regex(/^\d+$/, "User ID must be a number"),
});

export const paginationSchema = z.object({
  page: z.string().regex(/^\d+$/).default("0"),
  limit: z.string().regex(/^\d+$/).default("20"),
});

// User schemas
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2).max(100).transform(sanitizeSqlString),
  roles: z.array(z.number().int().positive()),
  primaryTalentId: z.number().int().positive(),
  phoneNumber: z.string().optional(),
  gender: z
    .enum(["male", "female", "non-binary", "prefer_not_to_say"])
    .optional(),
});

// Profile schemas
export const updateProfileSchema = z.object({
  fullName: z.string().min(2).max(100).transform(sanitizeSqlString).optional(),
  phoneNumber: z.string().optional(),
  privacySetting: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  coverImageUrl: z.string().url().optional(),
});

// Artist schemas
export const createArtistSchema = z.object({
  userId: z.number().int().positive(),
  stageName: z.string().transform(sanitizeSqlString), // singular
  bio: z.string().transform(sanitizeHtml).optional(),
  primaryGenre: z.string().optional(), // singular
  primaryTalentId: z.number().int().positive().optional(),
});

export const updateArtistSchema = z.object({
  stageName: z.string().transform(sanitizeSqlString), // singular
  bio: z.string().transform(sanitizeHtml).optional(),
  primaryGenre: z.string().optional(), // singular
  primaryTalentId: z.number().int().positive().optional(),
});

// Song schemas
export const createSongSchema = z.object({
  title: z.string().min(1).max(200).transform(sanitizeSqlString),
  artist: z.string().min(1).max(200).transform(sanitizeSqlString),
  duration: z.number().positive().optional(),
  releaseYear: z
    .number()
    .int()
    .min(1900)
    .max(new Date().getFullYear() + 1)
    .optional(),
  price: z.number().positive().optional(),
  albumId: z.number().int().positive().optional(),
  fileUrl: z.string().url().optional(),
  coverArtUrl: z.string().url().optional(),
});

export const searchSongsSchema = z.object({
  query: z.string().min(1).transform(sanitizeSqlString),
  includePublishers: z.boolean().optional(),
  includeISRC: z.boolean().optional(),
  searchType: z.enum(["all", "platform"]).optional(),
});

// Album schemas
export const createAlbumSchema = z.object({
  title: z.string().min(1).max(200).transform(sanitizeSqlString),
  releaseDate: z.string().datetime().optional(),
  genre: z.string().optional(),
  description: z.string().transform(sanitizeHtml).optional(),
  coverArtUrl: z.string().url().optional(),
  price: z.number().positive().optional(),
});

export const updateAlbumSchema = z.object({
  title: z.string().min(1).max(200).transform(sanitizeSqlString).optional(),
  releaseDate: z.string().datetime().optional(),
  genre: z.string().optional(),
  description: z.string().transform(sanitizeHtml).optional(),
  coverArtUrl: z.string().url().optional(),
  price: z.number().positive().optional(),
});

// Booking schemas
export const bookingIdParamSchema = z.object({
  bookingId: z.string().regex(/^\d+$/, "Booking ID must be a number"),
});

export const createBookingSchema = z.object({
  primaryArtistUserId: z.number().int().positive(),
  eventName: z.string().min(1).max(200).transform(sanitizeSqlString),
  eventType: z.string().min(1).max(100),
  eventDates: z.array(z.string().datetime()), // একাধিক তারিখ সমর্থন করে
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  venueName: z.string().transform(sanitizeSqlString).optional(),
  venueAddress: z.string().transform(sanitizeSqlString).optional(),
  requirements: z.string().transform(sanitizeHtml).optional(),
  expectedAttendees: z.string().optional(),
  additionalNotes: z.string().optional(),
  totalBudget: z.string().optional(),
  guestName: z.string().transform(sanitizeSqlString).optional(),
  guestEmail: z.string().email().optional(),
  guestPhone: z.string().optional(),
  isGuestBooking: z.boolean().optional(),
  additionalTalentUserIds: z.array(z.number()).optional(),
  multiTalentBooking: z.boolean().optional(),
  selectedAddOns: z.array(z.any()).optional(),
  totalPrice: z.number().positive().optional(),
  bookerUserId: z.number().optional(),
  createAccount: z.boolean().optional(),
});


export const updateBookingSchema = z.object({
  status: z.enum(["pending", "confirmed", "cancelled", "completed"]).optional(),
  eventDate: z.string().datetime().optional(),
  venueName: z.string().transform(sanitizeSqlString).optional(),
  venueAddress: z.string().transform(sanitizeSqlString).optional(),
  requirements: z.string().transform(sanitizeHtml).optional(),
  totalBudget: z.number().positive().optional(),
  finalPrice: z.number().positive().optional(),
});

// Service schemas
export const createServiceSchema = z.object({
  serviceName: z.string().min(1).max(200).transform(sanitizeSqlString),
  description: z.string().transform(sanitizeHtml).optional(),
  categoryId: z.number().int().positive(),
  basePrice: z.number().positive(),
  pricingModel: z.enum(["fixed", "hourly", "project"]).optional(),
});

// Newsletter schemas
export const newsletterSubscribeSchema = z.object({
  email: z.string().email(),
  preferences: z.array(z.string()).optional(),
});

export const sendNewsletterSchema = z.object({
  subject: z.string().min(1).max(200).transform(sanitizeSqlString),
  content: z.string().transform(sanitizeHtml),
  recipientType: z.enum([
    "all",
    "artists",
    "musicians",
    "professionals",
    "fans",
  ]),
  schedule: z.string().datetime().optional(),
});

// Opportunity schemas
export const createOpportunitySchema = z.object({
  title: z.string().min(1).max(200).transform(sanitizeSqlString),
  description: z.string().transform(sanitizeHtml),
  type: z.string(),
  submissionDeadline: z.string().datetime().optional(),
  compensation: z.number().positive().optional(),
  requirements: z.array(z.string()).optional(),
});

// Contact form schema
export const contactFormSchema = z.object({
  name: z.string().min(2).max(100).transform(sanitizeSqlString),
  email: z.string().email(),
  subject: z.string().min(1).max(200).transform(sanitizeSqlString),
  message: z.string().min(10).max(5000).transform(sanitizeHtml),
  honeypot: z.string().optional(), // Anti-bot field
});

// File upload schema
export const fileUploadSchema = z.object({
  filename: z.string().regex(/^[\w\-. ]+$/, "Invalid filename"),
  mimetype: z.string(),
  size: z
    .number()
    .positive()
    .max(50 * 1024 * 1024), // 50MB max
});

// Instrument schemas
export const searchInstrumentsSchema = z.object({
  search: z.string().optional(),
});

// Cross-upsell schemas
export const createCrossUpsellSchema = z.object({
  sourceType: z.string().min(1).max(50),
  sourceId: z.number().int().positive(),
  targetType: z.string().min(1).max(50),
  targetId: z.number().int().positive(),
  relationship: z.string().min(1).max(100),
});

// Assignment schema
export const assignmentSchema = z.object({
  roleId: z.number().int().min(1).max(9),
  permissions: z.array(z.string()).optional(),
});

// Booking assignment schemas
export const createBookingAssignmentSchema = z.object({
  userId: z.number().int().positive(),
  roleId: z.number().int().min(1).max(9),
  selectedTalent: z.number().int().positive(),
  isMainBookedTalent: z.boolean().optional(),
  assignedGroup: z.string().optional(),
  assignedChannelPair: z.string().optional(),
  assignedChannel: z.number().int().positive().optional(),
  assignmentType: z.enum(["manual", "automatic", "workflow"]).optional(),
});

export const updateBookingAssignmentSchema = z.object({
  roleInBooking: z.number().int().min(1).max(9).optional(),
  selectedTalent: z.number().int().positive().optional(),
  isMainBookedTalent: z.boolean().optional(),
  assignedGroup: z.string().optional(),
  assignedChannelPair: z.string().optional(),
  assignedChannel: z.number().int().positive().optional(),
  status: z.enum(["active", "inactive"]).optional(),
});
