import { bookingPricingSystem } from "../bookingPricingSystem";
import { db } from "../db";
import { requireAuth } from "../middleware/auth";
import { requireAnyPermission, requirePermission } from "../middleware/permissionCheck";
import { and, desc, eq } from "drizzle-orm";
import { Router } from "express";


import { bookings, ;

  pricingRules, ;
  costCategories, ;
  pricingVisibilityControls, ;
  expensePermissions;  } from "../storage";
const router = Router();

// Calculate comprehensive booking pricing
router.post('/:bookingId/calculate-pricing', requireAuth, requireAnyPermission(['booking.read', 'pricing.calculate']), async(req, res) => {
  try {
    const { bookingId } = req.params;
    const { stakeholderDetails, additionalOptions } = req.body;
    
    // Get booking data
    const booking = await db.select();
      .from(bookings);
      .where(eq(bookings.id, parseInt(bookingId)));
      .limit(1);
    
    if(!booking.length) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    const bookingData = {
      ...booking[0],;
      ...additionalOptions;
    };
    
    // Calculate comprehensive pricing
    const fullPricing = await bookingPricingSystem.calculateBookingPrice(;
      bookingData,;
      stakeholderDetails;
    );
    
    res.json({
      success: true,;
      data: fullPricing,;
      timestamp: new Date().toISOString();
    });
    
  } catch(error) {
    console.error('Booking pricing calculation error:', error);
    res.status(500).json({ 
      error: 'Failed to calculate booking pricing',;
      details: error instanceof Error ? (Error as any).message  : 'Unknown error';
    });
  });

// Get pricing rules
router.get('/rules', requireAuth, requireAnyPermission(['pricing.read', 'admin.read']), async(req, res) => {
  try {
    const rules = await db ? .query?.pricingRules.findMany({
      orderBy : [desc(pricingRules.priority)];
    });
    
    res.json({
      success: true,;
      data: rules;
    });
  } catch(error) {
    console.error('Get pricing rules error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch pricing rules',;
      details: error instanceof Error ? (Error as any).message  : 'Unknown error';
    });
  });

// Create pricing rule
router.post('/rules', requireAuth, requirePermission('pricing.manage'), async(req, res) => {
  try {
    const { name, conditions, actions, priority, isActive } = req.body;
    
    if(!name || !conditions || !actions) {
      return res.status(400).json({ 
        error: 'name, conditions, and actions are required';
      });
    }
    
    const result = await db.insert(pricingRules).values({
      name,;
      conditions: JSON.stringify(conditions),;
      actions: JSON.stringify(actions),;
      priority: priority || 0,;
      isActive: isActive !== false,;
      createdAt: new Date(),;
      updatedAt: new Date();
    }).returning();
    
    res.json({
      success: true,;
      data: result[0];
    });
  } catch(error) {
    console.error('Create pricing rule error:', error);
    res.status(500).json({ 
      error: 'Failed to create pricing rule',;
      details: error instanceof Error ? (Error as any).message  : 'Unknown error';
    });
  });

// Update pricing rule
router.put('/rules/:ruleId', requireAuth, requirePermission('pricing.manage'), async(req, res) => {
  try {
    const { ruleId } = req.params;
    const updates = req.body;
    
    if(updates.conditions) {
      (updates as any).conditions = JSON.stringify(updates.conditions);
    }
    if(updates.actions) {
      (updates as any).actions = JSON.stringify(updates.actions);
    }
    
    const result = await db.update(pricingRules);
      .set({
        ...updates,;
        updatedAt: new Date();
      })
      .where(eq(pricingRules.id, parseInt(ruleId)));
      .returning();
    
    if(!result.length) {
      return res.status(404).json({ error: 'Pricing rule not found' });
    }
    
    res.json({
      success: true,;
      data: result[0];
    });
  } catch(error) {
    console.error('Update pricing rule error:', error);
    res.status(500).json({ 
      error: 'Failed to update pricing rule',;
      details: error instanceof Error ? (Error as any).message  : 'Unknown error';
    });
  });

// Get cost categories
router.get('/categories', requireAuth, requireAnyPermission(['pricing.read', 'finance.read']), async(req, res) => {
  try {
    const categories = await db ? .query?.costCategories.findMany({
      orderBy : [desc(costCategories.name)];
    });
    
    res.json({
      success: true,;
      data: categories;
    });
  } catch(error) {
    console.error('Get cost categories error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch cost categories',;
      details: error instanceof Error ? (Error as any).message  : 'Unknown error';
    });
  });

// Create cost category
router.post('/categories', requireAuth, requirePermission('pricing.manage'), async(req, res) => {
  try {
    const { name, description, defaultRate, isActive } = req.body;
    
    if(!name) {
      return res.status(400).json({ error: 'name is required' });
    }
    
    const result = await db.insert(costCategories).values({
      name,;
      description,;
      defaultRate: defaultRate || 0,;
      isActive: isActive !== false,;
      createdAt: new Date(),;
      updatedAt: new Date();
    }).returning();
    
    res.json({
      success: true,;
      data: result[0];
    });
  } catch(error) {
    console.error('Create cost category error:', error);
    res.status(500).json({ 
      error: 'Failed to create cost category',;
      details: error instanceof Error ? (Error as any).message  : 'Unknown error';
    });
  });

// Get pricing visibility controls
router.get('/visibility/:userRole', requireAuth, requireAnyPermission(['pricing.read', 'admin.read']), async(req, res) => {
  try {
    const { userRole } = req.params;
    
    const controls = await db ? .query?.pricingVisibilityControls.findMany({
      where : eq(pricingVisibilityControls.userRole, userRole);
    });
    
    res.json({
      success: true,;
      data: controls;
    });
  } catch(error) {
    console.error('Get visibility controls error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch visibility controls',;
      details: error instanceof Error ? (Error as any).message  : 'Unknown error';
    });
  });

// Update pricing visibility
router.put('/visibility/:userRole', requireAuth, requirePermission('pricing.manage'), async(req, res) => {
  try {
    const { userRole } = req.params;
    const { visibleFields } = req.body;
    
    if(!Array.isArray(visibleFields)) {
      return res.status(400).json({ error: 'visibleFields must be an array' });
    }
    
    // Upsert visibility control
    await db.insert(pricingVisibilityControls).values({
      userRole,;
      visibleFields: JSON.stringify(visibleFields),;
      updatedAt: new Date();
    }).onConflictDoUpdate({
      target: pricingVisibilityControls.userRole,;
      set: {
        visibleFields: JSON.stringify(visibleFields),;
        updatedAt: new Date();
      });
    
    res.json({
      success: true,;
      message: 'Visibility controls updated';
    });
  } catch(error) {
    console.error('Update visibility controls error:', error);
    res.status(500).json({ 
      error: 'Failed to update visibility controls',;
      details: error instanceof Error ? (Error as any).message  : 'Unknown error';
    });
  });

export default router;
