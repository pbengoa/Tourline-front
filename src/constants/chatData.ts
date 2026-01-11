import type { Conversation, Message } from '../types/chat';

// Current user ID (mock)
export const CURRENT_USER_ID = 'current-user';
export const CURRENT_USER_NAME = 'Tú';

// Mock conversations
export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    participantId: '1',
    participantName: 'María García',
    participantType: 'guide',
    isVerified: true,
    isOnline: true,
    lastMessage: {
      content: '¡Perfecto! Nos vemos en la Plaza Mayor a las 10:00. Llevaré un paraguas rojo para que me identifiques.',
      timestamp: '2026-01-11T09:30:00Z',
      senderId: '1',
      type: 'text',
    },
    unreadCount: 1,
    relatedBookingId: 'booking-1',
    relatedTourTitle: 'Madrid de los Austrias',
    createdAt: '2026-01-08T10:30:00Z',
    updatedAt: '2026-01-11T09:30:00Z',
  },
  {
    id: 'conv-2',
    participantId: '4',
    participantName: 'Pedro Sánchez',
    participantType: 'guide',
    isVerified: true,
    isOnline: false,
    lastMessage: {
      content: 'Sí, puedo hacer el tour en inglés sin problema. ¿Hay algo más que necesiten saber?',
      timestamp: '2026-01-10T14:20:00Z',
      senderId: '4',
      type: 'text',
    },
    unreadCount: 0,
    relatedBookingId: 'booking-2',
    relatedTourTitle: 'Alhambra al Atardecer',
    createdAt: '2026-01-10T09:15:00Z',
    updatedAt: '2026-01-10T14:20:00Z',
  },
  {
    id: 'conv-3',
    participantId: '2',
    participantName: 'Carlos Rodríguez',
    participantType: 'guide',
    isVerified: true,
    isOnline: false,
    lastMessage: {
      content: '¡Gracias por venir! Espero que disfrutaran del tour de tapas. ¿Les gustaría dejar una reseña?',
      timestamp: '2025-12-29T00:15:00Z',
      senderId: '2',
      type: 'text',
    },
    unreadCount: 0,
    relatedBookingId: 'booking-3',
    relatedTourTitle: 'Tapas y Vinos en Barcelona',
    createdAt: '2025-12-20T11:00:00Z',
    updatedAt: '2025-12-29T00:15:00Z',
  },
];

// Mock messages for conversation 1
export const MOCK_MESSAGES_CONV_1: Message[] = [
  {
    id: 'msg-1-1',
    conversationId: 'conv-1',
    senderId: CURRENT_USER_ID,
    senderName: CURRENT_USER_NAME,
    content: '¡Hola María! Acabo de reservar el tour "Madrid de los Austrias" para el día 15. Estamos muy emocionados.',
    type: 'text',
    status: 'read',
    timestamp: '2026-01-08T10:35:00Z',
  },
  {
    id: 'msg-1-2',
    conversationId: 'conv-1',
    senderId: '1',
    senderName: 'María García',
    content: '¡Hola! Me alegra mucho que hayas reservado. Va a ser un tour fantástico. ¿Es tu primera vez en Madrid?',
    type: 'text',
    status: 'read',
    timestamp: '2026-01-08T11:20:00Z',
  },
  {
    id: 'msg-1-3',
    conversationId: 'conv-1',
    senderId: CURRENT_USER_ID,
    senderName: CURRENT_USER_NAME,
    content: 'Sí, es nuestra primera vez. Venimos con mi pareja y queremos conocer la historia de la ciudad.',
    type: 'text',
    status: 'read',
    timestamp: '2026-01-08T11:25:00Z',
  },
  {
    id: 'msg-1-4',
    conversationId: 'conv-1',
    senderId: '1',
    senderName: 'María García',
    content: '¡Excelente! Les va a encantar. El Madrid de los Austrias tiene una historia fascinante. ¿Tienen alguna preferencia especial o algo que les gustaría ver en particular?',
    type: 'text',
    status: 'read',
    timestamp: '2026-01-08T14:00:00Z',
  },
  {
    id: 'msg-1-5',
    conversationId: 'conv-1',
    senderId: CURRENT_USER_ID,
    senderName: CURRENT_USER_NAME,
    content: 'Nos encantaría conocer los lugares donde vivieron los reyes y también algunos sitios menos conocidos si es posible.',
    type: 'text',
    status: 'read',
    timestamp: '2026-01-08T14:30:00Z',
  },
  {
    id: 'msg-1-6',
    conversationId: 'conv-1',
    senderId: '1',
    senderName: 'María García',
    content: 'Por supuesto, tengo algunos secretos guardados que no están en las guías turísticas 😊 Os llevaré por patios escondidos y callejones con mucha historia.',
    type: 'text',
    status: 'read',
    timestamp: '2026-01-08T15:00:00Z',
  },
  {
    id: 'msg-1-7',
    conversationId: 'conv-1',
    senderId: CURRENT_USER_ID,
    senderName: CURRENT_USER_NAME,
    content: '¡Genial! Por cierto, ¿hay algún lugar para tomar café cerca del punto de encuentro? Llegaremos un poco antes.',
    type: 'text',
    status: 'read',
    timestamp: '2026-01-10T18:00:00Z',
  },
  {
    id: 'msg-1-8',
    conversationId: 'conv-1',
    senderId: '1',
    senderName: 'María García',
    content: 'Sí, hay varios cafés excelentes. Os recomiendo "La Mallorquina" en la misma Plaza Mayor, tienen unos churros increíbles.',
    type: 'text',
    status: 'read',
    timestamp: '2026-01-10T18:30:00Z',
  },
  {
    id: 'msg-1-9',
    conversationId: 'conv-1',
    senderId: CURRENT_USER_ID,
    senderName: CURRENT_USER_NAME,
    content: '¿Dónde exactamente nos encontramos en la Plaza Mayor?',
    type: 'text',
    status: 'read',
    timestamp: '2026-01-11T09:00:00Z',
  },
  {
    id: 'msg-1-10',
    conversationId: 'conv-1',
    senderId: '1',
    senderName: 'María García',
    content: '¡Perfecto! Nos vemos en la Plaza Mayor a las 10:00. Llevaré un paraguas rojo para que me identifiques.',
    type: 'text',
    status: 'delivered',
    timestamp: '2026-01-11T09:30:00Z',
  },
];

