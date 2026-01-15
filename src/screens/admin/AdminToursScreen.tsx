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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '../../theme';
import { adminService, AdminTour, TourStatus } from '../../services';
import type { AdminTabScreenProps } from '../../types';

type Props = AdminTabScreenProps<'AdminTours'>;

const STATUS_FILTERS: { label: string; value: TourStatus | 'all' }[] = [
  { label: 'Todos', value: 'all' },
  { label: 'Publicados', value: 'published' },
  { label: 'Borrador', value: 'draft' },
  { label: 'Archivados', value: 'archived' },
];

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

  const handlePublish = async (tour: AdminTour) => {
    try {
      if (tour.status === 'published') {
        await adminService.unpublishTour(tour.id);
        Alert.alert('Éxito', 'Tour despublicado');
      } else {
        await adminService.publishTour(tour.id);
        Alert.alert('Éxito', 'Tour publicado');
      }
      fetchTours();
    } catch (error) {
      Alert.alert('Error', 'No se pudo cambiar el estado del tour');
    }
  };

  const handleDelete = (tour: AdminTour) => {
    Alert.alert('Eliminar Tour', `¿Estás seguro de eliminar "${tour.title}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await adminService.deleteTour(tour.id);
            Alert.alert('Éxito', 'Tour eliminado');
            fetchTours();
          } catch (error) {
            Alert.alert('Error', 'No se pudo eliminar el tour');
          }
        },
      },
    ]);
  };

  const formatPrice = (price: number, currency: string) => {
    if (currency === 'CLP') {
      return `$${price.toLocaleString('es-CL')}`;
    }
    return `${price}€`;
  };

  const getStatusColor = (status: TourStatus) => {
    switch (status) {
      case 'published':
        return Colors.success;
      case 'draft':
        return Colors.warning;
      case 'archived':
        return Colors.textTertiary;
    }
  };

  const getStatusLabel = (status: TourStatus) => {
    switch (status) {
      case 'published':
        return 'Publicado';
      case 'draft':
        return 'Borrador';
      case 'archived':
        return 'Archivado';
    }
  };

  const renderTourCard = ({ item: tour }: { item: AdminTour }) => (
    <View style={styles.tourCard}>
      <View style={styles.tourImageContainer}>
        {tour.image ? (
          <Image source={{ uri: tour.image }} style={styles.tourImage} />
        ) : (
          <View style={styles.tourImagePlaceholder}>
            <Text style={styles.tourImagePlaceholderText}>🏔️</Text>
          </View>
        )}
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(tour.status) }]}>
          <Text style={styles.statusBadgeText}>{getStatusLabel(tour.status)}</Text>
        </View>
        {tour.featured && (
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredBadgeText}>⭐</Text>
          </View>
        )}
      </View>

      <View style={styles.tourContent}>
        <Text style={styles.tourTitle} numberOfLines={2}>
          {tour.title}
        </Text>
        <Text style={styles.tourLocation}>📍 {tour.location}</Text>

        <View style={styles.tourMeta}>
          <View style={styles.tourMetaItem}>
            <Text style={styles.tourMetaIcon}>⏱️</Text>
            <Text style={styles.tourMetaText}>{tour.duration}</Text>
          </View>
          <View style={styles.tourMetaItem}>
            <Text style={styles.tourMetaIcon}>👥</Text>
            <Text style={styles.tourMetaText}>{tour.maxParticipants}</Text>
          </View>
          <View style={styles.tourMetaItem}>
            <Text style={styles.tourMetaIcon}>📅</Text>
            <Text style={styles.tourMetaText}>{tour.bookingsCount}</Text>
          </View>
        </View>

        <View style={styles.tourGuide}>
          {tour.guideAvatar ? (
            <Image source={{ uri: tour.guideAvatar }} style={styles.guideAvatar} />
          ) : (
            <View style={styles.guideAvatarPlaceholder}>
              <Text style={styles.guideAvatarText}>{tour.guideName.charAt(0)}</Text>
            </View>
          )}
          <Text style={styles.guideName}>{tour.guideName}</Text>
        </View>

        <View style={styles.tourFooter}>
          <Text style={styles.tourPrice}>{formatPrice(tour.price, tour.currency)}</Text>
          <View style={styles.tourRating}>
            <Text style={styles.tourRatingText}>⭐ {tour.rating.toFixed(1)}</Text>
            <Text style={styles.tourReviews}>({tour.reviewCount})</Text>
          </View>
        </View>

        <View style={styles.tourActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => Alert.alert('Editar', 'Funcionalidad próximamente')}
          >
            <Text style={styles.actionButtonText}>✏️ Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.actionButton,
              tour.status === 'published' ? styles.unpublishButton : styles.publishButton,
            ]}
            onPress={() => handlePublish(tour)}
          >
            <Text style={styles.actionButtonText}>
              {tour.status === 'published' ? '📴 Despublicar' : '📢 Publicar'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDelete(tour)}
          >
            <Text style={styles.deleteButtonText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tours</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => Alert.alert('Nuevo Tour', 'Funcionalidad próximamente')}
        >
          <Text style={styles.addButtonText}>+ Nuevo</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar tours..."
            placeholderTextColor={Colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Status Filter */}
      <View style={styles.filterContainer}>
        {STATUS_FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter.value}
            style={[styles.filterButton, statusFilter === filter.value && styles.filterButtonActive]}
            onPress={() => setStatusFilter(filter.value)}
          >
            <Text
              style={[
                styles.filterButtonText,
                statusFilter === filter.value && styles.filterButtonTextActive,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tours List */}
      <FlatList
        data={tours}
        renderItem={renderTourCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🏔️</Text>
            <Text style={styles.emptyTitle}>No hay tours</Text>
            <Text style={styles.emptyText}>Crea tu primer tour para empezar</Text>
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
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  headerTitle: {
    ...Typography.h2,
    color: Colors.text,
  },
  addButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
  },
  addButtonText: {
    ...Typography.labelLarge,
    color: Colors.textInverse,
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
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
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
  // Filter
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  filterButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 20,
    backgroundColor: Colors.card,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
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
    paddingBottom: 100,
  },
  // Tour Card
  tourCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  tourImageContainer: {
    position: 'relative',
  },
  tourImage: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  tourImagePlaceholder: {
    width: '100%',
    height: 160,
    backgroundColor: Colors.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tourImagePlaceholderText: {
    fontSize: 48,
  },
  statusBadge: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
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
    backgroundColor: Colors.secondary,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredBadgeText: {
    fontSize: 14,
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
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  tourMeta: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  tourMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tourMetaIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  tourMetaText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  tourGuide: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  guideAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: Spacing.xs,
  },
  guideAvatarPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.xs,
  },
  guideAvatarText: {
    ...Typography.caption,
    color: Colors.textInverse,
    fontWeight: '700',
  },
  guideName: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  tourFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  tourPrice: {
    ...Typography.h4,
    color: Colors.primary,
    fontWeight: '700',
  },
  tourRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tourRatingText: {
    ...Typography.labelSmall,
    color: Colors.text,
  },
  tourReviews: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginLeft: 4,
  },
  tourActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: Colors.infoLight,
  },
  publishButton: {
    backgroundColor: Colors.successLight,
  },
  unpublishButton: {
    backgroundColor: Colors.warningLight,
  },
  deleteButton: {
    width: 44,
    flex: 0,
    backgroundColor: Colors.errorLight,
  },
  actionButtonText: {
    ...Typography.caption,
    fontWeight: '600',
  },
  deleteButtonText: {
    fontSize: 16,
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
  },
});

