import { db } from './db';
import { 
  professionals, 
  serviceAssignments, 
  bookings, 
  users,
  serviceCategories,
  type Professional, 
  type ServiceAssignment,
  type Booking 
} from '@shared/schema';
import { eq, and, inArray, like } from 'drizzle-orm';

export interface ProfessionalService {
  serviceType: 'photographer' | 'videographer' | 'marketing' | 'social_media';
  specializations: string[];
  portfolio: PortfolioItem[];
  rates: ServiceRate[];
  availability: AvailabilitySchedule;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  projectDate: Date;
  client?: string;
  tags: string[];
}

export interface ServiceRate {
  serviceType: string;
  hourlyRate?: number;
  dayRate?: number;
  projectRate?: number;
  packageDeals: PackageDeal[];
}

export interface PackageDeal {
  name: string;
  description: string;
  services: string[];
  price: number;
  duration: string;
}

export interface AvailabilitySchedule {
  weeklySchedule: Record<string, TimeSlot[]>;
  blockedDates: Date[];
  preferredTimes: string[];
  travelRadius: number;
}

export interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
}

export class CrossPlatformIntegration {

  // Register professional with specialized services
  async registerProfessionalService(
    userId: number, 
    serviceData: ProfessionalService
  ): Promise<boolean> {
    try {
      // Update professional profile with service data
      await db
        .update(professionals)
        .set({
          specializations: serviceData.specializations,
          services: {
            serviceType: serviceData.serviceType,
            portfolio: serviceData.portfolio,
            rates: serviceData.rates,
            availability: serviceData.availability
          },
          updatedAt: new Date()
        })
        .where(eq(professionals.userId, userId));

      // Create service category entries
      for (const specialization of serviceData.specializations) {
        await this.createServiceCategory(serviceData.serviceType, specialization);
      }

      return true;
    } catch (error) {
      console.error('Error registering professional service:', error);
      return false;
    }
  }

  // Find professionals by service type and specialization
  async findProfessionals(
    serviceType: string,
    specialization?: string,
    location?: string,
    dateRange?: { start: Date; end: Date }
  ): Promise<Professional[]> {
    try {
      let query = db
        .select()
        .from(professionals)
        .innerJoin(users, eq(professionals.userId, users.id))
        .where(eq(users.status, 'active'));

      // Filter by service type
      const professionals_result = await query;
      
      return professionals_result
        .map(p => p.professionals)
        .filter(prof => {
          const services = prof.services as any;
          if (!services) return false;

          // Check service type
          if (services.serviceType !== serviceType) return false;

          // Check specialization
          if (specialization && !prof.specializations?.includes(specialization)) {
            return false;
          }

          // Check availability for date range
          if (dateRange && services.availability) {
            return this.checkAvailability(services.availability, dateRange);
          }

          return true;
        });
    } catch (error) {
      console.error('Error finding professionals:', error);
      return [];
    }
  }

  // Book professional for event
  async bookProfessional(
    bookingId: number,
    professionalUserId: number,
    serviceDetails: {
      serviceType: string;
      duration: number;
      requirements: string[];
      specialRequests?: string;
    }
  ): Promise<boolean> {
    try {
      // Check availability
      const professional = await db
        .select()
        .from(professionals)
        .where(eq(professionals.userId, professionalUserId))
        .limit(1);

      if (!professional.length) return false;

      // Get booking details
      const booking = await db
        .select()
        .from(bookings)
        .where(eq(bookings.id, bookingId))
        .limit(1);

      if (!booking.length) return false;

      // Create service assignment
      const assignment = await db
        .insert(serviceAssignments)
        .values({
          serviceId: await this.getServiceId(serviceDetails.serviceType),
          assignedUserId: professionalUserId,
          bookingId: bookingId,
          status: 'assigned',
          assignedAt: new Date(),
          role: 'professional',
          serviceDetails: serviceDetails,
          commissionRate: 0.10 // 10% platform commission
        })
        .returning();

      // Calculate pricing
      await this.calculateProfessionalPricing(assignment[0].id, serviceDetails);

      // Notify professional
      await this.notifyProfessionalAssignment(professionalUserId, bookingId, serviceDetails);

      return true;
    } catch (error) {
      console.error('Error booking professional:', error);
      return false;
    }
  }

