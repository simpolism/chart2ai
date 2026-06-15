import * as Font from 'expo-font';
import { getPlatformInfo } from './platform';

export const loadFonts = async () => {
  if (getPlatformInfo().isWeb) {
    // On web, fonts are loaded via CSS
    return;
  }

  try {
    await Font.loadAsync({
      Orbitron: require('../../assets/fonts/Orbitron-Regular.ttf'),
    });
  } catch (error) {
    console.warn(
      'Failed to load custom fonts, falling back to system fonts:',
      error
    );
  }
};

export const getFontFamily = (
  weight: 'regular' | 'medium' | 'semibold' | 'bold' = 'regular'
) => {
  if (getPlatformInfo().isWeb) {
    return 'Orbitron, monospace';
  }

  // Use single Orbitron font with weight variations
  return 'Orbitron';
};
