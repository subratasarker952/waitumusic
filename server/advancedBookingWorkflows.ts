import { db } from './db';
import { 
  bookings, 
  users, 
  artists,
  professionals,
  serviceAssignments,
  technicalRiders,
  bookingMediaFiles,
  type Booking, 
  type User,
  type TechnicalRider,
  type InsertTechnicalRider
} from '@shared/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { managedAgentSystem } from './managedAgentSystem';

export interface TechnicalRiderData {
  bookingId: number;
  performanceRequirements: {
    stageSize: string;
    powerRequirements: string;
    lightingNeeds: string;
    soundSystemSpecs: string;
    backlineInstruments: string[];
  };
  hospitalityRequirements: {
    dresssingRoom: boolean;
    catering: string;
    accommodation: boolean;
    transportation: string;
  };
  technicalContacts: {
    soundEngineer: string;
    lightingTechnician: string;
    stageManager: string;
  };
  additionalNotes: string;
}

export interface BookingApprovalWorkflow {
  bookingId: number;
  currentStage: 'pending' | 'technical_review' | 'admin_review' | 'approved' | 'rejected';
  approvalSteps: ApprovalStep[];
  requiredDocuments: string[];
  deadlines: Record<string, Date>;
}

export interface ApprovalStep {
  step: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: number;
  approvedAt?: Date;
  notes?: string;
}

export class AdvancedBookingWorkflows {

  // Create comprehensive technical rider
  async createTechnicalRider(bookingId: number, riderData: TechnicalRiderData): Promise<boolean> {
    try {
      const booking = await db
        .select()
        .from(bookings)
        .where(eq(bookings.id, bookingId))
        .limit(1);

      if (!booking.length) return false;

      // Get artist profile for auto-population
      const artist = await db
        .select()
        .from(artists)
        .where(eq(artists.userId, booking[0].primaryArtistUserId))
        .limit(1);

      const technicalRiderData: InsertTechnicalRider = {
        bookingId: bookingId,
        createdBy: booking[0].primaryArtistUserId,
        performanceRequirements: riderData.performanceRequirements,
        hospitalityRequirements: riderData.hospitalityRequirements,
        technicalContacts: riderData.technicalContacts,
        additionalNotes: riderData.additionalNotes,
        status: 'draft',
        createdAt: new Date()
      };

      await db.insert(technicalRiders).values(technicalRiderData);

      // Auto-assign managed agent if applicable
      await managedAgentSystem.autoAssignManagedAgent(bookingId);

      // Trigger approval workflow
      await this.initializeApprovalWorkflow(bookingId);

      return true;
    } catch (error) {
      console.error('Error creating technical rider:', error);
      return false;
    }
  }

  // Initialize booking approval workflow
  async initializeApprovalWorkflow(bookingId: number): Promise<boolean> {
    try {
      const booking = await db
        .select()
        .from(bookings)
        .where(eq(bookings.id, bookingId))
        .limit(1);

      if (!booking.length) return false;

      // Check if talent is managed (gets streamlined approval)
      const talent = await db
        .select()
        .from(users)
        .where(eq(users.id, booking[0].primaryArtistUserId))
        .limit(1);

      const isManaged = talent.length && [3, 5, 7].includes(talent[0].roleId);

      const workflow: BookingApprovalWorkflow = {
        bookingId: bookingId,
        currentStage: 'technical_review',
        approvalSteps: [
          {
            step: 'technical_review',
            status: 'pending'
          },
          {
            step: 'admin_review', 
            status: 'pending'
          },
          {
            step: 'final_approval',
            status: 'pending'
          }
        ],
        requiredDocuments: [
          'technical_rider',
          'performance_contract',
          'insurance_certificate'
        ],
        deadlines: {
          technical_review: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          admin_review: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours
          final_approval: new Date(Date.now() + 72 * 60 * 60 * 1000) // 72 hours
        }
      };

      // Managed talent gets expedited approval
      if (isManaged) {
        workflow.deadlines = {
          technical_review: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
          admin_review: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours
          final_approval: new Date(Date.now() + 6 * 60 * 60 * 1000) // 6 hours
        };
      }

      // Store workflow in booking metadata
      await db
        .update(bookings)
        .set({
          workflowData: workflow,
          status: 'under_review',
          updatedAt: new Date()
        })
        .where(eq(bookings.id, bookingId));

      // Notify relevant parties
      await this.notifyApprovalWorkflowStart(bookingId, workflow);

      return true;
    } catch (error) {
      console.error('Error initializing approval workflow:', error);
      return false;
    }
  }

