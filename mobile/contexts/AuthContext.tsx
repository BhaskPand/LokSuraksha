import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { ApiClient } from '@citizen-safety/shared';

const getApiBaseUrl = () => {
  return Constants.expoConfig?.extra?.apiBaseUrl || 'http://localhost:3001';
};

// Initialize apiClient with the base URL
const apiClient = new ApiClient(getApiBaseUrl());

interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('auth_token');
      const storedUser = await AsyncStorage.getItem('auth_user');
      
      if (storedToken && storedUser) {
        const userData = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(userData);
        // Set token in API client
        apiClient.setAdminToken(storedToken);
        
        // Verify token is still valid by checking profile (skip if network unavailable)
        // Don't block login if network check fails - let user try
        try {
          const apiBaseUrl = Constants.expoConfig?.extra?.apiBaseUrl || 'http://localhost:3001';
          const response = await fetch(`${apiBaseUrl}/api/auth/profile`, {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
            // Add timeout to prevent hanging
            signal: AbortSignal.timeout(3000),
          });
          
          if (!response.ok && response.status === 401) {
            // Token invalid, clear storage
            await AsyncStorage.removeItem('auth_token');
            await AsyncStorage.removeItem('auth_user');
            setToken(null);
            setUser(null);
          }
        } catch (error: any) {
          // If profile check fails (network error, timeout, etc.), still allow login
          // User can try to use the app and will be logged out if token is actually invalid
          console.log('Could not verify token:', error.message);
        }
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const apiBaseUrl = Constants.expoConfig?.extra?.apiBaseUrl || 'http://localhost:3001';
      console.log('Login attempt to:', `${apiBaseUrl}/api/auth/login`);
      
      const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: Login failed`);
      }

      const data = await response.json();

      await AsyncStorage.setItem('auth_token', data.token);
      await AsyncStorage.setItem('auth_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      apiClient.setAdminToken(data.token);
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.message?.includes('Network request failed') || error.message?.includes('Failed to fetch')) {
        throw new Error('Cannot connect to server. Make sure backend is running and API URL is correct. Check app.json for apiBaseUrl.');
      }
      throw new Error(error.message || 'Login failed');
    }
  };

  const signup = async (email: string, password: string, name: string, phone?: string) => {
    try {
      const apiBaseUrl = Constants.expoConfig?.extra?.apiBaseUrl || 'http://localhost:3001';
      console.log('Signup attempt to:', `${apiBaseUrl}/api/auth/signup`);
      
      const response = await fetch(`${apiBaseUrl}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, phone }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: Signup failed`);
      }

      const data = await response.json();

      await AsyncStorage.setItem('auth_token', data.token);
      await AsyncStorage.setItem('auth_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      apiClient.setAdminToken(data.token);
    } catch (error: any) {
      console.error('Signup error:', error);
      if (error.message?.includes('Network request failed') || error.message?.includes('Failed to fetch')) {
        throw new Error('Cannot connect to server. Make sure backend is running and API URL is correct. Check app.json for apiBaseUrl.');
      }
      throw new Error(error.message || 'Signup failed');
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('auth_user');
    setToken(null);
    setUser(null);
    apiClient.setAdminToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        signup,
        logout,
        isAuthenticated: !!user && !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

