/**
 * OppHub Professional Guidance Engine
 * Generates detailed technical and creative guidance for professionals assigned to managed talent bookings
 * Provides precise camera settings, aperture recommendations, and industry standards
 */

import { storage } from "./storage";

export interface EquipmentSpecs {
  cameraModel?: string;
  lensSpecs?: string[];
  sensorType?: string;
  maxISO?: number;
  megapixels?: number;
  videoCapabilities?: string[];
  audioEquipment?: string[];
  lightingEquipment?: string[];
  additionalGear?: string[];
}

export interface TechnicalGuidance {
  aperture: {
    recommended: string;
    range: string;
    reasoning: string;
  };
  shutterSpeed: {
    recommended: string;
    range: string;
    reasoning: string;
  };
  iso: {
    recommended: number;
    maxAcceptable: number;
    reasoning: string;
  };
  focusMode: string;
  meteringMode: string;
  whiteBalance: string;
  colorProfile: string;
  fileFormat: {
    photos: string;
    videos: string;
    reasoning: string;
  };
}

export interface CreativeGuidance {
  shotComposition: string[];
  lightingRequirements: string[];
  colorGrading: string;
  moodDirection: string;
  brandAlignment: string;
  storytellingApproach: string;
}

export interface OpportunityProjections {
  immediateUse: string[];
  futureOpportunities: string[];
  syncLicensingPotential: string[];
  socialMediaStrategy: string[];
  pressKitRequirements: string[];
  tourPromotionUse: string[];
}

export class OppHubProfessionalGuidanceEngine {
  
  /**
   * Generate comprehensive professional guidance based on managed artist opportunities
   */
  async generateProfessionalGuidance(
    assignmentId: number,
    managedArtistUserId: number,
    professionalType: string,
    equipmentSpecs: EquipmentSpecs,
    internalObjectives?: string[]
  ) {
    try {
      // Get managed artist profile and current opportunities
      const artist = await storage.getArtist(managedArtistUserId);
      const user = await storage.getUser(managedArtistUserId);
      
      if (!artist || !user) {
        throw new Error('Managed artist not found');
      }

      // Generate type-specific guidance with equipment-aware recommendations
      switch (professionalType) {
        case 'photographer':
          return await this.generatePhotographerGuidance(artist, user, equipmentSpecs, internalObjectives);
        case 'videographer':
          return await this.generateVideographerGuidance(artist, user, equipmentSpecs, internalObjectives);
        case 'social_media_marketer':
          return await this.generateSocialMediaGuidance(artist, user, equipmentSpecs, internalObjectives);
        case 'marketing_specialist':
          return await this.generateMarketingGuidance(artist, user, equipmentSpecs, internalObjectives);
        case 'dj':
          return await this.generateDJGuidance(artist, user, equipmentSpecs, internalObjectives);
        case 'background_vocalist':
          return await this.generateBackgroundVocalistGuidance(artist, user, equipmentSpecs, internalObjectives);
        default:
          return await this.generateGenericProfessionalGuidance(artist, user, professionalType, equipmentSpecs, internalObjectives);
      }
    } catch (error) {
      console.error('Error generating professional guidance:', error);
      throw error;
    }
  }

