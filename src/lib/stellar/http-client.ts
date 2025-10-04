/**
 * Custom HTTP client for Stellar SDK in React Native
 * This replaces the problematic EventSource-based client
 */

import axios from 'axios';

export class StellarHttpClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    try {
      const response = await axios.get(`${this.baseURL}${endpoint}`, {
        params,
        timeout: 30000,
      });
      return response.data;
    } catch (error) {
      throw new Error(`Stellar API request failed: ${error}`);
    }
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    try {
      const response = await axios.post(`${this.baseURL}${endpoint}`, data, {
        timeout: 30000,
      });
      return response.data;
    } catch (error) {
      throw new Error(`Stellar API request failed: ${error}`);
    }
  }
}
