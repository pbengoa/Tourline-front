import React, { useState, useRef, useEffect } from 'react';
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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Typography } from '../theme';
import { GuideCard, TourCard, CategoryPill } from '../components';
import { CATEGORIES, MOCK_TOURS, MOCK_GUIDES } from '../constants/mockData';
import { useFeaturedGuides } from '../hooks';
import { useAuth } from '../context';
import type { MainTabScreenProps } from '../types';

const { width, height } = Dimensions.get('window');
const HEADER_HEIGHT = 280;

type Props = MainTabScreenProps<'Home'>;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Fetch featured guides from API
  const { guides: featuredGuides, loading: guidesLoading } = useFeaturedGuides();

  // Use mock data for tours
  const featuredTours = MOCK_TOURS.filter((tour) => tour.featured);
  const allGuides = featuredGuides.length > 0 ? featuredGuides : MOCK_GUIDES;

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
            <FlatList
              horizontal
              data={featuredTours}
              renderItem={({ item, index }) => (
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
            />
          </View>

          {/* Popular Destinations */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Destinos Populares</Text>
                <Text style={styles.sectionSubtitle}>Los favoritos de Chile</Text>
              </View>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.destinationsContainer}
            >
              {[
                {
                  name: 'Torres del Paine',
                  image:
                    'https://images.unsplash.com/photo-1502602898669-a3873882021a?w=300&h=400&fit=crop',
                  tours: 23,
                },
                {
                  name: 'San Pedro de Atacama',
                  image:
                    'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=300&h=400&fit=crop',
                  tours: 18,
                },
                {
                  name: 'Valparaíso',
                  image:
                    'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=300&h=400&fit=crop',
                  tours: 15,
                },
                {
                  name: 'Pucón',
                  image:
                    'https://images.unsplash.com/photo-1591016486983-9ba71cea8c91?w=300&h=400&fit=crop',
                  tours: 12,
                },
              ].map((destination, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.destinationCard}
                  onPress={() => navigation.navigate('Search')}
                  activeOpacity={0.9}
                >
                  <Image source={{ uri: destination.image }} style={styles.destinationImage} />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.8)']}
                    style={styles.destinationGradient}
                  >
                    <Text style={styles.destinationName}>{destination.name}</Text>
                    <Text style={styles.destinationTours}>{destination.tours} tours</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Top Guides */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Guías Top</Text>
                <Text style={styles.sectionSubtitle}>Expertos locales</Text>
              </View>
              <TouchableOpacity
                style={styles.seeAllButton}
                onPress={() => navigation.navigate('Search')}
              >
                <Text style={styles.seeAllText}>Ver todos</Text>
                <Text style={styles.seeAllArrow}>→</Text>
              </TouchableOpacity>
            </View>
            {guidesLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={Colors.primary} />
              </View>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.guidesContainer}
              >
                {allGuides.slice(0, 5).map((guide: any, index: number) => (
                  <TouchableOpacity
                    key={guide.id}
                    style={styles.guideCard}
                    onPress={() => handleGuidePress(guide.id)}
                    activeOpacity={0.9}
                  >
                    <View style={styles.guideAvatarContainer}>
                      {guide.avatar ? (
                        <Image source={{ uri: guide.avatar }} style={styles.guideAvatar} />
                      ) : (
                        <View style={styles.guideAvatarPlaceholder}>
                          <Text style={styles.guideInitial}>
                            {(guide.name || 'G').charAt(0)}
                          </Text>
                        </View>
                      )}
                      {guide.verified && (
                        <View style={styles.verifiedBadge}>
                          <Text style={styles.verifiedIcon}>✓</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.guideCardName} numberOfLines={1}>
                      {guide.name?.split(' ')[0] || 'Guía'}
                    </Text>
                    <View style={styles.guideRatingRow}>
                      <Text style={styles.guideStar}>★</Text>
                      <Text style={styles.guideRating}>
                        {(guide.rating || 0).toFixed(1)}
                      </Text>
                    </View>
                    <Text style={styles.guideLocation} numberOfLines={1}>
                      {guide.city || guide.location?.split(',')[0] || 'Chile'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

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
});
