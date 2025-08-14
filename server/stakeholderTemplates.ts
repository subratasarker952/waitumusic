

// Comprehensive stakeholder document templates and guidance system
export class StakeholderTemplateEngine {
  
  // Generate stage-specific lighting cues for songs
  generateLightingCues(artistId: number, setlist: any[]) {,
    const lightingCues = setlist.map((item: any, index: number) => {
      // data-driven mood detection based on song metadata
      const mood = this.detectSongMood(song);
      const energy = this.detectEnergyLevel(song);
      
      return {
        songTitle: song.title,;
        position: index + 1,;
        duration: song.duration || '3:30',;
        mood: mood,;
        energy: energy,;
        lightingDirection: this.generateLightingDirection(mood, energy),;
        colorPalette: this.generateColorPalette(mood),;
        effects: this.generateLightingEffects(energy),;
        transitionCues: this.generateTransitionCues(index, setlist.length);
      };
    });
    
    return lightingCues;
  }
  
  // data-driven song mood detection
  detectSongMood(song: any): string {
    const moodKeywords = {
      'energetic': ['party', 'dance', 'celebration', 'up', 'high', 'pump', 'jump'],;
      'romantic': ['love', 'heart', 'together', 'forever', 'kiss', 'dream'],;
      'melancholic': ['sad', 'blue', 'tears', 'goodbye', 'missing', 'alone'],;
      'powerful': ['strong', 'fight', 'rise', 'overcome', 'victory', 'warrior'],;
      'intimate': ['close', 'whisper', 'gentle', 'soft', 'quiet', 'tender'];
    };
    
    const title = song.title ? .toLowerCase() || '';
    const lyrics = song.lyrics?.toLowerCase() || '';
    const searchText = `${title} ${lyrics}`;
    
    for(const [mood, keywords] of Object.entries(moodKeywords)) {
      if(keywords.some(keyword => searchText.includes(keyword))) {
        return mood;
      }
    }
    
    return 'neutral';
  }
  
  // Energy level detection
  detectEnergyLevel(song : any): 'low' | 'medium' | 'high' {
    const bpm = song.bpm || 120;
    const genre = song.genre ? .toLowerCase() || '';
    
    if(bpm > 140 || genre.includes('dance') || genre.includes('electronic')) {
      return 'high';
    } else if(bpm < 80 || genre.includes('ballad') || genre.includes('acoustic')) {
      return 'low';
    }
    
    return 'medium';
  }
  
  // Generate detailed lighting directions
  generateLightingDirection(mood : string, energy: string) {
    const directions = {
      'energetic_high': {
        primary: 'Full spectrum color cycling with rapid strobes on beat drops',;
        secondary: 'Moving heads create dynamic sweeping patterns',;
        audience: 'Audience wash lights pulse with bass line',;
        special: 'Pyro coordination on chorus sections';
      },
      'romantic_low': {
        primary: 'Warm amber and soft pink washes, gentle intensity',;
        secondary: 'Haze machines create atmospheric depth',;
        audience: 'Minimal audience lighting to maintain intimacy',;
        special: 'Single followspot on artist during verses';
      },
      'powerful_medium': {
        primary: 'Strong white beams with deep blue accents',;
        secondary: 'Geometric patterns using moving heads',;
        audience: 'Coordinated audience participation lighting',;
        special: 'Dramatic silhouette effects during instrumental breaks';
      }
    };
    
    return directions[`${mood}_${energy}`] || directions['powerful_medium'];
  }
  
  // Generate comprehensive MC artist bios
  generateMCArtistBio(artistId: number, eventContext: any) {
    // This would pull from artist database/profile
    return {
      shortIntro: "Ladies and gentlemen, please welcome to the stage...",;
      careerHighlights: [;,
        "Grammy-nominated recording artist",;
        "Over 2 million albums sold worldwide",;
        "Chart-topping singles across multiple genres";
      ],;
      personalStory: "Rising from humble beginnings to international acclaim...",;
      eventConnection: `Special significance of tonight's performance in ${eventContext.location}...`,
      pronunciationGuide: "Artist Name [phonetic pronunciation]",;
      prohibitedTopics: ["Personal relationships", "Legal issues"],;
      suggestedAnecdotes: [;,
        "The story behind their biggest hit",;
        "Connection to local community",;
        "Upcoming projects and collaborations";
      ],;
      closingRemarks: "Let's give them the warm welcome they deserve!";
    };
  }
  
