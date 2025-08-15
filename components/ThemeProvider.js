import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('system'); // 'light' | 'dark' | 'system'

  useEffect(() => {
    // initialize from localStorage (client-only)
    try {
      const stored = localStorage.getItem('theme');
      if (stored) setTheme(stored);
    } catch (e) {
      // ignore (e.g. SSR)
    }
  }, []);

  useEffect(() => {
    const applyTheme = (current) => {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const isDark = current === 'dark' || (current === 'system' && prefersDark);

      document.documentElement.classList.toggle('dark', isDark);
      document.documentElement.classList.toggle('light', !isDark);
    };

    applyTheme(theme);

    // If theme is 'system', listen to changes
    let mql;
    if (theme === 'system' && window.matchMedia) {
      mql = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => applyTheme('system');
      try {
        mql.addEventListener ? mql.addEventListener('change', handler) : mql.addListener(handler);
      } catch (e) {
        // fallback for older browsers
        mql.addListener(handler);
      }

      return () => {
        try {
          mql.removeEventListener ? mql.removeEventListener('change', handler) : mql.removeListener(handler);
        } catch (e) {
          mql.removeListener(handler);
        }
      };
    }

    return undefined;
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem('theme', theme);
    } catch (e) {}
  }, [theme]);

  const toggleTheme = (value) => {
    setTheme(value || (theme === 'dark' ? 'light' : 'dark'));
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
