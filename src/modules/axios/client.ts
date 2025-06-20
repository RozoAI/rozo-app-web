import axios from 'axios';
import axiosRetry from 'axios-retry';

import { storage } from '@/lib';

export const DYNAMIC_TOKEN_KEY = 'dynamic_authentication_token';

export const client = axios.create({
  timeout: 20 * 1000,
  baseURL: process.env.EXPO_PUBLIC_API_URL,
});

axiosRetry(client, { retries: 1 }); // Only retry once before failing

// Add a request interceptor to dynamically add the token to headers
client.interceptors.request.use(
  async (config) => {
    const token = await storage.getString(DYNAMIC_TOKEN_KEY);
    console.log({ token });
    if (token) {
      // The token from dynamic is already a string, no need to replace quotes
      config.headers.Authorization = `Bearer ${token.replace(/^"|"$/g, '')}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

client.interceptors.response.use(
  (response) => response,
  (error) => {
    throw new Error(error.response?.data?.error ?? 'Something went wrong');
  }
);
