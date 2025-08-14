import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DollarSign, RefreshCw, Settings, Save } from 'lucide-react';

export function SuperadminPROManagement() {
  const [fees, setFees] = useState({
    adminFee: 30,
    handlingFee: 10,
    servicePricing: {
      basic: 49,
      premium: 89,
      enterprise: 149
    }
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current PRO fees
  const { data: proFeesData, isLoading } = useQuery({
    queryKey: ['/api/admin/pro-fees'],
    queryFn: async () => {
      const ascap = await apiRequest('/api/pro-fees/ASCAP');
      const bmi = await apiRequest('/api/pro-fees/BMI');
      const sesac = await apiRequest('/api/pro-fees/SESAC');
      const gmr = await apiRequest('/api/pro-fees/GMR');
      
      return {
        ASCAP: await ascap.json(),
        BMI: await bmi.json(),
        SESAC: await sesac.json(),
        GMR: await gmr.json()
      };
    }
  });

  const updatePROServiceFees = async () => {
    try {
      await apiRequest('/api/admin/pro-service-fees', {
        method: 'POST',
        body: JSON.stringify(fees)
      });
      
      toast({
        title: "PRO Service Fees Updated",
        description: "All fee structures have been updated successfully"
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pro-fees'] });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update PRO service fees",
        variant: "destructive"
      });
    }
  };

  const refreshPROFees = async () => {
    try {
      await apiRequest('/api/admin/refresh-pro-fees', {
        method: 'POST'
      });
      
      toast({
        title: "PRO Fees Refreshed",
        description: "Real-time fees updated from OppHub scanner"
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pro-fees'] });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh PRO fees",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">PRO Service Management</h2>
        <Button onClick={refreshPROFees} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh OppHub Fees
        </Button>
      </div>

      {/* Real-time PRO Fees Display */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {proFeesData && Object.entries(proFeesData).map(([pro, data]: [string, any]) => (
          <Card key={pro}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{pro}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                ${data.membershipFee}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {data.source === 'oppHub_real_time' ? (
                  <span className="text-green-600">✓ OppHub Live</span>
                ) : (
                  <span className="text-amber-600">⚠ Default</span>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                Updated: {new Date(data.lastUpdated).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Wai'tuMusic Service Pricing Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Wai'tuMusic PRO Service Pricing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="adminFee">Admin Processing Fee ($)</Label>
              <Input
                id="adminFee"
                type="number"
                min="0"
                step="0.01"
                value={fees.adminFee}
                onChange={(e) => setFees({ ...fees, adminFee: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label htmlFor="handlingFee">Document Handling Fee ($)</Label>
              <Input
                id="handlingFee"
                type="number"
                min="0"
                step="0.01"
                value={fees.handlingFee}
                onChange={(e) => setFees({ ...fees, handlingFee: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-semibold mb-3">Service Tier Pricing</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="basicFee">Basic Service ($)</Label>
                <Input
                  id="basicFee"
                  type="number"
                  min="0"
                  step="0.01"
                  value={fees.servicePricing.basic}
                  onChange={(e) => setFees({
                    ...fees,
                    servicePricing: { ...fees.servicePricing, basic: parseFloat(e.target.value) || 0 }
                  })}
                />
              </div>
              <div>
                <Label htmlFor="premiumFee">Premium Service ($)</Label>
                <Input
                  id="premiumFee"
                  type="number"
                  min="0"
                  step="0.01"
                  value={fees.servicePricing.premium}
                  onChange={(e) => setFees({
                    ...fees,
                    servicePricing: { ...fees.servicePricing, premium: parseFloat(e.target.value) || 0 }
                  })}
                />
              </div>
              <div>
                <Label htmlFor="enterpriseFee">Enterprise Service ($)</Label>
                <Input
                  id="enterpriseFee"
                  type="number"
                  min="0"
                  step="0.01"
                  value={fees.servicePricing.enterprise}
                  onChange={(e) => setFees({
                    ...fees,
                    servicePricing: { ...fees.servicePricing, enterprise: parseFloat(e.target.value) || 0 }
                  })}
                />
              </div>
            </div>
          </div>

          <Button onClick={updatePROServiceFees} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            Update Service Fees
          </Button>
        </CardContent>
      </Card>

      {/* Pricing Formula Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Total Cost Calculation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Formula:</h4>
            <p className="text-sm">
              <strong>Total Cost = </strong>
              Wai'tuMusic Admin Fee + PRO Membership Fee (Real-time) + Handling Fee
            </p>
            <div className="mt-3 text-xs text-muted-foreground">
              • Admin fees are set by superadmin and apply to all registrations<br/>
              • PRO membership fees are updated in real-time by OppHub scanner<br/>
              • Handling fees cover document preparation and submission<br/>
              • MoBanking option available for National Bank of Dominica customers ($100 XCD)
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}