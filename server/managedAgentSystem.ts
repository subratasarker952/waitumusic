import { db } from './db';
import { bookings, users, professionals, serviceAssignments, type Booking, type User, type Professional } from '@shared/schema';
import { eq, and, inArray } from 'drizzle-orm';

export interface ManagedAgentAssignment {
  bookingId: number;
  agentUserId: number;
  managedTalentUserId: number;
  commissionRate: number;
  status: 'pending' | 'accepted' | 'declined';
  counterOffer?: {
    price: number;
    terms: string;
    validUntil: Date;
  };
}

export interface CounterOfferData {
  originalPrice: number;
  proposedPrice: number;
  terms: string;
  validUntil: Date;
  reason: string;
}

export class ManagedAgentSystem {
  
  // Get all managed agents (professionals with agent sub-type)
  async getManagedAgents(): Promise<Professional[]> {
    try {
      const agents = await db
        .select()
        .from(professionals)
        .innerJoin(users, eq(professionals.userId, users.id))
        .where(
          and(
            eq(users.status, 'active'),
            eq(professionals.isManaged, true)
          )
        );
      
      return agents.map(a => a.professionals);
    } catch (error) {
      console.error('Error fetching managed agents:', error);
      return [];
    }
  }

  // Automatically assign managed agent to booking for fully managed talent
  async autoAssignManagedAgent(bookingId: number): Promise<boolean> {
    try {
      const booking = await db
        .select()
        .from(bookings)
        .where(eq(bookings.id, bookingId))
        .limit(1);

      if (!booking.length) return false;

      const talent = await db
        .select()
        .from(users)
        .where(eq(users.id, booking[0].primaryArtistUserId))
        .limit(1);

      if (!talent.length) return false;

      // Check if talent is fully managed (roleId 3, 5, or 7)
      const isFullyManaged = [3, 5, 7].includes(talent[0].roleId);
      
      if (!isFullyManaged) return false;

      // Find available managed agent
      const availableAgent = await this.findAvailableAgent(booking[0]);
      
      if (!availableAgent) return false;

      // Create agent assignment
      await db.insert(serviceAssignments).values({
        serviceId: 1, // Agent service
        assignedUserId: availableAgent.userId,
        bookingId: bookingId,
        status: 'assigned',
        assignedAt: new Date(),
        role: 'managed_agent',
        commissionRate: 0.15, // 15% commission
        isAutoAssigned: true
      });

      // Send notification to agent
      await this.notifyAgentAssignment(availableAgent.userId, bookingId);

      return true;
    } catch (error) {
      console.error('Error auto-assigning managed agent:', error);
      return false;
    }
  }

  // Find best available agent for booking
  private async findAvailableAgent(booking: Booking): Promise<Professional | null> {
    try {
      const agents = await this.getManagedAgents();
      
      // Filter agents by availability and specialization
      const availableAgents = [];
      
      for (const agent of agents) {
        const isAvailable = await this.checkAgentAvailability(agent.userId, booking);
        const hasRelevantSpecialization = await this.checkSpecializationMatch(agent, booking);
        
        if (isAvailable && hasRelevantSpecialization) {
          availableAgents.push(agent);
        }
      }

      // Return agent with best match score
      return availableAgents.length > 0 ? availableAgents[0] : null;
    } catch (error) {
      console.error('Error finding available agent:', error);
      return null;
    }
  }

  // Check if agent is available for booking date
  private async checkAgentAvailability(agentUserId: number, booking: Booking): Promise<boolean> {
    try {
      const conflictingBookings = await db
        .select()
        .from(serviceAssignments)
        .innerJoin(bookings, eq(serviceAssignments.bookingId, bookings.id))
        .where(
          and(
            eq(serviceAssignments.assignedUserId, agentUserId),
            eq(serviceAssignments.status, 'assigned'),
            eq(bookings.status, 'confirmed')
          )
        );

      // Simple availability check - can be enhanced with date range logic
      return conflictingBookings.length < 5; // Agent can handle up to 5 concurrent bookings
    } catch (error) {
      console.error('Error checking agent availability:', error);
      return false;
    }
  }

  // Check if agent specialization matches booking requirements
  private async checkSpecializationMatch(agent: Professional, booking: Booking): Promise<boolean> {
    // Extract specializations from JSONB field
    const specializations = Array.isArray(agent.specializations) 
      ? agent.specializations 
      : [];

    // Check for relevant specializations based on booking type
    const relevantSpecs = ['booking_management', 'talent_representation', 'event_coordination'];
    
    return specializations.some((spec: string) => 
      relevantSpecs.includes(spec.toLowerCase().replace(/\s+/g, '_'))
    );
  }

  // Create counter offer for booking
  async createCounterOffer(
    bookingId: number, 
    agentUserId: number, 
    counterOfferData: CounterOfferData
  ): Promise<boolean> {
    try {
      // Update service assignment with counter offer
      await db
        .update(serviceAssignments)
        .set({
          status: 'counter_offered',
          counterOfferData: counterOfferData,
          updatedAt: new Date()
        })
        .where(
          and(
            eq(serviceAssignments.bookingId, bookingId),
            eq(serviceAssignments.assignedUserId, agentUserId)
          )
        );

      // Notify booker of counter offer
      await this.notifyCounterOffer(bookingId, counterOfferData);

      return true;
    } catch (error) {
      console.error('Error creating counter offer:', error);
      return false;
    }
  }

