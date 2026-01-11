import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Animated } from 'react-native';
import { Colors, Spacing, Typography } from '../../theme';
import { Button } from '../../components';
import type { RootStackScreenProps } from '../../types';

type Props = RootStackScreenProps<'BookingSuccess'>;

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

export const BookingSuccessScreen: React.FC<Props> = ({ route, navigation }) => {
  const { bookingId, guideName, tourTitle, date, startTime } = route.params;

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const formatDate = (dateString: string) => {
    const dateObj = new Date(dateString);
    const day = dateObj.getDate();
    const month = MONTHS_ES[dateObj.getMonth()];
    const year = dateObj.getFullYear();
    return `${day} de ${month} de ${year}`;
  };

  const handleViewBookings = () => {
    navigation.reset({
      index: 1,
      routes: [{ name: 'Main' }, { name: 'MyBookings' }],
    });
  };

  const handleBackToHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main' }],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
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

          {/* Booking Details */}
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>🎫</Text>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Referencia</Text>
                <Text style={styles.detailValue}>#{bookingId.slice(-8).toUpperCase()}</Text>
              </View>
            </View>

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
                <Text style={styles.detailLabel}>Fecha</Text>
                <Text style={styles.detailValue}>{formatDate(date)}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>🕐</Text>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Hora</Text>
                <Text style={styles.detailValue}>{startTime}</Text>
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
      <View style={styles.bottomButtons}>
        <Button
          title="Ver mis reservas"
          onPress={handleViewBookings}
          fullWidth
          style={styles.primaryButton}
        />
        <Button title="Volver al inicio" onPress={handleBackToHome} variant="outline" fullWidth />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  detailValue: {
    ...Typography.labelLarge,
    color: Colors.text,
  },
  infoCard: {
    width: '100%',
    flexDirection: 'row',
    backgroundColor: Colors.warning + '15',
    borderRadius: 12,
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
    lineHeight: 18,
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
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  stepNumberText: {
    ...Typography.labelSmall,
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
  primaryButton: {
    marginBottom: Spacing.sm,
  },
});
