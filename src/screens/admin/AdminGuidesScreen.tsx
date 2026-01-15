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
import { adminService, AdminGuide } from '../../services';
import type { AdminTabScreenProps } from '../../types';

type Props = AdminTabScreenProps<'AdminGuides'>;

export const AdminGuidesScreen: React.FC<Props> = ({ navigation }) => {
  const [guides, setGuides] = useState<AdminGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(false);

  const fetchGuides = useCallback(async () => {
    try {
      const params: { search?: string; isActive?: boolean } = {};
      if (searchQuery) params.search = searchQuery;
      if (showActiveOnly) params.isActive = true;

      const result = await adminService.getGuides(params);
      setGuides(result.data);
    } catch (error) {
      console.error('Error fetching guides:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery, showActiveOnly]);

  useEffect(() => {
    fetchGuides();
  }, [fetchGuides]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchGuides();
  };

  const handleVerify = async (guide: AdminGuide) => {
    if (guide.isVerified) {
      Alert.alert('Info', 'Este guía ya está verificado');
      return;
    }

    Alert.alert('Verificar Guía', `¿Verificar a "${guide.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Verificar',
        onPress: async () => {
          try {
            await adminService.verifyGuide(guide.id);
            Alert.alert('Éxito', 'Guía verificado');
            fetchGuides();
          } catch (error) {
            Alert.alert('Error', 'No se pudo verificar al guía');
          }
        },
      },
    ]);
  };

  const handleDeactivate = async (guide: AdminGuide) => {
    Alert.alert(
      guide.isActive ? 'Desactivar Guía' : 'Activar Guía',
      `¿${guide.isActive ? 'Desactivar' : 'Activar'} a "${guide.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: guide.isActive ? 'Desactivar' : 'Activar',
          style: guide.isActive ? 'destructive' : 'default',
          onPress: async () => {
            try {
              if (guide.isActive) {
                await adminService.deleteGuide(guide.id);
              } else {
                await adminService.updateGuide(guide.id, {});
              }
              Alert.alert('Éxito', `Guía ${guide.isActive ? 'desactivado' : 'activado'}`);
              fetchGuides();
            } catch (error) {
              Alert.alert('Error', 'No se pudo cambiar el estado del guía');
            }
          },
        },
      ]
    );
  };

  const formatPrice = (price: number, currency: string) => {
    if (currency === 'CLP') {
      return `$${price.toLocaleString('es-CL')}/hora`;
    }
    return `${price}€/hora`;
  };

  const renderGuideCard = ({ item: guide }: { item: AdminGuide }) => (
    <View style={[styles.guideCard, !guide.isActive && styles.guideCardInactive]}>
      <View style={styles.guideHeader}>
        <View style={styles.guideAvatarContainer}>
          {guide.avatar ? (
            <Image source={{ uri: guide.avatar }} style={styles.guideAvatar} />
          ) : (
            <View style={styles.guideAvatarPlaceholder}>
              <Text style={styles.guideAvatarText}>{guide.name.charAt(0)}</Text>
            </View>
          )}
          {guide.isVerified && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓</Text>
            </View>
          )}
        </View>

        <View style={styles.guideInfo}>
          <View style={styles.guideNameRow}>
            <Text style={styles.guideName}>{guide.name}</Text>
            {!guide.isActive && (
              <View style={styles.inactiveBadge}>
                <Text style={styles.inactiveBadgeText}>Inactivo</Text>
              </View>
            )}
          </View>
          <Text style={styles.guideEmail}>{guide.email}</Text>
          <Text style={styles.guideLocation}>📍 {guide.location}</Text>
        </View>
      </View>

      <View style={styles.guideStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>⭐ {guide.rating.toFixed(1)}</Text>
          <Text style={styles.statLabel}>{guide.reviewCount} reseñas</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>🎯 {guide.toursCount}</Text>
          <Text style={styles.statLabel}>Tours</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>📅 {guide.bookingsCount}</Text>
          <Text style={styles.statLabel}>Reservas</Text>
        </View>
      </View>

      <View style={styles.guideLanguages}>
        <Text style={styles.languagesLabel}>Idiomas: </Text>
        <Text style={styles.languagesText}>{guide.languages.join(', ')}</Text>
      </View>

      <View style={styles.guideSpecialties}>
        {guide.specialties.slice(0, 3).map((specialty, index) => (
          <View key={index} style={styles.specialtyTag}>
            <Text style={styles.specialtyText}>{specialty}</Text>
          </View>
        ))}
      </View>

      <View style={styles.guideFooter}>
        <Text style={styles.guidePrice}>{formatPrice(guide.pricePerHour, guide.currency)}</Text>
        <View style={styles.guideActions}>
          {!guide.isVerified && (
            <TouchableOpacity style={styles.verifyButton} onPress={() => handleVerify(guide)}>
              <Text style={styles.verifyButtonText}>✓ Verificar</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.editButton]}
            onPress={() => Alert.alert('Editar', 'Funcionalidad próximamente')}
          >
            <Text style={styles.editButtonText}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, !guide.isActive && styles.activateButton]}
            onPress={() => handleDeactivate(guide)}
          >
            <Text style={styles.toggleButtonText}>{guide.isActive ? '🚫' : '✓'}</Text>
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
        <Text style={styles.headerTitle}>Guías</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => Alert.alert('Nuevo Guía', 'Funcionalidad próximamente')}
        >
          <Text style={styles.addButtonText}>+ Invitar</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar guías..."
            placeholderTextColor={Colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filter */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, !showActiveOnly && styles.filterButtonActive]}
          onPress={() => setShowActiveOnly(false)}
        >
          <Text
            style={[styles.filterButtonText, !showActiveOnly && styles.filterButtonTextActive]}
          >
            Todos ({guides.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, showActiveOnly && styles.filterButtonActive]}
          onPress={() => setShowActiveOnly(true)}
        >
          <Text style={[styles.filterButtonText, showActiveOnly && styles.filterButtonTextActive]}>
            Solo activos
          </Text>
        </TouchableOpacity>
      </View>

      {/* Guides List */}
      <FlatList
        data={guides}
        renderItem={renderGuideCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={styles.emptyTitle}>No hay guías</Text>
            <Text style={styles.emptyText}>Invita a tu primer guía para empezar</Text>
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
  // Guide Card
  guideCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  guideCardInactive: {
    opacity: 0.7,
    backgroundColor: Colors.surface,
  },
  guideHeader: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  guideAvatarContainer: {
    position: 'relative',
  },
  guideAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  guideAvatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideAvatarText: {
    ...Typography.h3,
    color: Colors.textInverse,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.accent,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.card,
  },
  verifiedText: {
    color: Colors.textInverse,
    fontSize: 12,
    fontWeight: '700',
  },
  guideInfo: {
    flex: 1,
    marginLeft: Spacing.md,
    justifyContent: 'center',
  },
  guideNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  guideName: {
    ...Typography.h4,
    color: Colors.text,
  },
  inactiveBadge: {
    backgroundColor: Colors.errorLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  inactiveBadgeText: {
    ...Typography.caption,
    color: Colors.error,
    fontWeight: '600',
  },
  guideEmail: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  guideLocation: {
    ...Typography.bodySmall,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  guideStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...Typography.labelLarge,
    color: Colors.text,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },
  guideLanguages: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  languagesLabel: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  languagesText: {
    ...Typography.bodySmall,
    color: Colors.text,
  },
  guideSpecialties: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  specialtyTag: {
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },
  specialtyText: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '600',
  },
  guideFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.md,
  },
  guidePrice: {
    ...Typography.h4,
    color: Colors.primary,
    fontWeight: '700',
  },
  guideActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  verifyButton: {
    backgroundColor: Colors.successLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
  },
  verifyButtonText: {
    ...Typography.caption,
    color: Colors.success,
    fontWeight: '600',
  },
  editButton: {
    backgroundColor: Colors.infoLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
  },
  editButtonText: {
    fontSize: 16,
  },
  toggleButton: {
    backgroundColor: Colors.errorLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
  },
  activateButton: {
    backgroundColor: Colors.successLight,
  },
  toggleButtonText: {
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

