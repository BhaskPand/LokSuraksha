export type IssueStatus = 'open' | 'in_progress' | 'resolved';

export interface Issue {
  id: number;
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
}

export interface IssueListResponse {
  issues: Issue[];
  total: number;
  limit?: number;
  offset?: number;
}

export interface ApiError {
  error: string;
  message?: string;
}

