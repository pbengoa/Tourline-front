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
  BookingStats,
  TourStatus,
  CreateTourRequest,
  CreateGuideRequest,
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

// Bookings Service
export { bookingsService } from './bookingsService';
export type {
  Booking,
  BookingStatus,
  Availability,
  MonthAvailability,
  CreateBookingRequest,
  UpdateBookingRequest,
  CancelBookingRequest,
  CreateAvailabilityRequest,
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