  /**
   * Generate detailed photographer guidance with precise camera settings
   */
  private async generatePhotographerGuidance(artist: any, user: any, equipment: EquipmentSpecs, internalObjectives?: string[]) {
    const artistGenre = artist.primaryGenre || 'Pop';
    const managementTier = artist.managementTierId || 3;
    
    // Determine camera settings based on equipment and genre
    const technicalGuidance: TechnicalGuidance = {
      aperture: this.getApertureRecommendation(artistGenre, equipment),
      shutterSpeed: this.getShutterSpeedRecommendation(artistGenre, equipment),
      iso: this.getISORecommendation(equipment),
      focusMode: this.getFocusModeRecommendation(artistGenre),
      meteringMode: "Matrix/Evaluative",
      whiteBalance: "Daylight (5600K) or Custom",
      colorProfile: "Adobe RGB for print, sRGB for digital",
      fileFormat: {
        photos: "RAW + JPEG (Fine)",
        videos: "Not applicable for photography",
        reasoning: "RAW provides maximum post-processing flexibility for professional publications"
      }
    };

    const creativeGuidance: CreativeGuidance = {
      shotComposition: this.getCompositionGuidance(artistGenre, managementTier),
      lightingRequirements: this.getLightingRequirements(artistGenre),
      colorGrading: this.getColorGradingDirection(artistGenre),
      moodDirection: this.getMoodDirection(artistGenre, artist),
      brandAlignment: this.getBrandAlignment(artist),
      storytellingApproach: this.getStorytellingApproach(artist, managementTier)
    };

    const opportunityProjections: OpportunityProjections = {
      immediateUse: [
        "Social media profile updates",
        "Press kit enhancement",
        "Booking proposal materials",
        "Website header images"
      ],
      futureOpportunities: await this.getFutureOpportunityProjections(artist),
      syncLicensingPotential: [
        "Album artwork consideration",
        "Music video stills",
        "Promotional campaign visuals"
      ],
      socialMediaStrategy: [
        "Instagram feed consistency",
        "TikTok profile optimization",
        "YouTube thumbnail creation",
        "Facebook cover photo updates"
      ],
      pressKitRequirements: [
        "High-resolution performance shots",
        "Professional headshots",
        "Behind-the-scenes candids",
        "Studio session documentation"
      ],
      tourPromotionUse: [
        "Concert poster imagery",
        "Venue promotional materials",
        "Merchandise design elements",
        "Social media tour announcements"
      ]
    };

    return {
      technicalRequirements: technicalGuidance,
      creativeGuidance,
      industryStandards: this.getMusicIndustryPhotoStandards(),
      opportunityProjections,
      qualityBenchmarks: this.getPhotographyQualityBenchmarks(),
      deliverableSpecs: this.getPhotographyDeliverables(),
      checklistItems: this.generatePhotographerChecklist(technicalGuidance, creativeGuidance),
      equipmentSpecificGuidance: this.generateEquipmentSpecificGuidance(equipment, 'photographer'),
      genericGuidanceAlternatives: this.generateGenericPhotographyGuidance(artistGenre),
      internalObjectiveAlignment: this.alignWithInternalObjectives(internalObjectives, 'photographer')
    };
  }

  /**
   * Get aperture recommendations based on genre and equipment
   */
  private getApertureRecommendation(genre: string, equipment: EquipmentSpecs): TechnicalGuidance['aperture'] {
    const sensorType = equipment.sensorType || 'Full Frame';
    
    if (genre === 'Jazz' || genre === 'Classical') {
      return {
        recommended: "f/2.8 - f/4.0",
        range: "f/2.0 - f/5.6",
        reasoning: "Moderate depth of field to capture instrument details while maintaining subject isolation"
      };
    } else if (genre === 'Rock' || genre === 'Metal') {
      return {
        recommended: "f/1.8 - f/2.8",
        range: "f/1.4 - f/4.0",
        reasoning: "Wide aperture for dynamic low-light performance environments and dramatic subject isolation"
      };
    } else if (genre === 'Electronic' || genre === 'Dance') {
      return {
        recommended: "f/2.8 - f/4.0",
        range: "f/2.0 - f/5.6",
        reasoning: "Balanced aperture for colorful lighting effects while maintaining sharpness across the frame"
      };
    } else {
      return {
        recommended: "f/2.8",
        range: "f/2.0 - f/4.0",
        reasoning: "Versatile aperture for various lighting conditions with excellent subject separation"
      };
    }
  }

