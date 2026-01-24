import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Colors, Spacing, Typography } from '../../theme';
import { chatService } from '../../services';
import { useAuth } from '../../context';
import { QUICK_REPLIES } from '../../constants/chatData';
import { MESSAGE_STATUS_CONFIG } from '../../types/chat';
import type { RootStackScreenProps, Message, Conversation } from '../../types';

type Props = RootStackScreenProps<'Chat'>;

export const ChatScreen: React.FC<Props> = ({ route, navigation }) => {
  const { conversationId, participantName, participantId } = route.params;
  const { user } = useAuth();
  const currentUserId = user?.id || '';
  
  console.log('🔑 ChatScreen - currentUserId:', currentUserId, 'participantId:', participantId);

  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showQuickReplies, setShowQuickReplies] = useState(true);

  const flatListRef = useRef<FlatList>(null);

  // Fetch messages from API
  const fetchMessages = useCallback(async (showLoading = true) => {
    if (!currentUserId) return;
    
    if (showLoading) setIsLoading(true);
    setError(null);
    
    try {
      const [messagesResponse, convResponse] = await Promise.all([
        chatService.getMessages(conversationId, currentUserId),
        chatService.getConversation(conversationId, currentUserId),
      ]);
      
      if (messagesResponse.success) {
        setMessages(messagesResponse.data || []);
      } else {
        setError(messagesResponse.error?.message || 'Error al cargar mensajes');
      }
      
      if (convResponse.success) {
        setConversation(convResponse.data);
      }
      
      // Mark as read
      chatService.markAsRead(conversationId);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, currentUserId]);

  // Initial load
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchMessages(false);
    }, [fetchMessages])
  );

  // Polling for new messages every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchMessages(false);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [fetchMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateDivider = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Hoy';
    } else if (diffDays === 1) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      });
    }
  };

  const shouldShowDateDivider = (currentMsg: Message, prevMsg?: Message) => {
    if (!prevMsg) return true;

    const currentDate = new Date(currentMsg.timestamp).toDateString();
    const prevDate = new Date(prevMsg.timestamp).toDateString();

    return currentDate !== prevDate;
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isSending) return;

    const messageText = inputText.trim();
    setInputText('');
    setShowQuickReplies(false);
    setIsSending(true);

    // Create optimistic message
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      conversationId,
      senderId: currentUserId,
      senderName: 'Tú',
      content: messageText,
      type: 'text',
      status: 'sending',
      timestamp: new Date().toISOString(),
    };

    // Add optimistic message
    setMessages((prev) => [...prev, optimisticMessage]);

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      const response = await chatService.sendMessage(conversationId, messageText, currentUserId);
      
      if (response.success && response.data) {
        // Replace optimistic message with real one
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === optimisticMessage.id ? response.data : msg
          )
        );
      } else {
        // Mark as failed
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === optimisticMessage.id ? { ...msg, status: 'failed' } : msg
          )
        );
        Alert.alert('Error', response.error?.message || 'No se pudo enviar el mensaje');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      // Mark as failed
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === optimisticMessage.id ? { ...msg, status: 'failed' } : msg
        )
      );
      Alert.alert('Error', 'Error de conexión al enviar el mensaje');
    } finally {
      setIsSending(false);
    }
  };

  const handleRetryMessage = async (failedMessage: Message) => {
    // Remove the failed message
    setMessages((prev) => prev.filter((msg) => msg.id !== failedMessage.id));
    
    // Set the input and let user send again
    setInputText(failedMessage.content);
  };

  const handleQuickReply = (reply: string) => {
    setInputText(reply);
    setShowQuickReplies(false);
  };

  const handleViewProfile = () => {
    if (conversation?.participantType === 'guide') {
      navigation.navigate('GuideDetail', { guideId: participantId });
    }
  };

  const renderMessage = ({ item: message, index }: { item: Message; index: number }) => {
    // Determine if message is from current user
    // Compare as strings to handle type mismatches (number vs string IDs)
    const senderIdStr = String(message.senderId || '').trim();
    const currentUserIdStr = String(currentUserId || '').trim();
    const participantIdStr = String(participantId || '').trim();
    
    // Message is from the OTHER person if senderId matches participantId
    // Otherwise, it's our own message
    const isFromParticipant = senderIdStr === participantIdStr;
    const isOwnMessage = !isFromParticipant;
    
    const prevMessage = index > 0 ? messages[index - 1] : undefined;
    const showDateDivider = shouldShowDateDivider(message, prevMessage);
    const statusConfig = MESSAGE_STATUS_CONFIG[message.status];
    
    // Debug log for first message
    if (index === 0) {
      console.log('🔍 Message debug:', { 
        senderId: senderIdStr, 
        currentUserId: currentUserIdStr, 
        participantId: participantIdStr,
        senderName: message.senderName,
        isFromParticipant,
        isOwn: isOwnMessage 
      });
    }

    return (
      <View>
        {showDateDivider && (
          <View style={styles.dateDivider}>
            <Text style={styles.dateDividerText}>{formatDateDivider(message.timestamp)}</Text>
          </View>
        )}

        <View
          style={[
            styles.messageContainer,
            isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer,
          ]}
        >
          {!isOwnMessage && (
            <View style={styles.messageAvatar}>
              <Text style={styles.messageAvatarText}>{getInitials(message.senderName)}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.messageBubble,
              isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble,
              message.status === 'failed' && styles.failedMessageBubble,
            ]}
            onPress={message.status === 'failed' ? () => handleRetryMessage(message) : undefined}
            activeOpacity={message.status === 'failed' ? 0.7 : 1}
          >
            <Text
              style={[
                styles.messageText,
                isOwnMessage ? styles.ownMessageText : styles.otherMessageText,
              ]}
            >
              {message.content}
            </Text>

            <View style={styles.messageFooter}>
              <Text
                style={[
                  styles.messageTime,
                  isOwnMessage ? styles.ownMessageTime : styles.otherMessageTime,
                ]}
              >
                {formatMessageTime(message.timestamp)}
              </Text>

              {isOwnMessage && (
                <Text
                  style={[
                    styles.messageStatus,
                    message.status === 'read' && styles.messageStatusRead,
                    message.status === 'failed' && styles.messageStatusFailed,
                  ]}
                >
                  {statusConfig.icon}
                </Text>
              )}
            </View>

            {message.status === 'failed' && (
              <Text style={styles.retryHint}>Toca para reintentar</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text style={styles.loadingText}>Cargando mensajes...</Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.loadingContainer}>
      <Text style={styles.errorIcon}>⚠️</Text>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={() => fetchMessages()}>
        <Text style={styles.retryButtonText}>Reintentar</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>💬</Text>
      <Text style={styles.emptyTitle}>Inicia la conversación</Text>
      <Text style={styles.emptyText}>
        Envía un mensaje para comenzar a chatear con {participantName}
      </Text>
    </View>
  );

  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {/* Custom Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.headerContent} 
          onPress={handleViewProfile}
          disabled={conversation?.participantType !== 'guide'}
        >
          <View style={[
            styles.headerAvatar,
            conversation?.participantType === 'guide' && styles.guideHeaderAvatar
          ]}>
            <Text style={styles.headerAvatarText}>{getInitials(participantName)}</Text>
            {conversation?.isOnline && <View style={styles.headerOnlineBadge} />}
          </View>

          <View style={styles.headerInfo}>
            <View style={styles.headerNameRow}>
              <Text style={styles.headerName} numberOfLines={1}>{participantName}</Text>
              {conversation?.isVerified && (
                <View style={styles.headerVerifiedBadge}>
                  <Text style={styles.headerVerifiedIcon}>✓</Text>
                </View>
              )}
            </View>
            <Text style={styles.headerStatus}>
              {conversation?.isOnline ? 'En línea' : 'Última vez recientemente'}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.headerSpacer} />
      </View>

      {/* Related Booking Banner */}
      {conversation?.relatedTourTitle && (
        <TouchableOpacity style={styles.bookingBanner}>
          <Text style={styles.bookingBannerIcon}>🎫</Text>
          <View style={styles.bookingBannerContent}>
            <Text style={styles.bookingBannerTitle}>{conversation.relatedTourTitle}</Text>
            <Text style={styles.bookingBannerSubtitle}>Reserva asociada</Text>
          </View>
          <Text style={styles.bookingBannerArrow}>›</Text>
        </TouchableOpacity>
      )}

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Messages List */}
        {isLoading ? (
          renderLoadingState()
        ) : error ? (
          renderErrorState()
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[
              styles.messagesList,
              messages.length === 0 && styles.messagesListEmpty,
            ]}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmptyState}
            onContentSizeChange={() => {
              if (messages.length > 0) {
                flatListRef.current?.scrollToEnd({ animated: false });
              }
            }}
          />
        )}

        {/* Quick Replies */}
        {showQuickReplies && messages.length === 0 && !isLoading && (
          <View style={styles.quickRepliesContainer}>
            <FlatList
              horizontal
              data={QUICK_REPLIES}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.quickReplyButton}
                  onPress={() => handleQuickReply(item)}
                >
                  <Text style={styles.quickReplyText}>{item}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item, index) => index.toString()}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickRepliesList}
            />
          </View>
        )}

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Escribe un mensaje..."
              placeholderTextColor={Colors.textTertiary}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={1000}
              onFocus={() => setShowQuickReplies(false)}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || isSending) && styles.sendButtonDisabled,
            ]}
            onPress={handleSendMessage}
            disabled={!inputText.trim() || isSending}
          >
            {isSending ? (
              <ActivityIndicator size="small" color={Colors.textInverse} />
            ) : (
              <Text style={styles.sendIcon}>➤</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerSpacer: {
    width: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
    position: 'relative',
  },
  guideHeaderAvatar: {
    backgroundColor: Colors.secondary,
  },
  headerAvatarText: {
    ...Typography.label,
    color: Colors.textInverse,
  },
  headerOnlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.success,
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  headerInfo: {
    flex: 1,
  },
  headerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerName: {
    ...Typography.labelLarge,
    color: Colors.text,
    marginRight: Spacing.xs,
  },
  headerVerifiedBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.info,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerVerifiedIcon: {
    color: Colors.textInverse,
    fontSize: 10,
    fontWeight: '700',
  },
  headerStatus: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  bookingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '10',
    padding: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  bookingBannerIcon: {
    fontSize: 18,
    marginRight: Spacing.sm,
  },
  bookingBannerContent: {
    flex: 1,
  },
  bookingBannerTitle: {
    ...Typography.labelSmall,
    color: Colors.primary,
  },
  bookingBannerSubtitle: {
    ...Typography.labelSmall,
    color: Colors.textSecondary,
  },
  bookingBannerArrow: {
    fontSize: 18,
    color: Colors.primary,
  },
  keyboardAvoid: {
    flex: 1,
  },
  messagesList: {
    padding: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  messagesListEmpty: {
    flex: 1,
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
  errorIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  errorText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
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
  dateDivider: {
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  dateDividerText: {
    ...Typography.labelSmall,
    color: Colors.textTertiary,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.md,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
    maxWidth: '85%',
  },
  ownMessageContainer: {
    alignSelf: 'flex-end',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.xs,
    alignSelf: 'flex-end',
  },
  messageAvatarText: {
    ...Typography.labelSmall,
    color: Colors.primary,
  },
  messageBubble: {
    borderRadius: 18,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    maxWidth: '100%',
  },
  ownMessageBubble: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: Colors.surface,
    borderBottomLeftRadius: 4,
  },
  failedMessageBubble: {
    backgroundColor: Colors.error + '80',
  },
  messageText: {
    ...Typography.body,
    lineHeight: 20,
  },
  ownMessageText: {
    color: Colors.textInverse,
  },
  otherMessageText: {
    color: Colors.text,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 2,
  },
  messageTime: {
    ...Typography.labelSmall,
    fontSize: 11,
  },
  ownMessageTime: {
    color: Colors.textInverse + '90',
  },
  otherMessageTime: {
    color: Colors.textTertiary,
  },
  messageStatus: {
    fontSize: 12,
    marginLeft: 4,
    color: Colors.textInverse + '90',
  },
  messageStatusRead: {
    color: Colors.textInverse,
  },
  messageStatusFailed: {
    color: Colors.textInverse,
  },
  retryHint: {
    ...Typography.caption,
    color: Colors.textInverse,
    fontStyle: 'italic',
    marginTop: 4,
  },
  quickRepliesContainer: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  quickRepliesList: {
    padding: Spacing.sm,
    gap: Spacing.sm,
  },
  quickReplyButton: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickReplyText: {
    ...Typography.label,
    color: Colors.primary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 20,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.sm,
    maxHeight: 100,
  },
  textInput: {
    ...Typography.body,
    color: Colors.text,
    padding: 0,
    maxHeight: 80,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: Colors.disabled,
  },
  sendIcon: {
    fontSize: 18,
    color: Colors.textInverse,
    marginLeft: 2,
  },
});
