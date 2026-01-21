import React from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Spacing } from '../theme';

interface ImageGalleryPickerProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  aspectRatio?: [number, number];
}

export const ImageGalleryPicker: React.FC<ImageGalleryPickerProps> = ({
  images,
  onImagesChange,
  maxImages = 5,
  aspectRatio = [16, 9],
}) => {
  const handleAddImage = async () => {
    if (images.length >= maxImages) {
      Alert.alert('Límite alcanzado', `Solo puedes agregar hasta ${maxImages} imágenes`);
      return;
    }

    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permiso requerido', 'Se necesita acceso a la galería para seleccionar imágenes');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: maxImages - images.length,
        quality: 0.8,
        aspect: aspectRatio,
      });

      if (!result.canceled && result.assets) {
        const newImages = result.assets.map((asset) => asset.uri);
        onImagesChange([...images, ...newImages].slice(0, maxImages));
      }
    } catch (error) {
      console.error('Error picking images:', error);
      // Fallback to single image picker if multiple selection fails
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: aspectRatio,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        onImagesChange([...images, result.assets[0].uri].slice(0, maxImages));
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    Alert.alert(
      'Eliminar imagen',
      '¿Estás seguro de eliminar esta imagen?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            const newImages = images.filter((_, i) => i !== index);
            onImagesChange(newImages);
          },
        },
      ]
    );
  };

  const handleSetAsCover = (index: number) => {
    if (index === 0) return; // Already cover
    const newImages = [...images];
    const [selectedImage] = newImages.splice(index, 1);
    newImages.unshift(selectedImage);
    onImagesChange(newImages);
  };

  return (
    <View style={styles.container}>
      {/* Main/Cover Image */}
      <TouchableOpacity
        style={styles.coverImageContainer}
        onPress={images.length === 0 ? handleAddImage : undefined}
        activeOpacity={images.length === 0 ? 0.7 : 1}
      >
        {images.length > 0 ? (
          <>
            <Image source={{ uri: images[0] }} style={styles.coverImage} />
            <View style={styles.coverBadge}>
              <Text style={styles.coverBadgeText}>Portada</Text>
            </View>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveImage(0)}
            >
              <Ionicons name="close-circle" size={28} color="#fff" />
            </TouchableOpacity>
          </>
        ) : (
          <LinearGradient
            colors={[Colors.primaryLight, Colors.primary]}
            style={styles.placeholder}
          >
            <Ionicons name="camera" size={40} color={Colors.textInverse} />
            <Text style={styles.placeholderText}>Agregar imagen de portada</Text>
          </LinearGradient>
        )}
      </TouchableOpacity>

      {/* Gallery Thumbnails */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.thumbnailScroll}
        contentContainerStyle={styles.thumbnailContainer}
      >
        {images.slice(1).map((uri, index) => (
          <View key={`${uri}-${index}`} style={styles.thumbnailWrapper}>
            <Image source={{ uri }} style={styles.thumbnail} />
            <TouchableOpacity
              style={styles.thumbnailRemove}
              onPress={() => handleRemoveImage(index + 1)}
            >
              <Ionicons name="close-circle" size={22} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.setCoverButton}
              onPress={() => handleSetAsCover(index + 1)}
            >
              <Ionicons name="star-outline" size={14} color="#fff" />
            </TouchableOpacity>
          </View>
        ))}

        {/* Add More Button */}
        {images.length > 0 && images.length < maxImages && (
          <TouchableOpacity style={styles.addMoreButton} onPress={handleAddImage}>
            <Ionicons name="add" size={28} color={Colors.primary} />
            <Text style={styles.addMoreText}>{maxImages - images.length}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Counter */}
      <View style={styles.counter}>
        <Ionicons name="images-outline" size={14} color={Colors.textSecondary} />
        <Text style={styles.counterText}>
          {images.length} / {maxImages} imágenes
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  coverImageContainer: {
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Colors.card,
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  coverBadge: {
    position: 'absolute',
    bottom: Spacing.sm,
    left: Spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },
  coverBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  removeButton: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: Colors.textInverse,
    fontSize: 14,
    fontWeight: '500',
    marginTop: Spacing.sm,
  },
  thumbnailScroll: {
    marginTop: Spacing.sm,
  },
  thumbnailContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingRight: Spacing.sm,
  },
  thumbnailWrapper: {
    position: 'relative',
  },
  thumbnail: {
    width: 80,
    height: 60,
    borderRadius: 10,
    backgroundColor: Colors.card,
  },
  thumbnailRemove: {
    position: 'absolute',
    top: -6,
    right: -6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  setCoverButton: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    padding: 4,
  },
  addMoreButton: {
    width: 80,
    height: 60,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primaryMuted,
  },
  addMoreText: {
    fontSize: 10,
    color: Colors.primary,
    fontWeight: '600',
  },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: Spacing.xs,
    gap: 4,
  },
  counterText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});

export default ImageGalleryPicker;

