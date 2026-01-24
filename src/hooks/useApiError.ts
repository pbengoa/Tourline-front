import { useState, useCallback } from 'react';
import { getErrorMessage, getErrorType, isNetworkError, ApiErrorType } from '../services/api';
import { useNetwork } from '../context';

interface UseApiErrorReturn {
  error: string | null;
  errorType: ApiErrorType | null;
  isError: boolean;
  isNetworkError: boolean;
  
  // Actions
  setError: (error: unknown) => void;
  clearError: () => void;
  handleError: (error: unknown) => void;
}

/**
 * Hook for handling API errors in components
 * Provides error state, type detection, and integration with network context
 */
export function useApiError(): UseApiErrorReturn {
  const [error, setErrorState] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<ApiErrorType | null>(null);
  const { isOffline, addToRetryQueue } = useNetwork();

  const setError = useCallback((err: unknown) => {
    const message = getErrorMessage(err);
    const type = getErrorType(err);
    
    setErrorState(message);
    setErrorType(type);
    
    console.log(`🚨 Error captured: ${type} - ${message}`);
  }, []);

  const clearError = useCallback(() => {
    setErrorState(null);
    setErrorType(null);
  }, []);

  const handleError = useCallback((err: unknown) => {
    setError(err);
    
    // If it's a network error and we're offline, we might want to queue a retry
    if (isNetworkError(err) && isOffline) {
      console.log('📡 Network error while offline - request may be queued for retry');
    }
  }, [setError, isOffline]);

  return {
    error,
    errorType,
    isError: error !== null,
    isNetworkError: errorType === 'network',
    setError,
    clearError,
    handleError,
  };
}

/**
 * Hook for async operations with automatic error handling
 */
interface UseAsyncOperationOptions {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
  retryOnNetworkRestore?: boolean;
}

interface UseAsyncOperationReturn<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  errorType: ApiErrorType | null;
  
  execute: (operation: () => Promise<T>) => Promise<T | null>;
  retry: () => Promise<T | null>;
  reset: () => void;
}

export function useAsyncOperation<T>(
  options: UseAsyncOperationOptions = {}
): UseAsyncOperationReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<ApiErrorType | null>(null);
  const [lastOperation, setLastOperation] = useState<(() => Promise<T>) | null>(null);
  
  const { addToRetryQueue } = useNetwork();
  const { onSuccess, onError, retryOnNetworkRestore } = options;

  const execute = useCallback(async (operation: () => Promise<T>): Promise<T | null> => {
    setIsLoading(true);
    setError(null);
    setErrorType(null);
    setLastOperation(() => operation);

    try {
      const result = await operation();
      setData(result);
      setIsLoading(false);
      onSuccess?.();
      return result;
    } catch (err) {
      const message = getErrorMessage(err);
      const type = getErrorType(err);
      
      setError(message);
      setErrorType(type);
      setIsLoading(false);
      
      onError?.(err);
      
      // Queue for retry if network error and option is enabled
      if (retryOnNetworkRestore && isNetworkError(err)) {
        addToRetryQueue(operation);
      }
      
      return null;
    }
  }, [onSuccess, onError, retryOnNetworkRestore, addToRetryQueue]);

  const retry = useCallback(async (): Promise<T | null> => {
    if (lastOperation) {
      return execute(lastOperation);
    }
    return null;
  }, [lastOperation, execute]);

  const reset = useCallback(() => {
    setData(null);
    setIsLoading(false);
    setError(null);
    setErrorType(null);
    setLastOperation(null);
  }, []);

  return {
    data,
    isLoading,
    error,
    errorType,
    execute,
    retry,
    reset,
  };
}
