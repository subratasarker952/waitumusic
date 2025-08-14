import { db } from './db';
import { newsletters, newsletterSubscriptions, newsletterEngagements, artists, users } from '@shared/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { sendNewsletter, sendArtistUpdate, sendWelcomeNewsletter } from './emailService';
import { v4 as uuidv4 } from 'uuid';

export interface NewsletterSubscriptionData {
  email: string;
  firstName?: string;
  lastName?: string;
  subscriptionType: 'general' | 'artist-specific';
  artistInterests?: number[];
  source?: string;
}

export interface NewsletterData {
  title: string;
  content: string;
  type: 'general' | 'artist-specific' | 'release-announcement';
  targetArtistId?: number;
  scheduledFor?: Date;
}

export class NewsletterService {
  // Subscribe a user to the newsletter
  async subscribe(subscriptionData: NewsletterSubscriptionData): Promise<{success: boolean; message: string}> {
    try {
      // Check if email already exists
      const existingSubscription = await db.select()
        .from(newsletterSubscriptions)
        .where(eq(newsletterSubscriptions.email, subscriptionData.email))
        .limit(1);

      if (existingSubscription.length > 0) {
        if (existingSubscription[0].status === 'unsubscribed') {
          // Reactivate subscription
          await db.update(newsletterSubscriptions)
            .set({
              status: 'active',
              firstName: subscriptionData.firstName,
              lastName: subscriptionData.lastName,
              subscriptionType: subscriptionData.subscriptionType,
              artistInterests: subscriptionData.artistInterests || [],
              subscribeDate: new Date(),
              unsubscribeDate: null
            })
            .where(eq(newsletterSubscriptions.id, existingSubscription[0].id));

          // Send welcome email
          await sendWelcomeNewsletter(
            subscriptionData.email,
            subscriptionData.firstName,
            existingSubscription[0].unsubscribeToken || undefined
          );

          return { success: true, message: 'Welcome back! Your subscription has been reactivated.' };
        } else {
          return { success: false, message: 'Email already subscribed to our newsletter.' };
        }
      }

      // Create new subscription
      const unsubscribeToken = uuidv4();
      const [newSubscription] = await db.insert(newsletterSubscriptions).values({
        email: subscriptionData.email,
        firstName: subscriptionData.firstName,
        lastName: subscriptionData.lastName,
        subscriptionType: subscriptionData.subscriptionType,
        artistInterests: subscriptionData.artistInterests || [],
        source: subscriptionData.source || 'website',
        unsubscribeToken,
        status: 'active'
      }).returning();

      // Send welcome email
      await sendWelcomeNewsletter(
        subscriptionData.email,
        subscriptionData.firstName,
        unsubscribeToken
      );

      return { success: true, message: 'Successfully subscribed! Check your email for a welcome message.' };
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      return { success: false, message: 'Failed to subscribe. Please try again.' };
    }
  }

  // Unsubscribe using token
  async unsubscribe(token: string): Promise<{success: boolean; message: string}> {
    try {
      const subscription = await db.select()
        .from(newsletterSubscriptions)
        .where(eq(newsletterSubscriptions.unsubscribeToken, token))
        .limit(1);

      if (subscription.length === 0) {
        return { success: false, message: 'Invalid unsubscribe token.' };
      }

      await db.update(newsletterSubscriptions)
        .set({
          status: 'unsubscribed',
          unsubscribeDate: new Date()
        })
        .where(eq(newsletterSubscriptions.id, subscription[0].id));

      return { success: true, message: 'Successfully unsubscribed from newsletter.' };
    } catch (error) {
      console.error('Newsletter unsubscribe error:', error);
      return { success: false, message: 'Failed to unsubscribe. Please try again.' };
    }
  }

  // Create and send newsletter
  async createAndSendNewsletter(newsletterData: NewsletterData, createdBy: number): Promise<{success: boolean; message: string; newsletterId?: number}> {
    try {
      console.log('Creating newsletter with data:', newsletterData);
      console.log('Created by user ID:', createdBy);

      // Create newsletter record
      const [newsletter] = await db.insert(newsletters).values({
        title: newsletterData.title,
        content: newsletterData.content,
        type: newsletterData.type,
        targetArtistId: newsletterData.targetArtistId,
        scheduledFor: newsletterData.scheduledFor,
        createdBy,
        status: newsletterData.scheduledFor ? 'scheduled' : 'draft'
      }).returning();

      console.log('Newsletter created successfully:', newsletter);

      if (newsletterData.scheduledFor && newsletterData.scheduledFor > new Date()) {
        return { 
          success: true, 
          message: 'Newsletter scheduled successfully.',
          newsletterId: newsletter.id 
        };
      }

      // For immediate sending, mark as draft first and provide fallback
      try {
        const result = await this.sendNewsletter(newsletter.id);
        return {
          success: result.success,
          message: result.message,
          newsletterId: newsletter.id
        };
      } catch (emailError) {
        console.error('Email sending failed, newsletter created as draft:', emailError);
        
        // Update status to indicate email issue
        await db.update(newsletters)
          .set({ status: 'created_pending_email_config' })
          .where(eq(newsletters.id, newsletter.id));

        return {
          success: true,
          message: 'Newsletter created successfully. Email configuration needed for sending. Newsletter saved as draft.',
          newsletterId: newsletter.id
        };
      }
    } catch (error) {
      console.error('Newsletter creation error:', error);
      return { 
        success: false, 
        message: 'Failed to create newsletter: ' + (error.message || 'Unknown error')
      };
    }
  }

