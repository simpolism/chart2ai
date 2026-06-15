export interface ThemeColors {
  // Background hierarchy
  background: string;
  surface: string;
  surfaceVariant: string;
  surfaceContainer: string;

  // Text hierarchy
  onBackground: string;
  onSurface: string;
  onSurfaceVariant: string;

  // Semantic colors
  primary: string;
  secondary: string;
  accent: string;
  error: string;
  success: string;
  warning: string;

  // Interactive states
  interactive: string;
  interactiveHover: string;
  disabled: string;

  // Borders and outlines
  border: string;
  borderFocus: string;
  outline: string;

  // Special colors
  event: string;

  // Shadow color
  shadow: string;
}

export interface ThemeEffects {
  // Visual effects
  glow?: string;
  shadow?: string;

  // Border styles
  borderRadius: number;
  borderWidth: number;

  // Typography effects
  letterSpacing?: number;
  textTransform?: 'none' | 'uppercase' | 'lowercase';
}

export interface AppTheme {
  name: string;
  colors: ThemeColors;
  effects: ThemeEffects;
  fonts: any; // Keep existing RN Paper font structure
}

export type ButtonVariant = 'primary' | 'secondary' | 'outlined';
export type TextVariant = 'title' | 'body' | 'caption';
