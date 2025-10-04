/* eslint-env node */

const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Add Node.js polyfills for React Native
config.resolver.alias = {
  ...config.resolver.alias,
  crypto: 'react-native-get-random-values',
  stream: 'readable-stream',
  buffer: '@craftzdog/react-native-buffer',
  url: 'react-native-url-polyfill',
  events: 'events',
  util: 'util',
  assert: 'assert',
  path: 'path-browserify',
  querystring: 'querystring-es3',
  vm: 'vm-browserify',
  constants: 'constants-browserify',
  process: 'process',
  _stream_duplex: 'readable-stream/duplex',
  _stream_passthrough: 'readable-stream/passthrough',
  _stream_readable: 'readable-stream/readable',
  _stream_writable: 'readable-stream/writable',
  _stream_transform: 'readable-stream/transform',
};

// Handle specific packages that need special treatment
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Add Node.js modules to resolver
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

const resolveRequestWithPackageExports = (context, moduleName, platform) => {
  try {
    // // Handle eventsource package specifically
    // if (moduleName === 'eventsource') {
    //   // Return a mock eventsource for React Native
    //   return {
    //     type: 'sourceFile',
    //     filePath: require.resolve('./src/lib/mocks/eventsource-mock.js'),
    //   };
    // }

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
