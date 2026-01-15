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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '../../theme';
import { Button, Avatar } from '../../components';
import { MOCK_GUIDES, MOCK_TOURS } from '../../constants/mockData';
import { bookingsService, CalendarDay, AvailabilitySlot } from '../../services/bookingsService';
import type { RootStackScreenProps } from '../../types';

type Props = RootStackScreenProps<'Booking'>;

type BookingType = 'single' | 'multi' | 'hourly';

interface SelectedDateSlot {
  date: string;
  slot: AvailabilitySlot | null;
}

const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const DAYS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export const BookingScreen: React.FC<Props> = ({ route, navigation }) => {
  const { guideId, tourId } = route.params;

  const guide = MOCK_GUIDES.find((g) => g.id === guideId);
  const tour = tourId ? MOCK_TOURS.find((t) => t.id === tourId) : null;

  // Generate initial mock calendar for current month
  const getInitialCalendar = (): CalendarDay[] => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const mockCalendar: CalendarDay[] = [];
    const daysInMonth = new Date(year, month, 0).getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayOfWeek = new Date(year, month - 1, day).getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const seed = day * 17 + month * 31;
      const isAvailable = !isWeekend && (seed % 10) > 2;
      
      mockCalendar.push({
        date,
        dayOfWeek: DAYS_ES[dayOfWeek],
        isAvailable,
        slots: isAvailable ? [
          { id: `${date}-1`, startTime: '09:00', endTime: '12:00', isBooked: (seed % 7) > 4, isBlocked: false },
          { id: `${date}-2`, startTime: '12:00', endTime: '15:00', isBooked: (seed % 5) > 3, isBlocked: false },
          { id: `${date}-3`, startTime: '15:00', endTime: '18:00', isBooked: (seed % 8) > 5, isBlocked: false },
          { id: `${date}-4`, startTime: '18:00', endTime: '21:00', isBooked: (seed % 4) > 2, isBlocked: false },
        ] : [],
      });
    }
    return mockCalendar;
  };

  // State
  const [bookingType, setBookingType] = useState<BookingType>('single');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarData, setCalendarData] = useState<CalendarDay[]>(getInitialCalendar);
  const [selectedDates, setSelectedDates] = useState<SelectedDateSlot[]>([]);
  const [participants, setParticipants] = useState(1);
  const [tourType, setTourType] = useState('');
  const [meetingPoint, setMeetingPoint] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Derived values
  const pricePerHour = guide?.pricePerHour || 0;
  const currency = guide?.currency || 'EUR';

  // Calculate total price based on selected slots
  const calculateTotalPrice = useCallback(() => {
    let totalHours = 0;
    selectedDates.forEach(({ slot }) => {
      if (slot) {
        const start = parseInt(slot.startTime.split(':')[0]);
        const end = parseInt(slot.endTime.split(':')[0]);
        totalHours += end - start;
      }
    });
    return totalHours * pricePerHour * participants;
  }, [selectedDates, pricePerHour, participants]);

  const totalPrice = calculateTotalPrice();

  // Generate mock calendar data
  const generateMockCalendar = useCallback((year: number, month: number): CalendarDay[] => {
    const mockCalendar: CalendarDay[] = [];
    const daysInMonth = new Date(year, month, 0).getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayOfWeek = new Date(year, month - 1, day).getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      // Use deterministic "random" based on day for consistent results
      const seed = day * 17 + month * 31;
      const isAvailable = !isWeekend && (seed % 10) > 2;
      
      mockCalendar.push({
        date,
        dayOfWeek: DAYS_ES[dayOfWeek],
        isAvailable,
        slots: isAvailable ? [
          { id: `${date}-1`, startTime: '09:00', endTime: '12:00', isBooked: (seed % 7) > 4, isBlocked: false },
          { id: `${date}-2`, startTime: '12:00', endTime: '15:00', isBooked: (seed % 5) > 3, isBlocked: false },
          { id: `${date}-3`, startTime: '15:00', endTime: '18:00', isBooked: (seed % 8) > 5, isBlocked: false },
          { id: `${date}-4`, startTime: '18:00', endTime: '21:00', isBooked: (seed % 4) > 2, isBlocked: false },
        ] : [],
      });
    }
    return mockCalendar;
  }, []);

  // Fetch calendar data
  const fetchCalendar = useCallback(async () => {
    try {
      setLoading(true);
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;
      
      // Try to fetch from API, fallback to mock data
      try {
        const data = await bookingsService.getGuideCalendar(guideId, year, month);
        // Ensure we always set an array
        if (Array.isArray(data) && data.length > 0) {
          setCalendarData(data);
        } else {
          setCalendarData(generateMockCalendar(year, month));
        }
      } catch {
        // Generate mock calendar data on API failure
        setCalendarData(generateMockCalendar(year, month));
      }
    } catch (error) {
      console.error('Error fetching calendar:', error);
      // Final fallback - still generate mock data
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;
      setCalendarData(generateMockCalendar(year, month));
    } finally {
      setLoading(false);
    }
  }, [guideId, currentMonth, generateMockCalendar]);

  useEffect(() => {
    fetchCalendar();
  }, [fetchCalendar]);

  // Handlers
  const handlePreviousMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    const today = new Date();
    today.setDate(1);
    if (newMonth >= today) {
      setCurrentMonth(newMonth);
    }
  };

  const handleNextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    setCurrentMonth(newMonth);
  };

  const handleDateSelect = (date: string) => {
    const dayData = (calendarData || []).find((d) => d.date === date);
    if (!dayData?.isAvailable) return;

    if (bookingType === 'single' || bookingType === 'hourly') {
      // Single date selection
      const existingIndex = selectedDates.findIndex((d) => d.date === date);
      if (existingIndex >= 0) {
        setSelectedDates([]);
      } else {
        setSelectedDates([{ date, slot: null }]);
      }
    } else {
      // Multi-day selection
      const existingIndex = selectedDates.findIndex((d) => d.date === date);
      if (existingIndex >= 0) {
        setSelectedDates(selectedDates.filter((d) => d.date !== date));
      } else {
        setSelectedDates([...selectedDates, { date, slot: null }].sort((a, b) => 
          a.date.localeCompare(b.date)
        ));
      }
    }
  };

  const handleSlotSelect = (date: string, slot: AvailabilitySlot) => {
    setSelectedDates(
      selectedDates.map((d) => (d.date === date ? { ...d, slot } : d))
    );
  };

  const handleParticipantsChange = (delta: number) => {
    const maxParticipants = tour?.maxParticipants || 10;
    const newValue = participants + delta;
    if (newValue >= 1 && newValue <= maxParticipants) {
      setParticipants(newValue);
    }
  };

  const handleContinue = () => {
    // Validate selection
    if (selectedDates.length === 0) {
      Alert.alert('Error', 'Por favor selecciona al menos una fecha');
      return;
    }

    // Check if all dates have slots selected (for hourly booking)
    if (bookingType === 'hourly' || bookingType === 'single') {
      const hasAllSlots = selectedDates.every((d) => d.slot !== null);
      if (!hasAllSlots) {
        Alert.alert('Error', 'Por favor selecciona un horario para cada fecha');
        return;
      }
    }

    // For multi-day, we need to set default times if not hourly
    const bookingDates = selectedDates.map((d) => ({
      date: d.date,
      startTime: d.slot?.startTime || '09:00',
      endTime: d.slot?.endTime || '18:00',
    }));

    navigation.navigate('BookingConfirmation', {
      guideId,
      tourId,
      bookingType,
      dates: bookingDates,
      participants,
      tourType: tourType.trim() || undefined,
      meetingPoint: meetingPoint.trim() || undefined,
      specialRequests: specialRequests.trim() || undefined,
      userPhone: userPhone.trim() || undefined,
      totalPrice,
    });
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

  const getAvailableSlotsForDate = (date: string) => {
    const dayData = (calendarData || []).find((d) => d.date === date);
    return dayData?.slots.filter((s) => !s.isBooked && !s.isBlocked) || [];
  };

  const isDateSelected = (date: string) => {
    return selectedDates.some((d) => d.date === date);
  };

  const isDateAvailable = (date: string) => {
    const dayData = (calendarData || []).find((d) => d.date === date);
    return dayData?.isAvailable ?? false;
  };

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
        {loading ? (
          <View style={styles.loadingContainer}>
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
              const isSelected = isDateSelected(dateString);

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

  if (!guide) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Guía no encontrado</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Guide/Tour Preview */}
        <View style={styles.previewCard}>
          <Avatar uri={guide.avatar} name={guide.name} size="medium" showBadge={guide.verified} />
          <View style={styles.previewInfo}>
            {tour ? (
              <>
                <Text style={styles.previewTitle}>{tour.title}</Text>
                <Text style={styles.previewSubtitle}>con {guide.name}</Text>
              </>
            ) : (
              <>
                <Text style={styles.previewTitle}>{guide.name}</Text>
                <Text style={styles.previewSubtitle}>📍 {guide.location}</Text>
              </>
            )}
            <View style={styles.previewRating}>
              <Text style={styles.previewRatingText}>⭐ {guide.rating}</Text>
              <Text style={styles.previewPrice}>
                {currency === 'EUR' ? '€' : '$'}{pricePerHour}/hora
              </Text>
            </View>
          </View>
        </View>

        {/* Booking Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tipo de reserva</Text>
          <View style={styles.bookingTypeRow}>
            <TouchableOpacity
              style={[styles.bookingTypeButton, bookingType === 'single' && styles.bookingTypeButtonActive]}
              onPress={() => {
                setBookingType('single');
                setSelectedDates([]);
              }}
            >
              <Text style={styles.bookingTypeIcon}>📅</Text>
              <Text style={[styles.bookingTypeText, bookingType === 'single' && styles.bookingTypeTextActive]}>
                Un día
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.bookingTypeButton, bookingType === 'multi' && styles.bookingTypeButtonActive]}
              onPress={() => {
                setBookingType('multi');
                setSelectedDates([]);
              }}
            >
              <Text style={styles.bookingTypeIcon}>📆</Text>
              <Text style={[styles.bookingTypeText, bookingType === 'multi' && styles.bookingTypeTextActive]}>
                Varios días
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.bookingTypeButton, bookingType === 'hourly' && styles.bookingTypeButtonActive]}
              onPress={() => {
                setBookingType('hourly');
                setSelectedDates([]);
              }}
            >
              <Text style={styles.bookingTypeIcon}>⏰</Text>
              <Text style={[styles.bookingTypeText, bookingType === 'hourly' && styles.bookingTypeTextActive]}>
                Por horas
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Date Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {bookingType === 'multi' ? 'Selecciona las fechas' : 'Selecciona una fecha'}
          </Text>
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
            {bookingType === 'multi' && (
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: Colors.secondary }]} />
                <Text style={styles.legendText}>Seleccionado</Text>
              </View>
            )}
          </View>
        </View>

        {/* Time Selection - Show for each selected date */}
        {selectedDates.length > 0 && (bookingType === 'hourly' || bookingType === 'single') && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Selecciona horario</Text>
            {selectedDates.map(({ date, slot: selectedSlot }) => {
              const slots = getAvailableSlotsForDate(date);
              return (
                <View key={date} style={styles.dateSlotContainer}>
                  <Text style={styles.dateSlotTitle}>📅 {formatDate(date)}</Text>
                  {slots.length > 0 ? (
                    <View style={styles.slotsGrid}>
                      {slots.map((slot) => (
                        <TouchableOpacity
                          key={slot.id}
                          style={[
                            styles.slotButton,
                            selectedSlot?.id === slot.id && styles.slotButtonSelected,
                          ]}
                          onPress={() => handleSlotSelect(date, slot as AvailabilitySlot)}
                        >
                          <Text style={[
                            styles.slotTime,
                            selectedSlot?.id === slot.id && styles.slotTimeSelected,
                          ]}>
                            {slot.startTime}
                          </Text>
                          <Text style={[
                            styles.slotDuration,
                            selectedSlot?.id === slot.id && styles.slotDurationSelected,
                          ]}>
                            hasta {slot.endTime}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  ) : (
                    <View style={styles.noSlots}>
                      <Text style={styles.noSlotsText}>No hay horarios disponibles</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Selected dates summary for multi-day */}
        {bookingType === 'multi' && selectedDates.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fechas seleccionadas ({selectedDates.length})</Text>
            <View style={styles.selectedDatesContainer}>
              {selectedDates.map(({ date }) => (
                <View key={date} style={styles.selectedDateChip}>
                  <Text style={styles.selectedDateText}>{formatDate(date)}</Text>
                  <TouchableOpacity
                    onPress={() => setSelectedDates(selectedDates.filter((d) => d.date !== date))}
                  >
                    <Text style={styles.selectedDateRemove}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Participants */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Número de participantes</Text>
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
                participants >= (tour?.maxParticipants || 10) && styles.participantButtonDisabled,
              ]}
              onPress={() => handleParticipantsChange(1)}
              disabled={participants >= (tour?.maxParticipants || 10)}
            >
              <Text style={styles.participantButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tour Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tipo de tour (opcional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Tour gastronómico, Cultural, Aventura..."
            placeholderTextColor={Colors.textTertiary}
            value={tourType}
            onChangeText={setTourType}
          />
        </View>

        {/* Meeting Point */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Punto de encuentro (opcional)</Text>
          <TextInput
            style={styles.input}
            placeholder="¿Dónde te gustaría encontrarte?"
            placeholderTextColor={Colors.textTertiary}
            value={meetingPoint}
            onChangeText={setMeetingPoint}
          />
        </View>

        {/* Special Requests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Peticiones especiales (opcional)</Text>
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

        {/* Phone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Teléfono de contacto (opcional)</Text>
          <TextInput
            style={styles.input}
            placeholder="+34 612 345 678"
            placeholderTextColor={Colors.textTertiary}
            value={userPhone}
            onChangeText={setUserPhone}
            keyboardType="phone-pad"
          />
        </View>

        {/* Spacer */}
        <View style={{ height: 140 }} />
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.priceBreakdown}>
          {selectedDates.length > 0 && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>
                {bookingType === 'multi' 
                  ? `${selectedDates.length} días × ${participants} personas`
                  : `${pricePerHour}€/hora × ${participants} personas`
                }
              </Text>
              <Text style={styles.priceValue}>
                {currency === 'EUR' ? '€' : '$'}{totalPrice || pricePerHour * participants}
              </Text>
            </View>
          )}
        </View>
        <Button
          title={`Continuar${totalPrice > 0 ? ` - ${currency === 'EUR' ? '€' : '$'}${totalPrice}` : ''}`}
          onPress={handleContinue}
          disabled={selectedDates.length === 0}
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    margin: Spacing.lg,
    padding: Spacing.md,
    borderRadius: 16,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  previewInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  previewTitle: {
    ...Typography.labelLarge,
    color: Colors.text,
  },
  previewSubtitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  previewRating: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  previewRatingText: {
    ...Typography.label,
    color: Colors.text,
  },
  previewPrice: {
    ...Typography.labelLarge,
    color: Colors.primary,
    fontWeight: '700',
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h5,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  // Booking type
  bookingTypeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  bookingTypeButton: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  bookingTypeButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryMuted,
  },
  bookingTypeIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  bookingTypeText: {
    ...Typography.labelSmall,
    color: Colors.textSecondary,
  },
  bookingTypeTextActive: {
    color: Colors.primary,
    fontWeight: '700',
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
  // Time slots
  dateSlotContainer: {
    marginBottom: Spacing.md,
  },
  dateSlotTitle: {
    ...Typography.label,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  slotButton: {
    backgroundColor: Colors.card,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minWidth: 100,
    alignItems: 'center',
  },
  slotButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  slotTime: {
    ...Typography.labelLarge,
    color: Colors.text,
    fontWeight: '600',
  },
  slotTimeSelected: {
    color: Colors.textInverse,
  },
  slotDuration: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  slotDurationSelected: {
    color: Colors.textInverse,
    opacity: 0.8,
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
  // Selected dates
  selectedDatesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  selectedDateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    gap: Spacing.sm,
  },
  selectedDateText: {
    ...Typography.label,
    color: Colors.textInverse,
  },
  selectedDateRemove: {
    color: Colors.textInverse,
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.8,
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
    marginBottom: Spacing.sm,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  priceValue: {
    ...Typography.h3,
    color: Colors.primary,
    fontWeight: '700',
  },
});
