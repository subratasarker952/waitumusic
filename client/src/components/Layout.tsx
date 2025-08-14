import { ReactNode } from 'react';
import Navigation from './Navigation';
import ComprehensiveMediaPlayer from './music/ComprehensiveMediaPlayer';
import { useAuth } from '@/contexts/AuthContext';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, isLoading } = useAuth();

  // Don't render until auth check is complete to prevent flash
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pb-20">{children}</main>
      {/* Universal Media Player - visible across all pages when authenticated */}
      {user && <ComprehensiveMediaPlayer />}
    </div>
  );
}
