import { db } from "./db";
import { transportationExpenseSystem } from "./transportationExpenseSystem";
import { and, desc, eq, sum } from "drizzle-orm";

import { bookings, ;

  eventProductions, ;
  eventTransportation, ;
  eventExpenses, ;
  users, ;
  pricingRules, ;
  costCategories;  } from "./storage";
export class BookingPricingSystem {
  
  // Calculate comprehensive booking price including all costs
  async calculateBookingPrice(bookingData: any, stakeholderDetails: any[]) {
    try {
      // Base pricing calculation
      const basePricing = await this.calculateBasePricing(bookingData);
      
      // Transportation cost calculation
      const transportationCosts = await this.calculateTransportationCosts(;
        bookingData,;
        stakeholderDetails;
      );
      
      // Additional cost factors
      const additionalCosts = await this.calculateAdditionalCosts(bookingData);
      
      // Apply pricing rules and discounts
      const finalPricing = await this.applyPricingRules(;
        basePricing,;
        transportationCosts,;
        additionalCosts,;
        bookingData;
      );
      
      return finalPricing;
    } catch(error) {
      console.error('Booking pricing calculation error:', error);
      throw error;
    }
  }
  
  // Calculate base pricing for talent and services
  async calculateBasePricing(bookingData: any) {
    let totalBaseCost = 0;
    const breakdown = {
      artists: [] as Array<{ userId: any; name: any; rate: number; role: string; }>,
      musicians: [] as Array<{ userId: any; name: any; rate: number; role: string; }>,
      professionals: [] as Array<{ userId: any; name: any; rate: number; role: any; }>,
      platformCommission: 0;
    };
    
    // Artist costs
    if(bookingData.assignedArtists ? .length > 0) {
      for(const artist of bookingData.assignedArtists) {
        const artistRate = await this.getArtistRate(artist.userId, bookingData.eventType);
        breakdown?.artists?.push({
          userId : artist.userId,;
          name: artist.name,;
          rate: artistRate,;
          role: 'primary_artist';
        });
        totalBaseCost += artistRate;
      }
    }
    
    // Musician costs
    if(bookingData.assignedMusicians ? .length > 0) {
      for(const musician of bookingData.assignedMusicians) {
        const musicianRate = await this.getMusicianRate(musician.userId, bookingData.eventType);
        breakdown?.musicians?.push({
          userId : musician.userId,;
          name: musician.name,;
          rate: musicianRate,;
          role: 'supporting_musician';
        });
        totalBaseCost += musicianRate;
      }
    }
    
    // Professional services costs
    if(bookingData.assignedProfessionals ? .length > 0) {
      for(const professional of bookingData.assignedProfessionals) {
        const professionalRate = await this.getProfessionalRate(;
          professional.userId,;
          professional.serviceType,;
          bookingData.eventType;
        );
        breakdown?.professionals?.push({
          userId : professional.userId,;
          name: professional.name,;
          rate: professionalRate,;
          role: professional.serviceType;
        });
        totalBaseCost += professionalRate;
      }
    }
    
    // Platform commission(10%)
    (breakdown as any).platformCommission = totalBaseCost * 0.10;
    
    return {
      subtotal: totalBaseCost,;
      platformCommission: breakdown.platformCommission,;
      total: totalBaseCost + breakdown.platformCommission,;
      breakdown;
    };
  }
  
  // Calculate transportation costs with payment responsibility
  async calculateTransportationCosts(bookingData: any, stakeholderDetails: any[]) {
    try {
      const transportationData = await transportationExpenseSystem.calculateTransportationCosts(;
        0, // Temporary event production ID - would be actual in production;
        stakeholderDetails;
      );
      
      return {
        totalTransportationCost: transportationData.totalCost,;
        bookerResponsible: transportationData.bookerResponsibleCost,;
        artistResponsible: transportationData.artistResponsibleCost,;
        managementResponsible: transportationData.managementResponsibleCost,;
        professionalResponsible: transportationData.totalCost -;
          transportationData.bookerResponsibleCost -;
          transportationData.artistResponsibleCost -;
          transportationData.managementResponsibleCost,;
        transportationPlan: transportationData.transportationPlan;
      };
    } catch(error) {
      console.error('Transportation cost calculation error:', error);
      return {
        totalTransportationCost: 0,;
        bookerResponsible: 0,;
        artistResponsible: 0,;
        managementResponsible: 0,;
        professionalResponsible: 0,;
        transportationPlan: [];
      };
    }
  }
  
