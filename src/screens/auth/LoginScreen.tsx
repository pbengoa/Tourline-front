import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '../../theme';
import { Button } from '../../components';
import { useAuth } from '../../context';
import type { AuthStackScreenProps } from '../../types';

const { width } = Dimensions.get('window');

type Props = AuthStackScreenProps<'Login'>;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'El correo es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Ingresa un correo válido';
    }

    if (!password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await signIn(email, password);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al iniciar sesión';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Decorative background */}
      <View style={styles.backgroundDecor}>
        <View style={styles.mountainShape1} />
        <View style={styles.mountainShape2} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoIcon}>⛰️</Text>
            </View>
            <Text style={styles.title}>¡Bienvenido!</Text>
            <Text style={styles.subtitle}>Tu próxima aventura te espera</Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Correo electrónico</Text>
              <View style={[styles.inputContainer, errors.email && styles.inputError]}>
                <Text style={styles.inputIcon}>📧</Text>
                <TextInput
                  style={styles.input}
                  placeholder="tu@email.com"
                  placeholderTextColor={Colors.textTertiary}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contraseña</Text>
              <View style={[styles.inputContainer, errors.password && styles.inputError]}>
                <Text style={styles.inputIcon}>🔐</Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={Colors.textTertiary}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password) setErrors({ ...errors, password: undefined });
                  }}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  style={styles.eyeButton}
                >
                  <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            {/* Forgot Password */}
            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <Button
              title="Iniciar Aventura"
              onPress={handleLogin}
              loading={loading}
              fullWidth
              size="large"
              icon="🚀"
              style={styles.loginButton}
            />

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>o continúa con</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Login */}
            <View style={styles.socialButtons}>
              <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
                <Text style={styles.socialIcon}>🍎</Text>
                <Text style={styles.socialText}>Apple</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
                <Text style={styles.socialIcon}>G</Text>
                <Text style={styles.socialText}>Google</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Test Credentials */}
          <View style={styles.testCredentials}>
            <Text style={styles.testCredentialsTitle}>🧪 Credenciales de prueba:</Text>
            <Text style={styles.testCredentialsText}>user@tourline.com / user123456</Text>
            <View style={styles.testDivider} />
            <Text style={styles.testCredentialsTitle}>👔 Modo Admin:</Text>
            <Text style={styles.testCredentialsText}>admin@tourline.com / admin123456</Text>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>¿Nuevo explorador? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.footerLink}>Únete ahora</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  backgroundDecor: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    overflow: 'hidden',
  },
  mountainShape1: {
    position: 'absolute',
    top: -100,
    left: -50,
    width: width * 0.8,
    height: 200,
    backgroundColor: Colors.primaryMuted,
    borderBottomRightRadius: 200,
    transform: [{ rotate: '-15deg' }],
  },
  mountainShape2: {
    position: 'absolute',
    top: -80,
    right: -100,
    width: width * 0.7,
    height: 180,
    backgroundColor: Colors.secondaryMuted,
    borderBottomLeftRadius: 180,
    transform: [{ rotate: '10deg' }],
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginTop: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  logoContainer: {
    width: 90,
    height: 90,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logoIcon: {
    fontSize: 44,
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
  formCard: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: Spacing.lg,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    ...Typography.label,
    color: Colors.text,
    marginBottom: Spacing.sm,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
  },
  inputError: {
    borderColor: Colors.error,
    backgroundColor: Colors.errorLight,
  },
  inputIcon: {
    fontSize: 18,
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    ...Typography.body,
    color: Colors.text,
    paddingVertical: Spacing.md,
  },
  eyeButton: {
    padding: 4,
  },
  eyeIcon: {
    fontSize: 18,
  },
  errorText: {
    ...Typography.bodySmall,
    color: Colors.error,
    marginTop: 6,
    marginLeft: 4,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.lg,
  },
  forgotPasswordText: {
    ...Typography.label,
    color: Colors.primary,
  },
  loginButton: {
    marginBottom: Spacing.lg,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    ...Typography.bodySmall,
    color: Colors.textTertiary,
    marginHorizontal: Spacing.md,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  socialIcon: {
    fontSize: 20,
  },
  socialText: {
    ...Typography.labelLarge,
    color: Colors.text,
  },
  testCredentials: {
    marginTop: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: Colors.primaryMuted,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  testCredentialsTitle: {
    ...Typography.labelSmall,
    color: Colors.primary,
    marginBottom: 4,
    fontWeight: '600',
  },
  testCredentialsText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  testDivider: {
    width: '60%',
    height: 1,
    backgroundColor: Colors.primary + '30',
    marginVertical: Spacing.sm,
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
    color: Colors.secondary,
  },
});
