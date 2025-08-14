import { contractGenerator } from "./contractGenerator";
import { db } from "./db";
import { sendEmail } from "./emailService";
import { bookings, eventDocuments, eventPayments, eventProductions, eventStakeholders, eventTimelines, users } from "./storage";
import { and, eq, gte, lte } from "drizzle-orm";

// Enhanced Event Production Workflow System
export class EventProductionWorkflow {
  
  // Initialize complete event production workflow
  async initializeEventProduction(bookingId: number, userId: number) {
    try {
      // Get booking details
      const booking = await db.select().from(bookings).where(eq(bookings.id, bookingId)).limit(1);
      if(!booking.length) throw new Error('Booking not found');
      
      const bookingData = booking[0];
      
      // Create event production record
      const eventProduction = await db.insert(eventProductions).values({
        bookingId,;
        organizerId: userId,;
        eventName: bookingData.eventTitle || 'Event Production',;
        eventDate: new Date(bookingData.eventDate),;
        venueLocation: bookingData.location || 'TBD',;
        status: 'planning',;
        createdAt: new Date(),;
        budget: bookingData.totalAmount || 0,;
        eventType: bookingData.eventType || 'performance';
      }).returning();
      
      const productionId = eventProduction[0].id;
      
      // Initialize stakeholder categories
      await this.initializeStakeholders(productionId, bookingData);
      
      // Create event timeline
      await this.createEventTimeline(productionId, bookingData.eventDate);
      
      // Generate initial documents
      await this.generateInitialDocuments(productionId, bookingData);
      
      return {
        success: true,;
        eventProductionId: productionId,;
        message: 'Event production workflow initialized successfully';
      };
      
    } catch(error) {
      console.error('Event production initialization error:', error);
      throw error;
    }
  }
  
  // Initialize all stakeholder categories
  async initializeStakeholders(productionId: number, bookingData: any) {
    const stakeholderCategories = [;
      // Core Performance Team
      { category: 'talent', subcategory: 'primary_artist', required: true, autoAssign: true },
      { category: 'talent', subcategory: 'supporting_musicians', required: false, autoAssign: true },
      
      // Production Team
      { category: 'technical', subcategory: 'sound_engineer', required: true, autoAssign: false },
      { category: 'technical', subcategory: 'lighting_crew', required: true, autoAssign: false },
      { category: 'technical', subcategory: 'stage_manager', required: true, autoAssign: false },
      
      // Media & Marketing Team
      { category: 'media', subcategory: 'photographer', required: false, autoAssign: false },
      { category: 'media', subcategory: 'videographer', required: false, autoAssign: false },
      { category: 'media', subcategory: 'social_media_manager', required: false, autoAssign: false },
      { category: 'media', subcategory: 'marketing_coordinator', required: false, autoAssign: false },
      
      // Event Presentation
      { category: 'presentation', subcategory: 'master_of_ceremony', required: false, autoAssign: false },
      { category: 'presentation', subcategory: 'dj', required: false, autoAssign: false },
      
      // Security & Management
      { category: 'security', subcategory: 'security_chief', required: false, autoAssign: false },
      { category: 'security', subcategory: 'bodyguards', required: false, autoAssign: false },
      { category: 'security', subcategory: 'ushers', required: false, autoAssign: false },
      
      // Media Relations
      { category: 'media_relations', subcategory: 'radio_coordinator', required: false, autoAssign: false },
      { category: 'media_relations', subcategory: 'tv_coordinator', required: false, autoAssign: false },
      { category: 'media_relations', subcategory: 'print_media_coordinator', required: false, autoAssign: false },
      { category: 'media_relations', subcategory: 'influencer_coordinator', required: false, autoAssign: false }
    ];
    
    // Insert stakeholder placeholders
    for(const stakeholder of stakeholderCategories) {
      await db.insert(eventStakeholders).values({
        eventProductionId: productionId,;
        category: stakeholder.category,;
        subcategory: stakeholder.subcategory,;
        status: 'pending',;
        required: stakeholder.required,;
        assignedAt: stakeholder.autoAssign ? new Date()  : null,;
        createdAt: new Date();
      });
    }
    
    // Auto-assign primary talent from booking
    if(bookingData.assignedArtists ? .length > 0) {
      await this.assignStakeholder(productionId, 'talent', 'primary_artist', bookingData.assignedArtists[0].userId);
    }
  }
  
