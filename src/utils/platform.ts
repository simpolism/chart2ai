import { Platform, Dimensions } from 'react-native';
import { useState, useEffect, useMemo } from 'react';

/**
 * Centralized platform detection utility for Chart2AI
 * Provides consistent platform and device type detection across the app
 */

export interface PlatformInfo {
  // Basic platform detection
  isWeb: boolean;
  isNative: boolean;
  isIOS: boolean;
  isAndroid: boolean;

  // Screen size detection
  isDesktop: boolean;
  isMobileWeb: boolean;
  isMobile: boolean; // true for mobile web OR native

  // Mobile platform detection (works on web and native)
  isIOSDevice: boolean; // true for iOS native OR iOS mobile web
  isAndroidDevice: boolean; // true for Android native OR Android mobile web

  // Browser detection (web only)
  isWebKit: boolean;
  isChrome: boolean;
  isSafari: boolean;

  // Screen dimensions
  screenWidth: number;
  screenHeight: number;
}

/**
 * Gets current screen width, accounting for platform differences
 */
function getScreenWidth(dimensions?: {
  width: number;
  height: number;
}): number {
  if (dimensions) {
    return dimensions.width;
  }
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return window.innerWidth;
  }
  return Dimensions.get('window').width;
}

/**
 * Gets current screen height, accounting for platform differences
 */
function getScreenHeight(dimensions?: {
  width: number;
  height: number;
}): number {
  if (dimensions) {
    return dimensions.height;
  }
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return window.innerHeight;
  }
  return Dimensions.get('window').height;
}

/**
 * Detects mobile device type on web platform using user agent
 */
function getMobileDeviceInfo() {
  if (Platform.OS !== 'web' || typeof navigator === 'undefined') {
    return { isIOSDevice: false, isAndroidDevice: false };
  }

  const userAgent = navigator.userAgent.toLowerCase();
  const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
  const isAndroidDevice = /android/.test(userAgent);

  return { isIOSDevice, isAndroidDevice };
}

/**
 * Detects browser type on web platform
 */
function getBrowserInfo() {
  if (Platform.OS !== 'web' || typeof navigator === 'undefined') {
    return { isWebKit: false, isChrome: false, isSafari: false };
  }

  const userAgent = navigator.userAgent.toLowerCase();
  const isWebKit = userAgent.includes('webkit');
  const isChrome = userAgent.includes('chrome') && !userAgent.includes('edge');
  const isSafari =
    userAgent.includes('safari') && !userAgent.includes('chrome');

  return { isWebKit, isChrome, isSafari };
}

/**
 * Creates platform info object with all detection flags
 */
function createPlatformInfo(dimensions?: {
  width: number;
  height: number;
}): PlatformInfo {
  const screenWidth = getScreenWidth(dimensions);
  const screenHeight = getScreenHeight(dimensions);
  const isDesktop = screenWidth >= 768;

  const isWeb = Platform.OS === 'web';
  const isIOS = Platform.OS === 'ios';
  const isAndroid = Platform.OS === 'android';
  const isNative = isIOS || isAndroid;

  const isMobileWeb = isWeb && !isDesktop;
  const isMobile = isMobileWeb || isNative;

  const browserInfo = getBrowserInfo();
  const mobileDeviceInfo = getMobileDeviceInfo();

  // Combine native platform detection with web user agent detection
  const isIOSDevice = isIOS || mobileDeviceInfo.isIOSDevice;
  const isAndroidDevice = isAndroid || mobileDeviceInfo.isAndroidDevice;

  return {
    // Basic platform detection
    isWeb,
    isNative,
    isIOS,
    isAndroid,

    // Screen size detection
    isDesktop,
    isMobileWeb,
    isMobile,

    // Mobile platform detection (works on web and native)
    isIOSDevice,
    isAndroidDevice,

    // Browser detection
    ...browserInfo,

    // Screen dimensions
    screenWidth,
    screenHeight,
  };
}

/**
 * Main platform detection function with responsive screen size updates
 * Use this throughout the app for consistent platform detection
 */
export function usePlatformInfo(): PlatformInfo {
  const [dimensions, setDimensions] = useState(() => Dimensions.get('window'));

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });

    return () => subscription?.remove();
  }, []);

  return useMemo(() => createPlatformInfo(dimensions), [dimensions]);
}

/**
 * Static platform detection for use outside of React components
 */
export function getPlatformInfo(): PlatformInfo {
  return createPlatformInfo();
}

/**
 * Convenience functions for common platform checks
 */
export const Platform_UTILS = {
  isDesktop: () => getPlatformInfo().isDesktop,
  isMobileWeb: () => getPlatformInfo().isMobileWeb,
  isNative: () => getPlatformInfo().isNative,
  isWeb: () => getPlatformInfo().isWeb,
  isWebKit: () => getPlatformInfo().isWebKit,
  getScreenWidth: () => getScreenWidth(),
} as const;
