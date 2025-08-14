import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface User {
  id: number;
  email: string;
  fullName: string;
  roleId: number;
}

interface UserProfile {
  userId: number;
  bio?: string;
  avatarUrl?: string;
  coverImageUrl?: string;
  socialLinks?: any;
  websiteUrl?: string;
  phoneNumber?: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  roleData: any;
  role: any;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  getToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [roleData, setRoleData] = useState<any>(null);
  const [role, setRole] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  const { toast } = useToast();
  
  const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  // Define logout function before using it
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setProfile(null);
    setRoleData(null);
    setRole(null);
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);
  
  // Fallback timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.warn('⚠️ Auth check timed out, forcing completion');
        setIsLoading(false);
      }
    }, 1500); // 1.5 second timeout for faster loading
    
    return () => clearTimeout(timeout);
  }, [isLoading]);
  
  // Session timeout warning system
  useEffect(() => {
    if (!user) return;
    
    let warningTimer: NodeJS.Timeout;
    let logoutTimer: NodeJS.Timeout;
    
    const resetTimers = () => {
      clearTimeout(warningTimer);
      clearTimeout(logoutTimer);
      
      // Warn 5 minutes before timeout
      warningTimer = setTimeout(() => {
        setShowSessionWarning(true);
      }, SESSION_TIMEOUT - 5 * 60 * 1000);
      
      // Logout at timeout
      logoutTimer = setTimeout(() => {
        logout();
        toast({
          title: "Session Expired",
          description: "You have been logged out due to inactivity.",
          variant: "destructive"
        });
      }, SESSION_TIMEOUT);
    };
    
    // Reset on any user activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    const handleActivity = () => {
      setShowSessionWarning(false);
      resetTimers();
    };
    
    events.forEach(event => {
      document.addEventListener(event, handleActivity);
    });
    
    resetTimers();
    
    return () => {
      clearTimeout(warningTimer);
      clearTimeout(logoutTimer);
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [user, logout, toast]);

  const handleExtendSession = () => {
    setShowSessionWarning(false);
    // Session will be extended by the activity listener
  };

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      // Simple: get user data, set state, done
      const userData = await apiRequest('/api/current-user');
      setUser(userData);
      setRole({ id: userData.roleId, name: 'User' });
      setRoleData({ id: userData.roleId, name: 'User' });
      setProfile(null); // Profile not needed for access control
    } catch (error: any) {
      // Token invalid or expired - clear auth state
      localStorage.removeItem('token');
      setUser(null);
      setProfile(null);
      setRoleData(null);
      setRole(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const data = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: { email, password }
      });

      localStorage.setItem('token', data.token);
      setUser(data.user);
      setRole({ id: data.user.roleId, name: 'User' });
      setRoleData({ id: data.user.roleId, name: 'User' });
      setProfile(null);
      toast({
        title: "Login successful",
        description: `Welcome back, ${data.user.fullName}!`,
      });
      return true;
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Login failed", 
        description: error.message?.includes('401') ? "Invalid email or password" : "Unable to connect to server. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const register = async (userData: any): Promise<boolean> => {
    try {
      const data = await apiRequest('/api/auth/register', {
        method: 'POST',
        body: userData,
      });

      localStorage.setItem('token', data.token);
      setUser(data.user);
      setRole({ id: data.user.roleId, name: 'User' });
      setRoleData({ id: data.user.roleId, name: 'User' });
      setProfile(null);

      toast({
          title: "Registration successful",
          description: "Welcome to Wai'tuMusic!",
        });
        return true;
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "Registration failed",
        description: error.message?.includes('400') ? "Registration failed - user may already exist" : "Unable to connect to server",
        variant: "destructive",
      });
      return false;
    }
  };

  // Removed refreshProfile - not needed for role-based access control

  const getToken = () => {
    return localStorage.getItem('token');
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      roleData,
      role,
      isLoading,
      login,
      register,
      logout,
      refreshProfile: () => {}, // Placeholder for compatibility
      getToken
    }}>
      {children}
      
      {/* Session Timeout Warning Dialog */}
      <Dialog open={showSessionWarning} onOpenChange={setShowSessionWarning}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Session Expiring Soon</DialogTitle>
            <DialogDescription>
              Your session will expire in 5 minutes due to inactivity. 
              Would you like to extend your session?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={logout}>
              Log Out
            </Button>
            <Button onClick={handleExtendSession}>
              Extend Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
