import { api, ApiResponse } from './api';
import type { Conversation, Message, MessageType } from '../types/chat';

// Backend types (what the API returns)
interface BackendMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'FILE';
  isRead: boolean;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
  sender?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

interface BackendConversation {
  id: string;
  participants: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    role?: string;
  }[];
  lastMessage?: BackendMessage;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
  // Optional fields that might come from backend
  relatedBookingId?: string;
  relatedTourTitle?: string;
}

// Request types
export interface CreateConversationRequest {
  participantId: string;
}

export interface SendMessageRequest {
  content: string;
  type?: 'TEXT' | 'IMAGE' | 'FILE';
}

// Transform backend message to frontend format
const transformMessage = (msg: any, currentUserId: string): Message => {
  // Handle different field names from backend
  const senderId = msg.senderId || msg.sender_id || msg.sender?.id || '';
  const isOwn = senderId === currentUserId;
  
  const senderName = isOwn 
    ? 'Tú' 
    : msg.sender 
      ? `${msg.sender.firstName || msg.sender.first_name || ''} ${msg.sender.lastName || msg.sender.last_name || ''}`.trim() || msg.sender.name || 'Usuario'
      : msg.senderName || 'Usuario';
  
  console.log(`📝 Message transform - senderId: ${senderId}, currentUserId: ${currentUserId}, isOwn: ${isOwn}`);
  
  return {
    id: msg.id,
    conversationId: msg.conversationId || msg.conversation_id || '',
    senderId,
    senderName,
    senderAvatar: msg.sender?.avatar || msg.sender?.avatarUrl,
    content: msg.content || msg.text || msg.message || '',
    type: (msg.type?.toLowerCase() as MessageType) || 'text',
    status: msg.isRead || msg.is_read ? 'read' : 'delivered',
    timestamp: msg.createdAt || msg.created_at || msg.timestamp || new Date().toISOString(),
  };
};

// Transform backend conversation to frontend format
const transformConversation = (conv: any, currentUserId: string): Conversation => {
  // Handle different backend formats
  const participants = conv.participants || [];
  
  // Find the other participant (not the current user)
  let otherParticipant = participants.find((p: any) => p.id !== currentUserId);
  
  // If no other participant found, use the first one or fallback
  if (!otherParticipant && participants.length > 0) {
    otherParticipant = participants[0];
  }
  
  // Handle case where participant info might be directly on conversation
  if (!otherParticipant && conv.participant) {
    otherParticipant = conv.participant;
  }
  
  // Handle case where it's otherUser instead of participants
  if (!otherParticipant && conv.otherUser) {
    otherParticipant = conv.otherUser;
  }
  
  const participantName = otherParticipant 
    ? `${otherParticipant.firstName || otherParticipant.first_name || ''} ${otherParticipant.lastName || otherParticipant.last_name || ''}`.trim() || otherParticipant.name || otherParticipant.email || 'Usuario'
    : conv.participantName || 'Usuario';
  
  const isGuide = otherParticipant?.role === 'guide' || otherParticipant?.role === 'GUIDE';
  
  return {
    id: conv.id,
    participantId: otherParticipant?.id || conv.participantId || '',
    participantName,
    participantAvatar: otherParticipant?.avatar || otherParticipant?.avatarUrl,
    participantType: isGuide ? 'guide' : 'user',
    isVerified: isGuide,
    isOnline: conv.isOnline || false,
    lastMessage: conv.lastMessage ? {
      content: conv.lastMessage.content,
      timestamp: conv.lastMessage.createdAt || conv.lastMessage.timestamp,
      senderId: conv.lastMessage.senderId,
      type: (conv.lastMessage.type?.toLowerCase() as MessageType) || 'text',
    } : undefined,
    unreadCount: conv.unreadCount || 0,
    relatedBookingId: conv.relatedBookingId,
    relatedTourTitle: conv.relatedTourTitle,
    createdAt: conv.createdAt || new Date().toISOString(),
    updatedAt: conv.updatedAt || new Date().toISOString(),
  };
};

