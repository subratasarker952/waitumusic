import { Router } from 'express';
import { oppHubAI } from '../oppHubAI';
import { storage } from '../storage';
import { requireRole, ROLE_GROUPS } from '@shared/authorization-middleware';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Authentication middleware
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);
  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

const router = Router();

// Platform Health Monitoring (Superadmin/Admin only)
router.get('/health', authenticateToken, requireRole(ROLE_GROUPS.ADMIN_ONLY), async (req, res) => {
  try {
    const user = req.user;

    const healthReport = await oppHubAI.monitorPlatformHealth();
    res.json(healthReport);
  } catch (error) {
    console.error('Error getting platform health:', error);
    res.status(500).json({ error: 'Failed to get platform health' });
  }
});

// Business Forecasting (Superadmin/Admin only)
router.get('/forecasts', authenticateToken, requireRole(ROLE_GROUPS.ADMIN_ONLY), async (req, res) => {
  try {
    const user = req.user;

    const forecasts = await oppHubAI.generateBusinessForecasts();
    res.json(forecasts);
  } catch (error) {
    console.error('Error generating forecasts:', error);
    res.status(500).json({ error: 'Failed to generate forecasts' });
  }
});

// AI Application Guidance for Managed Artists
router.get('/guidance/:userId', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const targetUserId = parseInt(req.params.userId);

    // Check if user can access this guidance (self, admin, or superadmin)
    if (user.userId !== targetUserId && user.roleId !== 1 && user.roleId !== 2) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Verify target user is managed artist
    const targetUser = await storage.getUser(targetUserId);
    if (!targetUser || ![3, 5, 7].includes(targetUser.roleId)) {
      return res.status(400).json({ error: 'AI guidance only available for managed users' });
    }

    const guidance = await storage.getApplicationGuidanceForUser(targetUserId);
    res.json(guidance);
  } catch (error) {
    console.error('Error getting AI guidance:', error);
    res.status(500).json({ error: 'Failed to get AI guidance' });
  }
});

// Generate guidance for specific opportunity
router.post('/guidance/generate', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const { opportunityId, targetUserId } = req.body;

    // Check permissions
    if (user.userId !== targetUserId && user.roleId !== 1 && user.roleId !== 2) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const guidance = await oppHubAI.generateApplicationGuidance(opportunityId, targetUserId);
    if (!guidance) {
      return res.status(400).json({ error: 'Could not generate guidance for this opportunity' });
    }

    await storage.createApplicationGuidance({
      opportunityId: guidance.opportunityId,
      targetUserId: guidance.targetUserId,
      generatedStrategy: guidance.strategy,
      matchReasons: guidance.matchReasons,
      recommendedApproach: guidance.strategy.keyApproach,
      suggestedPortfolio: guidance.strategy.portfolioRecommendations,
      keyTalkingPoints: guidance.strategy.talkingPoints,
      confidenceScore: guidance.confidenceScore,
      priorityLevel: guidance.priorityLevel,
      aiAnalysisDetails: {
        timelineStrategy: guidance.strategy.timelineStrategy,
        contactApproach: guidance.strategy.contactApproach
      }
    });

    res.json({ success: true, guidance });
  } catch (error) {
    console.error('Error generating guidance:', error);
    res.status(500).json({ error: 'Failed to generate guidance' });
  }
});

// Social Media AI Strategy
router.get('/social-media/:artistId', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const artistId = parseInt(req.params.artistId);

    // Check permissions (artist themselves, admin, or superadmin)
    const artist = await storage.getArtist(artistId);
    if (!artist || (user.userId !== artist.userId && user.roleId !== 1 && user.roleId !== 2)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const strategy = await oppHubAI.generateSocialMediaStrategy(artistId);
    res.json(strategy);
  } catch (error) {
    console.error('Error generating social media strategy:', error);
    res.status(500).json({ error: 'Failed to generate social media strategy' });
  }
});