  // Create integrated workflow for event production
  async createEventProductionWorkflow(
    bookingId: number,
    productionRequirements: {
      photography: boolean;
      videography: boolean;
      marketing: boolean;
      socialMedia: boolean;
      liveStreaming?: boolean;
      contentCreation?: boolean;
    }
  ): Promise<boolean> {
    try {
      const assignments = [];

      // Photography assignment
      if (productionRequirements.photography) {
        const photographer = await this.findBestMatch(bookingId, 'photographer');
        if (photographer) {
          await this.bookProfessional(bookingId, photographer.userId, {
            serviceType: 'photography',
            duration: 4, // hours
            requirements: ['event_coverage', 'promotional_shots']
          });
          assignments.push({ type: 'photographer', userId: photographer.userId });
        }
      }

      // Videography assignment
      if (productionRequirements.videography) {
        const videographer = await this.findBestMatch(bookingId, 'videographer');
        if (videographer) {
          await this.bookProfessional(bookingId, videographer.userId, {
            serviceType: 'videography',
            duration: 6, // hours
            requirements: ['live_performance', 'behind_scenes', 'promotional_video']
          });
          assignments.push({ type: 'videographer', userId: videographer.userId });
        }
      }

      // Marketing professional assignment
      if (productionRequirements.marketing) {
        const marketer = await this.findBestMatch(bookingId, 'marketing');
        if (marketer) {
          await this.bookProfessional(bookingId, marketer.userId, {
            serviceType: 'marketing',
            duration: 10, // project duration in days
            requirements: ['event_promotion', 'press_releases', 'media_outreach']
          });
          assignments.push({ type: 'marketing', userId: marketer.userId });
        }
      }

      // Social media specialist assignment
      if (productionRequirements.socialMedia) {
        const socialMediaSpecialist = await this.findBestMatch(bookingId, 'social_media');
        if (socialMediaSpecialist) {
          await this.bookProfessional(bookingId, socialMediaSpecialist.userId, {
            serviceType: 'social_media',
            duration: 7, // project duration in days
            requirements: ['content_creation', 'live_updates', 'post_event_content']
          });
          assignments.push({ type: 'social_media', userId: socialMediaSpecialist.userId });
        }
      }

      // Store production workflow
      await db
        .update(bookings)
        .set({
          productionWorkflow: {
            assignments: assignments,
            timeline: await this.createProductionTimeline(bookingId, assignments),
            coordinationPlan: await this.createCoordinationPlan(assignments)
          },
          updatedAt: new Date()
        })
        .where(eq(bookings.id, bookingId));

      return true;
    } catch (error) {
      console.error('Error creating event production workflow:', error);
      return false;
    }
  }

  // Get integrated professional team for booking
  async getProfessionalTeam(bookingId: number): Promise<any[]> {
    try {
      const teamMembers = await db
        .select({
          assignment: serviceAssignments,
          professional: professionals,
          user: users
        })
        .from(serviceAssignments)
        .innerJoin(professionals, eq(serviceAssignments.assignedUserId, professionals.userId))
        .innerJoin(users, eq(professionals.userId, users.id))
        .where(
          and(
            eq(serviceAssignments.bookingId, bookingId),
            eq(serviceAssignments.role, 'professional')
          )
        );

      return teamMembers.map(({ assignment, professional, user }) => ({
        userId: user.id,
        name: user.fullName,
        email: user.email,
        serviceType: (assignment.serviceDetails as any)?.serviceType,
        specializations: professional.specializations,
        status: assignment.status,
        assignedAt: assignment.assignedAt,
        portfolio: (professional.services as any)?.portfolio || [],
        rates: (professional.services as any)?.rates || []
      }));
    } catch (error) {
      console.error('Error getting professional team:', error);
      return [];
    }
  }

