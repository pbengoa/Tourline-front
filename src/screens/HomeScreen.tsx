import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Colors, Spacing, Typography } from '../theme';
import { GuideCard, TourCard, CategoryPill } from '../components';
import { CATEGORIES, MOCK_TOURS } from '../constants/mockData';
import { useFeaturedGuides } from '../hooks';
import { useAuth } from '../context';
import type { MainTabScreenProps } from '../types';

const { width } = Dimensions.get('window');

type Props = MainTabScreenProps<'Home'>;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Fetch featured guides from API
  const { guides: featuredGuides, loading: guidesLoading } = useFeaturedGuides();

  // Use mock data for tours (backend doesn't have tours endpoint)
  const featuredTours = MOCK_TOURS.filter((tour) => tour.featured);

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

  const handleSeeAllTours = () => {
    navigation.navigate('Search');
  };

  const handleSeeAllGuides = () => {
    navigation.navigate('Search');
  };

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '¡Buenos días';
    if (hour < 18) return '¡Buenas tardes';
    return '¡Buenas noches';
  };

  const userName = user?.firstName || 'Explorador';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Header */}
        <View style={styles.heroHeader}>
          <View style={styles.heroBackground}>
            <View style={styles.heroMountain1} />
            <View style={styles.heroMountain2} />
            <View style={styles.heroSun} />
          </View>

          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.greeting}>{getGreeting()}, {userName}! 🏕️</Text>
                <Text style={styles.title}>¿Listo para explorar?</Text>
              </View>
              <TouchableOpacity style={styles.notificationButton}>
                <Text style={styles.notificationIcon}>🔔</Text>
                <View style={styles.notificationBadge} />
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <TouchableOpacity
              style={styles.searchBar}
              onPress={handleSearchPress}
              activeOpacity={0.9}
            >
              <Text style={styles.searchIcon}>🔍</Text>
              <Text style={styles.searchPlaceholder}>Buscar guías, destinos...</Text>
              <View style={styles.searchDivider} />
              <Text style={styles.filterIcon}>⚙️</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>🌍</Text>
            <Text style={styles.statValue}>50+</Text>
            <Text style={styles.statLabel}>Destinos</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>🧭</Text>
            <Text style={styles.statValue}>200+</Text>
            <Text style={styles.statLabel}>Guías</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>⭐</Text>
            <Text style={styles.statValue}>4.9</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Explora por categoría</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {CATEGORIES.map((category) => (
              <CategoryPill
                key={category.id}
                category={category}
                selected={selectedCategory === category.id}
                onPress={() => handleCategoryPress(category.id)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Featured Tours */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Tours Destacados</Text>
              <Text style={styles.sectionSubtitle}>Experiencias únicas</Text>
            </View>
            <TouchableOpacity style={styles.seeAllButton} onPress={handleSeeAllTours}>
              <Text style={styles.seeAllText}>Ver todos</Text>
              <Text style={styles.seeAllArrow}>→</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            data={featuredTours}
            renderItem={({ item }) => (
              <TourCard tour={item} onPress={() => handleTourPress(item.id, item.title)} />
            )}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            ItemSeparatorComponent={() => <View style={styles.listSeparator} />}
          />
        </View>

        {/* Featured Guides */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Guías Expertos</Text>
              <Text style={styles.sectionSubtitle}>Locales apasionados</Text>
            </View>
            <TouchableOpacity style={styles.seeAllButton} onPress={handleSeeAllGuides}>
              <Text style={styles.seeAllText}>Ver todos</Text>
              <Text style={styles.seeAllArrow}>→</Text>
            </TouchableOpacity>
          </View>
          {guidesLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={Colors.primary} />
            </View>
          ) : featuredGuides.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.guidesContainer}
            >
              {featuredGuides.slice(0, 5).map((guide) => (
                <View key={guide.id} style={styles.compactGuideWrapper}>
                  <GuideCard
                    guide={{
                      id: guide.id,
                      name: guide.name || 'Guía',
                      avatar: guide.avatar,
                      rating: guide.rating,
                      reviewCount: guide.reviewCount,
                      location: `${guide.city}, ${guide.country}`,
                      languages: guide.languages,
                      specialties: guide.specialties,
                      bio: guide.bio,
                      pricePerHour: guide.pricePerHour,
                      currency: guide.currency,
                      verified: guide.verified,
                      featured: guide.featured,
                      available: guide.available,
                    }}
                    compact
                    onPress={() => handleGuidePress(guide.id)}
                  />
                </View>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No hay guías disponibles</Text>
            </View>
          )}
        </View>

        {/* CTA Banner */}
        <View style={styles.ctaBanner}>
          <View style={styles.ctaContent}>
            <Text style={styles.ctaEmoji}>🏔️</Text>
            <View style={styles.ctaTextContainer}>
              <Text style={styles.ctaTitle}>¿Eres guía local?</Text>
              <Text style={styles.ctaSubtitle}>Únete y comparte tu pasión</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.ctaButton}>
            <Text style={styles.ctaButtonText}>Unirse</Text>
          </TouchableOpacity>
        </View>

        {/* Recommended Guides */}
        <View style={[styles.section, styles.lastSection]}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Recomendados</Text>
              <Text style={styles.sectionSubtitle}>Para ti</Text>
            </View>
            <TouchableOpacity style={styles.seeAllButton} onPress={handleSeeAllGuides}>
              <Text style={styles.seeAllText}>Ver todos</Text>
              <Text style={styles.seeAllArrow}>→</Text>
            </TouchableOpacity>
          </View>
          {guidesLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={Colors.primary} />
            </View>
          ) : featuredGuides.length > 0 ? (
            <View style={styles.verticalList}>
              {featuredGuides.slice(0, 2).map((guide) => (
                <View key={guide.id} style={styles.verticalItem}>
                  <GuideCard
                    guide={{
                      id: guide.id,
                      name: guide.name || 'Guía',
                      avatar: guide.avatar,
                      rating: guide.rating,
                      reviewCount: guide.reviewCount,
                      location: `${guide.city}, ${guide.country}`,
                      languages: guide.languages,
                      specialties: guide.specialties,
                      bio: guide.bio,
                      pricePerHour: guide.pricePerHour,
                      currency: guide.currency,
                      verified: guide.verified,
                      featured: guide.featured,
                      available: guide.available,
                    }}
                    onPress={() => handleGuidePress(guide.id)}
                  />
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No hay guías recomendados</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  heroHeader: {
    position: 'relative',
    paddingBottom: Spacing.md,
  },
  heroBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 180,
    backgroundColor: Colors.primary,
    overflow: 'hidden',
  },
  heroMountain1: {
    position: 'absolute',
    bottom: -20,
    left: -50,
    width: width * 0.6,
    height: 100,
    backgroundColor: Colors.primaryDark,
    borderTopRightRadius: 100,
    transform: [{ rotate: '-5deg' }],
  },
  heroMountain2: {
    position: 'absolute',
    bottom: -30,
    right: -30,
    width: width * 0.5,
    height: 80,
    backgroundColor: Colors.primaryLight,
    borderTopLeftRadius: 80,
    opacity: 0.5,
  },
  heroSun: {
    position: 'absolute',
    top: 20,
    right: 30,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.secondary,
    opacity: 0.3,
  },
  headerContent: {
    padding: Spacing.lg,
    paddingTop: Spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  greeting: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  title: {
    ...Typography.h2,
    color: Colors.textInverse,
  },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationIcon: {
    fontSize: 22,
  },
  notificationBadge: {
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 16,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: Spacing.sm,
  },
  searchPlaceholder: {
    flex: 1,
    ...Typography.body,
    color: Colors.textTertiary,
  },
  searchDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.sm,
  },
  filterIcon: {
    fontSize: 18,
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: Spacing.md,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  statValue: {
    ...Typography.h4,
    color: Colors.text,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.xs,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  lastSection: {
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
    ...Typography.h4,
    color: Colors.text,
  },
  sectionSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: 8,
  },
  seeAllText: {
    ...Typography.label,
    color: Colors.primary,
  },
  seeAllArrow: {
    ...Typography.label,
    color: Colors.primary,
    marginLeft: 4,
  },
  categoriesContainer: {
    paddingHorizontal: Spacing.lg,
  },
  horizontalList: {
    paddingHorizontal: Spacing.lg,
  },
  listSeparator: {
    width: Spacing.md,
  },
  guidesContainer: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  compactGuideWrapper: {
    marginRight: Spacing.sm,
  },
  verticalList: {
    paddingHorizontal: Spacing.lg,
  },
  verticalItem: {
    marginBottom: Spacing.md,
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
  ctaBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: Colors.secondaryMuted,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.secondary + '30',
  },
  ctaContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  ctaEmoji: {
    fontSize: 32,
    marginRight: Spacing.md,
  },
  ctaTextContainer: {
    flex: 1,
  },
  ctaTitle: {
    ...Typography.labelLarge,
    color: Colors.text,
  },
  ctaSubtitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  ctaButton: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 10,
  },
  ctaButtonText: {
    ...Typography.labelLarge,
    color: Colors.textInverse,
  },
});
