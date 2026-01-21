import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography } from '../theme';

interface MinimalHeaderProps {
  title?: string;
  onBack?: () => void;
  showBack?: boolean;
  rightElement?: React.ReactNode;
  transparent?: boolean;
  light?: boolean;
}

export const MinimalHeader: React.FC<MinimalHeaderProps> = ({
  title,
  onBack,
  showBack = true,
  rightElement,
  transparent = false,
  light = false,
}) => {
  const insets = useSafeAreaInsets();
  const iconColor = light ? Colors.textInverse : Colors.text;
  const titleColor = light ? Colors.textInverse : Colors.text;

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top },
        transparent && styles.transparent,
      ]}
    >
      <View style={styles.content}>
        {/* Left - Back button */}
        <View style={styles.leftSection}>
          {showBack && onBack && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={onBack}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name="chevron-back" size={24} color={iconColor} />
            </TouchableOpacity>
          )}
        </View>

        {/* Center - Title */}
        <View style={styles.centerSection}>
          {title && (
            <Text style={[styles.title, { color: titleColor }]} numberOfLines={1}>
              {title}
            </Text>
          )}
        </View>

        {/* Right - Custom element */}
        <View style={styles.rightSection}>
          {rightElement}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    borderBottomWidth: 0,
  },
  transparent: {
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    paddingHorizontal: Spacing.sm,
  },
  leftSection: {
    width: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightSection: {
    width: 44,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.3,
    color: Colors.text,
  },
});

export default MinimalHeader;

