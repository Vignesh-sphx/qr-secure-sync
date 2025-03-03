
/**
 * Network utilities for detecting online status and syncing
 */
import { NetworkState } from '../types';

// Get the current network state
export const getNetworkState = (): NetworkState => {
  const isOnline = navigator.onLine;
  
  // Get last sync time from localStorage
  const lastSyncedStr = localStorage.getItem('last_synced');
  const lastSynced = lastSyncedStr ? parseInt(lastSyncedStr, 10) : null;
  
  return {
    isOnline,
    lastSynced
  };
};

// Set the last synced timestamp
export const updateLastSynced = (): void => {
  const now = Date.now();
  localStorage.setItem('last_synced', now.toString());
};

// Register network status change listeners
export const registerNetworkListeners = (
  onOnline: () => void,
  onOffline: () => void
): () => void => {
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);
  
  // Return a cleanup function
  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
};
