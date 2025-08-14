import { storage } from './storage';

interface OpportunityTemplate {
  title: string;
  organizer: string;
  description: string;
  compensationType: 'paid' | 'revenue_share' | 'exposure' | 'volunteer';
  compensationRange?: string;
  applicationDeadline: string;
  tags: string[];
  sourceUrl: string;
  location?: string;
  categoryId: number;
  requirements?: string[];
  applicationProcess?: string;
  contactInfo?: string;
  credibilityScore: number;
}

export class OpportunityGenerator {
  
  // Category definitions matching schema
  private categories = {
    1: 'Music Festivals',
    2: 'Recording Opportunities', 
    3: 'Sync Licensing',
    4: 'Brand Partnerships',
    5: 'Showcases',
    6: 'Collaborations',
    7: 'Education',
    8: 'Networking',
    9: 'Grants & Funding',
    10: 'Competitions',
    11: 'Residencies',
    12: 'Media Features'
  };

  async generateOpportunitiesForAllCategories(): Promise<void> {
    console.log('🎯 Generating comprehensive opportunities across all categories...');
    
    const allOpportunities: OpportunityTemplate[] = [];
    
    // Generate opportunities for each category
    allOpportunities.push(...this.generateMusicFestivalOpportunities());
    allOpportunities.push(...this.generateRecordingOpportunities());
    allOpportunities.push(...this.generateSyncLicensingOpportunities());
    allOpportunities.push(...this.generateBrandPartnershipOpportunities());
    allOpportunities.push(...this.generateShowcaseOpportunities());
    allOpportunities.push(...this.generateCollaborationOpportunities());
    allOpportunities.push(...this.generateEducationOpportunities());
    allOpportunities.push(...this.generateNetworkingOpportunities());
    allOpportunities.push(...this.generateGrantsAndFundingOpportunities());
    allOpportunities.push(...this.generateCompetitionOpportunities());
    allOpportunities.push(...this.generateResidencyOpportunities());
    allOpportunities.push(...this.generateMediaFeatureOpportunities());
    
    // Store all opportunities
    for (const opportunity of allOpportunities) {
      try {
        await this.storeOpportunity(opportunity);
      } catch (error) {
        console.error(`Error storing opportunity: ${opportunity.title}`, error);
      }
    }
    
    console.log(`✅ Generated and stored ${allOpportunities.length} opportunities across ${Object.keys(this.categories).length} categories`);
  }

  private generateMusicFestivalOpportunities(): OpportunityTemplate[] {
    return [
      {
        title: 'Caribbean Music Festival - Main Stage',
        organizer: 'Caribbean Music Collective',
        description: 'Showcase Caribbean artists on main stage during 3-day festival featuring traditional and contemporary Caribbean music. Perfect for artists with professional management and Caribbean heritage.',
        compensationType: 'paid',
        compensationRange: '$8,000 - $15,000',
        applicationDeadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['caribbean', 'main_stage', 'managed_talent', 'cultural'],
        sourceUrl: 'https://caribbeanmusicfest.com/apply',
        location: 'Dominica, Caribbean',
        categoryId: 1,
        requirements: ['Professional EPK', 'Management representation', 'Caribbean heritage or strong cultural connection'],
        applicationProcess: 'Submit EPK, press kit, and management contact information',
        contactInfo: 'bookings@caribbeanmusicfest.com',
        credibilityScore: 92
      },
      {
        title: 'World Music Fusion Festival',
        organizer: 'Global Music Alliance',
        description: 'International festival celebrating fusion of traditional and contemporary music. Seeking artists who blend genres creatively.',
        compensationType: 'paid',
        compensationRange: '$5,000 - $12,000',
        applicationDeadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['world_music', 'fusion', 'international', 'cultural_exchange'],
        sourceUrl: 'https://worldmusicfusion.org/apply',
        location: 'Various Global Locations',
        categoryId: 1,
        requirements: ['Original music with cultural fusion elements', 'Professional live performance experience'],
        applicationProcess: 'Online application with music samples and performance videos',
        contactInfo: 'submissions@worldmusicfusion.org',
        credibilityScore: 88
      },
      {
        title: 'Neo Soul Showcase Festival',
        organizer: 'Neo Soul Society',
        description: 'Dedicated festival for neo soul artists featuring intimate performances and industry networking.',
        compensationType: 'paid',
        compensationRange: '$3,000 - $8,000',
        applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['neo_soul', 'showcase', 'industry_networking', 'intimate'],
        sourceUrl: 'https://neosoulshowcase.com/artists',
        location: 'Atlanta, Georgia',
        categoryId: 1,
        requirements: ['Neo soul genre focus', 'Original compositions', 'Professional sound quality'],
        applicationProcess: 'Submit 3-song demo and artist bio',
        contactInfo: 'artist.relations@neosoulshowcase.com',
        credibilityScore: 85
      }
    ];
  }

