/**
 * Comprehensive Contract/Agreement Generation System
 * Handles all contract types with dynamic data population
 */

import { storage } from "./storage";
import PDFDocument from 'pdfkit';
import fs from 'fs/promises';
import path from 'path';

export interface ContractData {
  // Parties
  clientName: string;
  clientCompany?: string;
  clientAddress: string;
  clientEmail: string;
  clientPhone: string;
  
  artistName: string;
  artistStageName?: string;
  artistAddress: string;
  artistEmail: string;
  artistPhone: string;
  
  // Performance Details
  eventName: string;
  eventDate: string;
  eventTime: string;
  venue: string;
  venueAddress: string;
  performanceDuration: string;
  soundcheckTime?: string;
  
  // Financial Terms
  totalFee: number;
  currency: string;
  depositAmount?: number;
  depositDueDate?: string;
  finalPaymentDate: string;
  paymentMethod: string;
  
  // Technical Requirements
  technicalRiderAttached: boolean;
  equipmentProvided: string[];
  artistEquipment: string[];
  
  // Additional Terms
  cancellationPolicy: string;
  forceMAjeureClause: boolean;
  merchandiseRights: boolean;
  recordingRights: 'none' | 'audio' | 'video' | 'both';
  
  // Contract Metadata
  contractType: 'performance' | 'recording' | 'management' | 'licensing';
  createdBy: number;
  bookingId?: number;
}

export class ContractGenerator {
  private static templates = {
    performance: `
PERFORMANCE ENGAGEMENT CONTRACT

This Performance Engagement Contract ("Agreement") is made between:

CLIENT: {{clientName}} {{clientCompany ? "(" + clientCompany + ")" : ""}}
Address: {{clientAddress}}
Email: {{clientEmail}}
Phone: {{clientPhone}}

ARTIST: {{artistName}} {{artistStageName ? "(professionally known as " + artistStageName + ")" : ""}}
Address: {{artistAddress}}  
Email: {{artistEmail}}
Phone: {{artistPhone}}

PERFORMANCE DETAILS:
Event: {{eventName}}
Date: {{eventDate}}
Time: {{eventTime}}
Venue: {{venue}}
Address: {{venueAddress}}
Duration: {{performanceDuration}}
{{soundcheckTime ? "Soundcheck: " + soundcheckTime : ""}}

FINANCIAL TERMS:
Total Performance Fee: {{currency}} {{totalFee}}
{{depositAmount ? "Deposit Required: " + currency + " " + depositAmount + " (Due: " + depositDueDate + ")" : ""}}
Final Payment Due: {{finalPaymentDate}}
Payment Method: {{paymentMethod}}

TECHNICAL REQUIREMENTS:
{{technicalRiderAttached ? "Technical Rider is attached and forms part of this agreement." : ""}}
Equipment Provided by Venue: {{equipmentProvided.join(", ")}}
Equipment Provided by Artist: {{artistEquipment.join(", ")}}

ADDITIONAL TERMS:
{{cancellationPolicy}}
{{forceMAjeureClause ? "Force Majeure clause applies as per industry standard." : ""}}
{{merchandiseRights ? "Artist retains full merchandise rights." : "No merchandise sales permitted."}}
Recording Rights: {{recordingRights === 'none' ? 'No recording permitted' : 'Recording permitted: ' + recordingRights}}

This agreement shall be governed by the laws of the jurisdiction where the performance takes place.

CLIENT SIGNATURE: _________________________ DATE: _________

ARTIST SIGNATURE: _________________________ DATE: _________
`,

    recording: `
RECORDING SESSION AGREEMENT

This Recording Agreement is between:

PRODUCER/CLIENT: {{clientName}}
ARTIST: {{artistName}} {{artistStageName ? "(professionally known as " + artistStageName + ")" : ""}}

SESSION DETAILS:
Project: {{eventName}}
Session Date(s): {{eventDate}}
Studio/Location: {{venue}}
Estimated Duration: {{performanceDuration}}

FINANCIAL TERMS:
Session Fee: {{currency}} {{totalFee}}
Payment Terms: {{finalPaymentDate}}

RIGHTS AND OWNERSHIP:
Recording rights, publishing splits, and usage rights as negotiated separately.

CLIENT SIGNATURE: _________________________ DATE: _________

ARTIST SIGNATURE: _________________________ DATE: _________
`,

    management: `
ARTIST MANAGEMENT AGREEMENT

This Management Agreement is between:

MANAGEMENT COMPANY: {{clientName}} {{clientCompany ? "(" + clientCompany + ")" : ""}}
ARTIST: {{artistName}} {{artistStageName ? "(professionally known as " + artistStageName + ")" : ""}}

MANAGEMENT TERMS:
Territory: Worldwide
Term: As negotiated
Commission: As per management tier agreement

SERVICES PROVIDED:
- Career guidance and development
- Booking and tour management  
- Financial oversight and reporting
- Marketing and promotion coordination
- Contract negotiation

FINANCIAL ARRANGEMENTS:
Management Fee: {{currency}} {{totalFee}} or percentage-based
Payment Schedule: {{finalPaymentDate}}

MANAGER SIGNATURE: _________________________ DATE: _________

ARTIST SIGNATURE: _________________________ DATE: _________
`
  };

  static async generateContract(contractData: ContractData): Promise<string> {
    const template = this.templates[contractData.contractType];
    if (!template) {
      throw new Error(`Unsupported contract type: ${contractData.contractType}`);
    }

    // Replace template variables
    let contract = template;
    Object.entries(contractData).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      contract = contract.replace(regex, String(value));
    });

    // Handle conditional content
    contract = this.processConditionals(contract, contractData);
    
    return contract;
  }

  static async generatePDF(contractData: ContractData): Promise<Buffer> {
    const contractText = await this.generateContract(contractData);
    
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument();
      const buffers: Buffer[] = [];

      doc.on('data', (buffer) => buffers.push(buffer));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Add contract content
      doc.fontSize(16).text('PERFORMANCE AGREEMENT', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(contractText);
      
      doc.end();
    });
  }

  private static processConditionals(template: string, data: ContractData): string {
    // Process conditional blocks like {{condition ? "text" : "alt"}}
    const conditionalRegex = /{{([^}]+)\s*\?\s*"([^"]+)"\s*:\s*"([^"]*)"}}/g;
    
    return template.replace(conditionalRegex, (match, condition, trueText, falseText) => {
      try {
        // Simple condition evaluation (extend as needed)
        const result = this.evaluateCondition(condition, data);
        return result ? trueText : falseText;
      } catch (error) {
        console.error('Error evaluating condition:', condition, error);
        return match; // Return original if evaluation fails
      }
    });
  }

  private static evaluateCondition(condition: string, data: any): boolean {
    // Simple condition evaluator - extend as needed
    const parts = condition.trim().split(' ');
    if (parts.length === 1) {
      return Boolean(data[parts[0]]);
    }
    // Add more complex condition logic here if needed
    return false;
  }

  static async saveContract(contractData: ContractData, contractText: string): Promise<string> {
    const fileName = `contract_${contractData.contractType}_${Date.now()}.txt`;
    const filePath = path.join('contracts', fileName);
    
    // Ensure contracts directory exists
    await fs.mkdir('contracts', { recursive: true });
    await fs.writeFile(filePath, contractText);
    
    return filePath;
  }
}