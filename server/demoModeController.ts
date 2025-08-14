// Demo Mode Controller - Controls live vs demo data visibility
import { db } from './db';
import { users, artists, songs, albums, bookings } from '@shared/schema';
import { eq, and, or } from 'drizzle-orm';

export class DemoModeController {
  private static instance: DemoModeController;
  private isDemoMode: boolean = true; // Default to demo mode

  private constructor() {
    // Load demo mode setting from environment or database
    this.isDemoMode = process.env.DEMO_MODE_ENABLED !== 'false';
  }

  public static getInstance(): DemoModeController {
    if (!DemoModeController.instance) {
      DemoModeController.instance = new DemoModeController();
    }
    return DemoModeController.instance;
  }

  public isDemoModeEnabled(): boolean {
    return this.isDemoMode;
  }

  public setDemoMode(enabled: boolean): void {
    this.isDemoMode = enabled;
    console.log(`🔧 Demo mode ${enabled ? 'enabled' : 'disabled'}`);
  }

  // Filter users based on demo mode
  public async getUsers() {
    if (this.isDemoMode) {
      // Demo mode: return only demo users
      return await db.select().from(users).where(eq(users.isDemo, true));
    } else {
      // Live mode: return only live users
      return await db.select().from(users).where(eq(users.isDemo, false));
    }
  }

  // Filter artists based on demo mode
  public async getArtists() {
    if (this.isDemoMode) {
      // Demo mode: return artists whose users are marked as demo
      return await db.select({
        userId: artists.userId,
        stageNames: artists.stageNames,
        primaryGenre: artists.primaryGenre,
        secondaryGenres: artists.secondaryGenres,
        topGenres: artists.topGenres,
        socialMediaHandles: artists.socialMediaHandles,
        basePrice: artists.basePrice,
        managementTierId: artists.managementTierId,
        isManaged: artists.isManaged,
        bookingFormPictureUrl: artists.bookingFormPictureUrl,
        performingRightsOrganization: artists.performingRightsOrganization,
        ipiNumber: artists.ipiNumber,
        technicalRiderProfile: artists.technicalRiderProfile
      })
      .from(artists)
      .innerJoin(users, eq(artists.userId, users.id))
      .where(eq(users.isDemo, true));
    } else {
      // Live mode: return artists whose users are NOT marked as demo
      return await db.select({
        userId: artists.userId,
        stageNames: artists.stageNames,
        primaryGenre: artists.primaryGenre,
        secondaryGenres: artists.secondaryGenres,
        topGenres: artists.topGenres,
        socialMediaHandles: artists.socialMediaHandles,
        basePrice: artists.basePrice,
        managementTierId: artists.managementTierId,
        isManaged: artists.isManaged,
        bookingFormPictureUrl: artists.bookingFormPictureUrl,
        performingRightsOrganization: artists.performingRightsOrganization,
        ipiNumber: artists.ipiNumber,
        technicalRiderProfile: artists.technicalRiderProfile
      })
      .from(artists)
      .innerJoin(users, eq(artists.userId, users.id))
      .where(eq(users.isDemo, false));
    }
  }

  // Filter songs based on demo mode
  public async getSongs() {
    if (this.isDemoMode) {
      return await db.select()
        .from(songs)
        .innerJoin(users, eq(songs.artistUserId, users.id))
        .where(eq(users.isDemo, true));
    } else {
      return await db.select()
        .from(songs)
        .innerJoin(users, eq(songs.artistUserId, users.id))
        .where(eq(users.isDemo, false));
    }
  }

  // Filter albums based on demo mode
  public async getAlbums() {
    if (this.isDemoMode) {
      return await db.select()
        .from(albums)
        .innerJoin(users, eq(albums.artistUserId, users.id))
        .where(eq(users.isDemo, true));
    } else {
      return await db.select()
        .from(albums)
        .innerJoin(users, eq(albums.artistUserId, users.id))
        .where(eq(users.isDemo, false));
    }
  }

  // Filter bookings based on demo mode
  public async getBookings() {
    if (this.isDemoMode) {
      // Demo mode: return bookings where either booker or artist is demo
      return await db.select()
        .from(bookings)
        .leftJoin(users, or(
          eq(bookings.bookerUserId, users.id),
          eq(bookings.primaryArtistUserId, users.id)
        ))
        .where(eq(users.isDemo, true));
    } else {
      // Live mode: return bookings where neither booker nor artist is demo
      const liveBookings = await db.select()
        .from(bookings)
        .leftJoin(users, or(
          eq(bookings.bookerUserId, users.id),
          eq(bookings.primaryArtistUserId, users.id)
        ))
        .where(eq(users.isDemo, false));
      
      // Also include guest bookings (where bookerUserId is null)
      const guestBookings = await db.select()
        .from(bookings)
        .innerJoin(users, eq(bookings.primaryArtistUserId, users.id))
        .where(and(
          eq(bookings.isGuestBooking, true),
          eq(users.isDemo, false)
        ));
      
      return [...liveBookings, ...guestBookings];
    }
  }

  // Get current mode status for API
  public getStatus() {
    return {
      demoMode: this.isDemoMode,
      message: this.isDemoMode 
        ? 'Demo mode enabled - showing demo data' 
        : 'Live mode enabled - showing authentic artist data',
      availableArtists: this.isDemoMode ? 'Demo accounts' : 'Live managed artists'
    };
  }

  // Toggle demo mode
  public toggleDemoMode(): boolean {
    this.isDemoMode = !this.isDemoMode;
    return this.isDemoMode;
  }
}

export const demoModeController = DemoModeController.getInstance();