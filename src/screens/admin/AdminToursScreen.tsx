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
  Alert,
  ActivityIndicator,
  Switch,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Typography } from '../../theme';
import { adminService, AdminTour, TourStatus } from '../../services';
import type { AdminTabScreenProps } from '../../types';

type Props = AdminTabScreenProps<'AdminTours'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const STATUS_CONFIG: Record<TourStatus, { label: string; color: string; icon: string }> = {
  PUBLISHED: { label: 'Publicado', color: Colors.success, icon: '🟢' },
  DRAFT: { label: 'Borrador', color: Colors.warning, icon: '🟡' },
  ARCHIVED: { label: 'Archivado', color: Colors.textTertiary, icon: '⚫' },
};

const STATUS_FILTERS: { label: string; value: TourStatus | 'all'; icon: string }[] = [
  { label: 'Todos', value: 'all', icon: '📋' },
  { label: 'Publicados', value: 'PUBLISHED', icon: '🟢' },
  { label: 'Borrador', value: 'DRAFT', icon: '🟡' },
  { label: 'Archivados', value: 'ARCHIVED', icon: '⚫' },
];

// Tour Card Component
const TourCard: React.FC<{
  tour: AdminTour;
  onEdit: () => void;
  onTogglePublish: () => void;
  onDelete: () => void;
  onView: () => void;
}> = ({ tour, onEdit, onTogglePublish, onDelete, onView }) => {
  const config = STATUS_CONFIG[tour.status] || STATUS_CONFIG.DRAFT;
  const isPublished = tour.status === 'PUBLISHED';

  // Get first guide from guides array
  const primaryGuide = tour.guides?.[0];

  const formatPrice = (price: number | undefined, currency: string) => {
    const p = price || 0;
    if (currency === 'CLP') {
      return `$${p.toLocaleString('es-CL')}`;
    }
    return `€${p}`;
  };

  const formatDuration = (duration: number | string) => {
    if (typeof duration === 'string') return duration;
    if (duration < 60) return `${duration} min`;
    const hours = Math.floor(duration / 60);
    const mins = duration % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  return (
    <TouchableOpacity style={styles.tourCard} onPress={onView} activeOpacity={0.9}>
      {/* Image Section */}
      <View style={styles.tourImageContainer}>
        {tour.image ? (
          <Image source={{ uri: tour.image }} style={styles.tourImage} />
        ) : (
          <LinearGradient
            colors={[Colors.primaryLight, Colors.primary]}
            style={styles.tourImagePlaceholder}
          >
            <Text style={styles.tourImagePlaceholderText}>🏔️</Text>
          </LinearGradient>
        )}
        
        {/* Status Badge */}
        <View style={[styles.statusBadge, { backgroundColor: config.color }]}>
          <Text style={styles.statusBadgeText}>{config.label}</Text>
        </View>

        {/* Featured Badge */}
        {(tour.isFeatured || tour.featured) && (
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredBadgeText}>⭐ Destacado</Text>
          </View>
        )}

        {/* Quick Toggle */}
        <View style={styles.quickToggle}>
          <Switch
            value={isPublished}
            onValueChange={onTogglePublish}
            trackColor={{ false: Colors.borderLight, true: Colors.success + '50' }}
            thumbColor={isPublished ? Colors.success : Colors.textTertiary}
            style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
          />
        </View>
      </View>

      {/* Content */}
      <View style={styles.tourContent}>
        <Text style={styles.tourTitle} numberOfLines={2}>
          {tour.title}
        </Text>

        <View style={styles.tourLocation}>
          <Text style={styles.locationIcon}>📍</Text>
          <Text style={styles.locationText}>{tour.location}</Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>⏱️</Text>
            <Text style={styles.statText}>{tour.durationFormatted || formatDuration(tour.duration)}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>👥</Text>
            <Text style={styles.statText}>Max {tour.maxParticipants}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>📅</Text>
            <Text style={styles.statText}>{tour.bookingsCount || 0}</Text>
          </View>
        </View>

        {/* Guide */}
        {primaryGuide && (
          <View style={styles.guideRow}>
            {primaryGuide.avatar ? (
              <Image source={{ uri: primaryGuide.avatar }} style={styles.guideAvatar} />
            ) : (
              <View style={styles.guideAvatarPlaceholder}>
                <Text style={styles.guideAvatarText}>{primaryGuide.name?.charAt(0) || 'G'}</Text>
              </View>
            )}
            <Text style={styles.guideName}>{primaryGuide.name}</Text>
            {tour.guides && tour.guides.length > 1 && (
              <Text style={styles.moreGuides}>+{tour.guides.length - 1} más</Text>
            )}
          </View>
        )}

        {/* Footer */}
        <View style={styles.tourFooter}>
          <View>
            <Text style={styles.tourPrice}>{formatPrice(tour.price, tour.currency)}</Text>
            <View style={styles.ratingRow}>
              <Text style={styles.ratingStar}>⭐</Text>
              <Text style={styles.ratingText}>{Number(tour.rating || 0).toFixed(1)}</Text>
              <Text style={styles.reviewCount}>({tour.reviewCount})</Text>
            </View>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.editButton} onPress={onEdit}>
              <Text style={styles.editButtonText}>✏️</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
              <Text style={styles.deleteButtonText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export const AdminToursScreen: React.FC<Props> = ({ navigation }) => {
  const [tours, setTours] = useState<AdminTour[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TourStatus | 'all'>('all');

  const fetchTours = useCallback(async () => {
    try {
      const params: { status?: TourStatus; search?: string } = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (searchQuery) params.search = searchQuery;

      const result = await adminService.getTours(params);
      setTours(result.data);
    } catch (error) {
      console.error('Error fetching tours:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    fetchTours();
  }, [fetchTours]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTours();
  };

  const handleTogglePublish = async (tour: AdminTour) => {
    try {
      if (tour.status === 'PUBLISHED') {
        await adminService.unpublishTour(tour.id);
        Alert.alert('Tour despublicado', 'El tour ya no es visible para los clientes');
      } else {
        await adminService.publishTour(tour.id);
        Alert.alert('Tour publicado', '¡El tour ahora está visible para todos!');
      }
      fetchTours();
    } catch (error) {
      Alert.alert('Error', 'No se pudo cambiar el estado del tour');
    }
  };

  const handleDelete = (tour: AdminTour) => {
    Alert.alert(
      'Archivar Tour',
      `¿Estás seguro de archivar "${tour.title}"? Podrás restaurarlo después.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Archivar',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminService.deleteTour(tour.id);
              Alert.alert('Tour archivado', 'Puedes restaurarlo desde la sección de archivados');
              fetchTours();
            } catch (error) {
              Alert.alert('Error', 'No se pudo archivar el tour');
            }
          },
        },
      ]
    );
  };

  const handleEdit = (tour: AdminTour) => {
    (navigation as any).getParent()?.navigate('TourForm', { tourId: tour.id });
  };

  const handleView = (tour: AdminTour) => {
    // Navigate to TourPreview to view the tour details
    (navigation as any).getParent()?.navigate('TourPreview', { tourId: tour.id });
  };

  const handleCreateTour = () => {
    (navigation as any).getParent()?.navigate('TourForm');
  };

  // Stats
  const publishedCount = tours.filter((t) => t.status === 'PUBLISHED').length;
  const draftCount = tours.filter((t) => t.status === 'DRAFT').length;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Cargando tours...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Tours</Text>
          <Text style={styles.headerSubtitle}>
            {publishedCount} publicados • {draftCount} en borrador
          </Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={handleCreateTour}>
          <LinearGradient
            colors={[Colors.primary, Colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.addButtonGradient}
          >
            <Text style={styles.addButtonText}>+ Nuevo</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre, ubicación o guía..."
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

      {/* Status Filter */}
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          data={STATUS_FILTERS}
          keyExtractor={(item) => item.value}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.filterButton, statusFilter === item.value && styles.filterButtonActive]}
              onPress={() => setStatusFilter(item.value)}
            >
              <Text style={styles.filterIcon}>{item.icon}</Text>
              <Text
                style={[
                  styles.filterButtonText,
                  statusFilter === item.value && styles.filterButtonTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Tours List */}
      <FlatList
        data={tours}
        renderItem={({ item }) => (
          <TourCard
            tour={item}
            onEdit={() => handleEdit(item)}
            onTogglePublish={() => handleTogglePublish(item)}
            onDelete={() => handleDelete(item)}
            onView={() => handleView(item)}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🏔️</Text>
            <Text style={styles.emptyTitle}>No hay tours</Text>
            <Text style={styles.emptyText}>
              {statusFilter !== 'all'
                ? `No tienes tours ${STATUS_CONFIG[statusFilter]?.label.toLowerCase() || ''}`
                : 'Crea tu primer tour para empezar a recibir reservas'}
            </Text>
            <TouchableOpacity style={styles.emptyButton} onPress={handleCreateTour}>
              <Text style={styles.emptyButtonText}>+ Crear tour</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  addButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  addButtonGradient: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  addButtonText: {
    ...Typography.labelLarge,
    color: Colors.textInverse,
    fontWeight: '600',
  },

  // Search
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 14,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...Typography.body,
    color: Colors.text,
    paddingVertical: Spacing.md,
  },
  clearIcon: {
    fontSize: 14,
    color: Colors.textTertiary,
    padding: Spacing.xs,
  },

  // Filter
  filterContainer: {
    marginBottom: Spacing.md,
  },
  filterList: {
    paddingHorizontal: Spacing.lg,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 12,
    backgroundColor: Colors.card,
    marginRight: Spacing.sm,
    gap: 6,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
  },
  filterIcon: {
    fontSize: 12,
  },
  filterButtonText: {
    ...Typography.labelSmall,
    color: Colors.textSecondary,
  },
  filterButtonTextActive: {
    color: Colors.textInverse,
  },

  // List
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 120,
  },

  // Tour Card
  tourCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tourImageContainer: {
    position: 'relative',
    height: 180,
  },
  tourImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  tourImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tourImagePlaceholderText: {
    fontSize: 56,
    opacity: 0.5,
  },
  statusBadge: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    ...Typography.caption,
    color: Colors.textInverse,
    fontWeight: '700',
  },
  featuredBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
    backdropFilter: 'blur(4px)',
  },
  featuredBadgeText: {
    ...Typography.caption,
    color: Colors.textInverse,
    fontWeight: '600',
  },
  quickToggle: {
    position: 'absolute',
    bottom: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  tourContent: {
    padding: Spacing.md,
  },
  tourTitle: {
    ...Typography.h4,
    color: Colors.text,
    marginBottom: 4,
  },
  tourLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  locationIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  locationText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    marginBottom: Spacing.sm,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  statText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  guideRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  guideAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: Spacing.sm,
  },
  guideAvatarPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  guideAvatarText: {
    ...Typography.caption,
    color: Colors.textInverse,
    fontWeight: '700',
  },
  guideName: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    flex: 1,
  },
  moreGuides: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '600',
  },
  tourFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  tourPrice: {
    ...Typography.h3,
    color: Colors.primary,
    fontWeight: '700',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingStar: {
    fontSize: 12,
    marginRight: 2,
  },
  ratingText: {
    ...Typography.labelSmall,
    color: Colors.text,
    fontWeight: '600',
  },
  reviewCount: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginLeft: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  editButton: {
    backgroundColor: Colors.infoLight,
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 18,
  },
  deleteButton: {
    backgroundColor: Colors.errorLight,
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 18,
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
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  emptyButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 12,
  },
  emptyButtonText: {
    ...Typography.labelLarge,
    color: Colors.textInverse,
    fontWeight: '600',
  },
});