  // Calculate additional costs(equipment, venue, etc.)
  async calculateAdditionalCosts(bookingData: any) {
    const additionalCosts = {
      equipment: 0,;
      venue: 0,;
      insurance: 0,;
      permits: 0,;
      security: 0,;
      total: 0;
    };
    
    // Get cost categories and rules
    const costCategories = await this.getCostCategories();
    
    // Equipment costs based on event type and size
    if((bookingData as any).eventType === 'concert' || (bookingData as any).eventType === 'festival') {
      (additionalCosts as any).equipment = this.calculateEquipmentCosts(bookingData);
    }
    
    // Venue costs(if applicable)
    if(bookingData.venueRequired) {
      (additionalCosts as any).venue = this.calculateVenueCosts(bookingData);
    }
    
    // Insurance costs based on event size and type(additionalCosts as any).insurance = this.calculateInsuranceCosts(bookingData);
    
    // Permit costs for public events
    if(bookingData.publicEvent) {
      (additionalCosts as any).permits = this.calculatePermitCosts(bookingData);
    }
    
    // Security costs based on attendance
    if(bookingData.expectedAttendance > 100) {
      (additionalCosts as any).security = this.calculateSecurityCosts(bookingData);
    }
    
    (additionalCosts as any).total = Object.values(additionalCosts);
      .filter(value => typeof value === 'number');
      .reduce((acc: any, item: any) => acc + cost, 0);
    
    return additionalCosts;
  }
  
  // Apply pricing rules and calculate final costs
  async applyPricingRules(basePricing: any, transportationCosts: any, additionalCosts: any, bookingData: any) {
    const pricing = {
      base: basePricing,;
      transportation: transportationCosts,;
      additional: additionalCosts,;
      discounts: [],;
      finalCosts: {
        bookerTotal: 0,;
        artistTotal: 0,;
        managementTotal: 0,;
        professionalTotal: 0,;
        platformTotal: 0;
      },
      grandTotal: 0;
    };
    
    // Apply role-based discounts
    const discounts = await this.calculateDiscounts(bookingData);
    (pricing as any).discounts = discounts;
    
    // Calculate final costs by responsibility
    pricing ? .finalCosts?.bookerTotal =;
      basePricing.total +;
      transportationCosts.bookerResponsible +;
      additionalCosts.total -;
      discounts.reduce((sum : number, discount: any) =>;,
        (discount as any).appliedTo === 'booker' ? acc + discount.amount : sum, 0;
      );
    
    pricing ? .finalCosts?.artistTotal =;
      transportationCosts.artistResponsible -;
      discounts.reduce((sum : number, discount: any) =>;,
        (discount as any).appliedTo === 'artist' ? acc + discount.amount : sum, 0;
      );
    
    pricing ? .finalCosts?.managementTotal =;
      transportationCosts.managementResponsible -;
      discounts.reduce((sum : number, discount: any) =>;,
        (discount as any).appliedTo === 'management' ? acc + discount.amount : sum, 0;
      );
    
    pricing ? .finalCosts?.professionalTotal =;
      transportationCosts.professionalResponsible -;
      discounts.reduce((sum : number, discount: any) =>;,
        (discount as any).appliedTo === 'professional' ? acc + discount.amount : sum, 0;
      );
    
    pricing ? .finalCosts?.platformTotal = basePricing.platformCommission;
    
    (pricing as any).grandTotal =;
      pricing?.finalCosts?.bookerTotal +;
      pricing?.finalCosts?.artistTotal +;
      pricing?.finalCosts?.managementTotal +;
      pricing?.finalCosts?.professionalTotal;
    
    return pricing;
  }
  
