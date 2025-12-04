import React, { createContext, useState, useEffect, useContext } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeColors {
  background: string;
  surface: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  primary: string;
  primaryLight: string;
  accent: string;
  error: string;
  success: string;
  warning: string;
  shadow: string;
}

interface Theme {
  colors: ThemeColors;
  mode: ThemeMode;
}

const lightTheme: ThemeColors = {
  background: '#F5F3FF', // Soft light lavender
  surface: '#FFFFFF',
  card: '#FFFFFF',
  text: '#1F2937',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  primary: '#8B5CF6', // Pastel purple
  primaryLight: '#E9D5FF',
  accent: '#F59E0B',
  error: '#DC2626',
  success: '#16A34A',
  warning: '#F59E0B',
  shadow: '#000000',
};

const darkTheme: ThemeColors = {
  background: '#1F2937',
  surface: '#374151',
  card: '#4B5563',
  text: '#F9FAFB',
  textSecondary: '#D1D5DB',
  border: '#6B7280',
  primary: '#A78BFA',
  primaryLight: '#6D28D9',
  accent: '#FBBF24',
  error: '#EF4444',
  success: '#22C55E',
  warning: '#FBBF24',
  shadow: '#000000',
};

interface ThemeContextType {
  theme: Theme;
  colors: ThemeColors;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@loksuraksha:theme_mode';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('auto');
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    loadThemeMode();
  }, []);

  useEffect(() => {
    const shouldBeDark = themeMode === 'dark' || (themeMode === 'auto' && systemColorScheme === 'dark');
    setIsDark(shouldBeDark);
  }, [themeMode, systemColorScheme]);

  const loadThemeMode = async () => {
    try {
      const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (saved && (saved === 'light' || saved === 'dark' || saved === 'auto')) {
        setThemeModeState(saved as ThemeMode);
      }
    } catch (error) {
      console.error('Error loading theme mode:', error);
    }
  };

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      setThemeModeState(mode);
    } catch (error) {
      console.error('Error saving theme mode:', error);
    }
  };

  const toggleTheme = () => {
    const newMode = isDark ? 'light' : 'dark';
    setThemeMode(newMode);
  };

  const colors = isDark ? darkTheme : lightTheme;

  const theme: Theme = {
    colors,
    mode: themeMode,
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        colors,
        toggleTheme,
        setThemeMode,
        isDark,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

