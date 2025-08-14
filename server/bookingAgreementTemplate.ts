import PDFKit from 'pdfkit';

export interface BookingAgreementData {
  contractDate: string;
  contractEndDate: string;
  clientCompanyName: string;
  companyName: string;
  artistName: string;
  artistStageName?: string;
  eventName: string;
  eventType: string;
  venueName: string;
  venueAddress: string;
  eventDate: string;
  performanceStartTime: string;
  performanceEndTime: string;
  performanceDuration: string;
  pricingTableTotal: string;
  pricingTable: string;
  
  // Performance details from booking form
  performanceFormat?: 'in_person' | 'virtual' | 'hybrid';
  soundSystemProvided?: boolean;
  lightingProvided?: boolean;
  videographyNeeded?: boolean;
  photographyNeeded?: boolean;
  
  // Band configuration
  bandConfiguration?: 'solo' | '4_piece' | 'full_band' | 'custom';
  numberOfSongs?: number;
  songTitles?: string[];
  
  // Administrative requirements
  travelRequired?: boolean;
  accommodationRequired?: boolean;
  visaRequired?: boolean;
  accompanimentRequested?: boolean;
  
  // Hospitality requirements
  hospitalityRequirements?: string[];
  
  // Client details
  clientContactName: string;
  clientContactEmail: string;
  clientContactPhone?: string;
  relationToEvent?: string;
  
  // Special requirements
  customRequirements?: string[];
  additionalNotes?: string;
}

export function generateBookingAgreement(data: BookingAgreementData): PDFKit.PDFDocument {
  const doc = new PDFKit({
    margin: 50,
    size: 'A4'
  });

  // Header
  doc.fontSize(16).text('BOOKING AGREEMENT', { align: 'center' });
  doc.moveDown(1);
  
  doc.fontSize(12).text(`This agreement (the "Agreement") is between ${data.clientCompanyName} (the "Client") and ${data.companyName} (the "Service Provider"). This Agreement is dated ${data.contractDate}.`);
  doc.moveDown(2);

  // Deliverables
  addDeliverables(doc, data);
  
  // Duration
  addDuration(doc, data);
  
  // Payment Terms
  addPaymentTerms(doc, data);
  
  // Performance Specifications
  addPerformanceSpecs(doc, data);
  
  // Administrative Requirements
  addAdministrativeRequirements(doc, data);
  
  // Legal Terms
  addLegalTerms(doc, data);
  
  // Signature Section
  addSignatureSection(doc, data);

  return doc;
}

function addDeliverables(doc: PDFKit.PDFDocument, data: BookingAgreementData): void {
  doc.fontSize(14).text('DELIVERABLES', { underline: true });
  doc.fontSize(12);
  doc.moveDown();
  
  doc.text('The Client is hiring the Service Provider to provide the following:');
  doc.moveDown();
  
  // Performance deliverables
  const performerName = data.artistStageName || data.artistName;
  doc.text(`• ${performerName} performance for ${data.performanceDuration}`);
  
  if (data.bandConfiguration === 'solo') {
    doc.text('• Solo performance with playback accompaniment');
  } else if (data.bandConfiguration === '4_piece') {
    doc.text('• Live performance with 4-piece band (drummer, bassist, guitarist, keyboardist)');
  } else if (data.bandConfiguration === 'full_band') {
    doc.text('• Live performance with full band including background vocalists');
  }
  
  if (data.numberOfSongs) {
    doc.text(`• Performance repertoire: ${data.numberOfSongs} song(s)`);
    if (data.songTitles && data.songTitles.length > 0) {
      doc.text('  - Requested songs: ' + data.songTitles.join(', '));
    }
  }
  
  // Technical deliverables
  if (!data.soundSystemProvided) {
    doc.text('• Professional sound system setup and operation');
  }
  if (!data.lightingProvided) {
    doc.text('• Stage lighting setup and operation');
  }
  if (data.videographyNeeded) {
    doc.text('• Professional videography services');
  }
  if (data.photographyNeeded) {
    doc.text('• Professional photography services');
  }
  
  doc.moveDown(2);
}

