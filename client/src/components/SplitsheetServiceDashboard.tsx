import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Link, useLocation } from 'wouter';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


import { 
  FileText, 
  ShoppingCart, 
  CreditCard, 
  CheckCircle, 
  Clock,
  DollarSign,
  Users,
  Signature,
  Music,
  Award,
  Zap
} from 'lucide-react';



interface SplitsheetServiceDashboardProps {
  user: any;
}

export default function SplitsheetServiceDashboard({ user }: SplitsheetServiceDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [, setLocation] = useLocation();
  const { addItem } = useCart();
  const { toast } = useToast();

  // Fetch service pricing from database
  const { data: servicePricing } = useQuery({
    queryKey: ['/api/service-pricing', 'Create Splitsheet'],
    queryFn: async () => {
      const response = await apiRequest('/api/service-pricing/Create Splitsheet');
      return response.json();
    }
  });

  const basePrice = servicePricing?.basePrice || 15.00;

  // Get user's management tier and discount
  const getManagementDiscount = () => {
    if (!user.isManaged) return { tier: 'none', discount: 0, finalPrice: basePrice };
    
    // Based on management tier
    const tier = user.managementTier || 'publisher';
    const discounts = {
      publisher: servicePricing?.publisherDiscount || 10,
      representation: servicePricing?.representationDiscount || 50,
      fullManagement: servicePricing?.fullManagementDiscount || 100
    };
    
    const discount = discounts[tier as keyof typeof discounts] || 0;
    const finalPrice = discount === 100 ? 0 : (basePrice * (1 - discount / 100));
    
    return { tier, discount, finalPrice: Math.round(finalPrice * 100) / 100 };
  };

  const { tier, discount, finalPrice } = getManagementDiscount();

  // Query user's splitsheets
  const { data: userSplitsheets = [], isLoading } = useQuery({
    queryKey: ['/api/user/splitsheets', user.id],
  });

  const handleAddToCart = () => {
    const service = {
      itemId: 'splitsheet-service',
      title: 'Digital Splitsheet Management',
      price: finalPrice,
      artist: 'Wai\'tuMusic',
      quantity: 1,
      type: 'service' as const,
      originalPrice: basePrice,
      discount: discount,
      description: 'Professional splitsheet creation and management'
    };

    addItem(service);
    
    toast({
      title: "Added to Cart",
      description: `Splitsheet service added with ${discount}% discount`,
    });
  };

  const handleCreateSplitsheet = () => {
    // Navigate to enhanced splitsheet using proper React routing
    setLocation('/enhanced-splitsheet');
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Service Pricing Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Service Pricing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Digital Splitsheet Management</p>
                <p className="text-sm text-muted-foreground">Professional creation and signing workflow</p>
              </div>
              <div className="text-right">
                {discount > 0 && (
                  <p className="text-sm text-muted-foreground line-through">${basePrice.toFixed(2)}</p>
                )}
                <p className="text-xl font-bold">
                  {finalPrice === 0 ? 'FREE' : `$${finalPrice}`}
                </p>
                {discount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {discount}% OFF
                  </Badge>
                )}
              </div>
            </div>
            
            {user.isManaged && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                <p className="text-sm text-emerald-700 dark:text-emerald-300">
                  <Award className="h-4 w-4 inline mr-1" />
                  Management Tier Benefit: {tier === 'fullManagement' ? 'Free Service' : `${discount}% Discount`}
                </p>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button onClick={handleAddToCart} className="flex-1">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
              <Button onClick={handleCreateSplitsheet} variant="outline" className="flex-1">
                <FileText className="h-4 w-4 mr-2" />
                Create Now
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Service Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-emerald-500 mt-1" />
              <div>
                <p className="font-medium">Professional Creation</p>
                <p className="text-sm text-muted-foreground">Industry-standard splitsheet format with validation</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Signature className="h-5 w-5 text-emerald-500 mt-1" />
              <div>
                <p className="font-medium">Digital Signatures</p>
                <p className="text-sm text-muted-foreground">3 signing modes: Upload, draw, or type signatures</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-emerald-500 mt-1" />
              <div>
                <p className="font-medium">Multi-Party Workflow</p>
                <p className="text-sm text-muted-foreground">Automatic notifications and tracking</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Music className="h-5 w-5 text-emerald-500 mt-1" />
              <div>
                <p className="font-medium">DJ Integration</p>
                <p className="text-sm text-muted-foreground">Automatic song access after completion</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderMySplitsheets = () => (
    <div className="space-y-4">
      {isLoading ? (
        <div className="text-center py-8">
          <Clock className="h-8 w-8 mx-auto mb-2 animate-spin" />
          <p>Loading your splitsheets...</p>
        </div>
      ) : (userSplitsheets as any[]).length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No Splitsheets Yet</h3>
            <p className="text-muted-foreground mb-4">Create your first professional splitsheet to get started</p>
            <Button onClick={handleCreateSplitsheet}>
              <FileText className="h-4 w-4 mr-2" />
              Create First Splitsheet
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {(userSplitsheets as any[]).map((splitsheet: any) => (
            <Card key={splitsheet.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{splitsheet.songTitle}</CardTitle>
                  <Badge variant={splitsheet.status === 'completed' ? 'default' : 'secondary'}>
                    {splitsheet.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    {splitsheet.isrcCode && (
                      <p className="text-sm text-muted-foreground">ISRC: {splitsheet.isrcCode}</p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Created {new Date(splitsheet.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">View</Button>
                    {splitsheet.status === 'draft' && (
                      <Button size="sm">Continue</Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Splitsheet Management</h2>
          <p className="text-muted-foreground">Professional splitsheet creation and signing service</p>
        </div>
        <Link to="/splitsheet">
          <Button>
            <FileText className="h-4 w-4 mr-2" />
            Create Splitsheet
          </Button>
        </Link>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Service Overview</TabsTrigger>
          <TabsTrigger value="my-splitsheets">My Splitsheets</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {renderOverview()}
        </TabsContent>

        <TabsContent value="my-splitsheets">
          {renderMySplitsheets()}
        </TabsContent>
      </Tabs>


    </div>
  );
}