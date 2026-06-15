import { MD3LightTheme } from 'react-native-paper';
import { getPlatformInfo } from '../utils/platform';
import { AppTheme } from './types';

export const currentTheme: AppTheme = {
  name: 'Celestial Cosmic',
  colors: {
    // Background hierarchy - Deep space gradient
    background: '#1a0d2e',
    surface: 'rgba(45, 27, 61, 0.85)',
    surfaceVariant: 'rgba(61, 42, 77, 0.4)',
    surfaceContainer: 'rgba(45, 27, 61, 0.95)',

    // Text hierarchy
    onBackground: '#F8F8FF',
    onSurface: '#F8F8FF',
    onSurfaceVariant: '#D3D3D3',

    // Semantic colors - Celestial palette
    primary: '#FFB347',
    secondary: '#C0C0C0',
    accent: '#8A2BE2',
    error: '#ff5252',
    success: '#4caf50',
    warning: '#ff9800',

    // Interactive states
    interactive: '#FFB347',
    interactiveHover: '#FFC870',
    disabled: '#666',

    // Borders and outlines
    border: 'rgba(255, 179, 71, 0.3)',
    borderFocus: '#FFB347',
    outline: 'rgba(255, 179, 71, 0.3)',

    // Special colors
    event: '#FFD700',

    // Shadow color
    shadow: '#FFB347',
  },
  effects: {
    borderRadius: 8,
    borderWidth: 1,
    glow: 'rgba(255, 179, 71, 0.6)',
    shadow: '#FFB347',
  },
  fonts: {
    ...MD3LightTheme.fonts,
    displayLarge: {
      ...MD3LightTheme.fonts.displayLarge,
      fontFamily: getPlatformInfo().isWeb ? 'Orbitron, monospace' : 'System',
      fontWeight: '700',
    },
    titleLarge: {
      ...MD3LightTheme.fonts.titleLarge,
      fontFamily: getPlatformInfo().isWeb ? 'Orbitron, monospace' : 'System',
      fontWeight: '600',
    },
    headlineMedium: {
      ...MD3LightTheme.fonts.headlineMedium,
      fontFamily: getPlatformInfo().isWeb ? 'Orbitron, monospace' : 'System',
      fontWeight: '600',
    },
  },
};
