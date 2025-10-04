export const TOKEN_KEY = '_auth_token';
export const MERCHANT_KEY = '_merchant_profile';

export const authMode: 'privy' | 'dynamic' | string = process.env.EXPO_PUBLIC_AUTH_MODE === 'dynamic' ? 'dynamic' : 'privy';