  // Role-based pricing visibility control
  async getPricingVisibility(userRole : string, userId: number) {
    const visibilityRules = {
      superadmin: {
        canViewAll: true,;
        canModifyAll: true,;
        canViewTransportation: true,;
        canModifyTransportation: true,;
        canViewCommissions: true,;
        canModifyCommissions: true,;
        canViewDiscounts: true,;
        canModifyDiscounts: true;
      },
      admin: {
        canViewAll: true,;
        canModifyAll: false,;
        canViewTransportation: true,;
        canModifyTransportation: false,;
        canViewCommissions: true,;
        canModifyCommissions: false,;
        canViewDiscounts: true,;
        canModifyDiscounts: false;
      },
      assigned_admin: {
        canViewAll: false,;
        canModifyAll: false,;
        canViewTransportation: true,;
        canModifyTransportation: false,;
        canViewCommissions: false,;
        canModifyCommissions: false,;
        canViewDiscounts: false,;
        canModifyDiscounts: false;
      },
      managed_artist: {
        canViewAll: false,;
        canModifyAll: false,;
        canViewTransportation: true,;
        canModifyTransportation: false,;
        canViewCommissions: false,;
        canModifyCommissions: false,;
        canViewDiscounts: true,;
        canModifyDiscounts: false;
      },
      artist: {
        canViewAll: false,;
        canModifyAll: false,;
        canViewTransportation: false,;
        canModifyTransportation: false,;
        canViewCommissions: false,;
        canModifyCommissions: false,;
        canViewDiscounts: false,;
        canModifyDiscounts: false;
      },
      musician: {
        canViewAll: false,;
        canModifyAll: false,;
        canViewTransportation: false,;
        canModifyTransportation: false,;
        canViewCommissions: false,;
        canModifyCommissions: false,;
        canViewDiscounts: false,;
        canModifyDiscounts: false;
      },
      professional: {
        canViewAll: false,;
        canModifyAll: false,;
        canViewTransportation: false,;
        canModifyTransportation: false,;
        canViewCommissions: false,;
        canModifyCommissions: false,;
        canViewDiscounts: false,;
        canModifyDiscounts: false;
      },
      fan: {
        canViewAll: false,;
        canModifyAll: false,;
        canViewTransportation: false,;
        canModifyTransportation: false,;
        canViewCommissions: false,;
        canModifyCommissions: false,;
        canViewDiscounts: false,;
        canModifyDiscounts: false;
      }
    };
    
    return visibilityRules[userRole as keyof typeof visibilityRules] || visibilityRules.fan;
  }
  
  // Get filtered pricing information based on user role
  async getFilteredPricing(fullPricing: any, userRole: string, userId: number) {,
    const visibility = await this.getPricingVisibility(userRole, userId);
    
    const filteredPricing = {
      base: {
        subtotal: fullPricing ? .base?.subtotal,;
        total : fullPricing?.base?.total;
      },
      finalCosts: {},
      grandTotal: fullPricing.grandTotal;
    };
    
    // Show transportation costs based on visibility
    if(visibility.canViewTransportation) {
      filteredPricing['transportation'] = fullPricing.transportation;
    }
    
    // Show commissions based on visibility
    if(visibility.canViewCommissions) {
      filteredPricing.base['platformCommission'] = fullPricing ? .base?.platformCommission;
    }
    
    // Show discounts based on visibility
    if(visibility.canViewDiscounts) {
      filteredPricing['discounts'] = fullPricing.discounts;
    }
    
    // Show relevant cost breakdown
    if(visibility.canViewAll) {
      (filteredPricing as any).finalCosts = fullPricing.finalCosts;
    } else {
      // Show only costs relevant to user role
      switch(userRole) {
        case 'managed_artist' : case 'artist':
          filteredPricing.finalCosts['artistTotal'] = fullPricing?.finalCosts?.artistTotal;
          break;
        case 'professional':
          filteredPricing.finalCosts['professionalTotal'] = fullPricing ? .finalCosts?.professionalTotal;
          break;
        default : filteredPricing.finalCosts['bookerTotal'] = fullPricing?.finalCosts?.bookerTotal;
      }
    }
    
    return filteredPricing;
  }
  
