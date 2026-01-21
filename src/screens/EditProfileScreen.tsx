import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Typography } from '../theme';
import { MinimalHeader } from '../components';
import { useAuth } from '../context';
import { profileService } from '../services';
import { pickImage, takePhoto, uploadAvatar } from '../services/imageService';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bio: string;
  city: string;
  country: string;
}

export const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, refreshUser } = useAuth();
  
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    city: '',
    country: '',
  });
  
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showAvatarOptions, setShowAvatarOptions] = useState(false);

  // Load user data
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
        city: user.city || '',
        country: user.country || '',
      });
      setAvatarUri(user.avatar || null);
    }
  }, [user]);

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handlePickImage = async () => {
    try {
      const result = await pickImage({ allowsEditing: true, aspect: [1, 1] });
      if (result) {
        setAvatarUri(result.uri);
        setHasChanges(true);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
    setShowAvatarOptions(false);
  };

  const handleTakePhoto = async () => {
    try {
      const result = await takePhoto({ allowsEditing: true, aspect: [1, 1] });
      if (result) {
        setAvatarUri(result.uri);
        setHasChanges(true);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo tomar la foto');
    }
    setShowAvatarOptions(false);
  };

  const handleSave = async () => {
    if (!hasChanges) {
      navigation.goBack();
      return;
    }

    setIsSaving(true);
    
    try {
      // Upload avatar if changed
      if (avatarUri && avatarUri !== user?.avatar && !avatarUri.startsWith('http')) {
        try {
          const uploadedImage = await uploadAvatar(avatarUri);
          await profileService.updateAvatar({ avatarUrl: uploadedImage.url });
        } catch (uploadError) {
          console.warn('Avatar upload failed:', uploadError);
        }
      }

      // Update profile data
      const response = await profileService.updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        bio: formData.bio,
        city: formData.city,
        country: formData.country,
      });

      if (response.success) {
        // Refresh user data in context
        if (refreshUser) {
          await refreshUser();
        }
        Alert.alert('Éxito', 'Tu perfil ha sido actualizado', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Error', response.error || 'No se pudo actualizar el perfil');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Ocurrió un error al actualizar tu perfil');
    } finally {
      setIsSaving(false);
    }
  };

  const initials = `${formData.firstName.charAt(0)}${formData.lastName.charAt(0)}`.toUpperCase() || '??';

  return (
    <View style={styles.container}>
      <MinimalHeader
        title="Editar Perfil"
        onBack={() => navigation.goBack()}
        rightElement={
          <TouchableOpacity 
            onPress={handleSave}
            disabled={isSaving || !hasChanges}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <Text style={[styles.saveBtnText, !hasChanges && styles.saveBtnTextDisabled]}>
                Guardar
              </Text>
            )}
          </TouchableOpacity>
        }
      />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <TouchableOpacity 
              style={styles.avatarContainer}
              onPress={() => setShowAvatarOptions(true)}
            >
              {avatarUri ? (
                <Image 
                  source={avatarUri} 
                  style={styles.avatar}
                  contentFit="cover"
                />
              ) : (
                <LinearGradient
                  colors={[Colors.primary, Colors.primaryLight]}
                  style={styles.avatarPlaceholder}
                >
                  <Text style={styles.avatarInitials}>{initials}</Text>
                </LinearGradient>
              )}
              <View style={styles.avatarEditBadge}>
                <Text style={styles.avatarEditIcon}>📷</Text>
              </View>
            </TouchableOpacity>
            <Text style={styles.avatarHint}>Toca para cambiar tu foto</Text>
          </View>

          {/* Form Fields */}
          <View style={styles.form}>
            {/* Name Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Información Personal</Text>
              
              <View style={styles.row}>
                <View style={styles.inputHalf}>
                  <Text style={styles.label}>Nombre</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.firstName}
                    onChangeText={(v) => updateField('firstName', v)}
                    placeholder="Tu nombre"
                    placeholderTextColor={Colors.textTertiary}
                  />
                </View>
                <View style={styles.inputHalf}>
                  <Text style={styles.label}>Apellido</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.lastName}
                    onChangeText={(v) => updateField('lastName', v)}
                    placeholder="Tu apellido"
                    placeholderTextColor={Colors.textTertiary}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={[styles.input, styles.inputDisabled]}
                  value={formData.email}
                  editable={false}
                  placeholder="tu@email.com"
                  placeholderTextColor={Colors.textTertiary}
                />
                <Text style={styles.inputHint}>El email no se puede cambiar</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Teléfono</Text>
                <TextInput
                  style={styles.input}
                  value={formData.phone}
                  onChangeText={(v) => updateField('phone', v)}
                  placeholder="+56 9 1234 5678"
                  placeholderTextColor={Colors.textTertiary}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* Bio Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sobre Ti</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Bio</Text>
                <TextInput
                  style={[styles.input, styles.inputMultiline]}
                  value={formData.bio}
                  onChangeText={(v) => updateField('bio', v)}
                  placeholder="Cuéntanos sobre ti, tus intereses..."
                  placeholderTextColor={Colors.textTertiary}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </View>

            {/* Location Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ubicación</Text>
              
              <View style={styles.row}>
                <View style={styles.inputHalf}>
                  <Text style={styles.label}>Ciudad</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.city}
                    onChangeText={(v) => updateField('city', v)}
                    placeholder="Tu ciudad"
                    placeholderTextColor={Colors.textTertiary}
                  />
                </View>
                <View style={styles.inputHalf}>
                  <Text style={styles.label}>País</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.country}
                    onChangeText={(v) => updateField('country', v)}
                    placeholder="Tu país"
                    placeholderTextColor={Colors.textTertiary}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Spacer for keyboard */}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Avatar Options Modal */}
        {showAvatarOptions && (
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowAvatarOptions(false)}
          >
            <View style={styles.avatarOptionsModal}>
              <Text style={styles.modalTitle}>Cambiar Foto</Text>
              
              <TouchableOpacity style={styles.modalOption} onPress={handleTakePhoto}>
                <Text style={styles.modalOptionIcon}>📷</Text>
                <Text style={styles.modalOptionText}>Tomar Foto</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.modalOption} onPress={handlePickImage}>
                <Text style={styles.modalOptionIcon}>🖼️</Text>
                <Text style={styles.modalOptionText}>Elegir de Galería</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalOption, styles.modalOptionCancel]}
                onPress={() => setShowAvatarOptions(false)}
              >
                <Text style={styles.modalOptionCancelText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      </KeyboardAvoidingView>
    </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    backgroundColor: Colors.card,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtnText: {
    fontSize: 20,
    color: Colors.text,
  },
  headerTitle: {
    ...Typography.h4,
    color: Colors.text,
  },
  saveBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 8,
    backgroundColor: Colors.primaryMuted,
  },
  saveBtnDisabled: {
    backgroundColor: Colors.background,
  },
  saveBtnText: {
    ...Typography.label,
    color: Colors.primary,
    fontWeight: '600',
  },
  saveBtnTextDisabled: {
    color: Colors.textTertiary,
  },
  content: {
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    backgroundColor: Colors.card,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    ...Typography.h1,
    color: Colors.textInverse,
    fontWeight: '700',
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarEditIcon: {
    fontSize: 16,
  },
  avatarHint: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginTop: Spacing.sm,
  },
  form: {
    padding: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.label,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  inputHalf: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    ...Typography.label,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    ...Typography.body,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  inputDisabled: {
    backgroundColor: Colors.background,
    color: Colors.textTertiary,
  },
  inputMultiline: {
    minHeight: 100,
    paddingTop: Spacing.md,
  },
  inputHint: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginTop: 4,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  avatarOptionsModal: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  modalTitle: {
    ...Typography.h4,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: 12,
    backgroundColor: Colors.background,
    marginBottom: Spacing.sm,
  },
  modalOptionIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  modalOptionText: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '500',
  },
  modalOptionCancel: {
    backgroundColor: 'transparent',
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  modalOptionCancelText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});

export default EditProfileScreen;

