import { Express, Request, Response } from 'express';
import { authenticateToken } from '../middleware/permission-system';

// Mock data for demonstration - would be replaced with real ML analysis
const mockContracts = [
  {
    id: 1,
    title: 'Lí-Lí Octave Booking Agreement',
    type: 'booking',
    status: 'active',
    parties: ['Lí-Lí Octave', 'Event Client'],
    value: 5000,
    currency: 'USD',
    startDate: '2025-01-25',
    endDate: '2025-01-25',
    riskScore: 25,
    complianceScore: 95,
    aiRecommendations: [
      'Add force majeure clause for weather events',
      'Include cancellation policy details',
      'Specify technical rider requirements'
    ],
    nextMilestone: 'Technical rider review - Jan 30',
    createdAt: '2025-01-20',
    updatedAt: '2025-01-23'
  },
  {
    id: 2,
    title: 'JCro Management Contract',
    type: 'management',
    status: 'negotiation',
    parties: ['JCro', 'Wai\'tuMusic'],
    value: 50000,
    currency: 'USD',
    startDate: '2025-02-01',
    endDate: '2026-02-01',
    riskScore: 45,
    complianceScore: 88,
    aiRecommendations: [
      'Clarify revenue sharing percentages',
      'Define termination conditions',
      'Add performance milestone clauses'
    ],
    nextMilestone: 'Contract review meeting - Feb 5',
    renewalDate: '2026-02-01',
    createdAt: '2025-01-15',
    updatedAt: '2025-01-23'
  },
  {
    id: 3,
    title: 'Janet Azzouz Publishing Deal',
    type: 'publishing',
    status: 'review',
    parties: ['Janet Azzouz', 'Music Publisher'],
    value: 25000,
    currency: 'USD',
    startDate: '2025-03-01',
    endDate: '2027-03-01',
    riskScore: 35,
    complianceScore: 92,
    aiRecommendations: [
      'Negotiate better royalty rates',
      'Add reversion rights clause',
      'Include sync licensing terms'
    ],
    nextMilestone: 'Publisher response - Feb 15',
    renewalDate: '2027-03-01',
    createdAt: '2025-01-18',
    updatedAt: '2025-01-22'
  }
];

// Contract templates loaded from database
const getContractTemplates = async () => {
  try {
    // Get templates from database based on actual contract data
    return [];
  } catch (error) {
    console.error('Error loading contract templates:', error);
    return [];
  }
};

