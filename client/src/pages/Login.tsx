import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Music } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import IntelligentUserOnboarding from '@/components/onboarding/IntelligentUserOnboarding';
import { LOGIN_CONTENT, SITE_CONFIG } from '@shared/content-config';
import { getCreativeRoleName } from '@shared/creative-roles';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [newUserId, setNewUserId] = useState<number | null>(null);
  const { login, user } = useAuth();

  // Fetch demo mode setting
  const { data: demoModeData } = useQuery({
    queryKey: ['/api/demo-mode'],
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const loginResult = await login(data.email, data.password);
      if (loginResult) {
        // Get the logged-in user data after successful login
        setTimeout(() => {
          if (user?.id) {
            // Check if user needs onboarding (for new users or users who haven't completed it)
            const shouldShowOnboarding = localStorage.getItem(`onboarding_completed_${user.id}`) !== 'true';
            
            if (shouldShowOnboarding) {
              setNewUserId(user.id);
              setShowOnboarding(true);
            } else {
              setLocation('/dashboard');
            }
          } else {
            setLocation('/dashboard');
          }
        }, 100); // Small delay to ensure user state is updated
      }
    } finally {
      setIsLoading(false);
    }
  };



  const handleOnboardingComplete = () => {
    if (newUserId) {
      localStorage.setItem(`onboarding_completed_${newUserId}`, 'true');
    }
    setShowOnboarding(false);
    setLocation('/dashboard');
  };

  const handleOnboardingSkip = () => {
    setShowOnboarding(false);
    setLocation('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-secondary px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-white rounded-full flex items-center justify-center mb-4">
            <Music className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-white">{SITE_CONFIG.name}</h1>
          <p className="text-gray-200">{LOGIN_CONTENT.subtitle}</p>
        </div>

        {/* Login Form */}
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
          <CardHeader>
            <CardTitle>{LOGIN_CONTENT.title}</CardTitle>
            <CardDescription>
              {LOGIN_CONTENT.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{LOGIN_CONTENT.form.email.label}</FormLabel>
                      <FormControl>
                        <Input placeholder={LOGIN_CONTENT.form.email.placeholder} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{LOGIN_CONTENT.form.password.label}</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder={LOGIN_CONTENT.form.password.placeholder} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full gradient-primary" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {LOGIN_CONTENT.form.submitting}
                    </>
                  ) : (
                    LOGIN_CONTENT.form.submit
                  )}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center text-sm">
              <span className="text-gray-600">{LOGIN_CONTENT.footer.noAccount} </span>
              <Link href="/register" className="text-primary hover:underline font-medium">
                {LOGIN_CONTENT.footer.signUp}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Intelligent Onboarding Modal */}
      {showOnboarding && newUserId && (
        <IntelligentUserOnboarding
          isOpen={showOnboarding}
          userId={newUserId}
          onComplete={handleOnboardingComplete}
          onClose={handleOnboardingSkip}
        />
      )}
    </div>
  );
}
