// import { useQuery } from '@tanstack/react-query';
// import { useAuth } from '@/contexts/AuthContext';
// import { useState } from 'react';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Settings, BarChart3, ArrowLeftRight } from 'lucide-react';
// import UnifiedDashboard from '@/components/UnifiedDashboard';
// import HierarchicalDashboard from '@/components/admin/HierarchicalDashboard';
// import AuthRequiredWrapper from '@/components/auth/AuthRequiredWrapper';
// import { useScrollToTop } from '@/hooks/useScrollToTop';

// function DashboardContent() {
//   const { user, isLoading, role } = useAuth();
//   const [dashboardMode, setDashboardMode] = useState<'operational' | 'configuration'>('operational');
//   useScrollToTop(); // Scroll to top on page navigation

//   // Show loading spinner while auth is being checked
//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
//           <p className="mt-4 text-lg">Loading dashboard...</p>
//         </div>
//       </div>
//     );
//   }

//   // Simple role-based check: if no user or no role, redirect to login
//   if (!user || !role?.id) {
//     window.location.href = '/login';
//     return null;
//   }

//   // Fetch dashboard statistics
//   const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
//     queryKey: ['/api/dashboard/stats'],
//     enabled: !!user,
//     retry: 1,
//     retryOnMount: false
//   });

//   const isAdminRole = user && [1, 2].includes(user.roleId);
//   const isSuperAdmin = user && user.roleId === 1;

//   // Fetch bookings based on user role
//   const { data: allBookings, isLoading: allBookingsLoading, error: allBookingsError } = useQuery({
//     queryKey: ['/api/bookings/all'],
//     enabled: !!user && !!isAdminRole,
//     retry: 1
//   });

//   // Fetch user's own bookings
//   const { data: userBookings, isLoading: userBookingsLoading, error: userBookingsError } = useQuery({
//     queryKey: ['/api/bookings/user'],
//     enabled: !!user && !isAdminRole,
//     retry: 1
//   });

//   // Fetch Applications based on user role
//   const { data: allApplications, isLoading: allApplicationsLoading, error: allApplicationsError } = useQuery({
//     queryKey: ['/api/management-applications'],
//     enabled: !!user && !!isAdminRole,
//     retry: 1
//   });

//   // Fetch user's own applications
//   const { data: userApplications, isLoading: userApplicationsLoading, error: userApplicationsError } = useQuery({
//     queryKey: [`/api/management-applications/user/${user.id}`],
//     enabled: !!user && !isAdminRole,
//     retry: 1
//   });

//   console.log(userApplications, allApplications)
//   // Check loading states
//   const shouldLoadStats = statsLoading;
//   const shouldLoadAdminBookings = isAdminRole && allBookingsLoading;
//   const shouldLoadUserBookings = !isAdminRole && userBookingsLoading;
//   const shouldLoadAdminApplications = isAdminRole && allApplicationsLoading;
//   const shouldLoadUserApplications = !isAdminRole && userApplicationsLoading;

//   // Show error message with more details for debugging
//   if (statsError || allBookingsError || userBookingsError || userApplicationsError || allApplicationsError) {
//     console.error('Dashboard errors:', { statsError, allBookingsError, userBookingsError });

//     // Report error to OppHub learning system
//     if (statsError || allBookingsError || userBookingsError) {
//       const errorMsg = statsError?.message || allBookingsError?.message || userBookingsError?.message || 'Dashboard loading error';
//       fetch('/api/opphub/report-error', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           error: `Dashboard Error: ${errorMsg}`,
//           context: 'dashboard_loading_failure'
//         })
//       }).catch(console.error);
//     }

//     return (
//       <div className="container mx-auto px-4 py-8">
//         <div className="text-center">
//           <div className="text-red-600 mb-4">Dashboard Error</div>
//           <p className="text-gray-600 mb-4">Something went wrong loading the dashboard. Please refresh the page.</p>
//           {process.env.NODE_ENV === 'development' && (
//             <div className="text-xs text-gray-500 mt-4 p-2 bg-gray-100 rounded">
//               <p>Stats Error: {statsError?.message || 'None'}</p>
//               <p>Admin Bookings Error: {allBookingsError?.message || 'None'}</p>
//               <p>User Bookings Error: {userBookingsError?.message || 'None'}</p>
//             </div>
//           )}
//         </div>
//       </div>
//     );
//   }

