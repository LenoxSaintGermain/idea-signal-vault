
import { useState, useEffect, useRef } from 'react';
import { checkFirebaseConnection, getFirebaseConnectionState } from '@/lib/firebase';

export type ConnectionStatus = 'online' | 'offline' | 'connecting' | 'error';

export const useConnectionStatus = () => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [lastError, setLastError] = useState<string | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastStatusChangeRef = useRef<number>(0);

  // Debounce status changes to prevent rapid state changes
  const debouncedSetStatus = (status: ConnectionStatus, error?: string | null) => {
    const now = Date.now();
    if (now - lastStatusChangeRef.current < 1000) return; // Debounce 1 second
    
    lastStatusChangeRef.current = now;
    setConnectionStatus(status);
    if (error !== undefined) setLastError(error);
  };

  useEffect(() => {
    let mounted = true;

    const handleOnline = async () => {
      if (!mounted) return;
      console.log('🌐 Network back online');
      debouncedSetStatus('connecting');
      
      try {
        const isConnected = await checkFirebaseConnection();
        if (!mounted) return;
        
        if (isConnected) {
          debouncedSetStatus('online', null);
        } else {
          debouncedSetStatus('error', 'Firebase connection failed');
        }
      } catch (error) {
        if (!mounted) return;
        debouncedSetStatus('error', 'Connection test failed');
      }
    };
    
    const handleOffline = () => {
      if (!mounted) return;
      console.log('🌐 Network went offline');
      debouncedSetStatus('offline', 'No internet connection');
    };

    // Set up event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial connection check
    if (!navigator.onLine) {
      debouncedSetStatus('offline', 'No internet connection');
    } else {
      handleOnline();
    }

    return () => {
      mounted = false;
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  const retryConnection = async () => {
    console.log('🔄 Manual connection retry triggered');
    
    // Clear any existing retry timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
    
    debouncedSetStatus('connecting', null);
    
    if (!navigator.onLine) {
      debouncedSetStatus('offline', 'No internet connection');
      return;
    }
    
    try {
      const isConnected = await checkFirebaseConnection();
      if (isConnected) {
        debouncedSetStatus('online', null);
      } else {
        debouncedSetStatus('error', 'Connection retry failed - Firebase services unavailable');
      }
    } catch (error) {
      debouncedSetStatus('error', 'Connection retry failed');
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
    setConnectionStatus: debouncedSetStatus,
    setLastError
  };
};
