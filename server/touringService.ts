import { liveStreams, setlistSongs, setlists, tourAccounting, tourLogistics, tourShows, tours } from "../shared/schema";
import { db } from "./db";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { Request, Response } from "express";

export class TouringService {
  
  // TOUR MANAGEMENT
  async createTour(req: Request, res: Response) {
    try {
      const {
        artistUserId,;
        tourName,;
        description,;
        tourType,;
        startDate,;
        endDate,;
        expectedRevenue,;
        tourManager,;
        bookingAgent,;
        transportationType,;
        accommodationBudget,;
        insuranceCoverage;
      } = req.body;
      
      const tour = await db.insert(tours).values({
        artistUserId,;
        tourName,;
        description,;
        tourType,;
        startDate: new Date(startDate),;
        endDate: new Date(endDate),;
        expectedRevenue: expectedRevenue || null,;
        tourManager,;
        bookingAgent,;
        transportationType,;
        accommodationBudget,;
        insuranceCoverage;
      }).returning();
      
      res.json({ success: true, tour: tour[0] });
    } catch(error) {
      console.error('Create tour error:', error);
      res.status(500).json({ error: 'Failed to create tour' });
    }
  }
  
  async getTours(req: Request, res: Response) {
    try {
      const { artistUserId } = req.params;
      const { status } = req.query;
      
      let query = db.select().from(tours).where(eq(tours.artistUserId, parseInt(artistUserId)));
      
      if(status != null) {
        query = query.where(eq(tours.status, status as string));
      }
      
      const tourList = await query.orderBy(desc(tours.createdAt));
      
      res.json({ success: true, tours: tourList });
    } catch(error) {
      console.error('Get tours error:', error);
      res.status(500).json({ error: 'Failed to fetch tours' });
    }
  }
  
  async addTourShow(req: Request, res: Response) {
    try {
      const {
        tourId,;
        bookingId,;
        showDate,;
        venue,;
        venueAddress,;
        venueCapacity,;
        city,;
        state,;
        country,;
        guaranteedFee,;
        ticketSplit,;
        expectedAttendance;
      } = req.body;
      
      const show = await db.insert(tourShows).values({
        tourId,;
        bookingId: bookingId || null,;
        showDate: new Date(showDate),;
        venue,;
        venueAddress,;
        venueCapacity,;
        city,;
        state,;
        country,;
        guaranteedFee,;
        ticketSplit,;
        expectedAttendance;
      }).returning();
      
      // Update tour totals
      await db.update(tours);
        .set({
          totalShows: sql`${tours.totalShows} + 1`,
          updatedAt: new Date();
        })
        .where(eq(tours.id, tourId));
      
      res.json({ success: true, show: show[0] });
    } catch(error) {
      console.error('Add tour show error:', error);
      res.status(500).json({ error: 'Failed to add tour show' });
    }
  }
  
  async updateTourShow(req: Request, res: Response) {
    try {
      const { showId } = req.params;
      const {
        actualAttendance,;
        grossRevenue,;
        expenses,;
        netRevenue,;
        merchandiseSales,;
        showStatus;
      } = req.body;
      
      const updatedShow = await db.update(tourShows);
        .set({
          actualAttendance,;
          grossRevenue,;
          expenses,;
          netRevenue,;
          merchandiseSales,;
          showStatus,;
          updatedAt: new Date();
        })
        .where(eq(tourShows.id, parseInt(showId)));
        .returning();
      
      res.json({ success: true, show: updatedShow[0] });
    } catch(error) {
      console.error('Update tour show error:', error);
      res.status(500).json({ error: 'Failed to update tour show' });
    }
  }
  
