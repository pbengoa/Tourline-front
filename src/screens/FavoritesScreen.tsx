import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Spacing, Typography } from '../theme';
import { useFavoritesContext } from '../contexts/FavoritesContext';
import { FavoriteTour } from '../hooks/useFavorites';
import { FavoriteButton } from '../components/FavoriteButton';
import type { RootStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const FavoritesScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { favorites, isLoading, refreshFavorites, favoritesCount } = useFavoritesContext();

  const formatPrice = (price: number, currency: string) => {
    if (currency === 'CLP') {
      return `$${price.toLocaleString('es-CL')}`;
    }
    return `${price}€`;
  };

  const handleTourPress = useCallback((tour: FavoriteTour) => {
    navigation.navigate('Details', { id: tour.id });
  }, [navigation]);

  const renderFavoriteItem = ({ item }: { item: FavoriteTour }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.95}
      onPress={() => handleTourPress(item)}
    >
      <View style={styles.cardImageContainer}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.cardImage} />
        ) : (
          <LinearGradient
            colors={[Colors.primaryLight, Colors.primary]}
            style={styles.cardImagePlaceholder}
          >
            <Text style={styles.placeholderIcon}>🏔️</Text>
          </LinearGradient>
        )}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.6)']}
          style={styles.cardGradient}
        />
        <View style={styles.cardFavoriteBtn}>
          <FavoriteButton tour={item} size="small" variant="filled" />
        </View>
        <View style={styles.cardPriceTag}>
          <Text style={styles.cardPrice}>{formatPrice(item.price, item.currency)}</Text>
        </View>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
        <View style={styles.cardMeta}>
          <View style={styles.cardLocation}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.locationText} numberOfLines={1}>{item.location}</Text>
          </View>
          <View style={styles.cardRating}>
            <Text style={styles.ratingIcon}>★</Text>
            <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
            <Text style={styles.reviewCount}>({item.reviewCount})</Text>
          </View>
        </View>
        <View style={styles.cardFooter}>
          <View style={styles.durationBadge}>
            <Text style={styles.durationIcon}>⏱️</Text>
            <Text style={styles.durationText}>{item.duration}</Text>
          </View>
          {item.companyName && (
            <Text style={styles.companyText} numberOfLines={1}>
              por {item.companyName}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Text style={styles.emptyIcon}>💚</Text>
      </View>
      <Text style={styles.emptyTitle}>Sin favoritos aún</Text>
      <Text style={styles.emptySubtitle}>
        Explora tours increíbles y guarda tus favoritos para encontrarlos fácilmente después
      </Text>
      <TouchableOpacity
        style={styles.exploreButton}
        onPress={() => navigation.navigate('MainTabs')}
      >
        <Text style={styles.exploreButtonText}>Explorar tours</Text>
        <Text style={styles.exploreButtonArrow}>→</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Mis Favoritos</Text>
          {favoritesCount > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{favoritesCount}</Text>
            </View>
          )}
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <FlatList
        data={favorites}
        renderItem={renderFavoriteItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          favorites.length === 0 && styles.emptyListContent,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refreshFavorites}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
        ListEmptyComponent={renderEmptyState}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  backBtnText: {
    fontSize: 20,
    color: Colors.text,
    fontWeight: '600',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerTitle: {
    ...Typography.h3,
    color: Colors.text,
  },
  countBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 12,
  },
  countText: {
    ...Typography.labelSmall,
    color: Colors.textInverse,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 40,
  },
  listContent: {
    padding: Spacing.lg,
  },
  emptyListContent: {
    flex: 1,
  },
  separator: {
    height: Spacing.md,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  cardImageContainer: {
    height: 180,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 48,
  },
  cardGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  cardFavoriteBtn: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
  },
  cardPriceTag: {
    position: 'absolute',
    bottom: Spacing.sm,
    left: Spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 12,
  },
  cardPrice: {
    ...Typography.h4,
    color: Colors.primary,
    fontWeight: '800',
  },
  cardContent: {
    padding: Spacing.md,
  },
  cardTitle: {
    ...Typography.h4,
    color: Colors.text,
    marginBottom: Spacing.xs,
    lineHeight: 24,
  },
  cardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  cardLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  locationText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    flex: 1,
  },
  cardRating: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warningLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingIcon: {
    fontSize: 12,
    color: Colors.warning,
    marginRight: 2,
  },
  ratingText: {
    ...Typography.labelSmall,
    color: Colors.text,
    fontWeight: '700',
  },
  reviewCount: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginLeft: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  durationIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  durationText: {
    ...Typography.labelSmall,
    color: Colors.primary,
    fontWeight: '600',
  },
  companyText: {
    ...Typography.caption,
    color: Colors.textTertiary,
    flex: 1,
    textAlign: 'right',
  },
  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 16,
    gap: Spacing.sm,
  },
  exploreButtonText: {
    ...Typography.label,
    color: Colors.textInverse,
    fontWeight: '700',
  },
  exploreButtonArrow: {
    fontSize: 18,
    color: Colors.textInverse,
    fontWeight: '700',
  },
});

export default FavoritesScreen;

