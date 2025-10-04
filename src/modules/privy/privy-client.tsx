// /* eslint-disable @typescript-eslint/no-require-imports */
// import { type PrivyProviderProps as PrivyProviderPropsExpo } from '@privy-io/expo';
// import {
//   type PrivyEvents,
//   type PrivyInterface,
//   type PrivyProviderProps as PrivyProviderPropsWeb,
//   type useLogin as useLoginPrivy,
//   type useLogout as useLogoutPrivy,
//   type User,
//   type UseWalletsInterface,
// } from '@privy-io/react-auth';
// import { Platform } from 'react-native';

// const isWeb = Platform.OS === 'web';
// const authModule = isWeb ? require('@privy-io/react-auth') : require('@privy-io/expo');

// export const useWalletsChain = isWeb ? authModule.useWallets : authModule.useEmbeddedEthereumWallet;
// export const useExtendedChain = isWeb
//   ? require('@privy-io/react-auth/extended-chains').useCreateWallet
//   : require('@privy-io/expo/extended-chains').useCreateWallet;
// export const useCreateWalletChain = isWeb ? authModule.useCreateWallet : authModule.useEmbeddedEthereumWallet;

// export const usePrivy: () => PrivyInterface = authModule.usePrivy;

// // User Management
// export const useUser: () => {
//   user: User | null;
//   refreshUser: () => Promise<User>;
// } = authModule.useUser;
// export const useLogin: (callbacks?: PrivyEvents['login']) => ReturnType<typeof useLoginPrivy> = authModule.useLogin;
// export const useLogout: () => ReturnType<typeof useLogoutPrivy> = authModule.useLogout;

// // Wallets Management
// export const useWallets: () => UseWalletsInterface = useWalletsChain;
// export const useCreateWallet: () => any = useCreateWalletChain;
// export const useExtendedChainWallet: () => any = useExtendedChain;
// export const useSignMessage: () => any = authModule.useSignMessage;
// export const useSignTransaction: () => any = authModule.useSignTransaction;
// export const useSendTransaction: () => any = authModule.useSendTransaction;

// // Providers
// export function PrivyProvider(props: PrivyProviderPropsWeb): React.JSX.Element;
// export function PrivyProvider(props: PrivyProviderPropsExpo): React.JSX.Element;
// export function PrivyProvider(props: PrivyProviderPropsWeb | PrivyProviderPropsExpo) {
//   const Comp = authModule.PrivyProvider;
//   return <Comp {...props} />;
// }

// export { isWeb };

// export const useAuth = () => {
//   const privy = usePrivy();
//   const { login } = useLogin();
//   const { logout } = useLogout();
//   const wallets = useWallets();

//   return {
//     user: privy.user,
//     authenticated: privy.authenticated,
//     ready: privy.ready,
//     login,
//     logout,
//     privy,
//     isWeb,
//     wallets,
//   } as const;
// };
