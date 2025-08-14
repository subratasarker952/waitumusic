/**
 * Financial Records & Payment System
 * Comprehensive financial tracking, payment requests, and vouchers
 */

import { db } from "./db";
import * as schema from "@shared/schema";
import { eq, and, desc, sum, gte, lte } from "drizzle-orm";

export interface PaymentRequest {
  id?: number;
  artistUserId: number;
  bookingId?: number;
  amount: number;
  currency: string;
  description: string;
  category: 'performance_fee' | 'royalties' | 'merchandise' | 'licensing' | 'other';
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  requestedDate: Date;
  approvedDate?: Date;
  paidDate?: Date;
  approvedBy?: number;
  paymentMethod?: string;
  invoiceNumber?: string;
  notes?: string;
}

export interface PaymentVoucher {
  id?: number;
  paymentRequestId: number;
  voucherNumber: string;
  amount: number;
  currency: string;
  issuedDate: Date;
  issuedBy: number;
  recipientName: string;
  recipientAccount: string;
  description: string;
  status: 'issued' | 'processed' | 'cancelled';
}

export interface FinancialRecord {
  id?: number;
  userId: number;
  transactionType: 'income' | 'expense' | 'refund';
  amount: number;
  currency: string;
  description: string;
  category: string;
  date: Date;
  bookingId?: number;
  paymentMethod: string;
  referenceNumber?: string;
  taxAmount?: number;
  netAmount?: number;
  status: 'pending' | 'completed' | 'cancelled';
}

export class FinancialSystem {
  
  static async createPaymentRequest(request: Omit<PaymentRequest, 'id'>): Promise<PaymentRequest> {
    const [newRequest] = await db
      .insert(schema.paymentRequests)
      .values({
        ...request,
        requestedDate: new Date(),
        status: 'pending'
      })
      .returning();
    
    return newRequest as PaymentRequest;
  }

  static async approvePaymentRequest(requestId: number, approvedBy: number, notes?: string): Promise<void> {
    await db
      .update(schema.paymentRequests)
      .set({
        status: 'approved',
        approvedDate: new Date(),
        approvedBy,
        notes
      })
      .where(eq(schema.paymentRequests.id, requestId));
  }

  static async generatePaymentVoucher(paymentRequestId: number, issuedBy: number): Promise<PaymentVoucher> {
    // Get payment request details
    const [paymentRequest] = await db
      .select()
      .from(schema.paymentRequests)
      .where(eq(schema.paymentRequests.id, paymentRequestId))
      .limit(1);

    if (!paymentRequest || paymentRequest.status !== 'approved') {
      throw new Error('Payment request not found or not approved');
    }

    // Get artist details
    const [artist] = await db
      .select({
        fullName: schema.artists.fullName,
        stageName: schema.artists.stageName,
        bankAccount: schema.artists.bankAccount
      })
      .from(schema.artists)
      .where(eq(schema.artists.userId, paymentRequest.artistUserId))
      .limit(1);

    const voucherNumber = `WM-${Date.now()}-${paymentRequestId}`;
    
    const [voucher] = await db
      .insert(schema.paymentVouchers)
      .values({
        paymentRequestId,
        voucherNumber,
        amount: paymentRequest.amount,
        currency: paymentRequest.currency,
        issuedDate: new Date(),
        issuedBy,
        recipientName: artist?.stageName || artist?.fullName || 'Unknown Artist',
        recipientAccount: artist?.bankAccount || 'Not provided',
        description: paymentRequest.description,
        status: 'issued'
      })
      .returning();

    return voucher as PaymentVoucher;
  }

  static async recordFinancialTransaction(record: Omit<FinancialRecord, 'id'>): Promise<FinancialRecord> {
    const [newRecord] = await db
      .insert(schema.financialRecords)
      .values({
        ...record,
        date: new Date(),
        status: 'completed'
      })
      .returning();
    
    return newRecord as FinancialRecord;
  }

  static async getUserFinancialSummary(userId: number, startDate?: Date, endDate?: Date) {
    const conditions = [eq(schema.financialRecords.userId, userId)];
    
    if (startDate) {
      conditions.push(gte(schema.financialRecords.date, startDate));
    }
    if (endDate) {
      conditions.push(lte(schema.financialRecords.date, endDate));
    }

    const records = await db
      .select()
      .from(schema.financialRecords)
      .where(and(...conditions))
      .orderBy(desc(schema.financialRecords.date));

    const summary = {
      totalIncome: 0,
      totalExpenses: 0,
      netAmount: 0,
      pendingPayments: 0,
      recordCount: records.length,
      records
    };

    records.forEach(record => {
      if (record.transactionType === 'income') {
        summary.totalIncome += record.amount;
      } else if (record.transactionType === 'expense') {
        summary.totalExpenses += record.amount;
      }
    });

    summary.netAmount = summary.totalIncome - summary.totalExpenses;

    // Get pending payment requests
    const pendingRequests = await db
      .select({ amount: schema.paymentRequests.amount })
      .from(schema.paymentRequests)
      .where(
        and(
          eq(schema.paymentRequests.artistUserId, userId),
          eq(schema.paymentRequests.status, 'pending')
        )
      );

    summary.pendingPayments = pendingRequests.reduce((sum, req) => sum + req.amount, 0);

    return summary;
  }

  static async getPaymentHistory(userId: number, limit = 50) {
    return await db
      .select({
        id: schema.paymentRequests.id,
        amount: schema.paymentRequests.amount,
        currency: schema.paymentRequests.currency,
        description: schema.paymentRequests.description,
        status: schema.paymentRequests.status,
        requestedDate: schema.paymentRequests.requestedDate,
        approvedDate: schema.paymentRequests.approvedDate,
        paidDate: schema.paymentRequests.paidDate,
        category: schema.paymentRequests.category
      })
      .from(schema.paymentRequests)
      .where(eq(schema.paymentRequests.artistUserId, userId))
      .orderBy(desc(schema.paymentRequests.requestedDate))
      .limit(limit);
  }

  static async processPaymentVoucher(voucherId: number, processedBy: number): Promise<void> {
    await db.transaction(async (tx) => {
      // Update voucher status
      await tx
        .update(schema.paymentVouchers)
        .set({ status: 'processed' })
        .where(eq(schema.paymentVouchers.id, voucherId));

      // Get voucher details
      const [voucher] = await tx
        .select()
        .from(schema.paymentVouchers)
        .where(eq(schema.paymentVouchers.id, voucherId))
        .limit(1);

      if (voucher) {
        // Update corresponding payment request
        await tx
          .update(schema.paymentRequests)
          .set({ 
            status: 'paid',
            paidDate: new Date()
          })
          .where(eq(schema.paymentRequests.id, voucher.paymentRequestId));
      }
    });
  }
}