import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, Typography } from '../theme';

const { width } = Dimensions.get('window');

export type ErrorType = 'network' | 'server' | 'notFound' | 'unauthorized' | 'generic';

interface ErrorScreenProps {
  type?: ErrorType;
  title?: string;
  message?: string;
  onRetry?: () => void;
  showGoBack?: boolean;
  showGoHome?: boolean;
}

const ERROR_CONFIG: Record<ErrorType, { emoji: string; title: string; message: string }> = {
  network: {
    emoji: '📡',
    title: 'Sin conexión',
    message: 'No pudimos conectar con el servidor. Verifica tu conexión a internet e intenta de nuevo.',
  },
  server: {
    emoji: '🔧',
    title: 'Error del servidor',
    message: 'Estamos teniendo problemas técnicos. Por favor, intenta de nuevo en unos minutos.',
  },
  notFound: {
    emoji: '🔍',
    title: 'No encontrado',
    message: 'El contenido que buscas no existe o fue eliminado.',
  },
  unauthorized: {
    emoji: '🔐',
    title: 'Sesión expirada',
    message: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
  },
  generic: {
    emoji: '😵',
    title: 'Algo salió mal',
    message: 'Ocurrió un error inesperado. Por favor, intenta de nuevo.',
  },
};

export const ErrorScreen: React.FC<ErrorScreenProps> = ({
  type = 'generic',
  title,
  message,
  onRetry,
  showGoBack = true,
  showGoHome = true,
}) => {
  const navigation = useNavigation();
  const config = ERROR_CONFIG[type];

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const handleGoHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main' as never }],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>{config.emoji}</Text>
        <Text style={styles.title}>{title || config.title}</Text>
        <Text style={styles.message}>{message || config.message}</Text>

        <View style={styles.buttonContainer}>
          {onRetry && (
            <TouchableOpacity style={styles.primaryButton} onPress={onRetry}>
              <Text style={styles.primaryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          )}

          {showGoBack && navigation.canGoBack() && (
            <TouchableOpacity style={styles.secondaryButton} onPress={handleGoBack}>
              <Text style={styles.secondaryButtonText}>Volver</Text>
            </TouchableOpacity>
          )}

          {showGoHome && (
            <TouchableOpacity style={styles.tertiaryButton} onPress={handleGoHome}>
              <Text style={styles.tertiaryButtonText}>Ir al inicio</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

// Inline error component for use within screens
interface InlineErrorProps {
  message?: string;
  onRetry?: () => void;
}

export const InlineError: React.FC<InlineErrorProps> = ({ 
  message = 'Error al cargar los datos',
  onRetry 
}) => {
  return (
    <View style={styles.inlineContainer}>
      <Text style={styles.inlineEmoji}>⚠️</Text>
      <Text style={styles.inlineMessage}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.inlineButton} onPress={onRetry}>
          <Text style={styles.inlineButtonText}>Reintentar</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// Empty state component
interface EmptyStateProps {
  emoji?: string;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  emoji = '📭',
  title,
  message,
  actionLabel,
  onAction,
}) => {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>{emoji}</Text>
      <Text style={styles.emptyTitle}>{title}</Text>
      {message && <Text style={styles.emptyMessage}>{message}</Text>}
      {actionLabel && onAction && (
        <TouchableOpacity style={styles.emptyButton} onPress={onAction}>
          <Text style={styles.emptyButtonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emoji: {
    fontSize: 80,
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.h2,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  message: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 24,
    maxWidth: width * 0.8,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 280,
    gap: Spacing.sm,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    ...Typography.labelLarge,
    color: Colors.textInverse,
  },
  secondaryButton: {
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  secondaryButtonText: {
    ...Typography.labelLarge,
    color: Colors.text,
  },
  tertiaryButton: {
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  tertiaryButtonText: {
    ...Typography.label,
    color: Colors.textSecondary,
  },
  // Inline error styles
  inlineContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  inlineEmoji: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  inlineMessage: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  inlineButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
  },
  inlineButtonText: {
    ...Typography.label,
    color: Colors.textInverse,
  },
  // Empty state styles
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    ...Typography.h4,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  emptyMessage: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  emptyButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
  },
  emptyButtonText: {
    ...Typography.label,
    color: Colors.textInverse,
  },
});