  /**
   * Get shutter speed recommendations based on genre and equipment
   */
  private getShutterSpeedRecommendation(genre: string, equipment: EquipmentSpecs): TechnicalGuidance['shutterSpeed'] {
    if (genre === 'Electronic' || genre === 'Dance') {
      return {
        recommended: "1/125s - 1/250s",
        range: "1/60s - 1/500s",
        reasoning: "Capture lighting effects and movement while avoiding motion blur in dynamic performances"
      };
    } else if (genre === 'Rock' || genre === 'Metal') {
      return {
        recommended: "1/250s - 1/500s",
        range: "1/125s - 1/1000s",
        reasoning: "Freeze fast movements and energetic performance moments"
      };
    } else {
      return {
        recommended: "1/125s - 1/250s",
        range: "1/60s - 1/500s",
        reasoning: "Standard range for musical performances balancing motion freeze and light gathering"
      };
    }
  }

  /**
   * Get ISO recommendations based on equipment capabilities
   */
  private getISORecommendation(equipment: EquipmentSpecs): TechnicalGuidance['iso'] {
    const maxISO = equipment.maxISO || 25600;
    
    return {
      recommended: Math.min(1600, maxISO / 4),
      maxAcceptable: Math.min(6400, maxISO / 2),
      reasoning: "Maintain image quality while accommodating various lighting conditions. Stay within camera's optimal ISO range."
    };
  }

  /**
   * Get focus mode recommendation based on genre
   */
  private getFocusModeRecommendation(genre: string): string {
    if (genre === 'Electronic' || genre === 'Dance') {
      return "AF-C/AI Servo (Continuous) for moving subjects";
    } else {
      return "AF-S/One Shot for stationary subjects, AF-C for movement";
    }
  }

  /**
   * Get composition guidance based on genre and management tier
   */
  private getCompositionGuidance(genre: string, managementTier: number): string[] {
    const baseGuidance = [
      "Rule of thirds placement for primary subject",
      "Leading lines using stage elements or lighting",
      "Frame within frame using architectural elements",
      "Capture authentic emotions and expressions"
    ];

    if (managementTier <= 3) { // Managed talent
      baseGuidance.push(
        "Professional headshot angles (2/3 view preferred)",
        "Brand-consistent color palette integration",
        "Multiple composition variations for versatility",
        "Signature pose development for brand recognition"
      );
    }

    if (genre === 'Jazz') {
      baseGuidance.push("Intimate close-ups highlighting instrumental technique");
    } else if (genre === 'Rock') {
      baseGuidance.push("Dynamic wide shots capturing energy and movement");
    }

    return baseGuidance;
  }

  /**
   * Get lighting requirements based on genre
   */
  private getLightingRequirements(genre: string): string[] {
    const baseLighting = [
      "Key light at 45-degree angle from subject",
      "Fill light to reduce harsh shadows",
      "Background/rim lighting for subject separation"
    ];

    if (genre === 'Electronic' || genre === 'Dance') {
      baseLighting.push(
        "Incorporate colorful stage lighting as design element",
        "Use existing LED/laser effects creatively",
        "High contrast acceptable for dramatic effect"
      );
    } else if (genre === 'Jazz' || genre === 'Classical') {
      baseLighting.push(
        "Warm, soft lighting to enhance intimate atmosphere",
        "Avoid harsh contrasts that distract from performance",
        "Highlight instruments and technical skill"
      );
    }

    return baseLighting;
  }

  /**
   * Get future opportunity projections for managed artist
   */
  private async getFutureOpportunityProjections(artist: any): Promise<string[]> {
    // This would integrate with OppHub opportunity matching in real implementation
    return [
      "Album artwork campaigns requiring professional imagery",
      "Music video promotional stills and behind-the-scenes content",
      "Brand partnership campaigns leveraging artist image",
      "Festival booking materials requiring high-quality performance shots",
      "Sync licensing pitches using professional visual content",
      "International market expansion requiring culturally appropriate imagery"
    ];
  }

