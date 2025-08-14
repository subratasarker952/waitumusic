import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Target } from 'lucide-react';
import { useLocation } from 'wouter';
import OpportunityMatcher from '@/components/OpportunityMatcher';

export default function OpportunityMatching() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => setLocation('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-center gap-3 mb-2">
            <Target className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">AI-Powered Opportunity Matching</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Discover personalized opportunities with intelligent matching algorithms tailored to your profile and career goals.
          </p>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Your Personalized Opportunity Feed</CardTitle>
            <p className="text-gray-600">
              Our AI analyzes your profile, skills, location, and career stage to find the most relevant opportunities for you.
            </p>
          </CardHeader>
          <CardContent>
            <OpportunityMatcher />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}