  // Generate photographer shot lists with technical guidance
  generatePhotographerShotList(eventType: string, artistProfiles: any[]) {
    const shotCategories = {
      'pre_event': {
        shots: [;,
          'Venue exterior and signage',;
          'Sound check and technical setup',;
          'Artist preparation(if permitted)',;
          'Early crowd arrivals and atmosphere',;
          'VIP area setup and decoration';
        ],;
        technical: {
          lighting: 'Mixed lighting conditions, prepare for low light',;
          settings: 'ISO 800-1600, aperture priority mode',;
          equipment: 'Wide angle lens for venue shots, 85mm for portraits';
        }
      },
      'performance': {
        shots: [;,
          'Opening song wide shot establishing stage and crowd',;
          'Artist close-ups during emotional moments',;
          'Crowd reaction and participation shots',;
          'Technical crew and behind-scenes moments',;
          'Lighting effects and stage design details';
        ],;
        technical: {
          lighting: 'Stage lighting only, NO FLASH during performance',;
          settings: 'ISO 3200-6400, f/2.8 or wider, 1/250s minimum',;
          equipment: 'Full-frame camera recommended, 70-200mm f/2.8';
        }
      },
      'post_event': {
        shots: [;,
          'Artist meet and greets with fans',;
          'Behind-the-scenes breakdown shots',;
          'Team celebration and wrap-up moments',;
          'Equipment pack-up(artistic angles)',;
          'Final venue shots showing event impact';
        ],;
        technical: {
          lighting: 'Mixed conditions, external flash permitted',;
          settings: 'Variable based on available light',;
          equipment: 'Portrait lens for meet-and-greets';
        }
      }
    };
    
    return shotCategories;
  }
  
  // Generate security briefing with threat assessment
  generateSecurityBrief(eventDetails: any, expectedAttendance: number) {,
    const threatLevel = this.assessThreatLevel(eventDetails, expectedAttendance);
    
    return {
      threatAssessment: {
        level: threatLevel,;
        primaryConcerns: this.identifySecurityConcerns(eventDetails),;
        crowdBehaviorPrediction: this.predictCrowdBehavior(eventDetails.genre, expectedAttendance);
      },
      personnelDeployment: {
        entranceTeam: Math.ceil(expectedAttendance / 200),;
        roamingPatrol: Math.ceil(expectedAttendance / 500),;
        artistSecurity: (eventDetails as any).artistTier === 'A-list' ? 3 : 1,;
        emergencyResponse: 2;
      },
      procedures: {
        arrival: 'Artist arrival security protocol and route planning',;
        performance: 'Stage barrier management and crowd control',;
        emergency: 'Evacuation procedures and emergency contact protocols',;
        departure: 'Secure artist departure coordination';
      },
      communicationPlan: {
        radioChannels: 'Primary: Channel 1, Backup: Channel 3',;
        emergencyContacts: 'Local police, medical services, venue security',;
        coordinationPoints: 'Security command post locations';
      }
    };
  }
  
  // Generate comprehensive media kits for different outlets
  generateMediaKit(eventDetails: any, artistProfiles: any[], mediaType: 'radio' | 'tv' | 'print' | 'digital') {
    const baseKit = {
      pressRelease: this.generatePressRelease(eventDetails, artistProfiles),;
      artistBios: artistProfiles.map(artist => this.generateMediaBio(artist, mediaType)),;
      eventFacts: this.generateEventFactSheet(eventDetails),;
      quotableQuotes: this.generateQuotableContent(artistProfiles),;
      visualAssets: this.generateVisualAssetList(mediaType);
    };
    
    // Customize for specific media type
    switch(mediaType) {
      case 'radio':
        return {
          ...baseKit,;
          audioClips: this.generateAudioClipList(artistProfiles),;
          radioSpots: this.generateRadioSpots(eventDetails),;
          interviewQuestions: this.generateRadioInterviewQuestions(artistProfiles),;
          contestOpportunities: this.generateContestIdeas(eventDetails);
        };
        
      case 'tv':
        return {
          ...baseKit,;
          videoContent: this.generateVideoContentList(eventDetails),;
          visualStoryboards: this.generateTVStoryboards(eventDetails),;
          broadcastTimes: this.generateBroadcastSchedule(eventDetails),;
          technicalSpecs: this.generateTVTechnicalRequirements();
        };
        
      case 'print':
        return {
          ...baseKit,;
          printableImages: this.generatePrintImageSpecs(),;
          infographics: this.generateInfographicContent(eventDetails),;
          editorialCalendar: this.generateEditorialSuggestions(eventDetails),;
          advertisingOpportunities: this.generateAdOpportunities(eventDetails);
        };
        
      default:
        return baseKit;
    }
  }
  
