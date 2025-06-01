
import { useState, useEffect } from 'react';
import { checkFirebaseConnection, getFirebaseConnectionState } from '@/lib/firebase';

export type ConnectionStatus = 'online' | 'offline' | 'connecting' | 'error';

export const useConnectionStatus = () => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [lastError, setLastError] = useState<string | null>(null);

  // Enhanced network connectivity detection with Firebase state monitoring
  useEffect(() => {
    const handleOnline = async () => {
      console.log('🌐 Network back online');
      setConnectionStatus('connecting');
      
      // Test Firebase connection with retry
      let attempts = 0;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts) {
        const isConnected = await checkFirebaseConnection();
        if (isConnected) {
          setConnectionStatus('online');
          setLastError(null);
          return;
        }
        
        attempts++;
        if (attempts < maxAttempts) {
          console.log(`🔄 Firebase connection attempt ${attempts}/${maxAttempts} failed, retrying...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
        }
      }
      
      setConnectionStatus('error');
      setLastError('Unable to connect to Firebase services after multiple attempts');
    };
    
    const handleOffline = () => {
      console.log('🌐 Network went offline');
      setConnectionStatus('offline');
      setLastError('No internet connection');
    };

    // Firebase state monitoring
    const monitorFirebaseState = () => {
      const firebaseState = getFirebaseConnectionState();
      console.log('🔥 Firebase state:', firebaseState);
      
      if (!firebaseState.browserOnline) {
        setConnectionStatus('offline');
        setLastError('No internet connection');
      } else if (!firebaseState.isOnline) {
        setConnectionStatus('error');
        setLastError('Firebase connection lost');
      }
    };

    // Set up event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Monitor Firebase state periodically
    const firebaseMonitor = setInterval(monitorFirebaseState, 5000);

    // Initial connection check
    if (!navigator.onLine) {
      setConnectionStatus('offline');
      setLastError('No internet connection');
    } else {
      handleOnline();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(firebaseMonitor);
    };
  }, []);

  const retryConnection = async () => {
    console.log('🔄 Manual connection retry triggered');
    setConnectionStatus('connecting');
    setLastError(null);
    
    const firebaseState = getFirebaseConnectionState();
    console.log('🔥 Firebase state before retry:', firebaseState);
    
    if (!navigator.onLine) {
      setConnectionStatus('offline');
      setLastError('No internet connection');
      return;
    }
    
    const isConnected = await checkFirebaseConnection();
    if (isConnected) {
      setConnectionStatus('online');
      setLastError(null);
    } else {
      setConnectionStatus('error');
      setLastError('Connection retry failed - Firebase services unavailable');
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
