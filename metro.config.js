const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// EAS build validator warns on this undocumented option from Expo's default config
delete config.watcher.unstable_workerThreads;

module.exports = config;