//   if (shouldLoadStats || shouldLoadAdminBookings || shouldLoadUserBookings || shouldLoadAdminApplications || shouldLoadUserApplications) {
//     return (
//       <div className="container mx-auto px-4 py-8">
//         <div className="text-center">
//           <div className="animate-pulse">Loading dashboard...</div>
//         </div>
//       </div>
//     );
//   }

//   const bookings = Array.isArray(allBookings) ? allBookings : Array.isArray(userBookings) ? userBookings : [];

//   // Use HierarchicalDashboard for admin users (role IDs 1-2), UnifiedDashboard for others
//   const isAdminUser = user?.roleId === 1 || user?.roleId === 2; // SuperAdmin or Admin

//   return (
//     <div className="container mx-auto px-4 py-8">
//       {/* Superadmin Toggle System */}
//       {isSuperAdmin && (
//         <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100">
//                 SuperAdmin Access
//               </Badge>
//               <span className="text-sm text-gray-600 dark:text-gray-300">
//                 Choose your dashboard mode:
//               </span>
//             </div>
//             <div className="flex items-center gap-2">
//               <Button
//                 variant={dashboardMode === 'operational' ? 'default' : 'outline'}
//                 size="sm"
//                 onClick={() => {
//                   setDashboardMode('operational');
//                   window.scrollTo(0, 0);
//                 }}
//                 className="flex items-center gap-2"
//               >
//                 <BarChart3 className="h-4 w-4" />
//                 Legacy View
//                 <Badge variant="secondary" className="ml-1 text-xs">User Dashboard</Badge>
//               </Button>
//               <ArrowLeftRight className="h-4 w-4 text-gray-400" />
//               <Button
//                 variant={dashboardMode === 'configuration' ? 'default' : 'outline'}
//                 size="sm"
//                 onClick={() => {
//                   setDashboardMode('configuration');
//                   window.scrollTo(0, 0);
//                 }}
//                 className="flex items-center gap-2"
//               >
//                 <Settings className="h-4 w-4" />
//                 Unified Control
//                 <Badge variant="secondary" className="ml-1 text-xs">Configuration Center</Badge>
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Dashboard Content Based on User Role and Mode */}
//       {isAdminUser ? (
//         <>
//           {isSuperAdmin && dashboardMode === 'configuration' ? (
//             <HierarchicalDashboard user={user} />
//           ) : (
//             <UnifiedDashboard
//               user={user}
//               stats={stats || {}}
//               bookings={isAdminRole ? (allBookings || []) : (userBookings || [])}
//               applications={isAdminRole ? (allApplications || []) : (userApplications || [])}
//             />
//           )}
//         </>
//       ) : (
//         <UnifiedDashboard
//           user={user}
//           stats={stats || {}}
//           bookings={isAdminRole ? (allBookings || []) : (userBookings || [])}
//           applications={isAdminRole ? (allApplications || []) : (userApplications || [])}
//         />
//       )}

//     </div>
//   );
// }

// export default function Dashboard() {
//   return (
//     <AuthRequiredWrapper message="Please log in to access your dashboard">
//       <DashboardContent />
//     </AuthRequiredWrapper>
//   );
// }

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, BarChart3, ArrowLeftRight } from "lucide-react";
import UnifiedDashboard from "@/components/UnifiedDashboard";
import HierarchicalDashboard from "@/components/admin/HierarchicalDashboard";
import AuthRequiredWrapper from "@/components/auth/AuthRequiredWrapper";
import { useScrollToTop } from "@/hooks/useScrollToTop";

