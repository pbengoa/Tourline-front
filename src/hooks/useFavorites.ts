import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { favoritesService } from '../services';
import { useAuth } from '../context/AuthContext';

const FAVORITES_STORAGE_KEY = '@tourline_favorites';

export interface FavoriteTour {
  id: string;
  title: string;
  image?: string;
  price: number;
  currency: string;
  rating: number;
  reviewCount: number;
  duration: string;
  location: string;
  companyName?: string;
  addedAt: string;
}

interface UseFavoritesReturn {
  favorites: FavoriteTour[];
  favoriteIds: Set<string>;
  isLoading: boolean;
  isFavorite: (tourId: string) => boolean;
  toggleFavorite: (tour: FavoriteTour) => Promise<void>;
  addFavorite: (tour: FavoriteTour) => Promise<void>;
  removeFavorite: (tourId: string) => Promise<void>;
  refreshFavorites: () => Promise<void>;
  favoritesCount: number;
}

/**
 * Hook para manejar favoritos
 * Usa AsyncStorage localmente y sincroniza con backend cuando está disponible
 */
export const useFavorites = (): UseFavoritesReturn => {
  const [favorites, setFavorites] = useState<FavoriteTour[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Set de IDs para búsqueda rápida O(1)
  const favoriteIds = new Set(favorites.map((f) => f.id));

  // Cargar favoritos al iniciar
  useEffect(() => {
    loadFavorites();
  }, [user?.id]);

  /**
   * Cargar favoritos desde storage local o backend
   */
  const loadFavorites = useCallback(async () => {
    setIsLoading(true);
    try {
      // Primero cargar desde AsyncStorage (rápido)
      const storedFavorites = await AsyncStorage.getItem(
        user?.id ? `${FAVORITES_STORAGE_KEY}_${user.id}` : FAVORITES_STORAGE_KEY
      );
      
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }

      // Si hay usuario autenticado, intentar sincronizar con backend
      if (user?.id) {
        try {
          const response = await favoritesService.getAll();
          if (response.success && response.data) {
            // Transformar datos del backend al formato local
            const backendFavorites: FavoriteTour[] = response.data.map((fav) => ({
              id: fav.tour.id,
              title: fav.tour.title,
              image: fav.tour.coverImage,
              price: fav.tour.price,
              currency: fav.tour.currency,
              rating: fav.tour.rating,
              reviewCount: fav.tour.reviewCount,
              duration: `${Math.floor(fav.tour.duration / 60)}h`,
              location: `${fav.tour.city}, ${fav.tour.country}`,
              companyName: fav.tour.company?.name,
              addedAt: fav.createdAt,
            }));
            
            setFavorites(backendFavorites);
            // Actualizar storage local
            await AsyncStorage.setItem(
              `${FAVORITES_STORAGE_KEY}_${user.id}`,
              JSON.stringify(backendFavorites)
            );
          }
        } catch (backendError) {
          // Backend no disponible, usar datos locales
          console.log('Backend favorites not available, using local storage');
        }
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  /**
   * Guardar favoritos en storage local
   */
  const saveFavorites = useCallback(async (newFavorites: FavoriteTour[]) => {
    const key = user?.id ? `${FAVORITES_STORAGE_KEY}_${user.id}` : FAVORITES_STORAGE_KEY;
    await AsyncStorage.setItem(key, JSON.stringify(newFavorites));
  }, [user?.id]);

  /**
   * Verificar si un tour está en favoritos
   */
  const isFavorite = useCallback((tourId: string): boolean => {
    return favoriteIds.has(tourId);
  }, [favoriteIds]);

  /**
   * Agregar tour a favoritos
   */
  const addFavorite = useCallback(async (tour: FavoriteTour) => {
    // Verificar si ya existe
    if (favoriteIds.has(tour.id)) return;

    const newFavorite: FavoriteTour = {
      ...tour,
      addedAt: new Date().toISOString(),
    };

    const newFavorites = [newFavorite, ...favorites];
    setFavorites(newFavorites);
    await saveFavorites(newFavorites);

    // Sincronizar con backend si está disponible
    if (user?.id) {
      try {
        await favoritesService.add(tour.id);
      } catch (error) {
        console.log('Could not sync favorite to backend');
      }
    }
  }, [favorites, favoriteIds, saveFavorites, user?.id]);

  /**
   * Quitar tour de favoritos
   */
  const removeFavorite = useCallback(async (tourId: string) => {
    const newFavorites = favorites.filter((f) => f.id !== tourId);
    setFavorites(newFavorites);
    await saveFavorites(newFavorites);

    // Sincronizar con backend si está disponible
    if (user?.id) {
      try {
        await favoritesService.remove(tourId);
      } catch (error) {
        console.log('Could not sync favorite removal to backend');
      }
    }
  }, [favorites, saveFavorites, user?.id]);

  /**
   * Toggle favorito (agregar/quitar)
   */
  const toggleFavorite = useCallback(async (tour: FavoriteTour) => {
    if (isFavorite(tour.id)) {
      await removeFavorite(tour.id);
    } else {
      await addFavorite(tour);
    }
  }, [isFavorite, removeFavorite, addFavorite]);

  /**
   * Refrescar favoritos desde backend
   */
  const refreshFavorites = useCallback(async () => {
    await loadFavorites();
  }, [loadFavorites]);

  return {
    favorites,
    favoriteIds,
    isLoading,
    isFavorite,
    toggleFavorite,
    addFavorite,
    removeFavorite,
    refreshFavorites,
    favoritesCount: favorites.length,
  };
};

// Export default for convenience
export default useFavorites;