  // Send existing newsletter
  async sendNewsletter(newsletterId: number): Promise<{success: boolean; message: string; stats?: any}> {
    try {
      const newsletter = await db.select().from(newsletters).where(eq(newsletters.id, newsletterId)).limit(1);
      if (newsletter.length === 0) {
        return { success: false, message: 'Newsletter not found.' };
      }

      const newsletterData = newsletter[0];

      // Get recipients based on newsletter type
      let recipients;
      if (newsletterData.type === 'artist-specific' && newsletterData.targetArtistId) {
        recipients = await db.select()
          .from(newsletterSubscriptions)
          .where(
            and(
              eq(newsletterSubscriptions.status, 'active'),
              sql`${newsletterSubscriptions.artistInterests} @> ${JSON.stringify([newsletterData.targetArtistId])}`
            )
          );
      } else {
        recipients = await db.select()
          .from(newsletterSubscriptions)
          .where(eq(newsletterSubscriptions.status, 'active'));
      }

      if (recipients.length === 0) {
        return { success: false, message: 'No active subscribers found.' };
      }

      // Send newsletter
      const sendResult = await sendNewsletter(
        newsletterId,
        recipients.map(r => ({
          email: r.email,
          firstName: r.firstName || undefined,
          lastName: r.lastName || undefined,
          unsubscribeToken: r.unsubscribeToken || ''
        })),
        {
          title: newsletterData.title,
          content: newsletterData.content,
          type: newsletterData.type
        }
      );

      // Update newsletter stats
      await db.update(newsletters)
        .set({
          status: 'sent',
          sentAt: new Date(),
          sentCount: sendResult.sent
        })
        .where(eq(newsletters.id, newsletterId));

      // Record engagements
      for (const recipient of recipients) {
        await db.insert(newsletterEngagements).values({
          newsletterId,
          subscriptionId: recipient.id,
          engagementType: 'sent'
        });
      }

      return {
        success: sendResult.success,
        message: `Newsletter sent successfully to ${sendResult.sent} subscribers.`,
        stats: { sent: sendResult.sent, failed: sendResult.failed }
      };
    } catch (error) {
      console.error('Newsletter send error:', error);
      return { success: false, message: 'Failed to send newsletter.' };
    }
  }

  // Send artist-specific update
  async sendArtistUpdate(
    artistId: number,
    updateData: {
      title: string;
      content: string;
      releaseInfo?: any;
      showInfo?: any;
    }
  ): Promise<{success: boolean; message: string}> {
    try {
      // Get artist info
      const artist = await db.select()
        .from(artists)
        .innerJoin(users, eq(artists.userId, users.id))
        .where(eq(artists.userId, artistId))
        .limit(1);

      if (artist.length === 0) {
        return { success: false, message: 'Artist not found.' };
      }

      const artistData = artist[0];
      const artistName = artistData.artists.stageName || artistData.users.fullName;

      // Get subscribers interested in this artist
      const subscribers = await db.select()
        .from(newsletterSubscriptions)
        .where(
          and(
            eq(newsletterSubscriptions.status, 'active'),
            sql`${newsletterSubscriptions.artistInterests} @> ${JSON.stringify([artistId])}`
          )
        );

      if (subscribers.length === 0) {
        return { success: false, message: 'No subscribers found for this artist.' };
      }

      // Send artist update
      const success = await sendArtistUpdate(
        artistName,
        artistId,
        updateData,
        subscribers.map(s => ({
          email: s.email,
          firstName: s.firstName || undefined,
          unsubscribeToken: s.unsubscribeToken || ''
        }))
      );

      if (success) {
        // Create newsletter record for tracking
        await db.insert(newsletters).values({
          title: `${artistName}: ${updateData.title}`,
          content: updateData.content,
          type: 'artist-specific',
          targetArtistId: artistId,
          status: 'sent',
          sentAt: new Date(),
          sentCount: subscribers.length,
          createdBy: artistId // Artist created their own update
        });

        return { 
          success: true, 
          message: `Artist update sent to ${subscribers.length} subscribers.` 
        };
      } else {
        return { success: false, message: 'Failed to send artist update.' };
      }
    } catch (error) {
      console.error('Artist update error:', error);
      return { success: false, message: 'Failed to send artist update.' };
    }
  }

  // Get newsletter statistics
  async getNewsletterStats(): Promise<any> {
    try {
      const totalSubscribers = await db.select({ count: sql`count(*)` })
        .from(newsletterSubscriptions)
        .where(eq(newsletterSubscriptions.status, 'active'));

      const totalNewsletters = await db.select({ count: sql`count(*)` })
        .from(newsletters)
        .where(eq(newsletters.status, 'sent'));

      const recentNewsletters = await db.select()
        .from(newsletters)
        .where(eq(newsletters.status, 'sent'))
        .orderBy(desc(newsletters.sentAt))
        .limit(5);

      return {
        totalSubscribers: totalSubscribers[0]?.count || 0,
        totalNewsletters: totalNewsletters[0]?.count || 0,
        recentNewsletters
      };
    } catch (error) {
      console.error('Newsletter stats error:', error);
      return { totalSubscribers: 0, totalNewsletters: 0, recentNewsletters: [] };
    }
  }

  // Get subscribers by artist interest
  async getSubscribersByArtist(artistId: number): Promise<any[]> {
    try {
      return await db.select()
        .from(newsletterSubscriptions)
        .where(
          and(
            eq(newsletterSubscriptions.status, 'active'),
            sql`${newsletterSubscriptions.artistInterests} @> ${JSON.stringify([artistId])}`
          )
        );
    } catch (error) {
      console.error('Get subscribers error:', error);
      return [];
    }
  }
}

export const newsletterService = new NewsletterService();