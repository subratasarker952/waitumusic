import PDFDocument from 'pdfkit';

interface PerformanceEngagementContractData {
  // Contract metadata
  contractDate: string;
  contractEndDate: string;
  
  // Company information
  companyName: string;
  companyAddress: string;
  companyRegistration: string;
  
  // Client/Event information
  clientCompanyName: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  venueName: string;
  
  // Performer information
  performerName: string;
  performerRole: string; // Instrument/Vocalist/Dancer/Background Vocalist/etc
  performerType: string; // Artist/Musician/Professional
  isManaged: boolean;
  
  // Compensation
  contractValue: string;
  paymentMethod: string;
  
  // Performance details
  collectiveName?: string; // e.g., "LiiMiiX collective"
  headlinerName?: string; // e.g., "Lí-Lí Octave"
  
  // Additional terms
  rehearsalRequired: boolean;
  soundcheckHours: number;
  exclusivityRequired: boolean;
  publicityRights: boolean;
  travelRequired: boolean;
  accommodationRequired: boolean;
  equipmentProvided: boolean;
  insuranceRequired: boolean;
  
  // Technical specifications
  technicalRequirements?: string;
  equipmentDetails?: string;
}

export function generatePerformanceEngagementContract(data: PerformanceEngagementContractData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'LETTER',
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // Header
      doc.fontSize(18).font('Helvetica-Bold')
         .text('PERFORMANCE ENGAGEMENT CONTRACT', { align: 'center' });
      
      doc.moveDown(1);
      
      // Contract introduction
      doc.fontSize(11).font('Helvetica')
         .text(`This Performance Engagement Contract (the "Agreement") is made and entered into as of ${data.contractDate} by and between ${data.companyName}, registered and existing under the laws of ${data.companyRegistration}, with its principal place of business located at ${data.companyAddress} (hereinafter referred to as "Service Provider"), and ${data.clientCompanyName}, (hereinafter referred to as the "Client" or "Artist" depending on the context of engagement).`);
      
      doc.moveDown(1);

      // Section 1: Engagement
      doc.fontSize(12).font('Helvetica-Bold').text('1. ENGAGEMENT');
      doc.fontSize(11).font('Helvetica')
         .text(`1.1 Engagement: Service Provider hereby engages the ${data.performerType} to perform as a ${data.performerRole} ${data.collectiveName ? `for the ${data.collectiveName}` : ''} for a live performance event called "${data.eventName}" (the "Event") scheduled to take place on ${data.contractEndDate} at ${data.eventTime} at ${data.eventLocation}, ${data.venueName} (the "Venue").`);
      
      doc.text(`1.2 Services: The ${data.performerType} agrees to perform as a ${data.performerRole} during the Event${data.headlinerName ? `, providing musical accompaniment and support to ${data.headlinerName}` : ''}.`);
      
      doc.moveDown(0.5);

      // Section 2: Compensation
      doc.fontSize(12).font('Helvetica-Bold').text('2. COMPENSATION');
      doc.fontSize(11).font('Helvetica')
         .text(`2.1 Compensation: Service Provider agrees to pay the ${data.performerType} the sum of ${data.contractValue} as compensation for the services rendered under this Agreement.`);
      
      doc.text(`2.2 Payment: Payment shall be made to the ${data.performerType} by ${data.paymentMethod} within 7 days after ${data.contractEndDate}.`);
      
      doc.moveDown(0.5);

      // Section 3: Rehearsal and Performance Requirements
      doc.fontSize(12).font('Helvetica-Bold').text('3. REHEARSAL AND PERFORMANCE REQUIREMENTS');
      doc.fontSize(11).font('Helvetica');
      
      if (data.rehearsalRequired) {
        doc.text(`3.1 Rehearsal: The ${data.performerType} agrees to participate in rehearsals for the Event as scheduled by Service Provider. Rehearsal dates and times will be communicated to the ${data.performerType} in advance.`);
      }
      
      doc.text(`3.${data.rehearsalRequired ? '2' : '1'} Soundcheck and Attendance: On the day of Event, ${data.performerType} is required to be present at the Venue at least ${data.soundcheckHours} hour${data.soundcheckHours !== 1 ? 's' : ''} in advance to facilitate soundcheck and other preparations for the Event.`);
      
      doc.moveDown(0.5);

      // Section 4: Exclusivity (if required)
      if (data.exclusivityRequired) {
        doc.fontSize(12).font('Helvetica-Bold').text('4. EXCLUSIVITY');
        doc.fontSize(11).font('Helvetica')
           .text(`4.1 Exclusivity: During the Event, the ${data.performerType} agrees to perform exclusively for Service Provider${data.collectiveName ? `, via ${data.collectiveName}` : ''}, and not for any other party unless otherwise agreed upon.`);
        doc.moveDown(0.5);
      }

      // Section 5: Publicity Rights (if applicable)
      const sectionNum = data.exclusivityRequired ? 5 : 4;
      if (data.publicityRights) {
        doc.fontSize(12).font('Helvetica-Bold').text(`${sectionNum}. PUBLICITY`);
        doc.fontSize(11).font('Helvetica')
           .text(`${sectionNum}.1 Publicity: The ${data.performerType} grants Service Provider the right to use the ${data.performerType}'s name, likeness, and biographical information for promotional purposes related to the Event.`);
        doc.moveDown(0.5);
      }

      // Section 6: Intellectual Property
      const ipSectionNum = sectionNum + (data.publicityRights ? 1 : 0);
      doc.fontSize(12).font('Helvetica-Bold').text(`${ipSectionNum}. INTELLECTUAL PROPERTY`);
      doc.fontSize(11).font('Helvetica')
         .text(`${ipSectionNum}.1 Ownership: All musical compositions, arrangements, and other creative works created by the ${data.performerType} in connection with the Event shall be the sole property of Service Provider. Notwithstanding, intellectual property rights and percentages by contribution of the ${data.performerType} shall be respected.`);
      
      doc.moveDown(0.5);

      // Section 7: Technical Requirements (if applicable)
      const techSectionNum = ipSectionNum + 1;
      if (data.technicalRequirements || data.equipmentDetails) {
        doc.fontSize(12).font('Helvetica-Bold').text(`${techSectionNum}. TECHNICAL REQUIREMENTS`);
        doc.fontSize(11).font('Helvetica');
        
        if (data.equipmentProvided) {
          doc.text(`${techSectionNum}.1 Equipment: Service Provider shall provide the necessary musical equipment and technical requirements for the Event as specified in the attached technical rider.`);
        }
        
        if (data.technicalRequirements) {
          doc.text(`${techSectionNum}.${data.equipmentProvided ? '2' : '1'} Technical Specifications: ${data.technicalRequirements}`);
        }
        
        doc.moveDown(0.5);
      }

      // Section 8: Travel and Accommodation (if applicable)
      const travelSectionNum = techSectionNum + (data.technicalRequirements || data.equipmentDetails ? 1 : 0);
      if (data.travelRequired || data.accommodationRequired) {
        doc.fontSize(12).font('Helvetica-Bold').text(`${travelSectionNum}. TRAVEL AND ACCOMMODATION`);
        doc.fontSize(11).font('Helvetica');
        
        if (data.travelRequired) {
          doc.text(`${travelSectionNum}.1 Travel: Service Provider shall arrange and cover costs for necessary travel arrangements for the ${data.performerType} to and from the Event location.`);
        }
        
        if (data.accommodationRequired) {
          doc.text(`${travelSectionNum}.${data.travelRequired ? '2' : '1'} Accommodation: Service Provider shall provide suitable accommodation for the ${data.performerType} for the duration of the Event engagement.`);
        }
        
        doc.moveDown(0.5);
      }

      // Section 9: Termination
      const termSectionNum = travelSectionNum + (data.travelRequired || data.accommodationRequired ? 1 : 0);
      doc.fontSize(12).font('Helvetica-Bold').text(`${termSectionNum}. TERMINATION`);
      doc.fontSize(11).font('Helvetica')
         .text(`${termSectionNum}.1 Termination: Either party may terminate this Agreement for cause upon 30 days' written notice to the other party.`);
      
      doc.moveDown(0.5);

      // Section 10: Indemnification
      const indemSectionNum = termSectionNum + 1;
      doc.fontSize(12).font('Helvetica-Bold').text(`${indemSectionNum}. INDEMNIFICATION`);
      doc.fontSize(11).font('Helvetica')
         .text(`${indemSectionNum}.1 Indemnification: The ${data.performerType} agrees to indemnify and hold harmless Service Provider, its officers, directors, employees, and agents from and against any and all claims, damages, losses, liabilities, and expenses arising out of or in connection with the ${data.performerType}'s performance under this Agreement.`);
      
      doc.moveDown(0.5);

      // Section 11: Entire Agreement
      const entireSectionNum = indemSectionNum + 1;
      doc.fontSize(12).font('Helvetica-Bold').text(`${entireSectionNum}. ENTIRE AGREEMENT`);
      doc.fontSize(11).font('Helvetica')
         .text(`${entireSectionNum}.1 Entire Agreement: This Agreement constitutes the entire agreement between the parties and supersedes all prior or contemporaneous communications, representations, or agreements, whether oral or written${data.exclusivityRequired ? ', barring any written provisions in clause (4.)' : ''}.`);
      
      doc.moveDown(0.5);

      // Section 12: Governing Law
      const govSectionNum = entireSectionNum + 1;
      doc.fontSize(12).font('Helvetica-Bold').text(`${govSectionNum}. GOVERNING LAW`);
      doc.fontSize(11).font('Helvetica')
         .text(`${govSectionNum}.1 Governing Law: This Agreement shall be governed by and construed in accordance with the laws of the Commonwealth of Dominica.`);
      
      doc.moveDown(1);

      // Additional Considerations
      doc.fontSize(12).font('Helvetica-Bold').text('ADDITIONAL CONSIDERATIONS:');
      doc.fontSize(11).font('Helvetica');
      
      doc.text('• Technical Rider: Wherever possible, Service Provider shall specify who will provide the necessary musical equipment (instruments, amplifiers, etc.) and any technical requirements for the Event, based on information received from the organizers of the Event.');
      
      if (data.travelRequired || data.accommodationRequired) {
        doc.text('• Travel and Accommodation: Arrangements for the performer\'s travel and accommodation for the Event and rehearsals are outlined in the relevant sections above.');
      }
      
      if (data.insuranceRequired) {
        doc.text('• Insurance: It is suggested that the performer obtain appropriate liability insurance coverage where applicable.');
      }
      
      doc.text('• Confidentiality: All information contained herein is considered strictly confidential, private and not for public consumption under penalty of law. This provision does not preclude discussions of this document with the performer\'s own legal representative(s).');
      
      doc.moveDown(2);

      // Signature section
      doc.fontSize(12).font('Helvetica-Bold').text('SIGNATURES:');
      doc.fontSize(11).font('Helvetica');
      
      doc.moveDown(1);
      doc.text('SERVICE PROVIDER:', { continued: false });
      doc.moveDown(1);
      doc.text('_________________________     Date: ________________');
      doc.text(`${data.companyName}`);
      doc.text('By: _____________________');
      doc.text('Title: ___________________');
      
      doc.moveDown(1);
      doc.text(`${data.performerType.toUpperCase()}:`, { continued: false });
      doc.moveDown(1);
      doc.text('_________________________     Date: ________________');
      doc.text(`${data.performerName}`);
      if (data.isManaged) {
        doc.moveDown(0.5);
        doc.text('MANAGED PERFORMER - Subject to management oversight and tier benefits');
      }
      
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

// Helper function to determine performer role based on user type and assignment
export function getPerformerRole(userType: string, instruments?: string[], specializations?: string[]): string {
  switch (userType) {
    case 'artist':
      return 'Lead Artist/Performer';
    case 'musician':
      if (instruments && instruments.length > 0) {
        return instruments[0]; // Primary instrument
      }
      return 'Musician';
    case 'professional':
      if (specializations && specializations.length > 0) {
        // Map professional specializations to performance roles
        const spec = specializations[0].toLowerCase();
        if (spec.includes('vocal') || spec.includes('singer')) return 'Background Vocalist';
        if (spec.includes('dance') || spec.includes('choreograph')) return 'Dancer/Choreographer';
        if (spec.includes('sound') || spec.includes('audio')) return 'Sound Engineer';
        if (spec.includes('light')) return 'Lighting Technician';
        if (spec.includes('stage')) return 'Stage Manager';
        return 'Performance Professional';
      }
      return 'Performance Professional';
    default:
      return 'Performer';
  }
}