  // Create comprehensive event timeline
  async createEventTimeline(productionId : number, eventDate: string) {
    const eventDateTime = new Date(eventDate);
    
    const timelineItems = [;
      // Pre-event planning phase(60-90 days)
      { 
        phase: 'planning',;
        task: 'Initial stakeholder assignments',;
        daysFromEvent: -90,;
        category: 'setup',;
        description: 'Complete initial team assignments and venue confirmations';
      },
      { 
        phase: 'planning',;
        task: 'Marketing strategy development',;
        daysFromEvent: -75,;
        category: 'marketing',;
        description: 'Develop comprehensive marketing and promotion strategy';
      },
      { 
        phase: 'planning',;
        task: 'Technical requirements finalization',;
        daysFromEvent: -60,;
        category: 'technical',;
        description: 'Finalize sound, lighting, and staging requirements';
      },
      
      // Marketing phase(30-45 days)
      { 
        phase: 'marketing',;
        task: 'Media kit distribution',;
        daysFromEvent: -45,;
        category: 'media',;
        description: 'Distribute press kits to radio, TV, and print media';
      },
      { 
        phase: 'marketing',;
        task: 'Social media campaign launch',;
        daysFromEvent: -30,;
        category: 'marketing',;
        description: 'Launch coordinated social media promotional campaign';
      },
      { 
        phase: 'marketing',;
        task: 'Influencer outreach',;
        daysFromEvent: -25,;
        category: 'media',;
        description: 'Coordinate with social media influencers for promotion';
      },
      
      // Final preparations(7-14 days)
      { 
        phase: 'preparation',;
        task: 'Technical rehearsal',;
        daysFromEvent: -7,;
        category: 'technical',;
        description: 'Complete technical sound check and lighting rehearsal';
      },
      { 
        phase: 'preparation',;
        task: 'Security briefing',;
        daysFromEvent: -3,;
        category: 'security',;
        description: 'Final security protocol review and team briefing';
      },
      { 
        phase: 'preparation',;
        task: 'Final coordination meeting',;
        daysFromEvent: -1,;
        category: 'coordination',;
        description: 'All stakeholders final coordination and rundown review';
      },
      
      // Event day
      { 
        phase: 'event',;
        task: 'Setup and soundcheck',;
        daysFromEvent: 0,;
        category: 'technical',;
        description: 'Equipment setup, soundcheck, and final preparations';
      },
      { 
        phase: 'event',;
        task: 'Live performance',;
        daysFromEvent: 0,;
        category: 'performance',;
        description: 'Main event performance and coordination';
      },
      
      // Post-event(1-7 days)
      { 
        phase: 'post_event',;
        task: 'Equipment breakdown',;
        daysFromEvent: 1,;
        category: 'technical',;
        description: 'Equipment teardown and venue restoration';
      },
      { 
        phase: 'post_event',;
        task: 'Media content compilation',;
        daysFromEvent: 2,;
        category: 'media',;
        description: 'Compile photos, videos, and social media content';
      },
      { 
        phase: 'post_event',;
        task: 'Payment processing',;
        daysFromEvent: 7,;
        category: 'financial',;
        description: 'Process payments to all stakeholders';
      },
      { 
        phase: 'post_event',;
        task: 'Event evaluation',;
        daysFromEvent: 14,;
        category: 'evaluation',;
        description: 'Complete event evaluation and feedback collection';
      }
    ];
    
    // Insert timeline items
    for(const item of timelineItems) {
      const scheduledDate = new Date(eventDateTime);
      scheduledDate.setDate(scheduledDate.getDate() + item.daysFromEvent);
      
      await db.insert(eventTimelines).values({
        eventProductionId: productionId,;
        phase: item.phase,;
        task: item.task,;
        category: item.category,;
        description: item.description,;
        scheduledDate,;
        status: 'pending',;
        createdAt: new Date();
      });
    }
  }
  
