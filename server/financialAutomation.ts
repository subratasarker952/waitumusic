import { db } from "./db";
import {
  bookings, invoices, payoutRequests, documentLinkages,
  paymentTransactions, financialAuditLog, payments, receipts,
  users, artists, bookingAssignments,
  type InsertInvoice, type InsertPayoutRequest, type InsertDocumentLinkage,
  type InsertPaymentTransaction, type InsertFinancialAuditLog,
  contractSignatures,
  contracts
} from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export class FinancialAutomationService {
  // Generate unique invoice number
  private async generateInvoiceNumber(prefix: string = 'INV'): Promise<string> {
    const count = await db
      .select({ count: invoices.id })
      .from(invoices)
      .then(result => result.length);

    const year = new Date().getFullYear();
    const paddedCount = String(count + 1).padStart(6, '0');
    return `${prefix}-${year}-${paddedCount}`;
  }

  private async generatePerformerInvoiceNumber(userId: number, bookingId: number): Promise<string> {
    try {
      // Count existing invoices for this booking
      const countResult = await db
        .select()
        .from(invoices)
        .where(eq(invoices.bookingId, bookingId))
        .then((results) => results.length);

      const nextCount = countResult + 1;

      // Pad count with zeros (e.g., 1 → "00001")
      const countStr = String(nextCount).padStart(5, "0");

      // Build invoice number
      const invoiceNumber = `INV-${userId}-${bookingId}-${countStr}`;

      return invoiceNumber;
    } catch (error) {
      console.error("❌ generateInvoiceNumber error:", error);
      throw error;
    }
  }


  async generatePerformerInvoice(
    contract: any,
    triggeredByUserId: number
  ): Promise<number> {
    try {
      const bookingId = contract.bookingId;
  
      // Generate invoice number
      const invoiceNumber = await this.generatePerformerInvoiceNumber(
        contract.assignedToUserId,
        bookingId
      );
  
      // Fetch booking details
      const booking = await db
        .select()
        .from(bookings)
        .where(eq(bookings.id, bookingId))
        .limit(1)
        .then((res) => res[0]);
  
      if (!booking) {
        throw new Error(`Booking ${bookingId} not found`);
      }
  
      // Fetch performer details
      const performer = await db
        .select()
        .from(users)
        .where(eq(users.id, contract.assignedToUserId))
        .limit(1)
        .then((res) => res[0]);
  
      if (!performer) {
        throw new Error(`Performer ${contract.assignedToUserId} not found`);
      }
  
      // Safely extract feeAmount from contract content
      const feeAmount =
        parseFloat(
          contract.content?.individualPricing?.[contract.assignedToUserId]?.toString() ||
            "0"
        ) || 0;
  
      const lineItems = [
        {
          description: `Performance Fee for Booking #${bookingId} (${booking.eventName})`,
          quantity: 1,
          rate: feeAmount.toString(),
          amount: feeAmount.toString(),
        },
      ];
  
      const subtotalAmount = feeAmount;
      const taxAmount = 0; // Adjust if tax applies
      const totalAmount = subtotalAmount + taxAmount;
  
      // Insert invoice record
      const [invoice] = await db
        .insert(invoices)
        .values({
          bookingId,
          invoiceNumber,
          invoiceType: "final",
          issuerName: "Wai'tuMusic",
          issuerAddress: "123 Music Lane, Sound City, SC 12345",
          issuerTaxId: "TAX-123456789",
          recipientName: performer.fullName,
          recipientAddress: "",
          recipientTaxId: null,
          lineItems,
          subtotalAmount: subtotalAmount.toString(),
          taxAmount: taxAmount.toString(),
          totalAmount: totalAmount.toString(),
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Net 30
          paymentTerms: "Net 30",
          status: "pending",
          triggeredBy: "contract_signature",
          triggeredByUserId,
          generatedAt: new Date(),
        })
        .returning();
  
      if (!invoice) {
        throw new Error("Invoice creation failed");
      }
  
      // Generate PDF
      await this.generateInvoicePDF(invoice.id);
  
      console.log(
        `✅ Performer Invoice #${invoice.invoiceNumber} created for contract ${contract.id}`
      );
      return invoice.id;
    } catch (error) {
      console.error("❌ generatePerformerInvoice error:", error);
      throw error;
    }
  }
  

  // Generate unique payout request number
  private async generatePayoutRequestNumber(): Promise<string> {
    const count = await db
      .select({ count: payoutRequests.id })
      .from(payoutRequests)
      .then(result => result.length);

    const year = new Date().getFullYear();
    const paddedCount = String(count + 1).padStart(6, '0');
    return `PAYOUT-${year}-${paddedCount}`;
  }

  // Create financial audit log entry
  private async createAuditLog(
    entityType: string,
    entityId: number,
    actionType: string,
    actionDescription: string,
    performedByUserId?: number,
    performedBySystem: boolean = true,
    previousValues?: any,
    newValues?: any
  ): Promise<void> {
    const auditData: InsertFinancialAuditLog = {
      entityType,
      entityId,
      actionType,
      actionDescription,
      performedByUserId,
      performedBySystem,
      previousValues,
      newValues,
      ipAddress: null,
      userAgent: null
    };

    await db.insert(financialAuditLog).values(auditData);
  }

  // Create document linkage
  private async createDocumentLinkage(
    sourceType: string,
    sourceId: number,
    linkedType: string,
    linkedId: number,
    linkageType: string,
    description?: string,
    createdByUserId?: number
  ): Promise<void> {
    const linkageData: InsertDocumentLinkage = {
      sourceDocumentType: sourceType,
      sourceDocumentId: sourceId,
      linkedDocumentType: linkedType,
      linkedDocumentId: linkedId,
      linkageType,
      linkDescription: description,
      createdByUserId
    };

    await db.insert(documentLinkages).values(linkageData);
  }

  // Generate invoice preview/summary for review
  async generateInvoicePreview(bookingId: number): Promise<any> {
    const booking = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, bookingId))
      .then(result => result[0]);

    if (!booking) {
      throw new Error(`Booking ${bookingId} not found`);
    }

    // Calculate amounts
    const subtotalAmount = parseFloat(booking.totalBudget || "0");
    const taxAmount = subtotalAmount * 0.08; // 8% tax
    const totalAmount = subtotalAmount + taxAmount;

    // Determine payment terms
    const paymentTerms = booking.eventType === 'corporate' ? 'Net 30' : 'Due on Receipt';
    const dueDate = paymentTerms === 'Net 30'
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Create line items
    const lineItems = [
      {
        description: `${booking.eventType} Performance - ${booking.eventName}`,
        quantity: 1,
        rate: subtotalAmount,
        amount: subtotalAmount
      }
    ];

    return {
      booking,
      invoiceData: {
        invoiceType: 'proforma',
        issuerName: "Wai'tuMusic",
        issuerAddress: "123 Music Lane, Sound City, SC 12345",
        issuerTaxId: "TAX-123456789",
        recipientName: booking.guestName || "Client",
        recipientAddress: booking.venueAddress || "Client Address",
        lineItems,
        subtotalAmount: subtotalAmount.toString(),
        taxAmount: taxAmount.toString(),
        totalAmount: totalAmount.toString(),
        dueDate,
        paymentTerms,
        status: 'draft'
      }
    };
  }

  // Create proforma invoice 
  async createProformaInvoice(
    bookingId: number,
    triggeredByUserId?: number
  ): Promise<number> {
    const booking = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, bookingId))
      .then(result => result[0]);

    if (!booking) {
      throw new Error(`Booking ${bookingId} not found`);
    }

    const invoiceNumber = await this.generateInvoiceNumber('PRO');

    const subtotalAmount = parseFloat(booking.totalBudget || "0");
    const taxAmount = subtotalAmount * 0.08;
    const totalAmount = subtotalAmount + taxAmount;

    const paymentTerms = booking.eventType === 'corporate' ? 'Net 30' : 'Due on Receipt';
    const dueDate = paymentTerms === 'Net 30'
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const lineItems = [
      {
        description: `${booking.eventType} Performance - ${booking.eventName}`,
        quantity: 1,
        rate: subtotalAmount,
        amount: subtotalAmount
      }
    ];

    const invoiceData: InsertInvoice = {
      bookingId,
      invoiceNumber,
      invoiceType: 'proforma',
      issuerName: "Wai'tuMusic",
      issuerAddress: "123 Music Lane, Sound City, SC 12345",
      issuerTaxId: "TAX-123456789",
      recipientName: booking.guestName || "Client",
      recipientAddress: booking.venueAddress || "Client Address",
      recipientTaxId: null,
      lineItems,
      subtotalAmount: subtotalAmount.toString(),
      taxAmount: taxAmount.toString(),
      totalAmount: totalAmount.toString(),
      dueDate,
      paymentTerms,
      status: 'pending',
      triggeredBy: 'manual',
      triggeredByUserId,
      invoiceUrl: null
    };

    const [newInvoice] = await db.insert(invoices).values(invoiceData).returning();

    await this.createAuditLog(
      'invoice',
      newInvoice.id,
      'created',
      `Proforma invoice ${invoiceNumber} created for booking ${bookingId}`,
      triggeredByUserId,
      true,
      null,
      invoiceData
    );

    await this.generateInvoicePDF(newInvoice.id);
    return newInvoice.id;
  }

  // Convert proforma to final invoice when accepted (REDESIGNED: Updates SAME invoice)
  async convertProformaToFinal(
    proformaInvoiceId: number,
    triggeredByUserId?: number
  ): Promise<number> {
    const proformaInvoice = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, proformaInvoiceId))
      .then(result => result[0]);

    if (!proformaInvoice || proformaInvoice.invoiceType !== 'proforma') {
      throw new Error('Proforma invoice not found or invalid type');
    }

    // Generate new final invoice number
    const finalInvoiceNumber = await this.generateInvoiceNumber('INV');

    // Update the SAME invoice from proforma to final
    await db
      .update(invoices)
      .set({
        invoiceNumber: finalInvoiceNumber,
        invoiceType: 'final',
        status: 'pending',
        triggeredBy: 'proforma_acceptance',
        triggeredByUserId,
        convertedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(invoices.id, proformaInvoiceId));

    await this.createAuditLog(
      'invoice',
      proformaInvoiceId,
      'converted',
      `Proforma invoice ${proformaInvoice.invoiceNumber} converted to final invoice ${finalInvoiceNumber}`,
      triggeredByUserId,
      true,
      proformaInvoice,
      { newInvoiceNumber: finalInvoiceNumber, newType: 'final' }
    );

    // Regenerate PDF with final invoice number
    await this.generateInvoicePDF(proformaInvoiceId);
    return proformaInvoiceId; // Return same ID since it's the same invoice
  }

  // Generate PDF for invoice
  // async generateInvoicePDF(invoiceId: number): Promise<string> {
  //   // Get invoice details with booking and user information
  //   const invoice = await db
  //     .select({
  //       invoice: invoices,
  //       booking: bookings,
  //       booker: users
  //     })
  //     .from(invoices)
  //     .leftJoin(bookings, eq(invoices.bookingId, bookings.id))
  //     .leftJoin(users, eq(bookings.bookerUserId, users.id))
  //     .where(eq(invoices.id, invoiceId))
  //     .then(result => result[0]);

  //   if (!invoice) {
  //     throw new Error(`Invoice ${invoiceId} not found`);
  //   }

  //   // Create invoices directory if it doesn't exist
  //   const invoicesDir = path.join(process.cwd(), 'invoices');
  //   if (!fs.existsSync(invoicesDir)) {
  //     fs.mkdirSync(invoicesDir, { recursive: true });
  //   }

  //   const fileName = `invoice_${invoice.invoice.invoiceNumber.replace(/[\/\\:*?"<>|]/g, '_')}.pdf`;
  //   const filePath = path.join(invoicesDir, fileName);

  //   return new Promise((resolve, reject) => {
  //     const doc = new PDFDocument({ margin: 50 });
  //     const stream = fs.createWriteStream(filePath);
  //     doc.pipe(stream);

  //     // Header
  //     doc.fontSize(20).text("Wai'tuMusic", 50, 50);
  //     doc.fontSize(10).text("Music Label Management Platform", 50, 75);
  //     doc.text("123 Music Lane, Sound City, SC 12345", 50, 90);
  //     doc.text("contact@waitumusic.com | (555) 123-MUSIC", 50, 105);

  //     // Invoice Title
  //     doc.fontSize(24).text("INVOICE", 400, 50);
  //     doc.fontSize(12).text(`Invoice #: ${invoice.invoice.invoiceNumber}`, 400, 75);
  //     doc.text(`Date: ${new Date(invoice.invoice.generatedAt).toLocaleDateString()}`, 400, 90);
  //     doc.text(`Due: ${new Date(invoice.invoice.dueDate).toLocaleDateString()}`, 400, 105);

  //     // Bill To Section
  //     doc.fontSize(14).text("Bill To:", 50, 150);
  //     doc.fontSize(12);
  //     doc.text(invoice.invoice.recipientName, 50, 170);
  //     if (invoice.invoice.recipientAddress) {
  //       doc.text(invoice.invoice.recipientAddress, 50, 185);
  //     }
  //     if (invoice.booking?.guestEmail) {
  //       doc.text(invoice.booking.guestEmail, 50, 200);
  //     }

  //     // Event Details
  //     if (invoice.booking) {
  //       doc.fontSize(14).text("Event Details:", 300, 150);
  //       doc.fontSize(12);
  //       doc.text(`Event: ${invoice.booking.eventName}`, 300, 170);
  //       doc.text(`Type: ${invoice.booking.eventType}`, 300, 185);
  //       doc.text(`Date: ${new Date(invoice.booking.eventDate).toLocaleDateString()}`, 300, 200);
  //       doc.text(`Venue: ${invoice.booking.venueName}`, 300, 215);
  //     }

  //     // Line Items Table
  //     const tableTop = 280;
  //     doc.fontSize(12);

  //     // Table Headers
  //     doc.text("Description", 50, tableTop);
  //     doc.text("Qty", 300, tableTop);
  //     doc.text("Rate", 350, tableTop);
  //     doc.text("Amount", 450, tableTop);

  //     // Table Line
  //     doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

  //     // Line Items
  //     let yPosition = tableTop + 30;
  //     const lineItems = invoice.invoice.lineItems as any[];

  //     lineItems.forEach((item, index) => {
  //       doc.text(item.description, 50, yPosition);
  //       doc.text(item.quantity.toString(), 300, yPosition);
  //       doc.text(`$${parseFloat(item.rate).toFixed(2)}`, 350, yPosition);
  //       doc.text(`$${parseFloat(item.amount).toFixed(2)}`, 450, yPosition);
  //       yPosition += 20;
  //     });

  //     // Totals
  //     const totalsTop = yPosition + 30;
  //     doc.text("Subtotal:", 350, totalsTop);
  //     doc.text(`$${parseFloat(invoice.invoice.subtotalAmount).toFixed(2)}`, 450, totalsTop);

  //     if (invoice.invoice.taxAmount) {
  //       doc.text("Tax (8%):", 350, totalsTop + 20);
  //       doc.text(`$${parseFloat(invoice.invoice.taxAmount).toFixed(2)}`, 450, totalsTop + 20);
  //     }

  //     doc.fontSize(14).text("Total:", 350, totalsTop + 40);
  //     doc.text(`$${parseFloat(invoice.invoice.totalAmount).toFixed(2)}`, 450, totalsTop + 40);

  //     // Payment Terms
  //     doc.fontSize(10);
  //     doc.text(`Payment Terms: ${invoice.invoice.paymentTerms}`, 50, totalsTop + 80);
  //     doc.text("Please remit payment by the due date to avoid late fees.", 50, totalsTop + 95);

  //     // Footer
  //     doc.text("Thank you for choosing Wai'tuMusic!", 50, totalsTop + 120);

  //     doc.end();

  //     stream.on('finish', async () => {
  //       // Update invoice with PDF URL
  //       const invoiceUrl = `/api/financial/invoice/${invoiceId}/pdf`;
  //       await db
  //         .update(invoices)
  //         .set({ invoiceUrl, updatedAt: new Date() })
  //         .where(eq(invoices.id, invoiceId));

  //       resolve(filePath);
  //     });

  //     stream.on('error', reject);
  //   });
  // }

  async generateInvoicePDF(invoiceId: number): Promise<string> {
    // Get invoice details with booking, bookingDates, and user information
    const invoice = await db
      .select({
        invoice: invoices,
        booking: bookings,
        booker: users,
        bookingDates: bookingDates
      })
      .from(invoices)
      .leftJoin(bookings, eq(invoices.bookingId, bookings.id))
      .leftJoin(users, eq(bookings.bookerUserId, users.id))
      .leftJoin(bookingDates, eq(bookings.id, bookingDates.bookingId)) // join bookingDates
      .where(eq(invoices.id, invoiceId))
      .then(result => result[0]);
  
    if (!invoice) {
      throw new Error(`Invoice ${invoiceId} not found`);
    }
  
    // Create invoices directory if it doesn't exist
    const invoicesDir = path.join(process.cwd(), 'invoices');
    if (!fs.existsSync(invoicesDir)) {
      fs.mkdirSync(invoicesDir, { recursive: true });
    }
  
    const fileName = `invoice_${invoice.invoice.invoiceNumber.replace(/[\/\\:*?"<>|]/g, '_')}.pdf`;
    const filePath = path.join(invoicesDir, fileName);
  
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);
  
      // Header
      doc.fontSize(20).text("Wai'tuMusic", 50, 50);
      doc.fontSize(10).text("Music Label Management Platform", 50, 75);
      doc.text("123 Music Lane, Sound City, SC 12345", 50, 90);
      doc.text("contact@waitumusic.com | (555) 123-MUSIC", 50, 105);
  
      // Invoice Title
      doc.fontSize(24).text("INVOICE", 400, 50);
      doc.fontSize(12).text(`Invoice #: ${invoice.invoice.invoiceNumber}`, 400, 75);
      doc.text(`Date: ${new Date(invoice.invoice.generatedAt).toLocaleDateString()}`, 400, 90);
      doc.text(`Due: ${new Date(invoice.invoice.dueDate).toLocaleDateString()}`, 400, 105);
  
      // Bill To Section
      doc.fontSize(14).text("Bill To:", 50, 150);
      doc.fontSize(12);
      doc.text(invoice.invoice.recipientName, 50, 170);
      if (invoice.invoice.recipientAddress) {
        doc.text(invoice.invoice.recipientAddress, 50, 185);
      }
      if (invoice.booking?.guestEmail) {
        doc.text(invoice.booking.guestEmail, 50, 200);
      }
  
      // Event Details
      if (invoice.booking) {
        doc.fontSize(14).text("Event Details:", 300, 150);
        doc.fontSize(12);
        doc.text(`Event: ${invoice.booking.eventName}`, 300, 170);
        doc.text(`Type: ${invoice.booking.eventType}`, 300, 185);
  
        // Use bookingDates.eventDate instead of booking.eventDate
        if (invoice.bookingDates?.eventDate) {
          doc.text(
            `Date: ${new Date(invoice.bookingDates.eventDate).toLocaleDateString()}`,
            300,
            200
          );
        }
  
        doc.text(`Venue: ${invoice.booking.venueName}`, 300, 215);
      }
  
      // Line Items Table
      const tableTop = 280;
      doc.fontSize(12);
  
      // Table Headers
      doc.text("Description", 50, tableTop);
      doc.text("Qty", 300, tableTop);
      doc.text("Rate", 350, tableTop);
      doc.text("Amount", 450, tableTop);
  
      // Table Line
      doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();
  
      // Line Items
      let yPosition = tableTop + 30;
      const lineItems = invoice.invoice.lineItems as any[];
  
      lineItems.forEach((item, index) => {
        doc.text(item.description, 50, yPosition);
        doc.text(item.quantity.toString(), 300, yPosition);
        doc.text(`$${parseFloat(item.rate).toFixed(2)}`, 350, yPosition);
        doc.text(`$${parseFloat(item.amount).toFixed(2)}`, 450, yPosition);
        yPosition += 20;
      });
  
      // Totals
      const totalsTop = yPosition + 30;
      doc.text("Subtotal:", 350, totalsTop);
      doc.text(`$${parseFloat(invoice.invoice.subtotalAmount).toFixed(2)}`, 450, totalsTop);
  
      if (invoice.invoice.taxAmount) {
        doc.text("Tax (8%):", 350, totalsTop + 20);
        doc.text(`$${parseFloat(invoice.invoice.taxAmount).toFixed(2)}`, 450, totalsTop + 20);
      }
  
      doc.fontSize(14).text("Total:", 350, totalsTop + 40);
      doc.text(`$${parseFloat(invoice.invoice.totalAmount).toFixed(2)}`, 450, totalsTop + 40);
  
      // Payment Terms
      doc.fontSize(10);
      doc.text(`Payment Terms: ${invoice.invoice.paymentTerms}`, 50, totalsTop + 80);
      doc.text("Please remit payment by the due date to avoid late fees.", 50, totalsTop + 95);
  
      // Footer
      doc.text("Thank you for choosing Wai'tuMusic!", 50, totalsTop + 120);
  
      doc.end();
  
      stream.on('finish', async () => {
        const invoiceUrl = `/api/financial/invoice/${invoiceId}/pdf`;
        await db
          .update(invoices)
          .set({ invoiceUrl, updatedAt: new Date() })
          .where(eq(invoices.id, invoiceId));
  
        resolve(filePath);
      });
  
      stream.on('error', reject);
    });
  }
  

  // 1. Automatic Invoice Generation on Booking Acceptance (Updated for proforma workflow)
  async generateInvoiceOnBookingAcceptance(
    bookingId: number,
    triggeredByUserId?: number
  ): Promise<number> {
    // Get booking details
    const booking = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, bookingId))
      .then(result => result[0]);

    if (!booking) {
      throw new Error(`Booking ${bookingId} not found`);
    }

    // Generate invoice number
    const invoiceNumber = await this.generateInvoiceNumber();

    // Calculate amounts (example logic - can be enhanced)
    const subtotalAmount = parseFloat(booking.totalBudget || "0");
    const taxAmount = subtotalAmount * 0.08; // 8% tax
    const totalAmount = subtotalAmount + taxAmount;

    // Determine payment terms based on booking type
    const paymentTerms = booking.eventType === 'corporate' ? 'Net 30' : 'Due on Receipt';
    const dueDate = paymentTerms === 'Net 30'
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);  // 7 days from now

    // Create line items
    const lineItems = [
      {
        description: `${booking.eventType} Performance - ${booking.eventName}`,
        quantity: 1,
        rate: subtotalAmount,
        amount: subtotalAmount
      }
    ];

    // Create invoice
    const invoiceData: InsertInvoice = {
      bookingId,
      invoiceNumber,
      invoiceType: 'booking_deposit',
      issuerName: "Wai'tuMusic",
      issuerAddress: "123 Music Lane, Sound City, SC 12345",
      issuerTaxId: "TAX-123456789",
      recipientName: booking.guestName || "Client",
      recipientAddress: booking.venueAddress || "Client Address",
      recipientTaxId: null,
      lineItems,
      subtotalAmount: subtotalAmount.toString(),
      taxAmount: taxAmount.toString(),
      totalAmount: totalAmount.toString(),
      dueDate,
      paymentTerms,
      status: 'pending',
      triggeredBy: 'booking_acceptance',
      triggeredByUserId,
      invoiceUrl: null // Will be generated after PDF creation
    };

    const [newInvoice] = await db.insert(invoices).values(invoiceData).returning();

    // Create audit log
    await this.createAuditLog(
      'invoice',
      newInvoice.id,
      'created',
      `Invoice ${invoiceNumber} automatically generated for booking ${bookingId} acceptance`,
      triggeredByUserId,
      true,
      null,
      invoiceData
    );

    // Link invoice to booking
    await this.createDocumentLinkage(
      'booking',
      bookingId,
      'invoice',
      newInvoice.id,
      'generates',
      `Invoice generated from booking acceptance`,
      triggeredByUserId
    );

    // Generate PDF for the invoice
    await this.generateInvoicePDF(newInvoice.id);

    return newInvoice.id;
  }

  // 2. Automatic Payout Request System
  async generatePayoutRequestOnCompletion(
    bookingId: number,
    performerUserId: number,
    requestType: 'performance_fee' | 'milestone_payment' | 'bonus' | 'expense_reimbursement' = 'performance_fee',
    triggeredByUserId?: number
  ): Promise<number> {
    // Get booking details
    const booking = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, bookingId))
      .then(result => result[0]);

    if (!booking) {
      throw new Error(`Booking ${bookingId} not found`);
    }

    // Get performer details
    const performer = await db
      .select()
      .from(users)
      .where(eq(users.id, performerUserId))
      .then(result => result[0]);

    if (!performer) {
      throw new Error(`Performer ${performerUserId} not found`);
    }

    // Generate payout request number
    const requestNumber = await this.generatePayoutRequestNumber();

    // Calculate payout amounts
    const bookingAmount = parseFloat(booking.totalBudget || "0");
    const commissionPercentage = 15.00; // Standard 15% commission
    const baseAmount = bookingAmount * 0.15; // 15% of booking value
    const commissionAmount = baseAmount * (commissionPercentage / 100);
    const netPayoutAmount = baseAmount - commissionAmount;

    // Create payout request
    const payoutData: InsertPayoutRequest = {
      bookingId,
      performerUserId,
      requestNumber,
      requestType,
      baseAmount: baseAmount.toString(),
      commissionPercentage: commissionPercentage.toString(),
      commissionAmount: commissionAmount.toString(),
      netPayoutAmount: netPayoutAmount.toString(),
      currency: 'USD',
      paymentMethod: 'bank_transfer',
      bankDetails: null, // To be provided by performer
      status: 'pending',
      triggeredBy: 'booking_completion',
      triggeredByUserId,
      approvedByUserId: null,
      approvedAt: null,
      processedAt: null,
      paidAt: null,
      declineReason: null,
      notes: `Automatic payout request generated for ${requestType} on booking completion`,
      contractReferenceId: null
    };

    const [newPayoutRequest] = await db.insert(payoutRequests).values(payoutData).returning();

    // Create audit log
    await this.createAuditLog(
      'payout_request',
      newPayoutRequest.id,
      'created',
      `Payout request ${requestNumber} automatically generated for performer ${performerUserId} on booking ${bookingId} completion`,
      triggeredByUserId,
      true,
      null,
      payoutData
    );

    // Link payout request to booking
    await this.createDocumentLinkage(
      'booking',
      bookingId,
      'payout_request',
      newPayoutRequest.id,
      'generates',
      `Payout request generated from booking completion`,
      triggeredByUserId
    );

    return newPayoutRequest.id;
  }

  // 3. Enhanced Payment Transaction Tracking
  async createPaymentTransaction(
    bookingId: number,
    transactionType: 'payment_received' | 'payout_sent' | 'refund_issued' | 'fee_charged',
    amount: number,
    paymentMethod: string,
    invoiceId?: number,
    payoutRequestId?: number,
    gatewayTransactionId?: string
  ): Promise<number> {
    // Calculate fees and net amount
    const platformFeePercentage = 0.05; // 5% platform fee
    const gatewayFeePercentage = 0.029; // 2.9% gateway fee (typical Stripe fee)

    const platformFee = amount * platformFeePercentage;
    const gatewayFee = amount * gatewayFeePercentage;
    const netAmount = amount - platformFee - gatewayFee;

    const transactionData: InsertPaymentTransaction = {
      bookingId,
      invoiceId: invoiceId || null,
      payoutRequestId: payoutRequestId || null,
      transactionType,
      amount: amount.toString(),
      currency: 'USD',
      exchangeRate: null,
      usdEquivalent: amount.toString(), // Same as amount since already in USD
      paymentMethod,
      gatewayTransactionId: gatewayTransactionId || null,
      gatewayReference: null,
      gatewayFee: gatewayFee.toString(),
      platformFee: platformFee.toString(),
      netAmount: netAmount.toString(),
      status: 'pending',
      processedAt: null,
      settledAt: null,
      refundedAt: null,
      disputedAt: null,
      notes: `${transactionType} transaction for booking ${bookingId}`,
      metadata: {
        platformFeePercentage,
        gatewayFeePercentage,
        originalAmount: amount
      }
    };

    const [newTransaction] = await db.insert(paymentTransactions).values(transactionData).returning();

    // Create audit log
    await this.createAuditLog(
      'payment_transaction',
      newTransaction.id,
      'created',
      `Payment transaction created: ${transactionType} of $${amount} for booking ${bookingId}`,
      payoutRequestId,
      true,
      null,
      transactionData
    );

    return newTransaction.id;
  }

  // 4. Receipt-Contract Linkage System
  async linkReceiptToContract(
    receiptId: number,
    contractType: 'booking_agreement' | 'performance_agreement' | 'technical_rider',
    contractId: number,
    createdByUserId?: number
  ): Promise<void> {
    // Link receipt to contract
    await this.createDocumentLinkage(
      'receipt',
      receiptId,
      'contract',
      contractId,
      'fulfills',
      `Receipt fulfills ${contractType} contract obligations`,
      createdByUserId
    );

    // Create audit log
    await this.createAuditLog(
      'document_linkage',
      receiptId,
      'linked',
      `Receipt ${receiptId} linked to ${contractType} contract ${contractId}`,
      createdByUserId,
      false
    );
  }

  // 5. Booking Status Change Trigger System
  async onBookingStatusChange(
    bookingId: number,
    oldStatus: string,
    newStatus: string,
    changedByUserId?: number
  ): Promise<void> {
    // Create audit log for status change
    await this.createAuditLog(
      'booking',
      bookingId,
      'status_changed',
      `Booking status changed from ${oldStatus} to ${newStatus}`,
      changedByUserId,
      false,
      { status: oldStatus },
      { status: newStatus }
    );

    // Handle different status changes
    switch (newStatus) {
      case 'accepted':
        // Automatically generate invoice
        try {
          const invoiceId = await this.generateInvoiceOnBookingAcceptance(bookingId, changedByUserId);
          console.log(`✓ Invoice ${invoiceId} automatically generated for booking ${bookingId} acceptance`);
        } catch (error) {
          console.error(`✗ Failed to generate invoice for booking ${bookingId}:`, error);
        }
        break;

      case 'completed':
        // Generate payout requests for all assigned performers
        try {
          const assignments = await db
            .select()
            .from(bookingAssignments)
            .where(and(
              eq(bookingAssignments.bookingId, bookingId),
              eq(bookingAssignments.isActive, true)
            ));

          for (const assignment of assignments) {
            const payoutId = await this.generatePayoutRequestOnCompletion(
              bookingId,
              assignment.assignedUserId,
              'performance_fee',
              changedByUserId
            );
            console.log(`✓ Payout request ${payoutId} generated for performer ${assignment.assignedUserId}`);
          }
        } catch (error) {
          console.error(`✗ Failed to generate payout requests for booking ${bookingId}:`, error);
        }
        break;

      case 'cancelled':
        // Handle cancellation refunds if needed
        // This could trigger refund transactions
        break;
    }
  }

  // 6. Generate Receipt with Contract Linkage
  async generateReceiptWithLinkage(
    bookingId: number,
    paymentId: number,
    contractIds: number[] = [],
    generatedByUserId?: number
  ): Promise<number> {
    // Get booking and payment details
    const booking = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, bookingId))
      .then(result => result[0]);

    const payment = await db
      .select()
      .from(payments)
      .where(eq(payments.id, paymentId))
      .then(result => result[0]);

    if (!booking || !payment) {
      throw new Error('Booking or payment not found');
    }

    // Generate receipt number
    const receiptCount = await db
      .select({ count: receipts.id })
      .from(receipts)
      .then(result => result.length);

    const year = new Date().getFullYear();
    const receiptNumber = `REC-${year}-${String(receiptCount + 1).padStart(6, '0')}`;

    // Create receipt
    const receiptData = {
      bookingId,
      paymentId,
      receiptNumber,
      receiptUrl: null, // Will be set after PDF generation
      issuerName: "Wai'tuMusic",
      issuerAddress: "123 Music Lane, Sound City, SC 12345",
      recipientName: booking.guestName || "Client",
      recipientAddress: booking.venueAddress || "Client Address",
      itemsBreakdown: [{
        description: `Payment for ${booking.eventName}`,
        amount: payment.amount,
        date: payment.paidAt || new Date()
      }],
      taxAmount: "0.00",
      totalAmount: payment.amount
    };

    const [newReceipt] = await db.insert(receipts).values(receiptData).returning();

    // Link receipt to contracts
    for (const contractId of contractIds) {
      await this.linkReceiptToContract(
        newReceipt.id,
        'booking_agreement', // Default type, can be enhanced
        contractId,
        generatedByUserId
      );
    }

    // Create audit log
    await this.createAuditLog(
      'receipt',
      newReceipt.id,
      'created',
      `Receipt ${receiptNumber} generated with contract linkages`,
      generatedByUserId,
      true,
      null,
      receiptData
    );

    return newReceipt.id;
  }

  // 7. Get Financial Summary for Booking
  async getBookingFinancialSummary(bookingId: number): Promise<any> {
    const [bookingInvoices, bookingPayouts, bookingTransactions, bookingReceipts] = await Promise.all([
      db.select().from(invoices).where(eq(invoices.bookingId, bookingId)),
      db.select().from(payoutRequests).where(eq(payoutRequests.bookingId, bookingId)),
      db.select().from(paymentTransactions).where(eq(paymentTransactions.bookingId, bookingId)),
      db.select().from(receipts).where(eq(receipts.bookingId, bookingId))
    ]);

    return {
      bookingId,
      invoices: bookingInvoices,
      payoutRequests: bookingPayouts,
      transactions: bookingTransactions,
      receipts: bookingReceipts,
      totalInvoiced: bookingInvoices.reduce((sum, inv) => sum + parseFloat(inv.totalAmount), 0),
      totalPayouts: bookingPayouts.reduce((sum, payout) => sum + parseFloat(payout.netPayoutAmount), 0),
      totalTransactions: bookingTransactions.reduce((sum, txn) => sum + parseFloat(txn.amount), 0)
    };
  }
}

// Export singleton instance
export const financialAutomation = new FinancialAutomationService();