import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Typography } from '../../theme';
import { MinimalHeader } from '../../components';
import { bookingsService, TourCalendarDay, TourCalendarSlot, TourCalendarResponse } from '../../services/bookingsService';
import { toursService, ApiTour } from '../../services';
import { useAuth } from '../../context/AuthContext';
import type { RootStackScreenProps } from '../../types';

type Props = RootStackScreenProps<'Booking'>;

const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const DAYS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export const BookingScreen: React.FC<Props> = ({ route, navigation }) => {
  const { tourId } = route.params;
  const { isAuthenticated, user } = useAuth();

  // State
  const [tour, setTour] = useState<ApiTour | null>(null);
  const [calendarData, setCalendarData] = useState<TourCalendarResponse | null>(null);
  const [loadingTour, setLoadingTour] = useState(true);
  const [loadingCalendar, setLoadingCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Selection state
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TourCalendarSlot | null>(null);
  const [participants, setParticipants] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch tour data
  useEffect(() => {
    const fetchTour = async () => {
      setLoadingTour(true);
      try {
        const response = await toursService.getTour(tourId);
        if (response.success && response.data) {
          setTour(response.data);
        }
      } catch (err: any) {
        console.log('Error fetching tour:', err);
      } finally {
        setLoadingTour(false);
      }
    };
    fetchTour();
  }, [tourId]);

  // Fetch calendar data
  const fetchCalendar = useCallback(async () => {
    setLoadingCalendar(true);
    try {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;
      const data = await bookingsService.getTourCalendar(tourId, year, month);
      setCalendarData(data);
    } catch (err: any) {
      setCalendarData(generateMockCalendar(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    } finally {
      setLoadingCalendar(false);
    }
  }, [tourId, currentMonth]);

  useEffect(() => {
    if (tour) {
      fetchCalendar();
    }
  }, [tour, fetchCalendar]);

  // Generate mock calendar (fallback)
  const generateMockCalendar = (year: number, month: number): TourCalendarResponse => {
    const days: TourCalendarDay[] = [];
    const daysInMonth = new Date(year, month, 0).getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayOfWeek = new Date(year, month - 1, day).getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const seed = day * 17 + month * 31;
      const isAvailable = !isWeekend && (seed % 10) > 3;
      
      days.push({
        date,
        dayOfWeek: DAYS_ES[dayOfWeek],
        isAvailable,
        slots: isAvailable ? [
          { 
            id: `${date}-1`, 
            startTime: '09:00', 
            endTime: '13:00', 
            spotsAvailable: 12,
            spotsBooked: seed % 5,
            price: tour?.price || 45000
          },
          { 
            id: `${date}-2`, 
            startTime: '14:30', 
            endTime: '18:30', 
            spotsAvailable: 12,
            spotsBooked: seed % 3,
            price: tour?.price || 45000
          },
        ] : [],
      });
    }
    
    return {
      tourId,
      tourName: tour?.title || 'Tour',
      month,
      year,
      days,
    };
  };

  // Handlers
  const handlePreviousMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    const today = new Date();
    today.setDate(1);
    if (newMonth >= today) {
      setCurrentMonth(newMonth);
      setSelectedDate(null);
      setSelectedSlot(null);
    }
  };

  const handleNextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    setCurrentMonth(newMonth);
    setSelectedDate(null);
    setSelectedSlot(null);
  };

  const handleDateSelect = (date: string) => {
    const dayData = calendarData?.days?.find((d) => d.date === date);
    if (!dayData?.isAvailable) return;
    
    if (selectedDate === date) {
      setSelectedDate(null);
      setSelectedSlot(null);
    } else {
      setSelectedDate(date);
      setSelectedSlot(null);
    }
  };

  const handleSlotSelect = (slot: TourCalendarSlot) => {
    if (slot.spotsAvailable - slot.spotsBooked < participants) {
      Alert.alert(
        'Cupos limitados', 
        `Solo quedan ${slot.spotsAvailable - slot.spotsBooked} cupos disponibles.`,
        [{ text: 'Entendido' }]
      );
      return;
    }
    setSelectedSlot(slot);
  };

  const handleParticipantsChange = (delta: number) => {
    const maxParticipants = tour?.maxParticipants || 10;
    const availableSpots = selectedSlot ? selectedSlot.spotsAvailable - selectedSlot.spotsBooked : maxParticipants;
    const newValue = participants + delta;
    if (newValue >= 1 && newValue <= Math.min(maxParticipants, availableSpots)) {
      setParticipants(newValue);
    }
  };

  const handleBooking = async () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Inicia sesión',
        'Para completar tu reserva necesitas tener una cuenta',
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Iniciar sesión', 
            onPress: () => navigation.navigate('Main', { screen: 'Profile' })
          },
        ]
      );
      return;
    }

    if (!selectedDate || !selectedSlot) {
      Alert.alert('Error', 'Por favor selecciona una fecha y horario');
      return;
    }

    setSubmitting(true);
    try {
      const booking = await bookingsService.createBooking({
        tourId,
        date: selectedDate,
        startTime: selectedSlot.startTime,
        participants,
        specialRequests: specialRequests.trim() || undefined,
        userPhone: userPhone.trim() || undefined,
      });
      
      navigation.replace('BookingSuccess', {
        bookingId: booking.id,
        bookingReference: booking.reference,
        tourTitle: tour?.title || 'Tour',
        companyName: tour?.company?.name || 'Empresa',
        date: selectedDate,
        startTime: selectedSlot.startTime,
        participants,
      });
    } catch (err: any) {
      const errorMessage = err?.response?.data?.error?.message || 
                          err?.response?.data?.message ||
                          err?.message ||
                          'No se pudo completar la reserva.';
      
      if (err?.response?.status === 401 || errorMessage.toLowerCase().includes('token')) {
        Alert.alert(
          'Sesión expirada',
          'Por favor inicia sesión nuevamente.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { 
              text: 'Iniciar sesión', 
              onPress: () => navigation.navigate('Main', { screen: 'Profile' })
            },
          ]
        );
      } else {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Helper functions
  const formatPrice = (price: number, currency: string = 'CLP') => {
    if (currency === 'CLP') {
      return `$${price.toLocaleString('es-CL')}`;
    }
    return `€${price}`;
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}min`;
  };

  const formatDateLong = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return `${dayNames[date.getDay()]}, ${date.getDate()} de ${MONTHS_ES[date.getMonth()]}`;
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    return {
      daysInMonth: lastDay.getDate(),
      startingDay: firstDay.getDay(),
    };
  };

  const isDateAvailable = (date: string) => {
    const dayData = calendarData?.days?.find((d) => d.date === date);
    return dayData?.isAvailable ?? false;
  };

  const getSlotsForDate = (date: string) => {
    const dayData = calendarData?.days?.find((d) => d.date === date);
    return dayData?.slots?.filter((s) => s.spotsAvailable - s.spotsBooked > 0) || [];
  };

  // Calculate total price
  const totalPrice = selectedSlot ? selectedSlot.price * participants : (tour?.price || 0) * participants;

  // Render calendar
  const renderCalendar = () => {
    const { daysInMonth, startingDay } = getDaysInMonth(currentMonth);
    const days: (number | null)[] = [];

    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isPrevDisabled = (() => {
      const prevMonth = new Date(currentMonth);
      prevMonth.setMonth(prevMonth.getMonth() - 1);
      const todayFirst = new Date();
      todayFirst.setDate(1);
      return prevMonth < todayFirst;
    })();

    return (
      <View style={styles.calendar}>
        {/* Month navigation */}
        <View style={styles.calendarHeader}>
          <TouchableOpacity 
            onPress={handlePreviousMonth} 
            style={[styles.monthArrow, isPrevDisabled && styles.monthArrowDisabled]}
            disabled={isPrevDisabled}
          >
            <Text style={[styles.monthArrowText, isPrevDisabled && styles.monthArrowTextDisabled]}>
              ‹
            </Text>
          </TouchableOpacity>
          <View style={styles.monthTitleContainer}>
            <Text style={styles.monthTitle}>{MONTHS_ES[currentMonth.getMonth()]}</Text>
            <Text style={styles.yearTitle}>{currentMonth.getFullYear()}</Text>
          </View>
          <TouchableOpacity onPress={handleNextMonth} style={styles.monthArrow}>
            <Text style={styles.monthArrowText}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Day headers */}
        <View style={styles.dayHeaders}>
          {DAYS_ES.map((day, index) => (
            <View key={day} style={styles.dayHeaderCell}>
              <Text style={[
                styles.dayHeader,
                (index === 0 || index === 6) && styles.dayHeaderWeekend
              ]}>
                {day}
              </Text>
            </View>
          ))}
        </View>

        {/* Calendar grid */}
        {loadingCalendar ? (
          <View style={styles.calendarLoading}>
            <ActivityIndicator size="small" color={Colors.primary} />
          </View>
        ) : (
          <View style={styles.calendarGrid}>
            {days.map((day, index) => {
              if (day === null) {
                return <View key={`empty-${index}`} style={styles.calendarCell} />;
              }

              const dateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
              const dateString = dateObj.toISOString().split('T')[0];
              const isPast = dateObj < today;
              const isAvailable = !isPast && isDateAvailable(dateString);
              const isSelected = selectedDate === dateString;
              const isToday = dateObj.getTime() === today.getTime();

              return (
                <TouchableOpacity
                  key={day}
                  style={styles.calendarCell}
                  onPress={() => handleDateSelect(dateString)}
                  disabled={isPast || !isAvailable}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.calendarDay,
                    isAvailable && styles.calendarDayAvailable,
                    isSelected && styles.calendarDaySelected,
                    isPast && styles.calendarDayPast,
                    isToday && !isSelected && styles.calendarDayToday,
                  ]}>
                    <Text style={[
                      styles.calendarDayText,
                      isAvailable && styles.calendarDayTextAvailable,
                      isSelected && styles.calendarDayTextSelected,
                      isPast && styles.calendarDayTextPast,
                    ]}>
                      {day}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    );
  };

  // Loading state
  if (loadingTour) {
    return (
      <View style={styles.container}>
        <MinimalHeader onBack={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      </View>
    );
  }

  if (!tour) {
    return (
      <View style={styles.container}>
        <MinimalHeader onBack={() => navigation.goBack()} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>😕</Text>
          <Text style={styles.errorTitle}>Tour no encontrado</Text>
          <TouchableOpacity style={styles.errorButton} onPress={() => navigation.goBack()}>
            <Text style={styles.errorButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MinimalHeader title="Reservar" onBack={() => navigation.goBack()} />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Tour Card */}
        <View style={styles.tourCard}>
          <Image 
            source={{ uri: tour.images?.[0] || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400' }} 
            style={styles.tourImage}
          />
          <View style={styles.tourInfo}>
            <Text style={styles.tourTitle} numberOfLines={2}>{tour.title}</Text>
            <Text style={styles.tourCompany}>{tour.company?.name}</Text>
            <View style={styles.tourMeta}>
              <View style={styles.tourMetaItem}>
                <Text style={styles.tourMetaIcon}>⏱️</Text>
                <Text style={styles.tourMetaText}>{formatDuration(tour.duration)}</Text>
              </View>
              <View style={styles.tourMetaItem}>
                <Text style={styles.tourMetaIcon}>👥</Text>
                <Text style={styles.tourMetaText}>Máx. {tour.maxParticipants}</Text>
              </View>
            </View>
            <Text style={styles.tourPrice}>
              {formatPrice(tour.price, tour.currency)}
              <Text style={styles.tourPriceLabel}> /persona</Text>
            </Text>
          </View>
        </View>

        {/* Calendar Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 Selecciona una fecha</Text>
          {renderCalendar()}
        </View>

        {/* Time Slots */}
        {selectedDate && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⏰ Selecciona horario</Text>
            <Text style={styles.sectionSubtitle}>{formatDateLong(selectedDate)}</Text>
            
            {getSlotsForDate(selectedDate).length > 0 ? (
              <View style={styles.slotsContainer}>
                {getSlotsForDate(selectedDate).map((slot) => {
                  const availableSpots = slot.spotsAvailable - slot.spotsBooked;
                  const isSelected = selectedSlot?.id === slot.id;
                  
                  return (
                    <TouchableOpacity
                      key={slot.id}
                      style={[styles.slotCard, isSelected && styles.slotCardSelected]}
                      onPress={() => handleSlotSelect(slot)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.slotLeft}>
                        <Text style={[styles.slotTime, isSelected && styles.slotTimeSelected]}>
                          {slot.startTime} - {slot.endTime}
                        </Text>
                        <Text style={[styles.slotSpots, isSelected && styles.slotSpotsSelected]}>
                          {availableSpots} cupos disponibles
                        </Text>
                      </View>
                      <Text style={[styles.slotPrice, isSelected && styles.slotPriceSelected]}>
                        {formatPrice(slot.price, tour.currency)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <View style={styles.noSlots}>
                <Text style={styles.noSlotsText}>No hay horarios disponibles</Text>
              </View>
            )}
          </View>
        )}

        {/* Participants */}
        {selectedSlot && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👥 Participantes</Text>
            <View style={styles.participantsCard}>
              <TouchableOpacity
                style={[styles.participantBtn, participants <= 1 && styles.participantBtnDisabled]}
                onPress={() => handleParticipantsChange(-1)}
                disabled={participants <= 1}
              >
                <Text style={[styles.participantBtnText, participants <= 1 && styles.participantBtnTextDisabled]}>−</Text>
              </TouchableOpacity>
              
              <View style={styles.participantValue}>
                <Text style={styles.participantNumber}>{participants}</Text>
                <Text style={styles.participantLabel}>{participants === 1 ? 'persona' : 'personas'}</Text>
              </View>
              
              <TouchableOpacity
                style={[
                  styles.participantBtn,
                  participants >= Math.min(tour.maxParticipants, selectedSlot.spotsAvailable - selectedSlot.spotsBooked) && styles.participantBtnDisabled,
                ]}
                onPress={() => handleParticipantsChange(1)}
                disabled={participants >= Math.min(tour.maxParticipants, selectedSlot.spotsAvailable - selectedSlot.spotsBooked)}
              >
                <Text style={[
                  styles.participantBtnText,
                  participants >= Math.min(tour.maxParticipants, selectedSlot.spotsAvailable - selectedSlot.spotsBooked) && styles.participantBtnTextDisabled,
                ]}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Contact & Notes */}
        {selectedSlot && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📝 Información adicional</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Teléfono (opcional)</Text>
              <TextInput
                style={styles.input}
                placeholder="+56 9 1234 5678"
                placeholderTextColor={Colors.textTertiary}
                value={userPhone}
                onChangeText={setUserPhone}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Comentarios (opcional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Alergias, necesidades especiales..."
                placeholderTextColor={Colors.textTertiary}
                value={specialRequests}
                onChangeText={setSpecialRequests}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>
        )}

        {/* Meeting Point */}
        {selectedSlot && tour.meetingPoint && (
          <View style={styles.section}>
            <View style={styles.meetingPointCard}>
              <Text style={styles.meetingPointIcon}>📍</Text>
              <View style={styles.meetingPointContent}>
                <Text style={styles.meetingPointLabel}>Punto de encuentro</Text>
                <Text style={styles.meetingPointText}>{tour.meetingPoint}</Text>
              </View>
            </View>
          </View>
        )}

        <View style={{ height: 140 }} />
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        {selectedSlot ? (
          <>
            <View style={styles.priceRow}>
              <View>
                <Text style={styles.priceLabel}>Total</Text>
                <Text style={styles.priceDetail}>
                  {formatPrice(selectedSlot.price, tour.currency)} × {participants}
                </Text>
              </View>
              <Text style={styles.priceTotal}>{formatPrice(totalPrice, tour.currency)}</Text>
            </View>

            <TouchableOpacity
              style={[styles.bookButton, submitting && styles.bookButtonDisabled]}
              onPress={handleBooking}
              disabled={submitting}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={submitting ? [Colors.disabled, Colors.disabled] : [Colors.primary, Colors.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.bookButtonGradient}
              >
                {submitting ? (
                  <ActivityIndicator color={Colors.textInverse} size="small" />
                ) : (
                  <Text style={styles.bookButtonText}>Confirmar reserva</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.bottomHint}>
            <Text style={styles.bottomHintText}>
              {!selectedDate 
                ? '📅 Selecciona una fecha'
                : '⏰ Selecciona un horario'
              }
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
  },

  // Loading & Error
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
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  errorTitle: {
    ...Typography.h4,
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  errorButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 12,
  },
  errorButtonText: {
    ...Typography.button,
    color: Colors.textInverse,
  },

  // Tour Card
  tourCard: {
    flexDirection: 'row',
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
  tourImage: {
    width: 100,
    height: 100,
  },
  tourInfo: {
    flex: 1,
    padding: Spacing.sm,
    justifyContent: 'space-between',
  },
  tourTitle: {
    ...Typography.labelLarge,
    color: Colors.text,
    marginBottom: 2,
  },
  tourCompany: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  tourMeta: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginVertical: 4,
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
    color: Colors.textTertiary,
  },
  tourPrice: {
    ...Typography.labelLarge,
    color: Colors.primary,
    fontWeight: '700',
  },
  tourPriceLabel: {
    ...Typography.caption,
    fontWeight: '400',
    color: Colors.textSecondary,
  },

  // Sections
  section: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h5,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  sectionSubtitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },

  // Calendar
  calendar: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: Spacing.md,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  monthArrow: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: Colors.primaryMuted,
  },
  monthArrowDisabled: {
    backgroundColor: Colors.border,
    opacity: 0.5,
  },
  monthArrowText: {
    fontSize: 24,
    color: Colors.primary,
    fontWeight: '500',
  },
  monthArrowTextDisabled: {
    color: Colors.textTertiary,
  },
  monthTitleContainer: {
    alignItems: 'center',
  },
  monthTitle: {
    ...Typography.h4,
    color: Colors.text,
  },
  yearTitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  dayHeaders: {
    flexDirection: 'row',
    marginBottom: Spacing.xs,
  },
  dayHeaderCell: {
    flex: 1,
    alignItems: 'center',
  },
  dayHeader: {
    ...Typography.labelSmall,
    color: Colors.textTertiary,
  },
  dayHeaderWeekend: {
    opacity: 0.5,
  },
  calendarLoading: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarCell: {
    width: '14.28%',
    aspectRatio: 1,
    padding: 2,
  },
  calendarDay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  calendarDayAvailable: {
    backgroundColor: Colors.primaryMuted,
  },
  calendarDaySelected: {
    backgroundColor: Colors.primary,
  },
  calendarDayPast: {
    opacity: 0.3,
  },
  calendarDayToday: {
    borderWidth: 2,
    borderColor: Colors.secondary,
  },
  calendarDayText: {
    ...Typography.body,
    color: Colors.textTertiary,
  },
  calendarDayTextAvailable: {
    color: Colors.primary,
    fontWeight: '600',
  },
  calendarDayTextSelected: {
    color: Colors.textInverse,
    fontWeight: '700',
  },
  calendarDayTextPast: {
    color: Colors.textTertiary,
  },

  // Slots
  slotsContainer: {
    gap: Spacing.sm,
  },
  slotCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: Spacing.md,
  },
  slotCardSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  slotLeft: {},
  slotTime: {
    ...Typography.labelLarge,
    color: Colors.text,
    marginBottom: 2,
  },
  slotTimeSelected: {
    color: Colors.textInverse,
  },
  slotSpots: {
    ...Typography.caption,
    color: Colors.success,
  },
  slotSpotsSelected: {
    color: 'rgba(255,255,255,0.8)',
  },
  slotPrice: {
    ...Typography.price,
    color: Colors.primary,
  },
  slotPriceSelected: {
    color: Colors.textInverse,
  },
  noSlots: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  noSlotsText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },

  // Participants
  participantsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: Spacing.md,
  },
  participantBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  participantBtnDisabled: {
    backgroundColor: Colors.border,
  },
  participantBtnText: {
    fontSize: 24,
    color: Colors.textInverse,
    fontWeight: '500',
  },
  participantBtnTextDisabled: {
    color: Colors.textTertiary,
  },
  participantValue: {
    alignItems: 'center',
    marginHorizontal: Spacing.xl,
  },
  participantNumber: {
    ...Typography.h1,
    color: Colors.text,
  },
  participantLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },

  // Inputs
  inputGroup: {
    marginBottom: Spacing.sm,
  },
  inputLabel: {
    ...Typography.label,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Typography.body,
    color: Colors.text,
  },
  textArea: {
    minHeight: 80,
    paddingTop: Spacing.md,
  },

  // Meeting Point
  meetingPointCard: {
    flexDirection: 'row',
    backgroundColor: Colors.infoLight,
    borderRadius: 12,
    padding: Spacing.md,
  },
  meetingPointIcon: {
    fontSize: 20,
    marginRight: Spacing.sm,
  },
  meetingPointContent: {
    flex: 1,
  },
  meetingPointLabel: {
    ...Typography.labelSmall,
    color: Colors.info,
    marginBottom: 2,
  },
  meetingPointText: {
    ...Typography.body,
    color: Colors.text,
  },

  // Bottom Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.card,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Platform.OS === 'ios' ? 34 : Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  priceLabel: {
    ...Typography.labelSmall,
    color: Colors.textTertiary,
  },
  priceDetail: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  priceTotal: {
    ...Typography.h2,
    color: Colors.primary,
    fontWeight: '700',
  },
  bookButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  bookButtonDisabled: {
    opacity: 0.7,
  },
  bookButtonGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
  },
  bookButtonText: {
    ...Typography.button,
    color: Colors.textInverse,
  },
  bottomHint: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  bottomHintText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
});
