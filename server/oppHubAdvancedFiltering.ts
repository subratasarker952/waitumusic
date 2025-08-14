import { DatabaseStorage } from './storage';

interface FilterCriteria {
  categories?: string[];
  regions?: string[];
  compensationTypes?: string[];
  deadlineRange?: {
    start: Date;
    end: Date;
  };
  amountRange?: {
    min: number;
    max: number;
  };
  credibilityThreshold?: number;
  tags?: string[];
  managedTalentOnly?: boolean;
}

interface ScoredOpportunity {
  id: number;
  title: string;
  description: string;
  source: string;
  url: string;
  deadline: Date;
  amount: string;
  requirements: string;
  organizerName: string;
  contactEmail: string;
  contactPhone: string;
  applicationProcess: string;
  credibilityScore: number;
  tags: string;
  categoryId: number;
  location: string;
  compensationType: string;
  verificationStatus: string;
  discoveryMethod: string;
  relevanceScore: number;
  matchingReasons: string[];
  priorityLevel: 'high' | 'medium' | 'low';
}

export class OppHubAdvancedFiltering {
  private storage: DatabaseStorage;

  constructor(storage: DatabaseStorage) {
    this.storage = storage;
  }

  async getFilteredOpportunities(
    criteria: FilterCriteria,
    userProfile?: any
  ): Promise<ScoredOpportunity[]> {
    console.log('🔍 Advanced filtering: Processing criteria for personalized results');
    
    try {
      // Get all opportunities
      const allOpportunities = await this.storage.getOpportunities();
      
      // Apply filters
      let filteredOpportunities = this.applyBasicFilters(allOpportunities, criteria);
      
      // Score and rank opportunities
      const scoredOpportunities = this.scoreOpportunities(filteredOpportunities, userProfile, criteria);
      
      // Sort by relevance score (highest first)
      scoredOpportunities.sort((a, b) => b.relevanceScore - a.relevanceScore);
      
      console.log(`✅ Filtered ${allOpportunities.length} opportunities down to ${scoredOpportunities.length} relevant matches`);
      
      return scoredOpportunities;
    } catch (error) {
      console.error('Error filtering opportunities:', error);
      return [];
    }
  }

  private applyBasicFilters(opportunities: any[], criteria: FilterCriteria): any[] {
    return opportunities.filter(opp => {
      // Category filter
      if (criteria.categories && criteria.categories.length > 0) {
        const categoryMatch = criteria.categories.some(cat => 
          opp.tags.toLowerCase().includes(cat.toLowerCase())
        );
        if (!categoryMatch) return false;
      }

      // Region filter
      if (criteria.regions && criteria.regions.length > 0) {
        const regionMatch = criteria.regions.some(region => 
          opp.location.toLowerCase().includes(region.toLowerCase())
        );
        if (!regionMatch) return false;
      }

      // Compensation type filter
      if (criteria.compensationTypes && criteria.compensationTypes.length > 0) {
        if (!criteria.compensationTypes.includes(opp.compensationType)) return false;
      }

      // Deadline range filter
      if (criteria.deadlineRange) {
        const oppDeadline = new Date(opp.deadline);
        if (oppDeadline < criteria.deadlineRange.start || oppDeadline > criteria.deadlineRange.end) {
          return false;
        }
      }

      // Amount range filter
      if (criteria.amountRange) {
        const amount = parseFloat(opp.amount) || 0;
        if (amount < criteria.amountRange.min || amount > criteria.amountRange.max) {
          return false;
        }
      }

      // Credibility threshold filter
      if (criteria.credibilityThreshold && opp.credibilityScore < criteria.credibilityThreshold) {
        return false;
      }

      // Tags filter
      if (criteria.tags && criteria.tags.length > 0) {
        const tagMatch = criteria.tags.some(tag => 
          opp.tags.toLowerCase().includes(tag.toLowerCase())
        );
        if (!tagMatch) return false;
      }

      // Managed talent priority filter
      if (criteria.managedTalentOnly) {
        // Check if opportunity has managed talent advantages
        const managedTalentKeywords = ['management', 'representation', 'label', 'professional'];
        const hasManagementAdvantage = managedTalentKeywords.some(keyword => 
          opp.description.toLowerCase().includes(keyword) || 
          opp.requirements.toLowerCase().includes(keyword)
        );
        if (!hasManagementAdvantage) return false;
      }

      return true;
    });
  }

