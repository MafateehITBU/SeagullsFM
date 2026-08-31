// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Ensure font files are included (case-sensitive extensions)
const assetExts = config.resolver.assetExts;
if (!assetExts.includes('OTF')) assetExts.push('OTF');
if (!assetExts.includes('TTF')) assetExts.push('TTF');
if (!assetExts.includes('otf')) assetExts.push('otf');
if (!assetExts.includes('ttf')) assetExts.push('ttf');

module.exports = config;
