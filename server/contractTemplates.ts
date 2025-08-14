import PDFKit from 'pdfkit';

export interface ContractData {
  contractType: 'publisher' | 'representation' | 'full_management' | 'professional_services';
  artistFullName: string;
  artistStageName?: string;
  artistAddress: string;
  artistPRO?: string;
  artistIPI?: string;
  contractDate: string;
  termLength: string;
  commission: string;
  postTermCommission?: string;
  professionalType?: 'legal' | 'marketing' | 'business' | 'financial' | 'brand';
  serviceCategory?: string;
}

export function generateContract(data: ContractData): PDFKit.PDFDocument {
  const doc = new PDFKit({
    margin: 50,
    size: 'A4'
  });

  switch (data.contractType) {
    case 'publisher':
      return generatePublishingContract(doc, data);
    case 'representation':
      return generateAdministrationContract(doc, data);
    case 'full_management':
      return generateManagementContract(doc, data);
    case 'professional_services':
      return generateProfessionalServicesContract(doc, data);
    default:
      throw new Error(`Unknown contract type: ${data.contractType}`);
  }
}

function generatePublishingContract(doc: PDFKit.PDFDocument, data: ContractData): PDFKit.PDFDocument {
  // Header
  doc.fontSize(16).text('SONG PUBLISHING AGREEMENT', { align: 'center' });
  doc.moveDown(2);

  // Date
  doc.fontSize(12).text(`THIS AGREEMENT IS MADE ON:`);
  doc.text(`${data.contractDate}`);
  doc.moveDown();

  // Parties
  doc.text('THE PARTIES ARE:');
  doc.moveDown();
  
  doc.text('1. Wai\'tuMusic having its registered office at C/o Krystallion Incorporated, 31 Bath Estate, P.O. Box 1350, Roseau, Dominica: (the "Publisher")');
  doc.moveDown();
  
  doc.text(`2. ${data.artistFullName}, of ${data.artistAddress},`);
  if (data.artistPRO) {
    doc.text(`(PRO) ${data.artistPRO},`);
  }
  if (data.artistIPI) {
    doc.text(`(IPI Number) ${data.artistIPI}`);
  }
  doc.text(': (the "Writer")');
  doc.moveDown();

  // Key terms section
  doc.fontSize(14).text('KEY TERMS', { underline: true });
  doc.fontSize(12);
  doc.moveDown();
  doc.text('• Publisher Commission: 10% of Net Receipts');
  doc.text('• Writer Royalty: 90% of Net Receipts');
  doc.text(`• Term: ${data.termLength}`);
  doc.text('• Territory: The World');
  doc.text('• Rights: Music publishing administration rights only');
  doc.moveDown();

  // Add signature section
  addSignatureSection(doc, 'Publisher', 'Writer');

  return doc;
}

function generateAdministrationContract(doc: PDFKit.PDFDocument, data: ContractData): PDFKit.PDFDocument {
  // Header
  doc.fontSize(16).text('ADMINISTRATION AGREEMENT', { align: 'center' });
  doc.moveDown(2);

  // Date
  doc.fontSize(12).text(`AN AGREEMENT made on (DATE): ${data.contractDate}`);
  doc.moveDown();

  // Parties
  doc.text('BETWEEN:');
  doc.moveDown();
  
  doc.text('(A) Wai\'tuMusic C/o Krystallion Incorporated, P.O. Box 1350, Roseau, Dominica -');
  doc.text('(Hereinafter referred to as "Administration")');
  doc.moveDown();
  
  doc.text('and');
  doc.moveDown();
  
  doc.text('(B)');
  doc.text(`[Artist Full Name]: ${data.artistFullName}`);
  doc.moveDown();
  
  if (data.artistStageName) {
    doc.text('professionally known as');
    doc.text(`[Artist Stage Name(s)]: ${data.artistStageName}`);
    doc.moveDown();
  }
  
  doc.text(`of [Artist Address]: ${data.artistAddress}`);
  doc.moveDown();
  
  if (data.artistPRO && data.artistIPI) {
    doc.text(`and [Artist PRO / IPI Number]: ${data.artistPRO} / ${data.artistIPI}`);
    doc.moveDown();
  }
  
  doc.text('(Hereinafter referred to as "Artist")');
  doc.moveDown(2);

  // Key terms section
  doc.fontSize(14).text('KEY TERMS', { underline: true });
  doc.fontSize(12);
  doc.moveDown();
  doc.text('• Administration Commission: 25% of Gross Earnings after Authorized Expenses');
  doc.text('• Artist Fee: 75% of Gross Earnings after Authorized Expenses');
  doc.text(`• Term: ${data.termLength}`);
  doc.text('• Territory: The World');
  doc.text('• Post-Term Commission: 25% for life of contracts secured during term');
  doc.text('• Services: Career development, deal negotiation, professional guidance');
  doc.moveDown();

  // Add signature section
  addSignatureSection(doc, 'Administration', 'Artist');

  return doc;
}

