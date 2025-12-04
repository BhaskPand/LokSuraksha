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
  email_verified?: boolean;
  phone_verified?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  transitionLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, phone?: string) => Promise<{ requiresVerification: boolean; email: string; dev_otps?: { email_otp?: string; phone_otp?: string } }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  isAuthenticated: boolean;
  sendVerificationOTP: (email: string, type: 'email' | 'phone') => Promise<{ dev_otp?: string }>;
  verifyOTP: (email: string, otp: string, type: 'email' | 'phone') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [transitionLoading, setTransitionLoading] = useState(false);

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
      setTransitionLoading(true);
      const apiBaseUrl = Constants.expoConfig?.extra?.apiBaseUrl || 'http://localhost:3001';
      console.log('Login attempt to:', `${apiBaseUrl}/api/auth/login`);
      
      const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        
        // Check if email verification is required
        if (errorData.requiresVerification && !errorData.email_verified) {
          const verificationError: any = new Error(errorData.error || 'Email not verified');
          verificationError.requiresVerification = true;
          verificationError.email_verified = false;
          verificationError.phone_verified = errorData.phone_verified || false;
          setTransitionLoading(false);
          throw verificationError;
        }
        
        setTransitionLoading(false);
        throw new Error(errorData.error || `HTTP ${response.status}: Login failed`);
      }

      const data = await response.json();

      await AsyncStorage.setItem('auth_token', data.token);
      await AsyncStorage.setItem('auth_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      apiClient.setAdminToken(data.token);

      // Show loading animation for 2 seconds
      await new Promise(resolve => setTimeout(resolve, 2000));
      setTransitionLoading(false);
    } catch (error: any) {
      console.error('Login error:', error);
      setTransitionLoading(false);
      if (error.message?.includes('Network request failed') || error.message?.includes('Failed to fetch')) {
        throw new Error('Cannot connect to server. Make sure backend is running and API URL is correct. Check app.json for apiBaseUrl.');
      }
      throw error;
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

      // Don't store token/user if verification is required
      if (data.requiresVerification) {
        return {
          requiresVerification: true,
          email: email,
          dev_otps: data.dev_otps,
        };
      }

      // If somehow verification is not required (shouldn't happen), proceed with normal flow
      await AsyncStorage.setItem('auth_token', data.token);
      await AsyncStorage.setItem('auth_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      apiClient.setAdminToken(data.token);
      
      return {
        requiresVerification: false,
        email: email,
      };
    } catch (error: any) {
      console.error('Signup error:', error);
      if (error.message?.includes('Network request failed') || error.message?.includes('Failed to fetch')) {
        throw new Error('Cannot connect to server. Make sure backend is running and API URL is correct. Check app.json for apiBaseUrl.');
      }
      throw new Error(error.message || 'Signup failed');
    }
  };

  const sendVerificationOTP = async (email: string, type: 'email' | 'phone') => {
    try {
      const apiBaseUrl = Constants.expoConfig?.extra?.apiBaseUrl || 'http://localhost:3001';
      const response = await fetch(`${apiBaseUrl}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to send OTP');
      }

      const data = await response.json();
      return { dev_otp: data.dev_otp };
    } catch (error: any) {
      console.error('Send OTP error:', error);
      throw new Error(error.message || 'Failed to send OTP');
    }
  };

  const verifyOTP = async (email: string, otp: string, type: 'email' | 'phone') => {
    try {
      const apiBaseUrl = Constants.expoConfig?.extra?.apiBaseUrl || 'http://localhost:3001';
      const response = await fetch(`${apiBaseUrl}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, type }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Invalid OTP');
      }

      const data = await response.json();
      
      // After email verification, if email is now verified, check if we can login
      // For now, we'll just update the user data
      // User will need to login after verification
    } catch (error: any) {
      console.error('Verify OTP error:', error);
      throw new Error(error.message || 'Failed to verify OTP');
    }
  };

  const logout = async () => {
    setTransitionLoading(true);
    // Show loading animation for 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('auth_user');
    setToken(null);
    setUser(null);
    apiClient.setAdminToken(null);
    setTransitionLoading(false);
  };

  const deleteAccount = async () => {
    try {
      setTransitionLoading(true);
      const apiBaseUrl = Constants.expoConfig?.extra?.apiBaseUrl || 'http://localhost:3001';
      const currentToken = await AsyncStorage.getItem('auth_token');
      
      if (!currentToken) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${apiBaseUrl}/api/auth/delete-account`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to delete account');
      }

      // Show loading animation for 2 seconds
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Clear all local data
      await AsyncStorage.clear();
      setToken(null);
      setUser(null);
      apiClient.setAdminToken(null);
      setTransitionLoading(false);
    } catch (error: any) {
      console.error('Delete account error:', error);
      setTransitionLoading(false);
      throw new Error(error.message || 'Failed to delete account');
    }
  };

  const refreshUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('auth_user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        transitionLoading,
        login,
        signup,
        logout,
        refreshUser,
        deleteAccount,
        isAuthenticated: !!user && !!token,
        sendVerificationOTP,
        verifyOTP,
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

