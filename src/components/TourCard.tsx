import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Spacing, Typography } from '../theme';
import type { Tour } from '../types';

interface TourCardProps {
  tour: Tour;
  onPress: () => void;
  horizontal?: boolean;
}

export const TourCard: React.FC<TourCardProps> = ({ tour, onPress, horizontal = false }) => {
  const getGuideInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (horizontal) {
    return (
      <TouchableOpacity style={styles.horizontalCard} onPress={onPress} activeOpacity={0.7}>
        <View style={styles.horizontalImagePlaceholder}>
          <Text style={styles.imagePlaceholderIcon}>🏛️</Text>
          {tour.featured && (
            <View style={styles.featuredBadge}>
              <Text style={styles.featuredText}>⭐ Destacado</Text>
            </View>
          )}
        </View>
        <View style={styles.horizontalContent}>
          <Text style={styles.horizontalTitle} numberOfLines={2}>
            {tour.title}
          </Text>
          <Text style={styles.horizontalLocation}>📍 {tour.location}</Text>
          <View style={styles.horizontalMeta}>
            <Text style={styles.duration}>⏱️ {tour.duration}</Text>
          </View>
          <View style={styles.horizontalFooter}>
            <View style={styles.ratingContainer}>
              <Text style={styles.starIcon}>⭐</Text>
              <Text style={styles.rating}>{tour.rating}</Text>
              <Text style={styles.reviewCount}>({tour.reviewCount})</Text>
            </View>
            <Text style={styles.price}>{tour.price}€</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {/* Image placeholder */}
      <View style={styles.imagePlaceholder}>
        <Text style={styles.imagePlaceholderIcon}>🏛️</Text>
        {tour.featured && (
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredText}>⭐ Destacado</Text>
          </View>
        )}
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{tour.duration}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {tour.title}
        </Text>

        <Text style={styles.location}>📍 {tour.location}</Text>

        {/* Guide info */}
        <View style={styles.guideRow}>
          <View style={styles.guideAvatar}>
            <Text style={styles.guideAvatarText}>{getGuideInitials(tour.guideName)}</Text>
          </View>
          <View style={styles.guideInfo}>
            <Text style={styles.guideName}>{tour.guideName}</Text>
            <View style={styles.guideRating}>
              <Text style={styles.starIconSmall}>⭐</Text>
              <Text style={styles.guideRatingText}>{tour.guideRating}</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.cardFooter}>
          <View style={styles.ratingContainer}>
            <Text style={styles.starIcon}>⭐</Text>
            <Text style={styles.rating}>{tour.rating}</Text>
            <Text style={styles.reviewCount}>({tour.reviewCount} reseñas)</Text>
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{tour.price}€</Text>
            <Text style={styles.priceLabel}>/persona</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    width: 280,
  },
  imagePlaceholder: {
    height: 160,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  imagePlaceholderIcon: {
    fontSize: 48,
  },
  featuredBadge: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    backgroundColor: Colors.secondary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },
  featuredText: {
    ...Typography.labelSmall,
    color: Colors.textInverse,
  },
  durationBadge: {
    position: 'absolute',
    bottom: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },
  durationText: {
    ...Typography.labelSmall,
    color: Colors.textInverse,
  },
  content: {
    padding: Spacing.md,
  },
  title: {
    ...Typography.h4,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  location: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  guideRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  guideAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  guideAvatarText: {
    ...Typography.labelSmall,
    color: Colors.textInverse,
  },
  guideInfo: {
    flex: 1,
  },
  guideName: {
    ...Typography.label,
    color: Colors.text,
  },
  guideRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIconSmall: {
    fontSize: 10,
    marginRight: 2,
  },
  guideRatingText: {
    ...Typography.labelSmall,
    color: Colors.textSecondary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
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
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    ...Typography.h4,
    color: Colors.primary,
  },
  priceLabel: {
    ...Typography.labelSmall,
    color: Colors.textTertiary,
    marginLeft: 2,
  },
  // Horizontal card styles
  horizontalCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    flexDirection: 'row',
    height: 120,
  },
  horizontalImagePlaceholder: {
    width: 120,
    height: '100%',
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  horizontalContent: {
    flex: 1,
    padding: Spacing.sm,
    justifyContent: 'space-between',
  },
  horizontalTitle: {
    ...Typography.labelLarge,
    color: Colors.text,
  },
  horizontalLocation: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  horizontalMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  duration: {
    ...Typography.bodySmall,
    color: Colors.textTertiary,
  },
  horizontalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