function addDuration(doc: PDFKit.PDFDocument, data: BookingAgreementData): void {
  doc.fontSize(14).text('DURATION', { underline: true });
  doc.fontSize(12);
  doc.moveDown();
  
  doc.text(`The Service Provider will begin preparation for the performance from ${data.contractDate} and will perform on ${data.eventDate} from ${data.performanceStartTime} to ${data.performanceEndTime}.`);
  doc.moveDown();
  
  if (data.travelRequired) {
    doc.text('This engagement requires travel arrangements as specified in the administrative requirements section.');
  }
  
  doc.moveDown(2);
}

function addPaymentTerms(doc: PDFKit.PDFDocument, data: BookingAgreementData): void {
  doc.fontSize(14).text('PAYMENT', { underline: true });
  doc.fontSize(12);
  doc.moveDown();
  
  doc.text(`The Client will pay the Service Provider a sum of ${data.pricingTableTotal}. Of this, the Client will pay the Service Provider a 50% deposit before work begins.`);
  doc.moveDown();
  
  if (data.pricingTable) {
    doc.text('Payment Breakdown:');
    doc.text(data.pricingTable);
    doc.moveDown();
  }
  
  doc.text(`The Service Provider will invoice the Client prior to ${data.eventDate}.`);
  doc.moveDown();
  
  doc.text(`The Client agrees to pay the Service Provider in full within 7 days of receiving the invoice or by ${data.eventDate}, whichever is sooner. Payment after that date will incur a late fee of $500 per month.`);
  doc.moveDown(2);
}

function addPerformanceSpecs(doc: PDFKit.PDFDocument, data: BookingAgreementData): void {
  doc.fontSize(14).text('PERFORMANCE SPECIFICATIONS', { underline: true });
  doc.fontSize(12);
  doc.moveDown();
  
  // Event format
  if (data.performanceFormat === 'virtual') {
    doc.text('• Performance Format: Virtual/Online presentation with professional streaming setup');
  } else if (data.performanceFormat === 'hybrid') {
    doc.text('• Performance Format: Hybrid event with both in-person audience and live streaming');
  } else {
    doc.text('• Performance Format: In-person live performance');
  }
  
  // Venue specifications
  doc.text(`• Event Venue: ${data.venueName}, ${data.venueAddress}`);
  doc.text(`• Event Type: ${data.eventType}`);
  
  // Technical requirements
  doc.moveDown();
  doc.text('Technical Requirements:');
  
  if (data.soundSystemProvided) {
    doc.text('• Sound system provided by Client (subject to technical rider specifications)');
  } else {
    doc.text('• Sound system to be provided by Service Provider');
  }
  
  if (data.lightingProvided) {
    doc.text('• Lighting system provided by Client');
  } else {
    doc.text('• Lighting system to be provided by Service Provider');
  }
  
  // Hospitality requirements
  if (data.hospitalityRequirements && data.hospitalityRequirements.length > 0) {
    doc.moveDown();
    doc.text('Hospitality Requirements:');
    data.hospitalityRequirements.forEach(req => {
      doc.text(`• ${req}`);
    });
  }
  
  doc.moveDown(2);
}