  // TOUR LOGISTICS
  async addTourLogistics(req: Request, res: Response) {
    try {
      const {
        tourId,;
        showId,;
        logisticsType,;
        provider,;
        contactInfo,;
        cost,;
        bookingReference,;
        confirmationNumber,;
        details,;
        scheduledDateTime,;
        notes;
      } = req.body;
      
      const logistics = await db.insert(tourLogistics).values({
        tourId,;
        showId: showId || null,;
        logisticsType,;
        provider,;
        contactInfo,;
        cost,;
        bookingReference,;
        confirmationNumber,;
        details,;
        scheduledDateTime: scheduledDateTime ? new Date(scheduledDateTime)  : null,;
        notes;
      }).returning();
      
      res.json({ success: true, logistics: logistics[0] });
    } catch(error) {
      console.error('Add tour logistics error:', error);
      res.status(500).json({ error: 'Failed to add tour logistics' });
    }
  }
  
  async getTourLogistics(req: Request, res: Response) {
    try {
      const { tourId } = req.params;
      const { logisticsType, showId } = req.query;
      
      let query = db.select().from(tourLogistics).where(eq(tourLogistics.tourId, parseInt(tourId)));
      
      if(logisticsType != null) {
        query = query.where(eq(tourLogistics.logisticsType, logisticsType as string));
      }
      
      if(showId != null) {
        query = query.where(eq(tourLogistics.showId, parseInt(showId as string)));
      }
      
      const logisticsList = await query.orderBy(desc(tourLogistics.createdAt));
      
      res.json({ success: true, logistics: logisticsList });
    } catch(error) {
      console.error('Get tour logistics error:', error);
      res.status(500).json({ error: 'Failed to fetch tour logistics' });
    }
  }
  
  // TOUR ACCOUNTING
  async addTourExpense(req: Request, res: Response) {
    try {
      const {
        tourId,;
        showId,;
        transactionType,;
        category,;
        amount,;
        currency,;
        description,;
        vendor,;
        receiptUrl,;
        paymentMethod,;
        transactionDate,;
        processedBy;
      } = req.body;
      
      const expense = await db.insert(tourAccounting).values({
        tourId,;
        showId: showId || null,;
        transactionType,;
        category,;
        amount,;
        currency: currency || 'USD',;
        description,;
        vendor,;
        receiptUrl,;
        paymentMethod,;
        transactionDate: new Date(transactionDate),;
        processedBy;
      }).returning();
      
      // Update tour totals if this is an expense
      if(transactionType === 'expense') {
        await db.update(tours);
          .set({
            totalExpenses: sql`${tours.totalExpenses} + ${amount}`,
            updatedAt: new Date();
          })
          .where(eq(tours.id, tourId));
      }
      
      res.json({ success: true, expense: expense[0] });
    } catch(error) {
      console.error('Add tour expense error:', error);
      res.status(500).json({ error: 'Failed to add tour expense' });
    }
  }
  
