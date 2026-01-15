import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Typography } from '../../theme';
import { bookingsService, Booking, BookingStatus } from '../../services/bookingsService';
import { useAuth } from '../../context/AuthContext';
import type { RootStackScreenProps } from '../../types';

type Props = RootStackScreenProps<'MyBookings'>;
type BookingFilter = 'all' | 'upcoming' | 'past';

const MONTHS_ES = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun',
  'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
];

const STATUS_CONFIG: Record<BookingStatus, { icon: string; label: string; color: string }> = {
  PENDING: { icon: '⏳', label: 'Pendiente', color: Colors.warning },
  CONFIRMED: { icon: '✅', label: 'Confirmada', color: Colors.success },
  CANCELLED_USER: { icon: '❌', label: 'Cancelada', color: Colors.error },
  CANCELLED_COMPANY: { icon: '❌', label: 'Cancelada', color: Colors.error },
  COMPLETED: { icon: '🎉', label: 'Completada', color: Colors.primary },
  NO_SHOW: { icon: '👻', label: 'No asistió', color: Colors.textTertiary },
  REFUNDED: { icon: '💰', label: 'Reembolsada', color: Colors.accent },
};

export const MyBookingsScreen: React.FC<Props> = ({ navigation }) => {
  const { isAuthenticated, user } = useAuth();
  const [filter, setFilter] = useState<BookingFilter>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState<string | null>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const fetchBookings = useCallback(async () => {
    // Si no está autenticado, no hacer fetch
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    
    try {
      setError(null);
      const response = await bookingsService.getMyBookings({ limit: 50 });
      setBookings(response.data || []);
    } catch (err: any) {
      console.log('Error fetching bookings:', err);
      // Solo mostrar error si es algo diferente a 401
      if (err?.response?.status !== 401) {
        setError('No se pudieron cargar las reservas');
      }
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);


  const filteredBookings = bookings.filter((booking) => {
    const bookingDate = new Date(booking.date);

    switch (filter) {
      case 'upcoming':
        return (
          bookingDate >= today && 
          (booking.status === 'CONFIRMED' || booking.status === 'PENDING')
        );
      case 'past':
        return (
          bookingDate < today ||
          booking.status === 'COMPLETED' ||
          booking.status === 'CANCELLED_USER' ||
          booking.status === 'CANCELLED_COMPANY'
        );
      default:
        return true;
    }
  }).sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    const day = date.getDate();
    const month = MONTHS_ES[date.getMonth()];
    return `${day} ${month}`;
  };

  const formatPrice = (price: number, currency: string = 'CLP') => {
    if (currency === 'CLP') {
      return `$${price.toLocaleString('es-CL')}`;
    }
    return `€${price}`;
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchBookings();
    setRefreshing(false);
  };

  const handleBookingPress = (booking: Booking) => {
    navigation.navigate('BookingDetail', { bookingId: booking.id });
  };

  const renderBookingCard = ({ item: booking }: { item: Booking }) => {
    const statusConfig = STATUS_CONFIG[booking.status] || STATUS_CONFIG.PENDING;
    const isUpcoming =
      new Date(booking.date) >= today &&
      (booking.status === 'CONFIRMED' || booking.status === 'PENDING');

    const tourName = booking.tour?.name || 'Tour';
    const companyName = booking.tour?.company?.name || 'Empresa';
    const coverImage = booking.tour?.coverImage;

    return (
      <TouchableOpacity
        style={styles.bookingCard}
        onPress={() => handleBookingPress(booking)}
        activeOpacity={0.9}
      >
        <View style={styles.bookingImageContainer}>
          {coverImage ? (
            <Image source={{ uri: coverImage }} style={styles.bookingImage} />
          ) : (
            <View style={styles.bookingImagePlaceholder}>
              <Text style={styles.bookingImageEmoji}>🏔️</Text>
            </View>
          )}
        </View>

        <View style={styles.bookingContent}>
          <View style={styles.bookingHeader}>
            <View style={styles.bookingInfo}>
              <Text style={styles.bookingTitle} numberOfLines={1}>
                {tourName}
              </Text>
              <Text style={styles.bookingCompany}>🏢 {companyName}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusConfig.color + '20' }]}>
              <Text style={[styles.statusText, { color: statusConfig.color }]}>
                {statusConfig.icon} {statusConfig.label}
              </Text>
            </View>
          </View>

          <View style={styles.bookingDetails}>
            <View style={styles.detailItem}>
              <Text style={styles.detailIcon}>📅</Text>
              <Text style={styles.detailText}>{formatDate(booking.date)}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailIcon}>⏰</Text>
              <Text style={styles.detailText}>{booking.startTime}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailIcon}>👥</Text>
              <Text style={styles.detailText}>{booking.participants}</Text>
            </View>
          </View>

          <View style={styles.bookingFooter}>
            <Text style={styles.bookingPrice}>
              {formatPrice(booking.totalPrice, booking.currency)}
            </Text>
            <Text style={styles.bookingReference}>
              #{booking.reference || booking.id.slice(-8).toUpperCase()}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📋</Text>
      <Text style={styles.emptyTitle}>
        {filter === 'upcoming'
          ? 'No tienes reservas próximas'
          : filter === 'past'
            ? 'No tienes reservas pasadas'
            : 'No tienes reservas aún'}
      </Text>
      <Text style={styles.emptyText}>
        Explora los tours disponibles y reserva tu próxima aventura
      </Text>
      <TouchableOpacity
        style={styles.exploreButton}
        onPress={() => navigation.navigate('Main', { screen: 'Search' })}
      >
        <LinearGradient
          colors={[Colors.primary, Colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.exploreButtonGradient}
        >
          <Text style={styles.exploreButtonText}>🔍 Explorar tours</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  // Si no está autenticado, mostrar CTA para login
  const renderLoginPrompt = () => (
    <View style={styles.loginContainer}>
      <Text style={styles.loginIcon}>🔐</Text>
      <Text style={styles.loginTitle}>Inicia sesión</Text>
      <Text style={styles.loginText}>
        Para ver tus reservas necesitas tener una cuenta
      </Text>
      <TouchableOpacity
        style={styles.loginButton}
        onPress={() => navigation.navigate('Main', { screen: 'Profile' })}
      >
        <LinearGradient
          colors={[Colors.primary, Colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.loginButtonGradient}
        >
          <Text style={styles.loginButtonText}>Iniciar sesión</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
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

  // Si no está autenticado, mostrar prompt de login
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        {renderLoginPrompt()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            Todas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'upcoming' && styles.filterTabActive]}
          onPress={() => setFilter('upcoming')}
        >
          <Text style={[styles.filterText, filter === 'upcoming' && styles.filterTextActive]}>
            Próximas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'past' && styles.filterTabActive]}
          onPress={() => setFilter('past')}
        >
          <Text style={[styles.filterText, filter === 'past' && styles.filterTextActive]}>
            Pasadas
          </Text>
        </TouchableOpacity>
      </View>

      {/* Error message */}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      )}

      {/* Bookings List */}
      <FlatList
        data={filteredBookings}
        renderItem={renderBookingCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
          />
        }
        ListEmptyComponent={renderEmptyState}
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
  filterContainer: {
    flexDirection: 'row',
    padding: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  filterTab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 12,
    backgroundColor: Colors.card,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  filterTabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    ...Typography.label,
    color: Colors.textSecondary,
  },
  filterTextActive: {
    color: Colors.textInverse,
  },
  errorBanner: {
    backgroundColor: Colors.errorLight,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderRadius: 12,
  },
  errorText: {
    ...Typography.bodySmall,
    color: Colors.error,
    textAlign: 'center',
  },
  listContent: {
    padding: Spacing.lg,
    paddingTop: 0,
  },
  bookingCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  bookingImageContainer: {
    height: 120,
    backgroundColor: Colors.primaryMuted,
  },
  bookingImage: {
    width: '100%',
    height: '100%',
  },
  bookingImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookingImageEmoji: {
    fontSize: 40,
  },
  bookingContent: {
    padding: Spacing.md,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  bookingInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  bookingTitle: {
    ...Typography.labelLarge,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: 2,
  },
  bookingCompany: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    ...Typography.labelSmall,
    fontWeight: '600',
  },
  bookingDetails: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  detailText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookingPrice: {
    ...Typography.h4,
    color: Colors.primary,
    fontWeight: '700',
  },
  bookingReference: {
    ...Typography.caption,
    color: Colors.textTertiary,
    fontFamily: 'monospace',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
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
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  exploreButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  exploreButtonGradient: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  exploreButtonText: {
    ...Typography.labelLarge,
    color: Colors.textInverse,
    fontWeight: '600',
    textAlign: 'center',
  },
  // Login prompt
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  loginIcon: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  loginTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  loginText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  loginButton: {
    borderRadius: 14,
    overflow: 'hidden',
    minWidth: 200,
  },
  loginButtonGradient: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  loginButtonText: {
    ...Typography.button,
    color: Colors.textInverse,
  },
});
