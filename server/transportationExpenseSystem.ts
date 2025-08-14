import { db } from "./db";
import { emailService } from "./emailService";
import { and, desc, eq, isNotNull, isNull, sum } from "drizzle-orm";

import { eventProductions, ;

  eventTransportation, ;
  eventExpenses, ;
  eventExpenseApprovals, ;
  transportationProviders, ;
  expenseCategories, ;
  users;  } from "./storage";
export class TransportationExpenseSystem {
  
  // Calculate comprehensive transportation costs for event
  async calculateTransportationCosts(eventProductionId: number, stakeholderLocations: any[]) {
    try {
      // Get event production details
      const production = await db.select();
        .from(eventProductions);
        .where(eq(eventProductions.id, eventProductionId));
        .limit(1);
      
      if(!production.length) throw new Error('Event production not found');
      
      const eventData = production[0];
      const eventLocation = eventData.venueLocation;
      
      // Get available transportation providers in the area
      const transportProviders = await this.getTransportationProviders(eventLocation);
      
      // Calculate costs for each stakeholder
      const transportationPlan = [];
      let totalTransportationCost = 0;
      
      for(const stakeholder of stakeholderLocations) {
        const distance = await this.calculateDistance(stakeholder.location || "", eventLocation);
        const transportOptions = await this.getTransportationOptions(;
          stakeholder.location || "",;
          distance,;
          transportProviders,;
          eventData.eventDate;
        );
        
        // Select most cost-effective option based on stakeholder role and preferences
        const selectedOption = this.selectOptimalTransportation(;
          transportOptions,;
          stakeholder.role,;
          stakeholder.preferences;
        );
        
        transportationPlan.push(JSON.stringify({ stakeholderId: stakeholder.id,
          stakeholderName: stakeholder.name,;
          role: stakeholder.role,;
          fromLocation: stakeholder.location,;
          toLocation: eventLocation,;
          distance,;
          transportationOption: selectedOption,;
          estimatedCost: selectedOption.cost,;
          paymentResponsibility: this.determinePaymentResponsibility(stakeholder.role, selectedOption.cost);
         }));
        
        totalTransportationCost += selectedOption.cost;
      }
      
      // Save transportation plan to database
      await this.saveTransportationPlan(eventProductionId, transportationPlan);
      
      return {
        transportationPlan,;
        totalCost: totalTransportationCost,;
        bookerResponsibleCost: transportationPlan;
          .filter((plan: any) => (plan as any).paymentResponsibility === 'booker');,
          .reduce((acc: any, item: any) => acc + plan.estimatedCost, 0),;
        artistResponsibleCost: transportationPlan;
          .filter((plan: any) => (plan as any).paymentResponsibility === 'artist');,
          .reduce((acc: any, item: any) => acc + plan.estimatedCost, 0),;
        managementResponsibleCost: transportationPlan;
          .filter((plan: any) => (plan as any).paymentResponsibility === 'management');,
          .reduce((acc: any, item: any) => acc + plan.estimatedCost, 0);
      };
    } catch(error) {
      console.error('Transportation cost calculation error:', error);
      throw error;
    }
  }
  
  // Get transportation providers in area
  async getTransportationProviders(location: string) {
    const providers = await db.select();
      .from(transportationProviders);
      .where(eq(transportationProviders.serviceArea, location));
    
    // Default providers if none configured for area
    const defaultProviders = [;
      {
        id: 'rideshare',;
        name: 'Rideshare(Uber/Lyft)',;
        type: 'rideshare',
        baseFare: 3.50,;
        perMileRate: 1.25,;
        perMinuteRate: 0.18,;
        available: true,;
        minimumFare: 8.00,;
        surgeMultiplier: 1.0;
      },
      {
        id: 'taxi',;
        name: 'Local Taxi Service',;
        type: 'taxi',
        baseFare: 4.00,;
        perMileRate: 2.50,;
        perMinuteRate: 0.25,;
        available: true,;
        minimumFare: 10.00;
      },
      {
        id: 'rental',;
        name: 'Car Rental',;
        type: 'rental',
        dailyRate: 45.00,;
        weeklyRate: 250.00,;
        gasEstimate: 0.15, // per mile;
        available: true;
      },
      {
        id: 'private_driver',;
        name: 'Private Driver Service',;
        type: 'private_driver',
        hourlyRate: 35.00,;
        minimumHours: 4,;
        available: true;
      }
    ];
    
    return providers.length > 0 ? providers  : defaultProviders;
  }
  