  private scoreOpportunities(
    opportunities: any[], 
    userProfile?: any, 
    criteria?: FilterCriteria
  ): ScoredOpportunity[] {
    return opportunities.map(opp => {
      let relevanceScore = 0;
      const matchingReasons: string[] = [];
      let priorityLevel: 'high' | 'medium' | 'low' = 'medium';

      // Base credibility score (30% of total)
      relevanceScore += (opp.credibilityScore / 100) * 30;

      // Deadline urgency scoring (20% of total)
      const daysUntilDeadline = this.getDaysUntilDeadline(opp.deadline);
      if (daysUntilDeadline <= 30) {
        relevanceScore += 20;
        matchingReasons.push('Deadline approaching within 30 days');
      } else if (daysUntilDeadline <= 90) {
        relevanceScore += 15;
        matchingReasons.push('Good application window remaining');
      } else {
        relevanceScore += 10;
      }

      // Amount/value scoring (20% of total)
      const amount = parseFloat(opp.amount) || 0;
      if (amount >= 50000) {
        relevanceScore += 20;
        matchingReasons.push('High-value opportunity ($50,000+)');
        priorityLevel = 'high';
      } else if (amount >= 10000) {
        relevanceScore += 15;
        matchingReasons.push('Substantial funding opportunity ($10,000+)');
      } else if (amount > 0) {
        relevanceScore += 10;
        matchingReasons.push('Paid opportunity');
      } else {
        relevanceScore += 5; // Exposure/volunteer opportunities
      }

      // User profile matching (30% of total)
      if (userProfile) {
        const profileScore = this.calculateProfileMatch(opp, userProfile);
        relevanceScore += profileScore;
        if (profileScore > 20) {
          matchingReasons.push('Strong profile match');
        } else if (profileScore > 15) {
          matchingReasons.push('Good profile compatibility');
        }
      }

      // Managed talent bonus
      if (userProfile?.roleId && [3, 4, 5].includes(userProfile.roleId)) { // managed roles
        const managedKeywords = ['label', 'management', 'professional', 'representation'];
        const hasManagementAdvantage = managedKeywords.some(keyword => 
          opp.description.toLowerCase().includes(keyword)
        );
        if (hasManagementAdvantage) {
          relevanceScore += 10;
          matchingReasons.push('Managed talent advantage');
        }
      }

      // Discovery method bonus
      if (opp.discoveryMethod === 'extended_scan' || opp.discoveryMethod === 'regional_scan') {
        relevanceScore += 5;
        matchingReasons.push('Comprehensive discovery source');
      }

      // Set priority level based on total score
      if (relevanceScore >= 80) {
        priorityLevel = 'high';
      } else if (relevanceScore >= 60) {
        priorityLevel = 'medium';
      } else {
        priorityLevel = 'low';
      }

      return {
        ...opp,
        relevanceScore: Math.round(relevanceScore),
        matchingReasons,
        priorityLevel
      };
    });
  }

  private calculateProfileMatch(opportunity: any, userProfile: any): number {
    let score = 0;

    // Genre matching (if available in user profile)
    if (userProfile.genres) {
      const userGenres = userProfile.genres.map((g: string) => g.toLowerCase());
      const oppText = (opportunity.description + ' ' + opportunity.tags).toLowerCase();
      
      const genreMatches = userGenres.filter((genre: string) => 
        oppText.includes(genre)
      ).length;
      
      if (genreMatches > 0) {
        score += Math.min(genreMatches * 5, 15); // Max 15 points for genre matching
      }
    }

    // Role-based matching
    if (userProfile.roleId) {
      const roleKeywords = this.getRoleKeywords(userProfile.roleId);
      const oppText = (opportunity.description + ' ' + opportunity.requirements).toLowerCase();
      
      const roleMatches = roleKeywords.filter(keyword => 
        oppText.includes(keyword.toLowerCase())
      ).length;
      
      if (roleMatches > 0) {
        score += Math.min(roleMatches * 3, 10); // Max 10 points for role matching
      }
    }

    // Location preference matching
    if (userProfile.location && opportunity.location) {
      const userLocation = userProfile.location.toLowerCase();
      const oppLocation = opportunity.location.toLowerCase();
      
      if (oppLocation.includes(userLocation) || oppLocation === 'global' || oppLocation === 'worldwide') {
        score += 5;
      }
    }

    return score;
  }

  private getRoleKeywords(roleId: number): string[] {
    const roleKeywordMap: Record<number, string[]> = {
      3: ['artist', 'musician', 'performer', 'singer', 'songwriter'], // managed_artist
      4: ['musician', 'instrumentalist', 'producer', 'composer', 'arranger'], // managed_musician  
      5: ['professional', 'industry', 'business', 'management', 'consulting'], // managed_professional
      6: ['artist', 'musician', 'performer', 'singer', 'songwriter'], // artist
      7: ['musician', 'instrumentalist', 'producer', 'composer'], // musician
      8: ['professional', 'industry', 'consultant', 'services'], // professional
      9: ['fan', 'audience', 'community', 'supporter'] // fan
    };

    return roleKeywordMap[roleId] || [];
  }

