import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Typography } from '../theme';
import type { Company } from '../services/companiesService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - Spacing.lg * 2;

// Blurhash placeholder
const BLURHASH = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4';

interface CompanyCardProps {
  company: Company;
  onPress: () => void;
  variant?: 'default' | 'compact';
}

const CompanyCardComponent: React.FC<CompanyCardProps> = ({
  company,
  onPress,
  variant = 'default',
}) => {
  const {
    name,
    logoUrl,
    coverImage,
    rating,
    reviewCount,
    tourCount,
    city,
    country,
    isVerified,
    certifications = [],
  } = company;

  if (variant === 'compact') {
    return (
      <TouchableOpacity
        style={styles.compactCard}
        onPress={onPress}
        activeOpacity={0.95}
      >
        <View style={styles.compactLogoContainer}>
          {logoUrl ? (
            <Image
              source={logoUrl}
              style={styles.compactLogo}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
          ) : (
            <View style={styles.compactLogoPlaceholder}>
              <Text style={styles.compactLogoInitial}>{name.charAt(0)}</Text>
            </View>
          )}
          {isVerified && (
            <View style={styles.compactVerifiedBadge}>
              <Text style={styles.verifiedIcon}>✓</Text>
            </View>
          )}
        </View>
        <View style={styles.compactContent}>
          <Text style={styles.compactName} numberOfLines={1}>{name}</Text>
          <View style={styles.compactMeta}>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingIcon}>★</Text>
              <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
            </View>
            <Text style={styles.compactTours}>{tourCount} tours</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.97}
    >
      {/* Cover Image */}
      <View style={styles.coverContainer}>
        {coverImage ? (
          <Image
            source={coverImage}
            style={styles.coverImage}
            contentFit="cover"
            placeholder={BLURHASH}
            transition={200}
            cachePolicy="memory-disk"
          />
        ) : (
          <LinearGradient
            colors={[Colors.primaryLight, Colors.primary]}
            style={styles.coverPlaceholder}
          >
            <View style={styles.patternOverlay}>
              <Text style={styles.patternIcon}>🏔️</Text>
            </View>
          </LinearGradient>
        )}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.coverGradient}
        />
        
        {/* Logo overlay */}
        <View style={styles.logoOverlay}>
          {logoUrl ? (
            <Image
              source={logoUrl}
              style={styles.logo}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
          ) : (
            <View style={styles.logoPlaceholder}>
              <Text style={styles.logoInitial}>{name.charAt(0)}</Text>
            </View>
          )}
        </View>

        {/* Verified Badge */}
        {isVerified && (
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedIcon}>✓</Text>
            <Text style={styles.verifiedText}>Verificado</Text>
          </View>
        )}

        {/* Tour Count Badge */}
        <View style={styles.tourCountBadge}>
          <Text style={styles.tourCountText}>{tourCount} tours</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.name} numberOfLines={1}>{name}</Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingIconLarge}>★</Text>
            <Text style={styles.ratingValueLarge}>{rating.toFixed(1)}</Text>
            <Text style={styles.reviewCount}>({reviewCount})</Text>
          </View>
        </View>

        {/* Location */}
        <View style={styles.locationRow}>
          <Text style={styles.locationIcon}>📍</Text>
          <Text style={styles.locationText}>
            {city}{country ? `, ${country}` : ''}
          </Text>
        </View>

        {/* Certifications */}
        {certifications.length > 0 && (
          <View style={styles.certificationsRow}>
            {certifications.slice(0, 3).map((cert, index) => (
              <View key={index} style={styles.certBadge}>
                <Text style={styles.certText}>{cert}</Text>
              </View>
            ))}
            {certifications.length > 3 && (
              <Text style={styles.moreCerts}>+{certifications.length - 3}</Text>
            )}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statIcon}>📋</Text>
              <Text style={styles.statValue}>{tourCount}</Text>
              <Text style={styles.statLabel}>tours</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statIcon}>💬</Text>
              <Text style={styles.statValue}>{reviewCount}</Text>
              <Text style={styles.statLabel}>reseñas</Text>
            </View>
          </View>
          <View style={styles.ctaButton}>
            <Text style={styles.ctaText}>Ver empresa</Text>
            <Text style={styles.ctaArrow}>→</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Default Card
  card: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    overflow: 'hidden',
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  coverContainer: {
    height: 140,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  patternOverlay: {
    opacity: 0.3,
  },
  patternIcon: {
    fontSize: 48,
  },
  coverGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  logoOverlay: {
    position: 'absolute',
    bottom: -30,
    left: Spacing.md,
    zIndex: 10,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: Colors.card,
  },
  logoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    borderWidth: 3,
    borderColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoInitial: {
    ...Typography.h3,
    color: Colors.textInverse,
    fontWeight: '700',
  },
  verifiedBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  verifiedIcon: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '700',
  },
  verifiedText: {
    ...Typography.labelSmall,
    color: '#fff',
    fontWeight: '600',
  },
  tourCountBadge: {
    position: 'absolute',
    bottom: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tourCountText: {
    ...Typography.label,
    color: Colors.primary,
    fontWeight: '700',
  },
  content: {
    padding: Spacing.md,
    paddingTop: Spacing.xl + Spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  name: {
    ...Typography.h4,
    color: Colors.text,
    flex: 1,
    marginRight: Spacing.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warningLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingIconLarge: {
    fontSize: 14,
    color: Colors.warning,
    marginRight: 2,
  },
  ratingValueLarge: {
    ...Typography.label,
    color: Colors.text,
    fontWeight: '700',
  },
  reviewCount: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginLeft: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  locationIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  locationText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  certificationsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: Spacing.md,
  },
  certBadge: {
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  certText: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '600',
  },
  moreCerts: {
    ...Typography.caption,
    color: Colors.textTertiary,
    alignSelf: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statIcon: {
    fontSize: 12,
  },
  statValue: {
    ...Typography.labelSmall,
    color: Colors.text,
    fontWeight: '600',
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },
  statDivider: {
    width: 1,
    height: 16,
    backgroundColor: Colors.borderLight,
    marginHorizontal: Spacing.sm,
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

  // Compact Card
  compactCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  compactLogoContainer: {
    position: 'relative',
  },
  compactLogo: {
    width: 52,
    height: 52,
    borderRadius: 14,
  },
  compactLogoPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactLogoInitial: {
    ...Typography.h4,
    color: Colors.textInverse,
    fontWeight: '700',
  },
  compactVerifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.card,
  },
  compactContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  compactName: {
    ...Typography.label,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: 4,
  },
  compactMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warningLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ratingIcon: {
    fontSize: 10,
    color: Colors.warning,
    marginRight: 2,
  },
  ratingText: {
    ...Typography.caption,
    color: Colors.text,
    fontWeight: '700',
  },
  compactTours: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },
});

// Memoized export - only re-renders when props change
export const CompanyCard = memo(CompanyCardComponent);
export default CompanyCard;

