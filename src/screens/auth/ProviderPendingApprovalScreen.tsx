import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors, Spacing, Typography } from '../../theme';
import { Button } from '../../components';
import type { AuthStackParamList } from '../../types';

type Props = NativeStackScreenProps<AuthStackParamList, 'ProviderPendingApproval'>;

export const ProviderPendingApprovalScreen: React.FC<Props> = ({ route, navigation }) => {
  const { providerType, email } = route.params;
  const isCompany = providerType === 'company';

  const handleGoToLogin = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const handleContactSupport = () => {
    Linking.openURL('mailto:soporte@tourline.com?subject=Consulta sobre verificación');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.mainIcon}>🎉</Text>
          <View style={styles.checkBadge}>
            <Text style={styles.checkIcon}>✓</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>¡Registro completado!</Text>
        <Text style={styles.subtitle}>
          Tu cuenta de {isCompany ? 'empresa' : 'guía independiente'} está en proceso de verificación
        </Text>

        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusIcon}>⏳</Text>
            <Text style={styles.statusTitle}>Pendiente de revisión</Text>
          </View>
          <Text style={styles.statusDescription}>
            Nuestro equipo revisará tu solicitud y te notificaremos por correo a{' '}
            <Text style={styles.emailHighlight}>{email}</Text>
          </Text>
          <View style={styles.timeEstimate}>
            <Text style={styles.timeIcon}>⏱️</Text>
            <Text style={styles.timeText}>
              Tiempo estimado: {isCompany ? '3-5 días hábiles' : '24-48 horas'}
            </Text>
          </View>
        </View>

        {/* Next Steps */}
        <View style={styles.stepsContainer}>
          <Text style={styles.stepsTitle}>Próximos pasos</Text>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Verificación de email</Text>
              <Text style={styles.stepDescription}>
                Revisa tu bandeja de entrada y confirma tu correo electrónico
              </Text>
            </View>
            <Text style={styles.stepStatus}>✅</Text>
          </View>

          <View style={styles.stepDivider} />

          <View style={styles.step}>
            <View style={[styles.stepNumber, styles.stepNumberPending]}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Subir documentos</Text>
              <Text style={styles.stepDescription}>
                {isCompany
                  ? 'RUT de empresa, permisos de operación y seguro'
                  : 'Cédula de identidad y certificaciones (opcional)'}
              </Text>
            </View>
            <Text style={styles.stepStatus}>⏳</Text>
          </View>

          <View style={styles.stepDivider} />

          <View style={styles.step}>
            <View style={[styles.stepNumber, styles.stepNumberPending]}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Revisión por Tourline</Text>
              <Text style={styles.stepDescription}>
                Verificamos que todo esté en orden para garantizar la seguridad
              </Text>
            </View>
            <Text style={styles.stepStatus}>⏳</Text>
          </View>

          <View style={styles.stepDivider} />

          <View style={styles.step}>
            <View style={[styles.stepNumber, styles.stepNumberPending]}>
              <Text style={styles.stepNumberText}>4</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>¡Comienza a operar!</Text>
              <Text style={styles.stepDescription}>
                Crea tus tours y empieza a recibir reservas
              </Text>
            </View>
            <Text style={styles.stepStatus}>🚀</Text>
          </View>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>💡</Text>
          <Text style={styles.infoText}>
            Puedes iniciar sesión para subir tus documentos y completar tu perfil
            mientras esperamos la aprobación.
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Ir a iniciar sesión"
            onPress={handleGoToLogin}
            fullWidth
          />

          <TouchableOpacity style={styles.supportButton} onPress={handleContactSupport}>
            <Text style={styles.supportButtonText}>¿Tienes preguntas? Contáctanos</Text>
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
    paddingTop: Spacing.xl * 2,
  },
  iconContainer: {
    alignSelf: 'center',
    marginBottom: Spacing.lg,
    position: 'relative',
  },
  mainIcon: {
    fontSize: 80,
  },
  checkBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.background,
  },
  checkIcon: {
    color: Colors.textInverse,
    fontSize: 16,
    fontWeight: '700',
  },
  title: {
    ...Typography.h1,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  statusCard: {
    backgroundColor: Colors.warningLight,
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statusIcon: {
    fontSize: 20,
    marginRight: Spacing.sm,
  },
  statusTitle: {
    ...Typography.h3,
    color: Colors.warning,
  },
  statusDescription: {
    ...Typography.body,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  emailHighlight: {
    fontWeight: '600',
    color: Colors.primary,
  },
  timeEstimate: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.5)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  timeIcon: {
    fontSize: 14,
    marginRight: Spacing.xs,
  },
  timeText: {
    ...Typography.label,
    color: Colors.text,
  },
  stepsContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stepsTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  stepNumberPending: {
    backgroundColor: Colors.disabled,
  },
  stepNumberText: {
    ...Typography.label,
    color: Colors.textInverse,
    fontWeight: '700',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    ...Typography.labelLarge,
    color: Colors.text,
    marginBottom: 2,
  },
  stepDescription: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  stepStatus: {
    fontSize: 18,
    marginLeft: Spacing.sm,
  },
  stepDivider: {
    width: 2,
    height: 24,
    backgroundColor: Colors.border,
    marginLeft: 13,
    marginVertical: Spacing.xs,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: Colors.infoLight,
    padding: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.xl,
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
  actions: {
    gap: Spacing.md,
  },
  supportButton: {
    alignItems: 'center',
    padding: Spacing.md,
  },
  supportButtonText: {
    ...Typography.label,
    color: Colors.primary,
  },
});