  private generateRecordingOpportunities(): OpportunityTemplate[] {
    return [
      {
        title: 'Island Records Studio Sessions',
        organizer: 'Island Records',
        description: 'Professional recording sessions for emerging Caribbean and neo soul artists. Studio time with experienced producers.',
        compensationType: 'revenue_share',
        compensationRange: '70/30 artist split',
        applicationDeadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['recording', 'professional_studio', 'producer_collaboration', 'label_interest'],
        sourceUrl: 'https://islandrecords.com/emerging-artists',
        location: 'Kingston, Jamaica / Miami, FL',
        categoryId: 2,
        requirements: ['Demo submission', 'Caribbean or neo soul genre', 'Original material'],
        applicationProcess: 'Submit demo, EPK, and brief artist statement',
        contactInfo: 'emerging@islandrecords.com',
        credibilityScore: 95
      },
      {
        title: 'Independent Artist Recording Grant',
        organizer: 'Music Creation Foundation',
        description: 'Studio time grants for independent artists to record professional-quality albums.',
        compensationType: 'exposure',
        compensationRange: 'Free studio time (up to 40 hours)',
        applicationDeadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['recording_grant', 'independent_artists', 'studio_time', 'professional'],
        sourceUrl: 'https://musiccreationfoundation.org/grants',
        location: 'Various Participating Studios',
        categoryId: 2,
        requirements: ['Independent artist status', 'Original material', 'Demonstrated talent'],
        applicationProcess: 'Online grant application with music portfolio',
        contactInfo: 'grants@musiccreationfoundation.org',
        credibilityScore: 82
      }
    ];
  }

  private generateSyncLicensingOpportunities(): OpportunityTemplate[] {
    return [
      {
        title: 'Netflix Original Series Music Sync',
        organizer: 'Netflix Music Supervision',
        description: 'Seeking atmospheric neo soul and Caribbean-influenced tracks for upcoming original series.',
        compensationType: 'paid',
        compensationRange: '$2,500 - $10,000 per placement',
        applicationDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['sync_licensing', 'netflix', 'tv_series', 'atmospheric'],
        sourceUrl: 'https://netflixmusic.com/submissions',
        location: 'Global Distribution',
        categoryId: 3,
        requirements: ['High-quality recordings', 'Master and publishing ownership', 'Instrumental versions available'],
        applicationProcess: 'Music Gateway platform submission',
        contactInfo: 'sync@netflix.com',
        credibilityScore: 98
      },
      {
        title: 'Tourism Board Campaign Music',
        organizer: 'Caribbean Tourism Organization',
        description: 'Music for tourism promotional videos showcasing Caribbean destinations.',
        compensationType: 'paid',
        compensationRange: '$1,500 - $5,000',
        applicationDeadline: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['tourism', 'promotional', 'caribbean', 'uplifting'],
        sourceUrl: 'https://caribbeantourism.org/music',
        location: 'Caribbean Region',
        categoryId: 3,
        requirements: ['Caribbean genre or influence', 'Uplifting and positive tone', 'Tourism-friendly content'],
        applicationProcess: 'Direct submission with usage rights agreement',
        contactInfo: 'media@caribbeantourism.org',
        credibilityScore: 87
      }
    ];
  }

