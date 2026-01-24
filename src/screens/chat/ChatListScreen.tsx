import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Colors, Spacing, Typography } from '../../theme';
import { MinimalHeader } from '../../components';
import { chatService } from '../../services';
import { useAuth } from '../../context';
import type { RootStackScreenProps, Conversation } from '../../types';

type Props = RootStackScreenProps<'ChatList'>;

export const ChatListScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch conversations from API
  const fetchConversations = useCallback(async (showLoading = true) => {
    if (!user?.id) return;
    
    if (showLoading) setIsLoading(true);
    setError(null);
    
    try {
      const response = await chatService.getConversations(user.id);
      
      if (response.success) {
        setConversations(response.data || []);
      } else {
        setError(response.error?.message || 'Error al cargar conversaciones');
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError('Error de conexión');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  // Initial load
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchConversations(false);
    }, [fetchConversations])
  );

  // Polling for new messages every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchConversations(false);
    }, 10000);
    
    return () => clearInterval(interval);
  }, [fetchConversations]);

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.relatedTourTitle?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Ayer';
    } else if (diffDays < 7) {
      const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      return days[date.getDay()];
    } else {
      return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchConversations(false);
  };

  const handleConversationPress = async (conversation: Conversation) => {
    // Mark as read when opening
    if (conversation.unreadCount > 0) {
      chatService.markAsRead(conversation.id);
    }
    
    navigation.navigate('Chat', {
      conversationId: conversation.id,
      participantName: conversation.participantName,
      participantId: conversation.participantId,
    });
  };

  const renderConversation = ({ item: conversation }: { item: Conversation }) => {
    const hasUnread = conversation.unreadCount > 0;

    return (
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={() => handleConversationPress(conversation)}
        activeOpacity={0.7}
      >
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, conversation.participantType === 'guide' && styles.guideAvatar]}>
            <Text style={styles.avatarText}>{getInitials(conversation.participantName)}</Text>
          </View>
          {conversation.isOnline && <View style={styles.onlineBadge} />}
          {conversation.isVerified && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedIcon}>✓</Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text
              style={[styles.participantName, hasUnread && styles.unreadText]}
              numberOfLines={1}
            >
              {conversation.participantName}
            </Text>
            <Text style={[styles.timestamp, hasUnread && styles.unreadTimestamp]}>
              {conversation.lastMessage ? formatTime(conversation.lastMessage.timestamp) : ''}
            </Text>
          </View>

          {conversation.relatedTourTitle && (
            <Text style={styles.tourTitle} numberOfLines={1}>
              🎫 {conversation.relatedTourTitle}
            </Text>
          )}

          <View style={styles.messageRow}>
            <Text style={[styles.lastMessage, hasUnread && styles.unreadText]} numberOfLines={1}>
              {conversation.lastMessage?.content || 'Inicia una conversación'}
            </Text>
            {hasUnread && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadCount}>
                  {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>💬</Text>
      <Text style={styles.emptyTitle}>No hay conversaciones</Text>
      <Text style={styles.emptyText}>
        {searchQuery
          ? 'No se encontraron conversaciones con ese término'
          : 'Cuando contactes con un guía o administrador, tus conversaciones aparecerán aquí'}
      </Text>
    </View>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text style={styles.loadingText}>Cargando conversaciones...</Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>⚠️</Text>
      <Text style={styles.emptyTitle}>Error al cargar</Text>
      <Text style={styles.emptyText}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={() => fetchConversations()}>
        <Text style={styles.retryButtonText}>Reintentar</Text>
      </TouchableOpacity>
    </View>
  );

  const totalUnread = conversations.reduce((acc, conv) => acc + conv.unreadCount, 0);

  return (
    <View style={styles.container}>
      <MinimalHeader
        title="Mensajes"
        onBack={() => navigation.goBack()}
        rightElement={
          totalUnread > 0 ? (
            <View style={styles.totalUnreadBadge}>
              <Text style={styles.totalUnreadText}>{totalUnread}</Text>
            </View>
          ) : undefined
        }
      />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar conversaciones..."
            placeholderTextColor={Colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content */}
      {isLoading ? (
        renderLoadingState()
      ) : error ? (
        renderErrorState()
      ) : (
        <FlatList
          data={filteredConversations}
          renderItem={renderConversation}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.primary}
            />
          }
          ListEmptyComponent={renderEmptyState}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  totalUnreadBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  totalUnreadText: {
    ...Typography.labelSmall,
    color: Colors.textInverse,
    fontWeight: '700',
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    height: 44,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...Typography.body,
    color: Colors.text,
    padding: 0,
  },
  clearIcon: {
    fontSize: 14,
    color: Colors.textTertiary,
    padding: Spacing.xs,
  },
  listContent: {
    flexGrow: 1,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: Spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideAvatar: {
    backgroundColor: Colors.secondary,
  },
  avatarText: {
    ...Typography.labelLarge,
    color: Colors.textInverse,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.success,
    borderWidth: 2,
    borderColor: Colors.background,
  },
  verifiedBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.info,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.background,
  },
  verifiedIcon: {
    color: Colors.textInverse,
    fontSize: 10,
    fontWeight: '700',
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  participantName: {
    ...Typography.labelLarge,
    color: Colors.text,
    flex: 1,
    marginRight: Spacing.sm,
  },
  timestamp: {
    ...Typography.labelSmall,
    color: Colors.textTertiary,
  },
  unreadTimestamp: {
    color: Colors.primary,
  },
  tourTitle: {
    ...Typography.labelSmall,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastMessage: {
    ...Typography.body,
    color: Colors.textSecondary,
    flex: 1,
    marginRight: Spacing.sm,
  },
  unreadText: {
    fontWeight: '600',
    color: Colors.text,
  },
  unreadBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadCount: {
    ...Typography.labelSmall,
    color: Colors.textInverse,
    fontWeight: '700',
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: Spacing.lg + 56 + Spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    ...Typography.h4,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  loadingText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  retryButton: {
    marginTop: Spacing.lg,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 12,
  },
  retryButtonText: {
    ...Typography.labelLarge,
    color: Colors.textInverse,
  },
});