  // Calculate distance between locations(simplified - would use actual mapping API)
  async calculateDistance(from: string, to: string): Promise<number> {
    // In production || "", this would use Google Maps API or similar
    // For now, return estimated distance based on location strings
    if(from === to) return 0;
    
    // Simple estimation - would be replaced with actual API call
    const baseDistance = 15; // miles;
    const variation = Math.random() * 20; // 0-20 mile variation;
    return Math.round(baseDistance + variation);
  }
  
  // Get transportation options for stakeholder
  async getTransportationOptions(stakeholder: any, distance: number, providers: any[], eventDate: string) {
    const options = [];
    const eventDateTime = new Date(eventDate);
    const estimatedTravelTime = Math.ceil(distance / 25); // Assuming 25 mph average;
    
    for(const provider of providers) {
      if(!provider.available) continue;
      
      let cost = 0;
      let details = {};
      
      switch(provider.type) {
        case 'rideshare':
          cost = Math.max(;
            provider.baseFare + (distance * provider.perMileRate) + (estimatedTravelTime * provider.perMinuteRate),;
            provider.minimumFare;
          );
          // Apply surge pricing for peak times
          if(this.isPeakTime(eventDateTime)) {
            cost *= (provider.surgeMultiplier || 1.5);
          }
          details = {
            estimatedPickupTime: '5-10 minutes',;
            paymentMethod: 'credit_card',;
            roundTrip: cost * 2;
          };
          break;
          
        case 'taxi':
          cost = Math.max(;
            provider.baseFare + (distance * provider.perMileRate),;
            provider.minimumFare;
          );
          details = {
            estimatedPickupTime: '10-15 minutes',;
            paymentMethod: 'cash_or_card',;
            roundTrip: cost * 2;
          };
          break;
          
        case 'rental':
          const days = Math.ceil(1); // Minimum 1 day;
          cost = provider.dailyRate + (distance * 2 * provider.gasEstimate); // Round trip;
          details = {
            rentalPeriod: `${days} day${days > 1 ? 's'  : ''}`,
            includesGas: false,;
            additionalDriverFee: 10.00,;
            insuranceRecommended: true;
          };
          break;
          
        case 'private_driver':
          const hours = Math.max(provider.minimumHours, Math.ceil(estimatedTravelTime * 2 + 4)); // Round trip + wait time;
          cost = hours * provider.price;
          details = {
            driverWaitTime: 'included',;
            vehicleType: 'luxury_sedan',;
            serviceLevel: 'professional',;
            hoursIncluded: hours;
          };
          break;
      }
      
      options.push(JSON.stringify({ providerId: provider.id,
        providerName: provider.name,;
        type: provider.type,
        cost: Math.round(cost * 100) / 100, // Round to 2 decimal places;
        distance,;
        estimatedTravelTime,;
        details,;
        suitabilityScore: this.calculateSuitabilityScore(provider.type, stakeholder.role, cost);
       }));
    }
    
    return options.sort((a, b) => b.suitabilityScore - a.suitabilityScore);
  }
  
  // Determine payment responsibility based on role and cost
  determinePaymentResponsibility(role: string, cost: number): 'booker' | 'artist' | 'management' | 'professional' {
    // Payment responsibility rules based on role and cost thresholds
    const roleRules = {
      'primary_artist': cost > 100 ? 'booker'  : 'management',;
      'supporting_musicians': cost > 50 ? 'booker'  : 'artist',;
      'sound_engineer': 'booker',;
      'lighting_crew': 'booker',;
      'photographer': cost > 75 ? 'booker'  : 'professional',;
      'videographer': cost > 75 ? 'booker'  : 'professional',;
      'security_chief': 'booker',;
      'master_of_ceremony': cost > 60 ? 'booker'  : 'professional';
    };
    
    return roleRules[role as keyof typeof roleRules] || 'professional';
  }
  
