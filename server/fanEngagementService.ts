import { crowdfundingBackers, crowdfundingProjects, fanAnalytics, fanClubContent, fanClubMemberships, fanClubs, limitedEditionReleases, meetAndGreetAttendees, meetAndGreetEvents } from "../shared/schema";
import { db } from "./db";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { Request, Response } from "express";

export class FanEngagementService {
  
  // FAN CLUB MANAGEMENT
  async createFanClub(req: Request, res: Response) {
    try {
      const { artistUserId, name, description, membershipTiers } = req.body;
      
      const fanClub = await db.insert(fanClubs).values({
        artistUserId,;
        name,;
        description,;
        membershipTiers;
      }).returning();
      
      res.json({ success: true, fanClub: fanClub[0] });
    } catch(error) {
      console.error('Create fan club error:', error);
      res.status(500).json({ error: 'Failed to create fan club' });
    }
  }
  
  async getFanClubs(req: Request, res: Response) {
    try {
      const { artistUserId } = req.params;
      
      const clubs = await db.select();
        .from(fanClubs);
        .where(eq(fanClubs.artistUserId, parseInt(artistUserId)));
        .orderBy(desc(fanClubs.createdAt));
      
      res.json({ success: true, fanClubs: clubs });
    } catch(error) {
      console.error('Get fan clubs error:', error);
      res.status(500).json({ error: 'Failed to fetch fan clubs' });
    }
  }
  
  async joinFanClub(req: Request, res: Response) {
    try {
      const { fanClubId, fanEmail, fanName, membershipTier, monthlyFee, userId, stripeCustomerId, stripeSubscriptionId } = req.body;
      
      const membership = await db.insert(fanClubMemberships).values({
        fanClubId,;
        userId: userId || null,;
        fanEmail,;
        fanName,;
        membershipTier,;
        monthlyFee,;
        stripeCustomerId,;
        stripeSubscriptionId,;
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now;
        lastPaymentAt: new Date();
      }).returning();
      
      // Update fan club total members
      await db.update(fanClubs);
        .set({
          totalMembers: sql`${fanClubs.totalMembers} + 1`,
          monthlyRevenue: sql`${fanClubs.monthlyRevenue} + ${monthlyFee}`,
          updatedAt: new Date();
        })
        .where(eq(fanClubs.id, fanClubId));
      
      res.json({ success: true, membership: membership[0] });
    } catch(error) {
      console.error('Join fan club error:', error);
      res.status(500).json({ error: 'Failed to join fan club' });
    }
  }
  
  async createFanClubContent(req: Request, res: Response) {
    try {
      const { fanClubId, title, content, contentType, mediaUrl, accessTiers, scheduledFor, isExclusive, createdByUserId } = req.body;
      
      const fanContent = await db.insert(fanClubContent).values({
        fanClubId,;
        title,;
        content,;
        contentType,;
        mediaUrl,;
        accessTiers,;
        scheduledFor: scheduledFor ? new Date(scheduledFor)  : null,;
        publishedAt: scheduledFor ? null  : new Date(),;
        isExclusive,;
        createdByUserId;
      }).returning();
      
      res.json({ success: true, content: fanContent[0] });
    } catch(error) {
      console.error('Create fan club content error:', error);
      res.status(500).json({ error: 'Failed to create fan club content' });
    }
  }
  
  // CROWDFUNDING PROJECTS
  async createCrowdfundingProject(req: Request, res: Response) {
    try {
      const {
        artistUserId,;
        title,;
        description,;
        projectType,;
        goalAmount,;
        currency,;
        fundingDeadline,;
        fundingRewards,;
        featuredImageUrl,;
        videoUrl;
      } = req.body;
      
      const project = await db.insert(crowdfundingProjects).values({
        artistUserId,;
        title,;
        description,;
        projectType,;
        goalAmount,;
        currency: currency || 'USD',;
        fundingDeadline: new Date(fundingDeadline),;
        fundingRewards,;
        featuredImageUrl,;
        videoUrl;
      }).returning();
      
      res.json({ success: true, project: project[0] });
    } catch(error) {
      console.error('Create crowdfunding project error:', error);
      res.status(500).json({ error: 'Failed to create crowdfunding project' });
    }
  }
  