function addAdministrativeRequirements(doc: PDFKit.PDFDocument, data: BookingAgreementData): void {
  doc.fontSize(14).text('ADMINISTRATIVE REQUIREMENTS', { underline: true });
  doc.fontSize(12);
  doc.moveDown();
  
  doc.text('EXPENSES');
  doc.text('The Client will reimburse the Service Provider\'s event-related expenses as applicable. Expenses shall be pre-approved by the Client.');
  doc.moveDown();
  
  // Travel and accommodation
  if (data.travelRequired) {
    doc.text('Travel Requirements:');
    doc.text('• Round-trip transportation for artist and accompanying personnel');
    doc.text('• Travel insurance coverage for the duration of travel');
    
    if (data.accommodationRequired) {
      doc.text('• Accommodation arrangements as per rider specifications');
      doc.text('• Ground transportation between airport, accommodation, and venue');
    }
    
    if (data.visaRequired) {
      doc.text('• Visa application and permit fees (if applicable)');
    }
    
    if (data.accompanimentRequested) {
      doc.text('• Accommodation and travel for accompanying personnel as specified');
    }
    
    doc.text('• Per diem allowance: $100 per day for meals and incidentals');
    doc.moveDown();
  }
  
  // Documentation requirements
  doc.text('Documentation Requirements:');
  doc.text('• Client must provide confirmed travel booking details prior to performance date');
  doc.text('• Client must provide confirmed accommodation booking details');
  doc.text('• Emergency contact information for local ground transportation');
  doc.text('• Venue technical specifications and load-in/sound check schedule');
  doc.moveDown();
  
  // Revisions
  doc.text('REVISIONS');
  doc.text('The Client will incur additional fees for revisions requested which are outside the scope of the original agreement at the Service Provider\'s standard rate of $150 per revision.');
  doc.moveDown(2);
}

function addLegalTerms(doc: PDFKit.PDFDocument, data: BookingAgreementData): void {
  doc.addPage();
  
  doc.fontSize(14).text('LEGAL TERMS', { underline: true });
  doc.fontSize(12);
  doc.moveDown();
  
  const legalSections = [
    {
      title: 'OWNERSHIP AND AUTHORSHIP',
      content: 'Ownership: The Client owns all deliverables (excluding inherent intellectual property rights of the Service Provider and Artist, such as song copyrights) once the Client has paid the Service Provider in full.\n\nAuthorship: The Client agrees the Service Provider may showcase the performance in the Service Provider\'s and Artist\'s portfolio, websites, printed literature and other media for recognition purposes.'
    },
    {
      title: 'CONFIDENTIALITY AND NON-DISCLOSURE',
      content: 'Each party promises to the other party that it will not share information that is marked confidential and non-public with a third party, unless the disclosing party gives written permission first. Each party must continue to follow these obligations, even after the Agreement ends.'
    },
    {
      title: 'REPRESENTATIONS',
      content: 'Each party promises to the other party that it has the authority to enter into and perform all of its obligations under this Agreement.'
    },
    {
      title: 'TERM AND TERMINATION',
      content: 'Either party may end this Agreement at any time and for any reason, by providing 7 days\' written notice.\n\nThe Client will pay the Service Provider for all work that has been completed when the Agreement ends and shall immediately reimburse the Service Provider for any prior event-related expenses.'
    },
    {
      title: 'LIMITATION OF LIABILITY',
      content: 'The Service Provider\'s deliverables are presented "as is" and the Service Provider\'s maximum liability is the total sum paid by the Client to the Service Provider under this Agreement.'
    },
    {
      title: 'INDEMNITY',
      content: 'The Client agrees to indemnify, save and hold harmless the Service Provider and Artist from any and all damages, liabilities, costs, losses or expenses arising out of any claim, demand, or action by a third party as a result of the work the Service Provider has done under this Agreement.'
    },
    {
      title: 'FORCE MAJEURE',
      content: 'Neither party shall be liable for any failure or delay in performance under this Agreement which is due to an act of God, war, terrorism, epidemic, government regulation, disaster, strike, or other cause beyond the reasonable control of such party.'
    }
  ];
  
  legalSections.forEach(section => {
    doc.fontSize(12).text(section.title, { underline: true });
    doc.fontSize(11).text(section.content);
    doc.moveDown();
  });
  
  // Governing law
  doc.fontSize(12).text('GENERAL', { underline: true });
  doc.fontSize(11);
  doc.text('Governing Law and Dispute Resolution: The laws of Dominica govern the rights and obligations of the Client and the Service Provider under this Agreement, without regard to conflict of law provisions of that state.');
  doc.moveDown();
  
  doc.text('Notices: All notices to either party shall be in writing and delivered by email or registered mail. Notices must be delivered to the party\'s address(es) listed at the end of this Agreement.');
  doc.moveDown();
  
  doc.text('Severability: If any portion of this Agreement is changed or disregarded because it is unenforceable, the rest of the Agreement is still enforceable.');
  doc.moveDown();
  
  doc.text('Entire Agreement: This Agreement supersedes all other prior Agreements (both written and oral) between the parties.');
  doc.moveDown(2);
}

