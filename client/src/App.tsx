import * as React from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ToastProvider } from "@/components/ui/perfect-toast";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { MediaPlayerProvider } from "@/contexts/MediaPlayerContext";
import { ConfigurationProvider } from "@/contexts/ConfigurationProvider";

import TestComponent from "@/components/TestComponent";

import Layout from "@/components/Layout";
import AuthorizedRoute from "@/components/AuthorizedRoute";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Artists from "@/pages/Artists";
import ArtistDetail from "@/pages/ArtistDetail";
import ArtistBrowse from "@/pages/ArtistBrowse";
import Booking from "@/pages/BookingPage";
import Services from "@/pages/Services";
import Consultation from "@/pages/Consultation";
import Collaboration from "@/pages/Collaboration";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import TechnicalRiderDesigner from "@/pages/TechnicalRiderDesigner";
import Cart from "@/pages/Cart";
import Store from "@/pages/Store";
import { AdminPanel } from "@/pages/AdminPanel";
import Recommendations from "@/pages/Recommendations";

import BookingWorkflowTest from "@/pages/BookingWorkflowTest";
import CareerRecommendations from "@/pages/CareerRecommendations";
import ManagementApplicationWalkthrough from "@/pages/ManagementApplicationWalkthrough";
import EnhancedProfileTest from "@/pages/EnhancedProfileTest";
import MusicianRateManagement from "@/pages/MusicianRateManagement";

import ComprehensiveWorkflow from "@/pages/ComprehensiveWorkflow";
import ComprehensiveBookingWorkflow from "@/components/booking/ComprehensiveBookingWorkflow";
import GigHub from "@/components/gighub/GigHub";
import BookerView from "@/components/bookerview/BookerView";
import Users from "@/pages/Users";
import OppHubMarketplace from "@/pages/OppHubMarketplace";
import EnhancedOppHubMarketplace from "@/pages/EnhancedOppHubMarketplace";
import SubmitOpportunity from "@/pages/SubmitOpportunity";
import OpportunityDetail from "@/pages/OpportunityDetail";
import PRORegistrationPage from "@/pages/PRORegistrationPage";
import OppHubStrategicDashboard from "@/components/OppHubStrategicDashboard";
import OppHubHealthDashboard from "@/components/monitoring/OppHubHealthDashboard";
import NotFound from "@/pages/not-found";
import { SplitsheetDemoPage } from "@/components/SplitsheetDemoPage";
import EnhancedSplitsheetPage from "@/pages/EnhancedSplitsheetPage";
import Revenue from "@/pages/Revenue";
import ModalSystemTest from "@/pages/ModalSystemTest";
import OpportunityMatching from "@/pages/OpportunityMatching";
import PlatformAuditDashboard from "@/components/PlatformAuditDashboard";
import TechnicalGuidanceDemo from "@/components/TechnicalGuidanceDemo";
import { OfflineBookingAccess } from "@/components/OfflineBookingAccess";
import ComeSeeTvIntegrationDashboard from "@/components/ComeSeeTvIntegrationDashboard";
import DataIntegrityDemo from "@/pages/DataIntegrityDemo";
import AlbumUploadComplete from "@/pages/AlbumUploadComplete";
import PersistentMediaPlayer from "@/components/music/PersistentMediaPlayer";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { AdvancedBookingInterface } from "@/components/AdvancedBookingInterface";
import { ManagedAgentInterface } from "@/components/ManagedAgentInterface";

// Management System Components
import MerchandiseManager from "@/components/MerchandiseManager";
import NewsletterManager from "@/components/NewsletterManager";
import SplitsheetManager from "@/components/SplitsheetManager";
import ContractManager from "@/components/ContractManager";
import TechnicalRiderManager from "@/components/TechnicalRiderManager";
import ISRCManager from "@/components/ISRCManager";
import { ComprehensiveSystemAnalyzer } from "@/components/ComprehensiveSystemAnalyzer";
import SystemManagement from "@/pages/SystemManagement";
import ScrollToTop from "@/components/ScrollToTop";
import ScrollToTopUI from "@/components/ui/ScrollToTop";
import ProfileEdit from "@/pages/ProfileEdit";
import AllLinksPage from "@/pages/AllLinksPage";
import SharedDocument from "@/pages/SharedDocument";
import Albums from "@/pages/Albums";
import HospitalityRequirements from "@/pages/HospitalityRequirements";
import TechnicalRequirements from "@/pages/TechnicalRequirements";
import PerformanceRequirements from "@/pages/PerformanceRequirements";