// Chat Service
export const chatService = {
  // Get all my conversations
  async getConversations(currentUserId: string): Promise<ApiResponse<Conversation[]>> {
    try {
      const response = await api.get<ApiResponse<BackendConversation[]>>('/chat/conversations');
      
      console.log('📨 Chat conversations response:', JSON.stringify(response.data, null, 2));
      
      if (response.data.success) {
        const conversationsData = response.data.data;
        
        // Handle case where data might be null/undefined
        if (!conversationsData || !Array.isArray(conversationsData)) {
          console.log('⚠️ No conversations data or invalid format');
          return {
            success: true,
            data: [],
          };
        }
        
        const transformed = conversationsData.map(conv => {
          try {
            return transformConversation(conv, currentUserId);
          } catch (e) {
            console.error('Error transforming conversation:', e, conv);
            return null;
          }
        }).filter(Boolean) as Conversation[];
        
        return {
          success: true,
          data: transformed,
        };
      }
      
      return {
        success: false,
        data: [],
        error: { message: response.data.error?.message || 'Error al obtener conversaciones' },
      };
    } catch (error: any) {
      console.error('Error fetching conversations:', error?.message || error);
      
      // If it's a 404, the endpoint might not exist yet - return empty
      if (error?.response?.status === 404) {
        return {
          success: true,
          data: [],
        };
      }
      
      return {
        success: false,
        data: [],
        error: { message: error?.response?.data?.error?.message || 'Error de conexión' },
      };
    }
  },

  // Start a new conversation or get existing one
  async createConversation(participantId: string): Promise<ApiResponse<Conversation>> {
    try {
      const response = await api.post<ApiResponse<BackendConversation>>('/chat/conversations', {
        participantId,
      });
      
      if (response.data.success && response.data.data) {
        return {
          success: true,
          data: transformConversation(response.data.data, ''), // Will be updated on fetch
        };
      }
      
      return {
        success: false,
        data: null as any,
        error: { message: 'Error al crear conversación' },
      };
    } catch (error: any) {
      console.error('Error creating conversation:', error);
      return {
        success: false,
        data: null as any,
        error: { message: error?.response?.data?.error?.message || 'Error de conexión' },
      };
    }
  },

  // Get conversation by ID
  async getConversation(id: string, currentUserId: string): Promise<ApiResponse<Conversation>> {
    try {
      const response = await api.get<ApiResponse<BackendConversation>>(`/chat/conversations/${id}`);
      
      if (response.data.success && response.data.data) {
        return {
          success: true,
          data: transformConversation(response.data.data, currentUserId),
        };
      }
      
      return {
        success: false,
        data: null as any,
        error: { message: 'Conversación no encontrada' },
      };
    } catch (error: any) {
      console.error('Error fetching conversation:', error);
      return {
        success: false,
        data: null as any,
        error: { message: error?.response?.data?.error?.message || 'Error de conexión' },
      };
    }
  },

  // Get messages in a conversation
  async getMessages(conversationId: string, currentUserId: string): Promise<ApiResponse<Message[]>> {
    try {
      const response = await api.get<ApiResponse<BackendMessage[]>>(
        `/chat/conversations/${conversationId}/messages`
      );
      
      console.log('📨 Chat messages response:', JSON.stringify(response.data, null, 2));
      
      if (response.data.success) {
        const messagesData = response.data.data;
        
        if (!messagesData || !Array.isArray(messagesData)) {
          return {
            success: true,
            data: [],
          };
        }
        
        const transformed = messagesData.map(msg => {
          try {
            return transformMessage(msg, currentUserId);
          } catch (e) {
            console.error('Error transforming message:', e, msg);
            return null;
          }
        }).filter(Boolean) as Message[];
        
        return {
          success: true,
          data: transformed,
        };
      }
      
      return {
        success: false,
        data: [],
        error: { message: response.data.error?.message || 'Error al obtener mensajes' },
      };
    } catch (error: any) {
      console.error('Error fetching messages:', error?.message || error);
      
      if (error?.response?.status === 404) {
        return {
          success: true,
          data: [],
        };
      }
      
      return {
        success: false,
        data: [],
        error: { message: error?.response?.data?.error?.message || 'Error de conexión' },
      };
    }
  },

  // Send a message
  async sendMessage(
    conversationId: string, 
    content: string, 
    currentUserId: string,
    type: 'TEXT' | 'IMAGE' | 'FILE' = 'TEXT'
  ): Promise<ApiResponse<Message>> {
    try {
      const response = await api.post<ApiResponse<BackendMessage>>(
        `/chat/conversations/${conversationId}/messages`,
        { content, type }
      );
      
      if (response.data.success && response.data.data) {
        return {
          success: true,
          data: transformMessage(response.data.data, currentUserId),
        };
      }
      
      return {
        success: false,
        data: null as any,
        error: { message: 'Error al enviar mensaje' },
      };
    } catch (error: any) {
      console.error('Error sending message:', error);
      return {
        success: false,
        data: null as any,
        error: { message: error?.response?.data?.error?.message || 'Error de conexión' },
      };
    }
  },

  // Mark conversation as read
  async markAsRead(conversationId: string): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await api.post<ApiResponse<{ message: string }>>(
        `/chat/conversations/${conversationId}/read`
      );
      return response.data;
    } catch (error: any) {
      console.error('Error marking as read:', error);
      return {
        success: false,
        data: { message: '' },
        error: { message: error?.response?.data?.error?.message || 'Error de conexión' },
      };
    }
  },

  // Delete a message
  async deleteMessage(messageId: string): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await api.delete<ApiResponse<{ message: string }>>(
        `/chat/messages/${messageId}`
      );
      return response.data;
    } catch (error: any) {
      console.error('Error deleting message:', error);
      return {
        success: false,
        data: { message: '' },
        error: { message: error?.response?.data?.error?.message || 'Error de conexión' },
      };
    }
  },

  // Get unread count
  async getUnreadCount(): Promise<ApiResponse<{ count: number }>> {
    try {
      const response = await api.get<ApiResponse<{ count: number }>>('/chat/unread-count');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching unread count:', error);
      return {
        success: false,
        data: { count: 0 },
        error: { message: error?.response?.data?.error?.message || 'Error de conexión' },
      };
    }
  },
};
