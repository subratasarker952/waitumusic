import React from 'react';
import CareerRecommendationWidget from '@/components/recommendations/CareerRecommendationWidget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Brain, TrendingUp, Target } from 'lucide-react';

export default function CareerRecommendations() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Brain className="h-8 w-8 text-primary animate-pulse" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Career Recommendations
          </h1>
          <Sparkles className="h-8 w-8 text-yellow-500 animate-bounce" />
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Get personalized, data-driven insights to accelerate your music career with our comprehensive recommendation system
        </p>
        <div className="flex justify-center space-x-2">
          <Badge variant="secondary" className="text-sm">
            <TrendingUp className="h-3 w-3 mr-1" />
            Market Analysis
          </Badge>
          <Badge variant="secondary" className="text-sm">
            <Target className="h-3 w-3 mr-1" />
            Strategic Planning
          </Badge>
          <Badge variant="secondary" className="text-sm">
            <Sparkles className="h-3 w-3 mr-1" />
            Career Growth
          </Badge>
        </div>
      </div>

      {/* Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Brain className="h-5 w-5 mr-2 text-blue-500" />
              Smart Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Our system analyzes your profile, booking history, and industry trends to provide personalized recommendations tailored to your specific role and career stage.
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
              Growth Tracking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Monitor your career progression with engagement scores, networking metrics, and booking trends to identify opportunities for improvement.
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Target className="h-5 w-5 mr-2 text-purple-500" />
              Actionable Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Receive specific action steps, timeframes, and expected outcomes to help you implement recommendations and achieve your career goals.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* How It Works */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>How AI Career Recommendations Work</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h3 className="font-semibold">Data Collection</h3>
              <p className="text-sm text-muted-foreground">
                Analyze your profile, bookings, and engagement patterns
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-green-600 font-bold">2</span>
              </div>
              <h3 className="font-semibold">AI Processing</h3>
              <p className="text-sm text-muted-foreground">
                Apply machine learning algorithms to identify patterns and opportunities
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-purple-600 font-bold">3</span>
              </div>
              <h3 className="font-semibold">Generate Insights</h3>
              <p className="text-sm text-muted-foreground">
                Create personalized recommendations based on your role and goals
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-orange-600 font-bold">4</span>
              </div>
              <h3 className="font-semibold">Take Action</h3>
              <p className="text-sm text-muted-foreground">
                Follow specific action steps to accelerate your career growth
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Recommendation Widget */}
      <CareerRecommendationWidget />

      {/* Role-Specific Information */}
      <Card>
        <CardHeader>
          <CardTitle>Role-Specific Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-600">Artists</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Booking optimization strategies</li>
                <li>• Price optimization guidance</li>
                <li>• Genre expansion opportunities</li>
                <li>• Marketing effectiveness analysis</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-green-600">Musicians</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Session work portfolio building</li>
                <li>• Equipment investment planning</li>
                <li>• Collaboration opportunities</li>
                <li>• Skill development recommendations</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-purple-600">Professionals</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Service expansion strategies</li>
                <li>• Certification opportunities</li>
                <li>• Client retention tactics</li>
                <li>• Premium pricing guidance</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-orange-600">Fans</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Music discovery suggestions</li>
                <li>• Event recommendations</li>
                <li>• Community engagement tips</li>
                <li>• Artist support strategies</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Success Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Track Your Success</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              The AI recommendation system tracks key performance indicators to measure your career growth:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <div className="text-2xl font-bold text-blue-600">85%</div>
                <div className="text-sm text-muted-foreground">Average Engagement Score</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-green-600">72%</div>
                <div className="text-sm text-muted-foreground">Network Growth Rate</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-purple-600">45%</div>
                <div className="text-sm text-muted-foreground">Booking Increase</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-orange-600">30%</div>
                <div className="text-sm text-muted-foreground">Revenue Growth</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}