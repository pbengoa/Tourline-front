import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Typography } from '../theme';
import { Avatar } from './Avatar';
import type { Tour } from '../types';

interface TourCardProps {
  tour: Tour;
  onPress: () => void;
  horizontal?: boolean;
}

export const TourCard: React.FC<TourCardProps> = ({ tour, onPress, horizontal = false }) => {
  // Safe values with defaults
  const title = tour.title || 'Tour';
  const location = tour.location || '';
  const duration = tour.duration || '';
  const rating = tour.rating ?? 0;
  const reviewCount = tour.reviewCount ?? 0;
  const price = tour.price ?? 0;
  const currency = tour.currency || 'EUR';
  const guideName = tour.guideName || 'Guía';
  const guideRating = tour.guideRating ?? 0;

  const formatPrice = (amount: number, curr: string) => {
    const symbol = curr === 'EUR' ? '€' : '$';
    return `${symbol}${amount}`;
  };

  if (horizontal) {
    return (
      <TouchableOpacity style={styles.horizontalCard} onPress={onPress} activeOpacity={0.9}>
        <View style={styles.horizontalImageContainer}>
          {tour.image ? (
            <Image source={{ uri: tour.image }} style={styles.horizontalImage} resizeMode="cover" />
          ) : (
            <View style={styles.horizontalImagePlaceholder}>
              <Text style={styles.imagePlaceholderIcon}>🏛️</Text>
            </View>
          )}
          {tour.featured && (
            <View style={styles.featuredBadgeHorizontal}>
              <Text style={styles.featuredTextSmall}>⭐</Text>
            </View>
          )}
        </View>
        <View style={styles.horizontalContent}>
          <Text style={styles.horizontalTitle} numberOfLines={2}>
            {title}
          </Text>
          <View style={styles.horizontalLocationRow}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.horizontalLocation}>{location}</Text>
          </View>
          <View style={styles.horizontalMeta}>
            <Text style={styles.durationText}>⏱️ {duration}</Text>
          </View>
          <View style={styles.horizontalFooter}>
            <View style={styles.ratingContainer}>
              <Text style={styles.starIcon}>★</Text>
              <Text style={styles.rating}>{rating.toFixed(1)}</Text>
            </View>
            <Text style={styles.horizontalPrice}>{formatPrice(price, currency)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      {/* Image section */}
      <View style={styles.imageContainer}>
        {tour.image ? (
          <Image source={{ uri: tour.image }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <View style={styles.placeholderContent}>
              <View style={styles.mountainIcon} />
              <View style={styles.sunIcon} />
            </View>
          </View>
        )}

        {/* Gradient overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
          style={styles.imageGradient}
        />

        {/* Featured badge */}
        {tour.featured && (
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredText}>⭐ Destacado</Text>
          </View>
        )}

        {/* Duration badge */}
        <View style={styles.durationBadge}>
          <Text style={styles.durationBadgeText}>⏱️ {duration}</Text>
        </View>

        {/* Price overlay */}
        <View style={styles.priceOverlay}>
          <Text style={styles.priceOverlayText}>{formatPrice(price, currency)}</Text>
          <Text style={styles.pricePerPerson}>/persona</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>

        <View style={styles.locationRow}>
          <Text style={styles.locationIcon}>📍</Text>
          <Text style={styles.location}>{location}</Text>
        </View>

        {/* Guide info */}
        <View style={styles.guideRow}>
          <Avatar uri={tour.guideAvatar} name={guideName} size="small" />
          <View style={styles.guideInfo}>
            <Text style={styles.guideName} numberOfLines={1}>
              {guideName}
            </Text>
            <View style={styles.guideRating}>
              <Text style={styles.starIconSmall}>★</Text>
              <Text style={styles.guideRatingText}>{guideRating.toFixed(1)}</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.cardFooter}>
          <View style={styles.ratingContainer}>
            <View style={styles.ratingBadge}>
              <Text style={styles.starIcon}>★</Text>
              <Text style={styles.rating}>{rating.toFixed(1)}</Text>
            </View>
            <Text style={styles.reviewCount}>{reviewCount} reseñas</Text>
          </View>
          <View style={styles.participantsInfo}>
            <Text style={styles.participantsIcon}>👥</Text>
            <Text style={styles.participantsText}>máx {tour.maxParticipants}</Text>
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
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    width: 300,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  imageContainer: {
    height: 180,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderContent: {
    width: 80,
    height: 60,
    position: 'relative',
  },
  mountainIcon: {
    position: 'absolute',
    bottom: 0,
    left: '50%',
    marginLeft: -30,
    width: 0,
    height: 0,
    borderLeftWidth: 30,
    borderRightWidth: 30,
    borderBottomWidth: 40,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: Colors.primary + '40',
  },
  sunIcon: {
    position: 'absolute',
    top: 5,
    right: 10,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.secondary + '50',
  },
  imagePlaceholderIcon: {
    fontSize: 48,
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  featuredBadge: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    backgroundColor: Colors.secondary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderRadius: 8,
  },
  featuredText: {
    ...Typography.labelSmall,
    color: Colors.textInverse,
    fontWeight: '700',
  },
  durationBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  durationBadgeText: {
    ...Typography.labelSmall,
    color: Colors.textInverse,
  },
  priceOverlay: {
    position: 'absolute',
    bottom: Spacing.sm,
    right: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceOverlayText: {
    ...Typography.h3,
    color: Colors.textInverse,
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  pricePerPerson: {
    ...Typography.caption,
    color: Colors.textInverse,
    marginLeft: 2,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  content: {
    padding: Spacing.md,
  },
  title: {
    ...Typography.h4,
    color: Colors.text,
    marginBottom: 6,
    lineHeight: 24,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  locationIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  location: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  guideRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    backgroundColor: Colors.background,
    borderRadius: 12,
  },
  guideInfo: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  guideName: {
    ...Typography.label,
    color: Colors.text,
    marginBottom: 2,
  },
  guideRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIconSmall: {
    fontSize: 10,
    color: Colors.warning,
    marginRight: 3,
  },
  guideRatingText: {
    ...Typography.labelSmall,
    color: Colors.textSecondary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  ratingContainer: {
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
    fontSize: 11,
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
  participantsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantsIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  participantsText: {
    ...Typography.labelSmall,
    color: Colors.textSecondary,
  },

  // Horizontal card styles
  horizontalCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    flexDirection: 'row',
    height: 130,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  horizontalImageContainer: {
    width: 130,
    height: '100%',
    position: 'relative',
  },
  horizontalImage: {
    width: '100%',
    height: '100%',
  },
  horizontalImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredBadgeHorizontal: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: Colors.secondary,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredTextSmall: {
    fontSize: 12,
  },
  horizontalContent: {
    flex: 1,
    padding: Spacing.sm,
    justifyContent: 'space-between',
  },
  horizontalTitle: {
    ...Typography.labelLarge,
    color: Colors.text,
    fontWeight: '600',
    lineHeight: 20,
  },
  horizontalLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  horizontalLocation: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  horizontalMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationText: {
    ...Typography.labelSmall,
    color: Colors.textTertiary,
  },
  horizontalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  horizontalPrice: {
    ...Typography.h4,
    color: Colors.primary,
    fontWeight: '700',
  },
});
