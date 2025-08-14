import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { canAccessPage } from '@shared/authorization';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { useLocation } from 'wouter';

interface AuthorizedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Centralized route authorization component
 * Automatically determines permissions based on current path
 */
export default function AuthorizedRoute({
  children,
  fallback
}: AuthorizedRouteProps) {
  const { user, role, isLoading } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return fallback || (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="flex mb-4 gap-2">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <h1 className="text-2xl font-bold text-gray-900">Authentication Required</h1>
            </div>
            <p className="mt-4 text-sm text-gray-600">
              Please log in to access this page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const userRoleId = user?.roleId;
  const userRoleName = role?.name || role;

  if (userRoleId && !canAccessPage(userRoleId, location)) {
    return fallback || (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="flex mb-4 gap-2">
              <AlertCircle className="h-8 w-8 text-orange-500" />
              <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
            </div>
            <p className="mt-4 text-sm text-gray-600">
              You don't have permission to access this page.
            </p>
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 p-2 bg-gray-100 rounded text-xs">
                <p>Debug Info:</p>
                <p>Your role: {userRoleName} (ID: {userRoleId})</p>
                <p>Path: {location}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}