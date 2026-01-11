/**
 * Tourline color palette
 */
export const Colors = {
  // Primary colors
  primary: '#0066FF',
  primaryLight: '#4D94FF',
  primaryDark: '#0047B3',

  // Secondary colors
  secondary: '#FF6B35',
  secondaryLight: '#FF9166',
  secondaryDark: '#CC4F1A',

  // Neutral colors
  background: '#FAFBFC',
  surface: '#FFFFFF',
  card: '#FFFFFF',

  // Text colors
  text: '#1A1D21',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textInverse: '#FFFFFF',

  // Status colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Border colors
  border: '#E5E7EB',
  borderFocused: '#0066FF',

  // Others
  disabled: '#D1D5DB',
  overlay: 'rgba(0, 0, 0, 0.5)',
} as const;

export type ColorKey = keyof typeof Colors;
