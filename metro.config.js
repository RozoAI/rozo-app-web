/* eslint-env node */

const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

const resolveRequestWithPackageExports = (context, moduleName, platform) => {
  try {
    // Use the browser version of the package for React Native
    if (moduleName.startsWith('@dynamic-labs/')) {
      return context.resolveRequest(
        {
          ...context,
          unstable_conditionNames: ['browser'],
        },
        moduleName,
        platform
      );
    }

    // Package exports in `isows` (a `viem`) dependency are incompatible, so they need to be disabled
    if (moduleName === 'isows') {
      const ctx = {
        ...context,
        unstable_enablePackageExports: false,
      };
      return ctx.resolveRequest(ctx, moduleName, platform);
    }

    // Package exports in `zustand@4` are incompatible, so they need to be disabled
    if (moduleName.startsWith('zustand')) {
      const ctx = {
        ...context,
        unstable_enablePackageExports: false,
      };
      return ctx.resolveRequest(ctx, moduleName, platform);
    }

    // Package exports in `jose` are incompatible, so the browser version is used
    if (moduleName === 'jose') {
      const ctx = {
        ...context,
        unstable_conditionNames: ['browser'],
      };
      return ctx.resolveRequest(ctx, moduleName, platform);
    }

    // The following block is only needed if you are
    // running React Native 0.78 *or older*.
    if (moduleName.startsWith('@privy-io/')) {
      const ctx = {
        ...context,
        unstable_enablePackageExports: true,
        unstable_conditionNames: ['browser'],
      };
      return ctx.resolveRequest(ctx, moduleName, platform);
    }

    // Fall back to normal resolution
    return context.resolveRequest(context, moduleName, platform);
  } catch (error) {
    // Try resolving .ts files when .js files are not found
    if (moduleName.endsWith('.js')) {
      const tsModuleName = moduleName.replace(/\.js$/, '.ts');
      return context.resolveRequest(context, tsModuleName, platform);
    }
    throw error;
  }
};

config.resolver.resolveRequest = resolveRequestWithPackageExports;

module.exports = withNativeWind(config, { input: './src/styles/global.css' });
