/**
 * Tourline Outdoor Adventure color palette
 * Inspired by nature: forests, mountains, sunsets, and clear skies
 */
export const Colors = {
  // Primary - Forest Green (trust, nature, growth)
  primary: '#2D5A45',
  primaryLight: '#4A7A62',
  primaryDark: '#1E3D2F',
  primaryMuted: 'rgba(45, 90, 69, 0.12)',

  // Secondary - Sunset Orange (energy, adventure, warmth)
  secondary: '#E86A33',
  secondaryLight: '#FF8A5C',
  secondaryDark: '#C4501D',
  secondaryMuted: 'rgba(232, 106, 51, 0.12)',

  // Accent - Sky Blue (freedom, exploration)
  accent: '#4A90A4',
  accentLight: '#6BB3C9',
  accentDark: '#356B7C',

  // Neutral - Warm earthy tones
  background: '#FAF8F5',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  cardElevated: '#FFFCF8',

  // Text colors
  text: '#2C2417',
  textSecondary: '#6B5D4D',
  textTertiary: '#9C8D7D',
  textInverse: '#FFFFFF',
  textOnPrimary: '#FFFFFF',
  textOnSecondary: '#FFFFFF',

  // Status colors - Nature inspired
  success: '#3B8A5A',
  successLight: '#E8F5EC',
  warning: '#D4A03A',
  warningLight: '#FDF6E3',
  error: '#C75450',
  errorLight: '#FBEAEA',
  info: '#4A7FA8',
  infoLight: '#EBF4FA',

  // Border colors
  border: '#E8E2D9',
  borderLight: '#F2EDE6',
  borderFocused: '#2D5A45',

  // Special
  disabled: '#D4CCC2',
  overlay: 'rgba(44, 36, 23, 0.6)',
  shimmer: '#F5F0E8',

  // Gradients (as reference)
  gradientStart: '#2D5A45',
  gradientEnd: '#4A7A62',
  gradientSunsetStart: '#E86A33',
  gradientSunsetEnd: '#F4A460',
} as const;

export type ColorKey = keyof typeof Colors;