// Mock messages for conversation 2
export const MOCK_MESSAGES_CONV_2: Message[] = [
  {
    id: 'msg-2-1',
    conversationId: 'conv-2',
    senderId: CURRENT_USER_ID,
    senderName: CURRENT_USER_NAME,
    content: 'Hola Pedro, he reservado el tour de la Alhambra para 4 personas. Somos todos adultos.',
    type: 'text',
    status: 'read',
    timestamp: '2026-01-10T09:20:00Z',
  },
  {
    id: 'msg-2-2',
    conversationId: 'conv-2',
    senderId: '4',
    senderName: 'Pedro Sánchez',
    content: '¡Hola! Muchas gracias por la reserva. La Alhambra al atardecer es una experiencia mágica. ¿Habéis estado antes en Granada?',
    type: 'text',
    status: 'read',
    timestamp: '2026-01-10T10:00:00Z',
  },
  {
    id: 'msg-2-3',
    conversationId: 'conv-2',
    senderId: CURRENT_USER_ID,
    senderName: CURRENT_USER_NAME,
    content: 'No, es la primera vez para todos. Por cierto, ¿es posible hacer el tour también en inglés? Uno de nosotros no habla español.',
    type: 'text',
    status: 'read',
    timestamp: '2026-01-10T10:15:00Z',
  },
  {
    id: 'msg-2-4',
    conversationId: 'conv-2',
    senderId: '4',
    senderName: 'Pedro Sánchez',
    content: 'Sí, puedo hacer el tour en inglés sin problema. ¿Hay algo más que necesiten saber?',
    type: 'text',
    status: 'read',
    timestamp: '2026-01-10T14:20:00Z',
  },
];

// Mock messages for conversation 3
export const MOCK_MESSAGES_CONV_3: Message[] = [
  {
    id: 'msg-3-1',
    conversationId: 'conv-3',
    senderId: '2',
    senderName: 'Carlos Rodríguez',
    content: '¡Bienvenidos al tour de Tapas y Vinos! Os espero en el punto de encuentro.',
    type: 'text',
    status: 'read',
    timestamp: '2025-12-28T18:45:00Z',
  },
  {
    id: 'msg-3-2',
    conversationId: 'conv-3',
    senderId: CURRENT_USER_ID,
    senderName: CURRENT_USER_NAME,
    content: '¡Estamos llegando! 5 minutos.',
    type: 'text',
    status: 'read',
    timestamp: '2025-12-28T18:55:00Z',
  },
  {
    id: 'msg-3-3',
    conversationId: 'conv-3',
    senderId: '2',
    senderName: 'Carlos Rodríguez',
    content: '¡Gracias por venir! Espero que disfrutaran del tour de tapas. ¿Les gustaría dejar una reseña?',
    type: 'text',
    status: 'read',
    timestamp: '2025-12-29T00:15:00Z',
  },
];

// Helper to get messages by conversation ID
export const getMessagesByConversationId = (conversationId: string): Message[] => {
  switch (conversationId) {
    case 'conv-1':
      return MOCK_MESSAGES_CONV_1;
    case 'conv-2':
      return MOCK_MESSAGES_CONV_2;
    case 'conv-3':
      return MOCK_MESSAGES_CONV_3;
    default:
      return [];
  }
};

// Quick reply suggestions
export const QUICK_REPLIES = [
  '¡Hola! 👋',
  '¿Tienes disponibilidad?',
  '¿Cuánto dura el tour?',
  'Perfecto, gracias',
  '¿Dónde nos encontramos?',
];

