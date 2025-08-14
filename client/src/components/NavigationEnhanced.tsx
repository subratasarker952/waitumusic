import React, { useState, useCallback, useEffect, memo } from 'react';
import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, Home, Music, Calendar, FileText, Users, DollarSign, 
  Settings, LogOut, ChevronRight, User, ShoppingCart, Heart,
  BarChart, Briefcase, Globe, PlusCircle, Upload, Bell, Search,
  Filter, ChevronDown, Star, TrendingUp, Award, MessageSquare,
  CreditCard, Shield, HelpCircle, Phone, Mail, MapPin, Clock,
  Sparkles, Rocket, Target, Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { useAudioSafety } from '@/hooks/use-audio-safety';

interface NavigationEnhancedProps {
  user?: any;
  onLogout?: () => void;
}

export const NavigationEnhanced = memo(({ user, onLogout }: NavigationEnhancedProps) => {
  const [location] = useLocation();
  const { toast } = useToast();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const { audioContext, initializeAudio } = useAudioSafety();
  const [pianoEnabled, setPianoEnabled] = useState(false);
  
  // Navigation items based on user role
  const getNavigationItems = useCallback(() => {
    if (!user) return [];
    
    const baseItems = [
      { path: '/', label: 'Dashboard', icon: Home },
      { path: '/profile', label: 'Profile', icon: User }
    ];
    
    // Role-specific items
    const roleItems: Record<number, any[]> = {
      1: [ // Superadmin
        { path: '/admin', label: 'Admin Panel', icon: Shield },
        { path: '/analytics', label: 'Analytics', icon: BarChart },
        { path: '/users', label: 'User Management', icon: Users }
      ],
      2: [ // Admin
        { path: '/admin', label: 'Admin Panel', icon: Shield },
        { path: '/analytics', label: 'Analytics', icon: BarChart }
      ],
      3: [ // Managed Artist
        { path: '/music', label: 'My Music', icon: Music },
        { path: '/bookings', label: 'Bookings', icon: Calendar },
        { path: '/analytics', label: 'Analytics', icon: TrendingUp }
      ],
      4: [ // Artist
        { path: '/music', label: 'My Music', icon: Music },
        { path: '/bookings', label: 'Bookings', icon: Calendar }
      ],
      5: [ // Managed Musician
        { path: '/bookings', label: 'Bookings', icon: Calendar },
        { path: '/services', label: 'Services', icon: Briefcase }
      ],
      6: [ // Musician
        { path: '/bookings', label: 'Bookings', icon: Calendar }
      ],
      7: [ // Managed Professional
        { path: '/services', label: 'Services', icon: Briefcase },
        { path: '/clients', label: 'Clients', icon: Users }
      ],
      8: [ // Professional
        { path: '/services', label: 'Services', icon: Briefcase }
      ],
      9: [ // Fan
        { path: '/discover', label: 'Discover', icon: Sparkles },
        { path: '/favorites', label: 'Favorites', icon: Heart }
      ]
    };
    
    return [...baseItems, ...(roleItems[user.roleId] || [])];
  }, [user]);
  
  // Handle navigation click with audio feedback
  const handleNavClick = useCallback(async (path: string) => {
    if (pianoEnabled && audioContext) {
      try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 440; // A4 note
        oscillator.type = 'sine';
        
        const currentTime = audioContext.currentTime;
        gainNode.gain.setValueAtTime(0, currentTime);
        gainNode.gain.linearRampToValueAtTime(0.2, currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.3);
        
        oscillator.start(currentTime);
        oscillator.stop(currentTime + 0.3);
      } catch (error) {
        console.warn('Audio playback failed:', error);
      }
    }
    
    setIsMobileMenuOpen(false);
  }, [pianoEnabled, audioContext]);
  
  // Toggle category expansion
  const toggleCategory = useCallback((category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  }, []);
  
  // Initialize audio on user interaction
  useEffect(() => {
    const handleInteraction = () => {
      if (!audioContext && pianoEnabled) {
        initializeAudio();
      }
    };
    
    window.addEventListener('click', handleInteraction, { once: true });
    return () => window.removeEventListener('click', handleInteraction);
  }, [audioContext, pianoEnabled, initializeAudio]);
  
  const navItems = getNavigationItems();
  
  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-background border-r z-50">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-6">
            {/* Logo/Brand */}
            <div className="flex items-center gap-2 px-2 py-4">
              <Music className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">WaituMusic</span>
            </div>
            
            {/* Navigation Items */}
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path;
                
                return (
                  <Link key={item.path} href={item.path} onClick={() => handleNavClick(item.path)}>
                    <a className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                      isActive 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-muted'
                    }`}>
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                      {isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
                    </a>
                  </Link>
                );
              })}
            </div>
            
            {/* User Section */}
            {user && (
              <div className="border-t pt-4 space-y-1">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium">{user.fullName}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={onLogout}
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  Logout
                </Button>
              </div>
            )}
            
            {/* Settings */}
            <div className="border-t pt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPianoEnabled(!pianoEnabled)}
                className="w-full justify-start"
              >
                <Music className="h-4 w-4 mr-2" />
                Piano Sounds: {pianoEnabled ? 'On' : 'Off'}
              </Button>
            </div>
          </div>
        </ScrollArea>
      </nav>
      
      {/* Mobile Navigation */}
      <div className="md:hidden">
        {/* Mobile Header */}
        <header className="fixed top-0 left-0 right-0 h-16 bg-background border-b z-50 flex items-center justify-between px-4">
          <Link href="/">
            <a className="flex items-center gap-2">
              <Music className="h-6 w-6 text-primary" />
              <span className="font-bold">WaituMusic</span>
            </a>
          </Link>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </Button>
        </header>
        
        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, x: -300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -300 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-background z-40 pt-16"
            >
              <ScrollArea className="h-full p-4">
                <div className="space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location === item.path;
                    
                    return (
                      <Link key={item.path} href={item.path} onClick={() => handleNavClick(item.path)}>
                        <a className={`flex items-center gap-3 px-3 py-3 rounded-md ${
                          isActive 
                            ? 'bg-primary text-primary-foreground' 
                            : 'hover:bg-muted'
                        }`}>
                          <Icon className="h-5 w-5" />
                          <span>{item.label}</span>
                        </a>
                      </Link>
                    );
                  })}
                  
                  {user && (
                    <>
                      <div className="border-t my-4" />
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={onLogout}
                      >
                        <LogOut className="h-5 w-5 mr-3" />
                        Logout
                      </Button>
                    </>
                  )}
                </div>
              </ScrollArea>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Content Padding */}
      <div className="md:pl-64 pt-16 md:pt-0" />
    </>
  );
});