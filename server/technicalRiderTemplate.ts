import PDFKit from 'pdfkit';

export interface TechnicalRiderData {
  contractDate: string;
  clientCompanyName: string;
  companyName: string;
  artistName: string;
  eventName: string;
  venueName: string;
  venueAddress: string;
  performanceDuration: string;
  contractEndDate: string;
  performanceTime: string;
  pricingTableTotal: string;
  pricingTable: string;
  setList?: Array<{song: string; performer: string; notes?: string}>;
  bandMembers?: Array<{role: string; name: string; membership: string}>;
  serviceProviders?: Array<{role: string; name: string}>;
  specialRequirements?: string[];
}

export function generateTechnicalRider(data: TechnicalRiderData): PDFKit.PDFDocument {
  const doc = new PDFKit({
    margin: 50,
    size: 'A4'
  });

  // Header
  doc.fontSize(16).text('TECHNICAL RIDER AGREEMENT', { align: 'center' });
  doc.moveDown(1);
  
  doc.fontSize(12).text(`This agreement (the "Agreement"), dated ${data.contractDate}, is between ${data.clientCompanyName} (the "CLIENT") and ${data.companyName} (the "SERVICE PROVIDER") acting on behalf of ${data.artistName} (the "ARTIST").`);
  doc.moveDown(2);

  // Definitions
  addDefinitions(doc, data);
  
  // Band and Service Provider Members
  addBandMembers(doc, data);
  
  // Terms
  addTerms(doc, data);
  
  // Equipment Requirements
  addEquipmentRequirements(doc);
  
  // Staging Requirements
  addStagingRequirements(doc);
  
  // Hospitality Requirements
  addHospitalityRequirements(doc);
  
  // Technical Specifications
  addTechnicalSpecs(doc);
  
  // Payment and Legal Terms
  addPaymentAndLegalTerms(doc, data);

  return doc;
}

function addDefinitions(doc: PDFKit.PDFDocument, data: TechnicalRiderData): void {
  doc.fontSize(14).text('DEFINITIONS', { underline: true });
  doc.fontSize(12);
  doc.moveDown();
  
  doc.text('At all times the definition of the word:');
  doc.moveDown();
  
  doc.text(`CLIENT shall refer to the legal entity that is engaging this production, which includes musicians, staff, management, etc. of ${data.clientCompanyName}.`);
  doc.moveDown();
  
  doc.text(`EVENT shall refer to: ${data.eventName}`);
  doc.moveDown();
  
  doc.text(`VENUE shall refer to the location in which the production shall take place: ${data.venueName}, ${data.venueAddress}`);
  doc.moveDown();
  
  doc.text('PERFORMANCE shall refer to the musical performance of the ARTIST.');
  doc.moveDown();
  
  doc.text(`ARTIST shall refer to the musical talent contracted to perform the PRODUCTION by the CLIENT: ${data.artistName}`);
  doc.moveDown();
  
  doc.text(`SERVICE PROVIDER shall refer to the representative(s) of ${data.companyName}.`);
  doc.moveDown();
  
  doc.text('BAND shall refer to the collective providing musical accompaniment, inclusive of musicians and background vocalists, to the ARTIST.');
  doc.moveDown(2);
}

function addBandMembers(doc: PDFKit.PDFDocument, data: TechnicalRiderData): void {
  doc.fontSize(14).text('SERVICE PROVIDER AND BAND MEMBERS', { underline: true });
  doc.fontSize(12);
  doc.moveDown();
  
  // Band members table
  if (data.bandMembers && data.bandMembers.length > 0) {
    doc.text('Membership\t\tRole\t\t\tName');
    doc.text('─'.repeat(70));
    
    data.bandMembers.forEach(member => {
      const membership = member.membership || 'TBD';
      const role = member.role || 'TBD';
      const name = member.name || 'TBD';
      doc.text(`${membership}\t\t${role}\t\t${name}`);
    });
    doc.moveDown();
  }
  
  // Service provider members
  if (data.serviceProviders && data.serviceProviders.length > 0) {
    data.serviceProviders.forEach(provider => {
      const role = provider.role || 'TBD';
      const name = provider.name || 'TBD';
      doc.text(`SERVICE PROVIDER\t${role}\t\t${name}`);
    });
    doc.moveDown(2);
  }
}