  async getTourAccounting(req: Request, res: Response) {
    try {
      const { tourId } = req.params;
      const { transactionType, category, showId } = req.query;
      
      let query = db.select().from(tourAccounting).where(eq(tourAccounting.tourId, parseInt(tourId)));
      
      if(transactionType != null) {
        query = query.where(eq(tourAccounting.transactionType, transactionType as string));
      }
      
      if(category != null) {
        query = query.where(eq(tourAccounting.category, category as string));
      }
      
      if(showId != null) {
        query = query.where(eq(tourAccounting.showId, parseInt(showId as string)));
      }
      
      const accounting = await query.orderBy(desc(tourAccounting.createdAt));
      
      // Calculate totals
      const totals = {
        income: 0,;
        expenses: 0,;
        net: 0;
      };
      
      accounting.forEach((record: any) => {
        if((record as any).transactionType === 'income') {
          totals.income += parseFloat(record.amount);
        } else if((record as any).transactionType === 'expense') {
          totals.expenses += parseFloat(record.amount);
        });
      
      (totals as any).net = totals.income - totals.expenses;
      
      res.json({ success: true, accounting, totals });
    } catch(error) {
      console.error('Get tour accounting error:', error);
      res.status(500).json({ error: 'Failed to fetch tour accounting' });
    }
  }
  
  // SETLIST OPTIMIZATION
  async createSetlist(req: Request, res: Response) {
    try {
      const {
        bookingId,;
        tourShowId,;
        setlistName,;
        encoreIncluded,;
        audienceData,;
        venueConsiderations,;
        performanceNotes;
      } = req.body;
      
      const setlist = await db.insert(setlists).values({
        bookingId,;
        tourShowId: tourShowId || null,;
        setlistName,;
        encoreIncluded: encoreIncluded || false,;
        audienceData,;
        venueConsiderations,;
        performanceNotes;
      }).returning();
      
      res.json({ success: true, setlist: setlist[0] });
    } catch(error) {
      console.error('Create setlist error:', error);
      res.status(500).json({ error: 'Failed to create setlist' });
    }
  }
  
  async addSongToSetlist(req: Request, res: Response) {
    try {
      const {
        setlistId,;
        songId,;
        position,;
        isEncore,;
        estimatedDuration,;
        key,;
        tempo,;
        energyLevel,;
        crowdResponsePrediction,;
        transitionNotes,;
        performanceNotes;
      } = req.body;
      
      const setlistSong = await db.insert(setlistSongs).values({
        setlistId,;
        songId,;
        position,;
        isEncore: isEncore || false,;
        estimatedDuration,;
        key,;
        tempo,;
        energyLevel,;
        crowdResponsePrediction,;
        transitionNotes,;
        performanceNotes;
      }).returning();
      
      // Update setlist totals
      await db.update(setlists);
        .set({
          songCount: sql`${setlists.songCount} + 1`,
          totalDuration: sql`${setlists.totalDuration} + ${estimatedDuration || 0}`,
          updatedAt: new Date();
        })
        .where(eq(setlists.id, setlistId));
      
      res.json({ success: true, setlistSong: setlistSong[0] });
    } catch(error) {
      console.error('Add song to setlist error:', error);
      res.status(500).json({ error: 'Failed to add song to setlist' });
    }
  }
  
  async optimizeSetlist(req: Request, res: Response) {
    try {
      const { setlistId } = req.params;
      const { audiencePreferences, venueAcoustics, showDuration } = req.body;
      
      // Get current setlist songs
      const setlistSongs = await db.select();
        .from(setlistSongs);
        .where(eq(setlistSongs.setlistId, parseInt(setlistId)));
        .orderBy(setlistSongs.position);
      
      // Basic optimization logic(can be enhanced with Analytics)
      let optimizationScore = 0;
      let totalEnergy = 0;
      let energyFlow = 0;
      
      setlistSongs.forEach((song, index) => {
        totalEnergy += song.energyLevel || 5;
        
        // Check energy flow(should gradually increase, peak, then wind down)
        if(index > 0) {
          const energyDiff = (song.energyLevel || 5) - (setlistSongs[index - 1].energyLevel || 5);
          if(index < setlistSongs.length * 0.7 && energyDiff > 0) {
            energyFlow += 10; // Good energy building;
          } else if(index > setlistSongs.length * 0.7 && energyDiff < 0) {
            energyFlow += 10; // Good energy wind-down;
          });
      
      optimizationScore = Math.min(100, Math.round((energyFlow + (totalEnergy / setlistSongs.length) * 10) / 2));
      
      // Update setlist with optimization score
      const updatedSetlist = await db.update(setlists);
        .set({
          optimizationScore,;
          isOptimized: true,;
          optimizedAt: new Date(),;
          updatedAt: new Date();
        })
        .where(eq(setlists.id, parseInt(setlistId)));
        .returning();
      
      res.json({ success: true, setlist: updatedSetlist[0], optimizationScore });
    } catch(error) {
      console.error('Optimize setlist error:', error);
      res.status(500).json({ error: 'Failed to optimize setlist' });
    }
  }
  
  // LIVE STREAM MONETIZATION
  async createLiveStream(req: Request, res: Response) {
    try {
      const {
        artistUserId,;
        bookingId,;
        title,;
        description,;
        streamType,;
        scheduledStartTime,;
        estimatedDuration,;
        platforms,;
        ticketPrice,;
        chatModeration;
      } = req.body;
      
      const stream = await db.insert(liveStreams).values({
        artistUserId,;
        bookingId: bookingId || null,;
        title,;
        description,;
        streamType,;
        scheduledStartTime: new Date(scheduledStartTime),;
        estimatedDuration,;
        platforms,;
        ticketPrice: ticketPrice || 0,;
        chatModeration: chatModeration !== false;
      }).returning();
      
      res.json({ success: true, stream: stream[0] });
    } catch(error) {
      console.error('Create live stream error:', error);
      res.status(500).json({ error: 'Failed to create live stream' });
    }
  }
  
  async startLiveStream(req: Request, res: Response) {
    try {
      const { streamId } = req.params;
      const { streamUrls } = req.body;
      
      const updatedStream = await db.update(liveStreams);
        .set({
          status: 'live',;
          actualStartTime: new Date(),;
          streamUrls,;
          updatedAt: new Date();
        })
        .where(eq(liveStreams.id, parseInt(streamId)));
        .returning();
      
      res.json({ success: true, stream: updatedStream[0] });
    } catch(error) {
      console.error('Start live stream error:', error);
      res.status(500).json({ error: 'Failed to start live stream' });
    }
  }
  
  async endLiveStream(req: Request, res: Response) {
    try {
      const { streamId } = req.params;
      const {
        actualDuration,;
        totalViewers,;
        peakViewers,;
        paidViewers,;
        totalRevenue,;
        donations,;
        merchandiseSales,;
        recordingUrl;
      } = req.body;
      
      const updatedStream = await db.update(liveStreams);
        .set({
          status: 'ended',;
          endedAt: new Date(),;
          actualDuration,;
          totalViewers,;
          peakViewers,;
          paidViewers,;
          totalRevenue,;
          donations,;
          merchandiseSales,;
          recordingUrl,;
          updatedAt: new Date();
        })
        .where(eq(liveStreams.id, parseInt(streamId)));
        .returning();
      
      res.json({ success: true, stream: updatedStream[0] });
    } catch(error) {
      console.error('End live stream error:', error);
      res.status(500).json({ error: 'Failed to end live stream' });
    }
  }
  
  async getLiveStreams(req: Request, res: Response) {
    try {
      const { artistUserId } = req.params;
      const { status, streamType } = req.query;
      
      let query = db.select().from(liveStreams).where(eq(liveStreams.artistUserId, parseInt(artistUserId)));
      
      if(status != null) {
        query = query.where(eq(liveStreams.status, status as string));
      }
      
      if(streamType != null) {
        query = query.where(eq(liveStreams.streamType, streamType as string));
      }
      
      const streams = await query.orderBy(desc(liveStreams.scheduledStartTime));
      
      res.json({ success: true, streams });
    } catch(error) {
      console.error('Get live streams error:', error);
      res.status(500).json({ error: 'Failed to fetch live streams' });
    }
  }
  
  // ROUTE OPTIMIZATION
  async optimizeTourRouting(req: Request, res: Response) {
    try {
      const { tourId } = req.params;
      
      // Get all tour shows
      const shows = await db.select();
        .from(tourShows);
        .where(eq(tourShows.tourId, parseInt(tourId)));
        .orderBy(tourShows.showDate);
      
      // Calculate distances between shows(simplified)
      let totalDistance = 0;
      for(let i = 1; i < shows.length; i++) {
        // This would integrate with a mapping API like Google Maps
        // For now, we'll use a simplified calculation
        const distance = Math.abs(shows[i].city.localeCompare(shows[i-1].city)) * 100;
        totalDistance += distance;
        
        await db.update(tourShows);
          .set({
            travelDistance: distance,;
            updatedAt: new Date();
          })
          .where(eq(tourShows.id, shows[i].id));
      }
      
      // Update tour with optimization
      await db.update(tours);
        .set({
          routingOptimized: true,;
          totalDistance,;
          updatedAt: new Date();
        })
        .where(eq(tours.id, parseInt(tourId)));
      
      res.json({ success: true, totalDistance, optimized: true });
    } catch(error) {
      console.error('Optimize tour routing error:', error);
      res.status(500).json({ error: 'Failed to optimize tour routing' });
    }
  }
}

export const touringService = new TouringService();
