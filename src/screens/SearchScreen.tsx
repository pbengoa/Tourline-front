import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
  Dimensions,
  Image,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Typography } from '../theme';
import { Avatar } from '../components';
import {
  CATEGORIES,
  MOCK_TOURS,
  LOCATIONS,
  LOCATION_COORDINATES,
  DEFAULT_MAP_REGION,
  MOCK_GUIDES,
} from '../constants/mockData';
import {
  guidesService,
  Guide as ApiGuide,
  SearchGuidesParams,
} from '../services';
import type { MainTabScreenProps, Tour, Guide, SortOption } from '../types';

type Props = MainTabScreenProps<'Search'>;
type SearchTab = 'tours' | 'guides';
type ViewMode = 'list' | 'map';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'rating', label: 'Mejor valorados' },
  { value: 'price_low', label: 'Precio: menor a mayor' },
  { value: 'price_high', label: 'Precio: mayor a menor' },
  { value: 'reviews', label: 'Más reseñas' },
];

export const SearchScreen: React.FC<Props> = ({ navigation }) => {
  const mapRef = useRef<MapView>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<SearchTab>('tours');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('rating');
  const [showFilters, setShowFilters] = useState(false);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [selectedMapItem, setSelectedMapItem] = useState<Tour | Guide | null>(null);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const cardAnimation = useRef(new Animated.Value(0)).current;

  const [apiGuides, setApiGuides] = useState<ApiGuide[]>([]);
  const [guidesLoading, setGuidesLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        try {
          const location = await Location.getCurrentPositionAsync({});
          setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        } catch (error) {
          console.log('Error getting location:', error);
        }
      }
    })();
  }, []);

  useEffect(() => {
    if (selectedMapItem) {
      Animated.spring(cardAnimation, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } else {
      cardAnimation.setValue(0);
    }
  }, [selectedMapItem, cardAnimation]);

  const fetchGuides = useCallback(async () => {
    setGuidesLoading(true);
    try {
      const params: SearchGuidesParams = { limit: 50 };
      if (searchQuery.trim()) params.query = searchQuery.trim();
      if (selectedLocation) params.city = selectedLocation;
      if (minRating) params.minRating = minRating;

      const response = await guidesService.searchGuides(params);
      if (response.success) {
        setApiGuides(response.data);
      }
    } catch (err) {
      setApiGuides([]);
    } finally {
      setGuidesLoading(false);
    }
  }, [searchQuery, selectedLocation, minRating]);

  useEffect(() => {
    if (activeTab === 'guides') {
      const timeoutId = setTimeout(fetchGuides, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [activeTab, fetchGuides]);

  const transformedGuides: Guide[] = useMemo(() => {
    if (apiGuides.length > 0) {
      return apiGuides.map((guide) => ({
        id: guide.id,
        name: guide.user ? `${guide.user.firstName} ${guide.user.lastName}` : guide.name || 'Guía',
        avatar: guide.user?.avatar || guide.avatar,
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
      }));
    }
    return MOCK_GUIDES;
  }, [apiGuides]);

  const filteredTours = useMemo(() => {
    let results = [...MOCK_TOURS];
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        (tour) =>
          tour.title.toLowerCase().includes(query) ||
          tour.location.toLowerCase().includes(query)
      );
    }
    if (selectedCategory) {
      results = results.filter((tour) => tour.categories.includes(selectedCategory));
    }
    if (selectedLocation) {
      results = results.filter((tour) => tour.location.includes(selectedLocation));
    }
    if (minRating) {
      results = results.filter((tour) => tour.rating >= minRating);
    }
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

  const mapMarkers = useMemo(() => {
    const items = activeTab === 'guides' ? transformedGuides : filteredTours;
    const markers: {
      id: string;
      coordinate: { latitude: number; longitude: number };
      item: Tour | Guide;
      type: 'tour' | 'guide';
    }[] = [];

    items.forEach((item) => {
      const locationKey = item.location;
      let coords = LOCATION_COORDINATES[locationKey];
      if (!coords) {
        const cityMatch = Object.keys(LOCATION_COORDINATES).find(
          (key) => locationKey.includes(key) || key.includes(locationKey.split(',')[0])
        );
        if (cityMatch) coords = LOCATION_COORDINATES[cityMatch];
      }
      if (coords) {
        markers.push({
          id: item.id,
          coordinate: {
            latitude: coords.latitude + (Math.random() - 0.5) * 0.01,
            longitude: coords.longitude + (Math.random() - 0.5) * 0.01,
          },
          item,
          type: activeTab === 'guides' ? 'guide' : 'tour',
        });
      }
    });
    return markers;
  }, [activeTab, transformedGuides, filteredTours]);

  const handleTourPress = (tour: Tour) => {
    navigation.navigate('Details', { id: tour.id, title: tour.title });
  };

  const handleGuidePress = (guide: Guide) => {
    navigation.navigate('GuideDetail', { guideId: guide.id });
  };

  const fitToMarkers = () => {
    if (mapRef.current && mapMarkers.length > 0) {
      const coordinates = mapMarkers.map((m) => m.coordinate);
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 60, right: 40, bottom: 160, left: 40 },
        animated: true,
      });
    }
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedLocation(null);
    setMinRating(null);
    setSortBy('rating');
  };

  const activeFiltersCount = [selectedCategory, selectedLocation, minRating].filter(Boolean).length;

  const formatPrice = (price: number, currency: string) => {
    if (currency === 'CLP') return `$${price.toLocaleString('es-CL')}`;
    return `${price}€`;
  };

  // Tour Card Component
  const TourListCard = ({ item }: { item: Tour }) => (
    <TouchableOpacity
      style={styles.tourCard}
      onPress={() => handleTourPress(item)}
      activeOpacity={0.9}
    >
      <View style={styles.tourImageContainer}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.tourImage} />
        ) : (
          <LinearGradient colors={[Colors.primaryLight, Colors.primary]} style={styles.tourImagePlaceholder}>
            <Text style={styles.tourPlaceholderIcon}>🏔️</Text>
          </LinearGradient>
        )}
        {item.featured && (
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredText}>⭐</Text>
          </View>
        )}
      </View>
      <View style={styles.tourContent}>
        <Text style={styles.tourTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.tourLocation}>📍 {item.location}</Text>
        <View style={styles.tourMeta}>
          <View style={styles.tourRating}>
            <Text style={styles.tourStar}>★</Text>
            <Text style={styles.tourRatingText}>{item.rating.toFixed(1)}</Text>
          </View>
          <Text style={styles.tourDuration}>⏱️ {item.duration}</Text>
        </View>
        <Text style={styles.tourPrice}>{formatPrice(item.price, item.currency)}</Text>
      </View>
    </TouchableOpacity>
  );

  // Guide Card Component
  const GuideListCard = ({ item }: { item: Guide }) => (
    <TouchableOpacity
      style={styles.guideCard}
      onPress={() => handleGuidePress(item)}
      activeOpacity={0.9}
    >
      <Avatar uri={item.avatar} name={item.name} size="large" showBadge={item.verified} badgeType="verified" />
      <View style={styles.guideContent}>
        <Text style={styles.guideName}>{item.name}</Text>
        <Text style={styles.guideLocation}>📍 {item.location}</Text>
        <View style={styles.guideMeta}>
          <View style={styles.guideRating}>
            <Text style={styles.guideStar}>★</Text>
            <Text style={styles.guideRatingText}>{item.rating?.toFixed(1) || 'N/A'}</Text>
          </View>
          <Text style={styles.guideReviews}>({item.reviewCount || 0})</Text>
        </View>
      </View>
      <View style={styles.guidePriceContainer}>
        <Text style={styles.guidePrice}>{formatPrice(item.pricePerHour, item.currency)}</Text>
        <Text style={styles.guidePriceLabel}>/hora</Text>
      </View>
    </TouchableOpacity>
  );

  // Map View
  const renderMapView = () => (
    <View style={styles.mapContainer}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={DEFAULT_MAP_REGION}
        showsUserLocation
        showsMyLocationButton={false}
        onMapReady={() => setTimeout(fitToMarkers, 500)}
        onPress={() => setSelectedMapItem(null)}
      >
        {mapMarkers.map((marker) => {
          const isSelected = selectedMapItem?.id === marker.id;
          const price = marker.type === 'guide'
            ? (marker.item as Guide).pricePerHour
            : (marker.item as Tour).price;
          const currency = marker.type === 'guide'
            ? (marker.item as Guide).currency
            : (marker.item as Tour).currency;

          return (
            <Marker
              key={marker.id}
              coordinate={marker.coordinate}
              onPress={() => setSelectedMapItem(marker.item)}
            >
              <View style={[styles.priceMarker, isSelected && styles.priceMarkerSelected]}>
                <Text style={[styles.priceMarkerText, isSelected && styles.priceMarkerTextSelected]}>
                  {formatPrice(price, currency)}
                </Text>
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* Map Controls */}
      <View style={styles.mapControls}>
        <TouchableOpacity style={styles.mapBtn} onPress={fitToMarkers}>
          <Text style={styles.mapBtnIcon}>🎯</Text>
        </TouchableOpacity>
        {userLocation && (
          <TouchableOpacity
            style={styles.mapBtn}
            onPress={() => mapRef.current?.animateToRegion({ ...userLocation, latitudeDelta: 0.5, longitudeDelta: 0.5 }, 500)}
          >
            <Text style={styles.mapBtnIcon}>📍</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.mapBtn}
          onPress={() => mapRef.current?.animateToRegion(DEFAULT_MAP_REGION, 500)}
        >
          <Text style={styles.mapBtnIcon}>🇨🇱</Text>
        </TouchableOpacity>
      </View>

      {/* Results Badge */}
      <View style={styles.mapBadge}>
        <Text style={styles.mapBadgeText}>{mapMarkers.length} {activeTab === 'guides' ? 'guías' : 'tours'}</Text>
      </View>

      {/* Selected Card */}
      {selectedMapItem && (
        <Animated.View style={[styles.selectedCard, { opacity: cardAnimation, transform: [{ translateY: cardAnimation.interpolate({ inputRange: [0, 1], outputRange: [100, 0] }) }] }]}>
          <TouchableOpacity style={styles.selectedClose} onPress={() => setSelectedMapItem(null)}>
            <Text style={styles.selectedCloseText}>✕</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.selectedContent}
            onPress={() => activeTab === 'guides' ? handleGuidePress(selectedMapItem as Guide) : handleTourPress(selectedMapItem as Tour)}
          >
            {activeTab === 'tours' ? (
              <View style={styles.selectedRow}>
                {(selectedMapItem as Tour).image ? (
                  <Image source={{ uri: (selectedMapItem as Tour).image }} style={styles.selectedImage} />
                ) : (
                  <View style={styles.selectedImagePlaceholder}><Text>🏔️</Text></View>
                )}
                <View style={styles.selectedInfo}>
                  <Text style={styles.selectedTitle} numberOfLines={2}>{(selectedMapItem as Tour).title}</Text>
                  <Text style={styles.selectedSubtitle}>📍 {(selectedMapItem as Tour).location}</Text>
                  <View style={styles.selectedMeta}>
                    <Text style={styles.selectedRating}>⭐ {(selectedMapItem as Tour).rating.toFixed(1)}</Text>
                    <Text style={styles.selectedDuration}>⏱️ {(selectedMapItem as Tour).duration}</Text>
                  </View>
                </View>
                <View style={styles.selectedPriceCol}>
                  <Text style={styles.selectedPrice}>{formatPrice((selectedMapItem as Tour).price, (selectedMapItem as Tour).currency)}</Text>
                  <Text style={styles.selectedCTA}>Ver →</Text>
                </View>
              </View>
            ) : (
              <View style={styles.selectedRow}>
                <Avatar uri={(selectedMapItem as Guide).avatar} name={(selectedMapItem as Guide).name} size="large" />
                <View style={styles.selectedInfo}>
                  <Text style={styles.selectedTitle}>{(selectedMapItem as Guide).name}</Text>
                  <Text style={styles.selectedSubtitle}>📍 {(selectedMapItem as Guide).location}</Text>
                  <Text style={styles.selectedRating}>⭐ {(selectedMapItem as Guide).rating?.toFixed(1)} ({(selectedMapItem as Guide).reviewCount})</Text>
                </View>
                <View style={styles.selectedPriceCol}>
                  <Text style={styles.selectedPrice}>{formatPrice((selectedMapItem as Guide).pricePerHour, (selectedMapItem as Guide).currency)}</Text>
                  <Text style={styles.selectedPriceLabel}>/hora</Text>
                  <Text style={styles.selectedCTA}>Ver →</Text>
                </View>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );

  // Filters Modal
  const renderFiltersModal = () => (
    <Modal visible={showFilters} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowFilters(false)}>
            <Text style={styles.modalClose}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Filtros</Text>
          <TouchableOpacity onPress={clearFilters}>
            <Text style={styles.modalClear}>Limpiar</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.modalBody}>
          <Text style={styles.filterLabel}>Ubicación</Text>
          <View style={styles.filterChips}>
            {LOCATIONS.map((loc) => (
              <TouchableOpacity
                key={loc}
                style={[styles.filterChip, selectedLocation === loc && styles.filterChipActive]}
                onPress={() => setSelectedLocation(selectedLocation === loc ? null : loc)}
              >
                <Text style={[styles.filterChipText, selectedLocation === loc && styles.filterChipTextActive]}>{loc}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.filterLabel}>Valoración mínima</Text>
          <View style={styles.filterChips}>
            {[4.5, 4.0, 3.5].map((r) => (
              <TouchableOpacity
                key={r}
                style={[styles.filterChip, minRating === r && styles.filterChipActive]}
                onPress={() => setMinRating(minRating === r ? null : r)}
              >
                <Text style={[styles.filterChipText, minRating === r && styles.filterChipTextActive]}>⭐ {r}+</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.filterLabel}>Ordenar por</Text>
          {SORT_OPTIONS.map((opt) => (
            <TouchableOpacity key={opt.value} style={styles.sortRow} onPress={() => setSortBy(opt.value)}>
              <Text style={[styles.sortText, sortBy === opt.value && styles.sortTextActive]}>{opt.label}</Text>
              {sortBy === opt.value && <Text style={styles.sortCheck}>✓</Text>}
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={styles.modalFooter}>
          <TouchableOpacity style={styles.applyBtn} onPress={() => setShowFilters(false)}>
            <Text style={styles.applyBtnText}>Aplicar{activeFiltersCount > 0 && ` (${activeFiltersCount})`}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );

  const currentData = activeTab === 'tours' ? filteredTours : transformedGuides;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Explorar</Text>
        <TouchableOpacity
          style={[styles.filterBtn, activeFiltersCount > 0 && styles.filterBtnActive]}
          onPress={() => setShowFilters(true)}
        >
          <Text style={styles.filterBtnIcon}>⚙️</Text>
          {activeFiltersCount > 0 && (
            <View style={styles.filterBtnBadge}>
              <Text style={styles.filterBtnBadgeText}>{activeFiltersCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar tours, guías..."
          placeholderTextColor={Colors.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={styles.clearBtn}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tabs + View Toggle */}
      <View style={styles.controlsRow}>
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'tours' && styles.tabActive]}
            onPress={() => setActiveTab('tours')}
          >
            <Text style={[styles.tabText, activeTab === 'tours' && styles.tabTextActive]}>🏔️ Tours</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'guides' && styles.tabActive]}
            onPress={() => setActiveTab('guides')}
          >
            <Text style={[styles.tabText, activeTab === 'guides' && styles.tabTextActive]}>👤 Guías</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[styles.viewBtn, viewMode === 'list' && styles.viewBtnActive]}
            onPress={() => setViewMode('list')}
          >
            <Text style={styles.viewBtnIcon}>📋</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewBtn, viewMode === 'map' && styles.viewBtnActive]}
            onPress={() => setViewMode('map')}
          >
            <Text style={styles.viewBtnIcon}>🗺️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesScroll}
        contentContainerStyle={styles.categoriesContent}
      >
        <TouchableOpacity
          style={[styles.catPill, !selectedCategory && styles.catPillActive]}
          onPress={() => setSelectedCategory(null)}
        >
          <Text style={[styles.catPillText, !selectedCategory && styles.catPillTextActive]}>Todos</Text>
        </TouchableOpacity>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.catPill, selectedCategory === cat.id && styles.catPillActive]}
            onPress={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
          >
            <Text style={styles.catPillIcon}>{cat.icon}</Text>
            <Text style={[styles.catPillText, selectedCategory === cat.id && styles.catPillTextActive]}>{cat.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      {viewMode === 'map' ? (
        renderMapView()
      ) : guidesLoading && activeTab === 'guides' ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={currentData as any[]}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) =>
            activeTab === 'tours' ? <TourListCard item={item as Tour} /> : <GuideListCard item={item as Guide} />
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyText}>No se encontraron resultados</Text>
            </View>
          }
        />
      )}

      {renderFiltersModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  title: { ...Typography.h2, color: Colors.text },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryMuted },
  filterBtnIcon: { fontSize: 20 },
  filterBtnBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBtnBadgeText: { fontSize: 10, color: '#fff', fontWeight: '700' },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.card,
    borderRadius: 14,
    paddingHorizontal: Spacing.md,
    height: 48,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIcon: { fontSize: 18, marginRight: 10 },
  searchInput: { flex: 1, ...Typography.body, color: Colors.text },
  clearBtn: { fontSize: 16, color: Colors.textTertiary, padding: 4 },

  // Controls
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  tabActive: { backgroundColor: Colors.primary },
  tabText: { ...Typography.label, color: Colors.textSecondary },
  tabTextActive: { color: '#fff', fontWeight: '600' },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  viewBtn: { width: 40, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  viewBtnActive: { backgroundColor: Colors.primary },
  viewBtnIcon: { fontSize: 18 },

  // Categories
  categoriesScroll: { 
    flexGrow: 0,
    flexShrink: 0,
    marginBottom: Spacing.sm,
  },
  categoriesContent: { 
    paddingHorizontal: Spacing.lg, 
    paddingVertical: 6,
    alignItems: 'center',
  },
  catPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
    height: 36,
  },
  catPillActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  catPillIcon: { fontSize: 14, marginRight: 5 },
  catPillText: { ...Typography.label, color: Colors.text, fontSize: 12 },
  catPillTextActive: { color: '#fff', fontWeight: '600' },

  // List
  listContent: { paddingHorizontal: Spacing.lg, paddingBottom: 120 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { ...Typography.body, color: Colors.textSecondary },

  // Tour Card
  tourCard: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tourImageContainer: { width: 110, height: 110 },
  tourImage: { width: '100%', height: '100%' },
  tourImagePlaceholder: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  tourPlaceholderIcon: { fontSize: 32 },
  featuredBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: Colors.secondary,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredText: { fontSize: 12 },
  tourContent: { flex: 1, padding: 12, justifyContent: 'space-between' },
  tourTitle: { ...Typography.labelLarge, color: Colors.text, marginBottom: 4 },
  tourLocation: { ...Typography.bodySmall, color: Colors.textSecondary, marginBottom: 4 },
  tourMeta: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  tourRating: { flexDirection: 'row', alignItems: 'center', marginRight: 12 },
  tourStar: { fontSize: 12, color: Colors.warning, marginRight: 3 },
  tourRatingText: { ...Typography.labelSmall, color: Colors.text, fontWeight: '600' },
  tourDuration: { ...Typography.bodySmall, color: Colors.textTertiary },
  tourPrice: { ...Typography.h4, color: Colors.primary, fontWeight: '700' },

  // Guide Card
  guideCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  guideContent: { flex: 1, marginLeft: 12 },
  guideName: { ...Typography.labelLarge, color: Colors.text, marginBottom: 2 },
  guideLocation: { ...Typography.bodySmall, color: Colors.textSecondary, marginBottom: 4 },
  guideMeta: { flexDirection: 'row', alignItems: 'center' },
  guideRating: { flexDirection: 'row', alignItems: 'center' },
  guideStar: { fontSize: 12, color: Colors.warning, marginRight: 3 },
  guideRatingText: { ...Typography.labelSmall, color: Colors.text, fontWeight: '600' },
  guideReviews: { ...Typography.bodySmall, color: Colors.textTertiary, marginLeft: 4 },
  guidePriceContainer: { alignItems: 'flex-end' },
  guidePrice: { ...Typography.h4, color: Colors.primary, fontWeight: '700' },
  guidePriceLabel: { ...Typography.caption, color: Colors.textTertiary },

  // Map
  mapContainer: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },
  mapControls: {
    position: 'absolute',
    right: 16,
    top: 16,
    backgroundColor: Colors.card,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  mapBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  mapBtnIcon: { fontSize: 20 },
  mapBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: Colors.card,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mapBadgeText: { ...Typography.label, color: Colors.text, fontWeight: '600' },
  priceMarker: {
    backgroundColor: Colors.card,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  priceMarkerSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  priceMarkerText: { ...Typography.labelSmall, color: Colors.text, fontWeight: '700' },
  priceMarkerTextSelected: { color: '#fff' },

  // Selected Card
  selectedCard: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 16,
    backgroundColor: Colors.card,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  selectedClose: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCloseText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  selectedContent: { padding: 14 },
  selectedRow: { flexDirection: 'row', alignItems: 'center' },
  selectedImage: { width: 70, height: 70, borderRadius: 12 },
  selectedImagePlaceholder: { width: 70, height: 70, borderRadius: 12, backgroundColor: Colors.primaryMuted, justifyContent: 'center', alignItems: 'center' },
  selectedInfo: { flex: 1, marginLeft: 12 },
  selectedTitle: { ...Typography.labelLarge, color: Colors.text, marginBottom: 2 },
  selectedSubtitle: { ...Typography.bodySmall, color: Colors.textSecondary, marginBottom: 4 },
  selectedMeta: { flexDirection: 'row', alignItems: 'center' },
  selectedRating: { ...Typography.labelSmall, color: Colors.text, marginRight: 10 },
  selectedDuration: { ...Typography.bodySmall, color: Colors.textTertiary },
  selectedPriceCol: { alignItems: 'flex-end' },
  selectedPrice: { ...Typography.h4, color: Colors.primary, fontWeight: '700' },
  selectedPriceLabel: { ...Typography.caption, color: Colors.textTertiary },
  selectedCTA: { ...Typography.labelSmall, color: Colors.primary, marginTop: 4 },

  // Modal
  modalContainer: { flex: 1, backgroundColor: Colors.background },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalClose: { fontSize: 24, color: Colors.text },
  modalTitle: { ...Typography.h3, color: Colors.text },
  modalClear: { ...Typography.label, color: Colors.primary },
  modalBody: { flex: 1, padding: Spacing.lg },
  modalFooter: { padding: Spacing.lg, borderTopWidth: 1, borderTopColor: Colors.border },
  filterLabel: { ...Typography.labelLarge, color: Colors.text, marginBottom: 12, marginTop: 8 },
  filterChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterChipText: { ...Typography.label, color: Colors.text },
  filterChipTextActive: { color: '#fff' },
  sortRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  sortText: { ...Typography.body, color: Colors.text },
  sortTextActive: { color: Colors.primary, fontWeight: '600' },
  sortCheck: { ...Typography.h4, color: Colors.primary },
  applyBtn: { backgroundColor: Colors.primary, paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  applyBtnText: { ...Typography.labelLarge, color: '#fff', fontWeight: '600' },
});