function addTerms(doc: PDFKit.PDFDocument, data: TechnicalRiderData): void {
  doc.fontSize(14).text('TERMS', { underline: true });
  doc.fontSize(12);
  doc.moveDown();
  
  const terms = [
    'All equipment, materials, personnel and/or labor specified in this rider will be provided by the CLIENT, at the CLIENT\'s own expense (except where this rider specifically states otherwise).',
    'Upon completion of the agreement or sixty (60) days prior to performance, the CLIENT shall provide to the SERVICE PROVIDER, plans and information about the VENUE including a stage and seating diagram, backline lists of lighting, audio and projection equipment, as well as any additional information such as working hours or labor stipulations that may be vital to the planning of this engagement, as applicable.',
    'All video, projection, audio and lighting components, as described below, must be set-up, tested, and fully operational before first rehearsal of the PERFORMANCE, whether that rehearsal is with or without the BAND.',
    'The PERFORMANCE as the musical content contribution to the EVENT may not be changed or altered in any way except by the SERVICE PROVIDER.',
    `The PERFORMANCE duration, in minutes, is approximately: ${data.performanceDuration}`
  ];
  
  terms.forEach(term => {
    doc.text(`• ${term}`);
    doc.moveDown();
  });
  
  doc.moveDown();
}

function addEquipmentRequirements(doc: PDFKit.PDFDocument): void {
  doc.fontSize(14).text('RHYTHM SECTION BACK-LINE EQUIPMENT', { underline: true });
  doc.fontSize(12);
  doc.moveDown();
  
  doc.text('CLIENT shall provide the following equipment, or equivalent. This list is subject to change, and it is the responsibility of the CLIENT to confirm the back-line requirements for the purpose of high quality sound reinforcement:');
  doc.moveDown();
  
  const equipment = [
    'Aguilar Tone Hammer 500 Bass Head with 8 X 10 cabinet (preferred) or equivalent',
    'Fender twin reverb guitar amp or equivalent',
    'Drum Set Preference (or equivalent):',
    '  • DW fusion drum kit (14" snare; 10", 12", 16" toms)',
    '  • DW 5000 kick pedal',
    '  • Meinl byzance cymbals (14" hi hat, 16" crash, 17/18" crash, 8" splash, splash stack, ride)',
    '  • Five (5) cymbal stands'
  ];
  
  equipment.forEach(item => {
    doc.text(item);
  });
  
  doc.moveDown(2);
  
  // Sound reinforcement requirements
  doc.text('In addition to a high-quality sound reinforcement system, CLIENT shall provide the following equipment, or equivalent, and staffing necessary for sound reinforcement:');
  doc.moveDown();
  
  const soundEquip = [
    'One (1) wireless mic for ARTIST (Shure SM58 or equivalent)',
    'Wedge monitors (sufficient for stage size) or in-ear monitors for BAND',
    'Small table upon which to rest ARTIST\'s Tambourine and shaker',
    'In-ear Monitor XLR/TRS connection for ARTIST'
  ];
  
  soundEquip.forEach(item => {
    doc.text(`• ${item}`);
  });
  
  doc.moveDown(2);
}

function addStagingRequirements(doc: PDFKit.PDFDocument): void {
  doc.fontSize(14).text('STAGING AND LIGHTING', { underline: true });
  doc.fontSize(12);
  doc.moveDown();
  
  doc.text('We understand the basic stage layout for the PRODUCTION will be largely predetermined. The stage is to be set-up according to the Stage Plot in advance of the first rehearsal.');
  doc.moveDown();
  
  doc.text('PERFORMANCE requires the following lighting:');
  doc.text('• One-two (1-2) follow spots/spotlights for the ARTIST (as applicable)');
  doc.text('• Gels for Pops lighting (variety of colors and patterns) (as applicable)');
  doc.moveDown(2);
}

function addHospitalityRequirements(doc: PDFKit.PDFDocument): void {
  doc.fontSize(14).text('HOSPITALITY AND DRESSING ROOMS', { underline: true });
  doc.fontSize(12);
  doc.moveDown();
  
  doc.text('SERVICE PROVIDER requests one (1) dressing room for the ARTIST (female), female members of the BAND, and the rest of the BAND (males). Dressing room should be stocked with towels or paper towels. PRODUCER and ARTIST require free access to the internet (if available) for duration of engagement.');
  doc.moveDown();
  
  doc.text('A refreshment table must be set-up in or near the dressing room area, made available to ARTIST and BAND, and include the following:');
  doc.moveDown();
  
  const refreshments = [
    'Bottle(s) of spring water (room temperature)',
    'A variety of fruit juices (orange is preferred)',
    'Hot water, honey and lemon for tea',
    'Coffee'
  ];
  
  refreshments.forEach(item => {
    doc.text(`• ${item}`);
  });
  
  doc.moveDown(2);
}

