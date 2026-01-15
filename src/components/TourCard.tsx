import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Typography } from '../theme';
import type { Tour } from '../types';
import { FavoriteButton } from './FavoriteButton';
import { FavoriteTour } from '../hooks/useFavorites';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.78;

interface TourCardProps {
  tour: Tour;
  onPress: () => void;
  horizontal?: boolean;
  compact?: boolean;
  showFavorite?: boolean;
}

export const TourCard: React.FC<TourCardProps> = ({
  tour,
  onPress,
  horizontal = false,
  compact = false,
  showFavorite = true,
}) => {
  // Safe values with defaults
  const title = tour.title || 'Tour';
  const location = tour.location || '';
  const duration = tour.duration || '';
  const rating = tour.rating ?? 0;
  const reviewCount = tour.reviewCount ?? 0;
  const price = tour.price ?? 0;
  const currency = tour.currency || 'CLP';
  // Support both old (guideName) and new (companyName) fields
  const companyName = tour.companyName || tour.guideName || 'Operador';
  const companyLogo = tour.companyLogo || tour.guideAvatar;
  const companyRating = tour.companyRating ?? tour.guideRating ?? 0;
  const maxParticipants = tour.maxParticipants ?? 10;

  // Transform tour to FavoriteTour format for the button
  const favoriteTour: FavoriteTour = {
    id: tour.id,
    title: tour.title,
    image: tour.image,
    price: tour.price,
    currency: tour.currency,
    rating: tour.rating,
    reviewCount: tour.reviewCount,
    duration: tour.duration,
    location: tour.location,
    companyName: companyName,
    addedAt: new Date().toISOString(),
  };

  // Format price for CLP
  const formatPrice = (amount: number, curr: string) => {
    if (curr === 'CLP') {
      return `$${amount.toLocaleString('es-CL')}`;
    }
    const symbol = curr === 'EUR' ? '€' : '$';
    return `${symbol}${amount}`;
  };

  // Horizontal variant (for search results)
  if (horizontal) {
    return (
      <TouchableOpacity style={styles.horizontalCard} onPress={onPress} activeOpacity={0.95}>
        <View style={styles.horizontalImageContainer}>
          {tour.image ? (
            <Image source={{ uri: tour.image }} style={styles.horizontalImage} resizeMode="cover" />
          ) : (
            <View style={styles.horizontalImagePlaceholder}>
              <Text style={styles.imagePlaceholderIcon}>🏔️</Text>
            </View>
          )}
          {tour.featured && (
            <View style={styles.featuredBadgeHorizontal}>
              <Text style={styles.featuredTextSmall}>⭐</Text>
            </View>
          )}
          {showFavorite && (
            <View style={styles.horizontalFavoriteBtn}>
              <FavoriteButton tour={favoriteTour} size="small" variant="filled" />
            </View>
          )}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.4)']}
            style={styles.horizontalImageGradient}
          />
        </View>
        <View style={styles.horizontalContent}>
          <View style={styles.horizontalHeader}>
            <Text style={styles.horizontalTitle} numberOfLines={2}>
              {title}
            </Text>
            <View style={styles.horizontalRating}>
              <Text style={styles.starIcon}>★</Text>
              <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
            </View>
          </View>
          <View style={styles.horizontalLocationRow}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.horizontalLocation} numberOfLines={1}>
              {location}
            </Text>
          </View>
          <View style={styles.horizontalMeta}>
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>⏱️</Text>
              <Text style={styles.metaText}>{duration}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>👥</Text>
              <Text style={styles.metaText}>máx {maxParticipants}</Text>
            </View>
          </View>
          <View style={styles.horizontalFooter}>
            <View style={styles.companyMiniBadge}>
              <Text style={styles.companyMiniBadgeText}>por {companyName.split(' ')[0]}</Text>
            </View>
            <Text style={styles.horizontalPrice}>{formatPrice(price, currency)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // Compact variant (small cards for lists)
  if (compact) {
    return (
      <TouchableOpacity style={styles.compactCard} onPress={onPress} activeOpacity={0.95}>
        <View style={styles.compactImageContainer}>
          {tour.image ? (
            <Image source={{ uri: tour.image }} style={styles.compactImage} resizeMode="cover" />
          ) : (
            <View style={styles.compactImagePlaceholder}>
              <Text style={styles.compactPlaceholderIcon}>🏔️</Text>
            </View>
          )}
          {tour.featured && (
            <View style={styles.compactFeaturedBadge}>
              <Text style={styles.compactFeaturedText}>⭐</Text>
            </View>
          )}
          {showFavorite && (
            <View style={styles.compactFavoriteBtn}>
              <FavoriteButton tour={favoriteTour} size="small" variant="filled" />
            </View>
          )}
        </View>
        <Text style={styles.compactTitle} numberOfLines={2}>
          {title}
        </Text>
        <View style={styles.compactMeta}>
          <Text style={styles.compactLocation} numberOfLines={1}>
            📍 {location}
          </Text>
          <View style={styles.compactRating}>
            <Text style={styles.compactStar}>★</Text>
            <Text style={styles.compactRatingText}>{rating.toFixed(1)}</Text>
          </View>
        </View>
        <Text style={styles.compactPrice}>{formatPrice(price, currency)}</Text>
      </TouchableOpacity>
    );
  }

  // Default variant - Featured Card (main style)
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.97}>
      {/* Image section */}
      <View style={styles.imageContainer}>
        {tour.image ? (
          <Image source={{ uri: tour.image }} style={styles.image} resizeMode="cover" />
        ) : (
          <LinearGradient
            colors={[Colors.primaryLight, Colors.primary]}
            style={styles.imagePlaceholder}
          >
            <View style={styles.placeholderContent}>
              <View style={styles.mountainShape}>
                <View style={styles.mountainPeak1} />
                <View style={styles.mountainPeak2} />
              </View>
              <View style={styles.sunShape} />
              <View style={styles.cloudShape} />
            </View>
          </LinearGradient>
        )}

        {/* Gradient overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.75)']}
          locations={[0, 0.5, 1]}
          style={styles.imageGradient}
        />

        {/* Top badges */}
        <View style={styles.topBadgesRow}>
          <View style={styles.topBadgesLeft}>
            {tour.featured && (
              <View style={styles.featuredBadge}>
                <Text style={styles.featuredIcon}>⭐</Text>
                <Text style={styles.featuredText}>Destacado</Text>
              </View>
            )}
            <View style={styles.durationBadge}>
              <Text style={styles.durationIcon}>⏱️</Text>
              <Text style={styles.durationText}>{duration}</Text>
            </View>
          </View>
          {showFavorite && (
            <FavoriteButton tour={favoriteTour} size="medium" variant="filled" />
          )}
        </View>

        {/* Bottom image content */}
        <View style={styles.imageBottomContent}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceText}>{formatPrice(price, currency)}</Text>
            <Text style={styles.priceSubtext}>/persona</Text>
          </View>
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingIcon}>★</Text>
            <Text style={styles.ratingValue}>{rating.toFixed(1)}</Text>
          </View>
        </View>
      </View>

      {/* Content section */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>

        <View style={styles.locationRow}>
          <View style={styles.locationPill}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.location} numberOfLines={1}>
              {location}
            </Text>
          </View>
        </View>

        {/* Company/Operator info */}
        <View style={styles.companyRow}>
          <View style={styles.companyAvatar}>
            {companyLogo ? (
              <Image source={{ uri: companyLogo }} style={styles.companyAvatarImage} />
            ) : (
              <View style={styles.companyAvatarPlaceholder}>
                <Text style={styles.companyInitial}>{companyName.charAt(0)}</Text>
              </View>
            )}
          </View>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName} numberOfLines={1}>
              {companyName}
            </Text>
            <View style={styles.companyRatingRow}>
              <Text style={styles.companyStarIcon}>★</Text>
              <Text style={styles.companyRatingText}>{companyRating.toFixed(1)}</Text>
            </View>
          </View>
          <View style={styles.participantsInfo}>
            <Text style={styles.participantsIcon}>👥</Text>
            <Text style={styles.participantsText}>{maxParticipants}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.cardFooter}>
          <View style={styles.reviewsContainer}>
            <Text style={styles.reviewsText}>{reviewCount} reseñas</Text>
          </View>
          <View style={styles.ctaButton}>
            <Text style={styles.ctaText}>Ver tour</Text>
            <Text style={styles.ctaArrow}>→</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Main card (default)
  card: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
    width: CARD_WIDTH,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  imageContainer: {
    height: 200,
    position: 'relative',
    backgroundColor: Colors.primaryMuted,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderContent: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  mountainShape: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: -40,
  },
  mountainPeak1: {
    width: 0,
    height: 0,
    borderLeftWidth: 60,
    borderRightWidth: 60,
    borderBottomWidth: 80,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'rgba(255,255,255,0.15)',
  },
  mountainPeak2: {
    width: 0,
    height: 0,
    borderLeftWidth: 50,
    borderRightWidth: 50,
    borderBottomWidth: 70,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'rgba(255,255,255,0.1)',
    marginTop: 10,
  },
  sunShape: {
    position: 'absolute',
    top: 30,
    right: 40,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.secondary,
    opacity: 0.4,
  },
  cloudShape: {
    position: 'absolute',
    top: 50,
    left: 30,
    width: 50,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  topBadgesRow: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    right: Spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  topBadgesLeft: {
    flexDirection: 'row',
    gap: 6,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  featuredIcon: {
    fontSize: 12,
  },
  featuredText: {
    ...Typography.labelSmall,
    color: Colors.textInverse,
    fontWeight: '700',
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  durationIcon: {
    fontSize: 12,
  },
  durationText: {
    ...Typography.labelSmall,
    color: Colors.textInverse,
    fontWeight: '600',
  },
  imageBottomContent: {
    position: 'absolute',
    bottom: Spacing.sm,
    left: Spacing.sm,
    right: Spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceText: {
    ...Typography.h2,
    color: Colors.textInverse,
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  priceSubtext: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.9)',
    marginLeft: 3,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  ratingIcon: {
    fontSize: 14,
    color: Colors.warning,
  },
  ratingValue: {
    ...Typography.labelLarge,
    color: Colors.text,
    fontWeight: '700',
  },
  content: {
    padding: Spacing.md,
  },
  title: {
    ...Typography.h4,
    color: Colors.text,
    marginBottom: Spacing.xs,
    lineHeight: 26,
  },
  locationRow: {
    marginBottom: Spacing.md,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryMuted,
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  locationIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  location: {
    ...Typography.bodySmall,
    color: Colors.primary,
    fontWeight: '500',
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.sm,
    borderRadius: 14,
    marginBottom: Spacing.md,
  },
  companyAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  companyAvatarImage: {
    width: '100%',
    height: '100%',
  },
  companyAvatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  companyInitial: {
    ...Typography.labelLarge,
    color: Colors.textInverse,
    fontWeight: '700',
  },
  companyInfo: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  companyName: {
    ...Typography.label,
    color: Colors.text,
    marginBottom: 2,
  },
  companyRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  companyStarIcon: {
    fontSize: 11,
    color: Colors.warning,
    marginRight: 3,
  },
  companyRatingText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  participantsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  participantsIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  participantsText: {
    ...Typography.labelSmall,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  reviewsContainer: {},
  reviewsText: {
    ...Typography.bodySmall,
    color: Colors.textTertiary,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 10,
    gap: 4,
  },
  ctaText: {
    ...Typography.labelSmall,
    color: Colors.textInverse,
    fontWeight: '600',
  },
  ctaArrow: {
    color: Colors.textInverse,
    fontWeight: '700',
  },

  // Horizontal card styles
  horizontalCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  horizontalImageContainer: {
    width: 140,
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
  imagePlaceholderIcon: {
    fontSize: 40,
  },
  horizontalImageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
  },
  featuredBadgeHorizontal: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: Colors.secondary,
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredTextSmall: {
    fontSize: 12,
  },
  horizontalContent: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: 'space-between',
  },
  horizontalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  horizontalTitle: {
    ...Typography.labelLarge,
    color: Colors.text,
    fontWeight: '600',
    lineHeight: 20,
    flex: 1,
    marginRight: Spacing.sm,
  },
  horizontalRating: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warningLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  starIcon: {
    fontSize: 10,
    color: Colors.warning,
    marginRight: 2,
  },
  ratingText: {
    ...Typography.labelSmall,
    color: Colors.text,
    fontWeight: '700',
  },
  horizontalLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  horizontalLocation: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    flex: 1,
  },
  horizontalMeta: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  metaText: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },
  horizontalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  companyMiniBadge: {
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  companyMiniBadgeText: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '600',
  },
  horizontalFavoriteBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  compactFavoriteBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  horizontalPrice: {
    ...Typography.h4,
    color: Colors.primary,
    fontWeight: '800',
  },

  // Compact card styles
  compactCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    width: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  compactImageContainer: {
    height: 100,
    position: 'relative',
  },
  compactImage: {
    width: '100%',
    height: '100%',
  },
  compactImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactPlaceholderIcon: {
    fontSize: 28,
  },
  compactFeaturedBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: Colors.secondary,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactFeaturedText: {
    fontSize: 10,
  },
  compactTitle: {
    ...Typography.label,
    color: Colors.text,
    fontWeight: '600',
    padding: Spacing.sm,
    paddingBottom: 4,
  },
  compactMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
  },
  compactLocation: {
    ...Typography.caption,
    color: Colors.textSecondary,
    flex: 1,
  },
  compactRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactStar: {
    fontSize: 10,
    color: Colors.warning,
    marginRight: 2,
  },
  compactRatingText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  compactPrice: {
    ...Typography.labelLarge,
    color: Colors.primary,
    fontWeight: '700',
    padding: Spacing.sm,
    paddingTop: 4,
  },
});
