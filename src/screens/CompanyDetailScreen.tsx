import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  FlatList,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Typography } from '../theme';
import { companiesService } from '../services';
import type { Company, CompanyTour, CompanyReview } from '../services/companiesService';
import type { RootStackScreenProps } from '../types';

type Props = RootStackScreenProps<'CompanyDetail'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const CompanyDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { companyId } = route.params;

  const [company, setCompany] = useState<Company | null>(null);
  const [tours, setTours] = useState<CompanyTour[]>([]);
  const [reviews, setReviews] = useState<CompanyReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState<'tours' | 'reviews' | 'about'>('tours');

  useEffect(() => {
    fetchCompanyData();
  }, [companyId]);

  const fetchCompanyData = async () => {
    setLoading(true);
    setError(false);
    try {
      // Fetch company details
      const companyResponse = await companiesService.getCompany(companyId);
      if (companyResponse.success && companyResponse.data) {
        setCompany(companyResponse.data);
      } else {
        setError(true);
        return;
      }

      // Fetch company tours
      const toursResponse = await companiesService.getCompanyTours(companyId, { limit: 20 });
      if (toursResponse.success && toursResponse.data?.tours) {
        setTours(toursResponse.data.tours);
      }

      // Fetch company reviews
      const reviewsResponse = await companiesService.getCompanyReviews(companyId, { limit: 10 });
      if (reviewsResponse.success && reviewsResponse.data?.reviews) {
        setReviews(reviewsResponse.data.reviews);
      }
    } catch (err) {
      console.error('Error fetching company:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number | undefined, currency: string | undefined) => {
    const safePrice = price || 0;
    if (currency === 'CLP') {
      return `$${safePrice.toLocaleString('es-CL')}`;
    }
    return `${safePrice}€`;
  };

  const formatDuration = (minutes: number | undefined): string => {
    const safeMinutes = minutes || 0;
    if (safeMinutes < 60) return `${safeMinutes} min`;
    const hours = Math.floor(safeMinutes / 60);
    const mins = safeMinutes % 60;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  const handleTourPress = (tourId: string) => {
    navigation.navigate('Details', { id: tourId });
  };

  const handleContactPress = (type: 'email' | 'phone' | 'website') => {
    if (!company) return;
    
    switch (type) {
      case 'email':
        if (company.email) Linking.openURL(`mailto:${company.email}`);
        break;
      case 'phone':
        if (company.phone) Linking.openURL(`tel:${company.phone}`);
        break;
      case 'website':
        if (company.website) Linking.openURL(company.website);
        break;
    }
  };

  const handleSocialPress = (url?: string) => {
    if (url) Linking.openURL(url);
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Cargando empresa...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error || !company) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>🏢</Text>
          <Text style={styles.errorTitle}>Empresa no encontrada</Text>
          <Text style={styles.errorSubtitle}>No pudimos cargar la información</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchCompanyData}>
            <Text style={styles.retryBtnText}>Reintentar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>← Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Render tour card
  const renderTourCard = ({ item }: { item: CompanyTour }) => (
    <TouchableOpacity
      style={styles.tourCard}
      onPress={() => handleTourPress(item.id)}
      activeOpacity={0.95}
    >
      <View style={styles.tourImageContainer}>
        {item.coverImage ? (
          <Image source={{ uri: item.coverImage }} style={styles.tourImage} />
        ) : (
          <LinearGradient
            colors={[Colors.primaryLight, Colors.primary]}
            style={styles.tourImagePlaceholder}
          >
            <Text style={styles.tourImageEmoji}>🏔️</Text>
          </LinearGradient>
        )}
        {item.featured && (
          <View style={styles.tourFeaturedBadge}>
            <Text style={styles.tourFeaturedText}>⭐</Text>
          </View>
        )}
      </View>
      <View style={styles.tourContent}>
        <Text style={styles.tourTitle} numberOfLines={2}>{item.title}</Text>
        <View style={styles.tourMeta}>
          <Text style={styles.tourLocation}>📍 {item.city}</Text>
          <View style={styles.tourRating}>
            <Text style={styles.tourStar}>★</Text>
            <Text style={styles.tourRatingText}>{Number(item.rating || 0).toFixed(1)}</Text>
          </View>
        </View>
        <View style={styles.tourFooter}>
          <Text style={styles.tourDuration}>⏱️ {formatDuration(item.duration)}</Text>
          <Text style={styles.tourPrice}>{formatPrice(item.price, item.currency)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Render review card
  const renderReviewCard = ({ item }: { item: CompanyReview }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewUser}>
          {item.userAvatar ? (
            <Image source={{ uri: item.userAvatar }} style={styles.reviewAvatar} />
          ) : (
            <View style={styles.reviewAvatarPlaceholder}>
              <Text style={styles.reviewAvatarInitial}>{item.userName.charAt(0)}</Text>
            </View>
          )}
          <View style={styles.reviewUserInfo}>
            <Text style={styles.reviewUserName}>{item.userName}</Text>
            <Text style={styles.reviewTour}>{item.tourTitle}</Text>
          </View>
        </View>
        <View style={styles.reviewRatingBadge}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Text key={i} style={styles.reviewStar}>
              {i < item.rating ? '★' : '☆'}
            </Text>
          ))}
        </View>
      </View>
      <Text style={styles.reviewComment} numberOfLines={4}>{item.comment}</Text>
      {item.response && (
        <View style={styles.reviewResponse}>
          <Text style={styles.reviewResponseLabel}>Respuesta de {company.name}:</Text>
          <Text style={styles.reviewResponseText}>{item.response}</Text>
        </View>
      )}
      <Text style={styles.reviewDate}>
        {new Date(item.createdAt).toLocaleDateString('es-CL', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        })}
      </Text>
    </View>
  );

  // Rating distribution component
  const RatingDistribution = () => {
    const total = company.reviewCount || 1;
    const distribution = [
      { stars: 5, count: Math.round(total * 0.7) },
      { stars: 4, count: Math.round(total * 0.15) },
      { stars: 3, count: Math.round(total * 0.08) },
      { stars: 2, count: Math.round(total * 0.04) },
      { stars: 1, count: Math.round(total * 0.03) },
    ];

    return (
      <View style={styles.ratingDistribution}>
        {distribution.map((item) => (
          <View key={item.stars} style={styles.ratingRow}>
            <Text style={styles.ratingRowStars}>{item.stars}★</Text>
            <View style={styles.ratingBarContainer}>
              <View 
                style={[
                  styles.ratingBar, 
                  { width: `${(item.count / total) * 100}%` }
                ]} 
              />
            </View>
            <Text style={styles.ratingRowCount}>{item.count}</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Header */}
        <View style={styles.heroContainer}>
          {company.coverImage ? (
            <Image source={{ uri: company.coverImage }} style={styles.heroImage} />
          ) : (
            <LinearGradient
              colors={[Colors.primaryLight, Colors.primary]}
              style={styles.heroPlaceholder}
            >
              <Text style={styles.heroEmoji}>🏔️</Text>
            </LinearGradient>
          )}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.heroGradient}
          />
          
          {/* Back button */}
          <TouchableOpacity
            style={styles.heroBackBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.heroBackBtnText}>←</Text>
          </TouchableOpacity>

          {/* Logo overlay */}
          <View style={styles.logoContainer}>
            {company.logoUrl ? (
              <Image source={{ uri: company.logoUrl }} style={styles.logo} />
            ) : (
              <View style={styles.logoPlaceholder}>
                <Text style={styles.logoInitial}>{company.name.charAt(0)}</Text>
              </View>
            )}
            {company.isVerified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedIcon}>✓</Text>
              </View>
            )}
          </View>

          {/* Company name & location */}
          <View style={styles.heroInfo}>
            <Text style={styles.heroName}>{company.name}</Text>
            <Text style={styles.heroLocation}>
              📍 {company.city}{company.country ? `, ${company.country}` : ''}
            </Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>⭐ {Number(company.rating || 0).toFixed(1)}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{company.reviewCount}</Text>
            <Text style={styles.statLabel}>Reseñas</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{company.tourCount}</Text>
            <Text style={styles.statLabel}>Tours</Text>
          </View>
          {company.yearsActive && (
            <>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statValue}>{company.yearsActive}</Text>
                <Text style={styles.statLabel}>Años</Text>
              </View>
            </>
          )}
        </View>

        {/* Certifications */}
        {company.certifications && company.certifications.length > 0 && (
          <View style={styles.certificationsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {company.certifications.map((cert, index) => (
                <View key={index} style={styles.certBadge}>
                  <Text style={styles.certIcon}>🏅</Text>
                  <Text style={styles.certText}>{cert}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'tours' && styles.tabActive]}
            onPress={() => setActiveTab('tours')}
          >
            <Text style={[styles.tabText, activeTab === 'tours' && styles.tabTextActive]}>
              🏔️ Tours ({tours.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'reviews' && styles.tabActive]}
            onPress={() => setActiveTab('reviews')}
          >
            <Text style={[styles.tabText, activeTab === 'reviews' && styles.tabTextActive]}>
              ⭐ Reseñas
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'about' && styles.tabActive]}
            onPress={() => setActiveTab('about')}
          >
            <Text style={[styles.tabText, activeTab === 'about' && styles.tabTextActive]}>
              ℹ️ Info
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === 'tours' && (
            tours.length > 0 ? (
              <FlatList
                data={tours}
                renderItem={renderTourCard}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                contentContainerStyle={styles.toursList}
              />
            ) : (
              <View style={styles.emptyTab}>
                <Text style={styles.emptyIcon}>🏔️</Text>
                <Text style={styles.emptyText}>No hay tours disponibles</Text>
              </View>
            )
          )}

          {activeTab === 'reviews' && (
            <View>
              {/* Rating Summary */}
              <View style={styles.ratingSummary}>
                <View style={styles.ratingBig}>
                  <Text style={styles.ratingBigValue}>{Number(company.rating || 0).toFixed(1)}</Text>
                  <View style={styles.ratingBigStars}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Text key={i} style={styles.ratingBigStar}>
                        {i < Math.round(Number(company.rating || 0)) ? '★' : '☆'}
                      </Text>
                    ))}
                  </View>
                  <Text style={styles.ratingBigCount}>{company.reviewCount} reseñas</Text>
                </View>
                <RatingDistribution />
              </View>

              {/* Reviews List */}
              {reviews.length > 0 ? (
                <FlatList
                  data={reviews}
                  renderItem={renderReviewCard}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                  contentContainerStyle={styles.reviewsList}
                />
              ) : (
                <View style={styles.emptyTab}>
                  <Text style={styles.emptyIcon}>💬</Text>
                  <Text style={styles.emptyText}>Aún no hay reseñas</Text>
                </View>
              )}
            </View>
          )}

          {activeTab === 'about' && (
            <View style={styles.aboutContainer}>
              {/* Description */}
              {company.description && (
                <View style={styles.aboutSection}>
                  <Text style={styles.aboutSectionTitle}>Sobre nosotros</Text>
                  <Text style={styles.aboutDescription}>{company.description}</Text>
                </View>
              )}

              {/* Contact */}
              <View style={styles.aboutSection}>
                <Text style={styles.aboutSectionTitle}>Contacto</Text>
                <View style={styles.contactList}>
                  {company.email && (
                    <TouchableOpacity
                      style={styles.contactItem}
                      onPress={() => handleContactPress('email')}
                    >
                      <Text style={styles.contactIcon}>✉️</Text>
                      <Text style={styles.contactText}>{company.email}</Text>
                    </TouchableOpacity>
                  )}
                  {company.phone && (
                    <TouchableOpacity
                      style={styles.contactItem}
                      onPress={() => handleContactPress('phone')}
                    >
                      <Text style={styles.contactIcon}>📞</Text>
                      <Text style={styles.contactText}>{company.phone}</Text>
                    </TouchableOpacity>
                  )}
                  {company.website && (
                    <TouchableOpacity
                      style={styles.contactItem}
                      onPress={() => handleContactPress('website')}
                    >
                      <Text style={styles.contactIcon}>🌐</Text>
                      <Text style={styles.contactText}>{company.website}</Text>
                    </TouchableOpacity>
                  )}
                  {company.address && (
                    <View style={styles.contactItem}>
                      <Text style={styles.contactIcon}>📍</Text>
                      <Text style={styles.contactText}>{company.address}</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Social Links */}
              {company.socialLinks && Object.keys(company.socialLinks).length > 0 && (
                <View style={styles.aboutSection}>
                  <Text style={styles.aboutSectionTitle}>Redes sociales</Text>
                  <View style={styles.socialLinks}>
                    {company.socialLinks.instagram && (
                      <TouchableOpacity
                        style={styles.socialBtn}
                        onPress={() => handleSocialPress(company.socialLinks?.instagram)}
                      >
                        <Text style={styles.socialBtnText}>📸 Instagram</Text>
                      </TouchableOpacity>
                    )}
                    {company.socialLinks.facebook && (
                      <TouchableOpacity
                        style={styles.socialBtn}
                        onPress={() => handleSocialPress(company.socialLinks?.facebook)}
                      >
                        <Text style={styles.socialBtnText}>👤 Facebook</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}

              {/* Operating Hours */}
              {company.operatingHours && Object.keys(company.operatingHours).length > 0 && (
                <View style={styles.aboutSection}>
                  <Text style={styles.aboutSectionTitle}>Horarios</Text>
                  <View style={styles.hoursList}>
                    {Object.entries(company.operatingHours).map(([day, hours]) => (
                      <View key={day} style={styles.hoursRow}>
                        <Text style={styles.hoursDay}>{day}</Text>
                        <Text style={styles.hoursTime}>{hours}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
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
    padding: Spacing.xl,
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
  errorSubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  retryBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.sm,
  },
  retryBtnText: {
    ...Typography.label,
    color: Colors.textInverse,
    fontWeight: '600',
  },
  backBtn: {
    paddingVertical: Spacing.sm,
  },
  backBtnText: {
    ...Typography.body,
    color: Colors.primary,
  },

  // Hero
  heroContainer: {
    height: 280,
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
    fontSize: 64,
    opacity: 0.3,
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 180,
  },
  heroBackBtn: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroBackBtnText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '600',
  },
  logoContainer: {
    position: 'absolute',
    bottom: 60,
    left: Spacing.lg,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    borderWidth: 4,
    borderColor: Colors.card,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    borderWidth: 4,
    borderColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoInitial: {
    ...Typography.h1,
    color: Colors.textInverse,
    fontWeight: '700',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.card,
  },
  verifiedIcon: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '700',
  },
  heroInfo: {
    position: 'absolute',
    bottom: Spacing.md,
    left: Spacing.lg,
    right: Spacing.lg,
  },
  heroName: {
    ...Typography.h2,
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  heroLocation: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: Colors.card,
    marginHorizontal: Spacing.lg,
    marginTop: -20,
    borderRadius: 16,
    padding: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    ...Typography.h4,
    color: Colors.text,
    fontWeight: '700',
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.borderLight,
  },

  // Certifications
  certificationsContainer: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  certBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.successLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 20,
    marginRight: Spacing.sm,
  },
  certIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  certText: {
    ...Typography.labelSmall,
    color: Colors.success,
    fontWeight: '600',
  },

  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    marginTop: Spacing.lg,
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    ...Typography.labelSmall,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  tabTextActive: {
    color: Colors.textInverse,
  },

  // Tab Content
  tabContent: {
    padding: Spacing.lg,
  },
  emptyTab: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },

  // Tours
  toursList: {
    gap: Spacing.md,
  },
  tourCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  tourImageContainer: {
    width: 120,
    height: 120,
    position: 'relative',
  },
  tourImage: {
    width: '100%',
    height: '100%',
  },
  tourImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tourImageEmoji: {
    fontSize: 32,
  },
  tourFeaturedBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: Colors.secondary,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tourFeaturedText: {
    fontSize: 12,
  },
  tourContent: {
    flex: 1,
    padding: Spacing.sm,
    justifyContent: 'space-between',
  },
  tourTitle: {
    ...Typography.label,
    color: Colors.text,
    fontWeight: '600',
    lineHeight: 18,
  },
  tourMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tourLocation: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  tourRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tourStar: {
    fontSize: 12,
    color: Colors.warning,
    marginRight: 2,
  },
  tourRatingText: {
    ...Typography.caption,
    color: Colors.text,
    fontWeight: '600',
  },
  tourFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tourDuration: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },
  tourPrice: {
    ...Typography.label,
    color: Colors.primary,
    fontWeight: '700',
  },

  // Reviews
  ratingSummary: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  ratingBig: {
    alignItems: 'center',
    marginRight: Spacing.lg,
  },
  ratingBigValue: {
    ...Typography.h1,
    color: Colors.text,
    fontWeight: '700',
  },
  ratingBigStars: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  ratingBigStar: {
    fontSize: 16,
    color: Colors.warning,
  },
  ratingBigCount: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  ratingDistribution: {
    flex: 1,
    justifyContent: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  ratingRowStars: {
    ...Typography.caption,
    color: Colors.textSecondary,
    width: 24,
  },
  ratingBarContainer: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.borderLight,
    borderRadius: 3,
    marginHorizontal: Spacing.xs,
  },
  ratingBar: {
    height: '100%',
    backgroundColor: Colors.warning,
    borderRadius: 3,
  },
  ratingRowCount: {
    ...Typography.caption,
    color: Colors.textTertiary,
    width: 24,
    textAlign: 'right',
  },
  reviewsList: {
    gap: Spacing.md,
  },
  reviewCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: Spacing.md,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  reviewUser: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  reviewAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewAvatarInitial: {
    ...Typography.label,
    color: Colors.textInverse,
    fontWeight: '700',
  },
  reviewUserInfo: {
    marginLeft: Spacing.sm,
    flex: 1,
  },
  reviewUserName: {
    ...Typography.label,
    color: Colors.text,
    fontWeight: '600',
  },
  reviewTour: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  reviewRatingBadge: {
    flexDirection: 'row',
  },
  reviewStar: {
    fontSize: 14,
    color: Colors.warning,
  },
  reviewComment: {
    ...Typography.body,
    color: Colors.text,
    lineHeight: 22,
  },
  reviewResponse: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.primaryMuted,
    padding: Spacing.sm,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  reviewResponseLabel: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  reviewResponseText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  reviewDate: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginTop: Spacing.sm,
  },

  // About
  aboutContainer: {
    gap: Spacing.lg,
  },
  aboutSection: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: Spacing.md,
  },
  aboutSectionTitle: {
    ...Typography.label,
    color: Colors.text,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  aboutDescription: {
    ...Typography.body,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  contactList: {
    gap: Spacing.sm,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactIcon: {
    fontSize: 18,
    marginRight: Spacing.sm,
  },
  contactText: {
    ...Typography.body,
    color: Colors.primary,
  },
  socialLinks: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  socialBtn: {
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 10,
  },
  socialBtnText: {
    ...Typography.labelSmall,
    color: Colors.primary,
    fontWeight: '600',
  },
  hoursList: {
    gap: Spacing.xs,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  hoursDay: {
    ...Typography.body,
    color: Colors.text,
    textTransform: 'capitalize',
  },
  hoursTime: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
});

export default CompanyDetailScreen;

