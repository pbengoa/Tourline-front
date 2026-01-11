import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Spacing, Typography } from '../theme';
import type { Guide } from '../types';

interface GuideCardProps {
  guide: Guide;
  onPress: () => void;
  compact?: boolean;
}

export const GuideCard: React.FC<GuideCardProps> = ({ guide, onPress, compact = false }) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (compact) {
    return (
      <TouchableOpacity style={styles.compactCard} onPress={onPress} activeOpacity={0.7}>
        <View style={styles.compactAvatar}>
          <Text style={styles.compactAvatarText}>{getInitials(guide.name)}</Text>
          {guide.verified && (
            <View style={styles.verifiedBadgeSmall}>
              <Text style={styles.verifiedIcon}>✓</Text>
            </View>
          )}
        </View>
        <Text style={styles.compactName} numberOfLines={1}>
          {guide.name}
        </Text>
        <View style={styles.compactRating}>
          <Text style={styles.starIcon}>⭐</Text>
          <Text style={styles.compactRatingText}>{guide.rating}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardHeader}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(guide.name)}</Text>
          </View>
          {guide.verified && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedIcon}>✓</Text>
            </View>
          )}
        </View>
        <View style={styles.headerInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {guide.name}
            </Text>
            {guide.featured && (
              <View style={styles.featuredBadge}>
                <Text style={styles.featuredText}>Destacado</Text>
              </View>
            )}
          </View>
          <Text style={styles.location}>📍 {guide.location}</Text>
          <View style={styles.ratingRow}>
            <Text style={styles.starIcon}>⭐</Text>
            <Text style={styles.rating}>{guide.rating}</Text>
            <Text style={styles.reviewCount}>({guide.reviewCount} reseñas)</Text>
          </View>
        </View>
      </View>

      <View style={styles.specialtiesContainer}>
        {guide.specialties.slice(0, 3).map((specialty, index) => (
          <View key={index} style={styles.specialtyTag}>
            <Text style={styles.specialtyText}>{specialty}</Text>
          </View>
        ))}
      </View>

      <View style={styles.languagesContainer}>
        <Text style={styles.languagesLabel}>Idiomas: </Text>
        <Text style={styles.languagesText}>{guide.languages.join(', ')}</Text>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>
            {guide.pricePerHour}€
          </Text>
          <Text style={styles.priceUnit}>/hora</Text>
        </View>
        <View style={[styles.availabilityBadge, !guide.available && styles.unavailableBadge]}>
          <Text style={[styles.availabilityText, !guide.available && styles.unavailableText]}>
            {guide.available ? 'Disponible' : 'No disponible'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: Spacing.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    ...Typography.h4,
    color: Colors.textInverse,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.card,
  },
  verifiedIcon: {
    color: Colors.textInverse,
    fontSize: 10,
    fontWeight: '700',
  },
  headerInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  name: {
    ...Typography.h4,
    color: Colors.text,
    flex: 1,
  },
  featuredBadge: {
    backgroundColor: Colors.secondary + '20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: Spacing.sm,
  },
  featuredText: {
    ...Typography.labelSmall,
    color: Colors.secondary,
  },
  location: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    fontSize: 12,
    marginRight: 2,
  },
  rating: {
    ...Typography.labelLarge,
    color: Colors.text,
    marginRight: 4,
  },
  reviewCount: {
    ...Typography.bodySmall,
    color: Colors.textTertiary,
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  specialtyTag: {
    backgroundColor: Colors.primary + '10',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },
  specialtyText: {
    ...Typography.labelSmall,
    color: Colors.primary,
  },
  languagesContainer: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  languagesLabel: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  languagesText: {
    ...Typography.bodySmall,
    color: Colors.text,
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    ...Typography.h3,
    color: Colors.text,
  },
  priceUnit: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginLeft: 2,
  },
  availabilityBadge: {
    backgroundColor: Colors.success + '15',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },
  unavailableBadge: {
    backgroundColor: Colors.textTertiary + '15',
  },
  availabilityText: {
    ...Typography.labelSmall,
    color: Colors.success,
  },
  unavailableText: {
    color: Colors.textTertiary,
  },
  // Compact styles
  compactCard: {
    alignItems: 'center',
    width: 80,
  },
  compactAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
    position: 'relative',
  },
  compactAvatarText: {
    ...Typography.labelLarge,
    color: Colors.textInverse,
  },
  verifiedBadgeSmall: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.background,
  },
  compactName: {
    ...Typography.labelSmall,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 2,
  },
  compactRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactRatingText: {
    ...Typography.labelSmall,
    color: Colors.textSecondary,
  },
});

