const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Ensure React Native condition is resolved for Firebase
config.resolver.unstable_conditionNames = [
  'react-native',
  'browser',
  'require',
  'import',
];

// Point ts-interface-checker to a lightweight shim to avoid Hermes instanceof crashes
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  'ts-interface-checker': path.resolve(
    __dirname,
    'node_modules/ts-interface-checker'
  ),
};

module.exports = config;
