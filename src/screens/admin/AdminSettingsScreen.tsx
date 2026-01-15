import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '../../theme';
import { adminService, Company } from '../../services';
import { useAuth } from '../../context';
import type { AdminTabScreenProps } from '../../types';

type Props = AdminTabScreenProps<'AdminSettings'>;

export const AdminSettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { user, signOut } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const data = await adminService.getCompany();
        setCompany(data);
        setName(data.name);
        setDescription(data.description || '');
        setEmail(data.email);
        setPhone(data.phone || '');
        setWebsite(data.website || '');
        setAddress(data.address || '');
      } catch (error) {
        console.error('Error fetching company:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, []);

  const handleSave = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert('Error', 'Nombre y email son requeridos');
      return;
    }

    setSaving(true);
    try {
      const updated = await adminService.updateCompany({
        name: name.trim(),
        description: description.trim(),
        email: email.trim(),
        phone: phone.trim(),
        website: website.trim(),
        address: address.trim(),
      });
      setCompany(updated);
      setEditMode(false);
      Alert.alert('Éxito', 'Datos actualizados');
    } catch (error) {
      Alert.alert('Error', 'No se pudieron guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro de que quieres salir?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Salir',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
          } catch (error) {
            Alert.alert('Error', 'No se pudo cerrar sesión');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Configuración</Text>
        </View>

        {/* User Profile Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mi Cuenta</Text>
          <View style={styles.profileCard}>
            <View style={styles.profileAvatar}>
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>
                  {user?.firstName?.charAt(0)}
                  {user?.lastName?.charAt(0)}
                </Text>
              )}
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {user?.firstName} {user?.lastName}
              </Text>
              <Text style={styles.profileEmail}>{user?.email}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>Administrador</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Company Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Datos de la Empresa</Text>
            {!editMode && (
              <TouchableOpacity onPress={() => setEditMode(true)}>
                <Text style={styles.editLink}>✏️ Editar</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.companyCard}>
            {(company?.logo || company?.logoUrl) && (
              <View style={styles.logoContainer}>
                <Image source={{ uri: company.logo || company.logoUrl }} style={styles.companyLogo} />
                {editMode && (
                  <TouchableOpacity style={styles.changeLogoButton}>
                    <Text style={styles.changeLogoText}>Cambiar logo</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {editMode ? (
              <View style={styles.form}>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Nombre de la empresa *</Text>
                  <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Nombre de la empresa"
                    placeholderTextColor={Colors.textTertiary}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Descripción</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Descripción de la empresa"
                    placeholderTextColor={Colors.textTertiary}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Email de contacto *</Text>
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="email@empresa.com"
                    placeholderTextColor={Colors.textTertiary}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Teléfono</Text>
                  <TextInput
                    style={styles.input}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="+56 9 1234 5678"
                    placeholderTextColor={Colors.textTertiary}
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Sitio web</Text>
                  <TextInput
                    style={styles.input}
                    value={website}
                    onChangeText={setWebsite}
                    placeholder="https://empresa.com"
                    placeholderTextColor={Colors.textTertiary}
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Dirección</Text>
                  <TextInput
                    style={styles.input}
                    value={address}
                    onChangeText={setAddress}
                    placeholder="Dirección de la empresa"
                    placeholderTextColor={Colors.textTertiary}
                  />
                </View>

                <View style={styles.formActions}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      setEditMode(false);
                      if (company) {
                        setName(company.name);
                        setDescription(company.description || '');
                        setEmail(company.email);
                        setPhone(company.phone || '');
                        setWebsite(company.website || '');
                        setAddress(company.address || '');
                      }
                    }}
                  >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                    onPress={handleSave}
                    disabled={saving}
                  >
                    {saving ? (
                      <ActivityIndicator size="small" color={Colors.textInverse} />
                    ) : (
                      <Text style={styles.saveButtonText}>Guardar</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.companyInfo}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Nombre</Text>
                  <Text style={styles.infoValue}>{company?.name}</Text>
                </View>
                {company?.description && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Descripción</Text>
                    <Text style={styles.infoValue}>{company.description}</Text>
                  </View>
                )}
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoValue}>{company?.email}</Text>
                </View>
                {company?.phone && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Teléfono</Text>
                    <Text style={styles.infoValue}>{company.phone}</Text>
                  </View>
                )}
                {company?.website && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Sitio web</Text>
                    <Text style={[styles.infoValue, styles.linkValue]}>{company.website}</Text>
                  </View>
                )}
                {company?.address && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Dirección</Text>
                    <Text style={styles.infoValue}>{company.address}</Text>
                  </View>
                )}
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Ubicación</Text>
                  <Text style={styles.infoValue}>
                    {company?.city}, {company?.country}
                  </Text>
                </View>
                <View style={styles.verificationRow}>
                  {company?.isVerified ? (
                    <View style={styles.verifiedTag}>
                      <Text style={styles.verifiedTagText}>✓ Empresa verificada</Text>
                    </View>
                  ) : (
                    <View style={styles.unverifiedTag}>
                      <Text style={styles.unverifiedTagText}>⏳ Verificación pendiente</Text>
                    </View>
                  )}
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Menu Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Opciones</Text>
          <View style={styles.menuCard}>
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuIcon}>🔔</Text>
              <Text style={styles.menuText}>Notificaciones</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuIcon}>🔒</Text>
              <Text style={styles.menuText}>Seguridad</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuIcon}>💳</Text>
              <Text style={styles.menuText}>Métodos de pago</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuIcon}>📄</Text>
              <Text style={styles.menuText}>Términos y condiciones</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuIcon}>❓</Text>
              <Text style={styles.menuText}>Ayuda y soporte</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Tourline Admin v1.0.0</Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Header
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  headerTitle: {
    ...Typography.h2,
    color: Colors.text,
  },
  // Section
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
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
    marginBottom: Spacing.md,
  },
  editLink: {
    ...Typography.labelLarge,
    color: Colors.primary,
  },
  // Profile Card
  profileCard: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: Spacing.md,
    alignItems: 'center',
  },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  avatarText: {
    ...Typography.h3,
    color: Colors.textInverse,
  },
  profileInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  profileName: {
    ...Typography.h4,
    color: Colors.text,
  },
  profileEmail: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  roleBadge: {
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: Spacing.xs,
  },
  roleText: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '600',
  },
  // Company Card
  companyCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: Spacing.md,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  companyLogo: {
    width: 80,
    height: 80,
    borderRadius: 16,
  },
  changeLogoButton: {
    marginTop: Spacing.sm,
  },
  changeLogoText: {
    ...Typography.labelSmall,
    color: Colors.primary,
  },
  companyInfo: {},
  infoRow: {
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  infoLabel: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginBottom: 2,
  },
  infoValue: {
    ...Typography.body,
    color: Colors.text,
  },
  linkValue: {
    color: Colors.primary,
  },
  verificationRow: {
    paddingTop: Spacing.md,
  },
  verifiedTag: {
    backgroundColor: Colors.successLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  verifiedTagText: {
    ...Typography.labelSmall,
    color: Colors.success,
    fontWeight: '600',
  },
  unverifiedTag: {
    backgroundColor: Colors.warningLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  unverifiedTagText: {
    ...Typography.labelSmall,
    color: Colors.warning,
    fontWeight: '600',
  },
  // Form
  form: {},
  formGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    ...Typography.labelSmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Typography.body,
    color: Colors.text,
  },
  textArea: {
    minHeight: 80,
  },
  formActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelButtonText: {
    ...Typography.labelLarge,
    color: Colors.textSecondary,
  },
  saveButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    ...Typography.labelLarge,
    color: Colors.textInverse,
  },
  // Menu Card
  menuCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: Spacing.md,
  },
  menuText: {
    ...Typography.body,
    color: Colors.text,
    flex: 1,
  },
  menuArrow: {
    fontSize: 20,
    color: Colors.textTertiary,
  },
  // Logout
  logoutButton: {
    backgroundColor: Colors.errorLight,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutButtonText: {
    ...Typography.labelLarge,
    color: Colors.error,
  },
  // Version
  versionContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  versionText: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },
});

