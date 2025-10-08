import {
  users,
  artists,
  musicians,
  professionals,
  songs,
  albums,
  merchandise,
  bookings,
  bookingDates,
  roles,
  userProfessionalPrimaryTalents,
  managementTiers,
  events,
  documents,
  // Enhanced booking assignment tables
  allInstruments,
  bookingAssignmentsMembers,
  // Normalized user data tables
  userSecondaryRoles,
  userSecondaryPerformanceTalents,
  userSecondaryProfessionalTalents,
  userProfessionalServices,
  userProfessionalServiceFeatures,
  userProfessionalServiceCapabilities,
  userSpecializations,
  userSocialLinks,
  userStageNames,
  userGenres,
  userTechnicalRequirements,
  userSkillsAndInstruments,
  userHospitalityRequirements,
  userPerformanceSpecs,
  userAvailability,
  userInteractions,
  userPreferences,
  musicRecommendations,
  artistSimilarities,
  trendingMetrics,
  crossPromotionCampaigns,
  serviceCategories,
  services,
  serviceAssignments,
  userServices,
  serviceReviews,
  currencies,
  bundles,
  bundleItems,
  discountConditions,
  storeCurrencies,
  fanEngagement,
  adminAssignments,
  bookingAssignments,
  artistMusicianAssignments,
  bookingMediaFiles,
  bookingMediaAccess,
  bookingMediaCategories,
  releaseContracts,
  releaseContractSignatures,
  managementTransitions,
  managementApplications,
  managementApplicationSignatures,
  serviceDiscountOverrides,
  managementApplicationReviews,
  legalAssignments,
  applicationLegalAssignments,
  // Financial automation tables
  invoices,
  payoutRequests,
  documentLinkages,
  paymentTransactions,
  financialAuditLog,
  payments,
  receipts,
  // AI & Website Integration tables
  videos,
  userFavorites,
  websiteIntegrations,
  // Enhanced splitsheet tables
  enhancedSplitsheets,
  enhancedSplitsheetNotifications,
  audioFileMetadata,
  // Press release tables
  pressReleases,
  pressReleaseAssignments,
  pressReleaseMedia,
  pressReleaseDistribution,
  // Recipient management tables
  recipientCategories,
  musicGenres,
  industryRecipients,
  contentDistribution,
  recipientEngagements,
  type User,
  type InsertUser,
  type Artist,
  type InsertArtist,
  type Musician,
  type InsertMusician,
  type Professional,
  type InsertProfessional,
  type Song,
  type InsertSong,
  type Album,
  type InsertAlbum,
  type Merchandise,
  type InsertMerchandise,
  type Booking,
  type InsertBooking,
  type Role,
  type ManagementTier,
  type UserProfessionalPrimaryTalent,
  type InsertUserProfessionalPrimaryTalent,
  type Event,
  type Document,
  type UserInteraction,
  type InsertUserInteraction,
  type UserPreferences,
  type InsertUserPreferences,
  type MusicRecommendation,
  type InsertMusicRecommendation,
  type ArtistSimilarity,
  type InsertArtistSimilarity,
  type TrendingMetric,
  type InsertTrendingMetric,
  type CrossPromotionCampaign,
  type InsertCrossPromotionCampaign,
  type ServiceCategory,
  type InsertServiceCategory,
  type Service,
  type InsertService,
  type ServiceAssignment,
  type InsertServiceAssignment,
  type UserService,
  type InsertUserService,
  type ServiceReview,
  type InsertServiceReview,
  type Currency,
  type InsertCurrency,
  type Bundle,
  type InsertBundle,
  type BundleItem,
  type InsertBundleItem,
  type DiscountCondition,
  type InsertDiscountCondition,
  type StoreCurrency,
  type InsertStoreCurrency,
  type FanEngagement,
  type InsertFanEngagement,
  type AllInstrument,
  type InsertAllInstrument,
  type BookingAssignmentsMember,
  type InsertBookingAssignmentsMember,
  type AdminAssignment,
  type InsertAdminAssignment,
  type BookingAssignment,
  type InsertBookingAssignment,
  type ArtistMusicianAssignment,
  type InsertArtistMusicianAssignment,
  type BookingMediaFile,
  type InsertBookingMediaFile,
  type BookingMediaAccess,
  type InsertBookingMediaAccess,
  type BookingMediaCategory,
  type InsertBookingMediaCategory,
  type ReleaseContract,
  type InsertReleaseContract,
  type ReleaseContractSignature,
  type InsertReleaseContractSignature,
  type ManagementTransition,
  type InsertManagementTransition,
  type ManagementApplication,
  type InsertManagementApplication,
  type ManagementApplicationSignature,
  type InsertManagementApplicationSignature,
  type ServiceDiscountOverride,
  type InsertServiceDiscountOverride,
  type ManagementApplicationReview,
  type InsertManagementApplicationReview,
  type LegalAssignment,
  type InsertLegalAssignment,
  type ApplicationLegalAssignment,
  type InsertApplicationLegalAssignment,
  // Financial automation types
  type Invoice,
  type InsertInvoice,
  type PayoutRequest,
  type InsertPayoutRequest,
  type DocumentLinkage,
  type InsertDocumentLinkage,
  type PaymentTransaction,
  type InsertPaymentTransaction,
  type FinancialAuditLog,
  type InsertFinancialAuditLog,
  type Payment,
  type InsertPayment,
  type Receipt,
  type InsertReceipt,
  // Video types
  type Video,
  type InsertVideo,
  waituServiceDiscountLimits,
  individualDiscountPermissions,
  globalGenres,
  crossUpsellRelationships,
  globalProfessions,
  professionalAvailability,
  stagePlots,
  mixerPatchLists,
  setlistTemplates,
  playbackTracks,
  djAccess,
  playbackTrackDownloads,
  curators,
  curatorSubmissions,
  curatorEmailCampaigns,
  insertWaituServiceDiscountLimitSchema,
  insertIndividualDiscountPermissionSchema,
  type GlobalGenre,
  type InsertGlobalGenre,
  type CrossUpsellRelationship,
  type InsertCrossUpsellRelationship,
  // OppHub types
  opportunityCategories,
  opportunities,
  opportunityApplications,
  oppHubSubscriptions,
  marketIntelligence,
  opportunitySources,
  opportunityMatches,
  type OpportunityCategory,
  type InsertOpportunityCategory,
  type Opportunity,
  type InsertOpportunity,
  type OpportunityApplication,
  type InsertOpportunityApplication,
  type OppHubSubscription,
  type InsertOppHubSubscription,
  type MarketIntelligence,
  type InsertMarketIntelligence,
  type OpportunitySource,
  type InsertOpportunitySource,
  type OpportunityMatch,
  type InsertOpportunityMatch,
  // PRO Registration types
  proRegistrations,
  proWorks,
  proEligibilityAssessments,
  type PRORegistration,
  type InsertPRORegistration,
  type PROWork,
  type InsertPROWork,
  type PROEligibilityAssessment,
  type InsertPROEligibilityAssessment,
  // Press release types
  type PressRelease,
  type InsertPressRelease,
  type PressReleaseAssignment,
  type InsertPressReleaseAssignment,
  type PressReleaseMedia,
  type InsertPressReleaseMedia,
  type PressReleaseDistribution,
  type InsertPressReleaseDistribution,
  // Configuration management types
  adminConfigurations,
  configurationHistory,
  configurationDelegations,
  type AdminConfiguration,
  type InsertAdminConfiguration,
  type ConfigurationHistory,
  type InsertConfigurationHistory,
  type ConfigurationDelegation,
  type InsertConfigurationDelegation,
  // Recipient management types
  type RecipientCategory,
  type InsertRecipientCategory,
  type MusicGenre,
  type InsertMusicGenre,
  type IndustryRecipient,
  type InsertIndustryRecipient,
  type ContentDistribution,
  type InsertContentDistribution,
  type RecipientEngagement,
  type InsertRecipientEngagement,
  // Website Integration types
  type WebsiteIntegration,
  type InsertWebsiteIntegration,
  // Cart functionality
  cartItems,
  type CartItem,
  type InsertCartItem,
  // Professional booking assignments
  bookingProfessionalAssignments,
  oppHubProfessionalGuidance,
  // Technical rider and booking attachment types
  technicalRiderStages,
  bookingAttachments,
  bookingMessages,
  type TechnicalRiderStage,
  type InsertTechnicalRiderStage,
  type BookingAttachment,
  type InsertBookingAttachment,
  type BookingMessage,
  type InsertBookingMessage,
  // Content Management System imports
  platformTextContent,
  platformTypography,
  platformColorSchemes,
  platformColors,
  platformComponentStyles,
  platformLayoutControls,
  platformThemes,
  type PlatformTextContent,
  type InsertPlatformTextContent,
  type PlatformTypography,
  type InsertPlatformTypography,
  type PlatformColorScheme,
  type InsertPlatformColorScheme,
  type PlatformColor,
  type InsertPlatformColor,
  type PlatformComponentStyle,
  type InsertPlatformComponentStyle,
  type PlatformLayoutControl,
  type InsertPlatformLayoutControl,
  type PlatformTheme,
  type InsertPlatformTheme,
  // MediaHub Document Management imports
  mediaHubDocuments,
  documentPermissions,
  type MediaHubDocument,
  type InsertMediaHubDocument,
  type DocumentPermission,
  type InsertDocumentPermission,
  rolesManagement,
  userRoles,
  contractSignatures,
  technicalRiders,
  isrcCodes,
  newsletters,
  contracts,
} from "@shared/schema";
import {
  eq,
  and,
  or,
  desc,
  lte,
  gte,
  isNotNull,
  sql,
  inArray,
} from "drizzle-orm";
import { db } from "./db";
import { configurationStorage } from "./configuration-storage";
import type { AdminConfigType } from "@shared/admin-config";

export interface IStorage {
  // Song search methods
  searchSongs(query: string): Promise<Song[]>;
  getSongByYoutubeId(youtubeId: string): Promise<Song | undefined>;
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;

  // Enhanced user management with role information
  getUserWithRoles(id: number): Promise<
    | {
      id: number;
      email: string;
      fullName: string;
      roleId: number;
      roleName: string; // User's registration type (superadmin, admin, managed_artist, etc.)
      professionalRole?: string; // Only for artists/musicians/professionals - their actual role/position
      secondaryRoles?: Array<{ roleId: number; roleName: string }>;
    }
    | undefined
  >;

  getUsersForAssignment(roleIds?: number[]): Promise<
    Array<{
      id: number;
      email: string;
      fullName: string;
      roleId: number;
      roleName: string; // User's registration type
      professionalRole?: string; // Their actual role/position (for artists/musicians/professionals)
      secondaryRoles?: Array<{ roleId: number; roleName: string }>;
    }>
  >;

  // Secondary role management
  addSecondaryRole(userId: number, roleId: number): Promise<void>;
  removeSecondaryRole(userId: number, roleId: number): Promise<void>;
  getUserSecondaryRoles(
    userId: number
  ): Promise<Array<{ roleId: number; roleName: string }>>;

  // Demo user management
  getDemoUsers(): Promise<
    Array<{ id: number; email: string; fullName: string; roleName: string }>
  >;

  // User profiles - temporarily removed during schema migration

  // Roles and management tiers
  getRoles(): Promise<Role[]>;
  getRoleById(roleId: number): Promise<Role | undefined>;
  getRoleName(roleId: number): Promise<string>;
  isUserManaged(roleId: number): boolean;
  getUserTypeCategory(
    roleId: number
  ): "artist" | "musician" | "professional" | "admin" | "fan";
  getManagementTiers(): Promise<ManagementTier[]>;

  // Primary talents management methods
  getPrimaryTalents(): Promise<UserProfessionalPrimaryTalent[]>;
  createPrimaryTalent(
    data: z.infer<typeof insertUserProfessionalPrimaryTalentSchema>
  ): Promise<UserProfessionalPrimaryTalent>;
  getPrimaryTalentById(
    id: number
  ): Promise<UserProfessionalPrimaryTalent | undefined>;
  updatePrimaryTalent(
    id: number,
    data: Partial<UserProfessionalPrimaryTalent>
  ): Promise<UserProfessionalPrimaryTalent>;
  deletePrimaryTalent(id: number): Promise<void>;
  getPrimaryTalentsByRoleId(
    roleId: number
  ): Promise<UserProfessionalPrimaryTalent[]>;

  // Secondary talents management methods
  getUserSecondaryPerformanceTalents(
    userId: number
  ): Promise<Array<{ talentName: string }>>;
  getUserSecondaryProfessionalTalents(
    userId: number
  ): Promise<Array<{ talentName: string }>>;

  // Role management
  createRole(role: Partial<Role>): Promise<Role>;
  updateRole(id: number, updates: Partial<Role>): Promise<Role | undefined>;
  deleteRole(id: number): Promise<boolean>;
  getUsersByRole(roleId: number): Promise<User[]>;

  // Artists
  getArtist(userId: number): Promise<Artist | undefined>;
  getArtists(): Promise<Artist[]>;
  createArtist(artist: InsertArtist): Promise<Artist>;
  updateArtist(
    userId: number,
    updates: Partial<Artist>
  ): Promise<Artist | undefined>;
  updateArtistStageNames(
    userId: number,
    stageNames: Array<{
      name: string;
      isPrimary?: boolean;
      isForBookings?: boolean;
      usageType?: "primary" | "bookings" | "both";
    }>
  ): Promise<Artist | undefined>;

  // Musicians
  getMusician(userId: number): Promise<Musician | undefined>;
  getMusicians(): Promise<Musician[]>;
  createMusician(musician: InsertMusician): Promise<Musician>;
  updateMusicianStageNames(
    userId: number,
    stageNames: Array<{
      name: string;
      isPrimary?: boolean;
      isForBookings?: boolean;
      usageType?: "primary" | "bookings" | "both";
    }>
  ): Promise<Musician | undefined>;

  // Professionals
  getProfessional(userId: number): Promise<Professional | undefined>;
  getProfessionals(): Promise<Professional[]>;
  createProfessional(professional: InsertProfessional): Promise<Professional>;

  // Songs
  getSong(id: number): Promise<Song | undefined>;
  getSongs(): Promise<Song[]>;
  getSongsByArtist(artistUserId: number): Promise<Song[]>;
  createSong(song: InsertSong): Promise<Song>;
  updateSong(id: number, updates: Partial<Song>): Promise<Song | undefined>;
  deleteSong(id: number): Promise<void>;

  // Videos
  getVideo(id: number): Promise<Video | undefined>;
  getVideos(): Promise<Video[]>;
  getVideosByUser(userId: number): Promise<Video[]>;
  createVideo(video: InsertVideo): Promise<Video>;
  updateVideo(id: number, updates: Partial<Video>): Promise<Video | undefined>;
  deleteVideo(id: number): Promise<void>;

  // Albums
  getAlbum(id: number): Promise<Album | undefined>;
  getAlbums(): Promise<Album[]>;
  getAlbumsByArtist(artistUserId: number): Promise<Album[]>;
  createAlbum(album: InsertAlbum): Promise<Album>;
  updateAlbum(id: number, updates: Partial<Album>): Promise<Album | undefined>;
  deleteAlbum(id: number): Promise<boolean>;

  // Songs by album
  getSongsByAlbum(albumId: number): Promise<Song[]>;

  // Cross-Upsell Relationships
  getCrossUpsellRelationships(): Promise<CrossUpsellRelationship[]>;
  createCrossUpsellRelationship(
    relationship: InsertCrossUpsellRelationship
  ): Promise<CrossUpsellRelationship>;
  getCrossUpsellsBySource(
    sourceType: string,
    sourceId: number
  ): Promise<CrossUpsellRelationship[]>;
  deleteCrossUpsellRelationship(id: number): Promise<boolean>;

  // Merchandise
  getMerchandise(id?: number): Promise<Merchandise | Merchandise[] | undefined>;
  getMerchandiseByArtist(artistUserId: number): Promise<Merchandise[]>;
  getAllMerchandise(): Promise<Merchandise[]>;
  createMerchandise(merchandise: InsertMerchandise): Promise<Merchandise>;

  // Splitsheets - OppHub AI Learning: Music industry specific data management
  getSplitsheets(): Promise<any[]>;
  createSplitsheet(splitsheet: any): Promise<any>;

  // Contracts - OppHub AI Learning: Legal document management
  getContracts(): Promise<any[]>;
  createContract(contract: any): Promise<any>;

  // Technical Riders - OppHub AI Learning: Performance specification management
  getTechnicalRiders(): Promise<any[]>;
  createTechnicalRider(technicalRider: any): Promise<any>;

  // ISRC Codes - OppHub AI Learning: Music identification code management
  getIsrcCodes(): Promise<any[]>;
  createIsrcCode(isrcCode: any): Promise<any>;

  // Newsletters - OppHub AI Learning: Marketing communication management
  getNewsletters(): Promise<any[]>;
  createNewsletter(newsletter: any): Promise<any>;

  // Bookings
  getBooking(id: number): Promise<Booking | undefined>;
  getBookings(): Promise<Booking[]>;
  getBookingsByUser(userId: number): Promise<Booking[]>;
  getAllBookings(): Promise<Booking[]>;
  getBookingsByArtist(artistUserId: number): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBookingStatus(id: number, status: string): Promise<Booking | undefined>;
  updateBooking(
    id: number,
    updates: Partial<Booking>
  ): Promise<Booking | undefined>;

  // Setlists
  getSetlist(bookingId: number): Promise<any>;
  saveSetlist(setlistData: any): Promise<any>;
  getSetlistByBooking(bookingId: number): Promise<any>;
  updateSetlist(setlistId: number, updates: any): Promise<void>;

  // All Users (for admin)
  getAllUsers(): Promise<User[]>;

  // Events
  getEventsByArtist(artistUserId: number): Promise<Event[]>;
  getEventsByUser(userId: number): Promise<Event[]>;
  getUpcomingEvents(): Promise<Event[]>;

  // Recommendation System
  // User Interactions
  createUserInteraction(
    interaction: InsertUserInteraction
  ): Promise<UserInteraction>;
  getUserInteractions(userId: number): Promise<UserInteraction[]>;
  getAllUserInteractions(): Promise<UserInteraction[]>;

  // User Preferences
  getUserPreferences(userId: number): Promise<UserPreferences | undefined>;
  updateUserPreferences(
    userId: number,
    preferences: Partial<InsertUserPreferences>
  ): Promise<UserPreferences>;

  // Music Recommendations
  createMusicRecommendation(
    recommendation: InsertMusicRecommendation
  ): Promise<MusicRecommendation>;
  getUserRecommendations(
    userId: number,
    limit?: number
  ): Promise<MusicRecommendation[]>;
  clearUserRecommendations(userId: number): Promise<void>;
  updateRecommendationEngagement(
    recommendationId: number,
    engagementType: "viewed" | "clicked"
  ): Promise<void>;

  // Artist Similarities
  createArtistSimilarity(
    similarity: InsertArtistSimilarity
  ): Promise<ArtistSimilarity>;
  getArtistSimilarities(artistId: number): Promise<ArtistSimilarity[]>;
  getAllArtists(): Promise<Artist[]>;
  getArtistFans(artistId: number): Promise<number[]>;

  // Trending Metrics
  incrementTrendingMetric(metric: Partial<InsertTrendingMetric>): Promise<void>;
  getTrendingSongs(timeframe: string): Promise<Song[]>;

  // Cross Promotion
  getActiveCrossPromotionCampaigns(): Promise<CrossPromotionCampaign[]>;
  incrementCampaignImpressions(campaignId: number): Promise<void>;

  // Additional helper methods
  getSongsByGenre(genre: string): Promise<Song[]>;
  getUserByUsername(username: string): Promise<User | undefined>;

  // Admin dashboard specific methods
  getUsersCount(): Promise<number>;
  getActiveUsersCount(): Promise<number>;
  getNewUsersThisMonth(): Promise<number>;
  getBookingsCount(): Promise<number>;
  getCompletedBookingsCount(): Promise<number>;
  getTotalRevenue(): Promise<number>;
  getMonthlyRevenue(): Promise<number>;
  getWeeklyRevenue(): Promise<number>;
  getPendingPayouts(): Promise<number>;
  getPendingApprovalsCount(): Promise<number>;
  getActiveBookingsCount(): Promise<number>;
  getContentItemsCount(): Promise<number>;
  getTopArtists(): Promise<
    { name: string; bookings: number; revenue: number }[]
  >;
  getPendingItems(): Promise<any[]>;
  getContentForModeration(): Promise<any[]>;
  getBookingApprovals(): Promise<any[]>;
  getRecentTransactions(): Promise<any[]>;
  getUsers(options?: { limit?: number }): Promise<User[]>;

  // Service Management
  // Service Categories
  getServiceCategories(): Promise<ServiceCategory[]>;
  createServiceCategory(
    category: InsertServiceCategory
  ): Promise<ServiceCategory>;

  // Admin Services
  getServices(): Promise<Service[]>;
  getService(id: number): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  updateService(
    id: number,
    updates: Partial<Service>
  ): Promise<Service | undefined>;
  deleteService(id: number): Promise<boolean>;

  // Service Assignments
  getServiceAssignments(): Promise<ServiceAssignment[]>;
  getServiceAssignmentsByUser(userId: number): Promise<ServiceAssignment[]>;
  getServiceAssignmentsByService(
    serviceId: number
  ): Promise<ServiceAssignment[]>;
  createServiceAssignment(
    assignment: InsertServiceAssignment
  ): Promise<ServiceAssignment>;
  updateServiceAssignment(
    id: number,
    updates: Partial<ServiceAssignment>
  ): Promise<ServiceAssignment | undefined>;
  deleteServiceAssignment(id: number): Promise<boolean>;

  // User Services (self-created)
  getUserServices(userId: number): Promise<UserService[]>;
  getAllUserServices(): Promise<UserService[]>;
  getUserService(id: number): Promise<UserService | undefined>;
  createUserService(userService: InsertUserService): Promise<UserService>;
  updateUserService(
    id: number,
    updates: Partial<UserService>
  ): Promise<UserService | undefined>;
  deleteUserService(id: number): Promise<boolean>;

  // Service Reviews
  getServiceReviews(
    serviceId?: number,
    userServiceId?: number
  ): Promise<ServiceReview[]>;
  createServiceReview(review: InsertServiceReview): Promise<ServiceReview>;

  // Currency management
  getCurrencies(): Promise<Currency[]>;
  getCurrency(code: string): Promise<Currency | undefined>;
  createCurrency(currency: InsertCurrency): Promise<Currency>;
  updateCurrency(
    code: string,
    updates: Partial<Currency>
  ): Promise<Currency | undefined>;
  updateCurrencyRate(code: string, rate: number): Promise<Currency | undefined>;

  // Store bundles
  getBundles(): Promise<Bundle[]>;
  getBundle(id: number): Promise<Bundle | undefined>;
  getBundlesByArtist(artistUserId: number): Promise<Bundle[]>;
  createBundle(bundle: InsertBundle): Promise<Bundle>;
  updateBundle(
    id: number,
    updates: Partial<Bundle>
  ): Promise<Bundle | undefined>;

  // Bundle items
  getBundleItems(bundleId: number): Promise<BundleItem[]>;
  createBundleItem(item: InsertBundleItem): Promise<BundleItem>;
  deleteBundleItem(id: number): Promise<void>;

  // Discount conditions
  getDiscountConditions(bundleId: number): Promise<DiscountCondition[]>;
  createDiscountCondition(
    condition: InsertDiscountCondition
  ): Promise<DiscountCondition>;
  updateDiscountCondition(
    id: number,
    updates: Partial<DiscountCondition>
  ): Promise<DiscountCondition | undefined>;
  validateDiscountCondition(
    conditionId: number,
    userValue: string
  ): Promise<boolean>;

  // Store currencies
  getStoreCurrencies(): Promise<StoreCurrency[]>;
  getStoreCurrency(code: string): Promise<StoreCurrency | undefined>;
  createStoreCurrency(currency: InsertStoreCurrency): Promise<StoreCurrency>;
  updateStoreCurrency(
    id: number,
    updates: Partial<StoreCurrency>
  ): Promise<StoreCurrency | undefined>;

  // Fan engagement
  createFanEngagement(engagement: InsertFanEngagement): Promise<FanEngagement>;
  getFanEngagement(
    userId: number,
    artistUserId: number
  ): Promise<FanEngagement[]>;

  // Assignment management - Admin assignments
  createAdminAssignment(
    assignment: InsertAdminAssignment
  ): Promise<AdminAssignment>;
  getAdminAssignments(adminUserId?: number): Promise<AdminAssignment[]>;
  getAdminAssignment(id: number): Promise<AdminAssignment | undefined>;
  updateAdminAssignment(
    id: number,
    updates: Partial<AdminAssignment>
  ): Promise<AdminAssignment | undefined>;
  removeAdminAssignment(id: number): Promise<void>;

  // Enhanced instrument-based booking assignments
  getAllInstruments(activeOnly?: boolean): Promise<AllInstrument[]>;
  getInstrumentsByMixerGroup(mixerGroup: string): Promise<AllInstrument[]>;
  createAllInstrument(instrument: InsertAllInstrument): Promise<AllInstrument>;

  // Enhanced booking assignments with instruments
  createBookingAssignmentMember(
    assignment: InsertBookingAssignmentsMember
  ): Promise<BookingAssignmentsMember>;
  getBookingAssignmentMembers(bookingId: number): Promise<
    Array<
      BookingAssignmentsMember & {
        user: { id: number; fullName: string; email: string };
        role: { id: number; name: string };
        instrument?: {
          id: number;
          name: string;
          playerName: string;
          mixerGroup: string;
        };
      }
    >
  >;
  getBookingAssignmentMember(
    id: number
  ): Promise<BookingAssignmentsMember | undefined>;
  updateBookingAssignmentMember(
    id: number,
    updates: Partial<BookingAssignmentsMember>
  ): Promise<BookingAssignmentsMember | undefined>;
  removeBookingAssignmentMember(id: number): Promise<void>;
  assignUserToBooking(
    bookingId: number,
    userId: number,
    roleId: number,
    instrumentId: number | null,
    assignedBy: number,
    isMainTalent?: boolean
  ): Promise<BookingAssignmentsMember>;

  // Legacy booking assignments (kept for compatibility)
  createBookingAssignment(
    assignment: InsertBookingAssignment
  ): Promise<BookingAssignment>;
  getBookingAssignments(): Promise<BookingAssignment[]>;
  getBookingAssignmentsByBooking(
    bookingId: number
  ): Promise<BookingAssignment[]>;
  getBookingAssignment(id: number): Promise<BookingAssignment | undefined>;
  updateBookingAssignment(
    id: number,
    updates: Partial<BookingAssignment>
  ): Promise<BookingAssignment | undefined>;
  removeBookingAssignment(id: number): Promise<void>;

  // Assignment management - Artist-Musician assignments
  createArtistMusicianAssignment(
    assignment: InsertArtistMusicianAssignment
  ): Promise<ArtistMusicianAssignment>;
  getArtistMusicianAssignments(
    artistUserId?: number
  ): Promise<ArtistMusicianAssignment[]>;
  getArtistMusicianAssignmentsByTalent(
    managedTalentId: number
  ): Promise<ArtistMusicianAssignment[]>;
  getArtistMusicianAssignmentsByAssignee(
    assigneeId: number
  ): Promise<ArtistMusicianAssignment[]>;
  getArtistMusicianAssignmentsByUser(
    userId: number
  ): Promise<ArtistMusicianAssignment[]>;
  getArtistMusicianAssignment(
    id: number
  ): Promise<ArtistMusicianAssignment | undefined>;
  updateArtistMusicianAssignment(
    id: number,
    updates: Partial<ArtistMusicianAssignment>
  ): Promise<ArtistMusicianAssignment | undefined>;
  removeArtistMusicianAssignment(id: number): Promise<void>;

  // Assignment management - Service assignments
  createServiceAssignment(
    assignment: InsertServiceAssignment
  ): Promise<ServiceAssignment>;
  getServiceAssignments(): Promise<ServiceAssignment[]>;
  getServiceAssignmentsByService(
    serviceId: number
  ): Promise<ServiceAssignment[]>;
  getServiceAssignmentsByTalent(
    assignedTalentId: number
  ): Promise<ServiceAssignment[]>;
  getServiceAssignment(id: number): Promise<ServiceAssignment | undefined>;
  updateServiceAssignment(
    id: number,
    updates: Partial<ServiceAssignment>
  ): Promise<ServiceAssignment | undefined>;
  removeServiceAssignment(id: number): Promise<void>;

  // Booking Media Management
  createBookingMediaFile(
    file: InsertBookingMediaFile
  ): Promise<BookingMediaFile>;
  getBookingMediaFiles(bookingId: number): Promise<BookingMediaFile[]>;
  getBookingMediaFile(id: number): Promise<BookingMediaFile | undefined>;
  updateBookingMediaFile(
    id: number,
    updates: Partial<BookingMediaFile>
  ): Promise<BookingMediaFile | undefined>;
  deleteBookingMediaFile(id: number): Promise<void>;

  // Booking Media Access Control
  createBookingMediaAccess(
    access: InsertBookingMediaAccess
  ): Promise<BookingMediaAccess>;
  getBookingMediaAccess(mediaFileId: number): Promise<BookingMediaAccess[]>;
  getUserBookingMediaAccess(
    userId: number,
    mediaFileId: number
  ): Promise<BookingMediaAccess | undefined>;
  updateBookingMediaAccess(
    id: number,
    updates: Partial<BookingMediaAccess>
  ): Promise<BookingMediaAccess | undefined>;
  removeBookingMediaAccess(id: number): Promise<void>;
  checkUserMediaAccess(
    userId: number,
    mediaFileId: number,
    requiredLevel: string
  ): Promise<boolean>;

  // Booking Media Categories
  getBookingMediaCategories(): Promise<BookingMediaCategory[]>;
  createBookingMediaCategory(
    category: InsertBookingMediaCategory
  ): Promise<BookingMediaCategory>;
  updateBookingMediaCategory(
    id: number,
    updates: Partial<BookingMediaCategory>
  ): Promise<BookingMediaCategory | undefined>;

  // Release Contract Management
  createReleaseContract(
    contract: InsertReleaseContract
  ): Promise<ReleaseContract>;
  getReleaseContract(id: number): Promise<ReleaseContract | undefined>;
  getReleaseContractsByUser(userId: number): Promise<ReleaseContract[]>;
  getPendingReleaseContracts(): Promise<ReleaseContract[]>;
  updateReleaseContract(
    id: number,
    updates: Partial<ReleaseContract>
  ): Promise<ReleaseContract | undefined>;
  createReleaseContractSignature(
    signature: InsertReleaseContractSignature
  ): Promise<ReleaseContractSignature>;
  getReleaseContractSignatures(
    contractId: number
  ): Promise<ReleaseContractSignature[]>;
  createManagementTransition(
    transition: InsertManagementTransition
  ): Promise<ManagementTransition>;
  getManagementTransitions(userId: number): Promise<ManagementTransition[]>;

  // Management Application System
  createManagementApplication(
    application: InsertManagementApplication
  ): Promise<ManagementApplication>;
  getManagementApplication(
    id: number
  ): Promise<ManagementApplication | undefined>;
  getManagementApplicationsByUser(
    userId: number
  ): Promise<ManagementApplication[]>;
  getPendingManagementApplications(): Promise<ManagementApplication[]>;
  updateManagementApplication(
    id: number,
    updates: Partial<ManagementApplication>
  ): Promise<ManagementApplication | undefined>;
  createManagementApplicationSignature(
    signature: InsertManagementApplicationSignature
  ): Promise<ManagementApplicationSignature>;
  getManagementApplicationSignatures(
    applicationId: number
  ): Promise<ManagementApplicationSignature[]>;

  // Service Discount Management
  createServiceDiscountOverride(
    override: InsertServiceDiscountOverride
  ): Promise<ServiceDiscountOverride>;
  getServiceDiscountOverrides(
    userId: number
  ): Promise<ServiceDiscountOverride[]>;
  getServiceDiscountOverride(
    userId: number,
    serviceId?: number,
    userServiceId?: number
  ): Promise<ServiceDiscountOverride | undefined>;
  updateServiceDiscountOverride(
    id: number,
    updates: Partial<ServiceDiscountOverride>
  ): Promise<ServiceDiscountOverride | undefined>;
  getMaxDiscountForUser(userId: number): Promise<number>;

  // Management Application Review System
  createManagementApplicationReview(
    review: InsertManagementApplicationReview
  ): Promise<ManagementApplicationReview>;
  getManagementApplicationReviews(
    applicationId: number
  ): Promise<ManagementApplicationReview[]>;
  getManagementApplicationsByAssignedAdmin(
    adminUserId: number
  ): Promise<ManagementApplication[]>;

  // Legal Assignment System
  createLegalAssignment(
    assignment: InsertLegalAssignment
  ): Promise<LegalAssignment>;
  getLegalAssignments(clientUserId: number): Promise<LegalAssignment[]>;
  getLawyerClients(lawyerUserId: number): Promise<LegalAssignment[]>;
  getAssignedLawyer(
    clientUserId: number,
    assignmentType?: string
  ): Promise<LegalAssignment | undefined>;

  // Application Legal Assignment System (Lawyers representing Wai'tuMusic)
  createApplicationLegalAssignment(
    assignment: InsertApplicationLegalAssignment
  ): Promise<ApplicationLegalAssignment>;
  getApplicationLegalAssignments(
    applicationId: number
  ): Promise<ApplicationLegalAssignment[]>;
  getApplicationsByAssignedLawyer(
    lawyerUserId: number
  ): Promise<ApplicationLegalAssignment[]>;
  removeApplicationLegalAssignment(assignmentId: number): Promise<void>;
  checkLegalConflictOfInterest(
    lawyerUserId: number
  ): Promise<{ hasConflict: boolean; conflictDetails?: any[] }>;
  getAvailableLawyersForWaituMusic(): Promise<any[]>;

  // System data
  getSystemSettings(): Promise<any[]>;
  getActivityLogs(): Promise<any[]>;

  // Stage Plots
  getStagePlots(): Promise<any[]>;
  getStagePlot(id: number): Promise<any>;
  createStagePlot(stagePlot: any): Promise<any>;
  updateStagePlot(id: number, updates: any): Promise<any>;
  deleteStagePlot(id: number): Promise<void>;

  // Mixer Patch Lists
  getMixerPatchLists(): Promise<any[]>;
  getMixerPatchList(id: number): Promise<any>;
  createMixerPatchList(patchList: any): Promise<any>;
  updateMixerPatchList(id: number, updates: any): Promise<any>;
  deleteMixerPatchList(id: number): Promise<void>;

  // Setlist Templates
  getSetlistTemplates(): Promise<any[]>;
  getSetlistTemplate(id: number): Promise<any>;
  createSetlistTemplate(template: any): Promise<any>;
  updateSetlistTemplate(id: number, updates: any): Promise<any>;
  deleteSetlistTemplate(id: number): Promise<void>;

  // Financial Automation - Invoice Management
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  getInvoice(id: number): Promise<Invoice | undefined>;
  getInvoiceById(id: number): Promise<Invoice | undefined>;
  getAllInvoices(): Promise<Invoice[]>;
  getInvoicesByBooking(bookingId: number): Promise<Invoice[]>;
  updateInvoiceStatus(id: number, status: string): Promise<Invoice | undefined>;
  generateInvoiceNumber(): Promise<string>;

  // Financial Automation - Payout Request Management
  createPayoutRequest(
    payoutRequest: InsertPayoutRequest
  ): Promise<PayoutRequest>;
  getPayoutRequest(id: number): Promise<PayoutRequest | undefined>;
  getAllPayoutRequests(): Promise<PayoutRequest[]>;
  getPayoutRequestsByBooking(bookingId: number): Promise<PayoutRequest[]>;
  getPayoutRequestsByPerformer(
    performerUserId: number
  ): Promise<PayoutRequest[]>;
  updatePayoutRequestStatus(
    id: number,
    status: string
  ): Promise<PayoutRequest | undefined>;
  generatePayoutRequestNumber(): Promise<string>;

  // Financial Automation - Document Linkage System
  createDocumentLinkage(
    linkage: InsertDocumentLinkage
  ): Promise<DocumentLinkage>;
  getDocumentLinkages(
    sourceType: string,
    sourceId: number
  ): Promise<DocumentLinkage[]>;
  getLinkedDocuments(
    documentType: string,
    documentId: number
  ): Promise<DocumentLinkage[]>;

  // Financial Automation - Payment Transaction Tracking
  createPaymentTransaction(
    transaction: InsertPaymentTransaction
  ): Promise<PaymentTransaction>;
  getPaymentTransaction(id: number): Promise<PaymentTransaction | undefined>;
  getPaymentTransactionsByBooking(
    bookingId: number
  ): Promise<PaymentTransaction[]>;
  getPaymentTransactionsByInvoice(
    invoiceId: number
  ): Promise<PaymentTransaction[]>;
  updatePaymentTransactionStatus(
    id: number,
    status: string
  ): Promise<PaymentTransaction | undefined>;

  // Financial Automation - Audit Trail
  createFinancialAuditLog(
    auditLog: InsertFinancialAuditLog
  ): Promise<FinancialAuditLog>;
  getFinancialAuditLogs(
    entityType: string,
    entityId: number
  ): Promise<FinancialAuditLog[]>;

  // Financial Automation - Payments & Receipts (Enhanced)
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPayment(id: number): Promise<Payment | undefined>;
  getPaymentsByBooking(bookingId: number): Promise<Payment[]>;
  updatePaymentStatus(id: number, status: string): Promise<Payment | undefined>;

  createReceipt(receipt: InsertReceipt): Promise<Receipt>;
  getReceipt(id: number): Promise<Receipt | undefined>;
  getReceiptsByBooking(bookingId: number): Promise<Receipt[]>;
  generateReceiptNumber(): Promise<string>;

  // AI-related features removed as platform is 100% AI-free

  // OppHub - Opportunity Hub operations
  getOpportunityCategories(): Promise<OpportunityCategory[]>;
  createOpportunityCategory(
    category: InsertOpportunityCategory
  ): Promise<OpportunityCategory>;
  updateOpportunityCategory(
    id: number,
    updates: Partial<InsertOpportunityCategory>
  ): Promise<OpportunityCategory | null>;

  getOpportunities(filters?: {
    status?: string;
    isDemo?: boolean;
    categoryId?: number;
    isVerified?: boolean;
  }): Promise<any[]>;
  createOpportunity(opportunity: InsertOpportunity): Promise<Opportunity>;
  getOpportunityById(id: number): Promise<Opportunity | null>;
  updateOpportunity(
    id: number,
    updates: Partial<InsertOpportunity>
  ): Promise<Opportunity | null>;
  deleteOpportunity(id: number): Promise<boolean>;
  incrementOpportunityViews(id: number): Promise<void>;

  getOpportunityApplications(filters?: {
    opportunityId?: number;
    applicantUserId?: number;
    isDemo?: boolean;
  }): Promise<OpportunityApplication[]>;
  createOpportunityApplication(
    application: InsertOpportunityApplication
  ): Promise<OpportunityApplication>;
  getOpportunityApplicationById(
    id: number
  ): Promise<OpportunityApplication | null>;
  updateOpportunityApplicationStatus(
    id: number,
    status: string,
    reviewNotes?: string,
    reviewedBy?: number
  ): Promise<OpportunityApplication | null>;

  getOppHubSubscriptions(filters?: {
    userId?: number;
    status?: string;
  }): Promise<OppHubSubscription[]>;
  createOppHubSubscription(
    subscription: InsertOppHubSubscription
  ): Promise<OppHubSubscription>;
  getOppHubSubscriptionByUserId(
    userId: number
  ): Promise<OppHubSubscription | null>;
  updateOppHubSubscription(
    id: number,
    updates: Partial<InsertOppHubSubscription>
  ): Promise<OppHubSubscription | null>;
  incrementApplicationsUsed(userId: number): Promise<void>;

  getMarketIntelligence(filters?: {
    status?: string;
    sourceType?: string;
  }): Promise<MarketIntelligence[]>;
  createMarketIntelligence(
    intelligence: InsertMarketIntelligence
  ): Promise<MarketIntelligence>;
  updateMarketIntelligenceStatus(
    id: number,
    status: string,
    reviewNotes?: string,
    reviewedBy?: number
  ): Promise<MarketIntelligence | null>;

  getOpportunitySources(): Promise<OpportunitySource[]>;
  createOpportunitySource(
    source: InsertOpportunitySource
  ): Promise<OpportunitySource>;
  updateOpportunitySourceLastScraped(
    id: number,
    opportunitiesFound: number
  ): Promise<void>;

  getOpportunityMatches(filters?: {
    artistId?: number;
    opportunityId?: number;
  }): Promise<OpportunityMatch[]>;
  createOpportunityMatch(
    match: InsertOpportunityMatch
  ): Promise<OpportunityMatch>;
  updateOpportunityMatchInteraction(
    id: number,
    interactionType: string
  ): Promise<void>;

  // PRO Registration methods
  getPRORegistrations(userId?: number): Promise<PRORegistration[]>;
  createPRORegistration(
    registration: InsertPRORegistration
  ): Promise<PRORegistration>;
  getPRORegistrationById(id: number): Promise<PRORegistration | null>;
  updatePRORegistration(
    id: number,
    updates: Partial<InsertPRORegistration>
  ): Promise<PRORegistration | null>;
  getPROWorks(proRegistrationId: number): Promise<PROWork[]>;
  createPROWork(work: InsertPROWork): Promise<PROWork>;
  updatePROWork(
    id: number,
    updates: Partial<InsertPROWork>
  ): Promise<PROWork | null>;
  createPROEligibilityAssessment(
    assessment: InsertPROEligibilityAssessment
  ): Promise<PROEligibilityAssessment>;
  getPROEligibilityAssessment(
    userId: number
  ): Promise<PROEligibilityAssessment | null>;

  // Press Release Management
  getPressReleases(filters?: {
    artistId?: number;
    status?: string;
  }): Promise<PressRelease[]>;
  createPressRelease(pressRelease: InsertPressRelease): Promise<PressRelease>;
  getPressReleaseById(id: number): Promise<PressRelease | null>;
  updatePressRelease(
    id: number,
    updates: Partial<InsertPressRelease>
  ): Promise<PressRelease | null>;
  deletePressRelease(id: number): Promise<boolean>;
  publishPressRelease(
    id: number,
    publishedBy: number
  ): Promise<PressRelease | null>;

  // Press Release Assignments
  getPressReleaseAssignments(
    pressReleaseId: number
  ): Promise<PressReleaseAssignment[]>;
  createPressReleaseAssignment(
    assignment: InsertPressReleaseAssignment
  ): Promise<PressReleaseAssignment>;
  deletePressReleaseAssignment(id: number): Promise<boolean>;

  // Press Release Media
  getPressReleaseMedia(pressReleaseId: number): Promise<PressReleaseMedia[]>;
  createPressReleaseMedia(
    media: InsertPressReleaseMedia
  ): Promise<PressReleaseMedia>;
  updatePressReleaseMedia(
    id: number,
    updates: Partial<InsertPressReleaseMedia>
  ): Promise<PressReleaseMedia | null>;
  deletePressReleaseMedia(id: number): Promise<boolean>;

  // Press Release Distribution
  getPressReleaseDistribution(
    pressReleaseId: number
  ): Promise<PressReleaseDistribution[]>;
  createPressReleaseDistribution(
    distribution: InsertPressReleaseDistribution
  ): Promise<PressReleaseDistribution>;
  updatePressReleaseDistributionStatus(
    id: number,
    status: string,
    responseType?: string
  ): Promise<PressReleaseDistribution | null>;

  // ==================== RECIPIENT MANAGEMENT METHODS ====================

  // Recipient Categories
  getRecipientCategories(): Promise<RecipientCategory[]>;
  createRecipientCategory(
    category: InsertRecipientCategory
  ): Promise<RecipientCategory>;
  updateRecipientCategory(
    id: number,
    updates: Partial<InsertRecipientCategory>
  ): Promise<RecipientCategory | null>;
  deleteRecipientCategory(id: number): Promise<boolean>;

  // Music Genres
  getMusicGenres(): Promise<MusicGenre[]>;
  createMusicGenre(genre: InsertMusicGenre): Promise<MusicGenre>;
  updateMusicGenre(
    id: number,
    updates: Partial<InsertMusicGenre>
  ): Promise<MusicGenre | null>;
  deleteMusicGenre(id: number): Promise<boolean>;

  // Industry Recipients
  getIndustryRecipients(filters?: {
    categoryId?: number;
    genreIds?: number[];
    status?: string;
  }): Promise<IndustryRecipient[]>;
  getIndustryRecipientById(id: number): Promise<IndustryRecipient | null>;
  createIndustryRecipient(
    recipient: InsertIndustryRecipient
  ): Promise<IndustryRecipient>;
  updateIndustryRecipient(
    id: number,
    updates: Partial<InsertIndustryRecipient>
  ): Promise<IndustryRecipient | null>;
  deleteIndustryRecipient(id: number): Promise<boolean>;
  searchIndustryRecipients(query: string): Promise<IndustryRecipient[]>;

  // Content Distribution (Unified for Newsletters and Press Releases)
  getContentDistribution(
    contentType: string,
    contentId: number
  ): Promise<ContentDistribution | null>;
  createContentDistribution(
    distribution: InsertContentDistribution
  ): Promise<ContentDistribution>;
  updateContentDistribution(
    id: number,
    updates: Partial<InsertContentDistribution>
  ): Promise<ContentDistribution | null>;
  deleteContentDistribution(id: number): Promise<boolean>;
  getContentDistributionsByType(
    contentType: string
  ): Promise<ContentDistribution[]>;
  getContentDistributionAnalytics(
    contentType: string,
    contentId: number
  ): Promise<ContentDistribution | null>;

  // Recipient Engagements
  getRecipientEngagements(filters?: {
    recipientId?: number;
    contentType?: string;
    contentId?: number;
  }): Promise<RecipientEngagement[]>;
  createRecipientEngagement(
    engagement: InsertRecipientEngagement
  ): Promise<RecipientEngagement>;
  updateRecipientEngagement(
    id: number,
    updates: Partial<InsertRecipientEngagement>
  ): Promise<RecipientEngagement | null>;

  // Enhanced Recipient Matching Methods
  getMatchingRecipients(
    contentGenres: number[],
    categoryIds?: number[],
    minimumInfluence?: number
  ): Promise<IndustryRecipient[]>;
  getRecipientsByCategory(categoryId: number): Promise<IndustryRecipient[]>;
  getRecipientsByGenre(genreId: number): Promise<IndustryRecipient[]>;

  // Album-Merchandise Assignment System (Post-Upload Ingenious Workflow)
  getAlbumMerchandiseAssignments(albumId?: number): Promise<any[]>;
  createAlbumMerchandiseAssignment(assignment: any): Promise<any>;
  removeAlbumMerchandiseAssignment(id: number): Promise<void>;
  getAssignmentsByMerchandise(merchandiseId: number): Promise<any[]>;

  // Admin talent assignments (real database queries)
  getAdminTalentAssignments(talentUserId?: number): Promise<any[]>;
  getManagementTeamForTalent(talentUserId: number): Promise<any[]>;
  assignAdminToTalent(
    adminUserId: number,
    talentUserId: number,
    assignmentType: string
  ): Promise<any>;
  removeAdminTalentAssignment(
    adminUserId: number,
    talentUserId: number
  ): Promise<boolean>;

  // Admin Dashboard Specific Methods
  getUsersCount(): Promise<number>;
  getActiveUsersCount(): Promise<number>;
  getNewUsersThisMonth(): Promise<number>;
  getBookingsCount(): Promise<number>;
  getCompletedBookingsCount(): Promise<number>;
  getTotalRevenue(): Promise<number>;
  getMonthlyRevenue(): Promise<number>;
  getWeeklyRevenue(): Promise<number>;
  getPendingPayouts(): Promise<number>;
  getPendingApprovalsCount(): Promise<number>;
  getActiveBookingsCount(): Promise<number>;
  getContentItemsCount(): Promise<number>;
  getTopArtists(): Promise<
    { name: string; bookings: number; revenue: number }[]
  >;
  getPendingItems(): Promise<any[]>;
  getContentForModeration(): Promise<any[]>;
  getBookingApprovals(): Promise<any[]>;
  getRecentTransactions(): Promise<any[]>;
  getUsers(options?: { limit?: number }): Promise<User[]>;

  // All-Links subscription methods
  getAllLinksSubscriptionByUserId(userId: number): Promise<any>;
  createAllLinksSubscription(subscription: any): Promise<any>;
  updateAllLinksSubscription(userId: number, updates: any): Promise<any>;
  getWebsiteBlocklist(): Promise<any[]>;
  createWebsiteBlocklistEntry(entry: any): Promise<any>;
  checkAndApplyPenalties(domain: string): Promise<void>;
  getUserIdByStripeSubscriptionId(
    subscriptionId: string
  ): Promise<number | null>;
  createOauthAccount(account: any): Promise<any>;
  createFanSubscription(subscription: any): Promise<any>;

  // CONTENT MANAGEMENT SYSTEM METHODS
  // Text Content Management
  getAllTextContent(): Promise<any[]>;
  getTextContentByKey(contentKey: string): Promise<any | null>;
  createTextContent(data: any): Promise<any>;
  updateTextContent(id: number, data: any): Promise<any>;
  deleteTextContent(id: number): Promise<boolean>;
  getTextContentByComponent(componentLocation: string): Promise<any[]>;

  // Typography Control
  getAllTypographyStyles(): Promise<any[]>;
  getTypographyByKey(typographyKey: string): Promise<any | null>;
  createTypographyStyle(data: any): Promise<any>;
  updateTypographyStyle(id: number, data: any): Promise<any>;
  deleteTypographyStyle(id: number): Promise<boolean>;
  getTypographyByCategory(category: string): Promise<any[]>;

  // Color Scheme Management
  getAllColorSchemes(): Promise<any[]>;
  getDefaultColorScheme(): Promise<any | null>;
  createColorScheme(data: any): Promise<any>;
  updateColorScheme(id: number, data: any): Promise<any>;
  deleteColorScheme(id: number): Promise<boolean>;
  setDefaultColorScheme(id: number): Promise<boolean>;

  // Color Management
  getColorsForScheme(schemeId: number): Promise<any[]>;
  createColor(data: any): Promise<any>;
  updateColor(id: number, data: any): Promise<any>;
  deleteColor(id: number): Promise<boolean>;

  // Component Styling
  getAllComponentStyles(): Promise<any[]>;
  getComponentStylesByType(componentType: string): Promise<any[]>;
  createComponentStyle(data: any): Promise<any>;
  updateComponentStyle(id: number, data: any): Promise<any>;
  deleteComponentStyle(id: number): Promise<boolean>;

  // Layout Controls
  getAllLayoutControls(): Promise<any[]>;
  getLayoutControlsByCategory(category: string): Promise<any[]>;
  createLayoutControl(data: any): Promise<any>;
  updateLayoutControl(id: number, data: any): Promise<any>;
  deleteLayoutControl(id: number): Promise<boolean>;

  // Theme Management
  getAllThemes(): Promise<any[]>;
  getDefaultTheme(): Promise<any | null>;
  createTheme(data: any): Promise<any>;
  updateTheme(id: number, data: any): Promise<any>;
  deleteTheme(id: number): Promise<boolean>;
  generateThemeCSS(themeId: number): Promise<string>;
  applyTheme(themeId: number): Promise<boolean>;

  // MediaHub Document Management
  getBookingDocuments(bookingId: number): Promise<any[]>;
  isUserAssignedToBooking(userId: number, bookingId: number): Promise<boolean>;
  hasDocumentPermission(documentId: number, userId: number): Promise<boolean>;
  userHasBookingAccess(userId: number, bookingId: number): Promise<boolean>;
  createBookingDocument(document: any): Promise<any>;
  updateDocumentVisibility(
    documentId: number,
    visibility: string,
    permissions: any[]
  ): Promise<any>;
  getDocument(documentId: number): Promise<any | undefined>;
  deleteDocument(documentId: number): Promise<boolean>;
}

export class MemStorage {
  // Note: MemStorage is simplified for demo purposes - many methods throw "not implemented" errors
  private users: Map<number, User>;
  // Removed userProfiles - user data is normalized in other tables
  private artists: Map<number, Artist>;
  private musicians: Map<number, Musician>;
  private professionals: Map<number, Professional>;
  private songs: Map<number, Song>;
  private albums: Map<number, Album>;
  private merchandise: Map<number, Merchandise>;
  private bookings: Map<number, Booking>;
  private roles: Role[];
  private managementTiers: ManagementTier[];
  private events: Map<number, Event>;
  private documents: Map<number, Document>;

  private currentUserId: number;
  private currentSongId: number;
  private currentAlbumId: number;
  private currentMerchandiseId: number;
  private currentBookingId: number;
  private currentEventId: number;
  private currentDocumentId: number;

  constructor() {
    this.users = new Map();
    // Removed userProfiles initialization - user data is normalized
    this.artists = new Map();
    this.musicians = new Map();
    this.professionals = new Map();
    this.songs = new Map();
    this.albums = new Map();
    this.merchandise = new Map();
    this.bookings = new Map();
    this.events = new Map();
    this.documents = new Map();

    // Initialize demo data
    this.initializeDemoBookings();

    this.currentUserId = 1;
    this.currentSongId = 1;
    this.currentAlbumId = 1;
    this.currentMerchandiseId = 1;
    this.currentBookingId = 1;
    this.currentEventId = 1;
    this.currentDocumentId = 1;

    // Initialize default roles and management tiers
    this.roles = [
      { id: 1, name: "superadmin" },
      { id: 2, name: "admin" },
      { id: 3, name: "managed_artist" },
      { id: 4, name: "artist" },
      { id: 5, name: "managed_musician" },
      { id: 6, name: "musician" },
      { id: 7, name: "managed_professional" },
      { id: 8, name: "professional" },
      { id: 9, name: "fan" },
    ];

    this.managementTiers = [
      {
        id: 1,
        name: "Publisher",
        description:
          "We publish your music worldwide. Full creative control, standard service fees.",
        maxDiscountPercentage: 10,
        appliesTo: ["artist", "musician"],
      },
      {
        id: 2,
        name: "Representation",
        description:
          "We handle your music business professionally without managing your career. Enjoy discounted services and industry representation.",
        maxDiscountPercentage: 50,
        appliesTo: ["artist", "musician", "professional"],
      },
      {
        id: 3,
        name: "Full Management",
        description:
          "Our team takes full responsibility for your career development, music releases, and strategic growth—with services included at no extra cost.",
        maxDiscountPercentage: 100,
        appliesTo: ["artist", "musician", "professional"],
      },
    ];

    this.initializeDemoData();
  }

  private initializeDemoData() {
    // Create demo superadmin user
    const superadmin: User = {
      id: this.currentUserId++,
      email: "superadmin@waitumusic.com",
      passwordHash:
        "$2b$10$B7kd9KfBfyE1iyK8WuDzIOo/175.TnJBGVeRpszv4UdrIbC/aBfPO", // secret123
      fullName: "Super Administrator",
      roleId: 1,
      phoneNumber: null,
      gender: null,
      status: "active",
      privacySetting: null,
      avatarUrl: null,
      coverImageUrl: null,
      isDemo: true,
      createdAt: new Date(),
      lastLogin: null,
    };
    this.users.set(superadmin.id, superadmin);

    // Create demo artist
    const artist: User = {
      id: this.currentUserId++,
      email: "sarah@waitumusic.com",
      passwordHash:
        "$2b$10$B7kd9KfBfyE1iyK8WuDzIOo/175.TnJBGVeRpszv4UdrIbC/aBfPO", // secret123
      fullName: "Sarah Chen",
      roleId: 3,
      phoneNumber: null,
      gender: null,
      status: "active",
      privacySetting: null,
      avatarUrl: null,
      coverImageUrl: null,
      isDemo: true,
      createdAt: new Date(),
      lastLogin: null,
    };
    this.users.set(artist.id, artist);

    // Create artist profile with normalized schema properties
    const artistProfile: Artist = {
      userId: artist.id,
      stageName: "Sarah Chen Quartet",
      bio: null,
      epkUrl: null,
      primaryGenre: "Jazz",
      basePrice: "1500.00",
      idealPerformanceRate: null,
      minimumAcceptableRate: null,
      isManaged: true,
      managementTierId: 1,
      bookingFormPictureUrl: null,
      performingRightsOrganization: null,
      ipiNumber: null,
      primaryTalentId: 1,
      isDemo: true,
    };
    this.artists.set(artist.id, artistProfile);

    // Create demo musicians
    const musician1: User = {
      id: this.currentUserId++,
      email: "marcus@waitumusic.com",
      passwordHash:
        "$2b$10$B7kd9KfBfyE1iyK8WuDzIOo/175.TnJBGVeRpszv4UdrIbC/aBfPO", // secret123
      fullName: "Marcus Thompson",
      roleId: 5,
      phoneNumber: null,
      gender: null,
      status: "active",
      privacySetting: null,
      avatarUrl: null,
      coverImageUrl: null,
      isDemo: true,
      createdAt: new Date(),
      lastLogin: null,
    };
    this.users.set(musician1.id, musician1);

    const musicianProfile1: Musician = {
      userId: musician1.id,
      stageName: "Marcus Thompson",
      primaryGenre: "R&B",
      basePrice: "800.00",
      idealPerformanceRate: "800.00",
      minimumAcceptableRate: "75.00",
      managementTierId: 2,
      isManaged: true,
      bookingFormPictureUrl: null,
      performingRightsOrganization: null,
      ipiNumber: null,
      primaryTalentId: 2,
      isDemo: true,
    };
    this.musicians.set(musician1.id, musicianProfile1);

    const musician2: User = {
      id: this.currentUserId++,
      email: "alex@waitumusic.com",
      passwordHash:
        "$2b$10$B7kd9KfBfyE1iyK8WuDzIOo/175.TnJBGVeRpszv4UdrIbC/aBfPO", // secret123
      fullName: "Alex Rivera",
      roleId: 6,
      phoneNumber: null,
      gender: null,
      status: "active",
      privacySetting: null,
      avatarUrl: null,
      coverImageUrl: null,
      isDemo: true,
      createdAt: new Date(),
      lastLogin: null,
    };
    this.users.set(musician2.id, musician2);

    const musicianProfile2: Musician = {
      userId: musician2.id,
      stageName: "Alex Rivera",
      primaryGenre: "Rock",
      basePrice: "600.00",
      idealPerformanceRate: "600.00",
      minimumAcceptableRate: "60.00",
      managementTierId: null,
      isManaged: false,
      bookingFormPictureUrl: null,
      performingRightsOrganization: null,
      ipiNumber: null,
      primaryTalentId: 3,
      isDemo: true,
    };
    this.musicians.set(musician2.id, musicianProfile2);
  }

  private initializeDemoBookings() {
    // Demo booking 1
    const booking1: Booking = {
      id: 1,
      clientName: "Wedding Celebration Inc",
      clientEmail: "sarah@weddingcelebration.com",
      eventName: "Sarah & Mike's Wedding Reception",
      eventDate: new Date("2025-08-15"),
      eventTime: "19:00",
      venueName: "Grand Ballroom Hotel",
      venueAddress: "123 Main St, Los Angeles, CA",
      eventType: "Wedding",
      guestCount: 150,
      duration: "4 hours",
      specificRequirements: "First dance at 8pm, acoustic ceremony set needed",
      totalBudget: "5000.00",
      status: "pending",
      createdAt: new Date(),
      bookerUserId: 2,
      primaryArtistUserId: 2,
      assignedMusicians: [],
      contracts: [],
      payments: [],
      signatures: [],
    };
    this.bookings.set(1, booking1);

    // Demo booking 2
    const booking2: Booking = {
      id: 2,
      clientName: "Corporate Events LLC",
      clientEmail: "events@corporateevents.com",
      eventName: "Annual Company Gala",
      eventDate: "2025-09-20",
      eventTime: "18:30",
      venueName: "Convention Center",
      venueAddress: "456 Business Ave, New York, NY",
      eventType: "Corporate",
      guestCount: 300,
      duration: "3 hours",
      specificRequirements:
        "Background music during dinner, energetic dance set after 9pm",
      totalBudget: "8000.00",
      status: "confirmed",
      createdAt: new Date(),
      bookerUserId: 3,
      primaryArtistUserId: 3,
      assignedMusicians: [4],
      contracts: [],
      payments: [],
      signatures: [],
    };
    this.bookings.set(2, booking2);

    this.currentBookingId = 3;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((user) => user.email === email);
  }

  // Enhanced splitsheet methods for comprehensive user assignment and workflow
  async createEnhancedSplitsheet(data: any): Promise<any> {
    try {
      const [splitsheet] = await db
        .insert(enhancedSplitsheets)
        .values(data)
        .returning();
      return splitsheet;
    } catch (error) {
      console.error("Error creating enhanced splitsheet:", error);
      throw error;
    }
  }

  async getEnhancedSplitsheet(id: number): Promise<any> {
    try {
      const [splitsheet] = await db
        .select()
        .from(enhancedSplitsheets)
        .where(eq(enhancedSplitsheets.id, id));
      return splitsheet;
    } catch (error) {
      console.error("Error fetching enhanced splitsheet:", error);
      return null;
    }
  }

  async updateEnhancedSplitsheet(id: number, data: any): Promise<any> {
    try {
      const [updated] = await db
        .update(enhancedSplitsheets)
        .set(data)
        .where(eq(enhancedSplitsheets.id, id))
        .returning();
      return updated;
    } catch (error) {
      console.error("Error updating enhanced splitsheet:", error);
      throw error;
    }
  }

  async getUserEnhancedSplitsheets(userId: number): Promise<any[]> {
    try {
      // Get splitsheets where user is creator or participant
      const splitsheets = await db
        .select()
        .from(enhancedSplitsheets)
        .where(
          or(
            eq(enhancedSplitsheets.createdBy, userId),
            sql`EXISTS (
              SELECT 1 FROM jsonb_array_elements(participants) AS p 
              WHERE (p->>'assignedUserId')::int = ${userId}
            )`
          )
        )
        .orderBy(desc(enhancedSplitsheets.createdAt));

      return splitsheets;
    } catch (error) {
      console.error("Error fetching user enhanced splitsheets:", error);
      return [];
    }
  }

  async createEnhancedSplitsheetNotification(data: any): Promise<any> {
    try {
      const [notification] = await db
        .insert(enhancedSplitsheetNotifications)
        .values(data)
        .returning();
      return notification;
    } catch (error) {
      console.error("Error creating splitsheet notification:", error);
      throw error;
    }
  }

  async updateEnhancedSplitsheetNotification(
    id: number,
    data: any
  ): Promise<any> {
    try {
      const [updated] = await db
        .update(enhancedSplitsheetNotifications)
        .set(data)
        .where(eq(enhancedSplitsheetNotifications.id, id))
        .returning();
      return updated;
    } catch (error) {
      console.error("Error updating splitsheet notification:", error);
      throw error;
    }
  }

  async createAudioFileMetadata(data: any): Promise<any> {
    try {
      const [metadata] = await db
        .insert(audioFileMetadata)
        .values(data)
        .returning();
      return metadata;
    } catch (error) {
      console.error("Error creating audio file metadata:", error);
      throw error;
    }
  }

  async getAudioFileMetadata(enhancedSplitsheetId: number): Promise<any> {
    try {
      const [metadata] = await db
        .select()
        .from(audioFileMetadata)
        .where(
          eq(audioFileMetadata.enhancedSplitsheetId, enhancedSplitsheetId)
        );
      return metadata;
    } catch (error) {
      console.error("Error fetching audio file metadata:", error);
      return null;
    }
  }

  async searchAssignableTalent(search: string): Promise<any[]> {
    try {
      if (!search || search.length < 3) {
        return [];
      }

      // Search for users with talent roles
      const talentUsers = await db
        .select({
          id: users.id,
          fullName: users.fullName,
          email: users.email,
          roleId: users.roleId,
        })
        .from(users)
        .where(
          and(
            inArray(users.roleId, [3, 4, 5, 6, 7, 8]), // Artist, Managed Artist, Musician, Managed Musician, Professional, Managed Professional
            or(
              sql`LOWER(${users.fullName}) LIKE LOWER(${`%${search}%`})`,
              sql`LOWER(${users.email}) LIKE LOWER(${`%${search}%`})`
            )
          )
        )
        .limit(10);

      return talentUsers;
    } catch (error) {
      console.error("Error searching assignable talent:", error);
      return [];
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      id,
      email: insertUser.email,
      passwordHash: insertUser.passwordHash,
      fullName: insertUser.fullName,
      roleId: insertUser.roleId,
      status: insertUser.status || "active",
      phoneNumber: insertUser.phoneNumber || null,
      gender: insertUser.gender || null,
      privacySetting: insertUser.privacySetting || "public",
      avatarUrl: insertUser.avatarUrl || null,
      coverImageUrl: insertUser.coverImageUrl || null,
      isDemo: insertUser.isDemo || false,
      createdAt: new Date(),
      lastLogin: null,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(
    id: number,
    updates: Partial<User>
  ): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getUserProfile(userId: number): Promise<any | undefined> {
    // User profiles are now normalized across multiple tables
    // Return undefined for MemStorage since we don't have user profiles in memory
    return undefined;
  }

  async createUserProfile(profile: any): Promise<any> {
    // User profiles are now normalized across multiple tables
    // Not implemented in MemStorage
    throw new Error(
      "User profiles are normalized across multiple tables - not implemented in MemStorage"
    );
  }

  async updateUserProfile(
    userId: number,
    updates: any
  ): Promise<any | undefined> {
    // User profiles are now normalized across multiple tables
    // Not implemented in MemStorage
    throw new Error(
      "User profiles are normalized across multiple tables - not implemented in MemStorage"
    );
  }

  // async getRoles(): Promise<Role[]> {
  //   return this.roles;
  // }

  async getManagementTiers(): Promise<ManagementTier[]> {
    return this.managementTiers;
  }

  async createArtist(artist: InsertArtist): Promise<Artist> {
    const artistRecord: Artist = {
      userId: artist.userId,
      stageName: artist.stageName,
      bio: artist.bio || null,
      epkUrl: artist.epkUrl || null,
      primaryGenre: artist.primaryGenre || null,
      basePrice: artist.basePrice || null,
      idealPerformanceRate: artist.idealPerformanceRate || null,
      minimumAcceptableRate: artist.minimumAcceptableRate || null,
      isManaged: artist.isManaged || false,
      managementTierId: artist.managementTierId || null,
      bookingFormPictureUrl: artist.bookingFormPictureUrl || null,
      isRegisteredWithPro: artist.isRegisteredWithPro || false,
      performingRightsOrganization: artist.performingRightsOrganization || null,
      ipiNumber: artist.ipiNumber || null,
      primaryTalentId: artist.primaryTalentId,
      isDemo: artist.isDemo || false,
      isComplete: artist.isComplete || false,
    };

    this.artists.set(artist.userId, artistRecord);
    return artistRecord;
  }

  async updateArtist(
    userId: number,
    updates: Partial<Artist>
  ): Promise<Artist | undefined> {
    const artist = this.artists.get(userId);
    if (!artist) return undefined;

    const updatedArtist = { ...artist, ...updates };
    this.artists.set(userId, updatedArtist);
    return updatedArtist;
  }

  async getMusician(userId: number): Promise<Musician | undefined> {
    return this.musicians.get(userId);
  }

  async getMusicians(): Promise<Musician[]> {
    // Return in-memory musicians with proper data structure
    console.log("Returning in-memory musicians:", this.musicians.size);
    return Array.from(this.musicians.values());
  }

  async createMusician(musician: InsertMusician): Promise<Musician> {
    const musicianRecord: Musician = {
      userId: musician.userId,
      stageNames: musician.stageNames || [],
      primaryGenre: musician.primaryGenre || null,
      secondaryGenres: musician.secondaryGenres || [],
      topGenres: musician.topGenres || [],
      socialMediaHandles: musician.socialMediaHandles || {},
      instruments: musician.instruments || [],
      basePrice: musician.basePrice || null,
      idealPerformanceRate: musician.idealPerformanceRate || null,
      minimumAcceptableRate: musician.minimumAcceptableRate || null,
      managementTierId: musician.managementTierId || null,
      isManaged: musician.isManaged || false,
      bookingFormPictureUrl: musician.bookingFormPictureUrl || null,
      performingRightsOrganization:
        musician.performingRightsOrganization || null,
      ipiNumber: musician.ipiNumber || null,
      technicalRiderProfile: musician.technicalRiderProfile || null,
    };
    this.musicians.set(musician.userId, musicianRecord);
    return musicianRecord;
  }

  async getProfessional(userId: number): Promise<Professional | undefined> {
    try {
      const result = await db
        .select()
        .from(professionals)
        .where(eq(professionals.userId, userId));
      return result[0];
    } catch (error) {
      console.error("Error fetching professional:", error);
      return undefined;
    }
  }

  async getProfessionals(): Promise<Professional[]> {
    try {
      const result = await db.select().from(professionals);
      return result;
    } catch (error) {
      console.error("Error fetching professionals:", error);
      return [];
    }
  }

  async createProfessional(
    professional: InsertProfessional
  ): Promise<Professional> {
    try {
      const result = await db
        .insert(professionals)
        .values(professional)
        .returning();
      return result[0];
    } catch (error) {
      console.error("Error creating professional:", error);
      throw error;
    }
  }

  async getSong(id: number): Promise<Song | undefined> {
    return this.songs.get(id);
  }

  async getSongs(): Promise<Song[]> {
    return Array.from(this.songs.values());
  }

  async getSongsByArtist(artistUserId: number): Promise<Song[]> {
    return Array.from(this.songs.values()).filter(
      (song) => song.artistUserId === artistUserId
    );
  }

  async createSong(song: InsertSong): Promise<Song> {
    const id = this.currentSongId++;
    const songRecord: Song = {
      id,
      title: song.title,
      artistUserId: song.artistUserId,
      mp3Url: song.mp3Url || null,
      coverArtUrl: song.coverArtUrl || null,
      isrcCode: song.isrcCode,
      price: song.price || null,
      isFree: song.isFree || null,
      durationSeconds: song.durationSeconds || null,
      previewStartSeconds: song.previewStartSeconds || null,
      createdAt: new Date(),
    };
    this.songs.set(id, songRecord);
    return songRecord;
  }

  async updateSong(
    id: number,
    updates: Partial<Song>
  ): Promise<Song | undefined> {
    const song = this.songs.get(id);
    if (!song) return undefined;

    const updatedSong = { ...song, ...updates };
    this.songs.set(id, updatedSong);
    return updatedSong;
  }

  async deleteSong(id: number): Promise<void> {
    this.songs.delete(id);
  }

  async getAlbum(id: number): Promise<Album | undefined> {
    return this.albums.get(id);
  }

  async getAlbumsByArtist(artistUserId: number): Promise<Album[]> {
    return Array.from(this.albums.values()).filter(
      (album) => album.artistUserId === artistUserId
    );
  }

  async createAlbum(album: InsertAlbum): Promise<Album> {
    const id = this.currentAlbumId++;
    const albumRecord: Album = {
      id,
      title: album.title,
      artistUserId: album.artistUserId,
      coverArtUrl: album.coverArtUrl || null,
      price: album.price || null,
      releaseDate: album.releaseDate || null,
      createdAt: new Date(),
    };
    this.albums.set(id, albumRecord);
    return albumRecord;
  }

  async getMerchandise(id: number): Promise<Merchandise | undefined> {
    return this.merchandise.get(id);
  }

  async getMerchandiseByArtist(artistUserId: number): Promise<Merchandise[]> {
    return Array.from(this.merchandise.values()).filter(
      (merch) => merch.artistUserId === artistUserId
    );
  }

  async createMerchandise(
    merchandise: InsertMerchandise
  ): Promise<Merchandise> {
    const id = this.currentMerchandiseId++;
    const merchandiseRecord: Merchandise = {
      id,
      name: merchandise.name,
      description: merchandise.description || null,
      price: merchandise.price,
      artistUserId: merchandise.artistUserId,
      inventory: merchandise.inventory || null,
      imageUrl: merchandise.imageUrl || null,
      createdAt: new Date(),
    };
    this.merchandise.set(id, merchandiseRecord);
    return merchandiseRecord;
  }

  async getBooking(id: number): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async getBookingsByUser(userId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      (booking) =>
        booking.bookerUserId === userId ||
        booking.primaryArtistUserId === userId
    );
  }

  async getAllBookings(): Promise<Booking[]> {
    return Array.from(this.bookings.values());
  }

  async getBookings(): Promise<Booking[]> {
    return Array.from(this.bookings.values());
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const id = this.currentBookingId++;
    const bookingRecord: Booking = {
      id,
      bookerUserId: booking.bookerUserId || null,
      primaryArtistUserId: booking.primaryArtistUserId,
      eventName: booking.eventName,
      eventType: booking.eventType,
      eventDate: booking.eventDate || null,
      venueName: booking.venueName || null,
      venueAddress: booking.venueAddress || null,
      requirements: booking.requirements || null,
      status: booking.status || "pending",
      totalBudget: booking.totalBudget || null,
      finalPrice: booking.finalPrice || null,
      guestName: booking.guestName || null,
      guestEmail: booking.guestEmail || null,
      guestPhone: booking.guestPhone || null,
      isGuestBooking: booking.isGuestBooking || false,
      assignedAdminId: booking.assignedAdminId || null,
      adminApprovedAt: booking.adminApprovedAt || null,
      contractsGenerated: booking.contractsGenerated || false,
      allSignaturesCompleted: booking.allSignaturesCompleted || false,
      paymentCompleted: booking.paymentCompleted || false,
      receiptGenerated: booking.receiptGenerated || false,
      workflowData: booking.workflowData || null,
      currentWorkflowStep: booking.currentWorkflowStep || 1,
      lastModified: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.bookings.set(id, bookingRecord);
    return bookingRecord;
  }

  async updateBookingStatus(
    id: number,
    status: string
  ): Promise<Booking | undefined> {
    const booking = this.bookings.get(id);
    if (!booking) return undefined;

    const updatedBooking = { ...booking, status };
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }

  async getEventsByArtist(artistUserId: number): Promise<Event[]> {
    return Array.from(this.events.values()).filter(
      (event) => event.artistUserId === artistUserId
    );
  }

  async getEventsByUser(userId: number): Promise<Event[]> {
    // Get events for user based on their role - could be artist events or booked events
    return Array.from(this.events.values()).filter(
      (event) => event.artistUserId === userId || event.bookerUserId === userId
    );
  }

  async getUpcomingEvents(): Promise<Event[]> {
    const now = new Date();
    return Array.from(this.events.values()).filter(
      (event) => event.eventDatetime && new Date(event.eventDatetime) > now
    );
  }

  async updateBooking(
    id: number,
    updates: Partial<Booking>
  ): Promise<Booking | undefined> {
    const booking = this.bookings.get(id);
    if (!booking) return undefined;

    const updatedBooking = {
      ...booking,
      ...updates,
      updatedAt: new Date(),
      lastModified: new Date(),
    };
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }

  async getBookingsByArtist(artistUserId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      (booking) => booking.primaryArtistUserId === artistUserId
    );
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createUserInteraction(
    interaction: InsertUserInteraction
  ): Promise<UserInteraction> {
    const userInteraction: UserInteraction = {
      id: Date.now(),
      userId: interaction.userId,
      songId: interaction.songId || null,
      artistId: interaction.artistId || null,
      albumId: interaction.albumId || null,
      interactionType: interaction.interactionType,
      duration: interaction.duration || null,
      createdAt: new Date(),
    };
    return userInteraction;
  }

  async getUserInteractions(userId: number): Promise<UserInteraction[]> {
    // Simple mock implementation for memory storage
    return [];
  }

  async getAllUserInteractions(): Promise<UserInteraction[]> {
    return [];
  }

  async getUserPreferences(
    userId: number
  ): Promise<UserPreferences | undefined> {
    return undefined;
  }

  async updateUserPreferences(
    userId: number,
    preferences: Partial<InsertUserPreferences>
  ): Promise<UserPreferences> {
    const userPreferences: UserPreferences = {
      id: Date.now(),
      userId,
      preferredGenres: preferences.preferredGenres || null,
      favoriteArtists: preferences.favoriteArtists || null,
      listeningHabits: preferences.listeningHabits || null,
      moodPreferences: preferences.moodPreferences || null,
      discoverySettings: preferences.discoverySettings || null,
      updatedAt: new Date(),
      createdAt: new Date(),
    };
    return userPreferences;
  }

  async createMusicRecommendation(
    recommendation: InsertMusicRecommendation
  ): Promise<MusicRecommendation> {
    const musicRecommendation: MusicRecommendation = {
      id: Date.now(),
      userId: recommendation.userId,
      songId: recommendation.songId || null,
      artistId: recommendation.artistId || null,
      albumId: recommendation.albumId || null,
      recommendationType: recommendation.recommendationType,
      score: recommendation.score || null,
      reasonCode: recommendation.reasonCode || null,
      isActive: recommendation.isActive || null,
      viewedAt: null,
      clickedAt: null,
      createdAt: new Date(),
    };
    return musicRecommendation;
  }

  async getUserRecommendations(
    userId: number,
    limit?: number
  ): Promise<MusicRecommendation[]> {
    return [];
  }

  async clearUserRecommendations(userId: number): Promise<void> {
    // Mock implementation
  }

  async updateRecommendationEngagement(
    recommendationId: number,
    engagementType: "viewed" | "clicked"
  ): Promise<void> {
    // Mock implementation
  }

  async createArtistSimilarity(
    similarity: InsertArtistSimilarity
  ): Promise<ArtistSimilarity> {
    const artistSimilarity: ArtistSimilarity = {
      id: Date.now(),
      artistId1: similarity.artistId1,
      artistId2: similarity.artistId2,
      similarityScore: similarity.similarityScore || null,
      commonGenres: similarity.commonGenres || null,
      sharedFans: similarity.sharedFans || null,
      calculatedAt: new Date(),
    };
    return artistSimilarity;
  }

  async getArtistSimilarities(artistId: number): Promise<ArtistSimilarity[]> {
    return [];
  }

  async getAllArtists(): Promise<Artist[]> {
    return Array.from(this.artists.values());
  }

  async getArtistFans(artistId: number): Promise<number[]> {
    return [];
  }

  async incrementTrendingMetric(
    metric: Partial<InsertTrendingMetric>
  ): Promise<void> {
    // Mock implementation
  }

  async getTrendingSongs(timeframe: string): Promise<Song[]> {
    return [];
  }

  async getActiveCrossPromotionCampaigns(): Promise<CrossPromotionCampaign[]> {
    return [];
  }

  async incrementCampaignImpressions(campaignId: number): Promise<void> {
    // Mock implementation
  }

  async getSongsByGenre(genre: string): Promise<Song[]> {
    return Array.from(this.songs.values()).filter((song) => {
      // Get artist for this song
      const artist = this.artists.get(song.artistUserId);
      return artist && artist.genre === genre;
    });
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    // Mock implementation - no username field in current schema
    return undefined;
  }

  // Service Management - Stub implementations for MemStorage
  async getServiceCategories(): Promise<ServiceCategory[]> {
    return [];
  }

  async createServiceCategory(
    category: InsertServiceCategory
  ): Promise<ServiceCategory> {
    return {
      id: 1,
      name: category.name,
      description: category.description || null,
      createdAt: new Date(),
    };
  }

  async getServices(): Promise<Service[]> {
    return [];
  }

  async getService(id: number): Promise<Service | undefined> {
    return undefined;
  }

  async createService(service: InsertService): Promise<Service> {
    return {
      id: 1,
      name: service.name,
      description: service.description || null,
      basePrice: service.basePrice || null,
      duration: service.duration || null,
      unit: service.unit || null,
      categoryId: service.categoryId || null,
      createdByUserId: service.createdByUserId,
      isActive: true,
      createdAt: new Date(),
    };
  }

  async updateService(
    id: number,
    updates: Partial<Service>
  ): Promise<Service | undefined> {
    return undefined;
  }

  async deleteService(id: number): Promise<boolean> {
    return true;
  }

  async getServiceAssignments(): Promise<ServiceAssignment[]> {
    return [];
  }

  async getServiceAssignmentsByUser(
    userId: number
  ): Promise<ServiceAssignment[]> {
    return [];
  }

  async getServiceAssignmentsByService(
    serviceId: number
  ): Promise<ServiceAssignment[]> {
    return [];
  }

  async createServiceAssignment(
    assignment: InsertServiceAssignment
  ): Promise<ServiceAssignment> {
    return { ...assignment, id: 1, isActive: true, assignedAt: new Date() };
  }

  async updateServiceAssignment(
    id: number,
    updates: Partial<ServiceAssignment>
  ): Promise<ServiceAssignment | undefined> {
    return undefined;
  }

  async deleteServiceAssignment(id: number): Promise<boolean> {
    return true;
  }

  async getUserServices(userId: number): Promise<UserService[]> {
    return [];
  }

  async getAllUserServices(): Promise<UserService[]> {
    return [];
  }

  async getUserService(id: number): Promise<UserService | undefined> {
    return undefined;
  }

  async createUserService(
    userService: InsertUserService
  ): Promise<UserService> {
    return {
      id: 1,
      userId: userService.userId,
      name: userService.name,
      description: userService.description || null,
      price: userService.price,
      duration: userService.duration || null,
      unit: userService.unit || null,
      features: userService.features || null,
      enableRating: userService.enableRating || null,
      categoryId: userService.categoryId || null,
      isActive: true,
      createdAt: new Date(),
    };
  }

  async updateUserService(
    id: number,
    updates: Partial<UserService>
  ): Promise<UserService | undefined> {
    return undefined;
  }

  async deleteUserService(id: number): Promise<boolean> {
    return true;
  }

  async getServiceReviews(
    serviceId?: number,
    userServiceId?: number
  ): Promise<ServiceReview[]> {
    return [];
  }

  async createServiceReview(
    review: InsertServiceReview
  ): Promise<ServiceReview> {
    return {
      id: 1,
      serviceId: review.serviceId || null,
      userServiceId: review.userServiceId || null,
      reviewerUserId: review.reviewerUserId,
      rating: review.rating,
      review: review.review || null,
      createdAt: new Date(),
    };
  }

  // Currency management methods
  async getCurrencies(): Promise<Currency[]> {
    throw new Error("Currency management not implemented in MemStorage");
  }

  async getCurrency(code: string): Promise<Currency | undefined> {
    throw new Error("Currency management not implemented in MemStorage");
  }

  async createCurrency(currency: InsertCurrency): Promise<Currency> {
    throw new Error("Currency management not implemented in MemStorage");
  }

  async updateCurrency(
    code: string,
    updates: Partial<Currency>
  ): Promise<Currency | undefined> {
    throw new Error("Currency management not implemented in MemStorage");
  }

  async updateCurrencyRate(
    code: string,
    rate: number
  ): Promise<Currency | undefined> {
    throw new Error("Currency management not implemented in MemStorage");
  }

  // MediaHub Document Management Methods
  async getBookingDocuments(bookingId: number): Promise<any[]> {
    return [];
  }

  async isUserAssignedToBooking(
    userId: number,
    bookingId: number
  ): Promise<boolean> {
    return false;
  }

  async hasDocumentPermission(
    documentId: number,
    userId: number
  ): Promise<boolean> {
    return false;
  }

  async userHasBookingAccess(
    userId: number,
    bookingId: number
  ): Promise<boolean> {
    return false;
  }

  async createBookingDocument(document: any): Promise<any> {
    throw new Error("Document management not implemented in MemStorage");
  }

  async updateDocumentVisibility(
    documentId: number,
    visibility: string,
    permissions: any[]
  ): Promise<any> {
    throw new Error("Document management not implemented in MemStorage");
  }

  async getDocument(documentId: number): Promise<any | undefined> {
    return undefined;
  }

  async deleteDocument(documentId: number): Promise<boolean> {
    return false;
  }
}

// Databasestorage start from hereeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee

export class DatabaseStorage implements IStorage {
  // 🔹 ৩️⃣ User
  async getUser(id: number): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return user || null;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async updateUser(
    id: number,
    updates: Partial<User>
  ): Promise<User | undefined> {
    await db.update(users).set(updates).where(eq(users.id, id));
    return this.getUser(id);
  }

  // START NEW CODEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE

  // ✅ Get all roles
  async getRoles(): Promise<Role[]> {
    return await db.select().from(rolesManagement).orderBy(rolesManagement.id);
  }

  // ✅ Get a single role by ID
  async getRole(id: number): Promise<Role | undefined> {
    const [role] = await db
      .select()
      .from(rolesManagement)
      .where(eq(rolesManagement.id, id));
    return role || undefined;
  }

  // ✅ Create a new role
  async createRole(roleData: Partial<Role>): Promise<Role> {
    const [role] = await db.insert(rolesManagement).values(roleData as any).returning();
    return role;
  }

  // ✅ Update a role (your existing version)
  async updateRole(id: number, updates: Partial<Role>): Promise<Role | undefined> {
    const [role] = await db
      .update(rolesManagement)
      .set(updates)
      .where(eq(rolesManagement.id, id))
      .returning();
    return role || undefined;
  }

  // ✅ Delete a role
  async deleteRole(id: number): Promise<boolean> {
    const result = await db
      .delete(rolesManagement)
      .where(eq(rolesManagement.id, id))
      .execute();

    return result.length > 0;
  }


  // Check if user has a specific role
  async userHasRole(userId: number, roleId: number): Promise<boolean> {
    const res = await db
      .select()
      .from(userRoles)
      .where(and(eq(userRoles.userId, userId), eq(userRoles.roleId, roleId)));

    return res.length > 0;
  }

  // Get all roleIds for a user
  async getUserRoleIds(userId: number): Promise<number[]> {
    const res = await db
      .select({ roleId: userRoles.roleId })
      .from(userRoles)
      .where(eq(userRoles.userId, userId));
    return res.map((r) => r.roleId);
  }

  async getUserRolesWithDetails(userId: number) {
    return await db
      .select({
        id: rolesManagement.id,
        name: rolesManagement.name,
        canApply: rolesManagement.canApply,
        opphubMarketplaceDiscount: rolesManagement.opphubMarketplaceDiscount,
        servicesDiscount: rolesManagement.servicesDiscount,
        adminCommission: rolesManagement.adminCommission,
      })
      .from(userRoles)
      .innerJoin(rolesManagement, eq(userRoles.roleId, rolesManagement.id))
      .where(eq(userRoles.userId, userId));
  }

  async getUserRoles(userId: number) {
    const res = await db
      .select({
        roleId: userRoles.roleId,
        name: roles.name,
      })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(userRoles.userId, userId));

    return res.map((r) => ({ id: r.roleId, name: r.name }));
  }

  // Insert into user_roles
  async addUserRole(userId: number, roleId: number) {
    return await db
      .insert(userRoles)
      .values({ userId, roleId })
      .onConflictDoNothing();
  }

  // assignRoleToUser
  async assignRoleToUser(userId: number, roleId: number) {
    const [role] = await db
      .insert(userRoles)
      .values({ userId, roleId })
      .onConflictDoNothing() // avoid duplicate userId+roleId
      .returning();
    return role;
  }

  // Remove a role from a user
  async removeRoleFromUser(userId: number, roleId: number) {
    return await db
      .delete(userRoles)
      .where(and(eq(userRoles.userId, userId), eq(userRoles.roleId, roleId)));
  }

  async createBookingDate(data: {
    bookingId: number;
    eventDate: Date;
    startTime?: string | null;
    endTime?: string | null;
  }) {
    const [newDate] = await db
      .insert(bookingDates)
      .values({
        bookingId: data.bookingId,
        eventDate: data.eventDate,
        startTime: data.startTime || null,
        endTime: data.endTime || null,
      })
      .returning();

    return newDate;
  }

  async getBookingDates(bookingId: number) {
    return await db
      .select()
      .from(bookingDates)
      .where(eq(bookingDates.bookingId, bookingId));
  }

  async updateBookingDate(id: number, data: {
    eventDate?: Date;
    startTime?: string | null;
    endTime?: string | null;
  }) {
    const [updated] = await db
      .update(bookingDates)
      .set(data)
      .where(eq(bookingDates.id, id))
      .returning();

    return updated;
  }

  async deleteBookingDate(id: number) {
    const [deleted] = await db
      .delete(bookingDates)
      .where(eq(bookingDates.id, id))
      .returning();

    return deleted;
  }

  async deleteBookingDatesByBookingId(bookingId: number) {
    return await db
      .delete(bookingDates)
      .where(eq(bookingDates.bookingId, bookingId));
  }

  // END NEW CODEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE
  // Enhanced user management with role information
  async getUserWithRoles(id: number): Promise<
    | {
      id: number;
      email: string;
      fullName: string;
      roleId: number;
      roleName: string; // User's registration type (superadmin, admin, managed_artist, etc.)
      professionalRole?: string; // Only for artists/musicians/professionals - their actual role/position
      secondaryRoles?: Array<{ roleId: number; roleName: string }>;
    }
    | undefined
  > {
    try {
      // Get user with role name (registration type)
      const [user] = await db
        .select({
          id: users.id,
          email: users.email,
          fullName: users.fullName,
          roleId: users.roleId,
          roleName: roles.name,
        })
        .from(users)
        .innerJoin(roles, eq(users.roleId, roles.id))
        .where(eq(users.id, id));

      if (!user) return undefined;

      // Get professional role based on user type
      let professionalRole: string | undefined;
      try {
        if (user.roleName.includes("artist")) {
          const artist = await this.getArtist(user.id);
          professionalRole = artist?.primaryRole;
        } else if (user.roleName.includes("musician")) {
          const musician = await this.getMusician(user.id);
          professionalRole = musician?.primaryRole;
        } else if (user.roleName.includes("professional")) {
          const professional = await this.getProfessional(user.id);
          professionalRole = professional?.primaryRole;
        }
      } catch (error) {
        // Professional role is optional, continue without it
      }

      // Get secondary roles
      const secondaryRoles = await db
        .select({
          roleId: userSecondaryRoles.roleId,
          roleName: roles.name,
        })
        .from(userSecondaryRoles)
        .innerJoin(roles, eq(userSecondaryRoles.roleId, roles.id))
        .where(eq(userSecondaryRoles.userId, id));

      return {
        ...user,
        professionalRole,
        secondaryRoles,
      };
    } catch (error) {
      console.error("Error fetching user with roles:", error);
      return undefined;
    }
  }

  async getUsersForAssignment(roleIds?: number[]): Promise<
    Array<{
      id: number;
      email: string;
      fullName: string;
      roleId: number;
      roleName: string; // User's registration type
      professionalRole?: string; // Their actual role/position (for artists/musicians/professionals)
      secondaryRoles?: Array<{ roleId: number; roleName: string }>;
    }>
  > {
    try {
      // Get users with role names (registration types)
      let query = db
        .select({
          id: users.id,
          email: users.email,
          fullName: users.fullName,
          roleId: users.roleId,
          roleName: roles.name,
        })
        .from(users)
        .innerJoin(roles, eq(users.roleId, roles.id))
        .where(eq(users.status, "active"));

      // Filter by role IDs if provided
      if (roleIds && roleIds.length > 0) {
        query = query.where(inArray(users.roleId, roleIds));
      }

      const usersResult = await query;

      // Get professional roles for applicable users
      const usersWithProfessionalRoles = await Promise.all(
        usersResult.map(async (user) => {
          let professionalRole: string | undefined;
          try {
            if (user.roleName.includes("artist")) {
              const artist = await this.getArtist(user.id);
              professionalRole = artist?.primaryRole;
            } else if (user.roleName.includes("musician")) {
              const musician = await this.getMusician(user.id);
              professionalRole = musician?.primaryRole;
            } else if (user.roleName.includes("professional")) {
              const professional = await this.getProfessional(user.id);
              professionalRole = professional?.primaryRole;
            }
          } catch (error) {
            // Professional role is optional
          }
          return { ...user, professionalRole };
        })
      );

      // Get secondary roles for all users
      const userIds = usersResult.map((u) => u.id);
      const secondaryRolesResult = await db
        .select({
          userId: userSecondaryRoles.userId,
          roleId: userSecondaryRoles.roleId,
          roleName: roles.name,
        })
        .from(userSecondaryRoles)
        .innerJoin(roles, eq(userSecondaryRoles.roleId, roles.id))
        .where(inArray(userSecondaryRoles.userId, userIds));

      // Group secondary roles by user
      const secondaryRolesByUser = secondaryRolesResult.reduce((acc, role) => {
        if (!acc[role.userId]) acc[role.userId] = [];
        acc[role.userId].push({
          roleId: role.roleId,
          roleName: role.roleName,
        });
        return acc;
      }, {} as Record<number, Array<{ roleId: number; roleName: string }>>);

      // Combine results
      return usersWithProfessionalRoles.map((user) => ({
        ...user,
        secondaryRoles: secondaryRolesByUser[user.id] || [],
      }));
    } catch (error) {
      console.error("Error fetching users for assignment:", error);
      return [];
    }
  }

  // Secondary role management
  async addSecondaryRole(userId: number, roleId: number): Promise<void> {
    try {
      await db.insert(userSecondaryRoles).values({
        userId,
        roleId,
      });
    } catch (error) {
      console.error("Error adding secondary role:", error);
      throw error;
    }
  }

  async removeSecondaryRole(userId: number, roleId: number): Promise<void> {
    try {
      await db
        .delete(userSecondaryRoles)
        .where(
          and(
            eq(userSecondaryRoles.userId, userId),
            eq(userSecondaryRoles.roleId, roleId)
          )
        );
    } catch (error) {
      console.error("Error removing secondary role:", error);
      throw error;
    }
  }

  async getUserSecondaryRoles(
    userId: number
  ): Promise<Array<{ roleId: number; roleName: string }>> {
    try {
      const result = await db
        .select({
          roleId: userSecondaryRoles.roleId,
          roleName: roles.name,
        })
        .from(userSecondaryRoles)
        .innerJoin(roles, eq(userSecondaryRoles.roleId, roles.id))
        .where(eq(userSecondaryRoles.userId, userId));

      return result;
    } catch (error) {
      console.error("Error fetching user secondary roles:", error);
      return [];
    }
  }

  async getDemoUsers(): Promise<
    Array<{ id: number; email: string; fullName: string; roleName: string }>
  > {
    const result = await db
      .select({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        roleName: roles.name,
      })
      .from(users)
      .innerJoin(roles, eq(users.roleId, roles.id))
      .where(eq(users.isDemo, true))
      .orderBy(roles.id, users.fullName);

    return result;
  }

  // Data integrity system support methods - removed duplicates

  // // Check if user has role (primary or secondary)
  // async userHasRole(userId: number, roleId: number): Promise<boolean> {
  //   const user = await this.getUser(userId);
  //   if (!user) return false;

  //   // Check primary role
  //   if (user.roleId === roleId) return true;

  //   // Check secondary roles
  //   const secondaryRoles = user.secondaryRoles as number[] || [];
  //   return secondaryRoles.includes(roleId);
  // }

  // // Get all roles for a user (primary + secondary)
  // async getUserRoles(userId: number): Promise<number[]> {
  //   const user = await this.getUser(userId);
  //   if (!user) return [];

  //   const roles = [user.roleId];
  //   const secondaryRoles = user.secondaryRoles as number[] || [];
  //   return [...roles, ...secondaryRoles];
  // }

  // UserProfile methods temporarily removed - using normalized user data tables
  async getUserProfile(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async createUserProfile(profile: any): Promise<any> {
    // Placeholder - using normalized user data tables
    return {};
  }

  async updateUserProfile(
    userId: number,
    updates: any
  ): Promise<any | undefined> {
    // Placeholder - using normalized user data tables
    return {};
  }



  // Get role by ID
  // async getRoleById(roleId: number): Promise<Role | undefined> {
  //   try {
  //     const [role] = await db.select().from(roles).where(eq(roles.id, roleId));
  //     return role;
  //   } catch (error) {
  //     console.error('Error fetching role by ID:', error);
  //     return undefined;
  //   }
  // }
  async getRoleById(roleId: number): Promise<Role | undefined> {
    try {
      const [role] = await db
        .select()
        .from(rolesManagement)
        .where(eq(rolesManagement.id, roleId));

      if (!role) return undefined; // ✅ matches interface

      return {
        id: role.id,
        name: role.name,
        canApply: role.canApply,
        opphubMarketplaceDiscount: role.opphubMarketplaceDiscount,
        servicesDiscount: role.servicesDiscount,
        adminCommission: role.adminCommission,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt,
      };
    } catch (err) {
      console.error("Error fetching role by ID:", err);
      return undefined; // ✅ matches interface
    }
  }


  // Get role name by ID
  async getRoleName(roleId: number): Promise<string> {
    try {
      const role = await this.getRoleById(roleId);
      return role?.name || "Unknown Role";
    } catch (error) {
      console.error("Error fetching role name:", error);
      return "Unknown Role";
    }
  }

  // Helper function to determine if a user is managed based on role ID
  isUserManaged(roleId: number): boolean {
    return [3, 5, 7].includes(roleId); // Star Talent, Studio Pro, Industry Expert
  }

  // Helper function to get user type category
  getUserTypeCategory(
    roleId: number
  ): "artist" | "musician" | "professional" | "admin" | "fan" {
    if ([1, 2].includes(roleId)) return "admin";
    if ([3, 4].includes(roleId)) return "artist";
    if ([5, 6].includes(roleId)) return "musician";
    if ([7, 8].includes(roleId)) return "professional";
    if (roleId === 9) return "fan";
    return "fan";
  }

  async getManagementTiers(): Promise<ManagementTier[]> {
    return await db.select().from(managementTiers);
  }

  // Primary roles management methods
  async getPrimaryRoles(): Promise<UserPrimaryRole[]> {
    return await db
      .select()
      .from(userPrimaryRoles)
      .orderBy(userPrimaryRoles.sortOrder, userPrimaryRoles.name);
  }

  async createPrimaryRole(
    data: InsertUserPrimaryRole
  ): Promise<UserPrimaryRole> {
    const [primaryRole] = await db
      .insert(userPrimaryRoles)
      .values(data)
      .returning();
    return primaryRole;
  }

  async getPrimaryRoleById(id: number): Promise<UserPrimaryRole | undefined> {
    const [primaryRole] = await db
      .select()
      .from(userPrimaryRoles)
      .where(eq(userPrimaryRoles.id, id));
    return primaryRole;
  }

  async updatePrimaryRole(
    id: number,
    data: Partial<UserPrimaryRole>
  ): Promise<UserPrimaryRole> {
    const [primaryRole] = await db
      .update(userPrimaryRoles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(userPrimaryRoles.id, id))
      .returning();
    return primaryRole;
  }

  async deletePrimaryRole(id: number): Promise<void> {
    await db.delete(userPrimaryRoles).where(eq(userPrimaryRoles.id, id));
  }

  async getPrimaryRolesByRoleId(roleId: number): Promise<UserPrimaryRole[]> {
    return await db
      .select()
      .from(userPrimaryRoles)
      .where(eq(userPrimaryRoles.roleId, roleId))
      .orderBy(userPrimaryRoles.sortOrder, userPrimaryRoles.name);
  }

  async getUsersByRole(roleId: number): Promise<User[]> {
    const result = await db
      .select()
      .from(users)
      .innerJoin(userRoles, eq(users.id, userRoles.userId))
      .where(eq(userRoles.roleId, roleId));
    return result;
  }

  async getArtist(userId: number): Promise<Artist | undefined> {
    const [artist] = await db
      .select()
      .from(artists)
      .where(eq(artists.userId, userId));
    return artist || undefined;
  }

  async getArtists(): Promise<Artist[]> {
    return await db.select().from(artists);
  }

  async createArtist(artist: InsertArtist): Promise<Artist> {
    const [created] = await db.insert(artists).values(artist).returning();
    return created;
  }

  async getMusician(userId: number): Promise<Musician | undefined> {
    const [musician] = await db
      .select()
      .from(musicians)
      .where(eq(musicians.userId, userId));
    return musician || undefined;
  }

  async getMusicians(): Promise<Musician[]> {
    return await db.select().from(musicians);
  }

  async createMusician(musician: InsertMusician): Promise<Musician> {
    const [created] = await db.insert(musicians).values(musician).returning();
    return created;
  }

  async getProfessional(userId: number): Promise<Professional | undefined> {
    const [professional] = await db
      .select()
      .from(professionals)
      .where(eq(professionals.userId, userId));
    return professional || undefined;
  }

  async getProfessionals(): Promise<Professional[]> {
    return await db.select().from(professionals);
  }

  async createProfessional(
    professional: InsertProfessional
  ): Promise<Professional> {
    const [created] = await db
      .insert(professionals)
      .values(professional)
      .returning();
    return created;
  }

  // async getAllUsers(): Promise<User[]> {
  //   return await db.select().from(users).orderBy(desc(users.createdAt));
  // }

  // Return type

  async getAllUsers(): Promise<User[]> {
    const rows = await db
      .select({
        userId: users.id,
        email: users.email,
        fullName: users.fullName,
        phoneNumber: users.phoneNumber,
        gender: users.gender,
        status: users.status,
        privacySetting: users.privacySetting,
        avatarUrl: users.avatarUrl,
        coverImageUrl: users.coverImageUrl,
        isDemo: users.isDemo,
        createdAt: users.createdAt,
        lastLogin: users.lastLogin,
        roleId: rolesManagement.id,
        roleName: rolesManagement.name,
      })
      .from(users)
      .leftJoin(userRoles, eq(users.id, userRoles.userId))
      .leftJoin(rolesManagement, eq(userRoles.roleId, rolesManagement.id))
      .orderBy(desc(users.createdAt));

    const userMap: Record<number, User> = {};

    for (const row of rows) {
      if (!userMap[row.userId]) {
        userMap[row.userId] = {
          id: row.userId,
          email: row.email,
          fullName: row.fullName,
          phoneNumber: row.phoneNumber,
          gender: row.gender,
          status: row.status,
          privacySetting: row.privacySetting,
          avatarUrl: row.avatarUrl,
          coverImageUrl: row.coverImageUrl,
          isDemo: row.isDemo,
          createdAt: row.createdAt,
          lastLogin: row.lastLogin,
          roles: [],
        };
      }

      if (row.roleId) {
        userMap[row.userId].roles.push({
          id: row.roleId,
          name: row.roleName!,
        });
      }
    }

    return Object.values(userMap);
  }



  // Duplicate methods removed - keeping proper implementation below

  async updateArtist(
    userId: number,
    updates: Partial<Artist>
  ): Promise<Artist | undefined> {
    await db
      .insert(artists)
      .values({ userId, ...updates })
      .onConflictDoUpdate({
        target: artists.userId,
        set: updates,
      });

    return this.getArtist(userId);
  }

  async updateMusician(
    userId: number,
    updates: Partial<Musician>
  ): Promise<Musician | undefined> {
    await db
      .insert(musicians)
      .values({ userId, ...updates })
      .onConflictDoUpdate({
        target: musicians.userId,
        set: updates,
      });

    return this.getMusician(userId);
  }

  async updateArtistStageNames(
    userId: number,
    stageNames: Array<{
      name: string;
      isPrimary?: boolean;
      isForBookings?: boolean;
      usageType?: "primary" | "bookings" | "both";
    }>
  ): Promise<Artist | undefined> {
    console.log(
      "Updating artist stage names for user:",
      userId,
      "with data:",
      stageNames
    );

    // Ensure at least one primary name exists
    const hasPrimary = stageNames.some(
      (sn) =>
        sn.isPrimary || sn.usageType === "primary" || sn.usageType === "both"
    );
    if (!hasPrimary && stageNames.length > 0) {
      stageNames[0] = {
        ...stageNames[0],
        isPrimary: true,
        usageType: "primary",
      };
    }

    // Process each stage name to set proper usage type
    const processedStageNames = stageNames.map((sn) => ({
      name: sn.name,
      isPrimary:
        sn.isPrimary || sn.usageType === "primary" || sn.usageType === "both",
      isForBookings:
        sn.isForBookings ||
        sn.usageType === "bookings" ||
        sn.usageType === "both",
      usageType: sn.usageType || (sn.isPrimary ? "primary" : "bookings"),
    }));

    await db
      .update(artists)
      .set({ stageNames: processedStageNames })
      .where(eq(artists.userId, userId));

    console.log("Successfully updated artist stage names");
    return this.getArtist(userId);
  }

  async updateMusicianStageNames(
    userId: number,
    stageNames: Array<{
      name: string;
      isPrimary?: boolean;
      isForBookings?: boolean;
      usageType?: "primary" | "bookings" | "both";
    }>
  ): Promise<Musician | undefined> {
    console.log(
      "Updating musician stage names for user:",
      userId,
      "with data:",
      stageNames
    );

    // Ensure at least one primary name exists
    const hasPrimary = stageNames.some(
      (sn) =>
        sn.isPrimary || sn.usageType === "primary" || sn.usageType === "both"
    );
    if (!hasPrimary && stageNames.length > 0) {
      stageNames[0] = {
        ...stageNames[0],
        isPrimary: true,
        usageType: "primary",
      };
    }

    // Process each stage name to set proper usage type
    const processedStageNames = stageNames.map((sn) => ({
      name: sn.name,
      isPrimary:
        sn.isPrimary || sn.usageType === "primary" || sn.usageType === "both",
      isForBookings:
        sn.isForBookings ||
        sn.usageType === "bookings" ||
        sn.usageType === "both",
      usageType: sn.usageType || (sn.isPrimary ? "primary" : "bookings"),
    }));

    await db
      .update(musicians)
      .set({ stageNames: processedStageNames })
      .where(eq(musicians.userId, userId));

    console.log("Successfully updated musician stage names");
    return this.getMusician(userId);
  }

  // Duplicate methods removed - keeping proper implementation below

  // Update professional profile with specializations and availability
  async updateProfessional(
    userId: number,
    updates: any
  ): Promise<Professional | undefined> {
    const [row] = await db
      .insert(professionals)
      .values({
        userId,
        ...updates,
      })
      .onConflictDoUpdate({
        target: professionals.userId, // userId conflict হলে update করবে
        set: {
          ...updates,
        },
      })
      .returning();

    return row || undefined;
  }

  // Global professions management
  async getGlobalProfessions(): Promise<any[]> {
    const results = await db
      .select()
      .from(globalProfessions)
      .orderBy(globalProfessions.category, globalProfessions.name);

    // Group by category
    const grouped = results.reduce((acc, profession) => {
      if (!acc[profession.category]) {
        acc[profession.category] = [];
      }
      acc[profession.category].push(profession);
      return acc;
    }, {} as Record<string, any[]>);

    return grouped;
  }

  async createGlobalProfession(profession: any): Promise<any> {
    const [created] = await db
      .insert(globalProfessions)
      .values(profession)
      .returning();
    return created;
  }

  // Professional availability management
  async getProfessionalAvailability(userId: number): Promise<any> {
    const [availability] = await db
      .select()
      .from(professionalAvailability)
      .where(eq(professionalAvailability.userId, userId));
    return availability || undefined;
  }

  async createProfessionalAvailability(availability: any): Promise<any> {
    const [created] = await db
      .insert(professionalAvailability)
      .values(availability)
      .returning();
    return created;
  }

  async updateProfessionalAvailability(
    userId: number,
    updates: any
  ): Promise<any> {
    const [updated] = await db
      .update(professionalAvailability)
      .set(updates)
      .where(eq(professionalAvailability.userId, userId))
      .returning();
    return updated || undefined;
  }

  async getSong(id: number): Promise<Song | undefined> {
    const [song] = await db.select().from(songs).where(eq(songs.id, id));
    return song || undefined;
  }

  async getSongs(): Promise<Song[]> {
    return await db.select().from(songs);
  }

  async getSongsByArtist(artistUserId: number): Promise<Song[]> {
    return await db
      .select()
      .from(songs)
      .where(eq(songs.artistUserId, artistUserId));
  }

  async createSong(song: InsertSong): Promise<Song> {
    const [createdSong] = await db.insert(songs).values(song).returning();
    return createdSong;
  }

  async updateSong(
    id: number,
    updates: Partial<Song>
  ): Promise<Song | undefined> {
    await db.update(songs).set(updates).where(eq(songs.id, id));
    return this.getSong(id);
  }

  async deleteSong(id: number): Promise<void> {
    await db.delete(songs).where(eq(songs.id, id));
  }

  // Albums implementation
  async getAlbums(): Promise<Album[]> {
    return await db.select().from(albums).orderBy(desc(albums.createdAt));
  }

  async getAlbum(id: number): Promise<Album | undefined> {
    const [album] = await db.select().from(albums).where(eq(albums.id, id));
    return album || undefined;
  }

  async getAlbumsByArtist(artistUserId: number): Promise<Album[]> {
    return await db
      .select()
      .from(albums)
      .where(eq(albums.artistUserId, artistUserId));
  }

  async getMerchandiseByArtist(artistUserId: number): Promise<Merchandise[]> {
    return await db
      .select()
      .from(merchandise)
      .where(eq(merchandise.artistUserId, artistUserId));
  }

  async createAlbum(album: InsertAlbum): Promise<Album> {
    const [createdAlbum] = await db.insert(albums).values(album).returning();
    return createdAlbum;
  }

  async updateAlbum(
    id: number,
    updates: Partial<Album>
  ): Promise<Album | undefined> {
    const [updated] = await db
      .update(albums)
      .set(updates)
      .where(eq(albums.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteAlbum(id: number): Promise<boolean> {
    const result = await db.delete(albums).where(eq(albums.id, id));
    return result.rowCount > 0;
  }

  async getSongsByAlbum(albumId: number): Promise<Song[]> {
    return await db.select().from(songs).where(eq(songs.albumId, albumId));
  }

  // Cross-Upsell Relationships implementation
  async getCrossUpsellRelationships(): Promise<CrossUpsellRelationship[]> {
    return await db
      .select()
      .from(crossUpsellRelationships)
      .orderBy(desc(crossUpsellRelationships.createdAt));
  }

  async createCrossUpsellRelationship(
    relationship: InsertCrossUpsellRelationship
  ): Promise<CrossUpsellRelationship> {
    const [created] = await db
      .insert(crossUpsellRelationships)
      .values(relationship)
      .returning();
    return created;
  }

  async getCrossUpsellsBySource(
    sourceType: string,
    sourceId: number
  ): Promise<CrossUpsellRelationship[]> {
    return await db
      .select()
      .from(crossUpsellRelationships)
      .where(
        and(
          eq(crossUpsellRelationships.sourceType, sourceType),
          eq(crossUpsellRelationships.sourceId, sourceId)
        )
      );
  }

  async deleteCrossUpsellRelationship(id: number): Promise<boolean> {
    const result = await db
      .delete(crossUpsellRelationships)
      .where(eq(crossUpsellRelationships.id, id));
    return result.rowCount > 0;
  }

  // Videos
  async getVideo(id: number): Promise<Video | undefined> {
    const result = await db
      .select()
      .from(videos)
      .where(eq(videos.id, id))
      .limit(1);
    return result[0];
  }

  async getVideos(): Promise<Video[]> {
    return await db.select().from(videos).orderBy(desc(videos.createdAt));
  }

  async getVideosByUser(userId: number): Promise<Video[]> {
    return await db
      .select()
      .from(videos)
      .where(eq(videos.uploadedByUserId, userId))
      .orderBy(desc(videos.createdAt));
  }

  async createVideo(video: InsertVideo): Promise<Video> {
    const result = await db.insert(videos).values(video).returning();
    return result[0];
  }

  async updateVideo(
    id: number,
    updates: Partial<Video>
  ): Promise<Video | undefined> {
    const result = await db
      .update(videos)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(videos.id, id))
      .returning();
    return result[0];
  }

  async deleteVideo(id: number): Promise<void> {
    await db.delete(videos).where(eq(videos.id, id));
  }

  // Duplicate album methods removed - keeping original implementations

  async getAllMerchandise(): Promise<Merchandise[]> {
    return await db.select().from(merchandise);
  }

  async createMerchandise(
    merchandiseData: InsertMerchandise
  ): Promise<Merchandise> {
    // Ensure categoryId is set to default if not provided
    const dataWithCategory = {
      ...merchandiseData,
      categoryId: merchandiseData.categoryId || 1, // Default to "Apparel" category
    };

    const [createdMerchandise] = await db
      .insert(merchandise)
      .values(dataWithCategory)
      .returning();
    return createdMerchandise;
  }

  // async getBooking(id: number): Promise<Booking | undefined> {
  //   const [booking] = await db
  //     .select()
  //     .from(bookings)
  //     .where(eq(bookings.id, id));
  //   return booking || undefined;
  // }

  // async getBookingsByUser(userId: number): Promise<Booking[]> {
  //   return await db
  //     .select()
  //     .from(bookings)
  //     .where(eq(bookings.bookerUserId, userId));
  // }

  async getBooking(id: number) {
    const [booking] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, id));

    if (!booking) return undefined;

    const dates = await db
      .select({ eventDate: bookingDates.eventDate })
      .from(bookingDates)
      .where(eq(bookingDates.bookingId, id));

    return {
      ...booking,
      eventDates: dates.map(d => d.eventDate),
    };
  }

  async getBookingsByUser(userId: number) {
    const bookingsList = await db
      .select()
      .from(bookings)
      .where(eq(bookings.bookerUserId, userId));

    const bookingIds = bookingsList.map(b => b.id);

    if (bookingIds.length === 0) return []; // কোন booking নেই

    const dates = await db
      .select({
        bookingId: bookingDates.bookingId,
        eventDate: bookingDates.eventDate,
      })
      .from(bookingDates)
      .where(inArray(bookingDates.bookingId, bookingIds));

    return bookingsList.map(b => ({
      ...b,
      eventDates: dates
        .filter(d => d.bookingId === b.id)
        .map(d => d.eventDate),
    }));
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [createdBooking] = await db
      .insert(bookings)
      .values(booking)
      .returning();
    return createdBooking;
  }

  async updateBookingStatus(
    id: number,
    status: string
  ): Promise<Booking | undefined> {
    await db.update(bookings).set({ status }).where(eq(bookings.id, id));
    return this.getBooking(id);
  }

  async updateBooking(
    id: number,
    updates: Partial<Booking>
  ): Promise<Booking | undefined> {
    await db.update(bookings).set(updates).where(eq(bookings.id, id));
    return this.getBooking(id);
  }

  // Booking-এর সব contract signatures
  // async getContractSignatures(bookingId: number) {
  //   const rows = await db.select().from(contractSignatures)
  //     .where(eq(contractSignatures.documentId, bookingId));
  //   return rows;
  // }

  // 🔹 ২️⃣ Payments
  async getPayments(bookingId: number) {
    return await db
      .select()
      .from(payments)
      .where(eq(payments.bookingId, bookingId))
      .orderBy(payments.createdAt); // optional: newest to oldest
  }

  // documents insert
  async createOrUpdateDocument(doc: {
    fileName: string;
    fileUrl: string;
    documentType: string;
    uploadedBy: number;
    bookingId: number;
    status: string;
  }) {
    const existing = await db
      .select()
      .from(documents)
      .where(
        and(
          eq(documents.bookingId, doc.bookingId),
          eq(documents.documentType, doc.documentType)
        )
      )
      .limit(1)
      .then((rows) => rows[0]);

    if (existing) {
      return await db
        .update(documents)
        .set({
          fileName: doc.fileName,
          fileUrl: doc.fileUrl,
          uploadedBy: doc.uploadedBy,
          status: doc.status,
        })
        .where(eq(documents.id, existing.id))
        .returning()
        .then((r) => r[0]);
    }

    return await db
      .insert(documents)
      .values(doc)
      .returning()
      .then((r) => r[0]);
  }



  async createOrUpdateDefaultSignatures(
    contractId: number,
    bookingId: number,
    performerUserId?: number
  ) {
    // Booking info
    const booking = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, bookingId))
      .limit(1)
      .then(rows => rows[0]);
  
    if (!booking) throw new Error("Booking not found");
  
    // Contract info
    const contract = await db
      .select()
      .from(contracts)
      .where(eq(contracts.id, contractId))
      .limit(1)
      .then(rows => rows[0]);
  
    if (!contract) throw new Error("Contract not found");
  
    // Booker info
    const bookerUser = booking.bookerUserId
      ? await db
          .select()
          .from(users)
          .where(eq(users.id, booking.bookerUserId))
          .limit(1)
          .then(rows => rows[0])
      : null;
  
    // Performer info (explicitly passed)
    const performerUser = performerUserId
      ? await db
          .select()
          .from(users)
          .where(eq(users.id, performerUserId))
          .limit(1)
          .then(rows => rows[0])
      : null;
  
    // Admin info
    const adminUserRow = await db
      .select()
      .from(users)
      .innerJoin(userRoles, eq(users.id, userRoles.userId))
      .where(eq(userRoles.roleId, 1)) // SuperAdmin
      .limit(1)
      .then(rows => rows[0]);
  
    const adminUser = adminUserRow?.users;
    if (!adminUser) throw new Error("Admin user not found");
  
    const upsertSignature = async (
      signerType: string,
      signerUserId: number | null,
      signerName: string,
      signerEmail: string
    ) => {
      const existing = await db
        .select()
        .from(contractSignatures)
        .where(
          and(
            eq(contractSignatures.contractId, contractId),
            eq(contractSignatures.signerType, signerType)
          )
        )
        .limit(1)
        .then(rows => rows[0]);
  
      if (existing) {
        await db
          .update(contractSignatures)
          .set({
            signerUserId,
            signerName,
            signerEmail,
            signatureData: null,
            status: "pending",
            signedAt: null
          })
          .where(eq(contractSignatures.id, existing.id));
      } else {
        await db.insert(contractSignatures).values({
          contractId,
          signerUserId,
          signerType,
          signerName,
          signerEmail,
          signatureData: null,
          status: "pending"
        });
      }
    };
  
    // Logic by contract type
    if (contract.contractType === "booking_agreement") {
      await upsertSignature(
        "booker",
        bookerUser?.id || null,
        bookerUser?.fullName || "Booker",
        bookerUser?.email || ""
      );
  
      await upsertSignature(
        "superadmin",
        adminUser?.id || null,
        adminUser?.fullName || "SuperAdmin",
        adminUser?.email || ""
      );
    } else if (contract.contractType === "performance_contract") {
      if (performerUser) {
        await upsertSignature(
          "performer",
          performerUser.id,
          performerUser.fullName || "Performer",
          performerUser.email || ""
        );
      }
  
      await upsertSignature(
        "superadmin",
        adminUser?.id || null,
        adminUser?.fullName || "SuperAdmin",
        adminUser?.email || ""
      );
    }
  }
  

  // 🔹 ১️⃣ Contract Signatures
  async getContractSignatures(bookingId: number) {
    return await db
      .select({
        signatureId: contractSignatures.id,
        contractId: contractSignatures.contractId,
        signerType: contractSignatures.signerType,
        signerName: contractSignatures.signerName,
        signerEmail: contractSignatures.signerEmail,
        signatureData: contractSignatures.signatureData,
        signedAt: contractSignatures.signedAt,
        status: contractSignatures.status,
        contractType: contracts.contractType,
        title: contracts.title,
      })
      .from(contractSignatures)
      .innerJoin(contracts, eq(contractSignatures.contractId, contracts.id))
      .where(eq(contracts.bookingId, bookingId));
  }

  async signContract(contractId: number, signerType: string, signatureData: string) {
    if (!contractId || !signerType || !signatureData) {
      throw new Error("Missing required signature info");
    }

    const updated = await db
      .update(contractSignatures)
      .set({
        signatureData,
        status: "signed",
        signedAt: new Date(),
      })
      .where(
        and(
          eq(contractSignatures.contractId, contractId),
          eq(contractSignatures.signerType, signerType) // signerUserId বাদ দিয়ে signerType ব্যবহার
        )
      )
      .returning();

    if (!updated || updated.length === 0) {
      throw new Error("Signature record not found");
    }
    // Contract status update
    await db.update(contracts)
      .set({ status: "signed" })
      .where(eq(contracts.id, contractId));

    return updated[0];
  }



  // async getAllBookings(): Promise<Booking[]> {
  //   try {
  //     const bookingsList = await db.select().from(bookings);

  //     // Enrich booking data with artist information for display
  //     const enrichedBookings = await Promise.all(
  //       bookingsList.map(async (booking) => {
  //         let primaryArtist = null;

  //         if (booking.primaryArtistUserId) {
  //           const artist = await this.getArtist(booking.primaryArtistUserId);
  //           if (artist) {
  //             // Extract the primary stage name from stageNames array
  //             const primaryStageName = artist.stageNames && Array.isArray(artist.stageNames) && artist.stageNames.length > 0
  //               ? (typeof artist.stageNames[0] === 'object' ? artist.stageNames[0].name : artist.stageNames[0])
  //               : 'Unknown Artist';

  //             primaryArtist = {
  //               userId: artist.userId,
  //               stageName: primaryStageName,
  //               stageNames: artist.stageNames || [],
  //               genre: artist.primaryGenre,
  //               isManaged: artist.isManaged
  //             };
  //           }
  //         }

  //         return {
  //           ...booking,
  //           primaryArtist,
  //           // Ensure proper naming for frontend
  //           eventName: booking.eventName,
  //           venueName: booking.venueName,
  //           bookerName: booking.isGuestBooking ? booking.guestName : null,
  //           clientName: booking.isGuestBooking ? booking.guestName : null
  //         };
  //       })
  //     );

  //     return enrichedBookings;
  //   } catch (error) {
  //     console.error('Error fetching bookings:', error);
  //     return [];
  //   }
  // }

  // async getAllBookings(): Promise<any[]> {
  //   try {
  //     const results = await db
  //       .select({
  //         id: bookings.id,
  //         eventName: bookings.eventName,
  //         venueName: bookings.venueName,
  //         eventDates: bookings.eventDate,
  //         status: bookings.status,
  //         isGuestBooking: bookings.isGuestBooking,
  //         guestName: bookings.guestName,
  //         guestEmail: bookings.guestEmail,
  //         guestPhone: bookings.guestPhone,

  //         // Artist/Musician/Professional fields
  //         primaryArtistUserId: bookings.primaryArtistUserId,
  //         artistStageName: artists.stageName,
  //         artistBio: artists.bio,
  //         artistEpkUrl: artists.epkUrl,
  //         artistPrimaryGenre: artists.primaryGenre,
  //         artistBasePrice: artists.basePrice,
  //         artistIdealPerformanceRate: artists.idealPerformanceRate,
  //         artistMinimumAcceptableRate: artists.minimumAcceptableRate,
  //         artistIsManaged: artists.isManaged,
  //         artistManagementTierId: artists.managementTierId,
  //         artistBookingFormPictureUrl: artists.bookingFormPictureUrl,
  //         artistIsRegisteredWithPro: artists.isRegisteredWithPro,
  //         artistPerformingRightsOrganization:
  //           artists.performingRightsOrganization,
  //         artistIpiNumber: artists.ipiNumber,
  //         artistPrimaryTalentId: artists.primaryTalentId,
  //         artistIsDemo: artists.isDemo,
  //         artistIsComplete: artists.isComplete,

  //         // Workflow + contract/payment
  //         workflowData: bookings.workflowData,
  //         currentWorkflowStep: bookings.currentWorkflowStep,
  //         contractsGenerated: bookings.contractsGenerated,
  //         allSignaturesCompleted: bookings.allSignaturesCompleted,
  //         paymentCompleted: bookings.paymentCompleted,
  //         receiptGenerated: bookings.receiptGenerated,
  //       })
  //       .from(bookings)
  //       .leftJoin(artists, eq(bookings.primaryArtistUserId, artists.userId));

  //     // Fetch booking assignments separately
  //     const assignments = await db.select().from(bookingAssignments);

  //     // Attach assignments into bookings
  //     const enriched = results.map((b) => ({
  //       ...b,
  //       assignments: assignments.filter((a) => a.bookingId === b.id),
  //     }));

  //     return enriched;
  //   } catch (error) {
  //     console.error("Error fetching bookings with artists:", error);
  //     return [];
  //   }
  // }

  async getAllBookings(): Promise<any[]> {
    try {
      const results = await db
        .select({
          id: bookings.id,
          eventName: bookings.eventName,
          venueName: bookings.venueName,
          eventDates: sql`
  json_agg(
    json_build_object(
      'eventDate', ${bookingDates.eventDate},
      'startTime', ${bookingDates.startTime},
      'endTime', ${bookingDates.endTime}
    )
    ORDER BY ${bookingDates.eventDate}
  )
`,
          status: bookings.status,
          isGuestBooking: bookings.isGuestBooking,
          guestName: bookings.guestName,
          guestEmail: bookings.guestEmail,
          guestPhone: bookings.guestPhone,

          // Artist/Musician/Professional fields
          primaryArtistUserId: bookings.primaryArtistUserId,
          artistStageName: artists.stageName,
          artistBio: artists.bio,
          artistEpkUrl: artists.epkUrl,
          artistPrimaryGenre: artists.primaryGenre,
          artistBasePrice: artists.basePrice,
          artistIdealPerformanceRate: artists.idealPerformanceRate,
          artistMinimumAcceptableRate: artists.minimumAcceptableRate,
          artistIsManaged: artists.isManaged,
          artistManagementTierId: artists.managementTierId,
          artistBookingFormPictureUrl: artists.bookingFormPictureUrl,
          artistIsRegisteredWithPro: artists.isRegisteredWithPro,
          artistPerformingRightsOrganization: artists.performingRightsOrganization,
          artistIpiNumber: artists.ipiNumber,
          artistPrimaryTalentId: artists.primaryTalentId,
          artistIsDemo: artists.isDemo,
          artistIsComplete: artists.isComplete,

          // Workflow + contract/payment
          workflowData: bookings.workflowData,
          currentWorkflowStep: bookings.currentWorkflowStep,
          contractsGenerated: bookings.contractsGenerated,
          allSignaturesCompleted: bookings.allSignaturesCompleted,
          paymentCompleted: bookings.paymentCompleted,
          receiptGenerated: bookings.receiptGenerated,
        })
        .from(bookings)
        .leftJoin(artists, eq(bookings.primaryArtistUserId, artists.userId))
        .leftJoin(bookingDates, eq(bookingDates.bookingId, bookings.id))
        .groupBy(
          bookings.id,
          artists.stageName,
          artists.bio,
          artists.epkUrl,
          artists.primaryGenre,
          artists.basePrice,
          artists.idealPerformanceRate,
          artists.minimumAcceptableRate,
          artists.isManaged,
          artists.managementTierId,
          artists.bookingFormPictureUrl,
          artists.isRegisteredWithPro,
          artists.performingRightsOrganization,
          artists.ipiNumber,
          artists.primaryTalentId,
          artists.isDemo,
          artists.isComplete
        );

      const assignments = await db
        .select({
          id: bookingAssignmentsMembers.id,
          bookingId: bookingAssignmentsMembers.bookingId,
          userId: bookingAssignmentsMembers.userId,
          roleInBooking: bookingAssignmentsMembers.roleInBooking,
          assignmentType: bookingAssignmentsMembers.assignmentType,
          assignedAt: bookingAssignmentsMembers.assignedAt,
          assignedBy: bookingAssignmentsMembers.assignedBy,
          status: bookingAssignmentsMembers.status,
          selectedTalent: bookingAssignmentsMembers.selectedTalent,
          isMainBookedTalent: bookingAssignmentsMembers.isMainBookedTalent,
          assignedGroup: bookingAssignmentsMembers.assignedGroup,
          assignedChannelPair: bookingAssignmentsMembers.assignedChannelPair,
          assignedChannel: bookingAssignmentsMembers.assignedChannel,
          createdAt: bookingAssignmentsMembers.createdAt,
          updatedAt: bookingAssignmentsMembers.updatedAt,
        })
        .from(bookingAssignmentsMembers);

      const enriched = results.map((b) => ({
        ...b,
        assignments: assignments.filter((a) => a.bookingId === b.id),
      }));

      return enriched;
    } catch (error) {
      console.error("Error fetching bookings with assignments:", error);
      return [];
    }
  }


  // async getBookingsByArtist(artistUserId: number): Promise<Booking[]> {
  //   return await db
  //     .select()
  //     .from(bookings)
  //     .where(eq(bookings.primaryArtistUserId, artistUserId));
  // }

  async getBookingsByArtist(artistUserId: number): Promise<any[]> {
    return await db
      .select({
        id: bookings.id,
        bookerUserId: bookings.bookerUserId,
        primaryArtistUserId: bookings.primaryArtistUserId,
        eventName: bookings.eventName,
        eventType: bookings.eventType,
        venueName: bookings.venueName,
        venueAddress: bookings.venueAddress,
        requirements: bookings.requirements,
        status: bookings.status,
        totalBudget: bookings.totalBudget,
        finalPrice: bookings.finalPrice,
        guestName: bookings.guestName,
        guestEmail: bookings.guestEmail,
        guestPhone: bookings.guestPhone,
        isGuestBooking: bookings.isGuestBooking,
        assignedAdminId: bookings.assignedAdminId,
        adminApprovedAt: bookings.adminApprovedAt,
        internalObjectives: bookings.internalObjectives,
        internalNotes: bookings.internalNotes,
        contractsGenerated: bookings.contractsGenerated,
        allSignaturesCompleted: bookings.allSignaturesCompleted,
        paymentCompleted: bookings.paymentCompleted,
        receiptGenerated: bookings.receiptGenerated,
        workflowData: bookings.workflowData,
        currentWorkflowStep: bookings.currentWorkflowStep,
        lastModified: bookings.lastModified,
        createdAt: bookings.createdAt,
        updatedAt: bookings.updatedAt,

        eventDates: sql`
          coalesce(
            json_agg(
              json_build_object(
                'eventDate', ${bookingDates.eventDate},
                'startTime', ${bookingDates.startTime},
                'endTime', ${bookingDates.endTime}
              )
              ORDER BY ${bookingDates.eventDate}
            ) FILTER (WHERE ${bookingDates.id} IS NOT NULL),
            '[]'
          )
        `,
      })
      .from(bookings)
      .leftJoin(bookingDates, eq(bookings.id, bookingDates.bookingId))
      .where(eq(bookings.primaryArtistUserId, artistUserId))
      .groupBy(bookings.id);
  }


  // async getBookingById(bookingId: number): Promise<Booking | undefined> {
  //   const [booking] = await db
  //     .select()
  //     .from(bookings)
  //     .where(eq(bookings.id, bookingId));
  //   return booking;
  // }

  async getBookingById(bookingId: number): Promise<any | undefined> {
    const [booking] = await db
      .select({
        id: bookings.id,
        bookerUserId: bookings.bookerUserId,
        primaryArtistUserId: bookings.primaryArtistUserId,
        eventName: bookings.eventName,
        eventType: bookings.eventType,
        venueName: bookings.venueName,
        venueAddress: bookings.venueAddress,
        requirements: bookings.requirements,
        status: bookings.status,
        totalBudget: bookings.totalBudget,
        finalPrice: bookings.finalPrice,
        guestName: bookings.guestName,
        guestEmail: bookings.guestEmail,
        guestPhone: bookings.guestPhone,
        isGuestBooking: bookings.isGuestBooking,
        assignedAdminId: bookings.assignedAdminId,
        adminApprovedAt: bookings.adminApprovedAt,
        internalObjectives: bookings.internalObjectives,
        internalNotes: bookings.internalNotes,
        contractsGenerated: bookings.contractsGenerated,
        allSignaturesCompleted: bookings.allSignaturesCompleted,
        paymentCompleted: bookings.paymentCompleted,
        receiptGenerated: bookings.receiptGenerated,
        workflowData: bookings.workflowData,
        currentWorkflowStep: bookings.currentWorkflowStep,
        lastModified: bookings.lastModified,
        createdAt: bookings.createdAt,
        updatedAt: bookings.updatedAt,

        eventDates: sql`
          coalesce(
            json_agg(
              json_build_object(
                'eventDate', ${bookingDates.eventDate},
                'startTime', ${bookingDates.startTime},
                'endTime', ${bookingDates.endTime}
              )
              ORDER BY ${bookingDates.eventDate}
            ) FILTER (WHERE ${bookingDates.id} IS NOT NULL),
            '[]'
          )
        `,
      })
      .from(bookings)
      .leftJoin(bookingDates, eq(bookings.id, bookingDates.bookingId))
      .where(eq(bookings.id, bookingId))
      .groupBy(bookings.id);

    return booking || undefined;
  }


  // async getBookings(): Promise<Booking[]> {
  //   return await db.select().from(bookings);
  // }

  async getBookings(): Promise<any[]> {
    const results = await db
      .select({
        id: bookings.id,
        bookerUserId: bookings.bookerUserId,
        primaryArtistUserId: bookings.primaryArtistUserId,
        eventName: bookings.eventName,
        eventType: bookings.eventType,
        venueName: bookings.venueName,
        venueAddress: bookings.venueAddress,
        requirements: bookings.requirements,
        status: bookings.status,
        totalBudget: bookings.totalBudget,
        finalPrice: bookings.finalPrice,
        guestName: bookings.guestName,
        guestEmail: bookings.guestEmail,
        guestPhone: bookings.guestPhone,
        isGuestBooking: bookings.isGuestBooking,
        assignedAdminId: bookings.assignedAdminId,
        adminApprovedAt: bookings.adminApprovedAt,
        internalObjectives: bookings.internalObjectives,
        internalNotes: bookings.internalNotes,
        contractsGenerated: bookings.contractsGenerated,
        allSignaturesCompleted: bookings.allSignaturesCompleted,
        paymentCompleted: bookings.paymentCompleted,
        receiptGenerated: bookings.receiptGenerated,
        workflowData: bookings.workflowData,
        currentWorkflowStep: bookings.currentWorkflowStep,
        lastModified: bookings.lastModified,
        createdAt: bookings.createdAt,
        updatedAt: bookings.updatedAt,

        // ✅ EventDates aggregation
        eventDates: sql`
      coalesce(
        json_agg(
          json_build_object(
            'eventDate', ${bookingDates.eventDate},
            'startTime', ${bookingDates.startTime},
            'endTime', ${bookingDates.endTime}
          )
          ORDER BY ${bookingDates.eventDate}
        ) FILTER (WHERE ${bookingDates.id} IS NOT NULL),
        '[]'
      )
    `,
      })
      .from(bookings)
      .leftJoin(bookingDates, eq(bookings.id, bookingDates.bookingId))
      .groupBy(bookings.id);
    return results;
  }


  async getUserById(userId: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    return user;
  }

  async getEventsByArtist(artistUserId: number): Promise<Event[]> {
    return await db
      .select()
      .from(events)
      .where(eq(events.artistUserId, artistUserId));
  }

  async getEventsByUser(userId: number): Promise<Event[]> {
    // Check if events table has bookerUserId column, if not just use artistUserId
    try {
      return await db
        .select()
        .from(events)
        .where(eq(events.artistUserId, userId));
    } catch (error) {
      console.error("Get events by user error:", error);
      return [];
    }
  }

  async getUpcomingEvents(): Promise<Event[]> {
    return await db.select().from(events);
  }

  // Recommendation System Implementation
  async createUserInteraction(
    interaction: InsertUserInteraction
  ): Promise<UserInteraction> {
    const [created] = await db
      .insert(userInteractions)
      .values(interaction)
      .returning();
    return created;
  }

  async getUserInteractions(userId: number): Promise<UserInteraction[]> {
    return await db
      .select()
      .from(userInteractions)
      .where(eq(userInteractions.userId, userId));
  }

  async getAllUserInteractions(): Promise<UserInteraction[]> {
    return await db.select().from(userInteractions);
  }

  async getUserPreferences(
    userId: number
  ): Promise<UserPreferences | undefined> {
    const [preferences] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId));
    return preferences || undefined;
  }

  async updateUserPreferences(
    userId: number,
    preferences: Partial<InsertUserPreferences>
  ): Promise<UserPreferences> {
    // Check if preferences exist, if not create them
    const existing = await this.getUserPreferences(userId);

    if (existing) {
      await db
        .update(userPreferences)
        .set({ ...preferences, updatedAt: new Date() })
        .where(eq(userPreferences.userId, userId));
    } else {
      await db.insert(userPreferences).values({ userId, ...preferences });
    }

    return this.getUserPreferences(userId) as Promise<UserPreferences>;
  }

  async createMusicRecommendation(
    recommendation: InsertMusicRecommendation
  ): Promise<MusicRecommendation> {
    const [created] = await db
      .insert(musicRecommendations)
      .values(recommendation)
      .returning();
    return created;
  }

  async getUserRecommendations(
    userId: number,
    limit: number = 10
  ): Promise<MusicRecommendation[]> {
    return await db
      .select()
      .from(musicRecommendations)
      .where(
        and(
          eq(musicRecommendations.userId, userId),
          eq(musicRecommendations.isActive, true)
        )
      )
      .orderBy(desc(musicRecommendations.score))
      .limit(limit);
  }

  async clearUserRecommendations(userId: number): Promise<void> {
    await db
      .update(musicRecommendations)
      .set({ isActive: false })
      .where(eq(musicRecommendations.userId, userId));
  }

  async updateRecommendationEngagement(
    recommendationId: number,
    engagementType: "viewed" | "clicked"
  ): Promise<void> {
    const updateData =
      engagementType === "viewed"
        ? { viewedAt: new Date() }
        : { clickedAt: new Date() };

    await db
      .update(musicRecommendations)
      .set(updateData)
      .where(eq(musicRecommendations.id, recommendationId));
  }

  async createArtistSimilarity(
    similarity: InsertArtistSimilarity
  ): Promise<ArtistSimilarity> {
    const [created] = await db
      .insert(artistSimilarities)
      .values(similarity)
      .returning();
    return created;
  }

  async getArtistSimilarities(artistId: number): Promise<ArtistSimilarity[]> {
    return await db
      .select()
      .from(artistSimilarities)
      .where(
        or(
          eq(artistSimilarities.artistId1, artistId),
          eq(artistSimilarities.artistId2, artistId)
        )
      )
      .orderBy(desc(artistSimilarities.similarityScore));
  }

  async getAllArtists(): Promise<Artist[]> {
    return await db.select().from(artists);
  }

  async getArtistFans(artistId: number): Promise<number[]> {
    // Get users who have positively interacted with this artist
    const interactions = await db
      .select({ userId: userInteractions.userId })
      .from(userInteractions)
      .where(
        and(
          eq(userInteractions.artistId, artistId),
          or(
            eq(userInteractions.interactionType, "like"),
            eq(userInteractions.interactionType, "play"),
            eq(userInteractions.interactionType, "download")
          )
        )
      )
      .groupBy(userInteractions.userId);

    return interactions.map((i) => i.userId);
  }

  async incrementTrendingMetric(
    metric: Partial<InsertTrendingMetric>
  ): Promise<void> {
    // Check if metric exists for today
    const existing = await db
      .select()
      .from(trendingMetrics)
      .where(
        and(
          eq(trendingMetrics.songId, metric.songId || 0),
          eq(trendingMetrics.artistId, metric.artistId || 0),
          eq(trendingMetrics.metricType, metric.metricType || ""),
          eq(trendingMetrics.timeframe, metric.timeframe || ""),
          eq(trendingMetrics.date, metric.date || new Date())
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // Update existing metric
      await db
        .update(trendingMetrics)
        .set({ count: (existing[0]?.count || 0) + (metric.count || 1) })
        .where(eq(trendingMetrics.id, existing[0].id));
    } else {
      // Create new metric
      await db.insert(trendingMetrics).values(metric as InsertTrendingMetric);
    }
  }

  async getTrendingSongs(timeframe: string): Promise<Song[]> {
    // Get top songs based on trending metrics
    const trendingSongIds = await db
      .select({
        songId: trendingMetrics.songId,
        totalCount: sql<number>`sum(${trendingMetrics.count})`.as("totalCount"),
      })
      .from(trendingMetrics)
      .where(
        and(
          eq(trendingMetrics.timeframe, timeframe),
          isNotNull(trendingMetrics.songId)
        )
      )
      .groupBy(trendingMetrics.songId)
      .orderBy(desc(sql`sum(${trendingMetrics.count})`))
      .limit(20);

    if (trendingSongIds.length === 0) return [];

    const songIds = trendingSongIds.map((t) => t.songId!);
    return await db
      .select()
      .from(songs)
      .where(sql`${songs.id} IN (${songIds.join(",")})`);
  }

  async getActiveCrossPromotionCampaigns(): Promise<CrossPromotionCampaign[]> {
    const now = new Date();
    return await db
      .select()
      .from(crossPromotionCampaigns)
      .where(
        and(
          eq(crossPromotionCampaigns.isActive, true),
          lte(crossPromotionCampaigns.startDate, now),
          gte(crossPromotionCampaigns.endDate, now)
        )
      );
  }

  async incrementCampaignImpressions(campaignId: number): Promise<void> {
    await db
      .update(crossPromotionCampaigns)
      .set({
        impressions: sql`${crossPromotionCampaigns.impressions} + 1`,
      })
      .where(eq(crossPromotionCampaigns.id, campaignId));
  }

  async getSongsByGenre(genre: string): Promise<Song[]> {
    // Get songs by artists of the specified genre
    const artistSongs = await db
      .select({
        id: songs.id,
        artistUserId: songs.artistUserId,
        title: songs.title,
        mp3Url: songs.mp3Url,
        coverArtUrl: songs.coverArtUrl,
        isrcCode: songs.isrcCode,
        price: songs.price,
        isFree: songs.isFree,
        durationSeconds: songs.durationSeconds,
        previewStartSeconds: songs.previewStartSeconds,
        createdAt: songs.createdAt,
      })
      .from(songs)
      .innerJoin(artists, eq(songs.artistUserId, artists.userId))
      .where(eq(artists.genre, genre));

    return artistSongs;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, username));
    return user || undefined;
  }

  // Service Management Implementation
  async getServiceCategories(): Promise<ServiceCategory[]> {
    return await db.select().from(serviceCategories);
  }

  async createServiceCategory(
    category: InsertServiceCategory
  ): Promise<ServiceCategory> {
    const [created] = await db
      .insert(serviceCategories)
      .values(category)
      .returning();
    return created;
  }

  async getServices(): Promise<Service[]> {
    return await db.select().from(services).where(eq(services.isActive, true));
  }

  async getService(id: number): Promise<Service | undefined> {
    const [service] = await db
      .select()
      .from(services)
      .where(eq(services.id, id));
    return service || undefined;
  }

  async createService(service: InsertService): Promise<Service> {
    const [created] = await db.insert(services).values(service).returning();
    return created;
  }

  async updateService(
    id: number,
    updates: Partial<Service>
  ): Promise<Service | undefined> {
    await db.update(services).set(updates).where(eq(services.id, id));
    return this.getService(id);
  }

  async deleteService(id: number): Promise<boolean> {
    const result = await db
      .update(services)
      .set({ isActive: false })
      .where(eq(services.id, id));
    return true;
  }

  async getServiceAssignments(): Promise<ServiceAssignment[]> {
    const assignments = await db
      .select({
        id: serviceAssignments.id,
        serviceId: serviceAssignments.serviceId,
        assignedUserId: serviceAssignments.assignedUserId,
        assignedPrice: serviceAssignments.assignedPrice,
        userCommission: serviceAssignments.userCommission,
        isActive: serviceAssignments.isActive,
        assignedByUserId: serviceAssignments.assignedByUserId,
        assignedAt: serviceAssignments.assignedAt,
        assignedUserName: users.fullName,
        serviceName: services.name,
      })
      .from(serviceAssignments)
      .leftJoin(users, eq(serviceAssignments.assignedUserId, users.id))
      .leftJoin(services, eq(serviceAssignments.serviceId, services.id))
      .where(eq(serviceAssignments.isActive, true));

    return assignments as ServiceAssignment[];
  }

  async getServiceAssignmentsByUser(
    userId: number
  ): Promise<ServiceAssignment[]> {
    return await db
      .select()
      .from(serviceAssignments)
      .where(
        and(
          eq(serviceAssignments.assignedUserId, userId),
          eq(serviceAssignments.isActive, true)
        )
      );
  }

  async getServiceAssignmentsByService(
    serviceId: number
  ): Promise<ServiceAssignment[]> {
    return await db
      .select()
      .from(serviceAssignments)
      .where(
        and(
          eq(serviceAssignments.serviceId, serviceId),
          eq(serviceAssignments.isActive, true)
        )
      );
  }

  async createServiceAssignment(
    assignment: InsertServiceAssignment
  ): Promise<ServiceAssignment> {
    const [created] = await db
      .insert(serviceAssignments)
      .values(assignment)
      .returning();
    return created;
  }

  async updateServiceAssignment(
    id: number,
    updates: Partial<ServiceAssignment>
  ): Promise<ServiceAssignment | undefined> {
    await db
      .update(serviceAssignments)
      .set(updates)
      .where(eq(serviceAssignments.id, id));

    const [updated] = await db
      .select()
      .from(serviceAssignments)
      .where(eq(serviceAssignments.id, id));
    return updated || undefined;
  }

  async getServiceAssignment(
    id: number
  ): Promise<ServiceAssignment | undefined> {
    const [assignment] = await db
      .select()
      .from(serviceAssignments)
      .where(eq(serviceAssignments.id, id));
    return assignment || undefined;
  }

  async getServiceAssignmentsByTalent(
    assignedTalentId: number
  ): Promise<ServiceAssignment[]> {
    return await db
      .select()
      .from(serviceAssignments)
      .where(
        and(
          eq(serviceAssignments.assignedUserId, assignedTalentId),
          eq(serviceAssignments.isActive, true)
        )
      );
  }

  async removeServiceAssignment(id: number): Promise<void> {
    await db
      .update(serviceAssignments)
      .set({ isActive: false })
      .where(eq(serviceAssignments.id, id));
  }

  async deleteServiceAssignment(id: number): Promise<boolean> {
    await db
      .update(serviceAssignments)
      .set({ isActive: false })
      .where(eq(serviceAssignments.id, id));
    return true;
  }

  // Playback Tracks & DJ Management System
  async getPlaybackTracksByBookingId(bookingId: number): Promise<any[]> {
    return await db
      .select()
      .from(playbackTracks)
      .where(
        and(
          eq(playbackTracks.bookingId, bookingId),
          eq(playbackTracks.isActive, true)
        )
      )
      .orderBy(playbackTracks.setlistPosition);
  }

  async getPlaybackTrackById(trackId: number): Promise<any> {
    const [track] = await db
      .select()
      .from(playbackTracks)
      .where(eq(playbackTracks.id, trackId));
    return track || undefined;
  }

  async createPlaybackTrack(trackData: any): Promise<any> {
    const [created] = await db
      .insert(playbackTracks)
      .values(trackData)
      .returning();
    return created;
  }

  async updatePlaybackTrack(trackId: number, updates: any): Promise<void> {
    await db
      .update(playbackTracks)
      .set(updates)
      .where(eq(playbackTracks.id, trackId));
  }

  async createDjAccess(accessData: any): Promise<any> {
    const [created] = await db.insert(djAccess).values(accessData).returning();
    return created;
  }

  async getDjAccessByCode(accessCode: string): Promise<any> {
    const [access] = await db
      .select()
      .from(djAccess)
      .where(eq(djAccess.accessCode, accessCode));
    return access || undefined;
  }

  async updateDjAccess(accessId: number, updates: any): Promise<void> {
    await db.update(djAccess).set(updates).where(eq(djAccess.id, accessId));
  }

  async createPlaybackTrackDownload(downloadData: any): Promise<any> {
    const [created] = await db
      .insert(playbackTrackDownloads)
      .values(downloadData)
      .returning();
    return created;
  }

  // Setlist Management
  async saveSetlist(setlistData: any): Promise<any> {
    const [created] = await db
      .insert(setlistTemplates)
      .values(setlistData)
      .returning();
    return created;
  }

  async getSetlistByBooking(bookingId: number): Promise<any> {
    const [setlist] = await db
      .select()
      .from(setlistTemplates)
      .where(eq(setlistTemplates.bookingId, bookingId));
    return setlist || undefined;
  }

  async updateSetlist(setlistId: number, updates: any): Promise<void> {
    await db
      .update(setlistTemplates)
      .set(updates)
      .where(eq(setlistTemplates.id, setlistId));
  }

  // Curator Distribution System
  async getCurators(): Promise<any[]> {
    return await db
      .select()
      .from(curators)
      .where(eq(curators.isActive, true))
      .orderBy(curators.influenceScore, curators.name);
  }

  async getCuratorById(curatorId: number): Promise<any> {
    const [curator] = await db
      .select()
      .from(curators)
      .where(eq(curators.id, curatorId));
    return curator || undefined;
  }

  async createCurator(curatorData: any): Promise<any> {
    const [created] = await db.insert(curators).values(curatorData).returning();
    return created;
  }

  async updateCurator(curatorId: number, updates: any): Promise<void> {
    await db.update(curators).set(updates).where(eq(curators.id, curatorId));
  }

  async getCuratorsByGenres(genres: string[]): Promise<any[]> {
    return await db
      .select()
      .from(curators)
      .where(
        and(
          eq(curators.isActive, true),
          // Using raw SQL for JSONB array overlap check
          sql`${curators.genres} ?| array[${genres
            .map((g) => `'${g}'`)
            .join(",")}]`
        )
      )
      .orderBy(curators.influenceScore);
  }

  async createCuratorSubmission(submissionData: any): Promise<any> {
    const [created] = await db
      .insert(curatorSubmissions)
      .values(submissionData)
      .returning();
    return created;
  }

  async getCuratorSubmissions(filters?: {
    songId?: number;
    albumId?: number;
    curatorId?: number;
  }): Promise<any[]> {
    let query = db
      .select({
        id: curatorSubmissions.id,
        curatorId: curatorSubmissions.curatorId,
        songId: curatorSubmissions.songId,
        albumId: curatorSubmissions.albumId,
        releaseType: curatorSubmissions.releaseType,
        submissionDate: curatorSubmissions.submissionDate,
        status: curatorSubmissions.status,
        curatorResponse: curatorSubmissions.curatorResponse,
        responseDate: curatorSubmissions.responseDate,
        placementUrl: curatorSubmissions.placementUrl,
        followUpCount: curatorSubmissions.followUpCount,
        linkClicks: curatorSubmissions.linkClicks,
        submittedByUserId: curatorSubmissions.submittedByUserId,
        createdAt: curatorSubmissions.createdAt,
        // Include curator information
        curatorName: curators.name,
        curatorEmail: curators.email,
        curatorOrganization: curators.organization,
      })
      .from(curatorSubmissions)
      .leftJoin(curators, eq(curatorSubmissions.curatorId, curators.id));

    // Apply filters if provided
    const conditions = [];
    if (filters?.songId) {
      conditions.push(eq(curatorSubmissions.songId, filters.songId));
    }
    if (filters?.albumId) {
      conditions.push(eq(curatorSubmissions.albumId, filters.albumId));
    }
    if (filters?.curatorId) {
      conditions.push(eq(curatorSubmissions.curatorId, filters.curatorId));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query.orderBy(curatorSubmissions.submissionDate);
  }

  async updateCuratorSubmission(
    submissionId: number,
    updates: any
  ): Promise<void> {
    await db
      .update(curatorSubmissions)
      .set(updates)
      .where(eq(curatorSubmissions.id, submissionId));
  }

  async createCuratorEmailCampaign(campaignData: any): Promise<any> {
    const [created] = await db
      .insert(curatorEmailCampaigns)
      .values(campaignData)
      .returning();
    return created;
  }

  async getCuratorEmailCampaigns(): Promise<any[]> {
    return await db
      .select()
      .from(curatorEmailCampaigns)
      .orderBy(curatorEmailCampaigns.createdAt);
  }

  async updateCuratorEmailCampaign(
    campaignId: number,
    updates: any
  ): Promise<void> {
    await db
      .update(curatorEmailCampaigns)
      .set(updates)
      .where(eq(curatorEmailCampaigns.id, campaignId));
  }

  // PROFESSIONAL INTEGRATION SYSTEM - REAL DATABASE IMPLEMENTATION
  // These methods provide the seamless cross-platform integration you requested

  async createInternalObjective(objective: any): Promise<any> {
    try {
      const sql = `
        INSERT INTO internal_booking_objectives 
        (booking_id, objective_type, title, description, priority, target_deadline, assigned_to, status, confidential, created_by, tags, related_professionals)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `;

      const result = await pool.query(sql, [
        objective.bookingId,
        objective.objectiveType,
        objective.title,
        objective.description,
        objective.priority || "medium",
        objective.targetDeadline,
        objective.assignedTo,
        objective.status || "planning",
        objective.confidential !== false,
        objective.createdBy,
        JSON.stringify(objective.tags || []),
        JSON.stringify(objective.relatedProfessionals || []),
      ]);

      return result.rows[0];
    } catch (error) {
      console.error("Error creating internal objective:", error);
      throw error;
    }
  }

  async getInternalObjectivesByBooking(bookingId: number): Promise<any[]> {
    try {
      const sql = `
        SELECT * FROM internal_booking_objectives 
        WHERE booking_id = $1 
        ORDER BY created_at DESC
      `;

      const result = await pool.query(sql, [bookingId]);
      return result.rows;
    } catch (error) {
      console.error("Error fetching internal objectives:", error);
      return [];
    }
  }

  async updateInternalObjectiveStatus(
    objectiveId: number,
    status: string
  ): Promise<any> {
    try {
      const sql = `
        UPDATE internal_booking_objectives 
        SET status = $1, updated_at = CURRENT_TIMESTAMP 
        WHERE id = $2 
        RETURNING *
      `;

      const result = await pool.query(sql, [status, objectiveId]);
      return result.rows[0];
    } catch (error) {
      console.error("Error updating objective status:", error);
      throw error;
    }
  }

  async createProfessionalAssignment(assignment: any): Promise<any> {
    try {
      const sql = `
        INSERT INTO professional_assignments 
        (booking_id, professional_user_id, assignment_type, assigned_by, deliverables, internal_objectives, equipment_required, budget, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `;

      const result = await pool.query(sql, [
        assignment.bookingId,
        assignment.professionalUserId,
        assignment.assignmentType,
        assignment.assignedBy,
        JSON.stringify(assignment.deliverables || []),
        JSON.stringify(assignment.internalObjectives || []),
        JSON.stringify(assignment.equipmentRequired || []),
        assignment.budget || 0,
        assignment.status || "pending",
      ]);

      return result.rows[0];
    } catch (error) {
      console.error("Error creating professional assignment:", error);
      throw error;
    }
  }

  async getProfessionalEquipment(professionalUserId: number): Promise<any[]> {
    try {
      const sql = `
        SELECT * FROM professional_equipment 
        WHERE professional_user_id = $1 
        ORDER BY last_updated DESC
      `;

      const result = await pool.query(sql, [professionalUserId]);
      return result.rows;
    } catch (error) {
      console.error("Error fetching professional equipment:", error);
      return [];
    }
  }

  async createCrossPlatformProject(project: any): Promise<any> {
    try {
      const sql = `
        INSERT INTO cross_platform_projects 
        (booking_id, project_name, photographers, videographers, marketing_specialists, social_media_specialists, project_timeline, deliverables, budget)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `;

      const result = await pool.query(sql, [
        project.bookingId,
        project.projectName,
        JSON.stringify(
          project.professionals?.photographerId
            ? [project.professionals.photographerId]
            : []
        ),
        JSON.stringify(
          project.professionals?.videographerId
            ? [project.professionals.videographerId]
            : []
        ),
        JSON.stringify(
          project.professionals?.marketingSpecialistId
            ? [project.professionals.marketingSpecialistId]
            : []
        ),
        JSON.stringify(
          project.professionals?.socialMediaSpecialistId
            ? [project.professionals.socialMediaSpecialistId]
            : []
        ),
        JSON.stringify(project.projectTimeline || {}),
        JSON.stringify(project.deliverables || []),
        JSON.stringify(project.budget || {}),
      ]);

      return result.rows[0];
    } catch (error) {
      console.error("Error creating cross-platform project:", error);
      throw error;
    }
  }

  async addProfessionalEquipment(equipment: any): Promise<any> {
    try {
      const sql = `
        INSERT INTO professional_equipment 
        (professional_user_id, equipment_type, brand, model, specifications, condition)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;

      const result = await pool.query(sql, [
        equipment.professionalUserId,
        equipment.equipmentType,
        equipment.brand,
        equipment.model,
        JSON.stringify(equipment.specifications || {}),
        equipment.condition || "good",
      ]);

      return result.rows[0];
    } catch (error) {
      console.error("Error adding professional equipment:", error);
      throw error;
    }
  }

  // REVENUE TARGET METHODS - $2M+ REVENUE SYSTEM IMPLEMENTATION
  async getRevenueProjections(): Promise<any> {
    try {
      // Calculate actual revenue projections based on real data
      const bookingsCount = await this.getAllBookings();
      const usersCount = await this.getAllUsers();

      const monthlyBookingRevenue = bookingsCount.length * 150; // Average booking commission
      const monthlySubscriptionRevenue = usersCount.length * 0.15 * 89.99; // 15% subscription rate at avg tier
      const monthlyProfessionalServices = 50000; // Professional services revenue
      const monthlySplitsheetRevenue = 1000; // Splitsheet services

      const monthlyTotal =
        monthlyBookingRevenue +
        monthlySubscriptionRevenue +
        monthlyProfessionalServices +
        monthlySplitsheetRevenue;
      const annualTotal = monthlyTotal * 12;

      return {
        monthly: monthlyTotal,
        annual: annualTotal,
        targetProgress: (annualTotal / 2000000) * 100, // Progress toward $2M target
        breakdown: {
          bookings: monthlyBookingRevenue * 12,
          subscriptions: monthlySubscriptionRevenue * 12,
          professionalServices: monthlyProfessionalServices * 12,
          splitsheets: monthlySplitsheetRevenue * 12,
        },
      };
    } catch (error) {
      console.error("Error calculating revenue projections:", error);
      return { monthly: 0, annual: 0, targetProgress: 0, breakdown: {} };
    }
  }

  async getUserServices(userId: number): Promise<UserService[]> {
    return await db
      .select()
      .from(userServices)
      .where(
        and(eq(userServices.userId, userId), eq(userServices.isActive, true))
      );
  }

  async getAllUserServices(): Promise<UserService[]> {
    return await db
      .select()
      .from(userServices)
      .where(eq(userServices.isActive, true));
  }

  async getUserService(id: number): Promise<UserService | undefined> {
    const [service] = await db
      .select()
      .from(userServices)
      .where(eq(userServices.id, id));
    return service || undefined;
  }

  async createUserService(
    userService: InsertUserService
  ): Promise<UserService> {
    const [created] = await db
      .insert(userServices)
      .values(userService)
      .returning();
    return created;
  }

  async updateUserService(
    id: number,
    updates: Partial<UserService>
  ): Promise<UserService | undefined> {
    await db.update(userServices).set(updates).where(eq(userServices.id, id));
    return this.getUserService(id);
  }

  async deleteUserService(id: number): Promise<boolean> {
    await db
      .update(userServices)
      .set({ isActive: false })
      .where(eq(userServices.id, id));
    return true;
  }

  // Cart functionality for media player upselling
  async getCartItems(userId: number): Promise<CartItem[]> {
    return await db
      .select()
      .from(cartItems)
      .where(eq(cartItems.userId, userId));
  }

  async addToCart(cartItem: InsertCartItem): Promise<CartItem> {
    const [created] = await db.insert(cartItems).values(cartItem).returning();
    return created;
  }

  async removeFromCart(userId: number, itemId: number): Promise<void> {
    await db
      .delete(cartItems)
      .where(and(eq(cartItems.userId, userId), eq(cartItems.id, itemId)));
  }

  async clearCart(userId: number): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
  }

  // Professional booking assignment methods
  async createBookingProfessionalAssignment(assignment: any): Promise<any> {
    const [result] = await db
      .insert(bookingProfessionalAssignments)
      .values(assignment)
      .returning();
    return result;
  }

  async getBookingProfessionalAssignments(bookingId: number): Promise<any[]> {
    return await db
      .select()
      .from(bookingProfessionalAssignments)
      .where(eq(bookingProfessionalAssignments.bookingId, bookingId));
  }

  async updateBookingProfessionalAssignment(
    id: number,
    updates: any
  ): Promise<any> {
    const [result] = await db
      .update(bookingProfessionalAssignments)
      .set(updates)
      .where(eq(bookingProfessionalAssignments.id, id))
      .returning();
    return result;
  }

  async deleteBookingProfessionalAssignment(id: number): Promise<void> {
    await db
      .delete(bookingProfessionalAssignments)
      .where(eq(bookingProfessionalAssignments.id, id));
  }

  // OppHub professional guidance methods
  async createOppHubProfessionalGuidance(guidance: any): Promise<any> {
    const [result] = await db
      .insert(oppHubProfessionalGuidance)
      .values(guidance)
      .returning();
    return result;
  }

  async getOppHubProfessionalGuidance(assignmentId: number): Promise<any> {
    const [result] = await db
      .select()
      .from(oppHubProfessionalGuidance)
      .where(eq(oppHubProfessionalGuidance.assignmentId, assignmentId));
    return result;
  }

  async updateOppHubProfessionalGuidance(
    id: number,
    updates: any
  ): Promise<any> {
    const [result] = await db
      .update(oppHubProfessionalGuidance)
      .set(updates)
      .where(eq(oppHubProfessionalGuidance.id, id))
      .returning();
    return result;
  }

  async getServiceReviews(
    serviceId?: number,
    userServiceId?: number
  ): Promise<ServiceReview[]> {
    if (serviceId) {
      return await db
        .select()
        .from(serviceReviews)
        .where(eq(serviceReviews.serviceId, serviceId));
    } else if (userServiceId) {
      return await db
        .select()
        .from(serviceReviews)
        .where(eq(serviceReviews.userServiceId, userServiceId));
    }

    return await db.select().from(serviceReviews);
  }

  async createServiceReview(
    review: InsertServiceReview
  ): Promise<ServiceReview> {
    const [created] = await db
      .insert(serviceReviews)
      .values(review)
      .returning();
    return created;
  }

  // Currency management methods
  async getCurrencies(): Promise<Currency[]> {
    return await db
      .select()
      .from(currencies)
      .where(eq(currencies.isActive, true));
  }

  async getCurrency(code: string): Promise<Currency | undefined> {
    const [currency] = await db
      .select()
      .from(currencies)
      .where(eq(currencies.code, code));
    return currency || undefined;
  }

  async createCurrency(currency: InsertCurrency): Promise<Currency> {
    const [created] = await db.insert(currencies).values(currency).returning();
    return created;
  }

  async updateCurrency(
    code: string,
    updates: Partial<Currency>
  ): Promise<Currency | undefined> {
    await db.update(currencies).set(updates).where(eq(currencies.code, code));
    return this.getCurrency(code);
  }

  async updateCurrencyRate(
    code: string,
    rate: number
  ): Promise<Currency | undefined> {
    await db
      .update(currencies)
      .set({ rate: rate.toString(), lastUpdated: new Date() })
      .where(eq(currencies.code, code));
    return this.getCurrency(code);
  }

  // Store bundle methods
  async getBundles(): Promise<Bundle[]> {
    return await db.select().from(bundles).where(eq(bundles.isActive, true));
  }

  async getBundle(id: number): Promise<Bundle | undefined> {
    const [bundle] = await db.select().from(bundles).where(eq(bundles.id, id));
    return bundle || undefined;
  }

  async getBundlesByArtist(artistUserId: number): Promise<Bundle[]> {
    return await db
      .select()
      .from(bundles)
      .where(
        and(eq(bundles.artistUserId, artistUserId), eq(bundles.isActive, true))
      );
  }

  async createBundle(bundle: InsertBundle): Promise<Bundle> {
    const [created] = await db.insert(bundles).values(bundle).returning();
    return created;
  }

  async updateBundle(
    id: number,
    updates: Partial<Bundle>
  ): Promise<Bundle | undefined> {
    await db.update(bundles).set(updates).where(eq(bundles.id, id));
    return this.getBundle(id);
  }

  // Bundle items methods
  async getBundleItems(bundleId: number): Promise<BundleItem[]> {
    return await db
      .select()
      .from(bundleItems)
      .where(eq(bundleItems.bundleId, bundleId));
  }

  async createBundleItem(item: InsertBundleItem): Promise<BundleItem> {
    const [created] = await db.insert(bundleItems).values(item).returning();
    return created;
  }

  async deleteBundleItem(id: number): Promise<void> {
    await db.delete(bundleItems).where(eq(bundleItems.id, id));
  }

  // Discount conditions methods
  async getDiscountConditions(bundleId: number): Promise<DiscountCondition[]> {
    return await db
      .select()
      .from(discountConditions)
      .where(
        and(
          eq(discountConditions.bundleId, bundleId),
          eq(discountConditions.isActive, true)
        )
      );
  }

  async createDiscountCondition(
    condition: InsertDiscountCondition
  ): Promise<DiscountCondition> {
    const [created] = await db
      .insert(discountConditions)
      .values(condition)
      .returning();
    return created;
  }

  async updateDiscountCondition(
    id: number,
    updates: Partial<DiscountCondition>
  ): Promise<DiscountCondition | undefined> {
    await db
      .update(discountConditions)
      .set(updates)
      .where(eq(discountConditions.id, id));

    const [updated] = await db
      .select()
      .from(discountConditions)
      .where(eq(discountConditions.id, id));
    return updated || undefined;
  }

  async validateDiscountCondition(
    conditionId: number,
    userValue: string
  ): Promise<boolean> {
    const [condition] = await db
      .select()
      .from(discountConditions)
      .where(eq(discountConditions.id, conditionId));

    if (!condition || !condition.isActive) return false;

    // Check if within valid date range
    const now = new Date();
    if (condition.validFrom && new Date(condition.validFrom) > now)
      return false;
    if (condition.validUntil && new Date(condition.validUntil) < now)
      return false;

    // Check usage limit
    if (condition.usageLimit && condition.currentUsage >= condition.usageLimit)
      return false;

    // Validate condition based on type
    switch (condition.conditionType) {
      case "ticket_id":
        // Check if user has valid ticket with this ID
        const engagement = await db
          .select()
          .from(fanEngagement)
          .where(
            and(
              eq(fanEngagement.engagementType, "show_attendance"),
              eq(fanEngagement.engagementValue, userValue)
            )
          );
        return engagement.length > 0;

      case "ppv_code":
        // Check if user has valid PPV code
        const ppvEngagement = await db
          .select()
          .from(fanEngagement)
          .where(
            and(
              eq(fanEngagement.engagementType, "ppv_view"),
              eq(fanEngagement.engagementValue, userValue)
            )
          );
        return ppvEngagement.length > 0;

      default:
        return condition.conditionValue === userValue;
    }
  }

  // Store currencies methods
  async getStoreCurrencies(): Promise<StoreCurrency[]> {
    return await db
      .select()
      .from(storeCurrencies)
      .where(eq(storeCurrencies.isActive, true))
      .orderBy(storeCurrencies.code);
  }

  async getStoreCurrency(code: string): Promise<StoreCurrency | undefined> {
    const [currency] = await db
      .select()
      .from(storeCurrencies)
      .where(eq(storeCurrencies.code, code));
    return currency || undefined;
  }

  async createStoreCurrency(
    currency: InsertStoreCurrency
  ): Promise<StoreCurrency> {
    const [created] = await db
      .insert(storeCurrencies)
      .values(currency)
      .returning();
    return created;
  }

  async updateStoreCurrency(
    id: number,
    updates: Partial<StoreCurrency>
  ): Promise<StoreCurrency | undefined> {
    await db
      .update(storeCurrencies)
      .set({ ...updates, lastUpdated: new Date() })
      .where(eq(storeCurrencies.id, id));

    const [updated] = await db
      .select()
      .from(storeCurrencies)
      .where(eq(storeCurrencies.id, id));
    return updated || undefined;
  }

  // Fan engagement methods
  async createFanEngagement(
    engagement: InsertFanEngagement
  ): Promise<FanEngagement> {
    const [created] = await db
      .insert(fanEngagement)
      .values(engagement)
      .returning();
    return created;
  }

  async getFanEngagement(
    userId: number,
    artistUserId: number
  ): Promise<FanEngagement[]> {
    return await db
      .select()
      .from(fanEngagement)
      .where(
        and(
          eq(fanEngagement.userId, userId),
          eq(fanEngagement.artistUserId, artistUserId)
        )
      )
      .orderBy(desc(fanEngagement.engagementDate));
  }

  // Assignment management methods
  async createAdminAssignment(
    assignment: InsertAdminAssignment
  ): Promise<AdminAssignment> {
    const [created] = await db
      .insert(adminAssignments)
      .values(assignment)
      .returning();

    // Enrich with user names immediately
    const [adminUser, managedUser] = await Promise.all([
      this.getUser(assignment.adminUserId),
      this.getUser(assignment.managedUserId),
    ]);

    return {
      ...created,
      adminName: adminUser?.fullName || "Unknown Admin",
      managedUserName: managedUser?.fullName || "Unknown User",
    };
  }

  async getAdminAssignments(adminUserId?: number): Promise<AdminAssignment[]> {
    let baseQuery = db
      .select()
      .from(adminAssignments)
      .where(eq(adminAssignments.isActive, true));

    if (adminUserId) {
      baseQuery = baseQuery.where(
        eq(adminAssignments.adminUserId, adminUserId)
      );
    }

    const assignments = await baseQuery;

    // Fetch user names for each assignment
    const enrichedAssignments = await Promise.all(
      assignments.map(async (assignment) => {
        const [adminUser, managedUser] = await Promise.all([
          this.getUser(assignment.adminUserId),
          this.getUser(assignment.managedUserId),
        ]);

        return {
          ...assignment,
          adminName: adminUser?.fullName || "Unknown Admin",
          managedUserName: managedUser?.fullName || "Unknown User",
        };
      })
    );

    return enrichedAssignments;
  }

  async getAdminAssignment(id: number): Promise<AdminAssignment | undefined> {
    const [assignment] = await db
      .select()
      .from(adminAssignments)
      .where(eq(adminAssignments.id, id));

    if (!assignment) return undefined;

    const [adminUser, managedUser] = await Promise.all([
      this.getUser(assignment.adminUserId),
      this.getUser(assignment.managedUserId),
    ]);

    return {
      ...assignment,
      adminName: adminUser?.fullName || "Unknown Admin",
      managedUserName: managedUser?.fullName || "Unknown User",
    };
  }

  async updateAdminAssignment(
    id: number,
    updates: Partial<AdminAssignment>
  ): Promise<AdminAssignment | undefined> {
    await db
      .update(adminAssignments)
      .set(updates)
      .where(eq(adminAssignments.id, id));
    return this.getAdminAssignment(id);
  }

  async removeAdminAssignment(id: number): Promise<void> {
    await db
      .update(adminAssignments)
      .set({ isActive: false })
      .where(eq(adminAssignments.id, id));
  }

  async createBookingAssignment(
    assignment: InsertBookingAssignment
  ): Promise<BookingAssignment> {
    const [created] = await db
      .insert(bookingAssignmentsMembers)
      .values(assignment)
      .returning();

    // Enrich with user name immediately
    const assignedUser = await this.getUser(assignment.assignedUserId);
    return {
      ...created,
      assignedUserName: assignedUser?.fullName || "Unknown User",
    };
  }

  async getBookingAssignments(
    bookingId?: number
  ): Promise<BookingAssignment[]> {
    let baseQuery = db
      .select()
      .from(bookingAssignments)
      .where(eq(bookingAssignments.isActive, true));

    if (bookingId) {
      baseQuery = baseQuery.where(eq(bookingAssignments.bookingId, bookingId));
    }

    const assignments = await baseQuery;

    // Fetch user names for each assignment
    const enrichedAssignments = await Promise.all(
      assignments.map(async (assignment) => {
        const assignedUser = await this.getUser(assignment.assignedUserId);

        return {
          ...assignment,
          assignedUserName: assignedUser?.fullName || "Unknown User",
        };
      })
    );

    return enrichedAssignments;
  }

  async getBookingAssignmentsByBooking(
    bookingId: number
  ): Promise<any[]> {
    const assignments = await db
      .select({
        id: bookingAssignmentsMembers.id,
        bookingId: bookingAssignmentsMembers.bookingId,
        userId: bookingAssignmentsMembers.userId,
        roleInBooking: bookingAssignmentsMembers.roleInBooking,
        status: bookingAssignmentsMembers.status,
        selectedTalent: bookingAssignmentsMembers.selectedTalent,
        isMainBookedTalent: bookingAssignmentsMembers.isMainBookedTalent,
        assignedAt: bookingAssignmentsMembers.assignedAt,

        // Joined info
        userFullName: users.fullName,
        userEmail: users.email,
        roleName: rolesManagement.name,
        instrumentName: allInstruments.name,
      })
      .from(bookingAssignmentsMembers)
      .innerJoin(users, eq(bookingAssignmentsMembers.userId, users.id))
      .leftJoin(
        rolesManagement,
        eq(bookingAssignmentsMembers.roleInBooking, rolesManagement.id)
      )
      .leftJoin(
        allInstruments,
        eq(bookingAssignmentsMembers.selectedTalent, allInstruments.id)
      )
      .where(
        and(
          eq(bookingAssignmentsMembers.bookingId, bookingId),
          eq(bookingAssignmentsMembers.status, "active")
        )
      );

    return assignments.map((a) => ({
      id: a.id,
      bookingId: a.bookingId,
      userId: a.userId,
      roleInBooking: a.roleInBooking,
      status: a.status,
      selectedTalent: a.selectedTalent,
      isMainBookedTalent: a.isMainBookedTalent,
      assignedAt: a.assignedAt,

      // Enhanced fields
      assignedUserName: a.userFullName || "Unknown User",
      userEmail: a.userEmail,
      role: a.roleName || "N/A",
      talent: a.instrumentName || null,
    }));
  }

  async getBookingAssignment(
    id: number
  ): Promise<BookingAssignment | undefined> {
    const [assignment] = await db
      .select()
      .from(bookingAssignments)
      .where(eq(bookingAssignments.id, id));

    if (!assignment) return undefined;

    const assignedUser = await this.getUser(assignment.assignedUserId);

    return {
      ...assignment,
      assignedUserName: assignedUser?.fullName || "Unknown User",
    };
  }

  async updateBookingAssignment(
    id: number,
    updates: Partial<BookingAssignment>
  ): Promise<BookingAssignment | undefined> {
    await db
      .update(bookingAssignments)
      .set(updates)
      .where(eq(bookingAssignments.id, id));
    return this.getBookingAssignment(id);
  }

  async removeBookingAssignment(id: number): Promise<void> {
    await db
      .update(bookingAssignments)
      .set({ isActive: false })
      .where(eq(bookingAssignments.id, id));
  }

  async createArtistMusicianAssignment(
    assignment: InsertArtistMusicianAssignment
  ): Promise<ArtistMusicianAssignment> {
    const [created] = await db
      .insert(artistMusicianAssignments)
      .values(assignment)
      .returning();

    // Enrich with user names immediately
    const [talentUser, assigneeUser] = await Promise.all([
      this.getUser(assignment.managedTalentId),
      this.getUser(assignment.assigneeId),
    ]);

    return {
      ...created,
      talentName: talentUser?.fullName || "Unknown Talent",
      assigneeName: assigneeUser?.fullName || "Unknown Assignee",
    };
  }

  async getArtistMusicianAssignments(
    artistUserId?: number
  ): Promise<ArtistMusicianAssignment[]> {
    let baseQuery = db
      .select()
      .from(artistMusicianAssignments)
      .where(eq(artistMusicianAssignments.isActive, true));

    if (artistUserId) {
      baseQuery = baseQuery.where(
        eq(artistMusicianAssignments.artistUserId, artistUserId)
      );
    }

    const assignments = await baseQuery;

    // Fetch user names for each assignment
    const enrichedAssignments = await Promise.all(
      assignments.map(async (assignment) => {
        const [artistUser, musicianUser] = await Promise.all([
          this.getUser(assignment.artistUserId),
          this.getUser(assignment.musicianUserId),
        ]);

        return {
          ...assignment,
          artistName: artistUser?.fullName || "Unknown Artist",
          musicianName: musicianUser?.fullName || "Unknown Musician",
        };
      })
    );

    return enrichedAssignments;
  }

  async getArtistMusicianAssignmentsByTalent(
    managedTalentId: number
  ): Promise<ArtistMusicianAssignment[]> {
    const assignments = await db
      .select()
      .from(artistMusicianAssignments)
      .where(
        and(
          eq(artistMusicianAssignments.managedTalentId, managedTalentId),
          eq(artistMusicianAssignments.isActive, true)
        )
      );

    const enrichedAssignments = await Promise.all(
      assignments.map(async (assignment) => {
        const [talentUser, assigneeUser] = await Promise.all([
          this.getUser(assignment.managedTalentId),
          this.getUser(assignment.assigneeId),
        ]);

        return {
          ...assignment,
          talentName: talentUser?.fullName || "Unknown Talent",
          assigneeName: assigneeUser?.fullName || "Unknown Assignee",
        };
      })
    );

    return enrichedAssignments;
  }

  async getArtistMusicianAssignmentsByAssignee(
    assigneeId: number
  ): Promise<ArtistMusicianAssignment[]> {
    const assignments = await db
      .select()
      .from(artistMusicianAssignments)
      .where(
        and(
          eq(artistMusicianAssignments.assigneeId, assigneeId),
          eq(artistMusicianAssignments.isActive, true)
        )
      );

    const enrichedAssignments = await Promise.all(
      assignments.map(async (assignment) => {
        const [talentUser, assigneeUser] = await Promise.all([
          this.getUser(assignment.managedTalentId),
          this.getUser(assignment.assigneeId),
        ]);

        return {
          ...assignment,
          talentName: talentUser?.fullName || "Unknown Talent",
          assigneeName: assigneeUser?.fullName || "Unknown Assignee",
        };
      })
    );

    return enrichedAssignments;
  }

  async getArtistMusicianAssignmentsByUser(
    userId: number
  ): Promise<ArtistMusicianAssignment[]> {
    const assignments = await db
      .select()
      .from(artistMusicianAssignments)
      .where(
        and(
          or(
            eq(artistMusicianAssignments.managedTalentId, userId),
            eq(artistMusicianAssignments.assigneeId, userId)
          ),
          eq(artistMusicianAssignments.isActive, true)
        )
      );

    const enrichedAssignments = await Promise.all(
      assignments.map(async (assignment) => {
        const [talentUser, assigneeUser] = await Promise.all([
          this.getUser(assignment.managedTalentId),
          this.getUser(assignment.assigneeId),
        ]);

        return {
          ...assignment,
          talentName: talentUser?.fullName || "Unknown Talent",
          assigneeName: assigneeUser?.fullName || "Unknown Assignee",
        };
      })
    );

    return enrichedAssignments;
  }

  async getArtistMusicianAssignment(
    id: number
  ): Promise<ArtistMusicianAssignment | undefined> {
    const [assignment] = await db
      .select()
      .from(artistMusicianAssignments)
      .where(eq(artistMusicianAssignments.id, id));

    if (!assignment) return undefined;

    const [talentUser, assigneeUser] = await Promise.all([
      this.getUser(assignment.managedTalentId),
      this.getUser(assignment.assigneeId),
    ]);

    return {
      ...assignment,
      talentName: talentUser?.fullName || "Unknown Talent",
      assigneeName: assigneeUser?.fullName || "Unknown Assignee",
    };
  }

  async updateArtistMusicianAssignment(
    id: number,
    updates: Partial<ArtistMusicianAssignment>
  ): Promise<ArtistMusicianAssignment | undefined> {
    await db
      .update(artistMusicianAssignments)
      .set(updates)
      .where(eq(artistMusicianAssignments.id, id));
    return this.getArtistMusicianAssignment(id);
  }

  async removeArtistMusicianAssignment(id: number): Promise<void> {
    await db
      .update(artistMusicianAssignments)
      .set({ isActive: false })
      .where(eq(artistMusicianAssignments.id, id));
  }

  // Booking Media Management methods
  async createBookingMediaFile(
    file: InsertBookingMediaFile
  ): Promise<BookingMediaFile> {
    const [created] = await db
      .insert(bookingMediaFiles)
      .values(file)
      .returning();
    return created;
  }

  async getBookingMediaFiles(bookingId: number): Promise<BookingMediaFile[]> {
    return await db
      .select()
      .from(bookingMediaFiles)
      .where(
        and(
          eq(bookingMediaFiles.bookingId, bookingId),
          eq(bookingMediaFiles.isActive, true)
        )
      )
      .orderBy(desc(bookingMediaFiles.uploadedAt));
  }

  async getBookingMediaFile(id: number): Promise<BookingMediaFile | undefined> {
    const [file] = await db
      .select()
      .from(bookingMediaFiles)
      .where(
        and(eq(bookingMediaFiles.id, id), eq(bookingMediaFiles.isActive, true))
      );
    return file || undefined;
  }

  async updateBookingMediaFile(
    id: number,
    updates: Partial<BookingMediaFile>
  ): Promise<BookingMediaFile | undefined> {
    await db
      .update(bookingMediaFiles)
      .set(updates)
      .where(eq(bookingMediaFiles.id, id));

    const [updated] = await db
      .select()
      .from(bookingMediaFiles)
      .where(eq(bookingMediaFiles.id, id));
    return updated || undefined;
  }

  async deleteBookingMediaFile(id: number): Promise<void> {
    await db
      .update(bookingMediaFiles)
      .set({ isActive: false })
      .where(eq(bookingMediaFiles.id, id));
  }

  // Booking Media Access Control methods
  async createBookingMediaAccess(
    access: InsertBookingMediaAccess
  ): Promise<BookingMediaAccess> {
    const [created] = await db
      .insert(bookingMediaAccess)
      .values(access)
      .returning();
    return created;
  }

  async getBookingMediaAccess(
    mediaFileId: number
  ): Promise<BookingMediaAccess[]> {
    return await db
      .select()
      .from(bookingMediaAccess)
      .where(
        and(
          eq(bookingMediaAccess.mediaFileId, mediaFileId),
          eq(bookingMediaAccess.isActive, true)
        )
      )
      .orderBy(desc(bookingMediaAccess.grantedAt));
  }

  async getUserBookingMediaAccess(
    userId: number,
    mediaFileId: number
  ): Promise<BookingMediaAccess | undefined> {
    const [access] = await db
      .select()
      .from(bookingMediaAccess)
      .where(
        and(
          eq(bookingMediaAccess.userId, userId),
          eq(bookingMediaAccess.mediaFileId, mediaFileId),
          eq(bookingMediaAccess.isActive, true)
        )
      );
    return access || undefined;
  }

  async updateBookingMediaAccess(
    id: number,
    updates: Partial<BookingMediaAccess>
  ): Promise<BookingMediaAccess | undefined> {
    await db
      .update(bookingMediaAccess)
      .set(updates)
      .where(eq(bookingMediaAccess.id, id));

    const [updated] = await db
      .select()
      .from(bookingMediaAccess)
      .where(eq(bookingMediaAccess.id, id));
    return updated || undefined;
  }

  async removeBookingMediaAccess(id: number): Promise<void> {
    await db
      .update(bookingMediaAccess)
      .set({ isActive: false })
      .where(eq(bookingMediaAccess.id, id));
  }

  async checkUserMediaAccess(
    userId: number,
    mediaFileId: number,
    requiredLevel: string
  ): Promise<boolean> {
    const [access] = await db
      .select()
      .from(bookingMediaAccess)
      .where(
        and(
          eq(bookingMediaAccess.userId, userId),
          eq(bookingMediaAccess.mediaFileId, mediaFileId),
          eq(bookingMediaAccess.accessLevel, requiredLevel),
          eq(bookingMediaAccess.isActive, true),
          or(
            isNotNull(bookingMediaAccess.expiresAt),
            gte(bookingMediaAccess.expiresAt, new Date())
          )
        )
      );
    return !!access;
  }

  // Booking Media Categories methods
  async getBookingMediaCategories(): Promise<BookingMediaCategory[]> {
    return await db
      .select()
      .from(bookingMediaCategories)
      .where(eq(bookingMediaCategories.isActive, true))
      .orderBy(bookingMediaCategories.name);
  }

  async createBookingMediaCategory(
    category: InsertBookingMediaCategory
  ): Promise<BookingMediaCategory> {
    const [created] = await db
      .insert(bookingMediaCategories)
      .values(category)
      .returning();
    return created;
  }

  async updateBookingMediaCategory(
    id: number,
    updates: Partial<BookingMediaCategory>
  ): Promise<BookingMediaCategory | undefined> {
    await db
      .update(bookingMediaCategories)
      .set(updates)
      .where(eq(bookingMediaCategories.id, id));

    const [updated] = await db
      .select()
      .from(bookingMediaCategories)
      .where(eq(bookingMediaCategories.id, id));
    return updated || undefined;
  }

  // Release Contract Management methods
  async createReleaseContract(
    contract: InsertReleaseContract
  ): Promise<ReleaseContract> {
    const [created] = await db
      .insert(releaseContracts)
      .values(contract)
      .returning();
    return created;
  }

  async getReleaseContract(id: number): Promise<ReleaseContract | undefined> {
    const [contract] = await db
      .select()
      .from(releaseContracts)
      .where(eq(releaseContracts.id, id));
    return contract || undefined;
  }

  async getReleaseContractsByUser(userId: number): Promise<ReleaseContract[]> {
    return await db
      .select()
      .from(releaseContracts)
      .where(eq(releaseContracts.managedArtistUserId, userId))
      .orderBy(desc(releaseContracts.requestedAt));
  }

  async getPendingReleaseContracts(): Promise<ReleaseContract[]> {
    const contracts = await db
      .select({
        id: releaseContracts.id,
        managedArtistUserId: releaseContracts.managedArtistUserId,
        approvedByUserId: releaseContracts.approvedByUserId,
        releaseRequestReason: releaseContracts.releaseRequestReason,
        contractTerms: releaseContracts.contractTerms,
        managementTierAtRelease: releaseContracts.managementTierAtRelease,
        status: releaseContracts.status,
        requestedAt: releaseContracts.requestedAt,
        approvedAt: releaseContracts.approvedAt,
        signedAt: releaseContracts.signedAt,
        completedAt: releaseContracts.completedAt,
        createdAt: releaseContracts.createdAt,
        updatedAt: releaseContracts.updatedAt,
        managedArtistName: users.fullName,
        managedArtistEmail: users.email,
      })
      .from(releaseContracts)
      .leftJoin(users, eq(releaseContracts.managedArtistUserId, users.id))
      .orderBy(desc(releaseContracts.requestedAt));

    return contracts as ReleaseContract[];
  }

  async updateReleaseContract(
    id: number,
    updates: Partial<ReleaseContract>
  ): Promise<ReleaseContract | undefined> {
    await db
      .update(releaseContracts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(releaseContracts.id, id));

    const [updated] = await db
      .select()
      .from(releaseContracts)
      .where(eq(releaseContracts.id, id));
    return updated || undefined;
  }

  async createReleaseContractSignature(
    signature: InsertReleaseContractSignature
  ): Promise<ReleaseContractSignature> {
    const [created] = await db
      .insert(releaseContractSignatures)
      .values(signature)
      .returning();
    return created;
  }

  async getReleaseContractSignatures(
    contractId: number
  ): Promise<ReleaseContractSignature[]> {
    return await db
      .select()
      .from(releaseContractSignatures)
      .where(eq(releaseContractSignatures.releaseContractId, contractId))
      .orderBy(desc(releaseContractSignatures.signedAt));
  }

  async createManagementTransition(
    transition: InsertManagementTransition
  ): Promise<ManagementTransition> {
    const [created] = await db
      .insert(managementTransitions)
      .values(transition)
      .returning();
    return created;
  }

  async getManagementTransitions(
    userId: number
  ): Promise<ManagementTransition[]> {
    return await db
      .select()
      .from(managementTransitions)
      .where(eq(managementTransitions.userId, userId))
      .orderBy(desc(managementTransitions.createdAt));
  }

  // Management Application System methods
  async createManagementApplication(
    application: InsertManagementApplication
  ): Promise<ManagementApplication> {
    const [created] = await db
      .insert(managementApplications)
      .values(application)
      .returning();
    return created;
  }

  async getManagementApplication(
    id: number
  ): Promise<ManagementApplication | undefined> {
    const [application] = await db
      .select()
      .from(managementApplications)
      .where(eq(managementApplications.id, id));
    return application || undefined;
  }

  async getManagementApplicationsByUser(
    userId: number
  ): Promise<ManagementApplication[]> {
    return await db
      .select()
      .from(managementApplications)
      .where(eq(managementApplications.applicantUserId, userId))
      .orderBy(desc(managementApplications.submittedAt));
  }

  async getPendingManagementApplications(): Promise<ManagementApplication[]> {
    return await db
      .select()
      .from(managementApplications)
      .where(eq(managementApplications.status, "pending"))
      .orderBy(desc(managementApplications.submittedAt));
  }
  async getManagementApplications(): Promise<ManagementApplication[]> {
    return await db
      .select()
      .from(managementApplications)
      .orderBy(desc(managementApplications.submittedAt));
  }

  async updateManagementApplication(
    id: number,
    updates: Partial<ManagementApplication>
  ): Promise<ManagementApplication | undefined> {
    await db
      .update(managementApplications)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(managementApplications.id, id));

    const [updated] = await db
      .select()
      .from(managementApplications)
      .where(eq(managementApplications.id, id));
    return updated || undefined;
  }

  async createManagementApplicationSignature(
    signature: InsertManagementApplicationSignature
  ): Promise<ManagementApplicationSignature> {
    const [created] = await db
      .insert(managementApplicationSignatures)
      .values(signature)
      .returning();
    return created;
  }

  async getManagementApplicationSignatures(
    applicationId: number
  ): Promise<ManagementApplicationSignature[]> {
    return await db
      .select()
      .from(managementApplicationSignatures)
      .where(eq(managementApplicationSignatures.applicationId, applicationId))
      .orderBy(desc(managementApplicationSignatures.signedAt));
  }

  // Service Discount Management methods
  async createServiceDiscountOverride(
    override: InsertServiceDiscountOverride
  ): Promise<ServiceDiscountOverride> {
    const [created] = await db
      .insert(serviceDiscountOverrides)
      .values(override)
      .returning();
    return created;
  }

  async getServiceDiscountOverrides(
    userId: number
  ): Promise<ServiceDiscountOverride[]> {
    return await db
      .select()
      .from(serviceDiscountOverrides)
      .where(
        and(
          eq(serviceDiscountOverrides.userId, userId),
          eq(serviceDiscountOverrides.isActive, true)
        )
      )
      .orderBy(desc(serviceDiscountOverrides.createdAt));
  }

  // WaituMusic Service Default Discount Limits (Superadmin Management)
  async createWaituServiceDiscountLimit(limit: any): Promise<any> {
    const [created] = await db
      .insert(waituServiceDiscountLimits)
      .values(limit)
      .returning();
    return created;
  }

  async getWaituServiceDiscountLimit(serviceId: number): Promise<any> {
    const [limit] = await db
      .select()
      .from(waituServiceDiscountLimits)
      .where(eq(waituServiceDiscountLimits.serviceId, serviceId))
      .orderBy(desc(waituServiceDiscountLimits.updatedAt))
      .limit(1);
    return limit;
  }

  async updateWaituServiceDiscountLimit(
    serviceId: number,
    updates: any
  ): Promise<any> {
    const [updated] = await db
      .update(waituServiceDiscountLimits)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(waituServiceDiscountLimits.serviceId, serviceId))
      .returning();
    return updated;
  }

  async getAllWaituServiceDiscountLimits(): Promise<any[]> {
    return await db
      .select()
      .from(waituServiceDiscountLimits)
      .orderBy(waituServiceDiscountLimits.serviceId);
  }

  // Individual Discount Permissions (Case-by-case Superadmin Overrides)
  async createIndividualDiscountPermission(permission: any): Promise<any> {
    const [created] = await db
      .insert(individualDiscountPermissions)
      .values(permission)
      .returning();
    return created;
  }

  async getIndividualDiscountPermission(
    userId: number,
    serviceId: number
  ): Promise<any> {
    const [permission] = await db
      .select()
      .from(individualDiscountPermissions)
      .where(
        and(
          eq(individualDiscountPermissions.userId, userId),
          eq(individualDiscountPermissions.serviceId, serviceId),
          eq(individualDiscountPermissions.isActive, true)
        )
      )
      .orderBy(desc(individualDiscountPermissions.createdAt))
      .limit(1);
    return permission;
  }

  async getUserIndividualDiscountPermissions(userId: number): Promise<any[]> {
    return await db
      .select()
      .from(individualDiscountPermissions)
      .where(
        and(
          eq(individualDiscountPermissions.userId, userId),
          eq(individualDiscountPermissions.isActive, true)
        )
      )
      .orderBy(desc(individualDiscountPermissions.createdAt));
  }

  async revokeIndividualDiscountPermission(id: number): Promise<any> {
    const [revoked] = await db
      .update(individualDiscountPermissions)
      .set({ isActive: false })
      .where(eq(individualDiscountPermissions.id, id))
      .returning();
    return revoked;
  }

  // Global Genres Management
  async getGlobalGenres(): Promise<GlobalGenre[]> {
    return await db
      .select()
      .from(globalGenres)
      .where(eq(globalGenres.isActive, true))
      .orderBy(globalGenres.category, globalGenres.name);
  }

  async getGlobalGenresByCategory(category: string): Promise<GlobalGenre[]> {
    return await db
      .select()
      .from(globalGenres)
      .where(
        and(
          eq(globalGenres.category, category),
          eq(globalGenres.isActive, true)
        )
      )
      .orderBy(globalGenres.name);
  }

  async createGlobalGenre(genre: InsertGlobalGenre): Promise<GlobalGenre> {
    const [created] = await db.insert(globalGenres).values(genre).returning();
    return created;
  }

  // Cross-Upsell Relationships Management
  // Duplicate cross-upsell methods removed - keeping original implementations

  async updateCrossUpsellRelationship(
    id: number,
    updates: Partial<CrossUpsellRelationship>
  ): Promise<CrossUpsellRelationship | undefined> {
    const [updated] = await db
      .update(crossUpsellRelationships)
      .set(updates)
      .where(eq(crossUpsellRelationships.id, id))
      .returning();
    return updated;
  }

  async getServiceDiscountOverride(
    userId: number,
    serviceId?: number,
    userServiceId?: number
  ): Promise<ServiceDiscountOverride | undefined> {
    const conditions = [
      eq(serviceDiscountOverrides.userId, userId),
      eq(serviceDiscountOverrides.isActive, true),
    ];

    if (serviceId) {
      conditions.push(eq(serviceDiscountOverrides.serviceId, serviceId));
    }
    if (userServiceId) {
      conditions.push(
        eq(serviceDiscountOverrides.userServiceId, userServiceId)
      );
    }

    const [override] = await db
      .select()
      .from(serviceDiscountOverrides)
      .where(and(...conditions))
      .orderBy(desc(serviceDiscountOverrides.createdAt))
      .limit(1);

    return override || undefined;
  }

  async updateServiceDiscountOverride(
    id: number,
    updates: Partial<ServiceDiscountOverride>
  ): Promise<ServiceDiscountOverride | undefined> {
    await db
      .update(serviceDiscountOverrides)
      .set(updates)
      .where(eq(serviceDiscountOverrides.id, id));

    const [updated] = await db
      .select()
      .from(serviceDiscountOverrides)
      .where(eq(serviceDiscountOverrides.id, id));
    return updated || undefined;
  }

  async getMaxDiscountForUser(userId: number): Promise<number> {
    // Get user and their management tier
    const user = await this.getUser(userId);
    if (!user) return 0;

    // Check for specific discount overrides first
    const overrides = await this.getServiceDiscountOverrides(userId);
    if (overrides.length > 0) {
      const maxOverride = Math.max(
        ...overrides.map((o) => parseFloat(o.overrideDiscountPercentage))
      );
      return maxOverride;
    }

    // Get management tier info for default discounts
    const managementTiers = await this.getManagementTiers();

    // Check if user is managed (roleId 3, 5, 7)
    if ([3, 5, 7].includes(user.roleId)) {
      const artist = await this.getArtist(userId);
      const musician = await this.getMusician(userId);
      const professional = await this.getProfessional(userId);

      const managementTierId =
        artist?.managementTierId ||
        musician?.managementTierId ||
        professional?.managementTierId;

      if (managementTierId) {
        const tier = managementTiers.find((t) => t.id === managementTierId);
        if (tier) {
          // Full Management tier (typically tier 1) gets up to 100% discount
          // Administration tier (typically tier 2) gets up to 50% discount
          return tier.name.toLowerCase().includes("full") ? 100 : 50;
        }
      }
    }

    return 0; // No discounts for unmanaged users
  }

  // Management Application Review System methods
  async createManagementApplicationReview(
    review: InsertManagementApplicationReview
  ): Promise<ManagementApplicationReview> {
    const [created] = await db
      .insert(managementApplicationReviews)
      .values(review)
      .returning();
    return created;
  }

  async getManagementApplicationReviews(
    applicationId: number
  ): Promise<ManagementApplicationReview[]> {
    return await db
      .select()
      .from(managementApplicationReviews)
      .where(eq(managementApplicationReviews.applicationId, applicationId))
      .orderBy(desc(managementApplicationReviews.reviewedAt));
  }

  async getManagementApplicationsByAssignedAdmin(
    adminUserId: number
  ): Promise<ManagementApplication[]> {
    // Get applications where this admin is assigned to the applicant
    const adminAssignments = await db
      .select()
      .from(adminAssignments)
      .where(eq(adminAssignments.adminUserId, adminUserId));

    if (adminAssignments.length === 0) return [];

    const managedUserIds = adminAssignments.map((a) => a.managedUserId);

    return await db
      .select()
      .from(managementApplications)
      .where(
        and(
          eq(managementApplications.status, "pending"),
          sql`${managementApplications.applicantUserId} = ANY(${managedUserIds})`
        )
      )
      .orderBy(desc(managementApplications.submittedAt));
  }

  // Legal Assignment System methods
  async createLegalAssignment(
    assignment: InsertLegalAssignment
  ): Promise<LegalAssignment> {
    const [created] = await db
      .insert(legalAssignments)
      .values(assignment)
      .returning();
    return created;
  }

  async getLegalAssignments(clientUserId: number): Promise<LegalAssignment[]> {
    return await db
      .select()
      .from(legalAssignments)
      .where(
        and(
          eq(legalAssignments.clientUserId, clientUserId),
          eq(legalAssignments.isActive, true)
        )
      )
      .orderBy(desc(legalAssignments.assignedAt));
  }

  async getLawyerClients(lawyerUserId: number): Promise<LegalAssignment[]> {
    return await db
      .select()
      .from(legalAssignments)
      .where(
        and(
          eq(legalAssignments.lawyerUserId, lawyerUserId),
          eq(legalAssignments.isActive, true)
        )
      )
      .orderBy(desc(legalAssignments.assignedAt));
  }

  async getAssignedLawyer(
    clientUserId: number,
    assignmentType?: string
  ): Promise<LegalAssignment | undefined> {
    const conditions = [
      eq(legalAssignments.clientUserId, clientUserId),
      eq(legalAssignments.isActive, true),
    ];

    if (assignmentType) {
      conditions.push(eq(legalAssignments.assignmentType, assignmentType));
    }

    const [assignment] = await db
      .select()
      .from(legalAssignments)
      .where(and(...conditions))
      .orderBy(desc(legalAssignments.assignedAt))
      .limit(1);

    return assignment || undefined;
  }

  // Application Legal Assignment System methods (Lawyers representing Wai'tuMusic)
  async createApplicationLegalAssignment(
    assignment: InsertApplicationLegalAssignment
  ): Promise<ApplicationLegalAssignment> {
    const [created] = await db
      .insert(applicationLegalAssignments)
      .values(assignment)
      .returning();
    return created;
  }

  async getApplicationLegalAssignments(
    applicationId: number
  ): Promise<ApplicationLegalAssignment[]> {
    return await db
      .select()
      .from(applicationLegalAssignments)
      .where(
        and(
          eq(applicationLegalAssignments.applicationId, applicationId),
          eq(applicationLegalAssignments.isActive, true)
        )
      )
      .orderBy(desc(applicationLegalAssignments.assignedAt));
  }

  async getApplicationsByAssignedLawyer(
    lawyerUserId: number
  ): Promise<ApplicationLegalAssignment[]> {
    return await db
      .select()
      .from(applicationLegalAssignments)
      .where(
        and(
          eq(applicationLegalAssignments.lawyerUserId, lawyerUserId),
          eq(applicationLegalAssignments.isActive, true)
        )
      )
      .orderBy(desc(applicationLegalAssignments.assignedAt));
  }

  async removeApplicationLegalAssignment(assignmentId: number): Promise<void> {
    await db
      .update(applicationLegalAssignments)
      .set({ isActive: false })
      .where(eq(applicationLegalAssignments.id, assignmentId));
  }

  // Check for conflict of interest when assigning professionals (non-performance related)
  // async checkLegalConflictOfInterest(professionalUserId: number): Promise<{ hasConflict: boolean; conflictDetails?: any[] }> {
  //   // Get the professional's role to determine if they can represent Wai'tuMusic
  //   const professional = await this.getUser(professionalUserId);
  //   if (!professional) {
  //     return { hasConflict: true, conflictDetails: [{ type: 'invalid_user', message: 'Professional not found' }] };
  //   }

  //   // Only managed professionals (roleId 7) can represent Wai'tuMusic without conflict
  //   const isManagedProfessional = professional.roleId === 7;

  //   // Check if professional is assigned to any managed users (artists, musicians, professionals)
  //   const clientAssignments = await db
  //     .select({
  //       id: legalAssignments.id,
  //       clientUserId: legalAssignments.clientUserId,
  //       assignmentType: legalAssignments.assignmentType,
  //       clientRole: users.roleId,
  //       clientName: users.fullName,
  //       clientEmail: users.email
  //     })
  //     .from(legalAssignments)
  //     .innerJoin(users, eq(legalAssignments.clientUserId, users.id))
  //     .where(and(
  //       eq(legalAssignments.lawyerUserId, professionalUserId),
  //       eq(legalAssignments.isActive, true)
  //     ));

  //   const conflictDetails: any[] = [];
  //   let hasConflict = false;

  //   // Check each client assignment for conflicts
  //   for (const assignment of clientAssignments) {
  //     const isClientManaged = [3, 5, 7].includes(assignment.clientRole); // Managed Artist, Managed Musician, Managed Professional

  //     if (isClientManaged) {
  //       // If professional is representing a managed user, they cannot represent Wai'tuMusic (conflict of interest)
  //       // unless the professional is also a managed professional (representing Wai'tuMusic)
  //       if (!isManagedProfessional) {
  //         hasConflict = true;
  //         conflictDetails.push({
  //           type: 'client_conflict',
  //           message: `Professional represents managed ${this.getRoleName(assignment.clientRole)} ${assignment.clientName}`,
  //           clientName: assignment.clientName,
  //           clientRole: assignment.clientRole,
  //           assignmentType: assignment.assignmentType
  //         });
  //       }
  //     }
  //   }

  //   // If professional is not a managed professional, they cannot represent Wai'tuMusic
  //   if (!isManagedProfessional) {
  //     hasConflict = true;
  //     conflictDetails.push({
  //       type: 'role_restriction',
  //       message: 'Only managed professionals can represent Wai\'tuMusic in non-performance matters',
  //       professionalRole: professional.roleId,
  //       professionalName: professional.fullName
  //     });
  //   }

  //   return { hasConflict, conflictDetails: conflictDetails.length > 0 ? conflictDetails : undefined };
  // }

  async checkLegalConflictOfInterest(
    professionalUserId: number
  ): Promise<{ hasConflict: boolean; conflictDetails?: any[] }> {
    // Get professional + role from userRoles
    const professional = await db
      .select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        roleId: userRoles.roleId,
      })
      .from(users)
      .innerJoin(userRoles, eq(users.id, userRoles.userId))
      .where(eq(users.id, professionalUserId))
      .limit(1)
      .then((res) => res[0]);

    if (!professional) {
      return {
        hasConflict: true,
        conflictDetails: [
          { type: "invalid_user", message: "Professional not found" },
        ],
      };
    }

    const isManagedProfessional = professional.roleId === 7; // Only managed professionals can represent Wai'tuMusic

    // Check active assignments
    const clientAssignments = await db
      .select({
        id: legalAssignments.id,
        clientUserId: legalAssignments.clientUserId,
        assignmentType: legalAssignments.assignmentType,
        clientName: users.fullName,
        clientRoleId: userRoles.roleId,
        clientEmail: users.email,
      })
      .from(legalAssignments)
      .innerJoin(users, eq(legalAssignments.clientUserId, users.id))
      .innerJoin(userRoles, eq(users.id, userRoles.userId))
      .where(
        and(
          eq(legalAssignments.lawyerUserId, professionalUserId),
          eq(legalAssignments.isActive, true)
        )
      );

    const conflictDetails: any[] = [];
    let hasConflict = false;

    for (const assignment of clientAssignments) {
      const isClientManaged = [3, 5, 7].includes(assignment.clientRoleId); // Managed Artist/Musician/Professional

      if (isClientManaged && !isManagedProfessional) {
        hasConflict = true;
        conflictDetails.push({
          type: "client_conflict",
          message: `Professional represents managed ${this.getRoleName(
            assignment.clientRoleId
          )} ${assignment.clientName}`,
          clientName: assignment.clientName,
          clientRole: assignment.clientRoleId,
          assignmentType: assignment.assignmentType,
        });
      }
    }

    if (!isManagedProfessional) {
      hasConflict = true;
      conflictDetails.push({
        type: "role_restriction",
        message:
          "Only managed professionals can represent Wai'tuMusic in non-performance matters",
        professionalRole: professional.roleId,
        professionalName: professional.fullName,
      });
    }

    return {
      hasConflict,
      conflictDetails: conflictDetails.length ? conflictDetails : undefined,
    };
  }

  // Get available professionals who can represent Wai'tuMusic without conflict

  // async getAvailableLawyersForWaituMusic(): Promise<any[]> {
  //   // Get all professionals (both managed and independent) for comprehensive analysis
  //   const allProfessionals = await db
  //     .select()
  //     .from(users)
  //     .where(or(eq(users.roleId, 7), eq(users.roleId, 8))); // Managed and Independent professionals

  //   const availableProfessionals = [];

  //   for (const professional of allProfessionals) {
  //     // Get professional record to check if they're non-performance related
  //     const professionalRecord = await this.getProfessional(professional.id);

  //     if (!professionalRecord) continue;

  //     // Filter for non-performance related professionals (legal, consulting, administrative services)
  //     const nonPerformanceSpecialties = [
  //       'Legal Services', 'Business Consulting', 'Marketing Consulting',
  //       'Financial Advisory', 'Contract Negotiation', 'Rights Management',
  //       'Legal Counsel', 'Business Development', 'Strategic Planning'
  //     ];

  //     const isNonPerformance = nonPerformanceSpecialties.some(specialty =>
  //       professionalRecord.specialty?.toLowerCase().includes(specialty.toLowerCase())
  //     ) || professionalRecord.specialty?.toLowerCase().includes('consulting') ||
  //       professionalRecord.specialty?.toLowerCase().includes('legal') ||
  //       professionalRecord.specialty?.toLowerCase().includes('advisory');

  //     if (!isNonPerformance) continue; // Skip performance-related professionals

  //     const conflictCheck = await this.checkLegalConflictOfInterest(professional.id);

  //     if (!conflictCheck.hasConflict) {
  //       availableProfessionals.push({
  //         ...professional,
  //         specialty: professionalRecord.specialty || 'Professional Services',
  //         hourlyRate: professionalRecord.hourlyRate || 0,
  //         isAvailable: true,
  //         conflictStatus: 'clear',
  //         serviceType: 'non_performance'
  //       });
  //     } else {
  //       // Include but mark as having conflicts (for superadmin override consideration)
  //       availableProfessionals.push({
  //         ...professional,
  //         specialty: professionalRecord.specialty || 'Professional Services',
  //         hourlyRate: professionalRecord.hourlyRate || 0,
  //         isAvailable: false,
  //         conflictStatus: 'conflict',
  //         conflictDetails: conflictCheck.conflictDetails,
  //         serviceType: 'non_performance'
  //       });
  //     }
  //   }

  //   return availableProfessionals;
  // }

  async getAvailableLawyersForWaituMusic(): Promise<any[]> {
    const professionalRoleIds = [7, 8]; // managed & independent professionals

    const allProfessionals = await db
      .select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        roleId: userRoles.roleId,
        isManaged: professionals.isManaged,
        managementTierId: professionals.managementTierId,
        hourlyRate: professionals.idealServiceRate,
        talentName: allInstruments.name,
      })
      .from(users)
      .innerJoin(userRoles, eq(users.id, userRoles.userId))
      .innerJoin(professionals, eq(users.id, professionals.userId))
      .innerJoin(
        allInstruments,
        eq(professionals.primaryTalentId, allInstruments.id)
      )
      .where(inArray(userRoles.roleId, professionalRoleIds));

    const nonPerformanceKeywords = [
      "lawyer",
      "professional",
      "music",
      "legal",
      "consulting",
      "advisory",
      "business",
      "financial",
      "marketing",
      "strategic",
      "rights",
      "contract",
    ];

    // Process all professionals concurrently
    const availableProfessionals = await Promise.all(
      allProfessionals.map(async (professional) => {
        const specialty = professional.talentName ?? "Professional Services";

        const isNonPerformance = nonPerformanceKeywords.some((keyword) =>
          specialty.toLowerCase().includes(keyword)
        );

        if (!isNonPerformance) return null; // skip performance professionals

        const conflictCheck = await this.checkLegalConflictOfInterest(
          professional.id
        );

        return {
          ...professional,
          specialty,
          isAvailable: !conflictCheck.hasConflict,
          conflictStatus: conflictCheck.hasConflict ? "conflict" : "clear",
          conflictDetails: conflictCheck.conflictDetails ?? null,
          serviceType: "non_performance",
        };
      })
    );

    return availableProfessionals.filter(Boolean); // remove nulls
  }

  // System data methods
  async getSystemSettings(): Promise<any[]> {
    try {
      // Return empty array for now since systemSettings table doesn't exist
      return [];
    } catch (error) {
      console.error("System settings error:", error);
      return [];
    }
  }

  async getActivityLogs(): Promise<any[]> {
    const results = await db.execute(sql`
      SELECT * FROM activity_logs 
      ORDER BY created_at DESC 
      LIMIT 10
    `);
    return results.rows;
  }

  // Stage Plots Implementation
  async getStagePlots(): Promise<any[]> {
    const result = await db.select().from(stagePlots);
    return result;
  }

  async getStagePlot(id: number): Promise<any> {
    const result = await db
      .select()
      .from(stagePlots)
      .where(eq(stagePlots.id, id));
    return result[0];
  }

  // 🔹 ৫️⃣ Stage Plot
  async getStagePlotByBooking(bookingId: number): Promise<any | null> {
    const [row] = await db
      .select()
      .from(stagePlots)
      .where(eq(stagePlots.bookingId, bookingId))
      .limit(1);

    return row || null;
  }

  async createStagePlot(stagePlot: any): Promise<any> {
    // Ensure clean data without timestamp fields that could cause issues
    const cleanData = {
      name: stagePlot.name,
      items: stagePlot.items,
      stageWidth: stagePlot.stageWidth,
      stageHeight: stagePlot.stageHeight,
      bookingId: stagePlot.bookingId,
      createdBy: stagePlot.createdBy,
    };

    const result = await db.insert(stagePlots).values(cleanData).returning();
    return result[0];
  }

  async updateStagePlot(id: number, updates: any): Promise<any> {
    const result = await db
      .update(stagePlots)
      .set({ ...updates, modifiedAt: new Date() })
      .where(eq(stagePlots.id, id))
      .returning();
    return result[0];
  }

  async deleteStagePlot(id: number): Promise<void> {
    await db.delete(stagePlots).where(eq(stagePlots.id, id));
  }

  // Mixer Patch Lists Implementation
  async getMixerPatchLists(): Promise<any[]> {
    const result = await db.select().from(mixerPatchLists);
    return result;
  }

  async getMixerPatchList(id: number): Promise<any> {
    const result = await db
      .select()
      .from(mixerPatchLists)
      .where(eq(mixerPatchLists.id, id));
    return result[0];
  }

  async createMixerPatchList(patchList: any): Promise<any> {
    // Ensure clean data without timestamp fields that could cause issues
    const cleanData = {
      name: patchList.name,
      rows: patchList.rows,
      bookingId: patchList.bookingId,
      createdBy: patchList.createdBy,
    };

    const result = await db
      .insert(mixerPatchLists)
      .values(cleanData)
      .returning();
    return result[0];
  }

  async updateMixerPatchList(id: number, updates: any): Promise<any> {
    const result = await db
      .update(mixerPatchLists)
      .set({ ...updates, modifiedAt: new Date() })
      .where(eq(mixerPatchLists.id, id))
      .returning();
    return result[0];
  }

  async deleteMixerPatchList(id: number): Promise<void> {
    await db.delete(mixerPatchLists).where(eq(mixerPatchLists.id, id));
  }

  // Setlist Implementation with actual storage
  private setlistStorage = new Map<number, any>();

  async getSetlist(bookingId: number): Promise<any> {
    // Check for stored setlist first
    const storedSetlist = this.setlistStorage.get(bookingId);
    if (storedSetlist) {
      return storedSetlist;
    }

    // Return null if no setlist found (don't return demo data)
    return null;
  }

  // Setlist Templates Management
  async getSetlistTemplates(): Promise<any[]> {
    const result = await db
      .select()
      .from(setlistTemplates)
      .orderBy(desc(setlistTemplates.createdAt));
    return result;
  }

  async getSetlistTemplate(id: number): Promise<any> {
    const result = await db
      .select()
      .from(setlistTemplates)
      .where(eq(setlistTemplates.id, id));
    return result[0];
  }

  async createSetlistTemplate(template: any): Promise<any> {
    // Ensure clean data without timestamp fields that could cause issues
    const cleanData = {
      name: template.name,
      description: template.description,
      songs: template.songs,
      totalDuration: template.totalDuration,
      createdBy: template.createdBy,
    };

    const result = await db
      .insert(setlistTemplates)
      .values(cleanData)
      .returning();
    return result[0];
  }

  async updateSetlistTemplate(id: number, updates: any): Promise<any> {
    const result = await db
      .update(setlistTemplates)
      .set({ ...updates, modifiedAt: new Date() })
      .where(eq(setlistTemplates.id, id))
      .returning();
    return result[0];
  }

  async deleteSetlistTemplate(id: number): Promise<void> {
    await db.delete(setlistTemplates).where(eq(setlistTemplates.id, id));
  }

  // Performance rate management methods
  async setMusicianPerformanceRate(
    bookingId: number,
    musicianId: number,
    adminId: number,
    rate: number,
    notes?: string,
    originalCurrency?: string,
    originalAmount?: number
  ): Promise<any> {
    try {
      // First check if booking musician assignment exists
      const existingAssignment = await db
        .select()
        .from(bookingMusicians)
        .where(
          and(
            eq(bookingMusicians.bookingId, bookingId),
            eq(bookingMusicians.musicianUserId, musicianId)
          )
        )
        .limit(1);

      const updateData = {
        adminSetRate: rate.toString(),
        originalCurrency: originalCurrency || "USD",
        originalAmount: originalAmount?.toString() || rate.toString(),
        rateStatus: "admin_set",
        rateSetByAdminId: adminId,
        rateNotes: notes,
        rateSetAt: new Date(),
      };

      if (existingAssignment.length === 0) {
        // Create new assignment if it doesn't exist
        await db.insert(bookingMusicians).values({
          bookingId,
          musicianUserId: musicianId,
          ...updateData,
        });
      } else {
        // Update existing assignment
        await db
          .update(bookingMusicians)
          .set(updateData)
          .where(
            and(
              eq(bookingMusicians.bookingId, bookingId),
              eq(bookingMusicians.musicianUserId, musicianId)
            )
          );
      }

      return { success: true };
    } catch (error) {
      console.error("Error setting musician performance rate:", error);
      throw error;
    }
  }

  async getBookingMusiciansWithRates(bookingId: number): Promise<any[]> {
    try {
      const musiciansWithRates = await db
        .select({
          id: users.id,
          name: users.fullName,
          email: users.email,
          instruments: musicians.instruments,
          idealRate: bookingMusicians.idealRate,
          adminSetRate: bookingMusicians.adminSetRate,
          originalCurrency: bookingMusicians.originalCurrency,
          originalAmount: bookingMusicians.originalAmount,
          confirmedFee: bookingMusicians.confirmedFee,
          rateStatus: bookingMusicians.rateStatus,
          musicianResponse: bookingMusicians.musicianResponse,
          musicianResponseMessage: bookingMusicians.musicianResponseMessage,
          rateNotes: bookingMusicians.rateNotes,
          minimumAcceptableRate: musicians.minimumAcceptableRate,
          idealPerformanceRate: musicians.idealPerformanceRate,
          assignedAt: bookingMusicians.assignedAt,
          rateSetAt: bookingMusicians.rateSetAt,
          musicianResponseAt: bookingMusicians.musicianResponseAt,
        })
        .from(bookingMusicians)
        .innerJoin(users, eq(bookingMusicians.musicianUserId, users.id))
        .leftJoin(musicians, eq(users.id, musicians.userId))
        .where(eq(bookingMusicians.bookingId, bookingId));

      return musiciansWithRates;
    } catch (error) {
      console.error("Error fetching booking musicians with rates:", error);
      return [];
    }
  }

  async respondToPerformanceRate(
    bookingId: number,
    musicianId: number,
    response: string,
    message?: string,
    counterOffer?: any
  ): Promise<any> {
    try {
      const updateData: any = {
        musicianResponse: response,
        musicianResponseMessage: message,
        musicianResponseAt: new Date(),
        rateStatus:
          response === "accepted"
            ? "accepted"
            : response === "declined"
              ? "declined"
              : response === "counter_offer"
                ? "counter_offer"
                : "pending",
      };

      // Add counter offer data if provided
      if (counterOffer && response === "counter_offer") {
        updateData.counterOfferAmount = counterOffer.amount.toString();
        updateData.counterOfferCurrency = counterOffer.currency;
        updateData.counterOfferUsdEquivalent =
          counterOffer.usdEquivalent.toString();
        updateData.counterOfferMessage = counterOffer.message;
        updateData.counterOfferAt = new Date();
      }

      const result = await db
        .update(bookingMusicians)
        .set(updateData)
        .where(
          and(
            eq(bookingMusicians.bookingId, bookingId),
            eq(bookingMusicians.musicianUserId, musicianId)
          )
        );

      return { success: true, counterOffer: counterOffer };
    } catch (error) {
      console.error("Error recording musician rate response:", error);
      throw error;
    }
  }

  async getMusicianBookingRates(musicianId: number): Promise<any[]> {
    try {
      const bookingRates = await db
        .select({
          id: bookings.id,
          artistName: artists.stageName,
          eventDate: bookings.eventDate,
          eventLocation: bookings.eventLocation,
          status: bookings.status,
          // Rate information
          adminSetRate: bookingMusicians.adminSetRate,
          originalCurrency: bookingMusicians.originalCurrency,
          originalAmount: bookingMusicians.originalAmount,
          rateStatus: bookingMusicians.rateStatus,
          musicianResponse: bookingMusicians.musicianResponse,
          musicianResponseMessage: bookingMusicians.musicianResponseMessage,
          rateNotes: bookingMusicians.rateNotes,
          rateSetAt: bookingMusicians.rateSetAt,
          musicianResponseAt: bookingMusicians.musicianResponseAt,
          // Counter offer fields
          counterOfferAmount: bookingMusicians.counterOfferAmount,
          counterOfferCurrency: bookingMusicians.counterOfferCurrency,
          counterOfferUsdEquivalent: bookingMusicians.counterOfferUsdEquivalent,
          counterOfferMessage: bookingMusicians.counterOfferMessage,
          counterOfferAt: bookingMusicians.counterOfferAt,
          // Admin response to counter offer
          adminCounterResponse: bookingMusicians.adminCounterResponse,
          adminCounterResponseMessage:
            bookingMusicians.adminCounterResponseMessage,
          adminCounterResponseAt: bookingMusicians.adminCounterResponseAt,
        })
        .from(bookingMusicians)
        .innerJoin(bookings, eq(bookingMusicians.bookingId, bookings.id))
        .innerJoin(artists, eq(bookings.artistUserId, artists.userId))
        .where(eq(bookingMusicians.musicianUserId, musicianId))
        .orderBy(bookings.eventDate);

      return bookingRates.map((rate) => ({
        id: rate.id,
        artistName: rate.artistName,
        eventDate: rate.eventDate,
        eventLocation: rate.eventLocation,
        status: rate.status,
        rateInfo: rate.adminSetRate
          ? {
            adminSetRate: parseFloat(rate.adminSetRate),
            originalCurrency: rate.originalCurrency,
            originalAmount: rate.originalAmount
              ? parseFloat(rate.originalAmount)
              : parseFloat(rate.adminSetRate),
            rateStatus: rate.rateStatus,
            musicianResponse: rate.musicianResponse,
            musicianResponseMessage: rate.musicianResponseMessage,
            rateNotes: rate.rateNotes,
            rateSetAt: rate.rateSetAt,
            musicianResponseAt: rate.musicianResponseAt,
            // Counter offer data
            counterOfferAmount: rate.counterOfferAmount
              ? parseFloat(rate.counterOfferAmount)
              : undefined,
            counterOfferCurrency: rate.counterOfferCurrency,
            counterOfferUsdEquivalent: rate.counterOfferUsdEquivalent
              ? parseFloat(rate.counterOfferUsdEquivalent)
              : undefined,
            counterOfferMessage: rate.counterOfferMessage,
            counterOfferAt: rate.counterOfferAt,
            // Admin counter response
            adminCounterResponse: rate.adminCounterResponse,
            adminCounterResponseMessage: rate.adminCounterResponseMessage,
            adminCounterResponseAt: rate.adminCounterResponseAt,
          }
          : null,
      }));
    } catch (error) {
      console.error("Error fetching musician booking rates:", error);
      return [];
    }
  }

  // Setlist management - use in-memory storage for now
  async getBookingSetlist(bookingId: number): Promise<any> {
    // Use the existing in-memory setlist storage
    return this.setlistStorage.get(bookingId) || null;
  }

  async createBookingSetlist(data: any): Promise<any> {
    // Use the existing in-memory storage
    return this.saveSetlist({
      bookingId: data.bookingId,
      name: data.name || "Performance Setlist",
      description: data.description || "",
      songs: data.songs || [],
      createdBy: data.createdBy,
    });
  }

  async updateBookingSetlist(bookingId: number, data: any): Promise<any> {
    // Update using the existing in-memory storage
    return this.saveSetlist({
      bookingId,
      name: data.name || "Performance Setlist",
      description: data.description || "",
      songs: data.songs || [],
    });
  }

  async saveBookingSetlist(
    bookingId: number,
    setlist: any[],
    userId: number
  ): Promise<any[]> {
    // Save setlist using existing in-memory storage and return it
    const savedSetlist = await this.saveSetlist({
      bookingId,
      name: "Performance Setlist",
      description: "Booking setlist",
      songs: setlist,
    });
    return savedSetlist.songs || setlist;
  }

  async getSongChordProgressions(setlistSongId: number): Promise<any[]> {
    // Return empty array since songChordProgressions table doesn't exist
    return [];
  }

  async createChordProgression(data: any): Promise<any> {
    // Return mock progression since songChordProgressions table doesn't exist
    return {
      id: Math.floor(Math.random() * 1000),
      setlistSongId: data.setlistSongId,
      instrument: data.instrument,
      chordData: data.chordData,
      difficulty: data.difficulty,
      capoPosition: data.capoPosition,
      tuning: data.tuning,
      generatedFrom: data.generatedFrom,
      createdAt: new Date(),
    };
  }

  // ==================== FINANCIAL AUTOMATION METHODS ====================

  // Invoice Management
  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    const [newInvoice] = await db.insert(invoices).values(invoice).returning();
    return newInvoice;
  }

  async getInvoice(id: number): Promise<Invoice | undefined> {
    const result = await db.select().from(invoices).where(eq(invoices.id, id));
    return result[0];
  }

  async getInvoicesByBooking(bookingId: number): Promise<Invoice[]> {
    return await db
      .select()
      .from(invoices)
      .where(eq(invoices.bookingId, bookingId));
  }

  async updateInvoiceStatus(
    id: number,
    status: string
  ): Promise<Invoice | undefined> {
    const [updatedInvoice] = await db
      .update(invoices)
      .set({ status })
      .where(eq(invoices.id, id))
      .returning();
    return updatedInvoice;
  }

  async generateInvoiceNumber(): Promise<string> {
    const count = await db
      .select({ count: invoices.id })
      .from(invoices)
      .then((result) => result.length);

    const year = new Date().getFullYear();
    const paddedCount = String(count + 1).padStart(6, "0");
    return `INV-${year}-${paddedCount}`;
  }

  async getAllInvoices(): Promise<Invoice[]> {
    return await db.select().from(invoices).orderBy(desc(invoices.createdAt));
  }

  async getInvoiceById(id: number): Promise<Invoice | undefined> {
    const result = await db.select().from(invoices).where(eq(invoices.id, id));
    return result[0];
  }

  // Payout Request Management
  async createPayoutRequest(
    payoutRequest: InsertPayoutRequest
  ): Promise<PayoutRequest> {
    const [newPayoutRequest] = await db
      .insert(payoutRequests)
      .values(payoutRequest)
      .returning();
    return newPayoutRequest;
  }

  async getPayoutRequest(id: number): Promise<PayoutRequest | undefined> {
    const result = await db
      .select()
      .from(payoutRequests)
      .where(eq(payoutRequests.id, id));
    return result[0];
  }

  async getPayoutRequestsByBooking(
    bookingId: number
  ): Promise<PayoutRequest[]> {
    return await db
      .select()
      .from(payoutRequests)
      .where(eq(payoutRequests.bookingId, bookingId));
  }

  async getPayoutRequestsByPerformer(
    performerUserId: number
  ): Promise<PayoutRequest[]> {
    return await db
      .select()
      .from(payoutRequests)
      .where(eq(payoutRequests.performerUserId, performerUserId));
  }

  async updatePayoutRequestStatus(
    id: number,
    status: string
  ): Promise<PayoutRequest | undefined> {
    const [updatedPayoutRequest] = await db
      .update(payoutRequests)
      .set({ status })
      .where(eq(payoutRequests.id, id))
      .returning();
    return updatedPayoutRequest;
  }

  async generatePayoutRequestNumber(): Promise<string> {
    const count = await db
      .select({ count: payoutRequests.id })
      .from(payoutRequests)
      .then((result) => result.length);

    const year = new Date().getFullYear();
    const paddedCount = String(count + 1).padStart(6, "0");
    return `PAYOUT-${year}-${paddedCount}`;
  }

  async getAllPayoutRequests(): Promise<PayoutRequest[]> {
    return await db
      .select()
      .from(payoutRequests)
      .orderBy(desc(payoutRequests.createdAt));
  }

  // Document Linkage System
  async createDocumentLinkage(
    linkage: InsertDocumentLinkage
  ): Promise<DocumentLinkage> {
    const [newLinkage] = await db
      .insert(documentLinkages)
      .values(linkage)
      .returning();
    return newLinkage;
  }

  async getDocumentLinkages(
    sourceType: string,
    sourceId: number
  ): Promise<DocumentLinkage[]> {
    return await db
      .select()
      .from(documentLinkages)
      .where(
        and(
          eq(documentLinkages.sourceDocumentType, sourceType),
          eq(documentLinkages.sourceDocumentId, sourceId)
        )
      );
  }

  async getLinkedDocuments(
    documentType: string,
    documentId: number
  ): Promise<DocumentLinkage[]> {
    return await db
      .select()
      .from(documentLinkages)
      .where(
        and(
          eq(documentLinkages.linkedDocumentType, documentType),
          eq(documentLinkages.linkedDocumentId, documentId)
        )
      );
  }

  // Payment Transaction Tracking
  async createPaymentTransaction(
    transaction: InsertPaymentTransaction
  ): Promise<PaymentTransaction> {
    const [newTransaction] = await db
      .insert(paymentTransactions)
      .values(transaction)
      .returning();
    return newTransaction;
  }

  async getPaymentTransaction(
    id: number
  ): Promise<PaymentTransaction | undefined> {
    const result = await db
      .select()
      .from(paymentTransactions)
      .where(eq(paymentTransactions.id, id));
    return result[0];
  }

  async getPaymentTransactionsByBooking(
    bookingId: number
  ): Promise<PaymentTransaction[]> {
    return await db
      .select()
      .from(paymentTransactions)
      .where(eq(paymentTransactions.bookingId, bookingId));
  }

  async getPaymentTransactionsByInvoice(
    invoiceId: number
  ): Promise<PaymentTransaction[]> {
    return await db
      .select()
      .from(paymentTransactions)
      .where(eq(paymentTransactions.invoiceId, invoiceId));
  }

  async updatePaymentTransactionStatus(
    id: number,
    status: string
  ): Promise<PaymentTransaction | undefined> {
    const [updatedTransaction] = await db
      .update(paymentTransactions)
      .set({ status })
      .where(eq(paymentTransactions.id, id))
      .returning();
    return updatedTransaction;
  }

  // Financial Audit Trail
  async createFinancialAuditLog(
    auditLog: InsertFinancialAuditLog
  ): Promise<FinancialAuditLog> {
    const [newAuditLog] = await db
      .insert(financialAuditLog)
      .values(auditLog)
      .returning();
    return newAuditLog;
  }

  async getFinancialAuditLogs(
    entityType: string,
    entityId: number
  ): Promise<FinancialAuditLog[]> {
    return await db
      .select()
      .from(financialAuditLog)
      .where(
        and(
          eq(financialAuditLog.entityType, entityType),
          eq(financialAuditLog.entityId, entityId)
        )
      )
      .orderBy(desc(financialAuditLog.createdAt));
  }

  // Enhanced Payments & Receipts
  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [newPayment] = await db.insert(payments).values(payment).returning();
    return newPayment;
  }

  async getPayment(id: number): Promise<Payment | undefined> {
    const result = await db.select().from(payments).where(eq(payments.id, id));
    return result[0];
  }

  async getPaymentsByBooking(bookingId: number): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .where(eq(payments.bookingId, bookingId));
  }

  async updatePaymentStatus(
    id: number,
    status: string
  ): Promise<Payment | undefined> {
    const [updatedPayment] = await db
      .update(payments)
      .set({ status })
      .where(eq(payments.id, id))
      .returning();
    return updatedPayment;
  }

  async createReceipt(receipt: InsertReceipt): Promise<Receipt> {
    const [newReceipt] = await db.insert(receipts).values(receipt).returning();
    return newReceipt;
  }

  async getReceipt(id: number): Promise<Receipt | undefined> {
    const result = await db.select().from(receipts).where(eq(receipts.id, id));
    return result[0];
  }

  async getReceiptsByBooking(bookingId: number): Promise<Receipt[]> {
    return await db
      .select()
      .from(receipts)
      .where(eq(receipts.bookingId, bookingId));
  }

  async generateReceiptNumber(): Promise<string> {
    const count = await db
      .select({ count: receipts.id })
      .from(receipts)
      .then((result) => result.length);

    const year = new Date().getFullYear();
    const paddedCount = String(count + 1).padStart(6, "0");
    return `REC-${year}-${paddedCount}`;
  }

  // AI-Powered Social Media Campaign Management
  async createSocialMediaCampaign(
    campaign: InsertSocialMediaCampaign
  ): Promise<SocialMediaCampaign> {
    const [newCampaign] = await db
      .insert(socialMediaCampaigns)
      .values(campaign)
      .returning();
    return newCampaign;
  }

  async getSocialMediaCampaign(
    id: number
  ): Promise<SocialMediaCampaign | undefined> {
    const result = await db
      .select()
      .from(socialMediaCampaigns)
      .where(eq(socialMediaCampaigns.id, id));
    return result[0];
  }

  async getSocialMediaCampaignsByUser(
    userId: number
  ): Promise<SocialMediaCampaign[]> {
    return await db
      .select()
      .from(socialMediaCampaigns)
      .where(eq(socialMediaCampaigns.userId, userId));
  }

  async getAllSocialMediaCampaigns(): Promise<SocialMediaCampaign[]> {
    return await db.select().from(socialMediaCampaigns);
  }

  async updateSocialMediaCampaign(
    id: number,
    updates: Partial<SocialMediaCampaign>
  ): Promise<SocialMediaCampaign | undefined> {
    const [updatedCampaign] = await db
      .update(socialMediaCampaigns)
      .set(updates)
      .where(eq(socialMediaCampaigns.id, id))
      .returning();
    return updatedCampaign;
  }

  async deleteSocialMediaCampaign(id: number): Promise<void> {
    await db
      .delete(socialMediaCampaigns)
      .where(eq(socialMediaCampaigns.id, id));
  }

  // Competitive Intelligence System
  async createCompetitiveIntelligence(
    intelligence: InsertCompetitiveIntelligence
  ): Promise<CompetitiveIntelligence> {
    const [newIntelligence] = await db
      .insert(competitiveIntelligence)
      .values(intelligence)
      .returning();
    return newIntelligence;
  }

  async getCompetitiveIntelligence(
    id: number
  ): Promise<CompetitiveIntelligence | undefined> {
    const result = await db
      .select()
      .from(competitiveIntelligence)
      .where(eq(competitiveIntelligence.id, id));
    return result[0];
  }

  async getCompetitiveIntelligenceByArtist(
    artistId: number
  ): Promise<CompetitiveIntelligence[]> {
    return await db
      .select()
      .from(competitiveIntelligence)
      .where(eq(competitiveIntelligence.artistId, artistId));
  }

  async getCompetitiveIntelligenceByRegion(
    region: string
  ): Promise<CompetitiveIntelligence[]> {
    return await db
      .select()
      .from(competitiveIntelligence)
      .where(eq(competitiveIntelligence.region, region));
  }

  async updateCompetitiveIntelligence(
    id: number,
    updates: Partial<CompetitiveIntelligence>
  ): Promise<CompetitiveIntelligence | undefined> {
    const [updatedIntelligence] = await db
      .update(competitiveIntelligence)
      .set(updates)
      .where(eq(competitiveIntelligence.id, id))
      .returning();
    return updatedIntelligence;
  }

  async deleteCompetitiveIntelligence(id: number): Promise<void> {
    await db
      .delete(competitiveIntelligence)
      .where(eq(competitiveIntelligence.id, id));
  }

  // Website Integration (All-Links Solution)
  async createWebsiteIntegration(
    integration: InsertWebsiteIntegration
  ): Promise<WebsiteIntegration> {
    const [newIntegration] = await db
      .insert(websiteIntegrations)
      .values(integration)
      .returning();
    return newIntegration;
  }

  async getWebsiteIntegration(
    id: number
  ): Promise<WebsiteIntegration | undefined> {
    const result = await db
      .select()
      .from(websiteIntegrations)
      .where(eq(websiteIntegrations.id, id));
    return result[0];
  }

  async getWebsiteIntegrationBySlug(
    slug: string
  ): Promise<WebsiteIntegration | undefined> {
    const result = await db
      .select()
      .from(websiteIntegrations)
      .where(eq(websiteIntegrations.slug, slug));
    return result[0];
  }

  async getWebsiteIntegrationsByUser(
    userId: number
  ): Promise<WebsiteIntegration[]> {
    return await db
      .select()
      .from(websiteIntegrations)
      .where(eq(websiteIntegrations.userId, userId));
  }

  async getAllWebsiteIntegrations(): Promise<WebsiteIntegration[]> {
    return await db.select().from(websiteIntegrations);
  }

  async updateWebsiteIntegration(
    id: number,
    updates: Partial<WebsiteIntegration>
  ): Promise<WebsiteIntegration | undefined> {
    const [updatedIntegration] = await db
      .update(websiteIntegrations)
      .set(updates)
      .where(eq(websiteIntegrations.id, id))
      .returning();
    return updatedIntegration;
  }

  async deleteWebsiteIntegration(id: number): Promise<void> {
    await db.delete(websiteIntegrations).where(eq(websiteIntegrations.id, id));
  }

  async incrementWebsiteViews(id: number): Promise<void> {
    await db
      .update(websiteIntegrations)
      .set({
        viewCount: sql`${websiteIntegrations.viewCount} + 1`,
        lastViewed: new Date(),
      })
      .where(eq(websiteIntegrations.id, id));
  }

  async incrementWebsiteClicks(id: number): Promise<void> {
    await db
      .update(websiteIntegrations)
      .set({ clickCount: sql`${websiteIntegrations.clickCount} + 1` })
      .where(eq(websiteIntegrations.id, id));
  }

  // Embeddable Widgets System
  async createEmbeddableWidget(
    widget: InsertEmbeddableWidget
  ): Promise<EmbeddableWidget> {
    const [newWidget] = await db
      .insert(embeddableWidgets)
      .values(widget)
      .returning();
    return newWidget;
  }

  async getEmbeddableWidget(id: number): Promise<EmbeddableWidget | undefined> {
    const result = await db
      .select()
      .from(embeddableWidgets)
      .where(eq(embeddableWidgets.id, id));
    return result[0];
  }

  async getEmbeddableWidgetsByUser(
    userId: number
  ): Promise<EmbeddableWidget[]> {
    return await db
      .select()
      .from(embeddableWidgets)
      .where(eq(embeddableWidgets.userId, userId));
  }

  async getAllEmbeddableWidgets(): Promise<EmbeddableWidget[]> {
    return await db.select().from(embeddableWidgets);
  }

  async updateEmbeddableWidget(
    id: number,
    updates: Partial<EmbeddableWidget>
  ): Promise<EmbeddableWidget | undefined> {
    const [updatedWidget] = await db
      .update(embeddableWidgets)
      .set(updates)
      .where(eq(embeddableWidgets.id, id))
      .returning();
    return updatedWidget;
  }

  async deleteEmbeddableWidget(id: number): Promise<void> {
    await db.delete(embeddableWidgets).where(eq(embeddableWidgets.id, id));
  }

  async updateWidgetUsageStats(id: number, stats: any): Promise<void> {
    await db
      .update(embeddableWidgets)
      .set({ usageStats: stats })
      .where(eq(embeddableWidgets.id, id));
  }

  // Career Forecasting System
  async createCareerForecasting(
    forecasting: InsertCareerForecasting
  ): Promise<CareerForecasting> {
    const [newForecasting] = await db
      .insert(careerForecasting)
      .values(forecasting)
      .returning();
    return newForecasting;
  }

  async getCareerForecasting(
    id: number
  ): Promise<CareerForecasting | undefined> {
    const result = await db
      .select()
      .from(careerForecasting)
      .where(eq(careerForecasting.id, id));
    return result[0];
  }

  async getCareerForecastingByUser(
    userId: number
  ): Promise<CareerForecasting[]> {
    return await db
      .select()
      .from(careerForecasting)
      .where(eq(careerForecasting.userId, userId));
  }

  async getCareerForecastingByPeriod(
    period: string
  ): Promise<CareerForecasting[]> {
    return await db
      .select()
      .from(careerForecasting)
      .where(eq(careerForecasting.forecastPeriod, period));
  }

  async updateCareerForecasting(
    id: number,
    updates: Partial<CareerForecasting>
  ): Promise<CareerForecasting | undefined> {
    const [updatedForecasting] = await db
      .update(careerForecasting)
      .set(updates)
      .where(eq(careerForecasting.id, id))
      .returning();
    return updatedForecasting;
  }

  async deleteCareerForecasting(id: number): Promise<void> {
    await db.delete(careerForecasting).where(eq(careerForecasting.id, id));
  }

  // User Favorites Methods
  async addUserFavorite(
    userId: number,
    favoriteUserId: number,
    favoriteType: string = "artist"
  ) {
    try {
      const result = await db
        .insert(userFavorites)
        .values({
          userId,
          favoriteUserId,
          favoriteType,
        })
        .returning();
      return result[0];
    } catch (error: any) {
      if (error.code === "23505") {
        // Unique constraint violation
        throw new Error("Artist is already in favorites");
      }
      throw error;
    }
  }

  async removeUserFavorite(userId: number, favoriteUserId: number) {
    const result = await db
      .delete(userFavorites)
      .where(
        and(
          eq(userFavorites.userId, userId),
          eq(userFavorites.favoriteUserId, favoriteUserId)
        )
      )
      .returning();
    return result[0];
  }

  async getUserFavorites(userId: number) {
    const result = await db
      .select({
        id: userFavorites.id,
        favoriteUserId: userFavorites.favoriteUserId,
        favoriteType: userFavorites.favoriteType,
        createdAt: userFavorites.createdAt,
        favoriteUser: {
          id: users.id,
          fullName: users.fullName,
          email: users.email,
          roleId: users.roleId,
        },
        artist: {
          stageName: artists.stageName,
          primaryGenre: artists.primaryGenre,
          basePrice: artists.basePrice,
        },
      })
      .from(userFavorites)
      .leftJoin(users, eq(userFavorites.favoriteUserId, users.id))
      .leftJoin(artists, eq(userFavorites.favoriteUserId, artists.userId))
      .where(eq(userFavorites.userId, userId))
      .orderBy(desc(userFavorites.createdAt));

    return result;
  }

  async checkIfUserFavorite(userId: number, favoriteUserId: number) {
    const result = await db
      .select()
      .from(userFavorites)
      .where(
        and(
          eq(userFavorites.userId, userId),
          eq(userFavorites.favoriteUserId, favoriteUserId)
        )
      )
      .limit(1);

    return result.length > 0;
  }

  // OppHub - Opportunity Hub Implementation
  async getOpportunityCategories(): Promise<OpportunityCategory[]> {
    const result = await db
      .select()
      .from(opportunityCategories)
      .where(eq(opportunityCategories.isActive, true))
      .orderBy(opportunityCategories.name);
    return result;
  }

  async createOpportunityCategory(
    category: InsertOpportunityCategory
  ): Promise<OpportunityCategory> {
    const result = await db
      .insert(opportunityCategories)
      .values(category)
      .returning();
    return result[0];
  }

  async updateOpportunityCategory(
    id: number,
    updates: Partial<InsertOpportunityCategory>
  ): Promise<OpportunityCategory | null> {
    const result = await db
      .update(opportunityCategories)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(opportunityCategories.id, id))
      .returning();
    return result[0] || null;
  }

  async getOpportunities(filters?: {
    status?: string;
    isDemo?: boolean;
    categoryId?: number;
    isVerified?: boolean;
  }): Promise<any[]> {
    try {
      console.log("getOpportunities called with filters:", filters);

      // Use Drizzle ORM select method like other working methods in this file
      let query = db.select().from(opportunities);

      const conditions = [];

      if (filters?.status) {
        conditions.push(eq(opportunities.status, filters.status));
      }

      if (filters?.isDemo !== undefined) {
        conditions.push(eq(opportunities.isDemo, filters.isDemo));
      }

      if (filters?.categoryId) {
        conditions.push(eq(opportunities.categoryId, filters.categoryId));
      }

      if (filters?.isVerified !== undefined) {
        conditions.push(eq(opportunities.isVerified, filters.isVerified));
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      const result = await query
        .orderBy(desc(opportunities.createdAt))
        .limit(100);

      console.log("Drizzle query result count:", result.length);
      console.log(
        "First result sample:",
        result[0] ? JSON.stringify(result[0], null, 2) : "No results"
      );

      return result;
    } catch (error) {
      console.error("Error fetching opportunities:", error);
      return [];
    }
  }

  async createOpportunity(opportunity: any): Promise<any> {
    try {
      // Use raw SQL to insert with the simplified schema
      const result = await db.execute(sql`
        INSERT INTO opportunities (
          title, description, source, url, deadline, amount, requirements,
          organizer_name, contact_email, contact_phone, application_process,
          credibility_score, tags, category_id, location, compensation_type,
          verification_status, discovery_method, relevance_score
        ) VALUES (
          ${opportunity.title},
          ${opportunity.description},
          ${opportunity.source},
          ${opportunity.url},
          ${opportunity.deadline},
          ${opportunity.amount},
          ${opportunity.requirements},
          ${opportunity.organizerName || opportunity.source},
          ${opportunity.contactEmail ||
        "contact@" +
        (opportunity.source || "unknown")
          .toLowerCase()
          .replace(/\s+/g, "") +
        ".com"
        },
          ${opportunity.contactPhone || "Contact organizer"},
          ${opportunity.applicationProcess ||
        "Visit source website for application details"
        },
          ${opportunity.credibilityScore || 75},
          ${opportunity.tags || "managed_talent,verified"},
          ${opportunity.categoryId || 1},
          ${opportunity.location || "Various locations"},
          ${opportunity.compensationType || "exposure"},
          ${opportunity.verificationStatus || "pending"},
          ${opportunity.discoveryMethod || "ai_forum_scan"},
          ${opportunity.relevanceScore || 0.75}
        ) RETURNING *
      `);
      return result.rows[0];
    } catch (error) {
      console.error("Error creating opportunity:", error);
      throw error;
    }
  }

  async getOpportunityById(id: number): Promise<Opportunity | null> {
    const result = await db
      .select()
      .from(opportunities)
      .where(eq(opportunities.id, id))
      .limit(1);
    return result[0] || null;
  }

  async updateOpportunity(
    id: number,
    updates: Partial<InsertOpportunity>
  ): Promise<Opportunity | null> {
    const result = await db
      .update(opportunities)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(opportunities.id, id))
      .returning();
    return result[0] || null;
  }

  async deleteOpportunity(id: number): Promise<boolean> {
    const result = await db
      .delete(opportunities)
      .where(eq(opportunities.id, id))
      .returning();
    return result.length > 0;
  }

  // AI Application Intelligence Methods for Managed Artists (Priority: Lí-Lí Octave, JCro, Janet Azzouz, Princess Trinidad)
  async createApplicationGuidance(guidanceData: any) {
    try {
      const result = await db
        .insert(oppHubApplicationGuidance)
        .values(guidanceData)
        .returning();
      return result[0];
    } catch (error) {
      console.error("Error creating application guidance:", error);
      throw error;
    }
  }

  async getApplicationGuidanceForUser(userId: number, opportunityId?: number) {
    try {
      let query = db
        .select({
          id: oppHubApplicationGuidance.id,
          opportunityId: oppHubApplicationGuidance.opportunityId,
          generatedStrategy: oppHubApplicationGuidance.generatedStrategy,
          matchReasons: oppHubApplicationGuidance.matchReasons,
          recommendedApproach: oppHubApplicationGuidance.recommendedApproach,
          suggestedPortfolio: oppHubApplicationGuidance.suggestedPortfolio,
          keyTalkingPoints: oppHubApplicationGuidance.keyTalkingPoints,
          confidenceScore: oppHubApplicationGuidance.confidenceScore,
          priorityLevel: oppHubApplicationGuidance.priorityLevel,
          applicationStatus: oppHubApplicationGuidance.applicationStatus,
          generatedAt: oppHubApplicationGuidance.generatedAt,
          // Opportunity details
          opportunityTitle: opportunities.title,
          opportunityOrganizer: opportunities.organizer,
          opportunityDeadline: opportunities.applicationDeadline,
          opportunityLocation: opportunities.location,
        })
        .from(oppHubApplicationGuidance)
        .leftJoin(
          opportunities,
          eq(oppHubApplicationGuidance.opportunityId, opportunities.id)
        )
        .where(eq(oppHubApplicationGuidance.targetUserId, userId))
        .orderBy(
          desc(oppHubApplicationGuidance.priorityLevel),
          desc(oppHubApplicationGuidance.confidenceScore)
        );

      if (opportunityId) {
        query = query.where(
          eq(oppHubApplicationGuidance.opportunityId, opportunityId)
        );
      }

      return await query.execute();
    } catch (error) {
      console.error("Error getting application guidance:", error);
      return [];
    }
  }

  async createSuccessStory(storyData: any) {
    try {
      const result = await db
        .insert(oppHubSuccessStories)
        .values(storyData)
        .returning();
      return result[0];
    } catch (error) {
      console.error("Error creating success story:", error);
      throw error;
    }
  }

  async getSuccessStoriesByType(opportunityType: string, genre?: string) {
    try {
      let query = db
        .select()
        .from(oppHubSuccessStories)
        .where(eq(oppHubSuccessStories.opportunityType, opportunityType));

      if (genre) {
        query = query.where(
          sql`${oppHubSuccessStories.artistGenre} ILIKE ${`%${genre}%`}`
        );
      }

      return await query
        .orderBy(desc(oppHubSuccessStories.createdAt))
        .limit(5)
        .execute();
    } catch (error) {
      console.error("Error getting success stories:", error);
      return [];
    }
  }

  async createDeadlineTracking(trackingData: any) {
    try {
      const result = await db
        .insert(oppHubDeadlineTracking)
        .values(trackingData)
        .returning();
      return result[0];
    } catch (error) {
      console.error("Error creating deadline tracking:", error);
      throw error;
    }
  }

  async getDeadlineTrackingForUser(userId: number) {
    try {
      return await db
        .select({
          id: oppHubDeadlineTracking.id,
          opportunityId: oppHubDeadlineTracking.opportunityId,
          deadlineType: oppHubDeadlineTracking.deadlineType,
          deadlineDate: oppHubDeadlineTracking.deadlineDate,
          applicationProgress: oppHubDeadlineTracking.applicationProgress,
          // Opportunity details
          opportunityTitle: opportunities.title,
          opportunityOrganizer: opportunities.organizer,
        })
        .from(oppHubDeadlineTracking)
        .leftJoin(
          opportunities,
          eq(oppHubDeadlineTracking.opportunityId, opportunities.id)
        )
        .where(
          and(
            eq(oppHubDeadlineTracking.userId, userId),
            eq(oppHubDeadlineTracking.isActive, true)
          )
        )
        .orderBy(asc(oppHubDeadlineTracking.deadlineDate))
        .execute();
    } catch (error) {
      console.error("Error getting deadline tracking:", error);
      return [];
    }
  }

  async createApplicationAnalytics(analyticsData: any) {
    try {
      const result = await db
        .insert(oppHubApplicationAnalytics)
        .values(analyticsData)
        .returning();
      return result[0];
    } catch (error) {
      console.error("Error creating application analytics:", error);
      throw error;
    }
  }

  async getApplicationAnalyticsForUser(userId: number) {
    try {
      return await db
        .select()
        .from(oppHubApplicationAnalytics)
        .where(eq(oppHubApplicationAnalytics.userId, userId))
        .orderBy(desc(oppHubApplicationAnalytics.createdAt))
        .execute();
    } catch (error) {
      console.error("Error getting application analytics:", error);
      return [];
    }
  }

  // Get AI guidance for all managed artists with priority ranking
  async getAllManagedArtistGuidance(limit: number = 50) {
    try {
      return await db
        .select({
          id: oppHubApplicationGuidance.id,
          targetUserId: oppHubApplicationGuidance.targetUserId,
          opportunityId: oppHubApplicationGuidance.opportunityId,
          confidenceScore: oppHubApplicationGuidance.confidenceScore,
          priorityLevel: oppHubApplicationGuidance.priorityLevel,
          applicationStatus: oppHubApplicationGuidance.applicationStatus,
          generatedAt: oppHubApplicationGuidance.generatedAt,
          // User details
          userEmail: users.email,
          userFullName: users.fullName,
          // Artist details
          stageNames: artists.stageNames,
          // Opportunity details
          opportunityTitle: opportunities.title,
          opportunityOrganizer: opportunities.organizer,
          opportunityDeadline: opportunities.applicationDeadline,
        })
        .from(oppHubApplicationGuidance)
        .leftJoin(users, eq(oppHubApplicationGuidance.targetUserId, users.id))
        .leftJoin(
          artists,
          eq(oppHubApplicationGuidance.targetUserId, artists.userId)
        )
        .leftJoin(
          opportunities,
          eq(oppHubApplicationGuidance.opportunityId, opportunities.id)
        )
        .where(gte(oppHubApplicationGuidance.priorityLevel, 3)) // Only managed artists (priority 3+)
        .orderBy(
          desc(oppHubApplicationGuidance.priorityLevel),
          desc(oppHubApplicationGuidance.confidenceScore),
          desc(oppHubApplicationGuidance.generatedAt)
        )
        .limit(limit)
        .execute();
    } catch (error) {
      console.error("Error getting all managed artist guidance:", error);
      return [];
    }
  }

  async incrementOpportunityViews(id: number): Promise<void> {
    try {
      await db
        .update(opportunities)
        .set({ updatedAt: new Date() })
        .where(eq(opportunities.id, id))
        .execute();
    } catch (error) {
      console.error("Error incrementing opportunity views:", error);
    }
  }

  async getOpportunityApplications(filters?: {
    opportunityId?: number;
    applicantUserId?: number;
    isDemo?: boolean;
  }): Promise<OpportunityApplication[]> {
    try {
      let conditions: any[] = [];

      if (filters?.opportunityId) {
        conditions.push(
          eq(opportunityApplications.opportunityId, filters.opportunityId)
        );
      }
      if (filters?.applicantUserId) {
        conditions.push(
          eq(opportunityApplications.applicantUserId, filters.applicantUserId)
        );
      }
      if (filters?.isDemo !== undefined) {
        conditions.push(eq(opportunityApplications.isDemo, filters.isDemo));
      }

      let query = db.select().from(opportunityApplications);

      if (conditions.length > 0) {
        query = query.where(
          conditions.length === 1 ? conditions[0] : and(...conditions)
        );
      }

      const result = await query.orderBy(
        desc(opportunityApplications.appliedAt)
      );
      return result;
    } catch (error) {
      console.error("Error getting opportunity applications:", error);
      return [];
    }
  }

  async createOpportunityApplication(
    application: InsertOpportunityApplication
  ): Promise<OpportunityApplication> {
    const result = await db
      .insert(opportunityApplications)
      .values(application)
      .returning();

    // Increment application count for the opportunity
    await db
      .update(opportunities)
      .set({ applicationCount: sql`${opportunities.applicationCount} + 1` })
      .where(eq(opportunities.id, application.opportunityId!));

    return result[0];
  }

  async getOpportunityApplicationById(
    id: number
  ): Promise<OpportunityApplication | null> {
    const result = await db
      .select()
      .from(opportunityApplications)
      .where(eq(opportunityApplications.id, id))
      .limit(1);
    return result[0] || null;
  }

  async updateOpportunityApplicationStatus(
    id: number,
    status: string,
    reviewNotes?: string,
    reviewedBy?: number
  ): Promise<OpportunityApplication | null> {
    const updateData: any = {
      status,
      reviewedAt: new Date(),
      updatedAt: new Date(),
    };

    if (reviewNotes) updateData.reviewNotes = reviewNotes;
    if (reviewedBy) updateData.reviewedBy = reviewedBy;

    const result = await db
      .update(opportunityApplications)
      .set(updateData)
      .where(eq(opportunityApplications.id, id))
      .returning();
    return result[0] || null;
  }

  async getOppHubSubscriptions(filters?: {
    userId?: number;
    status?: string;
  }): Promise<OppHubSubscription[]> {
    let query = db.select().from(oppHubSubscriptions);

    if (filters?.userId) {
      query = query.where(eq(oppHubSubscriptions.userId, filters.userId));
    }
    if (filters?.status) {
      query = query.where(eq(oppHubSubscriptions.status, filters.status));
    }

    const result = await query.orderBy(desc(oppHubSubscriptions.startDate));
    return result;
  }

  async createOppHubSubscription(
    subscription: InsertOppHubSubscription
  ): Promise<OppHubSubscription> {
    const result = await db
      .insert(oppHubSubscriptions)
      .values(subscription)
      .returning();
    return result[0];
  }

  async getOppHubSubscriptionByUserId(
    userId: number
  ): Promise<OppHubSubscription | null> {
    const result = await db
      .select()
      .from(oppHubSubscriptions)
      .where(
        and(
          eq(oppHubSubscriptions.userId, userId),
          eq(oppHubSubscriptions.status, "active")
        )
      )
      .limit(1);
    return result[0] || null;
  }

  async updateOppHubSubscription(
    id: number,
    updates: Partial<InsertOppHubSubscription>
  ): Promise<OppHubSubscription | null> {
    const result = await db
      .update(oppHubSubscriptions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(oppHubSubscriptions.id, id))
      .returning();
    return result[0] || null;
  }

  async incrementApplicationsUsed(userId: number): Promise<void> {
    await db
      .update(oppHubSubscriptions)
      .set({
        applicationsUsed: sql`${oppHubSubscriptions.applicationsUsed} + 1`,
      })
      .where(
        and(
          eq(oppHubSubscriptions.userId, userId),
          eq(oppHubSubscriptions.status, "active")
        )
      );
  }

  async getMarketIntelligence(filters?: {
    status?: string;
    sourceType?: string;
  }): Promise<MarketIntelligence[]> {
    let query = db.select().from(marketIntelligence);

    if (filters?.status) {
      query = query.where(eq(marketIntelligence.status, filters.status));
    }
    if (filters?.sourceType) {
      query = query.where(
        eq(marketIntelligence.sourceType, filters.sourceType)
      );
    }

    const result = await query.orderBy(desc(marketIntelligence.processedAt));
    return result;
  }

  async createMarketIntelligence(
    intelligence: InsertMarketIntelligence
  ): Promise<MarketIntelligence> {
    const result = await db
      .insert(marketIntelligence)
      .values(intelligence)
      .returning();
    return result[0];
  }

  async updateMarketIntelligenceStatus(
    id: number,
    status: string,
    reviewNotes?: string,
    reviewedBy?: number
  ): Promise<MarketIntelligence | null> {
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    if (reviewNotes) updateData.reviewNotes = reviewNotes;
    if (reviewedBy) updateData.reviewedBy = reviewedBy;

    const result = await db
      .update(marketIntelligence)
      .set(updateData)
      .where(eq(marketIntelligence.id, id))
      .returning();
    return result[0] || null;
  }

  async getOpportunitySources(): Promise<OpportunitySource[]> {
    const result = await db
      .select()
      .from(opportunitySources)
      .where(eq(opportunitySources.isActive, true))
      .orderBy(opportunitySources.name);
    return result;
  }

  async createOpportunitySource(
    source: InsertOpportunitySource
  ): Promise<OpportunitySource> {
    const result = await db
      .insert(opportunitySources)
      .values(source)
      .returning();
    return result[0];
  }

  async updateOpportunitySourceLastScraped(
    id: number,
    opportunitiesFound: number
  ): Promise<void> {
    await db
      .update(opportunitySources)
      .set({
        lastScraped: new Date(),
        opportunitiesFound,
        updatedAt: new Date(),
      })
      .where(eq(opportunitySources.id, id));
  }

  async getOpportunityMatches(filters?: {
    artistId?: number;
    opportunityId?: number;
  }): Promise<OpportunityMatch[]> {
    let query = db.select().from(opportunityMatches);

    if (filters?.artistId) {
      query = query.where(eq(opportunityMatches.artistId, filters.artistId));
    }
    if (filters?.opportunityId) {
      query = query.where(
        eq(opportunityMatches.opportunityId, filters.opportunityId)
      );
    }

    const result = await query.orderBy(desc(opportunityMatches.matchScore));
    return result;
  }

  async createOpportunityMatch(
    match: InsertOpportunityMatch
  ): Promise<OpportunityMatch> {
    const result = await db
      .insert(opportunityMatches)
      .values(match)
      .returning();
    return result[0];
  }

  async updateOpportunityMatchInteraction(
    id: number,
    interactionType: string
  ): Promise<void> {
    const updateData: any = {
      interactionType,
      updatedAt: new Date(),
    };

    if (interactionType === "viewed") {
      updateData.viewedAt = new Date();
    }

    await db
      .update(opportunityMatches)
      .set(updateData)
      .where(eq(opportunityMatches.id, id));
  }

  // PRO Registration methods implementation
  async getPRORegistrations(userId?: number): Promise<PRORegistration[]> {
    let query = db.select().from(proRegistrations);

    if (userId) {
      query = query.where(eq(proRegistrations.userId, userId));
    }

    const result = await query.orderBy(desc(proRegistrations.createdAt));
    return result;
  }

  async createPRORegistration(
    registration: InsertPRORegistration
  ): Promise<PRORegistration> {
    const result = await db
      .insert(proRegistrations)
      .values(registration)
      .returning();
    return result[0];
  }

  async getPRORegistrationById(id: number): Promise<PRORegistration | null> {
    const result = await db
      .select()
      .from(proRegistrations)
      .where(eq(proRegistrations.id, id))
      .limit(1);
    return result[0] || null;
  }

  async updatePRORegistration(
    id: number,
    updates: Partial<InsertPRORegistration>
  ): Promise<PRORegistration | null> {
    const updateData = {
      ...updates,
      updatedAt: new Date(),
    };

    const result = await db
      .update(proRegistrations)
      .set(updateData)
      .where(eq(proRegistrations.id, id))
      .returning();
    return result[0] || null;
  }

  async getPROWorks(proRegistrationId: number): Promise<PROWork[]> {
    const result = await db
      .select()
      .from(proWorks)
      .where(eq(proWorks.proRegistrationId, proRegistrationId))
      .orderBy(desc(proWorks.createdAt));
    return result;
  }

  async createPROWork(work: InsertPROWork): Promise<PROWork> {
    const result = await db.insert(proWorks).values(work).returning();
    return result[0];
  }

  async updatePROWork(
    id: number,
    updates: Partial<InsertPROWork>
  ): Promise<PROWork | null> {
    const updateData = {
      ...updates,
      updatedAt: new Date(),
    };

    const result = await db
      .update(proWorks)
      .set(updateData)
      .where(eq(proWorks.id, id))
      .returning();
    return result[0] || null;
  }

  async createPROEligibilityAssessment(
    assessment: InsertPROEligibilityAssessment
  ): Promise<PROEligibilityAssessment> {
    const result = await db
      .insert(proEligibilityAssessments)
      .values(assessment)
      .returning();
    return result[0];
  }

  async getPROEligibilityAssessment(
    userId: number
  ): Promise<PROEligibilityAssessment | null> {
    const result = await db
      .select()
      .from(proEligibilityAssessments)
      .where(eq(proEligibilityAssessments.userId, userId))
      .orderBy(desc(proEligibilityAssessments.createdAt))
      .limit(1);
    return result[0] || null;
  }

  // ISRC Management Methods
  async getAllIsrcCodes(): Promise<IsrcCode[]> {
    try {
      return await db.select().from(isrcCodes);
    } catch (error) {
      console.error("Error fetching ISRC codes:", error);
      return [];
    }
  }

  async getIsrcCodesByArtistAndYear(
    artistId: number,
    year: string
  ): Promise<IsrcCode[]> {
    try {
      return await db
        .select()
        .from(isrcCodes)
        .where(
          and(
            eq(isrcCodes.artistId, artistId),
            sql`substring(${isrcCodes.isrcCode}, 7, 2) = ${year}`
          )
        );
    } catch (error) {
      console.error("Error fetching ISRC codes by artist and year:", error);
      return [];
    }
  }

  async getHighestArtistIdFromISRC(): Promise<number> {
    try {
      const codes = await db.select().from(isrcCodes);
      let maxId = 0;

      codes.forEach((code) => {
        // Parse ISRC format: DM-A0D-YY-NN-XXX
        const parts = code.isrcCode.split("-");
        if (parts.length >= 4) {
          const nnValue = parseInt(parts[3]);
          if (!isNaN(nnValue) && nnValue > maxId) {
            maxId = nnValue;
          }
        }
      });

      return maxId;
    } catch (error) {
      console.error("Error getting highest artist ID from ISRC:", error);
      return 0;
    }
  }

  async createIsrcCode(isrcData: InsertIsrcCode): Promise<IsrcCode> {
    const [created] = await db.insert(isrcCodes).values(isrcData).returning();
    return created;
  }

  async getIsrcCodeById(id: number): Promise<IsrcCode | undefined> {
    const [code] = await db
      .select()
      .from(isrcCodes)
      .where(eq(isrcCodes.id, id));
    return code || undefined;
  }

  async updateIsrcCode(
    id: number,
    updates: Partial<IsrcCode>
  ): Promise<IsrcCode | undefined> {
    const [updated] = await db
      .update(isrcCodes)
      .set(updates)
      .where(eq(isrcCodes.id, id))
      .returning();
    return updated || undefined;
  }

  // Artist ISRC Identifier Management
  async ensureManagedArtistHasIsrcId(): Promise<void> {
    try {
      // Get all managed artists (roleId 3) and musicians (roleId 5)
      const managedUsers = await db
        .select()
        .from(users)
        .where(or(eq(users.roleId, 3), eq(users.roleId, 5)));

      for (const user of managedUsers) {
        // Check if they already have an ISRC artist ID
        const existingCodes = await db
          .select()
          .from(isrcCodes)
          .where(eq(isrcCodes.userId, user.id))
          .limit(1);

        if (existingCodes.length === 0) {
          // Get their artist/musician details for name matching
          const artist = await this.getArtist(user.id);
          const musician = await this.getMusician(user.id);

          const displayName =
            artist?.stageNames?.[0]?.name ||
            musician?.stageNames?.[0]?.name ||
            user.fullName;

          // Generate their first ISRC to establish their NN identifier
          const currentYear = new Date().getFullYear().toString().slice(-2);
          const artistId = await this.getOrAssignArtistId(displayName);

          const placeholderIsrc = `DM-A0D-${currentYear}-${artistId.padStart(
            2,
            "0"
          )}-001`;

          await this.createIsrcCode({
            userId: user.id,
            artistId: parseInt(artistId),
            songTitle: `${displayName} - ID Placeholder`,
            isrcCode: placeholderIsrc,
            status: "pending",
            basePrice: 0,
            finalPrice: 0,
            paymentStatus: "completed",
          });
        }
      }
    } catch (error) {
      console.error("Error ensuring managed artists have ISRC IDs:", error);
    }
  }

  async getOrAssignArtistId(artistName: string): Promise<string> {
    // Check predefined IDs first
    const predefinedIds: Record<string, string> = {
      "Lí-Lí Octave": "00",
      "LI-LI OCTAVE": "00",
      "LIANNE MARILDA MARISA LETANG": "00",
      JCro: "01",
      JCRO: "01",
      "Karlvin Deravariere": "01",
      "Janet Azzouz": "02",
      "JANET AZZOUZ": "02",
      "Princess Trinidad": "04",
      "PRINCESS TRINIDAD": "04",
    };

    if (predefinedIds[artistName]) {
      return predefinedIds[artistName];
    }

    // Get highest existing ID and increment
    const maxId = await this.getHighestArtistIdFromISRC();
    return (maxId + 1).toString();
  }

  // Stub implementations for missing interface methods
  async getUserEnhancedSplitsheets(userId: number): Promise<any[]> {
    return [];
  }

  async createEnhancedSplitsheet(data: any): Promise<any> {
    throw new Error("Enhanced splitsheet not implemented yet");
  }

  async getFavoritesByUser(userId: number): Promise<any[]> {
    return [];
  }

  async addFavorite(data: any): Promise<any> {
    throw new Error("Favorites not implemented yet");
  }

  async removeFavorite(
    userId: number,
    itemId: number,
    itemType: string
  ): Promise<void> {
    throw new Error("Favorites not implemented yet");
  }

  // Remove duplicate - these methods already exist above
  // Press Release Management
  async getPressReleases(filters?: {
    artistId?: number;
    status?: string;
  }): Promise<PressRelease[]> {
    let query = db.select().from(pressReleases);

    if (filters?.artistId) {
      query = query.where(eq(pressReleases.primaryArtistId, filters.artistId));
    }

    if (filters?.status) {
      const statusCondition = eq(pressReleases.status, filters.status);
      query = filters?.artistId
        ? query.where(
          and(
            eq(pressReleases.primaryArtistId, filters.artistId),
            statusCondition
          )
        )
        : query.where(statusCondition);
    }

    return await query.orderBy(desc(pressReleases.createdAt));
  }

  async createPressRelease(
    pressRelease: InsertPressRelease
  ): Promise<PressRelease> {
    const [created] = await db
      .insert(pressReleases)
      .values([pressRelease])
      .returning();
    return created;
  }

  async getPressReleaseById(id: number): Promise<PressRelease | null> {
    const [pressRelease] = await db
      .select()
      .from(pressReleases)
      .where(eq(pressReleases.id, id));

    return pressRelease || null;
  }

  async updatePressRelease(
    id: number,
    updates: Partial<InsertPressRelease>
  ): Promise<PressRelease | null> {
    const [updated] = await db
      .update(pressReleases)
      .set({ ...updates, updatedAt: new Date() } as any)
      .where(eq(pressReleases.id, id))
      .returning();

    return updated || null;
  }

  async deletePressRelease(id: number): Promise<boolean> {
    const result = await db
      .delete(pressReleases)
      .where(eq(pressReleases.id, id));
    return result.rowCount !== undefined && result.rowCount > 0;
  }

  async publishPressRelease(
    id: number,
    publishedBy: number
  ): Promise<PressRelease | null> {
    const [updated] = await db
      .update(pressReleases)
      .set({
        status: "published",
        publishedAt: new Date(),
        lastModifiedBy: publishedBy,
        updatedAt: new Date(),
      } as any)
      .where(eq(pressReleases.id, id))
      .returning();

    return updated || null;
  }

  // Press Release Assignments
  async getPressReleaseAssignments(
    pressReleaseId: number
  ): Promise<PressReleaseAssignment[]> {
    return await db
      .select()
      .from(pressReleaseAssignments)
      .where(eq(pressReleaseAssignments.pressReleaseId, pressReleaseId));
  }

  async createPressReleaseAssignment(
    assignment: InsertPressReleaseAssignment
  ): Promise<PressReleaseAssignment> {
    const [created] = await db
      .insert(pressReleaseAssignments)
      .values([assignment])
      .returning();
    return created;
  }

  async deletePressReleaseAssignment(id: number): Promise<boolean> {
    const result = await db
      .delete(pressReleaseAssignments)
      .where(eq(pressReleaseAssignments.id, id));
    return result.rowCount !== undefined && result.rowCount > 0;
  }

  // Press Release Media
  async getPressReleaseMedia(
    pressReleaseId: number
  ): Promise<PressReleaseMedia[]> {
    return await db
      .select()
      .from(pressReleaseMedia)
      .where(eq(pressReleaseMedia.pressReleaseId, pressReleaseId))
      .orderBy(pressReleaseMedia.displayOrder);
  }

  async createPressReleaseMedia(
    media: InsertPressReleaseMedia
  ): Promise<PressReleaseMedia> {
    const [created] = await db
      .insert(pressReleaseMedia)
      .values([media])
      .returning();
    return created;
  }

  async updatePressReleaseMedia(
    id: number,
    updates: Partial<InsertPressReleaseMedia>
  ): Promise<PressReleaseMedia | null> {
    const [updated] = await db
      .update(pressReleaseMedia)
      .set({ ...updates, updatedAt: new Date() } as any)
      .where(eq(pressReleaseMedia.id, id))
      .returning();

    return updated || null;
  }

  async deletePressReleaseMedia(id: number): Promise<boolean> {
    const result = await db
      .delete(pressReleaseMedia)
      .where(eq(pressReleaseMedia.id, id));
    return result.rowCount !== undefined && result.rowCount > 0;
  }

  // Press Release Distribution
  async getPressReleaseDistribution(
    pressReleaseId: number
  ): Promise<PressReleaseDistribution[]> {
    return await db
      .select()
      .from(pressReleaseDistribution)
      .where(eq(pressReleaseDistribution.pressReleaseId, pressReleaseId))
      .orderBy(desc(pressReleaseDistribution.distributedAt));
  }

  async createPressReleaseDistribution(
    distribution: InsertPressReleaseDistribution
  ): Promise<PressReleaseDistribution> {
    const [created] = await db
      .insert(pressReleaseDistribution)
      .values([distribution])
      .returning();
    return created;
  }

  async updatePressReleaseDistributionStatus(
    id: number,
    status: string,
    responseType?: string
  ): Promise<PressReleaseDistribution | null> {
    const updates: any = {
      status,
      updatedAt: new Date(),
    };

    if (responseType) {
      updates.responseType = responseType;
      updates.responseReceived = new Date();
    }

    const [updated] = await db
      .update(pressReleaseDistribution)
      .set(updates)
      .where(eq(pressReleaseDistribution.id, id))
      .returning();

    return updated || null;
  }
  // ==================== OPPHUB AI METHODS ====================

  // All duplicate opportunity methods removed - keeping original implementations with comprehensive error handling

  // Duplicate opportunity application methods removed - keeping originals at lines 5539 and 5546

  // Duplicate opportunity sources and matches methods removed - keeping originals at lines 5644-5686

  // ==================== RECIPIENT MANAGEMENT METHODS IMPLEMENTATION ====================

  // Recipient Categories
  async getRecipientCategories(): Promise<RecipientCategory[]> {
    return await db
      .select()
      .from(recipientCategories)
      .orderBy(recipientCategories.priority, recipientCategories.displayName);
  }

  async createRecipientCategory(
    category: InsertRecipientCategory
  ): Promise<RecipientCategory> {
    const [created] = await db
      .insert(recipientCategories)
      .values([category])
      .returning();
    return created;
  }

  async updateRecipientCategory(
    id: number,
    updates: Partial<InsertRecipientCategory>
  ): Promise<RecipientCategory | null> {
    const [updated] = await db
      .update(recipientCategories)
      .set(updates)
      .where(eq(recipientCategories.id, id))
      .returning();

    return updated || null;
  }

  async deleteRecipientCategory(id: number): Promise<boolean> {
    const result = await db
      .delete(recipientCategories)
      .where(eq(recipientCategories.id, id));
    return result.rowCount !== undefined && result.rowCount > 0;
  }

  // Music Genres
  async getMusicGenres(): Promise<MusicGenre[]> {
    return await db.select().from(musicGenres).orderBy(musicGenres.displayName);
  }

  async createMusicGenre(genre: InsertMusicGenre): Promise<MusicGenre> {
    const [created] = await db.insert(musicGenres).values([genre]).returning();
    return created;
  }

  async updateMusicGenre(
    id: number,
    updates: Partial<InsertMusicGenre>
  ): Promise<MusicGenre | null> {
    const [updated] = await db
      .update(musicGenres)
      .set(updates)
      .where(eq(musicGenres.id, id))
      .returning();

    return updated || null;
  }

  async deleteMusicGenre(id: number): Promise<boolean> {
    const result = await db.delete(musicGenres).where(eq(musicGenres.id, id));
    return result.rowCount !== undefined && result.rowCount > 0;
  }

  // Industry Recipients
  async getIndustryRecipients(filters?: {
    categoryId?: number;
    genreIds?: number[];
    status?: string;
  }): Promise<IndustryRecipient[]> {
    let query = db.select().from(industryRecipients);

    const conditions = [];

    if (filters?.categoryId) {
      conditions.push(eq(industryRecipients.categoryId, filters.categoryId));
    }

    if (filters?.status) {
      conditions.push(eq(industryRecipients.status, filters.status));
    }

    if (filters?.genreIds && filters.genreIds.length > 0) {
      conditions.push(
        sql`${industryRecipients.preferredGenres} && ${JSON.stringify(
          filters.genreIds
        )}`
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query.orderBy(
      desc(industryRecipients.influence),
      industryRecipients.name
    );
  }

  async getIndustryRecipientById(
    id: number
  ): Promise<IndustryRecipient | null> {
    const [recipient] = await db
      .select()
      .from(industryRecipients)
      .where(eq(industryRecipients.id, id));

    return recipient || null;
  }

  async createIndustryRecipient(
    recipient: InsertIndustryRecipient
  ): Promise<IndustryRecipient> {
    const [created] = await db
      .insert(industryRecipients)
      .values([recipient])
      .returning();
    return created;
  }

  async updateIndustryRecipient(
    id: number,
    updates: Partial<InsertIndustryRecipient>
  ): Promise<IndustryRecipient | null> {
    const [updated] = await db
      .update(industryRecipients)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(industryRecipients.id, id))
      .returning();

    return updated || null;
  }

  async deleteIndustryRecipient(id: number): Promise<boolean> {
    const result = await db
      .delete(industryRecipients)
      .where(eq(industryRecipients.id, id));
    return result.rowCount !== undefined && result.rowCount > 0;
  }

  async searchIndustryRecipients(query: string): Promise<IndustryRecipient[]> {
    return await db
      .select()
      .from(industryRecipients)
      .where(
        or(
          sql`${industryRecipients.name} ILIKE ${`%${query}%`}`,
          sql`${industryRecipients.contactPerson} ILIKE ${`%${query}%`}`,
          sql`${industryRecipients.email} ILIKE ${`%${query}%`}`
        )
      )
      .orderBy(desc(industryRecipients.influence), industryRecipients.name);
  }

  // Content Distribution (Unified for Newsletters and Press Releases)
  async getContentDistribution(
    contentType: string,
    contentId: number
  ): Promise<ContentDistribution | null> {
    const [distribution] = await db
      .select()
      .from(contentDistribution)
      .where(
        and(
          eq(contentDistribution.contentType, contentType),
          eq(contentDistribution.contentId, contentId)
        )
      );

    return distribution || null;
  }

  async createContentDistribution(
    distribution: InsertContentDistribution
  ): Promise<ContentDistribution> {
    const [created] = await db
      .insert(contentDistribution)
      .values([distribution])
      .returning();
    return created;
  }

  async updateContentDistribution(
    id: number,
    updates: Partial<InsertContentDistribution>
  ): Promise<ContentDistribution | null> {
    const [updated] = await db
      .update(contentDistribution)
      .set(updates)
      .where(eq(contentDistribution.id, id))
      .returning();

    return updated || null;
  }

  async deleteContentDistribution(id: number): Promise<boolean> {
    const result = await db
      .delete(contentDistribution)
      .where(eq(contentDistribution.id, id));
    return result.rowCount !== undefined && result.rowCount > 0;
  }

  async getContentDistributionsByType(
    contentType: string
  ): Promise<ContentDistribution[]> {
    return await db
      .select()
      .from(contentDistribution)
      .where(eq(contentDistribution.contentType, contentType))
      .orderBy(desc(contentDistribution.createdAt));
  }

  async getContentDistributionAnalytics(
    contentType: string,
    contentId: number
  ): Promise<ContentDistribution | null> {
    const [analytics] = await db
      .select()
      .from(contentDistribution)
      .where(
        and(
          eq(contentDistribution.contentType, contentType),
          eq(contentDistribution.contentId, contentId)
        )
      );

    return analytics || null;
  }

  // Recipient Engagements
  async getRecipientEngagements(filters?: {
    recipientId?: number;
    contentType?: string;
    contentId?: number;
  }): Promise<RecipientEngagement[]> {
    let query = db.select().from(recipientEngagements);

    const conditions = [];

    if (filters?.recipientId) {
      conditions.push(
        eq(recipientEngagements.recipientId, filters.recipientId)
      );
    }

    if (filters?.contentType) {
      conditions.push(
        eq(recipientEngagements.contentType, filters.contentType)
      );
    }

    if (filters?.contentId) {
      conditions.push(eq(recipientEngagements.contentId, filters.contentId));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query.orderBy(desc(recipientEngagements.engagementDate));
  }

  async createRecipientEngagement(
    engagement: InsertRecipientEngagement
  ): Promise<RecipientEngagement> {
    const [created] = await db
      .insert(recipientEngagements)
      .values([engagement])
      .returning();
    return created;
  }

  async updateRecipientEngagement(
    id: number,
    updates: Partial<InsertRecipientEngagement>
  ): Promise<RecipientEngagement | null> {
    const [updated] = await db
      .update(recipientEngagements)
      .set(updates)
      .where(eq(recipientEngagements.id, id))
      .returning();

    return updated || null;
  }

  // Enhanced Recipient Matching Methods
  async getMatchingRecipients(
    contentGenres: number[],
    categoryIds?: number[],
    minimumInfluence?: number
  ): Promise<IndustryRecipient[]> {
    let query = db.select().from(industryRecipients);

    const conditions = [eq(industryRecipients.status, "active")];

    // Genre matching - recipients who cover at least one of the content genres
    if (contentGenres.length > 0) {
      conditions.push(
        sql`${industryRecipients.preferredGenres} && ${JSON.stringify(
          contentGenres
        )}`
      );
    }

    // Category filtering
    if (categoryIds && categoryIds.length > 0) {
      conditions.push(inArray(industryRecipients.categoryId, categoryIds));
    }

    // Minimum influence filter
    if (minimumInfluence && minimumInfluence > 0) {
      conditions.push(gte(industryRecipients.influence, minimumInfluence));
    }

    return await query
      .where(and(...conditions))
      .orderBy(
        desc(industryRecipients.influence),
        desc(industryRecipients.responseRate),
        industryRecipients.name
      );
  }

  async getRecipientsByCategory(
    categoryId: number
  ): Promise<IndustryRecipient[]> {
    return await db
      .select()
      .from(industryRecipients)
      .where(
        and(
          eq(industryRecipients.categoryId, categoryId),
          eq(industryRecipients.status, "active")
        )
      )
      .orderBy(desc(industryRecipients.influence), industryRecipients.name);
  }

  async getRecipientsByGenre(genreId: number): Promise<IndustryRecipient[]> {
    return await db
      .select()
      .from(industryRecipients)
      .where(
        and(
          sql`${industryRecipients.preferredGenres} @> ${JSON.stringify([
            genreId,
          ])}`,
          eq(industryRecipients.status, "active")
        )
      )
      .orderBy(desc(industryRecipients.influence), industryRecipients.name);
  }

  // Album-Merchandise Assignment System Implementation (Post-Upload Ingenious Workflow)
  async getAlbumMerchandiseAssignments(albumId?: number): Promise<any[]> {
    try {
      let query = `
        SELECT 
          ama.id,
          ama.album_id as "albumId",
          ama.merchandise_id as "merchandiseId", 
          ama.assigned_by as "assignedBy",
          ama.assignment_notes as "assignmentNotes",
          ama.created_at as "createdAt",
          json_build_object(
            'id', a.id,
            'title', a.title,
            'artistUserId', a.artist_user_id,
            'coverImageUrl', a.cover_image_url,
            'releaseDate', a.release_date,
            'createdAt', a.created_at
          ) as album,
          json_build_object(
            'id', m.id,
            'name', m.name,
            'description', m.description,
            'price', m.price,
            'artistUserId', m.artist_user_id,
            'imageUrl', m.image_url,
            'category', m.category,
            'isActive', m.is_active
          ) as merchandise
        FROM album_merchandise_assignments ama
        LEFT JOIN albums a ON a.id = ama.album_id
        LEFT JOIN merchandise m ON m.id = ama.merchandise_id
      `;

      if (albumId) {
        query += ` WHERE ama.album_id = $1`;
        const result = await db.execute(sql.raw(query, [albumId]));
        return result.rows;
      }

      const result = await db.execute(sql.raw(query));
      return result.rows;
    } catch (error) {
      console.error("Error fetching album merchandise assignments:", error);
      return [];
    }
  }

  async createAlbumMerchandiseAssignment(assignment: any): Promise<any> {
    try {
      const result = await db.execute(
        sql.raw(
          `
        INSERT INTO album_merchandise_assignments (album_id, merchandise_id, assigned_by, assignment_notes, created_at)
        VALUES ($1, $2, $3, $4, NOW())
        RETURNING *
      `,
          [
            assignment.albumId,
            assignment.merchandiseId,
            assignment.assignedBy,
            assignment.assignmentNotes,
          ]
        )
      );

      return result.rows[0];
    } catch (error) {
      console.error("Error creating album merchandise assignment:", error);
      throw new Error("Failed to create album merchandise assignment");
    }
  }

  async removeAlbumMerchandiseAssignment(id: number): Promise<void> {
    try {
      await db.execute(
        sql.raw(`DELETE FROM album_merchandise_assignments WHERE id = $1`, [id])
      );
    } catch (error) {
      console.error("Error removing album merchandise assignment:", error);
      throw new Error("Failed to remove album merchandise assignment");
    }
  }

  async getAssignmentsByMerchandise(merchandiseId: number): Promise<any[]> {
    try {
      const result = await db.execute(
        sql.raw(
          `
        SELECT * FROM album_merchandise_assignments WHERE merchandise_id = $1
      `,
          [merchandiseId]
        )
      );
      return result.rows;
    } catch (error) {
      console.error("Error fetching assignments by merchandise:", error);
      return [];
    }
  }
  // ==================== MISSING API METHODS IMPLEMENTATION ====================

  // Fix 1: Merchandise API - OppHub AI Learning: Database schema alignment

  // Configuration management methods - Real database implementation
  async getPlatformConfiguration(): Promise<AdminConfigType> {
    return await configurationStorage.getPlatformConfiguration();
  }

  async updatePlatformConfiguration(
    newConfig: Partial<AdminConfigType>,
    userId: number,
    changeDescription?: string
  ): Promise<boolean> {
    return await configurationStorage.updatePlatformConfiguration(
      newConfig,
      userId,
      changeDescription
    );
  }

  async getConfigurationHistory(limit: number = 50): Promise<any[]> {
    return await configurationStorage.getConfigurationHistory(limit);
  }

  async createConfigurationDelegation(
    delegatedBy: number,
    delegatedTo: number,
    configurationAspects: string[],
    permissions: any,
    expiresAt?: Date
  ): Promise<boolean> {
    return await configurationStorage.createConfigurationDelegation(
      delegatedBy,
      delegatedTo,
      configurationAspects,
      permissions,
      expiresAt
    );
  }

  async getUserDelegatedAspects(userId: number): Promise<string[]> {
    return await configurationStorage.getUserDelegatedAspects(userId);
  }

  // Fix 2: Splitsheets API - OppHub AI Learning: Music industry specific data patterns
  async getSplitsheets(): Promise<any[]> {
    try {
      // Get splitsheets from database
      const result = await db.execute(
        sql`SELECT * FROM splitsheets ORDER BY id DESC`
      );
      return result.rows;
    } catch (error) {
      console.error("Get splitsheets error:", error);
      return [];
    }
  }

  async createSplitsheet(splitsheet: any): Promise<any> {
    try {
      // Create splitsheet with database integration
      const result = await db.execute(sql`
        INSERT INTO splitsheets (song_title, participants, split_percentages, audio_file_path)
        VALUES (${splitsheet.songTitle || "Untitled Song"}, ${JSON.stringify(
        splitsheet.writers || []
      )}, ${JSON.stringify(splitsheet.percentages || [])}, ${splitsheet.audioFilePath || null
        })
        RETURNING *
      `);

      return result.rows[0];
    } catch (error) {
      console.error("Create splitsheet error:", error);
      // Database integration with fallback
      return {
        id: Date.now(),
        ...splitsheet,
        createdAt: new Date(),
        status: "pending",
      };
    }
  }

  // Fix 3: Contracts API - OppHub AI Learning: Legal document management system
  async getContracts(): Promise<any[]> {
    try {
      // Get contracts from database - DEBUG VERSION
      console.log("🔍 Fetching contracts from database...");
      const result = await db.execute(
        sql`SELECT * FROM contracts ORDER BY id DESC`
      );
      console.log(
        "📊 Contract query result:",
        result.rows.length,
        "records found"
      );
      console.log("📝 First contract:", result.rows[0]);
      return result.rows;
    } catch (error) {
      console.error("❌ Get contracts error:", error);
      return [];
    }
  }

  async createOrUpdateContract(contractData: any): Promise<any> {
    try {
      const result = await db.execute(sql`
        INSERT INTO contracts
          (booking_id, contract_type, title, content, created_by_user_id, assigned_to_user_id, metadata, status)
        VALUES
          (${contractData.bookingId}, ${contractData.contractType}, ${contractData.title}, ${contractData.content}, 
           ${contractData.createdByUserId}, ${contractData.assignedToUserId || null}, ${contractData.metadata || null}, 
           ${contractData.status || "draft"})
        ON CONFLICT (booking_id, contract_type)
        DO UPDATE SET
          title = EXCLUDED.title,
          content = EXCLUDED.content,
          assigned_to_user_id = EXCLUDED.assigned_to_user_id,
          metadata = EXCLUDED.metadata,
          status = EXCLUDED.status,
          updated_at = NOW()
        RETURNING *;
      `);

      console.log("✅ Contract upserted:", result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error("❌ Failed to upsert contract:", error);
      throw error;
    }
  }

  async upsertContract({
    bookingId,
    contractType,
    title,
    content,
    createdByUserId,
    assignedToUserId,
    metadata = {},
    status = "draft"
  }: {
    bookingId: number;
    contractType: "booking_agreement" | "performance_contract";
    title: string;
    content: any;
    createdByUserId?: number;
    assignedToUserId?: number;
    metadata?: Record<string, any>;
    status?: "draft" | "sent" | "signed" | "countered" | "completed";
  }) {
    try {
      // 🔹 Performance contract হলে, assignedToUserId দিয়ে চেক করবো
      // 🔹 Booking agreement হলে, শুধু contractType দিয়ে
      let conditions = [
        eq(contracts.bookingId, bookingId),
        eq(contracts.contractType, contractType)
      ];
  
      if (contractType === "performance_contract" && assignedToUserId) {
        conditions.push(eq(contracts.assignedToUserId, assignedToUserId));
      }
  
      const existing = await db
        .select()
        .from(contracts)
        .where(and(...conditions))
        .limit(1);
  
      if (existing.length > 0) {
        // 🔁 Update existing
        const [updated] = await db
          .update(contracts)
          .set({
            title,
            content,
            metadata,
            status,
            updatedAt: new Date()
          })
          .where(eq(contracts.id, existing[0].id))
          .returning();
  
        return { action: "updated", contract: updated };
      } else {
        // 🆕 Insert new
        const [inserted] = await db
          .insert(contracts)
          .values({
            bookingId,
            contractType,
            title,
            content,
            createdByUserId,
            assignedToUserId,
            metadata,
            status
          })
          .returning();
  
        return { action: "inserted", contract: inserted };
      }
    } catch (error) {
      console.error("❌ Error in upsertContract:", error);
      throw new Error("Failed to upsert contract");
    }
  }


  // Get contract by ID
  async getContractById(id: number) {
    try {
      const contract = await db
        .select()
        .from(contracts)
        .where(eq(contracts.id, id))
        .limit(1);

      return contract[0] || null;
    } catch (error) {
      console.error("❌ Get contract by ID error:", error);
      return null;
    }
  }

  // 🔹 ৬️⃣ Contracts by Booking
  async getContractByBooking(bookingId: number) {
    try {
      const results = await db
        .select({
          id: contracts.id,
          bookingId: contracts.bookingId,
          contractType: contracts.contractType,
          title: contracts.title,
          content: contracts.content,
          metadata: contracts.metadata,
          status: contracts.status,
          assignedToUserId: contracts.assignedToUserId,
          createdByUserId: contracts.createdByUserId,
          createdAt: contracts.createdAt,
          updatedAt: contracts.updatedAt,
        })
        .from(contracts)
        .where(eq(contracts.bookingId, bookingId))
        .orderBy(contracts.createdAt);

      return results;
    } catch (error) {
      console.error("❌ Get contracts by booking error:", error);
      return [];
    }
  }

  async getContractsWithSignatures(bookingId: number) {
    return await db
      .select({
        contractId: contracts.id,
        title: contracts.title,
        type: contracts.contractType,
        signerName: contractSignatures.signerName,
        signerEmail: contractSignatures.signerEmail,
        signetureData: contractSignatures.signatureData,
        signedAt: contractSignatures.signedAt,
        status: contractSignatures.status,
      })
      .from(contracts)
      .leftJoin(contractSignatures, eq(contracts.id, contractSignatures.contractId))
      .where(eq(contracts.bookingId, bookingId));
  }
  

  // Get all technical riders
  async getTechnicalRiders(): Promise<any[]> {
    try {
      const rows = await db
        .select()
        .from(technicalRiders)
        .orderBy(desc(technicalRiders.id));

      return rows;
    } catch (error) {
      console.error("Get technical riders error:", error);
      return [];
    }
  }

  async upsertTechnicalRider(technicalRider: any): Promise<any> {
    try {
      const [row] = await db
        .insert(technicalRiders)
        .values({
          bookingId: technicalRider.bookingId,
          artistTechnicalSpecs: technicalRider.artistTechnicalSpecs || {},
          musicianTechnicalSpecs: technicalRider.musicianTechnicalSpecs || {},
          equipmentRequirements: technicalRider.equipmentRequirements || [],
          stageRequirements: technicalRider.stageRequirements || {},
          lightingRequirements: technicalRider.lightingRequirements || {},
          soundRequirements: technicalRider.soundRequirements || {},
          additionalNotes: technicalRider.additionalNotes || null,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: technicalRiders.bookingId, // unique ধরে নিতে হবে
          set: {
            artistTechnicalSpecs: sql`excluded.artist_technical_specs`,
            musicianTechnicalSpecs: sql`excluded.musician_technical_specs`,
            equipmentRequirements: sql`excluded.equipment_requirements`,
            stageRequirements: sql`excluded.stage_requirements`,
            lightingRequirements: sql`excluded.lighting_requirements`,
            soundRequirements: sql`excluded.sound_requirements`,
            additionalNotes: sql`excluded.additional_notes`,
            updatedAt: new Date(),
          },
        })
        .returning();

      return row;
    } catch (error) {
      console.error("Upsert technical rider error:", error);
      throw error;
    }
  }


  // 🔹 ৪️⃣ Technical Rider
  async getTechnicalRiderByBooking(bookingId: number): Promise<any | null> {
    const [row] = await db
      .select()
      .from(technicalRiders)
      .where(eq(technicalRiders.bookingId, bookingId))
      .limit(1);

    return row || null;
  }

  async deleteTechnicalRider(id: number): Promise<void> {
    try {
      await db.delete(technicalRiders).where(eq(technicalRiders.id, id));
    } catch (error) {
      console.error("Delete technical rider error:", error);
      throw error;
    }
  }



  // Get ISRC Codes
  async getIsrcCodes(): Promise<any[]> {
    try {
      const rows = await db
        .select()
        .from(isrcCodes)
        .orderBy(desc(isrcCodes.id));

      return rows;
    } catch (error) {
      console.error("Get ISRC codes error:", error);
      return [];
    }
  }

  // Get Newsletters
  async getNewsletters(): Promise<any[]> {
    try {
      const rows = await db
        .select()
        .from(newsletters)
        .orderBy(desc(newsletters.id));

      return rows;
    } catch (error) {
      console.error("Get newsletters error:", error);
      return [];
    }
  }

  // Create Newsletter
  async createNewsletter(newsletter: any): Promise<any> {
    try {
      const createdBy = newsletter.created_by || 24; // superadmin fallback

      const [row] = await db
        .insert(newsletters)
        .values({
          title: newsletter.title || "Untitled Newsletter",
          content: newsletter.content || "",
          status: "draft", // default
          createdBy,
        })
        .returning();

      return row;
    } catch (error) {
      console.error("Create newsletter error:", error);
      return {
        id: Date.now(),
        ...newsletter,
        createdAt: new Date(),
        status: "draft",
      };
    }
  }

  // Media files implementation
  async createMediaFile(mediaFile: any): Promise<any> {
    try {
      const result = await db.execute(sql`
        INSERT INTO media_files (file_name, original_name, file_type, file_size, mime_type, url, category, tags, description, uploaded_by, is_public) 
        VALUES (${mediaFile.fileName}, ${mediaFile.originalName}, ${mediaFile.fileType
        }, ${mediaFile.fileSize}, ${mediaFile.mimeType}, ${mediaFile.url}, ${mediaFile.category
        }, ${JSON.stringify(mediaFile.tags)}, ${mediaFile.description}, ${mediaFile.uploadedBy
        }, ${mediaFile.isPublic}) 
        RETURNING *
      `);
      return result.rows[0];
    } catch (error) {
      console.error("Error creating media file:", error);
      throw error;
    }
  }

  async getMediaFiles(): Promise<any[]> {
    try {
      const result = await db.execute(
        sql`SELECT * FROM media_files ORDER BY created_at DESC`
      );
      return result.rows || [];
    } catch (error) {
      console.error("Error fetching media files:", error);
      return [];
    }
  }

  async deleteMediaFile(id: number): Promise<void> {
    try {
      await db.execute(sql`DELETE FROM media_files WHERE id = ${id}`);
    } catch (error) {
      console.error("Error deleting media file:", error);
      throw error;
    }
  }

  // Admin Dashboard Specific Methods
  async getUsersCount(): Promise<number> {
    try {
      const result = await db.select({ count: sql`COUNT(*)` }).from(users);
      return Number(result[0].count) || 0;
    } catch (error) {
      console.error("Error getting users count:", error);
      return 0;
    }
  }

  async getActiveUsersCount(): Promise<number> {
    try {
      const result = await db
        .select({ count: sql`COUNT(*)` })
        .from(users)
        .where(eq(users.status, "active"));
      return Number(result[0].count) || 0;
    } catch (error) {
      console.error("Error getting active users count:", error);
      return 0;
    }
  }

  async getNewUsersThisMonth(): Promise<number> {
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const result = await db
        .select({ count: sql`COUNT(*)` })
        .from(users)
        .where(gte(users.createdAt, startOfMonth));
      return Number(result[0].count) || 0;
    } catch (error) {
      console.error("Error getting new users this month:", error);
      return 0;
    }
  }

  async getBookingsCount(): Promise<number> {
    try {
      const result = await db.select({ count: sql`COUNT(*)` }).from(bookings);
      return Number(result[0].count) || 0;
    } catch (error) {
      console.error("Error getting bookings count:", error);
      return 0;
    }
  }

  async getCompletedBookingsCount(): Promise<number> {
    try {
      const result = await db
        .select({ count: sql`COUNT(*)` })
        .from(bookings)
        .where(eq(bookings.status, "completed"));
      return Number(result[0].count) || 0;
    } catch (error) {
      console.error("Error getting completed bookings count:", error);
      return 0;
    }
  }

  async getTotalRevenue(): Promise<number> {
    try {
      const result = await db
        .select({
          total: sql`COALESCE(SUM(CAST(final_price AS DECIMAL)), 0)`,
        })
        .from(bookings)
        .where(eq(bookings.status, "completed"));
      return Number(result[0].total) || 0;
    } catch (error) {
      console.error("Error getting total revenue:", error);
      return 0;
    }
  }

  async getMonthlyRevenue(): Promise<number> {
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const result = await db
        .select({
          total: sql`COALESCE(SUM(CAST(final_price AS DECIMAL)), 0)`,
        })
        .from(bookings)
        .where(
          and(
            eq(bookings.status, "completed"),
            gte(bookings.createdAt, startOfMonth)
          )
        );
      return Number(result[0].total) || 0;
    } catch (error) {
      console.error("Error getting monthly revenue:", error);
      return 0;
    }
  }

  async getWeeklyRevenue(): Promise<number> {
    try {
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const result = await db
        .select({
          total: sql`COALESCE(SUM(CAST(final_price AS DECIMAL)), 0)`,
        })
        .from(bookings)
        .where(
          and(
            eq(bookings.status, "completed"),
            gte(bookings.createdAt, startOfWeek)
          )
        );
      return Number(result[0].total) || 0;
    } catch (error) {
      console.error("Error getting weekly revenue:", error);
      return 0;
    }
  }

  async getPendingPayouts(): Promise<number> {
    try {
      const result = await db
        .select({
          total: sql`COALESCE(SUM(CAST(final_price AS DECIMAL)) * 0.88, 0)`,
        })
        .from(bookings)
        .where(
          and(
            eq(bookings.status, "completed"),
            sql`payout_status IS NULL OR payout_status = 'pending'`
          )
        );
      return Number(result[0].total) || 0;
    } catch (error) {
      console.error("Error getting pending payouts:", error);
      return 0;
    }
  }

  async getPendingApprovalsCount(): Promise<number> {
    try {
      const result = await db
        .select({ count: sql`COUNT(*)` })
        .from(bookings)
        .where(eq(bookings.status, "pending_approval"));
      return Number(result[0].count) || 0;
    } catch (error) {
      console.error("Error getting pending approvals count:", error);
      return 0;
    }
  }

  async getActiveBookingsCount(): Promise<number> {
    try {
      const result = await db
        .select({ count: sql`COUNT(*)` })
        .from(bookings)
        .where(
          or(
            eq(bookings.status, "confirmed"),
            eq(bookings.status, "in_progress")
          )
        );
      return Number(result[0].count) || 0;
    } catch (error) {
      console.error("Error getting active bookings count:", error);
      return 0;
    }
  }

  async getContentItemsCount(): Promise<number> {
    try {
      const [songsResult, albumsResult, merchandiseResult] = await Promise.all([
        db.select({ count: sql`COUNT(*)` }).from(songs),
        db.select({ count: sql`COUNT(*)` }).from(albums),
        db.select({ count: sql`COUNT(*)` }).from(merchandise),
      ]);

      return (
        Number(songsResult[0].count) +
        Number(albumsResult[0].count) +
        Number(merchandiseResult[0].count)
      );
    } catch (error) {
      console.error("Error getting content items count:", error);
      return 0;
    }
  }

  async getTopArtists(): Promise<
    { name: string; bookings: number; revenue: number }[]
  > {
    try {
      const result = await db
        .select({
          name: sql`COALESCE(artists.stage_names[1], CONCAT(users.first_name, ' ', users.last_name))`,
          bookings: sql`COUNT(bookings.id)`,
          revenue: sql`COALESCE(SUM(CAST(bookings.final_price AS DECIMAL)), 0)`,
        })
        .from(bookings)
        .innerJoin(users, eq(bookings.primaryArtistUserId, users.id))
        .leftJoin(artists, eq(users.id, artists.user_id))
        .where(eq(bookings.status, "completed"))
        .groupBy(users.id, artists.id)
        .orderBy(sql`COUNT(bookings.id) DESC`)
        .limit(5);

      return result.map((row) => ({
        name: String(row.name),
        bookings: Number(row.bookings),
        revenue: Number(row.revenue),
      }));
    } catch (error) {
      console.error("Error getting top artists:", error);
      return [];
    }
  }

  async getPendingItems(): Promise<any[]> {
    try {
      const [pendingBookings, pendingContent] = await Promise.all([
        db
          .select()
          .from(bookings)
          .where(eq(bookings.status, "pending_approval"))
          .limit(10),
        db
          .select()
          .from(songs)
          .where(sql`status = 'pending_review'`)
          .limit(10),
      ]);

      return [
        ...pendingBookings.map((booking) => ({
          id: booking.id,
          type: "booking",
          title: booking.eventName,
          submittedAt: booking.createdAt,
          status: booking.status,
        })),
        ...pendingContent.map((song) => ({
          id: song.id,
          type: "content",
          title: song.title,
          submittedAt: song.createdAt,
          status: "pending_review",
        })),
      ];
    } catch (error) {
      console.error("Error getting pending items:", error);
      return [];
    }
  }

  async getContentForModeration(): Promise<any[]> {
    try {
      const [pendingSongs, pendingAlbums] = await Promise.all([
        db
          .select()
          .from(songs)
          .where(sql`status = 'pending_review'`)
          .limit(20),
        db
          .select()
          .from(albums)
          .where(sql`status = 'pending_review'`)
          .limit(20),
      ]);

      return [
        ...pendingSongs.map((song) => ({
          id: song.id,
          type: "song",
          title: song.title,
          artistUserId: song.artistUserId,
          createdAt: song.createdAt,
          status: "pending_review",
        })),
        ...pendingAlbums.map((album) => ({
          id: album.id,
          type: "album",
          title: album.title,
          artistUserId: album.artistUserId,
          createdAt: album.createdAt,
          status: "pending_review",
        })),
      ];
    } catch (error) {
      console.error("Error getting content for moderation:", error);
      return [];
    }
  }

  async getBookingApprovals(): Promise<any[]> {
    try {
      const result = await db
        .select({
          id: bookings.id,
          eventName: bookings.eventName,
          artistName: sql`COALESCE(artists.stage_names[1], CONCAT(users.first_name, ' ', users.last_name))`,
          bookerName: sql`CONCAT(booker.first_name, ' ', booker.last_name)`,
          eventDate: bookings.eventDate,
          eventTime: bookings.eventTime,
          venue: bookings.venueName,
          location: bookings.location,
          amount: bookings.totalAmount,
          commissionRate: sql`12`,
          status: bookings.status,
          submittedAt: bookings.createdAt,
          specialRequests: bookings.specialRequests,
          technicalRiderRequired: sql`CASE WHEN bookings.technical_rider_required THEN true ELSE false END`,
        })
        .from(bookings)
        .innerJoin(users, eq(bookings.primaryArtistUserId, users.id))
        .innerJoin(sql`users booker`, eq(bookings.bookerUserId, sql`booker.id`))
        .leftJoin(artists, eq(users.id, artists.user_id))
        .where(
          or(
            eq(bookings.status, "pending"),
            eq(bookings.status, "pending_approval"),
            eq(bookings.status, "approved"),
            eq(bookings.status, "declined")
          )
        )
        .orderBy(desc(bookings.createdAt));

      return result;
    } catch (error) {
      console.error("Error getting booking approvals:", error);
      return [];
    }
  }

  async getRecentTransactions(): Promise<any[]> {
    try {
      const result = await db
        .select({
          id: bookings.id,
          type: sql`'booking'`,
          amount: bookings.totalAmount,
          user: sql`CONCAT(users.first_name, ' ', users.last_name)`,
          date: bookings.createdAt,
          status: sql`CASE WHEN bookings.status = 'completed' THEN 'completed' ELSE 'pending' END`,
        })
        .from(bookings)
        .innerJoin(users, eq(bookings.bookerUserId, users.id))
        .orderBy(desc(bookings.createdAt))
        .limit(50);

      return result;
    } catch (error) {
      console.error("Error getting recent transactions:", error);
      return [];
    }
  }

  // All-Links subscription methods
  async getAllLinksSubscriptionByUserId(userId: number): Promise<any> {
    try {
      const { allLinksSubscriptions } = await import("@shared/schema");
      const [subscription] = await db
        .select()
        .from(allLinksSubscriptions)
        .where(eq(allLinksSubscriptions.userId, userId))
        .limit(1);
      return subscription || null;
    } catch (error) {
      console.error("Error getting subscription:", error);
      return null;
    }
  }

  async createAllLinksSubscription(subscription: any): Promise<any> {
    try {
      const { allLinksSubscriptions } = await import("@shared/schema");
      const [created] = await db
        .insert(allLinksSubscriptions)
        .values({
          ...subscription,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
      return created;
    } catch (error) {
      console.error("Error creating subscription:", error);
      throw error;
    }
  }

  async updateAllLinksSubscription(userId: number, updates: any): Promise<any> {
    try {
      const { allLinksSubscriptions } = await import("@shared/schema");
      const [updated] = await db
        .update(allLinksSubscriptions)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(allLinksSubscriptions.userId, userId))
        .returning();
      return updated;
    } catch (error) {
      console.error("Error updating subscription:", error);
      throw error;
    }
  }

  async getWebsiteBlocklist(): Promise<any[]> {
    try {
      const { websiteBlocklist } = await import("@shared/schema");
      return await db.select().from(websiteBlocklist);
    } catch (error) {
      console.error("Error getting blocklist:", error);
      return [];
    }
  }

  async createWebsiteBlocklistEntry(entry: any): Promise<any> {
    try {
      const { websiteBlocklist } = await import("@shared/schema");
      const [created] = await db
        .insert(websiteBlocklist)
        .values({
          ...entry,
          createdAt: new Date(),
        })
        .returning();
      return created;
    } catch (error) {
      console.error("Error creating blocklist entry:", error);
      throw error;
    }
  }

  async checkAndApplyPenalties(domain: string): Promise<void> {
    try {
      // Implementation for checking penalties - simplified for now
      console.log(`Checking penalties for domain: ${domain}`);
    } catch (error) {
      console.error("Error checking penalties:", error);
    }
  }

  async getUserIdByStripeSubscriptionId(
    subscriptionId: string
  ): Promise<number | null> {
    try {
      const { allLinksSubscriptions } = await import("@shared/schema");
      const [subscription] = await db
        .select()
        .from(allLinksSubscriptions)
        .where(eq(allLinksSubscriptions.stripeSubscriptionId, subscriptionId))
        .limit(1);
      return subscription?.userId || null;
    } catch (error) {
      console.error("Error getting user by subscription ID:", error);
      return null;
    }
  }

  async createOauthAccount(account: any): Promise<any> {
    try {
      const { oauthAccounts } = await import("@shared/schema");
      const [created] = await db
        .insert(oauthAccounts)
        .values({
          ...account,
          createdAt: new Date(),
        })
        .returning();
      return created;
    } catch (error) {
      console.error("Error creating oauth account:", error);
      throw error;
    }
  }

  async createFanSubscription(subscription: any): Promise<any> {
    try {
      const { fanSubscriptions } = await import("@shared/schema");
      const [created] = await db
        .insert(fanSubscriptions)
        .values({
          ...subscription,
          createdAt: new Date(),
        })
        .returning();
      return created;
    } catch (error) {
      console.error("Error creating fan subscription:", error);
      throw error;
    }
  }

  // ==================== ADMIN TALENT ASSIGNMENT METHODS ====================

  // Get admin talent assignments (real database queries only)
  async getAdminTalentAssignments(talentUserId?: number): Promise<any[]> {
    try {
      let query = sql`
        SELECT 
          ata.id,
          ata.admin_user_id,
          ata.talent_user_id,
          ata.assignment_type,
          ata.assigned_at,
          ata.is_active,
          admin_user.full_name as admin_name,
          admin_user.email as admin_email,
          talent_user.full_name as talent_name,
          talent_user.email as talent_email,
          p.primary_role
        FROM admin_talent_assignments ata
        JOIN users admin_user ON ata.admin_user_id = admin_user.id
        JOIN users talent_user ON ata.talent_user_id = talent_user.id
        LEFT JOIN professionals p ON admin_user.id = p.user_id
        WHERE ata.is_active = true
      `;

      if (talentUserId) {
        query = sql`
          SELECT 
            ata.id,
            ata.admin_user_id,
            ata.talent_user_id,
            ata.assignment_type,
            ata.assigned_at,
            ata.is_active,
            admin_user.full_name as admin_name,
            admin_user.email as admin_email,
            talent_user.full_name as talent_name,
            talent_user.email as talent_email,
            p.primary_role
          FROM admin_talent_assignments ata
          JOIN users admin_user ON ata.admin_user_id = admin_user.id
          JOIN users talent_user ON ata.talent_user_id = talent_user.id
          LEFT JOIN professionals p ON admin_user.id = p.user_id
          WHERE ata.is_active = true AND ata.talent_user_id = ${talentUserId}
        `;
      }

      const result = await db.execute(query);
      return result.rows;
    } catch (error) {
      console.error("Error fetching admin talent assignments:", error);
      return [];
    }
  }

  // Get management team for specific talent (real database query)
  async getManagementTeamForTalent(talentUserId: number): Promise<any[]> {
    try {
      const result = await db.execute(sql`
        SELECT 
          ata.id,
          admin_user.id as user_id,
          admin_user.full_name,
          admin_user.email,
          p.primary_role,
          ata.assignment_type,
          'management' as membership_type
        FROM admin_talent_assignments ata
        JOIN users admin_user ON ata.admin_user_id = admin_user.id
        LEFT JOIN professionals p ON admin_user.id = p.user_id
        WHERE ata.talent_user_id = ${talentUserId} 
          AND ata.is_active = true
          AND ata.assignment_type = 'management'
        ORDER BY p.primary_role
      `);
      return result.rows;
    } catch (error) {
      console.error("Error fetching management team:", error);
      return [];
    }
  }

  // Assign admin to talent (real database operation)
  async assignAdminToTalent(
    adminUserId: number,
    talentUserId: number,
    assignmentType: string
  ): Promise<any> {
    try {
      const result = await db.execute(sql`
        INSERT INTO admin_talent_assignments (admin_user_id, talent_user_id, assignment_type, assigned_at, is_active)
        VALUES (${adminUserId}, ${talentUserId}, ${assignmentType}, NOW(), true)
        ON CONFLICT (admin_user_id, talent_user_id) 
        DO UPDATE SET assignment_type = ${assignmentType}, is_active = true
        RETURNING *
      `);
      return result.rows[0];
    } catch (error) {
      console.error("Error assigning admin to talent:", error);
      throw error;
    }
  }

  // Remove admin talent assignment (real database operation)
  async removeAdminTalentAssignment(
    adminUserId: number,
    talentUserId: number
  ): Promise<boolean> {
    try {
      const result = await db.execute(sql`
        UPDATE admin_talent_assignments 
        SET is_active = false 
        WHERE admin_user_id = ${adminUserId} AND talent_user_id = ${talentUserId}
      `);
      return result.rowCount > 0;
    } catch (error) {
      console.error("Error removing admin talent assignment:", error);
      return false;
    }
  }

  // Primary talents management methods
  async getProfessionalPrimaryTalents(): Promise<
    UserProfessionalPrimaryTalent[]
  > {
    return await db
      .select()
      .from(userProfessionalPrimaryTalents)
      .orderBy(
        userProfessionalPrimaryTalents.sortOrder,
        userProfessionalPrimaryTalents.name
      );
  }

  //
  async createProfessionalPrimaryTalent(
    data: InsertUserProfessionalPrimaryTalent
  ): Promise<UserProfessionalPrimaryTalent> {
    const [primaryTalent] = await db
      .insert(userProfessionalPrimaryTalents)
      .values(data)
      .returning();
    return primaryTalent;
  }

  // Update a professional primary talent by ID
  async updateProfessionalPrimaryTalent(
    id: number,
    data: Partial<InsertUserProfessionalPrimaryTalent>
  ): Promise<UserProfessionalPrimaryTalent | null> {
    const [updatedTalent] = await db
      .update(userProfessionalPrimaryTalents)
      .set(data)
      .where(eq(userProfessionalPrimaryTalents.id, id))
      .returning();

    return updatedTalent || null;
  }

  // Delete a professional primary talent by ID
  async deleteProfessionalPrimaryTalent(id: number): Promise<boolean> {
    const result = await db
      .delete(userProfessionalPrimaryTalents)
      .where(eq(userProfessionalPrimaryTalents.id, id));

    return result > 0; // true if deleted, false if not found
  }

  async getDefaultProfessional() {
    const [professional] = await db
      .select({
        userId: users.id,
        fullName: users.fullName,
        email: users.email,
        talentId: userProfessionalPrimaryTalents.id,
        talentName: userProfessionalPrimaryTalents.name,
      })
      .from(userProfessionalPrimaryTalents)
      .innerJoin(
        professionals,
        eq(professionals.primaryTalentId, userProfessionalPrimaryTalents.id)
      )
      .innerJoin(users, eq(professionals.userId, users.id))
      .where(eq(userProfessionalPrimaryTalents.isDefault, true))
      .limit(1);

    return professional || null;
  }

  async getPrimaryTalentById(
    id: number
  ): Promise<{ id: number; name: string; player_name: string } | undefined> {
    // Use all_instruments table for artists and musicians
    const [primaryTalent] = await db
      .select({
        id: allInstruments.id,
        name: allInstruments.name,
        player_name: allInstruments.playerName,
      })
      .from(allInstruments)
      .where(eq(allInstruments.id, id));
    return primaryTalent;
  }

  async updatePrimaryTalent(
    id: number,
    data: Partial<UserPrimaryTalent>
  ): Promise<UserPrimaryTalent> {
    const [primaryTalent] = await db
      .update(userPrimaryTalents)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(userPrimaryTalents.id, id))
      .returning();
    return primaryTalent;
  }

  async deletePrimaryTalent(id: number): Promise<void> {
    await db.delete(userPrimaryTalents).where(eq(userPrimaryTalents.id, id));
  }

  async getPrimaryTalentsByRoleId(
    roleId: number
  ): Promise<UserPrimaryTalent[]> {
    return await db
      .select()
      .from(userPrimaryTalents)
      .where(eq(userPrimaryTalents.userTypeId, roleId))
      .orderBy(userPrimaryTalents.sortOrder, userPrimaryTalents.name);
  }

  // Secondary talents management methods
  async getUserSecondaryPerformanceTalents(
    userId: number
  ): Promise<Array<{ talentName: string }>> {
    return await db
      .select({
        talentName: userSecondaryPerformanceTalents.talentName,
      })
      .from(userSecondaryPerformanceTalents)
      .where(eq(userSecondaryPerformanceTalents.userId, userId));
  }

  async getUserSecondaryProfessionalTalents(
    userId: number
  ): Promise<Array<{ talentName: string }>> {
    return await db
      .select({
        talentName: userSecondaryProfessionalTalents.talentName,
      })
      .from(userSecondaryProfessionalTalents)
      .where(eq(userSecondaryProfessionalTalents.userId, userId));
  }

  // ================== SETLIST MANAGEMENT METHODS ==================

  // ================== SONG SEARCH METHODS ==================

  async searchSongs(query: string): Promise<Song[]> {
    try {
      return await db
        .select()
        .from(songs)
        .where(
          or(
            sql`LOWER(${songs.title}) LIKE LOWER(${"%" + query + "%"})`,
            sql`LOWER(${songs.artistName}) LIKE LOWER(${"%" + query + "%"})`
          )
        )
        .limit(50);
    } catch (error) {
      console.error("Error searching songs:", error);
      return [];
    }
  }

  async getSongByYoutubeId(youtubeId: string): Promise<Song | undefined> {
    try {
      const [song] = await db
        .select()
        .from(songs)
        .where(eq(songs.youtubeId, youtubeId))
        .limit(1);
      return song;
    } catch (error) {
      console.error("Error getting song by YouTube ID:", error);
      return undefined;
    }
  }

  // ================== ENHANCED BOOKING ASSIGNMENT METHODS ==================

  async getAllInstruments(activeOnly?: boolean): Promise<AllInstrument[]> {
    let query = db.select().from(allInstruments);

    if (activeOnly) {
      query = query.where(eq(allInstruments.isActive, true));
    }

    return await query.orderBy(
      allInstruments.displayPriority,
      allInstruments.name
    );
  }

  async getInstrumentsByMixerGroup(
    mixerGroup: string
  ): Promise<AllInstrument[]> {
    return await db
      .select()
      .from(allInstruments)
      .where(
        and(
          eq(allInstruments.mixerGroup, mixerGroup),
          eq(allInstruments.isActive, true)
        )
      )
      .orderBy(allInstruments.displayPriority, allInstruments.name);
  }

  async createAllInstrument(
    instrument: InsertAllInstrument
  ): Promise<AllInstrument> {
    const [created] = await db
      .insert(allInstruments)
      .values(instrument)
      .returning();
    return created;
  }

  async createBookingAssignmentMember(
    assignment: InsertBookingAssignmentsMember
  ): Promise<BookingAssignmentsMember> {
    const [created] = await db
      .insert(bookingAssignmentsMembers)
      .values(assignment)
      .returning();
    return created;
  }

  async getBookingAssignmentDetails(assignmentId: number) {
    const [assignment] = await db
      .select({
        id: bookingAssignmentsMembers.id,
        bookingId: bookingAssignmentsMembers.bookingId,
        userId: bookingAssignmentsMembers.userId,
        userFullName: users.fullName,
        roleInBooking: bookingAssignmentsMembers.roleInBooking,
        roleName: rolesManagement.name,
        assignmentType: bookingAssignmentsMembers.assignmentType,
        selectedTalent: bookingAssignmentsMembers.selectedTalent,
        isMainBookedTalent: bookingAssignmentsMembers.isMainBookedTalent,
        assignedGroup: bookingAssignmentsMembers.assignedGroup,
        assignedChannelPair: bookingAssignmentsMembers.assignedChannelPair,
        assignedChannel: bookingAssignmentsMembers.assignedChannel,
        status: bookingAssignmentsMembers.status,
        assignedAt: bookingAssignmentsMembers.assignedAt,
      })
      .from(bookingAssignmentsMembers)
      .innerJoin(users, eq(bookingAssignmentsMembers.userId, users.id))
      .innerJoin(rolesManagement, eq(bookingAssignmentsMembers.roleInBooking, rolesManagement.id))
      .where(eq(bookingAssignmentsMembers.id, assignmentId))
      .limit(1);

    return assignment;
  }

  async getBookingAssignmentMembers(bookingId: number): Promise<any[]> {
    const result = await db
      .select({
        id: bookingAssignmentsMembers.id,
        bookingId: bookingAssignmentsMembers.bookingId,
        userId: bookingAssignmentsMembers.userId,
        roleInBooking: bookingAssignmentsMembers.roleInBooking,
        selectedTalent: bookingAssignmentsMembers.selectedTalent,
        instrumentId: bookingAssignmentsMembers.selectedTalent.as("instrumentId"),
        assignedGroup: bookingAssignmentsMembers.assignedGroup,
        assignedChannelPair: bookingAssignmentsMembers.assignedChannelPair,
        assignedChannel: bookingAssignmentsMembers.assignedChannel,
        isMainBookedTalent: bookingAssignmentsMembers.isMainBookedTalent,
        assignedBy: bookingAssignmentsMembers.assignedBy,
        assignedAt: bookingAssignmentsMembers.assignedAt,
        createdAt: bookingAssignmentsMembers.createdAt,

        user: {
          id: users.id,
          fullName: users.fullName,
          email: users.email,
        },

        role: {
          id: rolesManagement.id,
          name: rolesManagement.name,
        },

        instrument: {
          id: allInstruments.id,
          name: allInstruments.name,
          playerName: allInstruments.playerName,
          mixerGroup: allInstruments.mixerGroup,
        },
      })
      .from(bookingAssignmentsMembers)
      .innerJoin(users, eq(bookingAssignmentsMembers.userId, users.id))
      .innerJoin(rolesManagement, eq(bookingAssignmentsMembers.roleInBooking, rolesManagement.id))
      .leftJoin(allInstruments, eq(bookingAssignmentsMembers.selectedTalent, allInstruments.id))
      .where(eq(bookingAssignmentsMembers.bookingId, bookingId))
      .orderBy(desc(bookingAssignmentsMembers.isMainBookedTalent));

    return result;
  }


  async getBookingAssignmentMember(
    id: number
  ): Promise<BookingAssignmentsMember | undefined> {
    const [member] = await db
      .select()
      .from(bookingAssignmentsMembers)
      .where(eq(bookingAssignmentsMembers.id, id));
    return member;
  }

  async updateBookingAssignmentMember(
    id: number,
    updates: Partial<BookingAssignmentsMember>
  ): Promise<BookingAssignmentsMember | undefined> {
    const [updated] = await db
      .update(bookingAssignmentsMembers)
      .set(updates)
      .where(eq(bookingAssignmentsMembers.id, id))
      .returning();
    return updated;
  }

  async removeBookingAssignmentMember(id: number): Promise<void> {
    await db
      .delete(bookingAssignmentsMembers)
      .where(eq(bookingAssignmentsMembers.id, id));
  }

  async assignUserToBooking(
    bookingId: number,
    userId: number,
    roleId: number,
    instrumentId: number | null,
    assignedBy: number,
    isMainTalent: boolean = false
  ): Promise<BookingAssignmentsMember> {
    // Prepare assignment data
    const assignmentData: InsertBookingAssignmentsMember = {
      bookingId,
      userId,
      roleInBookingId: roleId,
      instrumentId,
      isMainTalent,
      assignedBy,
      assignedAt: new Date(),
      createdAt: new Date(),
    };

    // If instrument is specified, get mixer channel assignment
    if (instrumentId) {
      const instrument = await db
        .select()
        .from(allInstruments)
        .where(eq(allInstruments.id, instrumentId))
        .limit(1);
      if (instrument.length > 0) {
        assignmentData.assignedGroup = instrument[0].mixerGroup;
        // Auto-assign channel based on group logic - this could be enhanced with actual channel allocation
      }
    }

    const [created] = await db
      .insert(bookingAssignmentsMembers)
      .values(assignmentData)
      .returning();
    return created;
  }

  // MediaHub Document Management Methods
  async getBookingDocuments(bookingId: number): Promise<any[]> {
    const docs = await db
      .select({
        id: mediaHubDocuments.id,
        bookingId: mediaHubDocuments.bookingId,
        fileName: mediaHubDocuments.fileName,
        fileType: mediaHubDocuments.fileType,
        fileSize: mediaHubDocuments.fileSize,
        filePath: mediaHubDocuments.filePath,
        uploadedBy: mediaHubDocuments.uploadedBy,
        visibility: mediaHubDocuments.visibility,
        description: mediaHubDocuments.description,
        uploadedAt: mediaHubDocuments.uploadedAt,
        uploader: {
          id: users.id,
          fullName: users.fullName,
          email: users.email,
        },
      })
      .from(mediaHubDocuments)
      .innerJoin(users, eq(mediaHubDocuments.uploadedBy, users.id))
      .where(eq(mediaHubDocuments.bookingId, bookingId))
      .orderBy(desc(mediaHubDocuments.uploadedAt));

    return docs;
  }

  async isUserAssignedToBooking(
    userId: number,
    bookingId: number
  ): Promise<boolean> {
    const assignments = await db
      .select()
      .from(bookingAssignmentsMembers)
      .where(
        and(
          eq(bookingAssignmentsMembers.bookingId, bookingId),
          eq(bookingAssignmentsMembers.userId, userId)
        )
      );

    return assignments.length > 0;
  }

  async hasDocumentPermission(
    documentId: number,
    userId: number
  ): Promise<boolean> {
    const [permission] = await db
      .select()
      .from(documentPermissions)
      .where(
        and(
          eq(documentPermissions.documentId, documentId),
          eq(documentPermissions.userId, userId),
          eq(documentPermissions.canView, true)
        )
      );

    return !!permission;
  }

  async userHasBookingAccess(
    userId: number,
    bookingId: number
  ): Promise<boolean> {
    // Check if user is assigned to booking
    const isAssigned = await this.isUserAssignedToBooking(userId, bookingId);
    if (isAssigned) return true;

    // Check if user is booker
    const [booking] = await db
      .select()
      .from(bookings)
      .where(and(eq(bookings.id, bookingId), eq(bookings.bookerId, userId)));

    if (booking) return true;

    // Check if user is admin (roleId 1 or 2)
    const [user] = await db.select().from(users).where(eq(users.id, userId));

    return user && (user.roleId === 1 || user.roleId === 2);
  }

  async createBookingDocument(document: any): Promise<any> {
    const [created] = await db
      .insert(mediaHubDocuments)
      .values({
        bookingId: document.bookingId,
        fileName: document.fileName,
        fileType: document.fileType,
        fileSize: document.fileSize,
        filePath: document.filePath,
        uploadedBy: document.uploadedBy,
        visibility: document.visibility || "admin_controlled",
        description: document.description,
        uploadedAt: new Date(),
      })
      .returning();

    return created;
  }

  async updateDocumentVisibility(
    documentId: number,
    visibility: string,
    permissions: any[]
  ): Promise<any> {
    // Update document visibility
    const [updated] = await db
      .update(mediaHubDocuments)
      .set({ visibility })
      .where(eq(mediaHubDocuments.id, documentId))
      .returning();

    // Clear existing permissions
    await db
      .delete(documentPermissions)
      .where(eq(documentPermissions.documentId, documentId));

    // Add new permissions
    if (permissions && permissions.length > 0) {
      const permissionRecords = permissions.map((perm) => ({
        documentId,
        userId: perm.userId,
        canView: perm.canView,
        canDownload: perm.canDownload,
        grantedBy: perm.grantedBy,
        grantedAt: new Date(),
      }));

      await db.insert(documentPermissions).values(permissionRecords);
    }

    return updated;
  }

  async getDocument(documentId: number): Promise<any | undefined> {
    const [doc] = await db
      .select()
      .from(mediaHubDocuments)
      .where(eq(mediaHubDocuments.id, documentId));

    return doc;
  }

  async deleteDocument(documentId: number): Promise<boolean> {
    // Delete permissions first
    await db
      .delete(documentPermissions)
      .where(eq(documentPermissions.documentId, documentId));

    // Delete document
    const result = await db
      .delete(mediaHubDocuments)
      .where(eq(mediaHubDocuments.id, documentId));

    return true;
  }
}

export const storage = new DatabaseStorage();
