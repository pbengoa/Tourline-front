import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Svg, { Path, Circle, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Colors } from '../theme';

interface LogoProps {
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  variant?: 'full' | 'icon' | 'text';
  color?: 'primary' | 'white' | 'dark';
  style?: ViewStyle;
}

const SIZES = {
  small: { icon: 32, fontSize: 18, height: 32 },
  medium: { icon: 48, fontSize: 24, height: 48 },
  large: { icon: 64, fontSize: 32, height: 64 },
  xlarge: { icon: 96, fontSize: 48, height: 96 },
};

/**
 * Tourline Logo Component
 * 
 * Design Concept:
 * - A stylized location pin that forms a "T" shape
 * - The pin's point suggests a path/journey
 * - Mountain silhouette integrated into the design
 * - Modern, clean, and works at all sizes
 */
export const Logo: React.FC<LogoProps> = ({
  size = 'medium',
  variant = 'full',
  color = 'primary',
  style,
}) => {
  const dimensions = SIZES[size];
  
  const colors = {
    primary: {
      main: Colors.primary,
      accent: Colors.secondary,
      text: Colors.primary,
    },
    white: {
      main: '#FFFFFF',
      accent: '#FFFFFF',
      text: '#FFFFFF',
    },
    dark: {
      main: Colors.text,
      accent: Colors.secondary,
      text: Colors.text,
    },
  };

  const palette = colors[color];

  // Logo Icon SVG
  const LogoIcon = () => (
    <Svg
      width={dimensions.icon}
      height={dimensions.icon}
      viewBox="0 0 100 100"
    >
      <Defs>
        <LinearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={palette.main} />
          <Stop offset="100%" stopColor={Colors.primaryLight} />
        </LinearGradient>
      </Defs>
      
      {/* Main Pin/Marker Shape - Forms a "T" */}
      <G>
        {/* Outer pin shape */}
        <Path
          d="M50 5
             C30 5 15 20 15 40
             C15 55 30 70 50 95
             C70 70 85 55 85 40
             C85 20 70 5 50 5Z"
          fill="url(#gradient)"
        />
        
        {/* Inner circle (creates the location marker look) */}
        <Circle
          cx="50"
          cy="38"
          r="18"
          fill={color === 'white' ? 'rgba(255,255,255,0.2)' : Colors.background}
        />
        
        {/* Mountain peak inside the circle */}
        <Path
          d="M35 48 L50 30 L57 40 L65 32 L65 48 Z"
          fill={palette.main}
          opacity={0.9}
        />
        
        {/* Accent line (the "journey line") */}
        <Path
          d="M50 58 L50 75"
          stroke={palette.accent}
          strokeWidth="4"
          strokeLinecap="round"
        />
      </G>
    </Svg>
  );

  // Text Logo
  const LogoText = () => (
    <Text style={[styles.logoText, { fontSize: dimensions.fontSize, color: palette.text }]}>
      Tour<Text style={[styles.logoTextAccent, { color: palette.accent }]}>line</Text>
    </Text>
  );

  if (variant === 'icon') {
    return (
      <View style={[styles.container, style]}>
        <LogoIcon />
      </View>
    );
  }

  if (variant === 'text') {
    return (
      <View style={[styles.container, style]}>
        <LogoText />
      </View>
    );
  }

  // Full logo (icon + text)
  return (
    <View style={[styles.container, styles.fullLogo, style]}>
      <LogoIcon />
      <LogoText />
    </View>
  );
};

// Simplified icon version for app icon generation
export const LogoIconSimple: React.FC<{ size?: number; color?: string }> = ({
  size = 100,
  color = Colors.primary,
}) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    {/* Pin shape */}
    <Path
      d="M50 5
         C30 5 15 20 15 40
         C15 55 30 70 50 95
         C70 70 85 55 85 40
         C85 20 70 5 50 5Z"
      fill={color}
    />
    
    {/* Inner circle */}
    <Circle cx="50" cy="38" r="18" fill="#FFFFFF" />
    
    {/* Mountain */}
    <Path d="M35 48 L50 30 L57 40 L65 32 L65 48 Z" fill={color} />
    
    {/* Journey line */}
    <Path
      d="M50 58 L50 75"
      stroke={Colors.secondary}
      strokeWidth="4"
      strokeLinecap="round"
    />
  </Svg>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullLogo: {
    flexDirection: 'row',
    gap: 8,
  },
  logoText: {
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  logoTextAccent: {
    fontWeight: '600',
  },
});

export default Logo;