function addTechnicalSpecs(doc: PDFKit.PDFDocument): void {
  doc.fontSize(14).text('REHEARSALS AND TECHNICAL REQUIREMENTS', { underline: true });
  doc.fontSize(12);
  doc.moveDown();
  
  doc.text('One (1) 60 minute sound check/rehearsal for the BAND and the ARTIST is required.');
  doc.moveDown();
  
  doc.text('TRANSPORTATION: Unless otherwise negotiated with SERVICE PROVIDER, CLIENT shall schedule ground transportation rides for ARTIST, BAND and SERVICE PROVIDER, so that they arrive at VENUE a minimum of thirty (30) minutes before rehearsal begins and a minimum of sixty (60) minutes before performance.');
  doc.moveDown();
  
  doc.text('MERCHANDISE: CLIENT agrees to make provision for ARTIST/SERVICE PROVIDER, if possible, to sell PERFORMANCE-related merchandise, where ARTIST has the option to greet audience following performance, to take photos, conduct interviews, and autographs, as possible.');
  doc.moveDown(2);
}

function addPaymentAndLegalTerms(doc: PDFKit.PDFDocument, data: TechnicalRiderData): void {
  doc.addPage();
  
  doc.fontSize(14).text('CONTRACT DURATION AND PREPARATION', { underline: true });
  doc.fontSize(12);
  doc.moveDown();
  
  doc.text(`The SERVICE PROVIDER will instruct ARTIST and BAND to begin preparation for performance from ${data.contractDate} and will perform on ${data.contractEndDate} from ${data.performanceTime}.`);
  doc.moveDown(2);
  
  doc.fontSize(14).text('PAYMENT', { underline: true });
  doc.fontSize(12);
  doc.moveDown();
  
  doc.text(`The CLIENT will pay the SERVICE PROVIDER a sum of ${data.pricingTableTotal}. Of this, the CLIENT will pay the SERVICE PROVIDER a 50% deposit, before PERFORMANCE begins. In case of cancelation of the EVENT by CLIENT, CLIENT shall be liable to pay the SERVICE PROVIDER a minimum of 25% of the total PERFORMANCE COST if the cancellation occurs prior to two weeks before ${data.contractEndDate}, and the full 50% deposit if the cancellation occurs within a two week window prior to ${data.contractEndDate}.`);
  doc.moveDown();
  
  if (data.pricingTable) {
    doc.text(data.pricingTable);
    doc.moveDown();
  }
  
  doc.text(`The SERVICE PROVIDER will invoice the CLIENT prior to ${data.contractEndDate}.`);
  doc.moveDown();
  
  doc.text(`The CLIENT agrees to pay the SERVICE PROVIDER in full within 7 days of receiving the invoice or by the ${data.contractEndDate}, whichever is sooner. Payment after that date will incur a late fee of $500 per month.`);
  doc.moveDown(2);
  
  // Legal terms
  addLegalTerms(doc);
  
  // Signature section
  addTechnicalRiderSignatures(doc);
}

function addLegalTerms(doc: PDFKit.PDFDocument): void {
  doc.fontSize(14).text('LEGAL TERMS', { underline: true });
  doc.fontSize(12);
  doc.moveDown();
  
  const legalTerms = [
    {
      title: 'OWNERSHIP AND AUTHORSHIP',
      content: 'Ownership: The CLIENT owns all PERFORMANCE (excluding any inherent intellectual property rights of the SERVICE PROVIDER or ARTIST for example song copyrights) once the CLIENT has paid the SERVICE PROVIDER in full.\n\nAuthorship: The CLIENT agrees the SERVICE PROVIDER may showcase the PERFORMANCE in the SERVICE PROVIDER or ARTIST\'s portfolio and in websites, printed literature and other media for the purpose of recognition.'
    },
    {
      title: 'CONFIDENTIALITY AND NON-DISCLOSURE',
      content: 'Each party confirms to the other party that it will not share information that is marked confidential and non-public with a third party, unless the disclosing party gives written permission first. Each party must continue to follow these obligations, even after the Agreement ends.'
    },
    {
      title: 'REPRESENTATIONS',
      content: 'Each party confirms to the other party that it has the authority to enter into and perform all of its obligations under this Agreement.'
    },
    {
      title: 'TERM AND TERMINATION',
      content: 'Either party may end this Agreement at any time and for any reason, by providing 14 days\' written notice.\n\nThe CLIENT will pay the SERVICE PROVIDER for all work that has been completed when the Agreement ends and shall immediately reimburse the SERVICE PROVIDER for any prior event-related expenses.'
    },
    {
      title: 'LIMITATION OF LIABILITY',
      content: 'The PERFORMANCE is presented "as is" and the SERVICE PROVIDER\'s maximum liability is the total sum paid by the CLIENT to the SERVICE PROVIDER under this Agreement.'
    },
    {
      title: 'INDEMNITY',
      content: 'The CLIENT agrees to indemnify, save and hold harmless the SERVICE PROVIDER and ARTIST and BAND from any and all damages, liabilities, costs, losses or expenses arising out of any claim, demand, or action by a third party as a result of the work the SERVICE PROVIDER, ARTIST, and BAND has done under this Agreement.'
    }
  ];
  
  legalTerms.forEach(term => {
    doc.fontSize(12).text(term.title, { underline: true });
    doc.fontSize(11);
    doc.text(term.content);
    doc.moveDown();
  });
}

