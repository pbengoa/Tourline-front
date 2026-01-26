import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Typography } from '../../theme';
import { bookingsService } from '../../services';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Stats {
  totalRevenue: number;
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  averageRating: number;
  totalReviews: number;
  activeTours: number;
  activeGuides: number;
}

type Period = 'week' | 'month' | 'year';

const PERIOD_CONFIG = {
  week: { label: 'Semana', icon: '📅' },
  month: { label: 'Mes', icon: '📆' },
  year: { label: 'Año', icon: '📊' },
};

export const ProviderStatsScreen: React.FC = () => {
  const [period, setPeriod] = useState<Period>('month');
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0,
    totalBookings: 0,
    confirmedBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    averageRating: 0,
    totalReviews: 0,
    activeTours: 0,
    activeGuides: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      // Fetch bookings to calculate stats
      const response = await bookingsService.getMyBookings();
      const bookings = response.data || [];

      // Calculate stats from bookings
      const now = new Date();
      let startDate = new Date();
      
      if (period === 'week') {
        startDate.setDate(now.getDate() - 7);
      } else if (period === 'month') {
        startDate.setMonth(now.getMonth() - 1);
      } else {
        startDate.setFullYear(now.getFullYear() - 1);
      }

      const periodBookings = bookings.filter((b: any) => {
        const bookingDate = new Date(b.createdAt || b.date);
        return bookingDate >= startDate;
      });

      const totalRevenue = periodBookings.reduce((sum: number, b: any) => sum + (b.totalPrice || 0), 0);
      const confirmedBookings = periodBookings.filter((b: any) => b.status === 'CONFIRMED').length;
      const pendingBookings = periodBookings.filter((b: any) => b.status === 'PENDING').length;
      const completedBookings = periodBookings.filter((b: any) => b.status === 'COMPLETED').length;
      const cancelledBookings = periodBookings.filter((b: any) => b.status === 'CANCELLED').length;

      setStats({
        totalRevenue,
        totalBookings: periodBookings.length,
        confirmedBookings,
        pendingBookings,
        completedBookings,
        cancelledBookings,
        averageRating: 4.7, // Mock - would come from reviews API
        totalReviews: 42, // Mock
        activeTours: 8, // Mock - would come from tours API
        activeGuides: 5, // Mock - would come from guides API
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [period]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString('es-CL')}`;
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: string;
    color: string;
    subtitle?: string;
  }> = ({ title, value, icon, color, subtitle }) => (
    <View style={styles.statCard}>
      <View style={[styles.statIconContainer, { backgroundColor: color + '15' }]}>
        <Text style={styles.statIcon}>{icon}</Text>
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  const BigStatCard: React.FC<{
    title: string;
    value: string | number;
    icon: string;
    gradient: string[];
    change?: string;
  }> = ({ title, value, icon, gradient, change }) => (
    <TouchableOpacity style={styles.bigStatCard} activeOpacity={0.9}>
      <LinearGradient colors={gradient} style={styles.bigStatGradient}>
        <View style={styles.bigStatHeader}>
          <Text style={styles.bigStatIcon}>{icon}</Text>
          {change && (
            <View style={styles.changeTag}>
              <Text style={styles.changeText}>{change}</Text>
            </View>
          )}
        </View>
        <Text style={styles.bigStatValue}>{value}</Text>
        <Text style={styles.bigStatTitle}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Stats</Text>
          <Text style={styles.headerSubtitle}>Panel de estadísticas</Text>
        </View>

        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {(Object.keys(PERIOD_CONFIG) as Period[]).map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.periodButton, period === p && styles.periodButtonActive]}
              onPress={() => setPeriod(p)}
              activeOpacity={0.7}
            >
              <Text style={styles.periodIcon}>{PERIOD_CONFIG[p].icon}</Text>
              <Text style={[styles.periodText, period === p && styles.periodTextActive]}>
                {PERIOD_CONFIG[p].label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Big Stats */}
        <View style={styles.bigStatsRow}>
          <BigStatCard
            title="Ingresos Totales"
            value={formatCurrency(stats.totalRevenue)}
            icon="💰"
            gradient={[Colors.success, '#10b981']}
            change="+12.5%"
          />
          <BigStatCard
            title="Reservas Totales"
            value={stats.totalBookings}
            icon="📅"
            gradient={[Colors.primary, Colors.primaryDark]}
            change="+8.3%"
          />
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            title="Confirmadas"
            value={stats.confirmedBookings}
            icon="✅"
            color={Colors.success}
            subtitle={`${((stats.confirmedBookings / (stats.totalBookings || 1)) * 100).toFixed(0)}%`}
          />
          <StatCard
            title="Pendientes"
            value={stats.pendingBookings}
            icon="⏳"
            color={Colors.warning}
            subtitle={`${((stats.pendingBookings / (stats.totalBookings || 1)) * 100).toFixed(0)}%`}
          />
          <StatCard
            title="Completadas"
            value={stats.completedBookings}
            icon="🎉"
            color={Colors.info}
            subtitle={`${((stats.completedBookings / (stats.totalBookings || 1)) * 100).toFixed(0)}%`}
          />
          <StatCard
            title="Canceladas"
            value={stats.cancelledBookings}
            icon="❌"
            color={Colors.error}
            subtitle={`${((stats.cancelledBookings / (stats.totalBookings || 1)) * 100).toFixed(0)}%`}
          />
        </View>

        {/* Performance Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Rendimiento</Text>
          <View style={styles.performanceCard}>
            <View style={styles.performanceRow}>
              <View style={styles.performanceItem}>
                <Text style={styles.performanceIcon}>⭐</Text>
                <View>
                  <Text style={styles.performanceValue}>{stats.averageRating.toFixed(1)}</Text>
                  <Text style={styles.performanceLabel}>Rating Promedio</Text>
                </View>
              </View>
              <View style={styles.performanceItem}>
                <Text style={styles.performanceIcon}>💬</Text>
                <View>
                  <Text style={styles.performanceValue}>{stats.totalReviews}</Text>
                  <Text style={styles.performanceLabel}>Reseñas</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.performanceDivider} />
            
            <View style={styles.performanceRow}>
              <View style={styles.performanceItem}>
                <Text style={styles.performanceIcon}>🗺️</Text>
                <View>
                  <Text style={styles.performanceValue}>{stats.activeTours}</Text>
                  <Text style={styles.performanceLabel}>Tours Activos</Text>
                </View>
              </View>
              <View style={styles.performanceItem}>
                <Text style={styles.performanceIcon}>👥</Text>
                <View>
                  <Text style={styles.performanceValue}>{stats.activeGuides}</Text>
                  <Text style={styles.performanceLabel}>Guías Activos</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Acciones Rápidas</Text>
          <TouchableOpacity style={styles.actionButton} activeOpacity={0.8}>
            <Text style={styles.actionIcon}>📊</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Exportar Reporte</Text>
              <Text style={styles.actionSubtitle}>Descargar reporte completo</Text>
            </View>
            <Text style={styles.actionChevron}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} activeOpacity={0.8}>
            <Text style={styles.actionIcon}>📈</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Ver Tendencias</Text>
              <Text style={styles.actionSubtitle}>Análisis detallado</Text>
            </View>
            <Text style={styles.actionChevron}>›</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 120,
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
  },
  headerSubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  
  // Period Selector
  periodSelector: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  periodButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: 12,
    gap: 6,
  },
  periodButtonActive: {
    backgroundColor: Colors.primary,
  },
  periodIcon: {
    fontSize: 14,
  },
  periodText: {
    ...Typography.labelSmall,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  periodTextActive: {
    color: Colors.textInverse,
  },
  
  // Big Stats
  bigStatsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  bigStatCard: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  bigStatGradient: {
    padding: Spacing.lg,
    minHeight: 140,
    justifyContent: 'space-between',
  },
  bigStatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  bigStatIcon: {
    fontSize: 32,
  },
  changeTag: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  changeText: {
    ...Typography.caption,
    color: Colors.textInverse,
    fontWeight: '700',
  },
  bigStatValue: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textInverse,
    marginTop: Spacing.xs,
  },
  bigStatTitle: {
    ...Typography.bodySmall,
    color: Colors.textInverse,
    opacity: 0.9,
    fontWeight: '600',
  },
  
  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg - 6,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  statCard: {
    width: (SCREEN_WIDTH - Spacing.lg * 2 - Spacing.sm) / 2,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: Spacing.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statIcon: {
    fontSize: 24,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  statTitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  statSubtitle: {
    ...Typography.caption,
    color: Colors.textTertiary,
    fontSize: 10,
    marginTop: 2,
  },
  
  // Section
  section: {
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.h4,
    color: Colors.text,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  
  // Performance Card
  performanceCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  performanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  performanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  performanceIcon: {
    fontSize: 28,
  },
  performanceValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  performanceLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  performanceDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.lg,
  },
  
  // Action Buttons
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIcon: {
    fontSize: 28,
    marginRight: Spacing.md,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    ...Typography.labelLarge,
    color: Colors.text,
    fontWeight: '600',
  },
  actionSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  actionChevron: {
    fontSize: 32,
    color: Colors.textTertiary,
    fontWeight: '300',
  },
});
