import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography } from '../../theme';
import {
  getMessagesByConversationId,
  CURRENT_USER_ID,
  MOCK_CONVERSATIONS,
  QUICK_REPLIES,
} from '../../constants/chatData';
import { MESSAGE_STATUS_CONFIG } from '../../types/chat';
import type { RootStackScreenProps, Message } from '../../types';

type Props = RootStackScreenProps<'Chat'>;

export const ChatScreen: React.FC<Props> = ({ route, navigation }) => {
  const { conversationId, participantName, participantId } = route.params;

  const conversation = MOCK_CONVERSATIONS.find((c) => c.id === conversationId);
  const initialMessages = getMessagesByConversationId(conversationId);

  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);

  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Scroll to bottom on mount
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: false });
    }, 100);
  }, []);

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

    // Create new message with 'sending' status
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      conversationId,
      senderId: CURRENT_USER_ID,
      senderName: 'Tú',
      content: messageText,
      type: 'text',
      status: 'sending',
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage]);

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Simulate sending delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Update message status to 'sent'
    setMessages((prev) =>
      prev.map((msg) => (msg.id === newMessage.id ? { ...msg, status: 'sent' } : msg))
    );

    // Simulate delivery after another delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setMessages((prev) =>
      prev.map((msg) => (msg.id === newMessage.id ? { ...msg, status: 'delivered' } : msg))
    );

    setIsSending(false);

    // Simulate auto-reply for demo purposes (30% chance)
    if (Math.random() > 0.7) {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const autoReplies = [
        '¡Perfecto! Lo tengo en cuenta.',
        '¡Gracias por el mensaje!',
        'De acuerdo, nos vemos pronto.',
        '👍',
      ];

      const replyMessage: Message = {
        id: `msg-${Date.now()}`,
        conversationId,
        senderId: participantId,
        senderName: participantName,
        content: autoReplies[Math.floor(Math.random() * autoReplies.length)],
        type: 'text',
        status: 'delivered',
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, replyMessage]);

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const handleQuickReply = (reply: string) => {
    setInputText(reply);
    setShowQuickReplies(false);
  };

  const handleViewProfile = () => {
    navigation.navigate('GuideDetail', { guideId: participantId });
  };

  const renderMessage = ({ item: message, index }: { item: Message; index: number }) => {
    const isOwnMessage = message.senderId === CURRENT_USER_ID;
    const prevMessage = index > 0 ? messages[index - 1] : undefined;
    const showDateDivider = shouldShowDateDivider(message, prevMessage);
    const statusConfig = MESSAGE_STATUS_CONFIG[message.status];

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

          <View
            style={[
              styles.messageBubble,
              isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble,
            ]}
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
          </View>
        </View>
      </View>
    );
  };

  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {/* Custom Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.headerContent} onPress={handleViewProfile}>
          <View style={styles.headerAvatar}>
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
              {conversation?.isOnline ? 'En línea' : 'Última vez hoy'}
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
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />

        {/* Quick Replies */}
        {showQuickReplies && messages.length > 0 && (
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
            <Text style={styles.sendIcon}>➤</Text>
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
  backIcon: {
    fontSize: 32,
    color: Colors.primary,
    marginTop: -4,
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
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 20,
    color: Colors.text,
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
    color: Colors.error,
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
