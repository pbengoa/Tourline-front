import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Colors, Spacing, Typography } from '../../theme';
import { MOCK_BOOKINGS } from '../../constants/bookingData';
import { BOOKING_STATUS_CONFIG } from '../../types/booking';
import type { RootStackScreenProps, Booking, BookingStatus } from '../../types';

type Props = RootStackScreenProps<'MyBookings'>;
type BookingFilter = 'all' | 'upcoming' | 'past';

const MONTHS_ES = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun',
  'jul', 'ago', 'sep', 'oct', 'nov', 'dic'
];

export const MyBookingsScreen: React.FC<Props> = ({ navigation }) => {
  const [filter, setFilter] = useState<BookingFilter>('all');
  const [refreshing, setRefreshing] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filteredBookings = MOCK_BOOKINGS.filter((booking) => {
    const bookingDate = new Date(booking.date);
    
    switch (filter) {
      case 'upcoming':
        return bookingDate >= today && 
               (booking.status === 'confirmed' || booking.status === 'pending');
      case 'past':
        return bookingDate < today || 
               booking.status === 'completed' || 
               booking.status === 'cancelled' ||
               booking.status === 'rejected';
      default:
        return true;
    }
  }).sort((a, b) => {
    // Sort by date descending (most recent first)
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = MONTHS_ES[date.getMonth()];
    return `${day} ${month}`;
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // TODO: Implement actual refresh
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleBookingPress = (booking: Booking) => {
    navigation.navigate('BookingDetail', { bookingId: booking.id });
  };

  const renderBookingCard = ({ item: booking }: { item: Booking }) => {
    const statusConfig = BOOKING_STATUS_CONFIG[booking.status];
    const isUpcoming = new Date(booking.date) >= today && 
                       (booking.status === 'confirmed' || booking.status === 'pending');

    return (
      <TouchableOpacity
        style={styles.bookingCard}
        onPress={() => handleBookingPress(booking)}
        activeOpacity={0.7}
      >
        <View style={styles.bookingHeader}>
          <View style={styles.guideAvatar}>
            <Text style={styles.guideAvatarText}>{getInitials(booking.guideName)}</Text>
          </View>
          <View style={styles.bookingInfo}>
            <Text style={styles.bookingTitle} numberOfLines={1}>
              {booking.tourTitle || `Tour con ${booking.guideName}`}
            </Text>
            <Text style={styles.bookingGuideName}>{booking.guideName}</Text>
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
            <Text style={styles.detailIcon}>🕐</Text>
            <Text style={styles.detailText}>{booking.startTime}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailIcon}>👥</Text>
            <Text style={styles.detailText}>{booking.participants}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailIcon}>📍</Text>
            <Text style={styles.detailText}>{booking.location}</Text>
          </View>
        </View>

        <View style={styles.bookingFooter}>
          <Text style={styles.bookingPrice}>{booking.totalPrice}€</Text>
          {isUpcoming && (
            <Text style={styles.viewDetails}>Ver detalles →</Text>
          )}
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
          : 'No tienes reservas'}
      </Text>
      <Text style={styles.emptyText}>
        Explora los guías y tours disponibles para planificar tu próxima aventura
      </Text>
      <TouchableOpacity
        style={styles.exploreButton}
        onPress={() => navigation.navigate('Main', { screen: 'Home' })}
      >
        <Text style={styles.exploreButtonText}>Explorar tours</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
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
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    ...Typography.label,
    color: Colors.textSecondary,
  },
  filterTextActive: {
    color: Colors.textInverse,
  },
  listContent: {
    padding: Spacing.lg,
    paddingTop: 0,
  },
  bookingCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  bookingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  guideAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  guideAvatarText: {
    ...Typography.label,
    color: Colors.textInverse,
  },
  bookingInfo: {
    flex: 1,
  },
  bookingTitle: {
    ...Typography.labelLarge,
    color: Colors.text,
  },
  bookingGuideName: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    ...Typography.labelSmall,
  },
  bookingDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
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
    color: Colors.text,
  },
  viewDetails: {
    ...Typography.label,
    color: Colors.primary,
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
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 12,
  },
  exploreButtonText: {
    ...Typography.button,
    color: Colors.textInverse,
    textTransform: 'none',
  },
});

