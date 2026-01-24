import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '../theme';
import { useNetwork } from '../contexts/NetworkContext';

interface OfflineBannerProps {
  // Optional custom message
  message?: string;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({ 
  message = 'Sin conexión a internet' 
}) => {
  const { isOffline, checkConnection } = useNetwork();
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isOffline) {
      // Slide in
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();

      // Start pulse animation
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.7,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();

      return () => pulse.stop();
    } else {
      // Slide out
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isOffline, slideAnim, pulseAnim]);

  if (!isOffline) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          paddingTop: insets.top + Spacing.xs,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Animated.View style={[styles.iconContainer, { opacity: pulseAnim }]}>
        <Text style={styles.icon}>📡</Text>
      </Animated.View>
      
      <View style={styles.textContainer}>
        <Text style={styles.message}>{message}</Text>
        <Text style={styles.subMessage}>Algunas funciones pueden no estar disponibles</Text>
      </View>

      <TouchableOpacity style={styles.retryButton} onPress={checkConnection}>
        <Text style={styles.retryText}>Reintentar</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.warning,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    zIndex: 1000,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  iconContainer: {
    marginRight: Spacing.sm,
  },
  icon: {
    fontSize: 20,
  },
  textContainer: {
    flex: 1,
  },
  message: {
    ...Typography.labelSmall,
    color: Colors.text,
    fontWeight: '600',
  },
  subMessage: {
    ...Typography.caption,
    color: Colors.text,
    opacity: 0.8,
  },
  retryButton: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 8,
  },
  retryText: {
    ...Typography.labelSmall,
    color: Colors.text,
    fontWeight: '600',
  },
});