  private getDaysUntilDeadline(deadline: Date | string): number {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffTime = deadlineDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  async getOpportunityStatistics(): Promise<{
    totalOpportunities: number;
    byCategory: Record<string, number>;
    byRegion: Record<string, number>;
    byCompensationType: Record<string, number>;
    averageCredibilityScore: number;
    upcomingDeadlines: Array<{title: string, deadline: Date, daysRemaining: number}>;
  }> {
    try {
      const opportunities = await this.storage.getOpportunities();
      
      const stats = {
        totalOpportunities: opportunities.length,
        byCategory: this.groupByField(opportunities, 'categoryId'),
        byRegion: this.groupByField(opportunities, 'location'),
        byCompensationType: this.groupByField(opportunities, 'compensationType'),
        averageCredibilityScore: this.calculateAverageCredibility(opportunities),
        upcomingDeadlines: this.getUpcomingDeadlines(opportunities)
      };

      return stats;
    } catch (error) {
      console.error('Error calculating opportunity statistics:', error);
      return {
        totalOpportunities: 0,
        byCategory: {},
        byRegion: {},
        byCompensationType: {},
        averageCredibilityScore: 0,
        upcomingDeadlines: []
      };
    }
  }

  private groupByField(opportunities: any[], field: string): Record<string, number> {
    const groups: Record<string, number> = {};
    opportunities.forEach(opp => {
      const value = opp[field] || 'Unknown';
      groups[value] = (groups[value] || 0) + 1;
    });
    return groups;
  }

  private calculateAverageCredibility(opportunities: any[]): number {
    if (opportunities.length === 0) return 0;
    const total = opportunities.reduce((sum, opp) => sum + (opp.credibilityScore || 0), 0);
    return Math.round(total / opportunities.length);
  }

  private getUpcomingDeadlines(opportunities: any[]): Array<{title: string, deadline: Date, daysRemaining: number}> {
    const now = new Date();
    
    return opportunities
      .filter(opp => new Date(opp.deadline) > now)
      .map(opp => ({
        title: opp.title,
        deadline: new Date(opp.deadline),
        daysRemaining: this.getDaysUntilDeadline(opp.deadline)
      }))
      .sort((a, b) => a.daysRemaining - b.daysRemaining)
      .slice(0, 10); // Top 10 upcoming deadlines
  }

  async generatePersonalizedReport(userId: number): Promise<{
    totalRelevantOpportunities: number;
    highPriorityCount: number;
    upcomingDeadlines: number;
    recommendedActions: string[];
    topOpportunities: ScoredOpportunity[];
  }> {
    try {
      // Get user profile
      const userProfile = await this.storage.getUserProfile(userId);
      
      // Get filtered opportunities for user
      const opportunities = await this.getFilteredOpportunities({}, userProfile);
      
      const highPriorityOpportunities = opportunities.filter(opp => opp.priorityLevel === 'high');
      const upcomingDeadlines = opportunities.filter(opp => 
        this.getDaysUntilDeadline(opp.deadline) <= 30
      ).length;

      const recommendedActions = this.generateRecommendedActions(opportunities, userProfile);
      
      return {
        totalRelevantOpportunities: opportunities.length,
        highPriorityCount: highPriorityOpportunities.length,
        upcomingDeadlines,
        recommendedActions,
        topOpportunities: opportunities.slice(0, 5) // Top 5 most relevant
      };
    } catch (error) {
      console.error('Error generating personalized report:', error);
      return {
        totalRelevantOpportunities: 0,
        highPriorityCount: 0,
        upcomingDeadlines: 0,
        recommendedActions: [],
        topOpportunities: []
      };
    }
  }

  private generateRecommendedActions(opportunities: ScoredOpportunity[], userProfile: any): string[] {
    const actions: string[] = [];
    
    const urgentOpportunities = opportunities.filter(opp => 
      this.getDaysUntilDeadline(opp.deadline) <= 14
    );
    
    if (urgentOpportunities.length > 0) {
      actions.push(`Apply immediately to ${urgentOpportunities.length} opportunities with deadlines within 2 weeks`);
    }
    
    const highValueOpportunities = opportunities.filter(opp => 
      parseFloat(opp.amount) >= 25000
    );
    
    if (highValueOpportunities.length > 0) {
      actions.push(`Prioritize ${highValueOpportunities.length} high-value opportunities ($25,000+)`);
    }
    
    const managedTalentOpportunities = opportunities.filter(opp => 
      opp.matchingReasons.includes('Managed talent advantage')
    );
    
    if (managedTalentOpportunities.length > 0) {
      actions.push(`Leverage management representation for ${managedTalentOpportunities.length} specialized opportunities`);
    }
    
    if (actions.length === 0) {
      actions.push('Review profile completeness to improve opportunity matching');
      actions.push('Set up deadline alerts for upcoming opportunities');
    }
    
    return actions;
  }
}