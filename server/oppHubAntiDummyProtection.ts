/**
 * OppHub Anti-Dummy Data Protection System
 * 
 * This system ensures that OppHub NEVER uses dummy, placeholder, mock, or synthetic data.
 * It provides comprehensive validation, monitoring, and enforcement of authentic data only.
 * 
 * CRITICAL REQUIREMENT: All opportunities must be verified, authentic, and from real sources.
 */

export class OppHubAntiDummyProtection {
  
  /**
   * Validates that an opportunity is authentic and not dummy data
   */
  public static validateAuthenticOpportunity(opportunity: any): boolean {
    // Check for common dummy data patterns
    const dummyPatterns = [
      'example', 'sample', 'test', 'dummy', 'mock', 'placeholder',
      'lorem ipsum', 'coming soon', 'tbd', 'to be determined',
      'fake', 'synthetic', 'generated', 'demo', 'temp'
    ];
    
    const titleLower = opportunity.title?.toLowerCase() || '';
    const descriptionLower = opportunity.description?.toLowerCase() || '';
    const organizerLower = opportunity.organizerName?.toLowerCase() || '';
    
    // Reject if contains dummy patterns
    for (const pattern of dummyPatterns) {
      if (titleLower.includes(pattern) || 
          descriptionLower.includes(pattern) || 
          organizerLower.includes(pattern)) {
        console.error(`🚫 REJECTED: Opportunity contains dummy pattern "${pattern}"`);
        return false;
      }
    }
    
    // Reject if organizer is "Unknown Organizer" or similar
    if (organizerLower.includes('unknown') || organizerLower === '' || !opportunity.organizerName) {
      console.error(`🚫 REJECTED: Unknown or missing organizer information`);
      return false;
    }
    
    // Reject if missing critical authentic data
    if (!opportunity.url || !opportunity.contactEmail || !opportunity.deadline) {
      console.error(`🚫 REJECTED: Missing critical authentic data fields`);
      return false;
    }
    
    // Reject if URL doesn't look authentic
    if (!this.isAuthenticURL(opportunity.url)) {
      console.error(`🚫 REJECTED: URL does not appear authentic: ${opportunity.url}`);
      return false;
    }
    
    console.log(`✅ VALIDATED: Opportunity "${opportunity.title}" is authentic`);
    return true;
  }
  
  /**
   * Validates that a URL is from an authentic source
   */
  private static isAuthenticURL(url: string): boolean {
    if (!url || typeof url !== 'string') return false;
    
    const authenticDomains = [
      'ascap.com', 'grammy.com', 'grammymuseum.org', 'latingrammyculturalfoundation.org',
      'sxsw.com', 'summerfest.com', 'tramlines.org.uk', 'bmi.com', 'sesac.com',
      'artsfund.org', 'nea.gov', 'canadacouncil.ca', 'artscouncil.org.uk',
      'musicfestival.com', 'bandsintown.com', 'songfinch.com', 'sonicbids.com'
    ];
    
    const urlLower = url.toLowerCase();
    return authenticDomains.some(domain => urlLower.includes(domain));
  }
  
  /**
   * Converts text amounts to numeric values for database storage
   */
  public static convertAmountToNumeric(amount: string | number): string {
    if (typeof amount === 'number') {
      return amount.toString();
    }
    
    if (!amount || typeof amount !== 'string') {
      return '0';
    }
    
    const lowerAmount = amount.toLowerCase().trim();
    
    // Handle common text patterns and convert to numeric
    if (lowerAmount.includes('varies') || lowerAmount.includes('variable')) {
      return '0'; // Use 0 for variable amounts
    }
    
    if (lowerAmount.includes('exposure') || lowerAmount.includes('networking')) {
      return '0'; // Exposure opportunities have no monetary value
    }
    
    // Extract numbers from text like "$400,000", "up to $5,000", "£500"
    const numberMatch = amount.match(/[\d,]+\.?\d*/);
    if (numberMatch) {
      const cleanNumber = numberMatch[0].replace(/,/g, '');
      return cleanNumber;
    }
    
    // Handle specific known patterns
    if (lowerAmount.includes('studio credits') || lowerAmount.includes('paid_slot')) {
      return '500'; // Estimate for studio credits/paid slots
    }
    
    if (lowerAmount.includes('pool') && lowerAmount.includes('400')) {
      return '5000'; // Average grant amount from total pool
    }
    
    return '0'; // Default for unrecognized patterns
  }
  
  /**
   * Validates that opportunity deadline has not passed
   */
  public static isDeadlineValid(deadline: Date): boolean {
    const currentDate = new Date();
    return deadline > currentDate;
  }
  
  /**
   * Enhanced organizer information validation
   */
  public static validateOrganizerInformation(organizer: any): boolean {
    // Must have comprehensive organizer details
    const requiredFields = ['organizerName', 'organizerDescription', 'contactEmail'];
    
    for (const field of requiredFields) {
      if (!organizer[field] || organizer[field].toLowerCase().includes('unknown')) {
        console.error(`🚫 REJECTED: Missing or invalid organizer field: ${field}`);
        return false;
      }
    }
    
    // Organizer name must be substantial (not just initials or abbreviations)
    if (organizer.organizerName.length < 5) {
      console.error(`🚫 REJECTED: Organizer name too short: ${organizer.organizerName}`);
      return false;
    }
    
    // Description must be informative
    if (organizer.organizerDescription.length < 20) {
      console.error(`🚫 REJECTED: Organizer description too brief: ${organizer.organizerDescription}`);
      return false;
    }
    
    return true;
  }
  
  /**
   * Anti-dummy data monitoring system
   */
  public static monitorForDummyData(opportunities: any[]): void {
    let dummyCount = 0;
    let authenticCount = 0;
    
    for (const opp of opportunities) {
      if (this.validateAuthenticOpportunity(opp)) {
        authenticCount++;
      } else {
        dummyCount++;
        console.error(`🚨 DUMMY DATA DETECTED: ${opp.title || 'Unknown Title'}`);
      }
    }
    
    console.log(`📊 ANTI-DUMMY MONITORING: ${authenticCount} authentic opportunities, ${dummyCount} dummy opportunities rejected`);
    
    if (dummyCount > 0) {
      console.error(`🚨 CRITICAL WARNING: ${dummyCount} dummy opportunities detected and rejected!`);
    }
  }
  
  /**
   * Teaching system to prevent future dummy data
   */
  public static teachAntiDummyPrinciples(): string[] {
    return [
      "🛡️ NEVER create placeholder or dummy data - always use authentic sources",
      "📋 ALWAYS validate organizer information is complete and real",
      "🔍 ALWAYS check URLs are from verified industry sources",
      "⏰ ALWAYS filter out opportunities with passed deadlines",
      "🔢 ALWAYS convert text amounts to numeric values for database",
      "📞 ALWAYS include comprehensive contact information",
      "🎯 ALWAYS verify opportunities are relevant to music industry",
      "🚫 REJECT any opportunity with 'Unknown Organizer' or similar",
      "✅ VALIDATE all data before database storage",
      "🔄 MONITOR continuously for dummy data patterns"
    ];
  }
}