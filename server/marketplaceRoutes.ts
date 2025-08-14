/**
 * OppHub Marketplace Routes
 * Real opportunity marketplace with user submissions and applications
 */
import type { Express, Request, Response } from "express";
import { storage } from "./storage";
import { requireRole, ROLE_GROUPS } from '@shared/authorization-middleware';
import * as schema from "@shared/schema";
import { and, desc, eq, gte, like, or, sql } from "drizzle-orm";
import { db } from "./db";
import { z } from "zod";

// Opportunity submission schema
const opportunitySubmissionSchema = z.object({
  title: z.string().min(10).max(200),
  description: z.string().min(50).max(2000),
  organizationName: z.string().min(2).max(100),
  contactEmail: z.string().email(),
  contactPhone: z.string().optional(),
  website: z.string().url().optional(),
  location: z.string().min(2).max(100),
  deadline: z.string().transform((str) => new Date(str)),
  compensationType: z.enum(['paid', 'unpaid', 'revenue_share', 'experience']),
  amount: z.string().optional(),
  requirements: z.string().min(20).max(1000),
  applicationProcess: z.string().min(20).max(1000),
  categoryId: z.number(),
  tags: z.array(z.string()).optional(),
  isRemote: z.boolean().default(false),
  submitterNotes: z.string().optional()
});

// Application submission schema
const applicationSchema = z.object({
  opportunityId: z.number(),
  coverLetter: z.string().min(100).max(2000),
  portfolioLinks: z.array(z.string().url()).optional(),
  experience: z.string().min(50).max(1000),
  availability: z.string().min(10).max(500),
  additionalNotes: z.string().optional()
});

