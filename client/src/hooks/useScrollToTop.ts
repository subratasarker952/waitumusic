import { useEffect } from 'react';
import { useLocation } from 'wouter';

/**
 * Hook to automatically scroll to top when navigating between pages/tabs
 */
export const useScrollToTop = () => {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
};

/**
 * Function to manually trigger scroll to top (for modals, tabs, etc.)
 */
export const scrollToTop = () => {
  window.scrollTo(0, 0);
};