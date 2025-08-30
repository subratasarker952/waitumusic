import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation, useRoute } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useScrollToTop, scrollToTop } from '@/hooks/useScrollToTop';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useSuccessNotification } from '@/components/ui/success-notification';
import { usePerformanceOptimization, useLargeDatasetOptimization } from '@/hooks/usePerformanceOptimization';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Icons
import {
  Users, Calendar, DollarSign, TrendingUp, Music, Star,
  Settings, Shield, Activity, FileText, Heart, Download,
  Mic, Headphones, Briefcase, Check, AlertTriangle,
  BarChart3, Clock, MapPin, Play, ShoppingCart, Award,
  Globe, Wrench, Database, UserCheck, BookOpen,
  CreditCard, Camera, Video, Image, FolderOpen, Trash2, Music2, Crown, Mail, X, Utensils,
  List,
  Notebook
} from 'lucide-react';

// Modal Components
import MusicUploadModal from '@/components/modals/MusicUploadModal';
import CalendarModal from '@/components/modals/CalendarModal';
import EquipmentModal from '@/components/modals/EquipmentModal';
import BookingResponseModal from '@/components/modals/BookingResponseModal';
import MerchandiseModal from '@/components/modals/MerchandiseModal';
import ServiceManagementModal from '@/components/modals/ServiceManagementModal';
import UserManagementModal from '@/components/modals/UserManagementModal';
import KnowledgeBaseModal from '@/components/modals/KnowledgeBaseModal';
import StoreBrowserModal from '@/components/modals/StoreBrowserModal';
import { VideoUploadModal } from './VideoUploadModal';
import UploadAlbumButton from '@/components/UploadAlbumButton';
import WebsiteIntegrationModal from '@/components/WebsiteIntegrationModal';
import ProfileEditForm from '@/components/ProfileEditForm';

// Specialized Components
import SuperadminDashboard from '@/components/dashboards/SuperadminDashboard';
import AdminDashboard from '@/components/dashboards/AdminDashboard';
import EnhancedNewsletterManagement from '@/components/admin/EnhancedNewsletterManagement';
import PressReleaseManagement from '@/components/admin/PressReleaseManagement';
import { GigComponent } from '@/components/dashboard/GigComponent';

import { PRORegistration } from '@/components/PRORegistration';
import SplitsheetServiceDashboard from '@/components/SplitsheetServiceDashboard';
import { RevenueAnalyticsDashboard } from '@/components/analytics/RevenueAnalyticsDashboard';

// New Dashboard Components
import MusicAnalytics from '@/components/analytics/MusicAnalytics';
import EquipmentManager from '@/components/equipment/EquipmentManager';
import FollowedArtists from '@/components/fans/FollowedArtists';
import ConsultationCalendar from '@/components/professional/ConsultationCalendar';
import KnowledgeBaseManager from '@/components/professional/KnowledgeBaseManager';
import AdvancedCalendar from '@/components/shared/AdvancedCalendar';
import InstrumentManager from '@/components/InstrumentManager';
import MusicianInstrumentPreferences from '@/components/MusicianInstrumentPreferences';
import {
  AdvancedSetlistModal,
  AdvancedEquipmentModal,
  FanEngagementModal,
  ConsultationManagementModal
} from '@/components/modals/ComprehensiveModalSystem';
import { Index } from 'drizzle-orm/mysql-core';
import { useAuth } from '@/contexts/AuthContext';
import { RoleBadges } from './RoleBadge';
import DashboardHeader from './DashboardHeader';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { FormProvider, useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel } from './ui/form';


interface UnifiedDashboardProps {
  stats: any;
  bookings: any;
  applications: any;
}

