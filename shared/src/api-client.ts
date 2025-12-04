import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { CreateIssueRequest, Issue, IssueListResponse, UpdateIssueRequest, Statistics, IssueFilters } from './types';

export class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string, adminToken?: string) {
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        ...(adminToken && { Authorization: `Bearer ${adminToken}` }),
      },
    });
  }

  setAdminToken(token: string | null) {
    if (token) {
      this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.client.defaults.headers.common['Authorization'];
    }
  }

  async ping(): Promise<{ ok: boolean }> {
    const response = await this.client.get('/api/ping');
    return response.data;
  }

  async getIssues(params?: IssueFilters & { limit?: number; offset?: number }): Promise<IssueListResponse> {
    const response = await this.client.get('/api/issues', { params });
    return response.data;
  }

  async getIssue(id: number): Promise<Issue> {
    const response = await this.client.get(`/api/issues/${id}`);
    return response.data;
  }

  async createIssue(data: CreateIssueRequest): Promise<Issue> {
    const response = await this.client.post('/api/issues', data);
    return response.data;
  }

  async updateIssue(id: number, data: UpdateIssueRequest): Promise<Issue> {
    const response = await this.client.patch(`/api/issues/${id}`, data);
    return response.data;
  }

  async exportIssues(): Promise<Blob> {
    const response = await this.client.get('/api/issues/export.csv', {
      responseType: 'blob',
    });
    return response.data;
  }

  async getIssueImage(id: number, index: number): Promise<string> {
    const response = await this.client.get(`/api/issues/${id}/image/${index}`, {
      responseType: 'text',
    });
    return response.data;
  }

  async getStatistics(): Promise<Statistics> {
    const response = await this.client.get('/api/issues/statistics');
    return response.data;
  }

  // Auth methods
  async signup(data: {
    email: string;
    password: string;
    name: string;
    phone?: string;
  }): Promise<{ user: any; requiresVerification: boolean; dev_otps?: { email_otp?: string; phone_otp?: string } }> {
    const response = await this.client.post('/api/auth/signup', data);
    return response.data;
  }

  async login(email: string, password: string): Promise<{ user: any; token: string }> {
    const response = await this.client.post('/api/auth/login', { email, password });
    return response.data;
  }

  async sendVerificationOTP(email: string, type: 'email' | 'phone'): Promise<{ message: string; dev_otp?: string }> {
    const response = await this.client.post('/api/auth/send-otp', { email, type });
    return response.data;
  }

  async verifyOTP(email: string, otp: string, type: 'email' | 'phone'): Promise<{ message: string; user: any }> {
    const response = await this.client.post('/api/auth/verify-otp', { email, otp, type });
    return response.data;
  }
}

