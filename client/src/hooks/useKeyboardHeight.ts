import { useState, useEffect } from 'react';

export function useKeyboardHeight() {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    if (!window.visualViewport) return;

    const handleViewportChange = () => {
      const windowHeight = window.innerHeight;
      const viewportHeight = window.visualViewport?.height || windowHeight;
      const height = windowHeight - viewportHeight;
      
      setKeyboardHeight(height);
      setIsKeyboardVisible(height > 100); // Keyboard is likely visible if height > 100px
    };

    // Initial check
    handleViewportChange();

    // Listen for viewport changes
    window.visualViewport.addEventListener('resize', handleViewportChange);
    window.visualViewport.addEventListener('scroll', handleViewportChange);

    return () => {
      window.visualViewport?.removeEventListener('resize', handleViewportChange);
      window.visualViewport?.removeEventListener('scroll', handleViewportChange);
    };
  }, []);

  return { keyboardHeight, isKeyboardVisible };
}