  // Assign stakeholder to role
  async assignStakeholder(productionId: number, category: string, subcategory: string, userId: number) {
    try {
      // Update stakeholder assignment
      await db.update(eventStakeholders);
        .set({
          userId,;
          status: 'assigned',;
          assignedAt: new Date();
        })
        .where(;
          and(;
            eq(eventStakeholders.eventProductionId, productionId),;
            eq(eventStakeholders.category, category),;
            eq(eventStakeholders.subcategory, subcategory);
          )
        );
      
      // Generate role-specific documents
      await this.generateStakeholderDocuments(productionId, category, subcategory, userId);
      
      // Send assignment notification
      await this.sendStakeholderNotification(productionId, category, subcategory, userId);
      
      return { success: true, message: 'Stakeholder assigned successfully' };
      
    } catch(error) {
      console.error('Stakeholder assignment error:', error);
      throw error;
    }
  }
  
  // Generate stakeholder-specific documents
  async generateStakeholderDocuments(productionId: number, category: string, subcategory: string, userId: number) {
    try {
      // Get event production details
      const production = await db.select();
        .from(eventProductions);
        .where(eq(eventProductions.id, productionId));
        .limit(1);
      
      if(!production.length) return;
      
      const productionData = production[0];
      
      // Get user details
      const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if(!user.length) return;
      
      const userData = user[0];
      
      let documentContent = '';
      let documentType = '';
      
      // Generate role-specific documents
      switch(`${category}_${subcategory}`) {
        case 'technical_sound_engineer':
          documentContent = await this.generateSoundEngineerGuide(productionData, userData);
          documentType = 'sound_engineer_guide';
          break;
          
        case 'technical_lighting_crew':
          documentContent = await this.generateLightingCrewGuide(productionData, userData);
          documentType = 'lighting_crew_guide';
          break;
          
        case 'media_photographer':
          documentContent = await this.generatePhotographerBrief(productionData, userData);
          documentType = 'photographer_brief';
          break;
          
        case 'media_videographer':
          documentContent = await this.generateVideographerBrief(productionData, userData);
          documentType = 'videographer_brief';
          break;
          
        case 'presentation_master_of_ceremony':
          documentContent = await this.generateMCBrief(productionData, userData);
          documentType = 'mc_brief';
          break;
          
        case 'security_security_chief':
          documentContent = await this.generateSecurityBrief(productionData, userData);
          documentType = 'security_brief';
          break;
          
        case 'media_relations_radio_coordinator':
          documentContent = await this.generateRadioMediaKit(productionData, userData);
          documentType = 'radio_media_kit';
          break;
          
        case 'media_relations_tv_coordinator':
          documentContent = await this.generateTVMediaKit(productionData, userData);
          documentType = 'tv_media_kit';
          break;
          
        default:
          documentContent = await this.generateGenericStakeholderBrief(productionData, userData, category, subcategory);
          documentType = 'stakeholder_brief';
      }
      
      // Save document
      await db.insert(eventDocuments).values({
        eventProductionId: productionId,;
        stakeholderCategory: category,;
        stakeholderSubcategory: subcategory,;
        documentType,;
        title: `${subcategory.replace('_', ' ').toUpperCase()} - ${productionData.eventName}`,
        content: documentContent,;
        generatedFor: userId,;
        createdAt: new Date();
      });
      
    } catch(error) {
      console.error('Document generation error:', error);
    }
  }
  
