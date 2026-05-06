import axios, { AxiosInstance, AxiosError } from 'axios';
import { AuthenticationResponse, ErrorResponse } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para adicionar token em requisições
    this.client.interceptors.request.use((config) => {
      const token = this.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Interceptor para tratar erros de autenticação
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          this.clearToken();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Token Management
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }

  private setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  private clearToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  // Auth Endpoints
  async login(email: string, password: string): Promise<AuthenticationResponse> {
    const response = await this.client.post<AuthenticationResponse>('/auth/login', {
      email,
      password,
    });
    this.setToken(response.data.token);
    return response.data;
  }

  logout(): void {
    this.clearToken();
  }

  // Customers Endpoints
  async getCustomers(page: number = 0, size: number = 10) {
    return this.client.get(`/customers?page=${page}&size=${size}`);
  }

  async getCustomerById(id: number) {
    return this.client.get(`/customers/${id}`);
  }

  async searchCustomers(name: string, page: number = 0, size: number = 10) {
    return this.client.get(`/customers/search?name=${name}&page=${page}&size=${size}`);
  }

  async createCustomer(data: any) {
    return this.client.post('/customers', data);
  }

  async updateCustomer(id: number, data: any) {
    return this.client.put(`/customers/${id}`, data);
  }

  async deleteCustomer(id: number) {
    return this.client.delete(`/customers/${id}`);
  }

  // Generic GET
  async get<T>(url: string): Promise<T> {
    const response = await this.client.get<T>(url);
    return response.data;
  }

  // Generic POST
  async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.post<T>(url, data);
    return response.data;
  }

  // Generic PUT
  async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.put<T>(url, data);
    return response.data;
  }

  // Generic DELETE
  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete<T>(url);
    return response.data;
  }
}

export const apiClient = new ApiClient();
