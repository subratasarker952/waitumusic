import { useState, useCallback, useEffect } from 'react';

// Safe audio context management hook
export function useAudioSafety() {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasError, setHasError] = useState(false);

  const initializeAudio = useCallback(async () => {
    if (hasError || isInitialized || audioContext) return false;
    
    try {
      // Check if AudioContext is available
      if (!window.AudioContext && !(window as any).webkitAudioContext) {
        setHasError(true);
        console.warn('AudioContext not supported in this browser');
        return false;
      }

      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Handle iOS/Safari restrictions
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      
      setAudioContext(ctx);
      setIsInitialized(true);
      return true;
    } catch (error) {
      setHasError(true);
      console.warn('Failed to initialize audio context:', error);
      return false;
    }
  }, [hasError, isInitialized, audioContext]);

  const cleanup = useCallback(() => {
    if (audioContext && audioContext.state !== 'closed') {
      audioContext.close();
    }
    setAudioContext(null);
    setIsInitialized(false);
  }, [audioContext]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    audioContext,
    isInitialized,
    hasError,
    initializeAudio,
    cleanup
  };
}