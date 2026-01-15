import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Colors, Spacing, Typography } from '../theme';
import { Avatar } from './Avatar';
import { ImageCard } from './ImageCard';
import { ImagePickerModal } from './ImagePickerModal';
import {
  pickImage,
  takePhoto,
  uploadAvatar,
  uploadTourImage,
  IMAGE_QUALITY,
} from '../services/imageService';

interface ImageUploaderProps {
  currentImageUri?: string | null;
  onImageUploaded: (imageUrl: string) => void;
  onError?: (error: Error) => void;
  type?: 'avatar' | 'cover' | 'gallery';
  size?: 'small' | 'medium' | 'large';
  placeholder?: string;
  disabled?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  currentImageUri,
  onImageUploaded,
  onError,
  type = 'avatar',
  size = 'large',
  placeholder = 'Usuario',
  disabled = false,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handlePickImage = async (fromCamera: boolean) => {
    try {
      setIsLoading(true);
      setUploadProgress(0);

      const image = fromCamera
        ? await takePhoto({
            allowsEditing: true,
            aspect: type === 'avatar' ? [1, 1] : [16, 9],
            quality: IMAGE_QUALITY.high,
          })
        : await pickImage({
            allowsEditing: true,
            aspect: type === 'avatar' ? [1, 1] : [16, 9],
            quality: IMAGE_QUALITY.high,
          });

      if (!image) {
        setIsLoading(false);
        return;
      }

      // Upload based on type
      const uploadFn = type === 'avatar' ? uploadAvatar : uploadTourImage;
      const uploaded = await uploadFn(image.uri, (progress) => {
        setUploadProgress(progress.percentage);
      });

      onImageUploaded(uploaded.url);
    } catch (error) {
      const err = error as Error;
      if (onError) {
        onError(err);
      } else {
        Alert.alert('Error', err.message || 'No se pudo subir la imagen');
      }
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  const renderAvatarUploader = () => (
    <TouchableOpacity
      style={[styles.avatarContainer, disabled && styles.disabled]}
      onPress={() => !disabled && setShowPicker(true)}
      activeOpacity={disabled ? 1 : 0.7}
    >
      <Avatar
        uri={currentImageUri}
        name={placeholder}
        size={size === 'small' ? 'medium' : size === 'medium' ? 'large' : 'xlarge'}
      />
      {isLoading ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color={Colors.textInverse} />
          {uploadProgress > 0 && (
            <Text style={styles.progressText}>{uploadProgress}%</Text>
          )}
        </View>
      ) : (
        !disabled && (
          <View style={styles.editBadge}>
            <Text style={styles.editIcon}>📷</Text>
          </View>
        )
      )}
    </TouchableOpacity>
  );

  const renderCoverUploader = () => (
    <TouchableOpacity
      style={[styles.coverContainer, disabled && styles.disabled]}
      onPress={() => !disabled && setShowPicker(true)}
      activeOpacity={disabled ? 1 : 0.7}
    >
      {currentImageUri ? (
        <ImageCard
          uri={currentImageUri}
          style={styles.coverImage}
          borderRadius={16}
        />
      ) : (
        <View style={styles.coverPlaceholder}>
          <Text style={styles.coverPlaceholderIcon}>🖼️</Text>
          <Text style={styles.coverPlaceholderText}>Agregar imagen</Text>
        </View>
      )}
      {isLoading && (
        <View style={[styles.loadingOverlay, styles.coverLoadingOverlay]}>
          <ActivityIndicator size="large" color={Colors.textInverse} />
          {uploadProgress > 0 && (
            <Text style={styles.progressText}>{uploadProgress}%</Text>
          )}
        </View>
      )}
      {!isLoading && !disabled && (
        <View style={styles.coverEditBadge}>
          <Text style={styles.coverEditIcon}>📷</Text>
          <Text style={styles.coverEditText}>Cambiar imagen</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <>
      {type === 'avatar' ? renderAvatarUploader() : renderCoverUploader()}
      <ImagePickerModal
        visible={showPicker}
        onClose={() => setShowPicker(false)}
        onSelectCamera={() => handlePickImage(true)}
        onSelectGallery={() => handlePickImage(false)}
        title={type === 'avatar' ? 'Foto de perfil' : 'Imagen de portada'}
      />
    </>
  );
};

const styles = StyleSheet.create({
  avatarContainer: {
    position: 'relative',
    alignSelf: 'flex-start',
  },
  disabled: {
    opacity: 0.7,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    ...Typography.labelSmall,
    color: Colors.textInverse,
    marginTop: 4,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.card,
  },
  editIcon: {
    fontSize: 14,
  },
  coverContainer: {
    position: 'relative',
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverPlaceholder: {
    flex: 1,
    backgroundColor: Colors.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.border,
  },
  coverPlaceholderIcon: {
    fontSize: 40,
    marginBottom: Spacing.sm,
  },
  coverPlaceholderText: {
    ...Typography.label,
    color: Colors.textSecondary,
  },
  coverLoadingOverlay: {
    borderRadius: 16,
  },
  coverEditBadge: {
    position: 'absolute',
    bottom: Spacing.md,
    right: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
  },
  coverEditIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  coverEditText: {
    ...Typography.labelSmall,
    color: Colors.textInverse,
  },
});