  async launchCrowdfundingProject(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      
      const project = await db.update(crowdfundingProjects);
        .set({
          status: 'active',;
          launchedAt: new Date(),;
          updatedAt: new Date();
        })
        .where(eq(crowdfundingProjects.id, parseInt(projectId)));
        .returning();
      
      res.json({ success: true, project: project[0] });
    } catch(error) {
      console.error('Launch crowdfunding project error:', error);
      res.status(500).json({ error: 'Failed to launch crowdfunding project' });
    }
  }
  
  async backCrowdfundingProject(req: Request, res: Response) {
    try {
      const {
        projectId,;
        userId,;
        backerEmail,;
        backerName,;
        pledgeAmount,;
        rewardTier,;
        rewardDescription,;
        isAnonymous,;
        shippingAddress,;
        stripePaymentIntentId;
      } = req.body;
      
      const backer = await db.insert(crowdfundingBackers).values({
        projectId,;
        userId: userId || null,;
        backerEmail,;
        backerName,;
        pledgeAmount,;
        rewardTier,;
        rewardDescription,;
        paymentStatus: 'paid',;
        isAnonymous: isAnonymous || false,;
        shippingAddress,;
        stripePaymentIntentId,;
        paidAt: new Date();
      }).returning();
      
      // Update project totals
      await db.update(crowdfundingProjects);
        .set({
          currentAmount: sql`${crowdfundingProjects.currentAmount} + ${pledgeAmount}`,
          totalBackers: sql`${crowdfundingProjects.totalBackers} + 1`,
          updatedAt: new Date();
        })
        .where(eq(crowdfundingProjects.id, projectId));
      
      // Check if project is now funded
      const project = await db.select();
        .from(crowdfundingProjects);
        .where(eq(crowdfundingProjects.id, projectId));
      
      if(project[0] && project[0].currentAmount >= project[0].goalAmount) {
        await db.update(crowdfundingProjects);
          .set({
            status: 'funded',;
            fundedAt: new Date(),;
            updatedAt: new Date();
          })
          .where(eq(crowdfundingProjects.id, projectId));
      }
      
      res.json({ success: true, backer: backer[0] });
    } catch(error) {
      console.error('Back crowdfunding project error:', error);
      res.status(500).json({ error: 'Failed to back crowdfunding project' });
    }
  }
  
  // LIMITED EDITION RELEASES
  async createLimitedEditionRelease(req: Request, res: Response) {
    try {
      const {
        artistUserId,;
        songId,;
        albumId,;
        title,;
        description,;
        releaseType,;
        totalQuantity,;
        price,;
        releaseDate,;
        saleStartDate,;
        saleEndDate,;
        includedItems,;
        shippingRequired,;
        digitalDelivery,;
        exclusivityPeriod;
      } = req.body;
      
      const release = await db.insert(limitedEditionReleases).values({
        artistUserId,;
        songId: songId || null,;
        albumId: albumId || null,;
        title,;
        description,;
        releaseType,;
        totalQuantity,;
        remainingQuantity: totalQuantity,;
        price,;
        releaseDate: new Date(releaseDate),;
        saleStartDate: new Date(saleStartDate),;
        saleEndDate: saleEndDate ? new Date(saleEndDate)  : null,;
        includedItems,;
        shippingRequired: shippingRequired !== false,;
        digitalDelivery: digitalDelivery || false,;
        exclusivityPeriod;
      }).returning();
      
      res.json({ success: true, release: release[0] });
    } catch(error) {
      console.error('Create limited edition release error:', error);
      res.status(500).json({ error: 'Failed to create limited edition release' });
    }
  }
  
  // MEET & GREET EVENTS
  async createMeetAndGreetEvent(req: Request, res: Response) {
    try {
      const {
        artistUserId,;
        bookingId,;
        title,;
        description,;
        eventDate,;
        duration,;
        venue,;
        venueAddress,;
        maxAttendees,;
        ticketPrice,;
        vipPackages,;
        includedPerks,;
        photoSessions,;
        autographSessions,;
        qAndASession;
      } = req.body;
      
      const event = await db.insert(meetAndGreetEvents).values({
        artistUserId,;
        bookingId: bookingId || null,;
        title,;
        description,;
        eventDate: new Date(eventDate),;
        duration,;
        venue,;
        venueAddress,;
        maxAttendees,;
        ticketPrice,;
        vipPackages,;
        includedPerks,;
        photoSessions: photoSessions !== false,;
        autographSessions: autographSessions !== false,;
        qAndASession: qAndASession || false;
      }).returning();
      
      res.json({ success: true, event: event[0] });
    } catch(error) {
      console.error('Create meet and greet event error:', error);
      res.status(500).json({ error: 'Failed to create meet and greet event' });
    }
  }
  
  async purchaseMeetAndGreetTicket(req: Request, res: Response) {
    try {
      const {
        eventId,;
        userId,;
        attendeeName,;
        attendeeEmail,;
        attendeePhone,;
        ticketType,;
        amountPaid,;
        specialRequests,;
        stripePaymentIntentId;
      } = req.body;
      
      const attendee = await db.insert(meetAndGreetAttendees).values({
        eventId,;
        userId: userId || null,;
        attendeeName,;
        attendeeEmail,;
        attendeePhone,;
        ticketType: ticketType || 'standard',;
        amountPaid,;
        paymentStatus: 'paid',;
        specialRequests,;
        stripePaymentIntentId;
      }).returning();
      
      // Update event totals
      await db.update(meetAndGreetEvents);
        .set({
          currentAttendees: sql`${meetAndGreetEvents.currentAttendees} + 1`,
          totalRevenue: sql`${meetAndGreetEvents.totalRevenue} + ${amountPaid}`,
          updatedAt: new Date();
        })
        .where(eq(meetAndGreetEvents.id, eventId));
      
      res.json({ success: true, attendee: attendee[0] });
    } catch(error) {
      console.error('Purchase meet and greet ticket error:', error);
      res.status(500).json({ error: 'Failed to purchase meet and greet ticket' });
    }
  }
  
  // FAN ANALYTICS
  async updateFanAnalytics(req: Request, res: Response) {
    try {
      const {
        artistUserId,;
        fanUserId,;
        fanEmail,;
        engagementType,;
        purchaseAmount,;
        songInteraction,;
        eventAttendance;
      } = req.body;
      
      // Check if fan analytics record exists
      let fanAnalyticsRecord = await db.select();
        .from(fanAnalytics);
        .where(;
          and(;
            eq(fanAnalytics.artistUserId, artistUserId),;
            fanUserId ? eq(fanAnalytics.fanUserId, fanUserId)  : eq(fanAnalytics.fanEmail, fanEmail);
          )
        )
        .limit(1);
      
      if((fanAnalyticsRecord as any).length === 0) {
        // Create new fan analytics record
        const newRecord = await db.insert(fanAnalytics).values({
          artistUserId,;
          fanUserId: fanUserId || null,;
          fanEmail: fanEmail || null,;
          engagementScore: 10, // Base score;
          totalSpent: purchaseAmount || 0,;
          totalPurchases: purchaseAmount ? 1  : 0,;
          lastPurchaseAt: purchaseAmount ? new Date()  : null,;
          eventAttendance: eventAttendance ? 1  : 0,;
          lastEngagementAt: new Date();
        }).returning();
        
        res.json({ success: true, analytics: newRecord[0] });
      } else {
        // Update existing record
        const currentRecord = fanAnalyticsRecord[0];
        const updatedRecord = await db.update(fanAnalytics);
          .set({
            engagementScore: Math.min(100, currentRecord.engagementScore + 5), // Increase engagement;
            totalSpent: purchaseAmount ? sql`${fanAnalytics.totalSpent} + ${purchaseAmount}`  : fanAnalytics.totalSpent,
            totalPurchases: purchaseAmount ? sql`${fanAnalytics.totalPurchases} + 1`  : fanAnalytics.totalPurchases,
            lastPurchaseAt: purchaseAmount ? new Date()  : fanAnalytics.lastPurchaseAt,;
            eventAttendance: eventAttendance ? sql`${fanAnalytics.eventAttendance} + 1`  : fanAnalytics.eventAttendance,
            lastEngagementAt: new Date(),;
            updatedAt: new Date();
          })
          .where(eq(fanAnalytics.id, currentRecord.id));
          .returning();
        
        res.json({ success: true, analytics: updatedRecord[0] });
      }
    } catch(error) {
      console.error('Update fan analytics error:', error);
      res.status(500).json({ error: 'Failed to update fan analytics' });
    }
  }
  
  async getFanAnalytics(req: Request, res: Response) {
    try {
      const { artistUserId } = req.params;
      const { limit = 50, offset = 0 } = req.query;
      
      const analytics = await db.select();
        .from(fanAnalytics);
        .where(eq(fanAnalytics.artistUserId, parseInt(artistUserId)));
        .orderBy(desc(fanAnalytics.engagementScore));
        .limit(parseInt(limit as string));
        .offset(parseInt(offset as string));
      
      res.json({ success: true, analytics });
    } catch(error) {
      console.error('Get fan analytics error:', error);
      res.status(500).json({ error: 'Failed to fetch fan analytics' });
    }
  }
}

export const fanEngagementService = new FanEngagementService();
