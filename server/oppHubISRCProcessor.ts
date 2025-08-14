// ISRC Code Generation and Processing Service
import { storage } from './storage';

export class OppHubISRCProcessor {
  private static instance: OppHubISRCProcessor;
  private currentCounter: number = 1;
  
  public static getInstance(): OppHubISRCProcessor {
    if (!OppHubISRCProcessor.instance) {
      OppHubISRCProcessor.instance = new OppHubISRCProcessor();
    }
    return OppHubISRCProcessor.instance;
  }

  /**
   * Generate ISRC code using DM-WTM-YY-XXXXX format
   * Odd numbers for releases, even for remixes, 9 before last two digits for video
   */
  generateISRCCode(submissionType: 'release' | 'remix' | 'video'): string {
    const year = new Date().getFullYear().toString().slice(-2);
    let sequenceNumber: string;

    if (submissionType === 'video') {
      // Video content: 9 before last two digits (e.g., 90001, 90003, 90005)
      const videoSequence = Math.floor(this.currentCounter / 2) * 2 + 1; // Ensure odd
      sequenceNumber = `9${videoSequence.toString().padStart(4, '0')}`;
    } else if (submissionType === 'remix') {
      // Even numbers for remixes
      sequenceNumber = (this.currentCounter * 2).toString().padStart(5, '0');
    } else {
      // Odd numbers for releases
      sequenceNumber = (this.currentCounter * 2 - 1).toString().padStart(5, '0');
    }

    this.currentCounter++;
    return `DM-WTM-${year}-${sequenceNumber}`;
  }

  /**
   * Validate cover art for Apple Music compliance
   */
  async validateCoverArt(imageBuffer: Buffer): Promise<{
    isValid: boolean;
    width?: number;
    height?: number;
    format?: string;
    issues?: string[];
  }> {
    try {
      // Basic image validation (would use image processing library in production)
      const issues: string[] = [];
      
      // Mock validation - in production would use sharp or similar
      const mockWidth = 3000;
      const mockHeight = 3000;
      const mockFormat = 'jpeg';

      if (mockWidth < 3000 || mockHeight < 3000) {
        issues.push('Image resolution must be at least 3000x3000 pixels');
      }

      if (mockWidth !== mockHeight) {
        issues.push('Cover art must be square (1:1 aspect ratio)');
      }

      if (!['jpeg', 'jpg', 'png'].includes(mockFormat.toLowerCase())) {
        issues.push('Cover art must be in JPEG or PNG format');
      }

      return {
        isValid: issues.length === 0,
        width: mockWidth,
        height: mockHeight,
        format: mockFormat,
        issues: issues.length > 0 ? issues : undefined
      };
    } catch (error) {
      return {
        isValid: false,
        issues: ['Failed to process cover art image']
      };
    }
  }

  /**
   * Embed metadata into audio file
   */
  async embedMetadata(audioBuffer: Buffer, metadata: {
    title: string;
    artist: string;
    isrcCode: string;
    year?: number;
  }): Promise<Buffer> {
    try {
      // Mock metadata embedding - in production would use node-ffmpeg or similar
      console.log('Embedding metadata:', metadata);
      
      // Return original buffer for now (would return modified buffer in production)
      return audioBuffer;
    } catch (error) {
      console.error('Metadata embedding error:', error);
      throw new Error('Failed to embed metadata');
    }
  }

  /**
   * Generate vocal-removed version for DJ setlists
   */
  async generateVocalRemovedVersion(audioBuffer: Buffer): Promise<Buffer> {
    try {
      // Mock vocal separation - in production would use Spleeter integration
      console.log('Generating vocal-removed version...');
      
      // Return original buffer for now (would return processed buffer in production)
      return audioBuffer;
    } catch (error) {
      console.error('Vocal separation error:', error);
      throw new Error('Failed to generate vocal-removed version');
    }
  }

