import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  User, Music, Briefcase, Heart, CheckCircle, ArrowRight,
  Sparkles, Target, Lightbulb, Users, Star, Award,
  Brain, Zap, Calendar, MapPin, X
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
  optional: boolean;
}

interface UserProfile {
  role: 'artist' | 'musician' | 'professional' | 'fan';
  interests: string[];
  goals: string[];
  experience: 'beginner' | 'intermediate' | 'professional';
  location?: string;
  genre?: string[];
  services?: string[];
}

interface PersonalizedRecommendation {
  type: 'feature' | 'action' | 'connection' | 'opportunity';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  actionUrl?: string;
  actionText?: string;
}

interface IntelligentUserOnboardingProps {
  isOpen: boolean;
  onComplete: () => void;
  onClose?: () => void;
  userId: number;
  currentStep?: number;
}

export default function IntelligentUserOnboarding({ 
  isOpen, 
  onComplete, 
  onClose, 
  userId, 
  currentStep = 1 
}: IntelligentUserOnboardingProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(currentStep);
  const [profile, setProfile] = useState<UserProfile>({
    role: 'fan',
    interests: [],
    goals: [],
    experience: 'beginner'
  });
  const [recommendations, setRecommendations] = useState<PersonalizedRecommendation[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Wai\'tuMusic',
      description: 'Let\'s personalize your experience',
      icon: <Sparkles className="h-6 w-6" />,
      completed: step > 1,
      optional: false
    },
    {
      id: 'role',
      title: 'Choose Your Role',
      description: 'Help us understand how you\'ll use the platform',
      icon: <User className="h-6 w-6" />,
      completed: step > 2,
      optional: false
    },
    {
      id: 'preferences',
      title: 'Your Preferences',
      description: 'Tell us about your musical interests and goals',
      icon: <Target className="h-6 w-6" />,
      completed: step > 3,
      optional: false
    },
    {
      id: 'ai-analysis',
      title: 'AI Personalization',
      description: 'Our AI creates your personalized experience',
      icon: <Brain className="h-6 w-6" />,
      completed: step > 4,
      optional: false
    },
    {
      id: 'recommendations',
      title: 'Your Recommendations',
      description: 'Discover features and opportunities tailored for you',
      icon: <Lightbulb className="h-6 w-6" />,
      completed: step > 5,
      optional: false
    }
  ];

  // Save onboarding progress
  const saveProgressMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('/api/onboarding/progress', {
        method: 'POST',
        body: { userId, step, ...data }
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
    }
  });

  // Generate AI recommendations
  const generateRecommendations = async () => {
    setIsAnalyzing(true);
    try {
      const response = await apiRequest('/api/onboarding/ai-recommendations', {
        method: 'POST',
        body: { userId, profile }
      });
      const data = await response.json();
      setRecommendations(data.recommendations || mockRecommendations);
    } catch (error) {
      // Use mock recommendations for demo
      setRecommendations(mockRecommendations);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Mock recommendations based on profile
  const mockRecommendations: PersonalizedRecommendation[] = [
    {
      type: 'feature',
      title: 'Explore Artist Profiles',
      description: `Discover ${profile.role === 'fan' ? 'amazing artists' : 'potential collaborators'} in your favorite genres`,
      priority: 'high',
      actionUrl: '/artists',
      actionText: 'Browse Artists'
    },
    {
      type: 'action',
      title: 'Complete Your Profile',
      description: 'Add more details to help others discover and connect with you',
      priority: 'high',
      actionUrl: '/profile',
      actionText: 'Edit Profile'
    },
    {
      type: 'opportunity',
      title: 'Book Your First Event',
      description: 'Ready to experience live music? Browse upcoming events and book tickets',
      priority: 'medium',
      actionUrl: '/bookings',
      actionText: 'Explore Events'
    },
    {
      type: 'connection',
      title: 'Join the Community',
      description: 'Connect with other music lovers and industry professionals',
      priority: 'medium',
      actionUrl: '/community',
      actionText: 'Join Now'
    }
  ];

  const roleOptions = [
    { value: 'artist', label: 'Artist', description: 'I create and perform music', icon: <Music className="h-4 w-4" /> },
    { value: 'musician', label: 'Musician', description: 'I play instruments or provide musical services', icon: <Users className="h-4 w-4" /> },
    { value: 'professional', label: 'Music Professional', description: 'I work in the music industry', icon: <Briefcase className="h-4 w-4" /> },
    { value: 'fan', label: 'Music Fan', description: 'I love music and want to discover artists', icon: <Heart className="h-4 w-4" /> }
  ];

  const interestOptions = [
    'Caribbean Music', 'Afrobeats', 'Hip-Hop', 'R&B', 'Neo Soul', 'Dancehall',
    'Reggae', 'Pop', 'Jazz', 'Gospel', 'Soca', 'Calypso', 'Electronic', 'World Music'
  ];

  const goalOptions = {
    artist: ['Build fanbase', 'Book more gigs', 'Release music', 'Collaborate', 'Get discovered'],
    musician: ['Find work opportunities', 'Network with artists', 'Showcase skills', 'Join bands'],
    professional: ['Find clients', 'Offer services', 'Network', 'Build reputation'],
    fan: ['Discover new music', 'Attend events', 'Support artists', 'Connect with community']
  };

  const handleNext = () => {
    if (step === 4) {
      generateRecommendations();
    }
    
    if (step < 5) {
      setStep(step + 1);
      saveProgressMutation.mutate(profile);
    }
  };

  const handleComplete = () => {
    saveProgressMutation.mutate({ ...profile, completed: true });
    toast({
      title: "Welcome aboard!",
      description: "Your personalized experience is ready. Enjoy exploring Wai'tuMusic!"
    });
    onComplete();
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'feature': return <Star className="h-5 w-5 text-blue-500" />;
      case 'action': return <Zap className="h-5 w-5 text-orange-500" />;
      case 'opportunity': return <Calendar className="h-5 w-5 text-green-500" />;
      case 'connection': return <Users className="h-5 w-5 text-purple-500" />;
      default: return <Lightbulb className="h-5 w-5 text-yellow-500" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-purple-600" />
              Intelligent Onboarding
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{step} of 5</Badge>
              {onClose && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onClose}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={(step / 5) * 100} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Getting started</span>
              <span>{Math.round((step / 5) * 100)}% complete</span>
            </div>
          </div>

          {/* Step Indicators */}
          <div className="flex items-center gap-2 mt-4 overflow-x-auto">
            {steps.map((s, index) => (
              <div key={s.id} className="flex items-center gap-2 flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                  s.completed ? 'bg-green-500 text-white' : 
                  step === index + 1 ? 'bg-purple-600 text-white' : 
                  'bg-gray-200 text-gray-600'
                }`}>
                  {s.completed ? <CheckCircle className="h-4 w-4" /> : index + 1}
                </div>
                {index < steps.length - 1 && (
                  <ArrowRight className="h-3 w-3 text-gray-400" />
                )}
              </div>
            ))}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          
          {/* Step 1: Welcome */}
          {step === 1 && (
            <div className="text-center space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Welcome to Wai'tuMusic! 🎵</h2>
                <p className="text-muted-foreground">
                  We're excited to help you discover, connect, and thrive in the Caribbean music scene.
                  Let's create a personalized experience just for you.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg text-center">
                  <Music className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <h3 className="font-medium">Discover</h3>
                  <p className="text-sm text-muted-foreground">Find amazing Caribbean artists</p>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <Users className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <h3 className="font-medium">Connect</h3>
                  <p className="text-sm text-muted-foreground">Network with music professionals</p>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <Star className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                  <h3 className="font-medium">Grow</h3>
                  <p className="text-sm text-muted-foreground">Build your music career</p>
                </div>
              </div>

              <Button onClick={handleNext} className="w-full">
                Let's Get Started <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Step 2: Role Selection */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-bold mb-2">What describes you best?</h2>
                <p className="text-muted-foreground">Choose the role that best fits how you'll use Wai'tuMusic</p>
              </div>

              <div className="space-y-3">
                {roleOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      profile.role === option.value ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setProfile({...profile, role: option.value as any})}
                  >
                    <div className="flex items-center gap-3">
                      {option.icon}
                      <div>
                        <h3 className="font-medium">{option.label}</h3>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                      {profile.role === option.value && (
                        <CheckCircle className="h-5 w-5 text-blue-500 ml-auto" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <Button 
                onClick={handleNext} 
                className="w-full" 
                disabled={!profile.role}
              >
                Continue <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Step 3: Preferences */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-bold mb-2">Tell us about your musical interests</h2>
                <p className="text-muted-foreground">This helps us recommend the perfect content for you</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Musical Genres (select all that apply)</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {interestOptions.map((interest) => (
                      <Button
                        key={interest}
                        variant={profile.interests.includes(interest) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          const newInterests = profile.interests.includes(interest)
                            ? profile.interests.filter(i => i !== interest)
                            : [...profile.interests, interest];
                          setProfile({...profile, interests: newInterests});
                        }}
                      >
                        {interest}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Your Goals</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {goalOptions[profile.role].map((goal) => (
                      <Button
                        key={goal}
                        variant={profile.goals.includes(goal) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          const newGoals = profile.goals.includes(goal)
                            ? profile.goals.filter(g => g !== goal)
                            : [...profile.goals, goal];
                          setProfile({...profile, goals: newGoals});
                        }}
                      >
                        {goal}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Experience Level</label>
                  <Select value={profile.experience} onValueChange={(value: any) => 
                    setProfile({...profile, experience: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner - Just getting started</SelectItem>
                      <SelectItem value="intermediate">Intermediate - Some experience</SelectItem>
                      <SelectItem value="professional">Professional - Industry experience</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Location (Optional)</label>
                  <Input 
                    placeholder="City, Country"
                    value={profile.location || ''}
                    onChange={(e) => setProfile({...profile, location: e.target.value})}
                  />
                </div>
              </div>

              <Button 
                onClick={handleNext} 
                className="w-full"
                disabled={profile.interests.length === 0 || profile.goals.length === 0}
              >
                Continue <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Step 4: AI Analysis */}
          {step === 4 && (
            <div className="text-center space-y-6">
              <div>
                <Brain className="h-16 w-16 mx-auto mb-4 text-purple-600" />
                <h2 className="text-xl font-bold mb-2">Creating Your Personalized Experience</h2>
                <p className="text-muted-foreground">
                  Our AI is analyzing your preferences to create personalized recommendations and features just for you.
                </p>
              </div>

              {isAnalyzing ? (
                <div className="space-y-4">
                  <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto"></div>
                  <div className="space-y-2">
                    <p className="text-sm">Analyzing your musical preferences...</p>
                    <Progress value={75} className="h-2" />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
                  <p className="text-green-600 font-medium">Analysis Complete!</p>
                  <Button onClick={handleNext} className="w-full">
                    View My Recommendations <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Step 5: Recommendations */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="text-center">
                <Award className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
                <h2 className="text-xl font-bold mb-2">Your Personalized Recommendations</h2>
                <p className="text-muted-foreground">
                  Based on your preferences, here's what we recommend to get you started
                </p>
              </div>

              <div className="space-y-4">
                {recommendations.map((rec, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getRecommendationIcon(rec.type)}
                        <div>
                          <h4 className="font-medium">{rec.title}</h4>
                          <p className="text-sm text-muted-foreground mb-2">{rec.description}</p>
                          <Badge variant={rec.priority === 'high' ? 'destructive' : 
                                        rec.priority === 'medium' ? 'default' : 'secondary'}>
                            {rec.priority} priority
                          </Badge>
                        </div>
                      </div>
                      {rec.actionUrl && (
                        <Button size="sm" variant="outline">
                          {rec.actionText || 'Learn More'}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(4)}>
                  Back
                </Button>
                <Button onClick={handleComplete} className="flex-1">
                  Complete Setup <CheckCircle className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}