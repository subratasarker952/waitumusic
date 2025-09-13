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
}

interface Role {
  id: number;
  name: string;
}

interface RoleData {
  role: Role;
  data: any;
}

interface AuthContextType {
  user: User | null;
  roles: Role[];
  roleData: RoleData[];
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  logout: () => void;
  getToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
export { AuthContext };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [roleData, setRoleData] = useState<RoleData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  const { toast } = useToast();

  const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setRoles([]);
    setRoleData([]);
    toast({ title: "Logged out", description: "You have been logged out successfully" });
  };

  useEffect(() => { checkAuthStatus(); }, []);
  useEffect(() => {
    const timeout = setTimeout(() => { if (isLoading) setIsLoading(false); }, 1500);
    return () => clearTimeout(timeout);
  }, [isLoading]);

  // Session timeout warning
  useEffect(() => {
    if (!user) return;
    let warningTimer: NodeJS.Timeout;
    let logoutTimer: NodeJS.Timeout;

    const resetTimers = () => {
      clearTimeout(warningTimer); clearTimeout(logoutTimer);
      warningTimer = setTimeout(() => setShowSessionWarning(true), SESSION_TIMEOUT - 5 * 60 * 1000);
      logoutTimer = setTimeout(() => { logout(); toast({ title: "Session Expired", description: "Logged out due to inactivity.", variant: "destructive" }); }, SESSION_TIMEOUT);
    };

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    const handleActivity = () => { setShowSessionWarning(false); resetTimers(); };
    events.forEach(e => document.addEventListener(e, handleActivity));
    resetTimers();
    return () => { clearTimeout(warningTimer); clearTimeout(logoutTimer); events.forEach(e => document.removeEventListener(e, handleActivity)); };
  }, [user, toast]);

  const handleExtendSession = () => setShowSessionWarning(false);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('token');
    if (!token) { setIsLoading(false); return; }

    try {
      const data = await apiRequest('/api/current-user');
      setUser(data.user);
      setRoles(data.user.roles || []);
      setRoleData(data.user.roleData || []);
    } catch (error) {
      localStorage.removeItem('token');
      setUser(null); setRoles([]); setRoleData([]);
    } finally { setIsLoading(false); }
  };

  const login = async (email: string, password: string) => {
    try {
      const data = await apiRequest('/api/auth/login', { method: 'POST', body: { email, password } });
      localStorage.setItem('token', data.token);
      setUser(data.user);
      setRoles(data.user.roles || []);
      setRoleData(data.user.roleData || []);
      toast({ title: "Login successful", description: `Welcome back, ${data.user.fullName}!` });
      return true;
    } catch (error: any) {
      toast({ title: "Login failed", description: "Invalid email or password", variant: "destructive" });
      return false;
    }
  };

  const register = async (userData: any) => {
    try {
      const data = await apiRequest('/api/auth/register', { method: 'POST', body: userData });
      localStorage.setItem('token', data.token);
      setUser(data.user);
      setRoles(data.user.roles || []);
      setRoleData(data.user.roleData || []);
      toast({ title: "Registration successful", description: "Welcome to Wai'tuMusic!" });
      return true;
    } catch (error: any) {
      toast({ title: "Registration failed", description: "Unable to connect to server", variant: "destructive" });
      return false;
    }
  };

  const getToken = () => localStorage.getItem('token');
  console.log(user)
  return (
    <AuthContext.Provider value={{ user, roles, roleData, isLoading, login, register, logout, getToken }}>
      {children}
      <Dialog open={showSessionWarning} onOpenChange={setShowSessionWarning}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Session Expiring Soon</DialogTitle>
            <DialogDescription>
              Your session will expire in 5 minutes due to inactivity. Extend your session?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={logout}>Log Out</Button>
            <Button onClick={handleExtendSession}>Extend Session</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
