import React, { useCallback, useRef } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Animated,
  ViewStyle,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '../theme';
import { useFavoritesContext } from '../contexts/FavoritesContext';
import { FavoriteTour } from '../hooks/useFavorites';

interface FavoriteButtonProps {
  tour: FavoriteTour;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  variant?: 'filled' | 'outline' | 'minimal';
  onToggle?: (isFavorite: boolean) => void;
}

const SIZES = {
  small: { button: 28, icon: 14 },
  medium: { button: 36, icon: 18 },
  large: { button: 44, icon: 22 },
};

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  tour,
  size = 'medium',
  style,
  variant = 'filled',
  onToggle,
}) => {
  const { isFavorite, toggleFavorite } = useFavoritesContext();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [isLoading, setIsLoading] = React.useState(false);

  const favorite = isFavorite(tour.id);
  const dimensions = SIZES[size];

  const handlePress = useCallback(async () => {
    // Animación de bounce
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.7,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setIsLoading(true);
    try {
      await toggleFavorite(tour);
      onToggle?.(!favorite);
    } finally {
      setIsLoading(false);
    }
  }, [tour, toggleFavorite, favorite, onToggle, scaleAnim]);

  const getButtonStyle = () => {
    const base: ViewStyle = {
      width: dimensions.button,
      height: dimensions.button,
      borderRadius: dimensions.button / 2,
      justifyContent: 'center',
      alignItems: 'center',
    };

    switch (variant) {
      case 'filled':
        return {
          ...base,
          backgroundColor: favorite ? Colors.error : 'rgba(255,255,255,0.95)',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 4,
          elevation: 3,
        };
      case 'outline':
        return {
          ...base,
          backgroundColor: favorite ? Colors.error : 'transparent',
          borderWidth: 2,
          borderColor: favorite ? Colors.error : Colors.border,
        };
      case 'minimal':
        return {
          ...base,
          backgroundColor: 'transparent',
        };
      default:
        return base;
    }
  };

  const getIconColor = () => {
    if (favorite) {
      return variant === 'minimal' ? Colors.error : '#fff';
    }
    return variant === 'filled' ? Colors.textSecondary : Colors.textTertiary;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handlePress}
      disabled={isLoading}
      style={[style]}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Animated.View
        style={[
          getButtonStyle(),
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={getIconColor()} />
        ) : (
          <Animated.Text
            style={{
              fontSize: dimensions.icon,
              color: getIconColor(),
            }}
          >
            {favorite ? '❤️' : '🤍'}
          </Animated.Text>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

export default FavoriteButton;

