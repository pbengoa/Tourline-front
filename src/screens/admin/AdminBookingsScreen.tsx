import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Typography } from '../../theme';
import { adminService, AdminBooking, BookingStats } from '../../services';
import type { AdminTabScreenProps } from '../../types';

type Props = AdminTabScreenProps<'AdminBookings'>;
type BookingStatusFilter = 'all' | 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const STATUS_CONFIG: Record<string, { icon: string; label: string; color: string; bg: string }> = {
  PENDING: { icon: '⏳', label: 'Pendiente', color: Colors.warning, bg: Colors.warningLight },
  CONFIRMED: { icon: '✅', label: 'Confirmada', color: Colors.success, bg: Colors.successLight },
  COMPLETED: { icon: '🎉', label: 'Completada', color: Colors.primary, bg: Colors.primaryMuted },
  CANCELLED: { icon: '❌', label: 'Cancelada', color: Colors.error, bg: Colors.errorLight },
  CANCELLED_USER: { icon: '❌', label: 'Cancelada', color: Colors.error, bg: Colors.errorLight },
  CANCELLED_COMPANY: { icon: '❌', label: 'Rechazada', color: Colors.error, bg: Colors.errorLight },
  NO_SHOW: { icon: '👻', label: 'No asistió', color: Colors.textTertiary, bg: Colors.surface },
  REFUNDED: { icon: '💰', label: 'Reembolsada', color: Colors.accent, bg: Colors.accentLight || Colors.surface },
};

const STATUS_FILTERS: { label: string; value: BookingStatusFilter; icon: string }[] = [
  { label: 'Todas', value: 'all', icon: '📋' },
  { label: 'Pendientes', value: 'PENDING', icon: '⏳' },
  { label: 'Confirmadas', value: 'CONFIRMED', icon: '✅' },
  { label: 'Completadas', value: 'COMPLETED', icon: '🎉' },
  { label: 'Canceladas', value: 'CANCELLED', icon: '❌' },
];

// Animated Stat Card
const StatCard: React.FC<{
  title: string;
  value: string;
  subtext: string;
  gradient: string[];
  icon: string;
}> = ({ title, value, subtext, gradient, icon }) => (
  <LinearGradient
    colors={gradient}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={styles.miniStatCard}
  >
    <Text style={styles.miniStatIcon}>{icon}</Text>
    <Text style={styles.miniStatValue}>{value}</Text>
    <Text style={styles.miniStatTitle}>{title}</Text>
    <Text style={styles.miniStatSubtext}>{subtext}</Text>
  </LinearGradient>
);

