import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '../../theme';
import { adminService, DashboardData } from '../../services';
import { useAuth } from '../../context';
import type { AdminTabScreenProps } from '../../types';

type Props = AdminTabScreenProps<'Dashboard'>;

export const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = useCallback(async () => {
    try {
      const dashboardData = await adminService.getDashboard();
      setData(dashboardData);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString('es-CL')}`;
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

  if (!data) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error al cargar el dashboard</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchDashboard}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>¡Hola, {user?.firstName}!</Text>
            <Text style={styles.companyName}>{data.company.name}</Text>
          </View>
          {data.company.logo && (
            <Image source={{ uri: data.company.logo }} style={styles.companyLogo} />
          )}
        </View>

        {/* Alerts */}
        {data.alerts.length > 0 && (
          <View style={styles.alertsContainer}>
            {data.alerts.map((alert, index) => (
              <TouchableOpacity key={index} style={styles.alertCard}>
                <View style={styles.alertIcon}>
                  <Text style={styles.alertIconText}>
                    {alert.type === 'pending_booking' ? '📋' : '⭐'}
                  </Text>
                </View>
                <Text style={styles.alertText}>{alert.message}</Text>
                <Text style={styles.alertArrow}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Stats Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>🎯</Text>
              <Text style={styles.statValue}>{data.stats.totalTours}</Text>
              <Text style={styles.statLabel}>Tours</Text>
              <Text style={styles.statSubLabel}>{data.stats.activeTours} activos</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>👥</Text>
              <Text style={styles.statValue}>{data.stats.totalGuides}</Text>
              <Text style={styles.statLabel}>Guías</Text>
              <Text style={styles.statSubLabel}>{data.stats.activeGuides} activos</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>📅</Text>
              <Text style={styles.statValue}>{data.stats.totalBookings}</Text>
              <Text style={styles.statLabel}>Reservas</Text>
              <Text style={styles.statSubLabel}>{data.stats.pendingBookings} pendientes</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>⭐</Text>
              <Text style={styles.statValue}>{data.stats.averageRating.toFixed(1)}</Text>
              <Text style={styles.statLabel}>Rating</Text>
              <Text style={styles.statSubLabel}>Promedio</Text>
            </View>
          </View>
        </View>

        {/* Revenue Card */}
        <View style={styles.section}>
          <View style={styles.revenueCard}>
            <View style={styles.revenueHeader}>
              <Text style={styles.revenueTitle}>Ingresos del mes</Text>
              <Text style={styles.revenueIcon}>💰</Text>
            </View>
            <Text style={styles.revenueAmount}>{formatPrice(data.stats.monthlyRevenue)}</Text>
            <Text style={styles.revenueCurrency}>CLP</Text>
          </View>
        </View>

        {/* Recent Bookings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Reservas recientes</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AdminBookings' as never)}>
              <Text style={styles.seeAllText}>Ver todas</Text>
            </TouchableOpacity>
          </View>
          {data.recentBookings.map((booking) => (
            <View key={booking.id} style={styles.bookingCard}>
              <View style={styles.bookingLeft}>
                <Text style={styles.bookingReference}>{booking.reference}</Text>
                <Text style={styles.bookingTour}>{booking.tour.title}</Text>
                <Text style={styles.bookingUser}>
                  {booking.user.name} • {booking.groupSize} personas
                </Text>
              </View>
              <View style={styles.bookingRight}>
                <View
                  style={[
                    styles.statusBadge,
                    booking.status === 'PENDING' && styles.statusPending,
                    booking.status === 'CONFIRMED' && styles.statusConfirmed,
                    booking.status === 'COMPLETED' && styles.statusCompleted,
                  ]}
                >
                  <Text style={styles.statusText}>
                    {booking.status === 'PENDING'
                      ? 'Pendiente'
                      : booking.status === 'CONFIRMED'
                        ? 'Confirmada'
                        : 'Completada'}
                  </Text>
                </View>
                <Text style={styles.bookingPrice}>{formatPrice(booking.totalPrice)}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acciones rápidas</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('AdminTours' as never)}
            >
              <Text style={styles.actionIcon}>➕</Text>
              <Text style={styles.actionText}>Nuevo Tour</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('AdminGuides' as never)}
            >
              <Text style={styles.actionIcon}>👤</Text>
              <Text style={styles.actionText}>Nuevo Guía</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('AdminBookings' as never)}
            >
              <Text style={styles.actionIcon}>📊</Text>
              <Text style={styles.actionText}>Estadísticas</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('AdminSettings' as never)}
            >
              <Text style={styles.actionIcon}>⚙️</Text>
              <Text style={styles.actionText}>Configuración</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  errorText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
  },
  retryButtonText: {
    ...Typography.labelLarge,
    color: Colors.textInverse,
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  headerLeft: {},
  greeting: {
    ...Typography.h3,
    color: Colors.text,
  },
  companyName: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  companyLogo: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  // Alerts
  alertsContainer: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warningLight,
    padding: Spacing.md,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning,
  },
  alertIcon: {
    marginRight: Spacing.sm,
  },
  alertIconText: {
    fontSize: 18,
  },
  alertText: {
    ...Typography.body,
    color: Colors.text,
    flex: 1,
  },
  alertArrow: {
    fontSize: 20,
    color: Colors.textTertiary,
  },
  // Section
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h4,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  seeAllText: {
    ...Typography.labelLarge,
    color: Colors.primary,
  },
  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  statCard: {
    width: '47%',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: Spacing.md,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 24,
    marginBottom: Spacing.xs,
  },
  statValue: {
    ...Typography.h2,
    color: Colors.text,
  },
  statLabel: {
    ...Typography.labelLarge,
    color: Colors.textSecondary,
  },
  statSubLabel: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },
  // Revenue Card
  revenueCard: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: Spacing.lg,
  },
  revenueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  revenueTitle: {
    ...Typography.labelLarge,
    color: Colors.textInverse,
    opacity: 0.9,
  },
  revenueIcon: {
    fontSize: 24,
  },
  revenueAmount: {
    ...Typography.h1,
    color: Colors.textInverse,
    fontSize: 36,
  },
  revenueCurrency: {
    ...Typography.body,
    color: Colors.textInverse,
    opacity: 0.7,
  },
  // Booking Card
  bookingCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  bookingLeft: {
    flex: 1,
  },
  bookingReference: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '700',
  },
  bookingTour: {
    ...Typography.labelLarge,
    color: Colors.text,
    marginVertical: 2,
  },
  bookingUser: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  bookingRight: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 4,
  },
  statusPending: {
    backgroundColor: Colors.warningLight,
  },
  statusConfirmed: {
    backgroundColor: Colors.successLight,
  },
  statusCompleted: {
    backgroundColor: Colors.infoLight,
  },
  statusText: {
    ...Typography.caption,
    fontWeight: '600',
  },
  bookingPrice: {
    ...Typography.labelLarge,
    color: Colors.text,
    fontWeight: '700',
  },
  // Actions Grid
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  actionCard: {
    width: '47%',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionIcon: {
    fontSize: 28,
    marginBottom: Spacing.xs,
  },
  actionText: {
    ...Typography.labelLarge,
    color: Colors.text,
  },
});

