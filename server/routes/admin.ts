import { Router } from 'express';
import { requireAuth, type AuthenticatedRequest } from '../middleware/authMiddleware';
import { requirePermission } from '../middleware/permissionCheck';
import { db } from '../db';
import { users, artists, musicians, professionals, bookings, songs, albums } from '@shared/schema';
import { eq, desc, count, and } from 'drizzle-orm';

const router = Router();

// Apply authentication to all admin routes
router.use(requireAuth);

// Admin dashboard stats
router.get('/stats', requirePermission('admin.dashboard.view'), async (req: AuthenticatedRequest, res) => {
  try {
    const [userCount] = await db.select({ count: count() }).from(users);
    const [artistCount] = await db.select({ count: count() }).from(artists);
    const [musicianCount] = await db.select({ count: count() }).from(musicians);
    const [professionalCount] = await db.select({ count: count() }).from(professionals);
    const [bookingCount] = await db.select({ count: count() }).from(bookings);
    const [songCount] = await db.select({ count: count() }).from(songs);
    const [albumCount] = await db.select({ count: count() }).from(albums);

    res.json({
      users: userCount.count,
      artists: artistCount.count,
      musicians: musicianCount.count,
      professionals: professionalCount.count,
      bookings: bookingCount.count,
      songs: songCount.count,
      albums: albumCount.count
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: 'Failed to fetch statistics' });
  }
});

// User management
router.get('/users', requirePermission('admin.users.view'), async (req: AuthenticatedRequest, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const userList = await db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);

    const [totalCount] = await db.select({ count: count() }).from(users);

    res.json({
      users: userList,
      total: totalCount.count,
      page,
      limit,
      totalPages: Math.ceil(totalCount.count / limit)
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// Update user role
router.patch('/users/:id/role', requirePermission('admin.users.edit'), async (req: AuthenticatedRequest, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { roleId } = req.body;

    if (!userId || !roleId) {
      return res.status(400).json({ message: 'User ID and role ID are required' });
    }

    await db
      .update(users)
      .set({ roleId })
      .where(eq(users.id, userId));

    res.json({ message: 'User role updated successfully' });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ message: 'Failed to update user role' });
  }
});

// Content management
router.get('/pending-content', requirePermission('admin.content.view'), async (req: AuthenticatedRequest, res) => {
  try {
    // Fetch pending songs
    const pendingSongs = await db
      .select()
      .from(songs)
      .where(eq(songs.status, 'pending'))
      .orderBy(desc(songs.createdAt));

    // Fetch pending albums
    const pendingAlbums = await db
      .select()
      .from(albums)
      .where(eq(albums.status, 'pending'))
      .orderBy(desc(albums.createdAt));

    res.json({
      songs: pendingSongs,
      albums: pendingAlbums
    });
  } catch (error) {
    console.error('Error fetching pending content:', error);
    res.status(500).json({ message: 'Failed to fetch pending content' });
  }
});

// Approve content
router.patch('/content/:type/:id/approve', requirePermission('admin.content.approve'), async (req: AuthenticatedRequest, res) => {
  try {
    const { type, id } = req.params;
    const contentId = parseInt(id);

    if (type === 'song') {
      await db
        .update(songs)
        .set({ status: 'approved' })
        .where(eq(songs.id, contentId));
    } else if (type === 'album') {
      await db
        .update(albums)
        .set({ status: 'approved' })
        .where(eq(albums.id, contentId));
    } else {
      return res.status(400).json({ message: 'Invalid content type' });
    }

    res.json({ message: `${type} approved successfully` });
  } catch (error) {
    console.error('Error approving content:', error);
    res.status(500).json({ message: 'Failed to approve content' });
  }
});

// Reject content
router.patch('/content/:type/:id/reject', requirePermission('admin.content.approve'), async (req: AuthenticatedRequest, res) => {
  try {
    const { type, id } = req.params;
    const contentId = parseInt(id);
    const { reason } = req.body;

    if (type === 'song') {
      await db
        .update(songs)
        .set({ 
          status: 'rejected',
          rejectionReason: reason
        })
        .where(eq(songs.id, contentId));
    } else if (type === 'album') {
      await db
        .update(albums)
        .set({ 
          status: 'rejected',
          rejectionReason: reason
        })
        .where(eq(albums.id, contentId));
    } else {
      return res.status(400).json({ message: 'Invalid content type' });
    }

    res.json({ message: `${type} rejected successfully` });
  } catch (error) {
    console.error('Error rejecting content:', error);
    res.status(500).json({ message: 'Failed to reject content' });
  }
});

export default router;