import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { CreateIssueRequest, Issue, IssueListResponse, UpdateIssueRequest } from './types';

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

  async getIssues(params?: {
    limit?: number;
    category?: string;
    since?: string;
  }): Promise<IssueListResponse> {
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
}

