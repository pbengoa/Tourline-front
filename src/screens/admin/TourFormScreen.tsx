import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '../../theme';
import { adminService, AdminTour, CreateTourRequest } from '../../services';
import { ImageGalleryPicker } from '../../components/ImageGalleryPicker';
import { LocationAutocomplete } from '../../components/LocationAutocomplete';
import { AvailabilityPicker, AvailabilitySchedule } from '../../components/AvailabilityPicker';

interface TourFormScreenProps {
  navigation: any;
  route: {
    params?: {
      tourId?: string;
    };
  };
}

interface FormData {
  title: string;
  description: string;
  shortDescription: string;
  price: string;
  currency: string;
  duration: string;
  maxParticipants: string;
  location: string;
  meetingPoint: string;
  category: string;
  difficulty: string;
  languages: string[];
  included: string[];
  notIncluded: string[];
  highlights: string[];
  isFeatured: boolean;
}

const CATEGORIES = [
  { id: 'adventure', label: 'Aventura', icon: '🏔️' },
  { id: 'cultural', label: 'Cultural', icon: '🏛️' },
  { id: 'nature', label: 'Naturaleza', icon: '🌲' },
  { id: 'food', label: 'Gastronomía', icon: '🍷' },
  { id: 'city', label: 'Ciudad', icon: '🏙️' },
  { id: 'beach', label: 'Playa', icon: '🏖️' },
];

const DIFFICULTIES = [
  { id: 'easy', label: 'Fácil', color: Colors.success },
  { id: 'moderate', label: 'Moderado', color: Colors.warning },
  { id: 'hard', label: 'Difícil', color: Colors.error },
];

const LANGUAGES = [
  { id: 'es', label: 'Español', flag: '🇪🇸' },
  { id: 'en', label: 'Inglés', flag: '🇺🇸' },
  { id: 'pt', label: 'Portugués', flag: '🇧🇷' },
  { id: 'fr', label: 'Francés', flag: '🇫🇷' },
  { id: 'de', label: 'Alemán', flag: '🇩🇪' },
];

