import { api, ApiResponse } from './api';

// Types
export type MessageType = 'TEXT' | 'IMAGE' | 'FILE';

export interface Conversation {
  id: string;
  participants: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  }[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: MessageType;
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

export interface CreateConversationRequest {
  participantId: string;
}

export interface SendMessageRequest {
  content: string;
  type?: MessageType;
}

export interface UpdateMessageRequest {
  content: string;
}

// Chat Service
export const chatService = {
  // Get all my conversations
  async getConversations(): Promise<ApiResponse<Conversation[]>> {
    const response = await api.get<ApiResponse<Conversation[]>>('/chat/conversations');
    return response.data;
  },

  // Start a new conversation
  async createConversation(data: CreateConversationRequest): Promise<ApiResponse<Conversation>> {
    const response = await api.post<ApiResponse<Conversation>>('/chat/conversations', data);
    return response.data;
  },

  // Get conversation by ID
  async getConversation(id: string): Promise<ApiResponse<Conversation>> {
    const response = await api.get<ApiResponse<Conversation>>(`/chat/conversations/${id}`);
    return response.data;
  },

  // Get messages in a conversation
  async getMessages(conversationId: string): Promise<ApiResponse<Message[]>> {
    const response = await api.get<ApiResponse<Message[]>>(
      `/chat/conversations/${conversationId}/messages`
    );
    return response.data;
  },

  // Send a message
  async sendMessage(conversationId: string, data: SendMessageRequest): Promise<ApiResponse<Message>> {
    const response = await api.post<ApiResponse<Message>>(
      `/chat/conversations/${conversationId}/messages`,
      data
    );
    return response.data;
  },

  // Edit a message
  async updateMessage(messageId: string, data: UpdateMessageRequest): Promise<ApiResponse<Message>> {
    const response = await api.patch<ApiResponse<Message>>(`/chat/messages/${messageId}`, data);
    return response.data;
  },

  // Delete a message
  async deleteMessage(messageId: string): Promise<ApiResponse<{ message: string }>> {
    const response = await api.delete<ApiResponse<{ message: string }>>(
      `/chat/messages/${messageId}`
    );
    return response.data;
  },

  // Mark conversation as read
  async markAsRead(conversationId: string): Promise<ApiResponse<{ message: string }>> {
    const response = await api.post<ApiResponse<{ message: string }>>(
      `/chat/conversations/${conversationId}/read`
    );
    return response.data;
  },
};

