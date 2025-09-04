'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

const channels = new Map<string, BroadcastChannel>();

function getChannel(name: string): BroadcastChannel {
  if (!channels.has(name)) {
    channels.set(name, new BroadcastChannel(name));
  }
  return channels.get(name)!;
}

export function useSyncedState<T>(key: string, initialState: T) {
  const channel = typeof window !== 'undefined' ? getChannel(key) : null;
  
  const [state, setState] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialState;
    }
    try {
      const item = window.localStorage.getItem(key);
      const parsed = item ? JSON.parse(item) : initialState;
      return parsed;
    } catch (error) {
      console.error(`Error reading from localStorage key “${key}”:`, error);
      return initialState;
    }
  });

  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent<T>) => {
      // Use ref to get the latest state to prevent stale closures
      if (JSON.stringify(event.data) !== JSON.stringify(stateRef.current)) {
        setState(event.data);
      }
    };
    channel?.addEventListener('message', handleMessage);
    return () => {
      channel?.removeEventListener('message', handleMessage);
    };
  }, [key, channel]);

  const setSyncedState = useCallback((value: T | ((val: T) => T)) => {
    // Use ref to get the latest state for the updater function
    const newValue = value instanceof Function ? value(stateRef.current) : value;
    stateRef.current = newValue; // Update ref immediately
    setState(newValue);
    try {
      window.localStorage.setItem(key, JSON.stringify(newValue));
    } catch (error) {
       console.error(`Error writing to localStorage key “${key}”:`, error);
    }
    channel?.postMessage(newValue);
  }, [key, channel]);

  return [state, setSyncedState] as const;
}
