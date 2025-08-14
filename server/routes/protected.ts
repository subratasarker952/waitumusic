import { Router } from 'express';
import { requireAuth, type AuthenticatedRequest } from '../middleware/authMiddleware';
import { requirePermission, requireAnyPermission } from '../middleware/permissionCheck';
import { db } from '../db';
import { bookings, songs, albums, splitsheets, contracts, technicalRiders } from '@shared/schema';
import { eq, desc, and } from 'drizzle-orm';

const router = Router();

// Apply authentication to all protected routes
router.use(requireAuth);

// Booking management routes
router.get('/bookings', requireAnyPermission(['booking.view', 'booking.own.view']), async (req: AuthenticatedRequest, res) => {
  try {
    const userBookings = await db
      .select()
      .from(bookings)
      .where(
        req.user?.roleId === 1 || req.user?.roleId === 2 
          ? undefined // Admin/Superadmin can see all
          : eq(bookings.primaryTalentUserId, req.user!.id)
      )
      .orderBy(desc(bookings.createdAt));

    res.json(userBookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
});

router.post('/bookings', requirePermission('booking.create'), async (req: AuthenticatedRequest, res) => {
  try {
    const [newBooking] = await db
      .insert(bookings)
      .values({
        ...req.body,
        primaryTalentUserId: req.user!.id,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    res.status(201).json(newBooking);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Failed to create booking' });
  }
});

// Content management routes
router.get('/songs', requireAnyPermission(['content.view', 'content.own.view']), async (req: AuthenticatedRequest, res) => {
  try {
    const userSongs = await db
      .select()
      .from(songs)
      .where(
        req.user?.roleId === 1 || req.user?.roleId === 2 
          ? undefined // Admin/Superadmin can see all
          : eq(songs.userId, req.user!.id)
      )
      .orderBy(desc(songs.createdAt));

    res.json(userSongs);
  } catch (error) {
    console.error('Error fetching songs:', error);
    res.status(500).json({ message: 'Failed to fetch songs' });
  }
});

router.post('/songs', requirePermission('content.create'), async (req: AuthenticatedRequest, res) => {
  try {
    const [newSong] = await db
      .insert(songs)
      .values({
        ...req.body,
        userId: req.user!.id,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    res.status(201).json(newSong);
  } catch (error) {
    console.error('Error creating song:', error);
    res.status(500).json({ message: 'Failed to create song' });
  }
});

// Splitsheet management routes
router.get('/splitsheets', requireAnyPermission(['splitsheet.view', 'splitsheet.own.view']), async (req: AuthenticatedRequest, res) => {
  try {
    const userSplitsheets = await db
      .select()
      .from(splitsheets)
      .where(
        req.user?.roleId === 1 || req.user?.roleId === 2 
          ? undefined // Admin/Superadmin can see all
          : eq(splitsheets.createdBy, req.user!.id)
      )
      .orderBy(desc(splitsheets.createdAt));

    res.json(userSplitsheets);
  } catch (error) {
    console.error('Error fetching splitsheets:', error);
    res.status(500).json({ message: 'Failed to fetch splitsheets' });
  }
});

router.post('/splitsheets', requirePermission('splitsheet.create'), async (req: AuthenticatedRequest, res) => {
  try {
    const [newSplitsheet] = await db
      .insert(splitsheets)
      .values({
        ...req.body,
        createdBy: req.user!.id,
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    res.status(201).json(newSplitsheet);
  } catch (error) {
    console.error('Error creating splitsheet:', error);
    res.status(500).json({ message: 'Failed to create splitsheet' });
  }
});

// Contract management routes
router.get('/contracts', requireAnyPermission(['contract.view', 'contract.own.view']), async (req: AuthenticatedRequest, res) => {
  try {
    const userContracts = await db
      .select()
      .from(contracts)
      .where(
        req.user?.roleId === 1 || req.user?.roleId === 2 
          ? undefined // Admin/Superadmin can see all
          : eq(contracts.createdBy, req.user!.id)
      )
      .orderBy(desc(contracts.createdAt));

    res.json(userContracts);
  } catch (error) {
    console.error('Error fetching contracts:', error);
    res.status(500).json({ message: 'Failed to fetch contracts' });
  }
});

// Technical rider management routes
router.get('/technical-riders', requireAnyPermission(['rider.view', 'rider.own.view']), async (req: AuthenticatedRequest, res) => {
  try {
    const userRiders = await db
      .select()
      .from(technicalRiders)
      .where(
        req.user?.roleId === 1 || req.user?.roleId === 2 
          ? undefined // Admin/Superadmin can see all
          : eq(technicalRiders.createdBy, req.user!.id)
      )
      .orderBy(desc(technicalRiders.createdAt));

    res.json(userRiders);
  } catch (error) {
    console.error('Error fetching technical riders:', error);
    res.status(500).json({ message: 'Failed to fetch technical riders' });
  }
});

export default router;