  // Create coordination plan for professional team
  private async createCoordinationPlan(assignments: any[]): Promise<any> {
    return {
      preEventMeeting: {
        scheduled: true,
        participants: assignments.map(a => a.userId),
        agenda: [
          'Event timeline review',
          'Equipment coordination',
          'Content delivery requirements',
          'Communication protocols'
        ]
      },
      eventDayCoordination: {
        leadCoordinator: assignments.find(a => a.type === 'marketing')?.userId || assignments[0]?.userId,
        communicationChannel: 'WhatsApp group',
        checkInSchedule: ['setup', 'midpoint', 'wrap']
      },
      postEventDeliverables: {
        photographyDelivery: '24-48 hours',
        videographyDelivery: '3-5 days',
        marketingReport: '7 days',
        socialMediaAnalytics: '7 days'
      }
    };
  }

  // Create production timeline
  private async createProductionTimeline(bookingId: number, assignments: any[]): Promise<any> {
    const booking = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, bookingId))
      .limit(1);

    if (!booking.length) return {};

    const eventDate = new Date(booking[0].preferredDate || Date.now());

    return {
      preProduction: {
        start: new Date(eventDate.getTime() - 7 * 24 * 60 * 60 * 1000), // 1 week before
        tasks: [
          'Marketing campaign launch',
          'Social media content planning',
          'Equipment preparation',
          'Location scouting'
        ]
      },
      eventDay: {
        setup: new Date(eventDate.getTime() - 2 * 60 * 60 * 1000), // 2 hours before
        performance: eventDate,
        breakdown: new Date(eventDate.getTime() + 2 * 60 * 60 * 1000) // 2 hours after
      },
      postProduction: {
        contentProcessing: new Date(eventDate.getTime() + 24 * 60 * 60 * 1000), // Next day
        deliveryDeadline: new Date(eventDate.getTime() + 7 * 24 * 60 * 60 * 1000), // 1 week after
        reportingDeadline: new Date(eventDate.getTime() + 14 * 24 * 60 * 60 * 1000) // 2 weeks after
      }
    };
  }

  // Helper methods
  private async findBestMatch(bookingId: number, serviceType: string): Promise<Professional | null> {
    const professionals = await this.findProfessionals(serviceType);
    
    // Simple scoring algorithm - can be enhanced
    if (professionals.length === 0) return null;
    
    // Return first available professional for now
    return professionals[0];
  }

  private async getServiceId(serviceType: string): Promise<number> {
    const service = await db
      .select()
      .from(serviceCategories)
      .where(like(serviceCategories.name, `%${serviceType}%`))
      .limit(1);

    return service.length ? service[0].id : 1; // Default service ID
  }

  private async createServiceCategory(serviceType: string, specialization: string): Promise<void> {
    try {
      await db
        .insert(serviceCategories)
        .values({
          name: `${serviceType}_${specialization}`,
          description: `${serviceType} services specializing in ${specialization}`,
          category: serviceType,
          isActive: true
        })
        .onConflictDoNothing();
    } catch (error) {
      console.error('Error creating service category:', error);
    }
  }

  private checkAvailability(
    availability: AvailabilitySchedule, 
    dateRange: { start: Date; end: Date }
  ): boolean {
    // Simple availability check - can be enhanced with more complex logic
    const blockedDates = availability.blockedDates || [];
    
    for (const blockedDate of blockedDates) {
      if (blockedDate >= dateRange.start && blockedDate <= dateRange.end) {
        return false;
      }
    }
    
    return true;
  }

  private async calculateProfessionalPricing(
    assignmentId: number, 
    serviceDetails: any
  ): Promise<void> {
    // Implementation for calculating professional service pricing
    console.log(`Calculating pricing for assignment ${assignmentId}`);
  }

  private async notifyProfessionalAssignment(
    professionalUserId: number, 
    bookingId: number, 
    serviceDetails: any
  ): Promise<void> {
    console.log(`Notifying professional ${professionalUserId} of booking ${bookingId}`);
  }
}

export const crossPlatformIntegration = new CrossPlatformIntegration();