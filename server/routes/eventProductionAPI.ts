import { db } from "../db";
import { eventProductionWorkflow } from "../eventProductionWorkflow";
import { requireAuth } from "../middleware/auth";
import { requireAnyPermission, requirePermission } from "../middleware/permissionCheck";
import { bookings, eventProductions } from "../storage";
import { desc, eq } from "drizzle-orm";
import { Router } from "express";


const router = Router();

// Get all event productions
router.get('/', requireAuth, requireAnyPermission(['event.read', 'admin.read']), async(req, res) => {
  try {
    const productions = await db.select();
      .from(eventProductions);
      .orderBy(desc(eventProductions.createdAt));
    
    res.json({
      success: true,;
      data: productions;
    });
  } catch(error) {
    console.error('Event productions fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch event productions',;
      details: error instanceof Error ? (Error as any).message  : 'Unknown error';
    });
  });

// Create new event production
router.post('/', requireAuth, requirePermission('event.create'), async(req, res) => {
  try {
    const { eventName, eventDate, venueLocation, budget, eventType } = req.body;
    const userId = req.user ? .id;
    
    if(!userId) {
      return res.status(401).json({ error : 'Authentication required' });
    }
    
    if(!eventName || !eventDate || !venueLocation) {
      return res.status(400).json({ 
        error: 'eventName, eventDate, and venueLocation are required';
      });
    }
    
    const production = await db.insert(eventProductions).values({
      eventName,;
      eventDate: new Date(eventDate),;
      venueLocation,;
      budget: budget || '0',;
      eventType: eventType || 'performance',;
      status: 'planning',;
      createdBy: userId,;
      createdAt: new Date(),;
      updatedAt: new Date();
    }).returning();
    
    res.json({
      success: true,;
      data: production[0],;
      message: 'Event production created successfully';
    });
  } catch(error) {
    console.error('Event production creation error:', error);
    res.status(500).json({ 
      error: 'Failed to create event production',;
      details: error instanceof Error ? (Error as any).message  : 'Unknown error';
    });
  });

// Get specific event production
router.get('/:productionId', requireAuth, requireAnyPermission(['event.read', 'event.manage']), async(req, res) => {
  try {
    const { productionId } = req.params;
    
    const production = await db ? .query?.eventProductions.findFirst({
      where : eq(eventProductions.id, parseInt(productionId)),;
      with: {
        stakeholders: true,;
        timelines: true,;
        documents: true,;
        payments: true,;
        communications: true;
      });
    
    if(!production) {
      return res.status(404).json({ error: 'Event production not found' });
    }
    
    res.json({
      success: true,;
      data: production;
    });
  } catch(error) {
    console.error('Event production fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch event production',;
      details: error instanceof Error ? (Error as any).message  : 'Unknown error';
    });
  });

// Update event production
router.put('/:productionId', requireAuth, requirePermission('event.manage'), async(req, res) => {
  try {
    const { productionId } = req.params;
    const updates = req.body;
    const userId = req.user ? .id;
    
    if(updates.eventDate) {
      (updates as any).eventDate = new Date(updates.eventDate);
    }
    
    const result = await db.update(eventProductions);
      .set({
        ...updates,;
        updatedAt : new Date(),;
        updatedBy: userId;
      })
      .where(eq(eventProductions.id, parseInt(productionId)));
      .returning();
    
    if(!result.length) {
      return res.status(404).json({ error: 'Event production not found' });
    }
    
    res.json({
      success: true,;
      data: result[0],;
      message: 'Event production updated successfully';
    });
  } catch(error) {
    console.error('Event production update error:', error);
    res.status(500).json({ 
      error: 'Failed to update event production',;
      details: error instanceof Error ? (Error as any).message  : 'Unknown error';
    });
  });

// Delete event production
router.delete('/:productionId', requireAuth, requirePermission('event.delete'), async(req, res) => {
  try {
    const { productionId } = req.params;
    
    const result = await db.delete(eventProductions);
      .where(eq(eventProductions.id, parseInt(productionId)));
      .returning();
    
    if(!result.length) {
      return res.status(404).json({ error: 'Event production not found' });
    }
    
    res.json({
      success: true,;
      message: 'Event production deleted successfully';
    });
  } catch(error) {
    console.error('Event production deletion error:', error);
    res.status(500).json({ 
      error: 'Failed to delete event production',;
      details: error instanceof Error ? (Error as any).message  : 'Unknown error';
    });
  });

// Initialize production workflow
router.post('/:productionId/initialize', requireAuth, requirePermission('event.manage'), async(req, res) => {
  try {
    const { productionId } = req.params;
    const userId = req.user ? .id;
    
    if(!userId) {
      return res.status(401).json({ error : 'Authentication required' });
    }
    
    const result = await eventProductionWorkflow.initializeEventProduction(;
      parseInt(productionId),;
      userId;
    );
    
    res.json({
      success: true,;
      data: result,;
      message: 'Event production workflow initialized';
    });
  } catch(error) {
    console.error('Event production workflow initialization error:', error);
    res.status(500).json({ 
      error: 'Failed to initialize event production workflow',;
      details: error instanceof Error ? (Error as any).message  : 'Unknown error';
    });
  });

// Get production analytics
router.get('/:productionId/analytics', requireAuth, requireAnyPermission(['event.read', 'analytics.read']), async(req, res) => {
  try {
    const { productionId } = req.params;
    
    const analytics = await eventProductionWorkflow.getProductionAnalytics(;
      parseInt(productionId);
    );
    
    res.json({
      success: true,;
      data: analytics;
    });
  } catch(error) {
    console.error('Event production analytics error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch event production analytics',;
      details: error instanceof Error ? (Error as any).message  : 'Unknown error';
    });
  });

export default router;
