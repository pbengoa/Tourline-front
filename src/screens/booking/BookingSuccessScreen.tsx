import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Animated, 
  Share, 
  TouchableOpacity,
  Dimensions,
  Platform,
  StatusBar,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Typography } from '../../theme';
import type { RootStackScreenProps } from '../../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type Props = RootStackScreenProps<'BookingSuccess'>;

const MONTHS_ES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

const DAYS_ES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

// Confetti Particle Component
const ConfettiParticle: React.FC<{ 
  delay: number; 
  startX: number; 
  color: string;
  size: number;
}> = ({ delay, startX, color, size }) => {
  const translateY = useRef(new Animated.Value(-50)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const drift = (Math.random() - 0.5) * 100;
    
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: SCREEN_HEIGHT + 100,
          duration: 3000 + Math.random() * 2000,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: drift,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.timing(rotate, {
            toValue: 1,
            duration: 1000 + Math.random() * 1000,
            useNativeDriver: true,
          })
        ),
      ]),
    ]).start();
  }, []);

  const spin = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        confettiStyles.particle,
        {
          left: startX,
          width: size,
          height: size,
          backgroundColor: color,
          borderRadius: size * 0.3,
          opacity,
          transform: [
            { translateY },
            { translateX },
            { rotate: spin },
          ],
        },
      ]}
    />
  );
};

const confettiStyles = StyleSheet.create({
  particle: {
    position: 'absolute',
    top: 0,
  },
});

// Confetti colors
const CONFETTI_COLORS = [
  Colors.primary,
  Colors.secondary,
  Colors.accent,
  Colors.success,
  '#FFD700',
  '#FF69B4',
];