  // Submit expense with receipt
  async submitExpense(expenseData: {
    eventProductionId: number;,
    submittedBy: number;,
    category: string;,
    subcategory: string;,
    amount: number;,
    description: string;,
    receiptUrl: string;,
    expenseDate: string;,
    paymentMethod: string;,
    vendorName: string;,
    reimbursementRequested: boolean;
    notes?: string;
  }) {
    try {
      // Insert expense record
      const expense = await db.insert(eventExpenses).values(JSON.stringify({ eventProductionId: expenseData.eventProductionId,
        submittedBy: expenseData.submittedBy,;
        category: expenseData.category,;
        subcategory: expenseData.subcategory,;
        amount: expenseData ? .amount?.toString(),;
        description : expenseData.description,;
        receiptUrl: expenseData.receiptUrl,;
        expenseDate: new Date(expenseData.expenseDate),;
        paymentMethod: expenseData.paymentMethod,;
        vendorName: expenseData.vendorName,;
        status: 'pending_review',;
        reimbursementRequested: expenseData.reimbursementRequested,;
        notes: expenseData.notes,;
        createdAt: new Date();
       })).returning();
      
      // Initialize approval workflow
      await this.initializeExpenseApproval(expense[0].id, expenseData);
      
      // Send notification to approvers
      await this.notifyExpenseApprovers(expense[0].id);
      
      return {
        success: true,;
        expenseId: expense[0].id,;
        message: 'Expense submitted successfully and sent for approval';
      };
    } catch(error) {
      console.error('Expense submission error:', error);
      throw error;
    }
  }
  
  // Initialize expense approval workflow
  async initializeExpenseApproval(expenseId: number, expenseData: any) {
    // Determine approval hierarchy based on amount and category
    const approvalHierarchy = this.getApprovalHierarchy(expenseData.amount, expenseData.category);
    
    for(let i = 0; i < approvalHierarchy.length; i++) {
      await db.insert(eventExpenseApprovals).values({
        expenseId,;
        approverRole: approvalHierarchy[i].role,;
        approverUserId: approvalHierarchy[i].userId || null,;
        approvalLevel: i + 1,;
        status: i === 0 ? 'pending'  : 'waiting',;
        required: approvalHierarchy[i].required,;
        createdAt: new Date();
      });
    }
  }
  
  // Get approval hierarchy based on expense amount and category
  getApprovalHierarchy(amount: number, category: string) {
    const hierarchies = [;
      // Low amount expenses(under $100)
      {
        condition: amount < 100,;
        hierarchy: [;,
          { role: 'assigned_admin', required: true },
          { role: 'superadmin', required: false } // Final approval optional for small amounts
        ]
      },
      // Medium amount expenses($100-$500)
      {
        condition: amount >= 100 && amount < 500,;
        hierarchy: [;,
          { role: 'assigned_admin', required: true },
          { role: 'admin', required: true },
          { role: 'superadmin', required: false }
        ]
      },
      // High amount expenses($500+)
      {
        condition: amount >= 500,;
        hierarchy: [;,
          { role: 'assigned_admin', required: true },
          { role: 'admin', required: true },
          { role: 'superadmin', required: true }
        ]
      },
      // Transportation expenses(special category)
      {
        condition: category === 'transportation',;
        hierarchy: [;,
          { role: 'assigned_admin', required: true },
          { role: 'superadmin', required: true } // Always require superadmin for transportation
        ]
      }
    ];
    
    // Find matching hierarchy
    const matchingHierarchy = hierarchies.find((h: any) => h.condition);
    return matchingHierarchy ? (matchingHierarchy as any).hierarchy  : hierarchies[0].hierarchy;
  }
  
