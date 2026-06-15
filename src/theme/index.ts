import { MD3LightTheme } from 'react-native-paper';
import { currentTheme } from './currentTheme';

// Convert our app theme to React Native Paper format
export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: currentTheme.colors.primary,
    primaryContainer: 'rgba(255, 179, 71, 0.1)',
    secondary: currentTheme.colors.secondary,
    background: currentTheme.colors.background,
    surface: currentTheme.colors.surface,
    surfaceVariant: currentTheme.colors.surfaceVariant,
    onPrimary: '#1a0d2e',
    onSecondary: currentTheme.colors.onSurface,
    onBackground: currentTheme.colors.onBackground,
    onSurface: currentTheme.colors.onSurface,
    onSurfaceVariant: currentTheme.colors.onSurfaceVariant,
    outline: currentTheme.colors.outline,
    error: currentTheme.colors.error,
    onError: '#000000',
    // Menu and dropdown styling
    elevation: {
      level0: currentTheme.colors.surfaceContainer,
      level1: currentTheme.colors.surfaceContainer,
      level2: currentTheme.colors.surfaceContainer,
      level3: currentTheme.colors.surfaceContainer,
      level4: currentTheme.colors.surfaceContainer,
      level5: currentTheme.colors.surfaceContainer,
    },
  },
  fonts: currentTheme.fonts,
};

// Export theme utilities
export * from './useTheme';
export * from './types';
export { currentTheme };
