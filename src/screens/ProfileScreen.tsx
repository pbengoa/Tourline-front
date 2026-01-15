import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Spacing, Typography } from '../theme';
import { useAuth } from '../context';
import { Avatar, ImageUploader } from '../components';
import { profileService } from '../services';
import type { MainTabScreenProps, RootStackParamList } from '../types';

type Props = MainTabScreenProps<'Profile'>;

const MENU_ITEMS = [
  { id: 'bookings', icon: '📋', label: 'Mis Reservas', badge: null },
  { id: 'messages', icon: '💬', label: 'Mensajes', badge: 2 },
  { id: 'favorites', icon: '❤️', label: 'Favoritos', badge: null },
  { id: 'payments', icon: '💳', label: 'Métodos de Pago', badge: null },
  { id: 'notifications', icon: '🔔', label: 'Notificaciones', badge: 5 },
  { id: 'settings', icon: '⚙️', label: 'Configuración', badge: null },
  { id: 'help', icon: '❓', label: 'Ayuda y Soporte', badge: null },
];

export const ProfileScreen: React.FC<Props> = () => {
  const { user, signOut } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [avatarUri, setAvatarUri] = useState<string | undefined>(user?.avatar);
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);

  // Get full name from firstName and lastName
  const fullName = user ? `${user.firstName} ${user.lastName}` : 'Usuario';

  const handleMenuPress = (id: string) => {
    switch (id) {
      case 'bookings':
        navigation.navigate('MyBookings');
        break;
      case 'messages':
        navigation.navigate('ChatList');
        break;
      case 'favorites':
        Alert.alert('Próximamente', 'Esta función estará disponible pronto');
        break;
      case 'payments':
        Alert.alert('Próximamente', 'Esta función estará disponible pronto');
        break;
      case 'notifications':
        Alert.alert('Próximamente', 'Esta función estará disponible pronto');
        break;
      case 'settings':
        Alert.alert('Próximamente', 'Esta función estará disponible pronto');
        break;
      case 'help':
        Alert.alert('Próximamente', 'Esta función estará disponible pronto');
        break;
    }
  };

  const handleLogout = () => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro de que quieres cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar Sesión',
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

  const handleAvatarUploaded = async (imageUrl: string) => {
    try {
      // Update avatar in backend
      await profileService.updateAvatar(imageUrl);
      setAvatarUri(imageUrl);
      Alert.alert('Éxito', 'Foto de perfil actualizada');
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar la foto de perfil');
    }
  };

  const getRoleBadge = () => {
    if (!user) return null;
    if (user.role === 'ADMIN') return { label: 'Admin', color: Colors.error, icon: '👑' };
    if (user.role === 'GUIDE') return { label: 'Guía Verificado', color: Colors.success, icon: '✓' };
    return null;
  };

  const roleBadge = getRoleBadge();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerBackground} />
          
          <View style={styles.avatarSection}>
            {isEditingAvatar ? (
              <ImageUploader
                currentImageUri={avatarUri}
                onImageUploaded={(url) => {
                  handleAvatarUploaded(url);
                  setIsEditingAvatar(false);
                }}
                type="avatar"
                size="large"
                placeholder={fullName}
              />
            ) : (
              <TouchableOpacity
                style={styles.avatarContainer}
                onPress={() => setIsEditingAvatar(true)}
                activeOpacity={0.8}
              >
                <Avatar uri={avatarUri} name={fullName} size="xlarge" />
                <View style={styles.cameraButton}>
                  <Text style={styles.cameraIcon}>📷</Text>
                </View>
              </TouchableOpacity>
            )}

            <View style={styles.nameContainer}>
              <Text style={styles.userName}>{fullName}</Text>
              {roleBadge && (
                <View style={[styles.roleBadge, { backgroundColor: roleBadge.color + '15' }]}>
                  <Text style={styles.roleBadgeIcon}>{roleBadge.icon}</Text>
                  <Text style={[styles.roleBadgeText, { color: roleBadge.color }]}>
                    {roleBadge.label}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.userEmail}>{user?.email || 'usuario@example.com'}</Text>

            <TouchableOpacity style={styles.editButton} activeOpacity={0.7}>
              <Text style={styles.editButtonIcon}>✏️</Text>
              <Text style={styles.editButtonText}>Editar Perfil</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <TouchableOpacity style={styles.statItem} activeOpacity={0.7}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Tours</Text>
          </TouchableOpacity>
          <View style={styles.statDivider} />
          <TouchableOpacity style={styles.statItem} activeOpacity={0.7}>
            <Text style={styles.statValue}>8</Text>
            <Text style={styles.statLabel}>Reseñas</Text>
          </TouchableOpacity>
          <View style={styles.statDivider} />
          <TouchableOpacity style={styles.statItem} activeOpacity={0.7}>
            <Text style={styles.statValue}>24</Text>
            <Text style={styles.statLabel}>Favoritos</Text>
          </TouchableOpacity>
        </View>

        {/* Menu */}
        <View style={styles.menuContainer}>
          <Text style={styles.menuTitle}>Cuenta</Text>
          {MENU_ITEMS.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                index === MENU_ITEMS.length - 1 && styles.menuItemLast,
              ]}
              activeOpacity={0.7}
              onPress={() => handleMenuPress(item.id)}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIconContainer}>
                  <Text style={styles.menuIcon}>{item.icon}</Text>
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
              </View>
              <View style={styles.menuItemRight}>
                {item.badge && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.badge}</Text>
                  </View>
                )}
                <Text style={styles.menuArrow}>›</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} activeOpacity={0.7} onPress={handleLogout}>
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>

        {/* Version */}
        <Text style={styles.version}>Tourline v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    position: 'relative',
    paddingBottom: Spacing.lg,
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  avatarSection: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.card,
  },
  cameraIcon: {
    fontSize: 16,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 4,
  },
  userName: {
    ...Typography.h3,
    color: Colors.text,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  roleBadgeIcon: {
    fontSize: 12,
  },
  roleBadgeText: {
    ...Typography.labelSmall,
    fontWeight: '700',
  },
  userEmail: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  editButtonIcon: {
    fontSize: 14,
  },
  editButtonText: {
    ...Typography.label,
    color: Colors.text,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    marginHorizontal: Spacing.lg,
    borderRadius: 20,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...Typography.h2,
    color: Colors.primary,
    marginBottom: 2,
  },
  statLabel: {
    ...Typography.labelSmall,
    color: Colors.textSecondary,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginVertical: 4,
  },
  menuContainer: {
    backgroundColor: Colors.card,
    marginHorizontal: Spacing.lg,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  menuTitle: {
    ...Typography.labelSmall,
    color: Colors.textTertiary,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  menuIcon: {
    fontSize: 18,
  },
  menuLabel: {
    ...Typography.body,
    color: Colors.text,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  badge: {
    backgroundColor: Colors.error,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    ...Typography.labelSmall,
    color: Colors.textInverse,
    fontWeight: '700',
  },
  menuArrow: {
    ...Typography.h3,
    color: Colors.textTertiary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: Spacing.lg,
    marginTop: Spacing.xl,
    padding: Spacing.md,
    backgroundColor: Colors.errorLight,
    borderRadius: 16,
    gap: Spacing.sm,
  },
  logoutIcon: {
    fontSize: 18,
  },
  logoutText: {
    ...Typography.button,
    color: Colors.error,
  },
  version: {
    ...Typography.caption,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
});