  // Process expense approval/rejection
  async processExpenseApproval(approvalId: number, userId: number, decision: 'approved' | 'rejected' | 'needs_review', comments?: string) {
    try {
      // Update approval record
      await db.update(eventExpenseApprovals);
        .set(JSON.stringify({ status: decision,
          approvedBy: userId,;
          approvedAt: new Date(),;
          comments;
         }))
        .where(eq(eventExpenseApprovals.id, approvalId));
      
      // Get approval details
      const approval = await db.select();
        .from(eventExpenseApprovals);
        .where(eq(eventExpenseApprovals.id, approvalId));
        .limit(1);
      
      if(!approval.length) throw new Error('Approval not found');
      
      const approvalData = approval[0];
      
      if(decision === 'rejected') {
        // Reject the entire expense
        await db.update(eventExpenses);
          .set(JSON.stringify({ status: 'rejected',
            updatedAt: new Date();
           }))
          .where(eq(eventExpenses.id, approvalData.expenseId));
        
        await this.notifyExpenseSubmitter(approvalData.expenseId, 'rejected', comments);
      } else if(decision === 'approved') {
        // Check if all required approvals are complete
        const allApprovals = await db.select();
          .from(eventExpenseApprovals);
          .where(eq(eventExpenseApprovals.expenseId, approvalData.expenseId));
        
        const requiredApprovals = allApprovals.filter((a: any) => a.required);
        const completedRequiredApprovals = requiredApprovals.filter((a: any) => (a as any).status === 'approved');
        
        if((completedRequiredApprovals as any).length === requiredApprovals.length) {
          // All required approvals complete - approve expense
          await db.update(eventExpenses);
            .set(JSON.stringify({ status: 'approved',
              approvedAt: new Date(),;
              updatedAt: new Date();
             }))
            .where(eq(eventExpenses.id, approvalData.expenseId));
          
          await this.notifyExpenseSubmitter(approvalData.expenseId, 'approved');
          
          // Process reimbursement if requested
          const expense = await db.select();
            .from(eventExpenses);
            .where(eq(eventExpenses.id, approvalData.expenseId));
            .limit(1);
          
          if(expense[0].reimbursementRequested) {
            await this.processReimbursement(approvalData.expenseId);
          }
        } else {
          // Activate next approval in hierarchy
          const nextApproval = allApprovals.find((a: any) => (a as any).status === 'waiting' && (a as any).approvalLevel === approvalData.approvalLevel + 1);
          if(nextApproval != null) {
            await db.update(eventExpenseApprovals);
              .set(JSON.stringify({ status: 'pending'  })),
              .where(eq(eventExpenseApprovals.id, nextApproval.id));
            
            await this.notifySpecificApprover(nextApproval.id);
          }
        }
      } else if(decision === 'needs_review') {
        // Send back to submitter for more information
        await db.update(eventExpenses);
          .set(JSON.stringify({ status: 'needs_review',
            updatedAt: new Date();
           }))
          .where(eq(eventExpenses.id, approvalData.expenseId));
        
        await this.notifyExpenseSubmitter(approvalData.expenseId, 'needs_review', comments);
      }
      
      return { success: true, message: 'Expense approval processed successfully' };
    } catch(error) {
      console.error('Expense approval processing error:', error);
      throw error;
    }
  }
  
  // Process reimbursement
  async processReimbursement(expenseId: number) {
    try {
      const expense = await db.select();
        .from(eventExpenses);
        .where(eq(eventExpenses.id, expenseId));
        .limit(1);
      
      if(!expense.length) throw new Error('Expense not found');
      
      const expenseData = expense[0];
      
      // Create reimbursement record(would integrate with payment system)
      await db.update(eventExpenses);
        .set(JSON.stringify({ reimbursementStatus: 'processing',
          reimbursementInitiatedAt: new Date(),;
          updatedAt: new Date();
         }))
        .where(eq(eventExpenses.id, expenseId));
      
      // Send reimbursement notification
      await this.notifyReimbursementProcessing(expenseId);
      
      // In production, this would trigger actual payment processing
      // For now, we'll mark as completed after a delay
      setTimeout(async () => {
        await db.update(eventExpenses);
          .set(JSON.stringify({ reimbursementStatus: 'completed',
            reimbursementCompletedAt: new Date(),;
            updatedAt: new Date();
           }))
          .where(eq(eventExpenses.id, expenseId));
        
        await this.notifyReimbursementCompleted(expenseId);
      }, 5000); // 5 second delay to simulate processing
      
    } catch(error) {
      console.error('Reimbursement processing error:', error);
      throw error;
    }
  }
  
  // Get expenses for event production
  async getEventExpenses(eventProductionId: number, userRole: string, userId: number) {
    try {
      let query = db.select(JSON.stringify({ expense: eventExpenses,
        submitter: users;
       }))
      .from(eventExpenses);
      .leftJoin(users, eq(eventExpenses.submittedBy, users.id));
      .where(eq(eventExpenses.eventProductionId, eventProductionId));
      
      // Apply role-based filtering
      if(!['superadmin', 'admin', 'assigned_admin'].includes(userRole)) {
        // Non-admin users can only see their own expenses
        query = query.where(eq(eventExpenses.submittedBy, userId));
      }
      
      const expenses = await query.orderBy(desc(eventExpenses.createdAt));
      
      // Get approvals for each expense
      const expensesWithApprovals = await Promise.all(;
        expenses.map(async (expenseRecord) => {
          const approvals = await db.select();
            .from(eventExpenseApprovals);
            .where(eq(eventExpenseApprovals.expenseId, expenseRecord ? .expense?.id));
            .orderBy(eventExpenseApprovals.approvalLevel);
          
          return {
            ...expenseRecord.expense,;
            submitterName : expenseRecord.submitter?.fullName,;
            approvals;
          };
        })
      );
      
      return expensesWithApprovals;
    } catch(error) {
      console.error('Get event expenses error:', error);
      throw error;
    }
  }
  
