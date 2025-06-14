import axios from 'axios';

import { storage } from '@/lib';
// eslint-disable-next-line import/no-cycle
import { TOKEN_KEY } from '@/providers/app.provider';

export const client = axios.create({
  timeout: 20 * 1000,
  baseURL: process.env.EXPO_PUBLIC_API_URL,
});

client.interceptors.request.use(async (config) => {
  const token = storage.getString(TOKEN_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token.replace(/^"|"$/g, '')}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    throw new Error(error.response?.data?.error ?? 'Something went wrong');
  }
);
