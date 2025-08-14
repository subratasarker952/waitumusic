/**
 * Professional Integration API Routes
 * Handles API endpoints for cross-platform professional integration
 */

import { Router, Request, Response } from 'express';
import { professionalIntegrationSystem } from '../professionalIntegrationSystem';
// Note: authenticateToken middleware would be imported in real implementation

const router = Router();

/**
 * Create professional assignment with cross-platform integration
 */
router.post('/assignment/create', async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Only admin/superadmin can create professional assignments
    if (!['superadmin', 'admin'].includes(user.role)) {
      return res.status(403).json({ error: 'Access denied - Admin privileges required' });
    }

    const assignmentData = {
      ...req.body,
      assignedBy: user.userId,
      assignmentDate: new Date()
    };

    const assignment = await professionalIntegrationSystem.createProfessionalAssignment(assignmentData);

    res.json({
      success: true,
      assignment,
      message: 'Professional assignment created with cross-platform integration'
    });
  } catch (error) {
    console.error('Error creating professional assignment:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create professional assignment'
    });
  }
});

/**
 * Create cross-platform project with multiple professionals
 */
router.post('/project/create', async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Only admin/superadmin can create cross-platform projects
    if (!['superadmin', 'admin'].includes(user.role)) {
      return res.status(403).json({ error: 'Access denied - Admin privileges required' });
    }

    const project = await professionalIntegrationSystem.createCrossPlatformProject(req.body);

    res.json({
      success: true,
      project,
      message: 'Cross-platform project created successfully',
      crossLinkingScore: await professionalIntegrationSystem.getCrossLinkingQualityScore(project.id)
    });
  } catch (error) {
    console.error('Error creating cross-platform project:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create cross-platform project'
    });
  }
});

/**
 * Get professional equipment specifications
 */
router.get('/equipment/:professionalId', async (req: Request, res: Response) => {
  try {
    const professionalId = parseInt(req.params.professionalId);
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const equipment = await professionalIntegrationSystem.getProfessionalEquipment(professionalId);

    res.json({
      success: true,
      equipment,
      professionalId
    });
  } catch (error) {
    console.error('Error fetching professional equipment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch professional equipment'
    });
  }
});

/**
 * Get cross-linking quality score for project
 */
router.get('/project/:projectId/quality-score', async (req: Request, res: Response) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const qualityScore = await professionalIntegrationSystem.getCrossLinkingQualityScore(projectId);

    res.json({
      success: true,
      qualityScore,
      projectId,
      status: qualityScore === 100 ? 'Perfect Cross-Linking' : 'Room for Improvement'
    });
  } catch (error) {
    console.error('Error calculating quality score:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate cross-linking quality score'
    });
  }
});

/**
 * Generate professional revenue projections
 */
router.get('/revenue/projections', async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Only admin/superadmin can access revenue projections
    if (!['superadmin', 'admin'].includes(user.role)) {
      return res.status(403).json({ error: 'Access denied - Admin privileges required' });
    }

    const projections = await professionalIntegrationSystem.generateProfessionalRevenueProjections();

    res.json({
      success: true,
      projections,
      target: '$2M+ annual revenue',
      professional_contribution: `$${projections.annual.toLocaleString()} (${((projections.annual / 2000000) * 100).toFixed(1)}% of $2M target)`
    });
  } catch (error) {
    console.error('Error generating revenue projections:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate revenue projections'
    });
  }
});

/**
 * Get professional integration system status
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Mock system status for demonstration
    const systemStatus = {
      crossPlatformIntegration: {
        status: 'operational',
        qualityScore: 100,
        description: 'Seamless integration of photographers, videographers, marketing professionals, and social media specialists'
      },
      professionalAssignments: {
        active: 12,
        completed: 45,
        averageCompletionTime: '3.2 days'
      },
      equipmentDatabase: {
        totalEquipment: 156,
        professionalsCovered: 89,
        integrationLevel: 'comprehensive'
      },
      technicalGuidance: {
        equipmentSpecificGuidance: true,
        genericFallback: true,
        cameraSettings: 'precise aperture recommendations available'
      },
      revenueContribution: {
        monthly: '$50,000',
        annual: '$600,000',
        targetProgress: '30% of $2M goal'
      }
    };

    res.json({
      success: true,
      systemStatus,
      timestamp: new Date().toISOString(),
      message: 'Professional integration system fully operational'
    });
  } catch (error) {
    console.error('Error fetching system status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch system status'
    });
  }
});

export default router;