import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Typography } from '../../theme';
import { Button, MinimalHeader } from '../../components';
import { bookingsService, Booking, BookingStatus } from '../../services/bookingsService';
import type { RootStackScreenProps } from '../../types';

type Props = RootStackScreenProps<'BookingDetail'>;

const MONTHS_ES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

const DAYS_ES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

const STATUS_CONFIG: Record<BookingStatus, { icon: string; label: string; color: string; description: string }> = {
  PENDING: { 
    icon: '⏳', 
    label: 'Pendiente', 
    color: Colors.warning,
    description: 'Esperando confirmación de la empresa'
  },
  CONFIRMED: { 
    icon: '✅', 
    label: 'Confirmada', 
    color: Colors.success,
    description: '¡Tu reserva está confirmada!'
  },
  CANCELLED_USER: { 
    icon: '❌', 
    label: 'Cancelada', 
    color: Colors.error,
    description: 'Cancelaste esta reserva'
  },
  CANCELLED_COMPANY: { 
    icon: '❌', 
    label: 'Cancelada', 
    color: Colors.error,
    description: 'La empresa canceló esta reserva'
  },
  COMPLETED: { 
    icon: '🎉', 
    label: 'Completada', 
    color: Colors.primary,
    description: '¡Esperamos que hayas disfrutado!'
  },
  NO_SHOW: { 
    icon: '👻', 
    label: 'No asistió', 
    color: Colors.textTertiary,
    description: 'No asististe a esta reserva'
  },
  REFUNDED: { 
    icon: '💰', 
    label: 'Reembolsada', 
    color: Colors.accent,
    description: 'Se ha procesado el reembolso'
  },
};

