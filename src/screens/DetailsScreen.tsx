import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Typography } from '../theme';
import { toursService, ApiTour } from '../services';
import type { RootStackScreenProps, Tour } from '../types';
import { FavoriteButton } from '../components/FavoriteButton';
import { FavoriteTour } from '../hooks/useFavorites';

type Props = RootStackScreenProps<'Details'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const DetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { id } = route.params;
  const galleryRef = useRef<FlatList>(null);
  
  const [tour, setTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Helper to format duration from minutes to readable string
  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) return `${hours} hora${hours > 1 ? 's' : ''}`;
    return `${hours}h ${mins}min`;
  };

  useEffect(() => {
    const fetchTour = async () => {
      setLoading(true);
      setError(false);
      try {
        const response = await toursService.getTour(id);
        console.log('📍 DetailsScreen - Tour response:', JSON.stringify(response?.data, null, 2));
        if (response.success && response.data) {
          const apiTour: ApiTour = response.data;
          
          // Get company info (NEW) or fallback to guide info for backwards compatibility
          const companyId = apiTour.companyId || apiTour.company?.id;
          const companyName = apiTour.company?.name || 'Empresa';
          const companyLogo = apiTour.company?.logoUrl;
          
          console.log('📍 DetailsScreen - companyId:', companyId);
          console.log('📍 DetailsScreen - companyName:', companyName);

          const transformedTour: Tour = {
            id: apiTour.id,
            title: apiTour.title || 'Tour',
            description: apiTour.description || '',
            image: apiTour.images?.[0],
            images: apiTour.images || [],
            companyId: companyId || '',
            companyName,
            companyLogo,
            location: `${apiTour.city || ''}, ${apiTour.country || ''}`.replace(/^, |, $/g, ''),
            meetingPoint: apiTour.meetingPoint,
            meetingPointInstructions: apiTour.meetingPointInstructions,
            duration: formatDuration(apiTour.duration || 0),
            price: apiTour.price ?? 0,
            currency: apiTour.currency || 'CLP',
            maxParticipants: apiTour.maxParticipants ?? 10,
            categories: apiTour.categories || [],
            includes: apiTour.includes || [],
            notIncludes: apiTour.notIncludes || [],
            requirements: apiTour.requirements || [],
            difficulty: apiTour.difficulty,
            languages: apiTour.languages || [],
            rating: apiTour.rating ?? 0,
            reviewCount: apiTour.reviewCount ?? 0,
            featured: apiTour.featured ?? false,
          };
          setTour(transformedTour);
        } else {
          setError(true);
        }
      } catch (err) {
        console.log('Error fetching tour:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchTour();
  }, [id]);

  const formatPrice = (price: number, currency: string) => {
    if (currency === 'CLP') {
      return `$${price.toLocaleString('es-CL')}`;
    }
    return `${price}€`;
  };

  const handleBookNow = () => {
    if (tour) {
      navigation.navigate('Booking', {
        tourId: tour.id,
      });
    }
  };

  const handleCompanyPress = () => {
    if (tour?.companyId) {
      navigation.navigate('CompanyDetail', { companyId: tour.companyId });
    }
  };

  const handleThumbnailPress = (index: number) => {
    setActiveImageIndex(index);
    galleryRef.current?.scrollToIndex({ index, animated: true });
  };

  const onGalleryScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    if (index !== activeImageIndex) {
      setActiveImageIndex(index);
    }
  };

  const getDifficultyInfo = (difficulty?: string) => {
    const difficultyMap: { [key: string]: { label: string; color: string; icon: string } } = {
      EASY: { label: 'Fácil', color: Colors.success, icon: '🌱' },
      MODERATE: { label: 'Moderado', color: Colors.warning, icon: '🥾' },
      HARD: { label: 'Difícil', color: Colors.secondary, icon: '🏔️' },
      EXPERT: { label: 'Experto', color: Colors.error, icon: '⚡' },
    };
    return difficultyMap[difficulty || ''] || null;
  };

  // Create FavoriteTour object for the FavoriteButton
  const getFavoriteTour = (): FavoriteTour | null => {
    if (!tour) return null;
    return {
      id: tour.id,
      title: tour.title,
      image: tour.image,
      price: tour.price,
      currency: tour.currency,
      rating: tour.rating,
      reviewCount: tour.reviewCount,
      duration: tour.duration,
      location: tour.location,
      companyName: tour.companyName,
      addedAt: new Date().toISOString(),
    };
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Cargando tour...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !tour) {
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

  const images = tour.images && tour.images.length > 0 ? tour.images : (tour.image ? [tour.image] : []);
  const difficultyInfo = getDifficultyInfo(tour.difficulty);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View style={styles.galleryContainer}>
          {images.length > 0 ? (
            <>
              <FlatList
                ref={galleryRef}
                data={images}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={onGalleryScroll}
                keyExtractor={(_, index) => `image-${index}`}
                renderItem={({ item }) => (
                  <Image source={{ uri: item }} style={styles.galleryImage} />
                )}
              />
              {/* Image Overlay */}
              <LinearGradient
                colors={['rgba(0,0,0,0.3)', 'transparent', 'rgba(0,0,0,0.5)']}
                style={styles.galleryOverlay}
              />
              {/* Top Actions Row */}
              <View style={styles.topActionsRow}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => navigation.goBack()}
                >
                  <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                {getFavoriteTour() && (
                  <FavoriteButton 
                    tour={getFavoriteTour()!} 
                    size="medium" 
                    variant="filled" 
                  />
                )}
              </View>
              {/* Image Counter */}
              {images.length > 1 && (
                <View style={styles.imageCounter}>
                  <Text style={styles.imageCounterText}>
                    {activeImageIndex + 1} / {images.length}
                  </Text>
                </View>
              )}
              {/* Badges */}
              {tour.featured && (
                <View style={styles.featuredBadge}>
                  <Text style={styles.featuredText}>⭐ Destacado</Text>
                </View>
              )}
              <View style={styles.durationBadge}>
                <Text style={styles.durationText}>⏱️ {tour.duration}</Text>
              </View>
            </>
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>🏔️</Text>
              <View style={styles.topActionsRow}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => navigation.goBack()}
                >
                  <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                {getFavoriteTour() && (
                  <FavoriteButton 
                    tour={getFavoriteTour()!} 
                    size="medium" 
                    variant="filled" 
                  />
                )}
              </View>
            </View>
          )}
        </View>

        {/* Thumbnails */}
        {images.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbnailsContainer}
          >
            {images.map((img, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.thumbnail,
                  activeImageIndex === index && styles.thumbnailActive,
                ]}
                onPress={() => handleThumbnailPress(index)}
              >
                <Image source={{ uri: img }} style={styles.thumbnailImage} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <View style={styles.content}>
          {/* Title & Rating */}
          <Text style={styles.title}>{tour.title}</Text>

          <View style={styles.ratingRow}>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>⭐ {tour.rating.toFixed(1)}</Text>
            </View>
            <Text style={styles.reviewCount}>({tour.reviewCount} reseñas)</Text>
            <View style={styles.locationBadge}>
              <Text style={styles.locationText}>📍 {tour.location}</Text>
            </View>
          </View>

          {/* Difficulty Badge */}
          {difficultyInfo && (
            <View style={[styles.difficultyBadge, { backgroundColor: difficultyInfo.color + '20' }]}>
              <Text style={styles.difficultyIcon}>{difficultyInfo.icon}</Text>
              <Text style={[styles.difficultyText, { color: difficultyInfo.color }]}>
                {difficultyInfo.label}
              </Text>
            </View>
          )}

          {/* Categories */}
          {tour.categories.length > 0 && (
            <View style={styles.categoriesRow}>
              {tour.categories.map((catId) => {
                const categoryNames: { [key: string]: { name: string; icon: string } } = {
                  adventure: { name: 'Aventura', icon: '🏔️' },
                  ADVENTURE: { name: 'Aventura', icon: '🏔️' },
                  nature: { name: 'Naturaleza', icon: '🌿' },
                  NATURE: { name: 'Naturaleza', icon: '🌿' },
                  gastronomy: { name: 'Gastronomía', icon: '🍷' },
                  GASTRONOMIC: { name: 'Gastronomía', icon: '🍷' },
                  cultural: { name: 'Cultural', icon: '🏛️' },
                  CULTURAL: { name: 'Cultural', icon: '🏛️' },
                  trekking: { name: 'Trekking', icon: '🥾' },
                  TREKKING: { name: 'Trekking', icon: '🥾' },
                  astronomy: { name: 'Astronomía', icon: '🌌' },
                  ASTRONOMY: { name: 'Astronomía', icon: '🌌' },
                  photography: { name: 'Fotografía', icon: '📸' },
                  PHOTOGRAPHY: { name: 'Fotografía', icon: '📸' },
                  wine: { name: 'Vinos', icon: '🍇' },
                  WINE: { name: 'Vinos', icon: '🍇' },
                  historical: { name: 'Histórico', icon: '🏛️' },
                  HISTORICAL: { name: 'Histórico', icon: '🏛️' },
                  urban: { name: 'Urbano', icon: '🏙️' },
                  URBAN: { name: 'Urbano', icon: '🏙️' },
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
          )}

          {/* Guide Card */}
          {/* Company Card */}
          <View style={styles.guideCard}>
            <View style={styles.guideAvatar}>
              {tour.companyLogo ? (
                <Image
                  source={{ uri: tour.companyLogo }}
                  style={styles.guideAvatarImage}
                />
              ) : (
                <Text style={styles.guideAvatarText}>
                  {(tour.companyName || 'E').charAt(0)}
                </Text>
              )}
            </View>
            <View style={styles.guideInfo}>
              <Text style={styles.guideLabel}>Organizado por</Text>
              <Text style={styles.guideName}>{tour.companyName}</Text>
              <View style={styles.guideRating}>
                <Text style={styles.guideRatingText}>
                  ⭐ {tour.rating.toFixed(1)} ({tour.reviewCount} reseñas)
                </Text>
              </View>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Descripción</Text>
            <Text style={styles.description}>{tour.description}</Text>
          </View>

          {/* What's Included */}
          {tour.includes.length > 0 && (
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
          )}

          {/* Not Included */}
          {tour.notIncludes && tour.notIncludes.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>No incluye</Text>
              <View style={styles.includesList}>
                {tour.notIncludes.map((item, index) => (
                  <View key={index} style={styles.notIncludeItem}>
                    <View style={styles.notIncludeIconContainer}>
                      <Text style={styles.notIncludeIcon}>✕</Text>
                    </View>
                    <Text style={styles.notIncludeText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Requirements */}
          {tour.requirements && tour.requirements.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Requisitos</Text>
              <View style={styles.includesList}>
                {tour.requirements.map((item, index) => (
                  <View key={index} style={styles.requirementItem}>
                    <Text style={styles.requirementIcon}>•</Text>
                    <Text style={styles.requirementText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Meeting Point */}
          {tour.meetingPoint && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Punto de encuentro</Text>
              <View style={styles.meetingPointCard}>
                <Text style={styles.meetingPointIcon}>📍</Text>
                <View style={styles.meetingPointInfo}>
                  <Text style={styles.meetingPointText}>{tour.meetingPoint}</Text>
                  {tour.meetingPointInstructions && (
                    <Text style={styles.meetingPointInstructions}>
                      {tour.meetingPointInstructions}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          )}

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
                <Text style={styles.detailValue}>
                  {tour.languages && tour.languages.length > 0
                    ? tour.languages.join(', ')
                    : 'Español'}
                </Text>
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
  // Loading state
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  loadingText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
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
  // Gallery
  galleryContainer: {
    position: 'relative',
    height: 300,
  },
  galleryImage: {
    width: SCREEN_WIDTH,
    height: 300,
    resizeMode: 'cover',
  },
  galleryOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  topActionsRow: {
    position: 'absolute',
    top: Spacing.lg,
    left: Spacing.lg,
    right: Spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '600',
  },
  imageCounter: {
    position: 'absolute',
    bottom: Spacing.lg,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: 12,
  },
  imageCounterText: {
    ...Typography.labelSmall,
    color: '#fff',
  },
  imagePlaceholder: {
    width: SCREEN_WIDTH,
    height: 300,
    backgroundColor: Colors.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 64,
  },
  featuredBadge: {
    position: 'absolute',
    top: Spacing.lg,
    right: Spacing.lg,
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
    bottom: Spacing.lg,
    right: Spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: 8,
  },
  durationText: {
    ...Typography.labelSmall,
    color: Colors.textInverse,
  },
  // Thumbnails
  thumbnailsContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  thumbnail: {
    width: 70,
    height: 50,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: Spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailActive: {
    borderColor: Colors.primary,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
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
  ratingBadge: {
    backgroundColor: Colors.warningLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
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
  // Difficulty
  difficultyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: Spacing.md,
  },
  difficultyIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  difficultyText: {
    ...Typography.label,
    fontWeight: '600',
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
    borderRadius: 16,
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
    flex: 1,
  },
  // Not Includes
  notIncludeItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notIncludeIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.error + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  notIncludeIcon: {
    ...Typography.labelSmall,
    color: Colors.error,
    fontWeight: '700',
  },
  notIncludeText: {
    ...Typography.body,
    color: Colors.textSecondary,
    flex: 1,
  },
  // Requirements
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  requirementIcon: {
    ...Typography.body,
    color: Colors.textTertiary,
    marginRight: Spacing.sm,
    width: 16,
  },
  requirementText: {
    ...Typography.body,
    color: Colors.text,
    flex: 1,
  },
  // Meeting Point
  meetingPointCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  meetingPointIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  meetingPointInfo: {
    flex: 1,
  },
  meetingPointText: {
    ...Typography.labelLarge,
    color: Colors.text,
    marginBottom: 4,
  },
  meetingPointInstructions: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
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
