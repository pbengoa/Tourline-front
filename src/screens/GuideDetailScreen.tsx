import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  Alert,
  Share,
  Dimensions,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '../theme';
import { TourCard, Button, Avatar } from '../components';
import { guidesService, toursService, Guide as ApiGuide, ApiTour } from '../services';
import type { RootStackScreenProps, Guide, Tour } from '../types';

type Props = RootStackScreenProps<'GuideDetail'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Mock reviews data with avatars
const MOCK_REVIEWS = [
  {
    id: '1',
    userName: 'Juan Martínez',
    userAvatar: 'https://images.unsplash.com/photo-1599566150163-29194dcabd36?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    date: '2025-12-28',
    text: 'Excelente guía, muy conocedor de la historia local. El tour superó mis expectativas. ¡Totalmente recomendado!',
    tourName: 'Madrid de los Austrias',
  },
  {
    id: '2',
    userName: 'Ana López',
    userAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    date: '2025-12-15',
    text: 'Una experiencia inolvidable. Nos llevó a lugares que nunca habríamos descubierto por nuestra cuenta. Muy profesional y amable.',
    tourName: 'Museo del Prado: Obras Maestras',
  },
  {
    id: '3',
    userName: 'Carlos Ruiz',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    rating: 4,
    date: '2025-11-20',
    text: 'Muy buen tour, el guía conoce muy bien la ciudad. Solo le faltó un poco más de tiempo en algunos puntos de interés.',
    tourName: 'Madrid de los Austrias',
  },
];

