import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function OpportunityMatcherSimple() {
  // Test API calls
  const { data: recommendations, isLoading: recommendationsLoading, error: recommendationsError } = useQuery({
    queryKey: ['/api/opportunity-matching/recommendations-simple'],
    queryFn: async () => {
      console.log('Making recommendations API call...');
      const response = await apiRequest('/api/opportunity-matching/recommendations', { method: 'POST' });
      console.log('Recommendations response:', response);
      return response;
    }
  });

  const { data: profileScore, isLoading: profileLoading, error: profileError } = useQuery({
    queryKey: ['/api/opportunity-matching/profile-score-simple'],
    queryFn: async () => {
      console.log('Making profile score API call...');
      const response = await apiRequest('/api/opportunity-matching/profile-score/me');
      console.log('Profile score response:', response);
      return response;
    }
  });

  console.log('Simple component state:', {
    recommendations,
    profileScore,
    recommendationsLoading,
    profileLoading,
    recommendationsError,
    profileError,
    bothLoading: recommendationsLoading && profileLoading
  });

  if (recommendationsLoading && profileLoading) {
    return (
      <div className="p-4 border border-dashed border-gray-300 rounded-lg">
        <p className="text-center">Loading both queries...</p>
      </div>
    );
  }

  if (recommendationsError || profileError) {
    return (
      <div className="p-4 border border-red-300 bg-red-50 rounded-lg">
        <p className="text-red-600">Error loading data:</p>
        {recommendationsError && <p className="text-sm text-red-500">Recommendations: {String(recommendationsError)}</p>}
        {profileError && <p className="text-sm text-red-500">Profile: {String(profileError)}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 border border-green-300 bg-green-50 rounded-lg">
      <h2 className="text-lg font-semibold">Simple OpportunityMatcher Test</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>Profile Score</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Profile Completeness: {(profileScore as any)?.profile_completeness || 0}%</p>
          <p>Managed Status: {(profileScore as any)?.managed_status ? 'Yes' : 'No'}</p>
          <p>Experience Level: {(profileScore as any)?.experience_level || 'Unknown'}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Matches Found: {(recommendations as any)?.matches?.length || 0}</p>
          <p>Insights: {(recommendations as any)?.insights?.length || 0}</p>
          <p>Profile Tips: {(recommendations as any)?.profile_tips?.length || 0}</p>
          
          {(recommendations as any)?.insights && (recommendations as any).insights.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium">Insights:</h4>
              <ul className="list-disc list-inside">
                {(recommendations as any).insights.map((insight: string, index: number) => (
                  <li key={index} className="text-sm">{insight}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="text-xs text-gray-500">
        <p>Loading states: Recs={String(recommendationsLoading)}, Profile={String(profileLoading)}</p>
        <p>Data available: Recs={!!recommendations}, Profile={!!profileScore}</p>
      </div>
    </div>
  );
}