function Router() {
  return (
    <Layout>
      <ScrollToTop />
      <ScrollToTopUI />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/artists" component={Artists} />
        <Route path="/browse-artists" component={ArtistBrowse} />
        <Route path="/artists/:id" component={ArtistDetail} />
        <Route path="/booking" component={Booking} />
        <Route path="/services" component={Services} />
        <Route path="/consultation" component={Consultation} />
        <Route path="/collaboration" component={Collaboration} />
        <Route path="/about" component={About} />
        <Route path="/contact" component={Contact} />
        <Route path="/cart" component={Cart} />
        <Route path="/store" component={Store} />
        <Route path="/albums" component={Albums} />
        <Route path="/share/:token" component={SharedDocument} />
        
        <Route path="/opphub">
          <AuthorizedRoute>
            <EnhancedOppHubMarketplace />
          </AuthorizedRoute>
        </Route>
        
        <Route path="/opphub-classic">
          <AuthorizedRoute>
            <OppHubMarketplace />
          </AuthorizedRoute>
        </Route>
        
        <Route path="/submit-opportunity">
          <AuthorizedRoute>
            <SubmitOpportunity />
          </AuthorizedRoute>
        </Route>
        
        <Route path="/opportunities/:id">
          <AuthorizedRoute>
            <OpportunityDetail />
          </AuthorizedRoute>
        </Route>
        
        <Route path="/opphub-strategic">
          <AuthorizedRoute>
            <OppHubStrategicDashboard />
          </AuthorizedRoute>
        </Route>
        
        {/* Protected Routes */}
        <Route path="/dashboard">
          <AuthorizedRoute>
            <Dashboard />
          </AuthorizedRoute>
        </Route>
        
        <Route path="/profile/edit">
          <AuthorizedRoute>
            <ProfileEdit />
          </AuthorizedRoute>
        </Route>
        
        <Route path="/hospitality-requirements">
          <AuthorizedRoute>
            <HospitalityRequirements />
          </AuthorizedRoute>
        </Route>
        
        <Route path="/technical-requirements">
          <AuthorizedRoute>
            <TechnicalRequirements />
          </AuthorizedRoute>
        </Route>
        
        <Route path="/performance-requirements">
          <AuthorizedRoute>
            <PerformanceRequirements />
          </AuthorizedRoute>
        </Route>
        
        <Route path="/recommendations">
          <AuthorizedRoute>
            <Recommendations />
          </AuthorizedRoute>
        </Route>
        

        
        <Route path="/admin">
          <AuthorizedRoute>
            <AdminPanel />
          </AuthorizedRoute>
        </Route>



        {/* Management System Routes */}
        <Route path="/merchandise-manager">
          <AuthorizedRoute>
            <MerchandiseManager />
          </AuthorizedRoute>
        </Route>
        
        <Route path="/newsletter-manager">
          <AuthorizedRoute>
            <NewsletterManager />
          </AuthorizedRoute>
        </Route>
        
        <Route path="/splitsheet-manager">
          <AuthorizedRoute>
            <SplitsheetManager />
          </AuthorizedRoute>
        </Route>
        
        <Route path="/contract-manager">
          <AuthorizedRoute>
            <ContractManager />
          </AuthorizedRoute>
        </Route>
        
        <Route path="/technical-rider-manager">
          <AuthorizedRoute>
            <TechnicalRiderManager />
          </AuthorizedRoute>
        </Route>
        
        <Route path="/isrc-manager">
          <AuthorizedRoute>
            <ISRCManager />
          </AuthorizedRoute>
        </Route>

        <Route path="/opportunity-matching">
          <AuthorizedRoute>
            <OpportunityMatching />
          </AuthorizedRoute>
        </Route>

        <Route path="/health-monitor">
          <AuthorizedRoute>
            <OppHubHealthDashboard />
          </AuthorizedRoute>
        </Route>
        
        <Route path="/platform-audit">
          <AuthorizedRoute>
            <PlatformAuditDashboard />
          </AuthorizedRoute>
        </Route>


        
        <Route path="/booking-workflow-test">
          <AuthorizedRoute>
            <BookingWorkflowTest />
          </AuthorizedRoute>
        </Route>
        
        <Route path="/bookings/:id">
          <AuthorizedRoute>
            <GigHub />
          </AuthorizedRoute>
        </Route>
        
        <Route path="/my-bookings/:id">
          <AuthorizedRoute>
            <BookerView />
          </AuthorizedRoute>
        </Route>
        
        <Route path="/comprehensive-workflow">
          <AuthorizedRoute>
            <ComprehensiveWorkflow />
          </AuthorizedRoute>
        </Route>
        
        <Route path="/technical-guidance-demo">
          <AuthorizedRoute>
            <TechnicalGuidanceDemo />
          </AuthorizedRoute>
        </Route>
        
        <Route path="/technical-rider-designer">
          <AuthorizedRoute>
            <TechnicalRiderDesigner />
          </AuthorizedRoute>
        </Route>
        
        <Route path="/technical-rider">
          <AuthorizedRoute>
            <TechnicalRiderDesigner />
          </AuthorizedRoute>
        </Route>
        
        <Route path="/management-walkthrough/:id">
          <AuthorizedRoute>
            <ManagementApplicationWalkthrough />
          </AuthorizedRoute>
        </Route>
        
        <Route path="/enhanced-profile-test">
          <AuthorizedRoute>
            <EnhancedProfileTest />
          </AuthorizedRoute>
        </Route>
        
        <Route path="/admin/contracts">
          <AuthorizedRoute>
            <AdminPanel />
          </AuthorizedRoute>
        </Route>
        
        <Route path="/admin/bookings">
          <AuthorizedRoute>
            <AdminPanel />
          </AuthorizedRoute>
        </Route>
        
        <Route path="/musician-rates">
          <AuthorizedRoute>
            <MusicianRateManagement />
          </AuthorizedRoute>
        </Route>
        
        <Route path="/users">
          <AuthorizedRoute>
            <Users />
          </AuthorizedRoute>
        </Route>
        
        <Route path="/revenue" component={Revenue} />
        
        <Route path="/pro-registration">
          <AuthorizedRoute>
            <PRORegistrationPage />
          </AuthorizedRoute>
        </Route>
        
        <Route path="/splitsheet">
          <AuthorizedRoute>
            <EnhancedSplitsheetPage />
          </AuthorizedRoute>
        </Route>

        {/* This duplicate route is removed - already exists above */}

        <Route path="/splitsheet-manager">
          <AuthorizedRoute>
            <SplitsheetManager />
          </AuthorizedRoute>
        </Route>

        <Route path="/contract-manager">
          <AuthorizedRoute>
            <ContractManager />
          </AuthorizedRoute>
        </Route>

        <Route path="/technical-rider-manager">
          <AuthorizedRoute>
            <TechnicalRiderManager />
          </AuthorizedRoute>
        </Route>

        <Route path="/isrc-manager">
          <AuthorizedRoute>
            <ISRCManager />
          </AuthorizedRoute>
        </Route>

        <Route path="/newsletter-manager">
          <AuthorizedRoute>
            <NewsletterManager />
          </AuthorizedRoute>
        </Route>

        <Route path="/system-management">
          <AuthorizedRoute>
            <SystemManagement />
          </AuthorizedRoute>
        </Route>
        
        {/* Keep legacy routes for backward compatibility */}
        <Route path="/enhanced-splitsheet">
          <AuthorizedRoute>
            <EnhancedSplitsheetPage />
          </AuthorizedRoute>
        </Route>
        <Route path="/splitsheet-demo" component={SplitsheetDemoPage} />
        
        <Route path="/modal-system-test">
          <AuthorizedRoute>
            <ModalSystemTest />
          </AuthorizedRoute>
        </Route>

        <Route path="/comeseetv-integration">
          <AuthorizedRoute>
            <ComeSeeTvIntegrationDashboard />
          </AuthorizedRoute>
        </Route>

        <Route path="/data-integrity-demo">
          <AuthorizedRoute>
            <DataIntegrityDemo />
          </AuthorizedRoute>
        </Route>

        <Route path="/album-upload-complete/:albumId">
          <AuthorizedRoute>
            <AlbumUploadComplete />
          </AuthorizedRoute>
        </Route>

        <Route path="/system-analyzer">
          <AuthorizedRoute>
            <ComprehensiveSystemAnalyzer />
          </AuthorizedRoute>
        </Route>

        <Route path="/offline-booking">
          <AuthorizedRoute>
            <OfflineBookingAccess />
          </AuthorizedRoute>
        </Route>

        <Route path="/advanced-booking">
          <AuthorizedRoute>
            <AdvancedBookingInterface />
          </AuthorizedRoute>
        </Route>

        <Route path="/managed-agents">
          <AuthorizedRoute>
            <ManagedAgentInterface />
          </AuthorizedRoute>
        </Route>
        
        {/* Test route for debugging React rendering */}
        <Route path="/test-react" component={TestComponent} />
        
        {/* Fallback to 404 */}
        <Route component={NotFound} />
        
        {/* All-Links Pages - Catch-all for slugs - Must be after NotFound */}
        {/* <Route path="/:slug" component={AllLinksPage} /> */}
      </Switch>
    </Layout>
  );
}

// Removed media player integration for simpler loading

export default function App() {
  console.log("✅ React app mounted successfully");
  
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <ToastProvider>
          <AuthProvider>
            <ConfigurationProvider>
              <CartProvider>
                <MediaPlayerProvider>
                  <TooltipProvider>
                    <div className="min-h-screen bg-background">
                      <Router />
                      <Toaster />
                      <PersistentMediaPlayer />
                      <PWAInstallPrompt />
                    </div>
                  </TooltipProvider>
                </MediaPlayerProvider>
              </CartProvider>
            </ConfigurationProvider>
          </AuthProvider>
        </ToastProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}
