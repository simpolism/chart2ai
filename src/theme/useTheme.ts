import { useTheme as usePaperTheme } from 'react-native-paper';
import { getPlatformInfo } from '../utils/platform';
import { AppTheme, ButtonVariant, TextVariant } from './types';
import { currentTheme } from './currentTheme';
import { getFontFamily } from '../utils/fonts';

export const useAppTheme = () => {
  const paperTheme = usePaperTheme();
  const appTheme: AppTheme = currentTheme; // Later this will come from context

  return {
    ...paperTheme,
    app: appTheme,

    // Card styles with celestial enhancement
    getCardStyle: () => ({
      backgroundColor: appTheme.colors.surface,
      borderRadius: appTheme.effects.borderRadius,
      borderWidth: 1,
      borderColor: appTheme.colors.border,
      shadowColor: appTheme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
      ...(getPlatformInfo().isWeb && {
        boxShadow: `0 0 20px ${appTheme.effects.glow}, inset 0 0 20px rgba(255, 179, 71, 0.1)`,
      }),
    }),

    // Button styles with subtle glow
    getButtonStyle: (variant: ButtonVariant) => {
      const baseStyle = {
        borderRadius: appTheme.effects.borderRadius,
      };

      switch (variant) {
        case 'primary':
          return {
            ...baseStyle,
            backgroundColor: appTheme.colors.primary,
            shadowColor: appTheme.colors.primary,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.4,
            shadowRadius: 4,
            elevation: 6,
            ...(getPlatformInfo().isWeb && {
              boxShadow: `0 0 15px ${appTheme.effects.glow}`,
            }),
          };
        case 'secondary':
          return {
            ...baseStyle,
            backgroundColor: appTheme.colors.secondary,
          };
        case 'outlined':
          return {
            ...baseStyle,
            borderColor: appTheme.colors.border,
            borderWidth: appTheme.effects.borderWidth,
          };
        default:
          return baseStyle;
      }
    },

    // Text styles with Orbitron for headers
    getTextStyle: (variant: TextVariant) => {
      const baseStyle = {
        color: appTheme.colors.onSurface,
      };

      switch (variant) {
        case 'title':
          return {
            ...baseStyle,
            color: appTheme.colors.primary,
            fontSize: 18,
            fontWeight: '600' as const,
            fontFamily: getFontFamily('semibold'),
            textShadow: getPlatformInfo().isWeb
              ? `0 0 10px ${appTheme.effects.glow}`
              : undefined,
          };
        case 'body':
          return {
            ...baseStyle,
            fontSize: 16,
          };
        case 'caption':
          return {
            ...baseStyle,
            fontSize: 14,
            color: appTheme.colors.onSurfaceVariant,
          };
        default:
          return baseStyle;
      }
    },

    // Enhanced input styles
    getInputStyle: () => ({
      backgroundColor: getPlatformInfo().isWeb
        ? 'rgba(61, 42, 77, 0.5)'
        : appTheme.colors.surface,
    }),

    // Icon button styles
    getIconButtonStyle: () => ({
      margin: 0,
      marginTop: 8,
    }),

    // Date/Time button styles
    getDateTimeButtonStyle: (disabled = false) => ({
      marginBottom: 8,
      borderColor: appTheme.colors.border,
      ...(disabled && {
        opacity: 0.5,
        borderColor: appTheme.colors.disabled,
      }),
    }),

    // Switch styles
    getSwitchProps: () => ({
      color: appTheme.colors.primary,
    }),

    // Dialog styles
    getDialogStyle: () => ({
      backgroundColor: appTheme.colors.surfaceContainer,
      borderWidth: appTheme.effects.borderWidth,
      borderColor: appTheme.colors.border,
      borderRadius: appTheme.effects.borderRadius,
      ...(getPlatformInfo().isWeb && {
        maxWidth: 600,
        alignSelf: 'center' as const,
        width: '90%',
      }),
    }),

    // Helper to get icon color for visibility
    getIconColor: (
      context: 'primary' | 'secondary' | 'error' | 'default' = 'default'
    ) => {
      switch (context) {
        case 'primary':
          return appTheme.colors.primary;
        case 'secondary':
          return appTheme.colors.secondary;
        case 'error':
          return appTheme.colors.error;
        default:
          return appTheme.colors.onSurface; // This ensures visibility
      }
    },

    // Header text style with Orbitron
    getHeaderStyle: (size: 'large' | 'medium' | 'small' = 'medium') => {
      const sizes = {
        large: 24,
        medium: 20,
        small: 18,
      };

      return {
        color: appTheme.colors.primary,
        fontSize: sizes[size],
        fontWeight: '600' as const,
        fontFamily: getFontFamily('semibold'),
        ...(getPlatformInfo().isWeb && {
          textShadow: `0 0 10px ${appTheme.effects.glow}`,
        }),
      };
    },
  };
};
