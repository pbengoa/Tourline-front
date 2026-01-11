import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Colors, Spacing, Typography } from '../theme';
import { TourCard } from '../components';
import { MOCK_GUIDES, MOCK_TOURS } from '../constants/mockData';
import type { RootStackScreenProps } from '../types';

type Props = RootStackScreenProps<'GuideDetail'>;

export const GuideDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { guideId } = route.params;
  const guide = MOCK_GUIDES.find((g) => g.id === guideId);
  const guideTours = MOCK_TOURS.filter((tour) => tour.guideId === guideId);

  if (!guide) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Guía no encontrado</Text>
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

  const handleTourPress = (tourId: string, title: string) => {
    navigation.navigate('Details', { id: tourId, title });
  };

  const handleContactPress = () => {
    // TODO: Implement contact functionality
  };

  const handleBookPress = () => {
    // TODO: Implement booking functionality
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(guide.name)}</Text>
            </View>
            {guide.verified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedIcon}>✓</Text>
              </View>
            )}
          </View>

          <Text style={styles.name}>{guide.name}</Text>
          <Text style={styles.location}>📍 {guide.location}</Text>

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
                <TourCard
                  tour={item}
                  onPress={() => handleTourPress(item.id, item.title)}
                />
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
            <Text style={styles.sectionTitle}>Reseñas</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Ver todas</Text>
            </TouchableOpacity>
          </View>

          {/* Mock reviews */}
          <View style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <View style={styles.reviewerAvatar}>
                <Text style={styles.reviewerInitials}>JM</Text>
              </View>
              <View style={styles.reviewerInfo}>
                <Text style={styles.reviewerName}>Juan M.</Text>
                <Text style={styles.reviewDate}>Hace 2 semanas</Text>
              </View>
              <View style={styles.reviewRating}>
                <Text style={styles.reviewStars}>⭐⭐⭐⭐⭐</Text>
              </View>
            </View>
            <Text style={styles.reviewText}>
              Excelente guía, muy conocedor de la historia local. El tour superó mis expectativas.
              ¡Totalmente recomendado!
            </Text>
          </View>

          <View style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <View style={styles.reviewerAvatar}>
                <Text style={styles.reviewerInitials}>AL</Text>
              </View>
              <View style={styles.reviewerInfo}>
                <Text style={styles.reviewerName}>Ana L.</Text>
                <Text style={styles.reviewDate}>Hace 1 mes</Text>
              </View>
              <View style={styles.reviewRating}>
                <Text style={styles.reviewStars}>⭐⭐⭐⭐⭐</Text>
              </View>
            </View>
            <Text style={styles.reviewText}>
              Una experiencia inolvidable. {guide.name.split(' ')[0]} nos llevó a lugares que
              nunca habríamos descubierto por nuestra cuenta.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>{guide.pricePerHour}€</Text>
          <Text style={styles.priceLabel}>por hora</Text>
        </View>
        <View style={styles.ctaButtons}>
          <TouchableOpacity style={styles.contactButton} onPress={handleContactPress}>
            <Text style={styles.contactButtonText}>💬</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.bookButton, !guide.available && styles.bookButtonDisabled]}
            onPress={handleBookPress}
            disabled={!guide.available}
          >
            <Text style={styles.bookButtonText}>
              {guide.available ? 'Reservar' : 'No disponible'}
            </Text>
          </TouchableOpacity>
        </View>
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
  header: {
    alignItems: 'center',
    padding: Spacing.lg,
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
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
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
    alignItems: 'center',
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
  reviewCard: {
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
  reviewText: {
    ...Typography.body,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
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
});

