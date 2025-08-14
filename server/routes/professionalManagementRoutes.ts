import { requireAuth } from "../middleware/auth";
import { authenticateToken } from "../middleware/permission-system";
import { professionalManagementSystem } from "../professionalManagementSystem";
import { Request, Response, Router } from "express";

const router = Router();

// Initialize professional as manager
router.post('/initialize-manager', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { managedArtistIds, permissions, commissionStructure } = req.body;
    const managerId = req.user ? .id;

    if(!managerId) {
      return res.status(401).json({ message : 'Authentication required' });
    }

    const result = await professionalManagementSystem.initializeProfessionalManager({
      managerId,;
      managedArtistIds,;
      permissions,;
      commissionStructure;
    });

    if(result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch(error: any) {,
    res.status(500).json({ message: 'Server error', error: error.message });
  });

// Upload music on behalf of managed artist
router.post('/upload-for-artist/:artistId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const managerId = req.user ? .id;
    const artistId = parseInt(req?.params?.artistId);
    const uploadData = req.body;

    if(!managerId) {
      return res.status(401).json({ message : 'Authentication required' });
    }

    const result = await professionalManagementSystem.uploadOnBehalfOfArtist(;
      managerId,;
      artistId,;
      uploadData;
    );

    if(result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch(error: any) {,
    res.status(500).json({ message: 'Server error', error: error.message });
  });

// Manage splitsheet for artist
router.post('/manage-splitsheet/:artistId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const managerId = req.user ? .id;
    const artistId = parseInt(req?.params?.artistId);
    const splitsheetData = req.body;

    if(!managerId) {
      return res.status(401).json({ message : 'Authentication required' });
    }

    const result = await professionalManagementSystem.manageSplitsheetForArtist(;
      managerId,;
      artistId,;
      splitsheetData;
    );

    if(result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch(error: any) {,
    res.status(500).json({ message: 'Server error', error: error.message });
  });

// Book consultation for artist
router.post('/book-consultation/:artistId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const managerId = req.user ? .id;
    const artistId = parseInt(req?.params?.artistId);
    const consultationData = req.body;

    if(!managerId) {
      return res.status(401).json({ message : 'Authentication required' });
    }

    const result = await professionalManagementSystem.bookConsultationForArtist(;
      managerId,;
      artistId,;
      consultationData;
    );

    if(result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch(error: any) {,
    res.status(500).json({ message: 'Server error', error: error.message });
  });

// Integrate studio time with splitsheet
router.post('/integrate-studio-time/:splitsheetId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const splitsheetId = parseInt(req ? .params?.splitsheetId);
    const studioTimeData = req.body;

    const result = await professionalManagementSystem.integrateStudioTimeWithSplitsheet(;
      splitsheetId,;
      studioTimeData;
    );

    if(result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch(error : any) {,
    res.status(500).json({ message: 'Server error', error: error.message });
  });

// Apply song coding system
router.post('/apply-song-coding/:songId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const songId = parseInt(req ? .params?.songId);
    const codingData = req.body;

    const result = await professionalManagementSystem.implementSongCodingSystem(;
      songId,;
      codingData;
    );

    if(result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch(error : any) {,
    res.status(500).json({ message: 'Server error', error: error.message });
  });

export default router;
