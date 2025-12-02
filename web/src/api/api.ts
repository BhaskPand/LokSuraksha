import { ApiClient } from '@citizen-safety/shared';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
const ADMIN_TOKEN = import.meta.env.VITE_ADMIN_TOKEN;

export const apiClient = new ApiClient(API_BASE_URL, ADMIN_TOKEN);

// Helper to set admin token from localStorage or env
export function setAdminToken(token: string) {
  apiClient.setAdminToken(token);
  localStorage.setItem('admin_token', token);
}

export function getAdminToken(): string | null {
  return localStorage.getItem('admin_token') || ADMIN_TOKEN || null;
}

// Initialize admin token if available
const storedToken = getAdminToken();
if (storedToken) {
  apiClient.setAdminToken(storedToken);
}

