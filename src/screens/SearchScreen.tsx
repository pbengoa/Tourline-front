import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Colors, Spacing, Typography } from '../theme';
import type { MainTabScreenProps } from '../types';

type Props = MainTabScreenProps<'Search'>;

// Mock data for tours
const MOCK_TOURS = [
  { id: '1', title: 'Tour por la ciudad', location: 'Madrid', price: 49 },
  { id: '2', title: 'Ruta gastronómica', location: 'Barcelona', price: 65 },
  { id: '3', title: 'Tour histórico', location: 'Sevilla', price: 35 },
  { id: '4', title: 'Aventura en la montaña', location: 'Granada', price: 89 },
  { id: '5', title: 'Paseo en barco', location: 'Valencia', price: 55 },
];

export const SearchScreen: React.FC<Props> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTours = MOCK_TOURS.filter(
    (tour) =>
      tour.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tour.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderTourItem = ({ item }: { item: (typeof MOCK_TOURS)[0] }) => (
    <TouchableOpacity
      style={styles.tourCard}
      onPress={() => navigation.navigate('Details', { id: item.id, title: item.title })}
      activeOpacity={0.7}
    >
      <View style={styles.tourInfo}>
        <Text style={styles.tourTitle}>{item.title}</Text>
        <Text style={styles.tourLocation}>📍 {item.location}</Text>
      </View>
      <View style={styles.tourPriceContainer}>
        <Text style={styles.tourPrice}>{item.price}€</Text>
        <Text style={styles.tourPriceLabel}>por persona</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Buscar Tours</Text>
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre o ciudad..."
            placeholderTextColor={Colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <FlatList
        data={filteredTours}
        renderItem={renderTourItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No se encontraron tours</Text>
          </View>
        }
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
    padding: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  title: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...Typography.body,
    color: Colors.text,
    paddingVertical: Spacing.md,
  },
  listContent: {
    padding: Spacing.lg,
    paddingTop: 0,
    gap: Spacing.md,
  },
  tourCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  tourInfo: {
    flex: 1,
  },
  tourTitle: {
    ...Typography.labelLarge,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  tourLocation: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  tourPriceContainer: {
    alignItems: 'flex-end',
  },
  tourPrice: {
    ...Typography.h4,
    color: Colors.primary,
  },
  tourPriceLabel: {
    ...Typography.labelSmall,
    color: Colors.textTertiary,
  },
  emptyContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
});

