import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Spacing, Typography } from '../theme';
import { Avatar } from './Avatar';
import type { Guide } from '../types';

interface GuideCardProps {
  guide: Guide;
  onPress: () => void;
  compact?: boolean;
}

export const GuideCard: React.FC<GuideCardProps> = ({ guide, onPress, compact = false }) => {
  // Safe values with defaults
  const name = guide.name || 'Guía';
  const rating = guide.rating ?? 0;
  const reviewCount = guide.reviewCount ?? 0;
  const specialties = guide.specialties || [];
  const languages = guide.languages || [];
  const pricePerHour = guide.pricePerHour ?? 0;
  const currency = guide.currency || 'EUR';

  if (compact) {
    return (
      <TouchableOpacity style={styles.compactCard} onPress={onPress} activeOpacity={0.8}>
        <Avatar
          uri={guide.avatar}
          name={name}
          size="medium"
          showBadge={guide.verified}
          badgeType="verified"
        />
        <Text style={styles.compactName} numberOfLines={1}>
          {name.split(' ')[0]}
        </Text>
        <View style={styles.compactRating}>
          <Text style={styles.starIconSmall}>★</Text>
          <Text style={styles.compactRatingText}>{rating.toFixed(1)}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      {/* Featured ribbon */}
      {guide.featured && (
        <View style={styles.featuredRibbon}>
          <Text style={styles.featuredRibbonText}>⭐ Destacado</Text>
        </View>
      )}

      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Avatar
            uri={guide.avatar}
            name={name}
            size="large"
            showBadge={guide.verified}
            badgeType="verified"
          />

          <View style={styles.headerInfo}>
            <Text style={styles.name} numberOfLines={1}>
              {name}
            </Text>
            <View style={styles.locationRow}>
              <Text style={styles.locationIcon}>📍</Text>
              <Text style={styles.location} numberOfLines={1}>
                {guide.location || 'Ubicación'}
              </Text>
            </View>
            <View style={styles.ratingRow}>
              <View style={styles.ratingBadge}>
                <Text style={styles.starIcon}>★</Text>
                <Text style={styles.rating}>{rating.toFixed(1)}</Text>
              </View>
              <Text style={styles.reviewCount}>{reviewCount} reseñas</Text>
            </View>
          </View>
        </View>

        {/* Specialties */}
        {specialties.length > 0 && (
          <View style={styles.specialtiesContainer}>
            {specialties.slice(0, 3).map((specialty, index) => (
              <View key={index} style={styles.specialtyTag}>
                <Text style={styles.specialtyText}>{specialty}</Text>
              </View>
            ))}
            {specialties.length > 3 && (
              <View style={styles.moreTag}>
                <Text style={styles.moreTagText}>+{specialties.length - 3}</Text>
              </View>
            )}
          </View>
        )}

        {/* Languages */}
        {languages.length > 0 && (
          <View style={styles.languagesContainer}>
            <Text style={styles.languagesIcon}>🗣️</Text>
            <Text style={styles.languagesText} numberOfLines={1}>
              {languages.join(' • ')}
            </Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.cardFooter}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>desde</Text>
            <Text style={styles.price}>
              {currency === 'EUR' ? '€' : '$'}
              {pricePerHour}
            </Text>
            <Text style={styles.priceUnit}>/hora</Text>
          </View>
          <View style={[styles.availabilityBadge, !guide.available && styles.unavailableBadge]}>
            <View style={[styles.availabilityDot, !guide.available && styles.unavailableDot]} />
            <Text style={[styles.availabilityText, !guide.available && styles.unavailableText]}>
              {guide.available ? 'Disponible' : 'No disponible'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  cardContent: {
    padding: Spacing.md,
  },
  featuredRibbon: {
    backgroundColor: Colors.secondary,
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
  },
  featuredRibbonText: {
    ...Typography.labelSmall,
    color: Colors.textInverse,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  headerInfo: {
    flex: 1,
    justifyContent: 'center',
    marginLeft: Spacing.md,
  },
  name: {
    ...Typography.h4,
    color: Colors.text,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  locationIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  location: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    flex: 1,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warningLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 8,
  },
  starIcon: {
    fontSize: 12,
    color: Colors.warning,
    marginRight: 3,
  },
  rating: {
    ...Typography.label,
    color: Colors.text,
    fontWeight: '700',
  },
  reviewCount: {
    ...Typography.bodySmall,
    color: Colors.textTertiary,
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: Spacing.sm,
  },
  specialtyTag: {
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  specialtyText: {
    ...Typography.labelSmall,
    color: Colors.primary,
    fontWeight: '600',
  },
  moreTag: {
    backgroundColor: Colors.border,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  moreTagText: {
    ...Typography.labelSmall,
    color: Colors.textSecondary,
  },
  languagesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: Colors.background,
    borderRadius: 10,
  },
  languagesIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  languagesText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
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
  priceLabel: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginRight: 4,
  },
  price: {
    ...Typography.price,
    color: Colors.primary,
  },
  priceUnit: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginLeft: 2,
  },
  availabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.successLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  unavailableBadge: {
    backgroundColor: Colors.border,
  },
  availabilityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.success,
    marginRight: 6,
  },
  unavailableDot: {
    backgroundColor: Colors.textTertiary,
  },
  availabilityText: {
    ...Typography.labelSmall,
    color: Colors.success,
    fontWeight: '600',
  },
  unavailableText: {
    color: Colors.textTertiary,
  },

  // Compact styles
  compactCard: {
    alignItems: 'center',
    width: 85,
  },
  compactName: {
    ...Typography.label,
    color: Colors.text,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  compactRating: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warningLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  starIconSmall: {
    fontSize: 10,
    color: Colors.warning,
    marginRight: 2,
  },
  compactRatingText: {
    ...Typography.labelSmall,
    color: Colors.text,
    fontWeight: '600',
  },
});
