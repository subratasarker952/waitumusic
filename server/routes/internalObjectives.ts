/**
 * Internal Objectives API Routes
 * Handles API endpoints for internal booking objectives system
 */

import { Router, Request, Response } from 'express';
import { internalBookingObjectivesSystem } from '../internalBookingObjectivesSystem';
// Note: authenticateToken middleware would be imported in real implementation

const router = Router();

/**
 * Get internal objectives for a booking
 * Only accessible to admin/superadmin/managed talent
 */
router.get('/booking/:bookingId', async (req: Request, res: Response) => {
  try {
    const bookingId = parseInt(req.params.bookingId);
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const objectives = await internalBookingObjectivesSystem.getInternalObjectives(
      bookingId,
      user.role,
      user.userId
    );

    res.json({
      success: true,
      objectives,
      note: 'These objectives are confidential and hidden from bookers'
    });
  } catch (error) {
    console.error('Error fetching internal objectives:', error);
    res.status(403).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Access denied'
    });
  }
});

/**
 * Create new internal objective
 */
router.post('/create', async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const objectiveData = {
      ...req.body,
      createdBy: user.userId
    };

    const objective = await internalBookingObjectivesSystem.createInternalObjective(
      objectiveData,
      user.role
    );

    res.json({
      success: true,
      objective,
      message: 'Internal objective created successfully'
    });
  } catch (error) {
    console.error('Error creating internal objective:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create objective'
    });
  }
});

/**
 * Update objective status
 */
router.patch('/:objectiveId/status', async (req: Request, res: Response) => {
  try {
    const objectiveId = parseInt(req.params.objectiveId);
    const { status } = req.body;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const updatedObjective = await internalBookingObjectivesSystem.updateObjectiveStatus(
      objectiveId,
      status,
      user.userId,
      user.role
    );

    res.json({
      success: true,
      objective: updatedObjective,
      message: 'Objective status updated successfully'
    });
  } catch (error) {
    console.error('Error updating objective status:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update objective'
    });
  }
});

/**
 * Get objective templates
 */
router.get('/templates', async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const templates = await internalBookingObjectivesSystem.getObjectiveTemplates();

    res.json({
      success: true,
      templates
    });
  } catch (error) {
    console.error('Error fetching objective templates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch objective templates'
    });
  }
});

/**
 * Generate automatic objectives for managed artists
 */
router.post('/auto-generate', async (req: Request, res: Response) => {
  try {
    const { bookingId, artistUserId, bookingType, artistManagedStatus } = req.body;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const objectives = await internalBookingObjectivesSystem.generateAutomaticObjectives(
      bookingId,
      artistUserId,
      bookingType,
      artistManagedStatus
    );

    res.json({
      success: true,
      objectives,
      message: `Generated ${objectives.length} automatic objectives for managed artist`
    });
  } catch (error) {
    console.error('Error generating automatic objectives:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate objectives'
    });
  }
});

/**
 * Get objectives report for booking
 */
router.get('/booking/:bookingId/report', async (req: Request, res: Response) => {
  try {
    const bookingId = parseInt(req.params.bookingId);
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Only allow admin/superadmin to access reports
    if (!['superadmin', 'admin'].includes(user.role)) {
      return res.status(403).json({ error: 'Access denied - Admin privileges required' });
    }

    const report = await internalBookingObjectivesSystem.generateObjectivesReport(bookingId);

    res.json({
      success: true,
      report,
      bookingId
    });
  } catch (error) {
    console.error('Error generating objectives report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate objectives report'
    });
  }
});

export default router;