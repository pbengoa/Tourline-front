import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors, Spacing, Typography } from '../../theme';
import { authService } from '../../services';
import { useAuth } from '../../context';
import type { AuthStackParamList } from '../../types';

type Props = NativeStackScreenProps<AuthStackParamList, 'EmailVerification'>;

const CODE_LENGTH = 6;

export const EmailVerificationScreen: React.FC<Props> = ({ route, navigation }) => {
  const { email } = route.params;
  const { refreshUser } = useAuth();
  
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Start with 60 second cooldown
  useEffect(() => {
    setResendCooldown(60);
  }, []);

  const handleCodeChange = (text: string, index: number) => {
    setError(null);
    
    // Only allow digits
    const digit = text.replace(/[^0-9]/g, '').slice(-1);
    
    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);

    // Auto-focus next input
    if (digit && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits entered
    if (digit && index === CODE_LENGTH - 1) {
      const fullCode = newCode.join('');
      if (fullCode.length === CODE_LENGTH) {
        handleVerify(fullCode);
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
      const newCode = [...code];
      newCode[index - 1] = '';
      setCode(newCode);
    }
  };

  const handleVerify = async (verificationCode?: string) => {
    const codeToVerify = verificationCode || code.join('');
    
    if (codeToVerify.length !== CODE_LENGTH) {
      setError('Por favor ingresa el código completo');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await authService.verifyEmail({
        email,
        code: codeToVerify,
      });

      // Refresh user data to update emailVerified status
      await refreshUser?.();

      Alert.alert(
        '¡Email verificado!',
        'Tu cuenta ha sido verificada exitosamente.',
        [
          {
            text: 'Continuar',
            onPress: () => {
              // Navigate to main app
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            },
          },
        ]
      );
    } catch (err: any) {
      setError(err.message || 'Código inválido. Intenta de nuevo.');
      // Clear code on error
      setCode(Array(CODE_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;

    setIsResending(true);
    setError(null);

    try {
      await authService.resendVerification(email);
      setResendCooldown(60);
      Alert.alert(
        'Código reenviado',
        `Hemos enviado un nuevo código a ${email}`
      );
    } catch (err: any) {
      setError(err.message || 'Error al reenviar código');
    } finally {
      setIsResending(false);
    }
  };

  const handleChangeEmail = () => {
    navigation.goBack();
  };

  const maskedEmail = email.replace(/(.{2})(.*)(@.*)/, '$1***$3');

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.emoji}>📧</Text>
            <Text style={styles.title}>Verifica tu email</Text>
            <Text style={styles.subtitle}>
              Hemos enviado un código de verificación a
            </Text>
            <Text style={styles.email}>{maskedEmail}</Text>
          </View>

          {/* Code Input */}
          <View style={styles.codeContainer}>
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                style={[
                  styles.codeInput,
                  digit ? styles.codeInputFilled : null,
                  error ? styles.codeInputError : null,
                ]}
                value={digit}
                onChangeText={(text) => handleCodeChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                autoFocus={index === 0}
              />
            ))}
          </View>

          {/* Error message */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Verify Button */}
          <TouchableOpacity
            style={[styles.verifyButton, isLoading && styles.buttonDisabled]}
            onPress={() => handleVerify()}
            disabled={isLoading || code.join('').length !== CODE_LENGTH}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.textInverse} />
            ) : (
              <Text style={styles.verifyButtonText}>Verificar</Text>
            )}
          </TouchableOpacity>

          {/* Resend Section */}
          <View style={styles.resendSection}>
            <Text style={styles.resendText}>¿No recibiste el código?</Text>
            {resendCooldown > 0 ? (
              <Text style={styles.cooldownText}>
                Reenviar en {resendCooldown}s
              </Text>
            ) : (
              <TouchableOpacity onPress={handleResend} disabled={isResending}>
                {isResending ? (
                  <ActivityIndicator size="small" color={Colors.primary} />
                ) : (
                  <Text style={styles.resendLink}>Reenviar código</Text>
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Change Email */}
          <TouchableOpacity style={styles.changeEmailButton} onPress={handleChangeEmail}>
            <Text style={styles.changeEmailText}>Cambiar email</Text>
          </TouchableOpacity>
        </View>

        {/* Help Text */}
        <View style={styles.helpContainer}>
          <Text style={styles.helpText}>
            💡 Revisa tu bandeja de spam si no encuentras el correo
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
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
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  email: {
    ...Typography.labelLarge,
    color: Colors.primary,
    marginTop: Spacing.xs,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  codeInput: {
    width: 48,
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
  codeInputFilled: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryMuted,
  },
  codeInputError: {
    borderColor: Colors.error,
    backgroundColor: Colors.errorLight,
  },
  errorContainer: {
    backgroundColor: Colors.errorLight,
    padding: Spacing.sm,
    borderRadius: 8,
    marginBottom: Spacing.md,
  },
  errorText: {
    ...Typography.bodySmall,
    color: Colors.error,
    textAlign: 'center',
  },
  verifyButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  verifyButtonText: {
    ...Typography.labelLarge,
    color: Colors.textInverse,
  },
  resendSection: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  resendText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  cooldownText: {
    ...Typography.label,
    color: Colors.textTertiary,
  },
  resendLink: {
    ...Typography.label,
    color: Colors.primary,
    fontWeight: '600',
  },
  changeEmailButton: {
    alignItems: 'center',
    padding: Spacing.sm,
  },
  changeEmailText: {
    ...Typography.label,
    color: Colors.textSecondary,
  },
  helpContainer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  helpText: {
    ...Typography.bodySmall,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
});
