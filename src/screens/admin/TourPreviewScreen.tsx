import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Typography } from '../../theme';
import { adminService, AdminTour } from '../../services';

interface TourPreviewScreenProps {
  navigation: any;
  route: {
    params: {
      tourId: string;
    };
  };
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PUBLISHED: { label: 'Publicado', color: Colors.success, bg: Colors.successLight },
  DRAFT: { label: 'Borrador', color: Colors.warning, bg: Colors.warningLight },
  ARCHIVED: { label: 'Archivado', color: Colors.textTertiary, bg: Colors.surface },
};

export const TourPreviewScreen: React.FC<TourPreviewScreenProps> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { tourId } = route.params;

  const [tour, setTour] = useState<AdminTour | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTour();
  }, [tourId]);

  const loadTour = async () => {
    try {
      setLoading(true);
      const data = await adminService.getTourById(tourId);
      setTour(data);
    } catch (error) {
      console.error('Error loading tour:', error);
      Alert.alert('Error', 'No se pudo cargar el tour');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigation.navigate('TourForm', { tourId });
  };

  const handleTogglePublish = async () => {
    if (!tour) return;
    
    try {
      if (tour.status === 'PUBLISHED') {
        await adminService.unpublishTour(tour.id);
        Alert.alert('Éxito', 'Tour despublicado');
      } else {
        await adminService.publishTour(tour.id);
        Alert.alert('Éxito', 'Tour publicado');
      }
      loadTour();
    } catch (error) {
      Alert.alert('Error', 'No se pudo cambiar el estado');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Archivar Tour',
      '¿Estás seguro de archivar este tour?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Archivar',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminService.deleteTour(tourId);
              Alert.alert('Éxito', 'Tour archivado');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'No se pudo archivar');
            }
          },
        },
      ]
    );
  };

  const formatPrice = (price: number, currency: string) => {
    if (currency === 'CLP') {
      return `$${price?.toLocaleString('es-CL') || 0}`;
    }
    return `€${price || 0}`;
  };

  const formatDuration = (duration: number) => {
    if (!duration) return '-';
    if (duration < 60) return `${duration} min`;
    const hours = Math.floor(duration / 60);
    const mins = duration % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours} horas`;
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  if (!tour) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons name="alert-circle-outline" size={64} color={Colors.textTertiary} />
        <Text style={styles.errorText}>Tour no encontrado</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusConfig = STATUS_CONFIG[tour.status] || STATUS_CONFIG.DRAFT;

  return (
    <View style={styles.container}>
      {/* Hero Image */}
      <View style={styles.heroContainer}>
        {tour.image || tour.coverImage ? (
          <Image source={{ uri: tour.image || tour.coverImage }} style={styles.heroImage} />
        ) : (
          <LinearGradient
            colors={[Colors.primaryLight, Colors.primary]}
            style={styles.heroPlaceholder}
          >
            <Text style={styles.heroEmoji}>🏔️</Text>
          </LinearGradient>
        )}
        <LinearGradient
          colors={['rgba(0,0,0,0.6)', 'transparent']}
          style={styles.heroGradientTop}
        />
        
        {/* Header Overlay */}
        <View style={[styles.headerOverlay, { paddingTop: insets.top }]}>
          <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={handleEdit}>
            <Ionicons name="create-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Status Badge */}
        <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
          <View style={[styles.statusDot, { backgroundColor: statusConfig.color }]} />
          <Text style={[styles.statusText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title & Location */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>{tour.title}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.location}>{tour.location || 'Sin ubicación'}</Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatPrice(tour.price, tour.currency)}</Text>
            <Text style={styles.statLabel}>Precio</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatDuration(tour.duration)}</Text>
            <Text style={styles.statLabel}>Duración</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{tour.maxParticipants || '-'}</Text>
            <Text style={styles.statLabel}>Max. personas</Text>
          </View>
        </View>

        {/* Booking Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estadísticas</Text>
          <View style={styles.bookingStats}>
            <View style={styles.bookingStat}>
              <Text style={styles.bookingStatValue}>{tour.bookingCount || 0}</Text>
              <Text style={styles.bookingStatLabel}>Reservas totales</Text>
            </View>
            <View style={styles.bookingStat}>
              <Text style={styles.bookingStatValue}>⭐ {tour.rating ? parseFloat(String(tour.rating)).toFixed(1) : '-'}</Text>
              <Text style={styles.bookingStatLabel}>{tour.reviewCount || 0} reseñas</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.description}>{tour.description || 'Sin descripción'}</Text>
        </View>

        {/* Meeting Point */}
        {(tour.meetingPoint || tour.meetingPointAddress) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Punto de encuentro</Text>
            <View style={styles.meetingPoint}>
              <Ionicons name="navigate-outline" size={20} color={Colors.primary} />
              <Text style={styles.meetingPointText}>{tour.meetingPoint || tour.meetingPointAddress}</Text>
            </View>
          </View>
        )}

        {/* Includes */}
        {(tour.includes?.length > 0 || tour.included?.length > 0) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Incluye</Text>
            {(tour.includes || tour.included || []).map((item: string, index: number) => (
              <View key={index} style={styles.listItem}>
                <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
                <Text style={styles.listItemText}>{item}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Excludes */}
        {(tour.excludes?.length > 0 || tour.notIncluded?.length > 0) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>No incluye</Text>
            {(tour.excludes || tour.notIncluded || []).map((item: string, index: number) => (
              <View key={index} style={styles.listItem}>
                <Ionicons name="close-circle" size={18} color={Colors.error} />
                <Text style={styles.listItemText}>{item}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Languages */}
        {tour.languages?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Idiomas</Text>
            <View style={styles.tagsRow}>
              {tour.languages.map((lang: string, index: number) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{lang.toUpperCase()}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Actions */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + Spacing.sm }]}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.secondaryButton]} 
          onPress={handleTogglePublish}
        >
          <Ionicons 
            name={tour.status === 'PUBLISHED' ? 'eye-off-outline' : 'eye-outline'} 
            size={20} 
            color={Colors.primary} 
          />
          <Text style={styles.secondaryButtonText}>
            {tour.status === 'PUBLISHED' ? 'Despublicar' : 'Publicar'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.actionButton, styles.primaryButton]} onPress={handleEdit}>
          <Ionicons name="create-outline" size={20} color="#fff" />
          <Text style={styles.primaryButtonText}>Editar Tour</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  errorText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  backButton: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  heroContainer: {
    height: 280,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroEmoji: {
    fontSize: 64,
  },
  heroGradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    position: 'absolute',
    bottom: Spacing.md,
    left: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.xs,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    marginTop: -20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: Colors.background,
    paddingTop: Spacing.lg,
  },
  titleSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  location: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    marginHorizontal: Spacing.lg,
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.xs,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  bookingStats: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  bookingStat: {
    flex: 1,
    backgroundColor: Colors.card,
    padding: Spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  bookingStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
  },
  bookingStatLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: Colors.textSecondary,
  },
  meetingPoint: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: Spacing.md,
    borderRadius: 12,
    gap: Spacing.sm,
  },
  meetingPointText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  listItemText: {
    fontSize: 14,
    color: Colors.text,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  tag: {
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: 12,
    gap: Spacing.xs,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  secondaryButton: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
});

export default TourPreviewScreen;

