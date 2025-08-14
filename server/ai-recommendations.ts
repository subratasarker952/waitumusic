import { storage } from './storage';
import type { User, Artist, Musician, Professional, Booking } from '@shared/schema';

export interface CareerRecommendation {
  id: string;
  type: 'opportunity' | 'strategy' | 'development' | 'collaboration';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  actionSteps: string[];
  expectedOutcome: string;
  timeframe: string;
  confidence: number;
  tags: string[];
}

export interface CareerInsights {
  careerStage: string;
  strengths: string[];
  growthAreas: string[];
  marketOpportunities: string[];
  recommendedActions: string[];
  networkingScore: number;
  engagementScore: number;
  bookingTrend: 'increasing' | 'stable' | 'declining';
  revenueProjection: number;
}

export class AIRecommendationEngine {
  
  // Add the missing aiEngine property for external compatibility
  public aiEngine = this;
  
  async generateCareerRecommendations(userId: number): Promise<CareerRecommendation[]> {
    const user = await storage.getUser(userId);
    if (!user) return [];

    const roles = await storage.getRoles();
    const role = roles.find(r => r.id === user.roleId);
    if (!role) return [];

    const recommendations: CareerRecommendation[] = [];

    // Get user-specific data
    const bookings = await this.getUserBookings(userId);
    const profile = await storage.getUserProfile(userId);
    
    // Generate role-specific recommendations
    switch (role.name) {
      case 'artist':
      case 'managed_artist':
        recommendations.push(...await this.generateArtistRecommendations(userId, bookings));
        break;
      case 'musician':
      case 'managed_musician':
        recommendations.push(...await this.generateMusicianRecommendations(userId, bookings));
        break;
      case 'professional':
      case 'managed_professional':
        recommendations.push(...await this.generateProfessionalRecommendations(userId, bookings));
        break;
      case 'fan':
        recommendations.push(...await this.generateFanRecommendations(userId, bookings));
        break;
    }

    // Add general career recommendations
    recommendations.push(...await this.generateGeneralRecommendations(userId, role.name));

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  async generateCareerInsights(userId: number): Promise<CareerInsights> {
    const user = await storage.getUser(userId);
    const roles = await storage.getRoles();
    const role = roles.find(r => r.id === (user?.roleId || 0));
    const bookings = await this.getUserBookings(userId);
    const profile = await storage.getUserProfile(userId);

    // Calculate engagement score based on profile completeness and activity
    const engagementScore = this.calculateEngagementScore(user, profile, bookings);
    
    // Calculate networking score based on connections and collaborations
    const networkingScore = this.calculateNetworkingScore(bookings);
    
    // Analyze booking trends
    const bookingTrend = this.analyzeBookingTrend(bookings);
    
    // Determine career stage
    const careerStage = this.determineCareerStage(role?.name || '', bookings.length, engagementScore);

    return {
      careerStage,
      strengths: this.identifyStrengths(role?.name || '', bookings, profile),
      growthAreas: this.identifyGrowthAreas(role?.name || '', engagementScore, networkingScore),
      marketOpportunities: this.identifyMarketOpportunities(role?.name || '', bookings),
      recommendedActions: this.generateRecommendedActions(role?.name || '', careerStage),
      networkingScore,
      engagementScore,
      bookingTrend,
      revenueProjection: this.calculateRevenueProjection(bookings)
    };
  }

  private async getUserBookings(userId: number): Promise<any[]> {
    try {
      const allBookings = await storage.getAllBookings();
      return allBookings.filter(booking => 
        booking.primaryArtistUserId === userId || 
        (booking.assignedMusicians && booking.assignedMusicians.includes(userId.toString()))
      );
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      return [];
    }
  }

  private async generateArtistRecommendations(userId: number, bookings: any[]): Promise<CareerRecommendation[]> {
    const recommendations: CareerRecommendation[] = [];
    const artist = await storage.getArtist(userId);

    // Booking optimization recommendations
    if (bookings.length < 3) {
      recommendations.push({
        id: `artist-${userId}-booking-increase`,
        type: 'opportunity',
        title: 'Increase Booking Frequency',
        description: 'Your booking activity is below industry average. Focus on marketing and networking to increase performance opportunities.',
        priority: 'high',
        category: 'Performance Growth',
        actionSteps: [
          'Update your artist profile with recent photos and videos',
          'Reach out to 5 new venues each week',
          'Engage with local event organizers on social media',
          'Offer special introductory pricing for new venues'
        ],
        expectedOutcome: 'Increase monthly bookings by 50-70%',
        timeframe: '2-3 months',
        confidence: 85,
        tags: ['booking', 'marketing', 'networking']
      });
    }

    // Price optimization
    if (artist?.basePrice && artist.basePrice < 1000) {
      recommendations.push({
        id: `artist-${userId}-price-optimization`,
        type: 'strategy',
        title: 'Optimize Performance Pricing',
        description: 'Analysis shows you may be underpricing your performances. Consider gradual price increases.',
        priority: 'medium',
        category: 'Revenue Optimization',
        actionSteps: [
          'Research competitor pricing in your area',
          'Create premium and standard performance packages',
          'Implement a 15-20% price increase for new bookings',
          'Add value-added services to justify higher rates'
        ],
        expectedOutcome: 'Increase revenue per performance by 20-30%',
        timeframe: '1-2 months',
        confidence: 78,
        tags: ['pricing', 'revenue', 'strategy']
      });
    }

    // Genre expansion
    recommendations.push({
      id: `artist-${userId}-genre-expansion`,
      type: 'development',
      title: 'Explore Cross-Genre Opportunities',
      description: 'Diversifying your musical style can open new markets and audience segments.',
      priority: 'medium',
      category: 'Artistic Development',
      actionSteps: [
        'Identify complementary genres that match your vocal range',
        'Collaborate with artists from different genres',
        'Create 2-3 cover songs in different styles',
        'Test new material at smaller venues first'
      ],
      expectedOutcome: 'Access to 25% more booking opportunities',
      timeframe: '3-6 months',
      confidence: 72,
      tags: ['genre', 'development', 'market-expansion']
    });

    return recommendations;
  }

  private async generateMusicianRecommendations(userId: number, bookings: any[]): Promise<CareerRecommendation[]> {
    const recommendations: CareerRecommendation[] = [];
    const musician = await storage.getMusician(userId);

    // Session work opportunities
    recommendations.push({
      id: `musician-${userId}-session-work`,
      type: 'opportunity',
      title: 'Expand Session Work Portfolio',
      description: 'Build a diverse portfolio of session work to increase income stability and industry connections.',
      priority: 'high',
      category: 'Session Work',
      actionSteps: [
        'Create a professional demo reel showcasing versatility',
        'Network with recording studios in your area',
        'Join online session musician platforms',
        'Offer competitive hourly rates for new clients'
      ],
      expectedOutcome: 'Secure 3-5 new session clients per month',
      timeframe: '2-4 months',
      confidence: 80,
      tags: ['session-work', 'recording', 'networking']
    });

    // Equipment investment
    recommendations.push({
      id: `musician-${userId}-equipment`,
      type: 'development',
      title: 'Strategic Equipment Investment',
      description: 'Investing in high-quality equipment can significantly improve your marketability and rates.',
      priority: 'medium',
      category: 'Professional Development',
      actionSteps: [
        'Assess current equipment quality and gaps',
        'Research industry-standard equipment for your instrument',
        'Plan budget for gradual equipment upgrades',
        'Consider rent-to-own options for expensive gear'
      ],
      expectedOutcome: 'Qualify for higher-paying professional gigs',
      timeframe: '6-12 months',
      confidence: 75,
      tags: ['equipment', 'investment', 'quality']
    });

    return recommendations;
  }

  private async generateProfessionalRecommendations(userId: number, bookings: any[]): Promise<CareerRecommendation[]> {
    const recommendations: CareerRecommendation[] = [];

    // Service expansion
    recommendations.push({
      id: `professional-${userId}-service-expansion`,
      type: 'opportunity',
      title: 'Expand Service Offerings',
      description: 'Diversifying your professional services can increase client retention and revenue streams.',
      priority: 'high',
      category: 'Service Development',
      actionSteps: [
        'Survey existing clients for additional service needs',
        'Research complementary services in your field',
        'Develop expertise in 1-2 new service areas',
        'Create packages that bundle multiple services'
      ],
      expectedOutcome: 'Increase average client value by 40%',
      timeframe: '3-4 months',
      confidence: 82,
      tags: ['services', 'expansion', 'revenue']
    });

    // Certification and credentials
    recommendations.push({
      id: `professional-${userId}-credentials`,
      type: 'development',
      title: 'Pursue Industry Certifications',
      description: 'Additional certifications can significantly boost your credibility and allow for premium pricing.',
      priority: 'medium',
      category: 'Professional Development',
      actionSteps: [
        'Research relevant industry certifications',
        'Create a timeline for certification completion',
        'Budget for certification costs and study time',
        'Update marketing materials with new credentials'
      ],
      expectedOutcome: 'Justify 25-35% higher service rates',
      timeframe: '6-12 months',
      confidence: 88,
      tags: ['certification', 'credentials', 'premium-pricing']
    });

    return recommendations;
  }

  private async generateFanRecommendations(userId: number, bookings: any[]): Promise<CareerRecommendation[]> {
    const recommendations: CareerRecommendation[] = [];

    // Event discovery
    recommendations.push({
      id: `fan-${userId}-discovery`,
      type: 'opportunity',
      title: 'Discover New Artists and Events',
      description: 'Expand your musical horizons by exploring new artists and attending diverse events.',
      priority: 'medium',
      category: 'Music Discovery',
      actionSteps: [
        'Follow 5 new artists each month',
        'Attend events in genres you haven\'t explored',
        'Join local music community groups',
        'Subscribe to music discovery platforms'
      ],
      expectedOutcome: 'Enhanced musical knowledge and network',
      timeframe: 'Ongoing',
      confidence: 70,
      tags: ['discovery', 'networking', 'community']
    });

    return recommendations;
  }

  private async generateGeneralRecommendations(userId: number, roleName: string): Promise<CareerRecommendation[]> {
    const recommendations: CareerRecommendation[] = [];

    // Social media presence
    recommendations.push({
      id: `general-${userId}-social-media`,
      type: 'strategy',
      title: 'Strengthen Social Media Presence',
      description: 'A strong social media presence is crucial for career growth in the music industry.',
      priority: 'medium',
      category: 'Digital Marketing',
      actionSteps: [
        'Post consistently across all platforms',
        'Engage with followers and industry professionals',
        'Share behind-the-scenes content',
        'Use relevant hashtags and trending topics'
      ],
      expectedOutcome: 'Increase online visibility and engagement by 50%',
      timeframe: '2-3 months',
      confidence: 75,
      tags: ['social-media', 'marketing', 'engagement']
    });

    // Networking
    recommendations.push({
      id: `general-${userId}-networking`,
      type: 'collaboration',
      title: 'Build Industry Connections',
      description: 'Strong professional relationships are key to long-term success in the music industry.',
      priority: 'high',
      category: 'Networking',
      actionSteps: [
        'Attend local music industry events monthly',
        'Join professional music organizations',
        'Collaborate with other platform users',
        'Maintain regular contact with existing connections'
      ],
      expectedOutcome: 'Expand professional network by 100+ contacts',
      timeframe: '6 months',
      confidence: 85,
      tags: ['networking', 'collaboration', 'industry-events']
    });

    return recommendations;
  }

  private calculateEngagementScore(user: any, profile: any, bookings: any[]): number {
    let score = 0;
    
    // Profile completeness (40 points)
    if (profile?.bio) score += 10;
    if (profile?.avatarUrl) score += 10;
    if (profile?.socialLinks) score += 10;
    if (profile?.websiteUrl) score += 10;
    
    // Activity level (40 points)
    if (bookings.length > 0) score += 10;
    if (bookings.length > 5) score += 10;
    if (bookings.length > 10) score += 20;
    
    // Recent activity (20 points)
    const recentBookings = bookings.filter(booking => {
      const bookingDate = new Date(booking.eventDate);
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      return bookingDate > threeMonthsAgo;
    });
    
    if (recentBookings.length > 0) score += 10;
    if (recentBookings.length > 3) score += 10;
    
    return Math.min(score, 100);
  }

  private calculateNetworkingScore(bookings: any[]): number {
    // Calculate based on number of unique venues, clients, and collaborations
    const uniqueVenues = new Set(bookings.map(b => b.venueName)).size;
    const collaborations = bookings.filter(b => b.assignedMusicians && b.assignedMusicians.length > 0).length;
    
    let score = 0;
    score += Math.min(uniqueVenues * 10, 50); // Max 50 points for venue diversity
    score += Math.min(collaborations * 15, 50); // Max 50 points for collaborations
    
    return Math.min(score, 100);
  }

  private analyzeBookingTrend(bookings: any[]): 'increasing' | 'stable' | 'declining' {
    if (bookings.length < 2) return 'stable';
    
    const now = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const recentBookings = bookings.filter(b => new Date(b.eventDate) > threeMonthsAgo).length;
    const olderBookings = bookings.filter(b => {
      const date = new Date(b.eventDate);
      return date > sixMonthsAgo && date <= threeMonthsAgo;
    }).length;
    
    if (recentBookings > olderBookings * 1.2) return 'increasing';
    if (recentBookings < olderBookings * 0.8) return 'declining';
    return 'stable';
  }

  private determineCareerStage(roleName: string, bookingCount: number, engagementScore: number): string {
    if (bookingCount === 0 && engagementScore < 30) return 'Getting Started';
    if (bookingCount < 5 && engagementScore < 50) return 'Early Career';
    if (bookingCount < 15 && engagementScore < 75) return 'Developing';
    if (bookingCount < 30 && engagementScore < 85) return 'Established';
    return 'Advanced Professional';
  }

  private identifyStrengths(roleName: string, bookings: any[], profile: any): string[] {
    const strengths: string[] = [];
    
    if (bookings.length > 10) strengths.push('Consistent Booking Activity');
    if (profile?.bio && profile.bio.length > 100) strengths.push('Strong Professional Presentation');
    if (profile?.socialLinks) strengths.push('Active Social Media Presence');
    if (bookings.some(b => b.totalBudget > 5000)) strengths.push('High-Value Client Relationships');
    
    // Add role-specific strengths
    switch (roleName) {
      case 'artist':
      case 'managed_artist':
        strengths.push('Performance Experience');
        break;
      case 'musician':
      case 'managed_musician':
        strengths.push('Musical Technical Skills');
        break;
      case 'professional':
      case 'managed_professional':
        strengths.push('Industry Expertise');
        break;
    }
    
    return strengths.length > 0 ? strengths : ['Dedicated to Music Career'];
  }

  private identifyGrowthAreas(roleName: string, engagementScore: number, networkingScore: number): string[] {
    const growthAreas: string[] = [];
    
    if (engagementScore < 50) growthAreas.push('Profile Development');
    if (networkingScore < 40) growthAreas.push('Professional Networking');
    if (engagementScore < 70) growthAreas.push('Platform Engagement');
    
    // Add role-specific growth areas
    switch (roleName) {
      case 'artist':
      case 'managed_artist':
        growthAreas.push('Marketing Strategy');
        break;
      case 'musician':
      case 'managed_musician':
        growthAreas.push('Equipment Investment');
        break;
      case 'professional':
      case 'managed_professional':
        growthAreas.push('Service Diversification');
        break;
    }
    
    return growthAreas.length > 0 ? growthAreas : ['Continuous Learning'];
  }

  private identifyMarketOpportunities(roleName: string, bookings: any[]): string[] {
    const opportunities: string[] = [];
    
    // Analyze venue types and suggest expansion
    const venueTypes = new Set(bookings.map(b => b.eventType || 'General Event'));
    
    if (!venueTypes.has('Wedding')) opportunities.push('Wedding Market');
    if (!venueTypes.has('Corporate')) opportunities.push('Corporate Events');
    if (!venueTypes.has('Festival')) opportunities.push('Festival Circuit');
    
    // Add seasonal opportunities
    opportunities.push('Holiday Season Events');
    opportunities.push('Summer Festival Season');
    
    return opportunities;
  }

  private generateRecommendedActions(roleName: string, careerStage: string): string[] {
    const actions: string[] = [];
    
    // Stage-specific actions
    switch (careerStage) {
      case 'Getting Started':
        actions.push('Complete your profile', 'Upload professional photos', 'Create your first booking');
        break;
      case 'Early Career':
        actions.push('Build your portfolio', 'Network with industry professionals', 'Optimize your pricing');
        break;
      case 'Developing':
        actions.push('Expand your service offerings', 'Invest in professional development', 'Build repeat client base');
        break;
      case 'Established':
        actions.push('Mentor newcomers', 'Explore new markets', 'Consider premium positioning');
        break;
      case 'Advanced Professional':
        actions.push('Share industry expertise', 'Lead collaborations', 'Explore teaching opportunities');
        break;
    }
    
    return actions;
  }

  private calculateRevenueProjection(bookings: any[]): number {
    if (bookings.length === 0) return 0;
    
    const recentBookings = bookings.filter(booking => {
      const bookingDate = new Date(booking.eventDate);
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      return bookingDate > threeMonthsAgo;
    });
    
    const avgBookingValue = recentBookings.reduce((sum, booking) => 
      sum + (booking.finalPrice || booking.totalBudget || 0), 0) / recentBookings.length;
    
    // Project based on recent activity and growth trend
    const monthlyBookings = recentBookings.length / 3;
    return Math.round(avgBookingValue * monthlyBookings * 12);
  }
}

export const advancedRecommendationEngine = new AIRecommendationEngine();
export const advancedEngine = advancedRecommendationEngine;