  /**
   * Get music industry photography standards
   */
  private getMusicIndustryPhotoStandards() {
    return {
      resolution: "Minimum 24MP for print publications, 12MP acceptable for digital",
      colorSpace: "Adobe RGB for print, sRGB for digital distribution",
      fileNaming: "Artist_Date_EventType_Sequential (e.g., LiliOctave_20250125_Concert_001.jpg)",
      backupRequirements: "Dual memory card recording mandatory for irreplaceable performances",
      deliveryFormat: "RAW files + edited JPEG/TIFF, organized by usage category",
      copyrightProtection: "Embedded metadata with photographer and usage rights information",
      archivalStandards: "Minimum 10-year retention with proper file organization"
    };
  }

  /**
   * Generate photographer checklist items
   */
  private generatePhotographerChecklist(technical: TechnicalGuidance, creative: CreativeGuidance): string[] {
    return [
      `✓ Camera set to ${technical.aperture.recommended} aperture`,
      `✓ Shutter speed configured to ${technical.shutterSpeed.recommended}`,
      `✓ ISO sensitivity set to ${technical.iso.recommended} (max ${technical.iso.maxAcceptable})`,
      `✓ Focus mode: ${technical.focusMode}`,
      `✓ White balance: ${technical.whiteBalance}`,
      `✓ File format: ${technical.fileFormat.photos}`,
      "✓ Dual memory card recording enabled",
      "✓ Backup battery charged and accessible",
      "✓ Lens cleaning kit available",
      "✓ Shot list includes all required compositions",
      "✓ Lighting setup tested and adjusted",
      "✓ Model releases prepared if required",
      "✓ Equipment insurance verification complete",
      "✓ Delivery timeline and format confirmed with client",
      "✓ Post-production workflow and timeline established"
    ];
  }

  /**
   * Generate similar detailed guidance for other professional types
   */
  private async generateVideographerGuidance(artist: any, user: any, equipment: EquipmentSpecs) {
    // Similar comprehensive approach for videography
    return {
      technicalRequirements: {
        resolution: "4K minimum for future-proofing, 1080p acceptable for social media",
        frameRate: "24fps for cinematic, 60fps for slow-motion capabilities",
        codec: "H.264 for compatibility, ProRes for professional editing",
        bitRate: "50-100 Mbps for 4K, 25-50 Mbps for 1080p",
        colorGrading: "Log profile for maximum post-production flexibility",
        audioRecording: "48kHz/24-bit minimum, external recorder preferred"
      },
      creativeGuidance: {
        shotSequence: "Establishing shots, medium shots, close-ups, detail shots",
        cameraMovement: "Smooth gimbal movements, controlled handheld for energy",
        storytelling: "Capture narrative arc of performance or session",
        editingStyle: "Match artist's genre and brand aesthetic"
      },
      deliverableSpecs: {
        masterFiles: "Full resolution with timecode",
        webOptimized: "1080p H.264 for streaming platforms",
        socialMedia: "Vertical 9:16 and square 1:1 versions",
        thumbnails: "High-quality stills for video previews"
      }
    };
  }

  // Additional methods for other professional types...
  private async generateSocialMediaGuidance(artist: any, user: any, equipment: EquipmentSpecs) {
    return {
      platformOptimization: {
        instagram: "Square 1:1 and vertical 4:5 formats, Stories 9:16",
        tiktok: "Vertical 9:16, trending audio integration",
        youtube: "16:9 with compelling thumbnails",
        facebook: "Horizontal 16:9 and square 1:1"
      },
      contentStrategy: this.generateSocialMediaContentStrategy(artist),
      hashtagStrategy: this.generateHashtagStrategy(artist),
      postingSchedule: this.generateOptimalPostingSchedule(artist)
    };
  }

  private async generateDJGuidance(artist: any, user: any, equipment: EquipmentSpecs) {
    return {
      setlistIntegration: "Coordinate with artist's performance setlist",
      transitionRequirements: "Seamless transitions matching energy levels",
      equipmentSpecs: "Professional DJ controller, high-quality monitors",
      backupSystems: "Redundant audio sources and emergency playlists",
      audienceEngagement: "Read crowd energy, adjust accordingly"
    };
  }

