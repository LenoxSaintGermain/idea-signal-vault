
import { useState, useEffect } from 'react';
import { checkFirebaseConnection } from '@/lib/firebase';

export type ConnectionStatus = 'online' | 'offline' | 'connecting' | 'error';

export const useConnectionStatus = () => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [lastError, setLastError] = useState<string | null>(null);

  // Network connectivity detection with enhanced error handling
  useEffect(() => {
    const handleOnline = async () => {
      console.log('🌐 Network back online');
      setConnectionStatus('connecting');
      
      // Test Firebase connection
      const isConnected = await checkFirebaseConnection();
      if (isConnected) {
        setConnectionStatus('online');
        setLastError(null);
      } else {
        setConnectionStatus('error');
        setLastError('Unable to connect to Firebase services');
      }
    };
    
    const handleOffline = () => {
      console.log('🌐 Network went offline');
      setConnectionStatus('offline');
      setLastError('No internet connection');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial network check
    if (!navigator.onLine) {
      setConnectionStatus('offline');
      setLastError('No internet connection');
    } else {
      handleOnline();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const retryConnection = async () => {
    console.log('🔄 Manual connection retry triggered');
    setConnectionStatus('connecting');
    setLastError(null);
    
    const isConnected = await checkFirebaseConnection();
    if (isConnected) {
      setConnectionStatus('online');
    } else {
      setConnectionStatus('error');
      setLastError('Connection retry failed');
    }
  };

  const clearError = () => {
    setLastError(null);
  };

  return {
    connectionStatus,
    lastError,
    retryConnection,
    clearError,
    setConnectionStatus,
    setLastError
  };
};
