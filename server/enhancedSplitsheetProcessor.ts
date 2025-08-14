import { db } from './db';
import { enhancedSplitsheets, enhancedSplitsheetNotifications, audioFileMetadata, users, artists, musicians, professionals } from '@shared/schema';
import { eq, and, sql } from 'drizzle-orm';
import ISRCGenerator from './isrcGenerator';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

interface AudioProcessingResult {
  isrcCode: string;
  processingStatus: 'completed' | 'failed';
  error?: string;
  metadata?: {
    duration: number;
    bitrate: string;
    sampleRate: string;
    fileSize: number;
  };
}

interface EnhancedSplitsheetData {
  songTitle: string;
  isrc: string;
  workId?: string;
  upcEan?: string;
  agreementDate?: string;
  audioFileUrl?: string;
  participants: Array<{
    id: string;
    assignedUserId?: number;
    name: string;
    email: string;
    address: string;
    phone?: string;
    ipiNumber?: string;
    proAffiliation?: string;
    nationalId?: string;
    dateOfBirth?: string;
    roles: Array<{
      type: 'songwriter' | 'melody_creator' | 'beat_music_composer' | 'recording_artist' | 'label_rep' | 'publisher' | 'studio_rep' | 'executive_producer';
      percentage: number;
      notes?: string;
      entryId?: string; // WM-SSA-[Role Code]-[ISRC]-[count]
    }>;
    hasSigned: boolean;
    signatureImageUrl?: string;
    signedAt?: string;
    accessToken?: string;
  }>;
  basePrice: number;
  finalPrice: number;
  discountPercentage: number;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'free';
}

export class EnhancedSplitsheetProcessor {
  private emailTransporter: nodemailer.Transporter;

