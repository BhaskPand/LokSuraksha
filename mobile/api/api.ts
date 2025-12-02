import { ApiClient } from '@citizen-safety/shared';
import Constants from 'expo-constants';

const API_BASE_URL =
  Constants.expoConfig?.extra?.apiBaseUrl || process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3001';

export const apiClient = new ApiClient(API_BASE_URL);

