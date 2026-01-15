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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '../../theme';
import { Button } from '../../components';
import { bookingsService, TourCalendarDay, TourCalendarSlot, TourCalendarResponse } from '../../services/bookingsService';
import { toursService, ApiTour } from '../../services';
import type { RootStackScreenProps } from '../../types';

type Props = RootStackScreenProps<'Booking'>;

const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const DAYS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export const BookingScreen: React.FC<Props> = ({ route, navigation }) => {
  const { tourId } = route.params;

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
        console.log('📍 BookingScreen - Fetching tour:', tourId);
        const response = await toursService.getTour(tourId);
        if (response.success && response.data) {
          setTour(response.data);
          console.log('✅ Tour loaded:', response.data.title);
        }
      } catch (err: any) {
        console.log('❌ Error fetching tour:', err?.response?.data || err);
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
      console.log('📅 Fetching calendar for tour:', tourId, year, month);
      const data = await bookingsService.getTourCalendar(tourId, year, month);
      setCalendarData(data);
      console.log('✅ Calendar loaded:', data.days?.length, 'days');
    } catch (err: any) {
      console.log('❌ Error fetching calendar:', err?.response?.data || err);
      // Generate mock calendar as fallback
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
            startTime: '08:00', 
            endTime: '13:00', 
            spotsAvailable: 10,
            spotsBooked: seed % 5,
            price: tour?.price || 45000
          },
          { 
            id: `${date}-2`, 
            startTime: '14:00', 
            endTime: '19:00', 
            spotsAvailable: 10,
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
      Alert.alert('Cupos insuficientes', `Solo hay ${slot.spotsAvailable - slot.spotsBooked} cupos disponibles para este horario.`);
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

      console.log('✅ Booking created:', booking.reference);
      
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
      console.log('❌ Error creating booking:', err?.response?.data || err);
      Alert.alert(
        'Error al reservar',
        err?.response?.data?.error?.message || 'No se pudo completar la reserva. Intenta de nuevo.'
      );
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return `${date.getDate()} ${MONTHS_ES[date.getMonth()]}`;
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

    return (
      <View style={styles.calendar}>
        {/* Month navigation */}
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={handlePreviousMonth} style={styles.monthArrow}>
            <Text style={styles.monthArrowText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.monthTitle}>
            {MONTHS_ES[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </Text>
          <TouchableOpacity onPress={handleNextMonth} style={styles.monthArrow}>
            <Text style={styles.monthArrowText}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Day headers */}
        <View style={styles.dayHeaders}>
          {DAYS_ES.map((day) => (
            <Text key={day} style={styles.dayHeader}>{day}</Text>
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

              return (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.calendarCell,
                    styles.calendarDay,
                    isAvailable && styles.calendarDayAvailable,
                    isSelected && styles.calendarDaySelected,
                    isPast && styles.calendarDayPast,
                  ]}
                  onPress={() => handleDateSelect(dateString)}
                  disabled={isPast || !isAvailable}
                >
                  <Text
                    style={[
                      styles.calendarDayText,
                      isAvailable && styles.calendarDayTextAvailable,
                      isSelected && styles.calendarDayTextSelected,
                      isPast && styles.calendarDayTextPast,
                    ]}
                  >
                    {day}
                  </Text>
                  {isAvailable && !isPast && (
                    <View style={[
                      styles.availabilityDot,
                      isSelected && styles.availabilityDotSelected,
                    ]} />
                  )}
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
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Cargando tour...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!tour) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>😕 Tour no encontrado</Text>
          <Text style={styles.errorText}>
            No se pudo cargar la información del tour.
          </Text>
          <Button title="Volver" onPress={() => navigation.goBack()} style={{ marginTop: 16 }} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Tour Preview */}
        <View style={styles.previewCard}>
          {tour.images?.[0] && (
            <Image source={{ uri: tour.images[0] }} style={styles.previewImage} />
          )}
          <View style={styles.previewInfo}>
            <Text style={styles.previewTitle} numberOfLines={2}>{tour.title}</Text>
            <Text style={styles.previewCompany}>
              🏢 {tour.company?.name || 'Empresa'}
            </Text>
            <View style={styles.previewMeta}>
              <Text style={styles.previewMetaItem}>⏱️ {formatDuration(tour.duration)}</Text>
              <Text style={styles.previewMetaItem}>👥 Máx. {tour.maxParticipants}</Text>
            </View>
            <Text style={styles.previewPrice}>
              {formatPrice(tour.price, tour.currency)} <Text style={styles.previewPriceLabel}>/ persona</Text>
            </Text>
          </View>
        </View>

        {/* Date Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 Selecciona una fecha</Text>
          {renderCalendar()}
          
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.primary }]} />
              <Text style={styles.legendText}>Disponible</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.border }]} />
              <Text style={styles.legendText}>No disponible</Text>
            </View>
          </View>
        </View>

        {/* Time Slot Selection */}
        {selectedDate && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⏰ Selecciona un horario</Text>
            <Text style={styles.sectionSubtitle}>{formatDate(selectedDate)}</Text>
            
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
                    >
                      <View style={styles.slotTime}>
                        <Text style={[styles.slotTimeText, isSelected && styles.slotTimeTextSelected]}>
                          {slot.startTime}
                        </Text>
                        <Text style={[styles.slotTimeEnd, isSelected && styles.slotTimeEndSelected]}>
                          hasta {slot.endTime}
                        </Text>
                      </View>
                      <View style={styles.slotInfo}>
                        <Text style={[styles.slotSpots, isSelected && styles.slotSpotsSelected]}>
                          {availableSpots} cupos
                        </Text>
                        <Text style={[styles.slotPrice, isSelected && styles.slotPriceSelected]}>
                          {formatPrice(slot.price, tour.currency)}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <View style={styles.noSlots}>
                <Text style={styles.noSlotsText}>No hay horarios disponibles para esta fecha</Text>
              </View>
            )}
          </View>
        )}

        {/* Participants */}
        {selectedSlot && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👥 Número de participantes</Text>
            <View style={styles.participantsRow}>
              <TouchableOpacity
                style={[styles.participantButton, participants <= 1 && styles.participantButtonDisabled]}
                onPress={() => handleParticipantsChange(-1)}
                disabled={participants <= 1}
              >
                <Text style={styles.participantButtonText}>−</Text>
              </TouchableOpacity>
              <View style={styles.participantCount}>
                <Text style={styles.participantNumber}>{participants}</Text>
                <Text style={styles.participantLabel}>
                  {participants === 1 ? 'persona' : 'personas'}
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.participantButton,
                  participants >= Math.min(tour.maxParticipants, selectedSlot.spotsAvailable - selectedSlot.spotsBooked) && styles.participantButtonDisabled,
                ]}
                onPress={() => handleParticipantsChange(1)}
                disabled={participants >= Math.min(tour.maxParticipants, selectedSlot.spotsAvailable - selectedSlot.spotsBooked)}
              >
                <Text style={styles.participantButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Additional Info */}
        {selectedSlot && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📝 Peticiones especiales (opcional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="¿Tienes alguna necesidad especial o preferencia?"
                placeholderTextColor={Colors.textTertiary}
                value={specialRequests}
                onChangeText={setSpecialRequests}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📱 Teléfono de contacto (opcional)</Text>
              <TextInput
                style={styles.input}
                placeholder="+56 9 1234 5678"
                placeholderTextColor={Colors.textTertiary}
                value={userPhone}
                onChangeText={setUserPhone}
                keyboardType="phone-pad"
              />
            </View>

            {/* Meeting Point Info */}
            {tour.meetingPoint && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>📍 Punto de encuentro</Text>
                <View style={styles.meetingPointCard}>
                  <Text style={styles.meetingPointText}>{tour.meetingPoint}</Text>
                  {tour.meetingPointInstructions && (
                    <Text style={styles.meetingPointInstructions}>
                      {tour.meetingPointInstructions}
                    </Text>
                  )}
                </View>
              </View>
            )}
          </>
        )}

        {/* Spacer */}
        <View style={{ height: 160 }} />
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        {selectedSlot ? (
          <>
            <View style={styles.priceBreakdown}>
              <Text style={styles.priceLabel}>
                {formatPrice(selectedSlot.price, tour.currency)} × {participants} {participants === 1 ? 'persona' : 'personas'}
              </Text>
              <Text style={styles.priceTotal}>
                {formatPrice(totalPrice, tour.currency)}
              </Text>
            </View>
            <Button
              title={submitting ? 'Reservando...' : 'Confirmar Reserva'}
              onPress={handleBooking}
              disabled={submitting}
              fullWidth
            />
          </>
        ) : (
          <View style={styles.bottomHint}>
            <Text style={styles.bottomHintText}>
              {!selectedDate 
                ? 'Selecciona una fecha para continuar'
                : 'Selecciona un horario para continuar'
              }
            </Text>
          </View>
        )}
      </View>
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
    padding: Spacing.lg,
  },
  errorTitle: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  errorText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  // Preview card
  previewCard: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    margin: Spacing.lg,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  previewImage: {
    width: 100,
    height: 120,
  },
  previewInfo: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: 'space-between',
  },
  previewTitle: {
    ...Typography.labelLarge,
    color: Colors.text,
    marginBottom: 2,
  },
  previewCompany: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  previewMeta: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: 4,
  },
  previewMetaItem: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },
  previewPrice: {
    ...Typography.labelLarge,
    color: Colors.primary,
    fontWeight: '700',
  },
  previewPriceLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '400',
  },
  // Sections
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.h5,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  sectionSubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
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
    marginBottom: Spacing.md,
  },
  monthArrow: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: Colors.background,
  },
  monthArrowText: {
    fontSize: 24,
    color: Colors.primary,
    fontWeight: '600',
  },
  monthTitle: {
    ...Typography.h4,
    color: Colors.text,
  },
  dayHeaders: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  dayHeader: {
    flex: 1,
    textAlign: 'center',
    ...Typography.labelSmall,
    color: Colors.textTertiary,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarDay: {
    borderRadius: 10,
    margin: 2,
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
  availabilityDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.success,
    marginTop: 2,
  },
  availabilityDotSelected: {
    backgroundColor: Colors.textInverse,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.lg,
    marginTop: Spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    ...Typography.caption,
    color: Colors.textSecondary,
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
  slotTime: {
    flex: 1,
  },
  slotTimeText: {
    ...Typography.h4,
    color: Colors.text,
  },
  slotTimeTextSelected: {
    color: Colors.textInverse,
  },
  slotTimeEnd: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },
  slotTimeEndSelected: {
    color: Colors.textInverse,
    opacity: 0.8,
  },
  slotInfo: {
    alignItems: 'flex-end',
  },
  slotSpots: {
    ...Typography.caption,
    color: Colors.success,
    marginBottom: 2,
  },
  slotSpotsSelected: {
    color: Colors.textInverse,
  },
  slotPrice: {
    ...Typography.labelLarge,
    color: Colors.primary,
    fontWeight: '700',
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
  participantsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: Spacing.md,
  },
  participantButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  participantButtonDisabled: {
    backgroundColor: Colors.disabled,
  },
  participantButtonText: {
    ...Typography.h3,
    color: Colors.textInverse,
  },
  participantCount: {
    alignItems: 'center',
    minWidth: 100,
    marginHorizontal: Spacing.lg,
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
  },
  // Meeting point
  meetingPointCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: Spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  meetingPointText: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '600',
  },
  meetingPointInstructions: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  // Bottom bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.card,
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  priceBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  priceLabel: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  priceTotal: {
    ...Typography.h3,
    color: Colors.primary,
    fontWeight: '700',
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
