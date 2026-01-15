import React from 'react';
import { Text, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Colors, Spacing, Typography } from '../theme';
import type { Category } from '../types';

interface CategoryPillProps {
  category: Category;
  selected?: boolean;
  onPress: () => void;
}

export const CategoryPill: React.FC<CategoryPillProps> = ({
  category,
  selected = false,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.pill,
        selected && styles.pillSelected,
      ]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={[styles.iconContainer, selected && styles.iconContainerSelected]}>
        <Text style={styles.icon}>{category.icon}</Text>
      </View>
      <Text style={[styles.label, selected && styles.labelSelected]}>{category.name}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: Spacing.md,
    paddingLeft: 6,
    paddingVertical: 6,
    borderRadius: 24,
    backgroundColor: Colors.card,
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginRight: Spacing.sm,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  pillSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    shadowColor: Colors.primaryDark,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.xs,
  },
  iconContainerSelected: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  icon: {
    fontSize: 16,
  },
  label: {
    ...Typography.label,
    color: Colors.text,
    fontWeight: '600',
  },
  labelSelected: {
    color: Colors.textInverse,
  },
});