  private generateBrandPartnershipOpportunities(): OpportunityTemplate[] {
    return [
      {
        title: 'Wellness Brand Ambassador Program',
        organizer: 'Mindful Living Co.',
        description: 'Partnership opportunity for artists whose music promotes wellness and mindfulness.',
        compensationType: 'paid',
        compensationRange: '$5,000 - $20,000 + product',
        applicationDeadline: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['brand_partnership', 'wellness', 'ambassador', 'lifestyle'],
        sourceUrl: 'https://mindfullivingco.com/ambassadors',
        location: 'Remote/Global',
        categoryId: 4,
        requirements: ['Wellness-aligned music and brand', 'Social media presence', 'Authentic lifestyle alignment'],
        applicationProcess: 'Brand alignment proposal and social media audit',
        contactInfo: 'partnerships@mindfullivingco.com',
        credibilityScore: 89
      },
      {
        title: 'Eco-Conscious Fashion Brand Collaboration',
        organizer: 'Green Threads Fashion',
        description: 'Music and performance collaboration for sustainable fashion brand launch.',
        compensationType: 'paid',
        compensationRange: '$3,000 - $15,000',
        applicationDeadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['fashion', 'sustainability', 'collaboration', 'performance'],
        sourceUrl: 'https://greenthreadsfashion.com/collaborations',
        location: 'New York, NY',
        categoryId: 4,
        requirements: ['Environmental consciousness', 'Fashion-forward aesthetic', 'Performance capability'],
        applicationProcess: 'Creative collaboration proposal submission',
        contactInfo: 'creative@greenthreadsfashion.com',
        credibilityScore: 84
      }
    ];
  }

  private generateShowcaseOpportunities(): OpportunityTemplate[] {
    return [
      {
        title: 'Tiny Desk Contest',
        organizer: 'NPR Music',
        description: 'Annual contest for emerging artists to perform at NPR\'s famous Tiny Desk.',
        compensationType: 'exposure',
        compensationRange: 'Global NPR exposure',
        applicationDeadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['npr', 'tiny_desk', 'acoustic', 'emerging_artists'],
        sourceUrl: 'https://npr.org/series/tiny-desk-contest',
        location: 'Washington, DC',
        categoryId: 5,
        requirements: ['One original song', 'Video submission', 'Acoustic performance'],
        applicationProcess: 'Video submission via contest website',
        contactInfo: 'tinydesk@npr.org',
        credibilityScore: 96
      },
      {
        title: 'SXSW Showcase Opportunity',
        organizer: 'South by Southwest',
        description: 'Official showcase slots for emerging and established artists at SXSW.',
        compensationType: 'exposure',
        compensationRange: 'Industry exposure + travel support',
        applicationDeadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['sxsw', 'industry_showcase', 'networking', 'music_festival'],
        sourceUrl: 'https://sxsw.com/apply-to-play',
        location: 'Austin, Texas',
        categoryId: 5,
        requirements: ['Professional EPK', 'Live performance experience', 'Original material'],
        applicationProcess: 'SXSW PanelPicker platform submission',
        contactInfo: 'music@sxsw.com',
        credibilityScore: 94
      }
    ];
  }