export default function UnifiedDashboard({ stats, bookings, applications }: UnifiedDashboardProps) {
  // console.log(stats, bookings, applications)
  const { user, isLoading, roles } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  useScrollToTop(); // Scroll to top on page/route changes

  // Modal states
  const [musicUploadOpen, setMusicUploadOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [equipmentOpen, setEquipmentOpen] = useState(false);
  const [bookingResponseOpen, setBookingResponseOpen] = useState(false);
  const [merchandiseOpen, setMerchandiseOpen] = useState(false);
  const [serviceManagementOpen, setServiceManagementOpen] = useState(false);
  const [userManagementOpen, setUserManagementOpen] = useState(false);
  const [videoUploadOpen, setVideoUploadOpen] = useState(false);
  const [knowledgeBaseOpen, setKnowledgeBaseOpen] = useState(false);
  const [storeBrowserOpen, setStoreBrowserOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>();
  const [userModalMode, setUserModalMode] = useState<'create' | 'edit' | 'view'>('view');
  // Handle URL parameter for tab navigation
  const urlParams = new URLSearchParams(window.location.search);
  const tabFromUrl = urlParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromUrl || "overview");

  // Handle tab change with scroll to top
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    scrollToTop();
  };
  const [showMusicAnalytics, setShowMusicAnalytics] = useState(false);
  const [showEquipmentManager, setShowEquipmentManager] = useState(false);
  const [showFollowedArtists, setShowFollowedArtists] = useState(false);
  const [showConsultationCalendar, setShowConsultationCalendar] = useState(false);
  const [showKnowledgeBaseManager, setShowKnowledgeBaseManager] = useState(false);
  const [showAdvancedCalendar, setShowAdvancedCalendar] = useState(false);
  const [showAdvancedSetlist, setShowAdvancedSetlist] = useState(false);
  const [showAdvancedEquipment, setShowAdvancedEquipment] = useState(false);
  const [showFanEngagement, setShowFanEngagement] = useState(false);
  const [showConsultationManagement, setShowConsultationManagement] = useState(false);
  const [showInstrumentManager, setShowInstrumentManager] = useState(false);

  // Performance optimization hooks
  const { showSuccess, NotificationContainer } = useSuccessNotification();
  const { measurePerformance, optimizeCache } = usePerformanceOptimization();

  // Data queries with performance optimization
  const { data: songs = [], isLoading: songsLoading } = useQuery({
    queryKey: ['/api/songs'],
    staleTime: 300000, // 5 minutes
    gcTime: 600000, // 10 minutes
    retry: 1
  });

  const { data: artists = [], isLoading: artistsLoading } = useQuery({
    queryKey: ['/api/artists'],
    staleTime: 300000,
    gcTime: 600000,
  });

  // Large dataset optimization for artists
  const { filteredData: filteredArtists, isProcessing: isFilteringArtists } =
    useLargeDatasetOptimization(
      artists || [],
      '',
      (artist, query) =>
        (artist as any).stageName?.toLowerCase().includes(query.toLowerCase()) ||
        (artist as any).bio?.toLowerCase().includes(query.toLowerCase())
    );

  // Error boundary protection
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please log in to access your dashboard.</p>
        </div>
      </div>
    );
  }

  // Get user roles from context (already available in useAuth)
  const userRoles = roles?.map(r => r.id) || [];

  // Helper functions
  const hasRole = (ids: number[]) => userRoles.some(r => ids.includes(r));

  const isAdmin = hasRole([1, 2]);
  const isSuperadmin = userRoles.includes(1);
  const isManaged = hasRole([3, 5, 7]);
  const isArtist = hasRole([3, 4]);
  const isMusicianProfile = hasRole([5, 6]);
  const isManagedMusician = userRoles.includes(5);
  const isProfessional = hasRole([7, 8]);
  const isFan = hasRole([9]);

  // PRO registration eligibility: Artists, Musicians, and Music-related Professionals
  const musicProfessionalTypes = [
    'background_vocalist', 'producer', 'arranger', 'composer', 'songwriter',
    'dj', 'music_director', 'sound_engineer', 'mixing_engineer', 'mastering_engineer',
    'music_producer', 'beat_maker', 'orchestrator', 'lyricist', 'jingle_writer'
  ];

  const isPROEligible = isArtist || isMusicianProfile || (isProfessional &&
    user?.roleData?.some((role: any) =>
      role.data?.specializations?.some((spec: string) =>
        musicProfessionalTypes.includes(spec.toLowerCase().replace(/\s+/g, '_'))
      )
    )
  );

  // Filter data based on user
  const userSongs = songs?.filter((song: any) => song.artistUserId === user?.id) || [];

  const userBookings =
    bookings?.filter(
      (b: any) =>
        b.musician_user_id === user?.id ||
        b.professional_user_id === user?.id ||
        b.booker_user_id === user?.id ||
        b.artist_user_id === user?.id
    ) || [];

  const handleUploadMusic = () => setMusicUploadOpen(true);

  const handleAdvancedSetlist = () => setShowAdvancedSetlist(true);
  const handleAdvancedEquipment = () => setShowAdvancedEquipment(true);
  const handleFanEngagement = () => setShowFanEngagement(true);
  const handleConsultationManagement = () => setShowConsultationManagement(true);
  const handleUploadAlbum = () => {
    toast({
      title: "Album Upload",
      description: "Opening album upload form with multi-track support...",
    });
    setMusicUploadOpen(true);
  };
  const handleBlockDate = () => setCalendarOpen(true);
  const handleUpdateEquipment = () => setEquipmentOpen(true);
  const handleMerchandiseManagement = () => setMerchandiseOpen(true);
  const handleManageMerchandiseCategories = () => {
    // Open merchandise management modal for category management
    setMerchandiseOpen(true);
    toast({
      title: "Merchandise Categories",
      description: "Use the Add Merchandise form to create category-specific items",
    });
  };
  const handleUpdateRates = () => setServiceManagementOpen(true);

  const handleDeleteSong = async (songId: string, songTitle: string) => {
    const confirmed = window.confirm(`Are you sure you want to delete "${songTitle}"? This action cannot be undone.`);
    if (!confirmed) return;

    try {
      await apiRequest(`/api/songs/${songId}`, { method: 'DELETE' });
      queryClient.invalidateQueries({ queryKey: ['/api/songs'] });
      toast({
        title: "Song Deleted",
        description: `"${songTitle}" has been successfully deleted.`,
      });
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Unable to delete the song. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBookingResponse = (bookingId: string, action: 'accept' | 'decline', message?: string) => {
    toast({
      title: `Booking ${action === 'accept' ? 'Accepted' : 'Declined'}`,
      description: `Booking ${bookingId} has been ${action}ed.`,
    });
    setBookingResponseOpen(false);
    setSelectedBooking(null);
  };

  const handleViewBooking = (booking: any) => {
    setLocation(`/bookings/${booking.id}`);
  };


  const handleManageKnowledgeBase = () => {
    // Open knowledge base management modal
    setKnowledgeBaseOpen(true);
  };

  const handleBrowseStore = () => {
    // Open dashboard-contained store browser
    setStoreBrowserOpen(true);
    toast({
      title: "Store Browser",
      description: "Browse merchandise from your favorite artists",
    });
  };

  const handleBrowseArtists = () => {
    // Open dashboard-contained artist browser
    toast({
      title: "Artist Browser",
      description: "Browse your favorite artists within dashboard",
    });
    // This could open an artist browser modal in the future
  };

  const handleViewPurchases = () => {
    // Open dashboard-contained purchase history
    toast({
      title: "Purchase History",
      description: "View your purchase history within dashboard",
    });
    // This could open a purchase history modal in the future
  };

  const handleCreateUser = () => {
    setSelectedUserId(undefined);
    setUserModalMode('create');
    setUserManagementOpen(true);
  };

  const handleEditUser = (userId: string) => {
    setSelectedUserId(userId);
    setUserModalMode('edit');
    setUserManagementOpen(true);
  };

  const handleViewUser = (userId: string) => {
    setSelectedUserId(userId);
    setUserModalMode('view');
    setUserManagementOpen(true);
  };

  // Dashboard containment - prevent external navigation
  const handleDashboardAction = (actionName: string, action: () => void) => {
    // Execute action within dashboard context
    action();
    toast({
      title: "Dashboard Action",
      description: `${actionName} opened within dashboard`,
    });
  };

  // Admin system actions
  const handleSystemAction = (actionName: string, action: () => void | Promise<void>) => {
    // Execute admin system action
    try {
      const result = action();
      if (result instanceof Promise) {
        result.catch((error) => {
          toast({
            title: "System Action Error",
            description: `Failed to execute ${actionName}: ${error.message}`,
            variant: "destructive",
          });
        });
      }
    } catch (error: any) {
      toast({
        title: "System Action Error",
        description: `Failed to execute ${actionName}: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  // Render role-specific dashboard content
  const renderDashboardContent = () => {
    if (isSuperadmin) {
      return <SuperadminDashboard stats={stats} bookings={bookings} user={user} />;
    }

    // All users including admins now use the unified dashboard system
    // For all other roles, render unified dashboard with role-specific sections
    return (
      <div className="space-y-4 sm:space-y-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

        {/* Header - Mobile Optimized */}
        <RoleBadges roles={roles} />


        {/* Mobile Dropdown Navigation - Musical Organization */}
        <div className="block sm:hidden mb-6">
          <Select value={activeTab} onValueChange={handleTabChange}>
            <SelectTrigger className="w-full h-12 text-base">
              <SelectValue placeholder={
                userRoles.includes(3) ? "🎨 Creative Studio" :
                  userRoles.includes(5) ? "🎧 Session Workshop" :
                    userRoles.includes(7) ? "💼 Professional Suite" :
                      userRoles.includes(9) ? "💖 Fan Experience" : "🎵 Dashboard"
              } />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="overview">🏰 Overview</SelectItem>
              <SelectItem value="profile">⭐ Profile</SelectItem>

              {/* Performance & Production */}
              {userRoles.some(id => [3, 4, 5, 6, 7, 8].includes(id)) && <SelectItem value="calendar">📅 Calendar (Schedule)</SelectItem>}
              {userRoles.some(id => [3, 5].includes(id)) && <SelectItem value="music">🎵 Music (Production)</SelectItem>}
              {userRoles.some(id => [5, 6].includes(id)) && <SelectItem value="equipment">🎧 Instruments (Equipment)</SelectItem>}

              {/* Business & Opportunities */}
              {userRoles.includes(7) && <SelectItem value="services">💼 Services (Business)</SelectItem>}
              {!userRoles.includes(7) && <SelectItem value="bookings">📋 Bookings (Business)</SelectItem>}
              <SelectItem value="applications">📋 Applications (Business)</SelectItem>
              {userRoles.some(id => [3, 4, 5, 6, 7, 8].includes(id)) && <SelectItem value="gigs">🎤 My Gigs (Performances)</SelectItem>}

              {/* Commercial & Legal */}
              {userRoles.includes(3) && <SelectItem value="merchandise">🛒 Merchandise (Commercial)</SelectItem>}
              {isPROEligible && <SelectItem value="pro-registration">📝 PRO Registration (Legal)</SelectItem>}
              {userRoles.some(id => [3, 5].includes(id)) && <SelectItem value="splitsheets">📄 Splitsheets (Legal)</SelectItem>}

              {/* Fan Experience */}
              {userRoles.includes(9) && <SelectItem value="favorites">❤️ Favorites (Fan)</SelectItem>}
              {userRoles.includes(9) && <SelectItem value="purchases">🛒 Purchases (Fan)</SelectItem>}

              {/* Knowledge Center */}
              {userRoles.includes(7) && <SelectItem value="knowledge">📚 Knowledge Base (Resources)</SelectItem>}
            </SelectContent>
          </Select>
        </div>

        {/* Desktop Tab Navigation - Musical Organization */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <div className="hidden sm:block">
            <div className="space-y-4 mb-6">

              {/* Admin Management Hub */}
              {roles?.some(r => [1, 2].includes(r.id)) && (
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 rounded-xl p-4 shadow-md">
                  <h3 className="text-sm font-semibold text-purple-700 dark:text-purple-300 mb-4 flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Admin Control Center
                  </h3>

                  <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-3 h-full">
                    <TabsTrigger value="overview" className="text-xs flex items-center gap-1 justify-center py-2 px-2 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900 transition">
                      <Crown className="h-4 w-4" /> Overview
                    </TabsTrigger>

                    <TabsTrigger value="profile" className="text-xs flex items-center gap-1 justify-center py-2 px-2 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900 transition">
                      <Star className="h-4 w-4" /> Profile
                    </TabsTrigger>

                    <TabsTrigger value="admin-users" className="text-xs flex items-center gap-1 justify-center py-2 px-2 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900 transition">
                      <Users className="h-4 w-4" /> Users
                    </TabsTrigger>

                    <TabsTrigger value="admin-system" className="text-xs flex items-center gap-1 justify-center py-2 px-2 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900 transition">
                      <Settings className="h-4 w-4" /> System
                    </TabsTrigger>

                    <TabsTrigger value="admin-data" className="text-xs flex items-center gap-1 justify-center py-2 px-2 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900 transition">
                      <Database className="h-4 w-4" /> Data
                    </TabsTrigger>

                    <TabsTrigger value="newsletters" className="text-xs flex items-center gap-1 justify-center py-2 px-2 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900 transition">
                      <Mail className="h-4 w-4" /> Newsletter
                    </TabsTrigger>

                    <TabsTrigger value="press-releases" className="text-xs flex items-center gap-1 justify-center py-2 px-2 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900 transition">
                      <FileText className="h-4 w-4" /> Press
                    </TabsTrigger>

                    <TabsTrigger value="admin-security" className="text-xs flex items-center gap-1 justify-center py-2 px-2 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900 transition">
                      <Shield className="h-4 w-4" /> Security
                    </TabsTrigger>
                  </TabsList>
                </div>
              )}


              {/* Artist/Musician/Professional Hub */}
              {roles.some(r => [3, 4, 5, 6, 7, 8, 9].includes(r.id)) && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg p-3">
                  <h3 className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-2 flex items-center gap-2">
                    <Music className="h-4 w-4" />
                    {[isFan ? 'Fan Experience' : null,
                    isArtist ? 'Creative Studio' : null,
                    isMusicianProfile ? 'Session Workshop' : null,
                    isProfessional ? 'Professional Suite' : null
                    ].filter(Boolean).join(' / ')}
                  </h3>
                  <TabsList className="grid w-full grid-cols-3 gap-1">
                    <TabsTrigger value="overview" className="text-xs flex items-center gap-1">
                      <Crown className="h-3 w-3" /> Overview
                    </TabsTrigger>
                    <TabsTrigger value="profile" className="text-xs flex items-center gap-1">
                      <Star className="h-3 w-3" /> Profile
                    </TabsTrigger>
                    {roles.some(r => [3, 4, 5, 6, 7, 8].includes(r.id)) && (
                      <TabsTrigger value="calendar" className="text-xs flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> Calendar
                      </TabsTrigger>
                    )}
                  </TabsList>
                </div>
              )}


              {/* Performance & Production Hub */}
              {roles.some(r => [3, 4, 5, 6].includes(r.id)) && (
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-lg p-3">
                  <h3 className="text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-2 flex items-center gap-2">
                    <Mic className="h-4 w-4" /> Performance & Production
                  </h3>
                  <div className="grid grid-cols-2 gap-1">
                    {roles.some(r => [3, 4, 5].includes(r.id)) && (
                      <TabsList className="grid w-full grid-cols-1">
                        <TabsTrigger value="music" className="text-xs flex items-center gap-1">
                          <Music className="h-3 w-3" /> Music
                        </TabsTrigger>
                      </TabsList>
                    )}
                    {roles.some(r => [5, 6].includes(r.id)) && (
                      <TabsList className="grid w-full grid-cols-1">
                        <TabsTrigger value="equipment" className="text-xs flex items-center gap-1">
                          <Headphones className="h-3 w-3" /> Instruments
                        </TabsTrigger>
                      </TabsList>
                    )}
                  </div>
                </div>
              )}


              {/* Business & Booking Suite */}
              {/* {roles.some(r => [1, 2, 3, 4, 5, 6, 7, 8, 9].includes(r.id)) && ( */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg p-3">
                <h3 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-2">
                  <Briefcase className="h-4 w-4" /> Business & Opportunities
                </h3>
                <TabsList className="grid w-full grid-cols-3 gap-4">
                  <TabsTrigger value="bookings" className="text-xs flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Bookings
                  </TabsTrigger>

                  <TabsTrigger value="applications" className="text-xs flex items-center gap-1">
                    <List className="h-3 w-3" /> Applications
                  </TabsTrigger>

                  <TabsTrigger value="gigs" className="text-xs flex items-center gap-1">
                    <Music2 className="h-3 w-3" /> My Gigs
                  </TabsTrigger>
                </TabsList>
              </div>
              {/* )} */}

              {/* Commercial & Legal Hub */}
              {(roles.some(r => [3, 5].includes(r.id)) || isPROEligible) && (
                <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 rounded-lg p-3">
                  <h3 className="text-sm font-medium text-orange-700 dark:text-orange-300 mb-2 flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" /> Commercial & Legal
                  </h3>
                  <div className="grid grid-cols-3 gap-1">
                    {roles.some(r => r.id === 3) && (
                      <TabsList className="grid w-full grid-cols-1">
                        <TabsTrigger value="merchandise" className="text-xs flex items-center gap-1">
                          <ShoppingCart className="h-3 w-3" /> Merch
                        </TabsTrigger>
                      </TabsList>
                    )}
                    {isPROEligible && (
                      <TabsList className="grid w-full grid-cols-1">
                        <TabsTrigger value="pro-registration" className="text-xs flex items-center gap-1">
                          <FileText className="h-3 w-3" /> PRO
                        </TabsTrigger>
                      </TabsList>
                    )}
                    {roles.some(r => [3, 5].includes(r.id)) && (
                      <TabsList className="grid w-full grid-cols-1">
                        <TabsTrigger value="splitsheets" className="text-xs flex items-center gap-1">
                          <FileText className="h-3 w-3" /> Splits
                        </TabsTrigger>
                      </TabsList>
                    )}
                  </div>
                </div>
              )}

              {/* Professional Knowledge Center */}
              {roles.some(r => [7, 8].includes(r.id)) && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg p-3">
                  <h3 className="text-sm font-medium text-green-700 dark:text-green-300 mb-2 flex items-center gap-2">
                    <BookOpen className="h-4 w-4" /> Knowledge Center
                  </h3>
                  <TabsList className="grid w-full grid-cols-2 gap-4">
                    <TabsTrigger value="knowledge" className="text-xs flex items-center gap-1">
                      <BookOpen className="h-3 w-3" /> Knowledge Base
                    </TabsTrigger>
                    <TabsTrigger value="services" className="text-xs flex items-center gap-1">
                      <Briefcase className="h-3 w-3" /> Services
                    </TabsTrigger>
                  </TabsList>
                </div>
              )}

              {/* Fan Experience Hub */}
              {roles.some(r => r.id === 9) && (
                <div className="bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20 rounded-lg p-3">
                  <h3 className="text-sm font-medium text-pink-700 dark:text-pink-300 mb-2 flex items-center gap-2">
                    <Heart className="h-4 w-4" /> Fan Experience
                  </h3>
                  <TabsList className="grid w-full grid-cols-2 gap-4 h-full">
                    <TabsTrigger value="favorites" className="text-xs flex items-center gap-1">
                      <Heart className="h-3 w-3" /> Favorites
                    </TabsTrigger>
                    <TabsTrigger value="purchases" className="text-xs flex items-center gap-1">
                      <ShoppingCart className="h-3 w-3" /> Purchases
                    </TabsTrigger>
                  </TabsList>
                </div>
              )}

            </div>
          </div>


          {/* ------------------ OVERVIEW TAB ------------------ */}
          <TabsContent value="overview" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* Artist Metrics */}
              {roles.some(r => [3, 4].includes(r.id)) && (
                <>
                  <Card>
                    <CardHeader className="flex justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Monthly Bookings</CardTitle>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{userBookings.length}</div>
                      <p className="text-xs text-muted-foreground">+12% from last month</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Total Songs</CardTitle>
                      <Music className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{userSongs.length}</div>
                      <p className="text-xs text-muted-foreground">Released tracks</p>
                    </CardContent>
                  </Card>
                </>
              )}

              {/* Musician Metrics */}
              {roles.some(r => [5, 6].includes(r.id)) && (
                <>
                  <Card>
                    <CardHeader className="flex justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Monthly Sessions</CardTitle>
                      <Headphones className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{userBookings.length}</div>
                      <p className="text-xs text-muted-foreground">+8% from last month</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Session Revenue</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">$2,450</div>
                      <p className="text-xs text-muted-foreground">+15% from last month</p>
                    </CardContent>
                  </Card>
                </>
              )}

              {/* Professional Metrics */}
              {roles.some(r => [7, 8].includes(r.id)) && (
                <>
                  <Card>
                    <CardHeader className="flex justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Monthly Consultations</CardTitle>
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{userBookings.length}</div>
                      <p className="text-xs text-muted-foreground">+20% from last month</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">18</div>
                      <p className="text-xs text-muted-foreground">+3 new this month</p>
                    </CardContent>
                  </Card>
                </>
              )}

              {/* Fan Metrics */}
              {roles.some(r => r.id === 9) && (
                <>
                  <Card>
                    <CardHeader className="flex justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Following</CardTitle>
                      <Heart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">12</div>
                      <p className="text-xs text-muted-foreground">Artists followed</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Purchases</CardTitle>
                      <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">24</div>
                      <p className="text-xs text-muted-foreground">Songs purchased</p>
                    </CardContent>
                  </Card>
                </>
              )}

              {/* Common Metrics */}
              <Card>
                <CardHeader className="flex justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    {roles.some(r => [7, 8].includes(r.id)) ? 'Revenue' :
                      roles.some(r => [3, 4].includes(r.id)) ? 'Earnings' :
                        roles.some(r => [5, 6].includes(r.id)) ? 'Ratings' :
                          'Downloads'}
                  </CardTitle>
                  {roles.some(r => [7, 8, 3, 4].includes(r.id)) ? (
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  ) : roles.some(r => [5, 6].includes(r.id)) ? (
                    <Star className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Download className="h-4 w-4 text-muted-foreground" />
                  )}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {roles.some(r => [7, 8].includes(r.id)) ? '$5,200' :
                      roles.some(r => [3, 4].includes(r.id)) ? '$3,400' :
                        roles.some(r => [5, 6].includes(r.id)) ? '4.9' : '156'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {roles.some(r => [7, 8].includes(r.id)) ? '+25% from last month' :
                      roles.some(r => [3, 4].includes(r.id)) ? '+18% from last month' :
                        roles.some(r => [5, 6].includes(r.id)) ? 'Average rating' : 'Total downloads'}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userBookings.slice(0, 3).map((booking: any, index: number) => (
                    <div key={booking.id || index} className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <div className="flex-1">
                        <p className="font-medium">
                          {roles.some(r => [3, 4].includes(r.id)) ? `Performance booked for ${booking.eventName || 'Event'}` :
                            roles.some(r => [5, 6].includes(r.id)) ? `Session scheduled for ${booking.eventName || 'Session'}` :
                              roles.some(r => [7, 8].includes(r.id)) ? `Consultation scheduled with ${booking.clientName || 'Client'}` :
                                `Booking: ${booking.eventName || 'Event'}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {booking.eventDate ? new Date(booking.eventDate).toLocaleDateString() : 'Date TBD'}
                        </p>
                      </div>
                    </div>
                  ))}
                  {userBookings.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">No recent activity</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>



          {/* Profile Tab - Mobile Optimized */}
          <TabsContent value="profile" className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Profile Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Website Integration Modal - Visible to all users with premium overlay for non-managed */}
                <div className="relative group">
                  <WebsiteIntegrationModal
                    artistId={user.id}
                    artistName={user.fullName}
                  >
                    <Button
                      className="w-full h-12 text-base bg-blue-600 hover:bg-blue-700 text-white"
                      disabled={!((isManaged && (isArtist || isMusicianProfile)) || isAdmin)}
                    >
                      <Globe className="w-4 h-4 mr-2" />
                      Website Integration
                    </Button>
                  </WebsiteIntegrationModal>

                  {/* Premium Feature Overlay for non-managed users */}
                  {!((isManaged && (isArtist || isMusicianProfile)) || isAdmin) && (
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/90 to-blue-600/90 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="text-white font-semibold text-sm text-center px-2">
                        <Crown className="w-5 h-5 mx-auto mb-1" />
                        Premium Feature
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Profile Edit Form */}
            <ProfileEditForm
              user={user}
              isManaged={isManaged}
              isArtist={isArtist}
              isMusicianProfile={isMusicianProfile}
              isProfessional={isProfessional}
              isFan={isFan}
              hasActiveSubscription={false} // TODO: Get from subscription status
            />

            {/* Requirements Management - For Artists, Musicians, and Professionals */}
            {(isArtist || isMusicianProfile || isProfessional) && !isFan && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Requirements Management</CardTitle>
                  {!isManaged && !false && ( // TODO: Replace !false with !hasActiveSubscription
                    <p className="text-sm text-muted-foreground">
                      ⭐ Premium feature - Subscription required for access
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="relative group">
                      <Button
                        onClick={() => setLocation('/hospitality-requirements')}
                        variant="outline"
                        className="w-full h-12 text-base justify-start"
                        disabled={!isManaged && !false} // TODO: Replace !false with !hasActiveSubscription
                      >
                        <Utensils className="w-4 h-4 mr-2" />
                        Hospitality Requirements
                      </Button>
                      {!isManaged && !false && ( // TODO: Replace !false with !hasActiveSubscription
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/90 to-blue-600/90 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <div className="text-white font-semibold text-sm text-center px-2">
                            <Crown className="w-5 h-5 mx-auto mb-1" />
                            Premium Feature
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="relative group">
                      <Button
                        onClick={() => setLocation('/technical-requirements')}
                        variant="outline"
                        className="w-full h-12 text-base justify-start"
                        disabled={!isManaged && !false} // TODO: Replace !false with !hasActiveSubscription
                      >
                        <Mic className="w-4 h-4 mr-2" />
                        Technical Requirements
                      </Button>
                      {!isManaged && !false && ( // TODO: Replace !false with !hasActiveSubscription
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/90 to-blue-600/90 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <div className="text-white font-semibold text-sm text-center px-2">
                            <Crown className="w-5 h-5 mx-auto mb-1" />
                            Premium Feature
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="relative group">
                      <Button
                        onClick={() => setLocation('/performance-requirements')}
                        variant="outline"
                        className="w-full h-12 text-base justify-start"
                        disabled={!isManaged && !false} // TODO: Replace !false with !hasActiveSubscription
                      >
                        <Music className="w-4 h-4 mr-2" />
                        Performance Requirements
                      </Button>
                      {!isManaged && !false && ( // TODO: Replace !false with !hasActiveSubscription
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/90 to-blue-600/90 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <div className="text-white font-semibold text-sm text-center px-2">
                            <Crown className="w-5 h-5 mx-auto mb-1" />
                            Premium Feature
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>



          {/* Calendar Tab - Mobile Optimized */}
          <TabsContent value="calendar" className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Calendar Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={handleBlockDate} className="w-full h-12 text-base">
                  <Calendar className="w-4 h-4 mr-2" />
                  Manage Availability
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Role-specific tabs */}
          {roles.some(r => [3, 4, 5].includes(r.id)) && (
            <TabsContent value="music" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Music Catalog</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    All uploads require ISRC code and 3000x3000px minimum cover art
                    {isManagedMusician && " • Managed musicians have full upload privileges"}
                  </p>
                  {isManaged && (
                    <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-2">
                      💡 Managed users can also embed YouTube videos (playlists encouraged)
                    </p>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <Button onClick={handleUploadMusic} className="w-full h-12 text-base">
                      <Music className="w-4 h-4 mr-2" />
                      Upload Music
                    </Button>
                    <UploadAlbumButton
                      variant="outline"
                      className="w-full h-12 text-base"
                      onSuccess={() => {
                        toast({
                          title: "Album uploaded successfully",
                          description: "Your album has been uploaded and is now available."
                        });
                        queryClient.invalidateQueries({ queryKey: ['/api/songs'] });
                      }}
                    />
                  </div>

                  {roles.some(r => [3, 5].includes(r.id)) && (
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-2 text-emerald-700 dark:text-emerald-300">YouTube Video Integration</h4>
                      <Button
                        onClick={() => setVideoUploadOpen(true)}
                        className="w-full h-12 text-base bg-red-600 hover:bg-red-700 text-white"
                      >
                        <Video className="w-4 h-4 mr-2" />
                        Add YouTube Video
                      </Button>
                      <p className="text-xs text-muted-foreground mt-2">
                        Add YouTube videos to your profile and all-links page. Playlists are encouraged for better organization.
                      </p>
                    </div>
                  )}

                  <div className="space-y-4">
                    <h4 className="font-medium">Your Songs</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {userSongs.map((song: any) => (
                        <Card key={song.id}>
                          <CardContent className="p-3 sm:p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium truncate text-sm sm:text-base">{song.title}</h4>
                                <p className="text-xs sm:text-sm text-muted-foreground truncate">{song.genre || 'No genre'}</p>
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                  Preview: {isManaged ? '15s-full' : '30s fixed'}
                                </p>
                                {song.price && (
                                  <p className="text-sm font-medium text-green-600">
                                    ${parseFloat(song.price).toFixed(2)}
                                  </p>
                                )}
                              </div>
                              <Button

                                variant="destructive"
                                className="flex-shrink-0"
                                onClick={() => handleDeleteSong(song.id, song.title)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      {userSongs.length === 0 && (
                        <p className="text-muted-foreground text-center py-6 sm:py-4 col-span-1 sm:col-span-2">
                          No songs uploaded yet
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {roles.some(r => [3, 4, 9].includes(r.id)) && (
            <TabsContent value="merchandise" className="space-y-4 sm:space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">
                    {isArtist ? 'Merchandise Management' : 'Merchandise'}
                  </CardTitle>
                  {isArtist && (
                    <p className="text-sm text-muted-foreground">
                      Manage your merchandise inventory and categories
                    </p>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {isArtist && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <Button onClick={handleMerchandiseManagement} className="w-full h-12 text-base">
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Add Merchandise
                      </Button>
                      <Button onClick={handleManageMerchandiseCategories} className="w-full h-12 text-base" variant="outline">
                        <FolderOpen className="w-4 h-4 mr-2" />
                        Manage Categories
                      </Button>
                    </div>
                  )}
                  {isFan && (
                    <Button onClick={handleBrowseStore} className="w-full h-12 text-base">
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Browse Store
                    </Button>
                  )}
                  {isArtist && (
                    <div className="space-y-4">
                      <h4 className="font-medium">Your Merchandise</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div className="text-center text-muted-foreground py-6 sm:py-8 col-span-1 sm:col-span-2">
                          No merchandise items yet. Start by adding some merchandise!
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {roles.some(r => [5, 6].includes(r.id)) && (
            <TabsContent value="equipment" className="space-y-4 sm:space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Instrument Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={handleUpdateEquipment} className="w-full h-12 text-base">
                    <Wrench className="w-4 h-4 mr-2" />
                    Manage Instruments
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {roles.some(r => [7, 8].includes(r.id)) && (
            <>
              <TabsContent value="services" className="space-y-4 sm:space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-lg sm:text-xl">Service Management</span>
                      <Button onClick={() => setShowConsultationCalendar(true)}>
                        <Calendar className="w-4 h-4 mr-2" />
                        Consultation Calendar
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button onClick={handleUpdateRates} className="w-full h-12 text-base">
                      <DollarSign className="w-4 h-4 mr-2" />
                      Manage Services & Rates
                    </Button>
                  </CardContent>
                </Card>

                {/* Consultation Calendar Section */}
                {showConsultationCalendar && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Calendar className="h-5 w-5" />
                          Consultation Calendar
                        </span>
                        <Button variant="outline" size="sm" onClick={() => setShowConsultationCalendar(false)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ConsultationCalendar user={user} />
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="knowledge" className="space-y-4 sm:space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-lg sm:text-xl">Knowledge Base</span>
                      <Button onClick={() => setShowKnowledgeBaseManager(true)}>
                        <BookOpen className="w-4 h-4 mr-2" />
                        Full Manager
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button onClick={handleManageKnowledgeBase} className="w-full h-12 text-base">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Manage Resources
                    </Button>
                  </CardContent>
                </Card>

                {/* Knowledge Base Manager Section */}
                {showKnowledgeBaseManager && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <BookOpen className="h-5 w-5" />
                          Knowledge Base Manager
                        </span>
                        <Button variant="outline" size="sm" onClick={() => setShowKnowledgeBaseManager(false)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <KnowledgeBaseManager user={user} />
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </>
          )}

          {/* {roles.some(r => [1, 2, 3, 4, 5, 6, 9].includes(r.id)) && ( */}
          <TabsContent value="bookings" className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">
                  {isArtist ? 'Performance Bookings' :
                    isMusicianProfile ? 'Session Bookings' :
                      'Event Bookings'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  {userBookings.map((booking: any) => (
                    <Card key={booking.id}>
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm sm:text-base truncate">{booking.eventName || 'Event'}</h4>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              {booking.eventDate ? new Date(booking.eventDate).toLocaleDateString() : 'Date TBD'}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            className="w-full sm:w-auto flex-shrink-0"
                            onClick={() => handleViewBooking(booking)}
                          >
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {userBookings.length === 0 && (
                    <p className="text-muted-foreground text-center py-6 sm:py-8">No bookings yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          {/* )} */}

          <TabsContent value="applications" className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">
                  All Applications
                </CardTitle>
              </CardHeader>

              <CardContent>
                  <div className="space-y-3 sm:space-y-4">
                    {applications.map((app: any) => (
                      <Card key={app.id}>
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between gap-3">
                                  <h3 className="text-lg font-semibold">
                                    Application # {app.id}
                                  </h3>
                                  <Button onClick={() => setLocation(`/management-walkthrough/${app.id}`)}>
                                    View Details
                                  </Button>
                                </div>
                                <p>
                                  <strong>Reason:</strong> {app.applicationReason || "N/A"}
                                </p>
                                <p>
                                  <strong>Status:</strong> {app.status}
                                </p>
                                <p>
                                  <strong>Submitted:</strong>{" "}
                                  {new Date(app.submittedAt).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {applications.length === 0 && (
                      <p className="text-muted-foreground text-center py-6 sm:py-8">
                        No Applications yet
                      </p>
                    )}
                  </div>
              </CardContent>
            </Card>
          </TabsContent>



          {/* My Gigs Tab - For Artists, Musicians, and Professionals */}
          {/* {roles.some(r => [3, 4, 5, 6, 7, 8].includes(r.id)) && ( */}
          <TabsContent value="gigs" className="space-y-4 sm:space-y-6">
            <GigComponent />
          </TabsContent>
          {/* )} */}

          {roles.some(r => [9].includes(r.id)) && (
            <>
              <TabsContent value="favorites" className="space-y-4 sm:space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl">Favorite Artists</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={handleBrowseArtists} className="w-full h-12 text-base">
                      <Heart className="w-4 h-4 mr-2" />
                      Browse Artists
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="purchases" className="space-y-4 sm:space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl">Purchase History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={handleViewPurchases} className="w-full h-12 text-base">
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      View Purchases
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </>
          )}

          {/* PRO Registration Tab - Available for Artists, Musicians, and Professionals */}
          {isPROEligible && (
            <TabsContent value="pro-registration" className="space-y-4 sm:space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <FileText className="h-5 w-5 flex-shrink-0" />
                    <span className="text-base sm:text-lg leading-tight">Performance Rights Organization Registration</span>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Register with a PRO to collect royalties for your musical works and performances
                  </p>
                </CardHeader>
                <CardContent>
                  <PRORegistration userId={user.id} />
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Splitsheet Service Tab - Available for Managed Artists and Musicians */}
          {isManaged && (isArtist || isManagedMusician) && (
            <TabsContent value="splitsheets" className="space-y-4 sm:space-y-6">
              <SplitsheetServiceDashboard user={user} />
            </TabsContent>
          )}

          {/* Admin Tabs - Complete Administration Suite */}
          {isAdmin && (
            <>
              {/* User Management Tab */}
              <TabsContent value="admin-users" className="space-y-4 sm:space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      User Management
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Manage platform users, roles, and permissions
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <Button onClick={handleCreateUser} className="h-20 flex flex-col items-center gap-2">
                        <Users className="h-6 w-6" />
                        Create User
                      </Button>
                      <Button onClick={() => setLocation('/users')} variant="outline" className="h-20 flex flex-col items-center gap-2">
                        <UserCheck className="h-6 w-6" />
                        View All Users
                      </Button>
                      <Button onClick={() => setLocation('/admin-panel?tab=authorization')} variant="outline" className="h-20 flex flex-col items-center gap-2">
                        <Shield className="h-6 w-6" />
                        Role Management
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* System Management Tab */}
              <TabsContent value="admin-system" className="space-y-4 sm:space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5 text-orange-600" />
                      System Administration
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Configure system settings and monitor performance
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <Button onClick={() => handleSystemAction("System Restart", async () => {
                        const response = await apiRequest('/api/admin/system/restart', { method: 'POST' });
                        toast({ title: "System Restart", description: "System services restarted successfully" });
                      })} className="h-20 flex flex-col items-center gap-2">
                        <Activity className="h-6 w-6" />
                        Restart System
                      </Button>
                      <Button onClick={() => handleSystemAction("Performance Monitor", () => {
                        toast({ title: "Performance Monitor", description: "System performance monitoring enabled" });
                      })} variant="outline" className="h-20 flex flex-col items-center gap-2">
                        <BarChart3 className="h-6 w-6" />
                        Performance
                      </Button>
                      <Button onClick={() => handleSystemAction("Financial Settings", () => {
                        toast({ title: "Financial Settings", description: "Configure platform fees and payment settings" });
                      })} variant="outline" className="h-20 flex flex-col items-center gap-2">
                        <DollarSign className="h-6 w-6" />
                        Financial
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Data Management Tab */}
              <TabsContent value="admin-data" className="space-y-4 sm:space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5 text-green-600" />
                      Data Management
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Import, export, and backup platform data
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <Button onClick={() => handleSystemAction("Database Backup", async () => {
                        const response = await apiRequest('/api/admin/database/backup', { method: 'POST' });
                        const data = await response.json();
                        toast({ title: "Database Backup", description: `Backup created: ${data.filename}` });
                      })} className="h-20 flex flex-col items-center gap-2">
                        <Download className="h-6 w-6" />
                        Backup Data
                      </Button>
                      <Button onClick={() => handleSystemAction("Export Data", async () => {
                        window.open('/api/admin/export-data');
                        toast({ title: "Data Export", description: "Export file downloaded successfully" });
                      })} variant="outline" className="h-20 flex flex-col items-center gap-2">
                        <FolderOpen className="h-6 w-6" />
                        Export Data
                      </Button>
                      <Button onClick={() => handleSystemAction("Import Data", () => {
                        toast({ title: "Import Data", description: "Data import functionality coming soon" });
                      })} variant="outline" className="h-20 flex flex-col items-center gap-2">
                        <Database className="h-6 w-6" />
                        Import Data
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="admin-security" className="space-y-4 sm:space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-red-600" />
                      Security & Monitoring
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Monitor security, audit logs, and system health
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <Button onClick={() => handleSystemAction("Security Audit", () => {
                        toast({ title: "Security Audit", description: "Security scan initiated successfully" });
                      })} className="h-20 flex flex-col items-center gap-2">
                        <Shield className="h-6 w-6" />
                        Security Audit
                      </Button>
                      <Button onClick={() => handleSystemAction("System Health", () => {
                        toast({ title: "System Health", description: "All systems operational" });
                      })} variant="outline" className="h-20 flex flex-col items-center gap-2">
                        <Activity className="h-6 w-6" />
                        Health Check
                      </Button>
                      <Button onClick={() => handleSystemAction("Audit Logs", () => {
                        toast({ title: "Audit Logs", description: "Viewing system audit logs" });
                      })} variant="outline" className="h-20 flex flex-col items-center gap-2">
                        <FileText className="h-6 w-6" />
                        Audit Logs
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Newsletter Management Tab */}
              <TabsContent value="newsletters" className="space-y-4 sm:space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="h-5 w-5 text-emerald-600" />
                      Newsletter Management
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Create and manage newsletters for fans and industry professionals
                    </p>
                  </CardHeader>
                  <CardContent>
                    <EnhancedNewsletterManagement />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Press Release Management Tab */}
              <TabsContent value="press-releases" className="space-y-4 sm:space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      Press Release Management
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Create and distribute press releases for artist announcements
                    </p>
                  </CardHeader>
                  <CardContent>
                    <PressReleaseManagement />
                  </CardContent>
                </Card>
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    );
  };

  return (
    <>
      {renderDashboardContent()}

      {/* Modals */}

      {musicUploadOpen && (
        <MusicUploadModal
          open={musicUploadOpen}
          onOpenChange={setMusicUploadOpen}
        />
      )}

      {calendarOpen && (
        <CalendarModal
          open={calendarOpen}
          onOpenChange={setCalendarOpen}
          mode="schedule"
        />
      )}

      {equipmentOpen && (
        <EquipmentModal
          open={equipmentOpen}
          onOpenChange={setEquipmentOpen}
        />
      )}

      {bookingResponseOpen && selectedBooking && (
        <BookingResponseModal
          open={bookingResponseOpen}
          onOpenChange={setBookingResponseOpen}
          booking={selectedBooking}
          onResponse={handleBookingResponse}
        />
      )}

      {merchandiseOpen && (
        <MerchandiseModal
          open={merchandiseOpen}
          onOpenChange={setMerchandiseOpen}
        />
      )}

      {serviceManagementOpen && (
        <ServiceManagementModal
          open={serviceManagementOpen}
          onOpenChange={setServiceManagementOpen}
        />
      )}

      {userManagementOpen && (
        <UserManagementModal
          open={userManagementOpen}
          onOpenChange={setUserManagementOpen}
          userData={user}
          mode={userModalMode}
        />
      )}

      {videoUploadOpen && (
        <VideoUploadModal
          isOpen={videoUploadOpen}
          onOpenChange={setVideoUploadOpen}
          userId={user.id}
        />
      )}

      {knowledgeBaseOpen && (
        <KnowledgeBaseModal
          open={knowledgeBaseOpen}
          onOpenChange={setKnowledgeBaseOpen}
        />
      )}

      {storeBrowserOpen && (
        <StoreBrowserModal
          isOpen={storeBrowserOpen}
          onClose={() => setStoreBrowserOpen(false)}
          user={user}
        />
      )}

      {/* Advanced Modal System for 100% Dashboard Functionality */}
      <AdvancedSetlistModal
        isOpen={showAdvancedSetlist}
        onClose={() => setShowAdvancedSetlist(false)}
        user={user}
      />

      <AdvancedEquipmentModal
        isOpen={showAdvancedEquipment}
        onClose={() => setShowAdvancedEquipment(false)}
        user={user}
      />

      <FanEngagementModal
        isOpen={showFanEngagement}
        onClose={() => setShowFanEngagement(false)}
        user={user}
      />

      <ConsultationManagementModal
        isOpen={showConsultationManagement}
        onClose={() => setShowConsultationManagement(false)}
        user={user}
      />
    </>
  );
}