import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn, Shield, User } from 'lucide-react';

interface AuthRequiredWrapperProps {
  children: React.ReactNode;
  message?: string;
}

export default function AuthRequiredWrapper({ children, message }: AuthRequiredWrapperProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 rounded-full bg-blue-100 dark:bg-blue-900/20 w-fit">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-xl">Authentication Required</CardTitle>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {message || 'Please log in to access this page'}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col space-y-2">
              <Button asChild className="w-full">
                <a href="/login">
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </a>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <a href="/register">
                  <User className="w-4 h-4 mr-2" />
                  Create Account
                </a>
              </Button>
            </div>
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              Use demo account: superadmin@waitumusic.com / secret123
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}