// AI Learning System Data
router.get('/learning', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    if (!user || (user.roleId !== 1 && user.roleId !== 2)) {
      return res.status(403).json({ error: 'Access denied - Admin privileges required' });
    }

    const learningData = await oppHubAI.learnFromPlatformData();
    res.json(learningData);
  } catch (error) {
    console.error('Error getting learning data:', error);
    res.status(500).json({ error: 'Failed to get learning data' });
  }
});

// All Managed Artist Guidance Overview (Superadmin/Admin)
router.get('/guidance/all', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    if (!user || (user.roleId !== 1 && user.roleId !== 2)) {
      return res.status(403).json({ error: 'Access denied - Admin privileges required' });
    }

    const limit = parseInt(req.query.limit as string) || 50;
    const allGuidance = await storage.getAllManagedArtistGuidance(limit);
    res.json(allGuidance);
  } catch (error) {
    console.error('Error getting all guidance:', error);
    res.status(500).json({ error: 'Failed to get all guidance' });
  }
});

// Add Success Story (Learning)
router.post('/success-story', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    if (!user || (user.roleId !== 1 && user.roleId !== 2)) {
      return res.status(403).json({ error: 'Access denied - Admin privileges required' });
    }

    const storyData = {
      ...req.body,
      addedBy: user.id,
      verificationStatus: 'verified'
    };

    await oppHubAI.addSuccessStory(storyData);
    res.json({ success: true, message: 'Success story added to AI learning database' });
  } catch (error) {
    console.error('Error adding success story:', error);
    res.status(500).json({ error: 'Failed to add success story' });
  }
});

// Process Opportunity for All Managed Artists
router.post('/process-opportunity/:opportunityId', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    if (!user || (user.roleId !== 1 && user.roleId !== 2)) {
      return res.status(403).json({ error: 'Access denied - Admin privileges required' });
    }

    const opportunityId = parseInt(req.params.opportunityId);
    await oppHubAI.processOpportunityForManagedArtists(opportunityId);
    
    res.json({ 
      success: true, 
      message: 'Opportunity processed for all managed artists with AI guidance generated where applicable' 
    });
  } catch (error) {
    console.error('Error processing opportunity:', error);
    res.status(500).json({ error: 'Failed to process opportunity' });
  }
});

// Get Deadline Tracking for User
router.get('/deadlines/:userId', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const targetUserId = parseInt(req.params.userId);

    // Check permissions
    if (user.userId !== targetUserId && user.roleId !== 1 && user.roleId !== 2) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const deadlines = await storage.getDeadlineTrackingForUser(targetUserId);
    res.json(deadlines);
  } catch (error) {
    console.error('Error getting deadlines:', error);
    res.status(500).json({ error: 'Failed to get deadlines' });
  }
});

// Get Application Analytics for User
router.get('/analytics/:userId', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const targetUserId = parseInt(req.params.userId);

    // Check permissions
    if (user.userId !== targetUserId && user.roleId !== 1 && user.roleId !== 2) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const analytics = await storage.getApplicationAnalyticsForUser(targetUserId);
    res.json(analytics);
  } catch (error) {
    console.error('Error getting analytics:', error);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

// Comprehensive AI Dashboard Data (Superadmin/Admin)
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    if (!user || (user.roleId !== 1 && user.roleId !== 2)) {
      return res.status(403).json({ error: 'Access denied - Admin privileges required' });
    }

    const [health, forecasts, learning, allGuidance] = await Promise.all([
      oppHubAI.monitorPlatformHealth(),
      oppHubAI.generateBusinessForecasts(),
      oppHubAI.learnFromPlatformData(),
      storage.getAllManagedArtistGuidance(20)
    ]);

    res.json({
      health,
      forecasts,
      learning,
      managedArtistGuidance: allGuidance,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting AI dashboard data:', error);
    res.status(500).json({ error: 'Failed to get AI dashboard data' });
  }
});

export default router;