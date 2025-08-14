import { Request, Response, Router } from 'express';
import { workflowAutomation } from '../workflow-automation';

// Simple auth middleware
const requireAuth = (req: Request, res: Response, next: any) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
};

const authenticateUser = requireAuth;

const router = Router();

export default router;

// Trigger contract generation for a booking
router.post('/api/workflows/generate-contracts/:bookingId', authenticateUser, requireAuth, async (req: Request, res: Response) => {
  try {
    const bookingId = parseInt(req.params.bookingId);
    const contract = await workflowAutomation.generateBookingContract(bookingId);
    res.json({ success: true, contract });
  } catch (error: any) {
    console.error('Error generating contracts:', error);
    res.status(500).json({ message: error.message });
  }
});

// Auto-assign band members
router.post('/api/workflows/auto-assign-band/:bookingId/:artistId', authenticateUser, requireAuth, async (req: Request, res: Response) => {
  try {
    const bookingId = parseInt(req.params.bookingId);
    const artistId = parseInt(req.params.artistId);
    const assignedCount = await workflowAutomation.autoAssignBandMembers(bookingId, artistId);
    res.json({ success: true, assignedCount });
  } catch (error: any) {
    console.error('Error auto-assigning band:', error);
    res.status(500).json({ message: error.message });
  }
});

// Generate technical rider
router.post('/api/workflows/generate-technical-rider/:bookingId', authenticateUser, requireAuth, async (req: Request, res: Response) => {
  try {
    const bookingId = parseInt(req.params.bookingId);
    const technicalRider = await workflowAutomation.generateTechnicalRider(bookingId);
    res.json({ success: true, technicalRider });
  } catch (error: any) {
    console.error('Error generating technical rider:', error);
    res.status(500).json({ message: error.message });
  }
});