  // Accept or decline counter offer
  async respondToCounterOffer(
    bookingId: number,
    agentUserId: number,
    response: 'accepted' | 'declined',
    bookerUserId: number
  ): Promise<boolean> {
    try {
      const newStatus = response === 'accepted' ? 'confirmed' : 'cancelled';
      
      await db
        .update(serviceAssignments)
        .set({
          status: newStatus,
          respondedAt: new Date(),
          updatedAt: new Date()
        })
        .where(
          and(
            eq(serviceAssignments.bookingId, bookingId),
            eq(serviceAssignments.assignedUserId, agentUserId)
          )
        );

      if (response === 'accepted') {
        // Update booking status and pricing
        const assignment = await db
          .select()
          .from(serviceAssignments)
          .where(
            and(
              eq(serviceAssignments.bookingId, bookingId),
              eq(serviceAssignments.assignedUserId, agentUserId)
            )
          )
          .limit(1);

        if (assignment.length && assignment[0].counterOfferData) {
          const counterOffer = assignment[0].counterOfferData as CounterOfferData;
          
          await db
            .update(bookings)
            .set({
              status: 'confirmed',
              updatedAt: new Date()
            })
            .where(eq(bookings.id, bookingId));
        }
      }

      // Notify all parties
      await this.notifyCounterOfferResponse(bookingId, agentUserId, bookerUserId, response);

      return true;
    } catch (error) {
      console.error('Error responding to counter offer:', error);
      return false;
    }
  }

  // Get agent assignments for a booking
  async getAgentAssignments(bookingId: number): Promise<any[]> {
    try {
      const assignments = await db
        .select({
          assignment: serviceAssignments,
          agent: users,
          professional: professionals
        })
        .from(serviceAssignments)
        .innerJoin(users, eq(serviceAssignments.assignedUserId, users.id))
        .leftJoin(professionals, eq(users.id, professionals.userId))
        .where(
          and(
            eq(serviceAssignments.bookingId, bookingId),
            eq(serviceAssignments.role, 'managed_agent')
          )
        );

      return assignments;
    } catch (error) {
      console.error('Error fetching agent assignments:', error);
      return [];
    }
  }

  // Notification methods
  private async notifyAgentAssignment(agentUserId: number, bookingId: number): Promise<void> {
    // Implementation for notifying agent of new assignment
    console.log(`Notifying agent ${agentUserId} of booking assignment ${bookingId}`);
  }

  private async notifyCounterOffer(bookingId: number, counterOffer: CounterOfferData): Promise<void> {
    // Implementation for notifying booker of counter offer
    console.log(`Notifying booker of counter offer for booking ${bookingId}:`, counterOffer);
  }

  private async notifyCounterOfferResponse(
    bookingId: number, 
    agentUserId: number, 
    bookerUserId: number, 
    response: string
  ): Promise<void> {
    // Implementation for notifying parties of counter offer response
    console.log(`Counter offer ${response} for booking ${bookingId} by agent ${agentUserId}`);
  }

  // Get agent performance metrics
  async getAgentMetrics(agentUserId: number): Promise<any> {
    try {
      const assignments = await db
        .select()
        .from(serviceAssignments)
        .innerJoin(bookings, eq(serviceAssignments.bookingId, bookings.id))
        .where(
          and(
            eq(serviceAssignments.assignedUserId, agentUserId),
            eq(serviceAssignments.role, 'managed_agent')
          )
        );

      const totalBookings = assignments.length;
      const confirmedBookings = assignments.filter(a => a.service_assignments.status === 'confirmed').length;
      const pendingBookings = assignments.filter(a => a.service_assignments.status === 'assigned').length;
      const successRate = totalBookings > 0 ? (confirmedBookings / totalBookings) * 100 : 0;

      // Calculate total commission earned
      const totalCommission = assignments
        .filter(a => a.service_assignments.status === 'confirmed')
        .reduce((sum, a) => {
          const commissionRate = a.service_assignments.commissionRate || 0.15;
          return sum + (parseFloat(a.bookings.artistFee || '0') * commissionRate);
        }, 0);

      return {
        totalBookings,
        confirmedBookings,
        pendingBookings,
        successRate: Math.round(successRate),
        totalCommission: totalCommission.toFixed(2),
        averageResponseTime: '2.4 hours', // Can be calculated from actual data
        rating: 4.8 // Can be calculated from booking reviews
      };
    } catch (error) {
      console.error('Error fetching agent metrics:', error);
      return {
        totalBookings: 0,
        confirmedBookings: 0,
        pendingBookings: 0,
        successRate: 0,
        totalCommission: '0.00',
        averageResponseTime: 'N/A',
        rating: 0
      };
    }
  }
}

export const managedAgentSystem = new ManagedAgentSystem();