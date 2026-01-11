import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { Colors, Spacing, Typography } from '../theme';
import { TourCard, GuideCard, CategoryPill } from '../components';
import { CATEGORIES, MOCK_TOURS, MOCK_GUIDES, LOCATIONS, LANGUAGES } from '../constants/mockData';
import type { MainTabScreenProps, Tour, Guide, SortOption } from '../types';

type Props = MainTabScreenProps<'Search'>;
type SearchTab = 'tours' | 'guides';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'rating', label: 'Mejor valorados' },
  { value: 'price_low', label: 'Precio: menor a mayor' },
  { value: 'price_high', label: 'Precio: mayor a menor' },
  { value: 'reviews', label: 'Más reseñas' },
];

export const SearchScreen: React.FC<Props> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<SearchTab>('tours');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('rating');
  const [showFilters, setShowFilters] = useState(false);
  const [minRating, setMinRating] = useState<number | null>(null);

  const filteredTours = useMemo(() => {
    let results = [...MOCK_TOURS];

    // Search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        (tour) =>
          tour.title.toLowerCase().includes(query) ||
          tour.location.toLowerCase().includes(query) ||
          tour.guideName.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory) {
      results = results.filter((tour) => tour.categories.includes(selectedCategory));
    }

    // Location filter
    if (selectedLocation) {
      results = results.filter((tour) => tour.location === selectedLocation);
    }

    // Rating filter
    if (minRating) {
      results = results.filter((tour) => tour.rating >= minRating);
    }

    // Sorting
    switch (sortBy) {
      case 'rating':
        results.sort((a, b) => b.rating - a.rating);
        break;
      case 'price_low':
        results.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        results.sort((a, b) => b.price - a.price);
        break;
      case 'reviews':
        results.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
    }

    return results;
  }, [searchQuery, selectedCategory, selectedLocation, sortBy, minRating]);

  const filteredGuides = useMemo(() => {
    let results = [...MOCK_GUIDES];

    // Search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        (guide) =>
          guide.name.toLowerCase().includes(query) ||
          guide.location.toLowerCase().includes(query) ||
          guide.specialties.some((s) => s.toLowerCase().includes(query))
      );
    }

    // Location filter
    if (selectedLocation) {
      results = results.filter((guide) => guide.location.includes(selectedLocation));
    }

    // Rating filter
    if (minRating) {
      results = results.filter((guide) => guide.rating >= minRating);
    }

    // Sorting
    switch (sortBy) {
      case 'rating':
        results.sort((a, b) => b.rating - a.rating);
        break;
      case 'price_low':
        results.sort((a, b) => a.pricePerHour - b.pricePerHour);
        break;
      case 'price_high':
        results.sort((a, b) => b.pricePerHour - a.pricePerHour);
        break;
      case 'reviews':
        results.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
    }

    return results;
  }, [searchQuery, selectedLocation, sortBy, minRating]);

  const handleTourPress = (tour: Tour) => {
    navigation.navigate('Details', { id: tour.id, title: tour.title });
  };

  const handleGuidePress = (guide: Guide) => {
    navigation.navigate('GuideDetail', { guideId: guide.id });
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedLocation(null);
    setMinRating(null);
    setSortBy('rating');
  };

  const activeFiltersCount = [selectedCategory, selectedLocation, minRating].filter(Boolean).length;

  const renderTourItem = ({ item }: { item: Tour }) => (
    <View style={styles.listItem}>
      <TourCard tour={item} horizontal onPress={() => handleTourPress(item)} />
    </View>
  );

  const renderGuideItem = ({ item }: { item: Guide }) => (
    <View style={styles.listItem}>
      <GuideCard guide={item} onPress={() => handleGuidePress(item)} />
    </View>
  );

  const renderFiltersModal = () => (
    <Modal visible={showFilters} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowFilters(false)}>
            <Text style={styles.modalClose}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Filtros</Text>
          <TouchableOpacity onPress={clearFilters}>
            <Text style={styles.clearFilters}>Limpiar</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          {/* Location Filter */}
          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Ubicación</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {LOCATIONS.map((location) => (
                <TouchableOpacity
                  key={location}
                  style={[
                    styles.filterChip,
                    selectedLocation === location && styles.filterChipSelected,
                  ]}
                  onPress={() =>
                    setSelectedLocation(selectedLocation === location ? null : location)
                  }
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedLocation === location && styles.filterChipTextSelected,
                    ]}
                  >
                    {location}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Rating Filter */}
          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Valoración mínima</Text>
            <View style={styles.ratingOptions}>
              {[4.5, 4.0, 3.5, 3.0].map((rating) => (
                <TouchableOpacity
                  key={rating}
                  style={[
                    styles.ratingChip,
                    minRating === rating && styles.ratingChipSelected,
                  ]}
                  onPress={() => setMinRating(minRating === rating ? null : rating)}
                >
                  <Text style={styles.starIcon}>⭐</Text>
                  <Text
                    style={[
                      styles.ratingChipText,
                      minRating === rating && styles.ratingChipTextSelected,
                    ]}
                  >
                    {rating}+
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Sort By */}
          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Ordenar por</Text>
            {SORT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.sortOption,
                  sortBy === option.value && styles.sortOptionSelected,
                ]}
                onPress={() => setSortBy(option.value)}
              >
                <Text
                  style={[
                    styles.sortOptionText,
                    sortBy === option.value && styles.sortOptionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
                {sortBy === option.value && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <View style={styles.modalFooter}>
          <TouchableOpacity
            style={styles.applyButton}
            onPress={() => setShowFilters(false)}
          >
            <Text style={styles.applyButtonText}>
              Aplicar filtros
              {activeFiltersCount > 0 && ` (${activeFiltersCount})`}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Header */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar tours, guías, ciudades..."
            placeholderTextColor={Colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[styles.filterButton, activeFiltersCount > 0 && styles.filterButtonActive]}
          onPress={() => setShowFilters(true)}
        >
          <Text style={styles.filterIcon}>⚙️</Text>
          {activeFiltersCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'tours' && styles.tabActive]}
          onPress={() => setActiveTab('tours')}
        >
          <Text style={[styles.tabText, activeTab === 'tours' && styles.tabTextActive]}>
            Tours ({filteredTours.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'guides' && styles.tabActive]}
          onPress={() => setActiveTab('guides')}
        >
          <Text style={[styles.tabText, activeTab === 'guides' && styles.tabTextActive]}>
            Guías ({filteredGuides.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Categories (only for tours) */}
      {activeTab === 'tours' && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          <TouchableOpacity
            style={[styles.categoryChip, !selectedCategory && styles.categoryChipSelected]}
            onPress={() => setSelectedCategory(null)}
          >
            <Text style={[styles.categoryText, !selectedCategory && styles.categoryTextSelected]}>
              Todos
            </Text>
          </TouchableOpacity>
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryChip,
                selectedCategory === category.id && styles.categoryChipSelected,
              ]}
              onPress={() =>
                setSelectedCategory(selectedCategory === category.id ? null : category.id)
              }
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category.id && styles.categoryTextSelected,
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Results */}
      {activeTab === 'tours' ? (
        <FlatList
          data={filteredTours}
          renderItem={renderTourItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyTitle}>No se encontraron tours</Text>
              <Text style={styles.emptyText}>
                Intenta con otros términos de búsqueda o filtros
              </Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={filteredGuides}
          renderItem={renderGuideItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyTitle}>No se encontraron guías</Text>
              <Text style={styles.emptyText}>
                Intenta con otros términos de búsqueda o filtros
              </Text>
            </View>
          }
        />
      )}

      {renderFiltersModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...Typography.body,
    color: Colors.text,
    paddingVertical: Spacing.md,
  },
  clearIcon: {
    fontSize: 16,
    color: Colors.textTertiary,
    padding: Spacing.xs,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    position: 'relative',
  },
  filterButtonActive: {
    borderColor: Colors.primary,
  },
  filterIcon: {
    fontSize: 20,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    ...Typography.labelSmall,
    color: Colors.textInverse,
    fontSize: 10,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: Colors.border,
  },
  tabActive: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    ...Typography.labelLarge,
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.primary,
  },
  categoriesContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: Spacing.sm,
  },
  categoryChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  categoryText: {
    ...Typography.label,
    color: Colors.text,
  },
  categoryTextSelected: {
    color: Colors.textInverse,
  },
  listContent: {
    padding: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  listItem: {
    marginBottom: Spacing.md,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    ...Typography.h4,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalClose: {
    fontSize: 20,
    color: Colors.text,
  },
  modalTitle: {
    ...Typography.h4,
    color: Colors.text,
  },
  clearFilters: {
    ...Typography.label,
    color: Colors.primary,
  },
  modalContent: {
    flex: 1,
    padding: Spacing.lg,
  },
  filterSection: {
    marginBottom: Spacing.xl,
  },
  filterTitle: {
    ...Typography.labelLarge,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: Spacing.sm,
  },
  filterChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    ...Typography.label,
    color: Colors.text,
  },
  filterChipTextSelected: {
    color: Colors.textInverse,
  },
  ratingOptions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  ratingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ratingChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  starIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  ratingChipText: {
    ...Typography.label,
    color: Colors.text,
  },
  ratingChipTextSelected: {
    color: Colors.textInverse,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sortOptionSelected: {
    borderBottomColor: Colors.primary,
  },
  sortOptionText: {
    ...Typography.body,
    color: Colors.text,
  },
  sortOptionTextSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
  checkmark: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '700',
  },
  modalFooter: {
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  applyButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    ...Typography.button,
    color: Colors.textInverse,
    textTransform: 'none',
  },
});