  // Generate lighting crew guide with song-specific ambiance
  async generateLightingCrewGuide(productionData: any, userData: any) {
    // Get artist setlist and song-specific lighting cues
    const booking = await db.select().from(bookings).where(eq(bookings.id, productionData.bookingId)).limit(1);
    const bookingData = booking[0];
    
    // Sample song-specific lighting guidance(would be pulled from artist profiles/setlists)
    const lightingCues = [;
      {
        song: "Opening Song",;
        mood: "energetic",;
        colors: ["bright white", "blue", "purple"],;
        effects: ["strobes on chorus", "moving heads sweep"],;
        intensity: "high",;
        timing: "0:00 - 3:30";
      },
      {
        song: "Ballad Performance",;
        mood: "intimate",;
        colors: ["warm amber", "soft pink", "dim white"],;
        effects: ["slow color transitions", "haze for atmosphere"],;
        intensity: "medium-low",;
        timing: "3:30 - 7:00";
      },
      {
        song: "High Energy Finale",;
        mood: "explosive",;
        colors: ["full spectrum", "rapid color changes"],;
        effects: ["full strobes", "lasers", "pyro coordination"],;
        intensity: "maximum",;
        timing: "Final 4 minutes";
      }
    ];
    
    return `;
# LIGHTING CREW GUIDE;
## Event: ${productionData.eventName}
## Date: ${new Date(productionData.eventDate).toLocaleDateString()}
## Venue: ${productionData.venueLocation}

### LIGHTING DIRECTOR: ${userData.fullName}
### Contact: ${userData.email} | ${userData.phone}

---;

## SONG-SPECIFIC LIGHTING CUES;

${lightingCues.map(cue => `
### ${cue ? .song?.toUpperCase()}
- **Mood** : ${cue.mood},
- **Primary Colors**: ${cue ? .colors?.join(', ')},
- **Effects** : ${cue?.effects?.join(', ')}
- **Intensity Level**: ${cue.intensity}
- **Timing**: ${cue.timing}
- **Notes**: Follow artist's energy level and adjust accordingly;

`).join('')}

## TECHNICAL SPECIFICATIONS;
- **Stage Dimensions**: 40ft x 30ft(standard);
- **Power Requirements**: 3-phase 400A service;
- **Fixture Inventory**: 
  - 24x LED Par Cans;
  - 12x Moving Head Spots;
  - 8x Moving Head Wash;
  - 4x Strobes;
  - 2x Haze Machines;
- **Control**: MA2 Console or ETC Ion;

## SETUP TIMELINE;
- **Load-in**: 8:00 AM - 12:00 PM;
- **Focus & Programming**: 12:00 PM - 4:00 PM;
- **Rehearsal**: 4:00 PM - 6:00 PM;
- **Show**: 8:00 PM - 11:00 PM;
- **Load-out**: 11:00 PM - 2:00 AM;

## SAFETY PROTOCOLS;
- All fixtures must be safety cabled;
- Emergency lighting systems must remain functional;
- Coordinate with venue fire safety officer;
- Maintain clear emergency exits lighting;

## CONTACT INFORMATION;
- **Production Manager**: [To be assigned];
- **Sound Engineer**: [To be assigned];
- **Stage Manager**: [To be assigned];
- **Venue Technical Director**: [Venue contact];

---;
*This document is confidential and specific to this event production.*
    `;
  }
  
  // Generate MC brief with artist bios
  async generateMCBrief(productionData: any, userData: any) {
    // Get artist information from booking
    const booking = await db.select().from(bookings).where(eq(bookings.id, productionData.bookingId)).limit(1);
    const bookingData = booking[0];
    
    // Sample artist bios(would be pulled from user profiles)
    const artistBios = [;
      {
        name: "Main Artist",;
        bio: "Grammy-nominated recording artist with over 2 million albums sold worldwide.Known for their dynamic stage presence and chart-topping hits including 'Summer Nights' and 'City Dreams'.",;
        achievements: ["Grammy Nomination 2023", "Billboard #1 Single", "World Tour 2022"],;
        pronunciationGuide: "AR-tist NAME [are-TEEST naym]",;
        personalNotes: "Prefers to be introduced as 'the voice of our generation'";
      }
    ];
    
    return `;
# MASTER OF CEREMONY BRIEF;
## Event: ${productionData.eventName}
## Date: ${new Date(productionData.eventDate).toLocaleDateString()}
## Venue: ${productionData.venueLocation}

### MC: ${userData.fullName}
### Contact: ${userData.email} | ${userData.phone}

---;

## ARTIST BIOGRAPHIES & INTRODUCTIONS;

${artistBios.map(artist => `
### ${artist ? .name?.toUpperCase()}
**Biography** : ${artist.bio}

**Key Achievements**:
${artist ? .achievements?.map(achievement => `- ${achievement}`).join('\n')}

**Pronunciation Guide** : ${artist.pronunciationGuide}

**Introduction Notes**: ${artist.personalNotes}

**Suggested Introduction**: 
"Ladies and gentlemen, please welcome to the stage [brief achievement], the incredible [artist name]!";

---;
`).join('')}

## EVENT RUNDOWN;
- **7:30 PM**: Welcome guests, event overview;
- **8:00 PM**: Opening act introduction;
- **8:30 PM**: Main artist introduction;
- **10:30 PM**: Closing remarks and thank you;
- **11:00 PM**: Event conclusion;

## MC GUIDELINES;
- **Tone**: Professional yet energetic;
- **Audience Interaction**: Engage but keep focus on artists;
- **Timing**: Keep introductions under 2 minutes each;
- **Emergency Protocols**: Have backup material ready;
- **Special Announcements**: [To be provided by event organizer];

## CONTACT INFORMATION;
- **Event Organizer**: ${productionData.organizerId}
- **Stage Manager**: [To be assigned];
- **Sound Engineer**: [To be assigned];
- **Emergency Contact**: [Venue security];

## BACKUP TALKING POINTS;
- Event significance and special occasion;
- Venue history and importance;
- Community impact and appreciation;
- Artist career highlights and achievements;

---;
*This document contains confidential artist information.Handle with discretion.*
    `;
  }
  