  private async generateBackgroundVocalistGuidance(artist: any, user: any, equipment: EquipmentSpecs) {
    return {
      harmonicArrangements: "Complement lead vocals without overpowering",
      microphoneTechnique: "Proper distance and projection",
      stagePresence: "Support lead artist's performance energy",
      repertoirePreparation: "Rehearse all setlist songs thoroughly",
      monitorRequirements: "Clear vocal monitor mix essential"
    };
  }

  private async generateGenericProfessionalGuidance(artist: any, user: any, type: string, equipment: EquipmentSpecs) {
    return {
      generalRequirements: `Professional ${type} guidance for managed artist ${artist.stageNames?.[0] || 'Unknown'}`,
      qualityStandards: "Industry-leading quality and professionalism expected",
      brandAlignment: "All work must align with artist's brand and management objectives",
      deliverables: "Specified formats and timeline to be confirmed with management"
    };
  }

  // Helper methods for social media guidance
  private generateSocialMediaContentStrategy(artist: any) {
    return {
      contentPillars: ["Performance content", "Behind-the-scenes", "Personal moments", "Fan engagement"],
      postFrequency: "Daily for managed talent, 3-5x weekly for others",
      engagementStrategy: "Respond within 2 hours during active hours",
      crossPromotion: "Coordinate with other managed artists when appropriate"
    };
  }

  private generateHashtagStrategy(artist: any) {
    const genre = artist.primaryGenre || 'Music';
    const artistName = artist.stageNames?.[0] || 'Artist';
    
    return {
      branded: [`#${artistName.replace(/\s+/g, '')}`, '#WaituMusic'],
      genre: [`#${genre}`, `#${genre}Artist`, `#Live${genre}`],
      location: ['#Caribbean', '#DominicaMusic', '#IslandVibes'],
      trending: ['#NewMusic', '#LivePerformance', '#MusicLife']
    };
  }

  private generateOptimalPostingSchedule(artist: any) {
    return {
      instagram: "12pm, 5pm, 8pm local time",
      tiktok: "6am, 12pm, 7pm, 9pm local time",
      youtube: "2pm, 8pm local time",
      facebook: "10am, 3pm, 8pm local time",
      reasoning: "Based on Caribbean audience engagement patterns"
    };
  }

  // Quality benchmarks and standards
  private getPhotographyQualityBenchmarks() {
    return {
      technicalQuality: "Sharp focus, proper exposure, minimal noise",
      artisticMerit: "Compelling composition, emotional impact, brand alignment",
      usabilityScore: "Versatile for multiple promotional uses",
      industryCompliance: "Meets publication and broadcasting standards"
    };
  }

  private getPhotographyDeliverables() {
    return {
      rawFiles: "Full resolution RAW files with embedded metadata",
      editedHighRes: "TIFF or high-quality JPEG for print (300dpi minimum)",
      webOptimized: "JPEG optimized for web use (72dpi, sRGB)",
      socialMediaReady: "Square, vertical, and horizontal crops as needed",
      contactSheets: "Overview of all shots for selection purposes",
      deliveryMethod: "Secure cloud storage with download links",
      retention: "Files archived for minimum 2 years"
    };
  }

  private getColorGradingDirection(genre: string): string {
    if (genre === 'Jazz') return "Warm, rich tones with enhanced golden hour effects";
    if (genre === 'Electronic') return "Vibrant, saturated colors matching electronic aesthetic";
    if (genre === 'Rock') return "High contrast with dramatic shadows and highlights";
    return "Natural color grading with slight warmth enhancement";
  }

  private getMoodDirection(genre: string, artist: any): string {
    return `Capture the authentic energy and personality of ${artist.stageNames?.[0] || 'the artist'} in the context of ${genre} performance`;
  }

  private getBrandAlignment(artist: any): string {
    return `All content must align with ${artist.stageNames?.[0] || 'the artist'}'s established brand identity and Wai'tuMusic management objectives`;
  }