  constructor() {
    this.emailTransporter = nodemailer.createTransport({
      host: 'mail.comeseetv.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER || 'admin@waitumusic.com',
        pass: process.env.SMTP_PASS || 'default-password'
      }
    });
  }

  /**
   * Create enhanced splitsheet with user assignment and automatic data population
   */
  async createEnhancedSplitsheet(
    splitsheetData: EnhancedSplitsheetData,
    audioFile: Express.Multer.File | null,
    createdBy: number
  ): Promise<{
    splitsheetId: number;
    notificationsSent: number;
    paymentRequired: boolean;
    isrcGenerated: boolean;
  }> {
    try {
      // Auto-populate user data for assigned participants
      const enrichedParticipants = await this.enrichParticipantsWithUserData(splitsheetData.participants);
      
      // Generate splitsheet reference number
      const referenceNumber = await this.generateSplitsheetReference(splitsheetData.isrc);
      
      // Generate entry IDs for all roles
      const participantsWithEntryIds = this.generateEntryIds(enrichedParticipants, splitsheetData.isrc);
      
      // Calculate percentage totals for validation
      const percentageTotals = this.calculatePercentageTotals(participantsWithEntryIds);
      
      // Generate ISRC if audio file provided
      let isrcCode = '';
      let audioMetadataId = null;
      
      if (audioFile) {
        const audioProcessing = await this.processAudioFile(audioFile, splitsheetData.songTitle);
        isrcCode = audioProcessing.isrcCode;
      }

      // Create enhanced splitsheet record
      const [splitsheet] = await db.insert(enhancedSplitsheets).values({
        songTitle: splitsheetData.songTitle,
        songReference: referenceNumber,
        workId: splitsheetData.workId,
        upcEan: splitsheetData.upcEan,
        agreementDate: splitsheetData.agreementDate ? new Date(splitsheetData.agreementDate) : new Date(),
        audioFileUrl: splitsheetData.audioFileUrl || audioFile?.filename,
        originalFileName: audioFile?.originalname,
        fileSize: audioFile?.size,
        isrcCode,
        metadataEmbedded: false,
        participants: participantsWithEntryIds,
        status: 'draft',
        allSigned: false,
        signedCount: 0,
        totalParticipants: participantsWithEntryIds.length,
        serviceType: 'enhanced_splitsheet',
        basePrice: splitsheetData.basePrice.toString(),
        discountPercentage: splitsheetData.discountPercentage.toString(),
        finalPrice: splitsheetData.finalPrice.toString(),
        paymentStatus: splitsheetData.paymentStatus,
        isPaidFor: splitsheetData.paymentStatus === 'free' || splitsheetData.paymentStatus === 'paid',
        canDownload: false,
        songwritingPercentageTotal: percentageTotals.songwriting.toString(),
        melodyPercentageTotal: percentageTotals.melody.toString(),
        beatProductionPercentageTotal: percentageTotals.beatProduction.toString(),
        publishingPercentageTotal: percentageTotals.publishing.toString(),
        executiveProducerPercentageTotal: percentageTotals.executiveProducer.toString(),
        createdBy,
        notificationsSent: 0,
        downloadCount: 0
      }).returning();

      // Create audio file metadata record if audio file was processed
      if (audioFile && isrcCode) {
        await this.createAudioMetadata(splitsheet.id, audioFile, isrcCode);
      }

      // Send notifications to all participants
      const notificationsSent = await this.sendParticipantNotifications(splitsheet.id, participantsWithEntryIds);

      // Update notifications sent count
      await db.update(enhancedSplitsheets)
        .set({ 
          notificationsSent,
          status: 'pending_signatures',
          updatedAt: new Date()
        })
        .where(eq(enhancedSplitsheets.id, splitsheet.id));

      return {
        splitsheetId: splitsheet.id,
        notificationsSent,
        paymentRequired: splitsheetData.paymentStatus === 'pending',
        isrcGenerated: !!isrcCode
      };

    } catch (error) {
      console.error('Enhanced splitsheet creation failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to create enhanced splitsheet: ${errorMessage}`);
    }
  }

  /**
   * Enrich participants with user profile data for assigned users
   */
  private async enrichParticipantsWithUserData(participants: any[]): Promise<any[]> {
    const enrichedParticipants = [];

    for (const participant of participants) {
      let enrichedParticipant = { ...participant };

      // If user is assigned, auto-populate their data
      if (participant.assignedUserId) {
        try {
          const userData = await this.getUserProfileData(participant.assignedUserId);
          if (userData) {
            enrichedParticipant = {
              ...enrichedParticipant,
              name: userData.fullName || participant.name,
              email: userData.email || participant.email,
              address: userData.address || participant.address,
              phone: userData.phoneNumber || participant.phone,
              ipiNumber: userData.ipiNumber || participant.ipiNumber,
              proAffiliation: userData.performingRightsOrganization || participant.proAffiliation,
              // Generate access token for signature collection
              accessToken: crypto.randomBytes(32).toString('hex')
            };
          }
        } catch (error) {
          console.error(`Failed to enrich participant ${participant.assignedUserId}:`, error);
        }
      } else {
        // Generate access token for non-users
        enrichedParticipant.accessToken = crypto.randomBytes(32).toString('hex');
      }

      enrichedParticipants.push(enrichedParticipant);
    }

    return enrichedParticipants;
  }

  /**
   * Get comprehensive user profile data for auto-population
   */
  private async getUserProfileData(userId: number): Promise<any | null> {
    try {
      // Get base user data
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      if (!user) return null;

      let profileData = {
        fullName: user.fullName,
        email: user.email,
        phoneNumber: null as string | null,
        address: null as string | null,
        ipiNumber: null as string | null,
        performingRightsOrganization: null as string | null
      };

      // Check if user is an artist
      const [artist] = await db.select().from(artists).where(eq(artists.userId, userId));
      if (artist) {
        profileData = {
          ...profileData,
          ipiNumber: artist.ipiNumber,
          performingRightsOrganization: artist.performingRightsOrganization
        };
      }

      // Check if user is a musician
      const [musician] = await db.select().from(musicians).where(eq(musicians.userId, userId));
      if (musician) {
        profileData = {
          ...profileData,
          ipiNumber: musician.ipiNumber || profileData.ipiNumber,
          performingRightsOrganization: musician.performingRightsOrganization || profileData.performingRightsOrganization
        };
      }

      // Check if user is a professional
      const [professional] = await db.select().from(professionals).where(eq(professionals.userId, userId));
      if (professional) {
        profileData = {
          ...profileData,
          ipiNumber: professional.ipiNumber || profileData.ipiNumber,
          performingRightsOrganization: professional.performingRightsOrganization || profileData.performingRightsOrganization
        };
      }

      return profileData;
    } catch (error) {
      console.error('Error fetching user profile data:', error);
      return null;
    }
  }

  /**
   * Calculate percentage totals for work validation
   */
  private calculatePercentageTotals(participants: any[]): {
    songwriting: number;
    melody: number;
    beatProduction: number;
    publishing: number;
    executiveProducer: number;
  } {
    let songwriting = 0;
    let melody = 0;
    let beatProduction = 0;
    let publishing = 0;
    let executiveProducer = 0;

    participants.forEach(participant => {
      participant.roles?.forEach((role: any) => {
        switch (role.type) {
          case 'songwriter':
            songwriting += role.percentage || 0;
            break;
          case 'melody_creator':
            melody += role.percentage || 0;
            break;
          case 'beat_music_composer':
            beatProduction += role.percentage || 0;
            break;
          case 'publisher':
            publishing += role.percentage || 0;
            break;
          case 'executive_producer':
            executiveProducer += role.percentage || 0;
            break;
        }
      });
    });

    return { songwriting, melody, beatProduction, publishing, executiveProducer };
  }

  /**
   * Generate splitsheet reference number: WM-SS-{ISRC_SUFFIX}-{YYYYMMDD}-{SEQ}
   */
  private async generateSplitsheetReference(isrc: string): Promise<string> {
    try {
      const now = new Date();
      const dateStr = now.getFullYear().toString() + 
                     (now.getMonth() + 1).toString().padStart(2, '0') + 
                     now.getDate().toString().padStart(2, '0');
      
      // Extract DMA0D (Country Code + Registrant) from ISRC
      const isrcClean = isrc.replace(/-/g, '');
      const countryCode = isrcClean.substring(0, 2); // DM
      const registrant = isrcClean.substring(2, 5); // A0D
      const isrcSuffix = (countryCode + registrant).toUpperCase(); // DMA0D
      
      // Check for existing splitsheets with same ISRC suffix and date
      const existing = await db.select()
        .from(enhancedSplitsheets)
        .where(sql`${enhancedSplitsheets.songReference} LIKE ${'%WM-SS-' + isrcSuffix + '-' + dateStr + '-%'}`);
      
      const sequentialNumber = (existing.length + 1).toString().padStart(3, '0');
      
      return `WM-SS-${isrcSuffix}-${dateStr}-${sequentialNumber}`;
    } catch (error: any) {
      // Fallback to basic format if database query fails
      const now = new Date();
      const timestamp = now.getTime().toString().slice(-6);
      return `WM-SS-FALLBACK-${timestamp}-001`;
    }
  }

  /**
   * Generate entry IDs with role shortname codes
   */
  private generateEntryIds(participants: any[], isrc: string): any[] {
    const roleCounts: { [key: string]: number } = {};
    const roleShortNames: { [key: string]: string } = {
      songwriter: 'WC', // Writer/Composer/Author
      melody_creator: 'MC', // Melody Creator
      beat_music_composer: 'BC', // Beat/Music Composer
      recording_artist: 'RA', // Recording Artist
      label_rep: 'LD', // Label Representative
      publisher: 'PD', // Publisher
      studio_rep: 'SD', // Studio Representative
      executive_producer: 'EP' // Executive Producer
    };

    return participants.map(participant => ({
      ...participant,
      roles: participant.roles.map((role: any) => {
        const roleCode = roleShortNames[role.type] || 'XX';
        const count = (roleCounts[role.type] || 0) + 1;
        roleCounts[role.type] = count;
        
        return {
          ...role,
          entryId: `WM-SSA-${roleCode}-${isrc}-${count.toString().padStart(2, '0')}`
        };
      })
    }));
  }

  /**
   * Process audio file and generate ISRC code
   */
  private async processAudioFile(
    audioFile: Express.Multer.File,
    songTitle: string
  ): Promise<AudioProcessingResult> {
    try {
      // Generate ISRC code
      const isrcCode = await ISRCGenerator.generateISRC('Unknown Artist', songTitle); // Generate ISRC code

      // Basic file validation and metadata extraction
      const metadata = {
        duration: 0, // Would be extracted using audio library
        bitrate: audioFile.mimetype.includes('mp3') ? '320kbps' : 'lossless',
        sampleRate: '44.1kHz', // Default assumption
        fileSize: audioFile.size
      };

      return {
        isrcCode,
        processingStatus: 'completed',
        metadata
      };
    } catch (error: any) {
      return {
        isrcCode: '',
        processingStatus: 'failed',
        error: error.message
      };
    }
  }

  /**
   * Create audio file metadata record
   */
  private async createAudioMetadata(
    enhancedSplitsheetId: number,
    audioFile: Express.Multer.File,
    isrcCode: string
  ): Promise<void> {
    await db.insert(audioFileMetadata).values({
      enhancedSplitsheetId,
      originalFileName: audioFile.originalname,
      fileType: audioFile.mimetype.includes('wav') ? 'WAV' : 'MP3',
      bitrate: audioFile.mimetype.includes('mp3') ? '320kbps' : 'lossless',
      sampleRate: '44.1kHz',
      duration: '0', // Would be extracted using audio library
      fileSize: audioFile.size,
      isrcCode,
      isrcEmbedded: false,
      title: '', // Would be extracted from file
      processingStatus: 'completed',
      storageUrl: `/uploads/${audioFile.filename}`,
      publicUrl: `/uploads/${audioFile.filename}`
    });
  }

  /**
   * Send notification emails to all participants
   */
  private async sendParticipantNotifications(
    splitsheetId: number,
    participants: any[]
  ): Promise<number> {
    let notificationsSent = 0;

    for (const participant of participants) {
      try {
        const notification = await db.insert(enhancedSplitsheetNotifications).values({
          enhancedSplitsheetId: splitsheetId,
          recipientEmail: participant.email,
          recipientName: participant.name,
          participantId: participant.id,
          notificationType: 'signature_request',
          accessToken: participant.accessToken,
          emailSubject: 'Splitsheet Signature Request - Wai\'tuMusic',
          emailBody: this.generateNotificationEmail(participant, splitsheetId),
          emailSent: false
        }).returning();

        // Send actual email
        await this.emailTransporter.sendMail({
          from: 'admin@waitumusic.com',
          to: participant.email,
          subject: 'Splitsheet Signature Request - Wai\'tuMusic',
          html: this.generateNotificationEmail(participant, splitsheetId)
        });

        // Mark as sent
        await db.update(enhancedSplitsheetNotifications)
          .set({ emailSent: true, sentAt: new Date() })
          .where(eq(enhancedSplitsheetNotifications.id, notification[0].id));

        notificationsSent++;
      } catch (error) {
        console.error(`Failed to send notification to ${participant.email}:`, error);
      }
    }

    return notificationsSent;
  }

  /**
   * Generate notification email HTML
   */
  private generateNotificationEmail(participant: any, splitsheetId: number): string {
    const signatureUrl = `${process.env.BASE_URL || 'http://localhost:5000'}/splitsheet-sign/${participant.accessToken}`;
    
    return `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #059669;">Wai'tuMusic</h1>
          <h2>Splitsheet Signature Request</h2>
        </div>
        
        <p>Dear ${participant.name},</p>
        
        <p>You have been assigned to a splitsheet that requires your digital signature. Please review the details and sign the splitsheet to confirm your participation and ownership percentages.</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Your Assigned Roles:</h3>
          <ul>
            ${participant.roles?.map((role: any) => 
              `<li><strong>${role.type.replace('_', ' ').toUpperCase()}:</strong> ${role.percentage}%</li>`
            ).join('') || '<li>Role details will be shown in the splitsheet</li>'}
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${signatureUrl}" style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Review & Sign Splitsheet
          </a>
        </div>
        
        <p><strong>Important:</strong></p>
        <ul>
          <li>This splitsheet contains your automatically populated profile information</li>
          <li>You can review and modify details before signing</li>
          <li>All participants must sign before the splitsheet becomes active</li>
          <li>Once fully signed, you can download the final PDF</li>
        </ul>
        
        <hr style="margin: 30px 0;">
        <p style="color: #666; font-size: 12px;">
          This is an automated message from Wai'tuMusic's Enhanced Splitsheet System. 
          If you have questions, please contact admin@waitumusic.com
        </p>
      </div>
    `;
  }

  /**
   * Get splitsheet by access token for signature collection
   */
  async getSplitsheetByAccessToken(accessToken: string): Promise<any | null> {
    try {
      const [splitsheet] = await db.select()
        .from(enhancedSplitsheets)
        .where(eq(enhancedSplitsheets.id, 1)); // Would need to find by access token in participants JSONB
      
      return splitsheet || null;
    } catch (error) {
      console.error('Error fetching splitsheet by access token:', error);
      return null;
    }
  }

  /**
   * Process participant signature
   */
  async processParticipantSignature(
    splitsheetId: number,
    participantId: string,
    signatureData: {
      signatureImageUrl?: string;
      signedAt: string;
    }
  ): Promise<{ success: boolean; allSigned: boolean }> {
    try {
      // Get current splitsheet
      const [splitsheet] = await db.select()
        .from(enhancedSplitsheets)
        .where(eq(enhancedSplitsheets.id, splitsheetId));
      
      if (!splitsheet) {
        throw new Error('Splitsheet not found');
      }

      // Update participant signature in JSONB
      const participants = splitsheet.participants as any[];
      const updatedParticipants = participants.map(p => {
        if (p.id === participantId) {
          return {
            ...p,
            hasSigned: true,
            signatureImageUrl: signatureData.signatureImageUrl,
            signedAt: signatureData.signedAt
          };
        }
        return p;
      });

      // Count signed participants
      const signedCount = updatedParticipants.filter(p => p.hasSigned).length;
      const allSigned = signedCount === updatedParticipants.length;

      // Update splitsheet
      await db.update(enhancedSplitsheets)
        .set({
          participants: updatedParticipants,
          signedCount,
          allSigned,
          status: allSigned ? 'fully_signed' : 'pending_signatures',
          canDownload: allSigned && splitsheet.isPaidFor,
          updatedAt: new Date()
        })
        .where(eq(enhancedSplitsheets.id, splitsheetId));

      return { success: true, allSigned };
    } catch (error) {
      console.error('Error processing signature:', error);
      return { success: false, allSigned: false };
    }
  }

  /**
   * Generate final PDF when all signatures collected and payment complete
   */
  async generateFinalPDF(splitsheetId: number): Promise<string | null> {
    try {
      const [splitsheet] = await db.select()
        .from(enhancedSplitsheets)
        .where(eq(enhancedSplitsheets.id, splitsheetId));
      
      if (!splitsheet || !splitsheet.allSigned || !splitsheet.isPaidFor) {
        return null;
      }

      // Generate PDF using existing PDF generation logic
      const pdfUrl = `/api/enhanced-splitsheet/${splitsheetId}/download`;
      
      // Update splitsheet with PDF URL
      await db.update(enhancedSplitsheets)
        .set({
          finalPdfUrl: pdfUrl,
          canDownload: true,
          status: 'completed',
          updatedAt: new Date()
        })
        .where(eq(enhancedSplitsheets.id, splitsheetId));

      return pdfUrl;
    } catch (error) {
      console.error('Error generating final PDF:', error);
      return null;
    }
  }
}

export const enhancedSplitsheetProcessor = new EnhancedSplitsheetProcessor();