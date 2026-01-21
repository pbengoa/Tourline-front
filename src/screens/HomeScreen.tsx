import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Dimensions,
  Animated,
  Linking,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Typography } from '../theme';
import { TourCard, CategoryPill } from '../components';
import { CATEGORIES } from '../constants/mockData';
import { useFavorites } from '../hooks/useFavorites';
import { useAuth } from '../context';
import { toursService, ApiTour, bannersService, regionsService } from '../services';
import type { Banner } from '../services/bannersService';
import type { Region } from '../services/regionsService';
import type { MainTabScreenProps, Tour } from '../types';

// Blurhash placeholder
const BLURHASH = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4';

const { width } = Dimensions.get('window');
const HEADER_HEIGHT = 280;

type Props = MainTabScreenProps<'Home'>;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const bannerScrollRef = useRef<FlatList>(null);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);

  // Favorites hook
  const { favorites, isLoading: favoritesLoading } = useFavorites();
  
  // Tours state
  const [featuredTours, setFeaturedTours] = useState<Tour[]>([]);
  const [toursLoading, setToursLoading] = useState(true);
  
  // Banners state
  const [banners, setBanners] = useState<Banner[]>([]);
  const [bannersLoading, setBannersLoading] = useState(true);
  
  // Regions state
  const [regions, setRegions] = useState<Region[]>([]);
  const [regionsLoading, setRegionsLoading] = useState(true);

  // Helper to format duration from minutes to readable string
  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) return `${hours} hora${hours > 1 ? 's' : ''}`;
    return `${hours}h ${mins}min`;
  };

  // Fetch featured tours from API
  useEffect(() => {
    const fetchTours = async () => {
      setToursLoading(true);
      try {
        const response = await toursService.getFeaturedTours();
        if (response.success && response.data) {
          const transformedTours: Tour[] = response.data.map((tour: ApiTour) => {
            const guideName = tour.guide?.user
              ? `${tour.guide.user.firstName} ${tour.guide.user.lastName}`
              : 'Guía';
            const guideAvatar = tour.guide?.user?.avatar;
            const guideRating = tour.guide?.rating ?? 0;

            return {
              id: tour.id,
              title: tour.title || 'Tour',
              description: tour.description || '',
              image: tour.images?.[0],
              guideId: tour.guideId,
              guideName,
              guideAvatar,
              guideRating,
              location: `${tour.city || ''}, ${tour.country || ''}`.replace(/^, |, $/g, ''),
              duration: formatDuration(tour.duration || 0),
              price: tour.price ?? 0,
              currency: tour.currency || 'CLP',
              maxParticipants: tour.maxParticipants ?? 10,
              categories: tour.categories || [],
              includes: tour.includes || [],
              rating: tour.rating ?? 0,
              reviewCount: tour.reviewCount ?? 0,
              featured: tour.featured ?? false,
            };
          });
          setFeaturedTours(transformedTours);
        }
      } catch (error) {
        console.log('Error fetching featured tours:', error);
        setFeaturedTours([]);
      } finally {
        setToursLoading(false);
      }
    };

    fetchTours();
  }, []);

  // Fetch banners from API
  useEffect(() => {
    const fetchBanners = async () => {
      setBannersLoading(true);
      try {
        const response = await bannersService.getByPlacement('home');
        if (response.success && response.data) {
          setBanners(response.data);
        }
      } catch (error) {
        console.log('Error fetching banners:', error);
        // Fallback banners
        setBanners([
          {
            id: '1',
            title: '¡Descubre Chile!',
            subtitle: 'Tours con 20% de descuento',
            imageUrl: 'https://images.unsplash.com/photo-1601000938259-9e92002320b2?w=800&h=400&fit=crop',
            actionType: 'search',
            actionValue: '',
            isActive: true,
            sortOrder: 1,
          },
          {
            id: '2',
            title: 'Torres del Paine',
            subtitle: 'El mejor destino de Sudamérica',
            imageUrl: 'https://images.unsplash.com/photo-1502602898669-a3873882021a?w=800&h=400&fit=crop',
            actionType: 'region',
            actionValue: 'torres-del-paine',
            isActive: true,
            sortOrder: 2,
          },
        ]);
      } finally {
        setBannersLoading(false);
      }
    };

    fetchBanners();
  }, []);

  // Fetch regions from API
  useEffect(() => {
    const fetchRegions = async () => {
      setRegionsLoading(true);
      try {
        const response = await regionsService.getFeatured();
        if (response.success && response.data) {
          setRegions(response.data);
        }
      } catch (error) {
        console.log('Error fetching regions:', error);
        // Fallback regions
        setRegions([
          { id: '1', name: 'Torres del Paine', slug: 'torres-del-paine', country: 'Chile', tourCount: 23, isFeatured: true, sortOrder: 1, coordinates: { latitude: -50.9423, longitude: -73.4068 } },
          { id: '2', name: 'San Pedro de Atacama', slug: 'san-pedro-atacama', country: 'Chile', tourCount: 18, isFeatured: true, sortOrder: 2, coordinates: { latitude: -22.9087, longitude: -68.1997 } },
          { id: '3', name: 'Valparaíso', slug: 'valparaiso', country: 'Chile', tourCount: 15, isFeatured: true, sortOrder: 3, coordinates: { latitude: -33.0472, longitude: -71.6127 } },
          { id: '4', name: 'Pucón', slug: 'pucon', country: 'Chile', tourCount: 12, isFeatured: true, sortOrder: 4, coordinates: { latitude: -39.2823, longitude: -71.9544 } },
        ]);
      } finally {
        setRegionsLoading(false);
      }
    };

    fetchRegions();
  }, []);

  // Auto-scroll banners
  useEffect(() => {
    if (banners.length <= 1) return;
    
    const interval = setInterval(() => {
      setActiveBannerIndex((prev) => {
        const nextIndex = (prev + 1) % banners.length;
        bannerScrollRef.current?.scrollToIndex({ index: nextIndex, animated: true });
        return nextIndex;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length]);

  // Entrance animation
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleTourPress = (tourId: string, title: string) => {
    navigation.navigate('Details', { id: tourId, title });
  };

  const handleGuidePress = (guideId: string) => {
    navigation.navigate('GuideDetail', { guideId });
  };

  const handleSearchPress = () => {
    navigation.navigate('Search');
  };

  const handleCategoryPress = (categoryId: string) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
    navigation.navigate('Search');
  };

  const handleBannerPress = async (banner: Banner) => {
    // Track click for analytics
    try {
      await bannersService.trackClick(banner.id);
    } catch (e) {}

    switch (banner.actionType) {
      case 'tour':
        navigation.navigate('Details', { id: banner.actionValue });
        break;
      case 'region':
        navigation.navigate('Search'); // TODO: Add region filter
        break;
      case 'category':
        navigation.navigate('Search'); // TODO: Add category filter
        break;
      case 'url':
        if (banner.actionValue) Linking.openURL(banner.actionValue);
        break;
      case 'search':
      default:
        navigation.navigate('Search');
        break;
    }
  };

  const handleFavoritePress = (tourId: string) => {
    const favTour = favorites.find(f => f.id === tourId);
    navigation.navigate('Details', { id: tourId, title: favTour?.title });
  };

  const handleRegionPress = (region: Region) => {
    navigation.navigate('Search'); // TODO: Add region filter to search
  };

  // Greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const userName = user?.firstName || 'Explorador';

  // Header opacity based on scroll
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT / 2],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  // Format price for CLP
  const formatPrice = (price: number) => {
    return price.toLocaleString('es-CL');
  };

  return (
    <View style={styles.container}>
      {/* Animated Hero Background */}
      <Animated.View style={[styles.heroContainer, { opacity: headerOpacity }]}>
        <LinearGradient
          colors={[Colors.primary, Colors.primaryDark]}
          style={styles.heroGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Decorative Mountains */}
          <View style={styles.mountainsContainer}>
            <View style={styles.mountain1} />
            <View style={styles.mountain2} />
            <View style={styles.mountain3} />
          </View>

          {/* Sun/Moon decoration */}
          <View style={styles.celestialBody} />

          {/* Stars/Birds */}
          <View style={styles.decorativeElements}>
            <View style={[styles.star, { top: 40, left: 30 }]} />
            <View style={[styles.star, { top: 60, left: 80 }]} />
            <View style={[styles.star, { top: 30, right: 60 }]} />
          </View>
        </LinearGradient>
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true,
        })}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Content */}
        <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
          <Animated.View style={[styles.headerContent, { opacity: fadeAnim }]}>
            {/* Top Row */}
            <View style={styles.headerTop}>
              <View style={styles.greetingContainer}>
                <Text style={styles.greeting}>{getGreeting()},</Text>
                <Text style={styles.userName}>{userName} 👋</Text>
              </View>
              <TouchableOpacity style={styles.notificationButton} activeOpacity={0.8}>
                <View style={styles.notificationIconContainer}>
                  <Text style={styles.bellIcon}>🔔</Text>
                </View>
                <View style={styles.notificationDot} />
              </TouchableOpacity>
            </View>

            {/* Tagline */}
            <Text style={styles.tagline}>Descubre tu próxima aventura</Text>

            {/* Search Bar */}
            <TouchableOpacity
              style={styles.searchBar}
              onPress={handleSearchPress}
              activeOpacity={0.95}
            >
              <View style={styles.searchIconContainer}>
                <Text style={styles.searchIcon}>🔍</Text>
              </View>
              <View style={styles.searchTextContainer}>
                <Text style={styles.searchPlaceholder}>¿A dónde quieres ir?</Text>
                <Text style={styles.searchHint}>Guías, tours, destinos...</Text>
              </View>
              <View style={styles.filterButton}>
                <Text style={styles.filterIcon}>⚡</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </SafeAreaView>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Quick Stats Banner */}
          <View style={styles.statsBanner}>
            <LinearGradient
              colors={[Colors.secondary, Colors.secondaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.statsGradient}
            >
              <View style={styles.statItem}>
                <Text style={styles.statValue}>50+</Text>
                <Text style={styles.statLabel}>Destinos</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>120+</Text>
                <Text style={styles.statLabel}>Guías</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>4.9★</Text>
                <Text style={styles.statLabel}>Rating</Text>
              </View>
            </LinearGradient>
          </View>

          {/* Promotional Banners */}
          {banners.length > 0 && (
            <View style={styles.bannersSection}>
              <FlatList
                ref={bannerScrollRef}
                data={banners}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                // Performance optimizations
                removeClippedSubviews={true}
                initialNumToRender={2}
                maxToRenderPerBatch={3}
                onMomentumScrollEnd={(e) => {
                  const index = Math.round(e.nativeEvent.contentOffset.x / (width - Spacing.lg * 2));
                  setActiveBannerIndex(index);
                }}
                renderItem={({ item: banner }) => (
                  <TouchableOpacity
                    style={styles.bannerCard}
                    onPress={() => handleBannerPress(banner)}
                    activeOpacity={0.95}
                  >
                    <Image
                      source={banner.imageUrl}
                      style={styles.bannerImage}
                      contentFit="cover"
                      placeholder={BLURHASH}
                      transition={200}
                      cachePolicy="memory-disk"
                    />
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.8)']}
                      style={styles.bannerGradient}
                    >
                      <View style={styles.bannerContent}>
                        <Text style={[styles.bannerTitle, banner.textColor && { color: banner.textColor }]}>
                          {banner.title}
                        </Text>
                        {banner.subtitle && (
                          <Text style={[styles.bannerSubtitle, banner.textColor && { color: banner.textColor }]}>
                            {banner.subtitle}
                          </Text>
                        )}
                      </View>
                      <View style={styles.bannerCTA}>
                        <Text style={styles.bannerCTAText}>Ver más →</Text>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                )}
              />
              {/* Banner Indicators */}
              {banners.length > 1 && (
                <View style={styles.bannerIndicators}>
                  {banners.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.bannerDot,
                        activeBannerIndex === index && styles.bannerDotActive,
                      ]}
                    />
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Categories */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Explorar por categoría</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesContainer}
            >
              {CATEGORIES.map((category, index) => (
                <Animated.View
                  key={category.id}
                  style={{
                    opacity: fadeAnim,
                    transform: [
                      {
                        translateX: fadeAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [50, 0],
                        }),
                      },
                    ],
                  }}
                >
                  <CategoryPill
                    category={category}
                    selected={selectedCategory === category.id}
                    onPress={() => handleCategoryPress(category.id)}
                  />
                </Animated.View>
              ))}
            </ScrollView>
          </View>

          {/* Your Favorites Section */}
          {!favoritesLoading && favorites.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionTitle}>❤️ Tus Favoritos</Text>
                  <Text style={styles.sectionSubtitle}>Tours guardados para ti</Text>
                </View>
                <TouchableOpacity
                  style={styles.seeAllButton}
                  onPress={() => navigation.navigate('Favorites')}
                >
                  <Text style={styles.seeAllText}>Ver todos</Text>
                  <Text style={styles.seeAllArrow}>→</Text>
                </TouchableOpacity>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.favoritesContainer}
              >
                {favorites.slice(0, 5).map((fav) => (
                  <TouchableOpacity
                    key={fav.id}
                    style={styles.favoriteCard}
                    onPress={() => handleFavoritePress(fav.id)}
                    activeOpacity={0.9}
                  >
                    {fav.image ? (
                      <Image
                        source={fav.image}
                        style={styles.favoriteImage}
                        contentFit="cover"
                        cachePolicy="memory-disk"
                      />
                    ) : (
                      <View style={styles.favoriteImagePlaceholder}>
                        <Text style={styles.favoriteEmoji}>🏔️</Text>
                      </View>
                    )}
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.85)']}
                      style={styles.favoriteGradient}
                    >
                      <View style={styles.favoriteHeart}>
                        <Text style={styles.favoriteHeartIcon}>❤️</Text>
                      </View>
                      <View style={styles.favoriteInfo}>
                        <Text style={styles.favoriteTitle} numberOfLines={2}>{fav.title}</Text>
                        <View style={styles.favoriteMeta}>
                          <Text style={styles.favoritePrice}>
                            ${fav.price.toLocaleString('es-CL')}
                          </Text>
                          <Text style={styles.favoriteRating}>⭐ {fav.rating.toFixed(1)}</Text>
                        </View>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Featured Tours */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Tours Destacados</Text>
                <Text style={styles.sectionSubtitle}>Experiencias inolvidables</Text>
              </View>
              <TouchableOpacity
                style={styles.seeAllButton}
                onPress={() => navigation.navigate('Search')}
              >
                <Text style={styles.seeAllText}>Ver todos</Text>
                <Text style={styles.seeAllArrow}>→</Text>
              </TouchableOpacity>
            </View>
            {toursLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={Colors.primary} />
              </View>
            ) : featuredTours.length > 0 ? (
              <FlatList
                horizontal
                data={featuredTours}
                renderItem={({ item }) => (
                  <Animated.View
                    style={{
                      opacity: fadeAnim,
                      transform: [
                        {
                          scale: fadeAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.9, 1],
                          }),
                        },
                      ],
                    }}
                  >
                    <TourCard tour={item} onPress={() => handleTourPress(item.id, item.title)} />
                  </Animated.View>
                )}
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalList}
                ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
                snapToInterval={316}
                decelerationRate="fast"
                // Performance optimizations
                removeClippedSubviews={true}
                initialNumToRender={3}
                maxToRenderPerBatch={5}
                windowSize={3}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No hay tours destacados</Text>
              </View>
            )}
          </View>

          {/* Explore by Region */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Explorar por Región</Text>
                <Text style={styles.sectionSubtitle}>Destinos increíbles</Text>
              </View>
            </View>
            {regionsLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={Colors.primary} />
              </View>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.regionsContainer}
              >
                {regions.map((region, index) => {
                  // Fallback images for regions
                  const regionImages: { [key: string]: string } = {
                    'torres-del-paine': 'https://images.unsplash.com/photo-1502602898669-a3873882021a?w=300&h=400&fit=crop',
                    'san-pedro-atacama': 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=300&h=400&fit=crop',
                    'valparaiso': 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=300&h=400&fit=crop',
                    'pucon': 'https://images.unsplash.com/photo-1591016486983-9ba71cea8c91?w=300&h=400&fit=crop',
                  };
                  const imageUrl = region.imageUrl || regionImages[region.slug] || 'https://images.unsplash.com/photo-1502602898669-a3873882021a?w=300&h=400&fit=crop';

                  return (
                    <TouchableOpacity
                      key={region.id}
                      style={styles.regionCard}
                      onPress={() => handleRegionPress(region)}
                      activeOpacity={0.9}
                    >
                      <Image
                        source={imageUrl}
                        style={styles.regionImage}
                        contentFit="cover"
                        placeholder={BLURHASH}
                        transition={200}
                        cachePolicy="memory-disk"
                      />
                      <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.85)']}
                        style={styles.regionGradient}
                      >
                        <View style={styles.regionBadge}>
                          <Text style={styles.regionBadgeText}>📍 {region.country}</Text>
                        </View>
                        <View style={styles.regionInfo}>
                          <Text style={styles.regionName}>{region.name}</Text>
                          <Text style={styles.regionTours}>{region.tourCount} tours disponibles</Text>
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </View>

          {/* Featured Companies - Coming soon with backend */}
          {/* This section will be populated when companiesService.getFeatured() is available */}

          {/* CTA Banner */}
          <View style={styles.ctaSection}>
            <LinearGradient
              colors={[Colors.primaryDark, Colors.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.ctaBanner}
            >
              <View style={styles.ctaDecorations}>
                <View style={styles.ctaMountain} />
              </View>
              <View style={styles.ctaContent}>
                <Text style={styles.ctaEmoji}>🏔️</Text>
                <View style={styles.ctaTextContainer}>
                  <Text style={styles.ctaTitle}>¿Eres guía local?</Text>
                  <Text style={styles.ctaSubtitle}>Únete y comparte tu pasión por Chile</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.ctaButton} activeOpacity={0.9}>
                <Text style={styles.ctaButtonText}>Comenzar</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>

          {/* Bottom padding for tab bar */}
          <View style={{ height: 120 }} />
        </View>
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  heroContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT,
    zIndex: 0,
  },
  heroGradient: {
    flex: 1,
    overflow: 'hidden',
  },
  mountainsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  mountain1: {
    position: 'absolute',
    bottom: -20,
    left: -30,
    width: 0,
    height: 0,
    borderLeftWidth: 120,
    borderRightWidth: 120,
    borderBottomWidth: 100,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'rgba(255,255,255,0.1)',
    transform: [{ rotate: '-5deg' }],
  },
  mountain2: {
    position: 'absolute',
    bottom: -10,
    right: -20,
    width: 0,
    height: 0,
    borderLeftWidth: 100,
    borderRightWidth: 100,
    borderBottomWidth: 80,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  mountain3: {
    position: 'absolute',
    bottom: 0,
    left: width * 0.3,
    width: 0,
    height: 0,
    borderLeftWidth: 80,
    borderRightWidth: 80,
    borderBottomWidth: 60,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  celestialBody: {
    position: 'absolute',
    top: 50,
    right: 40,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.secondary,
    opacity: 0.3,
  },
  decorativeElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  star: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  scrollContent: {
    paddingBottom: 0,
  },
  headerSafeArea: {
    zIndex: 1,
  },
  headerContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xl,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  greetingContainer: {},
  greeting: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.8)',
  },
  userName: {
    ...Typography.h2,
    color: Colors.textInverse,
    marginTop: 2,
  },
  notificationButton: {
    position: 'relative',
  },
  notificationIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bellIcon: {
    fontSize: 22,
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.secondary,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  tagline: {
    ...Typography.bodyLarge,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: Spacing.lg,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  searchIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchIcon: {
    fontSize: 18,
  },
  searchTextContainer: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  searchPlaceholder: {
    ...Typography.labelLarge,
    color: Colors.text,
  },
  searchHint: {
    ...Typography.bodySmall,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.secondaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterIcon: {
    fontSize: 18,
  },
  mainContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -20,
    paddingTop: Spacing.lg,
  },
  // Stats Banner
  statsBanner: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  statsGradient: {
    flexDirection: 'row',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...Typography.h3,
    color: Colors.textInverse,
    fontWeight: '800',
  },
  statLabel: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginVertical: 4,
  },
  // Section
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text,
  },
  sectionSubtitle: {
    ...Typography.bodySmall,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 12,
  },
  seeAllText: {
    ...Typography.labelSmall,
    color: Colors.primary,
    fontWeight: '600',
  },
  seeAllArrow: {
    marginLeft: 4,
    color: Colors.primary,
    fontWeight: '600',
  },
  categoriesContainer: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  horizontalList: {
    paddingHorizontal: Spacing.lg,
  },
  // Destinations
  destinationsContainer: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  destinationCard: {
    width: 140,
    height: 180,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: Spacing.md,
  },
  destinationImage: {
    width: '100%',
    height: '100%',
  },
  destinationGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    justifyContent: 'flex-end',
    padding: Spacing.sm,
  },
  destinationName: {
    ...Typography.labelLarge,
    color: Colors.textInverse,
    fontWeight: '700',
  },
  destinationTours: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.8)',
  },
  // Guides
  guidesContainer: {
    paddingHorizontal: Spacing.lg,
  },
  guideCard: {
    width: 100,
    alignItems: 'center',
    marginRight: Spacing.md,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: Spacing.sm,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  guideAvatarContainer: {
    position: 'relative',
    marginBottom: Spacing.xs,
  },
  guideAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  guideAvatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideInitial: {
    ...Typography.h4,
    color: Colors.textInverse,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.card,
  },
  verifiedIcon: {
    fontSize: 10,
    color: Colors.textInverse,
    fontWeight: '700',
  },
  guideCardName: {
    ...Typography.labelSmall,
    color: Colors.text,
    fontWeight: '600',
    textAlign: 'center',
  },
  guideRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  guideStar: {
    fontSize: 10,
    color: Colors.warning,
    marginRight: 2,
  },
  guideRating: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  guideLocation: {
    ...Typography.caption,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: 2,
  },
  loadingContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  // CTA
  ctaSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  ctaBanner: {
    borderRadius: 24,
    padding: Spacing.lg,
    overflow: 'hidden',
  },
  ctaDecorations: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  ctaMountain: {
    position: 'absolute',
    bottom: -20,
    right: -30,
    width: 0,
    height: 0,
    borderLeftWidth: 80,
    borderRightWidth: 80,
    borderBottomWidth: 60,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  ctaContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  ctaEmoji: {
    fontSize: 40,
    marginRight: Spacing.md,
  },
  ctaTextContainer: {
    flex: 1,
  },
  ctaTitle: {
    ...Typography.h4,
    color: Colors.textInverse,
  },
  ctaSubtitle: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  ctaButton: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 14,
    alignSelf: 'flex-start',
  },
  ctaButtonText: {
    ...Typography.labelLarge,
    color: Colors.textInverse,
    fontWeight: '700',
  },
  // Banners
  bannersSection: {
    marginBottom: Spacing.lg,
  },
  bannerCard: {
    width: width - Spacing.lg * 2,
    height: 160,
    marginHorizontal: Spacing.lg,
    borderRadius: 20,
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    padding: Spacing.md,
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    ...Typography.h3,
    color: Colors.textInverse,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  bannerSubtitle: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  bannerCTA: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 10,
  },
  bannerCTAText: {
    ...Typography.labelSmall,
    color: Colors.textInverse,
    fontWeight: '600',
  },
  bannerIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.sm,
    gap: 6,
  },
  bannerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.borderLight,
  },
  bannerDotActive: {
    width: 20,
    backgroundColor: Colors.primary,
  },
  // Favorites
  favoritesContainer: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  favoriteCard: {
    width: 160,
    height: 200,
    borderRadius: 18,
    overflow: 'hidden',
    marginRight: Spacing.md,
  },
  favoriteImage: {
    width: '100%',
    height: '100%',
  },
  favoriteImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteEmoji: {
    fontSize: 40,
  },
  favoriteGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 140,
    justifyContent: 'space-between',
    padding: Spacing.sm,
  },
  favoriteHeart: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 20,
    padding: 6,
  },
  favoriteHeartIcon: {
    fontSize: 14,
  },
  favoriteInfo: {
    gap: Spacing.xs,
  },
  favoriteTitle: {
    ...Typography.labelLarge,
    color: Colors.textInverse,
    fontWeight: '600',
    lineHeight: 18,
  },
  favoriteMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  favoritePrice: {
    ...Typography.label,
    color: Colors.secondary,
    fontWeight: '700',
  },
  favoriteRating: {
    ...Typography.caption,
    color: Colors.textInverse,
  },
  // Regions
  regionsContainer: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  regionCard: {
    width: 160,
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: Spacing.md,
  },
  regionImage: {
    width: '100%',
    height: '100%',
  },
  regionGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 140,
    justifyContent: 'space-between',
    padding: Spacing.sm,
  },
  regionBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 10,
  },
  regionBadgeText: {
    ...Typography.caption,
    color: Colors.textInverse,
    fontWeight: '500',
  },
  regionInfo: {
    gap: 2,
  },
  regionName: {
    ...Typography.labelLarge,
    color: Colors.textInverse,
    fontWeight: '700',
  },
  regionTours: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.8)',
  },
});