export const TourFormScreen: React.FC<TourFormScreenProps> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const tourId = route.params?.tourId;
  const isEditing = !!tourId;

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [availability, setAvailability] = useState<AvailabilitySchedule>({
    daysOfWeek: [1, 2, 3, 4, 5, 6], // Mon-Sat by default
    timeSlots: [{ startTime: '10:00' }],
    isRecurring: true,
  });
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    shortDescription: '',
    price: '',
    currency: 'CLP',
    duration: '',
    maxParticipants: '10',
    location: '',
    meetingPoint: '',
    category: 'adventure',
    difficulty: 'moderate',
    languages: ['es'],
    included: [],
    notIncluded: [],
    highlights: [],
    isFeatured: false,
  });

  // Load tour data if editing
  useEffect(() => {
    if (isEditing && tourId) {
      loadTour();
    }
  }, [tourId]);

  const loadTour = async () => {
    try {
      setLoading(true);
      const tour = await adminService.getTourById(tourId!);
      if (tour) {
        setFormData({
          title: tour.title || '',
          description: tour.description || '',
          shortDescription: tour.shortDescription || '',
          price: String(tour.price || ''),
          currency: tour.currency || 'CLP',
          duration: String(tour.duration || ''),
          maxParticipants: String(tour.maxParticipants || 10),
          location: tour.location || '',
          meetingPoint: tour.meetingPoint || '',
          category: tour.category || 'adventure',
          difficulty: tour.difficulty || 'moderate',
          languages: tour.languages || ['es'],
          included: tour.includes || tour.included || [],
          notIncluded: tour.excludes || tour.notIncluded || [],
          highlights: tour.highlights || [],
          isFeatured: tour.isFeatured || tour.featured || false,
        });
        // Load images
        const tourImages: string[] = [];
        if (tour.image) tourImages.push(tour.image);
        if (tour.coverImage && !tourImages.includes(tour.coverImage)) tourImages.push(tour.coverImage);
        if (tour.images && Array.isArray(tour.images)) {
          tour.images.forEach((img: string) => {
            if (!tourImages.includes(img)) tourImages.push(img);
          });
        }
        setImages(tourImages);
        // Load coordinates if available
        if (tour.coordinates) {
          setCoordinates({ lat: tour.coordinates.latitude, lng: tour.coordinates.longitude });
        }
        // Load availability if available
        if (tour.availability) {
          setAvailability({
            daysOfWeek: tour.availability.daysOfWeek || [1, 2, 3, 4, 5, 6],
            timeSlots: tour.availability.timeSlots || [{ startTime: '10:00' }],
            isRecurring: tour.availability.isRecurring ?? true,
            specificDates: tour.availability.specificDates,
            blackoutDates: tour.availability.blackoutDates,
          });
        }
      } else {
        Alert.alert('Error', 'Tour no encontrado');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error loading tour:', error);
      Alert.alert('Error', 'No se pudo cargar el tour');
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSelect = (location: string, placeId?: string, coords?: { lat: number; lng: number }) => {
    updateField('location', location);
    if (coords) {
      setCoordinates(coords);
    }
  };

  const updateField = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleLanguage = (langId: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(langId)
        ? prev.languages.filter(l => l !== langId)
        : [...prev.languages, langId],
    }));
  };

  const [newItemText, setNewItemText] = useState('');
  const [addingField, setAddingField] = useState<'included' | 'notIncluded' | 'highlights' | null>(null);

  const addListItem = (field: 'included' | 'notIncluded' | 'highlights') => {
    setAddingField(field);
    setNewItemText('');
  };

  const confirmAddItem = () => {
    if (newItemText.trim() && addingField) {
      setFormData(prev => ({
        ...prev,
        [addingField]: [...prev[addingField], newItemText.trim()],
      }));
      setNewItemText('');
      setAddingField(null);
    }
  };

  const cancelAddItem = () => {
    setNewItemText('');
    setAddingField(null);
  };

  const removeListItem = (field: 'included' | 'notIncluded' | 'highlights', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'El título es requerido');
      return false;
    }
    if (!formData.description.trim()) {
      Alert.alert('Error', 'La descripción es requerida');
      return false;
    }
    if (!formData.price || isNaN(Number(formData.price))) {
      Alert.alert('Error', 'El precio debe ser un número válido');
      return false;
    }
    if (!formData.duration || isNaN(Number(formData.duration))) {
      Alert.alert('Error', 'La duración debe ser un número válido (en minutos)');
      return false;
    }
    if (!formData.location.trim()) {
      Alert.alert('Error', 'La ubicación es requerida');
      return false;
    }
    if (availability.daysOfWeek.length === 0) {
      Alert.alert('Error', 'Selecciona al menos un día de disponibilidad');
      return false;
    }
    if (availability.timeSlots.length === 0) {
      Alert.alert('Error', 'Agrega al menos un horario de salida');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const tourData: Partial<CreateTourRequest> = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        shortDescription: formData.shortDescription.trim() || formData.description.substring(0, 150),
        price: Number(formData.price),
        currency: formData.currency,
        duration: Number(formData.duration),
        maxParticipants: Number(formData.maxParticipants),
        location: formData.location.trim(),
        meetingPointAddress: formData.meetingPoint.trim(),
        categories: [formData.category],
        includes: formData.included,
        excludes: formData.notIncluded,
        image: images[0] || undefined,
        images: images.length > 1 ? images.slice(1) : undefined,
        coordinates: coordinates ? { latitude: coordinates.lat, longitude: coordinates.lng } : undefined,
        availability: {
          daysOfWeek: availability.daysOfWeek,
          timeSlots: availability.timeSlots,
          isRecurring: availability.isRecurring,
        },
      };

      if (isEditing && tourId) {
        await adminService.updateTour(tourId, tourData);
        Alert.alert('Éxito', 'Tour actualizado correctamente', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        await adminService.createTour(tourData);
        Alert.alert('Éxito', 'Tour creado correctamente', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error: any) {
      console.error('Error saving tour:', error);
      Alert.alert('Error', error?.message || 'No se pudo guardar el tour');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditing ? 'Editar Tour' : 'Nuevo Tour'}</Text>
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color={Colors.textInverse} />
          ) : (
            <Text style={styles.saveButtonText}>Guardar</Text>
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Image Gallery Section */}
          <View style={styles.imageSection}>
            <Text style={styles.sectionTitle}>Imágenes del tour</Text>
            <ImageGalleryPicker
              images={images}
              onImagesChange={setImages}
              maxImages={5}
              aspectRatio={[16, 9]}
            />
          </View>

          {/* Basic Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información básica</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Título *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Tour por el Valle del Elqui"
                placeholderTextColor={Colors.textTertiary}
                value={formData.title}
                onChangeText={(text) => updateField('title', text)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Descripción corta</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Breve descripción para las tarjetas"
                placeholderTextColor={Colors.textTertiary}
                value={formData.shortDescription}
                onChangeText={(text) => updateField('shortDescription', text)}
                multiline
                numberOfLines={2}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Descripción completa *</Text>
              <TextInput
                style={[styles.input, styles.textAreaLarge]}
                placeholder="Describe la experiencia completa del tour..."
                placeholderTextColor={Colors.textTertiary}
                value={formData.description}
                onChangeText={(text) => updateField('description', text)}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Pricing & Duration */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Precio y duración</Text>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 2 }]}>
                <Text style={styles.label}>Precio *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="42000"
                  placeholderTextColor={Colors.textTertiary}
                  value={formData.price}
                  onChangeText={(text) => updateField('price', text.replace(/[^0-9]/g, ''))}
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1, marginLeft: Spacing.sm }]}>
                <Text style={styles.label}>Moneda</Text>
                <View style={styles.currencySelector}>
                  <TouchableOpacity
                    style={[styles.currencyOption, formData.currency === 'CLP' && styles.currencyOptionActive]}
                    onPress={() => updateField('currency', 'CLP')}
                  >
                    <Text style={[styles.currencyText, formData.currency === 'CLP' && styles.currencyTextActive]}>CLP</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.currencyOption, formData.currency === 'EUR' && styles.currencyOptionActive]}
                    onPress={() => updateField('currency', 'EUR')}
                  >
                    <Text style={[styles.currencyText, formData.currency === 'EUR' && styles.currencyTextActive]}>EUR</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Duración (min) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="120"
                  placeholderTextColor={Colors.textTertiary}
                  value={formData.duration}
                  onChangeText={(text) => updateField('duration', text.replace(/[^0-9]/g, ''))}
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1, marginLeft: Spacing.sm }]}>
                <Text style={styles.label}>Max participantes</Text>
                <TextInput
                  style={styles.input}
                  placeholder="10"
                  placeholderTextColor={Colors.textTertiary}
                  value={formData.maxParticipants}
                  onChangeText={(text) => updateField('maxParticipants', text.replace(/[^0-9]/g, ''))}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Location */}
          <View style={[styles.section, { zIndex: 1000 }]}>
            <Text style={styles.sectionTitle}>Ubicación</Text>

            <View style={[styles.inputGroup, { zIndex: 1001 }]}>
              <Text style={styles.label}>Ubicación *</Text>
              <LocationAutocomplete
                value={formData.location}
                onSelect={handleLocationSelect}
                placeholder="Buscar ubicación en Chile..."
              />
              {coordinates && (
                <View style={styles.coordinatesInfo}>
                  <Ionicons name="navigate" size={12} color={Colors.success} />
                  <Text style={styles.coordinatesText}>
                    Coordenadas: {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Punto de encuentro</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Plaza de Armas de La Serena"
                placeholderTextColor={Colors.textTertiary}
                value={formData.meetingPoint}
                onChangeText={(text) => updateField('meetingPoint', text)}
              />
            </View>
          </View>

          {/* Availability */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Disponibilidad</Text>
            <AvailabilityPicker
              value={availability}
              onChange={setAvailability}
            />
          </View>

          {/* Category */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Categoría</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.categoryOption, formData.category === cat.id && styles.categoryOptionActive]}
                  onPress={() => updateField('category', cat.id)}
                >
                  <Text style={styles.categoryIcon}>{cat.icon}</Text>
                  <Text style={[styles.categoryLabel, formData.category === cat.id && styles.categoryLabelActive]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Difficulty */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dificultad</Text>
            <View style={styles.difficultyRow}>
              {DIFFICULTIES.map((diff) => (
                <TouchableOpacity
                  key={diff.id}
                  style={[
                    styles.difficultyOption,
                    formData.difficulty === diff.id && { backgroundColor: diff.color },
                  ]}
                  onPress={() => updateField('difficulty', diff.id)}
                >
                  <Text style={[
                    styles.difficultyLabel,
                    formData.difficulty === diff.id && styles.difficultyLabelActive,
                  ]}>
                    {diff.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Languages */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Idiomas disponibles</Text>
            <View style={styles.languagesRow}>
              {LANGUAGES.map((lang) => (
                <TouchableOpacity
                  key={lang.id}
                  style={[styles.languageOption, formData.languages.includes(lang.id) && styles.languageOptionActive]}
                  onPress={() => toggleLanguage(lang.id)}
                >
                  <Text style={styles.languageFlag}>{lang.flag}</Text>
                  <Text style={[styles.languageLabel, formData.languages.includes(lang.id) && styles.languageLabelActive]}>
                    {lang.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Included */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>¿Qué incluye?</Text>
              <TouchableOpacity onPress={() => addListItem('included')}>
                <Ionicons name="add-circle" size={24} color={Colors.primary} />
              </TouchableOpacity>
            </View>
            {addingField === 'included' && (
              <View style={styles.addItemRow}>
                <TextInput
                  style={styles.addItemInput}
                  placeholder="Ej: Transporte incluido"
                  placeholderTextColor={Colors.textTertiary}
                  value={newItemText}
                  onChangeText={setNewItemText}
                  autoFocus
                />
                <TouchableOpacity style={styles.addItemButton} onPress={confirmAddItem}>
                  <Ionicons name="checkmark" size={20} color={Colors.success} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.addItemButton} onPress={cancelAddItem}>
                  <Ionicons name="close" size={20} color={Colors.error} />
                </TouchableOpacity>
              </View>
            )}
            {formData.included.map((item, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.listItemIcon}>✓</Text>
                <Text style={styles.listItemText}>{item}</Text>
                <TouchableOpacity onPress={() => removeListItem('included', index)}>
                  <Ionicons name="close-circle" size={20} color={Colors.error} />
                </TouchableOpacity>
              </View>
            ))}
            {formData.included.length === 0 && !addingField && (
              <Text style={styles.emptyListText}>Agrega lo que incluye el tour</Text>
            )}
          </View>

          {/* Not Included */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>¿Qué NO incluye?</Text>
              <TouchableOpacity onPress={() => addListItem('notIncluded')}>
                <Ionicons name="add-circle" size={24} color={Colors.primary} />
              </TouchableOpacity>
            </View>
            {addingField === 'notIncluded' && (
              <View style={styles.addItemRow}>
                <TextInput
                  style={styles.addItemInput}
                  placeholder="Ej: Comidas"
                  placeholderTextColor={Colors.textTertiary}
                  value={newItemText}
                  onChangeText={setNewItemText}
                  autoFocus
                />
                <TouchableOpacity style={styles.addItemButton} onPress={confirmAddItem}>
                  <Ionicons name="checkmark" size={20} color={Colors.success} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.addItemButton} onPress={cancelAddItem}>
                  <Ionicons name="close" size={20} color={Colors.error} />
                </TouchableOpacity>
              </View>
            )}
            {formData.notIncluded.map((item, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.listItemIcon}>✗</Text>
                <Text style={styles.listItemText}>{item}</Text>
                <TouchableOpacity onPress={() => removeListItem('notIncluded', index)}>
                  <Ionicons name="close-circle" size={20} color={Colors.error} />
                </TouchableOpacity>
              </View>
            ))}
            {formData.notIncluded.length === 0 && addingField !== 'notIncluded' && (
              <Text style={styles.emptyListText}>Agrega lo que NO incluye el tour</Text>
            )}
          </View>

          {/* Featured Toggle */}
          <View style={styles.section}>
            <View style={styles.toggleRow}>
              <View>
                <Text style={styles.toggleLabel}>Destacar tour</Text>
                <Text style={styles.toggleDescription}>Aparecerá en la sección de destacados</Text>
              </View>
              <Switch
                value={formData.isFeatured}
                onValueChange={(value) => updateField('isFeatured', value)}
                trackColor={{ false: Colors.border, true: Colors.primaryLight }}
                thumbColor={formData.isFeatured ? Colors.primary : Colors.textTertiary}
              />
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: Colors.textInverse,
    fontWeight: '600',
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  imageSection: {
    marginBottom: Spacing.md,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  coordinatesInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
    gap: 4,
  },
  coordinatesText: {
    fontSize: 11,
    color: Colors.success,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 15,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textArea: {
    height: 60,
    textAlignVertical: 'top',
  },
  textAreaLarge: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
  },
  currencySelector: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  currencyOption: {
    flex: 1,
    paddingVertical: Spacing.xs,
    alignItems: 'center',
    borderRadius: 8,
  },
  currencyOptionActive: {
    backgroundColor: Colors.primary,
  },
  currencyText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  currencyTextActive: {
    color: Colors.textInverse,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.xs,
  },
  categoryOption: {
    width: '30%',
    margin: '1.66%',
    padding: Spacing.sm,
    backgroundColor: Colors.card,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryOptionActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryMuted,
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: Spacing.xs,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  categoryLabelActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  difficultyRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  difficultyOption: {
    flex: 1,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.card,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  difficultyLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  difficultyLabelActive: {
    color: Colors.textInverse,
  },
  languagesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.card,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  languageOptionActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryMuted,
  },
  languageFlag: {
    fontSize: 16,
    marginRight: Spacing.xs,
  },
  languageLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  languageLabelActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  addItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  addItemInput: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 8,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    fontSize: 14,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  addItemButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: Spacing.sm,
    borderRadius: 8,
    marginBottom: Spacing.xs,
  },
  listItemIcon: {
    fontSize: 14,
    marginRight: Spacing.sm,
    color: Colors.success,
  },
  listItemText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },
  emptyListText: {
    fontSize: 13,
    color: Colors.textTertiary,
    fontStyle: 'italic',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: Spacing.md,
    borderRadius: 12,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  toggleDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});

export default TourFormScreen;