  // Generate photographer brief
  async generatePhotographerBrief(productionData: any, userData: any) {
    return `;
# PHOTOGRAPHY BRIEF;
## Event: ${productionData.eventName}
## Date: ${new Date(productionData.eventDate).toLocaleDateString()}

### PHOTOGRAPHER: ${userData.fullName}
### Contact: ${userData.email}

---;

## SHOT LIST REQUIREMENTS;

### PRE-EVENT(30 minutes before);
- Setup and sound check candids;
- Venue atmosphere and crowd building;
- Artist preparation(if permitted);
- VIP arrivals and red carpet moments;

### DURING PERFORMANCE;
- **Opening Songs**: Wide shots establishing stage and crowd;
- **Mid-Performance**: Close-ups of artist expressions and crowd reactions;
- **High Energy Moments**: Action shots with dramatic lighting;
- **Intimate Moments**: Artistic close-ups during ballads;
- **Finale**: Crowd celebration and artist appreciation;

### POST-EVENT;
- Artist meet-and-greets;
- VIP interactions;
- Behind-the-scenes moments;
- Equipment breakdown(artistic shots);

## TECHNICAL SPECIFICATIONS;
- **Lighting Conditions**: Stage lighting only, no flash during performance;
- **Recommended Settings**: ISO 1600-6400, f/2.8 or wider;
- **Equipment**: Full-frame camera recommended;
- **Backup**: Dual memory cards required;

## DELIVERABLES;
- **Timeline**: 48 hours for initial gallery;
- **Format**: High-resolution JPEG + RAW files;
- **Quantity**: Minimum 100 edited photos;
- **Usage Rights**: Event organizer has full promotional rights;

## RESTRICTIONS;
- No flash during performance;
- Stay in designated photo pit areas;
- First 3 songs only from pit, then move to FOH;
- No photography during specific intimate songs(TBD);

---;
*Capture the energy and emotion of this special event.*
    `;
  }
  
  // Generate comprehensive media kit for radio
  async generateRadioMediaKit(productionData: any, userData: any) {
    return `;
# RADIO MEDIA KIT;
## Event: ${productionData.eventName}
## Date: ${new Date(productionData.eventDate).toLocaleDateString()}

### RADIO COORDINATOR: ${userData.fullName}

---;

## PRESS RELEASE(RADIO FORMAT);

**FOR IMMEDIATE RELEASE**

**${productionData.eventName} - Live Performance Event**

[City, Date] - Music fans are invited to experience an unforgettable evening of live entertainment at ${productionData.eventName}, taking place ${new Date(productionData.eventDate).toLocaleDateString()} at ${productionData.venueLocation}.

## INTERVIEW OPPORTUNITIES;
- **Pre-Event**: Artist interviews available 1-2 weeks prior;
- **Day-of**: Red carpet interviews and backstage access;
- **Post-Event**: Exclusive reaction interviews;

## PROMOTIONAL MATERIALS PROVIDED;
- 30-second promotional spots(MP3 format);
- 60-second promotional spots(MP3 format);
- Artist interview clips for rotation;
- High-quality photos for social media;

## CONTEST OPPORTUNITIES;
- Ticket giveaways for on-air contests;
- Meet-and-greet packages;
- VIP experience packages;
- Merchandise bundles;

## KEY TALKING POINTS;
- Event significance in local music scene;
- Artist achievements and career highlights;
- Community impact and charitable aspects;
- Unique performance elements or special guests;

## CONTACT INFORMATION;
**For interviews and media inquiries:**
- ${userData.fullName}
- ${userData.email}
- ${userData.phone}

**For technical support:**
- Audio files and promotional materials;
- Interview scheduling;
- Contest coordination;

---;
*All promotional materials available for immediate use.*
    `;
  }
  
