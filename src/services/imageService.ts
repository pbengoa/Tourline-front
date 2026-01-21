import { api } from './api';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

// Types
interface UploadedImage {
  id: string;
  url: string;
  thumbnailUrl?: string;
  filename: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
}

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

interface ImagePickerOptions {
  allowsEditing?: boolean;
  aspect?: [number, number];
  quality?: number;
  allowsMultipleSelection?: boolean;
}

// Image quality presets
export const IMAGE_QUALITY = {
  high: 0.9,
  medium: 0.7,
  low: 0.5,
  thumbnail: 0.3,
} as const;

// Max dimensions for different use cases
export const IMAGE_MAX_SIZE = {
  avatar: { width: 500, height: 500 },
  tour: { width: 1200, height: 800 },
  gallery: { width: 1600, height: 1200 },
  thumbnail: { width: 300, height: 300 },
} as const;

/**
 * Request permission to access the camera
 */
export const requestCameraPermission = async (): Promise<boolean> => {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  return status === 'granted';
};

/**
 * Request permission to access the media library
 */
export const requestMediaLibraryPermission = async (): Promise<boolean> => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return status === 'granted';
};

/**
 * Pick an image from the gallery
 */
export const pickImage = async (
  options: ImagePickerOptions = {}
): Promise<ImagePicker.ImagePickerAsset | null> => {
  const hasPermission = await requestMediaLibraryPermission();
  if (!hasPermission) {
    throw new Error('Se requiere permiso para acceder a la galería');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: 'images',
    allowsEditing: options.allowsEditing ?? true,
    aspect: options.aspect ?? [1, 1],
    quality: options.quality ?? IMAGE_QUALITY.high,
    allowsMultipleSelection: options.allowsMultipleSelection ?? false,
  });

  if (result.canceled || !result.assets || result.assets.length === 0) {
    return null;
  }

  return result.assets[0];
};

/**
 * Take a photo with the camera
 */
export const takePhoto = async (
  options: Omit<ImagePickerOptions, 'allowsMultipleSelection'> = {}
): Promise<ImagePicker.ImagePickerAsset | null> => {
  const hasPermission = await requestCameraPermission();
  if (!hasPermission) {
    throw new Error('Se requiere permiso para acceder a la cámara');
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: 'images',
    allowsEditing: options.allowsEditing ?? true,
    aspect: options.aspect ?? [1, 1],
    quality: options.quality ?? IMAGE_QUALITY.high,
  });

  if (result.canceled || !result.assets || result.assets.length === 0) {
    return null;
  }

  return result.assets[0];
};

/**
 * Compress and resize an image
 */
export const compressImage = async (
  uri: string,
  maxSize: { width: number; height: number } = IMAGE_MAX_SIZE.gallery,
  quality: number = IMAGE_QUALITY.medium
): Promise<string> => {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: maxSize.width, height: maxSize.height } }],
    {
      compress: quality,
      format: ImageManipulator.SaveFormat.JPEG,
    }
  );

  return result.uri;
};

/**
 * Get file info (size, exists)
 */
export const getFileInfo = async (uri: string) => {
  const info = await FileSystem.getInfoAsync(uri);
  return info;
};

/**
 * Convert image URI to base64
 */
export const uriToBase64 = async (uri: string): Promise<string> => {
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return base64;
};

/**
 * Upload a single image to S3 via backend
 */
export const uploadImage = async (
  uri: string,
  category: 'avatar' | 'tour' | 'gallery' | 'guide' = 'gallery',
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadedImage> => {
  // Get the file extension
  const uriParts = uri.split('.');
  const fileExtension = uriParts[uriParts.length - 1];

  // Get file info
  const fileInfo = await getFileInfo(uri);
  if (!fileInfo.exists) {
    throw new Error('El archivo no existe');
  }

  // Create form data
  const formData = new FormData();
  formData.append('file', {
    uri,
    name: `${category}_${Date.now()}.${fileExtension}`,
    type: `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`,
  } as unknown as Blob);
  formData.append('category', category);
  formData.append('isPublic', 'true');

  // Upload with progress tracking
  const response = await api.post<{ data: UploadedImage }>('/files', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        onProgress({
          loaded: progressEvent.loaded,
          total: progressEvent.total,
          percentage: Math.round((progressEvent.loaded * 100) / progressEvent.total),
        });
      }
    },
  });

  return response.data.data;
};

/**
 * Upload avatar image with automatic compression
 */
export const uploadAvatar = async (
  uri: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadedImage> => {
  // Compress for avatar
  const compressedUri = await compressImage(uri, IMAGE_MAX_SIZE.avatar, IMAGE_QUALITY.high);

  return uploadImage(compressedUri, 'avatar', onProgress);
};

/**
 * Upload tour image with automatic compression
 */
export const uploadTourImage = async (
  uri: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadedImage> => {
  // Compress for tour
  const compressedUri = await compressImage(uri, IMAGE_MAX_SIZE.tour, IMAGE_QUALITY.high);

  return uploadImage(compressedUri, 'tour', onProgress);
};

/**
 * Upload multiple images for gallery
 */
export const uploadGalleryImages = async (
  uris: string[],
  onProgress?: (current: number, total: number) => void
): Promise<UploadedImage[]> => {
  const uploadedImages: UploadedImage[] = [];

  for (let i = 0; i < uris.length; i++) {
    const compressedUri = await compressImage(uris[i], IMAGE_MAX_SIZE.gallery, IMAGE_QUALITY.medium);

    const uploaded = await uploadImage(compressedUri, 'gallery');
    uploadedImages.push(uploaded);

    if (onProgress) {
      onProgress(i + 1, uris.length);
    }
  }

  return uploadedImages;
};

/**
 * Delete an image from S3
 */
export const deleteImage = async (imageId: string): Promise<void> => {
  await api.delete(`/files/${imageId}`);
};

/**
 * Get placeholder image URL based on type
 */
export const getPlaceholderImage = (type: 'avatar' | 'tour' | 'landscape' = 'tour'): string => {
  const placeholders = {
    avatar: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=200&h=200&fit=crop',
    tour: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&h=400&fit=crop',
    landscape: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop',
  };

  return placeholders[type];
};

/**
 * Helper to pick and upload avatar in one go
 */
export const pickAndUploadAvatar = async (
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadedImage | null> => {
  const image = await pickImage({
    allowsEditing: true,
    aspect: [1, 1],
    quality: IMAGE_QUALITY.high,
  });

  if (!image) {
    return null;
  }

  return uploadAvatar(image.uri, onProgress);
};

/**
 * Helper to take and upload avatar in one go
 */
export const takeAndUploadAvatar = async (
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadedImage | null> => {
  const image = await takePhoto({
    allowsEditing: true,
    aspect: [1, 1],
    quality: IMAGE_QUALITY.high,
  });

  if (!image) {
    return null;
  }

  return uploadAvatar(image.uri, onProgress);
};

