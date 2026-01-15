import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Typography } from '../theme';
import { useAuth } from '../context';
import type { MainTabScreenProps, RootStackParamList } from '../types';

const { width } = Dimensions.get('window');

type Props = MainTabScreenProps<'Profile'>;

const QUICK_ACTIONS = [
  { id: 'bookings', icon: '📋', label: 'Reservas', color: Colors.primary },
  { id: 'messages', icon: '💬', label: 'Mensajes', color: Colors.accent, badge: 2 },
  { id: 'favorites', icon: '❤️', label: 'Favoritos', color: Colors.secondary },
  { id: 'history', icon: '🕐', label: 'Historial', color: Colors.warning },
];

const MENU_SECTIONS = [
  {
    title: 'Mi cuenta',
    items: [
      { id: 'edit-profile', icon: '👤', label: 'Editar Perfil' },
      { id: 'payments', icon: '💳', label: 'Métodos de Pago' },
      { id: 'notifications', icon: '🔔', label: 'Notificaciones', badge: 5 },
    ],
  },
  {
    title: 'Preferencias',
    items: [
      { id: 'language', icon: '🌐', label: 'Idioma', value: 'Español' },
      { id: 'currency', icon: '💵', label: 'Moneda', value: 'CLP' },
      { id: 'darkmode', icon: '🌙', label: 'Modo Oscuro', isToggle: true },
    ],
  },
  {
    title: 'Soporte',
    items: [
      { id: 'help', icon: '❓', label: 'Centro de Ayuda' },
      { id: 'contact', icon: '📧', label: 'Contactar Soporte' },
      { id: 'terms', icon: '📄', label: 'Términos y Condiciones' },
      { id: 'privacy', icon: '🔒', label: 'Política de Privacidad' },
    ],
  },
];

