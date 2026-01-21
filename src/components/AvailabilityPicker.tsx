import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '../theme';

export interface TimeSlot {
  startTime: string; // Format: "HH:mm"
  maxBookings?: number;
}

export interface AvailabilitySchedule {
  daysOfWeek: number[]; // 0 = Sunday, 1 = Monday, etc.
  timeSlots: TimeSlot[];
  isRecurring: boolean;
  specificDates?: string[]; // ISO date strings for specific available dates
  blackoutDates?: string[]; // ISO date strings for dates when tour is unavailable
}

interface AvailabilityPickerProps {
  value: AvailabilitySchedule;
  onChange: (schedule: AvailabilitySchedule) => void;
}

const DAYS_OF_WEEK = [
  { id: 1, short: 'L', label: 'Lunes' },
  { id: 2, short: 'M', label: 'Martes' },
  { id: 3, short: 'X', label: 'Miércoles' },
  { id: 4, short: 'J', label: 'Jueves' },
  { id: 5, short: 'V', label: 'Viernes' },
  { id: 6, short: 'S', label: 'Sábado' },
  { id: 0, short: 'D', label: 'Domingo' },
];

const COMMON_TIMES = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '14:00', '15:00', '16:00', '17:00', '18:00',
];

export const AvailabilityPicker: React.FC<AvailabilityPickerProps> = ({
  value,
  onChange,
}) => {
  const [showTimeInput, setShowTimeInput] = useState(false);
  const [customTime, setCustomTime] = useState('');

  const toggleDay = (dayId: number) => {
    const newDays = value.daysOfWeek.includes(dayId)
      ? value.daysOfWeek.filter((d) => d !== dayId)
      : [...value.daysOfWeek, dayId].sort((a, b) => a - b);
    onChange({ ...value, daysOfWeek: newDays });
  };

  const addTimeSlot = (time: string) => {
    // Validate time format
    if (!/^\d{2}:\d{2}$/.test(time)) {
      Alert.alert('Error', 'Formato de hora inválido. Usa HH:mm');
      return;
    }

    // Check if already exists
    if (value.timeSlots.some((slot) => slot.startTime === time)) {
      Alert.alert('Duplicado', 'Esta hora ya está agregada');
      return;
    }

    const newSlots = [...value.timeSlots, { startTime: time }].sort((a, b) =>
      a.startTime.localeCompare(b.startTime)
    );
    onChange({ ...value, timeSlots: newSlots });
    setShowTimeInput(false);
    setCustomTime('');
  };

  const removeTimeSlot = (index: number) => {
    const newSlots = value.timeSlots.filter((_, i) => i !== index);
    onChange({ ...value, timeSlots: newSlots });
  };

  const selectAllDays = () => {
    onChange({ ...value, daysOfWeek: [0, 1, 2, 3, 4, 5, 6] });
  };

  const selectWeekdays = () => {
    onChange({ ...value, daysOfWeek: [1, 2, 3, 4, 5] });
  };

  const selectWeekends = () => {
    onChange({ ...value, daysOfWeek: [0, 6] });
  };

  const clearDays = () => {
    onChange({ ...value, daysOfWeek: [] });
  };

  return (
    <View style={styles.container}>
      {/* Days of Week Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Días disponibles</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity onPress={selectWeekdays} style={styles.quickButton}>
              <Text style={styles.quickButtonText}>L-V</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={selectWeekends} style={styles.quickButton}>
              <Text style={styles.quickButtonText}>S-D</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={selectAllDays} style={styles.quickButton}>
              <Text style={styles.quickButtonText}>Todos</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.daysRow}>
          {DAYS_OF_WEEK.map((day) => {
            const isSelected = value.daysOfWeek.includes(day.id);
            return (
              <TouchableOpacity
                key={day.id}
                style={[styles.dayButton, isSelected && styles.dayButtonSelected]}
                onPress={() => toggleDay(day.id)}
              >
                <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>
                  {day.short}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {value.daysOfWeek.length > 0 && (
          <Text style={styles.selectedDaysText}>
            {value.daysOfWeek
              .map((d) => DAYS_OF_WEEK.find((day) => day.id === d)?.label)
              .join(', ')}
          </Text>
        )}
      </View>

      {/* Time Slots Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Horarios de salida</Text>

        {/* Selected Time Slots */}
        {value.timeSlots.length > 0 && (
          <View style={styles.selectedSlots}>
            {value.timeSlots.map((slot, index) => (
              <View key={slot.startTime} style={styles.timeSlotChip}>
                <Ionicons name="time-outline" size={14} color={Colors.primary} />
                <Text style={styles.timeSlotText}>{slot.startTime}</Text>
                <TouchableOpacity
                  onPress={() => removeTimeSlot(index)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close-circle" size={18} color={Colors.textTertiary} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Common Times Quick Select */}
        <Text style={styles.subLabel}>Horarios comunes</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.commonTimesScroll}
          contentContainerStyle={styles.commonTimesContainer}
        >
          {COMMON_TIMES.map((time) => {
            const isSelected = value.timeSlots.some((s) => s.startTime === time);
            return (
              <TouchableOpacity
                key={time}
                style={[styles.commonTimeButton, isSelected && styles.commonTimeButtonSelected]}
                onPress={() => (isSelected ? null : addTimeSlot(time))}
                disabled={isSelected}
              >
                <Text
                  style={[
                    styles.commonTimeText,
                    isSelected && styles.commonTimeTextSelected,
                  ]}
                >
                  {time}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Custom Time Input */}
        {showTimeInput ? (
          <View style={styles.customTimeRow}>
            <TextInput
              style={styles.timeInput}
              placeholder="HH:mm"
              placeholderTextColor={Colors.textTertiary}
              value={customTime}
              onChangeText={setCustomTime}
              keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'default'}
              maxLength={5}
              autoFocus
            />
            <TouchableOpacity
              style={styles.addTimeButton}
              onPress={() => addTimeSlot(customTime)}
            >
              <Text style={styles.addTimeButtonText}>Agregar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelTimeButton}
              onPress={() => {
                setShowTimeInput(false);
                setCustomTime('');
              }}
            >
              <Ionicons name="close" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addCustomButton}
            onPress={() => setShowTimeInput(true)}
          >
            <Ionicons name="add-circle-outline" size={18} color={Colors.primary} />
            <Text style={styles.addCustomText}>Agregar horario personalizado</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Summary */}
      {value.daysOfWeek.length > 0 && value.timeSlots.length > 0 && (
        <View style={styles.summary}>
          <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
          <Text style={styles.summaryText}>
            {value.timeSlots.length} horario{value.timeSlots.length > 1 ? 's' : ''} disponible
            {value.timeSlots.length > 1 ? 's' : ''} en {value.daysOfWeek.length} día
            {value.daysOfWeek.length > 1 ? 's' : ''} de la semana
          </Text>
        </View>
      )}

      {(value.daysOfWeek.length === 0 || value.timeSlots.length === 0) && (
        <View style={styles.warning}>
          <Ionicons name="alert-circle-outline" size={16} color={Colors.warning} />
          <Text style={styles.warningText}>
            {value.daysOfWeek.length === 0 && 'Selecciona al menos un día. '}
            {value.timeSlots.length === 0 && 'Agrega al menos un horario.'}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  quickActions: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  quickButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    backgroundColor: Colors.surface,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  dayButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  dayText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  dayTextSelected: {
    color: '#fff',
  },
  selectedDaysText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  subLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  selectedSlots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  timeSlotChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryMuted,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: 20,
    gap: 4,
  },
  timeSlotText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  commonTimesScroll: {
    marginBottom: Spacing.sm,
  },
  commonTimesContainer: {
    flexDirection: 'row',
    gap: Spacing.xs,
    paddingRight: Spacing.sm,
  },
  commonTimeButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  commonTimeButtonSelected: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
  },
  commonTimeText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  commonTimeTextSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
  customTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  timeInput: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    fontSize: 15,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  addTimeButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 8,
  },
  addTimeButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  cancelTimeButton: {
    padding: Spacing.xs,
  },
  addCustomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
  },
  addCustomText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '500',
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.successLight,
    padding: Spacing.sm,
    borderRadius: 10,
    gap: Spacing.xs,
  },
  summaryText: {
    flex: 1,
    fontSize: 13,
    color: Colors.success,
    fontWeight: '500',
  },
  warning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warningLight,
    padding: Spacing.sm,
    borderRadius: 10,
    gap: Spacing.xs,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: Colors.warning,
  },
});

export default AvailabilityPicker;

