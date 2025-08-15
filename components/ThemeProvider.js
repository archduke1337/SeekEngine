import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('system'); // 'light' | 'dark' | 'system'

  // Initialize theme from localStorage (client-only)
  useEffect(() => {
    try {
      const stored = localStorage.getItem('theme');
      if (stored) setTheme(stored);
    } catch (e) {
      // ignore (e.g. SSR)
    }
  }, []);

  // Apply theme whenever it changes
  useEffect(() => {
    const applyTheme = (current) => {
      const prefersDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const isDark = current === 'dark' || (current === 'system' && prefersDark);

      // Toggle both Tailwind's dark class and our light class (we use light overrides)
      if (isDark) {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      }
    };

    // Add a smooth transition helper while changing theme
    try {
      document.documentElement.classList.add('theme-transition');
      applyTheme(theme);
      const t = window.setTimeout(() => {
        document.documentElement.classList.remove('theme-transition');
      }, 300);
      return () => window.clearTimeout(t);
    } catch (e) {
      // ignore (SSR safety)
      applyTheme(theme);
      return undefined;
    }
  }, [theme]);

  // Persist selection
  useEffect(() => {
    try {
      localStorage.setItem('theme', theme);
    } catch (e) {}
  }, [theme]);

  // Toggle helper: if value provided, set explicitly, otherwise toggle between light/dark
  const toggleTheme = (value) => {
    setTheme((prev) => {
      if (value) return value;
      if (prev === 'system') {
        // choose opposite of system preference
        const prefersDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        return prefersDark ? 'light' : 'dark';
      }
      return prev === 'dark' ? 'light' : 'dark';
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export default ThemeProvider;