export const ProfileScreen: React.FC<Props> = () => {
  const { user, signOut } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Animation on mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const fullName = user ? `${user.firstName} ${user.lastName}` : 'Usuario';
  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleQuickAction = (id: string) => {
    switch (id) {
      case 'bookings':
        navigation.navigate('MyBookings');
        break;
      case 'messages':
        navigation.navigate('ChatList');
        break;
      case 'favorites':
        Alert.alert('Favoritos', 'Tus tours y guías favoritos aparecerán aquí');
        break;
      case 'history':
        Alert.alert('Historial', 'Tu historial de tours aparecerá aquí');
        break;
    }
  };

  const handleMenuPress = (id: string) => {
    switch (id) {
      case 'edit-profile':
        Alert.alert('Editar Perfil', 'Esta función estará disponible pronto');
        break;
      case 'payments':
        Alert.alert('Métodos de Pago', 'Esta función estará disponible pronto');
        break;
      case 'notifications':
        Alert.alert('Notificaciones', 'Esta función estará disponible pronto');
        break;
      case 'help':
        Alert.alert('Centro de Ayuda', 'Esta función estará disponible pronto');
        break;
      default:
        Alert.alert('Próximamente', 'Esta función estará disponible pronto');
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

  const getRoleBadge = () => {
    if (!user) return null;
    if (user.role === 'ADMIN' || user.role === 'admin')
      return { label: 'Admin', color: Colors.error, icon: '👑' };
    if (user.role === 'GUIDE' || user.role === 'guide')
      return { label: 'Guía', color: Colors.success, icon: '✓' };
    return { label: 'Explorador', color: Colors.accent, icon: '🧭' };
  };

  const roleBadge = getRoleBadge();

  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <LinearGradient
        colors={[Colors.primary, Colors.primaryDark]}
        style={styles.headerGradient}
      >
        <View style={styles.headerDecoration}>
          <View style={styles.decorCircle1} />
          <View style={styles.decorCircle2} />
        </View>
      </LinearGradient>

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Profile Header */}
          <Animated.View
            style={[
              styles.profileHeader,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Avatar */}
            <TouchableOpacity style={styles.avatarContainer} activeOpacity={0.9}>
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatar} />
              ) : (
                <LinearGradient
                  colors={[Colors.secondary, Colors.secondaryDark]}
                  style={styles.avatarPlaceholder}
                >
                  <Text style={styles.avatarInitials}>{initials}</Text>
                </LinearGradient>
              )}
              <View style={styles.editAvatarButton}>
                <Text style={styles.editAvatarIcon}>📷</Text>
              </View>
            </TouchableOpacity>

            {/* Name and badge */}
            <View style={styles.nameContainer}>
              <Text style={styles.userName}>{fullName}</Text>
              {roleBadge && (
                <View style={[styles.roleBadge, { backgroundColor: roleBadge.color + '20' }]}>
                  <Text style={styles.roleBadgeIcon}>{roleBadge.icon}</Text>
                  <Text style={[styles.roleBadgeText, { color: roleBadge.color }]}>
                    {roleBadge.label}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.userEmail}>{user?.email || 'usuario@tourline.com'}</Text>
          </Animated.View>

          {/* Stats Card */}
          <Animated.View
            style={[
              styles.statsCard,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <TouchableOpacity style={styles.statItem} activeOpacity={0.7}>
              <Text style={styles.statEmoji}>🎒</Text>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Tours</Text>
            </TouchableOpacity>
            <View style={styles.statDivider} />
            <TouchableOpacity style={styles.statItem} activeOpacity={0.7}>
              <Text style={styles.statEmoji}>⭐</Text>
              <Text style={styles.statValue}>8</Text>
              <Text style={styles.statLabel}>Reseñas</Text>
            </TouchableOpacity>
            <View style={styles.statDivider} />
            <TouchableOpacity style={styles.statItem} activeOpacity={0.7}>
              <Text style={styles.statEmoji}>❤️</Text>
              <Text style={styles.statValue}>24</Text>
              <Text style={styles.statLabel}>Favoritos</Text>
            </TouchableOpacity>
            <View style={styles.statDivider} />
            <TouchableOpacity style={styles.statItem} activeOpacity={0.7}>
              <Text style={styles.statEmoji}>🌍</Text>
              <Text style={styles.statValue}>5</Text>
              <Text style={styles.statLabel}>Ciudades</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Quick Actions */}
          <View style={styles.quickActionsSection}>
            <Text style={styles.sectionTitle}>Acceso rápido</Text>
            <View style={styles.quickActionsGrid}>
              {QUICK_ACTIONS.map((action, index) => (
                <Animated.View
                  key={action.id}
                  style={{
                    opacity: fadeAnim,
                    transform: [
                      {
                        translateY: fadeAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [20 + index * 5, 0],
                        }),
                      },
                    ],
                  }}
                >
                  <TouchableOpacity
                    style={styles.quickActionButton}
                    onPress={() => handleQuickAction(action.id)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.quickActionIcon, { backgroundColor: action.color + '15' }]}>
                      <Text style={styles.quickActionEmoji}>{action.icon}</Text>
                      {action.badge && (
                        <View style={styles.quickActionBadge}>
                          <Text style={styles.quickActionBadgeText}>{action.badge}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.quickActionLabel}>{action.label}</Text>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          </View>

          {/* Menu Sections */}
          {MENU_SECTIONS.map((section, sectionIndex) => (
            <View key={section.title} style={styles.menuSection}>
              <Text style={styles.menuSectionTitle}>{section.title}</Text>
              <View style={styles.menuCard}>
                {section.items.map((item, itemIndex) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.menuItem,
                      itemIndex === section.items.length - 1 && styles.menuItemLast,
                    ]}
                    onPress={() => handleMenuPress(item.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.menuItemLeft}>
                      <View style={styles.menuIconContainer}>
                        <Text style={styles.menuIcon}>{item.icon}</Text>
                      </View>
                      <Text style={styles.menuLabel}>{item.label}</Text>
                    </View>
                    <View style={styles.menuItemRight}>
                      {item.badge && (
                        <View style={styles.menuBadge}>
                          <Text style={styles.menuBadgeText}>{item.badge}</Text>
                        </View>
                      )}
                      {item.value && <Text style={styles.menuValue}>{item.value}</Text>}
                      <Text style={styles.menuArrow}>›</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}

          {/* Logout */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
            <Text style={styles.logoutIcon}>🚪</Text>
            <Text style={styles.logoutText}>Cerrar Sesión</Text>
          </TouchableOpacity>

          {/* Version */}
          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>Tourline v1.0.0</Text>
            <Text style={styles.madeWithText}>Hecho con ❤️ en Chile</Text>
          </View>

          {/* Bottom padding for tab bar */}
          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  headerDecoration: {
    flex: 1,
    overflow: 'hidden',
  },
  decorCircle1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  decorCircle2: {
    position: 'absolute',
    top: 50,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
  },
  // Profile Header
  profileHeader: {
    alignItems: 'center',
    paddingTop: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: Colors.surface,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    ...Typography.h2,
    color: Colors.textInverse,
    fontWeight: '700',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.surface,
  },
  editAvatarIcon: {
    fontSize: 14,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 4,
  },
  userName: {
    ...Typography.h3,
    color: Colors.textInverse,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
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
    color: 'rgba(255,255,255,0.85)',
  },
  // Stats Card
  statsCard: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  statValue: {
    ...Typography.h3,
    color: Colors.primary,
    fontWeight: '800',
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 8,
  },
  // Quick Actions
  quickActionsSection: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.labelLarge,
    color: Colors.text,
    marginBottom: Spacing.md,
    marginLeft: 4,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    alignItems: 'center',
    width: (width - Spacing.lg * 2 - Spacing.md * 3) / 4,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
    position: 'relative',
  },
  quickActionEmoji: {
    fontSize: 24,
  },
  quickActionBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.error,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.background,
  },
  quickActionBadgeText: {
    ...Typography.caption,
    color: Colors.textInverse,
    fontWeight: '700',
    fontSize: 10,
  },
  quickActionLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  // Menu Sections
  menuSection: {
    marginBottom: Spacing.lg,
  },
  menuSectionTitle: {
    ...Typography.labelSmall,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
    marginLeft: 4,
  },
  menuCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
  menuBadge: {
    backgroundColor: Colors.error,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  menuBadgeText: {
    ...Typography.caption,
    color: Colors.textInverse,
    fontWeight: '700',
    fontSize: 11,
  },
  menuValue: {
    ...Typography.body,
    color: Colors.textTertiary,
  },
  menuArrow: {
    ...Typography.h3,
    color: Colors.textTertiary,
  },
  // Logout
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.errorLight,
    padding: Spacing.md,
    borderRadius: 16,
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  logoutIcon: {
    fontSize: 18,
  },
  logoutText: {
    ...Typography.labelLarge,
    color: Colors.error,
    fontWeight: '600',
  },
  // Version
  versionContainer: {
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  versionText: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },
  madeWithText: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginTop: 4,
  },
});