  /**
   * Process complete ISRC submission
   */
  async processSubmission(submissionData: {
    userId: number;
    artistId: number;
    songTitle: string;
    songReference: string;
    submissionType: 'release' | 'remix' | 'video';
    audioFile: Buffer;
    coverArt: Buffer;
    splitsheetData: any;
  }): Promise<{
    isrcCode: string;
    processedAudioUrl: string;
    vocalRemovedUrl: string;
    coverArtValidation: any;
    submissionId: number;
  }> {
    try {
      // Generate ISRC code
      const isrcCode = this.generateISRCCode(submissionData.submissionType);

      // Validate cover art
      const coverArtValidation = await this.validateCoverArt(submissionData.coverArt);

      // Embed metadata
      const processedAudio = await this.embedMetadata(submissionData.audioFile, {
        title: submissionData.songTitle,
        artist: 'Artist Name', // Would get from artistId
        isrcCode,
        year: new Date().getFullYear()
      });

      // Generate vocal-removed version
      const vocalRemovedAudio = await this.generateVocalRemovedVersion(submissionData.audioFile);

      // Store files and create submission record
      const processedAudioUrl = `/audio/${isrcCode}-processed.wav`;
      const vocalRemovedUrl = `/audio/${isrcCode}-vocal-removed.wav`;

      // Create submission record in database
      const submissionId = Date.now(); // Mock ID

      console.log(`ISRC submission processed: ${isrcCode}`);

      return {
        isrcCode,
        processedAudioUrl,
        vocalRemovedUrl,
        coverArtValidation,
        submissionId
      };
    } catch (error) {
      console.error('ISRC processing error:', error);
      throw new Error('Failed to process ISRC submission');
    }
  }

  /**
   * Create splitsheet and send notifications
   */
  async createSplitsheetWithNotifications(splitsheetData: any, submissionId: number): Promise<{
    splitsheetId: number;
    notificationsSent: number;
  }> {
    try {
      // Create splitsheet record
      const splitsheetId = Date.now(); // Mock ID

      // Extract all parties that need to sign
      const signingParties = [
        ...splitsheetData.composers.map((c: any) => ({ ...c, role: 'composer' })),
        ...splitsheetData.recordingArtists.map((r: any) => ({ ...r, role: 'recording_artist' })),
        ...splitsheetData.labels.map((l: any) => ({ ...l, role: 'label' })),
        ...(splitsheetData.publishers || []).map((p: any) => ({ ...p, role: 'publisher' }))
      ];

      // Send notifications to all parties
      let notificationsSent = 0;
      for (const party of signingParties) {
        try {
          await this.sendSigningNotification(splitsheetId, party);
          notificationsSent++;
        } catch (error) {
          console.error(`Failed to send notification to ${party.name}:`, error);
        }
      }

      console.log(`Splitsheet created with ${notificationsSent} notifications sent`);

      return {
        splitsheetId,
        notificationsSent
      };
    } catch (error) {
      console.error('Splitsheet creation error:', error);
      throw new Error('Failed to create splitsheet');
    }
  }

  /**
   * Send signing notification to party
   */
  private async sendSigningNotification(splitsheetId: number, party: any): Promise<void> {
    try {
      // Generate access token for non-users
      const accessToken = `SPLIT-${Date.now()}-${Math.random().toString(36).substring(7)}`;

      // Check if party has Wai'tuMusic account
      const existingUser = party.email ? await this.findUserByEmail(party.email) : null;

      // Create notification record
      const notification = {
        splitsheetId,
        recipientEmail: party.email || `${party.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        recipientName: party.name,
        notificationType: 'sign_request' as const,
        accessToken: existingUser ? undefined : accessToken
      };

      // Send email (mock for now)
      console.log(`Sending splitsheet signing notification to ${party.name} (${notification.recipientEmail})`);

      // Store notification record
      // In production, would store in database
    } catch (error) {
      console.error('Notification sending error:', error);
      throw error;
    }
  }

  /**
   * Find user by email for auto-population
   */
  private async findUserByEmail(email: string): Promise<any | null> {
    try {
      // Mock user lookup - in production would query database
      return null;
    } catch (error) {
      console.error('User lookup error:', error);
      return null;
    }
  }

  /**
   * Grant DJ access to completed splitsheet
   */
  async grantDJAccess(djUserId: number, bookingId: number, splitsheetId: number): Promise<{
    accessCode: string;
    expiresAt: Date;
  }> {
    try {
      const accessCode = `DJ-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

      // Store DJ access record
      console.log(`Granting DJ access: User ${djUserId}, Booking ${bookingId}, Splitsheet ${splitsheetId}`);

      return {
        accessCode,
        expiresAt
      };
    } catch (error) {
      console.error('DJ access error:', error);
      throw new Error('Failed to grant DJ access');
    }
  }
}

export const oppHubISRCProcessor = OppHubISRCProcessor.getInstance();