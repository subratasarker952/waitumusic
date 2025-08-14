import { db } from "./db";
import { 
  revenueStreams, 
  revenueGoals, 
  revenueForecasts, 
  marketTrends, 
  revenueOptimizations,
  bookings,
  type RevenueStream,
  type RevenueGoal,
  type RevenueForecast,
  type MarketTrend,
  type RevenueOptimization,
  type InsertRevenueStream,
  type InsertRevenueGoal,
  type InsertRevenueForecast,
  type InsertMarketTrend,
  type InsertRevenueOptimization
} from "@shared/schema";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";

interface RevenueMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  revenueByStream: Record<string, number>;
  growthRate: number;
  topPerformingStreams: Array<{ name: string; amount: number; growth: number }>;
}

export class RevenueAnalyticsService {
  // Get revenue metrics for a user
  async getRevenueMetrics(userId: number, timeframe: string): Promise<RevenueMetrics> {
    const timeframeMap: Record<string, number> = {
      '3months': 3,
      '6months': 6,
      '12months': 12,
      '24months': 24,
    };

    const months = timeframeMap[timeframe] || 12;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    // Get revenue streams for the period
    const streams = await db
      .select()
      .from(revenueStreams)
      .where(
        and(
          eq(revenueStreams.artistUserId, userId),
          gte(revenueStreams.dateReceived, startDate),
          eq(revenueStreams.status, 'confirmed')
        )
      )
      .orderBy(desc(revenueStreams.dateReceived));

    // Calculate total revenue
    const totalRevenue = streams.reduce((sum, stream) => sum + parseFloat(stream.usdEquivalent), 0);
    
    // Calculate monthly average
    const monthlyRevenue = totalRevenue / months;

    // Calculate revenue by stream type
    const revenueByStream: Record<string, number> = {};
    streams.forEach(stream => {
      revenueByStream[stream.streamType] = (revenueByStream[stream.streamType] || 0) + parseFloat(stream.usdEquivalent);
    });

    // Calculate growth rate (compared to previous period)
    const prevStartDate = new Date(startDate);
    prevStartDate.setMonth(prevStartDate.getMonth() - months);
    
    const prevStreams = await db
      .select()
      .from(revenueStreams)
      .where(
        and(
          eq(revenueStreams.artistUserId, userId),
          gte(revenueStreams.dateReceived, prevStartDate),
          lte(revenueStreams.dateReceived, startDate),
          eq(revenueStreams.status, 'confirmed')
        )
      );

    const prevTotalRevenue = prevStreams.reduce((sum, stream) => sum + parseFloat(stream.usdEquivalent), 0);
    const growthRate = prevTotalRevenue > 0 ? ((totalRevenue - prevTotalRevenue) / prevTotalRevenue) * 100 : 0;

    // Get top performing streams
    const streamTotals = Object.entries(revenueByStream)
      .map(([name, amount]) => ({ name, amount, growth: 0 }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    return {
      totalRevenue,
      monthlyRevenue,
      yearlyRevenue: totalRevenue * (12 / months),
      revenueByStream,
      growthRate,
      topPerformingStreams: streamTotals,
    };
  }

  // Get revenue streams for a user
  async getRevenueStreams(userId: number, timeframe: string): Promise<RevenueStream[]> {
    const timeframeMap: Record<string, number> = {
      '3months': 3,
      '6months': 6,
      '12months': 12,
      '24months': 24,
    };

    const months = timeframeMap[timeframe] || 12;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    return await db
      .select()
      .from(revenueStreams)
      .where(
        and(
          eq(revenueStreams.artistUserId, userId),
          gte(revenueStreams.dateReceived, startDate)
        )
      )
      .orderBy(desc(revenueStreams.dateReceived));
  }

  // Create revenue stream
  async createRevenueStream(data: InsertRevenueStream): Promise<RevenueStream> {
    const [stream] = await db
      .insert(revenueStreams)
      .values(data)
      .returning();
    return stream;
  }

  // Get revenue goals for a user
  async getRevenueGoals(userId: number): Promise<RevenueGoal[]> {
    return await db
      .select()
      .from(revenueGoals)
      .where(eq(revenueGoals.artistUserId, userId))
      .orderBy(desc(revenueGoals.createdAt));
  }

  // Create revenue goal
  async createRevenueGoal(data: InsertRevenueGoal): Promise<RevenueGoal> {
    const [goal] = await db
      .insert(revenueGoals)
      .values(data)
      .returning();
    return goal;
  }

  // Update goal progress
  async updateGoalProgress(goalId: number, progress: number): Promise<void> {
    await db
      .update(revenueGoals)
      .set({ 
        progress: progress.toString(),
        lastCalculated: new Date(),
        updatedAt: new Date()
      })
      .where(eq(revenueGoals.id, goalId));
  }

  // Get revenue forecasts for a user
  async getRevenueForecasts(userId: number): Promise<RevenueForecast[]> {
    return await db
      .select()
      .from(revenueForecasts)
      .where(eq(revenueForecasts.artistUserId, userId))
      .orderBy(desc(revenueForecasts.createdAt));
  }

  // Generate AI forecast
  async generateForecast(userId: number, forecastType: string, method: string): Promise<RevenueForecast> {
    // Get historical data for AI analysis
    const historicalStreams = await db
      .select()
      .from(revenueStreams)
      .where(
        and(
          eq(revenueStreams.artistUserId, userId),
          eq(revenueStreams.status, 'confirmed')
        )
      )
      .orderBy(desc(revenueStreams.dateReceived));

    // Calculate forecast period
    const forecastPeriod = new Date();
    if (forecastType === 'quarterly') {
      forecastPeriod.setMonth(forecastPeriod.getMonth() + 3);
    } else if (forecastType === 'yearly') {
      forecastPeriod.setFullYear(forecastPeriod.getFullYear() + 1);
    } else {
      forecastPeriod.setMonth(forecastPeriod.getMonth() + 1);
    }

    // Simple AI analysis - calculate trends and projections
    const revenueByStreamType: Record<string, number[]> = {};
    historicalStreams.forEach(stream => {
      if (!revenueByStreamType[stream.streamType]) {
        revenueByStreamType[stream.streamType] = [];
      }
      revenueByStreamType[stream.streamType].push(parseFloat(stream.usdEquivalent));
    });

    // Calculate forecasted amounts by stream
    const streamBreakdown: Record<string, number> = {};
    let totalForecast = 0;

    Object.entries(revenueByStreamType).forEach(([streamType, amounts]) => {
      const avgAmount = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
      const growthFactor = amounts.length > 1 ? amounts[0] / amounts[amounts.length - 1] : 1.1;
      const forecastedAmount = avgAmount * growthFactor;
      streamBreakdown[streamType] = forecastedAmount;
      totalForecast += forecastedAmount;
    });

    // Calculate confidence level based on data quality
    const confidenceLevel = Math.min(0.95, Math.max(0.5, historicalStreams.length / 50));

    const forecastData: InsertRevenueForecast = {
      artistUserId: userId,
      forecastType,
      forecastPeriod,
      totalForecast: totalForecast.toString(),
      streamBreakdown,
      confidenceLevel: confidenceLevel.toString(),
      forecastMethod: method,
      assumptions: [
        "Based on historical revenue patterns",
        "Assumes current market conditions continue",
        "Growth rates calculated from recent trends"
      ],
      riskFactors: [
        "Market volatility may affect streaming revenue",
        "Booking availability depends on venue capacity",
        "Platform algorithm changes may impact reach"
      ],
      opportunities: [
        "Emerging sync licensing opportunities",
        "International market expansion potential",
        "Brand partnership growth"
      ],
      generatedByUserId: userId,
      aiModelVersion: "WaituMusic-Internal-v1.0"
    };

    const [forecast] = await db
      .insert(revenueForecasts)
      .values(forecastData)
      .returning();

    return forecast;
  }

  // Get market trends
  async getMarketTrends(userId: number): Promise<MarketTrend[]> {
    // Get user's primary genre for targeted trends
    return await db
      .select()
      .from(marketTrends)
      .orderBy(desc(marketTrends.lastUpdated))
      .limit(20);
  }

  // Create market trend
  async createMarketTrend(data: InsertMarketTrend): Promise<MarketTrend> {
    const [trend] = await db
      .insert(marketTrends)
      .values(data)
      .returning();
    return trend;
  }

  // Get revenue optimizations
  async getRevenueOptimizations(userId: number): Promise<RevenueOptimization[]> {
    return await db
      .select()
      .from(revenueOptimizations)
      .where(eq(revenueOptimizations.artistUserId, userId))
      .orderBy(desc(revenueOptimizations.createdAt));
  }

  // Generate optimization recommendations
  async generateOptimizations(userId: number): Promise<RevenueOptimization[]> {
    // Analyze current revenue streams
    const streams = await this.getRevenueStreams(userId, '12months');
    const metrics = await this.getRevenueMetrics(userId, '12months');

    const optimizations: InsertRevenueOptimization[] = [];

    // Pricing optimization
    if (metrics.revenueByStream.booking > 0) {
      optimizations.push({
        artistUserId: userId,
        optimizationType: 'pricing_adjustment',
        currentMetrics: { averageBookingRate: metrics.revenueByStream.booking / 12 },
        recommendedActions: [
          {
            action: "Increase booking rates by 15-20% for premium venues",
            priority: "high",
            expectedImpact: metrics.revenueByStream.booking * 0.15,
            timeline: "immediate",
            resources: ["Market research", "Rate card update"]
          },
          {
            action: "Implement tiered pricing based on venue capacity",
            priority: "medium",
            expectedImpact: metrics.revenueByStream.booking * 0.10,
            timeline: "1-2 weeks",
            resources: ["Pricing strategy", "Contract templates"]
          }
        ],
        projectedImpact: (metrics.revenueByStream.booking * 0.25).toString(),
        implementationCost: "500",
        roi: "4500", // 45x return
        status: 'pending'
      });
    }

    // Platform diversification
    if (Object.keys(metrics.revenueByStream).length < 4) {
      optimizations.push({
        artistUserId: userId,
        optimizationType: 'platform_focus',
        currentMetrics: { activeStreams: Object.keys(metrics.revenueByStream).length },
        recommendedActions: [
          {
            action: "Expand to sync licensing platforms",
            priority: "high",
            expectedImpact: 5000,
            timeline: "2-4 weeks",
            resources: ["Music submission", "Licensing agreements"]
          }
        ],
        projectedImpact: "5000",
        implementationCost: "200",
        roi: "2400", // 24x return
        status: 'pending'
      });
    }

    // Insert optimizations
    const createdOptimizations: RevenueOptimization[] = [];
    for (const optimization of optimizations) {
      const [created] = await db
        .insert(revenueOptimizations)
        .values(optimization)
        .returning();
      createdOptimizations.push(created);
    }

    return createdOptimizations;
  }

  // Sync booking revenue to revenue streams
  async syncBookingRevenue(): Promise<void> {
    // Get completed bookings that haven't been synced to revenue streams
    const completedBookings = await db
      .select()
      .from(bookings)
      .where(eq(bookings.status, 'completed'));

    for (const booking of completedBookings) {
      // Check if revenue stream already exists for this booking
      const existingStream = await db
        .select()
        .from(revenueStreams)
        .where(
          and(
            eq(revenueStreams.artistUserId, booking.primaryArtistUserId),
            eq(revenueStreams.sourceId, booking.id),
            eq(revenueStreams.streamType, 'booking')
          )
        )
        .limit(1);

      if (existingStream.length === 0 && booking.finalPrice) {
        // Create revenue stream for completed booking
        await this.createRevenueStream({
          artistUserId: booking.primaryArtistUserId,
          streamType: 'booking',
          streamName: `Booking: ${booking.eventType}`,
          amount: booking.finalPrice,
          currency: 'USD',
          exchangeRate: '1.0',
          usdEquivalent: booking.finalPrice,
          dateReceived: booking.eventDate,
          sourceId: booking.id,
          metadata: {
            venueCapacity: booking.guestCount,
            ticketsSold: booking.guestCount,
          },
          status: 'confirmed'
        });
      }
    }
  }
}

export const revenueAnalyticsService = new RevenueAnalyticsService();