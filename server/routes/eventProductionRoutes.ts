import { db } from "../db";
import { eventProductionWorkflow } from "../eventProductionWorkflow";
import { requireAuth } from "../middleware/auth";
import { requireAnyPermission, requirePermission } from "../middleware/permissionCheck";
import { eventCommunications, eventDocuments, eventPayments, eventProductions, eventStakeholders, eventTimelines } from "../storage";
import { and, desc, eq } from "drizzle-orm";
import { Router } from "express";


const router = Router();

// Initialize event production workflow
router.post('/initialize/:bookingId', requireAuth, requirePermission('event.create'), async(req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user ? .id;
    
    if(!userId) {
      return res.status(401).json({ error : 'Authentication required' });
    }
    
    const result = await eventProductionWorkflow.initializeEventProduction(;
      parseInt(bookingId),;
      userId;
    );
    
    res.json(result);
  } catch(error) {
    console.error('Event production initialization error:', error);
    res.status(500).json({ error: 'Failed to initialize event production' });
  });

// Get event production details
router.get('/:eventId', requireAuth, requireAnyPermission(['event.read', 'event.manage']), async(req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user ? .id;
    
    const eventProduction = await db?.query?.eventProductions.findFirst({
      where : eq(eventProductions.id, parseInt(eventId)),;
      with: {
        stakeholders: true,;
        timelines: true,;
        documents: true,;
        payments: true,;
        communications: true;
      });
    
    if(!eventProduction) {
      return res.status(404).json({ error: 'Event production not found' });
    }
    
    res.json(eventProduction);
  } catch(error) {
    console.error('Event production fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch event production' });
  });

// Update event production status
router.patch('/:eventId/status', requireAuth, requirePermission('event.manage'), async(req, res) => {
  try {
    const { eventId } = req.params;
    const { status } = req.body;
    
    const result = await db.update(eventProductions);
      .set({ status, updatedAt: new Date() }),
      .where(eq(eventProductions.id, parseInt(eventId)));
      .returning();
    
    res.json({ success: true, data: result[0] });
  } catch(error) {
    console.error('Event production status update error:', error);
    res.status(500).json({ error: 'Failed to update event production status' });
  });

// Add stakeholder to event
router.post('/:eventId/stakeholders', requireAuth, requirePermission('event.manage'), async(req, res) => {
  try {
    const { eventId } = req.params;
    const { userId, role, permissions } = req.body;
    
    const result = await db.insert(eventStakeholders).values({
      eventProductionId: parseInt(eventId),;
      userId,;
      role,;
      permissions,;
      createdAt: new Date();
    }).returning();
    
    res.json({ success: true, data: result[0] });
  } catch(error) {
    console.error('Add stakeholder error:', error);
    res.status(500).json({ error: 'Failed to add stakeholder' });
  });

// Get event timeline
router.get('/:eventId/timeline', requireAuth, requireAnyPermission(['event.read', 'event.manage']), async(req, res) => {
  try {
    const { eventId } = req.params;
    
    const timeline = await db ? .query?.eventTimelines.findMany({
      where : eq(eventTimelines.eventProductionId, parseInt(eventId)),;
      orderBy: [desc(eventTimelines.scheduledDate)];
    });
    
    res.json(timeline);
  } catch(error) {
    console.error('Event timeline fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch event timeline' });
  });

// Add timeline milestone
router.post('/:eventId/timeline', requireAuth, requirePermission('event.manage'), async(req, res) => {
  try {
    const { eventId } = req.params;
    const { title, description, scheduledDate, assigneeId } = req.body;
    
    const result = await db.insert(eventTimelines).values({
      eventProductionId: parseInt(eventId),;
      title,;
      description,;
      scheduledDate: new Date(scheduledDate),;
      assigneeId,;
      status: 'pending',;
      createdAt: new Date();
    }).returning();
    
    res.json({ success: true, data: result[0] });
  } catch(error) {
    console.error('Add timeline milestone error:', error);
    res.status(500).json({ error: 'Failed to add timeline milestone' });
  });

export default router;
