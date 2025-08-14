import PDFDocument from 'pdfkit';
import { contractTemplates, fillTemplate } from './contract-templates';

export function generateContractPDF(contractType: string, data: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const chunks: Buffer[] = [];
      
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      
      const template = contractTemplates[contractType as keyof typeof contractTemplates];
      if (!template) {
        throw new Error(`Unknown contract type: ${contractType}`);
      }
      
      // Add header
      doc.fontSize(20).text(template.title, { align: 'center' });
      doc.moveDown();
      
      // Add contract sections
      template.sections.forEach(section => {
        doc.fontSize(14).font('Helvetica-Bold').text(section.title);
        doc.fontSize(12).font('Helvetica').text(fillTemplate(section.content, data));
        doc.moveDown();
      });
      
      // Add signature lines
      doc.moveDown(2);
      doc.fontSize(12).text('Signatures:', { underline: true });
      doc.moveDown();
      
      // Booker signature
      doc.text('_______________________________');
      doc.text('Booker Signature / Date');
      doc.moveDown();
      
      // Talent signatures
      if (data.talent) {
        data.talent.forEach((t: any) => {
          doc.text('_______________________________');
          doc.text(`${t.name} - ${t.role} / Date`);
          doc.moveDown();
        });
      }
      
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

export function generateTechnicalRiderPDF(data: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];
      
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      
      // Header
      doc.fontSize(20).text('Technical Rider', { align: 'center' });
      doc.fontSize(14).text(`Booking #${data.bookingId}`, { align: 'center' });
      doc.moveDown();
      
      // Stage Layout Section
      if (data.stageLayout) {
        doc.fontSize(16).font('Helvetica-Bold').text('Stage Layout');
        doc.fontSize(12).font('Helvetica');
        doc.text(`Stage Dimensions: ${data.stageLayout.stageWidth}ft x ${data.stageLayout.stageDepth}ft`);
        doc.moveDown();
      }
      
      // Channel List
      if (data.channelList && data.channelList.length > 0) {
        doc.fontSize(16).font('Helvetica-Bold').text('Channel List');
        doc.fontSize(10).font('Helvetica');
        
        // Table header
        doc.text('Ch# | Instrument | Performer | Input | Phantom', { continued: false });
        doc.text('----------------------------------------------------');
        
        data.channelList.forEach((ch: any) => {
          doc.text(
            `${String(ch.channel).padEnd(4)} | ${String(ch.instrument).padEnd(15)} | ${String(ch.performer).padEnd(15)} | ${String(ch.inputType).padEnd(6)} | ${ch.phantomPower ? 'Yes' : 'No'}`
          );
        });
        doc.moveDown();
      }
      
      // Audio Requirements
      if (data.audioRequirements) {
        doc.fontSize(16).font('Helvetica-Bold').text('Audio Requirements');
        doc.fontSize(12).font('Helvetica');
        doc.text(`Mixer Channels Required: ${data.audioRequirements.mixerChannels}`);
        doc.text(`Monitor Mixes: ${data.audioRequirements.monitorMixes}`);
        doc.moveDown();
      }
      
      // Hospitality Requirements
      if (data.hospitalityRequirements && data.hospitalityRequirements.length > 0) {
        doc.fontSize(16).font('Helvetica-Bold').text('Hospitality Requirements');
        doc.fontSize(12).font('Helvetica');
        
        data.hospitalityRequirements.forEach((req: any) => {
          doc.text(`• ${req.talentName}: ${req.requirements}`);
        });
        doc.moveDown();
      }
      
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}