export function registerMarketplaceRoutes(app: Express) {
  
  // Get all opportunities with filtering and pagination
  app.get("/api/marketplace/opportunities", async (req: Request, res: Response) => {
    try {
      const { 
        category, 
        location, 
        compensationType, 
        search, 
        page = '1', 
        limit = '20',
        isRemote 
      } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;

      let query = db
        .select({
          id: schema.opportunities.id,
          title: schema.opportunities.title,
          description: schema.opportunities.description,
          organizationName: schema.opportunities.organizerName,
          location: schema.opportunities.location,
          deadline: schema.opportunities.applicationDeadline,
          compensationType: schema.opportunities.compensationType,
          amount: schema.opportunities.compensationAmount,
          isRemote: schema.opportunities.isRemote,
          createdAt: schema.opportunities.createdAt,
          status: schema.opportunities.status,
          categoryName: schema.opportunityCategories.name,
          applicationCount: schema.opportunities.applicationCount
        })
        .from(schema.opportunities)
        .leftJoin(schema.opportunityCategories, eq(schema.opportunities.categoryId, schema.opportunityCategories.id))
        .where(eq(schema.opportunities.status, 'active'))
        .orderBy(desc(schema.opportunities.createdAt))
        .limit(limitNum)
        .offset(offset);

      // Apply filters
      const conditions = [eq(schema.opportunities.status, 'active')];
      
      if (category) {
        conditions.push(eq(schema.opportunities.categoryId, parseInt(category as string)));
      }
      
      if (location) {
        conditions.push(like(schema.opportunities.location, `%${location}%`));
      }
      
      if (compensationType) {
        conditions.push(eq(schema.opportunities.compensationType, compensationType as string));
      }
      
      if (isRemote === 'true') {
        conditions.push(eq(schema.opportunities.isRemote, true));
      }
      
      if (search) {
        conditions.push(
          or(
            like(schema.opportunities.title, `%${search}%`),
            like(schema.opportunities.description, `%${search}%`),
            like(schema.opportunities.organizerName, `%${search}%`)
          )
        );
      }

      if (conditions.length > 1) {
        query = query.where(and(...conditions));
      }

      const opportunities = await query;
      
      // Get total count for pagination
      const totalCount = await db
        .select({ count: schema.opportunities.id })
        .from(schema.opportunities)
        .where(conditions.length > 1 ? and(...conditions) : conditions[0]);

      res.json({
        opportunities,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: totalCount.length,
          totalPages: Math.ceil(totalCount.length / limitNum)
        }
      });
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      res.status(500).json({ message: "Failed to fetch opportunities" });
    }
  });

  // Get single opportunity with full details
  app.get("/api/marketplace/opportunities/:id", async (req: Request, res: Response) => {
    try {
      const opportunityId = parseInt(req.params.id);
      
      const opportunity = await db
        .select()
        .from(schema.opportunities)
        .where(eq(schema.opportunities.id, opportunityId))
        .limit(1);

      if (!opportunity.length) {
        return res.status(404).json({ message: "Opportunity not found" });
      }

      res.json(opportunity[0]);
    } catch (error) {
      console.error('Error fetching opportunity:', error);
      res.status(500).json({ message: "Failed to fetch opportunity" });
    }
  });

  // Submit new opportunity (authenticated users only)
  app.post("/api/marketplace/opportunities", async (req: Request, res: Response) => {
    try {
      const opportunityData = opportunitySubmissionSchema.parse(req.body);
      
      // Create opportunity with pending status
      const newOpportunity = await db
        .insert(schema.opportunities)
        .values({
          title: opportunityData.title,
          description: opportunityData.description,
          organizerName: opportunityData.organizationName,
          organizerEmail: opportunityData.contactEmail,
          organizerWebsite: opportunityData.website || null,
          location: opportunityData.location,
          applicationDeadline: opportunityData.deadline,
          compensationType: opportunityData.compensationType,
          compensationAmount: opportunityData.amount || null,
          requirements: { text: opportunityData.requirements },
          submissionGuidelines: opportunityData.applicationProcess,
          categoryId: opportunityData.categoryId,
          isRemote: opportunityData.isRemote,
          status: 'pending_review',
          createdBy: req.user?.userId || null,
          isDemo: true,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();

      res.status(201).json({
        message: "Opportunity submitted successfully and is pending review",
        opportunity: newOpportunity[0]
      });
    } catch (error) {
      console.error('Error creating opportunity:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create opportunity" });
      }
    }
  });

  // Apply to opportunity (authenticated users only)
  app.post("/api/marketplace/applications", async (req: Request, res: Response) => {
    try {
      const applicationData = applicationSchema.parse(req.body);
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Check if user already applied
      const existingApplication = await db
        .select()
        .from(schema.opportunityApplications)
        .where(
          and(
            eq(schema.opportunityApplications.opportunityId, applicationData.opportunityId),
            eq(schema.opportunityApplications.applicantUserId, userId)
          )
        )
        .limit(1);

      if (existingApplication.length > 0) {
        return res.status(400).json({ message: "You have already applied to this opportunity" });
      }

      // Create application
      const newApplication = await db
        .insert(schema.opportunityApplications)
        .values({
          opportunityId: applicationData.opportunityId,
          applicantUserId: userId,
          coverLetter: applicationData.coverLetter,
          portfolioLinks: applicationData.portfolioLinks,
          experience: applicationData.experience,
          availability: applicationData.availability,
          additionalNotes: applicationData.additionalNotes,
          status: 'submitted',
          appliedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();

      // Update opportunity application count using raw SQL for proper increment
      await db.execute(sql`
        UPDATE opportunities 
        SET application_count = COALESCE(application_count, 0) + 1,
            updated_at = NOW()
        WHERE id = ${applicationData.opportunityId}
      `);

      res.status(201).json({
        message: "Application submitted successfully",
        application: newApplication[0]
      });
    } catch (error) {
      console.error('Error creating application:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to submit application" });
      }
    }
  });

  // Get user's applications
  app.get("/api/marketplace/my-applications", async (req: Request, res: Response) => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const applications = await db
        .select({
          id: schema.opportunityApplications.id,
          opportunityTitle: schema.opportunities.title,
          organizationName: schema.opportunities.organizationName,
          status: schema.opportunityApplications.status,
          submittedAt: schema.opportunityApplications.submittedAt,
          coverLetter: schema.opportunityApplications.coverLetter
        })
        .from(schema.opportunityApplications)
        .innerJoin(schema.opportunities, eq(schema.opportunityApplications.opportunityId, schema.opportunities.id))
        .where(eq(schema.opportunityApplications.applicantUserId, userId))
        .orderBy(desc(schema.opportunityApplications.submittedAt));

      res.json(applications);
    } catch (error) {
      console.error('Error fetching applications:', error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  // Get opportunity categories
  app.get("/api/marketplace/categories", async (req: Request, res: Response) => {
    try {
      const categories = await db
        .select()
        .from(schema.opportunityCategories)
        .where(eq(schema.opportunityCategories.isActive, true))
        .orderBy(schema.opportunityCategories.name);

      res.json(categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Admin: Approve/reject pending opportunities
  app.patch("/api/marketplace/admin/opportunities/:id/status", requireRole(ROLE_GROUPS.ADMIN_ONLY), async (req: Request, res: Response) => {
    try {
      const opportunityId = parseInt(req.params.id);
      const { status, adminNotes } = req.body;

      if (!['active', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      await db
        .update(schema.opportunities)
        .set({ 
          status, 
          reviewedBy: req.user?.userId,
          reviewedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(schema.opportunities.id, opportunityId));

      res.json({ message: `Opportunity ${status} successfully` });
    } catch (error) {
      console.error('Error updating opportunity status:', error);
      res.status(500).json({ message: "Failed to update opportunity" });
    }
  });

  // Admin: Get pending opportunities
  app.get("/api/marketplace/admin/pending", requireRole(ROLE_GROUPS.ADMIN_ONLY), async (req: Request, res: Response) => {
    try {
      const pendingOpportunities = await db
        .select()
        .from(schema.opportunities)
        .where(eq(schema.opportunities.status, 'pending_review'))
        .orderBy(desc(schema.opportunities.createdAt));

      res.json(pendingOpportunities);
    } catch (error) {
      console.error('Error fetching pending opportunities:', error);
      res.status(500).json({ message: "Failed to fetch pending opportunities" });
    }
  });
}