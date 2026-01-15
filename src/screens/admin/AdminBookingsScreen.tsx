import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '../../theme';
import { adminService, AdminBooking, BookingStats } from '../../services';
import type { AdminTabScreenProps } from '../../types';

type Props = AdminTabScreenProps<'AdminBookings'>;

type BookingStatusFilter = 'all' | 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

const STATUS_FILTERS: { label: string; value: BookingStatusFilter }[] = [
  { label: 'Todas', value: 'all' },
  { label: 'Pendientes', value: 'PENDING' },
  { label: 'Confirmadas', value: 'CONFIRMED' },
  { label: 'Completadas', value: 'COMPLETED' },
  { label: 'Canceladas', value: 'CANCELLED' },
];

export const AdminBookingsScreen: React.FC<Props> = ({ navigation }) => {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [stats, setStats] = useState<BookingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<BookingStatusFilter>('all');
  const [showStats, setShowStats] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [bookingsResult, statsResult] = await Promise.all([
        adminService.getBookings({
          status: statusFilter === 'all' ? undefined : statusFilter,
        }),
        adminService.getBookingStats(),
      ]);
      setBookings(bookingsResult.data);
      setStats(statsResult);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString('es-CL')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL', {
      day: 'numeric',
      month: 'short',
    });
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { bg: Colors.warningLight, text: Colors.warning };
      case 'CONFIRMED':
        return { bg: Colors.successLight, text: Colors.success };
      case 'COMPLETED':
        return { bg: Colors.infoLight, text: Colors.info };
      case 'CANCELLED':
        return { bg: Colors.errorLight, text: Colors.error };
      default:
        return { bg: Colors.surface, text: Colors.textSecondary };
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Pendiente';
      case 'CONFIRMED':
        return 'Confirmada';
      case 'COMPLETED':
        return 'Completada';
      case 'CANCELLED':
        return 'Cancelada';
      default:
        return status;
    }
  };

  const renderStatsCard = () => {
    if (!stats || !showStats) return null;

    return (
      <View style={styles.statsContainer}>
        {/* Revenue Cards */}
        <View style={styles.revenueRow}>
          <View style={[styles.revenueCard, styles.revenueCardPrimary]}>
            <Text style={styles.revenueCardLabel}>Hoy</Text>
            <Text style={styles.revenueCardValue}>{formatPrice(stats.today.revenue)}</Text>
            <Text style={styles.revenueCardSubtext}>{stats.today.bookings} reservas</Text>
          </View>
          <View style={styles.revenueCard}>
            <Text style={styles.revenueCardLabelDark}>Esta semana</Text>
            <Text style={styles.revenueCardValueDark}>{formatPrice(stats.thisWeek.revenue)}</Text>
            <Text style={styles.revenueCardSubtextDark}>{stats.thisWeek.bookings} reservas</Text>
          </View>
          <View style={styles.revenueCard}>
            <Text style={styles.revenueCardLabelDark}>Este mes</Text>
            <Text style={styles.revenueCardValueDark}>{formatPrice(stats.thisMonth.revenue)}</Text>
            <Text style={styles.revenueCardSubtextDark}>{stats.thisMonth.bookings} reservas</Text>
          </View>
        </View>

        {/* Status Summary */}
        <View style={styles.statusSummary}>
          <View style={styles.statusItem}>
            <View style={[styles.statusDot, { backgroundColor: Colors.warning }]} />
            <Text style={styles.statusItemText}>Pendientes: {stats.byStatus.pending}</Text>
          </View>
          <View style={styles.statusItem}>
            <View style={[styles.statusDot, { backgroundColor: Colors.success }]} />
            <Text style={styles.statusItemText}>Confirmadas: {stats.byStatus.confirmed}</Text>
          </View>
          <View style={styles.statusItem}>
            <View style={[styles.statusDot, { backgroundColor: Colors.info }]} />
            <Text style={styles.statusItemText}>Completadas: {stats.byStatus.completed}</Text>
          </View>
        </View>

        {/* Top Tours */}
        <View style={styles.topSection}>
          <Text style={styles.topSectionTitle}>🏆 Top Tours</Text>
          {stats.topTours.slice(0, 3).map((tour, index) => (
            <View key={tour.id} style={styles.topItem}>
              <Text style={styles.topRank}>{index + 1}</Text>
              <Text style={styles.topName} numberOfLines={1}>
                {tour.title}
              </Text>
              <Text style={styles.topValue}>{formatPrice(tour.revenue)}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderBookingCard = ({ item: booking }: { item: AdminBooking }) => {
    const statusStyle = getStatusStyle(booking.status);

    return (
      <View style={styles.bookingCard}>
        <View style={styles.bookingHeader}>
          <View>
            <Text style={styles.bookingReference}>{booking.reference}</Text>
            <Text style={styles.bookingDate}>
              📅 {formatDate(booking.date)} • {booking.startTime} - {booking.endTime}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusBadgeText, { color: statusStyle.text }]}>
              {getStatusLabel(booking.status)}
            </Text>
          </View>
        </View>

        <View style={styles.bookingTour}>
          <Text style={styles.tourTitle}>{booking.tour.title}</Text>
          <Text style={styles.tourGuide}>con {booking.guide.name}</Text>
        </View>

        <View style={styles.bookingUser}>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>👤 {booking.user.name}</Text>
            <Text style={styles.userEmail}>{booking.user.email}</Text>
          </View>
          <View style={styles.groupInfo}>
            <Text style={styles.groupSize}>{booking.groupSize} personas</Text>
          </View>
        </View>

        <View style={styles.bookingFooter}>
          <Text style={styles.bookingPrice}>{formatPrice(booking.totalPrice)}</Text>
          <TouchableOpacity style={styles.viewButton}>
            <Text style={styles.viewButtonText}>Ver detalle</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

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
        <Text style={styles.headerTitle}>Reservas</Text>
        <TouchableOpacity style={styles.statsToggle} onPress={() => setShowStats(!showStats)}>
          <Text style={styles.statsToggleText}>{showStats ? '📊 Ocultar' : '📊 Mostrar'}</Text>
        </TouchableOpacity>
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

      {/* Bookings List */}
      <FlatList
        data={bookings}
        renderItem={renderBookingCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={renderStatsCard}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.emptyTitle}>No hay reservas</Text>
            <Text style={styles.emptyText}>Las reservas aparecerán aquí</Text>
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
  statsToggle: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  statsToggleText: {
    ...Typography.labelLarge,
    color: Colors.primary,
  },
  // Filter
  filterContainer: {
    marginBottom: Spacing.md,
  },
  filterList: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  filterButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 20,
    backgroundColor: Colors.card,
    marginRight: Spacing.sm,
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
  // Stats
  statsContainer: {
    marginBottom: Spacing.lg,
  },
  revenueRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  revenueCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: Spacing.md,
    alignItems: 'center',
  },
  revenueCardPrimary: {
    backgroundColor: Colors.primary,
  },
  revenueCardLabel: {
    ...Typography.caption,
    color: Colors.textInverse,
    opacity: 0.8,
  },
  revenueCardLabelDark: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  revenueCardValue: {
    ...Typography.h4,
    color: Colors.textInverse,
    fontWeight: '700',
  },
  revenueCardValueDark: {
    ...Typography.h4,
    color: Colors.text,
    fontWeight: '700',
  },
  revenueCardSubtext: {
    ...Typography.caption,
    color: Colors.textInverse,
    opacity: 0.7,
  },
  revenueCardSubtextDark: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },
  statusSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusItemText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  topSection: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: Spacing.md,
  },
  topSectionTitle: {
    ...Typography.labelLarge,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  topItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  topRank: {
    ...Typography.labelLarge,
    color: Colors.primary,
    width: 24,
    fontWeight: '700',
  },
  topName: {
    ...Typography.body,
    color: Colors.text,
    flex: 1,
  },
  topValue: {
    ...Typography.labelLarge,
    color: Colors.text,
    fontWeight: '600',
  },
  // Booking Card
  bookingCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  bookingReference: {
    ...Typography.labelLarge,
    color: Colors.primary,
    fontWeight: '700',
  },
  bookingDate: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    ...Typography.caption,
    fontWeight: '700',
  },
  bookingTour: {
    marginBottom: Spacing.sm,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tourTitle: {
    ...Typography.h5,
    color: Colors.text,
  },
  tourGuide: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  bookingUser: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  userInfo: {},
  userName: {
    ...Typography.body,
    color: Colors.text,
  },
  userEmail: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },
  groupInfo: {
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },
  groupSize: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '600',
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookingPrice: {
    ...Typography.h4,
    color: Colors.text,
    fontWeight: '700',
  },
  viewButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
  },
  viewButtonText: {
    ...Typography.labelSmall,
    color: Colors.textInverse,
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

