import { storage } from "./storage";

// ISRC Format: DM-A0D-YY-NN-XXX
// DM = Dominica country code
// A0D = Wai'tuMusic IFPI identifier  
// YY = Current year (auto-filled)
// NN = Artist/Musician ID (00=Lí-Lí Octave, 04=Princess Trinidad, etc.)
// XXX = Sequential song number for that artist

interface ISRCComponents {
  country: string;
  registrant: string;
  year: string;
  artistId: string;
  songNumber: string;
}

// Predefined artist IDs for managed artists
const MANAGED_ARTIST_IDS: Record<string, string> = {
  'Lí-Lí Octave': '00',
  'LI-LI OCTAVE': '00',
  'LIANNE MARILDA MARISA LETANG': '00',
  'JCro': '01',
  'JCRO': '01',
  'Karlvin Deravariere': '01',
  'Janet Azzouz': '02',
  'JANET AZZOUZ': '02',
  'Princess Trinidad': '04',
  'PRINCESS TRINIDAD': '04'
};

export class ISRCGenerator {
  
  /**
   * Generate ISRC code for a song submission
   */
  static async generateISRC(
    artistName: string, 
    songTitle: string, 
    isOriginal: boolean = true,
    adminAssignedId?: string
  ): Promise<string> {
    const currentYear = new Date().getFullYear().toString().slice(-2);
    
    // Get or assign artist ID (NN)
    let artistId = adminAssignedId || MANAGED_ARTIST_IDS[artistName];
    
    if (!artistId) {
      // Check if this is a managed artist/musician and assign next sequential ID
      artistId = await this.getNextSequentialArtistId();
    }
    
    // Get next song number for this artist (XXX)
    const songNumber = await this.getNextSongNumber(artistId, currentYear);
    
    // Determine if this is a remix (even numbers) or original (odd numbers)
    const adjustedSongNumber = this.adjustSongNumberForType(songNumber, isOriginal);
    
    const isrcComponents: ISRCComponents = {
      country: 'DM',
      registrant: 'A0D',
      year: currentYear,
      artistId: artistId.toString().padStart(2, '0'),
      songNumber: adjustedSongNumber.toString().padStart(3, '0')
    };
    
    return `${isrcComponents.country}-${isrcComponents.registrant}-${isrcComponents.year}-${isrcComponents.artistId}-${isrcComponents.songNumber}`;
  }
  
  /**
   * Get next sequential artist ID for new managed artists/musicians
   */
  private static async getNextSequentialArtistId(): Promise<string> {
    try {
      // Get all existing ISRC codes to find highest NN value
      // Get the highest NN value from actual database usage
      // This accounts for historical artists and superadmin-assigned codes
      const maxAssignedId = await storage.getHighestArtistIdFromISRC();
      let maxId = maxAssignedId || 0;
      
      // Also check predefined IDs to ensure we don't conflict
      Object.values(MANAGED_ARTIST_IDS).forEach(id => {
        const numId = parseInt(id);
        if (numId > maxId) maxId = numId;
      });
      
      return (maxId + 1).toString().padStart(2, '0');
    } catch (error) {
      console.error('Error getting next sequential artist ID:', error);
      return '99'; // Fallback ID
    }
  }
  
  /**
   * Get next song number for artist in current year
   */
  private static async getNextSongNumber(artistId: string, year: string): Promise<number> {
    try {
      const existingCodes = await storage.getIsrcCodesByArtistAndYear(parseInt(artistId), year);
      let maxSongNumber = 0;
      
      existingCodes.forEach((code: any) => {
        const parts = code.isrcCode.split('-');
        if (parts.length >= 5) {
          const songNum = parseInt(parts[4]);
          if (songNum > maxSongNumber) maxSongNumber = songNum;
        }
      });
      
      return maxSongNumber + 1;
    } catch (error) {
      console.error('Error getting next song number:', error);
      return 1;
    }
  }
  
  /**
   * Adjust song number for original (odd) vs remix (even)
   * Original releases get odd numbers: 001, 003, 005...
   * Remixes get even numbers: 002, 004, 006...
   */
  private static adjustSongNumberForType(baseNumber: number, isOriginal: boolean): number {
    if (isOriginal) {
      // Ensure odd number for originals
      return baseNumber % 2 === 0 ? baseNumber + 1 : baseNumber;
    } else {
      // Ensure even number for remixes
      return baseNumber % 2 === 1 ? baseNumber + 1 : baseNumber;
    }
  }
  
  /**
   * Validate ISRC format - strict character count validation
   * DM-A0D-YY-NN-XXX must match exact number of characters (ignoring hyphens)
   * Total: 11 characters without hyphens (DM=2, A0D=3, YY=2, NN=2, XXX=3)
   */
  static validateISRCFormat(isrc: string): boolean {
    // Remove hyphens and check exact character count first
    const cleanISRC = isrc.replace(/-/g, '');
    if (cleanISRC.length !== 11) return false;
    
    // Then check the full pattern including hyphens
    const pattern = /^DM-A0D-\d{2}-\d{2}-\d{3}$/;
    return pattern.test(isrc);
  }

  /**
   * Enhanced validation with detailed error messaging
   */
  static validateISRCWithDetails(isrc: string): { isValid: boolean; error?: string; characterCount: number } {
    const cleanISRC = isrc.replace(/-/g, '');
    const characterCount = cleanISRC.length;
    
    // Check exact character count first
    if (characterCount !== 11) {
      return {
        isValid: false,
        error: characterCount < 11 ? 
          `ISRC too short: ${characterCount}/11 characters (missing ${11 - characterCount})` :
          `ISRC too long: ${characterCount}/11 characters (excess ${characterCount - 11})`,
        characterCount
      };
    }
    
    // Check full format pattern
    const pattern = /^DM-A0D-\d{2}-\d{2}-\d{3}$/;
    if (!pattern.test(isrc)) {
      return {
        isValid: false,
        error: "ISRC format must be: DM-A0D-YY-NN-XXX",
        characterCount
      };
    }
    
    return { isValid: true, characterCount };
  }

  /**
   * Check if IFPI.org has updated format specifications
   * This would be called by OppHub monitoring system
   */
  static async checkIFPIFormatUpdates(): Promise<{ allowsNewFormat: boolean; newPattern?: string }> {
    // This would be implemented with OppHub monitoring of ifpi.org
    // For now, return the current format requirement
    return {
      allowsNewFormat: false,
      newPattern: undefined
    };
  }

  /**
   * Parse ISRC components
   */
  static parseISRC(isrc: string): ISRCComponents | null {
    const parts = isrc.split('-');
    if (parts.length !== 5) return null;
    
    return {
      country: parts[0],
      registrant: parts[1],
      year: parts[2],
      artistId: parts[3],
      songNumber: parts[4]
    };
  }
  
  /**
   * Check if song is original or remix based on ISRC
   */
  static isOriginalRelease(isrc: string): boolean {
    const components = this.parseISRC(isrc);
    if (!components) return true;
    
    const songNumber = parseInt(components.songNumber);
    return songNumber % 2 === 1; // Odd numbers are originals
  }
  
  /**
   * Get artist name from NN identifier
   */
  static getArtistNameFromId(artistId: string): string | null {
    const paddedId = artistId.padStart(2, '0');
    for (const [name, id] of Object.entries(MANAGED_ARTIST_IDS)) {
      if (id === paddedId) return name;
    }
    return null;
  }
}

export default ISRCGenerator;