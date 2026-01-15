/**
 * App Configuration - Hardcoded Data
 * 
 * These values are static and rarely change.
 * Loading them from the backend would add unnecessary latency.
 */

// ============ CATEGORIES ============
export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  description?: string;
}

export const CATEGORIES: Category[] = [
  { id: 'nature', name: 'Naturaleza', icon: '🏔️', color: '#2D5A27', description: 'Parques, trekking y paisajes' },
  { id: 'culture', name: 'Cultura', icon: '🏛️', color: '#8B4513', description: 'Museos, tradiciones y arte' },
  { id: 'gastronomy', name: 'Gastronomía', icon: '🍷', color: '#722F37', description: 'Vinos, cocina local y sabores' },
  { id: 'adventure', name: 'Aventura', icon: '🧗', color: '#E67E22', description: 'Deportes extremos y adrenalina' },
  { id: 'history', name: 'Historia', icon: '📜', color: '#6B4423', description: 'Sitios históricos y patrimonio' },
  { id: 'photography', name: 'Fotografía', icon: '📷', color: '#34495E', description: 'Tours fotográficos y miradores' },
  { id: 'wildlife', name: 'Fauna', icon: '🦙', color: '#16A085', description: 'Avistamiento de animales' },
  { id: 'wellness', name: 'Bienestar', icon: '🧘', color: '#9B59B6', description: 'Termas, spa y relax' },
];

// ============ DIFFICULTY LEVELS ============
export interface DifficultyLevel {
  id: 'EASY' | 'MODERATE' | 'HARD' | 'EXPERT';
  name: string;
  icon: string;
  color: string;
  description: string;
}

export const DIFFICULTY_LEVELS: DifficultyLevel[] = [
  { id: 'EASY', name: 'Fácil', icon: '🟢', color: '#27AE60', description: 'Apto para todos, sin esfuerzo físico' },
  { id: 'MODERATE', name: 'Moderado', icon: '🟡', color: '#F1C40F', description: 'Condición física básica requerida' },
  { id: 'HARD', name: 'Difícil', icon: '🟠', color: '#E67E22', description: 'Buena condición física necesaria' },
  { id: 'EXPERT', name: 'Experto', icon: '🔴', color: '#E74C3C', description: 'Experiencia previa requerida' },
];

// ============ LANGUAGES ============
export interface Language {
  code: string;
  name: string;
  flag: string;
  nativeName: string;
}