  // Send stakeholder notification
  async sendStakeholderNotification(productionId: number, category: string, subcategory: string, userId: number) {
    try {
      const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if(!user.length) return;
      
      const production = await db.select().from(eventProductions).where(eq(eventProductions.id, productionId)).limit(1);
      if(!production.length) return;
      
      const userData = user[0];
      const productionData = production[0];
      
      const roleTitle = subcategory.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
      
      await emailService.sendEmail({
        to: userData.email,;
        subject: `Event Assignment: ${roleTitle} - ${productionData.eventName}`,
        html: `;
          <h2>Event Production Assignment</h2>;
          <p>Dear ${userData.fullName},</p>
          <p>You have been assigned as <strong>${roleTitle}</strong> for the upcoming event:</p>
          
          <div style="background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px;">;
            <h3>${productionData.eventName}</h3>
            <p><strong>Date:</strong> ${new Date(productionData.eventDate).toLocaleDateString()}</p>
            <p><strong>Venue:</strong> ${productionData.venueLocation}</p>
            <p><strong>Your Role:</strong> ${roleTitle}</p>
          </div>;
          
          <p>Your role-specific brief and documents have been generated and are available in your dashboard.</p>;
          <p>Please confirm your availability and review all provided materials.</p>;
          
          <p>For questions, contact the event organizer or production manager.</p>;
          
          <p>Best regards,<br />WaituMusic Event Production Team</p>;
        `
      });
      
    } catch(error) {
      console.error('Notification sending error:', error);
    }
  }
  
  // Process event payments to all stakeholders
  async processEventPayments(productionId: number) {
    try {
      // Get all assigned stakeholders
      const stakeholders = await db.select();
        .from(eventStakeholders);
        .where(;
          and(;
            eq(eventStakeholders.eventProductionId, productionId),;
            eq(eventStakeholders.status, 'assigned');
          )
        );
      
      // Payment rates by role(would be configurable)
      const paymentRates = {
        'sound_engineer': 500,;
        'lighting_crew': 400,;
        'photographer': 300,;
        'videographer': 400,;
        'security_chief': 250,;
        'master_of_ceremony': 200,;
        'dj': 300;
      };
      
      for(const stakeholder of stakeholders) {
        if(stakeholder.userId && paymentRates[stakeholder.subcategory]) {
          await db.insert(eventPayments).values({
            eventProductionId: productionId,;
            userId: stakeholder.userId,;
            role: stakeholder.subcategory,;
            amount: paymentRates[stakeholder.subcategory],;
            status: 'pending',;
            scheduledDate: new Date(),;
            createdAt: new Date();
          });
        }
      }
      
      return { success: true, message: 'Payment processing initiated' };
      
    } catch(error) {
      console.error('Payment processing error:', error);
      throw error;
    }
  }
  
  // Generic stakeholder brief generator
  async generateGenericStakeholderBrief(productionData: any, userData: any, category: string, subcategory: string) {,
    const roleTitle = subcategory.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    return `;
# ${roleTitle.toUpperCase()} BRIEF
## Event: ${productionData.eventName}
## Date: ${new Date(productionData.eventDate).toLocaleDateString()}
## Venue: ${productionData.venueLocation}

### ASSIGNED TO: ${userData.fullName}
### Contact: ${userData.email} | ${userData.phone}

---;

## ROLE RESPONSIBILITIES;
As the ${roleTitle} for this event, you are responsible for:
- Professional execution of ${subcategory.replace('_', ' ')} duties
- Coordination with other team members;
- Adherence to event timeline and protocols;
- Maintaining professional standards throughout;

## EVENT TIMELINE;
- **Setup**: 2 hours before event start;
- **Event Duration**: As scheduled;
- **Breakdown**: 1 hour after event conclusion;

## CONTACT INFORMATION;
- **Production Manager**: [To be assigned];
- **Event Organizer**: [Contact details];
- **Emergency Contact**: [Venue security];

## ADDITIONAL NOTES;
Please review all event materials and confirm your availability.;
Report any concerns or questions to the production manager immediately.;

---;
*This is a professional event production.Maintain confidentiality and professionalism at all times.*
    `;
  }
}

export const eventProductionWorkflow = new EventProductionWorkflow();
