import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors, Typography } from '../theme';

interface AvatarProps {
  uri?: string | null;
  name: string;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  showBadge?: boolean;
  badgeType?: 'verified' | 'online' | 'featured';
}

const SIZES = {
  small: 40,
  medium: 56,
  large: 72,
  xlarge: 100,
};

const BADGE_SIZES = {
  small: 14,
  medium: 18,
  large: 22,
  xlarge: 28,
};

const FONT_SIZES = {
  small: 14,
  medium: 18,
  large: 24,
  xlarge: 32,
};

// Generate consistent color based on name
const getColorFromName = (name: string): string => {
  const colors = [
    Colors.primary,
    Colors.secondary,
    Colors.accent,
    '#7B68A6',
    '#5C946E',
    '#D4A03A',
    '#C75450',
  ];
  const charCode = name.charCodeAt(0) + (name.charCodeAt(1) || 0);
  return colors[charCode % colors.length];
};

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const Avatar: React.FC<AvatarProps> = ({
  uri,
  name,
  size = 'medium',
  showBadge = false,
  badgeType = 'verified',
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const dimension = SIZES[size];
  const badgeSize = BADGE_SIZES[size];
  const fontSize = FONT_SIZES[size];
  const backgroundColor = getColorFromName(name);

  const showImage = uri && !error;

  const getBadgeStyle = () => {
    switch (badgeType) {
      case 'verified':
        return { backgroundColor: Colors.success, content: '✓' };
      case 'online':
        return { backgroundColor: Colors.success, content: '' };
      case 'featured':
        return { backgroundColor: Colors.secondary, content: '★' };
      default:
        return { backgroundColor: Colors.success, content: '✓' };
    }
  };

  const badge = getBadgeStyle();

  return (
    <View style={[styles.container, { width: dimension, height: dimension }]}>
      {showImage ? (
        <View style={[styles.imageContainer, { borderRadius: dimension / 2 }]}>
          <Image
            source={{ uri }}
            style={[
              styles.image,
              {
                width: dimension,
                height: dimension,
                borderRadius: dimension / 2,
              },
            ]}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
            onError={() => {
              setError(true);
              setLoading(false);
            }}
          />
          {loading && (
            <View style={[styles.loadingOverlay, { borderRadius: dimension / 2 }]}>
              <ActivityIndicator size="small" color={Colors.primary} />
            </View>
          )}
        </View>
      ) : (
        <View
          style={[
            styles.fallback,
            {
              width: dimension,
              height: dimension,
              borderRadius: dimension / 2,
              backgroundColor,
            },
          ]}
        >
          <Text style={[styles.initials, { fontSize }]}>{getInitials(name)}</Text>
        </View>
      )}

      {showBadge && (
        <View
          style={[
            styles.badge,
            {
              width: badgeSize,
              height: badgeSize,
              borderRadius: badgeSize / 2,
              backgroundColor: badge.backgroundColor,
              borderWidth: size === 'small' ? 1.5 : 2,
            },
          ]}
        >
          {badge.content && (
            <Text style={[styles.badgeText, { fontSize: badgeSize * 0.5 }]}>
              {badge.content}
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  imageContainer: {
    overflow: 'hidden',
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    backgroundColor: Colors.shimmer,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.shimmer,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallback: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  initials: {
    color: Colors.textInverse,
    fontWeight: '700',
  },
  badge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: Colors.textInverse,
    fontWeight: '800',
  },
});