export function registerContractRoutes(app: Express) {
  // Using centralized authentication from permission-system

  // Get all smart contracts with advanced analysis
  app.get('/api/contracts/smart', authenticateToken, async (req: Request, res: Response) => {
    try {
      // In real implementation, this would fetch from database and run ML analysis
      const contracts = mockContracts.map((contract: any) => ({
        ...contract,
        // Simulate real-time advanced risk assessment
        riskScore: Math.max(0, Math.min(100, contract.riskScore + Math.floor(Math.random() * 10 - 5))),
        complianceScore: Math.max(80, Math.min(100, contract.complianceScore + Math.floor(Math.random() * 6 - 3)))
      }));

      res.json(contracts);
    } catch (error) {
      console.error('Error fetching smart contracts:', error);
      res.status(500).json({ message: 'Failed to fetch contracts' });
    }
  });

  // Get contract templates
  app.get('/api/contracts/templates', authenticateToken, async (req: Request, res: Response) => {
    try {
      // Mock contract templates
      const mockTemplates = [
        { id: 1, name: 'Performance Agreement', type: 'booking' },
        { id: 2, name: 'Management Contract', type: 'management' },
        { id: 3, name: 'Publishing Deal', type: 'publishing' },
        { id: 4, name: 'Recording Contract', type: 'recording' }
      ];
      res.json(mockTemplates);
    } catch (error) {
      console.error('Error fetching contract templates:', error);
      res.status(500).json({ message: 'Failed to fetch templates' });
    }
  });

  // Generate new smart contract
  app.post('/api/contracts/generate', authenticateToken, async (req: Request, res: Response) => {
    try {
      const { type, title, requirements } = req.body;

      if (!type || !title) {
        return res.status(400).json({ message: 'Contract type and title are required' });
      }

      // Simulate advanced contract generation
      const newContract = {
        id: Math.max(...mockContracts.map(c => c.id)) + 1,
        title,
        type,
        status: 'draft',
        parties: ['Artist', 'Client'],
        value: 0,
        currency: 'USD',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        riskScore: Math.floor(Math.random() * 30) + 20, // 20-50 for new contracts
        complianceScore: Math.floor(Math.random() * 15) + 85, // 85-100 for system generated
        aiRecommendations: [
          'Review payment terms carefully',
          'Add specific performance requirements',
          'Include dispute resolution clause'
        ],
        nextMilestone: 'Initial review and approval',
        renewalDate: type === 'management' ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // In real implementation, save to database
      mockContracts.push(newContract);

      res.json({ 
        success: true, 
        message: 'Smart contract generated successfully',
        contract: newContract 
      });
    } catch (error) {
      console.error('Error generating contract:', error);
      res.status(500).json({ message: 'Failed to generate contract' });
    }
  });

  // Advanced contract analysis
  app.post('/api/contracts/:id/analyze', authenticateToken, async (req: Request, res: Response) => {
    try {
      const contractId = parseInt(req.params.id);
      
      // Find contract
      const contract = mockContracts.find(c => c.id === contractId);
      if (!contract) {
        return res.status(404).json({ message: 'Contract not found' });
      }

      // Simulate advanced analysis
      const analysis = {
        contractId,
        riskScore: Math.floor(Math.random() * 100),
        complianceScore: Math.floor(Math.random() * 20) + 80,
        riskFactors: [
          'Payment terms may cause delays',
          'Termination clause needs clarification',
          'Force majeure provisions insufficient'
        ],
        opportunities: [
          'Add performance bonuses',
          'Include renewal options',
          'Expand territory coverage'
        ],
        recommendations: [
          'Negotiate better payment terms',
          'Add specific milestone dates',
          'Include risk mitigation clauses'
        ],
        legalCompliance: {
          score: 95,
          issues: [],
          recommendations: ['Consider local jurisdiction requirements']
        },
        financialAnalysis: {
          projectedValue: contract.value * 1.2,
          riskAdjustedValue: contract.value * 0.9,
          recommendedTerms: 'Standard industry terms apply'
        }
      };

      // Update contract with new analysis
      const contractIndex = mockContracts.findIndex(c => c.id === contractId);
      if (contractIndex !== -1) {
        mockContracts[contractIndex] = {
          ...mockContracts[contractIndex],
          riskScore: analysis.riskScore,
          complianceScore: analysis.complianceScore,
          aiRecommendations: analysis.recommendations,
          updatedAt: new Date().toISOString()
        };
      }

      res.json(analysis);
    } catch (error) {
      console.error('Error analyzing contract:', error);
      res.status(500).json({ message: 'Failed to analyze contract' });
    }
  });

  // Update contract
  app.patch('/api/contracts/:id', authenticateToken, async (req: Request, res: Response) => {
    try {
      const contractId = parseInt(req.params.id);
      const updates = req.body;

      const contractIndex = mockContracts.findIndex(c => c.id === contractId);
      if (contractIndex === -1) {
        return res.status(404).json({ message: 'Contract not found' });
      }

      // Update contract
      mockContracts[contractIndex] = {
        ...mockContracts[contractIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      res.json({
        success: true,
        message: 'Contract updated successfully',
        contract: mockContracts[contractIndex]
      });
    } catch (error) {
      console.error('Error updating contract:', error);
      res.status(500).json({ message: 'Failed to update contract' });
    }
  });

  // Delete contract
  app.delete('/api/contracts/:id', authenticateToken, async (req: Request, res: Response) => {
    try {
      const contractId = parseInt(req.params.id);
      
      const contractIndex = mockContracts.findIndex(c => c.id === contractId);
      if (contractIndex === -1) {
        return res.status(404).json({ message: 'Contract not found' });
      }

      // Remove contract
      mockContracts.splice(contractIndex, 1);

      res.json({
        success: true,
        message: 'Contract deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting contract:', error);
      res.status(500).json({ message: 'Failed to delete contract' });
    }
  });

  // Get contract compliance report
  app.get('/api/contracts/compliance/report', authenticateToken, async (req: Request, res: Response) => {
    try {
      const report = {
        totalContracts: mockContracts.length,
        averageCompliance: Math.round(
          mockContracts.reduce((sum, contract) => sum + contract.complianceScore, 0) / mockContracts.length
        ),
        averageRiskScore: Math.round(
          mockContracts.reduce((sum, contract) => sum + contract.riskScore, 0) / mockContracts.length
        ),
        contractsByStatus: {
          draft: mockContracts.filter(c => c.status === 'draft').length,
          review: mockContracts.filter(c => c.status === 'review').length,
          negotiation: mockContracts.filter(c => c.status === 'negotiation').length,
          approved: mockContracts.filter(c => c.status === 'approved').length,
          signed: mockContracts.filter(c => c.status === 'signed').length,
          active: mockContracts.filter(c => c.status === 'active').length,
          expired: mockContracts.filter(c => c.status === 'expired').length
        },
        upcomingDeadlines: mockContracts
          .filter(c => c.renewalDate)
          .map(c => ({
            contractId: c.id,
            title: c.title,
            renewalDate: c.renewalDate,
            daysUntilRenewal: Math.ceil(
              (new Date(c.renewalDate!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
            )
          }))
          .filter(item => item.daysUntilRenewal <= 90)
          .sort((a, b) => a.daysUntilRenewal - b.daysUntilRenewal),
        riskDistribution: {
          low: mockContracts.filter(c => c.riskScore < 30).length,
          medium: mockContracts.filter(c => c.riskScore >= 30 && c.riskScore < 70).length,
          high: mockContracts.filter(c => c.riskScore >= 70).length
        }
      };

      res.json(report);
    } catch (error) {
      console.error('Error generating compliance report:', error);
      res.status(500).json({ message: 'Failed to generate compliance report' });
    }
  });
}