import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '../../theme';
import { Button } from '../../components';
import type { RootStackScreenProps } from '../../types';

type Props = RootStackScreenProps<'BookingSuccess'>;

const MONTHS_ES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

export const BookingSuccessScreen: React.FC<Props> = ({ route, navigation }) => {
  const { bookingId, bookingReference, guideName, tourTitle, dates, isMultiDay } = route.params;

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(confettiAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [scaleAnim, fadeAnim, confettiAnim]);

  const formatDate = (dateString: string) => {
    const dateObj = new Date(dateString + 'T00:00:00');
    const day = dateObj.getDate();
    const month = MONTHS_ES[dateObj.getMonth()];
    return `${day} de ${month}`;
  };

  const formatShortDate = (dateString: string) => {
    const dateObj = new Date(dateString + 'T00:00:00');
    const day = dateObj.getDate();
    const month = MONTHS_ES[dateObj.getMonth()].slice(0, 3);
    return `${day} ${month}`;
  };

  const handleViewBookings = () => {
    navigation.reset({
      index: 1,
      routes: [
        { name: 'Main', params: { screen: 'Home' } },
        { name: 'MyBookings' },
      ],
    });
  };

  const handleBackToHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main', params: { screen: 'Home' } }],
    });
  };

  const handleShare = async () => {
    try {
      const dateText = isMultiDay
        ? `${dates.length} días (${formatShortDate(dates[0].date)} - ${formatShortDate(dates[dates.length - 1].date)})`
        : formatDate(dates[0].date);

      await Share.share({
        message: `🎉 ¡He reservado un tour con ${guideName}!\n\n📅 ${dateText}\n🗺️ ${tourTitle || 'Tour personalizado'}\n\n#Tourline #Viajes`,
        title: 'Mi reserva en Tourline',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Confetti background */}
      <Animated.View 
        style={[
          styles.confettiContainer,
          { opacity: confettiAnim }
        ]}
      >
        {['🎉', '✨', '🌟', '🎊', '⭐'].map((emoji, index) => (
          <Text
            key={index}
            style={[
              styles.confetti,
              { 
                left: `${15 + index * 18}%`,
                top: `${5 + (index % 3) * 8}%`,
                transform: [{ rotate: `${index * 30}deg` }],
              },
            ]}
          >
            {emoji}
          </Text>
        ))}
      </Animated.View>

      <View style={styles.content}>
        {/* Success Animation */}
        <Animated.View style={[styles.successCircle, { transform: [{ scale: scaleAnim }] }]}>
          <Text style={styles.successIcon}>✓</Text>
        </Animated.View>

        <Animated.View style={[styles.textContainer, { opacity: fadeAnim }]}>
          <Text style={styles.title}>¡Reserva enviada!</Text>
          <Text style={styles.subtitle}>
            Tu solicitud ha sido enviada a {guideName.split(' ')[0]}
          </Text>

          {/* Booking Details Card */}
          <View style={styles.detailsCard}>
            <View style={styles.referenceContainer}>
              <Text style={styles.referenceLabel}>Referencia</Text>
              <Text style={styles.referenceValue}>
                {bookingReference || `#${bookingId.slice(-8).toUpperCase()}`}
              </Text>
            </View>

            <View style={styles.divider} />

            {tourTitle && (
              <View style={styles.detailRow}>
                <Text style={styles.detailIcon}>🗺️</Text>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Tour</Text>
                  <Text style={styles.detailValue}>{tourTitle}</Text>
                </View>
              </View>
            )}

            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>👤</Text>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Guía</Text>
                <Text style={styles.detailValue}>{guideName}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>📅</Text>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>
                  {isMultiDay ? `Fechas (${dates.length} días)` : 'Fecha'}
                </Text>
                {isMultiDay ? (
                  <View style={styles.datesContainer}>
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

            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>🕐</Text>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Horario</Text>
                <Text style={styles.detailValue}>
                  {dates[0].startTime} - {dates[0].endTime}
                </Text>
              </View>
            </View>
          </View>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <Text style={styles.infoIcon}>⏳</Text>
            <Text style={styles.infoText}>
              El guía tiene 24 horas para confirmar tu reserva. Te notificaremos cuando responda.
            </Text>
          </View>

          {/* Next Steps */}
          <View style={styles.stepsContainer}>
            <Text style={styles.stepsTitle}>Próximos pasos</Text>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={styles.stepText}>Espera la confirmación del guía</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.stepText}>Recibirás los detalles del punto de encuentro</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={styles.stepText}>¡Disfruta tu experiencia!</Text>
            </View>
          </View>
        </Animated.View>
      </View>

      {/* Bottom Buttons */}
      <Animated.View style={[styles.bottomButtons, { opacity: fadeAnim }]}>
        <Button
          title="Ver mis reservas"
          onPress={handleViewBookings}
          fullWidth
        />
        <View style={styles.buttonRow}>
          <Button
            title="Compartir"
            onPress={handleShare}
            variant="outline"
            style={styles.halfButton}
          />
          <Button
            title="Inicio"
            onPress={handleBackToHome}
            variant="ghost"
            style={styles.halfButton}
          />
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    overflow: 'hidden',
  },
  confetti: {
    position: 'absolute',
    fontSize: 24,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  successIcon: {
    fontSize: 48,
    color: Colors.textInverse,
  },
  textContainer: {
    width: '100%',
    alignItems: 'center',
  },
  title: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  detailsCard: {
    width: '100%',
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  referenceContainer: {
    alignItems: 'center',
    marginBottom: Spacing.md,
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
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: Spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  detailIcon: {
    fontSize: 20,
    marginRight: Spacing.md,
    width: 28,
    textAlign: 'center',
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
  datesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  dateChip: {
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dateChipText: {
    ...Typography.labelSmall,
    color: Colors.primary,
    fontWeight: '600',
  },
  infoCard: {
    width: '100%',
    flexDirection: 'row',
    backgroundColor: Colors.warningLight,
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: Spacing.sm,
  },
  infoText: {
    flex: 1,
    ...Typography.bodySmall,
    color: Colors.text,
    lineHeight: 20,
  },
  stepsContainer: {
    width: '100%',
  },
  stepsTitle: {
    ...Typography.labelLarge,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  stepNumberText: {
    ...Typography.label,
    color: Colors.primary,
    fontWeight: '700',
  },
  stepText: {
    ...Typography.body,
    color: Colors.textSecondary,
    flex: 1,
  },
  bottomButtons: {
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  halfButton: {
    flex: 1,
  },
});
