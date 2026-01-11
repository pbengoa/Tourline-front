/**
 * Chat system types
 */

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
export type MessageType = 'text' | 'image' | 'booking' | 'system';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  type: MessageType;
  status: MessageStatus;
  timestamp: string;
  // For booking messages
  bookingId?: string;
  // For image messages
  imageUrl?: string;
}

export interface Conversation {
  id: string;

  // Participant info (the other person - guide or user)
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  participantType: 'guide' | 'user';
  isVerified?: boolean;
  isOnline?: boolean;

  // Last message preview
  lastMessage?: {
    content: string;
    timestamp: string;
    senderId: string;
    type: MessageType;
  };

  // Unread count
  unreadCount: number;

  // Related booking (if any)
  relatedBookingId?: string;
  relatedTourTitle?: string;

  // Timestamps
  createdAt: string;
  updatedAt: string;

  // Muted
  isMuted?: boolean;
}

export interface ChatState {
  conversations: Conversation[];
  activeConversation: string | null;
  messages: Record<string, Message[]>;
  isLoading: boolean;
  error: string | null;
}

export const MESSAGE_STATUS_CONFIG: Record<
  MessageStatus,
  {
    icon: string;
    label: string;
  }
> = {
  sending: { icon: '○', label: 'Enviando' },
  sent: { icon: '✓', label: 'Enviado' },
  delivered: { icon: '✓✓', label: 'Entregado' },
  read: { icon: '✓✓', label: 'Leído' },
  failed: { icon: '!', label: 'Error' },
};