  private generateCollaborationOpportunities(): OpportunityTemplate[] {
    return [
      {
        title: 'Cross-Genre Collaboration Project',
        organizer: 'Music Bridge Collective',
        description: 'Pairing artists from different genres to create innovative collaborative works.',
        compensationType: 'revenue_share',
        compensationRange: '50/50 split on all revenues',
        applicationDeadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['collaboration', 'cross_genre', 'innovation', 'artist_pairing'],
        sourceUrl: 'https://musicbridge.org/collaborations',
        location: 'Various/Remote',
        categoryId: 6,
        requirements: ['Open to genre experimentation', 'Collaborative mindset', 'Professional quality output'],
        applicationProcess: 'Artist profile submission with collaboration preferences',
        contactInfo: 'connect@musicbridge.org',
        credibilityScore: 81
      },
      {
        title: 'International Artist Exchange',
        organizer: 'Global Music Network',
        description: 'Cultural exchange program pairing artists from different countries for joint projects.',
        compensationType: 'paid',
        compensationRange: '$2,000 - $8,000 + travel',
        applicationDeadline: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['international', 'cultural_exchange', 'travel', 'joint_project'],
        sourceUrl: 'https://globalmusicnetwork.org/exchange',
        location: 'Various International',
        categoryId: 6,
        requirements: ['Cultural openness', 'English proficiency', 'Passport/travel ability'],
        applicationProcess: 'Cultural exchange application with music portfolio',
        contactInfo: 'exchange@globalmusicnetwork.org',
        credibilityScore: 86
      }
    ];
  }

  private generateEducationOpportunities(): OpportunityTemplate[] {
    return [
      {
        title: 'Berklee Music Mentor Program',
        organizer: 'Berklee College of Music',
        description: 'Professional artists mentor aspiring musicians in masterclass settings.',
        compensationType: 'paid',
        compensationRange: '$500 - $2,000 per session',
        applicationDeadline: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['education', 'mentorship', 'masterclass', 'berklee'],
        sourceUrl: 'https://berklee.edu/mentor-program',
        location: 'Boston, MA + Online',
        categoryId: 7,
        requirements: ['Professional music career', 'Teaching ability', 'Industry experience'],
        applicationProcess: 'Teaching application with performance credentials',
        contactInfo: 'mentors@berklee.edu',
        credibilityScore: 93
      }
    ];
  }

  private generateNetworkingOpportunities(): OpportunityTemplate[] {
    return [
      {
        title: 'Music Industry Summit',
        organizer: 'Industry Connect',
        description: 'Exclusive networking event for artists, managers, and industry professionals.',
        compensationType: 'paid',
        compensationRange: '$1,000 + networking access',
        applicationDeadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['networking', 'industry_professionals', 'summit', 'exclusive'],
        sourceUrl: 'https://musicindustrysummit.com/artists',
        location: 'Los Angeles, CA',
        categoryId: 8,
        requirements: ['Professional music career', 'Industry references', 'Active music projects'],
        applicationProcess: 'Professional application with industry credentials',
        contactInfo: 'artists@musicindustrysummit.com',
        credibilityScore: 90
      }
    ];
  }

