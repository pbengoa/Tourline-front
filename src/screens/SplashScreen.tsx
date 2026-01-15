import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { Colors } from '../theme';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const mountainsY = useRef(new Animated.Value(50)).current;
  const mountainsOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      // Mountains rise up
      Animated.parallel([
        Animated.timing(mountainsOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(mountainsY, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      // Logo appears
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      // Text appears
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      // Subtitle appears
      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      // Wait
      Animated.delay(600),
    ]).start(() => {
      onFinish();
    });
  }, [logoScale, logoOpacity, textOpacity, subtitleOpacity, mountainsY, mountainsOpacity, onFinish]);

  return (
    <View style={styles.container}>
      {/* Background gradient layers */}
      <View style={styles.skyGradient} />
      <View style={styles.sunsetGlow} />

      {/* Stars */}
      <View style={[styles.star, { top: 80, left: 40 }]} />
      <View style={[styles.star, { top: 120, right: 60 }]} />
      <View style={[styles.star, { top: 60, right: 100 }]} />
      <View style={[styles.starSmall, { top: 140, left: 80 }]} />
      <View style={[styles.starSmall, { top: 100, right: 140 }]} />

      {/* Mountains silhouette */}
      <Animated.View
        style={[
          styles.mountainsContainer,
          {
            opacity: mountainsOpacity,
            transform: [{ translateY: mountainsY }],
          },
        ]}
      >
        {/* Back mountains */}
        <View style={[styles.mountain, styles.mountainBack1]} />
        <View style={[styles.mountain, styles.mountainBack2]} />
        {/* Front mountains */}
        <View style={[styles.mountain, styles.mountainFront1]} />
        <View style={[styles.mountain, styles.mountainFront2]} />
        <View style={[styles.mountain, styles.mountainFront3]} />
      </Animated.View>

      {/* Trees silhouette */}
      <View style={styles.treesContainer}>
        <View style={[styles.tree, { left: 20, height: 40 }]} />
        <View style={[styles.tree, { left: 50, height: 55 }]} />
        <View style={[styles.tree, { left: 75, height: 35 }]} />
        <View style={[styles.tree, { right: 30, height: 50 }]} />
        <View style={[styles.tree, { right: 60, height: 38 }]} />
        <View style={[styles.tree, { right: 90, height: 45 }]} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Logo */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <View style={styles.logoInner}>
            <Text style={styles.logoIcon}>⛰️</Text>
          </View>
          <View style={styles.compassRing} />
        </Animated.View>

        {/* App name */}
        <Animated.View style={{ opacity: textOpacity }}>
          <Text style={styles.appName}>TOURLINE</Text>
          <View style={styles.nameDivider} />
        </Animated.View>

        {/* Tagline */}
        <Animated.Text style={[styles.tagline, { opacity: subtitleOpacity }]}>
          Explora • Descubre • Aventura
        </Animated.Text>
      </View>

      {/* Footer */}
      <Animated.View style={[styles.footer, { opacity: subtitleOpacity }]}>
        <Text style={styles.footerText}>Tu próxima aventura te espera</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  skyGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.primaryDark,
  },
  sunsetGlow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.4,
    backgroundColor: Colors.secondary,
    opacity: 0.15,
  },
  star: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  starSmall: {
    position: 'absolute',
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  mountainsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.35,
  },
  mountain: {
    position: 'absolute',
    bottom: 0,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
  },
  mountainBack1: {
    left: -50,
    borderLeftWidth: width * 0.5,
    borderRightWidth: width * 0.5,
    borderBottomWidth: height * 0.28,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'rgba(30, 61, 47, 0.6)',
  },
  mountainBack2: {
    right: -100,
    borderLeftWidth: width * 0.6,
    borderRightWidth: width * 0.6,
    borderBottomWidth: height * 0.25,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'rgba(30, 61, 47, 0.5)',
  },
  mountainFront1: {
    left: width * 0.1,
    borderLeftWidth: width * 0.35,
    borderRightWidth: width * 0.35,
    borderBottomWidth: height * 0.22,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'rgba(45, 90, 69, 0.8)',
  },
  mountainFront2: {
    left: -width * 0.2,
    borderLeftWidth: width * 0.45,
    borderRightWidth: width * 0.45,
    borderBottomWidth: height * 0.18,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: Colors.primaryDark,
  },
  mountainFront3: {
    right: -width * 0.3,
    borderLeftWidth: width * 0.5,
    borderRightWidth: width * 0.5,
    borderBottomWidth: height * 0.2,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: Colors.primaryDark,
  },
  treesContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  tree: {
    position: 'absolute',
    bottom: 0,
    width: 12,
    backgroundColor: 'rgba(30, 61, 47, 0.9)',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 60,
  },
  logoContainer: {
    width: 130,
    height: 130,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
  },
  logoInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  compassRing: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderStyle: 'dashed',
  },
  logoIcon: {
    fontSize: 50,
  },
  appName: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 6,
    textAlign: 'center',
  },
  nameDivider: {
    width: 60,
    height: 3,
    backgroundColor: Colors.secondary,
    marginTop: 12,
    alignSelf: 'center',
    borderRadius: 2,
  },
  tagline: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 2,
    marginTop: 16,
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    letterSpacing: 0.5,
  },
});
