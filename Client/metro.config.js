const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Enable Metro to handle CSS files for nativewind global.css import
config.resolver.sourceExts = [...config.resolver.sourceExts, 'css'];

module.exports = withNativeWind(config, { input: "./global.css" });