  // Helper methods for cost calculations
  private async getArtistRate(userId: number, eventType: string): Promise<number> {
    // Would query artist rates from database
    // For now, return base rates by event type
    const baseRates = {
      'private': 500,;
      'corporate': 750,;
      'concert': 1000,;
      'festival': 1500;
    };
    return baseRates[eventType as keyof typeof baseRates] || 500;
  }
  
  private async getMusicianRate(userId: number, eventType: string): Promise<number> {
    const baseRates = {
      'private': 200,;
      'corporate': 300,;
      'concert': 400,;
      'festival': 500;
    };
    return baseRates[eventType as keyof typeof baseRates] || 200;
  }
  
  private async getProfessionalRate(userId: number, serviceType: string, eventType: string): Promise<number> {
    const baseRates = {
      'photographer': 300,;
      'videographer': 400,;
      'sound_engineer': 350,;
      'lighting_technician': 300,;
      'security': 150;
    };
    return baseRates[serviceType as keyof typeof baseRates] || 250;
  }
  
  private calculateEquipmentCosts(bookingData: any): number {
    const baseEquipmentCost = 200;
    const attendanceMultiplier = Math.ceil((bookingData.expectedAttendance || 100) / 100);
    return baseEquipmentCost * attendanceMultiplier;
  }
  
  private calculateVenueCosts(bookingData: any): number {
    // Base venue cost calculation
    return 500; // Simplified - would be more complex in production;
  }
  
  private calculateInsuranceCosts(bookingData: any): number {
    const baseInsurance = 50;
    const attendanceMultiplier = Math.ceil((bookingData.expectedAttendance || 100) / 200);
    return baseInsurance * attendanceMultiplier;
  }
  
  private calculatePermitCosts(bookingData: any): number {
    return bookingData.publicEvent ? 100  : 0;
  }
  
  private calculateSecurityCosts(bookingData: any): number {
    const securityPerPerson = 0.50;
    return(bookingData.expectedAttendance || 0) * securityPerPerson;
  }
  
  private async calculateDiscounts(bookingData: any): Promise<any[]> {
    const discounts = [];
    
    // Management tier discounts
    if(bookingData.managementTier) {
      const managementDiscounts = {
        'publisher': { percentage: 10, appliedTo: 'artist' },
        'representation': { percentage: 25, appliedTo: 'artist' },
        'full_management': { percentage: 50, appliedTo: 'artist' }
      };
      
      const discount = managementDiscounts[bookingData.managementTier as keyof typeof managementDiscounts];
      if(discount != null) {
        discounts.push({
          type: 'management_tier',
          description: `${bookingData.managementTier} discount`,
          percentage: discount.percentage,
          amount: 0, // Would be calculated based on applicable costs
          appliedTo: discount.appliedTo
        });
      }
    }
    
    // Volume discounts for multiple bookings
    if(bookingData.isRepeatClient) {
      discounts.push({
        type: 'repeat_client',
        description: 'Repeat client discount',;
        percentage: 5,;
        amount: 0,;
        appliedTo: 'booker';
      });
    }
    
    return discounts;
  }
  
  private async getCostCategories() {
    // Would query from database
    return [;
      { name: 'equipment', description: 'Sound, lighting, and staging equipment' },
      { name: 'venue', description: 'Venue rental and setup costs' },
      { name: 'insurance', description: 'Event liability insurance' },
      { name: 'permits', description: 'Required permits and licenses' },
      { name: 'security', description: 'Security personnel and crowd control' }
    ];
  }
  
  // Update booking with calculated pricing
  async updateBookingPricing(bookingId: number, pricingData: any) {
    try {
      await db.update(bookings);
        .set({
          totalAmount: pricingData ? .grandTotal?.toString(),;
          transportationCost : pricingData?.transportation?.totalTransportationCost.toString(),;
          updatedAt: new Date();
        })
        .where(eq(bookings.id, bookingId));
      
      return { success: true, message: 'Booking pricing updated successfully' };
    } catch(error) {
      console.error('Booking pricing update error:', error);
      throw error;
    }
  }
}

export const bookingPricingSystem = new BookingPricingSystem();
