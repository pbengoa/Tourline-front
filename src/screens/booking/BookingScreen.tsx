import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Colors, Spacing, Typography } from '../../theme';
import { Button } from '../../components';
import { MOCK_GUIDES, MOCK_TOURS } from '../../constants/mockData';
import { AVAILABLE_DAYS } from '../../constants/bookingData';
import type { RootStackScreenProps, TimeSlot } from '../../types';

type Props = RootStackScreenProps<'Booking'>;

const MONTHS_ES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const DAYS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export const BookingScreen: React.FC<Props> = ({ route, navigation }) => {
  const { guideId, tourId } = route.params;

  const guide = MOCK_GUIDES.find((g) => g.id === guideId);
  const tour = tourId ? MOCK_TOURS.find((t) => t.id === tourId) : null;

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [participants, setParticipants] = useState(1);
  const [message, setMessage] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const pricePerPerson = tour?.price || guide?.pricePerHour || 0;
  const totalPrice = pricePerPerson * participants;

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
    return `${date.getDate()} ${MONTHS_ES[date.getMonth()]}`;
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    return { daysInMonth, startingDay };
  };

  const isDateAvailable = (dateString: string) => {
    const day = AVAILABLE_DAYS.find((d) => d.date === dateString);
    return day?.available ?? false;
  };

  const getAvailableSlots = (dateString: string) => {
    const day = AVAILABLE_DAYS.find((d) => d.date === dateString);
    return day?.slots.filter((s) => s.available) ?? [];
  };

  const availableSlots = selectedDate ? getAvailableSlots(selectedDate) : [];

  const handlePreviousMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    if (newMonth >= new Date()) {
      setCurrentMonth(newMonth);
    }
  };

  const handleNextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    setCurrentMonth(newMonth);
  };

  const handleDateSelect = (dateString: string) => {
    if (isDateAvailable(dateString)) {
      setSelectedDate(dateString);
      setSelectedSlot(null);
    }
  };

  const handleParticipantsChange = (delta: number) => {
    const newValue = participants + delta;
    if (newValue >= 1 && newValue <= (tour?.maxParticipants || 10)) {
      setParticipants(newValue);
    }
  };

  const handleContinue = () => {
    if (!selectedDate || !selectedSlot) {
      Alert.alert('Error', 'Por favor selecciona fecha y hora');
      return;
    }

    navigation.navigate('BookingConfirmation', {
      guideId,
      tourId,
      date: selectedDate,
      timeSlot: selectedSlot,
      participants,
      message: message.trim() || undefined,
      totalPrice,
    });
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDay } = getDaysInMonth(currentMonth);
    const days: (number | null)[] = [];

    // Add empty cells for days before the first day of month
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }

    // Add days of month
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
            <Text key={day} style={styles.dayHeader}>
              {day}
            </Text>
          ))}
        </View>

        {/* Calendar grid */}
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
              </TouchableOpacity>
            );
          })}
        </View>
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
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Guide/Tour Preview */}
        <View style={styles.previewCard}>
          <View style={styles.previewAvatar}>
            <Text style={styles.previewAvatarText}>{getInitials(guide.name)}</Text>
          </View>
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
              <Text style={styles.previewReviews}>({guide.reviewCount} reseñas)</Text>
            </View>
          </View>
        </View>

        {/* Date Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Selecciona una fecha</Text>
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

        {/* Time Selection */}
        {selectedDate && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Horarios disponibles - {formatDate(selectedDate)}
            </Text>
            {availableSlots.length > 0 ? (
              <View style={styles.slotsGrid}>
                {availableSlots.map((slot) => (
                  <TouchableOpacity
                    key={slot.id}
                    style={[
                      styles.slotButton,
                      selectedSlot?.id === slot.id && styles.slotButtonSelected,
                    ]}
                    onPress={() => setSelectedSlot(slot)}
                  >
                    <Text
                      style={[
                        styles.slotTime,
                        selectedSlot?.id === slot.id && styles.slotTimeSelected,
                      ]}
                    >
                      {slot.startTime}
                    </Text>
                    <Text
                      style={[
                        styles.slotDuration,
                        selectedSlot?.id === slot.id && styles.slotDurationSelected,
                      ]}
                    >
                      hasta {slot.endTime}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.noSlots}>
                <Text style={styles.noSlotsText}>No hay horarios disponibles para esta fecha</Text>
              </View>
            )}
          </View>
        )}

        {/* Participants */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Número de participantes</Text>
          <View style={styles.participantsRow}>
            <TouchableOpacity
              style={[
                styles.participantButton,
                participants <= 1 && styles.participantButtonDisabled,
              ]}
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
          {tour && (
            <Text style={styles.maxParticipants}>Máximo {tour.maxParticipants} participantes</Text>
          )}
        </View>

        {/* Message */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mensaje para el guía (opcional)</Text>
          <TextInput
            style={styles.messageInput}
            placeholder="¿Tienes alguna pregunta o petición especial?"
            placeholderTextColor={Colors.textTertiary}
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Spacer */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.priceBreakdown}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>
              {pricePerPerson}€ × {participants} {participants === 1 ? 'persona' : 'personas'}
            </Text>
            <Text style={styles.priceValue}>{totalPrice}€</Text>
          </View>
        </View>
        <Button
          title="Continuar"
          onPress={handleContinue}
          disabled={!selectedDate || !selectedSlot}
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
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    margin: Spacing.lg,
    padding: Spacing.md,
    borderRadius: 12,
  },
  previewAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  previewAvatarText: {
    ...Typography.h4,
    color: Colors.textInverse,
  },
  previewInfo: {
    flex: 1,
  },
  previewTitle: {
    ...Typography.labelLarge,
    color: Colors.text,
  },
  previewSubtitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  previewRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewRatingText: {
    ...Typography.label,
    color: Colors.text,
    marginRight: Spacing.xs,
  },
  previewReviews: {
    ...Typography.bodySmall,
    color: Colors.textTertiary,
  },
  section: {
    padding: Spacing.lg,
    paddingTop: 0,
  },
  sectionTitle: {
    ...Typography.h4,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  // Calendar styles
  calendar: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  monthArrow: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthArrowText: {
    fontSize: 24,
    color: Colors.primary,
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
    borderRadius: 8,
  },
  calendarDayAvailable: {
    backgroundColor: Colors.primary + '10',
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
  },
  calendarDayTextPast: {
    color: Colors.textTertiary,
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
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: Spacing.xs,
  },
  legendText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  // Time slots
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  slotButton: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
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
  },
  slotTimeSelected: {
    color: Colors.textInverse,
  },
  slotDuration: {
    ...Typography.labelSmall,
    color: Colors.textTertiary,
  },
  slotDurationSelected: {
    color: Colors.textInverse + '80',
  },
  noSlots: {
    backgroundColor: Colors.surface,
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
    backgroundColor: Colors.surface,
    borderRadius: 12,
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
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  maxParticipants: {
    ...Typography.bodySmall,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  // Message
  messageInput: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
    minHeight: 80,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Typography.body,
    color: Colors.text,
  },
  // Bottom bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  priceBreakdown: {
    marginBottom: Spacing.md,
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
    color: Colors.text,
  },
});
