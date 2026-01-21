// API Configuration
export { api, API_CONFIG, TOKEN_KEY, USER_KEY, getErrorMessage } from './api';
export type { ApiResponse, ApiError } from './api';

// Auth Service
export { authService } from './authService';
export type {
  User,
  UserRole,
  Company,
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  ChangePasswordRequest,
} from './authService';

// Admin Service
export { adminService } from './adminService';
export type {
  AdminTour,
  AdminGuide,
  AdminBooking,
  DashboardStats,
  DashboardData,
  BookingStats as AdminBookingStats,
  TourStatus,
  GuideStatus,
  BookingStatus as AdminBookingStatus,
  CreateTourRequest,
  CreateGuideRequest,
  PaginatedResponse,
} from './adminService';

// Profile Service
export { profileService } from './profileService';
export type { UpdateProfileRequest, UpdateAvatarRequest } from './profileService';

// Guides Service
export { guidesService } from './guidesService';
export type {
  Guide,
  Review,
  Specialty,
  SearchGuidesParams,
  CreateGuideRequest,
  CreateReviewRequest,
  GuideStats,
} from './guidesService';

// Tours Service
export { toursService } from './toursService';
export type { ApiTour, SearchToursParams } from './toursService';

// Bookings Service
export { bookingsService } from './bookingsService';
export type {
  Booking,
  BookingStatus,
  BookingCompany,
  BookingTour,
  TourCalendarDay,
  TourCalendarSlot,
  TourCalendarResponse,
  CreateBookingRequest,
  UpdateBookingRequest,
  CancelBookingRequest,
  BookingStats,
} from './bookingsService';

// Chat Service
export { chatService } from './chatService';
export type {
  Conversation,
  Message,
  MessageType,
  CreateConversationRequest,
  SendMessageRequest,
  UpdateMessageRequest,
} from './chatService';

// Files Service
export { filesService } from './filesService';
export type {
  FileInfo,
  FileCategory,
  UploadFileRequest,
  UpdateFileRequest,
  StorageStats,
} from './filesService';

// Image Service (S3 Upload utilities)
export {
  pickImage,
  takePhoto,
  compressImage,
  uploadImage,
  uploadAvatar,
  uploadTourImage,
  uploadGalleryImages,
  deleteImage,
  getPlaceholderImage,
  pickAndUploadAvatar,
  takeAndUploadAvatar,
  requestCameraPermission,
  requestMediaLibraryPermission,
  IMAGE_QUALITY,
  IMAGE_MAX_SIZE,
} from './imageService';

// ============ NEW SERVICES ============

// Regions Service
export { regionsService } from './regionsService';
export type { Region, RegionWithTours } from './regionsService';

// Banners Service
export { bannersService } from './bannersService';
export type { Banner, BannerActionType, BannerPlacement } from './bannersService';

// Favorites Service
export { favoritesService } from './favoritesService';
export type { Favorite, FavoriteTour } from './favoritesService';

// Notifications Service
export { notificationsService } from './notificationsService';
export type {
  Notification,
  NotificationType,
  NotificationPreferences,
} from './notificationsService';

// App Config Service
export { appConfigService } from './appConfigService';
export type { AppConfig, HomeFeedData } from './appConfigService';

// Companies Service
export { companiesService } from './companiesService';
export type {
  Company,
  CompanyTour,
  CompanyReview,
  CompanyGuide,
  SearchCompaniesParams,
  CompaniesListResponse,
} from './companiesService';

// Cache Service (Performance)
export { cacheService, CacheDuration } from './cacheService';
