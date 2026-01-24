import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Typography } from '../../theme';
import { adminService, DashboardData } from '../../services';
import { useAuth } from '../../context';
import type { AdminTabScreenProps } from '../../types';

type Props = AdminTabScreenProps<'Dashboard'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Animated stat card component
const AnimatedStatCard: React.FC<{
  icon: string;
  value: number;
  label: string;
  subLabel: string;
  color: string;
  delay: number;
}> = ({ icon, value, label, subLabel, color, delay }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const countAnim = useRef(new Animated.Value(0)).current;
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Animate count
    Animated.timing(countAnim, {
      toValue: value,
      duration: 1000,
      delay: delay + 200,
      useNativeDriver: false,
    }).start();

    countAnim.addListener(({ value: v }) => {
      setDisplayValue(Math.floor(v));
    });

    return () => countAnim.removeAllListeners();
  }, [value, delay]);

  return (
    <Animated.View
      style={[
        styles.statCard,
        {
          transform: [{ scale: scaleAnim }],
          borderLeftColor: color,
        },
      ]}
    >
      <View style={[styles.statIconContainer, { backgroundColor: color + '15' }]}>
        <Text style={styles.statIcon}>{icon}</Text>
      </View>
      <Text style={styles.statValue}>{displayValue}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statSubLabel}>{subLabel}</Text>
    </Animated.View>
  );
};