function generateManagementContract(doc: PDFKit.PDFDocument, data: ContractData): PDFKit.PDFDocument {
  // Header
  doc.fontSize(16).text('MANAGEMENT AGREEMENT', { align: 'center' });
  doc.moveDown(2);

  // Date
  doc.fontSize(12).text(`AN AGREEMENT made on (DATE): ${data.contractDate}`);
  doc.moveDown();

  // Parties
  doc.text('BETWEEN:');
  doc.moveDown();
  
  doc.text('(A) Wai\'tuMusic C/o Krystallion Incorporated, P.O. Box 1350, Roseau, Dominica -');
  doc.text('(Hereinafter referred to as "Management")');
  doc.moveDown();
  
  doc.text('and');
  doc.moveDown();
  
  doc.text('(B)');
  doc.text(`(Artist Full Name): ${data.artistFullName}`);
  doc.moveDown();
  
  if (data.artistStageName) {
    doc.text('professionally known as');
    doc.text(`(Artist Stage Name(s)): ${data.artistStageName}`);
    doc.moveDown();
  }
  
  doc.text(`of (Artist Address): ${data.artistAddress}`);
  doc.moveDown();
  
  if (data.artistPRO && data.artistIPI) {
    doc.text(`and (Artist PRO / IPI Number): ${data.artistPRO} / ${data.artistIPI}`);
    doc.moveDown();
  }
  
  doc.text('(Hereinafter referred to as "Artist")');
  doc.moveDown(2);

  // Key terms section
  doc.fontSize(14).text('KEY TERMS', { underline: true });
  doc.fontSize(12);
  doc.moveDown();
  doc.text('• Management Commission: 25% of Gross Earnings after Authorized Expenses');
  doc.text('• Artist Fee: 75% of Gross Earnings after Authorized Expenses');
  doc.text(`• Term: ${data.termLength} (auto-renewable)`);
  doc.text('• Territory: The World');
  doc.text('• Post-Term Commission: 12.5% for life of contracts secured during term');
  doc.text('• Services: Exclusive personal music business representation and full management');
  doc.text('• Exclusivity: Artist provides exclusive services to Management');
  doc.moveDown();

  // Add signature section
  addSignatureSection(doc, 'Management', 'Artist');

  return doc;
}

function generateProfessionalServicesContract(doc: PDFKit.PDFDocument, data: ContractData): PDFKit.PDFDocument {
  // Header
  doc.fontSize(16).text('PROFESSIONAL SERVICES MANAGEMENT AGREEMENT', { align: 'center' });
  doc.moveDown(2);

  // Date
  doc.fontSize(12).text(`THIS AGREEMENT IS MADE ON:`);
  doc.text(`${data.contractDate}`);
  doc.moveDown();

  // Parties
  doc.text('THE PARTIES ARE:');
  doc.moveDown();
  
  doc.text('1. Wai\'tuMusic having its registered office at C/o Krystallion Incorporated, 31 Bath Estate, P.O. Box 1350, Roseau, Dominica: (the "Company")');
  doc.moveDown();
  
  doc.text(`2. ${data.artistFullName}, of ${data.artistAddress},`);
  doc.text(`Professional specializing in ${data.serviceCategory || 'Professional Services'}: (the "Professional")`);
  doc.moveDown();

  // Service-specific terms based on professional type
  doc.fontSize(14).text('SCOPE OF SERVICES', { underline: true });
  doc.fontSize(12);
  doc.moveDown();
  
  const serviceTerms = getProfessionalServiceTerms(data.professionalType || 'business');
  doc.text(serviceTerms.scope);
  doc.moveDown();

  // Key terms section
  doc.fontSize(14).text('KEY TERMS', { underline: true });
  doc.fontSize(12);
  doc.moveDown();
  doc.text(`• Service Commission: ${data.commission} of Service Fees`);
  doc.text(`• Professional Retention: ${100 - parseInt(data.commission)}% of Service Fees`);
  doc.text(`• Term: ${data.termLength}`);
  doc.text('• Territory: The World');
  doc.text('• Service Category: Non-Performance Professional Services');
  doc.moveDown();

  // Professional obligations
  doc.fontSize(14).text('PROFESSIONAL OBLIGATIONS', { underline: true });
  doc.fontSize(12);
  doc.moveDown();
  doc.text(serviceTerms.obligations);
  doc.moveDown();

  // Add signature section
  addSignatureSection(doc, 'Company Representative', 'Professional');

  return doc;
}

