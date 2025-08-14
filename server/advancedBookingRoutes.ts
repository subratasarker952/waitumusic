import { Router, Request, Response } from 'express';
import { advancedBookingWorkflows } from './advancedBookingWorkflows';
import { managedAgentSystem } from './managedAgentSystem';
import { crossPlatformIntegration } from './crossPlatformIntegration';

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        roleId: number;
        email: string;
        roleName?: string;
      };
    }
  }
}

const router = Router();

// Advanced Booking Workflow Routes
router.post('/bookings/:id/technical-rider', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const riderData = req.body;
    
    const success = await advancedBookingWorkflows.createTechnicalRider(
      parseInt(id), 
      riderData
    );
    
    if (success) {
      res.json({ success: true, message: 'Technical rider created successfully' });
    } else {
      res.status(400).json({ success: false, error: 'Failed to create technical rider' });
    }
  } catch (error) {
    console.error('Error creating technical rider:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.get('/bookings/:id/approval-status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const workflow = await advancedBookingWorkflows.getApprovalWorkflowStatus(parseInt(id));
    
    if (workflow) {
      res.json({ success: true, workflow });
    } else {
      res.status(404).json({ success: false, error: 'Approval workflow not found' });
    }
  } catch (error) {
    console.error('Error getting approval status:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.post('/bookings/:id/approval/:step', async (req: Request, res: Response) => {
  try {
    const { id, step } = req.params;
    const { approval, notes } = req.body;
    const approvedBy = req.user?.userId;
    
    if (!approvedBy) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    
    const success = await advancedBookingWorkflows.processApprovalStep(
      parseInt(id),
      step,
      approval,
      approvedBy,
      notes
    );
    
    if (success) {
      res.json({ success: true, message: `Approval step ${step} ${approval} successfully` });
    } else {
      res.status(400).json({ success: false, error: 'Failed to process approval step' });
    }
  } catch (error) {
    console.error('Error processing approval:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.get('/bookings/pending-approvals', async (req: Request, res: Response) => {
  try {
    const adminUserId = req.user?.userId;
    
    if (!adminUserId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    
    const pendingApprovals = await advancedBookingWorkflows.getPendingApprovals(adminUserId);
    res.json({ success: true, pendingApprovals });
  } catch (error) {
    console.error('Error getting pending approvals:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Managed Agent System Routes
router.get('/managed-agents', async (req: Request, res: Response) => {
  try {
    const agents = await managedAgentSystem.getManagedAgents();
    res.json({ success: true, agents });
  } catch (error) {
    console.error('Error getting managed agents:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.post('/bookings/:id/auto-assign-agent', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = await managedAgentSystem.autoAssignManagedAgent(parseInt(id));
    
    if (success) {
      res.json({ success: true, message: 'Managed agent assigned successfully' });
    } else {
      res.status(400).json({ success: false, error: 'Failed to assign managed agent' });
    }
  } catch (error) {
    console.error('Error auto-assigning agent:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.post('/bookings/:id/counter-offer', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const agentUserId = req.user?.userId;
    const counterOfferData = req.body;
    
    if (!agentUserId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    
    const success = await managedAgentSystem.createCounterOffer(
      parseInt(id),
      agentUserId,
      counterOfferData
    );
    
    if (success) {
      res.json({ success: true, message: 'Counter offer created successfully' });
    } else {
      res.status(400).json({ success: false, error: 'Failed to create counter offer' });
    }
  } catch (error) {
    console.error('Error creating counter offer:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.post('/bookings/:id/counter-offer/respond', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { agentUserId, response } = req.body;
    const bookerUserId = req.user?.userId;
    
    if (!bookerUserId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    
    const success = await managedAgentSystem.respondToCounterOffer(
      parseInt(id),
      agentUserId,
      response,
      bookerUserId
    );
    
    if (success) {
      res.json({ success: true, message: `Counter offer ${response} successfully` });
    } else {
      res.status(400).json({ success: false, error: 'Failed to respond to counter offer' });
    }
  } catch (error) {
    console.error('Error responding to counter offer:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.get('/bookings/:id/agent-assignments', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const assignments = await managedAgentSystem.getAgentAssignments(parseInt(id));
    res.json({ success: true, assignments });
  } catch (error) {
    console.error('Error getting agent assignments:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.get('/agents/:id/metrics', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const metrics = await managedAgentSystem.getAgentMetrics(parseInt(id));
    res.json({ success: true, metrics });
  } catch (error) {
    console.error('Error getting agent metrics:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Cross-Platform Integration Routes
router.post('/professionals/register-service', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const serviceData = req.body;
    
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    
    const success = await crossPlatformIntegration.registerProfessionalService(
      userId,
      serviceData
    );
    
    if (success) {
      res.json({ success: true, message: 'Professional service registered successfully' });
    } else {
      res.status(400).json({ success: false, error: 'Failed to register professional service' });
    }
  } catch (error) {
    console.error('Error registering professional service:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.get('/professionals/find', async (req: Request, res: Response) => {
  try {
    const { serviceType, specialization, location, startDate, endDate } = req.query;
    
    const dateRange = startDate && endDate ? {
      start: new Date(startDate as string),
      end: new Date(endDate as string)
    } : undefined;
    
    const professionals = await crossPlatformIntegration.findProfessionals(
      serviceType as string,
      specialization as string,
      location as string,
      dateRange
    );
    
    res.json({ success: true, professionals });
  } catch (error) {
    console.error('Error finding professionals:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.post('/bookings/:id/book-professional', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { professionalUserId, serviceDetails } = req.body;
    
    const success = await crossPlatformIntegration.bookProfessional(
      parseInt(id),
      professionalUserId,
      serviceDetails
    );
    
    if (success) {
      res.json({ success: true, message: 'Professional booked successfully' });
    } else {
      res.status(400).json({ success: false, error: 'Failed to book professional' });
    }
  } catch (error) {
    console.error('Error booking professional:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.post('/bookings/:id/production-workflow', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const productionRequirements = req.body;
    
    const success = await crossPlatformIntegration.createEventProductionWorkflow(
      parseInt(id),
      productionRequirements
    );
    
    if (success) {
      res.json({ success: true, message: 'Production workflow created successfully' });
    } else {
      res.status(400).json({ success: false, error: 'Failed to create production workflow' });
    }
  } catch (error) {
    console.error('Error creating production workflow:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.get('/bookings/:id/professional-team', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const team = await crossPlatformIntegration.getProfessionalTeam(parseInt(id));
    res.json({ success: true, team });
  } catch (error) {
    console.error('Error getting professional team:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;