  // Process approval step
  async processApprovalStep(
    bookingId: number,
    step: string,
    approval: 'approved' | 'rejected',
    approvedBy: number,
    notes?: string
  ): Promise<boolean> {
    try {
      const booking = await db
        .select()
        .from(bookings)
        .where(eq(bookings.id, bookingId))
        .limit(1);

      if (!booking.length) return false;

      const workflowData = booking[0].workflowData as BookingApprovalWorkflow;
      if (!workflowData) return false;

      // Update approval step
      const stepIndex = workflowData.approvalSteps.findIndex(s => s.step === step);
      if (stepIndex === -1) return false;

      workflowData.approvalSteps[stepIndex] = {
        ...workflowData.approvalSteps[stepIndex],
        status: approval,
        approvedBy: approvedBy,
        approvedAt: new Date(),
        notes: notes
      };

      // Determine next stage
      if (approval === 'rejected') {
        workflowData.currentStage = 'rejected';
        await db
          .update(bookings)
          .set({
            status: 'rejected',
            workflowData: workflowData,
            updatedAt: new Date()
          })
          .where(eq(bookings.id, bookingId));

        await this.notifyBookingRejected(bookingId, step, notes || '');
        return true;
      }

      // Move to next stage if approved
      const currentStepIndex = ['technical_review', 'admin_review', 'final_approval'].indexOf(step);
      const nextSteps = ['admin_review', 'final_approval', 'approved'];
      
      if (currentStepIndex < nextSteps.length - 1) {
        workflowData.currentStage = nextSteps[currentStepIndex] as any;
      } else {
        workflowData.currentStage = 'approved';
      }

      const newStatus = workflowData.currentStage === 'approved' ? 'confirmed' : 'under_review';

      await db
        .update(bookings)
        .set({
          status: newStatus,
          workflowData: workflowData,
          updatedAt: new Date()
        })
        .where(eq(bookings.id, bookingId));

      // Create booking attachments if fully approved
      if (workflowData.currentStage === 'approved') {
        await this.createBookingAttachments(bookingId);
      }

      // Notify relevant parties
      await this.notifyApprovalStepComplete(bookingId, step, approval);

      return true;
    } catch (error) {
      console.error('Error processing approval step:', error);
      return false;
    }
  }

  // Automatically create and attach booking documents
  async createBookingAttachments(bookingId: number): Promise<boolean> {
    try {
      const booking = await db
        .select()
        .from(bookings)
        .where(eq(bookings.id, bookingId))
        .limit(1);

      if (!booking.length) return false;

      // Generate performance contract
      const contractData = await this.generatePerformanceContract(booking[0]);
      const contractFile = await this.saveDocumentFile(bookingId, 'performance_contract', contractData);

      // Generate technical rider document
      const riderData = await this.generateTechnicalRiderDocument(booking[0]);
      const riderFile = await this.saveDocumentFile(bookingId, 'technical_rider', riderData);

      // Generate booking confirmation
      const confirmationData = await this.generateBookingConfirmation(booking[0]);
      const confirmationFile = await this.saveDocumentFile(bookingId, 'booking_confirmation', confirmationData);

      // Store file references
      const attachments = [
        {
          bookingId: bookingId,
          fileName: 'Performance Contract.pdf',
          fileType: 'application/pdf',
          fileSize: contractFile.length,
          fileUrl: `/api/bookings/${bookingId}/attachments/performance_contract`,
          category: 'contract',
          createdAt: new Date()
        },
        {
          bookingId: bookingId,
          fileName: 'Technical Rider.pdf',
          fileType: 'application/pdf',
          fileSize: riderFile.length,
          fileUrl: `/api/bookings/${bookingId}/attachments/technical_rider`,
          category: 'technical',
          createdAt: new Date()
        },
        {
          bookingId: bookingId,
          fileName: 'Booking Confirmation.pdf',
          fileType: 'application/pdf',
          fileSize: confirmationFile.length,
          fileUrl: `/api/bookings/${bookingId}/attachments/booking_confirmation`,
          category: 'confirmation',
          createdAt: new Date()
        }
      ];

      await db.insert(bookingMediaFiles).values(attachments);

      return true;
    } catch (error) {
      console.error('Error creating booking attachments:', error);
      return false;
    }
  }