export const BookingDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { bookingId } = route.params;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchBooking = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await bookingsService.getBookingById(bookingId);
      setBooking(data);
    } catch (err: any) {
      console.log('Error fetching booking:', err);
      if (err?.response?.status === 401) {
        setError('Necesitas iniciar sesión para ver esta reserva');
      } else if (err?.response?.status === 404) {
        setError('Reserva no encontrada');
      } else {
        setError('No se pudo cargar la reserva');
      }
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const formatFullDate = (dateString: string | undefined) => {
    if (!dateString) return 'Fecha no disponible';
    const date = new Date(dateString + 'T00:00:00');
    const dayName = DAYS_ES[date.getDay()] || 'Día';
    const day = date.getDate();
    const month = MONTHS_ES[date.getMonth()] || 'mes';
    const year = date.getFullYear();
    return `${dayName.charAt(0).toUpperCase() + dayName.slice(1)}, ${day} de ${month} de ${year}`;
  };

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
              await bookingsService.cancelBooking(bookingId, { reason: 'Cancelado por el usuario' });
              Alert.alert('Reserva cancelada', 'Tu reserva ha sido cancelada correctamente');
              navigation.goBack();
            } catch (error: any) {
              Alert.alert('Error', error?.message || 'No se pudo cancelar la reserva');
            } finally {
              setIsCancelling(false);
            }
          },
        },
      ]
    );
  };

  const handleContactCompany = () => {
    // TODO: Navigate to chat
    Alert.alert('Próximamente', 'La función de chat estará disponible pronto');
  };

  const handleViewTour = () => {
    if (booking?.tourId) {
      navigation.navigate('Details', { id: booking.tourId });
    }
  };

  const handleViewCompany = () => {
    if (booking?.tour?.company?.id) {
      navigation.navigate('CompanyDetail', { companyId: booking.tour.company.id });
    }
  };

  // Loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <MinimalHeader onBack={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Cargando reserva...</Text>
        </View>
      </View>
    );
  }

  // Error state
  if (error && !booking) {
    return (
      <View style={styles.container}>
        <MinimalHeader onBack={() => navigation.goBack()} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>😕</Text>
          <Text style={styles.errorTitle}>Reserva no encontrada</Text>
          <Button title="Volver" onPress={() => navigation.goBack()} />
        </View>
      </View>
    );
  }

  if (!booking) return null;

  const statusConfig = STATUS_CONFIG[booking.status] || STATUS_CONFIG.PENDING;
  const bookingDate = new Date(booking.date);
  const isUpcoming = bookingDate >= today;
  const canCancel = (booking.status === 'PENDING' || booking.status === 'CONFIRMED') && isUpcoming;

  return (
    <View style={styles.container}>
      <MinimalHeader title="Detalle" onBack={() => navigation.goBack()} transparent light />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Tour Image Header */}
        <View style={styles.heroContainer}>
          {booking.tour?.coverImage ? (
            <Image source={{ uri: booking.tour.coverImage }} style={styles.heroImage} />
          ) : (
            <LinearGradient
              colors={[Colors.primaryLight, Colors.primary]}
              style={styles.heroPlaceholder}
            >
              <Text style={styles.heroEmoji}>🏔️</Text>
            </LinearGradient>
          )}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.heroGradient}
          />
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>{booking.tour?.name || 'Tour'}</Text>
            <TouchableOpacity style={styles.heroCompany} onPress={handleViewCompany}>
              <Text style={styles.heroCompanyText}>
                🏢 {booking.tour?.company?.name || 'Empresa'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Status Banner */}
        <View style={[styles.statusBanner, { backgroundColor: statusConfig.color + '15' }]}>
          <Text style={styles.statusIcon}>{statusConfig.icon}</Text>
          <View style={styles.statusContent}>
            <Text style={[styles.statusLabel, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
            <Text style={styles.statusDescription}>{statusConfig.description}</Text>
          </View>
        </View>

        {/* Reference */}
        <View style={styles.referenceCard}>
          <Text style={styles.referenceLabel}>Código de reserva</Text>
          <Text style={styles.referenceValue}>
            {booking.reference || `#${booking.id.slice(-8).toUpperCase()}`}
          </Text>
        </View>

        {/* Booking Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.cardTitle}>Detalles de la reserva</Text>
          
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
              <Text style={styles.detailIconText}>⏰</Text>
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Horario</Text>
              <Text style={styles.detailValue}>
                {booking.startTime} - {booking.endTime} ({formatDuration(booking.duration)})
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
        </View>

        {/* Meeting Point */}
        {booking.tour?.meetingPoint && (
          <View style={styles.meetingCard}>
            <Text style={styles.cardTitle}>📍 Punto de encuentro</Text>
            <Text style={styles.meetingAddress}>{booking.tour.meetingPoint}</Text>
            {booking.tour.meetingPointInstructions && (
              <Text style={styles.meetingInstructions}>
                💡 {booking.tour.meetingPointInstructions}
              </Text>
            )}
          </View>
        )}

        {/* Special Requests */}
        {booking.specialRequests && (
          <View style={styles.requestsCard}>
            <Text style={styles.cardTitle}>📝 Peticiones especiales</Text>
            <Text style={styles.requestsText}>"{booking.specialRequests}"</Text>
          </View>
        )}

        {/* Price Summary */}
        <View style={styles.priceCard}>
          <Text style={styles.cardTitle}>💰 Resumen del precio</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>
              {formatPrice(booking.tour?.price || 0, booking.currency)} × {booking.participants} {booking.participants === 1 ? 'persona' : 'personas'}
            </Text>
            <Text style={styles.priceValue}>
              {formatPrice((booking.tour?.price || 0) * booking.participants, booking.currency)}
            </Text>
          </View>
          <View style={styles.priceDivider} />
          <View style={styles.priceRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatPrice(booking.totalPrice, booking.currency)}</Text>
          </View>
        </View>

        {/* Cancellation Reason */}
        {booking.cancellationReason && (
          <View style={styles.cancellationCard}>
            <Text style={styles.cancellationTitle}>Motivo de cancelación</Text>
            <Text style={styles.cancellationReason}>{booking.cancellationReason}</Text>
          </View>
        )}

        {/* Notes from company */}
        {booking.notes && (
          <View style={styles.notesCard}>
            <Text style={styles.cardTitle}>💬 Nota de la empresa</Text>
            <Text style={styles.notesText}>"{booking.notes}"</Text>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionsSection}>
          <Button
            title="Ver tour"
            onPress={handleViewTour}
            variant="outline"
            fullWidth
            style={styles.actionButton}
          />
          
          {canCancel && (
            <>
              <Button
                title="Contactar empresa"
                onPress={handleContactCompany}
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
            </>
          )}

          {/* Leave Review */}
          {booking.status === 'COMPLETED' && (
            <View style={styles.reviewSection}>
              <Text style={styles.reviewTitle}>¿Cómo fue tu experiencia?</Text>
              <Button
                title="Dejar una reseña"
                onPress={() => Alert.alert('Próximamente', 'La función de reseñas estará disponible pronto')}
                fullWidth
              />
            </View>
          )}
        </View>

        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </View>
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
  errorIcon: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  errorTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  // Hero
  heroContainer: {
    height: 200,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroEmoji: {
    fontSize: 48,
    opacity: 0.5,
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  heroContent: {
    position: 'absolute',
    bottom: Spacing.md,
    left: Spacing.lg,
    right: Spacing.lg,
  },
  heroTitle: {
    ...Typography.h3,
    color: Colors.textInverse,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  heroCompany: {
    alignSelf: 'flex-start',
  },
  heroCompanyText: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.9)',
  },
  // Status Banner
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderRadius: 16,
  },
  statusIcon: {
    fontSize: 32,
    marginRight: Spacing.md,
  },
  statusContent: {
    flex: 1,
  },
  statusLabel: {
    ...Typography.h4,
    fontWeight: '700',
  },
  statusDescription: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  // Reference
  referenceCard: {
    backgroundColor: Colors.primaryMuted,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderRadius: 16,
    alignItems: 'center',
  },
  referenceLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  referenceValue: {
    ...Typography.h3,
    color: Colors.primary,
    fontWeight: '700',
    letterSpacing: 1,
    fontFamily: 'monospace',
  },
  // Cards
  detailsCard: {
    backgroundColor: Colors.card,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.lg,
    borderRadius: 16,
  },
  cardTitle: {
    ...Typography.labelLarge,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  detailIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  detailIconText: {
    fontSize: 20,
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
  // Meeting Point
  meetingCard: {
    backgroundColor: Colors.card,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.lg,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  meetingAddress: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  meetingInstructions: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  // Special Requests
  requestsCard: {
    backgroundColor: Colors.card,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.lg,
    borderRadius: 16,
  },
  requestsText: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  // Price
  priceCard: {
    backgroundColor: Colors.card,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.lg,
    borderRadius: 16,
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
    backgroundColor: Colors.borderLight,
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
  // Cancellation
  cancellationCard: {
    backgroundColor: Colors.errorLight,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.lg,
    borderRadius: 16,
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
  // Notes
  notesCard: {
    backgroundColor: Colors.card,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.lg,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent,
  },
  notesText: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  // Actions
  actionsSection: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.md,
  },
  actionButton: {
    marginBottom: Spacing.sm,
  },
  cancelButton: {
    alignItems: 'center',
    padding: Spacing.md,
    marginTop: Spacing.sm,
  },
  cancelButtonText: {
    ...Typography.label,
    color: Colors.error,
    fontWeight: '600',
  },
  reviewSection: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  reviewTitle: {
    ...Typography.h4,
    color: Colors.text,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
});
