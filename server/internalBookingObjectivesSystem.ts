/**
 * Internal Booking Objectives System
 * Provides internal objectives input capabilities for admin, superadmin, and managed talent
 * These objectives are not visible to bookers and are used for internal planning and guidance
 */

export interface InternalBookingObjective {
  id: number;
  bookingId: number;
  objectiveType: 'marketing' | 'photography' | 'videography' | 'social_media' | 'revenue' | 'strategic';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  targetDeadline?: Date;
  assignedTo?: number; // User ID of responsible person
  status: 'planning' | 'in_progress' | 'completed' | 'cancelled';
  confidential: boolean; // Hidden from bookers
  createdBy: number;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  relatedProfessionals: number[]; // Professional user IDs involved
}

export interface ObjectiveTemplate {
  id: number;
  name: string;
  category: string;
  objectives: Array<{
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    estimatedDuration: string;
  }>;
  applicableArtistTypes: string[];
  applicableBookingTypes: string[];
}

export class InternalBookingObjectivesSystem {
  
  /**
   * Create internal booking objective (admin/superadmin/managed talent only)
   */
  async createInternalObjective(
    objectiveData: Omit<InternalBookingObjective, 'id' | 'createdAt' | 'updatedAt'>,
    creatorRole: string
  ): Promise<InternalBookingObjective> {
    
    // Verify creator has permission to create internal objectives
    if (!this.hasInternalObjectivePermission(creatorRole)) {
      throw new Error('Insufficient permissions to create internal booking objectives');
    }

    const objective: InternalBookingObjective = {
      id: Date.now(),
      ...objectiveData,
      confidential: true, // Always confidential from bookers
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('Internal booking objective created:', {
      ...objective,
      note: 'Hidden from bookers - for internal planning only'
    });

    return objective;
  }

  /**
   * Get internal objectives for booking (admin/superadmin/managed talent only)
   */
  async getInternalObjectives(
    bookingId: number,
    requestorRole: string,
    requestorUserId: number
  ): Promise<InternalBookingObjective[]> {
    
    if (!this.hasInternalObjectivePermission(requestorRole)) {
      throw new Error('Access denied - internal objectives are confidential');
    }

    // Mock internal objectives for demonstration
    const mockObjectives: InternalBookingObjective[] = [
      {
        id: 1,
        bookingId,
        objectiveType: 'photography',
        title: 'Album Artwork Photography',
        description: 'Capture high-resolution images suitable for album artwork and promotional materials. Focus on artistic shots that reflect the artist\'s brand and music style.',
        priority: 'high',
        targetDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        assignedTo: 25, // Professional photographer user ID
        status: 'planning',
        confidential: true,
        createdBy: requestorUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ['album', 'artwork', 'promotional', 'brand'],
        relatedProfessionals: [25]
      },
      {
        id: 2,
        bookingId,
        objectiveType: 'social_media',
        title: 'Instagram/TikTok Content Creation',
        description: 'Generate social media content during the performance for Instagram Stories, TikTok videos, and Facebook posts. Focus on behind-the-scenes content and audience engagement moments.',
        priority: 'medium',
        targetDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        assignedTo: 26, // Social media specialist user ID
        status: 'planning',
        confidential: true,
        createdBy: requestorUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ['social_media', 'instagram', 'tiktok', 'engagement'],
        relatedProfessionals: [26]
      },
      {
        id: 3,
        bookingId,
        objectiveType: 'videography',
        title: 'Performance Documentation',
        description: 'Record full performance for potential music video content and promotional use. Capture multiple angles and audience reactions for comprehensive coverage.',
        priority: 'high',
        targetDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        assignedTo: 27, // Videographer user ID
        status: 'planning',
        confidential: true,
        createdBy: requestorUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ['video', 'performance', 'documentation', 'promotional'],
        relatedProfessionals: [27]
      },
      {
        id: 4,
        bookingId,
        objectiveType: 'revenue',
        title: 'Merchandise Sales Opportunity',
        description: 'Set up merchandise booth during event to maximize revenue from physical product sales. Target $500+ in merchandise revenue.',
        priority: 'medium',
        status: 'planning',
        confidential: true,
        createdBy: requestorUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ['merchandise', 'revenue', 'sales'],
        relatedProfessionals: []
      },
      {
        id: 5,
        bookingId,
        objectiveType: 'strategic',
        title: 'Industry Network Building',
        description: 'Identify and connect with industry professionals in attendance. Focus on potential collaboration opportunities and future booking contacts.',
        priority: 'low',
        status: 'planning',
        confidential: true,
        createdBy: requestorUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ['networking', 'industry', 'collaboration'],
        relatedProfessionals: []
      }
    ];

    return mockObjectives;
  }

  /**
   * Update internal objective status
   */
  async updateObjectiveStatus(
    objectiveId: number,
    newStatus: InternalBookingObjective['status'],
    updatedBy: number,
    updaterRole: string
  ): Promise<InternalBookingObjective> {
    
    if (!this.hasInternalObjectivePermission(updaterRole)) {
      throw new Error('Insufficient permissions to update internal objectives');
    }

    // Mock update (in real implementation, would update database)
    const updatedObjective: InternalBookingObjective = {
      id: objectiveId,
      bookingId: 1,
      objectiveType: 'photography',
      title: 'Updated Objective',
      description: 'Objective has been updated',
      priority: 'medium',
      status: newStatus,
      confidential: true,
      createdBy: updatedBy,
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: [],
      relatedProfessionals: []
    };

    console.log(`Internal objective ${objectiveId} status updated to: ${newStatus}`);
    return updatedObjective;
  }

  /**
   * Get objective templates for quick creation
   */
  async getObjectiveTemplates(): Promise<ObjectiveTemplate[]> {
    return [
      {
        id: 1,
        name: 'Album Promotion Package',
        category: 'Marketing',
        objectives: [
          {
            title: 'Professional Photography',
            description: 'High-resolution album artwork and promotional photos',
            priority: 'high',
            estimatedDuration: '2-3 hours'
          },
          {
            title: 'Behind-the-Scenes Video',
            description: 'Documentary-style content for social media and press',
            priority: 'medium',
            estimatedDuration: '1-2 hours'
          },
          {
            title: 'Social Media Content',
            description: 'Instagram stories, TikTok videos, and Facebook posts',
            priority: 'high',
            estimatedDuration: 'Ongoing during event'
          }
        ],
        applicableArtistTypes: ['managed_artist', 'artist'],
        applicableBookingTypes: ['album_release', 'promotional']
      },
      {
        id: 2,
        name: 'Live Performance Documentation',
        category: 'Content Creation',
        objectives: [
          {
            title: 'Multi-Camera Recording',
            description: 'Professional multi-angle performance recording',
            priority: 'high',
            estimatedDuration: 'Full performance'
          },
          {
            title: 'Audience Interaction Capture',
            description: 'Document audience engagement and reactions',
            priority: 'medium',
            estimatedDuration: 'Throughout event'
          },
          {
            title: 'Sound Recording',
            description: 'High-quality audio recording for potential release',
            priority: 'high',
            estimatedDuration: 'Full performance'
          }
        ],
        applicableArtistTypes: ['managed_artist', 'managed_musician'],
        applicableBookingTypes: ['live_performance', 'concert']
      },
      {
        id: 3,
        name: 'Brand Development Focus',
        category: 'Strategic',
        objectives: [
          {
            title: 'Brand Consistency Documentation',
            description: 'Ensure all content aligns with artist brand guidelines',
            priority: 'high',
            estimatedDuration: 'Throughout event'
          },
          {
            title: 'Market Research',
            description: 'Gather audience demographic and engagement data',
            priority: 'medium',
            estimatedDuration: '30 minutes'
          },
          {
            title: 'Networking Opportunities',
            description: 'Connect with industry professionals in attendance',
            priority: 'low',
            estimatedDuration: 'Pre/post event'
          }
        ],
        applicableArtistTypes: ['managed_artist', 'managed_musician', 'managed_professional'],
        applicableBookingTypes: ['all']
      }
    ];
  }

  /**
   * Generate internal objectives from booking details and artist profile
   */
  async generateAutomaticObjectives(
    bookingId: number,
    artistUserId: number,
    bookingType: string,
    artistManagedStatus: boolean
  ): Promise<InternalBookingObjective[]> {
    
    if (!artistManagedStatus) {
      return []; // Only generate for managed artists
    }

    const autoObjectives: InternalBookingObjective[] = [];

    // Always include basic documentation for managed artists
    autoObjectives.push({
      id: Date.now() + Math.random(),
      bookingId,
      objectiveType: 'photography',
      title: 'Professional Documentation',
      description: 'Capture professional-quality images of the performance for press kit and promotional use',
      priority: 'high',
      status: 'planning',
      confidential: true,
      createdBy: 1, // System generated
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: ['documentation', 'professional', 'press_kit'],
      relatedProfessionals: []
    });

    // Add social media objective for all managed artists
    autoObjectives.push({
      id: Date.now() + Math.random() + 1,
      bookingId,
      objectiveType: 'social_media',
      title: 'Social Media Content Generation',
      description: 'Create engaging social media content during the event to maintain online presence and fan engagement',
      priority: 'medium',
      status: 'planning',
      confidential: true,
      createdBy: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: ['social_media', 'engagement', 'content'],
      relatedProfessionals: []
    });

    // Add revenue-focused objective
    autoObjectives.push({
      id: Date.now() + Math.random() + 2,
      bookingId,
      objectiveType: 'revenue',
      title: 'Revenue Optimization',
      description: 'Maximize revenue opportunities through merchandise sales and future booking lead generation',
      priority: 'medium',
      status: 'planning',
      confidential: true,
      createdBy: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: ['revenue', 'merchandise', 'leads'],
      relatedProfessionals: []
    });

    return autoObjectives;
  }

  /**
   * Check if user has permission to access internal objectives
   */
  private hasInternalObjectivePermission(role: string): boolean {
    const authorizedRoles = [
      'superadmin',
      'admin', 
      'managed_artist',
      'managed_musician',
      'managed_professional'
    ];
    return authorizedRoles.includes(role);
  }

  /**
   * Generate objectives report for booking analysis
   */
  async generateObjectivesReport(bookingId: number): Promise<{
    totalObjectives: number;
    completedObjectives: number;
    inProgressObjectives: number;
    pendingObjectives: number;
    completionRate: number;
    professionalInvolvement: {
      photographers: number;
      videographers: number;
      marketingSpecialists: number;
      socialMediaSpecialists: number;
    };
    estimatedROI: number;
  }> {
    
    const objectives = await this.getInternalObjectives(bookingId, 'superadmin', 1);
    
    const completed = objectives.filter(o => o.status === 'completed').length;
    const inProgress = objectives.filter(o => o.status === 'in_progress').length;
    const pending = objectives.filter(o => o.status === 'planning').length;

    return {
      totalObjectives: objectives.length,
      completedObjectives: completed,
      inProgressObjectives: inProgress,
      pendingObjectives: pending,
      completionRate: objectives.length > 0 ? (completed / objectives.length) * 100 : 0,
      professionalInvolvement: {
        photographers: objectives.filter(o => o.objectiveType === 'photography').length,
        videographers: objectives.filter(o => o.objectiveType === 'videography').length,
        marketingSpecialists: objectives.filter(o => o.objectiveType === 'marketing').length,
        socialMediaSpecialists: objectives.filter(o => o.objectiveType === 'social_media').length
      },
      estimatedROI: this.calculateObjectivesROI(objectives)
    };
  }

  /**
   * Calculate ROI from internal objectives
   */
  private calculateObjectivesROI(objectives: InternalBookingObjective[]): number {
    // Calculate estimated ROI based on objective types and completion
    let estimatedValue = 0;
    
    objectives.forEach(objective => {
      switch (objective.objectiveType) {
        case 'photography':
          estimatedValue += 500; // Professional photos worth $500
          break;
        case 'videography':
          estimatedValue += 1000; // Video content worth $1000
          break;
        case 'social_media':
          estimatedValue += 300; // Social media content worth $300
          break;
        case 'marketing':
          estimatedValue += 750; // Marketing materials worth $750
          break;
        case 'revenue':
          estimatedValue += 1000; // Direct revenue objectives worth $1000
          break;
        case 'strategic':
          estimatedValue += 200; // Strategic value worth $200
          break;
      }
    });

    return estimatedValue;
  }
}

export const internalBookingObjectivesSystem = new InternalBookingObjectivesSystem();