import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Animated,
  Platform,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, DateData } from 'react-native-calendars';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Typography } from '../../theme';
import { bookingsService } from '../../services';
import type { Booking } from '../../types';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

interface BookingWithDetails extends Booking {
  guideInfo?: {
    id: string;
    name: string;
    avatar?: string;
  };
  tourTitle?: string;
  userName?: string;
  guideName?: string;
}

type CalendarMode = 'expanded' | 'week';

// Generar horarios del día (00:00 a 23:00)
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 0; hour < 24; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
  }
  return slots;
};

export const ProviderAgendaScreen: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [allBookings, setAllBookings] = useState<BookingWithDetails[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<BookingWithDetails[]>([]);
  const [markedDates, setMarkedDates] = useState<{[key: string]: any}>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [calendarMode, setCalendarMode] = useState<CalendarMode>('week');
  const [selectedBooking, setSelectedBooking] = useState<BookingWithDetails | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const calendarHeight = useRef(new Animated.Value(136)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Refs for infinite scroll
  const weekScrollRef = useRef<any>(null);

  // Stats
  const [stats, setStats] = useState({
    today: 0,
    thisWeek: 0,
    pending: 0,
    revenue: 0,
  });

  // Pull gesture handler
  const handlePullIndicatorPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (calendarMode === 'week') {
      setCalendarMode('expanded');
    } else {
      setCalendarMode('week');
    }
  };

  const timeSlots = useMemo(() => generateTimeSlots(), []);

  // Generate multiple weeks for continuous scrolling
  const generateMultipleWeeks = useCallback(() => {
    const weeks = [];
    const today = new Date(selectedDate);
    
    // Generate ~6 weeks (3 before, current, 3 after) = 42 días
    for (let i = -21; i <= 21; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      weeks.push(date.toISOString().split('T')[0]);
    }
    
    return weeks;
  }, [selectedDate]);

  const allDates = useMemo(() => generateMultipleWeeks(), [generateMultipleWeeks]);

  useEffect(() => {
    loadBookings();
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Subtle pulse animation for pull area
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Animate calendar mode change
  useEffect(() => {
    Animated.spring(calendarHeight, {
      toValue: calendarMode === 'expanded' ? 350 : 136,
      tension: 50,
      friction: 10,
      useNativeDriver: false,
    }).start();
    
    // Center on selected day when opening week view
    if (calendarMode === 'week' && weekScrollRef.current) {
      setTimeout(() => {
        const dayIndex = allDates.findIndex(d => d === selectedDate);
        if (dayIndex !== -1) {
          const cardSize = 58; // 50px card + 8px gap
          const scrollPosition = (dayIndex * cardSize) - (width / 2) + (cardSize / 2);
          weekScrollRef.current?.scrollTo({ x: Math.max(0, scrollPosition), animated: true });
        }
      }, 100);
    }
  }, [calendarMode, allDates, selectedDate]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingsService.getMyBookings();
      const bookings = response.data || [];

      // Enrich bookings with tour and user info
      const enriched = bookings.map((b) => ({
        ...b,
        tourTitle: b.tour?.name || 'Tour sin nombre',
        userName: `Cliente #${b.userId.slice(0, 8)}`,
        guideName: b.assignedGuide?.name,
        guideInfo: b.assignedGuide ? {
          id: b.assignedGuide.id,
          name: b.assignedGuide.name,
          avatar: b.assignedGuide.avatar,
        } : undefined,
      }));

      // Calculate stats
      const today = new Date().toISOString().split('T')[0];
      const todayBookings = enriched.filter((b: Booking) => b.date === today);
      const thisWeek = enriched.filter((b: Booking) => {
        const bookingDate = new Date(b.date);
        const now = new Date();
        const weekFromNow = new Date();
        weekFromNow.setDate(now.getDate() + 7);
        return bookingDate >= now && bookingDate <= weekFromNow;
      });
      const pending = enriched.filter((b: Booking) => b.status === 'PENDING');
      const revenue = enriched
        .filter((b: Booking) => b.status === 'CONFIRMED' || b.status === 'COMPLETED')
        .reduce((sum: number, b: Booking) => sum + (b.totalPrice || 0), 0);

      setStats({
        today: todayBookings.length,
        thisWeek: thisWeek.length,
        pending: pending.length,
        revenue,
      });

      // Mark dates
      const marked: {[key: string]: any} = {};
      enriched.forEach((booking: Booking) => {
        const date = booking.date;
        if (!marked[date]) {
          marked[date] = {
            marked: true,
            dots: [{color: Colors.primary, selectedDotColor: '#FFF'}],
            bookingCount: 1,
          };
        } else {
          marked[date].bookingCount++;
        }
      });

      marked[selectedDate] = {
        ...marked[selectedDate],
        selected: true,
        selectedColor: Colors.primary,
        selectedTextColor: '#FFF',
      };

      setMarkedDates(marked);
      setAllBookings(enriched);
      filterBookingsByDate(selectedDate, enriched);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setRefreshing(true);
    loadBookings();
  }, []);

  const filterBookingsByDate = (date: string, bookings?: BookingWithDetails[]) => {
    const toFilter = bookings || allBookings;
    const filtered = toFilter.filter((b) => b.date === date);
    
    filtered.sort((a, b) => {
      const timeA = a.startTime || '00:00';
      const timeB = b.startTime || '00:00';
      return timeA.localeCompare(timeB);
    });

    setFilteredBookings(filtered);
  };

  const onDayPress = (day: DateData) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Smooth fade transition
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.85,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
    
    const newMarked = {...markedDates};
    
    // Unselect previous
    if (newMarked[selectedDate]) {
      delete newMarked[selectedDate].selected;
      delete newMarked[selectedDate].selectedColor;
      delete newMarked[selectedDate].selectedTextColor;
    }
    
    // Select new
    newMarked[day.dateString] = {
      ...newMarked[day.dateString],
      selected: true,
      selectedColor: Colors.primary,
      selectedTextColor: '#FFF',
    };
    
    setMarkedDates(newMarked);
    setSelectedDate(day.dateString);
    filterBookingsByDate(day.dateString);
    
    // Auto-scroll to selected day (centered)
    if (weekScrollRef.current) {
      const dayIndex = allDates.findIndex(d => d === day.dateString);
      if (dayIndex !== -1) {
        const cardSize = 58; // 50px card + 8px gap
        const scrollPosition = (dayIndex * cardSize) - (width / 2) + (cardSize / 2);
        weekScrollRef.current.scrollTo({ x: Math.max(0, scrollPosition), animated: true });
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return Colors.success;
      case 'PENDING': return '#FFA500';
      case 'COMPLETED': return '#4CAF50';
      case 'CANCELLED_USER':
      case 'CANCELLED_COMPANY': return Colors.error;
      default: return Colors.textSecondary;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'Confirmado';
      case 'PENDING': return 'Pendiente';
      case 'COMPLETED': return 'Completado';
      case 'CANCELLED_USER': return 'Cancelado';
      case 'CANCELLED_COMPANY': return 'Cancelado';
      default: return status;
    }
  };

  const handleViewDetails = (booking: BookingWithDetails) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedBooking(booking);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsModalVisible(false);
  };

  const handleConfirmBooking = async (booking: BookingWithDetails) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Confirmar Reserva', `¿Confirmar la reserva de ${booking.tourTitle}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Confirmar', onPress: () => console.log('Confirmed') },
    ]);
  };

  const handleContactClient = (booking: BookingWithDetails) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Contactar Cliente', booking.userPhone || 'Sin teléfono disponible');
  };

  // Calculate booking position in timeline
  const getBookingPosition = (startTime: string, duration: number) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    const topPosition = (startMinutes / 60) * 80; // 80px per hour
    const height = (duration / 60) * 80;
    return { top: topPosition, height };
  };

  const renderTimelineBooking = (booking: BookingWithDetails, index: number) => {
    const { top, height: bookingHeight } = getBookingPosition(booking.startTime, booking.duration);
    const statusColor = getStatusColor(booking.status);

    return (
      <TouchableOpacity
        key={booking.id}
        style={[
          styles.timelineBooking,
          {
            top,
            height: Math.max(bookingHeight, 60),
            backgroundColor: statusColor + '20',
            borderLeftColor: statusColor,
          },
        ]}
        onPress={() => handleViewDetails(booking)}
        activeOpacity={0.8}
      >
        <Text style={styles.timelineBookingTime}>{booking.startTime}</Text>
        <Text style={styles.timelineBookingTitle} numberOfLines={1}>
          {booking.tourTitle}
        </Text>
        <Text style={styles.timelineBookingMeta} numberOfLines={1}>
          👥 {booking.participants} • 💵 ${booking.totalPrice?.toLocaleString()}
        </Text>
        {booking.guideName && (
          <Text style={styles.timelineBookingGuide} numberOfLines={1}>
            🎯 {booking.guideName}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Cargando agenda...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Mi Agenda</Text>
            <Text style={styles.headerSubtitle}>
              {new Date(selectedDate).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </Text>
          </View>
        </View>

        {/* Calendar / Week View */}
        <Animated.View style={[styles.calendarContainer, { height: calendarHeight }]}>
          {calendarMode === 'expanded' ? (
            <View style={{ flex: 1 }}>
              <TouchableOpacity 
                style={styles.expandedPullArea}
                onPress={handlePullIndicatorPress}
                activeOpacity={0.8}
              >
                <View style={styles.pullHandle} />
                <Text style={styles.pullTextExpanded}>✕ Ocultar calendario</Text>
              </TouchableOpacity>
              <Calendar
                current={currentMonth + '-01'}
                onDayPress={onDayPress}
                onMonthChange={(month) => {
                  const newMonth = month.dateString.slice(0, 7);
                  setCurrentMonth(newMonth);
                }}
                markedDates={markedDates}
                markingType="multi-dot"
                enableSwipeMonths={true}
                theme={{
                  backgroundColor: 'transparent',
                  calendarBackground: 'transparent',
                  selectedDayBackgroundColor: Colors.primary,
                  selectedDayTextColor: '#FFF',
                  todayTextColor: Colors.primary,
                  dayTextColor: Colors.text,
                  textDisabledColor: Colors.border,
                  monthTextColor: Colors.text,
                  textMonthFontWeight: '700',
                  textDayFontSize: 14,
                  textMonthFontSize: 16,
                }}
              />
            </View>
          ) : (
            <View style={styles.weekPanContainer}>
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <TouchableOpacity 
                  style={styles.weekPullArea}
                  onPress={handlePullIndicatorPress}
                  activeOpacity={0.8}
                >
                  <View style={styles.pullHandle} />
                  <Text style={styles.pullTextWeek}>📅 Ver calendario completo</Text>
                </TouchableOpacity>
              </Animated.View>
              <ScrollView
                ref={weekScrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                decelerationRate="normal"
                contentContainerStyle={styles.weekScrollContainer}
                scrollEventThrottle={16}
              >
                {allDates.map((date) => {
                  const dateObj = new Date(date);
                  const isSelected = date === selectedDate;
                  const isToday = date === new Date().toISOString().split('T')[0];
                  const bookingCount = markedDates[date]?.bookingCount || 0;

                  return (
                    <TouchableOpacity
                      key={date}
                      style={[
                        styles.weekDateCard,
                        isSelected && styles.weekDateCardSelected,
                      ]}
                      onPress={() => onDayPress({
                        dateString: date,
                        day: dateObj.getDate(),
                        month: dateObj.getMonth() + 1,
                        year: dateObj.getFullYear(),
                        timestamp: dateObj.getTime(),
                      })}
                    >
                      <Text style={[styles.weekDay, isSelected && styles.weekDaySelected]}>
                        {dateObj.toLocaleDateString('es-ES', { weekday: 'short' })}
                      </Text>
                      <Text style={[styles.weekDate, isSelected && styles.weekDateSelected]}>
                        {dateObj.getDate()}
                      </Text>
                      {bookingCount > 0 && (
                        <View style={[styles.weekDot, isSelected && styles.weekDotSelected]}>
                          <Text style={[
                            styles.weekDotText, 
                            isSelected && { color: Colors.primary }
                          ]}>
                            {bookingCount}
                          </Text>
                        </View>
                      )}
                      {isToday && !isSelected && (
                        <View style={styles.todayIndicator} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}
        </Animated.View>

        {/* Timeline */}
        <Animated.ScrollView
          style={[styles.timeline, { opacity: fadeAnim }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.primary}
            />
          }
        >
          <View style={styles.timelineContent}>
            {/* Time slots */}
            {timeSlots.map((slot, index) => (
              <View key={slot} style={styles.timeSlot}>
                <Text style={styles.timeSlotLabel}>{slot}</Text>
                <View style={styles.timeSlotLine} />
              </View>
            ))}

            {/* Bookings overlay */}
            <View style={styles.bookingsOverlay}>
              {filteredBookings.map((booking, index) => renderTimelineBooking(booking, index))}
            </View>

            {/* Empty state */}
            {filteredBookings.length === 0 && (
              <View style={styles.emptyTimeline}>
                <Text style={styles.emptyTimelineIcon}>📅</Text>
                <Text style={styles.emptyTimelineText}>
                  No hay reservas para este día
                </Text>
              </View>
            )}
          </View>
        </Animated.ScrollView>

        {/* Modal for Details */}
        <Modal
          visible={isModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={closeModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalHeaderTitle}>Detalles de Reserva</Text>
                <TouchableOpacity onPress={closeModal} style={styles.modalCloseButton}>
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>
              
              <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
                {selectedBooking && (
                  <>
                    <Text style={styles.modalTitle}>
                      {selectedBooking.tourTitle}
                    </Text>
                    <View style={styles.modalSection}>
                      <Text style={styles.modalLabel}>Cliente</Text>
                      <Text style={styles.modalValue}>
                        {selectedBooking.userName}
                      </Text>
                      {selectedBooking.userPhone && (
                        <Text style={styles.modalSubvalue}>
                          📞 {selectedBooking.userPhone}
                        </Text>
                      )}
                    </View>
                    <View style={styles.modalSection}>
                      <Text style={styles.modalLabel}>Fecha y Hora</Text>
                      <Text style={styles.modalValue}>
                        {new Date(selectedBooking.date).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                        })}
                      </Text>
                      <Text style={styles.modalSubvalue}>
                        ⏰ {selectedBooking.startTime}
                      </Text>
                    </View>
                    <View style={styles.modalSection}>
                      <Text style={styles.modalLabel}>Guía</Text>
                      <Text style={styles.modalValue}>
                        {selectedBooking.guideInfo?.name || selectedBooking.guideName || 'Sin asignar'}
                      </Text>
                    </View>
                    <View style={styles.modalSection}>
                      <Text style={styles.modalLabel}>Detalles</Text>
                      <Text style={styles.modalValue}>
                        👥 {selectedBooking.participants} personas
                      </Text>
                      <Text style={styles.modalValue}>
                        💵 ${selectedBooking.totalPrice?.toLocaleString()}
                      </Text>
                      <View
                        style={[
                          styles.statusBadgeLarge,
                          { backgroundColor: getStatusColor(selectedBooking.status) + '20' },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusTextLarge,
                            { color: getStatusColor(selectedBooking.status) },
                          ]}
                        >
                          {getStatusLabel(selectedBooking.status)}
                        </Text>
                      </View>
                    </View>
                    {selectedBooking.specialRequests && (
                      <View style={styles.modalSection}>
                        <Text style={styles.modalLabel}>Solicitudes especiales</Text>
                        <Text style={styles.modalValue}>
                          {selectedBooking.specialRequests}
                        </Text>
                      </View>
                    )}
                  </>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </Animated.View>
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
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    ...Typography.h2,
    color: Colors.text,
    fontWeight: '700',
    fontSize: 20,
    lineHeight: 22,
  },
  headerSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 1,
    fontSize: 11,
    lineHeight: 13,
  },
  calendarContainer: {
    overflow: 'hidden',
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border + '80',
  },
  weekPanContainer: {
    flex: 1,
  },
  weekPullArea: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.primary + '12',
    borderRadius: 10,
    marginHorizontal: Spacing.lg,
    marginTop: 6,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: Colors.primary + '30',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  expandedPullArea: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border + '60',
  },
  pullHandle: {
    width: 36,
    height: 3.5,
    borderRadius: 2,
    backgroundColor: Colors.primary,
    opacity: 0.5,
    marginBottom: 6,
  },
  pullTextWeek: {
    ...Typography.body,
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  pullTextExpanded: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  weekScrollContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 12,
    paddingHorizontal: 12,
    gap: 8,
  },
  weekDateCard: {
    width: 50,
    minHeight: 62,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 12,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: Colors.border + '40',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  weekDateCardSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    transform: [{ scale: 1.05 }],
  },
  weekDay: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontSize: 9,
    textTransform: 'uppercase',
    fontWeight: '700',
    lineHeight: 11,
    marginBottom: 3,
    letterSpacing: 0.3,
  },
  weekDaySelected: {
    color: '#FFF',
    opacity: 0.95,
  },
  weekDate: {
    ...Typography.h3,
    color: Colors.text,
    fontWeight: '700',
    fontSize: 17,
    lineHeight: 19,
  },
  weekDateSelected: {
    color: '#FFF',
  },
  weekDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  weekDotSelected: {
    backgroundColor: '#FFF',
    borderColor: Colors.primary,
  },
  weekDotText: {
    fontSize: 9,
    color: '#FFF',
    fontWeight: '700',
    lineHeight: 10,
  },
  todayIndicator: {
    position: 'absolute',
    bottom: 4,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.primary,
  },
  timeline: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  timelineContent: {
    position: 'relative',
    paddingBottom: 100,
  },
  timeSlot: {
    height: 80,
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingLeft: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border + '40',
  },
  timeSlotLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    width: 50,
    paddingTop: 4,
  },
  timeSlotLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border + '20',
    marginTop: 8,
    marginLeft: Spacing.sm,
  },
  bookingsOverlay: {
    position: 'absolute',
    top: 0,
    left: 70,
    right: 0,
    paddingRight: Spacing.lg,
  },
  timelineBooking: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderRadius: 8,
    padding: Spacing.sm,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timelineBookingTime: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  timelineBookingTitle: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '700',
    marginTop: 2,
  },
  timelineBookingMeta: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  timelineBookingGuide: {
    ...Typography.caption,
    color: Colors.text,
    marginTop: 2,
  },
  emptyTimeline: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl * 3,
  },
  emptyTimelineIcon: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  emptyTimelineText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalHeaderTitle: {
    ...Typography.h3,
    color: Colors.text,
    fontWeight: '700',
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.border + '40',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    ...Typography.h3,
    color: Colors.textSecondary,
  },
  modalContent: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  modalTitle: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  modalSection: {
    marginBottom: Spacing.lg,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  modalValue: {
    ...Typography.h4,
    color: Colors.text,
    marginTop: Spacing.xs,
  },
  modalSubvalue: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  statusBadgeLarge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: Spacing.sm,
  },
  statusTextLarge: {
    ...Typography.labelLarge,
    fontWeight: '700',
  },
});