  private getStorytellingApproach(artist: any, managementTier: number): string {
    if (managementTier <= 3) {
      return "Professional narrative showcasing artist's journey, talent, and market potential for industry stakeholders";
    }
    return "Authentic documentation of artistic expression and performance quality";
  }

  /**
   * Generate equipment-specific guidance based on actual professional equipment
   */
  private generateEquipmentSpecificGuidance(equipment: EquipmentSpecs, professionalType: string) {
    const guidance: any = {
      hasEquipmentSpecs: !!(equipment.cameraModel || equipment.lensSpecs || equipment.audioEquipment || equipment.lightingEquipment),
      equipmentOptimizations: [],
      specificRecommendations: []
    };

    if (equipment.cameraModel) {
      guidance.equipmentOptimizations.push(`Camera optimization for ${equipment.cameraModel}`);
      guidance.specificRecommendations.push(`Utilizing ${equipment.cameraModel} native ISO performance characteristics`);
      
      // Camera-specific optimizations
      if (equipment.cameraModel.toLowerCase().includes('canon')) {
        guidance.specificRecommendations.push('Canon Color Science: Enhance skin tones using Portrait Picture Style');
        guidance.specificRecommendations.push('Dual Pixel CMOS AF: Utilize smooth focus transitions for video');
      } else if (equipment.cameraModel.toLowerCase().includes('nikon')) {
        guidance.specificRecommendations.push('Nikon Matrix Metering: Excellent for complex lighting scenarios');
        guidance.specificRecommendations.push('D-Lighting: Use sparingly to maintain natural contrast');
      } else if (equipment.cameraModel.toLowerCase().includes('sony')) {
        guidance.specificRecommendations.push('Sony Real-time Eye AF: Ideal for performer tracking');
        guidance.specificRecommendations.push('S-Log3: Capture maximum dynamic range for color grading');
      }
    }

    if (equipment.lensSpecs && equipment.lensSpecs.length > 0) {
      guidance.equipmentOptimizations.push(`Lens optimization: ${equipment.lensSpecs.join(', ')}`);
      equipment.lensSpecs.forEach(lens => {
        if (lens.toLowerCase().includes('85mm')) {
          guidance.specificRecommendations.push('85mm lens: Perfect for intimate performance shots and artist portraits');
        } else if (lens.toLowerCase().includes('24-70')) {
          guidance.specificRecommendations.push('24-70mm zoom: Versatile for stage coverage without repositioning');
        } else if (lens.toLowerCase().includes('70-200')) {
          guidance.specificRecommendations.push('70-200mm telephoto: Excellent for distant stage capture');
        }
      });
    }

    if (equipment.lightingEquipment && equipment.lightingEquipment.length > 0) {
      guidance.equipmentOptimizations.push(`Lighting setup: ${equipment.lightingEquipment.join(', ')}`);
      equipment.lightingEquipment.forEach(light => {
        if (light.toLowerCase().includes('led')) {
          guidance.specificRecommendations.push('LED lighting: Adjust color temperature to match venue ambient lighting');
        } else if (light.toLowerCase().includes('strobe')) {
          guidance.specificRecommendations.push('Strobe lighting: Sync with camera for freeze-motion performance shots');
        }
      });
    }

    return guidance;
  }

  /**
   * Generate generic guidance when equipment specs are not available
   */
  private generateGenericPhotographyGuidance(genre: string) {
    return {
      genericCameraSettings: {
        aperture: 'f/2.8 for most performance situations, f/1.8-f/2.0 for low light',
        shutterSpeed: '1/125s minimum for hand-held, 1/250s for performer movement',
        iso: 'Start at ISO 1600, increase as needed up to camera native performance limit',
        focusMode: 'Continuous AF (AI Servo/AF-C) for moving performers',
        meteringMode: 'Matrix/Evaluative for complex stage lighting'
      },
      universalTechniques: [
        'Shoot in RAW format for maximum post-processing flexibility',
        'Use back-button focus for improved accuracy',
        'Enable image stabilization if available on lens or body',
        'Bracket exposures in challenging lighting conditions',
        'Focus on performer\'s eyes when possible'
      ],
      genreSpecificApproach: this.getGenericGenreApproach(genre),
      fallbackEquipment: [
        'Full-frame camera body preferred for low-light performance',
        '85mm f/1.8 lens for portraits and performance shots',
        '24-70mm f/2.8 for versatile stage coverage',
        'External flash with diffusion for fill lighting',
        'Backup camera body and extra batteries essential'
      ]
    };
  }