function addSignatureSection(doc: PDFKit.PDFDocument, data: BookingAgreementData): void {
  doc.fontSize(12).text('SIGNATURE PAGE', { underline: true });
  doc.moveDown();
  
  doc.text('The undersigned agree to and accept the terms of this Agreement.');
  doc.moveDown(2);
  
  // Client signature
  doc.text('CLIENT REPRESENTATIVE:');
  doc.moveDown();
  doc.text('Signature: _________________________________ Date: ____________');
  doc.moveDown();
  doc.text(`Print Name: ${data.clientContactName}`);
  doc.moveDown();
  if (data.relationToEvent) {
    doc.text(`Title/Relation to Event: ${data.relationToEvent}`);
  }
  doc.text(`Email: ${data.clientContactEmail}`);
  if (data.clientContactPhone) {
    doc.text(`Phone: ${data.clientContactPhone}`);
  }
  doc.moveDown(2);
  
  // Service provider signature
  doc.text('SERVICE PROVIDER REPRESENTATIVE:');
  doc.moveDown();
  doc.text('Signature: _________________________________ Date: ____________');
  doc.moveDown();
  doc.text('Print Name: _________________________________');
  doc.moveDown();
  doc.text(`Company: ${data.companyName}`);
  doc.moveDown(2);
  
  // Artist signature
  doc.text('ARTIST:');
  doc.moveDown();
  doc.text('Signature: _________________________________ Date: ____________');
  doc.moveDown();
  doc.text(`Print Name: ${data.artistName}`);
  if (data.artistStageName) {
    doc.text(`Stage Name: ${data.artistStageName}`);
  }
  doc.moveDown(2);
  
  doc.fontSize(10);
  doc.text('This booking agreement incorporates by reference the Technical Rider and any additional performance requirements specified therein. All parties acknowledge receipt and understanding of all related documentation.');
}

export function getBookingFormRequirements(): Array<{category: string; fields: string[]}> {
  return [
    {
      category: 'Event Details',
      fields: [
        'Event Name',
        'Event Date and Time', 
        'Venue/Event Address',
        'Event Theme/Cause',
        'Event Language (English/French/Spanish/Other)',
        'Event Type (Open/Closed)',
        'Complimentary Tickets Offered'
      ]
    },
    {
      category: 'Performance Format',
      fields: [
        'In-person/Virtual/Hybrid',
        'Sound System (Needed/Provided)',
        'Lighting (Needed/Provided)', 
        'Videography (Needed/Provided)',
        'Photography (Needed/Provided)'
      ]
    },
    {
      category: 'Performance Configuration',
      fields: [
        'Performance Duration (5min-120min+)',
        'Band Configuration (Solo/4-piece/Full band)',
        'Number of Songs',
        'Specific Song Titles (if known)',
        'Performance Rate Category'
      ]
    },
    {
      category: 'Administrative Requirements',
      fields: [
        'Travel Required',
        'Travel Insurance',
        'Accommodation Required',
        'Per Diem ($100/day)',
        'Visa/Permit Fees',
        'Accompaniment (Daughter/Manager)',
        'Travel Booking Confirmation',
        'Accommodation Booking Confirmation',
        'Ground Transportation Contact'
      ]
    },
    {
      category: 'Schedule Requirements',
      fields: [
        'Soundcheck Arrival Date/Time',
        'Backstage Arrival Date/Time',
        'Performance Start Time',
        'Performance End Time'
      ]
    },
    {
      category: 'Hospitality Requirements',
      fields: [
        'Bottled Water (Room Temperature)',
        'Fresh Fruit Juice (Orange preferred)',
        'Tea Service',
        'Coffee Service'
      ]
    },
    {
      category: 'Client Information',
      fields: [
        'Client Full Name',
        'Relation to Event',
        'Email Address',
        'Contact Numbers',
        'Invoicing Information'
      ]
    }
  ];
}