import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useEnhancedToast } from '@/lib/toast-utils';
import { Eye, EyeOff, Users, Database, Music } from 'lucide-react';

interface DemoModeStatus {
  demoMode: boolean;
  message: string;
  availableArtists: string;
}

export default function DemoModeController() {
  const { toast } = useEnhancedToast();
  const queryClient = useQueryClient();

  // Fetch current demo mode status
  const { data: status, isLoading, error } = useQuery<DemoModeStatus>({
    queryKey: ['/api/demo-mode'],
    refetchInterval: 30000 // Refetch every 30 seconds
  });

  // Toggle demo mode mutation
  const toggleMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/demo-mode/toggle'),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/demo-mode'] });
      queryClient.invalidateQueries({ queryKey: ['/api/artists'] });
      queryClient.invalidateQueries({ queryKey: ['/api/songs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      
      toast({
        title: "Demo Mode Updated", 
        description: data.message,
        // duration will be set by useEnhancedToast from admin config
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to toggle demo mode",
        variant: "destructive",
      });
    }
  });

  // Seed live data mutation
  const seedDataMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/seed-live-data'),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/demo-mode'] });
      queryClient.invalidateQueries({ queryKey: ['/api/artists'] });
      queryClient.invalidateQueries({ queryKey: ['/api/songs'] });
      
      toast({
        title: "Live Data Seeded",
        description: `Successfully seeded authentic data for ${data.artists.join(', ')}`,
        // duration will be set by useEnhancedToast from admin config
      });
    },
    onError: (error: any) => {
      toast({
        title: "Seeding Error",
        description: error.message || "Failed to seed live artist data",
        variant: "destructive",
      });
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">Loading demo mode status...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-red-600">Error loading demo mode status</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {status?.demoMode ? (
            <Eye className="h-5 w-5 text-blue-600" />
          ) : (
            <EyeOff className="h-5 w-5 text-green-600" />
          )}
          Demo Mode Control
        </CardTitle>
        <CardDescription>
          Control visibility between authentic managed artist data and demo accounts
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Current Status */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <Badge variant={status?.demoMode ? "secondary" : "default"}>
              {status?.demoMode ? "Demo Mode" : "Live Mode"}
            </Badge>
            <span className="text-sm text-gray-600">
              {status?.message}
            </span>
          </div>
          <Switch
            checked={status?.demoMode || false}
            onCheckedChange={() => toggleMutation.mutate()}
            disabled={toggleMutation.isPending}
          />
        </div>

        {/* Artist Data Info */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-blue-600" />
              <h4 className="font-medium">Demo Data</h4>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Sample accounts for platform demonstration
            </p>
            <Badge variant="secondary">Multiple demo accounts</Badge>
          </div>

          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Music className="h-4 w-4 text-green-600" />
              <h4 className="font-medium">Live Data</h4>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Authentic managed artist profiles
            </p>
            <div className="space-y-1">
              <Badge variant="outline" className="mr-1">Lí-Lí Octave</Badge>
              <Badge variant="outline" className="mr-1">JCro</Badge>
              <Badge variant="outline" className="mr-1">Janet Azzouz</Badge>
              <Badge variant="outline">Princess Trinidad</Badge>
            </div>
          </div>
        </div>

        {/* Current Data Display */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Database className="h-4 w-4 text-blue-600" />
            <h4 className="font-medium">Currently Showing:</h4>
          </div>
          <p className="text-sm text-blue-800">
            {status?.availableArtists}
          </p>
        </div>

        {/* Management Actions */}
        <div className="space-y-3 pt-4 border-t">
          <h4 className="font-medium">Management Actions</h4>
          
          <Button
            onClick={() => seedDataMutation.mutate()}
            disabled={seedDataMutation.isPending}
            variant="outline"
            className="w-full"
          >
            {seedDataMutation.isPending ? (
              "Seeding Live Data..."
            ) : (
              "Seed Live Artist Data"
            )}
          </Button>

          <p className="text-xs text-gray-500">
            This will populate the database with authentic data for the four managed artists: 
            Lí-Lí Octave, JCro, Janet Azzouz, and Princess Trinidad.
          </p>
        </div>

        {/* Features Summary */}
        <div className="text-xs text-gray-500 pt-2 border-t">
          <h5 className="font-medium mb-1">Demo Mode Features:</h5>
          <ul className="space-y-1">
            <li>• Switch between authentic managed artist data and demo accounts</li>
            <li>• Impressive live demonstrations with real artist achievements</li>
            <li>• Complete artist profiles with authentic discographies</li>
            <li>• Perfect for showcasing platform capabilities to industry professionals</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}