function addTechnicalRiderSignatures(doc: PDFKit.PDFDocument): void {
  doc.moveDown(2);
  doc.fontSize(12);
  doc.text('SIGNATURE PAGE', { underline: true });
  doc.moveDown(2);
  
  doc.text('CLIENT Representative: ___________________________ Date: ___________');
  doc.moveDown();
  doc.text('Print Name: ___________________________');
  doc.moveDown();
  doc.text('Title: ___________________________');
  doc.moveDown(3);
  
  doc.text('SERVICE PROVIDER Representative: ___________________________ Date: ___________');
  doc.moveDown();
  doc.text('Print Name: ___________________________');
  doc.moveDown();
  doc.text('Title: ___________________________');
  doc.moveDown(3);
  
  doc.text('ARTIST: ___________________________ Date: ___________');
  doc.moveDown();
  doc.text('Print Name: ___________________________');
  doc.moveDown(2);
  
  doc.fontSize(10);
  doc.text('This technical rider is an integral part of the performance agreement and supersedes all prior technical requirements and understandings between the parties.');
}

export function getMixerInputPatchList(): Array<{channel: number; input: string}> {
  return [
    { channel: 1, input: 'Kick In' },
    { channel: 2, input: 'Kick Out' },
    { channel: 3, input: 'Snare Top' },
    { channel: 4, input: 'Snare Bottom' },
    { channel: 5, input: 'Hi Hat' },
    { channel: 6, input: 'Rack Tom 1' },
    { channel: 7, input: 'Rack Tom 2' },
    { channel: 8, input: 'Rack Tom 3 / Floor Tom' },
    { channel: 9, input: 'Over Head Left' },
    { channel: 10, input: 'Over Head Right' },
    { channel: 11, input: 'Bass DI' },
    { channel: 12, input: 'Bass Mic' },
    { channel: 13, input: 'Guitar 1' },
    { channel: 14, input: 'Guitar 2' },
    { channel: 15, input: 'Percussion – Electric Floor Tom' },
    { channel: 16, input: 'Percussion – Cow Bell' },
    { channel: 17, input: 'Keyboard 1 – Left' },
    { channel: 18, input: 'Keyboard 1 – Right' },
    { channel: 19, input: 'Keyboard 2 – Left' },
    { channel: 20, input: 'Keyboard 2 – Right' },
    { channel: 21, input: 'Keyboard 3 – Left' },
    { channel: 22, input: 'Keyboard 3 – Right' },
    { channel: 23, input: 'Keyboard 4 – Left' },
    { channel: 24, input: 'Keyboard 4 – Right' },
    { channel: 25, input: 'Brass' },
    { channel: 26, input: 'Brass' },
    { channel: 27, input: 'Brass' },
    { channel: 28, input: 'Brass' },
    { channel: 29, input: 'Brass' },
    { channel: 30, input: 'Brass' },
    { channel: 31, input: 'Brass' },
    { channel: 32, input: 'Brass' },
    { channel: 33, input: 'Background Vocals 1' },
    { channel: 34, input: 'Background Vocals 2' },
    { channel: 35, input: 'Background Vocals 3' },
    { channel: 36, input: 'Lead Vox – Spare' },
    { channel: 37, input: 'Lead Vox' }
  ];
}