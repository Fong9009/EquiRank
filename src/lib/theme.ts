/**
 * Theme utility functions for handling light/dark/auto theme preferences
 * The 'auto' theme will automatically detect and follow the user's system preference.
 */

import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark' | 'auto';

/**
 * Get the effective theme based on user preference and system preference
 * @param userTheme - The user's theme preference ('light', 'dark', or 'auto')
 * @returns The effective theme ('light' or 'dark')
 */
export function getEffectiveTheme(userTheme: Theme): 'light' | 'dark' {
  if (userTheme === 'auto') {
    // Check system preference
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    // Default to light if window is not available (SSR)
    return 'light';
  }
  
  return userTheme;
}

/**
 * Hook to get the effective theme with system preference detection
 * @param userTheme - The user's theme preference
 * @returns The effective theme and a function to re-evaluate
 */
export function useEffectiveTheme(userTheme: Theme) {
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>(() => 
    getEffectiveTheme(userTheme)
  );

  useEffect(() => {
    if (userTheme === 'auto' && typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = () => {
        setEffectiveTheme(mediaQuery.matches ? 'dark' : 'light');
      };

      // Set initial value
      handleChange();
      
      // Listen for changes
      mediaQuery.addEventListener('change', handleChange);
      
      return () => {
        mediaQuery.removeEventListener('change', handleChange);
      };
    } else {
      setEffectiveTheme(userTheme as 'light' | 'dark');
    }
  }, [userTheme]);

  return effectiveTheme;
}