  // Get approval workflow status
  async getApprovalWorkflowStatus(bookingId: number): Promise<BookingApprovalWorkflow | null> {
    try {
      const booking = await db
        .select()
        .from(bookings)
        .where(eq(bookings.id, bookingId))
        .limit(1);

      if (!booking.length) return null;

      return booking[0].workflowData as BookingApprovalWorkflow;
    } catch (error) {
      console.error('Error getting approval workflow status:', error);
      return null;
    }
  }

  // Get all pending approvals for admin
  async getPendingApprovals(adminUserId: number): Promise<any[]> {
    try {
      const pendingBookings = await db
        .select({
          booking: bookings,
          artist: artists,
          booker: users
        })
        .from(bookings)
        .leftJoin(artists, eq(bookings.primaryArtistUserId, artists.userId))
        .leftJoin(users, eq(bookings.bookerUserId, users.id))
        .where(eq(bookings.status, 'under_review'));

      return pendingBookings.map(({ booking, artist, booker }) => ({
        ...booking,
        artistInfo: artist,
        bookerInfo: booker,
        workflowStatus: booking.workflowData as BookingApprovalWorkflow
      }));
    } catch (error) {
      console.error('Error getting pending approvals:', error);
      return [];
    }
  }

  // Helper methods for document generation
  private async generatePerformanceContract(booking: Booking): Promise<Buffer> {
    // Implementation for generating performance contract PDF
    const contractContent = `Performance Contract - Booking #${booking.id}`;
    return Buffer.from(contractContent, 'utf-8');
  }

  private async generateTechnicalRiderDocument(booking: Booking): Promise<Buffer> {
    // Implementation for generating technical rider PDF
    const riderContent = `Technical Rider - Booking #${booking.id}`;
    return Buffer.from(riderContent, 'utf-8');
  }

  private async generateBookingConfirmation(booking: Booking): Promise<Buffer> {
    // Implementation for generating booking confirmation PDF
    const confirmationContent = `Booking Confirmation - #${booking.id}`;
    return Buffer.from(confirmationContent, 'utf-8');
  }

  private async saveDocumentFile(bookingId: number, type: string, data: Buffer): Promise<Buffer> {
    // Implementation for saving document files to storage
    // This would typically save to a file system or cloud storage
    return data;
  }

  // Notification methods
  private async notifyApprovalWorkflowStart(bookingId: number, workflow: BookingApprovalWorkflow): Promise<void> {
    console.log(`Approval workflow started for booking ${bookingId}`);
  }

  private async notifyApprovalStepComplete(bookingId: number, step: string, result: string): Promise<void> {
    console.log(`Approval step ${step} ${result} for booking ${bookingId}`);
  }

  private async notifyBookingRejected(bookingId: number, step: string, reason: string): Promise<void> {
    console.log(`Booking ${bookingId} rejected at ${step}: ${reason}`);
  }
}

export const advancedBookingWorkflows = new AdvancedBookingWorkflows();