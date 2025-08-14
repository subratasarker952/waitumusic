import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Music, Settings, Save, DollarSign, Users } from 'lucide-react';

export function SuperadminISRCManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current ISRC service pricing from database
  const { data: currentPricing, isLoading } = useQuery({
    queryKey: ['/api/isrc-service-pricing'],
    queryFn: async () => {
      const response = await apiRequest('/api/isrc-service-pricing');
      return response.json();
    }
  });

  const [pricing, setPricing] = useState({
    basePrice: 5.00, // Default value, will be updated from database
    publisherDiscount: 10,
    representationDiscount: 50,
    fullManagementDiscount: 100,
    coverArtValidationFee: 2.00,
    metadataEmbeddingFee: 3.00
  });

  // Update local state when database pricing is loaded
  React.useEffect(() => {
    if (currentPricing) {
      setPricing(prev => ({
        ...prev,
        basePrice: currentPricing.basePrice || 5.00,
        publisherDiscount: currentPricing.publisherDiscount || 10,
        representationDiscount: currentPricing.representationDiscount || 50,
        fullManagementDiscount: currentPricing.fullManagementDiscount || 100,
        coverArtValidationFee: currentPricing.coverArtValidationFee || 2.00,
        metadataEmbeddingFee: currentPricing.metadataEmbeddingFee || 3.00
      }));
    }
  }, [currentPricing]);

  // Fetch ISRC submissions overview
  const { data: submissionsData } = useQuery({
    queryKey: ['/api/admin/isrc-submissions-overview'],
    queryFn: async () => {
      const response = await apiRequest('/api/admin/isrc-submissions-overview');
      return response.json();
    }
  });

  const updateISRCPricing = async () => {
    try {
      await apiRequest('/api/admin/isrc-service-pricing', {
        method: 'POST',
        body: JSON.stringify(pricing)
      });
      
      toast({
        title: "ISRC Service Pricing Updated",
        description: "All pricing tiers have been updated successfully"
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/isrc-service-pricing'] });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update ISRC service pricing",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Music className="h-6 w-6 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">ISRC Song Coding Service Management</h2>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Managed Artists Only</p>
          <p className="text-lg font-bold text-primary">Base Price: ${pricing.basePrice}</p>
        </div>
      </div>

      {/* Service Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {submissionsData?.totalSubmissions || 0}
            </div>
            <div className="text-xs text-muted-foreground">
              All time submissions
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {submissionsData?.pendingSubmissions || 0}
            </div>
            <div className="text-xs text-muted-foreground">
              Awaiting processing
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {submissionsData?.completedSubmissions || 0}
            </div>
            <div className="text-xs text-muted-foreground">
              Successfully coded
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              ${submissionsData?.totalRevenue || '0.00'}
            </div>
            <div className="text-xs text-muted-foreground">
              Total service revenue
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pricing Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            ISRC Service Pricing Control
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="basePrice">Base Price per Song ($)</Label>
              <Input
                id="basePrice"
                type="number"
                min="0"
                step="0.01"
                value={pricing.basePrice}
                onChange={(e) => setPricing({ ...pricing, basePrice: parseFloat(e.target.value) || 0 })}
              />
              <p className="text-xs text-muted-foreground mt-1">Standard pricing for song coding service</p>
            </div>
            
            <div>
              <Label htmlFor="coverArtFee">Cover Art Validation Fee ($)</Label>
              <Input
                id="coverArtFee"
                type="number"
                min="0"
                step="0.01"
                value={pricing.coverArtValidationFee}
                onChange={(e) => setPricing({ ...pricing, coverArtValidationFee: parseFloat(e.target.value) || 0 })}
              />
              <p className="text-xs text-muted-foreground mt-1">Apple Music compliance validation</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Management Tier Discounts
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="publisherDiscount">Publisher Tier (%)</Label>
                <Input
                  id="publisherDiscount"
                  type="number"
                  min="0"
                  max="100"
                  value={pricing.publisherDiscount}
                  onChange={(e) => setPricing({ ...pricing, publisherDiscount: parseFloat(e.target.value) || 0 })}
                />
                <p className="text-xs text-muted-foreground mt-1">10% standard discount</p>
              </div>
              
              <div>
                <Label htmlFor="representationDiscount">Representation Tier (%)</Label>
                <Input
                  id="representationDiscount"
                  type="number"
                  min="0"
                  max="100"
                  value={pricing.representationDiscount}
                  onChange={(e) => setPricing({ ...pricing, representationDiscount: parseFloat(e.target.value) || 0 })}
                />
                <p className="text-xs text-muted-foreground mt-1">50% standard discount</p>
              </div>
              
              <div>
                <Label htmlFor="fullManagementDiscount">Full Management Tier (%)</Label>
                <Input
                  id="fullManagementDiscount"
                  type="number"
                  min="0"
                  max="100"
                  value={pricing.fullManagementDiscount}
                  onChange={(e) => setPricing({ ...pricing, fullManagementDiscount: parseFloat(e.target.value) || 0 })}
                />
                <p className="text-xs text-muted-foreground mt-1">100% discount (free service)</p>
              </div>
            </div>
          </div>

          <Button onClick={updateISRCPricing} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            Update ISRC Service Pricing
          </Button>
        </CardContent>
      </Card>

      {/* Service Features Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            ISRC Coding Service Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Automated Processing</h4>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li>• ISRC code generation (DM-WTM-YY-XXXXX scheme)</li>
                <li>• Odd numbers for releases, even for remixes</li>
                <li>• 9 before last two digits for video (48kHz)</li>
                <li>• Cover art validation (3000x3000px Apple Music)</li>
                <li>• Metadata embedding (WAV/MP3)</li>
                <li>• Vocal-removed versions for DJ setlists</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Splitsheet Management</h4>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li>• Composer/writer information capture</li>
                <li>• Recording artist and label data</li>
                <li>• Publishing percentage allocation</li>
                <li>• PRO affiliation tracking</li>
                <li>• Studio and publisher details</li>
                <li>• Excel-style catalog storage</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">Access Control</h4>
            <p className="text-sm text-muted-foreground">
              ISRC song coding service is exclusively available to managed artists, musicians, and professionals. 
              Regular users must apply for management status to access this premium service offering.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}