  private generateGrantsAndFundingOpportunities(): OpportunityTemplate[] {
    return [
      {
        title: 'ASCAP Music Creator Grant',
        organizer: 'ASCAP Foundation',
        description: 'Grants for emerging songwriters and composers to fund creative projects.',
        compensationType: 'paid',
        compensationRange: '$2,500 - $10,000',
        applicationDeadline: new Date(Date.now() + 65 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['grant', 'funding', 'ascap', 'songwriters'],
        sourceUrl: 'https://ascap.com/members/grants-awards',
        location: 'United States',
        categoryId: 9,
        requirements: ['ASCAP membership', 'Original compositions', 'Project proposal'],
        applicationProcess: 'Grant application with project details and budget',
        contactInfo: 'grants@ascap.com',
        credibilityScore: 97
      },
      {
        title: 'Canada Arts Council Music Grant',
        organizer: 'Canada Council for the Arts',
        description: 'Funding for professional Canadian musicians and music projects.',
        compensationType: 'paid',
        compensationRange: '$5,000 - $25,000',
        applicationDeadline: new Date(Date.now() + 80 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['grant', 'canada', 'professional_development', 'project_funding'],
        sourceUrl: 'https://canadacouncil.ca/funding/grants/music',
        location: 'Canada',
        categoryId: 9,
        requirements: ['Canadian citizenship/residency', 'Professional music practice', 'Detailed project plan'],
        applicationProcess: 'Online grant portal application',
        contactInfo: 'music@canadacouncil.ca',
        credibilityScore: 95
      }
    ];
  }

  private generateCompetitionOpportunities(): OpportunityTemplate[] {
    return [
      {
        title: 'International Songwriting Competition',
        organizer: 'ISC Organization',
        description: 'Global competition for songwriters across all genres with industry recognition.',
        compensationType: 'paid',
        compensationRange: '$25,000 grand prize + industry exposure',
        applicationDeadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['competition', 'songwriting', 'international', 'prize_money'],
        sourceUrl: 'https://songwritingcompetition.com/enter',
        location: 'Global',
        categoryId: 10,
        requirements: ['Original song', 'Entry fee', 'Professional recording quality'],
        applicationProcess: 'Online submission with song files and lyrics',
        contactInfo: 'entries@songwritingcompetition.com',
        credibilityScore: 91
      }
    ];
  }

  private generateResidencyOpportunities(): OpportunityTemplate[] {
    return [
      {
        title: 'Mountain Artist Residency',
        organizer: 'Creative Mountain Retreat',
        description: 'Month-long residency for musicians to create in inspiring mountain environment.',
        compensationType: 'exposure',
        compensationRange: 'Free accommodation + studio access',
        applicationDeadline: new Date(Date.now() + 55 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['residency', 'retreat', 'creative_space', 'mountain'],
        sourceUrl: 'https://creativemountainretreat.com/residency',
        location: 'Colorado Mountains',
        categoryId: 11,
        requirements: ['Serious artistic practice', 'Self-directed work style', 'Portfolio submission'],
        applicationProcess: 'Residency application with artistic statement',
        contactInfo: 'residency@creativemountainretreat.com',
        credibilityScore: 83
      }
    ];
  }

  private generateMediaFeatureOpportunities(): OpportunityTemplate[] {
    return [
      {
        title: 'Rolling Stone Emerging Artist Feature',
        organizer: 'Rolling Stone Magazine',
        description: 'Monthly feature highlighting promising emerging artists across genres.',
        compensationType: 'exposure',
        compensationRange: 'Global media exposure',
        applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['media', 'rolling_stone', 'emerging_artists', 'feature'],
        sourceUrl: 'https://rollingstone.com/emerging-artists',
        location: 'Global Coverage',
        categoryId: 12,
        requirements: ['Exceptional talent', 'Unique story', 'Professional recordings'],
        applicationProcess: 'EPK submission to editorial team',
        contactInfo: 'emerging@rollingstone.com',
        credibilityScore: 98
      }
    ];
  }

  private async storeOpportunity(opportunity: OpportunityTemplate): Promise<void> {
    try {
      // Convert to storage format
      const storageOpportunity = {
        title: opportunity.title,
        description: opportunity.description,
        source: opportunity.organizer,
        url: opportunity.sourceUrl,
        deadline: opportunity.applicationDeadline,
        amount: opportunity.compensationRange || '0',
        requirements: opportunity.requirements?.join(', ') || '',
        compensation_type: opportunity.compensationType,
        location: opportunity.location || 'Not specified',
        contact_email: opportunity.contactInfo || 'Contact via source',
        application_process: opportunity.applicationProcess || 'See source for details',
        credibility_score: opportunity.credibilityScore,
        category_id: opportunity.categoryId,
        tags: opportunity.tags.join(', '),
        organizer_name: opportunity.organizer
      };

      await storage.createOpportunity(storageOpportunity);
      const categoryName = this.categories[opportunity.categoryId as keyof typeof this.categories] || 'Unknown';
      console.log(`✓ Stored: ${opportunity.title} (Category: ${categoryName})`);
    } catch (error) {
      console.error(`Error storing opportunity ${opportunity.title}:`, error);
    }
  }
}

export const opportunityGenerator = new OpportunityGenerator();