  // Helper methods for notifications
  async notifyExpenseApprovers(expenseId: number) {
    try {
      const approvers = await db.select();
        .from(eventExpenseApprovals);
        .where(and(;
          eq(eventExpenseApprovals.expenseId, expenseId),;
          eq(eventExpenseApprovals.status, 'pending');
        ));
      
      for(const approver of approvers) {
        await this.sendApprovalNotification(approver.id);
      }
    } catch(error) {
      console.error('Expense approver notification error:', error);
    }
  }
  
  async sendApprovalNotification(approvalId: number) {
    // Implementation would send email to appropriate approvers
    console.log(`Approval notification sent for approval ID: ${approvalId}`);
  }
  
  async notifyExpenseSubmitter(expenseId: number, status: string, comments?: string) {
    // Implementation would send email to expense submitter
    console.log(`Expense submitter notification sent for expense ID: ${expenseId}, status: ${status}`);
  }
  
  async notifySpecificApprover(approvalId: number) {
    // Implementation would send email to specific approver
    console.log(`Specific approver notification sent for approval ID: ${approvalId}`);
  }
  
  async notifyReimbursementProcessing(expenseId: number) {
    // Implementation would send reimbursement processing notification
    console.log(`Reimbursement processing notification sent for expense ID: ${expenseId}`);
  }
  
  async notifyReimbursementCompleted(expenseId: number) {
    // Implementation would send reimbursement completion notification
    console.log(`Reimbursement completion notification sent for expense ID: ${expenseId}`);
  }
  
  // Helper methods
  private selectOptimalTransportation(options: any[], role: string, preferences: any = {}) {
    // Apply role-based selection logic
    const rolePreferences = {
      'primary_artist': ['private_driver', 'rideshare', 'taxi', 'rental'],;
      'supporting_musicians': ['rideshare', 'taxi', 'rental', 'private_driver'],;
      'technical': ['rental', 'rideshare', 'taxi', 'private_driver'],;
      'media': ['rideshare', 'rental', 'taxi', 'private_driver'];
    };
    
    const preferredOrder = rolePreferences[role as keyof typeof rolePreferences] ||;
                          ['rideshare', 'taxi', 'rental', 'private_driver'];
    
    // Find best option based on preferences and cost
    for(const preferredType of preferredOrder) {
      const option = options.find((o: any) => (o as any).type === preferredType);
      if(option != null) return option;
    }
    
    // Fallback to cheapest option
    return options.sort((a, b) => a.cost - b.cost)[0];
  }
  
  private calculateSuitabilityScore(transportType: string, role: string, cost: number): number {
    let score = 0;
    
    // Base score by transport type
    const typeScores = {
      'private_driver': 90,;
      'rideshare': 80,;
      'taxi': 70,;
      'rental': 60;
    };
    
    score += typeScores[transportType as keyof typeof typeScores] || 50;
    
    // Role-based adjustments
    if(role === 'primary_artist' && transportType === 'private_driver') score += 10;
    if(role.includes('technical') && transportType === 'rental') score += 10;
    
    // Cost adjustments
    if(cost < 50) score += 5;
    if(cost > 200) score -= 10;
    
    return score;
  }
  
  private isPeakTime(eventDateTime: Date): boolean {
    const hour = eventDateTime.getHours();
    const dayOfWeek = eventDateTime.getDay();
    
    // Weekend evenings are peak time
    if((dayOfWeek === 5 || dayOfWeek === 6) && (hour >= 18 && hour <= 23)) {
      return true;
    }
    
    // Weekday rush hours
    if((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
      return true;
    }
    
    return false;
  }
  
  private async saveTransportationPlan(eventProductionId: number, transportationPlan: any[]) {
    for(const plan of transportationPlan) {
      await db.insert(eventTransportation).values({
        eventProductionId,;
        stakeholderId: plan.stakeholderId,;
        fromLocation: plan.fromLocation,;
        toLocation: plan.toLocation,;
        transportationType: plan ? .transportationOption?.type,;
        providerName : plan?.transportationOption?.providerName,;
        estimatedCost: plan ? .estimatedCost?.toString(),;
        distance : plan?.distance?.toString(),;
        paymentResponsibility: plan.paymentResponsibility,;
        status: 'planned',;
        createdAt: new Date();
      });
    }
  }
}

export const transportationExpenseSystem = new TransportationExpenseSystem();
