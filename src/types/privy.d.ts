// types/privy.d.ts
// declare module '@privy-io/react-auth' {
//   export interface PrivyUser {
//     id: string;
//     email?: string;
//     phone?: string;
//     wallet?: { address: string };
//   }

//   export interface PrivyState {
//     user: PrivyUser | null;
//     authenticated: boolean;
//     ready: boolean;
//   }

//   export function usePrivy(): PrivyState;
//   export function useLogin(): { login: () => void };
//   export function useLogout(): { logout: () => void };
//   export const PrivyProvider: React.ComponentType<{
//     appId: string;
//     clientId?: string;
//     config?: any;
//     children: React.ReactNode;
//   }>;
// }

// declare module '@privy-io/expo' {
//   export interface PrivyUser {
//     id: string;
//     email?: string;
//     phone?: string;
//     wallet?: { address: string };
//   }

//   export interface PrivyState {
//     user: PrivyUser | null;
//     authenticated: boolean;
//     ready: boolean;
//   }

//   export function usePrivy(): PrivyState;
//   export function useLogin(): { login: () => void };
//   export function useLogout(): { logout: () => void };
//   export const PrivyProvider: React.ComponentType<{
//     appId: string;
//     clientId: string;
//     config?: any;
//     supportedChains?: any[];
//     children: React.ReactNode;
//   }>;
// }