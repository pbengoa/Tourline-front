import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import NetInfo, { NetInfoState, NetInfoSubscription } from '@react-native-community/netinfo';
import { AppState, AppStateStatus } from 'react-native';

interface NetworkContextData {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  connectionType: string | null;
  isOffline: boolean;
  
  // Actions
  checkConnection: () => Promise<boolean>;
  
  // Retry queue
  retryPendingRequests: () => void;
  addToRetryQueue: (request: () => Promise<any>) => void;
}

const NetworkContext = createContext<NetworkContextData>({} as NetworkContextData);

interface NetworkProviderProps {
  children: React.ReactNode;
}

export const NetworkProvider: React.FC<NetworkProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(true);
  const [isInternetReachable, setIsInternetReachable] = useState<boolean | null>(true);
  const [connectionType, setConnectionType] = useState<string | null>(null);
  
  const retryQueue = useRef<Array<() => Promise<any>>>([]);
  const unsubscribeNetInfo = useRef<NetInfoSubscription | null>(null);

  const isOffline = !isConnected || isInternetReachable === false;

  // Check connection manually
  const checkConnection = useCallback(async (): Promise<boolean> => {
    try {
      const state = await NetInfo.fetch();
      const connected = state.isConnected ?? false;
      setIsConnected(connected);
      setIsInternetReachable(state.isInternetReachable);
      setConnectionType(state.type);
      return connected && state.isInternetReachable !== false;
    } catch (error) {
      console.error('Error checking network connection:', error);
      return false;
    }
  }, []);

  // Handle connection state changes
  const handleNetworkChange = useCallback((state: NetInfoState) => {
    console.log('🌐 Network state changed:', {
      isConnected: state.isConnected,
      isInternetReachable: state.isInternetReachable,
      type: state.type,
    });

    const wasOffline = !isConnected || isInternetReachable === false;
    
    setIsConnected(state.isConnected ?? false);
    setIsInternetReachable(state.isInternetReachable);
    setConnectionType(state.type);

    // If we just came back online, retry pending requests
    const nowOnline = state.isConnected && state.isInternetReachable !== false;
    if (wasOffline && nowOnline) {
      console.log('📶 Back online! Retrying pending requests...');
      retryPendingRequests();
    }
  }, [isConnected, isInternetReachable]);

  // Add request to retry queue
  const addToRetryQueue = useCallback((request: () => Promise<any>) => {
    console.log('📥 Adding request to retry queue');
    retryQueue.current.push(request);
  }, []);

  // Retry all pending requests
  const retryPendingRequests = useCallback(async () => {
    if (retryQueue.current.length === 0) return;

    console.log(`🔄 Retrying ${retryQueue.current.length} pending requests...`);
    
    const requests = [...retryQueue.current];
    retryQueue.current = [];

    for (const request of requests) {
      try {
        await request();
        console.log('✅ Retry successful');
      } catch (error) {
        console.error('❌ Retry failed:', error);
        // Don't re-add to queue to avoid infinite loops
      }
    }
  }, []);

  // Handle app state changes (coming from background)
  const handleAppStateChange = useCallback((nextAppState: AppStateStatus) => {
    if (nextAppState === 'active') {
      console.log('📱 App became active, checking connection...');
      checkConnection();
    }
  }, [checkConnection]);

  useEffect(() => {
    // Initial check
    checkConnection();

    // Subscribe to network changes
    unsubscribeNetInfo.current = NetInfo.addEventListener(handleNetworkChange);

    // Subscribe to app state changes
    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      if (unsubscribeNetInfo.current) {
        unsubscribeNetInfo.current();
      }
      appStateSubscription?.remove();
    };
  }, [checkConnection, handleNetworkChange, handleAppStateChange]);

  return (
    <NetworkContext.Provider
      value={{
        isConnected,
        isInternetReachable,
        connectionType,
        isOffline,
        checkConnection,
        retryPendingRequests,
        addToRetryQueue,
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = (): NetworkContextData => {
  const context = useContext(NetworkContext);

  if (!context) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }

  return context;
};
