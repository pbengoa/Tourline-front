import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors, Spacing, Typography } from '../../theme';
import type { AuthStackParamList } from '../../types';

type Props = NativeStackScreenProps<AuthStackParamList, 'AccountTypeSelect'>;

interface AccountTypeOption {
  id: 'tourist' | 'individual' | 'company';
  icon: string;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
}

const ACCOUNT_TYPES: AccountTypeOption[] = [
  {
    id: 'tourist',
    icon: '🎒',
    title: 'Turista',
    subtitle: 'Quiero explorar y reservar tours',
    description: 'Descubre experiencias únicas y reserva con facilidad.',
    features: [
      'Busca y reserva tours',
      'Guarda tus favoritos',
      'Chatea con proveedores',
      'Deja reseñas',
    ],
  },
  {
    id: 'individual',
    icon: '👤',
    title: 'Guía Independiente',
    subtitle: 'Ofrezco tours por mi cuenta',
    description: 'Comparte tu pasión y conocimiento con viajeros.',
    features: [
      'Crea y gestiona tus tours',
      'Recibe reservas directas',
      'Define tus precios',
      'Requiere verificación',
    ],
  },
  {
    id: 'company',
    icon: '🏢',
    title: 'Empresa de Tours',
    subtitle: 'Tenemos un equipo y operamos tours',
    description: 'Gestiona tu negocio y equipo de guías.',
    features: [
      'Dashboard de administración',
      'Gestiona múltiples guías',
      'Tours ilimitados',
      'Requiere verificación',
    ],
  },
];

export const AccountTypeSelectScreen: React.FC<Props> = ({ navigation }) => {
  const handleSelectType = (type: AccountTypeOption['id']) => {
    if (type === 'tourist') {
      navigation.navigate('Register');
    } else {
      navigation.navigate('ProviderRegister', { type });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>¿Cómo usarás Tourline?</Text>
          <Text style={styles.subtitle}>
            Selecciona el tipo de cuenta que mejor se ajuste a ti
          </Text>
        </View>

        {/* Account Type Options */}
        <View style={styles.optionsContainer}>
          {ACCOUNT_TYPES.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.optionCard}
              onPress={() => handleSelectType(option.id)}
              activeOpacity={0.7}
            >
              <View style={styles.optionHeader}>
                <Text style={styles.optionIcon}>{option.icon}</Text>
                <View style={styles.optionTitleContainer}>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
                </View>
                <Text style={styles.arrow}>→</Text>
              </View>

              <Text style={styles.optionDescription}>{option.description}</Text>

              <View style={styles.featuresContainer}>
                {option.features.map((feature, index) => (
                  <View key={index} style={styles.featureRow}>
                    <Text style={styles.featureCheck}>✓</Text>
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>

              {option.id !== 'tourist' && (
                <View style={styles.verificationBadge}>
                  <Text style={styles.verificationIcon}>🔒</Text>
                  <Text style={styles.verificationText}>
                    Verificación manual por Tourline
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Info Note */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoIcon}>💡</Text>
          <Text style={styles.infoText}>
            Los proveedores (guías y empresas) pasan por un proceso de
            verificación para garantizar la seguridad de nuestra comunidad.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>¿Ya tienes cuenta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.footerLink}>Inicia sesión</Text>
          </TouchableOpacity>
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
  scrollContent: {
    flexGrow: 1,
    padding: Spacing.lg,
  },
  header: {
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  backIcon: {
    fontSize: 20,
    color: Colors.text,
  },
  title: {
    ...Typography.h1,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.bodyLarge,
    color: Colors.textSecondary,
  },
  optionsContainer: {
    gap: Spacing.md,
  },
  optionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  optionIcon: {
    fontSize: 32,
    marginRight: Spacing.md,
  },
  optionTitleContainer: {
    flex: 1,
  },
  optionTitle: {
    ...Typography.h3,
    color: Colors.text,
  },
  optionSubtitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  arrow: {
    fontSize: 20,
    color: Colors.primary,
    fontWeight: '600',
  },
  optionDescription: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  featuresContainer: {
    gap: Spacing.xs,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureCheck: {
    fontSize: 14,
    color: Colors.success,
    marginRight: Spacing.sm,
    fontWeight: '700',
  },
  featureText: {
    ...Typography.bodySmall,
    color: Colors.text,
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 8,
    marginTop: Spacing.md,
    alignSelf: 'flex-start',
  },
  verificationIcon: {
    fontSize: 12,
    marginRight: Spacing.xs,
  },
  verificationText: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '500',
  },
  infoContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.infoLight,
    padding: Spacing.md,
    borderRadius: 12,
    marginTop: Spacing.xl,
  },
  infoIcon: {
    fontSize: 18,
    marginRight: Spacing.sm,
  },
  infoText: {
    flex: 1,
    ...Typography.bodySmall,
    color: Colors.info,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  footerText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  footerLink: {
    ...Typography.labelLarge,
    color: Colors.primary,
  },
});
