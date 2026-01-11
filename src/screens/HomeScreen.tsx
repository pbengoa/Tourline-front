import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
  TextInput,
} from 'react-native';
import { Colors, Spacing, Typography } from '../theme';
import { GuideCard, TourCard, CategoryPill } from '../components';
import { CATEGORIES, MOCK_GUIDES, MOCK_TOURS } from '../constants/mockData';
import type { MainTabScreenProps } from '../types';

type Props = MainTabScreenProps<'Home'>;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const featuredTours = MOCK_TOURS.filter((tour) => tour.featured);
  const featuredGuides = MOCK_GUIDES.filter((guide) => guide.featured);

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
    // Navigate to search with category filter
    navigation.navigate('Search');
  };

  const handleSeeAllTours = () => {
    navigation.navigate('Search');
  };

  const handleSeeAllGuides = () => {
    navigation.navigate('Search');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>¡Hola! 👋</Text>
              <Text style={styles.title}>Encuentra tu guía perfecto</Text>
            </View>
            <TouchableOpacity style={styles.notificationButton}>
              <Text style={styles.notificationIcon}>🔔</Text>
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <TouchableOpacity
            style={styles.searchBar}
            onPress={handleSearchPress}
            activeOpacity={0.7}
          >
            <Text style={styles.searchIcon}>🔍</Text>
            <Text style={styles.searchPlaceholder}>
              Buscar tours, guías o ciudades...
            </Text>
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categorías</Text>
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
            <Text style={styles.sectionTitle}>Tours Destacados</Text>
            <TouchableOpacity onPress={handleSeeAllTours}>
              <Text style={styles.seeAllText}>Ver todos</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            data={featuredTours}
            renderItem={({ item }) => (
              <TourCard
                tour={item}
                onPress={() => handleTourPress(item.id, item.title)}
              />
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
            <Text style={styles.sectionTitle}>Guías Populares</Text>
            <TouchableOpacity onPress={handleSeeAllGuides}>
              <Text style={styles.seeAllText}>Ver todos</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.guidesContainer}
          >
            {featuredGuides.map((guide) => (
              <View key={guide.id} style={styles.compactGuideWrapper}>
                <GuideCard
                  guide={guide}
                  compact
                  onPress={() => handleGuidePress(guide.id)}
                />
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Top Rated Tours */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mejor Valorados</Text>
            <TouchableOpacity onPress={handleSeeAllTours}>
              <Text style={styles.seeAllText}>Ver todos</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.verticalList}>
            {MOCK_TOURS.slice(0, 3).map((tour) => (
              <View key={tour.id} style={styles.verticalItem}>
                <TourCard
                  tour={tour}
                  horizontal
                  onPress={() => handleTourPress(tour.id, tour.title)}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Popular Guides Full Cards */}
        <View style={[styles.section, styles.lastSection]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Guías Recomendados</Text>
            <TouchableOpacity onPress={handleSeeAllGuides}>
              <Text style={styles.seeAllText}>Ver todos</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.verticalList}>
            {MOCK_GUIDES.slice(0, 2).map((guide) => (
              <View key={guide.id} style={styles.verticalItem}>
                <GuideCard
                  guide={guide}
                  onPress={() => handleGuidePress(guide.id)}
                />
              </View>
            ))}
          </View>
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
  header: {
    padding: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  greeting: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  title: {
    ...Typography.h2,
    color: Colors.text,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  notificationIcon: {
    fontSize: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: Spacing.sm,
  },
  searchPlaceholder: {
    ...Typography.body,
    color: Colors.textTertiary,
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
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  seeAllText: {
    ...Typography.label,
    color: Colors.primary,
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
    gap: Spacing.lg,
  },
  compactGuideWrapper: {
    marginRight: Spacing.md,
  },
  verticalList: {
    paddingHorizontal: Spacing.lg,
  },
  verticalItem: {
    marginBottom: Spacing.md,
  },
});