function getProfessionalServiceTerms(professionalType: string) {
  const terms = {
    legal: {
      scope: 'The Professional shall provide legal counsel services including but not limited to contract review, intellectual property protection, rights management, legal compliance guidance, and representation in music industry legal matters.',
      obligations: '• Maintain attorney-client privilege and confidentiality\n• Provide competent legal representation\n• Avoid conflicts of interest with Company clients\n• Submit timely legal opinions and documentation\n• Maintain professional licensing and continuing education'
    },
    marketing: {
      scope: 'The Professional shall provide marketing and promotional services including digital marketing strategy, social media management, brand development, public relations campaign management, and audience engagement optimization.',
      obligations: '• Develop and execute comprehensive marketing strategies\n• Monitor and report on campaign performance metrics\n• Maintain brand consistency across all promotional materials\n• Coordinate with artists and management for marketing initiatives\n• Stay current with digital marketing trends and platform changes'
    },
    business: {
      scope: 'The Professional shall provide business consulting services including strategic planning, revenue optimization, partnership development, market analysis, and business development guidance for music industry participants.',
      obligations: '• Conduct thorough market analysis and competitive research\n• Develop sustainable business strategies and revenue models\n• Identify and facilitate strategic partnership opportunities\n• Provide regular business performance reports and recommendations\n• Maintain confidentiality of all business information and strategies'
    },
    financial: {
      scope: 'The Professional shall provide financial consulting services including financial planning, revenue analysis, tax strategy, investment guidance, royalty management, and accounting services for music industry professionals.',
      obligations: '• Maintain accurate financial records and reporting\n• Monitor revenue streams and royalty collections\n• Provide tax planning and compliance guidance\n• Develop investment and savings strategies\n• Ensure compliance with financial regulations and reporting requirements'
    },
    brand: {
      scope: 'The Professional shall provide brand management services including visual identity development, content strategy, image consulting, public relations, and brand positioning for artists and music industry professionals.',
      obligations: '• Develop comprehensive brand identity and style guidelines\n• Create and manage content strategies across multiple platforms\n• Monitor public perception and manage reputation\n• Coordinate public relations activities and media interactions\n• Ensure brand consistency across all touchpoints and communications'
    }
  };

  return terms[professionalType as keyof typeof terms] || terms.business;
}

function addSignatureSection(doc: PDFKit.PDFDocument, party1: string, party2: string): void {
  doc.addPage();
  
  doc.fontSize(12).text('IN WITNESS WHEREOF, the parties hereto have executed this Agreement the day and year herein above first written:');
  doc.moveDown(2);

  // Party 1 signature section
  doc.text(`("${party1}")`);
  doc.moveDown();
  doc.text('_________________________  ____________________  ____________________');
  doc.text('Full Name                  Signature            Date');
  doc.moveDown(2);

  doc.text('("Witness")');
  doc.moveDown();
  doc.text('_________________________  ____________________  ____________________');
  doc.text('Full Name                  Signature            Date');
  doc.moveDown(3);

  // Party 2 signature section
  doc.text(`("${party2}")`);
  doc.moveDown();
  doc.text('_________________________  ____________________  ____________________');
  doc.text('Full Name                  Signature            Date');
  doc.moveDown(2);

  doc.text('("Witness")');
  doc.moveDown();
  doc.text('_________________________  ____________________  ____________________');
  doc.text('Full Name                  Signature            Date');
  doc.moveDown(2);

  // Legal notice for minors
  doc.fontSize(10).text('Note: Minors. If a minor (a person under 18 years old) enters into a contract, that person can "disaffirm" (void the contract) this Agreement at any time while he or she is a minor unless a contract is held to be for items necessary for life. As it\'s likely this isn\'t such a contract, the parents of a minor should co-sign this Agreement to make it legally valid. They are then bound by its terms.');
}

export function getContractTypeFromTier(tierId: number): ContractData['contractType'] {
  switch (tierId) {
    case 1: return 'publisher';
    case 2: return 'representation';  
    case 3: return 'full_management';
    default: throw new Error(`Invalid tier ID: ${tierId}`);
  }
}

export function getTierCommissions(tierId: number): { commission: string; postTermCommission?: string } {
  switch (tierId) {
    case 1: // Publisher
      return { commission: '10%' };
    case 2: // Representation (Administration)
      return { commission: '25%', postTermCommission: '25%' };
    case 3: // Full Management
      return { commission: '25%', postTermCommission: '12.5%' };
    default:
      throw new Error(`Invalid tier ID: ${tierId}`);
  }
}