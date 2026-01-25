import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '../../theme';
import { Button } from '../../components';
import { useAuth } from '../../context';

/**
 * Screen shown when user is logged in but email is not verified.
 * Blocks access to the main app until email is verified.
 */
export const EmailVerificationRequiredScreen: React.FC = () => {
  const { user, signOut, refreshUser, resendVerificationEmail } = useAuth();

  const [isResending, setIsResending] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleResend = async () => {
    if (resendCooldown > 0) return;

    setIsResending(true);
    try {
      await resendVerificationEmail();
      setResendCooldown(60);
      Alert.alert(
        'Código enviado',
        `Hemos enviado un nuevo código de verificación a ${user?.email}`
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo enviar el código');
    } finally {
      setIsResending(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshUser();
      // If email is now verified, the AppNavigator will automatically
      // redirect to the main app
    } catch (error) {
      console.error('Error refreshing user:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              console.error('Error signing out:', error);
            }
          },
        },
      ]
    );
  };

  const maskedEmail = user?.email?.replace(/(.{2})(.*)(@.*)/, '$1***$3') || '';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.emoji}>📧</Text>
          <Text style={styles.title}>Verifica tu email</Text>
          <Text style={styles.subtitle}>
            Para usar Tourline necesitas verificar tu correo electrónico
          </Text>
        </View>

        {/* Email Info */}
        <View style={styles.emailCard}>
          <Text style={styles.emailLabel}>Hemos enviado un código a:</Text>
          <Text style={styles.email}>{maskedEmail}</Text>
          <Text style={styles.emailHint}>
            Revisa tu bandeja de entrada y spam
          </Text>
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>1</Text>
            <Text style={styles.instructionText}>
              Abre el correo que te enviamos
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>2</Text>
            <Text style={styles.instructionText}>
              Haz clic en el enlace o copia el código
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>3</Text>
            <Text style={styles.instructionText}>
              Vuelve aquí y presiona "Ya verifiqué"
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title={isRefreshing ? 'Verificando...' : 'Ya verifiqué mi email'}
            onPress={handleRefresh}
            loading={isRefreshing}
            fullWidth
            icon="✅"
          />

          <TouchableOpacity
            style={[styles.resendButton, resendCooldown > 0 && styles.resendButtonDisabled]}
            onPress={handleResend}
            disabled={isResending || resendCooldown > 0}
          >
            {isResending ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <Text style={styles.resendButtonText}>
                {resendCooldown > 0
                  ? `Reenviar código (${resendCooldown}s)`
                  : 'Reenviar código de verificación'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Help */}
        <View style={styles.helpContainer}>
          <Text style={styles.helpText}>
            💡 Si no recibes el correo en unos minutos, revisa tu carpeta de spam
            o intenta con otro email.
          </Text>
        </View>

        {/* Logout Option */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>
            Usar otra cuenta
          </Text>
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
  content: {
    flex: 1,
    padding: Spacing.xl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  emoji: {
    fontSize: 72,
    marginBottom: Spacing.md,
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
  },
  emailCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emailLabel: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  email: {
    ...Typography.h3,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  emailHint: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },
  instructions: {
    backgroundColor: Colors.primaryMuted,
    borderRadius: 12,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    color: Colors.textInverse,
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 14,
    fontWeight: '700',
    marginRight: Spacing.md,
  },
  instructionText: {
    ...Typography.body,
    color: Colors.text,
    flex: 1,
  },
  actions: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  resendButton: {
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  resendButtonDisabled: {
    borderColor: Colors.disabled,
  },
  resendButtonText: {
    ...Typography.label,
    color: Colors.primary,
  },
  helpContainer: {
    backgroundColor: Colors.infoLight,
    padding: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.lg,
  },
  helpText: {
    ...Typography.bodySmall,
    color: Colors.info,
    textAlign: 'center',
    lineHeight: 20,
  },
  logoutButton: {
    alignItems: 'center',
    padding: Spacing.md,
  },
  logoutButtonText: {
    ...Typography.label,
    color: Colors.textSecondary,
  },
});