export const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const fetchDashboard = useCallback(async () => {
    try {
      setError(null);
      const dashboardData = await adminService.getDashboard();
      setData(dashboardData);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } catch (err: any) {
      console.error('Error fetching dashboard:', err);
      console.log('Response data:', err?.response?.data);
      if (err?.response?.status === 403) {
        setError('No tienes permisos de administrador. Verifica que tu cuenta tenga rol ADMIN y esté asociada a una empresa.');
      } else if (err?.response?.status === 401) {
        setError('Sesión expirada. Por favor inicia sesión nuevamente.');
      } else {
        setError('Error al cargar el dashboard');
      }
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

  const formatPrice = (price: number | string | undefined) => {
    const p = typeof price === 'string' ? parseFloat(price) : (price || 0);
    if (p >= 1000000) {
      return `$${(p / 1000000).toFixed(1)}M`;
    }
    return `$${p.toLocaleString('es-CL')}`;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 19) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return Colors.warning;
      case 'CONFIRMED': return Colors.success;
      case 'COMPLETED': return Colors.primary;
      case 'CANCELLED_USER':
      case 'CANCELLED_COMPANY': return Colors.error;
      default: return Colors.textTertiary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return '⏳';
      case 'CONFIRMED': return '✅';
      case 'COMPLETED': return '🎉';
      case 'CANCELLED_USER':
      case 'CANCELLED_COMPANY': return '❌';
      default: return '📋';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Cargando dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !data) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>{error?.includes('permisos') ? '🔒' : '😕'}</Text>
          <Text style={styles.errorTitle}>
            {error?.includes('permisos') ? 'Acceso denegado' : 'Error'}
          </Text>
          <Text style={styles.errorText}>
            {error || 'Error al cargar el dashboard'}
          </Text>
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {/* Header with Gradient */}
        <LinearGradient
          colors={[Colors.primary, Colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.greeting}>{getGreeting()},</Text>
              <Text style={styles.userName}>{user?.firstName} 👋</Text>
              <View style={styles.companyBadge}>
                <Text style={styles.companyBadgeText}>{data.company.name}</Text>
              </View>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity
                style={styles.messagesButton}
                onPress={() => navigation.navigate('ChatList' as never)}
                activeOpacity={0.8}
              >
                <Text style={styles.messagesIcon}>💬</Text>
                <View style={styles.messagesBadge}>
                  <Text style={styles.messagesBadgeText}>3</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Revenue Card */}
          <View style={styles.revenueCard}>
            <View style={styles.revenueHeader}>
              <Text style={styles.revenueTitle}>Ingresos del mes</Text>
              <View style={styles.revenueTrend}>
                <Text style={styles.revenueTrendText}>↑ 12%</Text>
              </View>
            </View>
            <Text style={styles.revenueAmount}>{formatPrice(data.stats.monthlyRevenue)}</Text>
            <View style={styles.revenueBar}>
              <View style={[styles.revenueBarFill, { width: '75%' }]} />
            </View>
            <Text style={styles.revenueGoal}>75% de la meta mensual</Text>
          </View>
        </LinearGradient>

        {/* Alerts */}
        {data.alerts.length > 0 && (
          <Animated.View style={[styles.alertsContainer, { opacity: fadeAnim }]}>
            {data.alerts.map((alert, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.alertCard,
                  alert.type === 'pending_booking' && styles.alertCardWarning,
                ]}
                onPress={() => {
                  if (alert.type === 'pending_booking') {
                    navigation.navigate('AdminBookings' as never);
                  }
                }}
              >
                <View style={styles.alertContent}>
                  <View
                    style={[
                      styles.alertIconBg,
                      { backgroundColor: alert.type === 'pending_booking' ? Colors.warning + '20' : Colors.accent + '20' },
                    ]}
                  >
                    <Text style={styles.alertIconText}>
                      {alert.type === 'pending_booking' ? '📋' : '⭐'}
                    </Text>
                  </View>
                  <View style={styles.alertTextContainer}>
                    <Text style={styles.alertMessage}>{alert.message}</Text>
                    <Text style={styles.alertAction}>Toca para ver →</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </Animated.View>
        )}

        {/* Stats Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Resumen general</Text>
          <View style={styles.statsGrid}>
            <AnimatedStatCard
              icon="🎯"
              value={data.stats.totalTours}
              label="Tours"
              subLabel={`${data.stats.activeTours} activos`}
              color={Colors.primary}
              delay={0}
            />
            <AnimatedStatCard
              icon="👥"
              value={data.stats.totalGuides}
              label="Guías"
              subLabel={`${data.stats.activeGuides} activos`}
              color={Colors.accent}
              delay={100}
            />
            <AnimatedStatCard
              icon="📅"
              value={data.stats.totalBookings}
              label="Reservas"
              subLabel={`${data.stats.pendingBookings} pendientes`}
              color={Colors.success}
              delay={200}
            />
            <AnimatedStatCard
              icon="⭐"
              value={Math.round(data.stats.averageRating * 10) / 10}
              label="Rating"
              subLabel="Promedio"
              color={Colors.warning}
              delay={300}
            />
          </View>
        </View>

        {/* Recent Bookings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📋 Reservas recientes</Text>
            <TouchableOpacity
              style={styles.seeAllButton}
              onPress={() => navigation.navigate('AdminBookings' as never)}
            >
              <Text style={styles.seeAllText}>Ver todas</Text>
            </TouchableOpacity>
          </View>
          
          {data.recentBookings.length === 0 ? (
            <View style={styles.emptyBookings}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyText}>No hay reservas recientes</Text>
            </View>
          ) : (
            data.recentBookings.slice(0, 4).map((booking, index) => (
              <Animated.View
                key={booking.id}
                style={[
                  styles.bookingCard,
                  { opacity: fadeAnim },
                ]}
              >
                <View style={styles.bookingLeft}>
                  <View style={styles.bookingStatusIndicator}>
                    <View
                      style={[
                        styles.statusDot,
                        { backgroundColor: getStatusColor(booking.status) },
                      ]}
                    />
                  </View>
                  <View style={styles.bookingInfo}>
                    <Text style={styles.bookingReference}>{booking.reference}</Text>
                    <Text style={styles.bookingTour} numberOfLines={1}>
                      {booking.tour.title}
                    </Text>
            <Text style={styles.bookingUser}>
              👤 {booking.user.name} • {booking.participants || booking.groupSize} personas
            </Text>
                  </View>
                </View>
                <View style={styles.bookingRight}>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(booking.status) + '15' },
                    ]}
                  >
                    <Text style={styles.statusBadgeIcon}>{getStatusIcon(booking.status)}</Text>
                  </View>
                  <Text style={styles.bookingPrice}>{formatPrice(booking.totalPrice)}</Text>
                </View>
              </Animated.View>
            ))
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Acciones rápidas</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('AdminTours' as never)}
            >
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.actionGradient}
              >
                <Text style={styles.actionIcon}>➕</Text>
              </LinearGradient>
              <Text style={styles.actionText}>Nuevo Tour</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('AdminGuides' as never)}
            >
              <LinearGradient
                colors={['#f093fb', '#f5576c']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.actionGradient}
              >
                <Text style={styles.actionIcon}>👤</Text>
              </LinearGradient>
              <Text style={styles.actionText}>Invitar Guía</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('AdminBookings' as never)}
            >
              <LinearGradient
                colors={['#4facfe', '#00f2fe']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.actionGradient}
              >
                <Text style={styles.actionIcon}>📊</Text>
              </LinearGradient>
              <Text style={styles.actionText}>Ver Stats</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('AdminSettings' as never)}
            >
              <LinearGradient
                colors={['#fa709a', '#fee140']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.actionGradient}
              >
                <Text style={styles.actionIcon}>⚙️</Text>
              </LinearGradient>
              <Text style={styles.actionText}>Configurar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Performance Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏆 Rendimiento</Text>
          <View style={styles.performanceCard}>
            <View style={styles.performanceItem}>
              <Text style={styles.performanceLabel}>Tasa de confirmación</Text>
              <View style={styles.performanceBarContainer}>
                <View style={[styles.performanceBar, { width: '85%', backgroundColor: Colors.success }]} />
              </View>
              <Text style={styles.performanceValue}>85%</Text>
            </View>
            <View style={styles.performanceItem}>
              <Text style={styles.performanceLabel}>Satisfacción cliente</Text>
              <View style={styles.performanceBarContainer}>
                <View style={[styles.performanceBar, { width: '92%', backgroundColor: Colors.primary }]} />
              </View>
              <Text style={styles.performanceValue}>92%</Text>
            </View>
            <View style={styles.performanceItem}>
              <Text style={styles.performanceLabel}>Tours completados</Text>
              <View style={styles.performanceBarContainer}>
                <View style={[styles.performanceBar, { width: '78%', backgroundColor: Colors.accent }]} />
              </View>
              <Text style={styles.performanceValue}>78%</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 120 }} />
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
  loadingText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  errorTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  errorText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
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

  // Header Gradient
  headerGradient: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
  },
  greeting: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.8)',
  },
  userName: {
    ...Typography.h2,
    color: Colors.textInverse,
    fontWeight: '700',
  },
  companyBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: Spacing.xs,
    alignSelf: 'flex-start',
  },
  companyBadgeText: {
    ...Typography.caption,
    color: Colors.textInverse,
    fontWeight: '600',
  },
  messagesButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  messagesIcon: {
    fontSize: 22,
  },
  messagesBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.error,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  messagesBadgeText: {
    ...Typography.caption,
    color: Colors.textInverse,
    fontSize: 10,
    fontWeight: '700',
  },
  companyLogo: {
    width: 56,
    height: 56,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  companyLogoPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  companyLogoText: {
    ...Typography.h3,
    color: Colors.textInverse,
  },

  // Revenue Card
  revenueCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginHorizontal: Spacing.lg,
    borderRadius: 20,
    padding: Spacing.lg,
    backdropFilter: 'blur(10px)',
  },
  revenueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  revenueTitle: {
    ...Typography.labelLarge,
    color: 'rgba(255,255,255,0.8)',
  },
  revenueTrend: {
    backgroundColor: 'rgba(74, 222, 128, 0.3)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },
  revenueTrendText: {
    ...Typography.caption,
    color: '#4ade80',
    fontWeight: '700',
  },
  revenueAmount: {
    ...Typography.h1,
    color: Colors.textInverse,
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: -1,
  },
  revenueBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  revenueBarFill: {
    height: '100%',
    backgroundColor: Colors.textInverse,
    borderRadius: 3,
  },
  revenueGoal: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.7)',
  },

  // Alerts
  alertsContainer: {
    padding: Spacing.lg,
    paddingBottom: 0,
    marginTop: -Spacing.lg,
  },
  alertCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  alertCardWarning: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning,
  },
  alertContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  alertIconText: {
    fontSize: 20,
  },
  alertTextContainer: {
    flex: 1,
  },
  alertMessage: {
    ...Typography.labelLarge,
    color: Colors.text,
  },
  alertAction: {
    ...Typography.caption,
    color: Colors.primary,
    marginTop: 2,
  },

  // Section
  section: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
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
  seeAllButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
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
    width: (SCREEN_WIDTH - Spacing.lg * 2 - Spacing.md) / 2,
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: Spacing.md,
    borderLeftWidth: 4,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statIcon: {
    fontSize: 22,
  },
  statValue: {
    ...Typography.h2,
    color: Colors.text,
    fontWeight: '700',
  },
  statLabel: {
    ...Typography.labelLarge,
    color: Colors.text,
  },
  statSubLabel: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },

  // Bookings
  emptyBookings: {
    alignItems: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.card,
    borderRadius: 16,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  bookingCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  bookingLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  bookingStatusIndicator: {
    width: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  bookingInfo: {
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
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  bookingRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  statusBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusBadgeIcon: {
    fontSize: 14,
  },
  bookingPrice: {
    ...Typography.labelLarge,
    color: Colors.text,
    fontWeight: '700',
  },

  // Actions
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  actionCard: {
    width: (SCREEN_WIDTH - Spacing.lg * 2 - Spacing.md) / 2,
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: Spacing.md,
    alignItems: 'center',
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionGradient: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  actionIcon: {
    fontSize: 24,
  },
  actionText: {
    ...Typography.labelLarge,
    color: Colors.text,
    fontWeight: '600',
  },

  // Performance
  performanceCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: Spacing.lg,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  performanceItem: {
    marginBottom: Spacing.md,
  },
  performanceLabel: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  performanceBarContainer: {
    height: 8,
    backgroundColor: Colors.borderLight,
    borderRadius: 4,
    marginBottom: 4,
  },
  performanceBar: {
    height: '100%',
    borderRadius: 4,
  },
  performanceValue: {
    ...Typography.labelSmall,
    color: Colors.text,
    fontWeight: '700',
    textAlign: 'right',
  },
});
