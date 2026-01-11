import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Colors, Spacing, Typography } from '../../theme';
import { Button } from '../../components';
import { MOCK_GUIDES, MOCK_TOURS } from '../../constants/mockData';
import type { RootStackScreenProps } from '../../types';

type Props = RootStackScreenProps<'BookingConfirmation'>;

const MONTHS_ES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
];

const DAYS_ES = [
  'domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'
];

export const BookingConfirmationScreen: React.FC<Props> = ({ route, navigation }) => {
  const { guideId, tourId, date, timeSlot, participants, message, totalPrice } = route.params;
  
  const guide = MOCK_GUIDES.find((g) => g.id === guideId);
  const tour = tourId ? MOCK_TOURS.find((t) => t.id === tourId) : null;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card');

  const pricePerPerson = tour?.price || guide?.pricePerHour || 0;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    const dateObj = new Date(dateString);
    const dayName = DAYS_ES[dateObj.getDay()];
    const day = dateObj.getDate();
    const month = MONTHS_ES[dateObj.getMonth()];
    return `${dayName.charAt(0).toUpperCase() + dayName.slice(1)}, ${day} de ${month}`;
  };

  const handleConfirmBooking = async () => {
    setIsSubmitting(true);
    
    try {
      // TODO: Implement actual booking API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // Navigate to success screen
      navigation.reset({
        index: 0,
        routes: [
          { name: 'Main' },
          {
            name: 'BookingSuccess',
            params: {
              bookingId: `booking-${Date.now()}`,
              guideName: guide?.name || '',
              tourTitle: tour?.title,
              date,
              startTime: timeSlot.startTime,
            },
          },
        ],
      });
    } catch (error) {
      Alert.alert('Error', 'No se pudo completar la reserva. Inténtalo de nuevo.');
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
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Booking Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Resumen de tu reserva</Text>
          
          {/* Guide/Tour info */}
          <View style={styles.summaryRow}>
            <View style={styles.guidePreview}>
              <View style={styles.guideAvatar}>
                <Text style={styles.guideAvatarText}>{getInitials(guide.name)}</Text>
              </View>
              <View style={styles.guideInfo}>
                {tour ? (
                  <>
                    <Text style={styles.tourTitle}>{tour.title}</Text>
                    <Text style={styles.guideName}>con {guide.name}</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.tourTitle}>{guide.name}</Text>
                    <Text style={styles.guideName}>Guía privado</Text>
                  </>
                )}
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Date & Time */}
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Text style={styles.detailIconText}>📅</Text>
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Fecha</Text>
              <Text style={styles.detailValue}>{formatDate(date)}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Text style={styles.detailIconText}>🕐</Text>
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Horario</Text>
              <Text style={styles.detailValue}>
                {timeSlot.startTime} - {timeSlot.endTime}
              </Text>
            </View>
          </View>

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

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Text style={styles.detailIconText}>📍</Text>
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Ubicación</Text>
              <Text style={styles.detailValue}>{guide.location}</Text>
            </View>
          </View>

          {message && (
            <>
              <View style={styles.divider} />
              <View style={styles.messageSection}>
                <Text style={styles.messageLabel}>Tu mensaje:</Text>
                <Text style={styles.messageText}>"{message}"</Text>
              </View>
            </>
          )}
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Método de pago</Text>
          
          <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === 'card' && styles.paymentOptionSelected]}
            onPress={() => setPaymentMethod('card')}
          >
            <View style={styles.paymentOptionLeft}>
              <Text style={styles.paymentIcon}>💳</Text>
              <View>
                <Text style={styles.paymentTitle}>Tarjeta de crédito/débito</Text>
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
                {pricePerPerson}€ × {participants} {participants === 1 ? 'persona' : 'personas'}
              </Text>
              <Text style={styles.priceValue}>{pricePerPerson * participants}€</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Tarifa de servicio</Text>
              <Text style={styles.priceValue}>0€</Text>
            </View>
            <View style={styles.priceDivider} />
            <View style={styles.priceRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{totalPrice}€</Text>
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
                Cancelación gratuita hasta 24 horas antes del tour. 
                Después de este plazo, se retendrá el 50% del importe.
              </Text>
            </View>
          </View>
        </View>

        {/* Terms */}
        <View style={styles.termsSection}>
          <Text style={styles.termsText}>
            Al confirmar esta reserva, aceptas los{' '}
            <Text style={styles.termsLink}>Términos de Servicio</Text>
            {' '}y la{' '}
            <Text style={styles.termsLink}>Política de Privacidad</Text>
          </Text>
        </View>

        {/* Spacer */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomTotal}>
          <Text style={styles.bottomTotalLabel}>Total a pagar</Text>
          <Text style={styles.bottomTotalValue}>{totalPrice}€</Text>
        </View>
        <Button
          title="Confirmar y pagar"
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
    backgroundColor: Colors.surface,
    margin: Spacing.lg,
    borderRadius: 16,
    padding: Spacing.lg,
  },
  summaryTitle: {
    ...Typography.h4,
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  summaryRow: {
    marginBottom: Spacing.md,
  },
  guidePreview: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  guideAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  guideAvatarText: {
    ...Typography.labelLarge,
    color: Colors.textInverse,
  },
  guideInfo: {
    flex: 1,
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
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.primary + '15',
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
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  detailValue: {
    ...Typography.labelLarge,
    color: Colors.text,
  },
  messageSection: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: Spacing.md,
  },
  messageLabel: {
    ...Typography.labelSmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
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
    ...Typography.h4,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  paymentOptionSelected: {
    borderColor: Colors.primary,
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
    ...Typography.bodySmall,
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
    backgroundColor: Colors.surface,
    borderRadius: 12,
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
  },
  policyCard: {
    flexDirection: 'row',
    backgroundColor: Colors.info + '15',
    borderRadius: 12,
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
    ...Typography.labelLarge,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  policyText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  termsSection: {
    paddingHorizontal: Spacing.lg,
  },
  termsText: {
    ...Typography.bodySmall,
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
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
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
    color: Colors.text,
  },
});

