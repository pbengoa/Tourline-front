import { api, ApiResponse } from './api';
import { Platform } from 'react-native';

// Types
export type FileCategory =
  | 'AVATAR'
  | 'GUIDE_PHOTO'
  | 'TOUR_IMAGE'
  | 'CHAT_ATTACHMENT'
  | 'DOCUMENT'
  | 'OTHER';

export interface FileInfo {
  id: string;
  userId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  category: FileCategory;
  alt?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UploadFileRequest {
  uri: string;
  name: string;
  type: string;
  category: FileCategory;
  alt?: string;
}

export interface UpdateFileRequest {
  alt?: string;
  category?: FileCategory;
  isPublic?: boolean;
}

export interface StorageStats {
  totalFiles: number;
  totalSize: number;
  usedStorage: string;
  maxStorage: string;
}

// Files Service
export const filesService = {
  // Get public files
  async getPublicFiles(): Promise<ApiResponse<FileInfo[]>> {
    const response = await api.get<ApiResponse<FileInfo[]>>('/files/public');
    return response.data;
  },

  // Get files by category
  async getFilesByCategory(category: FileCategory): Promise<ApiResponse<FileInfo[]>> {
    const response = await api.get<ApiResponse<FileInfo[]>>(`/files/category/${category}`);
    return response.data;
  },

  // Get file by ID
  async getFile(id: string): Promise<ApiResponse<FileInfo>> {
    const response = await api.get<ApiResponse<FileInfo>>(`/files/${id}`);
    return response.data;
  },

  // Upload a file
  async uploadFile(file: UploadFileRequest): Promise<ApiResponse<FileInfo>> {
    const formData = new FormData();

    // Create file object for upload
    const fileBlob = {
      uri: Platform.OS === 'ios' ? file.uri.replace('file://', '') : file.uri,
      name: file.name,
      type: file.type,
    } as unknown as Blob;

    formData.append('file', fileBlob);
    formData.append('category', file.category);
    if (file.alt) {
      formData.append('alt', file.alt);
    }

    const response = await api.post<ApiResponse<FileInfo>>('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Upload multiple files
  async uploadMultipleFiles(
    files: UploadFileRequest[]
  ): Promise<ApiResponse<FileInfo[]>> {
    const formData = new FormData();

    files.forEach((file, index) => {
      const fileBlob = {
        uri: Platform.OS === 'ios' ? file.uri.replace('file://', '') : file.uri,
        name: file.name,
        type: file.type,
      } as unknown as Blob;

      formData.append('files', fileBlob);
      formData.append(`categories[${index}]`, file.category);
      if (file.alt) {
        formData.append(`alts[${index}]`, file.alt);
      }
    });

    const response = await api.post<ApiResponse<FileInfo[]>>('/files/upload-multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get my files
  async getMyFiles(): Promise<ApiResponse<FileInfo[]>> {
    const response = await api.get<ApiResponse<FileInfo[]>>('/files/my-files');
    return response.data;
  },

  // Get storage stats
  async getStorageStats(): Promise<ApiResponse<StorageStats>> {
    const response = await api.get<ApiResponse<StorageStats>>('/files/storage-stats');
    return response.data;
  },

  // Update file metadata
  async updateFile(id: string, data: UpdateFileRequest): Promise<ApiResponse<FileInfo>> {
    const response = await api.patch<ApiResponse<FileInfo>>(`/files/${id}`, data);
    return response.data;
  },

  // Delete file
  async deleteFile(id: string): Promise<ApiResponse<{ message: string }>> {
    const response = await api.delete<ApiResponse<{ message: string }>>(`/files/${id}`);
    return response.data;
  },
};

