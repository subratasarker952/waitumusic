import { Router, type Request, Response } from 'express';
import { authenticateToken } from '../auth';
import { storage } from '../storage';

const router = Router();

// OppHub Subscription Pricing Structure
export const OPPHUB_PRICING = {
  tiers: [
    {
      id: 'essential',
      name: 'OppHub Marketplace Essential',
      basePrice: 4.99,
      description: 'Perfect for emerging artists seeking opportunities',
      features: [
        'Global opportunity discovery (42+ sources)',
        'Basic AI application guidance',
        'Weekly opportunity alerts',
        'Basic analytics dashboard',
        'Email support',
        'Up to 10 opportunity applications per month'
      ],
      limits: {
        opportunityApplications: 10,
        aiGuidanceRequests: 20,
        socialMediaStrategies: 0
      }
    },
    {
      id: 'professional',
      name: 'OppHub Marketplace Professional', 
      basePrice: 9.99,
      description: 'Advanced AI guidance for growing music careers',
      features: [
        'All Essential features',
        'Advanced AI career recommendations',
        'Social media strategy generation (monthly)',
        'Priority opportunity matching',
        'Real-time platform health monitoring',
        'Live chat support',
        'Unlimited opportunity applications',
        'Custom opportunity alerts'
      ],
      limits: {
        opportunityApplications: -1, // Unlimited
        aiGuidanceRequests: 100,
        socialMediaStrategies: 1
      }
    },
    {
      id: 'enterprise',
      name: 'OppHub Marketplace Enterprise',
      basePrice: 19.99,
      description: 'Complete AI-powered music industry intelligence',
      features: [
        'All Professional features',
        'Custom AI training on your data',
        'Dedicated account manager',
        'API access and integrations', 
        'White-label dashboard options',
        '24/7 phone support',
        'Unlimited social media strategies',
        'Advanced business forecasting',
        'Priority feature requests'
      ],
      limits: {
        opportunityApplications: -1,
        aiGuidanceRequests: -1,
        socialMediaStrategies: -1
      }
    }
  ],
  
  managedUserDiscounts: {
    1: { // Publisher-level Management
      percentage: 10,
      name: 'Publisher-level Management',
      description: '10% discount for managed artists with publisher-level management'
    },
    2: { // Representation Level  
      percentage: 50,
      name: 'Representation Level',
      description: '50% discount for managed talent with representation-level management'
    },
    3: { // Full Management
      percentage: 100, 
      name: 'Full Management',
      description: '100% discount (free access) for full management-tier managed talent'
    },
    0: { // Regular Users
      percentage: 0,
      name: 'Regular Users',
      description: 'No discounts - full subscription rates apply'
    }
  },

  industryBenchmarks: [
    { name: 'Chartmetric Premium', price: 140, features: 'Music analytics only' },
    { name: 'Soundcharts Unlimited', price: 136, features: 'Streaming analytics' },
    { name: 'Viberate Professional', price: 19.90, features: 'Basic analytics' },
    { name: 'AIVA Pro', price: 36, features: 'AI music generation only' },
    { name: 'Artist Growth Platform', price: 100, features: 'Management software' }
  ],

  freeTrialPeriod: 14, // days
  
  calculateUserPrice(baseTier: string, managementLevel: number): number {
    const tier = this.tiers.find(t => t.id === baseTier);
    if (!tier) return 0;
    
    const discount = this.managedUserDiscounts[managementLevel] || this.managedUserDiscounts[0];
    const discountAmount = (tier.basePrice * discount.percentage) / 100;
    
    return Math.max(0, tier.basePrice - discountAmount);
  },

  getUserSubscriptionDetails(user: any): any {
    const managementLevel = this.determineManagemmentLevel(user);
    const discount = this.managedUserDiscounts[managementLevel];
    
    return {
      user: {
        name: user.fullName,
        email: user.email,
        roleId: user.roleId,
        managementLevel: managementLevel
      },
      discount: discount,
      availableTiers: this.tiers.map(tier => ({
        ...tier,
        userPrice: this.calculateUserPrice(tier.id, managementLevel),
        savings: tier.basePrice - this.calculateUserPrice(tier.id, managementLevel)
      })),
      industryComparison: this.industryBenchmarks
    };
  },

  determineManagemmentLevel(user: any): number {
    // This would be enhanced with actual management tier detection
    // For now, map based on roleId
    switch (user.roleId) {
      case 3: // Managed Artist
      case 5: // Managed Musician  
      case 7: // Managed Professional
        // Would need to check their actual management tier
        // For demo, assume Full Management for managed users
        return 3; // Full Management = 100% off
      case 4: // Artist
      case 6: // Musician
      case 8: // Professional
      case 9: // Fan
      default:
        return 0; // Regular users = 0% discount
    }
  }
};

// Get subscription pricing for current user
router.get('/pricing', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const subscriptionDetails = OPPHUB_PRICING.getUserSubscriptionDetails(user);
    
    res.json({
      success: true,
      data: subscriptionDetails,
      message: `Subscription pricing calculated for ${user.fullName}`
    });
  } catch (error) {
    console.error('Error getting subscription pricing:', error);
    res.status(500).json({ error: 'Failed to get subscription pricing' });
  }
});

// Get user's current subscription
router.get('/my-subscription', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Check if user has active subscription
    const subscription = await storage.getUserOppHubSubscription(user.id);
    const pricing = OPPHUB_PRICING.getUserSubscriptionDetails(user);
    
    res.json({
      success: true,
      subscription: subscription || null,
      pricing: pricing,
      hasActiveSubscription: !!subscription,
      freeTrialAvailable: !subscription && user.oppHubTrialUsed !== true
    });
  } catch (error) {
    console.error('Error getting user subscription:', error);
    res.status(500).json({ error: 'Failed to get subscription details' });
  }
});

// Subscribe to OppHub AI
router.post('/subscribe', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { tierId, paymentMethod } = req.body;
    
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const tier = OPPHUB_PRICING.tiers.find(t => t.id === tierId);
    if (!tier) {
      return res.status(400).json({ error: 'Invalid subscription tier' });
    }

    const managementLevel = OPPHUB_PRICING.determineManagemmentLevel(user);
    const finalPrice = OPPHUB_PRICING.calculateUserPrice(tierId, managementLevel);
    
    // Create subscription record
    const subscription = await storage.createOppHubSubscription({
      userId: user.id,
      tierId: tierId,
      tierName: tier.name,
      basePrice: tier.basePrice,
      discountPercentage: OPPHUB_PRICING.managedUserDiscounts[managementLevel].percentage,
      finalPrice: finalPrice,
      paymentMethod: paymentMethod,
      status: 'active',
      startDate: new Date(),
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      features: tier.features,
      limits: tier.limits
    });

    res.json({
      success: true,
      subscription: subscription,
      message: `Successfully subscribed to ${tier.name}`
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

// Cancel subscription
router.post('/cancel', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    await storage.cancelOppHubSubscription(user.id);
    
    res.json({
      success: true,
      message: 'Subscription cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

export default router;