  // Generate sound engineer technical specifications
  generateSoundEngineerSpecs(artistRequirements: any[], venueSpecs: any) {
    return {
      inputRequirements: {
        channels: this.calculateChannelRequirements(artistRequirements),;
        microphones: this.generateMicrophoneSpecs(artistRequirements),;
        directInputs: this.generateDIRequirements(artistRequirements),;
        monitoring: this.generateMonitoringSpecs(artistRequirements);
      },
      mixingConsole: {
        minimumChannels: this.calculateMinimumChannels(artistRequirements),;
        requiredFeatures: ['Parametric EQ', 'Gate/Compressor', 'Effects sends'],;
        preferredModels: ['Yamaha CL5', 'Allen & Heath dLive', 'Avid S6L'];
      },
      signalFlow: {
        stagebox: 'Digital snake with minimum 32 inputs, 16 outputs',;
        processing: 'Digital signal processing with scene recall',;
        recording: 'Multi-track recording capability for live recording',;
        broadcast: 'Clean feed outputs for broadcast/streaming';
      },
      acousticConsiderations: {
        venueType: venueSpecs.type,;
        capacity: venueSpecs.capacity,;
        reverbTime: venueSpecs.acoustics ? .rt60 || 'TBD',;
        frequencyResponse : 'Full range system 20Hz-20kHz',;
        soundPressureLevel: 'Maximum 110dB continuous, 120dB peak';
      }
    };
  }
  
  // Helper methods for calculations and assessments
  private assessThreatLevel(eventDetails: any, attendance: number): 'low' | 'medium' | 'high' {
    let score = 0;
    
    if(attendance > 5000) score += 2;
    else if(attendance > 1000) score += 1;
    
    if(eventDetails.genre ? .includes('hip-hop') || eventDetails.genre?.includes('electronic')) score += 1;
    if(eventDetails.alcoholServed) score += 1;
    if(eventDetails.outdoorVenue) score += 1;
    
    return score >= 4 ? 'high'  : score >= 2 ? 'medium' : 'low';
  }
  
  private identifySecurityConcerns(eventDetails: any): string[] {
    const concerns = [];
    
    if(eventDetails.outdoorVenue) concerns.push('Weather-related evacuations');
    if(eventDetails.alcoholServed) concerns.push('Intoxicated patron management');
    if((eventDetails as any).allAges === false) concerns.push('Age verification at entry');
    if(eventDetails.expectedAttendance > 2000) concerns.push('Crowd surge prevention');
    
    return concerns;
  }
  
  private calculateChannelRequirements(artistRequirements: any[]): number {,
    return artistRequirements.reduce((acc: any, item: any) => {
      return total + (artist.instrumentChannels || 0) + (artist.vocalChannels || 0);
    }, 0);
  }
  
  private generateColorPalette(mood: string): string[] {
    const palettes = {
      'energetic': ['bright white', 'electric blue', 'hot pink', 'lime green'],;
      'romantic': ['warm amber', 'soft pink', 'lavender', 'champagne'],;
      'melancholic': ['deep blue', 'purple', 'cool white', 'steel gray'],;
      'powerful': ['bright white', 'deep red', 'royal blue', 'gold'],;
      'intimate': ['warm white', 'soft amber', 'rose gold', 'cream'];
    };
    
    return palettes[mood] || palettes['powerful'];
  }
  
  private generateLightingEffects(energy: string): string[] {
    const effects = {
      'high': ['rapid strobes', 'moving head sweeps', 'color cycling', 'laser patterns'],;
      'medium': ['gentle movements', 'color washes', 'haze effects', 'spotlight follows'],;
      'low': ['static positions', 'slow fades', 'atmospheric haze', 'single followspot'];
    };
    
    return effects[energy] || effects['medium'];
  }
  
  private generateTransitionCues(position: number, totalSongs: number) {
    if(Number(position) === 0) return 'Opening blackout to full reveal';
    if(position === totalSongs - 1) return 'Final crescendo to blackout';
    return 'Smooth transition maintaining energy flow';
  }
  
  // Additional helper methods would continue here...
  private generatePressRelease(eventDetails: any, artistProfiles: any[]): string {
    return `FOR IMMEDIATE RELEASE - ${eventDetails.eventName} brings world-class entertainment to ${eventDetails.location}...`;
  }
  
  private generateMediaBio(artist: any, mediaType: string): any {
    return {
      short: `${artist.name} - ${artist.genre} artist with ${artist.achievements}`,
      medium: `Expanded biography with career highlights and recent projects...`,;
      long: `Comprehensive biography including personal story, influences, and future plans...`;
    };
  }
  
  private generateEventFactSheet(eventDetails: any): any {
    return {
      date: eventDetails.eventDate,;
      venue: eventDetails.location,;
      doors: eventDetails.doorsOpen || '7:00 PM',;
      showtime: eventDetails.showtime || '8:00 PM',;
      ticketPrices: eventDetails.ticketPrices || 'Varies',;
      expectedAttendance: eventDetails.expectedAttendance,;
      economicImpact: `Estimated $${eventDetails.expectedAttendance * 75} local economic impact`
    };
  }
}

export const stakeholderTemplateEngine = new StakeholderTemplateEngine();