// Booking Card Component with actions
const BookingCard: React.FC<{
  booking: AdminBooking;
  onConfirm: () => void;
  onCancel: () => void;
  onView: () => void;
}> = ({ booking, onConfirm, onCancel, onView }) => {
  const config = STATUS_CONFIG[booking.status] || STATUS_CONFIG.PENDING;
  const isPending = booking.status === 'PENDING';

  const formatPrice = (price: number | string | undefined) => {
    const p = typeof price === 'string' ? parseFloat(price) : (price || 0);
    return `$${p.toLocaleString('es-CL')}`;
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <TouchableOpacity style={styles.bookingCard} onPress={onView} activeOpacity={0.9}>
      {/* Status indicator line */}
      <View style={[styles.cardStatusLine, { backgroundColor: config.color }]} />
      
      <View style={styles.cardContent}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Text style={styles.cardReference}>{booking.reference}</Text>
            <View style={[styles.cardStatusBadge, { backgroundColor: config.bg }]}>
              <Text style={[styles.cardStatusText, { color: config.color }]}>
                {config.icon} {config.label}
              </Text>
            </View>
          </View>
          <Text style={styles.cardPrice}>{formatPrice(booking.totalPrice)}</Text>
        </View>

        {/* Tour Info */}
        <Text style={styles.cardTourTitle} numberOfLines={1}>
          {booking.tour.title}
        </Text>
        {booking.guide?.name && (
          <Text style={styles.cardGuide}>con {booking.guide.name}</Text>
        )}

        {/* Details Row */}
        <View style={styles.cardDetailsRow}>
          <View style={styles.cardDetailItem}>
            <Text style={styles.cardDetailIcon}>📅</Text>
            <Text style={styles.cardDetailText}>{formatDate(booking.date)}</Text>
          </View>
          <View style={styles.cardDetailItem}>
            <Text style={styles.cardDetailIcon}>⏰</Text>
            <Text style={styles.cardDetailText}>{booking.startTime}</Text>
          </View>
          <View style={styles.cardDetailItem}>
            <Text style={styles.cardDetailIcon}>👥</Text>
            <Text style={styles.cardDetailText}>{booking.participants || booking.groupSize}</Text>
          </View>
        </View>

        {/* Customer */}
        <View style={styles.cardCustomer}>
          <View style={styles.customerAvatar}>
            <Text style={styles.customerInitial}>{booking.user.name.charAt(0)}</Text>
          </View>
          <View style={styles.customerInfo}>
            <Text style={styles.customerName}>{booking.user.name}</Text>
            <Text style={styles.customerEmail}>{booking.user.email}</Text>
          </View>
        </View>

        {/* Actions for pending bookings */}
        {isPending && (
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={[styles.cardActionButton, styles.confirmButton]}
              onPress={onConfirm}
            >
              <Text style={styles.confirmButtonText}>✓ Confirmar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.cardActionButton, styles.rejectButton]}
              onPress={onCancel}
            >
              <Text style={styles.rejectButtonText}>✕ Rechazar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export const AdminBookingsScreen: React.FC<Props> = ({ navigation }) => {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [stats, setStats] = useState<BookingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<BookingStatusFilter>('all');
  const [showStats, setShowStats] = useState(true);
  const scrollY = useRef(new Animated.Value(0)).current;

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

  const formatPriceCompact = (price: number | string | undefined) => {
    const p = typeof price === 'string' ? parseFloat(price) : (price || 0);
    if (p >= 1000000) {
      return `$${(p / 1000000).toFixed(1)}M`;
    }
    return `$${p.toLocaleString('es-CL')}`;
  };

  const handleConfirmBooking = (booking: AdminBooking) => {
    Alert.alert(
      'Confirmar Reserva',
      `¿Confirmar la reserva ${booking.reference} de ${booking.user.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              await adminService.confirmBooking(booking.id);
              Alert.alert('Éxito', 'Reserva confirmada. El cliente será notificado.');
              fetchData();
            } catch (error) {
              Alert.alert('Error', 'No se pudo confirmar la reserva');
            }
          },
        },
      ]
    );
  };

  const handleCancelBooking = (booking: AdminBooking) => {
    Alert.alert(
      'Rechazar Reserva',
      `¿Rechazar la reserva ${booking.reference}? El cliente será notificado.`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Rechazar',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminService.cancelBooking(booking.id, 'Rechazada por la empresa');
              Alert.alert('Reserva rechazada', 'El cliente ha sido notificado');
              fetchData();
            } catch (error) {
              Alert.alert('Error', 'No se pudo rechazar la reserva');
            }
          },
        },
      ]
    );
  };

  const handleViewBooking = (booking: AdminBooking) => {
    Alert.alert('Detalle', `Ver detalle de reserva ${booking.reference}`);
  };

  // Count pending for badge
  const pendingCount = bookings.filter((b) => b.status === 'PENDING').length;

  const renderHeader = () => (
    <>
      {/* Stats Cards */}
      {showStats && stats && (
        <View style={styles.statsSection}>
          <View style={styles.statsRow}>
            <StatCard
              title="Hoy"
              value={formatPriceCompact(stats.today.revenue)}
              subtext={`${stats.today.bookings} reservas`}
              gradient={[Colors.primary, Colors.primaryDark]}
              icon="📊"
            />
            <StatCard
              title="Esta semana"
              value={formatPriceCompact(stats.thisWeek.revenue)}
              subtext={`${stats.thisWeek.bookings} reservas`}
              gradient={['#667eea', '#764ba2']}
              icon="📈"
            />
          </View>
          <View style={styles.statsRow}>
            <StatCard
              title="Este mes"
              value={formatPriceCompact(stats.thisMonth.revenue)}
              subtext={`${stats.thisMonth.bookings} reservas`}
              gradient={['#f093fb', '#f5576c']}
              icon="💰"
            />
            <View style={styles.statusSummaryCard}>
              <Text style={styles.statusSummaryTitle}>Estado de reservas</Text>
              <View style={styles.statusSummaryRow}>
                <View style={styles.statusSummaryItem}>
                  <View style={[styles.statusDot, { backgroundColor: Colors.warning }]} />
                  <Text style={styles.statusSummaryText}>{stats.byStatus.pending}</Text>
                </View>
                <View style={styles.statusSummaryItem}>
                  <View style={[styles.statusDot, { backgroundColor: Colors.success }]} />
                  <Text style={styles.statusSummaryText}>{stats.byStatus.confirmed}</Text>
                </View>
                <View style={styles.statusSummaryItem}>
                  <View style={[styles.statusDot, { backgroundColor: Colors.primary }]} />
                  <Text style={styles.statusSummaryText}>{stats.byStatus.completed}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Top Tours */}
          <View style={styles.topToursCard}>
            <Text style={styles.topToursTitle}>🏆 Top Tours del mes</Text>
            {stats.topTours.slice(0, 3).map((tour, index) => (
              <View key={tour.id} style={styles.topTourItem}>
                <View style={styles.topTourRank}>
                  <Text style={styles.topTourRankText}>{index + 1}</Text>
                </View>
                <Text style={styles.topTourName} numberOfLines={1}>
                  {tour.title}
                </Text>
                <Text style={styles.topTourRevenue}>{formatPriceCompact(tour.revenue)}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Section title */}
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>
          {statusFilter === 'all' ? 'Todas las reservas' : STATUS_CONFIG[statusFilter]?.label || statusFilter}
        </Text>
        <Text style={styles.listCount}>{bookings.length} resultados</Text>
      </View>
    </>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Cargando reservas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Reservas</Text>
          {pendingCount > 0 && (
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingBadgeText}>{pendingCount}</Text>
            </View>
          )}
        </View>
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

      {/* Bookings List */}
      <FlatList
        data={bookings}
        renderItem={({ item }) => (
          <BookingCard
            booking={item}
            onConfirm={() => handleConfirmBooking(item)}
            onCancel={() => handleCancelBooking(item)}
            onView={() => handleViewBooking(item)}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyTitle}>No hay reservas</Text>
            <Text style={styles.emptyText}>
              {statusFilter !== 'all'
                ? `No tienes reservas ${STATUS_CONFIG[statusFilter]?.label.toLowerCase() || ''}`
                : 'Las reservas aparecerán aquí cuando lleguen'}
            </Text>
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    ...Typography.h2,
    color: Colors.text,
  },
  pendingBadge: {
    backgroundColor: Colors.warning,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.sm,
  },
  pendingBadgeText: {
    ...Typography.caption,
    color: Colors.textInverse,
    fontWeight: '700',
  },
  statsToggle: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.card,
    borderRadius: 8,
  },
  statsToggleText: {
    ...Typography.labelSmall,
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
    fontSize: 14,
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
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  listTitle: {
    ...Typography.h4,
    color: Colors.text,
  },
  listCount: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },

  // Stats Section
  statsSection: {
    marginBottom: Spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  miniStatCard: {
    flex: 1,
    borderRadius: 16,
    padding: Spacing.md,
  },
  miniStatIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  miniStatValue: {
    ...Typography.h3,
    color: Colors.textInverse,
    fontWeight: '700',
  },
  miniStatTitle: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.8)',
  },
  miniStatSubtext: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
  },
  statusSummaryCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: Spacing.md,
    justifyContent: 'center',
  },
  statusSummaryTitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  statusSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statusSummaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  statusSummaryText: {
    ...Typography.h4,
    color: Colors.text,
    fontWeight: '700',
  },

  // Top Tours
  topToursCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: Spacing.md,
  },
  topToursTitle: {
    ...Typography.labelLarge,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  topTourItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  topTourRank: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: Colors.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  topTourRankText: {
    ...Typography.labelSmall,
    color: Colors.primary,
    fontWeight: '700',
  },
  topTourName: {
    ...Typography.body,
    color: Colors.text,
    flex: 1,
  },
  topTourRevenue: {
    ...Typography.labelLarge,
    color: Colors.text,
    fontWeight: '600',
  },

  // Booking Card
  bookingCard: {
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
  cardStatusLine: {
    height: 4,
  },
  cardContent: {
    padding: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  cardReference: {
    ...Typography.labelLarge,
    color: Colors.primary,
    fontWeight: '700',
  },
  cardStatusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  cardStatusText: {
    ...Typography.caption,
    fontWeight: '600',
  },
  cardPrice: {
    ...Typography.h4,
    color: Colors.text,
    fontWeight: '700',
  },
  cardTourTitle: {
    ...Typography.h5,
    color: Colors.text,
    marginBottom: 2,
  },
  cardGuide: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  cardDetailsRow: {
    flexDirection: 'row',
    gap: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    marginBottom: Spacing.sm,
  },
  cardDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardDetailIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  cardDetailText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  cardCustomer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: Spacing.sm,
  },
  customerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  customerInitial: {
    ...Typography.labelLarge,
    color: Colors.textInverse,
    fontWeight: '700',
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    ...Typography.labelLarge,
    color: Colors.text,
  },
  customerEmail: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },
  cardActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  cardActionButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: 10,
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: Colors.success,
  },
  confirmButtonText: {
    ...Typography.labelLarge,
    color: Colors.textInverse,
    fontWeight: '600',
  },
  rejectButton: {
    backgroundColor: Colors.errorLight,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  rejectButtonText: {
    ...Typography.labelLarge,
    color: Colors.error,
    fontWeight: '600',
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
