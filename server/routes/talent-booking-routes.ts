import { Router } from 'express';
import { db, sql } from '../db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Authentication middleware
function authMiddleware(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; email: string; roleId: number };
    req.user = decoded;
    next();
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Token verification error:', errorMessage);
    const error = err as Error;
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired', expired: true });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token format' });
    } else {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
  }
}

const router = Router();

// Get talent view of a booking
router.get('/api/bookings/:id/talent-view', authMiddleware, async (req, res) => {
  try {
    const bookingId = parseInt(req.params.id);
    const userId = req.user!.userId;
    
    // First get booking details using raw SQL query
    const bookingQuery = await sql`
      SELECT 
        b.*,
        u.email as primary_artist_email,
        a.stage_name as primary_artist_stage_name
      FROM bookings b
      LEFT JOIN users u ON b.primary_artist_user_id = u.id
      LEFT JOIN artists a ON u.id = a.user_id
      WHERE b.id = ${bookingId}`;

    if (bookingQuery.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = bookingQuery[0];

    // Check if user is assigned to this booking
    const assignmentQuery = await sql`
      SELECT 
        ba.*,
        ba.role_in_booking,
        ba.selected_talent,
        ba.is_main_booked_talent,
        ba.assigned_group,
        ba.assigned_channel,
        ba.status
      FROM booking_assignments_members ba
      WHERE ba.booking_id = ${bookingId} AND ba.user_id = ${userId}`;

    // Get workflow data if it exists
    const workflowData = booking.workflow_data || {};

    // Format response
    const response = {
      id: booking.id,
      eventName: booking.event_name,
      eventDate: booking.event_date,
      eventType: booking.event_type,
      venueName: booking.venue_name,
      venueAddress: booking.venue_address,
      status: booking.status,
      totalBudget: booking.total_budget,
      finalPrice: booking.final_price,
      requirements: booking.requirements,
      primaryArtist: {
        userId: booking.primary_artist_user_id,
        stageName: booking.primary_artist_stage_name || 'Unknown Artist'
      },
      workflowData: workflowData,
      assignmentInfo: assignmentQuery.length > 0 ? {
        roleInBooking: assignmentQuery[0].role_in_booking,
        selectedTalent: assignmentQuery[0].selected_talent,
        isMainBookedTalent: assignmentQuery[0].is_main_booked_talent,
        assignedGroup: assignmentQuery[0].assigned_group,
        assignedChannel: assignmentQuery[0].assigned_channel,
        status: assignmentQuery[0].status
      } : null
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching booking talent view:', error);
    res.status(500).json({ error: 'Failed to fetch booking details' });
  }
});

// Handle talent response to booking (accept/reject/counter)
router.post('/api/bookings/:id/talent-response', authMiddleware, async (req, res) => {
  try {
    const bookingId = parseInt(req.params.id);
    const userId = req.user!.userId;
    const { action, reason, proposedPrice } = req.body;

    // Verify user is assigned to this booking
    const assignmentCheck = await sql`
      SELECT id FROM booking_assignments_members 
      WHERE booking_id = ${bookingId} AND user_id = ${userId}`;

    if (assignmentCheck.length === 0) {
      return res.status(403).json({ error: 'You are not assigned to this booking' });
    }

    switch (action) {
      case 'accept':
        await sql`
          UPDATE booking_assignments_members 
          SET status = 'active', updated_at = NOW()
          WHERE booking_id = ${bookingId} AND assigned_user_id = ${userId}`;
        break;

      case 'reject':
        await sql`
          UPDATE booking_assignments_members 
          SET status = 'declined', decline_reason = ${reason}, updated_at = NOW()
          WHERE booking_id = ${bookingId} AND assigned_user_id = ${userId}`;
        break;

      case 'counter_offer':
        // Store counter offer in booking workflow data
        await sql`
          UPDATE bookings 
          SET workflow_data = jsonb_set(
            COALESCE(workflow_data, '{}'::jsonb),
            '{counter_offers}',
            COALESCE(workflow_data->'counter_offers', '[]'::jsonb) || 
            jsonb_build_object(
              'userId', ${userId},
              'proposedPrice', ${proposedPrice},
              'reason', ${reason},
              'timestamp', NOW()
            )
          )
          WHERE id = ${bookingId}`;
        break;

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    res.json({ success: true, message: `Booking ${action} successful` });
  } catch (error) {
    console.error('Error handling talent response:', error);
    res.status(500).json({ error: 'Failed to process response' });
  }
});

// Get contracts for a booking
router.get('/api/bookings/:id/contracts', authMiddleware, async (req, res) => {
  try {
    const bookingId = parseInt(req.params.id);
    
    // Mock response for now - should query contracts table when available
    const contracts = [
      {
        id: 1,
        type: 'performance_agreement',
        status: 'pending',
        createdAt: new Date().toISOString(),
        documentUrl: `/api/bookings/${bookingId}/contracts/1/download`
      }
    ];

    res.json(contracts);
  } catch (error) {
    console.error('Error fetching contracts:', error);
    res.status(500).json({ error: 'Failed to fetch contracts' });
  }
});

// Get payment info for a booking
router.get('/api/bookings/:id/payment-info', authMiddleware, async (req, res) => {
  try {
    const bookingId = parseInt(req.params.id);
    
    const bookingQuery = await sql`
      SELECT final_price, status FROM bookings WHERE id = ${bookingId}`;

    if (bookingQuery.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = bookingQuery[0];
    
    // Mock payment info for now
    const paymentInfo = {
      status: booking.status === 'completed' ? 'paid' : 'pending',
      amount: booking.final_price || '0.00',
      currency: 'USD',
      breakdown: {
        subtotal: booking.final_price || '0.00',
        total: booking.final_price || '0.00'
      }
    };

    res.json(paymentInfo);
  } catch (error) {
    console.error('Error fetching payment info:', error);
    res.status(500).json({ error: 'Failed to fetch payment info' });
  }
});

export default router;