export const LANGUAGES: Language[] = [
  { code: 'es', name: 'Español', flag: '🇪🇸', nativeName: 'Español' },
  { code: 'en', name: 'Inglés', flag: '🇬🇧', nativeName: 'English' },
  { code: 'pt', name: 'Portugués', flag: '🇧🇷', nativeName: 'Português' },
  { code: 'fr', name: 'Francés', flag: '🇫🇷', nativeName: 'Français' },
  { code: 'de', name: 'Alemán', flag: '🇩🇪', nativeName: 'Deutsch' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹', nativeName: 'Italiano' },
  { code: 'zh', name: 'Chino', flag: '🇨🇳', nativeName: '中文' },
  { code: 'ja', name: 'Japonés', flag: '🇯🇵', nativeName: '日本語' },
];

// ============ CURRENCIES ============
export interface Currency {
  code: string;
  symbol: string;
  name: string;
  decimals: number;
}

export const CURRENCIES: Currency[] = [
  { code: 'CLP', symbol: '$', name: 'Peso Chileno', decimals: 0 },
  { code: 'USD', symbol: '$', name: 'Dólar Estadounidense', decimals: 2 },
  { code: 'EUR', symbol: '€', name: 'Euro', decimals: 2 },
];

// ============ BOOKING STATUS ============
export interface BookingStatusConfig {
  label: string;
  color: string;
  bgColor: string;
  icon: string;
  description: string;
}

export const BOOKING_STATUS: Record<string, BookingStatusConfig> = {
  PENDING: { 
    label: 'Pendiente', 
    color: '#F39C12', 
    bgColor: '#FEF9E7',
    icon: '⏳', 
    description: 'Esperando confirmación de la empresa' 
  },
  CONFIRMED: { 
    label: 'Confirmada', 
    color: '#27AE60', 
    bgColor: '#E8F8F5',
    icon: '✅', 
    description: 'Tu reserva está confirmada' 
  },
  CANCELLED_USER: { 
    label: 'Cancelada', 
    color: '#E74C3C', 
    bgColor: '#FDEDEC',
    icon: '❌', 
    description: 'Cancelada por ti' 
  },
  CANCELLED_COMPANY: { 
    label: 'Cancelada', 
    color: '#E74C3C', 
    bgColor: '#FDEDEC',
    icon: '❌', 
    description: 'Cancelada por la empresa' 
  },
  COMPLETED: { 
    label: 'Completada', 
    color: '#3498DB', 
    bgColor: '#EBF5FB',
    icon: '🎉', 
    description: 'Tour realizado' 
  },
  NO_SHOW: { 
    label: 'No asistió', 
    color: '#95A5A6', 
    bgColor: '#F4F6F6',
    icon: '👻', 
    description: 'No te presentaste al tour' 
  },
  REFUNDED: { 
    label: 'Reembolsada', 
    color: '#9B59B6', 
    bgColor: '#F5EEF8',
    icon: '💸', 
    description: 'Monto reembolsado' 
  },
};

// ============ PRICE RANGES ============
export interface PriceRange {
  min: number;
  max: number | null;
  label: string;
  icon: string;
}

export const PRICE_RANGES: PriceRange[] = [
  { min: 0, max: 20000, label: 'Económico', icon: '💰' },
  { min: 20000, max: 50000, label: 'Moderado', icon: '💵' },
  { min: 50000, max: 100000, label: 'Premium', icon: '💎' },
  { min: 100000, max: null, label: 'Lujo', icon: '👑' },
];

// ============ SORT OPTIONS ============
export interface SortOption {
  value: string;
  label: string;
  icon: string;
}

export const SORT_OPTIONS: SortOption[] = [
  { value: 'rating', label: 'Mejor valorados', icon: '⭐' },
  { value: 'price_asc', label: 'Precio: menor a mayor', icon: '📉' },
  { value: 'price_desc', label: 'Precio: mayor a menor', icon: '📈' },
  { value: 'reviews', label: 'Más reseñas', icon: '💬' },
  { value: 'newest', label: 'Más recientes', icon: '🆕' },
  { value: 'duration_asc', label: 'Duración: corto a largo', icon: '⏱️' },
];

// ============ DURATION RANGES ============
export interface DurationRange {
  min: number;  // minutes
  max: number | null;
  label: string;
}

export const DURATION_RANGES: DurationRange[] = [
  { min: 0, max: 120, label: 'Hasta 2 horas' },
  { min: 120, max: 240, label: '2-4 horas' },
  { min: 240, max: 480, label: 'Medio día (4-8h)' },
  { min: 480, max: null, label: 'Día completo (8h+)' },
];

// ============ CITY COORDINATES (Chile) ============
export interface CityCoordinates {
  latitude: number;
  longitude: number;
}

export const CITY_COORDINATES: Record<string, CityCoordinates> = {
  // Región Metropolitana
  'Santiago': { latitude: -33.4489, longitude: -70.6693 },
  'Santiago, Chile': { latitude: -33.4489, longitude: -70.6693 },
  'Providencia': { latitude: -33.4328, longitude: -70.6102 },
  'Las Condes': { latitude: -33.4103, longitude: -70.5678 },
  
  // Cajón del Maipo
  'Cajón del Maipo': { latitude: -33.6419, longitude: -70.0929 },
  'San José de Maipo': { latitude: -33.6419, longitude: -70.3502 },
  'San Alfonso': { latitude: -33.7167, longitude: -70.2333 },
  'El Morado': { latitude: -33.8167, longitude: -70.0667 },
  
  // Valparaíso
  'Valparaíso': { latitude: -33.0472, longitude: -71.6127 },
  'Valparaíso, Chile': { latitude: -33.0472, longitude: -71.6127 },
  'Viña del Mar': { latitude: -33.0153, longitude: -71.5500 },
  'Casablanca': { latitude: -33.3200, longitude: -71.4000 },
  
  // Norte
  'San Pedro de Atacama': { latitude: -22.9087, longitude: -68.1997 },
  'Atacama': { latitude: -23.6509, longitude: -70.3975 },
  'Calama': { latitude: -22.4667, longitude: -68.9333 },
  'Iquique': { latitude: -20.2208, longitude: -70.1431 },
  'Arica': { latitude: -18.4783, longitude: -70.3126 },
  'La Serena': { latitude: -29.9027, longitude: -71.2519 },
  'Coquimbo': { latitude: -29.9533, longitude: -71.3436 },
  
  // Centro-Sur
  'Rancagua': { latitude: -34.1708, longitude: -70.7444 },
  'Talca': { latitude: -35.4264, longitude: -71.6553 },
  'Concepción': { latitude: -36.8270, longitude: -73.0503 },
  
  // Sur
  'Temuco': { latitude: -38.7359, longitude: -72.5904 },
  'Villarrica': { latitude: -39.2856, longitude: -72.2272 },
  'Pucón': { latitude: -39.2708, longitude: -71.9772 },
  'Puerto Varas': { latitude: -41.3167, longitude: -72.9833 },
  'Puerto Montt': { latitude: -41.4689, longitude: -72.9411 },
  'Frutillar': { latitude: -41.1167, longitude: -73.0667 },
  'Ancud': { latitude: -41.8697, longitude: -73.8264 },
  'Castro': { latitude: -42.4800, longitude: -73.7622 },
  
  // Patagonia
  'Coyhaique': { latitude: -45.5712, longitude: -72.0662 },
  'Torres del Paine': { latitude: -50.9423, longitude: -73.4068 },
  'Puerto Natales': { latitude: -51.7230, longitude: -72.4977 },
  'Punta Arenas': { latitude: -53.1638, longitude: -70.9171 },
  
  // Islas
  'Isla de Pascua': { latitude: -27.1127, longitude: -109.3497 },
  'Rapa Nui': { latitude: -27.1127, longitude: -109.3497 },
  'Easter Island': { latitude: -27.1127, longitude: -109.3497 },
};

// ============ DEFAULT MAP REGION (Chile) ============
export const DEFAULT_MAP_REGION = {
  latitude: -33.4489,
  longitude: -70.6693,
  latitudeDelta: 8,
  longitudeDelta: 8,
};

// ============ APP CONSTANTS ============
export const APP_CONSTANTS = {
  MIN_BOOKING_ADVANCE_HOURS: 24,
  MAX_PARTICIPANTS_DEFAULT: 15,
  MAX_IMAGES_PER_TOUR: 10,
  REVIEW_MIN_LENGTH: 20,
  REVIEW_MAX_LENGTH: 1000,
  SEARCH_DEBOUNCE_MS: 300,
  ANIMATION_DURATION_MS: 300,
  TOAST_DURATION_MS: 3000,
  REFRESH_INTERVAL_MS: 30000,
};

// ============ NOTIFICATION TYPES (for UI) ============
export const NOTIFICATION_TYPES = {
  booking_confirmed: { icon: '✅', color: '#27AE60', title: 'Reserva Confirmada' },
  booking_cancelled: { icon: '❌', color: '#E74C3C', title: 'Reserva Cancelada' },
  booking_reminder: { icon: '⏰', color: '#F39C12', title: 'Recordatorio' },
  review_received: { icon: '⭐', color: '#F1C40F', title: 'Nueva Reseña' },
  review_response: { icon: '💬', color: '#3498DB', title: 'Respuesta a Reseña' },
  promotion: { icon: '🎉', color: '#9B59B6', title: 'Promoción' },
  system: { icon: 'ℹ️', color: '#34495E', title: 'Sistema' },
  chat_message: { icon: '💬', color: '#1ABC9C', title: 'Nuevo Mensaje' },
};

// ============ HELPER FUNCTIONS ============

/**
 * Get category by ID
 */
export const getCategoryById = (id: string): Category | undefined => {
  return CATEGORIES.find((c) => c.id === id);
};

/**
 * Get difficulty level by ID
 */
export const getDifficultyById = (id: string): DifficultyLevel | undefined => {
  return DIFFICULTY_LEVELS.find((d) => d.id === id);
};

/**
 * Get language by code
 */
export const getLanguageByCode = (code: string): Language | undefined => {
  return LANGUAGES.find((l) => l.code === code);
};

/**
 * Get booking status config
 */
export const getBookingStatusConfig = (status: string): BookingStatusConfig => {
  return BOOKING_STATUS[status] || BOOKING_STATUS.PENDING;
};

/**
 * Format price with currency
 */
export const formatPrice = (price: number, currencyCode: string = 'CLP'): string => {
  const currency = CURRENCIES.find((c) => c.code === currencyCode);
  if (!currency) return `${price}`;
  
  if (currency.decimals === 0) {
    return `${currency.symbol}${price.toLocaleString('es-CL')}`;
  }
  return `${currency.symbol}${price.toFixed(currency.decimals)}`;
};

/**
 * Format duration from minutes to human readable
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}min`;
};

/**
 * Get coordinates for a location string
 */
export const getCoordinates = (location: string): CityCoordinates | null => {
  // Direct match
  if (CITY_COORDINATES[location]) {
    return CITY_COORDINATES[location];
  }
  
  // Try with ", Chile" suffix
  const withChile = `${location}, Chile`;
  if (CITY_COORDINATES[withChile]) {
    return CITY_COORDINATES[withChile];
  }
  
  // Try extracting city name
  const cityPart = location.split(',')[0].trim();
  if (CITY_COORDINATES[cityPart]) {
    return CITY_COORDINATES[cityPart];
  }
  
  // Fuzzy match
  const locationLower = location.toLowerCase();
  for (const [key, coords] of Object.entries(CITY_COORDINATES)) {
    if (locationLower.includes(key.toLowerCase()) || key.toLowerCase().includes(locationLower)) {
      return coords;
    }
  }
  
  return null;
};

