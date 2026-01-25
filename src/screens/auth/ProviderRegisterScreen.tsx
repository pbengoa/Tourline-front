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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors, Spacing, Typography } from '../../theme';
import { Button } from '../../components';
import { providerService } from '../../services';
import { parseError } from '../../utils/errorMessages';
import type { AuthStackParamList } from '../../types';
import type { IndividualProviderRegistration, CompanyProviderRegistration } from '../../types/provider';

type Props = NativeStackScreenProps<AuthStackParamList, 'ProviderRegister'>;

interface FormErrors {
  // Common
  email?: string;
  password?: string;
  confirmPassword?: string;
  phone?: string;
  city?: string;
  // Individual
  firstName?: string;
  lastName?: string;
  // Company
  companyName?: string;
  taxId?: string;
  address?: string;
}

export const ProviderRegisterScreen: React.FC<Props> = ({ route, navigation }) => {
  const { type } = route.params;
  const isCompany = type === 'company';

  // Common fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [description, setDescription] = useState('');

  // Individual fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // Company fields
  const [companyName, setCompanyName] = useState('');
  const [legalName, setLegalName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [address, setAddress] = useState('');
  const [website, setWebsite] = useState('');

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Common validations
    if (!email.trim()) {
      newErrors.email = 'El correo es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Ingresa un correo válido';
    }

    if (!password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (password.length < 8) {
      newErrors.password = 'Mínimo 8 caracteres';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (!phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    }

    if (!city.trim()) {
      newErrors.city = 'La ciudad es requerida';
    }

    // Individual validations
    if (!isCompany) {
      if (!firstName.trim()) {
        newErrors.firstName = 'El nombre es requerido';
      }
      if (!lastName.trim()) {
        newErrors.lastName = 'El apellido es requerido';
      }
    }

    // Company validations
    if (isCompany) {
      if (!companyName.trim()) {
        newErrors.companyName = 'El nombre de la empresa es requerido';
      }
      if (!taxId.trim()) {
        newErrors.taxId = 'El RUT/RFC es requerido';
      }
      if (!address.trim()) {
        newErrors.address = 'La dirección es requerida';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    if (!acceptTerms) {
      Alert.alert(
        'Términos y Condiciones',
        'Debes aceptar los términos y condiciones para continuar'
      );
      return;
    }

    setLoading(true);
    try {
      let registrationData: IndividualProviderRegistration | CompanyProviderRegistration;

      if (isCompany) {
        registrationData = {
          type: 'company',
          email: email.toLowerCase().trim(),
          password,
          phone,
          city,
          country: 'Chile', // Default, could be selectable
          description: description || undefined,
          companyName,
          legalName: legalName || undefined,
          taxId,
          address,
          website: website || undefined,
        };
      } else {
        registrationData = {
          type: 'individual',
          email: email.toLowerCase().trim(),
          password,
          phone,
          city,
          country: 'Chile',
          description: description || undefined,
          firstName,
          lastName,
        };
      }

      const result = await providerService.registerProvider(registrationData);

      // Navigate to email verification or pending approval
      if (result.success) {
        const user = result.data.user;
        
        if (!user.emailVerified) {
          // First, verify email
          navigation.navigate('EmailVerification', { email: registrationData.email });
        } else {
          // Email verified, show pending approval
          navigation.navigate('ProviderPendingApproval', {
            providerType: type,
            email: registrationData.email,
          });
        }
      }
    } catch (error: any) {
      const parsedError = parseError(error);
      
      // Check if action is needed for email already exists
      if (parsedError.action === 'login_or_verify') {
        Alert.alert(
          parsedError.title,
          parsedError.message,
          [
            {
              text: 'Iniciar sesión',
              onPress: () => navigation.navigate('Login'),
            },
            {
              text: 'Verificar email',
              onPress: () => navigation.navigate('EmailVerification', { 
                email: email.toLowerCase().trim() 
              }),
            },
            {
              text: 'Cancelar',
              style: 'cancel',
            },
          ]
        );
      } else {
        Alert.alert(parsedError.title, parsedError.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const clearError = (field: keyof FormErrors) => {
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  const renderInput = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    errorKey: keyof FormErrors,
    options?: {
      placeholder?: string;
      keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'url';
      autoCapitalize?: 'none' | 'sentences' | 'words';
      secureTextEntry?: boolean;
      multiline?: boolean;
      icon?: string;
    }
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputContainer, errors[errorKey] && styles.inputError]}>
        {options?.icon && <Text style={styles.inputIcon}>{options.icon}</Text>}
        <TextInput
          style={[styles.input, options?.multiline && styles.inputMultiline]}
          placeholder={options?.placeholder}
          placeholderTextColor={Colors.textTertiary}
          value={value}
          onChangeText={(text) => {
            onChangeText(text);
            clearError(errorKey);
          }}
          keyboardType={options?.keyboardType || 'default'}
          autoCapitalize={options?.autoCapitalize || 'sentences'}
          secureTextEntry={options?.secureTextEntry}
          multiline={options?.multiline}
          numberOfLines={options?.multiline ? 3 : 1}
        />
      </View>
      {errors[errorKey] && <Text style={styles.errorText}>{errors[errorKey]}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
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
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>

            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeIcon}>{isCompany ? '🏢' : '👤'}</Text>
              <Text style={styles.typeBadgeText}>
                {isCompany ? 'Empresa de Tours' : 'Guía Independiente'}
              </Text>
            </View>

            <Text style={styles.title}>
              {isCompany ? 'Registra tu empresa' : 'Únete como guía'}
            </Text>
            <Text style={styles.subtitle}>
              {isCompany
                ? 'Gestiona tu negocio y equipo de guías'
                : 'Comparte tu pasión con viajeros'}
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Individual Fields */}
            {!isCompany && (
              <View style={styles.nameRow}>
                <View style={styles.halfWidth}>
                  {renderInput('Nombre', firstName, setFirstName, 'firstName', {
                    placeholder: 'Juan',
                    autoCapitalize: 'words',
                  })}
                </View>
                <View style={styles.halfWidth}>
                  {renderInput('Apellido', lastName, setLastName, 'lastName', {
                    placeholder: 'Pérez',
                    autoCapitalize: 'words',
                  })}
                </View>
              </View>
            )}

            {/* Company Fields */}
            {isCompany && (
              <>
                {renderInput('Nombre de la empresa', companyName, setCompanyName, 'companyName', {
                  placeholder: 'Aventuras Chile',
                  icon: '🏢',
                  autoCapitalize: 'words',
                })}

                {renderInput('Razón social (opcional)', legalName, setLegalName, 'companyName', {
                  placeholder: 'Aventuras Chile SpA',
                  autoCapitalize: 'words',
                })}

                {renderInput('RUT / RFC', taxId, setTaxId, 'taxId', {
                  placeholder: '12.345.678-9',
                  icon: '📋',
                })}

                {renderInput('Dirección comercial', address, setAddress, 'address', {
                  placeholder: 'Av. Principal 123, Santiago',
                  icon: '📍',
                })}

                {renderInput('Sitio web (opcional)', website, setWebsite, 'companyName', {
                  placeholder: 'https://www.tuempresa.com',
                  keyboardType: 'url',
                  autoCapitalize: 'none',
                  icon: '🌐',
                })}
              </>
            )}

            {/* Common Fields */}
            {renderInput('Correo electrónico', email, setEmail, 'email', {
              placeholder: isCompany ? 'contacto@empresa.com' : 'tu@email.com',
              keyboardType: 'email-address',
              autoCapitalize: 'none',
              icon: '✉️',
            })}

            {renderInput('Teléfono', phone, setPhone, 'phone', {
              placeholder: '+56 9 1234 5678',
              keyboardType: 'phone-pad',
              icon: '📱',
            })}

            {renderInput('Ciudad', city, setCity, 'city', {
              placeholder: 'Santiago',
              autoCapitalize: 'words',
              icon: '🏙️',
            })}

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {isCompany ? 'Descripción de la empresa' : 'Sobre ti'} (opcional)
              </Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, styles.inputMultiline]}
                  placeholder={
                    isCompany
                      ? 'Cuéntanos sobre tu empresa y los tours que ofrecen...'
                      : 'Cuéntanos sobre tu experiencia y los tours que ofreces...'
                  }
                  placeholderTextColor={Colors.textTertiary}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contraseña</Text>
              <View style={[styles.inputContainer, errors.password && styles.inputError]}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Mínimo 8 caracteres"
                  placeholderTextColor={Colors.textTertiary}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    clearError('password');
                  }}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Text style={styles.showPasswordIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirmar contraseña</Text>
              <View style={[styles.inputContainer, errors.confirmPassword && styles.inputError]}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Repite tu contraseña"
                  placeholderTextColor={Colors.textTertiary}
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    clearError('confirmPassword');
                  }}
                  secureTextEntry={!showPassword}
                />
              </View>
              {errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              )}
            </View>

            {/* Info about verification */}
            <View style={styles.verificationInfo}>
              <Text style={styles.verificationIcon}>🔍</Text>
              <View style={styles.verificationTextContainer}>
                <Text style={styles.verificationTitle}>Verificación requerida</Text>
                <Text style={styles.verificationDescription}>
                  {isCompany
                    ? 'Después del registro, deberás subir documentos de la empresa (RUT, permisos). Revisaremos tu solicitud en 3-5 días hábiles.'
                    : 'Después del registro, podrás subir tu cédula y certificaciones. Revisaremos tu solicitud en 24-48 horas.'}
                </Text>
              </View>
            </View>

            {/* Terms */}
            <TouchableOpacity
              style={styles.termsContainer}
              onPress={() => setAcceptTerms(!acceptTerms)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, acceptTerms && styles.checkboxChecked]}>
                {acceptTerms && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.termsText}>
                Acepto los <Text style={styles.termsLink}>Términos y Condiciones</Text>,{' '}
                <Text style={styles.termsLink}>Política de Privacidad</Text> y las{' '}
                <Text style={styles.termsLink}>Condiciones para Proveedores</Text>
              </Text>
            </TouchableOpacity>

            {/* Register Button */}
            <Button
              title={loading ? '' : 'Crear cuenta'}
              onPress={handleRegister}
              loading={loading}
              fullWidth
              style={styles.registerButton}
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>¿Ya tienes cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>Inicia sesión</Text>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: Spacing.lg,
  },
  header: {
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  backIcon: {
    fontSize: 20,
    color: Colors.text,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: Spacing.md,
  },
  typeBadgeIcon: {
    fontSize: 16,
    marginRight: Spacing.xs,
  },
  typeBadgeText: {
    ...Typography.label,
    color: Colors.primary,
    fontWeight: '600',
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
  form: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  halfWidth: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    ...Typography.labelLarge,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
  },
  inputError: {
    borderColor: Colors.error,
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
  inputMultiline: {
    minHeight: 80,
    paddingTop: Spacing.md,
    textAlignVertical: 'top',
  },
  showPasswordIcon: {
    fontSize: 18,
  },
  errorText: {
    ...Typography.bodySmall,
    color: Colors.error,
    marginTop: Spacing.xs,
  },
  verificationInfo: {
    flexDirection: 'row',
    backgroundColor: Colors.infoLight,
    padding: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.md,
  },
  verificationIcon: {
    fontSize: 24,
    marginRight: Spacing.sm,
  },
  verificationTextContainer: {
    flex: 1,
  },
  verificationTitle: {
    ...Typography.labelLarge,
    color: Colors.info,
    marginBottom: Spacing.xs,
  },
  verificationDescription: {
    ...Typography.bodySmall,
    color: Colors.info,
    lineHeight: 18,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
    marginTop: Spacing.sm,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.border,
    marginRight: Spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkmark: {
    color: Colors.textInverse,
    fontSize: 14,
    fontWeight: '700',
  },
  termsText: {
    flex: 1,
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  termsLink: {
    color: Colors.primary,
    fontWeight: '600',
  },
  registerButton: {
    marginBottom: Spacing.lg,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.lg,
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
