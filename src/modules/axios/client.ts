import axios from 'axios';

export const client = axios.create({
  timeout: 20 * 1000,
  baseURL: process.env.EXPO_PUBLIC_API_URL,
});

client.interceptors.request.use((config) => {
  const suffix = process.env.EXPO_PUBLIC_DYNAMIC_ENVIRONMENT_ID ?? '';
  const token = localStorage.getItem(`dynamic_authentication_token_${suffix}`);

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
