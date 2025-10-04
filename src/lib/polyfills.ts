/**
 * Polyfills for React Native to support Node.js modules
 * This file should be imported at the very beginning of the app
 */

// Import polyfills in the correct order
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';

// Set up global polyfills
import { Buffer } from '@craftzdog/react-native-buffer';
import { TextDecoder, TextEncoder } from 'fast-text-encoding';

// Make Buffer available globally
if (typeof global.Buffer === 'undefined') {
  (global as any).Buffer = Buffer;
}

// Make TextEncoder and TextDecoder available globally
if (typeof global.TextEncoder === 'undefined') {
  (global as any).TextEncoder = TextEncoder;
}

if (typeof global.TextDecoder === 'undefined') {
  (global as any).TextDecoder = TextDecoder;
}

// Polyfill for process.env
if (typeof global.process === 'undefined') {
  (global as any).process = require('process');
}

// Polyfill for global
if (typeof global.global === 'undefined') {
  (global as any).global = global;
}

export {};
