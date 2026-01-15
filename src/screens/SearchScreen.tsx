import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
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
  ActivityIndicator,
  Dimensions,
  Image,
  Animated,
} from 'react-native';
import MapView, { Marker, Callout, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import { Colors, Spacing, Typography } from '../theme';
import { TourCard, GuideCard, Avatar } from '../components';
import {
  CATEGORIES,
  MOCK_TOURS,
  LOCATIONS,
  LOCATION_COORDINATES,
  DEFAULT_MAP_REGION,
} from '../constants/mockData';
import {
  guidesService,
  Guide as ApiGuide,
  SearchGuidesParams,
  getErrorMessage,
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
  const [selectedMapItem, setSelectedMapItem] = useState<Tour | Guide | null>(
    null
  );
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const cardAnimation = useRef(new Animated.Value(0)).current;

  // API state for guides
  const [apiGuides, setApiGuides] = useState<ApiGuide[]>([]);
  const [guidesLoading, setGuidesLoading] = useState(false);
  const [guidesError, setGuidesError] = useState<string | null>(null);

  // Request location permissions
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

  // Animate card when selectedMapItem changes
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

  // Fetch guides from API
  const fetchGuides = useCallback(async () => {
    setGuidesLoading(true);
    setGuidesError(null);

    try {
      const params: SearchGuidesParams = {
        limit: 50,
      };

      if (searchQuery.trim()) {
        params.query = searchQuery.trim();
      }

      if (selectedLocation) {
        params.city = selectedLocation;
      }

      if (minRating) {
        params.minRating = minRating;
      }

      if (selectedCategory) {
        const category = CATEGORIES.find((c) => c.id === selectedCategory);
        if (category) {
          params.specialties = category.name.toUpperCase();
        }
      }

      switch (sortBy) {
        case 'rating':
          params.sortBy = 'rating';
          params.sortOrder = 'desc';
          break;
        case 'price_low':
          params.sortBy = 'price';
          params.sortOrder = 'asc';
          break;
        case 'price_high':
          params.sortBy = 'price';
          params.sortOrder = 'desc';
          break;
        case 'reviews':
          params.sortBy = 'reviews';
          params.sortOrder = 'desc';
          break;
      }

      const response = await guidesService.searchGuides(params);
      if (response.success) {
        setApiGuides(response.data);
      } else {
        setGuidesError('Error al cargar guías');
      }
    } catch (err) {
      setGuidesError(getErrorMessage(err));
    } finally {
      setGuidesLoading(false);
    }
  }, [searchQuery, selectedLocation, minRating, selectedCategory, sortBy]);

  useEffect(() => {
    if (activeTab === 'guides') {
      const timeoutId = setTimeout(fetchGuides, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [activeTab, fetchGuides]);

  const transformedGuides: Guide[] = useMemo(() => {
    return apiGuides.map((guide) => ({
      id: guide.id,
      name: guide.user
        ? `${guide.user.firstName} ${guide.user.lastName}`
        : guide.name || 'Guía',
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
  }, [apiGuides]);

  const filteredTours = useMemo(() => {
    let results = [...MOCK_TOURS];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        (tour) =>
          tour.title.toLowerCase().includes(query) ||
          tour.location.toLowerCase().includes(query) ||
          tour.guideName.toLowerCase().includes(query)
      );
    }

    if (selectedCategory) {
      results = results.filter((tour) =>
        tour.categories.includes(selectedCategory)
      );
    }

    if (selectedLocation) {
      results = results.filter((tour) => tour.location === selectedLocation);
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

  // Get markers for map
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
          (key) =>
            locationKey.includes(key) ||
            key.includes(locationKey.split(',')[0])
        );
        if (cityMatch) {
          coords = LOCATION_COORDINATES[cityMatch];
        }
      }

      if (coords) {
        const randomOffset = {
          latitude: (Math.random() - 0.5) * 0.02,
          longitude: (Math.random() - 0.5) * 0.02,
        };

        markers.push({
          id: item.id,
          coordinate: {
            latitude: coords.latitude + randomOffset.latitude,
            longitude: coords.longitude + randomOffset.longitude,
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

  const handleMarkerPress = (item: Tour | Guide) => {
    setSelectedMapItem(item);
  };

  const handleCalloutPress = (item: Tour | Guide) => {
    if (activeTab === 'guides') {
      handleGuidePress(item as Guide);
    } else {
      handleTourPress(item as Tour);
    }
  };

  const centerOnChile = () => {
    if (mapRef.current) {
      mapRef.current.animateToRegion(DEFAULT_MAP_REGION, 800);
    }
  };

  const centerOnUserLocation = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          ...userLocation,
          latitudeDelta: 0.5,
          longitudeDelta: 0.5,
        },
        800
      );
    }
  };

  const fitToMarkers = () => {
    if (mapRef.current && mapMarkers.length > 0) {
      const coordinates = mapMarkers.map((m) => m.coordinate);
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 100, right: 50, bottom: 200, left: 50 },
        animated: true,
      });
    }
  };

  const zoomIn = () => {
    if (mapRef.current) {
      mapRef.current.getCamera().then((camera) => {
        if (camera.center) {
          mapRef.current?.animateToRegion(
            {
              latitude: camera.center.latitude,
              longitude: camera.center.longitude,
              latitudeDelta: camera.zoom ? 0.5 / camera.zoom : 0.1,
              longitudeDelta: camera.zoom ? 0.5 / camera.zoom : 0.1,
            },
            300
          );
        }
      });
    }
  };

  const zoomOut = () => {
    if (mapRef.current) {
      mapRef.current.getCamera().then((camera) => {
        if (camera.center) {
          mapRef.current?.animateToRegion(
            {
              latitude: camera.center.latitude,
              longitude: camera.center.longitude,
              latitudeDelta: camera.zoom ? 20 / camera.zoom : 5,
              longitudeDelta: camera.zoom ? 20 / camera.zoom : 5,
            },
            300
          );
        }
      });
    }
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedLocation(null);
    setMinRating(null);
    setSortBy('rating');
  };

  const activeFiltersCount = [
    selectedCategory,
    selectedLocation,
    minRating,
  ].filter(Boolean).length;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatPrice = (price: number, currency: string) => {
    if (currency === 'CLP') {
      return `$${price.toLocaleString('es-CL')}`;
    }
    return `${price}€`;
  };

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

  const renderMapMarker = (marker: (typeof mapMarkers)[0]) => {
    const isGuide = marker.type === 'guide';
    const item = marker.item;
    const isSelected = selectedMapItem?.id === marker.id;

    return (
      <Marker
        key={marker.id}
        coordinate={marker.coordinate}
        onPress={() => handleMarkerPress(item)}
      >
        <View
          style={[
            styles.markerContainer,
            isSelected && styles.markerContainerSelected,
          ]}
        >
          <View
            style={[
              styles.customMarker,
              isGuide ? styles.guideMarker : styles.tourMarker,
              isSelected && styles.markerSelected,
            ]}
          >
            <Text style={styles.markerIcon}>{isGuide ? '👤' : '🏔️'}</Text>
          </View>
          <View
            style={[
              styles.markerPointer,
              isGuide ? styles.guidePointer : styles.tourPointer,
              isSelected && styles.pointerSelected,
            ]}
          />
        </View>

        <Callout
          tooltip
          onPress={() => handleCalloutPress(item)}
          style={styles.calloutContainer}
        >
          <View style={styles.callout}>
            {isGuide ? (
              <>
                <View style={styles.calloutHeader}>
                  <View style={styles.calloutAvatar}>
                    {(item as Guide).avatar ? (
                      <Image
                        source={{ uri: (item as Guide).avatar }}
                        style={styles.calloutAvatarImage}
                      />
                    ) : (
                      <Text style={styles.calloutAvatarText}>
                        {getInitials((item as Guide).name)}
                      </Text>
                    )}
                  </View>
                  <View style={styles.calloutInfo}>
                    <Text style={styles.calloutTitle} numberOfLines={1}>
                      {(item as Guide).name}
                    </Text>
                    <View style={styles.calloutRating}>
                      <Text style={styles.calloutStar}>⭐</Text>
                      <Text style={styles.calloutRatingText}>
                        {(item as Guide).rating}
                      </Text>
                    </View>
                  </View>
                </View>
                <Text style={styles.calloutPrice}>
                  {formatPrice(
                    (item as Guide).pricePerHour,
                    (item as Guide).currency
                  )}
                  /hora
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.calloutTitle} numberOfLines={2}>
                  {(item as Tour).title}
                </Text>
                <View style={styles.calloutRating}>
                  <Text style={styles.calloutStar}>⭐</Text>
                  <Text style={styles.calloutRatingText}>
                    {(item as Tour).rating}
                  </Text>
                  <Text style={styles.calloutDuration}>
                    • {(item as Tour).duration}
                  </Text>
                </View>
                <Text style={styles.calloutPrice}>
                  {formatPrice((item as Tour).price, (item as Tour).currency)}
                </Text>
              </>
            )}
          </View>
        </Callout>
      </Marker>
    );
  };

  const renderMapView = () => (
    <View style={styles.mapContainer}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={DEFAULT_MAP_REGION}
        region={!mapReady ? DEFAULT_MAP_REGION : undefined}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
        rotateEnabled={true}
        pitchEnabled={true}
        onMapReady={() => {
          setMapReady(true);
          setTimeout(() => {
            if (mapMarkers.length > 0) {
              fitToMarkers();
            }
          }, 500);
        }}
      >
        {mapMarkers.map(renderMapMarker)}
      </MapView>

      {/* Map controls */}
      <View style={styles.mapControlsRight}>
        <TouchableOpacity style={styles.mapControlBtn} onPress={zoomIn}>
          <Text style={styles.mapControlText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.mapControlBtn} onPress={zoomOut}>
          <Text style={styles.mapControlText}>−</Text>
        </TouchableOpacity>
        <View style={styles.mapControlDivider} />
        <TouchableOpacity style={styles.mapControlBtn} onPress={fitToMarkers}>
          <Text style={styles.mapControlIcon}>🎯</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.mapControlBtn} onPress={centerOnChile}>
          <Text style={styles.mapControlIcon}>🇨🇱</Text>
        </TouchableOpacity>
        {userLocation && (
          <TouchableOpacity
            style={styles.mapControlBtn}
            onPress={centerOnUserLocation}
          >
            <Text style={styles.mapControlIcon}>📍</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Results badge */}
      <View style={styles.resultsCountBadge}>
        <Text style={styles.resultsCountIcon}>
          {activeTab === 'guides' ? '👥' : '🗺️'}
        </Text>
        <Text style={styles.resultsCountText}>
          {mapMarkers.length} {activeTab === 'guides' ? 'guías' : 'tours'}
        </Text>
      </View>

      {/* Selected item card */}
      {selectedMapItem && (
        <Animated.View
          style={[
            styles.selectedItemCard,
            {
              transform: [
                {
                  translateY: cardAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [200, 0],
                  }),
                },
              ],
              opacity: cardAnimation,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.selectedItemClose}
            onPress={() => setSelectedMapItem(null)}
          >
            <Text style={styles.selectedItemCloseText}>✕</Text>
          </TouchableOpacity>

          {activeTab === 'guides' ? (
            <TouchableOpacity
              style={styles.selectedItemContent}
              onPress={() => handleGuidePress(selectedMapItem as Guide)}
              activeOpacity={0.9}
            >
              <View style={styles.selectedGuideRow}>
                <Avatar
                  uri={(selectedMapItem as Guide).avatar}
                  name={(selectedMapItem as Guide).name}
                  size="large"
                />
                <View style={styles.selectedGuideInfo}>
                  <Text style={styles.selectedItemTitle}>
                    {(selectedMapItem as Guide).name}
                  </Text>
                  <Text style={styles.selectedItemLocation}>
                    📍 {(selectedMapItem as Guide).location}
                  </Text>
                  <View style={styles.selectedItemRatingRow}>
                    <Text style={styles.selectedItemRating}>
                      ⭐ {(selectedMapItem as Guide).rating}
                    </Text>
                    <Text style={styles.selectedItemReviews}>
                      ({(selectedMapItem as Guide).reviewCount} reseñas)
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.selectedItemFooter}>
                <Text style={styles.selectedItemPrice}>
                  {formatPrice(
                    (selectedMapItem as Guide).pricePerHour,
                    (selectedMapItem as Guide).currency
                  )}
                  /hora
                </Text>
                <View style={styles.selectedItemButton}>
                  <Text style={styles.selectedItemButtonText}>
                    Ver perfil →
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.selectedItemContent}
              onPress={() => handleTourPress(selectedMapItem as Tour)}
              activeOpacity={0.9}
            >
              <View style={styles.selectedTourRow}>
                {(selectedMapItem as Tour).image ? (
                  <Image
                    source={{ uri: (selectedMapItem as Tour).image }}
                    style={styles.selectedTourImage}
                  />
                ) : (
                  <View style={styles.selectedTourImagePlaceholder}>
                    <Text style={styles.selectedTourImageIcon}>🏔️</Text>
                  </View>
                )}
                <View style={styles.selectedTourInfo}>
                  <Text style={styles.selectedItemTitle} numberOfLines={2}>
                    {(selectedMapItem as Tour).title}
                  </Text>
                  <Text style={styles.selectedItemLocation}>
                    📍 {(selectedMapItem as Tour).location}
                  </Text>
                  <View style={styles.selectedItemRatingRow}>
                    <Text style={styles.selectedItemRating}>
                      ⭐ {(selectedMapItem as Tour).rating}
                    </Text>
                    <Text style={styles.selectedItemDuration}>
                      • {(selectedMapItem as Tour).duration}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.selectedItemFooter}>
                <Text style={styles.selectedItemPrice}>
                  {formatPrice(
                    (selectedMapItem as Tour).price,
                    (selectedMapItem as Tour).currency
                  )}
                </Text>
                <View style={styles.selectedItemButton}>
                  <Text style={styles.selectedItemButtonText}>Ver tour →</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        </Animated.View>
      )}
    </View>
  );

  const renderFiltersModal = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      presentationStyle="pageSheet"
    >
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
          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Ubicación</Text>
            <View style={styles.filterChipsWrap}>
              {LOCATIONS.map((location) => (
                <TouchableOpacity
                  key={location}
                  style={[
                    styles.filterChip,
                    selectedLocation === location && styles.filterChipSelected,
                  ]}
                  onPress={() =>
                    setSelectedLocation(
                      selectedLocation === location ? null : location
                    )
                  }
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedLocation === location &&
                        styles.filterChipTextSelected,
                    ]}
                  >
                    {location}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

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
                  onPress={() =>
                    setMinRating(minRating === rating ? null : rating)
                  }
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
                {sortBy === option.value && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
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
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFiltersCount > 0 && styles.filterButtonActive,
          ]}
          onPress={() => setShowFilters(true)}
        >
          <Text style={styles.filterBtnIcon}>⚙️</Text>
          {activeFiltersCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* View Mode Toggle */}
      <View style={styles.viewModeRow}>
        <TouchableOpacity
          style={[
            styles.viewModeBtn,
            viewMode === 'list' && styles.viewModeBtnActive,
          ]}
          onPress={() => setViewMode('list')}
        >
          <Text
            style={[
              styles.viewModeText,
              viewMode === 'list' && styles.viewModeTextActive,
            ]}
          >
            📋 Lista
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.viewModeBtn,
            viewMode === 'map' && styles.viewModeBtnActive,
          ]}
          onPress={() => setViewMode('map')}
        >
          <Text
            style={[
              styles.viewModeText,
              viewMode === 'map' && styles.viewModeTextActive,
            ]}
          >
            🗺️ Mapa
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'tours' && styles.tabActive]}
          onPress={() => setActiveTab('tours')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'tours' && styles.tabTextActive,
            ]}
          >
            🏔️ Tours ({filteredTours.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'guides' && styles.tabActive]}
          onPress={() => setActiveTab('guides')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'guides' && styles.tabTextActive,
            ]}
          >
            👤 Guías ({guidesLoading ? '...' : transformedGuides.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Categories - Compact Horizontal Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesRow}
      >
        <TouchableOpacity
          style={[
            styles.categoryPill,
            !selectedCategory && styles.categoryPillActive,
          ]}
          onPress={() => setSelectedCategory(null)}
        >
          <Text
            style={[
              styles.categoryPillText,
              !selectedCategory && styles.categoryPillTextActive,
            ]}
          >
            Todos
          </Text>
        </TouchableOpacity>
        {CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryPill,
              selectedCategory === category.id && styles.categoryPillActive,
              selectedCategory === category.id && {
                backgroundColor: category.color,
              },
            ]}
            onPress={() =>
              setSelectedCategory(
                selectedCategory === category.id ? null : category.id
              )
            }
          >
            <Text style={styles.categoryPillIcon}>{category.icon}</Text>
            <Text
              style={[
                styles.categoryPillText,
                selectedCategory === category.id &&
                  styles.categoryPillTextActive,
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Results - List or Map View */}
      {viewMode === 'map' ? (
        renderMapView()
      ) : activeTab === 'guides' ? (
        guidesLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Buscando guías...</Text>
          </View>
        ) : guidesError ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>⚠️</Text>
            <Text style={styles.emptyTitle}>Error al cargar</Text>
            <Text style={styles.emptyText}>{guidesError}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchGuides}>
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={transformedGuides}
            renderItem={renderGuideItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>🔍</Text>
                <Text style={styles.emptyTitle}>No se encontraron guías</Text>
                <Text style={styles.emptyText}>
                  Intenta con otros términos de búsqueda
                </Text>
              </View>
            }
          />
        )
      ) : (
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
                Intenta con otros términos de búsqueda
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
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    height: 44,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...Typography.body,
    color: Colors.text,
  },
  clearIcon: {
    fontSize: 14,
    color: Colors.textTertiary,
    padding: Spacing.xs,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  filterBtnIcon: {
    fontSize: 18,
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
  // View mode toggle
  viewModeRow: {
    flexDirection: 'row',
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  viewModeBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  viewModeBtnActive: {
    backgroundColor: Colors.primary,
  },
  viewModeText: {
    ...Typography.label,
    color: Colors.textSecondary,
  },
  viewModeTextActive: {
    color: Colors.textInverse,
    fontWeight: '600',
  },
  // Tabs
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabActive: {
    backgroundColor: Colors.primary + '15',
    borderColor: Colors.primary,
  },
  tabText: {
    ...Typography.label,
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  // Categories - Compact pills
  categoriesRow: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: 8,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
  },
  categoryPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryPillIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  categoryPillText: {
    ...Typography.labelSmall,
    color: Colors.text,
  },
  categoryPillTextActive: {
    color: Colors.textInverse,
    fontWeight: '600',
  },
  // List
  listContent: {
    padding: Spacing.md,
  },
  listItem: {
    marginBottom: Spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
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
  retryButton: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    ...Typography.labelLarge,
    color: Colors.textInverse,
  },
  // Map
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    width: SCREEN_WIDTH,
    height: '100%',
  },
  mapControlsRight: {
    position: 'absolute',
    right: Spacing.md,
    top: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    overflow: 'hidden',
  },
  mapControlBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  mapControlText: {
    fontSize: 22,
    color: Colors.text,
    fontWeight: '300',
  },
  mapControlIcon: {
    fontSize: 18,
  },
  mapControlDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 4,
  },
  resultsCountBadge: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    gap: 6,
  },
  resultsCountIcon: {
    fontSize: 14,
  },
  resultsCountText: {
    ...Typography.labelSmall,
    color: Colors.text,
    fontWeight: '600',
  },
  // Markers
  markerContainer: {
    alignItems: 'center',
  },
  markerContainerSelected: {
    transform: [{ scale: 1.2 }],
  },
  customMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  guideMarker: {
    backgroundColor: Colors.primary,
  },
  tourMarker: {
    backgroundColor: Colors.secondary,
  },
  markerSelected: {
    borderWidth: 3,
    borderColor: Colors.accent,
  },
  markerIcon: {
    fontSize: 16,
  },
  markerPointer: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -2,
  },
  guidePointer: {
    borderTopColor: Colors.primary,
  },
  tourPointer: {
    borderTopColor: Colors.secondary,
  },
  pointerSelected: {
    borderTopColor: Colors.accent,
  },
  // Callout
  calloutContainer: {
    width: 180,
  },
  callout: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  calloutHeader: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  calloutAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  calloutAvatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  calloutAvatarText: {
    ...Typography.labelSmall,
    color: Colors.textInverse,
    fontWeight: '600',
  },
  calloutInfo: {
    flex: 1,
  },
  calloutTitle: {
    ...Typography.labelSmall,
    color: Colors.text,
    fontWeight: '600',
  },
  calloutRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  calloutStar: {
    fontSize: 10,
    marginRight: 2,
  },
  calloutRatingText: {
    ...Typography.labelSmall,
    color: Colors.text,
  },
  calloutDuration: {
    ...Typography.labelSmall,
    color: Colors.textTertiary,
    marginLeft: 4,
  },
  calloutPrice: {
    ...Typography.labelSmall,
    color: Colors.primary,
    fontWeight: '700',
    marginTop: 4,
  },
  // Selected card
  selectedItemCard: {
    position: 'absolute',
    bottom: Spacing.lg,
    left: Spacing.md,
    right: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  selectedItemClose: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedItemCloseText: {
    color: Colors.textInverse,
    fontSize: 14,
    fontWeight: '600',
  },
  selectedItemContent: {
    padding: Spacing.md,
  },
  selectedGuideRow: {
    flexDirection: 'row',
  },
  selectedGuideInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  selectedTourRow: {
    flexDirection: 'row',
  },
  selectedTourImage: {
    width: 90,
    height: 70,
    borderRadius: 10,
  },
  selectedTourImagePlaceholder: {
    width: 90,
    height: 70,
    borderRadius: 10,
    backgroundColor: Colors.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedTourImageIcon: {
    fontSize: 24,
  },
  selectedTourInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  selectedItemTitle: {
    ...Typography.labelLarge,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: 2,
  },
  selectedItemLocation: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  selectedItemRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedItemRating: {
    ...Typography.labelSmall,
    color: Colors.text,
  },
  selectedItemReviews: {
    ...Typography.labelSmall,
    color: Colors.textTertiary,
    marginLeft: 4,
  },
  selectedItemDuration: {
    ...Typography.labelSmall,
    color: Colors.textTertiary,
    marginLeft: 4,
  },
  selectedItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  selectedItemPrice: {
    ...Typography.h4,
    color: Colors.primary,
    fontWeight: '700',
  },
  selectedItemButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: 8,
  },
  selectedItemButtonText: {
    ...Typography.label,
    color: Colors.textInverse,
    fontWeight: '600',
  },
  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
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
    padding: Spacing.md,
  },
  filterSection: {
    marginBottom: Spacing.xl,
  },
  filterTitle: {
    ...Typography.labelLarge,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  filterChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
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
    gap: 8,
  },
  ratingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
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
    borderBottomColor: Colors.borderLight,
  },
  sortOptionSelected: {},
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
    padding: Spacing.md,
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
    ...Typography.labelLarge,
    color: Colors.textInverse,
    fontWeight: '600',
  },
});
