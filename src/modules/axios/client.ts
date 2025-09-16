import axios from 'axios';
import axiosRetry from 'axios-retry';

import { storage } from '@/lib';
import { AppError } from '@/lib/error';
// eslint-disable-next-line import/no-cycle
import { TOKEN_KEY } from '@/providers/app.provider';

export const client = axios.create({
  timeout: 20 * 1000,
  baseURL: process.env.EXPO_PUBLIC_API_URL,
});

axiosRetry(client, { retries: 1 });

client.interceptors.request.use(async (config) => {
  const token = storage.getString(TOKEN_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token.replace(/^"|"$/g, '')}`;
  }
  config.headers['Content-Type'] = 'application/json';

  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data?.error || error.message || 'Something went wrong';
    const errorData = error.response?.data;

    throw new AppError(errorMessage, statusCode, errorData);
  }
);
