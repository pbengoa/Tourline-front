import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Colors, Spacing, Typography } from '../theme';
import type { RootStackScreenProps } from '../types';

type Props = RootStackScreenProps<'Details'>;

export const DetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { id, title } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Image Placeholder */}
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imagePlaceholderText}>🏞️</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{title || `Tour #${id}`}</Text>

          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>📍</Text>
              <Text style={styles.metaText}>Madrid, España</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>⏱️</Text>
              <Text style={styles.metaText}>3 horas</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>⭐</Text>
              <Text style={styles.metaText}>4.8 (128 reseñas)</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Descripción</Text>
            <Text style={styles.description}>
              Descubre los lugares más emblemáticos de la ciudad en este tour
              guiado. Visitarás monumentos históricos, plazas pintorescas y
              conocerás la cultura local de la mano de nuestros guías expertos.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Incluye</Text>
            <View style={styles.includesList}>
              {['Guía profesional', 'Entrada a monumentos', 'Seguro de viaje', 'Mapa de la ciudad'].map(
                (item, index) => (
                  <View key={index} style={styles.includeItem}>
                    <Text style={styles.includeIcon}>✓</Text>
                    <Text style={styles.includeText}>{item}</Text>
                  </View>
                )
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>49€</Text>
          <Text style={styles.priceLabel}>por persona</Text>
        </View>
        <TouchableOpacity style={styles.bookButton} activeOpacity={0.8}>
          <Text style={styles.bookButtonText}>Reservar Ahora</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  imagePlaceholder: {
    height: 250,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 64,
  },
  content: {
    padding: Spacing.lg,
  },
  title: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaIcon: {
    fontSize: 14,
    marginRight: Spacing.xs,
  },
  metaText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.h4,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  description: {
    ...Typography.body,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  includesList: {
    gap: Spacing.sm,
  },
  includeItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  includeIcon: {
    ...Typography.body,
    color: Colors.success,
    marginRight: Spacing.sm,
    fontWeight: '700',
  },
  includeText: {
    ...Typography.body,
    color: Colors.text,
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
  bookButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 12,
  },
  bookButtonText: {
    ...Typography.button,
    color: Colors.textInverse,
    textTransform: 'none',
  },
});

