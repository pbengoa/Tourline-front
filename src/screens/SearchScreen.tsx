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
  Animated,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';

// Blurhash placeholder
const BLURHASH = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Typography } from '../theme';
import { Avatar } from '../components';
import {
  CATEGORIES,
  LOCATIONS,
  LOCATION_COORDINATES,
  DEFAULT_MAP_REGION,
} from '../constants/mockData';
import {
  toursService,
  companiesService,
  ApiTour,
  SearchToursParams,
} from '../services';
import type { Company as ApiCompany, SearchCompaniesParams } from '../services/companiesService';
import { CompanyCard } from '../components';
import type { MainTabScreenProps, Tour, Guide, SortOption } from '../types';
import { useDebounce } from '../hooks/useDebounce';

type Props = MainTabScreenProps<'Search'>;
type SearchTab = 'tours' | 'companies';
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
  const debouncedSearchQuery = useDebounce(searchQuery, 300); // Debounce search
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

  const [apiCompanies, setApiCompanies] = useState<ApiCompany[]>([]);
  const [companiesLoading, setCompaniesLoading] = useState(false);

  // Memoized keyExtractors for FlatList performance
  const tourKeyExtractor = useCallback((item: Tour) => item.id, []);
  const companyKeyExtractor = useCallback((item: ApiCompany) => item.id, []);
  
  const [apiTours, setApiTours] = useState<ApiTour[]>([]);
  const [toursLoading, setToursLoading] = useState(false);

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
    console.log('🗺️ selectedMapItem changed:', selectedMapItem?.id, selectedMapItem ? 'showing card' : 'hiding card');
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

  const fetchCompanies = useCallback(async () => {
    setCompaniesLoading(true);
    try {
      const params: SearchCompaniesParams = { limit: 50 };
      if (searchQuery.trim()) params.query = searchQuery.trim();
      if (selectedLocation) params.city = selectedLocation;
      if (minRating) params.minRating = minRating;

      const response = await companiesService.searchCompanies(params);
      if (response.success && response.data?.companies) {
        setApiCompanies(response.data.companies);
      }
    } catch (err) {
      setApiCompanies([]);
    } finally {
      setCompaniesLoading(false);
    }
  }, [searchQuery, selectedLocation, minRating]);

  const fetchTours = useCallback(async () => {
    setToursLoading(true);
    try {
      const params: SearchToursParams = { limit: 50 };
      if (searchQuery.trim()) params.query = searchQuery.trim();
      if (selectedLocation) params.city = selectedLocation;
      if (minRating) params.minRating = minRating;
      if (selectedCategory) params.category = selectedCategory;
      
      // Map sort options
      if (sortBy === 'rating') {
        params.sortBy = 'rating';
        params.sortOrder = 'desc';
      } else if (sortBy === 'price_low') {
        params.sortBy = 'price';
        params.sortOrder = 'asc';
      } else if (sortBy === 'price_high') {
        params.sortBy = 'price';
        params.sortOrder = 'desc';
      } else if (sortBy === 'reviews') {
        params.sortBy = 'reviews';
        params.sortOrder = 'desc';
      }

      const response = await toursService.searchTours(params);
      if (response.success) {
        setApiTours(response.data);
        // Debug: log cities from API
        console.log('Tours from API:', response.data.map(t => ({
          id: t.id,
          title: t.title,
          city: t.city,
          hasCoords: !!(t.meetingPointLat && t.meetingPointLng)
        })));
      }
    } catch (err) {
      console.log('Error fetching tours:', err);
      setApiTours([]);
    } finally {
      setToursLoading(false);
    }
  }, [searchQuery, selectedLocation, minRating, selectedCategory, sortBy]);

  useEffect(() => {
    if (activeTab === 'companies') {
      const timeoutId = setTimeout(fetchCompanies, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [activeTab, fetchCompanies]);

  useEffect(() => {
    if (activeTab === 'tours') {
      const timeoutId = setTimeout(fetchTours, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [activeTab, fetchTours]);

  // Companies are used directly without transformation

  // Helper to format duration from minutes to readable string
  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) return `${hours} hora${hours > 1 ? 's' : ''}`;
    return `${hours}h ${mins}min`;
  };

  // Store raw tour coordinates from API
  const tourCoordinatesMap = useMemo(() => {
    const coordMap: { [tourId: string]: { lat: number; lng: number } } = {};
    apiTours.forEach((tour) => {
      if (tour.meetingPointLat && tour.meetingPointLng) {
        coordMap[tour.id] = {
          lat: tour.meetingPointLat,
          lng: tour.meetingPointLng,
        };
      }
    });
    return coordMap;
  }, [apiTours]);

  const transformedTours: Tour[] = useMemo(() => {
    return apiTours.map((tour) => {
      // Use company info (NEW) or fallback to guide info
      const companyName = tour.company?.name || 'Empresa';
      const companyLogo = tour.company?.logoUrl;

      return {
        id: tour.id,
        title: tour.title || 'Tour',
        description: tour.description || '',
        image: tour.images?.[0],
        companyId: tour.companyId || tour.company?.id,
        companyName,
        companyLogo,
        location: tour.city || '',
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
  }, [apiTours]);

  // Helper function to find coordinates for a location string
  const findCoordinates = useCallback(
    (locationString: string): { latitude: number; longitude: number } | null => {
      // Direct match
      if (LOCATION_COORDINATES[locationString]) {
        return LOCATION_COORDINATES[locationString];
      }

      // Try with ", Chile" suffix
      const withChile = `${locationString}, Chile`;
      if (LOCATION_COORDINATES[withChile]) {
        return LOCATION_COORDINATES[withChile];
      }

      // Extract city part (before comma)
      const cityPart = locationString.split(',')[0].trim();
      if (LOCATION_COORDINATES[cityPart]) {
        return LOCATION_COORDINATES[cityPart];
      }

      // Fuzzy match - check if any key contains or is contained by the search string
      const locationLower = locationString.toLowerCase();
      const cityLower = cityPart.toLowerCase();

      for (const [key, coords] of Object.entries(LOCATION_COORDINATES)) {
        const keyLower = key.toLowerCase();
        if (
          keyLower.includes(cityLower) ||
          cityLower.includes(keyLower.split(',')[0])
        ) {
          return coords;
        }
      }

      return null;
    },
    []
  );

  // Map markers only for tours (companies don't use map view)
  const mapMarkers = useMemo(() => {
    const markers: {
      id: string;
      coordinate: { latitude: number; longitude: number };
      item: Tour;
      type: 'tour';
    }[] = [];

    // Only create markers for tours
    transformedTours.forEach((tour) => {
      let coords: { latitude: number; longitude: number } | null = null;

      // First try: use backend coordinates if available
      const backendCoords = tourCoordinatesMap[tour.id];
      if (backendCoords) {
        coords = { latitude: backendCoords.lat, longitude: backendCoords.lng };
      }

      // Second try: find from location string
      if (!coords) {
        coords = findCoordinates(tour.location);
      }

      if (coords) {
        // Add small random offset to prevent overlapping markers
        const offset = {
          latitude: (Math.random() - 0.5) * 0.008,
          longitude: (Math.random() - 0.5) * 0.008,
        };
        markers.push({
          id: tour.id,
          coordinate: {
            latitude: coords.latitude + offset.latitude,
            longitude: coords.longitude + offset.longitude,
          },
          item: tour,
          type: 'tour',
        });
      }
    });

    // Debug: log markers info
    console.log(`🗺️ Map markers: ${markers.length} of ${transformedTours.length} tours`);
    if (markers.length === 0 && transformedTours.length > 0) {
      console.log('⚠️ Tours without coordinates:');
      transformedTours.forEach((t) => console.log(`  - ${t.title}: "${t.location}"`));
    }
    
    return markers;
  }, [transformedTours, tourCoordinatesMap, findCoordinates]);

  const handleTourPress = (tour: Tour) => {
    console.log('🎯 handleTourPress called with tour:', tour.id, tour.title);
    navigation.navigate('Details', { id: tour.id, title: tour.title });
  };

  const handleCompanyPress = (company: ApiCompany) => {
    navigation.navigate('CompanyDetail', { companyId: company.id });
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
          <Image
            source={item.image}
            style={styles.tourImage}
            contentFit="cover"
            placeholder={BLURHASH}
            transition={200}
            cachePolicy="memory-disk"
          />
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

  // Map View (only for tours)
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
          const tour = marker.item;

          return (
            <Marker
              key={marker.id}
              coordinate={marker.coordinate}
              tracksViewChanges={false}
              onPress={(e) => {
                e.stopPropagation();
                console.log('🗺️ Marker pressed:', marker.id);
                setSelectedMapItem(tour);
              }}
            >
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  console.log('🗺️ TouchableOpacity pressed:', marker.id);
                  setSelectedMapItem(tour);
                }}
              >
                <View style={[styles.priceMarker, isSelected && styles.priceMarkerSelected]}>
                  <Text style={[styles.priceMarkerText, isSelected && styles.priceMarkerTextSelected]}>
                    {formatPrice(tour.price, tour.currency)}
                  </Text>
                </View>
              </TouchableOpacity>
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
        <Text style={styles.mapBadgeText}>{mapMarkers.length} tours</Text>
      </View>

      {/* Selected Card - Diseño inmersivo */}
      {selectedMapItem && (
        <Animated.View
          style={[
            styles.selectedCard,
            {
              opacity: cardAnimation,
              transform: [
                {
                  translateY: cardAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [120, 0],
                  }),
                },
                {
                  scale: cardAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.9, 1],
                  }),
                },
              ],
            },
          ]}
        >
          {/* Tour Card - Diseño con imagen hero */}
          <TouchableOpacity
            activeOpacity={0.95}
            onPress={() => {
              console.log('🎯 Selected card pressed, tour:', (selectedMapItem as Tour)?.id);
              handleTourPress(selectedMapItem as Tour);
            }}
            style={styles.selectedTourCard}
          >
            {/* Imagen Hero */}
            <View style={styles.selectedHeroContainer}>
              {(selectedMapItem as Tour).image ? (
                <Image
                  source={(selectedMapItem as Tour).image}
                  style={styles.selectedHeroImage}
                  contentFit="cover"
                  placeholder={BLURHASH}
                  transition={200}
                  cachePolicy="memory-disk"
                />
              ) : (
                <LinearGradient
                  colors={[Colors.primaryLight, Colors.primary]}
                  style={styles.selectedHeroPlaceholder}
                >
                  <Text style={styles.selectedHeroEmoji}>🏔️</Text>
                </LinearGradient>
              )}
              {/* Gradiente sobre imagen */}
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.7)']}
                style={styles.selectedHeroGradient}
              />
              {/* Badges sobre imagen */}
              <View style={styles.selectedBadgesRow}>
                {(selectedMapItem as Tour).featured && (
                  <View style={styles.selectedFeaturedBadge}>
                    <Text style={styles.selectedFeaturedText}>⭐ Destacado</Text>
                  </View>
                )}
                <View style={styles.selectedDurationBadge}>
                  <Text style={styles.selectedDurationText}>
                    ⏱️ {(selectedMapItem as Tour).duration}
                  </Text>
                </View>
              </View>
              {/* Botón cerrar */}
              <TouchableOpacity
                style={styles.selectedCloseBtn}
                onPress={() => setSelectedMapItem(null)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.selectedCloseBtnText}>✕</Text>
              </TouchableOpacity>
              {/* Info sobre imagen */}
              <View style={styles.selectedHeroInfo}>
                <Text style={styles.selectedHeroTitle} numberOfLines={2}>
                  {(selectedMapItem as Tour).title}
                </Text>
                <View style={styles.selectedHeroMeta}>
                  <Text style={styles.selectedHeroLocation}>
                    📍 {(selectedMapItem as Tour).location}
                  </Text>
                  <View style={styles.selectedHeroRating}>
                    <Text style={styles.selectedHeroStar}>⭐</Text>
                    <Text style={styles.selectedHeroRatingText}>
                      {(selectedMapItem as Tour).rating.toFixed(1)}
                    </Text>
                    <Text style={styles.selectedHeroReviews}>
                      ({(selectedMapItem as Tour).reviewCount})
                    </Text>
                  </View>
                </View>
              </View>
            </View>
            {/* Footer con precio y CTA */}
            <View style={styles.selectedFooter}>
              <View style={styles.selectedPriceBox}>
                <Text style={styles.selectedPriceAmount}>
                  {formatPrice((selectedMapItem as Tour).price, (selectedMapItem as Tour).currency)}
                </Text>
                <Text style={styles.selectedPriceUnit}>por persona</Text>
              </View>
              <TouchableOpacity
                style={styles.selectedCTAButton}
                onPress={() => handleTourPress(selectedMapItem as Tour)}
              >
                <Text style={styles.selectedCTAText}>Ver tour</Text>
                <Text style={styles.selectedCTAArrow}>→</Text>
              </TouchableOpacity>
            </View>
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

  // For tours we use transformedTours, for companies we use apiCompanies directly
  const isLoading = activeTab === 'tours' ? toursLoading : companiesLoading;

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
            onPress={() => {
              setActiveTab('tours');
              // Reset to list view when switching to tours (map available)
            }}
          >
            <Text style={[styles.tabText, activeTab === 'tours' && styles.tabTextActive]}>🏔️ Tours</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'companies' && styles.tabActive]}
            onPress={() => {
              setActiveTab('companies');
              setViewMode('list'); // Companies only have list view
            }}
          >
            <Text style={[styles.tabText, activeTab === 'companies' && styles.tabTextActive]}>🏢 Empresas</Text>
          </TouchableOpacity>
        </View>
        {/* View toggle only for tours */}
        {activeTab === 'tours' && (
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
        )}
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
      {viewMode === 'map' && activeTab === 'tours' ? (
        renderMapView()
      ) : isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>
            {activeTab === 'tours' ? 'Cargando tours...' : 'Cargando empresas...'}
          </Text>
        </View>
      ) : activeTab === 'tours' ? (
        <FlatList
          data={transformedTours}
          keyExtractor={tourKeyExtractor}
          renderItem={({ item }) => <TourListCard item={item} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          // Performance optimizations
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          initialNumToRender={8}
          windowSize={5}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyText}>No se encontraron tours</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={apiCompanies}
          keyExtractor={companyKeyExtractor}
          renderItem={({ item }) => (
            <CompanyCard
              company={item}
              onPress={() => handleCompanyPress(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          // Performance optimizations
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          initialNumToRender={8}
          windowSize={5}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🏢</Text>
              <Text style={styles.emptyText}>No se encontraron empresas</Text>
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
  loadingText: { ...Typography.body, color: Colors.textSecondary, marginTop: Spacing.md },
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
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
    minWidth: 60,
    alignItems: 'center',
  },
  priceMarkerSelected: { 
    backgroundColor: Colors.primary, 
    borderColor: Colors.primary,
    transform: [{ scale: 1.1 }],
  },
  priceMarkerText: { 
    ...Typography.label, 
    color: Colors.text, 
    fontWeight: '700',
    fontSize: 13,
  },
  priceMarkerTextSelected: { color: '#fff' },

  // Selected Card
  // =============================================
  // SELECTED CARD - TOUR (Diseño Hero Inmersivo)
  // =============================================
  selectedCard: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  selectedTourCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    overflow: 'hidden',
  },
  selectedHeroContainer: {
    height: 160,
    position: 'relative',
  },
  selectedHeroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  selectedHeroPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedHeroEmoji: {
    fontSize: 48,
  },
  selectedHeroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  selectedBadgesRow: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    gap: 8,
  },
  selectedFeaturedBadge: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  selectedFeaturedText: {
    ...Typography.labelSmall,
    color: '#fff',
    fontWeight: '700',
  },
  selectedDurationBadge: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  selectedDurationText: {
    ...Typography.labelSmall,
    color: '#fff',
  },
  selectedCloseBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCloseBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  selectedHeroInfo: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
  },
  selectedHeroTitle: {
    ...Typography.h4,
    color: '#fff',
    fontWeight: '700',
    marginBottom: 6,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  selectedHeroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedHeroLocation: {
    ...Typography.labelSmall,
    color: 'rgba(255,255,255,0.9)',
  },
  selectedHeroRating: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  selectedHeroStar: {
    fontSize: 12,
    marginRight: 4,
  },
  selectedHeroRatingText: {
    ...Typography.labelSmall,
    color: '#fff',
    fontWeight: '700',
  },
  selectedHeroReviews: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.8)',
    marginLeft: 2,
  },
  selectedFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    backgroundColor: Colors.surface,
  },
  selectedPriceBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  selectedPriceAmount: {
    ...Typography.h3,
    color: Colors.primary,
    fontWeight: '800',
  },
  selectedPriceUnit: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  selectedCTAButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  selectedCTAText: {
    ...Typography.labelLarge,
    color: '#fff',
    fontWeight: '600',
  },
  selectedCTAArrow: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 6,
    fontWeight: '600',
  },

  // =============================================
  // SELECTED CARD - GUIDE (Diseño compacto)
  // =============================================
  selectedGuideCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 16,
    position: 'relative',
  },
  selectedGuideClose: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedGuideCloseText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  selectedGuideRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  selectedGuideAvatarContainer: {
    position: 'relative',
    marginRight: 14,
  },
  selectedGuideOnline: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedGuideOnlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.success,
  },
  selectedGuideInfo: {
    flex: 1,
    paddingRight: 30,
  },
  selectedGuideName: {
    ...Typography.h4,
    color: Colors.text,
    fontWeight: '700',
    marginBottom: 4,
  },
  selectedGuideLocation: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  selectedGuideStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  selectedGuideStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedGuideStatIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  selectedGuideStatValue: {
    ...Typography.labelSmall,
    color: Colors.text,
    fontWeight: '600',
  },
  selectedGuideSpecialties: {
    flexDirection: 'row',
    gap: 6,
  },
  selectedGuideSpecBadge: {
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  selectedGuideSpecText: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '600',
  },
  selectedGuideFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  selectedGuidePriceBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  selectedGuidePriceAmount: {
    ...Typography.h3,
    color: Colors.primary,
    fontWeight: '800',
  },
  selectedGuidePriceUnit: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginLeft: 2,
  },
  selectedGuideCTAButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  selectedGuideCTAText: {
    ...Typography.labelLarge,
    color: '#fff',
    fontWeight: '600',
  },

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
