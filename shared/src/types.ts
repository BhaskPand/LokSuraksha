export type IssueStatus = 'open' | 'in_progress' | 'resolved';

export interface Issue {
  id: number;
  user_id?: number;
  title: string;
  description: string;
  category: string;
  location_lat: number;
  location_lng: number;
  images: string[]; // base64 data URLs or file paths
  contact_name?: string;
  contact_phone?: string;
  status: IssueStatus;
  created_at: string; // ISO datetime string
  notes?: string;
}

export interface CreateIssueRequest {
  title: string;
  description: string;
  category: string;
  location_lat: number;
  location_lng: number;
  images?: string[]; // base64 data URLs
  contact_name?: string;
  contact_phone?: string;
}

export interface UpdateIssueRequest {
  status?: IssueStatus;
  notes?: string;
  // User-editable fields
  title?: string;
  description?: string;
  category?: string;
  images?: string[];
  contact_name?: string;
  contact_phone?: string;
}

export interface IssueListResponse {
  issues: Issue[];
  total: number;
  limit?: number;
  offset?: number;
}

export interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
  email_verified: boolean;
  phone_verified: boolean;
}

export interface ApiError {
  error: string;
  message?: string;
  requiresVerification?: boolean;
  email_verified?: boolean;
  phone_verified?: boolean;
}

export interface Statistics {
  total: {
    value: number;
    previous: number;
    trend: number; // percentage change
  };
  open: {
    value: number;
    previous: number;
    trend: number;
  };
  inProgress: {
    value: number;
    previous: number;
    trend: number;
  };
  resolved: {
    value: number;
    previous: number;
    trend: number;
  };
  today: {
    value: number;
    previous: number;
    trend: number;
  };
  thisWeek: {
    value: number;
    previous: number;
    trend: number;
  };
  thisMonth: {
    value: number;
    previous: number;
    trend: number;
  };
  averageResolutionTime: {
    value: number; // in hours
    previous: number;
    trend: number;
  };
  resolutionRate: {
    value: number; // percentage
    previous: number;
    trend: number;
  };
  byCategory: Record<string, number>;
  byStatus: Record<string, number>;
  recentActivity: {
    last24Hours: number;
    last7Days: number;
    last30Days: number;
  };
}



