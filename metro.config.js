const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add resolver configuration for PouchDB
config.resolver.alias = {
  ...config.resolver.alias,
  'pouchdb-promise': 'pouchdb-promise/lib/index.js',
};

// Add platform extensions
config.resolver.platforms = ['native', 'android', 'ios', 'web'];

// Configure transformer to handle PouchDB modules
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

module.exports = config; 