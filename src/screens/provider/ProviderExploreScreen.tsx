import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Typography } from '../../theme';
import { adminService, AdminTour, AdminGuide, TourStatus } from '../../services';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type TabType = 'tours' | 'guides';

const STATUS_CONFIG: Record<TourStatus, { label: string; color: string; icon: string }> = {
  PUBLISHED: { label: 'Publicado', color: Colors.success, icon: '🟢' },
  DRAFT: { label: 'Borrador', color: Colors.warning, icon: '🟡' },
  ARCHIVED: { label: 'Archivado', color: Colors.textTertiary, icon: '⚫' },
};

// Tour Card Component (Compact)
const TourCard: React.FC<{ tour: AdminTour; onPress: () => void }> = ({ tour, onPress }) => {
  const config = STATUS_CONFIG[tour.status] || STATUS_CONFIG.DRAFT;
  const primaryGuide = tour.guides?.[0];

  const formatPrice = (price: number | undefined, currency: string) => {
    const p = price || 0;
    if (currency === 'CLP') return `$${p.toLocaleString('es-CL')}`;
    return `€${p}`;
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.cardImage}>
        {tour.image ? (
          <Image source={{ uri: tour.image }} style={styles.cardImageContent} />
        ) : (
          <LinearGradient
            colors={[Colors.primaryLight, Colors.primary]}
            style={styles.cardImageContent}
          >
            <Text style={styles.cardImagePlaceholder}>🏔️</Text>
          </LinearGradient>
        )}
        <View style={[styles.cardBadge, { backgroundColor: config.color }]}>
          <Text style={styles.cardBadgeText}>{config.icon}</Text>
        </View>
      </View>
      
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={1}>{tour.title}</Text>
        <Text style={styles.cardLocation} numberOfLines={1}>📍 {tour.location}</Text>
        
        <View style={styles.cardFooter}>
          <Text style={styles.cardPrice}>{formatPrice(tour.price, tour.currency)}</Text>
          <View style={styles.cardRating}>
            <Text style={styles.cardStar}>⭐</Text>
            <Text style={styles.cardRatingText}>{Number(tour.rating || 0).toFixed(1)}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Guide Card Component (Compact)
const GuideCard: React.FC<{ guide: AdminGuide; onPress: () => void }> = ({ guide, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.cardImage}>
        {guide.avatar ? (
          <Image source={{ uri: guide.avatar }} style={styles.cardImageContent} />
        ) : (
          <View style={[styles.cardImageContent, styles.guideAvatarPlaceholder]}>
            <Text style={styles.guideAvatarText}>{(guide.name || 'G').charAt(0)}</Text>
          </View>
        )}
        {guide.isVerified && (
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>✓</Text>
          </View>
        )}
        {!guide.isActive && (
          <View style={styles.inactiveBadge}>
            <Text style={styles.inactiveBadgeText}>⏸</Text>
          </View>
        )}
      </View>
      
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={1}>{guide.name}</Text>
        <Text style={styles.cardLocation} numberOfLines={1}>📍 {guide.location || 'Sin ubicación'}</Text>
        
        <View style={styles.cardFooter}>
          <Text style={styles.cardStats}>🎯 {guide.toursCount || 0} tours</Text>
          <View style={styles.cardRating}>
            <Text style={styles.cardStar}>⭐</Text>
            <Text style={styles.cardRatingText}>{Number(guide.rating || 0).toFixed(1)}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export const ProviderExploreScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('tours');
  const [searchQuery, setSearchQuery] = useState('');
  const [tours, setTours] = useState<AdminTour[]>([]);
  const [guides, setGuides] = useState<AdminGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      if (activeTab === 'tours') {
        const params: { search?: string } = {};
        if (searchQuery) params.search = searchQuery;
        const result = await adminService.getTours(params);
        setTours(result.data);
      } else {
        const params: { search?: string } = {};
        if (searchQuery) params.search = searchQuery;
        const result = await adminService.getGuides(params);
        setGuides(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab, searchQuery]);

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearchQuery('');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header con Search */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explorar</Text>
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder={activeTab === 'tours' ? 'Buscar tours...' : 'Buscar guías...'}
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
        </View>
      </View>

      {/* Segmented Control */}
      <View style={styles.segmentedControl}>
        <TouchableOpacity
          style={[styles.segmentButton, activeTab === 'tours' && styles.segmentButtonActive]}
          onPress={() => handleTabChange('tours')}
          activeOpacity={0.8}
        >
          <Text style={[styles.segmentText, activeTab === 'tours' && styles.segmentTextActive]}>
            🗺️ Tours
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segmentButton, activeTab === 'guides' && styles.segmentButtonActive]}
          onPress={() => handleTabChange('guides')}
          activeOpacity={0.8}
        >
          <Text style={[styles.segmentText, activeTab === 'guides' && styles.segmentTextActive]}>
            👥 Guías
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      ) : (
        <FlatList
          data={activeTab === 'tours' ? tours : guides}
          renderItem={({ item }) =>
            activeTab === 'tours' ? (
              <TourCard
                tour={item as AdminTour}
                onPress={() => console.log('Tour:', item.id)}
              />
            ) : (
              <GuideCard
                guide={item as AdminGuide}
                onPress={() => console.log('Guide:', item.id)}
              />
            )
          }
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>{activeTab === 'tours' ? '🏔️' : '👥'}</Text>
              <Text style={styles.emptyTitle}>
                No hay {activeTab === 'tours' ? 'tours' : 'guías'}
              </Text>
              <Text style={styles.emptyText}>
                {searchQuery
                  ? 'Intenta con otra búsqueda'
                  : activeTab === 'tours'
                  ? 'Crea tu primer tour'
                  : 'Invita a tu primer guía'}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  
  // Header
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: -0.5,
    marginBottom: Spacing.md,
  },
  
  // Search
  searchContainer: {
    marginBottom: Spacing.sm,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 16,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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
  
  // Segmented Control
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    borderRadius: 16,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: Spacing.sm + 2,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentButtonActive: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  segmentText: {
    ...Typography.labelLarge,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  segmentTextActive: {
    color: Colors.textInverse,
  },
  
  // List
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: 120,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  
  // Card
  card: {
    width: (SCREEN_WIDTH - Spacing.lg * 2 - Spacing.sm) / 2,
    backgroundColor: Colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardImage: {
    width: '100%',
    height: 140,
    position: 'relative',
  },
  cardImageContent: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cardImagePlaceholder: {
    fontSize: 48,
    textAlign: 'center',
    lineHeight: 140,
  },
  cardBadge: {
    position: 'absolute',
    top: Spacing.xs,
    left: Spacing.xs,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBadgeText: {
    fontSize: 12,
  },
  guideAvatarPlaceholder: {
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideAvatarText: {
    fontSize: 42,
    color: Colors.textInverse,
    fontWeight: '700',
  },
  verifiedBadge: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
    backgroundColor: Colors.success,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedText: {
    color: Colors.textInverse,
    fontSize: 12,
    fontWeight: '700',
  },
  inactiveBadge: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
    backgroundColor: Colors.error,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inactiveBadgeText: {
    color: Colors.textInverse,
    fontSize: 10,
  },
  cardContent: {
    padding: Spacing.md,
  },
  cardTitle: {
    ...Typography.labelLarge,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardLocation: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardPrice: {
    ...Typography.labelLarge,
    color: Colors.primary,
    fontWeight: '700',
  },
  cardStats: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  cardRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardStar: {
    fontSize: 10,
    marginRight: 2,
  },
  cardRatingText: {
    ...Typography.caption,
    color: Colors.text,
    fontWeight: '600',
  },
  
  // Loading
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
  
  // Empty
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl * 2,
  },
  emptyIcon: {
    fontSize: 64,
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
});
