import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '../../theme';
import { Button, Avatar } from '../../components';
import { MOCK_GUIDES, MOCK_TOURS } from '../../constants/mockData';
import { bookingsService } from '../../services/bookingsService';
import type { RootStackScreenProps, BookingDateSlot } from '../../types';

type Props = RootStackScreenProps<'BookingConfirmation'>;

const MONTHS_ES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

const DAYS_ES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

export const BookingConfirmationScreen: React.FC<Props> = ({ route, navigation }) => {
  const {
    guideId,
    tourId,
    bookingType,
    dates,
    participants,
    tourType,
    meetingPoint,
    specialRequests,
    userPhone,
    totalPrice,
  } = route.params;

  const guide = MOCK_GUIDES.find((g) => g.id === guideId);
  const tour = tourId ? MOCK_TOURS.find((t) => t.id === tourId) : null;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'later'>('later');

  const currency = guide?.currency || 'EUR';
  const currencySymbol = currency === 'EUR' ? '€' : '$';
  const pricePerHour = guide?.pricePerHour || 0;
  const isMultiDay = dates.length > 1;

  const formatDate = (dateString: string) => {
    const dateObj = new Date(dateString + 'T00:00:00');
    const dayName = DAYS_ES[dateObj.getDay()];
    const day = dateObj.getDate();
    const month = MONTHS_ES[dateObj.getMonth()];
    return `${dayName.charAt(0).toUpperCase() + dayName.slice(1)}, ${day} de ${month}`;
  };

  const formatShortDate = (dateString: string) => {
    const dateObj = new Date(dateString + 'T00:00:00');
    const day = dateObj.getDate();
    const month = MONTHS_ES[dateObj.getMonth()].slice(0, 3);
    return `${day} ${month}`;
  };

  const calculateHours = (slot: BookingDateSlot) => {
    const start = parseInt(slot.startTime.split(':')[0]);
    const end = parseInt(slot.endTime.split(':')[0]);
    return end - start;
  };

  const totalHours = dates.reduce((sum, slot) => sum + calculateHours(slot), 0);

  const handleConfirmBooking = async () => {
    setIsSubmitting(true);

    try {
      if (isMultiDay) {
        // Create multiple bookings for multi-day
        const bookings = await bookingsService.createMultiDayBooking({
          guideId,
          dates: dates.map((d) => ({
            date: d.date,
            startTime: d.startTime,
            endTime: d.endTime,
          })),
          tourType,
          groupSize: participants,
          meetingPoint,
          specialRequests,
          userPhone,
        });

        navigation.reset({
          index: 0,
          routes: [
            { name: 'Main', params: { screen: 'Home' } },
            {
              name: 'BookingSuccess',
              params: {
                bookingId: bookings[0]?.id || `booking-${Date.now()}`,
                bookingReference: bookings[0]?.reference || `REF-${Date.now()}`,
                guideName: guide?.name || '',
                tourTitle: tour?.title || tourType,
                dates,
                isMultiDay: true,
              },
            },
          ],
        });
      } else {
        // Single booking
        const booking = await bookingsService.createBooking({
          guideId,
          date: dates[0].date,
          startTime: dates[0].startTime,
          endTime: dates[0].endTime,
          tourType,
          groupSize: participants,
          meetingPoint,
          specialRequests,
          userPhone,
        });

        navigation.reset({
          index: 0,
          routes: [
            { name: 'Main', params: { screen: 'Home' } },
            {
              name: 'BookingSuccess',
              params: {
                bookingId: booking.id || `booking-${Date.now()}`,
                bookingReference: booking.reference || `REF-${Date.now()}`,
                guideName: guide?.name || '',
                tourTitle: tour?.title || tourType,
                dates,
                isMultiDay: false,
              },
            },
          ],
        });
      }
    } catch (error) {
      console.error('Booking error:', error);
      Alert.alert(
        'Error',
        'No se pudo completar la reserva. Por favor inténtalo de nuevo.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!guide) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error al cargar la información</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Booking Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Resumen de tu reserva</Text>

          {/* Guide/Tour info */}
          <View style={styles.guidePreview}>
            <Avatar uri={guide.avatar} name={guide.name} size="medium" showBadge={guide.verified} />
            <View style={styles.guideInfo}>
              {tour ? (
                <>
                  <Text style={styles.tourTitle}>{tour.title}</Text>
                  <Text style={styles.guideName}>con {guide.name}</Text>
                </>
              ) : (
                <>
                  <Text style={styles.tourTitle}>{guide.name}</Text>
                  <Text style={styles.guideName}>
                    {tourType || 'Tour privado personalizado'}
                  </Text>
                </>
              )}
            </View>
          </View>

          <View style={styles.divider} />

          {/* Booking Type Badge */}
          <View style={styles.bookingTypeBadge}>
            <Text style={styles.bookingTypeIcon}>
              {bookingType === 'multi' ? '📆' : bookingType === 'hourly' ? '⏰' : '📅'}
            </Text>
            <Text style={styles.bookingTypeText}>
              {bookingType === 'multi' 
                ? `${dates.length} días de tour`
                : bookingType === 'hourly'
                  ? `${totalHours} horas de tour`
                  : 'Tour de un día'
              }
            </Text>
          </View>

          {/* Dates */}
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Text style={styles.detailIconText}>📅</Text>
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>
                {isMultiDay ? 'Fechas seleccionadas' : 'Fecha'}
              </Text>
              {isMultiDay ? (
                <View style={styles.datesChipsContainer}>
                  {dates.map((slot, index) => (
                    <View key={index} style={styles.dateChip}>
                      <Text style={styles.dateChipText}>{formatShortDate(slot.date)}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.detailValue}>{formatDate(dates[0].date)}</Text>
              )}
            </View>
          </View>

          {/* Time */}
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Text style={styles.detailIconText}>🕐</Text>
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Horario</Text>
              {isMultiDay ? (
                <View style={styles.timeSlotsContainer}>
                  {dates.map((slot, index) => (
                    <View key={index} style={styles.timeSlotRow}>
                      <Text style={styles.timeSlotDate}>{formatShortDate(slot.date)}:</Text>
                      <Text style={styles.timeSlotTime}>
                        {slot.startTime} - {slot.endTime}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.detailValue}>
                  {dates[0].startTime} - {dates[0].endTime}
                </Text>
              )}
            </View>
          </View>

          {/* Participants */}
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Text style={styles.detailIconText}>👥</Text>
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Participantes</Text>
              <Text style={styles.detailValue}>
                {participants} {participants === 1 ? 'persona' : 'personas'}
              </Text>
            </View>
          </View>

          {/* Location */}
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Text style={styles.detailIconText}>📍</Text>
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Ubicación</Text>
              <Text style={styles.detailValue}>{meetingPoint || guide.location}</Text>
            </View>
          </View>

          {/* Special Requests */}
          {specialRequests && (
            <>
              <View style={styles.divider} />
              <View style={styles.messageSection}>
                <Text style={styles.messageLabel}>Peticiones especiales:</Text>
                <Text style={styles.messageText}>"{specialRequests}"</Text>
              </View>
            </>
          )}

          {/* Phone */}
          {userPhone && (
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Text style={styles.detailIconText}>📱</Text>
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Teléfono</Text>
                <Text style={styles.detailValue}>{userPhone}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Método de pago</Text>

          <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === 'later' && styles.paymentOptionSelected]}
            onPress={() => setPaymentMethod('later')}
          >
            <View style={styles.paymentOptionLeft}>
              <Text style={styles.paymentIcon}>🤝</Text>
              <View>
                <Text style={styles.paymentTitle}>Pagar al guía</Text>
                <Text style={styles.paymentSubtitle}>Pago en persona al finalizar</Text>
              </View>
            </View>
            <View style={[styles.radioButton, paymentMethod === 'later' && styles.radioButtonSelected]}>
              {paymentMethod === 'later' && <View style={styles.radioButtonInner} />}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === 'card' && styles.paymentOptionSelected]}
            onPress={() => setPaymentMethod('card')}
          >
            <View style={styles.paymentOptionLeft}>
              <Text style={styles.paymentIcon}>💳</Text>
              <View>
                <Text style={styles.paymentTitle}>Tarjeta de crédito</Text>
                <Text style={styles.paymentSubtitle}>Visa, Mastercard, Amex</Text>
              </View>
            </View>
            <View style={[styles.radioButton, paymentMethod === 'card' && styles.radioButtonSelected]}>
              {paymentMethod === 'card' && <View style={styles.radioButtonInner} />}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === 'paypal' && styles.paymentOptionSelected]}
            onPress={() => setPaymentMethod('paypal')}
          >
            <View style={styles.paymentOptionLeft}>
              <Text style={styles.paymentIcon}>🅿️</Text>
              <View>
                <Text style={styles.paymentTitle}>PayPal</Text>
                <Text style={styles.paymentSubtitle}>Pago rápido y seguro</Text>
              </View>
            </View>
            <View style={[styles.radioButton, paymentMethod === 'paypal' && styles.radioButtonSelected]}>
              {paymentMethod === 'paypal' && <View style={styles.radioButtonInner} />}
            </View>
          </TouchableOpacity>
        </View>

        {/* Price Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Desglose del precio</Text>
          <View style={styles.priceCard}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>
                {currencySymbol}{pricePerHour}/hora × {totalHours}h × {participants} {participants === 1 ? 'persona' : 'personas'}
              </Text>
              <Text style={styles.priceValue}>
                {currencySymbol}{pricePerHour * totalHours * participants}
              </Text>
            </View>
            {isMultiDay && (
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>
                  {dates.length} días de tour
                </Text>
                <Text style={styles.priceValue}>incluido</Text>
              </View>
            )}
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Tarifa de servicio</Text>
              <Text style={styles.priceValue}>{currencySymbol}0</Text>
            </View>
            <View style={styles.priceDivider} />
            <View style={styles.priceRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{currencySymbol}{totalPrice}</Text>
            </View>
          </View>
        </View>

        {/* Cancellation Policy */}
        <View style={styles.section}>
          <View style={styles.policyCard}>
            <Text style={styles.policyIcon}>ℹ️</Text>
            <View style={styles.policyContent}>
              <Text style={styles.policyTitle}>Política de cancelación</Text>
              <Text style={styles.policyText}>
                Cancelación gratuita hasta 24 horas antes del tour. Después de este plazo, se
                retendrá el 50% del importe.
              </Text>
            </View>
          </View>
        </View>

        {/* Terms */}
        <View style={styles.termsSection}>
          <Text style={styles.termsText}>
            Al confirmar esta reserva, aceptas los{' '}
            <Text style={styles.termsLink}>Términos de Servicio</Text> y la{' '}
            <Text style={styles.termsLink}>Política de Privacidad</Text>
          </Text>
        </View>

        {/* Spacer */}
        <View style={{ height: 140 }} />
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomTotal}>
          <Text style={styles.bottomTotalLabel}>Total a pagar</Text>
          <Text style={styles.bottomTotalValue}>{currencySymbol}{totalPrice}</Text>
        </View>
        <Button
          title={paymentMethod === 'later' ? 'Confirmar reserva' : 'Confirmar y pagar'}
          onPress={handleConfirmBooking}
          loading={isSubmitting}
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
  summaryCard: {
    backgroundColor: Colors.card,
    margin: Spacing.lg,
    borderRadius: 20,
    padding: Spacing.lg,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryTitle: {
    ...Typography.h4,
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  guidePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  guideInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  tourTitle: {
    ...Typography.labelLarge,
    color: Colors.text,
  },
  guideName: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  bookingTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: Spacing.md,
  },
  bookingTypeIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  bookingTypeText: {
    ...Typography.label,
    color: Colors.primary,
    fontWeight: '600',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  detailIconText: {
    fontSize: 18,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  detailValue: {
    ...Typography.labelLarge,
    color: Colors.text,
  },
  datesChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  dateChip: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dateChipText: {
    ...Typography.labelSmall,
    color: Colors.textInverse,
  },
  timeSlotsContainer: {
    marginTop: 4,
  },
  timeSlotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  timeSlotDate: {
    ...Typography.label,
    color: Colors.textSecondary,
    width: 60,
  },
  timeSlotTime: {
    ...Typography.labelLarge,
    color: Colors.text,
  },
  messageSection: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: Spacing.md,
  },
  messageLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  messageText: {
    ...Typography.body,
    color: Colors.text,
    fontStyle: 'italic',
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.h5,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  paymentOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryMuted,
  },
  paymentOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  paymentTitle: {
    ...Typography.labelLarge,
    color: Colors.text,
  },
  paymentSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  radioButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: Colors.primary,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  priceCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: Spacing.md,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  priceLabel: {
    ...Typography.body,
    color: Colors.textSecondary,
    flex: 1,
  },
  priceValue: {
    ...Typography.body,
    color: Colors.text,
  },
  priceDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.sm,
  },
  totalLabel: {
    ...Typography.labelLarge,
    color: Colors.text,
  },
  totalValue: {
    ...Typography.h3,
    color: Colors.primary,
    fontWeight: '700',
  },
  policyCard: {
    flexDirection: 'row',
    backgroundColor: Colors.infoLight,
    borderRadius: 16,
    padding: Spacing.md,
  },
  policyIcon: {
    fontSize: 20,
    marginRight: Spacing.sm,
  },
  policyContent: {
    flex: 1,
  },
  policyTitle: {
    ...Typography.label,
    color: Colors.text,
    marginBottom: 4,
  },
  policyText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  termsSection: {
    paddingHorizontal: Spacing.lg,
  },
  termsText: {
    ...Typography.caption,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
  termsLink: {
    color: Colors.primary,
  },
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
  bottomTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  bottomTotalLabel: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  bottomTotalValue: {
    ...Typography.h2,
    color: Colors.primary,
    fontWeight: '700',
  },
});