function DashboardContent() {
  const { user, isLoading, roles } = useAuth();
  const [dashboardMode, setDashboardMode] = useState<
    "operational" | "configuration"
  >("operational");
  useScrollToTop();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !roles) {
    window.location.href = "/login";
    return null;
  }

  // ✅ Role array থেকে চেক করা হচ্ছে
  const userRoleIds = Array.isArray(roles) ? roles.map((r) => r.id) : [];
  const isAdminRole = userRoleIds.some((id) => [1, 2].includes(id));
  const isSuperAdmin = userRoleIds.includes(1);

  // --- Queries ---
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    enabled: !!user,
  });


  const {
    data: allBookings,
    isLoading: allBookingsLoading,
    error: allBookingsError,
  } = useQuery({
    queryKey: ["/api/bookings/all"],
    enabled: !!user && !!isAdminRole,
  });

  const {
    data: userBookings,
    isLoading: userBookingsLoading,
    error: userBookingsError,
  } = useQuery({
    queryKey: ["/api/bookings/user"],
    enabled: !!user && !isAdminRole,
  });

  const {
    data: allApplications,
    isLoading: allApplicationsLoading,
    error: allApplicationsError,
  } = useQuery({
    queryKey: ["/api/management-applications"],
    enabled: !!user && !!isAdminRole,
  });

  const {
    data: userApplications,
    isLoading: userApplicationsLoading,
    error: userApplicationsError,
  } = useQuery({
    queryKey: [`/api/management-applications/user`],
    enabled: !!user && !isAdminRole,
  });

  // --- Error Handling ---
  if (
    statsError ||
    allBookingsError ||
    userBookingsError ||
    allApplicationsError ||
    userApplicationsError
  ) {
    console.error("Dashboard errors:", {
      statsError,
      allBookingsError,
      userBookingsError,
      allApplicationsError,
      userApplicationsError,
    });

    const errorMsg =
      statsError?.message ||
      allBookingsError?.message ||
      userBookingsError?.message ||
      allApplicationsError?.message ||
      userApplicationsError?.message ||
      "Dashboard loading error";

    fetch("/api/opphub/report-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: `Dashboard Error: ${errorMsg}`,
        context: "dashboard_loading_failure",
      }),
    }).catch(console.error);

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="text-red-600 mb-4">Dashboard Error</div>
          <p className="text-gray-600 mb-4">
            Something went wrong loading the dashboard. Please refresh the page.
          </p>
          {process.env.NODE_ENV === "development" && (
            <div className="text-xs text-gray-500 mt-4 p-2 bg-gray-100 rounded">
              <p>Stats Error: {statsError?.message || "None"}</p>
              <p>Admin Bookings Error: {allBookingsError?.message || "None"}</p>
              <p>User Bookings Error: {userBookingsError?.message || "None"}</p>
              <p>
                Applications Error:{" "}
                {allApplicationsError?.message ||
                  userApplicationsError?.message ||
                  "None"}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (
    statsLoading ||
    allBookingsLoading ||
    userBookingsLoading ||
    allApplicationsLoading ||
    userApplicationsLoading
  ) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-pulse">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  const bookings = isAdminRole ? allBookings || [] : userBookings || [];
  const applications = isAdminRole
    ? allApplications || []
    : userApplications || [];

  return (
    <div className="container mx-auto px-4 py-8">
      {isSuperAdmin && (
        <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between md:flex-row flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="text-center md:text-left">
                <Badge
                  variant="secondary"
                  className="bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100"
                >
                  SuperAdmin Access
                </Badge>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Choose your dashboard mode:
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={
                  dashboardMode === "operational" ? "default" : "outline"
                }
                onClick={() => {
                  setDashboardMode("operational");
                  window.scrollTo(0, 0);
                }}
                className="flex items-center gap-2"
              >
                <BarChart3 className="h-8 w-8" />
                <div className="flex flex-col gap-0.5 py-1">
                  <p>Legacy View</p>
                  <Badge variant="secondary" className="ml-1 text-xs">
                    User Dashboard
                  </Badge>
                </div>
              </Button>
              <ArrowLeftRight className="h-4 w-4 text-gray-400" />
              <Button
                variant={
                  dashboardMode === "configuration" ? "default" : "outline"
                }
                onClick={() => {
                  setDashboardMode("configuration");
                  window.scrollTo(0, 0);
                }}
                className="flex items-center gap-2"
              >
                <Settings className="h-8 w-8" />
                <div className="flex flex-col gap-0.5 py-1">
                  <p>Unified Control</p>
                  <Badge variant="secondary" className="ml-1 text-xs">
                    Configuration Center
                  </Badge>
                </div>
              </Button>
            </div>
          </div>
        </div>
      )}

      {isAdminRole ? (
        isSuperAdmin && dashboardMode === "configuration" ? (
          <HierarchicalDashboard user={user} />
        ) : (
          <UnifiedDashboard
            stats={stats || {}}
            bookings={bookings}
            applications={applications}
          />
        )
      ) : (
        <UnifiedDashboard
          stats={stats || {}}
          bookings={bookings}
          applications={applications}
        />
      )}
    </div>
  );
}

export default function Dashboard() {
  return (
    <AuthRequiredWrapper message="Please log in to access your dashboard">
      <DashboardContent />
    </AuthRequiredWrapper>
  );
}
