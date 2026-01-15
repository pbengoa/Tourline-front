import React, { createContext, useContext, ReactNode } from 'react';
import { useFavorites, FavoriteTour } from '../hooks/useFavorites';

interface FavoritesContextType {
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

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

interface FavoritesProviderProps {
  children: ReactNode;
}

export const FavoritesProvider: React.FC<FavoritesProviderProps> = ({ children }) => {
  const favoritesHook = useFavorites();

  return (
    <FavoritesContext.Provider value={favoritesHook}>
      {children}
    </FavoritesContext.Provider>
  );
};

/**
 * Hook to access favorites context
 * Must be used within FavoritesProvider
 */
export const useFavoritesContext = (): FavoritesContextType => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavoritesContext must be used within a FavoritesProvider');
  }
  return context;
};

export default FavoritesContext;