// Mock gallery images with real URLs
const MOCK_GALLERY = [
  { id: '1', image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=300&h=300&fit=crop', title: 'Plaza Mayor' },
  { id: '2', image: 'https://images.unsplash.com/photo-1574182245530-967d9b3831af?w=300&h=300&fit=crop', title: 'Museo del Prado' },
  { id: '3', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop', title: 'Palacio Real' },
  { id: '4', image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=300&fit=crop', title: 'Retiro' },
  { id: '5', image: 'https://images.unsplash.com/photo-1515443961218-a51367888e4b?w=300&h=300&fit=crop', title: 'Catedral' },
  { id: '6', image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=300&h=300&fit=crop', title: 'Aventura' },
];

export const GuideDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { guideId } = route.params;
  
  // State for API data
  const [guide, setGuide] = useState<Guide | null>(null);
  const [guideTours, setGuideTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [isFavorite, setIsFavorite] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [sendingMessage, setSendingMessage] = useState(false);

  // Helper to format duration
  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) return `${hours} hora${hours > 1 ? 's' : ''}`;
    return `${hours}h ${mins}min`;
  };

  // Fetch guide data from API
  const fetchGuideData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      // Fetch guide details
      const guideResponse = await guidesService.getGuide(guideId);
      if (guideResponse.success && guideResponse.data) {
        const apiGuide: ApiGuide = guideResponse.data;
        const transformedGuide: Guide = {
          id: apiGuide.id,
          name: apiGuide.user
            ? `${apiGuide.user.firstName} ${apiGuide.user.lastName}`
            : apiGuide.name || 'Guía',
          avatar: apiGuide.user?.avatar || apiGuide.avatar,
          rating: apiGuide.rating ?? 0,
          reviewCount: apiGuide.reviewCount ?? 0,
          location: `${apiGuide.city || ''}, ${apiGuide.country || ''}`.replace(/^, |, $/g, ''),
          languages: apiGuide.languages || [],
          specialties: apiGuide.specialties || [],
          bio: apiGuide.bio || '',
          pricePerHour: apiGuide.pricePerHour ?? 0,
          currency: apiGuide.currency || 'CLP',
          verified: apiGuide.verified ?? false,
          featured: apiGuide.featured ?? false,
          available: apiGuide.available ?? true,
        };
        setGuide(transformedGuide);

        // Fetch guide's tours
        try {
          const toursResponse = await toursService.searchTours({ limit: 20 });
          if (toursResponse.success && toursResponse.data) {
            // Filter tours by this guide
            const filteredTours = toursResponse.data
              .filter((t: ApiTour) => t.guideId === guideId)
              .map((tour: ApiTour): Tour => {
                const tourGuideName = tour.guide?.user
                  ? `${tour.guide.user.firstName} ${tour.guide.user.lastName}`
                  : transformedGuide.name;
                return {
                  id: tour.id,
                  title: tour.title || 'Tour',
                  description: tour.description || '',
                  image: tour.images?.[0],
                  guideId: tour.guideId,
                  guideName: tourGuideName,
                  guideAvatar: tour.guide?.user?.avatar || transformedGuide.avatar,
                  guideRating: tour.guide?.rating ?? transformedGuide.rating,
                  location: tour.city || '',
                  duration: formatDuration(tour.duration || 0),
                  price: tour.price ?? 0,
                  currency: tour.currency || 'CLP',
                  maxParticipants: tour.maxParticipants ?? 10,
                  categories: tour.categories || [],
                  includes: tour.includes || [],
                  rating: tour.rating ?? 0,
                  reviewCount: tour.reviewCount ?? 0,
                  featured: tour.featured ?? false,
                };
              });
            setGuideTours(filteredTours);
          }
        } catch (toursErr) {
          console.log('Error fetching guide tours:', toursErr);
        }
      } else {
        setError(true);
      }
    } catch (err) {
      console.log('Error fetching guide:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [guideId]);

  useEffect(() => {
    fetchGuideData();
  }, [fetchGuideData]);

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Cargando perfil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error || !guide) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>😕</Text>
          <Text style={styles.errorTitle}>Guía no encontrado</Text>
          <Text style={styles.errorText}>El perfil que buscas no está disponible</Text>
          <Button title="Volver" onPress={() => navigation.goBack()} style={styles.errorButton} />
          <TouchableOpacity style={styles.retryButton} onPress={fetchGuideData}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRelativeDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
    if (diffDays < 365) return `Hace ${Math.floor(diffDays / 30)} meses`;
    return `Hace ${Math.floor(diffDays / 365)} años`;
  };

  const getRatingBreakdown = () => {
    // Mock rating breakdown
    return {
      5: 75,
      4: 18,
      3: 5,
      2: 2,
      1: 0,
    };
  };

  const handleTourPress = (tourId: string, title: string) => {
    navigation.navigate('Details', { id: tourId, title });
  };

  const handleFavoritePress = () => {
    setIsFavorite(!isFavorite);
    // TODO: Save to favorites
  };

  const handleSharePress = async () => {
    try {
      await Share.share({
        message: `¡Mira el perfil de ${guide.name} en Tourline! Un guía increíble en ${guide.location}. ⭐ ${guide.rating} (${guide.reviewCount} reseñas)`,
        title: `${guide.name} - Guía en Tourline`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!contactMessage.trim()) {
      Alert.alert('Error', 'Por favor escribe un mensaje');
      return;
    }

    setSendingMessage(true);
    try {
      // TODO: Implement actual message sending to create conversation
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setShowContactModal(false);
      setContactMessage('');

      // Navigate to chat with a new/existing conversation
      navigation.navigate('Chat', {
        conversationId: `conv-new-${guide.id}`,
        participantName: guide.name,
        participantId: guide.id,
      });
    } catch (error) {
      Alert.alert('Error', 'No se pudo enviar el mensaje');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleOpenChat = () => {
    // Check if there's an existing conversation (mock check)
    const existingConvId =
      guide.id === '1'
        ? 'conv-1'
        : guide.id === '2'
          ? 'conv-3'
          : guide.id === '4'
            ? 'conv-2'
            : null;

    if (existingConvId) {
      // Navigate to existing conversation
      navigation.navigate('Chat', {
        conversationId: existingConvId,
        participantName: guide.name,
        participantId: guide.id,
      });
    } else {
      // Show contact modal for new conversation
      setShowContactModal(true);
    }
  };

  const handleBookPress = () => {
    // In the new tour-centric model, navigate to tours search filtered by this guide/company
    // For now, go back to search - you can implement company tours listing later
    navigation.navigate('Main', { screen: 'Search' });
  };

  const renderStars = (rating: number) => {
    return '⭐'.repeat(Math.floor(rating)) + (rating % 1 >= 0.5 ? '½' : '');
  };

  const ratingBreakdown = getRatingBreakdown();

  const renderContactModal = () => (
    <Modal visible={showContactModal} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowContactModal(false)}>
            <Text style={styles.modalClose}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Contactar</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.modalContent}>
          {/* Guide preview */}
          <View style={styles.contactGuidePreview}>
            <Avatar
              uri={guide.avatar}
              name={guide.name}
              size="medium"
              showBadge={guide.verified}
              badgeType="verified"
            />
            <View style={styles.contactGuideInfo}>
              <Text style={styles.contactGuideName}>{guide.name}</Text>
              <Text style={styles.contactGuideLocation}>📍 {guide.location}</Text>
              <View style={styles.responseTime}>
                <Text style={styles.responseIcon}>⚡</Text>
                <Text style={styles.responseText}>Responde en menos de 1 hora</Text>
              </View>
            </View>
          </View>

          {/* Quick questions */}
          <View style={styles.quickQuestions}>
            <Text style={styles.quickQuestionsTitle}>Preguntas frecuentes</Text>
            {[
              '¿Tienes disponibilidad esta semana?',
              '¿Puedes hacer un tour privado?',
              '¿Cuál es tu política de cancelación?',
            ].map((question, index) => (
              <TouchableOpacity
                key={index}
                style={styles.quickQuestion}
                onPress={() => setContactMessage(question)}
              >
                <Text style={styles.quickQuestionText}>{question}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Message input */}
          <View style={styles.messageSection}>
            <Text style={styles.messageSectionTitle}>Tu mensaje</Text>
            <TextInput
              style={styles.messageInput}
              placeholder="Escribe tu mensaje aquí..."
              placeholderTextColor={Colors.textTertiary}
              value={contactMessage}
              onChangeText={setContactMessage}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
          </View>
        </ScrollView>

        <View style={styles.modalFooter}>
          <Button
            title="Enviar mensaje"
            onPress={handleSendMessage}
            loading={sendingMessage}
            fullWidth
          />
        </View>
      </SafeAreaView>
    </Modal>
  );

  const renderReviewsModal = () => (
    <Modal visible={showAllReviews} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowAllReviews(false)}>
            <Text style={styles.modalClose}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Reseñas</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.modalContent}>
          {/* Rating summary */}
          <View style={styles.ratingSummary}>
            <View style={styles.ratingSummaryLeft}>
              <Text style={styles.ratingBig}>{guide.rating}</Text>
              <Text style={styles.ratingStarsBig}>{renderStars(guide.rating)}</Text>
              <Text style={styles.reviewCountBig}>{guide.reviewCount} reseñas</Text>
            </View>
            <View style={styles.ratingSummaryRight}>
              {[5, 4, 3, 2, 1].map((star) => (
                <View key={star} style={styles.ratingBar}>
                  <Text style={styles.ratingBarLabel}>{star}</Text>
                  <View style={styles.ratingBarBg}>
                    <View
                      style={[
                        styles.ratingBarFill,
                        { width: `${ratingBreakdown[star as keyof typeof ratingBreakdown]}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.ratingBarPercent}>
                    {ratingBreakdown[star as keyof typeof ratingBreakdown]}%
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* All reviews */}
          {MOCK_REVIEWS.map((review) => (
            <View key={review.id} style={styles.reviewCardFull}>
              <View style={styles.reviewHeader}>
                <Avatar uri={review.userAvatar} name={review.userName} size="small" />
                <View style={styles.reviewerInfo}>
                  <Text style={styles.reviewerName}>{review.userName}</Text>
                  <Text style={styles.reviewDate}>{getRelativeDate(review.date)}</Text>
                </View>
              </View>
              <View style={styles.reviewRatingRow}>
                <Text style={styles.reviewStarsSmall}>{renderStars(review.rating)}</Text>
                <Text style={styles.reviewTourName}>• {review.tourName}</Text>
              </View>
              <Text style={styles.reviewTextFull}>{review.text}</Text>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Actions */}
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerAction} onPress={handleSharePress}>
            <Text style={styles.headerActionIcon}>📤</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerAction} onPress={handleFavoritePress}>
            <Text style={styles.headerActionIcon}>{isFavorite ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
        </View>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Avatar
              uri={guide.avatar}
              name={guide.name}
              size="xlarge"
              showBadge={guide.verified}
              badgeType="verified"
            />
            {guide.available && (
              <View style={styles.onlineBadge}>
                <View style={styles.onlineDot} />
              </View>
            )}
          </View>

          <Text style={styles.name}>{guide.name}</Text>
          <Text style={styles.location}>📍 {guide.location}</Text>

          {/* Quick info badges */}
          <View style={styles.quickInfoRow}>
            <View style={styles.quickInfoBadge}>
              <Text style={styles.quickInfoIcon}>⚡</Text>
              <Text style={styles.quickInfoText}>Responde rápido</Text>
            </View>
            <View style={styles.quickInfoBadge}>
              <Text style={styles.quickInfoIcon}>📅</Text>
              <Text style={styles.quickInfoText}>Desde 2020</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>⭐ {guide.rating}</Text>
              <Text style={styles.statLabel}>{guide.reviewCount} reseñas</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{guideTours.length}</Text>
              <Text style={styles.statLabel}>Tours</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{guide.languages.length}</Text>
              <Text style={styles.statLabel}>Idiomas</Text>
            </View>
          </View>

          {guide.featured && (
            <View style={styles.featuredBanner}>
              <Text style={styles.featuredIcon}>⭐</Text>
              <Text style={styles.featuredText}>Guía Destacado</Text>
            </View>
          )}
        </View>

        {/* Bio Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sobre mí</Text>
          <Text style={styles.bioText}>{guide.bio}</Text>
        </View>

        {/* Gallery Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Galería</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.galleryContainer}
          >
            {MOCK_GALLERY.map((item) => (
              <TouchableOpacity key={item.id} style={styles.galleryItem}>
                <Image
                  source={{ uri: item.image }}
                  style={styles.galleryImage}
                  resizeMode="cover"
                />
                <Text style={styles.galleryTitle}>{item.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Specialties */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Especialidades</Text>
          <View style={styles.tagsContainer}>
            {guide.specialties.map((specialty, index) => (
              <View key={index} style={styles.specialtyTag}>
                <Text style={styles.specialtyText}>{specialty}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Languages */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Idiomas</Text>
          <View style={styles.tagsContainer}>
            {guide.languages.map((language, index) => (
              <View key={index} style={styles.languageTag}>
                <Text style={styles.languageText}>🗣️ {language}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Tours */}
        {guideTours.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tours de {guide.name.split(' ')[0]}</Text>
            <FlatList
              horizontal
              data={guideTours}
              renderItem={({ item }) => (
                <TourCard tour={item} onPress={() => handleTourPress(item.id, item.title)} />
              )}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.toursList}
              ItemSeparatorComponent={() => <View style={styles.tourSeparator} />}
            />
          </View>
        )}

        {/* Reviews Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Reseñas</Text>
              <View style={styles.reviewSummary}>
                <Text style={styles.reviewSummaryRating}>⭐ {guide.rating}</Text>
                <Text style={styles.reviewSummaryCount}>({guide.reviewCount} reseñas)</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => setShowAllReviews(true)}>
              <Text style={styles.seeAllText}>Ver todas</Text>
            </TouchableOpacity>
          </View>

          {/* Preview reviews */}
          {MOCK_REVIEWS.slice(0, 2).map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Avatar uri={review.userAvatar} name={review.userName} size="small" />
                <View style={styles.reviewerInfo}>
                  <Text style={styles.reviewerName}>{review.userName}</Text>
                  <Text style={styles.reviewDate}>{getRelativeDate(review.date)}</Text>
                </View>
                <View style={styles.reviewRating}>
                  <Text style={styles.reviewStars}>{renderStars(review.rating)}</Text>
                </View>
              </View>
              <Text style={styles.reviewText} numberOfLines={3}>
                {review.text}
              </Text>
            </View>
          ))}
        </View>

        {/* Spacer for bottom bar */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>
            {guide.currency === 'CLP'
              ? `$${guide.pricePerHour.toLocaleString('es-CL')}`
              : `${guide.pricePerHour}€`}
          </Text>
          <Text style={styles.priceLabel}>por hora</Text>
        </View>
        <View style={styles.ctaButtons}>
          <TouchableOpacity style={styles.contactButton} onPress={handleOpenChat}>
            <Text style={styles.contactButtonText}>💬</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.bookButton}
            onPress={handleBookPress}
          >
            <Text style={styles.bookButtonText}>Ver Tours</Text>
          </TouchableOpacity>
        </View>
      </View>

      {renderContactModal()}
      {renderReviewsModal()}
    </SafeAreaView>
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
    padding: Spacing.lg,
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
    marginBottom: Spacing.xs,
  },
  errorText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  errorButton: {
    minWidth: 120,
  },
  retryButton: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  retryButtonText: {
    ...Typography.label,
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: Spacing.md,
    gap: Spacing.sm,
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 10,
  },
  headerAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerActionIcon: {
    fontSize: 18,
  },
  header: {
    alignItems: 'center',
    padding: Spacing.lg,
    paddingTop: Spacing.xl + 40, // Account for action buttons
    paddingBottom: Spacing.xl,
    backgroundColor: Colors.surface,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    ...Typography.h1,
    color: Colors.textInverse,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.surface,
  },
  verifiedIcon: {
    color: Colors.textInverse,
    fontSize: 14,
    fontWeight: '700',
  },
  onlineBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  onlineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.success,
  },
  name: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  location: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  quickInfoRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  quickInfoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 12,
  },
  quickInfoIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  quickInfoText: {
    ...Typography.labelSmall,
    color: Colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    width: '100%',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...Typography.h4,
    color: Colors.text,
  },
  statLabel: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.border,
  },
  featuredBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary + '15',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
  },
  featuredIcon: {
    fontSize: 14,
    marginRight: Spacing.xs,
  },
  featuredText: {
    ...Typography.label,
    color: Colors.secondary,
  },
  section: {
    padding: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h4,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  seeAllText: {
    ...Typography.label,
    color: Colors.primary,
  },
  bioText: {
    ...Typography.body,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  galleryContainer: {
    gap: Spacing.sm,
  },
  galleryItem: {
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  galleryImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: Colors.primaryMuted,
    marginBottom: Spacing.xs,
  },
  galleryTitle: {
    ...Typography.labelSmall,
    color: Colors.textSecondary,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  specialtyTag: {
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
  },
  specialtyText: {
    ...Typography.label,
    color: Colors.primary,
  },
  languageTag: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  languageText: {
    ...Typography.label,
    color: Colors.text,
  },
  toursList: {
    paddingRight: Spacing.lg,
  },
  tourSeparator: {
    width: Spacing.md,
  },
  reviewSummary: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewSummaryRating: {
    ...Typography.labelLarge,
    color: Colors.text,
    marginRight: Spacing.xs,
  },
  reviewSummaryCount: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  reviewCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  reviewCardFull: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  reviewerInitials: {
    ...Typography.label,
    color: Colors.primary,
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    ...Typography.labelLarge,
    color: Colors.text,
  },
  reviewDate: {
    ...Typography.bodySmall,
    color: Colors.textTertiary,
  },
  reviewRating: {
    alignItems: 'flex-end',
  },
  reviewStars: {
    fontSize: 12,
  },
  reviewRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  reviewStarsSmall: {
    fontSize: 12,
  },
  reviewTourName: {
    ...Typography.bodySmall,
    color: Colors.textTertiary,
    marginLeft: Spacing.xs,
  },
  reviewText: {
    ...Typography.body,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  reviewTextFull: {
    ...Typography.body,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  priceContainer: {},
  price: {
    ...Typography.h3,
    color: Colors.text,
  },
  priceLabel: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  ctaButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  contactButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactButtonText: {
    fontSize: 20,
  },
  bookButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 12,
  },
  bookButtonDisabled: {
    backgroundColor: Colors.disabled,
  },
  bookButtonText: {
    ...Typography.button,
    color: Colors.textInverse,
    textTransform: 'none',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalClose: {
    fontSize: 20,
    color: Colors.text,
  },
  modalTitle: {
    ...Typography.h4,
    color: Colors.text,
  },
  modalContent: {
    flex: 1,
    padding: Spacing.lg,
  },
  modalFooter: {
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  // Contact modal
  contactGuidePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  contactAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  contactAvatarText: {
    ...Typography.h4,
    color: Colors.textInverse,
  },
  contactGuideInfo: {
    flex: 1,
  },
  contactGuideName: {
    ...Typography.labelLarge,
    color: Colors.text,
  },
  contactGuideLocation: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  responseTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  responseIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  responseText: {
    ...Typography.labelSmall,
    color: Colors.success,
  },
  quickQuestions: {
    marginBottom: Spacing.lg,
  },
  quickQuestionsTitle: {
    ...Typography.labelLarge,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  quickQuestion: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickQuestionText: {
    ...Typography.body,
    color: Colors.primary,
  },
  messageSection: {},
  messageSectionTitle: {
    ...Typography.labelLarge,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  messageInput: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
    minHeight: 120,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Typography.body,
    color: Colors.text,
  },
  // Reviews modal
  ratingSummary: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  ratingSummaryLeft: {
    alignItems: 'center',
    paddingRight: Spacing.lg,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
  },
  ratingBig: {
    ...Typography.h1,
    color: Colors.text,
    fontSize: 48,
  },
  ratingStarsBig: {
    fontSize: 16,
    marginBottom: Spacing.xs,
  },
  reviewCountBig: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  ratingSummaryRight: {
    flex: 1,
    paddingLeft: Spacing.lg,
    justifyContent: 'center',
  },
  ratingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  ratingBarLabel: {
    ...Typography.labelSmall,
    color: Colors.textSecondary,
    width: 16,
  },
  ratingBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    marginHorizontal: Spacing.sm,
    overflow: 'hidden',
  },
  ratingBarFill: {
    height: '100%',
    backgroundColor: Colors.warning,
    borderRadius: 3,
  },
  ratingBarPercent: {
    ...Typography.labelSmall,
    color: Colors.textTertiary,
    width: 30,
    textAlign: 'right',
  },
});
