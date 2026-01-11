import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
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
        selected && { backgroundColor: category.color },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.icon}>{category.icon}</Text>
      <Text style={[styles.label, selected && styles.labelSelected]}>{category.name}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: Spacing.sm,
  },
  pillSelected: {
    borderColor: 'transparent',
  },
  icon: {
    fontSize: 16,
    marginRight: Spacing.xs,
  },
  label: {
    ...Typography.label,
    color: Colors.text,
  },
  labelSelected: {
    color: Colors.textInverse,
    fontWeight: '600',
  },
});
