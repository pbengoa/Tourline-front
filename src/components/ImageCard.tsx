import React, { useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  ActivityIndicator,
  ImageStyle,
  ViewStyle,
} from 'react-native';
import { Colors } from '../theme';

interface ImageCardProps {
  uri?: string | null;
  fallbackUri?: string;
  style?: ImageStyle;
  containerStyle?: ViewStyle;
  borderRadius?: number;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
}

export const ImageCard: React.FC<ImageCardProps> = ({
  uri,
  fallbackUri,
  style,
  containerStyle,
  borderRadius = 16,
  resizeMode = 'cover',
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const imageUri = error && fallbackUri ? fallbackUri : uri;

  if (!imageUri) {
    return (
      <View style={[styles.placeholder, { borderRadius }, containerStyle, style]}>
        <View style={styles.placeholderContent}>
          <View style={styles.placeholderIcon}>
            <View style={styles.mountain1} />
            <View style={styles.mountain2} />
            <View style={styles.sun} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { borderRadius }, containerStyle]}>
      <Image
        source={{ uri: imageUri }}
        style={[styles.image, { borderRadius }, style]}
        resizeMode={resizeMode}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={() => {
          setError(true);
          setLoading(false);
        }}
      />
      {loading && (
        <View style={[styles.loadingOverlay, { borderRadius }]}>
          <ActivityIndicator size="small" color={Colors.primary} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: Colors.shimmer,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.shimmer,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    backgroundColor: Colors.primaryMuted,
    overflow: 'hidden',
  },
  placeholderContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    width: 60,
    height: 40,
    position: 'relative',
  },
  mountain1: {
    position: 'absolute',
    bottom: 0,
    left: 5,
    width: 0,
    height: 0,
    borderLeftWidth: 20,
    borderRightWidth: 20,
    borderBottomWidth: 25,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: Colors.primary + '40',
  },
  mountain2: {
    position: 'absolute',
    bottom: 0,
    right: 5,
    width: 0,
    height: 0,
    borderLeftWidth: 15,
    borderRightWidth: 15,
    borderBottomWidth: 20,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: Colors.primary + '30',
  },
  sun: {
    position: 'absolute',
    top: 5,
    right: 10,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.secondary + '50',
  },
});

