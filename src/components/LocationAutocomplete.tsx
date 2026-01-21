import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  FlatList,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '../theme';

// You need to add your Google API Key here or in environment config
const GOOGLE_PLACES_API_KEY = 'YOUR_GOOGLE_PLACES_API_KEY';

interface Prediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

interface LocationAutocompleteProps {
  value: string;
  onSelect: (location: string, placeId?: string, coordinates?: { lat: number; lng: number }) => void;
  placeholder?: string;
  style?: any;
}

export const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  value,
  onSelect,
  placeholder = 'Buscar ubicación...',
  style,
}) => {
  const [query, setQuery] = useState(value);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  const searchPlaces = async (text: string) => {
    if (text.length < 3) {
      setPredictions([]);
      return;
    }

    setLoading(true);
    try {
      // Check if we have a valid API key
      if (GOOGLE_PLACES_API_KEY === 'YOUR_GOOGLE_PLACES_API_KEY') {
        // Use fallback local suggestions for Chile
        const localSuggestions = getLocalSuggestions(text);
        setPredictions(localSuggestions);
        setLoading(false);
        return;
      }

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
          text
        )}&types=(regions)&language=es&components=country:cl&key=${GOOGLE_PLACES_API_KEY}`
      );
      const data = await response.json();
      
      if (data.predictions) {
        setPredictions(data.predictions);
      }
    } catch (error) {
      console.error('Error fetching places:', error);
      // Fallback to local suggestions
      const localSuggestions = getLocalSuggestions(text);
      setPredictions(localSuggestions);
    } finally {
      setLoading(false);
    }
  };

  // Local suggestions for Chile when API is not configured
  const getLocalSuggestions = (text: string): Prediction[] => {
    const chileanPlaces = [
      { name: 'Santiago', region: 'Región Metropolitana, Chile' },
      { name: 'Valparaíso', region: 'Región de Valparaíso, Chile' },
      { name: 'Viña del Mar', region: 'Región de Valparaíso, Chile' },
      { name: 'Concepción', region: 'Región del Biobío, Chile' },
      { name: 'La Serena', region: 'Región de Coquimbo, Chile' },
      { name: 'Antofagasta', region: 'Región de Antofagasta, Chile' },
      { name: 'Temuco', region: 'Región de La Araucanía, Chile' },
      { name: 'Rancagua', region: "Región del Libertador General Bernardo O'Higgins, Chile" },
      { name: 'Talca', region: 'Región del Maule, Chile' },
      { name: 'Arica', region: 'Región de Arica y Parinacota, Chile' },
      { name: 'Iquique', region: 'Región de Tarapacá, Chile' },
      { name: 'Puerto Montt', region: 'Región de Los Lagos, Chile' },
      { name: 'Punta Arenas', region: 'Región de Magallanes, Chile' },
      { name: 'Coyhaique', region: 'Región de Aysén, Chile' },
      { name: 'Valle del Elqui', region: 'Región de Coquimbo, Chile' },
      { name: 'San Pedro de Atacama', region: 'Región de Antofagasta, Chile' },
      { name: 'Torres del Paine', region: 'Región de Magallanes, Chile' },
      { name: 'Pucon', region: 'Región de La Araucanía, Chile' },
      { name: 'Villarrica', region: 'Región de La Araucanía, Chile' },
      { name: 'Chiloé', region: 'Región de Los Lagos, Chile' },
      { name: 'Cajón del Maipo', region: 'Región Metropolitana, Chile' },
      { name: 'Valle Nevado', region: 'Región Metropolitana, Chile' },
      { name: 'Portillo', region: 'Región de Valparaíso, Chile' },
      { name: 'Isla de Pascua', region: 'Región de Valparaíso, Chile' },
      { name: 'La Campana', region: 'Región de Valparaíso, Chile' },
      { name: 'Reserva Nacional Radal Siete Tazas', region: 'Región del Maule, Chile' },
    ];

    const searchLower = text.toLowerCase();
    return chileanPlaces
      .filter(
        (place) =>
          place.name.toLowerCase().includes(searchLower) ||
          place.region.toLowerCase().includes(searchLower)
      )
      .slice(0, 5)
      .map((place, index) => ({
        place_id: `local_${index}`,
        description: `${place.name}, ${place.region}`,
        structured_formatting: {
          main_text: place.name,
          secondary_text: place.region,
        },
      }));
  };

  const handleTextChange = (text: string) => {
    setQuery(text);
    setShowResults(true);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      searchPlaces(text);
    }, 300);
  };

  const handleSelect = async (prediction: Prediction) => {
    Keyboard.dismiss();
    setQuery(prediction.description);
    setShowResults(false);
    setPredictions([]);

    // If using Google API and need coordinates
    if (
      GOOGLE_PLACES_API_KEY !== 'YOUR_GOOGLE_PLACES_API_KEY' &&
      !prediction.place_id.startsWith('local_')
    ) {
      try {
        const detailsResponse = await fetch(
          `https://maps.googleapis.com/maps/api/place/details/json?place_id=${prediction.place_id}&fields=geometry&key=${GOOGLE_PLACES_API_KEY}`
        );
        const detailsData = await detailsResponse.json();
        
        if (detailsData.result?.geometry?.location) {
          const { lat, lng } = detailsData.result.geometry.location;
          onSelect(prediction.description, prediction.place_id, { lat, lng });
          return;
        }
      } catch (error) {
        console.error('Error fetching place details:', error);
      }
    }

    onSelect(prediction.description, prediction.place_id);
  };

  const handleClear = () => {
    setQuery('');
    setPredictions([]);
    onSelect('');
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.inputContainer}>
        <Ionicons name="location-outline" size={20} color={Colors.textTertiary} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={Colors.textTertiary}
          value={query}
          onChangeText={handleTextChange}
          onFocus={() => setShowResults(true)}
        />
        {loading && <ActivityIndicator size="small" color={Colors.primary} style={styles.loader} />}
        {query.length > 0 && !loading && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color={Colors.textTertiary} />
          </TouchableOpacity>
        )}
      </View>

      {showResults && predictions.length > 0 && (
        <View style={styles.resultsContainer}>
          <FlatList
            data={predictions}
            keyExtractor={(item) => item.place_id}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.resultItem} onPress={() => handleSelect(item)}>
                <Ionicons name="location" size={18} color={Colors.primary} />
                <View style={styles.resultTextContainer}>
                  <Text style={styles.resultMainText}>
                    {item.structured_formatting.main_text}
                  </Text>
                  <Text style={styles.resultSecondaryText} numberOfLines={1}>
                    {item.structured_formatting.secondary_text}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.sm,
  },
  icon: {
    marginRight: Spacing.xs,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    paddingVertical: Spacing.sm,
  },
  loader: {
    marginLeft: Spacing.xs,
  },
  clearButton: {
    padding: Spacing.xs,
  },
  resultsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: Colors.card,
    borderRadius: 12,
    marginTop: 4,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
  },
  resultTextContainer: {
    flex: 1,
  },
  resultMainText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  resultSecondaryText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});

export default LocationAutocomplete;

