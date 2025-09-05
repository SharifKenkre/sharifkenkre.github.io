
'use client';

import { useState, useEffect, useRef } from 'react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function useFirestoreSyncedState<T extends { id: string }>(
  docId: string | null
) {
  const [state, setState] = useState<T | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const unsubscribeRef = useRef<() => void | undefined>();

  useEffect(() => {
    // Clean up previous listener if docId changes
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = undefined;
    }

    if (docId) {
      setIsLoaded(false);
      const docRef = doc(db, 'quizzes', docId);

      // Set up the real-time listener
      unsubscribeRef.current = onSnapshot(
        docRef,
        (docSnap) => {
          if (docSnap.exists()) {
            setState(docSnap.data() as T);
          } else {
            console.log(`Document ${docId} does not exist.`);
            setState(null);
          }
          setIsLoaded(true);
        },
        (error) => {
          console.error('Firestore snapshot error:', error);
          setIsLoaded(true);
        }
      );
    } else {
      setState(null);
      setIsLoaded(true);
    }

    // Cleanup listener on component unmount
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [docId]);

  // This function is now responsible for writing the state to Firestore
  const setFirestoreState = (value: T | null | ((prevState: T | null) => T | null)) => {
    const newState = value instanceof Function ? value(state) : value;
    setState(newState);

    if (newState && newState.id) {
      const docRef = doc(db, 'quizzes', newState.id);
      // We use setDoc with merge:true to avoid overwriting fields if the local state is partial
      setDoc(docRef, newState, { merge: true }).catch((error) => {
        console.error('Error writing to Firestore:', error);
      });
    }
  };

  return { state, setState: setFirestoreState, isLoaded };
}
