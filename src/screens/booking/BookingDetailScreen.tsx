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
import { MOCK_BOOKINGS } from '../../constants/bookingData';
import { BOOKING_STATUS_CONFIG } from '../../types/booking';
import type { RootStackScreenProps } from '../../types';

type Props = RootStackScreenProps<'BookingDetail'>;

const MONTHS_ES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

const DAYS_ES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

export const BookingDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { bookingId } = route.params;
  const booking = MOCK_BOOKINGS.find((b) => b.id === bookingId);

  const [isCancelling, setIsCancelling] = useState(false);

  if (!booking) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Reserva no encontrada</Text>
        </View>
      </SafeAreaView>
    );
  }

  const statusConfig = BOOKING_STATUS_CONFIG[booking.status];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const bookingDate = new Date(booking.date);
  const isUpcoming = bookingDate >= today;
  const canCancel = booking.status === 'pending' || booking.status === 'confirmed';

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString);
    const dayName = DAYS_ES[date.getDay()];
    const day = date.getDate();
    const month = MONTHS_ES[date.getMonth()];
    const year = date.getFullYear();
    return `${dayName.charAt(0).toUpperCase() + dayName.slice(1)}, ${day} de ${month} de ${year}`;
  };

  const handleCancelBooking = () => {
    Alert.alert(
      'Cancelar reserva',
      '¿Estás seguro de que deseas cancelar esta reserva? Esta acción no se puede deshacer.',
      [
        { text: 'No, mantener', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            setIsCancelling(true);
            try {
              // TODO: Implement actual cancellation
              await new Promise((resolve) => setTimeout(resolve, 1500));
              Alert.alert('Reserva cancelada', 'Tu reserva ha sido cancelada correctamente');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'No se pudo cancelar la reserva');
            } finally {
              setIsCancelling(false);
            }
          },
        },
      ]
    );
  };

  const handleContactGuide = () => {
    // TODO: Navigate to chat or contact modal
    Alert.alert('Próximamente', 'La función de chat estará disponible pronto');
  };

  const handleGuidePress = () => {
    navigation.navigate('GuideDetail', { guideId: booking.guideId });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Status Banner */}
        <View style={[styles.statusBanner, { backgroundColor: statusConfig.color + '15' }]}>
          <Text style={[styles.statusIcon, { color: statusConfig.color }]}>
            {statusConfig.icon}
          </Text>
          <View style={styles.statusContent}>
            <Text style={[styles.statusLabel, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
            {booking.status === 'pending' && (
              <Text style={styles.statusDescription}>Esperando confirmación del guía</Text>
            )}
            {booking.status === 'confirmed' && (
              <Text style={styles.statusDescription}>¡Tu reserva está confirmada!</Text>
            )}
          </View>
        </View>

        {/* Guide Info */}
        <TouchableOpacity style={styles.guideCard} onPress={handleGuidePress}>
          <View style={styles.guideAvatar}>
            <Text style={styles.guideAvatarText}>{getInitials(booking.guideName)}</Text>
          </View>
          <View style={styles.guideInfo}>
            <Text style={styles.guideName}>{booking.guideName}</Text>
            <Text style={styles.guideLocation}>📍 {booking.location}</Text>
          </View>
          <Text style={styles.viewGuide}>Ver perfil →</Text>
        </TouchableOpacity>

        {/* Booking Details */}
        <View style={styles.detailsCard}>
          {booking.tourTitle && (
            <View style={styles.tourTitleRow}>
              <Text style={styles.tourTitle}>{booking.tourTitle}</Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Text style={styles.detailIconText}>📅</Text>
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Fecha</Text>
              <Text style={styles.detailValue}>{formatFullDate(booking.date)}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Text style={styles.detailIconText}>🕐</Text>
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Horario</Text>
              <Text style={styles.detailValue}>
                {booking.startTime} - {booking.endTime} ({booking.duration})
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
                {booking.participants} {booking.participants === 1 ? 'persona' : 'personas'}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Text style={styles.detailIconText}>🎫</Text>
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Referencia</Text>
              <Text style={styles.detailValue}>#{booking.id.slice(-8).toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {/* Messages */}
        {(booking.userMessage || booking.guideResponse) && (
          <View style={styles.messagesCard}>
            <Text style={styles.messagesTitle}>Mensajes</Text>

            {booking.userMessage && (
              <View style={styles.messageItem}>
                <Text style={styles.messageAuthor}>Tu mensaje:</Text>
                <Text style={styles.messageText}>"{booking.userMessage}"</Text>
              </View>
            )}

            {booking.guideResponse && (
              <View style={[styles.messageItem, styles.guideMessage]}>
                <Text style={styles.messageAuthor}>
                  Respuesta de {booking.guideName.split(' ')[0]}:
                </Text>
                <Text style={styles.messageText}>"{booking.guideResponse}"</Text>
              </View>
            )}
          </View>
        )}

        {/* Price Breakdown */}
        <View style={styles.priceCard}>
          <Text style={styles.priceTitle}>Resumen del pago</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>
              {booking.pricePerPerson}€ × {booking.participants}{' '}
              {booking.participants === 1 ? 'persona' : 'personas'}
            </Text>
            <Text style={styles.priceValue}>{booking.pricePerPerson * booking.participants}€</Text>
          </View>
          <View style={styles.priceDivider} />
          <View style={styles.priceRow}>
            <Text style={styles.totalLabel}>Total pagado</Text>
            <Text style={styles.totalValue}>{booking.totalPrice}€</Text>
          </View>
        </View>

        {/* Cancellation Info */}
        {booking.status === 'cancelled' && booking.cancellationReason && (
          <View style={styles.cancellationCard}>
            <Text style={styles.cancellationTitle}>Motivo de cancelación</Text>
            <Text style={styles.cancellationReason}>{booking.cancellationReason}</Text>
          </View>
        )}

        {/* Actions */}
        {canCancel && isUpcoming && (
          <View style={styles.actionsSection}>
            <Button
              title="Contactar al guía"
              onPress={handleContactGuide}
              variant="outline"
              fullWidth
              style={styles.actionButton}
            />
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancelBooking}
              disabled={isCancelling}
            >
              <Text style={styles.cancelButtonText}>
                {isCancelling ? 'Cancelando...' : 'Cancelar reserva'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Leave Review (for completed bookings) */}
        {booking.status === 'completed' && (
          <View style={styles.reviewSection}>
            <Text style={styles.reviewTitle}>¿Cómo fue tu experiencia?</Text>
            <Button
              title="Dejar una reseña"
              onPress={() =>
                Alert.alert('Próximamente', 'La función de reseñas estará disponible pronto')
              }
              fullWidth
            />
          </View>
        )}

        <View style={{ height: Spacing.xl }} />
      </ScrollView>
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
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: Spacing.lg,
    padding: Spacing.md,
    borderRadius: 12,
  },
  statusIcon: {
    fontSize: 28,
    marginRight: Spacing.md,
  },
  statusContent: {
    flex: 1,
  },
  statusLabel: {
    ...Typography.h4,
  },
  statusDescription: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  guideCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderRadius: 12,
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
  guideName: {
    ...Typography.labelLarge,
    color: Colors.text,
  },
  guideLocation: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  viewGuide: {
    ...Typography.label,
    color: Colors.primary,
  },
  detailsCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.lg,
    borderRadius: 12,
  },
  tourTitleRow: {
    marginBottom: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tourTitle: {
    ...Typography.h4,
    color: Colors.text,
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
  messagesCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.lg,
    borderRadius: 12,
  },
  messagesTitle: {
    ...Typography.h4,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  messageItem: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  guideMessage: {
    backgroundColor: Colors.primary + '10',
  },
  messageAuthor: {
    ...Typography.labelSmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  messageText: {
    ...Typography.body,
    color: Colors.text,
    fontStyle: 'italic',
  },
  priceCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.lg,
    borderRadius: 12,
  },
  priceTitle: {
    ...Typography.h4,
    color: Colors.text,
    marginBottom: Spacing.md,
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
  cancellationCard: {
    backgroundColor: Colors.error + '10',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.lg,
    borderRadius: 12,
  },
  cancellationTitle: {
    ...Typography.labelLarge,
    color: Colors.error,
    marginBottom: Spacing.xs,
  },
  cancellationReason: {
    ...Typography.body,
    color: Colors.text,
  },
  actionsSection: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.md,
  },
  actionButton: {
    marginBottom: Spacing.md,
  },
  cancelButton: {
    alignItems: 'center',
    padding: Spacing.md,
  },
  cancelButtonText: {
    ...Typography.label,
    color: Colors.error,
  },
  reviewSection: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
  },
  reviewTitle: {
    ...Typography.h4,
    color: Colors.text,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
});
