import { DatabaseStorage } from './storage';
import { sql } from 'drizzle-orm';
import { db } from './db';

interface UserProfile {
  id: number;
  email: string;
  fullName: string;
  roleId: number;
  talentProfile?: any;
  skills?: string[];
  genres?: string[];
  location?: string;
  experience_level?: string;
  budget_range?: string;
  career_goals?: string[];
}

interface OpportunityMatch {
  opportunity_id: number;
  opportunity_title: string;
  opportunity_description: string;
  organizer_name: string;
  contact_email: string;
  application_process: string;
  credibility_score: number;
  match_score: number;
  match_reasons: string[];
  category: string;
  deadline: string;
  amount: string;
  location: string;
  compensation_type: string;
  requirements: string;
  tags: string;
  url: string;
}

export class OpportunityMatchingEngine {
  private storage: DatabaseStorage;

  constructor() {
    this.storage = new DatabaseStorage();
  }

  async findMatchesForUser(userId: number): Promise<OpportunityMatch[]> {
    try {
      // Get user profile and preferences
      const userProfile = await this.getUserProfile(userId);
      if (!userProfile) {
        throw new Error('User profile not found');
      }

      // Get all available opportunities
      const opportunities = await this.storage.getOpportunities();
      
      // Calculate match scores for each opportunity
      const matches: OpportunityMatch[] = [];
      
      for (const opportunity of opportunities) {
        const matchResult = this.calculateMatchScore(userProfile, opportunity);
        
        if (matchResult.match_score >= 60) { // Only include matches above 60%
          matches.push({
            opportunity_id: opportunity.id,
            opportunity_title: opportunity.title,
            opportunity_description: opportunity.description,
            organizer_name: opportunity.organizer_name || opportunity.source,
            contact_email: opportunity.contact_email || 'Contact organizer',
            application_process: opportunity.application_process || 'Visit source for details',
            credibility_score: opportunity.credibility_score || 75,
            match_score: matchResult.match_score,
            match_reasons: matchResult.reasons,
            category: this.getCategoryName(opportunity.category_id),
            deadline: opportunity.deadline,
            amount: opportunity.amount || '0',
            location: opportunity.location || 'Various',
            compensation_type: opportunity.compensation_type || 'exposure',
            requirements: opportunity.requirements,
            tags: opportunity.tags || '',
            url: opportunity.url
          });
        }
      }

      // Sort by match score (highest first)
      return matches.sort((a, b) => b.match_score - a.match_score);

    } catch (error) {
      console.error('Error finding opportunity matches:', error);
      return [];
    }
  }

