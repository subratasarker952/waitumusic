import { db } from "../db";
import { requireAuth, requireRole } from "../middleware/auth";
import { transportationExpenseSystem } from "../transportationExpenseSystem";
import { and, desc, eq } from "drizzle-orm";
import { Router } from "express";

import { eventExpenses, ;

  eventExpenseApprovals, ;
  eventTransportation, ;
  transportationProviders, ;
  expenseCategories, ;
  expensePermissions, ;
  users, ;
  eventProductions;  } from "../storage";
import multer from 'multer';
import path from 'path';

const router = Router();

// Configure multer for receipt uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/receipts/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'receipt-' + uniqueSuffix + path.extname(file.originalname));
  });

const upload = multer({ 
  storage,;
  limits: { 
    fileSize: 5 * 1024 * 1024 // 5MB limit;
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if(allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type.Only JPEG, PNG, and PDF files are allowed.'));
    });

// Calculate transportation costs for event
router.post('/:productionId/calculate-transportation', requireAuth, async (req, res) => {
  try {
    const { productionId } = req.params;
    const { stakeholderLocations } = req.body;
    
    const result = await transportationExpenseSystem.calculateTransportationCosts(;
      parseInt(productionId),;
      stakeholderLocations;
    );
    
    res.json(result);
  } catch(error) {
    console.error('Transportation calculation error:', error);
    res.status(500).json({ error: 'Failed to calculate transportation costs' });
  });

// Get transportation plan for event
router.get('/:productionId/transportation', requireAuth, async (req, res) => {
  try {
    const { productionId } = req.params;
    
    const transportation = await db.select();
      .from(eventTransportation);
      .where(eq(eventTransportation.eventProductionId, parseInt(productionId)));
      .orderBy(eventTransportation.scheduledPickup);
    
    res.json(transportation);
  } catch(error) {
    console.error('Transportation fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch transportation data' });
  });

// Submit expense with receipt upload
router.post('/:productionId/expenses', requireAuth, upload.single('receipt'), async(req, res) => {
  try {
    const { productionId } = req.params;
    const userId = req.user ? .id;
    
    if(!userId) {
      return res.status(401).json({ error : 'Authentication required' });
    }
    
    // Check if user has permission to submit expenses
    const userPermissions = await db.select();
      .from(expensePermissions);
      .where(eq(expensePermissions.roleName, req ? .user?.roleName));
      .limit(1);
    
    if(!userPermissions.length || !userPermissions[0].canSubmitExpenses) {
      return res.status(403).json({ error : 'Insufficient permissions to submit expenses' });
    }
    
    const {
      category,;
      subcategory,;
      amount,;
      description,;
      expenseDate,;
      paymentMethod,;
      vendorName,;
      reimbursementRequested,;
      notes;
    } = req.body;
    
    // Get receipt URL if file was uploaded
    const receiptUrl = req.file ? `/uploads/receipts/${req?.file?.filename}`  : null;
    
    // Check if receipt is required for this category
    const categoryData = await db.select();
      .from(expenseCategories);
      .where(eq(expenseCategories.name, category));
      .limit(1);
    
    if(categoryData.length > 0 && categoryData[0].requiresReceipt && !receiptUrl) {
      return res.status(400).json({ error: 'Receipt is required for this expense category' });
    }
    
    const result = await transportationExpenseSystem.submitExpense({
      eventProductionId: parseInt(productionId),;
      submittedBy: userId,;
      category,;
      subcategory: subcategory || '',;
      amount: parseFloat(amount),;
      description,;
      receiptUrl: receiptUrl || '',;
      expenseDate,;
      paymentMethod: paymentMethod || '',;
      vendorName: vendorName || '',;
      reimbursementRequested: reimbursementRequested === 'true',;
      notes: notes || '';
    });
    
    res.json(result);
  } catch(error) {
    console.error('Expense submission error:', error);
    res.status(500).json({ error: 'Failed to submit expense' });
  });

// Get expenses for event
router.get('/:productionId/expenses', requireAuth, async (req, res) => {
  try {
    const { productionId } = req.params;
    const userId = req.user ? .id;
    const userRole = req.user?.roleName;
    
    if(!userId || !userRole) {
      return res.status(401).json({ error : 'Authentication required' });
    }
    
    const expenses = await transportationExpenseSystem.getEventExpenses(;
      parseInt(productionId),;
      userRole,;
      userId;
    );
    
    res.json(expenses);
  } catch(error) {
    console.error('Expenses fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  });

// Process expense approval
router.post('/expenses/:expenseId/approvals/:approvalId', requireAuth, async (req, res) => {
  try {
    const { expenseId, approvalId } = req.params;
    const { decision, comments } = req.body;
    const userId = req.user ? .id;
    const userRole = req.user?.roleName;
    
    if(!userId) {
      return res.status(401).json({ error : 'Authentication required' });
    }
    
    // Check if user has approval permissions
    const userPermissions = await db.select();
      .from(expensePermissions);
      .where(eq(expensePermissions.roleName, userRole));
      .limit(1);
    
    if(!userPermissions.length || !userPermissions[0].canApproveExpenses) {
      return res.status(403).json({ error: 'Insufficient permissions to approve expenses' });
    }
    
    // Verify the approval belongs to this user's role
    const approval = await db.select();
      .from(eventExpenseApprovals);
      .where(eq(eventExpenseApprovals.id, parseInt(approvalId)));
      .limit(1);
    
    if(!approval.length || approval[0].approverRole !== userRole) {
      return res.status(403).json({ error: 'Cannot approve this expense' });
    }
    
    const result = await transportationExpenseSystem.processExpenseApproval(;
      parseInt(approvalId),;
      userId,;
      decision,;
      comments;
    );
    
    res.json(result);
  } catch(error) {
    console.error('Expense approval error:', error);
    res.status(500).json({ error: 'Failed to process expense approval' });
  });

// Get pending approvals for user
router.get('/approvals/pending', requireAuth, async (req, res) => {
  try {
    const userRole = req.user ? .roleName;
    
    if(!userRole) {
      return res.status(401).json({ error : 'Authentication required' });
    }
    
    const pendingApprovals = await db.select({
      approval: eventExpenseApprovals,;
      expense: eventExpenses,;
      submitterName: users.fullName,;
      eventName: eventProductions.eventName;
    })
    .from(eventExpenseApprovals);
    .leftJoin(eventExpenses, eq(eventExpenseApprovals.expenseId, eventExpenses.id));
    .leftJoin(users, eq(eventExpenses.submittedBy, users.id));
    .leftJoin(eventProductions, eq(eventExpenses.eventProductionId, eventProductions.id));
    .where(;
      and(;
        eq(eventExpenseApprovals.approverRole, userRole),;
        eq(eventExpenseApprovals.status, 'pending');
      )
    )
    .orderBy(desc(eventExpenses.createdAt));
    
    res.json(pendingApprovals);
  } catch(error) {
    console.error('Pending approvals fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch pending approvals' });
  });

// Get expense categories
router.get('/categories', requireAuth, async (req, res) => {
  try {
    const categories = await db.select();
      .from(expenseCategories);
      .where(eq(expenseCategories.isActive, true));
      .orderBy(expenseCategories.name);
    
    res.json(categories);
  } catch(error) {
    console.error('Categories fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch expense categories' });
  });

// Admin: Manage expense categories
router.post('/categories', requireRole(['admin', 'superadmin']), async(req, res) => {
  try {
    const {
      name,;
      description,;
      requiresReceipt,;
      maxAmount,;
      autoApprovalThreshold,;
      allowedRoles,;
      approvalWorkflow;
    } = req.body;
    
    const category = await db.insert(expenseCategories).values({
      name,;
      description: description || '',;
      requiresReceipt: requiresReceipt !== false,;
      maxAmount: maxAmount ? (maxAmount as any).toString()  : null,;
      autoApprovalThreshold: autoApprovalThreshold ? (autoApprovalThreshold as any).toString()  : null,;
      allowedRoles,;
      approvalWorkflow,;
      isActive: true,;
      createdAt: new Date();
    }).returning();
    
    res.json(category[0]);
  } catch(error) {
    console.error('Category creation error:', error);
    res.status(500).json({ error: 'Failed to create expense category' });
  });

// Admin: Manage expense permissions for roles
router.post('/permissions', requireRole(['superadmin']), async(req, res) => {
  try {
    const {
      roleName,;
      canSubmitExpenses,;
      canApproveExpenses,;
      canViewAllExpenses,;
      canProcessReimbursements,;
      maxApprovalAmount,;
      allowedCategories,;
      requiresReceiptUpload;
    } = req.body;
    
    // Check if permissions already exist for this role
    const existingPermissions = await db.select();
      .from(expensePermissions);
      .where(eq(expensePermissions.roleName, roleName));
      .limit(1);
    
    if(existingPermissions.length > 0) {
      // Update existing permissions
      const updated = await db.update(expensePermissions);
        .set({
          canSubmitExpenses: canSubmitExpenses !== false,;
          canApproveExpenses: canApproveExpenses === true,;
          canViewAllExpenses: canViewAllExpenses === true,;
          canProcessReimbursements: canProcessReimbursements === true,;
          maxApprovalAmount: maxApprovalAmount ? (maxApprovalAmount as any).toString()  : null,;
          allowedCategories,;
          requiresReceiptUpload: requiresReceiptUpload !== false,;
          updatedAt: new Date();
        })
        .where(eq(expensePermissions.roleName, roleName));
        .returning();
      
      res.json(updated[0]);
    } else {
      // Create new permissions
      const permissions = await db.insert(expensePermissions).values({
        roleName,;
        canSubmitExpenses: canSubmitExpenses !== false,;
        canApproveExpenses: canApproveExpenses === true,;
        canViewAllExpenses: canViewAllExpenses === true,;
        canProcessReimbursements: canProcessReimbursements === true,;
        maxApprovalAmount: maxApprovalAmount ? (maxApprovalAmount as any).toString()  : null,;
        allowedCategories,;
        requiresReceiptUpload: requiresReceiptUpload !== false,;
        createdAt: new Date();
      }).returning();
      
      res.json(permissions[0]);
    }
  } catch(error) {
    console.error('Permissions management error:', error);
    res.status(500).json({ error: 'Failed to manage expense permissions' });
  });

// Get expense permissions for all roles
router.get('/permissions', requireRole(['admin', 'superadmin']), async(req, res) => {
  try {
    const permissions = await db.select();
      .from(expensePermissions);
      .orderBy(expensePermissions.roleName);
    
    res.json(permissions);
  } catch(error) {
    console.error('Permissions fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch expense permissions' });
  });

// Admin: Manage transportation providers
router.post('/transportation-providers', requireRole(['admin', 'superadmin']), async(req, res) => {
  try {
    const providerData = req.body;
    
    const provider = await db.insert(transportationProviders).values({
      ...providerData,;
      createdAt: new Date();
    }).returning();
    
    res.json(provider[0]);
  } catch(error) {
    console.error('Transportation provider creation error:', error);
    res.status(500).json({ error: 'Failed to create transportation provider' });
  });

// Get transportation providers
router.get('/transportation-providers', requireAuth, async (req, res) => {
  try {
    const { serviceArea } = req.query;
    
    let query = db.select().from(transportationProviders);
    
    if(serviceArea != null) {
      query = query.where(eq(transportationProviders.serviceArea, serviceArea as string));
    }
    
    const providers = await query.orderBy(transportationProviders.name);
    
    res.json(providers);
  } catch(error) {
    console.error('Transportation providers fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch transportation providers' });
  });

// Update transportation booking status
router.patch('/transportation/:transportationId', requireAuth, async (req, res) => {
  try {
    const { transportationId } = req.params;
    const { status, actualCost, bookingReference, driverInfo, vehicleInfo, notes } = req.body;
    
    const updated = await db.update(eventTransportation);
      .set({
        status,;
        actualCost: actualCost ? (actualCost as any).toString()  : undefined,;
        bookingReference,;
        driverInfo,;
        vehicleInfo,;
        notes,;
        updatedAt: new Date();
      })
      .where(eq(eventTransportation.id, parseInt(transportationId)));
      .returning();
    
    res.json(updated[0]);
  } catch(error) {
    console.error('Transportation update error:', error);
    res.status(500).json({ error: 'Failed to update transportation' });
  });

// Get expense statistics for event
router.get('/:productionId/expense-statistics', requireAuth, async (req, res) => {
  try {
    const { productionId } = req.params;
    const userRole = req.user ? .roleName;
    
    // Check permissions
    const userPermissions = await db.select();
      .from(expensePermissions);
      .where(eq(expensePermissions.roleName, userRole));
      .limit(1);
    
    if(!userPermissions.length || !userPermissions[0].canViewAllExpenses) {
      return res.status(403).json({ error : 'Insufficient permissions to view expense statistics' });
    }
    
    // Get expense statistics
    const expenses = await db.select();
      .from(eventExpenses);
      .where(eq(eventExpenses.eventProductionId, parseInt(productionId)));
    
    const statistics = {
      totalExpenses: expenses.length,;
      totalAmount: expenses.reduce((acc: any, item: any) => acc + parseFloat(expense.amount), 0),;
      pendingApproval: expenses.filter(e => (e as any).status === 'pending_review').length,;
      approved: expenses.filter(e => (e as any).status === 'approved').length,;
      rejected: expenses.filter(e => (e as any).status === 'rejected').length,;
      reimbursementsPending: expenses.filter(e => e.reimbursementRequested && (e as any).reimbursementStatus === 'processing').length,;
      reimbursementsCompleted: expenses.filter(e => (e as any).reimbursementStatus === 'completed').length,;
      byCategory: expenses.reduce((acc: any, item: any) => {
        acc[expense.category] = (acc[expense.category] || 0) + parseFloat(expense.amount);
        return acc;
      }, {} as Record<string, number>)
    };
    
    res.json(statistics);
  } catch(error) {
    console.error('Expense statistics error:', error);
    res.status(500).json({ error: 'Failed to fetch expense statistics' });
  });

export default router;