  /**
   * Align guidance with internal booking objectives
   */
  private alignWithInternalObjectives(internalObjectives?: string[], professionalType?: string) {
    const alignment: any = {
      hasInternalObjectives: !!(internalObjectives && internalObjectives.length > 0),
      objectiveGuidance: [],
      strategicFocus: []
    };

    if (internalObjectives && internalObjectives.length > 0) {
      internalObjectives.forEach(objective => {
        const lowerObjective = objective.toLowerCase();
        
        if (lowerObjective.includes('album') || lowerObjective.includes('release')) {
          alignment.objectiveGuidance.push('Album promotion focus: Capture professional-quality images suitable for album artwork and promotional materials');
          alignment.strategicFocus.push('High-resolution, print-ready deliverables');
        }
        
        if (lowerObjective.includes('social media') || lowerObjective.includes('instagram') || lowerObjective.includes('tiktok')) {
          alignment.objectiveGuidance.push('Social media optimization: Focus on vertical formats and eye-catching compositions');
          alignment.strategicFocus.push('Multiple aspect ratios: 1:1, 9:16, 16:9');
        }
        
        if (lowerObjective.includes('press') || lowerObjective.includes('media') || lowerObjective.includes('publicity')) {
          alignment.objectiveGuidance.push('Press kit development: Ensure professional headshots and performance documentation');
          alignment.strategicFocus.push('Publication-ready quality with comprehensive metadata');
        }
        
        if (lowerObjective.includes('tour') || lowerObjective.includes('booking') || lowerObjective.includes('venue')) {
          alignment.objectiveGuidance.push('Tour promotion materials: Document performance energy and audience engagement');
          alignment.strategicFocus.push('Venue and audience shots for booking proposals');
        }
        
        if (lowerObjective.includes('brand') || lowerObjective.includes('image') || lowerObjective.includes('identity')) {
          alignment.objectiveGuidance.push('Brand consistency: Maintain visual coherence with existing artist branding');
          alignment.strategicFocus.push('Color palette and styling alignment with artist brand');
        }
      });
    } else {
      alignment.objectiveGuidance.push('Standard professional documentation for comprehensive press kit and promotional use');
      alignment.strategicFocus.push('Versatile content suitable for multiple applications');
    }

    return alignment;
  }

  /**
   * Get generic genre-specific approach when detailed guidance isn't available
   */
  private getGenericGenreApproach(genre: string) {
    const approaches: { [key: string]: any } = {
      'Rock': {
        energy: 'High-energy, dynamic shots capturing performer intensity',
        lighting: 'Work with dramatic stage lighting, use shadows creatively',
        composition: 'Wide shots of full stage, close-ups of intense expressions'
      },
      'Jazz': {
        energy: 'Intimate, sophisticated atmosphere with focus on musicianship',
        lighting: 'Warm, soft lighting that enhances mood without overwhelming',
        composition: 'Instrument details, musician interactions, audience connection'
      },
      'Electronic': {
        energy: 'Colorful, vibrant captures of DJ performance and lighting effects',
        lighting: 'Embrace colorful LED effects, use them as design elements',
        composition: 'Equipment shots, crowd energy, light trail effects'
      },
      'Pop': {
        energy: 'Polished, commercial-ready shots emphasizing star quality',
        lighting: 'Clean, professional lighting that flatters performer',
        composition: 'Performance shots, audience interaction, star moments'
      }
    };

    return approaches[genre] || approaches['Pop'];
  }
}

export const oppHubProfessionalGuidanceEngine = new OppHubProfessionalGuidanceEngine();