export const BookingSuccessScreen: React.FC<Props> = ({ route, navigation }) => {
  const { 
    bookingId, 
    bookingReference, 
    tourTitle, 
    companyName,
    date,
    startTime,
    participants,
  } = route.params;

  // Animations
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const checkScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Main animation sequence
    Animated.sequence([
      // Circle scales in
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 40,
        friction: 6,
        useNativeDriver: true,
      }),
      // Checkmark appears
      Animated.spring(checkScale, {
        toValue: 1,
        tension: 100,
        friction: 5,
        useNativeDriver: true,
      }),
      // Content fades and slides in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Pulse animation for circle
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) {
      return {
        dayName: 'Fecha',
        day: '--',
        month: 'pendiente',
        year: '',
      };
    }
    const dateObj = new Date(dateString + 'T00:00:00');
    const dayName = DAYS_ES[dateObj.getDay()] || 'Día';
    const day = dateObj.getDate();
    const month = MONTHS_ES[dateObj.getMonth()] || 'mes';
    const year = dateObj.getFullYear();
    return {
      dayName: dayName.charAt(0).toUpperCase() + dayName.slice(1),
      day,
      month,
      year,
    };
  };

  const dateInfo = formatDate(date);

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
      const formattedDate = `${dateInfo.dayName}, ${dateInfo.day} de ${dateInfo.month}`;
      await Share.share({
        message: `🎉 ¡Reservé un tour increíble!\n\n🏔️ ${tourTitle}\n🏢 ${companyName}\n📅 ${formattedDate}\n⏰ ${startTime}\n👥 ${participants} ${participants === 1 ? 'persona' : 'personas'}\n\n¡Reservado en Tourline! 🌟`,
        title: 'Mi reserva en Tourline',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  // Generate confetti particles
  const confettiParticles = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    delay: Math.random() * 800,
    startX: Math.random() * SCREEN_WIDTH,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    size: 8 + Math.random() * 10,
  }));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Background gradient */}
      <LinearGradient
        colors={[Colors.successLight, Colors.background, Colors.background]}
        style={styles.backgroundGradient}
      />

      {/* Confetti */}
      <View style={styles.confettiContainer} pointerEvents="none">
        {confettiParticles.map((particle) => (
          <ConfettiParticle
            key={particle.id}
            delay={particle.delay}
            startX={particle.startX}
            color={particle.color}
            size={particle.size}
          />
        ))}
      </View>

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          {/* Success Animation */}
          <View style={styles.heroSection}>
            <Animated.View 
              style={[
                styles.successCircleOuter,
                { 
                  transform: [
                    { scale: scaleAnim },
                    { scale: pulseAnim },
                  ] 
                }
              ]}
            >
              <View style={styles.successCircleInner}>
                <Animated.Text 
                  style={[
                    styles.successCheck,
                    { transform: [{ scale: checkScale }] }
                  ]}
                >
                  ✓
                </Animated.Text>
              </View>
            </Animated.View>

            <Animated.Text 
              style={[
                styles.title,
                { 
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              ¡Reserva confirmada!
            </Animated.Text>
            
            <Animated.Text 
              style={[
                styles.subtitle,
                { 
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              Tu aventura está un paso más cerca
            </Animated.Text>
          </View>

          {/* Booking Card */}
          <Animated.View 
            style={[
              styles.bookingCard,
              { 
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            {/* Reference Badge */}
            <View style={styles.referenceBadge}>
              <Text style={styles.referenceLabel}>CÓDIGO DE RESERVA</Text>
              <Text style={styles.referenceValue}>
                {bookingReference || `#${bookingId?.slice(-8).toUpperCase()}`}
              </Text>
            </View>

            {/* Tour Info */}
            <View style={styles.tourInfo}>
              <Text style={styles.tourTitle} numberOfLines={2}>{tourTitle}</Text>
              <View style={styles.companyRow}>
                <View style={styles.companyBadge}>
                  <Text style={styles.companyBadgeText}>
                    {companyName?.charAt(0) || 'T'}
                  </Text>
                </View>
                <Text style={styles.companyName}>{companyName}</Text>
              </View>
            </View>

            {/* Details Grid */}
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <View style={[styles.detailIcon, { backgroundColor: Colors.primaryMuted }]}>
                  <Text style={styles.detailEmoji}>📅</Text>
                </View>
                <Text style={styles.detailLabel}>Fecha</Text>
                <Text style={styles.detailValue}>{dateInfo.day} {dateInfo.month}</Text>
              </View>

              <View style={styles.detailItem}>
                <View style={[styles.detailIcon, { backgroundColor: Colors.secondaryMuted }]}>
                  <Text style={styles.detailEmoji}>⏰</Text>
                </View>
                <Text style={styles.detailLabel}>Horario</Text>
                <Text style={styles.detailValue}>{startTime}</Text>
              </View>

              <View style={styles.detailItem}>
                <View style={[styles.detailIcon, { backgroundColor: Colors.successLight }]}>
                  <Text style={styles.detailEmoji}>👥</Text>
                </View>
                <Text style={styles.detailLabel}>Personas</Text>
                <Text style={styles.detailValue}>{participants}</Text>
              </View>
            </View>
          </Animated.View>

          {/* Status Card */}
          <Animated.View 
            style={[
              styles.statusCard,
              { 
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View style={styles.statusIconContainer}>
              <Text style={styles.statusIcon}>⏳</Text>
            </View>
            <View style={styles.statusContent}>
              <Text style={styles.statusTitle}>Esperando confirmación</Text>
              <Text style={styles.statusText}>
                Te notificaremos cuando la empresa confirme tu reserva.
              </Text>
            </View>
          </Animated.View>

          {/* Actions */}
          <Animated.View 
            style={[
              styles.actions,
              { 
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={handleViewBookings}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={[Colors.primary, Colors.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.primaryButtonGradient}
              >
                <Text style={styles.primaryButtonText}>Ver mis reservas</Text>
                <Text style={styles.primaryButtonIcon}>→</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.secondaryActions}>
              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={handleShare}
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryButtonIcon}>📤</Text>
                <Text style={styles.secondaryButtonText}>Compartir</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={handleBackToHome}
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryButtonIcon}>🏠</Text>
                <Text style={styles.secondaryButtonText}>Inicio</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  confettiContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 40 : Spacing.xl,
  },

  // Hero Section
  heroSection: {
    alignItems: 'center',
    paddingTop: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  successCircleOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
    marginBottom: Spacing.md,
  },
  successCircleInner: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successCheck: {
    fontSize: 44,
    color: Colors.textInverse,
    fontWeight: '300',
  },
  title: {
    ...Typography.h2,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },

  // Booking Card
  bookingCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  referenceBadge: {
    alignItems: 'center',
    backgroundColor: Colors.primaryMuted,
    marginHorizontal: -Spacing.md,
    marginTop: -Spacing.md,
    paddingVertical: Spacing.md,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginBottom: Spacing.md,
  },
  referenceLabel: {
    ...Typography.caption,
    color: Colors.primary,
    letterSpacing: 1,
    marginBottom: 2,
  },
  referenceValue: {
    ...Typography.h4,
    color: Colors.primary,
    fontWeight: '800',
    letterSpacing: 2,
  },
  tourInfo: {
    marginBottom: Spacing.md,
  },
  tourTitle: {
    ...Typography.h5,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  companyBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.xs,
  },
  companyBadgeText: {
    ...Typography.caption,
    color: Colors.textInverse,
    fontWeight: '700',
  },
  companyName: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  detailItem: {
    alignItems: 'center',
    flex: 1,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  detailEmoji: {
    fontSize: 18,
  },
  detailLabel: {
    ...Typography.caption,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginBottom: 2,
  },
  detailValue: {
    ...Typography.label,
    color: Colors.text,
    textAlign: 'center',
  },

  // Status Card
  statusCard: {
    flexDirection: 'row',
    backgroundColor: Colors.warningLight,
    borderRadius: 14,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    alignItems: 'center',
  },
  statusIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  statusIcon: {
    fontSize: 20,
  },
  statusContent: {
    flex: 1,
  },
  statusTitle: {
    ...Typography.label,
    color: Colors.text,
    marginBottom: 2,
  },
  statusText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    lineHeight: 16,
  },

  // Actions
  actions: {
    gap: Spacing.sm,
  },
  primaryButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
  },
  primaryButtonText: {
    ...Typography.button,
    color: Colors.textInverse,
    marginRight: Spacing.sm,
  },
  primaryButtonIcon: {
    ...Typography.h5,
    color: Colors.textInverse,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingVertical: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  secondaryButtonIcon: {
    fontSize: 16,
    marginRight: Spacing.xs,
  },
  secondaryButtonText: {
    ...Typography.label,
    color: Colors.text,
  },
});

