/**
 * Type declarations for tailwind-variants/dist/config
 */

declare module 'tailwind-variants/dist/config' {
  export interface TVConfig<T = any, U = any> {
    responsiveVariants?:
      | boolean
      | ('sm' | 'md' | 'lg' | 'xl' | '2xl')[]
      | {
          [key: string]: boolean | ('sm' | 'md' | 'lg' | 'xl' | '2xl')[] | undefined;
          [key: number]: boolean | ('sm' | 'md' | 'lg' | 'xl' | '2xl')[] | undefined;
          [key: symbol]: boolean | ('sm' | 'md' | 'lg' | 'xl' | '2xl')[] | undefined;
        }
      | undefined;
    slots?: string[];
    extend?: Record<string, unknown>;
    [key: string]: any;
  }
}