  private async getUserProfile(userId: number): Promise<UserProfile | null> {
    try {
      // Get user basic info
      const userResult = await db.execute(sql`
        SELECT id, email, full_name, role_id FROM users WHERE id = ${userId}
      `);
      
      if (!userResult.rows || userResult.rows.length === 0) {
        return null;
      }

      const user = userResult.rows[0] as any;

      // Get talent profile if exists
      let talentProfile = null;
      try {
        const talentResult = await db.execute(sql`
          SELECT * FROM talent_profiles WHERE user_id = ${userId}
        `);
        talentProfile = talentResult.rows?.[0] || null;
      } catch (error) {
        // Talent profile table might not exist, continue without it
      }

      return {
        id: user.id,
        email: user.email,
        fullName: user.full_name || '',
        roleId: user.role_id,
        talentProfile,
        skills: this.extractSkills(talentProfile),
        genres: this.extractGenres(talentProfile),
        location: talentProfile?.location || 'Global',
        experience_level: this.determineExperienceLevel(user.role_id),
        career_goals: this.determineCareerGoals(user.role_id)
      };
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  private calculateMatchScore(user: UserProfile, opportunity: any): { match_score: number; reasons: string[] } {
    let score = 0;
    const reasons: string[] = [];
    const maxScore = 100;

    // Role-based matching (30 points max)
    const roleMatch = this.calculateRoleMatch(user.roleId, opportunity);
    score += roleMatch.score;
    if (roleMatch.score > 0) {
      reasons.push(...roleMatch.reasons);
    }

    // Management status bonus (25 points max)
    if (this.isManagedUser(user.roleId)) {
      if (opportunity.tags?.includes('managed_talent') || opportunity.requirements?.includes('management')) {
        score += 25;
        reasons.push('Perfect for managed talent - professional representation required');
      }
    }

    // Genre matching (20 points max)
    const genreMatch = this.calculateGenreMatch(user.genres || [], opportunity);
    score += genreMatch.score;
    if (genreMatch.score > 0) {
      reasons.push(...genreMatch.reasons);
    }

    // Location matching (10 points max)
    const locationMatch = this.calculateLocationMatch(user.location || '', opportunity.location || '');
    score += locationMatch.score;
    if (locationMatch.score > 0) {
      reasons.push(locationMatch.reason);
    }

    // Credibility bonus (10 points max)
    const credibilityScore = opportunity.credibility_score || 75;
    if (credibilityScore >= 90) {
      score += 10;
      reasons.push('High credibility source (90+ score)');
    } else if (credibilityScore >= 80) {
      score += 7;
      reasons.push('Good credibility source (80+ score)');
    } else if (credibilityScore >= 70) {
      score += 5;
      reasons.push('Decent credibility source (70+ score)');
    }

    // Compensation type bonus (5 points max)
    if (opportunity.compensation_type === 'paid' && this.isManagedUser(user.roleId)) {
      score += 5;
      reasons.push('Paid opportunity for professional talent');
    }

    return {
      match_score: Math.min(Math.round(score), maxScore),
      reasons: reasons.slice(0, 5) // Limit to top 5 reasons
    };
  }

  private calculateRoleMatch(roleId: number, opportunity: any): { score: number; reasons: string[] } {
    const reasons: string[] = [];
    let score = 0;

    // Role-specific opportunity matching
    switch (roleId) {
      case 3: // Managed Artist
      case 4: // Artist
        if (opportunity.title.includes('Artist') || opportunity.title.includes('Showcase') || 
            opportunity.title.includes('Performance') || opportunity.tags?.includes('performance')) {
          score = 30;
          reasons.push('Perfect match for artist opportunities');
        } else if (opportunity.title.includes('Music') || opportunity.title.includes('Creative')) {
          score = 20;
          reasons.push('Good fit for music professionals');
        }
        break;
        
      case 5: // Managed Musician  
      case 6: // Musician
        if (opportunity.title.includes('Musician') || opportunity.title.includes('Session') ||
            opportunity.title.includes('Studio') || opportunity.tags?.includes('musician')) {
          score = 30;
          reasons.push('Excellent match for musicians');
        } else if (opportunity.title.includes('Music') || opportunity.title.includes('Performance')) {
          score = 25;
          reasons.push('Strong fit for music performance');
        }
        break;
        
      case 7: // Managed Professional
      case 8: // Professional  
        if (opportunity.title.includes('Professional') || opportunity.title.includes('Industry') ||
            opportunity.title.includes('Business') || opportunity.tags?.includes('professional')) {
          score = 30;
          reasons.push('Ideal for music industry professionals');
        } else if (opportunity.title.includes('Network') || opportunity.title.includes('Connection')) {
          score = 25;
          reasons.push('Great networking opportunity');
        }
        break;
        
      default:
        score = 15; // Base score for any music-related opportunity
        reasons.push('General music industry opportunity');
    }

    return { score, reasons };
  }

  private calculateGenreMatch(userGenres: string[], opportunity: any): { score: number; reasons: string[] } {
    const reasons: string[] = [];
    let score = 0;

    if (!userGenres.length) {
      return { score: 10, reasons: ['Open to all genres'] }; // Base score if no specific genres
    }

    const opportunityText = `${opportunity.title} ${opportunity.description} ${opportunity.tags || ''}`.toLowerCase();
    
    const genreMatches = userGenres.filter(genre => 
      opportunityText.includes(genre.toLowerCase())
    );

    if (genreMatches.length > 0) {
      score = Math.min(20, genreMatches.length * 10);
      reasons.push(`Matches your genres: ${genreMatches.join(', ')}`);
    } else {
      // Check for broader music categories
      const musicKeywords = ['music', 'song', 'artist', 'performance', 'creative'];
      const hasMusicalContext = musicKeywords.some(keyword => opportunityText.includes(keyword));
      
      if (hasMusicalContext) {
        score = 10;
        reasons.push('Relevant to music industry');
      }
    }

    return { score, reasons };
  }

  private calculateLocationMatch(userLocation: string, opportunityLocation: string): { score: number; reason: string } {
    if (!userLocation || !opportunityLocation) {
      return { score: 5, reason: 'Location flexible' };
    }

    const userLoc = userLocation.toLowerCase();
    const oppLoc = opportunityLocation.toLowerCase();

    if (oppLoc.includes('global') || oppLoc.includes('online') || oppLoc.includes('remote')) {
      return { score: 10, reason: 'Global/remote opportunity' };
    }

    if (userLoc.includes(oppLoc) || oppLoc.includes(userLoc)) {
      return { score: 10, reason: 'Perfect location match' };
    }

    // Check for regional matches
    const regions = {
      'caribbean': ['dominica', 'trinidad', 'barbados', 'jamaica', 'antigua'],
      'north america': ['usa', 'canada', 'united states', 'america'],
      'europe': ['uk', 'france', 'germany', 'spain', 'italy'],
      'asia': ['japan', 'korea', 'china', 'singapore', 'hong kong']
    };

    for (const [region, countries] of Object.entries(regions)) {
      const userInRegion = countries.some(country => userLoc.includes(country));
      const oppInRegion = countries.some(country => oppLoc.includes(country)) || oppLoc.includes(region);
      
      if (userInRegion && oppInRegion) {
        return { score: 7, reason: `Regional match (${region})` };
      }
    }

    return { score: 3, reason: 'Different location, but possible' };
  }

  private extractSkills(talentProfile: any): string[] {
    if (!talentProfile) return [];
    
    const skills: string[] = [];
    
    // Extract from various profile fields
    if (talentProfile.instruments) skills.push(...talentProfile.instruments.split(','));
    if (talentProfile.specializations) skills.push(...talentProfile.specializations.split(','));
    if (talentProfile.skills) skills.push(...talentProfile.skills.split(','));
    
    return skills.map(s => s.trim()).filter(s => s.length > 0);
  }

  private extractGenres(talentProfile: any): string[] {
    if (!talentProfile) return [];
    
    const genres: string[] = [];
    
    if (talentProfile.genres) genres.push(...talentProfile.genres.split(','));
    if (talentProfile.musical_styles) genres.push(...talentProfile.musical_styles.split(','));
    
    return genres.map(g => g.trim()).filter(g => g.length > 0);
  }

  private determineExperienceLevel(roleId: number): string {
    if ([3, 5, 7].includes(roleId)) return 'Professional'; // Managed users
    if ([4, 6, 8].includes(roleId)) return 'Intermediate'; // Regular users
    return 'Beginner';
  }

  private determineCareerGoals(roleId: number): string[] {
    const goals: { [key: number]: string[] } = {
      3: ['Recording deals', 'Live performances', 'Music licensing', 'Brand partnerships'],
      4: ['Building fanbase', 'Recording opportunities', 'Live shows', 'Music distribution'],
      5: ['Session work', 'Band collaborations', 'Studio recordings', 'Live performances'],
      6: ['Local gigs', 'Networking', 'Skill development', 'Collaboration'],
      7: ['Industry networking', 'Business development', 'Client acquisition', 'Partnerships'],
      8: ['Career growth', 'Skill building', 'Industry connections', 'Service expansion'],
      9: ['Music discovery', 'Artist support', 'Community engagement', 'Event attendance']
    };
    
    return goals[roleId] || ['General music involvement'];
  }

  private isManagedUser(roleId: number): boolean {
    return [3, 5, 7].includes(roleId); // Managed Artist, Managed Musician, Managed Professional
  }

  private getCategoryName(categoryId: number = 1): string {
    const categories: { [key: number]: string } = {
      1: 'Music Festivals',
      2: 'Recording Opportunities', 
      3: 'Sync Licensing',
      4: 'Brand Partnerships',
      5: 'Showcases',
      6: 'Collaborations',
      7: 'Education',
      8: 'Networking'
    };
    
    return categories[categoryId] || 'General';
  }

  // Generate personalized recommendations
  async generateRecommendations(userId: number): Promise<{
    matches: OpportunityMatch[];
    insights: string[];
    next_actions: string[];
    profile_tips: string[];
  }> {
    const matches = await this.findMatchesForUser(userId);
    const userProfile = await this.getUserProfile(userId);
    
    const insights = this.generateInsights(matches, userProfile);
    const nextActions = this.generateNextActions(matches, userProfile);
    const profileTips = this.generateProfileTips(userProfile);

    return {
      matches: matches.slice(0, 10), // Top 10 matches
      insights,
      next_actions: nextActions,
      profile_tips: profileTips
    };
  }

  private generateInsights(matches: OpportunityMatch[], user: UserProfile | null): string[] {
    const insights: string[] = [];
    
    if (!matches.length) {
      insights.push('No high-quality matches found currently. Consider expanding your profile or checking back later.');
      return insights;
    }

    const avgScore = matches.reduce((sum, m) => sum + m.match_score, 0) / matches.length;
    insights.push(`Found ${matches.length} quality opportunities with average ${Math.round(avgScore)}% match`);
    
    const paidOpps = matches.filter(m => m.compensation_type === 'paid').length;
    if (paidOpps > 0) {
      insights.push(`${paidOpps} opportunities offer paid compensation`);
    }
    
    const highCredibility = matches.filter(m => m.credibility_score >= 85).length;
    if (highCredibility > 0) {
      insights.push(`${highCredibility} opportunities from highly credible sources (85+ score)`);
    }
    
    if (user && this.isManagedUser(user.roleId)) {
      const managedOpps = matches.filter(m => m.tags.includes('managed_talent')).length;
      insights.push(`${managedOpps} opportunities specifically target managed talent`);
    }

    return insights;
  }

  private generateNextActions(matches: OpportunityMatch[], user: UserProfile | null): string[] {
    const actions: string[] = [];
    
    if (matches.length === 0) {
      actions.push('Complete your talent profile to improve matching');
      actions.push('Check back in 24-48 hours for new opportunities');
      return actions;
    }

    const topMatch = matches[0];
    actions.push(`Review "${topMatch.opportunity_title}" - ${topMatch.match_score}% match`);
    
    const urgentOpps = matches.filter(m => {
      const deadline = new Date(m.deadline);
      const daysUntil = (deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      return daysUntil <= 7;
    });
    
    if (urgentOpps.length > 0) {
      actions.push(`${urgentOpps.length} opportunities have deadlines within 7 days`);
    }
    
    actions.push('Contact organizers directly using provided email addresses');
    actions.push('Follow application processes carefully for best results');

    return actions;
  }

  private generateProfileTips(user: UserProfile | null): string[] {
    const tips: string[] = [];
    
    if (!user) {
      tips.push('Complete your user profile to get personalized recommendations');
      return tips;
    }

    if (!user.talentProfile) {
      tips.push('Create a talent profile to improve opportunity matching by 40%');
    }
    
    if (!user.genres || user.genres.length === 0) {
      tips.push('Add your musical genres to find more relevant opportunities');
    }
    
    if (!user.skills || user.skills.length === 0) {
      tips.push('List your skills and instruments for better matching');
    }
    
    if (user.location === 'Global') {
      tips.push('Specify your location to find local and regional opportunities');
    }
    
    if (!this.isManagedUser(user.roleId)) {
      tips.push('Consider applying for managed status to access premium opportunities');
    }

    return tips;
  }
}