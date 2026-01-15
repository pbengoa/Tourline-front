import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '../theme';
import { MOCK_TOURS } from '../constants/mockData';
import type { RootStackScreenProps } from '../types';

type Props = RootStackScreenProps<'Details'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const DetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { id, title } = route.params;

  // Find the tour from mock data
  const tour = MOCK_TOURS.find((t) => t.id === id);

  const formatPrice = (price: number, currency: string) => {
    if (currency === 'CLP') {
      return `$${price.toLocaleString('es-CL')}`;
    }
    return `${price}€`;
  };

  const handleBookNow = () => {
    if (tour) {
      navigation.navigate('Booking', {
        guideId: tour.guideId,
        tourId: tour.id,
      });
    }
  };

  const handleGuidePress = () => {
    if (tour) {
      navigation.navigate('GuideDetail', { guideId: tour.guideId });
    }
  };

  if (!tour) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>😕</Text>
          <Text style={styles.errorTitle}>Tour no encontrado</Text>
          <Text style={styles.errorText}>
            El tour que buscas no está disponible
          </Text>
          <TouchableOpacity
            style={styles.errorButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.errorButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Image */}
        <View style={styles.imageContainer}>
          {tour.image ? (
            <Image source={{ uri: tour.image }} style={styles.headerImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>🏔️</Text>
            </View>
          )}
          {tour.featured && (
            <View style={styles.featuredBadge}>
              <Text style={styles.featuredText}>⭐ Destacado</Text>
            </View>
          )}
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>⏱️ {tour.duration}</Text>
          </View>
        </View>

        <View style={styles.content}>
          {/* Title & Rating */}
          <Text style={styles.title}>{tour.title}</Text>

          <View style={styles.ratingRow}>
            <Text style={styles.ratingText}>⭐ {tour.rating}</Text>
            <Text style={styles.reviewCount}>({tour.reviewCount} reseñas)</Text>
            <View style={styles.locationBadge}>
              <Text style={styles.locationText}>📍 {tour.location}</Text>
            </View>
          </View>

          {/* Categories */}
          <View style={styles.categoriesRow}>
            {tour.categories.map((catId) => {
              const categoryNames: { [key: string]: { name: string; icon: string } } = {
                adventure: { name: 'Aventura', icon: '🏔️' },
                nature: { name: 'Naturaleza', icon: '🌿' },
                gastronomy: { name: 'Gastronomía', icon: '🍷' },
                cultural: { name: 'Cultural', icon: '🏛️' },
                trekking: { name: 'Trekking', icon: '🥾' },
                astronomy: { name: 'Astronomía', icon: '🌌' },
                photography: { name: 'Fotografía', icon: '📸' },
                wine: { name: 'Vinos', icon: '🍇' },
              };
              const cat = categoryNames[catId];
              if (!cat) return null;
              return (
                <View key={catId} style={styles.categoryTag}>
                  <Text style={styles.categoryIcon}>{cat.icon}</Text>
                  <Text style={styles.categoryName}>{cat.name}</Text>
                </View>
              );
            })}
          </View>

          {/* Guide Card */}
          <TouchableOpacity
            style={styles.guideCard}
            onPress={handleGuidePress}
            activeOpacity={0.8}
          >
            <View style={styles.guideAvatar}>
              {tour.guideAvatar ? (
                <Image
                  source={{ uri: tour.guideAvatar }}
                  style={styles.guideAvatarImage}
                />
              ) : (
                <Text style={styles.guideAvatarText}>
                  {tour.guideName.charAt(0)}
                </Text>
              )}
            </View>
            <View style={styles.guideInfo}>
              <Text style={styles.guideLabel}>Tu guía</Text>
              <Text style={styles.guideName}>{tour.guideName}</Text>
              <View style={styles.guideRating}>
                <Text style={styles.guideRatingText}>
                  ⭐ {tour.guideRating}
                </Text>
              </View>
            </View>
            <Text style={styles.guideArrow}>›</Text>
          </TouchableOpacity>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Descripción</Text>
            <Text style={styles.description}>{tour.description}</Text>
          </View>

          {/* What's Included */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>¿Qué incluye?</Text>
            <View style={styles.includesList}>
              {tour.includes.map((item, index) => (
                <View key={index} style={styles.includeItem}>
                  <View style={styles.includeIconContainer}>
                    <Text style={styles.includeIcon}>✓</Text>
                  </View>
                  <Text style={styles.includeText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Detalles</Text>
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Text style={styles.detailIcon}>⏱️</Text>
                <Text style={styles.detailLabel}>Duración</Text>
                <Text style={styles.detailValue}>{tour.duration}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailIcon}>👥</Text>
                <Text style={styles.detailLabel}>Máx. participantes</Text>
                <Text style={styles.detailValue}>{tour.maxParticipants}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailIcon}>📍</Text>
                <Text style={styles.detailLabel}>Ubicación</Text>
                <Text style={styles.detailValue}>{tour.location}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailIcon}>🗣️</Text>
                <Text style={styles.detailLabel}>Idioma</Text>
                <Text style={styles.detailValue}>Español</Text>
              </View>
            </View>
          </View>

          {/* Cancellation Policy */}
          <View style={styles.policyCard}>
            <Text style={styles.policyIcon}>ℹ️</Text>
            <View style={styles.policyContent}>
              <Text style={styles.policyTitle}>Cancelación gratuita</Text>
              <Text style={styles.policyText}>
                Cancela hasta 24 horas antes para un reembolso completo
              </Text>
            </View>
          </View>

          {/* Spacer for bottom bar */}
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>
            {formatPrice(tour.price, tour.currency)}
          </Text>
          <Text style={styles.priceLabel}>por persona</Text>
        </View>
        <TouchableOpacity
          style={styles.bookButton}
          activeOpacity={0.8}
          onPress={handleBookNow}
        >
          <Text style={styles.bookButtonText}>Reservar Ahora</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  // Error state
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  errorTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  errorText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  errorButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 12,
  },
  errorButtonText: {
    ...Typography.labelLarge,
    color: Colors.textInverse,
  },
  // Image
  imageContainer: {
    position: 'relative',
  },
  headerImage: {
    width: SCREEN_WIDTH,
    height: 280,
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: SCREEN_WIDTH,
    height: 280,
    backgroundColor: Colors.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 64,
  },
  featuredBadge: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    backgroundColor: Colors.secondary,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: 8,
  },
  featuredText: {
    ...Typography.labelSmall,
    color: Colors.textInverse,
    fontWeight: '700',
  },
  durationBadge: {
    position: 'absolute',
    bottom: Spacing.md,
    right: Spacing.md,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: 8,
  },
  durationText: {
    ...Typography.labelSmall,
    color: Colors.textInverse,
  },
  // Content
  content: {
    padding: Spacing.lg,
  },
  title: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  ratingText: {
    ...Typography.labelLarge,
    color: Colors.text,
  },
  reviewCount: {
    ...Typography.body,
    color: Colors.textTertiary,
  },
  locationBadge: {
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },
  locationText: {
    ...Typography.labelSmall,
    color: Colors.primary,
  },
  // Categories
  categoriesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  categoryName: {
    ...Typography.labelSmall,
    color: Colors.textSecondary,
  },
  // Guide Card
  guideCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  guideAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  guideAvatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  guideAvatarText: {
    ...Typography.h3,
    color: Colors.textInverse,
  },
  guideInfo: {
    flex: 1,
  },
  guideLabel: {
    ...Typography.labelSmall,
    color: Colors.textTertiary,
  },
  guideName: {
    ...Typography.labelLarge,
    color: Colors.text,
  },
  guideRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  guideRatingText: {
    ...Typography.labelSmall,
    color: Colors.textSecondary,
  },
  guideArrow: {
    fontSize: 24,
    color: Colors.textTertiary,
  },
  // Section
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.h4,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  description: {
    ...Typography.body,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  // Includes
  includesList: {
    gap: Spacing.sm,
  },
  includeItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  includeIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.success + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  includeIcon: {
    ...Typography.labelSmall,
    color: Colors.success,
    fontWeight: '700',
  },
  includeText: {
    ...Typography.body,
    color: Colors.text,
  },
  // Details Grid
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  detailItem: {
    width: '47%',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  detailIcon: {
    fontSize: 20,
    marginBottom: Spacing.xs,
  },
  detailLabel: {
    ...Typography.labelSmall,
    color: Colors.textTertiary,
    marginBottom: 2,
  },
  detailValue: {
    ...Typography.labelLarge,
    color: Colors.text,
  },
  // Policy Card
  policyCard: {
    flexDirection: 'row',
    backgroundColor: Colors.infoLight,
    padding: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.lg,
  },
  policyIcon: {
    fontSize: 20,
    marginRight: Spacing.sm,
  },
  policyContent: {
    flex: 1,
  },
  policyTitle: {
    ...Typography.labelLarge,
    color: Colors.info,
    marginBottom: 2,
  },
  policyText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  // Bottom Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  priceContainer: {},
  price: {
    ...Typography.h3,
    color: Colors.primary,
    fontWeight: '700',
  },
  priceLabel: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  bookButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 12,
  },
  bookButtonText: {
    ...Typography.labelLarge,
    color: Colors.textInverse,
    fontWeight: '600',
  },
});
