import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '../theme';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    console.error('🚨 ErrorBoundary caught an error:', error);
    console.error('Error Info:', errorInfo);
    
    this.setState({ errorInfo });
    
    // TODO: Send to error reporting service (Sentry, Bugsnag, etc.)
    // errorReportingService.captureException(error, { extra: errorInfo });
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.emoji}>😵</Text>
            <Text style={styles.title}>¡Ups! Algo salió mal</Text>
            <Text style={styles.message}>
              La aplicación encontró un error inesperado. Por favor, intenta de nuevo.
            </Text>
            
            {__DEV__ && this.state.error && (
              <View style={styles.errorDetails}>
                <Text style={styles.errorTitle}>Error (solo en desarrollo):</Text>
                <Text style={styles.errorText}>
                  {this.state.error.toString()}
                </Text>
              </View>
            )}

            <TouchableOpacity style={styles.retryButton} onPress={this.handleRetry}>
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.secondaryButton} 
              onPress={() => {
                // Force reload the app
                if (typeof window !== 'undefined' && window.location) {
                  window.location.reload();
                }
              }}
            >
              <Text style={styles.secondaryButtonText}>Recargar aplicación</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

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
  },
  errorDetails: {
    backgroundColor: Colors.errorLight,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
    width: '100%',
  },
  errorTitle: {
    ...Typography.labelSmall,
    color: Colors.error,
    marginBottom: Spacing.xs,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.error,
    fontFamily: 'monospace',
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.md,
    minWidth: 200,
    alignItems: 'center',
  },
  retryButtonText: {
    ...Typography.labelLarge,
    color: Colors.textInverse,
  },
  secondaryButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  secondaryButtonText: {
    ...Typography.label,
    color: Colors.textSecondary,
  },
});
