import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, FileText, Download, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function SharedDocument() {
  const { token } = useParams();
  const [_, navigate] = useLocation();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [hasProvided, setHasProvided] = useState(false);

  // Check if we already have email/name in localStorage
  useEffect(() => {
    const savedEmail = localStorage.getItem('share_email');
    const savedName = localStorage.getItem('share_name');
    if (savedEmail && savedName) {
      setEmail(savedEmail);
      setName(savedName);
      setHasProvided(true);
    }
  }, []);

  // Fetch document access info
  const { data: accessInfo, isLoading, error, refetch } = useQuery({
    queryKey: ['shared-document', token, email, name],
    queryFn: async () => {
      if (!token) throw new Error('No token provided');
      
      const params = new URLSearchParams();
      if (email) params.append('email', email);
      if (name) params.append('name', name);
      
      const response = await fetch(`/api/share/${token}?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to access document');
      }
      
      return response.json();
    },
    enabled: !!token && hasProvided,
    retry: false,
  });

  const handleSubmitInfo = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('share_email', email);
    localStorage.setItem('share_name', name);
    setHasProvided(true);
  };

  // If no email/name provided yet, show form
  if (!hasProvided) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Shared Document</CardTitle>
            <CardDescription>
              Please provide your information to access this document
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitInfo} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Enter your full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Your Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email address"
                />
              </div>
              <Button type="submit" className="w-full">
                Continue
              </Button>
            </form>
            
            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>Don't have a Wai'tuMusic account?</p>
              <Button
                variant="link"
                onClick={() => navigate('/register')}
                className="text-primary"
              >
                Sign up for free
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Error</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error.message || 'Unable to access this document'}
              </AlertDescription>
            </Alert>
            <div className="mt-4 space-y-2">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/')}
              >
                Go to Home
              </Button>
              <Button 
                variant="default" 
                className="w-full"
                onClick={() => navigate('/register')}
              >
                Create an Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render document based on type
  const renderDocument = () => {
    if (!accessInfo) return null;

    const { documentType, documentId, accessType, sectionRestrictions } = accessInfo;

    // For now, show a placeholder - this would be replaced with actual document components
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {documentType.replace('_', ' ').toUpperCase()}
                  </CardTitle>
                  <CardDescription>
                    Document ID: {documentId} • Access Level: {accessType}
                  </CardDescription>
                </div>
                {(accessType === 'download' || accessType === 'full') && (
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertDescription>
                  Welcome {name}! You have {accessType} access to this {documentType.replace('_', ' ')}.
                  {sectionRestrictions && ' Some sections may be restricted based on your access level.'}
                </AlertDescription>
              </Alert>
              
              {/* Here we would render the actual document component based on documentType */}
              <div className="mt-6 p-6 bg-white dark:bg-gray-800 rounded-lg">
                <p className="text-center text-muted-foreground">
                  Document content would be displayed here based on the document type and your access level.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  return renderDocument();
}